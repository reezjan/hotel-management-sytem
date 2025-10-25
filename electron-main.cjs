const { app, BrowserWindow, Menu, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn, fork } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

// Prevent debugging and inspection flags
if (!isDev) {
  const shouldQuit = process.argv.some(arg => 
    arg.includes('--inspect') || 
    arg.includes('--inspect-brk') ||
    arg.includes('--remote-debugging-port') ||
    arg.includes('--debug')
  );
  
  if (shouldQuit) {
    app.quit();
    process.exit(0);
  }
}

// Disable all developer tools and keyboard shortcuts in production
if (!isDev) {
  app.on('browser-window-created', (_, window) => {
    window.webContents.on('before-input-event', (event, input) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        (input.control && input.shift && input.key.toLowerCase() === 'i') ||
        (input.control && input.shift && input.key.toLowerCase() === 'j') ||
        (input.control && input.shift && input.key.toLowerCase() === 'c') ||
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
      devTools: false, // Completely disabled even in development
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true,
    frame: true,
    icon: path.join(__dirname, 'app-icon.ico'),
    title: 'Hotel Management System'
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

  // Completely prevent opening dev tools
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  // Block any attempts to open new windows or navigation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost:5000')) {
      event.preventDefault();
    }
  });

  // Wait for server to start
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:5000/auth');
  }, 3000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  const serverPath = isDev 
    ? path.join(__dirname, 'server/index.ts')
    : path.join(__dirname, 'app_dist/index.js');

  // Check if we're in a packaged app (more reliable than isDev)
  const isPackaged = app.isPackaged;

  // Verify correct paths exist
  if (!isPackaged && !fs.existsSync(serverPath)) {
    console.error('Server file not found:', serverPath);
    process.exit(1);
  }

  if (!isPackaged && isDev) {
    // In development, spawn the server as a separate process with tsx
    try {
      serverProcess = spawn('npx', ['tsx', serverPath], {
        env: {
          ...process.env,
          NODE_ENV: 'development',
          PORT: '5000'
        },
        cwd: __dirname,
        shell: true
      });

      serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });
    } catch (error) {
      console.error('Failed to start dev server:', error);
    }
  } else {
    // In production, use fork() which doesn't require a shell or cmd.exe
    try {
      serverProcess = fork(serverPath, [], {
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: '5000'
        },
        cwd: __dirname,
        silent: false,
        execArgv: []
      });

      serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
      });

      serverProcess.on('spawn', () => {
        console.log('Server started in production mode');
      });
    } catch (error) {
      console.error('Failed to start production server:', error);
    }
  }
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
  // Register global shortcuts to disable dev tools
  if (!isDev) {
    globalShortcut.register('CommandOrControl+Shift+I', () => { return false; });
    globalShortcut.register('CommandOrControl+Shift+J', () => { return false; });
    globalShortcut.register('CommandOrControl+Shift+C', () => { return false; });
    globalShortcut.register('F12', () => { return false; });
    globalShortcut.register('CommandOrControl+R', () => { return false; });
    globalShortcut.register('F5', () => { return false; });
  }
  
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  // Unregister all shortcuts
  if (!isDev) {
    globalShortcut.unregisterAll();
  }
  
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