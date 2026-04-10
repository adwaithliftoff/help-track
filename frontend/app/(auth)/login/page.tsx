"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ officialEmail: email, password }),
    });
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="p-8 rounded-2xl shadow-md w-full max-w-sm space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center">Login</h1>

        <div>
          <label className="text-xs tracking-widest text-gray-500 uppercase block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs tracking-widest text-gray-500 uppercase block mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-black text-white rounded-lg hover:opacity-90 transition"
        >
          Login
        </button>
      </form>
    </main>
  );
}