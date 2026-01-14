'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSupabaseBrowserClient,
  isSupabaseConfiguredOnClient,
} from "@/lib/supabase-browser";
import type { ProfileRole, Database } from "@/types/database";

type SignUpFormProps = {
  initialRole?: ProfileRole;
};

export function SignUpForm({ initialRole = "traveler" }: SignUpFormProps) {
  const router = useRouter();
  const isConfigured = isSupabaseConfiguredOnClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase client is not configured.");
      return;
    }
    
    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Note: display_name in auth metadata is just metadata, we use full_name in profiles table
        data: { full_name: name, role: initialRole },
      },
    });

    if (signUpError) {
      setIsSubmitting(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setIsSubmitting(false);
      setError("No user returned from Supabase. Please check your email for confirmation.");
      return;
    }

    // Insert profile with typed insert
    const profileInsert: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: userId,
      role: initialRole,
      full_name: name, // ⚠️ full_name, not display_name
    };

    // Type assertion needed for browser client - Supabase browser client typing can be strict
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any)
      .from("profiles")
      .insert(profileInsert);

    setIsSubmitting(false);

    if (profileError) {
      setError("Account created but profile setup failed. Please contact support.");
      return;
    }

    // Redirect based on role - new users go to onboarding
    const redirectPath = initialRole === "guide"
      ? "/guide/onboarding"
      : "/traveler/onboarding";
    router.replace(redirectPath);
    router.refresh();
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setIsOAuthLoading(true);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase client is not configured.");
      setIsOAuthLoading(false);
      return;
    }

    // Pass role in the callback URL so we can set it after OAuth completes
    const nextPath = initialRole === "guide" ? "/guide/onboarding" : "/traveler/onboarding";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}&role=${initialRole}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsOAuthLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        Supabase client is not configured. Check your NEXT_PUBLIC_SUPABASE_* env vars.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSignUp}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Name
        </label>
        <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
      </div>
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
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={isSubmitting || isOAuthLoading}>
        {isSubmitting ? "Creating account..." : initialRole === "guide" ? "Sign up as Guide" : "Create account"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignUp}
        disabled={isSubmitting || isOAuthLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isOAuthLoading ? "Redirecting..." : "Continue with Google"}
      </Button>
    </form>
  );
}
