export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">System Overview</p>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold mt-2">--</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Pending Guides</h3>
          <p className="text-2xl font-bold mt-2 text-orange-600">--</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
      </div>
    </div>
  );
}
