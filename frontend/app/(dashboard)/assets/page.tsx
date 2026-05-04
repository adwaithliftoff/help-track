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

const initialFilters = {
  name: "",
  tag: "",
  mac: "",
  serial: "",
  category: "",
  type: "",
  status: "",
};

export default function Assets() {
  const router = useRouter();
  const params = new URLSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters] = useDebounce(filters, 500);

  useEffect(() => {
    async function fetchAssets() {
      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value.trim()) {
          params.set(key, value.trim());
        }
      });
      const data = await apiFetch(`/assets?${params.toString()}`);
      setAssets(data);
    }
    fetchAssets();
  }, [debouncedFilters]);

  function handleClearFilters() {
    setFilters(initialFilters);
  }

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

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Asset name
              </span>
              <input
                type="text"
                value={filters.name}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Search by name"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Asset tag
              </span>
              <input
                type="text"
                value={filters.tag}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, tag: e.target.value }))
                }
                placeholder="Search by tag"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Serial number
              </span>
              <input
                type="text"
                value={filters.serial}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, serial: e.target.value }))
                }
                placeholder="Search by serial"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                MAC address
              </span>
              <input
                type="text"
                value={filters.mac}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, mac: e.target.value }))
                }
                placeholder="Search by MAC"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Category
              </span>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                <option value="HARDWARE">Hardware</option>
                <option value="ACCESSORY">Accessory</option>
                <option value="SOFTWARE">Software</option>
                <option value="AI_SUBSCRIPTION">AI Subscription</option>
                <option value="SAAS_TOOL">SaaS Tool</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Type
              </span>
              <input
                type="text"
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
                placeholder="Filter by type"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </span>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                <option value="INVENTORY">Inventory</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="UNDER_MAINTENANCE">Under maintenance</option>
                <option value="RETURNED">Returned</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LOST">Lost</option>
                <option value="RETIRED">Retired</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

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
