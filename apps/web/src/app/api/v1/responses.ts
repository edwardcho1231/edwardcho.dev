import { NextResponse } from "next/server";

export function unauthorizedResponse() {
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

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message,
      },
    },
    { status: 403 },
  );
}

export function internalServerErrorResponse(message = "Internal server error") {
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
      },
    },
    { status: 500 },
  );
}
