/**
 * 游戏主流程 - NPC列表模块
 * 
 * 从game.js拆分出的独立NPC列表模块
 * 包含：显示NPC列表（showNPCList）
 */

export function showNPCList(npcs, unavailableNpcs = []) {
        // 参数校验
        if (!npcs) npcs = [];
        if (!Array.isArray(npcs)) npcs = [];

        // v2.9.3: 根据成长系统的location字段过滤NPC（NPC位置动态变化）
        const currentLocation = Player.currentLocation;
        const filteredNpcs = npcs.filter(npcItem => {
            // 兼容两种格式：npcItem可能是ID字符串，也可能是完整的NPC对象
            const npc = typeof npcItem === 'string' ? DataCharacters[npcItem] : npcItem;
            if (!npc) {
                console.log('[NPC过滤] npcItem:', typeof npcItem === 'string' ? npcItem : npcItem.id, '对应的NPC不存在');
                return false;
            }
            // 如果NPC有location字段且不为空，则只显示location匹配的NPC
            if (npc.location) {
                const match = npc.location === currentLocation;
                return match;
            }
            // 没有location字段，默认显示
            return true;
        });
        npcs = filteredNpcs;

        // 如果过滤后没有NPC，显示提示
        if (npcs.length === 0 && (!unavailableNpcs || unavailableNpcs.length === 0)) {
            UI.showMessage('这里现在没有人...');
            return;
        }

        // 创建 NPC 选择弹窗的遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 99998;
            cursor: pointer;
        `;
        overlay.addEventListener('click', () => {
            overlay.remove();
            dialog.remove();
        });
        
        // 创建 NPC 选择弹窗
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
            min-width: 380px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 99999;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        // 生成可用NPC的HTML
        const availableNpcsHtml = npcs.map(npc => {
            const canTalk = NPCStateSystem.canTalkTo(npc.id);
            const hint = NPCStateSystem.getDialogueRequirementHint(npc.id);
            const availableQuests = QuestSystem.getAvailableQuestsForNPC(npc.id);
            const hasQuest = availableQuests.length > 0;
            
            // v3.1.0: 检查是否有新对话
            const newContent = NPCStateSystem.checkNewContent(npc.id);
            const hasNewDialogue = newContent.hasNew;
            
            // v2.9.3: 获取NPC当前等级和元素系（含成长）
            let npcLevel = 0;
            let npcElements = [];
            if (typeof NPCGrowthService !== 'undefined') {
                // v2.9.3: 使用统一方法获取NPC等级和元素系
                npcLevel = this.getNPCLevel(npc.id);
                npcElements = npc.elements || [];
                // 尝试从NPCGrowthService获取成长后的元素系
                if (typeof NPCGrowthService !== 'undefined') {
                    const npcState = NPCGrowthService.getNpcState(npc.id);
                    if (npcState && npcState.elements && npcState.elements.length > 0) {
                        npcElements = npcState.elements;
                    }
                }
            }
            const hasCombat = npcLevel > 0 && npcElements.length > 0;
            const realmName = hasCombat ? this._getRealmName(npcLevel) : '';
            // v2.9.3: 等级不明确时显示???
            const npcLevelDisplay = npc.levelDisplay || (hasCombat ? `Lv.${npcLevel} ${realmName}` : '');
            
            // 元素系图标
            const elementsIcons = npcElements.slice(0, 3).map(el => {
                const info = this._getElementInfo(el);
                return `<span style="color: ${info.color}; font-size: 14px;" title="${info.name}">${info.icon}</span>`;
            }).join('');
            
            if (canTalk) {
                const borderColor = hasQuest ? '#ffcc00' : (hasNewDialogue ? '#44dd88' : '#444477');
                const hoverColor = hasQuest ? '#ffdd44' : (hasNewDialogue ? '#66ffaa' : '#7777bb');
                return `
                    <div onclick="talkToNPC('${npc.id}')" style="
                        padding: 15px 20px;
                        background: rgba(40, 40, 80, 0.8);
                        border: 2px solid ${borderColor};
                        border-radius: 10px;
                        color: #e0e0ff;
                        cursor: pointer;
                        text-align: left;
                        transition: all 0.3s;
                        font-size: 16px;
                        position: relative;
                    " onmouseover="this.style.borderColor='${hoverColor}'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='${borderColor}'; this.style.background='rgba(40, 40, 80, 0.8)'">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <div style="font-weight: bold; font-size: 17px;">
                                    ${npc.name}
                                    ${hasQuest ? '<span style="color: #ffcc00; font-size: 20px; margin-left: 8px;">❗</span>' : ''}
                                    ${hasNewDialogue && !hasQuest ? '<span style="color: #44dd88; font-size: 18px; margin-left: 8px;">💬</span>' : ''}
                                    ${hasCombat ? `<span style="color: #ffd700; font-size: 13px; margin-left: 10px; background: rgba(255,215,0,0.1); padding: 2px 8px; border-radius: 8px;">${npcLevelDisplay}</span>` : ''}
                                </div>
                                <div style="font-size: 13px; color: #999; margin-top: 3px;">
                                    ${npc.title || ''}
                                    ${hasCombat && elementsIcons ? `<span style="margin-left: 10px;">${elementsIcons}</span>` : ''}
                                    ${hasQuest ? '<span style="color: #ffcc00; margin-left: 8px;">有任务可接</span>' : ''}
                                    ${hasNewDialogue && !hasQuest ? '<span style="color: #44dd88; margin-left: 8px;">有新对话</span>' : ''}
                                </div>
                            </div>
                            ${hasCombat ? `
                                <div onclick="event.stopPropagation(); Game.showNPCDetail('${npc.id}')" style="
                                    padding: 6px 10px;
                                    background: rgba(80, 100, 150, 0.4);
                                    border: 1px solid #6688bb;
                                    border-radius: 6px;
                                    color: #aaccff;
                                    cursor: pointer;
                                    font-size: 12px;
                                    white-space: nowrap;
                                    margin-left: 10px;
                                " onmouseover="this.style.background='rgba(100, 120, 180, 0.6)'" onmouseout="this.style.background='rgba(80, 100, 150, 0.4)'">
                                    📊 详情
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <button onclick="showCannotTalkHint('${npc.id}')" style="
                        padding: 15px 20px;
                        background: rgba(40, 40, 40, 0.6);
                        border: 2px solid #555;
                        border-radius: 10px;
                        color: #888;
                        cursor: not-allowed;
                        text-align: left;
                        font-size: 16px;
                        opacity: 0.7;
                    ">
                        <div style="font-weight: bold; font-size: 17px;">
                            🔒 ${npc.name}
                        </div>
                        <div style="font-size: 13px; color: #777; margin-top: 3px;">
                            ${npc.title || ''}
                        </div>
                        ${hint ? `
                            <div style="font-size: 12px; color: #ff9966; margin-top: 5px;">
                                ⚠️ ${hint}
                            </div>
                        ` : ''}
                    </button>
                `;
            }
        }).join('');
        
        // 生成不可用NPC的HTML（因为时间不对而不在的）
        const periodNames = {
            morning: '🌅 早上',
            afternoon: '☀️ 下午',
            evening: '🌆 傍晚',
            night: '🌙 夜晚'
        };
        
        const unavailableNpcsHtml = unavailableNpcs.map(npc => {
            const availableTimesText = npc.availableTimes 
                ? npc.availableTimes.map(t => periodNames[t] || t).join('、')
                : '未知';
            
            return `
                <div style="
                    padding: 15px 20px;
                    background: rgba(30, 30, 30, 0.5);
                    border: 1px dashed #555;
                    border-radius: 10px;
                    color: #666;
                    text-align: left;
                    font-size: 16px;
                    opacity: 0.6;
                ">
                    <div style="font-weight: bold; font-size: 17px;">
                        💤 ${npc.name}（不在）
                    </div>
                    <div style="font-size: 13px; color: #555; margin-top: 3px;">
                        ${npc.title || ''}
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 5px;">
                        🕐 出现时间：${availableTimesText}
                    </div>
                </div>
            `;
        }).join('');
        
        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 20px; font-weight: bold;">
                💬 选择对话对象
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${npcs.length > 0 ? availableNpcsHtml : `
                    <div style="color: #888; text-align: center; padding: 20px;">
                        现在这里没有人...
                    </div>
                `}
                ${unavailableNpcs.length > 0 ? `
                    <div style="font-size: 14px; color: #888; margin-top: 15px; margin-bottom: 5px; border-top: 1px solid #444; padding-top: 15px;">
                        💤 现在不在
                    </div>
                    ${unavailableNpcsHtml}
                ` : ''}
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <div onclick="closeNpcSelectDialog()" style="
                    display: inline-block;
                    padding: 8px 25px;
                    background: #444477;
                    border: 1px solid #666699;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    font-size: 14px;
                ">取消</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        const closeDialog = () => {
            overlay.remove();
            dialog.remove();
        };
        
        window.closeNpcSelectDialog = closeDialog;
        
        window.talkToNPC = (npcId) => {
            closeDialog();
            this.startDialogue(npcId);
        };
        
        window.showCannotTalkHint = (npcId) => {
            const npc = DataManager.getCharacter(npcId);
            const hint = NPCStateSystem.getDialogueRequirementHint(npcId);
            if (hint) {
                UI.showMessage(`${npc.name}现在还不想和你说话。\n条件：${hint}`);
            } else {
                UI.showMessage(`${npc.name}现在不想和你说话。`);
            }
        };
    }


// 导出模块集合
export const GameNPCList = {
    showNPCList
};

export default GameNPCList;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameNPCList = GameNPCList;
}