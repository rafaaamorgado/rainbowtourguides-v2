import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-surface-pride-amber/20 via-background to-surface-pride-lilac/20 px-4">
      <Card className="w-full max-w-md shadow-editorial rounded-3xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Forgot password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </section>
  );
}
