# Publish to Gitee Release

$configPath = Join-Path $PSScriptRoot "local.config.ps1"

if (Test-Path $configPath) {
    . $configPath
} else {
    Write-Error "Config file not found: $configPath"
    exit 1
}

$packageJsonPath = Join-Path $PSScriptRoot "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$tag = "v$($packageJson.version)"

$headers = @{
    "Authorization" = "Bearer $giteeToken"
    "Content-Type" = "application/json"
}

$giteeRepoPath = "$giteeOwner/$giteeRepoName"

Write-Host "Publishing to Gitee..." -ForegroundColor Green
Write-Host "Version: $tag"
Write-Host "Repository: $giteeRepoPath"
Write-Host ""

# Generate release notes based on version
$version = $packageJson.version

if ($version -eq "0.3.0") {
    $releaseNotes = @"
# v0.3.0 - AI Financial Analysis

## New Features

### AI Financial Analysis
- **Smart Analysis**: Integrated with DeepSeek AI for intelligent consumption analysis
- **Multi-dimensional Statistics**: Income, expenses, balance, savings rate
- **Detailed Analysis**: Reads transaction notes for personalized suggestions
- **Humanized Suggestions**:
  - Consumption Highlights (what you did well)
  - Areas to Focus On (what to improve)
  - Action Items (specific, actionable advice)

### Analysis Range
- This Month / This Quarter / Last 6 Months / All Data

## Technical Improvements
- Added AI configuration (`src/config/aiConfig.ts`)
- Added AI analysis service (`src/services/aiAnalysisService.ts`)
- Added AI analysis page (`src/pages/AIAnalysis.tsx`)
- API Key protected with Base64 encoding
- Updated navigation and routing

## How to Use
1. Click "AI Analysis" in navigation
2. Select analysis range
3. Click "Start Analysis"
4. View personalized financial advice

---

Generated with Claude Code
"@
} else {
    $releaseNotes = @"
# $tag

Finance Tracker Update

## Changes
- Bug fixes and improvements
- Performance optimizations

See https://github.com/ALL2006/masyun-toolkit/releases for full changelog.
"@
}

$releaseBody = @{
    tag_name = $tag
    name = $tag
    body = $releaseNotes
    target_commitish = "master"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$giteeRepoPath/releases" -Method Post -Headers $headers -Body $releaseBody

    Write-Host "Success! Gitee Release created." -ForegroundColor Green
    Write-Host "URL: $($response.html_url)" -ForegroundColor Cyan

} catch {
    Write-Error "Failed: $_"
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Visit: https://gitee.com/$giteeRepoPath/releases" -ForegroundColor Cyan
