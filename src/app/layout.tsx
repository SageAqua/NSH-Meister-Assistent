import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/service-worker-register"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "NSH Meister-Assistent",
  description: "Digitale Assistenz für Naim Shala Renovierung — Baustellen, Aufträge, Kunden, Preise",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NSH Meister",
  },
  formatDetection: { telephone: true },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2d5fbf",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${jakarta.variable} antialiased`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
