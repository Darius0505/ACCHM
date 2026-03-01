
// Native fetch in Node.js 18+
async function createCompany() {
    try {
        const res = await fetch('http://localhost:3000/api/company', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: 'ACCHM',
                name: 'Công ty Cổ phần ACCHM',
                taxCode: '0101234567',
                address: 'Hà Nội, Việt Nam',
                phone: '0987654321',
                email: 'contact@acchm.com'
            })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

createCompany();
