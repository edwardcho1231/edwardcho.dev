import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPublisher } from "@/lib/publisher-auth";

const isEditorRoute = createRouteMatcher([
  "/documents(.*)",
  "/api/v1/documents(.*)",
  "/api/v1/revisions(.*)",
  "/api/v1/images/upload",
  "/api/v1/images/register",
]);

function isApiRequest(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export default clerkMiddleware(async (auth, request) => {
  if (!isEditorRoute(request)) {
    return NextResponse.next();
  }

  const isApiRoute = isApiRequest(request.nextUrl.pathname);
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    return redirectToSignIn();
  }

  if (isPublisher(userId)) {
    return NextResponse.next();
  }

  if (isApiRoute) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You do not have access to the editor workspace",
        },
      },
      { status: 403 },
    );
  }

  return NextResponse.redirect(new URL("/", request.url));
});

export const config = {
  matcher: [
    "/documents/:path*",
    "/api/v1/documents/:path*",
    "/api/v1/revisions/:path*",
    "/api/v1/images/upload",
    "/api/v1/images/register",
  ],
};
