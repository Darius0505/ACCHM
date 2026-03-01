
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const COMPANY_ID = 'DEFAULT_COMPANY_ID';

// GET single account
export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const account = await prisma.account.findUnique({
            where: {
                companyId_code: {
                    companyId: COMPANY_ID,
                    code: params.code
                }
            },
            include: { children: true, parent: true }
        })

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 })
        }

        return NextResponse.json(account)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
    }
}

// UPDATE account
export async function PUT(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const body = await request.json()
        const account = await prisma.account.update({
            where: {
                companyId_code: {
                    companyId: COMPANY_ID,
                    code: params.code
                }
            },
            data: {
                name: body.name,
                nameEN: body.nameEn,
                nameJP: body.nameJa,
                nameOther: body.nameKo, // Map Ko to Other or just use nameOther if passed
                type: body.type,
                nature: body.nature,
                isPosting: body.isPosting,
                parentId: body.parentId || null,
            }
        })
        return NextResponse.json(account)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
    }
}

// DELETE account
export async function DELETE(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        // 1. Find the account first to get its ID
        const account = await prisma.account.findUnique({
            where: {
                companyId_code: {
                    companyId: COMPANY_ID,
                    code: params.code
                }
            }
        })

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 })
        }

        // 2. Check if account has children using UUID
        const childCount = await prisma.account.count({
            where: { parentId: account.id }
        })

        if (childCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete account with child accounts. Delete children first.' },
                { status: 400 }
            )
        }

        // 3. Delete
        await prisma.account.delete({
            where: {
                companyId_code: {
                    companyId: COMPANY_ID,
                    code: params.code
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}
