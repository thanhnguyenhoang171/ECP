'use client';

import React, { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { ChartDataPoint } from '../types/dashboard.interface';

interface RevenueChartProps {
  data?: ChartDataPoint[];
}

const DEFAULT_DATA: ChartDataPoint[] = [
  { label: 'Th1', revenue: 0, profit: 0 },
  { label: 'Th2', revenue: 0, profit: 0 },
  { label: 'Th3', revenue: 0, profit: 0 },
  { label: 'Th4', revenue: 0, profit: 0 },
  { label: 'Th5', revenue: 0, profit: 0 },
  { label: 'Th6', revenue: 0, profit: 0 },
  { label: 'Th7', revenue: 0, profit: 0 },
  { label: 'Th8', revenue: 0, profit: 0 },
  { label: 'Th9', revenue: 0, profit: 0 },
  { label: 'Th10', revenue: 0, profit: 0 },
  { label: 'Th11', revenue: 0, profit: 0 },
  { label: 'Th12', revenue: 0, profit: 0 },
];

export default function RevenueChart({ data = DEFAULT_DATA }: RevenueChartProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_DATA;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 600;
  const height = 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const rawMax = Math.max(
    10,
    ...chartData.map((d) => Math.max(d.revenue || 0, d.profit || 0))
  );
  // Round up to nice number
  const maxVal = Math.ceil(rawMax * 1.15) || 10;

  // Calculate coordinates
  const points = chartData.map((d, i) => {
    const divisor = Math.max(1, chartData.length - 1);
    const x = paddingLeft + (i / divisor) * chartWidth;
    const yRevenue = height - paddingBottom - ((d.revenue || 0) / maxVal) * chartHeight;
    const yProfit = height - paddingBottom - ((d.profit || 0) / maxVal) * chartHeight;
    return { x, yRevenue, yProfit };
  });

  // SVG Path generator
  const getLinePath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');
  };

  const getAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const linePath = getLinePath(coords);
    return `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;
  };

  const revenueCoords = points.map((p) => ({ x: p.x, y: p.yRevenue }));
  const profitCoords = points.map((p) => ({ x: p.x, y: p.yProfit }));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setHoveredIndex(closestIndex);

    const tooltipX = e.clientX - rect.left + 15;
    const tooltipY = e.clientY - rect.top - 85;
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const formatAxisNumber = (val: number) => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${Math.round(val / 1_000_000)}M`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
    return `${Math.round(val)}`;
  };

  return (
    <div ref={containerRef} className="relative w-full h-[250px] select-none font-sans">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - paddingBottom - ratio * chartHeight;
          const val = ratio * maxVal;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                className="text-[10px] font-semibold fill-slate-400 text-right"
                textAnchor="end"
              >
                {formatAxisNumber(val)}
              </text>
            </g>
          );
        })}

        {/* Areas */}
        <path d={getAreaPath(revenueCoords)} fill="url(#colorRevenue)" />
        <path d={getAreaPath(profitCoords)} fill="url(#colorProfit)" />

        {/* Lines */}
        <path d={getLinePath(revenueCoords)} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" />
        <path d={getLinePath(profitCoords)} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" />

        {/* Labels */}
        {chartData.map((item, i) => {
          const pt = points[i];
          if (!pt) return null;
          return (
            <text
              key={i}
              x={pt.x}
              y={height - 10}
              className="text-[10px] font-semibold fill-slate-400"
              textAnchor="middle"
            >
              {item.label}
            </text>
          );
        })}

        {/* Hover vertical bar indicator */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <line
            x1={points[hoveredIndex].x}
            y1={paddingTop}
            x2={points[hoveredIndex].x}
            y2={height - paddingBottom}
            stroke="#94A3B8"
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />
        )}

        {/* Data points dots */}
        {points.map((pt, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.yRevenue}
                r={isHovered ? 6 : 4}
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
              <circle
                cx={pt.x}
                cy={pt.yProfit}
                r={isHovered ? 6 : 4}
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>

      {/* Dynamic floating HTML Tooltip */}
      {hoveredIndex !== null && chartData[hoveredIndex] && (
        <div
          className="absolute z-30 bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs w-48 text-left transition-all duration-75 pointer-events-none backdrop-blur-sm"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 mb-1.5 flex items-center justify-between">
            <span>{chartData[hoveredIndex].label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Doanh thu:
              </span>
              <span className="font-mono font-bold text-blue-400">
                {formatCurrency(chartData[hoveredIndex].revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Lợi nhuận:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(chartData[hoveredIndex].profit || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80 mt-1">
              <span className="text-slate-500 text-[10px]">Tỷ suất biên:</span>
              <span className="font-mono font-bold text-indigo-400 text-[10px]">
                {chartData[hoveredIndex].revenue > 0
                  ? `${Math.round(((chartData[hoveredIndex].profit || 0) / chartData[hoveredIndex].revenue) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Legends */}
      <div className="absolute top-2 right-4 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <span className="w-3 h-1.5 rounded bg-blue-500 inline-block" />
          Doanh thu
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <span className="w-3 h-1.5 rounded bg-emerald-500 inline-block" />
          Lợi nhuận
        </div>
      </div>
    </div>
  );
}
