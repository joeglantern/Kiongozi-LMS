import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from './contexts/UserContext'

export const metadata: Metadata = {
  title: 'Kiongozi LMS - Green & Digital Skills',
  description: 'Learn green economy and digital skills with Kiongozi Learning Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
