/**
 * 战斗系统 - 玩家使用物品模块
 * 
 * 从battle.js拆分出的独立玩家使用物品模块
 * 包含：玩家使用物品（playerUseItem）
 */

export function playerUseItem(itemId) {
        if (!this.active || !this.isPlayerTurn) return null;

        const item = Inventory.getItem(itemId);
        if (!item) {
            this.addLog('物品不存在', 'system');
            return null;
        }

        const result = Inventory.useItem(itemId, true);
        if (!result.success) {
            this.addLog(result.message, 'system');
            return null;
        }

        // 直接在战斗中应用恢复效果，确保数值正确
        let healMsg = '';
        if (item.effects) {
            if (item.effects.hp) {
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(this.player);
                let rawHeal = Math.floor(item.effects.hp * healMultiplier);
                const healAmount = Math.min(rawHeal, this.player.maxHp - this.player.hp);
                this.player.hp += healAmount;
                healMsg += `恢复了 ${healAmount} 点生命${healMultiplier < 1 ? '（治疗效果降低）' : ''} `;
            }
            if (item.effects.mp) {
                const mpAmount = Math.min(item.effects.mp, this.player.maxMp - this.player.mp);
                this.player.mp += mpAmount;
                healMsg += `恢复了 ${mpAmount} 点魔法值 `;
            }
        }
        
        // 同步到Player对象
        Player.hp = this.player.hp;
        Player.mp = this.player.mp;

        this.addLog(`你使用了 ${item.name}，${healMsg || result.message}`, 'system');
        
        // 立即更新UI，让玩家看到效果
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }

        // 处理物品的状态效果
        if (item.statusEffects && item.statusEffects.length > 0) {
            if (item.effects && item.effects.damage) {
                // 伤害类道具：状态效果施加给敌人
                this.applyStatusEffects(this.enemy, item.statusEffects, false);
            } else {
                // 增益类道具：状态效果施加给玩家
                this.applyStatusEffects(this.player, item.statusEffects, true);
            }
        }

        // 处理伤害类道具（对敌人造成伤害）
        if (item.effects && item.effects.damage) {
            const dmg = this.calculateDamage(
                item.effects.damage,
                this.enemy.defense,
                1.0,
                0,
                1.0,
                item.element || 'neutral',
                this.enemy.elements?.[0] || 'neutral',
                this.enemy,
                this.player
            );
            this.applyDamage(this.enemy, dmg, this.player);
        }

        // 处理净化类道具
        if (item.effects && item.effects.cleanse) {
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness', 'bleed', 'healing_reduction', 'bind', 'blind', 'confuse'];
            this.player.statusEffects = this.player.statusEffects.filter(e => !debuffTypes.includes(e.type));
            this.addLog('净化了所有负面状态！', 'buff');
        }

        this.endPlayerTurn();
        return result;
    }


// 导出模块集合
export const BattlePlayerItem = {
    playerUseItem
};

export default BattlePlayerItem;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattlePlayerItem = BattlePlayerItem;
}