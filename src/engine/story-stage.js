/**
 * 剧情阶段（Story Stage）管理系统
 * v3.14.0
 * 
 * 管理游戏的剧情阶段，用于控制：
 * - NPC动态分层（tierOverrides）
 * - NPC活跃状态（activeStages）
 * - 环境台词切换（ambientLines按stage分组）
 * - 对话解锁条件（unlockCondition.stage）
 * 
 * 设计原则：
 * - stage通过任务完成/事件触发自动推进，玩家不需要手动选择
 * - stage变化时通知所有相关系统重新计算
 * - 可回溯：记录stage变化历史，用于调试
 */

// 剧情阶段定义
export const STORY_STAGES = {
    1: {
        id: 1,
        name: "觉醒前",
        description: "游戏开始 ~ 觉醒仪式",
        chapters: "第1-3章",
        unlocked: true
    },
    2: {
        id: 2,
        name: "觉醒初期",
        description: "觉醒后 ~ 学会第一个技能",
        chapters: "第4-10章",
        unlocked: false
    },
    3: {
        id: 3,
        name: "修炼期",
        description: "学会技能后 ~ 雪峰山历练",
        chapters: "第11-40章",
        unlocked: false
    },
    4: {
        id: 4,
        name: "历练期",
        description: "雪峰山历练 ~ 城市猎妖",
        chapters: "第41-60章",
        unlocked: false
    },
    5: {
        id: 5,
        name: "猎妖期",
        description: "城市猎妖 ~ 地圣泉",
        chapters: "第61-80章",
        unlocked: false
    },
    6: {
        id: 6,
        name: "灾难前",
        description: "地圣泉后 ~ 博城灾难",
        chapters: "第81-100章",
        unlocked: false
    },
    7: {
        id: 7,
        name: "博城灾难",
        description: "灾难期间",
        chapters: "第101-115章",
        unlocked: false
    },
    8: {
        id: 8,
        name: "灾后",
        description: "灾难后 ~ 明珠篇前",
        chapters: "第116-120章",
        unlocked: false
    }
};

// stage变化回调列表
const _stageChangeCallbacks = [];

export const StoryStageSystem = {
    /**
     * 初始化
     */
    init() {
        console.log('剧情阶段系统初始化完成');
    },

    /**
     * 获取当前stage
     */
    getCurrentStage() {
        if (typeof Player !== 'undefined' && Player.storyStage) {
            return Player.storyStage;
        }
        if (typeof GameState !== 'undefined' && GameState.getState) {
            return GameState.getState('storyStage') || 1;
        }
        return 1; // 默认stage 1
    },

    /**
     * 获取当前stage信息
     */
    getCurrentStageInfo() {
        const stage = this.getCurrentStage();
        return STORY_STAGES[stage] || STORY_STAGES[1];
    },

    /**
     * 推进到下一个stage
     * @param {number} newStage - 新的stage编号
     * @param {string} reason - 推进原因（用于日志）
     */
    advanceStage(newStage, reason = '') {
        const currentStage = this.getCurrentStage();
        
        if (newStage <= currentStage) {
            console.warn(`[StoryStage] 无法从stage ${currentStage} 回退到 ${newStage}`);
            return false;
        }

        if (!STORY_STAGES[newStage]) {
            console.warn(`[StoryStage] 无效的stage: ${newStage}`);
            return false;
        }

        // 保存到玩家状态
        if (typeof Player !== 'undefined') {
            Player.storyStage = newStage;
        }
        if (typeof GameState !== 'undefined' && GameState.setState) {
            GameState.setState('storyStage', newStage);
        }

        // 记录历史
        this._recordStageHistory(currentStage, newStage, reason);

        console.log(`[StoryStage] 剧情阶段推进: ${currentStage}(${STORY_STAGES[currentStage].name}) → ${newStage}(${STORY_STAGES[newStage].name})，原因: ${reason}`);

        // 触发回调
        this._notifyStageChange(currentStage, newStage);

        return true;
    },

    /**
     * 注册stage变化回调
     * @param {Function} callback - 回调函数 (oldStage, newStage) => void
     */
    onStageChange(callback) {
        if (typeof callback === 'function') {
            _stageChangeCallbacks.push(callback);
        }
    },

    /**
     * 检查是否达到某个stage
     * @param {number} stage - 目标stage
     */
    hasReachedStage(stage) {
        return this.getCurrentStage() >= stage;
    },

    /**
     * 获取stage变化历史
     */
    getStageHistory() {
        if (typeof Player !== 'undefined' && Player.storyStageHistory) {
            return Player.storyStageHistory;
        }
        return [];
    },

    /**
     * 记录stage变化历史
     */
    _recordStageHistory(oldStage, newStage, reason) {
        if (typeof Player !== 'undefined') {
            if (!Player.storyStageHistory) {
                Player.storyStageHistory = [];
            }
            Player.storyStageHistory.push({
                from: oldStage,
                to: newStage,
                reason: reason,
                day: typeof Player !== 'undefined' ? Player.day : 0,
                hour: typeof Player !== 'undefined' ? Player.hour : 0,
                timestamp: Date.now()
            });
        }
    },

    /**
     * 通知所有注册的回调
     */
    _notifyStageChange(oldStage, newStage) {
        _stageChangeCallbacks.forEach(callback => {
            try {
                callback(oldStage, newStage);
            } catch (e) {
                console.error('[StoryStage] 回调执行失败:', e);
            }
        });
    },

    /**
     * 获取所有stage定义（用于UI显示）
     */
    getAllStages() {
        return Object.values(STORY_STAGES);
    },

    /**
     * 重置（新游戏时调用）
     */
    reset() {
        if (typeof Player !== 'undefined') {
            Player.storyStage = 1;
            Player.storyStageHistory = [];
        }
        _stageChangeCallbacks.length = 0;
    }
};
