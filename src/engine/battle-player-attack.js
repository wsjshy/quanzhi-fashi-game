/**
 * 战斗系统 - 玩家攻击模块
 * 
 * 从battle.js拆分出的独立玩家攻击模块
 * 包含：玩家攻击（playerAttack）
 */
    /**
     * 玩家行动：普通攻击
     */
    playerAttack() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = false;

        // 首攻加成：20%概率先手，伤害+50%
        let firstStrikeBonus = 0;
        if (this.player.talentEffects && this.player.talentEffects.firstStrikeChance && !this._playerHasAttacked) {
            if (Math.random() < this.player.talentEffects.firstStrikeChance) {
                firstStrikeBonus = this.player.talentEffects.firstStrikeDamage || 0.5;
                this._playerHasAttacked = true;
                this.addLog(`⚡ 先手攻击！伤害+${Math.floor(firstStrikeBonus * 100)}%！`, 'buff');
            }
        }

        // v2.2.0: 火系强化流 - 消耗燃点强化普攻
        let fireEnhanceBonus = 0;
        let fireEnhanceCrit = false;
        const te = this.player.talentEffects || {};
        if (te.fireEnhanceAttack && typeof TalentCombatSystem !== 'undefined') {
            const cost = te.fireEnhanceCost || 3;
            if (TalentCombatSystem.getEnergy('fire') >= cost) {
                TalentCombatSystem.consumeEnergy('fire', cost);
                fireEnhanceBonus = te.fireEnhanceBonus || 0.80;
                fireEnhanceCrit = te.fireEnhanceCrit || false;
                this.addLog(`🔥 燃点强化！普攻伤害+${Math.floor(fireEnhanceBonus * 100)}%${fireEnhanceCrit ? '，必定暴击' : ''}！`, 'buff');
            }
        }

        // 计算伤害（含攻击者状态修正）
        const attackerMods = this.getStatusModifiers(this.player);
        // v0.8.27: 召唤兽在场时玩家伤害加成
        let summonMasterDmgBonus = 0;
        if (this.summon && this.player.talentEffects?.summonMasterDamageBonus) {
            summonMasterDmgBonus = this.player.talentEffects.summonMasterDamageBonus;
        }
        // v0.8.27: 对有debuff敌人增伤（debuffedDamageBonus，光系）
        let debuffedBonus = 0;
        if (this.player.talentEffects?.debuffedDamageBonus) {
            const enemyDebuffs = this.enemy.statusEffects.filter(e =>
                ['burn','freeze','frozen','stun','slow','poison','curse','paralyze','weakness','bleed','bind','blind','fear','shock','attack_down','defense_down'].includes(e.type)
            );
            if (enemyDebuffs.length > 0) {
                debuffedBonus = this.player.talentEffects.debuffedDamageBonus;
            }
        }
        // v0.9.7: 体力不再影响战斗伤害，staminaEff.battleDamage始终为1.0
        const staminaEff = (typeof Player !== 'undefined' && Player.getStaminaEfficiency) 
            ? Player.getStaminaEfficiency() 
            : { battleDamage: 1.0 };

        const damage = this.calculateDamage(
            this.player.attack * (1 + firstStrikeBonus + summonMasterDmgBonus + debuffedBonus + fireEnhanceBonus) * staminaEff.battleDamage + attackerMods.attackMod,
            this.enemy.defense * (this.enemy.isDefending ? 2 : 1), // 防御时防御翻倍
            1.0,
            fireEnhanceCrit ? 1.0 : this.player.critRate,
            this.player.hitRate,
            'physical',
            null,
            this.enemy,
            this.player
        );
        
        // 防御减伤
        if (this.enemy.isDefending) {
            damage.amount = Math.floor(damage.amount * 0.5);
        }

        // 应用伤害
        this.applyDamage(this.enemy, damage, this.player);

        // v2.2.0: 风系疾风状态 - 闪避后触发连击
        if (!damage.isMiss && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.hasWindStreak()) {
            TalentCombatSystem.consumeWindStreak();
            const comboDmg = this.calculateDamage(
                this.player.attack * 0.8,
                this.enemy.defense * (this.enemy.isDefending ? 2 : 1),
                1.0,
                this.player.critRate,
                this.player.hitRate,
                'wind',
                null,
                this.enemy,
                this.player
            );
            this.applyDamage(this.enemy, comboDmg, this.player);
            this.addLog(`💨 疾风连击！再造成 ${comboDmg.amount} 点伤害！`, 'element');
            if (!comboDmg.isMiss) this.showDamageNumber('enemy', comboDmg.amount, 'magic');
        }

        // 天赋异常状态触发（普攻命中时）
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            // 燃烧
            if (te.burnChance && Math.random() < te.burnChance) {
                const burnDmg = te.burnDamage || 0.05;
                // v1.5.1: 燃烧持续时间加成（熔岩流）
                const burnDuration = 3 + (te.burnDuration || 0);
                this.applyStatusEffects(this.enemy, [{
                    type: 'burn', name: '燃烧', damage: burnDmg, duration: burnDuration,
                    unpurgeable: te.burnUnpurgeable || false,
                    defenseDown: te.burnDefenseDown || 0
                }], true);
                this.addLog(`🔥 ${this.enemy.name} 被点燃了！`, 'element');
            }
            // 冰冻
            if (te.freezeChance && Math.random() < te.freezeChance) {
                this.applyStatusEffects(this.enemy, [{
                    type: 'freeze', name: '冰冻', duration: te.freezeDuration || 1,
                    unpurgeable: te.freezeUnpurgeable || false,
                    defenseDown: te.freezeDefenseDown || 0,
                    hpDrain: te.frozenHpDrain || 0,
                    spread: te.freezeSpread || false
                }], true);
                this.addLog(`❄️ ${this.enemy.name} 被冻结了！`, 'element');
            }
            // 麻痹
            if (te.paralyzeChance && Math.random() < te.paralyzeChance) {
                this.applyStatusEffects(this.enemy, [{
                    type: 'paralyze', name: '麻痹', duration: te.paralyzeDuration || 1
                }], true);
                this.addLog(`⚡ ${this.enemy.name} 被麻痹了！`, 'element');
            }
            // 感电时额外麻痹（shockParalyzeChance）
            if (te.shockParalyzeChance) {
                const hasShock = this.enemy.statusEffects.some(e => e.type === 'shock' || e.type === 'electrified');
                if (hasShock && Math.random() < te.shockParalyzeChance) {
                    const alreadyParalyzed = this.enemy.statusEffects.some(e => e.type === 'paralyze');
                    if (!alreadyParalyzed) {
                        this.applyStatusEffects(this.enemy, [{
                            type: 'paralyze', name: '麻痹', duration: te.paralyzeDuration || 1
                        }], true);
                        this.addLog(`⚡ 感电传导！${this.enemy.name} 被麻痹了！`, 'element');
                    }
                }
            }
            // v1.5.4: 湿润层数机制（wetChance/wetStacks/wetStackMax）
            if (te.wetChance && Math.random() < te.wetChance) {
                const existingWet = this.enemy.statusEffects.find(e => e.type === 'wet');
                const maxStacks = te.wetStackMax || 3;
                const addStacks = te.wetStacks || 1;
                if (existingWet) {
                    existingWet.stacks = Math.min((existingWet.stacks || 1) + addStacks, maxStacks);
                    existingWet.duration = Math.max(existingWet.duration, 2);
                    this.addLog(`💧 湿润叠加 ${existingWet.stacks}/${maxStacks}！`, 'element');
                    // 满层湿润回血（wetHealOnMax）
                    if (existingWet.stacks >= maxStacks && te.wetHealOnMax) {
                        const healAmount = Math.floor(this.player.maxHp * te.wetHealOnMax);
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                        this.addLog(`💧 湿润满层！恢复 ${healAmount} 点生命！`, 'heal');
                    }
                    // 满层湿润束缚（wetBindOnMax）
                    if (existingWet.stacks >= maxStacks && te.wetBindOnMax) {
                        if (!this.enemy.statusEffects.some(e => e.type === 'bind')) {
                            this.addStatusEffect(this.enemy, {
                                type: 'bind', name: '水之束缚', duration: te.bindDuration || 1,
                                defenseDown: te.bindDefenseDown || 0,
                                unpurgeable: te.bindUnpurgeable || false,
                                hpDrain: te.bindHpDrain || 0
                            });
                            this.addLog(`💧 湿润满层！${this.enemy.name} 被水之束缚！`, 'element');
                        }
                    }
                } else {
                    this.addStatusEffect(this.enemy, {
                        type: 'wet', name: '湿润', duration: 3, stacks: addStacks,
                        waterDamageBonus: te.wetDamageBonus || 0.1
                    });
                    this.addLog(`💧 ${this.enemy.name} 被湿润了（${addStacks}层）！`, 'element');
                }
            }
            // v1.5.5: 风刃层数机制（windBladeStack）- 风系攻击叠加风刃
            if (te.windBladeStack && damage.element === 'wind') {
                const maxBlades = te.windBladeMax || 3;
                if (!this.player._windBladeStacks) this.player._windBladeStacks = 0;
                this.player._windBladeStacks = Math.min(this.player._windBladeStacks + 1, maxBlades);
                const bladeDmg = Math.floor(this.player.attack * (te.windBladeDamage || 0.05));
                this.addLog(`🌪️ 风刃叠加 ${this.player._windBladeStacks}/${maxBlades}（每刃${bladeDmg}伤害）`, 'element');
                // 满层风刃乱舞（windBladeDanceOnMax）
                if (this.player._windBladeStacks >= maxBlades && te.windBladeDanceOnMax) {
                    const danceCount = te.windBladeDanceCount || 3;
                    const danceDamage = te.windBladeDanceDamage || 0.4;
                    for (let i = 0; i < danceCount; i++) {
                        if (this.enemy.hp <= 0) break;
                        const dmg = Math.floor(this.player.attack * danceDamage);
                        this.applyDamage(this.enemy, { amount: dmg, element: 'wind', isCrit: false, isMiss: false }, this.player);
                    }
                    this.addLog(`🌪️ 风刃乱舞！${danceCount}道风刃攻击！`, 'element');
                    this.player._windBladeStacks = 0;
                }
            }
            // v1.5.5: 暗影层数机制（shadowStack）- 暗系攻击叠加暗影
            if (te.shadowStack && damage.element === 'dark') {
                const maxShadow = te.shadowMax || 3;
                if (!this.player._shadowStacks) this.player._shadowStacks = 0;
                this.player._shadowStacks = Math.min(this.player._shadowStacks + 1, maxShadow);
                const lifesteal = te.shadowLifesteal || 0.05;
                const healAmount = Math.floor(damage.amount * lifesteal);
                if (healAmount > 0) {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🌑 暗影叠加 ${this.player._shadowStacks}/${maxShadow}（吸血${healAmount}）`, 'element');
                } else {
                    this.addLog(`🌑 暗影叠加 ${this.player._shadowStacks}/${maxShadow}`, 'element');
                }
                // 满层暗影吸血爆发（shadowDrainOnMax）
                if (this.player._shadowStacks >= maxShadow && te.shadowDrainOnMax) {
                    const drainHeal = Math.floor(this.enemy.maxHp * (te.drainLifesteal || 0.3));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + drainHeal);
                    this.addLog(`🌑 暗影吞噬！吸取 ${drainHeal} 点生命！`, 'heal');
                    this.player._shadowStacks = 0;
                }
                // 满层暗影潜行（shadowStealthOnMax）
                if (this.player._shadowStacks >= maxShadow && te.shadowStealthOnMax) {
                    if (!this.player.statusEffects.some(e => e.type === 'stealth')) {
                        this.addStatusEffect(this.player, {
                            type: 'stealth', name: '暗影潜行',
                            duration: te.stealthDuration || 1,
                            firstHitBonus: te.stealthFirstHitBonus || 1.0,
                            firstHitCrit: te.stealthFirstHitCrit || false
                        });
                        this.addLog(`🌑 暗影潜行！进入隐身状态！`, 'buff');
                    }
                    this.player._shadowStacks = 0;
                }
            }
            // v1.5.6: 毒素层数机制（poisonStack）- 植物系攻击叠加毒素
            if (te.poisonStack && damage.element === 'plant') {
                const maxPoison = te.poisonMax || 3;
                const existingPoison = this.enemy.statusEffects.find(e => e.type === 'poison');
                if (existingPoison) {
                    existingPoison.stacks = Math.min((existingPoison.stacks || 1) + 1, maxPoison);
                    existingPoison.duration = Math.max(existingPoison.duration, 3);
                    this.addLog(`☠️ 毒素叠加 ${existingPoison.stacks}/${maxPoison}！`, 'element');
                    // 满层毒爆（poisonBurstOnMax）
                    if (existingPoison.stacks >= maxPoison && te.poisonBurstOnMax) {
                        const burstDmg = Math.floor(this.enemy.maxHp * (te.poisonBurstDamage || 0.2));
                        this.applyDamage(this.enemy, { amount: burstDmg, element: 'plant', isCrit: false, isMiss: false, trueDamage: te.poisonBurstTrue || false }, this.player);
                        this.addLog(`☠️ 毒爆！造成 ${burstDmg} 点伤害！`, 'element');
                        // 毒爆刷新（poisonBurstRefresh）
                        if (!te.poisonBurstRefresh) {
                            existingPoison.stacks = 0;
                        }
                    }
                    // 满层束缚（poisonBindOnMax）
                    if (existingPoison.stacks >= maxPoison && te.poisonBindOnMax) {
                        if (!this.enemy.statusEffects.some(e => e.type === 'bind')) {
                            this.addStatusEffect(this.enemy, {
                                type: 'bind', name: '藤蔓束缚', duration: te.bindDuration || 2,
                                defenseDown: te.bindDefenseDown || 0.3,
                                unpurgeable: te.bindUnpurgeable || false,
                                hpDrain: te.bindHpDrain || 0
                            });
                            this.addLog(`☠️ 毒素满层！${this.enemy.name} 被藤蔓束缚！`, 'element');
                        }
                    }
                } else {
                    this.addStatusEffect(this.enemy, {
                        type: 'poison', name: '中毒', duration: 3, stacks: 1,
                        damage: te.poisonDamage || 0.05,
                        unpurgeable: te.poisonUnpurgeable || false
                    });
                    this.addLog(`☠️ ${this.enemy.name} 中毒了！`, 'element');
                }
            }
            // 眩晕
            if (te.stunChance && Math.random() < te.stunChance) {
                this.applyStatusEffects(this.enemy, [{
                    type: 'stun', name: '眩晕', duration: 1
                }], true);
                this.addLog(`💫 ${this.enemy.name} 被眩晕了！`, 'element');
                // 延长眩晕（stunExtendChance）
                if (te.stunExtendChance && Math.random() < te.stunExtendChance) {
                    const stun = this.enemy.statusEffects.find(e => e.type === 'stun');
                    if (stun) {
                        stun.duration += 1;
                        this.addLog(`💫 眩晕延长！`, 'element');
                    }
                }
            }
            // 减速
            if (te.slowChance && Math.random() < te.slowChance) {
                // 冰霜叠加：检查是否已有减速状态
                const existingSlow = this.enemy.statusEffects.find(e => e.type === 'slow' || e.type === 'frost');
                if (te.frostStackMax && existingSlow) {
                    // 叠加层数
                    existingSlow.stacks = (existingSlow.stacks || 1) + 1;
                    // v1.5.4: 使用frostSlowPerStack替代硬编码
                    const slowPerStack = te.frostSlowPerStack || 0.15;
                    existingSlow.speedMod = -(slowPerStack * existingSlow.stacks);
                    existingSlow.duration = 2;
                    this.addLog(`❄️ 冰霜叠加 ${existingSlow.stacks}/${te.frostStackMax}！`, 'element');
                    // 满层冻结（frostFreezeOnMax）
                    if (existingSlow.stacks >= te.frostStackMax && te.frostFreezeOnMax) {
                        this.addStatusEffect(this.enemy, {
                            type: 'freeze', name: '冰霜冻结', duration: te.freezeDuration || 1
                        });
                        this.addLog(`❄️ 冰霜满层！${this.enemy.name} 被冻结！`, 'element');
                        // v2.3.0: 冰+雷组合 - 超导：冻结时电荷+3
                        if (te.thunderEnergyGain && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
                            TalentCombatSystem.addEnergy('thunder', 3, te.thunderEnergyMax || 6);
                            this.addLog(`⚡ 超导！冻结触发电荷+3！`, 'element');
                        }
                        // 移除减速状态
                        this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e !== existingSlow);
                    }
                } else {
                    // v1.5.4: slowBonus减速效果加成
                    const baseSlow = 0.3 * (1 + (te.slowBonus || 0));
                    this.applyStatusEffects(this.enemy, [{
                        type: te.frostStackMax ? 'frost' : 'slow', name: te.frostStackMax ? '冰霜' : '减速',
                        speedMod: -baseSlow, duration: 2, stacks: 1,
                        unpurgeable: te.slowUnpurgeable || false
                    }], true);
                    this.addLog(`🐌 ${this.enemy.name} 被减速了！`, 'element');
                }
            }
            // v1.5.4: 破冰伤害（frostShatter）- 冰系攻击命中冻结目标时造成额外伤害
            if (te.frostShatter) {
                const isFrozen = this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
                if (isFrozen && damage.element === 'ice') {
                    let shatterDmg = Math.floor(this.player.attack * (te.shatterDamage || 0.8));
                    const shatterCrit = te.shatterCrit ? true : false;
                    if (shatterCrit) shatterDmg = Math.floor(shatterDmg * 1.5);
                    // shatterPierceShield：破冰无视护盾
                    const pierceShield = te.shatterPierceShield || false;
                    this.applyDamage(this.enemy, { amount: shatterDmg, element: 'ice', isCrit: shatterCrit, isMiss: false, pierceShield: pierceShield }, this.player);
                    this.addLog(`💥 破冰！造成 ${shatterDmg} 点额外伤害！${shatterCrit ? ' 暴击！' : ''}`, 'element');
                    this.showDamageNumber('enemy', shatterDmg, shatterCrit ? 'crit' : 'normal');
                    // 解除冻结
                    this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                    // shatterNextCrit：破冰后下次冰系技能必定暴击
                    if (te.shatterNextCrit) {
                        this.player.buffs.push({ type: 'next_crit_guaranteed', name: '破冰之势', duration: 2 });
                    }
                }
            }
            // 时间冻结：概率时停
            if (te.timeStopChance && Math.random() < te.timeStopChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'stun', name: '时间冻结', duration: te.timeStopDuration || 1
                });
                this.addLog(`⏱️ 时间冻结！${this.enemy.name} 停止行动！`, 'element');
            }
            // 恐惧：概率让敌人无法行动
            if (te.fearChance && Math.random() < te.fearChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'fear', name: '恐惧', duration: 1
                });
                this.addLog(`😱 ${this.enemy.name} 陷入恐惧！`, 'element');
            }
            // 致盲：概率降低敌人命中
            if (te.blindChance && Math.random() < te.blindChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'blind', name: '致盲', hitMod: -0.5, duration: te.blindDuration || 2
                });
                this.addLog(`👁️ ${this.enemy.name} 被致盲！`, 'element');
            }
            // 暗影标记：受到暗系伤害增加
            if (te.darkMark && Math.random() < (te.darkMarkChance || 0.3)) {
                this.addStatusEffect(this.enemy, {
                    type: 'darkMark', name: '暗影标记', duration: te.darkMarkDuration || 3,
                    darkDamageBonus: te.darkMarkDamage || 0.5
                });
                this.addLog(`🌑 ${this.enemy.name} 被暗影标记！`, 'element');
            }
            // 诅咒：降低攻防
            if (te.curseChance && Math.random() < te.curseChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'curse', name: '诅咒', duration: te.curseDuration || 3,
                    atkMod: -(te.curseAtkDown || 0.15), defMod: -(te.curseDefDown || 0.15),
                    critDown: te.curseCritDown || 0, dodgeDown: te.curseDodgeDown || 0,
                    unpurgeable: te.curseUnpurgeable || false
                });
                this.addLog(`💀 ${this.enemy.name} 被诅咒！`, 'element');
            }
        }

        // 天赋：雷系蓄电 - 每次攻击命中叠加蓄电层数
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.chargeMax && te.chargeMax > 0) {
                this.player.chargeStack = Math.min(te.chargeMax, this.player.chargeStack + 1);
                const perStack = te.chargePerStack || 0.1;
                const bonusParalyze = this.player.chargeStack * perStack;
                // 满层时额外效果
                if (this.player.chargeStack >= te.chargeMax) {
                    this.addLog(`⚡ 蓄电已满！暴击率和暴击伤害大幅提升！`, 'buff');
                } else {
                    this.addLog(`⚡ 蓄电 ${this.player.chargeStack}/${te.chargeMax}（麻痹+${Math.floor(bonusParalyze*100)}%）`, 'element');
                }
                // 蓄电层数增加麻痹概率（在麻痹判定时已经过了，这里给感电效果）
                // 感电状态：雷伤+30%（shockDebuff为true时，30%基础概率+蓄电加成）
                if (te.shockDebuff) {
                    const shockBaseChance = 0.3;
                    if (Math.random() < shockBaseChance + bonusParalyze) {
                        this.addStatusEffect(this.enemy, {
                            type: 'shock', name: '感电', duration: te.shockDuration || 3,
                            thunderDamageBonus: te.shockThunderBonus || 0.3
                        });
                        this.addLog(`⚡ ${this.enemy.name} 进入感电状态，受到雷伤增加！`, 'element');
                    }
                }
                // v1.5.4: 感电层数机制（shockChance/shockStacks/shockStackMax）
                if (te.shockChance && Math.random() < te.shockChance) {
                    const existingShock = this.enemy.statusEffects.find(e => e.type === 'shock' || e.type === 'electrified');
                    const maxStacks = te.shockStackMax || 3;
                    const addStacks = te.shockStacks || 1;
                    if (existingShock) {
                        existingShock.stacks = Math.min((existingShock.stacks || 1) + addStacks, maxStacks);
                        existingShock.duration = Math.max(existingShock.duration, 2);
                        // v1.5.4: 感电伤害加成（shockDamageBonus）
                        if (te.shockDamageBonus) {
                            existingShock.thunderDamageBonus = (existingShock.thunderDamageBonus || 0) + te.shockDamageBonus;
                        }
                        this.addLog(`⚡ 感电叠加 ${existingShock.stacks}/${maxStacks}！`, 'element');
                        // 满层麻痹（shockParalyzeOnMax）
                        if (existingShock.stacks >= maxStacks && te.shockParalyzeOnMax) {
                            if (!this.enemy.statusEffects.some(e => e.type === 'paralyze')) {
                                this.addStatusEffect(this.enemy, { type: 'paralyze', name: '感电麻痹', duration: te.paralyzeDuration || 2 });
                                this.addLog(`⚡ 感电满层！${this.enemy.name} 被麻痹！`, 'element');
                            }
                        }
                    } else {
                        this.addStatusEffect(this.enemy, {
                            type: 'shock', name: '感电', duration: 3, stacks: addStacks,
                            thunderDamageBonus: te.shockThunderBonus || te.shockDamageBonus || 0.1
                        });
                        this.addLog(`⚡ ${this.enemy.name} 进入感电状态（${addStacks}层）！`, 'element');
                    }
                }
            }
        }

        // 天赋吸血：普攻造成伤害回复HP
        let totalAttackDamage = damage.amount;
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.lifesteal && te.lifesteal > 0) {
                const healAmount = Math.floor(damage.amount * te.lifesteal);
                if (healAmount > 0 && this.player.hp < this.player.maxHp) {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🩸 吸血恢复 ${healAmount} 点生命！`, 'heal');
                }
            }
        }

        // 天赋连击：概率追加攻击
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.comboChance && te.comboChance > 0 && Math.random() < te.comboChance) {
                const comboDmgMult = te.comboDamageMult || 0.5;
                const comboDamage = this.calculateDamage(
                    this.player.attack * comboDmgMult,
                    this.enemy.defense,
                    1.0, 0, this.player.hitRate,
                    'physical', null, this.enemy, this.player
                );
                if (!comboDamage.isMiss) {
                    this.applyDamage(this.enemy, comboDamage, this.player);
                    totalAttackDamage += comboDamage.amount;
                    this.addLog(`⚡ 连击！追加 ${comboDamage.amount} 点伤害！`, 'counter');
                    this.showDamageNumber('enemy', comboDamage.amount, 'normal');
                }
            }
            // 天赋：风刃追加 - 概率追加多道风刃
            if (te.windBladeChance && te.windBladeChance > 0 && Math.random() < te.windBladeChance) {
                const bladeCount = te.windBladeCount || 3;
                const bladeDmgMult = te.windBladeDamage || 0.3;
                let totalBladeDmg = 0;
                for (let i = 0; i < bladeCount; i++) {
                    const bladeDmg = this.calculateDamage(
                        this.player.attack * bladeDmgMult,
                        this.enemy.defense,
                        1.0, 0.1, this.player.hitRate,
                        'wind', null, this.enemy, this.player
                    );
                    if (!bladeDmg.isMiss) {
                        this.applyDamage(this.enemy, bladeDmg, this.player);
                        totalBladeDmg += bladeDmg.amount;
                    }
                }
                if (totalBladeDmg > 0) {
                    this.addLog(`🌪️ 风刃乱舞！${bladeCount}道风刃造成 ${totalBladeDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', totalBladeDmg, 'normal');
                }
            }

            // 天赋：二连斩（风系连袭Lv3）
            if (te.doubleStrikeChance && Math.random() < te.doubleStrikeChance) {
                let ratio = te.secondHitRatio || 0.85;
                // 连击伤害加成（comboDamage）
                if (te.comboDamage) ratio += te.comboDamage;
                // 连段伤害递增（comboDamageIncrease：第二段+X）
                if (te.comboDamageIncrease) ratio += te.comboDamageIncrease;
                const secondDmg = this.calculateDamage(
                    this.player.attack * ratio,
                    this.enemy.defense,
                    1.0, 0.1, this.player.hitRate,
                    'wind', null, this.enemy, this.player
                );
                if (!secondDmg.isMiss) {
                    this.applyDamage(this.enemy, secondDmg, this.player);
                    totalAttackDamage += secondDmg.amount;
                    this.addLog(`⚔️ 二连斩！追加 ${secondDmg.amount} 点伤害！`, 'counter');
                    this.showDamageNumber('enemy', secondDmg.amount, 'normal');

                    // 三连斩（在二连斩触发后判定）
                    if (te.tripleStrikeChance && Math.random() < te.tripleStrikeChance) {
                        let thirdRatio = te.thirdHitRatio || 0.6;
                        if (te.comboDamage) thirdRatio += te.comboDamage;
                        // 连段伤害递增（comboDamageIncrease：第三段再+X，共+2X）
                        if (te.comboDamageIncrease) thirdRatio += te.comboDamageIncrease * 2;
                        const thirdDmg = this.calculateDamage(
                            this.player.attack * thirdRatio,
                            this.enemy.defense,
                            1.0, 0.15, this.player.hitRate,
                            'wind', null, this.enemy, this.player
                        );
                        if (!thirdDmg.isMiss) {
                            this.applyDamage(this.enemy, thirdDmg, this.player);
                            totalAttackDamage += thirdDmg.amount;
                            this.addLog(`⚔️⚔️ 三连斩！再追加 ${thirdDmg.amount} 点伤害！`, 'counter');
                            this.showDamageNumber('enemy', thirdDmg.amount, 'normal');
                        }
                    }
                }
            }

            // 天赋：风魔 - 每次命中叠加攻速和暴击（本回合内有效，回合结束重置）
            if (te.attackSpeedStack) {
                this.player.comboCount = Math.min((this.player.comboCount || 0) + 1, te.attackSpeedMax || 6);
                if (this.player.comboCount >= (te.attackSpeedMax || 6)) {
                    this.addLog(`🌪️ 风魔满层！下次攻击暴击和速度达到巅峰！`, 'buff');
                }
            }
            // 天赋：飓风（hurricaneChance）：30%卷起敌人1回合，受伤+20%
            if (te.hurricaneChance && Math.random() < te.hurricaneChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'stun', name: '飓风卷起', duration: te.hurricaneDuration || 1,
                    damageTaken: te.hurricaneVulnerable || 0.2
                });
                this.addLog(`🌪️ 飓风！${this.enemy.name} 被卷起！`, 'element');
            }
            // 天赋：滋润（regenChance）：50%概率获得5回合5%HP回复
            if (te.regenChance && Math.random() < te.regenChance) {
                const existingRegen = this.player.statusEffects.find(e => e.type === 'regen');
                if (existingRegen) {
                    existingRegen.duration = te.regenDuration || 5;
                } else {
                    this.addStatusEffect(this.player, {
                        type: 'regen', name: '滋润', duration: te.regenDuration || 5,
                        regenAmount: te.regenAmount || 0.05
                    });
                }
                this.addLog(`💧 滋润！5回合内每回合恢复HP！`, 'heal');
            }
        }
        
        // 普通攻击恢复少量MP（2%最大MP）
        if (this.player.maxMp > 0) {
            const mpGain = Math.floor(this.player.maxMp * 0.02);
            if (mpGain > 0 && this.player.mp < this.player.maxMp) {
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpGain);
            }
        }
        
        // 元素反应：处理状态变化
        if (damage.elementReaction && !damage.isMiss && this.enemy.statusEffects) {
            // 碎冰消耗冻结状态
            if (damage.elementReaction === 'shatter') {
                this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                this.addLog(`❄️ 碎冰反应！冻结被打破，造成额外伤害！`, 'magic');
            }
        }
        
        // 连续暴击记录（用于幸运儿成就）
        if (damage.isCrit) {
            this.consecutiveCrits++;
            if (this.consecutiveCrits >= 3 && typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                if (!WorldState.hasAchievement('lucky_dog')) {
                    const achData = DataAchievements['lucky_dog'];
                    if (achData) {
                        WorldState.unlockAchievement('lucky_dog', achData);
                    }
                }
            }
            // 天赋：雷鸣 - 暴击时概率麻痹敌人（有CD）
            if (this.player.talentEffects && this.player.talentEffects.thunderRoar) {
                if (!this._thunderRoarCd || this._thunderRoarCd <= 0) {
                    if (Math.random() < this.player.talentEffects.thunderRoar) {
                        this.addStatusEffect(this.enemy, {
                            type: 'paralyze', name: '雷鸣麻痹', duration: this.player.talentEffects.thunderRoarParalyze || 1
                        });
                        this.addLog(`⚡ 雷鸣！${this.enemy.name} 被麻痹！`, 'element');
                        this._thunderRoarCd = this.player.talentEffects.thunderRoarCooldown || 3;
                    }
                }
            }
            // 天赋：暴击必麻痹（天雷Lv7雷霆之怒）
            if (this.player.talentEffects && this.player.talentEffects.critParalyze) {
                this.addStatusEffect(this.enemy, {
                    type: 'paralyze', name: '雷霆麻痹', duration: 1
                });
                this.addLog(`⚡ 雷霆之怒！暴击必定麻痹！`, 'element');
            }
            // 天赋：天雷引 - 攻击时30%概率随机落雷
            if (this.player.talentEffects && this.player.talentEffects.skyThunderChance && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.skyThunderChance) {
                    const thunderDmg = Math.floor(this.player.attack * (this.player.talentEffects.skyThunderDamage || 0.8));
                    this.applyDamage(this.enemy, { amount: thunderDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`⚡ 天雷引！一道雷电劈下，造成 ${thunderDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', thunderDmg, 'normal');
                }
            }
            // 天赋：暴击击退（critKnockback：暴击时概率眩晕敌人）
            if (this.player.talentEffects && this.player.talentEffects.critKnockback && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.critKnockback) {
                    const alreadyStunned = this.enemy.statusEffects.some(e => e.type === 'stun');
                    if (!alreadyStunned) {
                        this.addStatusEffect(this.enemy, { type: 'stun', name: '击退', duration: 1 });
                        this.addLog(`💥 暴击击退！${this.enemy.name} 被震退！`, 'element');
                    }
                }
            }
            // 天赋：攻击爆炸（explosionChance：攻击时概率爆炸造成额外伤害）
            if (this.player.talentEffects && this.player.talentEffects.explosionChance && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.explosionChance) {
                    const explDmg = Math.floor(damage.amount * (this.player.talentEffects.explosionDamage || 0.5));
                    this.applyDamage(this.enemy, { amount: explDmg, element: 'fire', isCrit: this.player.talentEffects.explosionCritGuaranteed, isMiss: false }, this.player);
                    this.addLog(`💥 爆炸！额外造成 ${explDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', explDmg, 'magic');
                    // 连锁爆炸（chainExplosionChance：爆炸后概率触发二次爆炸）
                    if (this.player.talentEffects.chainExplosionChance) {
                        if (Math.random() < this.player.talentEffects.chainExplosionChance) {
                            const chainExplDmg = Math.floor(explDmg * (this.player.talentEffects.chainExplosionDamage || 0.5));
                            this.applyDamage(this.enemy, { amount: chainExplDmg, element: 'fire', isCrit: false, isMiss: false }, this.player);
                            this.addLog(`💥 连锁爆炸！再造成 ${chainExplDmg} 点伤害！`, 'element');
                            this.showDamageNumber('enemy', chainExplDmg, 'magic');
                        }
                    }
                }
            }
            // 天赋：闪电连锁（chainChance：攻击时概率连锁额外雷电伤害）
            if (this.player.talentEffects && this.player.talentEffects.chainChance && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.chainChance) {
                    const chainCount = this.player.talentEffects.chainTargets || 1;
                    const chainRatio = this.player.talentEffects.chainDamageRatio || 0.5;
                    let chainDmg = Math.floor(damage.amount * chainRatio);
                    for (let i = 0; i < chainCount; i++) {
                        // 连锁伤害递减（除非chainNoDecay）
                        if (!this.player.talentEffects.chainNoDecay && i > 0) {
                            chainDmg = Math.floor(chainDmg * 0.7);
                        }
                        this.applyDamage(this.enemy, { amount: chainDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                        this.addLog(`⚡ 连锁闪电！造成 ${chainDmg} 点伤害！`, 'element');
                        this.showDamageNumber('enemy', chainDmg, 'magic');
                    }
                }
            }
            // 天赋：暴击得护盾
            if (this.player.talentEffects && this.player.talentEffects.shieldOnCrit) {
                const shieldAmount = Math.floor(this.player.maxHp * this.player.talentEffects.shieldOnCrit);
                const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                if (existingShield) {
                    existingShield.value = Math.max(existingShield.value, shieldAmount);
                } else {
                    this.addStatusEffect(this.player, {
                        type: 'shield', name: '圣光护盾', value: shieldAmount, duration: 3
                    });
                }
                this.addLog(`🛡️ 暴击获得 ${shieldAmount} 点护盾！`, 'buff');
            }
        } else {
            this.consecutiveCrits = 0;
        }
        
        this.addLog(`你发动了普通攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, damage.isCrit ? 'crit' : 'damage');
        
        // 玩家攻击冲刺动画
        if (typeof UI !== 'undefined' && UI.playAttackAnimation) UI.playAttackAnimation(true);
        
        // 显示浮动伤害数字
        if (!damage.isMiss) {
            const dmgType = damage.isCrit ? 'crit' : 'normal';
            this.showDamageNumber('enemy', damage.amount, dmgType);
            // 敌人受击动画
            setTimeout(() => {
                if (typeof UI !== 'undefined' && UI.playHitAnimation) UI.playHitAnimation(false, damage.isCrit);
            }, 150);
        } else {
            // 未命中/闪避飘字
            this.showDamageNumber('enemy', 0, 'dodge');
        }

        // v2.9.4: 统一打断判定（引导期间被攻击命中）- 仅魔法师敌人可被打断，妖魔不存在打断
        const isMageEnemy = this.enemy.isMage === true || this.enemy.enemyType === 'mage';
        if (this.enemyCasting && !damage.isMiss && isMageEnemy) {
            const skill = this.enemyCasting.skill;
            const castTime = this.enemyCasting.totalTime;
            const enemyDefended = this.enemyDefendedLastTurn || false;
            // 统一公式：基础概率(castTime) × 难度系数 + 精神力差 - 境界减免 - 防御姿态
            const interruptChance = this.calculateInterruptChance(castTime, skill, this.enemy, this.player, enemyDefended);

            if (Math.random() < interruptChance) {
                const interruptedSkill = skill?.name || '魔法';
                this.addLog(`💥 攻击打断了 ${this.enemy.name} 的 ${interruptedSkill} 引导！（打断概率 ${(interruptChance*100).toFixed(0)}%）`, 'interrupt-success');
                this.enemyCasting = null;
                // v2.9.1: 打断成功视觉反馈（青色闪光+震屏）
                if (typeof document !== 'undefined') {
                    const flash = document.createElement('div');
                    flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(100,220,255,0.3) 0%,rgba(100,200,255,0.15) 50%,transparent 70%);z-index:9998;pointer-events:none;animation:highTierFlash 0.5s ease-out forwards;';
                    document.body.appendChild(flash);
                    setTimeout(() => flash.remove(), 600);
                }
                this.interruptCount = (this.interruptCount || 0) + 1;

                // 发布打断事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.INTERRUPT, {
                        attacker: 'player',
                        target: 'enemy',
                        skill: null
                    });
                }
            }
        }
        
        // 发布玩家攻击事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.PLAYER_ATTACK, {
                damage: damage.amount,
                isCrit: damage.isCrit,
                isMiss: damage.isMiss,
                damageType: 'physical'
            });
            
            // 发布更细粒度的事件
            if (damage.isMiss) {
                BattleEventBus.emit(BattleEvents.MISS, {
                    attacker: 'player',
                    target: 'enemy',
                    damageType: 'physical'
                });
            } else {
                BattleEventBus.emit(BattleEvents.HIT, {
                    attacker: 'player',
                    target: 'enemy',
                    damage: damage.amount,
                    isCrit: damage.isCrit,
                    damageType: 'physical'
                });
                
                if (damage.isCrit) {
                    BattleEventBus.emit(BattleEvents.CRIT, {
                        attacker: 'player',
                        target: 'enemy',
                        damage: damage.amount,
                        damageType: 'physical'
                    });
                }
                
                BattleEventBus.emit(BattleEvents.DAMAGE, {
                    target: 'enemy',
                    attacker: 'player',
                    damage: damage.amount,
                    isCrit: damage.isCrit,
                    damageType: 'physical'
                });
            }
        }

        this.endPlayerTurn();
        return damage;
    },

// 导出模块集合
export const BattlePlayerAttack = {
    playerAttack
};

export default BattlePlayerAttack;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattlePlayerAttack = BattlePlayerAttack;
}