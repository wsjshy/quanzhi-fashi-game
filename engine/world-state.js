/**
 * 世界状态系统
 * 管理全局世界状态、势力声望、大事件记录
 */

const WorldState = {
    // 全局标记
    globalFlags: {},

    // 势力声望
    reputations: {},

    // 已发生的世界事件
    worldEvents: [],

    // 进行中的事件链
    activeEventChains: [],

    // 已完成的事件链
    completedEventChains: [],

    // 玩家已知的信息
    knownInfo: [],
    
    // NPC 间的关系矩阵
    npcRelationships: {},

    // 区域状态
    regionStates: {},

    // 玩家成就
    achievements: [],

    // 初始化
    init() {
        // 初始化默认值
        this.globalFlags = {};
        this.reputations = {};
        this.worldEvents = [];
        this.activeEventChains = [];
        this.completedEventChains = [];
        this.knownInfo = [];
        this.npcRelationships = {};
        this.regionStates = {};
        this.achievements = [];

        // 初始化默认势力声望
        if (DataManager.getFactions) {
            const factions = DataManager.getFactions();
            for (const [factionId, factionData] of Object.entries(factions)) {
                this.reputations[factionId] = 0;
            }
        }
        
        // 初始化默认 NPC 间关系
        this._initDefaultNPCRrelationships();

        console.log('世界状态系统初始化完成');
    },
    
    /**
     * 初始化默认 NPC 间关系（从数据读取）
     */
    _initDefaultNPCRrelationships() {
        const characters = DataManager.getAllCharacters();
        
        for (const [charId, charData] of Object.entries(characters)) {
            if (charData.relationships) {
                for (const [targetId, relData] of Object.entries(charData.relationships)) {
                    this.setNPCRrelationship(charId, targetId, {
                        opinion: relData.opinion || 0,
                        trust: relData.trust || 0,
                        type: relData.type || 'neutral',
                        label: relData.label || ''
                    });
                }
            }
        }
    },

    // ========== 全局标记 ==========

    /**
     * 获取全局标记
     */
    getFlag(flagName) {
        return this.globalFlags[flagName] || false;
    },

    /**
     * 设置全局标记
     */
    setFlag(flagName, value = true) {
        this.globalFlags[flagName] = value;
        this.save();
    },

    /**
     * 检查多个标记（全部满足）
     */
    checkFlags(flags) {
        if (!flags) return true;
        for (const [key, value] of Object.entries(flags)) {
            if (this.getFlag(key) !== value) {
                return false;
            }
        }
        return true;
    },

    // ========== 势力声望 ==========

    /**
     * 获取声望
     */
    getReputation(factionId) {
        return this.reputations[factionId] || 0;
    },

    /**
     * 增加/减少声望
     */
    changeReputation(factionId, amount) {
        if (!this.reputations[factionId]) {
            this.reputations[factionId] = 0;
        }
        this.reputations[factionId] += amount;
        
        // 限制范围
        this.reputations[factionId] = Math.max(-100, Math.min(100, this.reputations[factionId]));
        
        this.save();
        return this.reputations[factionId];
    },

    /**
     * 获取声望等级
     */
    getReputationLevel(factionId) {
        const rep = this.getReputation(factionId);
        
        if (rep >= 80) return { level: 'worship', name: '崇拜', color: '#ffd700' };
        if (rep >= 50) return { level: 'respected', name: '尊敬', color: '#00ff00' };
        if (rep >= 20) return { level: 'friendly', name: '友好', color: '#88ff88' };
        if (rep >= 0) return { level: 'neutral', name: '中立', color: '#cccccc' };
        if (rep >= -20) return { level: 'cold', name: '冷淡', color: '#aaaaaa' };
        if (rep >= -50) return { level: 'hostile', name: '敌对', color: '#ff6666' };
        return { level: 'hated', name: '仇恨', color: '#ff0000' };
    },

    // ========== 区域状态 ==========

    /**
     * 获取区域状态
     * @param {string} regionId - 区域ID
     * @returns {object} 区域状态
     */
    getRegionState(regionId) {
        if (!this.regionStates[regionId]) {
            // 初始化默认区域状态
            this.regionStates[regionId] = {
                safety: 50,      // 安全度 0-100
                prosperity: 50,  // 繁荣度 0-100
                demonActivity: 50, // 妖魔活跃度 0-100
                publicOpinion: 50, // 舆论风向 0-100
                lastUpdated: 0   // 最后更新天数
            };
        }
        return this.regionStates[regionId];
    },

    /**
     * 修改区域状态
     * @param {string} regionId - 区域ID
     * @param {string} stat - 状态类型（safety/prosperity/demonActivity/publicOpinion）
     * @param {number} amount - 变化量
     * @returns {number} 新值
     */
    changeRegionState(regionId, stat, amount) {
        const state = this.getRegionState(regionId);
        state[stat] = (state[stat] || 0) + amount;
        state[stat] = Math.max(0, Math.min(100, state[stat]));
        state.lastUpdated = Player.day;
        this.save();
        return state[stat];
    },

    /**
     * 获取区域安全等级
     * @param {string} regionId - 区域ID
     * @returns {object} 安全等级
     */
    getSafetyLevel(regionId) {
        const safety = this.getRegionState(regionId).safety;
        if (safety >= 80) return { level: 'safe', name: '安全', color: '#00ff00', desc: '治安良好，妖魔稀少' };
        if (safety >= 60) return { level: 'caution', name: ' caution', color: '#88ff88', desc: '偶有妖魔出没，需注意安全' };
        if (safety >= 40) return { level: 'warning', name: '危险', color: '#ffcc00', desc: '妖魔频繁出没，建议组队' };
        if (safety >= 20) return { level: 'danger', name: '极度危险', color: '#ff6600', desc: '妖魔横行，不建议单独行动' };
        return { level: 'disaster', name: '灾难', color: '#ff0000', desc: '妖魔占领区域，人类无法生存' };
    },

    // ========== 玩家成就 ==========

    /**
     * 获取所有成就
     * @returns {array} 成就列表
     */
    getAchievements() {
        return this.achievements || [];
    },

    /**
     * 解锁成就
     * @param {string} achievementId - 成就ID
     * @param {object} achievementData - 成就数据
     * @returns {boolean} 是否新解锁
     */
    unlockAchievement(achievementId, achievementData = {}) {
        if (!this.achievements) {
            this.achievements = [];
        }

        // 检查是否已经解锁
        if (this.achievements.find(a => a.id === achievementId)) {
            return false;
        }

        // 添加成就
        const achievement = {
            id: achievementId,
            name: achievementData.name || achievementId,
            description: achievementData.description || '',
            rarity: achievementData.rarity || 'common',
            unlockedAt: {
                day: Player.day,
                hour: Player.hour
            },
            ...achievementData
        };

        this.achievements.push(achievement);
        this.save();

        // 发放奖励
        if (achievementData.reward) {
            try {
                if (achievementData.reward.gold && typeof Player !== 'undefined') {
                    Player.gold += achievementData.reward.gold;
                }
            } catch (e) {
                console.warn('[WorldState] 成就奖励发放失败:', e);
            }
        }

        // 显示提示
        // v0.46.1: 批量显示成就，避免连续弹窗
        if (typeof UI !== 'undefined' && UI.showMessage) {
            if (!this._pendingAchievements) this._pendingAchievements = [];
            this._pendingAchievements.push(achievement);
            if (this._achievementTimer) clearTimeout(this._achievementTimer);
            this._achievementTimer = setTimeout(() => {
                const pending = this._pendingAchievements;
                this._pendingAchievements = [];
                this._achievementTimer = null;
                if (pending.length === 1) {
                    const a = pending[0];
                    let msg = `🏆 成就解锁：${a.name}`;
                    if (a.reward?.gold) msg += `（奖励：${a.reward.gold}金币）`;
                    UI.showMessage(msg);
                } else {
                    let msg = `🏆 解锁 ${pending.length} 个成就：\n`;
                    let totalGold = 0;
                    for (const a of pending) {
                        msg += `· ${a.name}`;
                        if (a.reward?.gold) {
                            msg += `（${a.reward.gold}金币）`;
                            totalGold += a.reward.gold;
                        }
                        msg += '\n';
                    }
                    if (totalGold > 0) msg += `\n共获得 ${totalGold} 金币`;
                    UI.showMessage(msg);
                }
            }, 500);
        }

        return true;
    },

    /**
     * 检查是否已解锁成就
     * @param {string} achievementId - 成就ID
     * @returns {boolean} 是否已解锁
     */
    hasAchievement(achievementId) {
        if (!this.achievements) return false;
        return this.achievements.some(a => a.id === achievementId);
    },

    // ========== 世界事件 ==========

    /**
     * 记录世界事件
     */
    recordWorldEvent(eventId, eventData = {}) {
        const event = {
            id: eventId,
            timestamp: {
                day: Player.day,
                timeOfDay: Player.timeOfDay
            },
            data: eventData
        };
        this.worldEvents.push(event);
        this.save();
    },

    /**
     * 检查是否发生过某事件
     */
    hasEventHappened(eventId) {
        return this.worldEvents.some(e => e.id === eventId);
    },

    // ========== 事件链系统 ==========

    /**
     * 开始事件链
     */
    startEventChain(chainId) {
        if (this.isEventChainActive(chainId) || this.isEventChainCompleted(chainId)) {
            return false;
        }

        const chainData = {
            id: chainId,
            currentStage: 'start',
            startTime: {
                day: Player.day,
                timeOfDay: Player.timeOfDay
            },
            flags: {},
            choices: []
        };

        this.activeEventChains.push(chainData);
        this.save();
        return true;
    },

    /**
     * 推进事件链到下一个阶段
     */
    advanceEventChain(chainId, stageId, stageData = {}) {
        const chain = this.activeEventChains.find(c => c.id === chainId);
        if (!chain) return false;

        chain.currentStage = stageId;
        chain.lastAdvanceTime = {
            day: Player.day,
            timeOfDay: Player.timeOfDay
        };

        // 记录阶段数据
        if (Object.keys(stageData).length > 0) {
            chain.stageData = chain.stageData || {};
            chain.stageData[stageId] = stageData;
        }

        this.save();
        return true;
    },

    /**
     * 设置事件链标记
     */
    setEventChainFlag(chainId, flag, value) {
        const chain = this.activeEventChains.find(c => c.id === chainId);
        if (!chain) return false;

        chain.flags[flag] = value;
        this.save();
        return true;
    },

    /**
     * 获取事件链标记
     */
    getEventChainFlag(chainId, flag) {
        const chain = this.activeEventChains.find(c => c.id === chainId);
        if (!chain) return null;

        return chain.flags[flag] !== undefined ? chain.flags[flag] : null;
    },

    /**
     * 记录玩家选择
     */
    recordEventChainChoice(chainId, choiceId, choiceData = {}) {
        const chain = this.activeEventChains.find(c => c.id === chainId);
        if (!chain) return false;

        chain.choices.push({
            id: choiceId,
            timestamp: {
                day: Player.day,
                timeOfDay: Player.timeOfDay
            },
            data: choiceData
        });

        this.save();
        return true;
    },

    /**
     * 完成事件链
     */
    completeEventChain(chainId, endingId = 'default', endingData = {}) {
        const chainIndex = this.activeEventChains.findIndex(c => c.id === chainId);
        if (chainIndex === -1) return false;

        const chain = this.activeEventChains[chainIndex];
        const completedChain = {
            ...chain,
            ending: endingId,
            endingData: endingData,
            endTime: {
                day: Player.day,
                timeOfDay: Player.timeOfDay
            }
        };

        this.activeEventChains.splice(chainIndex, 1);
        this.completedEventChains.push(completedChain);
        this.save();
        return true;
    },

    /**
     * 获取事件链状态
     */
    getEventChainState(chainId) {
        // 先检查进行中的
        const active = this.activeEventChains.find(c => c.id === chainId);
        if (active) {
            return {
                active: true,
                completed: false,
                currentStage: active.currentStage,
                data: active
            };
        }

        // 再检查已完成的
        const completed = this.completedEventChains.find(c => c.id === chainId);
        if (completed) {
            return {
                active: false,
                completed: true,
                ending: completed.ending,
                data: completed
            };
        }

        // 未开始
        return {
            active: false,
            completed: false,
            currentStage: null,
            data: null
        };
    },

    /**
     * 检查事件链是否进行中
     */
    isEventChainActive(chainId) {
        return this.activeEventChains.some(c => c.id === chainId);
    },

    /**
     * 检查事件链是否已完成
     */
    isEventChainCompleted(chainId) {
        return this.completedEventChains.some(c => c.id === chainId);
    },

    /**
     * 获取事件链的当前阶段
     */
    getEventChainCurrentStage(chainId) {
        const chain = this.activeEventChains.find(c => c.id === chainId);
        return chain ? chain.currentStage : null;
    },

    // ========== 信息系统 ==========

    /**
     * 获得信息
     */
    gainInfo(infoId) {
        if (!this.knownInfo.includes(infoId)) {
            this.knownInfo.push(infoId);
            this.save();
            return true;
        }
        return false;
    },

    /**
     * 是否知道某信息
     */
    knowsInfo(infoId) {
        return this.knownInfo.includes(infoId);
    },
    
    // ========== NPC 间关系系统 ==========
    
    /**
     * 获取两个 NPC 之间的关系
     */
    getNPCRrelationship(npc1Id, npc2Id) {
        // 确保键存在
        if (!this.npcRelationships[npc1Id]) {
            this.npcRelationships[npc1Id] = {};
        }
        if (!this.npcRelationships[npc1Id][npc2Id]) {
            // 默认关系
            this.npcRelationships[npc1Id][npc2Id] = {
                opinion: 0,
                trust: 0,
                type: 'neutral',
                label: '',
                history: []
            };
        }
        return this.npcRelationships[npc1Id][npc2Id];
    },
    
    /**
     * 设置两个 NPC 之间的关系
     */
    setNPCRrelationship(npc1Id, npc2Id, relationshipData) {
        if (!this.npcRelationships[npc1Id]) {
            this.npcRelationships[npc1Id] = {};
        }
        
        this.npcRelationships[npc1Id][npc2Id] = {
            opinion: relationshipData.opinion || 0,
            trust: relationshipData.trust || 0,
            type: relationshipData.type || 'neutral',
            label: relationshipData.label || '',
            history: relationshipData.history || []
        };
        
        this.save();
    },
    
    /**
     * 改变两个 NPC 之间的好感度
     */
    changeNPCOpinion(npc1Id, npc2Id, amount, reason = '') {
        const rel = this.getNPCRrelationship(npc1Id, npc2Id);
        
        rel.opinion += amount;
        rel.opinion = Math.max(-100, Math.min(100, rel.opinion));
        
        // 记录历史
        if (reason) {
            rel.history.push({
                day: Player.day,
                type: 'opinion_change',
                amount: amount,
                reason: reason
            });
        }
        
        // 自动更新关系类型
        this._updateNPCRrelationshipType(npc1Id, npc2Id);
        
        this.save();
    },
    
    /**
     * 更新 NPC 间关系类型
     */
    _updateNPCRrelationshipType(npc1Id, npc2Id) {
        const rel = this.getNPCRrelationship(npc1Id, npc2Id);
        const opinion = rel.opinion;
        
        if (opinion >= 90) {
            rel.type = 'soulmate';
            rel.label = '知己';
        } else if (opinion >= 75) {
            rel.type = 'best_friend';
            rel.label = '挚友';
        } else if (opinion >= 60) {
            rel.type = 'close_friend';
            rel.label = '好友';
        } else if (opinion >= 40) {
            rel.type = 'friend';
            rel.label = '朋友';
        } else if (opinion >= 20) {
            rel.type = 'acquaintance';
            rel.label = '熟人';
        } else if (opinion >= -20) {
            rel.type = 'neutral';
            rel.label = '普通';
        } else if (opinion >= -40) {
            rel.type = 'dislike';
            rel.label = '不和';
        } else if (opinion >= -60) {
            rel.type = 'hostile';
            rel.label = '敌对';
        } else {
            rel.type = 'enemy';
            rel.label = '死敌';
        }
        
        // 特殊关系类型覆盖
        if (rel.specialType) {
            rel.type = rel.specialType;
        }
    },
    
    /**
     * 设置特殊关系类型（恋人、师徒、竞争对手等）
     */
    setSpecialRelationship(npc1Id, npc2Id, specialType, label) {
        const rel = this.getNPCRrelationship(npc1Id, npc2Id);
        rel.specialType = specialType;
        rel.label = label || rel.label;
        rel.type = specialType;
        
        this.save();
    },
    
    /**
     * 获取某个 NPC 的所有关系
     */
    getAllRelationshipsOfNPC(npcId) {
        if (!this.npcRelationships[npcId]) {
            return {};
        }
        return this.npcRelationships[npcId];
    },
    
    /**
     * 检查两个 NPC 是否是某种关系
     */
    isRelationshipType(npc1Id, npc2Id, type) {
        const rel = this.getNPCRrelationship(npc1Id, npc2Id);
        return rel.type === type;
    },
    
    /**
     * 玩家影响 NPC 间关系（玩家的行为会影响 NPC 之间的关系）
     */
    playerInfluencesNPCRrelationship(playerAction, npc1Id, npc2Id) {
        // 玩家的行为会影响 NPC 之间的关系
        // 比如：玩家在莫凡面前说穆宁雪的好话，莫凡对穆宁雪的好感会增加
        // 比如：玩家帮穆宁雪做了一件事，莫凡会对玩家产生复杂的感情
        
        // 这是一个复杂的系统，后续会不断扩充
        // 先实现基础版本
        
        const rel = this.getNPCRrelationship(npc1Id, npc2Id);
        
        // 根据玩家行为类型来影响
        switch (playerAction.type) {
            case 'praise':
                // 玩家在 NPC1 面前表扬 NPC2
                this.changeNPCOpinion(npc1Id, npc2Id, playerAction.amount || 2, '玩家提及');
                break;
            case 'badmouth':
                // 玩家在 NPC1 面前说 NPC2 坏话
                this.changeNPCOpinion(npc1Id, npc2Id, -(playerAction.amount || 2), '玩家提及');
                break;
            case 'help':
                // 玩家帮助了 NPC2，NPC1 知道了
                if (rel.opinion > 0) {
                    // 如果 NPC1 和 NPC2 关系好，NPC1 会对玩家有好感
                    // （这部分在 NPCStateSystem 里处理）
                } else if (rel.opinion < 0) {
                    // 如果 NPC1 和 NPC2 关系不好，NPC1 可能会对玩家有负面看法
                }
                break;
            case 'compete':
                // 玩家和 NPC2 竞争，NPC1 的态度
                break;
        }
    },

    // ========== 条件检查 ==========

    /**
     * 检查条件（综合检查所有状态）
     * @param {Object} conditions - 条件对象
     * @returns {boolean} 是否满足
     */
    checkConditions(conditions) {
        if (!conditions) return true;

        // 全局标记
        if (conditions.flags && !this.checkFlags(conditions.flags)) {
            return false;
        }

        // hasFlag 条件（单个标记字符串或标记数组）
        if (conditions.hasFlag) {
            const flagsToCheck = Array.isArray(conditions.hasFlag) ? conditions.hasFlag : [conditions.hasFlag];
            for (const flag of flagsToCheck) {
                // 同时检查 WorldState.globalFlags 和 Player.flags
                const hasIt = (this.globalFlags && this.globalFlags[flag]) ||
                              (typeof Player !== 'undefined' && Player.flags && Player.flags[flag]);
                if (!hasIt) {
                    return false;
                }
            }
        }

        // 没有标记
        if (conditions.notFlags) {
            for (const flag of conditions.notFlags) {
                if (this.getFlag(flag)) {
                    return false;
                }
            }
        }

        // 声望条件
        if (conditions.minReputation) {
            for (const [factionId, minValue] of Object.entries(conditions.minReputation)) {
                if (this.getReputation(factionId) < minValue) {
                    return false;
                }
            }
        }

        if (conditions.maxReputation) {
            for (const [factionId, maxValue] of Object.entries(conditions.maxReputation)) {
                if (this.getReputation(factionId) > maxValue) {
                    return false;
                }
            }
        }

        // 已知信息
        if (conditions.knownInfo) {
            for (const infoId of conditions.knownInfo) {
                if (!this.knowsInfo(infoId)) {
                    return false;
                }
            }
        }

        // 发生过的事件
        if (conditions.hasEvent) {
            for (const eventId of conditions.hasEvent) {
                if (!this.hasEventHappened(eventId)) {
                    return false;
                }
            }
        }

        // 玩家等级
        if (conditions.minLevel && Player.level < conditions.minLevel) {
            return false;
        }

        if (conditions.maxLevel && Player.level > conditions.maxLevel) {
            return false;
        }

        // 天数
        if (conditions.minDay && Player.day < conditions.minDay) {
            return false;
        }

        if (conditions.maxDay && Player.day > conditions.maxDay) {
            return false;
        }

        // 时段
        if (conditions.timeOfDay) {
            const times = Array.isArray(conditions.timeOfDay) ? conditions.timeOfDay : [conditions.timeOfDay];
            if (!times.includes(Player.timeOfDay)) {
                return false;
            }
        }

        // 物品
        if (conditions.hasItem) {
            const { itemId, count = 1 } = conditions.hasItem;
            if (Inventory.getItemCount(itemId) < count) {
                return false;
            }
        }

        // 任务
        if (conditions.hasQuest) {
            if (!Player.getActiveQuest(conditions.hasQuest)) {
                return false;
            }
        }

        if (conditions.completedQuest) {
            if (!Player.isQuestComplete(conditions.completedQuest)) {
                return false;
            }
        }

        // OR 条件（任一满足）
        if (conditions.or) {
            return conditions.or.some(cond => this.checkConditions(cond));
        }

        // AND 条件（全部满足）
        if (conditions.and) {
            return conditions.and.every(cond => this.checkConditions(cond));
        }

        return true;
    },

    // ========== 存档 ==========

    /**
     * 获取存档数据
     */
    getSaveData() {
        return {
            globalFlags: this.globalFlags,
            reputations: this.reputations,
            worldEvents: this.worldEvents,
            activeEventChains: this.activeEventChains,
            completedEventChains: this.completedEventChains,
            knownInfo: this.knownInfo,
            npcRelationships: this.npcRelationships,
            regionStates: this.regionStates,
            achievements: this.achievements
        };
    },

    /**
     * 加载存档数据
     */
    loadSaveData(data) {
        if (!data) return;
        
        this.globalFlags = data.globalFlags || {};
        this.reputations = data.reputations || {};
        this.worldEvents = data.worldEvents || [];
        this.activeEventChains = data.activeEventChains || [];
        this.completedEventChains = data.completedEventChains || [];
        this.knownInfo = data.knownInfo || [];
        this.npcRelationships = data.npcRelationships || {};
        this.regionStates = data.regionStates || {};
        this.achievements = data.achievements || [];
    },

    /**
     * 保存（通过 Player 保存）
     */
    save() {
        // 触发保存
        if (typeof Player !== 'undefined' && Player.save) {
            // Player.save 会保存整个游戏状态
            // 这里只标记需要保存
            Player._worldStateDirty = true;
        }
    }
};
