/**
 * 战斗系统 - 敌人回合模块
 * 
 * 从battle.js拆分出的独立敌人回合模块
 * 包含：敌人回合（enemyTurn）
 */
    enemyTurn() {
        try {
        if (!this.active || this.result) return;

        // v1.8.0: NPC队友行动（在敌人回合前）
        if (this.allies && this.allies.length > 0) {
            this.allyTurn();
            return; // allyTurn结束后会调用enemyTurn
        }

        // 检查眩晕/冻结/麻痹状态，跳过回合
        if (this.isStunned(this.enemy)) {
            const stunEffect = this.enemy.statusEffects.find(e => 
                e.type === 'stun' || e.type === 'frozen' || e.type === 'paralyze' || e.skipTurn === true
            );
            const effectName = stunEffect ? stunEffect.name : '控制';
            this.addLog(`${this.enemy.name} 被${effectName}，无法行动！`, 'system');
            this.endEnemyTurn();
            return;
        }

        // v0.70.0: 精英妖魔回合开始处理
        if (this.enemy.isElite && this.enemy.eliteMechanics) {
            this.enemy.eliteState.turnCount++;
            const em = this.enemy.eliteMechanics;
            const turn = this.enemy.eliteState.turnCount;

            // 再生（伪怖魔）
            if (em.regen_percent && this.enemy.hp > 0 && this.enemy.hp < this.enemy.maxHp) {
                const regenAmount = Math.floor(this.enemy.maxHp * em.regen_percent);
                this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + regenAmount);
                this.addLog(`🌱 ${this.enemy.name}恢复了${regenAmount}点生命！`, 'heal');
            }

            // 蛊惑（蛊惑魔蛛）：每3回合40%概率
            if (em.bewitch_chance && em.bewitch_interval && turn % em.bewitch_interval === 0) {
                if (Math.random() < em.bewitch_chance) {
                    const playerSpirit = this.player.spirit || 30;
                    const resistChance = Math.min(0.5, playerSpirit * 0.01);
                    if (Math.random() > resistChance) {
                        this.addStatusEffect(this.player, {
                            type: 'confusion',
                            name: '混乱',
                            duration: 1,
                            description: '被蛊惑，技能可能打错目标'
                        });
                        this.addLog(`🕷️ ${this.enemy.name}释放蛊惑！你陷入混乱状态！`, 'debuff');
                    } else {
                        this.addLog(`🧠 你的精神力抵抗了蛊惑！`, 'buff');
                    }
                }
            }

            // 植物墙（伪怖魔）：每回合30%概率封锁道具
            if (em.plant_wall_chance && Math.random() < em.plant_wall_chance) {
                this.addStatusEffect(this.player, {
                    type: 'item_lock',
                    name: '植物封锁',
                    duration: 1,
                    description: '被植物墙封锁，无法使用道具'
                });
                this.addLog(`🌿 ${this.enemy.name}生成植物墙！你无法使用道具！`, 'debuff');
            }

            // 投石（禁月石魔）：每3回合
            if (em.rock_throw_interval && turn % em.rock_throw_interval === 0) {
                const rockDmg = Math.floor(this.enemy.attack * 0.8);
                this.player.hp = Math.max(0, this.player.hp - rockDmg);
                this.addLog(`🪨 ${this.enemy.name}投掷巨石！造成${rockDmg}点伤害！`, 'damage');
                this.showDamageNumber('player', rockDmg, 'normal');
                this.addStatusEffect(this.player, {
                    type: 'hit_reduction',
                    name: '目眩',
                    duration: 2,
                    description: '命中率降低20%'
                });
                this.addLog(`💫 你被巨石砸得目眩，命中率降低！`, 'debuff');
            }

            // 燃烧地面（赤凌妖）：每2回合
            if (em.burning_ground_interval && turn % em.burning_ground_interval === 0) {
                this.addStatusEffect(this.player, {
                    type: 'burning_ground',
                    name: '燃烧地面',
                    duration: em.burning_ground_duration || 3,
                    description: '地面燃烧，每回合受到火系伤害',
                    damagePerTurn: Math.floor(this.enemy.attack * 0.3)
                });
                this.addLog(`🔥 ${this.enemy.name}释放烈焰，地面开始燃烧！`, 'element');
            }

            // 狂暴（诅咒畜妖）：HP<30%时攻击+30%
            if (em.berserk_hp_threshold && this.enemy.hp / this.enemy.maxHp < em.berserk_hp_threshold) {
                if (!this.enemy.eliteState.berserkActivated) {
                    this.enemy.eliteState.berserkActivated = true;
                    this.enemy.attack = Math.floor(this.enemy.attack * (1 + (em.berserk_attack_bonus || 0.3)));
                    this.addLog(`💢 ${this.enemy.name}进入狂暴状态！攻击力大幅提升！`, 'warning');
                }
            }
        }

        // v2.7.0: 机制型妖魔特性触发
        if (this.enemy.traits && this.enemy.mechanicCooldowns) {
            // 暗影潜行：进入潜行状态，下次攻击必定暴击（不替代普攻）
            const lurkTrait = this.enemy.traits.find(t => t.mechanic === 'shadow_lurk');
            if (lurkTrait && this.enemy.mechanicCooldowns['shadow_lurk'] === 0) {
                this.enemy.mechanicState.shadowLurk = true;
                this.enemy.mechanicCooldowns['shadow_lurk'] = lurkTrait.cooldown || 4;
                this.addLog(`🌑 ${this.enemy.name}融入暗影之中！下次攻击必定暴击！`, 'warning');
            }

            // 冰盾：获得护盾（不替代普通攻击）
            const iceShieldTrait = this.enemy.traits.find(t => t.mechanic === 'ice_shield');
            if (iceShieldTrait && this.enemy.mechanicCooldowns['ice_shield'] === 0) {
                const shieldAmount = iceShieldTrait.effects?.shieldAmount || 50;
                this.enemy.shield = (this.enemy.shield || 0) + shieldAmount;
                this.enemy.mechanicCooldowns['ice_shield'] = iceShieldTrait.cooldown || 4;
                this.addLog(`🧊 ${this.enemy.name}召唤冰盾！获得${shieldAmount}点护盾！`, 'buff');
            }

            // 进阶蜕变：每5回合攻击+10%（不替代普通攻击）
            const mutationTrait = this.enemy.traits.find(t => t.mechanic === 'mutation');
            if (mutationTrait && this.enemy.mechanicCooldowns['mutation'] === 0) {
                const maxStacks = mutationTrait.effects?.maxStacks || 3;
                const bonus = mutationTrait.effects?.attackBonusPerStack || 0.1;
                if (!this.enemy.mechanicState.mutationStacks) this.enemy.mechanicState.mutationStacks = 0;
                if (this.enemy.mechanicState.mutationStacks < maxStacks) {
                    this.enemy.mechanicState.mutationStacks++;
                    this.enemy.attack = Math.floor(this.enemy.attack * (1 + bonus));
                    this.addLog(`💪 ${this.enemy.name}身体发生蜕变！攻击力提升！（${this.enemy.mechanicState.mutationStacks}/${maxStacks}）`, 'warning');
                }
                this.enemy.mechanicCooldowns['mutation'] = mutationTrait.cooldown || 5;
            }

            // 疾风步：进入必定闪避状态（不替代普通攻击）
            const windStepTrait = this.enemy.traits.find(t => t.mechanic === 'dodge_next');
            if (windStepTrait && this.enemy.mechanicCooldowns['dodge_next'] === 0) {
                this.enemy.mechanicState.dodgeNext = true;
                this.enemy.mechanicCooldowns['dodge_next'] = windStepTrait.cooldown || 2;
                this.addLog(`💨 ${this.enemy.name}进入疾风步状态！下次攻击必定闪避！`, 'warning');
            }

            // 狂暴机制：HP低于阈值时触发
            const berserkTrait = this.enemy.traits.find(t => t.type === 'trigger' && t.trigger === 'low_hp');
            if (berserkTrait && !this.enemy.mechanicState.berserked) {
                const threshold = berserkTrait.threshold || 0.5;
                if (this.enemy.hp / this.enemy.maxHp < threshold) {
                    this.enemy.mechanicState.berserked = true;
                    if (berserkTrait.effects?.attackBonus) {
                        this.enemy.attack = Math.floor(this.enemy.attack * (1 + berserkTrait.effects.attackBonus));
                    }
                    if (berserkTrait.effects?.speedBonus) {
                        this.enemy.speed = Math.floor(this.enemy.speed * (1 + berserkTrait.effects.speedBonus));
                    }
                    this.addLog(`💢 ${this.enemy.name}进入狂暴状态！攻击力和速度大幅提升！`, 'warning');
                }
            }

            // 减少所有机制冷却
            for (const mech in this.enemy.mechanicCooldowns) {
                if (this.enemy.mechanicCooldowns[mech] > 0) {
                    this.enemy.mechanicCooldowns[mech]--;
                }
            }

            // 掘地突袭：检查是否在地下状态
            if (this.enemy.mechanicState.burrowed) {
                this.enemy.mechanicState.burrowed = false;
                this.enemy.mechanicState.burrowCritNext = true;
                this.addLog(`🕳️ ${this.enemy.name}从地下钻出！下次攻击必定暴击！`, 'warning');
            }

            // 检查可用机制并触发
            for (const trait of this.enemy.traits) {
                if (trait.type !== 'mechanic') continue;
                const mech = trait.mechanic;
                if (!mech || this.enemy.mechanicCooldowns[mech] === undefined) continue;
                if (this.enemy.mechanicCooldowns[mech] > 0) continue;

                // 掘地突袭：潜入地下
                if (mech === 'burrow') {
                    this.enemy.mechanicState.burrowed = true;
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.addLog(`🕳️ ${this.enemy.name}潜入地下！下回合将发动突袭！`, 'warning');
                    this.endEnemyTurn(); // 潜入地下本回合不攻击
                    return;
                }

                // 骨刺齐射
                if (mech === 'bone_spike') {
                    const spikeDmg = Math.floor(this.enemy.attack * 0.8);
                    this.addLog(`🦴 ${this.enemy.name}发射骨刺齐射！造成${spikeDmg}点伤害！`, 'damage');
                    this.showDamageNumber('player', spikeDmg, 'normal');
                    this.player.hp -= spikeDmg;
                    // 流血效果
                    if (trait.effects && trait.effects.bleedChance && Math.random() < trait.effects.bleedChance) {
                        this.addStatusEffect(this.player, {
                            type: 'bleed',
                            name: '流血',
                            duration: trait.effects.bleedDuration || 3,
                            damagePerTurn: trait.effects.bleedDamage || 8
                        });
                        this.addLog(`🩸 你被骨刺击中，开始流血！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 2;
                    this.endEnemyTurn();
                    return;
                }

                // 飞行/落地切换
                if (mech === 'fly_switch') {
                    if (!this.enemy.mechanicState.flying) {
                        this.enemy.mechanicState.flying = true;
                        this.addLog(`🦅 ${this.enemy.name}飞向天空！闪避大幅提升，但攻击力降低！`, 'warning');
                    } else {
                        this.enemy.mechanicState.flying = false;
                        this.addLog(`🐺 ${this.enemy.name}落回地面！攻击力提升，但闪避降低！`, 'warning');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 2;
                    // 切换形态后继续普通攻击
                }

                // 召唤狼群
                if (mech === 'summon_wolves') {
                    this.addLog(`🐺 ${this.enemy.name}发出狼啸！召唤了${trait.summonCount || 2}只独眼魔狼！`, 'warning');
                    // 简化处理：召唤狼群造成伤害（实际多敌人系统较复杂）
                    const summonDmg = Math.floor(this.enemy.attack * 0.5 * (trait.summonCount || 2));
                    this.player.hp -= summonDmg;
                    this.showDamageNumber('player', summonDmg, 'normal');
                    this.addLog(`狼群围攻造成${summonDmg}点伤害！`, 'damage');
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 风刃风暴
                if (mech === 'aoe_wind') {
                    const aoeDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.5));
                    this.addLog(`🌪️ ${this.enemy.name}释放风刃风暴！造成${aoeDmg}点风系伤害！`, 'element');
                    this.player.hp -= aoeDmg;
                    this.showDamageNumber('player', aoeDmg, 'wind');
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 4;
                    this.endEnemyTurn();
                    return;
                }

                // 三段冲刺
                if (mech === 'multi_strike') {
                    const strikeCount = trait.effects?.strikeCount || 3;
                    const decay = trait.effects?.damageDecay || 0.7;
                    let totalDmg = 0;
                    for (let i = 0; i < strikeCount; i++) {
                        const strikeDmg = Math.floor(this.enemy.attack * Math.pow(decay, i));
                        totalDmg += strikeDmg;
                        this.showDamageNumber('player', strikeDmg, 'normal');
                    }
                    this.addLog(`⚡ ${this.enemy.name}发动三段冲刺！连续攻击${strikeCount}次，共造成${totalDmg}点伤害！`, 'damage');
                    this.player.hp -= totalDmg;
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 飞沙走石
                if (mech === 'sand_breath') {
                    const sandDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 0.8));
                    this.addLog(`🌪️ ${this.enemy.name}吐出飞沙走石！造成${sandDmg}点土系伤害！`, 'element');
                    this.player.hp -= sandDmg;
                    this.showDamageNumber('player', sandDmg, 'earth');
                    // 致盲效果
                    if (trait.effects?.blindChance && Math.random() < trait.effects.blindChance) {
                        this.addStatusEffect(this.player, {
                            type: 'blind',
                            name: '致盲',
                            duration: trait.effects.blindDuration || 2,
                            description: '被沙尘迷眼，命中率降低20%',
                            hitRateMod: -0.2
                        });
                        this.addLog(`👁️ 你被沙尘迷眼，命中率降低！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 2;
                    this.endEnemyTurn();
                    return;
                }

                // 极速冲锋
                if (mech === 'charge') {
                    const chargeDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.5));
                    this.addLog(`💨 ${this.enemy.name}发动极速冲锋！造成${chargeDmg}点伤害！`, 'damage');
                    this.player.hp -= chargeDmg;
                    this.showDamageNumber('player', chargeDmg, 'normal');
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 战争践踏
                if (mech === 'stomp') {
                    const stompDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.2));
                    this.addLog(`💥 ${this.enemy.name}发动战争践踏！造成${stompDmg}点伤害！`, 'damage');
                    this.player.hp -= stompDmg;
                    this.showDamageNumber('player', stompDmg, 'normal');
                    // 眩晕效果
                    if (trait.effects?.stunChance && Math.random() < trait.effects.stunChance) {
                        this.addStatusEffect(this.player, {
                            type: 'stun',
                            name: '眩晕',
                            duration: trait.effects.stunDuration || 1,
                            description: '被践踏震晕，无法行动'
                        });
                        this.addLog(`😵 你被震晕了！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 恐惧尖啸
                if (mech === 'screech') {
                    const screechDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 0.6));
                    this.addLog(`👻 ${this.enemy.name}发出恐惧尖啸！造成${screechDmg}点精神伤害！`, 'element');
                    this.player.hp -= screechDmg;
                    this.showDamageNumber('player', screechDmg, 'dark');
                    // 恐惧效果
                    if (trait.effects?.fearChance && Math.random() < trait.effects.fearChance) {
                        this.addStatusEffect(this.player, {
                            type: 'fear',
                            name: '恐惧',
                            duration: trait.effects.fearDuration || 2,
                            description: '陷入恐惧，攻击力降低20%',
                            attackMod: -Math.floor((trait.effects.attackDebuff || 0.2) * 100)
                        });
                        this.addLog(`😨 你陷入恐惧状态，攻击力降低！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 邪眼凝视
                if (mech === 'gaze') {
                    const gazeDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 0.7));
                    this.addLog(`👁️ ${this.enemy.name}用邪眼凝视你！造成${gazeDmg}点精神伤害！`, 'element');
                    this.player.hp -= gazeDmg;
                    this.showDamageNumber('player', gazeDmg, 'dark');
                    // 混乱效果
                    if (trait.effects?.confuseChance && Math.random() < trait.effects.confuseChance) {
                        this.addStatusEffect(this.player, {
                            type: 'confusion',
                            name: '混乱',
                            duration: trait.effects.confuseDuration || 2,
                            description: '被邪眼蛊惑，技能可能打错目标'
                        });
                        this.addLog(`🌀 你被邪眼蛊惑，陷入混乱！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 火焰爆裂
                if (mech === 'fire_burst') {
                    const burstDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.3));
                    this.addLog(`🔥 ${this.enemy.name}释放火焰爆裂！造成${burstDmg}点火系伤害！`, 'element');
                    this.player.hp -= burstDmg;
                    this.showDamageNumber('player', burstDmg, 'fire');
                    // 燃烧效果
                    if (trait.effects?.burnChance && Math.random() < trait.effects.burnChance) {
                        this.addStatusEffect(this.player, {
                            type: 'burn',
                            name: '燃烧',
                            duration: trait.effects.burnDuration || 3,
                            description: '被火焰灼烧，每回合受到伤害',
                            damagePerTurn: trait.effects.burnDamage || 8
                        });
                        this.addLog(`🔥 你被火焰灼烧，开始燃烧！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 荆棘射击
                if (mech === 'thorn_shot') {
                    const thornDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.0));
                    this.addLog(`🌿 ${this.enemy.name}发射荆棘！造成${thornDmg}点伤害！`, 'damage');
                    this.player.hp -= thornDmg;
                    this.showDamageNumber('player', thornDmg, 'normal');
                    // 束缚效果
                    if (trait.effects?.bindChance && Math.random() < trait.effects.bindChance) {
                        this.addStatusEffect(this.player, {
                            type: 'bind',
                            name: '束缚',
                            duration: trait.effects.bindDuration || 1,
                            description: '被藤蔓束缚，无法行动',
                            skipTurn: true
                        });
                        this.addLog(`🌿 你被藤蔓束缚，无法行动！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 腐蚀酸液
                if (mech === 'acid_spray') {
                    const acidDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 0.9));
                    this.addLog(`🧪 ${this.enemy.name}喷射腐蚀酸液！造成${acidDmg}点伤害！`, 'element');
                    this.player.hp -= acidDmg;
                    this.showDamageNumber('player', acidDmg, 'earth');
                    // 防御降低
                    if (trait.effects?.defenseDown) {
                        this.addStatusEffect(this.player, {
                            type: 'defense_down',
                            name: '腐蚀',
                            duration: trait.effects.defenseDownDuration || 3,
                            description: `被酸液腐蚀，防御降低${Math.floor(trait.effects.defenseDown * 100)}%`,
                            defenseMod: -Math.floor(this.player.defense * trait.effects.defenseDown)
                        });
                        this.addLog(`🛡️ 你的防御被酸液腐蚀降低！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 骨剑斩击
                if (mech === 'bone_slash') {
                    const slashDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.4));
                    this.addLog(`⚔️ ${this.enemy.name}发动骨剑斩击！造成${slashDmg}点伤害！`, 'damage');
                    this.player.hp -= slashDmg;
                    this.showDamageNumber('player', slashDmg, 'normal');
                    // 破甲效果
                    if (trait.effects?.armorBreak) {
                        this.addStatusEffect(this.player, {
                            type: 'armor_break',
                            name: '破甲',
                            duration: trait.effects.armorBreakDuration || 2,
                            description: `被破甲，防御降低${Math.floor(trait.effects.armorBreak * 100)}%`,
                            defenseMod: -Math.floor(this.player.defense * trait.effects.armorBreak)
                        });
                        this.addLog(`🛡️ 你的护甲被击破！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 诅咒削弱
                if (mech === 'curse') {
                    const curseDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 0.5));
                    this.addLog(`💀 ${this.enemy.name}释放诅咒！造成${curseDmg}点暗影伤害！`, 'element');
                    this.player.hp -= curseDmg;
                    this.showDamageNumber('player', curseDmg, 'dark');
                    // 攻击降低
                    if (trait.effects?.attackDebuff) {
                        this.addStatusEffect(this.player, {
                            type: 'attack_down',
                            name: '诅咒',
                            duration: trait.effects.debuffDuration || 2,
                            description: `被诅咒，攻击降低${Math.floor(trait.effects.attackDebuff * 100)}%`,
                            attackMod: -Math.floor(this.player.attack * trait.effects.attackDebuff)
                        });
                        this.addLog(`⚔️ 你的攻击力被诅咒降低！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 暗影火球
                if (mech === 'shadow_fireball') {
                    const fireballDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.5));
                    this.addLog(`🔥 ${this.enemy.name}释放暗影火球！造成${fireballDmg}点暗火混合伤害！`, 'element');
                    this.player.hp -= fireballDmg;
                    this.showDamageNumber('player', fireballDmg, 'fire');
                    // 燃烧效果
                    if (trait.effects?.burnChance && Math.random() < trait.effects.burnChance) {
                        this.addStatusEffect(this.player, {
                            type: 'burn',
                            name: '暗焰燃烧',
                            duration: trait.effects.burnDuration || 3,
                            description: '被暗焰灼烧，每回合受到伤害',
                            damagePerTurn: trait.effects.burnDamage || 10
                        });
                        this.addLog(`🔥 你被暗焰灼烧！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 暗黑冰刺
                if (mech === 'dark_ice_spike') {
                    const iceDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.6));
                    this.addLog(`❄️ ${this.enemy.name}释放暗黑冰刺！造成${iceDmg}点暗冰混合伤害！`, 'element');
                    this.player.hp -= iceDmg;
                    this.showDamageNumber('player', iceDmg, 'ice');
                    // 冻结效果
                    if (trait.effects?.freezeChance && Math.random() < trait.effects.freezeChance) {
                        this.addStatusEffect(this.player, {
                            type: 'frozen',
                            name: '冻结',
                            duration: trait.effects.freezeDuration || 1,
                            description: '被冰刺冻结，无法行动',
                            skipTurn: true
                        });
                        this.addLog(`❄️ 你被冰刺冻结了！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 暗影诅咒
                if (mech === 'shadow_curse') {
                    const curseDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 0.8));
                    this.addLog(`💀 ${this.enemy.name}释放暗影诅咒！造成${curseDmg}点暗影伤害！`, 'element');
                    this.player.hp -= curseDmg;
                    this.showDamageNumber('player', curseDmg, 'dark');
                    // 攻击降低
                    if (trait.effects?.attackDebuff) {
                        this.addStatusEffect(this.player, {
                            type: 'attack_down',
                            name: '暗影诅咒',
                            duration: trait.effects.debuffDuration || 3,
                            description: `被暗影诅咒，攻击降低${Math.floor(trait.effects.attackDebuff * 100)}%`,
                            attackMod: -Math.floor(this.player.attack * trait.effects.attackDebuff)
                        });
                    }
                    // 防御降低
                    if (trait.effects?.defenseDebuff) {
                        this.addStatusEffect(this.player, {
                            type: 'defense_down',
                            name: '暗影诅咒',
                            duration: trait.effects.debuffDuration || 3,
                            description: `被暗影诅咒，防御降低${Math.floor(trait.effects.defenseDebuff * 100)}%`,
                            defenseMod: -Math.floor(this.player.defense * trait.effects.defenseDebuff)
                        });
                    }
                    if (trait.effects?.attackDebuff || trait.effects?.defenseDebuff) {
                        this.addLog(`💀 你被暗影诅咒，属性降低！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 3;
                    this.endEnemyTurn();
                    return;
                }

                // 撕咬
                if (mech === 'bite') {
                    const biteDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.2));
                    this.addLog(`🦷 ${this.enemy.name}撕咬！造成${biteDmg}点伤害！`, 'damage');
                    this.player.hp -= biteDmg;
                    this.showDamageNumber('player', biteDmg, 'normal');
                    // 流血效果
                    if (trait.effects?.bleedChance && Math.random() < trait.effects.bleedChance) {
                        this.addStatusEffect(this.player, {
                            type: 'bleed',
                            name: '流血',
                            duration: trait.effects.bleedDuration || 2,
                            damagePerTurn: trait.effects.bleedDamage || 3
                        });
                        this.addLog(`🩸 你被撕咬，开始流血！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 4;
                    this.endEnemyTurn();
                    return;
                }

                // 快速撕咬（多段攻击）
                if (mech === 'double_strike') {
                    const strikeCount = trait.effects?.strikeCount || 2;
                    const multiplier = trait.effects?.damageMultiplier || 0.8;
                    let totalDmg = 0;
                    for (let i = 0; i < strikeCount; i++) {
                        const strikeDmg = Math.floor(this.enemy.attack * multiplier);
                        totalDmg += strikeDmg;
                        this.showDamageNumber('player', strikeDmg, 'normal');
                    }
                    this.addLog(`⚡ ${this.enemy.name}快速撕咬！连续攻击${strikeCount}次，共造成${totalDmg}点伤害！`, 'damage');
                    this.player.hp -= totalDmg;
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 5;
                    this.endEnemyTurn();
                    return;
                }

                // 猛砸
                if (mech === 'smash') {
                    const smashDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.3));
                    this.addLog(`💥 ${this.enemy.name}猛砸地面！造成${smashDmg}点伤害！`, 'damage');
                    this.player.hp -= smashDmg;
                    this.showDamageNumber('player', smashDmg, 'normal');
                    // 眩晕效果
                    if (trait.effects?.stunChance && Math.random() < trait.effects.stunChance) {
                        this.addStatusEffect(this.player, {
                            type: 'stun',
                            name: '眩晕',
                            duration: trait.effects.stunDuration || 1,
                            description: '被砸晕，无法行动'
                        });
                        this.addLog(`😵 你被砸晕了！`, 'debuff');
                    }
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 4;
                    this.endEnemyTurn();
                    return;
                }

                // 相位突袭
                if (mech === 'phase_strike') {
                    const phaseDmg = Math.floor(this.enemy.attack * (trait.effects?.damageMultiplier || 1.3));
                    this.addLog(`👻 ${this.enemy.name}相位突袭！造成${phaseDmg}点伤害（必定命中）！`, 'damage');
                    this.player.hp -= phaseDmg;
                    this.showDamageNumber('player', phaseDmg, 'dark');
                    this.enemy.mechanicCooldowns[mech] = trait.cooldown || 4;
                    this.endEnemyTurn();
                    return;
                }
            }
        }

        // 处理敌人引导中的魔法
        if (this.enemyCasting) {
            this.enemyCasting.progress++;
            if (this.enemyCasting.progress >= this.enemyCasting.totalTime) {
                const skill = this.enemyCasting.skill;
                this.enemyCasting = null;
                this.addLog(`${this.enemy.name} 的 ${skill.name} 引导完成！`, 'magic');
                
                // 发布技能完成事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.SKILL_COMPLETE, {
                        caster: 'enemy',
                        skill: skill,
                        enemy: this.enemy
                    });
                }
                
                this.castSkillImmediate(skill, 'enemy', true, true, 0.5);
                // 引导完成后继续执行后续逻辑
                this.endEnemyTurn();
                return;
            }
        }

        // 狩猎战模式：妖魔血量低时会尝试逃跑
        if (this.battleOptions.mode === 'hunt' && this.enemy.hp / this.enemy.maxHp < 0.3) {
            // 基础逃跑概率30%，速度差每多1点+2%成功率
            const speedDiff = this.enemy.speed - this.player.speed;
            let fleeChance = Math.min(0.8, Math.max(0.1, 0.3 + speedDiff * 0.02));
            
            // 被减速/控制时逃跑成功率降低
            const enemyHasSlow = this.enemy.statusEffects?.some(e => 
                e.type === 'slow' || e.type === 'bind' || e.type === 'stun' || e.type === 'frozen' || e.type === 'paralyze'
            );
            if (enemyHasSlow) {
                fleeChance *= 0.4;  // 被控制时逃跑成功率大幅降低
            }
            
            if (Math.random() < fleeChance) {
                this.addLog(`${this.enemy.name} 见势不妙，转身逃跑了！`, 'system');
                this.result = 'flee';
                this.active = false;
                // 妖魔逃跑，玩家只能得到部分奖励
                this.huntFled = true;
                this.endBattle();
                return;
            } else {
                this.addLog(`${this.enemy.name} 试图逃跑，但被你拦住了！`, 'system');
                // 逃跑失败后，妖魔会更狂暴（攻击+15%）
                if (!this.huntFailed) {
                    this.huntFailed = true;
                    this.enemy.attack = Math.floor(this.enemy.attack * 1.15);
                    this.addLog(`${this.enemy.name} 逃跑失败，变得更加狂暴了！`, 'crit');
                }
            }
        }

        // 敌人AI选择行动
        const action = this.enemyAI();
        
        // 保护：如果AI返回无效行动，默认普通攻击
        if (!action || !action.type) {
            console.warn('[Battle] 敌人AI返回无效行动，使用默认普通攻击');
            this.addLog(`${this.enemy.name} 发动攻击！`, 'attack');
            this.applyDamage(this.player, this.calculateDamage(
                this.enemy.attack,
                this.player.defense * (this.player.isDefending ? 2 : 1),
                1.0,
                0.05,
                0.9,
                'physical',
                null,
                this.player,
                this.enemy
            ), this.enemy);
            this.endEnemyTurn();
            return;
        }

        if (action.type === 'attack') {
            // 普通攻击
            // 计算伤害（含攻击者状态修正）
            const enemyMods = this.getStatusModifiers(this.enemy);
            
            // 天赋：首次攻击必定暴击
            let critRate = 0.05;
            let firstStrikeBonus = 0;
            if (!this.enemy.firstAttackDone && this.enemy.traits) {
                const firstStrikeTrait = this.enemy.traits.find(t => t.type === 'first_strike');
                if (firstStrikeTrait) {
                    critRate = 1.0; // 必定暴击
                    if (firstStrikeTrait.effects && firstStrikeTrait.effects.firstDamageBonus) {
                        firstStrikeBonus = firstStrikeTrait.effects.firstDamageBonus;
                    }
                    this.addLog(`${this.enemy.name} 发动暗影突袭！`, 'crit');
                }
            }
            
            const damage = this.calculateDamage(
                this.enemy.attack + enemyMods.attackMod,
                this.player.defense * (this.player.isDefending ? 2 : 1) * (this.summon && this.player.talentEffects?.summonMasterDefBonus ? (1 + this.player.talentEffects.summonMasterDefBonus) : 1),
                1.0 + firstStrikeBonus,
                critRate,
                0.9,
                'physical',
                null,
                this.player,
                this.enemy
            );
            
            // 标记首次攻击已完成
            if (!this.enemy.firstAttackDone) {
                this.enemy.firstAttackDone = true;
            }

            // 防御减伤
            if (this.player.isDefending) {
                damage.amount = Math.floor(damage.amount * 0.5);
            }

            this.applyDamage(this.player, damage, this.enemy);

            // v2.2.0: 土系天赋 - 受击积累岩力
            if (!damage.isMiss && typeof TalentCombatSystem !== 'undefined' && this.player.talentEffects) {
                const te = this.player.talentEffects;
                if (te.earthEnergyGain) {
                    const reachedMax = TalentCombatSystem.addEnergy('earth', te.earthEnergyGain, te.earthEnergyMax || 10);
                    if (reachedMax && te.earthCounterOnMax) {
                        // 岩力满层触发反击
                        this.addLog(`🪨 岩力已满！触发岩刺反击！`, 'buff');
                        TalentCombatSystem.resetEnergy('earth');
                    }
                    // v2.3.0: 土+暗组合 - 岩刺诅咒：受击时给敌人上诅咒
                    if (te.curseMax) {
                        if (!this.enemy.curseStacks) this.enemy.curseStacks = 0;
                        this.enemy.curseStacks = Math.min(te.curseMax, this.enemy.curseStacks + 1);
                        this.addLog(`🌑 岩刺诅咒！敌人诅咒+1（${this.enemy.curseStacks}/${te.curseMax}）`, 'element');
                    }
                }
            }

            // 天赋：闪避后效果
            if (damage.isMiss && this.player.talentEffects) {
                const te = this.player.talentEffects;
                // v2.2.0: 风系天赋 - 闪避触发疾风状态
                if (te.windStreakOnDodge && typeof TalentCombatSystem !== 'undefined') {
                    TalentCombatSystem.triggerWindStreak(te.windStreakTurns || 1);
                    this.addLog(`💨 疾风！下次攻击连击2次！`, 'buff');
                    // v2.3.0: 火+风组合 - 火焰风暴：闪避后燃点+3
                    if (te.fireEnergyGain && TalentCombatSystem.state) {
                        TalentCombatSystem.addEnergy('fire', 3, te.fireEnergyMax || 10);
                        this.addLog(`🔥 火焰风暴！闪避触发燃点+3！`, 'element');
                    }
                }
                if (te.dodgeCritBuff) {
                    this.player._dodgeCritBuff = te.dodgeCritBuff;
                    this.addLog(`🌪️ 风遁！下次攻击暴击伤害提升！`, 'buff');
                }
                if (te.dodgeCritDamage) {
                    this.player._dodgeCritDamage = te.dodgeCritDamage;
                }
                // 闪避后下次必暴（dodgeNextHitBonus）
                if (te.dodgeNextHitBonus) {
                    this.player._dodgeNextCrit = true;
                    this.addLog(`🌪️ 看破！下次攻击必定暴击！`, 'buff');
                }
                if (te.dodgeHeal) {
                    const healAmount = Math.floor(this.player.maxHp * te.dodgeHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🌪️ 风遁回春！恢复 ${healAmount} 点生命！`, 'heal');
                }
                if (te.dodgeMpRestore) {
                    const mpAmount = Math.floor(this.player.maxHp * te.dodgeMpRestore);
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpAmount);
                    this.addLog(`🌪️ 风遁回蓝！恢复 ${mpAmount} 点MP！`, 'heal');
                }
                // v1.5.5: 闪避反击（dodgeCounter）- 闪避成功后反击
                if (te.dodgeCounter) {
                    const counterDmg = Math.floor(this.player.attack * (te.dodgeCounterDamage || 0.8));
                    const isCrit = te.dodgeCounterCrit ? true : false;
                    this.applyDamage(this.enemy, { amount: counterDmg, element: 'wind', isCrit: isCrit, isMiss: false }, this.player);
                    this.addLog(`🌪️ 闪避反击！造成 ${counterDmg} 点风伤${isCrit ? '（暴击！）' : ''}！`, 'counter');
                    this.showDamageNumber('enemy', counterDmg, isCrit ? 'crit' : 'normal');
                }
            }
            
            // 天赋：攻击命中效果（流血等）
            if (!damage.isMiss && damage.amount > 0) {
                this.processTraitsOnHit(this.enemy, this.player, damage.amount, false);
            }
            // 天赋：低HP时冻结攻击者（lowHpFreezeChance）
            if (!damage.isMiss && this.player.talentEffects && this.player.talentEffects.lowHpFreezeChance) {
                const hpRatio = this.player.hp / this.player.maxHp;
                if (hpRatio < 0.3 && Math.random() < this.player.talentEffects.lowHpFreezeChance) {
                    const alreadyFrozen = this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
                    if (!alreadyFrozen) {
                        this.addStatusEffect(this.enemy, {
                            type: 'freeze', name: '寒冰反制', duration: 1
                        });
                        this.addLog(`❄️ 寒冰反制！${this.enemy.name} 被冰冻了！`, 'element');
                    }
                }
            }

            this.addLog(`${this.enemy.name} 发动攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 
                damage.isCrit ? 'crit' : 'damage');
            
            // 敌人攻击冲刺动画
            if (typeof UI !== 'undefined' && UI.playAttackAnimation) UI.playAttackAnimation(false);
            
            // 显示浮动伤害数字
            if (!damage.isMiss) {
                const dmgType = damage.isCrit ? 'crit' : 'normal';
                this.showDamageNumber('player', damage.amount, dmgType);
                // 玩家受击动画
                setTimeout(() => {
                    if (typeof UI !== 'undefined' && UI.playHitAnimation) UI.playHitAnimation(true, damage.isCrit);
                }, 150);
            } else {
                // 玩家闪避飘字
                this.showDamageNumber('player', 0, 'dodge');
            }

            // v2.9.4: 统一打断判定（玩家引导期间被敌人攻击命中）
            if (this.playerCasting && !damage.isMiss) {
                const skill = this.playerCasting.skill;
                const castTime = this.playerCasting.totalTime;
                // 统一公式：基础概率(castTime) × 难度系数 + 精神力差 - 境界减免 - 防御姿态
                const interruptChance = this.calculateInterruptChance(castTime, skill, this.player, this.enemy, this.playerDefendedLastTurn);

                if (Math.random() < interruptChance) {
                    this.addLog(`💥 你的 ${skill.name} 引导被打断了！（打断概率 ${(interruptChance*100).toFixed(0)}%）`, 'interrupt');
                    // 红色闪烁反馈
                    const battleScreen = document.getElementById('battle-screen');
                    if (battleScreen) {
                        const flash = document.createElement('div');
                        flash.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(255,50,50,0.4);z-index:9999;pointer-events:none;animation:flashRed 0.5s ease-out;';
                        battleScreen.appendChild(flash);
                        setTimeout(() => flash.remove(), 500);
                    }
                    this.playerCasting = null;

                    // 发布打断事件
                    if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                        BattleEventBus.emit(BattleEvents.INTERRUPT, {
                            attacker: 'enemy',
                            target: 'player',
                            skill: skill
                        });
                    }
                }
            }
            
            // 发布敌人攻击事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.ENEMY_ATTACK, {
                    damage: damage.amount,
                    isCrit: damage.isCrit,
                    isMiss: damage.isMiss,
                    damageType: 'physical',
                    enemy: this.enemy
                });
                
                // 发布更细粒度的事件
                if (damage.isMiss) {
                    BattleEventBus.emit(BattleEvents.MISS, {
                        attacker: 'enemy',
                        target: 'player',
                        damageType: 'physical',
                        enemy: this.enemy
                    });
                } else {
                    BattleEventBus.emit(BattleEvents.HIT, {
                        attacker: 'enemy',
                        target: 'player',
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'physical',
                        enemy: this.enemy
                    });
                    
                    if (damage.isCrit) {
                        BattleEventBus.emit(BattleEvents.CRIT, {
                            attacker: 'enemy',
                            target: 'player',
                            damage: damage.amount,
                            damageType: 'physical',
                            enemy: this.enemy
                        });
                    }
                    
                    BattleEventBus.emit(BattleEvents.DAMAGE, {
                        target: 'player',
                        attacker: 'enemy',
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'physical',
                        enemy: this.enemy
                    });
                }
            }

        } else if (action.type === 'skill') {
            // 使用技能
            const skill = SkillSystem.getSkill(action.skillId);
            if (skill && this.enemy.mp >= skill.mpCost) {
                // 计算引导时间（精神力越高越快）
                const baseCastTime = this.getCastTime(skill.tier);
                const spirit = this.enemy.spirit || 20;
                const castTime = Math.max(1, Math.floor(baseCastTime * (100 - spirit * 0.5) / 100));

                // v2.9.0: 只有魔法师类型的敌人才有引导/打断机制，妖魔直接瞬发
                const isMageEnemy = this.enemy.isMage === true || this.enemy.enemyType === 'mage';
                
                if (castTime <= 1 || skill.type === 'buff' || skill.targetType === 'self' || !isMageEnemy) {
                    // 瞬发（妖魔不引导，直接释放）
                    this.castSkillImmediate(skill, 'enemy');
                    return;
                } else {
                    // 开始引导（仅魔法师敌人）
                    this.enemyCasting = {
                        skillId: action.skillId,
                        skill: skill,
                        progress: 1,
                        totalTime: castTime
                    };
                    // v2.9.4: 引导开始时只扣50%预付款，引导完成时扣剩余50%
                    const enemyPrepayMp = Math.floor(skill.mpCost * 0.5);
                    this.enemy.mp -= enemyPrepayMp;
                    this.enemyCasting.prepayMp = enemyPrepayMp;
                    this.enemyCasting.fullMpCost = skill.mpCost;
                    this.addLog(`${this.enemy.name} 开始引导 ${skill.name}...`, 'magic');
                    
                    // 发布技能引导事件
                    if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                        BattleEventBus.emit(BattleEvents.SKILL_CHANNEL, {
                            caster: 'enemy',
                            skill: skill,
                            totalTime: castTime,
                            enemy: this.enemy
                        });
                    }
                }
            }
        } else if (action.type === 'defend') {
            // 防御
            this.enemy.isDefending = true;
            this.addLog(`${this.enemy.name} 进入防御姿态，防御力提升！`, 'system');
            
            // 发布防御事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.DEFEND, {
                    caster: 'enemy',
                    enemy: this.enemy
                });
            }
        }

        this.endEnemyTurn();
        } catch (e) {
            console.error('[Battle] enemyTurn出错:', e);
            this.addLog(`${this.enemy.name}行动出错: ${e.message}，跳过回合`, 'system');
            // 确保回合能结束
            this.endEnemyTurn();
        }
    },

// 导出模块集合
export const BattleEnemyTurn = {
    enemyTurn
};

export default BattleEnemyTurn;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleEnemyTurn = BattleEnemyTurn;
}