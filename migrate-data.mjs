// 迁移数据文件为ES Modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'engine', 'data');
const destDir = path.join(__dirname, 'src', 'data');

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    let content = fs.readFileSync(srcPath, 'utf-8');

    // 跳过index.js（特殊处理）
    if (file === 'index.js') {
        // index.js是合并入口，需要改为import所有数据然后export
        console.log(`Skipping ${file} (will handle separately)`);
        continue;
    }

    // 找到第一个 const XXX = 提取变量名
    const match = content.match(/^const\s+(\w+)\s*=/m);
    if (!match) {
        console.log(`WARN: No const found in ${file}`);
        continue;
    }
    const varName = match[1];

    // 把 const XXX = 改为 export const XXX =
    content = content.replace(/^const\s+(\w+)\s*=/m, 'export const $1 =');

    // 在文件末尾添加 export default
    if (!content.includes('export default')) {
        content = content.trimEnd() + `\n\nexport default ${varName};\n`;
    }

    fs.writeFileSync(destPath, content, 'utf-8');
    console.log(`Migrated: ${file} (${varName})`);
}

console.log('\nData files migration complete.');
