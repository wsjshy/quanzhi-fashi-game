/**
 * 日常系统
 * 每日签到、每日任务、连续签到奖励
 */

export const DailySystem = {
    // 每日任务池
    _dailyQuestPool: [
        {
            id: 'daily_kill_3',
            name: '除魔卫道',
            description: '击败3只妖魔',
            type: 'kill',
            target: 3,
            rewards: { exp: 50, gold: 40 }
        },
        {
            id: 'daily_kill_5',
            name: '猎魔达人',
            description: '击败5只妖魔',
            type: 'kill',
            target: 5,
            rewards: { exp: 80, gold: 70 }
        },
        {
            id: 'daily_cultivate_2',
            name: '勤学苦练',
            description: '修炼2次',
            type: 'cultivate',
            target: 2,
            rewards: { exp: 40, gold: 30 }
        },
        {
            id: 'daily_cultivate_4',
            name: '闭关修炼',
            description: '修炼4次',
            type: 'cultivate',
            target: 4,
            rewards: { exp: 70, gold: 50 }
        },
        {
            id: 'daily_explore_3',
            name: '四处探索',
            description: '探索3次',
            type: 'explore',
            target: 3,
            rewards: { exp: 40, gold: 35 }
        },
        {
            id: 'daily_explore_5',
            name: '冒险先锋',
            description: '探索5次',
            type: 'explore',
            target: 5,
            rewards: { exp: 70, gold: 55 }
        },
        {
            id: 'daily_earn_100',
            name: '生财有道',
            description: '获得100金币',
            type: 'earn_gold',
            target: 100,
            rewards: { exp: 30, gold: 30 }
        },
        {
            id: 'daily_visit_3',
            name: '走南闯北',
            description: '访问3个不同地点',
            type: 'visit',
            target: 3,
            rewards: { exp: 35, gold: 35 }
        },
        {
            id: 'daily_battle_win_3',
            name: '百战不殆',
            description: '赢得3场战斗',
            type: 'battle_win',
            target: 3,
            rewards: { exp: 60, gold: 55 }
        },
        {
            id: 'daily_use_items_2',
            name: '补给充足',
            description: '使用2次物品',
            type: 'use_item',
            target: 2,
            rewards: { exp: 25, gold: 20 }
        }
    ],

    // 签到奖励表（7天循环）
    _signInRewards: [
        { day: 1, gold: 60, items: [] },
        { day: 2, gold: 40, items: [{ itemId: 'health_potion', count: 1 }] },
        { day: 3, gold: 120, items: [] },
        { day: 4, gold: 40, items: [{ itemId: 'mana_potion', count: 1 }] },
        { day: 5, gold: 180, items: [] },
        { day: 6, gold: 60, items: [{ itemId: 'health_potion', count: 1 }] },
        { day: 7, gold: 350, items: [{ itemId: 'magic_crystal', count: 1 }] }
    ],

    /**
     * 初始化日常数据（新游戏时调用）
     */
    initNewGame() {
        Player.dailyData = {
            lastSignInDay: 0,       // 上次签到日期（0=未签过）
            consecutiveDays: 0,     // 连续签到天数
            totalSignInDays: 0,     // 累计签到天数
            dailyQuests: [],        // 今日日常任务列表
            dailyQuestDay: 0,       // 日常任务刷新日期
            todayStats: {           // 今日统计
                kills: 0,
                cultivates: 0,
                explores: 0,
                goldEarned: 0,
                battlesWon: 0,
                itemsUsed: 0,
                visitedLocations: []
            }
        };
    },

    /**
     * 检查并刷新日常任务（每天第一次操作时调用）
     */
    checkDailyReset() {
        if (!Player.dailyData) {
            this.initNewGame();
            return;
        }

        // 如果日常任务不是今天的，刷新
        if (Player.dailyData.dailyQuestDay !== Player.day) {
            this.refreshDailyQuests();
        }

        // 重置今日统计
        Player.dailyData.todayStats = {
            kills: 0,
            cultivates: 0,
            explores: 0,
            goldEarned: 0,
            battlesWon: 0,
            itemsUsed: 0,
            visitedLocations: []
        };
    },

    /**
     * 刷新每日任务（随机选3个）
     */
    refreshDailyQuests() {
        const shuffled = [...this._dailyQuestPool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        Player.dailyData.dailyQuests = selected.map(q => ({
            id: q.id,
            name: q.name,
            description: q.description,
            type: q.type,
            target: q.target,
            progress: 0,
            rewards: q.rewards,
            completed: false,
            claimed: false
        }));
        Player.dailyData.dailyQuestDay = Player.day;
    },

    /**
     * 签到
     * @returns {Object} 签到结果
     */
    signIn() {
        if (!Player.dailyData) {
            this.initNewGame();
        }

        const data = Player.dailyData;

        // 检查今天是否已签到
        if (data.lastSignInDay === Player.day) {
            return { success: false, message: '今天已经签到过了' };
        }

        // 判断连续签到
        if (data.lastSignInDay === Player.day - 1) {
            data.consecutiveDays++;
        } else {
            data.consecutiveDays = 1;
        }

        // 计算今天是第几天（7天循环）
        const rewardIndex = (data.consecutiveDays - 1) % 7;
        const reward = this._signInRewards[rewardIndex];

        // 发放奖励
        const rewardMsgs = [];
        if (reward.gold > 0) {
            Player.gainGold(reward.gold);
            rewardMsgs.push(`金币 +${reward.gold}`);
        }
        if (reward.items && reward.items.length > 0) {
            reward.items.forEach(item => {
                Inventory.addItem(item.itemId, item.count);
                const itemData = DataManager.getItem(item.itemId);
                rewardMsgs.push(`${itemData ? itemData.name : item.itemId} x${item.count}`);
            });
        }

        // 更新签到数据
        data.lastSignInDay = Player.day;
        data.totalSignInDays++;

        // 连续签到7天额外奖励
        let extraMsg = '';
        if (data.consecutiveDays % 7 === 0) {
            Player.gainGold(200);
            Player.gainExp(100);
            extraMsg = ' 连续签到7天额外获得200金币+100经验！';
        }

        Player.save();

        return {
            success: true,
            message: `签到成功！连续签到第${data.consecutiveDays}天`,
            consecutiveDays: data.consecutiveDays,
            rewards: rewardMsgs,
            extraMsg: extraMsg
        };
    },

    /**
     * 检查今天是否已签到
     */
    hasSignedInToday() {
        if (!Player.dailyData) return false;
        return Player.dailyData.lastSignInDay === Player.day;
    },

    /**
     * 获取今日签到奖励预览
     */
    getTodaySignInReward() {
        if (!Player.dailyData) return this._signInRewards[0];
        const nextDay = this.hasSignedInToday() ? Player.dailyData.consecutiveDays + 1 : Player.dailyData.consecutiveDays + 1;
        const index = (nextDay - 1) % 7;
        return this._signInRewards[index];
    },

    /**
     * 更新今日统计
     * @param {string} type - 统计类型
     * @param {number} amount - 数量
     * @param {string} extraData - 额外数据（如地点ID）
     */
    trackActivity(type, amount = 1, extraData = null) {
        if (!Player.dailyData || !Player.dailyData.todayStats) return;

        const stats = Player.dailyData.todayStats;

        switch (type) {
            case 'kill':
                stats.kills += amount;
                this._updateQuestProgress('kill', stats.kills);
                break;
            case 'cultivate':
                stats.cultivates += amount;
                this._updateQuestProgress('cultivate', stats.cultivates);
                break;
            case 'explore':
                stats.explores += amount;
                this._updateQuestProgress('explore', stats.explores);
                break;
            case 'earn_gold':
                stats.goldEarned += amount;
                this._updateQuestProgress('earn_gold', stats.goldEarned);
                break;
            case 'battle_win':
                stats.battlesWon += amount;
                this._updateQuestProgress('battle_win', stats.battlesWon);
                break;
            case 'use_item':
                stats.itemsUsed += amount;
                this._updateQuestProgress('use_item', stats.itemsUsed);
                break;
            case 'visit':
                if (extraData && !stats.visitedLocations.includes(extraData)) {
                    stats.visitedLocations.push(extraData);
                }
                this._updateQuestProgress('visit', stats.visitedLocations.length);
                break;
        }
    },

    /**
     * 更新任务进度
     */
    _updateQuestProgress(questType, value) {
        if (!Player.dailyData || !Player.dailyData.dailyQuests) return;

        Player.dailyData.dailyQuests.forEach(quest => {
            if (quest.type === questType && !quest.completed) {
                quest.progress = Math.min(value, quest.target);
                if (quest.progress >= quest.target) {
                    quest.completed = true;
                }
            }
        });
    },

    /**
     * 领取日常任务奖励
     */
    claimDailyReward(questId) {
        if (!Player.dailyData || !Player.dailyData.dailyQuests) {
            return { success: false, message: '没有日常任务' };
        }

        const quest = Player.dailyData.dailyQuests.find(q => q.id === questId);
        if (!quest) {
            return { success: false, message: '任务不存在' };
        }

        if (!quest.completed) {
            return { success: false, message: '任务还未完成' };
        }

        if (quest.claimed) {
            return { success: false, message: '奖励已经领取过了' };
        }

        // 发放奖励
        const rewardMsgs = [];
        if (quest.rewards.exp) {
            const expResult = Player.gainExp(quest.rewards.exp);
            rewardMsgs.push(`经验 +${quest.rewards.exp}`);
            if (expResult.levelUps.length > 0) {
                rewardMsgs.push(`升级了！当前等级 ${Player.level}`);
            }
        }
        if (quest.rewards.gold) {
            Player.gainGold(quest.rewards.gold);
            rewardMsgs.push(`金币 +${quest.rewards.gold}`);
        }

        quest.claimed = true;
        Player.save();

        return {
            success: true,
            message: `任务完成：${quest.name}`,
            rewards: rewardMsgs
        };
    },

    /**
     * 获取日常任务列表（用于UI显示）
     */
    getDailyQuests() {
        if (!Player.dailyData) return [];
        return Player.dailyData.dailyQuests || [];
    },

    /**
     * 获取签到数据
     */
    getSignInData() {
        if (!Player.dailyData) {
            return { consecutiveDays: 0, totalSignInDays: 0, hasSignedIn: false };
        }
        return {
            consecutiveDays: Player.dailyData.consecutiveDays,
            totalSignInDays: Player.dailyData.totalSignInDays,
            hasSignedIn: this.hasSignedInToday(),
            todayReward: this.getTodaySignInReward()
        };
    },

    /**
     * 获取已完成但未领取奖励的任务数
     */
    getUnclaimedCount() {
        if (!Player.dailyData || !Player.dailyData.dailyQuests) return 0;
        return Player.dailyData.dailyQuests.filter(q => q.completed && !q.claimed).length;
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.DailySystem = DailySystem;
