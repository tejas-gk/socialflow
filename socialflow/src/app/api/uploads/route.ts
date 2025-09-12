// src/app/api/uploads/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        /* clientPayload?: string, */
      ) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate users before allowing them to upload files:
        // https://vercel.com/docs/storage/vercel-blob/using-blob-sdk#server-uploads
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'],
          token: process.env.BLOB_READ_WRITE_TOKEN,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // ⚠️ This is called after the file is uploaded to Vercel Blob
        // You can perform any necessary actions here, like saving the blob URL to your database.
        console.log('Blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}