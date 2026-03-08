import { type ReactNode } from "react";

type BadgeVariant = "blue" | "green" | "amber" | "red" | "purple" | "gray";

const variantClasses: Record<BadgeVariant, string> = {
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-emerald-500/15 text-emerald-400",
  amber: "bg-amber-500/15 text-amber-400",
  red: "bg-red-500/15 text-red-400",
  purple: "bg-violet-500/15 text-violet-400",
  gray: "bg-slate-500/15 text-slate-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "gray", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-medium tracking-[0.5px] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
