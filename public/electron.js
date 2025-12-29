const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const https = require('https');
const packageJson = require('../package.json');

// 配置日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// GitHub 配置
const GITHUB_OWNER = 'ALL2006';
const GITHUB_REPO = 'masyun-toolkit';
const GITHUB_RELEASE_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASE_PAGE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const CURRENT_VERSION = packageJson.version;

if (process.platform === 'win32') {
  app.setAppUserModelId('com.finance.tracker');
  log.info('App starting...', CURRENT_VERSION);
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

// ========== 辅助函数 ==========

/**
 * 比较版本号
 * 返回: 1 (v1 > v2), -1 (v1 < v2), 0 (v1 == v2)
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * 检查是否能访问 GitHub API
 */
function canAccessGitHub() {
  return new Promise((resolve) => {
    const timeout = 5000; // 5 秒超时

    const req = https.get(GITHUB_RELEASE_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: timeout
    }, (res) => {
      resolve(res.statusCode === 200);
      req.destroy();
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.setTimeout(timeout);
  });
}

/**
 * 获取 GitHub 最新版本信息
 */
function getLatestVersion() {
  return new Promise((resolve, reject) => {
    const timeout = 10000; // 10 秒超时

    const req = https.get(GITHUB_RELEASE_API, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: timeout
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          resolve({
            version: release.tag_name.replace(/^v/, ''),
            releaseDate: release.published_at,
            htmlUrl: release.html_url
          });
        } catch (err) {
          reject(new Error('解析版本信息失败'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.setTimeout(timeout);
  });
}

// ========== IPC 通信处理 ==========

// 手动检查更新（双模式：自动更新 / 手动下载）
ipcMain.handle('check-for-updates', async () => {
  log.info('=== 开始检查更新 ===');
  log.info('当前版本:', CURRENT_VERSION);

  try {
    // 步骤1: 检查是否能访问 GitHub
    sendUpdateMessage({
      type: 'checking',
      message: '正在检查更新...'
    });

    const canAccess = await canAccessGitHub();
    log.info('能否访问 GitHub:', canAccess);

    // 步骤2: 获取最新版本信息
    const latestInfo = await getLatestVersion();
    log.info('最新版本:', latestInfo.version);

    // 步骤3: 比较版本号
    const comparison = compareVersions(latestInfo.version, CURRENT_VERSION);
    log.info('版本比较结果:', comparison);

    if (comparison <= 0) {
      // 当前版本已是最新
      sendUpdateMessage({
        type: 'not-available',
        version: CURRENT_VERSION,
        message: '当前已是最新版本'
      });
      return { success: true, hasUpdate: false };
    }

    // 有新版本可用
    log.info('发现新版本:', latestInfo.version);

    // 步骤4: 根据能否访问 GitHub 选择更新方式
    if (canAccess) {
      // 方案 A: 能访问 GitHub -> 使用 electron-updater 自动更新
      log.info('使用自动更新模式');
      sendUpdateMessage({
        type: 'available',
        version: latestInfo.version,
        message: `发现新版本 ${latestInfo.version}，正在下载...`
      });

      // 开始自动更新
      await autoUpdater.checkForUpdates();
      return { success: true, hasUpdate: true, mode: 'auto' };
    } else {
      // 方案 B: 不能访问 GitHub -> 提示用户手动下载
      log.info('使用手动下载模式');
      sendUpdateMessage({
        type: 'manual-download',
        version: latestInfo.version,
        message: `发现新版本 ${latestInfo.version}`,
        downloadUrl: latestInfo.htmlUrl || GITHUB_RELEASE_PAGE
      });

      // 弹窗提示用户
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '发现新版本',
        message: `最新版本 ${latestInfo.version} 已发布`,
        detail: '检测到您的网络无法直接访问 GitHub，请前往官网手动下载最新版本。\n\n下载后请先卸载当前版本，再安装新版本。',
        buttons: ['前往官网下载', '稍后提醒'],
        defaultId: 0,
        cancelId: 1
      }).then((result) => {
        if (result.response === 0) {
          // 打开浏览器跳转到 Release 页面
          shell.openExternal(latestInfo.htmlUrl || GITHUB_RELEASE_PAGE);
        }
      });

      return { success: true, hasUpdate: true, mode: 'manual' };
    }

  } catch (error) {
    log.error('检查更新失败:', error);
    sendUpdateMessage({
      type: 'error',
      message: '检查更新失败，请稍后重试'
    });
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
