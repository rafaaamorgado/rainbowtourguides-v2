import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import {
  createSupabaseBrowserClient,
  isSupabaseConfiguredOnClient,
} from '@/lib/supabase-browser';
import { getAvatarUrl } from '@/lib/storage-helpers';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useUserMenu() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabaseConfigured = isSupabaseConfiguredOnClient();

  // Load session from localStorage
  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    const loadSessionFromStorage = () => {
      try {
        const allKeys = Object.keys(localStorage);
        const possibleKeys = [
          ...allKeys.filter((key) => key.includes('supabase')),
          ...allKeys.filter((key) => key.includes('auth')),
          ...allKeys.filter((key) => key.includes('sb-')),
        ];

        for (const key of possibleKeys) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed?.access_token && parsed?.user) {
                setSession(parsed as Session);
                setLoading(false);
                return;
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }

        setSession(null);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    loadSessionFromStorage();

    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_, newSession) => {
        setSession(newSession);
      });

      return () => subscription.unsubscribe();
    }
  }, [supabaseConfigured]);

  // Load profile from database
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        // Fallback to session metadata
        const metadata = session.user.user_metadata || {};
        setProfile({
          id: session.user.id,
          role: (metadata.role as Profile['role']) || 'traveler',
          full_name:
            (metadata.full_name as string) ||
            (metadata.name as string) ||
            session.user.email ||
            'User',
          avatar_url:
            (metadata.avatar_url as string) ||
            (metadata.picture as string) ||
            null,
        } as Profile);
      } else {
        setProfile(data);
      }
    };

    loadProfile();

    const handleFocus = () => loadProfile();
    const handleProfileUpdate = () => loadProfile();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [session]);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    router.push('/');
    router.refresh();
  };

  const resolvedRole = profile?.role || 'traveler';
  const isAdmin = resolvedRole === 'admin';
  const basePath = isAdmin
    ? '/admin'
    : resolvedRole === 'guide'
      ? '/guide'
      : '/traveler';

  const displayName =
    profile?.full_name ||
    (session?.user?.user_metadata?.full_name as string | undefined) ||
    session?.user?.email ||
    'User';

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    const letters = parts.map((part) => part.charAt(0)).join('');
    return letters.slice(0, 2).toUpperCase();
  }, [displayName]);

  const rawAvatar =
    profile?.avatar_url ||
    (session?.user?.user_metadata?.avatar_url as string | undefined) ||
    (session?.user?.user_metadata?.picture as string | undefined) ||
    null;

  const avatarUrl = getAvatarUrl(rawAvatar);

  return {
    session,
    profile,
    loading,
    supabaseConfigured,
    isAdmin,
    basePath,
    displayName,
    initials,
    avatarUrl,
    handleSignOut,
  };
}
