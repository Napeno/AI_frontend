import React from 'react';

const ThinkingBattery = ({ level = 100 }) => {
  const safeLevel = Math.max(0, Math.min(100, Number(level) || 0));
  const color = safeLevel >= 70 ? 'bg-emerald-500' : safeLevel >= 40 ? 'bg-amber-400' : safeLevel >= 10 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="chat-thinking-battery flex shrink-0 items-center gap-1 sm:gap-2" title={`Năng lượng tư duy: ${safeLevel}%`}>
      <span className="hidden text-sm xs:inline" aria-hidden="true">🧠</span>
      <span className="h-3.5 w-12 overflow-hidden rounded border border-slate-400 bg-white p-0.5 shadow-sm xs:w-16 sm:h-5 sm:w-40 sm:rounded-md dark:border-slate-600 dark:bg-slate-900"><span className={`block h-full rounded-[3px] transition-all duration-500 ${color}`} style={{ width: `${safeLevel}%` }} /></span>
      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 sm:text-xs">{safeLevel}%</span>
    </div>
  );
};

export default ThinkingBattery;
