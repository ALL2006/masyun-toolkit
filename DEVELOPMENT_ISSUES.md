# TimelineFlow 开发问题总结

本文档记录了 TimelineFlow 应用开发过程中遇到的所有问题及解决方案。

---

## 目录

1. [语法错误：括号不匹配](#1-语法错误括号不匹配)
2. [打包后应用启动失败](#2-打包后应用启动失败)
3. [应用白屏问题](#3-应用白屏问题)
4. [Electron 版本兼容性](#4-electron-版本兼容性)
5. [数据类型转换问题](#5-数据类型转换问题)

---

## 1. 语法错误：括号不匹配

### 问题描述

应用在启动时报错：
```
SyntaxError: Unexpected token ')'
at electron.js:58
```

### 根本原因

`electron.js` 文件中存在多余的括号，导致括号数量不匹配。经检查发现有 26 个 `(` 但有 27 个 `)`。

### 解决方案

重写 `electron.js` 文件，使用更简洁的结构：

```javascript
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
    }
  });

  Menu.setApplicationMenu(null);

  const isPackaged = app.isPackaged;

  if (isPackaged) {
    mainWindow.loadFile(path.join(__dirname, './index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  }

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
```

### 教训

- 使用工具（如 `node --check`）验证 JavaScript 语法
- 使用代码编辑器的括号匹配功能
- 定期检查代码的括号平衡

---

## 2. 打包后应用启动失败

### 问题描述

用户安装应用后启动时报错：
```
A JavaScript error occurred in the main process
Uncaught Exception:
D:\...\electron.js:57
SyntaxError: Unexpected token ')'
```

### 根本原因

打包后的 `build/electron.js` 文件与源码 `public/electron.js` 不同步，且存在路径问题。

### 解决方案

确保 React 构建过程正确复制 `public/electron.js` 到 `build/` 目录，并验证打包后的文件内容。

### 验证方法

```bash
# 检查语法
node --check build/electron.js

# 检查打包内容
npx asar list "dist/win-unpacked/resources/app.asar"
```

---

## 3. 应用白屏问题

### 问题描述

应用第一次打开正常，关闭后重新打开显示白屏，控制台无错误信息。

### 可能原因分析

1. **localStorage 数据损坏** - 存储的数据格式不正确
2. **React 初始化逻辑问题** - useEffect 依赖导致循环执行
3. **组件渲染错误** - 未被捕获的异常
4. **路径问题** - 打包后资源路径不正确

### 解决方案

#### 3.1 添加 ErrorBoundary 组件

创建 `src/components/ErrorBoundary.tsx`：

```tsx
import React from 'react';

export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', backgroundColor: '#fff0f0' }}>
          <h1 style={{ color: '#ff0000' }}>应用出错了</h1>
          <pre>{this.state.error?.stack || this.state.error?.message}</pre>
          <button onClick={() => localStorage.clear()}>
            清除数据并重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### 3.2 修复 React 初始化逻辑

分离数据导入和示例数据添加，防止循环：

```typescript
// 第一阶段：导入已有数据
useEffect(() => {
  if (hasInitialized) return;

  const savedData = localStorage.getItem('timelineflow-tasks');
  if (savedData) {
    try {
      importTasks(savedData);
    } catch (error) {
      console.error('Failed to load saved data:', error);
      localStorage.removeItem('timelineflow-tasks');
    }
  }

  setHasInitialized(true);
}, [hasInitialized, importTasks]);

// 第二阶段：添加示例数据（仅在首次使用时）
useEffect(() => {
  if (!hasInitialized || tasks.length > 0) return;
  // 添加示例数据...
}, [hasInitialized, tasks.length, addTask]);
```

#### 3.3 创建测试页面

创建 `public/test.html` 用于诊断：

```html
<!DOCTYPE html>
<html>
<head>
    <title>TimelineFlow 测试页面</title>
</head>
<body>
    <h1>TimelineFlow 测试页面</h1>
    <button onclick="testLocalStorage()">测试本地存储</button>
    <button onclick="goToApp()">打开主应用</button>
    <div id="result"></div>
</body>
</html>
```

---

## 4. Electron 版本兼容性

### 问题描述

使用 Electron 33.x 版本时，`npx electron -e` 命令返回字符串而非对象：

```javascript
const { app } = require('electron');
console.log(typeof app); // "undefined"
```

### 解决方案

降级到 Electron 28.3.3（更稳定的版本）：

```bash
npm install electron@28.3.3 --save-dev
```

### 版本选择

| 版本 | 状态 | 说明 |
|------|------|------|
| 28.3.3 | ✅ 稳定 | 生产环境使用，兼容性好 |
| 33.3.1 | ⚠️ 问题 | `require()` 返回类型异常 |

---

## 5. 数据类型转换问题

### 问题描述

从 localStorage 读取数据后报错：
```
TypeError: t.startTime.getTime is not a function
```

### 根本原因

JSON 序列化会将 Date 对象转换为字符串，但反序列化时不会自动转回 Date 对象：

```javascript
// 保存时
const task = { startTime: new Date() };
localStorage.setItem('task', JSON.stringify(task));

// 读取后
const task = JSON.parse(localStorage.getItem('task'));
console.log(typeof task.startTime); // "string"
console.log(task.startTime.getTime); // TypeError!
```

### 解决方案

在 `importTasks` 函数中手动转换日期字段：

```typescript
importTasks: (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    if (data.tasks && Array.isArray(data.tasks)) {
      // 将日期字符串转换回 Date 对象
      const tasks = data.tasks.map((task: any) => ({
        ...task,
        startTime: new Date(task.startTime),
        endTime: new Date(task.endTime),
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
      }));
      set({ tasks });
    }
  } catch (error) {
    console.error('导入失败:', error);
    throw new Error('数据格式不正确');
  }
}
```

### 最佳实践

对于包含 Date 对象的数据：

1. **序列化时**：使用 `JSON.stringify()` - 会自动转换为 ISO 字符串
2. **反序列化时**：手动将字符串转回 Date 对象
3. **或者**：使用专门的日期序列化库（如 `json-date-stringify`）

---

## 总结

### 关键教训

1. **始终验证语法** - 使用 `node --check` 或 ESLint
2. **测试打包版本** - 开发环境正常不代表生产环境正常
3. **处理 Date 序列化** - JSON 不会自动处理 Date 对象
4. **使用错误边界** - 捕获 React 渲染错误
5. **简化依赖** - 避免 useEffect 循环依赖
6. **选择稳定版本** - 生产环境使用经过验证的版本

### 检查清单

- [ ] 代码语法检查通过
- [ ] 本地开发环境测试通过
- [ ] 打包后的应用测试通过
- [ ] 数据持久化测试通过
- [ ] 多次打开/关闭测试通过
- [ ] 错误处理覆盖关键路径

---

## 相关文件

- `public/electron.js` - Electron 主进程入口
- `src/App.tsx` - React 应用主组件
- `src/store/taskStore.ts` - 状态管理
- `src/components/ErrorBoundary.tsx` - 错误边界组件
- `public/test.html` - 测试诊断页面
- `public/clear-data.html` - 数据清理工具

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2025-12-29 | v0.1.0 | 初始发布 |
| 2025-12-29 | v0.2.0 | 修复括号匹配错误 |
| 2025-12-30 | v1.0.0-timeline | 修复白屏和数据转换问题 |
