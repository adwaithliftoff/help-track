import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/login(.*)"]);
const isAdminRoute = createRouteMatcher(["/", "/employees(.*)", "/assets(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { isAuthenticated, has, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }
  if (isAdminRoute(req) && !has({ role: "org:admin" })) {
    return NextResponse.redirect(new URL("/tickets", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
