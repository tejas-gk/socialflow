"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { apiClient, type FacebookPage, type FacebookPost } from "@/lib/api"
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
    const { data: pagesResponse, isLoading: pagesLoading } = useSWR(
        "fb-pages-analytics",
        () => apiClient.getFacebookPagesAnalytics(),
        { shouldRetryOnError: false },
    )

    const pages = pagesResponse?.data || []

    const [pageId, setPageId] = useState<string>("")

    useEffect(() => {
        if (!pageId && pages && pages.length > 0) {
            setPageId(pages[0].id)
        }
    }, [pages, pageId])

    const { data: insights, isLoading: insightsLoading } = useSWR(
        pageId ? ["fb-page-insights", pageId] : null,
        () => apiClient.getFacebookPageInsights(pageId),
        { shouldRetryOnError: false },
    )

    const { data: postsResponse, isLoading: postsLoading } = useSWR(
        pageId ? ["fb-page-posts", pageId] : null,
        () => apiClient.getFacebookPagePosts({ pageId, limit: 10 }),
        { shouldRetryOnError: false },
    )

    const posts = postsResponse?.data || []

    const [openPostId, setOpenPostId] = useState<string | null>(null)

    const selectedPage = useMemo(
        () => pages.find((p: FacebookPage) => p.id === pageId),
        [pages, pageId],
    )

    // For Facebook post details, we usually need a page access token, but let's assume the API handles it or we pass it
    // Actually getFacebookPostDetails takes (postId, accessToken).
    // We need the page access token.

    const { data: postDetails } = useSWR(
        openPostId && selectedPage?.access_token ? ["fb-post-details", openPostId, selectedPage.access_token] : null,
        ([, pid, token]) => apiClient.getFacebookPostDetails(pid, token),
        { shouldRetryOnError: false },
    )

    // Extract timeseries data from insights
    // Facebook insights structure matches FacebookPageInsights interface
    // report.pageReach.data[0].values

    const reachTimeseries = useMemo(() => {
        const values = insights?.report?.pageReach?.data?.[0]?.values ?? []
        return values.map((v) => ({
            date: v.end_time?.slice(0, 10),
            value: number(v.value),
        }))
    }, [insights])

    if (pagesLoading) {
        return <div className="text-center text-muted-foreground py-10">Loading Facebook pages...</div>
    }

    if (!pages || pages.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                        No Facebook Page connected. Please add one from the dashboard.
                    </p>
                    <Button onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</Button>
                </CardContent>
            </Card>
        )
    }

    // Calculate totals from insights (usually last value or distinct/unique logic)
    // For simplicity, let's take the latest value from the timeseries or just show the structured data
    // The API returns 'values' array.

    const totalReach = insights?.report?.pageReach?.data?.[0]?.values?.slice(-1)[0]?.value ?? 0
    const totalEngagement = insights?.report?.totalEngagement?.data?.[0]?.values?.slice(-1)[0]?.value ?? 0
    const totalLikes = insights?.report?.pageLikes?.data?.[0]?.values?.slice(-1)[0]?.value ?? 0

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Facebook Page</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={pageId} onValueChange={setPageId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Facebook Page" />
                        </SelectTrigger>
                        <SelectContent>
                            {pages.map((page: FacebookPage) => (
                                <SelectItem key={page.id} value={page.id}>
                                    {page.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {insightsLoading || !pageId ? (
                <div className="text-center text-muted-foreground py-10">Loading analytics data...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Page Likes"
                            value={number(totalLikes).toLocaleString()}
                        />
                        <MetricCard
                            title="Reach (Daily)"
                            value={number(totalReach).toLocaleString()}
                        />
                        <MetricCard
                            title="Engagement (Daily)"
                            value={number(totalEngagement).toLocaleString()}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Reach Growth</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reachTimeseries}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
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
                                    {posts.map((post: FacebookPost) => (
                                        <div key={post.id} className="flex items-center justify-between border rounded-md p-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {post.full_picture ? (
                                                    <img
                                                        src={post.full_picture}
                                                        alt="post"
                                                        className="h-12 w-12 object-cover rounded flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 bg-muted rounded flex-shrink-0 flex items-center justify-center text-xs">Txt</div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <div className="text-sm font-medium line-clamp-2">{post.message || "No content"}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(post.created_time).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => setOpenPostId(post.id)}>
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                    {(!posts || posts.length === 0) && (
                                        <p className="text-sm text-muted-foreground">No recent posts found.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedPage && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Page Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p>
                                        <strong>Name:</strong> {selectedPage.name}
                                    </p>
                                    <p>
                                        <strong>Category:</strong> {selectedPage.category}
                                    </p>
                                    <p>
                                        <strong>ID:</strong> {selectedPage.id}
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
                            {postDetails?.post_details?.full_picture && (
                                <img
                                    src={postDetails.post_details.full_picture}
                                    alt="post"
                                    className="w-full max-h-72 object-contain rounded"
                                />
                            )}
                            <div className="text-sm whitespace-pre-wrap">{postDetails?.post_details?.message || "—"}</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <MetricCard title="Reactions" value={number(postDetails?.post_stats?.total_reactions)} />
                                <MetricCard title="Comments" value={number(postDetails?.post_stats?.total_comments)} />
                                <MetricCard title="Shares" value={number(postDetails?.post_stats?.total_shares)} />
                                <MetricCard title="Impressions" value={number(postDetails?.post_stats?.post_impressions)} />
                                <MetricCard title="Engagements" value={number(postDetails?.post_stats?.total_engagements)} />
                                <MetricCard title="Engagement Rate" value={number(postDetails?.post_stats?.engagement_rate).toFixed(2) + "%"} />
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
