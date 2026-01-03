"use client"

export const dynamic = "force-dynamic"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function TikTokCallbackInner() {
    const searchParams = useSearchParams()

    const processedCode = useRef<string | null>(null)

    useEffect(() => {
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        if (error) {
            console.error("OAuth error:", error)
            window.close()
            return
        }

        if (code && processedCode.current !== code) {
            processedCode.current = code
            exchangeCodeForToken(code)
        }
    }, [searchParams])

    const exchangeCodeForToken = async (code: string) => {
        try {
            const response = await fetch("/api/auth/tiktok", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    redirect_uri: `${window.location.origin}/auth/tiktok/callback`
                }),
            })

            if (!response.ok) throw new Error("Failed to authenticate")

            const data = await response.json()

            if (data.access_token) {
                localStorage.setItem("tiktok_access_token", data.access_token)
                if (data.refresh_token) {
                    localStorage.setItem("tiktok_refresh_token", data.refresh_token)
                }

                // Send message to opener window before closing
                setTimeout(() => {
                    if (window.opener) {
                        try {
                            window.opener.postMessage(
                                { type: "tiktok_oauth_success", token: data.access_token },
                                window.location.origin
                            )
                        } catch (e) {
                            console.error("Failed to send postMessage:", e)
                        }
                    }
                    try {
                        window.close()
                    } catch (e) {
                        console.error("Failed to close window:", e)
                    }
                }, 100)
            } else {
                console.error("Failed to get access token:", data)
                if (window.opener) {
                    try {
                        window.opener.postMessage(
                            { type: "tiktok_oauth_error", error: "Failed to get access token" },
                            window.location.origin
                        )
                    } catch (e) {
                        console.error("Failed to send postMessage:", e)
                    }
                }
                try {
                    window.close()
                } catch (e) {
                    console.error("Failed to close window:", e)
                }
            }
        } catch (error) {
            console.error("Token exchange error:", error)
            if (window.opener) {
                try {
                    window.opener.postMessage(
                        { type: "tiktok_oauth_error", error: error instanceof Error ? error.message : "Authentication failed" },
                        window.location.origin
                    )
                } catch (e) {
                    console.error("Failed to send postMessage:", e)
                }
            }
            try {
                window.close()
            } catch (e) {
                console.error("Failed to close window:", e)
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p>Connecting your TikTok account...</p>
            </div>
        </div>
    )
}
