# 全职法师游戏 - 自动化部署脚本
# 用法：.\tools\deploy.ps1 -Version "v3.1.0" -Message "博城篇内容深化"
# 作用：一键构建并部署到GitHub Pages的gh-pages分支

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [string]$GitPath = "D:\Git\cmd\git.exe",
    [string]$TempDir = "C:\temp\dist-deploy",
    [string]$Remote = "github"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "C:\Users\22210\Desktop\quanzhi-fashi-game-master"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  全职法师游戏自动化部署脚本" -ForegroundColor Cyan
Write-Host "  版本: $Version" -ForegroundColor Cyan
Write-Host "  描述: $Message" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 步骤1：进入项目目录
Write-Host "`n[1/10] 进入项目目录..." -ForegroundColor Yellow
Set-Location $ProjectRoot

# 步骤2：确保在master分支
Write-Host "[2/10] 检查当前分支..." -ForegroundColor Yellow
$currentBranch = & $GitPath rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "master") {
    Write-Host "  当前分支: $currentBranch，切换到master..." -ForegroundColor Yellow
    & $GitPath checkout master
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ 切换到master分支失败！请检查是否有未提交的更改。" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  ✅ 当前在master分支" -ForegroundColor Green

# 步骤3：检查工作区是否干净
Write-Host "[3/10] 检查工作区状态..." -ForegroundColor Yellow
$status = & $GitPath status --porcelain
if ($status) {
    Write-Host "  ⚠️  工作区有未提交的更改：" -ForegroundColor Red
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    Write-Host "  请先提交或stash更改后再部署。" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 工作区干净" -ForegroundColor Green

# 步骤4：构建项目
Write-Host "[4/10] 构建项目..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 构建失败！" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "dist")) {
    Write-Host "  ❌ dist目录不存在！构建可能失败。" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 构建成功，dist目录已生成" -ForegroundColor Green

# 步骤5：复制dist到临时目录
Write-Host "[5/10] 复制构建产物到临时目录..." -ForegroundColor Yellow
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
Copy-Item -Path "dist\*" -Destination $TempDir -Recurse -Force
if (-not (Test-Path "$TempDir\index.html")) {
    Write-Host "  ❌ 临时目录中没有index.html！复制失败。" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 已复制到临时目录: $TempDir" -ForegroundColor Green

# 步骤6：切换到gh-pages分支
Write-Host "[6/10] 切换到gh-pages分支..." -ForegroundColor Yellow
& $GitPath checkout gh-pages
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 切换到gh-pages分支失败！" -ForegroundColor Red
    Write-Host "  尝试创建gh-pages分支..." -ForegroundColor Yellow
    & $GitPath checkout --orphan gh-pages
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ 创建gh-pages分支失败！" -ForegroundColor Red
        exit 1
    }
    & $GitPath rm -rf . -ErrorAction SilentlyContinue
}
Write-Host "  ✅ 已切换到gh-pages分支" -ForegroundColor Green

# 步骤7：清空旧文件并复制新构建产物
Write-Host "[7/10] 清空旧文件并复制新构建产物..." -ForegroundColor Yellow
Get-ChildItem -Exclude ".git" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$TempDir\*" -Destination "." -Recurse -Force

# 添加.gitignore
"node_modules/`ndist/`n.vite/`n.netlify/`n.vercel/" | Out-File -FilePath ".gitignore" -Encoding utf8

if (-not (Test-Path "index.html")) {
    Write-Host "  ❌ index.html不存在！复制失败。" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 构建产物已复制到gh-pages分支" -ForegroundColor Green

# 步骤8：提交
Write-Host "[8/10] 提交更改..." -ForegroundColor Yellow
& $GitPath add .
$commitMessage = "Deploy: $Version $Message"
& $GitPath commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  没有新的更改需要提交（可能与上次部署相同）" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ 已提交: $commitMessage" -ForegroundColor Green
}

# 步骤9：推送到远程
Write-Host "[9/10] 推送到远程仓库..." -ForegroundColor Yellow
& $GitPath push $Remote gh-pages --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ 推送失败！" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ 已推送到 $Remote/gh-pages" -ForegroundColor Green

# 步骤10：切回master分支并清理
Write-Host "[10/10] 切回master分支并清理临时目录..." -ForegroundColor Yellow
& $GitPath checkout master
Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
Write-Host "  ✅ 已切回master分支，临时目录已清理" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ 部署完成！" -ForegroundColor Green
Write-Host "  版本: $Version" -ForegroundColor Green
Write-Host "  描述: $Message" -ForegroundColor Green
Write-Host "  访问地址: https://wsjshy.github.io/quanzhi-fashi-game/" -ForegroundColor Green
Write-Host "  调试模式: https://wsjshy.github.io/quanzhi-fashi-game/?debug=1" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
