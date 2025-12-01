import { Sun, Thermometer, Snowflake, Building2, Box, RefreshCw, Truck, Store } from 'lucide-react';

// Temperature styling
export const tempColors = {
  ambient: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', icon: Sun },
  chilled: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', icon: Thermometer },
  frozen: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', icon: Snowflake },
};

// Node type styling
export const nodeStyles = {
  supplier: { bg: 'bg-emerald-900/40', border: 'border-emerald-500/60', icon: Building2, label: 'Supplier' },
  ndc: { bg: 'bg-violet-900/40', border: 'border-violet-500/60', icon: Box, label: 'NDC' },
  primary: { bg: 'bg-rose-900/40', border: 'border-rose-500/60', icon: RefreshCw, label: 'Primary' },
  rdc: { bg: 'bg-orange-900/40', border: 'border-orange-500/60', icon: Truck, label: 'RDC' },
  store: { bg: 'bg-sky-900/40', border: 'border-sky-500/60', icon: Store, label: 'Store' },
};

// Operator styling
export const operatorColors = {
  'Company A': 'ring-2 ring-green-500/50',
  'Company B': 'ring-2 ring-purple-500/50',
};
