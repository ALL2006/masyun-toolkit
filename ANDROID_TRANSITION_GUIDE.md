# TimelineFlow Windows 到 Android 转型指南

本文档详细说明如何将 TimelineFlow Windows 应用转型为 Android 应用。

---

## 目录

1. [目录结构说明](#目录结构说明)
2. [转型架构](#转型架构)
3. [完整转型流程](#完整转型流程)
4. [配置说明](#配置说明)
5. [开发工作流](#开发工作流)
6. [常见问题](#常见问题)

---

## 目录结构说明

### 当前项目结构

```
d:\todo-management-platform\
├── todo-app-react-scripts/       # 主项目目录（React + Electron）
│   ├── public/                   # Web 资源
│   ├── src/                      # React 源代码
│   ├── build/                    # Web 构建输出
│   ├── dist/                     # Electron 打包输出
│   ├── android/                  # Android 原生项目（Capacitor 生成）
│   ├── node_modules/             # 依赖包
│   ├── package.json              # 项目配置
│   └── capacitor.config.ts       # Capacitor 配置
├── RELEASE_GUIDE.md              # 桌面版发布指南
└── ANDROID_TRANSITION_GUIDE.md   # 本文档
```

### 为什么 Android 目录在 todo-app-react-scripts 内部？

这是 **Capacitor 框架的默认设计**，原因如下：

| 方面 | 说明 |
|------|------|
| **代码复用** | Web 代码和原生代码在同一项目，方便共享 |
| **构建流程** | `npm run build` 直接输出到 `build/`，Capacitor 自动同步到 Android |
| **版本管理** | 一个 Git 仓库管理所有平台代码 |
| **标准实践** | Capacitor 官方推荐的目录结构 |

### 如果要把 Android 目录移到根目录

如果你更倾向于这样的结构：

```
d:\todo-management-platform\
├── todo-app-react-scripts/       # Web 项目
├── android/                      # Android 项目（独立）
└── ...
```

需要修改 Capacitor 配置（见下文）。

---

## 转型架构

### 技术栈对比

| 层级 | Windows 版本 | Android 版本 |
|------|-------------|-------------|
| **UI 框架** | React 18.3 | React 18.3 |
| **业务逻辑** | TypeScript | TypeScript |
| **状态管理** | Zustand | Zustand |
| **日历组件** | FullCalendar | FullCalendar |
| **容器框架** | Electron | Capacitor + Android WebView |
| **打包工具** | Electron Builder | Gradle |

### 核心优势

✅ **代码 100% 复用**
- React 组件代码无需修改
- TypeScript 类型定义共享
- 状态管理逻辑一致

✅ **构建流程统一**
```bash
# 一套代码，两个平台
npm run build              # 构建 Web
npx cap sync android       # 同步到 Android
./gradlew assembleDebug    # 生成 APK
```

---

## 完整转型流程

### 步骤 1：环境准备

#### 检查必要工具

```powershell
# 检查 Java（需要 JDK 17 或更高）
java -version

# 检查 Android SDK
adb version

# 检查 Node.js
node -v
npm -v
```

#### 必需的环境

| 工具 | 版本要求 | 安装位置 |
|------|---------|---------|
| Java JDK | 17+ | C:\Program Files\Java\jdk-17 |
| Android SDK | 最新 | C:\Users\{用户}\AppData\Local\Android\Sdk |
| Node.js | 18+ | C:\nvm4w\nodejs\node.exe |

### 步骤 2：安装 Capacitor 依赖

```bash
cd d:\todo-management-platform\todo-app-react-scripts

# 安装 Capacitor 核心包
npm install @capacitor/core @capacitor/cli

# 安装 Android 平台支持
npm install @capacitor/android
```

### 步骤 3：初始化 Capacitor

```bash
# 初始化 Capacitor 项目
npx cap init "TimelineFlow" "com.timelineflow.todo" --web-dir=build
```

**参数说明**：
- `TimelineFlow` - 应用名称
- `com.timelineflow.todo` - 应用 ID（反向域名格式）
- `--web-dir=build` - Web 资源目录

### 步骤 4：构建 Web 应用

```bash
npm run build
```

这会生成 `build/` 目录，包含所有 Web 资源。

### 步骤 5：添加 Android 平台

```bash
npx cap add android
```

这会创建 `android/` 目录，包含完整的 Android 项目结构。

### 步骤 6：配置 Android 项目

#### 6.1 设置 Android SDK 路径

创建 `android/local.properties`：

```properties
sdk.dir=C:/Users/H3123/AppData/Local/Android/Sdk
```

**注意**：将 `H3123` 替换为你的用户名。

#### 6.2 配置 Java 版本

修改 `android/app/build.gradle`：

```gradle
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

#### 6.3 配置 Gradle 镜像（可选，国内用户）

修改 `android/gradle/wrapper/gradle-wrapper.properties`：

```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.14.3-all.zip
```

#### 6.4 配置横竖屏支持

修改 `android/app/src/main/AndroidManifest.xml`：

```xml
<activity
    android:name=".MainActivity"
    android:screenOrientation="fullSensor"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
    ...>
```

**配置说明**：
- `android:screenOrientation="fullSensor"` - 支持所有方向（横屏、竖屏、反向）
- `android:configChanges="orientation..."` - 方向改变时不重启 Activity

### 步骤 7：同步资源到 Android

```bash
npx cap sync android
```

这会将 `build/` 中的 Web 资源复制到 Android 项目。

### 步骤 8：构建 APK

```bash
cd android
./gradlew.bat assembleDebug
```

生成的 APK 位于：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 配置说明

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.timelineflow.todo',
  appName: 'TimelineFlow',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### Android 配置文件汇总

| 文件 | 作用 |
|------|------|
| `android/local.properties` | SDK 路径配置 |
| `android/app/build.gradle` | 应用构建配置 |
| `android/gradle/wrapper/gradle-wrapper.properties` | Gradle 版本和镜像 |
| `android/app/src/main/AndroidManifest.xml` | 应用清单和权限 |
| `android/variables.gradle` | SDK 版本和依赖版本 |

---

## 开发工作流

### 修改代码后重新构建

```bash
# 1. 修改 React 代码
# 使用任何编辑器修改 src/ 目录下的文件

# 2. 重新构建 Web 应用
cd d:\todo-management-platform\todo-app-react-scripts
npm run build

# 3. 同步到 Android
npx cap sync android

# 4. 构建 APK
cd android
./gradlew.bat assembleDebug
```

### 一键构建脚本

创建 `scripts/build-android.ps1`：

```powershell
# TimelineFlow Android 构建脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TimelineFlow Android 构建" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 构建 Web
Write-Host "[1/4] 构建 Web 应用..." -ForegroundColor Yellow
npm run build

# 2. 同步到 Android
Write-Host "[2/4] 同步到 Android..." -ForegroundColor Yellow
npx cap sync android

# 3. 构建 APK
Write-Host "[3/4] 构建 APK..." -ForegroundColor Yellow
cd android
./gradlew.bat assembleDebug

# 4. 复制 APK
Write-Host "[4/4] 复制 APK..." -ForegroundColor Yellow
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk TimelineFlow-latest.apk

Write-Host ""
Write-Host "✓ 构建完成!" -ForegroundColor Green
Write-Host "APK 位置: TimelineFlow-latest.apk" -ForegroundColor Cyan
```

使用方法：
```powershell
.\scripts\build-android.ps1
```

### 真机调试

```bash
# 1. 连接 Android 设备（启用 USB 调试）
adb devices

# 2. 安装 APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 3. 查看日志
adb logcat | grep "Capacitor"

# 4. 启动应用
adb shell am start -n com.timelineflow.todo/.MainActivity
```

### 使用 Android Studio

```bash
# 用 Android Studio 打开项目
android
```

**优势**：
- 可视化调试
- 布局编辑器
- 性能分析
- 签名发布

---

## 常见问题

### Q1: 为什么 Android 目录不在项目根目录？

**A**: 这是 Capacitor 的默认设计，具有以下优势：
- Web 和原生代码在同一项目，便于管理
- 构建流程简化，无需额外配置
- 符合 Capacitor 官方最佳实践

**如果需要自定义位置**，修改 `capacitor.config.ts`：

```typescript
const config: CapacitorConfig = {
  appId: 'com.timelineflow.todo',
  appName: 'TimelineFlow',
  webDir: 'build',
  // 自定义 Android 项目路径
  androidProjectPath: '../android',  // 指向父目录的 android 文件夹
};
```

### Q2: 构建时提示 "SDK location not found"

**解决方法**：创建 `android/local.properties` 文件：

```properties
sdk.dir=C:/Users/你的用户名/AppData/Local/Android/Sdk
```

### Q3: 构建时提示 Java 版本错误

**错误信息**：
```
无效的源发行版: 21
```

**解决方法**：确保使用 Java 17，并在 `build.gradle` 中配置：

```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

### Q4: Gradle 下载缓慢

**解决方法**：使用国内镜像，修改 `gradle-wrapper.properties`：

```properties
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.14.3-all.zip
```

### Q5: 应用在设备上横竖屏切换时重启

**解决方法**：确认 `AndroidManifest.xml` 配置正确：

```xml
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|..."
```

### Q6: 如何修改应用图标和名称

**应用名称**：
- 修改 `android/app/src/main/res/values/strings.xml` 中的 `app_name`

**应用图标**：
- 替换 `android/app/src/main/res/mipmap-*` 目录下的图标文件

---

## 项目文件对比

### Windows 版本特有文件

| 文件 | 作用 |
|------|------|
| `public/electron.js` | Electron 主进程 |
| `dist/` | Electron 打包输出 |
| `scripts/publish-github.ps1` | GitHub 发布脚本 |

### Android 版本特有文件

| 文件 | 作用 |
|------|------|
| `android/` | Android 原生项目 |
| `capacitor.config.ts` | Capacitor 配置 |
| `TimelineFlow-*-android.apk` | Android 安装包 |

### 两个版本共享的文件

| 文件 | 作用 |
|------|------|
| `src/` | React 源代码（100% 共享） |
| `public/` | Web 资源（共享） |
| `package.json` | 依赖管理 |
| `tsconfig.json` | TypeScript 配置 |

---

## 下一步

### 生成签名版 APK（Release）

Debug APK 仅用于测试，正式发布需要签名：

1. **生成密钥库**
   ```bash
   keytool -genkey -v -keystore timelineflow-release.keystore -alias timelineflow -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **配置签名**

   修改 `android/app/build.gradle`：
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("../../timelineflow-release.keystore")
               storePassword "你的密码"
               keyAlias "timelineflow"
               keyPassword "你的密码"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **构建 Release APK**
   ```bash
   ./gradlew.bat assembleRelease
   ```

### 添加更多 Capacitor 插件

```bash
# Camera 相机
npm install @capacitor/camera
npx cap sync

# Geolocation 定位
npm install @capacitor/geolocation
npx cap sync

# Local Notifications 本地通知
npm install @capacitor/local-notifications
npx cap sync
```

---

## 总结

### 转型成果

| 项目 | 成果 |
|------|------|
| **代码复用率** | 100%（React 代码无需修改） |
| **APK 大小** | 约 4.6 MB |
| **横竖屏支持** | ✅ 完全支持 |
| **功能完整性** | ✅ 所有功能可用 |
| **开发效率** | 一套代码，多端运行 |

### 关键命令速查

| 操作 | 命令 |
|------|------|
| 构建 Web | `npm run build` |
| 同步到 Android | `npx cap sync android` |
| 构建 Debug APK | `cd android && ./gradlew.bat assembleDebug` |
| 构建 Release APK | `cd android && ./gradlew.bat assembleRelease` |
| 在真机上运行 | `npx cap run android` |

---

**最后更新**: 2024-12-30
**适用版本**: TimelineFlow v1.0.0
**Capacitor 版本**: 6.x
**Android 最低版本**: Android 7.0 (API 24)
