"use client"
import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { apiClient, type FbPage } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

function number(v: unknown) {
  if (v == null) return 0
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function FacebookAnalytics() {
  const { data: pagesResp } = useSWR("fb-pages", () => apiClient.getFacebookPagesAnalytics())
  const pages: FbPage[] = pagesResp?.data ?? []

  const [pageId, setPageId] = useState<string>("")
  useEffect(() => {
    if (!pageId && pages?.length) setPageId(pages[0].id)
  }, [pages, pageId])

  const { data: insights, isLoading: insightsLoading } = useSWR(pageId ? ["fb-insights", pageId] : null, () =>
    apiClient.getFacebookPageInsights(pageId),
  )

  const { data: posts, isLoading: postsLoading } = useSWR(pageId ? ["fb-posts", pageId] : null, () =>
    apiClient.getFacebookPagePosts({ pageId, limit: 10 }),
  )

  const timeseries = useMemo(() => {
    const values =
      insights?.report?.pageLikes?.data?.[0]?.values ?? insights?.report?.pageReach?.data?.[0]?.values ?? []
    type FbInsightValue = { end_time?: string; value?: number | string | null };
    return values.map((v: FbInsightValue) => ({
      date: v.end_time?.slice(0, 10),
      value: number(v.value),
    }))
  }, [insights])

  const [openPost, setOpenPost] = useState<string | null>(null)
  const { data: postDetails } = useSWR(openPost ? ["fb-post", openPost] : null, () =>
    apiClient.getFacebookPostDetails(openPost!),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select value={pageId} onValueChange={setPageId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Facebook Page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Likes"
          value={insightsLoading ? "—" : number(insights?.report?.pageLikes?.data?.[0]?.values?.at(-1)?.value)}
        />
        <MetricCard
          title="Reach (Unique)"
          value={insightsLoading ? "—" : number(insights?.report?.pageReach?.data?.[0]?.values?.at(-1)?.value)}
        />
        <MetricCard
          title="Engagements"
          value={insightsLoading ? "—" : number(insights?.report?.totalEngagement?.data?.[0]?.values?.at(-1)?.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeseries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
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
              {(posts?.data ?? []).map((p: {
                id: string;
                full_picture?: string;
                message?: string;
                created_time: string;
              }) => (
                <div key={p.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.full_picture ? (
                      <img
                        src={p.full_picture || "/placeholder.svg"}
                        alt="post"
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded" />
                    )}
                    <div className="flex flex-col">
                      <div className="text-sm font-medium line-clamp-1">{p.message || "—"}</div>
                      <div className="text-xs text-muted-foreground">{new Date(p.created_time).toLocaleString()}</div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setOpenPost(p.id)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!openPost} onOpenChange={(o) => !o && setOpenPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post details</DialogTitle>
          </DialogHeader>
          {!postDetails ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {postDetails?.post_details?.full_picture && (
                <img
                  src={postDetails.post_details.full_picture || "/placeholder.svg"}
                  alt="post"
                  className="w-full max-h-72 object-cover rounded"
                />
              )}
              <div className="text-sm whitespace-pre-wrap">{postDetails?.post_details?.message || "—"}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricCard title="Impressions" value={number(postDetails?.post_stats?.post_impressions)} />
                <MetricCard title="Unique Impr." value={number(postDetails?.post_stats?.post_impressions_unique)} />
                <MetricCard title="Reactions" value={number(postDetails?.post_stats?.total_reactions)} />
                <MetricCard title="Comments" value={number(postDetails?.post_stats?.total_comments)} />
                <MetricCard title="Shares" value={number(postDetails?.post_stats?.total_shares)} />
                <MetricCard title="Clicks" value={number(postDetails?.post_stats?.total_clicks)} />
                <MetricCard title="Engagements" value={number(postDetails?.post_stats?.total_engagements)} />
                <MetricCard title="Engagement Rate" value={`${postDetails?.post_stats?.engagement_rate}%`} />
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
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}
