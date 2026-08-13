/**
 * 战斗AI系统 - 基于效用系统（Utility AI）
 * 
 * 核心思想：
 * 1. 列出所有候选行动
 * 2. 对每个行动打分（基于当前状态）
 * 3. 选择得分最高的行动执行
 * 
 * 评分因素：
 * - 自身状态（HP、MP、buff/debuff）
 * - 对手状态（HP、MP、buff/debuff）
 * - 技能效果（伤害、治疗、控制）
 * - 技能冷却
 * - 元素克制
 * 
 * 不同AI类型有不同的权重配置
 */

const BattleAI = {
    // AI类型配置 - 不同类型有不同的权重和偏好
    aiProfiles: {
        // 激进型：全力输出，不顾防御
        aggressive: {
            name: "激进型",
            description: "全力输出，优先使用最高伤害技能",
            weights: {
                damage: 1.5,      // 伤害权重高
                heal: 0.3,        // 治疗权重低
                defense: 0.2,     // 防御权重低
                control: 0.5,     // 控制权重中等
                buff: 0.3,        // buff权重低
                survival: 0.3     // 生存权重低
            },
            thresholds: {
                healHpPercent: 0.2,  // 血量低于20%才考虑治疗
                defenseHpPercent: 0.15 // 血量低于15%才考虑防御
            }
        },
        
        // 保守型：懂得自我保护，血量低时会防御/治疗
        defensive: {
            name: "保守型",
            description: "懂得自我保护，血量低时优先防御/治疗",
            weights: {
                damage: 0.8,
                heal: 1.5,
                defense: 1.5,
                control: 0.6,
                buff: 0.8,
                survival: 1.5
            },
            thresholds: {
                healHpPercent: 0.5,
                defenseHpPercent: 0.4
            }
        },
        
        // 控制型：优先控制，再输出
        controller: {
            name: "控制型",
            description: "优先控制敌人，再进行输出",
            weights: {
                damage: 0.7,
                heal: 0.8,
                defense: 0.6,
                control: 1.8,
                buff: 0.5,
                survival: 0.8
            },
            thresholds: {
                healHpPercent: 0.35,
                defenseHpPercent: 0.25
            }
        },
        
        // 爆发型：攒资源一波爆发
        burst: {
            name: "爆发型",
            description: "积攒资源，寻找机会一波爆发",
            weights: {
                damage: 1.2,
                heal: 0.6,
                defense: 0.5,
                control: 0.7,
                buff: 1.2,
                survival: 0.6
            },
            thresholds: {
                healHpPercent: 0.3,
                defenseHpPercent: 0.2,
                burstHpPercent: 0.6  // 敌人血量低于60%开始爆发
            }
        },
        
        // 游击型：打一下跑一下，风筝对手
        kiter: {
            name: "游击型",
            description: "打一下防御一下，风筝对手",
            weights: {
                damage: 1.0,
                heal: 0.7,
                defense: 1.2,
                control: 1.0,
                buff: 0.6,
                survival: 1.0
            },
            thresholds: {
                healHpPercent: 0.4,
                defenseHpPercent: 0.5  // 经常防御
            }
        },
        
        // 战术型：最智能，会根据情况调整策略
        tactical: {
            name: "战术型",
            description: "最智能，会根据玩家状态调整策略",
            weights: {
                damage: 1.0,
                heal: 1.0,
                defense: 1.0,
                control: 1.0,
                buff: 1.0,
                survival: 1.0
            },
            thresholds: {
                healHpPercent: 0.4,
                defenseHpPercent: 0.3
            }
        }
    },
    
    /**
     * 获取AI决策 - 选择最佳行动
     * @param {Object} self - 自身状态
     * @param {Object} opponent - 对手状态
     * @param {string} aiType - AI类型
     * @returns {Object} 决策结果 { action, skillId, reason }
     */
    getDecision(self, opponent, aiType = 'aggressive') {
        const profile = this.aiProfiles[aiType] || this.aiProfiles.aggressive;
        
        // 获取所有可用行动
        const actions = this.getAvailableActions(self);
        
        // 对每个行动评分
        const scoredActions = actions.map(action => {
            const score = this.calculateActionScore(action, self, opponent, profile);
            return { ...action, score };
        });
        
        // 按分数排序
        scoredActions.sort((a, b) => b.score - a.score);
        
        // 返回分数最高的行动
        const bestAction = scoredActions[0];
        
        return {
            action: bestAction.type,
            skillId: bestAction.skillId || null,
            score: bestAction.score,
            reason: bestAction.reason || '',
            allScores: scoredActions.slice(0, 5) // 返回前5名用于调试
        };
    },
    
    /**
     * 获取所有可用行动
     */
    getAvailableActions(self) {
        const actions = [];
        
        // 普通攻击
        actions.push({
            type: 'attack',
            name: '普通攻击',
            baseDamage: self.attack,
            cooldown: 0
        });
        
        // 防御
        actions.push({
            type: 'defend',
            name: '防御'
        });
        
        // 技能
        if (self.skills && self.skills.length > 0) {
            for (const skillId of self.skills) {
                const skill = this.getSkillData(skillId);
                if (skill) {
                    // 检查MP是否足够
                    if (skill.mpCost && self.mp < skill.mpCost) continue;
                    
                    // 检查冷却
                    const cooldown = self.skillCooldowns?.[skillId] || 0;
                    if (cooldown > 0) continue;
                    
                    actions.push({
                        type: 'skill',
                        skillId: skillId,
                        name: skill.name,
                        skill: skill
                    });
                }
            }
        }
        
        return actions;
    },
    
    /**
     * 计算行动分数
     */
    calculateActionScore(action, self, opponent, profile) {
        let score = 0.5; // 基础分
        let reason = '';
        
        const selfHpPercent = self.hp / self.maxHp;
        const opponentHpPercent = opponent.hp / opponent.maxHp;
        
        switch (action.type) {
            case 'attack':
                score = this.scoreAttack(action, self, opponent, profile);
                reason = '普通攻击';
                break;
                
            case 'defend':
                score = this.scoreDefend(action, self, opponent, profile);
                reason = '防御';
                break;
                
            case 'skill':
                score = this.scoreSkill(action, self, opponent, profile);
                reason = `技能: ${action.name}`;
                break;
        }
        
        // 生存压力修正 - 血量越低，生存权重越高
        if (selfHpPercent < 0.3) {
            score *= (0.5 + selfHpPercent); // 血量低时降低攻击倾向
        }
        
        // 随机扰动 - 增加一点随机性，避免AI太死板
        score *= (0.9 + Math.random() * 0.2);
        
        return { score, reason };
    },
    
    /**
     * 评分：普通攻击
     */
    scoreAttack(action, self, opponent, profile) {
        let score = 0.5;
        
        // 基础伤害分
        const damageRatio = self.attack / opponent.defense / 10;
        score += damageRatio * profile.weights.damage * 0.5;
        
        // 敌人血量低时，攻击更有价值（斩杀）
        if (opponent.hp / opponent.maxHp < 0.3) {
            score += 0.3 * profile.weights.damage;
        }
        
        // 对手在引导魔法时，攻击更有价值（可以打断）
        if (opponent.isCasting) {
            score += 0.4 * profile.weights.damage;
        }
        
        return score;
    },
    
    /**
     * 评分：防御
     */
    scoreDefend(action, self, opponent, profile) {
        let score = 0.2;
        
        const selfHpPercent = self.hp / self.maxHp;
        
        // 血量越低，防御价值越高
        if (selfHpPercent < profile.thresholds.defenseHpPercent) {
            score += (1 - selfHpPercent) * profile.weights.defense;
        }
        
        // 敌人攻击力高时，防御更有价值
        const attackPressure = opponent.attack / self.defense / 10;
        score += attackPressure * profile.weights.defense * 0.3;
        
        return score;
    },
    
    /**
     * 评分：技能
     */
    scoreSkill(action, self, opponent, profile) {
        let score = 0.5;
        const skill = action.skill;
        
        // 根据技能类型评分
        switch (skill.type) {
            case 'damage':
                score = this.scoreDamageSkill(skill, self, opponent, profile);
                break;
            case 'heal':
                score = this.scoreHealSkill(skill, self, opponent, profile);
                break;
            case 'buff':
                score = this.scoreBuffSkill(skill, self, opponent, profile);
                break;
            case 'debuff':
                score = this.scoreDebuffSkill(skill, self, opponent, profile);
                break;
            default:
                score = 0.4;
        }
        
        // MP消耗惩罚 - 消耗MP越多，惩罚越大（但伤害高的技能惩罚小）
        if (skill.mpCost > 0) {
            const mpRatio = skill.mpCost / self.maxMp;
            score -= mpRatio * 0.2;
        }
        
        // MP管理：MP低时，技能分数大幅降低，优先用普通攻击
        const selfMpPercent = self.mp / self.maxMp;
        if (selfMpPercent < 0.3) {
            // MP低于30%，技能分数降低
            score *= (0.4 + selfMpPercent);
        } else if (selfMpPercent < 0.15) {
            // MP低于15%，技能分数大幅降低
            score *= 0.3;
        }
        
        // 高伤害技能额外加分（支持baseDamage和power两种）
        const skillDamage = skill.baseDamage || (skill.power ? self.attack * skill.power : 0);
        if (skillDamage > 30 || (skill.power && skill.power >= 1.3)) {
            score += 0.2 * profile.weights.damage;
        }
        
        // 技能状态效果智能评分
        if (skill.statusEffects && skill.statusEffects.length > 0) {
            const selfHpPercent = self.hp / self.maxHp;
            const opponentHpPercent = opponent.hp / opponent.maxHp;
            
            skill.statusEffects.forEach(effect => {
                // 控制类效果：目标没被控制时额外加分
                if (['stun', 'freeze', 'frozen', 'paralyze', 'bind'].includes(effect.type)) {
                    const alreadyControlled = opponent.statusEffects?.some(e => 
                        ['stun', 'freeze', 'frozen', 'paralyze', 'bind'].includes(e.type)
                    );
                    if (!alreadyControlled && opponentHpPercent > 0.2) {
                        score += 0.25 * (effect.chance || 0.5);
                    }
                }
                
                // 吸血效果：自身血量低时额外加分
                if (skill.lifesteal && skill.lifesteal > 0 && selfHpPercent < 0.6) {
                    score += (0.6 - selfHpPercent) * 0.5;
                }
                
                // DOT效果（灼烧、中毒）：目标血量高时更有价值
                if (['burn', 'poison'].includes(effect.type) && opponentHpPercent > 0.5) {
                    score += 0.1;
                }
                
                // 减速效果：目标没被减速时加分
                if (effect.type === 'slow') {
                    const alreadySlowed = opponent.statusEffects?.some(e => e.type === 'slow');
                    if (!alreadySlowed) {
                        score += 0.1;
                    }
                }
            });
        }
        
        return score;
    },
    
    /**
     * 评分：伤害技能
     */
    scoreDamageSkill(skill, self, opponent, profile) {
        let score = 0.5;
        
        // 基础伤害分（支持baseDamage固定值和power基于攻击力倍率两种）
        const baseDamage = skill.baseDamage || (skill.power ? self.attack * skill.power : 10);
        const damageMultiplier = skill.damageMultiplier || 1;
        const totalDamage = baseDamage * damageMultiplier;
        
        const damageRatio = totalDamage / opponent.maxHp;
        score += damageRatio * profile.weights.damage * 2;
        
        // 敌人血量低时，伤害技能更有价值
        if (opponent.hp / opponent.maxHp < 0.3) {
            score += 0.4 * profile.weights.damage;
        }
        
        // 狂暴机制：自身血量低时，激进型AI伤害技能分数大幅提高
        const selfHpPercent = self.hp / self.maxHp;
        if (selfHpPercent < 0.3 && profile.weights.survival < 0.5) {
            // 激进型AI濒死时狂暴，更倾向于高伤害技能
            score += 0.5 * profile.weights.damage;
            // 高伤害技能额外加分更多
            if (totalDamage > self.attack * 1.5) {
                score += 0.3 * profile.weights.damage;
            }
        }
        
        // 对手被控制时，伤害技能价值更高（趁你病要你命）
        const opponentHasControl = opponent.statusEffects?.some(e => 
            e.type === 'stun' || e.type === 'freeze' || e.type === 'frozen' || e.type === 'paralyze'
        );
        if (opponentHasControl) {
            score += 0.3 * profile.weights.damage;
            // 高伤害技能在对手被控制时价值更高
            if (totalDamage > self.attack * 1.5) {
                score += 0.2 * profile.weights.damage;
            }
        }
        
        // 对手在引导魔法时，伤害技能更有价值（可以打断）
        if (opponent.isCasting) {
            score += 0.5 * profile.weights.damage;
            // 高伤害技能打断成功率更高，额外加分
            if (totalDamage > self.attack * 1.5) {
                score += 0.3 * profile.weights.damage;
            }
        }
        
        // 状态效果加分
        if (skill.statusEffects && skill.statusEffects.length > 0) {
            for (const effect of skill.statusEffects) {
                if (effect.type === 'burn' || effect.type === 'poison' || effect.type === 'bleed') {
                    score += 0.15 * profile.weights.damage; // DOT效果
                }
                if (effect.type === 'stun' || effect.type === 'freeze' || effect.type === 'frozen' || effect.type === 'paralyze') {
                    // 硬控效果
                    score += 0.3 * profile.weights.control;
                    
                    // 对手没有被控制时，控制技能价值更高
                    const opponentHasControl = opponent.statusEffects?.some(e => 
                        e.type === 'stun' || e.type === 'freeze' || e.type === 'frozen' || e.type === 'paralyze'
                    );
                    if (!opponentHasControl) {
                        score += 0.2 * profile.weights.control;
                    }
                    
                    // 对手血量很低时，控制技能价值降低（直接斩杀更重要）
                    if (opponent.hp / opponent.maxHp < 0.2) {
                        score -= 0.15 * profile.weights.damage;
                    }
                }
                if (effect.type === 'slow' || effect.type === 'attack_down' || effect.type === 'defense_down') {
                    score += 0.15 * profile.weights.control; // 软控
                }
            }
        }
        
        // 元素反应加分 - 如果技能能触发元素反应，额外加分
        if (skill.element && opponent.statusEffects && opponent.statusEffects.length > 0) {
            const hasWet = opponent.statusEffects.some(e => e.type === 'wet');
            const hasFreeze = opponent.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            const hasBurn = opponent.statusEffects.some(e => e.type === 'burn');
            const hasElectro = opponent.statusEffects.some(e => e.type === 'electrified' || e.type === 'paralyze');
            
            let canTriggerReaction = false;
            
            // 检查是否能触发元素反应
            if (skill.element === 'fire' && (hasWet || hasFreeze || hasElectro)) {
                canTriggerReaction = true; // 蒸发/融化/超载
            } else if (skill.element === 'thunder' && (hasWet || hasFreeze)) {
                canTriggerReaction = true; // 感电/超导
            } else if (skill.element === 'ice' && hasWet) {
                canTriggerReaction = true; // 冻结
            } else if (skill.element === 'earth' && hasWet) {
                canTriggerReaction = true; // 泥浆
            } else if (skill.element === 'wind' && (hasWet || hasBurn || hasElectro || hasFreeze)) {
                canTriggerReaction = true; // 扩散
            }
            
            if (canTriggerReaction) {
                score += 0.2 * profile.weights.damage;
            }
        }
        
        // 元素克制加分
        if (skill.element && opponent.elements && opponent.elements.length > 0) {
            // 检查是否克制对手的任意元素
            let hasStrong = false;
            let hasWeak = false;
            for (const element of opponent.elements) {
                if (this.isElementStrong(skill.element, element)) {
                    hasStrong = true;
                }
                if (this.isElementWeak(skill.element, element)) {
                    hasWeak = true;
                }
            }
            if (hasStrong) {
                score += 0.3 * profile.weights.damage;
            }
            if (hasWeak) {
                score -= 0.2;
            }
        }
        
        // 对手在引导魔法时，伤害技能更有价值（可以打断）
        if (opponent.isCasting) {
            score += 0.35 * profile.weights.damage;
        }
        
        return score;
    },
    
    /**
     * 评分：治疗技能
     */
    scoreHealSkill(skill, self, opponent, profile) {
        let score = 0.3;
        
        const selfHpPercent = self.hp / self.maxHp;
        
        // 血量越低，治疗价值越高
        if (selfHpPercent < profile.thresholds.healHpPercent) {
            // 计算治疗量：支持固定数值和百分比两种
            let healAmount;
            if (skill.healPercent) {
                healAmount = Math.floor(self.maxHp * skill.healPercent);
            } else {
                healAmount = skill.healAmount || skill.baseHeal || 20;
            }
            const healRatio = healAmount / self.maxHp;
            score += healRatio * profile.weights.heal * 3;
            
            // 血量很低时大幅加分
            if (selfHpPercent < 0.2) {
                score += 0.5 * profile.weights.survival;
            }
            
            // 能直接回满的话，价值更高
            if (self.hp + healAmount >= self.maxHp) {
                score += 0.2 * profile.weights.survival;
            }
        }
        
        return score;
    },
    
    /**
     * 评分：buff技能
     */
    scoreBuffSkill(skill, self, opponent, profile) {
        let score = 0.3;
        
        // 战斗开始时buff更有价值（前3回合或双方满血）
        const turn = self._battleTurn || 1;
        if (turn <= 3) {
            score += 0.25 * profile.weights.buff;
        }
        if (self.hp / self.maxHp > 0.8 && opponent.hp / opponent.maxHp > 0.8) {
            score += 0.2 * profile.weights.buff;
        }
        
        // 检查是否已经有相同buff（同时检查buffs和statusEffects）
        const hasBuff = self.buffs?.some(b => b.name === skill.name) || 
                        self.statusEffects?.some(e => e.name === skill.name);
        if (hasBuff) {
            score -= 0.3; // 已有相同buff，降低优先级
        }

        // 提取buff效果（支持skill.statModifiers和statusEffects中的statModifiers两种格式）
        let buffStats = skill.statModifiers || {};
        let hasDodgeBuff = false;
        if (skill.statusEffects && skill.statusEffects.length > 0) {
            for (const effect of skill.statusEffects) {
                if (effect.statModifiers) {
                    buffStats = { ...buffStats, ...effect.statModifiers };
                }
                if (effect.type === 'dodge_up' || effect.dodgeMod) {
                    hasDodgeBuff = true;
                }
            }
        }

        // 攻击型buff（攻击+、暴击+）在激进型AI中更有价值
        if (buffStats.attack || skill.critBonus) {
            score += 0.15 * (profile.weights.damage || 1);
            if (profile.name === 'aggressive' || profile.name === 'burst') {
                score += 0.15;
            }
        }

        // 防御型buff（防御+、闪避+）在保守型AI中更有价值
        if (buffStats.defense || hasDodgeBuff || skill.dodgeBonus) {
            score += 0.1 * (profile.weights.survival || 1);
            if (profile.name === 'defensive') {
                score += 0.1;
            }
        }

        // 速度型buff在游击型AI中更有价值
        if (buffStats.speed) {
            score += 0.15;
            if (profile.name === 'kiter') {
                score += 0.1;
            }
        }
        
        return score;
    },
    
    /**
     * 评分：debuff技能
     */
    scoreDebuffSkill(skill, self, opponent, profile) {
        let score = 0.4;
        
        // 检查敌人是否已有相同debuff
        const hasDebuff = opponent.statusEffects?.some(e => e.name === skill.name);
        if (hasDebuff) {
            score -= 0.2; // 已有相同debuff，降低优先级
        } else {
            score += 0.2 * profile.weights.control;
        }
        
        // 战斗开始时debuff更有价值
        if (opponent.hp / opponent.maxHp > 0.7) {
            score += 0.15 * profile.weights.control;
        }
        
        return score;
    },
    
    /**
     * 元素克制判断 - 攻击方是否克制防守方
     */
    isElementStrong(attackElement, defendElement) {
        const strongAgainst = {
            fire: 'ice',      // 火克冰
            ice: 'wind',      // 冰克风
            wind: 'earth',    // 风克土
            earth: 'thunder', // 土克雷
            thunder: 'water', // 雷克水
            water: 'fire',    // 水克火
            light: 'dark',    // 光克暗
            dark: 'light'     // 暗克光
        };
        return strongAgainst[attackElement] === defendElement;
    },
    
    /**
     * 元素被克判断 - 攻击方是否被防守方克制
     */
    isElementWeak(attackElement, defendElement) {
        const weakAgainst = {
            fire: 'water',
            ice: 'fire',
            wind: 'ice',
            earth: 'wind',
            thunder: 'earth',
            water: 'thunder',
            light: 'dark',
            dark: 'light'
        };
        return weakAgainst[attackElement] === defendElement;
    },
    
    /**
     * 获取技能数据
     */
    getSkillData(skillId) {
        if (typeof DataSkills !== 'undefined' && DataSkills[skillId]) {
            return DataSkills[skillId];
        }
        return null;
    },
    
    /**
     * 获取AI类型列表
     */
    getAITypes() {
        return Object.keys(this.aiProfiles).map(type => ({
            type,
            name: this.aiProfiles[type].name,
            description: this.aiProfiles[type].description
        }));
    }
};

// 导出（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleAI;
}
