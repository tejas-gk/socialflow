import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { code, redirect_uri } = await request.json()

        const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET
        const redirectUri = redirect_uri || process.env.TIKTOK_REDIRECT_URI;

        if (!clientKey || !clientSecret) {
            return NextResponse.json({ error: "TikTok app credentials not configured" }, { status: 500 })
        }

        const params = new URLSearchParams({
            client_key: clientKey,
            client_secret: clientSecret,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri!,
        });

        const tokenResponse = await fetch(
            `https://open.tiktokapis.com/v2/oauth/token/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
            }
        )

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error("TikTok token exchange error:", errorData)
            throw new Error(errorData.message || "Failed to exchange code for token")
        }

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error_description || tokenData.error)
        }

        return NextResponse.json({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            refresh_token: tokenData.refresh_token,
            scope: tokenData.scope,
            token_type: tokenData.token_type,
            open_id: tokenData.open_id
        })
    } catch (error) {
        console.error("TikTok OAuth error:", error)
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
}
