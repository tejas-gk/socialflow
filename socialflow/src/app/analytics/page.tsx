'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { apiClient } from '@/lib/api'
import FacebookAnalytics from '@/components/analytics/facebook-analytics'
import InstagramAnalytics from '@/components/analytics/instagram-analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Facebook, Instagram, TrendingUp, Wifi, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Check connection status for both platforms
  const { data: connectionStatus } = useSWR(
    'connection-status',
    () => apiClient.getConnectionStatus(),
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  // Check for Instagram accounts
  const { data: instagramAccounts } = useSWR(
    'ig-accounts',
    () => apiClient.getInstagramAccounts().catch(() => [])
  )

  // Check for Facebook pages
  const { data: facebookPages } = useSWR(
    'fb-pages',
    () => apiClient.getFacebookPagesAnalytics().catch(() => ({ data: [] }))
  )

  const hasInstagramAccounts = (instagramAccounts?.length ?? 0) > 0
  const hasFacebookPages = (facebookPages?.data?.length ?? 0) > 0
  const isInstagramConnected = connectionStatus?.instagram?.connected
  const isFacebookConnected = connectionStatus?.facebook?.connected

  // Auto-switch to first available platform if overview is selected but no data
  useEffect(() => {
    if (activeTab === 'overview') {
      if (isFacebookConnected && hasFacebookPages) {
        // Stay on overview - we have data to show
      } else if (isInstagramConnected && hasInstagramAccounts) {
        // Stay on overview - we have data to show
      }
    }
  }, [activeTab, isFacebookConnected, hasFacebookPages, isInstagramConnected, hasInstagramAccounts])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header - Matching Dashboard Style */}
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
              <h1 className="text-2xl font-black font-serif text-primary">Analytics Dashboard</h1>
              <Badge variant="secondary" className="hidden md:inline-flex">
                Pro
              </Badge>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* --- START OF FIX --- */}
              <Button
                size="sm"
                className={`${isFacebookConnected ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"} text-white`}
                onClick={() => window.location.href = apiClient.getFacebookAuthUrl()}
                title={isFacebookConnected ? "Facebook Connected" : "Connect Facebook"}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                size="sm"
                className={`${isInstagramConnected ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"} text-white`}
                onClick={() => window.location.href = apiClient.getInstagramAuthUrl()}
                title={isInstagramConnected ? "Instagram Connected" : "Connect Instagram"}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              {/* --- END OF FIX --- */}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif">Analytics Overview</h2>
            <p className="text-muted-foreground">Monitor your social media performance across all platforms.</p>
          </div>

          {/* Quick Stats - Dashboard Style Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-all duration-200 border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facebook Pages</CardTitle>
                <Facebook className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {isFacebookConnected ? (hasFacebookPages ? facebookPages?.data?.length : '0') : 'Not Connected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFacebookConnected ? 'Pages available' : 'Connect to view pages'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instagram Accounts</CardTitle>
                <Instagram className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {isInstagramConnected ? (hasInstagramAccounts ? instagramAccounts?.length : '0') : 'Not Connected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isInstagramConnected ? 'Accounts available' : 'Connect to view accounts'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
                <Wifi className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {(isFacebookConnected ? 1 : 0) + (isInstagramConnected ? 1 : 0)} / 2
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFacebookConnected && isInstagramConnected ? 'All platforms connected' : 'Some platforms need connection'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics Health</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {(hasFacebookPages || hasInstagramAccounts) ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(hasFacebookPages || hasInstagramAccounts) ? 'Data available' : 'Connect accounts first'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Analytics Section */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <CardTitle className="font-serif">Platform Analytics</CardTitle>
                </div>
              </div>
              <CardDescription>
                Detailed analytics and insights for your connected social media platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="overview" className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="facebook"
                    disabled={!isFacebookConnected || !hasFacebookPages}
                    className="flex items-center space-x-2"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                    {hasFacebookPages && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {facebookPages?.data?.length ?? 0}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="instagram"
                    disabled={!isInstagramConnected || !hasInstagramAccounts}
                    className="flex items-center space-x-2"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                    {hasInstagramAccounts && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {instagramAccounts?.length ?? 0}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {/* Facebook Overview */}
                    <Card className="border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Facebook className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg">Facebook</CardTitle>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${isFacebookConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Status: {isFacebookConnected ?
                              <span className="text-green-600 font-medium">Connected</span> :
                              <span className="text-red-600 font-medium">Not Connected</span>
                            }
                          </p>
                          {isFacebookConnected && (
                            <p className="text-sm text-muted-foreground">
                              Pages: {hasFacebookPages ? facebookPages?.data?.length ?? 0 : 0}
                            </p>
                          )}
                        </div>
                        <div className="mt-4">
                          {isFacebookConnected && hasFacebookPages ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('facebook')}
                            >
                              View Analytics
                            </Button>
                          ) : (
                            // --- START OF FIX ---
                            <Button
                              size="sm"
                              onClick={() => window.location.href = apiClient.getFacebookAuthUrl()}
                            >
                              {!isFacebookConnected ? 'Connect Facebook' : 'Add Pages'}
                            </Button>
                            // --- END OF FIX ---
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Instagram Overview */}
                    <Card className="border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-5 w-5 text-pink-600" />
                            <CardTitle className="text-lg">Instagram</CardTitle>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${isInstagramConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Status: {isInstagramConnected ?
                              <span className="text-green-600 font-medium">Connected</span> :
                              <span className="text-red-600 font-medium">Not Connected</span>
                            }
                          </p>
                          {isInstagramConnected && (
                            <p className="text-sm text-muted-foreground">
                              Accounts: {hasInstagramAccounts ? instagramAccounts?.length : 0}
                            </p>
                          )}
                        </div>
                        <div className="mt-4">
                          {isInstagramConnected && hasInstagramAccounts ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('instagram')}
                            >
                              View Analytics
                            </Button>
                          ) : (
                            // --- START OF FIX ---
                            <Button
                              size="sm"
                              onClick={() => window.location.href = apiClient.getInstagramAuthUrl()}
                            >
                              {!isInstagramConnected ? 'Connect Instagram' : 'Add Accounts'}
                            </Button>
                            // --- END OF FIX ---
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="facebook" className="mt-0">
                  {isFacebookConnected && hasFacebookPages ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Facebook Analytics</h3>
                          <p className="text-sm text-muted-foreground">
                            Analytics for {facebookPages?.data?.length ?? 0} Facebook {(facebookPages?.data?.length === 1 ? 'page' : 'pages')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {facebookPages?.data?.length ?? 0} {(facebookPages?.data?.length === 1 ? 'page' : 'pages')}
                        </Badge>
                      </div>
                      <FacebookAnalytics />
                    </div>
                  ) : (
                    <EmptyState platform="Facebook" />
                  )}
                </TabsContent>

                <TabsContent value="instagram" className="mt-0">
                  {isInstagramConnected && hasInstagramAccounts ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Instagram Analytics</h3>
                          <p className="text-sm text-muted-foreground">
                            Analytics for {(instagramAccounts?.length ?? 0)} Instagram {(instagramAccounts?.length === 1 ? 'account' : 'accounts')}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {(instagramAccounts?.length ?? 0)} {(instagramAccounts?.length === 1 ? 'account' : 'accounts')}
                        </Badge>
                      </div>
                      <InstagramAnalytics />
                    </div>
                  ) : (
                    <EmptyState platform="Instagram" />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ platform }: { platform: string }) {
  const Icon = platform === 'Facebook' ? Facebook : Instagram
  const colorClass = platform === 'Facebook' ? 'text-blue-600' : 'text-pink-600'
  const bgClass = platform === 'Facebook' ? 'bg-blue-50' : 'bg-gradient-to-r from-purple-50 to-pink-50'

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`w-16 h-16 ${bgClass} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2">No {platform} Data</h3>
      <p className="text-muted-foreground text-center mb-4">
        Connect your {platform} account and add {platform === 'Facebook' ? 'pages' : 'business accounts'} to view analytics.
      </p>
      {/* --- START OF FIX --- */}
      <Button onClick={() => window.location.href = platform === 'Facebook' ? apiClient.getFacebookAuthUrl() : apiClient.getInstagramAuthUrl()}>
        Manage Connections
      </Button>
      {/* --- END OF FIX --- */}
    </div>
  )
}