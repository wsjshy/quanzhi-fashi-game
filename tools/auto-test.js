/**
 * 游戏自动化测试脚本
 * 模拟浏览器环境，加载所有游戏脚本，执行核心操作
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// 模拟 localStorage
const localStorageMock = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, value) { this._data[key] = value; },
    removeItem(key) { delete this._data[key]; }
};

// 模拟 DOM 元素
function createMockElement(tag = 'div') {
    return {
        tagName: tag,
        style: {},
        children: [],
        innerHTML: '',
        textContent: '',
        appendChild(child) { this.children.push(child); return child; },
        removeChild(child) { const i = this.children.indexOf(child); if (i >= 0) this.children.splice(i, 1); },
        addEventListener() {},
        removeEventListener() {},
        click() {},
        setAttribute() {},
        getAttribute() { return null; },
        classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
        querySelector() { return createMockElement(); },
        querySelectorAll() { return []; }
    };
}

// 模拟 document
const documentMock = {
    _elements: {},
    getElementById(id) {
        if (!this._elements[id]) {
            this._elements[id] = createMockElement();
        }
        return this._elements[id];
    },
    createElement(tag) { return createMockElement(tag); },
    body: createMockElement('body'),
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return createMockElement(); },
    querySelectorAll() { return []; }
};

// 模拟 window
const windowMock = {
    addEventListener() {},
    removeEventListener() {},
    localStorage: localStorageMock,
    console: console,
    Error: Error
};

// 创建沙箱
const sandbox = {
    console: console,
    window: windowMock,
    document: documentMock,
    localStorage: localStorageMock,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: (fn) => fn(),
    clearInterval: () => {},
    Math: Math,
    Date: Date,
    JSON: JSON,
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Error: Error,
    TypeError: TypeError,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    Infinity: Infinity
};
windowMock.window = windowMock;
sandbox.window = windowMock;
sandbox.self = windowMock;

vm.createContext(sandbox);

// 游戏根目录
const gameRoot = path.join(__dirname, '..');

// 按顺序加载所有脚本
const scriptFiles = [
    'engine/data/skills.js',
    'engine/data/characters.js',
    'engine/data/locations.js',
    'engine/data/items.js',
    'engine/data/quests.js',
    'engine/data/events.js',
    'engine/data/shops.js',
    'engine/data/enemies.js',
    'engine/data/world.js',
    'engine/data/index.js',
    'engine/data.js',
    'engine/skill.js',
    'engine/inventory.js',
    'engine/player.js',
    'engine/time.js',
    'engine/quest.js',
    'engine/event.js',
    'engine/shop.js',
    'engine/map.js',
    'engine/battle.js',
    'engine/world-state.js',
    'engine/npc-state.js',
    'engine/dialogue-tree.js',
    'engine/ui.js',
    'engine/game.js'
];

console.log('=== 加载脚本 ===');
for (const f of scriptFiles) {
    try {
        const code = fs.readFileSync(path.join(gameRoot, f), 'utf8');
        vm.runInContext(code, sandbox, { filename: f });
        console.log('  OK:', f);
    } catch (e) {
        console.log('  ERROR:', f, '-', e.message);
        console.log('  堆栈:', e.stack);
        process.exit(1);
    }
}

// 在沙箱中执行测试
console.log('\n=== 执行测试 ===');

const testCode = `
// 全局对象已在加载脚本时声明，直接使用
console.log('Game:', typeof Game);
console.log('Player:', typeof Player);
console.log('DataManager:', typeof DataManager);
console.log('MapSystem:', typeof MapSystem);
console.log('UI:', typeof UI);

// 测试1: 数据加载
console.log('\\n--- 测试1: 数据加载 ---');
try {
    const locs = DataManager.getAllLocations();
    console.log('地点数量:', locs.length);
    console.log('地点列表:', locs.map(l => l.id).join(', '));
} catch(e) {
    console.log('ERROR getAllLocations:', e.message);
}

// 测试2: 开始新游戏
console.log('\\n--- 测试2: 开始新游戏 ---');
try {
    Game.startNewGame();
    console.log('新游戏创建成功');
    console.log('玩家等级:', Player.level);
    console.log('玩家元素:', Player.elements);
    console.log('当前地点:', Player.currentLocation);
} catch(e) {
    console.log('ERROR startNewGame:', e.message);
    console.log(e.stack);
}

// 测试3: 获取当前地点
console.log('\\n--- 测试3: 获取当前地点 ---');
try {
    const loc = DataManager.getLocation(Player.currentLocation);
    console.log('地点名称:', loc ? loc.name : 'null');
    console.log('行动数量:', loc ? (loc.actions || []).length : 0);
    if (loc && loc.actions) {
        console.log('行动列表:', loc.actions.map(a => a.id).join(', '));
    }
} catch(e) {
    console.log('ERROR getLocation:', e.message);
}

// 测试4: 执行所有行动
console.log('\\n--- 测试4: 执行所有行动 ---');
try {
    const loc = DataManager.getLocation(Player.currentLocation);
    if (loc && loc.actions) {
        for (const action of loc.actions) {
            try {
                console.log('  执行行动:', action.id, '-', action.name);
                Game.performAction(action.id);
                console.log('    成功');
            } catch(e) {
                console.log('    ERROR:', e.message);
            }
        }
    }
} catch(e) {
    console.log('ERROR performAction:', e.message);
    console.log(e.stack);
}

// 测试5: 检查地点解锁
console.log('\\n--- 测试5: 检查地点解锁 ---');
try {
    const unlocked = MapSystem.checkLocationUnlocks();
    console.log('新解锁地点:', unlocked.length);
} catch(e) {
    console.log('ERROR checkLocationUnlocks:', e.message);
    console.log(e.stack);
}

// 测试6: 旅行到其他地点
console.log('\\n--- 测试6: 旅行到其他地点 ---');
try {
    const allLocs = DataManager.getAllLocations();
    for (const loc of allLocs) {
        if (loc.id !== Player.currentLocation) {
            try {
                console.log('  旅行到:', loc.id, '-', loc.name);
                Game.travelTo(loc.id);
                console.log('    成功');
            } catch(e) {
                console.log('    ERROR:', e.message);
            }
        }
    }
} catch(e) {
    console.log('ERROR travelTo:', e.message);
    console.log(e.stack);
}

console.log('\\n=== 测试完成 ===');
`;

try {
    vm.runInContext(testCode, sandbox, { filename: 'test-runner' });
} catch (e) {
    console.log('测试执行错误:', e.message);
    console.log(e.stack);
}
