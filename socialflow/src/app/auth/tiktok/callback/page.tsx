import TikTokCallbackInner from "./tiktok";
import { Suspense } from "react"

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TikTokCallbackInner />
        </Suspense>
    )
}
