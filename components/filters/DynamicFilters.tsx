'use client';

import React, { useMemo } from 'react';
import { ColumnSchema } from '@/types/csv';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DynamicFiltersProps {
    schema: ColumnSchema[];
    rows: any[];
    filters: Record<string, any>;
    onFiltersChange: (filters: Record<string, any>) => void;
}

export function DynamicFilters({ schema, rows, filters, onFiltersChange }: DynamicFiltersProps) {
    const getDistinctValues = (column: string) => {
        const values = rows.map(row => row[column]);
        return Array.from(new Set(values)).filter(v => v !== null && v !== undefined && v !== '');
    };

    const getRange = (column: string) => {
        const values = rows.map(row => Number(row[column])).filter(v => !isNaN(v));
        if (values.length === 0) return [0, 100];
        return [Math.min(...values), Math.max(...values)];
    };

    const handleStringFilter = (column: string, value: string, checked: boolean) => {
        const current = filters[column] || [];
        let next;
        if (checked) {
            next = [...current, value];
        } else {
            next = current.filter((v: string) => v !== value);
        }
        onFiltersChange({ ...filters, [column]: next });
    };

    const clearFilters = () => {
        onFiltersChange({});
    };

    const activeFilterCount = Object.keys(filters).length;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Filters</h3>
                {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                        <FilterX className="w-3 h-3 mr-1" /> Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {schema.map(col => {
                    if (col.type === 'string') {
                        const distinct = getDistinctValues(col.name);
                        const selected = filters[col.name] || [];

                        return (
                            <div key={col.name} className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-600">{col.name}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between text-left font-normal truncate">
                                            {selected.length === 0 ? `All ${col.name}s` : `${selected.length} selected`}
                                            {selected.length > 0 && <Badge variant="secondary" className="ml-2 font-normal">{selected.length}</Badge>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-2" align="start">
                                        <div className="max-h-60 overflow-y-auto space-y-1">
                                            {distinct.map((val: any) => (
                                                <div key={val} className="flex items-center space-x-2 p-1 hover:bg-zinc-50 rounded">
                                                    <Checkbox
                                                        id={`${col.name}-${val}`}
                                                        checked={selected.includes(val)}
                                                        onCheckedChange={(checked) => handleStringFilter(col.name, val, !!checked)}
                                                    />
                                                    <Label htmlFor={`${col.name}-${val}`} className="flex-1 cursor-pointer text-sm truncate">
                                                        {val}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        );
                    }

                    if (col.type === 'number') {
                        const [min, max] = getRange(col.name);
                        const current = filters[col.name] || [min, max];

                        return (
                            <div key={col.name} className="space-y-2 px-1">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-medium text-zinc-600">{col.name}</Label>
                                    <span className="text-[10px] text-zinc-400 font-mono">{current[0]} - {current[1]}</span>
                                </div>
                                <Slider
                                    min={min}
                                    max={max}
                                    step={(max - min) / 100}
                                    value={current}
                                    onValueChange={(val) => onFiltersChange({ ...filters, [col.name]: val })}
                                    className="py-4"
                                />
                            </div>
                        );
                    }

                    if (col.type === 'date') {
                        const current = filters[col.name] || { from: undefined, to: undefined };

                        return (
                            <div key={col.name} className="space-y-2">
                                <Label className="text-xs font-medium text-zinc-600">{col.name}</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !current.from && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {current.from ? (
                                                current.to ? (
                                                    <>
                                                        {format(current.from, "LLL dd, y")} -{" "}
                                                        {format(current.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(current.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={current.from}
                                            selected={current}
                                            onSelect={(val) => onFiltersChange({ ...filters, [col.name]: val })}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
}
