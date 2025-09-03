const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface FacebookPage {
  id: string
  name: string
  access_token: string
}

export interface InstagramAccount {
  id: string
  name: string
  username: string
  pageAccessToken: string
}

export interface AuthStatus {
  facebook: boolean
  instagram: boolean
}

export interface PostRequest {
  content: string
  mediaUrls?: string[]
  mediaType?: string
  platforms: {
    facebook?: {
      enabled: boolean
      id: string
    }
    instagram?: {
      enabled: boolean
      id: string
    }
  }
  isScheduled?: boolean
  scheduledTime?: number
}

export interface AnalyticsOverview {
  totalReach: number
  totalEngagement: number
  totalFollowers: number
  engagementRate: number
  topPerformingPost: {
    id: string
    content: string
    platform: string
    likes: number
    comments: number
    shares: number
  }
  weeklyGrowth: {
    reach: number
    engagement: number
    followers: number
  }
  platformBreakdown: {
    facebook: {
      reach: number
      engagement: number
      followers: number
    }
    instagram: {
      reach: number
      engagement: number
      followers: number
    }
  }
  details?: {
    facebook?: FacebookDetails
    instagram?: InstagramDetails
  }
}

export type TimeSeriesPoint = { date: string; value: number }

export type FacebookDetails = {
  pageId: string
  name?: string
  metrics: {
    reach: number
    engagement: number
    followers: number
    impressions: number
    views: number
  }
  timeseries: {
    reach: TimeSeriesPoint[]
    engaged_users: TimeSeriesPoint[]
    impressions: TimeSeriesPoint[]
    views: TimeSeriesPoint[]
  }
}

export type InstagramDetails = {
  accountId: string
  username?: string
  metrics: {
    reach: number
    impressions: number
    profileViews: number
    followers: number
  }
  timeseries: {
    reach: TimeSeriesPoint[]
    impressions: TimeSeriesPoint[]
    profile_views: TimeSeriesPoint[]
  }
}

export interface PostHistoryItem {
  id: string
  content: string
  platforms: string[]
  status: "Posted" | "Scheduled" | "Failed"
  createdAt: string
  scheduledAt: string | null
  engagement: {
    instagram?: { likes: number; comments: number; shares: number }
    facebook?: { likes: number; comments: number; shares: number }
  } | null
}

export interface PostHistoryResponse {
  posts: PostHistoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UploadedFileInfo = {
  id: string
  url: string
  name: string
  type: string
  size: number
}

export type UploadResponse = {
  files: UploadedFileInfo[]
}

/**
 * Upload media files to the Next.js in-memory upload API.
 * Returns short-lived public URLs suitable for Meta image_url/video_url fields.
 */
export async function uploadMedia(files: File[]) {
  // Upload files one by one following official approach
  const uploadedFiles = []

  for (const file of files) {
    const response = await fetch(`/api/uploads?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file, // send raw file in body
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload media")
    }

    const data = await response.json()
    uploadedFiles.push(data)
  }

  return { files: uploadedFiles }
}

export type FbPage = FacebookPage

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    console.log("[v0] API Request:", { url, method: options.method || "GET" })

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    console.log("[v0] API Response:", { status: response.status, statusText: response.statusText })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API Response Data:", data)
    return data
  }

  // Authentication methods
  async getAuthStatus(): Promise<AuthStatus> {
    return this.request<AuthStatus>("/auth/status")
  }

  async disconnectPlatform(platform: "facebook" | "instagram"): Promise<{ success: boolean; message: string }> {
    return this.request(`/auth/disconnect/${platform}`, {
      method: "POST",
    })
  }

  async selectFacebookPage(pageId: string): Promise<{ success: boolean; message: string; page: FacebookPage }> {
    console.log("[v0] Calling selectFacebookPage with pageId:", pageId)
    return this.request("/auth/facebook/select-page", {
      method: "POST",
      body: JSON.stringify({ pageId }),
    })
  }

  // NEW: Get selected accounts
  async getSelectedFacebookPage(): Promise<FacebookPage | null> {
    try {
      return this.request<FacebookPage>("/auth/facebook/selected-page")
    } catch (error) {
      console.error("No Facebook page selected:", error)
      return null
    }
  }

  async getSelectedInstagramAccount(): Promise<InstagramAccount | null> {
    try {
      return this.request<InstagramAccount>("/auth/instagram/selected-account")
    } catch (error) {
      console.error("No Instagram account selected:", error)
      return null
    }
  }

  async getFacebookPages(): Promise<FacebookPage[]> {
    return this.request<FacebookPage[]>("/auth/facebook/pages")
  }

  async getInstagramAccounts(): Promise<InstagramAccount[]> {
    return this.request<InstagramAccount[]>("/auth/instagram/accounts")
  }

  // Social media posting methods
  async postToMultiplePlatforms(postRequest: PostRequest) {
    return this.request("/api/social/post", {
      method: "POST",
      body: JSON.stringify(postRequest),
    })
  }

  async postCarouselToInstagram(businessAccountId: string, postContent: string, mediaUrls: string[]) {
    return this.request("/api/social/instagram/carousel", {
      method: "POST",
      body: JSON.stringify({
        businessAccountId,
        postContent,
        mediaUrls,
      }),
    })
  }

  async postVideoToInstagram(businessAccountId: string, postContent: string, videoUrl: string, thumbnailUrl?: string) {
    return this.request("/api/social/instagram/video", {
      method: "POST",
      body: JSON.stringify({
        businessAccountId,
        postContent,
        videoUrl,
        thumbnailUrl,
      }),
    })
  }

  async postToMultiplePlatformsMultipart(postRequest: PostRequest, files: File[]) {
    const form = new FormData()
    form.append("payload", JSON.stringify(postRequest))
    files.forEach((f) => form.append("files", f, f.name))

    const url = `${API_BASE_URL}/api/social/post-multipart`
    console.log("[v0] API Multipart Request:", { url, files: files.length })

    const response = await fetch(url, {
      method: "POST",
      // Do not set Content-Type; browser will set multipart boundary
      body: form,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Multipart Error Response:", errorText)
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    const data = await response.json()
    console.log("[v0] API Multipart Response Data:", data)
    return data
  }

  // Analytics methods
  async getAnalyticsOverview(fbPageId?: string, igAccountId?: string): Promise<AnalyticsOverview> {
    const params = new URLSearchParams()
    if (fbPageId) params.set("fbPageId", fbPageId)
    if (igAccountId) params.set("igAccountId", igAccountId)
    const qs = params.toString()
    const url = `/api/social/analytics/overview${qs ? `?${qs}` : ""}`
    return this.request<AnalyticsOverview>(url)
  }

  // Post management methods
  async getPostHistory(page = 1, limit = 10): Promise<PostHistoryResponse> {
    return this.request<PostHistoryResponse>(`/api/social/posts/history?page=${page}&limit=${limit}`)
  }

  async getPostDetails(postId: string) {
    return this.request(`/api/social/posts/${postId}`)
  }

  async cancelScheduledPost(postId: string): Promise<{ success: boolean; message: string; postId: string }> {
    return this.request(`/api/social/posts/${postId}`, {
      method: "DELETE",
    })
  }

  // OAuth URLs
  getFacebookAuthUrl(state?: string): string {
    const params = state ? `?state=${encodeURIComponent(state)}` : ""
    return `${API_BASE_URL}/auth/facebook${params}`
  }

  getInstagramAuthUrl(state?: string): string {
    const params = state ? `?state=${encodeURIComponent(state)}` : ""
    return `${API_BASE_URL}/auth/instagram${params}`
  }

  async selectInstagramAccount(
    accountId: string,
  ): Promise<{ success: boolean; message: string; account: InstagramAccount }> {
    console.log("[v0] Calling selectInstagramAccount with accountId:", accountId)
    return this.request("/auth/instagram/select-account", {
      method: "POST",
      body: JSON.stringify({ accountId }),
    })
  }

  // Helper functions for Facebook analytics endpoints used by UI
  async getFacebookPagesAnalytics(): Promise<{ data: FacebookPage[] }> {
    const pages = await this.request<FacebookPage[]>("/api/social/analytics/facebook/pages")
    return { data: pages }
  }

  async getFacebookPageInsights(pageId: string): Promise<any> {
    return this.request<any>(`/api/social/analytics/facebook/page-insights?pageId=${encodeURIComponent(pageId)}`)
  }

  async getFacebookPagePosts(params: {
    pageId: string
    after?: string
    before?: string
    type?: string
    fromDate?: string
    toDate?: string
    limit?: number
  }): Promise<any> {
    const q = new URLSearchParams()
    q.set("pageId", params.pageId)
    if (params.after) q.set("after", params.after)
    if (params.before) q.set("before", params.before)
    if (params.type) q.set("type", params.type)
    if (params.fromDate) q.set("fromDate", params.fromDate)
    if (params.toDate) q.set("toDate", params.toDate)
    if (typeof params.limit === "number") q.set("limit", String(params.limit))
    return this.request<any>(`/api/social/analytics/facebook/posts?${q.toString()}`)
  }

  async getFacebookPostDetails(postId: string): Promise<any> {
    return this.request<any>(`/api/social/analytics/facebook/post/${encodeURIComponent(postId)}`)
  }
}

export const apiClient = new ApiClient()
export const api = apiClient
