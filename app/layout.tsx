import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SupportChatbot from "@/components/SupportChatbot"

export const metadata = {
  title: "TasklyClean",
  description: "Freelancing marketplace platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
        <SupportChatbot />
      </body>
    </html>
  )
}
