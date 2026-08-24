/**
 * 战斗动画系统
 * 
 * v3.3.0 美术资源管理体系
 * 提供战斗角色动画、技能特效、伤害数字等视觉反馈
 * 
 * 包含：
 * - 角色动画状态机（idle/attack/hurt/cast/dead/victory）
 * - 技能释放特效（全屏闪光+粒子）
 * - 伤害数字飘字
 * - 元素光环效果
 */

// 动画状态枚举
const AnimationState = {
    IDLE: 'idle',
    ATTACK: 'attack',
    ATTACK_ENEMY: 'attack-enemy',
    HURT: 'hurt',
    CAST: 'cast',
    DEAD: 'dead',
    VICTORY: 'victory',
};

// 元素颜色映射
const ELEMENT_COLORS = {
    fire: '#ff4400',
    ice: '#00aaff',
    thunder: '#aa00ff',
    water: '#0066ff',
    wind: '#00ff88',
    earth: '#aa8800',
    light: '#ffdd00',
    dark: '#660066',
    summon: '#00aaaa',
    space: '#8800aa',
    chaos: '#444444',
    plant: '#228822',
    heal: '#00aa88',
};

/**
 * 播放角色动画
 * @param {HTMLElement} element - 角色元素
 * @param {string} animationType - 动画类型（idle/attack/hurt/cast/dead/victory）
 * @param {number} duration - 动画持续时间（毫秒），默认自动
 */
export function playCharacterAnimation(element, animationType, duration = null) {
    if (!element) return;

    // 移除所有动画类
    element.classList.remove(
        'battle-idle',
        'battle-attack',
        'battle-attack-enemy',
        'battle-hurt',
        'battle-cast',
        'battle-dead',
        'battle-victory'
    );

    // 强制重排以重启动画
    void element.offsetWidth;

    // 添加新动画类
    const animClass = `battle-${animationType}`;
    element.classList.add(animClass);

    // 非循环动画结束后恢复idle
    if (animationType !== 'idle' && animationType !== 'dead') {
        const animDuration = duration || getAnimationDuration(animationType);
        setTimeout(() => {
            if (element && element.classList.contains(animClass)) {
                element.classList.remove(animClass);
                element.classList.add('battle-idle');
            }
        }, animDuration);
    }
}

/**
 * 获取动画持续时间
 * @param {string} animationType - 动画类型
 * @returns {number} 持续时间（毫秒）
 */
function getAnimationDuration(animationType) {
    const durations = {
        attack: 600,
        'attack-enemy': 600,
        hurt: 500,
        cast: 800,
        victory: 1000,
        dead: 1000,
    };
    return durations[animationType] || 500;
}

/**
 * 播放技能释放特效
 * @param {string} element - 元素类型
 * @param {HTMLElement} container - 容器元素（默认document.body）
 */
export function playSkillEffect(element = 'fire', container = null) {
    const target = container || document.body;
    const color = ELEMENT_COLORS[element] || ELEMENT_COLORS.fire;

    // 全屏闪光
    const flash = document.createElement('div');
    flash.className = 'skill-flash';
    flash.style.background = `radial-gradient(circle at center, ${color}88 0%, ${color}44 50%, transparent 100%)`;
    target.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    // 粒子效果
    createParticles(target, color, 20);
}

/**
 * 创建粒子效果
 * @param {HTMLElement} container - 容器
 * @param {string} color - 粒子颜色
 * @param {number} count - 粒子数量
 */
export function createParticles(container, color, count = 15) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'battle-particles';
    container.appendChild(particlesContainer);

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 8 + 4;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 60;
        const endY = startY + (Math.random() - 0.5) * 60;
        const duration = Math.random() * 0.5 + 0.5;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${startX}%;
            top: ${startY}%;
            background: ${color};
            box-shadow: 0 0 ${size * 2}px ${color};
            animation: particleFloat ${duration}s ease-out forwards;
            --endX: ${endX - startX}%;
            --endY: ${endY - startY}%;
        `;
        particlesContainer.appendChild(particle);
    }

    setTimeout(() => particlesContainer.remove(), 1200);
}

/**
 * 显示伤害数字
 * @param {HTMLElement} targetElement - 目标元素（在其上方显示）
 * @param {number} damage - 伤害值
 * @param {Object} options - 选项 {isCrit, isHeal, isMiss, element}
 */
export function showDamageNumber(targetElement, damage, options = {}) {
    if (!targetElement) return;

    const { isCrit = false, isHeal = false, isMiss = false, element = 'fire' } = options;
    const color = isHeal ? '#44ff44' : (isCrit ? '#ff4444' : (ELEMENT_COLORS[element] || '#ffffff'));

    const damageEl = document.createElement('div');
    damageEl.className = 'damage-float';
    if (isCrit) damageEl.classList.add('damage-crit');
    if (isHeal) damageEl.classList.add('damage-heal');
    if (isMiss) damageEl.classList.add('damage-miss');

    damageEl.style.color = color;
    damageEl.textContent = isMiss ? '闪避' : (isHeal ? `+${damage}` : `-${damage}`);

    // 定位到目标元素上方
    const rect = targetElement.getBoundingClientRect();
    const containerRect = targetElement.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
    damageEl.style.left = `${rect.left - containerRect.left + rect.width / 2 - 20}px`;
    damageEl.style.top = `${rect.top - containerRect.top - 20}px`;

    targetElement.parentElement?.appendChild(damageEl);
    setTimeout(() => damageEl.remove(), 1200);
}

/**
 * 播放元素光环效果
 * @param {HTMLElement} element - 目标元素
 * @param {string} elementType - 元素类型
 * @param {number} duration - 持续时间（毫秒），0为永久
 */
export function playElementAura(element, elementType = 'fire', duration = 0) {
    if (!element) return;
    const color = ELEMENT_COLORS[elementType] || ELEMENT_COLORS.fire;
    element.style.color = color;
    element.classList.add('element-aura');
    if (duration > 0) {
        setTimeout(() => {
            element.classList.remove('element-aura');
            element.style.color = '';
        }, duration);
    }
}

/**
 * 屏幕震动效果
 * @param {number} intensity - 强度（1-10）
 * @param {number} duration - 持续时间（毫秒）
 */
export function screenShake(intensity = 5, duration = 300) {
    const container = document.getElementById('game-container') || document.body;
    const originalTransform = container.style.transform;
    const shakes = Math.floor(duration / 30);
    let count = 0;

    const shake = () => {
        if (count >= shakes) {
            container.style.transform = originalTransform;
            return;
        }
        const x = (Math.random() - 0.5) * intensity * 2;
        const y = (Math.random() - 0.5) * intensity * 2;
        container.style.transform = `translate(${x}px, ${y}px)`;
        count++;
        setTimeout(shake, 30);
    };
    shake();
}

/**
 * 战斗动画便捷方法：玩家攻击
 */
export function playerAttack(playerElement, enemyElement, damage, options = {}) {
    playCharacterAnimation(playerElement, 'attack');
    setTimeout(() => {
        playCharacterAnimation(enemyElement, 'hurt');
        showDamageNumber(enemyElement, damage, options);
        if (options.isCrit) screenShake(8, 200);
    }, 250);
}

/**
 * 战斗动画便捷方法：敌人攻击
 */
export function enemyAttack(enemyElement, playerElement, damage, options = {}) {
    playCharacterAnimation(enemyElement, 'attack-enemy');
    setTimeout(() => {
        playCharacterAnimation(playerElement, 'hurt');
        showDamageNumber(playerElement, damage, options);
        if (options.isCrit) screenShake(8, 200);
    }, 250);
}

/**
 * 战斗动画便捷方法：玩家施法
 */
export function playerCast(playerElement, enemyElement, damage, element = 'fire', options = {}) {
    playCharacterAnimation(playerElement, 'cast');
    playElementAura(playerElement, element, 800);
    setTimeout(() => {
        playSkillEffect(element, document.getElementById('battle-screen') || document.body);
        playCharacterAnimation(enemyElement, 'hurt');
        showDamageNumber(enemyElement, damage, { ...options, element });
        screenShake(6, 250);
    }, 400);
}

// 导出
export { AnimationState, ELEMENT_COLORS };

// 挂载到window（向后兼容）
if (typeof window !== 'undefined') {
    window.BattleAnimation = {
        playCharacterAnimation,
        playSkillEffect,
        createParticles,
        showDamageNumber,
        playElementAura,
        screenShake,
        playerAttack,
        enemyAttack,
        playerCast,
        AnimationState,
        ELEMENT_COLORS,
    };
}
