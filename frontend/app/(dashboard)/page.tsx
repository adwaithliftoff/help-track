"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface Employee {
  id: string;
  fullName: string;
  officialEmail: string;
  createdAt: string;
}

interface Asset {
  id: string;
  assetName: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    apiFetch("/employees").then((data) => setEmployees(data));
    apiFetch("/assets").then((data) => setAssets(data));
  }, []);

  const cards = [
    { label: "Total employees", value: employees.length },
    { label: "Total assets", value: assets.length },
    {
      label: "Allocated",
      value: assets.filter((a) => a.status === "ALLOCATED").length,
    },
    {
      label: "Available",
      value: assets.filter((a) => a.status === "INVENTORY").length,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-medium text-gray-100">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-100 mb-3">Employees</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left pb-2">Name</th>
                <th className="text-left pb-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="py-2 text-gray-300">{e.fullName}</td>
                  <td className="py-2 text-gray-500">{e.officialEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-100 mb-3">Assets</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left pb-2">Name</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="py-2 text-gray-300">{a.assetName}</td>
                  <td className="py-2 text-gray-500">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
