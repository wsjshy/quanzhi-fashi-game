/**
 * v3.5.0: 装备词缀配置表
 * 前缀影响主属性，后缀影响特殊属性
 */

export const AFFIX_QUALITIES = {
    normal: { name: '普通', color: '#ffffff', maxAffixes: 0, dropRate: 0.5 },
    fine: { name: '优秀', color: '#66ff66', maxAffixes: 1, dropRate: 0.3 },
    rare: { name: '稀有', color: '#6699ff', maxAffixes: 2, dropRate: 0.15 },
    epic: { name: '史诗', color: '#cc66ff', maxAffixes: 3, dropRate: 0.05 }
};

// 前缀池（影响主属性，数值较大）
export const PREFIX_AFFIXES = [
    { id: 'sharp', name: '锋利的', stat: 'attack', min: 5, max: 15, weight: 10 },
    { id: 'sturdy', name: '坚固的', stat: 'defense', min: 5, max: 15, weight: 10 },
    { id: 'wise', name: '智慧的', stat: 'magic', min: 5, max: 15, weight: 10 },
    { id: 'agile', name: '敏捷的', stat: 'speed', min: 2, max: 5, weight: 8 },
    { id: 'vital', name: '活力的', stat: 'maxHp', min: 20, max: 50, weight: 8 },
    { id: 'energetic', name: '充沛的', stat: 'maxMp', min: 20, max: 50, weight: 8 },
    { id: 'precise', name: '精准的', stat: 'hitRate', min: 0.03, max: 0.08, weight: 6, isPercent: true },
    { id: 'deadly', name: '致命的', stat: 'critRate', min: 0.02, max: 0.05, weight: 5, isPercent: true }
];

// 后缀池（影响特殊属性，数值较小或特殊效果）
export const SUFFIX_AFFIXES = [
    { id: 'crit', name: '之暴击', stat: 'critRate', min: 0.03, max: 0.08, weight: 8, isPercent: true },
    { id: 'penetrate', name: '之穿透', stat: 'defensePenetration', min: 0.05, max: 0.10, weight: 6, isPercent: true },
    { id: 'life', name: '之生命', stat: 'maxHp', min: 30, max: 80, weight: 8 },
    { id: 'mana', name: '之魔力', stat: 'maxMp', min: 30, max: 80, weight: 8 },
    { id: 'lifesteal', name: '之吸血', stat: 'lifesteal', min: 0.02, max: 0.05, weight: 5, isPercent: true },
    { id: 'thorns', name: '之反伤', stat: 'thorns', min: 3, max: 8, weight: 5 },
    { id: 'precision', name: '之精准', stat: 'hitRate', min: 0.05, max: 0.12, weight: 6, isPercent: true },
    { id: 'swift', name: '之迅捷', stat: 'speed', min: 1, max: 3, weight: 6 },
    { id: 'power', name: '之力量', stat: 'attack', min: 3, max: 8, weight: 7 },
    { id: 'fortitude', name: '之坚韧', stat: 'defense', min: 3, max: 8, weight: 7 }
];

/**
 * 随机生成词缀
 * @param {string} quality - 品质（normal/fine/rare/epic）
 * @returns {Array} 词缀列表
 */
export function generateAffixes(quality) {
    const qualityConfig = AFFIX_QUALITIES[quality];
    if (!qualityConfig || qualityConfig.maxAffixes === 0) return [];

    const affixCount = qualityConfig.maxAffixes;
    const affixes = [];
    const usedStats = new Set();

    // 随机选择前缀和后缀
    const allAffixes = [...PREFIX_AFFIXES, ...SUFFIX_AFFIXES];

    for (let i = 0; i < affixCount; i++) {
        // 过滤已使用的属性
        const available = allAffixes.filter(a => !usedStats.has(a.stat));
        if (available.length === 0) break;

        // 按权重随机选择
        const totalWeight = available.reduce((sum, a) => sum + a.weight, 0);
        let rand = Math.random() * totalWeight;
        let selected = available[0];
        for (const affix of available) {
            rand -= affix.weight;
            if (rand <= 0) {
                selected = affix;
                break;
            }
        }

        // 生成随机数值
        const value = selected.min + Math.random() * (selected.max - selected.min);
        const finalValue = selected.isPercent
            ? Math.round(value * 100) / 100
            : Math.floor(value);

        affixes.push({
            id: selected.id,
            name: selected.name,
            stat: selected.stat,
            value: finalValue,
            isPercent: selected.isPercent || false,
            isPrefix: PREFIX_AFFIXES.some(p => p.id === selected.id)
        });

        usedStats.add(selected.stat);
    }

    return affixes;
}

/**
 * 随机决定装备品质
 * @returns {string} 品质
 */
export function rollQuality() {
    const rand = Math.random();
    let cumulative = 0;
    for (const [quality, config] of Object.entries(AFFIX_QUALITIES)) {
        cumulative += config.dropRate;
        if (rand <= cumulative) return quality;
    }
    return 'normal';
}

/**
 * 获取词缀显示文本
 * @param {Object} affix - 词缀
 * @returns {string} 显示文本
 */
export function getAffixDisplay(affix) {
    const statNames = {
        attack: '攻击',
        defense: '防御',
        magic: '魔法',
        speed: '速度',
        maxHp: '最大HP',
        maxMp: '最大MP',
        critRate: '暴击率',
        hitRate: '命中率',
        defensePenetration: '防御穿透',
        lifesteal: '吸血',
        thorns: '反伤'
    };
    const statName = statNames[affix.stat] || affix.stat;
    const valueText = affix.isPercent ? `${(affix.value * 100).toFixed(0)}%` : `+${affix.value}`;
    return `${affix.name}：${statName} ${valueText}`;
}
