import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Filter, Layers, Map, GitBranch, Users, Cpu, Eye, EyeOff, ZoomIn, ZoomOut, Box, Truck, Store, Building2, Snowflake, Thermometer, Sun, ArrowRight, ArrowDown, Database, RefreshCw } from 'lucide-react';

// Data Models
const supplyChainData = {
  nodes: [
    // Suppliers
    { id: 'sup1', type: 'supplier', name: 'Fresh Foods Ltd', temp: ['chilled', 'ambient'], operator: null, location: 'Manchester', systems: ['SAP', 'EDI Gateway'] },
    { id: 'sup2', type: 'supplier', name: 'Frozen Goods Co', temp: ['frozen'], operator: null, location: 'Leeds', systems: ['Oracle', 'EDI Gateway'] },
    { id: 'sup3', type: 'supplier', name: 'Ambient Supplies', temp: ['ambient'], operator: null, location: 'Birmingham', systems: ['Custom ERP'] },
    
    // NDCs
    { id: 'ndc1', type: 'ndc', name: 'National DC North', temp: ['ambient', 'frozen'], operator: 'Company A', location: 'Doncaster', systems: ['WMS-A', 'TMS', 'Stock System'] },
    { id: 'ndc2', type: 'ndc', name: 'National DC South', temp: ['ambient', 'frozen'], operator: 'Company B', location: 'Milton Keynes', systems: ['WMS-B', 'TMS', 'Stock System'] },
    
    // Primaries (Cross-docking chilled)
    { id: 'pri1', type: 'primary', name: 'Primary Hub North', temp: ['chilled'], operator: 'Company A', location: 'Sheffield', systems: ['Cross-Dock System', 'TMS'] },
    { id: 'pri2', type: 'primary', name: 'Primary Hub South', temp: ['chilled'], operator: 'Company B', location: 'Reading', systems: ['Cross-Dock System', 'TMS'] },
    
    // RDCs
    { id: 'rdc1', type: 'rdc', name: 'Regional DC Scotland', temp: ['ambient', 'chilled', 'frozen'], operator: 'Company A', location: 'Glasgow', systems: ['WMS-A', 'Allocation Engine'] },
    { id: 'rdc2', type: 'rdc', name: 'Regional DC Midlands', temp: ['ambient', 'chilled', 'frozen'], operator: 'Company A', location: 'Nottingham', systems: ['WMS-A', 'Allocation Engine'] },
    { id: 'rdc3', type: 'rdc', name: 'Regional DC South West', temp: ['ambient', 'chilled', 'frozen'], operator: 'Company B', location: 'Bristol', systems: ['WMS-B', 'Allocation Engine'] },
    
    // Stores
    { id: 'store1', type: 'store', name: 'Store Glasgow Central', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Glasgow', systems: ['POS', 'Stock Counter', 'Ordering System'] },
    { id: 'store2', type: 'store', name: 'Store Edinburgh', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Edinburgh', systems: ['POS', 'Stock Counter', 'Ordering System'] },
    { id: 'store3', type: 'store', name: 'Store Birmingham', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Birmingham', systems: ['POS', 'Stock Counter', 'Ordering System'] },
    { id: 'store4', type: 'store', name: 'Store Bristol', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Bristol', systems: ['POS', 'Stock Counter', 'Ordering System'] },
  ],
  
  flows: [
    // Supplier to NDC/Primary
    { id: 'f1', from: 'sup1', to: 'pri1', type: 'inbound', hasASN: true, temp: 'chilled' },
    { id: 'f2', from: 'sup1', to: 'ndc1', type: 'inbound', hasASN: true, temp: 'ambient' },
    { id: 'f3', from: 'sup2', to: 'ndc1', type: 'inbound', hasASN: false, temp: 'frozen' },
    { id: 'f4', from: 'sup3', to: 'ndc2', type: 'inbound', hasASN: true, temp: 'ambient' },
    { id: 'f5', from: 'sup1', to: 'pri2', type: 'inbound', hasASN: true, temp: 'chilled' },
    
    // NDC to RDC
    { id: 'f6', from: 'ndc1', to: 'rdc1', type: 'transfer', temp: 'ambient' },
    { id: 'f7', from: 'ndc1', to: 'rdc1', type: 'transfer', temp: 'frozen' },
    { id: 'f8', from: 'ndc1', to: 'rdc2', type: 'transfer', temp: 'ambient' },
    { id: 'f9', from: 'ndc2', to: 'rdc3', type: 'transfer', temp: 'ambient' },
    
    // Primary to RDC (cross-dock chilled)
    { id: 'f10', from: 'pri1', to: 'rdc1', type: 'crossdock', temp: 'chilled' },
    { id: 'f11', from: 'pri1', to: 'rdc2', type: 'crossdock', temp: 'chilled' },
    { id: 'f12', from: 'pri2', to: 'rdc3', type: 'crossdock', temp: 'chilled' },
    
    // RDC to Store
    { id: 'f13', from: 'rdc1', to: 'store1', type: 'delivery', temp: 'multi' },
    { id: 'f14', from: 'rdc1', to: 'store2', type: 'delivery', temp: 'multi' },
    { id: 'f15', from: 'rdc2', to: 'store3', type: 'delivery', temp: 'multi' },
    { id: 'f16', from: 'rdc3', to: 'store4', type: 'delivery', temp: 'multi' },
  ],
  
  businessProcesses: {
    inbound: {
      name: 'External Inbound',
      logical: 'supplier',
      steps: [
        { id: 'bp1', name: 'ASN Transmission', systems: ['EDI Gateway', 'SAP', 'Oracle'], description: 'Supplier sends Advanced Shipping Notice' },
        { id: 'bp2', name: 'ASN Receipt', systems: ['WMS-A', 'WMS-B'], description: 'DC receives and validates ASN' },
        { id: 'bp3', name: 'Vehicle Arrival', systems: ['Yard Management', 'TMS'], description: 'Vehicle checks in at DC' },
        { id: 'bp4', name: 'Goods Receipt', systems: ['WMS-A', 'WMS-B', 'Stock System'], description: 'Physical receipt and system booking' },
        { id: 'bp5', name: 'Quality Check', systems: ['WMS-A', 'WMS-B'], description: 'Temperature and quality verification' },
        { id: 'bp6', name: 'Putaway', systems: ['WMS-A', 'WMS-B'], description: 'Stock moved to storage location' },
      ]
    },
    warehouse: {
      name: 'Warehouse Operations',
      logical: 'dc',
      steps: [
        { id: 'bp7', name: 'Inventory Management', systems: ['WMS-A', 'WMS-B', 'Stock System'], description: 'Stock counting and adjustments' },
        { id: 'bp8', name: 'Replenishment', systems: ['WMS-A', 'WMS-B'], description: 'Pick face replenishment' },
        { id: 'bp9', name: 'Order Allocation', systems: ['Allocation Engine'], description: 'Allocate stock to store orders' },
        { id: 'bp10', name: 'Pick', systems: ['WMS-A', 'WMS-B'], description: 'Pick items for orders' },
        { id: 'bp11', name: 'Dispatch', systems: ['WMS-A', 'WMS-B', 'TMS'], description: 'Load and dispatch to stores' },
      ]
    },
    crossdock: {
      name: 'Cross-Dock (Chilled)',
      logical: 'primary',
      steps: [
        { id: 'bp12', name: 'Supplier Delivery', systems: ['Cross-Dock System'], description: 'Chilled goods arrive at Primary' },
        { id: 'bp13', name: 'Sortation', systems: ['Cross-Dock System'], description: 'Sort by destination RDC' },
        { id: 'bp14', name: 'Consolidation', systems: ['Cross-Dock System', 'TMS'], description: 'Consolidate for onward delivery' },
        { id: 'bp15', name: 'Dispatch to RDC', systems: ['TMS'], description: 'Ship to Regional DC' },
      ]
    },
    store: {
      name: 'Store Operations',
      logical: 'store',
      steps: [
        { id: 'bp16', name: 'Delivery Receipt', systems: ['Stock Counter'], description: 'Receive delivery from RDC' },
        { id: 'bp17', name: 'Stock to Shelf', systems: ['Stock Counter'], description: 'Replenish store shelves' },
        { id: 'bp18', name: 'Sales', systems: ['POS'], description: 'Customer transactions' },
        { id: 'bp19', name: 'Stock Count', systems: ['Stock Counter'], description: 'Regular stock counts' },
        { id: 'bp20', name: 'Sales Data Export', systems: ['POS', 'Forecasting System'], description: 'Send sales data for forecasting' },
      ]
    },
    forecasting: {
      name: 'Planning & Forecasting',
      logical: 'planning',
      steps: [
        { id: 'bp21', name: 'Demand Forecast', systems: ['Forecasting System'], description: 'Generate demand forecasts' },
        { id: 'bp22', name: 'Order Generation', systems: ['Ordering System', 'Allocation Engine'], description: 'Create replenishment orders' },
        { id: 'bp23', name: 'Supplier Orders', systems: ['Ordering System', 'EDI Gateway'], description: 'Place orders with suppliers' },
      ]
    }
  },
  
  teams: {
    'WMS-A': { name: 'Warehouse Systems Team A', contact: 'wms-a@company.com' },
    'WMS-B': { name: 'Warehouse Systems Team B', contact: 'wms-b@company.com' },
    'TMS': { name: 'Transport Systems', contact: 'transport@company.com' },
    'Stock System': { name: 'Stock Management Team', contact: 'stock@company.com' },
    'EDI Gateway': { name: 'Integration Team', contact: 'edi@company.com' },
    'Forecasting System': { name: 'Planning Systems', contact: 'planning@company.com' },
    'Allocation Engine': { name: 'Allocation Team', contact: 'allocation@company.com' },
    'POS': { name: 'Store Systems', contact: 'store-tech@company.com' },
    'Cross-Dock System': { name: 'Primary Hub Team', contact: 'crossdock@company.com' },
    'Ordering System': { name: 'Replenishment Team', contact: 'replen@company.com' },
    'Stock Counter': { name: 'Store Systems', contact: 'store-tech@company.com' },
  }
};

// Temperature styling
const tempColors = {
  ambient: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', icon: Sun },
  chilled: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400', icon: Thermometer },
  frozen: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', icon: Snowflake },
};

// Node type styling
const nodeStyles = {
  supplier: { bg: 'bg-emerald-900/40', border: 'border-emerald-500/60', icon: Building2, label: 'Supplier' },
  ndc: { bg: 'bg-violet-900/40', border: 'border-violet-500/60', icon: Box, label: 'NDC' },
  primary: { bg: 'bg-rose-900/40', border: 'border-rose-500/60', icon: RefreshCw, label: 'Primary' },
  rdc: { bg: 'bg-orange-900/40', border: 'border-orange-500/60', icon: Truck, label: 'RDC' },
  store: { bg: 'bg-sky-900/40', border: 'border-sky-500/60', icon: Store, label: 'Store' },
};

// Operator styling
const operatorColors = {
  'Company A': 'ring-2 ring-green-500/50',
  'Company B': 'ring-2 ring-purple-500/50',
};

export default function SupplyChainUI() {
  const [activeView, setActiveView] = useState('logical');
  const [filters, setFilters] = useState({
    temp: [],
    operator: [],
    nodeType: [],
    system: [],
  });
  const [expandedProcess, setExpandedProcess] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showLayers, setShowLayers] = useState({
    systems: true,
    teams: false,
    businessProcess: true,
  });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter panel toggle
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  // Compute visible nodes based on filters
  const visibleNodes = useMemo(() => {
    return supplyChainData.nodes.filter(node => {
      if (filters.temp.length > 0 && !node.temp.some(t => filters.temp.includes(t))) return false;
      if (filters.operator.length > 0 && !filters.operator.includes(node.operator || 'None')) return false;
      if (filters.nodeType.length > 0 && !filters.nodeType.includes(node.type)) return false;
      return true;
    });
  }, [filters]);

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  const visibleFlows = useMemo(() => {
    return supplyChainData.flows.filter(flow => {
      if (!visibleNodeIds.has(flow.from) || !visibleNodeIds.has(flow.to)) return false;
      if (filters.temp.length > 0 && flow.temp !== 'multi' && !filters.temp.includes(flow.temp)) return false;
      return true;
    });
  }, [filters, visibleNodeIds]);

  const toggleFilter = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ temp: [], operator: [], nodeType: [], system: [] });
  };

  const FilterChip = ({ active, onClick, children, color = 'gray' }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? `bg-${color}-500/30 text-${color}-300 border border-${color}-500/50`
          : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
      }`}
    >
      {children}
    </button>
  );

  const NodeCard = ({ node, compact = false }) => {
    const style = nodeStyles[node.type];
    const Icon = style.icon;
    const isSelected = selectedNode?.id === node.id;
    
    return (
      <div
        onClick={() => setSelectedNode(isSelected ? null : node)}
        className={`
          ${style.bg} ${style.border} border rounded-lg p-3 cursor-pointer transition-all
          ${node.operator ? operatorColors[node.operator] : ''}
          ${isSelected ? 'ring-2 ring-white/50 shadow-lg shadow-white/10' : 'hover:brightness-110'}
          ${compact ? 'p-2' : ''}
        `}
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        <div className="flex items-start gap-2">
          <Icon className={`w-4 h-4 ${style.border.replace('border-', 'text-').replace('/60', '')}`} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 uppercase tracking-wide">{style.label}</div>
            <div className="text-sm font-medium text-white truncate">{node.name}</div>
            {!compact && <div className="text-xs text-slate-500">{node.location}</div>}
          </div>
        </div>
        
        {/* Temperature badges */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {node.temp.map(t => {
            const tc = tempColors[t];
            const TempIcon = tc.icon;
            return (
              <span key={t} className={`${tc.bg} ${tc.text} px-1.5 py-0.5 rounded text-xs flex items-center gap-1`}>
                <TempIcon className="w-3 h-3" />
                {t}
              </span>
            );
          })}
        </div>

        {/* Systems layer */}
        {showLayers.systems && !compact && (
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Systems
            </div>
            <div className="flex flex-wrap gap-1">
              {node.systems.map(sys => (
                <span key={sys} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-xs">
                  {sys}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Teams layer */}
        {showLayers.teams && !compact && (
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Teams
            </div>
            <div className="flex flex-wrap gap-1">
              {[...new Set(node.systems.map(s => supplyChainData.teams[s]?.name).filter(Boolean))].map(team => (
                <span key={team} className="bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded text-xs">
                  {team}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.operator && (
          <div className="mt-2 text-xs text-slate-500">
            Operator: <span className={node.operator === 'Company A' ? 'text-green-400' : 'text-purple-400'}>{node.operator}</span>
          </div>
        )}
      </div>
    );
  };

  const BusinessProcessFlow = ({ process, expanded, onToggle }) => {
    return (
      <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <GitBranch className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-white">{process.name}</span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
              {process.steps.length} steps
            </span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        
        {expanded && (
          <div className="px-4 pb-4">
            <div className="relative">
              {process.steps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-3 relative">
                  {/* Connector line */}
                  {idx < process.steps.length - 1 && (
                    <div className="absolute left-[11px] top-6 w-0.5 h-full bg-slate-700" />
                  )}
                  
                  {/* Step dot */}
                  <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs text-slate-400 z-10 flex-shrink-0">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="text-sm font-medium text-white">{step.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
                    
                    {showLayers.systems && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.systems.map(sys => (
                          <span key={sys} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {sys}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {showLayers.teams && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[...new Set(step.systems.map(s => supplyChainData.teams[s]?.name).filter(Boolean))].map(team => (
                          <span key={team} className="bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {team}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Logical view - grouped by type
  const LogicalView = () => {
    const groupedNodes = {
      supplier: visibleNodes.filter(n => n.type === 'supplier'),
      ndc: visibleNodes.filter(n => n.type === 'ndc'),
      primary: visibleNodes.filter(n => n.type === 'primary'),
      rdc: visibleNodes.filter(n => n.type === 'rdc'),
      store: visibleNodes.filter(n => n.type === 'store'),
    };

    return (
      <div className="space-y-6">
        {/* Flow diagram */}
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {Object.entries(groupedNodes).map(([type, nodes], groupIdx) => (
            <React.Fragment key={type}>
              <div className="flex-shrink-0 min-w-[200px]">
                <div className={`text-xs uppercase tracking-wider mb-3 ${nodeStyles[type].border.replace('border-', 'text-').replace('/60', '')} font-semibold`}>
                  {nodeStyles[type].label}s ({nodes.length})
                </div>
                <div className="space-y-3">
                  {nodes.map(node => (
                    <NodeCard key={node.id} node={node} />
                  ))}
                </div>
              </div>
              {groupIdx < Object.keys(groupedNodes).length - 1 && (
                <div className="flex-shrink-0 flex flex-col items-center justify-center pt-8">
                  <ArrowRight className="w-8 h-8 text-slate-600" />
                  <div className="text-xs text-slate-600 mt-1">Flow</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Business processes */}
        {showLayers.businessProcess && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Business Processes
            </div>
            {Object.entries(supplyChainData.businessProcesses).map(([key, process]) => (
              <BusinessProcessFlow
                key={key}
                process={process}
                expanded={expandedProcess === key}
                onToggle={() => setExpandedProcess(expandedProcess === key ? null : key)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Physical view - map-based
  const PhysicalView = () => {
    const locations = {
      'Scotland': ['Glasgow', 'Edinburgh'],
      'North': ['Manchester', 'Leeds', 'Sheffield', 'Doncaster'],
      'Midlands': ['Birmingham', 'Nottingham'],
      'South': ['Milton Keynes', 'Reading', 'Bristol'],
    };

    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(locations).map(([region, cities]) => (
          <div key={region} className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
            <div className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Map className="w-4 h-4" />
              {region}
            </div>
            <div className="space-y-2">
              {cities.map(city => {
                const nodesInCity = visibleNodes.filter(n => n.location === city);
                if (nodesInCity.length === 0) return null;
                return (
                  <div key={city} className="pl-3 border-l-2 border-slate-700">
                    <div className="text-xs text-slate-500 mb-1">{city}</div>
                    <div className="space-y-2">
                      {nodesInCity.map(node => (
                        <NodeCard key={node.id} node={node} compact />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Systems view
  const SystemsView = () => {
    const allSystems = [...new Set(supplyChainData.nodes.flatMap(n => n.systems))];
    
    return (
      <div className="grid grid-cols-3 gap-4">
        {allSystems.map(system => {
          const nodesWithSystem = visibleNodes.filter(n => n.systems.includes(system));
          const team = supplyChainData.teams[system];
          
          return (
            <div key={system} className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    {system}
                  </div>
                  {team && (
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {team.name}
                    </div>
                  )}
                </div>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  {nodesWithSystem.length} nodes
                </span>
              </div>
              
              <div className="space-y-1">
                {nodesWithSystem.map(node => (
                  <div key={node.id} className="text-xs text-slate-400 flex items-center gap-2">
                    {React.createElement(nodeStyles[node.type].icon, { className: 'w-3 h-3' })}
                    {node.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Teams view
  const TeamsView = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(supplyChainData.teams).map(([system, team]) => {
          const nodesWithSystem = visibleNodes.filter(n => n.systems.includes(system));
          
          return (
            <div key={system} className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    {team.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{team.contact}</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 mb-2">Owns: {system}</div>
                <div className="text-xs text-slate-500 mb-1">Used by:</div>
                <div className="space-y-1">
                  {nodesWithSystem.slice(0, 5).map(node => (
                    <div key={node.id} className="text-xs text-slate-400 flex items-center gap-2">
                      {React.createElement(nodeStyles[node.type].icon, { className: 'w-3 h-3' })}
                      {node.name}
                    </div>
                  ))}
                  {nodesWithSystem.length > 5 && (
                    <div className="text-xs text-slate-600">+{nodesWithSystem.length - 5} more</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Supply Chain Collaboration</h1>
                <p className="text-xs text-slate-500">Foods Network Visibility</p>
              </div>
            </div>
            
            {/* View switcher */}
            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
              {[
                { id: 'logical', icon: GitBranch, label: 'Logical' },
                { id: 'physical', icon: Map, label: 'Physical' },
                { id: 'systems', icon: Cpu, label: 'Systems' },
                { id: 'teams', icon: Users, label: 'Teams' },
              ].map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                    activeView === view.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.label}
                </button>
              ))}
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Filter sidebar */}
        <aside className={`${filterPanelOpen ? 'w-72' : 'w-12'} border-r border-slate-800 bg-slate-900/30 transition-all flex-shrink-0`}>
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className="w-full p-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {filterPanelOpen && <span className="text-sm font-medium">Filters</span>}
            </div>
            {filterPanelOpen && (
              <span className="text-xs text-slate-500">
                {Object.values(filters).flat().length} active
              </span>
            )}
          </button>

          {filterPanelOpen && (
            <div className="p-4 space-y-6">
              {/* Clear all */}
              {Object.values(filters).flat().length > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full text-xs text-red-400 hover:text-red-300 text-left"
                >
                  Clear all filters
                </button>
              )}

              {/* Temperature filter */}
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Temperature</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tempColors).map(([temp, style]) => {
                    const TempIcon = style.icon;
                    return (
                      <button
                        key={temp}
                        onClick={() => toggleFilter('temp', temp)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                          filters.temp.includes(temp)
                            ? `${style.bg} ${style.text} border ${style.border}`
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                        }`}
                      >
                        <TempIcon className="w-3 h-3" />
                        {temp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operator filter */}
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Operator</div>
                <div className="flex flex-wrap gap-2">
                  {['Company A', 'Company B', 'None'].map(op => (
                    <button
                      key={op}
                      onClick={() => toggleFilter('operator', op)}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        filters.operator.includes(op)
                          ? op === 'Company A'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : op === 'Company B'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                            : 'bg-slate-600/50 text-slate-300 border border-slate-500/50'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {/* Node type filter */}
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Node Type</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(nodeStyles).map(([type, style]) => (
                    <button
                      key={type}
                      onClick={() => toggleFilter('nodeType', type)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                        filters.nodeType.includes(type)
                          ? `${style.bg} ${style.border.replace('border-', 'text-').replace('/60', '')} border ${style.border}`
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                      }`}
                    >
                      {React.createElement(style.icon, { className: 'w-3 h-3' })}
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer toggles */}
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Layers</div>
                <div className="space-y-2">
                  {[
                    { key: 'systems', icon: Cpu, label: 'Systems' },
                    { key: 'teams', icon: Users, label: 'Teams' },
                    { key: 'businessProcess', icon: GitBranch, label: 'Business Process' },
                  ].map(layer => (
                    <button
                      key={layer.key}
                      onClick={() => setShowLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key] }))}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <layer.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{layer.label}</span>
                      </div>
                      {showLayers[layer.key] ? (
                        <Eye className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1600px]">
            {/* Summary stats */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {Object.entries(nodeStyles).map(([type, style]) => {
                const count = visibleNodes.filter(n => n.type === type).length;
                const total = supplyChainData.nodes.filter(n => n.type === type).length;
                return (
                  <div key={type} className={`${style.bg} border ${style.border} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      {React.createElement(style.icon, { className: `w-4 h-4 ${style.border.replace('border-', 'text-').replace('/60', '')}` })}
                      <span className="text-xs text-slate-400 uppercase tracking-wider">{style.label}s</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {count}
                      {count !== total && <span className="text-sm text-slate-500 ml-1">/ {total}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active view content */}
            {activeView === 'logical' && <LogicalView />}
            {activeView === 'physical' && <PhysicalView />}
            {activeView === 'systems' && <SystemsView />}
            {activeView === 'teams' && <TeamsView />}
          </div>
        </main>

        {/* Detail panel */}
        {selectedNode && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">Node Details</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
            
            <NodeCard node={selectedNode} />
            
            {/* Connected flows */}
            <div className="mt-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Connected Flows</div>
              <div className="space-y-2">
                {supplyChainData.flows
                  .filter(f => f.from === selectedNode.id || f.to === selectedNode.id)
                  .map(flow => {
                    const fromNode = supplyChainData.nodes.find(n => n.id === flow.from);
                    const toNode = supplyChainData.nodes.find(n => n.id === flow.to);
                    const tc = flow.temp !== 'multi' ? tempColors[flow.temp] : null;
                    
                    return (
                      <div key={flow.id} className="bg-slate-800/50 rounded p-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="truncate">{fromNode?.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{toNode?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500">{flow.type}</span>
                          {tc && (
                            <span className={`${tc.bg} ${tc.text} px-1 py-0.5 rounded text-xs`}>
                              {flow.temp}
                            </span>
                          )}
                          {flow.hasASN !== undefined && (
                            <span className={`px-1 py-0.5 rounded text-xs ${flow.hasASN ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                              {flow.hasASN ? 'ASN' : 'No ASN'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
