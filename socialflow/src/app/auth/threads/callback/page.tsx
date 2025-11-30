import ThreadsCallbackInner from "./threads";
import { Suspense } from "react"

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ThreadsCallbackInner />
        </Suspense>
    )
}

