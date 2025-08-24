export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, Admin 👋</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="mt-2 text-2xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">PDFs Generated</p>
          <p className="mt-2 text-2xl font-bold">—</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">This Week Plans</p>
          <p className="mt-2 text-2xl font-bold">—</p>
        </div>
      </div>
    </div>
  );
}
