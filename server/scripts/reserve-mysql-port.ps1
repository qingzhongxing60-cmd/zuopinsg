# 修复 Windows 动态端口范围异常导致的开发端口被随机占用问题。
#
# 背景：本机 TCP 动态端口范围被设成了 start=1024 num=13977（即 1024-15001），
#       远低于 Windows 默认的 49152。这会让 Hyper-V/WinNAT 在低端口区间到处保留成片端口，
#       撞上 MySQL(3306)、Vite(3500)、后端(9001) 等常见开发端口，
#       表现为 docker "ports are not available / bind forbidden"、Vite "EACCES 3500"、Prisma P1001。
#
# 本脚本做两件事：
#   1) 把动态端口范围恢复为 Windows 默认（start=49152），从源头消除低端口随机保留；
#   2) 额外把项目用到的固定端口加入持久排除，双保险。
#
# 用法：右键本文件 -> "使用 PowerShell 运行"（需管理员）；或在管理员 PowerShell 中执行。
# 重要：执行完需要【重启电脑】动态端口范围调整才会完全生效。

$ErrorActionPreference = 'Stop'

# 需要永久占住的项目端口
$ProjectPorts = @(23306, 5666, 9001, 6380)

# 1. 检查管理员权限，没有则提权重启
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "需要管理员权限，正在尝试提权重启..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList (
        "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    )
    exit
}

Write-Host "===== 修复 Windows 动态端口范围 =====" -ForegroundColor Cyan

# 2. 显示当前设置
Write-Host "`n当前动态端口范围：" -ForegroundColor DarkGray
netsh int ipv4 show dynamicport tcp

# 3. 恢复为 Windows 默认动态端口范围
netsh int ipv4 set dynamicport tcp start=49152 num=16384 | Out-Null
netsh int ipv6 set dynamicport tcp start=49152 num=16384 | Out-Null
Write-Host "已将动态端口范围恢复为默认 start=49152 num=16384。" -ForegroundColor Green

Write-Host "`n修改后动态端口范围：" -ForegroundColor DarkGray
netsh int ipv4 show dynamicport tcp

# 4. 额外持久排除项目端口（双保险）
Write-Host "`n===== 持久保留项目端口 =====" -ForegroundColor Cyan
$excluded = netsh interface ipv4 show excludedportrange protocol=tcp | Out-String
foreach ($p in $ProjectPorts) {
    try {
        netsh int ipv4 add excludedportrange protocol=tcp startport=$p numberofports=1 store=persistent | Out-Null
        Write-Host "  已保留端口 $p" -ForegroundColor Green
    } catch {
        Write-Host "  端口 $p 保留跳过（可能已被系统占用，重启后会释放）" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "完成！请【重启电脑】让动态端口范围调整完全生效。" -ForegroundColor Green
Write-Host "重启后 3306 / 3500 / 9001 等开发端口将不再被随机占用。" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "按任意键退出..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
