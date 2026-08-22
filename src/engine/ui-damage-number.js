/**
 * UI系统 - 伤害数字模块
 * 
 * 从ui.js拆分出的独立伤害数字模块
 * 包含：显示浮动伤害数字（showDamageNumber）
 */

export function showDamageNumber(amount, type, isPlayer) {
        const battleScreen = document.getElementById('battle-screen');
        if (!battleScreen) return;
        
        const isPortrait = UI.isPortrait();
        
        // 闪避/免疫特殊处理
        if (type === 'dodge' || type === 'miss') {
            const dodgeEl = document.createElement('div');
            dodgeEl.textContent = type === 'dodge' ? '闪避！' : '未命中';
            dodgeEl.style.cssText = `
                position: absolute;
                ${isPlayer ? (isPortrait ? 'left:50%;' : 'left:20%;') : (isPortrait ? 'left:50%;' : 'right:20%;')}
                ${isPortrait ? (isPlayer ? 'bottom:30%;' : 'top:24%;') : 'bottom:45%;'}
                font-size: ${isPortrait ? '20px' : '24px'};
                font-weight: bold;
                color: #aaaaaa;
                text-shadow: 0 0 8px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8);
                pointer-events: none;
                z-index: 100;
                transform: translateX(-50%);
                animation: dodgeFloat 1.2s ease-out forwards;
            `;
            if (!document.getElementById('dodge-number-style')) {
                const style = document.createElement('style');
                style.id = 'dodge-number-style';
                style.textContent = `
                    @keyframes dodgeFloat {
                        0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
                        30% { opacity: 1; transform: translateX(-50%) scale(1.1); }
                        100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            battleScreen.appendChild(dodgeEl);
            setTimeout(() => dodgeEl.remove(), 1200);
            return;
        }
        
        // 创建伤害数字元素
        const damageEl = document.createElement('div');
        
        const colors = {
            normal: '#ffffff',
            crit: '#ffdd44',
            magic: '#ffcc66',
            counter: '#ff6644',
            weakness: '#ff44ff',
            heal: '#66ff66',
            real: '#ff88ff'
        };
        const color = colors[type] || colors.normal;
        
        let prefix = '';
        if (type === 'crit') prefix = '💥';
        if (type === 'counter') prefix = '⚡';
        if (type === 'weakness') prefix = '✨';
        if (type === 'heal') prefix = '💚';
        if (type === 'real') prefix = '💎';
        
        const fontSize = type === 'crit' ? (isPortrait ? '32px' : '36px') : (isPortrait ? '22px' : '28px');
        
        damageEl.textContent = prefix + (type === 'heal' ? '+' : '-') + amount;
        damageEl.style.cssText = `
            position: absolute;
            ${isPlayer ? (isPortrait ? 'left:50%;' : 'left:20%;') : (isPortrait ? 'left:50%;' : 'right:20%;')}
            ${isPortrait ? (isPlayer ? 'bottom:28%;' : 'top:22%;') : 'bottom:45%;'}
            font-size: ${fontSize};
            font-weight: bold;
            color: ${color};
            text-shadow: 0 0 12px ${color}, 0 2px 4px rgba(0,0,0,0.9);
            pointer-events: none;
            z-index: 100;
            transform: translateX(-50%);
            animation: ${type === 'crit' ? 'critFloat' : 'damageFloat'} 1.5s ease-out forwards;
        `;
        
        if (!document.getElementById('damage-number-style')) {
            const style = document.createElement('style');
            style.id = 'damage-number-style';
            style.textContent = `
                @keyframes damageFloat {
                    0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
                    20% { opacity: 1; transform: translateX(-50%) translateY(-15px) scale(1.1); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-70px) scale(1); }
                }
                @keyframes critFloat {
                    0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.3) rotate(-10deg); }
                    15% { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1.5) rotate(5deg); }
                    30% { transform: translateX(-50%) translateY(-20px) scale(1.3) rotate(-3deg); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-80px) scale(1.1) rotate(0deg); }
                }
                @keyframes hitShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }
                @keyframes hitFlash {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(2) sepia(1) hue-rotate(-50deg) saturate(5); }
                }
                @keyframes attackLunge {
                    0% { transform: translateX(0); }
                    40% { transform: translateX(30px) scale(1.05); }
                    100% { transform: translateX(0); }
                }
                @keyframes attackLungeLeft {
                    0% { transform: translateX(0); }
                    40% { transform: translateX(-30px) scale(1.05); }
                    100% { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        battleScreen.appendChild(damageEl);
        setTimeout(() => damageEl.remove(), 1500);
    }


// 导出模块集合
export const UIDamageNumber = {
    showDamageNumber
};

export default UIDamageNumber;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIDamageNumber = UIDamageNumber;
}