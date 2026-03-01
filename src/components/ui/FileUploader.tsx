'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

export interface UploadedFile {
    id: string;      // ID from FileMetadata
    name: string;    // Original file name
    url: string;     // URL to download/view
    size: number;
    type: string;
}

interface FileUploaderProps {
    files: UploadedFile[];
    onChange: (files: UploadedFile[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    entityType?: 'VOUCHER' | 'DOCUMENT' | 'PRODUCT';
}

export function FileUploader({
    files,
    onChange,
    maxFiles = 5,
    maxSizeMB = 10,
    entityType = 'VOUCHER'
}: FileUploaderProps) {
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        if (files.length + selectedFiles.length > maxFiles) {
            toast({
                title: 'Lỗi upload',
                description: `Chỉ được tải lên tối đa ${maxFiles} file.`,
                variant: 'destructive'
            });
            return;
        }

        const validFiles = selectedFiles.filter(f => f.size <= maxSizeMB * 1024 * 1024);
        if (validFiles.length < selectedFiles.length) {
            toast({
                title: 'Lỗi dung lượng',
                description: `Một số file vượt quá dung lượng cho phép (${maxSizeMB}MB).`,
                variant: 'destructive'
            });
        }

        if (validFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const newUploadedFiles: UploadedFile[] = [];

        for (let i = 0; i < validFiles.length; i++) {
            const currentFile = validFiles[i];
            const formData = new FormData();
            formData.append('file', currentFile);
            formData.append('entityType', entityType);

            try {
                // We're not using XHR for progress tracking here to keep it simple,
                // just simulate step progress across files.
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Upload failed');
                }

                const data = await res.json();
                newUploadedFiles.push({
                    id: data.id,
                    name: currentFile.name,
                    url: data.url,
                    size: data.fileSize,
                    type: currentFile.type
                });

                setUploadProgress(((i + 1) / validFiles.length) * 100);

            } catch (error: any) {
                console.error('Upload Error:', error);
                toast({
                    title: 'Lỗi upload',
                    description: `Không thể tải lên file ${currentFile.name}: ${error.message}`,
                    variant: 'destructive'
                });
            }
        }

        if (newUploadedFiles.length > 0) {
            onChange([...files, ...newUploadedFiles]);
        }

        setIsUploading(false);
        setUploadProgress(0);

        // Reset input
        if (inputRef.current) {
            inputRef.current.value = '';
        }

    }, [files, maxFiles, maxSizeMB, entityType, onChange, toast]);

    const handleRemove = (fileId: string) => {
        // Just remove from array - cleanup in DB can be a separate process
        onChange(files.filter(f => f.id !== fileId));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                type="file"
                multiple
                ref={inputRef}
                style={{ display: 'none' }}
                onChange={handleUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
            />

            {/* Upload Button */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading || files.length >= maxFiles}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '4px', border: '1px dashed var(--border)',
                        backgroundColor: 'var(--surface-hover)', cursor: (isUploading || files.length >= maxFiles) ? 'not-allowed' : 'pointer',
                        fontSize: '12px', color: 'var(--text-secondary)',
                        opacity: (isUploading || files.length >= maxFiles) ? 0.6 : 1
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    {isUploading ? `Đang tải: ${Math.round(uploadProgress)}%` : 'Tải file đính kèm'}
                </button>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {files.map(file => (
                        <div key={file.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: '4px', fontSize: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <svg style={{ width: '16px', height: '16px', color: 'var(--primary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hover:underline">
                                    {file.name}
                                </a>
                                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({formatSize(file.size)})</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(file.id)}
                                style={{
                                    border: 'none', background: 'transparent',
                                    color: 'var(--text-muted)', cursor: 'pointer',
                                    padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                className="hover:text-red-500 hover:bg-red-50 rounded"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
