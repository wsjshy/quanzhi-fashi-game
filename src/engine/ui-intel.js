/**
 * UI渲染 - 情报界面模块
 * 
 * 从ui.js拆分出的独立情报界面模块
 * 包含：渲染情报界面（renderIntelScreen）
 */

export function renderIntelScreen() {
        const knownInfo = WorldState.knownInfo || [];
        const infoDatabase = GameData.infoDatabase || { infos: {} };
        
        // 按分类整理信息
        const categories = ['warning', 'intel', 'clue', 'rumor'];
        const categoryNames = {
            warning: '⚠️ 预警',
            intel: '📋 情报',
            clue: '🔍 线索',
            rumor: '💬 传闻'
        };
        const categoryColors = {
            warning: '#ff6666',
            intel: '#ffcc66',
            clue: '#88ccff',
            rumor: '#aaaaaa'
        };
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a3a, #2a3a4a); position: relative;">
                
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
                    border-bottom: 2px solid #446677;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">🔍 情报收集</h2>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <span style="color: #aaa; font-size: 14px;">已收集: ${knownInfo.length} 条</span>
                        <div onclick="Game.closeIntelPanel()" style="
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
                    
                    <!-- v1.8.1: 阴谋调查分区 -->
                    ${typeof InvestigationSystem !== 'undefined' ? (() => {
                        const invData = InvestigationSystem.getData(Player);
                        const invLevel = InvestigationSystem.getInvestigationLevel(Player);
                        const totalProgress = InvestigationSystem.getTotalProgress(Player);
                        const clueTypes = InvestigationSystem.CLUE_TYPES;
                        
                        let typeBars = '';
                        for (const type in clueTypes) {
                            const config = clueTypes[type];
                            const progress = invData[type] || 0;
                            typeBars += `
                                <div style="margin-bottom: 8px;">
                                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-bottom: 3px;">
                                        <span>${config.icon} ${config.name}</span>
                                        <span>${progress}%</span>
                                    </div>
                                    <div style="height: 5px; background: #333; border-radius: 3px; overflow: hidden;">
                                        <div style="height: 100%; width: ${progress}%; background: ${config.color}; transition: width 0.3s;"></div>
                                    </div>
                                </div>
                            `;
                        }
                        
                        const discoveredClues = InvestigationSystem.getDiscoveredClues(Player);
                        
                        return `
                            <div style="
                                background: rgba(20, 30, 50, 0.9);
                                border: 2px solid #5566aa;
                                border-radius: 12px;
                                padding: 20px;
                                margin-bottom: 30px;
                            ">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <h3 style="color: #88aaff; font-size: 18px; margin: 0;">🕵️ 阴谋调查</h3>
                                    <div style="text-align: right;">
                                        <div style="color: #ffd700; font-size: 15px; font-weight: bold;">${invLevel.name}</div>
                                        <div style="color: #888; font-size: 11px;">总进度: ${totalProgress}%</div>
                                    </div>
                                </div>
                                <div style="color: #99aabb; font-size: 12px; margin-bottom: 15px; font-style: italic;">${invLevel.desc}</div>
                                ${typeBars}
                                ${discoveredClues.length > 0 ? `
                                    <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #334466;">
                                        <div style="color: #8899bb; font-size: 12px; margin-bottom: 8px;">已发现线索 (${discoveredClues.length}):</div>
                                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                            ${discoveredClues.map(clue => `
                                                <div style="
                                                    padding: 4px 10px;
                                                    background: rgba(80, 100, 150, 0.3);
                                                    border: 1px solid #5566aa;
                                                    border-radius: 12px;
                                                    font-size: 11px;
                                                    color: #aabbdd;
                                                    cursor: help;
                                                " title="${clue.description}">
                                                    ${clue.name}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    })() : ''}
                    
                    ${categories.map(cat => {
                        const catInfos = knownInfo
                            .map(id => infoDatabase.infos[id])
                            .filter(info => info && info.category === cat)
                            .sort((a, b) => (b.credibility || 0) - (a.credibility || 0));
                        
                        if (catInfos.length === 0) return '';
                        
                        return `
                            <h3 style="color: ${categoryColors[cat]}; margin-bottom: 15px; font-size: 18px;">
                                ${categoryNames[cat]} (${catInfos.length})
                            </h3>
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
                                ${catInfos.map(info => `
                                    <div style="
                                        padding: 18px 20px;
                                        background: rgba(30, 40, 60, 0.8);
                                        border-left: 4px solid ${categoryColors[cat]};
                                        border-radius: 0 8px 8px 0;
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                            <div style="font-size: 17px; font-weight: bold; color: #e0e8f0;">
                                                ${info.title}
                                            </div>
                                            <div style="font-size: 12px; color: #888;">
                                                可信度: ${Math.round((info.credibility || 0) * 100)}%
                                            </div>
                                        </div>
                                        <div style="font-size: 14px; color: #bbb; line-height: 1.7; margin-bottom: 10px;">
                                            ${info.content}
                                        </div>
                                        <div style="font-size: 12px; color: #777;">
                                            来源: ${info.source || '未知'}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }).join('')}
                    
                    ${knownInfo.length === 0 ? `
                        <div style="text-align: center; padding: 80px 20px; color: #667788;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                            <div style="font-size: 18px; margin-bottom: 10px;">还没有收集到任何情报</div>
                            <div style="font-size: 14px;">和 NPC 对话、探索世界、完成任务都可能获得情报</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }


// 导出模块集合
export const UIIntel = {
    renderIntelScreen
};

export default UIIntel;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIIntel = UIIntel;
}