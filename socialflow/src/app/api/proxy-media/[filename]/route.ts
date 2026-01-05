import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const arrayBuffer = await response.arrayBuffer();

        return new NextResponse(arrayBuffer, {
            headers: {
                // Ensure we return a valid image content type
                "Content-Type": contentType.includes("image") ? contentType : "image/jpeg",
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*", // Allow TikTok to fetch
            },
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
