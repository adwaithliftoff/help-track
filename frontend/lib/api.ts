export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error.message || "Request failed");
  }
  return res.json();
}
