import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        const clientId = process.env.NEXT_PUBLIC_PINTEREST_APP_ID
        const clientSecret = process.env.PINTEREST_APP_SECRET
        const redirectUri = process.env.PINTEREST_REDIRECT_URI;

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: "Pinterest app credentials not configured" }, { status: 500 })
        }

        // Exchange code for access token
        const tokenResponse = await fetch(
            `https://api.pinterest.com/v5/oauth/token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    code: code,
                }),
            }
        )

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error("Pinterest token exchange error:", errorData)
            throw new Error("Failed to exchange code for token")
        }

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error)
        }

        return NextResponse.json({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            refresh_token: tokenData.refresh_token,
        })
    } catch (error) {
        console.error("Pinterest OAuth error:", error)
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
}

