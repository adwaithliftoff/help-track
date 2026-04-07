"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Employee = {
  id: number;
  fullName: string;
  department: string;
  designation: string;
  joiningDate: string;
};

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    async function fetchEmployees() {
      const data = await apiFetch("/employees");
      setEmployees(data);
    }
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-300">Total Employees</p>
        <p className="text-3xl font-bold">{employees.length}</p>
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Employees</h2>
        {employees.map((employee) => (
          <div key={employee.id} className="flex justify-between text-sm">
            <div>
              <p className="font-medium">{employee.fullName}</p>
              <p className="text-gray-400">
                {employee.designation} - {employee.department}
              </p>
            </div>
            <span className="text-gray-400 text-xs">
              {new Date(employee.joiningDate).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
