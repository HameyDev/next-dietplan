"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchBar({ initialQuery = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    params.set("page", "1"); // reset to first page on new search
    router.push(`/clients?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
        className="w-full max-w-md rounded border p-2"
      />
      <button
        type="submit"
        className="rounded bg-gray-900 px-4 py-2 text-white hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
