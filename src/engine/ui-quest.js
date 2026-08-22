/**
 * UI渲染 - 任务界面模块
 * 
 * 从ui.js拆分出的独立任务界面模块
 * 包含：渲染任务界面（renderQuestScreen）
 */

export function renderQuestScreen() {
        const activeQuests = Player.activeQuests;
        const completedQuests = Player.completedQuests;
        const availableQuests = typeof QuestSystem !== 'undefined' ? QuestSystem.getAllAvailableQuests() : [];
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #2a1a3a, #3a2a4a); position: relative;">
                
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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #664477;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">📜 任务日志</h2>
                    <div onclick="Game.closeQuestLog()" style="
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
                
                <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                    
                    <h3 style="color: #66ff66; margin-bottom: 15px;">🔵 进行中 (${activeQuests.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 40px;">
                        ${activeQuests.map(q => {
                            const quest = QuestSystem.getQuest(q.questId);
                            if (!quest) return '';
                            return `
                                <div style="
                                    padding: 20px;
                                    background: rgba(40, 30, 60, 0.8);
                                    border: 2px solid #554477;
                                    border-radius: 10px;
                                ">
                                    <div style="font-size: 20px; font-weight: bold; color: #e0d0ff; margin-bottom: 8px;">
                                        ${quest.isMainQuest ? '⭐ ' : ''}${quest.name}
                                    </div>
                                    <div style="font-size: 14px; color: #aaa; margin-bottom: 15px;">${quest.description}</div>
                                    <div style="font-size: 14px; color: #ccc; line-height: 1.8;">
                                        ${quest.objectives.map((obj, i) => {
                                            const progress = q.progress[i] || 0;
                                            const done = progress >= obj.count;
                                            return `<div>${done ? '✅' : '⬜'} ${obj.description} (${progress}/${obj.count})</div>`;
                                        }).join('')}
                                    </div>
                                    <div style="margin-top: 12px; font-size: 13px; color: #ffd700;">
                                        奖励: ${quest.rewards.exp ? quest.rewards.exp + ' 经验 ' : ''}${quest.rewards.gold ? quest.rewards.gold + ' 金币' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p style="color: #8877aa;">暂无进行中的任务</p>'}
                    </div>
                    
                    <h3 style="color: #ffcc66; margin-bottom: 15px;">📋 任务提示</h3>
                    <div style="padding: 15px 20px; background: rgba(60, 45, 30, 0.5); border: 1px solid #665533; border-radius: 8px; margin-bottom: 40px;">
                        <p style="color: #ccbbaa; font-size: 14px; line-height: 1.8; margin: 0;">
                            💡 任务需要通过与NPC对话或在特定地点探索时触发接取。<br>
                            多与学校老师、同学交流，或在城市中探索，发现新的任务线索。<br>
                            <span style="color: #887766; font-size: 12px;">（已触发但未接取的任务会在对应NPC处显示接取选项）</span>
                        </p>
                    </div>
                    
                    <h3 style="color: #888; margin-bottom: 15px;">✅ 已完成 (${completedQuests.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${completedQuests.map(questId => {
                            const quest = QuestSystem.getQuest(questId);
                            if (!quest) return '';
                            return `
                                <div style="
                                    padding: 12px 20px;
                                    background: rgba(40, 40, 40, 0.5);
                                    border: 1px solid #555;
                                    border-radius: 8px;
                                    color: #888;
                                ">
                                    ✅ ${quest.name}
                                </div>
                            `;
                        }).join('') || '<p style="color: #666;">还没有完成任何任务</p>'}
                    </div>
                </div>
            </div>
        `;
    }


// 导出模块集合
export const UIQuest = {
    renderQuestScreen
};

export default UIQuest;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIQuest = UIQuest;
}