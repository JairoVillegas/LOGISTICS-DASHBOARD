import * as React from "react"
import { cn } from "./Card"

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "c1" | "c2" | "outline" | "success" | "warning" | "danger" }) {
  const variants = {
    default: "bg-[var(--accent)] text-white",
    c1: "bg-[var(--c1)]/20 text-[var(--c1)] border border-[var(--c1)]/30",
    c2: "bg-[var(--c2)]/20 text-[var(--c2)] border border-[var(--c2)]/30",
    outline: "text-[var(--text)] border border-[var(--border)]",
    success: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-500 border border-rose-500/30",
  }
  
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
