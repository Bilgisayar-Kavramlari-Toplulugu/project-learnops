interface ProgressRingProps {
  value: number;
}

export function ProgressRing({ value }: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const fillAngle = Math.round((clampedValue / 100) * 360);

  return (
    <div
      className="relative size-[68px] shrink-0 rounded-full"
      style={{
        background: `conic-gradient(var(--progress-ring-fill) ${fillAngle}deg, var(--progress-ring-track) ${fillAngle}deg)`,
      }}
    >
      <div
        className="absolute inset-[6px] flex items-center justify-center rounded-full text-base font-semibold"
        style={{
          backgroundColor: "var(--progress-ring-center)",
          color: "var(--progress-ring-text)",
        }}
      >
        {clampedValue}%
      </div>
    </div>
  );
}
