"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Employee = {
  id: number;
  employeeNumber: number;
  fullName: string;
  officialEmail: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: string;
  role: string;
};

export default function EmployeePage() {
  const { id } = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [form, setForm] = useState<Partial<Employee>>({});
  const [editing, setEditing] = useState(false);

  const fields = [
    { name: "fullName", label: "Full Name" },
    { name: "officialEmail", label: "Official Email" },
    { name: "department", label: "Department" },
    { name: "designation", label: "Designation" },
    { name: "joiningDate", label: "Joining Date" },
    { name: "status", label: "Status" },
  ];

  useEffect(() => {
    async function fetchData() {
      const [employee, me] = await Promise.all([
        await apiFetch(`/employees/${id}`),
        await apiFetch("/auth/me"),
      ]);
      setEmployee(employee);
      setForm(employee);
      setCurrentUserRole(me.role);
    }
    fetchData();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate() {
    try {
      const updated = await apiFetch(`/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setEmployee(updated);
      setEditing(false);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async function handleDelete() {
    await apiFetch(`/employees/${id}`, {
      method: "DELETE",
    });
    router.push("/");
  }

  const isAdmin =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";

  if (!employee) return;
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{employee.fullName}</h1>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-sm text-gray-500 mb-1">{field.label}</label>
            {editing ? (
              <input
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            ) : (
              <p className="text-sm">
                {employee[field.name as keyof Employee]}
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
