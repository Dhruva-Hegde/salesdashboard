'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ColumnSchema } from '@/types/csv';
import { DataTable } from '@/components/table/DataTable';
import { DynamicFilters } from '@/components/filters/DynamicFilters';
import { Loader2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function TableContent() {
    const searchParams = useSearchParams();
    const path = searchParams.get('path');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [schema, setSchema] = useState<ColumnSchema[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [filters, setFilters] = useState<Record<string, any>>({});

    useEffect(() => {
        if (!path) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/csv?path=${path}`);
                const result = await res.json();

                if (res.ok) {
                    setData(result.rows);
                    setSchema(result.columns);
                    setFileName(result.fileName);
                    setFilters({}); // Reset filters on file change
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [path]);

    const filteredData = useMemo(() => {
        return data.filter(row => {
            return Object.entries(filters).every(([colName, filterValue]) => {
                const colSchema = schema.find(s => s.name === colName);
                if (!colSchema) return true;

                const rowValue = row[colName];

                if (colSchema.type === 'string') {
                    return filterValue.length === 0 || filterValue.includes(rowValue);
                }

                if (colSchema.type === 'number') {
                    const [min, max] = filterValue;
                    return rowValue >= min && rowValue <= max;
                }

                if (colSchema.type === 'date') {
                    const { from, to } = filterValue;
                    if (!from) return true;
                    const d = new Date(rowValue);
                    if (!to) return d.getTime() >= from.getTime();
                    return d.getTime() >= from.getTime() && d.getTime() <= to.getTime();
                }

                return true;
            });
        });
    }, [data, filters, schema]);

    if (!path) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Select a CSV to view table</h1>
                    <p className="text-zinc-500 max-w-sm">Choose a file from the sidebar to view its raw data in a sortable and paginated table.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-6 border-b flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
                <div>
                    <h1 className="text-2xl font-bold truncate">{fileName}</h1>
                    <p className="text-sm text-zinc-500">Data Table View</p>
                </div>
            </header>

            <div className="flex-1 p-6 space-y-6">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 font-medium">Loading records...</span>
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <div className="bg-white dark:bg-zinc-950 border rounded-xl overflow-hidden shadow-sm">
                            <DynamicFilters
                                schema={schema}
                                rows={data}
                                filters={filters}
                                onFiltersChange={setFilters}
                            />
                        </div>

                        <div className="bg-white dark:bg-zinc-950 border rounded-xl p-4 shadow-sm">
                            <DataTable columns={schema} data={filteredData} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function TablePage() {
    return (
        <Suspense fallback={
            <div className="h-full flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <TableContent />
        </Suspense>
    );
}

