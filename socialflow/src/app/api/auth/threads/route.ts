// src/app/api/auth/threads/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        const clientId = process.env.NEXT_PUBLIC_THREADS_APP_ID
        const clientSecret = process.env.THREADS_APP_SECRET
        const redirectUri = process.env.THREAD_REDIRECT_URI;

        // Debug logging to verify values are loaded
        console.log("Threads Auth Debug:", {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            redirectUri: redirectUri, // Check if this matches your browser URL exactly
        });

        if (!clientId || !clientSecret || !redirectUri) {
            console.error("Missing Threads credentials in .env");
            return NextResponse.json({ error: "Threads app credentials not configured" }, { status: 500 })
        }

        const tokenResponse = await fetch(
            `https://graph.threads.net/oauth/access_token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: "authorization_code",
                    redirect_uri: redirectUri,
                    code: code,
                }),
            }
        )

        if (!tokenResponse.ok) {
            // This line is crucial: it gets the actual error message from Threads
            const errorText = await tokenResponse.text();
            console.error("❌ Threads Token Exchange Failed. Response:", errorText);
            throw new Error(`Threads API Error: ${errorText}`);
        }

        const tokenData = await tokenResponse.json()

        return NextResponse.json({
            access_token: tokenData.access_token,
            user_id: tokenData.user_id,
            expires_in: 0,
        })
    } catch (error) {
        console.error("Threads OAuth error handler:", error)
        // Return the actual error message to the frontend
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Authentication failed"
        }, { status: 500 })
    }
}