"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "-";
  }
}

export default function ClientsTable({ items = [], page, limit, total }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);

  const handleDelete = async (id) => {
    const ok = confirm("Delete this client? This cannot be undone.");
    if (!ok) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to delete");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handlePDF = async (id) => {
    // Chunk 8 will implement real PDF; for now we call a placeholder endpoint
    const res = await fetch(`/api/pdf?clientId=${id}`);
    if (res.status === 501) {
      alert("PDF generation will be available in Chunk 8. (Placeholder now)");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to generate PDF");
      return;
    }
    // If later you stream a blob, you can trigger a download here.
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Gender</th>
            <th className="px-4 py-3">Goal</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No clients found.
              </td>
            </tr>
          )}

          {items.map((c) => (
            <tr key={c._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3">{c.age}</td>
              <td className="px-4 py-3">{c.gender}</td>
              <td className="px-4 py-3">{c.goalType}</td>
              <td className="px-4 py-3">{fmtDate(c.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/clients/${c._id}`}
                    className="rounded border px-3 py-1.5 hover:bg-gray-100"
                    title="View"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => handlePDF(c._id)}
                    className="rounded border px-3 py-1.5 hover:bg-gray-100"
                    title="Generate PDF"
                  >
                    PDF
                  </button>

                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={busyId === c._id}
                    className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60"
                    title="Delete"
                  >
                    {busyId === c._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* small footer display */}
      <div className="flex items-center justify-between p-3 text-xs text-gray-500">
        <span>
          Showing {(items.length && (page - 1) * limit + 1) || 0}–
          {(page - 1) * limit + items.length} of {total}
        </span>
      </div>
    </div>
  );
}
