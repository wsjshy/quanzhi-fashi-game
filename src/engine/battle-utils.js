/**
 * 战斗工具函数 - 纯函数计算模块
 * 
 * 从battle.js拆分出的独立纯函数，不依赖BattleSystem状态
 * 包含：元素克制、元素名称、伤害计算等
 */

// 元素克制关系
const STRONG_AGAINST = {
    fire: 'ice',      // 火克冰
    ice: 'wind',      // 冰克风
    wind: 'earth',    // 风克土
    earth: 'thunder', // 土克雷
    thunder: 'water', // 雷克水
    water: 'fire',    // 水克火
    light: 'dark',    // 光克暗
    dark: 'light'     // 暗克光
};

const WEAK_AGAINST = {
    fire: 'water',
    ice: 'fire',
    wind: 'ice',
    earth: 'wind',
    thunder: 'earth',
    water: 'thunder',
    light: 'dark',
    dark: 'light'
};

// 元素中文名
const ELEMENT_NAMES = {
    fire: '火系', ice: '冰系', thunder: '雷系', earth: '土系',
    wind: '风系', water: '水系', light: '光系', dark: '暗影系',
    heal: '治愈系', plant: '植物系', summon: '召唤系'
};

/**
 * 元素克制判断 - 攻击方是否克制防守方
 */
export function isElementStrong(attackElement, defendElement) {
    return STRONG_AGAINST[attackElement] === defendElement;
}

/**
 * 元素被克判断 - 攻击方是否被防守方克制
 */
export function isElementWeak(attackElement, defendElement) {
    return WEAK_AGAINST[attackElement] === defendElement;
}

/**
 * 获取元素中文名
 */
export function getElementName(element) {
    return ELEMENT_NAMES[element] || element;
}

/**
 * 计算元素克制倍率
 * @returns {number} 1.5(克制) / 0.75(被克) / 1.0(普通)
 */
export function getElementMultiplier(attackElement, defendElement) {
    if (isElementStrong(attackElement, defendElement)) return 1.5;
    if (isElementWeak(attackElement, defendElement)) return 0.75;
    return 1.0;
}

// 导出所有工具函数的集合
export const BattleUtils = {
    isElementStrong,
    isElementWeak,
    getElementName,
    getElementMultiplier,
    STRONG_AGAINST,
    WEAK_AGAINST,
    ELEMENT_NAMES
};

export default BattleUtils;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleUtils = BattleUtils;
    window.isElementStrong = isElementStrong;
    window.isElementWeak = isElementWeak;
    window.getElementName = getElementName;
}
