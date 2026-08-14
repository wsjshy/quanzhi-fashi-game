/**
 * 天赋系统
 * 天赋分两类：
 * - innate（先天型）：1级即满级，效果强但不可成长
 * - growth（成长型）：1级弱，可升级到10级，最终强度与先天型持平
 * 觉醒时随机出3个候选天赋，玩家选择1个
 */

const TALENT_TYPE_INNATE = 'innate';
const TALENT_TYPE_GROWTH = 'growth';

const TalentSystem = {
    /**
     * 获取觉醒时的天赋候选（3个）
     * @param {string} element - 元素系ID
     * @returns {Array} 候选天赋ID列表
     */
    getTalentChoices(element) {
        const elementTalents = this.getElementTalents(element);
        if (elementTalents.length === 0) return [];

        // 按稀有度权重随机抽取3个不重复的
        const choices = [];
        const pool = [...elementTalents];

        for (let i = 0; i < 3 && pool.length > 0; i++) {
            let totalWeight = 0;
            pool.forEach(t => {
                const rc = TALENT_RARITY_CONFIG[t.rarity];
                totalWeight += rc ? rc.weight : 10;
            });

            let random = Math.random() * totalWeight;
            let selectedIndex = 0;
            for (let j = 0; j < pool.length; j++) {
                const rc = TALENT_RARITY_CONFIG[pool[j].rarity];
                const weight = rc ? rc.weight : 10;
                random -= weight;
                if (random <= 0) {
                    selectedIndex = j;
                    break;
                }
            }

            choices.push(pool[selectedIndex].id);
            pool.splice(selectedIndex, 1);
        }

        return choices;
    },

    /**
     * 玩家选择天赋
     * @param {string} talentId - 选择的天赋ID
     * @returns {object} 天赋数据 { talentId, level, exp }
     */
    selectTalent(talentId) {
        const talent = this.getTalent(talentId);
        if (!talent) return null;

        const isInnate = talent.type === TALENT_TYPE_INNATE;
        return {
            talentId: talentId,
            level: isInnate ? (talent.maxLevel || 1) : 1,
            exp: 0
        };
    },

    /**
     * 初始化玩家天赋（兼容旧存档，随机一个）
     * @param {string} element - 元素系ID
     * @returns {object} 天赋数据
     */
    initTalentForElement(element) {
        const choices = this.getTalentChoices(element);
        if (choices.length === 0) return null;
        // 旧存档兼容：随机选第一个
        return this.selectTalent(choices[0]);
    },

    /**
     * 随机获取一个该系的天赋（按稀有度权重）
     */
    getRandomTalent(element) {
        const choices = this.getTalentChoices(element);
        return choices[0] || null;
    },

    /**
     * 获取某元素系的所有天赋
     */
    getElementTalents(element) {
        const result = [];
        for (const id in DataTalents) {
            const talent = DataTalents[id];
            if (talent.element === element || talent.element === 'all') {
                result.push(talent);
            }
        }
        return result;
    },

    /**
     * 获取天赋数据
     */
    getTalent(talentId) {
        return DataTalents[talentId] || null;
    },

    /**
     * 获取天赋的当前效果（考虑等级加成和类型）
     */
    getTalentEffects(talentId, level = 1) {
        const talent = this.getTalent(talentId);
        if (!talent) return {};

        const effects = {};
        const isInnate = talent.type === TALENT_TYPE_INNATE;
        const maxLevel = talent.maxLevel || (isInnate ? 1 : 10);
        const actualLevel = Math.min(level, maxLevel);

        if (isInnate) {
            // 先天型：直接使用基础效果（1级即满级）
            for (const key in talent.effects) {
                effects[key] = talent.effects[key];
            }
        } else {
            // 成长型：基础效果 + 每级加成
            for (const key in talent.effects) {
                if (typeof talent.effects[key] === 'number') {
                    const base = talent.effects[key];
                    const perLevel = talent.levelBonus ? (talent.levelBonus[key] || 0) : 0;
                    effects[key] = base + perLevel * (actualLevel - 1);
                } else {
                    effects[key] = talent.effects[key];
                }
            }
        }

        return effects;
    },

    /**
     * 获取所有系天赋的聚合效果
     * @param {object} playerTalents - 玩家天赋数据
     * @returns {object} 聚合效果
     */
    getAllTalentEffects(playerTalents) {
        const total = {};
        if (!playerTalents) return total;

        for (const element in playerTalents) {
            const td = playerTalents[element];
            if (!td) continue;
            const effects = this.getTalentEffects(td.talentId, td.level);
            for (const key in effects) {
                if (typeof effects[key] === 'number') {
                    total[key] = (total[key] || 0) + effects[key];
                }
            }
        }
        return total;
    },

    /**
     * 获取稀有度配置
     */
    getRarityConfig(rarity) {
        return TALENT_RARITY_CONFIG[rarity] || TALENT_RARITY_CONFIG.common;
    },

    getRarityName(rarity) {
        const config = this.getRarityConfig(rarity);
        return config.name || '普通';
    },

    getRarityColor(rarity) {
        const config = this.getRarityConfig(rarity);
        return config.color || '#ffffff';
    },

    /**
     * 计算天赋升级所需经验
     */
    getExpToNextLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    /**
     * 增加天赋经验（先天型不可升级）
     */
    addTalentExp(talentData, amount) {
        if (!talentData) return { leveledUp: false };

        const talent = this.getTalent(talentData.talentId);
        if (!talent) return { leveledUp: false };

        // 先天型不可升级
        if (talent.type === TALENT_TYPE_INNATE) {
            return { leveledUp: false, newLevel: talentData.level, newExp: 0 };
        }

        const maxLevel = talent.maxLevel || 10;
        let level = talentData.level;
        let exp = talentData.exp + amount;
        let leveledUp = false;

        while (level < maxLevel) {
            const expNeeded = this.getExpToNextLevel(level);
            if (exp >= expNeeded) {
                exp -= expNeeded;
                level++;
                leveledUp = true;
            } else {
                break;
            }
        }

        if (level >= maxLevel) {
            exp = 0;
        }

        return {
            leveledUp: leveledUp,
            newLevel: level,
            newExp: exp
        };
    },

    /**
     * 获取玩家某元素系的天赋效果
     */
    getPlayerElementTalentEffects(playerTalents, element) {
        const talentData = playerTalents[element];
        if (!talentData) return {};
        return this.getTalentEffects(talentData.talentId, talentData.level);
    },

    /**
     * 获取天赋描述（带等级和类型）
     */
    getTalentDescription(talentId, level = 1) {
        const talent = this.getTalent(talentId);
        if (!talent) return '';

        const effects = this.getTalentEffects(talentId, level);
        const typeName = talent.type === TALENT_TYPE_INNATE ? '【先天】' : '【成长】';
        let desc = `${typeName} ${talent.name}\n${talent.description}\n`;

        const effectNames = {
            damageBonus: '伤害加成', healBonus: '治疗加成', defenseBonus: '防御加成',
            speedBonus: '速度加成', hpBonus: '生命加成', mpBonus: '魔法加成',
            critRate: '暴击率', critDamage: '暴击伤害', mpCostReduction: '耗蓝减少',
            dodgeBonus: '闪避率', hpRegen: '每回合HP回复', mpRegen: '每回合MP回复',
            burnChance: '灼烧概率', freezeChance: '冰冻概率', paralyzeChance: '麻痹概率',
            explosionChance: '爆炸概率', lifesteal: '吸血', shieldBonus: '护盾加成'
        };

        for (const key in effects) {
            if (effectNames[key] && typeof effects[key] === 'number') {
                const val = effects[key];
                const pct = (val * 100).toFixed(0);
                desc += `\n• ${effectNames[key]}: +${pct}%`;
            }
        }

        if (talent.type === TALENT_TYPE_INNATE) {
            desc += '\n\n（先天天赋，不可升级）';
        } else {
            const maxLevel = talent.maxLevel || 10;
            desc += `\n\n（成长天赋，当前Lv.${level}/${maxLevel}）`;
        }

        return desc;
    }
};
