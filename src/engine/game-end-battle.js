/**
 * 游戏主流程 - 战斗结束模块
 * 
 * 从game.js拆分出的独立战斗结束模块
 * 包含：结束战斗（endBattle）
 */

    // 结束战斗
export function endBattle() {
        BattleSystem.endBattle();
        UI._expandedBattleElement = null; // v0.94.0: 重置战斗技能展开状态
        
        setTimeout(() => {
            // 如果有战斗结束回调，调用回调
            if (this.battleEndCallback) {
                const callback = this.battleEndCallback;
                this.battleEndCallback = null;
                callback(BattleSystem.result, BattleSystem.rewards);
                return;
            }
            
            if (BattleSystem.result === 'win') {
                // 记录击杀到图鉴
                if (BattleSystem.enemy && BattleSystem.enemy.id) {
                    Player.recordKill(BattleSystem.enemy.id);
                }
                // 日常追踪：击杀和战斗胜利
                DailySystem.trackActivity('kill', 1);
                DailySystem.trackActivity('battle_win', 1);
                // v0.9.4: 每日统计
                if (Player.dailyStats) Player.dailyStats.battlesWon = (Player.dailyStats.battlesWon || 0) + 1;
                if (BattleSystem.rewards && BattleSystem.rewards.gold) {
                    DailySystem.trackActivity('earn_gold', BattleSystem.rewards.gold);
                }
                
                // 检查是不是车轮战
                if (this.gauntletState) {
                    // 累计奖励
                    const rewards = BattleSystem.rewards;
                    this.gauntletState.totalWins++;
                    this.gauntletState.totalExp += rewards.exp;
                    this.gauntletState.totalGold += rewards.gold;
                    if (rewards.items && rewards.items.length > 0) {
                        this.gauntletState.totalItems.push(...rewards.items);
                    }
                    
                    // 尝试下一个敌人
                    const hasNext = this.nextGauntletEnemy();
                    if (hasNext) {
                        // 还有下一个，继续战斗
                        UI.renderBattleScreen();
                        return;
                    } else {
                        // 全部打完了，车轮战胜利
                        const totalWins = this.gauntletState.totalWins;
                        const totalExp = this.gauntletState.totalExp;
                        const totalGold = this.gauntletState.totalGold;
                        const totalItems = this.gauntletState.totalItems;
                        
                        // 清空车轮战状态
                        this.gauntletState = null;
                        
                        // 显示车轮战胜利消息
                        let message = `🏆 车轮战胜利！\n\n`;
                        message += `连胜：${totalWins} 场\n\n`;
                        message += `🎁 累计奖励\n`;
                        message += `经验：+${totalExp}\n`;
                        message += `金币：+${totalGold}\n`;
                        if (totalItems.length > 0) {
                            totalItems.forEach(item => {
                                message += `${item.name}：x${item.count}\n`;
                            });
                        }
                        
                        UI.showMessage(message.trim());
                        this.state = 'map';
                        UI.renderMapScreen();
                        Player.save();
                        return;
                    }
                }
                
                // 普通战斗胜利
                const rewards = BattleSystem.rewards;
                const stats = BattleSystem.stats;
                const rating = BattleSystem.rating;
                
                // v0.9.0: 战后恢复（Chained Echoes模式）
                // 普通战斗胜利后恢复80%HP/MP，清除debuff
                // Boss战/决斗/试炼不恢复（高难度挑战）
                const battleMode = BattleSystem.battleOptions?.mode;
                const isBossBattle = battleMode === 'boss' || battleMode === 'duel' || battleMode === 'trial' 
                    || BattleSystem.enemy?.isBoss || BattleSystem.enemy?.tier === 'commander';
                let postBattleRecover = null;
                if (!isBossBattle) {
                    const hpBefore = Player.hp;
                    const mpBefore = Player.mp;
                    const targetHp = Math.floor(Player.maxHp * 0.8);
                    const targetMp = Math.floor(Player.maxMp * 0.8);
                    Player.hp = Math.max(Player.hp, targetHp);
                    Player.mp = Math.max(Player.mp, targetMp);
                    // 清除玩家负面状态
                    if (BattleSystem.player?.statusEffects) {
                        BattleSystem.player.statusEffects = BattleSystem.player.statusEffects.filter(
                            e => !['burn','freeze','frozen','stun','slow','poison','curse','paralyze','weakness','bleed','bind','blind','fear','shock','attack_down','defense_down'].includes(e.type)
                        );
                    }
                    postBattleRecover = {
                        hp: Player.hp - hpBefore,
                        mp: Player.mp - mpBefore
                    };
                }

                // v0.99.0: 体力系统已移除，低体力受伤机制暂时禁用
                // 后续版本改为：连续猎魔第4次后有概率受伤
                let fatigueResult = null;
                
                let message = '⚔️ 战斗胜利！\n\n';
                
                // 战斗评价
                if (rating) {
                    const ratingColors = { S: '🌟', A: '⭐', B: '✨', C: '👍', D: '💪' };
                    message += `${ratingColors[rating.level] || ''} 评价：${rating.level}级\n`;
                    message += `得分：${rating.score}分\n`;
                    // 评分详情
                    if (rating.details) {
                        const details = [];
                        if (rating.details.turnBonus) details.push(`回合${rating.details.turnBonus > 0 ? '+' : ''}${rating.details.turnBonus}`);
                        if (rating.details.hpBonus) details.push(`血量+${rating.details.hpBonus}`);
                        if (rating.details.itemPenalty) details.push(`道具${rating.details.itemPenalty}`);
                        if (rating.details.critBonus) details.push(`暴击+${rating.details.critBonus}`);
                        if (rating.details.interruptBonus) details.push(`打断+${rating.details.interruptBonus}`);
                        if (rating.details.noDamageBonus) details.push(`无伤+${rating.details.noDamageBonus}`);
                        if (rating.details.levelBonus) details.push(`等级差${rating.details.levelBonus > 0 ? '+' : ''}${rating.details.levelBonus}`);
                        if (details.length > 0) {
                            message += `(${details.join('，')})\n`;
                        }
                    }
                    message += '\n';
                }
                
                // 战斗统计
                message += '📊 战斗统计\n';
                message += `回合数：${BattleSystem.turn}\n`;
                message += `总伤害：${stats.totalDamageDealt || 0}\n`;
                message += `受到伤害：${stats.totalDamageTaken || 0}\n`;
                if (stats.totalHealingDone > 0) {
                    message += `治疗量：${stats.totalHealingDone}\n`;
                }
                if (stats.critCount > 0) {
                    message += `暴击次数：${stats.critCount}\n`;
                }
                if (stats.interruptCount > 0) {
                    message += `打断次数：${stats.interruptCount}\n`;
                }
                if (stats.missCount > 0) {
                    message += `闪避次数：${stats.missCount}\n`;
                }
                if (stats.skillsUsed > 0) {
                    message += `使用技能：${stats.skillsUsed}次\n`;
                }
                message += `\n`;
                
                // 奖励
                message += '🎁 奖励\n';
                message += `经验：+${rewards.exp}`;
                if (rewards.ratingBonus) message += ` (评价+${Math.floor(rewards.ratingBonus * 100)}%)`;
                message += '\n';
                message += `金币：+${rewards.gold}`;
                if (rewards.goldCrit) message += ' 💰暴击！';
                if (rewards.ratingBonus) message += ` (评价+${Math.floor(rewards.ratingBonus * 100)}%)`;
                message += '\n';
                if (rewards.items.length > 0) {
                    rewards.items.forEach(item => {
                        message += `${item.name}：x${item.count}\n`;
                    });
                }
                // v0.9.0: 战后恢复显示
                if (postBattleRecover && (postBattleRecover.hp > 0 || postBattleRecover.mp > 0)) {
                    message += `\n💚 战后恢复\n`;
                    if (postBattleRecover.hp > 0) message += `HP：+${postBattleRecover.hp}（恢复到80%）\n`;
                    if (postBattleRecover.mp > 0) message += `MP：+${postBattleRecover.mp}（恢复到80%）\n`;
                    message += `负面状态：已清除\n`;
                }
                // v0.9.1: 低体力受伤显示
                if (fatigueResult) {
                    if (fatigueResult.level === 2) {
                        message += `\n⚠️ 体力耗尽，你受了重伤！\n下一场战斗攻击-30%，防御-15%\n（休息后恢复）\n`;
                    } else {
                        message += `\n⚠️ 体力过低，你感到疲惫！\n下一场战斗攻击-15%\n（休息后恢复）\n`;
                    }
                }
                if (rewards.levelUps.length > 0) {
                    message += `\n🎉 升级了！当前等级 ${Player.level}\n`;
                    message += `获得属性点（当前可分配：${Player.attributePoints} 点）`;
                    // 天生天赋进化提示
                    if (Player._innateTalentEvolved) {
                        const talentData = typeof DataInnateTalents !== 'undefined' ? DataInnateTalents[Player.innateTalent] : null;
                        const talentName = talentData?.name || '天生天赋';
                        message += `\n✨ ${talentName} 进化到 Lv.${Player.innateTalentLevel}！效果增强！`;
                        Player._innateTalentEvolved = false;
                    }
                }
                
                UI.showMessage(message.trim());
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
                
                // v1.5.0: 检测是否有天赋分支需要选择（延迟等消息显示完）
                setTimeout(() => {
                    if (typeof Game !== 'undefined') Game.checkPendingBranchChoices();
                }, 1000);
                
            } else if (BattleSystem.result === 'lose') {
                // 检查是不是车轮战
                if (this.gauntletState) {
                    const totalWins = this.gauntletState.totalWins;
                    const totalExp = this.gauntletState.totalExp;
                    const totalGold = this.gauntletState.totalGold;
                    const totalItems = this.gauntletState.totalItems;
                    
                    // 清空车轮战状态
                    this.gauntletState = null;
                    
                    // 显示车轮战失败消息
                    let message = `💀 车轮战失败！\n\n`;
                    message += `连胜：${totalWins} 场\n\n`;
                    message += `🎁 已获得奖励\n`;
                    message += `经验：+${totalExp}\n`;
                    message += `金币：+${totalGold}\n`;
                    if (totalItems.length > 0) {
                        totalItems.forEach(item => {
                            message += `${item.name}：x${item.count}\n`;
                        });
                    }
                    
                    UI.showMessage(message.trim());
                    this.state = 'map';
                    UI.renderMapScreen();
                    Player.save();
                    return;
                }
                
                // v0.9.0: 普通战斗失败 - 轻惩罚（鼓励玩家大胆尝试）
                // 恢复50%HP/MP，不扣金币/时间，回到当前地点
                Player.hp = Math.max(1, Math.floor(Player.maxHp * 0.5));
                Player.mp = Math.floor(Player.maxMp * 0.5);
                // 清除负面状态
                if (BattleSystem.player?.statusEffects) {
                    BattleSystem.player.statusEffects = [];
                }
                UI.showMessage('💀 战斗失败！\n\n你被击败了，但没有受太重的伤。\nHP/MP恢复到50%，可以调整后再次挑战。');
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
            }
        }, 1500);
    }


// 导出模块集合
export const GameEndBattle = {
    endBattle
};

export default GameEndBattle;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameEndBattle = GameEndBattle;
}