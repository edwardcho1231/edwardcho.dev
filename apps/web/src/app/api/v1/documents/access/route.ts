import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPublisher } from "@/lib/publisher-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorizedResponse() {
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

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    isPublisher: isPublisher(userId),
  });
}
