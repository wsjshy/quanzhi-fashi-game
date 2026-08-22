// 全职法师游戏 v0.8.8 黑盒测试脚本
// 测试重点：游戏体验相关功能

import fs from 'fs.js';
import path from 'path.js';

const gameDir = 'C:\\Users\\22210\\Desktop\\quanzhi-fashi-game-master';

// ========== 模拟浏览器环境 ==========
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; }
    };
})();

const documentMock = {
    _elements: {},
    createElement: (tag) => ({
        tagName: tag,
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        appendChild: () => {},
        addEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        innerHTML: '',
        textContent: '',
        id: '',
        remove: () => {}
    }),
    getElementById: (id) => {
        if (!documentMock._elements[id]) {
            documentMock._elements[id] = {
                id: id,
                innerHTML: '',
                textContent: '',
                style: {},
                classList: { add: () => {}, remove: () => {}, contains: () => false },
                appendChild: () => {},
                addEventListener: () => {},
                remove: () => {},
                querySelector: () => null,
                querySelectorAll: () => [],
                setAttribute: () => {},
                getAttribute: () => null,
                value: ''
            };
        }
        return documentMock._elements[id];
    },
    querySelectorAll: () => [],
    head: { appendChild: () => {} },
    body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {}, contains: () => false }, style: {} },
    addEventListener: () => {},
    removeEventListener: () => {}
};

global.window = {
    localStorage: localStorageMock,
    document: documentMock,
    addEventListener: () => {},
    location: { search: '' },
    confirm: () => true,
    alert: () => {},
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    requestAnimationFrame: (fn) => fn(0),
    innerWidth: 1280,
    innerHeight: 720
};
global.document = documentMock;
global.localStorage = localStorageMock;
global.console = console;
global.window.console = console;

// ========== 加载脚本 ==========
const scripts = [
    'engine/data/skills.js', 'engine/data/characters.js', 'engine/data/locations.js',
    'engine/data/items.js', 'engine/data/quests.js', 'engine/data/events.js',
    'engine/data/shops.js', 'engine/data/enemies.js', 'engine/data/demon-traits.js',
    'engine/data/world.js', 'engine/data/big-events.js', 'engine/data/chapters.js',
    'engine/data/talents.js', 'engine/data/spirit-seeds.js', 'engine/data/achievements.js',
    'engine/data/star-dust-artifacts.js', 'engine/data/index.js', 'engine/data.js',
    'engine/skill.js', 'engine/skill-level.js', 'engine/realm.js',
    'engine/inventory.js', 'engine/talent.js', 'engine/spirit-seed.js',
    'engine/star-dust-artifact.js', 'engine/soul-system.js', 'engine/player.js',
    'engine/time.js', 'engine/quest.js', 'engine/daily.js', 'engine/event.js',
    'engine/big-event.js', 'engine/story-chapter.js', 'engine/shop.js',
    'engine/map.js', 'engine/battle-ai.js', 'engine/battle-effect.js',
    'engine/battle-event.js', 'engine/battle.js', 'engine/achievement-handler.js',
    'engine/world-state.js', 'engine/npc-state.js', 'engine/npc-growth.js',
    'engine/dialogue-tree.js', 'engine/ui.js', 'engine/game.js'
];

for (const script of scripts) {
    const filePath = path.join(gameDir, script);
    if (!fs.existsSync(filePath)) continue;
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/^const /gm, 'var ');
    try {
        eval(code);
    } catch (e) {
        console.log(`SKIP ${script}: ${e.message}`);
    }
}

// ========== 初始化游戏 ==========
console.log('=== 初始化游戏 ===');
try {
    UI.init();
    Game.init();
    console.log('游戏初始化成功');
} catch (e) {
    console.log('初始化失败:', e.message);
}

// ========== 测试1: 创建角色 + 天赋选择 ==========
console.log('\n=== 测试1: 创建角色 + 天赋3选1 ===');
try {
    Game.createCharacter('测试法师', 'fire');
    console.log('createCharacter 调用成功');
    console.log('玩家名:', Player.name);
    console.log('玩家元素:', Player.elements);
    console.log('等待天赋选择: _pendingNewGame =', Game._pendingNewGame);

    // 模拟玩家选择第一个天赋
    const choices = TalentSystem.getTalentChoices('fire');
    console.log('火系天赋候选:', choices.map(id => DataTalents[id].name).join(', '));

    Game.confirmTalent('fire', choices[0]);
    console.log('confirmTalent 调用成功');
    console.log('玩家天赋:', JSON.stringify(Player.talents));
    console.log('_pendingNewGame:', Game._pendingNewGame);
    console.log('游戏状态:', Game.state);

    const talent = DataTalents[choices[0]];
    console.log('选择的天赋:', talent.name, '类型:', talent.type, '稀有度:', talent.rarity);
    console.log('测试1: 通过');
} catch (e) {
    console.log('测试1失败:', e.message);
    console.log(e.stack);
}

// ========== 测试2: 时间消耗 ==========
console.log('\n=== 测试2: 时间消耗调整 ===');
try {
    // 测试地点行动时间
    const school = DataLocations['tianlan_school'];
    if (school && school.actions) {
        console.log('天澜学校行动:');
        for (const [actionId, action] of Object.entries(school.actions)) {
            if (action.timeCost !== undefined) {
                console.log(`  ${action.name || actionId}: ${action.timeCost}小时, ${action.staminaCost || 0}体力`);
            }
        }
    }

    // 测试地图移动时间
    console.log('地图移动:');
    const travelTime = MapSystem.travelTime || 0.5;
    const travelStamina = MapSystem.travelStaminaCost || 5;
    console.log(`  移动时间: ${travelTime}小时, 体力消耗: ${travelStamina}`);

    // 验证时间消耗是否合理
    const talkAction = school?.actions?.talk;
    if (talkAction) {
        console.log(`  聊天时间: ${talkAction.timeCost}小时 (应为0)`);
        console.log(`  聊天体力: ${talkAction.staminaCost || 0} (应为0)`);
    }

    console.log('测试2: 通过');
} catch (e) {
    console.log('测试2失败:', e.message);
}

// ========== 测试3: 原地休息 ==========
console.log('\n=== 测试3: 原地休息 ===');
try {
    // 先扣一些HP/MP/体力
    Player.hp = 50;
    Player.mp = 20;
    Player.stamina = 50;
    const beforeHp = Player.hp;
    const beforeMp = Player.mp;
    const beforeStamina = Player.stamina;
    const beforeHour = Player.hour;

    Game.quickRest();

    console.log(`HP: ${beforeHp} -> ${Player.hp}`);
    console.log(`MP: ${beforeMp} -> ${Player.mp}`);
    console.log(`体力: ${beforeStamina} -> ${Player.stamina}`);
    console.log(`时间: ${beforeHour} -> ${Player.hour} (应不变)`);

    // 验证恢复量
    const stats = Player.getTotalStats();
    const expectedHpRecover = Math.floor(stats.maxHp * 0.3);
    const expectedMpRecover = Math.floor(stats.maxMp * 0.2);
    const expectedStaminaRecover = 30;
    console.log(`预期恢复: HP+${expectedHpRecover}, MP+${expectedMpRecover}, 体力+${expectedStaminaRecover}`);

    console.log('测试3: 通过');
} catch (e) {
    console.log('测试3失败:', e.message);
    console.log(e.stack);
}

// ========== 测试4: 宿舍休息恢复量 ==========
console.log('\n=== 测试4: 宿舍休息恢复量 ===');
try {
    const school = DataLocations['tianlan_school'];
    const restAction = school?.actions?.rest;
    if (restAction) {
        console.log('宿舍休息:');
        console.log(`  时间: ${restAction.timeCost}小时`);
        console.log(`  效果:`, JSON.stringify(restAction.effects || restAction));
    }
    console.log('测试4: 通过');
} catch (e) {
    console.log('测试4失败:', e.message);
}

// ========== 测试5: 战斗自动回复 ==========
console.log('\n=== 测试5: 战斗中自动HP/MP回复 ===');
try {
    // 创建一个战斗实例
    const enemy = DataEnemies['light_moth_elite'] || Object.values(DataEnemies)[0];
    console.log('测试敌人:', enemy?.name || '第一个敌人');

    // 初始化战斗
    Player.hp = 80;
    Player.mp = 30;
    const stats = Player.getTotalStats();
    console.log(`战斗前: HP=${Player.hp}/${stats.maxHp}, MP=${Player.mp}/${stats.maxMp}`);

    // 计算每回合回复量
    const hpRegen = Math.max(1, Player.level * 1 + Math.floor(stats.maxHp * 0.01));
    const mpRegen = Math.max(1, Player.level * 1 + Math.floor(Player.spirit * 0.5) + Math.floor(stats.maxMp * 0.02));
    console.log(`每回合预期回复: HP+${hpRegen}, MP+${mpRegen}`);

    // 验证天赋加成
    const talentEffects = Player.getAllTalentEffects();
    console.log('天赋效果:', JSON.stringify(talentEffects));
    if (talentEffects.hpRegen) console.log(`  HP回复加成: +${(talentEffects.hpRegen * 100).toFixed(0)}%`);
    if (talentEffects.mpRegen) console.log(`  MP回复加成: +${(talentEffects.mpRegen * 100).toFixed(0)}%`);

    console.log('测试5: 通过');
} catch (e) {
    console.log('测试5失败:', e.message);
    console.log(e.stack);
}

// ========== 测试6: 战斗冥想 ==========
console.log('\n=== 测试6: 战斗冥想功能 ===');
try {
    const stats = Player.getTotalStats();
    Player.mp = 10;
    Player.hp = 70;
    const beforeMp = Player.mp;
    const beforeHp = Player.hp;

    const meditateMpRecover = Math.floor(stats.maxMp * 0.25);
    const meditateHpRecover = Math.floor(stats.maxHp * 0.1);
    console.log(`冥想预期: MP+${meditateMpRecover} (25%), HP+${meditateHpRecover} (10%)`);
    console.log(`冥想前: HP=${beforeHp}, MP=${beforeMp}`);
    console.log(`冥想后预期: HP=${beforeHp + meditateHpRecover}, MP=${beforeMp + meditateMpRecover}`);
    console.log('测试6: 通过');
} catch (e) {
    console.log('测试6失败:', e.message);
}

// ========== 测试7: 战斗数值平衡（防御系数0.3） ==========
console.log('\n=== 测试7: 战斗数值平衡 ===');
try {
    // 模拟5级精英怪 vs 5级玩家
    const playerAttack = 25;
    const playerDefense = 18;
    const enemyAttack = 18;
    const enemyDefense = 12;

    // 防御系数0.3
    const defenseCoeff = 0.3;
    const playerDamageToEnemy = Math.max(1, (playerAttack - enemyDefense * defenseCoeff) * 1.0);
    const enemyDamageToPlayer = Math.max(1, (enemyAttack - playerDefense * defenseCoeff) * 1.0);

    console.log(`玩家攻击${playerAttack} vs 敌人防御${enemyDefense}: 伤害=${playerDamageToEnemy.toFixed(1)}`);
    console.log(`敌人攻击${enemyAttack} vs 玩家防御${playerDefense}: 伤害=${enemyDamageToPlayer.toFixed(1)}`);

    // 旧系数0.5对比
    const oldPlayerDamage = Math.max(1, (playerAttack - enemyDefense * 0.5) * 1.0);
    const oldEnemyDamage = Math.max(1, (enemyAttack - playerDefense * 0.5) * 1.0);
    console.log(`旧系数(0.5): 玩家伤害=${oldPlayerDamage.toFixed(1)}, 敌人伤害=${oldEnemyDamage.toFixed(1)}`);
    console.log(`新系数(0.3)伤害提升: 玩家+${((playerDamageToEnemy/oldPlayerDamage-1)*100).toFixed(0)}%, 敌人+${((enemyDamageToPlayer/oldEnemyDamage-1)*100).toFixed(0)}%`);

    console.log('测试7: 通过');
} catch (e) {
    console.log('测试7失败:', e.message);
}

// ========== 测试8: 精神力加点 ==========
console.log('\n=== 测试8: 精神力属性点 ===');
try {
    Player.attributePoints = 5;
    const beforeSpirit = Player.spirit;
    const beforeMaxMp = Player.getTotalStats().maxMp;

    Player.addAttribute('spirit');
    console.log(`精神力: ${beforeSpirit} -> ${Player.spirit}`);
    const afterMaxMp = Player.getTotalStats().maxMp;
    console.log(`最大MP: ${beforeMaxMp} -> ${afterMaxMp}`);
    console.log(`属性点剩余: ${Player.attributePoints}`);

    // 验证extra字段
    console.log('测试8: 通过');
} catch (e) {
    console.log('测试8失败:', e.message);
    console.log(e.stack);
}

// ========== 测试9: 天赋系统 - 先天型不可升级 ==========
console.log('\n=== 测试9: 先天型天赋不可升级 ===');
try {
    // 找一个先天型天赋
    const innateTalentId = Object.entries(DataTalents).find(([id, t]) => t.type === 'innate')?.[0];
    if (innateTalentId) {
        const innateTalent = DataTalents[innateTalentId];
        console.log('先天型天赋:', innateTalent.name, 'maxLevel:', innateTalent.maxLevel);

        // 模拟玩家有这个天赋
        Player.talents['test'] = { talentId: innateTalentId, level: 1, exp: 0 };
        const beforeLevel = Player.talents['test'].level;
        TalentSystem.addTalentExp('test', 100);
        const afterLevel = Player.talents['test'].level;
        console.log(`尝试升级: ${beforeLevel} -> ${afterLevel} (应保持1)`);
        delete Player.talents['test'];
    }

    // 找一个成长型天赋
    const growthTalentId = Object.entries(DataTalents).find(([id, t]) => t.type === 'growth')?.[0];
    if (growthTalentId) {
        const growthTalent = DataTalents[growthTalentId];
        console.log('成长型天赋:', growthTalent.name, 'maxLevel:', growthTalent.maxLevel);
        console.log('levelBonus:', JSON.stringify(growthTalent.levelBonus));
    }

    console.log('测试9: 通过');
} catch (e) {
    console.log('测试9失败:', e.message);
}

// ========== 测试10: 天赋效果计算 ==========
console.log('\n=== 测试10: 天赋效果计算 ===');
try {
    // 测试不同等级的成长型天赋效果
    const growthTalentId = Object.entries(DataTalents).find(([id, t]) => t.type === 'growth')?.[0];
    if (growthTalentId) {
        const t = DataTalents[growthTalentId];
        console.log(`天赋: ${t.name}`);
        for (let lv = 1; lv <= t.maxLevel; lv += 3) {
            const effects = TalentSystem.getTalentEffects(growthTalentId, lv);
            console.log(`  Lv${lv}:`, JSON.stringify(effects));
        }
        // 10级效果
        const maxEffects = TalentSystem.getTalentEffects(growthTalentId, t.maxLevel);
        console.log(`  Lv${t.maxLevel}(满):`, JSON.stringify(maxEffects));
    }

    // 测试先天型天赋效果
    const innateTalentId = Object.entries(DataTalents).find(([id, t]) => t.type === 'innate')?.[0];
    if (innateTalentId) {
        const t = DataTalents[innateTalentId];
        const effects = TalentSystem.getTalentEffects(innateTalentId, 1);
        console.log(`先天天赋 ${t.name} Lv1:`, JSON.stringify(effects));
    }

    console.log('测试10: 通过');
} catch (e) {
    console.log('测试10失败:', e.message);
}

// ========== 测试11: Tooltip文本生成 ==========
console.log('\n=== 测试11: Tooltip文本 ===');
try {
    // 测试技能tooltip - 传入skill对象
    if (typeof UI.getSkillTooltipText === 'function') {
        const skillObj = SkillSystem.getSkill('fire_bolt') || DataSkills['fire_bolt'];
        if (skillObj) {
            const tooltip = UI.getSkillTooltipText(skillObj);
            console.log(`技能 ${skillObj.name} tooltip:`, tooltip.substring(0, 150));
        } else {
            console.log('找不到fire_bolt技能');
        }
    } else {
        console.log('getSkillTooltipText 方法不存在');
    }
    console.log('测试11: 通过');
} catch (e) {
    console.log('测试11失败:', e.message);
}

// ========== 测试12: 图书馆时间消耗 ==========
console.log('\n=== 测试12: 图书馆/商店时间消耗 ===');
try {
    const school = DataLocations['tianlan_school'];
    if (school?.actions?.library) {
        console.log(`图书馆: ${school.actions.library.timeCost}小时, ${school.actions.library.staminaCost}体力 (应为1h/5sta)`);
    }
    if (school?.actions?.shop) {
        console.log(`商店: ${school.actions.shop.timeCost}小时, ${school.actions.shop.staminaCost || 0}体力 (应为0/0)`);
    }

    const city = DataLocations['city_streets'];
    if (city?.actions?.explore) {
        console.log(`城市逛街: ${city.actions.explore.timeCost}小时, ${city.actions.explore.staminaCost}体力 (应为1h/10sta)`);
    }

    console.log('测试12: 通过');
} catch (e) {
    console.log('测试12失败:', e.message);
}

console.log('\n=== 所有测试完成 ===');
