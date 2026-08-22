/**
 * UI系统 - 大事件界面模块
 * 
 * 从ui.js拆分出的独立大事件界面模块
 * 包含：渲染大事件界面（renderScheduledEventScreen）
 */

export function renderScheduledEventScreen(event, success) {
        try {
            console.log('[UI] 渲染大事件界面:', event.id, '成功:', success);
            
            const text = success ? event.successText : event.failText;
            const rewards = success ? event.successRewards : event.failPenalty;
    
            let rewardText = '';
            if (rewards) {
                if (rewards.exp) rewardText += rewards.exp > 0 ? `获得 ${rewards.exp} 经验\n` : `失去 ${-rewards.exp} 经验\n`;
                if (rewards.gold) rewardText += rewards.gold > 0 ? `获得 ${rewards.gold} 金币\n` : `失去 ${-rewards.gold} 金币\n`;
                if (rewards.items && rewards.items.length > 0) {
                    rewardText += '获得物品：\n';
                    rewards.items.forEach(item => {
                        const itemData = DataManager.getItem(item.itemId);
                        console.log('[UI] 物品数据:', item.itemId, itemData);
                        rewardText += `  ${itemData?.name || item.itemId} x${item.count || 1}\n`;
                    });
                }
            }
    
            console.log('[UI] 奖励文本:', rewardText);
            
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
                    
                    <!-- 背景特效 -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: radial-gradient(circle at center, ${success ? 'rgba(100, 255, 100, 0.1)' : 'rgba(255, 100, 100, 0.1)'} 0%, transparent 70%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    
                    <div style="
                        max-width: 600px;
                        background: rgba(20, 20, 50, 0.95);
                        border: 2px solid ${success ? '#66cc66' : '#cc6666'};
                        border-radius: 15px;
                        padding: 40px;
                        box-shadow: 0 0 50px ${success ? 'rgba(100, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)'};
                        position: relative;
                        z-index: 1;
                    ">
                        <h2 style="color: ${success ? '#66ff66' : '#ff6666'}; font-size: 28px; margin-bottom: 10px; text-align: center;">
                            ${success ? '🎉' : '😔'} ${event.name}
                        </h2>
                        
                        <p style="color: #8888aa; font-size: 14px; margin-bottom: 20px; text-align: center;">
                            ${event.description}
                        </p>
                        
                        <p style="color: #d0d0f0; font-size: 17px; line-height: 1.8; margin-bottom: 30px; text-align: center;">
                            ${text}
                        </p>
                        
                        ${rewardText ? `
                        <div style="
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                            padding: 15px 20px;
                            margin-bottom: 30px;
                        ">
                            <pre style="color: ${success ? '#88ff88' : '#ff8888'}; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap; font-family: inherit;">${rewardText.trim()}</pre>
                        </div>
                        ` : ''}
                        
                        <div onclick="Game.closeScheduledEvent()" style="
                            width: 100%;
                            padding: 15px 25px;
                            background: linear-gradient(135deg, ${success ? '#2a5a2a' : '#5a2a2a'}, ${success ? '#4aaa4a' : '#aa4a4a'});
                            border: 2px solid ${success ? '#66cc66' : '#cc6666'};
                            border-radius: 10px;
                            color: #ffffff;
                            cursor: pointer;
                            font-size: 18px;
                            transition: all 0.3s;
                            box-sizing: border-box;
                            text-align: center;
                        " onmouseover="this.style.boxShadow='0 0 20px ${success ? 'rgba(100, 255, 100, 0.5)' : 'rgba(255, 100, 100, 0.5)'}" onmouseout="this.style.boxShadow='none'">
                            确认
                        </div>
                    </div>
                </div>
            `;
            
            console.log('[UI] 大事件界面渲染完成');
        } catch (e) {
            console.error('[UI] 渲染大事件界面出错:', e);
            console.error('[UI] 错误堆栈:', e.stack);
            this.elements.gameContainer.innerHTML = `
                <div style="padding: 40px; color: #ff6666;">
                    <h2>渲染出错</h2>
                    <p>${e.message}</p>
                    <button onclick="Game.closeScheduledEvent()" style="margin-top: 20px; padding: 10px 20px;">返回</button>
                </div>
            `;
        }
    }


// 导出模块集合
export const UIScheduledEvent = {
    renderScheduledEventScreen
};

export default UIScheduledEvent;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIScheduledEvent = UIScheduledEvent;
}