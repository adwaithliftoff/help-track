import { cookies } from "next/headers";
import Sidebar from "../components/Sidebar";
import { jwtVerify } from "jose";
import { AuthProvider } from "@/providers/AuthProvider";

type User = {
  id: number;
  role: "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN";
  fullName: string;
  officialEmail: string;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("access_token")?.value;
  const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
  let user = null;
  if (token) {
    const { payload } = await jwtVerify(token, secret);
    user = {
      id: Number(payload.sub),
      role: payload.role as User["role"],
      fullName: payload.name as string,
      officialEmail: payload.email as string,
      empNo: Number(payload.empNo),
      dept: payload.dept as string,
    };
  }

  return (
    <AuthProvider user={user}>
      <div className="flex h-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AuthProvider>
  );
}
