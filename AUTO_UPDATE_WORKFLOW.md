# 大学生记账本 - 自动更新工作流程

> **重要参考文档** - 本项目已配置 Electron 自动更新功能，请仔细阅读此文档以了解工作流程。

## 项目概述

- **项目名称**: 大学生记账本
- **技术栈**: React + TypeScript + Electron + Ant Design
- **GitHub 仓库**: https://github.com/ALL2006/masyun-toolkit
- **更新机制**: electron-updater + GitHub Releases

## 自动更新功能说明

应用启动时会自动检查 GitHub Releases 上的新版本，发现更新后会：
1. 显示通知提示用户
2. 后台自动下载更新包
3. 下载完成后提示用户安装
4. 用户确认后应用重启并完成更新

---

## 一、项目配置文件说明

### 1. package.json 关键配置

```json
{
  "version": "0.1.0",  // ⚠️ 每次发布前必须修改此版本号
  "main": "public/electron.js",

  "build": {
    "appId": "com.finance.tracker",
    "productName": "大学生记账本",

    // ⚠️ GitHub 发布配置 - 重要
    "publish": {
      "provider": "github",
      "owner": "ALL2006",           // GitHub 用户名
      "repo": "masyun-toolkit"       // 仓库名称
    },

    // Windows 打包配置
    "win": {
      "target": ["nsis"],           // NSIS 支持自动更新（portable 不支持）
      "artifactName": "${productName}-Setup-${version}.${ext}",
      "signingHashAlgorithms": []   // 禁用签名哈希算法
    }
  },

  "scripts": {
    "publish": "npm run build && electron-builder --publish=always"
  }
}
```

### 2. 主进程文件 (public/electron.js)

自动更新核心逻辑已集成：
- 导入 `autoUpdater` 和 `log`
- 配置日志记录
- 实现更新事件监听（error, available, downloading, downloaded）
- 窗口显示后自动检查更新（非开发环境）
- 提供 IPC 通信接口（手动检查更新、安装更新）

### 3. 更新通知组件 (src/components/UpdateNotification.tsx)

- 使用 `App.useApp()` 获取 notification API
- 监听主进程发来的更新消息
- 显示不同状态的通知（发现新版本、下载进度、下载完成）

### 4. App.tsx 配置要求

**重要**: 必须使用 `AntdApp` 包裹整个应用，否则 `App.useApp()` 无法工作：

```tsx
import { ConfigProvider, App as AntdApp } from 'antd';

<ConfigProvider ...>
  <AntdApp>
    <UpdateNotification />
    {/* 路由配置 */}
  </AntdApp>
</ConfigProvider>
```

---

## 二、发布新版本完整流程

### 方式 A：正常发布（网络良好时）

```bash
# 1. 更新版本号（编辑 package.json）
# 例如：0.1.0 -> 0.2.0

# 2. 设置 GitHub Token (从 local.config.ps1 读取)
# Token 已配置在 local.config.ps1 中

# 3. 执行发布命令
.\publish-release.ps1
```

### 方式 B：手动发布（网络问题备用方案）

**适用场景**: 当 electron-builder 因网络问题无法下载代码签名工具时

#### 步骤 1：构建应用
```bash
npm run build
```

#### 步骤 2：创建 GitHub Release
运行脚本 `publish-release.ps1`：
```powershell
powershell -ExecutionPolicy Bypass -File publish-release.ps1
```

#### 步骤 3：上传可执行文件
运行脚本 `upload-asset.ps1`：
```powershell
powershell -ExecutionPolicy Bypass -File upload-asset.ps1
```

#### 步骤 4：创建并上传 latest.yml
运行脚本 `upload-yml.ps1`：
```powershell
powershell -ExecutionPolicy Bypass -File upload-yml.ps1
```

---

## 三、网络问题解决方案

### 问题描述

```
Error: Get "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z":
dial tcp 127.0.0.1:443: connectex: No connection could be made because the target machine actively refused it.
```

### 原因

electron-builder 尝试下载 `winCodeSign` 工具来编辑 Windows 可执行文件的资源（添加图标、版本信息等），但代理设置阻止了连接。

### 解决方案

#### 方案 1：使用已生成的可执行文件

**关键点**: 当打包失败时，可执行文件已经生成在：
```
dist/win-unpacked/大学生记账本.exe
```

直接使用此文件进行发布，无需重新打包。

#### 方案 2：修改配置禁用资源编辑

在 `package.json` 中添加：
```json
{
  "build": {
    "win": {
      "target": ["nsis"],
      "signingHashAlgorithms": [],
      "signAndEditExecutable": false  // 禁用资源编辑
    }
  }
}
```

---

## 四、辅助脚本说明

项目根目录包含以下辅助脚本（仅用于手动发布）：

### publish-release.ps1
创建 GitHub Release

### upload-asset.ps1
上传可执行文件到 Release

### upload-yml.ps1
创建并上传 latest.yml（更新元数据文件）

### check-release.ps1
检查 Release 中的文件列表

---

## 五、版本号规范

采用语义化版本号（Semantic Versioning）：
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

## 六、调试技巧

### 查看更新日志
```
Windows: %APPDATA%\Local\大学生记账本\logs
```

### 手动触发更新检查
在渲染进程中：
```tsx
if (window.require) {
  const { ipcRenderer } = window.require('electron');
  ipcRenderer.invoke('check-for-updates');
}
```

### 验证 latest.yml 内容
访问 GitHub Release 页面，检查 `latest.yml` 文件内容：
```yaml
version: 0.1.0
files:
  - url: https://github.com/ALL2006/masyun-toolkit/releases/download/v0.1.0/xxx.exe
    sha512: [SHA512 哈希]
    size: [文件大小]
path: https://github.com/ALL2006/masyun-toolkit/releases/download/v0.1.0/xxx.exe
sha512: [SHA512 哈希]
releaseDate: 2025-12-27T...
```

### 常见错误排查

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `TS2345: Property 'title' is missing` | Ant Design v6 类型定义问题 | 使用 `as any` 类型断言 |
| `latest.yml 上传失败 (422)` | 文件已存在 | 删除旧文件后重新上传 |
| 更新检测不工作 | publish 配置错误 | 检查 owner/repo 是否正确 |
| `dial tcp 127.0.0.1:443` | 网络代理问题 | 使用手动发布方案 |

---

## 七、发布前检查清单

- [ ] `package.json` 中 `version` 已更新
- [ ] `package.json` 中 `publish` 配置正确
- [ ] 代码已提交到 Git 仓库
- [ ] GitHub Token 有效且未过期
- [ ] 可执行文件能正常运行（本地测试）
- [ ] `latest.yml` 包含正确的 SHA512 哈希
- [ ] Release 描述和版本号一致

---

## 八、快速参考命令

```bash
# 开发环境运行
npm run electron-dev

# 构建生产版本
npm run build

# 仅打包不发布
npm run dist

# 发布新版本（自动）
npm run publish

# 检查 Release 文件
powershell -ExecutionPolicy Bypass -File check-release.ps1
```

---

## 九、联系方式

- GitHub Issues: https://github.com/ALL2006/masyun-toolkit/issues
- 仓库地址: https://github.com/ALL2006/masyun-toolkit

---

## 十、更新历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 0.1.0 | 2025-12-27 | 初始版本，实现自动更新功能 |
