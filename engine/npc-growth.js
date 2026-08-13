/**
 * NPC成长系统
 * 
 * 核心思路：基础数据 + 成长事件，系统自动计算NPC在指定剧情阶段的状态。
 * 一套系统同时管理：NPC成长、召唤兽进化、妖魔蜕皮/进化。
 * 
 * 使用方式：
 *   在characters.js或enemies.js的NPC/怪物定义中添加growth字段：
 *   growth: {
 *     base: { level: 1, elements: ["fire"], skills: ["basic_attack"], ... },
 *     events: [
 *       { after: "story_node_id", level: 10, addSkills: [...], addElements: [...] },
 *       ...
 *     ]
 *   }
 * 
 *   NPCGrowthService.getNpcState("mo_fan") → 当前状态
 *   NPCGrowthService.getDuelData("zhao_manyan") → 切磋用战斗数据
 *   NPCGrowthService.getHistoricalState("mo_fan", "bocheng_early") → 历史状态
 */

const NPCGrowthService = {

    // 属性成长模板：每级增加的属性
    _growthTemplates: {
        balanced: { maxHp: 20, maxMp: 10, attack: 3, defense: 2, speed: 1, spirit: 2 },
        mage:     { maxHp: 15, maxMp: 15, attack: 4, defense: 1, speed: 1, spirit: 3 },
        warrior:  { maxHp: 30, maxMp: 5,  attack: 4, defense: 3, speed: 1, spirit: 1 },
        support:  { maxHp: 18, maxMp: 12, attack: 2, defense: 2, speed: 1, spirit: 3 },
        demon:    { maxHp: 25, maxMp: 0,  attack: 4, defense: 2, speed: 2, spirit: 0 },
        summon:   { maxHp: 22, maxMp: 0,  attack: 3, defense: 2, speed: 2, spirit: 0 },
    },

    // 境界加成（固定值，按新等级体系调整）
    _realmBonus: {
        initial: { maxHp: 0, maxMp: 0, attack: 0, defense: 0, speed: 0, spirit: 0 },
        middle:  { maxHp: 150, maxMp: 80, attack: 15, defense: 12, speed: 5, spirit: 10 },
        high:    { maxHp: 500, maxMp: 250, attack: 40, defense: 30, speed: 12, spirit: 25 },
        super:   { maxHp: 1200, maxMp: 600, attack: 90, defense: 70, speed: 25, spirit: 50 },
    },

    // 根据等级推断境界（新等级体系：初阶1-10，中阶11-30，高阶31-55，超阶56+）
    _inferRealm(level) {
        if (level >= 56) return "super";
        if (level >= 31) return "high";
        if (level >= 11) return "middle";
        return "initial";
    },

    /**
     * 获取NPC在指定剧情阶段的完整状态
     * @param {string} npcId - NPC ID
     * @param {string} [storyStage=null] - 剧情阶段ID，默认当前
     * @returns {object} NPC状态对象
     */
    getNpcState(npcId, storyStage = null) {
        const npc = DataCharacters[npcId] || (typeof DataEnemies !== 'undefined' ? DataEnemies[npcId] : null);
        if (!npc) {
            console.warn(`[NPC成长] 找不到NPC: ${npcId}`);
            return null;
        }

        // 如果没有growth定义，直接返回原始数据
        if (!npc.growth) {
            return this._getDefaultState(npc);
        }

        const stage = storyStage || this._getCurrentStoryStage();
        let state = this._cloneBase(npc.growth.base);

        // 依次apply所有已触发的成长事件
        for (const event of npc.growth.events) {
            if (this._isStageReached(event.after, stage)) {
                state = this._applyGrowthEvent(state, event);
            }
        }

        // 计算属性
        state.stats = this._calculateStats(npc, state);
        state.npcId = npcId;
        state.name = npc.name;
        state.realm = state.realm || this._inferRealm(state.level);

        return state;
    },

    /**
     * 获取切磋/战斗用数据（兼容battle.js格式）
     * @param {string} npcId - NPC ID
     * @param {string} [storyStage=null] - 剧情阶段ID
     * @returns {object} 战斗数据对象
     */
    getDuelData(npcId, storyStage = null) {
        const state = this.getNpcState(npcId, storyStage);
        if (!state) return null;

        const npc = DataCharacters[npcId] || DataEnemies[npcId];

        return {
            id: `${npcId}_${state.form || 'default'}`,
            name: state.name || npc.name,
            title: state.title || npc.title || "",
            level: state.level,
            elements: state.elements || [],
            skills: state.skills || ["basic_attack"],
            equipment: state.equipment || [],
            traits: state.traits || [],
            maxHp: state.stats.maxHp,
            hp: state.stats.maxHp,
            maxMp: state.stats.maxMp,
            mp: state.stats.maxMp,
            attack: state.stats.attack,
            defense: state.stats.defense,
            speed: state.stats.speed,
            spirit: state.stats.spirit,
            form: state.form,
            spriteColor: state.spriteColor || npc.spriteColor,
            aiType: npc.aiType || "balanced",
            enemyType: npc.enemyType || "human",
            isEnemy: false,
            isAlly: false,
            isCanon: npc.isCanon !== false,
            growthApplied: true,
        };
    },

    /**
     * 获取历史状态（回忆切磋）
     * @param {string} npcId - NPC ID
     * @param {string} storyStage - 剧情阶段ID
     * @returns {object} 战斗数据
     */
    getHistoricalState(npcId, storyStage) {
        return this.getDuelData(npcId, storyStage);
    },

    /**
     * 获取NPC所有可用的历史阶段（用于回忆切磋选择）
     * @param {string} npcId - NPC ID
     * @returns {Array} 阶段列表 [{stage, label, level}]
     */
    getAvailableStages(npcId) {
        const npc = DataCharacters[npcId] || DataEnemies[npcId];
        if (!npc || !npc.growth) return [];

        const stages = [{
            stage: "_base",
            label: "初遇时",
            level: npc.growth.base.level,
        }];

        for (const event of npc.growth.events) {
            stages.push({
                stage: event.after,
                label: event.title || event.after,
                level: event.level || "?",
            });
        }

        return stages;
    },

    /**
     * 战斗中触发进化/蜕皮
     * @param {object} battleState - 战斗中的敌人状态
     * @param {string} eventId - 成长事件ID（如battle_molt_1）
     * @returns {object} 更新后的战斗状态
     */
    applyBattleEvolution(battleState, eventId) {
        const npcId = battleState.npcId || battleState.id?.split('_')[0];
        const npc = DataCharacters[npcId] || DataEnemies[npcId];
        if (!npc || !npc.growth) return battleState;

        const event = npc.growth.events.find(e => e.after === eventId);
        if (!event) {
            console.warn(`[NPC成长] 找不到战斗进化事件: ${eventId}`);
            return battleState;
        }

        // 从当前战斗状态重建state
        let state = {
            level: battleState.level,
            elements: [...(battleState.elements || [])],
            skills: [...(battleState.skills || [])],
            equipment: [...(battleState.equipment || [])],
            traits: [...(battleState.traits || [])],
            form: battleState.form,
            title: battleState.title,
        };

        state = this._applyGrowthEvent(state, event);
        const stats = this._calculateStats(npc, state);

        // 更新战斗状态（保留当前HP比例）
        const hpRatio = battleState.hp / battleState.maxHp;
        const mpRatio = battleState.mp / battleState.maxMp;

        Object.assign(battleState, {
            level: state.level,
            elements: state.elements,
            skills: state.skills,
            equipment: state.equipment,
            traits: state.traits,
            form: state.form,
            title: state.title || battleState.title,
            maxHp: stats.maxHp,
            maxMp: stats.maxMp,
            hp: Math.floor(stats.maxHp * hpRatio),
            mp: Math.floor(stats.maxMp * mpRatio),
            attack: stats.attack,
            defense: stats.defense,
            speed: stats.speed,
            spirit: stats.spirit,
        });

        if (event.spriteColor) battleState.spriteColor = event.spriteColor;

        return {
            battleState,
            evolved: true,
            newForm: state.form,
            newTitle: state.title,
            message: `${npc.name}${event.title ? ' → ' + event.title : '进化了'}！`,
        };
    },

    // ========== 内部方法 ==========

    _getCurrentStoryStage() {
        // 从全局状态获取当前剧情阶段
        if (typeof player !== 'undefined' && player.storyStage) return player.storyStage;
        if (typeof WorldState !== 'undefined' && WorldState.getStoryStage) return WorldState.getStoryStage();
        if (typeof GameState !== 'undefined' && GameState.storyStage) return GameState.storyStage;
        return "_default";
    },

    // 故事阶段顺序（用于判断阶段先后）
    _storyStageOrder: [
        "_base",
        "star_path_awaken",      // 星路觉醒
        "bocheng_disaster",      // 博城灾难
        "mingzhu_entrance",      // 明珠入学
        "hunter_exam",           // 猎人考核
        "main_campus_exam",      // 主校区考核
        "world_college_tournament", // 世界学府之争
    ],

    _isStageReached(eventStage, currentStage) {
        if (!eventStage || eventStage === "_base") return true;
        if (currentStage === "_default") return false;

        // 如果WorldState有阶段比较函数，用它
        if (typeof WorldState !== 'undefined' && WorldState.isStoryStageReached) {
            return WorldState.isStoryStageReached(eventStage, currentStage);
        }

        // 相同阶段
        if (eventStage === currentStage) return true;

        // 检查已完成列表
        if (typeof WorldState !== 'undefined' && WorldState.completedStages) {
            if (WorldState.completedStages.includes(eventStage)) return true;
        }

        // 用阶段顺序判断：如果eventStage在currentStage之前，则已到达
        const eventIdx = this._storyStageOrder.indexOf(eventStage);
        const currentIdx = this._storyStageOrder.indexOf(currentStage);
        if (eventIdx !== -1 && currentIdx !== -1) {
            return eventIdx <= currentIdx;
        }

        return false;
    },

    _cloneBase(base) {
        return {
            level: base.level || 1,
            elements: [...(base.elements || [])],
            skills: [...(base.skills || ["basic_attack"])],
            equipment: [...(base.equipment || [])],
            traits: [...(base.traits || [])],
            form: base.form || null,
            title: base.title || "",
            spriteColor: base.spriteColor || null,
            unlocks: [...(base.unlocks || [])],
            growthType: base.growthType || "balanced",
            overrideStats: base.overrideStats ? { ...base.overrideStats } : null,
            realm: base.realm || null,
        };
    },

    _applyGrowthEvent(state, event) {
        const newState = {
            ...state,
            elements: [...state.elements],
            skills: [...state.skills],
            equipment: [...state.equipment],
            traits: [...state.traits],
            unlocks: [...(state.unlocks || [])],
        };

        if (event.level) newState.level = event.level;
        if (event.realm) newState.realm = event.realm;
        if (event.title) newState.title = event.title;
        if (event.form) newState.form = event.form;
        if (event.spriteColor) newState.spriteColor = event.spriteColor;
        if (event.growthType) newState.growthType = event.growthType;

        if (event.addElements) {
            for (const el of event.addElements) {
                if (!newState.elements.includes(el)) newState.elements.push(el);
            }
        }
        if (event.removeElements) {
            newState.elements = newState.elements.filter(e => !event.removeElements.includes(e));
        }

        if (event.addSkills) {
            for (const sk of event.addSkills) {
                if (!newState.skills.includes(sk)) newState.skills.push(sk);
            }
        }
        if (event.removeSkills) {
            newState.skills = newState.skills.filter(s => !event.removeSkills.includes(s));
        }

        if (event.addEquipment) {
            for (const eq of event.addEquipment) {
                if (!newState.equipment.includes(eq)) newState.equipment.push(eq);
            }
        }
        if (event.removeEquipment) {
            newState.equipment = newState.equipment.filter(e => !event.removeEquipment.includes(e));
        }

        if (event.addTraits) {
            for (const tr of event.addTraits) {
                if (!newState.traits.includes(tr)) newState.traits.push(tr);
            }
        }
        if (event.removeTraits) {
            newState.traits = newState.traits.filter(t => !event.removeTraits.includes(t));
        }

        if (event.unlocks) {
            for (const u of event.unlocks) {
                if (!newState.unlocks.includes(u)) newState.unlocks.push(u);
            }
        }

        if (event.overrideStats) {
            newState.overrideStats = { ...(newState.overrideStats || {}), ...event.overrideStats };
        }

        return newState;
    },

    _calculateStats(npc, state) {
        // 如果有overrideStats，直接用
        if (state.overrideStats) {
            return {
                maxHp: state.overrideStats.maxHp || 100,
                maxMp: state.overrideStats.maxMp || 50,
                attack: state.overrideStats.attack || 10,
                defense: state.overrideStats.defense || 5,
                speed: state.overrideStats.speed || 10,
                spirit: state.overrideStats.spirit || 10,
            };
        }

        // 用NPC原始数据作为base（如果等级匹配）
        const growthType = state.growthType || this._inferGrowthType(npc, state);
        const template = this._growthTemplates[growthType] || this._growthTemplates.balanced;
        const realm = state.realm || this._inferRealm(state.level);
        const realmBonus = this._realmBonus[realm] || this._realmBonus.initial;

        // 基础值 = NPC原始数据（如果等级接近）或模板基础值
        let baseStats;
        if (npc.level === state.level && npc.maxHp) {
            // NPC原始数据就是这个等级的
            baseStats = {
                maxHp: npc.maxHp,
                maxMp: npc.maxMp || 50,
                attack: npc.attack || 10,
                defense: npc.defense || 5,
                speed: npc.speed || 10,
                spirit: npc.spirit || 10,
            };
        } else {
            // 从1级基础值按成长模板计算
            const baseLevel = 1;
            const levelDiff = state.level - baseLevel;
            baseStats = {
                maxHp: 100 + template.maxHp * levelDiff,
                maxMp: 50 + template.maxMp * levelDiff,
                attack: 10 + template.attack * levelDiff,
                defense: 5 + template.defense * levelDiff,
                speed: 10 + template.speed * levelDiff,
                spirit: 10 + template.spirit * levelDiff,
            };
        }

        // 加上境界加成
        baseStats.maxHp += realmBonus.maxHp;
        baseStats.maxMp += realmBonus.maxMp;
        baseStats.attack += realmBonus.attack;
        baseStats.defense += realmBonus.defense;
        baseStats.speed += realmBonus.speed;
        baseStats.spirit += realmBonus.spirit;

        // 元素数量加成（多系法师更强）
        const elementCount = (state.elements || []).length;
        if (elementCount > 1) {
            const multiBonus = (elementCount - 1) * 0.1;
            baseStats.maxHp = Math.floor(baseStats.maxHp * (1 + multiBonus));
            baseStats.maxMp = Math.floor(baseStats.maxMp * (1 + multiBonus));
            baseStats.attack = Math.floor(baseStats.attack * (1 + multiBonus));
        }

        return baseStats;
    },

    _inferGrowthType(npc, state) {
        if (state.growthType) return state.growthType;
        if (npc.growthType) return npc.growthType;
        if (npc.aiType === "defensive") return "support";
        if (npc.aiType === "aggressive") return "mage";
        if (npc.enemyType === "demon" || npc.demonTier) return "demon";
        if (npc.isSummon) return "summon";
        return "balanced";
    },

    _getDefaultState(npc) {
        return {
            npcId: npc.id,
            name: npc.name,
            level: npc.level || 1,
            elements: npc.elements || [],
            skills: npc.skills || ["basic_attack"],
            equipment: npc.equipment || [],
            traits: npc.traits || [],
            form: null,
            title: npc.title || "",
            realm: this._inferRealm(npc.level || 1),
            stats: {
                maxHp: npc.maxHp || 100,
                maxMp: npc.maxMp || 50,
                attack: npc.attack || 10,
                defense: npc.defense || 5,
                speed: npc.speed || 10,
                spirit: npc.spirit || 10,
            },
        };
    },
};

// 导出（浏览器全局 + CommonJS）
if (typeof window !== 'undefined') {
    window.NPCGrowthService = NPCGrowthService;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCGrowthService;
}
