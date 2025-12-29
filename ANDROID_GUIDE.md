# Android 移动端开发指南

> 本文档介绍 Android 移动端的开发、调试和打包流程

---

## 📱 功能特性

### 移动端适配
- ✅ **响应式布局** - 自动适配横屏和竖屏
- ✅ **底部导航栏** - 移动端专属的底部导航
- ✅ **触摸优化** - 优化触摸交互体验
- ✅ **安全区域适配** - 支持 iPhone X 刘海屏
- ✅ **本地存储** - 基于 IndexedDB，无需服务器

### 屏幕方向支持
| 方向 | 状态 | 说明 |
|------|------|------|
| 竖屏 (Portrait) | ✅ 完全支持 | 移动端主要使用场景 |
| 横屏 (Landscape) | ✅ 完全支持 | 自动调整布局 |

---

## 🛠️ 开发环境准备

### 必需软件

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | 16+ | JavaScript 运行环境 |
| npm | 8+ | 包管理器 |
| Java JDK | 8 或 11+ | Android 编译 |
| Android Studio | 最新版 | Android 开发工具 |

### 环境检查

```bash
# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 Java
java -version
```

---

## 📦 快速开始

### 方式一：使用打包脚本（推荐）

```powershell
# 在项目根目录运行
.\build-android.ps1
```

脚本会自动：
1. 检查开发环境
2. 安装项目依赖
3. 构建 React 应用
4. 同步资源到 Capacitor
5. 打开 Android Studio

### 方式二：手动构建

```bash
# 1. 安装依赖
npm install

# 2. 构建 React 应用
npm run build

# 3. 同步到 Capacitor
npx cap sync android

# 4. 打开 Android Studio
npx cap open android
```

---

## 🔄 开发调试

### 实时预览（推荐）

```bash
# 1. 启动开发服务器
npm start

# 2. 在另一个终端更新 Capacitor 配置指向本地服务器
# 编辑 capacitor.config.ts，取消注释：
# url: 'http://localhost:3000'

# 3. 同步并打开
npx cap sync android
npx cap open android
```

### Android Studio 调试

1. **连接设备**
   - 启用 USB 调试
   - 连接电脑

2. **运行应用**
   - 点击 Run 按钮
   - 或按 `Shift + F10`

3. **查看日志**
   - 打开 Logcat
   - 过滤标签：`Capacitor`、`WebView`

---

## 📱 屏幕方向适配

### 代码实现

应用已内置屏幕方向检测和适配：

```typescript
// 设备检测工具
import { isMobile, getOrientation, isLandscape } from './utils/device';

// 获取当前方向
const orientation = getOrientation(); // 'portrait' | 'landscape'

// 检测是否横屏
if (isLandscape()) {
  // 横屏特定处理
}
```

### 响应式样式

```css
/* 竖屏样式 */
@media (max-width: 768px) and (orientation: portrait) {
  .container {
    flex-direction: column;
  }
}

/* 横屏样式 */
@media (max-width: 1024px) and (orientation: landscape) {
  .mobile-layout-footer {
    height: 50px !important;
  }
}
```

### 测试不同方向

**模拟器测试**：
1. Ctrl + F12 (Windows/Linux) 或 Cmd + F12 (Mac)
2. 或在模拟器设置中旋转

**真机测试**：
- 旋转设备即可自动切换

---

## 🏗️ 构建和打包

### Debug 版本（开发测试）

```bash
# 在 android 目录下运行
cd android
.\gradlew assembleDebug
```

输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### Release 版本（正式发布）

#### 方法一：Android Studio

1. Build > Generate Signed Bundle / APK
2. 选择 APK
3. 创建或选择密钥库
4. 选择 release
5. 完成签名

#### 方法二：命令行

```bash
cd android
.\gradlew assembleRelease
```

输出位置：`android/app/build/outputs/apk/release/app-release.apk`

### 密钥库配置

首次打包 Release 版本需要创建密钥库：

```bash
keytool -genkey -v -keystore finance-tracker.keystore -alias finance-tracker -keyalg RSA -keysize 2048 -validity 10000
```

然后在 `android/app/build.gradle` 中配置：

```gradle
android {
    signingConfigs {
        release {
            storeFile file("finance-tracker.keystore")
            storePassword "your_password"
            keyAlias "finance-tracker"
            keyPassword "your_password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 📂 项目结构

```
personal-finance-tracker/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # 桌面端布局
│   │   └── MobileLayout.tsx    # 移动端布局 ⭐
│   ├── utils/
│   │   └── device.ts           # 设备检测工具 ⭐
│   └── styles/
│       └── responsive.css      # 响应式样式 ⭐
├── android/                    # Android 原生项目
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/
│   │           └── values/
│   │               └── styles.xml
├── capacitor.config.ts         # Capacitor 配置 ⭐
└── build-android.ps1           # 打包脚本 ⭐
```

⭐ = v0.3.2 新增的文件

---

## 🔧 配置说明

### Capacitor 配置

[capacitor.config.ts](capacitor.config.ts):

```typescript
{
  appId: 'com.finance.tracker',
  appName: '大学生记账本',
  webDir: 'build',
  version: '0.3.2',

  // Android 特定配置
  android: {
    allowMixedContent: true,
    captureInput: true
  },

  // 启动画面配置
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4A90E2'
    }
  }
}
```

### AndroidManifest.xml

已配置支持所有屏幕方向：

```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|..."
    ...
>
```

---

## 🐛 常见问题

### 问题 1：白屏

**原因**：构建路径错误

**解决**：
```bash
npm run build
npx cap sync android
```

### 问题 2：底部导航栏遮挡内容

**解决**：已通过 CSS padding-bottom 处理

```css
.mobile-layout-content {
  padding-bottom: 70px; /* 为底部导航栏留空间 */
}
```

### 问题 3：横屏布局错乱

**解决**：检查响应式样式，确保使用媒体查询

### 问题 4：触摸点击不灵敏

**解决**：已设置最小点击区域 44x44px

---

## 📊 性能优化

### 已实现的优化

| 优化项 | 说明 |
|--------|------|
| 路由懒加载 | 按需加载页面组件 |
| 图片懒加载 | 图片可视时才加载 |
| 本地存储 | IndexedDB 缓存 |
| CSS 优化 | 压缩、合并样式 |

### 性能指标

| 指标 | 目标值 |
|------|--------|
| 首屏加载 | < 2 秒 |
| 交互响应 | < 100ms |
| APK 大小 | < 20 MB |

---

## 🚀 发布流程

### 版本号管理

在以下文件中同步更新版本号：

1. `package.json` - `version` 字段
2. `capacitor.config.ts` - `version` 字段
3. `android/app/build.gradle` - `versionCode` 和 `versionName`

### 发布检查清单

- [ ] 更新版本号
- [ ] 测试所有功能
- [ ] 测试横屏和竖屏
- [ ] 检查内存泄漏
- [ ] 生成 Release APK
- [ ] 测试 APK 安装
- [ ] 上传到发布平台

---

## 📝 更新日志

### v0.3.2 (2025-12-29)

#### 新增
- ✨ 移动端响应式布局
- ✨ 底部导航栏组件
- ✨ 设备检测工具
- ✨ 横屏和竖屏适配
- ✨ 触摸优化

#### 优化
- 🎨 全局响应式样式
- 🎨 安全区域适配
- 🎨 移动端专属交互体验

---

## 🔗 相关资源

- [Capacitor 文档](https://capacitorjs.com/docs)
- [React Router](https://reactrouter.com/)
- [Ant Design Mobile](https://mobile.ant.design/)

---

**文档版本**: 2.0
**创建日期**: 2025-12-29
**最后更新**: 2025-12-29
