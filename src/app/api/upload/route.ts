/**
 * POST /api/upload — Upload an image with Sharp compression
 * 
 * Body: multipart/form-data
 *   - file: File (required)
 *   - entityType: "LOGO" | "PRODUCT" | "DOCUMENT" | "AVATAR" (optional, default "LOGO")
 *   - entityId: string (optional, FK to owning entity)
 *   - companyId: string (optional, auto-detected if not provided)
 * 
 * Returns: { id, url, thumbUrl, fileSize, width, height }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StorageService, EntityType } from '@/lib/storage';

const ALLOWED_TYPES = [
    // Images
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB (will be compressed down to ~200KB)

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Supported: Images, PDF, Word, Excel, ZIP.' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB.` },
                { status: 400 }
            );
        }

        // Parse context params
        const entityType = (formData.get('entityType') as EntityType) || 'LOGO';
        const entityId = formData.get('entityId') as string | null;
        let companyId = formData.get('companyId') as string | null;

        // Auto-detect company if not provided
        if (!companyId) {
            const company = await prisma.company.findFirst();
            if (!company) {
                return NextResponse.json({ error: 'No company found' }, { status: 400 });
            }
            companyId = company.id;
        }

        // Read file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Process & store via StorageService
        const result = await StorageService.upload(buffer, file.name, companyId, entityType, file.type);

        // Save metadata to DB
        const fileMeta = await prisma.fileMetadata.create({
            data: {
                companyId,
                fileName: file.name,
                storagePath: result.storagePath,
                thumbPath: result.thumbPath,
                mimeType: result.mimeType,
                fileSize: result.fileSize,
                width: result.width,
                height: result.height,
                hash: result.hash,
                entityType,
                entityId,
            },
        });

        // Build response URLs
        const url = StorageService.getUrl(fileMeta.id, 'original');
        const thumbUrl = result.thumbPath ? StorageService.getUrl(fileMeta.id, 'thumb') : null;

        return NextResponse.json({
            id: fileMeta.id,
            url,
            thumbUrl,
            fileSize: result.fileSize,
            width: result.width,
            height: result.height,
            // Legacy compatibility: keep the flat `url` field for existing code
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
