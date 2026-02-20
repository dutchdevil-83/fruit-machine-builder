const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Fruit Machine Builder',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#0f0f1a',
  });

  // In production, load the built dist/ folder
  // ?mode=play strips the builder UI for player-only export
  const isDev = process.argv.includes('--dev');
  const isPlayMode = process.argv.includes('--play');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/app.html' + (isPlayMode ? '?mode=play' : ''));
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'app.html');
    mainWindow.loadFile(indexPath, {
      query: isPlayMode ? { mode: 'play' } : {},
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
