/**
 * UI 事件界面模块
 * 
 * 从ui.js拆分出的独立事件界面渲染模块
 * 包含：随机事件界面、大事件结局/剧情/选择阶段界面
 */

/**
 * 渲染随机事件界面
 * 绑定到UI对象调用：UIEvent.renderEventScreen.call(UI, event)
 */
export function renderEventScreen(event) {
    try {
        console.log('[UI] 渲染事件界面:', event.id, event.name);
        
        this.elements.gameContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
                padding: 40px;
                position: relative;
            ">
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.1;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    max-width: 600px;
                    background: rgba(20, 20, 50, 0.95);
                    border: 2px solid #6666aa;
                    border-radius: 15px;
                    padding: 40px;
                    box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 28px; margin-bottom: 20px; text-align: center;">
                        ✨ ${event.name}
                    </h2>
                    
                    <p style="color: #d0d0f0; font-size: 17px; line-height: 1.8; margin-bottom: 30px; text-align: center;">
                        ${event.description}
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${event.choices.map((choice, index) => `
                            <div onclick="Game.selectEventChoice(${index})" style="
                                padding: 15px 25px;
                                background: linear-gradient(135deg, #2a2a5a, #3a3a7a);
                                border: 2px solid #555599;
                                border-radius: 10px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 16px;
                                text-align: left;
                                transition: all 0.3s;
                            " onmouseover="this.style.borderColor='#7777bb'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#555599'; this.style.transform='translateX(0)'">
                                ▶ ${choice.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        console.log('[UI] 事件界面渲染完成');
    } catch (e) {
        console.error('[UI] 渲染事件界面出错:', e);
        console.error('[UI] 错误堆栈:', e.stack);
        this.elements.gameContainer.innerHTML = `
            <div style="padding: 40px; color: #ff6666;">
                <h2>事件渲染出错</h2>
                <p>${e.message}</p>
                <button onclick="Game.closeEvent()" style="margin-top: 20px; padding: 10px 20px;">返回</button>
            </div>
        `;
    }
}

/**
 * 渲染大事件结局界面
 * 绑定到UI对象调用：UIEvent.renderBigEventEnding.call(UI, event, ending)
 */
export function renderBigEventEnding(event, ending) {
    try {
        console.log('[UI] 渲染大事件结局:', ending.name);
        
        // 计算奖励文本
        let rewardText = '';
        if (ending.effects) {
            if (ending.effects.exp) rewardText += `获得 ${ending.effects.exp} 经验\n`;
            if (ending.effects.gold) rewardText += `获得 ${ending.effects.gold} 金币\n`;
            if (ending.effects.items && ending.effects.items.length > 0) {
                rewardText += '获得物品：\n';
                ending.effects.items.forEach(item => {
                    const itemData = DataManager.getItem(item.itemId);
                    rewardText += `  ${itemData?.name || item.itemId} ×${item.count || 1}\n`;
                });
            }
            if (ending.effects.reputation) {
                rewardText += '声望变化：\n';
                for (const [faction, value] of Object.entries(ending.effects.reputation)) {
                    const factionData = DataManager.getFaction(faction);
                    const factionName = factionData?.name || faction;
                    rewardText += `  ${factionName} ${value > 0 ? '+' : ''}${value}\n`;
                }
            }
        }
        
        this.elements.gameContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
                padding: 40px;
                position: relative;
            ">
                <!-- 背景特效 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    background: rgba(20, 20, 50, 0.95);
                    border: 3px solid #ffd700;
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    z-index: 10;
                    box-shadow: 0 0 80px rgba(255, 215, 0, 0.3);
                    text-align: center;
                ">
                    <div style="font-size: 60px; margin-bottom: 20px;">🏆</div>
                    
                    <h2 style="
                        color: #ffd700;
                        font-size: 28px;
                        margin-bottom: 10px;
                        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                    ">${event.name}</h2>
                    
                    <h3 style="
                        color: #ffcc66;
                        font-size: 20px;
                        margin-bottom: 25px;
                    ">结局：${ending.name}</h3>
                    
                    <div style="
                        color: #ddd;
                        font-size: 15px;
                        line-height: 1.8;
                        margin-bottom: 25px;
                        text-align: left;
                        white-space: pre-wrap;
                    ">${ending.description}</div>
                    
                    ${rewardText ? `
                        <div style="
                            background: rgba(0, 0, 0, 0.3);
                            border: 1px solid #6666aa;
                            border-radius: 10px;
                            padding: 15px;
                            margin-bottom: 25px;
                            text-align: left;
                        ">
                            <div style="color: #ffd700; font-size: 14px; margin-bottom: 10px; font-weight: bold;">🎁 获得奖励</div>
                            <div style="color: #aaffaa; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${rewardText}</div>
                        </div>
                    ` : ''}
                    
                    <div onclick="Game.closeBigEventEnding()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #6666aa, #8888cc);
                        border: 2px solid #9999dd;
                        border-radius: 10px;
                        color: #fff;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        display: inline-block;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='linear-gradient(135deg, #7777bb, #9999dd)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='linear-gradient(135deg, #6666aa, #8888cc)'; this.style.transform='scale(1)'">
                        继续游戏
                    </div>
                </div>
            </div>
        `;
        
    } catch (e) {
        console.error('[UI] 渲染大事件结局失败:', e);
    }
}

/**
 * 渲染大事件剧情阶段界面
 * 绑定到UI对象调用：UIEvent.renderBigEventNarrativePhase.call(UI, phase, hasNextPhase, autoMode)
 */
export function renderBigEventNarrativePhase(phase, hasNextPhase, autoMode = false) {
    try {
        console.log('[UI] 渲染大事件剧情阶段:', phase.name);
        
        this.elements.gameContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
                padding: 40px;
                position: relative;
            ">
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.08;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    background: rgba(20, 20, 50, 0.9);
                    border: 2px solid #6666aa;
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    z-index: 10;
                    box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
                ">
                    <h2 style="
                        color: #ffd700;
                        font-size: 24px;
                        margin-bottom: 20px;
                        text-align: center;
                        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                    ">📖 ${phase.name}</h2>
                    
                    <div style="
                        color: #ddd;
                        font-size: 15px;
                        line-height: 1.8;
                        margin-bottom: 25px;
                        white-space: pre-wrap;
                    ">${phase.description}</div>
                    
                    <div style="text-align: center;">
                        ${autoMode ? `
                            <div style="color: #ffd700; font-size: 16px; animation: pulse 1.5s infinite;">✨ 命运正在揭晓...</div>
                        ` : `
                            <div onclick="BigEventSystem.advanceToNextPhase()" style="
                                padding: 12px 40px;
                                background: linear-gradient(135deg, #6666aa, #8888cc);
                                border: 2px solid #9999dd;
                                border-radius: 10px;
                                color: #fff;
                                cursor: pointer;
                                font-size: 16px;
                                font-weight: bold;
                                display: inline-block;
                                transition: all 0.3s;
                            " onmouseover="this.style.background='linear-gradient(135deg, #7777bb, #9999dd)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='linear-gradient(135deg, #6666aa, #8888cc)'; this.style.transform='scale(1)'">
                                ${hasNextPhase ? '继续 →' : '结束'}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
    } catch (e) {
        console.error('[UI] 渲染大事件剧情阶段失败:', e);
    }
}

/**
 * 渲染大事件选择阶段界面
 * 绑定到UI对象调用：UIEvent.renderBigEventChoicePhase.call(UI, phase, choices)
 */
export function renderBigEventChoicePhase(phase, choices) {
    try {
        console.log('[UI] 渲染大事件选择阶段:', phase.name);
        
        this.elements.gameContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
                padding: 40px;
                position: relative;
            ">
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.08;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    background: rgba(20, 20, 50, 0.9);
                    border: 2px solid #6666aa;
                    border-radius: 15px;
                    padding: 30px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    z-index: 10;
                    box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
                ">
                    <h2 style="
                        color: #ffd700;
                        font-size: 24px;
                        margin-bottom: 20px;
                        text-align: center;
                        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                    ">⚔️ ${phase.name}</h2>
                    
                    <div style="
                        color: #ddd;
                        font-size: 15px;
                        line-height: 1.8;
                        margin-bottom: 25px;
                        white-space: pre-wrap;
                    ">${phase.description}</div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${choices.map((choice, index) => `
                            <div onclick="BigEventSystem.selectChoice(${index})" style="
                                padding: 15px 20px;
                                background: linear-gradient(135deg, #2a2a5a, #3a3a7a);
                                border: 2px solid #555599;
                                border-radius: 10px;
                                color: #fff;
                                cursor: pointer;
                                transition: all 0.3s;
                                font-size: 15px;
                                line-height: 1.5;
                            " onmouseover="this.style.borderColor='#7777bb'; this.style.background='linear-gradient(135deg, #3a3a7a, #4a4a9a)'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#555599'; this.style.background='linear-gradient(135deg, #2a2a5a, #3a3a7a)'; this.style.transform='translateX(0)'">
                                <span style="color: #ffd700; margin-right: 8px;">▶</span>
                                ${choice.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
    } catch (e) {
        console.error('[UI] 渲染大事件选择阶段失败:', e);
    }
}

// 导出模块集合
export const UIEvent = {
    renderEventScreen,
    renderBigEventEnding,
    renderBigEventNarrativePhase,
    renderBigEventChoicePhase
};

export default UIEvent;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIEvent = UIEvent;
}
