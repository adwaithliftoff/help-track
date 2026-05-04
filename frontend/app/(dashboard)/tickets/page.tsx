"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING_FOR_USER"
    | "RESOLVED"
    | "CLOSED"
    | "REOPENED";
  createdAt: string;
  creatorId: number;
};

const priorityColors = {
  LOW: "bg-blue-900 text-blue-300",
  MEDIUM: "bg-yellow-900 text-yellow-300",
  HIGH: "bg-orange-900 text-orange-300",
  CRITICAL: "bg-red-900 text-red-300",
};

const statusColors = {
  OPEN: "bg-blue-900 text-blue-300",
  IN_PROGRESS: "bg-yellow-900 text-yellow-300",
  WAITING_FOR_USER: "bg-purple-900 text-purple-300",
  RESOLVED: "bg-green-900 text-green-300",
  CLOSED: "bg-gray-800 text-gray-400",
  REOPENED: "bg-orange-900 text-orange-300",
};

const initialFilters = {
  status: "",
  priority: "",
  category: "",
  assigneeId: "",
  employeeId: "",
  assetId: "",
  dateFrom: "",
  dateTo: "",
};

export default function Tickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    async function fetchTickets() {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.set(key, value);
        }
      });
      const data = await apiFetch(`/tickets?${params.toString()}`);
      setTickets(data);
    }
    fetchTickets();
  }, [filters]);

  function handleClearFilters() {
    setFilters(initialFilters);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-100">Tickets</h1>
          <p className="text-sm text-gray-500">{tickets.length} total</p>
        </div>
        <button
          onClick={() => router.push("/tickets/new")}
          className="bg-gray-100 text-gray-900 text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors"
        >
          + Add Ticket
        </button>
      </div>
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </span>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="WAITING_FOR_USER">Waiting for user</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REOPENED">Reopened</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Priority
              </span>
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Category
              </span>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              >
                <option value="">All</option>
                <option value="HARDWARE_ISSUE">Hardware issue</option>
                <option value="SOFTWARE_ISSUE">Software issue</option>
                <option value="ACCESS_ISSUE">Access issue</option>
                <option value="ASSET_REQUEST">Asset request</option>
                <option value="SUBSCRIPTION_ISSUE">Subscription issue</option>
                <option value="GENERAL_SUPPORT">General support</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Assignee ID
              </span>
              <input
                type="number"
                value={filters.assigneeId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    assigneeId: e.target.value,
                  }))
                }
                placeholder="e.g. 12"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Linked Employee ID
              </span>
              <input
                type="number"
                value={filters.employeeId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    employeeId: e.target.value,
                  }))
                }
                placeholder="e.g. 8"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Asset ID
              </span>
              <input
                type="number"
                value={filters.assetId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    assetId: e.target.value,
                  }))
                }
                placeholder="e.g. 21"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-500
  focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                From
              </span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateFrom: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                To
              </span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:border-gray-500"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Creator ID</th>
              <th className="text-left px-4 py-3">Priority</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="border-b border-gray-800 last:border-0 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-gray-100 font-medium">{ticket.title}</p>
                  <p className="text-gray-500 text-xs">#{ticket.id}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{ticket.creatorId}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${priorityColors[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColors[ticket.status]}`}
                  >
                    {ticket.status}
                  </span>{" "}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
