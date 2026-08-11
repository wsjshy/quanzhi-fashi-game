/**
 * 游戏完整流程测试脚本
 * 模拟玩家从创建角色到推进剧情的完整流程
 * 记录每一步状态，发现bug，评估平衡
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// 模拟 localStorage
const localStorageMock = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, value) { this._data[key] = value; },
    removeItem(key) { delete this._data[key]; },
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
        _value: '',
        get innerHTML() { return this._innerHTML; },
        set innerHTML(v) { this._innerHTML = v; },
        get textContent() { return this._textContent; },
        set textContent(v) { this._textContent = v; },
        get value() { return this._value; },
        set value(v) { this._value = v; },
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
        blur() {},
        getContext() { return { fillRect() {}, fillText() {}, beginPath() {}, arc() {}, stroke() {}, fill() {} }; }
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

console.log('=== 加载游戏脚本 ===');
for (const f of scriptFiles) {
    try {
        const code = fs.readFileSync(path.join(gameRoot, f), 'utf8');
        vm.runInContext(code, sandbox, { filename: f });
    } catch (e) {
        console.log('  ERROR:', f, '-', e.message);
        process.exit(1);
    }
}
console.log('脚本加载完成\n');

// 流程日志
const playLog = [];
function log(step, action, result) {
    const state = getPlayerState();
    playLog.push({
        step,
        action,
        result,
        ...state
    });
    console.log(`[步骤${step}] ${action} → ${result} | Lv${state.level} HP${state.hp}/${state.maxHp} MP${state.mp}/${state.maxMp} 体力${state.stamina}/${state.maxStamina} 金${state.gold} 时间${state.time} 地点${state.location}`);
}

function getPlayerState() {
    const p = sandbox.Player;
    const t = sandbox.TimeSystem;
    return {
        level: p.level,
        exp: p.exp,
        hp: p.hp,
        maxHp: p.getTotalStats().maxHp,
        mp: p.mp,
        maxMp: p.getTotalStats().maxMp,
        stamina: p.stamina,
        maxStamina: p.getTotalStats().maxStamina,
        gold: p.gold,
        location: p.currentLocation,
        time: `第${t.day}天 ${t.hour}:00`,
        day: t.day,
        hour: t.hour,
        skills: p.skills ? p.skills.length : 0,
        quests: sandbox.QuestSystem ? sandbox.QuestSystem.activeQuests.length : 0,
        items: sandbox.Inventory ? sandbox.Inventory.getAllItems().length : 0
    };
}

// 在沙箱中执行游戏流程
const playthroughCode = `
(function() {
    const results = [];
    
    // 初始化游戏
    Game.init();
    
    // 创建角色（火系）
    Game.createCharacter('测试玩家', 'fire', '男');
    
    results.push({
        step: 0,
        action: '创建角色（火系）',
        state: getState()
    });
    
    // ===== 第1天：新手任务 =====
    
    // 1. 在学校修炼（完成初识魔法任务）
    Game.performAction('study');
    results.push({ step: 1, action: '学校修炼', state: getState() });
    
    // 2. 去雪峰山采集草药
    Game.travelTo('xuefeng_mountain');
    results.push({ step: 2, action: '前往雪峰山', state: getState() });
    
    // 采集草药（完成采集草药任务）
    for (let i = 0; i < 5; i++) {
        Game.performAction('gather');
    }
    results.push({ step: 3, action: '采集5次草药', state: getState() });
    
    // 3. 战斗（探索触发）
    Game.performAction('explore');
    results.push({ step: 4, action: '探索（可能触发战斗）', state: getState() });
    
    // 4. 回学校
    Game.travelTo('tianlan_school');
    results.push({ step: 5, action: '返回学校', state: getState() });
    
    // 5. 修炼升级
    let studyCount = 0;
    while (Player.level < 3 && Player.stamina > 20 && studyCount < 10) {
        Game.performAction('study');
        studyCount++;
    }
    results.push({ step: 6, action: \`修炼\${studyCount}次到\${Player.level}级\`, state: getState() });
    
    // ===== 第2天：探索博城市街 =====
    
    Game.performAction('sleep');
    results.push({ step: 7, action: '睡觉恢复', state: getState() });
    
    Game.travelTo('bo_city');
    results.push({ step: 8, action: '前往博城市街', state: getState() });
    
    Game.performAction('shop');
    results.push({ step: 9, action: '逛商店', state: getState() });
    
    // ===== 统计 =====
    results.push({ step: 99, action: '流程结束', state: getState() });
    
    return results;
    
    function getState() {
        return {
            level: Player.level,
            exp: Player.exp,
            hp: Player.hp,
            maxHp: Player.getTotalStats().maxHp,
            mp: Player.mp,
            maxMp: Player.getTotalStats().maxMp,
            stamina: Player.stamina,
            maxStamina: Player.getTotalStats().maxStamina,
            gold: Player.gold,
            location: Player.currentLocation,
            day: Player.day,
            hour: Player.hour,
            skills: Player.skills.length,
            activeQuests: QuestSystem.activeQuests.length,
            completedQuests: QuestSystem.completedQuests.length,
            items: Inventory.getAllItems().length
        };
    }
})();
`;

console.log('=== 开始游戏流程测试 ===\n');

try {
    const results = vm.runInContext(playthroughCode, sandbox);
    
    console.log('\n=== 流程测试结果 ===\n');
    
    for (const r of results) {
        const s = r.state;
        console.log(`步骤${r.step}: ${r.action}`);
        console.log(`  等级: ${s.level} 经验: ${s.exp}`);
        console.log(`  HP: ${s.hp}/${s.maxHp}  MP: ${s.mp}/${s.maxMp}  体力: ${s.stamina}/${s.maxStamina}`);
        console.log(`  金币: ${s.gold}  地点: ${s.location}`);
        console.log(`  时间: 第${s.day}天 ${s.hour}:00`);
        console.log(`  技能: ${s.skills}个  任务: ${s.activeQuests}个进行中 / ${s.completedQuests}个完成`);
        console.log(`  物品: ${s.items}种`);
        console.log('');
    }
    
    // 保存结果到文件
    fs.writeFileSync(path.join(__dirname, 'playthrough_result.json'), JSON.stringify(results, null, 2), 'utf8');
    console.log('结果已保存到 tools/playthrough_result.json');
    
} catch (e) {
    console.log('\n=== 测试出错 ===');
    console.log('错误:', e.message);
    console.log('堆栈:', e.stack);
}
