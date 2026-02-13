'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Cities', href: '/cities' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Become a Guide', href: '/become-a-guide' },
];

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 bg-background/90 backdrop-blur-md border-b border-border flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
          <Image
            src="/images/rtg-logo.png"
            alt="Rainbow Tour Guides"
            width={192}
            height={48}
            className="h-8 w-auto md:h-10 object-contain transition-all"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide transition-colors text-ink-soft hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          
          {/* Auth-aware navigation */}
          <UserMenu />
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-ink hover:bg-muted rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-warm-lg md:hidden flex flex-col p-4 animate-in slide-in-from-top-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium text-ink-soft hover:text-ink py-4 px-4 rounded-xl hover:bg-muted transition-colors block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-border px-4">
                <div className="py-2">
                  <UserMenu />
                </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
