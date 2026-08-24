/**
 * UI 资源管理模块
 * 
 * v3.3.0 美术资源管理体系
 * 统一管理背景图、占位图、元素色系，图片缺失时自动fallback到CSS渐变
 * 
 * 包含：
 * - 11系魔法色系定义
 * - 背景图获取函数（优先图片，缺失时用CSS渐变）
 * - NPC头像占位图生成
 * - 技能/物品图标占位
 */

// 11系魔法色系配置
const ELEMENT_COLORS = {
    fire: { primary: '#ff4400', secondary: '#ff8800', glow: '#ffaa00', emoji: '🔥', name: '火系' },
    ice: { primary: '#00aaff', secondary: '#88ddff', glow: '#aaeeff', emoji: '❄️', name: '冰系' },
    thunder: { primary: '#aa00ff', secondary: '#cc44ff', glow: '#dd88ff', emoji: '⚡', name: '雷系' },
    water: { primary: '#0066ff', secondary: '#4488ff', glow: '#66aaff', emoji: '💧', name: '水系' },
    wind: { primary: '#00ff88', secondary: '#44ffaa', glow: '#88ffcc', emoji: '🌪️', name: '风系' },
    earth: { primary: '#aa8800', secondary: '#ccaa44', glow: '#ddcc88', emoji: '🪨', name: '土系' },
    light: { primary: '#ffdd00', secondary: '#ffee88', glow: '#ffffaa', emoji: '✨', name: '光系' },
    dark: { primary: '#660066', secondary: '#880088', glow: '#aa44aa', emoji: '🌑', name: '暗系' },
    summon: { primary: '#00aaaa', secondary: '#44cccc', glow: '#88dddd', emoji: '🐺', name: '召唤系' },
    space: { primary: '#8800aa', secondary: '#aa44cc', glow: '#cc88ee', emoji: '🌀', name: '空间系' },
    chaos: { primary: '#444444', secondary: '#666666', glow: '#888888', emoji: '💀', name: '混沌系' },
    plant: { primary: '#228822', secondary: '#44aa44', glow: '#66cc66', emoji: '🌿', name: '植物系' },
    heal: { primary: '#00aa88', secondary: '#44ccaa', glow: '#88eecc', emoji: '💚', name: '治愈系' },
};

// 地点背景配置
const LOCATION_BACKGROUNDS = {
    tianlan_school: { gradient: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a5a 50%, #0a1a2a 100%)', image: 'assets/images/backgrounds/tianlan_school.webp' },
    bo_city: { gradient: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a2a 100%)', image: 'assets/images/backgrounds/bo_city_view.webp' },
    xuefeng: { gradient: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a5a 30%, #2a5a8a 60%, #0a1a2a 100%)', image: 'assets/images/battle-bg/xuefeng.webp' },
    bocheng_disaster: { gradient: 'linear-gradient(135deg, #2a0a0a 0%, #5a1a1a 50%, #2a0a0a 100%)', image: 'assets/images/battle-bg/bocheng_disaster.webp' },
    disheng_spring: { gradient: 'linear-gradient(135deg, #0a2a1a 0%, #1a5a3a 50%, #0a2a1a 100%)', image: 'assets/images/backgrounds/disheng_spring.webp' },
    street: { gradient: 'linear-gradient(135deg, #1a1a2a 0%, #2a2a4a 50%, #1a1a2a 100%)', image: 'assets/images/backgrounds/street.webp' },
    library: { gradient: 'linear-gradient(135deg, #2a1a0a 0%, #4a3a1a 50%, #2a1a0a 100%)', image: 'assets/images/backgrounds/library.webp' },
    shop: { gradient: 'linear-gradient(135deg, #2a2a0a 0%, #4a4a1a 50%, #2a2a0a 100%)', image: 'assets/images/backgrounds/shop.webp' },
    mountain: { gradient: 'linear-gradient(135deg, #1a2a1a 0%, #2a4a2a 50%, #1a2a1a 100%)', image: 'assets/images/backgrounds/mountain.webp' },
};

/**
 * 获取元素色系配置
 * @param {string} element - 元素类型
 * @returns {Object} 色系配置 {primary, secondary, glow, emoji, name}
 */
export function getElementColor(element) {
    return ELEMENT_COLORS[element] || ELEMENT_COLORS.dark;
}

/**
 * 获取元素emoji
 * @param {string} element - 元素类型
 * @returns {string} emoji
 */
export function getElementEmoji(element) {
    return getElementColor(element).emoji;
}

/**
 * 获取元素名称
 * @param {string} element - 元素类型
 * @returns {string} 中文名称
 */
export function getElementName(element) {
    return getElementColor(element).name;
}

/**
 * 获取魔法特效背景样式（优先图片，缺失时用CSS渐变）
 * 当前图片全部缺失，直接返回CSS渐变
 * @param {string} element - 元素类型
 * @param {number} opacity - 背景透明度（0-1）
 * @returns {string} CSS background样式
 */
export function getMagicBackground(element, opacity = 1) {
    const color = getElementColor(element);
    // 使用CSS渐变作为背景（当前图片缺失，后续有图片可改为优先图片）
    const gradient = `linear-gradient(135deg, ${adjustColor(color.primary, -60)} 0%, ${adjustColor(color.primary, -30)} 30%, ${color.primary} 60%, ${adjustColor(color.primary, -60)} 100%)`;
    return `background: ${gradient}; opacity: ${opacity};`;
}

/**
 * 获取战斗背景样式
 * @param {string} element - 敌人元素类型
 * @returns {string} CSS background样式
 */
export function getBattleBackground(element) {
    return getMagicBackground(element, 0.35);
}

/**
 * 获取地点背景样式
 * @param {string} locationId - 地点ID
 * @param {number} opacity - 透明度
 * @returns {string} CSS background样式
 */
export function getLocationBackground(locationId, opacity = 1) {
    const loc = LOCATION_BACKGROUNDS[locationId];
    if (loc) {
        return `background: ${loc.gradient}; opacity: ${opacity};`;
    }
    // 默认博城背景
    return `background: ${LOCATION_BACKGROUNDS.bo_city.gradient}; opacity: ${opacity};`;
}

/**
 * 获取NPC头像占位HTML
 * @param {Object} npc - NPC数据
 * @param {string} size - 尺寸（small/medium/large）
 * @returns {string} HTML字符串
 */
export function getNpcAvatarPlaceholder(npc, size = 'medium') {
    const element = npc.elements?.[0] || 'dark';
    const color = getElementColor(element);
    const sizeMap = {
        small: 'width: 40px; height: 40px; font-size: 1.2em;',
        medium: 'width: 60px; height: 60px; font-size: 1.8em;',
        large: 'width: 100px; height: 100px; font-size: 2.5em;',
    };
    const initial = npc.name?.charAt(0) || '?';
    return `
        <div class="npc-avatar-placeholder" style="
            ${sizeMap[size] || sizeMap.medium}
            background: linear-gradient(135deg, ${adjustColor(color.primary, -40)}, ${adjustColor(color.primary, -20)});
            border: 2px solid ${color.secondary};
            box-shadow: 0 0 10px ${color.glow}40;
        ">
            <span style="color: ${color.glow};">${color.emoji}</span>
        </div>
    `;
}

/**
 * 获取技能图标占位HTML
 * @param {Object} skill - 技能数据
 * @param {string} size - 尺寸
 * @returns {string} HTML字符串
 */
export function getSkillIconPlaceholder(skill, size = 'medium') {
    const element = skill.element || 'dark';
    const color = getElementColor(element);
    const sizeMap = {
        small: 'width: 32px; height: 32px; font-size: 1em;',
        medium: 'width: 48px; height: 48px; font-size: 1.5em;',
        large: 'width: 64px; height: 64px; font-size: 2em;',
    };
    return `
        <div style="
            ${sizeMap[size] || sizeMap.medium}
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: linear-gradient(135deg, ${adjustColor(color.primary, -30)}, ${color.primary});
            border: 2px solid ${color.secondary};
            box-shadow: 0 0 8px ${color.glow}30;
        ">
            <span>${color.emoji}</span>
        </div>
    `;
}

/**
 * 获取物品图标占位HTML
 * @param {Object} item - 物品数据
 * @param {string} size - 尺寸
 * @returns {string} HTML字符串
 */
export function getItemIconPlaceholder(item, size = 'medium') {
    const rarity = item.rarity || 'common';
    const rarityColors = {
        common: { primary: '#666666', secondary: '#888888', glow: '#aaaaaa' },
        uncommon: { primary: '#228822', secondary: '#44aa44', glow: '#66cc66' },
        rare: { primary: '#2266aa', secondary: '#4488cc', glow: '#66aaee' },
        epic: { primary: '#8844aa', secondary: '#aa66cc', glow: '#cc88ee' },
        legendary: { primary: '#aa8800', secondary: '#ccaa44', glow: '#eecc66' },
    };
    const color = rarityColors[rarity] || rarityColors.common;
    const emoji = item.icon || '📦';
    const sizeMap = {
        small: 'width: 32px; height: 32px; font-size: 1em;',
        medium: 'width: 48px; height: 48px; font-size: 1.5em;',
        large: 'width: 64px; height: 64px; font-size: 2em;',
    };
    return `
        <div style="
            ${sizeMap[size] || sizeMap.medium}
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: linear-gradient(135deg, ${adjustColor(color.primary, -30)}, ${color.primary});
            border: 2px solid ${color.secondary};
            box-shadow: 0 0 8px ${color.glow}30;
        ">
            <span>${emoji}</span>
        </div>
    `;
}

/**
 * 颜色调整工具（加深/变亮）
 * @param {string} hex - 十六进制颜色
 * @param {number} amount - 调整量（负数加深，正数变亮）
 * @returns {string} 调整后的颜色
 */
function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * 获取元素色系CSS变量样式（用于内联style设置--element-glow等）
 * @param {string} element - 元素类型
 * @returns {string} CSS变量样式字符串
 */
export function getElementCssVars(element) {
    const color = getElementColor(element);
    return `--element-primary: ${color.primary}; --element-secondary: ${color.secondary}; --element-glow: ${color.glow};`;
}

/**
 * 检查图片是否存在（异步）
 * @param {string} url - 图片URL
 * @returns {Promise<boolean>} 是否存在
 */
export function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// 导出所有配置
export { ELEMENT_COLORS, LOCATION_BACKGROUNDS };

// 挂载到window（向后兼容）
if (typeof window !== 'undefined') {
    window.UIAssets = {
        getElementColor,
        getElementEmoji,
        getElementName,
        getMagicBackground,
        getBattleBackground,
        getLocationBackground,
        getNpcAvatarPlaceholder,
        getSkillIconPlaceholder,
        getItemIconPlaceholder,
        getElementCssVars,
        checkImageExists,
        ELEMENT_COLORS,
        LOCATION_BACKGROUNDS,
    };
}
