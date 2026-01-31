'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, ClipboardList, User } from 'lucide-react'

interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
    matchPaths?: string[]
}

const navItems: NavItem[] = [
    {
        href: '/',
        label: '홈',
        icon: <Home className="h-5 w-5" />,
        matchPaths: ['/'],
    },
    {
        href: '/ajussi',
        label: '찾기',
        icon: <Search className="h-5 w-5" />,
        matchPaths: ['/ajussi'],
    },
    {
        href: '/mypage/requests',
        label: '의뢰',
        icon: <ClipboardList className="h-5 w-5" />,
        matchPaths: ['/mypage/requests'],
    },
    {
        href: '/mypage',
        label: '마이',
        icon: <User className="h-5 w-5" />,
        matchPaths: ['/mypage'],
    },
]

export function BottomNav() {
    const pathname = usePathname()

    const isActive = (item: NavItem) => {
        if (item.href === '/mypage' && pathname === '/mypage') return true
        if (item.href === '/mypage' && pathname?.startsWith('/mypage') && pathname !== '/mypage/requests') return true
        if (item.href === '/mypage/requests' && pathname === '/mypage/requests') return true
        if (item.href === '/' && pathname === '/') return true
        if (item.href === '/ajussi' && pathname?.startsWith('/ajussi')) return true
        return false
    }

    // Hide on admin pages
    if (pathname?.startsWith('/admin')) return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 lg:hidden">
            <div className="max-w-lg mx-auto">
                <ul className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const active = isActive(item)
                        return (
                            <li key={item.href} className="flex-1">
                                <Link
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center h-full transition-colors ${active
                                            ? 'text-primary'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={active ? 'text-primary' : 'text-gray-400'}>
                                        {item.icon}
                                    </span>
                                    <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </nav>
    )
}
