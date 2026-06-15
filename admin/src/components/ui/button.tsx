import {ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
  secondary: "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  ghost: "text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {variant?: Variant}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
