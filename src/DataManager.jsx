import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Download, Upload, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import dataManager from './dataManager.js';

export default function DataManager({ data, onDataChange, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('nodes');
  const [editingId, setEditingId] = useState(null);
  const [expandedNode, setExpandedNode] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleAddNode = () => {
    const newData = dataManager.addNode(data, {
      id: `node-${Date.now()}`,
      type: 'supplier',
      name: 'New Node',
      temp: ['ambient'],
      operator: null,
      location: 'New Location',
      systems: []
    });
    onDataChange(newData);
  };

  const handleUpdateNode = (nodeId, updates) => {
    const newData = dataManager.updateNode(data, nodeId, updates);
    onDataChange(newData);
    setEditingId(null);
  };

  const handleDeleteNode = (nodeId) => {
    if (confirm('Delete this node? Connected flows will also be removed.')) {
      const newData = dataManager.deleteNode(data, nodeId);
      onDataChange(newData);
    }
  };

  const handleAddFlow = () => {
    const newData = dataManager.addFlow(data, {
      id: `flow-${Date.now()}`,
      from: data.nodes[0]?.id || 'sup1',
      to: data.nodes[1]?.id || 'sup2',
      type: 'inbound',
      temp: 'ambient',
      hasASN: false
    });
    onDataChange(newData);
  };

  const handleUpdateFlow = (flowId, updates) => {
    const newData = dataManager.updateFlow(data, flowId, updates);
    onDataChange(newData);
    setEditingId(null);
  };

  const handleDeleteFlow = (flowId) => {
    if (confirm('Delete this flow?')) {
      const newData = dataManager.deleteFlow(data, flowId);
      onDataChange(newData);
    }
  };

  const handleExport = () => {
    const json = dataManager.exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-chain-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportError(null);
        const json = event.target?.result;
        const imported = dataManager.importData(json);
        onDataChange(imported);
        alert('Data imported successfully!');
      } catch (error) {
        setImportError(error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      const defaultData = dataManager.resetToDefaults();
      onDataChange(defaultData);
    }
  };

  const NodeForm = ({ node, onSave, onCancel }) => {
    const [form, setForm] = useState(node);
    const [tempInput, setTempInput] = useState('');
    const [sysInput, setSysInput] = useState('');

    const tempOptions = ['ambient', 'chilled', 'frozen'];
    const typeOptions = ['supplier', 'ndc', 'primary', 'rdc', 'store'];

    return (
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">ID</label>
            <input
              type="text"
              value={form.id}
              disabled
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">Operator</label>
            <select
              value={form.operator || ''}
              onChange={(e) => setForm({ ...form, operator: e.target.value || null })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="">None</option>
              <option value="Company A">Company A</option>
              <option value="Company B">Company B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase mb-2 block">Temperature Types</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.temp.map(t => (
              <span key={t} className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                {t}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, temp: form.temp.filter(x => x !== t) })}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="">Add temp type...</option>
              {tempOptions.filter(t => !form.temp.includes(t)).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (tempInput && !form.temp.includes(tempInput)) {
                  setForm({ ...form, temp: [...form.temp, tempInput] });
                  setTempInput('');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs text-white"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 uppercase mb-2 block">Systems</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.systems.map(s => (
              <span key={s} className="bg-purple-900/40 text-purple-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                {s}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, systems: form.systems.filter(x => x !== s) })}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={sysInput}
              onChange={(e) => setSysInput(e.target.value)}
              placeholder="System name..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (sysInput && !form.systems.includes(sysInput)) {
                  setForm({ ...form, systems: [...form.systems, sysInput] });
                  setSysInput('');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs text-white"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  const FlowForm = ({ flow, onSave, onCancel }) => {
    const [form, setForm] = useState(flow);

    return (
      <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">From</label>
            <select
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              {data.nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">To</label>
            <select
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              {data.nodes.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 uppercase">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="inbound">inbound</option>
              <option value="transfer">transfer</option>
              <option value="crossdock">crossdock</option>
              <option value="delivery">delivery</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">Temperature</label>
            <select
              value={form.temp}
              onChange={(e) => setForm({ ...form, temp: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="ambient">ambient</option>
              <option value="chilled">chilled</option>
              <option value="frozen">frozen</option>
              <option value="multi">multi</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">ASN</label>
            <select
              value={form.hasASN !== undefined ? form.hasASN.toString() : ''}
              onChange={(e) => setForm({ ...form, hasASN: e.target.value === 'true' })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="">N/A</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 rounded text-xs bg-slate-700 hover:bg-slate-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose}>
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Data Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'nodes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Nodes ({data.nodes.length})
          </button>
          <button
            onClick={() => setActiveTab('flows')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'flows'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Flows ({data.flows.length})
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'import-export'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Import/Export
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Nodes Tab */}
          {activeTab === 'nodes' && (
            <div className="space-y-3">
              <button
                onClick={handleAddNode}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Node
              </button>

              {data.nodes.map(node => (
                <div key={node.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-left flex-1">
                      {expandedNode === node.id ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{node.name}</div>
                        <div className="text-xs text-slate-500">{node.type} • {node.location}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(editingId === node.id ? null : node.id);
                        }}
                        className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="p-1 hover:bg-red-900/30 rounded text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>

                  {expandedNode === node.id && (
                    <div className="px-3 pb-3">
                      {editingId === node.id ? (
                        <NodeForm
                          node={node}
                          onSave={(updated) => handleUpdateNode(node.id, updated)}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-300 space-y-1">
                          <div><span className="text-slate-500">ID:</span> {node.id}</div>
                          <div><span className="text-slate-500">Type:</span> {node.type}</div>
                          <div><span className="text-slate-500">Location:</span> {node.location}</div>
                          <div><span className="text-slate-500">Operator:</span> {node.operator || 'None'}</div>
                          <div><span className="text-slate-500">Temps:</span> {node.temp.join(', ')}</div>
                          <div><span className="text-slate-500">Systems:</span> {node.systems.length > 0 ? node.systems.join(', ') : 'None'}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Flows Tab */}
          {activeTab === 'flows' && (
            <div className="space-y-3">
              <button
                onClick={handleAddFlow}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Flow
              </button>

              {data.flows.map(flow => {
                const fromNode = data.nodes.find(n => n.id === flow.from);
                const toNode = data.nodes.find(n => n.id === flow.to);

                return (
                  <div key={flow.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedNode(expandedNode === flow.id ? null : flow.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                        {expandedNode === flow.id ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {fromNode?.name} → {toNode?.name}
                          </div>
                          <div className="text-xs text-slate-500">{flow.type} • {flow.temp}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(editingId === flow.id ? null : flow.id);
                          }}
                          className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFlow(flow.id);
                          }}
                          className="p-1 hover:bg-red-900/30 rounded text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>

                    {expandedNode === flow.id && (
                      <div className="px-3 pb-3">
                        {editingId === flow.id ? (
                          <FlowForm
                            flow={flow}
                            onSave={(updated) => handleUpdateFlow(flow.id, updated)}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-300 space-y-1">
                            <div><span className="text-slate-500">ID:</span> {flow.id}</div>
                            <div><span className="text-slate-500">From:</span> {fromNode?.name}</div>
                            <div><span className="text-slate-500">To:</span> {toNode?.name}</div>
                            <div><span className="text-slate-500">Type:</span> {flow.type}</div>
                            <div><span className="text-slate-500">Temperature:</span> {flow.temp}</div>
                            {flow.hasASN !== undefined && (
                              <div><span className="text-slate-500">ASN:</span> {flow.hasASN ? 'Yes' : 'No'}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Import/Export Tab */}
          {activeTab === 'import-export' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Export Data</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Download your data as a JSON file that can be imported back later.
                </p>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </button>
              </div>

              <div className="border-t border-slate-700" />

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Import Data</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Load data from a previously exported JSON file.
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Choose JSON File
                  </span>
                </label>
                {importError && (
                  <div className="mt-2 p-2 rounded bg-red-900/20 border border-red-500/30 text-xs text-red-300">
                    {importError}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-700" />

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Reset to Defaults</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Restore the original sample data. This action cannot be undone.
                </p>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
