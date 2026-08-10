# 全职法师游戏 - Netlify 一键部署脚本
# 使用方法：在项目根目录运行 .\tools\deploy.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DeployDir = Join-Path $ProjectRoot "deploy_dist"
$SiteId = "29cad1c9-36ed-48fd-854f-2c0052e01ca0"

Write-Host "=== 全职法师游戏部署 ===" -ForegroundColor Cyan
Write-Host "项目目录: $ProjectRoot"

# 1. 创建干净部署目录
Write-Host "`n[1/4] 创建干净部署目录..." -ForegroundColor Yellow
if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}
New-Item -ItemType Directory -Path $DeployDir | Out-Null

# 2. 复制必需文件
Write-Host "[2/4] 复制游戏文件..." -ForegroundColor Yellow
Copy-Item (Join-Path $ProjectRoot "index.html") $DeployDir
Copy-Item -Recurse (Join-Path $ProjectRoot "engine") $DeployDir
Copy-Item -Recurse (Join-Path $ProjectRoot "assets") $DeployDir

$fileCount = (Get-ChildItem -Recurse $DeployDir | Measure-Object).Count
Write-Host "  已复制 $fileCount 个文件"

# 3. 部署到 Netlify
Write-Host "[3/4] 部署到 Netlify..." -ForegroundColor Yellow
Set-Location $ProjectRoot
netlify deploy --prod --dir=deploy_dist --site=$SiteId

# 4. 清理
Write-Host "`n[4/4] 清理临时文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $DeployDir

Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
Write-Host "游戏地址: https://quanzhi-fashi-game.netlify.app" -ForegroundColor Green
Write-Host "管理后台: https://app.netlify.com/projects/quanzhi-fashi-game" -ForegroundColor Cyan
