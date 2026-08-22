/**
 * 集中式状态管理与存档系统
 * v3.0.2 阶段一：基础框架，与Player.save()/load()完全兼容
 * 
 * 设计目标：
 * 1. 声明式schema，字段声明一次自动参与save/load
 * 2. 版本化迁移链
 * 3. 向后兼容（旧存档可正常加载）
 * 4. 不改变现有功能
 */

import { GAME_VERSION, SAVE_VERSION, SKILL_UNLOCK_TABLE } from './player.js';

// 当前存档版本
export const CURRENT_SAVE_VERSION = '3.0.2';

// 存档key
const SAVE_KEY = 'quanzhi_fashi_save';

/**
 * 状态schema定义
 * 每个字段声明：default（默认值）、category（分类）
 * 新增字段只需在此声明，自动参与save/load/默认值填充
 */
export const STATE_SCHEMA = {
    // === 玩家基础信息 ===
    name: { default: '冒险者', category: 'player' },
    level: { default: 1, category: 'player' },
    exp: { default: 0, category: 'player' },
    expToNext: { default: 80, category: 'player' },
    attributePoints: { default: 0, category: 'player' },

    // === 基础属性 ===
    maxHp: { default: 100, category: 'player' },
    hp: { default: 100, category: 'player' },
    maxMp: { default: 50, category: 'player' },
    mp: { default: 50, category: 'player' },
    attack: { default: 10, category: 'player' },
    defense: { default: 5, category: 'player' },
    speed: { default: 10, category: 'player' },
    spirit: { default: 10, category: 'player' },
    composure: { default: 50, category: 'player' },
    maxStamina: { default: 100, category: 'player', deprecated: true },
    stamina: { default: 100, category: 'player', deprecated: true },

    // === 每日行动 ===
    dailyActions: { default: { cultivate: 0, study: 0, hunt: 0, explore: 0 }, category: 'player' },

    // === 元素与技能 ===
    elements: { default: [], category: 'player' },
    elementLevels: { default: {}, category: 'player' },
    elementExp: { default: {}, category: 'player' },
    skills: { default: ['basic_attack'], category: 'player' },
    skillLevels: { default: {}, category: 'player' },
    realm: { default: 'initial', category: 'player' },
    talents: { default: {}, category: 'player' },
    innateTalent: { default: null, category: 'player' },
    innateEffects: { default: {}, category: 'player' },
    innateTalentLevel: { default: 1, category: 'player' },
    primaryElement: { default: null, category: 'player' },
    secondaryElement: { default: null, category: 'player' },
    spiritSeeds: { default: {}, category: 'player' },
    starDustArtifacts: { default: {}, category: 'player' },
    starDustAssignment: { default: null, category: 'player' },
    tempBreakthroughBonus: { default: 0, category: 'player' },
    npcRelations: { default: {}, category: 'player' },

    // === 金钱 ===
    gold: { default: 50, category: 'player' },

    // === 装备 ===
    equipment: { default: { weapon: null, armor: null, accessory: null }, category: 'player' },
    enhanceLevels: { default: { weapon: 0, armor: 0, accessory: 0 }, category: 'player' },
    enhanceFailStreak: { default: { weapon: 0, armor: 0, accessory: 0 }, category: 'player' },
    enhanceHistory: { default: [], category: 'player' },
    skillMemory: { default: {}, category: 'player' },

    // === 影响力与剧情 ===
    influence: { default: 0, category: 'player' },
    changedStoryNodes: { default: [], category: 'player' },

    // === 任务 ===
    activeQuests: { default: [], category: 'player' },
    completedQuests: { default: [], category: 'player' },

    // === 进度 ===
    currentLocation: { default: 'tianlan_school', category: 'player' },
    day: { default: 1, category: 'player' },
    hour: { default: 8, category: 'player' },
    timeOfDay: { default: 'morning', category: 'player' },
    flags: { default: {}, category: 'player' },
    investigation: { default: { demon: 0, black_church: 0, yu_ang: 0, earth_spring: 0, discoveredClues: [], yuAngSuspicion: 0 }, category: 'player' },
    bestiary: { default: {}, category: 'player' },
    dailyData: { default: null, category: 'player' },
    unlockedLocations: { default: ['tianlan_school', 'city_street', 'xuefeng_mountain'], category: 'player' },

    // === 战斗状态 ===
    battleBuffs: { default: [], category: 'player' },
    winStreak: { default: 0, category: 'player' },
    lastBattleDay: { default: 0, category: 'player' },
    tempShopDiscount: { default: 1.0, category: 'player' },
    tempShopDiscountExpireDay: { default: 0, category: 'player' },

    // === 召唤兽 ===
    summonData: { default: null, category: 'player' },
    summonBeasts: { default: [], category: 'player' },
    activeSummonIndex: { default: 0, category: 'player' },

    // === 探索记录 ===
    exploredLocations: { default: [], category: 'player' },
    exploredNPCs: { default: [], category: 'player' },
    fatigueLevel: { default: 0, category: 'player' },
    explorationComplete: { default: [], category: 'player' },
    consecutiveExplores: { default: 0, category: 'player' },
    exploredActions: { default: {}, category: 'player' },
    dailyStats: { default: { day: 1, expGained: 0, goldGained: 0, battlesWon: 0, locationsExplored: 0, npcsTalked: 0 }, category: 'player' },

    // === 子系统状态（通过回调序列化） ===
    inventory: { default: {}, category: 'subsystem' },
    worldState: { default: null, category: 'subsystem' },
    npcStates: { default: null, category: 'subsystem' },

    // === 元数据 ===
    gameVersion: { default: GAME_VERSION, category: 'meta' },
    saveVersion: { default: CURRENT_SAVE_VERSION, category: 'meta' },
    saveTime: { default: null, category: 'meta' },
};

/**
 * 版本迁移链
 * 每个迁移：{ from, to, fn(data) }
 * 按版本号顺序执行，支持版本跳跃
 */
const MIGRATIONS = [
    {
        from: '0.1.0', to: '0.2.0',
        fn: (data) => {
            console.log('[存档迁移] 从 0.1.x 迁移到 0.2.0');
            data.maxStamina = 100;
            data.stamina = 100;
            if (!data.unlockedLocations) {
                data.unlockedLocations = ['tianlan_school', 'city_street', 'xuefeng_mountain'];
            }
            return data;
        }
    },
    {
        from: '0.2.0', to: '0.3.0',
        fn: (data) => {
            console.log('[存档迁移] 从 0.2.x 迁移到 0.3.0');
            if (!data.worldState) data.worldState = null;
            if (!data.npcStates) data.npcStates = null;
            if (!data.spirit) data.spirit = 10;
            return data;
        }
    },
    {
        from: '0.3.0', to: '0.3.1',
        fn: (data) => {
            console.log('[存档迁移] 从 0.3.0 迁移到 0.3.1');
            if (!data.flags) data.flags = {};
            if (!data.attributePoints) data.attributePoints = 0;
            return data;
        }
    },
    {
        from: '0.8.0', to: '0.8.6',
        fn: (data) => {
            console.log('[存档迁移] 从 0.8.x 迁移到 0.8.6（新等级体系）');
            const oldLevel = data.level || 1;
            let newLevel;
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
            data.level = newLevel;

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
            if (newLevel >= 56) {
                baseHp = Math.floor(baseHp * 2.0); baseMp = Math.floor(baseMp * 3.0);
                baseAtk = Math.floor(baseAtk * 2.0); baseDef = Math.floor(baseDef * 2.0);
                baseSpd = Math.floor(baseSpd * 1.5); baseSpr = Math.floor(baseSpr * 2.0);
                data.realm = 'super';
            } else if (newLevel >= 31) {
                baseHp = Math.floor(baseHp * 1.6); baseMp = Math.floor(baseMp * 2.0);
                baseAtk = Math.floor(baseAtk * 1.5); baseDef = Math.floor(baseDef * 1.5);
                baseSpd = Math.floor(baseSpd * 1.3); baseSpr = Math.floor(baseSpr * 1.6);
                data.realm = 'high';
            } else if (newLevel >= 11) {
                baseHp = Math.floor(baseHp * 1.3); baseMp = Math.floor(baseMp * 1.5);
                baseAtk = Math.floor(baseAtk * 1.2); baseDef = Math.floor(baseDef * 1.2);
                baseSpd = Math.floor(baseSpd * 1.1); baseSpr = Math.floor(baseSpr * 1.3);
                data.realm = 'middle';
            } else {
                data.realm = 'initial';
            }
            data.maxHp = baseHp;
            data.maxMp = baseMp;
            data.attack = baseAtk;
            data.defense = baseDef;
            data.speed = baseSpd;
            data.spirit = baseSpr;
            data.hp = baseHp;
            data.mp = baseMp;
            data.exp = 0;
            return data;
        }
    },
    {
        from: '0.8.6', to: '0.8.7',
        fn: (data) => {
            console.log('[存档迁移] 从 0.8.6 迁移到 0.8.7（各系独立等级）');
            const globalLevel = data.level || 1;
            data.elementLevels = {};
            data.elementExp = {};
            if (data.elements && data.elements.length > 0) {
                data.elements.forEach(el => {
                    data.elementLevels[el] = globalLevel;
                    data.elementExp[el] = data.exp || 0;
                });
            }
            console.log(`[存档迁移] 各系等级初始化：${data.elements.map(e => e + ':' + globalLevel).join(', ')}`);
            return data;
        }
    },
    // v3.0.2 迁移：旧扁平格式 → 新格式（基本无需改动，只是版本号更新）
    {
        from: '0.8.7', to: '3.0.2',
        fn: (data) => {
            console.log('[存档迁移] 从 0.8.7 迁移到 3.0.2（集中式状态管理）');
            // 格式基本兼容，只需补全新字段默认值
            return data;
        }
    },
];

/**
 * 比较版本号
 * @returns 负数表示a < b，0表示相等，正数表示a > b
 */
function compareVersion(a, b) {
    const partsA = String(a).split('.').map(Number);
    const partsB = String(b).split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0;
        const numB = partsB[i] || 0;
        if (numA !== numB) return numA - numB;
    }
    return 0;
}

/**
 * GameState 集中式状态管理容器
 * 
 * 阶段一：作为Player.save()/load()的内部实现，保持外部接口不变
 * 阶段二：Player字段代理到GameState.state
 * 阶段三：子系统统一注册
 */
export const GameState = {
    /**
     * 子系统序列化回调注册
     * { inventory: () => data, worldState: () => data, npcStates: () => data }
     */
    _subsystemSerializers: {},
    _subsystemLoaders: {},

    /**
     * 注册子系统序列化/加载回调
     */
    registerSubsystem(name, serializer, loader) {
        this._subsystemSerializers[name] = serializer;
        this._subsystemLoaders[name] = loader;
    },

    /**
     * 获取所有玩家字段的当前值（从Player对象读取）
     * 阶段一：直接从Player读取，保持兼容
     */
    _collectPlayerState(Player) {
        const state = {};
        for (const key of Object.keys(STATE_SCHEMA)) {
            if (STATE_SCHEMA[key].category === 'player' && Player[key] !== undefined) {
                state[key] = Player[key];
            }
        }
        return state;
    },

    /**
     * 保存游戏
     * @param {object} Player - 玩家对象
     * @returns {boolean} 是否保存成功
     */
    save(Player) {
        try {
            const saveData = this._collectPlayerState(Player);

            // 子系统状态
            for (const [name, serializer] of Object.entries(this._subsystemSerializers)) {
                try {
                    saveData[name] = serializer();
                } catch (e) {
                    console.warn(`[存档] 子系统 ${name} 序列化失败:`, e);
                    saveData[name] = STATE_SCHEMA[name]?.default ?? null;
                }
            }

            // 元数据
            saveData.gameVersion = GAME_VERSION;
            saveData.saveVersion = CURRENT_SAVE_VERSION;
            saveData.saveTime = new Date().toISOString();

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('[存档] 保存失败:', e);
            return false;
        }
    },

    /**
     * 加载存档
     * @param {object} Player - 玩家对象
     * @returns {boolean} 是否加载成功
     */
    load(Player) {
        const saveStr = localStorage.getItem(SAVE_KEY);
        if (!saveStr) return false;

        try {
            let data = JSON.parse(saveStr);

            // 版本检测与迁移
            const saveVersion = data.saveVersion || data.version || '0.1.0';
            console.log(`[存档] 读取存档，版本: ${saveVersion}，当前版本: ${CURRENT_SAVE_VERSION}`);

            if (saveVersion !== CURRENT_SAVE_VERSION) {
                console.log(`[存档] 版本不同，尝试迁移...`);
                this._backupSave(saveStr, saveVersion);
                data = this._migrate(data, saveVersion);
                console.log(`[存档] 迁移完成！`);
            }

            // 应用默认值（补全缺失字段）
            data = this._applyDefaults(data);

            // 加载到Player对象（阶段一：直接赋值，保持与原load()一致）
            this._applyToPlayer(Player, data);

            // 加载子系统
            this._loadSubsystems(data);

            // 自动保存一次，更新为新版本格式
            this.save(Player);

            return true;
        } catch (e) {
            console.error('[存档] 读取失败:', e);
            return this._restoreBackup(Player);
        }
    },

    /**
     * 执行版本迁移链
     */
    _migrate(data, fromVersion) {
        let migrated = { ...data };
        let version = fromVersion;

        for (const m of MIGRATIONS) {
            if (compareVersion(version, m.from) < 0) {
                migrated = m.fn(migrated);
                version = m.to;
            }
        }

        migrated.saveVersion = CURRENT_SAVE_VERSION;
        migrated.gameVersion = GAME_VERSION;
        return migrated;
    },

    /**
     * 应用schema默认值（补全缺失字段）
     */
    _applyDefaults(data) {
        const result = { ...data };
        for (const [key, schema] of Object.entries(STATE_SCHEMA)) {
            if (result[key] === undefined || result[key] === null) {
                if (schema.default !== undefined && schema.default !== null) {
                    // 深拷贝默认值（避免引用共享）
                    result[key] = JSON.parse(JSON.stringify(schema.default));
                }
            }
        }
        return result;
    },

    /**
     * 将存档数据应用到Player对象
     * 阶段一：保持与原Player.load()完全一致的逻辑
     */
    _applyToPlayer(Player, data) {
        // 基础信息
        Player.name = data.name || '冒险者';
        Player.level = data.level ?? 1;
        Player.exp = data.exp ?? 0;
        Player.expToNext = Player._calcExpToNext(Player.level);
        Player.attributePoints = data.attributePoints ?? 0;

        // 基础属性
        Player.maxHp = data.maxHp ?? 120;
        Player.hp = data.hp ?? Player.maxHp;
        Player.maxMp = data.maxMp ?? 60;
        Player.mp = data.mp ?? Player.maxMp;
        Player.attack = data.attack ?? 15;
        Player.defense = data.defense ?? 8;
        Player.speed = data.speed ?? 10;
        Player.spirit = data.spirit ?? 12;
        Player.composure = data.composure ?? 50;
        Player.maxStamina = data.maxStamina ?? 100;
        Player.stamina = data.stamina ?? Player.maxStamina;

        // 每日行动
        Player.dailyActions = data.dailyActions || { cultivate: 0, study: 0, hunt: 0, explore: 0 };

        // 元素与技能
        Player.elements = data.elements ?? [];
        Player.elementLevels = data.elementLevels ?? {};
        Player.elementExp = data.elementExp ?? {};
        if (Object.keys(Player.elementLevels).length === 0 && Player.elements.length > 0) {
            Player.elements.forEach(el => {
                Player.elementLevels[el] = Player.level;
                Player.elementExp[el] = Player.exp || 0;
            });
        }
        Player.skills = data.skills ?? ['basic_attack'];
        Player.skillLevels = data.skillLevels ?? {};
        Player.realm = data.realm ?? 'initial';
        Player.talents = data.talents ?? {};
        Player.innateTalent = data.innateTalent ?? null;
        Player.innateEffects = data.innateEffects ?? {};
        Player.innateTalentLevel = data.innateTalentLevel ?? 1;
        Player.primaryElement = data.primaryElement ?? null;
        Player.secondaryElement = data.secondaryElement ?? null;
        Player.spiritSeeds = data.spiritSeeds ?? {};
        Player.starDustArtifacts = data.starDustArtifacts ?? {};
        Player.starDustAssignment = data.starDustAssignment ?? null;
        Player.tempBreakthroughBonus = data.tempBreakthroughBonus ?? 0;
        Player.npcRelations = data.npcRelations ?? {};

        // 金钱
        Player.gold = data.gold ?? 50;

        // 装备
        Player.equipment = data.equipment ?? { weapon: null, armor: null, accessory: null };
        Player.enhanceLevels = data.enhanceLevels ?? { weapon: 0, armor: 0, accessory: 0 };
        Player.enhanceFailStreak = data.enhanceFailStreak ?? { weapon: 0, armor: 0, accessory: 0 };
        Player.enhanceHistory = data.enhanceHistory || [];
        Player.skillMemory = data.skillMemory || {};

        // 影响力
        Player.influence = data.influence || 0;
        Player.changedStoryNodes = data.changedStoryNodes || [];

        // 任务
        Player.activeQuests = data.activeQuests ?? [];
        Player.completedQuests = data.completedQuests ?? [];

        // 进度
        Player.currentLocation = data.currentLocation ?? 'tianlan_school';
        Player.day = data.day ?? 1;
        Player.hour = data.hour ?? 8;
        Player.timeOfDay = data.timeOfDay ?? 'morning';
        Player.flags = data.flags ?? {};
        Player.investigation = data.investigation ?? { demon: 0, black_church: 0, yu_ang: 0, earth_spring: 0, discoveredClues: [], yuAngSuspicion: 0 };
        Player.bestiary = data.bestiary ?? {};
        Player.dailyData = data.dailyData ?? null;
        Player.unlockedLocations = data.unlockedLocations ?? ['tianlan_school', 'city_street', 'xuefeng_mountain'];

        // 战斗状态
        Player.battleBuffs = data.battleBuffs ?? [];
        Player.winStreak = data.winStreak ?? 0;
        Player.lastBattleDay = data.lastBattleDay ?? 0;
        Player.tempShopDiscount = data.tempShopDiscount ?? 1.0;
        Player.tempShopDiscountExpireDay = data.tempShopDiscountExpireDay ?? 0;

        // 召唤兽
        Player.summonBeasts = data.summonBeasts || [];
        Player.activeSummonIndex = data.activeSummonIndex || 0;
        if (data.summonData && (!Player.summonBeasts || Player.summonBeasts.length === 0)) {
            Player.summonBeasts = [data.summonData];
            Player.activeSummonIndex = 0;
        }
        Player.migrateSummonData();

        // 探索记录
        Player.exploredLocations = data.exploredLocations || [];
        Player.exploredNPCs = data.exploredNPCs || [];
        Player.fatigueLevel = data.fatigueLevel || 0;
        Player.explorationComplete = data.explorationComplete || [];
        Player.consecutiveExplores = data.consecutiveExplores || 0;
        Player.exploredActions = data.exploredActions || {};
        Player.dailyStats = data.dailyStats || { day: 1, expGained: 0, goldGained: 0, battlesWon: 0, locationsExplored: 0, npcsTalked: 0 };

        // v2.4.0 兼容：自动设置主修系
        if (!Player.primaryElement && Player.elements && Player.elements.length > 0) {
            Player.primaryElement = Player.elements[0];
            console.log(`[存档] 自动设置主修系为: ${Player.primaryElement}`);
        }

        // 补全初始技能
        Player.elements.forEach(elem => {
            const starterSkills = {
                fire: 'fire_bolt', ice: 'ice_spike', thunder: 'thunder_bolt',
                earth: 'earth_spike', wind: 'wind_blade', water: 'water_heal',
                light: 'light_ray', dark: 'dark_bolt', heal: 'heal_light',
                summon: 'summon_beast'
            };
            const starter = starterSkills[elem];
            if (starter && !Player.skills.includes(starter)) {
                Player.skills.push(starter);
            }
            const unlockTable = SKILL_UNLOCK_TABLE[elem];
            if (unlockTable) {
                Object.keys(unlockTable).forEach(levelStr => {
                    const unlockLevel = parseInt(levelStr);
                    if (unlockLevel <= Player.level) {
                        unlockTable[unlockLevel].forEach(skillId => {
                            if (!Player.skills.includes(skillId)) {
                                Player.skills.push(skillId);
                            }
                        });
                    }
                });
            }
        });

        // 补全天赋
        if (typeof TalentSystem !== 'undefined' && TalentSystem.initTalentForElement) {
            Player.elements.forEach(elem => {
                if (!Player.talents || !Player.talents[elem]) {
                    Player.talents[elem] = TalentSystem.initTalentForElement(elem);
                    console.log(`[存档迁移] 为 ${elem} 初始化天赋: ${Player.talents[elem].talentId}`);
                }
            });
        }
    },

    /**
     * 加载子系统状态
     */
    _loadSubsystems(data) {
        for (const [name, loader] of Object.entries(this._subsystemLoaders)) {
            if (data[name] !== undefined && data[name] !== null) {
                try {
                    loader(data[name]);
                } catch (e) {
                    console.warn(`[存档] 子系统 ${name} 加载失败:`, e);
                }
            }
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
    _restoreBackup(Player) {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('quanzhi_fashi_save_backup_'));
            if (keys.length === 0) return false;
            keys.sort().reverse();
            const latestBackup = keys[0];
            const saveStr = localStorage.getItem(latestBackup);
            if (saveStr) {
                console.log(`[存档] 尝试恢复备份: ${latestBackup}`);
                const data = JSON.parse(saveStr);
                Player.name = data.name || '冒险者';
                Player.level = data.level || 1;
                Player.exp = data.exp || 0;
                return true;
            }
        } catch (e) {
            console.error('[存档] 恢复备份失败:', e);
        }
        return false;
    },

    /**
     * 校验存档完整性
     * @returns {object} { valid, errors, warnings }
     */
    validateSave() {
        const saveStr = localStorage.getItem(SAVE_KEY);
        if (!saveStr) {
            return { valid: false, errors: ['无存档'], warnings: [] };
        }
        const errors = [];
        const warnings = [];
        try {
            const data = JSON.parse(saveStr);
            // 检查必填字段
            const requiredFields = ['name', 'level', 'day', 'currentLocation'];
            for (const field of requiredFields) {
                if (data[field] === undefined || data[field] === null) {
                    errors.push(`缺少必填字段: ${field}`);
                }
            }
            // 检查版本号
            if (!data.saveVersion) {
                warnings.push('存档无版本号，将按0.1.0处理');
            }
            // 检查数值合理性
            if (typeof data.level === 'number' && (data.level < 1 || data.level > 200)) {
                errors.push(`等级异常: ${data.level}`);
            }
            if (typeof data.gold === 'number' && data.gold < 0) {
                errors.push(`金币异常: ${data.gold}`);
            }
            if (typeof data.hp === 'number' && typeof data.maxHp === 'number' && data.hp > data.maxHp) {
                warnings.push(`HP超过上限: ${data.hp}/${data.maxHp}`);
            }
            // 检查elements是否为数组
            if (data.elements && !Array.isArray(data.elements)) {
                errors.push('elements不是数组');
            }
            return { valid: errors.length === 0, errors, warnings };
        } catch (e) {
            return { valid: false, errors: [`JSON解析失败: ${e.message}`], warnings: [] };
        }
    },

    /**
     * 导出存档为字符串（用于备份/分享）
     * @returns {string|null} base64编码的存档数据
     */
    exportSave() {
        const saveStr = localStorage.getItem(SAVE_KEY);
        if (!saveStr) return null;
        try {
            // 添加导出标记
            const data = JSON.parse(saveStr);
            data._exportedAt = new Date().toISOString();
            data._exportedBy = 'quanzhi-fashi-game';
            return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
        } catch (e) {
            console.error('[存档] 导出失败:', e);
            return null;
        }
    },

    /**
     * 从字符串导入存档
     * @param {string} encoded - base64编码的存档数据
     * @returns {object} { success, message }
     */
    importSave(encoded) {
        try {
            const jsonStr = decodeURIComponent(escape(atob(encoded)));
            const data = JSON.parse(jsonStr);
            // 验证导入标记
            if (data._exportedBy !== 'quanzhi-fashi-game') {
                return { success: false, message: '无效的存档文件格式' };
            }
            // 移除导出标记
            delete data._exportedAt;
            delete data._exportedBy;
            // 备份当前存档
            const current = localStorage.getItem(SAVE_KEY);
            if (current) {
                this._backupSave(current, data.saveVersion || 'unknown');
            }
            // 写入导入的存档
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            return { success: true, message: '存档导入成功，请刷新页面' };
        } catch (e) {
            console.error('[存档] 导入失败:', e);
            return { success: false, message: `导入失败: ${e.message}` };
        }
    },

    /**
     * 获取存档统计信息
     * @returns {object|null}
     */
    getSaveStats() {
        const info = this.getSaveInfo();
        if (!info) return null;
        const validation = this.validateSave();
        return {
            ...info,
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings,
            size: (localStorage.getItem(SAVE_KEY) || '').length,
        };
    },

    /**
     * 检查是否有存档
     */
    hasSave() {
        return !!localStorage.getItem(SAVE_KEY);
    },

    /**
     * 删除存档
     */
    clearSave() {
        localStorage.removeItem(SAVE_KEY);
    },

    /**
     * 获取存档元信息（不加载全部数据）
     */
    getSaveInfo() {
        const saveStr = localStorage.getItem(SAVE_KEY);
        if (!saveStr) return null;
        try {
            const data = JSON.parse(saveStr);
            return {
                name: data.name,
                level: data.level,
                day: data.day,
                saveVersion: data.saveVersion,
                saveTime: data.saveTime,
            };
        } catch (e) {
            return null;
        }
    },
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameState = GameState;
    window.CURRENT_SAVE_VERSION = CURRENT_SAVE_VERSION;
}
