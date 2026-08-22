/**
 * 游戏主流程 - 对话界面模块
 * 
 * 从game.js拆分出的独立对话界面模块
 * 包含：显示对话界面（_showDialogueScreen）
 */

export function _showDialogueScreen(npc, dialogueData, isFirstDialogue = false) {
        try {
        console.log('[对话调试] 开始显示对话界面, NPC:', npc.name, '节点:', dialogueData.nodeId);
        // v0.93.0: restore clicks, close messages, clear overlays first
        if (typeof UI !== 'undefined' && UI._restoreClicks) {
            UI._restoreClicks();
        }
        document.querySelectorAll('.msg-overlay, .msg-box, #message-blocker, .rest-overlay, .ei-overlay, .npc-dialog-overlay, .daily-overlay').forEach(el => el.remove());
        console.log('[对话调试] 清理旧弹窗完成');
        
        const npcState = NPCStateSystem.getNPCState(npc.id);
        const relationLevel = NPCStateSystem.getRelationshipLevel(npc.id);
        const dialogueTone = NPCStateSystem.getDialogueTone(npc.id);

        // v0.29.0: NPC等级反应 - 根据双方等级差生成开场白
        // v2.9.3: 使用统一方法获取NPC等级
        let npcLevel = this.getNPCLevel(npc.id);
        if (npcLevel === 0) npcLevel = npc.level || 1;
        // v2.9.3: 等级不明确时显示???
        const npcLevelDisplay = npc.levelDisplay || `Lv.${npcLevel}`;
        const playerLevel = Player.level || 1;
        const levelDiff = playerLevel - npcLevel;
        let levelReaction = '';
        if (levelDiff >= 5) {
            levelReaction = `（${npc.name}的目光在你身上停留了一瞬，似乎在重新评估你的实力。）`;
        } else if (levelDiff >= 3) {
            levelReaction = `（${npc.name}微微点头，对你的进步表示认可。）`;
        } else if (levelDiff >= 1) {
            levelReaction = `（${npc.name}看了看你，嘴角带着一丝竞争的意味。）`;
        } else if (levelDiff === 0) {
            levelReaction = `（你和${npc.name}的实力不相上下，空气中弥漫着微妙的竞争感。）`;
        } else if (levelDiff >= -2) {
            levelReaction = `（${npc.name}的语气中带着一丝前辈的从容。）`;
        } else if (levelDiff >= -5) {
            levelReaction = `（${npc.name}拍了拍你的肩膀，"继续努力，你还有很大的提升空间。"）`;
        } else {
            levelReaction = `（${npc.name}看你的眼神像在看一个需要保护的后辈。）`;
        }

        // v0.39.0: NPC对玩家影响力的反应
        let influenceReaction = '';
        const influenceTier = Player.getInfluenceTier ? Player.getInfluenceTier() : { level: 0, name: '无名小卒' };
        if (influenceTier.level >= 3) {
            influenceReaction = `（${npc.name}的态度明显郑重了许多，"你的名字我听说过，${influenceTier.name}。"）`;
        } else if (influenceTier.level >= 2) {
            influenceReaction = `（${npc.name}似乎对你有些印象，"你就是最近小有名气的那个新人？"）`;
        } else if (influenceTier.level >= 1) {
            influenceReaction = `（${npc.name}多看了你一眼，似乎觉得你有些特别。）`;
        }

        // v0.44.0: NPC提及其他NPC - 基于NPC-NPC关系，让社交网络可感知
        // v0.46.1: 首次对话必触发，后续40%概率
        let npcMention = '';
        const mentionChance = isFirstDialogue ? 1.0 : 0.4;
        if (this._npcSchedules && Math.random() < mentionChance) {
            const otherNPCs = Object.keys(this._npcSchedules).filter(id => id !== npc.id);
            if (otherNPCs.length > 0) {
                const otherId = otherNPCs[Math.floor(Math.random() * otherNPCs.length)];
                const otherData = DataManager.getCharacter(otherId);
                const otherName = otherData ? otherData.name : this._npcSchedules[otherId].name;
                const rel = NPCStateSystem.getNPCRelationship(npc.id, otherId);
                const opinion = rel.opinion || 0;
                if (opinion > 30) {
                    npcMention = `（${npc.name}不经意间提到："${otherName}最近也挺努力的，你们可以多交流交流。"）`;
                } else if (opinion > 10) {
                    npcMention = `（${npc.name}随口说道："说起来，${otherName}今天也在学校呢。"）`;
                } else if (opinion < -20) {
                    npcMention = `（${npc.name}皱了皱眉，"别提${otherName}了，那个人……算了。"）`;
                } else if (opinion < -5) {
                    npcMention = `（${npc.name}的语气有些冷淡，"${otherName}？不太熟。"）`;
                }
            }
        }

        // 创建对话界面
        const dialog = document.createElement('div');
        dialog.id = 'dialogue-screen';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            overflow: hidden;
        `;

        // 添加背景图片
        const bgDiv = document.createElement('div');
        bgDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('assets/images/backgrounds/bo_city_view.jpg') center/cover;
            opacity: 0.1;
            filter: blur(5px);
            z-index: 0;
        `;
        dialog.appendChild(bgDiv);

        // 计算好感度进度条百分比
        const opinionPercent = Math.max(0, Math.min(100, (npcState.opinion + 100) / 2));
        const trustPercent = Math.max(0, Math.min(100, (npcState.trust + 100) / 2));
        const familiarityPercent = Math.max(0, Math.min(100, npcState.familiarity));

        console.log('[对话调试] 开始设置innerHTML, 选项数:', dialogueData.choices?.length);
        dialog.innerHTML = `
            <div style="position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px;">
            <!-- 退出按钮 -->
            <div style="position: absolute; top: 20px; right: 20px; z-index: 10;">
                <div onclick="Game._closeDialogue()" style="
                    padding: 8px 20px;
                    background: rgba(60, 60, 100, 0.8);
                    border: 2px solid #7777aa;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(80, 80, 130, 0.9)'" onmouseout="this.style.background='rgba(60, 60, 100, 0.8)'">
                    ✕ 告辞
                </div>
            </div>
            
            <!-- NPC 立绘区域（左上角，含详细信息） -->
            <div style="position: absolute; top: 20px; left: 20px; display: flex; align-items: flex-start; gap: 15px; max-width: 280px;">
                <div style="text-align: center; flex-shrink: 0;">
                    <div style="
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 36px;
                        box-shadow: 0 0 30px ${npc.spriteColor || '#666666'}80;
                        overflow: hidden;
                        background: ${npc.spriteColor || '#666'};
                    ">
                        ${npc.image ? `<img src="${npc.image}" style="width: 100%; height: 100%; object-fit: cover;">` : (npc.elements?.[0] ? this._getElementEmoji(npc.elements[0]) : '👤')}
                    </div>
                    <div style="font-size: 16px; color: #fff; font-weight: bold; margin-top: 8px;">${npc.name}</div>
                    <div style="font-size: 12px; color: #aaa; margin-top: 3px;">${npc.title || ''}</div>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <!-- 关系等级 -->
                    <div style="font-size: 13px; color: ${relationLevel.color}; font-weight: bold; margin-bottom: 8px;">
                        ${relationLevel.name}
                    </div>
                    <!-- NPC等级 -->
                    ${npcLevel > 0 ? `<div style="font-size: 12px; color: #aaddff; margin-bottom: 4px;">⚔️ 等级 ${npcLevelDisplay}</div>` : ''}
                    <!-- 魔法系 -->
                    ${npc.elements && npc.elements.length > 0 ? `
                        <div style="font-size: 12px; color: #ffcc66; margin-bottom: 4px;">
                            🔮 ${npc.elements.map(e => SkillSystem.getElementName(e)).join(' / ')}
                        </div>
                    ` : ''}
                    <!-- 关系数值条（简化版） -->
                    <div style="margin-top: 8px;">
                        <div style="font-size: 11px; color: #ff9999; margin-bottom: 2px;">❤️ 好感 ${Math.round(npcState.opinion)}</div>
                        <div style="height: 3px; background: #333; border-radius: 2px; margin-bottom: 4px;">
                            <div style="height: 100%; width: ${Math.max(0, Math.min(100, (npcState.opinion + 100) / 2))}%; background: linear-gradient(90deg, #ff6666, #ff9999); border-radius: 2px;"></div>
                        </div>
                        <div style="font-size: 11px; color: #99ff99; margin-bottom: 2px;">🤝 信任 ${Math.round(npcState.trust)}</div>
                        <div style="height: 3px; background: #333; border-radius: 2px; margin-bottom: 4px;">
                            <div style="height: 100%; width: ${Math.max(0, Math.min(100, (npcState.trust + 100) / 2))}%; background: linear-gradient(90deg, #66cc66, #99ff99); border-radius: 2px;"></div>
                        </div>
                        <div style="font-size: 11px; color: #9999ff;">👁️ 熟悉 ${Math.round(npcState.familiarity)}</div>
                        <div style="height: 3px; background: #333; border-radius: 2px;">
                            <div style="height: 100%; width: ${Math.max(0, Math.min(100, npcState.familiarity))}%; background: linear-gradient(90deg, #6666cc, #9999ff); border-radius: 2px;"></div>
                        </div>
                        ${(() => {
                            // v2.9.3: 有战力的NPC显示详情按钮（使用NPCGrowthService的当前等级）
                            if (npcLevel > 0 && (npc.skills?.length > 0 || npc.elements?.length > 0)) {
                                return `<div onclick="Game.showNPCDetail('${npc.id}')" style="
                                    margin-top: 10px;
                                    padding: 5px 12px;
                                    background: rgba(80, 100, 150, 0.5);
                                    border: 1px solid #6688bb;
                                    border-radius: 6px;
                                    color: #aaccff;
                                    cursor: pointer;
                                    font-size: 12px;
                                    text-align: center;
                                    transition: all 0.2s;
                                " onmouseover="this.style.background='rgba(100, 120, 180, 0.7)'" onmouseout="this.style.background='rgba(80, 100, 150, 0.5)'">
                                    📊 查看详情
                                </div>`;
                            }
                            return '';
                        })()}
                    </div>
                </div>
            </div>

            <!-- 对话框（v2.9.3优化：居中、大字体、圆角边框，无滚动） -->
            <div style="
                background: rgba(20, 20, 50, 0.95);
                border: 3px solid #6666aa;
                border-radius: 15px;
                padding: 30px;
                width: 90%;
                max-width: 700px;
                box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
            ">
                <!-- 对话文本 -->
                <div id="dialogue-text" style="
                    font-size: 19px;
                    color: #e0e0ff;
                    line-height: 1.8;
                    margin-bottom: 25px;
                    min-height: 60px;
                ">
                    ${levelReaction ? `<div style="color: #888; font-size: 15px; font-style: italic; margin-bottom: 10px; border-left: 3px solid #555; padding-left: 10px;">${levelReaction}</div>` : ''}
                    ${influenceReaction ? `<div style="color: #ffd93d; font-size: 15px; font-style: italic; margin-bottom: 10px; border-left: 3px solid #ffd93d; padding-left: 10px;">${influenceReaction}</div>` : ''}
                    ${npcMention ? `<div style="color: #88ccff; font-size: 15px; font-style: italic; margin-bottom: 10px; border-left: 3px solid #88ccff; padding-left: 10px;">${npcMention}</div>` : ''}
                    ${dialogueData.text}
                </div>

                <!-- 选项列表（v2.9.3优化：已读置灰、任务提示、大字体） -->
                <div id="dialogue-choices" style="display: flex; flex-direction: column; gap: 10px;">
                    ${dialogueData.choices.map((choice, index) => {
                        // v2.9.3: 检查是否已读
                        const isRead = DialogueTree.isChoiceRead(npc.id, DialogueTree.currentNode, choice.id);
                        // v2.9.3: 检查是否可接任务
                        const hasQuest = choice.effects && (choice.effects.triggerQuest || choice.effects.acceptQuest || choice.effects.startQuest || choice.effects.questId);
                        const readStyle = isRead ? 'opacity: 0.5;' : '';
                        const questBorder = hasQuest ? 'border-color: #55aa55; background: rgba(50, 80, 50, 0.6);' : '';
                        return `
                        <div onclick="Game.selectDialogueChoice('${choice.id}')" style="
                            padding: 14px 22px;
                            background: rgba(40, 40, 80, 0.8);
                            border: 2px solid #444477;
                            border-radius: 10px;
                            color: #e0e0ff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 17px;
                            ${readStyle}
                            ${questBorder}
                        " onmouseover="this.style.borderColor='${hasQuest ? '#77cc77' : '#7777bb'}'; this.style.background='${hasQuest ? 'rgba(70, 100, 70, 0.7)' : 'rgba(60, 60, 120, 0.8)'}'
                        " onmouseout="this.style.borderColor='${hasQuest ? '#55aa55' : '#444477'}'; this.style.background='${hasQuest ? 'rgba(50, 80, 50, 0.6)' : 'rgba(40, 40, 80, 0.8)'}'
                        ">
                            <span style="color: #ffd700; margin-right: 12px; font-weight: bold;">${index + 1}.</span>
                            ${choice.text}
                            ${hasQuest ? '<span style="color: #88ff88; margin-left: 10px; font-size: 14px;">📜 可接任务</span>' : ''}
                            ${isRead ? '<span style="color: #888; margin-left: 10px; font-size: 13px;">（已读）</span>' : ''}
                        </div>
                    `}).join('')}
                    ${(() => {
                        // v2.9.3: 非默认节点添加返回上一级选项
                        if (DialogueTree.currentNode !== 'default' && DialogueTree.dialogueHistory.length > 0) {
                            return `
                            <div onclick="Game.selectDialogueChoice('__back__')" style="
                                padding: 14px 22px;
                                background: rgba(60, 60, 80, 0.6);
                                border: 2px solid #666688;
                                border-radius: 10px;
                                color: #aaaacc;
                                cursor: pointer;
                                text-align: center;
                                transition: all 0.3s;
                                font-size: 16px;
                                margin-top: 5px;
                            " onmouseover="this.style.borderColor='#9999bb'; this.style.background='rgba(80, 80, 100, 0.7)'" onmouseout="this.style.borderColor='#666688'; this.style.background='rgba(60, 60, 80, 0.6)'">
                                ↩️ 返回上一级
                            </div>
                            `;
                        }
                        return '';
                    })()}
                    ${npc.canDuel ? `
                        <div onclick="Game.startDuel('${npc.id}')" style="
                            padding: 12px 20px;
                            background: rgba(80, 30, 30, 0.8);
                            border: 2px solid #aa4444;
                            border-radius: 8px;
                            color: #ffaaaa;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.3s;
                            font-size: 15px;
                            margin-top: 8px;
                        " onmouseover="this.style.borderColor='#ff6666'; this.style.background='rgba(120, 40, 40, 0.9)'" onmouseout="this.style.borderColor='#aa4444'; this.style.background='rgba(80, 30, 30, 0.8)'">
                            ⚔️ 切磋/挑战
                        </div>
                    ` : ''}
                    ${(() => {
                        // v0.19.0: 社交互动按钮（朋友级+可深交NPC）
                        const score = npcState.opinion * 0.6 + npcState.trust * 0.3 + npcState.familiarity * 0.1;
                        const canSocial = score >= 45;
                        if (canSocial) {
                            return `<div onclick="Game.showSocialInvite('${npc.id}')" style="
                                padding: 12px 20px;
                                background: rgba(40, 60, 80, 0.8);
                                border: 2px solid #5588aa;
                                border-radius: 8px;
                                color: #aaddff;
                                cursor: pointer;
                                text-align: center;
                                transition: all 0.3s;
                                font-size: 15px;
                                margin-top: 8px;
                            " onmouseover="this.style.borderColor='#77bbff'; this.style.background='rgba(50, 80, 110, 0.9)'" onmouseout="this.style.borderColor='#5588aa'; this.style.background='rgba(40, 60, 80, 0.8)'">
                                🤝 邀请一起活动
                            </div>`;
                        }
                        return '';
                    })()}
                </div>
            </div>
            </div>
        `;

        document.body.appendChild(dialog);
        console.log('[对话调试] 对话界面显示完成');
        } catch (e) {
            console.error('_showDialogueScreen error:', e);
            UI.showMessage('对话界面出错：' + e.message);
            this._closeDialogue();
        }
    }


// 导出模块集合
export const GameDialogue = {
    _showDialogueScreen
};

export default GameDialogue;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameDialogue = GameDialogue;
}