/**
 * 警戒等级系统
 * v3.15.0 新增
 * 管理城市警戒等级变化、效果、光耀信号
 */

import { AlertLevels, AlertLevelRules, LightSignal } from '../data/alert-levels.js';

export const AlertSystem = {
    // 当前警戒等级
    currentLevel: 'normal',
    // 妖魔数量（用于判断等级变化）
    enemyCount: 0,
    // 等级变化历史
    levelHistory: [],

    /**
     * 初始化警戒系统
     */
    init() {
        this.currentLevel = 'normal';
        this.enemyCount = 0;
        this.levelHistory = [];
    },

    /**
     * 获取当前警戒等级数据
     */
    getCurrentLevel() {
        return AlertLevels[this.currentLevel];
    },

    /**
     * 设置警戒等级
     * @param {string} levelId - 警戒等级ID (normal/orange/blue/blood)
     * @param {string} reason - 变化原因
     */
    setLevel(levelId, reason = '') {
        if (!AlertLevels[levelId]) {
            console.warn(`[AlertSystem] 未知警戒等级: ${levelId}`);
            return false;
        }

        const oldLevel = this.currentLevel;
        this.currentLevel = levelId;

        // 记录历史
        this.levelHistory.push({
            from: oldLevel,
            to: levelId,
            reason: reason,
            timestamp: Date.now()
        });

        // 触发大事件
        const levelData = AlertLevels[levelId];
        if (levelData.effects.bigEventTrigger) {
            this.triggerBigEvent(levelData.effects.bigEventTrigger);
        }

        console.log(`[AlertSystem] 警戒等级变化: ${oldLevel} -> ${levelId} (${reason})`);
        return true;
    },

    /**
     * 更新妖魔数量，自动判断等级变化
     * @param {number} count - 当前妖魔数量
     */
    updateEnemyCount(count) {
        this.enemyCount = count;
        this.checkLevelChange();
    },

    /**
     * 增加妖魔数量
     * @param {number} amount - 增加数量
     */
    addEnemies(amount) {
        this.enemyCount += amount;
        this.checkLevelChange();
    },

    /**
     * 减少妖魔数量
     * @param {number} amount - 减少数量
     */
    removeEnemies(amount) {
        this.enemyCount = Math.max(0, this.enemyCount - amount);
        this.checkLevelChange();
    },

    /**
     * 检查是否需要变化警戒等级
     */
    checkLevelChange() {
        const current = this.currentLevel;
        const count = this.enemyCount;

        // 升级检查
        if (current === 'normal' && count >= 300) {
            this.setLevel('orange', `妖魔数量达到${count}只`);
        } else if (current === 'orange' && count >= 500) {
            this.setLevel('blue', `妖魔流窜到城市区域，数量${count}只`);
        } else if (current === 'blue' && count >= 1000) {
            this.setLevel('blood', `妖魔数量达到${count}只，城市毁灭级`);
        }
        // 降级检查
        else if (current === 'blood' && count < 800) {
            this.setLevel('blue', `妖魔数量下降到${count}只`);
        } else if (current === 'blue' && count < 300) {
            this.setLevel('orange', `妖魔数量下降到${count}只`);
        } else if (current === 'orange' && count === 0) {
            this.setLevel('normal', '妖魔清除完毕');
        }
    },

    /**
     * 释放光耀信号
     * @param {number} signalCount - 信号数量 (1/2)
     * @returns {object} 信号结果
     */
    releaseLightSignal(signalCount) {
        const signal = LightSignal.levels[signalCount];
        if (!signal) {
            console.warn(`[AlertSystem] 未知光耀信号: ${signalCount}`);
            return null;
        }

        console.log(`[AlertSystem] 释放${signal.name}，触发${signal.alertLevel}警戒`);

        // 自动设置对应警戒等级
        this.setLevel(signal.alertLevel, `光耀信号触发，${signal.description}`);

        return {
            name: signal.name,
            alertLevel: signal.alertLevel,
            description: signal.description
        };
    },

    /**
     * 触发大事件
     * @param {string} eventId - 大事件ID
     */
    triggerBigEvent(eventId) {
        console.log(`[AlertSystem] 触发大事件: ${eventId}`);
        // 这里调用大事件系统触发事件
        // 实际实现需要引入大事件引擎
        if (window.GameEngine && window.GameEngine.bigEvent) {
            window.GameEngine.bigEvent.trigger(eventId);
        }
    },

    /**
     * 获取当前警戒效果
     */
    getEffects() {
        return this.getCurrentLevel().effects;
    },

    /**
     * 检查地点是否被锁定
     * @param {string} locationId - 地点ID
     * @returns {boolean} 是否锁定
     */
    isLocationLocked(locationId) {
        const effects = this.getEffects();
        return effects.locationLock.includes(locationId);
    },

    /**
     * 检查商店是否开放
     * @returns {boolean} 是否开放
     */
    isShopOpen() {
        return this.getEffects().shopOpen;
    },

    /**
     * 获取NPC行为模式
     * @returns {string} 行为模式 (normal/cautious/nervous/panic)
     */
    getNpcBehavior() {
        return this.getEffects().npcBehavior;
    },

    /**
     * 获取妖魔出现率倍率
     * @returns {number} 倍率
     */
    getEnemySpawnRate() {
        return this.getEffects().enemySpawnRate;
    },

    /**
     * 序列化为存档数据
     */
    serialize() {
        return {
            currentLevel: this.currentLevel,
            enemyCount: this.enemyCount,
            levelHistory: this.levelHistory.slice(-20) // 只保留最近20条
        };
    },

    /**
     * 从存档数据反序列化
     */
    deserialize(data) {
        if (!data) return;
        this.currentLevel = data.currentLevel || 'normal';
        this.enemyCount = data.enemyCount || 0;
        this.levelHistory = data.levelHistory || [];
    },

    /**
     * 重置警戒系统
     */
    reset() {
        this.init();
    }
};
