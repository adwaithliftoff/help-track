"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
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

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-900 text-green-300",
  INACTIVE: "bg-gray-800 text-gray-400",
  EXITED: "bg-red-900 text-red-300",
};

export default function Employees() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    async function fetchEmployees() {
      const data = await apiFetch("/employees");
      setEmployees(data);
    }
    fetchEmployees();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-100">Employees</h1>
          <p className="text-sm text-gray-500">{employees.length} total</p>
        </div>
        <button
          onClick={() => router.push("/employees/new")}
          className="bg-gray-100 text-gray-900 text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors"
        >
          + Add Employee
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left px-4 py-3">Employee</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Designation</th>
              <th className="text-left px-4 py-3">Joining date</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                onClick={() => router.push(`/employees/${employee.id}`)}
                className="border-b border-gray-800 last:border-0 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-gray-100 font-medium">
                    {employee.fullName}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {employee.officialEmail}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {employee.department}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {employee.designation}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(employee.joiningDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${statusColors[employee.status] ?? "bg-gray-800 text-gray-400"}`}
                  >
                    {employee.status}
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
