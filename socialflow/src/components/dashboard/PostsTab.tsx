import { Card, CardContent } from "@/components/ui/card"
import { Facebook, Instagram, Share2, MessageCircle, Music, Play, ExternalLink } from "lucide-react"
import { Video } from "@/components/ui/video"
import {
    FacebookPost,
    InstagramPost,
    PinterestPin,
    ThreadsPost,
    TikTokVideo
} from "@/types/social-types"

interface PostsTabProps {
    isFacebookTokenSet: boolean
    isInstagramTokenSet: boolean
    isPinterestTokenSet: boolean
    isThreadsTokenSet: boolean
    isTikTokTokenSet: boolean
    facebookPosts: FacebookPost[]
    instagramPosts: InstagramPost[]
    pinterestPins: PinterestPin[]
    threadsPosts: ThreadsPost[]
    tiktokVideos: TikTokVideo[]
}

export function PostsTab({
    isFacebookTokenSet,
    isInstagramTokenSet,
    isPinterestTokenSet,
    isThreadsTokenSet,
    isTikTokTokenSet,
    facebookPosts,
    instagramPosts,
    pinterestPins,
    threadsPosts,
    tiktokVideos
}: PostsTabProps) {
    return (
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

            {/* Pinterest Pins */}
            {isPinterestTokenSet && pinterestPins.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-red-600" />
                        Pinterest Pins
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pinterestPins.map((pin) => {
                            // Helper to safely extract the image URL from the nested media object
                            // Pinterest provides multiple sizes; we try 600x315 or 1200x first, then fallback to any available
                            const imageUrl =
                                pin.media?.images?.['600x315']?.url ||
                                pin.media?.images?.['1200x']?.url ||
                                (pin.media?.images ? Object.values(pin.media.images)[0]?.url : null);

                            return (
                                <Card key={pin.id}>
                                    <CardContent className="p-4">
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt="Pin"
                                                className="w-full h-48 object-cover rounded-lg mb-3"
                                            />
                                        )}
                                        <h4 className="font-medium mb-1">{pin.title || "No title"}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{pin.description || "No description"}</p>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>❤️ {pin.like_count || 0}</span>
                                            <span>💬 {pin.comment_count || 0}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(pin.created_at).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Threads Posts */}
            {isThreadsTokenSet && threadsPosts.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-black" />
                        Threads Posts
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {threadsPosts.map((post) => {
                            // Create safer check
                            const lowerCaseUrl = post.media_url?.toLowerCase() || '';
                            const isVideo =
                                lowerCaseUrl.includes('.mp4') ||
                                lowerCaseUrl.includes('.mov') ||
                                lowerCaseUrl.includes('.avi') ||
                                lowerCaseUrl.includes('video'); // General check for 'video' in URL

                            return (
                                <Card key={post.id}>
                                    <CardContent className="p-4">
                                        {post.media_url && (
                                            isVideo ? (
                                                <Video
                                                    src={post.media_url}
                                                    controls
                                                    // Add width/height for better video rendering on initial load
                                                    width="100%"
                                                    height="100%"
                                                    className="w-full h-48 object-contain rounded-lg mb-3"
                                                    aria-label="Threads video post"
                                                />
                                            ) : (
                                                <img
                                                    src={post.media_url}
                                                    alt="Post"
                                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                                />
                                            )
                                        )}
                                        <p className="text-sm text-gray-600 mb-2">{post.text || "No text"}</p>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>❤️ {post.like_count || 0}</span>
                                            <span>💬 {post.reply_count || 0}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(post.timestamp).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* TikTok Videos */}
            {isTikTokTokenSet && tiktokVideos.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Music className="h-5 w-5 text-black" />
                        TikTok Videos
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tiktokVideos.map((video) => (
                            <Card key={video.id}>
                                <CardContent className="p-4">
                                    <div className="relative w-full h-[325px] mb-3 bg-black rounded-lg overflow-hidden group">
                                        <a href={video.share_url || video.embed_link || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                            <img
                                                src={video.cover_image_url}
                                                alt={video.title}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black/50 p-3 rounded-full group-hover:bg-black/70 transition-colors">
                                                    <Play className="h-8 w-8 text-white" fill="white" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" />
                                                Watch on TikTok
                                            </div>
                                        </a>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.title || "No description"}</p>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>❤️ {video.like_count || 0}</span>
                                        <span>💬 {video.comment_count || 0}</span>
                                        <span>👁️ {video.view_count || 0}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(video.create_time * 1000).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* No posts message */}
            {(!isFacebookTokenSet || facebookPosts.length === 0) &&
                (!isInstagramTokenSet || instagramPosts.length === 0) &&
                (!isPinterestTokenSet || pinterestPins.length === 0) &&
                (!isThreadsTokenSet || threadsPosts.length === 0) &&
                (!isTikTokTokenSet || tiktokVideos.length === 0) && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No posts available. Connect your accounts to see posts.</p>
                    </div>
                )}
        </div>
    )
}
