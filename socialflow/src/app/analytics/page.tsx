"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Facebook, Instagram, TrendingUp, Users, Heart } from "lucide-react"
import Link from "next/link"
import {
  apiClient,
  type AnalyticsOverview,
  type FacebookPage,
  type InstagramAccount,
  type TimeSeriesPoint,
} from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import FacebookAnalytics from "@/components/analytics/facebook-analytics"

export default function AnalyticsPage() {
  const [fbPageId, setFbPageId] = useState<string | undefined>(undefined)
  const [igAccountId, setIgAccountId] = useState<string | undefined>(undefined)

  const { data: fbPages } = useSWR<FacebookPage[]>("/auth/facebook/pages", () => apiClient.getFacebookPages(), {
    revalidateOnFocus: false,
  })
  const { data: igAccounts } = useSWR<InstagramAccount[]>(
    "/auth/instagram/accounts",
    () => apiClient.getInstagramAccounts(),
    { revalidateOnFocus: false },
  )

  const {
    data: analytics,
    isLoading,
    error,
  } = useSWR<AnalyticsOverview>(
    ["analytics-overview", fbPageId, igAccountId],
    () => apiClient.getAnalyticsOverview(fbPageId, igAccountId),
    { revalidateOnFocus: false },
  )

  const fbTs = analytics?.details?.facebook?.timeseries
  const igTs = analytics?.details?.instagram?.timeseries

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
              <h1 className="text-2xl font-black font-serif text-primary">Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Selectors */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Data Sources</CardTitle>
              <CardDescription>Select which Facebook page and Instagram account to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fbPage">Facebook Page</Label>
                  <Select value={fbPageId} onValueChange={(v) => setFbPageId(v || undefined)}>
                    <SelectTrigger id="fbPage">
                      <SelectValue placeholder={fbPages?.length ? "Select a page" : "No pages found"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(fbPages || []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="igAccount">Instagram Account</Label>
                  <Select value={igAccountId} onValueChange={(v) => setIgAccountId(v || undefined)}>
                    <SelectTrigger id="igAccount">
                      <SelectValue placeholder={igAccounts?.length ? "Select an account" : "No accounts found"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(igAccounts || []).map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.username || a.name || a.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Total Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : analytics ? Intl.NumberFormat().format(analytics.totalReach) : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analytics ? analytics.weeklyGrowth.reach.toFixed(1) : "—"}% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : analytics ? `${analytics.engagementRate}%` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analytics ? analytics.weeklyGrowth.engagement.toFixed(1) : "—"}% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  Total Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : analytics ? Intl.NumberFormat().format(analytics.totalFollowers) : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analytics ? analytics.weeklyGrowth.followers.toFixed(1) : "—"}% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform performance */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Platform Performance</CardTitle>
              <CardDescription>Compare your performance across Instagram and Facebook</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-sm text-red-500">Failed to load analytics. Showing no data.</div>
              ) : (
                <div className="space-y-4">
                  {[
                    {
                      platform: "Instagram",
                      icon: Instagram,
                      data: analytics?.platformBreakdown.instagram,
                    },
                    {
                      platform: "Facebook",
                      icon: Facebook,
                      data: analytics?.platformBreakdown.facebook,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.data ? Intl.NumberFormat().format(item.data.followers) : "—"} followers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <p className="text-sm font-medium">
                            {item.data ? Intl.NumberFormat().format(item.data.reach) : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">Reach (7d)</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {item.data ? Intl.NumberFormat().format(item.data.engagement) : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {item.data ? Intl.NumberFormat().format(item.data.followers) : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Facebook details */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Facebook className="h-5 w-5" /> Facebook Details
                </CardTitle>
                <CardDescription>{analytics?.details?.facebook?.name || "Selected page"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Impressions (7d)" value={analytics?.details?.facebook?.metrics.impressions} />
                  <Stat label="Views (7d)" value={analytics?.details?.facebook?.metrics.views} />
                  <Stat label="Engaged Users (7d)" value={analytics?.details?.facebook?.metrics.engagement} />
                  <Stat label="Followers" value={analytics?.details?.facebook?.metrics.followers} />
                </div>
                <TimeseriesChart
                  title="Facebook Reach (daily)"
                  data={fbTs?.reach || []}
                  colorVar="var(--color-fcf)"
                  label="Reach"
                />
                <TimeseriesChart
                  title="Facebook Engaged Users (daily)"
                  data={fbTs?.engaged_users || []}
                  colorVar="var(--color-pv)"
                  label="Engaged"
                />
                <TimeseriesChart
                  title="Facebook Impressions (daily)"
                  data={fbTs?.impressions || []}
                  colorVar="var(--color-fcf)"
                  label="Impressions"
                />
                <TimeseriesChart
                  title="Facebook Views (daily)"
                  data={fbTs?.views || []}
                  colorVar="var(--color-pv)"
                  label="Views"
                />
              </CardContent>
            </Card>

            {/* Instagram details */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Instagram className="h-5 w-5" /> Instagram Details
                </CardTitle>
                <CardDescription>@{analytics?.details?.instagram?.username || "Selected account"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Impressions (7d)" value={analytics?.details?.instagram?.metrics.impressions} />
                  <Stat label="Profile Views (7d)" value={analytics?.details?.instagram?.metrics.profileViews} />
                  <Stat label="Reach (7d)" value={analytics?.details?.instagram?.metrics.reach} />
                  <Stat label="Followers" value={analytics?.details?.instagram?.metrics.followers} />
                </div>
                <TimeseriesChart
                  title="Instagram Reach (daily)"
                  data={igTs?.reach || []}
                  colorVar="var(--color-fcf)"
                  label="Reach"
                />
                <TimeseriesChart
                  title="Instagram Impressions (daily)"
                  data={igTs?.impressions || []}
                  colorVar="var(--color-pv)"
                  label="Impressions"
                />
                <TimeseriesChart
                  title="Instagram Profile Views (daily)"
                  data={igTs?.profile_views || []}
                  colorVar="var(--color-fcf)"
                  label="Profile Views"
                />
              </CardContent>
            </Card>
          </div>

          {/* Facebook deep dive */}
          {Array.isArray(fbPages) && fbPages.length > 0 ? (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-serif">Facebook Deep Dive</CardTitle>
                <CardDescription>Posts, details, and insights with page switching</CardDescription>
              </CardHeader>
              <CardContent>
                <FacebookAnalytics />
              </CardContent>
            </Card>
          ) : null}

          {/* Top post */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Top Performing Post</CardTitle>
              <CardDescription>Your most successful post from the recent period</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !analytics ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                      {analytics.topPerformingPost.platform === "Instagram" ? (
                        <Instagram className="h-5 w-5 text-primary" />
                      ) : (
                        <Facebook className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{analytics.topPerformingPost.content}</p>
                      <p className="text-sm text-muted-foreground">{analytics.topPerformingPost.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <p className="text-sm font-medium">{analytics.topPerformingPost.likes}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{analytics.topPerformingPost.comments}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{analytics.topPerformingPost.shares}</p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="p-3 border border-border rounded-md">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{typeof value === "number" ? Intl.NumberFormat().format(value) : "—"}</div>
    </div>
  )
}

function TimeseriesChart({
  title,
  data,
  label,
  colorVar,
}: {
  title: string
  data: TimeSeriesPoint[]
  label: string
  colorVar: string
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <ChartContainer
        config={{
          value: { label, color: "hsl(var(--chart-1))" },
        }}
        className="h-[220px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="var(--color-value)" name={label} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
