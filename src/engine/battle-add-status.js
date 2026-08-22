/**
 * 战斗系统 - 添加状态效果模块
 * 
 * 从battle.js拆分出的独立添加状态效果模块
 * 包含：添加状态效果（addStatusEffect）
 */

export function addStatusEffect(target, effect) {
        if (!target || !target.statusEffects) return false;
        const isPlayerTarget = target === this.player;
        const targetName = isPlayerTarget ? '你' : (this.enemy?.name || '目标');

        // v2.9.0: 控制技能100%打断敌方魔法师施法（仅魔法师敌人，妖魔不适用）
        const isEnemyMage = !isPlayerTarget && (this.enemy?.isMage === true || this.enemy?.enemyType === 'mage');
        const controlTypes = ['stun', 'silence', 'freeze', 'frozen', 'paralyze', 'bind', 'fear', 'sleep'];
        if (isEnemyMage && this.enemyCasting && controlTypes.includes(effect.type)) {
            const interruptedSkill = this.enemyCasting.skill?.name || '魔法';
            this.addLog(`💥 ${effect.name || effect.type}打断了 ${this.enemy.name} 的 ${interruptedSkill} 引导！敌方施法失败！`, 'interrupt-success');
            this.enemyCasting = null;
            // v2.9.1: 打断成功视觉反馈（青色闪光+震屏）
            if (typeof document !== 'undefined') {
                const flash = document.createElement('div');
                flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(100,220,255,0.4) 0%,rgba(100,200,255,0.2) 50%,transparent 70%);z-index:9998;pointer-events:none;animation:highTierFlash 0.6s ease-out forwards;';
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 700);
                const battleScreen = document.getElementById('battle-screen') || document.querySelector('.battle-container') || document.body;
                if (battleScreen) {
                    battleScreen.classList.add('screen-shake');
                    setTimeout(() => battleScreen.classList.remove('screen-shake'), 400);
                }
            }
            // 打断次数统计
            this.interruptCount = (this.interruptCount || 0) + 1;
        }

        // debuffImmunity：玩家免疫负面状态
        const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'slow', 'poison', 'curse', 'paralyze', 'weakness', 'bleed', 'bind', 'blind', 'fear', 'shock', 'attack_down', 'defense_down'];
        if (isPlayerTarget && target.talentEffects && target.talentEffects.debuffImmunity) {
            if (debuffTypes.includes(effect.type)) return false;
        }
        // v0.8.27: 召唤兽在场时玩家免疫负面（summonDebuffImmunity）
        if (isPlayerTarget && target.talentEffects && target.talentEffects.summonDebuffImmunity && this.summon && this.summon.hp > 0) {
            if (debuffTypes.includes(effect.type)) {
                this.addLog(`🔗 人兽合一！${this.summon.name} 为你抵挡了负面状态！`, 'buff');
                return false;
            }
        }

        // knockbackImmune：玩家免疫击退/眩晕
        if (isPlayerTarget && target.talentEffects && target.talentEffects.knockbackImmune) {
            if (effect.type === 'stun') return false;
        }

        // shieldDebuffImmune：有护盾时免疫debuff
        if (isPlayerTarget && target.talentEffects && target.talentEffects.shieldDebuffImmune) {
            const hasShield = target.statusEffects.some(e => e.type === 'shield');
            if (hasShield && debuffTypes.includes(effect.type)) return false;
        }

        // 标记unpurgeable
        if (effect.unpurgeable) {
            effect._unpurgeable = true;
        }

        // 天赋：滋润不可驱散（regenUnpurgeable）
        if (isPlayerTarget && effect.type === 'regen' && target.talentEffects && target.talentEffects.regenUnpurgeable) {
            effect._unpurgeable = true;
            effect.unpurgeable = true;
        }

        // 检查是否已有同名效果
        const existing = target.statusEffects.find(e => e.type === effect.type);
        if (existing) {
            // 数值累积型（冻结值、护盾值等）
            if (effect.value !== undefined || existing.value !== undefined) {
                existing.value = (existing.value || 0) + (effect.value || 0);
                existing.duration = Math.max(existing.duration, effect.duration);
                if (effect.type === 'freeze' && existing.value >= 100) {
                    existing.type = 'frozen';
                    existing.name = '冻结';
                    existing.duration = 1;
                    existing.value = 0;
                    this.addLog(`${targetName} 被冻结了！`, 'debuff');
                }
            } else if (effect.stacks || existing.stacks) {
                const maxStacks = effect.maxStacks || existing.maxStacks || 3;
                existing.stacks = Math.min(maxStacks, (existing.stacks || 1) + (effect.stacks || 1));
                existing.duration = Math.max(existing.duration, effect.duration);
            } else {
                existing.duration = Math.max(existing.duration, effect.duration);
            }
            // 保留unpurgeable标记
            if (effect._unpurgeable) existing._unpurgeable = true;
            if (effect.unpurgeable) existing.unpurgeable = true;
            return false;
        }

        // 新效果
        const newEffect = { ...effect, remaining: effect.duration };
        if (effect.stacks && !newEffect.stacks) newEffect.stacks = 1;
        target.statusEffects.push(newEffect);

        // 日志
        if (effect.type === 'stun' || effect.type === 'frozen') {
            this.addLog(`${targetName} 被${effect.name}了！`, 'debuff');
        } else if (effect.type === 'shield') {
            this.addLog(`${targetName} 获得了 ${effect.value} 点${effect.name}！`, 'buff');
        } else if (effect.type === 'stealth') {
            this.addLog(`${targetName} 进入了${effect.name}状态！`, 'buff');
        } else if (effect.type === 'regen') {
            this.addLog(`${targetName} 获得了持续恢复效果！`, 'buff');
        } else if (effect.type === 'wet') {
            this.addLog(`${targetName} 被水浸湿了`, 'debuff');
        } else if (effect.type === 'evasion_up') {
            this.addLog(`${targetName} 闪避率提升！`, 'buff');
        } else if (effect.type === 'attack_down' || effect.type === 'defense_down') {
            this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
        } else if (effect.type === 'slow') {
            this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
        } else {
            this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
        }

        // 发布事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.STATUS_APPLIED, {
                target: isPlayerTarget ? 'player' : 'enemy',
                effect: newEffect,
                isDebuff: !['shield', 'evasion_up', 'attack_up', 'defense_up', 'speed_up', 'crit_up', 'regen', 'cleanse', 'stealth'].includes(effect.type)
            });
        }

        return true;
    }


// 导出模块集合
export const BattleAddStatus = {
    addStatusEffect
};

export default BattleAddStatus;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleAddStatus = BattleAddStatus;
}