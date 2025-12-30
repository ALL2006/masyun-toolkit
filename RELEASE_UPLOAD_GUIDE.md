# GitHub Release 上传指南

本文档说明如何将构建好的安装包（.exe 和 .yml 文件）上传到 GitHub Release。

---

## 目录

1. [准备工作](#1-准备工作)
2. [手动上传方法](#2-手动上传方法)
3. [自动化脚本方法](#3-自动化脚本方法)
4. [常见问题](#4-常见问题)

---

## 1. 准备工作

### 1.1 构建应用

首先确保应用已经构建完成：

```bash
# 进入项目目录
cd d:\todo-management-platform\todo-app-react-scripts

# 构建 React 应用
npm run build

# 打包 Electron 应用
npm run build-electron-win-unsigned
```

构建完成后，安装包会生成在 `dist/` 目录：

```
dist/
├── todo-app-setup-0.1.0.exe      # NSIS 安装包
├── builder-debug.yml               # 构建配置
├── todo-app-setup-0.1.0.exe.blockmap
└── win-unpacked/                   # 未打包的版本
    └── 待办事项管理.exe
```

### 1.2 获取 GitHub Token

1. 登录 GitHub
2. 进入 Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. 勾选 `repo` 权限
5. 生成并复制 token（类似：`ghp_xxxxxxxxxxxx`）

---

## 2. 手动上传方法

### 2.1 通过 GitHub 网页界面

1. **进入 Releases 页面**
   ```
   https://github.com/ALL2006/masyun-toolkit/releases
   ```

2. **编辑现有 Release 或创建新的**
   - 找到已有的 Release（如 `v1.0.0-timeline`）
   - 点击 `Edit release`

3. **上传文件**
   - 在 `Assets` 区域，拖拽文件或点击 `Attach binaries`
   - 等待上传完成
   - 重复以上传所有需要的文件

### 2.2 使用 GitHub CLI (gh)

```bash
# 创建 Release 并上传文件
gh release create v1.0.0-timeline \
  --title "TimelineFlow v1.0.0" \
  --notes "Release notes here" \
  dist/todo-app-setup-0.1.0.exe \
  dist/builder-debug.yml
```

---

## 3. 自动化脚本方法

使用 PowerShell 脚本自动化上传过程。

### 3.1 完整上传脚本

创建文件 `upload-release.ps1`：

```powershell
# GitHub Release 上传脚本
# 使用方法: powershell -ExecutionPolicy Bypass -File upload-release.ps1

# ============ 配置区 ============
$token = "ghp_YOUR_TOKEN_HERE"           # GitHub Personal Access Token
$owner = "ALL2006"                       # GitHub 用户名
$repo = "masyun-toolkit"                  # 仓库名
$tag = "v1.0.0-timeline"                 # Release 标签
$exePath = "d:\todo-management-platform\todo-app-react-scripts\dist\todo-app-setup-0.1.0.exe"
$ymlPath = "d:\todo-management-platform\todo-app-react-scripts\dist\builder-debug.yml"

# ============ 脚本开始 ============
$headers = @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/vnd.github.v3+json'
}

Write-Host "=== GitHub Release 上传工具 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 获取 Release 信息
Write-Host "1. 获取 Release 信息..." -ForegroundColor Yellow
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/releases/tags/$tag" -Method Get -Headers $headers
    Write-Host "   找到 Release: $($release.name)" -ForegroundColor Green
} catch {
    Write-Host "   未找到 Release，正在创建..." -ForegroundColor Yellow
    # 如果 Release 不存在，创建新的
    $createBody = @{
        tag_name = $tag
        name = "Release $tag"
        body = "Release notes"
        target_commitish = "timeline-todo"
        draft = $false
        prerelease = $false
    } | ConvertTo-Json

    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/releases" -Method Post -Headers $headers -Body $createBody -ContentType 'application/json'
    Write-Host "   Release 创建成功!" -ForegroundColor Green
}

# 2. 删除旧的 assets
Write-Host "2. 删除旧文件..." -ForegroundColor Yellow
foreach ($asset in $release.assets) {
    Write-Host "   删除: $($asset.name)" -ForegroundColor Gray
    Invoke-RestMethod -Uri $asset.url -Method Delete -Headers $headers | Out-Null
}

# 3. 提取上传 URL
$uploadUrl = $release.upload_url -replace '\{.*\}', ''

# 4. 上传 exe 文件
Write-Host "3. 上传 exe 文件..." -ForegroundColor Yellow
if (Test-Path $exePath) {
    $fileSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
    Write-Host "   文件大小: $fileSize MB" -ForegroundColor Gray

    $exeUploadUrl = $uploadUrl + '?name=todo-app-setup-0.1.0.exe'
    $exeBytes = [System.IO.File]::ReadAllBytes($exePath)
    $exeHeaders = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/x-msdownload'
    }
    $result = Invoke-RestMethod -Uri $exeUploadUrl -Method Post -Headers $exeHeaders -Body $exeBytes
    Write-Host "   上传成功!" -ForegroundColor Green
} else {
    Write-Host "   文件不存在: $exePath" -ForegroundColor Red
}

# 5. 上传 yml 文件
Write-Host "4. 上传 yml 文件..." -ForegroundColor Yellow
if (Test-Path $ymlPath) {
    $ymlUploadUrl = $uploadUrl + '?name=builder-debug.yml'
    $ymlBytes = [System.IO.File]::ReadAllBytes($ymlPath)
    $ymlHeaders = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/x-yaml'
    }
    Invoke-RestMethod -Uri $ymlUploadUrl -Method Post -Headers $ymlHeaders -Body $ymlBytes | Out-Null
    Write-Host "   上传成功!" -ForegroundColor Green
} else {
    Write-Host "   文件不存在: $ymlPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 上传完成 ===" -ForegroundColor Cyan
Write-Host "下载地址: https://github.com/$owner/$repo/releases/download/$tag/todo-app-setup-0.1.0.exe" -ForegroundColor Green
```

### 3.2 使用方法

```bash
# 1. 修改脚本中的配置区
#    - 替换 token
#    - 替换路径

# 2. 运行脚本
powershell -ExecutionPolicy Bypass -File upload-release.ps1
```

### 3.3 项目内使用版本

为了安全，创建一个模板脚本，token 从环境变量读取：

**upload-template.ps1**:

```powershell
# 从环境变量读取 token
$token = $env:GITHUB_TOKEN
if ([string]::IsNullOrEmpty($token)) {
    Write-Host "错误: 请设置 GITHUB_TOKEN 环境变量" -ForegroundColor Red
    exit 1
}

# 其余代码同上...
```

**使用方法**:

```bash
# 设置环境变量（临时）
set GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 运行脚本
powershell -ExecutionPolicy Bypass -File upload-template.ps1
```

---

## 4. 常见问题

### 4.1 认证失败

**错误**: `401 Unauthorized`

**原因**: Token 无效或过期

**解决**:
- 检查 token 是否正确
- 重新生成 token
- 确保 token 有 `repo` 权限

### 4.2 Release 不存在

**错误**: `404 Not Found`

**原因**: 指定的 tag 不存在

**解决**: 先创建 tag，或修改脚本自动创建 Release

```bash
# 创建 tag
git tag v1.0.0-timeline
git push origin v1.0.0-timeline

# 然后再上传文件
```

### 4.3 文件太大

**问题**: exe 文件通常 100MB+，上传时间长

**解决**:
- 确保网络稳定
- 使用更快的镜像（如果在中国）
- 耐心等待，不要中断

### 4.4 文件名重复

**问题**: 同名文件已存在

**解决**: 脚本已包含删除旧文件的逻辑，或手动删除后重新上传

### 4.5 Gitee 上传

Gitee 的 API 与 GitHub 不同，需要使用不同的端点：

```powershell
# Gitee 上传示例（需要手动操作）
# 1. 访问 https://gitee.com/用户名/仓库/releases
# 2. 找到对应的 Release
# 3. 点击"编辑"
# 4. 手动上传文件
```

**注意**: Gitee 的文件上传 API 功能有限，建议手动上传。

---

## 5. 最佳实践

### 5.1 版本管理

建议使用语义化版本号：

```
v主版本.次版本.修订版本-后缀

例如: v1.0.0-timeline
```

### 5.2 Release Notes 模板

```markdown
## v1.0.0 - TimelineFlow

### 功能特性
- 特性 1
- 特性 2

### 问题修复
- 修复问题 1
- 修复问题 2

### 安装说明
1. 下载 `todo-app-setup-0.1.0.exe`
2. 运行安装程序
3. 启动应用

### 系统要求
- Windows 10 或更高版本
```

### 5.3 文件清理

上传前删除旧的测试文件：

```bash
# 清理旧的构建文件
Remove-Item -Recurse -Force dist
Remove-Item -Recurse -Force build

# 重新构建
npm run build
npm run build-electron-win-unsigned
```

### 5.4 自动化集成

可以将上传脚本集成到 npm scripts 中：

**package.json**:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build-electron": "npm run build && electron-builder",
    "upload-release": "powershell -ExecutionPolicy Bypass -File scripts/upload-release.ps1"
  }
}
```

---

## 6. 相关资源

- [GitHub Release API 文档](https://docs.github.com/en/rest/releases/releases)
- [Personal Access Tokens](https://github.com/settings/tokens)
- [Electron Builder 文档](https://www.electron.build/)
- [PowerShell 脚本教程](https://learn.microsoft.com/powershell/)

---

## 7. 完整工作流示例

```bash
# 1. 修改代码并测试
npm start

# 2. 构建 React
npm run build

# 3. 打包 Electron
npm run build-electron-win-unsigned

# 4. 提交代码
git add .
git commit -m "feat: 新功能"
git push origin timeline-todo

# 5. 创建 tag
git tag v1.0.0-timeline
git push origin v1.0.0-timeline

# 6. 上传到 Release
# 方法 A: 手动在 GitHub 网页上传
# 方法 B: 运行上传脚本
powershell -ExecutionPolicy Bypass -File upload-release.ps1

# 7. 验证下载
# 访问 https://github.com/用户名/仓库/releases/download/v1.0.0-timeline/文件名.exe
```

---

**更新日期**: 2025-12-30
**版本**: 1.0.0
