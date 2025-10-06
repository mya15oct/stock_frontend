import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { StealthProvider } from '@/contexts/StealthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stock Portfolio App',
  description: 'Track your stock portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <StealthProvider>
          <Header />
          <main className="container mx-auto px-4 py-8 flex-1">
            {children}
          </main>
          <Footer />
        </StealthProvider>
      </body>
    </html>
  )
}
