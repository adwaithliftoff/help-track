"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Asset = {
  assetCategory: string;
  assetType: string;
  assetName: string;
  brandVendor: string;
  modelPlan: string;
  purchaseDate: string;
  status: string;
  serialNumber: string;
  macAddress: string;
  assetTag: string;
  planLicenseType: string;
  totalSeats: number | "";
  renewalDate: string;
  accountOwner: string;
  licenseKey: string;
};

type Allocation = {
  id: number;
  allocationDate: string;
  returnDate?: string | null;
  remarks?: string | null;
  assignedEmployee?: { fullName: string };
  allocatedBy?: { fullName: string };
  returnCondition?: string | null;
  receivingAdmin?: { fullName: string };
};

type Employee = {
  id: number;
  fullName: string;
};

type Field = {
  name: string;
  label: string;
  type: string;
  options?: string[];
  readOnly?: boolean;
};

export default function AssetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [form, setForm] = useState<Partial<Asset>>({});
  const [editing, setEditing] = useState(false);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [me, setMe] = useState<{ id: number; role: string } | null>(null);

  const isPhysical = ["HARDWARE", "ACCESSORY"].includes(
    form.assetCategory ?? "",
  );
  const isDigital = ["SOFTWARE", "AI_SUBSCRIPTION", "SAAS_TOOL"].includes(
    form.assetCategory ?? "",
  );

  const [allocateForm, setAllocateForm] = useState({
    assignedEmployeeId: 0,
    allocationDate: "",
    remarks: "",
  });

  const [returnForm, setReturnForm] = useState({
    returnDate: "",
    returnCondition: "GOOD",
    remarks: "",
  });

  const payload = {
    ...form,
    purchaseDate: form.purchaseDate
      ? new Date(form.purchaseDate).toISOString()
      : undefined,
  };

  const activeAllocation = allocations.find((a) => !a.returnDate);

  const fields = [
    { name: "assetName", label: "Asset Name", type: "text" },
    { name: "assetType", label: "Asset Type", type: "text" },
    {
      name: "assetCategory",
      label: "Asset Category",
      type: "select",
      options: [
        "HARDWARE",
        "ACCESSORY",
        "SOFTWARE",
        "AI_SUBSCRIPTION",
        "SAAS_TOOL",
        "OTHER",
      ],
    },
    { name: "status", label: "Status", type: "text", readOnly: true },
    { name: "brandVendor", label: "Brand / Vendor", type: "text" },
    { name: "modelPlan", label: "Model / Plan", type: "text" },
    { name: "purchaseDate", label: "Purchase Date", type: "date" },
  ];

  const physicalFields = [
    { name: "serialNumber", label: "Serial Number", type: "text" },
    { name: "macAddress", label: "MAC Address", type: "text" },
    { name: "assetTag", label: "Asset Tag", type: "text" },
  ];

  const digitalFields = [
    { name: "planLicenseType", label: "Plan / License Type", type: "text" },
    { name: "totalSeats", label: "Total Seats", type: "number" },
    { name: "renewalDate", label: "Renewal Date", type: "date" },
    { name: "accountOwner", label: "Account Owner", type: "text" },
    { name: "licenseKey", label: "License Key", type: "text" },
  ];

  const activeFields: Field[] = [
    ...fields,
    ...(isPhysical ? physicalFields : []),
    ...(isDigital ? digitalFields : []),
  ];

  const mapAssets = (asset: any) => ({
    assetName: asset.assetName ?? "",
    assetCategory: asset.assetCategory ?? "",
    assetType: asset.assetType ?? "",
    brandVendor: asset.brandVendor ?? "",
    modelPlan: asset.modelPlan ?? "",
    status: asset.status ?? "",
    purchaseDate: asset.purchaseDate
      ? new Date(asset.purchaseDate).toISOString().split("T")[0]
      : "",
    planLicenseType: asset.digitalSubscription?.planLicenseType ?? "",
    totalSeats: asset.digitalSubscription?.totalSeats ?? "",
    renewalDate: asset.digitalSubscription?.renewalDate
      ? new Date(asset.digitalSubscription.renewalDate)
          .toISOString()
          .split("T")[0]
      : "",
    accountOwner: asset.digitalSubscription?.accountOwner ?? "",
    licenseKey: asset.digitalSubscription?.licenseKey ?? "",
    serialNumber: asset.physicalAsset?.serialNumber ?? "",
    macAddress: asset.physicalAsset?.macAddress ?? "",
    assetTag: asset.physicalAsset?.assetTag ?? "",
  });

  useEffect(() => {
    async function fetchData() {
      const [asset, me, allocaionHistory] = await Promise.all([
        await apiFetch(`/assets/${id}`),
        await apiFetch("/auth/me"),
        await apiFetch(`/allocations/asset/${id}`),
      ]);
      setAsset(mapAssets(asset));
      setForm(mapAssets(asset));
      setCurrentUserRole(me.role);
      setMe(me);
      setAllocations(allocaionHistory);

      if (me.role === "ADMIN" || me.role === "SUPER_ADMIN") {
        const employeeList = await apiFetch("/employees");
        setEmployees(employeeList);
      }
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
      const updated = await apiFetch(`/assets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setAsset(mapAssets(updated));
      console.log(asset);
      setEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    await apiFetch(`/assets/${id}`, {
      method: "DELETE",
    });
    router.push("/assets");
  }

  async function handleReturn() {
    if (!activeAllocation || !me) return;
    await apiFetch(`/allocations/${activeAllocation.id}/return`, {
      method: "PATCH",
      body: JSON.stringify({ ...returnForm, receivingAdminId: me.id }),
    });
    const [updatedAsset, updatedAllocations] = await Promise.all([
      apiFetch(`/assets/${id}`),
      apiFetch(`/allocations/asset/${id}`),
    ]);

    setAsset(updatedAsset);
    setAllocations(updatedAllocations);
  }

  async function handleAllocate() {
    if (!me) return;
    await apiFetch(`/allocations`, {
      method: "POST",
      body: JSON.stringify({
        ...allocateForm,
        assetId: Number(id),
        allocatedById: me.id,
      }),
    });

    const [updatedAsset, updatedAllocations] = await Promise.all([
      apiFetch(`/assets/${id}`),
      apiFetch(`/allocations/asset/${id}`),
    ]);

    setAsset(updatedAsset);
    setAllocations(updatedAllocations);
  }
  const isAdmin =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";

  if (!asset) return;
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{asset.assetName}</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
        {activeFields.map((field) => {
          const value = editing
            ? form[field.name as keyof typeof form]
            : asset[field.name as keyof Asset];

          if (
            !editing &&
            (value === null || value === undefined || value === "")
          ) {
            return null;
          }
          return (
            <div key={field.name}>
              <label className="text-sm text-gray-500 mb-1">
                {field.label}
              </label>
              {editing && !field.readOnly ? (
                field.type === "select" ? (
                  <select
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
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
                    value={form[field.name as keyof typeof form] ?? ""}
                    onChange={handleChange}
                    type={field.type}
                    className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
                  />
                )
              ) : (
                <p className="text-sm text-gray-300">
                  {field.type === "date" && value
                    ? new Date(
                        asset[field.name as keyof Asset] as string,
                      ).toLocaleDateString()
                    : asset[field.name as keyof Asset]}
                </p>
              )}
            </div>
          );
        })}

        {error && <p className="text-xs text-red-400">{error}</p>}

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

      {activeAllocation ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-amber-200">
            Allocation Details
          </h2>
          <div className="space-y-1 text-sm text-gray-300">
            <p>
              Assigned to: {activeAllocation.assignedEmployee?.fullName || "-"}
            </p>
            <p>
              Allocation date:{" "}
              {new Date(activeAllocation.allocationDate).toLocaleDateString()}
            </p>
            <p>Allocated by: {activeAllocation.allocatedBy?.fullName || "-"}</p>
            <p>Remarks: {activeAllocation.remarks || "-"}</p>
          </div>

          {isAdmin && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-sm font-medium text-white">Return Asset</h3>
              <input
                type="date"
                value={returnForm.returnDate}
                onChange={(e) =>
                  setReturnForm({ ...returnForm, returnDate: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm"
              />
              <select
                value={returnForm.returnCondition}
                onChange={(e) =>
                  setReturnForm({
                    ...returnForm,
                    returnCondition: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm"
              >
                <option value="NEW">NEW</option>
                <option value="GOOD">GOOD</option>
                <option value="FAIR">FAIR</option>
                <option value="DAMAGED">DAMAGED</option>
              </select>
              <input
                value={returnForm.remarks}
                onChange={(e) =>
                  setReturnForm({ ...returnForm, remarks: e.target.value })
                }
                placeholder="Return remarks"
                className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm"
              />
              <button
                onClick={handleReturn}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white"
              >
                Return Asset
              </button>
            </div>
          )}
        </div>
      ) : (
        isAdmin && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-emerald-200">
              Allocate Asset
            </h2>
            <select
              value={allocateForm.assignedEmployeeId}
              onChange={(e) =>
                setAllocateForm({
                  ...allocateForm,
                  assignedEmployeeId: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={allocateForm.allocationDate}
              onChange={(e) =>
                setAllocateForm({
                  ...allocateForm,
                  allocationDate: e.target.value,
                })
              }
              className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm"
            />
            <input
              value={allocateForm.remarks}
              onChange={(e) =>
                setAllocateForm({ ...allocateForm, remarks: e.target.value })
              }
              placeholder="Allocation remarks"
              className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm"
            />
            <button
              onClick={handleAllocate}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm text-black"
            >
              Allocate Asset
            </button>
          </div>
        )
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">Allocation History</h2>
        {allocations.length === 0 ? (
          <p className="text-sm text-gray-400">No allocation history yet.</p>
        ) : (
          <div className="space-y-3">
            {allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-1"
              >
                <p className="text-sm text-white">
                  Assigned to: {allocation.assignedEmployee?.fullName}
                </p>
                <p className="text-sm text-gray-400">
                  Allocated by: {allocation.allocatedBy?.fullName}
                </p>
                <p className="text-sm text-gray-400">
                  Allocation date:{" "}
                  {new Date(allocation.allocationDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-400">
                  Return date:{" "}
                  {allocation.returnDate
                    ? new Date(allocation.returnDate).toLocaleDateString()
                    : "Not returned"}
                </p>
                <p className="text-sm text-gray-400">
                  Return condition: {allocation.returnCondition}
                </p>
                <p className="text-sm text-gray-400">
                  Received by: {allocation.receivingAdmin?.fullName}
                </p>
                <p className="text-sm text-gray-400">
                  Remarks: {allocation.remarks}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
