import { InstagramAccount, InstagramPost, InstagramInsights } from "@/types/social-types"
import { SocialService } from "./social.service"

export const InstagramService = {
    fetchAccounts: async (token: string): Promise<InstagramAccount[]> => {
        // First get Facebook pages to find connected Instagram accounts
        const pagesResponse = await fetch(
            `https://graph.facebook.com/v24.0/me/accounts?access_token=${token}&fields=id,name,access_token`,
        )
        if (!pagesResponse.ok) throw new Error("Failed to fetch pages for Instagram accounts")
        const pagesData = await pagesResponse.json()
        const accounts: InstagramAccount[] = []

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
                            accounts.push({
                                ...accountData,
                                access_token: page.access_token,
                            })
                        }
                    }
                }
            } catch (err) {
                console.log("No Instagram account for page:", page.name)
            }
        }
        return accounts
    },

    fetchPosts: async (account: InstagramAccount): Promise<InstagramPost[]> => {
        const response = await fetch(
            `https://graph.facebook.com/v24.0/${account.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=10&access_token=${(account as any).access_token}`,
        )
        if (!response.ok) throw new Error("Failed to fetch Instagram posts")
        const data = await response.json()
        if (data.error) throw new Error(data.error.message)
        return data.data || []
    },

    fetchInsights: async (account: InstagramAccount): Promise<InstagramInsights | null> => {
        try {
            const baseUrl = `https://graph.facebook.com/v24.0/${account.id}/insights`
            const normalMetrics = "reach,follower_count"
            const totalMetrics = "website_clicks,profile_views,views"

            const [res1, res2] = await Promise.all([
                fetch(`${baseUrl}?metric=${normalMetrics}&period=day&access_token=${(account as any).access_token}`),
                fetch(`${baseUrl}?metric=${totalMetrics}&period=day&metric_type=total_value&access_token=${(account as any).access_token}`)
            ])

            if (!res1.ok || !res2.ok) return null

            const data1 = await res1.json()
            const data2 = await res2.json()
            const allMetrics = [...(data1.data || []), ...(data2.data || [])]

            const insights: InstagramInsights = {
                impressions: 0,
                reach: 0,
                profile_views: 0,
                website_clicks: 0,
                follower_count: account.followers_count || 0,
                media_count: account.media_count || 0,
            }

            allMetrics.forEach((metric: any) => {
                const value = metric.values?.[0]?.value || 0
                switch (metric.name) {
                    case "reach": insights.reach = value; break
                    case "follower_count": insights.follower_count = value; break
                    case "profile_views": insights.profile_views = value; break
                    case "website_clicks": insights.website_clicks = value; break
                    case "views": insights.impressions = value; break
                }
            })
            return insights
        } catch (err) {
            console.error("Instagram insights fetch failed:", err)
            return null
        }
    },

    postToAccount: async (
        account: InstagramAccount,
        content: string,
        fileUrls: string[],
        options: {
            postType: string,
            fileTypes: string[],
            onStatusUpdate?: (msg: string) => void
        }
    ) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 180000)

        try {
            if (options.postType === "carousel" && fileUrls.length > 1) {
                const mediaIds = []
                for (let i = 0; i < fileUrls.length; i++) {
                    options.onStatusUpdate?.(`Creating carousel item ${i + 1}/${fileUrls.length} for Instagram...`)
                    const url = fileUrls[i]
                    const isVideo = options.fileTypes[i]?.startsWith("video/")
                    const mediaType = isVideo ? "video_url" : "image_url"

                    const containerResponse = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            [mediaType]: url,
                            is_carousel_item: true,
                            access_token: (account as any).access_token,
                        }),
                        signal: controller.signal
                    })

                    if (!containerResponse.ok) throw new Error("Carousel item creation failed")
                    const containerResult = await containerResponse.json()
                    mediaIds.push(containerResult.id)

                    options.onStatusUpdate?.(`Processing carousel item ${i + 1}/${fileUrls.length}...`)
                    await SocialService.waitForMediaProcessing(containerResult.id, (account as any).access_token)
                }

                options.onStatusUpdate?.("Creating Instagram carousel...")
                const carouselResponse = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        media_type: "CAROUSEL",
                        children: mediaIds.join(","),
                        caption: content,
                        access_token: (account as any).access_token,
                    }),
                    signal: controller.signal
                })
                if (!carouselResponse.ok) throw new Error("Carousel container creation failed")
                const carouselResult = await carouselResponse.json()

                options.onStatusUpdate?.("Publishing Instagram carousel...")
                const publishResponse = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media_publish`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        creation_id: carouselResult.id,
                        access_token: (account as any).access_token,
                    }),
                    signal: controller.signal
                })
                if (!publishResponse.ok) throw new Error("Carousel publish failed")
                return await publishResponse.json()

            } else if (options.postType === "reel" && fileUrls.length > 0) {
                options.onStatusUpdate?.("Creating Instagram reel...")
                const response = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        media_type: "REELS",
                        video_url: fileUrls[0],
                        caption: content,
                        access_token: (account as any).access_token,
                    }),
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Reel creation failed")
                const result = await response.json()

                options.onStatusUpdate?.("Processing reel video...")
                await SocialService.waitForMediaProcessing(result.id, (account as any).access_token)

                options.onStatusUpdate?.("Publishing Instagram reel...")
                const publishResponse = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media_publish`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        creation_id: result.id,
                        access_token: (account as any).access_token,
                    }),
                    signal: controller.signal
                })
                if (!publishResponse.ok) throw new Error("Reel publish failed")
                return await publishResponse.json()

            } else {
                const isVideo = options.fileTypes[0]?.startsWith("video/")
                const mediaType = isVideo ? "video_url" : "image_url"
                options.onStatusUpdate?.(`Creating Instagram ${isVideo ? 'video' : 'image'} post...`)

                const response = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        [mediaType]: fileUrls[0],
                        caption: content,
                        access_token: (account as any).access_token,
                    }),
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Media container creation failed")
                const result = await response.json()

                options.onStatusUpdate?.("Processing media for Instagram...")
                await SocialService.waitForMediaProcessing(result.id, (account as any).access_token)

                options.onStatusUpdate?.("Publishing to Instagram...")
                const publishResponse = await fetch(`https://graph.facebook.com/v24.0/${account.id}/media_publish`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        creation_id: result.id,
                        access_token: (account as any).access_token,
                    }),
                    signal: controller.signal
                })
                if (!publishResponse.ok) throw new Error("Publish failed")
                return await publishResponse.json()
            }
        } finally {
            clearTimeout(timeoutId)
        }
    }
}
