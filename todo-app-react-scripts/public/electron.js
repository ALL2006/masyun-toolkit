const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const log = require('electron-log');

// 配置日志
log.info('App starting...');

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

  // 移除默认菜单
  Menu.setApplicationMenu(null);

  // 加载应用 - 根据环境选择正确的路径
  const isPackaged = app.isPackaged;

  if (!isPackaged) {
    // 开发环境：加载 React 开发服务器
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的 HTML
    // electron.js 在 asar 中，index.html 也在 asar 的 build 目录中
    const loadPath = path.join(__dirname, './index.html');
    mainWindow.loadFile(loadPath);
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// 应用生命周期
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  });
});
