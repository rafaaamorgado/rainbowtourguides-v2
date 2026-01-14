import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getAuthenticatedUserRedirect, isValidRole } from "@/lib/auth-helpers";
import type { ProfileRole } from "@/types/database";

type SignUpPageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const redirectPath = await getAuthenticatedUserRedirect();
  if (redirectPath) {
    redirect(redirectPath);
  }

  const params = await searchParams;
  const roleParam = params.role;
  
  // Validate role from query param, default to 'traveler'
  // Don't allow admin sign-up via URL
  const initialRole: ProfileRole = isValidRole(roleParam) && roleParam !== "admin" 
    ? roleParam 
    : "traveler";
  
  const isGuideSignUp = initialRole === "guide";

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isGuideSignUp ? "Become a Guide" : "Create an account"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignUpForm initialRole={initialRole} />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/auth/sign-in">
              Sign in
            </Link>
            .
          </p>
          {!isGuideSignUp && (
            <p className="text-sm text-muted-foreground">
              Want to become a guide?{" "}
              <Link className="text-primary underline" href="/auth/sign-up?role=guide">
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
