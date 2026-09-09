/**
 * 战斗视觉反馈系统
 * 
 * v3.2.1 战斗体验与趣味性强化
 * 集中管理战斗中的视觉反馈效果：受击抖动、震屏、元素闪光、暴击特效
 * 
 * 设计原则：
 * 1. 所有视觉效果集中管理，避免散落在各模块中
 * 2. 效果强度与伤害量级匹配（普通伤害轻反馈，暴击/高阶重反馈）
 * 3. 不影响战斗逻辑，纯视觉层
 */

// 元素颜色映射（与ui-battle.js保持一致）
const ELEMENT_COLORS = {
    fire: '#ff6644',
    ice: '#66aaff',
    thunder: '#ffdd44',
    wind: '#88ffcc',
    earth: '#aa8844',
    water: '#66bbff',
    light: '#ffffcc',
    dark: '#aa66ff',
    heal: '#66ffaa',
    plant: '#66dd44',
    summon: '#cc9966',
    neutral: '#ffffff'
};

// 确保样式只注入一次
let stylesInjected = false;

function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    
    const style = document.createElement('style');
    style.id = 'battle-visual-feedback-styles';
    style.textContent = `
        /* 受击抖动 */
        @keyframes battleHitShake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-8px) rotate(-2deg); }
            30% { transform: translateX(7px) rotate(1deg); }
            45% { transform: translateX(-5px); }
            60% { transform: translateX(4px); }
            75% { transform: translateX(-2px); }
        }
        .battle-hit-shake {
            animation: battleHitShake 0.4s ease-out;
        }
        
        /* 受击闪白 */
        @keyframes battleHitFlash {
            0%, 100% { filter: brightness(1); }
            30% { filter: brightness(2.5) saturate(0.5); }
            50% { filter: brightness(1.8); }
        }
        .battle-hit-flash {
            animation: battleHitFlash 0.3s ease-out;
        }
        
        /* 攻击前冲（玩家） */
        @keyframes battleAttackLunge {
            0% { transform: translateX(0); }
            40% { transform: translateX(25px) scale(1.08); }
            100% { transform: translateX(0); }
        }
        .battle-attack-lunge {
            animation: battleAttackLunge 0.35s ease-out;
        }
        
        /* 攻击前冲（敌人，方向相反） */
        @keyframes battleAttackLungeLeft {
            0% { transform: translateX(0); }
            40% { transform: translateX(-25px) scale(1.08); }
            100% { transform: translateX(0); }
        }
        .battle-attack-lunge-left {
            animation: battleAttackLungeLeft 0.35s ease-out;
        }
        
        /* 施法蓄力 */
        @keyframes battleCastPulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.1); filter: brightness(1.5); }
        }
        .battle-cast-pulse {
            animation: battleCastPulse 0.5s ease-in-out;
        }
        
        /* 暴击数字弹跳 */
        @keyframes critPop {
            0% { transform: translateX(-50%) scale(0.3) rotate(-15deg); opacity: 0; }
            20% { transform: translateX(-50%) scale(1.6) rotate(5deg); opacity: 1; }
            35% { transform: translateX(-50%) scale(1.3) rotate(-3deg); }
            50% { transform: translateX(-50%) scale(1.45) rotate(2deg); }
            100% { transform: translateX(-50%) translateY(-90px) scale(1.1) rotate(0deg); opacity: 0; }
        }
        
        /* 全屏元素闪光 */
        @keyframes elementFlashOverlay {
            0% { opacity: 0; }
            20% { opacity: 1; }
            100% { opacity: 0; }
        }
        
        /* 震屏（通过game-container的transform实现） */
        .battle-screen-shake {
            animation: battleScreenShake 0.3s ease-out;
        }
        @keyframes battleScreenShake {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-6px, 4px); }
            20% { transform: translate(7px, -5px); }
            30% { transform: translate(-5px, -3px); }
            40% { transform: translate(6px, 5px); }
            50% { transform: translate(-4px, 2px); }
            60% { transform: translate(3px, -4px); }
            70% { transform: translate(-2px, 1px); }
            80% { transform: translate(1px, -1px); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 受击抖动+闪白效果
 * @param {string} target - 'player' 或 'enemy'
 * @param {number} intensity - 强度 1-3（1普通，2较重，3暴击/重击）
 */
export function playHitEffect(target, intensity = 1) {
    if (typeof document === 'undefined') return;
    injectStyles();
    
    const spriteId = target === 'player' ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;
    
    // 移除已有动画类以重启动画
    sprite.classList.remove('battle-hit-shake', 'battle-hit-flash');
    void sprite.offsetWidth; // 强制重排
    
    // 抖动
    sprite.classList.add('battle-hit-shake');
    
    // 高强度时加闪白
    if (intensity >= 2) {
        sprite.classList.add('battle-hit-flash');
    }
    
    // 动画结束后清理
    setTimeout(() => {
        sprite.classList.remove('battle-hit-shake', 'battle-hit-flash');
    }, 500);
}

/**
 * 攻击前冲效果
 * @param {string} attacker - 'player' 或 'enemy'
 */
export function playAttackLunge(attacker) {
    if (typeof document === 'undefined') return;
    injectStyles();
    
    const spriteId = attacker === 'player' ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;
    
    const animClass = attacker === 'player' ? 'battle-attack-lunge' : 'battle-attack-lunge-left';
    sprite.classList.remove(animClass);
    void sprite.offsetWidth;
    sprite.classList.add(animClass);
    
    setTimeout(() => sprite.classList.remove(animClass), 400);
}

/**
 * 施法蓄力效果
 * @param {string} caster - 'player' 或 'enemy'
 */
export function playCastPulse(caster) {
    if (typeof document === 'undefined') return;
    injectStyles();
    
    const spriteId = caster === 'player' ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;
    
    sprite.classList.remove('battle-cast-pulse');
    void sprite.offsetWidth;
    sprite.classList.add('battle-cast-pulse');
    
    setTimeout(() => sprite.classList.remove('battle-cast-pulse'), 550);
}

/**
 * 震屏效果
 * @param {number} intensity - 强度 1-5（1轻微，3普通，5剧烈）
 * @param {number} duration - 持续时间毫秒
 */
export function playScreenShake(intensity = 3, duration = 300) {
    if (typeof document === 'undefined') return;
    injectStyles();
    
    const container = document.getElementById('game-container') || document.body;
    
    // 使用JS逐帧震动，强度可控
    const shakes = Math.floor(duration / 30);
    let count = 0;
    const originalTransform = container.style.transform;
    
    const shake = () => {
        if (count >= shakes) {
            container.style.transform = originalTransform;
            return;
        }
        const x = (Math.random() - 0.5) * intensity * 3;
        const y = (Math.random() - 0.5) * intensity * 3;
        container.style.transform = `translate(${x}px, ${y}px)`;
        count++;
        setTimeout(shake, 30);
    };
    shake();
}

/**
 * 元素系全屏闪光
 * @param {string} element - 元素系别（fire/ice/thunder等）
 * @param {string} tier - 魔法阶级（初阶/中阶/高阶），决定闪光强度
 */
export function playElementFlash(element = 'neutral', tier = '初阶') {
    if (typeof document === 'undefined') return;
    injectStyles();
    
    const color = ELEMENT_COLORS[element] || ELEMENT_COLORS.neutral;
    
    // 不同阶级的闪光强度
    const opacityMap = {
        '初阶': 0.25,
        '中阶': 0.4,
        '高阶': 0.6,
        '超阶': 0.75
    };
    const maxOpacity = opacityMap[tier] || 0.3;
    
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: radial-gradient(circle at center, ${color}${Math.floor(maxOpacity * 255).toString(16).padStart(2, '0')} 0%, ${color}${Math.floor(maxOpacity * 0.4 * 255).toString(16).padStart(2, '0')} 40%, transparent 70%);
        z-index: 9997;
        pointer-events: none;
        animation: elementFlashOverlay 0.5s ease-out forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
}

/**
 * 暴击综合特效（震屏+红色闪光+受击重击）
 * @param {string} target - 被暴击目标 'player' 或 'enemy'
 */
export function playCritEffect(target = 'enemy') {
    if (typeof document === 'undefined') return;
    
    // 震屏
    playScreenShake(4, 250);
    
    // 红色闪光
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: radial-gradient(circle at center, rgba(255,50,50,0.35) 0%, rgba(255,50,50,0.15) 40%, transparent 70%);
        z-index: 9998;
        pointer-events: none;
        animation: elementFlashOverlay 0.4s ease-out forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
    
    // 受击重击效果
    playHitEffect(target, 3);
}

/**
 * 治疗特效（绿色柔光+角色呼吸）
 * @param {string} target - 'player' 或 'enemy'
 */
export function playHealEffect(target = 'player') {
    if (typeof document === 'undefined') return;
    injectStyles();
    
    const spriteId = target === 'player' ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;
    
    // 绿色闪光
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        width: 120px; height: 120px;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(100,255,100,0.4) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 50;
        animation: elementFlashOverlay 0.6s ease-out forwards;
    `;
    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) {
        battleScreen.appendChild(flash);
        setTimeout(() => flash.remove(), 700);
    }
}

// 导出模块集合
export const BattleVisualFeedback = {
    playHitEffect,
    playAttackLunge,
    playCastPulse,
    playScreenShake,
    playElementFlash,
    playCritEffect,
    playHealEffect,
    ELEMENT_COLORS
};

export default BattleVisualFeedback;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleVisualFeedback = BattleVisualFeedback;
}
