"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Facebook,
    Instagram,
    Settings,
    Eye,
    Users,
    BarChart3,
    Target,
    Plus,
    Calendar,
    Send,
    X,
    ChevronDown,
    Check,
    Smile,
    Hash,
    AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EmojiPicker from "emoji-picker-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { popularHashtags } from "@/config/hashtag"
import Navbar from "@/components/navbar"


export default function Analytics({ facebookInsights,
    instagramInsights,
    facebookPosts,
    instagramPosts,
    selectedInstagramAccount,
    isFacebookTokenSet,
    isInstagramTokenSet,
    activeTab, setActiveTab,
    analyticsTab,
    setAnalyticsTab,
    demographics, }: {
        facebookInsights: any,
        instagramInsights: any,
        facebookPosts: any[],
        instagramPosts: any[],
        selectedInstagramAccount: any,
        isFacebookTokenSet: boolean,
        isInstagramTokenSet: boolean,
        demographics: any,
        activeTab: string,
        setActiveTab: (tab: string) => void,
        analyticsTab: string,
        setAnalyticsTab: (tab: string) => void,
    }) {
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {(facebookInsights?.page_fans || 0) + (instagramInsights?.follower_count || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                FB: {facebookInsights?.page_fans || 0} | IG: {instagramInsights?.follower_count || 0}
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
                                {(facebookInsights?.page_impressions || 0) + (instagramInsights?.impressions || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                FB: {facebookInsights?.page_impressions || 0} | IG: {instagramInsights?.impressions || 0}
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
                                {(facebookInsights?.page_engaged_users || 0) + (instagramInsights?.reach || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                FB: {facebookInsights?.page_engaged_users || 0} | IG: {instagramInsights?.reach || 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{facebookPosts.length + instagramPosts.length}</div>
                            <p className="text-xs text-muted-foreground">
                                FB: {facebookPosts.length} | IG: {instagramPosts.length}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
                <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
                    <TabsList>
                        <TabsTrigger value="facebook" disabled={!isFacebookTokenSet}>
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                        </TabsTrigger>
                        <TabsTrigger value="instagram" disabled={!isInstagramTokenSet}>
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram
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
                </Tabs>
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
                <div className="grid gap-6">
                    {/* Facebook Posts */}
                    {isFacebookTokenSet && facebookPosts.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Facebook className="h-5 w-5 text-blue-600" />
                                Facebook Posts
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {facebookPosts.map((post) => (
                                    <Card key={post.id}>
                                        <CardContent className="p-4">
                                            {post.full_picture && (
                                                <img
                                                    src={post.full_picture || "/placeholder.svg"}
                                                    alt="Post"
                                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                                />
                                            )}
                                            <p className="text-sm text-gray-600 mb-2">{post.message || post.story || "No caption"}</p>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>👍 {post.likes?.summary?.total_count || 0}</span>
                                                <span>💬 {post.comments?.summary?.total_count || 0}</span>
                                                <span>🔄 {post.shares?.count || 0}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(post.created_time).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instagram Posts */}
                    {isInstagramTokenSet && instagramPosts.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Instagram className="h-5 w-5 text-pink-600" />
                                Instagram Posts
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {instagramPosts.map((post) => (
                                    <Card key={post.id}>
                                        <CardContent className="p-4">
                                            {(post.media_url || post.thumbnail_url) && (
                                                <img
                                                    src={post.media_url || post.thumbnail_url}
                                                    alt="Post"
                                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                                />
                                            )}
                                            <p className="text-sm text-gray-600 mb-2">{post.caption || "No caption"}</p>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>❤️ {post.like_count || 0}</span>
                                                <span>💬 {post.comments_count || 0}</span>
                                                <span className="capitalize">{post.media_type}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(post.timestamp).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No posts message */}
                    {(!isFacebookTokenSet || facebookPosts.length === 0) &&
                        (!isInstagramTokenSet || instagramPosts.length === 0) && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No posts available. Connect your accounts to see posts.</p>
                            </div>
                        )}
                </div>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
                {demographics && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Age & Gender Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Age & Gender Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {demographics.age_gender.map((item: any) => (
                                        <div key={item.age} className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{item.age}</span>
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-blue-600">M: {item.male}</span>
                                                <span className="text-pink-600">F: {item.female}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Countries */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Countries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {/* @ts-ignore */}
                                    {demographics.countries.map((item) => (
                                        <div key={item.country} className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{item.country}</span>
                                            <span className="text-sm text-gray-600">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Cities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Cities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {/* @ts-ignore */}
                                    {demographics.cities.map((item) => (
                                        <div key={item.city} className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{item.city}</span>
                                            <span className="text-sm text-gray-600">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {!demographics && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No demographic data available. Connect Facebook to see demographics.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
