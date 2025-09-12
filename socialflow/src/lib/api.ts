// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface FacebookPage {
  id: string
  name: string
  access_token?: string
}

export interface InstagramAccount {
  id: string
  name?: string
  username?: string
  pageAccessToken?: string
  accessToken?: string
  followersCount: string
  mediaCount: string
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
    platform: "Facebook" | "Instagram"
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
export interface InstagramDashboardReport {
  getTotalFollowers: {
    followers_count: number
    id: string
  }
  getNewFollowers: {
    data: {
      name: "follower_count"
      period: "day"
      values: {
        value: number
        end_time: string
      }[]
      title: "Follower Count"
      description: string
      id: string
    }[]
    paging: {
      previous: string
      next: string
    }
  }
  getTotalPosts: {
    media_count: number
    id: string
  }
  getTotalEngagement: {
    data: [
      {
        name: "total_interactions"
        period: "day"
        title: "Content interactions"
        description: string
        total_value: {
          value: number
        }
        id: string
      },
    ]
    paging: {
      previous: string
      next: string
    }
  }
  getProfileViews: {
    data: {
      name: "profile_views"
      period: "day"
      values: {
        value: number
        end_time: string
      }[]
      title: "Profile Views"
      description: string
      id: string
    }[]
    paging: {
      previous: string
      next: string
    }
  }
  impressionsVsReach: {
    impressions: {
      value: number
      end_time: string
    }[]
    reach: {
      value: number
      end_time: string
    }[]
  }
}

export interface InstagramFollowersResponse {
  total: {
    followers_count: number
    id: string
  }
  new: {
    data: {
      name: "follower_count"
      period: "day"
      values: {
        value: number
        end_time: string
      }[]
      title: "Follower Count"
      description: string
      id: string
    }[]
    paging: {
      previous: string
      next: string
    }
  }
}

export interface InstagramEngagementResponse {
  data: [
    {
      name: "total_interactions"
      period: "day"
      title: "Content interactions"
      description: string
      total_value: {
        value: number
      }
      id: string
    },
  ]
  paging: {
    previous: string
    next: string
  }
}

export interface InstagramProfileViewsResponse {
  data: {
    name: "profile_views"
    period: "day"
    values: {
      value: number
      end_time: string
    }[]
    title: "Profile Views"
    description: string
    id: string
  }[]
  paging: {
    previous: string
    next: string
  }
}

export interface InstagramPostsResponse {
  media_count: number
  id: string
}

export interface InstagramAccountAnalytics {
  id: string
  name: string
  username: string
  followersCount: number
  mediaCount: number
  pageId: string
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

export interface FacebookPageInsights {
  report: {
    pageLikes: {
      data: Array<{
        values: Array<{
          end_time?: string
          value?: number | string | null
        }>
      }>
    }
    pageReach: {
      data: Array<{
        values: Array<{
          end_time?: string
          value?: number | string | null
        }>
      }>
    }
    totalEngagement: {
      data: Array<{
        values: Array<{
          end_time?: string
          value?: number | string | null
        }>
      }>
    }
  }
}

export interface FacebookPost {
  id: string
  message?: string
  full_picture?: string
  created_time: string
}

export interface FacebookPostsResponse {
  data: FacebookPost[]
}

export interface FacebookPostDetails {
  post_details: {
    id: string
    message?: string
    full_picture?: string
    created_time: string
  }
  post_stats: {
    post_impressions?: number
    post_impressions_unique?: number
    total_reactions?: number
    total_comments?: number
    total_shares?: number
    total_clicks?: number
    total_engagements?: number
    engagement_rate?: number
  }
}

export interface InstagramMedia {
  id: string
  media_type: string
  media_url?: string
  thumbnail_url?: string
  caption?: string
  timestamp: string
  permalink: string
}

export interface InstagramMediaResponse {
  data: InstagramMedia[]
}

export interface InstagramMediaDetails {
  media_details: {
    id: string
    media_type: string
    media_url?: string
    thumbnail_url?: string
    caption?: string
    timestamp: string
    permalink: string
  }
  media_stats: {
    impressions?: number
    reach?: number
    engagement?: number
    likes?: number
    comments?: number
    shares?: number
    saves?: number
  }
}

export interface ConnectionStatus {
  facebook: {
    connected: boolean
    pageSelected: boolean
    pageName?: string
    lastUpdated?: string
  }
  instagram: {
    connected: boolean
    accountSelected: boolean
    username?: string
    lastUpdated?: string
  }
}

export interface TestResults {
  facebook: {
    success: boolean
    error?: string
    details?: string
    userInfo?: { id: string; name: string }
    pageTest?: { success: boolean; pageName?: string; error?: string }
    lastTested?: string
  }
  instagram: {
    success: boolean
    error?: string
    details?: string
    accountsFound?: number
    accountTest?: { success: boolean; username?: string; error?: string }
    lastTested?: string
  }
  overall: boolean
}

// src/lib/api.ts

export async function uploadMedia(files: File[]) {
  const uploadedFiles = [];
  for (const file of files) {
    const response = await fetch(`/api/uploads?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`, {
      method: "POST",
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload media");
    }

    const data = await response.json();
    uploadedFiles.push(data);
  }

  return { files: uploadedFiles };
}

export type FbPage = FacebookPage

class ApiClient {
  private baseUrl = API_BASE_URL

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (typeof window !== "undefined" && window.__clerk_user_id) {
      headers["x-clerk-user-id"] = window.__clerk_user_id
    }
    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async postToMultiplePlatformsMultipart(postRequest: PostRequest, files: File[]) {
    const form = new FormData()
    form.append("payload", JSON.stringify(postRequest))
    files.forEach((f) => form.append("files", f, f.name))

    const url = `${this.baseUrl}/api/social/post-multipart`
    
    const headers = new Headers();
    if (typeof window !== "undefined" && window.__clerk_user_id) {
      headers.append("x-clerk-user-id", window.__clerk_user_id);
    }

    const response = await fetch(url, {
      method: "POST",
      body: form,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    return response.json();
  }
  
  // ... (The rest of the methods remain the same)
  // Authentication methods
  async getAuthStatus(): Promise<AuthStatus> {
    return this.request("/auth/status")
  }

  async disconnectPlatform(platform: "facebook" | "instagram"): Promise<{ success: boolean; message: string }> {
    return this.request(`/auth/disconnect/${platform}`, {
      method: "POST",
    })
  }

  async selectFacebookPage(pageId: string, userId: string): Promise<{ success: boolean; message: string; page: FacebookPage }> {
    return this.request("/auth/facebook/select-page", {
      method: "POST",
      body: JSON.stringify({ pageId, userId }),
    })
  }

  // Get selected accounts
  async getSelectedFacebookPage(): Promise<FacebookPage | null> {
    try {
      return this.request("/auth/facebook/selected-page")
    } catch (error) {
      return null
    }
  }

  async getSelectedInstagramAccount(): Promise<InstagramAccount | null> {
    try {
      return this.request("/auth/instagram/selected-account")
    } catch (error) {
      return null
    }
  }

  async getFacebookPages(): Promise<FacebookPage[]> {
    return this.request("/auth/facebook/pages")
  }

  async getInstagramAccounts(): Promise<InstagramAccount[]> {
    return this.request("/auth/instagram/accounts")
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
  async getAnalyticsOverview(params?: { fbPageId?: string; igAccountId?: string }): Promise<AnalyticsOverview> {
    const searchParams = new URLSearchParams()
    if (params?.fbPageId) searchParams.set("fbPageId", params.fbPageId)
    if (params?.igAccountId) searchParams.set("igAccountId", params.igAccountId)
    const qs = searchParams.toString()
    const url = `/api/social/analytics/overview${qs ? `?${qs}` : ""}`
    return this.request(url)
  }

  // Post management methods
  async getPostHistory(page = 1, limit = 10): Promise<PostHistoryResponse> {
    return this.request(`/api/social/posts/history?page=${page}&limit=${limit}`)
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
    const userState =
      state ||
      (typeof window !== "undefined" && window.__clerk_user_id
        ? JSON.stringify({ userId: window.__clerk_user_id })
        : "")
    const params = userState ? `?state=${encodeURIComponent(userState)}` : ""
    return `${API_BASE_URL}/auth/facebook${params}`
  }

  getInstagramAuthUrl(state?: string): string {
    const userState =
      state ||
      (typeof window !== "undefined" && window.__clerk_user_id
        ? JSON.stringify({ userId: window.__clerk_user_id })
        : "")
    const params = userState ? `?state=${encodeURIComponent(userState)}` : ""
    return `${API_BASE_URL}/auth/instagram${params}`
  }

  async selectInstagramAccount(
    accountId: string,
  ): Promise<{ success: boolean; message: string; account: InstagramAccount }> {
    return this.request("/auth/instagram/select-account", {
      method: "POST",
      body: JSON.stringify({ accountId }),
    })
  }

  async getFacebookPagesAnalytics(): Promise<{ data: FacebookPage[] }> {
    const pages = await this.request<FacebookPage[]>("/api/social/analytics/facebook/pages")
    return { data: pages }
  }

  async getFacebookPageInsights(pageId: string): Promise<FacebookPageInsights> {
    return this.request(`/api/social/analytics/facebook/page-insights?pageId=${encodeURIComponent(pageId)}`)
  }

  async getFacebookPagePosts(params: {
    pageId: string
    after?: string
    before?: string
    type?: string
    fromDate?: string
    toDate?: string
    limit?: number
  }): Promise<FacebookPostsResponse> {
    const q = new URLSearchParams()
    q.set("pageId", params.pageId)
    if (params.after) q.set("after", params.after)
    if (params.before) q.set("before", params.before)
    if (params.type) q.set("type", params.type)
    if (params.fromDate) q.set("fromDate", params.fromDate)
    if (params.toDate) q.set("toDate", params.toDate)
    if (typeof params.limit === "number") q.set("limit", String(params.limit))
    return this.request(`/api/social/analytics/facebook/posts?${q.toString()}`)
  }

  async getFacebookPostDetails(postId: string, accessToken: string): Promise<FacebookPostDetails> {
    const q = new URLSearchParams({ accessToken })
    return this.request(`/api/social/analytics/facebook/post/${encodeURIComponent(postId)}?${q.toString()}`)
  }

  async testConnections(): Promise<TestResults> {
    return this.request("/api/social/test-connections")
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return this.request("/api/social/connection-status")
  }

  async getInstagramAccountsAnalytics(): Promise<InstagramAccount[]> {
    return this.request("/api/social/analytics/instagram/accounts")
  }

  async getInstagramAccountInsights(accountId: string): Promise<InstagramDetails> {
    return this.request(`/api/social/analytics/instagram/account-insights?accountId=${encodeURIComponent(accountId)}`)
  }

  async getInstagramAccountMedia(params: {
    accountId: string
    after?: string
    limit?: number
  }): Promise<InstagramMediaResponse> {
    const q = new URLSearchParams()
    q.set("accountId", params.accountId)
    if (params.after) q.set("after", params.after)
    if (typeof params.limit === "number") q.set("limit", String(params.limit))
    return this.request(`/api/social/analytics/instagram/media?${q.toString()}`)
  }

  async getInstagramMediaDetails(mediaId: string, accessToken: string): Promise<InstagramMediaDetails> {
    const q = new URLSearchParams({ accessToken })
    return this.request(`/api/social/analytics/instagram/media/${encodeURIComponent(mediaId)}?${q.toString()}`)
  }

  async getInstagramDashboard(businessId: string): Promise<InstagramDashboardReport> {
    return this.request(`/api/social/analytics/instagram/dashboard?businessId=${encodeURIComponent(businessId)}`)
  }

  async getInstagramFollowers(businessId: string): Promise<InstagramFollowersResponse> {
    return this.request(`/api/social/analytics/instagram/followers?businessId=${encodeURIComponent(businessId)}`)
  }

  async getInstagramEngagement(businessId: string): Promise<InstagramEngagementResponse> {
    return this.request(`/api/social/analytics/instagram/engagement?businessId=${encodeURIComponent(businessId)}`)
  }

  async getInstagramProfileViews(businessId: string): Promise<InstagramProfileViewsResponse> {
    return this.request(`/api/social/analytics/instagram/profile-views?businessId=${encodeURIComponent(businessId)}`)
  }

  async getInstagramPosts(businessId: string): Promise<InstagramPostsResponse> {
    return this.request(`/api/social/analytics/instagram/posts?businessId=${encodeURIComponent(businessId)}`)
  }
}

export const apiClient = new ApiClient()
export const api = apiClient