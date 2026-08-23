/**
 * 战斗系统 - 状态效果更新模块
 * 
 * 从battle.js拆分出的独立状态效果更新模块
 * 包含：状态效果更新（tickStatusEffects）
 */

export function tickStatusEffects(target, isPlayer) {
        const targetName = isPlayer ? '你' : this.enemy.name;
        const removedEffects = [];

        target.statusEffects = target.statusEffects.filter(effect => {
            // 护盾不随时间消失（被打掉才消失）
            if (effect.type === 'shield') {
                if ((effect.value || 0) <= 0) {
                    removedEffects.push({ effect, reason: 'broken' });
                    return false;
                }
                // v0.8.27: 护盾每回合回复（shieldRegen）
                if (isPlayer && this.player.talentEffects?.shieldRegen) {
                    const regenPct = this.player.talentEffects.shieldRegen;
                    const maxShield = effect._maxValue || effect.value;
                    const regenAmt = Math.floor(this.player.maxHp * regenPct);
                    effect.value = Math.min(maxShield, effect.value + regenAmt);
                }
                return true;
            }

            effect.duration--;

            // DOT伤害（按层数计算），支持dotDamage和damagePerTurn两种字段名
            const dotDamage = effect.dotDamage || effect.damagePerTurn;
            if (dotDamage) {
                const stacks = effect.stacks || 1;
                let dotAmount = Math.floor(dotDamage * stacks);
                // 风系DOT加成（windDotBonus）：风助火势，持续伤害+50%
                if (!isPlayer && this.player.talentEffects && this.player.talentEffects.windDotBonus) {
                    dotAmount = Math.floor(dotAmount * (1 + this.player.talentEffects.windDotBonus));
                }
                // v1.5.1: 火系分支效果 - 燃烧伤害加成
                let burnIsCrit = false;
                if (!isPlayer && this.player.talentEffects && effect.type === 'burn') {
                    const te = this.player.talentEffects;
                    if (te.burnDamageBonus) {
                        dotAmount = Math.floor(dotAmount * (1 + te.burnDamageBonus));
                    }
                    // 燃烧可暴击
                    if (te.burnCrit && Math.random() < (this.player.critRate || 0.05)) {
                        dotAmount = Math.floor(dotAmount * 1.5);
                        burnIsCrit = true;
                    }
                }
                const burnTrueDamage = !isPlayer && this.player.talentEffects?.burnTrueDamage && effect.type === 'burn';
                const damage = { amount: dotAmount, isCrit: burnIsCrit, isMiss: false, element: effect.type === 'burn' ? 'fire' : null, trueDamage: burnTrueDamage };
                this.applyDamage(target, damage, null);
                this.addLog(`${targetName} 受到 ${effect.name} 伤害 ${damage.amount} 点（${stacks}层）${burnIsCrit ? ' 暴击！' : ''}`, 'damage');

                // v3.2.0: 燃烧暴击时触发爆炸（burnCritExplode，火系烈焰之魂燃尽流Lv10终极）
                if (effect.type === 'burn' && !isPlayer && burnIsCrit && this.player.talentEffects?.burnCritExplode) {
                    const te = this.player.talentEffects;
                    const critExplodeDmg = Math.floor(this.player.attack * (te.burnCritExplodeDamage || 0.5));
                    this.applyDamage(this.enemy, { amount: critExplodeDmg, element: 'fire', isCrit: true, isMiss: false }, this.player);
                    this.addLog(`🔥💥 燃烧暴击触发爆炸！造成 ${critExplodeDmg} 点伤害！`, 'crit');
                    this.showDamageNumber('enemy', critExplodeDmg, 'crit');
                }

                // 天赋：燃烧爆炸 - 燃烧层数满时爆炸
                if (effect.type === 'burn' && !isPlayer && this.player.talentEffects) {
                    const te = this.player.talentEffects;
                    const maxStacks = te.burnStackMax || 3;
                    if (te.burnExplode && stacks >= maxStacks) {
                        // v1.5.1: 爆炸伤害加成 + 必定暴击
                        let explodeDmg = Math.floor(this.enemy.maxHp * (te.burnExplodeDamage || 0.15));
                        if (te.explodeBonus) explodeDmg = Math.floor(explodeDmg * (1 + te.explodeBonus));
                        const explodeCrit = te.explodeCrit ? true : false;
                        if (explodeCrit) explodeDmg = Math.floor(explodeDmg * 1.5);
                        this.applyDamage(this.enemy, { amount: explodeDmg, element: 'fire', isCrit: explodeCrit, isMiss: false }, this.player);
                        this.addLog(`💥 燃烧爆炸！造成 ${explodeDmg} 点伤害！${explodeCrit ? ' 暴击！' : ''}`, 'element');
                        this.showDamageNumber('enemy', explodeDmg, explodeCrit ? 'crit' : 'normal');
                        // v1.5.1: 爆炸后刷新燃烧（爆燃流）vs 重置层数（默认）
                        if (te.burnExplodeRefresh) {
                            effect.stacks = maxStacks; // 刷新到满层
                            effect.duration = Math.max(effect.duration, 3); // 刷新持续时间
                        } else {
                            effect.stacks = 1; // 重置层数
                        }
                        // 燃烧蔓延
                        if (te.burnSpread) {
                            this.addLog(`🔥 火势蔓延！`, 'element');
                        }
                    }
                    // 燃烧降防：燃烧时敌人防御降低
                    if (te.burnDefenseDown && !effect._defDownApplied) {
                        effect._defDownApplied = true;
                        this.enemy.defense = Math.floor(this.enemy.defense * (1 - te.burnDefenseDown));
                        this.addLog(`🔥 燃烧削弱！${this.enemy.name} 防御降低！`, 'debuff');
                    }
                }
            }
            // 冻结掉血（frozenHpDrain：每回合损失%最大HP）
            if ((effect.type === 'freeze' || effect.type === 'frozen') && effect.hpDrain) {
                const drainDmg = Math.floor(target.maxHp * effect.hpDrain);
                this.applyDamage(target, { amount: drainDmg, isCrit: false, isMiss: false, element: 'ice' }, null);
                this.addLog(`❄️ ${targetName} 被冻伤，损失 ${drainDmg} 点生命！`, 'damage');
            }
            // v1.5.4: 麻痹掉血（paralyzeHpDrain：麻痹目标每回合损失%最大HP）
            if (effect.type === 'paralyze' && !isPlayer && this.player.talentEffects && this.player.talentEffects.paralyzeHpDrain) {
                const drainDmg = Math.floor(target.maxHp * this.player.talentEffects.paralyzeHpDrain);
                this.applyDamage(target, { amount: drainDmg, isCrit: false, isMiss: false, element: 'thunder' }, null);
                this.addLog(`⚡ ${targetName} 被麻痹电击，损失 ${drainDmg} 点生命！`, 'damage');
            }

            // REG恢复（每回合恢复HP）
            if (effect.regen) {
                let healAmount = Math.floor(effect.regen);
                // 低HP时回复翻倍（lowHpRegenDouble）
                if (isPlayer && this.player.talentEffects && this.player.talentEffects.lowHpRegenDouble) {
                    if (target.hp / target.maxHp < 0.3) {
                        healAmount *= 2;
                    }
                }
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(target);
                healAmount = Math.floor(healAmount * healMultiplier);
                if (healAmount > 0) {
                    target.hp = Math.min(target.maxHp, target.hp + healAmount);
                    this.addLog(`${targetName} 受到 ${effect.name} 恢复 ${healAmount} 点生命`, 'heal');
                }
            }

            // 效果结束
            if (effect.duration <= 0) {
                // 霜爆（frostExplosion）：解冻时造成伤害
                if ((effect.type === 'freeze' || effect.type === 'frozen') && !isPlayer && this.player.talentEffects && this.player.talentEffects.frostExplosion) {
                    const explodeDmg = Math.floor(this.enemy.maxHp * this.player.talentEffects.frostExplosion);
                    this.applyDamage(this.enemy, { amount: explodeDmg, isCrit: false, isMiss: false, element: 'ice' }, this.player);
                    this.addLog(`❄️ 霜爆！${this.enemy.name} 解冻时受到 ${explodeDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', explodeDmg, 'magic');
                }
                // 诅咒结束伤害（curseEndDamage）
                if (effect.type === 'curse' && !isPlayer && this.player.talentEffects && this.player.talentEffects.curseEndDamage) {
                    const curseDmg = Math.floor(this.enemy.maxHp * this.player.talentEffects.curseEndDamage);
                    this.applyDamage(this.enemy, { amount: curseDmg, element: 'dark', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🌑 诅咒爆发！${this.enemy.name} 受到 ${curseDmg} 点暗伤！`, 'element');
                    this.showDamageNumber('enemy', curseDmg, 'magic');
                    // 诅咒传播（curseSpreadChance）：单机简化为额外暗伤
                    const te = this.player.talentEffects;
                    if (te.curseSpreadChance && Math.random() < te.curseSpreadChance) {
                        const spreadDmg = Math.floor(curseDmg * 0.5);
                        this.applyDamage(this.enemy, { amount: spreadDmg, element: 'dark', isCrit: false, isMiss: false }, this.player);
                        this.addLog(`🌑 诅咒蔓延！额外造成 ${spreadDmg} 点暗伤！`, 'element');
                    }
                }
                if (effect.type !== 'shield') {
                    this.addLog(`${targetName} 的 ${effect.name} 效果消失了`, 'system');
                }
                // v3.1.0: 守护结束回血（guardEndHeal，召唤系防御流Lv7延伸）
                if (effect.type === 'summon_guard' && isPlayer && this.player.talentEffects?.guardEndHeal) {
                    const healAmount = Math.floor(this.player.maxHp * this.player.talentEffects.guardEndHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🛡️ 契约守护结束！恢复 ${healAmount} 点生命！`, 'heal');
                }
                removedEffects.push({ effect, reason: 'expired' });
                return false;
            }
            return true;
        });

        // 发布状态移除事件
        if (removedEffects.length > 0 && typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            removedEffects.forEach(item => {
                BattleEventBus.emit(BattleEvents.STATUS_REMOVED, {
                    target: isPlayer ? 'player' : 'enemy',
                    effect: item.effect,
                    reason: item.reason
                });
            });
        }

        // 清除融化加成标记
        if (target._meltBonus) delete target._meltBonus;

        // 自动净化（autoPurify）：每回合自动净化1个负面状态
        if (isPlayer && this.player.talentEffects && this.player.talentEffects.autoPurify) {
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'slow', 'poison', 'curse', 'paralyze', 'weakness', 'bleed', 'bind', 'blind', 'fear', 'shock', 'attack_down', 'defense_down'];
            const purgeable = target.statusEffects.filter(e => debuffTypes.includes(e.type) && !e._unpurgeable && !e.unpurgeable);
            if (purgeable.length > 0) {
                const toRemove = purgeable[0];
                target.statusEffects = target.statusEffects.filter(e => e !== toRemove);
                this.addLog(`✨ 自动净化！清除了 ${toRemove.name}！`, 'buff');
            }
        }

        // 生命之种（lifeSeed）：延迟治疗，3回合后爆发
        if (isPlayer && target._lifeSeedDelay > 0) {
            target._lifeSeedDelay--;
            if (target._lifeSeedDelay <= 0) {
                const healAmount = target._lifeSeedHeal || Math.floor(target.maxHp * 0.2);
                target.hp = Math.min(target.maxHp, target.hp + healAmount);
                this.addLog(`🌱 生命之种绽放！恢复 ${healAmount} 点生命！`, 'heal');
                delete target._lifeSeedDelay;
                delete target._lifeSeedHeal;
            }
        }

        // 滋润附加效果（regenDamageReduction/regenDefenseBonus/regenMp）
        if (isPlayer && this.player.talentEffects) {
            const te = this.player.talentEffects;
            const hasRegen = target.statusEffects.some(e => e.type === 'regen');
            if (hasRegen) {
                if (te.regenMp) {
                    target.mp = Math.min(target.maxMp, target.mp + te.regenMp);
                }
            }
        }
        
        // 处理增益效果（buffs）的持续时间
        if (target.buffs && target.buffs.length > 0) {
            target.buffs = target.buffs.filter(buff => {
                // 护盾类型的buff不随时间消失（被打掉才消失）
                if (buff.type === 'shield') {
                    if ((buff.shieldAmount || 0) <= 0) {
                        return false;
                    }
                    return true;
                }
                
                // 减少持续时间
                if (buff.duration !== undefined && buff.duration !== null) {
                    buff.duration--;
                    if (buff.duration <= 0) {
                        return false;
                    }
                }
                
                return true;
            });
        }
    }


// 导出模块集合
export const BattleStatus = {
    tickStatusEffects
};

export default BattleStatus;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleStatus = BattleStatus;
}