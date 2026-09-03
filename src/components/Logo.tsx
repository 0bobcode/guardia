export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="guardiaShield" x1="6" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0b1739" />
        </linearGradient>
      </defs>
      <path
        d="M24,4 C18,4 8,7.5 8,7.5 L8,22 C8,32.5 14.5,41.5 24,46 C33.5,41.5 40,32.5 40,22 L40,7.5 C40,7.5 30,4 24,4 Z"
        fill="url(#guardiaShield)"
      />
      <path d="M15,18 Q24,14.5 33,18" stroke="white" strokeWidth="2.1" strokeLinecap="round" fill="none" opacity="0.95" />
      <path d="M12.5,25.5 Q24,20 35.5,25.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" fill="none" />
      <path d="M16,32.5 Q24,29.5 32,32.5" stroke="white" strokeWidth="2.1" strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>
  );
}
