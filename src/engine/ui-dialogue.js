/**
 * UI 对话弹窗模块
 * 
 * 从ui.js拆分出的独立对话弹窗渲染模块
 * 包含：NPC对话弹窗、送礼选择弹窗
 */

/**
 * 显示NPC对话弹窗
 * 绑定到UI对象调用：UIDialogue.showNPCDialog.call(UI, npc, message, availableQuests)
 */
export function showNPCDialog(npc, message, availableQuests) {
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
        border: 2px solid #6666aa;
        border-radius: 15px;
        padding: 30px;
        min-width: 400px;
        max-width: 500px;
        z-index: 1000;
        box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
    `;
    
    dialog.innerHTML = `
        <div style="font-size: 22px; color: #ffd700; margin-bottom: 15px; font-weight: bold;">
            ${npc.name}
            <span style="font-size: 14px; color: #aaa; font-weight: normal;">${npc.title || ''}</span>
        </div>
        <div style="font-size: 16px; color: #e0e0ff; line-height: 1.8; margin-bottom: 25px; white-space: pre-line;">
            ${message}
        </div>
        ${availableQuests && availableQuests.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <div style="color: #88ff88; font-size: 14px; margin-bottom: 10px;">📜 可接任务：</div>
                ${availableQuests.map(questId => {
                    const quest = QuestSystem.getQuest(questId);
                    if (!quest) return '';
                    return `
                        <div onclick="acceptQuestFromDialog('${questId}')" style="
                            display: block;
                            width: 100%;
                            padding: 10px 15px;
                            margin-bottom: 8px;
                            background: rgba(50, 80, 50, 0.5);
                            border: 1px solid #55aa55;
                            border-radius: 8px;
                            color: #aaffaa;
                            cursor: pointer;
                            text-align: left;
                            font-size: 14px;
                        ">
                            📜 ${quest.name}
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <div onclick="showGiftSelection('${npc.id}')" style="
                padding: 8px 25px;
                background: rgba(150, 80, 150, 0.6);
                border: 1px solid #aa66aa;
                border-radius: 8px;
                color: #ddaadd;
                cursor: pointer;
                display: inline-block;
                font-size: 14px;
            ">🎁 送礼</div>
            <div onclick="this.parentElement.parentElement.parentElement.remove()" style="
                padding: 8px 25px;
                background: #444477;
                border: 1px solid #666699;
                border-radius: 8px;
                color: #ccccff;
                cursor: pointer;
                display: inline-block;
                font-size: 14px;
            ">关闭</div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    window.acceptQuestFromDialog = (questId) => {
        Game.acceptQuest(questId);
        dialog.remove();
    };
}

/**
 * 显示礼物选择弹窗
 * 绑定到UI对象调用：UIDialogue.showGiftSelection.call(UI, npcId)
 */
export function showGiftSelection(npcId) {
    const npc = DataManager.getCharacter(npcId);
    if (!npc) return;

    // 获取背包中可送的物品（排除装备）
    const giftableItems = Player.inventory.filter(item => {
        const itemData = DataManager.getItem(item.itemId);
        return itemData && itemData.type !== 'equipment' && itemData.type !== 'key';
    });

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 30, 0.98);
        border: 2px solid #aa66aa;
        border-radius: 15px;
        padding: 30px;
        min-width: 400px;
        max-width: 500px;
        max-height: 70vh;
        overflow-y: auto;
        z-index: 99999;
        box-shadow: 0 0 40px rgba(150, 80, 150, 0.3);
    `;

    const giftPrefs = npc.giftPreferences || {};
    const lovedItems = giftPrefs.loved || [];
    const likedItems = giftPrefs.liked || [];
    const dislikedItems = giftPrefs.disliked || [];

    dialog.innerHTML = `
        <div style="font-size: 20px; color: #ddaadd; margin-bottom: 15px; font-weight: bold;">
            🎁 给 ${npc.name} 送礼
        </div>
        <div style="font-size: 13px; color: #999; margin-bottom: 15px;">
            选择要送出的物品（每天最多送 ${giftPrefs.dailyGiftLimit || 3} 次）
        </div>
        ${giftableItems.length === 0 ? `
            <div style="color: #888; text-align: center; padding: 30px;">
                背包里没有可送的物品...
            </div>
        ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${giftableItems.map(item => {
                    const itemData = DataManager.getItem(item.itemId);
                    if (!itemData) return '';
                    
                    let preferenceLabel = '';
                    let preferenceColor = '#aaa';
                    if (lovedItems.includes(item.itemId)) {
                        preferenceLabel = '❤️ 喜欢';
                        preferenceColor = '#ff88aa';
                    } else if (likedItems.includes(item.itemId)) {
                        preferenceLabel = '👍 不错';
                        preferenceColor = '#88ff88';
                    } else if (dislikedItems.includes(item.itemId)) {
                        preferenceLabel = '👎 不喜欢';
                        preferenceColor = '#ff8866';
                    }
                    
                    return `
                        <div onclick="giveGiftToNPC('${npcId}', '${item.itemId}')" style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px 15px;
                            background: rgba(60, 40, 60, 0.6);
                            border: 1px solid #775577;
                            border-radius: 8px;
                            color: #e0e0ff;
                            cursor: pointer;
                            font-size: 14px;
                        " onmouseover="this.style.background='rgba(80, 50, 80, 0.8)'" onmouseout="this.style.background='rgba(60, 40, 60, 0.6)'">
                            <div>
                                <span style="font-size: 18px;">${itemData.icon || '📦'}</span>
                                <span style="margin-left: 8px;">${itemData.name}</span>
                                <span style="color: #888; margin-left: 8px;">x${item.count}</span>
                            </div>
                            <div style="color: ${preferenceColor}; font-size: 12px;">
                                ${preferenceLabel}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `}
        <div style="text-align: right; margin-top: 20px;">
            <div onclick="this.parentElement.parentElement.remove()" style="
                padding: 8px 25px;
                background: #444477;
                border: 1px solid #666699;
                border-radius: 8px;
                color: #ccccff;
                cursor: pointer;
                display: inline-block;
                font-size: 14px;
            ">取消</div>
        </div>
    `;

    document.body.appendChild(dialog);

    window.giveGiftToNPC = (npcId, itemId) => {
        const result = Game.giveGift(npcId, itemId);
        if (result.success) {
            dialog.remove();
            // 关闭对话窗口
            const npcDialog = document.querySelector('[style*="z-index: 1000"]');
            if (npcDialog) npcDialog.remove();
        }
    };
}

// 导出模块集合
export const UIDialogue = {
    showNPCDialog,
    showGiftSelection
};

export default UIDialogue;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIDialogue = UIDialogue;
    // 全局函数兼容（HTML onclick调用）
    window.showGiftSelection = (npcId) => UIDialogue.showGiftSelection.call(window.UI || {}, npcId);
}
