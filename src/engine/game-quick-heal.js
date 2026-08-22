/**
 * 游戏主流程 - 快速治疗模块
 * 
 * 从game.js拆分出的独立快速治疗模块
 * 包含：快速治疗（quickHeal）
 */

export function quickHeal() {
        const hpRatio = Player.hp / Player.maxHp;
        const mpRatio = Player.mp / Player.maxMp;

        // 状态良好，不需要恢复
        if (hpRatio >= 0.9 && mpRatio >= 0.9) {
            UI.showMessage('✨ 状态良好，HP/MP均在90%以上，无需使用药品！');
            return;
        }

        // 获取背包中的恢复药品
        const allItems = Inventory.getAllItems();
        const healItems = [];

        for (const item of allItems) {
            if (!item.data || item.data.type !== 'consumable' || !item.data.effects) continue;
            if (!item.data.usableOutOfBattle) continue;
            const eff = item.data.effects;
            if (eff.hp || eff.mp || eff.stamina) {
                healItems.push({
                    itemId: item.itemId,
                    name: item.data.name,
                    icon: item.data.icon,
                    hp: eff.hp || 0,
                    mp: eff.mp || 0,
                    stamina: eff.stamina || 0,
                    count: item.count || 0
                });
            }
        }

        if (healItems.length === 0) {
            UI.showMessage('💊 背包中没有恢复药品！\n可以去商店购买治愈药水或魔法药水。');
            return;
        }

        // 按恢复量从小到大排序（优先用小药品，避免浪费）
        healItems.sort((a, b) => (a.hp + a.mp) - (b.hp + b.mp));

        const usedItems = [];
        let totalHpHealed = 0;
        let totalMpHealed = 0;

        // 循环使用药品，直到HP/MP都>=80%或没有药品
        for (const healItem of healItems) {
            while (healItem.count > 0) {
                const needHp = Player.hp < Player.maxHp * 0.9;
                const needMp = Player.mp < Player.maxMp * 0.9;
                if (!needHp && !needMp) break;

                // 只有当药品能恢复需要的属性时才使用
                if ((needHp && healItem.hp > 0) || (needMp && healItem.mp > 0)) {
                    const result = Inventory.useItem(healItem.itemId, false);
                    if (result.success) {
                        healItem.count--;
                        usedItems.push(healItem.name);
                        if (healItem.hp > 0) totalHpHealed += healItem.hp;
                        if (healItem.mp > 0) totalMpHealed += healItem.mp;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            if (Player.hp >= Player.maxHp * 0.9 && Player.mp >= Player.maxMp * 0.9) break;
        }

        if (usedItems.length === 0) {
            UI.showMessage('💊 没有合适的恢复药品！\n需要治愈药水（恢复HP）或魔法药水（恢复MP）。');
            return;
        }

        let msg = `💊 一键恢复，使用了 ${usedItems.length} 个药品：\n`;
        msg += usedItems.join('、') + '\n';
        if (totalHpHealed > 0) msg += `HP恢复约 ${totalHpHealed}\n`;
        if (totalMpHealed > 0) msg += `MP恢复约 ${totalMpHealed}\n`;
        msg += `\n当前HP: ${Player.hp}/${Player.maxHp}，MP: ${Player.mp}/${Player.maxMp}`;

        Player.save();
        UI.renderMapScreen();
        UI.showMessage(msg);
    }


// 导出模块集合
export const GameQuickHeal = {
    quickHeal
};

export default GameQuickHeal;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameQuickHeal = GameQuickHeal;
}