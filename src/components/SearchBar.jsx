"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react"; // for search icon

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
    params.set("page", "1"); // reset to first page
    router.push(`/clients?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-lg items-center rounded-2xl border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500"
    >
      <Search className="h-5 w-5 text-gray-400" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search clients by name..."
        className="ml-3 w-full border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}
