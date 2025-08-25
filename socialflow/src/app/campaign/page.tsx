"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Facebook, Instagram, ArrowLeft, Upload, Hash, MapPin, QrCode, LinkIcon } from "lucide-react"
import Link from "next/link"

export default function CampaignPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [postContent, setPostContent] = useState("")

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
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
              <h1 className="text-2xl font-black font-serif text-primary">Start Campaign</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto border-border">
          <CardHeader>
            <CardTitle className="font-serif">Create New Campaign</CardTitle>
            <CardDescription>Create and schedule your posts for Instagram and Facebook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="post-text">Post Content</Label>
              <Textarea
                id="post-text"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] resize-none focus:border-accent"
                placeholder="What's on your mind? Share your thoughts with your audience..."
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80 hover:text-white">
                  <Hash className="h-4 w-4 mr-1" />
                  Add from saved HashTag
                </Button>
                <span>{postContent.length}/280 characters</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Label>Upload Media</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-card flex items-center justify-center">
                      <Upload className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-white">
                        Upload Image/Video
                      </Button>
                      <p className="text-xs text-muted-foreground">or drag and drop</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Platforms</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Facebook", icon: Facebook, color: "text-blue-600" },
                      { name: "Instagram", icon: Instagram, color: "text-pink-600" },
                    ].map((platform) => (
                      <Button
                        key={platform.name}
                        variant={selectedPlatforms.includes(platform.name) ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => togglePlatform(platform.name)}
                      >
                        <platform.icon className={`h-4 w-4 mr-2 ${platform.color}`} />
                        {platform.name}
                        {selectedPlatforms.includes(platform.name) && (
                          <Badge variant="secondary" className="ml-auto">
                            Selected
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Options</Label>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted-foreground hover:text-white">
                      <MapPin className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted-foreground hover:text-white">
                      <QrCode className="h-4 w-4 mr-2" />
                      Add QR Code
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted-foreground hover:text-white">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Add Sign-up Link
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Post Now
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
