/**
 * v3.6.0: 元素反应系统
 * 独立模块，从battle.js中提取，便于扩展和维护
 */

// 元素反应配置表
export const ELEMENT_REACTIONS = {
    // 感电：雷 + 水(湿润)
    electrified: {
        name: '感电',
        icon: '⚡',
        color: '#ffff66',
        damageMultiplier: 1.0,
        trigger: (newEffect, targetEffects) => {
            const isThunder = newEffect.element === 'thunder' || newEffect.type === 'paralysis';
            const hasWet = targetEffects.some(e => e.type === 'wet');
            return isThunder && hasWet;
        },
        apply: (target, newEffect) => {
            const wet = target.statusEffects.find(e => e.type === 'wet');
            if (wet) {
                wet.type = 'electrified';
                wet.name = '感电';
                wet.dotDamage = (wet.dotDamage || 0) + 15;
                wet.duration = Math.max(wet.duration, 2);
            }
            return '全身通电，持续受到伤害！';
        }
    },
    // 融化：火 + 冰(冻结)
    melt: {
        name: '融化',
        icon: '🔥',
        color: '#ff8844',
        damageMultiplier: 1.5,
        trigger: (newEffect, targetEffects) => {
            const isFire = (newEffect.type === 'burn' || newEffect.element === 'fire') && newEffect.type !== 'freeze';
            const hasFrozen = targetEffects.some(e => e.type === 'frozen');
            return isFire && hasFrozen;
        },
        apply: (target, newEffect) => {
            target.statusEffects = target.statusEffects.filter(e => e.type !== 'frozen');
            target._meltBonus = 1.5;
            return '冻结被解除，火系伤害提升！';
        }
    },
    // 蒸汽：火 + 水(湿润)
    steam: {
        name: '蒸汽',
        icon: '💨',
        color: '#aaddff',
        damageMultiplier: 0.8,
        trigger: (newEffect, targetEffects) => {
            const isFire = (newEffect.type === 'burn' || newEffect.element === 'fire') && newEffect.type !== 'wet';
            const hasWet = targetEffects.some(e => e.type === 'wet');
            return isFire && hasWet;
        },
        apply: (target, newEffect) => {
            target.statusEffects = target.statusEffects.filter(e => e.type !== 'wet');
            target.statusEffects.push({ type: 'steam', name: '蒸汽', duration: 2, hitRateMod: -0.3 });
            return '被蒸汽笼罩，命中率降低！';
        }
    },
    // 泥泞：土 + 水(湿润)
    mud: {
        name: '泥泞',
        icon: '🪨',
        color: '#aa8855',
        damageMultiplier: 0.6,
        trigger: (newEffect, targetEffects) => {
            const isEarth = newEffect.element === 'earth' || newEffect.type === 'mud';
            const hasWet = targetEffects.some(e => e.type === 'wet');
            return isEarth && hasWet;
        },
        apply: (target, newEffect) => {
            const wet = target.statusEffects.find(e => e.type === 'wet');
            if (wet) {
                wet.type = 'mud';
                wet.name = '泥泞';
                wet.speedMod = -0.5;
                wet.duration = Math.max(wet.duration, 2);
            }
            return '陷入泥泞，速度大减！';
        }
    },
    // 超导：冰 + 雷(麻痹)
    superconduct: {
        name: '超导',
        icon: '❄️',
        color: '#88ddff',
        damageMultiplier: 1.2,
        trigger: (newEffect, targetEffects) => {
            const isIce = newEffect.element === 'ice' || newEffect.type === 'freeze' || newEffect.type === 'frozen';
            const hasParalysis = targetEffects.some(e => e.type === 'paralysis' || e.type === 'paralyze');
            return isIce && hasParalysis;
        },
        apply: (target, newEffect) => {
            target.statusEffects.push({ type: 'superconduct', name: '超导', duration: 3, defenseMod: -0.3 });
            return '防御大幅降低！';
        }
    },
    // 静电：雷 + 冰(冻结)
    static_shock: {
        name: '静电',
        icon: '⚡',
        color: '#ccffff',
        damageMultiplier: 1.0,
        trigger: (newEffect, targetEffects) => {
            const isThunder = newEffect.element === 'thunder' || newEffect.type === 'paralysis';
            const hasFrozen = targetEffects.some(e => e.type === 'frozen');
            return isThunder && hasFrozen;
        },
        apply: (target, newEffect) => {
            target.statusEffects = target.statusEffects.filter(e => e.type !== 'frozen');
            target.statusEffects.push({ type: 'paralysis', name: '麻痹', duration: 2, skipTurn: false });
            return '冻结被解除，陷入麻痹！';
        }
    },
    // 爆裂：火 + 土(石化)
    burst: {
        name: '爆裂',
        icon: '💥',
        color: '#ff4444',
        damageMultiplier: 2.0,
        trigger: (newEffect, targetEffects) => {
            const isFire = newEffect.element === 'fire' || newEffect.type === 'burn';
            const hasPetrify = targetEffects.some(e => e.type === 'petrify' || e.type === 'stone');
            return isFire && hasPetrify;
        },
        apply: (target, newEffect) => {
            target.statusEffects = target.statusEffects.filter(e => e.type !== 'petrify' && e.type !== 'stone');
            return '石化爆裂，造成巨额伤害！';
        }
    }
};

// 反应优先级（按伤害倍率降序）
const REACTION_PRIORITY = Object.entries(ELEMENT_REACTIONS)
    .sort((a, b) => b[1].damageMultiplier - a[1].damageMultiplier)
    .map(([key]) => key);

/**
 * 检查并触发元素反应
 * @param {Object} battle - 战斗实例（this）
 * @param {Object} target - 目标对象
 * @param {Object} newEffect - 新施加的效果
 * @param {boolean} isPlayerTarget - 目标是否是玩家
 * @param {Object} caster - 施法者（用于计算反应伤害）
 */
export function checkElementReactions(battle, target, newEffect, isPlayerTarget, caster) {
    const targetName = isPlayerTarget ? '你' : battle.enemy.name;
    const targetEffects = target.statusEffects || [];

    // 按优先级检查可触发的反应
    for (const reactionKey of REACTION_PRIORITY) {
        const reaction = ELEMENT_REACTIONS[reactionKey];
        if (reaction.trigger(newEffect, targetEffects)) {
            // 应用反应效果
            const effectText = reaction.apply(target, newEffect);

            // 计算反应伤害（基于施法者攻击力）
            const casterAttack = caster?.attack || caster?.stats?.attack || 10;
            const reactionDamage = Math.floor(casterAttack * reaction.damageMultiplier);

            // 对目标造成伤害（无视防御）
            if (target.hp !== undefined) {
                target.hp = Math.max(0, target.hp - reactionDamage);
            }

            // 显示伤害数字
            if (battle.showDamageNumber) {
                battle.showDamageNumber(isPlayerTarget ? 'player' : 'enemy', reactionDamage, 'crit');
            }

            // 战斗日志高亮
            if (battle.addLog) {
                battle.addLog(
                    `${reaction.icon} ${reaction.name}反应！${targetName} ${effectText} 反应伤害 -${reactionDamage}`,
                    'magic'
                );
            }

            // 只触发一个反应（最高优先级）
            return reactionKey;
        }
    }

    return null;
}

/**
 * 获取元素反应说明（用于帮助文档）
 */
export function getReactionHelpText() {
    const lines = ['【元素反应表】', ''];
    for (const [key, reaction] of Object.entries(ELEMENT_REACTIONS)) {
        lines.push(`${reaction.icon} ${reaction.name}：伤害倍率 ${reaction.damageMultiplier}x`);
    }
    return lines.join('\n');
}

/**
 * 获取某个状态可以与哪些元素触发反应（用于tooltip提示）
 * @param {string} statusType - 状态类型（如'wet'、'frozen'）
 * @returns {Array} 可触发的反应列表 [{element, reaction}]
 */
export function getReactionsForStatus(statusType) {
    const results = [];
    const elements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water'];

    for (const element of elements) {
        // 模拟该元素的技能效果
        const mockEffect = { element, type: element };
        const mockTargetEffects = [{ type: statusType }];

        for (const [reactionKey, reaction] of Object.entries(ELEMENT_REACTIONS)) {
            if (reaction.trigger(mockEffect, mockTargetEffects)) {
                results.push({
                    element,
                    reactionKey,
                    name: reaction.name,
                    icon: reaction.icon,
                    color: reaction.color
                });
            }
        }
    }

    return results;
}

/**
 * 获取某个元素能与目标当前状态触发哪些反应（用于技能提示）
 * @param {Array} targetEffects - 目标当前状态效果列表
 * @param {string} element - 技能元素
 * @returns {Array} 可触发的反应列表
 */
export function getAvailableReactions(targetEffects, element) {
    if (!targetEffects || targetEffects.length === 0) return [];

    const results = [];
    const mockEffect = { element, type: element };

    for (const [reactionKey, reaction] of Object.entries(ELEMENT_REACTIONS)) {
        if (reaction.trigger(mockEffect, targetEffects)) {
            results.push({
                reactionKey,
                name: reaction.name,
                icon: reaction.icon,
                color: reaction.color,
                damageMultiplier: reaction.damageMultiplier
            });
        }
    }

    return results;
}
