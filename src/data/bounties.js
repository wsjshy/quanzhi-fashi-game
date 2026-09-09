/**
 * v3.12.0: 猎魔悬赏任务配置
 * 基于原著妖魔的悬赏任务，完善"猎魔→材料→锻造"游戏循环
 */

// 悬赏任务模板库
export const BOUNTY_TEMPLATES = [
    // ===== 奴仆级悬赏 =====
    {
        id: "bounty_stray_wolf",
        name: "清剿独狼兽",
        targetEnemy: "stray_wolf",
        targetCount: 5,
        level: "servant",
        levelName: "奴仆级",
        reward: { gold: 15000, exp: 300, reputation: 5, items: [{ itemId: "demon_core", count: 2 }] },
        description: "近期独狼兽在博城郊外频繁出没，已造成多起牲畜伤亡。猎者联盟悬赏清剿。"
    },
    {
        id: "bounty_shadow_rat",
        name: "消灭暗影鼠",
        targetEnemy: "shadow_rat",
        targetCount: 8,
        level: "servant",
        levelName: "奴仆级",
        reward: { gold: 12000, exp: 250, reputation: 5, items: [{ itemId: "herb", count: 5 }] },
        description: "暗影鼠在老城区下水道大量繁殖，传播疾病。猎者联盟悬赏消灭。"
    },
    {
        id: "bounty_mountain_ape",
        name: "驱逐山猿",
        targetEnemy: "mountain_ape",
        targetCount: 3,
        level: "servant",
        levelName: "奴仆级",
        reward: { gold: 20000, exp: 400, reputation: 8, items: [{ itemId: "demon_core", count: 3 }] },
        description: "雪峰山脚下的山猿开始袭击路人，需要驱逐。"
    },
    {
        id: "bounty_one_eye_wolf",
        name: "猎杀独眼魔狼",
        targetEnemy: "one_eye_wolf",
        targetCount: 3,
        level: "servant",
        levelName: "奴仆级",
        reward: { gold: 25000, exp: 500, reputation: 10, items: [{ itemId: "demon_core", count: 2 }, { itemId: "wolf_fang", count: 2 }] },
        description: "独眼魔狼是博城周边最危险的奴仆级妖魔，已造成3起猎人伤亡。"
    },
    {
        id: "bounty_giant_eye_rat",
        name: "清剿巨眼猩鼠",
        targetEnemy: "giant_eye_rat",
        targetCount: 6,
        level: "servant",
        levelName: "奴仆级",
        reward: { gold: 18000, exp: 350, reputation: 6, items: [{ itemId: "demon_core", count: 2 }] },
        description: "巨眼猩鼠在金林荒城外围聚集，威胁过往商队。"
    },

    // ===== 战将级悬赏 =====
    {
        id: "bounty_demon_wolf",
        name: "猎杀魔狼",
        targetEnemy: "demon_wolf",
        targetCount: 2,
        level: "warrior",
        levelName: "战将级",
        reward: { gold: 80000, exp: 1200, reputation: 20, items: [{ itemId: "demon_core", count: 5 }, { itemId: "servant_soul_essence", count: 1 }] },
        description: "一只成年魔狼在金林荒城深处建立了领地，已有猎者小队失联。"
    },
    {
        id: "bounty_bone_spike",
        name: "讨伐骨刺狰",
        targetEnemy: "bone_spike_zheng",
        targetCount: 1,
        level: "warrior",
        levelName: "战将级",
        reward: { gold: 100000, exp: 1500, reputation: 25, items: [{ itemId: "bone_shard", count: 3 }, { itemId: "servant_soul_essence", count: 2 }] },
        description: "骨刺狰出现在雪峰山深处，其骨刺是珍贵的锻造材料。"
    },
    {
        id: "bounty_rock_monster",
        name: "击破石猴",
        targetEnemy: "rock_monster",
        targetCount: 2,
        level: "warrior",
        levelName: "战将级",
        reward: { gold: 70000, exp: 1000, reputation: 18, items: [{ itemId: "stone_core", count: 2 }] },
        description: "石猴在古矿区破坏设施，矿场主悬赏讨伐。"
    },
    {
        id: "bounty_three_eye_wolf",
        name: "猎杀三眼神狼",
        targetEnemy: "three_eye_demon_wolf",
        targetCount: 1,
        level: "warrior",
        levelName: "战将级",
        reward: { gold: 120000, exp: 1800, reputation: 30, items: [{ itemId: "demon_core", count: 8 }, { itemId: "warrior_soul_essence", count: 1 }] },
        description: "三眼神狼是魔狼中的变异种，第三只眼能释放精神攻击，极其危险。"
    },

    // ===== 统领级悬赏 =====
    {
        id: "bounty_evil_eye_swamp",
        name: "讨伐邪眼沼魔",
        targetEnemy: "evil_eye_swamp_demon",
        targetCount: 1,
        level: "commander",
        levelName: "统领级",
        reward: { gold: 300000, exp: 5000, reputation: 80, items: [{ itemId: "demon_core", count: 15 }, { itemId: "warrior_soul_essence", count: 3 }, { itemId: "commander_soul_essence", count: 1 }] },
        description: "邪眼沼魔在沼泽地带建立了巢穴，控制了大片区域。只有高阶猎者才能挑战。"
    },
    {
        id: "bounty_running_demon",
        name: "追杀奔走 demon",
        targetEnemy: "running_demon",
        targetCount: 1,
        level: "commander",
        levelName: "统领级",
        reward: { gold: 250000, exp: 4000, reputation: 70, items: [{ itemId: "demon_core", count: 12 }, { itemId: "warrior_soul_essence", count: 2 }] },
        description: "奔走 demon 速度极快，已多次逃脱追捕。猎者联盟提高了悬赏金额。"
    }
];

/**
 * 根据玩家等级生成可用悬赏
 */
export function generateBounties(playerLevel) {
    const available = [];

    for (const template of BOUNTY_TEMPLATES) {
        // 奴仆级悬赏：1级以上可见
        if (template.level === 'servant' && playerLevel >= 1) {
            available.push(template);
        }
        // 战将级悬赏：5级以上可见
        else if (template.level === 'warrior' && playerLevel >= 5) {
            available.push(template);
        }
        // 统领级悬赏：10级以上可见
        else if (template.level === 'commander' && playerLevel >= 10) {
            available.push(template);
        }
    }

    // 随机选择3-5个
    const shuffled = available.sort(() => Math.random() - 0.5);
    const count = Math.min(shuffled.length, 3 + Math.floor(Math.random() * 3));
    return shuffled.slice(0, count);
}

/**
 * 获取悬赏模板
 */
export function getBountyTemplate(bountyId) {
    return BOUNTY_TEMPLATES.find(b => b.id === bountyId);
}

// 向后兼容
if (typeof window !== 'undefined') {
    window.BOUNTY_TEMPLATES = BOUNTY_TEMPLATES;
    window.generateBounties = generateBounties;
    window.getBountyTemplate = getBountyTemplate;
}
