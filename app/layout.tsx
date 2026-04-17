import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SupportChatbot from "@/components/SupportChatbot"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taskly-clean.vercel.app'

export const metadata = {
  title: { default: "Taskly", template: "%s — Taskly" },
  description: "The freelance marketplace built for quality and trust.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    siteName: "Taskly",
    type: "website" as const,
    title: "Taskly",
    description: "The freelance marketplace built for quality and trust.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Taskly",
    description: "The freelance marketplace built for quality and trust.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
        <SupportChatbot />
      </body>
    </html>
  )
}
