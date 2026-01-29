export const SocialService = {
    waitForMediaProcessing: async (
        mediaId: string,
        accessToken: string,
        maxAttempts = 30,
        isThreads = false
    ): Promise<boolean> => {
        const startTime = Date.now()
        const maxWaitTime = 300000 // 5 minutes max

        const queryParams = isThreads ? `fields=status` : `fields=status_code,status`;
        const THREADS_PROXY_ENDPOINT = `/${mediaId}`;
        const THREADS_PROXY_URL = `/api/threads/proxy?endpoint=${THREADS_PROXY_ENDPOINT}&params=${encodeURIComponent(queryParams)}`;
        const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/v24.0/${mediaId}`;
        const apiUrl = isThreads ? THREADS_PROXY_URL : `${FACEBOOK_GRAPH_URL}?${queryParams}&access_token=${accessToken}`;
        const authHeader = `Bearer ${accessToken}`;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                if (Date.now() - startTime > maxWaitTime) {
                    throw new Error("Media processing timeout - please check your posts manually")
                }

                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000)

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
                    await new Promise((resolve) => setTimeout(resolve, 10000))
                    continue
                }

                const result = await response.json()
                const currentStatus = result.status_code || result.status;

                if (currentStatus === "FINISHED") {
                    return true
                } else if (currentStatus === "ERROR") {
                    throw new Error("Media processing failed - " + (result.status_message || "Unknown error"))
                }

                await new Promise((resolve) => setTimeout(resolve, 10000))
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    continue;
                }
                throw error
            }
        }

        throw new Error("Media processing taking longer than expected - please check your posts manually")
    }
}
