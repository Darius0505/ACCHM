'use client';

import { useRouter } from 'next/navigation';

interface PostButtonProps {
    id: string;
    endpoint: string;
    label: string;
    confirmMessage?: string;
}

export default function PostButton({ id, endpoint, label, confirmMessage }: PostButtonProps) {
    const router = useRouter();

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmMessage && !confirm(confirmMessage)) return;

        try {
            const res = await fetch(endpoint, { method: 'POST' });
            if (!res.ok) {
                const err = await res.json();
                alert('Lỗi: ' + err.error);
                return;
            }
            router.refresh();
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    return (
        <button
            onClick={handlePost}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
        >
            {label}
        </button>
    );
}
