import React from 'react';
import clsx from 'clsx';

export default function Badge({ status, type }) {
  let styleClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let dotClass = 'bg-slate-400';
  let label = status || 'Normal';

  if (status === 'Aman' || type === 'success' || status === 'AMAN') {
    styleClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60';
    dotClass = 'bg-emerald-500 animate-pulse';
    label = 'Aman';
  } else if (status === 'Hampir Habis' || type === 'warning' || status === 'HAMPIR_HABIS') {
    styleClass = 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/60';
    dotClass = 'bg-amber-500 animate-ping';
    label = 'Hampir Habis';
  } else if (status === 'Habis' || type === 'danger' || status === 'HABIS') {
    styleClass = 'bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/60';
    dotClass = 'bg-red-500 animate-bounce';
    label = 'Habis';
  } else if (type === 'info') {
    styleClass = 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/60';
    dotClass = 'bg-blue-500';
  }

  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all', styleClass)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dotClass)}></span>
      {label}
    </span>
  );
}
