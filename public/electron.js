const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// 配置日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// 配置国内镜像源加速下载
// 使用多个可靠的镜像源以提高可用性和速度
// 测试可用时间: 2025-12-28

// GitHub 上的 latest.yml 在具体版本路径下，需要使用完整 URL
// 格式：https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download/v0.3.0/latest.yml
const MIRROR_LATEST_YML_URL = 'https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download/v0.3.0/latest.yml';

// 配置镜像源
if (process.platform === 'win32') {
  app.setAppUserModelId('com.finance.tracker');

  // 设置为指向包含版本号的完整 latest.yml URL
  autoUpdater.setFeedURL(MIRROR_LATEST_YML_URL);
  log.info('Update feed URL set to mirror:', MIRROR_LATEST_YML_URL);
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    show: false
  });

  // 移除默认菜单
  Menu.setApplicationMenu(null);

  // 加载应用
  // 开发环境: electron.js 在 public/ 目录，build/ 在上一级
  // 生产环境: electron.js 在 build/ 目录中（asar 内部）
  const isPackaged = app.isPackaged;
  const loadPath = isPackaged
    ? path.join(__dirname, 'index.html')  // 生产环境：electron.js 在 build/ 内
    : path.join(__dirname, '../build/index.html'); // 开发环境：build/ 在上一级

  // 添加调试日志
  log.info('=== App Loading ===');
  log.info('isPackaged:', isPackaged);
  log.info('__dirname:', __dirname);
  log.info('loadPath:', loadPath);

  mainWindow.loadFile(loadPath).then(() => {
    log.info('App loaded successfully');
  }).catch((err) => {
    log.error('Failed to load app:', err);
    log.error('Error details:', JSON.stringify(err));
  });

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // 窗口显示后检查更新（仅在非开发环境）
    if (isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
}

// ========== 自动更新事件处理 ==========

// 检查更新错误
autoUpdater.on('error', (error) => {
  log.error('更新检查失败:', error);
  sendUpdateMessage({
    type: 'error',
    message: '更新检查失败，请检查网络连接'
  });
});

// 检查到有可用更新
autoUpdater.on('update-available', (info) => {
  log.info('发现新版本:', info.version);
  sendUpdateMessage({
    type: 'available',
    version: info.version,
    releaseDate: info.releaseDate,
    message: `发现新版本 ${info.version}，正在下载...`
  });
});

// 没有可用更新
autoUpdater.on('update-not-available', (info) => {
  log.info('当前已是最新版本:', info.version);
  sendUpdateMessage({
    type: 'not-available',
    version: info.version,
    message: '当前已是最新版本'
  });
});

// 下载进度
autoUpdater.on('download-progress', (progress) => {
  log.info('下载进度:', Math.round(progress.percent) + '%');
  sendUpdateMessage({
    type: 'downloading',
    percent: Math.round(progress.percent),
    transferred: progress.transferred,
    total: progress.total,
    bytesPerSecond: progress.bytesPerSecond,
    message: `正在下载更新: ${Math.round(progress.percent)}%`
  });
});

// 更新下载完成
autoUpdater.on('update-downloaded', (info) => {
  log.info('更新下载完成:', info.version);
  sendUpdateMessage({
    type: 'downloaded',
    version: info.version,
    message: '更新下载完成，将在重启后安装'
  });

  // 提示用户安装更新
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '更新已就绪',
    message: '新版本已下载完成',
    detail: '是否立即安装并重启应用？',
    buttons: ['立即安装', '稍后安装'],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      // 立即安装并重启
      autoUpdater.quitAndInstall();
    }
  });
});

// 向渲染进程发送更新消息
function sendUpdateMessage(message) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-message', message);
  }
}

// ========== IPC 通信处理 ==========

// 手动检查更新
ipcMain.handle('check-for-updates', async () => {
  try {
    await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (error) {
    log.error('手动检查更新失败:', error);
    return { success: false, error: error.message };
  }
});

// 下载并安装更新
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('下载更新失败:', error);
    return { success: false, error: error.message };
  }
});

// 安装更新并重启
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
  return { success: true };
});

// ========== 应用生命周期 ==========

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
