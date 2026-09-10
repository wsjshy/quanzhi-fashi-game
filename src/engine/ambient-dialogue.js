/**
 * 环境对话系统（Ambient Dialogue System）
 * v3.14.0
 * 
 * 管理背景NPC的环境台词自动触发，让世界"活"起来。
 * 
 * 核心机制：
 * - 玩家进入地点时，背景NPC按概率自动说一句话
 * - 时间变化/完成任务时触发相关台词
 * - 不需要玩家点击，台词显示在底部消息条
 * - 冷却时间控制，避免频繁触发
 * 
 * 设计原则：
 * - 对话是加分项，不是必选项
 * - 环境台词自然出现，不打断玩家操作
 * - 密度可控，避免刷屏
 */

import { StoryStageSystem } from './story-stage.js';
import { NpcTierSystem } from './npc-tier.js';

// 触发配置
const TRIGGER_CONFIG = {
    maxPerLocationEntry: 2,      // 每次进入地点最多触发条数
    maxPerTimeChange: 1,         // 每次时间变化最多触发条数
    maxPerEvent: 2,              // 每次事件最多触发条数
    defaultChance: 0.3,          // 默认触发概率
    defaultCooldownHours: 3,     // 默认冷却时间（游戏小时）
    messageDisplayMs: 4000       // 消息显示时长（毫秒）
};

// 冷却时间记录 { npcId: lastTriggerHour }
let _cooldowns = {};

export const AmbientDialogueSystem = {
    /**
     * 初始化
     */
    init() {
        // 从存档加载冷却时间
        this._loadCooldowns();
        console.log('环境对话系统初始化完成');
    },

    /**
     * 从存档加载冷却时间
     */
    _loadCooldowns() {
        if (typeof Player !== 'undefined' && Player.ambientCooldowns) {
            _cooldowns = { ...Player.ambientCooldowns };
        } else {
            _cooldowns = {};
        }
    },

    /**
     * 保存冷却时间到存档
     */
    _saveCooldowns() {
        if (typeof Player !== 'undefined') {
            Player.ambientCooldowns = { ..._cooldowns };
        }
    },

    /**
     * 检查NPC是否在冷却中
     */
    _isOnCooldown(npcId) {
        if (!_cooldowns[npcId]) return false;
        const currentHour = this._getCurrentHour();
        return currentHour - _cooldowns[npcId] < TRIGGER_CONFIG.defaultCooldownHours;
    },

    /**
     * 设置NPC冷却时间
     */
    _setCooldown(npcId) {
        const currentHour = this._getCurrentHour();
        _cooldowns[npcId] = currentHour;
        this._saveCooldowns();
    },

    /**
     * 获取当前游戏小时（用于冷却计算）
     */
    _getCurrentHour() {
        if (typeof Player !== 'undefined') {
            return (Player.day || 1) * 24 + (Player.hour || 0);
        }
        return 0;
    },

    /**
     * 检查地点触发（玩家进入地点时调用）
     * @param {string} locationId - 地点ID
     */
    checkLocationTriggers(locationId) {
        const triggered = this._checkTriggers(locationId, 'location', TRIGGER_CONFIG.maxPerLocationEntry);
        if (triggered.length > 0) {
            console.log(`[AmbientDialogue] 地点[${locationId}]触发 ${triggered.length} 条环境台词`);
        }
        return triggered;
    },

    /**
     * 检查时间触发（时间变化时调用）
     * @param {string} timeOfDay - 时间段（morning/afternoon/evening）
     */
    checkTimeTriggers(timeOfDay) {
        const currentLocation = this._getCurrentLocation();
        const triggered = this._checkTriggers(currentLocation, 'time', TRIGGER_CONFIG.maxPerTimeChange, timeOfDay);
        return triggered;
    },

    /**
     * 检查事件触发（完成任务/事件时调用）
     * @param {string} eventType - 事件类型
     * @param {Object} eventData - 事件数据
     */
    checkEventTriggers(eventType, eventData = {}) {
        const currentLocation = this._getCurrentLocation();
        const triggered = this._checkTriggers(currentLocation, 'event', TRIGGER_CONFIG.maxPerEvent, null, eventType, eventData);
        return triggered;
    },

    /**
     * 通用触发检查
     */
    _checkTriggers(locationId, triggerType, maxCount, timeOfDay = null, eventType = null, eventData = {}) {
        const currentStage = StoryStageSystem.getCurrentStage();
        const triggered = [];

        // 获取该地点的所有background NPC
        const backgroundNpcs = this._getBackgroundNpcsAtLocation(locationId);

        // 收集所有可触发的台词
        const candidates = [];

        backgroundNpcs.forEach(npc => {
            // 检查冷却
            if (this._isOnCooldown(npc.id)) return;

            // 获取该NPC在当前stage的环境台词
            const stageLines = this._getStageLines(npc, currentStage);
            if (!stageLines || stageLines.length === 0) return;

            // 筛选满足条件的台词
            const validLines = stageLines.filter(line => {
                return this._checkLineCondition(line, triggerType, locationId, timeOfDay, eventType, eventData);
            });

            if (validLines.length > 0) {
                // 随机选一条
                const line = validLines[Math.floor(Math.random() * validLines.length)];
                const chance = npc.autoTrigger?.chance || TRIGGER_CONFIG.defaultChance;
                const priority = npc.autoTrigger?.priority || 5;

                candidates.push({
                    npcId: npc.id,
                    npcName: npc.name,
                    text: line.text,
                    priority: priority,
                    chance: chance
                });
            }
        });

        // 按优先级排序
        candidates.sort((a, b) => b.priority - a.priority);

        // 按概率触发，最多maxCount条
        for (const candidate of candidates) {
            if (triggered.length >= maxCount) break;
            if (Math.random() < candidate.chance) {
                this._displayLine(candidate);
                this._setCooldown(candidate.npcId);
                triggered.push(candidate);
            }
        }

        return triggered;
    },

    /**
     * 获取某地点的所有background NPC
     */
    _getBackgroundNpcsAtLocation(locationId) {
        const npcs = [];
        if (typeof DataCharacters === 'undefined') return npcs;

        Object.values(DataCharacters).forEach(npc => {
            const tier = NpcTierSystem.getActualTier(npc);
            if (tier !== 'background') return;
            if (npc.location && npc.location !== locationId) return;
            npcs.push(npc);
        });

        return npcs;
    },

    /**
     * 获取NPC在当前stage的环境台词
     */
    _getStageLines(npc, currentStage) {
        if (!npc.ambientLines) return [];
        
        // 优先匹配精确stage
        const exactKey = `stage_${currentStage}`;
        if (npc.ambientLines[exactKey]) {
            return npc.ambientLines[exactKey];
        }

        // 匹配范围（如 stage_1_3 表示stage 1-3）
        for (const key of Object.keys(npc.ambientLines)) {
            if (key.startsWith('stage_')) {
                const rangeMatch = key.match(/^stage_(\d+)_(\d+)$/);
                if (rangeMatch) {
                    const start = parseInt(rangeMatch[1]);
                    const end = parseInt(rangeMatch[2]);
                    if (currentStage >= start && currentStage <= end) {
                        return npc.ambientLines[key];
                    }
                }
            }
        }

        // 默认台词
        if (npc.ambientLines.default) {
            return npc.ambientLines.default;
        }

        return [];
    },

    /**
     * 检查台词条件
     */
    _checkLineCondition(line, triggerType, locationId, timeOfDay, eventType, eventData) {
        if (!line.condition) return true;

        const cond = line.condition;

        // 触发类型匹配
        if (cond.triggerType && cond.triggerType !== triggerType) return false;

        // 地点匹配
        if (cond.location && cond.location !== locationId) return false;

        // 时间匹配
        if (cond.time && timeOfDay && !cond.time.includes(timeOfDay)) return false;

        // 事件类型匹配
        if (cond.eventType && eventType && cond.eventType !== eventType) return false;

        // 玩家等级条件
        if (cond.minLevel && typeof Player !== 'undefined' && Player.level < cond.minLevel) return false;

        // 关系条件
        if (cond.minOpinion && typeof NPCStateSystem !== 'undefined') {
            try {
                if (NPCStateSystem.getOpinion(line.npcId || '') < cond.minOpinion) return false;
            } catch (e) {}
        }

        return true;
    },

    /**
     * 显示环境台词（底部消息条）
     */
    _displayLine(candidate) {
        const message = `[${candidate.npcName}] ${candidate.text}`;
        
        if (typeof UI !== 'undefined' && UI.showMessage) {
            UI.showMessage(message, TRIGGER_CONFIG.messageDisplayMs);
        } else if (typeof Game !== 'undefined' && Game.showMessage) {
            Game.showMessage(message);
        } else {
            console.log(`[Ambient] ${message}`);
        }
    },

    /**
     * 获取当前地点
     */
    _getCurrentLocation() {
        if (typeof Player !== 'undefined' && Player.currentLocation) {
            return Player.currentLocation;
        }
        return 'tianlan_school';
    },

    /**
     * 手动触发某NPC的环境台词（用于调试）
     */
    triggerAmbientLine(npcId) {
        if (typeof DataCharacters === 'undefined') return null;
        const npc = DataCharacters[npcId];
        if (!npc) return null;

        const currentStage = StoryStageSystem.getCurrentStage();
        const lines = this._getStageLines(npc, currentStage);
        if (lines.length === 0) return null;

        const line = lines[Math.floor(Math.random() * lines.length)];
        const candidate = {
            npcId: npc.id,
            npcName: npc.name,
            text: line.text,
            priority: 10
        };

        this._displayLine(candidate);
        return candidate;
    },

    /**
     * 清除所有冷却时间（调试用）
     */
    clearCooldowns() {
        _cooldowns = {};
        this._saveCooldowns();
        console.log('[AmbientDialogue] 已清除所有冷却时间');
    },

    /**
     * 获取触发配置
     */
    getTriggerConfig() {
        return { ...TRIGGER_CONFIG };
    }
};
