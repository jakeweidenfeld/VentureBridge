import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-vb-blue text-white hover:bg-vb-blue-bright",
  secondary: "bg-vb-panel text-vb-text border border-vb-border hover:border-vb-blue",
  ghost: "bg-transparent text-vb-muted border border-transparent hover:text-vb-text hover:border-vb-border",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`px-6 py-2.5 rounded font-body font-semibold text-sm cursor-pointer border-none transition-all duration-150 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
