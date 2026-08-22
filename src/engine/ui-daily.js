/**
 * UI 日常系统模块
 * 
 * 从ui.js拆分出的独立界面渲染模块
 * 包含：每日签到、每日任务界面
 */

/**
 * 渲染日常系统界面
 * 绑定到UI对象调用：UIDaily.renderDaily.call(UI)
 */
export function renderDaily() {
    const signInData = DailySystem.getSignInData();
    const dailyQuests = DailySystem.getDailyQuests();
    const rewards = DailySystem._signInRewards;

    this.elements.gameContainer.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a1a2e, #16213e); position: relative;">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                background: rgba(0, 0, 0, 0.6);
                border-bottom: 2px solid #444477;
                position: relative;
                z-index: 1;
            ">
                <h2 style="color: #66aaff; font-size: 26px;">📋 日常</h2>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <span style="color: #aaa; font-size: 14px;">第 ${Player.day} 天</span>
                    <div onclick="Game.closeDaily()" style="
                        padding: 10px 20px;
                        background: #333355;
                        border: 1px solid #555577;
                        border-radius: 8px;
                        color: #ccccff;
                        cursor: pointer;
                        font-size: 15px;
                        display: inline-block;
                    ">关闭</div>
                </div>
            </div>

            <div style="flex: 1; padding: 25px; overflow-y: auto; position: relative; z-index: 1;">
                <div style="max-width: 800px; margin: 0 auto;">

                    <!-- 说明栏 -->
                    <div style="
                        background: rgba(60, 60, 100, 0.4);
                        border: 1px solid #555588;
                        border-radius: 8px;
                        padding: 12px 18px;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        <span style="font-size: 18px;">💡</span>
                        <span style="color: #aabbdd; font-size: 13px;">
                            日常系统基于<strong style="color: #ffcc44;">游戏内时间</strong>，每天（第N天）0点自动刷新签到和任务。当前为游戏内第 <strong style="color: #ffcc44;">${Player.day}</strong> 天。
                        </span>
                    </div>

                    <!-- 每日签到 -->
                    <div style="
                        background: rgba(40, 40, 80, 0.6);
                        border: 1px solid #555599;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 25px;
                    ">
                        <h3 style="color: #ffcc44; margin: 0 0 15px 0; font-size: 20px;">
                            🎁 每日签到
                            <span style="font-size: 14px; color: #999; font-weight: normal; margin-left: 15px;">
                                连续签到 ${signInData.consecutiveDays} 天 | 累计 ${signInData.totalSignInDays} 天
                            </span>
                        </h3>

                        <!-- 7天奖励预览 -->
                        <div style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
                            ${rewards.map((r, i) => {
                                const dayNum = i + 1;
                                const isToday = !signInData.hasSignedIn && (signInData.consecutiveDays % 7) === i;
                                const isPast = signInData.hasSignedIn && (signInData.consecutiveDays % 7) === i;
                                const bgColor = isToday ? 'rgba(255, 200, 50, 0.3)' : isPast ? 'rgba(100, 200, 100, 0.2)' : 'rgba(60, 60, 100, 0.5)';
                                const borderColor = isToday ? '#ffcc44' : isPast ? '#66cc66' : '#555588';
                                const itemName = r.items.length > 0 ? DataManager.getItem(r.items[0].itemId)?.name || r.items[0].itemId : '';
                                return `
                                    <div style="
                                        flex: 1;
                                        min-width: 80px;
                                        background: ${bgColor};
                                        border: 2px solid ${borderColor};
                                        border-radius: 8px;
                                        padding: 10px;
                                        text-align: center;
                                    ">
                                        <div style="color: #aaa; font-size: 12px;">第${dayNum}天</div>
                                        <div style="font-size: 20px; margin: 5px 0;">${r.gold > 0 ? '💰' : '🎁'}</div>
                                        <div style="color: #ffcc44; font-size: 13px; font-weight: bold;">${r.gold > 0 ? r.gold + '金' : itemName}</div>
                                        ${isPast ? '<div style="color: #66cc66; font-size: 11px; margin-top: 3px;">✓</div>' : ''}
                                        ${isToday ? '<div style="color: #ffcc44; font-size: 11px; margin-top: 3px;">今天</div>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        ${signInData.hasSignedIn ? `
                            <div style="
                                background: rgba(100, 150, 100, 0.2);
                                border: 1px solid #557755;
                                border-radius: 8px;
                                padding: 12px;
                                text-align: center;
                                color: #88cc88;
                                font-size: 15px;
                            ">✓ 今日已签到，明天再来吧！</div>
                        ` : `
                            <div onclick="Game.doSignIn()" style="
                                background: linear-gradient(135deg, #cc8800, #ffaa00);
                                border: none;
                                border-radius: 8px;
                                padding: 14px;
                                text-align: center;
                                color: white;
                                font-size: 16px;
                                font-weight: bold;
                                cursor: pointer;
                            ">立即签到</div>
                        `}
                    </div>

                    <!-- 每日任务 -->
                    <div style="
                        background: rgba(40, 40, 80, 0.6);
                        border: 1px solid #555599;
                        border-radius: 12px;
                        padding: 20px;
                    ">
                        <h3 style="color: #66aaff; margin: 0 0 15px 0; font-size: 20px;">
                            📝 每日任务
                            <span style="font-size: 14px; color: #999; font-weight: normal; margin-left: 15px;">
                                每天刷新3个任务
                            </span>
                        </h3>

                        ${dailyQuests.length === 0 ? `
                            <div style="color: #888; text-align: center; padding: 30px;">暂无日常任务</div>
                        ` : dailyQuests.map(quest => {
                            const progress = quest.progress || 0;
                            const target = quest.target;
                            const percent = Math.min(100, (progress / target) * 100);
                            const canClaim = quest.completed && !quest.claimed;

                            let statusHtml = '';
                            if (quest.claimed) {
                                statusHtml = `<span style="color: #666; font-size: 13px;">已领取</span>`;
                            } else if (canClaim) {
                                statusHtml = `<div onclick="Game.claimDailyReward('${quest.id}')" style="
                                    background: linear-gradient(135deg, #44aa44, #66cc66);
                                    border: none;
                                    border-radius: 6px;
                                    padding: 8px 16px;
                                    color: white;
                                    font-size: 13px;
                                    font-weight: bold;
                                    cursor: pointer;
                                    display: inline-block;
                                ">领取奖励</div>`;
                            } else {
                                statusHtml = `<span style="color: #888; font-size: 13px;">${progress}/${target}</span>`;
                            }

                            return `
                                <div style="
                                    background: rgba(30, 30, 60, 0.8);
                                    border: 1px solid ${canClaim ? '#66aa66' : '#444466'};
                                    border-radius: 8px;
                                    padding: 15px;
                                    margin-bottom: 12px;
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <div>
                                            <span style="color: #ddd; font-size: 16px; font-weight: bold;">${quest.name}</span>
                                            <span style="color: #999; font-size: 13px; margin-left: 10px;">${quest.description}</span>
                                        </div>
                                        ${statusHtml}
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="flex: 1; height: 8px; background: #222; border-radius: 4px; overflow: hidden;">
                                            <div style="height: 100%; width: ${percent}%; background: ${quest.completed ? 'linear-gradient(90deg, #44aa44, #66cc66)' : 'linear-gradient(90deg, #4466aa, #6688cc)'}; transition: width 0.3s;"></div>
                                        </div>
                                        <span style="color: #ffcc44; font-size: 12px;">
                                            奖励: ${quest.rewards.exp ? quest.rewards.exp + '经验' : ''} ${quest.rewards.gold ? quest.rewards.gold + '金' : ''}
                                        </span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                </div>
            </div>
        </div>
    `;
}

// 导出模块集合
export const UIDaily = {
    renderDaily
};

export default UIDaily;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIDaily = UIDaily;
}
