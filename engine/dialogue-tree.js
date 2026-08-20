/**
 * 对话树系统
 * 管理多层对话、条件选项、对话效果
 */

const DialogueTree = {
    // 对话数据缓存
    _dialogueData: {},

    // 当前对话状态
    currentNPC: null,
    currentNode: null,
    dialogueHistory: [],

    // v2.9.3: 已读选项记录（每个NPC的已读选项ID集合）
    _readChoices: {},

    // 初始化
    init() {
        this._dialogueData = {};
        this.currentNPC = null;
        this.currentNode = null;
        this.dialogueHistory = [];
        this._readChoices = {};
        console.log('对话树系统初始化完成');
    },

    // ========== 已读选项管理（v2.9.3） ==========

    /**
     * 加载玩家的已读选项记录
     */
    loadReadChoices() {
        if (typeof Player !== 'undefined' && Player.readDialogueChoices) {
            this._readChoices = Player.readDialogueChoices;
        }
    },

    /**
     * 保存已读选项记录到玩家
     */
    saveReadChoices() {
        if (typeof Player !== 'undefined') {
            Player.readDialogueChoices = this._readChoices;
        }
    },

    /**
     * 检查某个NPC的某个选项是否已读
     */
    isChoiceRead(npcId, choiceId) {
        if (!this._readChoices[npcId]) return false;
        return this._readChoices[npcId].has(choiceId);
    },

    /**
     * 标记某个选项为已读
     */
    markChoiceRead(npcId, choiceId) {
        if (!this._readChoices[npcId]) {
            this._readChoices[npcId] = new Set();
        }
        this._readChoices[npcId].add(choiceId);
        this.saveReadChoices();
    },

    // ========== 对话数据加载 ==========

    /**
     * 获取 NPC 的对话数据
     */
    getDialogueData(npcId) {
        if (this._dialogueData[npcId]) {
            return this._dialogueData[npcId];
        }

        // 从 DataManager 加载
        const npcData = DataManager.getCharacter(npcId);
        if (npcData && npcData.dialogueTree) {
            this._dialogueData[npcId] = npcData.dialogueTree;
            return this._dialogueData[npcId];
        }

        // 没有对话树，生成默认的
        this._dialogueData[npcId] = this._generateDefaultDialogue(npcData);
        return this._dialogueData[npcId];
    },

    /**
     * 生成默认对话（没有对话树数据时用）
     */
    _generateDefaultDialogue(npcData) {
        const name = npcData?.name || 'NPC';
        
        return {
            npcId: npcData?.id || 'unknown',
            nodes: {
                default: {
                    id: 'default',
                    texts: [
                        `你好，我是${name}。`,
                        `有什么事吗？`,
                        `...`
                    ],
                    choices: [
                        {
                            id: 'leave',
                            text: '没什么事，先走了',
                            effects: {},
                            nextNode: null
                        }
                    ]
                }
            }
        };
    },

    // ========== 开始对话 ==========

    /**
     * 开始与 NPC 对话
     */
    startDialogue(npcId) {
        const dialogueData = this.getDialogueData(npcId);
        if (!dialogueData) return null;

        this.currentNPC = npcId;
        this.currentNode = 'default';
        this.dialogueHistory = [];

        // v2.9.3: 加载已读选项记录
        this.loadReadChoices();

        // 检测是否首次见面（在设置flag之前）
        this._isFirstMeet = !NPCStateSystem.getNPCFlag(npcId, 'has_met_player');

        // 标记见过玩家
        NPCStateSystem.setNPCFlag(npcId, 'has_met_player', true);

        // v0.88.0: 只有首次见面才增加熟悉度，避免随便对话就加好感
        if (this._isFirstMeet) {
            NPCStateSystem.changeOpinion(npcId, 1, '首次见面');
        }

        return this.getCurrentNodeData();
    },

    /**
     * 获取当前对话节点数据
     */
    getCurrentNodeData() {
        if (!this.currentNPC || !this.currentNode) return null;

        const dialogueData = this.getDialogueData(this.currentNPC);
        const node = dialogueData.nodes[this.currentNode];
        if (!node) return null;

        // 随机选一条文本
        let texts = node.texts || ['...'];

        // 首次见面时，过滤掉"又见面了"/"好久不见"等不适合首次见面的文本
        if (this._isFirstMeet && this.currentNode === 'default') {
            const filtered = texts.filter(t => !t.includes('又见面') && !t.includes('好久不见') && !t.includes('是你啊'));
            if (filtered.length > 0) {
                texts = filtered;
            }
        }

        const text = texts[Math.floor(Math.random() * texts.length)];

        // 过滤可用的选项
        const availableChoices = this._filterChoices(node.choices || []);
        
        // 给选项加上 id（如果没有的话就用索引），并统一 next/nextNode
        const processedChoices = availableChoices.map((choice, index) => {
            return {
                ...choice,
                id: choice.id || `choice_${index}`,
                next: choice.next || choice.nextNode
            };
        });

        return {
            npcId: this.currentNPC,
            nodeId: this.currentNode,
            text: text,
            mood: node.mood || this._getMood(),
            choices: processedChoices
        };
    },

    /**
     * 过滤选项（根据条件）
     */
    _filterChoices(choices) {
        return choices.filter(choice => {
            // 检查条件
            if (choice.condition) {
                return this._checkCondition(choice.condition);
            }
            return true;
        });
    },

    /**
     * 检查条件
     */
    _checkCondition(condition) {
        const npcId = this.currentNPC;
        const npcState = NPCStateSystem.getNPCState(npcId);

        // 好感度条件
        if (condition.minOpinion && npcState.opinion < condition.minOpinion) {
            return false;
        }
        if (condition.maxOpinion && npcState.opinion > condition.maxOpinion) {
            return false;
        }

        // 信任度条件
        if (condition.minTrust && npcState.trust < condition.minTrust) {
            return false;
        }

        // 熟悉度条件
        if (condition.minFamiliarity && npcState.familiarity < condition.minFamiliarity) {
            return false;
        }

        // NPC 标记
        if (condition.npcFlags) {
            for (const [flag, value] of Object.entries(condition.npcFlags)) {
                if (NPCStateSystem.getNPCFlag(npcId, flag) !== value) {
                    return false;
                }
            }
        }

        if (condition.notNpcFlags) {
            for (const flag of condition.notNpcFlags) {
                if (NPCStateSystem.getNPCFlag(npcId, flag)) {
                    return false;
                }
            }
        }

        // v0.20.0: 记忆标签条件
        if (condition.memoryTags) {
            for (const tag of condition.memoryTags) {
                if (!NPCStateSystem.hasMemoryTag(npcId, tag)) {
                    return false;
                }
            }
        }
        if (condition.notMemoryTags) {
            for (const tag of condition.notMemoryTags) {
                if (NPCStateSystem.hasMemoryTag(npcId, tag)) {
                    return false;
                }
            }
        }
        // v0.20.0: 任一记忆标签（OR逻辑）
        if (condition.anyMemoryTags) {
            let hasAny = false;
            for (const tag of condition.anyMemoryTags) {
                if (NPCStateSystem.hasMemoryTag(npcId, tag)) {
                    hasAny = true;
                    break;
                }
            }
            if (!hasAny) return false;
        }

        // 世界状态条件
        if (!WorldState.checkConditions(condition)) {
            return false;
        }

        return true;
    },

    /**
     * 获取对话语气
     */
    _getMood() {
        if (!this.currentNPC) return 'neutral';
        return NPCStateSystem.getDialogueMood(this.currentNPC);
    },

    // ========== 选择选项 ==========

    /**
     * 选择对话选项
     */
    selectChoice(choiceId) {
        if (!this.currentNPC || !this.currentNode) return null;

        const dialogueData = this.getDialogueData(this.currentNPC);
        const node = dialogueData.nodes[this.currentNode];
        if (!node) return null;

        // 先过滤可用选项
        const availableChoices = this._filterChoices(node.choices || []);
        
        // 查找选项：先按 id 找，找不到就按索引找
        let choice = availableChoices.find(c => c.id === choiceId);
        if (!choice && typeof choiceId === 'number') {
            choice = availableChoices[choiceId];
        }
        if (!choice && choiceId?.startsWith?.('choice_')) {
            const index = parseInt(choiceId.replace('choice_', ''));
            choice = availableChoices[index];
        }
        if (!choice) return null;

        // v2.9.3: 记录已读选项
        this.markChoiceRead(this.currentNPC, choiceId);

        // 记录历史
        this.dialogueHistory.push({
            nodeId: this.currentNode,
            choiceId: choiceId,
            timestamp: Date.now()
        });

        // 应用效果
        this._applyEffects(choice.effects || {});

        // 执行特殊动作
        if (choice.action) {
            this._executeAction(choice.action, choice.actionData);
        }

        // v2.9.3: back动作返回上一级，而不是结束对话
        if (choice.action === 'back') {
            if (this.dialogueHistory.length > 1) {
                // 移除当前记录，返回上一级
                this.dialogueHistory.pop();
                const prev = this.dialogueHistory[this.dialogueHistory.length - 1];
                this.currentNode = prev.nodeId;
                return this.getCurrentNodeData();
            }
            // 没有上一级，返回默认节点
            this.currentNode = 'default';
            return this.getCurrentNodeData();
        }

        // 如果是关闭动作，直接结束对话
        if (choice.action === 'close_dialogue' || choice.action === 'close') {
            return this.endDialogue();
        }

        // 跳转到下一个节点
        if (choice.next || choice.nextNode) {
            this.currentNode = choice.next || choice.nextNode;
            const nodeData = this.getCurrentNodeData();
            // v0.88.0: 如果选项有response，用response替代随机文本，确保对话匹配
            if (choice.response && nodeData) {
                nodeData.text = choice.response;
            }
            return nodeData;
        } else if (choice.nextNode === null || choice.next === null) {
            // v1.2.0: nextNode明确为null表示结束对话（告别选项）
            return this.endDialogue();
        } else {
            // 没有指定下一个节点且不是关闭动作，返回默认节点
            this.currentNode = 'default';
            const nodeData = this.getCurrentNodeData();
            // v0.88.0: 如果选项有response，用response替代随机文本
            if (choice.response && nodeData) {
                nodeData.text = choice.response;
            }
            return nodeData;
        }
    },

    // ========== v2.9.3: 返回上一级 ==========

    /**
     * 返回上一级对话节点
     */
    goBack() {
        if (!this.currentNPC) return null;

        if (this.dialogueHistory.length > 1) {
            // 移除当前记录，返回上一级
            this.dialogueHistory.pop();
            const prev = this.dialogueHistory[this.dialogueHistory.length - 1];
            this.currentNode = prev.nodeId;
            return this.getCurrentNodeData();
        }

        // 没有上一级，返回默认节点
        this.currentNode = 'default';
        this.dialogueHistory = [];
        return this.getCurrentNodeData();
    },

    /**
     * 应用对话效果
     */
    _applyEffects(effects) {
        const npcId = this.currentNPC;

        // 好感度（v0.87.0: 收紧变化幅度，普通对话最多±1，重要事件需有reason）
        if (effects.opinion) {
            let delta = effects.opinion;
            // 普通对话（无reason）变化减半且最多±1
            if (!effects.opinionReason) {
                delta = Math.max(-1, Math.min(1, Math.floor(delta / 2)));
            }
            if (delta !== 0) {
                NPCStateSystem.changeOpinion(npcId, delta, effects.opinionReason || '对话交流');
            }
        }

        // 信任度
        if (effects.trust) {
            NPCStateSystem.changeTrust(npcId, effects.trust, effects.trustReason || '');
        }

        // 敬重度
        if (effects.respect) {
            NPCStateSystem.changeRespect(npcId, effects.respect, effects.respectReason || '');
        }

        // 畏惧度
        if (effects.fear) {
            NPCStateSystem.changeFear(npcId, effects.fear, effects.fearReason || '');
        }

        // 经验
        if (effects.exp) {
            Player.gainExp(effects.exp);
        }

        // 金币
        if (effects.gold) {
            if (effects.gold > 0) {
                Player.gainGold(effects.gold);
            } else {
                Player.spendGold(-effects.gold);
            }
        }

        // 物品
        if (effects.addItem) {
            Inventory.addItem(effects.addItem.itemId, effects.addItem.count || 1);
        }
        if (effects.removeItem) {
            Inventory.removeItem(effects.removeItem.itemId, effects.removeItem.count || 1);
        }

        // v0.20.0: 添加NPC记忆
        if (effects.addMemory) {
            NPCStateSystem.addMemory(npcId, effects.addMemory);
        }

        // v0.21.0: 改变NPC对其他NPC的关系（玩家影响NPC关系网）
        if (effects.changeNPCRelationship) {
            const { target, field, amount } = effects.changeNPCRelationship;
            NPCStateSystem.changeNPCRelationship(npcId, target, field, amount, '对话影响');
        }

        // 全局标记
        if (effects.flags) {
            for (const [flag, value] of Object.entries(effects.flags)) {
                WorldState.setFlag(flag, value);
            }
        }

        // NPC 标记
        if (effects.npcFlags) {
            for (const [flag, value] of Object.entries(effects.npcFlags)) {
                NPCStateSystem.setNPCFlag(npcId, flag, value);
            }
        }

        // 获得信息
        if (effects.giveInfo) {
            const infos = Array.isArray(effects.giveInfo) ? effects.giveInfo : [effects.giveInfo];
            infos.forEach(infoId => {
                WorldState.gainInfo(infoId);
            });
        }

        // v1.8.1: 发现阴谋调查线索
        if (effects.discoverClue && typeof InvestigationSystem !== 'undefined') {
            const clues = Array.isArray(effects.discoverClue) ? effects.discoverClue : [effects.discoverClue];
            clues.forEach(clueId => {
                InvestigationSystem.discoverClue(Player, clueId);
            });
        }

        // 声望
        if (effects.reputation) {
            for (const [factionId, amount] of Object.entries(effects.reputation)) {
                WorldState.changeReputation(factionId, amount);
            }
        }

        // 开始任务
        if (effects.startQuest) {
            QuestSystem.acceptQuest(effects.startQuest);
        }

        // 完成任务
        if (effects.completeQuest) {
            QuestSystem.completeQuest(effects.completeQuest);
        }

        // 添加记忆
        if (effects.addMemory) {
            NPCStateSystem.addMemory(npcId, effects.addMemory);
        }
    },

    /**
     * 执行特殊动作
     */
    _executeAction(action, actionData) {
        switch (action) {
            case 'start_battle':
                // 开始战斗
                if (actionData && actionData.enemyId) {
                    // 延迟一下，让对话结束
                    setTimeout(() => {
                        Game.startBattle(actionData.enemyId);
                    }, 500);
                }
                break;

            case 'open_shop':
                // 打开商店
                if (actionData && actionData.shopId) {
                    setTimeout(() => {
                        Game.openShop(actionData.shopId);
                    }, 500);
                }
                break;

            case 'start_quest':
                // 接取任务（v0.98.0: 对话触发任务）
                if (actionData && actionData.questId) {
                    setTimeout(() => {
                        Game.acceptQuest(actionData.questId);
                    }, 500);
                }
                break;

            case 'close_dialogue':
            case 'close': // v0.73.1: 兼容简写
                // 关闭对话
                this.endDialogue();
                break;

            default:
                console.log('未知对话动作:', action);
        }
    },

    // ========== 结束对话 ==========

    /**
     * 结束对话
     */
    endDialogue() {
        const result = {
            ended: true,
            npcId: this.currentNPC,
            history: this.dialogueHistory
        };

        this.currentNPC = null;
        this.currentNode = null;
        this.dialogueHistory = [];

        return result;
    },

    /**
     * 是否正在对话
     */
    isInDialogue() {
        return this.currentNPC !== null;
    },

    // ========== 辅助功能 ==========

    /**
     * 获取 NPC 的可用话题（用于显示"聊点什么"列表）
     */
    getAvailableTopics(npcId) {
        const dialogueData = this.getDialogueData(npcId);
        if (!dialogueData || !dialogueData.nodes.default) return [];

        const defaultNode = dialogueData.nodes.default;
        const choices = this._filterChoices(defaultNode.choices || []);

        return choices.map(c => ({
            id: c.id,
            text: c.text,
            icon: c.icon || '💬'
        }));
    },

    /**
     * 跳转到指定话题
     */
    goToTopic(topicId) {
        if (!this.currentNPC) return null;

        const dialogueData = this.getDialogueData(this.currentNPC);
        if (!dialogueData.nodes[topicId]) return null;

        this.currentNode = topicId;
        return this.getCurrentNodeData();
    }
};
