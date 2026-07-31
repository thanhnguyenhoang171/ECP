import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: { className?: string; [key: string]: any }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
