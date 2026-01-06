'use client';

import React from 'react';
import { FileTree } from './FileTree';
import { LayoutDashboard, Table, Settings } from 'lucide-react';
import { ModeToggle } from '../ModeToggle';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isMobile?: boolean;
}

export function Sidebar({ isMobile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [selectedCSV, setSelectedCSV] = React.useState<string | undefined>();

    const searchParams = useSearchParams();
    const selectedPath = searchParams.get('path') || undefined;

    const handleSelectCSV = (path: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('path', path);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className={cn(
            "w-64 h-screen border-r flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden",
            !isMobile && "hidden lg:flex"
        )}>
            <div className="p-4 border-b flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    CSV Analytics
                </h1>
                <ModeToggle />
            </div>

            <div className="p-2 space-y-1">
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname.startsWith('/dashboard')
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/table"
                    className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname.startsWith('/table')
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    )}
                >
                    <Table className="w-4 h-4" />
                    <span>Table View</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
                <FileTree
                    onSelectCSV={handleSelectCSV}
                    selectedPath={selectedPath}
                />
            </div>
        </div>
    );
}
