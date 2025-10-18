const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

// Disable all developer tools in production
if (!isDev) {
  app.on('browser-window-created', (_, window) => {
    window.webContents.on('before-input-event', (event, input) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        (input.control && input.shift && input.key.toLowerCase() === 'i') ||
        (input.control && input.shift && input.key.toLowerCase() === 'j') ||
        (input.control && input.key.toLowerCase() === 'u') ||
        input.key === 'F12'
      ) {
        event.preventDefault();
      }
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev, // Only enable in development
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true,
    frame: true,
    icon: path.join(__dirname, 'app-icon.ico')
  });

  // Create custom menu with print functionality
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Print',
          accelerator: 'Ctrl+P',
          click: () => {
            mainWindow.webContents.print({
              silent: false,
              printBackground: true,
              deviceName: ''
            });
          }
        },
        {
          label: 'Print Preview',
          accelerator: 'Ctrl+Shift+P',
          click: () => {
            // Create print preview window
            const printWindow = new BrowserWindow({
              width: 1000,
              height: 700,
              parent: mainWindow,
              modal: true,
              webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
              }
            });

            mainWindow.webContents.printToPDF({
              marginsType: 0,
              printBackground: true,
              printSelectionOnly: false,
              landscape: false
            }).then(data => {
              const pdfPath = path.join(app.getPath('temp'), 'print-preview.pdf');
              fs.writeFileSync(pdfPath, data);
              printWindow.loadFile(pdfPath);
            }).catch(error => {
              console.error('Print preview error:', error);
              dialog.showErrorBox('Print Preview Error', error.message);
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Full Screen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Hotel Management System',
              message: 'Hotel Management System v1.0.0',
              detail: 'A comprehensive hotel management solution'
            });
          }
        }
      ]
    }
  ];

  // Set menu in production, hide in development if needed
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Disable right-click context menu
  mainWindow.webContents.on('context-menu', (e, params) => {
    e.preventDefault();
    
    // Only show print option on right-click in production
    if (!isDev) {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Print',
          click: () => {
            mainWindow.webContents.print();
          }
        }
      ]);
      contextMenu.popup(mainWindow);
    }
  });

  // Prevent opening dev tools in production
  if (!isDev) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  // Wait for server to start
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5000');
  }, 3000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  const serverPath = isDev 
    ? path.join(__dirname, 'server/index.ts')
    : path.join(process.resourcesPath, 'dist/index.js');

  const nodeCommand = isDev ? 'npx' : 'process.execPath';

  const args = isDev ? ['tsx', serverPath] : [serverPath];
  
  serverProcess = spawn(nodeCommand, args, {
  env: {
    ...process.env,
    NODE_ENV: isDev ? 'development' : 'production',
    PORT: '5000'
  },
  cwd: isDev ? __dirname : process.resourcesPath
});

  serverProcess.stdout.on('data', (data) => {
    if (isDev) console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    if (isDev) console.error(`Server Error: ${data}`);
  });
}

// Handle print requests from renderer
ipcMain.handle('print-page', async () => {
  mainWindow.webContents.print({
    silent: false,
    printBackground: true
  });
});

ipcMain.handle('print-preview', async () => {
  return mainWindow.webContents.printToPDF({
    marginsType: 0,
    printBackground: true,
    printSelectionOnly: false,
    landscape: false
  });
});

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Prevent new windows
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});