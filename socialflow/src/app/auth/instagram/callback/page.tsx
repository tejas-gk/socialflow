import { Suspense } from "react"
import InstagramCallback from "./insta"

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InstagramCallback />
        </Suspense>
    )
}