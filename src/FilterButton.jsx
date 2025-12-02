import React from 'react';

export default function FilterButton({ active, onClick, children, className = '' }) {
  const baseStyle = 'px-2 py-1 rounded text-xs transition-all border';
  const activeStyle = active ? className : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700/50';

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${active ? className : activeStyle}`}
    >
      {children}
    </button>
  );
}
