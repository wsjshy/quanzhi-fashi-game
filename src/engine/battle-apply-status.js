/**
 * 战斗系统 - 应用状态效果模块
 * 
 * 从battle.js拆分出的独立应用状态效果模块
 * 包含：应用状态效果（applyStatusEffects）
 */

export function applyStatusEffects(target, effects, isPlayerTarget) {
        const targetName = isPlayerTarget ? '你' : this.enemy.name;

        effects.forEach(effect => {
            // debuffImmunity：免疫负面状态
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'slow', 'poison', 'curse', 'paralyze', 'weakness', 'bleed', 'bind', 'blind', 'fear', 'shock', 'attack_down', 'defense_down'];
            if (target === this.player && target.talentEffects && target.talentEffects.debuffImmunity) {
                if (debuffTypes.includes(effect.type)) return; // 跳过负面状态
            }
            // 净化效果：清除所有负面状态
            if (effect.type === 'cleanse') {
                if (Math.random() < (effect.chance || 1.0)) {
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness', 'bleed', 'healing_reduction', 'bind', 'blind', 'confuse'];
                    const removedEffects = target.statusEffects.filter(e => debuffTypes.includes(e.type));
                    target.statusEffects = target.statusEffects.filter(e => !debuffTypes.includes(e.type));
                    const removed = removedEffects.length;
                    if (removed > 0) {
                        this.addLog(`${targetName} 的圣光净化了 ${removed} 个负面状态！`, 'buff');
                        
                        // 发布状态移除事件
                        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                            removedEffects.forEach(removedEffect => {
                                BattleEventBus.emit(BattleEvents.STATUS_REMOVED, {
                                    target: isPlayerTarget ? 'player' : 'enemy',
                                    effect: removedEffect,
                                    reason: 'cleanse'
                                });
                            });
                        }
                    } else {
                        this.addLog(`${targetName} 被圣光笼罩，没有负面状态需要净化`, 'system');
                    }
                }
                return;
            }

            // 计算命中概率（控制类状态受精神力抵抗）
            let hitChance = effect.chance || 1.0;
            const controlTypes = ['stun', 'frozen', 'freeze', 'paralyze', 'bind', 'blind', 'slow'];
            if (controlTypes.includes(effect.type)) {
                const spirit = target.spirit || 30;
                const resist = spirit * 0.003; // 每点精神力抵抗0.3%
                hitChance = Math.max(0.5, hitChance - resist); // 最低50%命中
            }
            
            // 失明免疫检查（如黑畜妖没有眼睛）
            if (effect.type === 'blind' && target.blindImmune) {
                this.addLog(`${targetName} 没有眼睛，不受失明影响！`, 'system');
                return;
            }
            
            if (Math.random() < hitChance) {
                const existing = target.statusEffects.find(e => e.type === effect.type);
                
                if (existing) {
                    // 层数叠加型（燃烧、诅咒等）
                    if (effect.stacks || existing.stacks) {
                        const maxStacks = effect.maxStacks || existing.maxStacks || 3;
                        existing.stacks = Math.min(maxStacks, (existing.stacks || 1) + (effect.stacks || 1));
                        existing.duration = Math.max(existing.duration, effect.duration);
                        this.addLog(`${targetName} 的 ${effect.name} 叠加到 ${existing.stacks} 层！`, 'debuff');
                    }
                    // 数值累积型（冻结值、护盾值等）
                    else if (effect.value !== undefined || existing.value !== undefined) {
                        existing.value = (existing.value || 0) + (effect.value || 0);
                        existing.duration = Math.max(existing.duration, effect.duration);
                        // 冻结值达到阈值则冻结
                        if (effect.type === 'freeze' && existing.value >= 100) {
                            existing.type = 'frozen';
                            existing.name = '冻结';
                            existing.duration = 1;
                            existing.value = 0;
                            this.addLog(`${targetName} 被冻结了！`, 'debuff');
                        }
                    }
                    // 普通刷新持续时间
                    else {
                        existing.duration = Math.max(existing.duration, effect.duration);
                        this.addLog(`${targetName} 的 ${effect.name} 持续时间刷新了`, 'system');
                    }
                } else {
                    // 新效果
                    const newEffect = { ...effect };
                    if (effect.stacks && !newEffect.stacks) newEffect.stacks = 1;
                    target.statusEffects.push(newEffect);
                    
                    // 特殊效果提示
                    const buffTypes = ['shield', 'attack_up', 'defense_up', 'speed_up', 'crit_up', 'regen', 'evasion_up', 'invulnerable', 'stealth', 'charge'];
                    const isBuff = buffTypes.includes(effect.type);
                    if (effect.type === 'stun' || effect.type === 'frozen') {
                        this.addLog(`${targetName} 被${effect.name}了！`, 'debuff');
                    } else if (effect.type === 'shield') {
                        this.addLog(`${targetName} 获得了 ${effect.value} 点护盾！`, 'buff');
                    } else if (effect.type === 'wet') {
                        this.addLog(`${targetName} 被水浸湿了`, 'debuff');
                    } else if (effect.type === 'evasion_up') {
                        this.addLog(`${targetName} 闪避率提升！`, 'buff');
                    } else if (isBuff) {
                        this.addLog(`${targetName} 获得了 ${effect.name} 效果！`, 'buff');
                    } else {
                        this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
                    }
                    
                    // 发布状态施加事件
                    if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                        BattleEventBus.emit(BattleEvents.STATUS_APPLIED, {
                            target: isPlayerTarget ? 'player' : 'enemy',
                            effect: newEffect,
                            isDebuff: !['shield', 'evasion_up', 'attack_up', 'defense_up', 'speed_up', 'crit_up', 'regen', 'cleanse'].includes(effect.type)
                        });
                    }
                }

                // 元素组合反应检查
                this.checkElementReactions(target, effect, isPlayerTarget);
            }
        });
    }


// 导出模块集合
export const BattleApplyStatus = {
    applyStatusEffects
};

export default BattleApplyStatus;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleApplyStatus = BattleApplyStatus;
}