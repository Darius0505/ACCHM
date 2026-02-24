import { listVendors } from '../../../services/vendor.service';
import PurchaseInvoiceForm from '../../../components/purchases/PurchaseInvoiceForm';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export default async function NewPurchaseInvoicePage() {
    const vendorData = await listVendors({
        companyId: COMPANY_ID,
        page: 1, limit: 100, isActive: true
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Tạo Hóa Đơn Mua Hàng</h1>
            <PurchaseInvoiceForm vendors={vendorData.items} />
        </div>
    );
}
