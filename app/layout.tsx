import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { GameProvider } from "@/lib/game-context"
import { ProgressProvider } from "@/lib/progress-context"

export const metadata: Metadata = {
  title: "EduQuest - Learn Through Adventure",
  description: "Interactive educational game for Kenyan secondary school students",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <ProgressProvider>
            <GameProvider>
              <Suspense>
                {children}
                <Analytics />
              </Suspense>
            </GameProvider>
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
