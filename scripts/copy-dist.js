/**
 * 把dist目录的构建产物复制到根目录
 * 这样index.html就可以直接用file://协议打开，不需要启动服务器
 *
 * 用法：node scripts/copy-dist.js
 * 或：npm run build:copy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// 检查dist目录是否存在
if (!fs.existsSync(distDir)) {
  console.error('错误：dist目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 复制index.html
const distIndex = path.join(distDir, 'index.html');
const rootIndex = path.join(rootDir, 'index.html');
if (fs.existsSync(distIndex)) {
  let indexContent = fs.readFileSync(distIndex, 'utf8');
  // 移除type="module"和crossorigin属性，使index.html可以在file://协议下直接打开
  // Vite构建后默认使用ES Modules，在file://协议下Chrome会因CORS策略阻止加载
  indexContent = indexContent.replace(/<script type="module" crossorigin src="\.\/assets\//g, '<script src="./assets/');
  indexContent = indexContent.replace(/<script type="module" crossorigin src="\/assets\//g, '<script src="./assets/');
  fs.writeFileSync(rootIndex, indexContent, 'utf8');
  console.log('✓ 已复制 index.html（已移除ES Modules限制，可直接双击打开）');
}

// 复制assets目录
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(rootDir, 'assets');
if (fs.existsSync(distAssets)) {
  // 如果根目录已有assets目录，先删除
  if (fs.existsSync(rootAssets)) {
    fs.rmSync(rootAssets, { recursive: true, force: true });
  }
  // 复制assets目录
  fs.cpSync(distAssets, rootAssets, { recursive: true });
  console.log('✓ 已复制 assets/ 目录');
}

console.log('\n========================================');
console.log('构建产物已复制到根目录！');
console.log('现在可以直接双击 index.html 打开游戏');
console.log('========================================');
