import { ThreadsAccount, ThreadsPost, ThreadsInsights } from "@/types/social-types"
import { SocialService } from "./social.service"

export const ThreadsService = {
    fetchAccount: async (token: string): Promise<ThreadsAccount> => {
        const response = await fetch(
            `/api/threads/proxy?endpoint=/me&params=fields=id,username,name,threads_profile_picture_url`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error("Failed to fetch Threads profile")
        const data = await response.json()
        return {
            id: data.id,
            username: data.username,
            name: data.name || data.username,
            profile_picture_url: data.threads_profile_picture_url,
            followers_count: 0
        }
    },

    fetchPosts: async (token: string): Promise<ThreadsPost[]> => {
        const response = await fetch(
            `/api/threads/proxy?endpoint=/me/threads&params=fields=id,text,media_url,timestamp,like_count,reply_count&limit=10`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error("Failed to fetch Threads posts")
        const data = await response.json()
        return data.data || []
    },

    fetchInsights: async (token: string, account: ThreadsAccount): Promise<ThreadsInsights | null> => {
        try {
            const metricTypes = "views,likes,replies,reposts,quotes";
            const response = await fetch(
                `/api/threads/proxy?endpoint=/me/threads_insights&params=metric=${metricTypes}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            if (response.ok) {
                const data = await response.json()
                const insights: ThreadsInsights = {
                    impressions: 0,
                    reach: 0,
                    profile_views: 0,
                    follower_count: account.followers_count || 0,
                    engagement: 0,
                }
                data.data?.forEach((metric: any) => {
                    const value = metric.values?.[0]?.value || 0;
                    switch (metric.name) {
                        case "views": insights.impressions = value; insights.reach = value; break;
                        case "likes":
                        case "replies":
                        case "reposts":
                        case "quotes": insights.engagement += value; break;
                    }
                })
                return insights
            }
        } catch (err) {
            console.error("Threads insights fetch failed:", err)
        }
        return null
    },

    postToAccount: async (
        token: string,
        content: string,
        fileUrls: string[],
        options: {
            fileTypes: string[],
            pollingToken: string,
            onStatusUpdate?: (msg: string) => void
        }
    ) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            let creationId = "";
            const hasMedia = fileUrls.length > 0;

            if (hasMedia) {
                const childContainerIds: string[] = [];
                if (fileUrls.length > 1) {
                    for (let i = 0; i < fileUrls.length; i++) {
                        const isVideo = options.fileTypes[i]?.startsWith("video/");
                        const payload: any = {
                            media_type: isVideo ? "VIDEO" : "IMAGE",
                            is_carousel_item: true,
                            [isVideo ? "video_url" : "image_url"]: fileUrls[i]
                        };

                        const res = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                            body: JSON.stringify(payload),
                            signal: controller.signal,
                        });

                        if (!res.ok) throw new Error("Failed to create Threads carousel item");
                        const data = await res.json();
                        childContainerIds.push(data.id);

                        if (isVideo) {
                            options.onStatusUpdate?.(`Processing video ${i + 1}/${fileUrls.length} for Threads...`);
                            await SocialService.waitForMediaProcessing(data.id, options.pollingToken, 30, true);
                        }
                    }

                    const parentRes = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ media_type: "CAROUSEL", children: childContainerIds.join(","), text: content }),
                        signal: controller.signal,
                    });

                    if (!parentRes.ok) throw new Error("Failed to create Threads carousel container");
                    const parentData = await parentRes.json();
                    creationId = parentData.id;
                } else {
                    const isVideo = options.fileTypes[0]?.startsWith("video/");
                    const mediaPayload: any = {
                        media_type: isVideo ? "VIDEO" : "IMAGE",
                        text: content,
                        [isVideo ? "video_url" : "image_url"]: fileUrls[0]
                    };

                    const containerResponse = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify(mediaPayload),
                        signal: controller.signal,
                    });

                    if (!containerResponse.ok) throw new Error("Failed to upload media to Threads");
                    const containerData = await containerResponse.json();
                    creationId = containerData.id;

                    if (isVideo) {
                        options.onStatusUpdate?.("Processing video for Threads...");
                        await SocialService.waitForMediaProcessing(creationId, options.pollingToken, 30, true);
                    }
                }
            } else {
                const containerResponse = await fetch(`/api/threads/proxy?endpoint=/me/threads`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ media_type: "TEXT", text: content }),
                    signal: controller.signal,
                });
                if (!containerResponse.ok) throw new Error("Failed to create Threads text post");
                const containerData = await containerResponse.json();
                creationId = containerData.id;
            }

            const publishResponse = await fetch(`/api/threads/proxy?endpoint=/me/threads_publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ creation_id: creationId }),
                signal: controller.signal,
            });

            if (!publishResponse.ok) throw new Error("Failed to publish to Threads");
            return await publishResponse.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
