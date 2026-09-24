// Guardia version strings look like "22.0.0" (major.minor.patch).
// GuardRail (district admin) publishes which version is the latest
// approved release; TrustEd (parent) installs up to that ceiling — never
// past it, and a parent never types an arbitrary value themselves.

export const DEFAULT_VERSION = "22.0.0";

function parse(v: string): [number, number, number] | null {
  const m = v.trim().match(/^(\d{1,4})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function compareVersions(a: string, b: string): number {
  const pa = parse(a) ?? [0, 0, 0];
  const pb = parse(b) ?? [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

// A district admin "publishing a new release" — bumps the minor version
// and resets patch to 0. Bounded (not just Number(x)+1 on an unvalidated
// string) so a bad stored value can't spiral into something absurd the
// way an earlier version of this file did.
export function nextPublishedVersion(current: string): string {
  const p = parse(current);
  if (!p) return DEFAULT_VERSION;
  const [major, minor] = p;
  if (minor >= 999) return DEFAULT_VERSION;
  return `${major}.${minor + 1}.0`;
}
