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
    <section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
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
