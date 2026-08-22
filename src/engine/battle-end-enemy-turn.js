/**
 * 战斗系统 - 敌人回合结束模块
 * 
 * 从battle.js拆分出的独立敌人回合结束模块
 * 包含：结束敌人回合（endEnemyTurn）
 */

export function endEnemyTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) {
            this._onBattleEndDuringTurn();
            return;
        }

        // 处理状态效果（每回合结束）
        this.tickStatusEffects(this.player, true);
        this.tickStatusEffects(this.enemy, false);

        // 陨石倒计时（每回合-1，到0时落下）
        if (this._meteorCountdown > 0) {
            this._meteorCountdown--;
            if (this._meteorCountdown <= 0) {
                const meteorDmg = Math.floor(this.player.magicPower * (this._meteorDamage || 1.2));
                this.applyDamage(this.enemy, { amount: meteorDmg, element: 'earth', isCrit: false, isMiss: false }, this.player);
                this.addLog(`☄️ 陨石坠落！对 ${this.enemy.name} 造成 ${meteorDmg} 点土系伤害！`, 'element');
                this.showDamageNumber('enemy', meteorDmg, 'crit');
                // 概率眩晕
                if (Math.random() < (this._meteorStunChance || 0.5)) {
                    this.addStatusEffect(this.enemy, {
                        type: 'stun', name: '陨石冲击', duration: 1,
                        icon: '☄️', desc: '被陨石冲击眩晕'
                    }, 0, false);
                    this.addLog(`💫 ${this.enemy.name} 被陨石冲击眩晕！`, 'debuff');
                }
                this._meteorCountdown = 0;
            } else {
                this.addLog(`🪨 陨石还有 ${this._meteorCountdown} 回合落下...`, 'element');
            }
        }

        // MP自然恢复（每回合5%）
        if (this.player.maxMp > 0) {
            const mpRegen = Math.floor(this.player.maxMp * 0.05);
            if (mpRegen > 0 && this.player.mp < this.player.maxMp) {
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen);
            }
        }
        if (this.enemy.maxMp > 0) {
            const mpRegen = Math.floor(this.enemy.maxMp * 0.05);
            if (mpRegen > 0 && this.enemy.mp < this.enemy.maxMp) {
                this.enemy.mp = Math.min(this.enemy.maxMp, this.enemy.mp + mpRegen);
            }
        }
        
        // 天赋：回合结束效果
        this.processTraitsOnTurnEnd(this.enemy, false);
        this.processTraitsOnTurnEnd(this.player, true);

        // v1.6.0: 恐惧消退（每回合恐惧等级-1，成功行动后额外消退）
        const fearEffect = this.player.statusEffects.find(e => e.type === 'fear');
        if (fearEffect) {
            fearEffect.level = Math.max(0, (fearEffect.level || 1) - 1);
            if (fearEffect.level <= 0) {
                this.player.statusEffects = this.player.statusEffects.filter(e => e.type !== 'fear');
                this.addLog(`😤 恐惧消退，你恢复了冷静！`, 'buff');
            } else {
                this.addLog(`😰 恐惧程度：${fearEffect.level}级`, 'debuff');
            }
        }

        // 处理召唤兽持续时间和状态
        if (this.summon) {
            // v0.8.27: 共享回复（sharedHpRegen）：双方每回合回复HP
            if (this.player.talentEffects?.sharedHpRegen) {
                const regenPct = this.player.talentEffects.sharedHpRegen;
                const playerRegen = Math.floor(this.player.maxHp * regenPct);
                const summonRegen = Math.floor(this.summon.maxHp * regenPct);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + playerRegen);
                this.summon.hp = Math.min(this.summon.maxHp, this.summon.hp + summonRegen);
                this.addLog(`🔗 灵魂链接：双方各回复 ${playerRegen} HP！`, 'heal');
            }
            this.summon.remainingDuration--;
            if (this.summon.statusEffects) {
                this.summon.statusEffects = this.summon.statusEffects.filter(effect => {
                    effect.duration--;
                    return effect.duration > 0;
                });
            }
            if (this.summon.remainingDuration <= 0 || this.summon.hp <= 0) {
                // v0.8.27: 召唤兽死亡爆发/治疗
                if (this.summon.hp <= 0) {
                    this.triggerSummonDeath();
                }
                this.addLog(`${this.summon.icon} ${this.summon.name} 消失了`, 'system');
                this.summon = null;
            }
        }

        // 检查战斗是否结束（DOT可能致死）
        if (this.checkBattleEnd()) {
            this._onBattleEndDuringTurn();
            return;
        }

        this.turn++;
        this.player.isDefending = false;

        // 每回合自动回复HP/MP（基于等级和精神力）
        if (this.player.hp > 0) {
            const playerLevel = Player.level || 1;
            const playerSpirit = Player.spirit || 10;
            // HP回复：每回合回复等级*0.5 + 最大HP的0.3%（战斗中回复有限，主要靠技能/药品）
            const hpRegen = Math.max(1, Math.floor(playerLevel * 0.5 + this.player.maxHp * 0.003));
            // MP回复：每回合回复等级*0.5 + 精神力*0.1 + 最大MP的0.5%（普攻也能回MP）
            const mpRegen = Math.max(1, Math.floor(playerLevel * 0.5 + playerSpirit * 0.1 + this.player.maxMp * 0.005));

            // 天赋加成：hpRegen/mpRegen
            let talentHpBonus = 0, talentMpBonus = 0;
            if (typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
                const allTalentEffects = Player.getAllTalentEffects ? Player.getAllTalentEffects() : {};
                if (allTalentEffects.hpRegen) talentHpBonus = allTalentEffects.hpRegen;
                if (allTalentEffects.mpRegen) talentMpBonus = allTalentEffects.mpRegen;
            }

            const finalHpRegen = Math.floor(hpRegen * (1 + talentHpBonus));
            const finalMpRegen = Math.floor(mpRegen * (1 + talentMpBonus));

            if (finalHpRegen > 0 && this.player.hp < this.player.maxHp) {
                const oldHp = this.player.hp;
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + finalHpRegen);
                if (this.player.hp > oldHp) {
                    this.addLog(`恢复了 ${this.player.hp - oldHp} 点HP`, 'heal');
                }
            }
            if (finalMpRegen > 0 && this.player.mp < this.player.maxMp) {
                const oldMp = this.player.mp;
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + finalMpRegen);
                if (this.player.mp > oldMp) {
                    this.addLog(`恢复了 ${this.player.mp - oldMp} 点MP`, 'heal');
                }
            }
        }

        // 天赋光环效果：每回合开始时对敌人造成伤害（火焰光环等）
        if (this.player.talentEffects && this.enemy.hp > 0) {
            const te = this.player.talentEffects;
            // 火焰光环：每回合对敌人造成最大HP百分比伤害
            if (te.fireAura && te.fireAura > 0) {
                const auraDmg = Math.floor(this.enemy.maxHp * te.fireAura);
                if (auraDmg > 0) {
                    this.applyDamage(this.enemy, { amount: auraDmg, element: 'fire', isMiss: false, isCrit: false }, this.player);
                    this.addLog(`🔥 火焰光环灼烧 ${this.enemy.name}，造成 ${auraDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', auraDmg, 'normal');
                }
            }
            // 冰霜光环：每回合减速敌人
            if (te.frostAura && te.frostAura > 0 && this.enemy.speed > 1) {
                const slowAmount = Math.floor(this.enemy.speed * te.frostAura);
                if (slowAmount > 0) {
                    this.enemy.speed = Math.max(1, this.enemy.speed - slowAmount);
                    this.addLog(`❄️ 冰霜光环减速 ${this.enemy.name}！`, 'element');
                }
            }
            // 治疗光环：每回合治疗
            if (te.healAura && te.healAura > 0 && this.player.hp < this.player.maxHp) {
                const auraHeal = Math.floor(this.player.maxHp * te.healAura);
                if (auraHeal > 0) {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + auraHeal);
                    this.addLog(`✨ 治疗光环恢复 ${auraHeal} 点生命！`, 'heal');
                }
            }

            // v2.2.0: 植物系生长 - 每回合自动生长
            if (te.plantGrowth && this.player.elements && this.player.elements.includes('plant')) {
                if (!this.player.plantGrowthStacks) this.player.plantGrowthStacks = 0;
                this.player.plantGrowthStacks = Math.min(te.plantGrowthMax || 8, this.player.plantGrowthStacks + (te.plantGrowthPerTurn || 2));
                this.addLog(`🌿 植物生长 ${this.player.plantGrowthStacks}/${te.plantGrowthMax || 8}层！植物系技能伤害+${this.player.plantGrowthStacks * 5}%`, 'element');
            }
            // 雷鸣CD减少
            if (this._thunderRoarCd > 0) this._thunderRoarCd--;

            // 大地祝福：每回合HP回复（hpRegen）
            if (te.hpRegen) {
                const regen = Math.floor(this.player.maxHp * te.hpRegen);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + regen);
                this.addLog(`💚 大地祝福恢复 ${regen} 点HP！`, 'heal');
                this.showDamageNumber('player', regen, 'heal');
            }
            // MP回复（mpRegen）：每回合回3%MP
            if (te.mpRegen) {
                const mpRegen = Math.floor(this.player.maxMp * te.mpRegen);
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen);
            }
            // CD减少（cooldownReduction）：每回合额外减少技能CD
            if (te.cooldownReduction && this.player.skillCooldowns) {
                for (const sid in this.player.skillCooldowns) {
                    if (this.player.skillCooldowns[sid] > 0) {
                        this.player.skillCooldowns[sid] = Math.max(0, this.player.skillCooldowns[sid] - 1);
                    }
                }
            }
            // 大地祝福：防御叠加（defenseStack/defenseStackMax）
            if (te.defenseStack) {
                if (!this.player._defenseStacks) this.player._defenseStacks = 0;
                this.player._defenseStacks = Math.min(te.defenseStackMax / te.defenseStack, this.player._defenseStacks + 1);
                const defBonus = this.player._defenseStacks * te.defenseStack;
                this.player._defenseStackBonus = defBonus;
                if (this.player._defenseStacks >= te.defenseStackMax / te.defenseStack) {
                    this.addLog(`🪨 大地祝福叠满！防御+${Math.floor(defBonus*100)}%！`, 'buff');
                }
            }
            // 护盾回复（shieldRegen）
            if (te.shieldRegen) {
                const shield = this.player.statusEffects.find(e => e.type === 'shield');
                if (shield) {
                    const regen = Math.floor(this.player.maxHp * te.shieldRegen);
                    shield.value = Math.min(Math.floor(this.player.maxHp * 0.5), shield.value + regen);
                }
            }
            // 地震（earthquakeChance）：30%概率对敌人造成伤害+减速
            if (te.earthquakeChance && Math.random() < te.earthquakeChance) {
                const eqDmg = Math.floor(this.player.attack * (te.earthquakeDamage || 0.2));
                this.applyDamage(this.enemy, { amount: eqDmg, element: 'earth', isCrit: false, isMiss: false }, this.player);
                this.addLog(`🌍 地震！对 ${this.enemy.name} 造成 ${eqDmg} 点土系伤害！`, 'element');
                if (te.earthquakeSlow) {
                    this.addStatusEffect(this.enemy, { type: 'slow', name: '地震减速', duration: 2, speedMod: -te.earthquakeSlow });
                }
            }
            // 海啸（tsunamiChance）：30%概率60%攻击水伤+攻击-20%
            if (te.tsunamiChance && Math.random() < te.tsunamiChance) {
                const tsDmg = Math.floor(this.player.attack * (te.tsunamiDamage || 0.6));
                this.applyDamage(this.enemy, { amount: tsDmg, element: 'water', isCrit: false, isMiss: false }, this.player);
                this.addLog(`🌊 海啸！对 ${this.enemy.name} 造成 ${tsDmg} 点水系伤害！`, 'element');
                if (te.tsunamiAtkDown) {
                    this.addStatusEffect(this.enemy, { type: 'attack_down', name: '海啸削弱', duration: 2, atkMod: -te.tsunamiAtkDown });
                }
            }
            // 滋润持续回复（regen状态）
            const regen = this.player.statusEffects.find(e => e.type === 'regen');
            if (regen) {
                const regenAmount = Math.floor(this.player.maxHp * (regen.regenAmount || 0.05));
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + regenAmount);
                this.addLog(`💧 滋润恢复 ${regenAmount} 点HP！`, 'heal');
                this.showDamageNumber('player', regenAmount, 'heal');
            }
            // 自动治疗（autoHeal）：HP低于50%时自动治疗
            if (te.autoHeal && this.player.hp / this.player.maxHp < 0.5) {
                const healAmount = Math.floor(this.player.maxHp * te.autoHeal);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                this.addLog(`💚 自动治疗！恢复 ${healAmount} 点HP！`, 'heal');
                this.showDamageNumber('player', healAmount, 'heal');
            }

            // 潮汐涨潮：每回合伤害和治疗递增（tideDamageStack/tideDamageMax/tideHealStack/tideHealMax）
            if (te.tideDamageStack) {
                const maxStacks = Math.floor((te.tideDamageMax || 0.3) / te.tideDamageStack);
                this.player.tideStack = Math.min(maxStacks, (this.player.tideStack || 0) + 1);
                const dmgBonus = Math.min(te.tideDamageMax || 0.3, this.player.tideStack * te.tideDamageStack);
                const healBonus = Math.min(te.tideHealMax || 0.18, this.player.tideStack * (te.tideHealStack || 0.03));
                this.player.tideDamageBonus = dmgBonus;
                this.player.tideHealBonus = healBonus;
                if (this.player.tideStack >= maxStacks) {
                    this.addLog(`🌊 潮汐满潮！伤害+${Math.floor(dmgBonus*100)}%，治疗+${Math.floor(healBonus*100)}%！`, 'buff');
                    // 潮汐护盾（tideShield）：满潮时获得护盾
                    if (te.tideShield) {
                        const shieldAmount = Math.floor(this.player.maxHp * te.tideShield);
                        const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                        if (existingShield) {
                            existingShield.value = Math.max(existingShield.value, shieldAmount);
                        } else {
                            this.addStatusEffect(this.player, { type: 'shield', name: '潮汐护盾', value: shieldAmount, duration: te.tideShieldDuration || 3 });
                        }
                        this.addLog(`🌊 潮汐护盾！获得 ${shieldAmount} 点护盾！`, 'defense');
                    }
                    // 潮汐净化（tideCleansing）：满潮时净化1个负面
                    if (te.tideCleansing) {
                        const cleansable = this.player.statusEffects.filter(e =>
                            ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear'].includes(e.type) && !e.unpurgeable
                        );
                        if (cleansable.length > 0) {
                            this.player.statusEffects = this.player.statusEffects.filter(e => e !== cleansable[0]);
                            this.addLog(`🌊 潮汐净化了 ${cleansable[0].name}！`, 'buff');
                        }
                    }
                }
            }
            // 紧急回复：低HP时自动回血（支持emergencyCooldown多次触发）
            if (te.emergencyHeal) {
                const threshold = te.emergencyThreshold || 0.2;
                const cooldown = te.emergencyCooldown || 0;
                const canTrigger = cooldown > 0
                    ? (!this.player._emergencyCd || this.player._emergencyCd <= 0)
                    : !this.player._emergencyUsed;
                if (canTrigger && this.player.hp / this.player.maxHp < threshold) {
                    const healAmount = Math.floor(this.player.maxHp * (te.emergencyHealAmount || 0.3));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    if (cooldown > 0) {
                        this.player._emergencyCd = cooldown;
                    } else {
                        this.player._emergencyUsed = true;
                    }
                    this.addLog(`💖 紧急回复！恢复 ${healAmount} 点生命！`, 'heal');
                }
                // CD倒计时
                if (this.player._emergencyCd > 0) this.player._emergencyCd--;
            }
            // 低HP回血加成
            if (te.lowHpRegen && this.player.hp / this.player.maxHp < 0.3) {
                const lowHeal = Math.floor(this.player.maxHp * te.lowHpRegen);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + lowHeal);
            }
            // 致命护盾（lethalShield）：低HP时自动获得护盾
            if (te.lethalShield && !this.player._lethalShieldUsed && this.player.hp / this.player.maxHp < (te.lethalShieldThreshold || 0.25)) {
                const shieldAmount = Math.floor(this.player.maxHp * (te.lethalShieldAmount || 0.2));
                const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                if (existingShield) {
                    existingShield.value = Math.max(existingShield.value, shieldAmount);
                } else {
                    this.addStatusEffect(this.player, { type: 'shield', name: '致命护盾', value: shieldAmount, duration: 3 });
                }
                this.player._lethalShieldUsed = true;
                this.addLog(`🛡️ 致命护盾！获得 ${shieldAmount} 点护盾！`, 'defense');
            }
            // 冰霜新星：每隔N回合造成冰伤+减速
            if (te.frostNova && this.enemy.hp > 0) {
                this._frostNovaTimer = (this._frostNovaTimer || 0) + 1;
                const interval = te.frostNovaInterval || 3;
                if (this._frostNovaTimer >= interval) {
                    this._frostNovaTimer = 0;
                    const novaDmg = Math.floor(this.player.attack * (te.frostNovaDamage || 0.3));
                    this.applyDamage(this.enemy, { amount: novaDmg, element: 'ice', isMiss: false, isCrit: false }, this.player);
                    this.addStatusEffect(this.enemy, { type: 'slow', name: '冰霜新星', duration: 2, speedMod: te.frostNovaSlow || 0.3 });
                    this.addLog(`❄️ 冰霜新星！造成 ${novaDmg} 点冰伤并减速！`, 'element');
                    this.showDamageNumber('enemy', novaDmg, 'normal');
                }
            }
            // v1.5.4: 自动冻结（autoFreezeChance）- 每回合开始有概率冻结敌人
            if (te.autoFreezeChance && this.enemy.hp > 0 && !this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen')) {
                if (Math.random() < te.autoFreezeChance) {
                    this.addStatusEffect(this.enemy, { type: 'freeze', name: '寒冰禁锢', duration: te.freezeDuration || 1 });
                    this.addLog(`❄️ 寒冰禁锢！${this.enemy.name} 被自动冻结！`, 'element');
                }
            }
            // v1.5.4: 低血量冻结（lowHpFreezeChance）- 敌人HP低于30%时概率冻结
            if (te.lowHpFreezeChance && this.enemy.hp > 0 && this.enemy.hp / this.enemy.maxHp < 0.3) {
                if (!this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen') && Math.random() < te.lowHpFreezeChance) {
                    this.addStatusEffect(this.enemy, { type: 'freeze', name: '永冻', duration: 2 });
                    this.addLog(`❄️ 永冻！${this.enemy.name} 血量过低被冻结！`, 'element');
                }
            }
            // v2.9.5: 森林领域（forestField）- 每回合对敌人造成植物系伤害+中毒+减速
            if (te.forestField && this.enemy.hp > 0) {
                const fieldDmg = Math.floor(this.player.attack * (te.forestFieldDamage || 0.10));
                if (fieldDmg > 0) {
                    this.applyDamage(this.enemy, { amount: fieldDmg, element: 'plant', isMiss: false, isCrit: false }, this.player);
                    this.addLog(`🌲 森林领域！${this.enemy.name} 受到 ${fieldDmg} 点自然伤害！`, 'element');
                    this.showDamageNumber('enemy', fieldDmg, 'normal');
                }
                // 附加中毒
                if (te.forestFieldPoison && te.forestFieldPoison > 0) {
                    const poisonStacks = te.forestFieldPoison;
                    this.addStatusEffect(this.enemy, { type: 'poison', name: '中毒', duration: 3, dotDamage: Math.floor(this.player.attack * 0.05), stacks: poisonStacks });
                }
                // 减速
                if (te.forestFieldSlow && te.forestFieldSlow > 0) {
                    this.addStatusEffect(this.enemy, { type: 'slow', name: '森林缠绕', duration: 2, speedMod: -te.forestFieldSlow });
                }
                // 侵蚀领域：敌人防御降低
                if (te.forestFieldDefenseDown && te.forestFieldDefenseDown > 0) {
                    this.addStatusEffect(this.enemy, { type: 'curse', name: '侵蚀', duration: 2, defMod: -te.forestFieldDefenseDown });
                }
                // 生命领域：玩家每回合回血
                if (te.forestFieldHpRegen && te.forestFieldHpRegen > 0 && this.player.hp < this.player.maxHp) {
                    const regenAmount = Math.floor(this.player.maxHp * te.forestFieldHpRegen);
                    if (regenAmount > 0) {
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + regenAmount);
                        this.addLog(`🌲 生命领域！恢复 ${regenAmount} 点生命！`, 'heal');
                    }
                }
            }
        }

        // 光环/回合开始伤害可能击杀敌人
        if (this.checkBattleEnd()) {
            this._onBattleEndDuringTurn();
            return;
        }

        // 玩家被眩晕/冻结/麻痹，自动跳过回合
        if (this.isStunned(this.player)) {
            const stunEffect = this.player.statusEffects.find(e => 
                e.type === 'stun' || e.type === 'frozen' || e.type === 'paralyze' || e.skipTurn === true
            );
            const effectName = stunEffect ? stunEffect.name : '控制';
            this.addLog(`你被${effectName}，无法行动！`, 'system');
            this.isPlayerTurn = false;
            // 先更新UI，显示玩家被眩晕的状态
            if (typeof UI !== 'undefined') {
                UI.updateBattleScreen();
            }
            setTimeout(() => {
                this.enemyTurn();
            }, this.getDelay(1000));
            return;
        }
        
        this.isPlayerTurn = true;
        this.isProcessingAction = false; // 重置行动锁，允许下一次行动

        // v2.7.0: 统领威压回合数减少
        if (this.player._commanderPressure) {
            this.player._commanderPressure.turns--;
            if (this.player._commanderPressure.turns <= 0) {
                this.addLog(`👑 统领威压效果消失！`, 'buff');
                this.player._commanderPressure = null;
            }
        }

        // v2.2.0: 天赋战斗状态回合更新（形态切换、冷却减少等）
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.onTurnStart();
        }

        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }
        
        // 自动战斗
        if (this.autoBattle && this.player.hp > 0) {
            setTimeout(() => this.autoPlayerTurn(), this.getDelay(600));
        }
    }


// 导出模块集合
export const BattleEndEnemyTurn = {
    endEnemyTurn
};

export default BattleEndEnemyTurn;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleEndEnemyTurn = BattleEndEnemyTurn;
}