// Default data structure
const defaultData = {
  nodes: [
    { id: 'sup1', type: 'supplier', name: 'Fresh Foods Ltd', temp: ['chilled', 'ambient'], operator: null, location: 'Manchester', systems: ['SAP', 'EDI Gateway'] },
    { id: 'sup2', type: 'supplier', name: 'Frozen Goods Co', temp: ['frozen'], operator: null, location: 'Leeds', systems: ['Oracle', 'EDI Gateway'] },
    { id: 'sup3', type: 'supplier', name: 'Ambient Supplies', temp: ['ambient'], operator: null, location: 'Birmingham', systems: ['Custom ERP'] },
    { id: 'ndc1', type: 'ndc', name: 'National DC North', temp: ['ambient', 'frozen'], operator: 'Company A', location: 'Doncaster', systems: ['WMS-A', 'TMS', 'Stock System'] },
    { id: 'ndc2', type: 'ndc', name: 'National DC South', temp: ['ambient', 'frozen'], operator: 'Company B', location: 'Milton Keynes', systems: ['WMS-B', 'TMS', 'Stock System'] },
    { id: 'pri1', type: 'primary', name: 'Primary Hub North', temp: ['chilled'], operator: 'Company A', location: 'Sheffield', systems: ['Cross-Dock System', 'TMS'] },
    { id: 'pri2', type: 'primary', name: 'Primary Hub South', temp: ['chilled'], operator: 'Company B', location: 'Reading', systems: ['Cross-Dock System', 'TMS'] },
    { id: 'rdc1', type: 'rdc', name: 'Regional DC Scotland', temp: ['ambient', 'chilled', 'frozen'], operator: 'Company A', location: 'Glasgow', systems: ['WMS-A', 'Allocation Engine'] },
    { id: 'rdc2', type: 'rdc', name: 'Regional DC Midlands', temp: ['ambient', 'chilled', 'frozen'], operator: 'Company A', location: 'Nottingham', systems: ['WMS-A', 'Allocation Engine'] },
    { id: 'rdc3', type: 'rdc', name: 'Regional DC South West', temp: ['ambient', 'chilled', 'frozen'], operator: 'Company B', location: 'Bristol', systems: ['WMS-B', 'Allocation Engine'] },
    { id: 'store1', type: 'store', name: 'Store Glasgow Central', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Glasgow', systems: ['POS', 'Stock Counter', 'Ordering System'] },
    { id: 'store2', type: 'store', name: 'Store Edinburgh', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Edinburgh', systems: ['POS', 'Stock Counter', 'Ordering System'] },
    { id: 'store3', type: 'store', name: 'Store Birmingham', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Birmingham', systems: ['POS', 'Stock Counter', 'Ordering System'] },
    { id: 'store4', type: 'store', name: 'Store Bristol', temp: ['ambient', 'chilled', 'frozen'], operator: null, location: 'Bristol', systems: ['POS', 'Stock Counter', 'Ordering System'] },
  ],
  flows: [
    { id: 'f1', from: 'sup1', to: 'pri1', type: 'inbound', hasASN: true, temp: 'chilled' },
    { id: 'f2', from: 'sup1', to: 'ndc1', type: 'inbound', hasASN: true, temp: 'ambient' },
    { id: 'f3', from: 'sup2', to: 'ndc1', type: 'inbound', hasASN: false, temp: 'frozen' },
    { id: 'f4', from: 'sup3', to: 'ndc2', type: 'inbound', hasASN: true, temp: 'ambient' },
    { id: 'f5', from: 'sup1', to: 'pri2', type: 'inbound', hasASN: true, temp: 'chilled' },
    { id: 'f6', from: 'ndc1', to: 'rdc1', type: 'transfer', temp: 'ambient' },
    { id: 'f7', from: 'ndc1', to: 'rdc1', type: 'transfer', temp: 'frozen' },
    { id: 'f8', from: 'ndc1', to: 'rdc2', type: 'transfer', temp: 'ambient' },
    { id: 'f9', from: 'ndc2', to: 'rdc3', type: 'transfer', temp: 'ambient' },
    { id: 'f10', from: 'pri1', to: 'rdc1', type: 'crossdock', temp: 'chilled' },
    { id: 'f11', from: 'pri1', to: 'rdc2', type: 'crossdock', temp: 'chilled' },
    { id: 'f12', from: 'pri2', to: 'rdc3', type: 'crossdock', temp: 'chilled' },
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

const STORAGE_KEY = 'supplyChainData';

const dataManagerExport = {
  // Load data from local storage or use defaults
  loadData: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { ...defaultData };
    } catch (e) {
      console.error('Error loading data from storage:', e);
      return { ...defaultData };
    }
  },

  // Save data to local storage
  saveData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving data to storage:', e);
      return false;
    }
  },

  // Reset to default data
  resetToDefaults: () => {
    return { ...defaultData };
  },

  // Export data as JSON string
  exportData: (data) => {
    return JSON.stringify(data, null, 2);
  },

  // Import data from JSON string
  importData: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      // Basic validation
      if (!parsed.nodes || !parsed.flows) {
        throw new Error('Invalid data format: missing nodes or flows');
      }
      return parsed;
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${e.message}`);
    }
  },

  // Add a new node
  addNode: (data, node) => {
    return {
      ...data,
      nodes: [...data.nodes, { ...node, id: node.id || `node-${Date.now()}` }]
    };
  },

  // Update a node
  updateNode: (data, nodeId, updates) => {
    return {
      ...data,
      nodes: data.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    };
  },

  // Delete a node
  deleteNode: (data, nodeId) => {
    return {
      ...data,
      nodes: data.nodes.filter(n => n.id !== nodeId),
      // Also remove flows connected to this node
      flows: data.flows.filter(f => f.from !== nodeId && f.to !== nodeId)
    };
  },

  // Add a new flow
  addFlow: (data, flow) => {
    return {
      ...data,
      flows: [...data.flows, { ...flow, id: flow.id || `flow-${Date.now()}` }]
    };
  },

  // Update a flow
  updateFlow: (data, flowId, updates) => {
    return {
      ...data,
      flows: data.flows.map(f => f.id === flowId ? { ...f, ...updates } : f)
    };
  },

  // Delete a flow
  deleteFlow: (data, flowId) => {
    return {
      ...data,
      flows: data.flows.filter(f => f.id !== flowId)
    };
  }
};

export default dataManagerExport;
