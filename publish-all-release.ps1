# Publish to GitHub and Gitee simultaneously

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

Write-Host "=========================================="
Write-Host "  Multi-Platform Release Publisher"
Write-Host "=========================================="
Write-Host ""
Write-Host "Version: $tag"
Write-Host ""

# Publish to GitHub
Write-Host "--- [1/2] Publishing to GitHub ---"
$githubHeaders = @{
    "Authorization" = "token $githubToken"
    "Accept" = "application/vnd.github.v3+json"
}

$githubBody = @{
    tag_name = $tag
    name = $tag
    body = "Finance Tracker $tag"
    draft = $false
    prerelease = $false
} | ConvertTo-Json

try {
    $githubResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoOwner/$repoName/releases" -Method Post -Headers $githubHeaders -Body $githubBody -ContentType "application/json"
    Write-Host "OK - GitHub Release created"
    Write-Host "   $($githubResponse.html_url)"
} catch {
    Write-Warning "GitHub failed: $($_.Exception.Message)"
}

Write-Host ""

# Publish to Gitee
Write-Host "--- [2/2] Publishing to Gitee ---"
$giteeHeaders = @{
    "Authorization" = "Bearer $giteeToken"
    "Content-Type" = "application/json"
}

$giteeBody = @{
    tag_name = $tag
    name = $tag
    body = "Finance Tracker $tag"
    target_commitish = "master"
} | ConvertTo-Json -Depth 3

try {
    $giteeResponse = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$giteeOwner/$giteeRepoName/releases" -Method Post -Headers $giteeHeaders -Body $giteeBody
    Write-Host "OK - Gitee Release created"
    Write-Host "   $($giteeResponse.html_url)"
} catch {
    Write-Warning "Gitee failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=========================================="
Write-Host "  Publishing Complete!"
Write-Host "=========================================="
Write-Host ""
Write-Host "GitHub: https://github.com/$repoOwner/$repoName/releases"
Write-Host "Gitee:  https://gitee.com/$giteeOwner/$giteeRepoName/releases"
Write-Host ""
