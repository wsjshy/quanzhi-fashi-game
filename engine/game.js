/**
 * 游戏主控制器
 * 管理游戏状态、界面切换、主循环
 */

const Game = {
    // 游戏状态
    state: 'title',  // title / character_create / map / battle / shop / inventory / quest / event
    
    // 当前事件
    currentEvent: null,
    currentEventChoices: null,
    
    // 上一次战斗（用于再次挑战）
    lastBattle: null,  // { enemy, options }

    // 初始化
    init() {
        // 全局错误处理
        window.onerror = (message, source, lineno, colno, error) => {
            console.error('全局错误:', { message, source, lineno, colno, error });
            console.error('错误堆栈:', error?.stack);
            
            // 显示错误提示
            const errorBar = document.createElement('div');
            errorBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(90deg, #cc3333, #ff5555);
                color: white;
                padding: 10px 20px;
                text-align: center;
                z-index: 99999999;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            errorBar.innerHTML = `
                ⚠️ 游戏出错：${message}（第${lineno}行）
                <button onclick="this.parentElement.style.display='none'" style="margin-left: 20px; padding: 5px 15px; background: rgba(255,255,255,0.2); border: 1px solid white; border-radius: 5px; color: white; cursor: pointer;">关闭</button>
                <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 15px; background: rgba(255,255,255,0.2); border: 1px solid white; border-radius: 5px; color: white; cursor: pointer;">刷新页面</button>
            `;
            document.body.appendChild(errorBar);
            
            return false;
        };
        
        window.onunhandledrejection = (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            console.error('错误堆栈:', event.reason?.stack);
        };

        // 初始化数据
        DataManager.init();
        
        // 初始化背包
        Inventory.init();
        
        // 初始化世界状态
        WorldState.init();
        
        // 初始化 NPC 状态
        NPCStateSystem.init();
        
        // 初始化对话树
        DialogueTree.init();

        // 设置章节系统回调
        StoryChapterSystem.onChapterStart = (chapter) => {
            console.log(`[剧情] 开始新章节: ${chapter.name}`);
        };
        StoryChapterSystem.onChapterComplete = (chapter) => {
            UI.showChapterCompleteModal(chapter);
        };
        
        // 检查存档
        if (Player.hasSave()) {
            // 有存档，显示继续游戏按钮
        }
        
        // 显示标题界面
        this.showTitleScreen();
    },

    // ========== 标题界面 ==========
    showTitleScreen() {
        this.state = 'title';
        UI.renderTitleScreen(Player.hasSave());
    },

    // 开始新游戏
    startNewGame() {
        // 显示角色创建界面
        this.state = 'character_create';
        UI.renderCharacterCreate();
    },

    // 继续游戏
    continueGame() {
        if (Player.load()) {
            MapSystem.init();
            BigEventSystem.init();
            StoryChapterSystem.init();
            DailySystem.checkDailyReset();
            this.state = 'map';
            UI.renderMapScreen();
        }
    },

    // 创建角色
    createCharacter(name, element) {
        Player.init(name, element);
        
        // 给初始物品
        Inventory.addItem('health_potion', 5);
        Inventory.addItem('mana_potion', 3);
        
        // 初始化地图
        MapSystem.init();
        
        // 初始化大事件系统
        BigEventSystem.init();

        // 初始化章节系统
        StoryChapterSystem.init();

        // 觉醒仪式在创建角色时已完成（玩家已选择元素）
        Player.flags['awakening_ceremony_done'] = true;
        Player.flags['arrived_mingzhu'] = false; // 第七章完成时设置
        QuestSystem.completeQuest('quest_awakening_ceremony');

        // 初始化日常系统
        DailySystem.initNewGame();
        DailySystem.checkDailyReset();
        
        // 设置标志：新游戏创建中，等待自身天赋选择后进入系天赋选择
        this._pendingNewGame = true;
        this._pendingElement = element;
        
        // v0.92.7: 调试 - 直接进入游戏，跳过天赋选择
        console.log('createCharacter: 开始显示天赋选择');
        try {
            this.showInnateTalentSelection();
            console.log('createCharacter: 天赋选择显示成功');
        } catch (e) {
            console.error('createCharacter: 天赋选择出错', e);
            alert('天赋选择出错: ' + e.message);
        }
    },

    // ========== 地图界面 ==========
    showMapScreen() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // 行动冷却：弹窗关闭后短暂禁止行动，防止点击穿透/延迟触发
    _actionCooldown: false,
    
    // 上一次行动的时间戳，用于防止快速重复触发
    _lastActionTime: 0,
    
    // 执行地点行动
    performAction(actionId) {
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
        
        // 修炼类行动：先弹时长选择菜单
        if (actionId === 'train') {
            this.showCultivateMenu(actionId);
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
        if (currentClass && action && !action.isClassAction && actionId !== 'sleep' && actionId !== 'rest') {
            if (!Player.flags['skipped_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()]) {
                Player.flags['skipped_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()] = true;
                // 仅提示，不惩罚
                UI.showMessage(`💡 现在有${currentClass.name}（老师${DataManager.getCharacter(currentClass.teacher)?.name || '未知'}），不过你可以自由安排时间。`);
            }
        }

        const result = MapSystem.performAction(actionId);
        
        if (!result.success) {
            UI.showMessage(result.message);
            return;
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
                    const npcLevel = NPCStateSystem.getNPCLevel(npcId);
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
        let randomEvent = null;
        if (!skipForDiscovery.includes(actionId) && typeof EventSystem !== 'undefined') {
            randomEvent = EventSystem.triggerRandomEvent('explore', 0.02);
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
    },
    
    // 显示修炼时长选择菜单
    showCultivateMenu(actionId) {
        const location = DataManager.getLocation(Player.currentLocation);
        const action = location?.actions?.find(a => a.id === actionId);
        if (!action) return;
        
        const isTrain = true;
        const baseTime = action.timeCost || 2;
        // v0.99.0: 体力系统已移除，删除baseStamina
        const baseExp = action.effects?.exp || 10;
        
        // 时长选项：1小时、4小时、8小时、闭关（按基础时长缩放）
        const options = [
            { hours: 1, bonus: 1.0, label: '1小时', desc: '快速修炼，无加成' },
            { hours: 4, bonus: 1.1, label: '4小时', desc: '半天修炼，+10%收益' },
            { hours: 8, bonus: 1.2, label: '8小时', desc: '整日修炼，+20%收益' },
            { hours: 12, bonus: 1.5, label: '闭关（12小时）', desc: '闭关修炼，+50%收益' }
        ];
        
        // v0.9.0: 体力不再作为硬限制，不过滤选项
        // 体力低时修炼经验会通过getStaminaEfficiency()降低
        const availableOptions = options;
        
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
            z-index: 99999;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        dialog.innerHTML = `
            <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 22px;">
                ${isTrain ? '✨ 修炼魔法' : '🧘 冥修'}
            </h3>
            <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">选择修炼时长：时间越长，单位收益越高<br><span style="color: #888; font-size: 12px;">✨ 显示的是基础经验，实际可能因修炼品质、NPC指导、顿悟等获得额外加成</span></p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${availableOptions.map((opt, index) => {
                    const multiplier = opt.hours / baseTime;
                    const expGain = Math.floor(baseExp * multiplier * opt.bonus);
                    // v0.99.0: 体力系统已移除，删除staminaCost计算
                    const hpChange = Math.floor((action.effects?.hp || 0) * multiplier);
                    const mpChange = Math.floor((action.effects?.mp || 0) * multiplier);
                    const timeCost = opt.hours;
                    return `
                        <div onclick="Game.performCultivate('${actionId}', ${opt.hours}, ${opt.bonus})" style="
                            padding: 15px 20px;
                            background: rgba(40, 40, 80, 0.8);
                            border: 2px solid #444477;
                            border-radius: 10px;
                            color: #e0e0ff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                        " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                            <div style="font-weight: bold; font-size: 17px; margin-bottom: 5px;">
                                ${opt.label}
                                <span style="float: right; font-size: 13px; display: flex; gap: 10px;">
                                    <span style="color: #aaddff;">⏱️ ${timeCost}h</span>
                                    <!-- v0.99.0: 体力系统已移除，删除体力消耗显示 -->
                                    ${hpChange !== 0 ? `<span style="color: ${hpChange > 0 ? '#66ff66' : '#ff6666'};">❤️ ${hpChange > 0 ? '+' : ''}${hpChange}</span>` : ''}
                                    ${mpChange !== 0 ? `<span style="color: ${mpChange > 0 ? '#6666ff' : '#ff6666'};">💧 ${mpChange > 0 ? '+' : ''}${mpChange}</span>` : ''}
                                    <span style="color: #ffd700;">✨ +${expGain}</span>
                                </span>
                            </div>
                            <div style="font-size: 13px; color: #999;">${opt.desc}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 10px;
                text-align: center;
                color: #888;
                cursor: pointer;
                font-size: 14px;
            ">取消</div>
        `;
        
        document.body.appendChild(dialog);
    },
    
    // 执行修炼（指定时长）
    // v0.24.0: 修炼顿悟检查（玩家专属机缘）
    _checkCultivationInsight(action, hours, multiplier) {
        // 基础概率10%，每级+0.3%，上限15%
        const baseChance = 0.10;
        const levelBonus = Math.min(0.10, (Player.level || 1) * 0.003);
        // 连续在同一地点修炼会降低顿悟概率（避免刷）
        const sameLocationCount = Player._cultivateSameLocationCount || 0;
        const locationPenalty = Math.min(0.03, sameLocationCount * 0.01);
        const chance = Math.max(0.01, baseChance + levelBonus - locationPenalty);

        if (Math.random() > chance) return null;

        // 顿悟发生
        const insightTypes = [
            { type: 'exp_boost', weight: 50, desc: '修炼顿悟' },
            { type: 'skill_point', weight: 20, desc: '技能领悟' },
            { type: 'buff', weight: 20, desc: '心境提升' },
            { type: 'info', weight: 10, desc: '灵光一闪' }
        ];
        const totalWeight = insightTypes.reduce((s, t) => s + t.weight, 0);
        let roll = Math.random() * totalWeight;
        let chosen = insightTypes[0];
        for (const t of insightTypes) {
            roll -= t.weight;
            if (roll <= 0) { chosen = t; break; }
        }

        const result = { type: chosen.type, desc: chosen.desc };

        switch (chosen.type) {
            case 'exp_boost':
                // 3-5倍额外经验
                const mult = 3 + Math.floor(Math.random() * 3);
                result.bonusExp = Math.floor((action.effects?.exp || 10) * multiplier * (mult - 1));
                result.message = `✨ ${chosen.desc}！修炼效率大幅提升，额外经验 +${result.bonusExp}`;
                break;
            case 'skill_point':
                result.bonusExp = Math.floor((action.effects?.exp || 10) * multiplier);
                result.skillPoint = 1;
                result.message = `💡 ${chosen.desc}！对魔法有了新的理解，获得 1 技能点，经验 +${result.bonusExp}`;
                break;
            case 'buff':
                result.bonusExp = Math.floor((action.effects?.exp || 10) * multiplier * 0.5);
                result.buff = { name: '心境通明', duration: 5, expBonus: 0.3 };
                result.message = `🧘 ${chosen.desc}！心境通明，接下来5次修炼经验+30%，经验 +${result.bonusExp}`;
                break;
            case 'info':
                result.bonusExp = Math.floor((action.effects?.exp || 10) * multiplier * 0.3);
                result.message = `🔮 ${chosen.desc}！似乎感知到了什么...经验 +${result.bonusExp}`;
                // 小概率获得世界观信息碎片
                if (Math.random() < 0.3) {
                    result.infoFragment = true;
                }
                break;
        }

        // 记录同一地点连续修炼次数
        if (Player.currentLocation === Player._lastCultivateLocation) {
            Player._cultivateSameLocationCount = (Player._cultivateSameLocationCount || 0) + 1;
        } else {
            Player._cultivateSameLocationCount = 1;
        }
        Player._lastCultivateLocation = Player.currentLocation;

        // 记录顿悟日志
        if (!Player.insightLog) Player.insightLog = [];
        Player.insightLog.push({
            type: result.type,
            location: Player.currentLocation,
            day: Player.day || 1,
            time: Player.time || 'morning'
        });
        if (Player.insightLog.length > 50) Player.insightLog.shift();

        return result;
    },

    // v0.24.0: 隐藏修炼地点（玩家专属机缘线Phase2）
    // 玩家探索时有概率发现专属隐秘修炼点，与莫凡的地圣泉平行
    _hiddenSpotTemplates: [
        { id: 'secret_corner', name: '隐秘角落', desc: '一个元素浓度异常的角落', expBonus: 0.5, uses: 5 },
        { id: 'abandoned_room', name: '废弃修炼室', desc: '一间被遗忘的修炼室，残留着魔法阵', expBonus: 0.8, uses: 3 },
        { id: 'spirit_node', name: '灵脉节点', desc: '地下灵脉的一个微小节点', expBonus: 1.0, uses: 2 },
        { id: 'ancient_ruin', name: '古老遗迹', desc: '一处上古法师的修炼遗迹', expBonus: 1.5, uses: 1 }
    ],

    // v0.24.0: 探索时检查是否发现隐藏修炼地点
    _checkHiddenSpotDiscovery() {
        // 基础概率6%
        if (Math.random() > 0.06) return null;

        // 已经发现的地点不再发现
        if (!Player.discoveredHiddenSpots) Player.discoveredHiddenSpots = [];
        const available = this._hiddenSpotTemplates.filter(
            t => !Player.discoveredHiddenSpots.some(s => s.id === t.id)
        );
        if (available.length === 0) return null;

        // 随机选择一个
        const template = available[Math.floor(Math.random() * available.length)];
        const spot = {
            id: template.id,
            name: template.name,
            desc: template.desc,
            expBonus: template.expBonus,
            usesRemaining: template.uses,
            discoveredDay: Player.day || 1,
            location: Player.currentLocation
        };
        Player.discoveredHiddenSpots.push(spot);

        return spot;
    },

    // v0.24.0: 在隐藏地点修炼
    cultivateAtHiddenSpot(spotId) {
        if (!Player.discoveredHiddenSpots) return;
        const spot = Player.discoveredHiddenSpots.find(s => s.id === spotId);
        if (!spot || spot.usesRemaining <= 0) {
            UI.showMessage('这个隐秘地点的灵气已经枯竭了。');
            return;
        }

        // 消耗一次使用
        spot.usesRemaining--;

        // 计算经验（基础修炼经验 × (1 + 隐藏地点加成)）
        const baseExp = 30; // 基础修炼经验
        const bonusExp = Math.floor(baseExp * spot.expBonus);
        const totalExp = baseExp + bonusExp;

        Player.gainExp(totalExp);
        TimeSystem.advanceTime(2);

        let message = `你在${spot.name}修炼了2小时。\n经验 +${totalExp}\n  ✨ 隐秘地点加成 +${bonusExp}\n`;
        if (spot.usesRemaining > 0) {
            message += `  剩余使用次数：${spot.usesRemaining}`;
        } else {
            message += `  ⚠️ 这个地点的灵气已经枯竭，无法再使用了。`;
        }

        UI.showMessage(message);
        UI.renderMapScreen();
    },

    // v0.24.0: NPC自主日程系统（玩家专属机缘线Phase3）
    // 所有重要NPC都有自己的生活，玩家可能在特定地点遇到他们在做自己的事
    // 莫凡只是其中一个NPC，和穆宁雪、唐月等平等
    _npcSchedules: {
        mo_fan: {
            name: '莫凡',
            gender: 'male',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.5 },
            afternoon: { location: 'tianlan_school', activity: '在修炼场修炼', chance: 0.3 },
            evening: { location: 'earth_spring', activity: '在地圣泉修炼', chance: 0.2 }
        },
        mu_ningxue: {
            name: '穆宁雪',
            gender: 'female',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.5 },
            afternoon: { location: 'tianlan_school', activity: '独自修炼冰系魔法', chance: 0.3 },
            evening: { location: 'tianlan_school', activity: '在天台发呆', chance: 0.15 }
        },
        tang_yue: {
            name: '唐月',
            gender: 'female',
            morning: { location: 'tianlan_school', activity: '备课', chance: 0.6 },
            afternoon: { location: 'tianlan_school', activity: '批改作业', chance: 0.4 },
            evening: { location: 'tianlan_school', activity: '在办公室', chance: 0.2 }
        },
        zhang_xiaohou: {
            name: '张小侯',
            gender: 'male',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.5 },
            afternoon: { location: 'tianlan_school', activity: '和同学聊天', chance: 0.4 },
            evening: { location: 'tianlan_school', activity: '修炼风系魔法', chance: 0.2 }
        },
        zhao_manyan: {
            name: '赵满延',
            gender: 'male',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.4 },
            afternoon: { location: 'tianlan_school', activity: '和同学炫耀光系魔法', chance: 0.35 },
            evening: { location: 'tianlan_school', activity: '修炼光系防御魔法', chance: 0.15 }
        },
        zhou_min: {
            name: '周敏',
            gender: 'female',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.6 },
            afternoon: { location: 'tianlan_school', activity: '在图书馆自习', chance: 0.4 },
            evening: { location: 'tianlan_school', activity: '复习功课', chance: 0.2 }
        },
        xu_zhaoting: {
            name: '许昭霆',
            gender: 'male',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.4 },
            afternoon: { location: 'tianlan_school', activity: '修炼雷系魔法', chance: 0.3 },
            evening: { location: 'tianlan_school', activity: '独自待着', chance: 0.15 }
        },
        mu_bai: {
            name: '穆白',
            gender: 'male',
            morning: { location: 'tianlan_school', activity: '上课', chance: 0.5 },
            afternoon: { location: 'tianlan_school', activity: '修炼冰系魔法', chance: 0.3 },
            evening: { location: 'tianlan_school', activity: '整理穆家事务', chance: 0.15 }
        },
        ye_xinxia: {
            name: '叶心夏',
            gender: 'female',
            morning: { location: 'mo_fan_house', activity: '在家休养', chance: 0.7 },
            afternoon: { location: 'mo_fan_house', activity: '看书学习', chance: 0.5 },
            evening: { location: 'mo_fan_house', activity: '等待莫凡回来', chance: 0.4 }
        },
        xue_musheng: {
            name: '薛木生',
            gender: 'male',
            morning: { location: 'tianlan_school', activity: '上课教学', chance: 0.8 },
            afternoon: { location: 'tianlan_school', activity: '批改作业或办公', chance: 0.6 },
            evening: { location: 'tianlan_school', activity: '准备教学内容', chance: 0.3 }
        }
    },

    // v0.24.0: 检查当前地点是否有NPC在做自己的事
    _checkNPCEncounter() {
        const timeOfDay = Player.time || 'morning';
        const encounters = [];

        for (const [npcId, schedule] of Object.entries(this._npcSchedules)) {
            const timeSlot = schedule[timeOfDay];
            if (!timeSlot) continue;
            if (Player.currentLocation !== timeSlot.location) continue;
            
            // v0.89.0: 子地点匹配 - 根据当前具体地点和NPC activity判断是否应该遇到
            const currentLocName = MapSystem.getCurrentLocation()?.name || '';
            const activity = timeSlot.activity || '';
            let locationMatch = true;
            if (currentLocName.includes('图书馆')) {
                // 图书馆：只遇到学习/看书/备课/查阅资料的NPC
                locationMatch = activity.includes('学习') || activity.includes('看书') || activity.includes('备课') || activity.includes('复习') || activity.includes('自习');
            } else if (currentLocName.includes('修炼场')) {
                // 修炼场：只遇到修炼的NPC
                locationMatch = activity.includes('修炼') || activity.includes('练习');
            } else if (currentLocName.includes('教室') || currentLocName.includes('课堂')) {
                // 教室：只遇到上课的NPC
                locationMatch = activity.includes('上课') || activity.includes('教学');
            } else if (currentLocName.includes('宿舍')) {
                // 宿舍：只遇到休息/睡觉的NPC
                locationMatch = activity.includes('休息') || activity.includes('睡觉') || activity.includes('待着');
            }
            if (!locationMatch) continue;
            
            // v0.64.0: 关系事件待触发时提高encounter概率，确保玩家能遇到目标NPC
            const hasPendingRelationEvent = this._hasPendingRelationEvent(npcId);
            const encounterChance = hasPendingRelationEvent ? 0.8 : timeSlot.chance;
            if (Math.random() > encounterChance) continue;

            // 每个NPC每天最多遇到一次
            const lastKey = `_last_${npcId}_encounter_day`;
            if (Player[lastKey] === Player.day) continue;
            Player[lastKey] = Player.day;

            encounters.push({
                npcId,
                name: schedule.name,
                gender: schedule.gender || 'male',
                activity: timeSlot.activity
            });
        }

        if (encounters.length === 0) return null;

        // v0.26.0: 每次行动最多遇到1个NPC，避免消息过长和偶遇过于频繁
        // 随机选择一个，让每个NPC都有机会出现
        if (encounters.length > 1) {
            const chosen = encounters[Math.floor(Math.random() * encounters.length)];
            encounters.length = 0;
            encounters.push(chosen);
        }

        // v0.90.0: 简化偶遇机制 - 只保留NPC自主成长（后台计算），不再显示文本和触发互动
        // NPC自主成长 - 遇到修炼中的NPC时，NPC获得经验（不显示给玩家）
        for (const enc of encounters) {
            const isCultivating = enc.activity.includes('修炼') || enc.activity.includes('备课') || enc.activity.includes('批改');
            if (isCultivating) {
                const expGain = 15 + Math.floor(Math.random() * 10);
                const npcState = NPCStateSystem.getNPCState(enc.npcId);
                npcState.totalCultivateCount = (npcState.totalCultivateCount || 0) + 1;
                NPCStateSystem.gainNPCExp(enc.npcId, expGain);
            }
        }

        // 不再返回偶遇信息，玩家看不到任何文本
        return null;
    },

    /**
     * v0.34.0: 查找适合当前NPC和活动的互动事件
     */
    // v0.64.0: 检查该NPC是否有待触发的关系事件（用于提高encounter概率）
    _hasPendingRelationEvent(npcId) {
        try {
            const allEvents = DataManager.getAllEvents ? DataManager.getAllEvents() : {};
            for (const [eventId, event] of Object.entries(allEvents)) {
                if (event.npcId !== npcId) continue;
                // 只检查有关系阈值的事件（minRelationship或minRelationships）
                if (!event.minRelationship && !event.minRelationships) continue;
                // 检查notFlag（事件未完成）
                if (event.notFlag) {
                    const flags = Array.isArray(event.notFlag) ? event.notFlag : [event.notFlag];
                    if (flags.some(f => Player.hasFlag(f))) continue;
                }
                // v0.66.0: 检查玩家等级要求
                if (event.minLevel && Player.level < event.minLevel) continue;
                // 检查requireFlag（如果有）
                if (event.requireFlag) {
                    const reqFlags = Array.isArray(event.requireFlag) ? event.requireFlag : [event.requireFlag];
                    if (!reqFlags.some(f => Player.hasFlag(f))) continue;
                }
                // 检查minRelationship
                if (event.minRelationship) {
                    const npcState = NPCStateSystem.getNPCState(npcId);
                    if ((npcState.opinion || 0) < event.minRelationship) continue;
                }
                // 检查minRelationships（多NPC关系）
                if (event.minRelationships) {
                    let allMeet = true;
                    for (const [rid, rmin] of Object.entries(event.minRelationships)) {
                        const rState = NPCStateSystem.getNPCState(rid);
                        if ((rState.opinion || 0) < rmin) {
                            allMeet = false;
                            break;
                        }
                    }
                    if (!allMeet) continue;
                }
                // 找到满足条件的待触发事件
                return true;
            }
        } catch (e) {
            console.error('[_hasPendingRelationEvent] 出错:', e);
        }
        return false;
    },

    _findNPCInteraction(npcId, activity) {
        const allEvents = DataManager.getAllEvents ? DataManager.getAllEvents() : {};
        const candidates = [];

        for (const [eventId, event] of Object.entries(allEvents)) {
            if (event.npcId !== npcId) continue;
            // 检查活动匹配（如果指定了activities）
            if (event.activities && event.activities.length > 0) {
                if (!event.activities.some(a => activity.includes(a))) continue;
            }
            // 检查好感度要求
            if (event.minRelationship) {
                const npcState = NPCStateSystem.getNPCState(npcId);
                if ((npcState.opinion || 0) < event.minRelationship) continue;
            }
            // v0.63.0: 检查多NPC关系要求（NPC间联动事件）
            if (event.minRelationships) {
                let allMet = true;
                for (const [checkNpcId, minOp] of Object.entries(event.minRelationships)) {
                    const npcState = NPCStateSystem.getNPCState(checkNpcId);
                    if ((npcState?.opinion || 0) < minOp) { allMet = false; break; }
                }
                if (!allMet) continue;
            }
            // v0.48.0: 检查flag条件（影响力事件链）
            if (event.requireFlag && !Player.hasFlag(event.requireFlag)) continue;
            if (event.notFlag && Player.hasFlag(event.notFlag)) continue;
            // v0.66.0: 检查玩家等级要求（博城灾难等剧情事件）
            if (event.minLevel && Player.level < event.minLevel) continue;
            candidates.push(event);
        }

        if (candidates.length === 0) return null;
        // v0.69.1: 按weight加权随机选择，提高关键剧情事件触发概率
        const totalWeight = candidates.reduce((sum, e) => sum + (e.weight || 1), 0);
        let rand = Math.random() * totalWeight;
        for (const event of candidates) {
            rand -= (event.weight || 1);
            if (rand <= 0) return event;
        }
        return candidates[candidates.length - 1];
    },

    performCultivate(actionId, hours, bonus) {
        try {
            // 关闭弹窗
            const dialogs = document.querySelectorAll('div[style*="z-index: 99999"]');
            dialogs.forEach(d => {
                if (d.querySelector('h3')?.textContent?.includes('修炼') || d.querySelector('h3')?.textContent?.includes('冥修')) {
                    d.remove();
                }
            });
            
            const location = DataManager.getLocation(Player.currentLocation);
            const action = location?.actions?.find(a => a.id === actionId);
            if (!action) {
                console.warn('[修炼] 行动不存在:', actionId);
                return;
            }
            
            const baseTime = action.timeCost || 2;
            const multiplier = hours / baseTime;
            
            // 计算实际效果：按时间倍数 × 收益加成
            // v0.99.0: 用每日行动次数效率替代体力效率
            const dailyEff = Player.getCultivateEfficiency ? Player.getCultivateEfficiency() : 1.0;
            // v0.24.0: 修炼buff（心境通明等）
            const buffExpBonus = Player.cultivationBuff?.expBonus || 0;
            const result = {
                success: true,
                timeCost: hours,
                effects: {
                    exp: Math.floor((action.effects?.exp || 0) * multiplier * bonus * dailyEff * (1 + buffExpBonus)),
                    hp: Math.floor((action.effects?.hp || 0) * multiplier),
                    mp: Math.floor((action.effects?.mp || 0) * multiplier)
                    // v0.99.0: 移除体力消耗（体力系统已废弃）
                },
                message: `${action.name} ${hours}小时完成`,
                dailyEfficiency: dailyEff  // v0.99.0: 记录效率用于UI提示
            };
            
            // 星尘魔器效果：增加修炼经验
            if (typeof StarDustArtifactSystem !== 'undefined') {
                const starDustEffect = Player.getTotalStarDustEffect();
                if (starDustEffect.expBonus > 0) {
                    const bonusExp = Math.floor(result.effects.exp * starDustEffect.expBonus);
                    result.effects.exp += bonusExp;
                    result.starDustBonus = bonusExp;
                }
            }

            // v0.19.0: 地圣泉内泉效果 - 修炼经验×3（玩家争夺到的机缘）
            if (Player.currentLocation === 'earth_spring' && Player.flags?.earth_spring_inner) {
                const innerBonus = result.effects.exp * 2; // 额外2倍，总共3倍
                result.effects.exp += innerBonus;
                result.innerSpringBonus = innerBonus;
            }

            // v0.41.0: 影响力修炼加成 - 声望越高，修炼时越容易进入状态
            if (Player.getInfluenceTier) {
                const infTier = Player.getInfluenceTier();
                const infBonusRate = [0, 0.05, 0.10, 0.15, 0.20][infTier.level] || 0;
                if (infBonusRate > 0) {
                    const infBonus = Math.floor(result.effects.exp * infBonusRate);
                    result.effects.exp += infBonus;
                    result.influenceBonus = infBonus;
                }
            }

            // v0.56.0: 导师修炼加成 - 拜师后稳定经验加成
            if (Player.flags?.tang_yue_mentor) {
                const mentorLevel = Player.mentor?.level || 1;
                const mentorBonusRate = 0.10 + (mentorLevel - 1) * 0.05;
                const mentorBonus = Math.floor(result.effects.exp * mentorBonusRate);
                if (mentorBonus > 0) {
                    result.effects.exp += mentorBonus;
                    result.mentorBonus = mentorBonus;
                }
            }

            // 触发事件的概率：时间越长概率越高，但不是线性增长
            const eventChance = action.eventChance || 0;
            if (eventChance > 0 && Math.random() < eventChance * Math.sqrt(multiplier)) {
                const eventId = action.events[Math.floor(Math.random() * action.events.length)];
                result.event = eventId;
            }

            // v0.32.0: 修炼品质系统 - 每次修炼有随机品质波动
            const qualityRoll = Math.random();
            let quality = { name: '普通', multiplier: 1.0, message: '', hpLoss: 0 };
            if (qualityRoll < 0.05) {
                quality = { name: '走火入魔', multiplier: 0.5, message: '⚠️ 走火入魔！魔力反噬，修炼效率大减，但你的抗性有所提升。', hpLoss: 15 };
                Player.fireResistance = (Player.fireResistance || 0) + 0.01; // 永久微量抗性提升
            } else if (qualityRoll < 0.15) {
                quality = { name: '状态不佳', multiplier: 0.75, message: '😓 状态不佳，精神难以集中。', hpLoss: 5 };
            } else if (qualityRoll < 0.65) {
                quality = { name: '普通', multiplier: 1.0, message: '', hpLoss: 0 };
            } else if (qualityRoll < 0.90) {
                quality = { name: '状态良好', multiplier: 1.25, message: '😊 状态良好，修炼得心应手。', hpLoss: 0 };
            } else {
                quality = { name: '极佳', multiplier: 1.6, message: '🌟 修炼状态极佳！灵感如泉涌！', hpLoss: 0 };
            }
            result.quality = quality;
            result.effects.exp = Math.floor(result.effects.exp * quality.multiplier);
            if (quality.hpLoss > 0) {
                result.effects.hp = (result.effects.hp || 0) - quality.hpLoss;
            }

            // v0.32.0: 修炼时NPC指导 - 如果有NPC在同地修炼，有概率获得指导
            result.npcGuidance = null;
            if (typeof NPCStateSystem !== 'undefined' && this._npcSchedules) {
                const timeOfDay = Player.time || 'morning';
                for (const [npcId, schedule] of Object.entries(this._npcSchedules)) {
                    const timeSlot = schedule[timeOfDay];
                    if (!timeSlot) continue;
                    if (Player.currentLocation !== timeSlot.location) continue;
                    if (!timeSlot.activity.includes('修炼') && !timeSlot.activity.includes('备课')) continue;
                    // v0.41.0: 影响力提升NPC指导概率（小有名气+5%，声名远扬+10%，传奇法师+15%）
                    let guidanceChance = 0.35;
                    if (Player.getInfluenceTier) {
                        const infTier = Player.getInfluenceTier();
                        guidanceChance += [0, 0, 0.05, 0.10, 0.15][infTier.level] || 0;
                    }
                    if (Math.random() < guidanceChance) {
                        const npcData = DataManager.getCharacter(npcId);
                        const guidanceExp = Math.floor(result.effects.exp * 0.2);
                        result.npcGuidance = { npcId, name: npcData?.name || npcId, exp: guidanceExp };
                        result.effects.exp += guidanceExp;
                        // 增加好感度
                        NPCStateSystem.changeOpinion(npcId, 2);
                        break;
                    }
                }
            }

            // v0.24.0: 修炼顿悟系统（玩家专属机缘）
            result.insight = this._checkCultivationInsight(action, hours, multiplier);
            if (result.insight) {
                result.effects.exp += result.insight.bonusExp;
                if (result.insight.skillPoint) {
                    Player.skillPoints = (Player.skillPoints || 0) + result.insight.skillPoint;
                }
                if (result.insight.buff) {
                    Player.cultivationBuff = result.insight.buff;
                }
            }
            
            // 应用效果
            if (result.effects.exp) Player.gainExp(result.effects.exp);
            if (result.effects.hp) Player.hp = Math.max(1, Math.min(Player.maxHp, Player.hp + result.effects.hp));
            if (result.effects.mp) Player.mp = Math.max(0, Math.min(Player.maxMp, Player.mp + result.effects.mp));
            // v0.99.0: 移除体力恢复（体力系统已废弃）
            // if (result.effects.stamina) Player.stamina = ...

            // v0.25.0: 修炼计数和任务进度
            Player._totalCultivateCount = (Player._totalCultivateCount || 0) + 1;
            // v0.99.0: 记录每日修炼次数（用于效率递减）
            if (typeof Player.recordAction === 'function') {
                Player.recordAction('cultivate');
            }
            if (typeof QuestSystem !== 'undefined') {
                QuestSystem.updateProgress('cultivate', null, 1);
            }
            
            // 时间流逝
            const timeResult = TimeSystem.advanceTime(result.timeCost);
            result.timeEvents = timeResult.events;

            // v0.24.0: 修炼buff持续时间递减
            if (Player.cultivationBuff) {
                Player.cultivationBuff.duration--;
                if (Player.cultivationBuff.duration <= 0) {
                    message += `  ${Player.cultivationBuff.name} 效果结束\n`;
                    delete Player.cultivationBuff;
                }
            }
            
            // 检查强制昏睡
            let message = result.message + '\n';
            // v0.32.0: 修炼品质
            if (result.quality && result.quality.message) {
                message += result.quality.message + '\n';
            }
            // v0.32.0: NPC指导
            if (result.npcGuidance) {
                message += `💡 ${result.npcGuidance.name}路过，指点了你几句。经验 +${result.npcGuidance.exp}，好感+2\n`;
            }
            if (result.effects.exp) message += `经验 +${result.effects.exp}\n`;
            if (result.starDustBonus) message += `  ✨ 星尘魔器加成 +${result.starDustBonus}\n`;
            if (result.influenceBonus) message += `  🌟 影响力加成 +${result.influenceBonus}\n`;
            if (result.mentorBonus) message += `  📚 导师指导 +${result.mentorBonus}\n`;
            if (Player.cultivationBuff) message += `  🧘 ${Player.cultivationBuff.name} 加成 +${Math.round(Player.cultivationBuff.expBonus * 100)}%\n`;
            if (result.insight) message += `${result.insight.message}\n`;
            if (result.effects.mp > 0) message += `MP +${result.effects.mp}\n`;
            if (result.effects.mp < 0) message += `MP ${result.effects.mp}\n`;
            if (result.effects.hp < 0) message += `HP ${result.effects.hp}\n`;
            
            // 检查升级
            if (Player.exp >= Player.expToNext) {
                const levelResult = Player.checkLevelUp();
                if (levelResult.levelUps.length > 0) {
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
            }

            // 天赋经验：修炼增加主系天赋经验
            if (Player.elements && Player.elements.length > 0 && typeof TalentSystem !== 'undefined') {
                const mainElement = Player.elements[0];
                const talentExp = Math.floor(5 * multiplier * bonus); // 每小时5点基础天赋经验
                const talentResult = Player.addElementTalentExp(mainElement, talentExp);
                if (talentResult.leveledUp) {
                    message += `🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！\n`;
                }
            }
            
            // 检查强制昏睡
            if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
                message = `😴 你熬夜修炼，不知不觉昏睡了过去...\n\n（第二天早上醒来，感觉没睡好，体力只恢复了50%）\n\n` + message;
            }

            // v0.24.0: NPC自主日程——修炼时也可能遇到NPC
            const cultivateNPCEncounter = this._checkNPCEncounter();
            let cultivateInteractionEvent = null;
            if (cultivateNPCEncounter) {
                message += cultivateNPCEncounter.message;
                if (cultivateNPCEncounter.interactionEvent) {
                    cultivateInteractionEvent = cultivateNPCEncounter.interactionEvent;
                }
            }

            // v0.25.0: 修炼时检查任务触发
            if (typeof QuestSystem !== 'undefined') {
                const triggeredQuests = QuestSystem.checkQuestTriggers();
                for (const q of triggeredQuests) {
                    message += `\n\n📜 新任务：${q.name}\n${q.description}`;
                }
            }

            UI.showMessage(message.trim());

            // v0.64.0: 修炼时触发NPC互动事件（关系驱动任务/NPC联动）
            if (cultivateInteractionEvent) {
                this.showEvent(cultivateInteractionEvent.id);
                return;
            }
            
            // 刷新界面
            UI.renderMapScreen();
            
            // 检查地点解锁
            const newlyUnlocked = MapSystem.checkLocationUnlocks();
            if (newlyUnlocked.length > 0) {
                const names = newlyUnlocked.map(loc => loc.name).join('、');
                setTimeout(() => UI.showMessage(`🎉 解锁新地点：${names}！`), 500);
            }
            
            // 日常追踪：修炼
            DailySystem.trackActivity('cultivate', 1);
            
            // 保存游戏
            Player.save();
        } catch (e) {
            console.error('[修炼] 出错:', e);
            UI.showMessage('修炼出错：' + e.message);
        }
    },
    
    // 移动到地点
    travelTo(locationId) {
        try {
            const result = MapSystem.travelTo(locationId);
            
            if (!result.success) {
                UI.showMessage(result.message);
                return;
            }

            // 更新任务进度（到达新地点）
            const completedQuests = QuestSystem.updateProgress('reach', locationId, 1);

            // 日常追踪：访问地点
            DailySystem.trackActivity('visit', 1, locationId);

            // v0.9.0: 首次探索奖励（鼓励玩家探索新地点）
            let firstExploreReward = null;
            if (!Player.exploredLocations.includes(locationId)) {
                Player.exploredLocations.push(locationId);
                // v0.9.6: 增加首次探索奖励
                const expReward = 80;
                const goldReward = 50;
                Player.gainExp(expReward);
                Player.gold += goldReward;
                firstExploreReward = { exp: expReward, gold: goldReward };
                // v0.9.4: 每日统计
                if (Player.dailyStats) Player.dailyStats.locationsExplored = (Player.dailyStats.locationsExplored || 0) + 1;
                // v0.9.6: 隐藏发现奖励 - 15%概率获得额外奖励
                if (Math.random() < 0.15) {
                    const hiddenExp = 50;
                    const hiddenGold = 30;
                    Player.gainExp(hiddenExp);
                    Player.gold += hiddenGold;
                    firstExploreReward.hiddenFind = { exp: hiddenExp, gold: hiddenGold };
                }
                // v0.13.0: 隐藏地点首次进入奖励 - 原本unlocked:false的地点
                const locData = DataManager.getLocation(locationId);
                if (locData && locData.unlocked === false) {
                    const hiddenLocExp = 100;
                    const hiddenLocGold = 80;
                    Player.gainExp(hiddenLocExp);
                    Player.gold += hiddenLocGold;
                    firstExploreReward.hiddenLocation = { exp: hiddenLocExp, gold: hiddenLocGold, name: locData.name };
                }
                // v0.9.8: 连续探索奖励
                Player.consecutiveExplores = (Player.consecutiveExplores || 0) + 1;
                const ce = Player.consecutiveExplores;
                if (ce === 3 || ce === 5 || ce === 10) {
                    const bonusMap = { 3: { exp: 50, gold: 30 }, 5: { exp: 100, gold: 50 }, 10: { exp: 200, gold: 100 } };
                    const bonus = bonusMap[ce];
                    Player.gainExp(bonus.exp);
                    Player.gold += bonus.gold;
                    firstExploreReward.consecutiveBonus = { count: ce, exp: bonus.exp, gold: bonus.gold };
                }
            } else {
                // v0.9.8: 非首次探索，重置连续探索计数
                Player.consecutiveExplores = 0;
            }

            // v0.9.1: 100%探索完成奖励
            let explorationCompleteReward = null;
            if (firstExploreReward && typeof MapSystem.getExplorationProgress === 'function') {
                const progress = MapSystem.getExplorationProgress();
                if (progress.isComplete && !Player.explorationComplete.includes('all_locations')) {
                    Player.explorationComplete.push('all_locations');
                    // v0.9.6: 增加100%探索奖励
                    const completeExp = 200;
                    const completeGold = 100;
                    Player.gainExp(completeExp);
                    Player.gold += completeGold;
                    explorationCompleteReward = { exp: completeExp, gold: completeGold };
                }
            }

            // 保存游戏
            Player.save();

            // 显示任务完成奖励
            if (completedQuests && completedQuests.length > 0) {
                completedQuests.forEach(q => {
                    if (q.rewards && q.rewards.length > 0) {
                        UI.showMessage(`🎉 ${q.message}\n${q.rewards.join('\n')}`);
                    }
                });
            }

            // 处理结果
            if (result.randomBattle) {
                this.startBattle(result.randomBattle.enemy);
                return;
            }

            if (result.travelEvent) {
                this.showEvent(result.travelEvent);
                return;
            }

            // v0.19.0: 玩家影响力 - 地圣泉机缘竞争（首次进入时触发）
            if (locationId === 'earth_spring' && firstExploreReward && !Player.changedStoryNodes.includes('earth_spring_opportunity')) {
                const tangYueState = NPCStateSystem.getNPCState('tang_yue');
                const tangYueTrust = tangYueState ? tangYueState.trust : 0;
                const playerLevel = Player.level;
                if (tangYueTrust >= 30 && playerLevel >= 5) {
                    this.triggerEarthSpringInfluence();
                    return;
                }
            }

            UI.renderMapScreen();
            
            // 检查强制昏睡
            let travelMsg = `来到了 ${result.location.name}`;
            if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
                travelMsg = `😴 你熬夜赶路，不知不觉昏睡了过去...\n\n（第二天醒来，体力只恢复了50%）\n\n` + travelMsg;
            }
            // v0.9.0: 首次探索奖励显示
            if (firstExploreReward) {
                travelMsg += `\n\n🗺️ 首次探索！\n经验 +${firstExploreReward.exp}\n金币 +${firstExploreReward.gold}`;
                // v0.9.6: 隐藏发现奖励显示
                if (firstExploreReward.hiddenFind) {
                    travelMsg += `\n\n✨ 意外发现！\n你在探索中发现了隐藏的宝物！\n经验 +${firstExploreReward.hiddenFind.exp}\n金币 +${firstExploreReward.hiddenFind.gold}`;
                }
                // v0.9.8: 连续探索奖励显示
                if (firstExploreReward.consecutiveBonus) {
                    travelMsg += `\n\n🔥 连续探索${firstExploreReward.consecutiveBonus.count}个新地点！\n探索达人奖励！\n经验 +${firstExploreReward.consecutiveBonus.exp}\n金币 +${firstExploreReward.consecutiveBonus.gold}`;
                }
                // v0.13.0: 隐藏地点首次进入奖励显示
                if (firstExploreReward.hiddenLocation) {
                    travelMsg += `\n\n🏞️ 发现隐藏地点：${firstExploreReward.hiddenLocation.name}！\n你发现了一个隐秘的地点！\n经验 +${firstExploreReward.hiddenLocation.exp}\n金币 +${firstExploreReward.hiddenLocation.gold}`;
                }
            }
            // v0.9.1: 100%探索完成奖励显示
            if (explorationCompleteReward) {
                travelMsg += `\n\n🏆 探索完成！\n你已探索所有已解锁地点！\n经验 +${explorationCompleteReward.exp}\n金币 +${explorationCompleteReward.gold}`;
            }
            UI.showMessage(travelMsg);
        } catch (e) {
            console.error('移动出错:', e);
            UI.showMessage('移动失败：' + e.message);
        }
    },

    // v0.79.0: 打开可视化地图
    openMap() {
        UI.renderMapView();
    },

    // v0.79.0: 关闭地图返回主界面
    closeMap() {
        UI.renderMapScreen();
    },

    // 原地休息（消耗1小时，恢复少量HP/MP/体力，可能遇敌）
    quickRest() {
        const hpRecover = Math.floor(Player.maxHp * 0.3);
        const mpRecover = Math.floor(Player.maxMp * 0.2);
        const staminaRecover = 30;

        const oldHp = Player.hp;
        const oldMp = Player.mp;
        const oldStamina = Player.stamina;

        Player.hp = Math.min(Player.maxHp, Player.hp + hpRecover);
        Player.mp = Math.min(Player.maxMp, Player.mp + mpRecover);
        Player.stamina = Math.min(Player.maxStamina || 100, Player.stamina + staminaRecover);

        // v0.9.1: 休息后清除疲劳
        const oldFatigue = Player.fatigueLevel;
        Player.fatigueLevel = 0;

        const actualHp = Player.hp - oldHp;
        const actualMp = Player.mp - oldMp;
        const actualStamina = Player.stamina - oldStamina;

        // 推进1小时
        const events = TimeSystem.advanceTime(1);

        let msg = '你原地打坐休息了1小时，恢复了';
        const parts = [];
        if (actualHp > 0) parts.push(`${actualHp} HP`);
        if (actualMp > 0) parts.push(`${actualMp} MP`);
        if (actualStamina > 0) parts.push(`${actualStamina} 体力`);
        if (oldFatigue > 0) parts.push('疲劳状态已消除');
        msg += parts.join('、') + '。';

        // 有概率遇到敌人（10%概率，野外）
        if (Player.currentLocation && Player.currentLocation !== 'bo_cheng' && Math.random() < 0.1) {
            msg += '\n休息时被魔物发现了！';
            Player.save();
            UI.showMessage(msg);
            // 触发战斗
            setTimeout(() => {
                if (typeof EncounterSystem !== 'undefined') {
                    EncounterSystem.triggerRandomEncounter();
                }
            }, 500);
            return;
        }

        // 处理时间事件
        if (events && events.length > 0) {
            // 有定时事件触发
            Player.save();
            UI.showMessage(msg);
            setTimeout(() => {
                if (typeof EventSystem !== 'undefined') {
                    for (const evt of events) {
                        if (evt.type === 'scheduled') {
                            EventSystem.triggerScheduledEvent(evt.eventId);
                            break;
                        }
                    }
                }
            }, 500);
            return;
        }

        Player.save();
        UI.renderMapScreen();
        UI.showMessage(msg);
    },

    // v0.9.1: 快速休息（恢复全部状态到满，消耗指定小时数）
    quickRestFull(hours = 1) {
        // 检查是否已经全满
        const hpFull = Player.hp >= Player.maxHp;
        const mpFull = Player.mp >= Player.maxMp;
        const staminaFull = Player.stamina >= (Player.maxStamina || 100);
        const fatigueClear = Player.fatigueLevel <= 0;

        if (hpFull && mpFull && staminaFull && fatigueClear) {
            UI.showMessage('✨ 状态良好，HP/MP/体力全满，无需休息！');
            return;
        }

        const oldHp = Player.hp;
        const oldMp = Player.mp;
        const oldStamina = Player.stamina;
        const oldFatigue = Player.fatigueLevel;

        // 恢复到满
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        Player.stamina = Player.maxStamina || 100;
        Player.fatigueLevel = 0;

        const actualHp = Player.hp - oldHp;
        const actualMp = Player.mp - oldMp;
        const actualStamina = Player.stamina - oldStamina;

        // 推进指定小时数
        const events = TimeSystem.advanceTime(hours);

        let msg = `你充分休息了${hours}小时，完全恢复了状态！\n`;
        const parts = [];
        if (actualHp > 0) parts.push(`HP +${actualHp}`);
        if (actualMp > 0) parts.push(`MP +${actualMp}`);
        if (actualStamina > 0) parts.push(`体力 +${actualStamina}`);
        if (oldFatigue > 0) parts.push('疲劳已消除');
        msg += parts.join('，');

        // 处理时间事件
        if (events && events.length > 0) {
            Player.save();
            UI.showMessage(msg);
            setTimeout(() => {
                if (typeof EventSystem !== 'undefined') {
                    for (const evt of events) {
                        if (evt.type === 'scheduled') {
                            EventSystem.triggerScheduledEvent(evt.eventId);
                        }
                    }
                }
            }, 500);
            return;
        }

        Player.save();
        UI.renderMapScreen();
        UI.showMessage(msg);
    },

    // v0.82.1: 统一休息菜单（合并原地休息/充分休息/宿舍睡眠/睡到明天）
    showRestMenu() {
        try {
            // v0.92.17: 强制恢复点击，防止之前的消息弹窗导致点击被拦截
            if (typeof UI !== 'undefined' && UI._restoreClicks) {
                UI._restoreClicks();
            }
            
            const maxSta = Player.maxStamina || 100;
            const hpMissing = Math.max(0, (Player.maxHp - Player.hp) / Player.maxHp);
            const mpMissing = Math.max(0, (Player.maxMp - Player.mp) / Player.maxMp);
            const staMissing = Math.max(0, (maxSta - Player.stamina) / maxSta);
            const fullRestHours = Math.max(1, Math.min(4, Math.ceil(Math.max(hpMissing, mpMissing, staMissing) * 3)));
            const allFull = Player.hp >= Player.maxHp && Player.mp >= Player.maxMp && Player.stamina >= maxSta && Player.fatigueLevel <= 0;
            const location = MapSystem.getCurrentLocation();
            const hasSleepAction = location?.actions?.some(a => a.id === 'sleep');

        // 移除所有已存在的overlay，避免叠加
        document.querySelectorAll('.rest-overlay, .ei-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'rest-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);';
        overlay.innerHTML = `
            <div style="max-width:450px;width:100%;background:linear-gradient(135deg,#1a1a3a,#2a2a5a);border:2px solid #5577aa;border-radius:16px;padding:20px;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3 style="color:#88ccff;font-size:20px;margin:0;">😴 休息方式</h3>
                    <div class="rest-close-btn" style="position:relative;z-index:10;padding:8px 18px;background:#333355;border:1px solid #666688;border-radius:8px;color:#ccc;cursor:pointer;font-size:14px;user-select:none;transition:all 0.2s;" onmouseover="this.style.background='#444466';this.style.color='#fff'" onmouseout="this.style.background='#333355';this.style.color='#ccc'">✕ 关闭</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div class="rest-option" data-type="quick" style="padding:14px;background:linear-gradient(135deg,rgba(40,80,40,0.8),rgba(60,120,60,0.8));border:2px solid #448844;border-radius:12px;cursor:pointer;transition:all 0.2s;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span style="font-size:16px;font-weight:bold;color:#ddffdd;">💚 原地休息</span>
                            <span style="font-size:12px;color:#aaffaa;">⏱️ 1小时</span>
                        </div>
                        <div style="font-size:12px;color:#99bb99;">恢复30%HP、20%MP、30体力，消除疲劳。野外有小概率遇敌。</div>
                    </div>
                    <div class="rest-option" data-type="full" style="padding:14px;background:linear-gradient(135deg,rgba(60,40,80,0.8),rgba(100,60,140,0.8));border:2px solid #8855aa;border-radius:12px;cursor:pointer;transition:all 0.2s;${allFull ? 'opacity:0.5;cursor:not-allowed;' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span style="font-size:16px;font-weight:bold;color:#eeddff;">💜 充分休息</span>
                            <span style="font-size:12px;color:#cc99ff;">⏱️ ${fullRestHours}小时</span>
                        </div>
                        <div style="font-size:12px;color:#bb99dd;">根据缺失状态消耗1-4小时，HP/MP/体力全部回满，消除疲劳。${allFull ? '（状态已满）' : ''}</div>
                    </div>
                    ${hasSleepAction ? `
                    <div class="rest-option" data-type="sleepAction" style="padding:14px;background:linear-gradient(135deg,rgba(50,50,90,0.8),rgba(70,70,130,0.8));border:2px solid #6677bb;border-radius:12px;cursor:pointer;transition:all 0.2s;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span style="font-size:16px;font-weight:bold;color:#ccdfff;">🛏️ 宿舍睡眠</span>
                            <span style="font-size:12px;color:#99bbff;">⏱️ 8小时</span>
                        </div>
                        <div style="font-size:12px;color:#8899bb;">在宿舍好好睡一觉到明早，22点前入睡效果最好，大幅恢复状态。</div>
                    </div>
                    ` : `
                    <div class="rest-option" data-type="rest" style="padding:14px;background:linear-gradient(135deg,rgba(40,40,80,0.8),rgba(60,60,120,0.8));border:2px solid #5566aa;border-radius:12px;cursor:pointer;transition:all 0.2s;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span style="font-size:16px;font-weight:bold;color:#ccdfff;">🌙 睡到明天</span>
                            <span style="font-size:12px;color:#99bbff;">⏱️ 至次日6:00</span>
                        </div>
                        <div style="font-size:12px;color:#8899bb;">直接休息到第二天清晨，全部恢复。熬夜睡觉恢复效果较差。</div>
                    </div>
                    `}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        const close = () => overlay.remove();
        overlay.querySelector('.rest-close-btn').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        overlay.querySelectorAll('.rest-option').forEach(el => {
            el.onclick = () => {
                const type = el.dataset.type;
                if (type === 'full' && allFull) return;
                close();
                setTimeout(() => {
                    if (type === 'quick') Game.quickRest();
                    else if (type === 'full') Game.quickRestFull(fullRestHours);
                    else if (type === 'sleepAction') Game.performAction('sleep');
                    else if (type === 'rest') Game.rest();
                }, 100);
            };
        });
        } catch (e) {
            console.error('showRestMenu error:', e);
            UI.showMessage('打开休息菜单时出错：' + e.message);
        }
    },

    // v0.82.0: 合并事件追踪与情报
    showEventsAndIntel() {
        try {
            // v0.92.17: 强制恢复点击，防止之前的消息弹窗导致点击被拦截
            if (typeof UI !== 'undefined' && UI._restoreClicks) {
                UI._restoreClicks();
            }
            
            const available = (typeof EncounterSystem !== 'undefined') ? EncounterSystem.getAvailableSpecialEvents() : [];
            const knownInfo = WorldState.knownInfo || [];
            const infoDatabase = GameData.infoDatabase || { infos: {} };
            const recentInfos = knownInfo.slice(-5).reverse().map(id => infoDatabase.infos[id]).filter(Boolean);

        // 移除所有已存在的overlay，避免叠加
        document.querySelectorAll('.rest-overlay, .ei-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'ei-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);';
        overlay.innerHTML = `
            <div style="max-width:500px;width:100%;background:linear-gradient(135deg,#1a1a3a,#2a2a5a);border:2px solid #aa8833;border-radius:16px;padding:20px;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3 style="color:#ffd700;font-size:20px;margin:0;">📜 事件与情报</h3>
                    <div class="ei-close-btn" style="position:relative;z-index:10;padding:8px 18px;background:#333355;border:1px solid #666688;border-radius:8px;color:#ccc;cursor:pointer;font-size:14px;user-select:none;transition:all 0.2s;" onmouseover="this.style.background='#444466';this.style.color='#fff'" onmouseout="this.style.background='#333355';this.style.color='#ccc'">✕ 关闭</div>
                </div>
                <!-- 特殊事件 -->
                <div style="margin-bottom:15px;">
                    <div style="color:#ffaa44;font-size:14px;font-weight:bold;margin-bottom:8px;">✨ 可触发事件 (${available.length})</div>
                    ${available.length === 0 ? '<div style="color:#888;font-size:13px;padding:10px;text-align:center;">暂无可触发事件，继续修炼提升等级吧</div>' : available.map((e, i) => `
                        <div style="padding:10px;margin-bottom:6px;background:rgba(60,50,20,0.6);border:1px solid #887744;border-radius:8px;">
                            <div style="font-size:14px;font-weight:bold;color:#ffdd88;margin-bottom:3px;">${e.icon} ${e.name}</div>
                            <div style="font-size:12px;color:#bb9966;margin-bottom:6px;">${e.description}</div>
                            <button data-event-idx="${i}" class="ei-trigger-btn" style="padding:5px 12px;background:linear-gradient(135deg,#aa6600,#cc8800);border:1px solid #ffd700;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;font-weight:bold;">立即触发</button>
                        </div>
                    `).join('')}
                </div>
                <!-- 最近情报 -->
                <div style="margin-bottom:15px;">
                    <div style="color:#88ccff;font-size:14px;font-weight:bold;margin-bottom:8px;">🔍 最近情报 (${knownInfo.length}条已收集)</div>
                    ${recentInfos.length === 0 ? '<div style="color:#888;font-size:13px;padding:10px;text-align:center;">尚未收集到情报</div>' : recentInfos.map(info => `
                        <div style="padding:8px 10px;margin-bottom:5px;background:rgba(30,40,60,0.6);border-left:3px solid #6699cc;border-radius:4px;">
                            <div style="font-size:13px;color:#ccddff;">${info.title || info.content || '未知情报'}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align:center;">
                    <button class="ei-full-intel-btn" style="padding:8px 20px;background:linear-gradient(135deg,rgba(40,60,100,0.9),rgba(60,80,140,0.9));border:1px solid #5577aa;border-radius:8px;color:#aaccff;cursor:pointer;font-size:13px;">查看完整情报 →</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        const close = () => overlay.remove();
        overlay.querySelector('.ei-close-btn').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        overlay.querySelectorAll('.ei-trigger-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.eventIdx);
                const event = available[idx];
                if (event && typeof EncounterSystem !== 'undefined') {
                    close();
                    setTimeout(() => EncounterSystem.triggerSpecialEvent(event.id), 100);
                }
            };
        });
        overlay.querySelector('.ei-full-intel-btn').onclick = () => {
            close();
            setTimeout(() => Game.openIntelPanel(), 100);
        };
        } catch (e) {
            console.error('showEventsAndIntel error:', e);
            UI.showMessage('打开事件与情报面板时出错：' + e.message);
        }
    },

    // v0.9.2: 一键恢复（自动使用背包中的恢复药品）
    quickHeal() {
        const hpRatio = Player.hp / Player.maxHp;
        const mpRatio = Player.mp / Player.maxMp;

        // 状态良好，不需要恢复
        if (hpRatio >= 0.8 && mpRatio >= 0.8) {
            UI.showMessage('✨ 状态良好，HP/MP均在80%以上，无需使用药品！');
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
                const needHp = Player.hp < Player.maxHp * 0.8;
                const needMp = Player.mp < Player.maxMp * 0.8;
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
            if (Player.hp >= Player.maxHp * 0.8 && Player.mp >= Player.maxMp * 0.8) break;
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
    },

    // v0.13.0: 自动解锁检查 - 检查是否满足未解锁地点的条件
    checkAutoUnlockLocations() {
        const allLocations = DataManager.getAllLocations();
        const newlyUnlocked = [];
        
        allLocations.forEach(loc => {
            if (Player.unlockedLocations.includes(loc.id)) return;
            if (!loc.unlockCondition) return;
            
            const cond = loc.unlockCondition;
            let canUnlock = true;
            
            // 等级要求（支持minLevel和level两种写法）
            const reqLevel = cond.minLevel || cond.level;
            if (reqLevel && Player.level < reqLevel) {
                canUnlock = false;
            }
            
            // 任务要求（支持requiredQuest/quest/questCompleted三种写法）
            const reqQuest = cond.requiredQuest || cond.quest || cond.questCompleted;
            if (reqQuest) {
                if (!Player.completedQuests || !Player.completedQuests.includes(reqQuest)) {
                    canUnlock = false;
                }
            }
            
            // 全局标记要求
            if (cond.requiredFlag) {
                if (typeof WorldState !== 'undefined' && !WorldState.getFlag(cond.requiredFlag)) {
                    canUnlock = false;
                }
            }
            
            // 物品要求
            if (cond.hasItem) {
                if (typeof Inventory === 'undefined' || !Inventory.hasItem(cond.hasItem)) {
                    canUnlock = false;
                }
            }
            
            // NPC好感度要求
            if (cond.minOpinion) {
                const npcId = cond.minOpinion.npcId;
                const requiredValue = cond.minOpinion.value;
                const opinion = Player.getOpinion ? Player.getOpinion(npcId) : 0;
                if (opinion < requiredValue) {
                    canUnlock = false;
                }
            }
            
            if (canUnlock) {
                Player.unlockedLocations.push(loc.id);
                newlyUnlocked.push(loc);
            }
        });
        
        if (newlyUnlocked.length > 0) {
            Player.save();
            const names = newlyUnlocked.map(l => `🔓 ${l.name}`).join('\n');
            setTimeout(() => {
                UI.showMessage(`🎉 解锁新地点！\n\n${names}\n\n可以在地图中前往探索了！`);
            }, 500);
        }
    },
    startBattle(enemy, endCallback, options = {}) {
        this.state = 'battle';
        this.battleEndCallback = endCallback || null;
        // 保存上一次战斗数据（用于再次挑战）
        this.lastBattle = {
            enemy: JSON.parse(JSON.stringify(enemy)),  // 深拷贝
            options: options
        };
        BattleSystem.startBattle(enemy, options);
        UI.renderBattleScreen();
    },

    // 与NPC切磋/挑战
    startDuel(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) {
            UI.showMessage('找不到该NPC');
            return;
        }

        // 关闭对话
        this._closeDialogue();

        // 获取NPC当前状态的战斗数据
        let duelData;
        if (typeof NPCGrowthService !== 'undefined') {
            duelData = NPCGrowthService.getDuelData(npcId);
        }

        // 如果没有growth数据，用原始数据
        if (!duelData) {
            duelData = {
                id: npcId,
                name: npc.name,
                title: npc.title || '',
                level: npc.level || 1,
                elements: npc.elements || [],
                skills: npc.skills || ['basic_attack'],
                maxHp: npc.maxHp || 100,
                hp: npc.maxHp || 100,
                maxMp: npc.maxMp || 50,
                mp: npc.maxMp || 50,
                attack: npc.attack || 10,
                defense: npc.defense || 5,
                speed: npc.speed || 10,
                spirit: npc.spirit || 10,
                aiType: npc.aiType || 'balanced',
                enemyType: 'human',
                isEnemy: false,
                isAlly: false,
                isDuel: true,
            };
        }

        duelData.isDuel = true;
        duelData.isEnemy = false;

        // 切磋不致死，HP降到1就结束
        const options = {
            isDuel: true,
            duelNpcId: npcId,
            noDeath: true,
            onWin: () => {
                UI.showMessage(`你赢了${npc.name}！切磋结束。`);
                // 切磋胜利可以加少量好感度
                if (typeof NPCStateSystem !== 'undefined') {
                    NPCStateSystem.changeOpinion(npcId, 3, '切磋胜利');
                }
            },
            onLose: () => {
                UI.showMessage(`你输给了${npc.name}，再接再厉！`);
            }
        };

        this.startBattle(duelData, null, options);
    },
    
    // 再次挑战上一次的敌人
    rematch() {
        if (!this.lastBattle) {
            UI.showMessage('没有可再次挑战的敌人');
            return;
        }
        // 恢复玩家HP/MP到战斗前状态？不，玩家应该保持当前状态
        // 重新创建敌人（深拷贝）
        const enemy = JSON.parse(JSON.stringify(this.lastBattle.enemy));
        const options = this.lastBattle.options || {};
        this.startBattle(enemy, null, options);
    },
    
    // 开始车轮战
    startGauntlet(enemyList, options = {}) {
        this.gauntletState = {
            enemies: enemyList,  // 敌人列表
            currentIndex: 0,  // 当前敌人索引
            totalWins: 0,  // 胜利次数
            totalExp: 0,  // 累计经验
            totalGold: 0,  // 累计金币
            totalItems: [],  // 累计物品
            options: options  // 其他选项
        };
        this.state = 'battle';
        this.battleEndCallback = null;
        
        // 开始第一个敌人
        const firstEnemy = enemyList[0];
        BattleSystem.startBattle(firstEnemy, {
            canUseItems: options.canUseItems !== false,
            canFlee: false  // 车轮战不能逃跑
        });
        UI.renderBattleScreen();
        
        // 显示车轮战开始消息
        BattleSystem.addLog(`⚔️ 车轮战开始！共 ${enemyList.length} 个对手`, 'system');
    },
    
    // 车轮战：下一个敌人
    nextGauntletEnemy() {
        if (!this.gauntletState) return false;
        
        this.gauntletState.currentIndex++;
        const index = this.gauntletState.currentIndex;
        const total = this.gauntletState.enemies.length;
        
        if (index >= total) {
            // 全部打完了，车轮战胜利
            return false;
        }
        
        // 继续下一个敌人
        const nextEnemy = this.gauntletState.enemies[index];
        BattleSystem.startBattle(nextEnemy, {
            canUseItems: this.gauntletState.options.canUseItems !== false,
            canFlee: false
        });
        
        // 显示下一个敌人的消息
        BattleSystem.addLog(`⚔️ 第 ${index + 1}/${total} 个对手：${nextEnemy.name}！`, 'system');
        
        return true;
    },

    // 玩家攻击
    battleAttack() {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerAttack();
        UI.updateBattleScreen();
        
        // 检查战斗结束
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家使用技能
    // v0.94.0: 战斗使用技能并关闭技能列表（内联展开式UI专用）
    battleUseSkillAndClose(skillId) {
        console.log('[DEBUG] battleUseSkillAndClose called, skillId=', skillId, 'isPlayerTurn=', BattleSystem.isPlayerTurn, 'mp=', Player.mp);
        this.battleUseSkill(skillId);
        // 立即关闭技能列表并渲染，不使用updateBattleScreen的500ms延迟
        UI._expandedBattleElement = null;
        if (BattleSystem && BattleSystem.active) {
            UI.renderBattleScreen();
        }
    },

    battleUseSkill(skillId) {
        try {
            console.log('[DEBUG] battleUseSkill start, skillId=', skillId, 'isPlayerTurn=', BattleSystem.isPlayerTurn, 'active=', BattleSystem.active);
            if (!BattleSystem.isPlayerTurn) {
                console.log('[DEBUG] battleUseSkill blocked: not player turn');
                UI.showMessage('现在不是你的回合！');
                return;
            }
            
            const skill = SkillSystem.getSkill(skillId);
            if (!skill) {
                console.log('[DEBUG] battleUseSkill blocked: skill not found');
                UI.showMessage('技能不存在！');
                return;
            }
            
            if (Player.mp < skill.mpCost) {
                console.log('[DEBUG] battleUseSkill blocked: mp insufficient, need=', skill.mpCost, 'have=', Player.mp);
                UI.showMessage(`魔法值不足！需要 ${skill.mpCost} MP，当前 ${Player.mp} MP`);
                return;
            }
            
            const result = BattleSystem.playerCastSkill(skillId);
            console.log('[DEBUG] playerCastSkill result=', result);
            if (result === null) {
                console.log('[DEBUG] battleUseSkill blocked: playerCastSkill returned null');
                UI.showMessage('技能释放失败，请查看战斗日志。');
                return;
            }
            
            UI.updateBattleScreen();
            
            if (!BattleSystem.active) {
                this.endBattle();
            }
        } catch (e) {
            console.error('[DEBUG] battleUseSkill error:', e);
            UI.showMessage('技能释放出错：' + e.message);
        }
    },

    // v0.15.0: 重复上次技能
    battleRepeatSkill() {
        if (!BattleSystem.isPlayerTurn) return;
        const lastSkillId = BattleSystem.lastSkillId;
        if (!lastSkillId) return;

        const skill = SkillSystem.getSkill(lastSkillId);
        if (!skill) return;
        if (Player.mp < skill.mpCost) {
            UI.showMessage('魔法值不足，无法重复上次技能！');
            return;
        }

        BattleSystem.playerCastSkill(lastSkillId);
        UI.updateBattleScreen();

        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家使用魔具技能
    battleUseMagicTool(skillId) {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.useMagicTool(skillId);
        UI.updateBattleScreen();
        
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家防御
    battleDefend() {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerDefend();
        UI.updateBattleScreen();
        
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家冥想（回蓝回血）
    battleMeditate() {
        if (!BattleSystem.isPlayerTurn) return;

        BattleSystem.playerMeditate();
        UI.updateBattleScreen();

        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家恢复（防御+冥想合并，只回蓝）
    battleRecover() {
        if (!BattleSystem.isPlayerTurn) return;

        BattleSystem.playerRecover();
        UI.updateBattleScreen();

        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家使用道具
    battleUseItem(itemId) {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerUseItem(itemId);
        
        // 关闭道具弹窗（使用道具是一个行动，使用后关闭弹窗）
        const itemsOverlay = document.getElementById('battle-items-overlay');
        if (itemsOverlay) itemsOverlay.remove();
        
        UI.updateBattleScreen();
        
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 显示战斗道具选择
    battleShowItems() {
        if (!BattleSystem.isPlayerTurn) return;
        UI.showBattleItems();
    },

    // 玩家逃跑
    battleFlee() {
        try {
            if (!BattleSystem.isPlayerTurn) {
                UI.showMessage('现在不是你的回合！');
                return;
            }
            
            const result = BattleSystem.playerFlee();
            UI.updateBattleScreen();
            
            if (result && result.success) {
                setTimeout(() => {
                    this.state = 'map';
                    UI.renderMapScreen();
                }, 1000);
            } else if (result && !result.success) {
                // 逃跑失败，战斗日志已有记录，这里给玩家明确反馈
                UI.showMessage('逃跑失败！敌人挡住了你的去路。');
            }
        } catch (e) {
            console.error('battleFlee error:', e);
            UI.showMessage('逃跑时出错：' + e.message);
        }
    },

    // 结束战斗
    endBattle() {
        BattleSystem.endBattle();
        UI._expandedBattleElement = null; // v0.94.0: 重置战斗技能展开状态
        
        setTimeout(() => {
            // 如果有战斗结束回调，调用回调
            if (this.battleEndCallback) {
                const callback = this.battleEndCallback;
                this.battleEndCallback = null;
                callback(BattleSystem.result, BattleSystem.rewards);
                return;
            }
            
            if (BattleSystem.result === 'win') {
                // 记录击杀到图鉴
                if (BattleSystem.enemy && BattleSystem.enemy.id) {
                    Player.recordKill(BattleSystem.enemy.id);
                }
                // 日常追踪：击杀和战斗胜利
                DailySystem.trackActivity('kill', 1);
                DailySystem.trackActivity('battle_win', 1);
                // v0.9.4: 每日统计
                if (Player.dailyStats) Player.dailyStats.battlesWon = (Player.dailyStats.battlesWon || 0) + 1;
                if (BattleSystem.rewards && BattleSystem.rewards.gold) {
                    DailySystem.trackActivity('earn_gold', BattleSystem.rewards.gold);
                }
                
                // 检查是不是车轮战
                if (this.gauntletState) {
                    // 累计奖励
                    const rewards = BattleSystem.rewards;
                    this.gauntletState.totalWins++;
                    this.gauntletState.totalExp += rewards.exp;
                    this.gauntletState.totalGold += rewards.gold;
                    if (rewards.items && rewards.items.length > 0) {
                        this.gauntletState.totalItems.push(...rewards.items);
                    }
                    
                    // 尝试下一个敌人
                    const hasNext = this.nextGauntletEnemy();
                    if (hasNext) {
                        // 还有下一个，继续战斗
                        UI.renderBattleScreen();
                        return;
                    } else {
                        // 全部打完了，车轮战胜利
                        const totalWins = this.gauntletState.totalWins;
                        const totalExp = this.gauntletState.totalExp;
                        const totalGold = this.gauntletState.totalGold;
                        const totalItems = this.gauntletState.totalItems;
                        
                        // 清空车轮战状态
                        this.gauntletState = null;
                        
                        // 显示车轮战胜利消息
                        let message = `🏆 车轮战胜利！\n\n`;
                        message += `连胜：${totalWins} 场\n\n`;
                        message += `🎁 累计奖励\n`;
                        message += `经验：+${totalExp}\n`;
                        message += `金币：+${totalGold}\n`;
                        if (totalItems.length > 0) {
                            totalItems.forEach(item => {
                                message += `${item.name}：x${item.count}\n`;
                            });
                        }
                        
                        UI.showMessage(message.trim());
                        this.state = 'map';
                        UI.renderMapScreen();
                        Player.save();
                        return;
                    }
                }
                
                // 普通战斗胜利
                const rewards = BattleSystem.rewards;
                const stats = BattleSystem.stats;
                const rating = BattleSystem.rating;
                
                // v0.9.0: 战后恢复（Chained Echoes模式）
                // 普通战斗胜利后恢复80%HP/MP，清除debuff
                // Boss战/决斗/试炼不恢复（高难度挑战）
                const battleMode = BattleSystem.battleOptions?.mode;
                const isBossBattle = battleMode === 'boss' || battleMode === 'duel' || battleMode === 'trial' 
                    || BattleSystem.enemy?.isBoss || BattleSystem.enemy?.tier === 'commander';
                let postBattleRecover = null;
                if (!isBossBattle) {
                    const hpBefore = Player.hp;
                    const mpBefore = Player.mp;
                    const targetHp = Math.floor(Player.maxHp * 0.8);
                    const targetMp = Math.floor(Player.maxMp * 0.8);
                    Player.hp = Math.max(Player.hp, targetHp);
                    Player.mp = Math.max(Player.mp, targetMp);
                    // 清除玩家负面状态
                    if (BattleSystem.player?.statusEffects) {
                        BattleSystem.player.statusEffects = BattleSystem.player.statusEffects.filter(
                            e => !['burn','freeze','frozen','stun','slow','poison','curse','paralyze','weakness','bleed','bind','blind','fear','shock','attack_down','defense_down'].includes(e.type)
                        );
                    }
                    postBattleRecover = {
                        hp: Player.hp - hpBefore,
                        mp: Player.mp - mpBefore
                    };
                }

                // v0.99.0: 体力系统已移除，低体力受伤机制暂时禁用
                // 后续版本改为：连续猎魔第4次后有概率受伤
                let fatigueResult = null;
                
                let message = '⚔️ 战斗胜利！\n\n';
                
                // 战斗评价
                if (rating) {
                    const ratingColors = { S: '🌟', A: '⭐', B: '✨', C: '👍', D: '💪' };
                    message += `${ratingColors[rating.level] || ''} 评价：${rating.level}级\n`;
                    message += `得分：${rating.score}分\n`;
                    // 评分详情
                    if (rating.details) {
                        const details = [];
                        if (rating.details.turnBonus) details.push(`回合${rating.details.turnBonus > 0 ? '+' : ''}${rating.details.turnBonus}`);
                        if (rating.details.hpBonus) details.push(`血量+${rating.details.hpBonus}`);
                        if (rating.details.itemPenalty) details.push(`道具${rating.details.itemPenalty}`);
                        if (rating.details.critBonus) details.push(`暴击+${rating.details.critBonus}`);
                        if (rating.details.interruptBonus) details.push(`打断+${rating.details.interruptBonus}`);
                        if (rating.details.noDamageBonus) details.push(`无伤+${rating.details.noDamageBonus}`);
                        if (rating.details.levelBonus) details.push(`等级差${rating.details.levelBonus > 0 ? '+' : ''}${rating.details.levelBonus}`);
                        if (details.length > 0) {
                            message += `(${details.join('，')})\n`;
                        }
                    }
                    message += '\n';
                }
                
                // 战斗统计
                message += '📊 战斗统计\n';
                message += `回合数：${BattleSystem.turn}\n`;
                message += `总伤害：${stats.totalDamageDealt || 0}\n`;
                message += `受到伤害：${stats.totalDamageTaken || 0}\n`;
                if (stats.totalHealingDone > 0) {
                    message += `治疗量：${stats.totalHealingDone}\n`;
                }
                if (stats.critCount > 0) {
                    message += `暴击次数：${stats.critCount}\n`;
                }
                if (stats.interruptCount > 0) {
                    message += `打断次数：${stats.interruptCount}\n`;
                }
                if (stats.missCount > 0) {
                    message += `闪避次数：${stats.missCount}\n`;
                }
                if (stats.skillsUsed > 0) {
                    message += `使用技能：${stats.skillsUsed}次\n`;
                }
                message += `\n`;
                
                // 奖励
                message += '🎁 奖励\n';
                message += `经验：+${rewards.exp}`;
                if (rewards.ratingBonus) message += ` (评价+${Math.floor(rewards.ratingBonus * 100)}%)`;
                message += '\n';
                message += `金币：+${rewards.gold}`;
                if (rewards.goldCrit) message += ' 💰暴击！';
                if (rewards.ratingBonus) message += ` (评价+${Math.floor(rewards.ratingBonus * 100)}%)`;
                message += '\n';
                if (rewards.items.length > 0) {
                    rewards.items.forEach(item => {
                        message += `${item.name}：x${item.count}\n`;
                    });
                }
                // v0.9.0: 战后恢复显示
                if (postBattleRecover && (postBattleRecover.hp > 0 || postBattleRecover.mp > 0)) {
                    message += `\n💚 战后恢复\n`;
                    if (postBattleRecover.hp > 0) message += `HP：+${postBattleRecover.hp}（恢复到80%）\n`;
                    if (postBattleRecover.mp > 0) message += `MP：+${postBattleRecover.mp}（恢复到80%）\n`;
                    message += `负面状态：已清除\n`;
                }
                // v0.9.1: 低体力受伤显示
                if (fatigueResult) {
                    if (fatigueResult.level === 2) {
                        message += `\n⚠️ 体力耗尽，你受了重伤！\n下一场战斗攻击-30%，防御-15%\n（休息后恢复）\n`;
                    } else {
                        message += `\n⚠️ 体力过低，你感到疲惫！\n下一场战斗攻击-15%\n（休息后恢复）\n`;
                    }
                }
                if (rewards.levelUps.length > 0) {
                    message += `\n🎉 升级了！当前等级 ${Player.level}\n`;
                    message += `获得属性点（当前可分配：${Player.attributePoints} 点）`;
                    // 天生天赋进化提示
                    if (Player._innateTalentEvolved) {
                        const talentData = typeof DataInnateTalents !== 'undefined' ? DataInnateTalents[Player.innateTalent] : null;
                        const talentName = talentData?.name || '天生天赋';
                        message += `\n✨ ${talentName} 进化到 Lv.${Player.innateTalentLevel}！效果增强！`;
                        Player._innateTalentEvolved = false;
                    }
                }
                
                UI.showMessage(message.trim());
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
                
            } else if (BattleSystem.result === 'lose') {
                // 检查是不是车轮战
                if (this.gauntletState) {
                    const totalWins = this.gauntletState.totalWins;
                    const totalExp = this.gauntletState.totalExp;
                    const totalGold = this.gauntletState.totalGold;
                    const totalItems = this.gauntletState.totalItems;
                    
                    // 清空车轮战状态
                    this.gauntletState = null;
                    
                    // 显示车轮战失败消息
                    let message = `💀 车轮战失败！\n\n`;
                    message += `连胜：${totalWins} 场\n\n`;
                    message += `🎁 已获得奖励\n`;
                    message += `经验：+${totalExp}\n`;
                    message += `金币：+${totalGold}\n`;
                    if (totalItems.length > 0) {
                        totalItems.forEach(item => {
                            message += `${item.name}：x${item.count}\n`;
                        });
                    }
                    
                    UI.showMessage(message.trim());
                    this.state = 'map';
                    UI.renderMapScreen();
                    Player.save();
                    return;
                }
                
                // v0.9.0: 普通战斗失败 - 轻惩罚（鼓励玩家大胆尝试）
                // 恢复50%HP/MP，不扣金币/时间，回到当前地点
                Player.hp = Math.max(1, Math.floor(Player.maxHp * 0.5));
                Player.mp = Math.floor(Player.maxMp * 0.5);
                // 清除负面状态
                if (BattleSystem.player?.statusEffects) {
                    BattleSystem.player.statusEffects = [];
                }
                UI.showMessage('💀 战斗失败！\n\n你被击败了，但没有受太重的伤。\nHP/MP恢复到50%，可以调整后再次挑战。');
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
            }
        }, 1500);
    },

    // ========== 事件界面 ==========
    showEvent(event) {
        // 支持传入事件ID字符串或事件对象
        let eventData = event;
        if (typeof event === 'string') {
            eventData = EventSystem.getEvent(event);
            if (!eventData) {
                console.warn('[事件] 事件不存在:', event);
                UI.showMessage('事件数据异常');
                return;
            }
        }
        this.state = 'event';
        this.currentEvent = eventData;
        UI.renderEventScreen(eventData);
    },

    // ========== 大事件界面 ==========
    showScheduledEvent(event) {
        try {
            this.state = 'scheduled_event';
            this.currentScheduledEvent = event;
    
            // 检查是否满足条件
            let success = true;
            if (event.conditions) {
                if (event.conditions.minLevel && Player.level < event.conditions.minLevel) {
                    success = false;
                }
            }
    
            // 标记事件已触发
            Player.flags['event_' + event.id] = true;
    
            // 应用效果
            if (success) {
                if (event.successRewards) {
                    if (event.successRewards.exp) {
                        Player.gainExp(event.successRewards.exp);
                    }
                    if (event.successRewards.gold) {
                        Player.gold += event.successRewards.gold;
                    }
                    if (event.successRewards.items) {
                        event.successRewards.items.forEach(item => {
                            Inventory.addItem(item.itemId, item.count || 1);
                        });
                    }
                }
            } else {
                if (event.failPenalty) {
                    if (event.failPenalty.exp) {
                        Player.exp = Math.max(0, Player.exp + event.failPenalty.exp);
                    }
                    if (event.failPenalty.gold) {
                        Player.gold = Math.max(0, Player.gold + event.failPenalty.gold);
                    }
                }
            }
    
            // 显示事件界面
            UI.renderScheduledEventScreen(event, success);
    
            // 保存游戏
            Player.save();
        } catch (e) {
            console.error('[大事件] 出错:', e);
            UI.showMessage('大事件出错：' + e.message);
        }
    },

    // 关闭大事件界面
    closeScheduledEvent() {
        this.state = 'map';
        this.currentScheduledEvent = null;
        UI.renderMapScreen();
    },
    
    // 关闭大事件结局界面
    closeBigEventEnding() {
        // 清除大事件状态
        BigEventSystem.currentEvent = null;
        BigEventSystem.currentPhase = null;
        BigEventSystem.choiceHistory = [];
        BigEventSystem.saveState();
        
        this.state = 'map';
        UI.renderMapScreen();
    },

    // 关闭事件界面
    closeEvent() {
        this.state = 'map';
        this.currentEvent = null;
        UI.renderMapScreen();
    },

    // 选择事件选项
    selectEventChoice(choiceIndex) {
        try {
            const event = this.currentEvent;
            if (!event) {
                return;
            }
    
            const result = EventSystem.selectChoice(event.id, choiceIndex);
            
            if (result.success) {
                // 如果触发战斗
                if (result.effects.startBattle) {
                    const enemy = DataManager.getEnemy(result.effects.startBattle);
                    if (enemy) {
                        this.startBattle(enemy);
                        return;
                    }
                }
                // 显示结果
                UI.showEventResult(result.text, result.effects);
                
                // v0.86.6: 学到新技能时显示明确提示
                if (result.effects.learnedSkill && result.effects.learnedSkill.name) {
                    setTimeout(() => {
                        UI.showMessage(`🎉 学会新技能：${result.effects.learnedSkill.name}！可在角色界面查看。`);
                    }, 500);
                }
                
                // 保存游戏
                Player.save();
                
                // 延迟后返回地图（学到技能时延长显示时间）
                const delay = result.effects.learnedSkill ? 3500 : 2000;
                setTimeout(() => {
                    this.state = 'map';
                    UI.renderMapScreen();
                }, delay);
            }
        } catch (e) {
            console.error('[事件] 选择选项出错:', e);
            UI.showMessage('事件处理出错：' + e.message);
            setTimeout(() => {
                this.state = 'map';
                UI.renderMapScreen();
            }, 2000);
        }
    },

    // ========== 商店界面 ==========
    openShop() {
        this.state = 'shop';
        UI.renderShopScreen();
    },

    // 购买物品
    buyItem(itemId, count = 1) {
        try {
            const result = ShopSystem.buyItem(itemId, count);
            if (result.success) {
                const item = Inventory.getItem(itemId);
                const isEquip = item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' || item.type === 'equipment');
                let msg = result.message;
                if (isEquip) {
                    msg += '\n装备已放入背包，可在背包中点击"装备"穿戴。';
                }
                UI.showMessage(msg);
            } else {
                UI.showMessage(result.message);
            }
            UI.updateShopScreen();
            Player.save();
        } catch (e) {
            console.error('购买物品出错:', e);
            UI.showMessage('购买失败：' + e.message);
        }
    },

    // 出售物品
    sellItem(itemId, count = 1) {
        const result = ShopSystem.sellItem(itemId, count);
        UI.showMessage(result.message);
        UI.updateShopScreen();
        Player.save();
    },

    // 关闭商店
    closeShop() {
        ShopSystem.closeShop();
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== NPC 对话 ==========
    showNPCList(npcs, unavailableNpcs = []) {
        // 参数校验
        if (!npcs) npcs = [];
        if (!Array.isArray(npcs)) npcs = [];
        
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
            
            if (canTalk) {
                return `
                    <div onclick="talkToNPC('${npc.id}')" style="
                        padding: 15px 20px;
                        background: rgba(40, 40, 80, 0.8);
                        border: 2px solid ${hasQuest ? '#ffcc00' : '#444477'};
                        border-radius: 10px;
                        color: #e0e0ff;
                        cursor: pointer;
                        text-align: left;
                        transition: all 0.3s;
                        font-size: 16px;
                        position: relative;
                    " onmouseover="this.style.borderColor='${hasQuest ? '#ffdd44' : '#7777bb'}'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='${hasQuest ? '#ffcc00' : '#444477'}'; this.style.background='rgba(40, 40, 80, 0.8)'">
                        <div style="font-weight: bold; font-size: 17px;">
                            ${npc.name}
                            ${hasQuest ? '<span style="color: #ffcc00; font-size: 20px; margin-left: 8px;">❗</span>' : ''}
                        </div>
                        <div style="font-size: 13px; color: #999; margin-top: 3px;">
                            ${npc.title || ''}
                            ${hasQuest ? '<span style="color: #ffcc00; margin-left: 8px;">有任务可接</span>' : ''}
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
    },

    // 开始对话
    startDialogue(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 检查是否可以对话
        if (!NPCStateSystem.canTalkTo(npcId)) {
            UI.showMessage(`${npc.name}不想和你说话。`);
            return;
        }

        // 开始对话
        const dialogueData = DialogueTree.startDialogue(npcId);
        if (!dialogueData) {
            UI.showMessage('对话失败。');
            return;
        }

        // v0.9.0: 首次对话奖励（鼓励玩家与NPC交流）
        const isFirstDialogue = !Player.exploredNPCs.includes(npcId);
        if (isFirstDialogue) {
            Player.exploredNPCs.push(npcId);
            Player.gainExp(20);
            // v0.9.4: 每日统计
            if (Player.dailyStats) Player.dailyStats.npcsTalked = (Player.dailyStats.npcsTalked || 0) + 1;
            Player.save();
            // 延迟显示奖励，避免和对话界面冲突
            setTimeout(() => {
                UI.showMessage(`💬 首次与 ${npc.name} 对话！\n经验 +20`);
            }, 500);
        }

        // v0.31.0: 任务进度更新
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateProgress('talk_any');
            QuestSystem.updateProgress('relationship');
        }

        // v0.19.1: 唐月秘密指导事件（影响力事件3）
        if (npcId === 'tang_yue' && !Player.changedStoryNodes.includes('tang_yue_guidance')) {
            const tangState = NPCStateSystem.getNPCState('tang_yue');
            if (tangState.trust >= 50 && Math.random() < 0.3) {
                this.triggerTangYueGuidance();
                return;
            }
        }

        // v0.19.1: 宇昂决斗替代方案（影响力事件2）
        if (npcId === 'mu_ningxue' && !Player.changedStoryNodes.includes('yu_ang_duel_alt')) {
            const hasDuelQuest = Player.activeQuests?.includes('quest_magic_duel');
            const muState = NPCStateSystem.getNPCState('mu_ningxue');
            if (hasDuelQuest && muState.trust >= 40) {
                this.triggerYuAngDuelAlternative();
                return;
            }
        }

        this.state = 'dialogue';
        this._currentDialogueNPC = npcId;
        this._showDialogueScreen(npc, dialogueData, isFirstDialogue);
    },

    // 显示对话界面
    _showDialogueScreen(npc, dialogueData, isFirstDialogue = false) {
        try {
        // v0.93.0: restore clicks, close messages, clear overlays first
        if (typeof UI !== 'undefined' && UI._restoreClicks) {
            UI._restoreClicks();
        }
        document.querySelectorAll('.msg-overlay, .msg-box, #message-blocker, .rest-overlay, .ei-overlay, .npc-dialog-overlay, .daily-overlay').forEach(el => el.remove());
        
        const npcState = NPCStateSystem.getNPCState(npc.id);
        const relationLevel = NPCStateSystem.getRelationshipLevel(npc.id);
        const dialogueTone = NPCStateSystem.getDialogueTone(npc.id);

        // v0.29.0: NPC等级反应 - 根据双方等级差生成开场白
        const npcLevel = NPCStateSystem.getNPCLevel(npc.id);
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
            justify-content: flex-end;
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

        dialog.innerHTML = `
            <div style="position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-end;">
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
            
            <!-- NPC 立绘区域 -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                    <div style="
                        width: 150px;
                        height: 150px;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 60px;
                        box-shadow: 0 0 50px ${npc.spriteColor || '#666666'}80;
                        overflow: hidden;
                        background: ${npc.spriteColor || '#666'};
                    ">
                        ${npc.image ? `<img src="${npc.image}" style="width: 100%; height: 100%; object-fit: cover;">` : (npc.elements?.[0] ? this._getElementEmoji(npc.elements[0]) : '👤')}
                    </div>
                    <div style="font-size: 24px; color: #fff; font-weight: bold;">${npc.name}</div>
                    <div style="font-size: 14px; color: #aaa; margin-top: 5px;">${npc.title || ''}</div>
                    <div style="font-size: 16px; color: ${relationLevel.color}; margin-top: 10px; font-weight: bold;">
                        ${relationLevel.name}
                    </div>
                    ${(() => {
                        // v0.18.0: 下一阶段提示
                        const score = npcState.opinion * 0.6 + npcState.trust * 0.3 + npcState.familiarity * 0.1;
                        const thresholds = [
                            { score: 5, name: '友善', hint: '多对话和送礼' },
                            { score: 15, name: '熟人', hint: '完成相关任务' },
                            { score: 30, name: '熟络', hint: '一起修炼/猎魔' },
                            { score: 45, name: '朋友', hint: '深入对话' },
                            { score: 60, name: '好友', hint: '约会邀请' },
                            { score: 75, name: '挚友', hint: '共同经历大事件' },
                            { score: 90, name: '知己', hint: '告白/特殊事件' }
                        ];
                        const next = thresholds.find(t => score < t.score);
                        if (next && score < 90) {
                            const need = Math.ceil(next.score - score);
                            return `<div style="font-size: 11px; color: #888; margin-top: 5px;">下一阶段：${next.name}（还需${need}分，${next.hint}）</div>`;
                        }
                        if (score >= 90 && !npcState.flags?.is_lover) {
                            return `<div style="font-size: 11px; color: #ff99cc; margin-top: 5px;">💖 关系已达顶峰，尝试告白吧！</div>`;
                        }
                        return '';
                    })()}
                    <div style="font-size: 12px; color: #888; margin-top: 3px;">
                        语气：${dialogueTone}
                    </div>
                    ${(() => {
                        // v0.27.0: NPC等级显示（自主成长）
                        const npcLevel = NPCStateSystem.getNPCLevel(npc.id);
                        const npcExp = npcState.exp || 0;
                        const expToNext = NPCStateSystem.getNPCExpToNextLevel(npc.id);
                        const expPercent = Math.min(100, Math.round((npcExp / expToNext) * 100));
                        return `
                            <div style="font-size: 12px; color: #aaddff; margin-top: 3px;">
                                ⚔️ 等级 Lv.${npcLevel} <span style="color: #666;">(${npcExp}/${expToNext} EXP)</span>
                            </div>
                            <div style="height: 2px; background: #333; border-radius: 1px; width: 120px; margin-top: 2px;">
                                <div style="height: 100%; width: ${expPercent}%; background: #4488ff; border-radius: 1px;"></div>
                            </div>
                        `;
                    })()}
                    ${(() => {
                        // v0.23.0: 综合连接评分（Connection Score）
                        const connScore = NPCStateSystem.computeConnectionScore(npc.id, 'player');
                        const connState = NPCStateSystem.getRelationshipState(npc.id, 'player');
                        const connColor = connScore >= 70 ? '#ffcc66' : connScore >= 50 ? '#99ccff' : connScore >= 30 ? '#aaffaa' : '#aaaaaa';
                        return `
                            <div style="margin-top: 10px; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 6px; display: inline-block;">
                                <div style="font-size: 11px; color: ${connColor}; font-weight: bold;">羁绊：${connState.label} (${connScore}/100)</div>
                                <div style="height: 3px; background: #333; border-radius: 2px; margin-top: 4px; width: 120px;">
                                    <div style="height: 100%; width: ${connScore}%; background: ${connColor}; border-radius: 2px;"></div>
                                </div>
                            </div>
                        `;
                    })()}
                    
                    <!-- 关系数值条 -->
                    <div style="margin-top: 15px; width: 200px; text-align: left;">
                        <!-- 好感度 -->
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 11px; color: #ff9999; margin-bottom: 3px;">
                                ❤️ 好感 ${Math.round(npcState.opinion)}
                            </div>
                            <div style="height: 4px; background: #333; border-radius: 2px;">
                                <div style="height: 100%; width: ${opinionPercent}%; background: linear-gradient(90deg, #ff6666, #ff9999); border-radius: 2px;"></div>
                            </div>
                        </div>
                        <!-- 信任度 -->
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 11px; color: #99ff99; margin-bottom: 3px;">
                                🤝 信任 ${Math.round(npcState.trust)}
                            </div>
                            <div style="height: 4px; background: #333; border-radius: 2px;">
                                <div style="height: 100%; width: ${trustPercent}%; background: linear-gradient(90deg, #66cc66, #99ff99); border-radius: 2px;"></div>
                            </div>
                        </div>
                        <!-- 熟悉度 -->
                        <div>
                            <div style="font-size: 11px; color: #9999ff; margin-bottom: 3px;">
                                👁️ 熟悉 ${Math.round(npcState.familiarity)}
                            </div>
                            <div style="height: 4px; background: #333; border-radius: 2px;">
                                <div style="height: 100%; width: ${familiarityPercent}%; background: linear-gradient(90deg, #6666cc, #9999ff); border-radius: 2px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 对话框 -->
            <div style="
                background: rgba(20, 20, 50, 0.95);
                border-top: 3px solid #6666aa;
                padding: 25px 30px;
                min-height: 200px;
            ">
                <!-- 对话文本 -->
                <div id="dialogue-text" style="
                    font-size: 17px;
                    color: #e0e0ff;
                    line-height: 1.8;
                    margin-bottom: 20px;
                    min-height: 60px;
                ">
                    ${levelReaction ? `<div style="color: #888; font-size: 14px; font-style: italic; margin-bottom: 10px; border-left: 3px solid #555; padding-left: 10px;">${levelReaction}</div>` : ''}
                    ${influenceReaction ? `<div style="color: #ffd93d; font-size: 14px; font-style: italic; margin-bottom: 10px; border-left: 3px solid #ffd93d; padding-left: 10px;">${influenceReaction}</div>` : ''}
                    ${npcMention ? `<div style="color: #88ccff; font-size: 14px; font-style: italic; margin-bottom: 10px; border-left: 3px solid #88ccff; padding-left: 10px;">${npcMention}</div>` : ''}
                    ${dialogueData.text}
                </div>

                <!-- 选项列表 -->
                <div id="dialogue-choices" style="display: flex; flex-direction: column; gap: 8px;">
                    ${dialogueData.choices.map((choice, index) => `
                        <div onclick="Game.selectDialogueChoice('${choice.id}')" style="
                            padding: 12px 20px;
                            background: rgba(40, 40, 80, 0.8);
                            border: 2px solid #444477;
                            border-radius: 8px;
                            color: #e0e0ff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 15px;
                        " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                            <span style="color: #ffd700; margin-right: 10px;">${index + 1}.</span>
                            ${choice.text}
                        </div>
                    `).join('')}
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
        } catch (e) {
            console.error('_showDialogueScreen error:', e);
            UI.showMessage('对话界面出错：' + e.message);
            this._closeDialogue();
        }
    },
    selectDialogueChoice(choiceId) {
        if (!this._currentDialogueNPC) return;

        const result = DialogueTree.selectChoice(choiceId);
        
        if (result.ended) {
            // 对话结束
            this._closeDialogue();
            return;
        }

        // 更新对话内容
        const npc = DataManager.getCharacter(this._currentDialogueNPC);
        this._updateDialogueScreen(npc, result);
    },

    // 更新对话界面
    _updateDialogueScreen(npc, dialogueData) {
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');

        if (textEl) {
            textEl.style.opacity = '0';
            setTimeout(() => {
                textEl.textContent = dialogueData.text;
                textEl.style.opacity = '1';
            }, 200);
        }

        if (choicesEl) {
            choicesEl.innerHTML = dialogueData.choices.map((choice, index) => `
                <div onclick="Game.selectDialogueChoice('${choice.id}')" style="
                    padding: 12px 20px;
                    background: rgba(40, 40, 80, 0.8);
                    border: 2px solid #444477;
                    border-radius: 8px;
                    color: #e0e0ff;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.3s;
                    font-size: 15px;
                " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                    <span style="color: #ffd700; margin-right: 10px;">${index + 1}.</span>
                    ${choice.text}
                </div>
            `).join('');
        }

        // 保存游戏
        Player.save();
    },

    // 关闭对话
    _closeDialogue() {
        const dialog = document.getElementById('dialogue-screen');
        if (dialog) {
            dialog.remove();
        }
        
        this._currentDialogueNPC = null;
        this.state = 'map';
        UI.renderMapScreen();
        Player.save();
    },

    // ========== v0.19.0 社交互动系统（重构自约会系统，移除恋爱导向） ==========

    // 社交互动地点配置
    SocialLocations: {
        library: { id: "library", name: "图书馆", icon: "📚", opinionGain: 3, trustGain: 2, eventChance: 0.3, timeCost: 2, staminaCost: 5, expGain: 10, description: "安静地一起看书学习" },
        xuefeng_hike: { id: "xuefeng_hike", name: "雪峰山修炼", icon: "🏔️", opinionGain: 4, trustGain: 3, eventChance: 0.4, timeCost: 3, staminaCost: 15, expGain: 15, description: "去雪峰山修炼，环境清幽适合冥想" },
        city_stroll: { id: "city_stroll", name: "博城市街", icon: "🚶", opinionGain: 2, trustGain: 2, eventChance: 0.4, timeCost: 2, staminaCost: 10, expGain: 5, description: "在街上走走，可能遇到有趣的事" },
        tower_train: { id: "tower_train", name: "三步塔修炼", icon: "🗼", opinionGain: 4, trustGain: 4, eventChance: 0.3, timeCost: 2, staminaCost: 20, expGain: 30, description: "一起修炼，同时获得经验" },
        training_ground: { id: "training_ground", name: "修炼场切磋", icon: "⚔️", opinionGain: 3, trustGain: 5, eventChance: 0.35, timeCost: 2, staminaCost: 15, expGain: 20, description: "在修炼场互相切磋，提升实战经验" }
    },

    // 显示社交互动邀请（地点选择）
    showSocialInvite(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 检查是否可以互动
        const npcState = NPCStateSystem.getNPCState(npcId);
        const score = npcState.opinion * 0.6 + npcState.trust * 0.3 + npcState.familiarity * 0.1;
        if (score < 45) {
            UI.showMessage(`与${npc.name}的关系还不够好，需要达到"朋友"才能邀请一起活动。`);
            return;
        }

        // NPC拒绝概率（好感度越低越可能拒绝）
        const rejectChance = score < 60 ? 0.2 : score < 75 ? 0.1 : 0.05;
        if (Math.random() < rejectChance) {
            UI.showMessage(`${npc.name}："抱歉，我今天还有事，改天吧。"`);
            NPCStateSystem.changeOpinion(npcId, -1, '拒绝活动邀请');
            return;
        }

        // 创建地点选择弹窗
        const overlay = document.createElement('div');
        overlay.id = 'social-invite-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;align-items:center;justify-content:center;';

        // 根据NPC人设筛选可用地点
        const npcPref = npc.socialPreferences || npc.datePreferences || {};
        let locations = Object.values(this.SocialLocations);
        // 穆宁雪等高冷NPC不喜欢逛街
        if (npcPref.disliked) {
            locations = locations.filter(l => !npcPref.disliked.includes(l.id));
        }

        overlay.innerHTML = `
            <div style="background:linear-gradient(135deg,#1a1a3a,#2a2a5a);border:2px solid #6666aa;border-radius:16px;padding:30px;max-width:600px;width:90%;">
                <div style="font-size:22px;color:#ccddff;font-weight:bold;margin-bottom:8px;text-align:center;">🤝 邀请 ${npc.name} 一起活动</div>
                <div style="font-size:13px;color:#aaa;margin-bottom:20px;text-align:center;">选择活动地点</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
                    ${locations.map(loc => {
                        const isLoved = npcPref.loved?.includes(loc.id);
                        const bonus = isLoved ? ' <span style="color:#99ccff;">⭐喜欢</span>' : '';
                        return `<div onclick="Game.executeSocial('${npcId}','${loc.id}')" style="
                            padding:15px;background:rgba(255,255,255,0.05);border:1px solid #555588;border-radius:10px;cursor:pointer;transition:all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                            <div style="font-size:18px;margin-bottom:5px;">${loc.icon} ${loc.name}${bonus}</div>
                            <div style="font-size:11px;color:#aaa;margin-bottom:8px;">${loc.description}</div>
                            <div style="font-size:11px;color:#99ccff;">💕+${loc.opinionGain} 🤝+${loc.trustGain} ⏰${loc.timeCost}h ⚡${loc.staminaCost}</div>
                        </div>`;
                    }).join('')}
                </div>
                <div style="text-align:center;margin-top:20px;">
                    <div onclick="document.getElementById('social-invite-overlay').remove()" style="display:inline-block;padding:8px 24px;background:rgba(100,100,100,0.5);border:1px solid #888;border-radius:8px;color:#ccc;cursor:pointer;font-size:14px;">取消</div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // 执行社交互动
    executeSocial(npcId, locationId) {
        const npc = DataManager.getCharacter(npcId);
        const loc = this.SocialLocations[locationId];
        if (!npc || !loc) return;

        // 移除弹窗
        const overlay = document.getElementById('social-invite-overlay');
        if (overlay) overlay.remove();

        // 关闭对话界面
        this._closeDialogue();

        // 检查体力
        if (Player.stamina < loc.staminaCost) {
            UI.showMessage('体力不足，无法进行活动！');
            return;
        }

        // 计算NPC偏好加成
        const npcPref = npc.socialPreferences || npc.datePreferences || {};
        let opinionMult = 1;
        if (npcPref.loved?.includes(locationId)) opinionMult = 1.5;

        const opinionGain = Math.round(loc.opinionGain * opinionMult);
        const trustGain = loc.trustGain;

        // 应用效果
        NPCStateSystem.changeOpinion(npcId, opinionGain, `活动：${loc.name}`);
        NPCStateSystem.changeTrust(npcId, trustGain, `活动：${loc.name}`);
        Player.stamina = Math.max(0, Player.stamina - loc.staminaCost);
        Player.gainExp(loc.expGain || 0);
        TimeSystem.advanceTime(loc.timeCost);

        // 社交事件（非恋爱导向）
        let eventText = '';
        if (Math.random() < loc.eventChance) {
            const events = [
                { text: `你和${npc.name}讨论了修炼心得，都有所收获。`, extraOpinion: 2, extraExp: 10 },
                { text: `你们发现了一家卖魔法材料的小店，${npc.name}挑了几样好东西。`, extraOpinion: 1 },
                { text: `突然下起了小雨，你们一起躲雨，聊了很多平时不会说的话。`, extraTrust: 3 },
                { text: `${npc.name}分享了一个修炼技巧，你受益匪浅。`, extraTrust: 3, extraExp: 15 },
            ];
            if (locationId === 'xuefeng_hike') {
                events.push({ text: `雪峰山的灵气很足，${npc.name}的修炼有了新的感悟。`, extraOpinion: 3, extraExp: 20 });
            }
            if (locationId === 'training_ground') {
                events.push({ text: `切磋中你发现了${npc.name}的一个习惯，对战斗很有启发。`, extraTrust: 4, extraExp: 25 });
            }
            const event = events[Math.floor(Math.random() * events.length)];
            eventText = event.text;
            if (event.extraOpinion) NPCStateSystem.changeOpinion(npcId, event.extraOpinion, '活动事件');
            if (event.extraTrust) NPCStateSystem.changeTrust(npcId, event.extraTrust, '活动事件');
            if (event.extraExp) Player.gainExp(event.extraExp);
        }

        // 显示结果
        const resultMsg = `🤝 与${npc.name}在${loc.name}活动\n好感 +${opinionGain}，信任 +${trustGain}，经验 +${loc.expGain || 0}\n${eventText ? '\n' + eventText : ''}`;
        UI.showMessage(resultMsg);

        Player.save();
    },

    // ========== v0.19.0 玩家影响力系统 ==========

    // 记录改变的剧情节点并获得影响力
    recordStoryChange(nodeId, influenceGain = 10) {
        if (!Player.changedStoryNodes.includes(nodeId)) {
            Player.changedStoryNodes.push(nodeId);
            Player.gainInfluence(influenceGain, '剧情改变');
            UI.showMessage(`🌟 剧情改变！影响力 +${influenceGain}\n已改变剧情节点：${Player.changedStoryNodes.length}个`);
        }
    },

    // 地圣泉机缘竞争（第一个可改变剧情节点）
    triggerEarthSpringInfluence() {
        const overlay = document.createElement('div');
        overlay.id = 'influence-event-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center;';

        overlay.innerHTML = `
            <div style="background:linear-gradient(135deg,#1a2a3a,#2a4a5a);border:2px solid #4488aa;border-radius:16px;padding:35px;max-width:650px;width:90%;">
                <div style="font-size:20px;color:#ffdd66;font-weight:bold;margin-bottom:15px;text-align:center;">🌟 机缘浮现：地圣泉内泉</div>
                <div style="font-size:14px;color:#ddeeff;line-height:1.8;margin-bottom:20px;">
                    你持着地圣泉通行证来到入口，却遇到了唐月老师。她神色复杂地看着你：<br><br>
                    "你来了。其实...地圣泉还有一处内泉，灵气浓度是外泉的三倍。原本这个名额是留给莫凡的，他的小泥鳅坠需要内泉的灵气来进阶。"<br><br>
                    唐月顿了顿："但你这段时间的表现很出色，我也看在眼里。如果你愿意，我可以把这个名额给你。不过——莫凡可能会因此错过这次进阶的机会，他的成长路线会完全不同。"<br><br>
                    <span style="color:#ffaa66;">这是一个改变剧情的选择。你的决定将影响莫凡的命运和后续故事走向。</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div onclick="Game.chooseEarthSpringPlayer()" style="
                        padding:15px 20px;background:rgba(60,100,80,0.6);border:2px solid #55aa77;border-radius:10px;color:#aaffcc;cursor:pointer;font-size:15px;
                    " onmouseover="this.style.background='rgba(80,130,100,0.8)'" onmouseout="this.style.background='rgba(60,100,80,0.6)'">
                        <strong>争夺内泉名额</strong>（你获得内泉修炼机会，莫凡错失机缘）<br>
                        <span style="font-size:12px;color:#88ccaa;">效果：地圣泉修炼经验×3，影响力+15，莫凡成长路线改变</span>
                    </div>
                    <div onclick="Game.chooseEarthSpringMoFan()" style="
                        padding:15px 20px;background:rgba(80,60,60,0.6);border:2px solid #aa7755;border-radius:10px;color:#ffccaa;cursor:pointer;font-size:15px;
                    " onmouseover="this.style.background='rgba(110,80,80,0.8)'" onmouseout="this.style.background='rgba(80,60,60,0.6)'">
                        <strong>让给莫凡</strong>（莫凡获得内泉，按原著发展）<br>
                        <span style="font-size:12px;color:#ccaa88;">效果：莫凡好感+10，唐月信任+5，按原著剧情推进</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // 玩家选择争夺地圣泉内泉
    chooseEarthSpringPlayer() {
        const overlay = document.getElementById('influence-event-overlay');
        if (overlay) overlay.remove();

        // 记录剧情改变
        this.recordStoryChange('earth_spring_opportunity', 15);

        // 设置标记：地圣泉修炼经验×3
        Player.flags = Player.flags || {};
        Player.flags.earth_spring_inner = true;

        // 莫凡好感下降（错失机缘）
        NPCStateSystem.changeOpinion('mo_fan', -15, '玩家夺走地圣泉内泉名额');
        NPCStateSystem.changeTrust('mo_fan', -10, '玩家夺走地圣泉内泉名额');

        UI.showMessage(`🌟 你选择了争夺内泉名额！\n\n唐月："好吧，既然你这么有决心，内泉就交给你了。莫凡那边...我会再想办法。"\n\n地圣泉修炼经验×3 已激活！\n莫凡对你的态度发生了变化...`);

        Player.save();
        UI.renderMapScreen();
    },

    // 玩家选择让给莫凡
    chooseEarthSpringMoFan() {
        const overlay = document.getElementById('influence-event-overlay');
        if (overlay) overlay.remove();

        // 莫凡好感上升
        NPCStateSystem.changeOpinion('mo_fan', 10, '玩家让出地圣泉内泉名额');
        NPCStateSystem.changeTrust('tang_yue', 5, '玩家展现气度');

        UI.showMessage(`你选择了让给莫凡。\n\n唐月欣慰地笑了："你有这份心，很好。莫凡会记得你的。"\n\n莫凡好感+10，唐月信任+5\n剧情按原著方向推进。`);

        Player.save();
        UI.renderMapScreen();
    },

    // 影响力事件3：唐月的秘密指导
    triggerTangYueGuidance() {
        const overlay = document.createElement('div');
        overlay.id = 'influence-event-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center;';

        overlay.innerHTML = `
            <div style="background:linear-gradient(135deg,#2a1a3a,#4a2a5a);border:2px solid #aa66cc;border-radius:16px;padding:35px;max-width:650px;width:90%;">
                <div style="font-size:20px;color:#ffdd66;font-weight:bold;margin-bottom:15px;text-align:center;">🌟 机缘浮现：唐月的秘密指导</div>
                <div style="font-size:14px;color:#ddeeff;line-height:1.8;margin-bottom:20px;">
                    唐月看了看四周，确认没人后，低声对你说：<br><br>
                    "你这段时间的进步我都看在眼里。其实...我一直在偷偷给莫凡开小灶，他的基础比别人扎实很多。"<br><br>
                    唐月犹豫了一下："如果你愿意，我也可以单独指导你。不过这样一来，我分给莫凡的精力就少了，他可能会因此落后一些。你怎么看？"<br><br>
                    <span style="color:#ffaa66;">这是一个改变剧情的选择。</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div onclick="Game.acceptTangYueGuidance()" style="
                        padding:15px 20px;background:rgba(60,100,80,0.6);border:2px solid #55aa77;border-radius:10px;color:#aaffcc;cursor:pointer;font-size:15px;
                    " onmouseover="this.style.background='rgba(80,130,100,0.8)'" onmouseout="this.style.background='rgba(60,100,80,0.6)'">
                        <strong>接受唐月的指导</strong>（获得技能点+属性，莫凡少一次机缘）<br>
                        <span style="font-size:12px;color:#88ccaa;">效果：技能点+1，随机属性+5，影响力+10，莫凡好感-5</span>
                    </div>
                    <div onclick="Game.declineTangYueGuidance()" style="
                        padding:15px 20px;background:rgba(80,60,60,0.6);border:2px solid #aa7755;border-radius:10px;color:#ffccaa;cursor:pointer;font-size:15px;
                    " onmouseover="this.style.background='rgba(110,80,80,0.8)'" onmouseout="this.style.background='rgba(80,60,60,0.6)'">
                        <strong>婉拒，让唐月继续指导莫凡</strong>（莫凡按原著成长）<br>
                        <span style="font-size:12px;color:#ccaa88;">效果：唐月信任+10，莫凡好感+5</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    acceptTangYueGuidance() {
        const overlay = document.getElementById('influence-event-overlay');
        if (overlay) overlay.remove();

        this.recordStoryChange('tang_yue_guidance', 10);

        // 获得技能点和随机属性
        Player.skillPoints = (Player.skillPoints || 0) + 1;
        const stats = ['maxHp', 'maxMp', 'attack', 'defense', 'speed'];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        const statNames = { maxHp: '生命', maxMp: '魔法', attack: '攻击', defense: '防御', speed: '速度' };
        Player[randomStat] += 5;
        if (randomStat === 'maxHp') Player.hp += 5;
        if (randomStat === 'maxMp') Player.mp += 5;

        NPCStateSystem.changeOpinion('mo_fan', -5, '唐月转而指导玩家');

        UI.showMessage(`🌟 你接受了唐月的秘密指导！\n\n唐月："好，从今天起，我每周抽时间单独指导你。别告诉别人。"\n\n技能点+1，${statNames[randomStat]}+5\n莫凡对你的态度微妙地变化了...`);

        Player.save();
        UI.renderMapScreen();
    },

    declineTangYueGuidance() {
        const overlay = document.getElementById('influence-event-overlay');
        if (overlay) overlay.remove();

        NPCStateSystem.changeTrust('tang_yue', 10, '玩家婉拒指导，展现气度');
        NPCStateSystem.changeOpinion('mo_fan', 5, '玩家让出指导机会');

        UI.showMessage(`你婉拒了唐月。\n\n唐月欣慰地笑了："你能为别人着想，很难得。莫凡有你这样的同学，是他的运气。"\n\n唐月信任+10，莫凡好感+5\n剧情按原著方向推进。`);

        Player.save();
        UI.renderMapScreen();
    },

    // 影响力事件2：宇昂决斗替代方案
    triggerYuAngDuelAlternative() {
        const overlay = document.createElement('div');
        overlay.id = 'influence-event-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center;';

        overlay.innerHTML = `
            <div style="background:linear-gradient(135deg,#1a2a4a,#2a3a6a);border:2px solid #5588cc;border-radius:16px;padding:35px;max-width:650px;width:90%;">
                <div style="font-size:20px;color:#ffdd66;font-weight:bold;margin-bottom:15px;text-align:center;">🌟 机缘浮现：决斗的另一种可能</div>
                <div style="font-size:14px;color:#ddeeff;line-height:1.8;margin-bottom:20px;">
                    穆宁雪看了看你，难得地主动开口：<br><br>
                    "我听说了，父亲安排你和宇昂决斗。宇昂那个人...心胸狭窄，决斗中什么事都可能发生。"<br><br>
                    她顿了顿："如果你愿意，我可以去跟父亲说，把死斗改成三项考核。虽然还是要赢，但至少不用以命相搏。不过...这样宇昂会觉得我在帮你，他可能会记恨你。你怎么选？"<br><br>
                    <span style="color:#ffaa66;">这是一个改变剧情的选择。宇昂的命运将因此不同。</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div onclick="Game.chooseDuelMediation()" style="
                        padding:15px 20px;background:rgba(60,100,80,0.6);border:2px solid #55aa77;border-radius:10px;color:#aaffcc;cursor:pointer;font-size:15px;
                    " onmouseover="this.style.background='rgba(80,130,100,0.8)'" onmouseout="this.style.background='rgba(60,100,80,0.6)'">
                        <strong>请穆宁雪调解，改为考核制</strong>（避免死斗，宇昂存活）<br>
                        <span style="font-size:12px;color:#88ccaa;">效果：决斗改为3场考核，宇昂好感-20，穆宁雪信任+10，影响力+12</span>
                    </div>
                    <div onclick="Game.chooseDuelOriginal()" style="
                        padding:15px 20px;background:rgba(80,60,60,0.6);border:2px solid #aa7755;border-radius:10px;color:#ffccaa;cursor:pointer;font-size:15px;
                    " onmouseover="this.style.background='rgba(110,80,80,0.8)'" onmouseout="this.style.background='rgba(80,60,60,0.6)'">
                        <strong>按原计划死斗</strong>（击败宇昂，按原著发展）<br>
                        <span style="font-size:12px;color:#ccaa88;">效果：穆宁雪好感+5，按原著剧情推进</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    chooseDuelMediation() {
        const overlay = document.getElementById('influence-event-overlay');
        if (overlay) overlay.remove();

        this.recordStoryChange('yu_ang_duel_alt', 12);

        // 修改任务：将击败宇昂改为通过考核
        Player.flags = Player.flags || {};
        Player.flags.duel_mediated = true;

        NPCStateSystem.changeTrust('mu_ningxue', 10, '穆宁雪帮玩家调解决斗');
        NPCStateSystem.changeOpinion('yu_ang', -20, '穆宁雪帮玩家改决斗规则');

        UI.showMessage(`🌟 穆宁雪去跟穆卓云说了情。\n\n穆卓云虽然不满，但碍于女儿的面子，最终同意将死斗改为三项考核：魔法控制力、实战能力、心理素质。\n\n宇昂得知后脸色铁青，但也不敢反对穆卓云的决定。\n\n穆宁雪信任+10，宇昂好感-20\n决斗规则已改变！`);

        Player.save();
        UI.renderMapScreen();
    },

    chooseDuelOriginal() {
        const overlay = document.getElementById('influence-event-overlay');
        if (overlay) overlay.remove();

        NPCStateSystem.changeOpinion('mu_ningxue', 5, '玩家坚持原计划');

        UI.showMessage(`你谢绝了穆宁雪的好意。\n\n穆宁雪："...随你吧。不过你要小心，宇昂不会手下留情。"\n\n穆宁雪好感+5\n剧情按原著方向推进。`);

        Player.save();
        UI.renderMapScreen();
    },

    // 获取元素 emoji
    _getElementEmoji(element) {
        const emojis = {
            fire: '🔥',
            ice: '❄️',
            thunder: '⚡',
            earth: '🪨',
            wind: '💨',
            water: '💧',
            light: '✨',
            dark: '🌑'
        };
        return emojis[element] || '👤';
    },

    // 接受任务
    acceptQuest(questId) {
        const result = QuestSystem.acceptQuest(questId);
        if (result.success) {
            UI.showMessage(`接取任务：${result.quest.name}`);
            Player.save();
        } else {
            UI.showMessage(result.message);
        }
    },

    // ========== 背包界面 ==========
    openInventory() {
        this.state = 'inventory';
        UI.renderInventoryScreen();
    },

    // 使用物品
    useItem(itemId) {
        try {
            const result = Inventory.useItem(itemId, false);
            if (result.success) {
                DailySystem.trackActivity('use_item', 1);
            }
            UI.showMessage(result.message);
            UI.updateInventoryScreen();
            Player.save();
        } catch (e) {
            console.error('使用物品出错:', e);
            UI.showMessage('使用失败：' + e.message);
        }
    },

    // 装备物品
    equipItem(itemId) {
        const result = Inventory.equipItem(itemId);
        UI.showMessage(result.message);
        UI.updateInventoryScreen();
        Player.save();
    },

    // 卸下装备
    unequipItem(slot) {
        const result = Inventory.unequipItem(slot);
        UI.showMessage(result.message);
        UI.updateInventoryScreen();
        Player.save();
    },

    // 显示装备强化界面
    showEnhancePanel() {
        UI.showEnhancePanel();
    },

    // 强化装备
    enhanceEquipment(slot, materialId = null) {
        const result = Player.enhanceEquipment(slot, materialId);
        UI.showMessage(result.message);
        UI.showEnhancePanel();
        Player.save();
    },

    // v0.77.0: 装备强化继承
    inheritEnhance(slot, targetItemId) {
        const result = Player.inheritEnhance(slot, targetItemId);
        UI.showMessage(result.message);
        if (result.success) {
            UI.updateInventoryScreen();
        }
        Player.save();
    },

    // 显示装备继承界面
    showInheritPanel(slot) {
        UI.showInheritPanel(slot);
    },

    // 关闭背包
    closeInventory() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 任务界面 ==========
    openQuestLog() {
        this.state = 'quest';
        UI.renderQuestScreen();
    },

    closeQuestLog() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 情报界面 ==========
    openIntelPanel() {
        this.state = 'intel';
        UI.renderIntelScreen();
    },

    closeIntelPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 声望界面 ==========
    openReputationPanel() {
        this.state = 'reputation';
        UI.renderReputationScreen();
    },

    closeReputationPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 帮助界面 ==========
    openHelpPanel() {
        this.state = 'help';
        UI.renderHelpScreen();
    },

    closeHelpPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 妖魔图鉴 ==========
    openBestiary() {
        this.state = 'bestiary';
        UI.renderBestiary();
    },

    closeBestiary() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 日常系统 ==========
    openDaily() {
        this.state = 'daily';
        UI.renderDaily();
    },

    closeDaily() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    doSignIn() {
        const result = DailySystem.signIn();
        UI.showMessage(result.message + (result.extraMsg || '') + '\n' + result.rewards.join('\n'));
        UI.renderDaily();
    },

    claimDailyReward(questId) {
        const result = DailySystem.claimDailyReward(questId);
        if (result.success) {
            UI.showMessage(result.message + '\n' + result.rewards.join('\n'));
        } else {
            UI.showMessage(result.message);
        }
        UI.renderDaily();
    },

    // ========== 角色/属性界面 ==========
    openCharacterPanel() {
        this.state = 'character';
        UI.renderCharacterScreen();
    },

    // 分配属性点
    addAttribute(attr) {
        const result = Player.addAttribute(attr);
        if (result) {
            UI.updateCharacterScreen();
            Player.save();
        }
    },

    closeCharacterPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 召唤兽进化 ==========
    evolveSummon() {
        const result = Player.evolveSummonBeast();
        if (result.success) {
            UI.showMessage(`${result.oldIcon} ${result.oldName} 进化！\n\n${result.newIcon} ${result.newName}\n\n${result.description}`, '✨ 召唤兽进化 ✨');
            UI.renderCharacterScreen();
            UI.saveGame();
        } else {
            UI.showMessage(result.message);
        }
    },

    // ========== 元素觉醒 ==========
    switchSummon(index) {
        const result = Player.switchActiveSummon(index);
        if (result.success) {
            UI.showMessage(result.message);
            UI.renderCharacterScreen();
            UI.saveGame();
        } else {
            UI.showMessage(result.message);
        }
    },

    seekNewSummon() {
        Player.migrateSummonData();
        const maxCount = Player.getMaxSummonCount();
        if (Player.summonBeasts.length >= maxCount) {
            UI.showMessage('你的召唤兽数量已达上限！');
            return;
        }
        // 随机一只新的召唤兽（排除已有的）
        const existingIds = Player.summonBeasts.map(b => b.baseId || b.id);
        const availableBeasts = Object.values(DataSummonBeasts).filter(b => !existingIds.includes(b.id));
        if (availableBeasts.length === 0) {
            UI.showMessage('没有可契约的新召唤兽了！');
            return;
        }
        // 按稀有度加权随机
        const weights = { '普通': 30, '稀有': 15, '史诗': 5 };
        let totalWeight = 0;
        const weighted = availableBeasts.map(b => {
            const w = weights[b.rarity] || 10;
            totalWeight += w;
            return { beast: b, weight: w };
        });
        let rand = Math.random() * totalWeight;
        let chosen = weighted[0].beast;
        for (const item of weighted) {
            rand -= item.weight;
            if (rand <= 0) { chosen = item.beast; break; }
        }
        const result = Player.contractSummonBeast(chosen);
        if (result.success) {
            UI.showMessage(`${result.message}\n\n${chosen.description || ''}`, '🔮 新的契约！');
            UI.renderCharacterScreen();
            UI.saveGame();
        } else {
            UI.showMessage(result.message);
        }
    },

    showAwakenPanel() {
        if (!Player.canAwakenNewElement()) {
            UI.showMessage('你还未达到觉醒条件！');
            return;
        }

        const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'summon'];
        const availableElements = allElements.filter(e => !Player.elements.includes(e));
        const currentCount = Player.elements.length;
        const requiredLevel = currentCount === 1 ? 8 : 15;
        const rankName = requiredLevel >= 15 ? '高阶' : '中阶';

        // 元素权重
        const elementWeights = {
            fire: 15, ice: 12, thunder: 10, earth: 15, wind: 15, water: 15,
            light: 8, dark: 5, heal: 3, summon: 5
        };

        // 随机3个候选
        function rollThree() {
            const avail = [...availableElements];
            const result = [];
            while (result.length < 3 && avail.length > 0) {
                const totalW = avail.reduce((s, e) => s + (elementWeights[e] || 10), 0);
                let rand = Math.random() * totalW;
                for (let i = 0; i < avail.length; i++) {
                    rand -= (elementWeights[avail[i]] || 10);
                    if (rand <= 0) {
                        result.push(avail[i]);
                        avail.splice(i, 1);
                        break;
                    }
                }
            }
            return result;
        }

        let candidates = rollThree();
        let rerolls = 0;
        const maxRerolls = 2;

        function renderCandidates(cands) {
            const list = cands || candidates;
            return list.map(elem => {
                const color = SkillSystem.getElementColor(elem);
                const name = SkillSystem.getElementName(elem);
                const desc = Game.getElementDescription(elem);
                return `
                    <div onclick="Game.confirmAwaken('${elem}')" style="
                        padding: 20px;
                        background: ${color}15;
                        border: 2px solid ${color};
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        margin-bottom: 12px;
                        flex: 1;
                        min-width: 150px;
                    " onmouseover="this.style.background='${color}33'; this.style.transform='translateY(-3px)'" onmouseout="this.style.background='${color}15'; this.style.transform='translateY(0)'">
                        <div style="font-size: 20px; font-weight: bold; color: ${color}; margin-bottom: 8px;">
                            ${name}
                        </div>
                        <div style="color: #ccc; font-size: 13px; line-height: 1.5;">
                            ${desc}
                        </div>
                    </div>
                `;
            }).join('');
        }

        UI.elements.gameContainer.innerHTML = `
            <div style="max-width: 700px; margin: 0 auto; padding: 30px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 32px; font-weight: bold; color: #ffd700; margin-bottom: 10px;">
                        ✨ 元素觉醒
                    </div>
                    <div style="color: #aaa; font-size: 16px;">
                        你已达到${rankName}境界，觉醒石感应到新的元素共鸣
                    </div>
                    <div style="color: #888; font-size: 14px; margin-top: 8px;">
                        当前已觉醒: ${Player.elements.map(e => SkillSystem.getElementName(e)).join('、')}
                    </div>
                </div>
                <div style="text-align: center; color: #ffd700; margin-bottom: 15px; font-size: 16px;">
                    🌟 感知到3种元素与你共鸣，选择其一：
                </div>
                <div id="awaken-candidates" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                    ${renderCandidates()}
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div onclick="Game.rerollAwaken()" id="awaken-reroll" style="
                        display: inline-block;
                        padding: 10px 25px;
                        background: rgba(100, 80, 150, 0.3);
                        border: 1px solid #8866bb;
                        border-radius: 8px;
                        color: #bb99dd;
                        cursor: pointer;
                        font-size: 14px;
                    " onmouseover="this.style.background='rgba(100,80,150,0.5)'" onmouseout="this.style.background='rgba(100,80,150,0.3)'">
                        🔄 重新感知（剩余${maxRerolls - rerolls}次）
                    </div>
                </div>
                <div onclick="Game.openCharacterPanel()" style="
                    text-align: center;
                    padding: 12px;
                    background: rgba(100, 100, 100, 0.3);
                    border-radius: 8px;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 16px;
                ">稍后再说</div>
            </div>
        `;

        // 存储到Game对象供reroll使用
        this._awakenState = { candidates, rerolls, maxRerolls, rollThree, renderCandidates, availableElements, elementWeights };
    },

    rerollAwaken() {
        const state = this._awakenState;
        if (!state || state.rerolls >= state.maxRerolls) return;
        state.rerolls++;
        state.candidates = state.rollThree();
        const container = document.getElementById('awaken-candidates');
        if (container) container.innerHTML = state.renderCandidates(state.candidates);
        const btn = document.getElementById('awaken-reroll');
        if (btn) {
            const remaining = state.maxRerolls - state.rerolls;
            if (remaining <= 0) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
                btn.innerHTML = '🔄 重新感知（已用完）';
            } else {
                btn.innerHTML = `🔄 重新感知（剩余${remaining}次）`;
            }
        }
    },

    confirmAwaken(element) {
        this.awakenElement(element);
    },

    // 随机觉醒
    randomAwaken() {
        const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'summon'];
        const availableElements = allElements.filter(e => !Player.elements.includes(e));
        if (availableElements.length === 0) {
            UI.showMessage('没有可觉醒的系了！');
            return;
        }
        const randomElement = availableElements[Math.floor(Math.random() * availableElements.length)];
        const elementName = SkillSystem.getElementName(randomElement);
        UI.showMessage(`命运的齿轮转动...你觉醒了 ${elementName}！`);
        setTimeout(() => {
            this.awakenElement(randomElement);
        }, 800);
    },

    getElementDescription(element) {
        const descs = {
            fire: '高爆发伤害，燃烧持续伤害，克制冰/风/植物系',
            ice: '冻结控制，防御加成，克制水/风系',
            thunder: '高暴击麻痹，感电组合反应，克制水/土系',
            earth: '护盾防御，减速控制，克制雷/火系',
            wind: '高速闪避，连击输出，克制土/雷系',
            water: '治疗恢复，湿润控制，克制火/土系',
            light: '净化增益，圣光裁决，克制暗影系',
            dark: '诅咒削弱，潜行爆发，克制光系',
            heal: '强力治疗，净化复苏，生存能力极强',
            summon: '召唤召唤兽协同作战，以多打少，战术灵活'
        };
        return descs[element] || '神秘的元素力量';
    },

    awakenElement(element) {
        const result = Player.awakenElement(element);
        if (!result.success) {
            UI.showMessage(result.message);
            return;
        }

        // 弹出天赋选择面板
        if (typeof TalentSystem !== 'undefined') {
            this.showTalentSelection(element);
            return; // 天赋选择后再保存和刷新
        }

        Player.save();

        let msg = result.message;
        if (result.unlockedSkills && result.unlockedSkills.length > 0) {
            const skillNames = result.unlockedSkills.map(id => SkillSystem.getSkill(id)?.name || id).join('、');
            msg += ` 解锁技能: ${skillNames}`;
        }

        UI.showMessage(msg);
        this.openCharacterPanel();
    },

    // ========== 自身天赋选择 ==========
    showInnateTalentSelection() {
        InnateTalentSystem.init();
        const choices = InnateTalentSystem.rollTalents(3);

        let choicesHtml = choices.map((talentId, idx) => {
            const talent = InnateTalentSystem.getTalent(talentId);
            if (!talent) return '';
            const rarity = InnateTalentSystem.getRarityConfig(talent.rarity);

            return `
                <div onclick="Game.confirmInnateTalent('${talentId}')" style="
                    padding: 18px;
                    background: ${rarity.color}15;
                    border: 2px solid ${rarity.color};
                    border-radius: 12px;
                    cursor: pointer;
                    margin-bottom: 12px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='${rarity.color}30'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='${rarity.color}15'; this.style.transform='scale(1)'">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 28px; margin-right: 10px;">${talent.icon}</span>
                        <div>
                            <div style="font-size: 20px; font-weight: bold; color: ${rarity.color};">
                                ${talent.name}
                            </div>
                            <div style="font-size: 12px; color: ${rarity.color};">【${rarity.name}】</div>
                        </div>
                    </div>
                    <div style="font-size: 14px; color: #ccc; margin-bottom: 6px;">${talent.description}</div>
                    <div style="font-size: 13px; color: #66ff99; font-weight: bold;">效果：${talent.effectDesc}</div>
                </div>
            `;
        }).join('');

        UI.elements.gameContainer.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 30px; font-weight: bold; color: #ffd700; margin-bottom: 10px;">
                        ✦ 天生天赋 ✦
                    </div>
                    <div style="color: #aaa; font-size: 15px; line-height: 1.6;">
                        每个人在觉醒时都可能获得独特的天生天赋<br>
                        <span style="color: #ff88ff;">这是决定你法师之路的重要选择</span>
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    ${choicesHtml}
                </div>
                <div style="text-align: center; color: #666; font-size: 12px;">
                    请选择一个天赋（无法更改）
                </div>
            </div>
        `;
    },

    confirmInnateTalent(talentId) {
        const talent = InnateTalentSystem.getTalent(talentId);
        if (!talent) return;

        InnateTalentSystem.setInnateTalent(talentId);

        let msg = `你获得了天生天赋：${talent.name}！\n${talent.effectDesc}`;

        // 如果额外觉醒了一系，提示
        if (Player.innateEffects && Player.innateEffects.extraElement) {
            const extraName = SkillSystem.getElementName(Player.innateEffects.extraElement);
            msg += `\n\n你天生就觉醒了第二系：${extraName}！`;
        }

        UI.showMessage(msg);

        // v0.93.0: 直接进入系天赋选择（showTalentSelection会关闭消息弹窗并清空gameContainer）
        if (Player.innateEffects && Player.innateEffects.extraElement) {
            this._pendingElements = [this._pendingElement, Player.innateEffects.extraElement];
            this._currentTalentElementIndex = 0;
            this.showTalentSelection(this._pendingElements[0]);
        } else {
            this.showTalentSelection(this._pendingElement);
        }
    },

    // 显示天赋选择面板
    showTalentSelection(element) {
        // v0.93.0: 关闭消息弹窗、清空gameContainer、移除旧弹窗，防止层级遮挡
        if (typeof UI !== 'undefined' && UI.closeAllMessages) UI.closeAllMessages();
        document.querySelectorAll('.msg-overlay, .msg-box, #message-blocker').forEach(el => el.remove());
        document.getElementById('talent-selection-dialog')?.remove();
        document.getElementById('talent-selection-overlay')?.remove();
        UI.elements.gameContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-size:18px;">Loading...</div>';

        const choices = TalentSystem.getTalentChoices(element);
        if (choices.length === 0) {
            Player.save();
            UI.showMessage('觉醒成功！');
            this.openCharacterPanel();
            return;
        }

        const elementName = SkillSystem.getElementName(element);
        const elementColor = SkillSystem.getElementColor(element);

        let choicesHtml = choices.map((talentId, idx) => {
            const talent = TalentSystem.getTalent(talentId);
            if (!talent) return '';
            const rarityConfig = TalentSystem.getRarityConfig(talent.rarity);
            const typeName = talent.type === 'innate' ? '【先天·出生即终极】' : '【成长·可进化】';

            // 构建进化路线预览
            let evolutionPreview = '';
            if (talent.evolutions && talent.evolutions.length > 0) {
                const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };
                evolutionPreview = '<div style="margin-top:8px;font-size:11px;color:#888;">';
                if (talent.type === 'innate') {
                    const evo = talent.evolutions[0];
                    evolutionPreview += `<div style="color:${stageColors['终极']||'#ff66ff'};margin-bottom:2px;">★ ${evo.name}：${evo.description}</div>`;
                } else {
                    evolutionPreview += '<div style="color:#666;margin-bottom:3px;">进化路线：</div>';
                    for (const evo of talent.evolutions) {
                        const color = stageColors[evo.stage] || '#aaa';
                        evolutionPreview += `<div style="color:${color};margin-bottom:2px;">&nbsp;Lv${evo.level}【${evo.stage}】${evo.name}：<span style="color:#999;font-size:10px;">${evo.description}</span></div>`;
                    }
                }
                evolutionPreview += '</div>';
            }

            return `
                <div onclick="Game.confirmTalent('${element}', '${talentId}')" style="
                    padding: 15px;
                    background: ${rarityConfig.color}15;
                    border: 2px solid ${rarityConfig.color};
                    border-radius: 10px;
                    cursor: pointer;
                    margin-bottom: 10px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='${rarityConfig.color}30'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='${rarityConfig.color}15'; this.style.transform='scale(1)'">
                    <div style="font-size: 18px; font-weight: bold; color: ${rarityConfig.color}; margin-bottom: 5px;">
                        ${talent.name} <span style="font-size: 12px; color: #999;">${typeName}</span>
                    </div>
                    <div style="font-size: 13px; color: #bbb; margin-bottom: 5px;">${talent.description}</div>
                    ${evolutionPreview}
                </div>
            `;
        }).join('');

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98); border: 2px solid ${elementColor};
            border-radius: 15px; padding: 30px; min-width: 450px; max-width: 600px;
            z-index: 50000; box-shadow: 0 0 30px ${elementColor}44;
        `;
        dialog.id = 'talent-selection-dialog';
        dialog.innerHTML = `
            <h2 style="color: ${elementColor}; text-align: center; margin-bottom: 10px;">✨ ${elementName}系天赋觉醒</h2>
            <p style="color: #aaa; text-align: center; margin-bottom: 20px; font-size: 14px;">选择一个天赋，它将伴随你的${elementName}系成长</p>
            ${choicesHtml}
        `;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:49999;';
        overlay.id = 'talent-selection-overlay';
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
    },

    // 确认选择天赋
    confirmTalent(element, talentId) {
        Player.talents[element] = TalentSystem.selectTalent(talentId);

        const talent = TalentSystem.getTalent(talentId);
        const elementName = SkillSystem.getElementName(element);

        // 移除对话框
        document.getElementById('talent-selection-dialog')?.remove();
        document.getElementById('talent-selection-overlay')?.remove();

        // v0.93.0: clear gameContainer to prevent innate talent UI from showing through
        UI.elements.gameContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-size:18px;">Loading...</div>';

        UI.showMessage(`你选择了${elementName}系天赋：${talent.name}`);

        // 如果有多个系需要选择天赋（天生双系）
        if (this._pendingElements && this._currentTalentElementIndex !== undefined) {
            this._currentTalentElementIndex++;
            if (this._currentTalentElementIndex < this._pendingElements.length) {
                // 继续选择下一系的天赋
                setTimeout(() => {
                    this.showTalentSelection(this._pendingElements[this._currentTalentElementIndex]);
                }, 500);
                return;
            } else {
                // 所有系天赋选择完毕
                this._pendingElements = null;
                this._currentTalentElementIndex = null;
            }
        }

        Player.save();

        // 如果是新游戏创建流程，进入地图并显示开场剧情
        if (this._pendingNewGame) {
            this._pendingNewGame = false;
            this.state = 'map';
            UI.renderMapScreen();
            // 开场剧情用第一系
            UI.showOpeningStory(this._pendingElement || element);
            this._pendingElement = null;
        } else {
            this.openCharacterPanel();
        }
    },

    // ========== 境界突破 ==========
    showBreakthroughPanel() {
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
    },

    performBreakthrough() {
        if (typeof RealmSystem === 'undefined') {
            UI.showMessage('境界系统未加载！');
            return;
        }

        const result = Player.breakthrough();

        if (result.success) {
            Player.save();
            let msg = `🎉 ${result.message}\n\n属性提升：\nHP +${result.statGains.maxHp}\nMP +${result.statGains.maxMp}\n攻击 +${result.statGains.attack}\n防御 +${result.statGains.defense}`;
            
            if (result.unlockedSkills && result.unlockedSkills.length > 0) {
                const skillNames = result.unlockedSkills.map(id => SkillSystem.getSkill(id)?.name || id).join('、');
                msg += `\n\n解锁中阶魔法: ${skillNames}`;
            }
            
            UI.showMessage(msg);
            this.openCharacterPanel();
        } else {
            UI.showMessage(`💔 ${result.message}`);
            this.showBreakthroughPanel();
        }
    },

    // ========== 休息/睡觉 ==========
    rest() {
        const events = TimeSystem.restUntilMorning();
        Player.save();
        UI.renderMapScreen();
        // 根据恢复比例显示不同消息
        const fullRestEvent = events.find(e => e.type === 'full_rest');
        const ratio = fullRestEvent ? fullRestEvent.staminaRatio : 1.0;
        if (ratio >= 1.0) {
            UI.showMessage('休息了一晚，HP、MP 和体力完全恢复了！');
        } else {
            const percent = Math.floor(ratio * 100);
            UI.showMessage(`休息了一晚，HP、MP 和体力恢复了 ${percent}%\n（熬夜睡觉恢复效果较差）`);
        }
    },

    // ========== 保存游戏 ==========
    saveGame() {
        Player.save();
        UI.showMessage('游戏已保存！');
    },

    // ========== NPC 对话 ==========
    talkToNPC(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 检查是否有可接任务
        const availableQuests = (npc.givesQuests || []).filter(q => QuestSystem.canAcceptQuest(q));
        
        let message = npc.name + '：\n';
        
        // 获取对话
        const dialogue = npc.dialogue?.[0]?.text || '...';
        message += dialogue;

        if (availableQuests.length > 0) {
            message += '\n\n【有可接任务】';
        }

        UI.showNPCDialog(npc, message, availableQuests);
    },

    // 接取任务
    acceptQuest(questId) {
        const result = QuestSystem.acceptQuest(questId);
        UI.showMessage(result.message);
        Player.save();
        UI.renderMapScreen();
    },

    // 给NPC送礼
    giveGift(npcId, itemId) {
        try {
            const npc = DataManager.getCharacter(npcId);
            if (!npc) {
                UI.showMessage('NPC不存在');
                return { success: false };
            }

            // 检查玩家是否有该物品
            const item = Player.inventory.find(i => i.itemId === itemId);
            if (!item || item.count <= 0) {
                UI.showMessage('你没有这个物品');
                return { success: false };
            }

            const itemData = DataManager.getItem(itemId);
            if (!itemData) {
                UI.showMessage('物品数据不存在');
                return { success: false };
            }

            // 获取礼物偏好
            const giftPrefs = npc.giftPreferences || {};
            const dailyLimit = giftPrefs.dailyGiftLimit || 3;
            const baseGain = giftPrefs.baseOpinionGain || 5;

            // 检查今日送礼次数（使用world-state的flags记录）
            const todayKey = `gift_${npcId}_day_${Player.day}`;
            const todayGifts = WorldStateSystem.getFlag(todayKey) || 0;
            if (todayGifts >= dailyLimit) {
                UI.showMessage(`今天已经给${npc.name}送过${dailyLimit}次礼物了，明天再来吧`);
                return { success: false };
            }

            // 计算好感度变化
            let multiplier = 1;
            let reaction = '';
            const loved = giftPrefs.loved || [];
            const liked = giftPrefs.liked || [];
            const disliked = giftPrefs.disliked || [];

            if (loved.includes(itemId)) {
                multiplier = giftPrefs.lovedMultiplier || 3;
                reaction = `${npc.name}非常喜欢这个礼物！`;
            } else if (liked.includes(itemId)) {
                multiplier = giftPrefs.likedMultiplier || 1.5;
                reaction = `${npc.name}觉得这个礼物不错。`;
            } else if (disliked.includes(itemId)) {
                multiplier = giftPrefs.dislikedMultiplier || 0.5;
                reaction = `${npc.name}不太喜欢这个礼物...`;
            } else {
                reaction = `${npc.name}收下了你的礼物。`;
            }

            const opinionGain = Math.floor(baseGain * multiplier);

            // 移除物品
            Inventory.removeItem(itemId, 1);

            // 增加好感度
            NPCStateSystem.changeOpinion(npcId, opinionGain, '送礼');

            // 记录今日送礼次数
            WorldStateSystem.setFlag(todayKey, todayGifts + 1);

            // 显示结果
            const currentOpinion = NPCStateSystem.getNPCState(npcId)?.opinion || 0;
            UI.showMessage(`${reaction}\n好感度 +${opinionGain}（当前：${currentOpinion}）`);

            Player.save();
            return { success: true, opinionGain };
        } catch (e) {
            console.error('送礼出错:', e);
            UI.showMessage('送礼失败：' + e.message);
            return { success: false };
        }
    },
};
