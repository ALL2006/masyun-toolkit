# 大学生记账本 - 版本开发与发布完整指南

> **重要参考文档** - 本项目已配置自动更新功能，使用 NSIS 安装包格式

## 项目信息

- **项目名称**: 大学生记账本
- **技术栈**: React + TypeScript + Electron + Ant Design
- **GitHub 仓库**: https://github.com/ALL2006/masyun-toolkit
- **更新机制**: electron-updater + GitHub Releases
- **打包格式**: NSIS (.exe 安装程序)

---

## 一、项目配置

### 1.1 package.json 关键配置

```json
{
  "version": "0.1.0",  // ⚠️ 每次发布前必须修改
  "main": "public/electron.js",

  "build": {
    "appId": "com.finance.tracker",
    "productName": "大学生记账本",
    "publish": {
      "provider": "github",
      "owner": "ALL2006",
      "repo": "masyun-toolkit"
    },
    "win": {
      "target": ["nsis"],  // 必须使用 nsis 格式
      "artifactName": "${productName}-Setup-${version}.${ext}",
      "signAndEditExecutable": false  // 跳过签名（避免网络问题）
    }
  },

  "scripts": {
    "build": "react-scripts build",
    "dist": "npm run build && electron-builder --publish=never"
  }
}
```

**关键点**：
- `target` 必须是 `["nsis"]` 才能支持自动更新
- `signAndEditExecutable: false` 避免下载签名工具
- `publish` 配置指向 GitHub 仓库

---

## 二、自动更新功能实现

### 2.1 主进程配置 (public/electron.js)

**已实现的功能**：
- 启动时自动检查更新
- 更新事件监听（error, available, downloading, downloaded）
- IPC 通信接口（手动检查、安装更新）
- 下载完成后弹窗提示用户安装

**关键代码**：
```javascript
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// 配置日志
autoUpdater.logger = log;

// 窗口显示后检查更新
mainWindow.once('ready-to-show', () => {
  mainWindow.show();
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// 下载完成提示用户安装
autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '更新已就绪',
    message: '新版本已下载完成',
    detail: '是否立即安装并重启应用？',
    buttons: ['立即安装', '稍后安装']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});
```

### 2.2 更新通知组件 (src/components/UpdateNotification.tsx)

- 使用 `App.useApp()` 获取 notification API
- 监听主进程的更新消息
- 显示下载进度和完成通知

### 2.3 App.tsx 配置

**重要**：必须用 `AntdApp` 包裹整个应用：
```tsx
<ConfigProvider ...>
  <AntdApp>
    <UpdateNotification />
    {/* 路由 */}
  </AntdApp>
</ConfigProvider>
```

---

## 三、网络问题解决方案

### 3.1 问题现象

```
Error: Get "https://github.com/.../winCodeSign-2.6.0.7z":
dial tcp 127.0.0.1:443: connectex: No connection could be made
```

**原因**：
- 大陆地区无法直接访问 GitHub
- electron-builder 需要下载工具：winCodeSign、nsis、nsis-resources

### 3.2 解决方案

#### 方案 A：使用加速器（推荐）
1. 开启加速器（支持 GitHub）
2. 重新运行打包命令

#### 方案 B：手动下载工具到缓存目录

**所需工具**：
```
https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z

https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z

https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.4.1/nsis-resources-3.4.1.7z
```

**缓存目录**：
```
C:\Users\H3123\AppData\Local\electron-builder\cache\
```

**目录结构**：
```
electron-builder\cache\
├── winCodeSign\
│   └── winCodeSign-2.6.0.7z
├── nsis\
│   └── nsis-3.0.4.1.7z
└── nsis-resources\
    └── nsis-resources-3.4.1.7z
```

---

## 四、打包流程

### 4.1 开发环境运行
```bash
npm run electron-dev
```

### 4.2 生产打包
```bash
# 1. 构建 React 应用
npm run build

# 2. 打包 Electron (NSIS)
npx electron-builder --win nsis
```

**输出文件**：
```
dist\
├── 大学生记账本-Setup-0.1.0.exe  # NSIS 安装程序
├── latest.yml                       # 更新元数据
└── win-unpacked\                    # 未打包版本（调试用）
```

---

## 五、发布新版本完整流程

### 5.1 准备工作

1. **更新版本号**
   - 编辑 `package.json`
   - 修改 `version` 字段（如 0.1.0 → 0.2.0）

2. **确保加速器已开启**
   - 必须能访问 GitHub

### 5.2 打包
```bash
# 清理旧版本
Remove-Item dist -Recurse -Force

# 打包
npm run build
npx electron-builder --win nsis
```

### 5.3 发布到 GitHub

#### 方法 A：使用脚本（推荐）

运行以下脚本之一：
```powershell
# 方式 1：完整发布（包含上传）
.\publish-release.ps1

# 方式 2：仅上传文件
.\upload-files.ps1

# 方式 3：修复并上传
.\fix-upload.ps1
```

#### 方法 B：手动上传

1. 访问：https://github.com/ALL2006/masyun-toolkit/releases/new
2. 创建新 Release：
   - Tag: `v0.2.0`（对应版本号）
   - Title: `v0.2.0`
   - Description: 更新说明
3. 上传文件：
   - `dist\大学生记账本-Setup-0.1.0.exe`
   - `dist\latest.yml`

### 5.4 验证发布

```powershell
# 检查 Release 文件
.\check-release.ps1
```

---

## 六、重要脚本说明

### 脚本列表

| 脚本 | 用途 |
|------|------|
| `check-release.ps1` | 检查 Release 中的文件列表 |
| `publish-release.ps1` | 创建新的 GitHub Release |
| `upload-files.ps1` | 上传 exe 和 yml 文件 |
| `fix-upload.ps1` | 删除旧文件并重新上传 |
| `rename-upload.ps1` | 使用英文文件名上传 |
| `delete-duplicates.ps1` | 删除重复的 latest.yml |
| `check-cache.ps1` | 检查 electron-builder 缓存 |
| `create-zip.ps1` | 创建 ZIP 包（备用方案） |

### GitHub Token 配置

GitHub Token 已存储在 `local.config.ps1` 文件中（该文件已在 .gitignore 中排除）。

其他开发者请参考 `local.config.ps1.example` 创建自己的配置文件。

---

## 七、常见问题排查

### 问题 1：打包失败 - 网络错误
**现象**：`dial tcp 127.0.0.1:443: connectex`

**解决**：
- 确认加速器已开启
- 或手动下载工具到缓存目录

### 问题 2：自动更新不工作
**检查项**：
1. `package.json` 中 `publish` 配置是否正确
2. latest.yml 是否存在且配置正确
3. 网络连接是否正常
4. 应用版本是否与 Release 版本一致

### 问题 3：latest.yml 上传失败 (422)
**原因**：文件已存在

**解决**：删除旧文件后重新上传

### 问题 4：中文文件名上传失败
**解决**：使用英文文件名（Setup-0.1.0.exe）

---

## 八、版本号规范

采用语义化版本号：
```
主版本号.次版本号.修订号 (1.2.3)

- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正
```

示例：
- `0.1.0` → `0.2.0`：新增功能
- `0.2.0` → `0.2.1`：Bug 修复
- `0.2.1` → `1.0.0`：重大更新

---

## 九、用户更新流程

用户安装应用后：
1. ✅ 应用启动时自动检查更新
2. ✅ 发现新版本自动后台下载
3. ✅ 下载完成后弹窗提示
4. ✅ 用户确认后自动安装并重启

---

## 十、快速参考命令

```bash
# 开发环境运行
npm run electron-dev

# 构建生产版本
npm run build

# 打包 NSIS 安装包
npx electron-builder --win nsis

# 检查缓存文件
.\check-cache.ps1

# 上传到 GitHub
.\upload-files.ps1
```

---

## 十一、发布检查清单

- [ ] 版本号已更新（package.json）
- [ ] 加速器已开启（能访问 GitHub）
- [ ] 运行 `npm run build` 成功
- [ ] 运行 `npx electron-builder --win nsis` 成功
- [ ] 检查生成的文件存在：
  - [ ] `dist\大学生记账本-Setup-x.x.x.exe`
  - [ ] `dist\latest.yml`
- [ ] 上传文件到 GitHub Releases
- [ ] 验证下载链接可访问

---

## 十二、项目文件结构

```
personal-finance-tracker\
├── public\
│   └── electron.js              # 主进程入口
├── src\
│   ├── components\
│   │   └── UpdateNotification.tsx  # 更新通知组件
│   ├── pages\                    # 页面组件
│   └── App.tsx                   # 应用入口
├── dist\                         # 打包输出
│   ├── 大学生记账本-Setup-0.1.0.exe
│   └── latest.yml
├── *.ps1                         # 辅助脚本
├── package.json                  # 项目配置
└── AUTO_UPDATE_WORKFLOW.md      # 本文档
```

---

**文档版本**: 1.0
**最后更新**: 2025-12-28
**维护者**: AI 助手团队
