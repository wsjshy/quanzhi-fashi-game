/**
 * UI系统 - 声望界面模块
 * 
 * 从ui.js拆分出的独立声望界面模块
 * 包含：渲染声望界面（renderReputationScreen）
 */

export function renderReputationScreen() {
        const factions = DataManager.getFactions ? DataManager.getFactions() : {};
        const factionList = Object.values(factions);
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #2a1a3a, #3a2a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.06;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #664477;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">⭐ 势力声望</h2>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <span style="color: #aaa; font-size: 14px;">共 ${factionList.length} 个势力</span>
                        <div onclick="Game.closeReputationPanel()" style="
                            padding: 10px 20px;
                            background: #553333;
                            border: 1px solid #775555;
                            border-radius: 8px;
                            color: #ffcccc;
                            cursor: pointer;
                            font-size: 15px;
                            display: inline-block;
                        ">关闭</div>
                    </div>
                </div>
                
                <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        ${factionList.map(faction => {
                            const rep = WorldState.getReputation(faction.id);
                            const repLevel = WorldState.getReputationLevel(faction.id);
                            const percent = Math.max(0, Math.min(100, (rep + 100) / 2));
                            
                            // 获取当前等级的效果
                            const effects = faction.reputationEffects?.[repLevel.level] || {};
                            const effectTexts = [];
                            if (effects.shopDiscount) effectTexts.push(`商店 ${Math.round(effects.shopDiscount * 100)}折`);
                            if (effects.questRewardBonus) effectTexts.push(`任务奖励 +${Math.round((effects.questRewardBonus - 1) * 100)}%`);
                            if (effects.examBonus) effectTexts.push(`考核奖励 +${Math.round((effects.examBonus - 1) * 100)}%`);
                            
                            return `
                                <div style="
                                    padding: 20px;
                                    background: rgba(40, 30, 60, 0.8);
                                    border: 2px solid ${faction.color || '#666'};
                                    border-radius: 12px;
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span style="font-size: 32px;">${faction.icon || '🏛️'}</span>
                                            <div>
                                                <div style="font-size: 20px; font-weight: bold; color: #fff;">${faction.name}</div>
                                                <div style="font-size: 13px; color: #999; margin-top: 3px;">${faction.description || ''}</div>
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 18px; font-weight: bold; color: ${repLevel.color};">${repLevel.name}</div>
                                            <div style="font-size: 13px; color: #888; margin-top: 3px;">${rep >= 0 ? '+' : ''}${rep} / 100</div>
                                        </div>
                                    </div>
                                    
                                    <!-- 声望进度条 -->
                                    <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                                        <div style="height: 100%; width: ${percent}%; background: linear-gradient(90deg, ${faction.color || '#666'}, ${repLevel.color}); border-radius: 4px; transition: width 0.5s;"></div>
                                    </div>
                                    
                                    <!-- 当前等级效果 -->
                                    ${effectTexts.length > 0 ? `
                                        <div style="font-size: 13px; color: #88ff88;">
                                            当前效果：${effectTexts.join('、')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${factionList.length === 0 ? `
                        <div style="text-align: center; padding: 80px 20px; color: #776688;">
                            <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                            <div style="font-size: 18px; margin-bottom: 10px;">暂无势力数据</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }


// 导出模块集合
export const UIReputation = {
    renderReputationScreen
};

export default UIReputation;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIReputation = UIReputation;
}