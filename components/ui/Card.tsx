import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`bg-vb-panel border border-vb-border rounded-lg p-5 ${onClick ? "cursor-pointer transition-colors hover:border-vb-blue" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaType?: "up" | "down" | "neutral";
  onClick?: () => void;
}

export function StatCard({ label, value, delta, deltaType = "neutral", onClick }: StatCardProps) {
  const deltaColor =
    deltaType === "up"
      ? "text-vb-green"
      : deltaType === "down"
      ? "text-vb-red"
      : "text-vb-amber";

  return (
    <Card onClick={onClick}>
      <div className="font-mono text-[10px] tracking-[1.5px] text-vb-muted uppercase mb-2.5">
        {label}
      </div>
      <div className="font-display text-[38px] tracking-[1px] leading-none">{value}</div>
      {delta && (
        <div className={`text-[12px] mt-1.5 font-mono ${deltaColor}`}>{delta}</div>
      )}
    </Card>
  );
}
