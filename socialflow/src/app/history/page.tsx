"use client"

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import Image from 'next/image' // Import the Next.js Image component
import { apiClient, type FbPage, type InstagramAccount, type InstagramMedia, type FacebookPostDetails, type InstagramMediaDetails } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, LineChart, MessageSquare, Heart, Share2, Eye, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle as CardTitleComponent } from "@/components/ui/card"

// Define the post type based on your Facebook API response
interface FacebookPost {
  id: string;
  full_picture?: string;
  message?: string;
  created_time: string;
}

// A small component for displaying metrics in the dialog
function MetricCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitleComponent className="text-sm font-medium">{title}</CardTitleComponent>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('facebook');
  const [viewingPost, setViewingPost] = useState<{ id: string; platform: 'facebook' | 'instagram' } | null>(null);

  // Facebook data fetching
  const { data: pagesResp } = useSWR("fb-pages", () => apiClient.getFacebookPagesAnalytics())
  const pages: FbPage[] = pagesResp?.data ?? []
  const [pageId, setPageId] = useState("")

  useEffect(() => {
    if (!pageId && pages?.length) setPageId(pages[0].id)
  }, [pages, pageId])

  const { data: posts, isLoading: postsLoading } = useSWR(
    pageId ? ['fb-posts', pageId] : null,
    () => apiClient.getFacebookPagePosts({ pageId, limit: 10 })
  )

  // Instagram data fetching
  const { data: igAccounts } = useSWR("ig-accounts", () => apiClient.getInstagramAccountsAnalytics());
  const [igAccountId, setIgAccountId] = useState("");

  useEffect(() => {
    if (!igAccountId && igAccounts?.length) setIgAccountId(igAccounts[0].id);
  }, [igAccounts, igAccountId]);

  const { data: igPosts, isLoading: igPostsLoading } = useSWR(
    igAccountId ? ['ig-media', igAccountId] : null,
    () => apiClient.getInstagramAccountMedia({ accountId: igAccountId, limit: 10 })
  );
  
  const selectedFbPage = useMemo(() => pages.find(p => p.id === pageId), [pages, pageId]);
  const selectedIgAccount = useMemo(() => igAccounts?.find(acc => acc.id === igAccountId), [igAccounts, igAccountId]);

  const { data: fbPostDetails, isLoading: fbDetailsLoading } = useSWR(
    viewingPost?.platform === 'facebook' && selectedFbPage?.access_token
      ? ['fb-post-details', viewingPost.id, selectedFbPage.access_token]
      : null,
    ([, postId, token]) => apiClient.getFacebookPostDetails(postId, token)
  );

  const { data: igPostDetails, isLoading: igDetailsLoading } = useSWR(
    viewingPost?.platform === 'instagram' && selectedIgAccount?.accessToken
      ? ['ig-post-details', viewingPost.id, selectedIgAccount.accessToken]
      : null,
    ([, mediaId, token]) => apiClient.getInstagramMediaDetails(mediaId, token)
  );

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
              <h1 className="text-2xl font-black font-serif text-primary">Post History</h1>
              <Badge variant="secondary" className="hidden md:inline-flex">
                Pro
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('facebook')}
              className={`${
                activeTab === 'facebook'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Facebook
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className={`${
                activeTab === 'instagram'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Instagram
            </button>
          </nav>
        </div>

        <div>
          {activeTab === 'facebook' && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Facebook Recent Posts</h2>
                {pages.length > 0 && (
                  <select
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    className="px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a Facebook page</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {!pageId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a Facebook page to view recent posts
                </div>
              ) : postsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading posts...
                </div>
              ) : (
                <div className="space-y-4">
                  {(posts?.data ?? []).map((p: FacebookPost) => (
                    <div key={p.id} className="border border-border rounded-lg p-4 flex items-center space-x-4 hover:bg-muted/50 transition-colors">
                      {p.full_picture ? (
                        <Image
                          src={p.full_picture}
                          alt="Post image"
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-lg flex-shrink-0">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground mb-2 line-clamp-3">
                          {p.message || "No message content"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.created_time).toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewingPost({ id: p.id, platform: 'facebook' })}>
                        View Details
                      </Button>
                    </div>
                  ))}

                  {posts?.data?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts found for this page
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'instagram' && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Instagram Recent Posts</h2>
                {igAccounts && igAccounts.length > 0 && (
                  <select
                    value={igAccountId}
                    onChange={(e) => setIgAccountId(e.target.value)}
                    className="px-3 py-2 border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select an Instagram account</option>
                    {igAccounts.map((account: InstagramAccount) => (
                      <option key={account.id} value={account.id}>
                        @{account.username}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {!igAccountId ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select an Instagram account to view recent posts
                </div>
              ) : igPostsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading posts...
                </div>
              ) : (
                <div className="space-y-4">
                  {(igPosts?.data ?? []).map((p: InstagramMedia) => (
                    <div key={p.id} className="border border-border rounded-lg p-4 flex items-center space-x-4 hover:bg-muted/50 transition-colors">
                      {p.media_url && p.media_type !== 'VIDEO' ? (
                        <Image
                          src={p.media_url}
                          alt="Post image"
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : p.thumbnail_url ? (
                          <Image src={p.thumbnail_url} alt="video thumbnail" width={64} height={64} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-lg flex-shrink-0">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground mb-2 line-clamp-3">
                          {p.caption || "No message content"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setViewingPost({ id: p.id, platform: 'instagram' })}>
                        View Details
                      </Button>
                    </div>
                  ))}

                  {igPosts?.data?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts found for this account
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={!!viewingPost} onOpenChange={(isOpen) => !isOpen && setViewingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Performance Details</DialogTitle>
          </DialogHeader>
          {(fbDetailsLoading || igDetailsLoading) ? (
            <div className="text-center py-10 text-muted-foreground">Loading details...</div>
          ) : (
            <div className="space-y-4">
              {viewingPost?.platform === 'facebook' && fbPostDetails && (
                <div className="space-y-4">
                   {fbPostDetails.post_details.full_picture && (
                    <div className="relative w-full aspect-video">
                      <Image src={fbPostDetails.post_details.full_picture} alt="Post" layout="fill" objectFit="contain" className="rounded-lg" />
                    </div>
                   )}
                   <p className="text-sm text-muted-foreground italic">&quot;{fbPostDetails.post_details.message || 'No caption'}&quot;</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <MetricCard title="Reactions" value={fbPostDetails.post_stats.total_reactions ?? 0} icon={<Heart className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Comments" value={fbPostDetails.post_stats.total_comments ?? 0} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Shares" value={fbPostDetails.post_stats.total_shares ?? 0} icon={<Share2 className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Impressions" value={fbPostDetails.post_stats.post_impressions ?? 0} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Engagements" value={fbPostDetails.post_stats.total_engagements ?? 0} icon={<LineChart className="h-4 w-4 text-muted-foreground" />} />
                   </div>
                </div>
              )}
              {viewingPost?.platform === 'instagram' && igPostDetails && (
                <div className="space-y-4">
                  {(igPostDetails.media_details.media_url && igPostDetails.media_details.media_type !== 'VIDEO') && (
                    <div className="relative w-full aspect-video">
                      <Image src={igPostDetails.media_details.media_url} alt="Post" layout="fill" objectFit="contain" className="rounded-lg" />
                    </div>
                  )}
                  {igPostDetails.media_details.thumbnail_url && (
                    <div className="relative w-full aspect-video">
                      <Image src={igPostDetails.media_details.thumbnail_url} alt="Post" layout="fill" objectFit="contain" className="rounded-lg" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground italic">&quot;{igPostDetails.media_details.caption || 'No caption'}&quot;</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <MetricCard title="Likes" value={igPostDetails.media_stats.likes ?? 0} icon={<Heart className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Comments" value={igPostDetails.media_stats.comments ?? 0} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Saves" value={igPostDetails.media_stats.saves ?? 0} icon={<Bookmark className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Reach" value={igPostDetails.media_stats.reach ?? 0} icon={<Eye className="h-4 w-4 text-muted-foreground" />} />
                      <MetricCard title="Engagement" value={igPostDetails.media_stats.engagement ?? 0} icon={<LineChart className="h-4 w-4 text-muted-foreground" />} />
                   </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}