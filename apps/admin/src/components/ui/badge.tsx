import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white font-bold shadow-2xs",
        secondary:
          "border-slate-300 bg-slate-100 text-slate-800 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
        destructive:
          "border-rose-300 bg-rose-100 text-rose-800 font-extrabold dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
        outline: "border-slate-300 text-slate-800 font-bold dark:border-slate-700 dark:text-slate-200",
        success:
          "border-emerald-300 bg-emerald-100 text-emerald-800 font-extrabold dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
        warning:
          "border-amber-300 bg-amber-100 text-amber-900 font-extrabold dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
        info:
          "border-blue-300 bg-blue-100 text-blue-800 font-extrabold dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
