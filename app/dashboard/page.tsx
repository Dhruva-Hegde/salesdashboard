'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ... (imports remain the same)
import { ColumnSchema } from '@/types/csv';
import { DynamicChart } from '@/components/charts/DynamicChart';
import { ChartControls } from '@/components/charts/ChartControls';
import { DynamicFilters } from '@/components/filters/DynamicFilters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, FileSpreadsheet, FileText, ArrowRight, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

function DashboardContent() {
    const searchParams = useSearchParams();
    const path = searchParams.get('path');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [schema, setSchema] = useState<ColumnSchema[]>([]);
    const [fileName, setFileName] = useState<string>('');

    // Chart settings
    const [xAxis, setXAxis] = useState<string>('');
    const [yAxis, setYAxis] = useState<string>('');
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'radar' | 'radial'>('bar');
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

                    // Set default axes
                    if (result.columns.length > 0) {
                        setXAxis(result.columns[0].name);
                        const numCol = result.columns.find((c: any) => c.type === 'number');
                        if (numCol) setYAxis(numCol.name);
                    }
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
            <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center justify-center text-blue-600">
                        <FileSpreadsheet className="w-12 h-12" />
                    </div>
                </div>
                <div className="text-center space-y-4 max-w-md">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 italic uppercase">CSV Insight Engine</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                        Instantly transform raw CSV data into interactive visualizations and professional analytics.
                    </p>
                    <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Auto Schema Inference
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            6+ Chart Types
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs font-semibold">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Smart Filters
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/20">
            <header className="px-6 lg:px-8 py-6 border-b flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4 space-y-1">
                    <div className="lg:hidden w-12" /> {/* Space for MobileNav button */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-blue-600/10 p-1.5 rounded-lg border border-blue-600/20">
                                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Analysis Mode</span>
                        </div>
                        <h1 className="text-xl lg:text-3xl font-black tracking-tight truncate max-w-[200px] sm:max-w-xl">{fileName}</h1>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs font-bold text-zinc-400">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Live Data
                    </div>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                        {data.length.toLocaleString()} Rows
                    </div>
                </div>
            </header>

            <div className="flex-1 px-8 py-10 space-y-10">
                {loading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase italic">Parsing Dataset</p>
                            <p className="text-zinc-500 font-medium tracking-wide">Mapping {fileName} into dynamic components...</p>
                        </div>
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="max-w-2xl mx-auto border-2 shadow-2xl bg-destructive/5">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-black uppercase tracking-tight">System Error</AlertTitle>
                        <AlertDescription className="text-zinc-600 dark:text-zinc-300 font-medium">{error}</AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
                            <div className="flex items-center gap-2 mb-6 px-2">
                                <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-lg">
                                    <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Filter Engine</h3>
                            </div>
                            <DynamicFilters
                                schema={schema}
                                rows={data}
                                filters={filters}
                                onFiltersChange={setFilters}
                            />
                        </section>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            <div className="xl:col-span-3">
                                <Card className="rounded-3xl shadow-2xl border-zinc-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between border-b bg-zinc-50/50 dark:bg-zinc-800/20 px-8 py-6">
                                        <div>
                                            <CardTitle className="text-xl font-black tracking-tight uppercase italic">{chartType} Visualization</CardTitle>
                                            <CardDescription className="text-sm font-medium">
                                                Visualizing {filteredData.length.toLocaleString()} filtered records
                                            </CardDescription>
                                        </div>
                                        <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-600/20">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="p-8 bg-white dark:bg-zinc-900 border-b">
                                            <ChartControls
                                                schema={schema}
                                                xAxis={xAxis}
                                                yAxis={yAxis}
                                                chartType={chartType}
                                                onXAxisChange={setXAxis}
                                                onYAxisChange={setYAxis}
                                                onChartTypeChange={setChartType}
                                            />
                                        </div>

                                        <div className="p-10 min-h-[500px]">
                                            <DynamicChart
                                                data={filteredData}
                                                schema={schema}
                                                xAxis={xAxis}
                                                yAxis={yAxis}
                                                chartType={chartType}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <aside className="space-y-8">
                                <div className="flex items-center gap-2 px-1">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex-1">Smart Metrics</h3>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    {schema.filter(c => c.type === 'number').map((col, idx) => (
                                        <Card key={col.name} className={cn(
                                            "group relative overflow-hidden border-none shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] rounded-3xl",
                                            idx % 3 === 0 ? "bg-blue-600 text-white" :
                                                idx % 3 === 1 ? "bg-zinc-900 text-white dark:bg-zinc-800" :
                                                    "bg-indigo-600 text-white"
                                        )}>
                                            <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all">
                                                <FileText className="w-20 h-20" />
                                            </div>
                                            <CardHeader className="pb-2 px-6 pt-6">
                                                <CardTitle className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80">{col.name} Average</CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-6 pb-6">
                                                <div className="text-4xl font-black tracking-tighter mb-1">
                                                    {filteredData.length > 0
                                                        ? (filteredData.reduce((acc, row) => acc + row[col.name], 0) / filteredData.length).toLocaleString(undefined, { maximumFractionDigits: 1 })
                                                        : '0'}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Insight calculated live</div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {schema.filter(c => c.type === 'number').length === 0 && (
                                        <div className="p-10 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">No Metrics available</p>
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}

