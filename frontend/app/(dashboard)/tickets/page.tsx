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
export default function Tickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  useEffect(() => {
    async function fetchTickets() {
      const data = await apiFetch("/tickets");
      setTickets(data);
    }
    fetchTickets();
  }, []);
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
