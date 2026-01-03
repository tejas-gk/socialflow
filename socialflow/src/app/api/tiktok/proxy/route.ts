import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const TIKTOK_API_URL = "https://open.tiktokapis.com/v2";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const endpoint = searchParams.get("endpoint")
        const params = searchParams.get("params")

        const authHeader = request.headers.get("Authorization")

        if (!authHeader) {
            return NextResponse.json({ error: "No access token provided" }, { status: 401 })
        }

        if (!endpoint) {
            return NextResponse.json({ error: "No endpoint specified" }, { status: 400 })
        }

        let url = `${TIKTOK_API_URL}${endpoint}`
        if (params) {
            url += `?${params}`
        }

        const response = await fetch(url, {
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error("TikTok Proxy Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const endpoint = searchParams.get("endpoint")
        const authHeader = request.headers.get("Authorization")

        let body;
        try {
            body = await request.json()
        } catch (e) {
            body = {}
        }

        if (!authHeader || !endpoint) {
            return NextResponse.json({ error: "Missing token or endpoint" }, { status: 400 })
        }

        const params = searchParams.get("params")

        let url = `${TIKTOK_API_URL}${endpoint}`
        if (params) {
            url += `?${params}`
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error("TikTok Proxy POST Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
