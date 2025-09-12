// src/app/api/uploads/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const contentType = searchParams.get("contentType");

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Filename and Content-Type are required" }, { status: 400 });
  }

  // Add this check to ensure the body is not null
  if (!request.body) {
    return NextResponse.json({ error: "Request body is required" }, { status: 400 });
  }

  const blob = await put(filename, request.body, {
    contentType,
    access: 'public',
  });

  return NextResponse.json(blob);
}