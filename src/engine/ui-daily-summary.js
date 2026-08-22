/**
 * UI系统 - 每日总结模块
 * 
 * 从ui.js拆分出的独立每日总结模块
 * 包含：显示每日总结（showDailySummary）
 */

export function showDailySummary(stats) {
        if (!stats) return;
        
        // v0.92.17: 强制恢复点击，防止之前的消息弹窗导致点击被拦截
        if (typeof UI !== 'undefined') {
            UI._restoreClicks();
        }
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #ffd700;
            border-radius: 15px;
            padding: 30px;
            min-width: 350px;
            max-width: 450px;
            z-index: 1000;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
        `;
        
        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 15px; font-weight: bold; text-align: center;">
                📅 第 ${stats.day} 天总结
            </div>
            <div style="font-size: 14px; color: #aaa; margin-bottom: 20px; text-align: center;">
                今天你做了这些事：
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${stats.expGained > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(60, 60, 30, 0.4); border-radius: 8px;">
                        <span style="color: #ffeeaa;">✨ 获得经验</span>
                        <span style="color: #ffd700; font-weight: bold;">+${stats.expGained}</span>
                    </div>
                ` : ''}
                ${stats.goldGained > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(60, 50, 20, 0.4); border-radius: 8px;">
                        <span style="color: #ffddaa;">💰 获得金币</span>
                        <span style="color: #ffaa44; font-weight: bold;">+${stats.goldGained}</span>
                    </div>
                ` : ''}
                ${stats.battlesWon > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(60, 20, 20, 0.4); border-radius: 8px;">
                        <span style="color: #ffaaaa;">⚔️ 战斗胜利</span>
                        <span style="color: #ff6666; font-weight: bold;">${stats.battlesWon} 场</span>
                    </div>
                ` : ''}
                ${stats.locationsExplored > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(20, 60, 40, 0.4); border-radius: 8px;">
                        <span style="color: #aaffcc;">🗺️ 探索新地点</span>
                        <span style="color: #66ff99; font-weight: bold;">${stats.locationsExplored} 个</span>
                    </div>
                ` : ''}
                ${stats.npcsTalked > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(20, 40, 60, 0.4); border-radius: 8px;">
                        <span style="color: #aaccff;">💬 结识新NPC</span>
                        <span style="color: #66aaff; font-weight: bold;">${stats.npcsTalked} 人</span>
                    </div>
                ` : ''}
                ${stats.expGained === 0 && stats.battlesWon === 0 && stats.locationsExplored === 0 && stats.npcsTalked === 0 ? `
                    <div style="text-align: center; padding: 20px; color: #888;">
                        今天比较平静，没有特别的收获。
                    </div>
                ` : ''}
            </div>
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    padding: 12px 40px;
                    background: linear-gradient(135deg, #665522, #887733);
                    border: 2px solid #ffd700;
                    border-radius: 10px;
                    color: #ffeeaa;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                " onmouseover="this.style.background='linear-gradient(135deg, #887733, #aa9944)'" onmouseout="this.style.background='linear-gradient(135deg, #665522, #887733)'">
                    开始新的一天
                </button>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }


// 导出模块集合
export const UIDailySummary = {
    showDailySummary
};

export default UIDailySummary;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIDailySummary = UIDailySummary;
}