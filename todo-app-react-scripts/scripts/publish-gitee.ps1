# Gitee Release Auto Publish Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts\publish-gitee.ps1 [version]

param(
    [string]$version = "1.0.0"
)

# ============ Configuration ============
$token = $env:GITEE_TOKEN
if ([string]::IsNullOrEmpty($token)) {
    Write-Host "Error: GITEE_TOKEN environment variable not set" -ForegroundColor Red
    exit 1
}
$owner = "haobinjun"
$repo = "masyun-toolkit"
$tagName = "v$version-timeline"

$projectRoot = "d:\todo-management-platform"
$distDir = "$projectRoot\todo-app-react-scripts\dist"
$exePath = "$distDir\todo-app-setup-$version.exe"
$ymlPath = "$distDir\builder-debug.yml"
$blockmapPath = "$distDir\todo-app-setup-$version.exe.blockmap"

# ============ Script Start ============
$headers = @{
    'Authorization' = "Bearer $token"
    'Accept' = 'application/json'
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gitee Release Publish Tool" -ForegroundColor Cyan
Write-Host "  Version: v$version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify files exist
Write-Host "[1/6] Verifying files..." -ForegroundColor Yellow
$filesOk = $true

if (!(Test-Path $exePath)) {
    Write-Host "   X File not found: $exePath" -ForegroundColor Red
    $filesOk = $false
} else {
    $fileSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
    Write-Host "   OK EXE file: $exePath ($fileSize MB)" -ForegroundColor Green
}

if (!(Test-Path $ymlPath)) {
    Write-Host "   X File not found: $ymlPath" -ForegroundColor Red
    $filesOk = $false
} else {
    Write-Host "   OK YML file: $ymlPath" -ForegroundColor Green
}

if (!(Test-Path $blockmapPath)) {
    Write-Host "   X File not found: $blockmapPath" -ForegroundColor Red
    $filesOk = $false
} else {
    Write-Host "   OK BLOCKMAP file: $blockmapPath" -ForegroundColor Green
}

if (!$filesOk) {
    Write-Host ""
    Write-Host "Error: Missing required files, please run build first:" -ForegroundColor Red
    Write-Host "   npm run build-electron-win-unsigned" -ForegroundColor Yellow
    exit 1
}

# 2. Get or create Release
Write-Host ""
Write-Host "[2/6] Checking Release..." -ForegroundColor Yellow
try {
    $release = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases/tags/$tagName" -Method Get -Headers $headers
    Write-Host "   OK Found existing Release: $($release.name)" -ForegroundColor Green
    $releaseId = $release.id

    # Delete old attachments
    Write-Host ""
    Write-Host "[3/6] Cleaning old files..." -ForegroundColor Yellow
    try {
        $attachments = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases/$releaseId/assets" -Method Get -Headers $headers
        foreach ($asset in $attachments) {
            Write-Host "   Deleting: $($asset.name)" -ForegroundColor Gray
            Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases/$releaseId/assets/$($asset.id)" -Method Delete -Headers $headers | Out-Null
        }
    } catch {
        Write-Host "   No attachments to delete" -ForegroundColor Gray
    }
} catch {
    Write-Host "   Release not found, creating new..." -ForegroundColor Yellow

    $releaseNotes = @"
## TimelineFlow v$version

### Features
- Calendar week view and month view
- Create, edit, delete tasks
- Priority-based color coding
- Drag to adjust task time
- Local data persistence
- Import/Export functionality

### System Requirements
- Windows 10 or higher

### Installation
1. Download `todo-app-setup-$version.exe`
2. Run installer
3. Launch app
"@

    $createBody = @{
        tag_name = $tagName
        name = "TimelineFlow v$version"
        body = $releaseNotes
        target_commitish = "timeline-todo"
        draft = $false
        prerelease = $false
    }

    $release = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases" -Method Post -Headers $headers -Body $createBody
    $releaseId = $release.id
    Write-Host "   OK Release created!" -ForegroundColor Green
}

# 3. Upload files to Gitee
Write-Host ""
Write-Host "[4/6] Uploading files to Gitee..." -ForegroundColor Yellow

# Upload EXE
Write-Host "   Uploading EXE file..." -ForegroundColor Gray
$exeForm = @{
    file = Get-Item -Path $exePath
}
try {
    $exeHeaders = @{
        'Authorization' = "Bearer $token"
    }
    $result = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases/$releaseId/assets" -Method Post -Headers $exeHeaders -Form $exeForm
    Write-Host "   OK EXE uploaded!" -ForegroundColor Green
} catch {
    Write-Host "   X EXE upload failed: $_" -ForegroundColor Red
    exit 1
}

# Upload BLOCKMAP
Write-Host "   Uploading BLOCKMAP file..." -ForegroundColor Gray
$blockmapForm = @{
    file = Get-Item -Path $blockmapPath
}
try {
    $result = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases/$releaseId/assets" -Method Post -Headers $exeHeaders -Form $blockmapForm
    Write-Host "   OK BLOCKMAP uploaded!" -ForegroundColor Green
} catch {
    Write-Host "   ! BLOCKMAP upload failed (non-critical): $_" -ForegroundColor Yellow
}

# Upload YML
Write-Host "   Uploading YML file..." -ForegroundColor Gray
$ymlForm = @{
    file = Get-Item -Path $ymlPath
}
try {
    $result = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$owner/$repo/releases/$releaseId/assets" -Method Post -Headers $exeHeaders -Form $ymlForm
    Write-Host "   OK YML uploaded!" -ForegroundColor Green
} catch {
    Write-Host "   X YML upload failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OK Gitee Release completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Release URL:" -ForegroundColor White
Write-Host "  https://gitee.com/$owner/$repo/releases/tag/$tagName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Download URL:" -ForegroundColor White
Write-Host "  https://gitee.com/$owner/$repo/releases/download/$tagName/todo-app-setup-$version.exe" -ForegroundColor Cyan
Write-Host ""
