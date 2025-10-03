"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Facebook,
  Instagram,
  Settings,
  Eye,
  Users,
  BarChart3,
  Target,
  Plus,
  Calendar,
  Send,
  X,
  ChevronDown,
  Check,
  Smile,
  Hash,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EmojiPicker from "emoji-picker-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FacebookPage {
  id: string
  name: string
  access_token: string
  picture?: {
    data: {
      url: string
    }
  }
}

interface InstagramAccount {
  id: string
  username: string
  name: string
  profile_picture_url?: string
  followers_count?: number
  media_count?: number
}

interface FacebookPost {
  id: string
  message?: string
  story?: string
  full_picture?: string
  created_time: string
  likes?: {
    summary: {
      total_count: number
    }
  }
  comments?: {
    summary: {
      total_count: number
    }
  }
  shares?: {
    count: number
  }
}

interface InstagramPost {
  id: string
  caption?: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url?: string
  thumbnail_url?: string
  timestamp: string
  like_count?: number
  comments_count?: number
  permalink?: string
}

interface FacebookInsights {
  page_impressions: number
  page_engaged_users: number
  page_fans: number
  page_views: number
  page_posts_impressions: number
  page_video_views: number
  page_actions_post_reactions_total: number
}

interface InstagramInsights {
  impressions: number
  reach: number
  profile_views: number
  website_clicks: number
  follower_count: number
  media_count: number
}

interface Demographics {
  age_gender: any
  countries: any
  cities: any
}

interface PostAnalytics {
  post_id: string
  impressions: number
  reach: number
  engagement: number
  clicks: number
}

export default function DashboardPage() {
  const [facebookAccessToken, setFacebookAccessToken] = useState("")
  const [instagramAccessToken, setInstagramAccessToken] = useState("")
  const [isFacebookTokenSet, setIsFacebookTokenSet] = useState(false)
  const [isInstagramTokenSet, setIsInstagramTokenSet] = useState(false)
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<InstagramAccount | null>(null)
  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([])
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
  const [facebookInsights, setFacebookInsights] = useState<FacebookInsights | null>(null)
  const [instagramInsights, setInstagramInsights] = useState<InstagramInsights | null>(null)
  const [demographics, setDemographics] = useState<Demographics | null>(null)
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTokenModal, setShowTokenModal] = useState(true)
  const [showPageModal, setShowPageModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [analyticsTab, setAnalyticsTab] = useState("facebook")

  const [postToFacebook, setPostToFacebook] = useState(true)
  const [postToInstagram, setPostToInstagram] = useState(false)

  const [postType, setPostType] = useState<"post" | "reel" | "carousel">("post")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const [fileTypes, setFileTypes] = useState<string[]>([])

  const [showPageSwitcher, setShowPageSwitcher] = useState(false)

  // Added state for emoji and hashtag pickers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showHashtagPicker, setShowHashtagPicker] = useState(false)

  // Added state for selected platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{ id: string; name: string }>>([])
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionSearchQuery, setMentionSearchQuery] = useState("")
  const [isSearchingMentions, setIsSearchingMentions] = useState(false)
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0)
  const [taggedPeopleMap, setTaggedPeopleMap] = useState<Map<string, string>>(new Map()) // name -> id mapping

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const savedFacebookToken = localStorage.getItem("facebook_access_token")
    const savedInstagramToken = localStorage.getItem("instagram_access_token")
    const savedFacebookPage = localStorage.getItem("selected_facebook_page")
    const savedInstagramAccount = localStorage.getItem("selected_instagram_account")

    if (savedFacebookToken) {
      setFacebookAccessToken(savedFacebookToken)
      setIsFacebookTokenSet(true)
      fetchFacebookPages(savedFacebookToken)
      setSelectedPlatforms((prev) => [...prev, "facebook"])
    }

    if (savedInstagramToken) {
      setInstagramAccessToken(savedInstagramToken)
      setIsInstagramTokenSet(true)
      fetchInstagramAccounts(savedInstagramToken)
      setSelectedPlatforms((prev) => [...prev, "instagram"])
    }

    if (savedFacebookPage) {
      setSelectedFacebookPage(JSON.parse(savedFacebookPage))
    }

    if (savedInstagramAccount) {
      setSelectedInstagramAccount(JSON.parse(savedInstagramAccount))
    }

    // Show token modal only if neither platform is connected
    if (!savedFacebookToken && !savedInstagramToken) {
      setShowTokenModal(true)
    } else {
      setShowTokenModal(false)
    }
  }, [])

  const initiateOAuth = (platform: "facebook" | "instagram") => {
    const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    if (!clientId) {
      setError("Facebook App ID not configured")
      return
    }

    const redirectUri = `${window.location.origin}/auth/${platform}/callback`
    let scope = ""

    if (platform === "facebook") {
      scope = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,business_management"
    } else {
      scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement"
    }

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${platform}`

    // Open OAuth in popup
    const popup = window.open(authUrl, `${platform}_oauth`, "width=600,height=600,scrollbars=yes,resizable=yes")

    // Listen for popup completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        // Check if tokens were set
        const savedToken = localStorage.getItem(`${platform}_access_token`)
        if (savedToken) {
          if (platform === "facebook") {
            setFacebookAccessToken(savedToken)
            setIsFacebookTokenSet(true)
            fetchFacebookPages(savedToken)
            setSelectedPlatforms((prev) => [...prev, "facebook"])
          } else {
            setInstagramAccessToken(savedToken)
            setIsInstagramTokenSet(true)
            fetchInstagramAccounts(savedToken)
            setSelectedPlatforms((prev) => [...prev, "instagram"])
          }
          setShowTokenModal(false)
        }
      }
    }, 1000)
  }

  const fetchFacebookPages = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${token}&fields=id,name,access_token,picture`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch Facebook pages. Please check your access token.")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      setFacebookPages(data.data || [])

      if (data.data && data.data.length > 0 && !selectedFacebookPage) {
        setShowPageModal(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInstagramAccounts = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      // First get Facebook pages to find connected Instagram accounts
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${token}&fields=id,name,access_token`,
      )

      if (!pagesResponse.ok) {
        throw new Error("Failed to fetch pages for Instagram accounts")
      }

      const pagesData = await pagesResponse.json()
      const accounts: InstagramAccount[] = []

      // For each page, check if it has a connected Instagram account
      for (const page of pagesData.data || []) {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
          )

          if (igResponse.ok) {
            const igData = await igResponse.json()

            if (igData.instagram_business_account) {
              const igAccountResponse = await fetch(
                `https://graph.facebook.com/v18.0/${igData.instagram_business_account.id}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${page.access_token}`,
              )

              if (igAccountResponse.ok) {
                const accountData = await igAccountResponse.json()
                setInstagramAccounts((prevAccounts) => [
                  ...prevAccounts,
                  {
                    ...accountData,
                    access_token: page.access_token,
                  },
                ])
              }
            }
          }
        } catch (err) {
          console.log("No Instagram account for page:", page.name)
        }
      }

      if (accounts.length > 0 && !selectedInstagramAccount) {
        setShowPageModal(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Instagram accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFacebookPagePosts = async (page: FacebookPage) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/posts?access_token=${page.access_token}&fields=id,message,story,full_picture,created_time,likes.summary(true),comments.summary(true),shares&limit=10`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch Facebook posts")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      setFacebookPosts(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Facebook posts")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInstagramPosts = async (account: InstagramAccount) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${account.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=10&access_token=${(account as any).access_token}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch Instagram posts")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      setInstagramPosts(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Instagram posts")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPageInsights = async (page: FacebookPage) => {
    try {
      const dailyResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/insights?metric=page_impressions,page_fans&period=day&access_token=${page.access_token}`,
      )

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json()
        const insightsData: FacebookInsights = {
          page_impressions: 0,
          page_engaged_users: 0,
          page_fans: 0,
          page_views: 0,
          page_posts_impressions: 0,
          page_video_views: 0,
          page_actions_post_reactions_total: 0,
        }

        dailyData.data?.forEach((metric: any) => {
          const latestValue = metric.values?.[metric.values.length - 1]?.value || 0
          if (metric.name in insightsData) {
            insightsData[metric.name as keyof FacebookInsights] = latestValue
          }
        })

        setFacebookInsights(insightsData)
      }

      const weeklyResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/insights?metric=page_impressions,page_engaged_users&period=week&access_token=${page.access_token}`,
      )

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json()
      }

      const demoResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/insights?metric=page_fans_gender_age,page_fans_country,page_fans_city&period=lifetime&access_token=${page.access_token}`,
      )

      if (demoResponse.ok) {
        const demoData = await demoResponse.json()
        const demographics: Demographics = {
          age_gender: [],
          countries: [],
          cities: [],
        }

        demoData.data?.forEach((metric: any) => {
          const latestValue = metric.values?.[metric.values.length - 1]?.value || {}

          if (metric.name === "page_fans_gender_age") {
            Object.entries(latestValue).forEach(([key, value]) => {
              const [gender, age] = key.split(".")
              const existingAge = demographics.age_gender.find((item: any) => item.age === age)
              if (existingAge) {
                existingAge[gender as "male" | "female"] = value as number
              } else {
                demographics.age_gender.push({
                  age,
                  male: gender === "M" ? (value as number) : 0,
                  female: gender === "F" ? (value as number) : 0,
                })
              }
            })
          } else if (metric.name === "page_fans_country") {
            demographics.countries = Object.entries(latestValue)
              .map(([country, value]) => ({
                country,
                value: value as number,
              }))
              .slice(0, 10)
          } else if (metric.name === "page_fans_city") {
            demographics.cities = Object.entries(latestValue)
              .map(([city, value]) => ({
                city,
                value: value as number,
              }))
              .slice(0, 10)
          }
        })

        setDemographics(demographics)
      }
    } catch (err) {
      console.log("Some insights not available for this page")
    }
  }

  const fetchInstagramInsights = async (account: InstagramAccount) => {
    console.log("Fetching Instagram insights for account:", account)

    try {
      // Define the metrics you want
      const metrics = "reach,follower_count,profile_views,website_clicks"

      // First call for metrics that don’t need metric_type
      const baseUrl = `https://graph.facebook.com/v18.0/${account.id}/insights`

      // Metrics that don’t need metric_type
      const normalMetrics = "reach,follower_count"

      // Metrics that need metric_type=total_value
      const totalMetrics = "profile_views,website_clicks"

      // Fetch reach and follower_count
      const res1 = await fetch(
        `${baseUrl}?metric=${normalMetrics}&period=day&access_token=${(account as any).access_token}`,
      )

      // Fetch profile_views and website_clicks (need metric_type)
      const res2 = await fetch(
        `${baseUrl}?metric=${totalMetrics}&period=day&metric_type=total_value&access_token=${(account as any).access_token}`,
      )

      if (!res1.ok || !res2.ok) {
        console.error("Error fetching Instagram insights:", await res1.text(), await res2.text())
        return
      }

      const data1 = await res1.json()
      const data2 = await res2.json()

      // Combine both data arrays
      const allMetrics = [...(data1.data || []), ...(data2.data || [])]

      console.log("Instagram insights data:", allMetrics)

      // Default values
      const insights: InstagramInsights = {
        impressions: 0,
        reach: 0,
        profile_views: 0,
        website_clicks: 0,
        follower_count: account.followers_count || 0,
        media_count: account.media_count || 0,
      }

      // Map API results into our insights object
      allMetrics.forEach((metric: any) => {
        const value = metric.values?.[0]?.value || 0
        switch (metric.name) {
          case "reach":
            insights.reach = value
            break
          case "follower_count":
            insights.follower_count = value
            break
          case "profile_views":
            insights.profile_views = value
            break
          case "website_clicks":
            insights.website_clicks = value
            break
        }
      })

      setInstagramInsights(insights)
    } catch (err) {
      console.error("Failed to fetch Instagram insights:", err)
    }
  }

  const fetchPostAnalytics = async (page: FacebookPage) => {
    try {
      const postsWithInsights = await Promise.all(
        facebookPosts.slice(0, 5).map(async (post) => {
          try {
            const response = await fetch(
              `https://graph.facebook.com/v18.0/${post.id}/insights?metric=post_impressions,post_reach,post_engaged_users,post_clicks&access_token=${page.access_token}`,
            )

            if (response.ok) {
              const data = await response.json()
              const analytics: PostAnalytics = {
                post_id: post.id,
                impressions: 0,
                reach: 0,
                engagement: 0,
                clicks: 0,
              }

              data.data?.forEach((metric: any) => {
                const value = metric.values?.[0]?.value || 0
                switch (metric.name) {
                  case "post_impressions":
                    analytics.impressions = value
                    break
                  case "post_reach":
                    analytics.reach = value
                    break
                  case "post_engaged_users":
                    analytics.engagement = value
                    break
                  case "post_clicks":
                    analytics.clicks = value
                    break
                }
              })

              return analytics
            }
          } catch (err) {
            console.log(`Analytics not available for post ${post.id}`)
          }
          return null
        }),
      )

      setPostAnalytics(postsWithInsights.filter(Boolean) as PostAnalytics[])
    } catch (err) {
      console.log("Post analytics not available")
    }
  }

  const fetchDemographics = async (page: FacebookPage) => {
    try {
      const demoResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/insights?metric=page_fans_gender_age,page_fans_country,page_fans_city&period=lifetime&access_token=${page.access_token}`,
      )

      if (demoResponse.ok) {
        const demoData = await demoResponse.json()
        const demographics: Demographics = {
          age_gender: [],
          countries: [],
          cities: [],
        }

        demoData.data?.forEach((metric: any) => {
          const latestValue = metric.values?.[metric.values.length - 1]?.value || {}

          if (metric.name === "page_fans_gender_age") {
            Object.entries(latestValue).forEach(([key, value]) => {
              const [gender, age] = key.split(".")
              const existingAge = demographics.age_gender.find((item: any) => item.age === age)
              if (existingAge) {
                existingAge[gender === "M" ? "male" : "female"] = value as number
              } else {
                demographics.age_gender.push({
                  age,
                  male: gender === "M" ? (value as number) : 0,
                  female: gender === "F" ? (value as number) : 0,
                })
              }
            })
          } else if (metric.name === "page_fans_country") {
            demographics.countries = Object.entries(latestValue)
              .map(([country, value]) => ({
                country,
                value: value as number,
              }))
              .slice(0, 10)
          } else if (metric.name === "page_fans_city") {
            demographics.cities = Object.entries(latestValue)
              .map(([city, value]) => ({
                city,
                value: value as number,
              }))
              .slice(0, 10)
          }
        })

        setDemographics(demographics)
      }
    } catch (err) {
      console.log("Demographics not available for this page")
    }
  }

  useEffect(() => {
    if (selectedFacebookPage) {
      fetchFacebookPagePosts(selectedFacebookPage)
      fetchPageInsights(selectedFacebookPage)
      fetchDemographics(selectedFacebookPage)
    }
  }, [selectedFacebookPage])

  useEffect(() => {
    if (selectedInstagramAccount) {
      fetchInstagramPosts(selectedInstagramAccount)
      fetchInstagramInsights(selectedInstagramAccount)
    }
  }, [selectedInstagramAccount])

  useEffect(() => {
    if (selectedFacebookPage && facebookPosts.length > 0) {
      fetchPostAnalytics(selectedFacebookPage)
    }
  }, [selectedFacebookPage, facebookPosts])

  useEffect(() => {
    if (selectedInstagramAccount && instagramPosts.length > 0) {
      fetchInstagramInsights(selectedInstagramAccount)
    }
  }, [selectedInstagramAccount, instagramPosts])

  const uploadFilesToS3 = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      try {
        console.log("[v0] Starting S3 upload for file:", file.name, "Type:", file.type)

        const response = await fetch("/api/s3-upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.log("[v0] S3 upload API error:", errorText)
          throw new Error("Failed to get upload URL")
        }

        const { uploadUrl, fileUrl } = await response.json()
        console.log("[v0] Got upload URL:", uploadUrl)

        if (!uploadUrl) {
          throw new Error("No upload URL received from API")
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file")
        }

        return fileUrl
      } catch (error) {
        console.error("[v0] Error uploading file:", error)
        throw error
      }
    })

    return Promise.all(uploadPromises)
  }

  const validatePost = (): string | null => {
    // Platform selection validation
    if (!postToFacebook && !postToInstagram) {
      return "Please select at least one platform to post to"
    }

    // Account selection validation
    if (postToFacebook && !selectedFacebookPage) {
      return "Please select a Facebook page to post to"
    }

    if (postToInstagram && !selectedInstagramAccount) {
      return "Please select an Instagram account to post to"
    }

    // Content validation based on platform and post type
    const hasContent = postContent.trim().length > 0
    const hasMedia = selectedFiles.length > 0

    // Instagram-specific validations
    if (postToInstagram) {
      // Instagram always requires media (except for text posts which aren't supported)
      if (!hasMedia) {
        return "Instagram posts require at least one image or video"
      }

      // Instagram character limits
      if (postContent.length > 2200) {
        return "Instagram captions cannot exceed 2,200 characters"
      }

      if (isScheduled && scheduledDate) {
        return "Instagram does not support scheduled posts. Please post immediately or schedule only to Facebook."
      }

      // Instagram reel validations
      if (postType === "reel") {
        if (selectedFiles.length !== 1) {
          return "Instagram reels require exactly one video file"
        }
        const file = selectedFiles[0]
        if (!file.type.startsWith("video/")) {
          return "Instagram reels must be video files"
        }
      }

      // Instagram carousel validations
      if (postType === "carousel") {
        if (selectedFiles.length < 2 || selectedFiles.length > 10) {
          return "Instagram carousels require 2-10 images or videos"
        }
        // Instagram allows mixed media in carousels
        const hasInvalidFiles = selectedFiles.some(
          (file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"),
        )
        if (hasInvalidFiles) {
          return "Instagram carousel items must be images or videos"
        }
      }

      // Instagram regular post validations
      if (postType === "post") {
        if (selectedFiles.length > 1) {
          return "Instagram single posts can only have one image or video"
        }
        const file = selectedFiles[0]
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          return "Instagram posts must be images or videos"
        }
      }
    }

    // Facebook-specific validations
    if (postToFacebook) {
      // Facebook allows text-only posts
      if (!hasContent && !hasMedia) {
        return "Facebook posts require either text content or media"
      }

      // Facebook character limits
      if (postContent.length > 63206) {
        return "Facebook posts cannot exceed 63,206 characters"
      }

      // Facebook reel validations
      if (postType === "reel") {
        if (selectedFiles.length !== 1) {
          return "Facebook reels require exactly one video file"
        }
        const file = selectedFiles[0]
        if (!file.type.startsWith("video/")) {
          return "Facebook reels must be video files"
        }
      }

      // Facebook carousel validations
      if (postType === "carousel") {
        if (selectedFiles.length < 2 || selectedFiles.length > 10) {
          return "Facebook carousels require 2-10 images"
        }
        // Facebook carousels are image-only
        const hasNonImages = selectedFiles.some((file) => !file.type.startsWith("image/"))
        if (hasNonImages) {
          return "Facebook carousel posts can only contain images"
        }
      }

      // Facebook regular post validations
      if (postType === "post" && hasMedia) {
        if (selectedFiles.length > 1) {
          return "Facebook single posts can only have one image or video"
        }
      }
    }

    // Cross-platform validations when posting to both
    if (postToFacebook && postToInstagram) {
      // When posting to both platforms, ensure compatibility
      if (postType === "carousel") {
        // Both platforms support image carousels, but Facebook doesn't support video carousels
        const hasVideos = selectedFiles.some((file) => file.type.startsWith("video/"))
        if (hasVideos) {
          return "When posting carousels to both platforms, only images are supported"
        }
      }

      if (!hasMedia) {
        return "When posting to both platforms, media is required (Instagram requirement)"
      }

      // Use the more restrictive character limit
      if (postContent.length > 2200) {
        return "When posting to both platforms, captions cannot exceed 2,200 characters (Instagram limit)"
      }
    }

    // File size validations
    const oversizedFiles = selectedFiles.filter((file) => file.size > 100 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      return "All files must be smaller than 100MB"
    }

    // Scheduling validations
    if (scheduledDate) {
      const now = new Date()
      const scheduled = new Date(scheduledDate)

      if (scheduled <= now) {
        return "Scheduled time must be in the future"
      }

      // Facebook allows scheduling up to 6 months in advance
      const sixMonthsFromNow = new Date()
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

      if (scheduled > sixMonthsFromNow) {
        return "Posts cannot be scheduled more than 6 months in advance"
      }
    }

    return null
  }

  const handlePost = async () => {
    const validationError = validatePost()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsPosting(true)
    setError("")

    try {
      let fileUrls: string[] = []

      // Upload files to S3 if selected
      if (selectedFiles.length > 0) {
        fileUrls = await uploadFilesToS3(selectedFiles)
      }

      const results = []

      // Post to Facebook if selected
      if (postToFacebook && selectedFacebookPage) {
        await postToFacebookPage(fileUrls)
        results.push("Facebook")
      }

      // Post to Instagram if selected
      if (postToInstagram && selectedInstagramAccount) {
        await postToInstagramAccount(fileUrls)
        results.push("Instagram")
      }

      // Reset form
      setPostContent("")
      setSelectedFiles([])
      setFilePreviews([])
      setScheduledDate("")
      setScheduledTime("")
      setIsScheduled(false)
      setShowPostModal(false)
      setPostType("post")
      setSelectedPlatforms([])
      setTaggedPeopleMap(new Map())
      setFileTypes([]) // Reset file types

      // Refresh posts
      if (postToFacebook && selectedFacebookPage) {
        fetchFacebookPagePosts(selectedFacebookPage)
      }
      if (postToInstagram && selectedInstagramAccount) {
        fetchInstagramPosts(selectedInstagramAccount)
      }

      alert(`Successfully posted to: ${results.join(", ")}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post")
    } finally {
      setIsPosting(false)
    }
  }

  const postToFacebookPage = async (fileUrls: string[]) => {
    if (!selectedFacebookPage) return

    const taggedIds = extractTaggedPeople()

    // ✅ Handle carousel posts (multiple images)
    if (postType === "carousel" && fileUrls.length > 1) {
      const attachedMedia = []

      for (const url of fileUrls) {
        // ✅ Upload each image via FormData so Facebook can read it
        const formData = new FormData()
        formData.append("access_token", selectedFacebookPage!.access_token)
        formData.append("published", "false")

        // Try fetching image binary (from S3 or Supabase)
        const fileResponse = await fetch(url)
        const blob = await fileResponse.blob()
        formData.append("source", blob)

        const photoResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/photos`, {
          method: "POST",
          body: formData,
        })

        if (!photoResponse.ok) {
          const errData = await photoResponse.json()
          console.error("❌ Carousel image upload failed:", errData)
          throw new Error(errData.error?.message || "Failed to upload image for carousel")
        }

        const photoResult = await photoResponse.json()
        attachedMedia.push({ media_fbid: photoResult.id })
      }

      // ✅ Create carousel post
      const postData: any = {
        message: postContent,
        attached_media: attachedMedia,
        access_token: selectedFacebookPage!.access_token,
      }

      if (taggedIds.length > 0) {
        postData.tags = taggedIds.join(",")
      }

      if (isScheduled && scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
        postData.scheduled_publish_time = Math.floor(scheduledDateTime.getTime() / 1000)
        postData.published = false
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errData = await response.json()
        console.error("❌ Carousel post failed:", errData)
        throw new Error(errData.error?.message || "Failed to post carousel to Facebook")
      }

      return
    }

    if (fileUrls.length > 0) {
      const isVideo = fileTypes[0]?.startsWith("video/")

      if (isVideo) {
        // Phase 1: Start upload session
        const startFormData = new FormData()
        startFormData.append("access_token", selectedFacebookPage!.access_token)
        startFormData.append("upload_phase", "start")

        const fileResponse = await fetch(fileUrls[0])
        const blob = await fileResponse.blob()
        const fileSizeInBytes = blob.size

        startFormData.append("file_size", fileSizeInBytes.toString())

        const startResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/videos`, {
          method: "POST",
          body: startFormData,
        })

        if (!startResponse.ok) {
          const errData = await startResponse.json()
          console.error("❌ Video upload start phase failed:", errData)
          throw new Error(errData.error?.message || "Failed to start video upload")
        }

        const startResult = await startResponse.json()
        const uploadSessionId = startResult.upload_session_id

        // Phase 2: Transfer video data
        const transferFormData = new FormData()
        transferFormData.append("access_token", selectedFacebookPage!.access_token)
        transferFormData.append("upload_phase", "transfer")
        transferFormData.append("upload_session_id", uploadSessionId)
        transferFormData.append("start_offset", "0")
        transferFormData.append("video_file_chunk", blob)

        const transferResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/videos`, {
          method: "POST",
          body: transferFormData,
        })

        if (!transferResponse.ok) {
          const errData = await transferResponse.json()
          console.error("❌ Video upload transfer phase failed:", errData)
          throw new Error(errData.error?.message || "Failed to transfer video")
        }

        // Phase 3: Finish upload and publish
        const finishFormData = new FormData()
        finishFormData.append("access_token", selectedFacebookPage!.access_token)
        finishFormData.append("upload_phase", "finish")
        finishFormData.append("upload_session_id", uploadSessionId)
        finishFormData.append("description", postContent)

        if (taggedIds.length > 0) {
          finishFormData.append("tags", taggedIds.join(","))
        }

        if (isScheduled && scheduledDate && scheduledTime) {
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
          finishFormData.append("scheduled_publish_time", Math.floor(scheduledDateTime.getTime() / 1000).toString())
          finishFormData.append("published", "false")
        }

        const finishResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/videos`, {
          method: "POST",
          body: finishFormData,
        })

        if (!finishResponse.ok) {
          const errData = await finishResponse.json()
          console.error("❌ Video upload finish phase failed:", errData)
          throw new Error(errData.error?.message || "Failed to finish video upload")
        }
      } else {
        const formData = new FormData()
        formData.append("caption", postContent)
        formData.append("access_token", selectedFacebookPage!.access_token)

        const fileResponse = await fetch(fileUrls[0])
        const blob = await fileResponse.blob()
        formData.append("source", blob)

        if (taggedIds.length > 0) {
          formData.append("tags", taggedIds.join(","))
        }

        if (isScheduled && scheduledDate && scheduledTime) {
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
          formData.append("scheduled_publish_time", Math.floor(scheduledDateTime.getTime() / 1000).toString())
          formData.append("published", "false")
        }

        const response = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/photos`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errData = await response.json()
          console.error("❌ Photo post failed:", errData)
          throw new Error(errData.error?.message || "Failed to upload photo to Facebook")
        }
      }
    } else {
      // Text-only post
      const postData: any = {
        message: postContent,
        access_token: selectedFacebookPage!.access_token,
      }

      if (taggedIds.length > 0) {
        postData.tags = taggedIds.join(",")
      }

      if (isScheduled && scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
        postData["scheduled_publish_time"] = Math.floor(scheduledDateTime.getTime() / 1000)
        postData["published"] = false
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${selectedFacebookPage!.id}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errData = await response.json()
        console.error("❌ Text post failed:", errData)
        throw new Error(errData.error?.message || "Failed to post text to Facebook")
      }
    }
  }

  const waitForMediaProcessing = async (mediaId: string, accessToken: string, maxAttempts = 30): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${mediaId}?fields=status_code&access_token=${accessToken}`,
        )

        if (!response.ok) {
          console.log(`[v0] Media status check failed, attempt ${attempt + 1}`)
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds
          continue
        }

        const result = await response.json()
        console.log(`[v0] Media status check attempt ${attempt + 1}:`, result)

        if (result.status_code === "FINISHED") {
          return true
        } else if (result.status_code === "ERROR") {
          throw new Error("Media processing failed")
        }

        // Wait 2 seconds before next attempt
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.log(`[v0] Error checking media status, attempt ${attempt + 1}:`, error)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw new Error("Media processing timeout - please try again")
  }

  const postToInstagramAccount = async (fileUrls: string[]) => {
    if (!selectedInstagramAccount) return

    if (postType === "carousel" && fileUrls.length > 1) {
      // Instagram carousel post
      const mediaIds = []

      for (let i = 0; i < fileUrls.length; i++) {
        const url = fileUrls[i]
        const isVideo = fileTypes[i]?.startsWith("video/")
        const mediaType = isVideo ? "video_url" : "image_url"

        console.log(`[v0] Creating carousel item ${i + 1}: ${mediaType} = ${url}`)

        const containerResponse = await fetch(
          `https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [mediaType]: url,
              is_carousel_item: true,
              access_token: (selectedInstagramAccount as any).access_token,
            }),
          },
        )

        if (!containerResponse.ok) {
          const errorData = await containerResponse.json()
          console.log(`[v0] Instagram carousel item creation failed:`, errorData)
          throw new Error(errorData.error?.message || "Failed to create carousel item")
        }

        const containerResult = await containerResponse.json()
        mediaIds.push(containerResult.id)

        console.log(`[v0] Waiting for carousel item processing: ${containerResult.id}`)
        await waitForMediaProcessing(containerResult.id, (selectedInstagramAccount as any).access_token)
      }

      // Create carousel container
      const carouselResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "CAROUSEL",
          children: mediaIds.join(","),
          caption: postContent,
          access_token: (selectedInstagramAccount as any).access_token,
        }),
      })

      if (!carouselResponse.ok) {
        const errorData = await carouselResponse.json()
        throw new Error(errorData.error?.message || "Failed to create carousel container")
      }

      const carouselResult = await carouselResponse.json()

      // Publish carousel
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: carouselResult.id,
            access_token: (selectedInstagramAccount as any).access_token,
          }),
        },
      )

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        throw new Error(errorData.error?.message || "Failed to publish carousel to Instagram")
      }
    } else if (postType === "reel" && fileUrls.length > 0) {
      // Instagram Reel
      console.log(`[v0] Creating Instagram reel with video: ${fileUrls[0]}`)

      const containerPayload: any = {
        media_type: "REELS",
        video_url: fileUrls[0],
        caption: postContent,
        access_token: (selectedInstagramAccount as any).access_token,
      }

      const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerPayload),
      })

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json()
        console.log(`[v0] Instagram reel container creation failed:`, errorData)
        throw new Error(errorData.error?.message || "Failed to create Instagram reel")
      }

      const containerResult = await containerResponse.json()
      console.log(`[v0] Instagram reel container created:`, containerResult)

      console.log(`[v0] Waiting for reel video processing: ${containerResult.id}`)
      await waitForMediaProcessing(containerResult.id, (selectedInstagramAccount as any).access_token)

      // Publish reel
      console.log(`[v0] Publishing Instagram reel: ${containerResult.id}`)
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: containerResult.id,
            access_token: (selectedInstagramAccount as any).access_token,
          }),
        },
      )

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.log(`[v0] Instagram reel publish failed:`, errorData)
        throw new Error(errorData.error?.message || "Failed to publish reel to Instagram")
      }

      console.log(`[v0] Instagram reel published successfully`)
    } else {
      // Regular Instagram post
      const isVideo = fileTypes[0]?.startsWith("video/")
      const mediaType = isVideo ? "video_url" : "image_url"

      console.log(`[v0] Creating Instagram post: ${mediaType} = ${fileUrls[0]}`)
      console.log(`[v0] File type detected: ${fileTypes[0]}`)

      const containerPayload: any = {
        [mediaType]: fileUrls[0],
        caption: postContent,
        access_token: (selectedInstagramAccount as any).access_token,
      }

      console.log(`[v0] Instagram container payload:`, JSON.stringify(containerPayload, null, 2))

      const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerPayload),
      })

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json()
        console.log(`[v0] Instagram media container creation failed:`, errorData)
        throw new Error(errorData.error?.message || "Failed to create Instagram media container")
      }

      const containerResult = await containerResponse.json()
      console.log(`[v0] Instagram container created:`, containerResult)

      console.log(`[v0] Waiting for media processing: ${containerResult.id}`)
      await waitForMediaProcessing(containerResult.id, (selectedInstagramAccount as any).access_token)

      console.log(`[v0] Publishing Instagram post: ${containerResult.id}`)
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${selectedInstagramAccount!.id}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: containerResult.id,
            access_token: (selectedInstagramAccount as any).access_token,
          }),
        },
      )

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.log(`[v0] Instagram publish failed:`, errorData)
        throw new Error(errorData.error?.message || "Failed to publish to Instagram")
      }

      console.log(`[v0] Instagram post published successfully`)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types based on post type
    const maxFiles = postType === "carousel" ? 10 : 1
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed for ${postType}`)
      return
    }

    const validFiles: File[] = []
    const previews: string[] = []
    const types: string[] = []

    files.forEach((file) => {
      if (file.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB")
        return
      }

      if (postType === "reel") {
        if (!file.type.startsWith("video/")) {
          setError("Reels require video files")
          return
        }
      } else if (postType === "carousel") {
        if (!file.type.startsWith("image/")) {
          setError("Carousel posts require image files")
          return
        }
      } else {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          setError("Please select valid image or video files")
          return
        }
      }

      validFiles.push(file)
      types.push(file.type)

      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === validFiles.length) {
          setFilePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })

    setSelectedFiles(validFiles)
    setFileTypes(types)
    setError("")
  }

  const handleFileSelect2 = (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError("")

    // Convert FileList to Array
    const fileArray = Array.from(files)

    // Platform-specific file validation
    const validateFiles = (): string | null => {
      // Check file count limits based on post type
      const maxFiles = postType === "carousel" ? 10 : 1
      if (fileArray.length > maxFiles) {
        return `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed for ${postType} posts`
      }

      // Validate each file
      for (const file of fileArray) {
        // File size check
        if (file.size > 100 * 1024 * 1024) {
          return `File "${file.name}" is too large. Maximum size is 100MB`
        }

        // File type validation based on post type and platform
        if (postType === "reel") {
          if (!file.type.startsWith("video/")) {
            return "Reels require video files only"
          }
          // Common video formats check
          const supportedVideoTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"]
          if (!supportedVideoTypes.includes(file.type)) {
            return "Please use supported video formats: MP4, MOV, AVI"
          }
        } else if (postType === "carousel") {
          if (postToFacebook && postToInstagram) {
            // When posting to both, only images are supported in carousels
            if (!file.type.startsWith("image/")) {
              return "When posting carousels to both platforms, only images are supported"
            }
          } else if (postToFacebook) {
            // Facebook carousels are image-only
            if (!file.type.startsWith("image/")) {
              return "Facebook carousel posts support images only"
            }
          } else if (postToInstagram) {
            // Instagram carousels support both images and videos
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
              return "Instagram carousel posts support images and videos only"
            }
          }
        } else {
          // Regular posts
          if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
            return "Please select valid image or video files"
          }
        }

        // Image format validation
        if (file.type.startsWith("image/")) {
          const supportedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
          if (!supportedImageTypes.includes(file.type)) {
            return "Please use supported image formats: JPEG, PNG, GIF, WebP"
          }
        }
      }

      return null
    }

    const fileValidationError = validateFiles()
    if (fileValidationError) {
      setError(fileValidationError)
      return
    }

    const validFiles: File[] = []
    const previews: string[] = []
    const types: string[] = []

    fileArray.forEach((file) => {
      validFiles.push(file)
      types.push(file.type)

      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === validFiles.length) {
          setFilePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })

    setSelectedFiles(validFiles)
    setFileTypes(types)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = filePreviews.filter((_, i) => i !== index)
    const newTypes = fileTypes.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setFilePreviews(newPreviews)
    setFileTypes(newTypes)
  }

  const uploadImageToS3 = async (file: File): Promise<string> => {
    try {
      console.log("[v0] Starting S3 upload for file:", file.name, "Type:", file.type)

      // Get signed URL from your API
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] S3 upload API error:", errorText)
        throw new Error("Failed to get upload URL")
      }

      const { uploadUrl, fileUrl } = await response.json()
      console.log("[v0] Got upload URL:", uploadUrl)
      console.log("[v0] File will be available at:", fileUrl)

      if (!uploadUrl) {
        throw new Error("No upload URL received from API")
      }

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        console.log("[v0] S3 upload failed:", uploadResponse.status, uploadResponse.statusText)
        throw new Error("Failed to upload image")
      }

      console.log("[v0] S3 upload successful, file URL:", fileUrl)
      return fileUrl
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      throw error
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleTokenSubmit = () => {
    if (facebookAccessToken) {
      localStorage.setItem("facebook_access_token", facebookAccessToken)
      setIsFacebookTokenSet(true)
      fetchFacebookPages(facebookAccessToken)
      setSelectedPlatforms((prev) => [...prev, "facebook"])
    }

    if (instagramAccessToken) {
      localStorage.setItem("instagram_access_token", instagramAccessToken)
      setIsInstagramTokenSet(true)
      fetchInstagramAccounts(instagramAccessToken)
      setSelectedPlatforms((prev) => [...prev, "instagram"])
    }

    if (facebookAccessToken || instagramAccessToken) {
      setShowTokenModal(false)
    }
  }

  const handlePageSelection = (page: FacebookPage) => {
    setSelectedFacebookPage(page)
    localStorage.setItem("selected_facebook_page", JSON.stringify(page))
    fetchFacebookPagePosts(page)
    fetchPageInsights(page)
    setShowPageModal(false)
  }

  const handleInstagramSelection = (account: InstagramAccount) => {
    setSelectedInstagramAccount(account)
    localStorage.setItem("selected_instagram_account", JSON.stringify(account))
    fetchInstagramPosts(account)
    fetchInstagramInsights(account)
    setShowPageModal(false)
  }

  const handleDisconnect = () => {
    localStorage.removeItem("facebook_access_token")
    localStorage.removeItem("selected_facebook_page")
    setFacebookAccessToken("")
    setIsFacebookTokenSet(false)
    setSelectedFacebookPage(null)
    setFacebookPages([])
    setFacebookPosts([])
    setFacebookInsights(null)
    setDemographics(null)
    setPostAnalytics([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "facebook"))
    setShowTokenModal(true)
  }

  const disconnectFacebook = () => {
    localStorage.removeItem("facebook_access_token")
    localStorage.removeItem("selected_facebook_page")
    setFacebookAccessToken("")
    setIsFacebookTokenSet(false)
    setSelectedFacebookPage(null)
    setFacebookPages([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "facebook"))
    alert({
      title: "Facebook Disconnected",
      description: "Your Facebook account has been disconnected successfully.",
    })
  }

  const disconnectInstagram = () => {
    localStorage.removeItem("instagram_access_token")
    localStorage.removeItem("selected_instagram_account")
    setInstagramAccessToken("")
    setIsInstagramTokenSet(false)
    setSelectedInstagramAccount(null)
    setInstagramAccounts([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "instagram"))
    alert({
      title: "Instagram Disconnected",
      description: "Your Instagram account has been disconnected successfully.",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const renderInstagramMedia = (post: any) => {
    console.log("[v0] Instagram post media type:", post.media_type, "URL:", post.media_url)

    if (post.media_type === "VIDEO") {
      // For videos, use thumbnail_url if available, otherwise show video icon
      if (post.thumbnail_url) {
        return (
          <Image
            src={post.thumbnail_url || "/placeholder.svg"}
            alt="Video thumbnail"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              console.log("[v0] Video thumbnail failed to load:", post.thumbnail_url)
              e.currentTarget.style.display = "none"
            }}
          />
        )
      } else {
        return (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs">📹</span>
          </div>
        )
      }
    } else if ((post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM") && post.media_url) {
      return (
        <Image
          src={post.media_url || "/placeholder.svg"}
          alt="Post thumbnail"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => {
            console.log("[v0] Image failed to load:", post.media_url)
            e.currentTarget.style.display = "none"
          }}
        />
      )
    }

    // Fallback for unknown media types
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-xs">📷</span>
      </div>
    )
  }

  const getPostTypeHelperText = () => {
    if (postType === "post") {
      if (postToFacebook && postToInstagram) {
        return "Single image or video post to both platforms. Instagram requires media."
      } else if (postToFacebook) {
        return "Text post with optional image or video for Facebook."
      } else if (postToInstagram) {
        return "Single image or video post for Instagram. Media is required."
      }
    } else if (postType === "reel") {
      if (postToFacebook && postToInstagram) {
        return "Short video content for both platforms. Max 90 seconds."
      } else if (postToFacebook) {
        return "Short video content for Facebook."
      } else if (postToInstagram) {
        return "Short video content for Instagram. Max 90 seconds."
      }
    } else if (postType === "carousel") {
      if (postToFacebook && postToInstagram) {
        return "2-10 images for both platforms. Videos not supported when posting to both."
      } else if (postToFacebook) {
        return "2-10 images for Facebook carousel."
      } else if (postToInstagram) {
        return "2-10 images or videos for Instagram carousel."
      }
    }
    return ""
  }

  const handleEmojiClick = (emojiData: any) => {
    setPostContent((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleHashtagClick = (hashtag: string) => {
    setPostContent((prev) => prev + " " + hashtag)
    // setShowHashtagPicker(false)
  }

  // Popular hashtags for different categories
  const popularHashtags = [
    "#love",
    "#instagood",
    "#photooftheday",
    "#fashion",
    "#beautiful",
    "#happy",
    "#cute",
    "#tbt",
    "#like4like",
    "#followme",
    "#picoftheday",
    "#follow",
    "#me",
    "#selfie",
    "#summer",
    "#art",
    "#instadaily",
    "#friends",
    "#repost",
    "#nature",
    "#girl",
    "#fun",
    "#style",
    "#smile",
    "#food",
    "#instalike",
    "#family",
    "#travel",
    "#fitness",
    "#igers",
    "#tagsforlikes",
    "#follow4follow",
    "#nofilter",
    "#life",
    "#beauty",
    "#amazing",
    "#instamood",
    "#sun",
    "#followforfollow",
    "#bestoftheday",
    "#business",
    "#entrepreneur",
    "#success",
    "#motivation",
    "#marketing",
    "#startup",
    "#innovation",
    "#leadership",
    "#growth",
    "#strategy",
  ]

  const searchPeopleForMention = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setMentionSuggestions([])
      return
    }

    setIsSearchingMentions(true)
    try {
      const token = selectedFacebookPage?.access_token || facebookAccessToken
      if (!token) {
        return
      }

      // Search for Facebook friends/pages
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/friends?access_token=${token}&fields=id,name&limit=10`,
      )

      if (response.ok) {
        const data = await response.json()
        const filtered = (data.data || []).filter((friend: any) =>
          friend.name.toLowerCase().includes(query.toLowerCase()),
        )
        setMentionSuggestions(filtered)
      }
    } catch (err) {
      console.error("Mention search error:", err)
    } finally {
      setIsSearchingMentions(false)
    }
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart

    setPostContent(value)
    setMentionCursorPosition(cursorPos)

    // Detect @ symbol and extract search query
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionSearchQuery(textAfterAt)
        setShowMentionDropdown(true)
        searchPeopleForMention(textAfterAt)
      } else {
        setShowMentionDropdown(false)
      }
    } else {
      setShowMentionDropdown(false)
    }
  }

  const handleSelectMention = (person: { id: string; name: string }) => {
    if (!textareaRef.current) return

    const cursorPos = mentionCursorPosition
    const textBeforeCursor = postContent.substring(0, cursorPos)
    const textAfterCursor = postContent.substring(cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const newText = postContent.substring(0, lastAtIndex) + `@${person.name} ` + textAfterCursor

      setPostContent(newText)

      // Store the mapping of name to ID
      const newMap = new Map(taggedPeopleMap)
      newMap.set(person.name, person.id)
      setTaggedPeopleMap(newMap)

      setShowMentionDropdown(false)
      setMentionSearchQuery("")

      // Focus back on textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = lastAtIndex + person.name.length + 2 // +2 for @ and space
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    }
  }

  const extractTaggedPeople = (): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const matches = postContent.matchAll(mentionRegex)
    const taggedIds: string[] = []

    for (const match of matches) {
      const name = match[1]
      const id = taggedPeopleMap.get(name)
      if (id) {
        taggedIds.push(id)
      }
    }

    return taggedIds
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black font-serif text-primary">Social Media Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center gap-4">
                {selectedFacebookPage && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Facebook className="h-3 w-3 mr-1" />
                      {selectedFacebookPage.name}
                      <DropdownMenu open={showPageSwitcher} onOpenChange={setShowPageSwitcher}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>Switch Facebook Page</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {facebookPages.map((page) => (
                            <DropdownMenuItem
                              key={page.id}
                              onClick={() => {
                                handlePageSelection(page)
                                setShowPageSwitcher(false)
                              }}
                              className={selectedFacebookPage?.id === page.id ? "bg-blue-50" : ""}
                            >
                              <div className="flex items-center gap-2">
                                {page.picture?.data?.url && (
                                  <Image
                                    src={page.picture.data.url || "/placeholder.svg"}
                                    alt={page.name}
                                    width={16}
                                    height={16}
                                    className="h-4 w-4 rounded-full"
                                  />
                                )}
                                <span className="truncate">{page.name}</span>
                                {selectedFacebookPage?.id === page.id && (
                                  <Check className="h-3 w-3 ml-auto text-green-600" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                        onClick={disconnectFacebook}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}
                {selectedInstagramAccount && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                      <Instagram className="h-3 w-3 mr-1" />@{selectedInstagramAccount.username}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>Switch Instagram Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {instagramAccounts.map((account) => (
                            <DropdownMenuItem
                              key={account.id}
                              onClick={() => handleInstagramSelection(account)}
                              className={selectedInstagramAccount?.id === account.id ? "bg-pink-50" : ""}
                            >
                              <div className="flex items-center gap-2">
                                {account.profile_picture_url && (
                                  <Image
                                    src={account.profile_picture_url || "/placeholder.svg"}
                                    alt={account.username}
                                    width={16}
                                    height={16}
                                    className="h-4 w-4 rounded-full"
                                  />
                                )}
                                <span className="truncate">@{account.username}</span>
                                {selectedInstagramAccount?.id === account.id && (
                                  <Check className="h-3 w-3 ml-auto text-green-600" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                        onClick={disconnectInstagram}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}
              </div>
              <Button onClick={() => setShowPostModal(true)} disabled={!isFacebookTokenSet && !isInstagramTokenSet}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
              <Button variant="outline" onClick={() => setShowTokenModal(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif">Social Media Dashboard</h2>
            <p className="text-muted-foreground">Manage your Facebook and Instagram presence from one place.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {/* <TabsTrigger value="overview">Overview</TabsTrigger> */}
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              {/* <TabsTrigger value="demographics">Demographics</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(facebookInsights?.page_fans || 0) + (instagramInsights?.follower_count || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookInsights?.page_fans || 0} | IG: {instagramInsights?.follower_count || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(facebookInsights?.page_impressions || 0) + (instagramInsights?.impressions || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookInsights?.page_impressions || 0} | IG: {instagramInsights?.impressions || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(facebookInsights?.page_engaged_users || 0) + (instagramInsights?.reach || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookInsights?.page_engaged_users || 0} | IG: {instagramInsights?.reach || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{facebookPosts.length + instagramPosts.length}</div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookPosts.length} | IG: {instagramPosts.length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
                <TabsList>
                  <TabsTrigger value="facebook" disabled={!isFacebookTokenSet}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </TabsTrigger>
                  <TabsTrigger value="instagram" disabled={!isInstagramTokenSet}>
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="facebook">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(facebookInsights?.page_fans || 0) + (instagramInsights?.follower_count || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          FB: {facebookInsights?.page_fans || 0} | IG: {instagramInsights?.follower_count || 0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(facebookInsights?.page_impressions || 0) + (instagramInsights?.impressions || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          FB: {facebookInsights?.page_impressions || 0} | IG: {instagramInsights?.impressions || 0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(facebookInsights?.page_engaged_users || 0) + (instagramInsights?.reach || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          FB: {facebookInsights?.page_engaged_users || 0} | IG: {instagramInsights?.reach || 0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{facebookPosts.length + instagramPosts.length}</div>
                        <p className="text-xs text-muted-foreground">
                          FB: {facebookPosts.length} | IG: {instagramPosts.length}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {facebookInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Page Fans</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{facebookInsights.page_fans}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Page Impressions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{facebookInsights.page_impressions}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Engaged Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{facebookInsights.page_engaged_users}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Page Views</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{facebookInsights.page_views}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="instagram">
                  {selectedInstagramAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Username</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedInstagramAccount.username}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {selectedInstagramAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Followers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedInstagramAccount.followers_count}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {instagramInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">website clicks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{instagramInsights.website_clicks}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Impressions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{instagramInsights.impressions}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Reach</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{instagramInsights.reach}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Profile Views</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{instagramInsights.profile_views}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              <div className="grid gap-6">
                {/* Facebook Posts */}
                {isFacebookTokenSet && facebookPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      Facebook Posts
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {facebookPosts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            {post.full_picture && (
                              <img
                                src={post.full_picture || "/placeholder.svg"}
                                alt="Post"
                                className="w-full h-48 object-cover rounded-lg mb-3"
                              />
                            )}
                            <p className="text-sm text-gray-600 mb-2">{post.message || post.story || "No caption"}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>👍 {post.likes?.summary?.total_count || 0}</span>
                              <span>💬 {post.comments?.summary?.total_count || 0}</span>
                              <span>🔄 {post.shares?.count || 0}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(post.created_time).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instagram Posts */}
                {isInstagramTokenSet && instagramPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      Instagram Posts
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {instagramPosts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            {(post.media_url || post.thumbnail_url) && (
                              <img
                                src={post.media_url || post.thumbnail_url}
                                alt="Post"
                                className="w-full h-48 object-cover rounded-lg mb-3"
                              />
                            )}
                            <p className="text-sm text-gray-600 mb-2">{post.caption || "No caption"}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>❤️ {post.like_count || 0}</span>
                              <span>💬 {post.comments_count || 0}</span>
                              <span className="capitalize">{post.media_type}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No posts message */}
                {(!isFacebookTokenSet || facebookPosts.length === 0) &&
                  (!isInstagramTokenSet || instagramPosts.length === 0) && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No posts available. Connect your accounts to see posts.</p>
                    </div>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
              {demographics && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Age & Gender Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Age & Gender Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {demographics.age_gender.map((item: any) => (
                          <div key={item.age} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.age}</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-blue-600">M: {item.male}</span>
                              <span className="text-pink-600">F: {item.female}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Countries */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Countries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* @ts-ignore */}
                        {demographics.countries.map((item) => (
                          <div key={item.country} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.country}</span>
                            <span className="text-sm text-gray-600">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Cities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Cities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* @ts-ignore */}
                        {demographics.cities.map((item) => (
                          <div key={item.city} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.city}</span>
                            <span className="text-sm text-gray-600">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {!demographics && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No demographic data available. Connect Facebook to see demographics.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {postAnalytics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Post Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {postAnalytics.map((analytics, index) => {
                        const post = facebookPosts.find((p) => p.id === analytics.post_id)
                        return (
                          <div key={analytics.post_id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">Post #{index + 1}</h4>
                              <span className="text-xs text-gray-500">
                                {post ? new Date(post.created_time).toLocaleDateString() : ""}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {post?.message || post?.story || "No caption"}
                            </p>
                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold">{analytics.impressions}</div>
                                <div className="text-xs text-gray-500">Impressions</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold">{analytics.reach}</div>
                                <div className="text-xs text-gray-500">Reach</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold">{analytics.engagement}</div>
                                <div className="text-xs text-gray-500">Engagement</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold">{analytics.clicks}</div>
                                <div className="text-xs text-gray-500">Clicks</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              {postAnalytics.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No post analytics available. Connect Facebook and wait for posts to load.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Social Media Accounts</DialogTitle>
            <DialogDescription>
              Connect your Facebook and Instagram accounts to start managing your social media.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => initiateOAuth("facebook")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Connect Facebook
            </Button>

            <Button
              onClick={() => initiateOAuth("instagram")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              disabled={isLoading}
            >
              <Instagram className="h-4 w-4 mr-2" />
              Connect Instagram
            </Button>

            <div className="text-center text-sm text-muted-foreground">You can connect one or both platforms</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPageModal} onOpenChange={setShowPageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Your Accounts</DialogTitle>
            <DialogDescription>Choose which accounts to use for posting and analytics.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {instagramAccounts.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  Instagram Accounts
                </Label>
                {instagramAccounts.map((account) => (
                  <Button
                    key={account.id}
                    variant={selectedInstagramAccount?.id === account.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleInstagramSelection(account)}
                  >
                    {account.profile_picture_url && (
                      <Image
                        src={account.profile_picture_url || "/placeholder.svg"}
                        alt={account.username}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full mr-2"
                      />
                    )}
                    @{account.username}
                    {selectedInstagramAccount?.id === account.id && <span className="ml-auto text-green-600">✓</span>}
                  </Button>
                ))}
              </div>
            )}
            {facebookPages.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook Pages
                </Label>
                {facebookPages.map((page) => (
                  <Button
                    key={page.id}
                    variant={selectedFacebookPage?.id === page.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handlePageSelection(page)}
                  >
                    {page.name}
                    {selectedFacebookPage?.id === page.id && <span className="ml-auto text-green-600">✓</span>}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>Share content across your social media platforms</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="space-y-2">
              <Label>Post Type</Label>
              <div className="flex space-x-2">
                <Button
                  variant={postType === "post" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPostType("post")
                    setSelectedFiles([])
                    setFilePreviews([])
                  }}
                >
                  Regular Post
                </Button>
                <Button
                  variant={postType === "reel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPostType("reel")
                    setSelectedFiles([])
                    setFilePreviews([])
                  }}
                >
                  Reel/Video
                </Button>
                <Button
                  variant={postType === "carousel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPostType("carousel")
                    setSelectedFiles([])
                    setFilePreviews([])
                  }}
                >
                  Carousel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getPostTypeHelperText()}</p>
            </div>

            <div className="space-y-2">
              <Label>Platform Selection</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="facebook"
                    checked={postToFacebook}
                    // @ts-ignore
                    onCheckedChange={setPostToFacebook}
                    disabled={!selectedFacebookPage}
                  />
                  <Label htmlFor="facebook" className="flex items-center space-x-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span>Facebook</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instagram"
                    checked={postToInstagram}
                    // @ts-ignore
                    onCheckedChange={setPostToInstagram}
                    disabled={!selectedInstagramAccount}
                  />
                  <Label htmlFor="instagram" className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    <span>Instagram</span>
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content">{postType === "reel" ? "Video Description" : "Post Content"}</Label>
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  id="post-content"
                  placeholder={
                    postType === "reel"
                      ? "Describe your reel... (Type @ to mention people)"
                      : postType === "carousel"
                        ? "Caption for your carousel... (Type @ to mention people)"
                        : "What's on your mind? (Type @ to mention people)"
                  }
                  value={postContent}
                  onChange={handleCaptionChange}
                  className="min-h-[120px] pr-20"
                />

                {showMentionDropdown && (
                  <div className="absolute z-50 mt-1 w-64 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {isSearchingMentions ? (
                      <div className="p-2 text-sm text-muted-foreground">Searching...</div>
                    ) : mentionSuggestions.length > 0 ? (
                      mentionSuggestions.map((person) => (
                        <button
                          key={person.id}
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2"
                          onClick={() => handleSelectMention(person)}
                        >
                          <Users className="h-4 w-4" />
                          {person.name}
                        </button>
                      ))
                    ) : mentionSearchQuery.length >= 2 ? (
                      <div className="p-2 text-sm text-muted-foreground">No people found</div>
                    ) : null}
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker)
                        setShowHashtagPicker(false)
                      }}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute top-8 right-0 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowHashtagPicker(!showHashtagPicker)
                        setShowEmojiPicker(false)
                      }}
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                    {showHashtagPicker && (
                      <div className="absolute top-8 right-0 z-50 w-80 max-h-60 bg-white border rounded-lg shadow-lg overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="p-3">
                            <h4 className="font-medium mb-2">Popular Hashtags</h4>
                            <div className="flex flex-wrap gap-1">
                              {popularHashtags.map((hashtag) => (
                                <Button
                                  key={hashtag}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs bg-transparent"
                                  onClick={() => handleHashtagClick(hashtag)}
                                >
                                  {hashtag}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>
                  {postContent.length}/{selectedPlatforms.includes("instagram") ? "2,200" : "63,206"} characters
                </span>
                <span className="text-xs">
                  {selectedPlatforms.includes("instagram") && postContent.length > 2200 && (
                    <span className="text-red-500">Instagram limit exceeded</span>
                  )}
                  {selectedPlatforms.includes("facebook") && postContent.length > 63206 && (
                    <span className="text-red-500">Facebook limit exceeded</span>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add to your post</Label>
              <div className="flex items-center space-x-2 flex-wrap"></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-upload">
                {postType === "reel"
                  ? "Video (Required)"
                  : postType === "carousel"
                    ? "Images (2-10 required)"
                    : "Media (Optional)"}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="media-upload"
                  type="file"
                  accept={postType === "reel" ? "video/*" : postType === "carousel" ? "image/*" : "image/*,video/*"}
                  multiple={postType === "carousel"}
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {selectedFiles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFiles([])
                      setFilePreviews([])
                      setFileTypes([]) // Clear file types as well
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {filePreviews.length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {selectedFiles[index]?.type.startsWith("video/") ? (
                          <video src={preview} className="h-24 w-full object-cover rounded border" controls />
                        ) : (
                          <Image
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={100}
                            className="h-24 w-full object-cover rounded border"
                          />
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {postToFacebook && !postToInstagram && (
              <>
                <div className="flex items-center space-x-2">
                  {/* @ts-ignore */}
                  <Checkbox id="schedule" checked={isScheduled} onCheckedChange={setIsScheduled} />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduled-date">Date</Label>
                      <Input
                        id="scheduled-date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduled-time">Time</Label>
                      <Input
                        id="scheduled-time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {postToInstagram && isScheduled && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                Instagram does not support scheduled posts. Uncheck Instagram to schedule to Facebook only.
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPostModal(false)}>
                Cancel
              </Button>
              <Button onClick={handlePost} disabled={isPosting}>
                {isPosting ? (
                  "Posting..."
                ) : isScheduled ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule {postType === "reel" ? "Reel" : postType === "carousel" ? "Carousel" : "Post"}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post {postType === "reel" ? "Reel" : postType === "carousel" ? "Carousel" : "Now"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
