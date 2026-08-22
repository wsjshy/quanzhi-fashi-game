/**
 * 战斗系统 - 状态修饰符模块
 * 
 * 从battle.js拆分出的独立状态修饰符模块
 * 包含：获取状态修饰符（getStatusModifiers）
 */

export function getStatusModifiers(target) {
        const mods = {
            attackMod: 0,
            defenseMod: 0,
            speedMod: 0,
            hitRateMod: 0,
            evasionMod: 0,
            critRateMod: 0,
            fireDamageMod: 1,
            thunderDamageMod: 1,
            iceDamageMod: 1,
            darkDamageMod: 1,
            fireResistanceMod: 0,
            lifesteal: 0,
            damageReflect: 0,
            nextDodgeGuaranteed: false,
            burnChanceOnAttack: 0,
            burnDamagePerTurn: 0,
            freezeChanceOnHit: 0,
            freezeDuration: 0
        };

        // 处理状态效果
        target.statusEffects.forEach(effect => {
            if (effect.statModifiers) {
                const stacks = effect.stacks || 1;
                mods.attackMod += (effect.statModifiers.attack || 0) * stacks;
                mods.defenseMod += (effect.statModifiers.defense || 0) * stacks;
                mods.speedMod += (effect.statModifiers.speed || 0) * stacks;
            }
            if (effect.speedMod) mods.speedMod += effect.speedMod;
            if (effect.hitRateMod) mods.hitRateMod += effect.hitRateMod;
            if (effect.hitMod) mods.hitRateMod += effect.hitMod;
            if (effect.evasionMod) mods.evasionMod += effect.evasionMod;
            // 诅咒：降低攻防
            if (effect.type === 'curse') {
                if (effect.atkMod) mods.attackMod = (mods.attackMod || 0) + effect.atkMod;
                if (effect.defMod) mods.defenseMod = (mods.defenseMod || 0) + effect.defMod;
                if (effect.critDown) mods.critRateMod = (mods.critRateMod || 0) - effect.critDown;
                if (effect.dodgeDown) mods.evasionMod = (mods.evasionMod || 0) - effect.dodgeDown;
            }
            // 暗影标记：暗系伤害增加
            if (effect.type === 'darkMark' && effect.darkDamageBonus) {
                mods.darkDamageMod = (mods.darkDamageMod || 1) + effect.darkDamageBonus;
            }
            // 湿润状态受雷系伤害×2
            if (effect.type === 'wet' || effect.type === 'electrified') {
                mods.thunderDamageMod *= 2;
            }
            // 冻结状态受火系伤害×2
            if (effect.type === 'frozen') {
                mods.fireDamageMod *= 2;
                // 冻结降防（freezeDefenseDown）
                if (effect.defenseDown) {
                    mods.defenseMod -= effect.defenseDown;
                }
            }
            // 冰冻状态降防（freezeDefenseDown）
            if (effect.type === 'freeze' && effect.defenseDown) {
                mods.defenseMod -= effect.defenseDown;
            }
            // 伤害反弹
            if (effect.type === 'damage_reflect' && effect.reflectPercent) {
                mods.damageReflect += effect.reflectPercent;
            }
            // 致盲/命中降低
            if (effect.type === 'accuracy_down' && effect.value) {
                mods.hitRateMod -= effect.value;
            }
            // 中毒持续伤害（在回合结束处理，这里只标记）
            if (effect.type === 'poison' && effect.damage) {
                // 中毒伤害在turnEnd中处理
            }
            // v1.6.0: 恐惧状态（fear）- 面对强大妖魔时的心理压力
            if (effect.type === 'fear') {
                const fearLevel = effect.level || 1;
                mods.attackMod -= fearLevel * 5; // 每级恐惧-5攻击
                mods.hitRateMod -= fearLevel * 0.05; // 每级恐惧-5%命中
                mods.critRateMod -= fearLevel * 0.03; // 每级恐惧-3%暴击
            }
        });

        // 滋润附加效果（regenDamageReduction/regenDefenseBonus）：有regen状态时减伤/加防
        if (target === this.player && target.talentEffects) {
            const te = target.talentEffects;
            const hasRegen = target.statusEffects.some(e => e.type === 'regen');
            if (hasRegen) {
                if (te.regenDamageReduction) {
                    mods._regenDamageReduction = te.regenDamageReduction;
                }
                if (te.regenDefenseBonus) {
                    mods.defenseMod += te.regenDefenseBonus;
                }
            }
        }
        
        // 处理增益效果（buffs）
        if (target.buffs && target.buffs.length > 0) {
            target.buffs.forEach(buff => {
                switch (buff.type) {
                    case 'attack_up':
                        mods.attackMod += buff.attackMod || 0;
                        break;
                    case 'defense_up':
                        mods.defenseMod += buff.defenseMod || 0;
                        break;
                    case 'speed_up':
                        mods.speedMod += buff.speedMod || 0;
                        break;
                    case 'evasion_up':
                        mods.evasionMod += buff.dodgeMod || 0;
                        break;
                    case 'crit_up':
                        mods.critRateMod += buff.critMod || 0;
                        break;
                    case 'hit_up':
                        mods.hitRateMod += buff.hitMod || 0;
                        break;
                    case 'fire_resistance_up':
                        mods.fireResistanceMod += buff.resistanceMod || 0;
                        break;
                    case 'lifesteal':
                        mods.lifesteal += buff.lifestealPercent || 0;
                        break;
                    case 'damage_reflect':
                        mods.damageReflect += buff.reflectPercent || 0;
                        break;
                    case 'next_dodge_guaranteed':
                        mods.nextDodgeGuaranteed = true;
                        break;
                    case 'burn_chance_on_attack':
                        mods.burnChanceOnAttack += buff.chance || 0;
                        mods.burnDamagePerTurn = buff.damagePerTurn || 10;
                        break;
                    case 'freeze_chance_on_hit':
                        mods.freezeChanceOnHit += buff.chance || 0;
                        mods.freezeDuration = buff.freezeDuration || 1;
                        break;
                }
            });
        }

        // 融化加成
        if (target._meltBonus) {
            mods.fireDamageMod *= target._meltBonus;
        }

        return mods;
    }


// 导出模块集合
export const BattleStatusModifiers = {
    getStatusModifiers
};

export default BattleStatusModifiers;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleStatusModifiers = BattleStatusModifiers;
}