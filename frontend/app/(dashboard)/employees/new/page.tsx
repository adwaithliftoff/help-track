"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEmployee() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employeeNumber: "",
    fullName: "",
    officialEmail: "",
    password: "",
    departmentId: "",
    designation: "",
    joiningDate: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/employees", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          employeeNumber: Number(form.employeeNumber),
          departmentId: Number(form.departmentId),
        }),
      });
      router.push("/employees");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "employeeNumber", label: "Employee Number", type: "number" },
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "officialEmail", label: "Official Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "departmentId", label: "Department", type: "text" },
    { name: "designation", label: "Designation", type: "text" },
    { name: "joiningDate", label: "Joining Date", type: "date" },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-lg font-medium text-gray-100">Add employee</h1>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
        ))}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black/70 text-white text-sm py-2 rounded-lg disabled:opacity-50 hover:bg-black transition-colors mt-2"
        >
          {loading ? "Adding..." : "Add employee"}
        </button>
      </div>
    </div>
  );
}
