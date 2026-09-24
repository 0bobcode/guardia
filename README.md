# Guardia

Guardia is an AI child-safety platform for K-12 schools and families, made of two products:

- **GuardRail** — a compliance API that scans every message between a student and an AI app in
  real time, scoring it against grade-band policies and blocking or flagging what shouldn't get
  through. District admins manage policies, review alerts, and run compliance reports here.
- **TrustEd** — the parent-facing dashboard. Parents see full session transcripts (not just a
  flagged line out of context), manage per-app time limits, approve/deny data-consent requests,
  and pair a companion app/browser extension to monitor real AI apps directly on a child's device.

## Tech stack / dependencies

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **PostgreSQL** via **Prisma ORM**
- **NextAuth v5** — email/password credentials, plus optional Microsoft Entra ID (Azure AD) SSO
- **Tailwind CSS 4**
- AI providers (optional, only needed for live model calls): **Anthropic**, **OpenAI**, **Google
  Gemini** SDKs
- **Python 3** (standard library only, no extra packages) — runs
  [`scripts/ask_brief_ai.py`](scripts/ask_brief_ai.py), a small local, rule-based text generator
  behind the "Ask Guardia" feature. No API key or network call; if `python3` isn't available at
  runtime, that feature falls back to a plain templated summary instead of failing.
- **Docker** + **Docker Compose** (optional, for local/self-hosted running — see below)

## Environment variables

Copy these into a `.env` file at the repo root (used by both `npm run dev` and Docker Compose).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes (local/npm only) | Postgres connection string. Docker Compose sets this itself to the local `db` container — don't set it for that path. |
| `AUTH_SECRET` | Yes | Session encryption key for NextAuth. Generate with `openssl rand -base64 32`. |
| `ANTHROPIC_API_KEY` | No | Enables live Claude replies for AI-tutor apps and phrased "Ask Guardia" summaries. |
| `OPENAI_API_KEY` | No | Enables live ChatGPT replies for AI-tutor apps. |
| `GOOGLE_API_KEY` | No | Enables live Gemini replies for AI-tutor apps. |
| `AZURE_AD_CLIENT_ID` / `AZURE_AD_CLIENT_SECRET` / `AZURE_AD_TENANT_ID` | No | Enables "Continue with Microsoft" SSO on the login page. Omit all three to disable it entirely. |

None of the AI provider keys are required to run the app — every AI-generated reply has a
clearly-labeled simulated fallback so the product works identically either way.

## Running locally with npm

Requires Node 20+ and a Postgres database.

```bash
npm install
npx prisma db push   # creates the schema in your database
npm run seed          # optional — seeds demo district/users/students
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo login: `admin@ccfschools.edu` /
`guardia-demo` (district admin) or `priya@guardia-demo.com` / `guardia-demo` (parent).

## Running locally with Docker Compose

This is the easiest way to run the whole system (app + Postgres) without installing Node or
Postgres yourself.

```bash
cp .env.example .env   # then fill in AUTH_SECRET at minimum
docker compose up --build
```

On first run, in a second terminal, create the schema and seed demo data:

```bash
docker compose exec web npx prisma db push
docker compose exec web npm run seed
```

Then open [http://localhost:3000](http://localhost:3000).

## Other scripts

```bash
npm run build   # production build
npm run start   # run a production build (after `npm run build`)
npm run lint    # ESLint
npx prisma studio   # browse the database in a GUI
```
