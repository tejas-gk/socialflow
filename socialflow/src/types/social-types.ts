export interface FacebookPage {
    id: string
    name: string
    access_token: string
    picture?: {
        data: {
            url: string
        }
    }
}

export interface InstagramAccount {
    id: string
    username: string
    name: string
    profile_picture_url?: string
    followers_count?: number
    media_count?: number
    access_token?: string
}

export interface PinterestBoard {
    id: string
    name: string
    description?: string
    pin_count?: number
}

export interface PinterestAccount {
    id: string
    username: string
    full_name?: string
    profile_picture?: string
    board_count?: number
    access_token?: string
}

export interface ThreadsAccount {
    id: string
    username: string
    name: string
    profile_picture_url?: string
    followers_count?: number
    access_token?: string
}


export interface FacebookPost {
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

export interface InstagramPost {
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

export interface PinterestPin {
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

export interface ThreadsPost {
    id: string
    text?: string
    media_url?: string
    timestamp: string
    like_count?: number
    reply_count?: number
}

export interface FacebookInsights {
    page_impressions: number
    page_engaged_users: number
    page_fans: number
    page_views: number
    page_posts_impressions: number
    page_video_views: number
    page_actions_post_reactions_total: number
}

export interface InstagramInsights {
    impressions: number
    reach: number
    profile_views: number
    website_clicks: number
    follower_count: number
    media_count: number
}

export interface PinterestInsights {
    pin_impressions: number
    total_engagements: number
    pin_clicks: number
    outbound_clicks: number
    follower_count: number
    pin_count: number
}

export interface ThreadsInsights {
    impressions: number
    reach: number
    profile_views: number
    follower_count: number
    engagement: number
}

export interface Demographics {
    age_gender: any
    countries: any
    cities: any
}

export interface TikTokAccount {
    open_id: string
    union_id: string
    display_name: string
    avatar_url?: string
    follower_count?: number
}

export interface TikTokVideo {
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

export interface TikTokInsights {
    likes: number
    comments: number
    shares: number
    views: number
    followers: number
}

export interface PostAnalytics {
    post_id: string
    impressions: number
    reach: number
    engagement: number
    clicks: number
}
