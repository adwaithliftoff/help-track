"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Field = {
  name: string;
  label: string;
  type: string;
  options?: string[];
};

export default function NewAsset() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    assetCategory: "",
    assetType: "",
    assetName: "",
    brandVendor: "",
    modelPlan: "",
    purchaseDate: "",
    status: "",
    serialNumber: "",
    macAddress: "",
    assetTag: "",
    planLicenseType: "",
    totalSeats: "",
    renewalDate: "",
    accountOwner: "",
    licenseKey: "",
  });
  const isPhysical = ["HARDWARE", "ACCESSORY"].includes(form.assetCategory);
  const isDigital = ["SOFTWARE", "AI_SUBSCRIPTION", "SAAS_TOOL"].includes(
    form.assetCategory,
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(
          ([_, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );
      await apiFetch("/assets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/assets");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

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
    { name: "purchaseDate", label: "Purchase Date", type: "date" },
  ];

  const physicalFields = [
    { name: "serialNumber", label: "Serial Number", type: "text" },
    { name: "macAddress", label: "MAC Address", type: "text" },
    { name: "assetTag", label: "Asset Tag", type: "text" },
  ];

  const digitalFields = [
    { name: "planLicenseType", label: "Plan / License Type", type: "text" },
    { name: "totalSeats", label: "Total Seats", type: "number" },
    { name: "renewalDate", label: "Renewal Date", type: "date" },
    { name: "accountOwner", label: "Account Owner", type: "text" },
    { name: "licenseKey", label: "License Key", type: "text" },
  ];

  const activeFields: Field[] = [
    ...fields,
    ...(isPhysical ? physicalFields : []),
    ...(isDigital ? digitalFields : []),
  ];

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Add asset</h1>
      </div>
      <div className="space-y-4">
        {activeFields.map((field) => (
          <div key={field.name}>
            <label className="text-sm text-gray-500 mb-1">{field.label}</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500 bg-black text-white"
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
                type={field.type}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            )}
          </div>
        ))}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white text-sm py-2 rounded-lg disabled:opacity-50"
        >
          Add
        </button>
      </div>{" "}
    </div>
  );
}
