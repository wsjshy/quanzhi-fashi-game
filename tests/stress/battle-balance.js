/**
 * 战斗数值平衡分析脚本
 * 基于玩家成长公式和妖魔数据，估算各等级段战斗体验
 * 运行方式: node tests/stress/battle-balance.js
 */

import fs from 'fs';
import path from 'path';

const gameDir = path.join(__dirname, '..', '..');

// ========== 模拟浏览器环境 ==========
const localStorageMock = {
    getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}
};
const documentMock = {
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, addEventListener: () => {} }),
    getElementById: () => ({ innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }),
    querySelectorAll: () => [],
    head: { appendChild: () => {} },
    body: { appendChild: () => {}, classList: { add: () => {} } },
    addEventListener: () => {}
};
global.window = { localStorage: localStorageMock, document: documentMock, addEventListener: () => {}, location: { search: '' }, confirm: () => true, alert: () => {}, setTimeout: (fn) => fn(), clearTimeout: () => {}, setInterval: () => 1, clearInterval: () => {}, requestAnimationFrame: (fn) => fn(0), innerWidth: 1280, innerHeight: 720 };
global.document = documentMock;
global.localStorage = localStorageMock;
global.console = console;
global.window.console = console;

// ========== 加载数据脚本 ==========
const dataScripts = [
    'engine/data/skills.js', 'engine/data/characters.js', 'engine/data/locations.js',
    'engine/data/items.js', 'engine/data/quests.js', 'engine/data/events.js',
    'engine/data/shops.js', 'engine/data/enemies.js', 'engine/data/demon-traits.js',
    'engine/data/world.js', 'engine/data/big-events.js', 'engine/data/chapters.js',
    'engine/data/talents.js', 'engine/data/spirit-seeds.js', 'engine/data/achievements.js',
    'engine/data/star-dust-artifacts.js', 'engine/data/index.js', 'engine/data.js',
];

for (const script of dataScripts) {
    const filePath = path.join(gameDir, script);
    if (!fs.existsSync(filePath)) continue;
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/^const /gm, 'var ');
    try { eval(code); } catch (e) { /* skip */ }
}

// ========== 玩家成长计算 ==========
function calcPlayerStats(level) {
    // 基础属性 Lv1
    let hp = 120, mp = 60, atk = 15, def = 8, spd = 10, spr = 12, apt = 0;

    for (let lv = 2; lv <= level; lv++) {
        let growth;
        if (lv <= 10) growth = { hp: 12, mp: 6, atk: 2, def: 1, spd: 1, spr: 1, apt: 2 };
        else if (lv <= 30) growth = { hp: 15, mp: 10, atk: 3, def: 2, spd: 1, spr: 2, apt: 3 };
        else if (lv <= 55) growth = { hp: 20, mp: 15, atk: 4, def: 3, spd: 2, spr: 3, apt: 4 };
        else growth = { hp: 25, mp: 20, atk: 5, def: 4, spd: 2, spr: 4, apt: 5 };

        hp += growth.hp; mp += growth.mp; atk += growth.atk;
        def += growth.def; spd += growth.spd; spr += growth.spr; apt += growth.apt;
    }

    // 假设属性点均衡分配：40%攻击, 30%体力(HP), 20%防御, 10%速度
    // 每点攻击+3, 每点体力+15HP, 每点防御+2, 每点速度+1
    const atkPts = Math.floor(apt * 0.4);
    const hpPts = Math.floor(apt * 0.3);
    const defPts = Math.floor(apt * 0.2);
    const spdPts = apt - atkPts - hpPts - defPts;

    atk += atkPts * 3;
    hp += hpPts * 15;
    def += defPts * 2;
    spd += spdPts * 1;

    return { level, maxHp: hp, maxMp: mp, attack: atk, defense: def, speed: spd, spirit: spr, attributePoints: apt };
}

// ========== 伤害估算 ==========
// 简化伤害公式：damage = max(1, baseDamage + attack * 0.5 - defense * 0.3)
// 技能基础伤害取火系初阶 fire_bolt: 25, 普攻: 10
function estimatePlayerDPR(playerStats, skillBaseDmg = 25) {
    const rawDmg = skillBaseDmg + playerStats.attack * 0.5;
    return rawDmg; // 不减去敌人防御，后面单独算
}

function estimateEnemyDPR(enemy) {
    const atk = enemy.attack || 10;
    return atk; // 基础攻击力
}

function analyzeBattle(playerStats, enemy) {
    const playerDmg = Math.max(1, estimatePlayerDPR(playerStats) - (enemy.defense || 0) * 0.3);
    const enemyDmg = Math.max(1, estimateEnemyDPR(enemy) - playerStats.defense * 0.3);

    const enemyHp = enemy.maxHp || enemy.hp || 50;
    const playerHp = playerStats.maxHp;

    const roundsToKillEnemy = Math.ceil(enemyHp / playerDmg);
    const roundsToKillPlayer = Math.ceil(playerHp / enemyDmg);
    const playerHpRemaining = Math.max(0, playerHp - enemyDmg * (roundsToKillEnemy - 1));
    const hpRemainingPct = Math.round((playerHpRemaining / playerHp) * 100);

    // MP消耗估算：每回合8MP(初阶技能)
    const mpCost = 8;
    const mpNeeded = roundsToKillEnemy * mpCost;
    const mpSufficient = playerStats.maxMp >= mpNeeded;

    // 评级
    let rating;
    if (roundsToKillEnemy <= 2) rating = '太简单';
    else if (roundsToKillEnemy <= 4 && hpRemainingPct >= 60) rating = '轻松';
    else if (roundsToKillEnemy <= 6 && hpRemainingPct >= 30) rating = '适中';
    else if (roundsToKillEnemy <= 8 && hpRemainingPct >= 10) rating = '有挑战';
    else if (roundsToKillPlayer <= roundsToKillEnemy) rating = '太难';
    else rating = '艰难';

    return {
        enemyId: enemy.id,
        enemyName: enemy.name,
        enemyLevel: enemy.level || '?',
        enemyHp,
        enemyAtk: enemy.attack || 0,
        enemyDef: enemy.defense || 0,
        playerDmg: Math.round(playerDmg),
        enemyDmg: Math.round(enemyDmg),
        roundsToKill: roundsToKillEnemy,
        playerHpPct: hpRemainingPct,
        mpNeeded,
        mpSufficient,
        rating
    };
}

// ========== 主分析 ==========
console.log('========================================');
console.log('  全职法师 - 战斗数值平衡分析报告');
console.log('========================================\n');

// 玩家各等级属性
console.log('--- 玩家成长曲线（均衡加点）---');
console.log('等级 | HP   | MP  | 攻击 | 防御 | 速度 | 精神');
console.log('-----|------|-----|------|------|------|------');
for (let lv = 1; lv <= 30; lv += 2) {
    const s = calcPlayerStats(lv);
    console.log(`Lv${String(lv).padStart(2)} | ${String(s.maxHp).padStart(4)} | ${String(s.maxMp).padStart(3)} | ${String(s.attack).padStart(4)} | ${String(s.defense).padStart(4)} | ${String(s.speed).padStart(4)} | ${String(s.spirit).padStart(4)}`);
}
console.log('');

// 收集所有妖魔
const allEnemies = [];
if (typeof DataEnemies !== 'undefined') {
    for (const [id, enemy] of Object.entries(DataEnemies)) {
        allEnemies.push({ ...enemy, id });
    }
}

console.log(`--- 妖魔总数: ${allEnemies.length} ---\n`);

// 按等级段分析
const levelRanges = [
    { name: 'Lv1-3 (初期)', min: 1, max: 3 },
    { name: 'Lv4-6 (前期)', min: 4, max: 6 },
    { name: 'Lv7-10 (中期)', min: 7, max: 10 },
    { name: 'Lv11-15 (进阶)', min: 11, max: 15 },
    { name: 'Lv16-20 (高阶)', min: 16, max: 20 },
    { name: 'Lv21-30 (顶级)', min: 21, max: 30 },
];

for (const range of levelRanges) {
    const midLevel = Math.floor((range.min + range.max) / 2);
    const playerStats = calcPlayerStats(midLevel);

    // 筛选该等级段的妖魔
    const rangeEnemies = allEnemies.filter(e => {
        const el = e.level || 1;
        return el >= range.min - 1 && el <= range.max + 2;
    });

    if (rangeEnemies.length === 0) continue;

    console.log(`=== ${range.name} (玩家Lv${midLevel}) ===`);
    console.log(`妖魔名            | 等级 | HP  | 攻击 | 防御 | 回合数 | 剩余HP% | MP够 | 评级`);
    console.log(`------------------|------|-----|------|------|--------|---------|-----|------`);

    const results = rangeEnemies.map(e => analyzeBattle(playerStats, e));
    results.sort((a, b) => (a.enemyLevel || 0) - (b.enemyLevel || 0));

    for (const r of results) {
        const name = (r.enemyName || r.enemyId).padEnd(16);
        const lv = String(r.enemyLevel).padStart(4);
        const hp = String(r.enemyHp).padStart(3);
        const atk = String(r.enemyAtk).padStart(4);
        const def = String(r.enemyDef).padStart(4);
        const rounds = String(r.roundsToKill).padStart(6);
        const hpPct = String(r.playerHpPct).padStart(7);
        const mp = r.mpSufficient ? ' ✓' : ' ✗';
        const rating = r.rating.padStart(4);
        console.log(`${name}| ${lv} | ${hp} | ${atk} | ${def} | ${rounds} | ${hpPct} |${mp} | ${rating}`);
    }

    // 统计
    const tooEasy = results.filter(r => r.rating === '太简单').length;
    const easy = results.filter(r => r.rating === '轻松').length;
    const medium = results.filter(r => r.rating === '适中').length;
    const hard = results.filter(r => r.rating === '有挑战' || r.rating === '艰难').length;
    const tooHard = results.filter(r => r.rating === '太难').length;
    const mpFail = results.filter(r => !r.mpSufficient).length;

    console.log(`统计: 太简单${tooEasy} 轻松${easy} 适中${medium} 有挑战${hard} 太难${tooHard} | MP不足${mpFail}`);
    console.log('');
}

// 问题妖魔汇总
console.log('=== 问题妖魔汇总 ===');
console.log('');

const allResults = [];
for (let lv = 1; lv <= 30; lv++) {
    const ps = calcPlayerStats(lv);
    for (const e of allEnemies) {
        const el = e.level || 1;
        if (Math.abs(el - lv) <= 2) {
            allResults.push({ playerLevel: lv, ...analyzeBattle(ps, e) });
        }
    }
}

const tooHardList = allResults.filter(r => r.rating === '太难' && r.playerLevel >= (r.enemyLevel || 1) - 1);
const tooEasyList = allResults.filter(r => r.rating === '太简单' && r.playerLevel <= (r.enemyLevel || 1));

if (tooHardList.length > 0) {
    console.log('【偏难】玩家等级 >= 妖魔等级-1 但评级为"太难":');
    const seen = new Set();
    for (const r of tooHardList) {
        const key = r.enemyId;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`  ${r.enemyName} (Lv${r.enemyLevel}) - 玩家Lv${r.playerLevel}时: ${r.roundsToKill}回合, 剩余${r.playerHpPct}%HP`);
    }
} else {
    console.log('【偏难】无明显偏难妖魔');
}
console.log('');

if (tooEasyList.length > 0) {
    console.log('【偏易】玩家等级 <= 妖魔等级 但评级为"太简单":');
    const seen = new Set();
    for (const r of tooEasyList) {
        const key = r.enemyId;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`  ${r.enemyName} (Lv${r.enemyLevel}) - 玩家Lv${r.playerLevel}时: ${r.roundsToKill}回合`);
    }
} else {
    console.log('【偏易】无明显偏易妖魔');
}
console.log('');

// MP经济分析
console.log('=== MP经济分析 ===');
for (let lv = 1; lv <= 20; lv += 3) {
    const ps = calcPlayerStats(lv);
    const battlesPerRest = Math.floor(ps.maxMp / 8);
    console.log(`Lv${String(lv).padStart(2)}: MP=${ps.maxMp}, 初阶技能(8MP)可放${battlesPerRest}次, 约${Math.floor(battlesPerRest/3)}场战斗后需恢复`);
}
console.log('');

console.log('========================================');
console.log('  分析完成');
console.log('========================================');
