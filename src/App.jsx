import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, ArrowDown, GitBranch } from 'lucide-react';
import DataManager from './DataManager.jsx';
import Header from './Header.jsx';
import FilterPanel from './FilterPanel.jsx';
import SummaryStats from './SummaryStats.jsx';
import DetailPanel from './panels/DetailPanel.jsx';
import LogicalView from './pages/LogicalView.jsx';
import PhysicalView from './pages/PhysicalView.jsx';
import SystemsView from './pages/SystemsView.jsx';
import TeamsView from './pages/TeamsView.jsx';
import NodeCard from './NodeCard.jsx';
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
            {activeView === 'logical' && (
              <LogicalView
                visibleNodes={visibleNodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                supplyChainData={supplyChainData}
                zoomLevel={zoomLevel}
                showLayers={showLayers}
                expandedProcess={expandedProcess}
                onToggleProcess={setExpandedProcess}
              />
            )}
            {activeView === 'physical' && (
              <PhysicalView
                visibleNodes={visibleNodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            )}
            {activeView === 'systems' && (
              <SystemsView
                visibleNodes={visibleNodes}
                supplyChainData={supplyChainData}
              />
            )}
            {activeView === 'teams' && (
              <TeamsView
                visibleNodes={visibleNodes}
                supplyChainData={supplyChainData}
              />
            )}
          </div>
        </main>

        {/* Detail panel */}
        <DetailPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          supplyChainData={supplyChainData}
          showLayers={showLayers}
        />

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
