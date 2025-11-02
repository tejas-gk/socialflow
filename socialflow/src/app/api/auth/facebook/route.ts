import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
        const clientSecret = process.env.FACEBOOK_APP_SECRET
        const redirectUri = `https://rajgupta.pixelsandgrids.com/auth/facebook/callback`

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: "Facebook app credentials not configured" }, { status: 500 })
        }

        // Exchange code for access token
        const tokenResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`,
        )

        if (!tokenResponse.ok) {
            throw new Error("Failed to exchange code for token")
        }

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error.message)
        }

        // Exchange short-lived token for long-lived token
        const longLivedResponse = await fetch(
            `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`,
        )

        if (!longLivedResponse.ok) {
            throw new Error("Failed to get long-lived token")
        }

        const longLivedData = await longLivedResponse.json()

        return NextResponse.json({
            access_token: longLivedData.access_token,
            expires_in: longLivedData.expires_in,
        })
    } catch (error) {
        console.error("Facebook OAuth error:", error)
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
}
