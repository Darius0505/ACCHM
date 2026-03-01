'use client';

import { useState, useEffect } from 'react';
import type { CompanyInfo } from '@/lib/pdf/types';

/**
 * Fetch an image from a relative URL and convert it to a PNG base64 data URI.
 * 
 * @react-pdf/renderer only supports PNG and JPEG formats.
 * Since uploaded logos may be in WebP or other formats, we convert
 * via an HTML Canvas element which outputs as PNG.
 */
async function fetchImageAsPngDataUri(relativeUrl: string): Promise<string | undefined> {
    try {
        const res = await fetch(relativeUrl);
        if (!res.ok) return undefined;

        const blob = await res.blob();
        const bitmapUrl = URL.createObjectURL(blob);

        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(undefined);
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    // Always output as PNG — guaranteed supported by @react-pdf/renderer
                    const pngDataUri = canvas.toDataURL('image/png');
                    resolve(pngDataUri);
                } catch {
                    resolve(undefined);
                } finally {
                    URL.revokeObjectURL(bitmapUrl);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(bitmapUrl);
                resolve(undefined);
            };
            img.src = bitmapUrl;
        });
    } catch {
        return undefined;
    }
}

/**
 * Hook to fetch company information for reports.
 * Automatically converts the logo to a PNG base64 data URI
 * for compatibility with @react-pdf/renderer.
 */
export function useCompanyInfo() {
    const [company, setCompany] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchCompany() {
            try {
                setLoading(true);
                const res = await fetch('/api/company');
                if (!res.ok) throw new Error('Failed to fetch company info');
                const data = await res.json();

                // Convert logo to PNG data URI for PDF rendering
                let logoPngDataUri: string | undefined;
                if (data.logo) {
                    logoPngDataUri = await fetchImageAsPngDataUri(data.logo);
                }

                if (!cancelled) {
                    setCompany({
                        id: data.id,
                        name: data.name || '',
                        address: data.address || '',
                        taxCode: data.taxCode || undefined,
                        phone: data.phone || undefined,
                        email: data.email || undefined,
                        fax: data.fax || undefined,
                        website: data.website || undefined,
                        logo: logoPngDataUri,
                        directorName: data.directorName || undefined,
                        chiefAccountantName: data.chiefAccountantName || undefined,
                    });
                    setError(null);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchCompany();
        return () => { cancelled = true; };
    }, []);

    return { company, loading, error };
}
