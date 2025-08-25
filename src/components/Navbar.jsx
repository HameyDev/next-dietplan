"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const linkCls = (href) =>
        `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            pathname === href 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-700 hover:bg-gray-100"
        }`;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo / Brand */}
                <Link 
                    href="/dashboard" 
                    className="font-extrabold text-xl text-gray-900 tracking-wide hover:text-blue-600 transition-colors"
                >
                    Diet Admin
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-4">
                    <Link className={linkCls("/clients")} href="/clients">
                        Clients
                    </Link>
                    <Link className={linkCls("/clients/create")} href="/clients/create">
                        Create Client
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="ml-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    );
}

