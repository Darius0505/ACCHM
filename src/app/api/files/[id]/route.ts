/**
 * GET /api/files/[id] — Serve a stored file
 * 
 * Query params:
 *   ?thumb=1  — serve thumbnail instead of original
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StorageService } from '@/lib/storage';
import { readFile } from 'fs/promises';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const file = await prisma.fileMetadata.findUnique({
            where: { id: params.id },
        });

        if (!file || file.deletedAt) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const wantThumb = request.nextUrl.searchParams.get('thumb') === '1';
        const storagePath = (wantThumb && file.thumbPath) ? file.thumbPath : file.storagePath;

        if (!StorageService.exists(storagePath)) {
            return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
        }

        const buffer = await readFile(StorageService.getAbsolutePath(storagePath));

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': file.mimeType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=604800, immutable', // 7 days, content-hash URL
                'ETag': `"${file.hash}"`,
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
    }
}

/**
 * DELETE /api/files/[id] — Soft-delete a file
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const file = await prisma.fileMetadata.findUnique({
            where: { id: params.id },
        });

        if (!file || file.deletedAt) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Soft delete — keep files on disk for recovery
        await prisma.fileMetadata.update({
            where: { id: params.id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
