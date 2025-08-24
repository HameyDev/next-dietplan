"use client";

import Link from "next/link";
import { useMemo } from "react";

export default function Pagination({ page, limit, total, basePath, q }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const qp = useMemo(() => {
    const build = (p) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(p));
      params.set("limit", String(limit));
      return `${basePath}?${params.toString()}`;
    };
    return { prev: build(Math.max(page - 1, 1)), next: build(Math.min(page + 1, totalPages)) };
  }, [page, limit, total, basePath, q, totalPages]);

  return (
    <div className="flex items-center justify-between">
      <Link
        href={qp.prev}
        className={`rounded border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-100"}`}
      >
        ← Prev
      </Link>

      <div className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </div>

      <Link
        href={qp.next}
        className={`rounded border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-100"}`}
      >
        Next →
      </Link>
    </div>
  );
}
