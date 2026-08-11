/**
 * 游戏自动化测试脚本 v2
 * 完善 DOM mock，初始化游戏后测试核心操作
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
let elementIdCounter = 0;
function createMockElement(tag = 'div') {
    const el = {
        id: 'mock-' + (++elementIdCounter),
        tagName: tag.toUpperCase(),
        style: {},
        children: [],
        _innerHTML: '',
        _textContent: '',
        get innerHTML() { return this._innerHTML; },
        set innerHTML(v) { this._innerHTML = v; },
        get textContent() { return this._textContent; },
        set textContent(v) { this._textContent = v; },
        appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
        removeChild(child) { const i = this.children.indexOf(child); if (i >= 0) this.children.splice(i, 1); },
        addEventListener() {},
        removeEventListener() {},
        click() {},
        setAttribute(k, v) { this[k] = v; },
        getAttribute(k) { return this[k] || null; },
        classList: { 
            _classes: new Set(),
            add(c) { this._classes.add(c); }, 
            remove(c) { this._classes.delete(c); }, 
            toggle(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); }, 
            contains(c) { return this._classes.has(c); } 
        },
        querySelector() { return createMockElement(); },
        querySelectorAll() { return []; },
        getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100 }; },
        focus() {},
        blur() {}
    };
    return el;
}

// 模拟 document
const elementsById = {};
const documentMock = {
    getElementById(id) {
        if (!elementsById[id]) {
            elementsById[id] = createMockElement('div');
            elementsById[id].id = id;
        }
        return elementsById[id];
    },
    createElement(tag) { return createMockElement(tag); },
    body: createMockElement('body'),
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return createMockElement(); },
    querySelectorAll() { return []; },
    createTextNode(text) { return { textContent: text, nodeType: 3 }; }
};

// 模拟 window
const windowMock = {
    addEventListener() {},
    removeEventListener() {},
    localStorage: localStorageMock,
    console: console,
    Error: Error,
    innerWidth: 1280,
    innerHeight: 960
};
windowMock.window = windowMock;

// 创建沙箱
const sandbox = {
    console: console,
    window: windowMock,
    document: documentMock,
    localStorage: localStorageMock,
    setTimeout: (fn) => { try { fn(); } catch(e) { console.log('setTimeout error:', e.message); } return 0; },
    clearTimeout: () => {},
    setInterval: (fn) => { try { fn(); } catch(e) { console.log('setInterval error:', e.message); } return 0; },
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
    Infinity: Infinity,
    prompt: () => '测试玩家',
    confirm: () => true,
    alert: () => {}
};
sandbox.window = windowMock;
sandbox.self = windowMock;
sandbox.globalThis = sandbox;

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
console.log('Game:', typeof Game);
console.log('Player:', typeof Player);
console.log('DataManager:', typeof DataManager);

// 测试0: 初始化游戏
console.log('\\n--- 测试0: 初始化游戏 ---');
try {
    Game.init();
    console.log('Game.init() 成功');
    const locs = DataManager.getAllLocations();
    console.log('地点数量:', locs.length);
} catch(e) {
    console.log('ERROR Game.init():', e.message);
    console.log(e.stack);
}

// 测试1: 开始新游戏
console.log('\\n--- 测试1: 开始新游戏 ---');
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

// 测试2: 获取当前地点
console.log('\\n--- 测试2: 获取当前地点 ---');
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

// 测试3: 执行所有行动
console.log('\\n--- 测试3: 执行所有行动 ---');
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
                console.log('    堆栈:', e.stack.split('\\n').slice(0,3).join(' | '));
            }
        }
    }
} catch(e) {
    console.log('ERROR performAction:', e.message);
}

// 测试4: 检查地点解锁
console.log('\\n--- 测试4: 检查地点解锁 ---');
try {
    const unlocked = MapSystem.checkLocationUnlocks();
    console.log('新解锁地点:', unlocked.length);
} catch(e) {
    console.log('ERROR checkLocationUnlocks:', e.message);
    console.log(e.stack);
}

// 测试5: 旅行到其他地点
console.log('\\n--- 测试5: 旅行到其他地点 ---');
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
}

console.log('\\n=== 测试完成 ===');
`;

try {
    vm.runInContext(testCode, sandbox, { filename: 'test-runner' });
} catch (e) {
    console.log('测试执行错误:', e.message);
    console.log(e.stack);
}
