"use client"

import React, { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface PremiumBarChartProps {
    data: any[];
    title: string;
    description?: string;
    dataKey: string;
    categoryKey?: string;
    color?: string;
}

export default function PremiumBarChart({
    data,
    title,
    description,
    dataKey,
    categoryKey = "name",
    color = "#3b82f6"
}: PremiumBarChartProps) {

    // Generate gradients
    const gradientId = `barGradient-${title.replace(/\s/g, '')}`;

    return (
        <div className="shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-default-900 tracking-tight">{title}</h3>
                {description && <p className="text-xs font-medium text-slate-500 dark:text-default-500">{description}</p>}
            </div>
            <div className="p-5 pt-0">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                            <XAxis
                                dataKey={categoryKey}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-default-100 p-3 shadow-xl rounded-xl">
                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-default-500 uppercase tracking-wider mb-1">{label}</p>
                                                <p className="text-base font-bold text-slate-800 dark:text-default-900">
                                                    {Number(payload[0].value).toLocaleString()}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey={dataKey}
                                fill={`url(#${gradientId})`}
                                radius={[4, 4, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
