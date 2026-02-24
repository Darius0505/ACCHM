import fetch from 'node-fetch';

async function testDelete() {
    const res = await fetch('http://localhost:3000/api/vouchers/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            journalCode: 'PT',
            action: 'DELETE',
            data: { id: 'ed8ea0b0-6f6c-4fd7-b3aa-bdcde218817a' } // It was already deleted, we can fetch another or see error
        })
    });
    console.log(res.status, await res.text());
}
testDelete();
