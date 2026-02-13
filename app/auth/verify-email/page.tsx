import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ResendVerificationButton } from "./ResendVerificationButton";

export default async function VerifyEmailPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  if (user.email_confirmed_at) {
    redirect("/");
  }

  const email = user.email ?? "";

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-surface-pride-amber/20 via-background to-surface-pride-lilac/20 px-4">
      <Card className="w-full max-w-md shadow-editorial rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Verify your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Check your inbox. We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in that email to verify your account. If you
            don&apos;t see it, check your spam folder.
          </p>
          <ResendVerificationButton email={email} />
        </CardContent>
      </Card>
    </section>
  );
}
