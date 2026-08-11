/**
 * 时间系统
 * 管理游戏内时间流逝、日夜循环、定时事件
 * 基于具体小时数计算，时间精确到小时
 */

const TimeSystem = {
    // 时段定义（起始小时）- v0.4 8时段制
    TIME_PERIODS: [
        { id: 'dawn', name: '清晨', startHour: 6, icon: '🌅', duration: 2 },
        { id: 'morning', name: '上午', startHour: 8, icon: '📚', duration: 4 },
        { id: 'noon', name: '中午', startHour: 12, icon: '🍱', duration: 2 },
        { id: 'afternoon', name: '下午', startHour: 14, icon: '⚔️', duration: 4 },
        { id: 'evening', name: '傍晚', startHour: 18, icon: '🌆', duration: 2 },
        { id: 'night', name: '夜晚', startHour: 20, icon: '🌙', duration: 4 },
        { id: 'late_night', name: '深夜', startHour: 0, icon: '🌃', duration: 3 },
        { id: 'sleep', name: '睡眠', startHour: 3, icon: '😴', duration: 3 }
    ],

    // 强制昏睡时间
    FORCE_SLEEP_HOUR: 3,
    // 正常睡觉截止时间
    NORMAL_SLEEP_HOUR: 22,
    // 晚睡截止时间
    LATE_SLEEP_HOUR: 24,

    /**
     * 推进时间
     * @param {number} hours - 推进的小时数
     * @returns {Array} 事件列表
     */
    advanceTime(hours) {
        const events = [];
        const oldPeriod = this.getCurrentPeriod();
        const oldDay = Player.day;
        const oldHour = Player.hour;
        
        console.log(`[时间系统] 推进时间: ${hours}小时`);
        console.log(`[时间系统] 推进前: 第${oldDay}天 ${oldHour}:00 (${oldPeriod})`);
        console.trace('[时间系统] 调用栈');
        
        // 增加小时数
        Player.hour += hours;
        
        // 处理跨天
        while (Player.hour >= 24) {
            Player.hour -= 24;
            this.advanceDay();
            events.push({ type: 'new_day', day: Player.day });
            console.log(`[时间系统] 跨天，现在是第${Player.day}天`);
        }
        
        // 更新当前时段
        const newPeriod = this.getCurrentPeriod();
        Player.timeOfDay = newPeriod;
        
        // 如果时段变了，添加事件
        if (oldPeriod !== newPeriod) {
            events.push({ type: 'period_change', period: newPeriod });
        }
        
        // 检查是否到了强制昏睡时间
        if (Player.hour >= this.FORCE_SLEEP_HOUR && Player.hour < 6) {
            events.push({ type: 'force_sleep' });
            console.log('[时间系统] 触发强制昏睡');
            this.forceSleep();
        }
        
        // 检查定时大事件
        this.checkScheduledEvents();
        
        console.log(`[时间系统] 推进后: 第${Player.day}天 ${Player.hour}:00 (${newPeriod})`);
        
        return events;
    },

    /**
     * 强制昏睡（凌晨3点还没睡觉）
     */
    forceSleep() {
        // 直接跳到当天早上6点
        Player.hour = 6;
        Player.timeOfDay = 'dawn';
        
        // 体力只恢复50%
        const stats = Player.getTotalStats();
        Player.stamina = Math.floor(stats.maxStamina * 0.5);
        Player.hp = Math.min(Player.hp + Math.floor(stats.maxHp * 0.3), stats.maxHp);
        Player.mp = Math.min(Player.mp + Math.floor(stats.maxMp * 0.3), stats.maxMp);
        
        console.log('[时间系统] 强制昏睡，体力只恢复50%');
    },

    /**
     * 获取当前时段
     * @returns {string} 时段ID
     */
    getCurrentPeriod() {
        const hour = Player.hour;
        if (hour >= 3 && hour < 6) return 'sleep';
        if (hour >= 6 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 14) return 'noon';
        if (hour >= 14 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 20) return 'evening';
        if (hour >= 20 && hour < 24) return 'night';
        return 'late_night'; // 0:00-3:00
    },
    
    /**
     * 获取时段名称
     * @returns {string} 时段名称
     */
    getPeriodName() {
        const period = this.TIME_PERIODS.find(p => p.id === this.getCurrentPeriod());
        return period ? period.name : '未知';
    },
    
    /**
     * 获取时段图标
     * @returns {string} 时段图标
     */
    getPeriodIcon() {
        const period = this.TIME_PERIODS.find(p => p.id === this.getCurrentPeriod());
        return period ? period.icon : '⏰';
    },
    
    /**
     * 获取时间描述
     * @returns {string} 时间描述
     */
    getTimeDescription() {
        const period = this.TIME_PERIODS.find(p => p.id === this.getCurrentPeriod());
        const icon = period ? period.icon : '⏰';
        const name = period ? period.name : '未知';
        return `${icon} 第${Player.day}天 ${name} ${Player.hour}:00`;
    },

    /**
     * 等待到指定时段
     * @param {string} targetPeriod - 目标时段
     * @returns {Object} 结果
     */
    waitUntil(targetPeriod) {
        const targetPeriodData = this.TIME_PERIODS.find(p => p.id === targetPeriod);
        if (!targetPeriodData) {
            return { success: false, message: '时段错误' };
        }
        
        const targetHour = targetPeriodData.startHour;
        let hoursToWait;
        
        if (Player.hour < targetHour) {
            // 今天就能等到
            hoursToWait = targetHour - Player.hour;
        } else {
            // 要等到明天
            hoursToWait = 24 - Player.hour + targetHour;
        }
        
        // 等待消耗少量体力
        const staminaCost = Math.max(1, Math.floor(hoursToWait * 0.3));
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
                    if (!Inventory.hasItem(itemId)) {
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
                    Inventory.addItem(item.itemId, item.count || 1);
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
     * 获取当前星期几（0=周日, 1=周一, ..., 6=周六）
     */
    getDayOfWeek() {
        // 第1天是周一
        return ((Player.day - 1) % 7 + 1) % 7;
    },

    /**
     * 获取星期几名称
     */
    getDayOfWeekName() {
        const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return names[this.getDayOfWeek()];
    },

    /**
     * 获取当前时段的课程（如果在学校）
     * @param {Object} location - 地点数据
     * @returns {Object|null} 课程数据
     */
    getCurrentClass(location) {
        if (!location || !location.classSchedule) return null;

        const dayOfWeek = this.getDayOfWeek();
        const period = this.getCurrentPeriod();

        if (period === 'morning' && location.classSchedule.morning) {
            return location.classSchedule.morning[dayOfWeek] || null;
        }
        if (period === 'afternoon' && location.classSchedule.afternoon) {
            return location.classSchedule.afternoon[dayOfWeek] || null;
        }

        return null;
    },

    /**
     * 检查当前是否有课
     * @param {Object} location - 地点数据
     * @returns {boolean}
     */
    hasClassNow(location) {
        return this.getCurrentClass(location) !== null;
    },

    /**
     * 休息（睡觉）到第二天早上
     * 根据睡觉时间决定恢复效果
     */
    restUntilMorning() {
        const events = [];
        const sleepHour = Player.hour;
        
        // 直接跳到第二天早上6点
        Player.hour = 6;
        Player.timeOfDay = 'dawn';
        this.advanceDay();
        
        // 根据睡觉时间决定恢复量
        const stats = Player.getTotalStats();
        let staminaRatio = 1.0;
        let hpRatio = 1.0;
        let mpRatio = 1.0;
        
        if (sleepHour >= this.NORMAL_SLEEP_HOUR && sleepHour < this.LATE_SLEEP_HOUR) {
            // 22:00-24:00睡觉，正常恢复
            staminaRatio = 1.0;
            hpRatio = 1.0;
            mpRatio = 1.0;
        } else if (sleepHour >= this.LATE_SLEEP_HOUR || sleepHour < 3) {
            // 24:00后睡觉，恢复80%
            staminaRatio = 0.8;
            hpRatio = 0.8;
            mpRatio = 0.8;
        } else {
            // 22:00前睡觉，额外加成
            staminaRatio = 1.0;
            hpRatio = 1.0;
            mpRatio = 1.0;
        }
        
        Player.hp = Math.min(Math.floor(stats.maxHp * hpRatio), stats.maxHp);
        Player.mp = Math.min(Math.floor(stats.maxMp * mpRatio), stats.maxMp);
        Player.stamina = Math.min(Math.floor(stats.maxStamina * staminaRatio), stats.maxStamina);
        
        events.push({ type: 'new_day', day: Player.day });
        events.push({ type: 'full_rest', staminaRatio: staminaRatio });
        
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
        const hourStr = Player.hour.toString().padStart(2, '0');
        return `${icon} 第 ${Player.day} 天 · ${period.name} ${hourStr}:00`;
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
     * 检查是否是夜晚（包括傍晚、夜晚、深夜）
     */
    isNight() {
        const period = this.getCurrentPeriod();
        return period === 'evening' || period === 'night' || period === 'late_night';
    },

    /**
     * 检查是否是白天（清晨、上午、中午、下午）
     */
    isDaytime() {
        const period = this.getCurrentPeriod();
        return period === 'dawn' || period === 'morning' || period === 'noon' || period === 'afternoon';
    },

    /**
     * 检查是否是深夜（有熬夜惩罚）
     */
    isLateNight() {
        return this.getCurrentPeriod() === 'late_night';
    },

    /**
     * 检查是否是睡眠时间（强制昏睡）
     */
    isSleepTime() {
        return this.getCurrentPeriod() === 'sleep';
    },

    /**
     * 获取体力消耗倍率（深夜翻倍）
     */
    getStaminaMultiplier() {
        return this.isLateNight() ? 2 : 1;
    }
};
