const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
    
    // Export operations
    exportPDFDialog: () => ipcRenderer.invoke('export-pdf-dialog'),
    exportCSVDialog: () => ipcRenderer.invoke('export-csv-dialog'),
    savePDF: (filePath, blob) => ipcRenderer.invoke('save-pdf', filePath, blob),
    saveCSV: (filePath, content) => ipcRenderer.invoke('save-csv', filePath, content),
    
    // License verification
    verifyLicense: (key) => ipcRenderer.invoke('verify-license', key),
    
    // Fuel Price Integration (FREE EIA API)
    getFuelPrices: (params) => ipcRenderer.invoke('get-fuel-prices', params),
    getFuelPriceTrends: (params) => ipcRenderer.invoke('get-fuel-price-trends', params),
    
    // AI API (Claude)
    calculateAIRate: (params) => ipcRenderer.invoke('ai-calculate-rate', params),
    analyzeMarket: (params) => ipcRenderer.invoke('ai-analyze-market', params),
    generateReport: (data) => ipcRenderer.invoke('ai-generate-report', data),
    optimizeRoute: (params) => ipcRenderer.invoke('ai-optimize-route', params),
    
    // Events
    onNewProject: (callback) => ipcRenderer.on('new-project', callback),
    onSaveProject: (callback) => ipcRenderer.on('save-project', (event, path) => callback(path)),
    onLoadProject: (callback) => ipcRenderer.on('load-project', (event, data) => callback(data)),
    onExportPDF: (callback) => ipcRenderer.on('export-pdf', callback),
    onExportCSV: (callback) => ipcRenderer.on('export-csv', callback),
    onShowHelp: (callback) => ipcRenderer.on('show-help', callback)
});
