'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, User, Calendar, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfileResult {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface BookingResult {
  id: string;
  status: string;
  start_at: string | null;
  price_total: string | null;
  currency: string | null;
  traveler: { full_name: string } | null;
  guide: { profile: { full_name: string } | null } | null;
}

interface SearchResults {
  profiles: ProfileResult[];
  bookings: BookingResult[];
}

export function AdminSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/search?q=${encodeURIComponent(q)}`,
      );
      if (res.ok) {
        const data: SearchResults = await res.json();
        setResults(data);
        setIsOpen(
          data.profiles.length > 0 || data.bookings.length > 0,
        );
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'guide':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const hasResults =
    results &&
    (results.profiles.length > 0 || results.bookings.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setIsOpen(true)}
          placeholder="Search users, bookings..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
        {!isLoading && query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* Profiles */}
          {results.profiles.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Users
                </p>
              </div>
              {results.profiles.map((p) => (
                <Link
                  key={p.id}
                  href={
                    p.role === 'guide'
                      ? `/admin/guides/${p.id}`
                      : `/admin/users`
                  }
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pride-lilac to-pride-mint text-xs font-bold text-white">
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      (p.full_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {p.id.slice(0, 8)}...
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs capitalize', roleBadgeColor(p.role))}
                  >
                    {p.role}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Bookings */}
          {results.bookings.length > 0 && (
            <div>
              {results.profiles.length > 0 && (
                <div className="border-t border-slate-100" />
              )}
              <div className="px-3 pt-3 pb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bookings
                </p>
              </div>
              {results.bookings.map((b) => (
                <Link
                  key={b.id}
                  href="/admin/bookings"
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {b.traveler?.full_name || 'Unknown'} →{' '}
                      {b.guide?.profile?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-ink-soft font-mono">
                      {b.id.slice(0, 12)}...
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {b.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {!hasResults && query.length >= 2 && !isLoading && (
            <div className="px-3 py-6 text-center text-sm text-ink-soft">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
