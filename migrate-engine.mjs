// 迁移引擎文件为ES Modules（保持window全局兼容）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'engine');
const destDir = path.join(__dirname, 'src', 'engine');

// 排除data子目录和test-utils.js（测试工具）
const excludeFiles = ['test-utils.js', 'data.js'];

const files = fs.readdirSync(srcDir).filter(f => 
    f.endsWith('.js') && !excludeFiles.includes(f)
);

let totalMigrated = 0;

for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    let content = fs.readFileSync(srcPath, 'utf-8');

    // 找到所有顶层const定义（行首的const XXX =）
    const constMatches = [...content.matchAll(/^const\s+(\w+)\s*=/gm)];
    
    if (constMatches.length === 0) {
        console.log(`WARN: No top-level const found in ${file}`);
        // 直接复制
        fs.writeFileSync(destPath, content, 'utf-8');
        continue;
    }

    const varNames = constMatches.map(m => m[1]);
    
    // 把所有顶层 const XXX = 改为 export const XXX =
    // 注意：只替换行首的const，不替换函数内部的
    content = content.replace(/^const\s+(\w+)\s*=/gm, 'export const $1 =');

    // 在文件末尾添加window挂载（保持向后兼容）
    const windowMounts = varNames.map(name => 
        `if (typeof window !== 'undefined') window.${name} = ${name};`
    ).join('\n');
    
    if (!content.includes('window.' + varNames[0])) {
        content = content.trimEnd() + `\n\n// 向后兼容：挂载到window\n${windowMounts}\n`;
    }

    fs.writeFileSync(destPath, content, 'utf-8');
    console.log(`Migrated: ${file} (${varNames.join(', ')})`);
    totalMigrated++;
}

console.log(`\nEngine files migration complete: ${totalMigrated} files.`);
