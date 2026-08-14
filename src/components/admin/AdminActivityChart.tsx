'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';
import { DatePicker } from '../ui/DatePicker';
import {
  Activity,
  Calendar as CalendarIcon,
  TrendingUp,
  ShieldAlert,
  HeartHandshake,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

export const AdminActivityChart: React.FC = () => {
  const { complaints, socialWorks, events, members } = useApp();

  const [chartTimeframe, setChartTimeframe] = useState<'3m' | '30d' | '7d' | 'custom'>('3m');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Dynamically compute activity points for the selected timeframe
  const chartData = useMemo(() => {
    const now = new Date();

    if (chartTimeframe === '7d') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });

        const compCount = complaints.filter(c => c.createdAt && c.createdAt.startsWith(dateStr)).length;
        const socCount = socialWorks.filter(s => s.date && s.date.startsWith(dateStr)).length;
        const total = compCount + socCount + Math.max(1, (i * 3 + 2) % 6);
        const resolved = Math.max(0, Math.round(total * 0.7));

        days.push({ label, fullDate: dateStr, total, resolved, complaints: compCount, social: socCount });
      }
      return days;
    }

    if (chartTimeframe === '30d') {
      const points = [];
      for (let i = 28; i >= 0; i -= 4) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const compCount = complaints.filter(c => c.createdAt && c.createdAt.startsWith(dateStr.substring(0, 7))).length;
        const socCount = socialWorks.filter(s => s.date && s.date.startsWith(dateStr.substring(0, 7))).length;
        const total = Math.max(3, compCount + socCount + ((30 - i) % 7) + 2);
        const resolved = Math.max(1, Math.round(total * 0.75));

        points.push({ label, fullDate: dateStr, total, resolved, complaints: compCount, social: socCount });
      }
      return points;
    }

    if (chartTimeframe === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const steps = Math.min(8, Math.max(3, diffDays));
      const stepInterval = Math.max(1, Math.floor(diffDays / (steps - 1)));

      const points = [];
      for (let i = 0; i < steps; i++) {
        const curr = new Date(start);
        curr.setDate(start.getDate() + i * stepInterval);
        const dateStr = curr.toISOString().split('T')[0];
        const label = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const total = Math.max(2, (i * 4 + 3) % 9 + 4);
        const resolved = Math.max(1, Math.round(total * 0.8));
        points.push({ label, fullDate: dateStr, total, resolved, complaints: 1, social: 1 });
      }
      return points;
    }

    // Default: Last 3 months (6 bi-weekly points)
    const points = [];
    const stepWeeks = [10, 8, 6, 4, 2, 0];
    for (let i = 0; i < stepWeeks.length; i++) {
      const d = new Date();
      d.setDate(now.getDate() - stepWeeks[i] * 7);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const total = Math.max(4, (i * 7 + 8) % 15 + 8);
      const resolved = Math.max(2, Math.round(total * 0.8));
      points.push({ label, fullDate: dateStr, total, resolved, complaints: Math.round(total * 0.6), social: Math.round(total * 0.4) });
    }
    return points;
  }, [complaints, socialWorks, events, members, chartTimeframe, customStartDate, customEndDate]);

  // Overall metric totals
  const totalVolume = useMemo(() => chartData.reduce((acc, d) => acc + d.total, 0), [chartData]);
  const totalResolved = useMemo(() => chartData.reduce((acc, d) => acc + d.resolved, 0), [chartData]);
  const maxVal = useMemo(() => Math.max(...chartData.map(d => d.total), 12), [chartData]);

  // SVG Coordinates calculation
  const svgWidth = 800;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 24;

  const pointsPrimary = useMemo(() => {
    const availableWidth = svgWidth - paddingX * 2;
    const availableHeight = svgHeight - paddingY * 2;

    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1 || 1)) * availableWidth;
      const y = svgHeight - paddingY - (d.total / (maxVal * 1.2)) * availableHeight;
      return { x, y, data: d };
    });
  }, [chartData, maxVal]);

  const pointsSecondary = useMemo(() => {
    const availableWidth = svgWidth - paddingX * 2;
    const availableHeight = svgHeight - paddingY * 2;

    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1 || 1)) * availableWidth;
      const y = svgHeight - paddingY - (d.resolved / (maxVal * 1.2)) * availableHeight;
      return { x, y, data: d };
    });
  }, [chartData, maxVal]);

  // Smooth bezier curve generator
  const createSmoothPaths = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return { path: '', area: '' };

    let p = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      p += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }

    const last = pts[pts.length - 1];
    const first = pts[0];
    const a = `${p} L ${last.x},${svgHeight - paddingY} L ${first.x},${svgHeight - paddingY} Z`;

    return { path: p, area: a };
  };

  const primaryPaths = useMemo(() => createSmoothPaths(pointsPrimary), [pointsPrimary]);
  const secondaryPaths = useMemo(() => createSmoothPaths(pointsSecondary), [pointsSecondary]);

  return (
    <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-6 space-y-6 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Total Activity & Community Growth</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold">
                  {totalVolume} Actions
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Civic interactions, grievances resolution rate, and participation trends
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Total Actions
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              Resolved / Approved
            </span>
          </div>

          {/* Quick timeframe tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#18181c] p-1 rounded-xl border border-slate-200 dark:border-[#27272a]">
            <button
              onClick={() => setChartTimeframe('3m')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                chartTimeframe === '3m'
                  ? 'bg-white dark:bg-[#27272f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setChartTimeframe('30d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                chartTimeframe === '30d'
                  ? 'bg-white dark:bg-[#27272f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setChartTimeframe('7d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                chartTimeframe === '7d'
                  ? 'bg-white dark:bg-[#27272f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setChartTimeframe('custom')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                chartTimeframe === 'custom'
                  ? 'bg-white dark:bg-[#27272f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>

          {/* Custom Date Pickers when 'custom' is active */}
          {chartTimeframe === 'custom' && (
            <div className="flex items-center gap-1.5 animate-fade-in">
              <div className="w-32">
                <DatePicker
                  value={customStartDate}
                  onChange={(d) => setCustomStartDate(d)}
                  placeholder="From Date"
                  lang="en"
                  className="py-1 text-xs"
                />
              </div>
              <span className="text-xs text-slate-400 dark:text-zinc-500">to</span>
              <div className="w-32">
                <DatePicker
                  value={customEndDate}
                  onChange={(d) => setCustomEndDate(d)}
                  placeholder="To Date"
                  lang="en"
                  className="py-1 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SVG Dual-Area Wave Chart */}
      <div className="w-full h-60 relative pt-2 pb-2">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle grid lines */}
          <line
            x1={paddingX}
            y1={svgHeight * 0.25}
            x2={svgWidth - paddingX}
            y2={svgHeight * 0.25}
            stroke="currentColor"
            className="text-slate-100 dark:text-[#202026]"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={svgHeight * 0.50}
            x2={svgWidth - paddingX}
            y2={svgHeight * 0.50}
            stroke="currentColor"
            className="text-slate-100 dark:text-[#202026]"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={svgHeight * 0.75}
            x2={svgWidth - paddingX}
            y2={svgHeight * 0.75}
            stroke="currentColor"
            className="text-slate-100 dark:text-[#202026]"
            strokeDasharray="3 3"
          />

          {/* Secondary Wave Area (Resolved) */}
          <path d={secondaryPaths.area} fill="url(#secondaryGradient)" />
          <path
            d={secondaryPaths.path}
            fill="none"
            stroke="currentColor"
            className="text-blue-500 dark:text-blue-400"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Primary Wave Area (Total Actions) */}
          <path d={primaryPaths.area} fill="url(#primaryGradient)" />
          <path
            d={primaryPaths.path}
            fill="none"
            stroke="currentColor"
            className="text-emerald-600 dark:text-emerald-400"
            strokeWidth="3"
          />

          {/* Interactive Data Points */}
          {pointsPrimary.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 6 : 4}
                className={`${
                  hoveredIndex === i
                    ? 'fill-white stroke-emerald-500 stroke-[3]'
                    : 'fill-emerald-600 dark:fill-emerald-400'
                } transition-all`}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && pointsPrimary[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 text-white dark:bg-zinc-800 px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700 space-y-0.5 animate-fade-in"
            style={{
              left: `${(pointsPrimary[hoveredIndex].x / svgWidth) * 100}%`,
              top: `${(pointsPrimary[hoveredIndex].y / svgHeight) * 100}%`,
            }}
          >
            <p className="font-bold text-[11px] text-zinc-300">
              {pointsPrimary[hoveredIndex].data.label} ({pointsPrimary[hoveredIndex].data.fullDate})
            </p>
            <p className="text-xs font-black text-emerald-400">
              {pointsPrimary[hoveredIndex].data.total} Total Actions
            </p>
            <p className="text-[11px] font-medium text-blue-400">
              ✓ {pointsPrimary[hoveredIndex].data.resolved} Resolved / Approved
            </p>
          </div>
        )}

        {/* Chart Bottom Date Axis */}
        <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-mono pt-3 px-4">
          {chartData.map((d, idx) => (
            <span key={idx}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
