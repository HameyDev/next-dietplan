export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome, Admin <span className="text-blue-600">👋</span>
      </h1>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Clients */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <p className="text-sm font-medium text-gray-500">Total Clients</p>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">—</p>
        </div>

        {/* PDFs Generated */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <p className="text-sm font-medium text-gray-500">PDFs Generated</p>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">—</p>
        </div>

        {/* This Week Plans */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <p className="text-sm font-medium text-gray-500">This Week Plans</p>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">—</p>
        </div>
      </div>
    </div>
  );
}
