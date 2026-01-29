import { PinterestAccount, PinterestBoard, PinterestPin, PinterestInsights } from "@/types/social-types"

export const PinterestService = {
    fetchAccount: async (token: string): Promise<PinterestAccount> => {
        const userResponse = await fetch(`/api/pinterest/proxy?endpoint=/user_account`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!userResponse.ok) throw new Error("Failed to fetch Pinterest user account")
        const userData = await userResponse.json()
        return {
            id: userData.id,
            username: userData.username,
            full_name: userData.full_name,
            profile_picture: userData.profile_image,
        }
    },

    fetchBoards: async (token: string): Promise<PinterestBoard[]> => {
        const response = await fetch(`/api/pinterest/proxy?endpoint=/boards&params=page_size=25`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Failed to fetch Pinterest boards")
        const data = await response.json()
        return data.items || []
    },

    fetchPins: async (token: string): Promise<PinterestPin[]> => {
        const response = await fetch(`/api/pinterest/proxy?endpoint=/pins&params=page_size=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Failed to fetch Pinterest pins")
        const data = await response.json()
        return data.items || []
    },

    fetchInsights: async (token: string, pinCount: number): Promise<PinterestInsights | null> => {
        try {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const queryParams = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                metric_types: "IMPRESSION,ENGAGEMENT,PIN_CLICK,OUTBOUND_CLICK",
                app_types: "ALL"
            });

            const response = await fetch(`/api/pinterest/proxy?endpoint=/user_account/analytics&params=${encodeURIComponent(queryParams.toString())}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                const insights: PinterestInsights = {
                    pin_impressions: 0,
                    total_engagements: 0,
                    pin_clicks: 0,
                    outbound_clicks: 0,
                    follower_count: 0,
                    pin_count: pinCount,
                }
                if (data.summary?.metrics) {
                    insights.pin_impressions = data.summary.metrics.IMPRESSION || 0;
                    insights.total_engagements = data.summary.metrics.ENGAGEMENT || 0;
                    insights.pin_clicks = data.summary.metrics.PIN_CLICK || 0;
                    insights.outbound_clicks = data.summary.metrics.OUTBOUND_CLICK || 0;
                }
                return insights
            }
        } catch (err) {
            console.error("Pinterest insights fetch failed:", err)
        }
        return null
    },

    postToBoard: async (
        token: string,
        boardId: string,
        fileUrls: string[],
        options: {
            title?: string,
            description?: string,
            link?: string,
            onStatusUpdate?: (msg: string) => void
        }
    ) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        try {
            options.onStatusUpdate?.("Creating Pinterest pin...")
            const pinData = {
                title: options.title || "My Pin",
                description: options.description,
                board_id: boardId,
                media_source: {
                    source_type: "image_url",
                    url: fileUrls[0]
                },
                link: options.link || undefined
            }

            const response = await fetch(`/api/pinterest/proxy?endpoint=/pins`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pinData),
                signal: controller.signal
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to create Pinterest pin")
            }
            return await response.json()
        } finally {
            clearTimeout(timeoutId)
        }
    },

    createBoard: async (token: string, name: string): Promise<PinterestBoard> => {
        const response = await fetch(`/api/pinterest/proxy?endpoint=/boards`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description: "Created via SocialFlow Dashboard"
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Failed to create board");
        }
        return await response.json();
    }
}
