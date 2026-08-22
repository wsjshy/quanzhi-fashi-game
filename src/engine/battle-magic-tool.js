/**
 * 战斗系统 - 魔器效果模块
 * 
 * 从battle.js拆分出的独立魔器效果模块
 * 包含：应用魔器效果（applyMagicToolEffect）
 */

export function applyMagicToolEffect(effect, skill) {
        const value = effect.value || 0;
        const duration = effect.duration || 1;
        
        switch (effect.type) {
            case 'attack_buff': // 攻击提升
                const attackBuff = {
                    type: 'attack_up',
                    name: skill.name,
                    duration: duration,
                    attackMod: value,
                    isNextAttackOnly: effect.isNextAttackOnly || false
                };
                this.player.buffs.push(attackBuff);
                break;
                
            case 'defense_buff': // 防御提升
                const defenseBuff = {
                    type: 'defense_up',
                    name: skill.name,
                    duration: duration,
                    defenseMod: value
                };
                this.player.buffs.push(defenseBuff);
                break;
                
            case 'speed_buff': // 速度提升
                const speedBuff = {
                    type: 'speed_up',
                    name: skill.name,
                    duration: duration,
                    speedMod: value
                };
                this.player.buffs.push(speedBuff);
                break;
                
            case 'dodge_buff': // 闪避提升
                const dodgeBuff = {
                    type: 'evasion_up',
                    name: skill.name,
                    duration: duration,
                    dodgeMod: value
                };
                this.player.buffs.push(dodgeBuff);
                break;
                
            case 'shield': // 护盾
                const shieldBuff = {
                    type: 'shield',
                    name: skill.name,
                    duration: 99, // 直到被打破
                    shieldAmount: value,
                    maxShieldAmount: value
                };
                this.player.buffs.push(shieldBuff);
                break;
                
            case 'fire_resistance_buff': // 火系抗性提升
                const fireResBuff = {
                    type: 'fire_resistance_up',
                    name: skill.name,
                    duration: duration,
                    resistanceMod: value
                };
                this.player.buffs.push(fireResBuff);
                break;
                
            case 'next_dodge_guaranteed': // 下次必定闪避
                const nextDodgeBuff = {
                    type: 'next_dodge_guaranteed',
                    name: skill.name,
                    duration: duration,
                    value: value
                };
                this.player.buffs.push(nextDodgeBuff);
                break;
                
            case 'burn_chance': // 攻击有几率灼烧
                // 这个效果需要在攻击命中时触发，先加一个标记
                const burnChanceBuff = {
                    type: 'burn_chance_on_attack',
                    name: skill.name,
                    duration: duration,
                    chance: value,
                    damagePerTurn: effect.damagePerTurn || 10
                };
                this.player.buffs.push(burnChanceBuff);
                break;
                
            case 'freeze_chance_on_hit': // 受击时有几率冻结攻击者
                const freezeChanceBuff = {
                    type: 'freeze_chance_on_hit',
                    name: skill.name,
                    duration: 99, // 持续到护盾消失
                    chance: value,
                    freezeDuration: effect.duration || 1
                };
                this.player.buffs.push(freezeChanceBuff);
                break;
                
            case 'heal': // 治疗
                const healAmount = Math.floor(value);
                const oldHp = this.player.hp;
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                const actualHeal = this.player.hp - oldHp;
                this.addLog(`恢复了 ${actualHeal} 点生命值！`, 'heal');
                break;
                
            case 'mana_restore': // 恢复MP
                const manaAmount = Math.floor(value);
                const oldMp = this.player.mp;
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + manaAmount);
                const actualMana = this.player.mp - oldMp;
                this.addLog(`恢复了 ${actualMana} 点魔法值！`, 'heal');
                break;
                
            case 'cleanse': // 净化（移除负面状态）
                const removed = [];
                this.player.statusEffects = this.player.statusEffects.filter(s => {
                    const isDebuff = ['burn', 'freeze', 'frozen', 'stun', 'poison', 'slow', 'curse', 'blind', 'bind', 'paralyze', 'electrified'].includes(s.type);
                    if (isDebuff && !s.unpurgeable) {
                        removed.push(s.name || s.type);
                        return false;
                    }
                    return true;
                });
                if (removed.length > 0) {
                    this.addLog(`净化了 ${removed.length} 个负面状态！`, 'heal');
                } else {
                    this.addLog(`没有需要净化的负面状态。`, 'system');
                }
                break;
                
            case 'crit_buff': // 暴击率提升
                const critBuff = {
                    type: 'crit_up',
                    name: skill.name,
                    duration: duration,
                    critMod: value
                };
                this.player.buffs.push(critBuff);
                break;
                
            case 'hit_buff': // 命中率提升
                const hitBuff = {
                    type: 'hit_up',
                    name: skill.name,
                    duration: duration,
                    hitMod: value
                };
                this.player.buffs.push(hitBuff);
                break;
                
            case 'lifesteal': // 攻击吸血（持续效果）
                const lifestealBuff = {
                    type: 'lifesteal',
                    name: skill.name,
                    duration: duration,
                    lifestealPercent: value
                };
                this.player.buffs.push(lifestealBuff);
                break;
                
            case 'damage_reflect': // 伤害反弹（持续效果）
                const reflectBuff = {
                    type: 'damage_reflect',
                    name: skill.name,
                    duration: duration,
                    reflectPercent: value
                };
                this.player.buffs.push(reflectBuff);
                break;
                
            default:
                console.warn(`[MagicTool] 未知效果类型: ${effect.type}`);
        }
    }


// 导出模块集合
export const BattleMagicTool = {
    applyMagicToolEffect
};

export default BattleMagicTool;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleMagicTool = BattleMagicTool;
}