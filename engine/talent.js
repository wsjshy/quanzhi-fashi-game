/**
 * 天赋系统
 * 天生天赋、灵种、魂种等
 */

const TalentSystem = {
    /**
     * 初始化玩家天赋（觉醒时调用）
     * @param {string} element - 元素系ID
     * @returns {object} 天赋数据 { talentId, level, exp }
     */
    initTalentForElement(element) {
        const talentId = this.getRandomTalent(element);
        return {
            talentId: talentId,
            level: 1,
            exp: 0
        };
    },

    /**
     * 随机获取一个该系的天赋（按稀有度权重）
     * @param {string} element - 元素系ID
     * @returns {string} 天赋ID
     */
    getRandomTalent(element) {
        const elementTalents = this.getElementTalents(element);
        if (elementTalents.length === 0) return null;

        // 计算总权重
        let totalWeight = 0;
        elementTalents.forEach(talent => {
            const rarityConfig = TALENT_RARITY_CONFIG[talent.rarity];
            totalWeight += rarityConfig ? rarityConfig.weight : 10;
        });

        // 随机抽取
        let random = Math.random() * totalWeight;
        for (const talent of elementTalents) {
            const rarityConfig = TALENT_RARITY_CONFIG[talent.rarity];
            const weight = rarityConfig ? rarityConfig.weight : 10;
            random -= weight;
            if (random <= 0) {
                return talent.id;
            }
        }

        // 兜底返回第一个
        return elementTalents[0].id;
    },

    /**
     * 获取某元素系的所有天赋
     * @param {string} element - 元素系ID
     * @returns {Array} 天赋列表
     */
    getElementTalents(element) {
        const result = [];
        for (const id in DataTalents) {
            const talent = DataTalents[id];
            if (talent.element === element) {
                result.push(talent);
            }
        }
        return result;
    },

    /**
     * 获取天赋数据
     * @param {string} talentId - 天赋ID
     * @returns {object} 天赋数据
     */
    getTalent(talentId) {
        return DataTalents[talentId] || null;
    },

    /**
     * 获取天赋的当前效果（考虑等级加成）
     * @param {string} talentId - 天赋ID
     * @param {number} level - 天赋等级
     * @returns {object} 效果对象
     */
    getTalentEffects(talentId, level = 1) {
        const talent = this.getTalent(talentId);
        if (!talent) return {};

        const effects = { ...talent.effects };
        const levelBonus = talent.levelBonus || 0;
        const actualLevel = Math.min(level, talent.maxLevel || 10);

        // 对数值型效果应用等级加成
        for (const key in effects) {
            if (typeof effects[key] === 'number') {
                effects[key] = effects[key] + levelBonus * (actualLevel - 1);
            }
        }

        return effects;
    },

    /**
     * 获取稀有度配置
     * @param {string} rarity - 稀有度
     * @returns {object} 稀有度配置
     */
    getRarityConfig(rarity) {
        return TALENT_RARITY_CONFIG[rarity] || TALENT_RARITY_CONFIG.common;
    },

    /**
     * 获取稀有度名称
     * @param {string} rarity - 稀有度
     * @returns {string} 稀有度名称
     */
    getRarityName(rarity) {
        const config = this.getRarityConfig(rarity);
        return config.name || '普通';
    },

    /**
     * 获取稀有度颜色
     * @param {string} rarity - 稀有度
     * @returns {string} 颜色值
     */
    getRarityColor(rarity) {
        const config = this.getRarityConfig(rarity);
        return config.color || '#ffffff';
    },

    /**
     * 计算天赋升级所需经验
     * @param {number} level - 当前等级
     * @returns {number} 所需经验
     */
    getExpToNextLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    /**
     * 增加天赋经验
     * @param {object} talentData - 天赋数据 { talentId, level, exp }
     * @param {number} amount - 经验值
     * @returns {object} { leveledUp, newLevel, newExp }
     */
    addTalentExp(talentData, amount) {
        if (!talentData) return { leveledUp: false };

        const talent = this.getTalent(talentData.talentId);
        if (!talent) return { leveledUp: false };

        let level = talentData.level;
        let exp = talentData.exp + amount;
        let leveledUp = false;

        // 检查是否升级
        while (level < (talent.maxLevel || 10)) {
            const expNeeded = this.getExpToNextLevel(level);
            if (exp >= expNeeded) {
                exp -= expNeeded;
                level++;
                leveledUp = true;
            } else {
                break;
            }
        }

        // 满级后经验不再增加
        if (level >= (talent.maxLevel || 10)) {
            exp = 0;
        }

        return {
            leveledUp: leveledUp,
            newLevel: level,
            newExp: exp
        };
    },

    /**
     * 获取玩家某元素系的天赋效果总和
     * @param {object} playerTalents - 玩家天赋数据
     * @param {string} element - 元素系ID
     * @returns {object} 总效果
     */
    getPlayerElementTalentEffects(playerTalents, element) {
        const talentData = playerTalents[element];
        if (!talentData) return {};

        return this.getTalentEffects(talentData.talentId, talentData.level);
    },

    /**
     * 获取天赋描述（带等级）
     * @param {string} talentId - 天赋ID
     * @param {number} level - 天赋等级
     * @returns {string} 描述
     */
    getTalentDescription(talentId, level = 1) {
        const talent = this.getTalent(talentId);
        if (!talent) return '';

        const effects = this.getTalentEffects(talentId, level);
        let desc = talent.description + '\n';

        // 添加具体数值
        if (effects.damageBonus) {
            desc += `\n• 伤害加成: +${Math.round(effects.damageBonus * 100)}%`;
        }
        if (effects.healBonus) {
            desc += `\n• 治疗加成: +${Math.round(effects.healBonus * 100)}%`;
        }
        if (effects.defenseBonus) {
            desc += `\n• 防御加成: +${Math.round(effects.defenseBonus * 100)}%`;
        }
        if (effects.speedBonus) {
            desc += `\n• 速度加成: +${Math.round(effects.speedBonus * 100)}%`;
        }
        if (effects.hpBonus) {
            desc += `\n• 生命加成: +${Math.round(effects.hpBonus * 100)}%`;
        }
        if (effects.critRate) {
            desc += `\n• 暴击率: +${Math.round(effects.critRate * 100)}%`;
        }
        if (effects.critDamage) {
            desc += `\n• 暴击伤害: +${Math.round(effects.critDamage * 100)}%`;
        }
        if (effects.mpCostReduction) {
            desc += `\n• MP消耗: -${Math.round(effects.mpCostReduction * 100)}%`;
        }
        if (effects.dodgeBonus) {
            desc += `\n• 闪避率: +${Math.round(effects.dodgeBonus * 100)}%`;
        }
        if (effects.hpRegen) {
            desc += `\n• 每回合恢复: ${Math.round(effects.hpRegen * 100)}% HP`;
        }
        if (effects.burnChance) {
            desc += `\n• 燃烧概率: ${Math.round(effects.burnChance * 100)}%`;
        }
        if (effects.freezeChance) {
            desc += `\n• 冻结概率: ${Math.round(effects.freezeChance * 100)}%`;
        }
        if (effects.paralyzeChance) {
            desc += `\n• 麻痹概率: ${Math.round(effects.paralyzeChance * 100)}%`;
        }

        return desc;
    }
};
