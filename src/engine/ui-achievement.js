/**
 * UI 成就面板模块
 * 
 * 从ui.js拆分出的独立成就面板渲染模块
 * 包含：成就面板弹窗
 */

/**
 * 显示成就面板
 * 绑定到UI对象调用：UIAchievement.showAchievementPanel.call(UI)
 */
export function showAchievementPanel() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
    `;

    const panel = document.createElement('div');
    panel.className = 'mobile-popup';
    panel.style.cssText = `
        background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
        border: 2px solid #6666aa; border-radius: 15px;
        padding: 25px; max-width: 600px; width: 90%;
        max-height: 80vh; overflow-y: auto;
        box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
    `;

    // 获取成就数据
    const achievements = typeof DataAchievements !== 'undefined' ? DataAchievements : {};
    const unlockedAchievements = typeof WorldState !== 'undefined' ? WorldState.achievements : [];
    const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

    // 按分类分组
    const categories = {};
    for (const id in achievements) {
        const ach = achievements[id];
        if (!categories[ach.category]) {
            categories[ach.category] = [];
        }
        categories[ach.category].push(ach);
    }

    // 统计
    const totalCount = Object.keys(achievements).length;
    const unlockedCount = unlockedAchievements.length;
    const totalPoints = unlockedAchievements.reduce((sum, a) => {
        const rarity = ACHIEVEMENT_RARITIES?.[a.rarity] || { points: 0 };
        return sum + (rarity.points || 0);
    }, 0);

    let categoriesHtml = '';
    const categoryConfig = ACHIEVEMENT_CATEGORIES || {};

    for (const catId in categories) {
        const cat = categoryConfig[catId] || { name: catId, icon: '📁' };
        const catAchievements = categories[catId];
        
        let achievementsHtml = '';
        catAchievements.forEach(ach => {
            const isUnlocked = unlockedIds.has(ach.id);
            const rarity = ACHIEVEMENT_RARITIES?.[ach.rarity] || { name: '普通', color: '#999' };
            
            // 隐藏成就：未解锁时不显示详情
            if (ach.isHidden && !isUnlocked) {
                achievementsHtml += `
                    <div style="
                        padding: 10px 12px; margin-bottom: 6px;
                        background: rgba(30, 30, 60, 0.5);
                        border: 1px solid #444; border-radius: 8px;
                        opacity: 0.5;
                    ">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 20px;">❓</span>
                            <div style="flex: 1;">
                                <div style="color: #888; font-weight: bold; font-size: 13px;">???</div>
                                <div style="color: #666; font-size: 11px; margin-top: 2px;">隐藏成就</div>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            achievementsHtml += `
                <div style="
                    padding: 10px 12px; margin-bottom: 6px;
                    background: ${isUnlocked ? 'linear-gradient(135deg, #2a2a5a, #3a3a7a)' : 'rgba(30, 30, 60, 0.5)'};
                    border: 2px solid ${isUnlocked ? rarity.color : '#444'}; border-radius: 8px;
                    opacity: ${isUnlocked ? 1 : 0.6};
                    transition: all 0.2s;
                " onmouseover="this.style.transform='translateX(3px)'" onmouseout="this.style.transform='translateX(0)'">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">${ach.icon || '🏆'}</span>
                        <div style="flex: 1;">
                            <div style="color: ${isUnlocked ? '#fff' : '#888'}; font-weight: bold; font-size: 14px;">
                                ${ach.name}
                                <span style="color: ${rarity.color}; font-size: 11px; margin-left: 8px;">${rarity.name}</span>
                            </div>
                            <div style="color: #aaa; font-size: 12px; margin-top: 2px;">${ach.description}</div>
                        </div>
                        <div style="text-align: right;">
                            ${isUnlocked ? 
                                `<div style="color: #ffd700; font-size: 12px;">✓ 已解锁</div>` : 
                                `<div style="color: #666; font-size: 12px;">未解锁</div>`
                            }
                        </div>
                    </div>
                </div>
            `;
        });

        categoriesHtml += `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #ffd700; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    ${cat.icon} ${cat.name}
                    <span style="color: #888; font-size: 12px; font-weight: normal;">
                        (${catAchievements.filter(a => unlockedIds.has(a.id)).length}/${catAchievements.length})
                    </span>
                </h3>
                ${achievementsHtml}
            </div>
        `;
    }

    panel.innerHTML = `
        <h2 style="color: #ffd700; font-size: 24px; margin-bottom: 5px; text-align: center;">🏆 成就</h2>
        <div style="text-align: center; color: #aaa; font-size: 13px; margin-bottom: 20px;">
            已解锁 <span style="color: #ffd700; font-weight: bold;">${unlockedCount}</span> / ${totalCount} 个成就
            <span style="margin: 0 10px;">|</span>
            成就点数 <span style="color: #ffd700; font-weight: bold;">${totalPoints}</span>
        </div>
        ${categoriesHtml}
        <div onclick="this.parentElement.parentElement.remove()" style="
            margin-top: 10px; padding: 12px; text-align: center;
            background: linear-gradient(135deg, #553333, #774444);
            border: 2px solid #885555; border-radius: 8px;
            color: #ffcccc; cursor: pointer; font-size: 15px;
        ">关闭</div>
    `;

    overlay.appendChild(panel);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
}

// 导出模块集合
export const UIAchievement = {
    showAchievementPanel
};

export default UIAchievement;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIAchievement = UIAchievement;
}
