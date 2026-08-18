/**
 * 玩家系统
 * 管理玩家属性、成长、觉醒、技能
 */

// 游戏版本号 - 用于存档兼容性
const GAME_VERSION = '0.14.0';
const SAVE_VERSION = '0.8.7';

// 技能解锁表：按元素和等级定义可解锁的技能
const SKILL_UNLOCK_TABLE = {
    fire: {
        1: ['fire_bolt'],
        3: ['fire_soul'],
        5: ['fire_rain'],
        8: ['fire_burst']
    },
    ice: {
        1: ['ice_spike'],
        3: ['ice_frost'],
        5: ['ice_shield'],
        8: ['ice_storm']
    },
    thunder: {
        1: ['thunder_bolt'],
        3: ['thunder_drive'],
        5: ['thunder_chain'],
        8: ['thunder_strike']
    },
    earth: {
        1: ['earth_shield'],
        3: ['earth_mud'],
        5: ['earth_spike'],
        8: ['earth_quake']
    },
    wind: {
        1: ['wind_blade'],
        3: ['wind_barrier'],
        5: ['wind_speed'],
        8: ['wind_tornado']
    },
    water: {
        1: ['water_heal'],
        3: ['water_moist'],
        5: ['water_chain'],
        8: ['water_wave']
    },
    light: {
        1: ['light_ray'],
        3: ['light_blessing'],
        5: ['light_shield'],
        8: ['light_judgment']
    },
    dark: {
        1: ['dark_bolt'],
        3: ['dark_weakness'],
        5: ['dark_cloak'],
        8: ['dark_curse']
    },
    heal: {
        1: ['heal_light'],
        5: ['heal_holy', 'heal_cleanse'],
        8: ['heal_revive']
    },
    summon: {
        1: ['summon_beast'],
        3: ['summon_strengthen'],
        5: ['summon_rage'],
        8: ['summon_return']
    },
    // 中阶技能（Lv12-28解锁）
    shadow: {
        1: ['shadow_step'],
        12: ['shadow_bind'],
        18: ['shadow_swap'],
        25: ['shadow_possession']
    },
    plant: {
        1: ['vine_whip'],
        12: ['vine_bind'],
        18: ['plant_prison'],
        25: ['plant_wall']
    },
    poison: {
        1: ['poison_dart'],
        12: ['poison_cloud'],
        18: ['poison_corrode'],
        25: ['poison_plague']
    },
    sound: {
        1: ['sound_wave'],
        12: ['sound_stun'],
        18: ['sound_barrier'],
        25: ['sound_destruction']
    }
};

const Player = {
    // 基础信息
    name: '冒险者',
    level: 1,
    exp: 0,
    expToNext: 80,
    attributePoints: 0,

    // 基础属性
    maxHp: 100,
    hp: 100,
    maxMp: 50,
    mp: 50,
    attack: 10,
    defense: 5,
    speed: 10,
    spirit: 10,  // 精神力，影响魔法伤害和MP上限
    maxStamina: 100,  // @deprecated v0.99.0: 体力系统已移除，保留字段用于存档兼容
    stamina: 100,     // @deprecated v0.99.0: 体力系统已移除，保留字段用于存档兼容

    // v0.99.0: 每日行动次数（替代体力系统）
    // v0.99.3: 新增study类别，调整高效期次数
    dailyActions: {
        cultivate: 0,  // 今日修炼次数（修炼魔法+三步塔）
        study: 0,      // 今日学习次数（上课+图书馆）
        hunt: 0,       // 今日猎魔次数
        explore: 0     // 今日探索/逛街次数
    },

    // 元素与技能
    elements: [],
    elementLevels: {},  // 各系独立等级：{ fire: 15, thunder: 3 }
    elementExp: {},     // 各系独立经验：{ fire: 500, thunder: 0 }
    skills: ['basic_attack'],
    skillLevels: {},  // 技能等级：{ skillId: { level, exp } }
    realm: 'initial',  // 境界：initial/middle/high/super
    talents: {},  // 天赋：{ elementId: { talentId, level, exp } }
    primaryElement: null,  // v2.4.0: 主修系（100%天赋效果，解锁主动技能）
    secondaryElement: null,  // v2.4.0: 副修系（70%天赋效果，与主修系触发跨系组合）
    spiritSeeds: {},  // 灵种：{ elementId: seedId }
    starDustArtifacts: {},  // 星尘魔器：{ elementId: { id, level, exp } }
    starDustAssignment: null,  // v1.8.2: 学校/家族分配的星尘魔器临时使用权 { artifactId, grade, daysRemaining, totalDays, source, assignedDay, expireDay }
    tempBreakthroughBonus: 0,  // 临时突破成功率加成
    npcRelations: {},  // NPC关系：{ npcId: { opinion, trust, familiarity } }

    // 金钱
    gold: 50,

    // 装备
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },

    // 任务
    activeQuests: [],
    completedQuests: [],

    // 进度
    currentLocation: 'tianlan_school',
    day: 1,
    hour: 8,  // 当前小时（0-23）
    timeOfDay: 'morning',  // morning/afternoon/evening/night
    flags: {},
    bestiary: {},  // 妖魔图鉴：{enemyId: {kills: N, firstKillDay: N, lastKillDay: N}}
    dailyData: null,  // 日常系统数据
    unlockedLocations: ['tianlan_school', 'city_street', 'xuefeng_mountain'],

    // 战斗状态
    battleBuffs: [],
    winStreak: 0,  // 连胜次数
    lastBattleDay: 0,  // 最后一次战斗的日期（用于和平主义者成就）
    summonData: null,  // 当前激活的召唤兽（指向summonBeasts中的一个，方便战斗代码直接使用）
    summonBeasts: [],   // 所有已契约的召唤兽数组
    activeSummonIndex: 0,  // 当前激活的召唤兽索引

    /**
     * 初始化新玩家
     */
    init(name, element) {
        this.name = name || '冒险者';
        this.level = 1;
        this.exp = 0;
        this.expToNext = this._calcExpToNext(1);
        this.attributePoints = 0;
        this.maxHp = 120;
        this.hp = 120;
        this.maxMp = 60;
        this.mp = 60;
        this.attack = 15;
        this.defense = 8;
        this.speed = 10;
        this.spirit = 12;
        this.composure = 50;  // v1.6.1: 心境/定力（0-100），影响技能释放成功率和考核表现
        this.maxStamina = 100;
        this.stamina = 100;
        this.elements = element ? [element] : [];
        this.elementLevels = {};
        this.elementExp = {};
        if (element) {
            this.elementLevels[element] = 1;
            this.elementExp[element] = 0;
        }
        this.skills = ['basic_attack'];
        this.skillLevels = {};  // 技能等级
        this.realm = 'initial';  // 境界
        this.talents = {};  // 系别天赋
        this.innateTalent = null;  // 自身天赋（天生天赋）
        this.innateEffects = {};  // 自身天赋效果
        this.innateTalentLevel = 1;  // 自身天赋等级（每5级角色等级进化一次）
        this.gold = 50;
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.enhanceLevels = { weapon: 0, armor: 0, accessory: 0 };
        this.enhanceFailStreak = { weapon: 0, armor: 0, accessory: 0 };  // v0.14.0: 连续失败计数，用于保底机制
        this.enhanceHistory = [];  // v0.14.0: 强化记录，最近10次
        this.skillMemory = {};  // v0.15.0: 技能记忆，{ enemyId: skillId } 对每种妖魔最后使用的技能
        this.influence = 0;  // v0.19.0: 玩家影响力点数，通过改变剧情获得
        this.changedStoryNodes = [];  // v0.19.0: 已改变的剧情节点ID列表
        this.activeQuests = [];
        this.completedQuests = [];
        this.currentLocation = 'tianlan_school';
        this.day = 1;  // 游戏从第1天开始（博城历2008年9月1日）
        this.hour = 8;  // 初始时间：早上8点
        this.timeOfDay = 'morning';
        this.flags = {};
        this.investigation = {  // v1.8.1: 阴谋调查系统
          demon: 0,
          black_church: 0,
          yu_ang: 0,
          earth_spring: 0,
          discoveredClues: [],
          yuAngSuspicion: 0
        };
        this.bestiary = {};
        this.dailyData = null;  // 由 DailySystem.initNewGame() 初始化
        this.unlockedLocations = ['tianlan_school', 'city_street', 'xuefeng_mountain'];
        this.battleBuffs = [];
        this.tempShopDiscount = 1.0;  // 临时商店折扣率（1.0=不打折）
        this.tempShopDiscountExpireDay = 0;  // 折扣到期天数
        this.summonData = null;  // 召唤兽数据（契约后初始化）
        this.summonBeasts = [];  // 多召唤兽数组
        this.activeSummonIndex = 0;
        this.exploredLocations = [];  // v0.9.0: 已探索的地点（用于首次探索奖励）
        this.exploredNPCs = [];  // v0.9.0: 已对话的NPC（用于首次对话奖励）
        this.fatigueLevel = 0;  // v0.9.1: 疲劳等级（0=正常，1=疲劳，2=重伤），低体力战斗后概率获得，休息后清除
        this.explorationComplete = [];  // v0.9.1: 已100%探索完成的区域ID列表
        this.consecutiveExplores = 0;  // v0.9.8: 连续探索新地点计数，非探索行动重置为0
        this.exploredActions = {};  // v0.9.9: 行动级别探索记录，key为locationId，value为已探索行动ID数组
        this.dailyStats = {  // v0.9.4: 每日统计
            day: 1,
            expGained: 0,
            goldGained: 0,
            battlesWon: 0,
            locationsExplored: 0,
            npcsTalked: 0
        };

        // 如果选了元素，给对应的初始技能
        if (element) {
            const starterSkills = {
                fire: 'fire_bolt',
                ice: 'ice_spike',
                thunder: 'thunder_bolt',
                earth: 'earth_shield',
                wind: 'wind_blade',
                water: 'water_heal',
                light: 'light_ray',
                dark: 'dark_bolt'
            };
            if (starterSkills[element]) {
                this.skills.push(starterSkills[element]);
            }
            
            // 初始化天生天赋
            if (typeof TalentSystem !== 'undefined' && TalentSystem.initTalentForElement) {
                this.talents[element] = TalentSystem.initTalentForElement(element);
            }
        }
    },

    /**
     * 获取总属性（基础 + 装备加成）
     */
    getTotalStats() {
        let stats = {
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            maxHp: this.maxHp,
            maxMp: this.maxMp,
            maxStamina: this.maxStamina,
            critRate: 0.05,
            hitRate: 0.95
        };

        // 装备加成（含强化加成）
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const itemId = this.equipment[slot];
            if (itemId) {
                const item = Inventory.getItem(itemId);
                if (item && item.equipStats) {
                    const enhanceLevel = this.enhanceLevels[slot] || 0;
                    const enhanceMultiplier = 1 + enhanceLevel * 0.1; // 每级强化+10%属性
                    Object.keys(item.equipStats).forEach(key => {
                        const baseVal = item.equipStats[key];
                        // v1.2.1: 百分比属性（值<1，如暴击率/命中率）不向下取整，保留小数；整数属性强化后至少比基础多1
                        let enhancedVal;
                        if (baseVal < 1 && baseVal > 0) {
                            // 百分比属性，保留4位小数
                            enhancedVal = Math.round(baseVal * enhanceMultiplier * 10000) / 10000;
                        } else {
                            // 整数属性，向下取整但确保强化后有提升
                            enhancedVal = Math.floor(baseVal * enhanceMultiplier);
                            if (enhanceLevel > 0 && enhancedVal <= baseVal) {
                                enhancedVal = baseVal + enhanceLevel; // 至少每级+1
                            }
                        }
                        stats[key] = (stats[key] || 0) + enhancedVal;
                    });
                }
            }
        });

        // Buff加成
        this.battleBuffs.forEach(buff => {
            if (buff.statModifiers) {
                Object.keys(buff.statModifiers).forEach(key => {
                    stats[key] = (stats[key] || 0) + buff.statModifiers[key];
                });
            }
        });
        
        // 灵种被动加成
        if (typeof SpiritSeedSystem !== 'undefined' && this.spiritSeeds) {
            for (const element in this.spiritSeeds) {
                const seedEffects = this.getElementSpiritSeedEffects(element);
                if (seedEffects.defenseBonus) {
                    stats.defense += Math.floor(stats.defense * seedEffects.defenseBonus);
                }
                if (seedEffects.speedBonus) {
                    stats.speed += Math.floor(stats.speed * seedEffects.speedBonus);
                }
            }
        }

        // v0.41.0: 传奇法师影响力加成 - 全属性+5%
        const infTier = this.getInfluenceTier ? this.getInfluenceTier() : { level: 0 };
        if (infTier.level >= 4) {
            stats.attack = Math.floor(stats.attack * 1.05);
            stats.defense = Math.floor(stats.defense * 1.05);
            stats.speed = Math.floor(stats.speed * 1.05);
            stats.maxHp = Math.floor(stats.maxHp * 1.05);
            stats.maxMp = Math.floor(stats.maxMp * 1.05);
        }
        
        // v1.5.1: 天赋基础属性效果（hpBonus/mpBonus/maxHpBonus等）
        if (typeof TalentSystem !== 'undefined' && this.talents) {
            const allTalentEffects = TalentSystem.getAllTalentEffects(this.talents);
            if (allTalentEffects.hpBonus) stats.maxHp = Math.floor(stats.maxHp * (1 + allTalentEffects.hpBonus));
            if (allTalentEffects.mpBonus) stats.maxMp = Math.floor(stats.maxMp * (1 + allTalentEffects.mpBonus));
            if (allTalentEffects.maxHpBonus) stats.maxHp = Math.floor(stats.maxHp * (1 + allTalentEffects.maxHpBonus));
            if (allTalentEffects.maxMpBonus) stats.maxMp = Math.floor(stats.maxMp * (1 + allTalentEffects.maxMpBonus));
            if (allTalentEffects.attackBonus) stats.attack = Math.floor(stats.attack * (1 + allTalentEffects.attackBonus));
            if (allTalentEffects.defenseBonus) stats.defense = Math.floor(stats.defense * (1 + allTalentEffects.defenseBonus));
            if (allTalentEffects.speedBonus) stats.speed = Math.floor(stats.speed * (1 + allTalentEffects.speedBonus));
            if (allTalentEffects.critRate) stats.critRate += allTalentEffects.critRate;
            if (allTalentEffects.dodgeRate || allTalentEffects.dodgeBonus) stats.dodgeRate = (stats.dodgeRate || 0) + (allTalentEffects.dodgeRate || allTalentEffects.dodgeBonus || 0);
        }

        return stats;
    },

    /**
     * 获取装备强化费用
     */
    getEnhanceCost(slot) {
        const level = this.enhanceLevels[slot] || 0;
        const baseCost = 100;
        return Math.floor(baseCost * Math.pow(1.5, level));
    },

    /**
     * 获取强化成功率
     */
    getEnhanceSuccessRate(slot) {
        const level = this.enhanceLevels[slot] || 0;
        return Math.max(0.2, 1.0 - level * 0.08);
    },

    /**
     * v0.74.0: 强化材料加成配置
     * 材料ID -> 成功率加成（百分比）
     */
    enhanceMaterialBonus: {
        rat_tail: 0.05,           // 猩鼠尾 +5%
        wolf_bone_spike: 0.08,    // 魔狼骨刺 +8%
        elite_core: 0.15,         // 精英核心 +15%
        demon_core: 0.03          // 妖魔精核 +3%
    },

    /**
     * v0.74.0: 获取材料的强化加成
     */
    getEnhanceMaterialBonus(materialId) {
        return this.enhanceMaterialBonus[materialId] || 0;
    },

    /**
     * v0.74.0: 获取玩家拥有的可用于强化的材料列表
     */
    getAvailableEnhanceMaterials() {
        const materials = [];
        for (const matId in this.enhanceMaterialBonus) {
            const count = (typeof Inventory !== 'undefined') ? Inventory.getItemCount(matId) : 0;
            if (count > 0) {
                const item = (typeof DataItems !== 'undefined') ? DataItems[matId] : null;
                materials.push({
                    id: matId,
                    name: item?.name || matId,
                    icon: item?.icon || '📦',
                    count: count,
                    bonus: this.enhanceMaterialBonus[matId]
                });
            }
        }
        return materials;
    },

    /**
     * 强化装备
     * v0.14.0: 增加保底机制（连续失败3次后下次必定成功）和强化记录
     * v0.74.0: 支持使用材料提高成功率（materialId可选）
     * 返回 { success: boolean, message: string, newLevel: number, isGuaranteed: boolean }
     */
    enhanceEquipment(slot, materialId = null) {
        const itemId = this.equipment[slot];
        if (!itemId) {
            return { success: false, message: '该槽位没有装备' };
        }

        const currentLevel = this.enhanceLevels[slot] || 0;
        if (currentLevel >= 10) {
            return { success: false, message: '已达到最高强化等级+10' };
        }

        const cost = this.getEnhanceCost(slot);
        if (this.gold < cost) {
            return { success: false, message: `金币不足，需要${cost}金币` };
        }

        // v0.74.0: 检查并消耗材料
        let materialBonus = 0;
        let materialName = '';
        if (materialId) {
            const matCount = (typeof Inventory !== 'undefined') ? Inventory.getItemCount(materialId) : 0;
            if (matCount < 1) {
                return { success: false, message: '材料不足' };
            }
            materialBonus = this.getEnhanceMaterialBonus(materialId);
            if (materialBonus <= 0) {
                return { success: false, message: '该材料不能用于强化' };
            }
            if (typeof Inventory !== 'undefined') Inventory.removeItem(materialId, 1);
            const matItem = (typeof DataItems !== 'undefined') ? DataItems[materialId] : null;
            materialName = matItem?.name || materialId;
        }

        this.gold -= cost;
        
        // v0.14.0: 保底机制 - 连续失败3次后下次必定成功
        const failStreak = this.enhanceFailStreak[slot] || 0;
        const isGuaranteed = failStreak >= 3;
        const baseRate = this.getEnhanceSuccessRate(slot);
        // v0.74.0: 材料加成，成功率上限95%
        const successRate = isGuaranteed ? 1 : Math.min(0.95, baseRate + materialBonus);
        const success = isGuaranteed || Math.random() < successRate;

        if (success) {
            this.enhanceLevels[slot] = currentLevel + 1;
            // v0.14.0: 成功后重置连续失败计数
            this.enhanceFailStreak[slot] = 0;
            // v0.14.0: 记录强化结果
            this.enhanceHistory.unshift({
                slot: slot,
                success: true,
                fromLevel: currentLevel,
                toLevel: currentLevel + 1,
                cost: cost,
                isGuaranteed: isGuaranteed,
                time: Date.now()
            });
            if (this.enhanceHistory.length > 10) this.enhanceHistory.pop();
            
            const msg = isGuaranteed 
                ? `🎉 保底触发！${this.getSlotName(slot)}强化到+${currentLevel + 1}！` 
                : `强化成功！${this.getSlotName(slot)}强化到+${currentLevel + 1}`;
            return {
                success: true,
                message: msg,
                newLevel: currentLevel + 1,
                isGuaranteed: isGuaranteed
            };
        } else {
            // v0.14.0: 失败后增加连续失败计数
            this.enhanceFailStreak[slot] = failStreak + 1;
            // 失败降级（0级不降级）
            let newLevel = currentLevel;
            if (currentLevel > 0) {
                this.enhanceLevels[slot] = currentLevel - 1;
                newLevel = currentLevel - 1;
            }
            // v0.14.0: 记录强化结果
            this.enhanceHistory.unshift({
                slot: slot,
                success: false,
                fromLevel: currentLevel,
                toLevel: newLevel,
                cost: cost,
                isGuaranteed: false,
                time: Date.now()
            });
            if (this.enhanceHistory.length > 10) this.enhanceHistory.pop();
            
            const nextGuaranteed = (failStreak + 1) >= 3;
            const msg = currentLevel > 0 
                ? `强化失败！${this.getSlotName(slot)}降级到+${newLevel}${nextGuaranteed ? '（下次必定成功！）' : ''}`
                : `强化失败！装备等级未变化${nextGuaranteed ? '（下次必定成功！）' : ''}`;
            return {
                success: false,
                message: msg,
                newLevel: newLevel,
                isGuaranteed: false
            };
        }
    },

    /**
     * v0.77.0: 装备强化继承
     * 将旧装备的强化等级转移到新装备上（同部位）
     * @param {string} slot - 装备槽位 (weapon/armor/accessory)
     * @param {string} targetItemId - 目标装备ID（背包中的同部位装备）
     */
    inheritEnhance(slot, targetItemId) {
        const currentItemId = this.equipment[slot];
        if (!currentItemId) {
            return { success: false, message: '该槽位没有装备' };
        }

        const currentLevel = this.enhanceLevels[slot] || 0;
        if (currentLevel <= 0) {
            return { success: false, message: '当前装备没有强化等级，无需继承' };
        }

        // 检查目标装备是否在背包中
        const targetCount = (typeof Inventory !== 'undefined') ? Inventory.getItemCount(targetItemId) : 0;
        if (targetCount < 1) {
            return { success: false, message: '目标装备不在背包中' };
        }

        // 检查目标装备是否同部位
        const targetItem = (typeof DataItems !== 'undefined') ? DataItems[targetItemId] : null;
        if (!targetItem || (targetItem.equipSlot !== slot && targetItem.type !== slot)) {
            return { success: false, message: '只能继承到同部位装备' };
        }

        // 继承消耗：基础100金币 + 每级20金币
        const cost = 100 + currentLevel * 20;
        if (this.gold < cost) {
            return { success: false, message: `金币不足，需要${cost}金币` };
        }

        // 执行继承
        this.gold -= cost;

        // 卸下当前装备（放回背包）
        if (typeof Inventory !== 'undefined') {
            Inventory.addItem(currentItemId, 1);
        }

        // 装备目标装备
        this.equipment[slot] = targetItemId;
        if (typeof Inventory !== 'undefined') {
            Inventory.removeItem(targetItemId, 1);
        }

        // 转移强化等级（旧装备强化清零，新装备获得强化等级）
        this.enhanceLevels[slot] = currentLevel;
        this.enhanceFailStreak[slot] = 0;

        const currentName = (typeof DataItems !== 'undefined' && DataItems[currentItemId]) ? DataItems[currentItemId].name : currentItemId;
        const targetName = targetItem.name || targetItemId;

        return {
            success: true,
            message: `继承成功！${currentName}(+${currentLevel}) → ${targetName}(+${currentLevel})，消耗${cost}金币`,
            oldItem: currentItemId,
            newItem: targetItemId,
            level: currentLevel,
            cost: cost
        };
    },

    /**
     * 获取可继承的目标装备列表（背包中同部位的装备）
     */
    getInheritTargets(slot) {
        const targets = [];
        if (typeof Inventory === 'undefined' || typeof DataItems === 'undefined') return targets;

        // Inventory.items 是数组 [{itemId, count}]
        for (const invItem of Inventory.items) {
            if (invItem.count > 0) {
                const item = DataItems[invItem.itemId];
                if (item && (item.equipSlot === slot || item.type === slot)) {
                    targets.push({
                        id: invItem.itemId,
                        name: item.name,
                        icon: item.icon || '⚔️',
                        count: invItem.count,
                        rarity: item.rarity || 'common'
                    });
                }
            }
        }
        return targets;
    },

    /**
     * 获取槽位名称
     */
    getSlotName(slot) {
        const names = { weapon: '武器', armor: '护甲', accessory: '饰品' };
        return names[slot] || slot;
    },

    /**
     * 获取玩家全局等级（= 最高系等级）
     */
    getPlayerLevel() {
        let maxLv = 1;
        for (const e of this.elements) {
            if (this.elementLevels[e] && this.elementLevels[e] > maxLv) {
                maxLv = this.elementLevels[e];
            }
        }
        return maxLv;
    },

    /**
     * 获取指定系的等级
     */
    getElementLevel(element) {
        return this.elementLevels[element] || 0;
    },

    /**
     * v0.39.0: 获取影响力等级
     * 5个等级：无名小卒/崭露头角/小有名气/声名远扬/传奇法师
     */
    getInfluenceTier() {
        const inf = this.influence || 0;
        if (inf >= 100) return { level: 4, name: '传奇法师', color: '#ff6b6b' };
        if (inf >= 60) return { level: 3, name: '声名远扬', color: '#ffd93d' };
        if (inf >= 30) return { level: 2, name: '小有名气', color: '#6bcb77' };
        if (inf >= 10) return { level: 1, name: '崭露头角', color: '#4d96ff' };
        return { level: 0, name: '无名小卒', color: '#999' };
    },

    /**
     * v0.43.0: 集中式影响力获取，自动检测等级跨越并触发里程碑事件
     */
    gainInfluence(amount, source = '') {
        const oldTier = this.getInfluenceTier().level;
        this.influence = (this.influence || 0) + amount;
        const newTier = this.getInfluenceTier().level;

        // 检测等级跨越
        if (newTier > oldTier) {
            if (!this._pendingInfluenceMilestones) this._pendingInfluenceMilestones = [];
            this._pendingInfluenceMilestones.push({
                fromLevel: oldTier,
                toLevel: newTier,
                source: source
            });
        }
        return { amount, tieredUp: newTier > oldTier, newTier };
    },

    /**
     * 获取新系修炼加速系数
     * 高境界法师修炼新系更快：中阶×2/高阶×4/超阶×8
     */
    _getNewElementExpBonus(targetElement) {
        const playerLv = this.getPlayerLevel();
        const targetLv = this.getElementLevel(targetElement);
        // 如果该系等级接近全局等级，不给加成
        if (targetLv >= playerLv - 2) return 1;
        // 按全局境界给加成
        if (playerLv >= 56) return 8;
        if (playerLv >= 31) return 4;
        if (playerLv >= 11) return 2;
        return 1;
    },

    /**
     * 给指定系加经验
     * @param {string} element - 元素系ID
     * @param {number} amount - 经验值
     * @returns {object} { levelUps, newSkills, canAwaken }
     */
    gainElementExp(element, amount) {
        if (!this.elements.includes(element)) {
            console.warn(`[玩家] 尝试给未觉醒的系 ${element} 加经验`);
            return { levelUps: [], newSkills: [], canAwaken: false };
        }

        // 新系修炼加速
        const bonus = this._getNewElementExpBonus(element);
        const finalAmount = Math.floor(amount * bonus);

        if (!this.elementExp[element]) this.elementExp[element] = 0;
        this.elementExp[element] += finalAmount;

        const levelUps = [];
        const allNewSkills = [];
        let canAwaken = false;
        let oldPlayerLv = this.getPlayerLevel();

        // 循环检查该系升级
        while (true) {
            const curLv = this.elementLevels[element] || 1;
            const expNeeded = this._calcExpToNext(curLv);
            if (this.elementExp[element] < expNeeded) break;

            this.elementExp[element] -= expNeeded;
            const result = this._elementLevelUp(element);
            levelUps.push({ element, level: this.elementLevels[element] });
            allNewSkills.push(...(result.newSkills || []));
            if (result.canAwaken) canAwaken = true;
        }

        // 更新全局等级缓存
        const newPlayerLv = this.getPlayerLevel();
        this.level = newPlayerLv;
        this.expToNext = this._calcExpToNext(newPlayerLv);
        // this.exp 显示为最高系的当前经验
        const topElement = this._getTopElement();
        this.exp = topElement ? (this.elementExp[topElement] || 0) : 0;

        // 全局等级提升时的额外处理
        if (newPlayerLv > oldPlayerLv) {
            this._onPlayerLevelUp(oldPlayerLv, newPlayerLv, levelUps, allNewSkills, canAwaken);
        }

        return { levelUps, newSkills: allNewSkills, canAwaken };
    },

    /**
     * 获取等级最高的系
     */
    _getTopElement() {
        let topEl = null;
        let topLv = 0;
        for (const e of this.elements) {
            const lv = this.elementLevels[e] || 0;
            if (lv > topLv) {
                topLv = lv;
                topEl = e;
            }
        }
        return topEl;
    },

    /**
     * 全局等级提升时的处理（任务/成就/境界检查）
     */
    _onPlayerLevelUp(oldLv, newLv, levelUps, allNewSkills, canAwaken) {
        // 更新等级相关的任务进度
        if (typeof QuestSystem !== 'undefined') {
            try { QuestSystem.updateProgress('level'); } catch (e) {}
        }

        // 成就检查
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const levelAchievements = [
                    { id: 'level_5', value: 5 },
                    { id: 'level_10', value: 10 },
                    { id: 'level_20', value: 20 },
                    { id: 'level_30', value: 30 },
                    { id: 'level_50', value: 50 },
                ];
                levelAchievements.forEach(ach => {
                    if (newLv >= ach.value && !WorldState.hasAchievement(ach.id)) {
                        const achData = DataAchievements[ach.id];
                        if (achData) WorldState.unlockAchievement(ach.id, achData);
                    }
                });
                if (newLv >= 10 && this.day <= 7 && !WorldState.hasAchievement('speedrunner')) {
                    const achData = DataAchievements['speedrunner'];
                    if (achData) WorldState.unlockAchievement('speedrunner', achData);
                }
            } catch (e) {}
        }

        // v0.30.0: 玩家成长里程碑事件
        const playerMilestones = [5, 8, 10, 12, 15, 18, 20];
        if (playerMilestones.includes(newLv)) {
            if (!this._pendingPlayerMilestones) this._pendingPlayerMilestones = [];
            this._pendingPlayerMilestones.push(newLv);
        }
    },

    /**
     * 获得经验（兼容旧接口，分配给所有已觉醒系）
     * @param {number} amount - 经验值
     * @param {string[]} usedElements - 本场战斗使用过的元素系（可选，这些系获全额经验，其他系获30%）
     */
    gainExp(amount, usedElements) {
        // v0.9.4: 更新每日统计
        if (this.dailyStats) {
            this.dailyStats.expGained = (this.dailyStats.expGained || 0) + amount;
        }
        const allLevelUps = [];
        const allNewSkills = [];
        let canAwaken = false;

        if (!usedElements || usedElements.length === 0) {
            // 没指定使用系，所有系平分经验
            const share = Math.floor(amount / this.elements.length);
            for (const el of this.elements) {
                const result = this.gainElementExp(el, share);
                allLevelUps.push(...result.levelUps);
                allNewSkills.push(...result.newSkills);
                if (result.canAwaken) canAwaken = true;
            }
        } else {
            // 使用过的系获全额经验
            const usedSet = new Set(usedElements.filter(e => this.elements.includes(e)));
            for (const el of usedSet) {
                const result = this.gainElementExp(el, amount);
                allLevelUps.push(...result.levelUps);
                allNewSkills.push(...result.newSkills);
                if (result.canAwaken) canAwaken = true;
            }
            // 其他已觉醒系获30%经验（实战感悟）
            for (const el of this.elements) {
                if (!usedSet.has(el)) {
                    const result = this.gainElementExp(el, Math.floor(amount * 0.3));
                    allLevelUps.push(...result.levelUps);
                    allNewSkills.push(...result.newSkills);
                    if (result.canAwaken) canAwaken = true;
                }
            }
        }

        return { levelUps: allLevelUps, newSkills: allNewSkills, canAwaken };
    },

    /**
     * 计算升级所需经验
     * 新等级体系（v0.8.6）：
     * 初阶 Lv1-10：base 80, rate 1.25（快速上手，每级打1-6场）
     * 中阶 Lv11-30：base 500, rate 1.15（稳步成长，每级打2-10场）
     * 高阶 Lv31-55：base 8000, rate 1.12（长期目标，每级打5-20场）
     * 超阶 Lv56-80：base 120000, rate 1.10（终局内容，每级打10-50场）
     */
    _calcExpToNext(level) {
        if (level <= 10) {
            // 初阶：80 ~ 596
            return Math.floor(80 * Math.pow(1.25, level - 1));
        } else if (level <= 30) {
            // 中阶：500 ~ 7116
            return Math.floor(500 * Math.pow(1.15, level - 11));
        } else if (level <= 55) {
            // 高阶：8000 ~ 121429
            return Math.floor(8000 * Math.pow(1.12, level - 31));
        } else {
            // 超阶：120000 ~ 1181968
            return Math.floor(120000 * Math.pow(1.10, level - 56));
        }
    },

    /**
     * 获取当前等级每级的属性成长值
     * 按境界递增：初阶少→中阶中→高阶多→超阶多
     */
    _getLevelGrowth(level) {
        const lv = level || this.getPlayerLevel();
        if (lv <= 10) {
            return { hp: 12, mp: 6, atk: 2, def: 1, spd: 1, spr: 1, apt: 2 };
        } else if (lv <= 30) {
            return { hp: 15, mp: 10, atk: 3, def: 2, spd: 1, spr: 2, apt: 3 };
        } else if (lv <= 55) {
            return { hp: 20, mp: 15, atk: 4, def: 3, spd: 2, spr: 3, apt: 4 };
        } else {
            return { hp: 25, mp: 20, atk: 5, def: 4, spd: 2, spr: 4, apt: 5 };
        }
    },

    /**
     * 指定系升级（内部方法）
     */
    _elementLevelUp(element) {
        if (!this.elementLevels[element]) this.elementLevels[element] = 1;
        const oldPlayerLv = this.getPlayerLevel();
        this.elementLevels[element]++;
        const newPlayerLv = this.getPlayerLevel();

        // 只有全局等级提升时才加属性（避免多系重复加属性）
        if (newPlayerLv > oldPlayerLv) {
            const growth = this._getLevelGrowth(newPlayerLv);
            this.attributePoints += growth.apt;
            this.maxHp += growth.hp;
            this.maxMp += growth.mp;
            this.attack += growth.atk;
            this.defense += growth.def;
            this.speed += growth.spd;
            this.spirit += growth.spr;

            // 天生天赋进化：每5级进化一次
            if (this.innateTalent && newPlayerLv % 5 === 0) {
                this.innateTalentLevel = (this.innateTalentLevel || 1) + 1;
                this._innateTalentEvolved = true;
            }
        }

        // 升级回满
        this.hp = this.maxHp;
        this.mp = this.maxMp;

        // 检查该系新解锁技能
        const newSkills = this._checkElementSkillUnlocks(element);

        // 检查是否可以觉醒新系
        const canAwaken = this.canAwakenNewElement();

        return { newSkills, canAwaken };
    },

    /**
     * 检查所有系可解锁的技能
     */
    checkSkillUnlocks() {
        const newSkills = [];
        this.elements.forEach(element => {
            const elSkills = this._checkElementSkillUnlocks(element);
            newSkills.push(...elSkills);
        });
        return newSkills;
    },

    /**
     * 检查指定系可解锁的技能
     */
    _checkElementSkillUnlocks(element) {
        const newSkills = [];
        const unlockTable = SKILL_UNLOCK_TABLE[element];
        if (!unlockTable) return newSkills;

        const elLevel = this.elementLevels[element] || 1;
        Object.keys(unlockTable).forEach(levelStr => {
            const unlockLevel = parseInt(levelStr);
            if (unlockLevel <= elLevel) {
                unlockTable[unlockLevel].forEach(skillId => {
                    if (!this.skills.includes(skillId) && SkillSystem.getSkill(skillId)) {
                        this.skills.push(skillId);
                        newSkills.push(skillId);
                    }
                });
            }
        });
        return newSkills;
    },

    /**
     * 分配属性点
     */
    addAttribute(attr) {
        if (this.attributePoints <= 0) return false;
        
        const attrMap = {
            attack: { stat: 'attack', amount: 2 },
            defense: { stat: 'defense', amount: 2 },
            speed: { stat: 'speed', amount: 2 },
            vitality: { stat: 'maxHp', amount: 20, also: 'hp' },
            spirit: { stat: 'maxMp', amount: 10, also: 'mp', extra: { stat: 'spirit', amount: 1 } }
        };

        const config = attrMap[attr];
        if (!config) return false;

        this[config.stat] += config.amount;
        if (config.also) {
            this[config.also] += config.amount;
        }
        if (config.extra) {
            this[config.extra.stat] += config.extra.amount;
        }
        
        this.attributePoints--;
        return true;
    },

    /**
     * 觉醒元素
     * @param {string} element - 元素系ID
     * @returns {object} {success, message, unlockedSkills}
     */
    awakenElement(element) {
        // 检查是否已觉醒
        if (this.elements.includes(element)) {
            return { success: false, message: '你已经觉醒了该元素系' };
        }

        // 检查觉醒条件：第二系Lv10（中阶），第三系Lv30（高阶），第四系Lv55（超阶）
        const currentElementCount = this.elements.length;
        const requiredLevel = currentElementCount === 0 ? 1 : currentElementCount === 1 ? 10 : currentElementCount === 2 ? 30 : 55;
        if (this.getPlayerLevel() < requiredLevel) {
            const rankName = requiredLevel >= 55 ? '超阶' : requiredLevel >= 30 ? '高阶' : '中阶';
            return { success: false, message: `需要达到${rankName}（${requiredLevel}级）才能觉醒新元素系` };
        }

        // 最多觉醒4系
        if (currentElementCount >= 4) {
            return { success: false, message: '最多只能觉醒4个元素系' };
        }

        // 觉醒：新系从Lv1开始
        this.elements.push(element);
        this.elementLevels[element] = 1;
        this.elementExp[element] = 0;

        // 初始化天生天赋
        if (typeof TalentSystem !== 'undefined' && TalentSystem.initTalentForElement) {
            this.talents[element] = TalentSystem.initTalentForElement(element);
        }

        // v2.4.0: 自动设置主修系（如果还没有）
        if (!this.primaryElement) {
            this.primaryElement = element;
        }

        // 新系从Lv1开始，只解锁该系1级技能
        const unlockedSkills = [];
        const starterTable = SKILL_UNLOCK_TABLE[element];
        if (starterTable && starterTable[1]) {
            starterTable[1].forEach(skillId => {
                if (!this.skills.includes(skillId)) {
                    this.skills.push(skillId);
                    unlockedSkills.push(skillId);
                }
            });
        }
        
        // 成就检查
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const awakenCount = this.elements.length;
                const awakenAchievements = [
                    { id: 'awaken_2', value: 2 },
                    { id: 'awaken_4', value: 4 },
                ];
                
                awakenAchievements.forEach(ach => {
                    if (awakenCount >= ach.value && !WorldState.hasAchievement(ach.id)) {
                        const achData = DataAchievements[ach.id];
                        if (achData) {
                            WorldState.unlockAchievement(ach.id, achData);
                        }
                    }
                });
            } catch (e) {
                console.warn('[玩家] 觉醒成就检查失败:', e);
            }
        }

        return {
            success: true,
            message: `成功觉醒${this.getElementName(element)}！`,
            unlockedSkills: unlockedSkills
        };
    },

    /**
     * 获取元素系中文名
     */
    getElementName(element) {
        const names = {
            fire: '火系', ice: '冰系', thunder: '雷系', earth: '土系',
            wind: '风系', water: '水系', light: '光系', dark: '暗影系',
            heal: '治愈系', summon: '召唤系', neutral: '无系'
        };
        return names[element] || element;
    },

    /**
     * 获取某元素系的天赋数据
     * @param {string} element - 元素系ID
     * @returns {object|null} 天赋数据
     */
    getElementTalent(element) {
        if (!this.talents || !this.talents[element]) return null;
        return this.talents[element];
    },

    /**
     * v2.4.0: 设置主修系
     * @param {string} element - 元素系ID
     */
    setPrimaryElement(element) {
        if (!this.talents || !this.talents[element]) return false;
        // 如果与副修系相同，清空副修系
        if (this.secondaryElement === element) this.secondaryElement = null;
        this.primaryElement = element;
        return true;
    },

    /**
     * v2.4.0: 设置副修系
     * @param {string|null} element - 元素系ID，传null清空副修系
     */
    setSecondaryElement(element) {
        if (element === null) {
            this.secondaryElement = null;
            return true;
        }
        if (!this.talents || !this.talents[element]) return false;
        // 不能与主修系相同
        if (this.primaryElement === element) return false;
        this.secondaryElement = element;
        return true;
    },

    /**
     * v2.4.0: 获取当前跨系组合
     * @returns {object|null} 组合信息
     */
    getCrossElementCombo() {
        if (!this.primaryElement || !this.secondaryElement) return null;
        const combos = {
            'fire+wind': { name: '火焰风暴', desc: '闪避攒燃点，疾风强化爆炸' },
            'ice+thunder': { name: '超导', desc: '冻结加速电荷，破冰连锁' },
            'earth+dark': { name: '岩刺诅咒', desc: '受击上诅咒，反击引爆' },
            'water+light': { name: '形态协同', desc: '涨潮时光系额外输出' },
            'summon+heal': { name: '契约治愈', desc: '契约积累时全队回血' },
            'fire+ice': { name: '融化', desc: '火系对冻结目标伤害+50%' },
            'thunder+water': { name: '感电', desc: '水系目标受雷伤+30%' },
            'plant+water': { name: '滋养', desc: '水系技能加速植物生长' },
            'ice+wind': { name: '暴风雪', desc: '疾风状态下冰系范围+减速' },
            'fire+earth': { name: '熔岩', desc: '火系附加灼烧地面，土系反击带燃烧' }
        };
        const key1 = `${this.primaryElement}+${this.secondaryElement}`;
        const key2 = `${this.secondaryElement}+${this.primaryElement}`;
        return combos[key1] || combos[key2] || null;
    },

    /**
     * 获取某元素系的天赋效果
     * @param {string} element - 元素系ID
     * @returns {object} 天赋效果
     */
    getElementTalentEffects(element) {
        const talentData = this.getElementTalent(element);
        if (!talentData || typeof TalentSystem === 'undefined') return {};
        // v1.4.0: 支持分支进化，传递branch参数
        return TalentSystem.getTalentEffects(talentData.talentId, talentData.level, talentData.branch);
    },

    /**
     * 获取所有天赋的总效果（按效果类型累加）
     * @returns {object} 总效果
     */
    getAllTalentEffects() {
        const totalEffects = {};
        if (!this.talents || typeof TalentSystem === 'undefined') return totalEffects;

        for (const element in this.talents) {
            const effects = this.getElementTalentEffects(element);
            // v2.4.0: 双天赋装备系统 - 主修系100%，副修系70%，其他系50%
            let multiplier = 0.5; // 默认其他系50%
            if (element === this.primaryElement) multiplier = 1.0;
            else if (element === this.secondaryElement) multiplier = 0.7;

            for (const key in effects) {
                if (typeof effects[key] === 'number') {
                    totalEffects[key] = (totalEffects[key] || 0) + effects[key] * multiplier;
                } else {
                    // v2.4.0: 非数值效果（如activeSkill）只取主修系
                    if (multiplier >= 1.0) {
                        totalEffects[key] = effects[key];
                    }
                }
            }
        }

        // 合并自身天赋效果（InnateTalent），按天赋等级缩放数值效果
        if (this.innateEffects) {
            const talentMultiplier = 1 + 0.2 * ((this.innateTalentLevel || 1) - 1);
            for (const key in this.innateEffects) {
                const val = this.innateEffects[key];
                if (typeof val === 'number') {
                    totalEffects[key] = (totalEffects[key] || 0) + val * talentMultiplier;
                } else {
                    totalEffects[key] = val;
                }
            }
        }

        return totalEffects;
    },

    /**
     * 增加某元素系的天赋经验
     * @param {string} element - 元素系ID
     * @param {number} amount - 经验值
     * @returns {object} { leveledUp, newLevel, newExp, talentName }
     */
    addElementTalentExp(element, amount) {
        if (!this.talents || !this.talents[element] || typeof TalentSystem === 'undefined') {
            return { leveledUp: false };
        }

        const talentData = this.talents[element];
        const result = TalentSystem.addTalentExp(talentData, amount);

        if (result.leveledUp) {
            talentData.level = result.newLevel;
            talentData.exp = result.newExp;
            const talent = TalentSystem.getTalent(talentData.talentId);
            result.talentName = talent ? talent.name : '天赋';
        } else {
            talentData.exp = result.newExp;
        }

        return result;
    },

    /**
     * v2.5.2: 重置某系天赋（经验归零，等级回到1，分支清空）
     * @param {string} element - 元素系别
     * @returns {boolean} 是否成功重置
     */
    resetElementTalent(element) {
        if (!this.talents || !this.talents[element]) return false;
        const talentData = this.talents[element];
        const talent = typeof TalentSystem !== 'undefined' ? TalentSystem.getTalent(talentData.talentId) : null;
        if (!talent) return false;

        talentData.level = 1;
        talentData.exp = 0;
        talentData.branch = null;

        if (typeof Game !== 'undefined' && Game.addLog) {
            Game.addLog(`✨ ${talent.name} 已重置，可重新选择进化方向。`);
        }
        return true;
    },

    /**
     * 获取技能等级
     * @param {string} skillId - 技能ID
     * @returns {number} 技能等级（1-3）
     */
    getSkillLevel(skillId) {
        if (!this.skillLevels || typeof SkillLevelSystem === 'undefined') return 1;
        return SkillLevelSystem.getSkillLevel(this.skillLevels, skillId);
    },

    /**
     * 获取技能经验
     * @param {string} skillId - 技能ID
     * @returns {number} 当前经验
     */
    getSkillExp(skillId) {
        if (!this.skillLevels || typeof SkillLevelSystem === 'undefined') return 0;
        return SkillLevelSystem.getSkillExp(this.skillLevels, skillId);
    },

    /**
     * 获取技能伤害加成
     * @param {string} skillId - 技能ID
     * @returns {number} 伤害倍率
     */
    getSkillDamageBonus(skillId) {
        const level = this.getSkillLevel(skillId);
        if (typeof SkillLevelSystem === 'undefined') return 1;
        return SkillLevelSystem.getDamageBonus(level);
    },

    /**
     * 增加技能经验
     * @param {string} skillId - 技能ID
     * @param {number} amount - 经验值
     * @returns {object} { leveledUp, newLevel, skillName }
     */
    addSkillExp(skillId, amount) {
        if (!this.skillLevels || typeof SkillLevelSystem === 'undefined') {
            return { leveledUp: false };
        }

        const result = SkillLevelSystem.addSkillExp(this.skillLevels, skillId, amount);

        if (result.leveledUp) {
            const skill = SkillSystem.getSkill(skillId);
            result.skillName = skill ? skill.name : '技能';
        }

        return result;
    },

    /**
     * 获取当前境界
     * @returns {string} 境界ID
     */
    getRealm() {
        return this.realm || 'initial';
    },

    /**
     * 获取当前境界数据
     * @returns {object} 境界数据
     */
    getRealmData() {
        if (typeof RealmSystem === 'undefined') return null;
        return RealmSystem.getRealm(this.realm || 'initial');
    },

    /**
     * 获取下一个境界
     * @returns {object|null} 下一个境界数据
     */
    getNextRealm() {
        if (typeof RealmSystem === 'undefined') return null;
        return RealmSystem.getNextRealm(this.realm || 'initial');
    },

    /**
     * 检查是否可以突破
     * @returns {object} { canBreakthrough: boolean, reason: string }
     */
    canBreakthrough() {
        if (typeof RealmSystem === 'undefined') {
            return { canBreakthrough: false, reason: '境界系统未加载' };
        }
        return RealmSystem.canBreakthrough(this);
    },

    /**
     * 执行突破
     * @returns {object} 突破结果
     */
    breakthrough() {
        if (typeof RealmSystem === 'undefined') {
            return { success: false, message: '境界系统未加载' };
        }
        return RealmSystem.breakthrough(this);
    },

    /**
     * 获取某元素系的灵种数据
     * @param {string} element - 元素系ID
     * @returns {object|null} 灵种数据
     */
    getElementSpiritSeed(element) {
        if (!this.spiritSeeds || !this.spiritSeeds[element] || typeof SpiritSeedSystem === 'undefined') return null;
        return SpiritSeedSystem.getSpiritSeed(this.spiritSeeds[element]);
    },

    /**
     * 获取某元素系的灵种效果
     * @param {string} element - 元素系ID
     * @returns {object} 灵种效果
     */
    getElementSpiritSeedEffects(element) {
        if (!this.spiritSeeds || typeof SpiritSeedSystem === 'undefined') return {};
        return SpiritSeedSystem.getPlayerElementSeedEffects(this.spiritSeeds, element);
    },

    /**
     * 获取所有灵种的总效果
     * @returns {object} 总效果
     */
    getAllSpiritSeedEffects() {
        const totalEffects = {};
        if (!this.spiritSeeds || typeof SpiritSeedSystem === 'undefined') return totalEffects;

        for (const element in this.spiritSeeds) {
            const effects = this.getElementSpiritSeedEffects(element);
            for (const key in effects) {
                if (typeof effects[key] === 'number') {
                    totalEffects[key] = (totalEffects[key] || 0) + effects[key];
                } else {
                    totalEffects[key] = effects[key];
                }
            }
        }

        return totalEffects;
    },
    
    // ========== NPC关系系统 ==========
    
    /**
     * 获取NPC关系数据
     * @param {string} npcId - NPC ID
     * @returns {object} 关系数据 { opinion, trust, familiarity }
     */
    getNpcRelation(npcId) {
        if (!this.npcRelations) this.npcRelations = {};
        if (!this.npcRelations[npcId]) {
            this.npcRelations[npcId] = { opinion: 0, trust: 0, familiarity: 0 };
        }
        return this.npcRelations[npcId];
    },
    
    /**
     * 获取NPC好感度
     * @param {string} npcId - NPC ID
     * @returns {number} 好感度（-100到100）
     */
    getNpcOpinion(npcId) {
        const relation = this.getNpcRelation(npcId);
        return relation.opinion || 0;
    },
    
    /**
     * 增加NPC好感度
     * @param {string} npcId - NPC ID
     * @param {number} amount - 增加的好感度（可以是负数）
     * @returns {number} 新的好感度
     */
    addNpcOpinion(npcId, amount) {
        const relation = this.getNpcRelation(npcId);
        relation.opinion = Math.max(-100, Math.min(100, (relation.opinion || 0) + amount));
        return relation.opinion;
    },
    
    /**
     * 获取关系等级
     * @param {string} npcId - NPC ID
     * @returns {number} 关系等级（0-6）
     */
    getRelationLevel(npcId) {
        const opinion = this.getNpcOpinion(npcId);
        if (opinion >= 80) return 6;      // 尊敬/挚友
        if (opinion >= 50) return 5;      // 亲密
        if (opinion >= 20) return 4;      // 友好
        if (opinion >= 0) return 3;       // 中立
        if (opinion >= -20) return 2;     // 冷淡
        if (opinion >= -50) return 1;     // 敌对
        return 0;                          // 仇恨
    },
    
    /**
     * 获取关系等级名称
     * @param {string} npcId - NPC ID
     * @returns {string} 关系等级名称
     */
    getRelationLevelName(npcId) {
        const level = this.getRelationLevel(npcId);
        const names = ['仇恨', '敌对', '冷淡', '中立', '友好', '亲密', '挚友'];
        return names[level] || '中立';
    },
    
    /**
     * 获取关系等级颜色
     * @param {string} npcId - NPC ID
     * @returns {string} 颜色代码
     */
    getRelationLevelColor(npcId) {
        const level = this.getRelationLevel(npcId);
        const colors = ['#ff3333', '#ff6633', '#999999', '#cccccc', '#66ff66', '#66ffff', '#ffcc00'];
        return colors[level] || '#cccccc';
    },

    /**
     * 获取某元素的星尘魔器效果
     * @param {string} element - 元素系ID
     * @returns {object} 星尘魔器效果
     */
    getElementStarDustEffect(element) {
        if (!this.starDustArtifacts || typeof StarDustArtifactSystem === 'undefined') {
            return { timeBonus: 0, expBonus: 0 };
        }
        return StarDustArtifactSystem.getPlayerElementArtifactEffect(this.starDustArtifacts, element);
    },

    /**
     * 获取所有星尘魔器的总效果（取最高值）
     * @returns {object} 总效果
     */
    getTotalStarDustEffect() {
        if (!this.starDustArtifacts || typeof StarDustArtifactSystem === 'undefined') {
            return { timeBonus: 0, expBonus: 0 };
        }
        return StarDustArtifactSystem.getPlayerTotalArtifactEffect(this.starDustArtifacts);
    },

    /**
     * 装备星尘魔器
     * @param {string} artifactId - 星尘魔器ID
     * @returns {object} 结果
     */
    equipStarDustArtifact(artifactId) {
        if (typeof StarDustArtifactSystem === 'undefined') {
            return { success: false, message: "星尘魔器系统未加载" };
        }

        const artifact = StarDustArtifactSystem.getArtifact(artifactId);
        if (!artifact) {
            return { success: false, message: "没有找到该星尘魔器" };
        }

        // 检查是否已觉醒该元素系
        if (artifact.element !== "all" && !this.elements.includes(artifact.element)) {
            return { success: false, message: "你还没有觉醒该元素系" };
        }

        // 检查是否已有同元素的星尘魔器
        const elementKey = artifact.element;
        if (this.starDustArtifacts[elementKey]) {
            return { success: false, message: "你已经装备了同元素的星尘魔器" };
        }

        // 装备星尘魔器
        this.starDustArtifacts[elementKey] = {
            id: artifactId,
            level: artifact.level || 1,
            exp: 0
        };

        return { success: true, message: `成功装备${artifact.name}` };
    },

    /**
     * 卸下星尘魔器
     * @param {string} element - 元素系ID
     * @returns {object} 结果
     */
    unequipStarDustArtifact(element) {
        if (!this.starDustArtifacts || !this.starDustArtifacts[element]) {
            return { success: false, message: "你没有装备该元素的星尘魔器" };
        }

        const artifactData = this.starDustArtifacts[element];
        const artifact = StarDustArtifactSystem.getArtifact(artifactData.id);
        
        // 灵魂绑定的不能卸下
        if (artifact && artifact.boundToPlayer) {
            return { success: false, message: "该星尘魔器已灵魂绑定，无法卸下" };
        }

        delete this.starDustArtifacts[element];
        return { success: true, message: "已卸下星尘魔器" };
    },

    /**
     * 吸收星尘魔器（成长型）
     * @param {string} targetElement - 目标成长型星尘魔器的元素系
     * @param {string} materialItemId - 作为材料的星尘魔器物品ID
     * @returns {object} 结果
     */
    absorbStarDustArtifact(targetElement, materialItemId) {
        if (typeof StarDustArtifactSystem === 'undefined') {
            return { success: false, message: "星尘魔器系统未加载" };
        }

        // 检查目标星尘魔器
        if (!this.starDustArtifacts || !this.starDustArtifacts[targetElement]) {
            return { success: false, message: "你没有装备该元素的星尘魔器" };
        }

        const targetData = this.starDustArtifacts[targetElement];
        const targetArtifact = StarDustArtifactSystem.getArtifact(targetData.id);
        
        // 只有成长型才能吸收
        if (!targetArtifact || targetArtifact.grade !== 'growth') {
            return { success: false, message: "只有成长型星尘魔器才能吸收其他魔器" };
        }

        // 检查材料星尘魔器是否在背包中
        const materialItem = Inventory.getItem(materialItemId);
        if (!materialItem || materialItem.count <= 0) {
            return { success: false, message: "背包中没有该星尘魔器" };
        }

        const materialArtifactId = materialItem.artifactId;
        const materialArtifact = StarDustArtifactSystem.getArtifact(materialArtifactId);
        if (!materialArtifact) {
            return { success: false, message: "材料星尘魔器无效" };
        }

        // 执行吸收（直接修改this.starDustArtifacts）
        const result = StarDustArtifactSystem.absorbArtifact(this.starDustArtifacts, targetElement, materialArtifactId);
        
        if (!result.success) {
            return result;
        }

        // 消耗材料
        Inventory.removeItem(materialItemId, 1);

        if (result.levelUp) {
            return { 
                success: true, 
                message: `吸收成功！${targetArtifact.name} 升级到 Lv.${result.newLevel}！`,
                levelUp: true,
                newLevel: result.newLevel
            };
        } else {
            return { 
                success: true, 
                message: `吸收成功！获得经验`,
                levelUp: false
            };
        }
    },

    /**
     * 炼化灵种
     * @param {string} seedId - 灵种ID
     * @returns {boolean} 是否成功
     */
    refineSpiritSeed(seedId) {
        if (typeof SpiritSeedSystem === 'undefined') return false;
        return SpiritSeedSystem.refineSpiritSeed(seedId);
    },

    /**
     * 检查是否可以觉醒新系
     * @returns {boolean}
     */
    canAwakenNewElement() {
        const count = this.elements.length;
        if (count >= 4) return false;
        const requiredLevel = count === 0 ? 1 : count === 1 ? 10 : count === 2 ? 30 : 55;
        return this.getPlayerLevel() >= requiredLevel;
    },

    /**
     * 学习技能
     */
    learnSkill(skillId) {
        if (this.skills.includes(skillId)) return false;
        this.skills.push(skillId);
        return true;
    },

    /**
     * 恢复生命
     */
    heal(amount) {
        const stats = this.getTotalStats();
        this.hp = Math.min(this.hp + amount, stats.maxHp);
    },

    /**
     * 恢复魔法
     */
    restoreMp(amount) {
        const stats = this.getTotalStats();
        this.mp = Math.min(this.mp + amount, stats.maxMp);
    },

    /**
     * 受到伤害
     */
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        return this.hp <= 0;
    },

    /**
     * 消耗魔法
     */
    useMp(amount) {
        if (this.mp < amount) return false;
        this.mp -= amount;
        return true;
    },

    /**
     * 消耗体力（v0.9.0软化：不再阻止行动，只扣到0）
     */
    useStamina(amount) {
        // v0.9.0: 体力不再作为硬限制，即使不足也允许行动
        // 体力低时通过getStaminaEfficiency()降低效率
        this.stamina = Math.max(0, this.stamina - amount);
        return true;
    },

    /**
     * v0.9.0: 获取体力状态等级
     * @returns {string} energetic/tired/very_tired/exhausted
     */
    getStaminaLevel() {
        const ratio = this.stamina / (this.maxStamina || 100);
        if (ratio > 0.6) return 'energetic';      // 精力充沛
        if (ratio > 0.3) return 'tired';          // 有些疲惫
        if (ratio > 0) return 'very_tired';       // 非常疲惫
        return 'exhausted';                        // 精疲力竭
    },

    /**
     * v0.9.0: 获取体力效率修正
     * v0.9.7: 体力不再影响修炼效率和战斗伤害，只影响受伤概率
     * v0.9.8: 只有体力=0时战斗才可能受伤，体力<30%但>0时不再疲劳
     * @returns {Object} { trainExp: 修炼经验修正, battleDamage: 战斗伤害修正, injuryChance: 受伤概率 }
     */
    getStaminaEfficiency() {
        const level = this.getStaminaLevel();
        switch (level) {
            case 'energetic':
                return { trainExp: 1.0, battleDamage: 1.0, injuryChance: 0 };
            case 'tired':
                return { trainExp: 1.0, battleDamage: 1.0, injuryChance: 0 };
            case 'very_tired':
                // v0.9.8: 体力<30%但>0时不再疲劳
                return { trainExp: 1.0, battleDamage: 1.0, injuryChance: 0 };
            case 'exhausted':
                return { trainExp: 1.0, battleDamage: 1.0, injuryChance: 0.2 };
            default:
                return { trainExp: 1.0, battleDamage: 1.0, injuryChance: 0 };
        }
    },

    /**
     * 恢复体力
     */
    restoreStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, this.maxStamina);
    },

    /**
     * 完全恢复体力（每天早上）
     * @deprecated v0.99.0: 体力系统已移除
     */
    fullRestoreStamina() {
        this.stamina = this.maxStamina;
    },

    // ========== v0.99.0: 每日行动次数系统（替代体力） ==========

    /**
     * 获取修炼效率倍率
     * v0.99.4: 1次100%，2-3次70%，4次后50%（高效期1次，留出剧情时间）
     */
    getCultivateEfficiency() {
        const count = this.dailyActions?.cultivate || 0;
        if (count < 1) return 1.0;
        if (count < 3) return 0.7;
        return 0.5;
    },

    /**
     * 获取学习效率倍率（上课+图书馆）
     * v0.99.3新增: 1次100%，2-3次70%，4次后50%
     */
    getStudyEfficiency() {
        const count = this.dailyActions?.study || 0;
        if (count < 1) return 1.0;
        if (count < 3) return 0.7;
        return 0.5;
    },

    /**
     * 获取猎魔奖励倍率
     * v0.99.4: 1次100%，2-3次70%，4次后50%
     */
    getHuntEfficiency() {
        const count = this.dailyActions?.hunt || 0;
        if (count < 1) return 1.0;
        if (count < 3) return 0.7;
        return 0.5;
    },

    /**
     * 获取探索随机事件概率倍率
     * v0.99.4: 1次100%，2-3次50%，4次后0%
     */
    getExploreEventChance() {
        const count = this.dailyActions?.explore || 0;
        if (count < 1) return 1.0;
        if (count < 3) return 0.5;
        return 0;
    },

    /**
     * 获取探索收益倍率（逛街+酒馆+采集）
     * v0.99.4: 1次100%，2-3次70%，4次后50%
     */
    getExploreEfficiency() {
        const count = this.dailyActions?.explore || 0;
        if (count < 1) return 1.0;
        if (count < 3) return 0.7;
        return 0.5;
    },

    /**
     * 记录一次行动
     * @param {string} type - cultivate/study/hunt/explore
     */
    recordAction(type) {
        if (!this.dailyActions) this.dailyActions = { cultivate: 0, study: 0, hunt: 0, explore: 0 };
        if (this.dailyActions[type] !== undefined) {
            this.dailyActions[type]++;
        }
    },

    /**
     * 重置每日行动计数（新的一天开始时调用）
     */
    resetDailyActions() {
        this.dailyActions = { cultivate: 0, study: 0, hunt: 0, explore: 0 };
    },

    /**
     * 获取今日行动概览（UI显示用）
     */
    getDailyActionsSummary() {
        const c = this.dailyActions || { cultivate: 0, study: 0, hunt: 0, explore: 0 };
        return {
            cultivate: { count: c.cultivate, efficiency: this.getCultivateEfficiency(), maxEfficient: 1 },
            study: { count: c.study, efficiency: this.getStudyEfficiency(), maxEfficient: 1 },
            hunt: { count: c.hunt, efficiency: this.getHuntEfficiency(), maxEfficient: 1 },
            explore: { count: c.explore, efficiency: this.getExploreEfficiency(), eventChance: this.getExploreEventChance(), maxEfficient: 1 }
        };
    },

    /**
     * 获得金币
     */
    gainGold(amount) {
        // v0.9.4: 更新每日统计
        if (this.dailyStats) {
            this.dailyStats.goldGained = (this.dailyStats.goldGained || 0) + amount;
        }
        this.gold += amount;
        
        // 财富成就检查
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const goldAchievements = [
                    { id: 'rich_1000', value: 1000 },
                    { id: 'rich_10000', value: 10000 },
                    { id: 'rich_100000', value: 100000 },
                    { id: 'rich_million', value: 1000000 },
                ];
                
                goldAchievements.forEach(ach => {
                    if (this.gold >= ach.value && !WorldState.hasAchievement(ach.id)) {
                        const achData = DataAchievements[ach.id];
                        if (achData) {
                            WorldState.unlockAchievement(ach.id, achData);
                        }
                    }
                });
            } catch (e) {
                console.warn('[玩家] 财富成就检查失败:', e);
            }
        }
    },

    /**
     * 花费金币
     */
    spendGold(amount) {
        if (this.gold < amount) return false;
        this.gold -= amount;
        return true;
    },

    /**
     * 是否死亡
     */
    isDead() {
        return this.hp <= 0;
    },

    /**
     * 设置标记
     */
    setFlag(flag) {
        this.flags[flag] = true;
    },

    /**
     * 检查标记
     */
    hasFlag(flag) {
        return !!this.flags[flag];
    },

    /**
     * 解锁地点
     */
    unlockLocation(locationId) {
        if (!this.unlockedLocations.includes(locationId)) {
            this.unlockedLocations.push(locationId);
            
            // 地点探索成就检查
            if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                try {
                    const locationCount = this.unlockedLocations.length;
                    const locationAchievements = [
                        { id: 'first_location', value: 2 },
                        { id: 'explorer', value: 10 },
                    ];
                    
                    locationAchievements.forEach(ach => {
                        if (locationCount >= ach.value && !WorldState.hasAchievement(ach.id)) {
                            const achData = DataAchievements[ach.id];
                            if (achData) {
                                WorldState.unlockAchievement(ach.id, achData);
                            }
                        }
                    });
                } catch (e) {
                    console.warn('[玩家] 地点探索成就检查失败:', e);
                }
            }
        }
    },

    /**
     * 记录击杀妖魔（图鉴用）
     */
    recordKill(enemyId) {
        if (!this.bestiary[enemyId]) {
            this.bestiary[enemyId] = { kills: 0, firstKillDay: this.day, lastKillDay: this.day };
        }
        this.bestiary[enemyId].kills++;
        this.bestiary[enemyId].lastKillDay = this.day;
        
        // 妖魔图鉴成就检查
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const discovered = Object.keys(this.bestiary).length;
                const bestiaryAchievements = [
                    { id: 'bestiary_10', value: 10 },
                    { id: 'bestiary_50', value: 50 },
                ];
                
                bestiaryAchievements.forEach(ach => {
                    if (discovered >= ach.value && !WorldState.hasAchievement(ach.id)) {
                        const achData = DataAchievements[ach.id];
                        if (achData) {
                            WorldState.unlockAchievement(ach.id, achData);
                        }
                    }
                });
            } catch (e) {
                console.warn('[玩家] 妖魔图鉴成就检查失败:', e);
            }
        }
    },

    /**
     * 获取图鉴统计
     */
    getBestiaryStats() {
        const totalEnemies = Object.keys(DataEnemies).length;
        const discovered = Object.keys(this.bestiary).length;
        const totalKills = Object.values(this.bestiary).reduce((sum, e) => sum + e.kills, 0);
        return { totalEnemies, discovered, totalKills };
    },

    /**
     * 接取任务
     */
    acceptQuest(questId) {
        if (this.activeQuests.find(q => q.questId === questId)) return false;
        if (this.completedQuests.includes(questId)) return false;
        
        this.activeQuests.push({
            questId: questId,
            progress: [],
            startTime: this.day
        });
        return true;
    },

    /**
     * 完成任务
     */
    completeQuest(questId) {
        const index = this.activeQuests.findIndex(q => q.questId === questId);
        if (index === -1) return false;
        
        this.activeQuests.splice(index, 1);
        this.completedQuests.push(questId);
        return true;
    },

    /**
     * 检查任务是否完成
     */
    isQuestComplete(questId) {
        return this.completedQuests.includes(questId);
    },

    /**
     * 获取进行中的任务
     */
    getActiveQuest(questId) {
        return this.activeQuests.find(q => q.questId === questId);
    },

    /**
     * 检查是否有进行中的任务
     */
    hasQuest(questId) {
        return this.activeQuests.some(q => q.questId === questId);
    },

    /**
     * 保存游戏
     */
    save() {
        const saveData = {
            name: this.name,
            level: this.level,
            exp: this.exp,
            expToNext: this.expToNext,
            attributePoints: this.attributePoints,
            maxHp: this.maxHp,
            hp: this.hp,
            maxMp: this.maxMp,
            mp: this.mp,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            spirit: this.spirit,
            elements: this.elements,
            elementLevels: this.elementLevels,
            elementExp: this.elementExp,
            skills: this.skills,
            skillLevels: this.skillLevels,
            realm: this.realm,
            talents: this.talents,
            primaryElement: this.primaryElement,
            secondaryElement: this.secondaryElement,
            spiritSeeds: this.spiritSeeds,
            starDustArtifacts: this.starDustArtifacts,
            starDustAssignment: this.starDustAssignment || null,
            npcRelations: this.npcRelations,
            tempBreakthroughBonus: this.tempBreakthroughBonus,
            gold: this.gold,
            equipment: this.equipment,
            enhanceLevels: this.enhanceLevels,
            enhanceFailStreak: this.enhanceFailStreak || { weapon: 0, armor: 0, accessory: 0 },
            enhanceHistory: this.enhanceHistory || [],
            skillMemory: this.skillMemory || {},
            influence: this.influence || 0,
            changedStoryNodes: this.changedStoryNodes || [],
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            currentLocation: this.currentLocation,
            day: this.day,
            hour: this.hour,
            timeOfDay: this.timeOfDay,
            flags: this.flags,
            investigation: this.investigation || { demon: 0, black_church: 0, yu_ang: 0, earth_spring: 0, discoveredClues: [], yuAngSuspicion: 0 },
            bestiary: this.bestiary,
            dailyData: this.dailyData,
            unlockedLocations: this.unlockedLocations,
            battleBuffs: this.battleBuffs,
            tempShopDiscount: this.tempShopDiscount,
            tempShopDiscountExpireDay: this.tempShopDiscountExpireDay,
            summonBeasts: this.summonBeasts || [],
            activeSummonIndex: this.activeSummonIndex || 0,
            exploredLocations: this.exploredLocations || [],
            exploredNPCs: this.exploredNPCs || [],
            fatigueLevel: this.fatigueLevel || 0,
            explorationComplete: this.explorationComplete || [],
            consecutiveExplores: this.consecutiveExplores || 0,
            exploredActions: this.exploredActions || {},
            dailyStats: this.dailyStats || { day: 1, expGained: 0, goldGained: 0, battlesWon: 0, locationsExplored: 0, npcsTalked: 0 },
            inventory: Inventory.getSaveData(),
            worldState: typeof WorldState !== 'undefined' ? WorldState.getSaveData() : null,
            npcStates: typeof NPCStateSystem !== 'undefined' ? NPCStateSystem.getSaveData() : null,
            gameVersion: GAME_VERSION,
            saveVersion: SAVE_VERSION,
            saveTime: new Date().toISOString()
        };
        
        localStorage.setItem('quanzhi_fashi_save', JSON.stringify(saveData));
        return true;
    },

    /**
     * 读取存档
     */
    load() {
        const saveStr = localStorage.getItem('quanzhi_fashi_save');
        if (!saveStr) return false;
        
        try {
            let data = JSON.parse(saveStr);
            
            // 存档版本检测与迁移
            const saveVersion = data.saveVersion || data.version || '0.1.0';
            console.log(`[存档] 读取存档，版本: ${saveVersion}，当前版本: ${SAVE_VERSION}`);
            
            // 如果版本不同，尝试迁移
            if (saveVersion !== SAVE_VERSION) {
                console.log(`[存档] 版本不同，尝试迁移...`);
                
                // 备份旧存档
                this._backupSave(saveStr, saveVersion);
                
                // 执行迁移
                data = this._migrateSave(data, saveVersion);
                
                console.log(`[存档] 迁移完成！`);
            }
            
            // 加载玩家数据（所有字段都有默认值，确保兼容性）
            this.name = data.name || '冒险者';
            this.level = data.level ?? 1;
            this.exp = data.exp ?? 0;
            // 强制重新计算升级所需经验，确保新旧存档都用最新的经验曲线
            this.expToNext = this._calcExpToNext(this.level);
            this.attributePoints = data.attributePoints ?? 0;
            this.maxHp = data.maxHp ?? 120;
            this.hp = data.hp ?? this.maxHp;
            this.maxMp = data.maxMp ?? 60;
            this.mp = data.mp ?? this.maxMp;
            this.attack = data.attack ?? 15;
            this.defense = data.defense ?? 8;
            this.speed = data.speed ?? 10;
            this.spirit = data.spirit ?? 12;
            this.maxStamina = data.maxStamina ?? 100;
            this.stamina = data.stamina ?? this.maxStamina;
            // v0.99.0: 每日行动次数（替代体力系统）
            this.dailyActions = data.dailyActions || { cultivate: 0, study: 0, hunt: 0, explore: 0 };
            this.elements = data.elements ?? [];
            this.elementLevels = data.elementLevels ?? {};
            this.elementExp = data.elementExp ?? {};
            // 兼容旧存档：如果没有elementLevels，用level初始化
            if (Object.keys(this.elementLevels).length === 0 && this.elements.length > 0) {
                this.elements.forEach(el => {
                    this.elementLevels[el] = this.level;
                    this.elementExp[el] = this.exp || 0;
                });
            }
            this.skills = data.skills ?? ['basic_attack'];
            this.skillLevels = data.skillLevels ?? {};
            this.realm = data.realm ?? 'initial';
            this.talents = data.talents ?? {};
            this.primaryElement = data.primaryElement ?? null;
            this.secondaryElement = data.secondaryElement ?? null;
            this.spiritSeeds = data.spiritSeeds ?? {};
            this.starDustArtifacts = data.starDustArtifacts ?? {};
            this.starDustAssignment = data.starDustAssignment ?? null;
            this.npcRelations = data.npcRelations ?? {};
            this.tempBreakthroughBonus = data.tempBreakthroughBonus ?? 0;
            this.gold = data.gold ?? 50;
            this.equipment = data.equipment ?? { weapon: null, armor: null, accessory: null };
            this.enhanceLevels = data.enhanceLevels ?? { weapon: 0, armor: 0, accessory: 0 };
            this.enhanceFailStreak = data.enhanceFailStreak ?? { weapon: 0, armor: 0, accessory: 0 };
            this.enhanceHistory = data.enhanceHistory || [];
            this.skillMemory = data.skillMemory || {};
            this.influence = data.influence || 0;
            this.changedStoryNodes = data.changedStoryNodes || [];
            this.activeQuests = data.activeQuests ?? [];
            this.completedQuests = data.completedQuests ?? [];
            this.currentLocation = data.currentLocation ?? 'tianlan_school';
            this.day = data.day ?? 1;
            this.hour = data.hour ?? 8;  // 默认早上8点
            this.timeOfDay = data.timeOfDay ?? 'morning';
            this.flags = data.flags ?? {};
            this.investigation = data.investigation ?? { demon: 0, black_church: 0, yu_ang: 0, earth_spring: 0, discoveredClues: [], yuAngSuspicion: 0 };
            this.bestiary = data.bestiary ?? {};
            this.dailyData = data.dailyData ?? null;
            this.unlockedLocations = data.unlockedLocations ?? ['tianlan_school', 'city_street', 'xuefeng_mountain'];
            this.battleBuffs = data.battleBuffs ?? [];
            this.tempShopDiscount = data.tempShopDiscount ?? 1.0;
            this.tempShopDiscountExpireDay = data.tempShopDiscountExpireDay ?? 0;

            // 加载召唤兽数据
            this.summonBeasts = data.summonBeasts || [];
            this.activeSummonIndex = data.activeSummonIndex || 0;
            // 兼容旧存档：如果有summonData但没有summonBeasts
            if (data.summonData && (!this.summonBeasts || this.summonBeasts.length === 0)) {
                this.summonBeasts = [data.summonData];
                this.activeSummonIndex = 0;
            }
            this.migrateSummonData();

            // v0.9.0: 加载探索记录（兼容旧存档）
            this.exploredLocations = data.exploredLocations || [];
            this.exploredNPCs = data.exploredNPCs || [];
            // v0.9.1: 加载疲劳等级和探索完成记录
            this.fatigueLevel = data.fatigueLevel || 0;
            this.explorationComplete = data.explorationComplete || [];
            this.consecutiveExplores = data.consecutiveExplores || 0;
            this.exploredActions = data.exploredActions || {};
            this.dailyStats = data.dailyStats || { day: 1, expGained: 0, goldGained: 0, battlesWon: 0, locationsExplored: 0, npcsTalked: 0 };
            
            // 加载背包
            if (data.inventory) {
                try {
                    Inventory.loadSaveData(data.inventory);
                } catch (e) {
                    console.warn('[存档] 背包数据加载失败，使用空背包:', e);
                }
            }
            
            // 加载世界状态
            if (data.worldState && typeof WorldState !== 'undefined') {
                try {
                    WorldState.loadSaveData(data.worldState);
                } catch (e) {
                    console.warn('[存档] 世界状态加载失败:', e);
                }
            }
            
            // 加载NPC状态
            if (data.npcStates && typeof NPCStateSystem !== 'undefined') {
                try {
                    NPCStateSystem.loadSaveData(data.npcStates);
                } catch (e) {
                    console.warn('[存档] NPC状态加载失败:', e);
                }
            }
            
            // 存档迁移：补全缺失的初始技能（旧存档可能只有basic_attack）
            this.elements.forEach(elem => {
                const starterSkills = {
                    fire: 'fire_bolt', ice: 'ice_spike', thunder: 'thunder_bolt',
                    earth: 'earth_shield', wind: 'wind_blade', water: 'water_heal',
                    light: 'light_ray', dark: 'dark_bolt', heal: 'heal_light',
                    summon: 'summon_beast'
                };
                const starter = starterSkills[elem];
                if (starter && !this.skills.includes(starter)) {
                    this.skills.push(starter);
                }
                // 补全当前等级应解锁的技能
                const unlockTable = SKILL_UNLOCK_TABLE[elem];
                if (unlockTable) {
                    Object.keys(unlockTable).forEach(levelStr => {
                        const unlockLevel = parseInt(levelStr);
                        if (unlockLevel <= this.level) {
                            unlockTable[unlockLevel].forEach(skillId => {
                                if (!this.skills.includes(skillId)) {
                                    this.skills.push(skillId);
                                }
                            });
                        }
                    });
                }
            });
            
            // 存档迁移：为旧存档补全天赋（v0.5.3及以前没有天赋系统）
            if (typeof TalentSystem !== 'undefined' && TalentSystem.initTalentForElement) {
                this.elements.forEach(elem => {
                    if (!this.talents || !this.talents[elem]) {
                        this.talents[elem] = TalentSystem.initTalentForElement(elem);
                        console.log(`[存档迁移] 为 ${elem} 初始化天赋: ${this.talents[elem].talentId}`);
                    }
                });
            }

            // v2.4.0: 旧存档兼容 - 自动设置主修系为第一个觉醒的系别
            if (!this.primaryElement && this.elements && this.elements.length > 0) {
                this.primaryElement = this.elements[0];
                console.log(`[存档迁移] 自动设置主修系: ${this.primaryElement}`);
            }
            
            // 测试用：保留存档天数
            
            // 自动保存一次，更新为新版本格式
            this.save();
            
            return true;
        } catch (e) {
            console.error('读取存档失败:', e);
            // 尝试恢复备份
            return this._restoreBackup();
        }
    },
    
    /**
     * 备份旧存档
     */
    _backupSave(saveStr, version) {
        try {
            const backupKey = `quanzhi_fashi_save_backup_${version}_${Date.now()}`;
            localStorage.setItem(backupKey, saveStr);
            console.log(`[存档] 已备份旧存档: ${backupKey}`);
        } catch (e) {
            console.warn('[存档] 备份失败:', e);
        }
    },
    
    /**
     * 尝试恢复备份
     */
    _restoreBackup() {
        try {
            // 查找最新的备份
            const keys = Object.keys(localStorage).filter(k => k.startsWith('quanzhi_fashi_save_backup_'));
            if (keys.length === 0) return false;
            
            // 按时间排序，取最新的
            keys.sort().reverse();
            const latestBackup = keys[0];
            const saveStr = localStorage.getItem(latestBackup);
            
            if (saveStr) {
                console.log(`[存档] 尝试恢复备份: ${latestBackup}`);
                const data = JSON.parse(saveStr);
                // 简化加载，只加载基础数据
                this.name = data.name || '冒险者';
                this.level = data.level || 1;
                this.exp = data.exp || 0;
                return true;
            }
        } catch (e) {
            console.error('[存档] 恢复备份失败:', e);
        }
        return false;
    },
    
    /**
     * 存档迁移
     * 将旧版本存档迁移到当前版本
     */
    _migrateSave(data, fromVersion) {
        let migrated = { ...data };
        
        // 版本比较和迁移
        // 从0.1.0迁移到0.2.0
        if (this._compareVersion(fromVersion, '0.2.0') < 0) {
            console.log('[存档迁移] 从 0.1.x 迁移到 0.2.0');
            // 添加体力系统
            migrated.maxStamina = 100;
            migrated.stamina = 100;
            // 添加更多默认值
            if (!migrated.unlockedLocations) {
                migrated.unlockedLocations = ['tianlan_school', 'city_street', 'xuefeng_mountain'];
            }
        }
        
        // 从0.2.0迁移到0.3.0
        if (this._compareVersion(fromVersion, '0.3.0') < 0) {
            console.log('[存档迁移] 从 0.2.x 迁移到 0.3.0');
            // 添加世界状态和NPC状态（空的，让系统初始化默认值）
            if (!migrated.worldState) migrated.worldState = null;
            if (!migrated.npcStates) migrated.npcStates = null;
            // 添加精神力默认值
            if (!migrated.spirit) migrated.spirit = 10;
        }
        
        // 从0.3.0迁移到0.3.1
        if (this._compareVersion(fromVersion, '0.3.1') < 0) {
            console.log('[存档迁移] 从 0.3.0 迁移到 0.3.1');
            // 0.3.1主要是内容扩充，存档格式基本兼容
            // 确保新字段有默认值
            if (!migrated.flags) migrated.flags = {};
            if (!migrated.attributePoints) migrated.attributePoints = 0;
        }

        // 从0.8.0迁移到0.8.6（新等级体系）
        if (this._compareVersion(fromVersion, '0.8.6') < 0) {
            console.log('[存档迁移] 从 0.8.x 迁移到 0.8.6（新等级体系）');
            const oldLevel = migrated.level || 1;
            let newLevel;
            // 旧→新等级映射
            if (oldLevel <= 7) {
                newLevel = Math.max(1, Math.ceil(oldLevel * 10 / 7));
            } else if (oldLevel <= 14) {
                newLevel = 11 + Math.ceil((oldLevel - 7) * 19 / 7);
            } else if (oldLevel <= 25) {
                newLevel = 31 + Math.ceil((oldLevel - 14) * 24 / 11);
            } else {
                newLevel = 56 + (oldLevel - 25);
            }
            console.log(`[存档迁移] 等级映射：旧Lv${oldLevel} → 新Lv${newLevel}`);
            migrated.level = newLevel;

            // 重新计算基础属性（不含装备/灵种加成）
            // 新体系初始属性
            let baseHp = 100, baseMp = 50, baseAtk = 10, baseDef = 5, baseSpd = 10, baseSpr = 10;
            for (let lv = 2; lv <= newLevel; lv++) {
                if (lv <= 10) {
                    baseHp += 12; baseMp += 6; baseAtk += 2; baseDef += 1; baseSpd += 1; baseSpr += 1;
                } else if (lv <= 30) {
                    baseHp += 15; baseMp += 10; baseAtk += 3; baseDef += 2; baseSpd += 1; baseSpr += 2;
                } else if (lv <= 55) {
                    baseHp += 20; baseMp += 15; baseAtk += 4; baseDef += 3; baseSpd += 2; baseSpr += 3;
                } else {
                    baseHp += 25; baseMp += 20; baseAtk += 5; baseDef += 4; baseSpd += 2; baseSpr += 4;
                }
            }
            // 境界突破百分比加成
            if (newLevel >= 56) {
                baseHp = Math.floor(baseHp * 2.0); baseMp = Math.floor(baseMp * 3.0);
                baseAtk = Math.floor(baseAtk * 2.0); baseDef = Math.floor(baseDef * 2.0);
                baseSpd = Math.floor(baseSpd * 1.5); baseSpr = Math.floor(baseSpr * 2.0);
                migrated.realm = 'super';
            } else if (newLevel >= 31) {
                baseHp = Math.floor(baseHp * 1.6); baseMp = Math.floor(baseMp * 2.0);
                baseAtk = Math.floor(baseAtk * 1.5); baseDef = Math.floor(baseDef * 1.5);
                baseSpd = Math.floor(baseSpd * 1.3); baseSpr = Math.floor(baseSpr * 1.6);
                migrated.realm = 'high';
            } else if (newLevel >= 11) {
                baseHp = Math.floor(baseHp * 1.3); baseMp = Math.floor(baseMp * 1.5);
                baseAtk = Math.floor(baseAtk * 1.2); baseDef = Math.floor(baseDef * 1.2);
                baseSpd = Math.floor(baseSpd * 1.1); baseSpr = Math.floor(baseSpr * 1.3);
                migrated.realm = 'middle';
            } else {
                migrated.realm = 'initial';
            }
            migrated.maxHp = baseHp;
            migrated.maxMp = baseMp;
            migrated.attack = baseAtk;
            migrated.defense = baseDef;
            migrated.speed = baseSpd;
            migrated.spirit = baseSpr;
            migrated.hp = baseHp;
            migrated.mp = baseMp;
            migrated.expToNext = this._calcExpToNext(newLevel);
            migrated.exp = 0; // 重置当前经验，避免负数
        }

        // 从0.8.6迁移到0.8.7（各系独立等级）
        if (this._compareVersion(fromVersion, '0.8.7') < 0) {
            console.log('[存档迁移] 从 0.8.6 迁移到 0.8.7（各系独立等级）');
            const globalLevel = migrated.level || 1;
            // 初始化各系等级：所有已觉醒系都设为原全局等级
            migrated.elementLevels = {};
            migrated.elementExp = {};
            if (migrated.elements && migrated.elements.length > 0) {
                migrated.elements.forEach(el => {
                    migrated.elementLevels[el] = globalLevel;
                    migrated.elementExp[el] = migrated.exp || 0;
                });
            }
            // this.level 保持为最高系等级（=globalLevel）
            console.log(`[存档迁移] 各系等级初始化：${migrated.elements.map(e=>e+':'+globalLevel).join(', ')}`);
        }

        // 更新版本号
        migrated.saveVersion = SAVE_VERSION;
        migrated.gameVersion = GAME_VERSION;
        
        return migrated;
    },
    
    /**
     * 比较版本号
     * 返回: 负数表示a < b，0表示相等，正数表示a > b
     */
    _compareVersion(a, b) {
        const partsA = a.split('.').map(Number);
        const partsB = b.split('.').map(Number);
        
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const numA = partsA[i] || 0;
            const numB = partsB[i] || 0;
            if (numA !== numB) {
                return numA - numB;
            }
        }
        return 0;
    },

    /**
     * 检查是否有存档
     */
    hasSave() {
        return !!localStorage.getItem('quanzhi_fashi_save');
    },

    /**
     * 召唤兽进化
     * @returns {object} {success, message, newName, newIcon}
     */
    evolveSummonBeast() {
        if (!this.summonData) return { success: false, message: '你还没有召唤兽' };
        if (typeof canEvolve !== 'function') return { success: false, message: '进化系统未就绪' };
        const evo = canEvolve(this.summonData, this.realm);
        if (!evo) {
            // 检查具体原因
            const evoLine = DataSummonBeastEvolutions[this.summonData.baseId || this.summonData.id];
            if (!evoLine) return { success: false, message: '这只召唤兽没有进化路线' };
            const currentStage = this.summonData.evolutionStage || 0;
            const nextEvo = evoLine.line[currentStage];
            if (!nextEvo) return { success: false, message: '召唤兽已达到最终形态' };
            const reasons = [];
            if (this.summonData.level < nextEvo.minBeastLevel) reasons.push(`需要等级${nextEvo.minBeastLevel}`);
            if (this.summonData.loyalty < nextEvo.minLoyalty) reasons.push(`需要忠诚${nextEvo.minLoyalty}`);
            const realmNames = { initial: '初阶', primary: '初阶', middle: '中阶', high: '高阶' };
            const realmOrder = { initial: 1, primary: 1, middle: 2, high: 3 };
            if ((realmOrder[this.realm] || 1) < (realmOrder[nextEvo.minPlayerRealm] || 1)) {
                reasons.push(`需要${realmNames[nextEvo.minPlayerRealm]}法师`);
            }
            return { success: false, message: `进化条件不足：${reasons.join('、')}` };
        }

        // 执行进化
        const oldName = this.summonData.name;
        const oldIcon = this.summonData.icon;
        this.summonData.id = evo.toId;
        this.summonData.name = evo.name;
        this.summonData.icon = evo.icon;
        this.summonData.evolutionStage = (this.summonData.evolutionStage || 0) + 1;
        // 忠诚+10作为进化奖励
        this.summonData.loyalty = Math.min(100, this.summonData.loyalty + 10);
        // 回满HP
        this.summonData.baseMaxHp = Math.floor(this.summonData.baseMaxHp * (evo.statMultiplier / (this.summonData.evolutionStage > 1 ? 1.5 : 1)));
        // 重新计算基础属性（基于baseId的原始属性 * 进化倍率）
        const baseBeast = DataSummonBeasts[this.summonData.baseId];
        if (baseBeast) {
            this.summonData.baseMaxHp = Math.floor(baseBeast.baseStats.maxHp * evo.statMultiplier);
            this.summonData.baseAttack = Math.floor(baseBeast.baseStats.attack * evo.statMultiplier);
            this.summonData.baseDefense = Math.floor(baseBeast.baseStats.defense * evo.statMultiplier);
            this.summonData.baseSpeed = Math.floor(baseBeast.baseStats.speed * evo.statMultiplier);
        }

        return {
            success: true,
            message: `${oldIcon} ${oldName} 进化为 ${evo.icon} ${evo.name}！`,
            oldName, oldIcon,
            newName: evo.name,
            newIcon: evo.icon,
            description: evo.description
        };
    },

    /**
     * 获取召唤兽进化信息（用于UI显示）
     */
    getSummonEvolutionInfo() {
        if (!this.summonData) return null;
        if (typeof canEvolve !== 'function') return null;
        const evoLine = DataSummonBeastEvolutions[this.summonData.baseId || this.summonData.id];
        if (!evoLine) return null;
        const currentStage = this.summonData.evolutionStage || 0;
        const nextEvo = evoLine.line[currentStage];
        const canEvo = canEvolve(this.summonData, this.realm);
        return {
            currentStage,
            maxStage: evoLine.line.length,
            nextEvolution: nextEvo,
            canEvolve: !!canEvo,
            isMaxStage: !nextEvo
        };
    },

    /**
     * 获取当前境界可契约的召唤兽数量上限
     * 小说设定：初阶1只，中阶2只，高阶3只，超阶4只
     */
    getMaxSummonCount() {
        const realmLimits = { initial: 1, primary: 1, middle: 2, high: 3, super: 4 };
        return realmLimits[this.realm] || 1;
    },

    /**
     * 从旧存档迁移：如果summonData存在但summonBeasts为空，将其放入数组
     */
    migrateSummonData() {
        if (this.summonData && (!this.summonBeasts || this.summonBeasts.length === 0)) {
            this.summonBeasts = [this.summonData];
            this.activeSummonIndex = 0;
        }
        if (!this.summonBeasts) this.summonBeasts = [];
        // 确保summonData指向当前激活的召唤兽
        if (this.summonBeasts.length > 0) {
            this.summonData = this.summonBeasts[this.activeSummonIndex] || this.summonBeasts[0];
        }
    },

    /**
     * 契约新的召唤兽
     * @param {object} beastData - 来自DataSummonBeasts的召唤兽数据
     * @returns {object} {success, message}
     */
    contractSummonBeast(beastData) {
        this.migrateSummonData();
        const maxCount = this.getMaxSummonCount();
        if (this.summonBeasts.length >= maxCount) {
            const realmNames = { initial: '初阶', primary: '初阶', middle: '中阶', high: '高阶', super: '超阶' };
            return { success: false, message: `${realmNames[this.realm]}最多契约${maxCount}只召唤兽` };
        }
        // 检查是否已契约同一只
        const existing = this.summonBeasts.find(b => b.baseId === beastData.id || b.id === beastData.id);
        if (existing) {
            return { success: false, message: `你已经契约了${beastData.name}` };
        }
        const newBeast = {
            id: beastData.id,
            baseId: beastData.id,
            name: beastData.name,
            icon: beastData.icon,
            rarity: beastData.rarity || '普通',
            evolutionStage: 0,
            level: 1,
            exp: 0,
            expToNext: 50,
            loyalty: 50,
            baseMaxHp: beastData.baseStats.maxHp,
            baseAttack: beastData.baseStats.attack,
            baseDefense: beastData.baseStats.defense,
            baseSpeed: beastData.baseStats.speed,
            kills: 0
        };
        this.summonBeasts.push(newBeast);
        // 如果是第一只，自动激活
        if (this.summonBeasts.length === 1) {
            this.activeSummonIndex = 0;
            this.summonData = newBeast;
        }
        return { success: true, message: `✨ 你与 ${beastData.icon} ${beastData.name} 缔结了契约！`, beast: newBeast };
    },

    /**
     * 切换激活的召唤兽
     * @param {number} index - 召唤兽在数组中的索引
     * @returns {object} {success, message}
     */
    switchActiveSummon(index) {
        this.migrateSummonData();
        if (index < 0 || index >= this.summonBeasts.length) {
            return { success: false, message: '无效的召唤兽' };
        }
        this.activeSummonIndex = index;
        this.summonData = this.summonBeasts[index];
        return { success: true, message: `切换为 ${this.summonData.icon} ${this.summonData.name}`, beast: this.summonData };
    },

    /**
     * 获取所有已契约的召唤兽列表
     */
    getAllSummonBeasts() {
        this.migrateSummonData();
        return this.summonBeasts;
    }
};
