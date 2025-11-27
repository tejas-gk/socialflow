// src/app/api/social/schedule/route.ts
import { type NextRequest, NextResponse } from "next/server"

// IMPORTANT: Set this environment variable in your .env file:
// SCHEDULE_API_URL="http://localhost:4000" (or wherever your Express server runs)
const SCHEDULE_API_BASE_URL = process.env.SCHEDULE_API_URL || "http://localhost:4000"

export async function POST(request: NextRequest) {
    try {
        const scheduledPostPayload = await request.json()

        console.log("✅ Scheduled post payload received by Next.js API. Forwarding to external scheduler.")

        // Forward the full job payload to the external Express Scheduler API
        const saveResponse = await fetch(`${SCHEDULE_API_BASE_URL}/api/jobs/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // NOTE: Add an API key here in production for security
            },
            body: JSON.stringify(scheduledPostPayload)
        });

        if (!saveResponse.ok) {
            const errorText = await saveResponse.text();
            console.error("❌ Forward/Save to External Scheduler Failed. Response:", errorText);
            // Attempt to parse JSON error if possible
            let errorMessage = "Failed to save scheduled post job to scheduler.";
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // If it's not JSON, use the status text
                errorMessage = `External Scheduler Error (${saveResponse.status}): ${saveResponse.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const responseData = await saveResponse.json();
        console.log(`✅ Job successfully forwarded/saved to external scheduler. Job ID: ${responseData.jobId}`);

        return NextResponse.json({
            success: true,
            message: "Post successfully saved for scheduling. Awaiting cron execution.",
            platforms: scheduledPostPayload.platformsToSchedule,
            jobId: responseData.jobId
        }, { status: 200 })
    } catch (error) {
        console.error("Scheduler Submission Error:", error)
        return NextResponse.json({
            error: error instanceof Error ? `Failed to contact scheduler: ${error.message}` : "Failed to save post for scheduling"
        }, { status: 500 })
    }
}