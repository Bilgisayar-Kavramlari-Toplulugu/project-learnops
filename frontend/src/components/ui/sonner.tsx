"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme()
  
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors        // ← bu şart! success=yeşil, error=kırmızı yapar
      position="top-right"   // ← nerede çıkacağını buradan ayarlarsın
      {...props}
    />
  )
}