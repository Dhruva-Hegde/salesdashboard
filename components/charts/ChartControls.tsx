'use client';

import React from 'react';
import { ColumnSchema } from '@/types/csv';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ChartControlsProps {
    schema: ColumnSchema[];
    xAxis: string;
    yAxis: string;
    chartType: 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'radial';
    onXAxisChange: (value: string) => void;
    onYAxisChange: (value: string) => void;
    onChartTypeChange: (value: 'bar' | 'line' | 'pie' | 'area' | 'radar' | 'radial') => void;
}

export function ChartControls({
    schema,
    xAxis,
    yAxis,
    chartType,
    onXAxisChange,
    onYAxisChange,
    onChartTypeChange
}: ChartControlsProps) {
    const numericColumns = schema.filter(col => col.type === 'number');
    const allColumns = schema;

    return (
        <div className="flex flex-wrap gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border">
            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">X-Axis</Label>
                <Select value={xAxis} onValueChange={onXAxisChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select X-Axis" />
                    </SelectTrigger>
                    <SelectContent>
                        {allColumns.map(col => (
                            <SelectItem key={col.name} value={col.name}>
                                {col.name} ({col.type})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Y-Axis</Label>
                <Select value={yAxis} onValueChange={onYAxisChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Y-Axis" />
                    </SelectTrigger>
                    <SelectContent>
                        {numericColumns.map(col => (
                            <SelectItem key={col.name} value={col.name}>
                                {col.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Chart Type</Label>
                <Select value={chartType} onValueChange={(v) => onChartTypeChange(v as any)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="radar">Radar Chart</SelectItem>
                        <SelectItem value="radial">Radial Chart</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
