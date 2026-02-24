import { prisma } from '../lib/prisma';

interface DateRangeInput {
    companyId: string;
    startDate: Date;
    endDate: Date;
}

interface AsOfDateInput {
    companyId: string;
    asOfDate: Date;
}

export const financialReportService = {
    async getIncomeStatement({ companyId, startDate, endDate }: DateRangeInput) {
        // 1. Revenue (Type 'REVENUE' or starts with '5')
        const revenueAccounts = await prisma.account.findMany({
            where: {
                companyId,
                OR: [{ type: 'REVENUE' }, { code: { startsWith: '5' } }],
                isPosting: true
            }
        });

        // 2. COGS (Type 'COGS' or starts with '632')
        const cogsAccounts = await prisma.account.findMany({
            where: {
                companyId,
                OR: [{ type: 'EXPENSE' }, { code: { startsWith: '632' } }], // Simplified checking
                isPosting: true
            }
        });

        // 3. Expenses (Type 'EXPENSE' or starts with '64')
        const expenseAccounts = await prisma.account.findMany({
            where: {
                companyId,
                OR: [{ type: 'EXPENSE' }, { code: { startsWith: '64' } }, { code: { startsWith: '8' } }],
                isPosting: true
            }
        });

        const getAccountBalance = async (accountId: string) => {
            const result = await prisma.journalEntryLine.aggregate({
                where: {
                    accountId,
                    entry: {
                        date: { gte: startDate, lte: endDate },
                        status: 'POSTED'
                    }
                },
                _sum: { credit: true, debit: true }
            });
            return (Number(result._sum.credit) || 0) - (Number(result._sum.debit) || 0);
        };

        const getExpenseBalance = async (accountId: string) => {
            const result = await prisma.journalEntryLine.aggregate({
                where: {
                    accountId,
                    entry: {
                        date: { gte: startDate, lte: endDate },
                        status: 'POSTED'
                    }
                },
                _sum: { credit: true, debit: true }
            });
            // Expenses are Debit normal, so Debit - Credit
            return (Number(result._sum.debit) || 0) - (Number(result._sum.credit) || 0);
        }



        // Calculate Totals
        let totalRevenue = 0;
        const revenueDetails = [];
        for (const acc of revenueAccounts) {
            const balance = await getAccountBalance(acc.id); // Revenue is Credit normal
            if (balance !== 0) {
                totalRevenue += balance;
                revenueDetails.push({ ...acc, balance });
            }
        }

        let totalCOGS = 0;
        const cogsDetails = [];
        for (const acc of cogsAccounts) {
            // Filter specifically for 632 if strictly following Vietnamese chart
            if (acc.code.startsWith('632')) {
                const balance = await getExpenseBalance(acc.id);
                if (balance !== 0) {
                    totalCOGS += balance;
                    cogsDetails.push({ ...acc, balance });
                }
            }
        }

        const grossProfit = totalRevenue - totalCOGS;

        let totalExpenses = 0;
        const expenseDetails = [];
        for (const acc of expenseAccounts) {
            // Avoid double counting COGS if they were fetched in expenseAccounts query
            if (!acc.code.startsWith('632')) {
                const balance = await getExpenseBalance(acc.id);
                if (balance !== 0) {
                    totalExpenses += balance;
                    expenseDetails.push({ ...acc, balance });
                }
            }
        }

        const netIncome = grossProfit - totalExpenses;

        return {
            revenue: { total: totalRevenue, details: revenueDetails },
            cogs: { total: totalCOGS, details: cogsDetails },
            grossProfit,
            expenses: { total: totalExpenses, details: expenseDetails },
            netIncome
        };
    },

    async getBalanceSheet({ companyId, asOfDate }: AsOfDateInput) {
        // Assets (Type 'ASSET' or starts with '1', '2') - Debit normal
        // Liabilities (Type 'LIABILITY' or starts with '3', '4') - Credit normal
        // Equity (Type 'EQUITY') - Credit normal

        const assetAccounts = await prisma.account.findMany({
            where: {
                companyId,
                OR: [{ type: 'ASSET' }, { code: { startsWith: '1' } }, { code: { startsWith: '2' } }],
                isPosting: true
            }
        });

        const liabilityAccounts = await prisma.account.findMany({
            where: {
                companyId,
                OR: [{ type: 'LIABILITY' }, { code: { startsWith: '3' } }],
                isPosting: true
            }
        });

        const equityAccounts = await prisma.account.findMany({
            where: {
                companyId,
                OR: [{ type: 'EQUITY' }, { code: { startsWith: '4' } }],
                isPosting: true
            }
        });

        const getDebitBalance = async (accountId: string) => {
            const result = await prisma.journalEntryLine.aggregate({
                where: {
                    accountId,
                    entry: {
                        date: { lte: asOfDate },
                        status: 'POSTED'
                    }
                },
                _sum: { debit: true, credit: true }
            });
            return (Number(result._sum.debit) || 0) - (Number(result._sum.credit) || 0);
        };

        const getCreditBalance = async (accountId: string) => {
            const result = await prisma.journalEntryLine.aggregate({
                where: {
                    accountId,
                    entry: {
                        date: { lte: asOfDate },
                        status: 'POSTED'
                    }
                },
                _sum: { debit: true, credit: true }
            });
            return (Number(result._sum.credit) || 0) - (Number(result._sum.debit) || 0);
        };

        let totalAssets = 0;
        const assetDetails = [];
        for (const acc of assetAccounts) {
            const balance = await getDebitBalance(acc.id);
            if (Math.abs(balance) > 0.001) {
                totalAssets += balance;
                assetDetails.push({ ...acc, balance });
            }
        }

        let totalLiabilities = 0;
        const liabilityDetails = [];
        for (const acc of liabilityAccounts) {
            const balance = await getCreditBalance(acc.id);
            if (Math.abs(balance) > 0.001) {
                totalLiabilities += balance;
                liabilityDetails.push({ ...acc, balance });
            }
        }

        let totalEquity = 0;
        const equityDetails = [];
        for (const acc of equityAccounts) {
            const balance = await getCreditBalance(acc.id);
            if (Math.abs(balance) > 0.001) {
                totalEquity += balance;
                equityDetails.push({ ...acc, balance });
            }
        }

        // Calculate Net Income (Retained Earnings equivalent) for balancing if not closed
        // In a real system, you'd have closing entries. Here we simulate RE.
        // RE = Assets - Liabilities - Equity (Registered Capital etc)
        const calculatedRetainedEarnings = totalAssets - totalLiabilities - totalEquity;

        return {
            assets: { total: totalAssets, details: assetDetails },
            liabilities: { total: totalLiabilities, details: liabilityDetails },
            equity: { total: totalEquity, details: equityDetails, calculatedRetainedEarnings },
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity + calculatedRetainedEarnings
        };
    }
};
