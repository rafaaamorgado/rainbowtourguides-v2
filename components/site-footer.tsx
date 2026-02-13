import Link from "next/link";
import { MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-panel-dark text-slate-400">
      {/* Pride gradient accent strip */}
      <div className="h-1 w-full gradient-pride-warm" />
      <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 justify-between">
        {/* Brand Column */}
        <div className="flex-1 md:max-w-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-brand p-1.5 rounded-full text-white">
              <MapPin size={16} fill="currentColor" strokeWidth={0} />
            </div>
            <span className="font-display font-bold text-white uppercase tracking-tight">
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
        <div className="flex-1 md:max-w-[200px]">
          <h4 className="text-white font-display font-semibold mb-2">Discover</h4>
          <ul className="text-sm flex flex-col">
            <li>
              <Link href="/cities" className="block py-3 hover:text-white transition-colors">
                Cities
              </Link>
            </li>
            <li>
              <Link href="/guides" className="block py-3 hover:text-white transition-colors">
                Guides
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="block py-3 hover:text-white transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/blog" className="block py-3 hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/legal/safety" className="block py-3 hover:text-white transition-colors">
                Safety
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="flex-1 md:max-w-[200px]">
          <h4 className="text-white font-display font-semibold mb-2">Support</h4>
          <ul className="text-sm flex flex-col">
            <li>
              <Link href="/faq" className="block py-3 hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="block py-3 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="block py-3 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="flex-1 md:max-w-xs">
          <h4 className="text-white font-display font-semibold mb-4">Stay Connected</h4>
          <p className="text-sm mb-4">
            Join our newsletter for travel tips and new city launches.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Email address"
              className="bg-slate-800/50 border border-slate-700 text-white px-5 py-2.5 rounded-l-full focus:outline-none focus:border-brand w-full text-sm min-w-0"
            />
            <button className="bg-brand text-white px-5 py-2.5 rounded-r-full font-medium hover:bg-brand-dark transition-colors whitespace-nowrap">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 text-center text-xs">
        © {new Date().getFullYear()} <span className="font-display">Rainbow Tour Guides</span>. All rights reserved.
      </div>
      </div>
    </footer>
  );
}
