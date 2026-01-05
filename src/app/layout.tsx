import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { OrganizationProvider } from '@/lib/db/OrganizationContext'
import { AffiliateProvider } from '@/lib/affiliate/AffiliateContext'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  title: 'DigitalMEng - Autonomous Organic Marketing Engine',
  description: 'Scale authority and traffic with AI-powered organic marketing automation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <OrganizationProvider>
            <AffiliateProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </AffiliateProvider>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
