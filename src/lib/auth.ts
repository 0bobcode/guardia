import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface User {
    role: "DISTRICT_ADMIN" | "PARENT";
    districtId: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "DISTRICT_ADMIN" | "PARENT";
      districtId: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "DISTRICT_ADMIN" | "PARENT";
    districtId: string | null;
  }
}

// Finds the district-admin account tied to this Microsoft identity, or
// provisions a new one — mirrors the existing self-service email/password
// signup flow, since Guardia has no invitation gate either way. Linking is
// by verified email: for an organizational account, Entra ID's `email`
// claim is sourced directly from the tenant's own directory, not
// user-supplied, so it's trustworthy without extra checks. The one case
// Microsoft flags explicitly — `xms_edov: false` — means the domain owner
// verification failed; when that optional claim is present and false, we
// refuse to link/auto-provision rather than trust the email.
async function findOrCreateFromEntraProfile(profile: {
  oid: string;
  email: string;
  name: string;
  emailDomainVerified?: boolean;
}) {
  if (profile.emailDomainVerified === false) {
    throw new Error("Microsoft account email domain could not be verified");
  }

  const email = profile.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.authProvider !== "microsoft-entra-id" || existing.externalId !== profile.oid) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { authProvider: "microsoft-entra-id", externalId: profile.oid },
      });
    }
    return existing;
  }

  const district = await prisma.district.findFirst();
  if (!district) throw new Error("No district configured");

  return prisma.user.create({
    data: {
      email,
      name: profile.name,
      role: "DISTRICT_ADMIN",
      districtId: district.id,
      authProvider: "microsoft-entra-id",
      externalId: profile.oid,
      passwordHash: null,
    },
  });
}

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !user.passwordHash) return null; // SSO-only accounts have no password to check

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        districtId: user.districtId ?? null,
      };
    },
  }),
];

// Only registered when configured — a district that hasn't set up Entra ID
// still gets a working credentials-only login, same as before this feature.
export const microsoftEntraEnabled = Boolean(
  process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
);

if (microsoftEntraEnabled) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      profile: async (profile) => {
        const user = await findOrCreateFromEntraProfile({
          oid: profile.oid,
          email: profile.email,
          name: profile.name,
          emailDomainVerified: profile.xms_edov,
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          districtId: user.districtId ?? null,
        };
      },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.districtId = user.districtId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.districtId = token.districtId;
      return session;
    },
  },
});
