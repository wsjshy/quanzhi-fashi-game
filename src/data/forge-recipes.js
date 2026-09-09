/**
 * v3.9.0: 锻造配方配置
 * 用妖魔材料+金币锻造装备，锻造时随机生成品质和词缀
 * 符合原著中"魔石能源体系"和"精魄炼制魔器"的设定
 */

export const FORGE_RECIPES = [
    // ===== 基础装备（低等级） =====
    {
        id: "forge_leather_armor",
        outputItem: "leather_armor",
        outputName: "皮甲",
        materials: [
            { itemId: "demon_core", count: 2 },
            { itemId: "herb", count: 3 }
        ],
        goldCost: 200,
        requireLevel: 1,
        category: "基础"
    },
    {
        id: "forge_speed_boots",
        outputItem: "speed_boots",
        outputName: "疾风靴",
        materials: [
            { itemId: "wind_stone", count: 2 },
            { itemId: "demon_core", count: 1 }
        ],
        goldCost: 300,
        requireLevel: 3,
        category: "基础"
    },
    {
        id: "forge_hunter_knife",
        outputItem: "hunter_knife",
        outputName: "猎魔匕首",
        materials: [
            { itemId: "wolf_fang", count: 2 },
            { itemId: "demon_core", count: 1 }
        ],
        goldCost: 500,
        requireLevel: 5,
        category: "基础"
    },

    // ===== 中级装备（中等级） =====
    {
        id: "forge_bone_shield",
        outputItem: "bone_shield",
        outputName: "镰骨盾",
        materials: [
            { itemId: "bone_spike", count: 2 },
            { itemId: "demon_core", count: 2 }
        ],
        goldCost: 1000,
        requireLevel: 8,
        category: "中级"
    },
    {
        id: "forge_ice_armor",
        outputItem: "ice_armor",
        outputName: "冰蚕护甲",
        materials: [
            { itemId: "ice_crystal", count: 2 },
            { itemId: "magic_crystal", count: 1 }
        ],
        goldCost: 2000,
        requireLevel: 10,
        category: "中级"
    },
    {
        id: "forge_demon_slayer_blade",
        outputItem: "demon_slayer_blade",
        outputName: "斩魔刀",
        materials: [
            { itemId: "elite_core", count: 1 },
            { itemId: "wolf_fang", count: 3 }
        ],
        goldCost: 3000,
        requireLevel: 12,
        category: "中级"
    },

    // ===== 高级装备（高等级） =====
    {
        id: "forge_rock_armor",
        outputItem: "rock_armor",
        outputName: "岩铠",
        materials: [
            { itemId: "bone_spike", count: 3 },
            { itemId: "elite_core", count: 1 },
            { itemId: "demon_core", count: 5 }
        ],
        goldCost: 4000,
        requireLevel: 14,
        category: "高级"
    },
    {
        id: "forge_flame_blade",
        outputItem: "flame_blade",
        outputName: "烈焰斩魔具",
        materials: [
            { itemId: "fire_stone", count: 3 },
            { itemId: "elite_core", count: 1 },
            { itemId: "magic_crystal", count: 1 }
        ],
        goldCost: 5000,
        requireLevel: 15,
        category: "高级"
    },
    {
        id: "forge_thunder_blade",
        outputItem: "thunder_blade",
        outputName: "雷霆斩魔具",
        materials: [
            { itemId: "thunder_feather", count: 3 },
            { itemId: "elite_core", count: 1 },
            { itemId: "magic_crystal", count: 1 }
        ],
        goldCost: 5000,
        requireLevel: 15,
        category: "高级"
    }
];

/**
 * 获取所有可用配方（根据玩家等级过滤）
 */
export function getAvailableRecipes(level) {
    return FORGE_RECIPES.filter(r => level >= r.requireLevel);
}

/**
 * 检查配方是否可锻造
 */
export function canForge(recipe, inventory, gold) {
    // 检查等级
    if (Player.level < recipe.requireLevel) {
        return { success: false, reason: `需要等级 ${recipe.requireLevel}` };
    }
    // 检查金币
    if (gold < recipe.goldCost) {
        return { success: false, reason: '金币不足' };
    }
    // 检查材料
    for (const mat of recipe.materials) {
        const count = inventory.getItemCount(mat.itemId);
        if (count < mat.count) {
            return { success: false, reason: `材料不足：${mat.itemId}` };
        }
    }
    return { success: true };
}


// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.FORGE_RECIPES = FORGE_RECIPES;
    window.getAvailableRecipes = getAvailableRecipes;
    window.canForge = canForge;
}
