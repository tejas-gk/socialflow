import { type NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
    region:"eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

export async function POST(request: NextRequest) {
    try {
        const { fileName, fileType } = await request.json()

        if (!fileName || !fileType) {
            return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const uniqueFileName = `facebook-posts/${timestamp}-${fileName}`

        // Create S3 upload parameters
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: uniqueFileName,
            ContentType: fileType,
        }

        // Generate signed URL for upload
        const command = new PutObjectCommand(uploadParams)
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        // Generate the public URL for the uploaded file
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${uniqueFileName}`

        return NextResponse.json({
            uploadUrl: signedUrl,
            fileUrl,
            fileName: uniqueFileName,
        })
    } catch (error) {
        console.error("Error generating signed URL:", error)
        return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
    }
}
