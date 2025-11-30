// src/components/analytics/instagram-analytics.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { apiClient, type InstagramMedia, type InstagramAccount } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Video } from "@/components/ui/video"
function number(v: unknown) {
  if (v == null) return 0
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function InstagramAnalytics() {
  const { data: accounts, isLoading: accountsLoading } = useSWR(
    "ig-accounts-analytics",
    () => apiClient.getInstagramAccountsAnalytics(),
    { shouldRetryOnError: false },
  )

  const [businessId, setBusinessId] = useState<string>("")

  useEffect(() => {
    if (!businessId && accounts && accounts.length > 0) {
      setBusinessId(accounts[0].id)
    }
  }, [accounts, businessId])

  const { data: dashboard, isLoading: dashboardLoading } = useSWR(
    businessId ? ["ig-dashboard", businessId] : null,
    () => apiClient.getInstagramDashboard(businessId),
    { shouldRetryOnError: false },
  )

  const { data: followers } = useSWR(
    businessId ? ["ig-followers", businessId] : null,
    () => apiClient.getInstagramFollowers(businessId),
    { shouldRetryOnError: false },
  )

  const { data: engagement } = useSWR(
    businessId ? ["ig-engagement", businessId] : null,
    () => apiClient.getInstagramEngagement(businessId),
    { shouldRetryOnError: false },
  )

  const { data: posts, isLoading: postsLoading } = useSWR(
    businessId ? ["ig-media", businessId] : null,
    () => apiClient.getInstagramAccountMedia({ accountId: businessId, limit: 10 }),
    { shouldRetryOnError: false },
  )

  const [openPostId, setOpenPostId] = useState<string | null>(null)
  const selectedAccount = useMemo(
    () => accounts?.find((acc: InstagramAccount) => acc.id === businessId),
    [accounts, businessId],
  )

  const { data: postDetails } = useSWR(
    openPostId && selectedAccount?.accessToken ? ["ig-media-details", openPostId, selectedAccount.accessToken] : null,
    ([, mediaId, token]) => apiClient.getInstagramMediaDetails(mediaId, token),
    { shouldRetryOnError: false },
  )

  type FollowerValue = { end_time?: string; value?: number }

  const followerTimeseries = useMemo(() => {
    const values: FollowerValue[] = followers?.new?.data?.[0]?.values ?? []
    return values.map((v: FollowerValue) => ({
      date: v.end_time?.slice(0, 10),
      value: number(v.value),
    }))
  }, [followers])

  if (accountsLoading) {
    return <div className="text-center text-muted-foreground py-10">Loading Instagram accounts...</div>
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">
            No Instagram Business Account connected. Please add one from the dashboard.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Instagram Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={businessId} onValueChange={setBusinessId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Instagram account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc: InstagramAccount) => (
                <SelectItem key={acc.id} value={acc.id}>
                  @{acc.username} ({acc.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {dashboardLoading || !businessId ? (
        <div className="text-center text-muted-foreground py-10">Loading analytics data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Followers"
              value={
                dashboard?.getTotalFollowers?.followers_count?.toLocaleString() ||
                selectedAccount?.followersCount?.toLocaleString() ||
                "—"
              }
            />
            <MetricCard
              title="Posts"
              value={
                dashboard?.getTotalPosts?.media_count?.toLocaleString() ||
                selectedAccount?.mediaCount?.toLocaleString() ||
                "—"
              }
            />
            <MetricCard title="Engagement" value={engagement?.data?.[0]?.total_value?.value?.toLocaleString() || "—"} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Follower Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={followerTimeseries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ fill: "#8884d8" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-sm text-muted-foreground">Loading posts…</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(posts?.data ?? []).map((post: InstagramMedia) => (
                    <div key={post.id} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {post.media_url && post.media_type !== "VIDEO" ? (
                          <img
                            src={post.media_url || "/placeholder.svg"}
                            alt="post"
                            className="h-12 w-12 object-cover rounded flex-shrink-0"
                          />
                        ) : post.thumbnail_url ? (
                          <img
                            src={post.thumbnail_url || "/placeholder.svg"}
                            alt="video thumbnail"
                            className="h-12 w-12 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-muted rounded flex-shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <div className="text-sm font-medium line-clamp-2">{post.caption || "No caption"}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(post.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setOpenPostId(post.id)}>
                        View
                      </Button>
                    </div>
                  ))}
                  {(!posts?.data || posts.data.length === 0) && (
                    <p className="text-sm text-muted-foreground">No recent posts found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Username:</strong> @{selectedAccount.username}
                  </p>
                  <p>
                    <strong>Page Name:</strong> {selectedAccount.name}
                  </p>
                  <p>
                    <strong>Followers:</strong> {selectedAccount.followersCount?.toLocaleString() ?? "N/A"}
                  </p>
                  <p>
                    <strong>Posts:</strong> {selectedAccount.mediaCount?.toLocaleString() ?? "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={!!openPostId} onOpenChange={(o) => !o && setOpenPostId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {!postDetails ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="flex flex-col gap-4">
              {postDetails?.media_details?.media_type === "VIDEO" && postDetails?.media_details?.media_url ? (
                <Video
                  src={postDetails.media_details.media_url}
                  poster={postDetails.media_details.thumbnail_url}
                  controls
                  preload="metadata"
                  className="w-full max-h-72 object-contain rounded"
                  aria-label="Instagram video"
                />
              ) : postDetails?.media_details?.media_url ? (
                <img
                  src={postDetails.media_details.media_url || "/placeholder.svg"}
                  alt="post"
                  className="w-full max-h-72 object-contain rounded"
                />
              ) : postDetails?.media_details?.thumbnail_url ? (
                <img
                  src={postDetails.media_details.thumbnail_url || "/placeholder.svg"}
                  alt="video thumbnail"
                  className="w-full max-h-72 object-contain rounded"
                />
              ) : null}
              <div className="text-sm whitespace-pre-wrap">{postDetails?.media_details?.caption || "—"}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricCard title="Likes" value={number(postDetails?.media_stats?.likes)} />
                <MetricCard title="Comments" value={number(postDetails?.media_stats?.comments)} />
                <MetricCard title="Impressions" value={number(postDetails?.media_stats?.impressions)} />
                <MetricCard title="Reach" value={number(postDetails?.media_stats?.reach)} />
                <MetricCard title="Saves" value={number(postDetails?.media_stats?.saves)} />
                <MetricCard title="Engagement" value={number(postDetails?.media_stats?.engagement)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
