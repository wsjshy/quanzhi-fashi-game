/**
 * 战斗系统压力测试 - 快速复现卡死bug
 * 运行方式: node tests/stress/battle-stress.js
 */

// ========== 模拟全局环境 ==========
global.SkillSystem = {
    getSkill: (id) => {
        const skills = {
            basic_attack: {
                id: "basic_attack", name: "普攻", description: "普通攻击",
                element: "neutral", type: "damage", mpCost: 0,
                baseDamage: 10, hitRate: 0.95, critRate: 0.05,
                targetType: "enemy", tier: "初阶"
            },
            fire_bolt: {
                id: "fire_bolt", name: "火滋·爆裂", description: "初阶火系魔法",
                element: "fire", type: "damage", mpCost: 8,
                baseDamage: 25, hitRate: 0.9, critRate: 0.1,
                targetType: "enemy", tier: "初阶",
                statusEffects: [{ type: "burn", name: "燃烧", duration: 3, dotDamage: 5, stacks: 1, maxStacks: 3, chance: 0.5 }]
            },
            ice_spike: {
                id: "ice_spike", name: "冰蔓·冰刺", description: "初阶冰系魔法",
                element: "ice", type: "damage", mpCost: 8,
                baseDamage: 20, hitRate: 0.9, critRate: 0.05,
                targetType: "enemy", tier: "初阶",
                statusEffects: [{ type: "freeze", name: "冻结值", duration: 3, value: 30, chance: 0.6 }]
            },
            thunder_bolt: {
                id: "thunder_bolt", name: "雷印·蟒痕", description: "初阶雷系魔法",
                element: "thunder", type: "damage", mpCost: 10,
                baseDamage: 22, hitRate: 0.85, critRate: 0.2,
                targetType: "enemy", tier: "初阶",
                statusEffects: [{ type: "paralysis", name: "麻痹", duration: 1, chance: 0.3, element: "thunder" }]
            },
            water_heal: {
                id: "water_heal", name: "水系·治愈", description: "初阶水系治疗",
                element: "water", type: "heal", mpCost: 10,
                baseHeal: 30, hitRate: 1, critRate: 0,
                targetType: "self", tier: "初阶"
            },
            water_chain: {
                id: "water_chain", name: "水系·水链", description: "初阶水系束缚",
                element: "water", type: "damage", mpCost: 8,
                baseDamage: 12, hitRate: 0.85, critRate: 0.05,
                targetType: "enemy", tier: "初阶",
                statusEffects: [{ type: "wet", name: "湿润", duration: 3, chance: 0.7 }]
            },
            earth_spike: {
                id: "earth_spike", name: "土系·地刺", description: "初阶土系魔法",
                element: "earth", type: "damage", mpCost: 8,
                baseDamage: 18, hitRate: 0.9, critRate: 0.05,
                targetType: "enemy", tier: "初阶",
                statusEffects: [{ type: "slow", name: "减速", duration: 2, speedMod: -0.3, chance: 0.5 }]
            },
            wind_blade: {
                id: "wind_blade", name: "风系·风刃", description: "初阶风系魔法",
                element: "wind", type: "damage", mpCost: 7,
                baseDamage: 15, hitRate: 0.95, critRate: 0.15,
                targetType: "enemy", tier: "初阶"
            },
            dark_bolt: {
                id: "dark_bolt", name: "暗影·暗箭", description: "初阶暗影魔法",
                element: "dark", type: "damage", mpCost: 8,
                baseDamage: 20, hitRate: 0.85, critRate: 0.1,
                targetType: "enemy", tier: "初阶",
                statusEffects: [{ type: "curse", name: "诅咒", duration: 3, attackMod: -0.2, chance: 0.4 }]
            },
            earth_shield: {
                id: "earth_shield", name: "土系·岩盾", description: "土系护盾",
                element: "earth", type: "buff", mpCost: 12,
                targetType: "self", tier: "初阶",
                statusEffects: [{ type: "shield", name: "岩盾", duration: 99, value: 50 }]
            },
            ice_shield: {
                id: "ice_shield", name: "冰系·冰铠", description: "冰系护盾",
                element: "ice", type: "buff", mpCost: 12,
                targetType: "self", tier: "初阶",
                statusEffects: [{ type: "shield", name: "冰铠", duration: 99, value: 40, defenseMod: 0.2 }]
            },
            wind_speed: {
                id: "wind_speed", name: "风系·风轨", description: "风系加速",
                element: "wind", type: "buff", mpCost: 10,
                targetType: "self", tier: "初阶",
                statusEffects: [{ type: "speed_up", name: "风轨", duration: 3, speedMod: 0.5 }]
            },
            ice_freeze: {
                id: "ice_freeze", name: "冰系·冻结", description: "冰系冻结",
                element: "ice", type: "damage", mpCost: 15,
                baseDamage: 10, hitRate: 0.7, critRate: 0,
                targetType: "enemy", tier: "中阶",
                statusEffects: [{ type: "freeze", name: "冻结值", duration: 3, value: 80, chance: 1 }]
            },
        };
        return skills[id] || null;
    },
    getElementColor: (elem) => {
        const colors = { fire: '#ff6644', ice: '#66aaff', thunder: '#ffdd44', earth: '#aa8844', wind: '#88ffcc', water: '#66bbff', light: '#ffffcc', dark: '#aa66ff', heal: '#66ffaa', summon: '#ff9966', neutral: '#999' };
        return colors[elem] || '#fff';
    },
    getElementName: (elem) => {
        const names = { fire: '火', ice: '冰', thunder: '雷', earth: '土', wind: '风', water: '水', light: '光', dark: '暗', heal: '治愈', summon: '召唤', neutral: '无' };
        return names[elem] || elem;
    }
};

global.Inventory = {
    useItem: () => ({ success: false, message: '测试模式' }),
    getItem: () => null
};

global.Player = {
    name: '测试玩家',
    level: 5,
    exp: 0,
    gold: 100,
    elements: ['fire', 'ice'],
    skills: ['fire_bolt', 'ice_spike', 'thunder_bolt', 'water_heal'],
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 15,
    defense: 5,
    speed: 12,
    spirit: 10,
    statusEffects: [],
    isDefending: false,
    getTotalStats() {
        return {
            maxHp: this.maxHp,
            maxMp: this.maxMp,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            critRate: 0.05,
            hitRate: 0.95
        };
    },
    gainExp: (amt) => { Player.exp += amt; },
    gainGold: (amt) => { Player.gold += amt; },
    save: () => {}
};

global.DataManager = {
    getEnemy: (id) => {
        const enemies = {
            test_enemy: {
                id: "test_enemy",
                name: "测试妖魔",
                elements: ["dark"],
                level: 5,
                maxHp: 200,
                maxMp: 60,
                attack: 18,
                defense: 6,
                speed: 14,
                skills: ["basic_attack", "dark_bolt", "fire_bolt", "water_chain"],
                spriteColor: "#553322",
                isEnemy: true,
                expReward: 100,
                goldReward: 50,
                dropItems: []
            },
            stun_enemy: {
                id: "stun_enemy",
                name: "雷系妖魔",
                elements: ["thunder"],
                level: 5,
                maxHp: 150,
                maxMp: 80,
                attack: 15,
                defense: 5,
                speed: 16,
                skills: ["basic_attack", "thunder_bolt"],
                spriteColor: "#9966ff",
                isEnemy: true,
                expReward: 100,
                goldReward: 50,
                dropItems: []
            },
            freeze_enemy: {
                id: "freeze_enemy",
                name: "冰系妖魔",
                elements: ["ice"],
                level: 5,
                maxHp: 180,
                maxMp: 80,
                attack: 14,
                defense: 8,
                speed: 10,
                skills: ["basic_attack", "ice_spike", "ice_freeze"],
                spriteColor: "#99ddff",
                isEnemy: true,
                expReward: 100,
                goldReward: 50,
                dropItems: []
            },
            burn_enemy: {
                id: "burn_enemy",
                name: "火系妖魔",
                elements: ["fire"],
                level: 5,
                maxHp: 160,
                maxMp: 70,
                attack: 20,
                defense: 4,
                speed: 15,
                skills: ["basic_attack", "fire_bolt"],
                spriteColor: "#ff6633",
                isEnemy: true,
                expReward: 100,
                goldReward: 50,
                dropItems: []
            },
            combo_enemy: {
                id: "combo_enemy",
                name: "元素混合妖魔",
                elements: ["water", "thunder"],
                level: 6,
                maxHp: 250,
                maxMp: 100,
                attack: 18,
                defense: 7,
                speed: 13,
                skills: ["basic_attack", "water_chain", "thunder_bolt", "fire_bolt"],
                spriteColor: "#66aaff",
                isEnemy: true,
                expReward: 150,
                goldReward: 80,
                dropItems: []
            }
        };
        return enemies[id] || enemies.test_enemy;
    }
};

// ========== 加载战斗系统 ==========
import fs from 'fs';
import path from 'path';
const gameDir = path.join(__dirname, '..', '..');
let battleCode = fs.readFileSync(path.join(gameDir, 'src', 'engine', 'battle.js'), 'utf8');

// 在文件末尾添加导出语句，让BattleSystem可以被外部访问
battleCode += '\n;export default BattleSystem;';

// 写入临时文件并require
const tmpFile = path.join(__dirname, '_tmp_battle_test.js');
fs.writeFileSync(tmpFile, battleCode);
const BattleSystem = require(tmpFile);
// 清理临时文件
try { fs.unlinkSync(tmpFile); } catch(e) {}

// ========== 测试工具函数 ==========
let totalBattles = 0;
let totalTurns = 0;
let stuckBattles = 0;
let errors = [];

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function runBattle(enemyId, maxTurns = 50, playerSkills = null, debug = false) {
    totalBattles++;
    
    // 重置玩家状态
    Player.hp = Player.maxHp;
    Player.mp = Player.maxMp;
    Player.statusEffects = [];
    Player.isDefending = false;
    if (playerSkills) {
        Player.skills = playerSkills;
    }
    
    const enemy = deepClone(DataManager.getEnemy(enemyId));
    enemy.hp = enemy.maxHp;
    enemy.mp = enemy.maxMp;
    enemy.statusEffects = [];
    
    BattleSystem.startBattle(enemy);
    
    let turnCount = 0;
    let lastLogLength = 0;
    let stuckCounter = 0;
    let lastIsPlayerTurn = null;
    let sameTurnStateCounter = 0;
    let debugInfo = null;
    
    // 模拟战斗循环
    while (BattleSystem.active && turnCount < maxTurns) {
        turnCount++;
        totalTurns++;
        
        // 检查是否卡死（日志没有新增）
        if (BattleSystem.log.length === lastLogLength) {
            stuckCounter++;
            if (stuckCounter > 5) {
                if (debug) {
                    console.log(`  [调试] 检测到卡死，回合: ${turnCount}`);
                    console.log(`    isPlayerTurn: ${BattleSystem.isPlayerTurn}`);
                    console.log(`    playerHp: ${BattleSystem.player.hp}/${BattleSystem.player.maxHp}`);
                    console.log(`    enemyHp: ${BattleSystem.enemy.hp}/${BattleSystem.enemy.maxHp}`);
                    console.log(`    playerMp: ${BattleSystem.player.mp}/${BattleSystem.player.maxMp}`);
                    console.log(`    enemyMp: ${BattleSystem.enemy.mp}/${BattleSystem.enemy.maxMp}`);
                    console.log(`    playerEffects: ${JSON.stringify(BattleSystem.player.statusEffects)}`);
                    console.log(`    enemyEffects: ${JSON.stringify(BattleSystem.enemy.statusEffects)}`);
                    console.log(`    playerCasting: ${BattleSystem.playerCasting ? BattleSystem.playerCasting.skill.name + '(' + BattleSystem.playerCasting.progress + '/' + BattleSystem.playerCasting.totalTime + ')' : '无'}`);
                    console.log(`    enemyCasting: ${BattleSystem.enemyCasting ? BattleSystem.enemyCasting.skill.name + '(' + BattleSystem.enemyCasting.progress + '/' + BattleSystem.enemyCasting.totalTime + ')' : '无'}`);
                    console.log(`    summon: ${BattleSystem.summon ? BattleSystem.summon.name + '(' + BattleSystem.summon.hp + 'hp)' : '无'}`);
                    console.log(`    最后5条日志:`);
                    BattleSystem.log.slice(-5).forEach((l, i) => console.log(`      ${i+1}. [${l.type}] ${l.text}`));
                }
                
                stuckBattles++;
                debugInfo = {
                    enemy: enemyId,
                    turn: turnCount,
                    reason: '日志无新增，疑似卡死',
                    playerHp: BattleSystem.player.hp,
                    playerMaxHp: BattleSystem.player.maxHp,
                    enemyHp: BattleSystem.enemy.hp,
                    enemyMaxHp: BattleSystem.enemy.maxHp,
                    playerMp: BattleSystem.player.mp,
                    enemyMp: BattleSystem.enemy.mp,
                    isPlayerTurn: BattleSystem.isPlayerTurn,
                    playerEffects: BattleSystem.player.statusEffects.map(e => `${e.type}(${e.duration})${e.value ? ':' + e.value : ''}${e.stacks ? 'x' + e.stacks : ''}`),
                    enemyEffects: BattleSystem.enemy.statusEffects.map(e => `${e.type}(${e.duration})${e.value ? ':' + e.value : ''}${e.stacks ? 'x' + e.stacks : ''}`),
                    playerCasting: BattleSystem.playerCasting ? `${BattleSystem.playerCasting.skill.name}(${BattleSystem.playerCasting.progress}/${BattleSystem.playerCasting.totalTime})` : null,
                    enemyCasting: BattleSystem.enemyCasting ? `${BattleSystem.enemyCasting.skill.name}(${BattleSystem.enemyCasting.progress}/${BattleSystem.enemyCasting.totalTime})` : null,
                    summon: BattleSystem.summon ? `${BattleSystem.summon.name}(${BattleSystem.summon.hp}hp)` : null,
                    lastLogs: BattleSystem.log.slice(-10).map(l => l.text)
                };
                errors.push(debugInfo);
                break;
            }
        } else {
            stuckCounter = 0;
            lastLogLength = BattleSystem.log.length;
        }
        
        // 检查回合状态是否一直不变（更精确的卡死检测）
        if (lastIsPlayerTurn !== null && lastIsPlayerTurn === BattleSystem.isPlayerTurn) {
            sameTurnStateCounter++;
            if (sameTurnStateCounter > 10) {
                console.log(`  [警告] 回合状态连续${sameTurnStateCounter}次不变，isPlayerTurn=${BattleSystem.isPlayerTurn}`);
            }
        } else {
            sameTurnStateCounter = 0;
            lastIsPlayerTurn = BattleSystem.isPlayerTurn;
        }
        
        // 玩家回合
        if (BattleSystem.isPlayerTurn) {
            // 简单AI：优先用技能，没MP就普攻
            let usedSkill = false;
            for (const skillId of Player.skills) {
                const skill = SkillSystem.getSkill(skillId);
                if (skill && BattleSystem.player.mp >= skill.mpCost) {
                    try {
                        BattleSystem.playerCastSkill(skillId);
                        usedSkill = true;
                        break;
                    } catch (e) {
                        errors.push({ enemy: enemyId, turn: turnCount, phase: 'player_skill', error: e.message, stack: e.stack });
                        if (debug) console.log(`  [错误] 玩家技能释放错误: ${e.message}`);
                    }
                }
            }
            if (!usedSkill) {
                try {
                    BattleSystem.playerAttack();
                } catch (e) {
                    errors.push({ enemy: enemyId, turn: turnCount, phase: 'player_attack', error: e.message, stack: e.stack });
                    if (debug) console.log(`  [错误] 玩家普攻错误: ${e.message}`);
                }
            }
        } 
        // 敌人回合
        else {
            try {
                // 直接调用enemyTurn（跳过setTimeout）
                BattleSystem.enemyTurn();
            } catch (e) {
                errors.push({ enemy: enemyId, turn: turnCount, phase: 'enemy_turn', error: e.message, stack: e.stack });
                if (debug) console.log(`  [错误] 敌人回合错误: ${e.message}`);
            }
        }
        
        // 检查战斗状态
        if (!BattleSystem.active) break;
    }
    
    if (turnCount >= maxTurns) {
        if (debug) console.log(`  [警告] 战斗超过 ${maxTurns} 回合未结束`);
        stuckBattles++;
        errors.push({
            enemy: enemyId,
            turn: turnCount,
            reason: '超过最大回合数',
            playerHp: BattleSystem.player.hp,
            enemyHp: BattleSystem.enemy.hp,
            isPlayerTurn: BattleSystem.isPlayerTurn
        });
    }
    
    return {
        turns: turnCount,
        result: BattleSystem.result,
        playerHp: BattleSystem.player.hp,
        enemyHp: BattleSystem.enemy.hp,
        stuck: stuckCounter > 5
    };
}

// ========== 运行测试 ==========
console.log('========================================');
console.log('  战斗系统压力测试 - 卡死bug复现');
console.log('========================================\n');

const testCases = [
    { name: '普通战斗', enemy: 'test_enemy', count: 20 },
    { name: '雷系/麻痹战斗', enemy: 'stun_enemy', count: 30 },
    { name: '冰系/冻结战斗', enemy: 'freeze_enemy', count: 30 },
    { name: '火系/燃烧战斗', enemy: 'burn_enemy', count: 20 },
    { name: '元素混合/感电战斗', enemy: 'combo_enemy', count: 50 },
];

for (const testCase of testCases) {
    console.log(`\n--- 测试: ${testCase.name} (${testCase.count}场) ---`);
    
    for (let i = 0; i < testCase.count; i++) {
        const result = runBattle(testCase.enemy, 100);
        if (i % 10 === 9) {
            console.log(`  已完成 ${i + 1} 场, 总回合数: ${totalTurns}`);
        }
    }
}

// ========== 测试特定场景 ==========
console.log('\n--- 测试特定卡死场景 ---');

// 场景1: 玩家被持续眩晕
console.log('\n场景1: 玩家被持续眩晕');
for (let i = 0; i < 20; i++) {
    runBattle('stun_enemy', 50, ['fire_bolt']); // 玩家只有火系，MP很快用完
}

// 场景2: 双方都有护盾
console.log('\n场景2: 双方都有护盾/治疗（详细调试第1场）');
const debugResult = runBattle('freeze_enemy', 100, ['earth_shield', 'ice_shield', 'water_heal', 'ice_spike'], true);
console.log(`\n调试战斗结果: ${debugResult.stuck ? '卡死' : '正常'}, 回合数: ${debugResult.turns}`);

// 运行更多场统计
console.log('\n场景2: 双方都有护盾/治疗（统计）');
for (let i = 0; i < 20; i++) {
    runBattle('freeze_enemy', 100, ['earth_shield', 'ice_shield', 'water_heal', 'ice_spike']);
}

// 场景3: 元素反应连锁
console.log('\n场景3: 元素反应连锁（水+雷=感电）');
for (let i = 0; i < 30; i++) {
    runBattle('combo_enemy', 80, ['water_chain', 'thunder_bolt', 'fire_bolt']);
}

// 场景4: 纯治疗+护盾（完全不攻击，看会不会卡死）
console.log('\n场景4: 纯治疗+护盾（玩家只治疗和加盾）');
for (let i = 0; i < 10; i++) {
    runBattle('freeze_enemy', 80, ['earth_shield', 'water_heal']);
}

// 场景5: 冻结值累积测试
console.log('\n场景5: 冻结值累积测试');
for (let i = 0; i < 20; i++) {
    runBattle('freeze_enemy', 60, ['ice_spike', 'ice_freeze']);
}

// ========== 输出结果 ==========
console.log('\n========================================');
console.log('  测试结果汇总');
console.log('========================================');
console.log(`总战斗数: ${totalBattles}`);
console.log(`总回合数: ${totalTurns}`);
console.log(`疑似卡死战斗数: ${stuckBattles}`);
console.log(`错误数: ${errors.length}`);

if (errors.length > 0) {
    console.log('\n--- 错误详情 ---');
    errors.slice(0, 10).forEach((err, i) => {
        console.log(`\n错误 ${i + 1}:`);
        console.log(`  敌人: ${err.enemy}`);
        console.log(`  回合: ${err.turn}`);
        console.log(`  阶段: ${err.phase || err.reason}`);
        if (err.error) console.log(`  错误信息: ${err.error}`);
        if (err.playerHp !== undefined) {
            console.log(`  玩家HP: ${err.playerHp}`);
            console.log(`  敌人HP: ${err.enemyHp}`);
            console.log(`  玩家回合: ${err.isPlayerTurn}`);
            console.log(`  玩家状态: ${err.playerEffects?.join(', ') || '无'}`);
            console.log(`  敌人状态: ${err.enemyEffects?.join(', ') || '无'}`);
            console.log(`  玩家引导: ${err.playerCasting || '无'}`);
            console.log(`  敌人引导: ${err.enemyCasting || '无'}`);
        }
        if (err.lastLogs) {
            console.log('  最后日志:');
            err.lastLogs.forEach((log, j) => console.log(`    ${j + 1}. ${log}`));
        }
    });
}

console.log('\n测试完成！');
