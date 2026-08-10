/**
 * NPC 状态系统
 * 管理 NPC 的个人状态、好感度、记忆、性格等
 */

const NPCStateSystem = {
    // NPC 状态缓存
    _npcStates: {},

    // 初始化
    init() {
        this._npcStates = {};
        console.log('NPC 状态系统初始化完成');
    },

    // ========== NPC 状态获取 ==========

    /**
     * 获取 NPC 状态
     */
    getNPCState(npcId) {
        if (!this._npcStates[npcId]) {
            this._npcStates[npcId] = this._createDefaultNPCState(npcId);
        }
        return this._npcStates[npcId];
    },

    /**
     * 创建默认 NPC 状态
     */
    _createDefaultNPCState(npcId) {
        const npcData = DataManager.getCharacter(npcId);
        
        return {
            id: npcId,
            
            // 对玩家的关系
            opinion: 0,              // 好感度 (-100 到 100)
            trust: 0,                // 信任度 (-100 到 100)
            respect: 0,              // 敬重度 (-100 到 100)
            fear: 0,                 // 畏惧度 (0 到 100)
            familiarity: 0,          // 熟悉度 (0 到 100)
            
            // 性格（从 NPC 数据读取，没有就用默认）
            personality: npcData?.personality || {
                brave: 0.5,
                kind: 0.5,
                honest: 0.5,
                impulsive: 0.5,
                loyal: 0.5,
                arrogant: 0.5,
                greedy: 0.5,
                curious: 0.5
            },
            
            // 当前状态
            currentLocation: npcData?.location || 'unknown',
            currentMood: 'neutral',  // 当前情绪
            health: 100,
            morale: 100,
            
            // 记忆系统
            memories: [],
            
            // 个人标记
            flags: {
                has_met_player: false
            },
            
            // 已知的玩家信息
            knownPlayerInfo: []
        };
    },

    // ========== 好感度系统 ==========

    /**
     * 改变好感度
     */
    changeOpinion(npcId, amount, reason = '') {
        const state = this.getNPCState(npcId);
        
        // 计算实际变化（受性格和当前关系影响）
        let actualChange = amount;
        
        // 熟悉度越高，变化越慢（已经很了解了，不会轻易改变看法）
        const familiarityFactor = 1 - (state.familiarity / 200);
        actualChange *= familiarityFactor;
        
        // 应用变化
        state.opinion += actualChange;
        state.opinion = Math.max(-100, Math.min(100, state.opinion));
        
        // 增加熟悉度
        if (amount !== 0) {
            state.familiarity += Math.abs(amount) * 0.1;
            state.familiarity = Math.min(100, state.familiarity);
        }
        
        // 记录记忆
        if (Math.abs(amount) >= 5) {
            this.addMemory(npcId, {
                type: amount > 0 ? 'favor' : 'insult',
                content: reason || (amount > 0 ? '玩家做了让我高兴的事' : '玩家做了让我生气的事'),
                effect: { opinion: amount },
                importance: Math.min(1, Math.abs(amount) / 30)
            });
        }
        
        this._save();
        return state.opinion;
    },

    /**
     * 改变信任度
     */
    changeTrust(npcId, amount, reason = '') {
        const state = this.getNPCState(npcId);
        
        state.trust += amount;
        state.trust = Math.max(-100, Math.min(100, state.trust));
        
        // 信任度变化也会影响好感度
        if (amount > 0) {
            state.opinion += amount * 0.3;
        } else {
            state.opinion += amount * 0.5; // 失去信任对好感影响更大
        }
        state.opinion = Math.max(-100, Math.min(100, state.opinion));
        
        this._save();
        return state.trust;
    },

    /**
     * 改变敬重度
     */
    changeRespect(npcId, amount, reason = '') {
        const state = this.getNPCState(npcId);
        
        state.respect += amount;
        state.respect = Math.max(-100, Math.min(100, state.respect));
        
        this._save();
        return state.respect;
    },

    /**
     * 改变畏惧度
     */
    changeFear(npcId, amount, reason = '') {
        const state = this.getNPCState(npcId);
        
        state.fear += amount;
        state.fear = Math.max(0, Math.min(100, state.fear));
        
        // 畏惧会减少信任
        if (amount > 0) {
            state.trust -= amount * 0.2;
            state.trust = Math.max(-100, state.trust);
        }
        
        this._save();
        return state.fear;
    },

    /**
     * 获取关系等级（综合好感、信任、熟悉度）
     */
    getRelationshipLevel(npcId) {
        const state = this.getNPCState(npcId);
        const opinion = state.opinion;
        const trust = state.trust;
        const familiarity = state.familiarity;
        
        // 综合评分（好感占60%，信任占30%，熟悉度占10%）
        const score = opinion * 0.6 + trust * 0.3 + familiarity * 0.1;
        
        // 检查是否有特殊关系标记
        const isLover = state.flags?.is_lover || false;
        const isMentor = state.flags?.is_mentor || false;
        const isDisciple = state.flags?.is_disciple || false;
        const isRival = state.flags?.is_rival || false;
        
        // 特殊关系优先显示
        if (isLover && score >= 80) {
            return { level: 'lover', name: '恋人', color: '#ff69b4', type: 'romance' };
        }
        
        if (isMentor) {
            return { level: 'mentor', name: '恩师', color: '#dda0dd', type: 'mentor' };
        }
        
        if (isDisciple) {
            return { level: 'disciple', name: '弟子', color: '#98fb98', type: 'disciple' };
        }
        
        if (isRival && score < 0) {
            return { level: 'rival_special', name: '宿敌', color: '#dc143c', type: 'rivalry' };
        }
        
        // 普通关系等级
        if (score >= 90) {
            return { level: 'soulmate', name: '知己', color: '#ffd700', type: 'friendship' };
        }
        if (score >= 75) {
            return { level: 'best_friend', name: '挚友', color: '#ffaa00', type: 'friendship' };
        }
        if (score >= 60) {
            return { level: 'close_friend', name: '好友', color: '#ff8800', type: 'friendship' };
        }
        if (score >= 45) {
            return { level: 'friend', name: '朋友', color: '#00dd00', type: 'friendship' };
        }
        if (score >= 30) {
            return { level: 'good_acquaintance', name: '熟络', color: '#44dd44', type: 'friendship' };
        }
        if (score >= 15) {
            return { level: 'acquaintance', name: '熟人', color: '#88dd88', type: 'friendship' };
        }
        if (score >= 5) {
            return { level: 'friendly', name: '友善', color: '#aaddaa', type: 'neutral' };
        }
        if (score >= -5) {
            return { level: 'stranger', name: '陌生', color: '#cccccc', type: 'neutral' };
        }
        if (score >= -15) {
            return { level: 'cold', name: '冷淡', color: '#aaaaaa', type: 'negative' };
        }
        if (score >= -30) {
            return { level: 'unfriendly', name: '不友善', color: '#dd8888', type: 'negative' };
        }
        if (score >= -50) {
            return { level: 'dislike', name: '厌恶', color: '#ff6666', type: 'negative' };
        }
        if (score >= -70) {
            return { level: 'hostile', name: '敌视', color: '#ff4444', type: 'hostility' };
        }
        return { level: 'mortal_enemy', name: '死敌', color: '#ff0000', type: 'hostility' };
    },
    
    /**
     * 获取关系上限（有些 NPC 不能发展成恋人等）
     */
    getRelationshipCap(npcId) {
        const npcData = DataManager.getCharacter(npcId);
        
        // 默认上限
        const defaultCap = {
            maxOpinion: 100,
            maxTrust: 100,
            canRomance: false,
            canBeMentor: false,
            canBeRival: true
        };
        
        // 如果 NPC 有特殊设置，使用特殊设置
        if (npcData?.relationshipCap) {
            return { ...defaultCap, ...npcData.relationshipCap };
        }
        
        return defaultCap;
    },
    
    /**
     * 检查是否可以发展某种关系
     */
    canDevelopRelationship(npcId, relationshipType) {
        const cap = this.getRelationshipCap(npcId);
        const state = this.getNPCState(npcId);
        
        switch (relationshipType) {
            case 'romance':
                // 可以谈恋爱的条件：NPC 允许 + 好感 80+ + 信任 70+ + 熟悉度 50+
                return cap.canRomance && state.opinion >= 80 && state.trust >= 70 && state.familiarity >= 50;
            case 'mentor':
                // 可以拜师的条件：NPC 允许 + 敬重 70+ + 信任 60+
                return cap.canBeMentor && state.respect >= 70 && state.trust >= 60;
            case 'rival':
                // 可以成为宿敌的条件：NPC 允许 + 厌恶 50+ + 敬重 50+（又恨又佩服）
                return cap.canBeRival && state.opinion <= -50 && state.respect >= 50;
            default:
                return false;
        }
    },
    
    /**
     * 建立特殊关系
     */
    establishRelationship(npcId, relationshipType) {
        const state = this.getNPCState(npcId);
        
        if (!state.flags) state.flags = {};
        
        switch (relationshipType) {
            case 'romance':
                state.flags.is_lover = true;
                break;
            case 'mentor':
                state.flags.is_mentor = true;
                break;
            case 'disciple':
                state.flags.is_disciple = true;
                break;
            case 'rival':
                state.flags.is_rival = true;
                break;
        }
        
        this._save();
    },
    
    /**
     * 获取对话语气（根据关系等级）
     */
    getDialogueTone(npcId) {
        const rel = this.getRelationshipLevel(npcId);
        const state = this.getNPCState(npcId);
        
        const tones = {
            soulmate: '亲密无间',
            best_friend: '热情亲切',
            close_friend: '友好热情',
            friend: '友善',
            good_acquaintance: '随和',
            acquaintance: '客气',
            friendly: '礼貌',
            stranger: '平淡',
            cold: '冷淡',
            unfriendly: '不友善',
            dislike: '厌恶',
            hostile: '敌视',
            mortal_enemy: '仇恨',
            lover: '温柔甜蜜',
            mentor: '慈祥庄重',
            disciple: '恭敬',
            rival_special: '针锋相对'
        };
        
        return tones[rel.level] || '平淡';
    },

    // ========== 记忆系统 ==========

    /**
     * 添加记忆
     */
    addMemory(npcId, memoryData) {
        const state = this.getNPCState(npcId);
        
        const memory = {
            id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: memoryData.type || 'general',
            content: memoryData.content || '',
            shortDescription: memoryData.shortDescription || memoryData.content || '',
            effect: memoryData.effect || {},
            importance: memoryData.importance || 0.5,
            timestamp: {
                day: Player.day,
                timeOfDay: Player.timeOfDay
            },
            intensity: 1.0,
            isCore: memoryData.isCore || false,
            tags: memoryData.tags || []
        };
        
        state.memories.push(memory);
        
        // 记忆太多的话，清理不重要的
        if (state.memories.length > 50) {
            state.memories.sort((a, b) => b.importance - a.importance);
            state.memories = state.memories.slice(0, 50);
        }
        
        this._save();
        return memory;
    },

    /**
     * 获取重要记忆
     */
    getImportantMemories(npcId, count = 5) {
        const state = this.getNPCState(npcId);
        
        return state.memories
            .sort((a, b) => (b.importance * b.intensity) - (a.importance * a.intensity))
            .slice(0, count);
    },

    /**
     * 记忆衰减（每天调用一次）
     */
    decayMemories(npcId) {
        const state = this.getNPCState(npcId);
        
        state.memories.forEach(memory => {
            if (!memory.isCore) {
                // 每天衰减一点，重要的衰减慢
                const decayRate = 0.02 * (1 - memory.importance);
                memory.intensity = Math.max(0, memory.intensity - decayRate);
            }
        });
        
        // 移除强度太低的记忆
        state.memories = state.memories.filter(m => m.intensity > 0.05 || m.isCore);
        
        this._save();
    },

    // ========== 标记系统 ==========

    /**
     * 获取 NPC 标记
     */
    getNPCFlag(npcId, flagName) {
        const state = this.getNPCState(npcId);
        return state.flags[flagName] || false;
    },

    /**
     * 设置 NPC 标记
     */
    setNPCFlag(npcId, flagName, value = true) {
        const state = this.getNPCState(npcId);
        state.flags[flagName] = value;
        this._save();
    },

    // ========== 对话辅助 ==========

    /**
     * 获取对话语气（根据好感度和情绪）
     */
    getDialogueMood(npcId) {
        const state = this.getNPCState(npcId);
        const opinion = state.opinion;
        
        if (state.currentMood !== 'neutral') {
            return state.currentMood;
        }
        
        if (opinion >= 70) return 'friendly';
        if (opinion >= 40) return 'warm';
        if (opinion >= 10) return 'casual';
        if (opinion >= -10) return 'neutral';
        if (opinion >= -40) return 'cold';
        return 'hostile';
    },

    /**
     * 检查是否可以对话
     */
    canTalkTo(npcId) {
        const state = this.getNPCState(npcId);
        const npcData = DataManager.getCharacter(npcId);
        
        // 死敌不会和你说话
        if (state.opinion <= -70 && state.fear < 50) {
            return false;
        }
        
        // 太害怕也不会说话
        if (state.fear >= 80) {
            return false;
        }
        
        // 检查 NPC 设定的对话条件
        if (npcData && npcData.dialogueRequirements) {
            const req = npcData.dialogueRequirements;
            
            // 等级要求
            if (req.minLevel && Player.level < req.minLevel) {
                return false;
            }
            
            // 声望要求
            if (req.minReputation) {
                for (const [factionId, minRep] of Object.entries(req.minReputation)) {
                    if (WorldState.getReputation(factionId) < minRep) {
                        return false;
                    }
                }
            }
            
            // 任务要求
            if (req.requiredQuest) {
                if (!Player.completedQuests || !Player.completedQuests.includes(req.requiredQuest)) {
                    return false;
                }
            }
            
            // 好感度要求
            if (req.minOpinion && state.opinion < req.minOpinion) {
                return false;
            }
            
            // 全局标记要求
            if (req.requiredFlag) {
                if (!WorldState.getFlag(req.requiredFlag)) {
                    return false;
                }
            }
        }
        
        return true;
    },
    
    // 获取对话权限提示信息
    getDialogueRequirementHint(npcId) {
        const state = this.getNPCState(npcId);
        const npcData = DataManager.getCharacter(npcId);
        
        if (!npcData || !npcData.dialogueRequirements) return null;
        
        const req = npcData.dialogueRequirements;
        const hints = [];
        
        // 等级要求
        if (req.minLevel && Player.level < req.minLevel) {
            hints.push(`需要等级 ${req.minLevel}`);
        }
        
        // 声望要求
        if (req.minReputation) {
            for (const [factionId, minRep] of Object.entries(req.minReputation)) {
                const currentRep = WorldState.getReputation(factionId);
                if (currentRep < minRep) {
                    const faction = DataManager.getFaction?.(factionId);
                    const factionName = faction?.name || factionId;
                    hints.push(`需要 ${factionName} 声望 ${minRep}`);
                }
            }
        }
        
        // 任务要求
        if (req.requiredQuest) {
            if (!Player.completedQuests || !Player.completedQuests.includes(req.requiredQuest)) {
                hints.push('需要完成特定任务');
            }
        }
        
        // 好感度要求
        if (req.minOpinion && state.opinion < req.minOpinion) {
            hints.push(`需要好感度 ${req.minOpinion}`);
        }
        
        return hints.length > 0 ? hints.join('、') : null;
    },

    // ========== 存档 ==========

    /**
     * 获取存档数据
     */
    getSaveData() {
        return {
            npcStates: this._npcStates
        };
    },

    /**
     * 加载存档数据
     */
    loadSaveData(data) {
        if (!data || !data.npcStates) return;
        this._npcStates = data.npcStates;
    },

    /**
     * 保存
     */
    _save() {
        if (typeof Player !== 'undefined' && Player.save) {
            Player._npcStateDirty = true;
        }
    }
};
