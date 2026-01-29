"use client"

import React from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSocialDashboard } from "@/hooks/useSocialDashboard"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { AnalyticsTabs } from "@/components/dashboard/AnalyticsTabs"
import { PostsTab } from "@/components/dashboard/PostsTab"
import { Header } from "@/components/dashboard/Header"
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog"
import { PageSelectionDialog } from "@/components/dashboard/PageSelectionDialog"
import { ProgressBanners } from "@/components/dashboard/ProgressBanners"
import { TokenConnectDialog } from "@/components/dashboard/TokenConnectDialog"

const popularHashtags = [
  "#love", "#instagood", "#photooftheday", "#fashion", "#beautiful", "#happy", "#cute", "#tbt", "#like4like", "#followme",
  "#picoftheday", "#follow", "#me", "#selfie", "#summer", "#art", "#instadaily", "#friends", "#repost", "#nature",
  "#style", "#smile", "#food", "#instalike", "#family", "#travel", "#fitness", "#business", "#entrepreneur", "#success",
  "#motivation", "#marketing", "#startup", "#growth"
]

export default function DashboardPage() {
  const { state, actions, refs } = useSocialDashboard()

  return (
    <div className="min-h-screen bg-background">
      <ProgressBanners postingStatus={state.postingStatus} uploadProgress={state.uploadProgress} />

      <Header
        selectedFacebookPage={state.selectedFacebookPage}
        selectedInstagramAccount={state.selectedInstagramAccount}
        selectedPinterestAccount={state.selectedPinterestAccount}
        selectedThreadsAccount={state.selectedThreadsAccount}
        selectedTikTokAccount={state.selectedTikTokAccount}
        facebookPages={state.facebookPages}
        instagramAccounts={state.instagramAccounts}
        pinterestAccounts={state.pinterestAccounts}
        threadsAccounts={state.threadsAccounts}
        tiktokAccounts={state.tiktokAccounts}
        onSelectFacebookPage={actions.handlePageSelection}
        onSelectInstagramAccount={actions.handleInstagramSelection}
        onSelectPinterestAccount={actions.setSelectedPinterestAccount}
        onSelectThreadsAccount={actions.setSelectedThreadsAccount}
        onSelectTikTokAccount={actions.handleTikTokSelection}
        disconnectFacebook={() => actions.disconnectPlatform("facebook")}
        disconnectInstagram={() => actions.disconnectPlatform("instagram")}
        disconnectPinterest={() => actions.disconnectPlatform("pinterest")}
        disconnectThreads={() => actions.disconnectPlatform("threads")}
        disconnectTikTok={() => actions.disconnectPlatform("tiktok")}
        openPageModal={() => actions.setShowPageModal(true)}
        openPostModal={() => actions.setShowPostModal(true)}
        openTokenModal={() => actions.setShowTokenModal(true)}
        isFacebookTokenSet={state.isFacebookTokenSet}
        isInstagramTokenSet={state.isInstagramTokenSet}
        isPinterestTokenSet={state.isPinterestTokenSet}
        isThreadsTokenSet={state.isThreadsTokenSet}
        isTikTokTokenSet={state.isTikTokTokenSet}
        isPosting={state.postingStatus.isPosting}
      />

      <div className="container mx-auto px-4 py-8" style={{ marginTop: state.postingStatus.isPosting || state.uploadProgress.isUploading ? '80px' : '0' }}>
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-serif">Social Media Dashboard</h2>
            <p className="text-muted-foreground">Manage your Facebook, Instagram, Pinterest, Threads, and TikTok presence from one place.</p>
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {state.error.includes("timeout") || state.error.includes("longer than expected")
                  ? `${state.error} This is normal for US regions due to longer processing times. Please check your social media accounts directly.`
                  : state.error}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <StatsOverview
                facebookInsights={state.facebookInsights}
                instagramInsights={state.instagramInsights}
                pinterestInsights={state.pinterestInsights}
                threadsInsights={state.threadsInsights}
                tiktokInsights={state.tiktokInsights}
                selectedTikTokAccount={state.selectedTikTokAccount}
                facebookPosts={state.facebookPosts}
                instagramPosts={state.instagramPosts}
                pinterestPins={state.pinterestPins}
                threadsPosts={state.threadsPosts}
                tiktokVideos={state.tiktokVideos}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsTabs
                analyticsTab={state.analyticsTab}
                setAnalyticsTab={actions.setAnalyticsTab}
                isFacebookTokenSet={state.isFacebookTokenSet}
                isInstagramTokenSet={state.isInstagramTokenSet}
                isPinterestTokenSet={state.isPinterestTokenSet}
                isThreadsTokenSet={state.isThreadsTokenSet}
                isTikTokTokenSet={state.isTikTokTokenSet}
                facebookInsights={state.facebookInsights}
                instagramInsights={state.instagramInsights}
                pinterestInsights={state.pinterestInsights}
                threadsInsights={state.threadsInsights}
                tiktokInsights={state.tiktokInsights}
                selectedTikTokAccount={state.selectedTikTokAccount}
                selectedInstagramAccount={state.selectedInstagramAccount}
                selectedPinterestAccount={state.selectedPinterestAccount}
                selectedThreadsAccount={state.selectedThreadsAccount}
                pinterestBoards={state.pinterestBoards}
              />
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              <PostsTab
                isFacebookTokenSet={state.isFacebookTokenSet}
                isInstagramTokenSet={state.isInstagramTokenSet}
                isPinterestTokenSet={state.isPinterestTokenSet}
                isThreadsTokenSet={state.isThreadsTokenSet}
                isTikTokTokenSet={state.isTikTokTokenSet}
                facebookPosts={state.facebookPosts}
                instagramPosts={state.instagramPosts}
                pinterestPins={state.pinterestPins}
                threadsPosts={state.threadsPosts}
                tiktokVideos={state.tiktokVideos}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TokenConnectDialog
        open={state.showTokenModal}
        onOpenChange={actions.setShowTokenModal}
        isLoading={state.isLoading}
        initiateOAuth={actions.initiateOAuth}
      />

      <CreatePostDialog
        open={state.showPostModal}
        onOpenChange={actions.setShowPostModal}
        postType={state.postType}
        setPostType={actions.setPostType}
        postToFacebook={state.postToFacebook}
        setPostToFacebook={actions.setPostToFacebook}
        postToInstagram={state.postToInstagram}
        setPostToInstagram={actions.setPostToInstagram}
        postToPinterest={state.postToPinterest}
        setPostToPinterest={actions.setPostToPinterest}
        postToThreads={state.postToThreads}
        setPostToThreads={actions.setPostToThreads}
        postToTikTok={state.postToTikTok}
        setPostToTikTok={actions.setPostToTikTok}
        isFacebookTokenSet={state.isFacebookTokenSet}
        isInstagramTokenSet={state.isInstagramTokenSet}
        isPinterestTokenSet={state.isPinterestTokenSet}
        isThreadsTokenSet={state.isThreadsTokenSet}
        isTikTokTokenSet={state.isTikTokTokenSet}
        selectedFacebookPage={state.selectedFacebookPage}
        selectedInstagramAccount={state.selectedInstagramAccount}
        selectedPinterestAccount={state.selectedPinterestAccount}
        selectedThreadsAccount={state.selectedThreadsAccount}
        selectedTikTokAccount={state.selectedTikTokAccount}
        postContent={state.postContent}
        setPostContent={actions.setPostContent}
        handleCaptionChange={actions.handleCaptionChange}
        textareaRef={refs.textareaRef}
        selectedFiles={state.selectedFiles}
        setSelectedFiles={actions.setSelectedFiles}
        filePreviews={state.filePreviews}
        setFilePreviews={actions.setFilePreviews}
        handleFileSelect={actions.handleFileSelect}
        removeFile={actions.removeFile}
        fileInputRef={refs.fileInputRef}
        setFileTypes={actions.setFileTypes}
        isScheduled={state.isScheduled}
        setIsScheduled={actions.setIsScheduled}
        scheduledDate={state.scheduledDate}
        setScheduledDate={actions.setScheduledDate}
        scheduledTime={state.scheduledTime}
        setScheduledTime={actions.setScheduledTime}
        pinTitle={state.pinTitle}
        setPinTitle={actions.setPinTitle}
        pinDescription={state.pinDescription}
        setPinDescription={actions.setPinDescription}
        pinLink={state.pinLink}
        setPinLink={actions.setPinLink}
        pinterestBoards={state.pinterestBoards}
        selectedPinterestBoard={state.selectedPinterestBoard}
        handlePinterestBoardSelection={actions.handlePinterestBoardSelection}
        newBoardName={state.newBoardName}
        setNewBoardName={actions.setNewBoardName}
        handleCreateBoard={actions.handleCreateBoard}
        isCreatingBoard={state.isCreatingBoard}
        showMentionDropdown={state.showMentionDropdown}
        mentionSuggestions={state.mentionSuggestions}
        handleSelectMention={actions.handleSelectMention}
        isSearchingMentions={state.isSearchingMentions}
        mentionSearchQuery={state.mentionSearchQuery}
        showEmojiPicker={state.showEmojiPicker}
        setShowEmojiPicker={actions.setShowEmojiPicker}
        handleEmojiClick={actions.handleEmojiClick}
        showHashtagPicker={state.showHashtagPicker}
        setShowHashtagPicker={actions.setShowHashtagPicker}
        popularHashtags={popularHashtags}
        handleHashtagClick={actions.handleHashtagClick}
        handlePost={actions.handlePost}
        postingStatus={state.postingStatus}
        uploadProgress={state.uploadProgress}
        error={state.error}
      />

      <PageSelectionDialog
        open={state.showPageModal}
        onOpenChange={actions.setShowPageModal}
        facebookPages={state.facebookPages}
        instagramAccounts={state.instagramAccounts}
        pinterestAccounts={state.pinterestAccounts}
        threadsAccounts={state.threadsAccounts}
        tiktokAccounts={state.tiktokAccounts}
        selectedFacebookPage={state.selectedFacebookPage}
        selectedInstagramAccount={state.selectedInstagramAccount}
        selectedPinterestAccount={state.selectedPinterestAccount}
        selectedThreadsAccount={state.selectedThreadsAccount}
        selectedTikTokAccount={state.selectedTikTokAccount}
        onSelectFacebookPage={actions.handlePageSelection}
        onSelectInstagramAccount={actions.handleInstagramSelection}
        onSelectPinterestAccount={actions.setSelectedPinterestAccount}
        onSelectThreadsAccount={actions.setSelectedThreadsAccount}
        onSelectTikTokAccount={actions.handleTikTokSelection}
        pinterestBoards={state.pinterestBoards}
        selectedPinterestBoard={state.selectedPinterestBoard}
        onSelectPinterestBoard={actions.handlePinterestBoardSelection}
      />
    </div>
  )
}