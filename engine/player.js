/**
 * 玩家系统
 * 管理玩家属性、成长、觉醒、技能
 */

// 游戏版本号 - 用于存档兼容性
const GAME_VERSION = '0.8.23';
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
    maxStamina: 100,  // 体力，每天恢复满，限制行动次数
    stamina: 100,

    // 元素与技能
    elements: [],
    elementLevels: {},  // 各系独立等级：{ fire: 15, thunder: 3 }
    elementExp: {},     // 各系独立经验：{ fire: 500, thunder: 0 }
    skills: ['basic_attack'],
    skillLevels: {},  // 技能等级：{ skillId: { level, exp } }
    realm: 'initial',  // 境界：initial/middle/high/super
    talents: {},  // 天赋：{ elementId: { talentId, level, exp } }
    spiritSeeds: {},  // 灵种：{ elementId: seedId }
    starDustArtifacts: {},  // 星尘魔器：{ elementId: { id, level, exp } }
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
    summonData: null,  // 召唤兽持久化数据 {id, name, level, exp, loyalty, skills, bonusStats}

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
        this.gold = 50;
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.enhanceLevels = { weapon: 0, armor: 0, accessory: 0 };
        this.activeQuests = [];
        this.completedQuests = [];
        this.currentLocation = 'tianlan_school';
        this.day = 1;  // 游戏从第1天开始（博城历2008年9月1日）
        this.hour = 8;  // 初始时间：早上8点
        this.timeOfDay = 'morning';
        this.flags = {};
        this.bestiary = {};
        this.dailyData = null;  // 由 DailySystem.initNewGame() 初始化
        this.unlockedLocations = ['tianlan_school', 'city_street', 'xuefeng_mountain'];
        this.battleBuffs = [];
        this.tempShopDiscount = 1.0;  // 临时商店折扣率（1.0=不打折）
        this.tempShopDiscountExpireDay = 0;  // 折扣到期天数
        this.summonData = null;  // 召唤兽数据（契约后初始化）

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
                        stats[key] = (stats[key] || 0) + Math.floor(item.equipStats[key] * enhanceMultiplier);
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
     * 强化装备
     * 返回 { success: boolean, message: string, newLevel: number }
     */
    enhanceEquipment(slot) {
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

        this.gold -= cost;
        const successRate = this.getEnhanceSuccessRate(slot);
        const success = Math.random() < successRate;

        if (success) {
            this.enhanceLevels[slot] = currentLevel + 1;
            return {
                success: true,
                message: `强化成功！${this.getSlotName(slot)}强化到+${currentLevel + 1}`,
                newLevel: currentLevel + 1
            };
        } else {
            // 失败降级（0级不降级）
            if (currentLevel > 0) {
                this.enhanceLevels[slot] = currentLevel - 1;
                return {
                    success: false,
                    message: `强化失败！${this.getSlotName(slot)}降级到+${currentLevel - 1}`,
                    newLevel: currentLevel - 1
                };
            }
            return {
                success: false,
                message: '强化失败！装备等级未变化',
                newLevel: 0
            };
        }
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
    },

    /**
     * 获得经验（兼容旧接口，分配给所有已觉醒系）
     * @param {number} amount - 经验值
     * @param {string[]} usedElements - 本场战斗使用过的元素系（可选，这些系获全额经验，其他系获30%）
     */
    gainExp(amount, usedElements) {
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
     * 获取某元素系的天赋效果
     * @param {string} element - 元素系ID
     * @returns {object} 天赋效果
     */
    getElementTalentEffects(element) {
        const talentData = this.getElementTalent(element);
        if (!talentData || typeof TalentSystem === 'undefined') return {};
        return TalentSystem.getTalentEffects(talentData.talentId, talentData.level);
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
            for (const key in effects) {
                if (typeof effects[key] === 'number') {
                    totalEffects[key] = (totalEffects[key] || 0) + effects[key];
                } else {
                    totalEffects[key] = effects[key];
                }
            }
        }

        // 合并自身天赋效果（InnateTalent）
        if (this.innateEffects) {
            for (const key in this.innateEffects) {
                const val = this.innateEffects[key];
                if (typeof val === 'number') {
                    totalEffects[key] = (totalEffects[key] || 0) + val;
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
     * 消耗体力
     */
    useStamina(amount) {
        if (this.stamina < amount) return false;
        this.stamina -= amount;
        return true;
    },

    /**
     * 恢复体力
     */
    restoreStamina(amount) {
        this.stamina = Math.min(this.stamina + amount, this.maxStamina);
    },

    /**
     * 完全恢复体力（每天早上）
     */
    fullRestoreStamina() {
        this.stamina = this.maxStamina;
    },

    /**
     * 获得金币
     */
    gainGold(amount) {
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
            spiritSeeds: this.spiritSeeds,
            starDustArtifacts: this.starDustArtifacts,
            npcRelations: this.npcRelations,
            tempBreakthroughBonus: this.tempBreakthroughBonus,
            gold: this.gold,
            equipment: this.equipment,
            enhanceLevels: this.enhanceLevels,
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            currentLocation: this.currentLocation,
            day: this.day,
            hour: this.hour,
            timeOfDay: this.timeOfDay,
            flags: this.flags,
            bestiary: this.bestiary,
            dailyData: this.dailyData,
            unlockedLocations: this.unlockedLocations,
            battleBuffs: this.battleBuffs,
            tempShopDiscount: this.tempShopDiscount,
            tempShopDiscountExpireDay: this.tempShopDiscountExpireDay,
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
            this.spiritSeeds = data.spiritSeeds ?? {};
            this.starDustArtifacts = data.starDustArtifacts ?? {};
            this.npcRelations = data.npcRelations ?? {};
            this.tempBreakthroughBonus = data.tempBreakthroughBonus ?? 0;
            this.gold = data.gold ?? 50;
            this.equipment = data.equipment ?? { weapon: null, armor: null, accessory: null };
            this.enhanceLevels = data.enhanceLevels ?? { weapon: 0, armor: 0, accessory: 0 };
            this.activeQuests = data.activeQuests ?? [];
            this.completedQuests = data.completedQuests ?? [];
            this.currentLocation = data.currentLocation ?? 'tianlan_school';
            this.day = data.day ?? 1;
            this.hour = data.hour ?? 8;  // 默认早上8点
            this.timeOfDay = data.timeOfDay ?? 'morning';
            this.flags = data.flags ?? {};
            this.bestiary = data.bestiary ?? {};
            this.dailyData = data.dailyData ?? null;
            this.unlockedLocations = data.unlockedLocations ?? ['tianlan_school', 'city_street', 'xuefeng_mountain'];
            this.battleBuffs = data.battleBuffs ?? [];
            this.tempShopDiscount = data.tempShopDiscount ?? 1.0;
            this.tempShopDiscountExpireDay = data.tempShopDiscountExpireDay ?? 0;
            
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
    }
};
