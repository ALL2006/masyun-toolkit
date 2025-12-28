# 大学生记账本 - 开发指南

> 本文档记录项目开发过程中遇到的所有问题和解决方案，为后续开发和 AI 协作提供参考。

---

## 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [核心问题与解决方案](#核心问题与解决方案)
5. [Electron 开发最佳实践](#electron-开发最佳实践)
6. [发布流程](#发布流程)
7. [调试技巧](#调试技巧)
8. [常见问题排查](#常见问题排查)

---

## 项目概述

- **项目名称**: 大学生记账本 (Personal Finance Tracker)
- **当前版本**: v0.2.0
- **GitHub 仓库**: https://github.com/ALL2006/masyun-toolkit
- **开发平台**: Windows (支持 macOS/Android)

---

## 技术栈

### 前端
- **React 19.2.1** - UI 框架
- **TypeScript 4.9.5** - 类型系统
- **Ant Design 6.0.1** - UI 组件库
- **React Router DOM 7.10.1** - 路由管理
- **Chart.js 4.5.1** - 图表库

### 桌面端
- **Electron 33.3.1** - 桌面应用框架
- **electron-updater 6.6.2** - 自动更新
- **electron-log 5.4.3** - 日志记录
- **electron-builder 25.1.8** - 应用打包

### 数据存储
- **Dexie 4.2.1** - IndexedDB 封装

### 开发工具
- **react-scripts 5.0.1** - 开发服务器
- **concurrently 9.2.1** - 并行运行命令

---

## 项目结构

```
personal-finance-tracker/
├── public/
│   └── electron.js              # Electron 主进程入口
├── src/
│   ├── components/              # React 组件
│   ├── pages/                   # 页面组件
│   ├── services/                # 业务逻辑服务
│   ├── db/                      # 数据库配置
│   ├── types/                   # TypeScript 类型
│   └── utils/                   # 工具函数
├── dist/                        # 打包输出目录
└── package.json                 # 项目配置
```

---

## 核心问题与解决方案

### 问题 1: 自动更新文件名不匹配

**症状**:
- v0.1.0 版本无法检测到 v0.2.0 更新
- `latest.yml` 中的文件名与实际 exe 文件名不一致

**原因**:
```json
// 错误配置
"artifactName": "${productName}-Setup-${version}.${ext}"
// 生成: 大学生记账本-Setup-0.1.0.exe

// latest.yml 中
"url": "personal-finance-tracker-setup-0.1.0.exe"
```

中文文件名在上传到 GitHub 时被处理，导致文件名不匹配。

**解决方案**:
```json
// package.json
"win": {
  "artifactName": "finance-tracker-setup-${version}.${ext}"
}
```

**规则**:
- ✅ 使用英文文件名
- ✅ 避免特殊字符和空格
- ✅ 保持文件名简洁

---

### 问题 2: 白屏 - 路径解析错误

**症状**:
- 应用启动后显示空白页面
- 控制台错误: `Not allowed to load local resource: .../app.asar/build/build/index.html`

**根本原因**:
electron-builder 打包后的文件结构：
```
app.asar/
├── build/              # build 文件夹
│   ├── index.html
│   └── static/
├── electron.js         # ⚠️ 在 build/ 目录内！
└── node_modules/
```

**错误代码**:
```javascript
// ❌ 错误：__dirname 已经包含 /build
const loadPath = path.join(__dirname, 'build', 'index.html');
// 结果：app.asar/build/build/index.html
```

**正确代码**:
```javascript
// ✅ 正确：electron.js 在 build/ 内，index.html 也在 build/ 内
const isPackaged = app.isPackaged;
const loadPath = isPackaged
  ? path.join(__dirname, 'index.html')           // 生产环境
  : path.join(__dirname, '../build/index.html');  // 开发环境
```

**关键点**:
- `app.isPackaged` 是 Electron 官方推荐的环境检测方式
- 打包后 `electron.js` 位于 `app.asar/build/` 目录
- 不要使用 `process.env.NODE_ENV`，在生产环境中可能不准确

---

### 问题 3: React Router 上下文错误

**症状**:
```
Uncaught Error: useNavigate() may be used only in the context of a <Router> component.
at FloatingAddButton.tsx:11:20
```

**原因**:
`FloatingAddButton` 组件放在 `App.tsx` 中的 `<Routes>` 外部，但使用了 `useNavigate()` Hook。

**错误代码**:
```tsx
// App.tsx
<Routes>
  <Route path="/" element={<Home />} />
  {/* ... */}
</Routes>

<FloatingAddButton />  // ❌ 在 Routes 外部

// FloatingAddButton.tsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();  // ❌ 错误：不在 Router 上下文
```

**解决方案**:
```tsx
// FloatingAddButton.tsx
const handleClick = () => {
  // ✅ 使用 window.location.hash，不依赖 Router 上下文
  window.location.hash = '#/add';
};
```

**规则**:
- 全局组件（在 Router 外部）不能使用 `useNavigate`、`useLocation` 等 Hook
- 使用 `window.location.hash` 代替
- 或者将组件移到 Router 内部

---

## Electron 开发最佳实践

### 1. 路径处理

#### ✅ 推荐做法

```javascript
// 环境检测
const isPackaged = app.isPackaged;

// 文件路径
const indexPath = isPackaged
  ? path.join(__dirname, 'index.html')
  : path.join(__dirname, '../build/index.html');

mainWindow.loadFile(indexPath);
```

#### ❌ 避免做法

```javascript
// ❌ 不要使用 process.env.NODE_ENV
if (process.env.NODE_ENV !== 'development') { /* ... */ }

// ❌ 不要硬编码路径
mainWindow.loadFile('C:\\path\\to\\index.html');

// ❌ 不要假设 __dirname 的位置
mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
```

### 2. 文件命名

```json
{
  "win": {
    "artifactName": "finance-tracker-setup-${version}.${ext}"
  }
}
```

**命名规则**:
- 只使用 ASCII 字符（a-z, A-Z, 0-9, -, _, .）
- 避免中文字符
- 避免空格
- 使用小写字母和连字符

### 3. 路由管理

#### Router 外部组件

```tsx
// ✅ 正确：使用 window.location.hash
const GlobalButton: React.FC = () => {
  return (
    <button onClick={() => window.location.hash = '#/add'}>
      添加
    </button>
  );
};
```

#### Router 内部组件

```tsx
// ✅ 正确：使用 useNavigate
const PageButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/add')}>
      添加
    </button>
  );
};
```

### 4. 日志记录

```javascript
const log = require('electron-log');

// 配置日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// 记录关键事件
log.info('=== App Loading ===');
log.info('isPackaged:', isPackaged);
log.info('__dirname:', __dirname);
log.info('loadPath:', loadPath);
```

---

## 发布流程

### 版本发布步骤

1. **更新版本号** (`package.json`)
   ```json
   "version": "0.2.0"
   ```

2. **构建 React 应用**
   ```bash
   npm run build
   ```

3. **打包 Electron 应用**
   ```bash
   npx electron-builder --win nsis
   ```

4. **验证打包文件**
   - 检查 `dist/latest.yml` 文件名是否正确
   - 检查 `dist/finance-tracker-setup-x.x.x.exe` 是否存在

5. **发布到 GitHub**
   - 删除旧的 Release
   - 创建新的 Release
   - 上传 exe 和 latest.yml

### 版本号规则

| 版本类型 | 示例 | 说明 |
|---------|------|------|
| 主版本 | 1.0.0 | 不兼容的 API 变更 |
| 次版本 | 0.2.0 | 向后兼容的功能新增 |
| 修订版 | 0.2.1 | 向后兼容的问题修复 |

---

## 调试技巧

### 1. 查看日志

```bash
# Windows 日志位置
C:\Users\用户名\AppData\Roaming\大学生记账本\logs\
```

### 2. 添加调试日志

```javascript
// electron.js
log.info('=== Debug ===');
log.info('Variable:', variable);
log.error('Error:', error);
```

### 3. 临时打开开发者工具

```javascript
// electron.js
mainWindow.once('ready-to-show', () => {
  mainWindow.show();
  mainWindow.webContents.openDevTools();  // 临时调试
});
```

### 4. 检查 asar 内容

```bash
npx asar list "dist\win-unpacked\resources\app.asar"
npx asar extract "dist\win-unpacked\resources\app.asar" "dist\extracted"
```

---

## 常见问题排查

### 白屏问题

**检查清单**:
1. ✅ 检查 `loadPath` 是否正确
2. ✅ 确认 `index.html` 在 asar 中的位置
3. ✅ 验证 `__dirname` 指向正确目录
4. ✅ 查看日志中的加载路径

**调试步骤**:
```javascript
// 添加详细日志
log.info('isPackaged:', app.isPackaged);
log.info('__dirname:', __dirname);
log.info('loadPath:', loadPath);

// 验证文件是否存在
const fs = require('fs');
log.info('File exists:', fs.existsSync(loadPath));
```

### 自动更新不工作

**检查清单**:
1. ✅ `app-update.yml` 配置正确
2. ✅ `latest.yml` 文件名匹配
3. ✅ 网络可访问 GitHub
4. ✅ `electron-updater` 配置正确

**调试步骤**:
```javascript
// 添加更新事件监听
autoUpdater.on('error', (error) => {
  log.error('Update error:', error);
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('No update available:', info);
});
```

### Router 错误

**症状**: `useNavigate() may be used only in the context of a <Router>`

**解决方案**:
```tsx
// 方案 1: 使用 window.location.hash（推荐用于全局组件）
window.location.hash = '#/path';

// 方案 2: 将组件移到 Router 内部
<Routes>
  <Route path="/" element={<Layout><Home /></Layout>} />
</Routes>
```

---

## 开发命令

```bash
# 开发模式（React + Electron）
npm run electron-dev

# 构建 React
npm run build

# 打包 Electron 应用
npm run dist

# 打包并发布
npm run publish
```

---

## 重要注意事项

### ⚠️ 绝对不要做

1. **硬编码路径**
   ```javascript
   // ❌ 错误
   mainWindow.loadFile('C:\\App\\index.html');
   ```

2. **假设 __dirname 位置**
   ```javascript
   // ❌ 错误
   mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
   ```

3. **在 Router 外使用 useNavigate**
   ```tsx
   // ❌ 错误
   const navigate = useNavigate();
   ```

4. **使用中文文件名**
   ```json
   // ❌ 错误
   "artifactName": "应用-安装程序-${version}.exe"
   ```

### ✅ 推荐做法

1. **使用 app.isPackaged 检测环境**
2. **使用相对路径**
3. **全局组件使用 window.location.hash**
4. **使用英文文件名**
5. **添加详细日志**

---

## 文档更新记录

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-12-28 | v0.2.0 | 创建文档，记录白屏和 Router 问题 |
| 2025-12-28 | v0.2.0 | 添加自动更新问题解决方案 |

---

## 附录

### 相关文件

- [package.json](../package.json) - 项目配置
- [public/electron.js](../public/electron.js) - Electron 主进程
- [RELEASE_WORKFLOW.md](RELEASE_WORKFLOW.md) - 发布流程

### 参考资料

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [electron-updater 文档](https://www.electronjs.org/docs/latest/tutorial/updates)
- [React Router 文档](https://reactrouter.com/)
