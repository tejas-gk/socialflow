"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function FacebookCallbackInner() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        if (error) {
            console.error("OAuth error:", error)
            window.close()
            return
        }

        if (code) {
            exchangeCodeForToken(code)
        }
    }, [searchParams])

    const exchangeCodeForToken = async (code: string) => {
        try {
            const response = await fetch("/api/auth/facebook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            })

            if (!response.ok) throw new Error("Failed to authenticate")

            const data = await response.json()

            if (data.access_token) {
                localStorage.setItem("facebook_access_token", data.access_token)
                window.close()
            } else {
                console.error("Failed to get access token:", data)
                window.close()
            }
        } catch (error) {
            console.error("Token exchange error:", error)
            window.close()
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Connecting your Facebook account...</p>
            </div>
        </div>
    )
}
