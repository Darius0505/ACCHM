import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { numberToWordsVND } from '@/lib/numberToWords';

export interface CashPaymentPrintData {
    companyName: string;
    companyAddress: string;
    paymentNumber: string;
    date: Date;
    payeeName: string;
    payeeAddress?: string;
    reason: string;
    amount: number;
    amountInWords: string;
    attachments?: string;
    details: {
        description: string;
        debitAccount: string;
        creditAccount: string;
        amount: number;
    }[];
}

export const CashPaymentPrintTemplate = forwardRef<HTMLDivElement, { data: CashPaymentPrintData }>(({ data }, ref) => {
    return (
        <div ref={ref} className="p-8 font-serif text-black bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between mb-8">
                <div>
                    <h3 className="font-bold text-sm uppercase">{data.companyName}</h3>
                    <p className="text-xs">{data.companyAddress}</p>
                </div>
                <div className="text-center">
                    <h1 className="font-bold text-2xl uppercase mb-1">PHIẾU CHI</h1>
                    <p className="text-xs italic">Ngày {format(new Date(data.date), 'dd')} tháng {format(new Date(data.date), 'MM')} năm {format(new Date(data.date), 'yyyy')}</p>
                    <p className="text-xs mt-1">Số: <span className="font-bold">{data.paymentNumber}</span></p>
                </div>
                <div className="text-right text-xs">
                    <p>Mẫu số 02-TT</p>
                    <p>(Ban hành theo TT số 200/2014/TT-BTC</p>
                    <p>ngày 22/12/2014 của BTC)</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-6 text-sm">
                <div className="flex">
                    <span className="w-32 flex-shrink-0">Họ và tên người nhận tiền:</span>
                    <span className="font-bold border-b border-dotted border-gray-400 flex-1">{data.payeeName}</span>
                </div>
                <div className="flex">
                    <span className="w-32 flex-shrink-0">Địa chỉ:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1">{data.payeeAddress}</span>
                </div>
                <div className="flex">
                    <span className="w-32 flex-shrink-0">Lý do chi:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1">{data.reason}</span>
                </div>
                <div className="flex">
                    <span className="w-32 flex-shrink-0">Số tiền:</span>
                    <span className="font-bold border-b border-dotted border-gray-400 flex-1">
                        {new Intl.NumberFormat('vi-VN').format(data.amount)} VND
                    </span>
                </div>
                <div className="flex">
                    <span className="w-32 flex-shrink-0">Bằng chữ:</span>
                    <span className="italic border-b border-dotted border-gray-400 flex-1">{data.amountInWords}</span>
                </div>
                <div className="flex">
                    <span className="w-32 flex-shrink-0">Kèm theo:</span>
                    <span className="border-b border-dotted border-gray-400 flex-1">{data.attachments || '...................'} chứng từ gốc</span>
                </div>
            </div>

            {/* Accounting Grid (Optional check if needed for standard form, usually summary is enough but for multi-line we show it) */}
            {data.details.length > 0 && (
                <table className="w-full text-xs border-collapse border border-gray-300 mb-6">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-1">Diễn giải</th>
                            <th className="border border-gray-300 p-1 w-20 text-center">TK Nợ</th>
                            <th className="border border-gray-300 p-1 w-20 text-center">TK Có</th>
                            <th className="border border-gray-300 p-1 w-32 text-right">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.details.map((row, idx) => (
                            <tr key={idx}>
                                <td className="border border-gray-300 p-1">{row.description}</td>
                                <td className="border border-gray-300 p-1 text-center">{row.debitAccount}</td>
                                <td className="border border-gray-300 p-1 text-center">{row.creditAccount}</td>
                                <td className="border border-gray-300 p-1 text-right">{new Intl.NumberFormat('vi-VN').format(row.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Footer Signatures */}
            <div className="flex justify-between mt-8 text-xs text-center">
                <div className="w-1/5">
                    <p className="font-bold">Giám đốc</p>
                    <p className="italic">(Ký, họ tên, đóng dấu)</p>
                    <div className="h-24"></div>
                </div>
                <div className="w-1/5">
                    <p className="font-bold">Kế toán trưởng</p>
                    <p className="italic">(Ký, họ tên)</p>
                    <div className="h-24"></div>
                </div>
                <div className="w-1/5">
                    <p className="font-bold">Người lập phiếu</p>
                    <p className="italic">(Ký, họ tên)</p>
                    <div className="h-24"></div>
                </div>
                <div className="w-1/5">
                    <p className="font-bold">Người nhận tiền</p>
                    <p className="italic">(Ký, họ tên)</p>
                    <div className="h-24"></div>
                </div>
                <div className="w-1/5">
                    <p className="font-bold">Thủ quỹ</p>
                    <p className="italic">(Ký, họ tên)</p>
                    <div className="h-24"></div>
                </div>
            </div>

            <div className="mt-4 text-xs italic text-center">
                (Đã nhận đủ số tiền (viết bằng chữ): ....................................................................................................................................)
            </div>
        </div>
    );
});

CashPaymentPrintTemplate.displayName = 'CashPaymentPrintTemplate';
