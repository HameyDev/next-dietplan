import Link from "next/link";
import { cookies, headers } from "next/headers";
import SearchBar from "@/components/SearchBar";
import ClientsTable from "@/components/ClientsTable";
import Pagination from "@/components/Pagination";

// ✅ make it async and await cookies/headers
async function getClients({ q, page, limit }) {
  // build query string
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", page);
  params.set("limit", limit);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  // ✅ await cookies() and headers()
  const cookieStore = await cookies();
  const headersList = await headers();

  const res = await fetch(`${baseUrl}/api/clients?` + params.toString(), {
    method: "GET",
    headers: {
      cookie: cookieStore.toString(),
      "x-forwarded-host": headersList.get("x-forwarded-host") || "",
      "x-forwarded-proto": headersList.get("x-forwarded-proto") || "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // fallback to relative fetch
    const rel = await fetch(`/api/clients?` + params.toString(), {
      cache: "no-store",
    }).catch(() => null);
    if (!rel || !rel.ok) throw new Error("Failed to load clients");
    return rel.json();
  }

  return res.json();
}

export default async function ClientsPage({ searchParams }) {
  // ✅ searchParams is async in app router → await it
  const resolvedParams = await searchParams;

  const q = (resolvedParams?.q ?? "").trim();
  const page = Number(resolvedParams?.page ?? 1) || 1;
  const limit = Number(resolvedParams?.limit ?? 10) || 10;

  const data = await getClients({ q, page, limit });
  const { items, total } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link
          href="/clients/create"
          className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create Client
        </Link>
      </div>

      <SearchBar initialQuery={q} />

      <div className="rounded-lg border bg-white">
        <ClientsTable
          items={items}
          q={q}
          page={page}
          limit={limit}
          total={total}
        />
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={total}
        basePath="/clients"
        q={q}
      />
    </div>
  );
}
