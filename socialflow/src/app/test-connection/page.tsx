"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Facebook, 
  Instagram, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Wifi, 
  AlertCircle,
  RefreshCw,
  User,
  Users,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "../../lib/api"

type ConnectionStatus = {
  facebook: {
    connected: boolean
    pageSelected: boolean
    pageName?: string
    lastUpdated?: string
  }
  instagram: {
    connected: boolean
    accountSelected: boolean
    username?: string
    lastUpdated?: string
  }
}

type TestResults = {
  facebook: {
    success: boolean
    error?: string
    details?: string
    userInfo?: { id: string; name: string }
    pageTest?: { success: boolean; pageName?: string; error?: string }
    lastTested?: string
  }
  instagram: {
    success: boolean
    error?: string
    details?: string
    accountsFound?: number
    accountTest?: { success: boolean; username?: string; error?: string }
    lastTested?: string
  }
  overall: boolean
}

export default function TestConnectionPage() {
  const [testing, setTesting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [testResults, setTestResults] = useState<TestResults | null>(null)
  const [error, setError] = useState<string>("")

  const loadConnectionStatus = async () => {
    try {
      setLoading(true)
      setError("")
      const status = await apiClient.getConnectionStatus()
      setConnectionStatus(status)
    } catch (error) {
      console.error("Failed to load connection status:", error)
      setError("Failed to load connection status")
    } finally {
      setLoading(false)
    }
  }

  const testConnections = async () => {
    try {
      setTesting(true)
      setError("")
      const results = await apiClient.testConnections()
      setTestResults(results)
      
      // Refresh connection status after testing
      await loadConnectionStatus()
    } catch (error) {
      console.error("Failed to test connections:", error)
      setError("Failed to test connections")
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    loadConnectionStatus()
  }, [])

  const getStatusBadge = (connected: boolean, hasSelection: boolean) => {
    if (!connected) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Not Connected
        </Badge>
      )
    }
    
    if (!hasSelection) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Setup Required
        </Badge>
      )
    }
    
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Connected
      </Badge>
    )
  }

  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`
    return date.toLocaleDateString()
  }

  if (loading) {
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
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <span>Loading connection status...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadConnectionStatus}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Wifi className="h-5 w-5 text-accent" />
                API Connection Status
              </CardTitle>
              <CardDescription>
                Current status of your social media platform connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Facebook Connection */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Facebook</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {connectionStatus?.facebook.connected && connectionStatus.facebook.pageName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Page: {connectionStatus.facebook.pageName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated: {formatLastUpdated(connectionStatus?.facebook.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(
                    connectionStatus?.facebook.connected || false,
                    connectionStatus?.facebook.pageSelected || false
                  )}
                  {testResults?.facebook && (
                    <div className="text-xs text-muted-foreground">
                      Test: {testResults.facebook.lastTested ? 
                        formatLastUpdated(testResults.facebook.lastTested) : 
                        'Not tested'
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram Connection */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {connectionStatus?.instagram.connected && connectionStatus.instagram.username && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>@{connectionStatus.instagram.username}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated: {formatLastUpdated(connectionStatus?.instagram.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(
                    connectionStatus?.instagram.connected || false,
                    connectionStatus?.instagram.accountSelected || false
                  )}
                  {testResults?.instagram && (
                    <div className="text-xs text-muted-foreground">
                      Test: {testResults.instagram.lastTested ? 
                        formatLastUpdated(testResults.instagram.lastTested) : 
                        'Not tested'
                      }
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults && (
            <Card className={`border-border ${testResults.overall ? 'bg-green-50' : 'bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  {testResults.overall ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Test Results
                </CardTitle>
                <CardDescription>
                  {testResults.overall 
                    ? "At least one platform connection is working properly" 
                    : "All platform connections failed"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Facebook Test Results */}
                {testResults.facebook && (
                  <div className="p-3 border rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook
                      </span>
                      <Badge variant={testResults.facebook.success ? "default" : "destructive"}>
                        {testResults.facebook.success ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                    {testResults.facebook.success ? (
                      <div className="text-sm space-y-1">
                        {testResults.facebook.userInfo && (
                          <p className="text-green-700">✓ User: {testResults.facebook.userInfo.name}</p>
                        )}
                        {testResults.facebook.pageTest?.success && (
                          <p className="text-green-700">✓ Page: {testResults.facebook.pageTest.pageName}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm space-y-1">
                        <p className="text-red-700">✗ {testResults.facebook.error}</p>
                        {testResults.facebook.details && (
                          <p className="text-xs text-muted-foreground">{testResults.facebook.details}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Instagram Test Results */}
                {testResults.instagram && (
                  <div className="p-3 border rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        Instagram
                      </span>
                      <Badge variant={testResults.instagram.success ? "default" : "destructive"}>
                        {testResults.instagram.success ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                    {testResults.instagram.success ? (
                      <div className="text-sm space-y-1">
                        <p className="text-green-700">✓ Found {testResults.instagram.accountsFound || 0} business accounts</p>
                        {testResults.instagram.accountTest?.success && (
                          <p className="text-green-700">✓ Account: @{testResults.instagram.accountTest.username}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm space-y-1">
                        <p className="text-red-700">✗ {testResults.instagram.error}</p>
                        {testResults.instagram.details && (
                          <p className="text-xs text-muted-foreground">{testResults.instagram.details}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Test Button */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Test All Connections</CardTitle>
              <CardDescription>
                Run a comprehensive test to verify all API connections are working properly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testConnections} 
                disabled={testing} 
                className="w-full bg-primary hover:bg-primary/90"
              >
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

          {/* Tips */}
          <Card className="border-border bg-muted/50">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Connection Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ensure your social media accounts are properly linked in the dashboard</p>
              <p>• Check that API tokens haven't expired - they may need periodic renewal</p>
              <p>• Verify your internet connection is stable during testing</p>
              <p>• For Instagram, ensure your account is a Business account linked to a Facebook Page</p>
              <p>• Contact support if connections continue to fail after troubleshooting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
