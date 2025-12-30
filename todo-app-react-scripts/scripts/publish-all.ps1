# TimelineFlow 一键发布脚本 (GitHub + Gitee)
# 使用方法: powershell -ExecutionPolicy Bypass -File scripts\publish-all.ps1 [version]

param(
    [string]$version = "1.0.0"  # 默认版本号
)

$projectRoot = "d:\todo-management-platform"
$scriptDir = "$projectRoot\todo-app-react-scripts\scripts"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TimelineFlow 一键发布工具             ║" -ForegroundColor Cyan
Write-Host "║   版本: v$version                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. 发布到 GitHub
Write-Host "[1/2] 发布到 GitHub..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
try {
    & powershell -ExecutionPolicy Bypass -File "$scriptDir\publish-github.ps1" $version
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ GitHub 发布成功!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ GitHub 发布失败!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ GitHub 发布出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ""

# 2. 发布到 Gitee
Write-Host "[2/2] 发布到 Gitee..." -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
try {
    & powershell -ExecutionPolicy Bypass -File "$scriptDir\publish-gitee.ps1" $version
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Gitee 发布成功!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Gitee 发布失败!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Gitee 发布出错: $_" -ForegroundColor Red
    exit 1
}

# 完成
Write-Host ""
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🎉 全部发布完成!                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "GitHub Release:" -ForegroundColor White
Write-Host "  https://github.com/ALL2006/masyun-toolkit/releases/tag/v$version-timeline" -ForegroundColor Cyan
Write-Host ""
Write-Host "Gitee Release:" -ForegroundColor White
Write-Host "  https://gitee.com/haobinjun/masyun-toolkit/releases/tag/v$version-timeline" -ForegroundColor Cyan
Write-Host ""
