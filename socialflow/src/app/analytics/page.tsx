"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Facebook, Instagram, Users, Eye, Heart, MessageCircle, Share, Calendar } from "lucide-react"
import {
  apiClient,
  type AuthStatus,
  type AnalyticsOverview,
  type FacebookPage,
  type InstagramAccount,
} from "../../lib/api"

interface FacebookPost {
  id: string
  message?: string
  created_time?: string
  full_picture?: string
  permalink_url?: string
}

interface FacebookInsights {
  report: {
    pageLikes: { data: Array<{ values: Array<{ value: number; end_time?: string }> }> }
    pageReach: { data: Array<{ values: Array<{ value: number; end_time?: string }> }> }
    totalEngagement: { data: Array<{ values: Array<{ value: number; end_time?: string }> }> }
    pageImpressions: { data: Array<{ values: Array<{ value: number; end_time?: string }> }> }
  }
}

export default function AnalyticsPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ facebook: false, instagram: false })
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null)
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<InstagramAccount | null>(null)
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([])
  const [facebookInsights, setFacebookInsights] = useState<FacebookInsights | null>(null)
  const [activeTab, setActiveTab] = useState<'facebook' | 'instagram'>('facebook')
  const [isLoading, setIsLoading] = useState(true)

  const isCurrentPlatformConnected = activeTab === 'facebook' 
    ? (authStatus.facebook && selectedFacebookPage) 
    : (authStatus.instagram && selectedInstagramAccount)

  const fetchAuthStatus = async () => {
    try {
      const status = await apiClient.getAuthStatus()
      setAuthStatus(status)
    } catch (error) {
      console.error("Failed to fetch auth status:", error)
    }
  }

  const fetchSelectedFacebookPage = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/facebook/selected-page')
      if (response.ok) {
        const pageData = await response.json()
        setSelectedFacebookPage(pageData)
      }
    } catch (error) {
      console.error("Failed to fetch selected Facebook page:", error)
    }
  }

  const fetchFacebookPages = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/facebook/pages')
      if (response.ok) {
        const pages = await response.json()
        setFacebookPages(Array.isArray(pages) ? pages : [pages])
        
        if (pages.length > 0 && !selectedFacebookPage) {
          setSelectedFacebookPage(pages[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch Facebook pages:", error)
    }
  }

  const fetchFacebookInsights = async (pageId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/analytics/facebook/page-insights?pageId=${pageId}`)
      if (response.ok) {
        const insights = await response.json()
        setFacebookInsights(insights)
      }
    } catch (error) {
      console.error("Failed to fetch Facebook insights:", error)
    }
  }

  const fetchFacebookPosts = async (pageId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/social/analytics/facebook/posts?pageId=${pageId}&limit=10`)
      if (response.ok) {
        const postsData = await response.json()
        setFacebookPosts(postsData.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch Facebook posts:", error)
    }
  }

  const fetchAnalytics = async () => {
    if (!isCurrentPlatformConnected) {
      setAnalytics(null)
      return
    }

    try {
      const params: any = {}
      if (activeTab === 'facebook' && selectedFacebookPage) {
        // Pass only the page ID as a string
        params.fbPageId = selectedFacebookPage.id
      } else if (activeTab === 'instagram' && selectedInstagramAccount) {
        params.igAccountId = selectedInstagramAccount.id
      }

      console.log("Fetching analytics with params:", params)
      const analyticsData = await apiClient.getAnalyticsOverview(params)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const handleFacebookPageChange = async (pageId: string) => {
    const page = facebookPages.find(p => p.id === pageId)
    if (page) {
      setSelectedFacebookPage(page)
      
      // Update selected page on backend
      try {
        await fetch('http://localhost:3001/auth/facebook/select-page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pageId }),
        })
      } catch (error) {
        console.error("Failed to update selected page:", error)
      }

      // Fetch data for the new page sequentially
      try {
        await fetchFacebookInsights(pageId)
        await fetchFacebookPosts(pageId)
        await fetchAnalytics()
      } catch (error) {
        console.error("Failed to fetch page data:", error)
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchAuthStatus()
      setIsLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (authStatus.facebook && activeTab === 'facebook') {
      Promise.all([
        fetchSelectedFacebookPage(),
        fetchFacebookPages()
      ])
    }
  }, [authStatus, activeTab])

  useEffect(() => {
    if (selectedFacebookPage && activeTab === 'facebook') {
      // Fetch data sequentially instead of in parallel
      const fetchSequentially = async () => {
        try {
          await fetchFacebookInsights(selectedFacebookPage.id)
          await fetchFacebookPosts(selectedFacebookPage.id)
          await fetchAnalytics()
        } catch (error) {
          console.error("Failed to fetch Facebook data:", error)
        }
      }
      fetchSequentially()
    }
  }, [selectedFacebookPage, activeTab])

  const sumInsightValues = (insightData: Array<{ values: Array<{ value: number }> }>) => {
    return insightData.reduce((total, item) => {
      return total + item.values.reduce((sum, val) => sum + (val.value || 0), 0)
    }, 0)
  }

  const renderFacebookAnalytics = () => {
    if (!authStatus.facebook) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Facebook className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Facebook Account</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect your Facebook account to view detailed analytics and insights.
          </p>
          <Button 
            onClick={() => window.open(apiClient.getFacebookAuthUrl(), "_blank")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Connect Facebook
          </Button>
        </div>
      )
    }

    const fbData = analytics?.platformBreakdown?.facebook
    const pageReach = fbData?.reach || 0
    const totalEngagement = fbData?.engagement || 0
    const pageFollowers = fbData?.followers || 0
    const weeklyGrowth = analytics?.weeklyGrowth

    return (
      <div className="space-y-6">
        {/* Page Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Facebook className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Facebook Page Analytics</CardTitle>
                  <CardDescription>Select a page to view its analytics</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {facebookPages.length > 0 && (
                  <Select
                    value={selectedFacebookPage?.id || ""}
                    onValueChange={handleFacebookPageChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {facebookPages.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Badge variant="default">Connected</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {selectedFacebookPage && (
          <>
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Reach</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pageReach.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{weeklyGrowth?.reach?.toFixed(1) || "—"}% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalEngagement.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{weeklyGrowth?.engagement?.toFixed(1) || "—"}% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Followers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pageFollowers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{weeklyGrowth?.followers?.toFixed(1) || "—"}% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalReach?.toLocaleString() || "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Combined platforms
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Post */}
            {analytics?.topPerformingPost && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Post</CardTitle>
                  <CardDescription>Your best performing post this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">{analytics.topPerformingPost.content}</p>
                    <div className="flex space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {analytics.topPerformingPost.likes} likes
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {analytics.topPerformingPost.comments} comments
                      </span>
                      <span className="flex items-center">
                        <Share className="h-4 w-4 mr-1" />
                        {analytics.topPerformingPost.shares} shares
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Latest posts from {selectedFacebookPage.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facebookPosts.length > 0 ? (
                    facebookPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start space-x-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Facebook className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{selectedFacebookPage.name}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                {post.created_time ? new Date(post.created_time).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              {post.message || "No message content"}
                            </p>
                            {post.full_picture && (
                              <div className="mt-2">
                                <img 
                                  src={post.full_picture} 
                                  alt="Post image" 
                                  className="rounded-lg max-w-md max-h-48 object-cover"
                                />
                              </div>
                            )}
                            <div className="flex space-x-6 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                View details
                              </span>
                              {post.permalink_url && (
                                <a 
                                  href={post.permalink_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <Share className="h-4 w-4 mr-1" />
                                  View on Facebook
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No posts found for this page</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    )
  }

  const renderInstagramAnalytics = () => {
    if (!authStatus.instagram || !selectedInstagramAccount) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Instagram className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Instagram Account</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect and select an Instagram business account to view detailed analytics and insights.
          </p>
          <Button 
            onClick={() => window.open(apiClient.getInstagramAuthUrl(), "_blank")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Instagram className="h-4 w-4 mr-2" />
            Connect Instagram
          </Button>
        </div>
      )
    }

    return <div>Instagram analytics coming soon...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Monitor your social media performance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab('facebook')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'facebook'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'instagram'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Instagram className="h-4 w-4 mr-2" />
              Instagram
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading analytics...</div>
            </div>
          ) : (
            <>
              {activeTab === 'facebook' && renderFacebookAnalytics()}
              {activeTab === 'instagram' && renderInstagramAnalytics()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
