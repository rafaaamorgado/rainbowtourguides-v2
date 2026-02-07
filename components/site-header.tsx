'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/images/rtg-logo.png"
            alt="Rainbow Tour Guides"
            width={160}
            height={40}
            className="h-8 w-auto sm:h-8"
            priority
          />
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
            href="/become-a-guide"
            className="text-sm font-medium transition-colors text-slate-700 hover:text-brand"
          >
            Become a Guide
          </Link>

          {/* Auth-aware navigation */}
          <UserMenu />
        </nav>

        {/* Mobile Toggle - TODO: Implement mobile menu */}
        <button className="md:hidden p-2 text-slate-700">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
