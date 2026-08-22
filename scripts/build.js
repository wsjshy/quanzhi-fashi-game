/**
 * 完整构建脚本：确保index.html可以直接双击打开
 *
 * 处理循环问题：
 * - 构建前：index.html需要是Vite开发入口格式（有type="module"，引用/src/main.js）
 * - 构建后：index.html需要是IIFE格式（没有type="module"，引用构建后的JS文件）
 *
 * 用法：node scripts/build.js
 * 或：npm run build:copy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');

// Vite开发入口格式的script标签（构建前需要这个）
const VITE_ENTRY_SCRIPT = '<script type="module" src="/src/main.js"></script>';

console.log('========================================');
console.log('全职法师网页游戏 - 完整构建脚本');
console.log('========================================\n');

// 步骤1：确保index.html是Vite开发入口格式
console.log('[1/4] 确保index.html是Vite开发入口格式...');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 检查是否已经是Vite开发入口格式
if (indexContent.includes(VITE_ENTRY_SCRIPT)) {
    console.log('  ✓ index.html已经是Vite开发入口格式');
} else {
    // 替换所有现有的script标签为Vite开发入口格式
    // 匹配各种形式的script标签（有type="module"或没有，引用assets或/src/main.js）
    indexContent = indexContent.replace(
        /<script[^>]*src="[^"]*"[^>]*><\/script>/g,
        VITE_ENTRY_SCRIPT
    );
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('  ✓ 已恢复index.html为Vite开发入口格式');
}

// 步骤2：运行vite build
console.log('\n[2/4] 运行vite build...');
try {
    execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });
    console.log('  ✓ 构建成功');
} catch (error) {
    console.error('  ✗ 构建失败！');
    process.exit(1);
}

// 步骤3：复制dist/index.html到根目录，移除type="module"和crossorigin属性
console.log('\n[3/4] 复制dist/index.html到根目录（移除ES Modules限制）...');
const distIndexPath = path.join(rootDir, 'dist', 'index.html');
if (fs.existsSync(distIndexPath)) {
    let distIndexContent = fs.readFileSync(distIndexPath, 'utf8');
    // 移除type="module"和crossorigin属性，使index.html可以在file://协议下直接打开
    distIndexContent = distIndexContent.replace(
        /<script type="module" crossorigin src="\.\/assets\//g,
        '<script src="./assets/'
    );
    distIndexContent = distIndexContent.replace(
        /<script type="module" crossorigin src="\/assets\//g,
        '<script src="./assets/'
    );
    distIndexContent = distIndexContent.replace(
        /<script async type="module" crossorigin src="\.\/assets\//g,
        '<script src="./assets/'
    );
    fs.writeFileSync(indexPath, distIndexContent, 'utf8');
    console.log('  ✓ 已复制index.html（已移除ES Modules限制）');
} else {
    console.error('  ✗ dist/index.html不存在！');
    process.exit(1);
}

// 步骤4：复制dist/assets到根目录
console.log('\n[4/4] 复制dist/assets到根目录...');
const distAssetsPath = path.join(rootDir, 'dist', 'assets');
const rootAssetsPath = path.join(rootDir, 'assets');
if (fs.existsSync(distAssetsPath)) {
    // 删除根目录现有的assets目录
    if (fs.existsSync(rootAssetsPath)) {
        fs.rmSync(rootAssetsPath, { recursive: true, force: true });
    }
    // 复制assets目录
    fs.cpSync(distAssetsPath, rootAssetsPath, { recursive: true });
    console.log('  ✓ 已复制assets/目录');
} else {
    console.error('  ✗ dist/assets不存在！');
    process.exit(1);
}

console.log('\n========================================');
console.log('构建完成！现在可以直接双击 index.html 打开游戏');
console.log('========================================');
