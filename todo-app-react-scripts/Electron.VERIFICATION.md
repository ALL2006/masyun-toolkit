# Electron 打包验证机制指南

## 问题背景
之前遇到的问题：**本地开发正常，但打包后用户下载出现白屏**

这是 Electron 开发中最常见的问题，需要建立完整的验证流程。

---

## 🚀 白屏问题根本原因

### 1. 路径问题（最常见）
```javascript
// ❌ 错误：相对路径在打包后可能失效
mainWindow.loadFile('./index.html');

// ✅ 正确：使用绝对路径
mainWindow.loadFile(path.join(__dirname, '../index.html'));
```

### 2. CSP（内容安全策略）限制
React 应用在 Electron 中需要正确的 CSP 配置。

### 3. 上下文隔离问题
`nodeIntegration` 和 `contextIsolation` 的配置直接影响渲染进程。

### 4. 打包文件结构问题
`electron.js`、`index.html`、静态资源的路径关系。

---

## ✅ 完整验证流程（3级验证）

### Level 1: 开发环境验证（快速反馈）
```bash
# 1. 启动开发环境
npm run electron-dev

# 2. 检查控制台是否有错误
# 3. 测试核心功能：创建任务、编辑任务、拖拽
```

### Level 2: 构建产物验证（关键步骤）
```bash
# 1. 构建生产版本
npm run build

# 2. 使用 serve 测试构建产物（推荐）
npx serve -s build -l 5000

# 3. 浏览器访问 http://localhost:5000
#    - 检查页面是否正常加载
#    - 检查所有静态资源是否加载成功
#    - 测试 localStorage 是否正常工作

# 4. 检查构建产物结构
#    build/
#    ├── index.html          ✅ 必须存在
#    ├── static/             ✅ 静态资源
#    └── asset-manifest.json ✅ 资源清单
```

**⚠️ 如果 Level 2 失败，不要继续打包！**

### Level 3: 打包应用验证（最终确认）
```bash
# 1. 快速打包测试（不生成安装包）
npm run build && npx electron-builder --dir

# 2. 运行未打包的应用
# Windows: dist\win-unpacked\待办事项管理.exe
# 直接运行，测试所有功能

# 3. 如果快速测试成功，再生成完整安装包
npm run build-electron-win-unsigned

# 4. 安装并测试
#    - 双击安装
#    - 启动应用
#    - 测试所有核心功能
#    - 重启应用测试数据持久化
```

---

## 🛠 改进的 electron.js 配置

### 增强版 electron.js 特性
- ✅ 自动检测构建路径
- ✅ 详细的错误日志
- ✅ 生产环境调试工具
- ✅ 加载失败自动重试
- ✅ 预加载脚本支持

### 错误处理机制
```javascript
// 加载失败处理
mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('加载失败:', errorCode, errorDescription);
});

// 渲染进程崩溃处理
mainWindow.webContents.on('render-process-gone', (event, details) => {
  console.error('渲染进程崩溃:', details);
});
```

---

## 📋 打包前检查清单

### 代码检查
- [ ] `npm run build` 成功
- [ ] 使用 `npx serve -s build` 测试通过
- [ ] 检查控制台无错误
- [ ] 测试 localStorage 正常工作

### 路径检查
- [ ] `electron.js` 中的 `__dirname` 路径正确
- [ ] `index.html` 中的资源路径正确（`homepage: "./"`）
- [ ] 静态资源加载正常

### 打包检查
- [ ] 快速测试通过（`electron-builder --dir`）
- [ ] 未打包版本运行正常
- [ ] 完整安装包生成成功
- [ ] 安装后应用启动正常

---

## 🐛 调试技巧

### 1. 生产环境打开 DevTools
```javascript
// electron.js 中添加
if (isPackaged) {
  // 按F12打开开发者工具
  mainWindow.webContents.openDevTools();
}
```

### 2. 查看完整日志
```bash
# Windows
%APPDATA%\Local\待办事项管理\logs

# macOS
~/Library/Logs/待办事项管理
```

### 3. 检查渲染进程错误
```javascript
// electron.js
mainWindow.webContents.on('console-message', (event, level, message) => {
  console.log('渲染进程日志:', message);
});
```

---

## 📊 常见白屏问题排查表

| 症状 | 可能原因 | 解决方案 |
|------|---------|---------|
| 完全白屏 | HTML 加载失败 | 检查 `loadFile` 路径 |
| 白屏 + 控制台错误 | JS 加载失败 | 检查 `homepage` 配置 |
| 白屏 + React 报错 | 渲染错误 | 检查 ErrorBoundary |
| 偶尔白屏 | 资源加载顺序 | 添加 `ready-to-show` |
| 打包后白屏 | 路径问题 | 使用 Level 2 验证 |

---

## 🎯 推荐工作流程

```
1. 代码修改
   ↓
2. npm run electron-dev (开发测试)
   ↓
3. npm run build (构建)
   ↓
4. npx serve -s build (Level 2 验证) ← 如果失败，回到步骤1
   ↓
5. electron-builder --dir (快速打包)
   ↓
6. 运行未打包版本 (Level 3-1 验证) ← 如果失败，检查路径
   ↓
7. npm run build-electron-win-unsigned (完整打包)
   ↓
8. 安装并测试 (Level 3-2 验证) ← 如果失败，查看日志
   ↓
9. 上传到 GitHub
```

**重点：在 Level 2 验证通过之前，不要继续后续步骤！**
