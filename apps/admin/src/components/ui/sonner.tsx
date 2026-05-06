"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useBackground } from "@/components/providers/BackgroundProvider"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const { currentBackground } = useBackground()

  // Ép kiểu sang any để tránh lỗi Type mismatch giữa React 19 và Sonner khi build
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SonnerComponent = Sonner as any;

  return (
    <SonnerComponent
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: currentBackground 
            ? "group toast group-[.toaster]:bg-white/10 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:shadow-2xl"
            : "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: currentBackground ? "group-[.toast]:text-white/60" : "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
