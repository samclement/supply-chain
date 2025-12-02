import { Sun, Thermometer, Snowflake, Building2, Box, RefreshCw, Truck, Store } from 'lucide-react';

// Temperature styling
export const tempColors = {
  // Higher-contrast in light mode, consistent subdued tones in dark mode
  ambient: {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    border: 'border-amber-400',
    text: 'text-amber-800 dark:text-amber-300',
    icon: Sun,
  },
  chilled: {
    bg: 'bg-cyan-100 dark:bg-cyan-500/20',
    border: 'border-cyan-400',
    text: 'text-cyan-800 dark:text-cyan-300',
    icon: Thermometer,
  },
  frozen: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    border: 'border-blue-400',
    text: 'text-blue-800 dark:text-blue-300',
    icon: Snowflake,
  },
};

// Node type styling
export const nodeStyles = {
  // Brighter, readable light mode backgrounds; retain rich dark mode overlays
  supplier: { bg: 'bg-emerald-50 dark:bg-emerald-900/40', border: 'border-emerald-600/60', icon: Building2, label: 'Supplier' },
  ndc: { bg: 'bg-violet-50 dark:bg-violet-900/40', border: 'border-violet-600/60', icon: Box, label: 'NDC' },
  primary: { bg: 'bg-rose-50 dark:bg-rose-900/40', border: 'border-rose-600/60', icon: RefreshCw, label: 'Primary' },
  rdc: { bg: 'bg-orange-50 dark:bg-orange-900/40', border: 'border-orange-600/60', icon: Truck, label: 'RDC' },
  store: { bg: 'bg-sky-50 dark:bg-sky-900/40', border: 'border-sky-600/60', icon: Store, label: 'Store' },
};

// Operator styling
export const operatorColors = {
  'Company A': 'ring-2 ring-green-500/50',
  'Company B': 'ring-2 ring-purple-500/50',
};
