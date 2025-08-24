import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  // Placeholder until Chunk 8 implements PDF streaming
  return NextResponse.json(
    { message: "PDF generation will be implemented in Chunk 8" },
    { status: 501 }
  );
}
