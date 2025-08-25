"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Facebook, Instagram, CheckCircle, XCircle, Loader2, Wifi, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TestConnectionPage() {
  const [testing, setTesting] = useState(false)
  const [connections, setConnections] = useState([
    { platform: "Facebook", status: "connected", icon: Facebook, lastTest: "2 minutes ago" },
    { platform: "Instagram", status: "connected", icon: Instagram, lastTest: "2 minutes ago" },
  ])

  const testConnections = async () => {
    setTesting(true)
    // Simulate API testing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setConnections((prev) =>
      prev.map((conn) => ({
        ...conn,
        lastTest: "Just now",
      })),
    )
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-black font-serif text-primary">Test Connection</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Wifi className="h-5 w-5 text-accent" />
                API Connection Status
              </CardTitle>
              <CardDescription>
                Test your social media platform connections to ensure everything is working properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connections.map((connection, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                      <connection.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{connection.platform}</p>
                      <p className="text-sm text-muted-foreground">Last tested: {connection.lastTest}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={connection.status === "connected" ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {connection.status === "connected" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {connection.status === "connected" ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Test All Connections</CardTitle>
              <CardDescription>Run a comprehensive test to verify all API connections are working</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testConnections} disabled={testing} className="w-full bg-primary hover:bg-primary/90">
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Connections...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Test All Connections
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/50">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Connection Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ensure your social media accounts are properly linked in Settings</p>
              <p>• Check that API tokens haven&apos;t expired</p>
              <p>• Verify your internet connection is stable</p>
              <p>• Contact support if connections continue to fail</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
