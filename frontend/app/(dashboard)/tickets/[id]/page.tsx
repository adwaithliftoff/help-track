"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TicketComments from "./TicketComments";
import { useAuth } from "@/providers/AuthProvider";

type Ticket = {
  id: number;
  title: string;
  description: string;
  category:
    | "HARDWARE_ISSUE"
    | "SOFTWARE_ISSUE"
    | "ACCESS_ISSUE"
    | "ASSET_REQUEST"
    | "SUBSCRIPTION_ISSUE"
    | "GENERAL_SUPPORT";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING_FOR_USER"
    | "RESOLVED"
    | "CLOSED"
    | "REOPENED";
  creatorId: number;
  assigneeId: number | null;
  linkedEmployeeId: number | null;
  linkedAssetId: number | null;
  attachments: string[];
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: { fullName: string };
  assignee?: { fullName: string } | null;
  linkedEmployee?: { fullName: string } | null;
  linkedAsset?: { assetName: string } | null;
};

const statusColors = {
  OPEN: "bg-blue-900 text-blue-300",
  IN_PROGRESS: "bg-yellow-900 text-yellow-300",
  WAITING_FOR_USER: "bg-purple-900 text-purple-300",
  RESOLVED: "bg-green-900 text-green-300",
  CLOSED: "bg-gray-800 text-gray-400",
  REOPENED: "bg-orange-900 text-orange-300",
};

const categoryLabels = {
  HARDWARE_ISSUE: "Hardware Issue",
  SOFTWARE_ISSUE: "Software Issue",
  ACCESS_ISSUE: "Access Issue",
  ASSET_REQUEST: "Asset Request",
  SUBSCRIPTION_ISSUE: "Subscription Issue",
  GENERAL_SUPPORT: "General Support",
};

const priorityColors = {
  LOW: "bg-blue-900 text-blue-300",
  MEDIUM: "bg-yellow-900 text-yellow-300",
  HIGH: "bg-orange-900 text-orange-300",
  CRITICAL: "bg-red-900 text-red-300",
};

type Employee = {
  id: number;
  fullName: string;
};

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const me = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managing, setManaging] = useState(false);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    attachments: "",
  });
  const [manageForm, setManageForm] = useState({
    status: "",
    priority: "",
    category: "",
    assigneeId: "",
    linkedEmployeeId: "",
    resolutionNote: "",
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [ticketData, commentsData] = await Promise.all([
          apiFetch(`/tickets/${id}`),
          apiFetch(`/tickets/${id}/comments`),
        ]);
        setTicket(ticketData);
        setComments(commentsData);
        setForm({
          title: ticketData.title ?? "",
          description: ticketData.description ?? "",
          category: ticketData.category ?? "",
          priority: ticketData.priority ?? "",
          attachments: Array.isArray(ticketData.attachments)
            ? ticketData.attachments.join(", ")
            : "",
        });
        setManageForm({
          status: ticketData.status ?? "",
          priority: ticketData.priority ?? "",
          category: ticketData.category ?? "",
          assigneeId: ticketData.assigneeId
            ? String(ticketData.assigneeId)
            : "",
          linkedEmployeeId: ticketData.linkedEmployeeId
            ? String(ticketData.linkedEmployeeId)
            : "",
          resolutionNote: ticketData.resolutionNote ?? "",
        });
        if (me?.role === "ADMIN" || me?.role === "SUPER_ADMIN") {
          const employeeList = await apiFetch("/employees");
          setEmployees(employeeList);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleManageChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setManageForm({ ...manageForm, [e.target.name]: e.target.value });
  }

  async function handleUpdate() {
    setError(null);
    try {
      const updated = await apiFetch(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          attachments: attachmentList,
        }),
      });
      setTicket(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err);
    }
  }

  async function handleManage() {
    setError(null);
    try {
      const updated = await apiFetch(`/tickets/${id}/manage`, {
        method: "PATCH",
        body: JSON.stringify({
          status: manageForm.status || undefined,
          priority: manageForm.priority || undefined,
          category: manageForm.category || undefined,
          assigneeId: manageForm.assigneeId
            ? Number(manageForm.assigneeId)
            : undefined,
          linkedEmployeeId: manageForm.linkedEmployeeId
            ? Number(manageForm.linkedEmployeeId)
            : undefined,
          resolutionNote: manageForm.resolutionNote || undefined,
        }),
      });
      setTicket(updated);
      setManaging(false);
    } catch (err: any) {
      setError(err);
    }
  }

  async function fetchComments() {
    const data = await apiFetch(`/tickets/${id}/comments`);
    setComments(data);
  }

  const rawAttach = form.attachments ?? ticket?.attachments?.join(", ") ?? "";

  const attachmentList = rawAttach
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!ticket) return null;
  const isCreator = ticket.creatorId === me?.id;
  const canManage = me?.role === "ADMIN" || me?.role === "SUPER_ADMIN" || false;

  async function handleDelete() {
    if (!confirm("Delete this ticket?")) return;
    setError(null);
    try {
      await apiFetch(`/tickets/${id}`, {
        method: "DELETE",
      });
      router.push("/tickets");
    } catch (err: any) {
      setError(err);
    }
  }
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-sm text-gray-400">Loading ticket...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-lg font-medium text-gray-100">Ticket</h1>
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => router.push("/tickets")}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
        >
          Back to tickets
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-100">
              {ticket.title}
            </h1>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-gray-400">
              #{ticket.id}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Created by {ticket.creator?.fullName || `#${ticket.creatorId}`} on{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isCreator && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
            >
              Edit
            </button>
          )}
          {canManage && (
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-400"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs ${statusColors[ticket.status]}`}
              >
                {ticket.status}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs ${priorityColors[ticket.priority]}`}
              >
                {ticket.priority}
              </span>
              <span className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">
                {categoryLabels[ticket.category]}
              </span>
            </div>
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                    >
                      {Object.keys(priorityColors).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">
                      Attachments
                    </label>
                    <input
                      name="attachments"
                      value={form.attachments}
                      onChange={handleChange}
                      placeholder="Comma-separated URLs or file names"
                      className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                  >
                    Save changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-200">
                  {ticket.description}
                </p>
                {attachmentList.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500">
                      Attachments
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {attachmentList.map((attachment) => (
                        <span
                          key={attachment}
                          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-300"
                        >
                          {attachment}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Ticket Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Creator</p>
                <p className="text-sm text-gray-200">
                  {ticket.creator?.fullName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assignee</p>
                <p className="text-sm text-gray-200">
                  {ticket.assignee?.fullName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Linked Employee</p>
                <p className="text-sm text-gray-200">
                  {ticket.linkedEmployee?.fullName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Linked Asset</p>
                <p className="text-sm text-gray-200">
                  {ticket.linkedAsset?.assetName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Updated</p>
                <p className="text-sm text-gray-200">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-200">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">Management</h2>
              {canManage && !managing && (
                <button
                  onClick={() => setManaging(true)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/5"
                >
                  Manage
                </button>
              )}
            </div>
            {managing ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Status
                  </label>
                  <select
                    name="status"
                    value={manageForm.status}
                    onChange={handleManageChange}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  >
                    {Object.keys(statusColors).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={manageForm.priority}
                    onChange={handleManageChange}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  >
                    {Object.keys(priorityColors).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Category
                  </label>
                  <select
                    name="category"
                    value={manageForm.category}
                    onChange={handleManageChange}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Assignee
                  </label>
                  <select
                    name="assigneeId"
                    value={manageForm.assigneeId}
                    onChange={handleManageChange}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Linked Employee
                  </label>
                  <select
                    name="linkedEmployeeId"
                    value={manageForm.linkedEmployeeId}
                    onChange={handleManageChange}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  >
                    <option value="">None</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Resolution Note
                  </label>
                  <textarea
                    name="resolutionNote"
                    value={manageForm.resolutionNote}
                    onChange={handleManageChange}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleManage}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm text-black"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setManaging(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-gray-300">
                <p>Status: {ticket.status}</p>
                <p>Priority: {ticket.priority}</p>
                <p>Category: {categoryLabels[ticket.category]}</p>
                <p>Assignee: {ticket.assignee?.fullName || "-"}</p>
                <p>Resolution: {ticket.resolutionNote || "-"}</p>
              </div>
            )}
          </section>
        </div>
        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <TicketComments
              ticketId={Number(id)}
              comments={comments}
              onCommentAdded={fetchComments}
            ></TicketComments>{" "}
          </section>
        </div>
      </div>
    </div>
  );
}
