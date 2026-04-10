"use client";

import { apiFetch } from "@/lib/api";
import { handleBuildComplete } from "next/dist/build/adapter/build-complete";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEmployee() {
  const router = useRouter();
  const [form, setForm] = useState({
    employeeNumber: "",
    fullName: "",
    officialEmail: "",
    password: "",
    department: "",
    designation: "",
    joiningDate: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    try {
      await apiFetch("/employees", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          employeeNumber: Number(form.employeeNumber),
        }),
      });
      router.push("/");
    } catch (err: any) {
      console.log(err.message || "Something went wrong");
    }
  }

  const fields = [
    { name: "employeeNumber", label: "Employee Number", type: "number" },
    { name: "fullName", label: "Full Name", type: "text" },
    { name: "officialEmail", label: "Official Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "department", label: "Department", type: "text" },
    { name: "designation", label: "Designation", type: "text" },
    { name: "joiningDate", label: "Joining Date", type: "date" },
  ];

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Add employee</h1>
      </div>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-sm text-gray-500 mb-1">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white text-sm py-2 rounded-lg disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
