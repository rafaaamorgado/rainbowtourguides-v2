import { requireRole } from "@/lib/auth-helpers";

export default async function AdminPage() {
  const { profile } = await requireRole("admin");

  return (
    <div className="space-y-3 py-12">
      <h1 className="text-3xl font-semibold">Admin console</h1>
      <p className="text-sm text-muted-foreground">
        Logged in as {profile.display_name}
      </p>
      <p className="text-muted-foreground">Administrative placeholder for content, trust & safety, and payouts.</p>
    </div>
  );
}
