import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Eye, Target, BarChart3 } from "lucide-react"
import {
    FacebookInsights,
    InstagramInsights,
    PinterestInsights,
    ThreadsInsights,
    TikTokInsights,
    TikTokAccount,
    FacebookPost,
    InstagramPost,
    PinterestPin,
    ThreadsPost,
    TikTokVideo
} from "@/types/social-types"

interface StatsOverviewProps {
    facebookInsights: FacebookInsights | null
    instagramInsights: InstagramInsights | null
    pinterestInsights: PinterestInsights | null
    threadsInsights: ThreadsInsights | null
    tiktokInsights: TikTokInsights | null
    selectedTikTokAccount: TikTokAccount | null
    facebookPosts: FacebookPost[]
    instagramPosts: InstagramPost[]
    pinterestPins: PinterestPin[]
    threadsPosts: ThreadsPost[]
    tiktokVideos: TikTokVideo[]
}

export function StatsOverview({
    facebookInsights,
    instagramInsights,
    pinterestInsights,
    threadsInsights,
    tiktokInsights,
    selectedTikTokAccount,
    facebookPosts,
    instagramPosts,
    pinterestPins,
    threadsPosts,
    tiktokVideos
}: StatsOverviewProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {(facebookInsights?.page_fans || 0) +
                            (instagramInsights?.follower_count || 0) +
                            (pinterestInsights?.follower_count || 0) +
                            (threadsInsights?.follower_count || 0) +
                            (selectedTikTokAccount?.follower_count || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        FB: {facebookInsights?.page_fans || 0} | IG: {instagramInsights?.follower_count || 0} | PIN: {pinterestInsights?.follower_count || 0} | TH: {threadsInsights?.follower_count || 0} | TT: {selectedTikTokAccount?.follower_count || 0}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {(facebookInsights?.page_impressions || 0) +
                            (instagramInsights?.impressions || 0) +
                            (pinterestInsights?.pin_impressions || 0) +
                            (threadsInsights?.impressions || 0) +
                            (tiktokInsights?.views || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        FB: {facebookInsights?.page_impressions || 0} | IG: {instagramInsights?.impressions || 0} | PIN: {pinterestInsights?.pin_impressions || 0} | TH: {threadsInsights?.impressions || 0} | TT: {tiktokInsights?.views || 0}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {(facebookInsights?.page_engaged_users || 0) +
                            (instagramInsights?.reach || 0) +
                            (threadsInsights?.reach || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        FB: {facebookInsights?.page_engaged_users || 0} | IG: {instagramInsights?.reach || 0} | TH: {threadsInsights?.reach || 0}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {facebookPosts.length + instagramPosts.length + pinterestPins.length + threadsPosts.length + tiktokVideos.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        FB: {facebookPosts.length} | IG: {instagramPosts.length} | PIN: {pinterestPins.length} | TH: {threadsPosts.length} | TT: {tiktokVideos.length}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
