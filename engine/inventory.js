/**
 * 背包系统
 * 管理物品、装备、道具使用
 */

const Inventory = {
    // 背包物品列表 [{itemId, count}]
    items: [],

    // 物品数据缓存
    _itemData: {},

    /**
     * 初始化背包
     */
    init() {
        this.items = [];
        this._itemData = {};
    },

    /**
     * 获取物品数据
     */
    getItem(itemId) {
        if (this._itemData[itemId]) {
            return this._itemData[itemId];
        }
        
        // 从数据管理器获取
        const item = DataManager.getItem(itemId);
        if (item) {
            this._itemData[itemId] = item;
        }
        return item;
    },

    /**
     * 添加物品
     */
    addItem(itemId, count = 1) {
        const item = this.getItem(itemId);
        if (!item) return false;

        if (item.stackable) {
            // 可堆叠物品
            const existing = this.items.find(i => i.itemId === itemId);
            if (existing) {
                existing.count += count;
            } else {
                this.items.push({ itemId, count });
            }
        } else {
            // 不可堆叠物品，逐个添加
            for (let i = 0; i < count; i++) {
                this.items.push({ itemId, count: 1 });
            }
        }

        // 更新任务进度（采集物品）
        if (typeof QuestSystem !== 'undefined') {
            QuestSystem.updateProgress('collect', itemId, count);
        }
        
        return true;
    },

    /**
     * 移除物品
     */
    removeItem(itemId, count = 1) {
        const total = this.getItemCount(itemId);
        if (total < count) return false;

        const item = this.getItem(itemId);
        if (item.stackable) {
            const existing = this.items.find(i => i.itemId === itemId);
            if (existing) {
                existing.count -= count;
                if (existing.count <= 0) {
                    const index = this.items.indexOf(existing);
                    this.items.splice(index, 1);
                }
            }
        } else {
            let removed = 0;
            for (let i = this.items.length - 1; i >= 0 && removed < count; i--) {
                if (this.items[i].itemId === itemId) {
                    this.items.splice(i, 1);
                    removed++;
                }
            }
        }
        
        return true;
    },

    /**
     * 获取物品数量
     */
    getItemCount(itemId) {
        return this.items
            .filter(i => i.itemId === itemId)
            .reduce((sum, i) => sum + i.count, 0);
    },

    /**
     * 检查是否有足够的物品
     */
    hasItem(itemId, count = 1) {
        return this.getItemCount(itemId) >= count;
    },

    /**
     * 使用物品
     */
    useItem(itemId, inBattle = false) {
        const item = this.getItem(itemId);
        if (!item) return { success: false, message: '物品不存在' };

        // 检查是否可以使用
        if (inBattle && !item.usableInBattle) {
            return { success: false, message: '战斗中无法使用此物品' };
        }
        if (!inBattle && !item.usableOutOfBattle) {
            return { success: false, message: '此物品不能在战斗外使用' };
        }

        // 检查数量
        if (!this.hasItem(itemId, 1)) {
            return { success: false, message: '物品数量不足' };
        }

        // 灵种炼化
        if (item.type === 'spirit_seed') {
            // 检查是否已觉醒该系
            if (!Player.elements.includes(item.element)) {
                return { success: false, message: '你还没有觉醒该元素系，无法炼化此灵种' };
            }
            // 检查是否已有更高品质的灵种
            if (Player.spiritSeeds && Player.spiritSeeds[item.element]) {
                const oldSeedId = Player.spiritSeeds[item.element];
                const oldSeed = this.getItem(oldSeedId);
                if (oldSeed && typeof SpiritSeedSystem !== 'undefined') {
                    const oldGrade = SpiritSeedSystem.getGradeConfig(oldSeed.grade);
                    const newGrade = SpiritSeedSystem.getGradeConfig(item.grade);
                    if (oldGrade && newGrade && oldGrade.multiplier >= newGrade.multiplier) {
                        return { success: false, message: '你已拥有品质更高或相等的同系灵种' };
                    }
                }
            }
            // 执行炼化
            if (typeof SpiritSeedSystem !== 'undefined') {
                const success = Player.refineSpiritSeed(itemId);
                if (success) {
                    return { success: true, message: `成功炼化了 ${item.name}，该系魔法威力提升！` };
                } else {
                    return { success: false, message: '炼化失败' };
                }
            }
            return { success: false, message: '灵种系统未加载' };
        }

        // 星尘魔器装备
        if (item.type === 'star_dust_artifact') {
            if (typeof StarDustArtifactSystem === 'undefined') {
                return { success: false, message: '星尘魔器系统未加载' };
            }
            
            const artifactId = item.artifactId;
            const artifact = StarDustArtifactSystem.getArtifact(artifactId);
            
            // 成长型星尘魔器的特殊处理
            if (artifact && artifact.grade === 'growth') {
                // 检查是否已经装备了成长型星尘魔器
                if (Player.starDustArtifacts && Player.starDustArtifacts['all']) {
                    // 已经装备了，检查背包中是否有其他星尘魔器可以吸收
                    const absorbableItems = this._getAbsorbableArtifacts();
                    if (absorbableItems.length === 0) {
                        return { success: false, message: '背包中没有可以吸收的星尘魔器' };
                    }
                    
                    // 自动吸收所有可吸收的星尘魔器（简化版）
                    let count = 0;
                    let leveledUp = false;
                    for (const absorbItem of absorbableItems) {
                        const result = Player.absorbStarDustArtifact('all', absorbItem.itemId);
                        if (result.success) {
                            count++;
                            if (result.levelUp) {
                                leveledUp = true;
                            }
                        }
                    }
                    
                    if (count > 0) {
                        const msg = leveledUp 
                            ? `吸收了 ${count} 个星尘魔器，${artifact.name} 升级了！` 
                            : `成功吸收了 ${count} 个星尘魔器`;
                        return { success: true, message: msg };
                    } else {
                        return { success: false, message: '吸收失败' };
                    }
                } else {
                    // 没有装备，装备它
                    const result = Player.equipStarDustArtifact(artifactId);
                    if (result.success) {
                        // 消耗物品
                        this.removeItem(itemId, 1);
                        return { success: true, message: result.message + '（成长型魔器可吸收其他星尘魔器升级）' };
                    } else {
                        return { success: false, message: result.message };
                    }
                }
            }

            // 普通星尘魔器的装备逻辑
            const result = Player.equipStarDustArtifact(artifactId);
            
            if (result.success) {
                // 消耗物品
                this.removeItem(itemId, 1);
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        }

        // 残魄/精魄：用于升级成长型星尘魔器
        if (item.type === 'soul') {
            if (typeof SoulSystem === 'undefined') {
                return { success: false, message: '魂魄系统未加载' };
            }

            // 检查是否有成长型星尘魔器
            if (!SoulSystem.hasLittleLoach(Player)) {
                return { success: false, message: '需要先装备成长型星尘魔器（如小泥鳅坠）才能使用魂魄' };
            }

            // 使用魂魄升级星尘魔器
            const soulResult = SoulSystem.upgradeArtifactWithSoul(Player, 'all', itemId, 1);
            if (soulResult.success) {
                return { success: true, message: soulResult.message };
            } else {
                return { success: false, message: soulResult.message };
            }
        }

        // 地圣泉水：被小泥鳅坠吸收，获得大量经验
        if (item.specialEffect === 'earth_spring_absorb') {
            if (typeof StarDustArtifactSystem === 'undefined') {
                return { success: false, message: '星尘魔器系统未加载' };
            }

            // 检查是否装备了小泥鳅坠
            if (!Player.starDustArtifacts || !Player.starDustArtifacts['all']) {
                return { success: false, message: '需要先装备小泥鳅坠才能吸收地圣泉水' };
            }

            const artifactData = Player.starDustArtifacts['all'];
            if (artifactData.id !== 'little_loach') {
                return { success: false, message: '只有小泥鳅坠才能吸收地圣泉水' };
            }

            // 增加大量经验（地圣泉水提供500点经验）
            const gainExp = 500;
            const currentLevel = artifactData.level || 1;
            const currentExp = artifactData.exp || 0;
            const newExp = currentExp + gainExp;

            // 计算升级
            let newLevel = currentLevel;
            let remainingExp = newExp;
            const maxLevel = 10;

            while (remainingExp >= StarDustArtifactSystem.getExpToNextLevel(newLevel) && newLevel < maxLevel) {
                remainingExp -= StarDustArtifactSystem.getExpToNextLevel(newLevel);
                newLevel++;
            }

            // 更新星尘魔器
            Player.starDustArtifacts['all'] = {
                ...artifactData,
                level: newLevel,
                exp: remainingExp
            };

            // 消耗物品
            this.removeItem(itemId, 1);

            const levelUpMsg = newLevel > currentLevel ? `，小泥鳅坠升级到 Lv.${newLevel}！` : '';
            return { success: true, message: `小泥鳅坠吸收了地圣泉水，获得 ${gainExp} 经验${levelUpMsg}` };
        }

        // 地圣泉结晶：提升突破成功率（临时buff）
        if (item.specialEffect === 'breakthrough_boost') {
            // 临时增加突破成功率加成
            if (!Player.tempBreakthroughBonus) {
                Player.tempBreakthroughBonus = 0;
            }
            Player.tempBreakthroughBonus = Math.min(0.3, (Player.tempBreakthroughBonus || 0) + 0.15);

            // 消耗物品
            this.removeItem(itemId, 1);

            return { success: true, message: `服用了地圣泉结晶，下次突破成功率 +15%！` };
        }

        // 消耗物品
        this.removeItem(itemId, 1);

        // 应用效果
        const result = { success: true, message: '', effects: {} };
        
        if (item.effects) {
            if (item.effects.hp) {
                Player.heal(item.effects.hp);
                result.effects.hp = item.effects.hp;
                result.message += `恢复了 ${item.effects.hp} 点生命值 `;
            }
            if (item.effects.mp) {
                Player.restoreMp(item.effects.mp);
                result.effects.mp = item.effects.mp;
                result.message += `恢复了 ${item.effects.mp} 点魔法值 `;
            }
            if (item.effects.stamina) {
                Player.stamina = Math.min(Player.maxStamina, Player.stamina + item.effects.stamina);
                result.effects.stamina = item.effects.stamina;
                result.message += `恢复了 ${item.effects.stamina} 点体力 `;
            }
        }

        if (!result.message) {
            result.message = `使用了 ${item.name}`;
        }

        return result;
    },

    /**
     * 装备物品
     */
    equipItem(itemId) {
        const item = this.getItem(itemId);
        if (!item) return { success: false, message: '物品不存在' };

        if (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') {
            return { success: false, message: '此物品不能装备' };
        }

        const slot = item.equipSlot;
        if (!slot) return { success: false, message: '装备槽位错误' };

        // 卸下旧装备
        const oldItemId = Player.equipment[slot];
        if (oldItemId) {
            this.addItem(oldItemId, 1);
        }

        // 装备新物品
        Player.equipment[slot] = itemId;
        this.removeItem(itemId, 1);
        
        // 魔具成就检查
        if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
            try {
                const equippedCount = Object.values(Player.equipment).filter(id => id !== null).length;
                
                // 第一件魔具
                if (equippedCount >= 1 && !WorldState.hasAchievement('first_artifact')) {
                    const achData = DataAchievements['first_artifact'];
                    if (achData) {
                        WorldState.unlockAchievement('first_artifact', achData);
                    }
                }
                
                // 全身武装
                if (equippedCount >= 3 && !WorldState.hasAchievement('full_equipment')) {
                    const achData = DataAchievements['full_equipment'];
                    if (achData) {
                        WorldState.unlockAchievement('full_equipment', achData);
                    }
                }
            } catch (e) {
                console.warn('[Inventory] 魔具成就检查失败:', e);
            }
        }

        return { 
            success: true, 
            message: `装备了 ${item.name}`,
            oldItem: oldItemId
        };
    },

    /**
     * 卸下装备
     */
    unequipItem(slot) {
        const itemId = Player.equipment[slot];
        if (!itemId) return { success: false, message: '该槽位没有装备' };

        this.addItem(itemId, 1);
        Player.equipment[slot] = null;

        const item = this.getItem(itemId);
        return { success: true, message: `卸下了 ${item.name}` };
    },

    /**
     * 获取背包所有物品（带详情）
     */
    getAllItems() {
        return this.items.map(item => {
            const data = this.getItem(item.itemId);
            return {
                ...item,
                data: data
            };
        });
    },

    /**
     * 获取背包中可以吸收的星尘魔器
     * @private
     */
    _getAbsorbableArtifacts() {
        return this.items.filter(item => {
            const data = this.getItem(item.itemId);
            // 只有星尘魔器可以吸收，且不是成长型的
            return data && data.type === 'star_dust_artifact' && data.grade !== 'growth';
        });
    },

    /**
     * 获取装备列表
     */
    getEquipment() {
        const result = {};
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const itemId = Player.equipment[slot];
            result[slot] = itemId ? this.getItem(itemId) : null;
        });
        return result;
    },

    /**
     * 出售物品
     */
    sellItem(itemId, count = 1) {
        const item = this.getItem(itemId);
        if (!item) return { success: false, message: '物品不存在' };

        if (!this.hasItem(itemId, count)) {
            return { success: false, message: '物品数量不足' };
        }

        const sellPrice = Math.floor(item.price * 0.5);
        const totalGold = sellPrice * count;

        this.removeItem(itemId, count);
        Player.gainGold(totalGold);

        return {
            success: true,
            message: `卖出了 ${count} 个 ${item.name}，获得 ${totalGold} 金币`,
            gold: totalGold
        };
    },

    /**
     * 获取存档数据
     */
    getSaveData() {
        return [...this.items];
    },

    /**
     * 加载存档数据
     */
    loadSaveData(data) {
        this.items = data || [];
    }
};
