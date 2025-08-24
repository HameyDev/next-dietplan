import Link from "next/link";
import { cookies, headers } from "next/headers";
import SearchBar from "@/components/SearchBar";
import ClientsTable from "@/components/ClientsTable";
import Pagination  from "@/components/Pagination";

async function getClients({ q, page, limit }) {
  // Build query string
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", page);
  params.set("limit", limit);

  // Include cookies/headers so auth session is forwarded
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/clients?` + params.toString(), {
    method: "GET",
    headers: {
      cookie: cookies().toString(),
      "x-forwarded-host": headers().get("x-forwarded-host") || "",
      "x-forwarded-proto": headers().get("x-forwarded-proto") || "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // If running locally without NEXT_PUBLIC_BASE_URL, fallback to relative fetch
    const rel = await fetch(`/api/clients?` + params.toString(), { cache: "no-store" }).catch(() => null);
    if (!rel || !rel.ok) throw new Error("Failed to load clients");
    return rel.json();
  }

  return res.json();
}

export default async function ClientsPage({ searchParams }) {
  const q = (searchParams?.q ?? "").trim();
  const page = Number(searchParams?.page ?? 1) || 1;
  const limit = Number(searchParams?.limit ?? 10) || 10;

  const data = await getClients({ q, page, limit });
  const { items, total } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link
          href="/clients/create"
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create Client
        </Link>
      </div>

      <SearchBar initialQuery={q} />

      <div className="rounded-lg border bg-white">
        <ClientsTable items={items} q={q} page={page} limit={limit} total={total} />
      </div>

      <Pagination page={page} limit={limit} total={total} basePath="/clients" q={q} />
    </div>
  );
}
