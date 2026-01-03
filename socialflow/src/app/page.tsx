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
  Loader2,
  Upload,
  CheckCircle,
  Clock,
  Share2,
  MessageCircle,
  Music,
  Play,
  ExternalLink,
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
import { Progress } from "@/components/ui/progress"
import { useEdgeStore } from "@/lib/edgestore"
import { Video } from "@/components/ui/video"
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

interface PinterestBoard {
  id: string
  name: string
  description?: string
  pin_count?: number
}

interface PinterestAccount {
  id: string
  username: string
  full_name?: string
  profile_picture?: string
  board_count?: number
}

interface ThreadsAccount {
  id: string
  username: string
  name: string
  profile_picture_url?: string
  followers_count?: number
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

interface PinterestPin {
  id: string
  title?: string
  description?: string
  // API v5 nests image data inside 'media'
  media?: {
    media_type?: string
    images?: {
      [key: string]: {
        url: string
        width?: number
        height?: number
      }
    }
  }
  created_at: string
  // These metrics might not be available in the basic list view, keeping them optional
  like_count?: number
  comment_count?: number
  link?: string
}

interface ThreadsPost {
  id: string
  text?: string
  media_url?: string
  timestamp: string
  like_count?: number
  reply_count?: number
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

interface PinterestInsights {
  pin_impressions: number
  total_engagements: number
  pin_clicks: number
  outbound_clicks: number
  follower_count: number
  pin_count: number
}

interface ThreadsInsights {
  impressions: number
  reach: number
  profile_views: number
  follower_count: number
  engagement: number
}

interface Demographics {
  age_gender: any
  countries: any
  cities: any
}

interface TikTokAccount {
  open_id: string
  union_id: string
  display_name: string
  avatar_url?: string
  follower_count?: number
}

interface TikTokVideo {
  id: string
  title: string
  cover_image_url?: string
  video_url?: string
  embed_html?: string
  embed_link?: string
  share_url?: string
  create_time: number
  like_count?: number
  comment_count?: number
  share_count?: number
  view_count?: number
}

interface TikTokInsights {
  likes: number
  comments: number
  shares: number
  views: number
  followers: number
}

interface PostAnalytics {
  post_id: string
  impressions: number
  reach: number
  engagement: number
  clicks: number
}

export default function DashboardPage() {
  // EdgeStore hook
  const { edgestore } = useEdgeStore()

  const [facebookAccessToken, setFacebookAccessToken] = useState("")
  const [instagramAccessToken, setInstagramAccessToken] = useState("")
  const [pinterestAccessToken, setPinterestAccessToken] = useState("")
  const [threadsAccessToken, setThreadsAccessToken] = useState("")
  const [tiktokAccessToken, setTikTokAccessToken] = useState("")

  const [isFacebookTokenSet, setIsFacebookTokenSet] = useState(false)
  const [isInstagramTokenSet, setIsInstagramTokenSet] = useState(false)
  const [isPinterestTokenSet, setIsPinterestTokenSet] = useState(false)
  const [isThreadsTokenSet, setIsThreadsTokenSet] = useState(false)
  const [isTikTokTokenSet, setIsTikTokTokenSet] = useState(false)

  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [pinterestAccounts, setPinterestAccounts] = useState<PinterestAccount[]>([])
  const [pinterestBoards, setPinterestBoards] = useState<PinterestBoard[]>([])
  const [threadsAccounts, setThreadsAccounts] = useState<ThreadsAccount[]>([])
  const [tiktokAccounts, setTikTokAccounts] = useState<TikTokAccount[]>([])

  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<InstagramAccount | null>(null)
  const [selectedPinterestAccount, setSelectedPinterestAccount] = useState<PinterestAccount | null>(null)
  const [selectedPinterestBoard, setSelectedPinterestBoard] = useState<PinterestBoard | null>(null)
  const [selectedThreadsAccount, setSelectedThreadsAccount] = useState<ThreadsAccount | null>(null)
  const [selectedTikTokAccount, setSelectedTikTokAccount] = useState<TikTokAccount | null>(null)

  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([])
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
  const [pinterestPins, setPinterestPins] = useState<PinterestPin[]>([])
  const [threadsPosts, setThreadsPosts] = useState<ThreadsPost[]>([])
  const [tiktokVideos, setTikTokVideos] = useState<TikTokVideo[]>([])

  const [facebookInsights, setFacebookInsights] = useState<FacebookInsights | null>(null)
  const [instagramInsights, setInstagramInsights] = useState<InstagramInsights | null>(null)
  const [pinterestInsights, setPinterestInsights] = useState<PinterestInsights | null>(null)
  const [threadsInsights, setThreadsInsights] = useState<ThreadsInsights | null>(null)
  const [tiktokInsights, setTikTokInsights] = useState<TikTokInsights | null>(null)

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

  const [postToFacebook, setPostToFacebook] = useState(false)
  const [postToInstagram, setPostToInstagram] = useState(false)
  const [postToPinterest, setPostToPinterest] = useState(false)
  const [postToThreads, setPostToThreads] = useState(false)
  const [postToTikTok, setPostToTikTok] = useState(false)

  const [postType, setPostType] = useState<"post" | "reel" | "carousel" | "pin">("post")
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

  // Pinterest specific states
  const [pinTitle, setPinTitle] = useState("")
  const [pinDescription, setPinDescription] = useState("")
  const [pinLink, setPinLink] = useState("")
  const [newBoardName, setNewBoardName] = useState("")
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  // New states for posting status and upload progress
  const [postingStatus, setPostingStatus] = useState<{
    isPosting: boolean
    message: string
    progress: number
    currentStep: string
    estimatedTime?: string
  }>({
    isPosting: false,
    message: "",
    progress: 0,
    currentStep: ""
  })

  const [uploadProgress, setUploadProgress] = useState<{
    isUploading: boolean
    progress: number
    currentFile: string
    totalFiles: number
    currentFileIndex: number
  }>({
    isUploading: false,
    progress: 0,
    currentFile: "",
    totalFiles: 0,
    currentFileIndex: 0
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const savedFacebookToken = localStorage.getItem("facebook_access_token")
    const savedInstagramToken = localStorage.getItem("instagram_access_token")
    const savedPinterestToken = localStorage.getItem("pinterest_access_token")
    const savedThreadsToken = localStorage.getItem("threads_access_token")
    const savedTikTokToken = localStorage.getItem("tiktok_access_token")

    const savedFacebookPage = localStorage.getItem("selected_facebook_page")
    const savedInstagramAccount = localStorage.getItem("selected_instagram_account")
    const savedPinterestAccount = localStorage.getItem("selected_pinterest_account")
    const savedPinterestBoard = localStorage.getItem("selected_pinterest_board")
    const savedThreadsAccount = localStorage.getItem("selected_threads_account")
    const savedTikTokAccount = localStorage.getItem("selected_tiktok_account")

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

    if (savedPinterestToken) {
      setPinterestAccessToken(savedPinterestToken)
      setIsPinterestTokenSet(true)
      fetchPinterestAccounts(savedPinterestToken)
      setSelectedPlatforms((prev) => [...prev, "pinterest"])
    }

    if (savedThreadsToken) {
      setThreadsAccessToken(savedThreadsToken)
      setIsThreadsTokenSet(true)
      fetchThreadsAccounts(savedThreadsToken)
      setSelectedPlatforms((prev) => [...prev, "threads"])
    }

    if (savedFacebookPage) {
      setSelectedFacebookPage(JSON.parse(savedFacebookPage))
    }

    if (savedInstagramAccount) {
      setSelectedInstagramAccount(JSON.parse(savedInstagramAccount))
    }

    if (savedPinterestAccount) {
      setSelectedPinterestAccount(JSON.parse(savedPinterestAccount))
    }

    if (savedPinterestBoard) {
      setSelectedPinterestBoard(JSON.parse(savedPinterestBoard))
    }

    if (savedThreadsAccount) {
      setSelectedThreadsAccount(JSON.parse(savedThreadsAccount))
    }

    if (savedTikTokToken) {
      setTikTokAccessToken(savedTikTokToken)
      setIsTikTokTokenSet(true)
      fetchTikTokAccounts(savedTikTokToken)
      setSelectedPlatforms((prev) => [...prev, "tiktok"])
    }

    if (savedTikTokAccount) {
      setSelectedTikTokAccount(JSON.parse(savedTikTokAccount))
    }

    // Show token modal only if neither platform is connected
    if (!savedFacebookToken && !savedInstagramToken && !savedPinterestToken && !savedThreadsToken) {
      setShowTokenModal(true)
    } else {
      setShowTokenModal(false)
    }
  }, [])

  const initiateOAuth = (platform: "facebook" | "instagram" | "pinterest" | "threads" | "tiktok") => {
    let authUrl = ""
    let clientId = ""
    let redirectUri = ""
    let scope = ""

    if (platform === "facebook" || platform === "instagram") {
      clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ""
      if (!clientId) {
        setError("Facebook App ID not configured")
        return
      }

      redirectUri = `${window.location.origin}/auth/${platform}/callback`

      if (platform === "facebook") {
        scope = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,business_management,read_insights,pages_manage_metadata"
      } else {
        scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,instagram_manage_insights"
      }

      authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${platform}`
    }
    else if (platform === "pinterest") {
      clientId = process.env.NEXT_PUBLIC_PINTEREST_APP_ID || "";
      if (!clientId) {
        setError("Pinterest Client ID not configured");
        return;
      }

      redirectUri = `${window.location.origin}/auth/pinterest/callback`;
      scope = "user_accounts:read,boards:read,boards:write,pins:read,pins:write";
      authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(
        scope
      )}&response_type=code&state=pinterest`;
    }
    else if (platform === "threads") {
      // Threads uses Facebook Graph API
      clientId = process.env.NEXT_PUBLIC_THREADS_APP_ID || ""
      if (!clientId) {
        setError("Threads App ID not configured")
        return
      }

      redirectUri = `${window.location.origin}/auth/threads/callback`
      scope = "threads_basic,threads_content_publish"

      authUrl = `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`
    }
    else if (platform === "tiktok") {
      clientId = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || ""
      if (!clientId) {
        setError("TikTok Client Key not configured")
        return
      }

      redirectUri = `${window.location.origin}/auth/tiktok/callback`
      scope = "user.info.basic,user.info.stats,video.list,video.upload,video.publish"

      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`
    }

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
          } else if (platform === "instagram") {
            setInstagramAccessToken(savedToken)
            setIsInstagramTokenSet(true)
            fetchInstagramAccounts(savedToken)
            setSelectedPlatforms((prev) => [...prev, "instagram"])
          } else if (platform === "pinterest") {
            setPinterestAccessToken(savedToken)
            setIsPinterestTokenSet(true)
            fetchPinterestAccounts(savedToken)
            setSelectedPlatforms((prev) => [...prev, "pinterest"])
          } else if (platform === "threads") {
            setThreadsAccessToken(savedToken)
            setIsThreadsTokenSet(true)
            fetchThreadsAccounts(savedToken)
            setSelectedPlatforms((prev) => [...prev, "threads"])
          } else if (platform === "tiktok") {
            setTikTokAccessToken(savedToken)
            setIsTikTokTokenSet(true)
            fetchTikTokAccounts(savedToken)
            setSelectedPlatforms((prev) => [...prev, "tiktok"])
          }
          setShowTokenModal(false)
          setShowPageModal(true)
          window.location.reload()
        }
      }
    }, 1000)
  }

  const fetchFacebookPages = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/me/accounts?access_token=${token}&fields=id,name,access_token,picture`,
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
        `https://graph.facebook.com/v24.0/me/accounts?access_token=${token}&fields=id,name,access_token`,
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
            `https://graph.facebook.com/v24.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`,
          )

          if (igResponse.ok) {
            const igData = await igResponse.json()

            if (igData.instagram_business_account) {
              const igAccountResponse = await fetch(
                `https://graph.facebook.com/v24.0/${igData.instagram_business_account.id}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${page.access_token}`,
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

  const fetchPinterestAccounts = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      // UPDATED: Call your local proxy instead of api.pinterest.com
      const userResponse = await fetch(`/api/pinterest/proxy?endpoint=/user_account`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!userResponse.ok) {
        throw new Error("Failed to fetch Pinterest user account")
      }

      const userData = await userResponse.json()

      const account: PinterestAccount = {
        id: userData.id,
        username: userData.username,
        full_name: userData.full_name,
        profile_picture: userData.profile_image,
      }

      setPinterestAccounts([account])
      setSelectedPinterestAccount(account)
      localStorage.setItem("selected_pinterest_account", JSON.stringify(account))

      // UPDATED: Fetch boards via proxy
      const boardsResponse = await fetch(`/api/pinterest/proxy?endpoint=/boards&params=page_size=25`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (boardsResponse.ok) {
        const boardsData = await boardsResponse.json()
        setPinterestBoards(boardsData.items || [])

        if (boardsData.items && boardsData.items.length > 0 && !selectedPinterestBoard) {
          setSelectedPinterestBoard(boardsData.items[0])
          localStorage.setItem("selected_pinterest_board", JSON.stringify(boardsData.items[0]))
        }
      }

      // Fetch pins
      fetchPinterestPins(token)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Pinterest account")
    } finally {
      setIsLoading(false)
    }
  }

  // In src/app/page.tsx

  const fetchThreadsAccounts = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      // UPDATED: Use proxy
      const response = await fetch(
        `/api/threads/proxy?endpoint=/me&params=fields=id,username,name,threads_profile_picture_url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }
      )

      if (response.ok) {
        const data = await response.json()
        // ... (rest of logic remains the same)
        const account: ThreadsAccount = {
          id: data.id,
          username: data.username,
          name: data.name || data.username,
          profile_picture_url: data.threads_profile_picture_url,
          followers_count: 0
        }
        setThreadsAccounts([account])
        if (!selectedThreadsAccount) {
          setSelectedThreadsAccount(account)
          localStorage.setItem("selected_threads_account", JSON.stringify(account))
        }
      } else {
        throw new Error("Failed to fetch Threads profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Threads accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFacebookPagePosts = async (page: FacebookPage) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}/posts?access_token=${page.access_token}&fields=id,message,story,full_picture,created_time,likes.summary(true),comments.summary(true),shares&limit=10`,
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
        `https://graph.facebook.com/v24.0/${account.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=10&access_token=${(account as any).access_token}`,
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

  const fetchPinterestPins = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      // UPDATED: Call proxy for pins
      const response = await fetch(`/api/pinterest/proxy?endpoint=/pins&params=page_size=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch Pinterest pins")
      }

      const data = await response.json()
      setPinterestPins(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Pinterest pins")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchThreadsPosts = async (account: ThreadsAccount) => {
    setIsLoading(true)
    setError("")

    try {
      // UPDATED: Use proxy
      const response = await fetch(
        `/api/threads/proxy?endpoint=/me/threads&params=fields=id,text,media_url,timestamp,like_count,reply_count&limit=10`, {
        headers: { 'Authorization': `Bearer ${threadsAccessToken}` }
      }
      )

      if (!response.ok) throw new Error("Failed to fetch Threads posts")

      const data = await response.json()
      setThreadsPosts(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTikTokAccounts = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      // TikTok API 'user.info.basic' returns open_id, union_id, avatar_url, display_name
      // URL: https://open.tiktokapis.com/v2/user/info/
      const response = await fetch(
        `/api/tiktok/proxy?endpoint=/user/info/&params=fields=open_id,union_id,avatar_url,display_name,follower_count`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const data = await response.json()
        const userData = data.data?.user || {}

        const account: TikTokAccount = {
          open_id: userData.open_id,
          union_id: userData.union_id,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
          follower_count: userData.follower_count || 0
        }

        setTikTokAccounts([account])
        if (!selectedTikTokAccount) {
          setSelectedTikTokAccount(account)
          localStorage.setItem("selected_tiktok_account", JSON.stringify(account))
        }

        fetchTikTokVideos(token)
      } else {
        throw new Error("Failed to fetch TikTok profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch TikTok accounts")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTikTokVideos = async (token: string) => {
    setIsLoading(true)
    setError("")

    try {
      // URL: https://open.tiktokapis.com/v2/video/list/
      const queryParams = new URLSearchParams({
        endpoint: '/video/list/',
        params: 'fields=id,title,cover_image_url,video_description,create_time,like_count,comment_count,share_count,view_count,embed_html,embed_link,share_url&max_count=10'
      })

      const response = await fetch(
        `/api/tiktok/proxy?${queryParams.toString()}`,
        {
          method: "POST", // video/list is POST
          headers: { 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({}) // Pagination payload if needed
        }
      )

      if (response.ok) {
        const data = await response.json()
        setTikTokVideos(data.data?.videos || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTikTokInsights = async (account: TikTokAccount) => {
    // Simplified mock or basic calculation as TikTok insights API might require different scopes/permissions
    // This is a placeholder for structure
    setTikTokInsights({
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      followers: account.follower_count || 0
    })
  }

  const fetchPageInsights = async (page: FacebookPage) => {
    try {
      const dailyResponse = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}/insights?metric=page_media_view,page_follows,page_post_engagements&period=day&access_token=${page.access_token}`,
      )
      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json()
        console.log("Fetched Page Insights Data:", dailyData)
        const insightsData: FacebookInsights = {
          page_impressions: 0,
          page_engaged_users: 0,
          page_fans: 0,
          page_views: 0,
          page_posts_impressions: 0,
          page_video_views: 0,
          page_actions_post_reactions_total: 0,
        }

        // Map API response to your object
        dailyData.data?.forEach((metric: any) => {
          const latestValue = metric.values?.[metric.values.length - 1]?.value || 0
          switch (metric.name) {
            case 'page_media_view':
              insightsData.page_video_views = latestValue
              break
            case 'page_follows':
              insightsData.page_fans = latestValue
              break
            case 'page_post_engagements':
              insightsData.page_engaged_users = latestValue
              break
            // Add more cases if you add other metrics
          }
        })

        setFacebookInsights(insightsData)
      }

      const weeklyResponse = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}/insights?metric=page_media_view,page_lifetime_engaged_followers_unique&period=week&access_token=${page.access_token}`,
      )
      console.log("weeklyResponse", weeklyResponse)

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json()
      }

      const demoResponse = await fetch(
        `https://graph.facebook.com/v24.0/${page.id}/insights?metric=page_follows_country,page_follows_city&period=lifetime&access_token=${page.access_token}`,
      )
      console.log("demoResponse", demoResponse)

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
          } else if (metric.name === "page_follows_country") {
            demographics.countries = Object.entries(latestValue)
              .map(([country, value]) => ({
                country,
                value: value as number,
              }))
              .slice(0, 10)
          } else if (metric.name === "page_follows_city") {
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
      const baseUrl = `https://graph.facebook.com/v24.0/${account.id}/insights`

      // Metrics that do not need metric_type
      const normalMetrics = "reach,follower_count"

      // Metrics that need metric_type=total_value
      const totalMetrics = "website_clicks,profile_views,views"

      // Fetch reach and follower_count (no metric_type)
      const res1 = await fetch(
        `${baseUrl}?metric=${normalMetrics}&period=day&access_token=${(account as any).access_token}`,
      )

      // Fetch website_clicks, profile_views, and views (with metric_type=total_value)
      const res2 = await fetch(
        `${baseUrl}?metric=${totalMetrics}&period=day&metric_type=total_value&access_token=${(account as any).access_token}`,
      )

      if (!res1.ok || !res2.ok) {
        console.error("Error fetching Instagram insights:", await res1.text(), await res2.text())
        return
      }

      const data1 = await res1.json()
      const data2 = await res2.json()

      // Combine all data arrays
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
          case "views":
            insights.impressions = value // impressions now uses views
            break
        }
      })

      setInstagramInsights(insights)
    } catch (err) {
      console.error("Failed to fetch Instagram insights:", err)
    }
  }


  const fetchPinterestInsights = async (account: PinterestAccount) => {
    try {
      // Create dynamic dates for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Build the query parameters
      // 1. CHANGED: Replaced "CLICKTHROUGH" with "PIN_CLICK"
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        metric_types: "IMPRESSION,ENGAGEMENT,PIN_CLICK,OUTBOUND_CLICK",
        app_types: "ALL"
      });

      // Call your local proxy
      const response = await fetch(`/api/pinterest/proxy?endpoint=/user_account/analytics&params=${encodeURIComponent(queryParams.toString())}`, {
        headers: {
          'Authorization': `Bearer ${pinterestAccessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()

        const insights: PinterestInsights = {
          pin_impressions: 0,
          total_engagements: 0,
          pin_clicks: 0,
          outbound_clicks: 0,
          follower_count: 0,
          pin_count: pinterestPins.length,
        }

        // Map the summary metrics if available
        if (data.summary?.metrics) {
          insights.pin_impressions = data.summary.metrics.IMPRESSION || 0;
          insights.total_engagements = data.summary.metrics.ENGAGEMENT || 0;
          // 2. CHANGED: Map data.summary.metrics.PIN_CLICK to your state
          insights.pin_clicks = data.summary.metrics.PIN_CLICK || 0;
          insights.outbound_clicks = data.summary.metrics.OUTBOUND_CLICK || 0;
        }

        setPinterestInsights(insights)
      } else {
        const errorData = await response.json(); // Parse JSON error to see details
        console.error("Pinterest analytics error:", errorData);
      }
    } catch (err) {
      console.error("Failed to fetch Pinterest insights:", err)
    }
  }
  const fetchThreadsInsights = async (account: ThreadsAccount) => {
    try {
      // Threads User Insights (using the proxy)
      // Valid metrics for Threads User Insights: views, likes, replies, reposts, quotes
      // Note: 'follower_count' is on the user object, not insights
      const metricTypes = "views,likes,replies,reposts,quotes";

      const response = await fetch(
        `/api/threads/proxy?endpoint=/me/threads_insights&params=metric=${metricTypes}`,
        {
          headers: { 'Authorization': `Bearer ${threadsAccessToken}` }
        }
      )

      if (response.ok) {
        const data = await response.json()

        const insights: ThreadsInsights = {
          impressions: 0,
          reach: 0,
          profile_views: 0, // Not provided by Threads API yet
          follower_count: account.followers_count || 0,
          engagement: 0,
        }

        // Map Threads metrics to your dashboard structure
        data.data?.forEach((metric: any) => {
          // Threads API returns values in a 'values' array with 'value'
          const value = metric.values?.[0]?.value || 0;

          switch (metric.name) {
            case "views":
              insights.impressions = value; // Threads 'views' ≈ impressions
              insights.reach = value;       // approximate reach
              break;
            case "likes":
              insights.engagement += value;
              break;
            case "replies":
              insights.engagement += value;
              break;
            case "reposts":
              insights.engagement += value;
              break;
            case "quotes":
              insights.engagement += value;
              break;
          }
        })

        setThreadsInsights(insights)
      } else {
        // Handle error or use mock data if the endpoint is restricted/beta
        console.warn("Failed to fetch Threads insights, using basic data.");
        const fallbackInsights: ThreadsInsights = {
          impressions: 0,
          reach: 0,
          profile_views: 0,
          follower_count: account.followers_count || 0,
          engagement: 0
        };
        setThreadsInsights(fallbackInsights);
      }
    } catch (err) {
      console.error("Failed to fetch Threads insights:", err)
    }
  }

  const fetchPostAnalytics = async (page: FacebookPage) => {
    try {
      const postsWithInsights = await Promise.all(
        facebookPosts.slice(0, 5).map(async (post) => {
          try {
            const response = await fetch(
              `https://graph.facebook.com/v24.0/${post.id}/insights?metric=post_media_view,post_clicks&access_token=${page.access_token}`,
            )
            console.log("post response", response)
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
                  case "post_media_view":
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
        `https://graph.facebook.com/v24.0/${page.id}/insights?metric=page_follows_country,page_follows_city&period=lifetime&access_token=${page.access_token}`,
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
          } else if (metric.name === "page_follows_country") {
            demographics.countries = Object.entries(latestValue)
              .map(([country, value]) => ({
                country,
                value: value as number,
              }))
              .slice(0, 10)
          } else if (metric.name === "page_follows_city") {
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
    if (selectedPinterestAccount) {
      fetchPinterestPins(pinterestAccessToken)
      fetchPinterestInsights(selectedPinterestAccount)
    }
  }, [selectedPinterestAccount])

  useEffect(() => {
    if (selectedThreadsAccount) {
      fetchThreadsPosts(selectedThreadsAccount)
      fetchThreadsInsights(selectedThreadsAccount)
    }
  }, [selectedThreadsAccount])

  // TikTok Data Fetching
  useEffect(() => {
    if (selectedTikTokAccount && tiktokAccessToken) {
      fetchTikTokVideos(tiktokAccessToken)
      fetchTikTokInsights(selectedTikTokAccount)
    }
  }, [selectedTikTokAccount, tiktokAccessToken])

  // TikTok Analytics Aggregation (Calculate totals from fetched videos)
  useEffect(() => {
    if (selectedTikTokAccount && tiktokVideos.length > 0) {
      const totalLikes = tiktokVideos.reduce((acc, video) => acc + (video.like_count || 0), 0)
      const totalComments = tiktokVideos.reduce((acc, video) => acc + (video.comment_count || 0), 0)
      const totalShares = tiktokVideos.reduce((acc, video) => acc + (video.share_count || 0), 0)
      const totalViews = tiktokVideos.reduce((acc, video) => acc + (video.view_count || 0), 0)

      setTikTokInsights({
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        views: totalViews,
        followers: selectedTikTokAccount.follower_count || 0
      })
    }
  }, [selectedTikTokAccount, tiktokVideos])

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

  // EdgeStore Upload Function
  const uploadFilesToEdgeStore = async (files: File[]): Promise<string[]> => {
    setUploadProgress({
      isUploading: true,
      progress: 0,
      currentFile: "",
      totalFiles: files.length,
      currentFileIndex: 0
    })

    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(" Starting EdgeStore upload for file:", file.name, "Type:", file.type)

        setUploadProgress(prev => ({
          ...prev,
          currentFile: file.name,
          currentFileIndex: index + 1,
          progress: (index / files.length) * 100
        }))

        // Upload to EdgeStore
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            console.log(`Upload progress for ${file.name}: ${progress}%`)
          },
          options: {
            temporary: false,
          }
        })

        console.log(" EdgeStore upload successful:", res)

        setUploadProgress(prev => ({
          ...prev,
          progress: ((index + 1) / files.length) * 100
        }))

        return res.url
      } catch (error) {
        console.error(" Error uploading file to EdgeStore:", error)

        // Handle specific EdgeStore errors
        if (error instanceof Error) {
          if (error.message.includes('File too large')) {
            throw new Error(`File ${file.name} is too large. Maximum size is 100MB.`)
          }
          if (error.message.includes('Invalid file type')) {
            throw new Error(`File ${file.name} is not a supported image or video format.`)
          }
        }

        throw new Error(`Failed to upload ${file.name}. Please try again.`)
      }
    })

    const results = await Promise.all(uploadPromises)

    setUploadProgress({
      isUploading: false,
      progress: 100,
      currentFile: "",
      totalFiles: 0,
      currentFileIndex: 0
    })

    console.log(" All files uploaded to EdgeStore:", results)
    return results
  }

  // Enhanced waitForMediaProcessing with better timeout handling
  const waitForMediaProcessing = async (mediaId: string, accessToken: string, maxAttempts = 30, isThreads = false): Promise<boolean> => {
    const startTime = Date.now()
    const maxWaitTime = 300000 // 5 minutes max for US regions

    // FIX 1: Define queryParams dynamically: only request 'status' for Threads
    const queryParams = isThreads ? `fields=status` : `fields=status_code,status`;

    // Correctly construct the API endpoint path and query parameters
    const THREADS_PROXY_ENDPOINT = `/${mediaId}`; // The resource endpoint for the proxy
    const THREADS_PROXY_URL = `/api/threads/proxy?endpoint=${THREADS_PROXY_ENDPOINT}&params=${encodeURIComponent(queryParams)}`;

    // Original FB URL structure
    const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/v24.0/${mediaId}`;

    // FIX 2: Correct URL construction for both proxy (uses params) and direct call (uses query string)
    const apiUrl = isThreads ? THREADS_PROXY_URL : `${FACEBOOK_GRAPH_URL}?${queryParams}&access_token=${accessToken}`;

    const authHeader = `Bearer ${accessToken}`;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Check if we've exceeded maximum wait time
        if (Date.now() - startTime > maxWaitTime) {
          throw new Error("Media processing timeout - please check your posts manually")
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout per request

        // Only pass the Authorization header if using the Threads proxy
        const response = await fetch(
          apiUrl,
          {
            signal: controller.signal,
            headers: isThreads ? { 'Authorization': authHeader } : undefined
          }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.log(` Media status check failed, attempt ${attempt + 1}`)
          if (response.status === 500 && isThreads) {
            const errorText = await response.text();
            console.error("Threads Proxy 500 Error details:", errorText);
          }
          await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds for US regions
          continue
        }

        const result = await response.json()
        console.log(` Media status check attempt ${attempt + 1}:`, result)

        // FIX 3: Check for BOTH status_code (for IG/FB) OR status (for Threads)
        const currentStatus = result.status_code || result.status;

        if (currentStatus === "FINISHED") {
          return true
        } else if (currentStatus === "ERROR") {
          throw new Error("Media processing failed - " + (result.status_message || "Unknown error"))
        }

        // Wait longer between checks for US regions (10 seconds)
        await new Promise((resolve) => setTimeout(resolve, 10000))
      } catch (error) {
        console.log(` Error checking media status, attempt ${attempt + 1}:`, error)
        if (error instanceof Error && error.name === 'AbortError') {
          console.log(" Request timeout, continuing...")
          continue; // Go to next attempt on timeout/abort
        }
        throw error // Re-throw any non-polling error that isn't a timeout/abort
      }
    }

    throw new Error("Media processing taking longer than expected - please check your posts manually")
  }

  const schedulePostViaCron = async (fileUrls: string[], fileTypes: string[]) => {
    // 1. Convert scheduled time to Unix Timestamp (in seconds)
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const scheduledTimestamp = Math.floor(scheduledDateTime.getTime() / 1000)

    console.log("scheduling debug: postToTikTok:", postToTikTok);
    console.log("scheduling debug: selectedTikTokAccount:", selectedTikTokAccount);
    console.log("scheduling debug: tiktokAccessToken:", tiktokAccessToken);

    // Only include platforms that rely on cron job (IG, PIN, TH)
    const platformsToSchedule = [
      postToInstagram ? "instagram" : null,
      postToPinterest ? "pinterest" : null,
      postToThreads ? "threads" : null,
      postToTikTok ? "tiktok" : null,
      // If Facebook is also selected, include it in the cron payload for unified posting
      postToFacebook ? "facebook" : null,
    ].filter(Boolean) as string[]

    const payload = {
      scheduledTimestamp,
      platformsToSchedule,
      postContent,
      fileUrls,
      postType,
      fileTypes, // Now uses the parameter, ensuring it's not undefined
      // Include platform-specific tokens/accounts for the cron job payload
      ...(postToFacebook && selectedFacebookPage && {
        facebook: {
          accessToken: selectedFacebookPage.access_token,
          accountId: selectedFacebookPage.id,
          pageName: selectedFacebookPage.name,
          taggedIds: extractTaggedPeople()
        }
      }),
      ...(postToInstagram && selectedInstagramAccount && {
        instagram: {
          accessToken: instagramAccessToken,
          accountId: selectedInstagramAccount.id,
          username: selectedInstagramAccount.username
        }
      }),
      ...(postToPinterest && selectedPinterestAccount && selectedPinterestBoard && {
        pinterest: {
          accessToken: pinterestAccessToken,
          accountId: selectedPinterestAccount.id,
          boardId: selectedPinterestBoard.id,
          pinTitle,
          pinDescription,
          pinLink,
          boardName: selectedPinterestBoard.name
        }
      }),
      ...(postToThreads && selectedThreadsAccount && {
        threads: {
          accessToken: threadsAccessToken,
          accountId: selectedThreadsAccount.id,
          username: selectedThreadsAccount.username
        }
      }),
      ...(postToTikTok && selectedTikTokAccount ? {
        tiktok: {
          accessToken: tiktokAccessToken,
          openId: selectedTikTokAccount.open_id,
        }
      } : {}),
    }

    console.log("scheduling debug: FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

    setPostingStatus(prev => ({
      ...prev,
      message: `Submitting job to scheduler for ${platformsToSchedule.join(", ")}...`,
      progress: 50,
      currentStep: "Scheduling Job"
    }))

    // Call the Next.js API proxy (/api/social/schedule), which forwards to Express Scheduler (port 4000)
    const response = await fetch("/api/social/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to submit post to scheduler.")
    }

    const responseData = await response.json();

    return { message: "Scheduled", platforms: platformsToSchedule.join(", "), jobId: responseData.jobId }
  }

  const handlePost = async () => {
    const validationError = validatePost()
    if (validationError) {
      setError(validationError)
      return
    }

    setShowPostModal(false)
    setIsPosting(true)
    setError("")

    // Calculate estimated time based on platforms and media
    let estimatedTime = "1-2 minutes"
    const platformCount = [postToFacebook, postToInstagram, postToPinterest, postToThreads, postToTikTok].filter(Boolean).length
    if (platformCount > 2) {
      estimatedTime = "3-5 minutes"
    } else if (platformCount > 1) {
      estimatedTime = "2-4 minutes"
    }
    if (selectedFiles.length > 0) {
      estimatedTime += " (including media processing)"
    }

    // Set initial posting status
    setPostingStatus({
      isPosting: true,
      message: "Starting post creation...",
      progress: 5,
      currentStep: "Initializing",
      estimatedTime
    })

    try {
      let fileUrls: string[] = []

      // Upload files to EdgeStore if selected
      if (selectedFiles.length > 0) {
        setPostingStatus({
          isPosting: true,
          message: "Uploading media files to cloud...",
          progress: 10,
          currentStep: "Uploading Media",
          estimatedTime
        })
        console.log(" Uploading files to EdgeStore...")
        fileUrls = await uploadFilesToEdgeStore(selectedFiles)
        setPostingStatus({
          isPosting: true,
          message: "Media upload complete! Preparing social media posts...",
          progress: 30,
          currentStep: "Media Upload Complete",
          estimatedTime
        })
      } else {
        setPostingStatus({
          isPosting: true,
          message: "Preparing posts...",
          progress: 20,
          currentStep: "Preparing Posts",
          estimatedTime
        })
      }

      const results = []
      let currentProgress = 40

      // Determine posting flow:
      const isFacebookOnly = postToFacebook && !postToInstagram && !postToPinterest && !postToThreads && !postToTikTok;
      const requiresCronScheduling = isScheduled && !isFacebookOnly; // Cron for multi-platform or any non-FB platform

      if (requiresCronScheduling) {
        // Flow 1: Cron Scheduling (IG, Pinterest, Threads, or multi-platform including them)
        // FIX: Pass fileTypes state explicitly to the scheduler function
        const { platforms } = await schedulePostViaCron(fileUrls, fileTypes)
        results.push(platforms)

        // Final success status for scheduling
        setPostingStatus({
          isPosting: true,
          message: `Successfully Scheduled Posts to: ${results.join(", ")}!`,
          progress: 100,
          currentStep: "Scheduled",
          estimatedTime: "Done!"
        })

      } else if (isScheduled && isFacebookOnly) {
        // Flow 2: Facebook Native Scheduling (Scheduled AND only Facebook selected)
        setPostingStatus({
          isPosting: true,
          message: "Scheduling post via Facebook Native API...",
          progress: currentProgress,
          currentStep: "Native Scheduling",
          estimatedTime
        })
        // postToFacebookPage internally uses isScheduled to set the publish time via Facebook's API
        await postToFacebookPage(fileUrls)
        results.push("Facebook (Native Scheduled)")

        // Final success status for native scheduling
        setPostingStatus({
          isPosting: true,
          message: `Successfully Scheduled to: ${results.join(", ")}!`,
          progress: 100,
          currentStep: "Complete",
          estimatedTime: "Done!"
        })
      }
      else {
        // Flow 3: IMMEDIATE Posting (isScheduled is false)

        // Post to Facebook
        if (postToFacebook && selectedFacebookPage) {
          setPostingStatus(prev => ({ ...prev, message: "Posting to Facebook...", progress: currentProgress, currentStep: "Posting to Facebook" }))
          await postToFacebookPage(fileUrls)
          results.push("Facebook")
          currentProgress += 15
        }

        // Post to Instagram
        if (postToInstagram && selectedInstagramAccount) {
          setPostingStatus(prev => ({ ...prev, message: "Posting to Instagram...", progress: currentProgress, currentStep: "Posting to Instagram" }))
          await postToInstagramAccount(fileUrls)
          results.push("Instagram")
          currentProgress += 15
        }

        // Post to Pinterest
        if (postToPinterest && selectedPinterestAccount && selectedPinterestBoard) {
          setPostingStatus(prev => ({ ...prev, message: "Posting to Pinterest...", progress: currentProgress, currentStep: "Posting to Pinterest" }))
          await postToPinterestBoard(fileUrls)
          results.push("Pinterest")
          currentProgress += 15
        }

        // Post to Threads
        if (postToThreads && selectedThreadsAccount) {
          setPostingStatus(prev => ({ ...prev, message: "Posting to Threads...", progress: currentProgress, currentStep: "Posting to Threads" }))
          await postToThreadsAccount(fileUrls)
          results.push("Threads")
          currentProgress += 15
        }

        // Post to TikTok
        if (postToTikTok && selectedTikTokAccount) {
          setPostingStatus(prev => ({ ...prev, message: "Posting to TikTok...", progress: currentProgress, currentStep: "Posting to TikTok" }))
          await postToTikTokAccount(fileUrls)
          results.push("TikTok")
          currentProgress += 15
        }

        // Final success status for immediate posting
        setPostingStatus({
          isPosting: true,
          message: `Successfully posted to: ${results.join(", ")}!`,
          progress: 100,
          currentStep: "Complete",
          estimatedTime: "Done!"
        })
      }

      // Reset form (omitted for brevity)

      // Refresh posts with delay to allow for processing
      setTimeout(() => {
        if (selectedInstagramAccount) fetchInstagramPosts(selectedInstagramAccount)
        if (selectedPinterestAccount) fetchPinterestPins(pinterestAccessToken)
        if (selectedThreadsAccount) fetchThreadsPosts(selectedThreadsAccount)
        if (selectedTikTokAccount) fetchTikTokVideos(tiktokAccessToken)
      }, 5000)


      // Show status for 3 seconds before hiding
      setTimeout(() => {
        setPostingStatus({
          isPosting: false,
          message: "",
          progress: 0,
          currentStep: ""
        })
        // Clear all form data and media
        setPostContent("")
        setPinTitle("")
        setPinDescription("")
        setPinLink("")
        setSelectedFiles([])
        setFilePreviews([])
        setFileTypes([])
        setIsScheduled(false)
        setScheduledDate("")
        setScheduledTime("")
      }, 3000)

    } catch (err) {
      console.error(" Posting error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to post. Please check your file and try again."
      setError(errorMessage)

      setPostingStatus({
        isPosting: false,
        message: "Posting failed",
        progress: 0,
        currentStep: "Error"
      })
    } finally {
      setIsPosting(false)
    }
  }

  const postToFacebookPage = async (fileUrls: string[]) => {
    if (!selectedFacebookPage) return

    const taggedIds = extractTaggedPeople()

    try {
      // Enhanced timeout handling for Facebook API
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      // ✅ Handle carousel posts (multiple images)
      if (postType === "carousel" && fileUrls.length > 1) {
        const attachedMedia = []

        for (const url of fileUrls) {
          setPostingStatus(prev => ({
            ...prev,
            message: `Uploading carousel image ${attachedMedia.length + 1}/${fileUrls.length} to Facebook...`
          }))

          // ✅ Upload each image via FormData so Facebook can read it
          const formData = new FormData()
          formData.append("access_token", selectedFacebookPage.access_token)
          formData.append("published", "false")

          // Try fetching image binary (from EdgeStore)
          const fileResponse = await fetch(url)
          const blob = await fileResponse.blob()
          formData.append("source", blob)

          const photoResponse = await fetch(`https://graph.facebook.com/v24.0/${selectedFacebookPage.id}/photos`, {
            method: "POST",
            body: formData,
            signal: controller.signal
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
          access_token: selectedFacebookPage.access_token,
        }

        if (taggedIds.length > 0) {
          postData.tags = taggedIds.join(",")
        }

        if (isScheduled && scheduledDate && scheduledTime) {
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
          postData.scheduled_publish_time = Math.floor(scheduledDateTime.getTime() / 1000)
          postData.published = false
        }

        const response = await fetch(`https://graph.facebook.com/v24.0/${selectedFacebookPage.id}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
          signal: controller.signal
        })

        if (!response.ok) {
          const errData = await response.json()
          console.error("❌ Carousel post failed:", errData)
          throw new Error(errData.error?.message || "Failed to post carousel to Facebook")
        }

        clearTimeout(timeoutId)
        return
      }

      if (fileUrls.length > 0) {
        const isVideo = fileTypes[0]?.startsWith("video/")

        if (isVideo) {
          setPostingStatus(prev => ({
            ...prev,
            message: "Uploading video to Facebook..."
          }))

          const videoUrl = fileUrls[0]
          const pageAccessToken = selectedFacebookPage.access_token

          const payload = {
            file_url: videoUrl,
            title: "My Product Launch Video",
            description: postContent,
            published: !isScheduled,
            access_token: pageAccessToken,
          }

          if (isScheduled && scheduledDate && scheduledTime) {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
            payload["scheduled_publish_time"] = Math.floor(scheduledDateTime.getTime() / 1000)
          }

          const response = await fetch(`https://graph-video.facebook.com/v23.0/${selectedFacebookPage.id}/videos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
          })

          const data = await response.json()
          if (!response.ok) throw new Error(data.error?.message || "Failed to upload video")
          console.log("✅ Facebook video uploaded:", data)
        } else {
          // Handle image upload
          setPostingStatus(prev => ({
            ...prev,
            message: "Uploading image to Facebook..."
          }))

          const formData = new FormData()
          formData.append("caption", postContent)
          formData.append("access_token", selectedFacebookPage.access_token)

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

          const response = await fetch(`https://graph.facebook.com/v24.0/${selectedFacebookPage.id}/photos`, {
            method: "POST",
            body: formData,
            signal: controller.signal
          })

          if (!response.ok) {
            const errData = await response.json()
            console.error("❌ Photo post failed:", errData)
            throw new Error(errData.error?.message || "Failed to upload photo to Facebook")
          }
        }
      } else {
        // Text-only post
        setPostingStatus(prev => ({
          ...prev,
          message: "Publishing text post to Facebook..."
        }))

        const postData: any = {
          message: postContent,
          access_token: selectedFacebookPage.access_token,
        }

        if (taggedIds.length > 0) {
          postData.tags = taggedIds.join(",")
        }

        if (isScheduled && scheduledDate && scheduledTime) {
          const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
          postData["scheduled_publish_time"] = Math.floor(scheduledDateTime.getTime() / 1000)
          postData["published"] = false
        }

        const response = await fetch(`https://graph.facebook.com/v24.0/${selectedFacebookPage.id}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
          signal: controller.signal
        })

        if (!response.ok) {
          const errData = await response.json()
          console.error("❌ Text post failed:", errData)
          throw new Error(errData.error?.message || "Failed to post text to Facebook")
        }
      }

      clearTimeout(timeoutId)
    } catch (error) {
      console.error("❌ Facebook post failed:", error)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Facebook request timeout - please try again")
      }
      throw error
    }
  }

  const postToInstagramAccount = async (fileUrls: string[]) => {
    if (!selectedInstagramAccount) return

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minute timeout for Instagram

      if (postType === "carousel" && fileUrls.length > 1) {
        // Instagram carousel post
        const mediaIds = []

        for (let i = 0; i < fileUrls.length; i++) {
          setPostingStatus(prev => ({
            ...prev,
            message: `Creating carousel item ${i + 1}/${fileUrls.length} for Instagram...`
          }))

          const url = fileUrls[i]
          const isVideo = fileTypes[i]?.startsWith("video/")
          const mediaType = isVideo ? "video_url" : "image_url"

          console.log(` Creating carousel item ${i + 1}: ${mediaType} = ${url}`)

          const containerResponse = await fetch(`https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [mediaType]: url,
              is_carousel_item: true,
              access_token: (selectedInstagramAccount as any).access_token,
            }),
            signal: controller.signal
          })

          if (!containerResponse.ok) {
            const errorData = await containerResponse.json()
            console.log(` Instagram carousel item creation failed:`, errorData)
            throw new Error(errorData.error?.message || "Failed to create carousel item")
          }

          const containerResult = await containerResponse.json()
          mediaIds.push(containerResult.id)

          console.log(` Waiting for carousel item processing: ${containerResult.id}`)
          setPostingStatus(prev => ({
            ...prev,
            message: `Processing carousel item ${i + 1}/${fileUrls.length}...`
          }))
          await waitForMediaProcessing(containerResult.id, (selectedInstagramAccount as any).access_token)
        }

        // Create carousel container
        setPostingStatus(prev => ({
          ...prev,
          message: "Creating Instagram carousel..."
        }))

        const carouselResponse = await fetch(`https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_type: "CAROUSEL",
            children: mediaIds.join(","),
            caption: postContent,
            access_token: (selectedInstagramAccount as any).access_token,
          }),
          signal: controller.signal
        })

        if (!carouselResponse.ok) {
          const errorData = await carouselResponse.json()
          throw new Error(errorData.error?.message || "Failed to create carousel container")
        }

        const carouselResult = await carouselResponse.json()

        // Publish carousel
        setPostingStatus(prev => ({
          ...prev,
          message: "Publishing Instagram carousel..."
        }))

        const publishResponse = await fetch(
          `https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: carouselResult.id,
              access_token: (selectedInstagramAccount as any).access_token,
            }),
            signal: controller.signal
          },
        )

        if (!publishResponse.ok) {
          const errorData = await publishResponse.json()
          throw new Error(errorData.error?.message || "Failed to publish carousel to Instagram")
        }
      } else if (postType === "reel" && fileUrls.length > 0) {
        // Instagram Reel
        console.log(` Creating Instagram reel with video: ${fileUrls[0]}`)

        setPostingStatus(prev => ({
          ...prev,
          message: "Creating Instagram reel..."
        }))

        const containerPayload: any = {
          media_type: "REELS",
          video_url: fileUrls[0],
          caption: postContent,
          access_token: (selectedInstagramAccount as any).access_token,
        }

        const containerResponse = await fetch(`https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(containerPayload),
          signal: controller.signal
        })

        if (!containerResponse.ok) {
          const errorData = await containerResponse.json()
          console.log(` Instagram reel container creation failed:`, errorData)
          throw new Error(errorData.error?.message || "Failed to create Instagram reel")
        }

        const containerResult = await containerResponse.json()
        console.log(` Instagram reel container created:`, containerResult)

        console.log(` Waiting for reel video processing: ${containerResult.id}`)
        setPostingStatus(prev => ({
          ...prev,
          message: "Processing reel video..."
        }))
        await waitForMediaProcessing(containerResult.id, (selectedInstagramAccount as any).access_token)

        // Publish reel
        console.log(` Publishing Instagram reel: ${containerResult.id}`)
        setPostingStatus(prev => ({
          ...prev,
          message: "Publishing Instagram reel..."
        }))

        const publishResponse = await fetch(
          `https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: containerResult.id,
              access_token: (selectedInstagramAccount as any).access_token,
            }),
            signal: controller.signal
          },
        )

        if (!publishResponse.ok) {
          const errorData = await publishResponse.json()
          console.log(` Instagram reel publish failed:`, errorData)
          throw new Error(errorData.error?.message || "Failed to publish reel to Instagram")
        }

        console.log(` Instagram reel published successfully`)
      } else {
        // Regular Instagram post
        const isVideo = fileTypes[0]?.startsWith("video/")
        const mediaType = isVideo ? "video_url" : "image_url"

        console.log(` Creating Instagram post: ${mediaType} = ${fileUrls[0]}`)
        console.log(` File type detected: ${fileTypes[0]}`)

        setPostingStatus(prev => ({
          ...prev,
          message: `Creating Instagram ${isVideo ? 'video' : 'image'} post...`
        }))

        const containerPayload: any = {
          [mediaType]: fileUrls[0],
          caption: postContent,
          access_token: (selectedInstagramAccount as any).access_token,
        }

        console.log(` Instagram container payload:`, JSON.stringify(containerPayload, null, 2))

        const containerResponse = await fetch(`https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(containerPayload),
          signal: controller.signal
        })

        if (!containerResponse.ok) {
          const errorData = await containerResponse.json()
          console.log(` Instagram media container creation failed:`, errorData)
          throw new Error(errorData.error?.message || "Failed to create Instagram media container")
        }

        const containerResult = await containerResponse.json()
        console.log(` Instagram container created:`, containerResult)

        console.log(` Waiting for media processing: ${containerResult.id}`)
        setPostingStatus(prev => ({
          ...prev,
          message: "Processing media for Instagram..."
        }))
        await waitForMediaProcessing(containerResult.id, (selectedInstagramAccount as any).access_token)

        console.log(` Publishing Instagram post: ${containerResult.id}`)
        setPostingStatus(prev => ({
          ...prev,
          message: "Publishing to Instagram..."
        }))

        const publishResponse = await fetch(
          `https://graph.facebook.com/v24.0/${selectedInstagramAccount.id}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: containerResult.id,
              access_token: (selectedInstagramAccount as any).access_token,
            }),
            signal: controller.signal
          },
        )

        if (!publishResponse.ok) {
          const errorData = await publishResponse.json()
          console.log(` Instagram publish failed:`, errorData)
          throw new Error(errorData.error?.message || "Failed to publish to Instagram")
        }

        console.log(` Instagram post published successfully`)
      }

      clearTimeout(timeoutId)
    } catch (error) {
      console.error("❌ Instagram post failed:", error)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Instagram request timeout - please try again")
      }
      throw error
    }
  }

  // In src/app/page.tsx

  const postToPinterestBoard = async (fileUrls: string[]) => {
    if (!selectedPinterestBoard || !selectedPinterestAccount || fileUrls.length === 0) return

    try {
      setPostingStatus(prev => ({
        ...prev,
        message: "Creating Pinterest pin..."
      }))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 1 minute timeout

      // Pinterest requires image URL, title, description, and board ID
      const pinData = {
        title: pinTitle || "My Pin",
        description: pinDescription || postContent,
        board_id: selectedPinterestBoard.id,
        media_source: {
          source_type: "image_url",
          url: fileUrls[0] // Pinterest typically uses single image per pin
        },
        link: pinLink || undefined
      }

      // UPDATED: Call your local proxy instead of the direct API URL
      const response = await fetch(`/api/pinterest/proxy?endpoint=/pins`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${pinterestAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pinData),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Pinterest pin creation failed:", errorData)
        throw new Error(errorData.message || "Failed to create Pinterest pin")
      }

      const result = await response.json()
      console.log("✅ Pinterest pin created:", result)

      clearTimeout(timeoutId)
    } catch (error) {
      console.error("❌ Pinterest post failed:", error)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Pinterest request timeout - please try again")
      }
      throw error
    }
  }
  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !selectedPinterestAccount) return;

    setIsCreatingBoard(true);
    try {
      // Use proxy to create board in Sandbox (or Production)
      const response = await fetch(`/api/pinterest/proxy?endpoint=/boards`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${pinterestAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newBoardName,
          description: "Created via SocialFlow Dashboard"
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Add new board to list and select it
        setPinterestBoards(prev => [...prev, data]);
        setSelectedPinterestBoard(data);
        localStorage.setItem("selected_pinterest_board", JSON.stringify(data));
        setNewBoardName("");
        // Don't alert, just seamlessly update
      } else {
        alert(`Failed to create board: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board");
    } finally {
      setIsCreatingBoard(false);
    }
  };
  const postToThreadsAccount = async (fileUrls: string[]) => {
    if (!selectedThreadsAccount) return;

    try {
      setPostingStatus(prev => ({ ...prev, message: "Posting to Threads..." }));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      let creationId = "";

      const pollingAccessToken = selectedInstagramAccount
        ? (selectedInstagramAccount as any).access_token
        : threadsAccessToken;

      const hasMedia = fileUrls.length > 0;

      if (hasMedia) {
        // 1) Create child containers if more than 1 file => carousel
        // @ts-ignore
        const childContainerIds: string[] = [];

        if (fileUrls.length > 1) {
          // CAROUSEL children
          for (let i = 0; i < fileUrls.length; i++) {
            const isVideo = fileTypes[i]?.startsWith("video/");
            const payload: any = {
              media_type: isVideo ? "VIDEO" : "IMAGE",
              is_carousel_item: true,
            };

            if (isVideo) payload.video_url = fileUrls[i];
            else payload.image_url = fileUrls[i];

            const res = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${threadsAccessToken}`,
              },
              body: JSON.stringify(payload),
              signal: controller.signal,
            });

            if (!res.ok) throw new Error("Failed to create Threads carousel item");

            const data = await res.json();
            childContainerIds.push(data.id);

            if (isVideo) {
              setPostingStatus(prev => ({
                ...prev,
                message: `Processing video ${i + 1}/${fileUrls.length} for Threads...`,
              }));
              // FIX: Pass isThreads = true to force proxy usage for status check
              await waitForMediaProcessing(data.id, pollingAccessToken, 30, true);
            }
          }

          // 2) Create parent CAROUSEL container
          const parentPayload: any = {
            media_type: "CAROUSEL",
            children: childContainerIds.join(","),
            text: postContent,
          };

          const parentRes = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${threadsAccessToken}`,
            },
            body: JSON.stringify(parentPayload),
            signal: controller.signal,
          });

          if (!parentRes.ok) throw new Error("Failed to create Threads carousel container");
          const parentData = await parentRes.json();
          creationId = parentData.id;
        } else {
          // Single IMAGE/VIDEO (your existing logic)
          const isVideo = fileTypes[0]?.startsWith("video/");
          const mediaPayload: any = {
            media_type: isVideo ? "VIDEO" : "IMAGE",
            text: postContent,
          };
          if (isVideo) mediaPayload.video_url = fileUrls[0];
          else mediaPayload.image_url = fileUrls[0];

          const containerResponse = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${threadsAccessToken}`,
            },
            body: JSON.stringify(mediaPayload),
            signal: controller.signal,
          });

          if (!containerResponse.ok) throw new Error("Failed to upload media to Threads");
          const containerData = await containerResponse.json();
          creationId = containerData.id;

          if (isVideo) {
            setPostingStatus(prev => ({
              ...prev,
              message: "Processing video for Threads (may take a few minutes)...",
            }));
            // FIX: Pass isThreads = true to force proxy usage for status check
            await waitForMediaProcessing(creationId, pollingAccessToken, 30, true);
          }
        }
      } else {
        // Text only
        const containerResponse = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${threadsAccessToken}`,
          },
          body: JSON.stringify({
            media_type: "TEXT",
            text: postContent,
          }),
          signal: controller.signal,
        });

        if (!containerResponse.ok) throw new Error("Failed to create Threads text post");
        const containerData = await containerResponse.json();
        creationId = containerData.id;
      }

      // 3) Publish (single or carousel)
      const publishResponse = await fetch(`/api/threads/proxy?endpoint=/me/threads_publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${threadsAccessToken}`,
        },
        body: JSON.stringify({ creation_id: creationId }),
        signal: controller.signal,
      });

      if (!publishResponse.ok) throw new Error("Failed to publish to Threads");

      console.log("✅ Threads post created");
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("❌ Threads post failed:", error);
      if (error instanceof Error && error.name === "AbortError")
        throw new Error("Threads request timeout");
      throw error;
    }
  };

  const postToTikTokAccount = async (fileUrls: string[]) => {
    if (!selectedTikTokAccount || fileUrls.length === 0) return

    try {
      setPostingStatus(prev => ({ ...prev, message: "Posting to TikTok..." }))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 min timeout

      // First, query creator info to get valid privacy levels
      const creatorInfoResponse = await fetch(`/api/tiktok/proxy?endpoint=/post/publish/creator_info/query/`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${tiktokAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        signal: controller.signal
      })

      if (!creatorInfoResponse.ok) {
        throw new Error("Failed to fetch creator info for posting configuration")
      }

      const creatorData = await creatorInfoResponse.json()
      // Default to MUTUAL_FOLLOW_FRIENDS if public isn't available, or just use PUBLIC_TO_EVERYONE and let API validate
      // TikTok requires dynamic privacy levels based on user settings
      // IMPORTANT: For unaudited apps (like this dev one), access is restricted to SELF_ONLY (Private).
      // Attempting PUBLIC or FRIENDS will result in 403 Forbidden.
      // We check if SELF_ONLY is in options, otherwise default to the first available option.
      const availablePrivacyOptions = creatorData.data?.privacy_level_options || [];
      const privacyLevel = availablePrivacyOptions.includes("SELF_ONLY")
        ? "SELF_ONLY"
        : (availablePrivacyOptions[0] || "SELF_ONLY");

      // Use the proxy to initiate upload
      const file = selectedFiles[0]
      const isPhoto = file.type.startsWith("image/")

      if (isPhoto) {
        // PHOTO POST FLOW
        // TikTok Photo API requires PULL_FROM_URL. FILE_UPLOAD is not supported for photos.
        // We must use the EdgeStore URL we already uploaded.
        // Note: Users might face "url_ownership_unverified" if EdgeStore domain isn't verified in TikTok dev portal.

        // PHOTO POST FLOW (FILE_UPLOAD) - CORRECTED
        // Using FILE_UPLOAD for photos.

        const rawImageUrl = fileUrls[0];
        if (!rawImageUrl) throw new Error("Image URL not found for TikTok photo post");

        console.log("📸 [TikTok Photo] Fetching image from:", rawImageUrl);

        // 1. Fetch the file blob
        const imgResponse = await fetch(rawImageUrl);
        if (!imgResponse.ok) throw new Error("Failed to fetch image file for upload");
        const imgBlob = await imgResponse.blob();

        console.log("📸 [TikTok Photo] Image fetched. Size:", imgBlob.size);

        const payload = {
          media_type: "PHOTO",
          post_mode: "DIRECT_POST",
          post_info: {
            title: postContent.substring(0, 90) || "Photo from SocialFlow",
            privacy_level: "SELF_ONLY",
            disable_comment: false,
            auto_add_music: false
          },
          source_info: {
            source: "FILE_UPLOAD"
          }
        };

        console.log("📸 [TikTok Photo] Sending Init Payload:", JSON.stringify(payload, null, 2));

        // 2. Init Upload
        const response = await fetch(`/api/tiktok/proxy?endpoint=/post/publish/content/init/`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${tiktokAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        if (!response.ok) {
          const text = await response.text();
          console.error(`❌ TikTok Photo Init Failed: ${text}`);
          throw new Error(`TikTok Photo Init Failed: ${text}`);
        }

        const data = await response.json();
        const uploadUrl = data.data.upload_url;

        console.log("✅ TikTok Init Success. Uploading to:", uploadUrl);

        // 3. Upload File
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: imgBlob
        });

        if (!uploadRes.ok) {
          const upText = await uploadRes.text();
          throw new Error(`TikTok Image Upload Failed: ${upText}`);
        }

        console.log("✅ TikTok photo uploaded successfully!");
        setPostingStatus(prev => ({ ...prev, message: "TikTok photo uploaded successfully!" }))

      } else {
        // VIDEO POST FLOW (FILE_UPLOAD)
        const videoSize = file.size
        const CHUNK_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

        let chunkSize = videoSize;
        let totalChunkCount = 1;

        if (videoSize > CHUNK_SIZE_LIMIT) {
          chunkSize = 10 * 1024 * 1024; // 10 MB per chunk
          if (chunkSize > videoSize) chunkSize = videoSize;

          if (videoSize < chunkSize) {
            chunkSize = videoSize;
            totalChunkCount = 1;
          } else {
            totalChunkCount = Math.ceil(videoSize / chunkSize);
          }
        }

        const response = await fetch(`/api/tiktok/proxy?endpoint=/post/publish/video/init/`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${tiktokAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post_info: {
              title: postContent.substring(0, 150) || "Video from SocialFlow",
              privacy_level: "SELF_ONLY", // STRICT REQUIREMENT for unaudited apps
              disable_duet: true,
              disable_comment: true,
              disable_stitch: true,
              video_cover_timestamp_ms: 1000,
              brand_content_toggle: false,
              brand_organic_toggle: false
            },
            source_info: {
              source: "FILE_UPLOAD",
              video_size: videoSize,
              chunk_size: chunkSize,
              total_chunk_count: totalChunkCount
            }
          }),
          signal: controller.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("TikTok Post Init Error Details:", errorData)
          let errorMessage = errorData.error?.message || JSON.stringify(errorData) || "Failed to post to TikTok";
          if (response.status === 403) {
            errorMessage += " (NOTE: For this dev app, your TikTok account MUST be set to 'Private' in TikTok settings, and privacy level restricted to 'SELF_ONLY'.)"
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        const uploadUrl = data.data.upload_url

        // Upload Video Chunks
        setPostingStatus(prev => ({ ...prev, message: "Uploading video data to TikTok..." }))

        for (let i = 0; i < totalChunkCount; i++) {
          const start = i * chunkSize
          let end = start + chunkSize
          if (i === totalChunkCount - 1) end = videoSize

          const chunkBlob = file.slice(start, end)

          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type || "video/mp4",
              "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`
            },
            body: chunkBlob
          })

          if (!uploadRes.ok) throw new Error("Failed to upload video chunk to TikTok")
        }
        console.log("✅ TikTok post initiated successfully:", data)
        setPostingStatus(prev => ({ ...prev, message: "TikTok post initiated! Processing may take a moment." }))
      } // End Video Flow

      clearTimeout(timeoutId)
    } catch (error) {
      console.error("❌ TikTok post failed:", error)
      let errorMessage = "Failed to post to TikTok";
      if (error instanceof Error) {
        errorMessage = error.name === 'AbortError' ? "TikTok request timeout" : error.message;
      }
      setPostingStatus(prev => ({
        ...prev,
        status: "error",
        message: errorMessage
      }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Reset previous errors
    setError("")

    const maxFiles = postType === "carousel" ? 10 : postType === "pin" ? 1 : 1
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed for ${postType}`)
      return
    }

    const validFiles: File[] = []
    const previews: string[] = []
    const types: string[] = []

    // Validate each file
    for (const file of files) {
      console.log(" Processing file:", file.name, "Type:", file.type, "Size:", file.size)

      // Type validation based on post type
      if (postType === "reel") {
        if (!file.type.startsWith("video/")) {
          setError("Reels require video files only")
          return
        }
        // Specific video format check
        const supportedVideoTypes = ["video/mp4", "video/mov", "video/avi"]
        if (!supportedVideoTypes.includes(file.type)) {
          setError("Please use MP4, MOV, or AVI video formats for reels")
          return
        }
      } else if (postType === "carousel") {
        if (!file.type.startsWith("image/")) {
          setError("Carousel posts require image files")
          return
        }
      } else if (postType === "pin") {
        if (!file.type.startsWith("image/")) {
          setError("Pinterest pins require image files")
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

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === validFiles.length) {
          setFilePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    }

    setSelectedFiles(validFiles)
    setFileTypes(types)
    console.log(
      " Files selected:",
      validFiles.map((f) => f.name),
    )
    console.log(" File types detected:", types)

    // Reset the file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = filePreviews.filter((_, i) => i !== index)
    const newTypes = fileTypes.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setFilePreviews(newPreviews)
    setFileTypes(newTypes)
  }

  const validatePost = (): string | null => {
    // Platform selection validation
    if (!postToFacebook && !postToInstagram && !postToPinterest && !postToThreads && !postToTikTok) {
      return "Please select at least one platform to post to"
    }

    // Account selection validation
    if (postToFacebook && !selectedFacebookPage) return "Please select a Facebook page to post to"
    if (postToInstagram && !selectedInstagramAccount) return "Please select an Instagram account to post to"
    if (postToPinterest && !selectedPinterestAccount) return "Please select a Pinterest account to post to"
    if (postToPinterest && !selectedPinterestBoard) return "Please select a Pinterest board to post to"
    if (postToThreads && !selectedThreadsAccount) return "Please select a Threads account to post to"
    if (postToTikTok && !selectedTikTokAccount) return "Please select a TikTok account to post to"

    // Content validation based on platform and post type
    const hasContent = postContent.trim().length > 0
    const hasMedia = selectedFiles.length > 0

    // Instagram-specific validations
    if (postToInstagram) {
      if (!hasMedia) return "Instagram posts require at least one image or video"
      if (postContent.length > 2200) return "Instagram captions cannot exceed 2,200 characters"

      if (postType === "reel") {
        if (selectedFiles.length !== 1) return "Instagram reels require exactly one video file"
        const file = selectedFiles[0]
        if (!file.type.startsWith("video/")) return "Instagram reels must be video files"
      }

      if (postType === "carousel") {
        if (selectedFiles.length < 2 || selectedFiles.length > 10) return "Instagram carousels require 2-10 images or videos"
        const hasInvalidFiles = selectedFiles.some(
          (file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"),
        )
        if (hasInvalidFiles) return "Instagram carousel items must be images or videos"
      }

      if (postType === "post") {
        if (selectedFiles.length > 1) return "Instagram single posts can only have one image or video"
        const file = selectedFiles[0]
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return "Instagram posts must be images or videos"
      }
    }

    // Facebook-specific validations
    if (postToFacebook) {
      if (!hasContent && !hasMedia) return "Facebook posts require either text content or media"
      if (postContent.length > 63206) return "Facebook posts cannot exceed 63,206 characters"

      if (postType === "reel") {
        if (selectedFiles.length !== 1) return "Facebook reels require exactly one video file"
        const file = selectedFiles[0]
        if (!file.type.startsWith("video/")) return "Facebook reels must be video files"
        const supportedVideoTypes = ["video/mp4", "video/mov", "video/avi"]
        if (!supportedVideoTypes.includes(file.type)) return "Facebook supports MP4, MOV, and AVI video formats for reels"
      }

      // File size validation for Facebook videos
      if (selectedFiles.length > 0 && selectedFiles[0].size > 4000 * 1024 * 1024) {
        return "Video file must be smaller than 4GB for Facebook"
      }

      if (postType === "carousel") {
        if (selectedFiles.length < 2 || selectedFiles.length > 10) return "Facebook carousels require 2-10 images"
        const hasNonImages = selectedFiles.some((file) => !file.type.startsWith("image/"))
        if (hasNonImages) return "Facebook carousel posts can only contain images"
      }

      if (postType === "post" && hasMedia) {
        if (selectedFiles.length > 1) return "Facebook single posts can only have one image or video"
        const file = selectedFiles[0]
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return "Facebook posts must be images or videos"
      }
    }

    // TikTok-specific validations
    // TikTok-specific validations
    if (postToTikTok) {
      if (!hasMedia) return "TikTok posts require a file (video or image)"
      if (selectedFiles.length !== 1) return "TikTok posts currently support exactly one file at a time"
      const file = selectedFiles[0]
      if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) return "TikTok posts must be video or image files"
      if (postContent.length > 2200) return "TikTok description cannot exceed 2,200 characters"
    }

    // Pinterest-specific validations
    if (postToPinterest) {
      if (!hasMedia) return "Pinterest pins require at least one image"
      if (selectedFiles.some(file => !file.type.startsWith("image/"))) return "Pinterest pins only support image files"
      if (!pinTitle.trim()) return "Pinterest pins require a title"
      if (pinTitle.length > 100) return "Pinterest pin titles cannot exceed 100 characters"
      if (pinDescription.length > 500) return "Pinterest pin descriptions cannot exceed 500 characters"
      if (selectedFiles.length > 1) return "Pinterest pins can only have one image"
    }

    // Threads-specific validations
    if (postToThreads) {
      if (postContent.length > 500) return "Threads posts cannot exceed 500 characters"

      if (postType !== "carousel" && hasMedia && selectedFiles.length > 1) {
        return "Threads posts can only have one image or video"
      }
      if (postType === "carousel" && selectedFiles.length < 2) {
        return "Threads carousels require 2 or more media items."
      }

      if (hasMedia) {
        const file = selectedFiles[0]
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          return "Threads posts must be images or videos"
        }
      }
    }

    // Cross-platform validations
    const selectedPlatforms = [
      postToFacebook && "facebook",
      postToInstagram && "instagram",
      postToPinterest && "pinterest",
      postToThreads && "threads",
      postToTikTok && "tiktok"
    ].filter(Boolean)

    if (selectedPlatforms.length > 1) {
      if (postType === "carousel") {
        if (postToPinterest) return "Pinterest does not support carousel posts. Please uncheck Pinterest or change post type."
        if (postToTikTok) return "TikTok does not support carousel posts yet. Please uncheck TikTok or change post type."
      }

      if (postType === "reel") {
        if (postToPinterest) return "Pinterest does not support video reels. Please uncheck Pinterest or change post type."
      }

      if (postType === "pin") {
        if (postToFacebook || postToInstagram || postToThreads || postToTikTok) {
          return "Pinterest pin post type can only be used for Pinterest. Please uncheck other platforms or change post type."
        }
      }

      if (postToInstagram && postContent.length > 2200) return "When posting to Instagram, captions cannot exceed 2,200 characters"
      if (postToThreads && postContent.length > 500) return "When posting to Threads, text cannot exceed 500 characters"
      if (postToTikTok && postContent.length > 2200) return "When posting to TikTok, descriptions cannot exceed 2,200 characters"

      if ((postToInstagram || postToPinterest || postToTikTok) && !hasMedia) {
        return "Instagram, Pinterest, and TikTok require media"
      }
    }

    // File size validations
    const oversizedFiles = selectedFiles.filter((file) => file.size > 100 * 1024 * 1024 * 1024)
    if (oversizedFiles.length > 0) return "All files must be smaller than 100MB"

    if (scheduledDate) {
      if (!scheduledTime) return "Please select a scheduled time."
      const scheduledDateTimeString = `${scheduledDate}T${scheduledTime}`
      const now = new Date()
      const scheduled = new Date(scheduledDateTimeString)
      if (scheduled <= now) return "Scheduled time must be in the future"
      const sixMonthsFromNow = new Date()
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
      if (scheduled > sixMonthsFromNow) return "Posts cannot be scheduled more than 6 months in advance"
    }

    return null
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

    if (pinterestAccessToken) {
      localStorage.setItem("pinterest_access_token", pinterestAccessToken)
      setIsPinterestTokenSet(true)
      fetchPinterestAccounts(pinterestAccessToken)
      setSelectedPlatforms((prev) => [...prev, "pinterest"])
    }

    if (threadsAccessToken) {
      localStorage.setItem("threads_access_token", threadsAccessToken)
      setIsThreadsTokenSet(true)
      fetchThreadsAccounts(threadsAccessToken)
      setSelectedPlatforms((prev) => [...prev, "threads"])
    }

    if (tiktokAccessToken) {
      localStorage.setItem("tiktok_access_token", tiktokAccessToken)
      setIsTikTokTokenSet(true)
      fetchTikTokAccounts(tiktokAccessToken)
      setSelectedPlatforms((prev) => [...prev, "tiktok"])
    }

    if (facebookAccessToken || instagramAccessToken || pinterestAccessToken || threadsAccessToken || tiktokAccessToken) {
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

  const handlePinterestSelection = (account: PinterestAccount) => {
    setSelectedPinterestAccount(account)
    localStorage.setItem("selected_pinterest_account", JSON.stringify(account))
    fetchPinterestPins(pinterestAccessToken)
    fetchPinterestInsights(account)
    setShowPageModal(false)
  }

  const handlePinterestBoardSelection = (board: PinterestBoard) => {
    setSelectedPinterestBoard(board)
    localStorage.setItem("selected_pinterest_board", JSON.stringify(board))
  }

  const handleThreadsSelection = (account: ThreadsAccount) => {
    setSelectedThreadsAccount(account)
    localStorage.setItem("selected_threads_account", JSON.stringify(account))
    fetchThreadsPosts(account)
    fetchThreadsInsights(account)
    setShowPageModal(false)
  }

  const handleTikTokSelection = (account: TikTokAccount) => {
    setSelectedTikTokAccount(account)
    localStorage.setItem("selected_tiktok_account", JSON.stringify(account))
    fetchTikTokVideos(tiktokAccessToken)
    fetchTikTokInsights(account)
    setShowPageModal(false)
  }

  const disconnectFacebook = () => {
    localStorage.removeItem("facebook_access_token")
    localStorage.removeItem("selected_facebook_page")
    setFacebookAccessToken("")
    setIsFacebookTokenSet(false)
    setSelectedFacebookPage(null)
    setFacebookPages([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "facebook"))
    alert("Facebook Disconnected")
  }

  const disconnectInstagram = () => {
    localStorage.removeItem("instagram_access_token")
    localStorage.removeItem("selected_instagram_account")
    setInstagramAccessToken("")
    setIsInstagramTokenSet(false)
    setSelectedInstagramAccount(null)
    setInstagramAccounts([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "instagram"))
    alert("Instagram Disconnected")
  }

  const disconnectPinterest = () => {
    localStorage.removeItem("pinterest_access_token")
    localStorage.removeItem("selected_pinterest_account")
    localStorage.removeItem("selected_pinterest_board")
    setPinterestAccessToken("")
    setIsPinterestTokenSet(false)
    setSelectedPinterestAccount(null)
    setSelectedPinterestBoard(null)
    setPinterestAccounts([])
    setPinterestBoards([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "pinterest"))
    alert("Pinterest Disconnected")
  }

  const disconnectTikTok = () => {
    localStorage.removeItem("tiktok_access_token")
    localStorage.removeItem("selected_tiktok_account")
    setTikTokAccessToken("")
    setIsTikTokTokenSet(false)
    setSelectedTikTokAccount(null)
    setTikTokAccounts([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "tiktok"))
    alert("TikTok Disconnected")
  }

  const disconnectThreads = () => {
    localStorage.removeItem("threads_access_token")
    localStorage.removeItem("selected_threads_account")
    setThreadsAccessToken("")
    setIsThreadsTokenSet(false)
    setSelectedThreadsAccount(null)
    setThreadsAccounts([])
    setSelectedPlatforms((prev) => prev.filter((p) => p !== "threads"))
    alert("Threads Disconnected")
  }

  const getPostTypeHelperText = () => {
    if (postType === "post") {
      if (postToFacebook && postToInstagram && postToThreads) {
        return "Single image or video post to multiple platforms. Instagram requires media."
      } else if (postToFacebook) {
        return "Text post with optional image or video for Facebook."
      } else if (postToInstagram) {
        return "Single image or video post for Instagram. Media is required."
      } else if (postToThreads) {
        return "Text post with optional image or video for Threads."
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
    } else if (postType === "pin") {
      return "Single image post for Pinterest with title and description."
    }
    return ""
  }

  const handleEmojiClick = (emojiData: any) => {
    setPostContent((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleHashtagClick = (hashtag: string) => {
    setPostContent((prev) => prev + " " + hashtag)
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
        `https://graph.facebook.com/v24.0/me/friends?access_token=${token}&fields=id,name&limit=10`,
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
      {/* Posting Status Banner */}
      {postingStatus.isPosting && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Loader2 className="h-5 w-5 animate-spin" />
                <div className="flex-1">
                  <p className="font-medium">{postingStatus.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-blue-100">
                    <span>{postingStatus.currentStep}</span>
                    {postingStatus.estimatedTime && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Est: {postingStatus.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-48">
                <Progress value={postingStatus.progress} className="h-2 bg-blue-700" />
                <p className="text-xs text-blue-100 text-right mt-1">{Math.round(postingStatus.progress)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Banner */}
      {uploadProgress.isUploading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Upload className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">
                    Uploading media ({uploadProgress.currentFileIndex}/{uploadProgress.totalFiles})
                  </p>
                  <p className="text-sm text-green-100">Current: {uploadProgress.currentFile}</p>
                </div>
              </div>
              <div className="w-48">
                <Progress value={uploadProgress.progress} className="h-2 bg-green-700" />
                <p className="text-xs text-green-100 text-right mt-1">{Math.round(uploadProgress.progress)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {selectedPinterestAccount && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                      <Share2 className="h-3 w-3 mr-1" />@{selectedPinterestAccount.username}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>Switch Pinterest Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {pinterestAccounts.map((account) => (
                            <DropdownMenuItem
                              key={account.id}
                              onClick={() => handlePinterestSelection(account)}
                              className={selectedPinterestAccount?.id === account.id ? "bg-red-50" : ""}
                            >
                              <div className="flex items-center gap-2">
                                {account.profile_picture && (
                                  <Image
                                    src={account.profile_picture || "/placeholder.svg"}
                                    alt={account.username}
                                    width={16}
                                    height={16}
                                    className="h-4 w-4 rounded-full"
                                  />
                                )}
                                <span className="truncate">@{account.username}</span>
                                {selectedPinterestAccount?.id === account.id && (
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
                        onClick={disconnectPinterest}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}
                {selectedThreadsAccount && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black text-white border-black">
                      <MessageCircle className="h-3 w-3 mr-1" />@{selectedThreadsAccount.username}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>Switch Threads Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {threadsAccounts.map((account) => (
                            <DropdownMenuItem
                              key={account.id}
                              onClick={() => handleThreadsSelection(account)}
                              className={selectedThreadsAccount?.id === account.id ? "bg-gray-100" : ""}
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
                                {selectedThreadsAccount?.id === account.id && (
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
                        onClick={disconnectThreads}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}
                {selectedTikTokAccount && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black text-white border-black">
                      <Music className="h-3 w-3 mr-1" />{selectedTikTokAccount.display_name}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>Switch TikTok Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {tiktokAccounts.map((account) => (
                            <DropdownMenuItem
                              key={account.open_id}
                              onClick={() => handleTikTokSelection(account)}
                              className={selectedTikTokAccount?.open_id === account.open_id ? "bg-gray-100" : ""}
                            >
                              <div className="flex items-center gap-2">
                                {account.avatar_url && (
                                  <Image
                                    src={account.avatar_url || "/placeholder.svg"}
                                    alt={account.display_name}
                                    width={16}
                                    height={16}
                                    className="h-4 w-4 rounded-full"
                                  />
                                )}
                                <span className="truncate">{account.display_name}</span>
                                {selectedTikTokAccount?.open_id === account.open_id && (
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
                        onClick={disconnectTikTok}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowPageModal(true)}
                  title="Select Pages"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Select Accounts
                </Button>
              </div>
              <Button
                onClick={() => setShowPostModal(true)}
                disabled={!isFacebookTokenSet && !isInstagramTokenSet && !isPinterestTokenSet && !isThreadsTokenSet && !isTikTokTokenSet || postingStatus.isPosting}
              >
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

      <div className="container mx-auto px-4 py-8" style={{ marginTop: postingStatus.isPosting || uploadProgress.isUploading ? '80px' : '0' }}>
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif">Social Media Dashboard</h2>
            <p className="text-muted-foreground">Manage your Facebook, Instagram, Pinterest, and Threads presence from one place.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.includes("timeout") || error.includes("longer than expected")
                  ? `${error} This is normal for US regions due to longer processing times. Please check your social media accounts directly.`
                  : error}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
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
                      {(facebookInsights?.page_fans || 0) +
                        (instagramInsights?.follower_count || 0) +
                        (pinterestInsights?.follower_count || 0) +
                        (threadsInsights?.follower_count || 0) +
                        (selectedTikTokAccount?.follower_count || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookInsights?.page_fans || 0} | IG: {instagramInsights?.follower_count || 0} | PIN: {pinterestInsights?.follower_count || 0} | TH: {threadsInsights?.follower_count || 0} | TT: {selectedTikTokAccount?.follower_count || 0}
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
                      {(facebookInsights?.page_impressions || 0) +
                        (instagramInsights?.impressions || 0) +
                        (pinterestInsights?.pin_impressions || 0) +
                        (threadsInsights?.impressions || 0) +
                        (tiktokInsights?.views || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookInsights?.page_impressions || 0} | IG: {instagramInsights?.impressions || 0} | PIN: {pinterestInsights?.pin_impressions || 0} | TH: {threadsInsights?.impressions || 0} | TT: {tiktokInsights?.views || 0}
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
                      {(facebookInsights?.page_engaged_users || 0) +
                        (instagramInsights?.reach || 0) +
                        (threadsInsights?.reach || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookInsights?.page_engaged_users || 0} | IG: {instagramInsights?.reach || 0} | TH: {threadsInsights?.reach || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {facebookPosts.length + instagramPosts.length + pinterestPins.length + threadsPosts.length + tiktokVideos.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FB: {facebookPosts.length} | IG: {instagramPosts.length} | PIN: {pinterestPins.length} | TH: {threadsPosts.length} | TT: {tiktokVideos.length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
                <TabsList className="flex overflow-x-auto">
                  <TabsTrigger value="facebook" disabled={!isFacebookTokenSet}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </TabsTrigger>
                  <TabsTrigger value="instagram" disabled={!isInstagramTokenSet}>
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </TabsTrigger>
                  <TabsTrigger value="pinterest" disabled={!isPinterestTokenSet}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Pinterest
                  </TabsTrigger>
                  <TabsTrigger value="threads" disabled={!isThreadsTokenSet}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Threads
                  </TabsTrigger>
                  <TabsTrigger value="tiktok" disabled={!isTikTokTokenSet}>
                    <Music className="h-4 w-4 mr-2" />
                    TikTok
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="facebook">
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
                          <CardTitle className="text-sm">Website Clicks</CardTitle>
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

                <TabsContent value="pinterest">
                  {selectedPinterestAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Username</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedPinterestAccount.username}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Boards</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{pinterestBoards.length}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {pinterestInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Pin Impressions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{pinterestInsights.pin_impressions}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Total Engagements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{pinterestInsights.total_engagements}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Pin Clicks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{pinterestInsights.pin_clicks}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Outbound Clicks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{pinterestInsights.outbound_clicks}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="threads">
                  {selectedThreadsAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Username</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedThreadsAccount.username}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Followers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedThreadsAccount.followers_count}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {threadsInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Impressions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{threadsInsights.impressions}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Reach</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{threadsInsights.reach}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Profile Views</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{threadsInsights.profile_views}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{threadsInsights.engagement}</div>
                        </CardContent>
                      </Card>
                    </div>

                  )}
                </TabsContent>

                <TabsContent value="tiktok">
                  {selectedTikTokAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Display Name</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedTikTokAccount.display_name}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Followers</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedTikTokAccount.follower_count}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {tiktokInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Likes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{tiktokInsights.likes}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Comments</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{tiktokInsights.comments}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Shares</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{tiktokInsights.shares}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Views</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{tiktokInsights.views}</div>
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

                {/* Pinterest Pins */}
                {isPinterestTokenSet && pinterestPins.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-red-600" />
                      Pinterest Pins
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pinterestPins.map((pin) => {
                        // Helper to safely extract the image URL from the nested media object
                        // Pinterest provides multiple sizes; we try 600x315 or 1200x first, then fallback to any available
                        const imageUrl =
                          pin.media?.images?.['600x315']?.url ||
                          pin.media?.images?.['1200x']?.url ||
                          (pin.media?.images ? Object.values(pin.media.images)[0]?.url : null);

                        return (
                          <Card key={pin.id}>
                            <CardContent className="p-4">
                              {imageUrl && (
                                <img
                                  src={imageUrl}
                                  alt="Pin"
                                  className="w-full h-48 object-cover rounded-lg mb-3"
                                />
                              )}
                              <h4 className="font-medium mb-1">{pin.title || "No title"}</h4>
                              <p className="text-sm text-gray-600 mb-2">{pin.description || "No description"}</p>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>❤️ {pin.like_count || 0}</span>
                                <span>💬 {pin.comment_count || 0}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(pin.created_at).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Threads Posts */}
                {isThreadsTokenSet && threadsPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-black" />
                      Threads Posts
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {threadsPosts.map((post) => {
                        // START OF FIX: Use case-insensitive includes for a more robust check
                        const lowerCaseUrl = post.media_url?.toLowerCase() || '';
                        const isVideo =
                          lowerCaseUrl.includes('.mp4') ||
                          lowerCaseUrl.includes('.mov') ||
                          lowerCaseUrl.includes('.avi') ||
                          lowerCaseUrl.includes('video'); // General check for 'video' in URL

                        return (
                          <Card key={post.id}>
                            <CardContent className="p-4">
                              {post.media_url && (
                                isVideo ? (
                                  <Video
                                    src={post.media_url}
                                    controls
                                    // Add width/height for better video rendering on initial load
                                    width="100%"
                                    height="100%"
                                    className="w-full h-48 object-contain rounded-lg mb-3" // Changed object-cover to object-contain for videos
                                    aria-label="Threads video post"
                                  />
                                ) : (
                                  <img
                                    src={post.media_url}
                                    alt="Post"
                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                  />
                                )
                              )}
                              <p className="text-sm text-gray-600 mb-2">{post.text || "No text"}</p>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>❤️ {post.like_count || 0}</span>
                                <span>💬 {post.reply_count || 0}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(post.timestamp).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* TikTok Videos */}
                {isTikTokTokenSet && tiktokVideos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Music className="h-5 w-5 text-black" />
                      TikTok Videos
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {tiktokVideos.map((video) => (
                        <Card key={video.id}>
                          <CardContent className="p-4">
                            <div className="relative w-full h-[325px] mb-3 bg-black rounded-lg overflow-hidden group">
                              <a href={video.share_url || video.embed_link || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                <img
                                  src={video.cover_image_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black/50 p-3 rounded-full group-hover:bg-black/70 transition-colors">
                                    <Play className="h-8 w-8 text-white" fill="white" />
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Watch on TikTok
                                </div>
                              </a>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.title || "No description"}</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>❤️ {video.like_count || 0}</span>
                              <span>💬 {video.comment_count || 0}</span>
                              <span>👁️ {video.view_count || 0}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(video.create_time * 1000).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No posts message */}
                {(!isFacebookTokenSet || facebookPosts.length === 0) &&
                  (!isInstagramTokenSet || instagramPosts.length === 0) &&
                  (!isPinterestTokenSet || pinterestPins.length === 0) &&
                  (!isThreadsTokenSet || threadsPosts.length === 0) &&
                  (!isTikTokTokenSet || tiktokVideos.length === 0) && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No posts available. Connect your accounts to see posts.</p>
                    </div>
                  )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>


      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Social Media Accounts</DialogTitle>
            <DialogDescription>
              Connect your social media accounts to start managing your presence across platforms.
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

            <Button
              onClick={() => initiateOAuth("pinterest")}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Connect Pinterest
            </Button>

            <Button
              onClick={() => initiateOAuth("threads")}
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              Connect Threads
            </Button>

            <Button
              onClick={() => initiateOAuth("tiktok")}
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              <Music className="h-4 w-4 mr-2" />
              Connect TikTok
            </Button>

            <div className="text-center text-sm text-muted-foreground">You can connect one or multiple platforms</div>
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
              <div className="flex space-x-2 flex-wrap gap-2">
                <Button
                  variant={postType === "post" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPostType("post")
                    setSelectedFiles([])
                    setFilePreviews([])
                    setPostToPinterest(false)
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
                    setPostToPinterest(false)
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
                    setPostToPinterest(false)
                  }}
                >
                  Carousel
                </Button>
                <Button
                  variant={postType === "pin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPostType("pin")
                    setSelectedFiles([])
                    setFilePreviews([])

                    // Add these lines to auto-switch platforms
                    setPostToFacebook(false)
                    setPostToInstagram(false)
                    setPostToThreads(false)
                    setPostToPinterest(true)
                  }}
                >
                  Pinterest Pin
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getPostTypeHelperText()}</p>
            </div>

            <div className="space-y-2">
              <Label>Platform Selection</Label>
              <div className="flex space-x-4 flex-wrap gap-2">
                {postType !== "pin" && (
                  <>
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
                  </>
                )}
                {postType === "pin" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pinterest"
                      checked={postToPinterest}
                      // @ts-ignore
                      onCheckedChange={setPostToPinterest}
                      disabled={!selectedPinterestAccount || !selectedPinterestBoard}
                    />
                    <Label htmlFor="pinterest" className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4 text-red-600" />
                      <span>Pinterest</span>
                    </Label>
                  </div>
                )}
                {postType !== "pin" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="threads"
                      checked={postToThreads}
                      // @ts-ignore
                      onCheckedChange={setPostToThreads}
                      disabled={!selectedThreadsAccount}
                    />
                    <Label htmlFor="threads" className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-black" />
                      <span>Threads</span>
                    </Label>
                  </div>
                )}
                {postType === "reel" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tiktok"
                      checked={postToTikTok}
                      // @ts-ignore
                      onCheckedChange={setPostToTikTok}
                      disabled={!selectedTikTokAccount}
                    />
                    <Label htmlFor="tiktok" className="flex items-center space-x-2">
                      <Music className="h-4 w-4 text-black" />
                      <span>TikTok</span>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Pinterest-specific fields */}
            {postToPinterest && postType === "pin" && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-red-600" />
                  Pinterest Pin Details
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="pin-title">Pin Title *</Label>
                  <Input
                    id="pin-title"
                    placeholder="Enter pin title..."
                    value={pinTitle}
                    onChange={(e) => setPinTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{pinTitle.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin-description">Pin Description</Label>
                  <Textarea
                    id="pin-description"
                    placeholder="Describe your pin..."
                    value={pinDescription}
                    onChange={(e) => setPinDescription(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{pinDescription.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin-link">Link (Optional)</Label>
                  <Input
                    id="pin-link"
                    placeholder="https://example.com"
                    value={pinLink}
                    onChange={(e) => setPinLink(e.target.value)}
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select or Create Board</Label>

                  {/* Board Selection Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mb-2">
                        {selectedPinterestBoard ? selectedPinterestBoard.name : "Select a board..."}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-48 overflow-y-auto">
                      {pinterestBoards.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No boards found. Create one below.</div>
                      ) : (
                        pinterestBoards.map((board) => (
                          <DropdownMenuItem
                            key={board.id}
                            onClick={() => handlePinterestBoardSelection(board)}
                          >
                            {board.name}
                            {selectedPinterestBoard?.id === board.id && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Create Board Input - Always Visible Now */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="New board name..."
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      className="h-9"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCreateBoard}
                      disabled={isCreatingBoard || !newBoardName.trim()}
                    >
                      {isCreatingBoard ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {postType !== "pin" && (
              <div className="space-y-2">
                <Label htmlFor="post-content">
                  {postType === "reel" ? "Video Description" :
                    postType === "pin" ? "Pin Description (optional)" :
                      "Post Content"}
                </Label>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    id="post-content"
                    placeholder={
                      postType === "reel"
                        ? "Describe your reel... (Type @ to mention people)"
                        : postType === "carousel"
                          ? "Caption for your carousel... (Type @ to mention people)"
                          : postType === "pin"
                            ? "Additional description for your pin... (Type @ to mention people)"
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
                    {postContent.length}/
                    {postToThreads ? "500" :
                      postToInstagram ? "2,200" :
                        "63,206"} characters
                  </span>
                  <span className="text-xs">
                    {postToThreads && postContent.length > 500 && (
                      <span className="text-red-500">Threads limit exceeded</span>
                    )}
                    {postToInstagram && postContent.length > 2200 && (
                      <span className="text-red-500">Instagram limit exceeded</span>
                    )}
                    {postToFacebook && postContent.length > 63206 && (
                      <span className="text-red-500">Facebook limit exceeded</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="media-upload">
                {postType === "reel"
                  ? "Video (Required)"
                  : postType === "carousel"
                    ? "Images (2-10 required)"
                    : postType === "pin"
                      ? "Image (Required)"
                      : "Media (Optional)"}
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  ref={fileInputRef}
                  id="media-upload"
                  type="file"
                  accept={postType === "reel" ? "video/*" :
                    postType === "carousel" ? "image/*" :
                      postType === "pin" ? "image/*" :
                        "image/*,video/*"}
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
                      setFileTypes([])
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {postType === "carousel"
                  ? "You can select multiple images (2-10) by holding Ctrl/Cmd and clicking, or by dragging and dropping"
                  : postType === "reel"
                    ? "Select one video file"
                    : postType === "pin"
                      ? "Select one image file for your pin"
                      : "Select one image or video file"}
              </p>

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
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                    {postType === "carousel" && ` (${selectedFiles.length}/10)`}
                  </p>
                </div>
              )}
            </div>

            {(postToFacebook || postToInstagram || postToPinterest || postToThreads || postToTikTok) && (
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
            {/* 
            {(postToInstagram || postToPinterest || postToThreads) && isScheduled && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                Only Facebook supports scheduled posts. Uncheck other platforms to schedule to Facebook only.
              </div>
            )} */}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPostModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePost}
                disabled={postingStatus.isPosting || uploadProgress.isUploading}
              >
                {postingStatus.isPosting || uploadProgress.isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadProgress.isUploading ? 'Uploading...' : 'Posting...'}
                  </>
                ) : isScheduled ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule {postType === "reel" ? "Reel" : postType === "carousel" ? "Carousel" : postType === "pin" ? "Pin" : "Post"}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post {postType === "reel" ? "Reel" : postType === "carousel" ? "Carousel" : postType === "pin" ? "Pin" : "Now"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPageModal} onOpenChange={setShowPageModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Your Accounts</DialogTitle>
            <DialogDescription>Choose which accounts to use for posting and analytics.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {facebookPages.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook Pages
                </Label>
                <div className="grid gap-2">
                  {facebookPages.map((page) => (
                    <Button
                      key={page.id}
                      variant={selectedFacebookPage?.id === page.id ? "default" : "outline"}
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handlePageSelection(page)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {page.picture?.data?.url && (
                          <Image
                            src={page.picture.data.url || "/placeholder.svg"}
                            alt={page.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">{page.name}</div>
                        </div>
                        {selectedFacebookPage?.id === page.id && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {instagramAccounts.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  Instagram Accounts
                </Label>
                <div className="grid gap-2">
                  {instagramAccounts.map((account) => (
                    <Button
                      key={account.id}
                      variant={selectedInstagramAccount?.id === account.id ? "default" : "outline"}
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleInstagramSelection(account)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {account.profile_picture_url && (
                          <Image
                            src={account.profile_picture_url || "/placeholder.svg"}
                            alt={account.username}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">@{account.username}</div>
                          <div className="text-sm text-muted-foreground">{account.name}</div>
                        </div>
                        {selectedInstagramAccount?.id === account.id && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {pinterestAccounts.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Share2 className="h-5 w-5 text-red-600" />
                  Pinterest Accounts
                </Label>
                <div className="grid gap-2">
                  {pinterestAccounts.map((account) => (
                    <Button
                      key={account.id}
                      variant={selectedPinterestAccount?.id === account.id ? "default" : "outline"}
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handlePinterestSelection(account)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {account.profile_picture && (
                          <Image
                            src={account.profile_picture || "/placeholder.svg"}
                            alt={account.username}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">@{account.username}</div>
                          <div className="text-sm text-muted-foreground">{account.full_name}</div>
                        </div>
                        {selectedPinterestAccount?.id === account.id && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedPinterestAccount && pinterestBoards.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm">Select Board for Pins</Label>
                    <div className="grid gap-2">
                      {pinterestBoards.map((board) => (
                        <Button
                          key={board.id}
                          variant={selectedPinterestBoard?.id === board.id ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handlePinterestBoardSelection(board)}
                        >
                          {board.name}
                          {selectedPinterestBoard?.id === board.id && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {threadsAccounts.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-5 w-5 text-black" />
                  Threads Accounts
                </Label>
                <div className="grid gap-2">
                  {threadsAccounts.map((account) => (
                    <Button
                      key={account.id}
                      variant={selectedThreadsAccount?.id === account.id ? "default" : "outline"}
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleThreadsSelection(account)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {account.profile_picture_url && (
                          <Image
                            src={account.profile_picture_url || "/placeholder.svg"}
                            alt={account.username}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">@{account.username}</div>
                          <div className="text-sm text-muted-foreground">{account.name}</div>
                        </div>
                        {selectedThreadsAccount?.id === account.id && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {tiktokAccounts.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Music className="h-5 w-5 text-black" />
                  TikTok Accounts
                </Label>
                <div className="grid gap-2">
                  {tiktokAccounts.map((account) => (
                    <Button
                      key={account.open_id}
                      variant={selectedTikTokAccount?.open_id === account.open_id ? "default" : "outline"}
                      className="w-full justify-start h-auto py-3"
                      onClick={() => handleTikTokSelection(account)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {account.avatar_url && (
                          <Image
                            src={account.avatar_url || "/placeholder.svg"}
                            alt={account.display_name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">{account.display_name}</div>
                        </div>
                        {selectedTikTokAccount?.open_id === account.open_id && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}