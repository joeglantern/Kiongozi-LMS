import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";

export const metadata: Metadata = {
  title: "Kiongozi Moderator Dashboard",
  description: "Content management and moderation dashboard for Kiongozi LMS",
  icons: {
    icon: '/favicon.svg',
    apple: '/Kiongozi.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
