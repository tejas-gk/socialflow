"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Plus,
  Facebook,
  Instagram,
  ArrowLeft,
  Upload,
  X,
  Settings,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { apiClient, type PostRequest, type FacebookPage, type InstagramAccount, type AuthStatus } from "@/lib/api"
import { uploadMedia } from "@/lib/api"

export default function CampaignPage() {
  const { user } = useUser()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [postContent, setPostContent] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)
  type PostResult = {
    error?: string
    scheduled?: boolean
    scheduledFor?: string
    facebook?: { success?: boolean }
    instagram?: { success?: boolean }
    [key: string]: unknown
  }
  const [postResult, setPostResult] = useState<PostResult | null>(null)

  // Schedule Post States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)

  // Account management state
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<InstagramAccount | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ facebook: false, instagram: false })
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Modal states
  const [showFacebookPageModal, setShowFacebookPageModal] = useState(false)
  const [showInstagramAccountModal, setShowInstagramAccountModal] = useState(false)

  useEffect(() => {
  loadAuthStatus()
  const now = new Date()
  now.setMinutes(now.getMinutes() + 11) // Add 10 minutes to current time

  // Set scheduled date in YYYY-MM-DD format
  setScheduledDate(now.toISOString().split('T')[0])

  // Set scheduled time in HH:mm format (local time)
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  setScheduledTime(`${hours}:${minutes}`)
}, [])

  const loadAuthStatus = async () => {
    setIsLoadingAuth(true)
    try {
      const status = await apiClient.getAuthStatus()
      setAuthStatus(status)

      if (status.facebook) {
        const [selectedPage, pages] = await Promise.all([
          apiClient.getSelectedFacebookPage(),
          apiClient.getFacebookPages(),
        ])
        setSelectedFacebookPage(selectedPage)
        setFacebookPages(pages)
      }

      if (status.instagram) {
        const [selectedAccount, accounts] = await Promise.all([
          apiClient.getSelectedInstagramAccount(),
          apiClient.getInstagramAccounts(),
        ])
        setSelectedInstagramAccount(selectedAccount)
        setInstagramAccounts(accounts)
      }
    } catch (error) {
      console.error("Failed to load auth status:", error)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const togglePlatform = (platform: string) => {
    if (platform === "Facebook" && !selectedFacebookPage) {
      setPostResult({ error: "Please connect and select a Facebook page first" })
      return
    }
    if (platform === "Instagram" && !selectedInstagramAccount) {
      setPostResult({ error: "Please connect and select an Instagram account first" })
      return
    }
    setSelectedPlatforms((prev) => (prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]))
    setPostResult(null)
  }

  const handleSelectFacebookPage = async (pageId: string) => {
    if (!user) {
      setPostResult({ error: "User not found. Please refresh the page and try again." })
      return
    }
    try {
      const result = await apiClient.selectFacebookPage(pageId, user.id)
      if (result.success) {
        setSelectedFacebookPage(result.page)
        setShowFacebookPageModal(false)
        await loadAuthStatus()
      }
    } catch (error) {
      console.error("Failed to select Facebook page:", error)
      setPostResult({ error: "Failed to select Facebook page" })
    }
  }

  const handleSelectInstagramAccount = async (accountId: string) => {
    try {
      const result = await apiClient.selectInstagramAccount(accountId)
      if (result.success) {
        setSelectedInstagramAccount(result.account)
        setShowInstagramAccountModal(false)
        await loadAuthStatus()
      }
    } catch (error) {
      console.error("Failed to select Instagram account:", error)
      setPostResult({ error: "Failed to select Instagram account" })
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const accepted = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.type === "video/mp4" || f.type === "video/quicktime",
      )
      const newImages = accepted.slice(0, 10 - uploadedImages.length)
      setUploadedImages((prev) => [...prev, ...newImages])
      if (accepted.length !== files.length) {
        setPostResult({
          error: "Some files were skipped. Allowed: images (JPG/PNG/WEBP/GIF) and videos in MP4/MOV (H.264/AAC).",
        })
      }
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files) {
      const accepted = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.type === "video/mp4" || f.type === "video/quicktime",
      )
      const newImages = accepted.slice(0, 10 - uploadedImages.length)
      setUploadedImages((prev) => [...prev, ...newImages])
      if (accepted.length !== files.length) {
        setPostResult({
          error: "Some files were skipped. Allowed: images (JPG/PNG/WEBP/GIF) and videos in MP4/MOV (H.264/AAC).",
        })
      }
    }
  }

  const validateScheduleDateTime = (date: string, time: string): boolean => {
    if (!date || !time) return false
    const scheduledDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const minFutureTime = new Date(now.getTime() + 10 * 60 * 1000)
    if (scheduledDateTime <= minFutureTime) {
      setPostResult({ error: "Scheduled time must be at least 10 minutes in the future for Facebook" })
      return false
    }
    const maxFutureDate = new Date()
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 6)
    if (scheduledDateTime > maxFutureDate) {
      setPostResult({ error: "Cannot schedule more than 6 months in advance for Facebook" })
      return false
    }
    return true
  }

  const convertToUnixTimestamp = (date: string, time: string): number => {
    const scheduledDateTime = new Date(`${date}T${time}`)
    return Math.floor(scheduledDateTime.getTime() / 1000)
  }

  const handleSchedulePost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) return
    if (!validateScheduleDateTime(scheduledDate, scheduledTime)) return
    if (selectedPlatforms.includes("Facebook") && !selectedFacebookPage) {
      setPostResult({ error: "Please select a Facebook page first" })
      return
    }
    if (selectedPlatforms.includes("Instagram") && !selectedInstagramAccount) {
      setPostResult({ error: "Please select an Instagram account first" })
      return
    }
    if (uploadedImages.length === 0) {
      setPostResult({ error: "Please add at least one image or video" })
      return
    }
    setIsScheduling(true)
    setPostResult(null)
    try {
      const upload = await uploadMedia(uploadedImages)
      const mediaUrls = upload.files.map((f) => f.url)
      const wantsInstagram = selectedPlatforms.includes("Instagram")
      const hasVideo = uploadedImages.some((f) => f.type === "video/mp4" || f.type === "video/quicktime")
      const hasNonHttpsOrLocal = mediaUrls.some((u) => {
        const lower = u.toLowerCase()
        return !lower.startsWith("https://") || lower.includes("localhost") || lower.includes("127.0.0.1")
      })
      if (wantsInstagram && hasNonHttpsOrLocal) {
        setPostResult({
          error: "Instagram requires a public HTTPS URL for media. Please deploy the app (or use a public tunnel) and try again. Facebook can still be scheduled.",
        })
        setIsScheduling(false)
        return
      }
      const scheduledTimestamp = convertToUnixTimestamp(scheduledDate, scheduledTime)
      const mediaType =
        hasVideo && uploadedImages.length === 1
          ? "VIDEO"
          : !hasVideo && uploadedImages.length > 1
          ? "CAROUSEL"
          : "IMAGE"
      const postRequest: PostRequest = {
        content: postContent.trim(),
        mediaUrls,
        mediaType,
        platforms: {},
        isScheduled: true,
        scheduledTime: scheduledTimestamp,
      }
      if (selectedPlatforms.includes("Facebook") && selectedFacebookPage) {
        postRequest.platforms.facebook = { enabled: true, id: selectedFacebookPage.id }
      }
      if (wantsInstagram && selectedInstagramAccount && !hasNonHttpsOrLocal) {
        postRequest.platforms.instagram = { enabled: true, id: selectedInstagramAccount.id }
      }
      const result = await apiClient.postToMultiplePlatformsMultipart(postRequest, uploadedImages)
      setPostResult({
        ...result,
        scheduled: true,
        scheduledFor: new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString(),
      })
      if (result.facebook?.success || result.instagram?.success) {
        setPostContent("")
        setSelectedPlatforms([])
        setUploadedImages([])
        setIsScheduleModalOpen(false)
      }
    } catch (error) {
      console.error("Failed to schedule post:", error)
      setPostResult({
        error: error instanceof Error ? error.message : "Failed to schedule post. Please try again.",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  const handlePostNow = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) return
    if (selectedPlatforms.includes("Facebook") && !selectedFacebookPage) {
      setPostResult({ error: "Please select a Facebook page first" })
      return
    }
    if (selectedPlatforms.includes("Instagram") && !selectedInstagramAccount) {
      setPostResult({ error: "Please select an Instagram account first" })
      return
    }
    if (uploadedImages.length === 0) {
      setPostResult({ error: "Please add at least one image or video" })
      return
    }
    setIsPosting(true)
    setPostResult(null)
    try {
      const upload = await uploadMedia(uploadedImages)
      const mediaUrls = upload.files.map((f) => f.url)
      const wantsInstagram = selectedPlatforms.includes("Instagram")
      const hasVideo = uploadedImages.some((f) => f.type === "video/mp4" || f.type === "video/quicktime")
      const hasNonHttpsOrLocal = mediaUrls.some((u) => {
        const lower = u.toLowerCase()
        return !lower.startsWith("https://") || lower.includes("localhost") || lower.includes("127.0.0.1")
      })
      if (wantsInstagram && hasNonHttpsOrLocal) {
        setPostResult({
          error:
            "Instagram requires a public HTTPS URL for media. Please deploy the app (or use a public tunnel) and try again. Facebook can still be posted.",
        })
        setIsPosting(false)
        return
      }
      if (wantsInstagram && hasVideo) {
        const videoPostRequest = {
          businessAccountId: selectedInstagramAccount?.id,
          accessToken: "",
          postContent: postContent.trim(),
          videoUrl: mediaUrls[0],
          thumbnailUrl: undefined,
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/social/instagram/video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(videoPostRequest),
        })
        const result = await response.json()
        setPostResult(result)
        if (result.success) {
          setPostContent("")
          setSelectedPlatforms([])
          setUploadedImages([])
        }
        setIsPosting(false)
        return
      }
      const mediaType =
        hasVideo && uploadedImages.length === 1
          ? "VIDEO"
          : !hasVideo && uploadedImages.length > 1
          ? "CAROUSEL"
          : "IMAGE"
      const postRequest: PostRequest = {
        content: postContent.trim(),
        mediaUrls,
        mediaType,
        platforms: {},
        isScheduled: false,
        scheduledTime: Date.now(),
      }
      if (selectedPlatforms.includes("Facebook") && selectedFacebookPage) {
        postRequest.platforms.facebook = { enabled: true, id: selectedFacebookPage.id }
      }
      if (wantsInstagram && selectedInstagramAccount && !hasNonHttpsOrLocal) {
        postRequest.platforms.instagram = { enabled: true, id: selectedInstagramAccount.id }
      }
      const result = await apiClient.postToMultiplePlatformsMultipart(postRequest, uploadedImages)
      setPostResult(result)
      if (result.facebook?.success || result.instagram?.success) {
        setPostContent("")
        setSelectedPlatforms([])
        setUploadedImages([])
      }
    } catch (error) {
      console.error("Failed to post:", error)
      setPostResult({
        error: error instanceof Error ? error.message : "Failed to post content. Please try again.",
      })
    } finally {
      setIsPosting(false)
    }
  }

  const canPost = postContent.trim() && selectedPlatforms.length > 0

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
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
            {/* Post Content */}
            <div className="space-y-2">
              <Label htmlFor="post-text">Post Content</Label>
              <Textarea
                id="post-text"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] resize-none focus:border-accent"
                placeholder="What's on your mind? Share your thoughts with your audience..."
              />
              <div className="flex justify-end items-center text-sm text-muted-foreground">
                <span>{postContent.length}/280 characters</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Upload Media */}
              <div className="space-y-4">
                <Label>Upload Media</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-card flex items-center justify-center">
                      <Upload className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-white" asChild>
                          <span>Upload Image/Video</span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground">or drag and drop</p>
                    </div>
                  </div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Media ({uploadedImages.length}/10)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Selection and Account Management */}
              <div className="space-y-4">
                {/* Connected Accounts Section */}
                <div className="space-y-2">
                  <Label>Connected Accounts</Label>
                  {/* Facebook Account */}
                  {authStatus.facebook ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center space-x-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {selectedFacebookPage ? selectedFacebookPage.name : "No page selected"}
                          </span>
                          {selectedFacebookPage && <CheckCircle className="h-3 w-3 text-green-600" />}
                        </div>
                      </div>
                      <Dialog open={showFacebookPageModal} onOpenChange={setShowFacebookPageModal}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            {selectedFacebookPage ? "Change" : "Select"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Select Facebook Page</DialogTitle>
                            <DialogDescription>Choose which Facebook page to use for posting</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            {facebookPages.map((page) => (
                              <Button
                                key={page.id}
                                variant={selectedFacebookPage?.id === page.id ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => handleSelectFacebookPage(page.id)}
                              >
                                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                                {page.name}
                                {selectedFacebookPage?.id === page.id && (
                                  <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-muted-foreground">Facebook not connected</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(apiClient.getFacebookAuthUrl(), "_blank")}
                      >
                        Connect
                      </Button>
                    </div>
                  )}

                  {/* Instagram Account */}
                  {authStatus.instagram ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {selectedInstagramAccount
                              ? selectedInstagramAccount.name ||
                                `@${selectedInstagramAccount.username}` ||
                                selectedInstagramAccount.id
                              : "No account selected"}
                          </span>
                          {selectedInstagramAccount && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                      </div>
                      <Dialog open={showInstagramAccountModal} onOpenChange={setShowInstagramAccountModal}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            {selectedInstagramAccount ? "Change" : "Select"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Select Instagram Account</DialogTitle>
                            <DialogDescription>Choose which Instagram account to use for posting</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2">
                            {instagramAccounts.map((account) => (
                              <Button
                                key={account.id}
                                variant={selectedInstagramAccount?.id === account.id ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => handleSelectInstagramAccount(account.id)}
                              >
                                <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                                {account.username ? `@${account.username}` : account.name}
                                {selectedInstagramAccount?.id === account.id && (
                                  <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                                )}
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <span className="text-sm text-muted-foreground">Instagram not connected</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(apiClient.getInstagramAuthUrl(), "_blank")}
                      >
                        Connect
                      </Button>
                    </div>
                  )}
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>Select Platforms</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        name: "Facebook",
                        icon: Facebook,
                        color: "text-blue-600",
                        available: authStatus.facebook && selectedFacebookPage,
                      },
                      {
                        name: "Instagram",
                        icon: Instagram,
                        color: "text-pink-600",
                        available: authStatus.instagram && selectedInstagramAccount,
                      },
                    ].map((platform) => (
                      <Button
                        key={platform.name}
                        variant={selectedPlatforms.includes(platform.name) ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => togglePlatform(platform.name)}
                        disabled={!platform.available}
                      >
                        <platform.icon className={`h-4 w-4 mr-2 ${platform.color}`} />
                        {platform.name}
                        {!platform.available && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Setup Required
                          </Badge>
                        )}
                        {selectedPlatforms.includes(platform.name) && platform.available && (
                          <Badge variant="secondary" className="ml-auto">
                            Selected
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Result */}
            {postResult && (
              <div
                className={`p-4 rounded-lg ${
                  postResult.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
                }`}
              >
                {postResult.error ? (
                  <p className="text-red-700 text-sm">{postResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-green-700 font-medium text-sm">
                      {postResult.scheduled ? `Post scheduled successfully for ${postResult.scheduledFor}!` : "Post published successfully!"}
                    </p>
                    {postResult.facebook?.success && <p className="text-green-600 text-xs">✓ {postResult.scheduled ? "Scheduled for" : "Posted to"} Facebook</p>}
                    {postResult.instagram?.success && <p className="text-green-600 text-xs">✓ {postResult.scheduled ? "Scheduled for" : "Posted to"} Instagram</p>}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handlePostNow}
                disabled={!canPost || isPosting}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isPosting ? "Posting..." : "Post Now"}
              </Button>
              <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 bg-transparent" disabled={!canPost}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Schedule Your Post
                    </DialogTitle>
                    <DialogDescription>
                      Choose when you want your post to be published on the selected platforms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-date">Date</Label>
                        <Input
                          id="schedule-date"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule-time">Time</Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                    {scheduledDate && scheduledTime && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Scheduled for:</strong> {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Will be posted to:</Label>
                      <div className="flex gap-2">
                        {selectedPlatforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                            {platform === "Facebook" ? (
                              <Facebook className="h-3 w-3" />
                            ) : (
                              <Instagram className="h-3 w-3" />
                            )}
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsScheduleModalOpen(false)}
                      disabled={isScheduling}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSchedulePost}
                      disabled={!scheduledDate || !scheduledTime || isScheduling}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {isScheduling ? "Scheduling..." : "Schedule Post"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
