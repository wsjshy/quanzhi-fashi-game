@echo off
chcp 65001 >nul
echo ========================================
echo 全职法师网页游戏 - 一键构建并运行
echo ========================================
echo.

echo [1/3] 正在构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 正在复制构建产物到根目录...
copy /Y dist\index.html index.html >nul
if not exist assets mkdir assets
xcopy /Y /E /I dist\assets\* assets\ >nul
echo 复制完成！

echo.
echo [3/3] 正在启动游戏...
start "" "%cd%\index.html"

echo.
echo ========================================
echo 构建完成！游戏已在浏览器中打开。
echo 以后可以直接双击 index.html 打开游戏。
echo ========================================
pause
