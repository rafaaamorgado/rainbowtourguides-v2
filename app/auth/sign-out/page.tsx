import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default function SignOutPage() {
  async function signOut() {
    "use server";
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <section className="flex min-h-[50vh] items-center justify-center">
      <form action={signOut} className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Ready to sign out?</p>
        <Button type="submit">Sign out</Button>
      </form>
    </section>
  );
}

