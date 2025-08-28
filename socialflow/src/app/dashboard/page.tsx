"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Plus, Settings, TrendingUp, Facebook, Instagram, Wifi, LogOut } from "lucide-react"
import Link from "next/link"
import { apiClient, type AuthStatus, type AnalyticsOverview, type PostHistoryItem } from "@/lib/api"

export default function DashboardPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ facebook: false, instagram: false })
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [recentPosts, setRecentPosts] = useState<PostHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAuthStatus = async () => {
    try {
      const status = await apiClient.getAuthStatus()
      setAuthStatus(status)
    } catch (error) {
      console.error("Failed to fetch auth status:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await apiClient.getAnalyticsOverview()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const fetchRecentPosts = async () => {
    try {
      const historyData = await apiClient.getPostHistory(1, 3)
      setRecentPosts(historyData.posts)
    } catch (error) {
      console.error("Failed to fetch recent posts:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([fetchAuthStatus(), fetchAnalytics(), fetchRecentPosts()])
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleConnectionChange = () => {
    fetchAuthStatus()
  }

  const totalPosts = analytics ? Math.floor(analytics.totalReach / 500) : 24

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black font-serif text-primary">SocialFlow</h1>
              <Badge variant="secondary" className="hidden md:inline-flex">
                Pro
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif">Welcome back, John!</h2>
            <p className="text-muted-foreground">Manage your Instagram and Facebook presence from one place.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/campaign">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Start Campaign</CardTitle>
                  <Plus className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">Create</div>
                  <p className="text-xs text-muted-foreground">New social media post</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">View History</CardTitle>
                  <History className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{isLoading ? "..." : totalPosts}</div>
                  <p className="text-xs text-muted-foreground">Posts this month</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/test-connection">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Test Connection</CardTitle>
                  <Wifi className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {authStatus.facebook && authStatus.instagram ? "Active" : "Partial"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {authStatus.facebook && authStatus.instagram
                      ? "All platforms connected"
                      : "Some platforms need connection"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {isLoading ? "..." : `+${analytics?.weeklyGrowth.engagement.toFixed(1)}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">Engagement this week</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Recent Activity</CardTitle>
              <CardDescription>Your latest social media posts and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading recent activity...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                          {post.platforms.includes("Instagram") && <Instagram className="h-5 w-5 text-accent" />}
                          {post.platforms.includes("Facebook") && !post.platforms.includes("Instagram") && (
                            <Facebook className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{post.content}</p>
                          <p className="text-sm text-muted-foreground">{post.platforms.join(", ")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={post.status === "Posted" ? "default" : "secondary"}>{post.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {post.engagement
                            ? `${(post.engagement.instagram?.likes || 0) + (post.engagement.facebook?.likes || 0)} likes`
                            : post.scheduledAt
                              ? `Scheduled`
                              : "No engagement yet"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
