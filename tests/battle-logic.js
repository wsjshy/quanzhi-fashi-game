/**
 * L2 战斗逻辑单元测试
 * 
 * 纯函数测试，不需要浏览器
 * 覆盖：元素克制、伤害计算、状态效果
 * 
 * 运行：node tests/battle-logic.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { TestResult } = require('./utils');

function loadBattleSystem() {
    const battleCode = fs.readFileSync(path.join(__dirname, '..', 'engine', 'battle.js'), 'utf-8');
    // 替换const为var，使其在沙箱中可访问
    const code = battleCode.replace(/^const\s+BattleSystem\s*=/m, 'var BattleSystem =');
    
    const sandbox = {
        console: console,
        Math: Math,
        Date: Date,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        // 模拟依赖的全局对象
        Player: {
            level: 1,
            spirit: 30,
            mp: 100,
            maxMp: 100,
            hp: 100,
            maxHp: 100,
            attack: 20,
            defense: 10,
            speed: 10,
            skills: ['basic_attack'],
            talentEffects: {},
            statusEffects: [],
            getElementLevel: () => 1,
            getStaminaEfficiency: () => ({ battleDamage: 1.0 }),
            getElementTalentEffects: () => ({}),
            getElementSpiritSeedEffects: () => ({}),
            getSkillDamageBonus: () => 1.0,
            getAllTalentEffects: () => ({}),
            recordKill: () => {},
        },
        SkillSystem: {
            getSkill: (id) => ({ id, name: id, type: 'damage', element: 'fire', mpCost: 10, tier: '初阶', description: '' })
        },
        Inventory: { getAllItems: () => [] },
        DailySystem: { trackActivity: () => {} },
        UI: { updateBattleScreen: () => {}, showMessage: () => {}, renderBattleScreen: () => {}, playHitAnimation: () => {} },
        Game: { endBattle: () => {} },
        TalentSystem: {},
        SpiritSeedSystem: {},
        SkillLevelSystem: {},
        BattleEventBus: { emit: () => {} },
        BattleEvents: {},
    };
    
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox.BattleSystem;
}

function runBattleLogicTests() {
    console.log('\n⚔️  L2 战斗逻辑单元测试');
    console.log('─'.repeat(60));
    
    const result = new TestResult();
    const BattleSystem = loadBattleSystem();
    
    if (!BattleSystem) {
        result.fail('无法加载BattleSystem');
        return result.report();
    }
    
    // ===== 1. 元素克制测试 =====
    console.log('\n1️⃣  元素克制计算');
    console.log('─'.repeat(40));
    
    // 测试getElementBonus函数
    if (typeof BattleSystem.getElementBonus === 'function') {
        // 火克冰（火系攻击冰系防御，应该有加成）
        const fireVsIce = BattleSystem.getElementBonus('fire', 'ice');
        if (fireVsIce > 1.0) {
            result.pass(`火克冰: 倍率=${fireVsIce.toFixed(2)} (>1.0)`);
        } else {
            result.fail(`火克冰: 倍率=${fireVsIce.toFixed(2)}，应该>1.0`);
        }
        
        // 水克火
        const waterVsFire = BattleSystem.getElementBonus('water', 'fire');
        if (waterVsFire > 1.0) {
            result.pass(`水克火: 倍率=${waterVsFire.toFixed(2)} (>1.0)`);
        } else {
            result.fail(`水克火: 倍率=${waterVsFire.toFixed(2)}，应该>1.0`);
        }
        
        // 雷克水
        const thunderVsWater = BattleSystem.getElementBonus('thunder', 'water');
        if (thunderVsWater > 1.0) {
            result.pass(`雷克水: 倍率=${thunderVsWater.toFixed(2)} (>1.0)`);
        } else {
            result.fail(`雷克水: 倍率=${thunderVsWater.toFixed(2)}，应该>1.0`);
        }
        
        // 同系攻击应该有抗性
        const fireVsFire = BattleSystem.getElementBonus('fire', 'fire');
        if (fireVsFire < 1.0) {
            result.pass(`同系抗性: 倍率=${fireVsFire.toFixed(2)} (<1.0)`);
        } else {
            result.fail(`同系应该有抗性: 倍率=${fireVsFire.toFixed(2)}，应该<1.0`);
        }
        
        // 无属性攻击应该无加成
        const neutralVsFire = BattleSystem.getElementBonus('neutral', 'fire');
        if (Math.abs(neutralVsFire - 1.0) < 0.01) {
            result.pass(`无属性攻击: 倍率=${neutralVsFire.toFixed(2)} (≈1.0)`);
        } else {
            result.warn(`无属性攻击: 倍率=${neutralVsFire.toFixed(2)}，可能需要确认`);
        }
    } else {
        result.fail('getElementBonus函数不存在');
    }
    
    // ===== 2. 伤害计算测试 =====
    console.log('\n2️⃣  伤害计算');
    console.log('─'.repeat(40));
    
    if (typeof BattleSystem.calculateDamage === 'function') {
        const mockTarget = { statusEffects: [], defense: 10 };
        const mockAttacker = { statusEffects: [], attack: 20 };
        
        // 基础伤害：攻击20，防御10，倍率1.0
        const basicDmg = BattleSystem.calculateDamage(20, 10, 1.0, 0, 1.0, 'physical', 'neutral', mockTarget, mockAttacker);
        if (basicDmg.amount > 0) {
            result.pass(`基础伤害: ${basicDmg.amount} (>0)`);
        } else {
            result.fail(`基础伤害: ${basicDmg.amount}，应该>0`);
        }
        
        // 高攻击低防御应该伤害更高
        const highAtkDmg = BattleSystem.calculateDamage(100, 10, 1.0, 0, 1.0, 'physical', 'neutral', mockTarget, mockAttacker);
        if (highAtkDmg.amount > basicDmg.amount) {
            result.pass(`高攻击伤害更高: ${highAtkDmg.amount} > ${basicDmg.amount}`);
        } else {
            result.fail(`高攻击伤害应该更高: ${highAtkDmg.amount} <= ${basicDmg.amount}`);
        }
        
        // 高防御应该伤害更低
        const highDefTarget = { statusEffects: [], defense: 100 };
        const highDefDmg = BattleSystem.calculateDamage(20, 100, 1.0, 0, 1.0, 'physical', 'neutral', highDefTarget, mockAttacker);
        if (highDefDmg.amount < basicDmg.amount) {
            result.pass(`高防御伤害更低: ${highDefDmg.amount} < ${basicDmg.amount}`);
        } else {
            result.fail(`高防御伤害应该更低: ${highDefDmg.amount} >= ${basicDmg.amount}`);
        }
        
        // 暴击率100%应该暴击
        const critDmg = BattleSystem.calculateDamage(20, 10, 1.0, 1.0, 1.0, 'physical', 'neutral', mockTarget, mockAttacker);
        if (critDmg.isCrit) {
            result.pass(`100%暴击率触发暴击: isCrit=${critDmg.isCrit}`);
        } else {
            result.fail(`100%暴击率应该触发暴击: isCrit=${critDmg.isCrit}`);
        }
        
        // 命中率0%应该未命中
        const missDmg = BattleSystem.calculateDamage(20, 10, 1.0, 0, 0, 'physical', 'neutral', mockTarget, mockAttacker);
        if (missDmg.isMiss) {
            result.pass(`0%命中率触发未命中: isMiss=${missDmg.isMiss}`);
        } else {
            result.fail(`0%命中率应该未命中: isMiss=${missDmg.isMiss}`);
        }
    } else {
        result.fail('calculateDamage函数不存在');
    }
    
    // ===== 3. 引导时间计算测试 =====
    console.log('\n3️⃣  引导时间计算');
    console.log('─'.repeat(40));
    
    if (typeof BattleSystem.getCastTime === 'function') {
        // 初阶技能基础引导时间2
        const basicCastTime = BattleSystem.getCastTime('初阶');
        if (basicCastTime === 2) {
            result.pass(`初阶引导时间: ${basicCastTime}`);
        } else {
            result.fail(`初阶引导时间应该=2，实际=${basicCastTime}`);
        }
        
        // 中阶技能基础引导时间3
        const midCastTime = BattleSystem.getCastTime('中阶');
        if (midCastTime === 3) {
            result.pass(`中阶引导时间: ${midCastTime}`);
        } else {
            result.fail(`中阶引导时间应该=3，实际=${midCastTime}`);
        }
        
        // 未知阶数默认2
        const unknownCastTime = BattleSystem.getCastTime('未知');
        if (unknownCastTime === 2) {
            result.pass(`未知阶数默认引导时间: ${unknownCastTime}`);
        } else {
            result.warn(`未知阶数引导时间=${unknownCastTime}，可能需要确认`);
        }
    } else {
        result.fail('getCastTime函数不存在');
    }
    
    // ===== 4. 状态效果测试 =====
    console.log('\n4️⃣  状态效果判断');
    console.log('─'.repeat(40));
    
    if (typeof BattleSystem.isStunned === 'function') {
        // 无状态效果
        const noStun = BattleSystem.isStunned({ statusEffects: [] });
        if (noStun === false) {
            result.pass('无状态效果: isStunned=false');
        } else {
            result.fail(`无状态效果应该isStunned=false，实际=${noStun}`);
        }
        
        // 眩晕状态
        const stunTarget = { statusEffects: [{ type: 'stun', name: '眩晕', duration: 1 }] };
        if (BattleSystem.isStunned(stunTarget) === true) {
            result.pass('眩晕状态: isStunned=true');
        } else {
            result.fail('眩晕状态应该isStunned=true');
        }
        
        // 冻结状态
        const frozenTarget = { statusEffects: [{ type: 'frozen', name: '冻结', duration: 1 }] };
        if (BattleSystem.isStunned(frozenTarget) === true) {
            result.pass('冻结状态: isStunned=true');
        } else {
            result.fail('冻结状态应该isStunned=true');
        }
        
        // 麻痹状态
        const paralyzeTarget = { statusEffects: [{ type: 'paralyze', name: '麻痹', duration: 1 }] };
        if (BattleSystem.isStunned(paralyzeTarget) === true) {
            result.pass('麻痹状态: isStunned=true');
        } else {
            result.fail('麻痹状态应该isStunned=true');
        }
        
        // 普通debuff（如燃烧）不应该被判定为眩晕
        const burnTarget = { statusEffects: [{ type: 'burn', name: '燃烧', duration: 3 }] };
        if (BattleSystem.isStunned(burnTarget) === false) {
            result.pass('燃烧状态: isStunned=false（非控制类）');
        } else {
            result.fail('燃烧状态不应该isStunned=true');
        }
    } else {
        result.fail('isStunned函数不存在');
    }
    
    // ===== 5. 状态修正值测试 =====
    console.log('\n5️⃣  状态修正值计算');
    console.log('─'.repeat(40));
    
    if (typeof BattleSystem.getStatusModifiers === 'function') {
        // 无状态效果，修正值应为默认
        const noMods = BattleSystem.getStatusModifiers({ statusEffects: [] });
        if (noMods.attackMod === 0 && noMods.defenseMod === 0 && noMods.speedMod === 0) {
            result.pass('无状态: 攻防速修正=0');
        } else {
            result.fail(`无状态修正值异常: attack=${noMods.attackMod}, defense=${noMods.defenseMod}`);
        }
        
        // 有攻击加成的状态
        const atkBuffTarget = {
            statusEffects: [{
                type: 'attack_up',
                name: '攻击强化',
                duration: 3,
                statModifiers: { attack: 10, defense: 0, speed: 0 }
            }]
        };
        const atkMods = BattleSystem.getStatusModifiers(atkBuffTarget);
        if (atkMods.attackMod === 10) {
            result.pass(`攻击强化: attackMod=${atkMods.attackMod}`);
        } else {
            result.fail(`攻击强化应该attackMod=10，实际=${atkMods.attackMod}`);
        }
        
        // 层数叠加
        const stackTarget = {
            statusEffects: [{
                type: 'attack_up',
                name: '攻击强化',
                duration: 3,
                stacks: 3,
                statModifiers: { attack: 5, defense: 0, speed: 0 }
            }]
        };
        const stackMods = BattleSystem.getStatusModifiers(stackTarget);
        if (stackMods.attackMod === 15) {
            result.pass(`层数叠加(3层×5): attackMod=${stackMods.attackMod}`);
        } else {
            result.fail(`层数叠加应该attackMod=15，实际=${stackMods.attackMod}`);
        }
    } else {
        result.fail('getStatusModifiers函数不存在');
    }
    
    return result.report();
}

if (require.main === module) {
    const report = runBattleLogicTests();
    process.exit(report.failed > 0 ? 1 : 0);
}

module.exports = { runBattleLogicTests };
