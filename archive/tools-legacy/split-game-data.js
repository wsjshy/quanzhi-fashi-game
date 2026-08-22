/**
 * game-data.js 拆分脚本
 * 
 * 用途：把 engine/game-data.js 拆分成 engine/data/ 下的多个模块文件
 * 使用：node tools/split-game-data.js
 * 
 * 拆分后结构：
 *   engine/data/
 *   ├── index.js          # 数据入口，合并所有模块
 *   ├── skills.js         # 技能数据
 *   ├── characters.js     # NPC/角色数据
 *   ├── locations.js      # 地点数据
 *   ├── items.js          # 物品+装备数据
 *   ├── quests.js         # 任务数据
 *   ├── events.js         # 事件数据
 *   ├── shops.js          # 商店数据
 *   ├── enemies.js        # 敌人/妖魔数据
 *   └── world.js          # 势力、情报、世界观等
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const GAME_DATA_PATH = path.join(PROJECT_ROOT, 'engine', 'game-data.js');
const DATA_DIR = path.join(PROJECT_ROOT, 'engine', 'data');

// 读取game-data.js
console.log('读取 game-data.js ...');
const gameDataCode = fs.readFileSync(GAME_DATA_PATH, 'utf-8');

// 在vm中执行，获取GameData对象
console.log('解析 GameData 对象 ...');
const sandbox = { console };
vm.createContext(sandbox);
// 在代码末尾追加导出，因为const不会挂到sandbox
vm.runInContext(gameDataCode + '\n;this.__GameData = GameData;', sandbox);
const GameData = sandbox.__GameData;

if (!GameData) {
    console.error('错误：无法获取 GameData 对象');
    process.exit(1);
}

// 顶级属性列表和对应的文件名
const modules = [
    { key: 'skills', file: 'skills.js', varName: 'DataSkills', desc: '技能数据' },
    { key: 'characters', file: 'characters.js', varName: 'DataCharacters', desc: 'NPC/角色数据' },
    { key: 'locations', file: 'locations.js', varName: 'DataLocations', desc: '地点数据' },
    { key: 'items', file: 'items.js', varName: 'DataItems', desc: '物品+装备数据' },
    { key: 'quests', file: 'quests.js', varName: 'DataQuests', desc: '任务数据' },
    { key: 'events', file: 'events.js', varName: 'DataEvents', desc: '事件数据' },
    { key: 'shops', file: 'shops.js', varName: 'DataShops', desc: '商店数据' },
    { key: 'enemies', file: 'enemies.js', varName: 'DataEnemies', desc: '敌人/妖魔数据' },
];

// 剩余的属性都放到world.js
const worldKeys = [];
for (const key of Object.keys(GameData)) {
    if (!modules.find(m => m.key === key)) {
        worldKeys.push(key);
    }
}
console.log('world.js 包含属性:', worldKeys.join(', '));

// 序列化函数：把对象转成带缩进的JS对象字面量
function serialize(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    const childSpaces = '  '.repeat(indent + 1);
    
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') return JSON.stringify(obj);
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        const items = obj.map(item => childSpaces + serialize(item, indent + 1));
        return '[\n' + items.join(',\n') + '\n' + spaces + ']';
    }
    
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        const items = keys.map(key => {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
            return childSpaces + safeKey + ': ' + serialize(obj[key], indent + 1);
        });
        return '{\n' + items.join(',\n') + '\n' + spaces + '}';
    }
    
    return String(obj);
}

// 生成模块文件
function writeModuleFile(module, data) {
    const filePath = path.join(DATA_DIR, module.file);
    const content = `/**
 * ${module.desc}
 * 从 game-data.js 拆分而来
 */

const ${module.varName} = ${serialize(data, 0)};
`;
    fs.writeFileSync(filePath, content, 'utf-8');
    const sizeKB = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
    console.log(`  ✓ ${module.file} (${sizeKB} KB, ${Object.keys(data).length} 项)`);
}

// 确保data目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log('\n生成数据模块文件 ...');

// 写各个模块
for (const module of modules) {
    if (GameData[module.key]) {
        writeModuleFile(module, GameData[module.key]);
    } else {
        console.log(`  ⚠ ${module.key} 不存在，跳过`);
    }
}

// 写world.js（包含剩余所有属性）
const worldData = {};
for (const key of worldKeys) {
    worldData[key] = GameData[key];
}
writeModuleFile({ file: 'world.js', varName: 'DataWorld', desc: '势力、情报、世界观设定等' }, worldData);

// 写index.js（合并入口）
console.log('\n生成数据入口 index.js ...');
const indexContent = `/**
 * 游戏数据入口
 * 合并所有数据模块为 GameData 对象
 * 
 * 注意：本文件由 tools/split-game-data.js 自动生成
 * 修改数据请修改 engine/data/ 下对应的模块文件
 */

const GameData = {
${modules.map(m => `    ${m.key}: ${m.varName},`).join('\n')}
${worldKeys.map(k => `    ${k}: DataWorld.${k},`).join('\n')}
};
`;
fs.writeFileSync(path.join(DATA_DIR, 'index.js'), indexContent, 'utf-8');
console.log('  ✓ index.js');

console.log('\n拆分完成！');
console.log('下一步：在 index.html 中按顺序引入以下脚本：');
console.log('  engine/data/skills.js');
console.log('  engine/data/characters.js');
console.log('  engine/data/locations.js');
console.log('  engine/data/items.js');
console.log('  engine/data/quests.js');
console.log('  engine/data/events.js');
console.log('  engine/data/shops.js');
console.log('  engine/data/enemies.js');
console.log('  engine/data/world.js');
console.log('  engine/data/index.js');
console.log('  （然后才是 engine/data.js, engine/game.js 等）');
