/**
 * 战斗系统 - 技能释放模块
 * 
 * 从battle.js拆分出的独立技能释放模块
 * 包含：立即释放技能（castSkillImmediate）
 */
    /**
     * 瞬发技能（直接生效）
     */
export function castSkillImmediate(skill, caster, skipTurnEnd = false, skipInterruptCheck = false, mpCostRatio = 1.0) {
        const isPlayer = caster === 'player';
        const casterData = isPlayer ? this.player : this.enemy;
        const targetData = isPlayer ? this.enemy : this.player;

        // v2.9.4: 统一自打断判定（瞬发技能释放时的施法难度check）
        // 适用：玩家瞬发魔法 + 敌方法师瞬发魔法；引导完成后调用时skipInterruptCheck=true跳过
        const isMageEnemy = !isPlayer && (this.enemy.isMage === true || this.enemy.enemyType === 'mage');
        const shouldSelfInterrupt = !skipInterruptCheck && skill.interruptChance && skill.interruptChance > 0
            && (isPlayer || isMageEnemy);

        if (shouldSelfInterrupt) {
            const skillTier = skill.tier || '初阶';
            // 境界检查（仅玩家）
            if (isPlayer && typeof Player !== 'undefined' && !Player.canCastTier(skillTier)) {
                this.addLog(`❌ 境界不足，无法释放${skillTier}魔法！`, 'error');
                return { success: false, interrupted: false, reason: '境界不足' };
            }
            // 施法者上回合是否防御（抗打断）
            const casterDefended = isPlayer ? this.playerDefendedLastTurn : (this.enemyDefendedLastTurn || false);
            // 统一公式计算打断概率（castTime=1因为是瞬发）
            const interruptChance = this.calculateInterruptChance(1, skill, casterData, null, casterDefended);

            // 打断判定
            if (Math.random() < interruptChance) {
                const lostMp = Math.floor(skill.mpCost * 0.5);
                casterData.mp = Math.max(0, casterData.mp - lostMp);
                if (isPlayer) {
                    this.addLog(`💥 施法被打断！${skill.name} 释放失败，损失 ${lostMp} MP（打断概率 ${(interruptChance*100).toFixed(0)}%）`, 'interrupt');
                    // 红色闪烁反馈
                    const battleScreen = document.getElementById('battle-screen');
                    if (battleScreen) {
                        const flash = document.createElement('div');
                        flash.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,50,50,0.4);z-index:9999;pointer-events:none;animation:flashRed 0.5s ease-out;';
                        battleScreen.appendChild(flash);
                        setTimeout(() => flash.remove(), 500);
                    }
                } else {
                    this.addLog(`💥 ${this.enemy.name} 的 ${skill.name} 施法失败！（打断概率 ${(interruptChance*100).toFixed(0)}%）`, 'interrupt');
                }
                return { success: false, interrupted: true, reason: '自打断', interruptChance: interruptChance };
            } else if (interruptChance > 0.1 && isPlayer) {
                this.addLog(`✨ 施法成功！${skill.name}（打断概率 ${(interruptChance*100).toFixed(0)}%）`, 'cast');
            }
            // 释放后重置防御状态
            if (isPlayer) this.playerDefendedLastTurn = false;
            else this.enemyDefendedLastTurn = false;

            // 高阶魔法全屏特效
            if (skill.tier === '高阶' || skill.tier === '超阶') {
                this.triggerHighTierEffect(skill);
            }
            // v2.9.6: 中阶魔法元素色闪光（轻量级，不震屏）
            else if (skill.tier === '中阶' && typeof document !== 'undefined') {
                const elemColors = {
                    fire: '#ff6644', ice: '#66aaff', thunder: '#ffdd44',
                    wind: '#88ffcc', earth: '#aa8844', water: '#66bbff',
                    light: '#ffffcc', dark: '#aa66ff', heal: '#66ffaa',
                    plant: '#66dd44', summon: '#cc9966'
                };
                const color = elemColors[skill.element] || '#ffffff';
                const flash = document.createElement('div');
                flash.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle at center, ${color}40 0%, ${color}15 40%, transparent 70%);z-index:9997;pointer-events:none;animation:highTierFlash 0.6s ease-out forwards;`;
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 700);
            }
        }

        // 消耗MP
        // 消耗MP（天赋可减少消耗；引导完成时mpCostRatio=0.5，只扣剩余部分）
        let actualMpCost = skill.mpCost;
        if (isPlayer && this.player.mpCostReduction) {
            actualMpCost = Math.max(0, Math.floor(skill.mpCost * (1 - this.player.mpCostReduction)));
        }
        // 连段MP减少（comboMpReduction：连击时第二段及以后MP消耗降低）
        if (isPlayer && this.player.talentEffects && this.player.talentEffects.comboMpReduction) {
            const comboReduction = this.player.talentEffects.comboMpReduction;
            if ((this.player.comboCount || 0) > 0) {
                actualMpCost = Math.max(0, Math.floor(actualMpCost * (1 - comboReduction)));
            }
        }
        // v2.9.4: 引导完成时只扣剩余50%（预付款已在引导开始时扣除）
        actualMpCost = Math.floor(actualMpCost * mpCostRatio);
        casterData.mp -= actualMpCost;

        // v0.86.0: 元素能量系统
        let elementBurst = false;  // 是否触发元素爆发
        if (isPlayer && skill.type === 'damage') {
            const tier = skill.tier || '初阶';
            const isBasic = tier === '初阶';
            
            if (this.elementEnergy >= this.elementEnergyMax) {
                // 能量满时，下一个伤害技能触发爆发
                elementBurst = true;
                this.elementEnergy = 0;
                // 返还一半MP消耗
                casterData.mp += Math.floor(actualMpCost / 2);
                this.addLog(`⚡ 元素爆发！${skill.name} 伤害+50%、MP消耗减半、必定暴击！`, 'crit');
            } else if (isBasic) {
                // 初阶伤害技能积累1点能量
                this.elementEnergy = Math.min(this.elementEnergyMax, this.elementEnergy + 1);
                if (this.elementEnergy === this.elementEnergyMax) {
                    this.addLog(`✨ 元素能量已满！下一个伤害技能将触发爆发！`, 'element');
                }
            }
        }

        // 记录玩家使用过的元素系（用于经验分配）
        if (isPlayer && skill.element && skill.element !== 'neutral') {
            this.usedElements.add(skill.element);
        }

        // v2.2.0: 天赋资源积累（根据技能元素）
        if (isPlayer && typeof TalentCombatSystem !== 'undefined' && skill.type === 'damage') {
            const element = skill.element;
            const te = this.player.talentEffects || {};
            if (element === 'fire') {
                const gain = te.fireEnergyGain || 1;
                const max = te.fireEnergyMax || 10;
                const reachedMax = TalentCombatSystem.addEnergy('fire', gain, max);
                // v2.2.0: 燃点满层自动爆炸
                if (reachedMax && te.fireExplodeOnMax) {
                    // v2.3.0: 火+风组合 - 疾风状态下爆炸伤害+50%
                    let windBonus = 1;
                    if (te.windStreakOnDodge && TalentCombatSystem.hasWindStreak()) {
                        windBonus = 1.5;
                        this.addLog(`🔥💨 火焰风暴！疾风强化爆炸！`, 'crit');
                    }
                    const explodeDmg = Math.floor(this.player.attack * (te.fireExplodeDamage || 0.80) * (te.fireExplodeBonus || 1) * windBonus);
                    this.addLog(`🔥 燃点已满！触发烈焰爆炸！`, 'crit');
                    this.applyDamage(this.enemy, { amount: explodeDmg, element: 'fire', isCrit: te.fireExplodeCrit || false, isMiss: false }, this.player);
                    // 爆炸后保留部分燃点（分支效果）
                    const keep = te.fireExplodeKeep || 0;
                    TalentCombatSystem.state.fireEnergy = keep;
                }
                // v2.4.0: 火+土组合 - 熔岩：火系攻击附加灼烧
                if (te.earthEnergyGain && !this.enemy.statusEffects.some(e => e.type === 'burn')) {
                    this.applyStatusEffects(this.enemy, [{
                        type: 'burn', name: '灼烧', duration: 3,
                        damagePerTurn: Math.floor(this.player.attack * 0.1)
                    }], true);
                    this.addLog(`🔥🪨 熔岩！目标被灼烧！`, 'element');
                }
            } else if (element === 'thunder') {
                const gain = 2;
                const max = 6;
                const reachedMax = TalentCombatSystem.addEnergy('thunder', gain, max);
                // v2.2.0: 电荷满层触发连锁闪电
                if (reachedMax) {
                    const chainCount = te.thunderChainTargets || 2;
                    const chainRatio = te.thunderChainRatio || 0.6;
                    let chainDmg = Math.floor(this.player.attack * chainRatio);
                    this.addLog(`⚡ 电荷已满！触发连锁闪电！`, 'crit');
                    for (let i = 0; i < chainCount; i++) {
                        if (i > 0) chainDmg = Math.floor(chainDmg * 0.7);
                        this.applyDamage(this.enemy, { amount: chainDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                        this.addLog(`⚡ 连锁闪电第${i+1}段！造成 ${chainDmg} 点伤害！`, 'element');
                    }
                    TalentCombatSystem.resetEnergy('thunder');
                }
            } else if (element === 'dark') {
                // v2.2.0: 暗系诅咒叠加
                if (!this.enemy.curseStacks) this.enemy.curseStacks = 0;
                this.enemy.curseStacks = Math.min(te.curseMax || 5, this.enemy.curseStacks + 1);
                this.addLog(`🌑 诅咒叠加 ${this.enemy.curseStacks}/${te.curseMax || 5}层！`, 'element');
                // 满层引爆
                if (this.enemy.curseStacks >= (te.curseMax || 5)) {
                    const curseDmg = Math.floor(this.player.attack * 0.5 * this.enemy.curseStacks);
                    this.addLog(`🌑 诅咒满层！引爆造成 ${curseDmg} 点伤害！`, 'crit');
                    this.applyDamage(this.enemy, { amount: curseDmg, element: 'dark', isCrit: false, isMiss: false, trueDamage: true }, this.player);
                    this.enemy.curseStacks = 0;
                }
            } else if (element === 'water') {
                // v2.4.0: 植物+水组合 - 滋养：水系技能使植物生长+2层
                if (te.plantGrowth && this.player.elements && this.player.elements.includes('plant')) {
                    if (!this.player.plantGrowthStacks) this.player.plantGrowthStacks = 0;
                    this.player.plantGrowthStacks = Math.min(te.plantGrowthMax || 8, this.player.plantGrowthStacks + 2);
                    this.addLog(`🌿💧 滋养！水系技能使植物生长+2（${this.player.plantGrowthStacks}/${te.plantGrowthMax || 8}）`, 'element');
                }
            }
            // 其他系的资源积累在各自的天赋效果中处理
        }
        
        // 发布技能释放事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.SKILL_CAST, {
                skill: skill,
                caster: caster,
                isPlayer: isPlayer,
                casterData: casterData
            });
        }

        if (skill.type === 'damage') {
            // 伤害技能（含攻击者状态修正）
            const casterMods = this.getStatusModifiers(casterData);
            const effectiveAttack = casterData.attack + casterMods.attackMod;

            // 基础伤害计算：支持power（攻击力倍率）和baseDamage+damageMultiplier两种方式
            let baseDamage;
            if (skill.power) {
                // power方式：基础伤害 = 攻击力 × power倍率
                baseDamage = effectiveAttack * skill.power;
            } else {
                // baseDamage方式：基础伤害 = 固定值 + 攻击力 × 倍率
                baseDamage = (skill.baseDamage || 0) + effectiveAttack * (skill.damageMultiplier || 1.0);
            }
            
            // 精神力加成
            const spirit = casterData.spirit || 10;
            const spiritBonus = 1 + spirit * 0.005;
            
            // 元素克制
            const elementBonus = this.getElementBonus(skill.element, targetData.elements?.[0] || 'neutral');
            
            // 天赋加成（仅玩家）
            let talentBonus = 1.0;
            let talentSkillLevelBonus = 0;
            if (isPlayer && typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
                const talentEffects = Player.getElementTalentEffects(skill.element);
                if (talentEffects.damageBonus) {
                    talentBonus = 1 + talentEffects.damageBonus;
                }
                // 天赋技能等级加成（如烈焰领主：技能等级+1，伤害+15%）
                if (talentEffects.skillLevelBonus) {
                    talentSkillLevelBonus = talentEffects.skillLevelBonus * 0.15;
                }
            }

            // 灵种加成（仅玩家）
            let seedBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && typeof SpiritSeedSystem !== 'undefined') {
                const seedEffects = Player.getElementSpiritSeedEffects(skill.element);
                if (seedEffects.damageBonus) {
                    seedBonus = 1 + seedEffects.damageBonus;
                }
            }

            // 技能等级加成（仅玩家）
            let skillLevelBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && typeof SkillLevelSystem !== 'undefined') {
                skillLevelBonus = Player.getSkillDamageBonus(skill.id);
            }

            // 各系等级加成（玩家和NPC法师）：魔法威力 = 基础 × (1 + 该系等级×0.05)
            // v2.9.3: 对齐玩家与NPC法师的战斗逻辑，NPC法师也享受系别等级加成
            let elementLevelBonus = 1.0;
            if (skill.element) {
                let elLevel = 0;
                if (isPlayer && typeof Player !== 'undefined') {
                    // 玩家：使用Player.getElementLevel
                    elLevel = Player.getElementLevel(skill.element);
                } else if (casterData.id && typeof Game !== 'undefined' && typeof Game.getNPCElementLevel === 'function') {
                    // NPC法师/敌人法师：使用Game.getNPCElementLevel
                    elLevel = Game.getNPCElementLevel(casterData.id, skill.element);
                }
                if (elLevel > 0) {
                    elementLevelBonus = 1 + elLevel * 0.05;
                }
            }

            // v0.8.27: 召唤兽在场时玩家技能伤害加成
            let summonMasterSkillBonus = 1.0;
            if (isPlayer && this.summon && this.player.talentEffects?.summonMasterDamageBonus) {
                summonMasterSkillBonus = 1 + this.player.talentEffects.summonMasterDamageBonus;
            }
            // v0.8.27: 对有debuff敌人增伤
            let debuffedSkillBonus = 1.0;
            if (isPlayer && this.player.talentEffects?.debuffedDamageBonus) {
                const hasDebuff = targetData.statusEffects.some(e =>
                    ['burn','freeze','frozen','stun','slow','poison','curse','paralyze','weakness','bleed','bind','blind','fear','shock','attack_down','defense_down'].includes(e.type)
                );
                if (hasDebuff) debuffedSkillBonus = 1 + this.player.talentEffects.debuffedDamageBonus;
            }

            // v0.9.7: 体力不再影响技能伤害，staminaSkillBonus始终为1.0
            let staminaSkillBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && Player.getStaminaEfficiency) {
                staminaSkillBonus = Player.getStaminaEfficiency().battleDamage;
            }

            // 技能特殊属性：必中、额外暴击率
            let skillCritRate = casterData.critRate || 0.05;
            let skillHitRate = skill.hitRate || 0.9;
            if (skill.guaranteedHit) {
                skillHitRate = 1.0;
            }
            if (skill.critBonus) {
                skillCritRate += skill.critBonus;
            }
            // v0.86.0: 元素爆发必暴击
            if (elementBurst) {
                skillCritRate = 1.0;
            }

            // 多段攻击支持
            const hitCount = skill.hitCount || 1;
            let totalDamage = 0;
            let totalCritCount = 0;
            let totalMissCount = 0;
            let lastDamage = null;

            // 无视防御支持
            let effectiveDefense = targetData.defense;
            if (skill.ignoreDefense) {
                effectiveDefense = Math.floor(targetData.defense * (1 - skill.ignoreDefense));
            }

            for (let hit = 0; hit < hitCount; hit++) {
                const damage = this.calculateDamage(
                    baseDamage * spiritBonus * elementBonus * talentBonus * seedBonus * skillLevelBonus * elementLevelBonus * (1 + talentSkillLevelBonus) * summonMasterSkillBonus * debuffedSkillBonus * staminaSkillBonus * (elementBurst ? 1.5 : 1.0),
                    effectiveDefense,
                    1.0,
                    skillCritRate,
                    skillHitRate,
                    skill.element,
                    targetData.elements?.[0] || 'neutral',
                    targetData,
                    casterData
                );

                if (!damage.isMiss) {
                    this.applyDamage(targetData, damage, casterData);
                    totalDamage += damage.amount;
                    if (damage.isCrit) totalCritCount++;
                } else {
                    totalMissCount++;
                }
                lastDamage = damage;
            }

            // 使用第一段伤害的结果用于后续显示（但总伤害是累加的）
            const damage = lastDamage;
            damage.amount = totalDamage;
            damage.isCrit = totalCritCount > 0;
            damage.hitCount = hitCount;
            damage.critCount = totalCritCount;
            damage.missCount = totalMissCount;

            // 技能吸血效果（基于总伤害）
            if (skill.lifesteal && skill.lifesteal > 0 && totalDamage > 0) {
                let healAmount = Math.floor(totalDamage * skill.lifesteal);
                const healMultiplier = this.getHealingMultiplier(casterData);
                healAmount = Math.floor(healAmount * healMultiplier);
                if (healAmount > 0 && casterData.hp < casterData.maxHp) {
                    casterData.hp = Math.min(casterData.maxHp, casterData.hp + healAmount);
                    const casterName = isPlayer ? '你' : this.enemy.name;
                    this.addLog(`${casterName} 吸取了 ${healAmount} 点生命！`, 'heal');
                }
            }

            // 天赋吸血：技能也能触发
            if (isPlayer && totalDamage > 0 && this.player.talentEffects && this.player.talentEffects.lifesteal) {
                const lsRate = this.player.talentEffects.lifesteal;
                if (lsRate > 0 && (!skill.lifesteal || skill.lifesteal < lsRate)) {
                    let healAmount = Math.floor(totalDamage * lsRate);
                    const healMultiplier = this.getHealingMultiplier(casterData);
                    healAmount = Math.floor(healAmount * healMultiplier);
                    if (healAmount > 0 && casterData.hp < casterData.maxHp) {
                        casterData.hp = Math.min(casterData.maxHp, casterData.hp + healAmount);
                        this.addLog(`🩸 吸血恢复 ${healAmount} 点生命！`, 'heal');
                    }
                }
            }

            // v2.9.5: 植物系天赋吸血（plantLifesteal）- 仅植物系技能命中触发
            if (isPlayer && totalDamage > 0 && skill.element === 'plant' && this.player.talentEffects && this.player.talentEffects.plantLifesteal) {
                const lsRate = this.player.talentEffects.plantLifesteal;
                if (lsRate > 0) {
                    let healAmount = Math.floor(totalDamage * lsRate);
                    const healMultiplier = this.getHealingMultiplier(casterData);
                    healAmount = Math.floor(healAmount * healMultiplier);
                    if (healAmount > 0 && casterData.hp < casterData.maxHp) {
                        casterData.hp = Math.min(casterData.maxHp, casterData.hp + healAmount);
                        this.addLog(`🌿 共生汲取！恢复 ${healAmount} 点生命！`, 'heal');
                    }
                }
            }

            // 自身负面效果（如狂暴冲锋后防御降低）
            if (skill.selfStatusEffects && totalMissCount < hitCount) {
                this.applyStatusEffects(casterData, skill.selfStatusEffects, isPlayer);
            }

            // 火地面（fireGround）：火系技能命中后概率留下燃烧地面
            if (isPlayer && skill.element === 'fire' && totalDamage > 0 && this.player.talentEffects && this.player.talentEffects.fireGround) {
                const te = this.player.talentEffects;
                const groundChance = te.fireGround === true ? 1.0 : te.fireGround;
                if (Math.random() < groundChance) {
                    const groundDmg = Math.floor(this.player.magicPower * (te.fireGroundDamage || 0.10));
                    this.addStatusEffect(this.enemy, {
                        type: 'burn', name: '火地面', element: 'fire',
                        duration: te.fireGroundDuration || 3,
                        dotDamage: groundDmg,
                        chance: 1.0
                    });
                    this.addLog(`🔥 地面燃起火焰！持续灼烧 ${this.enemy.name}！`, 'element');
                }
            }
            // 火雨（fireRain）：每隔数回合天降火雨
            if (isPlayer && skill.element === 'fire' && this.player.talentEffects && this.player.talentEffects.fireRain) {
                const te = this.player.talentEffects;
                this._fireRainTimer = (this._fireRainTimer || 0) + 1;
                if (this._fireRainTimer >= (te.fireRainInterval || 2)) {
                    this._fireRainTimer = 0;
                    const rainDmg = Math.floor(this.player.magicPower * (te.fireRainDamage || 0.2));
                    this.applyDamage(this.enemy, { amount: rainDmg, element: 'fire', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🔥 火雨天降！对 ${this.enemy.name} 造成 ${rainDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', rainDmg, 'magic');
                }
            }
            
            // 陨石（meteor）：土系技能召唤陨石，延迟数回合后落下
            if (isPlayer && skill.element === 'earth' && this.player.talentEffects && this.player.talentEffects.meteor) {
                const te = this.player.talentEffects;
                this._meteorCountdown = te.meteorInterval || 4;
                this._meteorDamage = te.meteorDamage || 1.2;
                this._meteorStunChance = te.meteorStunChance || 0.5;
                this.addLog(`🪨 陨石正在凝聚，${this._meteorCountdown}回合后落下！`, 'element');
            }

            // 龙卷风（tornado）：风系技能命中后概率召唤龙卷风
            if (isPlayer && skill.element === 'wind' && totalDamage > 0 && this.player.talentEffects && this.player.talentEffects.tornadoChance) {
                const te = this.player.talentEffects;
                if (Math.random() < te.tornadoChance) {
                    const tornadoDmg = Math.floor(this.player.magicPower * (te.tornadoDamage || 0.4));
                    this.applyDamage(this.enemy, { amount: tornadoDmg, element: 'wind', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🌪️ 龙卷风席卷！对 ${this.enemy.name} 造成 ${tornadoDmg} 点风系伤害！`, 'element');
                    this.showDamageNumber('enemy', tornadoDmg, 'magic');
                    // 击退效果：降低敌人攻击力
                    if (te.tornadoKnockback) {
                        this.addStatusEffect(this.enemy, {
                            type: 'attack_down', name: '击退',
                            duration: 2, value: 0.15,
                            icon: '🌪️', desc: '被龙卷风击退，攻击力降低'
                        }, 0, false);
                        this.addLog(`💨 ${this.enemy.name} 被龙卷风击退，攻击力降低！`, 'debuff');
                    }
                }
            }

            // 连续暴击记录（仅玩家，用于幸运儿成就）
            if (isPlayer && typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                if (damage.isCrit) {
                    this.consecutiveCrits++;
                    if (this.consecutiveCrits >= 3 && !WorldState.hasAchievement('lucky_dog')) {
                        const achData = DataAchievements['lucky_dog'];
                        if (achData) {
                            WorldState.unlockAchievement('lucky_dog', achData);
                        }
                    }
                } else {
                    this.consecutiveCrits = 0;
                }
            }
            
            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = isPlayer ? this.enemy.name : '你';
            
            // 元素克制效果显示
            let elementEffectText = '';
            if (damage.elementEffect === 'super') {
                elementEffectText = '（效果拔群！）';
            } else if (damage.elementEffect === 'weak') {
                elementEffectText = '（效果不佳...）';
            } else if (damage.elementEffect === 'resist') {
                elementEffectText = '（被抵抗了）';
            }
            
            // 元素反应文本
            let reactionText = '';
            if (damage.elementReaction) {
                const reactionNames = {
                    vaporize: '蒸发',
                    melt: '融化',
                    overload: '超载',
                    electro: '感电',
                    superconduct: '超导',
                    freeze: '冻结反应',
                    swirl_fire: '扩散火',
                    swirl_water: '扩散水',
                    swirl_thunder: '扩散雷',
                    swirl_ice: '扩散冰',
                    mud: '泥浆',
                    crystallize: '结晶',
                    shatter: '碎冰'
                };
                reactionText = `（${reactionNames[damage.elementReaction]}！）`;
            }
            
            // 多段攻击日志
            let hitText = '';
            if (damage.hitCount && damage.hitCount > 1) {
                const hits = damage.hitCount - damage.missCount;
                hitText = `（${hits}连击`;
                if (damage.critCount > 0) hitText += `，${damage.critCount}次暴击`;
                if (damage.missCount > 0) hitText += `，${damage.missCount}次未命中`;
                hitText += '）';
            }

            this.addLog(`${casterName} 释放了 ${skill.name}，造成 ${damage.amount} 点伤害${damage.isCrit && (!damage.hitCount || damage.hitCount === 1) ? '（暴击！）' : ''}${damage.isMiss && (!damage.hitCount || damage.hitCount === 1) ? '（未命中！）' : ''}${hitText}${elementEffectText}${reactionText}`,
                damage.isCrit ? 'crit' : 'magic');
            
            // 显示浮动伤害数字（至少命中一段才显示）
            if (totalMissCount < hitCount) {
                let dmgType = 'magic';
                if (damage.isCrit) dmgType = 'crit';
                else if (damage.elementEffect === 'super') dmgType = 'counter';
                else if (damage.elementEffect === 'weak') dmgType = 'weakness';

                const target = isPlayer ? 'enemy' : 'player';
                this.showDamageNumber(target, damage.amount, dmgType);
                
                // 施法者攻击动画
                if (typeof UI !== 'undefined' && UI.playAttackAnimation) UI.playAttackAnimation(isPlayer);
                // 目标受击动画
                setTimeout(() => {
                    if (typeof UI !== 'undefined' && UI.playHitAnimation) UI.playHitAnimation(!isPlayer, damage.isCrit);
                }, 200);
            } else if (hitCount > 0 && totalMissCount >= hitCount) {
                // 全部未命中，显示闪避
                const target = isPlayer ? 'enemy' : 'player';
                this.showDamageNumber(target, 0, 'dodge');
            }
            
            // 元素反应：处理状态变化（至少命中一段才触发）
            if (damage.elementReaction && totalMissCount < hitCount && targetData.statusEffects) {
                // 蒸发/感电/冻结都会消耗水状态
                if (damage.elementReaction === 'vaporize' || 
                    damage.elementReaction === 'electro' || 
                    damage.elementReaction === 'freeze') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'wet');
                }
                // 融化/超导消耗冰状态
                if (damage.elementReaction === 'melt' || damage.elementReaction === 'superconduct') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                }
                // 超载消耗雷状态
                if (damage.elementReaction === 'overload') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'electrified' && e.type !== 'paralyze');
                }
                // 感电附加麻痹
                if (damage.elementReaction === 'electro') {
                    const paralyzeEffect = { type: 'paralyze', name: '麻痹', duration: 1, skipTurn: true };
                    targetData.statusEffects.push(paralyzeEffect);
                    this.addLog(`${targetName} 陷入了麻痹状态！`, 'debuff');
                }
                // 冻结反应附加冻结
                if (damage.elementReaction === 'freeze') {
                    const freezeEffect = { type: 'frozen', name: '冻结', duration: 1, skipTurn: true };
                    targetData.statusEffects.push(freezeEffect);
                    this.addLog(`${targetName} 被冻结了！`, 'debuff');
                }
                // 超导降低防御
                if (damage.elementReaction === 'superconduct') {
                    const defDownEffect = { type: 'defense_down', name: '防御降低', duration: 3, defenseMod: -0.2 };
                    targetData.statusEffects.push(defDownEffect);
                    this.addLog(`${targetName} 防御降低了！`, 'debuff');
                }
                // 泥浆减速
                if (damage.elementReaction === 'mud') {
                    const mudEffect = { type: 'slow', name: '泥浆', duration: 2, speedMod: -0.3 };
                    targetData.statusEffects.push(mudEffect);
                    this.addLog(`${targetName} 陷入泥浆，速度降低！`, 'debuff');
                }
                // 结晶产生护盾
                if (damage.elementReaction === 'crystallize') {
                    const shieldAmount = Math.floor(casterData.attack * 0.3);
                    const shieldEffect = { type: 'shield', name: '结晶护盾', value: shieldAmount, duration: 3 };
                    targetData.statusEffects.push(shieldEffect);
                    this.addLog(`${targetName} 获得了 ${shieldAmount} 点结晶护盾！`, 'buff');
                }
                // 碎冰消耗冻结状态
                if (damage.elementReaction === 'shatter') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                    this.addLog(`❄️ 碎冰反应！冻结被打破，造成额外伤害！`, 'magic');
                }
            }
            
            // 发布命中/暴击/闪避/伤害事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                const attacker = isPlayer ? 'player' : 'enemy';
                const target = isPlayer ? 'enemy' : 'player';

                const allMiss = totalMissCount >= hitCount;
                if (allMiss) {
                    BattleEventBus.emit(BattleEvents.MISS, {
                        attacker: attacker,
                        target: target,
                        damageType: 'magic',
                        element: skill.element,
                        skill: skill
                    });
                } else {
                    BattleEventBus.emit(BattleEvents.HIT, {
                        attacker: attacker,
                        target: target,
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'magic',
                        element: skill.element,
                        skill: skill,
                        elementEffect: damage.elementEffect
                    });

                    if (damage.isCrit) {
                        BattleEventBus.emit(BattleEvents.CRIT, {
                            attacker: attacker,
                            target: target,
                            damage: damage.amount,
                            damageType: 'magic',
                            element: skill.element,
                            skill: skill
                        });
                    }

                    BattleEventBus.emit(BattleEvents.DAMAGE, {
                        target: target,
                        attacker: attacker,
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'magic',
                        element: skill.element,
                        skill: skill
                    });
                }
            }

            // 状态效果（至少命中一段才应用）
            if (skill.statusEffects && totalMissCount < hitCount) {
                this.applyStatusEffects(targetData, skill.statusEffects, !isPlayer);
            }
            
            // 灵种特殊效果（仅玩家，至少命中一段才触发）
            if (isPlayer && typeof Player !== 'undefined' && typeof SpiritSeedSystem !== 'undefined' && totalMissCount < hitCount) {
                this.applySpiritSeedEffects(targetData, skill.element);
            }

        } else if (skill.type === 'heal') {
            // 治疗技能
            let healAmount;
            if (skill.healPercent) {
                // 按百分比恢复
                healAmount = Math.floor(casterData.maxHp * skill.healPercent);
            } else {
                // 固定数值恢复
                healAmount = Math.floor(skill.baseHeal * (1 + casterData.spirit * 0.01));
            }
            // 治疗目标：self类型治疗自己，否则治疗targetData
            const healTarget = (skill.targetType === 'self') ? casterData : targetData;
            // 应用治疗降低效果（如坏血）
            const healMultiplier = this.getHealingMultiplier(healTarget);
            let actualHeal = Math.floor(healAmount * healMultiplier);
            // 天赋治疗加成
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healBonus) {
                actualHeal = Math.floor(actualHeal * (1 + this.player.talentEffects.healBonus));
            }
            // 潮汐涨潮治疗加成
            if (isPlayer && this.player.tideHealBonus) {
                actualHeal = Math.floor(actualHeal * (1 + this.player.tideHealBonus));
            }
            // 治疗额外HP（healExtraHp）：额外治疗5%最大HP
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healExtraHp && healTarget === this.player) {
                actualHeal += Math.floor(this.player.maxHp * this.player.talentEffects.healExtraHp);
            }
            // 天赋治疗暴击
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healCritRate) {
                if (Math.random() < this.player.talentEffects.healCritRate) {
                    const critMult = this.player.talentEffects.healCritDouble ? 2 : 1.5;
                    actualHeal = Math.floor(actualHeal * critMult);
                    this.addLog(`💚 治疗暴击！`, 'heal');
                }
            }
            healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + actualHeal);

            // v1.5.6: 祝福层数机制（blessingStack）- 治疗时叠加祝福
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.blessingStack && healTarget === this.player) {
                const te = this.player.talentEffects;
                const maxBlessing = te.blessingMax || 3;
                if (!this.player._blessingStacks) this.player._blessingStacks = 0;
                this.player._blessingStacks = Math.min(this.player._blessingStacks + 1, maxBlessing);
                const healBonus = te.blessingHealBonus || 0.05;
                this.addLog(`✨ 祝福叠加 ${this.player._blessingStacks}/${maxBlessing}（治疗+${Math.floor(healBonus*100)}%）`, 'heal');
                // 满层生命绽放（blessingBloomOnMax）
                if (this.player._blessingStacks >= maxBlessing && te.blessingBloomOnMax) {
                    const bloomHeal = Math.floor(this.player.maxHp * (te.bloomHeal || 0.3));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + bloomHeal);
                    this.addLog(`✨ 生命绽放！恢复 ${bloomHeal} 点生命！`, 'heal');
                    // 绽放净化（bloomPurify）
                    if (te.bloomPurify) {
                        const beforeCount = this.player.statusEffects.length;
                        this.player.statusEffects = this.player.statusEffects.filter(e => !['burn','poison','bleed','slow','curse','wet','shock'].includes(e.type));
                        const removed = beforeCount - this.player.statusEffects.length;
                        if (removed > 0) this.addLog(`✨ 绽放净化！清除 ${removed} 个负面状态！`, 'heal');
                    }
                    this.player._blessingStacks = 0;
                }
                // 满层圣恩（blessingGraceOnMax）
                if (this.player._blessingStacks >= maxBlessing && te.blessingGraceOnMax) {
                    const graceDuration = te.graceDuration || 3;
                    this.addStatusEffect(this.player, {
                        type: 'grace', name: '圣恩', duration: graceDuration,
                        attackBonus: te.graceAtkBonus || 0.2,
                        defenseBonus: te.graceDefBonus || 0.2,
                        speedBonus: te.graceSpeedBonus || 0.1
                    });
                    this.addLog(`✨ 圣恩降临！全属性提升 ${graceDuration} 回合！`, 'buff');
                    this.player._blessingStacks = 0;
                }
            }

            // 天赋：治疗转护盾（healShield：治疗量20%转为护盾）
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healShield && healTarget === this.player) {
                const shieldRatio = this.player.talentEffects.healShield;
                const shieldDuration = this.player.talentEffects.healShieldDuration || 2;
                const shieldAmount = Math.floor(actualHeal * shieldRatio);
                if (shieldAmount > 0) {
                    const existingShield = healTarget.statusEffects.find(e => e.type === 'shield');
                    if (existingShield) {
                        existingShield.value += shieldAmount;
                    } else {
                        this.addStatusEffect(healTarget, { type: 'shield', name: '治疗护盾', value: shieldAmount, duration: shieldDuration });
                    }
                    this.addLog(`💚 治疗转化为 ${shieldAmount} 点护盾！`, 'heal');
                }
            }
            // 天赋：生命之种（lifeSeed）：治疗时种下种子，延迟后爆发治疗
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.lifeSeed && healTarget === this.player) {
                const delay = this.player.talentEffects.lifeSeedDelay || 3;
                const healRatio = this.player.talentEffects.lifeSeedHeal || 0.15;
                healTarget._lifeSeedDelay = delay;
                healTarget._lifeSeedHeal = Math.floor(healTarget.maxHp * healRatio);
                this.addLog(`🌱 生命之种下！${delay}回合后爆发治疗！`, 'heal');
            }
            // 天赋：治疗时净化（purifyOnHealChance）
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.purifyOnHealChance && healTarget === this.player) {
                const cleansable = healTarget.statusEffects.filter(e =>
                    ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear'].includes(e.type) && !e.unpurgeable
                );
                if (cleansable.length > 0 && Math.random() < this.player.talentEffects.purifyOnHealChance) {
                    healTarget.statusEffects = healTarget.statusEffects.filter(e => !cleansable.includes(e));
                    this.addLog(`✨ 治疗净化了 ${cleansable.length} 个负面状态！`, 'heal');
                }
            }
            // 群体治疗（aoeHeal）：无队友时治疗召唤兽+恢复MP
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.aoeHeal) {
                const aoeRatio = this.player.talentEffects.aoeHealRatio || 0.5;
                const aoeHealAmount = Math.floor(actualHeal * aoeRatio);
                // 治疗召唤兽
                if (this.summon && this.summon.hp > 0 && this.summon.hp < this.summon.maxHp) {
                    const summonHeal = Math.min(aoeHealAmount, this.summon.maxHp - this.summon.hp);
                    this.summon.hp += summonHeal;
                    this.addLog(`💚 ${this.summon.name} 也受到了 ${summonHeal} 点治疗！`, 'heal');
                }
                // 恢复MP
                const mpRecover = Math.floor(this.player.maxMp * aoeRatio * 0.5);
                if (mpRecover > 0 && this.player.mp < this.player.maxMp) {
                    const actualMp = Math.min(mpRecover, this.player.maxMp - this.player.mp);
                    this.player.mp += actualMp;
                    this.addLog(`💙 群体治疗恢复了 ${actualMp} 点MP！`, 'heal');
                }
                // 全体净化（purifyAll）
                if (this.player.talentEffects.purifyAll) {
                    const cleansable = this.player.statusEffects.filter(e =>
                        ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear', 'weakness'].includes(e.type) && !e.unpurgeable
                    );
                    if (cleansable.length > 0) {
                        this.player.statusEffects = this.player.statusEffects.filter(e => !cleansable.includes(e));
                        this.addLog(`✨ 全体净化！清除了 ${cleansable.length} 个负面状态！`, 'heal');
                    }
                }
            }
            // 天赋：全净化（purifyAll）：治疗时净化所有负面
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.purifyAll && healTarget === this.player) {
                const cleansable = healTarget.statusEffects.filter(e =>
                    ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear'].includes(e.type) && !e.unpurgeable
                );
                if (cleansable.length > 0) {
                    healTarget.statusEffects = healTarget.statusEffects.filter(e => !cleansable.includes(e));
                    this.addLog(`✨ 圣光净化！清除所有 ${cleansable.length} 个负面状态！`, 'heal');
                    // 净化回血（purifyHeal）：每个被净化的状态回血
                    if (this.player.talentEffects.purifyHeal) {
                        const healPer = this.player.talentEffects.purifyHeal;
                        const totalHeal = Math.floor(this.player.maxHp * healPer * cleansable.length);
                        healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + totalHeal);
                        this.addLog(`✨ 净化恢复 ${totalHeal} 点生命！`, 'heal');
                    }
                    // 净化攻击提升（purifyAtkDown → 净化后自身攻击提升）
                    if (this.player.talentEffects.purifyAtkBuff) {
                        this.addStatusEffect(this.player, {
                            type: 'attack_up', name: '净化之力', duration: 2,
                            atkMod: this.player.talentEffects.purifyAtkBuff
                        });
                    }
                }
            }
            // 天赋：祝福（blessAtkBonus/blessDefBonus）：治疗时获得攻防加成
            if (isPlayer && this.player.talentEffects && healTarget === this.player) {
                if (this.player.talentEffects.blessAtkBonus) {
                    this.addStatusEffect(this.player, {
                        type: 'attack_up', name: '祝福攻击', duration: this.player.talentEffects.blessDuration || 2,
                        atkMod: this.player.talentEffects.blessAtkBonus
                    });
                }
                if (this.player.talentEffects.blessDefBonus) {
                    this.addStatusEffect(this.player, {
                        type: 'defense_up', name: '祝福防御', duration: this.player.talentEffects.blessDuration || 2,
                        defMod: this.player.talentEffects.blessDefBonus
                    });
                }
            }

            // 天赋：治疗时回MP
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healMpRestore && healTarget === this.player) {
                const mpRestore = Math.floor(this.player.maxMp * this.player.talentEffects.healMpRestore);
                if (mpRestore > 0 && this.player.mp < this.player.maxMp) {
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRestore);
                    this.addLog(`💙 治疗恢复 ${mpRestore} 点MP！`, 'heal');
                }
            }
            // 天赋：治疗转伤害（healToDamage）：治疗量10%对敌人造成伤害
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healToDamage && healTarget === this.player) {
                const dmg = Math.floor(actualHeal * this.player.talentEffects.healToDamage);
                if (dmg > 0 && this.enemy.hp > 0) {
                    this.applyDamage(this.enemy, { amount: dmg, element: 'light', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`✨ 圣光惩戒！对 ${this.enemy.name} 造成 ${dmg} 点伤害！`, 'element');
                }
            }

            // 治疗技能的附加状态效果（如净化、复苏）
            if (skill.statusEffects) {
                const isHealTargetPlayer = healTarget === this.player;
                this.applyStatusEffects(healTarget, skill.statusEffects, isHealTargetPlayer);
            }

            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = skill.targetType === 'self' ? casterName : (isPlayer ? this.enemy.name : '你');
            if (healMultiplier < 1) {
                this.addLog(`${casterName} 使用 ${skill.name}，${targetName} 恢复了 ${actualHeal} 点生命（治疗效果降低${Math.round((1-healMultiplier)*100)}%）`, 'heal');
            } else {
                this.addLog(`${casterName} 使用 ${skill.name}，${targetName} 恢复了 ${actualHeal} 点生命`, 'heal');
            }
            
            // 发布治疗事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.HEAL, {
                    amount: healAmount,
                    skill: skill,
                    caster: caster,
                    isPlayer: isPlayer,
                    targetIsSelf: skill.targetType === 'self'
                });
            }

        } else if (skill.type === 'buff') {
            // 增益技能
            if (skill.statusEffects) {
                // 处理护盾值：基于最大HP百分比计算
                if (skill.shieldValue) {
                    skill.statusEffects.forEach(effect => {
                        if (effect.type === 'shield') {
                            effect.value = Math.floor(casterData.maxHp * skill.shieldValue);
                        }
                    });
                }
                if (skill.element === 'summon' && isPlayer && this.summon) {
                    // 召唤系增益应用到召唤兽
                    this.applyStatusEffects(this.summon, skill.statusEffects, !isPlayer);
                    this.addLog(`${this.summon.icon} ${this.summon.name} 受到了 ${skill.name} 的效果！`, 'buff');
                } else {
                    this.applyStatusEffects(casterData, skill.statusEffects, isPlayer);
                }
            }
            // 自身buff同时对敌人施加debuff（如妖魔领域）
            if (skill.selfBuff && skill.targetType === 'enemy') {
                this.applyStatusEffects(casterData, skill.selfBuff, isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            if (skill.element !== 'summon') {
                this.addLog(`${casterName} 使用了 ${skill.name}`, 'buff');
            }

        } else if (skill.type === 'debuff') {
            // 减益技能（对敌人施加负面状态）
            if (skill.statusEffects) {
                this.applyStatusEffects(targetData, skill.statusEffects, !isPlayer);
            }
            // 同时给自己加buff（如妖魔领域）
            if (skill.selfBuff) {
                this.applyStatusEffects(casterData, skill.selfBuff, isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = isPlayer ? this.enemy.name : '你';
            this.addLog(`${casterName} 对 ${targetName} 释放了 ${skill.name}`, 'debuff');

        } else if (skill.type === 'summon') {
            // 召唤技能
            if (isPlayer && skill.id === 'summon_beast') {
                if (this.summon) {
                    this.addLog(`已有召唤兽 ${this.summon.name}，先收回再召唤！`, 'system');
                    casterData.mp += skill.mpCost; // 退还MP
                    return { success: false };
                }
                // 首次召唤：随机契约一只召唤兽
                if (!Player.summonData) {
                    const beastData = typeof getRandomStarterBeast === 'function' ? getRandomStarterBeast() : DataSummonBeasts.shadow_wolf;
                    const result = Player.contractSummonBeast(beastData);
                    if (result.success) {
                        this.addLog(result.message, 'evolution');
                    }
                }
                // 获取当前形态数据（考虑进化）
                const sd = Player.summonData;
                const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                const baseStats = currentData ? currentData.effectiveStats : {
                    maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
                };
                // 等级和忠诚加成
                const levelBonus = 1 + (sd.level - 1) * 0.15;
                const loyaltyBonus = 1 + (sd.loyalty - 50) / 200;
                let summonMaxHp = Math.floor(baseStats.maxHp * levelBonus * loyaltyBonus);
                let summonAtk = Math.floor(baseStats.attack * levelBonus * loyaltyBonus);
                let summonDef = Math.floor(baseStats.defense * levelBonus * loyaltyBonus);
                let summonSpd = Math.floor(baseStats.speed * levelBonus * loyaltyBonus);
                let duration = 5;

                // v0.8.27: 召唤系天赋加成
                const te = this.player.talentEffects;
                if (te) {
                    // 召唤兽等级加成
                    if (te.summonLevelBonus) {
                        const bonusLevelMult = 1 + te.summonLevelBonus * 0.15;
                        summonAtk = Math.floor(summonAtk * bonusLevelMult);
                        summonDef = Math.floor(summonDef * bonusLevelMult);
                        summonMaxHp = Math.floor(summonMaxHp * bonusLevelMult);
                        summonSpd = Math.floor(summonSpd * bonusLevelMult);
                    }
                    // 全属性加成
                    if (te.summonAllStats) {
                        summonAtk = Math.floor(summonAtk * (1 + te.summonAllStats));
                        summonDef = Math.floor(summonDef * (1 + te.summonAllStats));
                        summonMaxHp = Math.floor(summonMaxHp * (1 + te.summonAllStats));
                        summonSpd = Math.floor(summonSpd * (1 + te.summonAllStats));
                    }
                    // HP加成
                    if (te.summonHpBonus) {
                        summonMaxHp = Math.floor(summonMaxHp * (1 + te.summonHpBonus));
                    }
                    // 伤害加成（直接加在攻击上）
                    if (te.summonDamageBonus) {
                        summonAtk = Math.floor(summonAtk * (1 + te.summonDamageBonus));
                    }
                    // 继承玩属性
                    if (te.inheritStats) {
                        summonAtk += Math.floor(this.player.attack * te.inheritStats);
                        summonDef += Math.floor(this.player.defense * te.inheritStats);
                    }
                    // 继承玩家HP
                    if (te.summonInheritHp) {
                        summonMaxHp += Math.floor(this.player.maxHp * te.summonInheritHp);
                    }
                    // 持续时间加成
                    if (te.summonDurationBonus) {
                        duration += te.summonDurationBonus;
                    }
                }

                this.summon = {
                    id: sd.id,
                    baseId: sd.baseId || sd.id,
                    name: sd.name,
                    icon: sd.icon,
                    evolutionStage: sd.evolutionStage || 0,
                    level: sd.level + (te?.summonLevelBonus || 0),
                    loyalty: sd.loyalty,
                    maxHp: summonMaxHp,
                    hp: summonMaxHp,
                    attack: summonAtk,
                    defense: summonDef,
                    speed: summonSpd,
                    remainingDuration: duration,
                    buffs: [],
                    statusEffects: [],
                    expGained: 0,
                    critRate: te?.summonCritRate || 0.05,
                    critDamage: 1.5 + (te?.summonCritDamage || 0)
                };
                this.addLog(`你召唤了 ${sd.icon} ${sd.name}（Lv.${sd.level}，忠诚${sd.loyalty}）！（持续${duration}回合）`, 'magic');
                
                // 发布召唤事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.SUMMON, {
                        caster: 'player',
                        summon: this.summon,
                        skill: skill
                    });
                }
            }

        } else if (skill.type === 'special') {
            // 特殊技能（如召唤回收）
            if (isPlayer && skill.id === 'summon_return') {
                if (this.summon) {
                    const mpRecover = Math.floor(this.summon.hp * 0.5);
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRecover);
                    this.addLog(`你收回了 ${this.summon.name}，恢复了 ${mpRecover} 点魔法值`, 'magic');
                    this.summon = null;
                } else {
                    this.addLog('当前没有召唤兽！', 'system');
                    return { success: false };
                }
            }
        }

        // 天赋经验：玩家释放技能增加对应系天赋经验
        if (isPlayer && typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
            const talentExp = 3; // 每次释放技能获得3点天赋经验
            const talentResult = Player.addElementTalentExp(skill.element, talentExp);
            if (talentResult.leveledUp) {
                this.addLog(`🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！`, 'buff');
                if (talentResult.evolutions && talentResult.evolutions.length > 0) {
                    for (const evo of talentResult.evolutions) {
                        this.addLog(`✨ 进化！【${evo.stage}】${evo.name}：${evo.description}`, 'evolution');
                    }
                }
            }
        }

        // 技能经验：玩家释放技能增加技能经验
        if (isPlayer && typeof Player !== 'undefined' && typeof SkillLevelSystem !== 'undefined') {
            const skillExp = 5; // 每次释放技能获得5点技能经验
            const skillResult = Player.addSkillExp(skill.id, skillExp);
            if (skillResult.leveledUp) {
                this.addLog(`✨ 技能「${skillResult.skillName}」升级到 Lv.${skillResult.newLevel}！`, 'buff');
            }
        }

        // v0.86.0: 设置技能冷却
        if (isPlayer && skill.type !== 'buff') {
            let cooldown = skill.cooldown || 0;
            // 根据等级自动设置冷却（如果技能数据中没有指定）
            if (cooldown === 0) {
                const tier = skill.tier || '初阶';
                if (tier === '中阶') cooldown = 1;
                else if (tier === '高阶') cooldown = 2;
                else if (tier === '超阶') cooldown = 3;
            }
            if (cooldown > 0) {
                this.skillCooldowns[skill.id] = cooldown;
            }
        }

        if (!skipTurnEnd) {
            if (isPlayer) {
                this.endPlayerTurn();
            } else {
                this.endEnemyTurn();
            }
        }

        return { success: true };
    }

// 导出模块集合
export const BattleSkill = {
    castSkillImmediate
};

export default BattleSkill;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleSkill = BattleSkill;
}