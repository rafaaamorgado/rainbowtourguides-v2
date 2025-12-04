'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSupabaseBrowserClient,
  isSupabaseConfiguredOnClient,
} from "@/lib/supabase-browser";
import type { ProfileRole } from "@/types/database";

function getRedirectPathForRole(role: ProfileRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "guide":
      return "/guide/dashboard";
    case "traveler":
    default:
      return "/traveler/bookings";
  }
}

export function SignInForm() {
  const router = useRouter();
  const isConfigured = isSupabaseConfiguredOnClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase client is not configured.");
      return;
    }
    
    setIsSubmitting(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsSubmitting(false);
      setError(signInError.message);
      return;
    }

    // Fetch user profile to determine redirect
    const userId = data.user?.id;
    if (!userId) {
      setIsSubmitting(false);
      setError("Sign in succeeded but no user returned.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setIsSubmitting(false);

    if (profileError || !profile) {
      // Profile doesn't exist - rare edge case, default to traveler
      console.error("[SignInForm] Profile not found, defaulting to traveler redirect");
      router.replace("/traveler/bookings");
      router.refresh();
      return;
    }

    const redirectPath = getRedirectPathForRole(profile.role as ProfileRole);
    router.replace(redirectPath);
    router.refresh();
  };

  if (!isConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        Supabase client is not configured. Check your NEXT_PUBLIC_SUPABASE_* env vars.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSignIn}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
