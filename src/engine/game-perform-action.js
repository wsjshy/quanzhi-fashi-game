/**
 * 游戏主流程 - 行动执行模块
 * 
 * 从game.js拆分出的独立行动执行模块
 * 包含：执行行动（performAction）
 */

export function performAction(actionId) {
        try {
        // 防护0：时间间隔防护 - 两次行动间隔小于1秒则取消，防止点击穿透/延迟触发
        const now = Date.now();
        if (now - this._lastActionTime < 1000) {
            return;
        }
        this._lastActionTime = now;
        
        // 安全检查：如果检测到卡住状态（有message-showing类但没有实际弹窗），自动恢复
        if (document.body.classList.contains('message-showing')) {
            const hasPopup = document.querySelector('.mobile-popup');
            const hasOverlay = document.querySelector('.mobile-popup-overlay');
            if (!hasPopup && !hasOverlay) {
                console.log('[安全] 检测到卡住状态，自动恢复点击');
                document.body.classList.remove('message-showing');
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.pointerEvents = '';
                }
                this._actionCooldown = false;
                if (typeof UI !== 'undefined') {
                    UI._isMessageShowing = false;
                }
            }
        }
        
        // 防护0.5：消息关闭后短时间内禁止行动，防止点击穿透
        if (typeof UI !== 'undefined' && UI._lastMessageCloseTime) {
            const timeSinceMessageClose = now - UI._lastMessageCloseTime;
            if (timeSinceMessageClose < 2000) {
                return;
            }
        }
        
        // 防护1：如果有消息弹窗显示，不执行行动
        if (UI._isMessageShowing) {
            return;
        }
        
        // 防护2：如果在行动冷却期，不执行行动
        if (this._actionCooldown) {
            return;
        }
        
        // 防护3：直接检查页面上是否有消息弹窗元素，防止状态不同步
        const hasPopup = document.querySelector('.mobile-popup');
        if (hasPopup) {
            return;
        }
        
        // 防护4：检查body是否有message-showing类
        if (document.body.classList.contains('message-showing')) {
            return;
        }
        
        // DEBUG: 把调用栈显示在页面上（已注释，需要时再打开）
        // try {
        //     const err = new Error();
        //     const stack = err.stack || '';
        //     const debugDiv = document.getElementById('debug-error');
        //     if (debugDiv) {
        //         debugDiv.style.display = 'block';
        //         debugDiv.style.background = '#006600';
        //         debugDiv.textContent = `[DEBUG] 执行行动: ${actionId}\n时间: ${Player.day}天 ${Player.hour}点\n消息弹窗: ${UI._isMessageShowing}\n冷却: ${this._actionCooldown}\n间隔: ${now - this._lastActionTime}ms\n消息关闭后: ${typeof UI !== 'undefined' && UI._lastMessageCloseTime ? now - UI._lastMessageCloseTime + 'ms' : 'N/A'}\n\n调用栈:\n${stack}`;
        //     }
        // } catch (e) {
        //     console.error('DEBUG显示失败', e);
        // }
        
        // v2.8.4: 修炼时间固定为2小时，移除四档选择减少玩家决策压力，留更多时间探索
        if (actionId === 'train') {
            this.performCultivate(actionId, 2, 1.0);
            return;
        }
        
        // 检查逃课惩罚（有课时不上课）
        const location = DataManager.getLocation(Player.currentLocation);
        const currentClass = TimeSystem.getCurrentClass(location);
        const action = location?.actions?.find(a => a.id === actionId);

        // 检查行动条件（如等级限制）
        if (action && action.condition) {
            if (action.condition.level && Player.level < action.condition.level) {
                UI.showMessage(`⚠️ 需要等级 ${action.condition.level} 才能执行此行动！（当前等级 ${Player.level}）`);
                return;
            }
            if (action.condition.minLevel && Player.level < action.condition.minLevel) {
                UI.showMessage(`⚠️ 需要等级 ${action.condition.minLevel} 才能执行此行动！（当前等级 ${Player.level}）`);
                return;
            }
        }
        
        // v0.16.0: 移除逃课惩罚，课程变为可选成长手段
        // 有课时状态栏会提示，但不强制，逃课不扣声望
        // v2.9.3优化：课程提示移到行动执行成功后，避免与对话/商店等弹窗同时显示导致遮挡
        // 利用UI.showMessage的消息队列机制，弹窗打开时消息会排队，等弹窗关闭后再显示

        const result = MapSystem.performAction(actionId);
        
        if (!result.success) {
            UI.showMessage(result.message);
            return;
        }

        // 行动成功后显示课程提示（如果有）
        if (currentClass && action && !action.isClassAction && actionId !== 'sleep' && actionId !== 'rest') {
            if (!Player.flags['skipped_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()]) {
                Player.flags['skipped_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()] = true;
                // 仅提示，不惩罚
                UI.showMessage(`💡 现在有${currentClass.name}（老师${DataManager.getCharacter(currentClass.teacher)?.name || '未知'}），不过你可以自由安排时间。`);
            }
        }

        // v0.9.9: 记录行动探索（排除休息/等待类重复行动）
        const skipActions = ['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full'];
        if (!skipActions.includes(actionId)) {
            if (!Player.exploredActions) Player.exploredActions = {};
            if (!Player.exploredActions[Player.currentLocation]) {
                Player.exploredActions[Player.currentLocation] = [];
            }
            if (!Player.exploredActions[Player.currentLocation].includes(actionId)) {
                Player.exploredActions[Player.currentLocation].push(actionId);
            }
        }

        // 如果是上课行动，根据课程表动态调整奖励
        if (action && action.isClassAction && currentClass) {
            result.effects = result.effects || {};
            result.effects.exp = currentClass.exp || result.effects.exp;
            if (currentClass.mpCost) result.effects.mp = -currentClass.mpCost;
            if (currentClass.hpCost) result.effects.hp = -(currentClass.hpCost);
            
            // 实践课有受伤概率
            if (currentClass.injuryChance && Math.random() < currentClass.injuryChance) {
                const injury = Math.floor(Player.maxHp * 0.2);
                Player.hp = Math.max(1, Player.hp - injury);
                result.effects.hp = (result.effects.hp || 0) - injury;
                UI.showMessage(`💥 实践课上不小心受伤了，损失 ${injury} HP！`);
            }
            
            // 标记已上课
            Player.flags['attended_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()] = true;
        }

        // 更新任务进度（在当前地点执行行动，视为到达该地点）
        const completedQuests = QuestSystem.updateProgress('reach', Player.currentLocation, 1);
        
        // 日常追踪：探索类行动
        if (actionId && actionId.includes('explore')) {
            DailySystem.trackActivity('explore', 1);
        }
        // 日常追踪：获得金币
        if (result.effects && result.effects.gold) {
            DailySystem.trackActivity('earn_gold', result.effects.gold);
        }
        
        // 保存游戏
        Player.save();
        
        // v0.13.0: 自动解锁检查 - 检查是否满足未解锁地点的条件
        this.checkAutoUnlockLocations();
        
        // 先刷新界面，确保数据更新
        UI.renderMapScreen();
        
        // 显示任务完成奖励
        if (completedQuests && completedQuests.length > 0) {
            completedQuests.forEach(q => {
                if (q.rewards && q.rewards.length > 0) {
                    UI.showMessage(`🎉 ${q.message}\n${q.rewards.join('\n')}`);
                }
            });
        }
        
        // 显示效果消息
        let message = '';
        if (result.effects) {
            if (result.effects.exp) message += `获得 ${result.effects.exp} 经验\n`;
            if (result.effects.hp) message += result.effects.hp > 0 ? `恢复 ${result.effects.hp} HP\n` : `损失 ${-result.effects.hp} HP\n`;
            if (result.effects.mp) message += result.effects.mp > 0 ? `恢复 ${result.effects.mp} MP\n` : `损失 ${-result.effects.mp} MP\n`;
            if (result.effects.stamina) message += result.effects.stamina > 0 ? `恢复 ${result.effects.stamina} 体力\n` : `消耗 ${-result.effects.stamina} 体力\n`;
            if (result.effects.levelUps) {
                message += `🎉 升级了！当前等级 ${Player.level}\n`;
                message += `获得属性点（当前可分配：${Player.attributePoints} 点）\n`;
                // 天生天赋进化提示
                if (Player._innateTalentEvolved) {
                    const talentData = typeof DataInnateTalents !== 'undefined' ? DataInnateTalents[Player.innateTalent] : null;
                    const talentName = talentData?.name || '天生天赋';
                    message += `✨ ${talentName} 进化到 Lv.${Player.innateTalentLevel}！效果增强！\n`;
                    Player._innateTalentEvolved = false;
                }
            }
            if (result.effects.addItem) {
                const item = Inventory.getItem(result.effects.addItem.itemId);
                const itemName = item?.name || result.effects.addItem.itemId;
                message += `获得 ${itemName} ×${result.effects.addItem.count}\n`;
            }
        }
        
        // 检查强制昏睡
        if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
            message = `😴 你熬夜太晚，不知不觉昏睡了过去...\n\n（第二天早上醒来，感觉没睡好，体力只恢复了50%）\n\n` + message;
        }

        // v0.24.0: NPC自主日程——检查当前地点是否有NPC在做自己的事
        const npcEncounter = this._checkNPCEncounter();
        if (npcEncounter) {
            message += npcEncounter.message;
        }

        // v0.28.0: NPC成长里程碑传闻（即使没有偶遇NPC也可能听到）
        if (typeof NPCStateSystem !== 'undefined' && NPCStateSystem.consumePendingNPCRumors) {
            const rumors = NPCStateSystem.consumePendingNPCRumors();
            for (const rumor of rumors) {
                const charData = DataManager.getCharacter(rumor.npcId);
                const name = charData?.name || rumor.npcId;
                const rumorTexts = {
                    5: `听说${name}最近突破到了Lv.${rumor.level}，修炼速度真快啊。`,
                    8: `${name}已经Lv.${rumor.level}了？这家伙的进步速度有点吓人。`,
                    10: `${name}突破Lv.${rumor.level}了！听说他在修炼场待了整整三天。`,
                    12: `Lv.${rumor.level}的${name}...已经不是普通学生能比的了。`,
                    15: `${name}达到Lv.${rumor.level}了！这已经是中阶法师的水平了。`,
                    18: `Lv.${rumor.level}...${name}的实力已经逼近高阶了。`,
                    20: `${name}突破Lv.${rumor.level}！整个学校都在议论这件事。`
                };
                const text = rumorTexts[rumor.level] || `听说${name}突破到了Lv.${rumor.level}。`;
                message += `\n\n📢 传闻：${text}`;
            }
        }

        // v0.24.0: 隐藏修炼地点——探索时有概率发现
        const skipForDiscovery = ['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full', 'talk'];
        if (!skipForDiscovery.includes(actionId)) {
            const hiddenSpot = this._checkHiddenSpotDiscovery();
            if (hiddenSpot) {
                message += `\n\n🔮 你发现了一个隐秘的修炼地点：${hiddenSpot.name}！\n${hiddenSpot.desc}\n（修炼经验+${Math.round(hiddenSpot.expBonus * 100)}%，可使用${hiddenSpot.usesRemaining}次）`;
            }
            // v0.25.0: 探索计数
            Player._totalExploreCount = (Player._totalExploreCount || 0) + 1;
            if (typeof QuestSystem !== 'undefined') {
                QuestSystem.updateProgress('explore', null, 1);
                // v1.8.2: 调查类任务进度（猎妖任务的调查目标）
                QuestSystem.updateProgress('investigate', Player.currentLocation, 1);
            }
            // v1.8.1: 阴谋调查线索触发（探索时概率获得线索）
            if (typeof InvestigationSystem !== 'undefined') {
                const clueResult = InvestigationSystem.tryDiscoverClue(Player, 0.15, null);
                if (clueResult && clueResult.success) {
                    message += `\n\n🔍 发现新线索：${clueResult.clue.name}\n${clueResult.clue.description}`;
                    // 宇昂疑点达到3条时的特殊提示
                    if (clueResult.yuAngSuspicionTriggered) {
                        message += `\n\n⚠️ 你收集了足够多关于宇昂的疑点，他的身份似乎并不简单...也许应该告诉唐月老师。`;
                    }
                }
            }
        }

        // v0.25.0: 检查玩家个人任务触发
        if (typeof QuestSystem !== 'undefined') {
            const triggeredQuests = QuestSystem.checkQuestTriggers();
            for (const q of triggeredQuests) {
                message += `\n\n📜 新任务：${q.name}\n${q.description}`;
            }
            // v0.31.0: 刷新关系类任务进度
            QuestSystem.updateProgress('relationship');
        }

        // v0.30.0: 玩家成长里程碑庆祝
        if (Player._pendingPlayerMilestones && Player._pendingPlayerMilestones.length > 0) {
            for (const milestoneLv of Player._pendingPlayerMilestones) {
                const celebrationTexts = {
                    5: `🎉 你突破到了Lv.${milestoneLv}！学校里开始有人注意到你的进步。`,
                    8: `🎉 Lv.${milestoneLv}！你的实力已经超越了大部分同龄人。`,
                    10: `🎉 你达到了Lv.${milestoneLv}！这是初阶法师的巅峰，距离中阶只有一步之遥。`,
                    12: `🎉 Lv.${milestoneLv}！老师们开始对你寄予厚望。`,
                    15: `🎉 你突破到了Lv.${milestoneLv}！中阶法师，你的名字开始在博城流传。`,
                    18: `🎉 Lv.${milestoneLv}！你的实力已经逼近高阶，无人再敢小觑你。`,
                    20: `🎉 Lv.${milestoneLv}！整个魔法界都在关注你的成长。`
                };
                const text = celebrationTexts[milestoneLv] || `🎉 你突破到了Lv.${milestoneLv}！`;
                message += `\n\n${text}`;

                // 随机NPC反应
                const reactionNPCs = ['mo_fan', 'mu_ningxue', 'tang_yue', 'zhang_xiaohou'];
                const npcId = reactionNPCs[Math.floor(Math.random() * reactionNPCs.length)];
                const npcData = DataManager.getCharacter(npcId);
                if (npcData) {
                    const npcLevel = this.getNPCLevel(npcId);
                    const diff = milestoneLv - npcLevel;
                    let reaction = '';
                    if (diff >= 3) {
                        reaction = `${npcData.name}听到这个消息后，眼神变得认真了几分。`;
                    } else if (diff >= 0) {
                        reaction = `${npcData.name}点了点头，"不错的进步。"`;
                    } else {
                        reaction = `${npcData.name}笑了笑，"继续加油，别落后了。"`;
                    }
                    message += `\n（${reaction}）`;
                }
            }
            Player._pendingPlayerMilestones = [];
        }

        // v0.43.0: 影响力里程碑事件
        if (Player._pendingInfluenceMilestones && Player._pendingInfluenceMilestones.length > 0) {
            for (const milestone of Player._pendingInfluenceMilestones) {
                const tierNames = ['无名小卒', '崭露头角', '小有名气', '声名远扬', '传奇法师'];
                const milestoneTexts = {
                    1: `🌟 你的影响力达到了【崭露头角】！学校里开始有人谈论你的名字，偶尔会有同学主动和你打招呼。`,
                    2: `🌟 你的影响力达到了【小有名气】！你的名字在年级里传开了，老师们也开始关注你。走在走廊里，能感受到更多注视的目光。`,
                    3: `🌟 你的影响力达到了【声名远扬】！整个博城魔法界都知道了你的名字。穆家、其他势力开始重新评估你，连陌生人都会对你表示敬意。`,
                    4: `🌟 你的影响力达到了【传奇法师】！你的事迹被广为传颂，年轻法师以你为榜样，老一辈法师也认可了你的地位。你已经不再是一个普通的学生了。`
                };
                const text = milestoneTexts[milestone.toLevel] || `🌟 你的影响力提升了！`;
                message += `\n\n${text}`;

                // 随机NPC对影响力的反应
                const reactionNPCs = ['mo_fan', 'mu_ningxue', 'tang_yue', 'zhang_xiaohou', 'zhao_manyan', 'zhou_min'];
                const npcId = reactionNPCs[Math.floor(Math.random() * reactionNPCs.length)];
                const npcData = DataManager.getCharacter(npcId);
                if (npcData) {
                    const reactions = {
                        mo_fan: `莫凡听到消息后咧嘴一笑，"可以啊你，越来越厉害了。"`,
                        mu_ningxue: `穆宁雪的目光在你身上多停留了一瞬，"……不错。"`,
                        tang_yue: `唐月欣慰地笑了，"老师就知道你能做到。"`,
                        zhang_xiaohou: `张小侯兴奋地说，"大哥太厉害了！我就知道！"`,
                        zhao_manyan: `赵满延拍了拍你的肩膀，"行啊兄弟，以后罩着我！"`,
                        zhou_min: `周敏的脸微微红了，"你真的……很厉害。"`
                    };
                    const reaction = reactions[npcId] || `${npcData.name}对你的进步表示认可。`;
                    message += `\n（${reaction}）`;
                }
            }
            Player._pendingInfluenceMilestones = [];
        }

        // v0.25.0 Phase4: 随机探索事件（非休息行动5%概率）
        // v3.2.0: 传递actionId用于行动类型过滤
        let randomEvent = null;
        if (!skipForDiscovery.includes(actionId) && typeof EventSystem !== 'undefined') {
            randomEvent = EventSystem.triggerRandomEvent('explore', 0.02, actionId);
        }

        // v0.34.0: NPC偶遇互动事件（如果没有其他事件，且遇到了NPC）
        let npcInteractionEvent = null;
        if (npcEncounter && npcEncounter.interactionEvent && !randomEvent && !result.event) {
            npcInteractionEvent = npcEncounter.interactionEvent;
        }

        // v0.96.0: 基础行动反馈 - 如果没有特殊结果且message为空，显示基础反馈
        const hasSpecialResult = result.battle || result.event || result.shop || result.npcs != null || randomEvent || npcInteractionEvent;
        if (!message && !hasSpecialResult && action) {
            message = `你完成了「${action.name}」。`;
        }

        if (message && !hasSpecialResult) {
            UI.showMessage(message.trim());
        }

        // 处理结果
        if (result.battle) {
            // 触发战斗（v0.99.1: 传递战斗来源用于猎魔奖励递减）
            const battleOptions = result.battle.source ? { source: result.battle.source } : {};
            this.startBattle(result.battle.enemy, null, battleOptions);
            return;
        }

        if (result.event || randomEvent || npcInteractionEvent) {
            // 触发事件（行动事件/随机事件/NPC互动事件）
            const eventId = result.event || (randomEvent && randomEvent.id) || (npcInteractionEvent && npcInteractionEvent.id);
            this.showEvent(eventId);
            return;
        }

        if (result.shop) {
            // 打开商店
            this.openShop();
            return;
        }

        if (result.npcs != null) {
            // 显示 NPC 列表，选择对话对象
            const npcs = result.npcs || [];
            const unavailableNpcs = result.unavailableNpcs || [];
            if (npcs.length === 0 && unavailableNpcs.length === 0) {
                UI.showMessage('这里现在没有人...');
                return;
            }
            this.showNPCList(npcs, unavailableNpcs);
            return;
        }

        // 检查是否有大事件
        const scheduledEvent = TimeSystem.getPendingEvent();
        if (scheduledEvent) {
            TimeSystem.clearPendingEvent();
            this.showScheduledEvent(scheduledEvent);
            return;
        }
        
        // 检查是否有新大事件系统的事件
        if (BigEventSystem.checkAndTrigger()) {
            return;
        }
        
        // 检查地点解锁
        const newlyUnlocked = MapSystem.checkLocationUnlocks();
        if (newlyUnlocked.length > 0) {
            const names = newlyUnlocked.map(loc => loc.name).join('、');
            UI.showMessage(`🎉 解锁新地点：${names}！`);
            // 再次刷新界面
            UI.renderMapScreen();
        }
        } catch (e) {
            console.error('行动出错:', e);
            const debugDiv = document.getElementById('debug-error');
            if (debugDiv) {
                debugDiv.style.display = 'block';
                debugDiv.textContent = '行动错误: ' + e.message + '\n堆栈: ' + e.stack;
            }
            UI.showMessage('行动失败：' + e.message);
        }
    }


// 导出模块集合
export const GamePerformAction = {
    performAction
};

export default GamePerformAction;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GamePerformAction = GamePerformAction;
}