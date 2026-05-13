"use client";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Employee = {
  id: number;
  employeeNumber: number;
  fullName: string;
  officialEmail: string;
  department: { name: string };
  departmentId: number;
  designation: string;
  joiningDate: string;
  status: string;
  role: string;
};

type EmployeeAllocation = {
  id: number;
  allocationDate: string;
  returnDate?: string | null;
  remarks?: string | null;
  asset: {
    id: number;
    assetName: string;
    assetCategory: string;
    assetType: string;
    assetTag?: string | null;
  };
};

export default function EmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const me = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>({});
  const [editing, setEditing] = useState(false);
  const [allocations, setAllocations] = useState<EmployeeAllocation[]>([]);

  const fields = [
    { name: "fullName", label: "Full Name", type: "text" },
    {
      name: "officialEmail",
      label: "Official Email",
      type: "text",
      readOnly: true,
    },
    { name: "department", label: "Department", type: "text" },
    { name: "departmentId", label: "Department ID", type: "number" },
    { name: "designation", label: "Designation", type: "text" },
    { name: "joiningDate", label: "Joining Date", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["ACTIVE", "INACTIVE", "EXITED"],
    },
  ];

  useEffect(() => {
    async function fetchData() {
      const [employee, allocations] = await Promise.all([
        await apiFetch(`/employees/${id}`),
        await apiFetch(`/allocations/employee/${id}`),
      ]);
      setEmployee(employee);
      setForm(employee);
      setAllocations(allocations);
    }
    fetchData();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate() {
    if (!confirm("Save changes?")) return;
    try {
      const updated = await apiFetch(`/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          departmentId: Number(form.departmentId),
        }),
      });
      setEmployee(updated);
      setEditing(false);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    await apiFetch(`/employees/${id}`, {
      method: "DELETE",
    });
    router.push("/");
  }

  const isAdmin = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN";

  const activeAllocations = allocations.filter((a) => !a.returnDate);

  if (!employee) return;
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{employee.fullName}</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-sm text-gray-500 mb-1">{field.label}</label>
            {editing && !field.readOnly ? (
              field.type === "select" ? (
                <select
                  name={field.name}
                  value={
                    (form[field.name as keyof typeof form] as string) ?? ""
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
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
                  value={
                    (form[field.name as keyof typeof form] as string) ?? ""
                  }
                  onChange={handleChange}
                  type={field.type}
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                />
              )
            ) : (
              <p className="text-sm text-gray-300">
                {field.type === "date"
                  ? new Date(
                      employee[field.name as keyof Employee] as string,
                    ).toLocaleDateString()
                  : field.name === "department"
                    ? (employee.department?.name ?? "-")
                    : String(employee[field.name as keyof Employee] ?? "-")}
              </p>
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
                className="flex-1 border border-white/10 text-sm py-2 rounded-lg"
              >
                Cancel
              </button>{" "}
            </>
          ) : (
            isAdmin && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 border border-white/10 text-sm py-2 rounded-lg"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white text-sm py-2 rounded-lg"
                >
                  Delete
                </button>
              </>
            )
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">Allocated Assets</h2>
        {activeAllocations.length === 0 ? (
          <p className="text-sm text-gray-400">No active assets assigned.</p>
        ) : (
          <div className="space-y-3">
            {activeAllocations.map((allocation) => (
              <div
                key={allocation.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1"
              >
                <p className="text-sm font-medium text-white">
                  {allocation.asset.assetName}
                </p>
                <p className="text-sm text-gray-400">
                  {allocation.asset.assetCategory} -{" "}
                  {allocation.asset.assetType}
                </p>
                <p className="text-sm text-gray-400">
                  Asset Tag: {allocation.asset.assetTag || "-"}
                </p>
                <p className="text-sm text-gray-400">
                  Allocation date:{" "}
                  {new Date(allocation.allocationDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Remarks: {allocation.remarks || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
