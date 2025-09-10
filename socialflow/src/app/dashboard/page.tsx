"use client"

import { useEffect, useState } from "react"
import { useUser, SignOutButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Plus, Settings, TrendingUp, Facebook, Instagram, Wifi, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"// Import the Next.js Image component
import useSWR from "swr"
import {
  apiClient,
  type AuthStatus,
  type FacebookPage,
  type InstagramAccount,
  type InstagramMedia,
  type FacebookPost,
} from "../../lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ facebook: false, instagram: false })
  const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<InstagramAccount | null>(null)
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
  const [showFacebookPageModal, setShowFacebookPageModal] = useState(false)
  const [showInstagramAccountModal, setShowInstagramAccountModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("facebook")
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  useEffect(() => {
    if (user?.id && typeof window !== "undefined") {
      window.__clerk_user_id = user.id
    }
  }, [user?.id])

  // Fetch Facebook posts
  const { data: fbPosts, isLoading: fbPostsLoading } = useSWR(
    authStatus.facebook && selectedFacebookPage ? ["fb-posts", selectedFacebookPage.id] : null,
    () => apiClient.getFacebookPagePosts({ pageId: selectedFacebookPage!.id, limit: 3 }),
  )

  // Fetch Instagram posts
  const { data: igPosts, isLoading: igPostsLoading } = useSWR(
    authStatus.instagram && selectedInstagramAccount ? ["ig-media", selectedInstagramAccount.id] : null,
    () => apiClient.getInstagramAccountMedia({ accountId: selectedInstagramAccount!.id, limit: 3 }),
  )

  const fetchAuthStatus = async () => {
    try {
      const status = await apiClient.getAuthStatus()
      setAuthStatus(status)
    } catch (error) {
      console.error("Failed to fetch auth status:", error)
    }
  }

  const handleSelectFacebookPage = async (pageId: string) => {
    try {
      if (!user) {
        console.error("User is not available for page selection.")
        return
      }
      const result = await apiClient.selectFacebookPage(pageId, user.id)
      if (result.success) {
        setSelectedFacebookPage(result.page)
        setShowFacebookPageModal(false)
        await fetchAuthStatus()
      }
    } catch (e) {
      console.error("Failed to select Facebook page:", e)
    }
  }

  const handleSelectInstagramAccount = async (accountId: string) => {
    try {
      const result = await apiClient.selectInstagramAccount(accountId)
      if (result.success) {
        setSelectedInstagramAccount(result.account)
        setShowInstagramAccountModal(false)
        await fetchAuthStatus()
      }
    } catch (e) {
      console.error("Failed to select Instagram account:", e)
    }
  }

  const handleDisconnect = async (platform: 'facebook' | 'instagram') => {
    try {
      const result = await apiClient.disconnectPlatform(platform);
      if (result.success) {
        await fetchAuthStatus(); // Refresh the UI to show the disconnected state
      } else {
        console.error(`Failed to disconnect ${platform}`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await fetchAuthStatus()
      setIsLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        if (authStatus.facebook) {
          const [selectedPage, pages] = await Promise.all([
            apiClient.getSelectedFacebookPage(),
            apiClient.getFacebookPages(),
          ])
          setSelectedFacebookPage(selectedPage)
          setFacebookPages(pages)
        } else {
          setSelectedFacebookPage(null)
          setFacebookPages([])
        }

        if (authStatus.instagram) {
          const [selectedAccount, accounts] = await Promise.all([
            apiClient.getSelectedInstagramAccount(),
            apiClient.getInstagramAccounts(),
          ])
          setSelectedInstagramAccount(selectedAccount)
          setInstagramAccounts(accounts)
        } else {
          setSelectedInstagramAccount(null)
          setInstagramAccounts([])
        }
      } catch (e) {
        console.error("Failed loading account data:", e)
      }
    }
    loadAccountData()
  }, [authStatus.facebook, authStatus.instagram])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const getUserDisplayName = () => {
    if (user?.firstName) return user.firstName
    if (user?.fullName) return user.fullName
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split("@")[0]
    }
    return "User"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-black font-serif text-primary">SocialFlow</h1>
              <Badge variant="secondary" className="hidden md:inline-flex">
                Pro
              </Badge>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                size="sm"
                className={`${authStatus.facebook ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"} text-white`}
                onClick={() =>
                  authStatus.facebook
                    ? setShowFacebookPageModal(true)
                    : window.open(apiClient.getFacebookAuthUrl(), "_blank")
                }
                title={authStatus.facebook ? "Facebook Connected - Manage" : "Connect Facebook"}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                size="sm"
                className={`${authStatus.instagram ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"} text-white`}
                onClick={() =>
                  authStatus.instagram
                    ? setShowInstagramAccountModal(true)
                    : window.open(apiClient.getInstagramAuthUrl(), "_blank")
                }
                title={authStatus.instagram ? "Instagram Connected - Manage" : "Connect Instagram"}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif">Welcome back, {user?.username || getUserDisplayName()}!</h2>
            <p className="text-muted-foreground">Manage your Instagram and Facebook presence from one place.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/campaign" passHref>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Start Campaign</CardTitle>
                  <Plus className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">Create</div>
                  <p className="text-xs text-muted-foreground">New social media post</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/history" passHref>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">View History</CardTitle>
                  <History className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">View Posts</div>
                  <p className="text-xs text-muted-foreground">See all your posts</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/test-connection" passHref>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Test Connection</CardTitle>
                  <Wifi className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {authStatus.facebook && authStatus.instagram ? "Active" : "Partial"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {authStatus.facebook && authStatus.instagram
                      ? "All platforms connected"
                      : "Some platforms need connection"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics" passHref>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">View Stats</div>
                  <p className="text-xs text-muted-foreground">Check post performance</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Recent Activity</CardTitle>
              <CardDescription>Your latest social media posts and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-b border-border">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("facebook")}
                    className={`${
                      activeTab === "facebook"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => setActiveTab("instagram")}
                    className={`${
                      activeTab === "instagram"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Instagram
                  </button>
                </nav>
              </div>

              <div className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Loading recent activity...</div>
                  </div>
                ) : (
                  <div>
                    {activeTab === "facebook" &&
                      (authStatus.facebook ? (
                        fbPostsLoading ? (
                          <div className="text-center py-8 text-muted-foreground">Loading recent posts...</div>
                        ) : (
                          <div className="space-y-4">
                            {(fbPosts?.data ?? []).map((post: FacebookPost) => (
                              <div
                                key={post.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  {post.full_picture && (
                                    <Image
                                      src={post.full_picture}
                                      alt="Post thumbnail"
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{post.message || "No caption"}</p>
                                    <p className="text-sm text-muted-foreground">Facebook</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="default">Posted</Badge>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(post.created_time).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {fbPosts?.data?.length === 0 && (
                              <p className="text-center py-8 text-muted-foreground">No recent posts found.</p>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Connect your Facebook account to see recent posts.
                        </div>
                      ))}
                    {activeTab === "instagram" &&
                      (authStatus.instagram ? (
                        igPostsLoading ? (
                          <div className="text-center py-8 text-muted-foreground">Loading recent posts...</div>
                        ) : (
                          <div className="space-y-4">
                            {(igPosts?.data ?? []).map((post: InstagramMedia) => (
                              <div
                                key={post.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg"
                              >
                                <div className="flex items-center space-x-4">
                                  {(post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM") &&
                                    post.media_url && (
                                      <Image
                                        src={post.media_url}
                                        alt="Post thumbnail"
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded-full object-cover"
                                      />
                                    )}
                                  {post.media_type === "VIDEO" && post.thumbnail_url && (
                                    <Image
                                      src={post.thumbnail_url}
                                      alt="Post thumbnail"
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{post.caption || "No caption"}</p>
                                    <p className="text-sm text-muted-foreground">Instagram</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="default">Posted</Badge>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(post.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {igPosts?.data?.length === 0 && (
                              <p className="text-center py-8 text-muted-foreground">No recent posts found.</p>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Connect your Instagram account to see recent posts.
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={showFacebookPageModal} onOpenChange={setShowFacebookPageModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Facebook Page</DialogTitle>
                <DialogDescription>Choose which Facebook page to use for posting</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {facebookPages.map((page) => (
                  <Button
                    key={page.id}
                    variant={selectedFacebookPage?.id === page.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleSelectFacebookPage(page.id)}
                  >
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    {page.name}
                    {selectedFacebookPage?.id === page.id && <span className="h-4 w-4 ml-auto text-green-600">✓</span>}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showInstagramAccountModal} onOpenChange={setShowInstagramAccountModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Instagram Account</DialogTitle>
                <DialogDescription>Choose which Instagram account to use for posting</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {instagramAccounts.map((account) => (
                  <Button
                    key={account.id}
                    variant={selectedInstagramAccount?.id === account.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleSelectInstagramAccount(account.id)}
                  >
                    <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                    {account.username ? `@${account.username}` : account.name}
                    {selectedInstagramAccount?.id === account.id && (
                      <span className="h-4 w-4 ml-auto text-green-600">✓</span>
                    )}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Connections</DialogTitle>
                <DialogDescription>
                  Disconnect your social media accounts here. You can reconnect them at any time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Facebook</p>
                      <p className="text-sm text-muted-foreground">
                        {authStatus.facebook ? `Connected as ${selectedFacebookPage?.name || 'Page'}` : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  {authStatus.facebook ? (
                    <Button variant="destructive" size="sm" onClick={() => handleDisconnect('facebook')}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => {
                      window.open(apiClient.getFacebookAuthUrl(), "_blank");
                      setIsSettingsModalOpen(false);
                    }}>
                      Connect
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-sm text-muted-foreground">
                         {authStatus.instagram ? `Connected as @${selectedInstagramAccount?.username || 'Account'}` : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  {authStatus.instagram ? (
                    <Button variant="destructive" size="sm" onClick={() => handleDisconnect('instagram')}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => {
                      window.open(apiClient.getInstagramAuthUrl(), "_blank");
                      setIsSettingsModalOpen(false);
                    }}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}