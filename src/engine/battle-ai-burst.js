/**
 * 战斗系统 - 敌人爆发AI模块
 * 
 * 从battle.js拆分出的独立敌人爆发AI模块
 * 包含：敌人爆发AI（enemyAIBurst）
 */

export function enemyAIBurst() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        const mpPercent = this.enemy.mp / (this.enemy.maxMp || 50);
        
        // 初始化爆发状态
        if (!this.enemy.burstPhase) {
            this.enemy.burstPhase = 'charging'; // charging（蓄力） / bursting（爆发） / recovering（恢复）
            this.enemy.burstTurns = 0;
        }
        
        this.enemy.burstTurns++;
        
        // 蓄力阶段：攒MP
        if (this.enemy.burstPhase === 'charging') {
            // MP够了，进入爆发阶段
            if (mpPercent >= 0.8) {
                this.enemy.burstPhase = 'bursting';
                this.enemy.burstTurns = 0;
                this.addLog(`${this.enemy.name} 开始爆发！`, 'system');
            } else {
                // 蓄力期：普攻/小技能
                if (availableSkills.length > 0 && Math.random() < 0.3) {
                    // 找消耗MP最少的技能
                    let cheapestSkill = null;
                    let cheapestCost = 999;
                    for (const skillId of availableSkills) {
                        const skill = SkillSystem.getSkill(skillId);
                        if (skill && skill.mpCost < cheapestCost) {
                            cheapestCost = skill.mpCost;
                            cheapestSkill = skillId;
                        }
                    }
                    if (cheapestSkill && cheapestCost <= 10) {
                        return { type: 'skill', skillId: cheapestSkill };
                    }
                }
                return { type: 'attack' };
            }
        }
        
        // 爆发阶段：全力输出
        if (this.enemy.burstPhase === 'bursting') {
            // 爆发持续3回合
            if (this.enemy.burstTurns >= 3 || mpPercent < 0.2) {
                this.enemy.burstPhase = 'recovering';
                this.enemy.burstTurns = 0;
                this.addLog(`${this.enemy.name} 进入虚弱期！`, 'system');
            } else {
                // 爆发期：优先用最强技能
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
        }
        
        // 恢复阶段：防御为主
        if (this.enemy.burstPhase === 'recovering') {
            if (this.enemy.burstTurns >= 3) {
                this.enemy.burstPhase = 'charging';
                this.enemy.burstTurns = 0;
            }
            
            // 恢复期：防御为主
            if (Math.random() < 0.5) {
                return { type: 'defend' };
            }
            
            if (availableSkills.length > 0 && Math.random() < 0.3) {
                const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                return { type: 'skill', skillId: skillId };
            }
            
            return { type: 'attack' };
        }
        
        return { type: 'attack' };
    }


// 导出模块集合
export const BattleAIBurst = {
    enemyAIBurst
};

export default BattleAIBurst;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleAIBurst = BattleAIBurst;
}