"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    officialEmail: "",
    password: "",
    fullName: "",
    employeeNumber: "",
    department: "",
    designation: "",
    joiningDate: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            employeeNumber: Number(form.employeeNumber),
          }),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? "Registration failed");
      }
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="h-full flex items-center justify-center px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-2xl bg-zinc-900 p-8 shadow-md"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Register</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Full Name
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>{" "}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Email
            </label>
            <input
              name="officialEmail"
              type="email"
              value={form.officialEmail}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Employee Number
            </label>
            <input
              name="employeeNumber"
              type="number"
              value={form.employeeNumber}
              onChange={handleChange}
              placeholder="1001"
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Department
            </label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="IT"
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Designation
            </label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Software Engineer"
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-gray-500">
              Joining Date
            </label>
            <input
              name="joiningDate"
              type="date"
              value={form.joiningDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>{" "}
        </div>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-black py-2.5 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
