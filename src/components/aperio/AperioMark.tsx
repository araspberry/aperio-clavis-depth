import logo from "@/assets/aperio-logo.png";

export function AperioMark({ className = "", showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logo}
        alt="Aperio"
        className="h-9 w-9 rounded-[8px] shadow-[0_4px_12px_-2px_rgba(0,0,0,0.35)]"
      />
      {showWordmark && (
        <span className="font-serif text-xl font-semibold tracking-wide text-foreground">
          Aperio
        </span>
      )}
    </div>
  );
}