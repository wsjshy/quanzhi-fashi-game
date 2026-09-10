/**
 * NPC动态分层系统
 * v3.14.0
 * 
 * 管理NPC的动态tier计算和活跃状态，用于控制对话密度。
 * 
 * 核心机制：
 * - tier不是静态标签，随stage动态变化
 * - 核心NPC有活跃状态，控制同时有多少NPC显示"新对话"提示
 * - 密度控制：避免玩家负担过重
 * 
 * 可复用模式：动态分层可用于地点/任务/系统解锁等场景
 */

import { StoryStageSystem } from './story-stage.js';

// 密度控制配置
const DENSITY_CONFIG = {
    maxActiveCoreNPCs: 5,           // 同时活跃核心NPC上限
    maxNewContentHints: 3,           // 同时显示"新对话"提示上限
    maxAmbientPerLocation: 2,        // 每次进入地点触发环境台词上限
    ambientTriggerChance: 0.3,       // 环境台词触发概率
    ambientCooldownHours: 3,          // 环境台词冷却时间（游戏小时）
    relationshipPriorityBonus: 2      // 关系好的NPC优先级加成
};

// 缓存当前stage的计算结果
let _cachedStage = null;
let _cachedTierResults = {};
let _cachedActiveResults = {};

export const NpcTierSystem = {
    /**
     * 初始化
     */
    init() {
        // 注册stage变化回调，stage变化时清除缓存
        StoryStageSystem.onStageChange(() => {
            this._clearCache();
            console.log('[NpcTier] stage变化，已清除分层缓存');
        });
        console.log('NPC动态分层系统初始化完成');
    },

    /**
     * 清除缓存（stage变化时调用）
     */
    _clearCache() {
        _cachedStage = null;
        _cachedTierResults = {};
        _cachedActiveResults = {};
    },

    /**
     * 计算NPC的实际tier（动态）
     * @param {Object} npc - NPC数据对象
     * @returns {string} - core / background / functional
     */
    getActualTier(npc) {
        if (!npc) return 'background';
        
        const currentStage = StoryStageSystem.getCurrentStage();
        
        // 检查缓存
        if (_cachedStage === currentStage && _cachedTierResults[npc.id]) {
            return _cachedTierResults[npc.id];
        }

        let tier = npc.baseTier || npc.tier || 'background';

        // 检查tierOverrides
        if (npc.tierOverrides && npc.tierOverrides[`stage_${currentStage}`]) {
            tier = npc.tierOverrides[`stage_${currentStage}`];
        }

        // 缓存结果
        if (_cachedStage !== currentStage) {
            _cachedStage = currentStage;
            _cachedTierResults = {};
        }
        _cachedTierResults[npc.id] = tier;

        return tier;
    },

    /**
     * 计算NPC的活跃状态
     * @param {Object} npc - NPC数据对象
     * @returns {Object} - { isActive: boolean, priority: number, hasNewContent: boolean }
     */
    getActiveState(npc) {
        if (!npc) return { isActive: false, priority: 0, hasNewContent: false };

        const currentStage = StoryStageSystem.getCurrentStage();
        const cacheKey = `${npc.id}_${currentStage}`;

        // 检查缓存
        if (_cachedActiveResults[cacheKey]) {
            return _cachedActiveResults[cacheKey];
        }

        let result = { isActive: false, priority: 0, hasNewContent: false };

        // 检查activeStages
        if (npc.activeStages && npc.activeStages[`stage_${currentStage}`]) {
            const stageConfig = npc.activeStages[`stage_${currentStage}`];
            result.isActive = true;
            result.priority = stageConfig.priority || 5;
            result.hasNewContent = stageConfig.hasNewContent !== false;
        }

        // 关系加成：与玩家关系好的NPC优先级+2
        if (result.isActive && typeof NPCStateSystem !== 'undefined') {
            try {
                const opinion = NPCStateSystem.getOpinion(npc.id);
                if (opinion >= 50) {
                    result.priority += DENSITY_CONFIG.relationshipPriorityBonus;
                }
            } catch (e) {
                // 忽略关系获取失败
            }
        }

        // 缓存结果
        _cachedActiveResults[cacheKey] = result;

        return result;
    },

    /**
     * 获取当前地点的NPC列表（按tier分层）
     * @param {string} locationId - 地点ID
     * @param {Array} npcIds - NPC ID列表
     * @returns {Object} - { core: [], background: [], functional: [] }
     */
    getNpcsByTier(locationId, npcIds) {
        const result = { core: [], background: [], functional: [] };

        if (!npcIds || !Array.isArray(npcIds)) return result;

        npcIds.forEach(npcId => {
            const npc = typeof DataCharacters !== 'undefined' ? DataCharacters[npcId] : null;
            if (!npc) return;

            // 检查地点匹配
            if (npc.location && npc.location !== locationId) return;

            const tier = this.getActualTier(npc);
            const activeState = this.getActiveState(npc);

            const npcInfo = {
                ...npc,
                actualTier: tier,
                isActive: activeState.isActive,
                activePriority: activeState.priority,
                hasNewContent: activeState.hasNewContent
            };

            if (tier === 'core') {
                result.core.push(npcInfo);
            } else if (tier === 'functional') {
                result.functional.push(npcInfo);
            } else {
                result.background.push(npcInfo);
            }
        });

        // 核心NPC按优先级排序
        result.core.sort((a, b) => b.activePriority - a.activePriority);

        return result;
    },

    /**
     * 获取应该显示"新对话"提示的核心NPC列表（密度控制）
     * @param {Array} coreNpcs - 核心NPC列表
     * @returns {Array} - 应该显示提示的NPC ID列表
     */
    getNewContentHintNpcs(coreNpcs) {
        if (!coreNpcs || !Array.isArray(coreNpcs)) return [];

        // 筛选活跃且有新内容的NPC
        const activeWithContent = coreNpcs.filter(npc => 
            npc.isActive && npc.hasNewContent
        );

        // 按优先级排序
        activeWithContent.sort((a, b) => b.activePriority - a.activePriority);

        // 取前N个
        const maxHints = DENSITY_CONFIG.maxNewContentHints;
        return activeWithContent.slice(0, maxHints).map(npc => npc.id);
    },

    /**
     * 检查NPC是否应该显示"新对话"提示
     * @param {string} npcId - NPC ID
     * @param {Array} coreNpcs - 当前地点的核心NPC列表
     * @returns {boolean}
     */
    shouldShowNewContentHint(npcId, coreNpcs) {
        const hintNpcs = this.getNewContentHintNpcs(coreNpcs);
        return hintNpcs.includes(npcId);
    },

    /**
     * 获取密度配置
     */
    getDensityConfig() {
        return { ...DENSITY_CONFIG };
    },

    /**
     * 更新密度配置（运行时调整）
     * @param {Object} config - 新的配置
     */
    updateDensityConfig(config) {
        Object.assign(DENSITY_CONFIG, config);
        this._clearCache();
    },

    /**
     * 获取所有NPC的分层统计（用于调试）
     */
    getTierStats() {
        if (typeof DataCharacters === 'undefined') return {};

        const stats = { core: 0, background: 0, functional: 0, active: 0 };
        const currentStage = StoryStageSystem.getCurrentStage();

        Object.values(DataCharacters).forEach(npc => {
            const tier = this.getActualTier(npc);
            stats[tier]++;
            
            const activeState = this.getActiveState(npc);
            if (activeState.isActive) stats.active++;
        });

        stats.currentStage = currentStage;
        return stats;
    }
};
