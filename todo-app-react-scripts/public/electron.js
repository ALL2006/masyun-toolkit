const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  Menu.setApplicationMenu(null);

  const isPackaged = app.isPackaged;

  if (!isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const loadPath = path.join(__dirname, './index.html');
    mainWindow.loadFile(loadPath);

    // 监听页面加载完成
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Page loaded');

      // 5秒后检查页面是否正常渲染
      setTimeout(() => {
        mainWindow.webContents.executeJavaScript(`
          ((typeof window !== 'undefined') ? {
            const root = document.getElementById('root');
            const hasContent = root && root.children.length > 0;
            const bodyText = document.body.innerText.substring(0, 100);
            return { hasContent, bodyText, rootChildren: root ? root.children.length : 0 };
          }
        `).then((result) => {
          console.log('Render check:', result);
          if (!result || !result.hasContent) {
            console.error('App not rendering, redirecting to test page...');
            mainWindow.loadFile(path.join(__dirname, './test.html'));
          }
        }).catch((e) => {
          console.error('Error checking render:', e);
        });
      }, 5000);
    });
  }

  // 错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    mainWindow.webContents.openDevTools();
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details);
  });

  mainWindow.webContents.on('console-message', (event) => {
    if (event.level === 'error') {
      console.error('Renderer Console:', event.message);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
