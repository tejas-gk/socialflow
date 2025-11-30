import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

// Initialize EdgeStore
const es = initEdgeStore.create();

// Define your bucket
const edgeStoreRouter = es.router({
    publicFiles: es.fileBucket()
        .beforeUpload(({ ctx, input, fileInfo }) => {
            console.log('Uploading file:', fileInfo);

            // Validate file size (100MB max)
            const maxSize = 100 * 1024 * 1024;
            if (fileInfo.size > maxSize) {
                throw new Error('File too large. Maximum size is 100MB.');
            }

            // Validate file types
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/mov', 'video/avi'];
            if (!allowedTypes.includes(fileInfo.type)) {
                throw new Error('Invalid file type. Only images and videos are allowed.');
            }

            return true;
        })
        .beforeDelete(({ ctx, fileInfo }) => {
            console.log('Deleting file:', fileInfo);
            return true;
        }),
});

// Create the handler
const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
    // Add your secret key here
    secret: process.env.EDGESTORE_SECRET_KEY!,
});

export { handler as GET, handler as POST };