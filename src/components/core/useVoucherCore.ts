import { useState, useCallback, useEffect } from 'react';
import { SysGridColumnMetadata } from './DynamicAccountingGrid';
import { useToast } from "@/components/ui/use-toast";

export interface UseVoucherCoreParams<TForm> {
    journalCode: string; // e.g. 'CR'
    emptyForm: TForm;
    fetchVoucherApi?: (id: string) => Promise<TForm>;
    executeApi?: (payload: { journalCode: string, action: string, data: TForm }) => Promise<any>;
    // Temporary for Phase 1: provide mock column data
    mockColumnMetadata?: SysGridColumnMetadata[];
}

export function useVoucherCore<TForm extends { id?: string, status?: string }>({
    journalCode,
    emptyForm,
    fetchVoucherApi,
    executeApi,
    mockColumnMetadata
}: UseVoucherCoreParams<TForm>) {
    const { toast } = useToast();
    const [form, setForm] = useState<TForm>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [columnMetadata, setColumnMetadata] = useState<SysGridColumnMetadata[]>(mockColumnMetadata || []);

    // Phase 2: Fetch column metadata 
    useEffect(() => {
        if (!mockColumnMetadata) {
            const fetchConfig = async () => {
                try {
                    const res = await fetch(`/api/vouchers/config?journalCode=${journalCode}`);
                    if (res.ok) {
                        const data = await res.json();
                        setColumnMetadata(data.columns || []);
                    } else {
                        throw new Error('Failed to load voucher configuration');
                    }
                } catch (error) {
                    toast({
                        title: "Lỗi hệ thống",
                        description: "Không thể tải cấu hình chứng từ.",
                        variant: "destructive"
                    });
                }
            };
            fetchConfig();
        } else {
            setColumnMetadata(mockColumnMetadata);
        }
    }, [journalCode, mockColumnMetadata, toast]);

    const loadVoucher = useCallback(async (id: string | null) => {
        if (!id) {
            setForm(emptyForm);
            return;
        }

        if (!fetchVoucherApi) return;

        try {
            setLoading(true);
            const data = await fetchVoucherApi(id);
            if (data) {
                setForm(data);
            }
        } catch (error) {
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể lấy thông tin chứng từ từ máy chủ.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [emptyForm, fetchVoucherApi, toast]);

    // Handle generic actions (SAVE, DELETE, COPY)
    const executeAction = useCallback(async (action: 'SAVE' | 'DELETE' | 'COPY') => {
        if (!executeApi) {
            // Provide Mock Execution for Phase 1
            if (action === 'SAVE') {
                setSaving(true);
                await new Promise(res => setTimeout(res, 500));
                setSaving(false);
                toast({ title: "Thành công", description: "Đã lưu chứng từ (Chế độ Mock)" });
            } else if (action === 'DELETE') {
                toast({ title: "Thành công", description: "Đã xoá chứng từ (Chế độ Mock)" });
            }
            return true; // Return success status
        }

        try {
            if (action === 'DELETE') {
                setDeleting(true);
            } else {
                setSaving(true);
            }

            const result = await executeApi({
                journalCode,
                action,
                data: form
            });

            toast({
                title: "Thành công",
                description: action === 'SAVE' ? "Đã lưu chứng từ" : action === 'DELETE' ? "Đã xoá chứng từ" : "Thao tác thành công"
            });
            return result;
        } catch (error: any) {
            toast({
                title: "Thao tác thất bại",
                description: error.message || "Đã xảy ra lỗi hệ thống.",
                variant: "destructive"
            });
            return null;
        } finally {
            setSaving(false);
            setDeleting(false);
        }
    }, [form, journalCode, executeApi, toast]);

    const resetForm = useCallback(() => setForm(emptyForm), [emptyForm]);

    // Helper to check if standard states
    const isPosted = form.status === 'POSTED';

    return {
        form,
        setForm,
        loading,
        saving,
        deleting,
        columnMetadata,
        loadVoucher,
        executeAction,
        resetForm,
        isPosted
    };
}
