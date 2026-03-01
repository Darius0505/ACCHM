/**
 * StorageService — Filesystem-based image storage with Sharp compression
 * 
 * Design: Abstraction layer over local filesystem.
 * When scaling beyond 10K images, swap this implementation for S3/MinIO
 * without changing any calling code.
 */

import path from 'path';
import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';

// ─── Configuration ───────────────────────────────────────────────────────────
const DATA_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads');

export type EntityType = 'LOGO' | 'PRODUCT' | 'DOCUMENT' | 'AVATAR' | 'VOUCHER';

interface CompressionTier {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    thumbSize: number;
    thumbQuality: number;
}

const COMPRESSION_TIERS: Record<EntityType, CompressionTier> = {
    LOGO: { maxWidth: 500, maxHeight: 500, quality: 85, thumbSize: 200, thumbQuality: 70 },
    PRODUCT: { maxWidth: 1200, maxHeight: 1200, quality: 80, thumbSize: 200, thumbQuality: 70 },
    DOCUMENT: { maxWidth: 2000, maxHeight: 2800, quality: 85, thumbSize: 400, thumbQuality: 75 },
    AVATAR: { maxWidth: 400, maxHeight: 400, quality: 80, thumbSize: 128, thumbQuality: 70 },
    VOUCHER: { maxWidth: 2000, maxHeight: 2800, quality: 85, thumbSize: 400, thumbQuality: 75 },
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UploadResult {
    storagePath: string;
    thumbPath: string | null;
    mimeType: string;
    fileSize: number;
    width: number;
    height: number;
    hash: string;
}

// Helper to check if file is an image that can be processed by Sharp
function isProcessableImage(mimeType: string, filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    const imageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff'];
    return imageMimes.includes(mimeType) || ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.tiff'].includes(ext);
}

// ─── Service ─────────────────────────────────────────────────────────────────
export const StorageService = {

    /**
     * Process and store an image or document file.
     * - For images: Strips EXIF, Converts to WebP, Generates thumbnail
     * - For documents: Stores raw file as-is
     */
    async upload(
        buffer: Buffer,
        originalFilename: string,
        companyId: string,
        entityType: EntityType,
        mimeType: string = 'application/octet-stream'
    ): Promise<UploadResult> {
        const tier = COMPRESSION_TIERS[entityType];
        const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
        const folder = entityType.toLowerCase() + 's'; // logos, products, documents, avatars, vouchers

        // Ensure directories
        const origDir = path.join(DATA_DIR, companyId, folder);
        const thumbDir = path.join(DATA_DIR, companyId, folder);
        await fs.mkdir(origDir, { recursive: true });

        const isImage = isProcessableImage(mimeType, originalFilename);

        if (isImage) {
            // ─── Process original Image ────────────────────────────────────────────
            const processed = sharp(buffer)
                .rotate()                              // Auto-rotate from EXIF
                .resize(tier.maxWidth, tier.maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: tier.quality });

            const origFilename = `orig_${hash}.webp`;
            const origPath = path.join(origDir, origFilename);
            const origBuffer = await processed.toBuffer();
            const metadata = await sharp(origBuffer).metadata();

            await fs.writeFile(origPath, origBuffer);

            // ─── Generate thumbnail ──────────────────────────────────────────
            const thumbFilename = `thumb_${hash}.webp`;
            const thumbFullPath = path.join(thumbDir, thumbFilename);
            await sharp(buffer)
                .rotate()
                .resize(tier.thumbSize, tier.thumbSize, {
                    fit: 'cover',
                    position: 'center',
                })
                .webp({ quality: tier.thumbQuality })
                .toFile(thumbFullPath);

            // Relative paths for DB storage
            const storagePath = `${companyId}/${folder}/${origFilename}`;
            const thumbPath = `${companyId}/${folder}/${thumbFilename}`;

            return {
                storagePath,
                thumbPath,
                mimeType: 'image/webp',
                fileSize: origBuffer.length,
                width: metadata.width || 0,
                height: metadata.height || 0,
                hash,
            };
        } else {
            // ─── Store Raw Document (PDF, Excel, etc.) ───────────────────────
            const ext = path.extname(originalFilename);
            const origFilename = `raw_${hash}${ext}`;
            const origPath = path.join(origDir, origFilename);

            await fs.writeFile(origPath, buffer);

            const storagePath = `${companyId}/${folder}/${origFilename}`;

            return {
                storagePath,
                thumbPath: null, // No thumbnail for non-images yet
                mimeType: mimeType,
                fileSize: buffer.length,
                width: 0,
                height: 0,
                hash,
            };
        }
    },

    /**
     * Get the absolute filesystem path for a storage path.
     */
    getAbsolutePath(storagePath: string): string {
        return path.join(DATA_DIR, storagePath);
    },

    /**
     * Check if a file exists on disk.
     */
    exists(storagePath: string): boolean {
        return existsSync(path.join(DATA_DIR, storagePath));
    },

    /**
     * Create a readable stream for serving a file.
     */
    createReadStream(storagePath: string) {
        return createReadStream(path.join(DATA_DIR, storagePath));
    },

    /**
     * Delete a file from disk (hard delete).
     */
    async delete(storagePath: string): Promise<void> {
        const fullPath = path.join(DATA_DIR, storagePath);
        try {
            await fs.unlink(fullPath);
        } catch (e: any) {
            if (e.code !== 'ENOENT') throw e; // Ignore "file not found"
        }
    },

    /**
     * Get public URL for a file (for API response).
     */
    getUrl(fileId: string, variant: 'original' | 'thumb' = 'original'): string {
        return `/api/files/${fileId}${variant === 'thumb' ? '?thumb=1' : ''}`;
    },
};
