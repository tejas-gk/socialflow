'use client';

import { type EdgeStoreRouter } from '../app/api/edgestore/[...edgestore]/route';
import { createEdgeStoreProvider } from '@edgestore/react';

const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider<EdgeStoreRouter>({
    // The base URL of your EdgeStore API
    baseUrl: process.env.NEXT_PUBLIC_EDGE_STORE_URL ?? 'http://localhost:3001',
});

export { EdgeStoreProvider, useEdgeStore };