const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#0d1020',
    title: 'F Klavye Stüdyo',
    icon: path.join(__dirname, 'app', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0d1020', symbolColor: '#c9cdf0', height: 38 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => { win.maximize(); win.show(); });

  // Dış bağlantıları varsayılan tarayıcıda aç
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());

  // Ctrl+R / F5 ile yenilemeyi ve geliştirici araçlarını kapat (Ctrl+Shift+I hariç)
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    const k = input.key.toLowerCase();
    if ((input.control && k === 'r') || k === 'f5') event.preventDefault();
    if (input.control && input.shift && k === 'i') win.webContents.toggleDevTools();
    if (k === 'f11') { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
  });
}

ipcMain.on('titlebar-theme', (_e, theme) => {
  if (!win) return;
  try {
    if (theme === 'light') win.setTitleBarOverlay({ color: '#f3f4fb', symbolColor: '#2a2f55' });
    else win.setTitleBarOverlay({ color: '#0d1020', symbolColor: '#c9cdf0' });
  } catch (_) { /* eski sürümlerde desteklenmeyebilir */ }
});

const single = app.requestSingleInstanceLock();
if (!single) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
