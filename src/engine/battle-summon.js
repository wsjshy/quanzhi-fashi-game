/**
 * 战斗系统 - 召唤兽攻击模块
 * 
 * 从battle.js拆分出的独立召唤兽攻击模块
 * 包含：召唤兽攻击（summonAttack）
 */

export function summonAttack() {
        if (!this.summon || !this.enemy || this.enemy.hp <= 0) return;

        const summon = this.summon;

        // 计算召唤兽属性加成（强化/狂暴状态）
        let attackMultiplier = 1;
        let defenseMultiplier = 1;
        let evasionBonus = 0;
        let hpRegen = 0;

        if (summon.statusEffects) {
            summon.statusEffects.forEach(effect => {
                if (effect.type === 'summon_buff') {
                    attackMultiplier += effect.attackBonus || 0;
                    defenseMultiplier += effect.defenseBonus || 0;
                    evasionBonus += effect.evasionBonus || 0;
                    hpRegen += effect.hpRegen || 0;
                } else if (effect.type === 'summon_rage') {
                    attackMultiplier += effect.attackBonus || 0;
                    defenseMultiplier -= effect.defenseMalus || 0;
                }
            });
        }

        // 每回合HP回复
        if (hpRegen > 0) {
            const regen = Math.floor(summon.maxHp * hpRegen);
            summon.hp = Math.min(summon.maxHp, summon.hp + regen);
            this.addLog(`${summon.icon} ${summon.name} 恢复了 ${regen} 点生命！`, 'heal');
        }

        // 获取召唤兽技能列表（支持进化后形态）
        let availableSkills;
        if (typeof getBeastCurrentData === 'function') {
            const currentData = getBeastCurrentData(summon);
            availableSkills = currentData ? currentData.skills : null;
        }
        if (!availableSkills) {
            const beastData = DataSummonBeasts[summon.id];
            availableSkills = beastData ? beastData.skills : [
                { id: 'bite', name: '攻击', minLevel: 1, damageMult: 1.0, critBonus: 0 }
            ];
        }
        const summonLevel = summon.level || 1;

        // 筛选可用技能
        const usable = availableSkills.filter(s => summonLevel >= s.minLevel);

        // 随机选择技能（35%概率用特殊技能）
        let chosenSkill = usable[0];
        if (usable.length > 1 && Math.random() < 0.35) {
            const specialSkills = usable.filter(s => s.id !== usable[0].id);
            chosenSkill = specialSkills[Math.floor(Math.random() * specialSkills.length)];
        }

        // 处理增益技能
        if (chosenSkill.type === 'buff') {
            summon.statusEffects = summon.statusEffects || [];
            const buffEffect = {
                name: chosenSkill.name,
                type: 'summon_buff',
                duration: chosenSkill.duration || 2,
                attackBonus: chosenSkill.attackBuff || 0,
                defenseBonus: chosenSkill.defenseBuff || 0,
                evasionBonus: chosenSkill.evasionBonus || 0,
                hpRegen: chosenSkill.hpRegen || 0
            };
            summon.statusEffects.push(buffEffect);
            const buffs = [];
            if (chosenSkill.attackBuff) buffs.push(`攻击+${Math.floor(chosenSkill.attackBuff * 100)}%`);
            if (chosenSkill.defenseBuff) buffs.push(`防御+${Math.floor(chosenSkill.defenseBuff * 100)}%`);
            if (chosenSkill.evasionBonus) buffs.push(`闪避+${Math.floor(chosenSkill.evasionBonus * 100)}%`);
            if (chosenSkill.hpRegen) buffs.push(`每回合回${Math.floor(chosenSkill.hpRegen * 100)}%HP`);
            this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，${buffs.join('，')}！`, 'buff');
            return;
        }

        // 处理减益技能（对敌人施加debuff）
        if (chosenSkill.type === 'debuff') {
            if (chosenSkill.stunChance && Math.random() < chosenSkill.stunChance) {
                this.addStatusEffect(this.enemy, {
                    name: chosenSkill.name + '眩晕',
                    type: 'stun',
                    duration: chosenSkill.stunDuration || 1,
                    chance: 1.0
                });
                this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，${this.enemy.name}被眩晕了！`, 'debuff');
            } else if (chosenSkill.enemyAttackDown) {
                this.addStatusEffect(this.enemy, {
                    name: chosenSkill.name + '减攻',
                    type: 'attack_down',
                    duration: chosenSkill.duration || 2,
                    chance: 1.0,
                    statModifiers: { attack: -Math.floor(chosenSkill.enemyAttackDown * 100) }
                });
                this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，${this.enemy.name}攻击力降低！`, 'debuff');
            } else {
                this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，但效果不明显...`, 'system');
            }
            // 减益技能也造成少量伤害
            const effectiveAttack = Math.floor(summon.attack * attackMultiplier * 0.5);
            const damage = this.calculateDamage(effectiveAttack, this.enemy.defense, 1.0, 0, 0.9,
                'neutral', this.enemy.elements?.[0] || 'neutral', this.enemy, summon);
            this.applyDamage(this.enemy, damage, summon);
            return;
        }

        // 攻击技能
        if (chosenSkill.hpCost) {
            const hpCost = Math.floor(summon.maxHp * chosenSkill.hpCost);
            summon.hp = Math.max(1, summon.hp - hpCost);
            this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，消耗${hpCost}点生命！`, 'system');
        }

        const effectiveAttack = Math.floor(summon.attack * attackMultiplier * (chosenSkill.damageMult || 1.0));
        // v0.8.27: 召唤兽暴击率/暴击伤害（来自天赋）
        let critChance = summon.critRate || 0.05;
        let critMult = summon.critDamage || 1.5;
        critChance += (chosenSkill.critBonus || 0);

        // v3.1.0: 契约满层时召唤兽暴击率加成（contractCritBonus，强攻流Lv7延伸）
        if (this.player.talentEffects?.contractCritBonus && this.player._contractStacks) {
            const te = this.player.talentEffects;
            const maxContract = te.contractMax || 3;
            if (this.player._contractStacks >= maxContract) {
                critChance += te.contractCritBonus;
                this.addLog(`📜 契约满层！${summon.name} 暴击率+${Math.floor(te.contractCritBonus * 100)}%！`, 'buff');
            }
        }

        // v0.8.27: 召唤兽狂暴（低HP增伤）
        let enrageMult = 1;
        if (this.player.talentEffects?.summonEnrage && summon.hp / summon.maxHp < 0.3) {
            enrageMult = 1 + this.player.talentEffects.summonEnrage;
            this.addLog(`🔥 ${summon.name} 陷入狂暴！伤害+${Math.floor(this.player.talentEffects.summonEnrage * 100)}%！`, 'buff');
        }

        const finalAttack = Math.floor(effectiveAttack * enrageMult);
        const damage = this.calculateDamage(
            finalAttack,
            Math.floor(this.enemy.defense * defenseMultiplier),
            1.0,
            critChance,
            0.9,
            'neutral',
            this.enemy.elements?.[0] || 'neutral',
            this.enemy,
            summon
        );
        // 应用暴击伤害倍率
        if (damage.isCrit) {
            damage.amount = Math.floor(damage.amount * critMult / 1.5);
        }

        this.applyDamage(this.enemy, damage, summon);
        const skillPrefix = chosenSkill.id !== usable[0].id ? `使用「${chosenSkill.name}」，` : '';
        this.addLog(`${summon.icon} ${summon.name} ${skillPrefix}造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 'magic');

        // v0.8.27: 召唤兽冲锋（对全体造成伤害）
        if (this.player.talentEffects?.summonChargeChance && Math.random() < this.player.talentEffects.summonChargeChance) {
            const chargeDmg = Math.floor(summon.attack * (this.player.talentEffects.summonChargeDamage || 1.5));
            this.applyDamage(this.enemy, { amount: chargeDmg, element: 'neutral', isMiss: false, isCrit: false }, summon);
            this.addLog(`💨 ${summon.name} 发动冲锋！追加 ${chargeDmg} 点伤害！`, 'special');
        }

        // v1.5.6: 契约层数机制（contractStack）- 召唤兽攻击时叠加契约
        if (this.player.talentEffects && this.player.talentEffects.contractStack) {
            const te = this.player.talentEffects;
            const maxContract = te.contractMax || 3;
            if (!this.player._contractStacks) this.player._contractStacks = 0;
            this.player._contractStacks = Math.min(this.player._contractStacks + 1, maxContract);
            const dmgBonus = te.contractDamageBonus || 0.05;
            this.addLog(`📜 契约叠加 ${this.player._contractStacks}/${maxContract}（召唤兽伤害+${Math.floor(dmgBonus*100)}%）`, 'buff');
            // v2.3.0: 召唤+治愈组合 - 契约治愈：契约积累时全队回血
            if (te.healAura && this.player.hp < this.player.maxHp) {
                const contractHeal = Math.floor(this.player.maxHp * 0.03);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + contractHeal);
                this.addLog(`💚 契约治愈！恢复 ${contractHeal} 点生命！`, 'heal');
            }
            // 满层兽潮（contractBeastTideOnMax）
            if (this.player._contractStacks >= maxContract && te.contractBeastTideOnMax) {
                const tideCount = te.beastTideCount || 2;
                const tideDamage = te.beastTideDamage || 0.6;
                for (let i = 0; i < tideCount; i++) {
                    if (this.enemy.hp <= 0) break;
                    const tideDmg = Math.floor(summon.attack * tideDamage);
                    this.applyDamage(this.enemy, { amount: tideDmg, element: 'neutral', isMiss: false, isCrit: (i === tideCount - 1 && te.beastTideFinalCrit) || false }, summon);
                }
                this.addLog(`🐾 兽潮爆发！${tideCount}次连击攻击！`, 'special');
                this.player._contractStacks = 0;
            }
            // 满层守护（contractGuardOnMax）
            if (this.player._contractStacks >= maxContract && te.contractGuardOnMax) {
                const guardDuration = te.guardDuration || 2;
                this.addStatusEffect(this.player, {
                    type: 'summon_guard', name: '契约守护',
                    duration: guardDuration,
                    damageAbsorb: te.guardDamageAbsorb || 0.5,
                    taunt: te.guardTaunt || false,
                    invincible: te.guardInvincible || false
                });
                this.addLog(`🛡️ 契约守护！召唤兽为你抵挡伤害！`, 'buff');
                this.player._contractStacks = 0;
            }
        }

        // 附加效果：中毒
        if (chosenSkill.poisonChance && Math.random() < chosenSkill.poisonChance) {
            this.addStatusEffect(this.enemy, {
                name: '中毒',
                type: 'poison',
                duration: chosenSkill.poisonDuration || 3,
                chance: 1.0,
                damagePerTurn: chosenSkill.poisonDamage || 5
            });
            this.addLog(`${this.enemy.name} 中毒了！每回合受到${chosenSkill.poisonDamage || 5}点伤害`, 'debuff');
        }

        // 附加效果：束缚
        if (chosenSkill.bindChance && Math.random() < chosenSkill.bindChance) {
            this.addStatusEffect(this.enemy, {
                name: '束缚',
                type: 'bind',
                duration: chosenSkill.bindDuration || 1,
                chance: 1.0,
                skipTurn: true
            });
            this.addLog(`${this.enemy.name} 被束缚了！`, 'debuff');
        }

        // 附加效果：眩晕
        if (chosenSkill.aoeStunChance && Math.random() < chosenSkill.aoeStunChance) {
            this.addStatusEffect(this.enemy, {
                name: '眩晕',
                type: 'stun',
                duration: 1,
                chance: 1.0
            });
            this.addLog(`${this.enemy.name} 被眩晕了！`, 'debuff');
        }

        // 连击效果
        if (chosenSkill.doubleHitChance && Math.random() < chosenSkill.doubleHitChance) {
            this.addLog(`${summon.icon} ${summon.name} 发动连击！`, 'magic');
            const secondDamage = this.calculateDamage(
                Math.floor(effectiveAttack * 0.7),
                this.enemy.defense,
                1.0, critChance, 0.9,
                'neutral', this.enemy.elements?.[0] || 'neutral', this.enemy, summon
            );
            this.applyDamage(this.enemy, secondDamage, summon);
            this.addLog(`${summon.icon} ${summon.name} 追加造成 ${secondDamage.amount} 点伤害${secondDamage.isCrit ? '（暴击！）' : ''}`, 'magic');
        }
    }


// 导出模块集合
export const BattleSummon = {
    summonAttack
};

export default BattleSummon;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleSummon = BattleSummon;
}