"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Facebook, Instagram, CheckCircle, Clock, XCircle, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const posts = [
    {
      id: 1,
      content: "New product launch announcement with exciting features",
      platform: "Instagram",
      date: "2024-01-15",
      status: "Posted",
      engagement: "1.2k",
      icon: Instagram,
    },
    {
      id: 2,
      content: "Behind the scenes content from our latest photoshoot",
      platform: "Facebook",
      date: "2024-01-14",
      status: "Scheduled",
      engagement: "-",
      icon: Facebook,
    },
    {
      id: 3,
      content: "Customer testimonial and success story feature",
      platform: "Instagram",
      date: "2024-01-13",
      status: "Posted",
      engagement: "890",
      icon: Instagram,
    },
    {
      id: 4,
      content: "Team spotlight and company culture post",
      platform: "Facebook",
      date: "2024-01-12",
      status: "Cancelled",
      engagement: "-",
      icon: Facebook,
    },
    {
      id: 5,
      content: "Weekly tips and industry insights",
      platform: "Instagram",
      date: "2024-01-11",
      status: "Posted",
      engagement: "654",
      icon: Instagram,
    },
  ]

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
                          <post.icon className="h-4 w-4" />
                          <span>{post.platform}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{post.date}</td>
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
                          {post.status === "Cancelled" && <XCircle className="h-3 w-3" />}
                          {post.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{post.engagement}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {post.status === "Scheduled" && (
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
