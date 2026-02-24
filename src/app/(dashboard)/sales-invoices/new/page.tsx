
import SalesInvoiceForm from '../../../components/sales/SalesInvoiceForm';
import { listCustomers } from '../../../services/customer.service';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export default async function CreateSalesInvoicePage() {
    // Determine company ID logic reused

    // Fetch customers for the dropdown
    const customerData = await listCustomers({
        companyId: COMPANY_ID,
        page: 1,
        limit: 100, // Load top 100 customers initially, or verify if Search is needed in dropdown
        isActive: true
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Tạo Hóa Đơn Mới</h1>
            </div>
            <SalesInvoiceForm partners={customerData.items} />
        </div>
    );
}
