# 关闭待办事项管理应用的所有进程
$processes = Get-Process | Where-Object {$_.MainWindowTitle -like "*待办事项*"}
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "已关闭 $($processes.Count) 个进程" -ForegroundColor Green
} else {
    Write-Host "没有找到运行中的应用" -ForegroundColor Yellow
}
