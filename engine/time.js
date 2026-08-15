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
    
    // ========== 日历系统 ==========
    // 游戏开始日期：博城历 2008年9月1日 周一（与小说莫凡入学时间一致）
    // 第1天 = 2008年9月1日
    START_YEAR: 2008,
    START_MONTH: 9,
    START_DAY: 1,
    START_WEEKDAY: 1, // 0=周日, 1=周一, 2=周二, ..., 6=周六
    
    // 每月天数（非闰年）
    DAYS_IN_MONTH: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    
    // 星期名称
    WEEKDAY_NAMES: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    
    /**
     * 判断是否闰年
     */
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },
    
    /**
     * 获取某月的天数
     */
    getDaysInMonth(year, month) {
        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }
        return this.DAYS_IN_MONTH[month - 1];
    },
    
    /**
     * 根据第几天计算具体的年月日
     * @param {number} dayNum - 第几天（从1开始）
     * @returns {Object} { year, month, day, weekday }
     */
    getDateFromDayNum(dayNum) {
        let year = this.START_YEAR;
        let month = this.START_MONTH;
        let day = this.START_DAY;
        let weekday = this.START_WEEKDAY;
        
        // 减去第1天，从第0天开始算
        let daysRemaining = dayNum - 1;
        
        while (daysRemaining > 0) {
            const daysInCurrentMonth = this.getDaysInMonth(year, month);
            const daysLeftInMonth = daysInCurrentMonth - day + 1;
            
            if (daysRemaining < daysLeftInMonth) {
                day += daysRemaining;
                weekday = (weekday + daysRemaining) % 7;
                daysRemaining = 0;
            } else {
                daysRemaining -= daysLeftInMonth;
                weekday = (weekday + daysLeftInMonth) % 7;
                month++;
                day = 1;
                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
        }
        
        return { year, month, day, weekday };
    },
    
    /**
     * 获取当前日期信息
     */
    getCurrentDate() {
        return this.getDateFromDayNum(Player.day);
    },
    
    /**
     * 获取当前日期字符串（如：2008年9月1日）
     */
    getDateString() {
        const date = this.getCurrentDate();
        return `${date.year}年${date.month}月${date.day}日`;
    },
    
    /**
     * 获取当前星期几
     */
    getWeekday() {
        const date = this.getCurrentDate();
        return this.WEEKDAY_NAMES[date.weekday];
    },
    
    /**
     * 获取完整日期字符串（如：2008年9月1日 周一）
     */
    getFullDateString() {
        const date = this.getCurrentDate();
        return `${date.year}年${date.month}月${date.day}日 ${this.WEEKDAY_NAMES[date.weekday]}`;
    },

    /**
     * 推进时间
     * @param {number} hours - 推进的小时数
     * @returns {Array} 事件列表
     */
    advanceTime(hours) {
        const events = [];
        const oldPeriod = this.getCurrentPeriod();
        const oldDay = Player.day;

        // 增加小时数
        Player.hour += hours;
        
        // 处理跨天
        while (Player.hour >= 24) {
            Player.hour -= 24;
            this.advanceDay();
            events.push({ type: 'new_day', day: Player.day });
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
            this.forceSleep();
        }

        // 检查定时大事件
        this.checkScheduledEvents();

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
        const date = this.getCurrentDate();
        return `${icon} ${date.month}月${date.day}日 ${this.WEEKDAY_NAMES[date.weekday]} ${name} ${Player.hour}:00`;
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
        
        // v0.9.0: 体力不再作为硬限制，移除检查
        // 等待消耗少量体力（useStamina不会阻止行动）
        const staminaCost = Math.max(1, Math.floor(hoursToWait * 0.3));
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
     * 格式化小时显示（修复12.5:00问题）
     * 整点显示 X:00，半点显示 X:30
     */
    formatHour(hour) {
        const h = hour != null ? hour : Player.hour;
        const intHour = Math.floor(h);
        const minutes = Math.round((h - intHour) * 60);
        const minStr = minutes < 10 ? '0' + minutes : '' + minutes;
        return `${intHour}:${minStr}`;
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
        // v0.9.4: 每日总结 - 保存前一天的统计
        if (Player.dailyStats && Player.dailyStats.day !== Player.day) {
            Player.dailyStats.day = Player.day;
        }
        const yesterdayStats = Player.dailyStats ? { ...Player.dailyStats } : null;
        
        Player.day++;
        
        // v0.27.0: NPC每日被动成长
        if (typeof NPCStateSystem !== 'undefined' && NPCStateSystem.passiveDailyGrowth) {
            NPCStateSystem.passiveDailyGrowth();
        }

        // v0.35.0: NPC-NPC关系每日自然演变
        if (typeof NPCStateSystem !== 'undefined' && NPCStateSystem.updateNPCRelationshipsDaily) {
            NPCStateSystem.updateNPCRelationshipsDaily();
        }

        // v0.42.0: NPC日常消息 - 关系好的NPC每天有概率主动发消息
        if (typeof NPCStateSystem !== 'undefined' && typeof Game !== 'undefined' && Game._npcSchedules) {
            const messages = [];
            for (const [npcId, schedule] of Object.entries(Game._npcSchedules)) {
                const state = NPCStateSystem.getNPCState(npcId);
                if (!state) continue;
                // 关系达到友好(>10)才有概率发消息
                if (state.opinion < 10) continue;
                // 概率随好感度提升：10好感8%，30好感17%，50好感25%，80好感40%
                const msgChance = Math.min(0.4, 0.04 + state.opinion * 0.0045);
                if (Math.random() > msgChance) continue;
                // 每天最多收到2条消息
                if (messages.length >= 2) break;

                const npcData = typeof DataManager !== 'undefined' ? DataManager.getCharacter(npcId) : null;
                const npcName = npcData ? npcData.name : schedule.name;
                const msg = this._generateNPCMessage(npcId, npcName, state.opinion, schedule.gender);
                if (msg) messages.push({ npcId, name: npcName, text: msg });
            }
            if (messages.length > 0) {
                Player._pendingNPCMessages = messages;
            }
        }
        
        // v0.9.4: 重置每日统计
        if (Player.dailyStats) {
            Player.dailyStats = {
                day: Player.day,
                expGained: 0,
                goldGained: 0,
                battlesWon: 0,
                locationsExplored: 0,
                npcsTalked: 0
            };
        }
        
        // v0.9.4: 触发每日总结（延迟到UI渲染后）
        if (yesterdayStats && (yesterdayStats.expGained > 0 || yesterdayStats.battlesWon > 0 || yesterdayStats.locationsExplored > 0)) {
            Player._pendingDailySummary = yesterdayStats;
        }
        
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
        
        // 和平主义者成就：连续3天不战斗
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const lastBattleDay = Player.lastBattleDay || 0;
                const daysWithoutBattle = Player.day - lastBattleDay;
                if (lastBattleDay > 0 && daysWithoutBattle >= 3 && !WorldState.hasAchievement('pacifist')) {
                    const achData = DataAchievements['pacifist'];
                    if (achData) {
                        WorldState.unlockAchievement('pacifist', achData);
                    }
                }
            } catch (e) {
                console.warn('[Time] 和平主义者成就检查失败:', e);
            }
        }
    },

    /**
     * v0.42.0: 生成NPC日常消息
     * 根据NPC ID、好感度和性格生成不同的消息
     */
    _generateNPCMessage(npcId, npcName, opinion, gender) {
        // 按好感度分档
        let tier = 'friendly';
        if (opinion >= 70) tier = 'close';
        else if (opinion >= 45) tier = 'friend';
        else if (opinion >= 20) tier = 'friendly';

        // 每个NPC的个性化消息池
        const messagePools = {
            mo_fan: {
                friendly: ['莫凡：今天修炼了吗？别偷懒啊。', '莫凡：我刚才在修炼场看到你了，进步挺快嘛。'],
                friend: ['莫凡：有空一起切磋吗？我最近悟了个新招式。', '莫凡：说起来，你觉得地圣泉那边怎么样？'],
                close: ['莫凡：兄弟，今天一起去吃个饭？我请客！', '莫凡：有什么修炼上的问题尽管问我，别客气。']
            },
            mu_ningxue: {
                friendly: ['穆宁雪：……今天天气不错。', '穆宁雪：你的冰系天赋，我注意到了。'],
                friend: ['穆宁雪：如果你愿意，可以来天台找我聊聊。', '穆宁雪：修炼遇到瓶颈了吗？可以试试换个思路。'],
                close: ['穆宁雪：……今天的星星很亮，你看到了吗？', '穆宁雪：有你在，感觉修炼也没那么枯燥了。']
            },
            tang_yue: {
                friendly: ['唐月：作业都交了吗？别让我催哦。', '唐月：上课要认真听讲，别走神。'],
                friend: ['唐月：最近表现不错，继续保持。', '唐月：有什么不懂的随时来办公室找我。'],
                close: ['唐月：老师相信你一定能成为优秀的法师。', '唐月：累了就休息一下，别太拼了，身体要紧。']
            },
            zhang_xiaohou: {
                friendly: ['张小侯：大哥！今天一起去冒险吗？', '张小侯：我刚才看到一个超酷的魔法！'],
                friend: ['张小侯：大哥你太厉害了，教教我呗！', '张小侯：明天去不去雪峰山？我听说有新发现！'],
                close: ['张小侯：大哥，你是我最崇拜的人！', '张小侯：不管发生什么，我都跟着大哥！']
            },
            zhao_manyan: {
                friendly: ['赵满延：嘿！看我最新练成的光系魔法！', '赵满延：你说我是不是咱们班最帅的？'],
                friend: ['赵满延：走，我请你喝奶茶！', '赵满延：跟你说，光系防御才是最厉害的！'],
                close: ['赵满延：兄弟，以后有事尽管找我！', '赵满延：我赵满延认定的朋友，绝对靠谱！']
            },
            zhou_min: {
                friendly: ['周敏：今天的笔记你抄了吗？', '周敏：图书馆新到了一批书，要一起去看吗？'],
                friend: ['周敏：这道题我不太懂，你能教教我吗？', '周敏：一起自习吧，两个人效率更高。'],
                close: ['周敏：谢谢你一直陪着我学习……', '周敏：和你在一起的时候，感觉时间过得好快。']
            },
            xu_zhaoting: {
                friendly: ['许昭霆：哼，别以为进步快就了不起。', '许昭霆：雷系的底蕴，你不懂。'],
                friend: ['许昭霆：你的实力，我勉强认可了。', '许昭霆：下次切磋，我不会手下留情。'],
                close: ['许昭霆：……你是个值得尊敬的对手。', '许昭霆：能和你并肩作战，是我的荣幸。']
            },
            mu_bai: {
                friendly: ['穆白：穆家的事，你最好别插手。', '穆白：冰系魔法，不是谁都能学的。'],
                friend: ['穆白：你的表现，让我有些意外。', '穆白：穆家……也许并不代表一切。'],
                close: ['穆白：你让我看到了不同的可能性。', '穆白：如果有需要，我可以帮你。']
            }
        };

        const pool = messagePools[npcId];
        if (!pool || !pool[tier]) return null;
        const messages = pool[tier];
        let baseMsg = messages[Math.floor(Math.random() * messages.length)];

        // v0.45.0: 25%概率NPC在消息中提及其他NPC（基于NPC-NPC关系）
        if (typeof NPCStateSystem !== 'undefined' && typeof Game !== 'undefined' && Game._npcSchedules && Math.random() < 0.25) {
            const otherNPCs = Object.keys(Game._npcSchedules).filter(id => id !== npcId);
            if (otherNPCs.length > 0) {
                const otherId = otherNPCs[Math.floor(Math.random() * otherNPCs.length)];
                const otherData = typeof DataManager !== 'undefined' ? DataManager.getCharacter(otherId) : null;
                const otherName = otherData ? otherData.name : Game._npcSchedules[otherId].name;
                const rel = NPCStateSystem.getNPCRelationship(npcId, otherId);
                const opinion = rel.opinion || 0;
                if (opinion > 20) {
                    return `${npcName}：说起来，${otherName}最近也挺努力的，你们有空可以多交流。`;
                } else if (opinion < -10) {
                    return `${npcName}：别提${otherName}了，那个人……算了不说了。`;
                } else {
                    return `${npcName}：今天好像看到${otherName}了，也在学校里。`;
                }
            }
        }

        // v0.45.0: 影响力≥10时15%概率NPC引用玩家的影响力
        if (typeof Player !== 'undefined' && Player.getInfluenceTier) {
            const infTier = Player.getInfluenceTier();
            if (infTier.level >= 1 && Math.random() < 0.15) {
                const influenceRefs = {
                    mo_fan: `莫凡：你现在也算是${infTier.name}了，别给我丢脸啊。`,
                    mu_ningxue: `穆宁雪：……${infTier.name}，名副其实。`,
                    tang_yue: `唐月：老师为你感到骄傲，${infTier.name}可不是谁都能做到的。`,
                    zhang_xiaohou: `张小侯：大哥都成${infTier.name}了！太厉害了！`,
                    zhao_manyan: `赵满延：可以啊兄弟，都${infTier.name}了！以后罩着我！`,
                    zhou_min: `周敏：你都已经是${infTier.name}了……真的好厉害。`,
                    xu_zhaoting: `许昭霆：${infTier.name}……哼，我不会输给你的。`,
                    mu_bai: `穆白：${infTier.name}……穆家也开始关注你了。`
                };
                if (influenceRefs[npcId]) return influenceRefs[npcId];
            }
        }

        return baseMsg;
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
        const date = this.getCurrentDate();
        return `${icon} ${date.month}月${date.day}日 ${this.WEEKDAY_NAMES[date.weekday]} · ${period.name} ${hourStr}:00`;
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
