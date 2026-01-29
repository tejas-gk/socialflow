import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram, Share2, MessageCircle, Music } from "lucide-react"
import {
    FacebookInsights,
    InstagramInsights,
    PinterestInsights,
    ThreadsInsights,
    TikTokInsights,
    InstagramAccount,
    PinterestAccount,
    ThreadsAccount,
    TikTokAccount,
    PinterestBoard
} from "@/types/social-types"

interface AnalyticsTabsProps {
    isFacebookTokenSet: boolean
    isInstagramTokenSet: boolean
    isPinterestTokenSet: boolean
    isThreadsTokenSet: boolean
    isTikTokTokenSet: boolean
    facebookInsights: FacebookInsights | null
    instagramInsights: InstagramInsights | null
    pinterestInsights: PinterestInsights | null
    threadsInsights: ThreadsInsights | null
    tiktokInsights: TikTokInsights | null
    selectedInstagramAccount: InstagramAccount | null
    selectedPinterestAccount: PinterestAccount | null
    selectedThreadsAccount: ThreadsAccount | null
    selectedTikTokAccount: TikTokAccount | null
    pinterestBoards: PinterestBoard[]
    analyticsTab: string
    setAnalyticsTab: (value: string) => void
}

export function AnalyticsTabs({
    analyticsTab,
    setAnalyticsTab,
    isFacebookTokenSet,
    isInstagramTokenSet,
    isPinterestTokenSet,
    isThreadsTokenSet,
    isTikTokTokenSet,
    facebookInsights,
    instagramInsights,
    pinterestInsights,
    threadsInsights,
    tiktokInsights,
    selectedInstagramAccount,
    selectedPinterestAccount,
    selectedThreadsAccount,
    selectedTikTokAccount,
    pinterestBoards
}: AnalyticsTabsProps) {

    return (
        <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
            <TabsList className="flex overflow-x-auto">
                <TabsTrigger value="facebook" disabled={!isFacebookTokenSet}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                </TabsTrigger>
                <TabsTrigger value="instagram" disabled={!isInstagramTokenSet}>
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                </TabsTrigger>
                <TabsTrigger value="pinterest" disabled={!isPinterestTokenSet}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Pinterest
                </TabsTrigger>
                <TabsTrigger value="threads" disabled={!isThreadsTokenSet}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Threads
                </TabsTrigger>
                <TabsTrigger value="tiktok" disabled={!isTikTokTokenSet}>
                    <Music className="h-4 w-4 mr-2" />
                    TikTok
                </TabsTrigger>
            </TabsList>

            <TabsContent value="facebook">
                {facebookInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Page Fans</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{facebookInsights.page_fans}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Page Impressions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{facebookInsights.page_impressions}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Engaged Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{facebookInsights.page_engaged_users}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Page Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{facebookInsights.page_views}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="instagram">
                {selectedInstagramAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Username</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedInstagramAccount.username}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Followers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedInstagramAccount.followers_count}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {instagramInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Website Clicks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{instagramInsights.website_clicks}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Impressions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{instagramInsights.impressions}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Reach</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{instagramInsights.reach}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Profile Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{instagramInsights.profile_views}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="pinterest">
                {selectedPinterestAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Username</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedPinterestAccount.username}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Boards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pinterestBoards.length}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {pinterestInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Pin Impressions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pinterestInsights.pin_impressions}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Total Engagements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pinterestInsights.total_engagements}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Pin Clicks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pinterestInsights.pin_clicks}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Outbound Clicks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pinterestInsights.outbound_clicks}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="threads">
                {selectedThreadsAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Username</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedThreadsAccount.username}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Followers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedThreadsAccount.followers_count}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {threadsInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Impressions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{threadsInsights.impressions}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Reach</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{threadsInsights.reach}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Profile Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{threadsInsights.profile_views}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Engagement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{threadsInsights.engagement}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="tiktok">
                {selectedTikTokAccount && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Display Name</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedTikTokAccount.display_name}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Followers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{selectedTikTokAccount.follower_count}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {tiktokInsights && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Likes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tiktokInsights.likes}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Comments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tiktokInsights.comments}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Shares</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tiktokInsights.shares}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Views</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{tiktokInsights.views}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
