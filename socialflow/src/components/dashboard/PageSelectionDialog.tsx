import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Facebook, Instagram, Share2, MessageCircle, Music, Check } from "lucide-react"
import Image from "next/image"
import {
    FacebookPage,
    InstagramAccount,
    PinterestAccount,
    ThreadsAccount,
    TikTokAccount,
    PinterestBoard
} from "@/types/social-types"

interface PageSelectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void

    facebookPages: FacebookPage[]
    instagramAccounts: InstagramAccount[]
    pinterestAccounts: PinterestAccount[]
    threadsAccounts: ThreadsAccount[]
    tiktokAccounts: TikTokAccount[]

    selectedFacebookPage: FacebookPage | null
    selectedInstagramAccount: InstagramAccount | null
    selectedPinterestAccount: PinterestAccount | null
    selectedThreadsAccount: ThreadsAccount | null
    selectedTikTokAccount: TikTokAccount | null

    onSelectFacebookPage: (page: FacebookPage) => void
    onSelectInstagramAccount: (account: InstagramAccount) => void
    onSelectPinterestAccount: (account: PinterestAccount) => void
    onSelectThreadsAccount: (account: ThreadsAccount) => void
    onSelectTikTokAccount: (account: TikTokAccount) => void

    pinterestBoards: PinterestBoard[]
    selectedPinterestBoard: PinterestBoard | null
    onSelectPinterestBoard: (board: PinterestBoard) => void
}

export function PageSelectionDialog({
    open,
    onOpenChange,
    facebookPages,
    instagramAccounts,
    pinterestAccounts,
    threadsAccounts,
    tiktokAccounts,
    selectedFacebookPage,
    selectedInstagramAccount,
    selectedPinterestAccount,
    selectedThreadsAccount,
    selectedTikTokAccount,
    onSelectFacebookPage,
    onSelectInstagramAccount,
    onSelectPinterestAccount,
    onSelectThreadsAccount,
    onSelectTikTokAccount,
    pinterestBoards,
    selectedPinterestBoard,
    onSelectPinterestBoard
}: PageSelectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select Your Accounts</DialogTitle>
                    <DialogDescription>Choose which accounts to use for posting and analytics.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                    {facebookPages.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-base">
                                <Facebook className="h-5 w-5 text-blue-600" />
                                Facebook Pages
                            </Label>
                            <div className="grid gap-2">
                                {facebookPages.map((page) => (
                                    <Button
                                        key={page.id}
                                        variant={selectedFacebookPage?.id === page.id ? "default" : "outline"}
                                        className="w-full justify-start h-auto py-3"
                                        onClick={() => onSelectFacebookPage(page)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            {page.picture?.data?.url && (
                                                <Image
                                                    src={page.picture.data.url || "/placeholder.svg"}
                                                    alt={page.name}
                                                    width={32}
                                                    height={32}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{page.name}</div>
                                            </div>
                                            {selectedFacebookPage?.id === page.id && (
                                                <Check className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {instagramAccounts.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-base">
                                <Instagram className="h-5 w-5 text-pink-600" />
                                Instagram Accounts
                            </Label>
                            <div className="grid gap-2">
                                {instagramAccounts.map((account) => (
                                    <Button
                                        key={account.id}
                                        variant={selectedInstagramAccount?.id === account.id ? "default" : "outline"}
                                        className="w-full justify-start h-auto py-3"
                                        onClick={() => onSelectInstagramAccount(account)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            {account.profile_picture_url && (
                                                <Image
                                                    src={account.profile_picture_url || "/placeholder.svg"}
                                                    alt={account.username}
                                                    width={32}
                                                    height={32}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">@{account.username}</div>
                                                <div className="text-sm text-muted-foreground">{account.name}</div>
                                            </div>
                                            {selectedInstagramAccount?.id === account.id && (
                                                <Check className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {pinterestAccounts.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-base">
                                <Share2 className="h-5 w-5 text-red-600" />
                                Pinterest Accounts
                            </Label>
                            <div className="grid gap-2">
                                {pinterestAccounts.map((account) => (
                                    <Button
                                        key={account.id}
                                        variant={selectedPinterestAccount?.id === account.id ? "default" : "outline"}
                                        className="w-full justify-start h-auto py-3"
                                        onClick={() => onSelectPinterestAccount(account)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            {account.profile_picture && (
                                                <Image
                                                    src={account.profile_picture || "/placeholder.svg"}
                                                    alt={account.username}
                                                    width={32}
                                                    height={32}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">@{account.username}</div>
                                                <div className="text-sm text-muted-foreground">{account.full_name}</div>
                                            </div>
                                            {selectedPinterestAccount?.id === account.id && (
                                                <Check className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>

                            {selectedPinterestAccount && pinterestBoards.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <Label className="text-sm">Select Board for Pins</Label>
                                    <div className="grid gap-2">
                                        {pinterestBoards.map((board) => (
                                            <Button
                                                key={board.id}
                                                variant={selectedPinterestBoard?.id === board.id ? "default" : "outline"}
                                                size="sm"
                                                className="w-full justify-start"
                                                onClick={() => onSelectPinterestBoard(board)}
                                            >
                                                {board.name}
                                                {selectedPinterestBoard?.id === board.id && (
                                                    <Check className="ml-auto h-4 w-4" />
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {threadsAccounts.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-base">
                                <MessageCircle className="h-5 w-5 text-black" />
                                Threads Accounts
                            </Label>
                            <div className="grid gap-2">
                                {threadsAccounts.map((account) => (
                                    <Button
                                        key={account.id}
                                        variant={selectedThreadsAccount?.id === account.id ? "default" : "outline"}
                                        className="w-full justify-start h-auto py-3"
                                        onClick={() => onSelectThreadsAccount(account)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            {account.profile_picture_url && (
                                                <Image
                                                    src={account.profile_picture_url || "/placeholder.svg"}
                                                    alt={account.username}
                                                    width={32}
                                                    height={32}
                                                    className="h-4 w-4 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">@{account.username}</div>
                                                <div className="text-sm text-muted-foreground">{account.name}</div>
                                            </div>
                                            {selectedThreadsAccount?.id === account.id && (
                                                <Check className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {tiktokAccounts.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-base">
                                <Music className="h-5 w-5 text-black" />
                                TikTok Accounts
                            </Label>
                            <div className="grid gap-2">
                                {tiktokAccounts.map((account) => (
                                    <Button
                                        key={account.open_id}
                                        variant={selectedTikTokAccount?.open_id === account.open_id ? "default" : "outline"}
                                        className="w-full justify-start h-auto py-3"
                                        onClick={() => onSelectTikTokAccount(account)}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            {account.avatar_url && (
                                                <Image
                                                    src={account.avatar_url || "/placeholder.svg"}
                                                    alt={account.display_name}
                                                    width={32}
                                                    height={32}
                                                    className="h-4 w-4 rounded-full"
                                                />
                                            )}
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{account.display_name}</div>
                                            </div>
                                            {selectedTikTokAccount?.open_id === account.open_id && (
                                                <Check className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
