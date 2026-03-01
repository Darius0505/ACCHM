import { NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.NOTEBOOKLM_MCP_URL || 'http://localhost:8001';

/**
 * NotebookLM MCP Proxy API
 * Proxies requests to the NotebookLM MCP server
 */

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list_notebooks';

    try {
        // For HTTP transport, MCP uses JSON-RPC format
        const response = await fetch(`${MCP_SERVER_URL}/mcp/v1/tools/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: action === 'list_notebooks' ? 'notebook_list' : action,
                arguments: {}
            }),
        });

        if (!response.ok) {
            throw new Error(`MCP Server error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('NotebookLM MCP error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to NotebookLM MCP server', details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tool, arguments: args } = body;

        const response = await fetch(`${MCP_SERVER_URL}/mcp/v1/tools/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: tool,
                arguments: args || {}
            }),
        });

        if (!response.ok) {
            throw new Error(`MCP Server error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('NotebookLM MCP error:', error);
        return NextResponse.json(
            { error: 'Failed to call NotebookLM MCP tool', details: String(error) },
            { status: 500 }
        );
    }
}
