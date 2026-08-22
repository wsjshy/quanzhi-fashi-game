/**
 * 战斗系统 - 战斗结束检查模块
 * 
 * 从battle.js拆分出的独立战斗结束检查模块
 * 包含：检查战斗结束（checkBattleEnd）
 */

export function checkBattleEnd() {
        if (this.player.hp <= 0 || (this.battleOptions.winHpPercent > 0 && this.player.hp <= this.player.maxHp * this.battleOptions.winHpPercent)) {
            this.result = 'lose';
            this.active = false;
            
            if (this.battleOptions.isFriendly) {
                this.addLog('你认输了...', 'system');
            } else {
                this.addLog('你被击败了...', 'system');
            }
            
            // 重置连胜
            if (typeof Player !== 'undefined') {
                Player.winStreak = 0;
            }
            
            // 发布玩家死亡事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.PLAYER_DEATH, {
                    enemy: this.enemy,
                    turn: this.turn
                });
            }
            
            return true;
        }

        if (this.enemy.hp <= 0 || (this.battleOptions.winHpPercent > 0 && this.enemy.hp <= this.enemy.maxHp * this.battleOptions.winHpPercent)) {
            this.result = 'win';
            this.active = false;

            // 天赋击杀效果：击杀回血/回MP
            if (this.player.talentEffects) {
                const te = this.player.talentEffects;
                if (te.killHeal && te.killHeal > 0) {
                    const healAmount = Math.floor(this.player.maxHp * te.killHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`💀 击杀回春！恢复 ${healAmount} 点生命！`, 'heal');
                }
                if (te.killMpRestore && te.killMpRestore > 0) {
                    const mpAmount = Math.floor(this.player.maxMp * te.killMpRestore);
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpAmount);
                    this.addLog(`💀 击杀回蓝！恢复 ${mpAmount} 点MP！`, 'heal');
                }
                // 击杀减技能CD
                if (te.killCooldownReduce && this.player.skillCooldowns) {
                    const reduce = te.killCooldownReduce;
                    for (const sid in this.player.skillCooldowns) {
                        this.player.skillCooldowns[sid] = Math.max(0, this.player.skillCooldowns[sid] - reduce);
                    }
                    this.addLog(`💀 击杀减少技能冷却 ${reduce} 回合！`, 'buff');
                }
                // 击杀后重新隐身（reStealthChance）
                if (te.reStealthChance && Math.random() < te.reStealthChance) {
                    const existingStealth = this.player.statusEffects.find(e => e.type === 'stealth');
                    if (!existingStealth) {
                        this.addStatusEffect(this.player, { type: 'stealth', name: '暗影潜行', duration: 99 });
                        this.player.stealthActive = true;
                        this.addLog(`🌑 影杀！重新进入潜行状态！`, 'buff');
                    }
                }
                // 诅咒击杀回血（curseKillHeal）：击杀被诅咒的敌人额外回血
                if (te.curseKillHeal) {
                    const wasCursed = this.enemy.statusEffects.some(e => e.type === 'curse');
                    if (wasCursed) {
                        const healAmount = Math.floor(this.player.maxHp * te.curseKillHeal);
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                        this.addLog(`🌑 诅咒汲取！恢复 ${healAmount} 点生命！`, 'heal');
                    }
                }
                // 暗影击杀回血（shadowFormHeal）：潜行状态下击杀回血
                if (te.shadowFormHeal && this.player.stealthActive) {
                    const healAmount = Math.floor(this.player.maxHp * te.shadowFormHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🌑 暗影汲取！恢复 ${healAmount} 点生命！`, 'heal');
                }
            }
            
            if (this.battleOptions.isFriendly) {
                this.addLog(`${this.enemy.name} 认输了！你赢得了决斗！`, 'system');
            } else {
                this.addLog(`击败了 ${this.enemy.name}！`, 'system');
            }
            
            // 增加连胜
            if (typeof Player !== 'undefined') {
                Player.winStreak = (Player.winStreak || 0) + 1;
            }
            
            // 计算战斗评价
            this.calculateBattleRating();
            
            // 显示评价
            if (this.rating) {
                this.addLog(`战斗评价：${this.rating.name}（${this.rating.score}分）`, 'system');
            }
            
            // 计算奖励
            this.calculateRewards();
            
            // 成就检查
            if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                this.checkBattleAchievements();
            }
            
            // 发布敌人死亡事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.ENEMY_DEATH, {
                    enemy: this.enemy,
                    turn: this.turn,
                    rating: this.rating,
                    stats: this.stats
                });
            }
            
            return true;
        }

        return false;
    }


// 导出模块集合
export const BattleCheckEnd = {
    checkBattleEnd
};

export default BattleCheckEnd;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleCheckEnd = BattleCheckEnd;
}