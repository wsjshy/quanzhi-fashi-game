/**
 * 验证拆分后的数据与原始 game-data.js 完全一致
 * 使用：node tools/verify-split.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// 加载原始数据
const originalCode = fs.readFileSync(path.join(PROJECT_ROOT, 'engine', 'game-data.js'), 'utf-8');
const sandbox1 = { console };
vm.createContext(sandbox1);
vm.runInContext(originalCode + '\n;this.__d = GameData;', sandbox1);
const original = sandbox1.__d;

// 加载拆分后的数据（按index.html的顺序）
const dataFiles = ['skills', 'characters', 'locations', 'items', 'quests', 'events', 'shops', 'enemies', 'world'];
const sandbox2 = { console };
vm.createContext(sandbox2);
for (const f of dataFiles) {
    const code = fs.readFileSync(path.join(PROJECT_ROOT, 'engine', 'data', f + '.js'), 'utf-8');
    vm.runInContext(code, sandbox2);
}
// index.js单独执行，并导出GameData
const indexCode = fs.readFileSync(path.join(PROJECT_ROOT, 'engine', 'data', 'index.js'), 'utf-8');
vm.runInContext(indexCode + '\n;this.__d = GameData;', sandbox2);
const split = sandbox2.__d;

// 深度比较
function deepCompare(a, b, path = '') {
    const errors = [];
    
    if (a === null || b === null) {
        if (a !== b) errors.push(`${path}: null mismatch (${a} vs ${b})`);
        return errors;
    }
    
    if (typeof a !== typeof b) {
        errors.push(`${path}: type mismatch (${typeof a} vs ${typeof b})`);
        return errors;
    }
    
    if (typeof a !== 'object') {
        if (a !== b) errors.push(`${path}: value mismatch (${JSON.stringify(a)} vs ${JSON.stringify(b)})`);
        return errors;
    }
    
    if (Array.isArray(a) !== Array.isArray(b)) {
        errors.push(`${path}: array mismatch`);
        return errors;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
        errors.push(`${path}: key count mismatch (${keysA.length} vs ${keysB.length})`);
        const missing = keysA.filter(k => !keysB.includes(k));
        const extra = keysB.filter(k => !keysA.includes(k));
        if (missing.length) errors.push(`  缺失: ${missing.join(', ')}`);
        if (extra.length) errors.push(`  多余: ${extra.join(', ')}`);
    }
    
    for (const key of keysA) {
        if (!(key in b)) {
            errors.push(`${path}.${key}: 缺失在拆分数据中`);
            continue;
        }
        errors.push(...deepCompare(a[key], b[key], `${path}.${key}`));
    }
    
    return errors;
}

console.log('验证拆分数据一致性 ...\n');

const errors = deepCompare(original, split);

if (errors.length === 0) {
    console.log('✓ 数据完全一致！拆分成功。');
    console.log(`  顶级属性: ${Object.keys(original).join(', ')}`);
} else {
    console.log(`✗ 发现 ${errors.length} 处不一致：`);
    errors.slice(0, 30).forEach(e => console.log('  ' + e));
    if (errors.length > 30) console.log(`  ... 还有 ${errors.length - 30} 处`);
    process.exit(1);
}
