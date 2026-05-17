import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ELO Operations Center',
  description: 'Live WhatsApp AI support dashboard for Export Leftovers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
