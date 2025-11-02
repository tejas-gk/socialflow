import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

/**
 * This is the main router for the EdgeStore buckets.
 */
const edgeStoreRouter = es.router({
    publicFiles: es.fileBucket()
        .beforeUpload(({ ctx, input, fileInfo }) => {
            console.log('beforeUpload', { ctx, input, fileInfo });

            // Validate file size (100MB max)
            const maxSize = 100 * 1024 * 1024 * 1024;
            if (fileInfo.size > maxSize) {
                throw new Error('File too large. Maximum size is 100MB.');
            }

            // Validate file types
            const allowedTypes = [
                'image/jpeg', 'image/jpg', 'image/png',
                'image/webp', 'image/gif', 'video/mp4',
                'video/mov', 'video/avi'
            ];
            if (!allowedTypes.includes(fileInfo.type)) {
                throw new Error('Invalid file type. Only images and videos are allowed.');
            }

            return true;
        })
        .beforeDelete(({ ctx, fileInfo }) => {
            console.log('beforeDelete', { ctx, fileInfo });
            return true;
        }),
});

const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;