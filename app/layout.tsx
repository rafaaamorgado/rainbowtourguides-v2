import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";
import { MapPin, Menu, X, LogOut } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rainbowtourguides.com"),
  title: {
    default: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
    template: "%s | Rainbow Tour Guides",
  },
  description:
    "Connect with verified local LGBTQ+ guides for authentic travel experiences. Discover safe spaces, insider tips, and personalized tours in cities around the world.",
  keywords: [
    "LGBTQ+ travel",
    "gay travel guides",
    "queer travel",
    "local tour guides",
    "LGBTQ+ friendly tours",
    "gay-friendly destinations",
    "pride travel",
    "LGBTQ+ tourism",
  ],
  authors: [{ name: "Rainbow Tour Guides" }],
  creator: "Rainbow Tour Guides",
  publisher: "Rainbow Tour Guides",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rainbowtourguides.com",
    title: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
    description:
      "Connect with verified local LGBTQ+ guides for authentic travel experiences worldwide.",
    siteName: "Rainbow Tour Guides",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rainbow Tour Guides - LGBTQ+ Travel Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
    description:
      "Connect with verified local LGBTQ+ guides for authentic travel experiences worldwide.",
    images: ["/og-image.png"],
    creator: "@rainbowtourguides",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-brand p-1.5 rounded-full text-white group-hover:scale-110 transition-transform">
            <MapPin size={20} fill="currentColor" strokeWidth={0} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight uppercase leading-none text-slate-900">
              Rainbow
            </span>
            <span className="text-[10px] tracking-widest font-semibold uppercase leading-none text-slate-500">
              Tour Guides
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            Home
          </Link>
          <Link
            href="/guides"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            Guides
          </Link>
          <Link
            href="/cities"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            Cities
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            How It Works
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            FAQ
          </Link>
          <Link
            href="/auth/sign-up?role=guide"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            Become a Guide
          </Link>

          {/* Auth Links - TODO: Make dynamic based on auth state */}
          <Link
            href="/auth/sign-in"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up?role=traveler"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full bg-brand hover:bg-brand-dark text-white shadow-lg active:scale-95"
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile Toggle - TODO: Implement mobile menu */}
        <button className="md:hidden p-2 text-slate-700">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-panel-dark text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-brand p-1.5 rounded-full text-white">
              <MapPin size={16} fill="currentColor" strokeWidth={0} />
            </div>
            <span className="font-bold text-white uppercase tracking-tight">
              Rainbow Tour Guides
            </span>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Expert guides. Authentic experiences.
            <br />
            Book verified LGBTQ+ guides around the world.
          </p>
          <div className="flex gap-4">
            {/* Social placeholders */}
            <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand transition-colors cursor-pointer"></div>
          </div>
        </div>

        {/* Discover Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Discover</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/cities" className="hover:text-white transition-colors">
                Cities
              </Link>
            </li>
            <li>
              <Link href="/guides" className="hover:text-white transition-colors">
                Guides
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-white transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/legal/safety" className="hover:text-white transition-colors">
                Safety
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
          <p className="text-sm mb-4">
            Join our newsletter for travel tips and new city launches.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:border-brand w-full text-sm"
            />
            <button className="bg-brand text-white px-4 py-2 rounded-r-lg font-medium hover:bg-brand-dark transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-900 text-center text-xs">
        © {new Date().getFullYear()} Rainbow Tour Guides. All rights reserved.
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} bg-background text-foreground`}
      >
        {/* Noise Overlay */}
        <div className="noise-overlay" />

        {/* Shared shell */}
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 pt-20">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
