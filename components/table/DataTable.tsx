'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ColumnSchema } from '@/types/csv';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableProps {
    columns: ColumnSchema[];
    data: any[];
}

export function DataTable({ columns, data }: DataTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.name));
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleColumn = (colName: string) => {
        setVisibleColumns(prev =>
            prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, data.length)} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" /> Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-sm">
                            {columns.map(col => (
                                <DropdownMenuCheckboxItem
                                    key={col.name}
                                    checked={visibleColumns.includes(col.name)}
                                    onCheckedChange={() => toggleColumn(col.name)}
                                >
                                    {col.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                            {columns.filter(c => visibleColumns.includes(c.name)).map(col => (
                                <TableHead
                                    key={col.name}
                                    className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    onClick={() => handleSort(col.name)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.name}</span>
                                        {sortConfig.key === col.name ? (
                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                        ) : (
                                            <ChevronsUpDown className="w-3 h-3 text-zinc-300" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((row, i) => (
                            <TableRow key={i}>
                                {columns.filter(c => visibleColumns.includes(c.name)).map(col => (
                                    <TableCell key={col.name} className="max-w-[200px] truncate">
                                        {col.type === 'number' ? row[col.name]?.toLocaleString() : String(row[col.name])}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {paginatedData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={visibleColumns.length} className="h-24 text-center text-zinc-500">
                                    No records matching filters
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Rows per page</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="text-sm border rounded p-1 bg-transparent"
                    >
                        {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
