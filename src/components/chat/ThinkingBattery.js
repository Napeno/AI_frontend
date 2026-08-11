import React from 'react';

const ThinkingBattery = ({ level = 100 }) => {
  const safeLevel = Math.max(0, Math.min(100, Number(level) || 0));
  const color = safeLevel >= 70 ? 'bg-emerald-500' : safeLevel >= 40 ? 'bg-amber-400' : safeLevel >= 10 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="hidden items-center gap-2 sm:flex" title={`Pin tư duy: ${safeLevel}%`}>
      <span className="text-sm" aria-hidden="true">🧠</span>
      <span className="h-5 w-40 overflow-hidden rounded-md border border-slate-400 bg-white p-0.5 shadow-sm dark:border-slate-600 dark:bg-slate-900 sm:w-56 md:w-72"><span className={`block h-full rounded-[3px] transition-all duration-500 ${color}`} style={{ width: `${safeLevel}%` }} /></span>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{safeLevel}%</span>
    </div>
  );
};

export default ThinkingBattery;
