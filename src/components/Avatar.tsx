const GRADIENTS = [
  "from-teal-400 to-blue-600",
  "from-purple-400 to-pink-600",
  "from-amber-400 to-red-500",
  "from-emerald-400 to-cyan-600",
  "from-indigo-400 to-purple-600",
  "from-rose-400 to-orange-500",
  "from-yellow-300 to-gray-900",
  "from-lime-400 to-emerald-800",
  "from-sky-400 to-indigo-900",
  "from-fuchsia-400 to-purple-900",
  "from-orange-400 to-rose-900",
  "from-cyan-300 to-blue-900",
  "from-red-400 to-slate-900",
  "from-violet-400 to-fuchsia-900",
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic initials-on-gradient avatar — same name always gets the same look. */
export function Avatar({ name, size = 36, className = "" }: { name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const gradient = GRADIENTS[hashName(name) % GRADIENTS.length];

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-semibold text-white shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
