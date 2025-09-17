// src/app/auth/callback/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { PageSelection } from "@/components/page-selection"
import { api, type FacebookPage } from "@/lib/api"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "page-selection">("loading")
  const [message, setMessage] = useState("Processing authentication...")
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [isSelectingPage, setIsSelectingPage] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "no_code":
        return "Authentication was cancelled or failed"
      case "facebook_auth_failed":
        return "Facebook authentication failed. Please try again."
      case "instagram_auth_failed":
        return "Instagram authentication failed. Please try again."
      default:
        return "An unknown authentication error occurred."
    }
  }

  const handlePageSelection = async (pageId: string) => {
    setIsSelectingPage(true)
    const userId = searchParams.get("userId")
    if (!userId) {
      setStatus("error")
      setMessage("Authentication failed: User ID not found. Please try again.")
      setIsSelectingPage(false)
      return
    }
    
    try {
      const response = await api.selectFacebookPage(pageId, userId)
      if (response.success) {
        setStatus("success")
        setMessage("Facebook page connected successfully!")
        setTimeout(() => router.push("/dashboard"), 2000)
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

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const platform = searchParams.get("platform")
    const userId = searchParams.get("userId")

    const handleFacebookSuccess = async () => {
      if (!userId) {
        setStatus("error");
        setMessage("Authentication session is invalid. Please try connecting again from the dashboard.");
        return;
      }
      try {
        setMessage("Fetching your Facebook pages...")
        console.log("[v0] Fetching Facebook pages for userId:", userId)
        const facebookPages = await api.getFacebookPages(userId)
        
        if (facebookPages && facebookPages.length > 1) {
          setPages(facebookPages)
          setStatus("page-selection")
        } else if (facebookPages && facebookPages.length === 1) {
          await handlePageSelection(facebookPages[0].id)
        } else {
          setStatus("success")
          setMessage("Facebook connected, but no manageable pages were found.")
          setTimeout(() => router.push("/dashboard"), 3000)
        }
      } catch (e) {
        setStatus("error")
        setMessage("Failed to retrieve your pages after connection. Please try again from the dashboard.")
      }
    }

    if (error) {
      setStatus("error")
      setMessage(getErrorMessage(error))
      return
    }

    if (success && platform) {
      if (platform === "facebook") {
        handleFacebookSuccess()
      } else {
        setStatus("success")
        setMessage(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully!`)
        setTimeout(() => router.push("/dashboard"), 2000)
      }
    } else {
      setStatus("error")
      setMessage("Invalid authentication response received.")
    }
  }, [searchParams, router])


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