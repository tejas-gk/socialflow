"use client"

import { useState } from "react"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "@/components/ui/button"

export default function VerificationPage() {
    const { edgestore } = useEdgeStore()
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const uploadVerificationFile = async () => {
        setIsLoading(true)
        try {
            // Create a blob from the content "tiktok-verification..."
            // But typically this needs to be the EXACT file content/binary.
            // Since we can't easily read server-side files from client component without an API,
            // we will ask the user to just pick the file again OR verify the one we put in public.

            // better yet, we can fetch it from our own public folder since it is served statically
            const fileName = "tiktokm3ecl7KhfI7tKXz6azjQjEffQM0gY7aA.txt";
            const response = await fetch(`/${fileName}`);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: "text/plain" });

            const res = await edgestore.publicFiles.upload({
                file: file,
                options: {
                    temporary: false, // Permanent
                },
            })

            setUrl(res.url)
            console.log("Uploaded URL:", res.url)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-4">TikTok Domain Verification Uploader</h1>
            <Button onClick={uploadVerificationFile} disabled={isLoading}>
                {isLoading ? "Uploading..." : "Upload Verification File to EdgeStore"}
            </Button>
            {url && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p className="font-bold">File accessible at:</p>
                    <a href={url} target="_blank" className="text-blue-600 break-all">{url}</a>
                </div>
            )}
        </div>
    )
}
