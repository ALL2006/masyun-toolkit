const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const https = require('https');
const log = require('electron-log');

// 加载 package.json
let packageJson;
try {
  packageJson = require('../package.json');
} catch (e) {
  packageJson = { version: '0.4.0' };
}

// GitHub 配置
const GITHUB_OWNER = 'ALL2006';
const GITHUB_REPO = 'masyun-toolkit';
const GITHUB_RELEASE_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASE_PAGE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const CURRENT_VERSION = packageJson.version;

log.info('App starting...');
log.info('Electron version:', process.versions.electron);

let autoUpdater = null;
let mainWindow;

// 初始化 autoUpdater
function initAutoUpdater() {
  try {
    if (app && app.isPackaged) {
      const { autoUpdater: Au } = require('electron-updater');
      autoUpdater = Au;
      autoUpdater.logger = log;
      autoUpdater.logger.transports.file.level = 'info';
    }
  } catch (error) {
    log.warn('autoUpdater not available:', error.message);
  }
}

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

  Menu.setApplicationMenu(null);

  const isPackaged = app.isPackaged;
  const loadPath = isPackaged
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, '../build/index.html');

  log.info('=== App Loading ===');
  log.info('isPackaged:', isPackaged);
  log.info('__dirname:', __dirname);
  log.info('loadPath:', loadPath);

  mainWindow.loadFile(loadPath).then(() => {
    log.info('App loaded successfully');
  }).catch((err) => {
    log.error('Failed to load app:', err);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isPackaged && autoUpdater) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
}

function sendUpdateMessage(message) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-message', message);
  }
}

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

function canAccessGitHub() {
  return new Promise((resolve) => {
    const timeout = 5000;
    const req = https.get(GITHUB_RELEASE_API, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: timeout
    }, (res) => {
      resolve(res.statusCode === 200);
      req.destroy();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.setTimeout(timeout);
  });
}

function getLatestVersion() {
  return new Promise((resolve, reject) => {
    const timeout = 10000;
    const req = https.get(GITHUB_RELEASE_API, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: timeout
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
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
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.setTimeout(timeout);
  });
}

function registerIpcHandlers() {
  ipcMain.handle('check-for-updates', async () => {
    log.info('=== 开始检查更新 ===');
    log.info('当前版本:', CURRENT_VERSION);

    try {
      sendUpdateMessage({
        type: 'checking',
        message: '正在检查更新...'
      });

      const canAccess = await canAccessGitHub();
      const latestInfo = await getLatestVersion();
      const comparison = compareVersions(latestInfo.version, CURRENT_VERSION);

      if (comparison <= 0) {
        sendUpdateMessage({
          type: 'not-available',
          version: CURRENT_VERSION,
          message: '当前已是最新版本'
        });
        return { success: true, hasUpdate: false };
      }

      if (canAccess && autoUpdater) {
        sendUpdateMessage({
          type: 'available',
          version: latestInfo.version,
          message: `发现新版本 ${latestInfo.version}，正在下载...`
        });
        await autoUpdater.checkForUpdates();
        return { success: true, hasUpdate: true, mode: 'auto' };
      } else {
        sendUpdateMessage({
          type: 'manual-download',
          version: latestInfo.version,
          downloadUrl: latestInfo.htmlUrl || GITHUB_RELEASE_PAGE
        });

        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: '发现新版本',
          message: `最新版本 ${latestInfo.version} 已发布`,
          detail: '检测到您的网络无法直接访问 GitHub，请前往官网手动下载最新版本。',
          buttons: ['前往官网下载', '稍后提醒'],
          defaultId: 0,
          cancelId: 1
        }).then((result) => {
          if (result.response === 0) {
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

  ipcMain.handle('download-update', async () => {
    try {
      if (autoUpdater) {
        await autoUpdater.downloadUpdate();
      }
      return { success: true };
    } catch (error) {
      log.error('下载更新失败:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('install-update', () => {
    if (autoUpdater) {
      autoUpdater.quitAndInstall();
    }
    return { success: true };
  });
}

function main() {
  initAutoUpdater();

  app.whenReady().then(() => {
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.finance.tracker');
      log.info('App User Model ID set, version:', CURRENT_VERSION);
    }
    registerIpcHandlers();
    createWindow();
  });

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
}

main();
