import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Facebook, Instagram, Share2, MessageCircle, Music, X, Smile, Hash, Users, Calendar, Send, ChevronDown, Check, Plus, Image as ImageIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import EmojiPicker from "emoji-picker-react"
import { PinterestBoard } from "@/types/social-types"
import { RefObject } from "react"

interface CreatePostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void

    postType: "post" | "reel" | "carousel" | "pin"
    setPostType: (type: "post" | "reel" | "carousel" | "pin") => void

    postToFacebook: boolean
    setPostToFacebook: (value: boolean) => void
    postToInstagram: boolean
    setPostToInstagram: (value: boolean) => void
    postToPinterest: boolean
    setPostToPinterest: (value: boolean) => void
    postToThreads: boolean
    setPostToThreads: (value: boolean) => void
    postToTikTok: boolean
    setPostToTikTok: (value: boolean) => void

    isFacebookTokenSet: boolean
    isInstagramTokenSet: boolean
    isPinterestTokenSet: boolean
    isThreadsTokenSet: boolean
    isTikTokTokenSet: boolean

    selectedFacebookPage: any
    selectedInstagramAccount: any
    selectedPinterestAccount: any
    selectedThreadsAccount: any
    selectedTikTokAccount: any

    postContent: string
    setPostContent: (content: string) => void
    handleCaptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    textareaRef: RefObject<HTMLTextAreaElement | null>

    selectedFiles: File[]
    setSelectedFiles: (files: File[]) => void
    filePreviews: string[]
    setFilePreviews: (previews: string[]) => void
    // We need fileTypes to distinguish video vs image in preview
    // Assuming fileTypes is derived or passed. The original code uses 'fileTypes' array? 
    // Line 4826: selectedFiles[index]?.type.startsWith("video/")
    // Yes, selectedFiles has type. But fileTypes array was used in line 2412.
    // Let's pass removeFile and handleFileSelect
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
    removeFile: (index: number) => void
    fileInputRef: RefObject<HTMLInputElement | null>
    setFileTypes: (types: string[]) => void // Used in clear button

    isScheduled: boolean
    setIsScheduled: (value: boolean) => void
    scheduledDate: string
    setScheduledDate: (value: string) => void
    scheduledTime: string
    setScheduledTime: (value: string) => void

    pinTitle: string
    setPinTitle: (value: string) => void
    pinDescription: string
    setPinDescription: (value: string) => void
    pinLink: string
    setPinLink: (value: string) => void

    pinterestBoards: PinterestBoard[]
    selectedPinterestBoard: PinterestBoard | null
    handlePinterestBoardSelection: (board: PinterestBoard) => void
    newBoardName: string
    setNewBoardName: (value: string) => void
    handleCreateBoard: () => void
    isCreatingBoard: boolean

    showMentionDropdown: boolean
    mentionSuggestions: any[]
    handleSelectMention: (person: any) => void
    isSearchingMentions: boolean
    mentionSearchQuery: string

    showEmojiPicker: boolean
    setShowEmojiPicker: (value: boolean) => void
    handleEmojiClick: (emojiObject: any) => void

    showHashtagPicker: boolean
    setShowHashtagPicker: (value: boolean) => void
    popularHashtags: string[]
    handleHashtagClick: (tag: string) => void

    handlePost: () => void
    postingStatus: { isPosting: boolean; message: string; progress: number }
    uploadProgress: { isUploading: boolean; progress: number; currentFileIndex: number; totalFiles: number; currentFile: string }

    error: string | null
}

export function CreatePostDialog({
    open,
    onOpenChange,
    postType,
    setPostType,
    postToFacebook,
    setPostToFacebook,
    postToInstagram,
    setPostToInstagram,
    postToPinterest,
    setPostToPinterest,
    postToThreads,
    setPostToThreads,
    postToTikTok,
    setPostToTikTok,
    isFacebookTokenSet,
    isInstagramTokenSet,
    isPinterestTokenSet,
    isThreadsTokenSet,
    isTikTokTokenSet,
    selectedFacebookPage,
    selectedInstagramAccount,
    selectedPinterestAccount,
    selectedThreadsAccount,
    selectedTikTokAccount,
    postContent,
    setPostContent,
    handleCaptionChange,
    textareaRef,
    selectedFiles,
    setSelectedFiles,
    filePreviews,
    setFilePreviews,
    handleFileSelect,
    removeFile,
    fileInputRef,
    setFileTypes,
    isScheduled,
    setIsScheduled,
    scheduledDate,
    setScheduledDate,
    scheduledTime,
    setScheduledTime,
    pinTitle,
    setPinTitle,
    pinDescription,
    setPinDescription,
    pinLink,
    setPinLink,
    pinterestBoards,
    selectedPinterestBoard,
    handlePinterestBoardSelection,
    newBoardName,
    setNewBoardName,
    handleCreateBoard,
    isCreatingBoard,
    showMentionDropdown,
    mentionSuggestions,
    handleSelectMention,
    isSearchingMentions,
    mentionSearchQuery,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
    showHashtagPicker,
    setShowHashtagPicker,
    popularHashtags,
    handleHashtagClick,
    handlePost,
    postingStatus,
    uploadProgress,
    error
}: CreatePostDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>Share content across your social media platforms</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="space-y-2">
                        <Label>Post Type</Label>
                        <div className="flex space-x-2 flex-wrap gap-2">
                            <Button
                                variant={postType === "post" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setPostType("post")
                                    setSelectedFiles([])
                                    setFilePreviews([])
                                    setFileTypes([])
                                }}
                            >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Standard Post
                            </Button>
                            <Button
                                variant={postType === "reel" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setPostType("reel")
                                    setSelectedFiles([])
                                    setFilePreviews([])
                                    setFileTypes([])
                                }}
                            >
                                <Music className="h-4 w-4 mr-2" />
                                Reel / Video
                            </Button>
                            <Button
                                variant={postType === "carousel" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setPostType("carousel")
                                    setSelectedFiles([])
                                    setFilePreviews([])
                                    setFileTypes([])
                                }}
                            >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Carousel
                            </Button>
                            <Button
                                variant={postType === "pin" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setPostType("pin")
                                    setSelectedFiles([])
                                    setFilePreviews([])
                                    setFileTypes([])
                                    setPostToFacebook(false)
                                    setPostToInstagram(false)
                                    setPostToThreads(false)
                                    setPostToTikTok(false)
                                    if (!postToPinterest) setPostToPinterest(true)
                                }}
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Pinterest Pin
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Platforms</Label>
                        <div className="flex flex-wrap gap-4">
                            {postType !== "pin" && (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="facebook"
                                            checked={postToFacebook}
                                            // @ts-ignore
                                            onCheckedChange={setPostToFacebook}
                                            disabled={!selectedFacebookPage}
                                        />
                                        <Label htmlFor="facebook" className="flex items-center space-x-2">
                                            <Facebook className="h-4 w-4 text-blue-600" />
                                            <span>Facebook</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="instagram"
                                            checked={postToInstagram}
                                            // @ts-ignore
                                            onCheckedChange={setPostToInstagram}
                                            disabled={!selectedInstagramAccount}
                                        />
                                        <Label htmlFor="instagram" className="flex items-center space-x-2">
                                            <Instagram className="h-4 w-4 text-pink-600" />
                                            <span>Instagram</span>
                                        </Label>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="pinterest"
                                    checked={postToPinterest}
                                    // @ts-ignore
                                    onCheckedChange={setPostToPinterest}
                                    disabled={!selectedPinterestAccount}
                                />
                                <Label htmlFor="pinterest" className="flex items-center space-x-2">
                                    <Share2 className="h-4 w-4 text-red-600" />
                                    <span>Pinterest</span>
                                </Label>
                            </div>

                            {postType !== "pin" && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="threads"
                                        checked={postToThreads}
                                        // @ts-ignore
                                        onCheckedChange={setPostToThreads}
                                        disabled={!selectedThreadsAccount}
                                    />
                                    <Label htmlFor="threads" className="flex items-center space-x-2">
                                        <MessageCircle className="h-4 w-4 text-black" />
                                        <span>Threads</span>
                                    </Label>
                                </div>
                            )}
                            {postType === "reel" && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="tiktok"
                                        checked={postToTikTok}
                                        // @ts-ignore
                                        onCheckedChange={setPostToTikTok}
                                        disabled={!selectedTikTokAccount}
                                    />
                                    <Label htmlFor="tiktok" className="flex items-center space-x-2">
                                        <Music className="h-4 w-4 text-black" />
                                        <span>TikTok</span>
                                    </Label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pinterest-specific fields */}
                    {postToPinterest && postType === "pin" && (
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                            <h4 className="font-medium flex items-center gap-2">
                                <Share2 className="h-4 w-4 text-red-600" />
                                Pinterest Pin Details
                            </h4>

                            <div className="space-y-2">
                                <Label htmlFor="pin-title">Pin Title *</Label>
                                <Input
                                    id="pin-title"
                                    placeholder="Enter pin title..."
                                    value={pinTitle}
                                    onChange={(e) => setPinTitle(e.target.value)}
                                    maxLength={100}
                                />
                                <p className="text-xs text-muted-foreground">{pinTitle.length}/100 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pin-description">Pin Description</Label>
                                <Textarea
                                    id="pin-description"
                                    placeholder="Describe your pin..."
                                    value={pinDescription}
                                    onChange={(e) => setPinDescription(e.target.value)}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">{pinDescription.length}/500 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pin-link">Link (Optional)</Label>
                                <Input
                                    id="pin-link"
                                    placeholder="https://example.com"
                                    value={pinLink}
                                    onChange={(e) => setPinLink(e.target.value)}
                                    type="url"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Select or Create Board</Label>

                                {/* Board Selection Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start mb-2">
                                            {selectedPinterestBoard ? selectedPinterestBoard.name : "Select a board..."}
                                            <ChevronDown className="ml-auto h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full max-h-48 overflow-y-auto">
                                        {pinterestBoards.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">No boards found. Create one below.</div>
                                        ) : (
                                            pinterestBoards.map((board) => (
                                                <DropdownMenuItem
                                                    key={board.id}
                                                    onClick={() => handlePinterestBoardSelection(board)}
                                                >
                                                    {board.name}
                                                    {selectedPinterestBoard?.id === board.id && (
                                                        <Check className="ml-auto h-4 w-4" />
                                                    )}
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Create Board Input */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="New board name..."
                                        value={newBoardName}
                                        onChange={(e) => setNewBoardName(e.target.value)}
                                        className="h-9"
                                    />
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleCreateBoard}
                                        disabled={isCreatingBoard || !newBoardName.trim()}
                                    >
                                        {isCreatingBoard ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        Create
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {postType !== "pin" && (
                        <div className="space-y-2">
                            <Label htmlFor="post-content">
                                {postType === "reel" ? "Video Description" :
                                    "Post Content"}
                            </Label>
                            <div className="relative">
                                <Textarea
                                    ref={textareaRef}
                                    id="post-content"
                                    placeholder={
                                        postType === "reel"
                                            ? "Describe your reel... (Type @ to mention people)"
                                            : postType === "carousel"
                                                ? "Caption for your carousel... (Type @ to mention people)"
                                                : "What's on your mind? (Type @ to mention people)"
                                    }
                                    value={postContent}
                                    onChange={handleCaptionChange}
                                    className="min-h-[120px] pr-20"
                                />

                                {showMentionDropdown && (
                                    <div className="absolute z-50 mt-1 w-64 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {isSearchingMentions ? (
                                            <div className="p-2 text-sm text-muted-foreground">Searching...</div>
                                        ) : mentionSuggestions.length > 0 ? (
                                            mentionSuggestions.map((person) => (
                                                <button
                                                    key={person.id}
                                                    className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center gap-2"
                                                    onClick={() => handleSelectMention(person)}
                                                >
                                                    <Users className="h-4 w-4" />
                                                    {person.name}
                                                </button>
                                            ))
                                        ) : mentionSearchQuery.length >= 2 ? (
                                            <div className="p-2 text-sm text-muted-foreground">No people found</div>
                                        ) : null}
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowEmojiPicker(!showEmojiPicker)
                                                setShowHashtagPicker(false)
                                            }}
                                        >
                                            <Smile className="h-4 w-4" />
                                        </Button>
                                        {showEmojiPicker && (
                                            <div className="absolute top-8 right-0 z-50">
                                                <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowHashtagPicker(!showHashtagPicker)
                                                setShowEmojiPicker(false)
                                            }}
                                        >
                                            <Hash className="h-4 w-4" />
                                        </Button>
                                        {showHashtagPicker && (
                                            <div className="absolute top-8 right-0 z-50 w-80 max-h-60 bg-white border rounded-lg shadow-lg overflow-hidden">
                                                <ScrollArea className="h-full">
                                                    <div className="p-3">
                                                        <h4 className="font-medium mb-2">Popular Hashtags</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {popularHashtags.map((hashtag) => (
                                                                <Button
                                                                    key={hashtag}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-6 text-xs bg-transparent"
                                                                    onClick={() => handleHashtagClick(hashtag)}
                                                                >
                                                                    {hashtag}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {(postType === "post" || postType === "carousel" || postType === "reel") && (
                                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                    <span>
                                        {postContent.length}/
                                        {postToThreads ? "500" :
                                            postToInstagram ? "2,200" :
                                                "63,206"} characters
                                    </span>
                                    <span className="text-xs">
                                        {postToThreads && postContent.length > 500 && (
                                            <span className="text-red-500">Threads limit exceeded</span>
                                        )}
                                        {postToInstagram && postContent.length > 2200 && (
                                            <span className="text-red-500">Instagram limit exceeded</span>
                                        )}
                                        {postToFacebook && postContent.length > 63206 && (
                                            <span className="text-red-500">Facebook limit exceeded</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="media-upload">
                            {postType === "reel"
                                ? "Video (Required)"
                                : postType === "carousel"
                                    ? "Images (2-10 required)"
                                    : postType === "pin"
                                        ? "Image (Required)"
                                        : "Media (Optional)"}
                        </Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                ref={fileInputRef}
                                id="media-upload"
                                type="file"
                                accept={postType === "reel" ? "video/*" :
                                    postType === "carousel" ? "image/*" :
                                        postType === "pin" ? "image/*" :
                                            "image/*,video/*"}
                                multiple={postType === "carousel"}
                                onChange={handleFileSelect}
                                className="flex-1"
                            />
                            {selectedFiles.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFiles([])
                                        setFilePreviews([])
                                        setFileTypes([])
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {postType === "carousel"
                                ? "You can select multiple images (2-10) by holding Ctrl/Cmd and clicking, or by dragging and dropping"
                                : postType === "reel"
                                    ? "Select one video file"
                                    : postType === "pin"
                                        ? "Select one image file for your pin"
                                        : "Select one image or video file"}
                        </p>

                        {filePreviews.length > 0 && (
                            <div className="mt-2">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {filePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            {selectedFiles[index]?.type.startsWith("video/") ? (
                                                <video src={preview} className="h-24 w-full object-cover rounded border" controls />
                                            ) : (
                                                <Image
                                                    src={preview || "/placeholder.svg"}
                                                    alt={`Preview ${index + 1}`}
                                                    width={100}
                                                    height={100}
                                                    className="h-24 w-full object-cover rounded border"
                                                />
                                            )}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                                    {postType === "carousel" && ` (${selectedFiles.length}/10)`}
                                </p>
                            </div>
                        )}
                    </div>

                    {(postToFacebook || postToInstagram || postToPinterest || postToThreads || postToTikTok) && (
                        <>
                            <div className="flex items-center space-x-2">
                                {/* @ts-ignore */}
                                <Checkbox id="schedule" checked={isScheduled} onCheckedChange={setIsScheduled} />
                                <Label htmlFor="schedule">Schedule for later</Label>
                            </div>

                            {isScheduled && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled-date">Date</Label>
                                        <Input
                                            id="scheduled-date"
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduled-time">Time</Label>
                                        <Input
                                            id="scheduled-time"
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePost}
                            disabled={postingStatus.isPosting || uploadProgress.isUploading}
                        >
                            {postingStatus.isPosting || uploadProgress.isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {uploadProgress.isUploading ? 'Uploading...' : 'Posting...'}
                                </>
                            ) : isScheduled ? (
                                <>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule {postType === "reel" ? "Reel" : postType === "carousel" ? "Carousel" : postType === "pin" ? "Pin" : "Post"}
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Post {postType === "reel" ? "Reel" : postType === "carousel" ? "Carousel" : postType === "pin" ? "Pin" : "Now"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
