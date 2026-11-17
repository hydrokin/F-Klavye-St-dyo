const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  setTheme: (theme) => ipcRenderer.send('titlebar-theme', theme),
  isDesktop: true
});
