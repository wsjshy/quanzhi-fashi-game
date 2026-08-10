/**
 * 时间系统
 * 管理游戏内时间流逝、日夜循环、定时事件
 */

const TimeSystem = {
    // 时段定义
    TIME_PERIODS: [
        { id: 'morning', name: '早上', hours: 6 },
        { id: 'afternoon', name: '下午', hours: 12 },
        { id: 'evening', name: '傍晚', hours: 18 },
        { id: 'night', name: '夜晚', hours: 22 }
    ],

    /**
     * 推进时间
     * @param {number} hours - 推进的小时数
     */
    advanceTime(hours) {
        const events = [];
        let hoursLeft = hours;

        while (hoursLeft > 0) {
            const currentIndex = this.TIME_PERIODS.findIndex(p => p.id === Player.timeOfDay);
            const hoursToNextPeriod = this.getHoursToNextPeriod(currentIndex);
            
            if (hoursLeft >= hoursToNextPeriod) {
                // 推进到下一个时段
                hoursLeft -= hoursToNextPeriod;
                const nextIndex = (currentIndex + 1) % this.TIME_PERIODS.length;
                Player.timeOfDay = this.TIME_PERIODS[nextIndex].id;
                
                // 如果跨过了夜晚，进入新的一天
                if (nextIndex === 0) {
                    this.advanceDay();
                    events.push({ type: 'new_day', day: Player.day });
                }
                
                events.push({ type: 'period_change', period: Player.timeOfDay });
            } else {
                // 在当前时段内
                hoursLeft = 0;
            }
        }

        return events;
    },

    /**
     * 获取到下一个时段的小时数
     */
    getHoursToNextPeriod(currentIndex) {
        // 简化处理：每个时段大约 6 小时
        return 6;
    },
    
    /**
     * 等待到指定时段
     * @param {string} targetPeriod - 目标时段
     * @returns {Object} 结果
     */
    waitUntil(targetPeriod) {
        const currentIndex = this.TIME_PERIODS.findIndex(p => p.id === Player.timeOfDay);
        const targetIndex = this.TIME_PERIODS.findIndex(p => p.id === targetPeriod);
        
        if (currentIndex === -1 || targetIndex === -1) {
            return { success: false, message: '时段错误' };
        }
        
        // 计算需要等待的小时数
        let hoursToWait;
        if (targetIndex > currentIndex) {
            hoursToWait = (targetIndex - currentIndex) * 6;
        } else {
            // 跨天
            hoursToWait = (this.TIME_PERIODS.length - currentIndex + targetIndex) * 6;
        }
        
        // 等待消耗少量体力
        const staminaCost = Math.floor(hoursToWait * 0.5);
        if (Player.stamina < staminaCost) {
            return { 
                success: false, 
                message: `体力不足！等待需要 ${staminaCost} 点体力，当前只有 ${Player.stamina} 点。` 
            };
        }
        
        // 消耗体力
        Player.useStamina(staminaCost);
        
        // 推进时间
        const events = this.advanceTime(hoursToWait);
        
        return {
            success: true,
            hoursWaited: hoursToWait,
            staminaCost: staminaCost,
            events: events
        };
    },
    
    /**
     * 获取当前时段信息
     */
    getCurrentPeriodInfo() {
        const period = this.TIME_PERIODS.find(p => p.id === Player.timeOfDay);
        return period || this.TIME_PERIODS[0];
    },
    
    /**
     * 获取所有时段列表
     */
    getAllPeriods() {
        return this.TIME_PERIODS;
    },
    
    /**
     * 判断是否是夜晚
     */
    isNight() {
        return Player.timeOfDay === 'night' || Player.timeOfDay === 'evening';
    },
    
    /**
     * 判断是否是白天
     */
    isDay() {
        return Player.timeOfDay === 'morning' || Player.timeOfDay === 'afternoon';
    },

    /**
     * 推进一天
     */
    advanceDay() {
        Player.day++;
        
        // 自然恢复
        const stats = Player.getTotalStats();
        Player.hp = Math.min(Player.hp + Math.floor(stats.maxHp * 0.2), stats.maxHp);
        Player.mp = Math.min(Player.mp + Math.floor(stats.maxMp * 0.3), stats.maxMp);
        
        // 每天早上恢复满体力
        if (Player.timeOfDay === 'morning') {
            Player.fullRestoreStamina();
        }
        
        // 检查是否有大事件
        const event = this.checkScheduledEvents();
        if (event) {
            this._pendingEvent = event;
        }

        // 检查事件链
        this.checkEventChains();
    },

    /**
     * 检查事件链（开始新事件链、推进阶段、完成事件链）
     */
    checkEventChains() {
        const eventChains = DataManager.getEventChains();
        if (!eventChains) return;

        for (const [chainId, chainData] of Object.entries(eventChains)) {
            const chainState = WorldState.getEventChainState(chainId);

            // 如果事件链还没开始，检查是否可以开始
            if (!chainState.active && !chainState.completed) {
                if (chainData.startDay && Player.day >= chainData.startDay) {
                    WorldState.startEventChain(chainId);
                    console.log(`[事件链] ${chainData.name} 开始了！`);
                }
                continue;
            }

            // 如果事件链进行中，检查是否可以推进到下一个阶段
            if (chainState.active) {
                const currentStageId = chainState.currentStage;
                const stages = chainData.stages || {};

                // 找到下一个阶段
                const stageIds = Object.keys(stages);
                const currentIndex = stageIds.indexOf(currentStageId);

                if (currentIndex >= 0 && currentIndex < stageIds.length - 1) {
                    const nextStageId = stageIds[currentIndex + 1];
                    const nextStage = stages[nextStageId];

                    // 检查是否达到触发天数
                    if (nextStage.triggerDay && Player.day >= nextStage.triggerDay) {
                        // 检查条件
                        let conditionsMet = true;
                        if (nextStage.conditions) {
                            // 检查信息数量条件
                            if (nextStage.conditions.minInfoCount) {
                                const infoCount = WorldState.knownInfo ? WorldState.knownInfo.length : 0;
                                if (infoCount < nextStage.conditions.minInfoCount) {
                                    conditionsMet = false;
                                }
                            }
                            // 检查等级条件
                            if (nextStage.conditions.minLevel) {
                                if (Player.level < nextStage.conditions.minLevel) {
                                    conditionsMet = false;
                                }
                            }
                        }

                        if (conditionsMet) {
                            WorldState.advanceEventChain(chainId, nextStageId);
                            console.log(`[事件链] ${chainData.name} 推进到 ${nextStage.name} 阶段！`);

                            // 执行进入阶段的效果
                            if (nextStage.onEnter) {
                                if (nextStage.onEnter.giveInfo) {
                                    const infos = Array.isArray(nextStage.onEnter.giveInfo)
                                        ? nextStage.onEnter.giveInfo
                                        : [nextStage.onEnter.giveInfo];
                                    infos.forEach(infoId => {
                                        WorldState.gainInfo(infoId);
                                    });
                                }
                            }

                            // 检查是否是最后一个阶段，如果是，检查结局
                            if (currentIndex + 1 === stageIds.length - 1) {
                                this.checkEventChainEnding(chainId, chainData);
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * 检查事件链结局
     */
    checkEventChainEnding(chainId, chainData) {
        const endings = chainData.endings || {};
        const endingIds = Object.keys(endings);

        // 按优先级检查结局（从好到坏）
        for (const endingId of endingIds) {
            const ending = endings[endingId];
            if (!ending.conditions) continue;

            let conditionsMet = true;

            // 检查等级条件
            if (ending.conditions.minLevel) {
                if (Player.level < ending.conditions.minLevel) {
                    conditionsMet = false;
                }
            }

            // 检查信息数量条件
            if (ending.conditions.minInfoCount) {
                const infoCount = WorldState.knownInfo ? WorldState.knownInfo.length : 0;
                if (infoCount < ending.conditions.minInfoCount) {
                    conditionsMet = false;
                }
            }

            // 检查物品条件
            if (ending.conditions.hasItems) {
                const items = Array.isArray(ending.conditions.hasItems)
                    ? ending.conditions.hasItems
                    : [ending.conditions.hasItems];
                for (const itemId of items) {
                    if (!InventorySystem.hasItem(itemId)) {
                        conditionsMet = false;
                        break;
                    }
                }
            }

            if (conditionsMet) {
                this.completeEventChain(chainId, chainData, endingId, ending);
                return;
            }
        }

        // 如果没有匹配的结局，使用最后一个（默认坏结局）
        if (endingIds.length > 0) {
            const defaultEndingId = endingIds[endingIds.length - 1];
            const defaultEnding = endings[defaultEndingId];
            this.completeEventChain(chainId, chainData, defaultEndingId, defaultEnding);
        }
    },

    /**
     * 完成事件链
     */
    completeEventChain(chainId, chainData, endingId, ending) {
        WorldState.completeEventChain(chainId, endingId);
        console.log(`[事件链] ${chainData.name} 完成！结局：${ending.name}`);

        // 发放奖励
        if (ending.rewards) {
            if (ending.rewards.exp) {
                Player.gainExp(ending.rewards.exp);
            }
            if (ending.rewards.gold) {
                Player.gold += ending.rewards.gold;
            }
            if (ending.rewards.items) {
                ending.rewards.items.forEach(item => {
                    InventorySystem.addItem(item.itemId, item.count || 1);
                });
            }
            if (ending.rewards.reputation) {
                for (const [factionId, amount] of Object.entries(ending.rewards.reputation)) {
                    WorldState.changeReputation(factionId, amount);
                }
            }
        }

        // 执行惩罚
        if (ending.penalties) {
            if (ending.penalties.exp) {
                Player.exp = Math.max(0, Player.exp + ending.penalties.exp);
            }
            if (ending.penalties.hp) {
                Player.hp = Math.max(1, Player.hp + ending.penalties.hp);
            }
            if (ending.penalties.gold) {
                Player.gold = Math.max(0, Player.gold + ending.penalties.gold);
            }
        }
    },

    /**
     * 检查定时大事件
     */
    checkScheduledEvents() {
        const events = DataManager.getScheduledEvents();
        if (!events || events.length === 0) return null;
        
        // 找到今天的事件
        const todayEvent = events.find(e => e.day === Player.day);
        if (todayEvent && !Player.flags['event_' + todayEvent.id]) {
            return todayEvent;
        }
        
        return null;
    },

    /**
     * 获取待处理的大事件
     */
    getPendingEvent() {
        return this._pendingEvent;
    },

    /**
     * 清除待处理的大事件
     */
    clearPendingEvent() {
        this._pendingEvent = null;
    },

    /**
     * 获取即将到来的大事件（7天内）
     */
    getUpcomingEvents() {
        const events = DataManager.getScheduledEvents();
        if (!events || events.length === 0) return [];
        
        return events
            .filter(e => e.day > Player.day && e.day <= Player.day + 7)
            .sort((a, b) => a.day - b.day);
    },

    /**
     * 休息（睡觉）到第二天早上
     */
    restUntilMorning() {
        const events = [];
        
        // 直接跳到第二天早上
        Player.timeOfDay = 'morning';
        this.advanceDay();
        
        // 完全恢复
        const stats = Player.getTotalStats();
        Player.hp = stats.maxHp;
        Player.mp = stats.maxMp;
        Player.fullRestoreStamina();
        
        events.push({ type: 'new_day', day: Player.day });
        events.push({ type: 'full_rest' });
        
        return events;
    },

    /**
     * 获取当前时段名称
     */
    getCurrentPeriodName() {
        const period = this.TIME_PERIODS.find(p => p.id === Player.timeOfDay);
        return period ? period.name : '未知';
    },

    /**
     * 获取时间描述
     */
    getTimeDescription() {
        const period = this.getCurrentPeriodInfo();
        const icons = {
            morning: '🌅',
            afternoon: '☀️',
            evening: '🌆',
            night: '🌙'
        };
        const icon = icons[period.id] || '⏰';
        return `${icon} 第 ${Player.day} 天 · ${period.name}`;
    },
    
    /**
     * 获取详细的时间描述（带时段提示）
     */
    getDetailedTimeDescription() {
        const period = this.getCurrentPeriodInfo();
        const descriptions = {
            morning: '清晨，阳光初升，适合修炼和学习',
            afternoon: '正午，阳光明媚，适合外出和探索',
            evening: '傍晚，夕阳西下，天色渐暗',
            night: '深夜，月光皎洁，妖魔横行'
        };
        return descriptions[period.id] || '';
    },

    /**
     * 检查是否是夜晚
     */
    isNight() {
        return Player.timeOfDay === 'night';
    },

    /**
     * 检查是否是白天
     */
    isDaytime() {
        return Player.timeOfDay === 'morning' || Player.timeOfDay === 'afternoon';
    }
};
