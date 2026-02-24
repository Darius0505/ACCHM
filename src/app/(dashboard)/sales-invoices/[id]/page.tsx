
import { notFound } from 'next/navigation';
import { getSalesInvoice } from '../../../services/salesInvoice.service';
import SalesInvoiceForm from '../../../components/sales/SalesInvoiceForm';
import { listCustomers } from '../../../services/customer.service';
import Link from 'next/link';
import PostButton from '../../../components/common/PostButton';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export default async function SalesInvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const invoice = await getSalesInvoice(id);

    if (!invoice) {
        notFound();
    }

    const customerData = await listCustomers({
        companyId: COMPANY_ID,
        page: 1, limit: 100, isActive: true
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="text-sm text-gray-500 mb-1">Hóa Đơn Bán Hàng / {invoice.invoiceNumber}</div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {invoice.invoiceNumber}
                        <span className={`text-base px-2 py-1 rounded font-normal
                            ${invoice.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                        `}>
                            {invoice.status}
                        </span>
                    </h1>
                </div>

                {invoice.status === 'DRAFT' && (
                    <PostButton
                        id={id}
                        endpoint={`/api/sales-invoices/${id}/post`}
                        label="Ghi Sổ Cái"
                        confirmMessage="Bạn có chắc chắn muốn Ghi sổ hóa đơn này? Hành động này không thể hoàn tác."
                    />
                )}
            </div>

            {invoice.status === 'POSTED' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6 flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-yellow-800">Đã ghi sổ cái (GL)</span>
                        <p className="text-sm text-yellow-700">Đã tạo bút toán {invoice.journalEntryId ? 'Journal Entry' : ''}</p>
                    </div>
                    {invoice.journalEntryId && (
                        <Link href={`/journal-entries/${invoice.journalEntryId}`} className="text-blue-600 underline text-sm">
                            Xem bút toán
                        </Link>
                    )}
                </div>
            )}

            {invoice.status === 'DRAFT' ? (
                <SalesInvoiceForm initialData={invoice} isEdit={true} partners={customerData.items} />
            ) : (
                <div className="bg-white p-6 rounded shadow">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="text-gray-500 text-sm">Khách hàng</label>
                            <div className="font-medium text-lg">{invoice.partner.name}</div>
                            <div className="text-gray-600">{invoice.partner.address}</div>
                        </div>
                        <div className="text-right space-y-2">
                            <div>
                                <label className="text-gray-500 text-sm">Ngày hóa đơn</label>
                                <div className="font-medium">{new Date(invoice.date).toLocaleDateString('vi-VN')}</div>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm">Hạn thanh toán</label>
                                <div className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</div>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-2">STT</th>
                                <th className="text-left p-2">Diễn giải</th>
                                <th className="text-right p-2">SL</th>
                                <th className="text-right p-2">Đơn Giá</th>
                                <th className="text-right p-2">Thuế</th>
                                <th className="text-right p-2">Thành Tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lines.map((line: any) => (
                                <tr key={line.id} className="border-b">
                                    <td className="p-2 text-center">{line.lineNumber}</td>
                                    <td className="p-2">{line.description}</td>
                                    <td className="p-2 text-right">{Number(line.quantity)}</td>
                                    <td className="p-2 text-right">{Number(line.unitPrice).toLocaleString('vi-VN')}</td>
                                    <td className="p-2 text-right">{Number(line.taxRate)}%</td>
                                    <td className="p-2 text-right font-medium">{Number(line.amount).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cộng tiền hàng:</span>
                                <span className="font-medium">{Number(invoice.subtotal).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiền thuế:</span>
                                <span className="font-medium">{Number(invoice.taxAmount).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
                                <span>TỔNG CỘNG:</span>
                                <span className="text-blue-600">{Number(invoice.totalAmount).toLocaleString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
