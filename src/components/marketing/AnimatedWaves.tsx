/** Wave lines + soft glow orbs behind the whole marketing page.
 *  Deliberately `absolute` (spanning the page's full scroll height) rather
 *  than `fixed` — a fixed layer under `backdrop-blur` content is prone to
 *  compositor repaint glitches on scroll in some browsers. Pure CSS/SVG
 *  animation, no JS loop. Respects prefers-reduced-motion via the
 *  .waves-anim classes in globals.css, which the media query disables. */
export function AnimatedWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-brand-navy" />
      <div
        className="orb-a absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(700px 600px at 15% 4%, rgba(45, 212, 191, 0.14), transparent), " +
            "radial-gradient(600px 500px at 30% 55%, rgba(45, 212, 191, 0.07), transparent)",
        }}
      />
      <div
        className="orb-b absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(640px 560px at 88% 10%, rgba(99, 102, 241, 0.12), transparent), " +
            "radial-gradient(600px 500px at 75% 85%, rgba(99, 102, 241, 0.07), transparent)",
        }}
      />
      <svg
        className="absolute left-0 right-0 top-[480px] w-full waves-anim"
        height="360"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
      >
        <path
          className="wave-path wave-path-1"
          d="M0,180 C240,120 480,240 720,180 C960,120 1200,240 1440,180"
          fill="none"
          stroke="rgba(45, 212, 191, 0.25)"
          strokeWidth="1.5"
        />
        <path
          className="wave-path wave-path-2"
          d="M0,220 C240,160 480,280 720,220 C960,160 1200,280 1440,220"
          fill="none"
          stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth="1.5"
        />
        <path
          className="wave-path wave-path-3"
          d="M0,260 C240,210 480,310 720,260 C960,210 1200,310 1440,260"
          fill="none"
          stroke="rgba(45, 212, 191, 0.12)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
    </div>
  );
}
