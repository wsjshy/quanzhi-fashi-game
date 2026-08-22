/**
 * 游戏主流程 - 突破面板模块
 * 
 * 从game.js拆分出的独立突破面板模块
 * 包含：显示突破面板（showBreakthroughPanel）
 */

export function showBreakthroughPanel() {
        // v0.93.0: 先清除所有覆盖弹窗，防止双弹窗重叠卡死
        if (typeof UI !== 'undefined' && UI._restoreClicks) {
            UI._restoreClicks();
        }
        document.querySelectorAll('.rest-overlay, .ei-overlay, .npc-dialog-overlay, .daily-overlay').forEach(el => el.remove());
        
        if (typeof RealmSystem === 'undefined') {
            UI.showMessage('境界系统未加载！');
            return;
        }

        const checkResult = Player.canBreakthrough();
        const currentRealm = RealmSystem.getRealm(Player.realm || 'initial');
        const nextRealm = RealmSystem.getNextRealm(Player.realm || 'initial');
        const successRate = RealmSystem.calculateSuccessRate(Player);

        let contentHtml = '';

        if (!nextRealm) {
            // 已达最高境界
            contentHtml = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🌟</div>
                    <div style="font-size: 24px; color: #ffd700; margin-bottom: 10px;">已达最高境界</div>
                    <div style="color: #aaa; font-size: 16px;">
                        当前境界: ${currentRealm.name}魔法师
                    </div>
                </div>
            `;
        } else if (!checkResult.canBreakthrough) {
            // 不满足突破条件
            contentHtml = `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 36px; margin-bottom: 20px;">🔒</div>
                    <div style="font-size: 20px; color: #ff6666; margin-bottom: 15px;">暂无法突破</div>
                    <div style="color: #aaa; font-size: 14px; margin-bottom: 20px;">
                        ${checkResult.reason}
                    </div>
                    <div style="background: #222; padding: 15px; border-radius: 10px; text-align: left;">
                        <div style="color: #ffd700; font-size: 14px; margin-bottom: 10px;">突破条件：</div>
                        <div style="color: #ccc; font-size: 13px; line-height: 1.8;">
                            • 等级达到 ${RealmSystem.getBreakthroughRequirements(Player.realm || 'initial')?.requiredLevel || '?'} 级<br>
                            • 当前等级: ${Player.level} 级
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 可以突破
            const requirements = RealmSystem.getBreakthroughRequirements(Player.realm || 'initial');
            contentHtml = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 32px; font-weight: bold; color: #ffd700; margin-bottom: 10px;">
                        ⚡ 境界突破
                    </div>
                    <div style="color: #aaa; font-size: 16px; margin-bottom: 20px;">
                        ${currentRealm.name} → ${nextRealm.name}
                    </div>
                </div>

                <div style="background: #222; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 15px; font-weight: bold;">
                        突破效果
                    </div>
                    <div style="color: #ccc; font-size: 14px; line-height: 2;">
                        • 生命值上限 +${Math.floor(nextRealm.statBonus.maxHp * 100)}%<br>
                        • 魔法值上限 +${Math.floor(nextRealm.statBonus.maxMp * 100)}%<br>
                        • 攻击力 +${Math.floor(nextRealm.statBonus.attack * 100)}%<br>
                        • 防御力 +${Math.floor(nextRealm.statBonus.defense * 100)}%<br>
                        • 速度 +${Math.floor(nextRealm.statBonus.speed * 100)}%<br>
                        • 精神力 +${Math.floor(nextRealm.statBonus.spirit * 100)}%<br>
                        • 解锁 ${nextRealm.name}魔法<br>
                        ${nextRealm.unlocks.includes('second_awaken') ? '• 解锁第二次觉醒<br>' : ''}
                        ${nextRealm.unlocks.includes('mind_sense') ? '• 解锁意念感知<br>' : ''}
                    </div>
                </div>

                <div style="background: #222; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 15px; font-weight: bold;">
                        突破成功率
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="flex: 1; height: 20px; background: #333; border-radius: 10px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.floor(successRate * 100)}%; background: linear-gradient(90deg, #66ff66, #ffd700); border-radius: 10px;"></div>
                        </div>
                        <span style="color: #fff; font-size: 18px; font-weight: bold;">
                            ${Math.floor(successRate * 100)}%
                        </span>
                    </div>
                </div>

                <div onclick="Game.performBreakthrough()" style="
                    padding: 18px;
                    background: linear-gradient(135deg, #ff6600, #ff3300);
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(255, 102, 0, 0.4);
                    transition: all 0.2s;
                " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 6px 20px rgba(255, 102, 0, 0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(255, 102, 0, 0.4)'">
                    ⚡ 开始突破
                </div>
            `;
        }

        UI.elements.gameContainer.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto; padding: 30px 20px;">
                ${contentHtml}
                <div onclick="Game.openCharacterPanel()" style="
                    margin-top: 20px;
                    padding: 12px;
                    background: #333;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    color: #aaa;
                    font-size: 14px;
                " onmouseover="this.style.background='#444'" onmouseout="this.style.background='#333'">
                    返回角色面板
                </div>
            </div>
        `;
    }


// 导出模块集合
export const GameBreakthrough = {
    showBreakthroughPanel
};

export default GameBreakthrough;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameBreakthrough = GameBreakthrough;
}