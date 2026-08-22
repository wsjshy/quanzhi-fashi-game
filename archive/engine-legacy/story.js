/**
 * 剧情系统
 * 管理对话、选项、剧情推进
 */

const StorySystem = {
    _currentStory: null,
    _currentNode: null,
    _currentNodeId: null,
    _dialogIndex: 0,
    _variables: {}, // 剧情变量
    _onCompleteCallback: null,

    /**
     * 开始剧情
     */
    async start(storyId, volume = 'vol1', onComplete = null) {
        const storyData = await DataManager.getStory(storyId, volume);
        if (!storyData) {
            console.error('剧情数据不存在:', storyId);
            return false;
        }

        this._currentStory = storyData;
        this._currentNodeId = storyData.startNode || 'start';
        this._dialogIndex = 0;
        this._onCompleteCallback = onComplete;

        this.showDialogUI();
        this.showCurrentNode();
        
        return true;
    },

    /**
     * 显示对话界面
     */
    showDialogUI() {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('battle-screen').style.display = 'none';
        document.getElementById('map-screen').style.display = 'none';
        document.getElementById('dialog-box').style.display = 'block';
        document.getElementById('status-panel').style.display = 'block';
    },

    /**
     * 显示当前节点
     */
    showCurrentNode() {
        const node = this._currentStory.nodes[this._currentNodeId];
        if (!node) {
            console.error('剧情节点不存在:', this._currentNodeId);
            this.endStory();
            return;
        }

        this._currentNode = node;
        this._dialogIndex = 0;

        // 处理节点进入事件
        if (node.onEnter) {
            this.executeEvents(node.onEnter);
        }

        this.showDialog();
    },

    /**
     * 显示当前对话
     */
    showDialog() {
        const dialogs = this._currentNode.dialogs || [];
        
        if (this._dialogIndex >= dialogs.length) {
            // 对话结束，显示选项或进入下一个节点
            this.showChoicesOrNext();
            return;
        }

        const dialog = dialogs[this._dialogIndex];
        const speakerEl = document.getElementById('dialog-speaker');
        const textEl = document.getElementById('dialog-text');
        const choicesEl = document.getElementById('dialog-choices');
        const continueEl = document.getElementById('dialog-continue');

        // 隐藏选项，显示继续提示
        choicesEl.innerHTML = '';
        continueEl.style.display = 'block';

        // 说话人
        if (dialog.speaker) {
            speakerEl.style.display = 'block';
            speakerEl.textContent = dialog.speaker;
            // 根据说话人设置颜色
            if (dialog.speakerColor) {
                speakerEl.style.color = dialog.speakerColor;
            } else {
                speakerEl.style.color = '#ffd700';
            }
        } else {
            speakerEl.style.display = 'none';
        }

        // 对话内容（支持变量替换）
        let text = dialog.text || '';
        text = this.replaceVariables(text);
        textEl.textContent = text;

        // 旁白样式
        if (dialog.narration) {
            textEl.style.color = '#aaaaaa';
            textEl.style.fontStyle = 'italic';
        } else {
            textEl.style.color = '#e0e0e0';
            textEl.style.fontStyle = 'normal';
        }
    },

    /**
     * 显示选项或进入下一节点
     */
    showChoicesOrNext() {
        const node = this._currentNode;
        const choicesEl = document.getElementById('dialog-choices');
        const continueEl = document.getElementById('dialog-continue');

        if (node.choices && node.choices.length > 0) {
            // 有选项
            continueEl.style.display = 'none';
            choicesEl.innerHTML = '';
            
            node.choices.forEach((choice, index) => {
                // 检查条件
                if (choice.condition && !this.evaluateCondition(choice.condition)) {
                    return; // 不满足条件的选项不显示
                }

                const btn = document.createElement('div');
                btn.className = 'choice-btn';
                btn.textContent = this.replaceVariables(choice.text);
                btn.onclick = () => this.selectChoice(choice);
                choicesEl.appendChild(btn);
            });
        } else if (node.next) {
            // 直接进入下一节点
            continueEl.style.display = 'block';
        } else if (node.end) {
            // 剧情结束
            continueEl.style.display = 'block';
        } else {
            continueEl.style.display = 'none';
        }
    },

    /**
     * 选择选项
     */
    selectChoice(choice) {
        // 执行选项事件
        if (choice.events) {
            this.executeEvents(choice.events);
        }

        // 跳转到下一个节点
        if (choice.next) {
            this.goToNode(choice.next);
        } else {
            this.nextDialog();
        }
    },

    /**
     * 下一段对话
     */
    nextDialog() {
        const dialogs = this._currentNode.dialogs || [];
        this._dialogIndex++;

        if (this._dialogIndex < dialogs.length) {
            this.showDialog();
        } else {
            // 对话结束
            if (this._currentNode.next) {
                this.goToNode(this._currentNode.next);
            } else if (this._currentNode.end) {
                this.endStory();
            } else {
                this.showChoicesOrNext();
            }
        }
    },

    /**
     * 跳转到指定节点
     */
    goToNode(nodeId) {
        this._currentNodeId = nodeId;
        this.showCurrentNode();
    },

    /**
     * 结束剧情
     */
    endStory() {
        if (this._onCompleteCallback) {
            const callback = this._onCompleteCallback;
            this._onCompleteCallback = null;
            callback();
        }
    },

    /**
     * 执行事件
     */
    executeEvents(events) {
        events.forEach(event => {
            switch (event.type) {
                case 'setVariable':
                    this._variables[event.name] = this.evaluateValue(event.value);
                    break;
                case 'addVariable':
                    this._variables[event.name] = (this._variables[event.name] || 0) + event.value;
                    break;
                case 'awakenElement':
                    Player.get().awakenElement(event.element);
                    break;
                case 'learnSkill':
                    Player.get().learnSkill(event.skillId);
                    break;
                case 'healPlayer':
                    Player.get().heal(event.amount || 9999);
                    break;
                case 'restoreMp':
                    Player.get().restoreMp(event.amount || 9999);
                    break;
                case 'startBattle':
                    this.startBattle(event.battleId);
                    break;
                case 'goToMap':
                    this.goToMap(event.mapId);
                    break;
            }
        });
        
        // 更新状态面板
        if (Player.get()) {
            BattleSystem.updateStatusPanel();
        }
    },

    /**
     * 开始战斗
     * 注意：战斗结束后的剧情跳转由 Game.onBattleEnd 处理
     */
    async startBattle(battleId) {
        const result = await BattleSystem.start(battleId);
        if (!result) {
            this.nextDialog();
        }
        // 战斗结束后会由 Game.onBattleEnd 处理后续流程
        // 包括跳转到指定剧情节点或返回地图
    },

    /**
     * 前往地图
     */
    goToMap(mapId) {
        // 暂时隐藏对话框，显示地图
        document.getElementById('dialog-box').style.display = 'none';
        Game.showMap(mapId);
    },

    /**
     * 变量替换
     */
    replaceVariables(text) {
        return text.replace(/\{(\w+)\}/g, (match, varName) => {
            return this._variables[varName] !== undefined ? this._variables[varName] : match;
        });
    },

    /**
     * 评估条件
     */
    evaluateCondition(condition) {
        if (condition.type === 'variableEquals') {
            return this._variables[condition.name] === condition.value;
        }
        if (condition.type === 'variableGreater') {
            return (this._variables[condition.name] || 0) > condition.value;
        }
        if (condition.type === 'variableLess') {
            return (this._variables[condition.name] || 0) < condition.value;
        }
        if (condition.type === 'hasElement') {
            return Player.get().elements.includes(condition.element);
        }
        if (condition.type === 'hasSkill') {
            return Player.get().skills.includes(condition.skillId);
        }
        if (condition.type === 'and') {
            return condition.conditions.every(c => this.evaluateCondition(c));
        }
        if (condition.type === 'or') {
            return condition.conditions.some(c => this.evaluateCondition(c));
        }
        return true;
    },

    /**
     * 评估值（支持变量引用）
     */
    evaluateValue(value) {
        if (typeof value === 'string' && value.startsWith('$')) {
            return this._variables[value.slice(1)];
        }
        return value;
    },

    /**
     * 处理点击继续
     */
    handleContinue() {
        if (!this._currentNode) return;
        
        const dialogs = this._currentNode.dialogs || [];
        
        if (this._dialogIndex < dialogs.length - 1) {
            // 还有下一段对话
            this.nextDialog();
        } else if (this._currentNode.choices && this._currentNode.choices.length > 0) {
            // 显示选项
            this.showChoicesOrNext();
        } else if (this._currentNode.next) {
            // 进入下一节点
            this.goToNode(this._currentNode.next);
        } else if (this._currentNode.end) {
            // 结束剧情
            this.endStory();
        }
    },

    /**
     * 获取变量值
     */
    getVariable(name) {
        return this._variables[name];
    },

    /**
     * 设置变量
     */
    setVariable(name, value) {
        this._variables[name] = value;
    }
};

// 点击对话框继续
document.addEventListener('click', (e) => {
    const dialogBox = document.getElementById('dialog-box');
    const choicesEl = document.getElementById('dialog-choices');
    
    // 如果点击的是对话框区域，且没有选项按钮，就继续
    if (dialogBox.style.display !== 'none') {
        if (e.target.closest('.choice-btn')) return; // 点击选项不触发
        if (e.target.closest('#dialog-choices') && choicesEl.children.length > 0) return;
        
        StorySystem.handleContinue();
    }
});
