# 自动发布脚本 - 带镜像加速
# 用法：.\publish-with-mirror.ps1

# 读取版本号
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$version = $packageJson.version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "发布版本: $version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: 构建应用
Write-Host "Step 1: 构建 React 应用..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败！" -ForegroundColor Red
    exit 1
}

# Step 2: 打包 Electron 应用
Write-Host "Step 2: 打包 Electron 应用..." -ForegroundColor Yellow
npm run build-electron-win
if ($LASTEXITCODE -ne 0) {
    Write-Host "打包失败！" -ForegroundColor Red
    exit 1
}

Write-Host "构建完成！" -ForegroundColor Green
Write-Host ""

# Step 3: 生成带镜像的 latest.yml
Write-Host "Step 3: 生成带镜像配置的 latest.yml..." -ForegroundColor Yellow

$yamlPath = "dist\latest.yml"
if (Test-Path $yamlPath) {
    $originalYaml = Get-Content $yamlPath -Raw

    # 解析原始 YAML
    if ($originalYaml -match "sha512:\s*(\S+)") {
        $sha512 = $matches[1]
    }
    if ($originalYaml -match "size:\s*(\d+)") {
        $size = $matches[1]
    }

    # 创建带镜像的 latest.yml
    $mirrorYaml = @"
version: $version
files:
  - url: https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download/v$version/finance-tracker-setup-$version.exe
    sha512: $sha512
    size: $size
  - url: https://ghproxy.net/https://github.com/ALL2006/masyun-toolkit/releases/download/v$version/finance-tracker-setup-$version.exe
    sha512: $sha512
    size: $size
path: finance-tracker-setup-$version.exe
sha512: $sha512
releaseDate: '$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")'
"@

    # 覆盖原始 latest.yml
    Set-Content -Path $yamlPath -Value $mirrorYaml -Encoding UTF8
    Write-Host "latest.yml 已生成（包含镜像配置）" -ForegroundColor Green
} else {
    Write-Host "警告: latest.yml 未找到" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "构建完成！请手动上传到 GitHub:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. 访问: https://github.com/ALL2006/masyun-toolkit/releases/new" -ForegroundColor White
Write-Host "2. Tag: v$version" -ForegroundColor White
Write-Host "3. 上传文件:" -ForegroundColor White
Write-Host "   - dist\finance-tracker-setup-$version.exe" -ForegroundColor Cyan
Write-Host "   - dist\latest.yml (已配置镜像)" -ForegroundColor Cyan
Write-Host ""
Write-Host "镜像配置已自动添加到 latest.yml！" -ForegroundColor Yellow
Write-Host "以后所有版本都会自动使用镜像加速下载！" -ForegroundColor Yellow
