/**
 * 战斗系统 - 伤害计算模块
 * 
 * 从battle.js拆分出的独立伤害计算模块
 * 包含：伤害计算（calculateDamage）、伤害应用（applyDamage）
 */
    /**
     * 计算伤害
     */
export function calculateDamage(attack, defense, multiplier, critRate, hitRate, element, targetElement, target, attacker) {
        const result = {
            amount: 0,
            isCrit: false,
            isMiss: false,
            element: element,
            elementEffect: null  // 'super' | 'weak' | 'normal'
        };
        
        // 应用攻击者的增益效果
        if (attacker) {
            const attackerMods = this.getStatusModifiers(attacker);
            hitRate += attackerMods.hitRateMod;
            critRate += attackerMods.critRateMod;
        }

        // v2.7.0: 掘地突袭 - 从地下钻出后必定暴击
        if (attacker === this.enemy && this.enemy.mechanicState?.burrowCritNext) {
            critRate = 1.0;
            attack = Math.floor(attack * 1.5);
            this.enemy.mechanicState.burrowCritNext = false;
        }

        // v2.7.8: 暗影潜行 - 下次攻击必定暴击
        if (attacker === this.enemy && this.enemy.mechanicState?.shadowLurk) {
            critRate = 1.0;
            attack = Math.floor(attack * 1.5);
            this.enemy.mechanicState.shadowLurk = false;
            this.addLog(`🌑 ${this.enemy.name}从暗影中突袭！暴击！`, 'damage');
        }

        // v2.7.0: 飞行状态 - 飞行时攻击-20%，落地时攻击+30%
        if (attacker === this.enemy && this.enemy.mechanicState?.flying !== undefined) {
            const flyTrait = this.enemy.traits?.find(t => t.mechanic === 'fly_switch');
            if (flyTrait?.effects) {
                if (this.enemy.mechanicState.flying) {
                    attack = Math.floor(attack * (1 - (flyTrait.effects.flyingAttackPenalty || 0.2)));
                } else {
                    attack = Math.floor(attack * (1 + (flyTrait.effects.groundAttackBonus || 0.3)));
                }
            }
        }

        // v2.7.0: 统领威压 - 玩家攻击减益
        if (attacker === this.player && this.player._commanderPressure) {
            attack = Math.floor(attack * (1 - this.player._commanderPressure.attackDebuff));
        }

        // v2.2.0: 水系潮汐形态 - 涨潮输出+30%，退潮输出-20%
        if (element === 'water' && attacker === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
            const waterForm = TalentCombatSystem.getWaterForm();
            if (waterForm === 'tide') {
                attack = Math.floor(attack * 1.30);
            } else if (waterForm === 'ebb') {
                attack = Math.floor(attack * 0.80);
            }
        }

        // v2.2.0: 光系形态 - 圣光形态输出+20%，圣盾形态输出-10%
        if (element === 'light' && attacker === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
            const lightForm = TalentCombatSystem.getLightForm();
            if (lightForm === 'holy') {
                attack = Math.floor(attack * 1.20);
                // v2.3.0: 水+光组合 - 形态协同：涨潮时光系额外+10%
                if (TalentCombatSystem.getWaterForm() === 'tide' && this.player.talentEffects?.waterFormAuto) {
                    attack = Math.floor(attack * 1.10);
                }
            } else if (lightForm === 'shield') {
                attack = Math.floor(attack * 0.90);
            }
        }

        // v2.2.0: 植物系生长 - 每层+5%伤害
        if (element === 'plant' && attacker === this.player && this.player.plantGrowthStacks) {
            attack = Math.floor(attack * (1 + this.player.plantGrowthStacks * 0.05));
        }

        // v2.4.0: 火+冰组合 - 融化：火系对冻结目标伤害+50%
        if (element === 'fire' && attacker === this.player && target && target.statusEffects) {
            const isFrozen = target.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            const hasIceTalent = this.player.talentEffects && (this.player.talentEffects.frostStackMax || this.player.talentEffects.freezeChance);
            if (isFrozen && hasIceTalent) {
                attack = Math.floor(attack * 1.50);
            }
        }

        // v2.4.0: 雷+水组合 - 感电：雷系对潮湿目标伤害+30%
        if (element === 'thunder' && attacker === this.player && target && target.statusEffects) {
            const isWet = target.statusEffects.some(e => e.type === 'wet' || e.type === 'soaked' || e.type === 'water');
            const hasWaterTalent = this.player.talentEffects && this.player.talentEffects.waterFormAuto;
            if (isWet && hasWaterTalent) {
                attack = Math.floor(attack * 1.30);
            }
        }

        // v2.4.0: 冰+风组合 - 暴风雪：疾风状态下冰系伤害+30%
        if (element === 'ice' && attacker === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
            if (TalentCombatSystem.hasWindStreak() && this.player.talentEffects?.windStreakOnDodge) {
                attack = Math.floor(attack * 1.30);
            }
        }

        // 命中判定（考虑目标闪避修正）
        let evasion = 0;
        if (target) {
            const mods = this.getStatusModifiers(target);
            evasion = mods.evasionMod;

            // 麻痹状态不可闪避（paralyzeNoDodge）
            const isParalyzed = target.statusEffects && target.statusEffects.some(e => e.type === 'paralyze');
            if (isParalyzed && attacker && attacker.talentEffects && attacker.talentEffects.paralyzeNoDodge) {
                evasion = 0;
            }
            // 无视闪避（ignoreDodgeChance）
            if (attacker && attacker.talentEffects && attacker.talentEffects.ignoreDodgeChance) {
                if (Math.random() < attacker.talentEffects.ignoreDodgeChance) evasion = 0;
            }
            // 低HP闪避加成（lowHpDodgeBonus）
            if (target === this.player && target.talentEffects && target.talentEffects.lowHpDodgeBonus) {
                if (target.hp / target.maxHp < 0.3) evasion += target.talentEffects.lowHpDodgeBonus;
            }
            // 免疫致盲（blindImmunity）：致盲状态不影响命中
            if (attacker === this.player && attacker.talentEffects && attacker.talentEffects.blindImmunity) {
                // 清除致盲的命中惩罚
                if (attackerMods && attackerMods.hitMod) attackerMods.hitMod = 0;
            }

            // 下次必定闪避
            if (mods.nextDodgeGuaranteed) {
                result.isMiss = true;
                // 消耗掉必定闪避效果
                if (target.buffs) {
                    target.buffs = target.buffs.filter(b => b.type !== 'next_dodge_guaranteed');
                }
                return result;
            }
            
            // 天赋：闪避加成
            if (target.traitBonuses && target.traitBonuses.dodgeBonus) {
                evasion += target.traitBonuses.dodgeBonus;
            }
            // 玩家天赋闪避
            if (target === this.player && target.dodgeBonus) {
                evasion += target.dodgeBonus;
            }
            // v2.7.3: 疾风步必定闪避
            if (target === this.enemy && target.mechanicState?.dodgeNext) {
                target.mechanicState.dodgeNext = false;
                result.isMiss = true;
                this.addLog(`💨 ${target.name}用疾风步闪避了攻击！`, 'dodge');
                return result;
            }
            // v2.7.0: 飞行状态闪避加成
            if (target === this.enemy && target.mechanicState?.flying) {
                const flyTrait = target.traits?.find(t => t.mechanic === 'fly_switch');
                if (flyTrait?.effects?.flyingDodge) {
                    evasion += flyTrait.effects.flyingDodge;
                } else {
                    evasion += 0.5; // 默认飞行闪避+50%
                }
            }
        }
        if (Math.random() > (hitRate - evasion)) {
            result.isMiss = true;
            return result;
        }

        // 应用目标的防御修饰符（如恐惧尖叫降低防御、buff提升防御等）
        if (target) {
            const targetMods = this.getStatusModifiers(target);
            defense = Math.max(0, defense + targetMods.defenseMod);
            // 大地祝福防御叠加
            if (target._defenseStackBonus) defense *= (1 + target._defenseStackBonus);
            // v2.2.0: 光系圣盾形态 - 防御+30%
            if (target === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
                if (TalentCombatSystem.getLightForm() === 'shield') {
                    defense *= 1.30;
                }
            }
            // 护盾时防御加成（shieldDefenseBonus）
            if (target === this.player && target.talentEffects && target.talentEffects.shieldDefenseBonus) {
                const hasShield = target.statusEffects.some(e => e.type === 'shield');
                if (hasShield) defense *= (1 + target.talentEffects.shieldDefenseBonus);
            }
        }

        // 基础伤害（防御系数0.5，让防御有意义但不导致完全免伤）
        let damage = Math.max(1, (attack - defense * 0.5) * multiplier);

        // 天赋：元素穿透 - 忽略部分防御
        if (attacker && attacker.talentEffects) {
            const te = attacker.talentEffects;
            let pen = 0;
            if (element) {
                const penKey = element + 'Penetration';
                if (te[penKey]) pen = te[penKey];
            }
            if (te.elementPenetration) pen = Math.max(pen, te.elementPenetration);
            if (pen > 0) {
                const ignoredDef = defense * pen;
                damage += ignoredDef * 0.5;
            }
        }

        // 天赋：低HP伤害加成（炎怒/暗之力）
        if (attacker && attacker.talentEffects) {
            const te = attacker.talentEffects;
            const enrage = te.enrageDamage || te.lowHpDamageBonus;
            if (enrage) {
                const threshold = te.enrageThreshold || 0.3;
                const hpPercent = attacker.hp / attacker.maxHp;
                if (hpPercent < threshold) {
                    damage *= (1 + enrage);
                }
            }
            // 低HP伤害递增（lowHpDamageScaling：HP越低伤害越高，每损失1%HP+X%伤害）
            if (te.lowHpDamageScaling) {
                const hpPercent = attacker.hp / attacker.maxHp;
                const missing = 1 - hpPercent;
                damage *= (1 + missing * te.lowHpDamageScaling);
            }
            // 对有debuff的敌人伤害提升（debuffedDamageBonus）
            if (te.debuffedDamageBonus && target && target.statusEffects) {
                const hasDebuff = target.statusEffects.some(e =>
                    ['burn', 'freeze', 'frozen', 'stun', 'paralyze', 'slow', 'curse', 'poison', 'bleed', 'blind', 'fear', 'shock', 'electrified', 'wet', 'mud'].includes(e.type)
                );
                if (hasDebuff) damage *= (1 + te.debuffedDamageBonus);
            }
            // 潮汐涨潮伤害加成
            if (attacker.tideDamageBonus) {
                damage *= (1 + attacker.tideDamageBonus);
            }
            // 对眩晕/冻结目标增伤
            if (te.stunnedDamageBonus && target && target.statusEffects) {
                const isStunned = target.statusEffects.some(e => e.type === 'stun' || e.type === 'freeze');
                if (isStunned) {
                    damage *= (1 + te.stunnedDamageBonus);
                }
            }
            // 防御转伤害（土系大地之怒）
            if (te.defenseToDamage && target === this.enemy) {
                const bonusDmg = this.player.defense * te.defenseToDamage;
                damage += bonusDmg;
            }
            // 光系审判：对暗系敌人概率造成真实伤害
            if (te.judgmentChance && target && target.element === 'dark') {
                if (Math.random() < te.judgmentChance) {
                    const trueDmg = Math.floor(target.maxHp * (te.judgmentTrueDamage || 0.15));
                    damage += trueDmg;
                    this.addLog(`✨ 圣光审判！对暗系造成 ${trueDmg} 点真实伤害！`, 'element');
                }
            }
        }

        // 天赋：暴击伤害加成
        if (attacker && attacker.talentEffects && attacker.talentEffects.critDamageBonus) {
            // 在暴击判定后使用
        }

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

        // 光系对暗系伤害加成（darkDamageBonus）
        if (attacker && attacker.talentEffects && attacker.talentEffects.darkDamageBonus) {
            const targetIsDark = targetElement === 'dark' || (target.element === 'dark');
            if (targetIsDark) damage *= (1 + attacker.talentEffects.darkDamageBonus);
        }
        // 圣光审判（judgmentChance）：30%对暗系造成15%最大HP真实伤害
        if (attacker && attacker.talentEffects && attacker.talentEffects.judgmentChance && target === this.enemy) {
            const targetIsDark = targetElement === 'dark' || target.element === 'dark';
            if (targetIsDark && Math.random() < attacker.talentEffects.judgmentChance) {
                const trueDmg = Math.floor(target.maxHp * (attacker.talentEffects.judgmentDamage || 0.15));
                damage += trueDmg;
                this.addLog(`✨ 圣光审判！额外造成 ${trueDmg} 点真实伤害！`, 'crit');
            }
        }
        
        // 妖魔特定元素弱点/抗性（如妖藤怕火抗雷）
        if (target && element) {
            const weaknessKey = element + 'Weakness';
            const resistanceKey = element + 'Resistance';
            if (target[weaknessKey]) {
                damage *= target[weaknessKey];
                result.elementEffect = 'super';
            }
            if (target[resistanceKey]) {
                damage *= target[resistanceKey];
                result.elementEffect = 'weak';
            }
        }
        
        // 元素反应计算（基于目标状态）
        if (element && target && target.statusEffects) {
            const hasWet = target.statusEffects.some(e => e.type === 'wet');
            const hasFreeze = target.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            const hasBurn = target.statusEffects.some(e => e.type === 'burn');
            const hasElectro = target.statusEffects.some(e => e.type === 'electrified' || e.type === 'paralyze');
            const hasShock = target.statusEffects.find(e => e.type === 'shock');

            // 感电状态：雷伤+30%（或天赋指定值）
            if (element === 'thunder' && hasShock) {
                damage *= (1 + (hasShock.thunderDamageBonus || 0.3));
            }

            // v1.5.4: 湿润状态：水系伤害加成（wetDamageBonus）
            if (element === 'water' && hasWet) {
                const wetEffect = target.statusEffects.find(e => e.type === 'wet');
                const wetBonus = wetEffect ? (wetEffect.waterDamageBonus || 0.1) : 0.1;
                damage *= (1 + wetBonus);
            }

            // v1.5.5: 光系对debuff目标伤害加成（debuffedDamageBonus）
            if (element === 'light' && attacker && attacker.talentEffects && attacker.talentEffects.debuffedDamageBonus) {
                const hasDebuff = target.statusEffects.some(e => ['burn', 'frozen', 'paralyze', 'stun', 'slow', 'poison', 'curse', 'wet', 'shock', 'bind', 'bleed'].includes(e.type));
                if (hasDebuff) {
                    damage *= (1 + attacker.talentEffects.debuffedDamageBonus);
                }
            }

            // 麻痹伤害加成（paralyzeDamage：麻痹时受伤+8%）
            if (attacker && attacker.talentEffects && attacker.talentEffects.paralyzeDamage) {
                const isParalyzed = target.statusEffects.some(e => e.type === 'paralyze');
                if (isParalyzed) damage *= (1 + attacker.talentEffects.paralyzeDamage);
            }
            // v1.5.4: 麻痹目标伤害加成（paralyzeDamageBonus）- 攻击麻痹目标时伤害提升
            if (attacker && attacker.talentEffects && attacker.talentEffects.paralyzeDamageBonus) {
                const isParalyzed = target.statusEffects.some(e => e.type === 'paralyze');
                if (isParalyzed) damage *= (1 + attacker.talentEffects.paralyzeDamageBonus);
            }
            // 飓风卷起受伤加成
            const hurricane = target.statusEffects.find(e => e.type === 'stun' && e.damageTaken);
            if (hurricane) damage *= (1 + hurricane.damageTaken);
            
            // 火 + 水 = 蒸发
            if (element === 'fire' && hasWet) {
                damage *= 1.3;
                result.elementReaction = 'vaporize';
            }
            // 火 + 冰 = 融化（原著设定：冻结中受火系伤害×2）
            else if (element === 'fire' && hasFreeze) {
                damage *= 2.0;
                result.elementReaction = 'melt';
            }
            // 火 + 雷 = 超载
            else if (element === 'fire' && hasElectro) {
                damage *= 1.25;
                result.elementReaction = 'overload';
            }
            // 火 + 风 = 扩散火
            else if (element === 'fire' && target.statusEffects.some(e => e.type === 'wind')) {
                damage *= 1.15;
                result.elementReaction = 'swirl_fire';
            }
            // 雷 + 水 = 感电
            else if (element === 'thunder' && hasWet) {
                damage *= 1.2;
                result.elementReaction = 'electro';
            }
            // 雷 + 冰 = 超导
            else if (element === 'thunder' && hasFreeze) {
                damage *= 1.15;
                result.elementReaction = 'superconduct';
            }
            // 冰 + 水 = 冻结
            else if (element === 'ice' && hasWet) {
                damage *= 1.2;
                result.elementReaction = 'freeze';
            }
            // 土 + 水 = 泥浆
            else if (element === 'earth' && hasWet) {
                damage *= 1.1;
                result.elementReaction = 'mud';
            }
            // 土 + 火/冰/雷 = 结晶（产生护盾）
            else if (element === 'earth' && (hasBurn || hasFreeze || hasElectro)) {
                damage *= 1.1;
                result.elementReaction = 'crystallize';
            }
            // 风 + 水 = 扩散水
            else if (element === 'wind' && hasWet) {
                damage *= 1.15;
                result.elementReaction = 'swirl_water';
            }
            // 风 + 雷 = 扩散雷
            else if (element === 'wind' && hasElectro) {
                damage *= 1.15;
                result.elementReaction = 'swirl_thunder';
            }
            // 风 + 冰 = 扩散冰
            else if (element === 'wind' && hasFreeze) {
                damage *= 1.15;
                result.elementReaction = 'swirl_ice';
            }
            // 物理 + 冰 = 碎冰（破冰伤害）
            else if (element === 'physical' && hasFreeze) {
                damage *= 1.3;
                result.elementReaction = 'shatter';
            }

            // 燃烧状态：所有伤害+30%（火焰让敌人更脆弱）
            if (hasBurn) {
                damage *= 1.3;
            }
        }
        
        // 天赋：攻击者的元素伤害加成
        if (element && attacker && attacker.traits) {
            for (const trait of attacker.traits) {
                if (trait.type === 'passive' && trait.effects) {
                    const bonusKey = element + 'DamageBonus';
                    if (trait.effects[bonusKey]) {
                        damage *= (1 + trait.effects[bonusKey]);
                    }
                }
            }
        }
        
        // 天赋：目标的元素伤害减免（抗性）
        if (element && target && target.traits) {
            for (const trait of target.traits) {
                if (trait.type === 'passive' && trait.effects) {
                    const reductionKey = element + 'DamageReduction';
                    if (trait.effects[reductionKey]) {
                        damage *= (1 - trait.effects[reductionKey]);
                    }
                }
            }
        }
        
        // 天赋：目标的元素弱点伤害
        if (element && target && target.traits) {
            for (const trait of target.traits) {
                if (trait.type === 'weakness' && trait.effects) {
                    const weaknessKey = element + 'DamageBonus';
                    if (trait.effects[weaknessKey]) {
                        damage *= (1 + trait.effects[weaknessKey]);
                    }
                }
            }
        }

        // 元素特性伤害加成（基于目标状态）
        if (target) {
            const mods = this.getStatusModifiers(target);
            if (element === 'fire') damage *= mods.fireDamageMod;
            if (element === 'thunder') damage *= mods.thunderDamageMod;
            if (element === 'ice') damage *= mods.iceDamageMod;
            if (element === 'dark') damage *= (mods.darkDamageMod || 1);
        }
        
        // 天赋：伤害减免
        if (target && target.traitBonuses) {
            // 物理伤害减免
            if (!element && target.traitBonuses.physicalDamageReduction) {
                damage *= (1 - target.traitBonuses.physicalDamageReduction);
            }
            // 魔法伤害减免
            if (element && target.traitBonuses.magicDamageReduction) {
                damage *= (1 - target.traitBonuses.magicDamageReduction);
            }
        }

        // v2.7.0: 钢铁身躯 - 魔法伤害增加（弱点）
        if (target && target.traits) {
            const steelTrait = target.traits.find(t => t.id === 'steel_body');
            if (steelTrait?.effects?.magicDamageTaken && element) {
                damage *= (1 + steelTrait.effects.magicDamageTaken);
            }
        }

        // 随机浮动 ±15%
        damage *= 0.85 + Math.random() * 0.3;

        // v0.38.0: 玩家受伤减免
        if (target === this.player) {
            // 新手保护：玩家Lv≤5时，受到的伤害-20%
            if (typeof Player !== 'undefined' && Player.level <= 5) {
                damage *= 0.8;
            }
            // 残局减伤：敌人HP<30%时，敌人伤害-15%（接近胜利时不那么惩罚）
            if (attacker === this.enemy && this.enemy.hp / this.enemy.maxHp < 0.3) {
                damage *= 0.85;
            }
        }

        // 天赋：对冻结目标必暴击+增伤
        let frozenCritGuaranteed = false;
        if (attacker && attacker.talentEffects && target && target.statusEffects) {
            const isFrozen = target.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            if (isFrozen) {
                if (attacker.talentEffects.frozenCritGuaranteed) frozenCritGuaranteed = true;
                if (attacker.talentEffects.frozenIceDamageBonus && (element === 'ice' || !element)) {
                    damage *= (1 + attacker.talentEffects.frozenIceDamageBonus);
                }
                if (attacker.talentEffects.frozenDamageTaken) {
                    damage *= (1 + attacker.talentEffects.frozenDamageTaken);
                }
            }
        }

        // 天赋：雷系蓄电满层暴击加成
        let chargeCritBonus = 0;
        let chargeCritDamageBonus = 0;
        if (attacker && attacker.chargeStack && attacker.talentEffects && attacker.talentEffects.chargeMax) {
            if (attacker.chargeStack >= attacker.talentEffects.chargeMax) {
                chargeCritBonus = attacker.talentEffects.fullChargeCrit === true ? 0.3 : (attacker.talentEffects.fullChargeCrit || 0.3);
                chargeCritDamageBonus = attacker.talentEffects.fullChargeDamage === true ? 1.0 : (attacker.talentEffects.fullChargeDamage || 0.5);
            }
        }

        // 天赋：风魔连击临时暴击加成
        let windDemonCritBonus = 0;
        if (attacker && attacker.comboCount && attacker.talentEffects && attacker.talentEffects.attackSpeedStack) {
            windDemonCritBonus = attacker.comboCount * (attacker.talentEffects.hitCritStack || 0.03);
        }

        // 麻痹状态：暴击率+20%（敌人麻痹时动作迟缓，更容易被击中要害）
        if (target && target.statusEffects && target.statusEffects.some(e => e.type === 'paralyze' || e.type === 'electrified')) {
            critRate += 0.2;
        }

        // 暴击判定
        const targetHasCritImmunity = target && target.talentEffects && target.talentEffects.critImmunity;
        const attackerGuaranteedCrit = attacker && attacker.talentEffects && attacker.talentEffects.guaranteedCrit;
        // 闪避后下次必暴
        const dodgeNextCrit = attacker && attacker._dodgeNextCrit;
        // 潜行暴击加成
        let stealthCritBonus = 0;
        if (attacker === this.player && attacker.stealthActive && attacker.talentEffects && attacker.talentEffects.stealthCritBonus) {
            stealthCritBonus = attacker.talentEffects.stealthCritBonus;
        }
        if (!targetHasCritImmunity && (attackerGuaranteedCrit || dodgeNextCrit || frozenCritGuaranteed || Math.random() < critRate + chargeCritBonus + windDemonCritBonus + stealthCritBonus)) {
            result.isCrit = true;
            // 消耗必暴标记
            if (dodgeNextCrit) attacker._dodgeNextCrit = false;
            let critMult = 1.5 + Math.random() * 0.5; // 1.5-2.0倍暴击
            // 天赋：暴击伤害加成
            if (attacker && attacker.talentEffects) {
                const cd = attacker.talentEffects.critDamageBonus || attacker.talentEffects.critDamage;
                if (cd) critMult += cd;
                // 蓄电满层暴伤加成
                if (chargeCritDamageBonus) critMult += chargeCritDamageBonus;
                // 暴击穿防：暴击时忽略部分防御
                if (attacker.talentEffects.critArmorPenetration) {
                    const pen = attacker.talentEffects.critArmorPenetration;
                    damage += defense * pen * 0.5;
                }
                // 风遁：闪避后暴击伤害加成
                if (attacker._dodgeCritBuff) {
                    critMult += attacker._dodgeCritBuff;
                    attacker._dodgeCritBuff = null;
                }
                if (attacker._dodgeCritDamage) {
                    critMult += attacker._dodgeCritDamage;
                    attacker._dodgeCritDamage = null;
                }
            }
            damage *= critMult;
        }

        result.amount = Math.floor(damage);
        return result;
    }

    /**
     * 应用伤害
     */
export function applyDamage(target, damage, attacker) {
        let amount = damage.amount;
        const te = this.player.talentEffects;

        // v1.5.1: 真实伤害快速通道 - 跳过所有减伤，直接扣血（燃烧真实伤害等）
        if (damage.trueDamage) {
            target.hp = Math.max(0, target.hp - amount);
            if (amount > 0) {
                this.showDamageNumber(target === this.player ? 'player' : 'enemy', amount, damage.isCrit ? 'crit' : 'normal');
            }
            return;
        }

        // 玩家天赋伤害减免
        if (target === this.player && target.damageReduction) {
            amount = Math.floor(amount * (1 - target.damageReduction));
        }
        // 滋润减伤（regenDamageReduction）
        if (target === this.player && target.talentEffects && target.talentEffects.regenDamageReduction) {
            const hasRegen = target.statusEffects.some(e => e.type === 'regen');
            if (hasRegen) {
                amount = Math.floor(amount * (1 - target.talentEffects.regenDamageReduction));
            }
        }
        // v0.70.0: 精英妖魔减伤和弱点处理
        if (target === this.enemy && target.isElite && target.eliteMechanics) {
            const em = target.eliteMechanics;
            // 物理减伤（三眼魔狼钢铁身躯）
            if (em.physical_reduction && (!damage.element || damage.element === 'physical')) {
                amount = Math.floor(amount * (1 - em.physical_reduction));
            }
            // 石肤减伤（禁月石魔）
            if (em.stone_skin_reduction) {
                amount = Math.floor(amount * (1 - em.stone_skin_reduction));
            }
            // 第一次伤害减伤（蛊惑魔蛛甲壳）
            if (em.shell_reduction_first && !target.eliteState.firstHitTaken) {
                amount = Math.floor(amount * (1 - em.shell_reduction_first));
                target.eliteState.firstHitTaken = true;
                this.addLog(`🛡️ ${target.name}的甲壳抵挡了部分伤害！`, 'system');
            }
            // 弱点伤害加成
            if (target.weakness && damage.element && target.weakness.includes(damage.element)) {
                const weaknessMult = em.fire_weakness_multiplier || em.light_weakness_multiplier || em.ice_weakness_multiplier || em.earth_weakness_multiplier || em.thunder_weakness_multiplier || em.water_weakness_multiplier || 1.5;
                amount = Math.floor(amount * weaknessMult);
                this.addLog(`💥 弱点命中！${damage.element}系造成额外伤害！`, 'element');
            }
            // 烈焰护体反弹（赤凌妖）
            if (em.flame_aura_reflect && attacker === this.player && amount > 0) {
                const reflectDmg = Math.floor(amount * em.flame_aura_reflect);
                if (reflectDmg > 0) {
                    this.player.hp = Math.max(0, this.player.hp - reflectDmg);
                    this.addLog(`🔥 ${target.name}的烈焰护体反弹了${reflectDmg}点伤害！`, 'element');
                    this.showDamageNumber('player', reflectDmg, 'normal');
                }
            }
        }

        // v0.8.27: 伤害共享（damageShare）：玩家受伤害时部分转移给召唤兽
        if (target === this.player && target.talentEffects && target.talentEffects.damageShare && this.summon && this.summon.hp > 0) {
            const te = target.talentEffects;
            const shareRatio = te.damageShare;
            const transferDmg = Math.floor(amount * shareRatio);
            if (transferDmg > 0) {
                amount -= transferDmg;
                this.summon.hp = Math.max(0, this.summon.hp - transferDmg);
                this.addLog(`🔗 灵魂链接：${this.summon.name} 分担了 ${transferDmg} 点伤害！`, 'buff');
                if (this.summon.hp <= 0) {
                    this.triggerSummonDeath();
                }
            }
        }

        // 玩家灵种元素抗性（小说第134章：灵火改变体质，对火焰有抗性）
        if (target === this.player && damage.element && typeof Player !== 'undefined') {
            const resistanceKey = damage.element + 'Resistance';
            const immunityKey = damage.element + 'Immunity';
            // 灵种抗性
            const seedEffects = Player.getElementSpiritSeedEffects(damage.element);
            if (seedEffects && seedEffects[resistanceKey]) {
                const resist = seedEffects[resistanceKey];
                const originalAmount = amount;
                amount = Math.floor(amount * (1 - resist));
                if (amount < originalAmount) {
                    this.addLog(`🔥 灵种体质减免了 ${originalAmount - amount} 点伤害！`, 'buff');
                }
            }
            // 天赋元素抗性
            if (this.player.talentEffects && this.player.talentEffects[resistanceKey]) {
                const resist = this.player.talentEffects[resistanceKey];
                const originalAmount = amount;
                amount = Math.floor(amount * (1 - resist));
                if (amount < originalAmount) {
                    this.addLog(`✨ 天赋抗性减免了 ${originalAmount - amount} 点伤害！`, 'buff');
                }
            }
            // 天赋元素免疫
            if (this.player.talentEffects && this.player.talentEffects[immunityKey]) {
                amount = 0;
                this.addLog(`✨ 元素免疫！伤害无效！`, 'buff');
            }
            // 冰吸收：冰伤回血
            if (damage.element === 'ice' && this.player.talentEffects && this.player.talentEffects.iceAbsorb) {
                const absorb = this.player.talentEffects.iceAbsorb;
                const healAmount = Math.floor(amount * absorb);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                this.addLog(`❄️ 冰吸收！恢复 ${healAmount} 点生命！`, 'heal');
            }
        }
        
        // 雷穿水盾：雷系技能可穿透水系护盾（小说第133章）
        const isThunder = damage.element === 'thunder';
        
        // 护盾存在时防御加成（shieldDefenseBonus）
        const hasShield = target.statusEffects.some(e => e.type === 'shield' && e.value > 0);
        if (hasShield && target === this.player && te?.shieldDefenseBonus) {
            amount = Math.floor(amount * (1 - te.shieldDefenseBonus));
        }

        // 护盾吸收
        const shield = target.statusEffects.find(e => e.type === 'shield');
        // v1.5.4: pierceShield无视护盾（破冰等）
        if (shield && shield.value > 0 && !damage.pierceShield) {
            // 检查是否是水盾
            const isWaterShield = shield.name && (shield.name.includes('水') || shield.name.includes('water'));
            
            if (isThunder && isWaterShield) {
                // 雷穿水盾：忽略水盾
                const targetName = target === this.player ? '你' : this.enemy.name;
                this.addLog(`⚡ 雷系技能穿透了 ${targetName} 的水盾！`, 'element');
                // 直接破掉水盾
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'shield');
            } else {
                const absorbed = Math.min(shield.value, amount);
                shield.value -= absorbed;
                amount -= absorbed;
                if (absorbed > 0) {
                    const targetName = target === this.player ? '你' : this.enemy.name;
                    this.addLog(`${targetName} 的护盾吸收了 ${absorbed} 点伤害`, 'buff');
                    // 护盾反射（shieldReflect）
                    if (target === this.player && te.shieldReflect && attacker && attacker.hp > 0) {
                        const reflectDmg = Math.floor(absorbed * te.shieldReflect);
                        attacker.hp = Math.max(0, attacker.hp - reflectDmg);
                        this.addLog(`🔮 护盾反射 ${reflectDmg} 点伤害！`, 'counter');
                    }
                }
                if (shield.value <= 0) {
                    target.statusEffects = target.statusEffects.filter(e => e.type !== 'shield');
                    // 护盾破碎反伤（shieldBreakDamage）
                    if (target === this.player && te.shieldBreakDamage && attacker && attacker.hp > 0) {
                        const breakDmg = Math.floor(this.player.maxHp * te.shieldBreakDamage * 0.1);
                        attacker.hp = Math.max(0, attacker.hp - breakDmg);
                        this.addLog(`💥 护盾破碎！反弹 ${breakDmg} 点伤害！`, 'counter');
                    }
                }
            }
        }

        // 无敌状态（圣盾）：不受伤害
        if (target.statusEffects.some(e => e.type === 'invulnerable')) {
            amount = 0;
            const targetName = target === this.player ? '你' : this.enemy.name;
            this.addLog(`✨ ${targetName} 在圣盾庇护下，伤害无效！`, 'defense');
        }

        target.hp = Math.max(0, target.hp - amount);

        // 天赋：雷系斩杀 - 敌人HP低于阈值时概率直接击杀
        if (target === this.enemy && target.hp > 0 && attacker === this.player && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.thunderExecute) {
                const threshold = te.executeThreshold || 0.2;
                const chance = te.executeChance || 0.2;
                if (target.hp / target.maxHp < threshold && Math.random() < chance) {
                    target.hp = 0;
                    this.addLog(`⚡ 雷劫！${this.enemy.name} 被天雷斩杀！`, 'crit');
                    this.showDamageNumber('enemy', 999, 'crit');
                }
            }
        }

        // 天赋免死：HP归零时保留HP（神圣庇护/大地守护/暗影化身）
        if (target.hp <= 0 && target === this.player && target.talentEffects) {
            const te = target.talentEffects;
            if ((te.divineProtection || te.autoRevive) && !target._deathSaveUsed) {
                target._deathSaveUsed = true;
                const saveHp = Math.floor(target.maxHp * (te.autoReviveHp || 0.3));
                target.hp = saveHp;
                this.addLog(`💫 免死！恢复 ${saveHp} 点生命！`, 'heal');
                target.statusEffects = target.statusEffects.filter(e =>
                    e.type === 'shield' || e.type === 'attack_up' || e.type === 'defense_up'
                );
            }
            // 复活之光/生命源泉：更强力的复活，恢复更多HP，净化负面
            if (te.revive && !target.reviveUsed) {
                target.reviveUsed = true;
                const reviveHp = Math.floor(target.maxHp * (te.reviveHp || 0.3));
                target.hp = reviveHp;
                // 净化所有负面状态
                target.statusEffects = target.statusEffects.filter(e =>
                    ['shield', 'attack_up', 'defense_up', 'speed_up', 'regen'].includes(e.type)
                );
                this.addLog(`✨ 复活之光！恢复 ${reviveHp} 点生命，净化所有负面状态！`, 'heal');
                // 神圣庇护（protectionDuration）：复活后短暂无敌
                if (te.protectionDuration) {
                    this.addStatusEffect(target, {
                        type: 'invulnerable', name: '神圣庇护', duration: te.protectionDuration
                    });
                    this.addLog(`✨ 神圣庇护！${te.protectionDuration}回合内不受伤害！`, 'buff');
                }
            }
        }

        // 冰甲反伤：近战攻击有几率冰冻攻击者
        if (amount > 0 && attacker) {
            const iceArmor = target.statusEffects?.find(e => e.type === 'ice_thorns');
            if (iceArmor && Math.random() < 0.3) {
                const freezeEffect = { name: '冰冻', type: 'freeze', duration: 1, chance: 1 };
                this.applyStatusEffects(attacker, [freezeEffect], target === this.enemy);
                const attackerName = attacker === this.player ? '你' : this.enemy.name;
                this.addLog(`❄️ ${attackerName} 被冰甲冻住了！`, 'debuff');
            }
        }

        // 天赋反伤：受到攻击时反弹伤害（烈焰护体/岩刺等）
        if (amount > 0 && attacker && target === this.player && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.damageReflect && te.damageReflect > 0) {
                const reflectDmg = Math.floor(amount * te.damageReflect);
                if (reflectDmg > 0) {
                    attacker.hp = Math.max(0, attacker.hp - reflectDmg);
                    this.addLog(`🔥 烈焰护体反弹 ${reflectDmg} 点伤害！`, 'counter');
                }
            }
            if (te.rockSpikes && te.rockSpikes > 0 && !damage.element) {
                const thornDmg = Math.floor(this.player.defense * (te.rockSpikesDamage || te.rockSpikes));
                if (thornDmg > 0) {
                    attacker.hp = Math.max(0, attacker.hp - thornDmg);
                    this.addLog(`🪨 岩刺反弹 ${thornDmg} 点伤害！`, 'counter');
                }
            }
            // 雷反：被攻击时概率反击雷伤
            if (te.thunderCounter && Math.random() < te.thunderCounter) {
                const counterDmg = Math.floor(this.player.attack * (te.thunderCounterDamage || 0.5));
                if (counterDmg > 0) {
                    this.applyDamage(attacker, { amount: counterDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`⚡ 雷反！对 ${attacker.name || '敌人'} 造成 ${counterDmg} 点雷伤！`, 'counter');
                    // 雷反概率麻痹
                    if (te.paralyzeChance || te.chargeStack) {
                        const paraChance = te.paralyzeChance || 0.1 + (this.player.chargeStack || 0) * 0.1;
                        if (Math.random() < paraChance) {
                            this.addStatusEffect(attacker, { type: 'paralyze', name: '麻痹', duration: 1 });
                            this.addLog(`⚡ ${attacker.name || '敌人'} 被麻痹了！`, 'element');
                        }
                    }
                }
            }
            // v2.9.5: 荆棘共生反伤（plantThornReflect）- 受击反弹植物系伤害，概率附毒
            if (te.plantThornReflect && te.plantThornReflect > 0) {
                const reflectDmg = Math.floor(amount * te.plantThornReflect);
                if (reflectDmg > 0) {
                    this.applyDamage(attacker, { amount: reflectDmg, element: 'plant', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🌿 荆棘共生！反弹 ${reflectDmg} 点自然伤害！`, 'counter');
                    // 反伤概率附毒
                    if (te.plantThornPoisonChance && Math.random() < te.plantThornPoisonChance) {
                        this.addStatusEffect(attacker, { type: 'poison', name: '中毒', duration: 3, dotDamage: Math.floor(this.player.attack * 0.05) });
                        this.addLog(`☠️ ${attacker.name || '敌人'} 被荆棘毒素感染！`, 'element');
                    }
                    // 反伤回血（plantThornHeal）
                    if (te.plantThornHeal && te.plantThornHeal > 0) {
                        const thornHeal = Math.floor(reflectDmg * te.plantThornHeal);
                        if (thornHeal > 0 && this.player.hp < this.player.maxHp) {
                            this.player.hp = Math.min(this.player.maxHp, this.player.hp + thornHeal);
                            this.addLog(`🌿 荆棘反哺！恢复 ${thornHeal} 点生命！`, 'heal');
                        }
                    }
                }
            }
            // 坚岩：概率大幅减伤
            if (te.hardRockChance && !target._hardRockUsed) {
                if (Math.random() < te.hardRockChance) {
                    const reduction = te.hardRockReduction || 0.5;
                    const reduced = Math.floor(amount * reduction);
                    target.hp += reduced;
                    amount -= reduced;
                    target._hardRockUsed = true;
                    this.addLog(`🪨 坚岩发动！伤害减少${Math.round(reduction*100)}%！`, 'defense');
                }
            }
            // 水之盾（waterGuardChance）：20%概率减伤30%
            if (te.waterGuardChance && Math.random() < te.waterGuardChance) {
                const reduction = te.waterGuardReduction || 0.3;
                const reduced = Math.floor(amount * reduction);
                target.hp += reduced;
                amount -= reduced;
                this.addLog(`💧 水之盾！伤害减少${Math.round(reduction*100)}%！`, 'defense');
            }
            // 常驻减伤（damageReduction）
            if (te.damageReduction) {
                const reduced = Math.floor(amount * te.damageReduction);
                target.hp += reduced;
                amount -= reduced;
            }
            // 岩盾：受击时概率获得护盾
            if (te.shieldChance && amount > 0 && Math.random() < te.shieldChance) {
                const shieldRatio = te.shieldRatio || 0.15;
                const shieldAmount = Math.floor(target.maxHp * shieldRatio);
                const existingShield = target.statusEffects.find(e => e.type === 'shield');
                if (existingShield) {
                    existingShield.value = Math.max(existingShield.value, shieldAmount);
                } else {
                    this.addStatusEffect(target, { type: 'shield', name: '岩盾', value: shieldAmount, duration: 3 });
                }
                this.addLog(`🪨 岩盾发动！获得 ${shieldAmount} 点护盾！`, 'defense');
            }
            // 圣盾（holyShield）：受到致命伤害时保留1HP并获得短暂无敌
            if (te.holyShield && amount >= target.hp && target.hp > 0 && !target._holyShieldUsed) {
                target._holyShieldUsed = true;
                target.hp = 1;
                amount = 0;
                const holyDuration = te.holyShieldDuration || 1;
                this.addStatusEffect(target, { type: 'invulnerable', name: '圣盾', duration: holyDuration });
                this.addLog(`✨ 圣盾降临！免疫伤害！`, 'defense');
            }
            // 自动潜行（autoStealthChance）：受击后概率重新潜行
            if (te.autoStealthChance && amount > 0 && Math.random() < te.autoStealthChance) {
                this.addStatusEffect(target, { type: 'stealth', name: '潜行', duration: 2 });
                target.stealthActive = true;
                this.addLog(`🌑 你重新潜入暗影！`, 'buff');
            }
        }

        // Boss战模式：阶段转换检查
        if (this.battleOptions.mode === 'boss' && target === this.enemy && !this.bossPhase2) {
            const hpPercent = target.hp / target.maxHp;
            if (hpPercent <= 0.5 && amount > 0) {
                // 进入第二阶段：狂暴
                this.bossPhase2 = true;
                this.addLog(`⚠️ ${this.enemy.name} 进入狂暴状态！攻击力大幅提升！`, 'crit');
                
                // 阶段转换：清除所有debuff
                this.enemy.statusEffects = this.enemy.statusEffects.filter(e => 
                    e.type === 'shield' || e.type === 'attack_up' || e.type === 'defense_up' || e.type === 'speed_up'
                );
                this.addLog(`${this.enemy.name} 驱散了身上的所有负面效果！`, 'buff');
                
                // 阶段转换：恢复10%HP
                const phaseHeal = Math.floor(this.enemy.maxHp * 0.1);
                this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + phaseHeal);
                this.addLog(`${this.enemy.name} 恢复了 ${phaseHeal} 点生命值！`, 'heal');
                
                // 狂暴加成：攻击+30%，速度+20%，防御-10%
                this.enemy.attack = Math.floor(this.enemy.attack * 1.3);
                this.enemy.speed = Math.floor(this.enemy.speed * 1.2);
                this.enemy.defense = Math.floor(this.enemy.defense * 0.9);
                
                // 狂暴阶段新增技能（如果是妖魔）
                if (this.enemy.enemyType === 'demon' || this.enemy.demonTier) {
                    if (!this.enemy.skills.includes('berserk_mode')) {
                        this.enemy.skills.push('berserk_mode');
                    }
                    if (!this.enemy.skills.includes('demon_rage') && this.enemy.demonTier === 'commander') {
                        this.enemy.skills.push('demon_rage');
                    }
                }
                
                // 发布阶段转换事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit('bossPhaseChange', {
                        phase: 2,
                        enemy: this.enemy
                    });
                }
            }
        }
        
        // 更新战斗统计
        if (target === this.enemy) {
            // 对敌人造成伤害
            this.stats.totalDamageDealt += amount;
            if (damage.isCrit) this.stats.critCount++;
            if (damage.isMiss) this.stats.missCount++;
        } else if (target === this.player) {
            // 玩家受到伤害
            this.stats.totalDamageTaken += amount;
            
            // 更新最低血量百分比
            const hpPercent = target.hp / target.maxHp;
            if (hpPercent < this.stats.maxHpPercent) {
                this.stats.maxHpPercent = hpPercent;
            }
        }
        
        // 处理攻击命中后的效果（吸血、灼烧等）
        if (attacker && amount > 0 && !damage.isMiss) {
            const attackerMods = this.getStatusModifiers(attacker);
            const attackerName = attacker === this.player ? '你' : this.enemy.name;
            const targetName = target === this.player ? '你' : this.enemy.name;
            
            // 吸血效果
            if (attackerMods.lifesteal > 0) {
                let healAmount = Math.floor(amount * attackerMods.lifesteal);
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(attacker);
                healAmount = Math.floor(healAmount * healMultiplier);
                if (healAmount > 0 && attacker.hp < attacker.maxHp) {
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                    this.addLog(`${attackerName} 吸取了 ${healAmount} 点生命！`, 'heal');
                }
            }
            
            // 攻击灼烧几率
            if (attackerMods.burnChanceOnAttack > 0 && Math.random() < attackerMods.burnChanceOnAttack) {
                const burnDamage = attackerMods.burnDamagePerTurn || 10;
                const burnEffect = {
                    type: 'burn',
                    name: '灼烧',
                    duration: 3,
                    damagePerTurn: burnDamage
                };
                target.statusEffects.push(burnEffect);
                this.addLog(`${targetName} 被灼烧了！`, 'debuff');
            }
        }
        
        // 处理受到攻击后的效果（反伤、冻结等）
        if (attacker && amount > 0 && !damage.isMiss) {
            const targetMods = this.getStatusModifiers(target);
            const attackerName = attacker === this.player ? '你' : this.enemy.name;
            const targetName = target === this.player ? '你' : this.enemy.name;
            
            // 伤害反弹
            if (targetMods.damageReflect > 0) {
                const reflectAmount = Math.floor(amount * targetMods.damageReflect);
                if (reflectAmount > 0) {
                    attacker.hp = Math.max(0, attacker.hp - reflectAmount);
                    this.addLog(`${attackerName} 受到了 ${reflectAmount} 点反伤！`, 'damage');
                }
            }
            
            // 受击冻结几率
            if (targetMods.freezeChanceOnHit > 0 && Math.random() < targetMods.freezeChanceOnHit) {
                const freezeDuration = targetMods.freezeDuration || 1;
                const freezeEffect = {
                    type: 'frozen',
                    name: '冻结',
                    duration: freezeDuration
                };
                attacker.statusEffects.push(freezeEffect);
                this.addLog(`${attackerName} 被冻结了！`, 'debuff');
            }
            // v1.5.4: 雷殛护体反击（thunderCounter）- 受击时概率反击雷伤
            if (target === this.player && this.player.talentEffects && this.player.talentEffects.thunderCounter) {
                if (Math.random() < this.player.talentEffects.thunderCounter) {
                    const counterDmg = Math.floor(this.player.attack * (this.player.talentEffects.thunderCounterDamage || 0.5));
                    this.applyDamage(attacker, { amount: counterDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`⚡ 雷殛护体！反击造成 ${counterDmg} 点雷伤！`, 'counter');
                    this.showDamageNumber('enemy', counterDmg, 'normal');
                }
            }
            // v1.5.5: 岩甲层数机制（rockArmorStack）- 受击时叠加岩甲
            if (target === this.player && this.player.talentEffects && this.player.talentEffects.rockArmorStack && amount > 0) {
                const te = this.player.talentEffects;
                const maxArmor = te.rockArmorMax || 3;
                if (!this.player._rockArmorStacks) this.player._rockArmorStacks = 0;
                this.player._rockArmorStacks = Math.min(this.player._rockArmorStacks + 1, maxArmor);
                const defBonus = te.rockArmorDefense || 0.03;
                const reduction = te.rockArmorReduction || 0.03;
                this.addLog(`🪨 岩甲叠加 ${this.player._rockArmorStacks}/${maxArmor}（防御+${Math.floor(defBonus*100)}%，减伤+${Math.floor(reduction*100)}%）`, 'buff');
                // 满层岩甲护盾（rockArmorShieldOnMax）
                if (this.player._rockArmorStacks >= maxArmor && te.rockArmorShieldOnMax) {
                    const shieldAmount = Math.floor(this.player.maxHp * te.rockArmorShieldOnMax);
                    const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                    if (existingShield) {
                        existingShield.value = Math.max(existingShield.value, shieldAmount);
                    } else {
                        this.addStatusEffect(this.player, { type: 'shield', name: '岩甲护盾', value: shieldAmount, duration: 3 });
                    }
                    this.addLog(`🪨 岩甲满层！获得 ${shieldAmount} 点护盾！`, 'defense');
                }
                // 满层岩甲反击（rockArmorCounterOnMax）
                if (this.player._rockArmorStacks >= maxArmor && te.rockArmorCounterOnMax) {
                    const counterDmg = Math.floor(this.player.defense * (te.counterDamage || 0.8));
                    this.applyDamage(attacker, { amount: counterDmg, element: 'earth', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🪨 岩甲反击！造成 ${counterDmg} 点土伤！`, 'counter');
                    this.showDamageNumber('enemy', counterDmg, 'normal');
                    // v3.1.0: 反击回血（counterHeal，反击流Lv7延伸）
                    if (te.counterHeal) {
                        const healAmount = Math.floor(this.player.maxHp * te.counterHeal);
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                        this.addLog(`🪨 反击回血！恢复 ${healAmount} 点生命！`, 'heal');
                    }
                    // 反击眩晕（counterStunChance）
                    if (te.counterStunChance && Math.random() < te.counterStunChance) {
                        this.addStatusEffect(attacker, { type: 'stun', name: '岩击眩晕', duration: 1 });
                        this.addLog(`🪨 岩击眩晕！${attacker === this.player ? '你' : this.enemy.name} 被眩晕！`, 'debuff');
                    }
                    // 反击不消耗岩甲（counterNoConsume）
                    if (!te.counterNoConsume) {
                        this.player._rockArmorStacks = 0;
                    }
                }
            }
        }
        
        // 同步到玩家数据
        if (target === this.player) {
            Player.hp = this.player.hp;
            
            // 记录受到伤害（用于毫发无伤成就）
            if (amount > 0) {
                this.tookDamage = true;
            }
        }
        
        // 同步攻击者的HP到玩家数据
        if (attacker === this.player) {
            Player.hp = this.player.hp;
        }
    }

// 导出模块集合
export const BattleDamage = {
    calculateDamage,
    applyDamage
};

export default BattleDamage;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleDamage = BattleDamage;
}