/**
 * 游戏主流程 - 神器升级面板模块
 * 
 * 从game.js拆分出的独立神器升级面板模块
 * 包含：显示神器升级面板（showArtifactUpgradePanel）
 */

export function showArtifactUpgradePanel(element) {
        if (typeof StarDustArtifactSystem === 'undefined') {
            UI.showMessage('星尘魔器系统未加载！');
            return;
        }

        const artifactData = Player.starDustArtifacts?.[element];
        if (!artifactData) {
            UI.showMessage('没有找到该元素的星尘魔器');
            return;
        }

        const artifact = StarDustArtifactSystem.getArtifact(artifactData.id);
        if (!artifact || artifact.grade !== 'growth') {
            UI.showMessage('该星尘魔器不是成长型，无法升级');
            return;
        }

        const currentLevel = artifactData.level || 1;
        const currentExp = artifactData.exp || 0;
        const maxLevel = artifact.maxLevel || 10;
        const expToNext = StarDustArtifactSystem.getExpToNextLevel(currentLevel);
        const elementName = artifact.element === 'all' ? '全元素' : SkillSystem.getElementName(artifact.element);
        const effect = StarDustArtifactSystem.getCultivateEffect(artifactData);

        // 精魄配置
        const soulEssences = [
            { id: 'servant_soul_essence', name: '奴仆级精魄', exp: 50, icon: '🔵' },
            { id: 'warrior_soul_essence', name: '战将级精魄', exp: 300, icon: '🟣' },
            { id: 'commander_soul_essence', name: '统领级精魄', exp: 1500, icon: '🟡' }
        ];

        const isMaxLevel = currentLevel >= maxLevel;

        let soulEssenceHtml = '';
        if (!isMaxLevel) {
            soulEssenceHtml = soulEssences.map(se => {
                const count = Inventory.getItemCount(se.id);
                const canUse = count > 0;
                const expToLevelUp = expToNext - currentExp;
                const needed = Math.ceil(expToLevelUp / se.exp);
                return `
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 15px;
                        background: ${canUse ? 'rgba(80, 60, 120, 0.3)' : 'rgba(50, 50, 50, 0.3)'};
                        border: 1px solid ${canUse ? '#8866cc' : '#444'};
                        border-radius: 8px;
                        margin-bottom: 8px;
                        opacity: ${canUse ? '1' : '0.5'};
                    ">
                        <div>
                            <span style="font-size: 20px;">${se.icon}</span>
                            <span style="color: #fff; margin-left: 8px; font-size: 14px;">${se.name}</span>
                            <span style="color: #888; margin-left: 8px; font-size: 12px;">x${count}</span>
                            <div style="color: #aaa; font-size: 11px; margin-top: 2px;">每个提供 ${se.exp} 经验（升级需约 ${needed} 个）</div>
                        </div>
                        ${canUse ? `
                            <div style="display: flex; gap: 5px;">
                                <div onclick="Game.upgradeArtifactWithSoulEssence('${element}', '${se.id}', 1)" style="
                                    padding: 6px 12px;
                                    background: #554488;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    color: #fff;
                                    font-size: 12px;
                                " onmouseover="this.style.background='#6655aa'" onmouseout="this.style.background='#554488'">用1个</div>
                                ${count >= needed ? `
                                <div onclick="Game.upgradeArtifactWithSoulEssence('${element}', '${se.id}', ${needed})" style="
                                    padding: 6px 12px;
                                    background: #448855;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    color: #fff;
                                    font-size: 12px;
                                " onmouseover="this.style.background='#55aa66'" onmouseout="this.style.background='#448855'">升级</div>
                                ` : ''}
                            </div>
                        ` : '<span style="color:#666;font-size:12px;">暂无</span>'}
                    </div>
                `;
            }).join('');
        }

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #ffcc00;
            border-radius: 15px;
            padding: 25px;
            min-width: 420px;
            max-width: 480px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 99999;
            box-shadow: 0 0 40px rgba(255, 204, 0, 0.3);
        `;

        dialog.innerHTML = `
            <div style="font-size: 20px; color: #ffcc00; margin-bottom: 15px; font-weight: bold; text-align: center;">
                ⭐ 星尘魔器升级
            </div>
            <div style="background: rgba(255, 204, 0, 0.1); border: 1px solid #ffcc0055; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 8px;">
                    ${elementName} · ${artifact.name}
                </div>
                <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">
                    等级: Lv.${currentLevel}${isMaxLevel ? ' (已满级)' : ` / ${maxLevel}`}
                </div>
                ${!isMaxLevel ? `
                <div style="margin-bottom: 8px;">
                    <div style="color: #888; font-size: 11px; margin-bottom: 3px;">经验: ${currentExp} / ${expToNext}</div>
                    <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.min(100, (currentExp / expToNext) * 100).toFixed(1)}%; background: linear-gradient(90deg, #ffcc00, #ffdd44);"></div>
                    </div>
                </div>
                ` : ''}
                <div style="color: #88cc88; font-size: 12px;">
                    当前效果: 修炼时间 +${Math.round(effect.timeBonus * 100)}% · 修炼经验 +${Math.round(effect.expBonus * 100)}%
                </div>
                ${!isMaxLevel ? `
                <div style="color: #ffcc88; font-size: 11px; margin-top: 5px;">
                    下级效果: 修炼时间 +${Math.round(artifact.effect.cultivateTimeBonus * (1 + currentLevel * 0.1) * 100)}% · 修炼经验 +${Math.round(artifact.effect.expBonus * (1 + currentLevel * 0.1) * 100)}%
                </div>
                ` : ''}
            </div>
            ${isMaxLevel ? `
                <div style="text-align: center; color: #ffd700; padding: 20px; font-size: 16px;">
                    ⭐ 星尘魔器已达最高等级！
                </div>
            ` : `
                <div style="color: #aaa; font-size: 13px; margin-bottom: 10px;">使用精魄为星尘魔器注入能量：</div>
                ${soulEssenceHtml}
            `}
            <div onclick="this.parentElement.remove()" style="
                margin-top: 15px;
                padding: 10px;
                background: #444477;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                color: #ccccff;
                font-size: 14px;
            " onmouseover="this.style.background='#555588'" onmouseout="this.style.background='#444477'">
                关闭
            </div>
        `;

        document.body.appendChild(dialog);
    }


// 导出模块集合
export const GameArtifactUpgrade = {
    showArtifactUpgradePanel
};

export default GameArtifactUpgrade;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameArtifactUpgrade = GameArtifactUpgrade;
}