# TimelineFlow

> 一款简洁优雅的待办事项管理工具

[![Release](https://img.shields.io/badge/release-v1.0.0-blue)](https://github.com/ALL2006/masyun-toolkit/releases/tag/v1.0.0-timeline)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 特性

- **周/月视图**: 直观的日历视图展示任务
- **任务管理**: 创建、编辑、删除任务
- **优先级颜色**: 根据任务优先级显示不同颜色
- **拖拽调整**: 拖动任务调整时间
- **数据持久化**: 本地存储数据，关闭不丢失
- **导入/导出**: 支持数据备份和恢复

## 技术栈

- **前端**: React 18.3 + TypeScript
- **状态管理**: Zustand 5.0
- **日历组件**: FullCalendar 6.1
- **桌面框架**: Electron 28.3
- **构建工具**: Electron Builder 25.1
- **日期处理**: Day.js 1.11

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/ALL2006/masyun-toolkit.git
cd masyun-toolkit/todo-app-react-scripts

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run electron-dev
```

### 构建

```bash
# 构建 Windows 应用
npm run build-electron-win-unsigned

# 构建 macOS 应用
npm run build-electron-mac
```

## 发布

### 自动发布到 GitHub

```bash
# 发布到 GitHub Release
npm run release:github
```

### 手动发布到 Gitee

由于 Gitee API 限制，需要手动上传文件：

1. 访问 https://gitee.com/haobinjun/masyun-toolkit/releases
2. 找到 `v1.0.0-timeline` 版本
3. 点击编辑并上传以下文件：
   - `dist/todo-app-setup-1.0.0.exe`
   - `dist/builder-debug.yml`

## 下载

- [GitHub Release](https://github.com/ALL2006/masyun-toolkit/releases/tag/v1.0.0-timeline)
- [Gitee Release](https://gitee.com/haobinjun/masyun-toolkit/releases/tag/v1.0.0-timeline)

## 系统要求

- Windows 10 或更高版本

## 项目结构

```
todo-app-react-scripts/
├── public/           # 静态资源和 Electron 主进程
├── src/
│   ├── components/   # React 组件
│   │   ├── CalendarView.tsx    # 日历视图
│   │   ├── TaskForm.tsx        # 任务表单
│   │   ├── TaskDialog.tsx      # 任务对话框
│   │   └── ErrorBoundary.tsx   # 错误边界
│   ├── store/        # 状态管理
│   ├── types/        # TypeScript 类型定义
│   ├── utils/        # 工具函数
│   └── App.tsx       # 主应用组件
├── scripts/          # 构建和发布脚本
└── dist/             # 打包输出目录
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm run electron-dev` | 启动 Electron 开发模式 |
| `npm run build` | 构建 React 应用 |
| `npm run build-electron-win-unsigned` | 构建 Windows 安装包 |
| `npm run release:github` | 发布到 GitHub Release |
| `npm run release:gitee` | 发布到 Gitee Release |
| `npm run release:all` | 同时发布到 GitHub 和 Gitee |

## 开发指南

### 验证构建

```bash
# 第1层：编译检查
npm run verify:l1

# 第2层：浏览器测试
npm run verify:l2

# 第3层：打包测试
npm run verify:l3-quick
```

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks

## 常见问题

### 1. 应用白屏

确保已关闭所有运行中的应用实例：

```bash
taskkill /F /IM "待办事项管理.exe"
```

### 2. 构建失败

删除 `dist` 和 `build` 目录后重新构建：

```bash
rm -rf dist build
npm run build-electron-win-unsigned
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-12-30)

- 初始正式发布
- 实现周视图和月视图
- 支持任务的创建、编辑、删除
- 优先级颜色编码
- 数据导入/导出功能

---

**TimelineFlow** - 让时间管理更简单
