import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import GoogleTagManager from '@magicul/next-google-tag-manager';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'React GPT Designer',
  description: 'Easily design React components with OpenAI\'s Chat GPT',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManager />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
