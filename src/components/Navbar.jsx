"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const linkCls = (href) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
            pathname === href ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
        }`;

    return (
        <header className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="font-bold text-lg text-black hover:text-blue-600">
                    Diet Admin
                </Link>
                <nav className="flex items-center gap-2">
                    <Link className={linkCls("/clients")} href="/clients">Clients</Link>
                    <Link className={linkCls("/clients/create")} href="/clients/create">Create Client</Link>
                    <button 
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white hover:opacity-90"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
}
