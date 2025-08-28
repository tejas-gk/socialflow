"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Facebook, Instagram, CheckCircle, Clock, XCircle, Eye, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { apiClient, type PostHistoryItem } from "@/lib/api"

export default function HistoryPage() {
  const [posts, setPosts] = useState<PostHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPostHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("[v0] Fetching post history...")
      const historyData = await apiClient.getPostHistory(1, 50) // Get more posts for history view
      setPosts(historyData.posts)
      console.log("[v0] Post history loaded:", historyData.posts.length, "posts")
    } catch (error) {
      console.error("[v0] Failed to fetch post history:", error)
      setError("Failed to load post history. Please try again.")
      // Fallback to mock data if API fails
      setPosts([
        {
          id: "1",
          content: "New product launch announcement with exciting features",
          platforms: ["Instagram"],
          status: "Posted",
          createdAt: "2024-01-15T10:00:00Z",
          scheduledAt: null,
          engagement: { instagram: { likes: 1200, comments: 45, shares: 23 } },
        },
        {
          id: "2",
          content: "Behind the scenes content from our latest photoshoot",
          platforms: ["Facebook"],
          status: "Scheduled",
          createdAt: "2024-01-14T15:30:00Z",
          scheduledAt: "2024-01-16T09:00:00Z",
          engagement: null,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPostHistory()
  }, [])

  const handleDeletePost = async (postId: string) => {
    try {
      await apiClient.cancelScheduledPost(postId)
      // Refresh the list after deletion
      fetchPostHistory()
    } catch (error) {
      console.error("[v0] Failed to delete post:", error)
    }
  }

  const formatEngagement = (engagement: PostHistoryItem["engagement"]) => {
    if (!engagement) return "-"

    const totalLikes = (engagement.instagram?.likes || 0) + (engagement.facebook?.likes || 0)
    const totalComments = (engagement.instagram?.comments || 0) + (engagement.facebook?.comments || 0)

    if (totalLikes === 0 && totalComments === 0) return "-"

    return `${totalLikes} likes, ${totalComments} comments`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
              <h1 className="text-2xl font-black font-serif text-primary">Post History</h1>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPostHistory} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-serif">Post History</CardTitle>
            <CardDescription>Track all your social media posts and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading post history...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-destructive">{error}</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No posts found. Create your first post!</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Content</th>
                      <th className="text-left py-3 px-4 font-medium">Platform</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Engagement</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate">{post.content}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {post.platforms.map((platform, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                {platform === "Instagram" && <Instagram className="h-4 w-4 text-pink-600" />}
                                {platform === "Facebook" && <Facebook className="h-4 w-4 text-blue-600" />}
                                <span className="text-sm">{platform}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(post.createdAt)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              post.status === "Posted"
                                ? "default"
                                : post.status === "Scheduled"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="flex items-center gap-1 w-fit"
                          >
                            {post.status === "Posted" && <CheckCircle className="h-3 w-3" />}
                            {post.status === "Scheduled" && <Clock className="h-3 w-3" />}
                            {post.status === "Failed" && <XCircle className="h-3 w-3" />}
                            {post.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{formatEngagement(post.engagement)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {post.status === "Scheduled" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
