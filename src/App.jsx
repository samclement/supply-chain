import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, Layers, Map, GitBranch, Users, Cpu, Eye, EyeOff, ZoomIn, ZoomOut, ArrowRight, ArrowDown, Edit3 } from 'lucide-react';
import DataManager from './DataManager.jsx';
import MapView from './MapView.jsx';
import NodeCard from './NodeCard.jsx';
import BusinessProcessFlow from './BusinessProcessFlow.jsx';
import { tempColors, nodeStyles, operatorColors } from './styles.js';
import dataManager from './dataManager.js';

export default function SupplyChainUI() {
  const [supplyChainData, setSupplyChainData] = useState(null);
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
  const [dataManagerOpen, setDataManagerOpen] = useState(false);

  // Load data from local storage on mount
  useEffect(() => {
    const data = dataManager.loadData();
    setSupplyChainData(data);
  }, []);

  const handleDataChange = (newData) => {
    setSupplyChainData(newData);
    dataManager.saveData(newData);
  };

  // Compute visible nodes based on filters
  const visibleNodes = useMemo(() => {
    if (!supplyChainData) return [];
    return supplyChainData.nodes.filter(node => {
      if (filters.temp.length > 0 && !node.temp.some(t => filters.temp.includes(t))) return false;
      if (filters.operator.length > 0 && !filters.operator.includes(node.operator || 'None')) return false;
      if (filters.nodeType.length > 0 && !filters.nodeType.includes(node.type)) return false;
      return true;
    });
  }, [filters, supplyChainData]);

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  const visibleFlows = useMemo(() => {
    if (!supplyChainData) return [];
    return supplyChainData.flows.filter(flow => {
      if (!visibleNodeIds.has(flow.from) || !visibleNodeIds.has(flow.to)) return false;
      if (filters.temp.length > 0 && flow.temp !== 'multi' && !filters.temp.includes(flow.temp)) return false;
      return true;
    });
  }, [filters, visibleNodeIds, supplyChainData]);

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
                    <NodeCard
                      key={node.id}
                      node={{
                        ...node,
                        isSelected: selectedNode?.id === node.id,
                        onSelect: () => setSelectedNode(selectedNode?.id === node.id ? null : node)
                      }}
                      zoomLevel={zoomLevel}
                      showLayers={showLayers}
                      teamsData={supplyChainData.teams}
                    />
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
                showLayers={showLayers}
                teamsData={supplyChainData.teams}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Physical view - map-based using OpenStreetMap
  const PhysicalView = () => {
    return (
      <div className="space-y-4">
        {/* Interactive Map */}
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 overflow-hidden">
          <MapView
            visibleNodes={visibleNodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        </div>

        {/* Legend */}
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Map className="w-4 h-4" />
            Node Types
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(nodeStyles).map(([type, style]) => {
              const typeNodes = visibleNodes.filter(n => n.type === type);
              if (typeNodes.length === 0) return null;

              const nodeTypeColors = {
                'supplier': '#10b981',
                'ndc': '#a855f7',
                'primary': '#f43f5e',
                'rdc': '#f97316',
                'store': '#3b82f6',
              };

              return (
                <div key={type} className="text-xs">
                  <div
                    className="w-full h-6 rounded mb-1 opacity-80"
                    style={{ backgroundColor: nodeTypeColors[type] }}
                  ></div>
                  <div className="font-medium text-slate-300 capitalize">{type}</div>
                  <div className="text-slate-500">{typeNodes.length}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed View */}
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="text-sm font-semibold text-slate-300 mb-3">Cities & Locations</div>
          <div className="grid grid-cols-2 gap-4">
            {['Scotland', 'North', 'Midlands', 'South'].map(region => {
              const locations = {
                'Scotland': ['Glasgow', 'Edinburgh'],
                'North': ['Manchester', 'Leeds', 'Sheffield', 'Doncaster'],
                'Midlands': ['Birmingham', 'Nottingham'],
                'South': ['Milton Keynes', 'Reading', 'Bristol'],
              };
              return (
                <div key={region}>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{region}</div>
                  <div className="space-y-2">
                    {locations[region].map(city => {
                      const nodesInCity = visibleNodes.filter(n => n.location === city);
                      if (nodesInCity.length === 0) return null;
                      return (
                        <div key={city} className="pl-3 border-l-2 border-slate-700 text-xs">
                          <div className="text-slate-300 font-medium mb-1">{city}</div>
                          <div className="space-y-1">
                            {nodesInCity.map(node => (
                              <div key={node.id} className="text-slate-500 text-xs">{node.name}</div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

  if (!supplyChainData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading data...</p>
        </div>
      </div>
    );
  }

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

            {/* Zoom controls and data manager */}
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
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <button
                onClick={() => setDataManagerOpen(true)}
                className="p-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors border border-purple-500/30 hover:border-purple-500/50"
                title="Open data manager"
              >
                <Edit3 className="w-4 h-4" />
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {Object.values(filters).flat().length} active
                </span>
                {Object.values(filters).flat().length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    title="Clear all filters"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </button>

          {filterPanelOpen && (
            <div className="p-4 space-y-6">

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

            <NodeCard
              node={{
                ...selectedNode,
                isSelected: true,
                onSelect: () => setSelectedNode(null)
              }}
              showLayers={showLayers}
              teamsData={supplyChainData.teams}
            />

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

        {/* Data Manager */}
        {supplyChainData && (
          <DataManager
            data={supplyChainData}
            onDataChange={handleDataChange}
            isOpen={dataManagerOpen}
            onClose={() => setDataManagerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
