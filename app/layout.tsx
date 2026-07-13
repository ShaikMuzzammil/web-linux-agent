import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'WebLinuxOS — Cloud Desktop',
  description: 'A full-featured web-based Linux desktop environment with 54 apps, cloud sync, and multi-device support.',
  keywords: ['linux', 'desktop', 'web', 'cloud', 'os', 'apps'],
  openGraph: {
    title: 'WebLinuxOS',
    description: 'A full Linux desktop environment in your browser',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
