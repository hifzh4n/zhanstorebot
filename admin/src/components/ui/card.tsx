import {HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

export function Card({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm shadow-slate-200/40 dark:shadow-black/10",
        className,
      )}
      {...props}
    />
  );
}
