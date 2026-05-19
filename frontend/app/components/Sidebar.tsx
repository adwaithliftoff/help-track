"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-52 border-r border-gray-800 flex flex-col flex-shrink-0 h-full">
      <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
        <p className="px-3 pt-3 pb-1 text-xs text-gray-500 uppercase tracking-wide">
          Navigate
        </p>
        {user?.publicMetadata.role_name !== "Member" && (
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
        <UserButton
          showName
          appearance={{
            elements: {
              userButtonBox: {
                flexDirection: "row-reverse",
              },
            },
          }}
        />
      </div>
    </aside>
  );
}
