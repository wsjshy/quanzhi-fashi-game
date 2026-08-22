/**
 * 战斗系统 - 灵种效果模块
 * 
 * 从battle.js拆分出的独立灵种效果模块
 * 包含：应用灵种特殊效果（applySpiritSeedEffects）
 */

export function applySpiritSeedEffects(target, element) {
        try {
            if (typeof Player === 'undefined' || typeof SpiritSeedSystem === 'undefined') return;
            
            const seedEffects = Player.getElementSpiritSeedEffects(element);
            if (!seedEffects) return;
            
            const targetName = this.isPlayerTurn ? this.enemy.name : '你';
            const extraEffects = [];
            
            // 火系灵种：额外灼烧
            if (element === 'fire' && seedEffects.burnChance) {
                if (Math.random() < seedEffects.burnChance) {
                    extraEffects.push({
                        name: '灵种灼烧',
                        type: 'burn',
                        element: 'fire',
                        dotDamage: Math.floor(8 * (1 + (seedEffects.burnDamage || 0))),
                        duration: 3,
                        chance: 1,
                        stacks: 1,
                        maxStacks: 5
                    });
                }
            }
            
            // 冰系灵种：额外减速
            if (element === 'ice' && seedEffects.slowChance) {
                if (Math.random() < seedEffects.slowChance) {
                    extraEffects.push({
                        name: '灵种冰封',
                        type: 'slow',
                        element: 'ice',
                        duration: 3,
                        chance: 1,
                        statModifiers: { speed: -15 }
                    });
                }
            }
            
            // 雷系灵种：额外麻痹
            if (element === 'thunder' && seedEffects.stunChance) {
                if (Math.random() < seedEffects.stunChance) {
                    extraEffects.push({
                        name: '灵种雷击',
                        type: 'stun',
                        element: 'thunder',
                        duration: 1,
                        chance: 1
                    });
                }
            }
            
            // 暗影系灵种：额外诅咒
            if (element === 'dark' && seedEffects.curseChance) {
                if (Math.random() < seedEffects.curseChance) {
                    extraEffects.push({
                        name: '灵种诅咒',
                        type: 'attack_down',
                        element: 'dark',
                        duration: 3,
                        chance: 1,
                        statModifiers: { attack: -15 }
                    });
                }
            }
            
            // 土系灵种：防御加成（被动属性，不在战斗中临时施加）
            if (element === 'earth' && seedEffects.defenseBonus) {
                // 土系灵种的防御加成在属性计算中生效
            }
            
            // 风系灵种：加速（自身增益）
            if (element === 'wind' && seedEffects.speedBonus) {
                // 风系灵种主要是伤害加成，速度加成在属性里
            }
            
            // 水系灵种：回复（自身增益）
            if (element === 'water' && seedEffects.regenBonus) {
                // 水系灵种的回复效果在治疗技能里体现
            }
            
            // 光系灵种：净化（自身增益）
            if (element === 'light' && seedEffects.purifyChance) {
                if (Math.random() < seedEffects.purifyChance) {
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness', 'bleed', 'healing_reduction', 'bind', 'blind', 'confuse'];
                    const beforeCount = Player.statusEffects ? Player.statusEffects.length : 0;
                    if (Player.statusEffects) {
                        Player.statusEffects = Player.statusEffects.filter(e => !debuffTypes.includes(e.type));
                    }
                    const removed = beforeCount - (Player.statusEffects ? Player.statusEffects.length : 0);
                    if (removed > 0) {
                        this.addLog(`✨ 灵种圣光净化了 ${removed} 个负面状态！`, 'buff');
                    }
                }
            }
            
            // 施加额外效果
            if (extraEffects.length > 0) {
                this.applyStatusEffects(target, extraEffects, !this.isPlayerTurn);
                this.addLog(`✨ 灵种效果触发！`, 'buff');
            }
            
        } catch (e) {
            console.warn('[Battle] 灵种效果应用失败:', e);
        }
    }


// 导出模块集合
export const BattleSpiritSeed = {
    applySpiritSeedEffects
};

export default BattleSpiritSeed;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleSpiritSeed = BattleSpiritSeed;
}