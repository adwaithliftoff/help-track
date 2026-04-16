import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.nextUrl));

  const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;
    const id = payload.sub;
    if (role === "EMPLOYEE") {
      if (pathname === `/employees/${id}`) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(`/employees/${id}`, req.nextUrl));
    }
    return NextResponse.next();
  } catch {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
      },
    );
    if (!refreshRes.ok) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }
    const setCookie = refreshRes.headers.get("set-cookie");
    const res = NextResponse.redirect(req.nextUrl);
    if (setCookie) res.headers.append("set-cookie", setCookie);
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js)$).*)",
  ],
};
