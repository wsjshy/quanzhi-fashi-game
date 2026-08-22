/**
 * 战斗系统 - 妖魔特性命中处理模块
 * 
 * 从battle.js拆分出的独立妖魔特性命中处理模块
 * 包含：处理命中时的妖魔特性（processTraitsOnHit）
 */

export function processTraitsOnHit(attacker, target, damage, isPlayer) {
        if (!attacker.traits || attacker.traits.length === 0) return;
        
        const attackerName = isPlayer ? '你' : attacker.name;
        
        for (const trait of attacker.traits) {
            // 攻击造成流血
            if (trait.type === 'on_hit' && trait.effects && trait.effects.bleedChance) {
                if (Math.random() < trait.effects.bleedChance) {
                    // 添加流血效果
                    const bleedEffect = {
                        type: 'bleed',
                        name: '流血',
                        duration: trait.effects.bleedDuration || 3,
                        dotDamage: trait.effects.bleedDamage || 5,
                        stacks: 1,
                        icon: '🩸'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(bleedEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了流血效果！`, 'debuff');
                }
            }
            
            // 攻击造成中毒
            if (trait.type === 'on_hit' && trait.effects && trait.effects.poisonChance) {
                if (Math.random() < trait.effects.poisonChance) {
                    // 添加中毒效果
                    const poisonEffect = {
                        type: 'poison',
                        name: '中毒',
                        duration: trait.effects.poisonDuration || 3,
                        dotDamage: trait.effects.poisonDamage || 5,
                        stacks: 1,
                        icon: '☠️'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(poisonEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了中毒效果！`, 'debuff');
                }
            }
            
            // 攻击造成减速
            if (trait.type === 'on_hit' && trait.effects && trait.effects.slowChance) {
                if (Math.random() < trait.effects.slowChance) {
                    // 添加减速效果
                    const slowEffect = {
                        type: 'slow',
                        name: '减速',
                        duration: trait.effects.slowDuration || 2,
                        speedMod: -(trait.effects.slowAmount || 0.2),
                        stacks: 1,
                        icon: '🐌'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(slowEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了减速效果！`, 'debuff');
                }
            }
            
            // 攻击造成冰冻
            if (trait.type === 'on_hit' && trait.effects && trait.effects.freezeChance) {
                if (Math.random() < trait.effects.freezeChance) {
                    // 添加冰冻效果
                    const freezeEffect = {
                        type: 'frozen',
                        name: '冰冻',
                        duration: trait.effects.freezeDuration || 1,
                        stacks: 1,
                        icon: '🧊'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(freezeEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了冰冻效果！`, 'debuff');
                }
            }
            
            // 攻击造成眩晕
            if (trait.type === 'on_hit' && trait.effects && trait.effects.stunChance) {
                if (Math.random() < trait.effects.stunChance) {
                    // 添加眩晕效果
                    const stunEffect = {
                        type: 'stun',
                        name: '眩晕',
                        duration: trait.effects.stunDuration || 1,
                        stacks: 1,
                        icon: '💫'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(stunEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了眩晕效果！`, 'debuff');
                }
            }
            
            // 攻击造成致盲
            if (trait.type === 'on_hit' && trait.effects && trait.effects.blindChance) {
                if (Math.random() < trait.effects.blindChance) {
                    // 添加致盲效果
                    const blindEffect = {
                        type: 'blind',
                        name: '致盲',
                        duration: trait.effects.blindDuration || 1,
                        hitMod: -0.3,
                        stacks: 1,
                        icon: '👁️‍🗨️'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(blindEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了致盲效果！`, 'debuff');
                }
            }
            
            // 攻击造成束缚
            if (trait.type === 'on_hit' && trait.effects && trait.effects.bindChance) {
                if (Math.random() < trait.effects.bindChance) {
                    // 添加束缚效果
                    const bindEffect = {
                        type: 'bind',
                        name: '束缚',
                        duration: trait.effects.bindDuration || 2,
                        stacks: 1,
                        icon: '🔗'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(bindEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了束缚效果！`, 'debuff');
                }
            }
        }
    }


// 导出模块集合
export const BattleTraits = {
    processTraitsOnHit
};

export default BattleTraits;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleTraits = BattleTraits;
}