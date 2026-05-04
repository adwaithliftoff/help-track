"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type Asset = {
  id: number;
  assetCategory: string;
  assetType: string;
  assetName: string;
  brandVendor?: string;
  modelPlan?: string;
  purchaseDate?: string;
  status: string;
  locationOwner?: string;
  serialNumber?: string;
  macAddress?: string;
  assetTag?: string;
  createdAt: string;
  updatedAt: string;
};

const statusColors: Record<string, string> = {
  INVENTORY: "bg-blue-900 text-blue-300",
  ALLOCATED: "bg-green-900 text-green-300",
  UNDER_MAINTENANCE: "bg-amber-900 text-amber-300",
  RETURNED: "bg-gray-800 text-gray-400",
  INACTIVE: "bg-gray-800 text-gray-400",
  LOST: "bg-red-900 text-red-300",
  RETIRED: "bg-gray-800 text-gray-400",
};

export default function Assets() {
  const router = useRouter();
  const params = new URLSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);

  useEffect(() => {
    async function fetchAssets() {
      const trimmedQuery = debouncedQuery.trim();
      if (trimmedQuery) {
        if (trimmedQuery.includes(":") || trimmedQuery.includes("-")) {
          params.append("mac", trimmedQuery);
        } else {
          params.append("name", trimmedQuery);
        }
      }
      const data = await apiFetch(`/assets?${params.toString()}`);
      setAssets(data);
    }
    fetchAssets();
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-100">Assets</h1>
          <p className="text-sm text-gray-500">{assets.length} total</p>
        </div>
        <button
          onClick={() => router.push("/assets/new")}
          className="bg-gray-100 text-gray-900 text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors"
        >
          + Add Asset
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or MAC"
        className="w-full bg-gray-800 text-gray-100 text-sm px-4 py-2 rounded-lg border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-gray-500"
      />

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Asset tag</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => router.push(`/assets/${asset.id}`)}
                className="border-b border-gray-800 last:border-0 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-gray-100 font-medium">{asset.assetName}</p>
                  <p className="text-gray-500 text-xs">
                    {asset.brandVendor ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {asset.assetCategory}
                </td>
                <td className="px-4 py-3 text-gray-400">{asset.assetType}</td>
                <td className="px-4 py-3 text-gray-400">
                  {asset.assetTag ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${statusColors[asset.status] ?? "bg-gray-800 text-gray-400"}`}
                  >
                    {asset.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
