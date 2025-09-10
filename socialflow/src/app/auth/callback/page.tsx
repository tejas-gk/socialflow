// src/app/auth/callback/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { PageSelection } from "@/components/page-selection"
import { api } from "@/lib/api"

interface FacebookPage {
  id: string
  name: string
  category: string
  access_token: string
  tasks: string[]
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "page-selection">("loading")
  const [message, setMessage] = useState("")
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [isSelectingPage, setIsSelectingPage] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const platform = searchParams.get("platform")
    const pagesParam = searchParams.get("pages")

    if (error) {
      setStatus("error")
      setMessage(getErrorMessage(error))
      return
    }

    if (success && platform) {
      if (platform === "facebook" && pagesParam) {
        try {
          const facebookPages = JSON.parse(decodeURIComponent(pagesParam))
          if (facebookPages.length > 1) {
            setPages(facebookPages)
            setStatus("page-selection")
            setMessage("Please select which Facebook page you'd like to connect:")
            return
          } else if (facebookPages.length === 1) {
            // Auto-select if only one page
            handlePageSelection(facebookPages[0].id)
            return
          }
        } catch (e) {
          console.error("Failed to parse pages:", e)
        }
      }

      setStatus("success")
      setMessage(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`)

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } else {
      setStatus("error")
      setMessage("Invalid authentication response")
    }
  }, [searchParams, router])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "no_code":
        return "Authentication was cancelled or failed"
      case "facebook_auth_failed":
        return "Facebook authentication failed"
      case "instagram_auth_failed":
        return "Instagram authentication failed"
      default:
        return "Authentication failed"
    }
  }

  const handlePageSelection = async (pageId: string) => {
    setIsSelectingPage(true)
    // --- START OF FIX ---
    const userId = searchParams.get("userId")
    if (!userId) {
      setStatus("error")
      setMessage("Authentication failed: User ID not found. Please try again.")
      setIsSelectingPage(false)
      return
    }
    // --- END OF FIX ---
    try {
      console.log("[v0] Selecting Facebook page:", pageId)
      // --- START OF FIX ---
      const response = await api.selectFacebookPage(pageId, userId)
      // --- END OF FIX ---
      console.log("[v0] Page selection response:", response)

      if (response.success) {
        setStatus("success")
        setMessage("Facebook page connected successfully!")

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        throw new Error(response.message || "Failed to connect page")
      }
    } catch (error) {
      console.error("[v0] Page selection error:", error)
      setStatus("error")
      const errorMessage = error instanceof Error ? error.message : "Failed to connect Facebook page"
      setMessage(`Authentication Failed: ${errorMessage}`)
    } finally {
      setIsSelectingPage(false)
    }
  }

  if (status === "page-selection") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PageSelection pages={pages} onPageSelect={handlePageSelection} isLoading={isSelectingPage} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle>
            {status === "loading" && "Processing Authentication..."}
            {status === "success" && "Authentication Successful!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status !== "loading" && (
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}