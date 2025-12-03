import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

