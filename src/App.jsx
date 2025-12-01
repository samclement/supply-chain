import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, ArrowDown, GitBranch } from 'lucide-react';
import DataManager from './DataManager.jsx';
import MapView from './MapView.jsx';
import NodeCard from './NodeCard.jsx';
import BusinessProcessFlow from './BusinessProcessFlow.jsx';
import MapLegend from './MapLegend.jsx';
import SystemCard from './SystemCard.jsx';
import TeamCard from './TeamCard.jsx';
import Header from './Header.jsx';
import FilterPanel from './FilterPanel.jsx';
import SummaryStats from './SummaryStats.jsx';
import { tempColors, nodeStyles } from './styles.js';
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
        <MapLegend visibleNodes={visibleNodes} />

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
            <SystemCard
              key={system}
              system={system}
              team={team}
              nodesWithSystem={nodesWithSystem}
            />
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
            <TeamCard
              key={system}
              teamName={team.name}
              team={team}
              system={system}
              nodesWithSystem={nodesWithSystem}
            />
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
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        zoomLevel={zoomLevel}
        onZoomOut={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
        onZoomIn={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
        onOpenDataManager={() => setDataManagerOpen(true)}
      />

      <div className="flex">
        <FilterPanel
          isOpen={filterPanelOpen}
          onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearFilters={clearFilters}
          showLayers={showLayers}
          onToggleLayer={(layer) => setShowLayers(prev => ({ ...prev, [layer]: !prev[layer] }))}
        />

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1600px]">
            {/* Summary stats */}
            <SummaryStats
              visibleNodes={visibleNodes}
              totalNodes={supplyChainData.nodes}
            />

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
