const { contextBridge, ipcRenderer } = require('electron');

// Expose print functions to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  print: () => ipcRenderer.invoke('print-page'),
  printPreview: () => ipcRenderer.invoke('print-preview')
});