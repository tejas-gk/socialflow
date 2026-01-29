import { FacebookPage, FacebookPost, FacebookInsights, Demographics, PostAnalytics } from "@/types/social-types"

export const FacebookService = {
    fetchPages: async (token: string): Promise<FacebookPage[]> => {
        const response = await fetch(
            `https://graph.facebook.com/v24.0/me/accounts?access_token=${token}&fields=id,name,access_token,picture`,
        )
        if (!response.ok) throw new Error("Failed to fetch Facebook pages.")
        const data = await response.json()
        if (data.error) throw new Error(data.error.message)
        return data.data || []
    },

    fetchPosts: async (page: FacebookPage): Promise<FacebookPost[]> => {
        const response = await fetch(
            `https://graph.facebook.com/v24.0/${page.id}/posts?access_token=${page.access_token}&fields=id,message,story,full_picture,created_time,likes.summary(true),comments.summary(true),shares&limit=10`,
        )
        if (!response.ok) throw new Error("Failed to fetch Facebook posts")
        const data = await response.json()
        if (data.error) throw new Error(data.error.message)
        return data.data || []
    },

    fetchInsights: async (page: FacebookPage): Promise<FacebookInsights | null> => {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v24.0/${page.id}/insights?metric=page_media_view,page_follows,page_post_engagements&period=day&access_token=${page.access_token}`,
            )
            if (response.ok) {
                const data = await response.json()
                const insights: FacebookInsights = {
                    page_impressions: 0,
                    page_engaged_users: 0,
                    page_fans: 0,
                    page_views: 0,
                    page_posts_impressions: 0,
                    page_video_views: 0,
                    page_actions_post_reactions_total: 0,
                }
                data.data?.forEach((metric: any) => {
                    const latestValue = metric.values?.[metric.values.length - 1]?.value || 0
                    switch (metric.name) {
                        case 'page_media_view': insights.page_video_views = latestValue; break
                        case 'page_follows': insights.page_fans = latestValue; break
                        case 'page_post_engagements': insights.page_engaged_users = latestValue; break
                    }
                })
                return insights
            }
        } catch (err) {
            console.error("Facebook insights fetch failed:", err)
        }
        return null
    },

    fetchDemographics: async (page: FacebookPage): Promise<Demographics | null> => {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v24.0/${page.id}/insights?metric=page_follows_country,page_follows_city&period=lifetime&access_token=${page.access_token}`,
            )
            if (response.ok) {
                const data = await response.json()
                const demographics: Demographics = { age_gender: [], countries: [], cities: [] }
                data.data?.forEach((metric: any) => {
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
                    } else if (metric.name === "page_follows_country") {
                        demographics.countries = Object.entries(latestValue).map(([country, value]) => ({ country, value: value as number })).slice(0, 10)
                    } else if (metric.name === "page_follows_city") {
                        demographics.cities = Object.entries(latestValue).map(([city, value]) => ({ city, value: value as number })).slice(0, 10)
                    }
                })
                return demographics
            }
        } catch (err) {
            console.error("Facebook demographics fetch failed:", err)
        }
        return null
    },

    fetchPostAnalytics: async (page: FacebookPage, posts: FacebookPost[]): Promise<PostAnalytics[]> => {
        try {
            const results = await Promise.all(
                posts.slice(0, 5).map(async (post) => {
                    const response = await fetch(
                        `https://graph.facebook.com/v24.0/${post.id}/insights?metric=post_media_view,post_clicks&access_token=${page.access_token}`,
                    )
                    if (response.ok) {
                        const data = await response.json()
                        const analytics: PostAnalytics = { post_id: post.id, impressions: 0, reach: 0, engagement: 0, clicks: 0 }
                        data.data?.forEach((metric: any) => {
                            const value = metric.values?.[0]?.value || 0
                            switch (metric.name) {
                                case "post_media_view": analytics.impressions = value; break
                                case "post_reach": analytics.reach = value; break
                                case "post_engaged_users": analytics.engagement = value; break
                                case "post_clicks": analytics.clicks = value; break
                            }
                        })
                        return analytics
                    }
                    return null
                })
            )
            return results.filter(Boolean) as PostAnalytics[]
        } catch (err) {
            console.error("Facebook post analytics fetch failed:", err)
            return []
        }
    },

    postToPage: async (
        page: FacebookPage,
        content: string,
        fileUrls: string[],
        options: {
            postType: string,
            isScheduled: boolean,
            scheduledDate?: string,
            scheduledTime?: string,
            taggedIds?: string[],
            fileTypes?: string[],
            onStatusUpdate?: (msg: string) => void
        }
    ) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000)

        try {
            if (options.postType === "carousel" && fileUrls.length > 1) {
                const attachedMedia = []
                for (const url of fileUrls) {
                    options.onStatusUpdate?.(`Uploading carousel image ${attachedMedia.length + 1}/${fileUrls.length} to Facebook...`)
                    const formData = new FormData()
                    formData.append("access_token", page.access_token)
                    formData.append("published", "false")
                    const fileResponse = await fetch(url)
                    const blob = await fileResponse.blob()
                    formData.append("source", blob)
                    const photoResponse = await fetch(`https://graph.facebook.com/v24.0/${page.id}/photos`, {
                        method: "POST",
                        body: formData,
                        signal: controller.signal
                    })
                    if (!photoResponse.ok) throw new Error("Carousel image upload failed")
                    const photoResult = await photoResponse.json()
                    attachedMedia.push({ media_fbid: photoResult.id })
                }

                const postData: any = { message: content, attached_media: attachedMedia, access_token: page.access_token }
                if (options.taggedIds && options.taggedIds.length > 0) postData.tags = options.taggedIds.join(",")
                if (options.isScheduled && options.scheduledDate && options.scheduledTime) {
                    const scheduledDateTime = new Date(`${options.scheduledDate}T${options.scheduledTime}`)
                    postData.scheduled_publish_time = Math.floor(scheduledDateTime.getTime() / 1000)
                    postData.published = false
                }

                const response = await fetch(`https://graph.facebook.com/v24.0/${page.id}/feed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postData),
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Carousel post failed")
                return await response.json()
            }

            if (fileUrls.length > 0) {
                const isVideo = options.fileTypes?.[0]?.startsWith("video/")
                if (isVideo) {
                    options.onStatusUpdate?.("Uploading video to Facebook...")
                    const payload: any = {
                        file_url: fileUrls[0],
                        title: "Post Video",
                        description: content,
                        published: !options.isScheduled,
                        access_token: page.access_token,
                    }
                    if (options.isScheduled && options.scheduledDate && options.scheduledTime) {
                        const scheduledDateTime = new Date(`${options.scheduledDate}T${options.scheduledTime}`)
                        payload.scheduled_publish_time = Math.floor(scheduledDateTime.getTime() / 1000)
                    }
                    const response = await fetch(`https://graph-video.facebook.com/v23.0/${page.id}/videos`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    })
                    if (!response.ok) throw new Error("Video upload failed")
                    return await response.json()
                } else {
                    options.onStatusUpdate?.("Uploading image to Facebook...")
                    const formData = new FormData()
                    formData.append("caption", content)
                    formData.append("access_token", page.access_token)
                    const fileResponse = await fetch(fileUrls[0])
                    const blob = await fileResponse.blob()
                    formData.append("source", blob)
                    if (options.taggedIds && options.taggedIds.length > 0) formData.append("tags", options.taggedIds.join(","))
                    if (options.isScheduled && options.scheduledDate && options.scheduledTime) {
                        const scheduledDateTime = new Date(`${options.scheduledDate}T${options.scheduledTime}`)
                        formData.append("scheduled_publish_time", Math.floor(scheduledDateTime.getTime() / 1000).toString())
                        formData.append("published", "false")
                    }
                    const response = await fetch(`https://graph.facebook.com/v24.0/${page.id}/photos`, {
                        method: "POST",
                        body: formData,
                        signal: controller.signal
                    })
                    if (!response.ok) throw new Error("Photo post failed")
                    return await response.json()
                }
            } else {
                options.onStatusUpdate?.("Publishing text post to Facebook...")
                const postData: any = { message: content, access_token: page.access_token }
                if (options.taggedIds && options.taggedIds.length > 0) postData.tags = options.taggedIds.join(",")
                if (options.isScheduled && options.scheduledDate && options.scheduledTime) {
                    const scheduledDateTime = new Date(`${options.scheduledDate}T${options.scheduledTime}`)
                    postData.scheduled_publish_time = Math.floor(scheduledDateTime.getTime() / 1000)
                    postData.published = false
                }
                const response = await fetch(`https://graph.facebook.com/v24.0/${page.id}/feed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postData),
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Text post failed")
                return await response.json()
            }
        } finally {
            clearTimeout(timeoutId)
        }
    }
}
