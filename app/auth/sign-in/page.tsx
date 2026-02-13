import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getPostLoginRedirect } from "@/lib/auth/post-login-redirect";

type SignInPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  // Redirect already authenticated users to their dashboard
  const { path } = await getPostLoginRedirect();
  if (path) redirect(path);

  const params = await searchParams;
  const message = params.message;

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-surface-pride-amber/20 via-background to-surface-pride-lilac/20 px-4">
      <Card className="w-full max-w-md shadow-editorial rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">Welcome back to Rainbow Tour Guides</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {message === "password_updated" && (
            <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Your password has been updated. You can sign in with your new password.
            </p>
          )}
          <SignInForm />
          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/auth/sign-up">
              Create one
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
