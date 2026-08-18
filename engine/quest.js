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

        // 检查是否已经完成（可重复任务除外）
        if (!quest.isRepeatable && Player.isQuestComplete(questId)) {
            return { success: false, message: '已经完成了这个任务' };
        }

        // 检查前置任务
        if (quest.prerequisites && quest.prerequisites.length > 0) {
            for (const pre of quest.prerequisites) {
                // v1.8.2: 支持 { flag: "xxx" } 格式的前置条件
                if (typeof pre === 'object' && pre.flag) {
                    if (!Player.flags || !Player.flags[pre.flag]) {
                        return { success: false, message: '前置条件未满足' };
                    }
                } else if (!Player.isQuestComplete(pre)) {
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
        
        // 立即检查等级目标（如果玩家等级已经达标，直接更新进度）
        this.updateProgress('level');
        
        return {
            success: true,
            message: `接取任务：${quest.name}`,
            quest: quest
        };
    },

    /**
     * 获取任务追踪数据（用于UI显示）
     * @param {number} maxCount - 最多显示几个任务
     * @returns {Array} 任务追踪数据列表
     */
    getQuestTrackerData(maxCount = 2) {
        const result = [];
        
        for (const activeQuest of Player.activeQuests) {
            const quest = this.getQuest(activeQuest.questId);
            if (!quest) continue;
            
            const objectives = quest.objectives.map((obj, index) => {
                const current = activeQuest.progress[index] || 0;
                const total = obj.count || 1;
                return {
                    description: obj.description,
                    current: current,
                    total: total,
                    complete: current >= total
                };
            });
            
            result.push({
                id: quest.id,
                name: quest.name,
                isMainQuest: quest.isMainQuest || false,
                objectives: objectives
            });
            
            if (result.length >= maxCount) break;
        }
        
        return result;
    },

    /**
     * 更新任务进度
     * @param {string} type - 进度类型：kill/collect/talk/reach/level
     * @param {string} targetId - 目标ID
     * @param {number} amount - 数量
     * @returns {Array} 完成的任务列表（含奖励信息）
     */
    updateProgress(type, targetId, amount = 1) {
        const completedQuests = [];

        Player.activeQuests.forEach(activeQuest => {
            const quest = this.getQuest(activeQuest.questId);
            if (!quest) return;

            quest.objectives.forEach((obj, index) => {
                // 检查目标类型是否匹配
                if (obj.type !== type) return;

                // 等级类型特殊处理：直接用当前等级作为进度
                if (type === 'level') {
                    activeQuest.progress[index] = Math.min(Player.level, obj.count || 1);
                    return;
                }

                // v0.31.0: relationship类型 - 检查NPC好感度是否达到阈值
                if (type === 'relationship') {
                    if (typeof NPCStateSystem !== 'undefined') {
                        const npcState = NPCStateSystem.getNPCState(obj.npcId);
                        const opinion = npcState.opinion || 0;
                        // count是好感度阈值，进度是当前好感度/阈值的百分比（但显示为当前值）
                        activeQuest.progress[index] = Math.min(opinion, obj.count);
                    }
                    return;
                }

                // v0.25.0: cultivate/explore/talk_any类型不需要目标ID，直接计数
                // v1.8.2: investigate类型 - 调查/探索行动计数，可指定地点限制
                if (type === 'cultivate' || type === 'explore' || type === 'talk_any' || type === 'investigate') {
                    // investigate类型如果指定了location，检查当前地点是否匹配
                    if (type === 'investigate' && obj.location) {
                        const currentLoc = Player.currentLocation || '';
                        // 大地图名匹配（如bo_city匹配所有博城子地点）
                        const locMatch = currentLoc === obj.location || 
                                        currentLoc.includes(obj.location) || 
                                        obj.location.includes(currentLoc) ||
                                        obj.location === 'bo_city' || obj.location === 'any';
                        if (!locMatch) return;
                    }
                    activeQuest.progress[index] = Math.min(
                        activeQuest.progress[index] + amount,
                        obj.count
                    );
                    return;
                }

                // 检查目标ID是否匹配
                const targetField = {
                    kill: 'enemyId',
                    collect: 'itemId',
                    talk: 'npcId',
                    reach: 'locationId'
                }[type];

                // v0.25.0: "any"通配符，匹配任意目标
                if (obj[targetField] !== 'any' && obj[targetField] !== targetId) return;

                // 更新进度
                activeQuest.progress[index] = Math.min(
                    activeQuest.progress[index] + amount,
                    obj.count
                );
            });

            // 检查是否完成，如果完成则自动交付
            if (this.isQuestFullyCompleted(activeQuest.questId)) {
                const result = this.completeQuest(activeQuest.questId);
                if (result.success) {
                    completedQuests.push(result);
                }
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

        // 先标记任务完成（从activeQuests中移除），防止发放奖励时触发无限递归
        // v1.8.2: 可重复任务不加入completedQuests，以便再次接取
        if (quest.isRepeatable) {
            const index = Player.activeQuests.findIndex(q => q.questId === questId);
            if (index !== -1) Player.activeQuests.splice(index, 1);
        } else {
            Player.completeQuest(questId);
        }

        // 发放奖励
        const rewards = quest.rewards || {};
        const rewardMessages = [];

        if (rewards.exp) {
            // v0.41.0: 影响力任务经验加成（声名远扬+10%，传奇法师+15%）
            let questExp = rewards.exp;
            if (Player.getInfluenceTier) {
                const infTier = Player.getInfluenceTier();
                const infExpBonus = [0, 0, 0, 0.10, 0.15][infTier.level] || 0;
                if (infExpBonus > 0) {
                    questExp = Math.floor(questExp * (1 + infExpBonus));
                }
            }
            const expResult = Player.gainExp(questExp);
            rewardMessages.push(`获得 ${questExp} 经验${questExp > rewards.exp ? `（影响力加成）` : ''}`);
            if (expResult.levelUps.length > 0) {
                rewardMessages.push(`🎉 升级了！当前等级 ${Player.level}，获得属性点（可分配：${Player.attributePoints}）`);
            }
            if (expResult.newSkills.length > 0) {
                expResult.newSkills.forEach(skillId => {
                    const skill = SkillSystem.getSkill(skillId);
                    if (skill) {
                        rewardMessages.push(`✨ 学会了新技能：${skill.name}！`);
                    }
                });
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

        // v0.57.0: 技能点奖励
        if (rewards.skillPoints) {
            Player.skillPoints = (Player.skillPoints || 0) + rewards.skillPoints;
            rewardMessages.push(`✨ 获得 ${rewards.skillPoints} 技能点`);
        }

        // v0.61.0: 任务完成设置flag（关系驱动任务链）
        if (rewards.setFlag) {
            if (!Player.flags) Player.flags = {};
            Player.flags[rewards.setFlag] = true;
        }

        // v1.8.1: 任务完成发现阴谋调查线索
        if (rewards.discoverClue && typeof InvestigationSystem !== 'undefined') {
            const clues = Array.isArray(rewards.discoverClue) ? rewards.discoverClue : [rewards.discoverClue];
            clues.forEach(clueId => {
                const result = InvestigationSystem.discoverClue(Player, clueId);
                if (result.success) {
                    rewardMessages.push(`🔍 发现线索：${result.clue.name}`);
                }
            });
        }

        // v1.8.2: 任务完成自动设置 quest_id_completed flag，用于对话树解锁后续任务
        if (!Player.flags) Player.flags = {};
        Player.flags[questId + '_completed'] = true;

        // v0.39.0: 任务完成获得影响力
        const influenceGain = rewards.influence || (quest.type === 'main' ? 8 : quest.type === 'personal' ? 4 : 3);
        Player.gainInfluence(influenceGain, '任务完成');
        rewardMessages.push(`🌟 影响力 +${influenceGain}`);

        // 解锁内容
        if (rewards.unlocks && rewards.unlocks.length > 0) {
            rewards.unlocks.forEach(unlock => {
                Player.unlockLocation(unlock);
            });
        }

        // v0.88.0: 不自动接取下一个任务，改为提示玩家主动接取（增加自由度）
        let nextQuestAvailable = null;
        if (quest.nextQuest) {
            const nextQuest = this.getQuest(quest.nextQuest);
            if (nextQuest && !this.isQuestAccepted(quest.nextQuest) && !this.isQuestComplete(quest.nextQuest)) {
                nextQuestAvailable = nextQuest;
                rewardMessages.push(`📜 新任务可接取：${nextQuest.name}（在任务面板中查看）`);
            }
        }
        
        // 特殊任务处理：第二系觉醒任务完成后弹出觉醒界面
        if (questId === 'quest_second_element') {
            setTimeout(() => {
                if (typeof Game !== 'undefined' && Game.showAwakenPanel) {
                    Game.showAwakenPanel();
                }
            }, 1500);
        }

        // 前往明珠任务完成后设置flag
        if (questId === 'quest_journey_to_mingzhu') {
            Player.flags['arrived_mingzhu'] = true;
        }
        
        // 任务成就检查
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const completedCount = Player.completedQuests ? Player.completedQuests.length : 0;
                
                // 第一个任务
                if (completedCount >= 1 && !WorldState.hasAchievement('first_quest')) {
                    const achData = DataAchievements['first_quest'];
                    if (achData) {
                        WorldState.unlockAchievement('first_quest', achData);
                    }
                }
                
                // 任务大师
                if (completedCount >= 20 && !WorldState.hasAchievement('quest_master')) {
                    const achData = DataAchievements['quest_master'];
                    if (achData) {
                        WorldState.unlockAchievement('quest_master', achData);
                    }
                }
            } catch (e) {
                console.warn('[Quest] 任务成就检查失败:', e);
            }
        }

        // 章节系统检查
        if (typeof StoryChapterSystem !== 'undefined') {
            try {
                StoryChapterSystem.update();
            } catch (e) {
                console.warn('[Quest] 章节系统更新失败:', e);
            }
        }

        return {
            success: true,
            message: `任务完成：${quest.name}`,
            rewards: rewardMessages,
            nextQuest: quest.nextQuest || null,
            nextQuestAccepted: nextQuestAccepted
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
     * 获取所有可接取的任务（v1.8.2: 任务面板可接取列表）
     * 遍历所有任务，检查未接取、未完成、前置条件满足、等级条件满足
     */
    getAllAvailableQuests() {
        const available = [];
        const allQuests = DataManager.getAllQuests ? DataManager.getAllQuests() : {};

        for (const questId in allQuests) {
            const quest = allQuests[questId];
            if (!quest) continue;

            // 已接取或已完成的跳过
            if (Player.getActiveQuest(questId)) continue;
            if (Player.isQuestComplete(questId)) continue;

            // 检查前置任务
            if (quest.prerequisites && quest.prerequisites.length > 0) {
                let preMet = true;
                for (const pre of quest.prerequisites) {
                    if (typeof pre === 'object' && pre.flag) {
                        if (!Player.flags || !Player.flags[pre.flag]) { preMet = false; break; }
                    } else if (!Player.isQuestComplete(pre)) {
                        preMet = false; break;
                    }
                }
                if (!preMet) continue;
            }

            // 检查等级条件（如果有trigger.minLevel）
            if (quest.trigger && quest.trigger.minLevel && (Player.level || 1) < quest.trigger.minLevel) continue;

            available.push(quest);
        }

        // 按主线优先、然后按名称排序
        available.sort((a, b) => {
            if (a.isMainQuest && !b.isMainQuest) return -1;
            if (!a.isMainQuest && b.isMainQuest) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

        return available;
    },

    /**
     * 获取所有可接取的任务
     */
    getAvailableQuests(npcId) {
        // 这个需要从 NPC 数据中获取
        return [];
    },
    
    /**
     * 获取某个NPC的所有可接任务
     */
    getAvailableQuestsForNPC(npcId) {
        const available = [];
        for (const questId in this.quests) {
            const quest = this.quests[questId];
            if (quest.giver === npcId && this.canAcceptQuest(questId)) {
                available.push(quest);
            }
        }
        return available;
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
                // v1.8.2: 支持 { flag: "xxx" } 格式
                if (typeof pre === 'object' && pre.flag) {
                    if (!Player.flags || !Player.flags[pre.flag]) return false;
                } else if (!Player.isQuestComplete(pre)) return false;
            }
        }

        return true;
    },

    /**
     * v0.25.0: 检查玩家个人任务触发条件
     * 基于玩家系别/等级/关系/行为自动触发任务
     */
    checkQuestTriggers() {
        const triggered = [];
        const allQuests = DataManager.getAllQuests ? DataManager.getAllQuests() : {};

        for (const questId in allQuests) {
            const quest = allQuests[questId];
            if (!quest.trigger) continue;

            // 已经接取或完成的跳过
            if (Player.getActiveQuest(questId)) continue;
            if (Player.isQuestComplete(questId)) continue;

            const t = quest.trigger;
            let conditionsMet = true;

            // 等级条件
            if (t.minLevel && (Player.level || 1) < t.minLevel) conditionsMet = false;
            if (t.maxLevel && (Player.level || 1) > t.maxLevel) conditionsMet = false;

            // 元素系别条件（检查玩家是否拥有该元素）
            if (t.element && !(Player.elements || []).includes(t.element)) conditionsMet = false;

            // 修炼次数条件
            if (t.minCultivateCount) {
                const cultivateCount = Player._totalCultivateCount || 0;
                if (cultivateCount < t.minCultivateCount) conditionsMet = false;
            }

            // 探索次数条件
            if (t.minExploreCount) {
                const exploreCount = Player._totalExploreCount || 0;
                if (exploreCount < t.minExploreCount) conditionsMet = false;
            }

            // 天数条件
            if (t.minDay && (Player.day || 1) < t.minDay) conditionsMet = false;

            // NPC关系条件
            if (t.minRelationship) {
                for (const npcId in t.minRelationship) {
                    const rel = NPCStateSystem ? NPCStateSystem.getNPCRelationship(npcId, 'player') : null;
                    const opinion = rel?.opinion || 0;
                    if (opinion < t.minRelationship[npcId]) conditionsMet = false;
                }
            }

            // 随机概率条件
            if (t.chance && Math.random() > t.chance) conditionsMet = false;

            // v0.61.0: flag条件（关系驱动任务）
            if (t.requireFlag) {
                const flags = Array.isArray(t.requireFlag) ? t.requireFlag : [t.requireFlag];
                let anyMet = false;
                for (const flag of flags) {
                    if (Player.flags && Player.flags[flag]) { anyMet = true; break; }
                }
                if (!anyMet) conditionsMet = false;
            }
            if (t.notFlag && Player.flags && Player.flags[t.notFlag]) conditionsMet = false;

            if (conditionsMet) {
                const result = this.acceptQuest(questId);
                if (result.success) {
                    triggered.push(quest);
                }
            }
        }

        return triggered;
    }
};
