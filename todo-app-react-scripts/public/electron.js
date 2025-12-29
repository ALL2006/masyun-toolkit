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

  // 加载应用 - 根据环境选择正确的路径（参考通用打包指南）
  const isPackaged = app.isPackaged;
  const loadPath = isPackaged
    ? path.join(__dirname, '../build/index.html')  // 打包后：electron.js在resources/app/public/，build在resources/app/build/
    : 'http://localhost:3000';  // 开发环境：react-scripts 默认端口

  if (!isPackaged) {
    mainWindow.loadURL(loadPath);
    mainWindow.webContents.openDevTools();
  } else {
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
