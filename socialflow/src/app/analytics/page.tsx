"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Facebook, Instagram, TrendingUp, Users, Heart } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
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
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Total Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">45.2K</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
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
                <div className="text-2xl font-bold text-primary">8.4%</div>
                <p className="text-xs text-muted-foreground">+2.3% from last month</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  New Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">1.2K</div>
                <p className="text-xs text-muted-foreground">+15.7% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Platform Performance</CardTitle>
              <CardDescription>Compare your performance across Instagram and Facebook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    platform: "Instagram",
                    followers: "12.5K",
                    engagement: "9.2%",
                    posts: 8,
                    icon: Instagram,
                    likes: "2.1K",
                    comments: "340",
                  },
                  {
                    platform: "Facebook",
                    followers: "8.3K",
                    engagement: "6.8%",
                    posts: 5,
                    icon: Facebook,
                    likes: "1.5K",
                    comments: "180",
                  },
                ].map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                        <platform.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{platform.platform}</p>
                        <p className="text-sm text-muted-foreground">{platform.followers} followers</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <p className="text-sm font-medium">{platform.engagement}</p>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{platform.posts}</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{platform.likes}</p>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{platform.comments}</p>
                        <p className="text-xs text-muted-foreground">Comments</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Top Performing Posts</CardTitle>
              <CardDescription>Your most successful posts from the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    content: "New product launch announcement",
                    platform: "Instagram",
                    engagement: "1.2K likes, 89 comments",
                    date: "Jan 15",
                    icon: Instagram,
                  },
                  {
                    content: "Customer testimonial story",
                    platform: "Instagram",
                    engagement: "890 likes, 67 comments",
                    date: "Jan 11",
                    icon: Instagram,
                  },
                  {
                    content: "Behind the scenes content",
                    platform: "Facebook",
                    engagement: "654 likes, 45 comments",
                    date: "Jan 8",
                    icon: Facebook,
                  },
                ].map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                        <post.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{post.content}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.platform} • {post.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent">{post.engagement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
