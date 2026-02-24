'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: string[];
}

interface Notebook {
    id: string;
    title: string;
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // State for Notebooks
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [activeNotebookId, setActiveNotebookId] = useState<string>('');
    const [isFetchingNotebooks, setIsFetchingNotebooks] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Xin chào! Tôi là AI Assistant kết nối với NotebookLM.\n\nVui lòng chọn một Notebook để bắt đầu chat với dữ liệu của bạn.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial fetch of notebooks
    useEffect(() => {
        if (isOpen && notebooks.length === 0) {
            fetchNotebooks();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchNotebooks() {
        setIsFetchingNotebooks(true);
        try {
            const res = await fetch('/api/notebooklm?action=list_notebooks');
            const data = await res.json();

            // MPC response structure: { content: [{ type: 'text', text: 'JSON_STRING' }] }
            // The tool returns a dictionary, which MCP framework serializes to a JSON string in the text field.
            if (data.content && data.content[0] && data.content[0].text) {
                try {
                    // Start by checking if it's already an object (unlikely for MCP text content)
                    // or parse the text string.
                    const result = JSON.parse(data.content[0].text);

                    if (result && Array.isArray(result.notebooks)) {
                        setNotebooks(result.notebooks);
                        if (result.notebooks.length > 0) {
                            setActiveNotebookId(result.notebooks[0].id);
                        }
                    } else if (result && result.notebooks) {
                        // Handle potential edge case where it returns a wrapped object
                        // But based on source code: return { status: 'success', notebooks: [...] }
                        // So checking result.notebooks is correct.
                    }
                } catch (parseError) {
                    console.error('Failed to parse notebook JSON', parseError);
                    // Fallback: If it IS a text table (unlikely now but safe to keep basic fallback or just log)
                }
            }
        } catch (err) {
            console.error('Failed to fetch notebooks', err);
        } finally {
            setIsFetchingNotebooks(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || loading) return;

        if (!activeNotebookId) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Vui lòng chọn một Notebook trước khi hỏi.',
                timestamp: new Date()
            }]);
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Use notebook_query with specific notebook ID
            const response = await fetch('/api/notebooklm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tool: 'notebook_query',
                    arguments: {
                        notebook_id: activeNotebookId,
                        query: input.trim()
                    }
                })
            });

            const data = await response.json();

            // Handle response content
            let answer = '';
            let sources: string[] = [];

            if (data.content && data.content[0]) {
                answer = data.content[0].text;
                // Try to extract citations if present in text or metadata
                // For now, just show the text response
            } else if (data.error) {
                answer = `⚠️ Lỗi: ${data.error}`;
            } else {
                answer = 'Không có phản hồi từ AI.';
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                sources
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Lỗi kết nối server.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }

    // Floating Button
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 group z-50"
                title="AI Assistant"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-orange-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-rose-600 via-red-600 to-orange-700 rounded-full shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                    <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
                </div>
            </button>
        );
    }

    return (
        <div
            className={`fixed z-50 transition-all duration-300 ease-out ${isMinimized
                ? 'bottom-6 right-6 w-72 h-14'
                : 'bottom-6 right-6 w-[400px] h-[600px]'
                }`}
        >
            <div className="w-full h-full backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 via-red-600 to-orange-700 p-0">
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse" />
                    </div>

                    {/* Top Bar*/}
                    <div className="relative px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                            </div>
                            <div className={isMinimized ? 'hidden' : ''}>
                                <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
                                <p className="text-[10px] text-white/80">NotebookLM Connected</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white">
                                {isMinimized ? '+' : '−'}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white">
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Notebook Selector (only when expanded) */}
                    {!isMinimized && (
                        <div className="px-4 pb-3">
                            <select
                                value={activeNotebookId}
                                onChange={(e) => setActiveNotebookId(e.target.value)}
                                className="w-full h-9 pl-3 pr-8 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg border-0 ring-1 ring-white/30 focus:ring-white/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                disabled={isFetchingNotebooks}
                            >
                                <option value="" className="text-gray-800">-- Chọn Notebook --</option>
                                {notebooks.map(nb => (
                                    <option key={nb.id} value={nb.id} className="text-gray-800">
                                        📘 {nb.id.slice(0, 8)}...
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-6 bottom-4.5 pointer-events-none text-white/70">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                {!isMinimized && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center mr-2 flex-shrink-0 shadow">
                                            <span className="text-xs text-white">AI</span>
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-rose-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center mr-2 shadow">
                                        <span className="text-xs text-white">AI</span>
                                    </div>
                                    <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm flex gap-1 items-center h-10">
                                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-75" />
                                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder={activeNotebookId ? "Hỏi gì đó về dữ liệu..." : "Chọn notebook trước khi hỏi..."}
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                                    disabled={loading || !activeNotebookId}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim() || !activeNotebookId}
                                    className="absolute right-2 top-2 w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center hover:bg-rose-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
