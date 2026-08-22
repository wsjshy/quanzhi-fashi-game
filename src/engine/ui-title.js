/**
 * UI 标题/角色创建界面模块
 * 
 * 从ui.js拆分出的独立界面渲染模块
 * 包含：标题界面、粒子效果、角色创建界面
 */

/**
 * 渲染标题界面
 * 绑定到UI对象调用：UITitle.renderTitleScreen.call(UI, hasSave)
 */
export function renderTitleScreen(hasSave) {
    const container = this.elements.gameContainer;
    
    container.innerHTML = `
        <div class="mobile-title" style="
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: radial-gradient(ellipse at center, #1a1a4a 0%, #0a0a1a 70%);
            position: relative;
            overflow: hidden;
        ">
            <!-- 背景装饰 -->
            <div style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                opacity: 0.15;
                filter: blur(3px);
                pointer-events: none;
            "></div>
            
            <!-- 魔法粒子效果 -->
            <div id="particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
            
            <h1 style="
                font-size: 72px;
                background: linear-gradient(135deg, #ffd700, #ff6b35, #ffd700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
                margin-bottom: 20px;
                letter-spacing: 12px;
                font-weight: bold;
                z-index: 10;
                position: relative;
            ">全职法师</h1>
            
            <div style="
                font-size: 24px;
                color: #8888aa;
                margin-bottom: 80px;
                letter-spacing: 6px;
                z-index: 10;
                position: relative;
            ">魔法觉醒 · 开放世界</div>
            
            <div style="display: flex; flex-direction: column; gap: 15px; z-index: 99998; position: relative;">
                <button onclick="Game.startNewGame()" style="
                    width: 280px;
                    padding: 18px 32px;
                    font-size: 20px;
                    background: linear-gradient(135deg, #2a2a6a, #4a4aaa);
                    border: 2px solid #6666cc;
                    color: #e0e0ff;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    letter-spacing: 4px;
                " onmouseover="this.style.background='linear-gradient(135deg, #3a3a8a, #6a6acc)'; this.style.boxShadow='0 0 25px rgba(100, 100, 255, 0.5)'" onmouseout="this.style.background='linear-gradient(135deg, #2a2a6a, #4a4aaa)'; this.style.boxShadow='none'">
                    🎮 开始新游戏
                </button>
                
                ${hasSave ? `
                <button onclick="Game.continueGame()" style="
                    width: 280px;
                    padding: 18px 32px;
                    font-size: 20px;
                    background: linear-gradient(135deg, #2a4a2a, #4aaa4a);
                    border: 2px solid #66cc66;
                    color: #e0ffe0;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    letter-spacing: 4px;
                " onmouseover="this.style.background='linear-gradient(135deg, #3a6a3a, #66cc66)'; this.style.boxShadow='0 0 25px rgba(100, 255, 100, 0.5)'" onmouseout="this.style.background='linear-gradient(135deg, #2a4a2a, #4aaa4a)'; this.style.boxShadow='none'">
                    💾 继续游戏
                </button>
                ` : ''}
            </div>
            
            <div style="
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-size: 14px;
                color: #555;
            ">v3.0.0 · 架构改造与模块化</div>
        </div>
    `;

    // 创建粒子效果
    this.createParticles();
}

/**
 * 创建魔法粒子效果
 */
export function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        const colors = ['#ffd700', '#ff6b35', '#66ccff', '#9966ff', '#66ff99'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            opacity: 0.6;
            box-shadow: 0 0 ${size * 2}px ${color};
            animation: float ${duration}s ease-in-out ${delay}s infinite;
        `;
        container.appendChild(particle);
    }

    // 添加动画样式
    if (!document.getElementById('particle-style')) {
        const style = document.createElement('style');
        style.id = 'particle-style';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                50% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 导出模块集合
export const UITitle = {
    renderTitleScreen,
    createParticles
};

export default UITitle;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UITitle = UITitle;
}
