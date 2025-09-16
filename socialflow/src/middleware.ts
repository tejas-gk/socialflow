import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// --- START OF FIX ---
// Define public routes, including the OAuth callback, to prevent Clerk from interfering.
const isPublicRoute = createRouteMatcher([
  "/", 
  "/sign-in(.*)", 
  "/sign-up(.*)",
  "/auth/callback(.*)" // This allows the Facebook/Instagram redirect to work correctly.
]);
// --- END OF FIX ---

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect()

    const { userId } = await auth()
    if (userId && req.url.includes("/api/")) {
      req.headers.set("x-clerk-user-id", userId)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}