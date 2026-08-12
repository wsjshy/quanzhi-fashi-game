/**
 * 战斗效果注册表（Effect Registry）
 * 
 * 核心思想：
 * 1. 所有效果类型（天赋、技能、状态、物品等）都统一注册
 * 2. 每个效果类型有独立的处理器
 * 3. 新增效果类型只需要注册处理器，不需要改主逻辑
 * 
 * 触发时机：
 * - passive: 被动常驻，影响属性
 * - onBeforeAttack: 攻击前
 * - onHit: 攻击命中时
 * - onBeforeHit: 受击前
 * - onAfterHit: 受击后
 * - onTurnStart: 回合开始时
 * - onTurnEnd: 回合结束时
 * - onFirstAttack: 首次攻击
 * - onBattleStart: 战斗开始时
 * - onBattleEnd: 战斗结束时
 */

const EffectRegistry = {
    // 效果处理器注册表
    handlers: {},
    
    /**
     * 注册效果处理器
     * @param {string} effectType - 效果类型
     * @param {Object} handler - 效果处理器对象
     */
    register(effectType, handler) {
        this.handlers[effectType] = handler;
        console.log(`[EffectRegistry] 注册效果类型: ${effectType}`);
    },
    
    /**
     * 获取效果处理器
     * @param {string} effectType - 效果类型
     * @returns {Object} 效果处理器
     */
    getHandler(effectType) {
        return this.handlers[effectType];
    },
    
    /**
     * 检查效果类型是否已注册
     * @param {string} effectType - 效果类型
     * @returns {boolean}
     */
    has(effectType) {
        return !!this.handlers[effectType];
    },
    
    /**
     * 计算被动属性加成
     * @param {Array} effects - 效果列表
     * @returns {Object} 属性加成对象
     */
    calculatePassiveBonuses(effects) {
        const bonuses = {
            attack: 0,
            defense: 0,
            speed: 0,
            maxHp: 0,
            maxMp: 0,
            critRate: 0,
            hitRate: 0,
            dodgeRate: 0,
            // 元素伤害加成
            fireDamageBonus: 0,
            iceDamageBonus: 0,
            thunderDamageBonus: 0,
            waterDamageBonus: 0,
            windDamageBonus: 0,
            earthDamageBonus: 0,
            lightDamageBonus: 0,
            darkDamageBonus: 0,
            // 元素抗性
            fireResistance: 0,
            iceResistance: 0,
            thunderResistance: 0,
            waterResistance: 0,
            windResistance: 0,
            earthResistance: 0,
            lightResistance: 0,
            darkResistance: 0,
        };
        
        if (!effects || effects.length === 0) return bonuses;
        
        for (const effect of effects) {
            const handler = this.handlers[effect.type];
            if (handler && handler.getPassiveBonuses) {
                const effectBonuses = handler.getPassiveBonuses(effect);
                if (effectBonuses) {
                    // 合并加成
                    for (const key in effectBonuses) {
                        if (bonuses[key] !== undefined) {
                            bonuses[key] += effectBonuses[key];
                        }
                    }
                }
            }
        }
        
        return bonuses;
    },
    
    /**
     * 触发某个时机的效果
     * @param {string} trigger - 触发时机
     * @param {Array} effects - 效果列表
     * @param {Object} context - 上下文对象
     * @returns {Array} 所有效果的返回值
     */
    trigger(trigger, effects, context) {
        const results = [];
        
        if (!effects || effects.length === 0) return results;
        
        for (const effect of effects) {
            const handler = this.handlers[effect.type];
            if (handler && handler[trigger]) {
                try {
                    const result = handler[trigger](effect, context);
                    if (result) {
                        results.push(result);
                    }
                } catch (e) {
                    console.error(`[EffectRegistry] 触发效果出错: ${effect.type}.${trigger}`, e);
                }
            }
        }
        
        return results;
    }
};

// ==================== 基础效果处理器 ====================

// 攻击加成
EffectRegistry.register('attack_bonus', {
    name: '攻击加成',
    description: '增加攻击力',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.attackBonus || effect.value || 0;
        return { attack: value };
    }
});

// 防御加成
EffectRegistry.register('defense_bonus', {
    name: '防御加成',
    description: '增加防御力',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.defenseBonus || effect.value || 0;
        return { defense: value };
    }
});

// 速度加成
EffectRegistry.register('speed_bonus', {
    name: '速度加成',
    description: '增加速度',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.speedBonus || effect.value || 0;
        return { speed: value };
    }
});

// HP加成
EffectRegistry.register('hp_bonus', {
    name: '生命加成',
    description: '增加最大生命值',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.hpBonus || effect.value || 0;
        return { maxHp: value };
    }
});

// 闪避加成
EffectRegistry.register('dodge_bonus', {
    name: '闪避加成',
    description: '增加闪避率',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.dodgeBonus || effect.value || 0;
        return { dodgeRate: value };
    }
});

// 命中加成
EffectRegistry.register('hit_bonus', {
    name: '命中加成',
    description: '增加命中率',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.hitBonus || effect.value || 0;
        return { hitRate: value };
    }
});

// 全属性加成
EffectRegistry.register('all_stats_bonus', {
    name: '全属性加成',
    description: '所有属性都增加',
    
    getPassiveBonuses(effect) {
        const value = effect.effects?.bonus || effect.value || 0;
        return {
            attack: value,
            defense: value,
            speed: value,
            maxHp: value * 5, // HP加成多一点
            maxMp: value * 2
        };
    }
});

// ==================== 元素伤害加成（通用） ====================
// effect.element: 元素类型（fire/ice/thunder/water/wind/earth/light/dark）
// effect.value: 加成比例（0.3 = +30%）
EffectRegistry.register('element_damage_bonus', {
    name: '元素伤害加成',
    description: '增加指定元素的伤害',
    
    getPassiveBonuses(effect) {
        const element = effect.element || effect.effects?.element;
        const value = effect.value || effect.effects?.value || 0;
        if (!element) return {};
        
        // 返回元素伤害加成
        const result = {};
        result[`${element}DamageBonus`] = value;
        return result;
    }
});

// ==================== 元素抗性（通用） ====================
// effect.element: 元素类型
// effect.value: 减免比例（0.3 = -30%伤害）
EffectRegistry.register('element_resistance', {
    name: '元素抗性',
    description: '减少受到的指定元素伤害',
    
    getPassiveBonuses(effect) {
        const element = effect.element || effect.effects?.element;
        const value = effect.value || effect.effects?.value || 0;
        if (!element) return {};
        
        // 返回元素抗性
        const result = {};
        result[`${element}DamageReduction`] = value;
        return result;
    }
});

// ==================== 物理伤害减免 ====================
EffectRegistry.register('physical_damage_reduction', {
    name: '物理伤害减免',
    description: '减少受到的物理伤害',
    
    getPassiveBonuses(effect) {
        const value = effect.value || effect.effects?.value || 0;
        return { physicalDamageReduction: value };
    }
});

// ==================== 魔法伤害减免 ====================
EffectRegistry.register('magic_damage_reduction', {
    name: '魔法伤害减免',
    description: '减少受到的魔法伤害',
    
    getPassiveBonuses(effect) {
        const value = effect.value || effect.effects?.value || 0;
        return { magicDamageReduction: value };
    }
});

// ==================== 伤害反弹 ====================
EffectRegistry.register('damage_reflect', {
    name: '伤害反弹',
    description: '将受到的伤害反弹一部分给攻击者',
    
    getPassiveBonuses(effect) {
        const value = effect.value || effect.effects?.value || 0;
        return { damageReflect: value };
    }
});

// ==================== 血怒（血量越低攻击越高） ====================
EffectRegistry.register('blood_rage', {
    name: '血怒',
    description: '血量越低，攻击力越高',
    
    // 动态计算，需要在战斗中实时计算
    isDynamic: true,
    
    calculateBonus(effect, context) {
        const maxHp = context.maxHp || 1;
        const currentHp = context.currentHp || 0;
        const hpPercent = currentHp / maxHp;
        const maxBonus = effect.value || effect.effects?.maxBonus || 0.5;
        
        // 血量越低，加成越高
        // 满血时0加成，空血时maxBonus加成
        const bonus = maxBonus * (1 - hpPercent);
        return { attackBonus: bonus };
    }
});

// ==================== 再生（回合结束恢复HP） ====================
EffectRegistry.register('regeneration', {
    name: '再生',
    description: '每回合结束时恢复一定HP',
    
    trigger: 'onTurnEnd',
    
    onTurnEnd(effect, context) {
        const target = context.target;
        if (!target) return;
        
        const regenAmount = effect.value || effect.effects?.value || 0;
        const actualRegen = Math.floor(target.maxHp * regenAmount);
        target.hp = Math.min(target.maxHp, target.hp + actualRegen);
        
        return {
            healed: actualRegen,
            message: `恢复了 ${actualRegen} 点生命`
        };
    }
});

// ==================== 首次攻击必定暴击 ====================
EffectRegistry.register('first_strike_crit', {
    name: '首次攻击必定暴击',
    description: '第一次攻击必定暴击',
    
    trigger: 'onFirstAttack',
    
    onFirstAttack(effect, context) {
        return {
            guaranteedCrit: true,
            damageBonus: effect.effects?.damageBonus || 0
        };
    }
});

// ==================== 攻击流血 ====================
EffectRegistry.register('bleed_on_hit', {
    name: '攻击流血',
    description: '攻击命中时使目标流血',
    
    trigger: 'onHit',
    
    onHit(effect, context) {
        const target = context.target;
        if (!target) return;
        
        // 应用流血效果
        const duration = effect.effects?.duration || 3;
        const damagePerTurn = effect.effects?.damagePerTurn || 5;
        
        if (!target.statusEffects) target.statusEffects = [];
        target.statusEffects.push({
            type: 'bleed',
            name: '流血',
            duration: duration,
            damagePerTurn: damagePerTurn
        });
        
        return { applied: true, status: 'bleed' };
    }
});

// ==================== 攻击中毒 ====================
EffectRegistry.register('poison_on_hit', {
    name: '攻击中毒',
    description: '攻击命中时使目标中毒',
    
    trigger: 'onHit',
    
    onHit(effect, context) {
        const target = context.target;
        if (!target) return;
        
        const duration = effect.effects?.duration || 3;
        const damagePerTurn = effect.effects?.damagePerTurn || 5;
        
        if (!target.statusEffects) target.statusEffects = [];
        target.statusEffects.push({
            type: 'poison',
            name: '中毒',
            duration: duration,
            damagePerTurn: damagePerTurn
        });
        
        return { applied: true, status: 'poison' };
    }
});

// ==================== 控制免疫 ====================
EffectRegistry.register('control_immunity', {
    name: '控制免疫',
    description: '免疫所有控制效果',
    
    getPassiveBonuses(effect) {
        return { controlImmune: true };
    }
});

// ==================== 多段攻击 ====================
EffectRegistry.register('multi_strike', {
    name: '多段攻击',
    description: '攻击时造成多次伤害',
    
    trigger: 'onAttack',
    
    onAttack(effect, context) {
        const strikeCount = effect.effects?.strikeCount || 2;
        const damageMultiplier = effect.effects?.damageMultiplier || 0.5;
        
        return {
            multiStrike: true,
            strikeCount: strikeCount,
            damageMultiplier: damageMultiplier
        };
    }
});

console.log('[EffectRegistry] 战斗效果注册表已加载，共注册 ' + Object.keys(EffectRegistry.effects).length + ' 种效果类型');
