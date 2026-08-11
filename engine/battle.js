/**
 * 战斗系统
 * 贴近原著设计：星子引导、元素克制、精神力、打断机制
 */

const BattleSystem = {
    // 战斗状态
    active: false,
    player: null,
    enemy: null,
    turn: 0,
    log: [],
    isPlayerTurn: true,
    
    // 引导中的魔法
    playerCasting: null,      // {skillId, progress, totalTime}
    enemyCasting: null,
    
    // 战斗结果
    result: null,  // 'win' | 'lose' | 'flee'
    
    // 元素克制关系（小说设定）
    // 火克冰、冰克风、风克土、土克雷、雷克水、水克火
    // 光暗互克
    ELEMENT_COUNTER: {
        fire: 'ice',      // 火克冰
        ice: 'wind',      // 冰克风
        wind: 'earth',    // 风克土
        earth: 'thunder', // 土克雷
        thunder: 'water', // 雷克水
        water: 'fire',    // 水克火
        light: 'dark',    // 光克暗
        dark: 'light'     // 暗克光
    },
    
    // 元素中文名
    ELEMENT_NAMES: {
        fire: '火系',
        ice: '冰系',
        wind: '风系',
        earth: '土系',
        thunder: '雷系',
        water: '水系',
        light: '光系',
        dark: '暗影系'
    },

    /**
     * 开始战斗
     */
    startBattle(enemyData) {
        this.active = true;
        this.turn = 1;
        this.log = [];
        this.result = null;
        this.playerCasting = null;
        this.enemyCasting = null;
        this.isPlayerTurn = true;

        // 复制敌人数据，避免修改原数据
        this.enemy = JSON.parse(JSON.stringify(enemyData));
        this.enemy.hp = this.enemy.maxHp;
        this.enemy.mp = this.enemy.maxMp || 50;
        this.enemy.buffs = [];
        this.enemy.statusEffects = [];

        // 玩家战斗状态
        this.player = {
            name: Player.name,
            level: Player.level,
            maxHp: Player.getTotalStats().maxHp,
            hp: Player.hp,
            maxMp: Player.getTotalStats().maxMp,
            mp: Player.mp,
            attack: Player.getTotalStats().attack,
            defense: Player.getTotalStats().defense,
            speed: Player.getTotalStats().speed,
            spirit: Player.spirit,
            critRate: Player.getTotalStats().critRate,
            hitRate: Player.getTotalStats().hitRate,
            elements: Player.elements,
            skills: Player.skills,
            buffs: [],
            statusEffects: [],
            isDefending: false
        };

        this.addLog(`遭遇了 ${this.enemy.name}！`, 'system');
        
        // 先手判定：速度高的先行动
        if (this.enemy.speed > this.player.speed) {
            this.isPlayerTurn = false;
            this.addLog(`${this.enemy.name} 速度更快，抢先出手！`, 'system');
            // 延迟执行敌人回合
            setTimeout(() => this.enemyTurn(), 1000);
        } else {
            this.addLog('你的速度更快，可以先行动。', 'system');
        }

        return {
            player: this.player,
            enemy: this.enemy,
            isPlayerTurn: this.isPlayerTurn
        };
    },

    /**
     * 玩家行动：普通攻击
     */
    playerAttack() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = false;

        // 计算伤害（含攻击者状态修正）
        const attackerMods = this.getStatusModifiers(this.player);
        const damage = this.calculateDamage(
            this.player.attack + attackerMods.attackMod,
            this.enemy.defense,
            1.0,
            this.player.critRate,
            this.player.hitRate,
            'physical',
            null,
            this.enemy
        );

        // 应用伤害
        this.applyDamage(this.enemy, damage);
        
        this.addLog(`你发动了普通攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, damage.isCrit ? 'crit' : 'damage');

        // 检查是否打断敌人引导
        if (this.enemyCasting && !damage.isMiss) {
            if (Math.random() < 0.3) { // 30%概率打断
                this.addLog(`打断了 ${this.enemy.name} 的魔法引导！`, 'system');
                this.enemyCasting = null;
            }
        }

        this.endPlayerTurn();
        return damage;
    },

    /**
     * 玩家行动：释放魔法
     */
    playerCastSkill(skillId) {
        if (!this.active || !this.isPlayerTurn) return null;

        const skill = SkillSystem.getSkill(skillId);
        if (!skill) return null;

        // 检查MP
        if (this.player.mp < skill.mpCost) {
            this.addLog('魔法值不足！', 'system');
            return null;
        }

        this.player.isDefending = false;

        // 计算引导时间（精神力越高越快）
        const baseCastTime = this.getCastTime(skill.tier);
        const castTime = Math.max(1, Math.floor(baseCastTime * (100 - this.player.spirit) / 100));

        // 如果引导时间为0（瞬发），直接释放
        if (castTime <= 1 || skill.type === 'buff' || skill.targetType === 'self') {
            return this.castSkillImmediate(skill, 'player');
        }

        // 开始引导
        this.playerCasting = {
            skillId: skillId,
            skill: skill,
            progress: 1,
            totalTime: castTime
        };

        this.player.mp -= skill.mpCost;
        this.addLog(`你开始引导 ${skill.name}...（${castTime} 回合后释放）`, 'magic');

        this.endPlayerTurn();
        return { casting: true, castTime: castTime };
    },

    /**
     * 瞬发技能（直接生效）
     */
    castSkillImmediate(skill, caster) {
        const isPlayer = caster === 'player';
        const casterData = isPlayer ? this.player : this.enemy;
        const targetData = isPlayer ? this.enemy : this.player;

        // 消耗MP
        casterData.mp -= skill.mpCost;

        if (skill.type === 'damage') {
            // 伤害技能（含攻击者状态修正）
            const casterMods = this.getStatusModifiers(casterData);
            const effectiveAttack = casterData.attack + casterMods.attackMod;
            const baseDamage = skill.baseDamage + effectiveAttack * (skill.damageMultiplier || 1.0);
            
            // 精神力加成
            const spirit = casterData.spirit || 10;
            const spiritBonus = 1 + spirit * 0.005;
            
            // 元素克制
            const elementBonus = this.getElementBonus(skill.element, targetData.elements?.[0] || 'neutral');

            const damage = this.calculateDamage(
                baseDamage * spiritBonus * elementBonus,
                targetData.defense,
                1.0,
                casterData.critRate || 0.05,
                skill.hitRate || 0.9,
                skill.element,
                targetData.elements?.[0] || 'neutral',
                targetData
            );

            this.applyDamage(targetData, damage);

            const casterName = isPlayer ? '你' : this.enemy.name;
            
            // 元素克制效果显示
            let elementEffectText = '';
            if (damage.elementEffect === 'super') {
                elementEffectText = '（效果拔群！）';
            } else if (damage.elementEffect === 'weak') {
                elementEffectText = '（效果不佳...）';
            } else if (damage.elementEffect === 'resist') {
                elementEffectText = '（被抵抗了）';
            }
            
            this.addLog(`${casterName} 释放了 ${skill.name}，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}${elementEffectText}`, 
                damage.isCrit ? 'crit' : 'magic');

            // 状态效果
            if (skill.statusEffects && !damage.isMiss) {
                this.applyStatusEffects(targetData, skill.statusEffects, isPlayer);
            }

        } else if (skill.type === 'heal') {
            // 治疗技能
            const healAmount = Math.floor(skill.baseHeal * (1 + casterData.spirit * 0.01));
            targetData.hp = Math.min(targetData.maxHp, targetData.hp + healAmount);

            // 治疗技能的附加状态效果（如净化、复苏）
            if (skill.statusEffects) {
                this.applyStatusEffects(targetData, skill.statusEffects, !isPlayer);
            }

            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = skill.targetType === 'self' ? casterName : (isPlayer ? this.enemy.name : '你');
            this.addLog(`${casterName} 使用 ${skill.name}，${targetName} 恢复了 ${healAmount} 点生命`, 'heal');

        } else if (skill.type === 'buff') {
            // 增益技能
            if (skill.statusEffects) {
                this.applyStatusEffects(casterData, skill.statusEffects, !isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            this.addLog(`${casterName} 使用了 ${skill.name}`, 'buff');

        } else if (skill.type === 'debuff') {
            // 减益技能（对敌人施加负面状态）
            if (skill.statusEffects) {
                this.applyStatusEffects(targetData, skill.statusEffects, isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = isPlayer ? this.enemy.name : '你';
            this.addLog(`${casterName} 对 ${targetName} 释放了 ${skill.name}`, 'debuff');
        }

        if (isPlayer) {
            this.endPlayerTurn();
        } else {
            this.endEnemyTurn();
        }

        return { success: true };
    },

    /**
     * 玩家行动：防御
     */
    playerDefend() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = true;
        
        // 防御恢复少量MP
        const mpRecover = Math.floor(this.player.maxMp * 0.05);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRecover);

        this.addLog(`你采取防御姿态，减少受到的伤害，并恢复了 ${mpRecover} 点魔法值`, 'system');

        this.endPlayerTurn();
        return { defend: true, mpRecover: mpRecover };
    },

    /**
     * 玩家行动：使用道具
     */
    playerUseItem(itemId) {
        if (!this.active || !this.isPlayerTurn) return null;

        const item = Inventory.getItem(itemId);
        if (!item) {
            this.addLog('物品不存在', 'system');
            return null;
        }

        const result = Inventory.useItem(itemId, true);
        if (!result.success) {
            this.addLog(result.message, 'system');
            return null;
        }

        // 同步玩家状态
        this.player.hp = Player.hp;
        this.player.mp = Player.mp;

        this.addLog(`你使用了 ${item.name}`, 'system');

        // 处理物品的状态效果
        if (item.statusEffects && item.statusEffects.length > 0) {
            if (item.effects && item.effects.damage) {
                // 伤害类道具：状态效果施加给敌人
                this.applyStatusEffects(this.enemy, item.statusEffects, false);
            } else {
                // 增益类道具：状态效果施加给玩家
                this.applyStatusEffects(this.player, item.statusEffects, true);
            }
        }

        // 处理伤害类道具（对敌人造成伤害）
        if (item.effects && item.effects.damage) {
            const dmg = this.calculateDamage(
                item.effects.damage,
                this.enemy.defense,
                1.0,
                0,
                1.0,
                item.element || 'neutral',
                this.enemy.elements?.[0] || 'neutral',
                this.enemy
            );
            this.applyDamage(this.enemy, dmg);
        }

        // 处理净化类道具
        if (item.effects && item.effects.cleanse) {
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze'];
            this.player.statusEffects = this.player.statusEffects.filter(e => !debuffTypes.includes(e.type));
            this.addLog('净化了所有负面状态！', 'buff');
        }

        this.endPlayerTurn();
        return result;
    },

    /**
     * 玩家行动：逃跑
     */
    playerFlee() {
        if (!this.active || !this.isPlayerTurn) return null;

        // 逃跑成功率：取决于双方速度差
        const speedDiff = this.player.speed - this.enemy.speed;
        const fleeChance = Math.min(0.9, Math.max(0.1, 0.5 + speedDiff * 0.02));

        if (Math.random() < fleeChance) {
            this.addLog('你成功逃跑了！', 'system');
            this.result = 'flee';
            this.active = false;
            return { success: true };
        } else {
            this.addLog('逃跑失败！', 'system');
            this.endPlayerTurn();
            return { success: false };
        }
    },

    /**
     * 结束玩家回合
     */
    endPlayerTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) return;

        this.isPlayerTurn = false;
        
        // 处理玩家引导中的魔法
        if (this.playerCasting) {
            this.playerCasting.progress++;
            if (this.playerCasting.progress >= this.playerCasting.totalTime) {
                // 引导完成，释放魔法
                const skill = this.playerCasting.skill;
                this.playerCasting = null;
                this.addLog(`${skill.name} 引导完成！`, 'magic');
                this.castSkillImmediate(skill, 'player');
                return; // castSkillImmediate 里会调用 endPlayerTurn，不对，应该是直接进入敌人回合
            }
        }

        // 敌人回合
        setTimeout(() => this.enemyTurn(), 800);
    },

    /**
     * 敌人回合
     */
    enemyTurn() {
        if (!this.active || this.result) return;

        // 检查眩晕/冻结状态，跳过回合
        if (this.isStunned(this.enemy)) {
            const stunEffect = this.enemy.statusEffects.find(e => e.type === 'stun' || e.type === 'frozen');
            this.addLog(`${this.enemy.name} 被${stunEffect.name}，无法行动！`, 'system');
            this.endEnemyTurn();
            return;
        }

        // 处理敌人引导中的魔法
        if (this.enemyCasting) {
            this.enemyCasting.progress++;
            if (this.enemyCasting.progress >= this.enemyCasting.totalTime) {
                const skill = this.enemyCasting.skill;
                this.enemyCasting = null;
                this.addLog(`${this.enemy.name} 的 ${skill.name} 引导完成！`, 'magic');
                this.castSkillImmediate(skill, 'enemy');
                return;
            }
        }

        // 敌人AI选择行动
        const action = this.enemyAI();

        if (action.type === 'attack') {
            // 普通攻击
            // 计算伤害（含攻击者状态修正）
            const enemyMods = this.getStatusModifiers(this.enemy);
            const damage = this.calculateDamage(
                this.enemy.attack + enemyMods.attackMod,
                this.player.defense * (this.player.isDefending ? 2 : 1), // 防御时防御翻倍
                1.0,
                0.05,
                0.9,
                'physical',
                null,
                this.player
            );

            // 防御减伤
            if (this.player.isDefending) {
                damage.amount = Math.floor(damage.amount * 0.5);
            }

            this.applyDamage(this.player, damage);

            this.addLog(`${this.enemy.name} 发动攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 
                damage.isCrit ? 'crit' : 'damage');

            // 检查是否打断玩家引导
            if (this.playerCasting && !damage.isMiss) {
                if (Math.random() < 0.3) {
                    this.addLog(`你的魔法引导被打断了！`, 'system');
                    this.playerCasting = null;
                }
            }

        } else if (action.type === 'skill') {
            // 使用技能
            const skill = SkillSystem.getSkill(action.skillId);
            if (skill && this.enemy.mp >= skill.mpCost) {
                // 计算引导时间
                const baseCastTime = this.getCastTime(skill.tier);
                const castTime = Math.max(1, Math.floor(baseCastTime * 0.8)); // 敌人引导稍快

                if (castTime <= 1 || skill.type === 'buff' || skill.targetType === 'self') {
                    // 瞬发
                    this.castSkillImmediate(skill, 'enemy');
                    return;
                } else {
                    // 开始引导
                    this.enemyCasting = {
                        skillId: action.skillId,
                        skill: skill,
                        progress: 1,
                        totalTime: castTime
                    };
                    this.enemy.mp -= skill.mpCost;
                    this.addLog(`${this.enemy.name} 开始引导 ${skill.name}...`, 'magic');
                }
            }
        }

        this.endEnemyTurn();
    },

    /**
     * 敌人AI
     */
    enemyAI() {
        // 简单AI：优先用技能，没MP就普攻
        const availableSkills = (this.enemy.skills || ['basic_attack'])
            .filter(id => {
                const skill = SkillSystem.getSkill(id);
                return skill && this.enemy.mp >= skill.mpCost;
            });

        // 30%概率用技能
        if (availableSkills.length > 0 && Math.random() < 0.4) {
            const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            return { type: 'skill', skillId: skillId };
        }

        return { type: 'attack' };
    },

    /**
     * 结束敌人回合
     */
    endEnemyTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) return;

        // 处理状态效果（每回合结束）
        this.tickStatusEffects(this.player, true);
        this.tickStatusEffects(this.enemy, false);

        // 检查战斗是否结束（DOT可能致死）
        if (this.checkBattleEnd()) return;

        this.turn++;
        this.isPlayerTurn = true;
        this.player.isDefending = false;

        // 玩家被眩晕/冻结，自动跳过回合
        if (this.isStunned(this.player)) {
            const stunEffect = this.player.statusEffects.find(e => e.type === 'stun' || e.type === 'frozen');
            this.addLog(`你被${stunEffect.name}，无法行动！`, 'system');
            setTimeout(() => {
                this.isPlayerTurn = false;
                this.enemyTurn();
            }, 1000);
            return;
        }
        
        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }
    },

    /**
     * 计算伤害
     */
    calculateDamage(attack, defense, multiplier, critRate, hitRate, element, targetElement, target) {
        const result = {
            amount: 0,
            isCrit: false,
            isMiss: false,
            element: element,
            elementEffect: null  // 'super' | 'weak' | 'normal'
        };

        // 命中判定（考虑目标闪避修正）
        let evasion = 0;
        if (target) {
            const mods = this.getStatusModifiers(target);
            evasion = mods.evasionMod;
        }
        if (Math.random() > (hitRate - evasion)) {
            result.isMiss = true;
            return result;
        }

        // 基础伤害
        let damage = Math.max(1, (attack - defense * 0.5) * multiplier);

        // 元素克制计算
        if (element && targetElement) {
            const counterResult = this.checkElementCounter(element, targetElement);
            result.elementEffect = counterResult.effect;
            
            if (counterResult.effect === 'super') {
                damage *= 1.5; // 克制：伤害+50%
            } else if (counterResult.effect === 'weak') {
                damage *= 0.7; // 被克制：伤害-30%
            } else if (counterResult.effect === 'resist') {
                damage *= 0.8; // 同系抗性：伤害-20%
            }
        }

        // 元素特性伤害加成（基于目标状态）
        if (target) {
            const mods = this.getStatusModifiers(target);
            if (element === 'fire') damage *= mods.fireDamageMod;
            if (element === 'thunder') damage *= mods.thunderDamageMod;
            if (element === 'ice') damage *= mods.iceDamageMod;
        }

        // 随机浮动 ±15%
        damage *= 0.85 + Math.random() * 0.3;

        // 暴击判定
        if (Math.random() < critRate) {
            result.isCrit = true;
            damage *= 1.5 + Math.random() * 0.5; // 1.5-2.0倍暴击
        }

        result.amount = Math.floor(damage);
        return result;
    },
    
    /**
     * 检查元素克制关系
     * @param {string} attackElement - 攻击元素
     * @param {string} defendElement - 防御元素
     * @returns {Object} {effect: 'super'|'weak'|'resist'|'normal', message: ''}
     */
    checkElementCounter(attackElement, defendElement) {
        if (!attackElement || !defendElement) {
            return { effect: 'normal', message: '' };
        }
        
        // 同系抗性
        if (attackElement === defendElement) {
            return { 
                effect: 'resist', 
                message: `${this.ELEMENT_NAMES[attackElement] || attackElement}抗性` 
            };
        }
        
        // 攻击方克制防御方
        if (this.ELEMENT_COUNTER[attackElement] === defendElement) {
            return { 
                effect: 'super', 
                message: `${this.ELEMENT_NAMES[attackElement] || attackElement}克制${this.ELEMENT_NAMES[defendElement] || defendElement}！` 
            };
        }
        
        // 防御方克制攻击方
        if (this.ELEMENT_COUNTER[defendElement] === attackElement) {
            return { 
                effect: 'weak', 
                message: `${this.ELEMENT_NAMES[defendElement] || defendElement}克制${this.ELEMENT_NAMES[attackElement] || attackElement}...` 
            };
        }
        
        return { effect: 'normal', message: '' };
    },

    /**
     * 应用伤害
     */
    applyDamage(target, damage) {
        let amount = damage.amount;
        
        // 护盾吸收
        const shield = target.statusEffects.find(e => e.type === 'shield');
        if (shield && shield.value > 0) {
            const absorbed = Math.min(shield.value, amount);
            shield.value -= absorbed;
            amount -= absorbed;
            if (absorbed > 0) {
                const targetName = target === this.player ? '你' : this.enemy.name;
                this.addLog(`${targetName} 的护盾吸收了 ${absorbed} 点伤害`, 'buff');
            }
            if (shield.value <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'shield');
            }
        }

        target.hp = Math.max(0, target.hp - amount);
        
        // 同步到玩家数据
        if (target === this.player) {
            Player.hp = this.player.hp;
        }
    },

    /**
     * 获取引导时间
     */
    getCastTime(tier) {
        const castTimes = {
            '初阶': 2,
            '中阶': 3,
            '高阶': 4,
            '超阶': 5
        };
        return castTimes[tier] || 2;
    },

    /**
     * 元素克制加成
     */
    getElementBonus(attackElement, defenseElement) {
        // 使用统一的元素克制系统
        const result = this.checkElementCounter(attackElement, defenseElement);
        if (result.effect === 'super') return 1.5;
        if (result.effect === 'weak') return 0.7;
        if (result.effect === 'resist') return 0.8;
        return 1.0;
    },

    /**
     * 应用状态效果
     */
    /**
     * 施加状态效果
     * 支持层数叠加(stacks)、数值累积(value)、特殊类型
     */
    applyStatusEffects(target, effects, isPlayerTarget) {
        const targetName = isPlayerTarget ? '你' : this.enemy.name;

        effects.forEach(effect => {
            // 净化效果：清除所有负面状态
            if (effect.type === 'cleanse') {
                if (Math.random() < (effect.chance || 1.0)) {
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness'];
                    const beforeCount = target.statusEffects.length;
                    target.statusEffects = target.statusEffects.filter(e => !debuffTypes.includes(e.type));
                    const removed = beforeCount - target.statusEffects.length;
                    if (removed > 0) {
                        this.addLog(`${targetName} 的圣光净化了 ${removed} 个负面状态！`, 'buff');
                    } else {
                        this.addLog(`${targetName} 被圣光笼罩，没有负面状态需要净化`, 'system');
                    }
                }
                return;
            }

            if (Math.random() < (effect.chance || 1.0)) {
                const existing = target.statusEffects.find(e => e.type === effect.type);
                
                if (existing) {
                    // 层数叠加型（燃烧、诅咒等）
                    if (effect.stacks || existing.stacks) {
                        const maxStacks = effect.maxStacks || existing.maxStacks || 3;
                        existing.stacks = Math.min(maxStacks, (existing.stacks || 1) + (effect.stacks || 1));
                        existing.duration = Math.max(existing.duration, effect.duration);
                        this.addLog(`${targetName} 的 ${effect.name} 叠加到 ${existing.stacks} 层！`, 'debuff');
                    }
                    // 数值累积型（冻结值、护盾值等）
                    else if (effect.value !== undefined || existing.value !== undefined) {
                        existing.value = (existing.value || 0) + (effect.value || 0);
                        existing.duration = Math.max(existing.duration, effect.duration);
                        // 冻结值达到阈值则冻结
                        if (effect.type === 'freeze' && existing.value >= 100) {
                            existing.type = 'frozen';
                            existing.name = '冻结';
                            existing.duration = 1;
                            existing.value = 0;
                            this.addLog(`${targetName} 被冻结了！`, 'debuff');
                        }
                    }
                    // 普通刷新持续时间
                    else {
                        existing.duration = Math.max(existing.duration, effect.duration);
                        this.addLog(`${targetName} 的 ${effect.name} 持续时间刷新了`, 'system');
                    }
                } else {
                    // 新效果
                    const newEffect = { ...effect };
                    if (effect.stacks && !newEffect.stacks) newEffect.stacks = 1;
                    target.statusEffects.push(newEffect);
                    
                    // 特殊效果提示
                    if (effect.type === 'stun' || effect.type === 'frozen') {
                        this.addLog(`${targetName} 被${effect.name}了！`, 'debuff');
                    } else if (effect.type === 'shield') {
                        this.addLog(`${targetName} 获得了 ${effect.value} 点护盾！`, 'buff');
                    } else if (effect.type === 'wet') {
                        this.addLog(`${targetName} 被水浸湿了`, 'debuff');
                    } else if (effect.type === 'evasion_up') {
                        this.addLog(`${targetName} 闪避率提升！`, 'buff');
                    } else {
                        this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
                    }
                }

                // 元素组合反应检查
                this.checkElementReactions(target, effect, isPlayerTarget);
            }
        });
    },

    /**
     * 元素组合反应检查
     * 两种元素状态相遇时产生特殊效果
     */
    checkElementReactions(target, newEffect, isPlayerTarget) {
        const targetName = isPlayerTarget ? '你' : this.enemy.name;
        const effects = target.statusEffects;

        // 雷 + 湿润 = 感电
        if (newEffect.type === 'paralysis' || newEffect.element === 'thunder') {
            const wet = effects.find(e => e.type === 'wet');
            if (wet) {
                wet.type = 'electrified';
                wet.name = '感电';
                wet.dotDamage = (wet.dotDamage || 0) + 15;
                wet.duration = Math.max(wet.duration, 2);
                this.addLog(`⚡ 感电反应！${targetName} 全身通电，持续受到伤害！`, 'magic');
            }
        }

        // 火 + 冻结 = 融化
        if ((newEffect.type === 'burn' || newEffect.element === 'fire') && newEffect.type !== 'freeze') {
            const frozen = effects.find(e => e.type === 'frozen');
            if (frozen) {
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'frozen');
                this.addLog(`🔥 融化反应！冻结被解除，火系伤害提升！`, 'magic');
                // 标记本回合火系伤害加成
                target._meltBonus = 1.5;
            }
        }

        // 火 + 湿润 = 蒸汽（命中率降低）
        if ((newEffect.type === 'burn' || newEffect.element === 'fire') && newEffect.type !== 'wet') {
            const wet = effects.find(e => e.type === 'wet');
            if (wet && wet.type === 'wet') {
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'wet');
                const steam = { type: 'steam', name: '蒸汽', duration: 2, hitRateMod: -0.3 };
                target.statusEffects.push(steam);
                this.addLog(`💨 蒸汽反应！${targetName} 被蒸汽笼罩，命中率降低！`, 'magic');
            }
        }

        // 土 + 湿润 = 泥泞（速度降低）
        if (newEffect.element === 'earth' || newEffect.type === 'mud') {
            const wet = effects.find(e => e.type === 'wet');
            if (wet) {
                wet.type = 'mud';
                wet.name = '泥泞';
                wet.speedMod = -0.5;
                wet.duration = Math.max(wet.duration, 2);
                this.addLog(`🪨 泥泞反应！${targetName} 陷入泥泞，速度大减！`, 'magic');
            }
        }
    },

    /**
     * 状态效果每回合结算
     */
    /**
     * 状态效果每回合结算
     * 支持层数DOT、眩晕跳过、护盾保留等
     */
    tickStatusEffects(target, isPlayer) {
        const targetName = isPlayer ? '你' : this.enemy.name;

        target.statusEffects = target.statusEffects.filter(effect => {
            // 护盾不随时间消失（被打掉才消失）
            if (effect.type === 'shield') {
                if ((effect.value || 0) <= 0) return false;
                return true;
            }

            effect.duration--;

            // DOT伤害（按层数计算）
            if (effect.dotDamage) {
                const stacks = effect.stacks || 1;
                const damage = { amount: Math.floor(effect.dotDamage * stacks), isCrit: false, isMiss: false };
                this.applyDamage(target, damage);
                this.addLog(`${targetName} 受到 ${effect.name} 伤害 ${damage.amount} 点（${stacks}层）`, 'damage');
            }

            // REG恢复（每回合恢复HP）
            if (effect.regen) {
                const healAmount = Math.floor(effect.regen);
                target.hp = Math.min(target.maxHp, target.hp + healAmount);
                this.addLog(`${targetName} 受到 ${effect.name} 恢复 ${healAmount} 点生命`, 'heal');
            }

            // 效果结束
            if (effect.duration <= 0) {
                if (effect.type !== 'shield') {
                    this.addLog(`${targetName} 的 ${effect.name} 效果消失了`, 'system');
                }
                return false;
            }
            return true;
        });

        // 清除融化加成标记
        if (target._meltBonus) delete target._meltBonus;
    },

    /**
     * 检查目标是否被眩晕/冻结，应跳过回合
     */
    isStunned(target) {
        return target.statusEffects.some(e => e.type === 'stun' || e.type === 'frozen');
    },

    /**
     * 获取目标的状态效果修正值
     */
    getStatusModifiers(target) {
        const mods = {
            attackMod: 0,
            defenseMod: 0,
            speedMod: 0,
            hitRateMod: 0,
            evasionMod: 0,
            fireDamageMod: 1,
            thunderDamageMod: 1,
            iceDamageMod: 1
        };

        target.statusEffects.forEach(effect => {
            if (effect.statModifiers) {
                const stacks = effect.stacks || 1;
                mods.attackMod += (effect.statModifiers.attack || 0) * stacks;
                mods.defenseMod += (effect.statModifiers.defense || 0) * stacks;
                mods.speedMod += (effect.statModifiers.speed || 0) * stacks;
            }
            if (effect.speedMod) mods.speedMod += effect.speedMod;
            if (effect.hitRateMod) mods.hitRateMod += effect.hitRateMod;
            if (effect.evasionMod) mods.evasionMod += effect.evasionMod;
            // 湿润状态受雷系伤害×2
            if (effect.type === 'wet' || effect.type === 'electrified') {
                mods.thunderDamageMod *= 2;
            }
            // 冻结状态受火系伤害×2
            if (effect.type === 'frozen') {
                mods.fireDamageMod *= 2;
            }
        });

        // 融化加成
        if (target._meltBonus) {
            mods.fireDamageMod *= target._meltBonus;
        }

        return mods;
    },

    /**
     * 检查战斗是否结束
     */
    checkBattleEnd() {
        if (this.player.hp <= 0) {
            this.result = 'lose';
            this.active = false;
            this.addLog('你被击败了...', 'system');
            return true;
        }

        if (this.enemy.hp <= 0) {
            this.result = 'win';
            this.active = false;
            this.addLog(`击败了 ${this.enemy.name}！`, 'system');
            
            // 计算奖励
            this.calculateRewards();
            return true;
        }

        return false;
    },

    /**
     * 计算战斗奖励
     */
    calculateRewards() {
        const rewards = {
            exp: 0,
            gold: 0,
            items: [],
            levelUps: []
        };

        // 基础经验和金币
        rewards.exp = this.enemy.expReward || 0;
        rewards.gold = this.enemy.goldReward || 0;

        // 随机浮动 ±20%
        rewards.exp = Math.floor(rewards.exp * (0.8 + Math.random() * 0.4));
        rewards.gold = Math.floor(rewards.gold * (0.8 + Math.random() * 0.4));

        // 金币暴击：10%概率获得2倍金币
        if (Math.random() < 0.1) {
            rewards.gold = rewards.gold * 2;
            rewards.goldCrit = true;
        }

        // 掉落物品
        if (this.enemy.dropItems) {
            this.enemy.dropItems.forEach(drop => {
                if (Math.random() < drop.chance) {
                    const count = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
                    Inventory.addItem(drop.itemId, count);
                    const item = Inventory.getItem(drop.itemId);
                    rewards.items.push({
                        itemId: drop.itemId,
                        name: item?.name || drop.itemId,
                        count: count
                    });
                }
            });
        }

        // 精英怪额外奖励
        if (this.enemy.isElite) {
            rewards.exp = Math.floor(rewards.exp * 1.5);
            rewards.gold = Math.floor(rewards.gold * 1.5);
        }

        // 应用奖励
        const expResult = Player.gainExp(rewards.exp);
        Player.gainGold(rewards.gold);
        rewards.levelUps = expResult.levelUps;
        rewards.newSkills = expResult.newSkills;

        // 更新任务进度
        const completedQuests = QuestSystem.updateProgress('kill', this.enemy.id, 1);

        this.addLog(`获得 ${rewards.exp} 经验，${rewards.gold} 金币${rewards.goldCrit ? ' 💰金币暴击！' : ''}`, 'system');
        if (rewards.items.length > 0) {
            rewards.items.forEach(item => {
                this.addLog(`获得 ${item.name} x${item.count}`, 'system');
            });
        }
        if (expResult.levelUps.length > 0) {
            this.addLog(`🎉 升级了！当前等级 ${Player.level}，获得3点属性点`, 'system');
        }
        if (expResult.canAwaken) {
            this.addLog(`✨ 你已达到觉醒条件！可以在角色面板觉醒新的元素系`, 'system');
        }
        if (expResult.newSkills.length > 0) {
            expResult.newSkills.forEach(skillId => {
                const skill = SkillSystem.getSkill(skillId);
                if (skill) {
                    this.addLog(`✨ 学会了新技能：${skill.name}！`, 'system');
                }
            });
        }

        // 显示任务完成奖励
        if (completedQuests && completedQuests.length > 0) {
            completedQuests.forEach(q => {
                this.addLog(`🎉 ${q.message}`, 'system');
                if (q.rewards) {
                    q.rewards.forEach(r => this.addLog(r, 'system'));
                }
            });
        }

        this.rewards = rewards;
        return rewards;
    },

    /**
     * 添加战斗日志
     */
    addLog(text, type = 'normal') {
        this.log.push({ text, type, turn: this.turn });
        // 只保留最近50条
        if (this.log.length > 50) {
            this.log.shift();
        }
    },

    /**
     * 获取战斗状态
     */
    getState() {
        return {
            active: this.active,
            turn: this.turn,
            player: this.player,
            enemy: this.enemy,
            isPlayerTurn: this.isPlayerTurn,
            playerCasting: this.playerCasting,
            enemyCasting: this.enemyCasting,
            result: this.result,
            rewards: this.rewards || null,
            log: this.log.slice(-10) // 最近10条
        };
    },

    /**
     * 结束战斗，清理状态
     */
    endBattle() {
        this.active = false;
        this.playerCasting = null;
        this.enemyCasting = null;
        
        // 同步玩家状态
        Player.hp = this.player.hp;
        Player.mp = this.player.mp;
    }
};
