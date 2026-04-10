"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
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

export default function AssetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [form, setForm] = useState<Partial<Asset>>({});
  const [editing, setEditing] = useState(false);

  const fields = [
    { name: "assetName", label: "Asset Name", type: "text" },
    { name: "assetType", label: "Asset Type", type: "text" },
    {
      name: "assetCategory",
      label: "Asset Category",
      type: "select",
      options: [
        "HARDWARE",
        "ACCESSORY",
        "SOFTWARE",
        "AI_SUBSCRIPTION",
        "SAAS_TOOL",
        "OTHER",
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        "INVENTORY",
        "ALLOCATED",
        "UNDER_MAINTENANCE",
        "RETURNED",
        "INACTIVE",
        "LOST",
        "RETIRED",
      ],
    },
    { name: "brandVendor", label: "Brand / Vendor", type: "text" },
    { name: "modelPlan", label: "Model / Plan", type: "text" },
    { name: "locationOwner", label: "Location / Owner", type: "text" },
    { name: "serialNumber", label: "Serial Number", type: "text" },
    { name: "macAddress", label: "MAC Address", type: "text" },
    { name: "assetTag", label: "Asset Tag", type: "text" },
    { name: "purchaseDate", label: "Purchase Date", type: "date" },
  ];

  useEffect(() => {
    async function fetchData() {
      const [asset, me] = await Promise.all([
        await apiFetch(`/assets/${id}`),
        await apiFetch("/auth/me"),
      ]);
      setAsset(asset);
      setForm(asset);
      setCurrentUserRole(me.role);
    }
    fetchData();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate() {
    try {
      const updated = await apiFetch(`/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setAsset(updated);
      setEditing(false);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async function handleDelete() {
    await apiFetch(`/assets/${id}`, {
      method: "DELETE",
    });
    router.push("/assets");
  }

  const isAdmin =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";

  if (!asset) return;
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{asset.assetName}</h1>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-sm text-gray-500 mb-1">{field.label}</label>
            {editing ? (
              field.type === "select" ? (
                <select
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black bg-[#0a0a0a]"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                />
              )
            ) : (
              <p className="text-sm">{asset[field.name as keyof Asset]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="flex-1 bg-black text-white text-sm py-2 rounded-lg disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border text-sm py-2 rounded-lg"
              >
                Cancel
              </button>{" "}
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 border text-sm py-2 rounded-lg"
              >
                Edit
              </button>{" "}
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white text-sm py-2 rounded-lg"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
