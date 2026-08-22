// 修复数据文件中未被export的顶层const
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'src', 'data');

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js') && f !== 'index.js');

const allExtraVars = [];

for (const file of files) {
    const filePath = path.join(dataDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 找到所有顶层const（行首只有空格缩进的const，不在函数内部）
    // 简单策略：匹配 ^\s*const \w+ = 但排除已经是export的
    const lines = content.split('\n');
    const fileExtraVars = [];
    let inFunction = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 简单的函数深度跟踪（不完美但够用）
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        if (inFunction === 0) {
            // 顶层，检查是否是未export的const
            const match = line.match(/^(\s*)const\s+(\w+)\s*=/);
            if (match && !line.includes('export')) {
                const indent = match[1];
                const varName = match[2];
                lines[i] = `${indent}export const ${varName} =` + line.substring(match[0].length);
                fileExtraVars.push(varName);
                console.log(`  ${file}: export ${varName}`);
            }
        }
        
        inFunction += openBraces - closeBraces;
        if (inFunction < 0) inFunction = 0;
    }
    
    if (fileExtraVars.length > 0) {
        content = lines.join('\n');
        fs.writeFileSync(filePath, content, 'utf-8');
        allExtraVars.push({ file, vars: fileExtraVars });
    }
}

console.log('\n=== Extra variables to mount ===');
for (const item of allExtraVars) {
    console.log(`${item.file}: ${item.vars.join(', ')}`);
}
