"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Facebook, Instagram, Share2, Music } from "lucide-react"

interface TokenConnectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initiateOAuth: (platform: "facebook" | "instagram" | "pinterest" | "threads" | "tiktok") => void
    isLoading: boolean
}

export function TokenConnectDialog({ open, onOpenChange, initiateOAuth, isLoading }: TokenConnectDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Your Social Media Accounts</DialogTitle>
                    <DialogDescription>
                        Connect your social media accounts to start managing your presence across platforms.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Button
                        onClick={() => initiateOAuth("facebook")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                    >
                        <Facebook className="h-4 w-4 mr-2" />
                        Connect Facebook
                    </Button>

                    <Button
                        onClick={() => initiateOAuth("instagram")}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        disabled={isLoading}
                    >
                        <Instagram className="h-4 w-4 mr-2" />
                        Connect Instagram
                    </Button>

                    <Button
                        onClick={() => initiateOAuth("pinterest")}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={isLoading}
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Connect Pinterest
                    </Button>

                    <Button
                        onClick={() => initiateOAuth("threads")}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        disabled={isLoading}
                    >
                        Connect Threads
                    </Button>

                    <Button
                        onClick={() => initiateOAuth("tiktok")}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        disabled={isLoading}
                    >
                        <Music className="h-4 w-4 mr-2" />
                        Connect TikTok
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">You can connect one or multiple platforms</div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
