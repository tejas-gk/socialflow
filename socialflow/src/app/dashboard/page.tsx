"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Plus, Settings, TrendingUp, Facebook, Instagram, Wifi, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
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
                  <div className="text-2xl font-bold text-primary">24</div>
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
                  <div className="text-2xl font-bold text-accent">Active</div>
                  <p className="text-xs text-muted-foreground">All platforms connected</p>
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
                  <div className="text-2xl font-bold text-primary">+12.5%</div>
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
              <div className="space-y-4">
                {[
                  {
                    platform: "Instagram",
                    content: "New product launch announcement",
                    status: "Posted",
                    engagement: "1.2k likes",
                  },
                  {
                    platform: "Facebook",
                    content: "Behind the scenes content",
                    status: "Scheduled",
                    time: "2 hours",
                  },
                  {
                    platform: "Instagram",
                    content: "Customer testimonial story",
                    status: "Posted",
                    engagement: "890 likes",
                  },
                ].map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-card flex items-center justify-center">
                        {post.platform === "Instagram" && <Instagram className="h-5 w-5 text-accent" />}
                        {post.platform === "Facebook" && <Facebook className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-medium">{post.content}</p>
                        <p className="text-sm text-muted-foreground">{post.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={post.status === "Posted" ? "default" : "secondary"}>{post.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{post.engagement || `in ${post.time}`}</p>
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
