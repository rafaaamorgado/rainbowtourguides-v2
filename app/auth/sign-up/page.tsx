import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getPostLoginRedirect } from "@/lib/auth/post-login-redirect";

/**
 * Allowed roles for public sign-up (excludes admin).
 */
type SignUpRole = "traveler" | "guide";

/**
 * Returns a safe sign-up role from URL param.
 * Only "guide" is allowed explicitly; everything else defaults to "traveler".
 * Admin sign-up via URL is blocked.
 */
function getSignUpRole(roleParam: string | undefined): SignUpRole {
  if (roleParam === "guide") return "guide";
  return "traveler";
}

type SignUpPageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { path } = await getPostLoginRedirect();
  if (path) redirect(path);

  const params = await searchParams;
  const initialRole = getSignUpRole(params.role);
  
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
