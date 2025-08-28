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
      console.error('No Facebook page selected:', error)
      return null
    }
  }

  async getSelectedInstagramAccount(): Promise<InstagramAccount | null> {
    try {
      return this.request<InstagramAccount>("/auth/instagram/selected-account")
    } catch (error) {
      console.error('No Instagram account selected:', error)
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

  // Analytics methods
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>("/api/social/analytics/overview")
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

  async selectInstagramAccount(accountId: string): Promise<{ success: boolean; message: string; account: InstagramAccount }> {
  console.log("[v0] Calling selectInstagramAccount with accountId:", accountId)
  return this.request("/auth/instagram/select-account", {
    method: "POST",
    body: JSON.stringify({ accountId }),
  })
}

}

export const apiClient = new ApiClient()
export const api = apiClient
