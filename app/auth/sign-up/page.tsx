import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { isValidRole } from "@/lib/auth-helpers";
import { getPostLoginRedirect } from "@/lib/auth/post-login-redirect";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ProfileRole } from "@/types/database";

type SignUpPageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { path } = await getPostLoginRedirect();
  if (path) redirect(path);

  const params = await searchParams;
  const roleParam = params.role;
  
  // Validate role from query param, default to 'traveler'
  // Don't allow admin sign-up via URL
  const initialRole: ProfileRole = isValidRole(roleParam) && roleParam !== "admin" 
    ? roleParam 
    : "traveler";
  
  const isGuideSignUp = initialRole === "guide";

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-surface-pride-amber/20 via-background to-surface-pride-lilac/20 px-4">
      <Card className="w-full max-w-md shadow-editorial rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">
            {isGuideSignUp ? "Become a Guide" : "Create an account"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isGuideSignUp ? "Share your city with LGBTQ+ travelers" : "Join the Rainbow Tour Guides community"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignUpForm initialRole={initialRole} />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/auth/sign-in">
              Sign in
            </Link>
            .
          </p>
          {!isGuideSignUp && (
            <p className="text-sm text-muted-foreground">
              Want to become a guide?{" "}
              <Link className="text-primary font-medium hover:underline" href="/auth/sign-up?role=guide">
                Sign up as a guide
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
