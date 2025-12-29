# Android 打包脚本
# 用于构建并打包 Android APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  大学生记账本 - Android 打包工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "1. 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未安装 Node.js，请先安装" -ForegroundColor Red
    exit 1
}

# 检查 npm
Write-Host "2. 检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm 不可用" -ForegroundColor Red
    exit 1
}

# 检查 Java
Write-Host "3. 检查 Java..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "   ✓ $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 未安装 Java，请先安装 JDK 8 或更高版本" -ForegroundColor Red
    exit 1
}

# 安装依赖（如果需要）
Write-Host ""
Write-Host "4. 检查项目依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   安装依赖中..." -ForegroundColor Cyan
    npm install
    Write-Host "   ✓ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "   ✓ 依赖已存在" -ForegroundColor Green
}

# 构建 React 应用
Write-Host ""
Write-Host "5. 构建 React 应用..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ 构建完成" -ForegroundColor Green

# 同步到 Capacitor
Write-Host ""
Write-Host "6. 同步资源到 Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ 同步失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ 同步完成" -ForegroundColor Green

# 打开 Android Studio
Write-Host ""
Write-Host "7. 打开 Android Studio..." -ForegroundColor Yellow
Write-Host "   请在 Android Studio 中：" -ForegroundColor Cyan
Write-Host "   - 点击 Build > Build Bundle(s) / APK(s) > Build APK(s)" -ForegroundColor White
Write-Host "   - 或使用命令行: gradlew assembleDebug" -ForegroundColor White
Write-Host ""

Start-Process "android"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  准备就绪！请在 Android Studio 中打包" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "- APK 输出位置: android/app/build/outputs/apk/debug/" -ForegroundColor White
Write-Host "- 首次打包可能需要下载 Gradle 依赖" -ForegroundColor White
Write-Host ""
