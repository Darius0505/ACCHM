import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import {
    Root as DialogRoot,
    Portal as DialogPortal,
    Overlay as DialogOverlay,
    Content as DialogContent,
    Close as DialogClose,
} from "@radix-ui/react-dialog";
import { cn } from '@/lib/utils';

// Static Groups
const SUBJECT_GROUPS = [
    { id: 'CUSTOMER', name: 'Khách hàng', code: 'KH' },
    { id: 'VENDOR', name: 'Nhà cung cấp', code: 'NCC' },
    { id: 'EMPLOYEE', name: 'Nhân viên', code: 'NV' },
    { id: 'BANK', name: 'Ngân hàng', code: 'NH' },
    { id: 'OTHER', name: 'Khác', code: 'K' }
];

interface SubjectType {
    id: string;
    code: string;
    name: string;
    nature?: string; // Added nature
}

interface Subject {
    id: string;
    code?: string;
    name: string;
    address?: string;
    phone?: string;
    taxCode?: string;
}

interface SubjectSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (subject: Subject, type: SubjectType) => void;
    initialType?: string; // [New] Pre-selected type
}

export default function SubjectSelectorModal({ isOpen, onClose, onSelect, initialType }: SubjectSelectorModalProps) {
    // Stage 1: Subject Type
    const [selectedTypeId, setSelectedTypeId] = useState<string>('');

    // Stage 2: Subjects
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeSearch !== searchTerm) {
                setActiveSearch(searchTerm);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle Open & Initial Type
    useEffect(() => {
        if (isOpen) {
            // If initialType provided, set it. Otherwise default to CUSTOMER
            if (initialType) {
                // Check if initialType is one of our groups
                const group = SUBJECT_GROUPS.find(g => g.id === initialType);
                if (group) setSelectedTypeId(group.id);
                else setSelectedTypeId('CUSTOMER');
            } else if (!selectedTypeId) {
                setSelectedTypeId('CUSTOMER');
            }
        }
    }, [isOpen, initialType]);

    // Fetch Subjects when Type changes or Search changes
    useEffect(() => {
        if (selectedTypeId) {
            fetchSubjects();
        } else {
            setSubjects([]);
        }
    }, [selectedTypeId, activeSearch]);

    async function fetchSubjects() {
        setLoadingSubjects(true);
        try {
            const params = new URLSearchParams();
            // Use 'type' (nature) for filtering
            if (selectedTypeId) params.set('type', selectedTypeId);
            if (activeSearch) params.set('search', activeSearch);

            const res = await fetch(`/api/partners?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch partners', error);
        } finally {
            setLoadingSubjects(false);
        }
    }

    const handleSelect = (subject: Subject) => {
        const type = SUBJECT_GROUPS.find(t => t.id === selectedTypeId);
        if (type) {
            onSelect(subject, type);
            onClose();
        }
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay
                    className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                />
                <DialogContent
                    className="fixed z-[9999] inset-0 m-auto h-[85vh] w-full max-w-4xl shadow-2xl duration-200 animate-in fade-in-0 zoom-in-95 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    {/* Modal Internal Layout */}
                    <div className="flex flex-col h-full w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Chọn Đối Tượng</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tìm kiếm khách hàng, nhà cung cấp hoặc nhân viên</p>
                            </div>
                            <DialogClose
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </DialogClose>
                        </div>

                        {/* Search & Filters */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                            <div className="flex gap-3">
                                <div className="w-[200px] shrink-0">
                                    <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                                        <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10">
                                            <SelectValue placeholder="Loại đối tượng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SUBJECT_GROUPS.map(type => (
                                                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        autoFocus
                                        placeholder="Tìm theo tên, mã số, số điện thoại..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10 focus-visible:ring-offset-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-auto bg-white dark:bg-slate-950 p-0 min-h-0">
                            {loadingSubjects ? (
                                <div className="space-y-2 p-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex gap-4 animate-pulse">
                                            <div className="h-8 w-1/6 bg-slate-100 dark:bg-slate-800 rounded" />
                                            <div className="h-8 w-2/6 bg-slate-100 dark:bg-slate-800 rounded" />
                                            <div className="h-8 w-2/6 bg-slate-100 dark:bg-slate-800 rounded" />
                                            <div className="h-8 w-1/6 bg-slate-100 dark:bg-slate-800 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : subjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-full mb-3">
                                        <Search className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-medium text-slate-600 dark:text-slate-300">Không tìm thấy kết quả</p>
                                    <p className="text-sm mt-1">Thử từ khóa khác hoặc thêm mới đối tượng</p>
                                </div>
                            ) : (
                                <div className="min-w-full inline-block align-middle">
                                    <div className="grid grid-cols-12 gap-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 shadow-sm">
                                        <div className="col-span-2 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mã số</div>
                                        <div className="col-span-4 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-200 dark:border-slate-800">Tên đối tượng</div>
                                        <div className="col-span-4 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-200 dark:border-slate-800">Địa chỉ</div>
                                        <div className="col-span-2 px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right border-l border-slate-200 dark:border-slate-800">Liên hệ</div>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {subjects.map((subject, index) => (
                                            <div
                                                key={subject.id}
                                                onClick={() => handleSelect(subject)}
                                                className={cn(
                                                    "group grid grid-cols-12 gap-0 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20",
                                                    index % 2 === 0 ? "bg-white dark:bg-slate-950" : "bg-slate-50/50 dark:bg-slate-900/20"
                                                )}
                                            >
                                                <div className="col-span-2 px-4 py-3 font-mono text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                    {subject.code || '---'}
                                                </div>
                                                <div className="col-span-4 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate border-l border-transparent">
                                                    {subject.name}
                                                </div>
                                                <div className="col-span-4 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 truncate border-l border-transparent">
                                                    {subject.address || <span className="text-slate-300 italic">Chưa có địa chỉ</span>}
                                                </div>
                                                <div className="col-span-2 px-4 py-3 text-sm text-right text-slate-500 dark:text-slate-400 truncate border-l border-transparent">
                                                    {subject.phone || subject.taxCode || '---'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">F3</span>
                                <span>Mở tìm kiếm</span>
                                <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono ml-2">ESC</span>
                                <span>Đóng</span>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.alert('Tính năng thêm nhanh đang phát triển')}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Thêm đối tượng mới
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </DialogPortal>
        </DialogRoot>
    );
}
