export function AperioMark({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
        <defs>
          <linearGradient id="apg" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="oklch(0.82 0.13 82)" />
            <stop offset="100%" stopColor="oklch(0.6 0.15 65)" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" stroke="url(#apg)" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="9" stroke="url(#apg)" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="4" fill="url(#apg)" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="url(#apg)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="26" x2="16" y2="30" stroke="url(#apg)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="16" x2="6" y2="16" stroke="url(#apg)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="16" x2="30" y2="16" stroke="url(#apg)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-xl font-semibold tracking-wide text-foreground">
        Aperio
      </span>
    </div>
  );
}