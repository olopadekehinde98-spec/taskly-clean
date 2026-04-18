import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SupportChatbot from "@/components/SupportChatbot"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taskly-clean.vercel.app'

export const metadata = {
  title: { default: "Taskly — Hire Freelancers Online", template: "%s — Taskly" },
  description: "Taskly is a trusted freelance marketplace where you can hire skilled freelancers for design, development, writing, video, and more. Quality work, fair prices.",
  keywords: [
    "freelance marketplace", "hire a freelancer", "freelancers for hire",
    "buy freelance services", "freelance services online", "fiverr alternative",
    "upwork alternative", "affordable freelance services", "trusted freelance platform",
    "find skilled freelancers online",
  ],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    siteName: "Taskly",
    type: "website" as const,
    title: "Taskly — Hire Freelancers Online",
    description: "Taskly is a trusted freelance marketplace where you can hire skilled freelancers for design, development, writing, video, and more.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Taskly — Hire Freelancers Online",
    description: "Taskly is a trusted freelance marketplace where you can hire skilled freelancers for design, development, writing, video, and more.",
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
