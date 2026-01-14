import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getPostLoginRedirect } from "@/lib/auth/post-login-redirect";
import { getRedirectPathForRole } from "@/lib/auth/redirect";
import type { ProfileRole } from "@/types/database";

/**
 * Server action: Fetches user profile server-side and redirects based on role.
 * Called after successful client-side sign-in.
 */
async function redirectUserByRole() {
  "use server";
  
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Profile doesn't exist - rare edge case, default to traveler
    console.error("[redirectUserByRole] Profile not found, defaulting to traveler redirect");
    redirect("/traveler/bookings");
  }

  // Type assertion needed because select("role") returns a narrowed type
  const role = (profile as { role: ProfileRole }).role;
  const redirectPath = getRedirectPathForRole(role);
  redirect(redirectPath);
}

export default async function SignInPage() {
  const { path } = await getPostLoginRedirect();
  if (path) redirect(path);

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignInForm redirectAction={redirectUserByRole} />
          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link className="text-primary underline" href="/auth/sign-up">
              Create one
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
