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

Write-Host "Publishing to Gitee..."
Write-Host "Version: $tag"
Write-Host "Repository: $giteeRepoPath"
Write-Host ""

$releaseBody = @{
    tag_name = $tag
    name = $tag
    body = "Finance Tracker $tag"
    target_commitish = "master"
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "https://gitee.com/api/v5/repos/$giteeRepoPath/releases" -Method Post -Headers $headers -Body $releaseBody

    Write-Host "Success! Gitee Release created."
    Write-Host "URL: $($response.html_url)"

} catch {
    Write-Error "Failed: $_"
    exit 1
}

Write-Host ""
Write-Host "Visit: https://gitee.com/$giteeRepoPath/releases"
