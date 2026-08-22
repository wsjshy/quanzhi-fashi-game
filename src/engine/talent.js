/**
 * 天赋系统 - 进化式升级
 *
 * 天赋分两类：
 * - innate（先天型）：1级即满级，效果强但不可成长，相当于"终极形态"
 * - growth（成长型）：1级弱，可升级到10级，每级有数值成长，关键等级触发"进化"
 *
 * 成长型天赋的10级分为5个进化阶段：
 * - Lv1  觉醒：获得核心能力
 * - Lv3  特性：解锁新被动/新特性
 * - Lv5  进化：形态质变，能力本质改变
 * - Lv7  延伸：相关联的新能力觉醒
 * - Lv10 终极：达到传说级，与先天型比肩
 *
 * 每个进化阶段有独立名称和描述，升级时给玩家"获得新能力"的爽感。
 */

export const TALENT_TYPE_INNATE = 'innate';
export const TALENT_TYPE_GROWTH = 'growth';

// 进化阶段定义
export const EVOLUTION_STAGES = [
    { level: 1,  key: 'awaken',    name: '觉醒', icon: '✦', color: '#aaaaaa' },
    { level: 3,  key: 'trait',     name: '特性', icon: '✧', color: '#55aaff' },
    { level: 5,  key: 'evolve',    name: '进化', icon: '◆', color: '#aa55ff' },
    { level: 7,  key: 'extend',    name: '延伸', icon: '✺', color: '#ff9933' },
    { level: 10, key: 'ultimate',  name: '终极', icon: '★', color: '#ffdd33' }
];

export const TalentSystem = {

    /**
     * 获取觉醒时的天赋候选（显示该系别所有天赋，让玩家有更多选择）
     * v3.1.0优化：从随机3个改为显示所有5个天赋，避免玩家感觉选择太少
     */
    getTalentChoices(element) {
        const elementTalents = this.getElementTalents(element);
        if (elementTalents.length === 0) return [];

        // 按稀有度排序：common → uncommon → rare → epic → legendary
        const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
        const sorted = [...elementTalents].sort((a, b) => {
            return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
        });

        return sorted.map(t => t.id);
    },

    /**
     * 玩家选择天赋
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

    initTalentForElement(element) {
        const choices = this.getTalentChoices(element);
        if (choices.length === 0) return null;
        return this.selectTalent(choices[0]);
    },

    getRandomTalent(element) {
        const choices = this.getTalentChoices(element);
        return choices[0] || null;
    },

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

    getTalent(talentId) {
        return DataTalents[talentId] || null;
    },

    /**
     * 获取天赋的进化阶段列表
     * @returns {Array} 进化阶段数组，每个包含 level/stage/name/description/effects
     */
    getEvolutionStages(talentId) {
        const talent = this.getTalent(talentId);
        if (!talent || !talent.evolutions) return [];
        return talent.evolutions;
    },

    /**
     * 获取当前已达到的进化阶段
     */
    getCurrentStage(talentId, level) {
        const stages = this.getEvolutionStages(talentId);
        let current = stages[0] || null;
        for (const stage of stages) {
            if (level >= stage.level) {
                current = stage;
            }
        }
        return current;
    },

    /**
     * 获取下一个未达到的进化阶段
     */
    getNextStage(talentId, level) {
        const stages = this.getEvolutionStages(talentId);
        for (const stage of stages) {
            if (level < stage.level) {
                return stage;
            }
        }
        return null;
    },

    /**
     * 检查本次升级是否触发了进化
     */
    checkEvolution(talentId, oldLevel, newLevel) {
        const stages = this.getEvolutionStages(talentId);
        const evolved = [];
        for (const stage of stages) {
            if (oldLevel < stage.level && newLevel >= stage.level) {
                evolved.push(stage);
            }
        }
        return evolved;
    },

    /**
     * 检查天赋是否需要选择分支（Lv5且有branchChoices但未选择）
     * @param {object} talentData - 玩家天赋数据 {talentId, level, branch}
     * @returns {object|null} 需要选择时返回{talent, branchChoices}，否则null
     */
    needsBranchChoice(talentData) {
        if (!talentData || talentData.branch) return null;
        const talent = this.getTalent(talentData.talentId);
        if (!talent || !talent.evolutions) return null;
        const stage = talent.evolutions.find(e => e.level === 5 && e.branchChoices);
        if (!stage) return null;
        if (talentData.level >= 5) {
            return { talent, branchChoices: stage.branchChoices };
        }
        return null;
    },

    /**
     * 获取天赋在指定等级的全部效果（合并所有已解锁进化阶段的效果 + 等级间插值）
     *
     * 效果合并规则：
     * 1. 收集所有 level <= 当前等级 的进化阶段的 effects
     * 2. 数值类效果相加
     * 3. 布尔/特殊效果取最新阶段的值（覆盖）
     */
    /**
     * 获取天赋效果
     * v1.4.0: 支持分支进化（branchChoices/branchEffects）
     * @param {string} talentId - 天赋ID
     * @param {number} level - 天赋等级
     * @param {string} branch - 选择的分支ID（可选，Lv5后生效）
     */
    getTalentEffects(talentId, level = 1, branch = null) {
        const talent = this.getTalent(talentId);
        if (!talent) return {};

        const effects = {};
        const isInnate = talent.type === TALENT_TYPE_INNATE;
        const maxLevel = talent.maxLevel || (isInnate ? 1 : 10);
        const actualLevel = Math.min(level, maxLevel);

        if (isInnate) {
            // 先天型：如果有evolutions，直接从终极阶段取效果（不合并旧effects避免重复）
            if (talent.evolutions && talent.evolutions.length > 0) {
                const ultimate = talent.evolutions[talent.evolutions.length - 1];
                if (ultimate.effects) {
                    for (const key in ultimate.effects) {
                        effects[key] = ultimate.effects[key];
                    }
                }
            } else if (talent.effects) {
                // 兼容旧格式
                for (const key in talent.effects) {
                    effects[key] = talent.effects[key];
                }
            }
            return effects;
        }

        // 成长型：合并所有已达到等级的进化阶段效果
        if (talent.evolutions && talent.evolutions.length > 0) {
            for (const stage of talent.evolutions) {
                if (actualLevel >= stage.level) {
                    // v1.4.0: 分支进化处理
                    if (stage.branchEffects && branch) {
                        // 有分支效果且玩家选择了分支
                        const branchEffect = stage.branchEffects[branch];
                        if (branchEffect && branchEffect.effects) {
                            for (const key in branchEffect.effects) {
                                if (typeof branchEffect.effects[key] === 'number') {
                                    effects[key] = (effects[key] || 0) + branchEffect.effects[key];
                                } else {
                                    effects[key] = branchEffect.effects[key];
                                }
                            }
                        }
                    } else if (stage.effects) {
                        // 普通阶段效果
                        for (const key in stage.effects) {
                            if (typeof stage.effects[key] === 'number') {
                                effects[key] = (effects[key] || 0) + stage.effects[key];
                            } else {
                                // 非数值效果（如布尔、字符串、对象）取最新阶段
                                effects[key] = stage.effects[key];
                            }
                        }
                    }
                }
            }
        } else {
            // 兼容旧格式：effects + levelBonus
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
                } else {
                    // 非数值效果用特殊key标记来源
                    total[key] = effects[key];
                }
            }
        }
        return total;
    },

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

    getStageConfig(level) {
        for (const stage of EVOLUTION_STAGES) {
            if (level === stage.level) return stage;
        }
        // 返回当前已达到的最高阶段
        let result = EVOLUTION_STAGES[0];
        for (const stage of EVOLUTION_STAGES) {
            if (level >= stage.level) result = stage;
        }
        return result;
    },

    /**
     * 计算天赋升级所需经验
     */
    getExpToNextLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    /**
     * 增加天赋经验
     * @returns {object} { leveledUp, newLevel, newExp, evolutions: [触发的进化阶段] }
     */
    addTalentExp(talentData, amount) {
        if (!talentData) return { leveledUp: false };

        const talent = this.getTalent(talentData.talentId);
        if (!talent) return { leveledUp: false };

        if (talent.type === TALENT_TYPE_INNATE) {
            return { leveledUp: false, newLevel: talentData.level, newExp: 0, evolutions: [] };
        }

        const maxLevel = talent.maxLevel || 10;
        const oldLevel = talentData.level;
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

        // 检查是否触发进化
        const evolutions = this.checkEvolution(talentData.talentId, oldLevel, level);

        return {
            leveledUp: leveledUp,
            newLevel: level,
            newExp: exp,
            evolutions: evolutions
        };
    },

    getPlayerElementTalentEffects(playerTalents, element) {
        const talentData = playerTalents[element];
        if (!talentData) return {};
        return this.getTalentEffects(talentData.talentId, talentData.level);
    },

    /**
     * 获取天赋描述（带进化路线）
     */
    getTalentDescription(talentId, level = 1) {
        const talent = this.getTalent(talentId);
        if (!talent) return '';

        const typeName = talent.type === TALENT_TYPE_INNATE ? '【先天·传说】' : '【成长】';
        let desc = `${typeName} ${talent.name}\n${talent.description}\n`;

        if (talent.evolutions && talent.evolutions.length > 0) {
            desc += '\n进化路线：';
            for (const stage of talent.evolutions) {
                const reached = level >= stage.level;
                const stageConfig = EVOLUTION_STAGES.find(s => s.level === stage.level);
                const icon = stageConfig ? stageConfig.icon : '○';
                const marker = reached ? '✓' : '○';
                desc += `\n  ${marker} Lv.${stage.level} ${icon}【${stage.stage}】${stage.name}`;
                desc += `\n    ${stage.description}`;
                if (reached && stage.effects) {
                    const effectSummary = this.summarizeEffects(stage.effects);
                    if (effectSummary) desc += `\n    → ${effectSummary}`;
                }
            }
        } else if (talent.effects) {
            // 旧格式兼容
            const effects = this.getTalentEffects(talentId, level);
            for (const key in effects) {
                if (typeof effects[key] === 'number') {
                    const pct = (effects[key] * 100).toFixed(0);
                    desc += `\n• ${key}: +${pct}%`;
                }
            }
        }

        if (talent.type === TALENT_TYPE_INNATE) {
            desc += '\n\n（先天天赋，出生即巅峰，不可升级）';
        } else {
            const maxLevel = talent.maxLevel || 10;
            const currentStage = this.getCurrentStage(talentId, level);
            const nextStage = this.getNextStage(talentId, level);
            desc += `\n\n（当前Lv.${level}/${maxLevel}`;
            if (currentStage) desc += `，${currentStage.stage}·${currentStage.name}`;
            if (nextStage) desc += `，下个进化：Lv.${nextStage.level} ${nextStage.stage}`;
            desc += '）';
        }

        return desc;
    },

    /**
     * 生成效果摘要文本
     */
    summarizeEffects(effects) {
        const parts = [];
        const names = {
            damageBonus: '伤害', defenseBonus: '防御', speedBonus: '速度',
            hpBonus: 'HP', mpBonus: 'MP', critRate: '暴击率', critDamage: '暴伤',
            mpCostReduction: '省蓝', dodgeBonus: '闪避', hpRegen: '回血',
            mpRegen: '回蓝', burnChance: '点燃', freezeChance: '冰冻',
            paralyzeChance: '麻痹', explosionChance: '爆炸', lifesteal: '吸血',
            damageReflect: '反伤', firePenetration: '火穿', icePenetration: '冰穿',
            thunderPenetration: '雷穿', allStatsBonus: '全属性',
            healBonus: '治疗', shieldBonus: '护盾', skillLevelBonus: '技能等级',
            burnDamage: '灼烧伤害', explosionDamage: '爆炸伤害',
            freezeDuration: '冰冻回合', chainCount: '连锁次数',
            healAmount: '治疗量', mpRestore: 'MP恢复'
        };

        for (const key in effects) {
            if (typeof effects[key] === 'number') {
                const name = names[key] || key;
                if (effects[key] < 1 && effects[key] > 0) {
                    parts.push(`${name}+${(effects[key] * 100).toFixed(0)}%`);
                } else {
                    parts.push(`${name}+${effects[key]}`);
                }
            } else if (typeof effects[key] === 'boolean') {
                if (effects[key]) parts.push(key);
            } else if (typeof effects[key] === 'string') {
                parts.push(effects[key]);
            }
        }
        return parts.join('，');
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.TALENT_TYPE_INNATE = TALENT_TYPE_INNATE;
if (typeof window !== 'undefined') window.TALENT_TYPE_GROWTH = TALENT_TYPE_GROWTH;
if (typeof window !== 'undefined') window.EVOLUTION_STAGES = EVOLUTION_STAGES;
if (typeof window !== 'undefined') window.TalentSystem = TalentSystem;
