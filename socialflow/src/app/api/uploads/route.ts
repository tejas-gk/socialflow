import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const token = process.env.BLOB_READ_WRITE_TOKEN || "";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  try {
    // Ensure request.body is not null
    if (!request.body) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 });
    }
    // Upload the raw request body (file) directly to Vercel Blob
    const blob = await put(filename, request.body, {
      access: "public",
      token,
      addRandomSuffix: true, // prevents name collisions
    });

    return NextResponse.json(blob);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
