/**
 * 战斗系统 - 战斗结束模块
 * 
 * 从battle.js拆分出的独立战斗结束模块
 * 包含：战斗结束处理（endBattle）
 */

export function endBattle() {
        this.active = false;
        this.playerCasting = null;
        this.enemyCasting = null;
        this.autoBattle = false; // 结束战斗时关闭自动战斗
        this._stopAutoBattleWatchdog(); // v0.47.1: 停止看门狗

        // v2.2.0: 清理天赋战斗状态
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.cleanup();
        }
        // v2.2.0: 重置战斗临时状态
        if (this.player) {
            this.player.plantGrowthStacks = 0;
        }
        if (this.enemy) {
            this.enemy.curseStacks = 0;
        }

        // 关闭战斗帮助界面（避免残留）
        this.closeHelp();

        // 移除键盘快捷键监听
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        
        // 同步玩家状态
        Player.hp = this.player.hp;
        Player.mp = this.player.mp;

        // v0.38.0: 战斗胜利后恢复15%HP+20%MP（降低战后资源压力）
        if (this.result === 'win') {
            let hpRestoreRate = 0.15;
            let mpRestoreRate = 0.20;
            // v0.99.1: 连续猎魔疲劳（第4次后恢复减半，模拟疲惫）
            if (this.source === 'hunt' && (Player.dailyActions?.hunt || 0) >= 4) {
                hpRestoreRate = 0.075;
                mpRestoreRate = 0.10;
                this.addLog('⚠️ 连续猎魔感到疲惫，战后恢复效果减半', 'debuff');
            }
            const hpRestore = Math.floor(Player.maxHp * hpRestoreRate);
            const mpRestore = Math.floor(Player.maxMp * mpRestoreRate);
            Player.hp = Math.min(Player.maxHp, Player.hp + hpRestore);
            Player.mp = Math.min(Player.maxMp, Player.mp + mpRestore);
            this.addLog(`💚 战斗胜利，恢复 ${hpRestore} HP、${mpRestore} MP`, 'system');

            // v2.9.1: 战斗统计信息
            const battleStats = [];
            if (this.interruptCount && this.interruptCount > 0) {
                battleStats.push(`🔮 打断施法 ${this.interruptCount} 次`);
            }
            if (this.stats?.critCount && this.stats.critCount > 0) {
                battleStats.push(`💥 暴击 ${this.stats.critCount} 次`);
            }
            if (this.stats?.totalDamage && this.stats.totalDamage > 0) {
                battleStats.push(`⚔️ 总伤害 ${this.stats.totalDamage}`);
            }
            if (this.turn && this.turn > 0) {
                battleStats.push(`⏱️ 用时 ${this.turn} 回合`);
            }
            if (battleStats.length > 0) {
                this.addLog(`📊 战斗统计：${battleStats.join('，')}`, 'system');
            }
        }

        // v0.15.0: 战斗胜利时记录技能记忆（对该妖魔最后使用的技能）
        if (this.result === 'win' && this.lastSkillId && this.enemy && this.enemy.id) {
            if (typeof Player !== 'undefined' && Player.skillMemory !== undefined) {
                Player.skillMemory[this.enemy.id] = this.lastSkillId;
            }
        }

        // 发布战斗结束事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.BATTLE_END, {
                result: this.result,
                enemy: this.enemy,
                stats: this.stats,
                rating: this.rating,
                turn: this.turn
            });
        }
    }


// 导出模块集合
export const BattleEnd = {
    endBattle
};

export default BattleEnd;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleEnd = BattleEnd;
}