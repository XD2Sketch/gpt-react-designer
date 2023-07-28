import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import GoogleTagManager from '@magicul/next-google-tag-manager';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'React GPT Designer',
  description: 'Easily design React components with OpenAI\'s Chat GPT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <GoogleTagManager />
      <body className={inter.className}>{children}</body>
    </html>
  )
}
