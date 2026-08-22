/**
 * L2 战斗逻辑单元测试
 * 
 * 纯函数测试，不需要浏览器
 * 覆盖：元素克制、伤害计算、状态效果
 * 
 * 运行：node tests/battle-logic.js
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { TestResult } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadBattleSystem() {
    const engineDir = path.join(__dirname, '..', '..', 'src', 'engine');
    
    // 加载所有battle.js依赖的拆分模块（按依赖顺序）
    const depFiles = [
        'battle-utils.js',
        'battle-start.js',
        'battle-skill.js',
        'battle-enemy-turn.js',
        'battle-player-attack.js',
        'battle-damage.js',
        'battle-end-enemy-turn.js',
        'battle-summon.js',
        'battle-status.js',
        'battle-rewards.js',
        'battle-help.js',
        'battle-magic-tool.js',
        'battle-status-modifiers.js',
        'battle-traits.js',
        'battle-add-status.js',
        'battle-check-end.js',
        'battle-apply-status.js',
        'battle-spirit-seed.js',
    ];
    
    let depCode = '';
    for (const f of depFiles) {
        const filePath = path.join(engineDir, f);
        if (fs.existsSync(filePath)) {
            let code = fs.readFileSync(filePath, 'utf-8');
            // 转换ES模块为沙箱可执行代码
            code = code.replace(/^import\s+.*$/gm, '');
            code = code.replace(/^export\s+default\s+.*$/gm, '');
            code = code.replace(/^export\s+function\s+(\w+)/gm, 'function $1');
            code = code.replace(/^export\s+const\s+(\w+)\s*=/gm, 'var $1 =');
            code = code.replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');
            code = code.replace(/if\s*\(typeof\s+window\s*!==\s*'undefined'\)[\s\S]*?\}/g, '');
            depCode += '\n' + code + '\n';
        }
    }
    
    const battleCode = fs.readFileSync(path.join(engineDir, 'battle.js'), 'utf-8');
    // ES模块：移除import和export，替换const为var，使其在沙箱中可访问
    let code = battleCode.replace(/^import\s+.*$/gm, '');
    code = code.replace(/^export\s+default\s+.*$/gm, '');
    code = code.replace(/^export\s+const\s+(\w+)\s*=/gm, 'var $1 =');
    code = code.replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');
    // 移除window挂载代码
    code = code.replace(/if\s*\(typeof\s+window\s*!==\s*'undefined'\)[\s\S]*?\}/g, '');
    
    // 合并依赖模块代码和battle.js代码
    // 添加import别名定义（因为battle.js中用了as别名）
    const aliasCode = `
        var startBattleImpl = startBattle;
        var castSkillImmediateImpl = castSkillImmediate;
        var enemyTurnImpl = enemyTurn;
        var playerAttackImpl = playerAttack;
        var calculateDamageImpl = calculateDamage;
        var applyDamageImpl = applyDamage;
        var endEnemyTurnImpl = endEnemyTurn;
        var summonAttackImpl = summonAttack;
        var tickStatusEffectsImpl = tickStatusEffects;
        var calculateRewardsImpl = calculateRewards;
        var showHelpImpl = showHelp;
        var applyMagicToolEffectImpl = applyMagicToolEffect;
        var getStatusModifiersImpl = getStatusModifiers;
        var processTraitsOnHitImpl = processTraitsOnHit;
        var addStatusEffectImpl = addStatusEffect;
        var checkBattleEndImpl = checkBattleEnd;
        var applyStatusEffectsImpl = applyStatusEffects;
        var applySpiritSeedEffectsImpl = applySpiritSeedEffects;
    `;
    const fullCode = depCode + '\n' + aliasCode + '\n' + code;
    
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
            // v2.9.4: 打断机制测试需要
            getMagicTier: () => '中阶',
            getInterruptReduction: (tier) => {
                // 模拟中阶玩家：初阶-15%，中阶0，高阶null
                if (tier === '初阶') return 0.15;
                if (tier === '中阶') return 0;
                return null;
            },
            canCastTier: (tier) => tier !== '高阶',
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
    vm.runInContext(fullCode, sandbox);
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

    // ===== 6. v2.9.4 统一打断概率计算测试 =====
    console.log('\n6️⃣  统一打断概率计算（v2.9.4）');
    console.log('─'.repeat(40));

    if (typeof BattleSystem.calculateInterruptChance === 'function') {
        // 设置BattleSystem.player用于境界减免判定
        BattleSystem.player = { spirit: 30, hp: 100, mp: 100 };
        const mockSkill = { id: 'test', name: '测试技能', tier: '中阶', interruptChance: 1.0, mpCost: 30 };

        // 6.1 基础概率（castTime决定）
        const t1 = BattleSystem.calculateInterruptChance(1, mockSkill, BattleSystem.player, null, false);
        if (Math.abs(t1 - 0.08) < 0.001) result.pass(`castTime=1基础概率: ${(t1*100).toFixed(0)}%（应为8%）`);
        else result.fail(`castTime=1应为8%，实际=${(t1*100).toFixed(1)}%`);

        const t2 = BattleSystem.calculateInterruptChance(2, mockSkill, BattleSystem.player, null, false);
        if (Math.abs(t2 - 0.15) < 0.001) result.pass(`castTime=2基础概率: ${(t2*100).toFixed(0)}%（应为15%）`);
        else result.fail(`castTime=2应为15%，实际=${(t2*100).toFixed(1)}%`);

        const t3 = BattleSystem.calculateInterruptChance(3, mockSkill, BattleSystem.player, null, false);
        if (Math.abs(t3 - 0.22) < 0.001) result.pass(`castTime=3基础概率: ${(t3*100).toFixed(0)}%（应为22%）`);
        else result.fail(`castTime=3应为22%，实际=${(t3*100).toFixed(1)}%`);

        // 6.2 技能难度系数（interruptChance作为乘数）
        const hardSkill = { ...mockSkill, interruptChance: 1.5 };
        const tHard = BattleSystem.calculateInterruptChance(2, hardSkill, BattleSystem.player, null, false);
        if (Math.abs(tHard - 0.225) < 0.001) result.pass(`难度系数1.5: ${(tHard*100).toFixed(1)}%（15%×1.5=22.5%）`);
        else result.fail(`难度系数1.5应为22.5%，实际=${(tHard*100).toFixed(1)}%`);

        // 6.3 精神力差修正（攻击者精神力高→打断概率增加）
        const strongAttacker = { spirit: 50 };
        const tSpirit = BattleSystem.calculateInterruptChance(2, mockSkill, BattleSystem.player, strongAttacker, false);
        // 基础15% + (50-30)*0.003 = 15% + 6% = 21%
        if (Math.abs(tSpirit - 0.21) < 0.001) result.pass(`精神力差(+20): ${(tSpirit*100).toFixed(0)}%（15%+6%=21%）`);
        else result.fail(`精神力差+20应为21%，实际=${(tSpirit*100).toFixed(1)}%`);

        // 6.4 精神力差修正上限（±10%）
        const hugeAttacker = { spirit: 100 };
        const tHuge = BattleSystem.calculateInterruptChance(2, mockSkill, BattleSystem.player, hugeAttacker, false);
        // (100-30)*0.003=21%，但上限10%，所以15%+10%=25%
        if (Math.abs(tHuge - 0.25) < 0.001) result.pass(`精神力差上限: ${(tHuge*100).toFixed(0)}%（封顶+10%→25%）`);
        else result.fail(`精神力差上限应为25%，实际=${(tHuge*100).toFixed(1)}%`);

        // 6.5 境界压制减免（中阶玩家放初阶魔法→-15%）
        const lowSkill = { ...mockSkill, tier: '初阶' };
        const tRealm = BattleSystem.calculateInterruptChance(1, lowSkill, BattleSystem.player, null, false);
        // 基础8% - 境界减免15% = 0%（下限0）
        if (tRealm === 0) result.pass(`境界压制(中阶放初阶): ${(tRealm*100).toFixed(0)}%（8%-15%→0%）`);
        else result.fail(`境界压制应为0%，实际=${(tRealm*100).toFixed(1)}%`);

        // 6.6 防御姿态抗打断（上回合防御→-20%）
        const tDefend = BattleSystem.calculateInterruptChance(2, mockSkill, BattleSystem.player, null, true);
        // 基础15% - 防御20% = 0%（下限0）
        if (tDefend === 0) result.pass(`防御姿态抗打断: ${(tDefend*100).toFixed(0)}%（15%-20%→0%）`);
        else result.fail(`防御姿态应为0%，实际=${(tDefend*100).toFixed(1)}%`);

        // 6.7 范围上限（95%）
        const superHardSkill = { ...mockSkill, interruptChance: 10.0, tier: '高阶' };
        const tMax = BattleSystem.calculateInterruptChance(5, superHardSkill, BattleSystem.player, hugeAttacker, false);
        if (tMax <= 0.95 && tMax > 0.9) result.pass(`概率上限: ${(tMax*100).toFixed(0)}%（封顶95%）`);
        else result.fail(`概率上限应为95%，实际=${(tMax*100).toFixed(1)}%`);

        // 6.8 自打断场景（attacker=null，无精神力差修正）
        const tSelf = BattleSystem.calculateInterruptChance(1, mockSkill, BattleSystem.player, null, false);
        if (Math.abs(tSelf - 0.08) < 0.001) result.pass(`自打断(无攻击者): ${(tSelf*100).toFixed(0)}%（仅基础8%）`);
        else result.fail(`自打断应为8%，实际=${(tSelf*100).toFixed(1)}%`);

    } else {
        result.fail('calculateInterruptChance函数不存在');
    }

    return result.report();
}

export { runBattleLogicTests };
