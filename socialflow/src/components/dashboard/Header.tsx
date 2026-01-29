import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Facebook, Instagram, Share2, MessageCircle, Music, ChevronDown, Check, X, Users, Plus, Settings } from "lucide-react"
import Image from "next/image"
import {
    FacebookPage,
    InstagramAccount,
    PinterestAccount,
    ThreadsAccount,
    TikTokAccount
} from "@/types/social-types"

interface HeaderProps {
    selectedFacebookPage: FacebookPage | null
    selectedInstagramAccount: InstagramAccount | null
    selectedPinterestAccount: PinterestAccount | null
    selectedThreadsAccount: ThreadsAccount | null
    selectedTikTokAccount: TikTokAccount | null

    facebookPages: FacebookPage[]
    instagramAccounts: InstagramAccount[]
    pinterestAccounts: PinterestAccount[]
    threadsAccounts: ThreadsAccount[]
    tiktokAccounts: TikTokAccount[]

    onSelectFacebookPage: (page: FacebookPage) => void
    onSelectInstagramAccount: (account: InstagramAccount) => void
    onSelectPinterestAccount: (account: PinterestAccount) => void
    onSelectThreadsAccount: (account: ThreadsAccount) => void
    onSelectTikTokAccount: (account: TikTokAccount) => void

    disconnectFacebook: () => void
    disconnectInstagram: () => void
    disconnectPinterest: () => void
    disconnectThreads: () => void
    disconnectTikTok: () => void

    openPageModal: () => void
    openPostModal: () => void
    openTokenModal: () => void

    isFacebookTokenSet: boolean
    isInstagramTokenSet: boolean
    isPinterestTokenSet: boolean
    isThreadsTokenSet: boolean
    isTikTokTokenSet: boolean

    isPosting: boolean
}

export function Header({
    selectedFacebookPage,
    selectedInstagramAccount,
    selectedPinterestAccount,
    selectedThreadsAccount,
    selectedTikTokAccount,
    facebookPages,
    instagramAccounts,
    pinterestAccounts,
    threadsAccounts,
    tiktokAccounts,
    onSelectFacebookPage,
    onSelectInstagramAccount,
    onSelectPinterestAccount,
    onSelectThreadsAccount,
    onSelectTikTokAccount,
    disconnectFacebook,
    disconnectInstagram,
    disconnectPinterest,
    disconnectThreads,
    disconnectTikTok,
    openPageModal,
    openPostModal,
    openTokenModal,
    isFacebookTokenSet,
    isInstagramTokenSet,
    isPinterestTokenSet,
    isThreadsTokenSet,
    isTikTokTokenSet,
    isPosting
}: HeaderProps) {
    const [showPageSwitcher, setShowPageSwitcher] = useState(false)

    const hasAnyToken = isFacebookTokenSet || isInstagramTokenSet || isPinterestTokenSet || isThreadsTokenSet || isTikTokTokenSet

    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-black font-serif text-primary">Social Media Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="flex items-center gap-4">
                            {selectedFacebookPage && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                        <Facebook className="h-3 w-3 mr-1" />
                                        {selectedFacebookPage.name}
                                        <DropdownMenu open={showPageSwitcher} onOpenChange={setShowPageSwitcher}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-56">
                                                <DropdownMenuLabel>Switch Facebook Page</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {facebookPages.map((page) => (
                                                    <DropdownMenuItem
                                                        key={page.id}
                                                        onClick={() => {
                                                            onSelectFacebookPage(page)
                                                            setShowPageSwitcher(false)
                                                        }}
                                                        className={selectedFacebookPage?.id === page.id ? "bg-blue-50" : ""}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {page.picture?.data?.url && (
                                                                <Image
                                                                    src={page.picture.data.url || "/placeholder.svg"}
                                                                    alt={page.name}
                                                                    width={16}
                                                                    height={16}
                                                                    className="h-4 w-4 rounded-full"
                                                                />
                                                            )}
                                                            <span className="truncate">{page.name}</span>
                                                            {selectedFacebookPage?.id === page.id && (
                                                                <Check className="h-3 w-3 ml-auto text-green-600" />
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                                            onClick={disconnectFacebook}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                </div>
                            )}
                            {selectedInstagramAccount && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                                        <Instagram className="h-3 w-3 mr-1" />@{selectedInstagramAccount.username}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-56">
                                                <DropdownMenuLabel>Switch Instagram Account</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {instagramAccounts.map((account) => (
                                                    <DropdownMenuItem
                                                        key={account.id}
                                                        onClick={() => onSelectInstagramAccount(account)}
                                                        className={selectedInstagramAccount?.id === account.id ? "bg-pink-50" : ""}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {account.profile_picture_url && (
                                                                <Image
                                                                    src={account.profile_picture_url || "/placeholder.svg"}
                                                                    alt={account.username}
                                                                    width={16}
                                                                    height={16}
                                                                    className="h-4 w-4 rounded-full"
                                                                />
                                                            )}
                                                            <span className="truncate">@{account.username}</span>
                                                            {selectedInstagramAccount?.id === account.id && (
                                                                <Check className="h-3 w-3 ml-auto text-green-600" />
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                                            onClick={disconnectInstagram}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                </div>
                            )}
                            {selectedPinterestAccount && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                                        <Share2 className="h-3 w-3 mr-1" />@{selectedPinterestAccount.username}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-56">
                                                <DropdownMenuLabel>Switch Pinterest Account</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {pinterestAccounts.map((account) => (
                                                    <DropdownMenuItem
                                                        key={account.id}
                                                        onClick={() => onSelectPinterestAccount(account)}
                                                        className={selectedPinterestAccount?.id === account.id ? "bg-red-50" : ""}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {account.profile_picture && (
                                                                <Image
                                                                    src={account.profile_picture || "/placeholder.svg"}
                                                                    alt={account.username}
                                                                    width={16}
                                                                    height={16}
                                                                    className="h-4 w-4 rounded-full"
                                                                />
                                                            )}
                                                            <span className="truncate">@{account.username}</span>
                                                            {selectedPinterestAccount?.id === account.id && (
                                                                <Check className="h-3 w-3 ml-auto text-green-600" />
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                                            onClick={disconnectPinterest}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                </div>
                            )}
                            {selectedThreadsAccount && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-black text-white border-black">
                                        <MessageCircle className="h-3 w-3 mr-1" />@{selectedThreadsAccount.username}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-56">
                                                <DropdownMenuLabel>Switch Threads Account</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {threadsAccounts.map((account) => (
                                                    <DropdownMenuItem
                                                        key={account.id}
                                                        onClick={() => onSelectThreadsAccount(account)}
                                                        className={selectedThreadsAccount?.id === account.id ? "bg-gray-100" : ""}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {account.profile_picture_url && (
                                                                <Image
                                                                    src={account.profile_picture_url || "/placeholder.svg"}
                                                                    alt={account.username}
                                                                    width={16}
                                                                    height={16}
                                                                    className="h-4 w-4 rounded-full"
                                                                />
                                                            )}
                                                            <span className="truncate">@{account.username}</span>
                                                            {selectedThreadsAccount?.id === account.id && (
                                                                <Check className="h-3 w-3 ml-auto text-green-600" />
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                                            onClick={disconnectThreads}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                </div>
                            )}
                            {selectedTikTokAccount && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-black text-white border-black">
                                        <Music className="h-3 w-3 mr-1" />{selectedTikTokAccount.display_name}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-56">
                                                <DropdownMenuLabel>Switch TikTok Account</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {tiktokAccounts.map((account) => (
                                                    <DropdownMenuItem
                                                        key={account.open_id}
                                                        onClick={() => onSelectTikTokAccount(account)}
                                                        className={selectedTikTokAccount?.open_id === account.open_id ? "bg-gray-100" : ""}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {account.avatar_url && (
                                                                <Image
                                                                    src={account.avatar_url || "/placeholder.svg"}
                                                                    alt={account.display_name}
                                                                    width={16}
                                                                    height={16}
                                                                    className="h-4 w-4 rounded-full"
                                                                />
                                                            )}
                                                            <span className="truncate">{account.display_name}</span>
                                                            {selectedTikTokAccount?.open_id === account.open_id && (
                                                                <Check className="h-3 w-3 ml-auto text-green-600" />
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 ml-1 text-red-500 hover:text-red-700"
                                            onClick={disconnectTikTok}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                onClick={openPageModal}
                                title="Select Pages"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Select Accounts
                            </Button>
                        </div>
                        <Button
                            onClick={openPostModal}
                            disabled={!hasAnyToken || isPosting}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Post
                        </Button>
                        <Button variant="outline" onClick={openTokenModal}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
