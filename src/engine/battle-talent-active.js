/**
 * 战斗系统 - 天赋主动技能模块
 * 
 * 从battle.js拆分出的独立天赋主动技能模块
 * 包含：使用天赋主动技能（useTalentActiveSkill）
 */

export function useTalentActiveSkill(talentId) {
        if (!this.active || !this.isPlayerTurn) return null;

        // 获取玩家天赋（v2.4.1: 修复talents是对象格式）
        const talentList = this.player.talents ? Object.values(this.player.talents) : [];
        const playerTalent = talentList.find(t => t.talentId === talentId);
        if (!playerTalent) {
            this.addLog('未装备该天赋', 'system');
            return null;
        }

        // 获取天赋数据
        const talentData = typeof DataTalents !== 'undefined' ? DataTalents[talentId] : null;
        if (!talentData || !talentData.activeSkill) {
            this.addLog('该天赋没有主动技能', 'system');
            return null;
        }

        // 检查等级（Lv5解锁主动技能）
        if (playerTalent.level < 5) {
            this.addLog(`天赋等级不足（需要Lv5，当前Lv${playerTalent.level}）`, 'system');
            return null;
        }

        const activeSkill = talentData.activeSkill;

        // 检查冷却
        if (typeof TalentCombatSystem !== 'undefined' && !TalentCombatSystem.canUseActiveSkill(activeSkill.id)) {
            const cd = TalentCombatSystem.getSkillCooldown(activeSkill.id);
            this.addLog(`${activeSkill.name} 还在冷却中（${cd}回合）`, 'system');
            return null;
        }

        // 检查资源消耗
        if (activeSkill.cost && typeof TalentCombatSystem !== 'undefined') {
            const resourceType = talentData.resourceType || talentData.element;
            const currentEnergy = TalentCombatSystem.getEnergy(resourceType);
            if (currentEnergy < activeSkill.cost) {
                this.addLog(`${activeSkill.name} 资源不足（需要${activeSkill.cost}，当前${currentEnergy}）`, 'system');
                return null;
            }
            // 消耗资源
            TalentCombatSystem.consumeEnergy(resourceType, activeSkill.cost);
        }

        this.player.isDefending = false;

        // 执行技能效果
        this.addLog(`你催动了天赋技能「${activeSkill.name}」！`, 'buff');

        // 伤害类主动技能
        if (activeSkill.damageMultiplier) {
            const baseDamage = Math.floor(this.player.attack * activeSkill.damageMultiplier);
            const damage = {
                amount: baseDamage,
                element: talentData.element,
                isCrit: false,
                isMiss: false
            };
            this.applyDamage(this.enemy, damage, this.player);
        }

        // 附加燃烧
        if (activeSkill.burnStacks && this.enemy.burnStacks !== undefined) {
            this.enemy.burnStacks = (this.enemy.burnStacks || 0) + activeSkill.burnStacks;
            this.addLog(`目标附加了${activeSkill.burnStacks}层燃烧！`, 'debuff');
        }

        // 附加寒霜
        if (activeSkill.frostGain && this.enemy.frostStacks !== undefined) {
            this.enemy.frostStacks = (this.enemy.frostStacks || 0) + activeSkill.frostGain;
        }

        // 麻痹效果（雷系主动技能）
        if (activeSkill.paralyzeChance && Math.random() < activeSkill.paralyzeChance) {
            const paralyzeEffect = {
                type: 'paralyze',
                name: '麻痹',
                duration: activeSkill.paralyzeDuration || 1,
                missChance: 0.5
            };
            this.applyStatusEffects(this.enemy, [paralyzeEffect], true);
            this.addLog(`目标被麻痹了！（${activeSkill.paralyzeDuration || 1}回合）`, 'debuff');
        }

        // 设置冷却
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.useActiveSkill(activeSkill.id, activeSkill.cooldown || 2);
        }

        // 消耗回合
        this.endPlayerTurn();

        return { success: true, skill: activeSkill };
    }


// 导出模块集合
export const BattleTalentActive = {
    useTalentActiveSkill
};

export default BattleTalentActive;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleTalentActive = BattleTalentActive;
}