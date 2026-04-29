"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  fullName: string;
  officialEmail: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
}

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    apiFetch("/auth/me").then((data) => setUser(data));
  }, []);

  async function handleLogout() {
    if (!confirm("Logout?")) return;
    await apiFetch("/auth/logout", {
      method: "POST",
    });
    router.push("/login");
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <aside className="w-52 border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
        <p className="px-3 pt-3 pb-1 text-xs text-gray-500 uppercase tracking-wide">
          Navigate
        </p>
        {user?.role !== "EMPLOYEE" && (
          <>
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/employees"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/employees")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              }`}
            >
              Employees
            </Link>
            <Link
              href="/assets"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/assets")
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              }`}
            >
              Assets
            </Link>
          </>
        )}
        <Link
          href="/tickets"
          className={`px-3 py-2 rounded-md text-sm ${
            isActive("/tickets")
              ? "bg-gray-800 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          }`}
        >
          Tickets
        </Link>
      </nav>
      <div className="px-3 py-4 border-t border-gray-800">
        {showLogout && (
          <>
            <Link
              href={`/employees/${user?.id}`}
              className="mb-2 block w-full text-left px-3 py-2 text-sm hover:bg-gray-800 rounded-md"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="mb-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-md"
            >
              Logout
            </button>
          </>
        )}

        <button
          onClick={() => setShowLogout(!showLogout)}
          className="flex items-center gap-3 w-full hover:bg-gray-800 rounded-md p-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-sm text-gray-100 truncate">
              {user?.fullName}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {user?.officialEmail}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
