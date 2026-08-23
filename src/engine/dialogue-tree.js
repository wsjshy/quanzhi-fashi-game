/**
 * 对话树系统
 * 管理多层对话、条件选项、对话效果
 */

export const DialogueTree = {
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
            // 将保存的数组转换为Set
            this._readChoices = {};
            Object.entries(Player.readDialogueChoices).forEach(([npcId, choices]) => {
                if (Array.isArray(choices)) {
                    this._readChoices[npcId] = new Set(choices);
                } else if (choices instanceof Set) {
                    this._readChoices[npcId] = choices;
                } else {
                    this._readChoices[npcId] = new Set();
                }
            });
        }
    },

    /**
     * 保存已读选项记录到玩家（Set转换为数组以便序列化）
     */
    saveReadChoices() {
        if (typeof Player !== 'undefined') {
            const saveData = {};
            Object.entries(this._readChoices).forEach(([npcId, choices]) => {
                if (choices instanceof Set) {
                    saveData[npcId] = Array.from(choices);
                } else if (Array.isArray(choices)) {
                    saveData[npcId] = choices;
                }
            });
            Player.readDialogueChoices = saveData;
        }
    },

    /**
     * 检查某个NPC的某个节点的某个选项是否已读（分支完成度判断）
     * v2.9.3改进：不是简单判断是否点击过，而是判断该选项指向的整个分支是否完全探索完毕
     * 使用"节点id:选项id"作为唯一标识，避免不同节点相同选项id导致误标记
     * 
     * 递归逻辑：
     * - 选项已读 = 选项被点击过 + 选项指向的节点完全探索
     * - 节点完全探索 = 该节点所有需要探索的子选项都已读（递归）
     * - 叶子节点（无探索性子选项）的选项，点击后即已读
     * - 条件不满足的选项视为已探索（玩家无法触发，不阻碍分支完成）
     * - 结束对话/返回默认节点的选项不算探索分支
     */
    isChoiceRead(npcId, nodeId, choiceId) {
        // 首先检查该选项是否被点击过
        if (!this._readChoices[npcId]) return false;
        const key = nodeId + ':' + choiceId;
        if (!this._readChoices[npcId].has(key)) return false;
        
        // 获取选项对象，判断指向的节点
        const dialogueData = this.getDialogueData(npcId);
        const node = dialogueData.nodes[nodeId];
        if (!node) return true; // 节点不存在，视为已读
        
        const choices = node.choices || [];
        const choice = choices.find(c => (c.id || `choice_${choices.indexOf(c)}`) === choiceId);
        if (!choice) return true; // 选项不存在，视为已读
        
        const nextNodeId = choice.next || choice.nextNode;
        
        // 结束对话或返回默认节点，视为已读（叶子选项）
        if (nextNodeId == null || nextNodeId === 'default') return true;
        
        // 关闭对话动作，视为已读
        if (choice.action === 'close' || choice.action === 'close_dialogue') return true;
        
        // 递归判断目标节点是否完全探索
        return this._isNodeFullyExplored(npcId, nextNodeId, new Set());
    },

    /**
     * 递归判断某个节点是否完全探索（所有需要探索的子分支都已读）
     * @param {string} npcId - NPC ID
     * @param {string} nodeId - 节点ID
     * @param {Set} visiting - 正在访问的节点集合，用于防止循环引用
     * @returns {boolean} 是否完全探索
     */
    _isNodeFullyExplored(npcId, nodeId, visiting) {
        // 防止循环引用：循环节点视为已探索
        if (visiting.has(nodeId)) return true;
        visiting.add(nodeId);
        
        const dialogueData = this.getDialogueData(npcId);
        const node = dialogueData.nodes[nodeId];
        if (!node) return true; // 节点不存在，视为已探索
        
        const choices = node.choices || [];
        const savedNPC = this.currentNPC;
        this.currentNPC = npcId; // 临时设置，确保_checkCondition使用正确的NPC
        
        try {
            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                const choiceId = choice.id || `choice_${i}`;
                const nextNodeId = choice.next || choice.nextNode;
                
                // 跳过结束对话、返回默认节点、关闭对话的选项（不算探索分支）
                if (nextNodeId == null || nextNodeId === 'default') continue;
                if (choice.action === 'close' || choice.action === 'close_dialogue') continue;
                
                // 条件不满足的选项视为已探索（玩家无法触发，不阻碍分支完成）
                if (choice.condition && !this._checkCondition(choice.condition)) continue;
                
                // 递归判断该选项是否已读（分支完成）
                if (!this.isChoiceRead(npcId, nodeId, choiceId)) {
                    return false;
                }
            }
        } finally {
            this.currentNPC = savedNPC; // 恢复
        }
        
        return true;
    },

    /**
     * 标记某个节点的某个选项为已点击过（分支完成度的基础数据）
     */
    markChoiceRead(npcId, nodeId, choiceId) {
        if (!this._readChoices[npcId]) {
            this._readChoices[npcId] = new Set();
        }
        const key = nodeId + ':' + choiceId;
        this._readChoices[npcId].add(key);
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

        // v3.1.0: 记录节点访问到NPC状态系统（非default节点）
        if (this.currentNode !== 'default' && typeof NPCStateSystem !== 'undefined') {
            const nodeSummary = node.description || node.name || text.substring(0, 50);
            NPCStateSystem.recordDialogueNodeVisit(this.currentNPC, this.currentNode, nodeSummary);
        }

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
     * v3.1.0: 添加一次性对话过滤，已访问的oneTime节点不再显示
     * v3.1.0: 当父节点的所有oneTime子选项都被访问后，父节点本身也自动隐藏
     */
    _filterChoices(choices) {
        return choices.filter(choice => {
            // 检查条件
            if (choice.condition) {
                if (!this._checkCondition(choice.condition)) return false;
            }

            // v3.1.0: 过滤已访问的一次性对话节点
            const nextNodeId = choice.next || choice.nextNode;
            if (nextNodeId && nextNodeId !== 'default') {
                const dialogueData = this.getDialogueData(this.currentNPC);
                const nextNode = dialogueData.nodes[nextNodeId];
                if (nextNode && nextNode.oneTime) {
                    // 一次性对话，检查是否已访问
                    if (NPCStateSystem.isDialogueNodeVisited(this.currentNPC, nextNodeId)) {
                        return false; // 已访问，过滤掉
                    }
                }

                // v3.1.0: 检查父节点的所有子选项是否都是oneTime且都被访问
                if (nextNode && nextNode.choices && nextNode.choices.length > 0) {
                    const childChoices = nextNode.choices;
                    // 过滤掉返回/关闭类选项（next为null或default或action为back/close）
                    const meaningfulChoices = childChoices.filter(c => {
                        const childNext = c.next || c.nextNode;
                        return childNext && childNext !== 'default' && c.action !== 'back' && c.action !== 'close';
                    });
                    // 如果所有有意义的子选项都是oneTime
                    if (meaningfulChoices.length > 0 && meaningfulChoices.every(c => {
                        const childNext = c.next || c.nextNode;
                        if (!childNext) return false;
                        const childNode = dialogueData.nodes[childNext];
                        return childNode && childNode.oneTime;
                    })) {
                        // 检查是否所有oneTime子选项都被访问
                        const allVisited = meaningfulChoices.every(c => {
                            const childNext = c.next || c.nextNode;
                            return NPCStateSystem.isDialogueNodeVisited(this.currentNPC, childNext);
                        });
                        if (allVisited) {
                            return false; // 所有子选项都已访问，隐藏父节点
                        }
                    }
                }
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

        // v2.9.3: 记录已读选项（使用节点id+选项id作为唯一标识）
        this.markChoiceRead(this.currentNPC, this.currentNode, choiceId);

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

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.DialogueTree = DialogueTree;
