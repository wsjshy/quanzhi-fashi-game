/**
 * 地图系统
 * 管理地点、移动、探索、随机遇敌
 */

const MapSystem = {
    // 当前地点数据
    currentLocation: null,

    /**
     * 初始化
     */
    init() {
        this.loadLocation(Player.currentLocation);
    },

    /**
     * 加载地点
     */
    loadLocation(locationId) {
        const location = DataManager.getLocation(locationId);
        if (!location) return false;

        this.currentLocation = location;
        Player.currentLocation = locationId;
        return true;
    },

    /**
     * v0.9.1: 获取探索进度
     * 返回已探索地点数/已解锁地点数
     */
    getExplorationProgress() {
        const allLocations = DataLocations || {};
        const unlockedIds = Player.unlockedLocations || [];
        const exploredIds = Player.exploredLocations || [];

        let total = 0;
        let explored = 0;

        for (const locId of unlockedIds) {
            if (allLocations[locId]) {
                total++;
                if (exploredIds.includes(locId)) {
                    explored++;
                }
            }
        }

        return {
            explored: explored,
            total: total,
            percent: total > 0 ? Math.floor((explored / total) * 100) : 0,
            isComplete: total > 0 && explored >= total
        };
    },

    /**
     * v0.9.2: 获取地点危险等级
     * 根据该地点可能遇到的妖魔等级，计算建议等级和危险程度
     */
    getLocationDangerLevel(locId) {
        const loc = DataManager.getLocation(locId);
        if (!loc || !loc.enemies || loc.enemies.length === 0) {
            return { level: 0, maxLevel: 0, enemyCount: 0, danger: 'safe', label: '安全' };
        }

        let totalLevel = 0;
        let maxLevel = 0;
        let validEnemies = 0;

        for (const enemyId of loc.enemies) {
            const enemy = DataManager.getEnemy(enemyId);
            if (enemy && enemy.level) {
                totalLevel += enemy.level;
                maxLevel = Math.max(maxLevel, enemy.level);
                validEnemies++;
            }
        }

        if (validEnemies === 0) {
            return { level: 0, maxLevel: 0, enemyCount: loc.enemies.length, danger: 'safe', label: '安全' };
        }

        const avgLevel = Math.floor(totalLevel / validEnemies);
        const playerLevel = Player.level || 1;

        // 危险程度判断
        let danger = 'safe';
        let label = '安全';
        if (maxLevel > playerLevel + 3) {
            danger = 'danger';
            label = '危险';
        } else if (maxLevel > playerLevel + 1) {
            danger = 'warning';
            label = '适中';
        } else {
            danger = 'safe';
            label = '安全';
        }

        return {
            level: avgLevel,
            maxLevel: maxLevel,
            enemyCount: loc.enemies.length,
            danger: danger,
            label: label
        };
    },

    /**
     * v0.9.3: 获取地点可能遇到的妖魔列表
     * 返回妖魔的详细信息（名称、等级、图标）
     */
    getLocationEnemies(locId) {
        const loc = DataManager.getLocation(locId);
        if (!loc || !loc.enemies || loc.enemies.length === 0) {
            return [];
        }

        const enemies = [];
        for (const enemyId of loc.enemies) {
            const enemy = DataManager.getEnemy(enemyId);
            if (enemy) {
                enemies.push({
                    id: enemyId,
                    name: enemy.name,
                    level: enemy.level || 1,
                    icon: enemy.icon || '👹',
                    tier: enemy.tier || 'normal'
                });
            }
        }

        // 按等级排序
        enemies.sort((a, b) => a.level - b.level);
        return enemies;
    },

    /**
     * 获取当前地点
     */
    getCurrentLocation() {
        return this.currentLocation;
    },

    /**
     * 获取所有已解锁的地点
     */
    getUnlockedLocations() {
        return Player.unlockedLocations.map(id => {
            const loc = DataManager.getLocation(id);
            return loc ? { id, name: loc.name, description: loc.description } : null;
        }).filter(Boolean);
    },
    
    /**
     * 获取所有未解锁的地点及其解锁条件
     */
    getLockedLocations() {
        const allLocations = DataManager.getAllLocations();
        return allLocations.filter(loc => {
            return !Player.unlockedLocations.includes(loc.id);
        }).map(loc => {
            return {
                id: loc.id,
                name: loc.name,
                description: loc.description,
                unlockCondition: loc.unlockCondition || null,
                unlockHint: loc.unlockCondition?.hint || '条件未知'
            };
        });
    },
    
    /**
     * 检查地点解锁条件，自动解锁满足条件的地点
     * 返回新解锁的地点列表
     */
    checkLocationUnlocks() {
        const allLocations = DataManager.getAllLocations();
        const newlyUnlocked = [];
        
        for (const loc of allLocations) {
            // 已解锁的跳过
            if (Player.unlockedLocations.includes(loc.id)) continue;
            
            // 没有解锁条件的跳过（应该一开始就解锁了）
            if (!loc.unlockCondition) continue;
            
            // 检查是否满足解锁条件
            if (this._checkUnlockCondition(loc.unlockCondition)) {
                Player.unlockLocation(loc.id);
                newlyUnlocked.push(loc);
            }
        }
        
        return newlyUnlocked;
    },
    
    /**
     * 检查解锁条件
     */
    _checkUnlockCondition(condition) {
        if (!condition) return true;
        
        // 等级条件
        if (condition.minLevel && Player.level < condition.minLevel) {
            return false;
        }
        
        // 声望条件
        if (condition.minReputation) {
            for (const [factionId, minRep] of Object.entries(condition.minReputation)) {
                if (WorldState.getReputation(factionId) < minRep) {
                    return false;
                }
            }
        }
        
        // 任务条件
        if (condition.requiredQuest) {
            if (!Player.completedQuests || !Player.completedQuests.includes(condition.requiredQuest)) {
                return false;
            }
        }
        
        // 全局标记条件
        if (condition.requiredFlag) {
            if (!WorldState.getFlag(condition.requiredFlag)) {
                return false;
            }
        }
        
        // NPC 好感度条件
        if (condition.minOpinion) {
            const npcId = condition.minOpinion.npcId;
            const minValue = condition.minOpinion.value;
            const npcState = NPCStateSystem.getNPCState(npcId);
            if (!npcState || npcState.opinion < minValue) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * 移动到地点
     */
    travelTo(locationId) {
        // 检查是否已解锁
        if (!Player.unlockedLocations.includes(locationId)) {
            return { success: false, message: '这个地方还没有解锁' };
        }

        const location = DataManager.getLocation(locationId);
        if (!location) {
            return { success: false, message: '地点不存在' };
        }

        // v0.9.0: 移动不再消耗体力（消除探索的物理成本）
        // 体力只影响效率，不阻止行动

        // 消耗时间（城市内移动半小时）
        const travelTime = 0.5;
        const timeEvents = TimeSystem.advanceTime(travelTime);

        // 加载新地点
        this.loadLocation(locationId);

        // 旅行随机事件
        let travelEvent = null;
        if (Math.random() < 0.15) { // 15%概率触发旅行事件
            travelEvent = EventSystem.triggerRandomEvent('travel', 0.1);
        }

        // 随机遇敌（野外地点）
        let randomBattle = null;
        if (location.enemies && location.enemies.length > 0) {
            const encounterRate = location.enemyRate || 0.2;
            if (Math.random() < encounterRate * 0.15) { // v0.9.0: 旅行时遇敌概率降低（从0.3降到0.15），减少探索打断
                randomBattle = this.triggerRandomBattle(location);
            }
        }

        return {
            success: true,
            message: `来到了 ${location.name}`,
            location: location,
            timeEvents: timeEvents,
            travelEvent: travelEvent,
            randomBattle: randomBattle
        };
    },

    /**
     * 执行地点行动
     */
    performAction(actionId) {
        if (!this.currentLocation) {
            return { success: false, message: '没有当前地点' };
        }

        const action = this.currentLocation.actions.find(a => a.id === actionId);
        if (!action) {
            return { success: false, message: '行动不存在' };
        }

        // v0.9.0: 体力不再作为硬限制，移除检查
        // 体力消耗仍保留（修炼等），但useStamina不会阻止行动
        const staminaCost = action.staminaCost !== undefined ? action.staminaCost : 10;
        Player.useStamina(staminaCost);

        const result = {
            success: true,
            action: action,
            effects: null,
            event: null,
            battle: null,
            shop: null,
            npcs: null,
            timeEvents: null
        };

        // 消耗时间
        if (action.timeCost) {
            result.timeEvents = TimeSystem.advanceTime(action.timeCost);
        }

        // 直接效果
        if (action.effects) {
            result.effects = EventSystem.applyEffects(action.effects);
        }

        // 随机事件
        if (action.eventChance && action.events && action.events.length > 0) {
            if (Math.random() < action.eventChance) {
                const eventId = action.events[Math.floor(Math.random() * action.events.length)];
                result.event = EventSystem.triggerEvent(eventId);
            }
        }

        // 随机遇敌（修炼/探索类行动）
        if (this.currentLocation.enemies && this.currentLocation.enemies.length > 0) {
            const encounterRate = this.currentLocation.enemyRate || 0.2;
            const actionModifier = this.getActionEncounterModifier(actionId);
            if (Math.random() < encounterRate * actionModifier) {
                result.battle = this.triggerRandomBattle(this.currentLocation);
            }
        }

        // 商店
        if (action.shopId) {
            result.shop = ShopSystem.openShop(action.shopId);
        }

        // NPC列表（根据时间过滤）
        if (action.npcs) {
            const currentPeriod = TimeSystem.getCurrentPeriod();
            result.npcs = action.npcs
                .map(npcId => DataManager.getCharacter(npcId))
                .filter(npc => {
                    if (!npc) return false;
                    // 如果NPC没有设置可用时间，默认所有时间都可以找到
                    if (!npc.availableTimes) return true;
                    // 检查当前时段是否在NPC的可用时间内
                    return npc.availableTimes.includes(currentPeriod);
                });
            // 记录不可用的NPC，用于显示提示
            result.unavailableNpcs = action.npcs
                .map(npcId => DataManager.getCharacter(npcId))
                .filter(npc => {
                    if (!npc) return false;
                    if (!npc.availableTimes) return false;
                    return !npc.availableTimes.includes(currentPeriod);
                });
        }

        return result;
    },

    /**
     * 获取行动的遇敌修正系数
     */
    getActionEncounterModifier(actionId) {
        const modifiers = {
            'explore': 1.5,      // 探索：遇敌率高
            'hunt': 2.0,         // 猎魔：遇敌率最高
            'train': 0.5,        // 修炼：遇敌率低
            'study': 0.1,        // 上课：几乎不会遇敌
            'rest': 0.0,         // 休息：不会遇敌
            'shop': 0.0,         // 购物：不会遇敌
            'talk': 0.0          // 聊天：不会遇敌
        };
        return modifiers[actionId] !== undefined ? modifiers[actionId] : 0.3;
    },

    /**
     * 触发随机战斗
     */
    triggerRandomBattle(location) {
        if (!location.enemies || location.enemies.length === 0) return null;

        // 随机选择敌人
        const enemyId = location.enemies[Math.floor(Math.random() * location.enemies.length)];
        const enemy = DataManager.getCharacter(enemyId);
        
        if (!enemy) return null;
        
        // 复制敌人数据
        let battleEnemy = JSON.parse(JSON.stringify(enemy));
        
        // 昼夜影响：晚上敌人更强，奖励更好
        const isNight = TimeSystem.isNight();
        if (isNight) {
            battleEnemy.level += 1;
            battleEnemy.maxHp = Math.floor(battleEnemy.maxHp * 1.2);
            battleEnemy.hp = battleEnemy.maxHp;
            battleEnemy.attack = Math.floor(battleEnemy.attack * 1.15);
            battleEnemy.expReward = Math.floor(battleEnemy.expReward * 1.3);
            battleEnemy.goldReward = Math.floor(battleEnemy.goldReward * 1.3);
            battleEnemy.isNightBonus = true;
        }
        
        // 地点等级加成（比如雪峰山深处）
        if (location.enemyLevelBonus) {
            battleEnemy.level += location.enemyLevelBonus;
            battleEnemy.maxHp = Math.floor(battleEnemy.maxHp * (1 + location.enemyLevelBonus * 0.15));
            battleEnemy.hp = battleEnemy.maxHp;
            battleEnemy.attack = Math.floor(battleEnemy.attack * (1 + location.enemyLevelBonus * 0.1));
            battleEnemy.expReward = Math.floor(battleEnemy.expReward * (location.expBonus || 1));
            battleEnemy.goldReward = Math.floor(battleEnemy.goldReward * (location.dropRateBonus || 1));
        }

        // 有概率遇到精英怪（更强，奖励更多）
        const eliteChance = isNight ? 0.15 : 0.1; // 晚上精英概率更高
        const isElite = Math.random() < eliteChance;
        if (isElite) {
            // 精英怪属性提升50%，奖励翻倍
            battleEnemy.name = '精英·' + battleEnemy.name;
            battleEnemy.level += 2;
            battleEnemy.maxHp = Math.floor(battleEnemy.maxHp * 1.5);
            battleEnemy.hp = battleEnemy.maxHp;
            battleEnemy.attack = Math.floor(battleEnemy.attack * 1.3);
            battleEnemy.defense = Math.floor(battleEnemy.defense * 1.2);
            battleEnemy.expReward = Math.floor(battleEnemy.expReward * 2);
            battleEnemy.goldReward = Math.floor(battleEnemy.goldReward * 2);
            battleEnemy.isElite = true;
            return { enemy: battleEnemy, isElite: true };
        }

        // 有概率遇到多只敌人（20%概率2只）
        const enemyCount = Math.random() < 0.2 ? 2 : 1;
        if (enemyCount > 1) {
            // TODO: 多敌人战斗，暂时先单只
        }

        return { enemy: battleEnemy, isElite: false };
    },

    /**
     * 探索（高概率遇敌和发现物品）
     */
    explore() {
        const result = {
            items: [],
            battle: null,
            event: null,
            gold: 0
        };

        // 30%概率发现物品
        if (Math.random() < 0.3) {
            const foundItems = this.getRandomFindItems();
            foundItems.forEach(item => {
                Inventory.addItem(item.itemId, item.count);
                result.items.push(item);
            });
        }

        // 10%概率捡到金币
        if (Math.random() < 0.1) {
            const gold = Math.floor(Math.random() * 20) + 5;
            Player.gainGold(gold);
            result.gold = gold;
        }

        return result;
    },

    /**
     * 获取随机发现的物品
     */
    getRandomFindItems() {
        // 根据地点不同，能发现的物品也不同
        const commonItems = [
            { itemId: 'health_potion', count: 1, weight: 30 },
            { itemId: 'mana_potion', count: 1, weight: 25 },
            { itemId: 'magic_stone', count: 1, weight: 20 },
            { itemId: 'demon_core', count: 1, weight: 10 },
            { itemId: 'gold_coin', count: 10, weight: 15 }
        ];

        // 权重随机
        const totalWeight = commonItems.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * totalWeight;
        
        for (const item of commonItems) {
            roll -= item.weight;
            if (roll <= 0) {
                return [item];
            }
        }

        return [commonItems[0]];
    },

    /**
     * 死亡处理
     */
    handleDeath() {
        const result = {
            message: '',
            expLost: 0,
            goldLost: 0,
            itemsLost: [],
            respawnLocation: ''
        };

        // 掉经验：掉当前等级的10%经验
        const expLost = Math.floor(Player.expToNext * 0.1);
        Player.exp = Math.max(0, Player.exp - expLost);
        result.expLost = expLost;

        // 掉金币：掉20%金币
        const goldLost = Math.floor(Player.gold * 0.2);
        Player.gold = Math.floor(Player.gold * 0.8);
        result.goldLost = goldLost;

        // 有概率掉物品（10%概率掉一个背包物品）
        if (Inventory.items.length > 0 && Math.random() < 0.3) {
            const randomIndex = Math.floor(Math.random() * Inventory.items.length);
            const lostItem = Inventory.items[randomIndex];
            const lostCount = Math.min(lostItem.count, 1); // 只掉1个
            Inventory.removeItem(lostItem.itemId, lostCount);
            const itemData = Inventory.getItem(lostItem.itemId);
            result.itemsLost.push({
                itemId: lostItem.itemId,
                name: itemData ? itemData.name : lostItem.itemId,
                count: lostCount
            });
        }

        // 回安全点复活
        const safeLocation = 'tianlan_school'; // 学校是安全点
        this.loadLocation(safeLocation);
        result.respawnLocation = DataManager.getLocation(safeLocation)?.name || '安全点';

        // 恢复一半HP/MP
        const stats = Player.getTotalStats();
        Player.hp = Math.floor(stats.maxHp * 0.5);
        Player.mp = Math.floor(stats.maxMp * 0.5);

        // 时间流逝（昏迷了一段时间）
        TimeSystem.advanceTime(12);

        result.message = `你被击败了...\n损失了 ${expLost} 经验、${goldLost} 金币\n在 ${result.respawnLocation} 醒来`;

        return result;
    }
};
