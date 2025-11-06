import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from './contexts/UserContext'

export const metadata: Metadata = {
  title: 'Kiongozi LMS - Green & Digital Skills',
  description: 'Learn green economy and digital skills with Kiongozi Learning Management System',
  icons: {
    icon: '/favicon.svg',
    apple: '/Kiongozi.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
