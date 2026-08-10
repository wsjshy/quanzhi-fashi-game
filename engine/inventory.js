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
