# 从本地配置文件读取敏感信息
$configPath = Join-Path $PSScriptRoot "local.config.ps1"

if (Test-Path $configPath) {
    . $configPath
    $token = $githubToken
    $repo = "$repoOwner/$repoName"
} else {
    Write-Error "找不到本地配置文件: $configPath"
    Write-Host "请创建 local.config.ps1 并配置以下变量："
    Write-Host "  `$githubToken = \"你的GitHubToken\""
    Write-Host "  `$repoOwner = \"你的用户名\""
    Write-Host "  `$repoName = \"仓库名\""
    exit 1
}

# 从 package.json 读取版本号
$packageJsonPath = Join-Path $PSScriptRoot "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$tag = "v$($packageJson.version)"

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}

# Create Release
$body = @{
    tag_name = $tag
    name = $tag
    body = "大学生记账本 $tag"
    draft = $false
    prerelease = $false
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method Post -Headers $headers -Body $body -ContentType "application/json"

Write-Host "Release created: $($response.html_url)"

# Upload asset (optional - skip for now due to large file size)
# The update system will work with the release metadata alone
