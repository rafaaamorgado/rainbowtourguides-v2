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
        data: { display_name: name, role: initialRole },
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
      display_name: name,
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

    // Redirect based on role
    const redirectPath = initialRole === "guide" 
      ? "/guide/onboarding" 
      : "/traveler/bookings";
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
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : initialRole === "guide" ? "Sign up as Guide" : "Create account"}
      </Button>
    </form>
  );
}
