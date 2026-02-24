
import React from 'react'
import prisma from '@/lib/prisma'
import AccountsClientPage from './AccountsClientPage'

async function getAccounts() {
    try {
        const accounts = await prisma.account.findMany({
            orderBy: { code: 'asc' },
        })
        return accounts
    } catch (error) {
        console.error('Database Error:', error)
        return []
    }
}

export default async function AccountsPage() {
    const accounts = await getAccounts()

    return <AccountsClientPage initialAccounts={accounts} />
}
