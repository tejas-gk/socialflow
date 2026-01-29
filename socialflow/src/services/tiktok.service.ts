import { TikTokAccount, TikTokVideo, TikTokInsights } from "@/types/social-types"

export const TikTokService = {
    fetchAccounts: async (token: string): Promise<TikTokAccount[]> => {
        const response = await fetch(
            `/api/tiktok/proxy?endpoint=/user/info/&params=fields=open_id,union_id,avatar_url,display_name,follower_count`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error("Failed to fetch TikTok profile")
        const data = await response.json()
        const userData = data.data?.user || {}
        return [{
            open_id: userData.open_id,
            union_id: userData.union_id,
            display_name: userData.display_name,
            avatar_url: userData.avatar_url,
            follower_count: userData.follower_count || 0
        }]
    },

    fetchVideos: async (token: string): Promise<TikTokVideo[]> => {
        const queryParams = new URLSearchParams({
            endpoint: '/video/list/',
            params: 'fields=id,title,cover_image_url,video_description,create_time,like_count,comment_count,share_count,view_count,embed_html,embed_link,share_url&max_count=10'
        })
        const response = await fetch(`/api/tiktok/proxy?${queryParams.toString()}`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({})
        })
        if (!response.ok) throw new Error("Failed to fetch TikTok videos")
        const data = await response.json()
        return data.data?.videos || []
    },

    fetchInsights: async (account: TikTokAccount): Promise<TikTokInsights> => {
        return {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            followers: account.follower_count || 0
        }
    },

    postToAccount: async (
        token: string,
        content: string,
        fileUrls: string[],
        options: {
            files: File[],
            onStatusUpdate?: (msg: string) => void
        }
    ) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000)

        try {
            const creatorInfoResponse = await fetch(`/api/tiktok/proxy?endpoint=/post/publish/creator_info/query/`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                signal: controller.signal
            })
            if (!creatorInfoResponse.ok) throw new Error("Failed to fetch creator info")
            const creatorData = await creatorInfoResponse.json()
            const availablePrivacyOptions = creatorData.data?.privacy_level_options || [];
            const privacyLevel = availablePrivacyOptions.includes("SELF_ONLY") ? "SELF_ONLY" : (availablePrivacyOptions[0] || "SELF_ONLY");

            const file = options.files[0]
            const isPhoto = file.type.startsWith("image/")

            if (isPhoto) {
                options.onStatusUpdate?.("Uploading photo to TikTok...")
                const imgResponse = await fetch(fileUrls[0]);
                if (!imgResponse.ok) throw new Error("Failed to fetch image file");
                const imgBlob = await imgResponse.blob();

                const response = await fetch(`/api/tiktok/proxy?endpoint=/post/publish/content/init/`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        media_type: "PHOTO",
                        post_mode: "DIRECT_POST",
                        post_info: { title: content.substring(0, 90), privacy_level: "SELF_ONLY", disable_comment: false, auto_add_music: false },
                        source_info: { source: "FILE_UPLOAD" }
                    }),
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Photo init failed")
                const data = await response.json();
                const uploadRes = await fetch(data.data.upload_url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: imgBlob });
                if (!uploadRes.ok) throw new Error("Image upload failed")
                return data

            } else {
                options.onStatusUpdate?.("Uploading video to TikTok...")
                const videoSize = file.size
                let chunkSize = videoSize;
                let totalChunkCount = 1;
                if (videoSize > 5 * 1024 * 1024) {
                    chunkSize = 10 * 1024 * 1024;
                    if (chunkSize > videoSize) chunkSize = videoSize;
                    totalChunkCount = Math.ceil(videoSize / chunkSize);
                }

                const response = await fetch(`/api/tiktok/proxy?endpoint=/post/publish/video/init/`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        post_info: { title: content.substring(0, 150), privacy_level: "SELF_ONLY", disable_duet: true, disable_comment: true, disable_stitch: true, video_cover_timestamp_ms: 1000, brand_content_toggle: false, brand_organic_toggle: false },
                        source_info: { source: "FILE_UPLOAD", video_size: videoSize, chunk_size: chunkSize, total_chunk_count: totalChunkCount }
                    }),
                    signal: controller.signal
                })
                if (!response.ok) throw new Error("Video init failed")
                const data = await response.json()
                const uploadUrl = data.data.upload_url

                for (let i = 0; i < totalChunkCount; i++) {
                    const start = i * chunkSize
                    const end = Math.min(start + chunkSize, videoSize)
                    const chunkBlob = file.slice(start, end)
                    const uploadRes = await fetch(uploadUrl, {
                        method: "PUT",
                        headers: { "Content-Type": file.type || "video/mp4", "Content-Range": `bytes ${start}-${end - 1}/${videoSize}` },
                        body: chunkBlob
                    })
                    if (!uploadRes.ok) throw new Error("Video chunk upload failed")
                }
                return data
            }
        } finally {
            clearTimeout(timeoutId)
        }
    }
}
