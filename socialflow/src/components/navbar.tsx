import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Facebook,
  Instagram,
  Settings,
  Plus,
  X,
  ChevronDown,
  Check,
} from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar({ selectedFacebookPage, selectedInstagramAccount, facebookPages, instagramAccounts, handlePageSelection, handleInstagramSelection, disconnectFacebook, disconnectInstagram, isFacebookTokenSet, isInstagramTokenSet, setShowPostModal, setShowTokenModal, showPageSwitcher, setShowPageSwitcher }: {
    selectedFacebookPage: any,
    selectedInstagramAccount: any,
    facebookPages: any[],
    instagramAccounts: any[],
    handlePageSelection: (page: any) => void,
    handleInstagramSelection: (account: any) => void,   
    disconnectFacebook: () => void,
    disconnectInstagram: () => void,
    isFacebookTokenSet: boolean,
    isInstagramTokenSet: boolean,
    setShowPostModal: (show: boolean) => void,
    setShowTokenModal: (show: boolean) => void,
    showPageSwitcher: boolean,
    setShowPageSwitcher: (show: boolean) => void,
    }) {
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
                                                            handlePageSelection(page)
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
                                                        onClick={() => handleInstagramSelection(account)}
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
                        </div>
                        <Button onClick={() => setShowPostModal(true)} disabled={!isFacebookTokenSet && !isInstagramTokenSet} className="cursor-pointer">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Post
                        </Button>
                        <Button variant="outline" onClick={() => setShowTokenModal(true)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}