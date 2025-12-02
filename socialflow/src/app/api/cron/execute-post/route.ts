// src/app/api/cron/execute-post/route.ts

import { type NextRequest, NextResponse } from "next/server"

// Base URLs for Facebook Graph API
const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v24.0";

// FIX: Define the absolute host URL for internal server-to-server calls.
// This relies on VERCEL_URL being set in deployment, or defaults to local host.
const HOST_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


// --- CORE INSTAGRAM POSTING LOGIC (Used for IG/Reels) ---

/**
 * Helper to poll the Graph API until the media processing is FINISHED or ERROR.
 * Used for Instagram/Facebook posts which rely on status_code.
 */
const serverWaitForMediaProcessing = async (mediaId: string, accessToken: string, maxAttempts = 20): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // NOTE: This uses status_code which is correct for Instagram containers
        const response = await fetch(
            `${FACEBOOK_GRAPH_URL}/${mediaId}?fields=status_code&access_token=${accessToken}`
        );

        if (!response.ok) {
            console.error(`[CRON: IG/FB Polling] Attempt ${attempt + 1} failed for ${mediaId}. Status: ${response.status}`);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            continue;
        }

        const result = await response.json();

        if (result.status_code === "FINISHED") {
            return true;
        } else if (result.status_code === "ERROR") {
            throw new Error("Media processing failed: " + (result.status_message || "Unknown error"));
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    throw new Error("Media processing timeout after 3+ minutes.");
}

/**
 * Executes a single Instagram Image/Video/Reel post.
 */
const executeInstagramPost = async (job: any) => {
    // NOTE: fileTypes is passed from the scheduler now (previous fix)
    const { instagram, fileUrls, postContent, postType, fileTypes } = job;

    if (!instagram || fileUrls.length === 0) {
        // Allow text-only posts if IG were to support them, but not for media jobs
        if (fileUrls.length === 0) return;
        throw new Error("Instagram job missing account info or media URL.");
    }

    const businessAccountId = instagram.accountId;
    const accessToken = instagram.accessToken;
    let creationId = "";

    const isCarousel = postType === "carousel" && fileUrls.length > 1;

    // --- 1. CAROUSEL LOGIC ---
    if (isCarousel) {
        let childContainerIds: string[] = [];

        // Ensure fileTypes is present and correct length (safety check, should be fine due to previous fix)
        if (!fileTypes || fileTypes.length < fileUrls.length) {
            throw new Error("Cannot process Instagram carousel: fileTypes data is incomplete in cron job payload.");
        }

        for (let i = 0; i < fileUrls.length; i++) {
            const isVideo = fileTypes[i]?.startsWith("video/");
            const mediaTypeField = isVideo ? "video_url" : "image_url";

            const containerPayload: any = {
                [mediaTypeField]: fileUrls[i],
                is_carousel_item: true, // Mark as child item
                access_token: accessToken,
            };

            // 1a. Create Child Media Container
            const containerResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${businessAccountId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(containerPayload),
            });

            if (!containerResponse.ok) {
                const errorData = await containerResponse.json();
                throw new Error(`IG Child Container Creation Failed (${i + 1}): ${errorData.error?.message || "Unknown error"}`);
            }

            const containerResult = await containerResponse.json();
            const childCreationId = containerResult.id;
            childContainerIds.push(childCreationId);

            // 1b. Wait for Media Processing (mandatory for child items, especially video)
            console.log(`[CRON: Instagram] Processing carousel item ${i + 1}/${fileUrls.length}...`);
            await serverWaitForMediaProcessing(childCreationId, accessToken);
        }

        // 2. Create Parent CAROUSEL Container
        const parentPayload = {
            media_type: "CAROUSEL",
            children: childContainerIds.join(","), // Comma-separated list of child IDs
            caption: postContent,
            access_token: accessToken,
        };

        const parentResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${businessAccountId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parentPayload),
        });

        if (!parentResponse.ok) {
            const errorData = await parentResponse.json();
            throw new Error(`IG Parent Carousel Container Creation Failed: ${errorData.error?.message || "Unknown error"}`);
        }

        const parentResult = await parentResponse.json();
        creationId = parentResult.id;

    }
    // --- 3. SINGLE MEDIA / REEL LOGIC (Original Logic, adjusted) ---
    else {
        const mediaUrl = fileUrls[0];
        const isVideo = postType === "reel" || (job.fileTypes?.[0]?.startsWith("video/") && postType === "post");
        const mediaTypeField = isVideo ? "video_url" : "image_url";

        // 3a. Create Media Container (Single Media/Reel)
        const containerPayload: any = {
            [mediaTypeField]: mediaUrl,
            caption: postContent,
            access_token: accessToken,
        };

        if (postType === "reel") {
            containerPayload.media_type = "REELS";
        }

        const containerResponse = await fetch(`${FACEBOOK_GRAPH_URL}/${businessAccountId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(containerPayload),
        });

        if (!containerResponse.ok) {
            const errorData = await containerResponse.json();
            throw new Error(`IG Container Creation Failed: ${errorData.error?.message || "Unknown error"}`);
        }

        const containerResult = await containerResponse.json();
        creationId = containerResult.id;

        // 3b. Wait for Media Processing
        await serverWaitForMediaProcessing(creationId, accessToken);
    }

    // --- 4. PUBLISH MEDIA (Shared Logic) ---
    const publishResponse = await fetch(
        `${FACEBOOK_GRAPH_URL}/${businessAccountId}/media_publish`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken,
            }),
        }
    );

    if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`IG Publish Failed: ${errorData.error?.message || "Unknown error"}`);
    }

    const publishResult = await publishResponse.json();
    console.log(`[CRON: Instagram] Post published. Post ID: ${publishResult.id}`);
}


// --- CORE PINTEREST POSTING LOGIC ---

/**
 * Executes a Pinterest Pin creation using the data from the scheduled job.
 */
const executePostToPinterest = async (job: any) => {
    // FIX: Use the absolute HOST_URL
    const PINTEREST_PROXY_URL = `${HOST_URL}/api/pinterest/proxy?endpoint=/pins`;

    const { pinterest, fileUrls, postContent } = job;

    if (!pinterest || fileUrls.length === 0) {
        throw new Error("Pinterest job missing account info or media URL.");
    }

    const { accessToken, boardId, pinTitle, pinDescription, pinLink } = pinterest;

    const pinData = {
        title: pinTitle || "My Scheduled Pin",
        description: pinDescription || postContent,
        board_id: boardId,
        media_source: {
            source_type: "image_url",
            url: fileUrls[0] // Use the first uploaded file URL
        },
        link: pinLink || undefined
    };

    // Call the internal proxy route directly
    const response = await fetch(PINTEREST_PROXY_URL, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pinData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Pinterest API Failed: ${response.status} ${response.statusText}.`;
        try {
            const errorData = JSON.parse(errorText);
            // This is crucial: Pinterest often returns specific errors in the body
            errorMessage = errorData.message || errorData.details?.[0]?.message || errorMessage;
        } catch (e) {
            // Ignore non-JSON errors
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log(`[CRON: Pinterest] Pin created successfully. ID: ${result.id}`);
}

// --- THREADS POLLING LOGIC (NEW) ---

/**
 * Helper to poll the Threads media processing status via the local proxy.
 */
const executeThreadsMediaPolling = async (mediaId: string, accessToken: string, maxAttempts = 20): Promise<boolean> => {
    const THREADS_PROXY_URL = `${HOST_URL}/api/threads/proxy`;
    const fields = 'status'; // Threads only accepts 'status' field

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Construct the call to the local proxy route, correctly encoding query params
        const proxyUrl = `${THREADS_PROXY_URL}?endpoint=/${mediaId}&params=fields%3D${fields}`;

        const response = await fetch(proxyUrl, {
            headers: {
                // Pass the access token in the Authorization header as expected by the proxy
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CRON: Threads Polling] Attempt ${attempt + 1} failed for ${mediaId}. Proxy Status: ${response.status}. Error: ${errorText}`);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            continue;
        }

        const result = await response.json();
        // Threads response only contains 'status'
        const currentStatus = result.status;

        if (currentStatus === "FINISHED") {
            return true;
        } else if (currentStatus === "ERROR") {
            throw new Error(`Media processing failed for Threads container ${mediaId}.`);
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    throw new Error(`Threads media processing timeout after ${maxAttempts} attempts.`);
}

// --- CORE THREADS POSTING LOGIC (New Implementation) ---

/**
 * Executes a Threads post creation using the data from the scheduled job.
 */
const executePostToThreads = async (job: any) => {
    const THREADS_PROXY_URL = `${HOST_URL}/api/threads/proxy?endpoint=/me/threads`;
    const THREADS_PUBLISH_URL = `${HOST_URL}/api/threads/proxy?endpoint=/me/threads_publish`;

    // ADDED fileTypes to destructuring
    const { threads, fileUrls, postContent, postType, fileTypes } = job;

    if (!threads) {
        throw new Error("Threads job missing account info.");
    }

    const { accessToken } = threads;
    // Use IG token if available for polling (necessary for media processing checks)
    const pollingAccessToken = job.instagram?.accessToken || accessToken;
    let creationId = "";

    // --- 1. Create Media/Text Container ---

    // ADDED: CAROUSEL LOGIC
    if (fileUrls.length > 1 && postType === "carousel") {
        // --- CAROUSEL LOGIC ---
        let childContainerIds: string[] = [];

        // FIX: Implement robust check for fileTypes array (from previous fix)
        if (!fileTypes || !Array.isArray(fileTypes) || fileTypes.length < fileUrls.length) {
            throw new Error(`Cannot process Threads carousel: job payload is missing 'fileTypes' or it is incomplete. Ensure fileTypes is correctly included in the scheduling payload (e.g., in src/app/page.tsx).`);
        }

        for (let i = 0; i < fileUrls.length; i++) {
            const isVideo = fileTypes[i].startsWith("video/");
            const payload: any = {
                media_type: isVideo ? "VIDEO" : "IMAGE",
                is_carousel_item: true,
            };

            if (isVideo) payload.video_url = fileUrls[i];
            else payload.image_url = fileUrls[i];

            const res = await fetch(THREADS_PROXY_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to create Threads carousel item");

            const data = await res.json();
            childContainerIds.push(data.id);

            if (isVideo) {
                console.log(`[CRON: Threads] Processing video ${i + 1}/${fileUrls.length} for Threads carousel...`);
                // FIX: Use the Threads proxy polling function
                await executeThreadsMediaPolling(data.id, pollingAccessToken);
            }
        }

        // 2. Create parent CAROUSEL container
        const parentPayload: any = {
            media_type: "CAROUSEL",
            children: childContainerIds.join(","),
            text: postContent,
        };

        const parentRes = await fetch(THREADS_PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parentPayload),
        });

        if (!parentRes.ok) throw new Error("Failed to create Threads carousel container");
        const parentData = await parentRes.json();
        creationId = parentData.id;

    } else if (fileUrls.length > 0) {
        // --- SINGLE MEDIA / REEL LOGIC (Existing) ---
        const isVideo = job.fileTypes?.[0]?.startsWith("video/") || postType === "reel";

        const mediaPayload: any = {
            text: postContent
        };

        mediaPayload.media_type = isVideo ? "VIDEO" : "IMAGE";
        if (isVideo) mediaPayload.video_url = fileUrls[0];
        else mediaPayload.image_url = fileUrls[0];

        const containerResponse = await fetch(THREADS_PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(mediaPayload),
        });

        if (!containerResponse.ok) {
            const errorText = await containerResponse.text();
            let errorMessage = `Threads Container Creation Failed: ${containerResponse.status} ${containerResponse.statusText}.`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorData.message || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const containerData = await containerResponse.json();
        creationId = containerData.id;

        // 1.5. WAIT FOR MEDIA PROCESSING
        if (isVideo) {
            console.log(`[CRON: Threads] Waiting for video container ${creationId} processing...`);
            // FIX: Use the Threads proxy polling function
            await executeThreadsMediaPolling(creationId, pollingAccessToken);
        }

    } else {
        // --- TEXT ONLY LOGIC (Existing) ---
        const containerResponse = await fetch(THREADS_PROXY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                media_type: "TEXT",
                text: postContent,
            }),
        });

        if (!containerResponse.ok) throw new Error("Failed to create Threads text post");
        const containerData = await containerResponse.json();
        creationId = containerData.id;
    }

    // 3. Publish Threads Post (single or carousel)
    const publishResponse = await fetch(THREADS_PUBLISH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ creation_id: creationId }),
    });

    if (!publishResponse.ok) {
        const errorText = await publishResponse.text();
        let errorMessage = `Threads Publish Failed: ${publishResponse.status} ${publishResponse.statusText}.`;
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
    }

    const publishData = await publishResponse.json();
    console.log(`[CRON: Threads] Post published successfully. ID: ${publishData.id}`);
}


const executePostToFacebook = async (job: any) => {
    // This runs if Facebook is part of a multi-platform cron job
    console.log(`[CRON: Facebook] Executing post for page ${job.facebook.pageName} (Simulated)`);
    await new Promise(r => setTimeout(r, 1000));
}

// --- MAIN CRON EXECUTION ENDPOINT ---

export async function POST(request: NextRequest) {
    try {
        const job = await request.json();
        const { platformsToSchedule, scheduledTimestamp } = job;

        console.log(`[CRON EXECUTION] Received job (Time: ${new Date(scheduledTimestamp * 1000).toISOString()}) for platforms: ${platformsToSchedule.join(', ')}`);

        // In a production environment, add a security check here (e.g., secret header)

        const executionPromises = [];

        for (const platform of platformsToSchedule) {
            if (platform === "instagram" && job.instagram) {
                executionPromises.push(executeInstagramPost(job));
            } else if (platform === "pinterest" && job.pinterest) {
                executionPromises.push(executePostToPinterest(job));
            } else if (platform === "threads" && job.threads) {
                // ✅ Execute Threads Logic
                executionPromises.push(executePostToThreads(job));
            } else if (platform === "facebook" && job.facebook) {
                executionPromises.push(executePostToFacebook(job));
            }
        }

        await Promise.all(executionPromises);

        return NextResponse.json({
            success: true,
            message: "Scheduled tasks completed successfully.",
            platforms: platformsToSchedule
        }, { status: 200 })
    } catch (error) {
        console.error("CRON Execution Error:", error);
        // Return the specific error message to the Express scheduler for logging
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to execute cron task" }, { status: 500 });
    }
}