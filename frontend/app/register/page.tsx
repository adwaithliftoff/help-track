"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          employeeNumber: Number(form.employeeNumber),
        }),
      });

      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="p-6 rounded-xl shadow w-96 space-y-3"
      >
        <h1 className="text-xl font-semibold">Register</h1>

        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="input"
        />
        <input
          name="officialEmail"
          placeholder="Email"
          onChange={handleChange}
          className="input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="input"
        />
        <input
          name="employeeNumber"
          placeholder="Employee Number"
          onChange={handleChange}
          className="input"
        />
        <input
          name="department"
          placeholder="Department"
          onChange={handleChange}
          className="input"
        />
        <input
          name="designation"
          placeholder="Designation"
          onChange={handleChange}
          className="input"
        />
        <input
          name="joiningDate"
          type="date"
          onChange={handleChange}
          className="input"
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Register
        </button>
      </form>
    </main>
  );
}
