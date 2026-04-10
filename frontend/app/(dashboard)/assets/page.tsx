"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function Assets() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  useEffect(() => {
    async function fetchAssets() {
      const data = await apiFetch("/assets");
      setAssets(data);
    }
    fetchAssets();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-300">Total Assets</p>
        <p className="text-3xl font-bold">{assets.length}</p>
      </div>
      <div>
        <button
          onClick={() => router.push("/assets/new")}
          className="bg-neutral-300 text-black text-sm px-4 py-2 rounded-lg"
        >
          + Add Asset
        </button>
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Assets</h2>
        {assets.map((asset) => (
          <Link
            key={asset.id}
            href={`/assets/${asset.id}`}
            className="flex justify-between text-sm hover:bg-white/10 rounded p-1 -mx-1"
          >
            <div>
              <p className="font-medium">{asset.assetName}</p>
              <p className="text-gray-400">
                {asset.assetCategory} - {asset.assetType}
              </p>
              {asset.locationOwner && (
                <p className="text-gray-500 text-xs">{asset.locationOwner}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-gray-400 text-xs">{asset.status}</span>
              {asset.assetTag && (
                <span className="text-gray-500 text-xs">{asset.assetTag}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
