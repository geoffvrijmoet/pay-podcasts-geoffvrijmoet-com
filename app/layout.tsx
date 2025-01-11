import { ClerkProvider } from '@clerk/nextjs'
import { Quicksand } from 'next/font/google'
import { UserButton } from "@clerk/nextjs";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import './globals.css'

const quicksand = Quicksand({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={quicksand.variable}>
        <body className={`${quicksand.className} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100`}>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
              <div className="container flex h-14 items-center">
                <MainNav />
                <MobileNav className="md:hidden" />
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </header>
            <main className="flex-1 container py-6">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
