'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSupabaseBrowserClient,
  isSupabaseConfiguredOnClient,
} from "@/lib/supabase-browser";

export function SignUpForm() {
  const router = useRouter();
  const isConfigured = isSupabaseConfiguredOnClient();
  const supabase = isConfigured ? createSupabaseBrowserClient() : null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Supabase client is not configured.");
      return;
    }
    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
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

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "traveler",
      display_name: name,
    });

    setIsSubmitting(false);

    if (profileError) {
      setError("Account created but profile setup failed. Please contact support.");
      return;
    }

    router.replace("/traveler/bookings");
    router.refresh();
  };

  if (!isConfigured || !supabase) {
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

