/**
 * v3.10.0: 锻造系统深化
 * 精魄注入提升品质概率 + 装备重铸重新随机词缀
 */

import { FORGE_RECIPES, getAvailableRecipes } from '../data/forge-recipes.js';
import { rollQuality, generateAffixes, AFFIX_QUALITIES } from '../data/affixes.js';

export const ForgeSystem = {
    // 当前选择的精魄注入类型（null/servant/warrior/commander）
    selectedSoulInject: null,

    /**
     * 精魄注入配置
     */
    SOUL_INJECT_CONFIG: {
        servant: {
            name: '奴仆级精魄',
            itemId: 'servant_soul_essence',
            effect: '优秀概率+15%，普通概率-15%',
            modifiers: { normal: -0.15, fine: 0.15, rare: 0, epic: 0 }
        },
        warrior: {
            name: '战将级精魄',
            itemId: 'warrior_soul_essence',
            effect: '稀有概率+10%，普通概率-10%',
            modifiers: { normal: -0.10, fine: 0, rare: 0.10, epic: 0 }
        },
        commander: {
            name: '统领级精魄',
            itemId: 'commander_soul_essence',
            effect: '史诗概率+5%，稀有概率+5%，普通概率-10%',
            modifiers: { normal: -0.10, fine: 0, rare: 0.05, epic: 0.05 }
        }
    },

    /**
     * 获取所有可用配方
     */
    getRecipes() {
        return getAvailableRecipes(Player.level);
    },

    /**
     * 检查是否可以锻造
     */
    canForge(recipeId) {
        const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return { success: false, reason: '配方不存在' };

        if (Player.level < recipe.requireLevel) {
            return { success: false, reason: `需要等级 ${recipe.requireLevel}` };
        }

        if (Player.gold < recipe.goldCost) {
            return { success: false, reason: `金币不足（需要${recipe.goldCost}）` };
        }

        for (const mat of recipe.materials) {
            const count = Inventory.getItemCount(mat.itemId);
            if (count < mat.count) {
                const item = Inventory.getItem(mat.itemId);
                return { success: false, reason: `材料不足：${item?.name || mat.itemId}（需要${mat.count}，当前${count}）` };
            }
        }

        // 检查精魄注入
        if (this.selectedSoulInject) {
            const config = this.SOUL_INJECT_CONFIG[this.selectedSoulInject];
            if (Inventory.getItemCount(config.itemId) < 1) {
                return { success: false, reason: `精魄不足：需要${config.name}` };
            }
        }

        return { success: true };
    },

    /**
     * 计算注入精魄后的品质概率
     */
    getInjectedQualityRates(soulType) {
        const baseRates = { normal: 0.50, fine: 0.30, rare: 0.15, epic: 0.05 };

        if (!soulType || !this.SOUL_INJECT_CONFIG[soulType]) {
            return baseRates;
        }

        const modifiers = this.SOUL_INJECT_CONFIG[soulType].modifiers;
        const rates = {};
        for (const quality in baseRates) {
            rates[quality] = Math.max(0, baseRates[quality] + (modifiers[quality] || 0));
        }

        // 归一化
        const total = Object.values(rates).reduce((a, b) => a + b, 0);
        for (const quality in rates) {
            rates[quality] = rates[quality] / total;
        }

        return rates;
    },

    /**
     * 根据概率随机选择品质
     */
    rollQualityWithRates(rates) {
        const rand = Math.random();
        let cumulative = 0;
        for (const quality of ['normal', 'fine', 'rare', 'epic']) {
            cumulative += rates[quality];
            if (rand < cumulative) return quality;
        }
        return 'normal';
    },

    /**
     * 执行锻造（支持精魄注入）
     */
    forge(recipeId) {
        const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return { success: false, message: '配方不存在' };

        const check = this.canForge(recipeId);
        if (!check.success) return { success: false, message: check.reason };

        // 消耗金币
        Player.gold -= recipe.goldCost;

        // 消耗材料
        for (const mat of recipe.materials) {
            Inventory.removeItem(mat.itemId, mat.count);
        }

        // 消耗精魄（如果选择了注入）
        let soulUsed = null;
        if (this.selectedSoulInject) {
            const config = this.SOUL_INJECT_CONFIG[this.selectedSoulInject];
            Inventory.removeItem(config.itemId, 1);
            soulUsed = this.selectedSoulInject;
        }

        // 根据精魄注入计算品质概率并随机
        const rates = this.getInjectedQualityRates(this.selectedSoulInject);
        const quality = this.rollQualityWithRates(rates);
        const affixes = generateAffixes(quality);

        // 添加装备到背包
        Inventory.addItem(recipe.outputItem, 1, { quality, affixes });

        const item = Inventory.getItem(recipe.outputItem);
        const qualityNames = { normal: '普通', fine: '优秀', rare: '稀有', epic: '史诗' };
        const qualityColors = { normal: '#aaaaaa', fine: '#66ff66', rare: '#6699ff', epic: '#cc66ff' };

        return {
            success: true,
            message: `锻造成功！获得 ${qualityNames[quality]} ${item.name}${soulUsed ? '（精魄注入）' : ''}`,
            itemId: recipe.outputItem,
            itemName: item.name,
            quality: quality,
            qualityName: qualityNames[quality],
            qualityColor: qualityColors[quality],
            affixes: affixes,
            soulUsed: soulUsed
        };
    },

    /**
     * 选择精魄注入类型
     */
    selectSoulInject(soulType) {
        if (soulType === null || this.SOUL_INJECT_CONFIG[soulType]) {
            this.selectedSoulInject = soulType;
            return true;
        }
        return false;
    },

    /**
     * 获取精魄数量
     */
    getSoulCount(soulType) {
        if (!this.SOUL_INJECT_CONFIG[soulType]) return 0;
        return Inventory.getItemCount(this.SOUL_INJECT_CONFIG[soulType].itemId);
    },

    /**
     * 检查装备是否可以重铸
     */
    canReforge(itemIndex) {
        const item = Inventory.items[itemIndex];
        if (!item) return { success: false, reason: '物品不存在' };

        const itemData = Inventory.getItem(item.itemId);
        if (!itemData || !['weapon', 'armor', 'accessory', 'equipment'].includes(itemData.type)) {
            return { success: false, reason: '只能重铸装备' };
        }

        // 重铸消耗：基础材料x1 + 金币（售价的50%）
        const reforgeCost = Math.floor((itemData.price || 100) * 0.5);
        if (Player.gold < reforgeCost) {
            return { success: false, reason: `金币不足（需要${reforgeCost}）` };
        }

        return { success: true, cost: reforgeCost };
    },

    /**
     * 执行重铸
     */
    reforge(itemIndex) {
        const check = this.canReforge(itemIndex);
        if (!check.success) return { success: false, message: check.reason };

        const item = Inventory.items[itemIndex];
        const itemData = Inventory.getItem(item.itemId);

        // 消耗金币
        Player.gold -= check.cost;

        // 重铸品质：70%保持，25%提升一档，5%提升两档
        const oldQuality = item.quality || 'normal';
        const qualityOrder = ['normal', 'fine', 'rare', 'epic'];
        const oldIndex = qualityOrder.indexOf(oldQuality);

        const rand = Math.random();
        let newQuality;
        if (rand < 0.70) {
            newQuality = oldQuality; // 保持
        } else if (rand < 0.95) {
            newQuality = qualityOrder[Math.min(oldIndex + 1, 3)]; // 提升一档
        } else {
            newQuality = qualityOrder[Math.min(oldIndex + 2, 3)]; // 提升两档
        }

        // 重新生成词缀
        const newAffixes = generateAffixes(newQuality);

        // 更新背包中的装备实例
        item.quality = newQuality;
        item.affixes = newAffixes;

        const qualityNames = { normal: '普通', fine: '优秀', rare: '稀有', epic: '史诗' };
        const qualityColors = { normal: '#aaaaaa', fine: '#66ff66', rare: '#6699ff', epic: '#cc66ff' };

        return {
            success: true,
            message: `重铸成功！${qualityNames[oldQuality]} → ${qualityNames[newQuality]}`,
            itemId: item.itemId,
            itemName: itemData.name,
            oldQuality: oldQuality,
            oldQualityName: qualityNames[oldQuality],
            quality: newQuality,
            qualityName: qualityNames[newQuality],
            qualityColor: qualityColors[newQuality],
            affixes: newAffixes,
            qualityUpgraded: newQuality !== oldQuality
        };
    },

    /**
     * 获取玩家当前材料数量
     */
    getMaterialCount(itemId) {
        return Inventory.getItemCount(itemId);
    }
};


// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.ForgeSystem = ForgeSystem;
