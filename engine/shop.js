/**
 * 商店系统
 * 管理商品购买、出售
 */

const ShopSystem = {
    // 当前商店数据
    currentShop: null,

    /**
     * 打开商店
     */
    openShop(shopId) {
        const shop = DataManager.getShop(shopId);
        if (!shop) return { success: false, message: '商店不存在' };
        
        this.currentShop = shop;
        return {
            success: true,
            shop: shop
        };
    },

    /**
     * 获取当前商店的折扣率
     */
    getDiscount() {
        if (!this.currentShop || !this.currentShop.factionId) {
            return 1.0;
        }

        const factionId = this.currentShop.factionId;
        const repLevel = WorldState.getReputationLevel(factionId);
        const faction = DataManager.getFaction(factionId);

        if (!faction || !faction.reputationEffects) {
            return 1.0;
        }

        const effects = faction.reputationEffects[repLevel.level];
        if (effects && effects.shopDiscount) {
            return effects.shopDiscount;
        }

        return 1.0;
    },

    /**
     * 获取物品的实际价格（含折扣）
     */
    getItemPrice(shopItem) {
        const discount = this.getDiscount();
        return Math.floor(shopItem.price * discount);
    },

    /**
     * 购买物品
     */
    buyItem(itemId, count = 1) {
        if (!this.currentShop) {
            return { success: false, message: '没有打开商店' };
        }

        const shopItem = this.currentShop.items.find(i => i.itemId === itemId);
        if (!shopItem) {
            return { success: false, message: '商店没有这个商品' };
        }

        // 检查库存
        if (shopItem.stock !== undefined && shopItem.stock !== -1) {
            if (shopItem.stock < count) {
                return { success: false, message: '库存不足' };
            }
        }

        const item = Inventory.getItem(itemId);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }

        const unitPrice = this.getItemPrice(shopItem);
        const totalPrice = unitPrice * count;

        // 检查金币
        if (!Player.spendGold(totalPrice)) {
            return { success: false, message: '金币不足' };
        }

        // 减少库存
        if (shopItem.stock !== undefined && shopItem.stock !== -1) {
            shopItem.stock -= count;
        }

        // 添加物品
        Inventory.addItem(itemId, count);

        return {
            success: true,
            message: `购买了 ${count} 个 ${item.name}，花费 ${totalPrice} 金币`,
            totalPrice: totalPrice,
            item: item,
            count: count
        };
    },

    /**
     * 出售物品
     */
    sellItem(itemId, count = 1) {
        const item = Inventory.getItem(itemId);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }

        if (item.type === 'quest') {
            return { success: false, message: '任务物品不能出售' };
        }

        const result = Inventory.sellItem(itemId, count);
        return result;
    },

    /**
     * 获取商品列表（带详情）
     */
    getShopItems() {
        if (!this.currentShop) return [];

        const discount = this.getDiscount();

        return this.currentShop.items.map(shopItem => {
            const item = Inventory.getItem(shopItem.itemId);
            const actualPrice = Math.floor(shopItem.price * discount);
            return {
                ...shopItem,
                originalPrice: shopItem.price,
                actualPrice: actualPrice,
                price: actualPrice,
                hasDiscount: discount < 1.0,
                discountPercent: Math.round((1 - discount) * 100),
                itemData: item,
                canAfford: Player.gold >= actualPrice
            };
        });
    },

    /**
     * 关闭商店
     */
    closeShop() {
        this.currentShop = null;
    }
};
