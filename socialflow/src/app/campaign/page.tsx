"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Facebook, Instagram, ArrowLeft, Upload, Hash, MapPin, QrCode, LinkIcon, X, Settings, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiClient, type PostRequest, type FacebookPage, type InstagramAccount, type AuthStatus } from "@/lib/api"

export default function CampaignPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [postContent, setPostContent] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [postResult, setPostResult] = useState<any>(null)
  
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
  }, [])

  const loadAuthStatus = async () => {
    setIsLoadingAuth(true)
    try {
      const status = await apiClient.getAuthStatus()
      setAuthStatus(status)
      
      if (status.facebook) {
        const [selectedPage, pages] = await Promise.all([
          apiClient.getSelectedFacebookPage(),
          apiClient.getFacebookPages()
        ])
        setSelectedFacebookPage(selectedPage)
        setFacebookPages(pages)
      }
      
      if (status.instagram) {
        const [selectedAccount, accounts] = await Promise.all([
          apiClient.getSelectedInstagramAccount(),
          apiClient.getInstagramAccounts()
        ])
        console.log("Instagram accounts loaded:", accounts) // Debug log
        setSelectedInstagramAccount(selectedAccount)
        setInstagramAccounts(accounts)
      }
    } catch (error) {
      console.error('Failed to load auth status:', error)
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

    setSelectedPlatforms((prev) => 
      prev.includes(platform) 
        ? prev.filter((p) => p !== platform) 
        : [...prev, platform]
    )
    setPostResult(null) // Clear any errors
  }

  const handleSelectFacebookPage = async (pageId: string) => {
    try {
      const result = await apiClient.selectFacebookPage(pageId)
      if (result.success) {
        setSelectedFacebookPage(result.page)
        setShowFacebookPageModal(false)
        // Refresh auth status
        await loadAuthStatus()
      }
    } catch (error) {
      console.error('Failed to select Facebook page:', error)
      setPostResult({ error: "Failed to select Facebook page" })
    }
  }

  const handleSelectInstagramAccount = async (accountId: string) => {
    try {
      const result = await apiClient.selectInstagramAccount(accountId)
      if (result.success) {
        setSelectedInstagramAccount(result.account)
        setShowInstagramAccountModal(false)
        // Refresh auth status
        await loadAuthStatus()
      }
    } catch (error) {
      console.error('Failed to select Instagram account:', error)
      setPostResult({ error: "Failed to select Instagram account" })
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - uploadedImages.length)
      setUploadedImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files) {
      const newImages = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, 5 - uploadedImages.length)
      setUploadedImages((prev) => [...prev, ...newImages])
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

    setIsPosting(true)
    setPostResult(null)

    try {
      const postRequest: PostRequest = {
        content: postContent.trim(),
        mediaUrls: [], // TODO: Handle image upload URLs
        mediaType: "IMAGE",
        platforms: {},
        isScheduled: false,
        scheduledTime: Date.now()
      }

      if (selectedPlatforms.includes("Facebook") && selectedFacebookPage) {
        postRequest.platforms.facebook = {
          enabled: true,
          id: selectedFacebookPage.id
        }
      }

      if (selectedPlatforms.includes("Instagram") && selectedInstagramAccount) {
        postRequest.platforms.instagram = {
          enabled: true,
          id: selectedInstagramAccount.id
        }
      }

      console.log("Posting with dynamic IDs:", JSON.stringify(postRequest, null, 2))
      const result = await apiClient.postToMultiplePlatforms(postRequest)
      setPostResult(result)

      if (result.facebook?.success || result.instagram?.success) {
        setPostContent("")
        setSelectedPlatforms([])
        setUploadedImages([])
      }
    } catch (error) {
      console.error("Failed to post:", error)
      setPostResult({ 
        error: error instanceof Error ? error.message : "Failed to post content. Please try again." 
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
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary/80 hover:text-white">
                  <Hash className="h-4 w-4 mr-1" />
                  Add from saved HashTag
                </Button>
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
                        accept="image/*"
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
                    <Label>Uploaded Images ({uploadedImages.length}/5)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
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
                          {selectedFacebookPage && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
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
                            <DialogDescription>
                              Choose which Facebook page to use for posting
                            </DialogDescription>
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
                        onClick={() => window.open(apiClient.getFacebookAuthUrl(), '_blank')}
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
                            {selectedInstagramAccount ? 
            selectedInstagramAccount.name || `@${selectedInstagramAccount.username}` || selectedInstagramAccount.id 
            : "No account selected"}
        </span>
        {selectedInstagramAccount && (
          <CheckCircle className="h-3 w-3 text-green-600" />
        )}
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
                            <DialogDescription>
                              Choose which Instagram account to use for posting
                            </DialogDescription>
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
                        onClick={() => window.open(apiClient.getInstagramAuthUrl(), '_blank')}
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
                        available: authStatus.facebook && selectedFacebookPage
                      },
                      { 
                        name: "Instagram", 
                        icon: Instagram, 
                        color: "text-pink-600",
                        available: authStatus.instagram && selectedInstagramAccount
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

                {/* Additional Options */}
                <div className="space-y-2">
                  <Label>Additional Options</Label>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start hover:bg-muted-foreground hover:text-white"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start hover:bg-muted-foreground hover:text-white"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Add QR Code
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start hover:bg-muted-foreground hover:text-white"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Add Sign-up Link
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Result */}
            {postResult && (
              <div
                className={`p-4 rounded-lg ${postResult.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
              >
                {postResult.error ? (
                  <p className="text-red-700 text-sm">{postResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-green-700 font-medium text-sm">Post published successfully!</p>
                    {postResult.facebook?.success && <p className="text-green-600 text-xs">✓ Posted to Facebook</p>}
                    {postResult.instagram?.success && <p className="text-green-600 text-xs">✓ Posted to Instagram</p>}
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
