"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface User {
  fullName: string;
  officialEmail: string;
}

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    apiFetch("/auth/me").then((data) => setUser(data));
  }, []);

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
        <a
          href="/"
          className="px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
        >
          Dashboard
        </a>
        <a
          href="/employees"
          className="px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
        >
          Employees
        </a>
        <a
          href="/assets"
          className="px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
        >
          Assets
        </a>
      </nav>
      <div className="px-3 py-4 border-t border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
          {initials}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-gray-100 truncate">
            {user?.fullName}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {user?.officialEmail}
          </span>
        </div>
      </div>
    </aside>
  );
}
