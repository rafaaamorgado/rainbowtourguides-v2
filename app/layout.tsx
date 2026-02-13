import type { Metadata } from 'next';
import { Manrope, Fraunces } from 'next/font/google';

import { SiteHeader } from '@/components/site-header';
import { AnalyticsProvider } from '@/components/marketing/analytics-provider';
import { CookieBanner } from '@/components/marketing/cookie-banner';
import { Providers } from './providers';
import { ConditionalFooter } from '@/components/conditional-footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://rainbowtourguides.com'),
  title: {
    default: 'Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences',
    template: '%s | Rainbow Tour Guides',
  },
  description:
    'Connect with verified local LGBTQ+ guides for authentic travel experiences. Discover safe spaces, insider tips, and personalized tours in cities around the world.',
  keywords: [
    'LGBTQ+ travel',
    'gay travel guides',
    'queer travel',
    'local tour guides',
    'LGBTQ+ friendly tours',
    'gay-friendly destinations',
    'pride travel',
    'LGBTQ+ tourism',
  ],
  authors: [{ name: 'Rainbow Tour Guides' }],
  creator: 'Rainbow Tour Guides',
  publisher: 'Rainbow Tour Guides',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rainbowtourguides.com',
    title: 'Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences',
    description:
      'Connect with verified local LGBTQ+ guides for authentic travel experiences worldwide.',
    siteName: 'Rainbow Tour Guides',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rainbow Tour Guides - LGBTQ+ Travel Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences',
    description:
      'Connect with verified local LGBTQ+ guides for authentic travel experiences worldwide.',
    images: ['/og-image.png'],
    creator: '@rainbowtourguides',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} bg-background text-foreground overflow-x-hidden`}>
        <Providers>
          {/* Noise Overlay */}
          <div className="noise-overlay" />

          {/* Skip to content — accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
          >
            Skip to content
          </a>

          {/* Shared shell */}
          <div className="relative flex min-h-screen w-full flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1 pt-16 w-full">{children}</main>
            <ConditionalFooter />
          </div>
          <CookieBanner />
          <AnalyticsProvider />
        </Providers>
      </body>
    </html>
  );
}
