/**
 * 任务系统
 * 管理任务接取、进度追踪、完成奖励
 */

const QuestSystem = {
    // 任务数据缓存
    _questData: {},

    /**
     * 获取任务数据
     */
    getQuest(questId) {
        if (this._questData[questId]) {
            return this._questData[questId];
        }
        
        const quest = DataManager.getQuest(questId);
        if (quest) {
            this._questData[questId] = quest;
        }
        return quest;
    },

    /**
     * 接取任务
     */
    acceptQuest(questId) {
        const quest = this.getQuest(questId);
        if (!quest) return { success: false, message: '任务不存在' };

        // 检查是否已经接取
        if (Player.getActiveQuest(questId)) {
            return { success: false, message: '已经接取了这个任务' };
        }

        // 检查是否已经完成
        if (Player.isQuestComplete(questId)) {
            return { success: false, message: '已经完成了这个任务' };
        }

        // 检查前置任务
        if (quest.prerequisites && quest.prerequisites.length > 0) {
            for (const pre of quest.prerequisites) {
                if (!Player.isQuestComplete(pre)) {
                    return { success: false, message: '前置任务未完成' };
                }
            }
        }

        // 接取任务
        const activeQuest = {
            questId: questId,
            progress: quest.objectives.map(() => 0),
            startTime: Player.day
        };
        
        Player.activeQuests.push(activeQuest);
        
        return {
            success: true,
            message: `接取任务：${quest.name}`,
            quest: quest
        };
    },

    /**
     * 更新任务进度
     * @param {string} type - 进度类型：kill/collect/talk/reach
     * @param {string} targetId - 目标ID
     * @param {number} amount - 数量
     */
    updateProgress(type, targetId, amount = 1) {
        const completedQuests = [];

        Player.activeQuests.forEach(activeQuest => {
            const quest = this.getQuest(activeQuest.questId);
            if (!quest) return;

            quest.objectives.forEach((obj, index) => {
                // 检查目标类型是否匹配
                if (obj.type !== type) return;
                
                // 检查目标ID是否匹配
                const targetField = {
                    kill: 'enemyId',
                    collect: 'itemId',
                    talk: 'npcId',
                    reach: 'locationId'
                }[type];
                
                if (obj[targetField] !== targetId) return;

                // 更新进度
                activeQuest.progress[index] = Math.min(
                    activeQuest.progress[index] + amount,
                    obj.count
                );
            });

            // 检查是否完成
            if (this.isQuestFullyCompleted(activeQuest.questId)) {
                completedQuests.push(activeQuest.questId);
            }
        });

        return completedQuests;
    },

    /**
     * 检查任务是否全部完成
     */
    isQuestFullyCompleted(questId) {
        const activeQuest = Player.getActiveQuest(questId);
        if (!activeQuest) return false;

        const quest = this.getQuest(questId);
        if (!quest) return false;

        return quest.objectives.every((obj, index) => 
            activeQuest.progress[index] >= obj.count
        );
    },

    /**
     * 交付任务（领取奖励）
     */
    completeQuest(questId) {
        if (!this.isQuestFullyCompleted(questId)) {
            return { success: false, message: '任务还未完成' };
        }

        const quest = this.getQuest(questId);
        if (!quest) return { success: false, message: '任务不存在' };

        // 发放奖励
        const rewards = quest.rewards || {};
        const rewardMessages = [];

        if (rewards.exp) {
            const levelUps = Player.gainExp(rewards.exp);
            rewardMessages.push(`获得 ${rewards.exp} 经验`);
            if (levelUps.length > 0) {
                rewardMessages.push(`升级了！当前等级 ${Player.level}`);
            }
        }

        if (rewards.gold) {
            Player.gainGold(rewards.gold);
            rewardMessages.push(`获得 ${rewards.gold} 金币`);
        }

        if (rewards.items && rewards.items.length > 0) {
            rewards.items.forEach(item => {
                Inventory.addItem(item.itemId, item.count);
                const itemData = Inventory.getItem(item.itemId);
                rewardMessages.push(`获得 ${itemData ? itemData.name : item.itemId} x${item.count}`);
            });
        }

        // 声望奖励
        if (rewards.reputation) {
            for (const [factionId, amount] of Object.entries(rewards.reputation)) {
                WorldState.changeReputation(factionId, amount);
                const faction = DataManager.getFaction(factionId);
                const repLevel = WorldState.getReputationLevel(factionId);
                rewardMessages.push(`${faction ? faction.name : factionId} 声望 ${amount >= 0 ? '+' : ''}${amount}（${repLevel.name}）`);
            }
        }

        // 标记任务完成
        Player.completeQuest(questId);

        // 解锁内容
        if (rewards.unlocks && rewards.unlocks.length > 0) {
            rewards.unlocks.forEach(unlock => {
                Player.unlockLocation(unlock);
            });
        }

        return {
            success: true,
            message: `任务完成：${quest.name}`,
            rewards: rewardMessages,
            nextQuest: quest.nextQuest || null
        };
    },

    /**
     * 获取任务进度描述
     */
    getQuestProgressText(questId) {
        const activeQuest = Player.getActiveQuest(questId);
        const quest = this.getQuest(questId);
        
        if (!activeQuest || !quest) return '';

        return quest.objectives.map((obj, index) => {
            const current = activeQuest.progress[index];
            const total = obj.count;
            const done = current >= total;
            return `${done ? '✅' : '⬜'} ${obj.description} (${current}/${total})`;
        }).join('\n');
    },

    /**
     * 获取所有可接取的任务
     */
    getAvailableQuests(npcId) {
        // 这个需要从 NPC 数据中获取
        return [];
    },

    /**
     * 检查是否可以接取任务
     */
    canAcceptQuest(questId) {
        const quest = this.getQuest(questId);
        if (!quest) return false;

        // 已经接取或完成的不能再接
        if (Player.getActiveQuest(questId)) return false;
        if (Player.isQuestComplete(questId)) return false;

        // 检查前置任务
        if (quest.prerequisites && quest.prerequisites.length > 0) {
            for (const pre of quest.prerequisites) {
                if (!Player.isQuestComplete(pre)) return false;
            }
        }

        return true;
    }
};
