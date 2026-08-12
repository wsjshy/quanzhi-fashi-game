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

console.log('[EffectRegistry] 战斗效果注册表已加载，基础效果已注册');
