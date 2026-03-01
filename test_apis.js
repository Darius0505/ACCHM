const http = require('http');

async function test() {
    try {
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'ADMIN_01', password: 'admin123' })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        const cookie = `token=${token}`;

        console.log('--- POSTING RECEIPT ---');
        const postRes = await fetch('http://localhost:3000/api/cash-receipts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({
                companyId: '52bc669c-d6e9-42b9-a856-73de3b04e67c',
                receiptNumber: `PC-2026-00023`,
                date: new Date(),
                payerName: "",
                amount: 1000,
                description: "Test attachment save",
                debitAccountId: "1111",
                creditAccountId: "131",
                attachments: "",
                createdBy: "ADMIN_01",
                status: "DRAFT",
                details: [{
                    debitAccountId: "1111",
                    creditAccountId: "131",
                    amount: 1000,
                    description: "Detail line"
                }]
            })
        });

        const postData = await postRes.json();
        console.log('Posted response:', postData);

        console.log('\n--- FETCHING RECEIPT ---');

        console.log('\n--- POSTING TO GENERAL LEDGER ---');
        const glRes = await fetch(`http://localhost:3000/api/cash-receipts/${postData.id}/post`, {
            method: 'POST',
            headers: { 'Cookie': cookie }
        });
        const glData = await glRes.json();
        console.log('GL Response:', glData);

        console.log('\n--- DELETING RECEIPT ---');
        const delRes = await fetch(`http://localhost:3000/api/cash-receipts/${postData.id}`, {
            method: 'DELETE',
            headers: { 'Cookie': cookie }
        });
        const delData = await delRes.json();
        console.log('Delete response:', delData);

    } catch (e) {
        console.error(e);
    }
}

test();
