"use client"

import * as React from "react"
import dynamic from "next/dynamic"

type Attribute = 'class' | 'data-theme' | 'data-color-scheme'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: Attribute | Attribute[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

// Dynamically import NextThemesProvider to prevent SSR issues
const NextThemesProvider = dynamic(
  () => import("next-themes").then((mod) => mod.ThemeProvider),
  {
    ssr: false,
    loading: () => <div>{/* Loading fallback */}</div>
  }
)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider defaultTheme="system" {...props}>{children}</NextThemesProvider>
}
