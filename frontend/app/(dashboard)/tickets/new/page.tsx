"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Allocation = {
  id: number;
  assetId: number;
  asset: {
    id: number;
    assetName: string;
  };
};

export default function NewTicket() {
  const router = useRouter();
  const [assets, setAssets] = useState<Allocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    linkedAssetId: "",
  });

  useEffect(() => {
    async function fetchData() {
      const me = await apiFetch("/auth/me");
      const data = await apiFetch(`/allocations/employee/${me.id}`);
      setAssets(data);
    }
    fetchData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setError(null);
    try {
      await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify({
          ...form, linkedAssetId : Number(form.linkedAssetId)
        }),
      });
      router.push("/tickets");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

  const fields = [
    { name: "title", label: "Title", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "Hardware Issue", value: "HARDWARE_ISSUE" },
        { label: "Software Issue", value: "SOFTWARE_ISSUE" },
        { label: "Access Issue", value: "ACCESS_ISSUE" },
        { label: "Asset Request", value: "ASSET_REQUEST" },
        { label: "Subscription / License", value: "SUBSCRIPTION_LICENSE" },
        { label: "General Support", value: "GENERAL_SUPPORT" },
      ],
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      optional: true,
      options: [
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
        { label: "Critical", value: "CRITICAL" },
      ],
    },
    {
      name: "linkedAssetId",
      label: "Linked Asset",
      type: "select",
      optional: true,
      options: assets.map((a) => ({
        label: a.asset.assetName,
        value: a.assetId,
      })),
    },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-lg font-medium text-gray-100">Add ticket</h1>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                rows={4}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 resize-none bg-transparent"
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-black text-gray-100"
              >
                {field.optional && <option value="">-- Select --</option>}
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-transparent"
              />
            )}
          </div>
        ))}{" "}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full bg-black/70 text-white text-sm py-2 rounded-lg disabled:opacity-50 hover:bg-black transition-colors mt-2"
        >
          Add ticket
        </button>
      </div>
    </div>
  );
}
