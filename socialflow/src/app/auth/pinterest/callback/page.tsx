import PinterestCallbackInner from "./pinterest";
import { Suspense } from "react"

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PinterestCallbackInner />
        </Suspense>
    )
}

