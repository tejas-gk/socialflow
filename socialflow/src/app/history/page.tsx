"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { apiClient, type FbPage, type InstagramAccountAnalytics, type InstagramMedia } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'


// Define the post type based on your Facebook API response
interface FacebookPost {
  id: string;
  full_picture?: string;
  message?: string;
  created_time: string;
}

export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState('facebook');

  // Facebook posts state and data fetching
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

  const [openPost, setOpenPost] = useState<string | null>(null)
  const { data: postDetails } = useSWR(
    openPost ? ['fb-post', openPost] : null,
    () => apiClient.getFacebookPostDetails(openPost!)
  )

  // Instagram posts state and data fetching
  const { data: igAccounts } = useSWR("ig-accounts", () => apiClient.getInstagramAccountsAnalytics());
  const [igAccountId, setIgAccountId] = useState("");

  useEffect(() => {
    if (!igAccountId && igAccounts?.length) setIgAccountId(igAccounts[0].id);
  }, [igAccounts, igAccountId]);

  const { data: igPosts, isLoading: igPostsLoading } = useSWR(
    igAccountId ? ['ig-media', igAccountId] : null,
    () => apiClient.getInstagramAccountMedia({ accountId: igAccountId, limit: 10 })
  );

  const [openIgPost, setOpenIgPost] = useState<string | null>(null);
  const { data: igPostDetails } = useSWR(
    openIgPost ? ['ig-media-details', openIgPost] : null,
    () => apiClient.getInstagramMediaDetails(openIgPost!)
  );


  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header - Matching Dashboard/Analytics Style */}
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
                    <div key={p.id} className="border border-border rounded-lg p-4 flex items-start space-x-4 hover:bg-muted/50 transition-colors">
                      {p.full_picture ? (
                        <img
                          src={p.full_picture}
                          alt="Post image"
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

                      <Button
                        size="sm"
                        onClick={() => setOpenPost(p.id)}
                      >
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
                    {igAccounts.map((account) => (
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
                    <div key={p.id} className="border border-border rounded-lg p-4 flex items-start space-x-4 hover:bg-muted/50 transition-colors">
                      {p.media_url && p.media_type !== 'VIDEO' ? (
                        <img
                          src={p.media_url}
                          alt="Post image"
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt="video thumbnail" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
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

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOpenIgPost(p.id)}
                      >
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


        {/* Modal for Facebook post details */}
        {openPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Post Details</h3>
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setOpenPost(null)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!postDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading post details...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postDetails?.post_details?.full_picture && (
                      <img
                        src={postDetails.post_details.full_picture}
                        alt="Post detail image"
                        className="w-full rounded-lg shadow-sm"
                      />
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-foreground whitespace-pre-wrap">
                        {postDetails?.post_details?.message || "No message content"}
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => setOpenPost(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal for Instagram post details */}
        {openIgPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Post Details</h3>
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setOpenIgPost(null)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!igPostDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    <span className="ml-2 text-muted-foreground">Loading post details...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {igPostDetails?.media_details?.media_url && igPostDetails.media_details.media_type !== 'VIDEO' && (
                      <img
                        src={igPostDetails.media_details.media_url}
                        alt="Post image"
                        className="w-full rounded-lg shadow-sm"
                      />
                    )}
                    {igPostDetails?.media_details?.media_type === 'VIDEO' && igPostDetails?.media_details.thumbnail_url && (
                      <img
                        src={igPostDetails.media_details.thumbnail_url}
                        alt="Post image"
                        className="w-full rounded-lg shadow-sm"
                      />
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-foreground whitespace-pre-wrap">
                        {igPostDetails?.media_details?.caption || "No message content"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-border">
                      <p>Likes: {igPostDetails?.media_stats?.likes ?? 'N/A'}</p>
                      <p>Comments: {igPostDetails?.media_stats?.comments ?? 'N/A'}</p>
                      <p>Impressions: {igPostDetails?.media_stats?.impressions ?? 'N/A'}</p>
                      <p>Reach: {igPostDetails?.media_stats?.reach ?? 'N/A'}</p>
                      <p>Saves: {igPostDetails?.media_stats?.saved ?? 'N/A'}</p>
                      <p>Engagement: {igPostDetails?.media_stats?.engagement ?? 'N/A'}</p>
                    </div>


                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => setOpenIgPost(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}