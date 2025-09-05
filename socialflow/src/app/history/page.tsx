"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { apiClient, type FbPage } from '@/lib/api'

// Define the post type based on your Facebook API response
interface FacebookPost {
  id: string;
  full_picture?: string;
  message?: string;
  created_time: string;
}

// Mock data for the existing history table (keeping your dummy data)
const mockHistory = [
  {
    id: 1,
    content: "Check out our latest product launch! 🚀",
    platforms: ["Facebook", "Instagram", "Twitter"],
    createdAt: new Date("2024-01-15"),
    status: "Published",
    engagement: { likes: 45, shares: 12, comments: 8 }
  },
  {
    id: 2,
    content: "Behind the scenes of our team meeting",
    platforms: ["Instagram"],
    createdAt: new Date("2024-01-14"),
    status: "Published", 
    engagement: { likes: 23, shares: 5, comments: 3 }
  },
  {
    id: 3,
    content: "Weekend motivation quote ✨",
    platforms: ["Facebook", "Twitter"],
    createdAt: new Date("2024-01-13"),
    status: "Scheduled",
    engagement: { likes: 0, shares: 0, comments: 0 }
  }
];

function formatDate(date: Date) {
  return date.toLocaleDateString()
}

function formatEngagement(engagement: any) {
  return `${engagement.likes}👍 ${engagement.shares}🔄 ${engagement.comments}💬`
}

export default function HistoryPage() {
  // Facebook posts state and data fetching
  const { data: pagesResp } = useSWR("fb-pages", () => apiClient.getFacebookPagesAnalytics())
  const pages: FbPage[] = pagesResp?.data ?? []
  const [pageId, setPageId] = useState("")

  // Set default page when pages load
  useState(() => {
    if (!pageId && pages?.length) setPageId(pages[0].id)
  }, [pages, pageId])

  const { data: posts, isLoading: postsLoading } = useSWR(
    pageId ? ['fb-posts', pageId] : null,
    () => apiClient.getFacebookPagePosts({ pageId, limit: 10 })
  )

  const [openPost, setOpenPost] = useState<string | null>(null)
  const { data: postDetails } = useSWR(
    openPost ? ['fb-post', openPost] : null,
    () => apiClient.getFacebookPostDetails(openPost!)
  )

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Post History</h1>
      
      {/* Existing History Table Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Scheduled & Published Posts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Engagement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockHistory.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {post.platforms.map((platform, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {platform === "Instagram" && "📷"} {platform}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      post.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatEngagement(post.engagement)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {post.status === "Scheduled" && (
                      <button className="text-red-600 hover:text-red-900 mr-3">Cancel</button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facebook Recent Posts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Facebook Recent Posts</h2>
          {pages.length > 0 && (
            <select 
              value={pageId} 
              onChange={(e) => setPageId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Facebook page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {!pageId ? (
          <div className="text-center py-8 text-gray-500">
            Select a Facebook page to view recent posts
          </div>
        ) : postsLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading posts...
          </div>
        ) : (
          <div className="space-y-4">
            {(posts?.data ?? []).map((p: FacebookPost) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4 hover:bg-gray-50 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.full_picture ? (
                  <img 
                    src={p.full_picture} 
                    alt="Post image" 
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg flex-shrink-0">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-2 line-clamp-3">
                    {p.message || "No message content"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.created_time).toLocaleString()}
                  </p>
                </div>
                
                <button 
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex-shrink-0" 
                  onClick={() => setOpenPost(p.id)}
                >
                  View Details
                </button>
              </div>
            ))}
            
            {posts?.data?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No posts found for this page
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Facebook post details */}
      {openPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Post Details</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setOpenPost(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {!postDetails ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading post details...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {postDetails?.post_details?.full_picture && (
                    <img 
                      src={postDetails.post_details.full_picture} 
                      alt="Post detail image" 
                      className="w-full rounded-lg shadow-sm"
                    />
                  )}
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {postDetails?.post_details?.message || "No message content"}
                    </p>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button 
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      onClick={() => setOpenPost(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
