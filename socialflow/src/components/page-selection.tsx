"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Facebook, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FacebookPage {
  id: string
  name: string
  category: string
  access_token: string
  tasks: string[]
}

interface PageSelectionProps {
  pages: FacebookPage[]
  onPageSelect: (pageId: string) => void
  isLoading?: boolean
}

export function PageSelection({ pages, onPageSelect, isLoading = false }: PageSelectionProps) {
  const [selectedPageId, setSelectedPageId] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSelectPage = async () => {
    if (selectedPageId) {
      try {
        setError("")
        console.log("[v0] Attempting to connect page:", selectedPageId)
        await onPageSelect(selectedPageId)
      } catch (err) {
        console.error("[v0] Page selection failed:", err)
        setError("Failed to connect to the selected page. Please try again.")
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Facebook className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Select Facebook Page</h2>
        </div>
        <p className="text-muted-foreground">Choose which Facebook page you&apos;d like to connect to SocialFlow</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 mb-6">
        {pages.map((page) => (
          <Card
            key={page.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPageId === page.id ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-gray-300"
            }`}
            onClick={() => setSelectedPageId(page.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{page.name}</CardTitle>
                  <CardDescription className="capitalize">{page.category.replace(/_/g, " ")}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-1">
                  {page.tasks.slice(0, 3).map((task, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {task}
                    </Badge>
                  ))}
                  {page.tasks.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{page.tasks.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSelectPage} disabled={!selectedPageId || isLoading} className="flex-1">
          {isLoading ? "Connecting..." : "Connect Selected Page"}
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
