"use client"

import { useState, useEffect, useRef } from "react"
import { useEdgeStore } from "@/lib/edgestore"
import {
    FacebookPage, FacebookPost, FacebookInsights,
    InstagramAccount, InstagramPost, InstagramInsights,
    PinterestAccount, PinterestBoard, PinterestPin, PinterestInsights,
    ThreadsAccount, ThreadsPost, ThreadsInsights,
    TikTokAccount, TikTokVideo, TikTokInsights,
    Demographics, PostAnalytics
} from "@/types/social-types"
import { FacebookService } from "@/services/facebook.service"
import { InstagramService } from "@/services/instagram.service"
import { PinterestService } from "@/services/pinterest.service"
import { ThreadsService } from "@/services/threads.service"
import { TikTokService } from "@/services/tiktok.service"

export const useSocialDashboard = () => {
    const { edgestore } = useEdgeStore()

    // --- State Variables ---
    const [facebookAccessToken, setFacebookAccessToken] = useState("")
    const [instagramAccessToken, setInstagramAccessToken] = useState("")
    const [pinterestAccessToken, setPinterestAccessToken] = useState("")
    const [threadsAccessToken, setThreadsAccessToken] = useState("")
    const [tiktokAccessToken, setTikTokAccessToken] = useState("")

    const [isFacebookTokenSet, setIsFacebookTokenSet] = useState(false)
    const [isInstagramTokenSet, setIsInstagramTokenSet] = useState(false)
    const [isPinterestTokenSet, setIsPinterestTokenSet] = useState(false)
    const [isThreadsTokenSet, setIsThreadsTokenSet] = useState(false)
    const [isTikTokTokenSet, setIsTikTokTokenSet] = useState(false)

    const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
    const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccount[]>([])
    const [pinterestAccounts, setPinterestAccounts] = useState<PinterestAccount[]>([])
    const [pinterestBoards, setPinterestBoards] = useState<PinterestBoard[]>([])
    const [threadsAccounts, setThreadsAccounts] = useState<ThreadsAccount[]>([])
    const [tiktokAccounts, setTikTokAccounts] = useState<TikTokAccount[]>([])

    const [selectedFacebookPage, setSelectedFacebookPage] = useState<FacebookPage | null>(null)
    const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<InstagramAccount | null>(null)
    const [selectedPinterestAccount, setSelectedPinterestAccount] = useState<PinterestAccount | null>(null)
    const [selectedPinterestBoard, setSelectedPinterestBoard] = useState<PinterestBoard | null>(null)
    const [selectedThreadsAccount, setSelectedThreadsAccount] = useState<ThreadsAccount | null>(null)
    const [selectedTikTokAccount, setSelectedTikTokAccount] = useState<TikTokAccount | null>(null)

    const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([])
    const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([])
    const [pinterestPins, setPinterestPins] = useState<PinterestPin[]>([])
    const [threadsPosts, setThreadsPosts] = useState<ThreadsPost[]>([])
    const [tiktokVideos, setTikTokVideos] = useState<TikTokVideo[]>([])

    const [facebookInsights, setFacebookInsights] = useState<FacebookInsights | null>(null)
    const [instagramInsights, setInstagramInsights] = useState<InstagramInsights | null>(null)
    const [pinterestInsights, setPinterestInsights] = useState<PinterestInsights | null>(null)
    const [threadsInsights, setThreadsInsights] = useState<ThreadsInsights | null>(null)
    const [tiktokInsights, setTikTokInsights] = useState<TikTokInsights | null>(null)

    const [demographics, setDemographics] = useState<Demographics | null>(null)
    const [postAnalytics, setPostAnalytics] = useState<PostAnalytics[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showTokenModal, setShowTokenModal] = useState(true)
    const [showPageModal, setShowPageModal] = useState(false)
    const [showPostModal, setShowPostModal] = useState(false)
    const [postContent, setPostContent] = useState("")
    const [isPosting, setIsPosting] = useState(false)
    const [scheduledDate, setScheduledDate] = useState("")
    const [scheduledTime, setScheduledTime] = useState("")
    const [isScheduled, setIsScheduled] = useState(false)
    const [activeTab, setActiveTab] = useState("overview")
    const [analyticsTab, setAnalyticsTab] = useState("facebook")

    const [postToFacebook, setPostToFacebook] = useState(false)
    const [postToInstagram, setPostToInstagram] = useState(false)
    const [postToPinterest, setPostToPinterest] = useState(false)
    const [postToThreads, setPostToThreads] = useState(false)
    const [postToTikTok, setPostToTikTok] = useState(false)

    const [postType, setPostType] = useState<"post" | "reel" | "carousel" | "pin">("post")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [filePreviews, setFilePreviews] = useState<string[]>([])
    const [fileTypes, setFileTypes] = useState<string[]>([])

    const [showPageSwitcher, setShowPageSwitcher] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showHashtagPicker, setShowHashtagPicker] = useState(false)
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

    const [mentionSuggestions, setMentionSuggestions] = useState<Array<{ id: string; name: string }>>([])
    const [showMentionDropdown, setShowMentionDropdown] = useState(false)
    const [mentionSearchQuery, setMentionSearchQuery] = useState("")
    const [isSearchingMentions, setIsSearchingMentions] = useState(false)
    const [mentionCursorPosition, setMentionCursorPosition] = useState(0)
    const [taggedPeopleMap, setTaggedPeopleMap] = useState<Map<string, string>>(new Map())

    const [pinTitle, setPinTitle] = useState("")
    const [pinDescription, setPinDescription] = useState("")
    const [pinLink, setPinLink] = useState("")
    const [newBoardName, setNewBoardName] = useState("")
    const [isCreatingBoard, setIsCreatingBoard] = useState(false)

    const [postingStatus, setPostingStatus] = useState<{
        isPosting: boolean
        message: string
        progress: number
        currentStep: string
        estimatedTime?: string
    }>({
        isPosting: false,
        message: "",
        progress: 0,
        currentStep: ""
    })

    const [uploadProgress, setUploadProgress] = useState<{
        isUploading: boolean
        progress: number
        currentFile: string
        totalFiles: number
        currentFileIndex: number
    }>({
        isUploading: false,
        progress: 0,
        currentFile: "",
        totalFiles: 0,
        currentFileIndex: 0
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // --- Initialization ---
    useEffect(() => {
        const init = async () => {
            const savedFacebookToken = localStorage.getItem("facebook_access_token")
            const savedInstagramToken = localStorage.getItem("instagram_access_token")
            const savedPinterestToken = localStorage.getItem("pinterest_access_token")
            const savedThreadsToken = localStorage.getItem("threads_access_token")
            const savedTikTokToken = localStorage.getItem("tiktok_access_token")

            const savedFacebookPage = localStorage.getItem("selected_facebook_page")
            const savedInstagramAccount = localStorage.getItem("selected_instagram_account")
            const savedPinterestAccount = localStorage.getItem("selected_pinterest_account")
            const savedPinterestBoard = localStorage.getItem("selected_pinterest_board")
            const savedThreadsAccount = localStorage.getItem("selected_threads_account")
            const savedTikTokAccount = localStorage.getItem("selected_tiktok_account")

            if (savedFacebookToken) {
                setFacebookAccessToken(savedFacebookToken)
                setIsFacebookTokenSet(true)
                FacebookService.fetchPages(savedFacebookToken).then(pages => {
                    setFacebookPages(pages)
                    if (pages.length > 0 && !savedFacebookPage) setShowPageModal(true)
                })
                setSelectedPlatforms((prev) => Array.from(new Set([...prev, "facebook"])))
            }

            if (savedInstagramToken) {
                setInstagramAccessToken(savedInstagramToken)
                setIsInstagramTokenSet(true)
                InstagramService.fetchAccounts(savedInstagramToken).then(accounts => {
                    setInstagramAccounts(accounts)
                    if (accounts.length > 0 && !savedInstagramAccount) setShowPageModal(true)
                })
                setSelectedPlatforms((prev) => Array.from(new Set([...prev, "instagram"])))
            }

            if (savedPinterestToken) {
                setPinterestAccessToken(savedPinterestToken)
                setIsPinterestTokenSet(true)
                PinterestService.fetchAccount(savedPinterestToken).then(account => {
                    setPinterestAccounts([account])
                    if (!savedPinterestAccount) setSelectedPinterestAccount(account)
                })
                PinterestService.fetchBoards(savedPinterestToken).then(boards => {
                    setPinterestBoards(boards)
                    if (boards.length > 0 && !savedPinterestBoard) setSelectedPinterestBoard(boards[0])
                })
                setSelectedPlatforms((prev) => Array.from(new Set([...prev, "pinterest"])))
            }

            if (savedThreadsToken) {
                setThreadsAccessToken(savedThreadsToken)
                setIsThreadsTokenSet(true)
                ThreadsService.fetchAccount(savedThreadsToken).then(account => {
                    setThreadsAccounts([account])
                    if (!savedThreadsAccount) setSelectedThreadsAccount(account)
                })
                setSelectedPlatforms((prev) => Array.from(new Set([...prev, "threads"])))
            }

            if (savedTikTokToken) {
                setTikTokAccessToken(savedTikTokToken)
                setIsTikTokTokenSet(true)
                TikTokService.fetchAccounts(savedTikTokToken).then(accounts => {
                    setTikTokAccounts(accounts)
                    if (!savedTikTokAccount) setSelectedTikTokAccount(accounts[0])
                })
                setSelectedPlatforms((prev) => Array.from(new Set([...prev, "tiktok"])))
            }

            if (savedFacebookPage) setSelectedFacebookPage(JSON.parse(savedFacebookPage))
            if (savedInstagramAccount) setSelectedInstagramAccount(JSON.parse(savedInstagramAccount))
            if (savedPinterestAccount) setSelectedPinterestAccount(JSON.parse(savedPinterestAccount))
            if (savedPinterestBoard) setSelectedPinterestBoard(JSON.parse(savedPinterestBoard))
            if (savedThreadsAccount) setSelectedThreadsAccount(JSON.parse(savedThreadsAccount))
            if (savedTikTokAccount) setSelectedTikTokAccount(JSON.parse(savedTikTokAccount))

            setShowTokenModal(!savedFacebookToken && !savedInstagramToken && !savedPinterestToken && !savedThreadsToken && !savedTikTokToken)
        }
        init()
    }, [])

    // --- Dynamic Data Fetching ---
    useEffect(() => {
        if (selectedFacebookPage) {
            FacebookService.fetchPosts(selectedFacebookPage).then(setFacebookPosts)
            FacebookService.fetchInsights(selectedFacebookPage).then(setFacebookInsights)
            FacebookService.fetchDemographics(selectedFacebookPage).then(setDemographics)
        }
    }, [selectedFacebookPage])

    useEffect(() => {
        if (selectedFacebookPage && facebookPosts.length > 0) {
            FacebookService.fetchPostAnalytics(selectedFacebookPage, facebookPosts).then(setPostAnalytics)
        }
    }, [selectedFacebookPage, facebookPosts])

    useEffect(() => {
        if (selectedInstagramAccount) {
            InstagramService.fetchPosts(selectedInstagramAccount).then(setInstagramPosts)
            InstagramService.fetchInsights(selectedInstagramAccount).then(setInstagramInsights)
        }
    }, [selectedInstagramAccount])

    useEffect(() => {
        if (selectedPinterestAccount) {
            PinterestService.fetchPins(pinterestAccessToken).then(setPinterestPins)
        }
    }, [selectedPinterestAccount, pinterestAccessToken])

    useEffect(() => {
        if (selectedPinterestAccount) {
            PinterestService.fetchInsights(pinterestAccessToken, pinterestPins.length).then(setPinterestInsights)
        }
    }, [selectedPinterestAccount, pinterestAccessToken, pinterestPins])

    useEffect(() => {
        if (selectedThreadsAccount) {
            ThreadsService.fetchPosts(threadsAccessToken).then(setThreadsPosts)
            ThreadsService.fetchInsights(threadsAccessToken, selectedThreadsAccount).then(setThreadsInsights)
        }
    }, [selectedThreadsAccount, threadsAccessToken])

    useEffect(() => {
        if (selectedTikTokAccount) {
            TikTokService.fetchVideos(tiktokAccessToken).then(setTikTokVideos)
            TikTokService.fetchInsights(selectedTikTokAccount).then(setTikTokInsights)
        }
    }, [selectedTikTokAccount, tiktokAccessToken])

    // --- Handlers ---
    const initiateOAuth = (platform: "facebook" | "instagram" | "pinterest" | "threads" | "tiktok") => {
        let authUrl = ""
        let clientId = ""
        let redirectUri = ""
        let scope = ""

        if (platform === "facebook" || platform === "instagram") {
            clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ""
            if (!clientId) {
                setError("Facebook App ID not configured")
                return
            }

            redirectUri = `${window.location.origin}/auth/${platform}/callback`

            if (platform === "facebook") {
                scope = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,business_management,read_insights,pages_manage_metadata"
            } else {
                scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,instagram_manage_insights"
            }

            authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${platform}`
        }
        else if (platform === "pinterest") {
            clientId = process.env.NEXT_PUBLIC_PINTEREST_APP_ID || "";
            if (!clientId) {
                setError("Pinterest Client ID not configured");
                return;
            }

            redirectUri = `${window.location.origin}/auth/pinterest/callback`;
            scope = "user_accounts:read,boards:read,boards:write,pins:read,pins:write";
            authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
                redirectUri
            )}&scope=${encodeURIComponent(
                scope
            )}&response_type=code&state=pinterest`;
        }
        else if (platform === "threads") {
            clientId = process.env.NEXT_PUBLIC_THREADS_APP_ID || ""
            if (!clientId) {
                setError("Threads App ID not configured")
                return
            }

            redirectUri = `${window.location.origin}/auth/threads/callback`
            scope = "threads_basic,threads_content_publish"

            authUrl = `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`
        }
        else if (platform === "tiktok") {
            clientId = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || ""
            if (!clientId) {
                setError("TikTok Client Key not configured")
                return
            }

            redirectUri = `${window.location.origin}/auth/tiktok/callback`
            scope = "user.info.basic,user.info.stats,video.list,video.upload,video.publish"

            authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`
        }

        // Open OAuth in popup
        const popup = window.open(authUrl, `${platform}_oauth`, "width=600,height=600,scrollbars=yes,resizable=yes")

        // Listen for popup completion
        const checkClosed = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkClosed)
                // Check if tokens were set
                const savedToken = localStorage.getItem(`${platform}_access_token`)
                if (savedToken) {
                    // Trigger a reload to refresh state from localStorage
                    window.location.reload()
                }
            }
        }, 1000)
    }

    const handlePageSelection = (page: FacebookPage) => {
        setSelectedFacebookPage(page)
        localStorage.setItem("selected_facebook_page", JSON.stringify(page))
        setShowPageModal(false)
    }

    const handleInstagramSelection = (account: InstagramAccount) => {
        setSelectedInstagramAccount(account)
        localStorage.setItem("selected_instagram_account", JSON.stringify(account))
        setShowPageModal(false)
    }

    const handleTikTokSelection = (account: TikTokAccount) => {
        setSelectedTikTokAccount(account)
        localStorage.setItem("selected_tiktok_account", JSON.stringify(account))
        setShowPageModal(false)
    }

    const extractTaggedPeople = () => {
        const mentionRegex = /@(\w+(?:\s+\w+)*)/g
        const matches = postContent.matchAll(mentionRegex)
        const taggedIds: string[] = []
        for (const match of matches) {
            const name = match[1]
            const id = taggedPeopleMap.get(name)
            if (id) taggedIds.push(id)
        }
        return taggedIds
    }

    const uploadFilesToEdgeStore = async (files: File[]) => {
        const urls: string[] = []
        setUploadProgress({ isUploading: true, progress: 0, currentFile: "", totalFiles: files.length, currentFileIndex: 0 })
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            setUploadProgress(prev => ({ ...prev, currentFile: file.name, currentFileIndex: i + 1 }))
            const res = await edgestore.publicFiles.upload({
                file,
                onProgressChange: (progress) => setUploadProgress(prev => ({ ...prev, progress }))
            })
            urls.push(res.url)
        }
        setUploadProgress(prev => ({ ...prev, isUploading: false }))
        return urls
    }

    const validatePost = () => {
        if (!postContent.trim() && selectedFiles.length === 0) return "Please enter some content or select a file."
        if (!postToFacebook && !postToInstagram && !postToPinterest && !postToThreads && !postToTikTok) return "Please select at least one platform."
        if (isScheduled && (!scheduledDate || !scheduledTime)) return "Please select both date and time for scheduling."
        if (postToPinterest && !selectedPinterestBoard) return "Please select a Pinterest board."
        return null
    }

    const handleCreateBoard = async () => {
        if (!newBoardName.trim() || !selectedPinterestAccount) return
        setIsCreatingBoard(true)
        try {
            const board = await PinterestService.createBoard(pinterestAccessToken, newBoardName)
            setPinterestBoards(prev => [...prev, board])
            setSelectedPinterestBoard(board)
            setNewBoardName("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create board")
        } finally {
            setIsCreatingBoard(false)
        }
    }

    const handlePost = async () => {
        const errorMsg = validatePost()
        if (errorMsg) { setError(errorMsg); return }

        setShowPostModal(false); setIsPosting(true); setError("")
        setPostingStatus({ isPosting: true, message: "Initializing...", progress: 5, currentStep: "Initializing" })

        try {
            let fileUrls: string[] = []
            if (selectedFiles.length > 0) {
                setPostingStatus(prev => ({ ...prev, message: "Uploading media...", progress: 10, currentStep: "Uploading" }))
                fileUrls = await uploadFilesToEdgeStore(selectedFiles)
            }

            const results: string[] = []
            const isFacebookOnly = postToFacebook && !postToInstagram && !postToPinterest && !postToThreads && !postToTikTok

            if (isScheduled && !isFacebookOnly) {
                const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
                const payload = {
                    scheduledTimestamp: Math.floor(scheduledDateTime.getTime() / 1000),
                    platformsToSchedule: [
                        postToFacebook ? "facebook" : null,
                        postToInstagram ? "instagram" : null,
                        postToPinterest ? "pinterest" : null,
                        postToThreads ? "threads" : null,
                        postToTikTok ? "tiktok" : null,
                    ].filter(Boolean),
                    postContent, fileUrls, postType, fileTypes,
                    ...(postToFacebook && selectedFacebookPage && { facebook: { accessToken: selectedFacebookPage.access_token, accountId: selectedFacebookPage.id, taggedIds: extractTaggedPeople() } }),
                    ...(postToInstagram && selectedInstagramAccount && { instagram: { accessToken: instagramAccessToken, accountId: selectedInstagramAccount.id } }),
                    ...(postToPinterest && selectedPinterestAccount && selectedPinterestBoard && { pinterest: { accessToken: pinterestAccessToken, accountId: selectedPinterestAccount.id, boardId: selectedPinterestBoard.id, pinTitle, pinDescription, pinLink } }),
                    ...(postToThreads && selectedThreadsAccount && { threads: { accessToken: threadsAccessToken, accountId: selectedThreadsAccount.id } }),
                    ...(postToTikTok && selectedTikTokAccount && { tiktok: { accessToken: tiktokAccessToken, openId: selectedTikTokAccount.open_id } })
                }
                const res = await fetch("/api/social/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
                if (!res.ok) throw new Error("Failed to schedule post")
                results.push("scheduled " + payload.platformsToSchedule.join(", "))
            } else {
                if (postToFacebook && selectedFacebookPage) {
                    await FacebookService.postToPage(selectedFacebookPage, postContent, fileUrls, {
                        postType, isScheduled, scheduledDate, scheduledTime, taggedIds: extractTaggedPeople(), fileTypes,
                        onStatusUpdate: (message) => setPostingStatus(prev => ({ ...prev, message, progress: 40 }))
                    })
                    results.push("Facebook")
                }
                if (!isScheduled) {
                    if (postToInstagram && selectedInstagramAccount) {
                        await InstagramService.postToAccount(selectedInstagramAccount, postContent, fileUrls, {
                            postType, fileTypes, onStatusUpdate: (message) => setPostingStatus(prev => ({ ...prev, message, progress: 60 }))
                        })
                        results.push("Instagram")
                    }
                    if (postToPinterest && selectedPinterestBoard) {
                        await PinterestService.postToBoard(pinterestAccessToken, selectedPinterestBoard.id, fileUrls, {
                            title: pinTitle, description: pinDescription || postContent, link: pinLink, onStatusUpdate: (message) => setPostingStatus(prev => ({ ...prev, message, progress: 75 }))
                        })
                        results.push("Pinterest")
                    }
                    if (postToThreads && selectedThreadsAccount) {
                        await ThreadsService.postToAccount(threadsAccessToken, postContent, fileUrls, {
                            fileTypes, pollingToken: selectedInstagramAccount?.access_token || threadsAccessToken, onStatusUpdate: (message) => setPostingStatus(prev => ({ ...prev, message, progress: 85 }))
                        })
                        results.push("Threads")
                    }
                    if (postToTikTok && selectedTikTokAccount) {
                        await TikTokService.postToAccount(tiktokAccessToken, postContent, fileUrls, {
                            files: selectedFiles, onStatusUpdate: (message) => setPostingStatus(prev => ({ ...prev, message, progress: 95 }))
                        })
                        results.push("TikTok")
                    }
                }
            }

            setPostingStatus({ isPosting: true, message: `Success! Posted to: ${results.join(", ")}`, progress: 100, currentStep: "Complete" })
            setTimeout(() => {
                setPostingStatus({ isPosting: false, message: "", progress: 0, currentStep: "" })
                setPostContent(""); setPinTitle(""); setPinDescription(""); setPinLink(""); setSelectedFiles([]); setFilePreviews([]); setFileTypes([]); setIsScheduled(false); setScheduledDate(""); setScheduledTime("")
            }, 3000)

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to post")
            setPostingStatus({ isPosting: false, message: "Failed", progress: 0, currentStep: "Error" })
        } finally {
            setIsPosting(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        setSelectedFiles(prev => [...prev, ...files])
        setFileTypes(prev => [...prev, ...files.map(f => f.type)])
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (re) => setFilePreviews(prev => [...prev, re.target?.result as string])
            reader.readAsDataURL(file)
        })
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
        setFilePreviews(prev => prev.filter((_, i) => i !== index))
        setFileTypes(prev => prev.filter((_, i) => i !== index))
    }

    const searchPeopleForMention = async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setMentionSuggestions([])
            return
        }
        setIsSearchingMentions(true)
        try {
            const token = selectedFacebookPage?.access_token || facebookAccessToken
            if (!token) return
            const response = await fetch(`https://graph.facebook.com/v24.0/me/friends?access_token=${token}&fields=id,name&limit=10`)
            if (response.ok) {
                const data = await response.json()
                const filtered = (data.data || []).filter((friend: any) => friend.name.toLowerCase().includes(query.toLowerCase()))
                setMentionSuggestions(filtered)
            }
        } catch (err) {
            console.error("Mention search error:", err)
        } finally {
            setIsSearchingMentions(false)
        }
    }

    const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        const cursorPos = e.target.selectionStart
        setPostContent(value)
        setMentionCursorPosition(cursorPos)
        const textBeforeCursor = value.substring(0, cursorPos)
        const lastAtIndex = textBeforeCursor.lastIndexOf("@")
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
            if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
                setMentionSearchQuery(textAfterAt)
                setShowMentionDropdown(true)
                searchPeopleForMention(textAfterAt)
            } else {
                setShowMentionDropdown(false)
            }
        } else {
            setShowMentionDropdown(false)
        }
    }

    const handleSelectMention = (person: { id: string; name: string }) => {
        if (!textareaRef.current) return
        const cursorPos = mentionCursorPosition
        const textBeforeCursor = postContent.substring(0, cursorPos)
        const textAfterCursor = postContent.substring(cursorPos)
        const lastAtIndex = textBeforeCursor.lastIndexOf("@")
        if (lastAtIndex !== -1) {
            const newText = postContent.substring(0, lastAtIndex) + `@${person.name} ` + textAfterCursor
            setPostContent(newText)
            const newMap = new Map(taggedPeopleMap)
            newMap.set(person.name, person.id)
            setTaggedPeopleMap(newMap)
            setShowMentionDropdown(false)
            setMentionSearchQuery("")
            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursorPos = lastAtIndex + person.name.length + 2
                    textareaRef.current.focus()
                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
                }
            }, 0)
        }
    }

    const handleEmojiClick = (emojiData: any) => {
        setPostContent((prev) => prev + emojiData.emoji)
        setShowEmojiPicker(false)
    }

    const handleHashtagClick = (hashtag: string) => {
        setPostContent((prev) => prev + " " + hashtag)
    }

    const disconnectPlatform = (platform: string) => {
        localStorage.removeItem(`${platform}_access_token`)
        const storageKey = platform === "facebook" ? "selected_facebook_page" : `selected_${platform}_account`
        localStorage.removeItem(storageKey)
        if (platform === "pinterest") localStorage.removeItem("selected_pinterest_board")

        switch (platform) {
            case "facebook": setFacebookAccessToken(""); setIsFacebookTokenSet(false); setSelectedFacebookPage(null); setFacebookPages([]); break
            case "instagram": setInstagramAccessToken(""); setIsInstagramTokenSet(false); setSelectedInstagramAccount(null); setInstagramAccounts([]); break
            case "pinterest": setPinterestAccessToken(""); setIsPinterestTokenSet(false); setSelectedPinterestAccount(null); setSelectedPinterestBoard(null); setPinterestAccounts([]); setPinterestBoards([]); break
            case "threads": setThreadsAccessToken(""); setIsThreadsTokenSet(false); setSelectedThreadsAccount(null); setThreadsAccounts([]); break
            case "tiktok": setTikTokAccessToken(""); setIsTikTokTokenSet(false); setSelectedTikTokAccount(null); setTikTokAccounts([]); break
        }
        setSelectedPlatforms(prev => prev.filter(p => p !== platform))
        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} Disconnected`)
    }

    const handlePinterestBoardSelection = (board: PinterestBoard) => {
        setSelectedPinterestBoard(board)
        localStorage.setItem("selected_pinterest_board", JSON.stringify(board))
    }

    return {
        state: {
            facebookAccessToken, instagramAccessToken, pinterestAccessToken, threadsAccessToken, tiktokAccessToken,
            isFacebookTokenSet, isInstagramTokenSet, isPinterestTokenSet, isThreadsTokenSet, isTikTokTokenSet,
            facebookPages, instagramAccounts, pinterestAccounts, pinterestBoards, threadsAccounts, tiktokAccounts,
            selectedFacebookPage, selectedInstagramAccount, selectedPinterestAccount, selectedPinterestBoard, selectedThreadsAccount, selectedTikTokAccount,
            facebookPosts, instagramPosts, pinterestPins, threadsPosts, tiktokVideos,
            facebookInsights, instagramInsights, pinterestInsights, threadsInsights, tiktokInsights,
            demographics, postAnalytics, isLoading, error, showTokenModal, showPageModal, showPostModal,
            postContent, isPosting, scheduledDate, scheduledTime, isScheduled, activeTab, analyticsTab,
            postToFacebook, postToInstagram, postToPinterest, postToThreads, postToTikTok,
            postType, selectedFiles, filePreviews, fileTypes, showPageSwitcher, showEmojiPicker, showHashtagPicker,
            selectedPlatforms, mentionSuggestions, showMentionDropdown, mentionSearchQuery, isSearchingMentions,
            mentionCursorPosition, taggedPeopleMap, pinTitle, pinDescription, pinLink, newBoardName, isCreatingBoard,
            postingStatus, uploadProgress
        },
        actions: {
            setFacebookAccessToken, setInstagramAccessToken, setPinterestAccessToken, setThreadsAccessToken, setTikTokAccessToken,
            setIsFacebookTokenSet, setIsInstagramTokenSet, setIsPinterestTokenSet, setIsThreadsTokenSet, setIsTikTokTokenSet,
            setFacebookPages, setInstagramAccounts, setPinterestAccounts, setPinterestBoards, setThreadsAccounts, setTikTokAccounts,
            setSelectedFacebookPage, setSelectedInstagramAccount, setSelectedPinterestAccount, setSelectedPinterestBoard, setSelectedThreadsAccount, setSelectedTikTokAccount,
            setFacebookPosts, setInstagramPosts, setPinterestPins, setThreadsPosts, setTikTokVideos,
            setFacebookInsights, setInstagramInsights, setPinterestInsights, setThreadsInsights, setTikTokInsights,
            setDemographics, setPostAnalytics, setIsLoading, setError, setShowTokenModal, setShowPageModal, setShowPostModal,
            setPostContent, setIsPosting, setScheduledDate, setScheduledTime, setIsScheduled, setActiveTab, setAnalyticsTab,
            setPostToFacebook, setPostToInstagram, setPostToPinterest, setPostToThreads, setPostToTikTok,
            setPostType, setSelectedFiles, setFilePreviews, setFileTypes, setShowPageSwitcher, setShowEmojiPicker, setShowHashtagPicker,
            setSelectedPlatforms, setMentionSuggestions, setShowMentionDropdown, setMentionSearchQuery, setIsSearchingMentions,
            setMentionCursorPosition, setTaggedPeopleMap, setPinTitle, setPinDescription, setPinLink, setNewBoardName, setIsCreatingBoard,
            setPostingStatus, setUploadProgress,
            initiateOAuth, handlePageSelection, handleInstagramSelection, handleTikTokSelection, handlePost, handleFileSelect, removeFile, handleCreateBoard,
            validatePost, uploadFilesToEdgeStore,
            handleCaptionChange, handleSelectMention, handleEmojiClick, handleHashtagClick, disconnectPlatform, handlePinterestBoardSelection
        },
        refs: { fileInputRef, textareaRef }
    }
}
