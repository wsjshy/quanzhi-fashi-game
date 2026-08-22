/**
 * 战斗系统 - 敌人战术AI模块
 * 
 * 从battle.js拆分出的独立敌人战术AI模块
 * 包含：敌人战术AI（enemyAITactical）
 */

export function enemyAITactical() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        const playerHpPercent = this.player.hp / this.player.maxHp;
        const playerMpPercent = this.player.mp / this.player.maxMp;
        const enemyHpPercent = this.enemy.hp / this.enemy.maxHp;
        
        // 1. 玩家在引导大招，优先打断
        if (this.playerCasting) {
            // 普攻打断
            if (Math.random() < 0.8) {
                return { type: 'attack' };
            }
        }
        
        // 2. 自己血量很低，防御/治疗
        if (enemyHpPercent < 0.25) {
            const healSkill = availableSkills.find(id => {
                const skill = SkillSystem.getSkill(id);
                return skill && skill.type === 'heal';
            });
            
            if (healSkill && Math.random() < 0.8) {
                return { type: 'skill', skillId: healSkill };
            }
            
            if (Math.random() < 0.5) {
                return { type: 'defend' };
            }
        }
        
        // 3. 玩家血量很低，猛攻
        if (playerHpPercent < 0.3) {
            if (availableSkills.length > 0) {
                let bestSkill = null;
                let bestDamage = 0;
                for (const skillId of availableSkills) {
                    const skill = SkillSystem.getSkill(skillId);
                    if (skill && skill.type === 'damage') {
                        const dmg = skill.baseDamage || 0;
                        if (dmg > bestDamage) {
                            bestDamage = dmg;
                            bestSkill = skillId;
                        }
                    }
                }
                if (bestSkill) {
                    return { type: 'skill', skillId: bestSkill };
                }
            }
            return { type: 'attack' };
        }
        
        // 4. 玩家MP很少，消耗战
        if (playerMpPercent < 0.2) {
            // 玩家没MP了，用小技能消耗
            if (availableSkills.length > 0 && Math.random() < 0.5) {
                const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                return { type: 'skill', skillId: skillId };
            }
            return { type: 'attack' };
        }
        
        // 5. 正常情况：有策略的攻击
        // 利用元素克制
        const playerElement = this.player.elements?.[0] || 'neutral';
        const counterSkill = availableSkills.find(id => {
            const skill = SkillSystem.getSkill(id);
            if (!skill || !skill.element) return false;
            return this.ELEMENT_COUNTER[skill.element] === playerElement;
        });
        
        if (counterSkill && Math.random() < 0.6) {
            return { type: 'skill', skillId: counterSkill };
        }
        
        // 正常输出
        if (availableSkills.length > 0 && Math.random() < 0.5) {
            const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            return { type: 'skill', skillId: skillId };
        }
        
        return { type: 'attack' };
    }


// 导出模块集合
export const BattleAITactical = {
    enemyAITactical
};

export default BattleAITactical;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleAITactical = BattleAITactical;
}