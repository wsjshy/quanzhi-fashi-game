/**
 * 玩家系统
 * 管理玩家属性、成长、觉醒、技能
 */

// 游戏版本号 - 用于存档兼容性
const GAME_VERSION = '0.4.0';
const SAVE_VERSION = '0.4.0';

// 技能解锁表：按元素和等级定义可解锁的技能
const SKILL_UNLOCK_TABLE = {
    fire: {
        1: ['fire_bolt'],
        2: ['fire_soul'],
        3: ['fire_rain'],
        5: ['fire_burst']
    },
    ice: {
        1: ['ice_spike'],
        2: ['ice_frost'],
        3: ['ice_shield'],
        5: ['ice_storm']
    },
    thunder: {
        1: ['thunder_bolt'],
        2: ['thunder_drive'],
        3: ['thunder_chain'],
        5: ['thunder_strike']
    },
    earth: {
        1: ['earth_shield'],
        2: ['earth_mud'],
        3: ['earth_spike'],
        5: ['earth_quake']
    },
    wind: {
        1: ['wind_blade'],
        2: ['wind_barrier'],
        3: ['wind_speed'],
        5: ['wind_tornado']
    },
    water: {
        1: ['water_heal'],
        2: ['water_moist'],
        3: ['water_chain'],
        5: ['water_wave']
    },
    light: {
        1: ['light_ray'],
        2: ['light_blessing'],
        3: ['light_shield'],
        5: ['light_judgment']
    },
    dark: {
        1: ['dark_bolt'],
        2: ['dark_weakness'],
        3: ['dark_cloak'],
        5: ['dark_curse']
    },
    heal: {
        1: ['heal_light'],
        3: ['heal_holy', 'heal_cleanse'],
        5: ['heal_revive']
    }
};

const Player = {
    // 基础信息
    name: '冒险者',
    level: 1,
    exp: 0,
    expToNext: 100,
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
    skills: ['basic_attack'],

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
    unlockedLocations: ['tianlan_school', 'city_street', 'xuefeng_mountain'],

    // 战斗状态
    battleBuffs: [],

    /**
     * 初始化新玩家
     */
    init(name, element) {
        this.name = name || '冒险者';
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.attributePoints = 0;
        this.maxHp = 100;
        this.hp = 100;
        this.maxMp = 50;
        this.mp = 50;
        this.attack = 10;
        this.defense = 5;
        this.speed = 10;
        this.spirit = 10;
        this.maxStamina = 100;
        this.stamina = 100;
        this.elements = element ? [element] : [];
        this.skills = ['basic_attack'];
        this.gold = 50;
        this.equipment = { weapon: null, armor: null, accessory: null };
        this.enhanceLevels = { weapon: 0, armor: 0, accessory: 0 };
        this.activeQuests = [];
        this.completedQuests = [];
        this.currentLocation = 'tianlan_school';
        this.day = 1;
        this.hour = 8;  // 初始时间：早上8点
        this.timeOfDay = 'morning';
        this.flags = {};
        this.unlockedLocations = ['tianlan_school', 'city_street', 'xuefeng_mountain'];
        this.battleBuffs = [];

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
     * 获得经验
     * 返回 { levelUps: [], newSkills: [] }
     */
    gainExp(amount) {
        this.exp += amount;
        const levelUps = [];
        const allNewSkills = [];
        let canAwaken = false;
        
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            const result = this.levelUp();
            levelUps.push(this.level);
            allNewSkills.push(...(result.newSkills || []));
            if (result.canAwaken) canAwaken = true;
        }
        
        return { levelUps, newSkills: allNewSkills, canAwaken };
    },

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.expToNext = Math.floor(this.expToNext * 1.5);
        this.attributePoints += 3;
        
        // 基础属性提升
        this.maxHp += 15;
        this.maxMp += 8;
        this.attack += 2;
        this.defense += 1;
        this.speed += 1;
        this.spirit += 2;
        
        // 满血满蓝
        this.hp = this.maxHp;
        this.mp = this.maxMp;
        
        // 检查并解锁新技能
        const newSkills = this.checkSkillUnlocks();

        // 检查是否可以觉醒新系
        const canAwaken = this.canAwakenNewElement();

        return { newSkills, canAwaken };
    },

    /**
     * 检查当前等级可解锁的技能
     * 返回新解锁的技能ID列表
     */
    checkSkillUnlocks() {
        const newSkills = [];
        this.elements.forEach(element => {
            const unlockTable = SKILL_UNLOCK_TABLE[element];
            if (!unlockTable) return;
            
            // 检查所有小于等于当前等级的解锁项
            Object.keys(unlockTable).forEach(levelStr => {
                const unlockLevel = parseInt(levelStr);
                if (unlockLevel <= this.level) {
                    unlockTable[unlockLevel].forEach(skillId => {
                        if (!this.skills.includes(skillId) && SkillSystem.getSkill(skillId)) {
                            this.skills.push(skillId);
                            newSkills.push(skillId);
                        }
                    });
                }
            });
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
            spirit: { stat: 'maxMp', amount: 10, also: 'mp' }
        };

        const config = attrMap[attr];
        if (!config) return false;

        this[config.stat] += config.amount;
        if (config.also) {
            this[config.also] += config.amount;
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

        // 检查觉醒条件：第二系需要8级（中阶），第三系需要15级（高阶）
        const currentElementCount = this.elements.length;
        const requiredLevel = currentElementCount === 0 ? 1 : currentElementCount === 1 ? 8 : 15;
        if (this.level < requiredLevel) {
            const rankName = requiredLevel >= 15 ? '高阶' : '中阶';
            return { success: false, message: `需要达到${rankName}（${requiredLevel}级）才能觉醒新元素系` };
        }

        // 最多觉醒3系
        if (currentElementCount >= 3) {
            return { success: false, message: '最多只能觉醒3个元素系' };
        }

        // 觉醒
        this.elements.push(element);

        // 自动解锁该系1级技能
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

        // 检查该系其他等级的技能是否也满足解锁条件
        Object.keys(starterTable || {}).forEach(levelStr => {
            const unlockLevel = parseInt(levelStr);
            if (unlockLevel <= this.level && unlockLevel > 1) {
                starterTable[unlockLevel].forEach(skillId => {
                    if (!this.skills.includes(skillId)) {
                        this.skills.push(skillId);
                        unlockedSkills.push(skillId);
                    }
                });
            }
        });

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
     * 检查是否可以觉醒新系
     * @returns {boolean}
     */
    canAwakenNewElement() {
        const count = this.elements.length;
        if (count >= 3) return false;
        const requiredLevel = count === 0 ? 1 : count === 1 ? 8 : 15;
        return this.level >= requiredLevel;
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
        }
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
            skills: this.skills,
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
            unlockedLocations: this.unlockedLocations,
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
            this.level = data.level || 1;
            this.exp = data.exp || 0;
            this.expToNext = data.expToNext || this._calcExpToNext(this.level);
            this.attributePoints = data.attributePoints || 0;
            this.maxHp = data.maxHp || 100;
            this.hp = data.hp || this.maxHp;
            this.maxMp = data.maxMp || 50;
            this.mp = data.mp || this.maxMp;
            this.attack = data.attack || 10;
            this.defense = data.defense || 5;
            this.speed = data.speed || 10;
            this.spirit = data.spirit || 10;
            this.maxStamina = data.maxStamina || 100;
            this.stamina = data.stamina || this.maxStamina;
            this.elements = data.elements || [];
            this.skills = data.skills || ['basic_attack'];
            this.gold = data.gold || 50;
            this.equipment = data.equipment || { weapon: null, armor: null, accessory: null };
            this.enhanceLevels = data.enhanceLevels || { weapon: 0, armor: 0, accessory: 0 };
            this.activeQuests = data.activeQuests || [];
            this.completedQuests = data.completedQuests || [];
            this.currentLocation = data.currentLocation || 'tianlan_school';
            this.day = data.day || 1;
            this.hour = data.hour || 8;  // 默认早上8点
            this.timeOfDay = data.timeOfDay || 'morning';
            this.flags = data.flags || {};
            this.unlockedLocations = data.unlockedLocations || ['tianlan_school', 'city_street', 'xuefeng_mountain'];
            
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
                    light: 'light_ray', dark: 'dark_bolt', heal: 'heal_light'
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
