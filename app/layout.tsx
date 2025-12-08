import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rainbow Tour Guides",
  description: "Premium LGBTQ+ travel marketplace connecting travelers and local guides.",
};

const navLinks = [
  { href: "/cities", label: "Cities" },
];

function SiteHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Rainbow Tour Guides
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/guide/onboarding" className="text-sm font-medium text-primary">
          Become a guide
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Rainbow Tour Guides</p>
        <div className="flex gap-4">
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/legal/safety" className="hover:text-foreground">
            Safety
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground`}>
        {/* Shared shell keeps consistent navigation + footer across the app */}
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="container flex-1 py-12">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
