
'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'

const LANGUAGES = [
    { code: 'vi', name: '🇻🇳 Tiếng Việt' },
    { code: 'en', name: '🇺🇸 English' },
    { code: 'ja', name: '🇯🇵 日本語' },
    { code: 'ko', name: '🇰🇷 한국어' },
]

interface LanguageSwitcherProps {
    currentLocale: string
    onChange: (locale: string) => void
}

export default function LanguageSwitcher({ currentLocale, onChange }: LanguageSwitcherProps) {
    return (
        <select
            value={currentLocale}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                    {lang.name}
                </option>
            ))}
        </select>
    )
}
