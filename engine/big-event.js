/**
 * 大事件系统
 * 支持多阶段、分支选择、世界状态影响、多个结局
 * 基于现有事件系统扩展，向后兼容
 */

const BigEventSystem = {
    // 当前大事件状态
    currentEvent: null,
    currentPhase: null,
    choiceHistory: [],
    
    /**
     * 初始化
     */
    init() {
        // 从存档恢复大事件状态
        if (Player.bigEventState) {
            this.currentEvent = Player.bigEventState.currentEvent || null;
            this.currentPhase = Player.bigEventState.currentPhase || null;
            this.choiceHistory = Player.bigEventState.choiceHistory || [];
        }
    },
    
    /**
     * 保存大事件状态到玩家存档
     */
    saveState() {
        Player.bigEventState = {
            currentEvent: this.currentEvent,
            currentPhase: this.currentPhase,
            choiceHistory: this.choiceHistory
        };
    },
    
    /**
     * 触发大事件
     * @param {string} eventId - 大事件ID
     * @returns {boolean} 是否成功触发
     */
    triggerBigEvent(eventId) {
        const event = DataManager.getBigEvent(eventId);
        if (!event) {
            console.error(`[大事件] 事件不存在: ${eventId}`);
            return false;
        }
        
        // 检查是否已经触发过
        if (Player.flags['big_event_' + eventId + '_completed']) {
            console.log(`[大事件] 事件已完成: ${eventId}`);
            return false;
        }
        
        // 检查触发条件
        if (event.conditions && !this.checkConditions(event.conditions)) {
            console.log(`[大事件] 条件不满足: ${eventId}`);
            return false;
        }
        
        console.log(`[大事件] 触发事件: ${event.name}`);
        
        // 设置当前事件状态
        this.currentEvent = eventId;
        this.currentPhase = event.phases[0]?.id || null;
        this.choiceHistory = [];
        
        // 标记为已开始
        Player.flags['big_event_' + eventId + '_started'] = true;
        
        this.saveState();
        
        // 显示第一阶段
        this.showCurrentPhase();
        
        return true;
    },
    
    /**
     * 检查条件
     * @param {Object} conditions - 条件对象
     * @returns {boolean} 是否满足
     */
    checkConditions(conditions) {
        if (!conditions) return true;
        
        // 等级条件
        if (conditions.minLevel && Player.level < conditions.minLevel) return false;
        if (conditions.maxLevel && Player.level > conditions.maxLevel) return false;
        
        // 任务条件
        if (conditions.requiredQuests) {
            for (const questId of conditions.requiredQuests) {
                if (!Player.isQuestComplete(questId)) return false;
            }
        }
        
        // 标记条件
        if (conditions.requiredFlags) {
            for (const flag of conditions.requiredFlags) {
                if (!Player.flags[flag]) return false;
            }
        }
        
        // 声望条件
        if (conditions.requiredReputation) {
            for (const [faction, minValue] of Object.entries(conditions.requiredReputation)) {
                if (WorldState.getReputation(faction) < minValue) return false;
            }
        }
        
        // 属性条件
        if (conditions.minStats) {
            const stats = Player.getTotalStats();
            for (const [stat, minValue] of Object.entries(conditions.minStats)) {
                if (stats[stat] < minValue) return false;
            }
        }
        
        return true;
    },
    
    /**
     * 获取当前阶段数据
     */
    getCurrentPhase() {
        if (!this.currentEvent || !this.currentPhase) return null;
        
        const event = DataManager.getBigEvent(this.currentEvent);
        if (!event) return null;
        
        return event.phases.find(p => p.id === this.currentPhase);
    },
    
    /**
     * 显示当前阶段
     */
    showCurrentPhase() {
        const phase = this.getCurrentPhase();
        if (!phase) {
            console.error('[大事件] 当前阶段不存在');
            return;
        }
        
        console.log(`[大事件] 阶段: ${phase.name}`);
        
        // 根据阶段类型处理
        switch (phase.type) {
            case 'narrative':
                this.showNarrativePhase(phase);
                break;
            case 'choice':
                this.showChoicePhase(phase);
                break;
            case 'battle':
                this.showBattlePhase(phase);
                break;
            case 'auto':
                this.processAutoPhase(phase);
                break;
            default:
                console.error(`[大事件] 未知阶段类型: ${phase.type}`);
        }
    },
    
    /**
     * 显示剧情阶段
     */
    showNarrativePhase(phase) {
        // 应用阶段效果
        if (phase.effects) {
            this.applyEffects(phase.effects);
        }
        
        // 显示剧情文本
        UI.renderScheduledEventScreen({
            title: phase.name,
            description: phase.description,
            success: true
        });
        
        // 如果有下一个阶段，设置按钮推进
        if (phase.nextPhase) {
            // 由UI的按钮调用advanceToNextPhase
        } else {
            // 没有下一个阶段，事件结束
            this.endEvent('default');
        }
    },
    
    /**
     * 显示选择阶段
     */
    showChoicePhase(phase) {
        // 过滤可用选项
        const availableChoices = phase.choices.filter(choice => {
            if (!choice.conditions) return true;
            return this.checkConditions(choice.conditions);
        });
        
        // 显示选择界面
        UI.renderBigEventChoicePhase(phase, availableChoices);
    },
    
    /**
     * 处理战斗阶段
     */
    showBattlePhase(phase) {
        // 应用阶段效果
        if (phase.effects) {
            this.applyEffects(phase.effects);
        }
        
        // 触发战斗
        if (phase.enemyId) {
            BattleSystem.startBattle(phase.enemyId, {
                onWin: () => {
                    if (phase.winPhase) {
                        this.advanceToPhase(phase.winPhase);
                    } else {
                        this.endEvent('victory');
                    }
                },
                onLose: () => {
                    if (phase.losePhase) {
                        this.advanceToPhase(phase.losePhase);
                    } else {
                        this.endEvent('defeat');
                    }
                }
            });
        }
    },
    
    /**
     * 处理自动判定阶段
     */
    processAutoPhase(phase) {
        if (!phase.autoCheck) {
            console.error('[大事件] 自动阶段缺少autoCheck配置');
            return;
        }
        
        const { attribute, thresholds } = phase.autoCheck;
        let playerValue = 0;
        
        // 获取玩家属性值
        switch (attribute) {
            case 'level':
                playerValue = Player.level;
                break;
            case 'fire_magic':
            case 'ice_magic':
            case 'thunder_magic':
                playerValue = Player.getTotalStats()[attribute] || 0;
                break;
            default:
                playerValue = Player.getTotalStats()[attribute] || 0;
        }
        
        // 判定阈值
        let nextPhase = thresholds[thresholds.length - 1].nextPhase; // 默认最低阈值
        for (const threshold of thresholds) {
            if (playerValue >= threshold.value) {
                nextPhase = threshold.nextPhase;
                break;
            }
        }
        
        console.log(`[大事件] 自动判定: ${attribute} = ${playerValue}, 进入 ${nextPhase}`);
        
        // 推进到下一阶段
        setTimeout(() => {
            this.advanceToPhase(nextPhase);
        }, 500);
    },
    
    /**
     * 选择选项
     * @param {number} choiceIndex - 选项索引
     */
    selectChoice(choiceIndex) {
        const phase = this.getCurrentPhase();
        if (!phase || phase.type !== 'choice') return;
        
        const choice = phase.choices[choiceIndex];
        if (!choice) return;
        
        console.log(`[大事件] 选择: ${choice.text}`);
        
        // 记录选择历史
        this.choiceHistory.push({
            phaseId: phase.id,
            choiceIndex: choiceIndex,
            choiceText: choice.text
        });
        
        // 应用选择效果
        if (choice.effects) {
            this.applyEffects(choice.effects);
        }
        
        // 推进到下一阶段
        if (choice.nextPhase) {
            this.advanceToPhase(choice.nextPhase);
        } else {
            // 没有下一阶段，事件结束
            this.endEvent(choice.ending || 'default');
        }
        
        this.saveState();
    },
    
    /**
     * 推进到指定阶段
     * @param {string} phaseId - 目标阶段ID
     */
    advanceToPhase(phaseId) {
        const event = DataManager.getBigEvent(this.currentEvent);
        if (!event) return;
        
        const phase = event.phases.find(p => p.id === phaseId);
        if (!phase) {
            console.error(`[大事件] 阶段不存在: ${phaseId}`);
            return;
        }
        
        this.currentPhase = phaseId;
        this.saveState();
        
        // 显示新阶段
        this.showCurrentPhase();
    },
    
    /**
     * 推进到下一个阶段（按顺序）
     */
    advanceToNextPhase() {
        const event = DataManager.getBigEvent(this.currentEvent);
        if (!event) return;
        
        const currentIndex = event.phases.findIndex(p => p.id === this.currentPhase);
        if (currentIndex < 0 || currentIndex >= event.phases.length - 1) {
            // 已经是最后一个阶段，结束事件
            this.endEvent('default');
            return;
        }
        
        const nextPhase = event.phases[currentIndex + 1];
        this.advanceToPhase(nextPhase.id);
    },
    
    /**
     * 应用效果
     * @param {Object} effects - 效果对象
     */
    applyEffects(effects) {
        if (!effects) return;
        
        // 属性效果
        if (effects.hp) Player.hp = Math.max(0, Math.min(Player.getTotalStats().maxHp, Player.hp + effects.hp));
        if (effects.mp) Player.mp = Math.max(0, Math.min(Player.getTotalStats().maxMp, Player.mp + effects.mp));
        if (effects.stamina) Player.stamina = Math.max(0, Math.min(Player.getTotalStats().maxStamina, Player.stamina + effects.stamina));
        if (effects.exp) Player.gainExp(effects.exp);
        if (effects.gold) Player.gold = Math.max(0, Player.gold + effects.gold);
        
        // 物品效果
        if (effects.items) {
            for (const item of effects.items) {
                Inventory.addItem(item.itemId, item.count || 1);
            }
        }
        
        // 声望效果
        if (effects.reputation) {
            for (const [faction, value] of Object.entries(effects.reputation)) {
                WorldState.changeReputation(faction, value);
            }
        }
        
        // 标记效果
        if (effects.flags) {
            for (const [flag, value] of Object.entries(effects.flags)) {
                Player.flags[flag] = value;
            }
        }
        
        // NPC关系效果
        if (effects.npcRelation) {
            for (const [npcId, value] of Object.entries(effects.npcRelation)) {
                NPCState.changeRelation(npcId, value);
            }
        }
    },
    
    /**
     * 结束大事件
     * @param {string} endingId - 结局ID
     */
    endEvent(endingId = 'default') {
        const event = DataManager.getBigEvent(this.currentEvent);
        if (!event) return;
        
        const ending = event.endings?.[endingId];
        console.log(`[大事件] 事件结束: ${event.name}, 结局: ${ending?.name || endingId}`);
        
        // 应用结局效果
        if (ending?.effects) {
            this.applyEffects(ending.effects);
        }
        
        // 标记为已完成
        Player.flags['big_event_' + this.currentEvent + '_completed'] = true;
        Player.flags['big_event_' + this.currentEvent + '_ending'] = endingId;
        
        // 保存
        this.saveState();
        Player.save();
        
        // 显示结局界面
        if (ending) {
            UI.renderBigEventEnding(event, ending);
        } else {
            // 没有结局，直接回到地图
            Game.returnToMap();
        }
        
        // 清除当前状态（在显示结局之后，因为UI还需要用到）
        // 不清除，等用户点击继续后再清除
    },
    
    /**
     * 检查是否有正在进行的大事件
     */
    hasActiveEvent() {
        return this.currentEvent !== null;
    },
    
    /**
     * 检查所有大事件，触发满足条件的
     * @returns {boolean} 是否触发了大事件
     */
    checkAndTrigger() {
        // 如果已经有正在进行的大事件，不触发新的
        if (this.hasActiveEvent()) {
            return false;
        }
        
        // 获取所有大事件
        const allBigEvents = DataManager.getAllBigEvents();
        if (!allBigEvents) return false;
        
        for (const eventId in allBigEvents) {
            const event = allBigEvents[eventId];
            
            // 检查是否已经完成
            if (Player.flags['big_event_' + eventId + '_completed']) {
                continue;
            }
            
            // 检查是否已经开始
            if (Player.flags['big_event_' + eventId + '_started']) {
                continue;
            }
            
            // 检查是否自动触发
            if (!event.autoTrigger) {
                continue;
            }
            
            // 检查开始天数
            if (event.startDay && Player.day < event.startDay) {
                continue;
            }
            
            // 检查触发条件
            if (event.conditions && !this.checkConditions(event.conditions)) {
                continue;
            }
            
            // 触发大事件
            console.log(`[大事件] 自动触发: ${event.name}`);
            this.triggerBigEvent(eventId);
            return true;
        }
        
        return false;
    }
};
