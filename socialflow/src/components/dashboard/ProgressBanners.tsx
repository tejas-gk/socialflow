import { Progress } from "@/components/ui/progress"
import { Loader2, Upload } from "lucide-react"

interface ProgressBannersProps {
    postingStatus: { isPosting: boolean; message: string; progress: number; estimatedTime?: string }
    uploadProgress: { isUploading: boolean; progress: number; currentFileIndex: number; totalFiles: number; currentFile: string }
}

export function ProgressBanners({ postingStatus, uploadProgress }: ProgressBannersProps) {
    return (
        <>
            {/* Posting Progress Banner */}
            {postingStatus.isPosting && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
                    <div className="container mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <div className="flex-1">
                                    <p className="font-medium">{postingStatus.message}</p>
                                    {postingStatus.estimatedTime && (
                                        <span className="text-xs text-blue-100 bg-blue-700 px-2 py-0.5 rounded-full inline-block mt-1">
                                            Est: {postingStatus.estimatedTime}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="w-48">
                                <Progress value={postingStatus.progress} className="h-2 bg-blue-700" />
                                <p className="text-xs text-blue-100 text-right mt-1">{Math.round(postingStatus.progress)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Progress Banner */}
            {uploadProgress.isUploading && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg">
                    <div className="container mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                                <Upload className="h-5 w-5" />
                                <div className="flex-1">
                                    <p className="font-medium">
                                        Uploading media ({uploadProgress.currentFileIndex}/{uploadProgress.totalFiles})
                                    </p>
                                    <p className="text-sm text-green-100">Current: {uploadProgress.currentFile}</p>
                                </div>
                            </div>
                            <div className="w-48">
                                <Progress value={uploadProgress.progress} className="h-2 bg-green-700" />
                                <p className="text-xs text-green-100 text-right mt-1">{Math.round(uploadProgress.progress)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
