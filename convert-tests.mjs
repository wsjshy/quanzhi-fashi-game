// 批量把测试文件的require改为import，module.exports改为export
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname, 'tests');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    // 替换 require('./xxx') 为 import ... from './xxx.js'
    // 模式1: const { a, b } = require('./xxx')
    content = content.replace(/const\s*\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\)/g, (match, names, reqPath) => {
        const ext = reqPath.endsWith('.js') ? '' : '.js';
        changed = true;
        return `import {${names}} from '${reqPath}${ext}'`;
    });
    
    // 模式2: const xxx = require('./xxx')
    content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g, (match, name, reqPath) => {
        const ext = reqPath.endsWith('.js') ? '' : '.js';
        changed = true;
        return `import ${name} from '${reqPath}${ext}'`;
    });
    
    // 替换 module.exports = { ... } 为 export { ... }
    content = content.replace(/module\.exports\s*=\s*\{([^}]+)\}/g, (match, names) => {
        changed = true;
        return `export {${names}}`;
    });
    
    // 替换 module.exports = functionName 为 export default functionName
    content = content.replace(/module\.exports\s*=\s*(\w+)/g, (match, name) => {
        changed = true;
        return `export default ${name}`;
    });
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  Updated: ${path.basename(filePath)}`);
    }
    return changed;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js') && file !== 'utils.js') {
            processFile(filePath);
        }
    }
}

console.log('Converting test files to ES modules...');
walkDir(testsDir);
console.log('Done!');
