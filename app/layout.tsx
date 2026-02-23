import Script from "next/script"
import { Bai_Jamjuree } from "next/font/google"
import { AuthProvider } from "@/features/auth/auth-context"
import "./globals.css"

const baiJamjuree = Bai_Jamjuree ({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
     <html lang="th" className={baiJamjuree.variable}>
      <body className="antialiased font-sans">
        <AuthProvider>
            {children}
        </AuthProvider>
        {/* ✅ Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}