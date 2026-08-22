/**
 * 游戏主流程 - 地图移动模块
 * 
 * 从game.js拆分出的独立地图移动模块
 * 包含：前往地点（travelTo）
 */

export function travelTo(locationId) {
        try {
            const result = MapSystem.travelTo(locationId);
            
            if (!result.success) {
                UI.showMessage(result.message);
                return;
            }

            // 更新任务进度（到达新地点）
            const completedQuests = QuestSystem.updateProgress('reach', locationId, 1);

            // 日常追踪：访问地点
            DailySystem.trackActivity('visit', 1, locationId);

            // v0.9.0: 首次探索奖励（鼓励玩家探索新地点）
            let firstExploreReward = null;
            if (!Player.exploredLocations.includes(locationId)) {
                Player.exploredLocations.push(locationId);
                // v0.9.6: 增加首次探索奖励
                const expReward = 80;
                const goldReward = 50;
                Player.gainExp(expReward);
                Player.gold += goldReward;
                firstExploreReward = { exp: expReward, gold: goldReward };
                // v0.9.4: 每日统计
                if (Player.dailyStats) Player.dailyStats.locationsExplored = (Player.dailyStats.locationsExplored || 0) + 1;
                // v0.9.6: 隐藏发现奖励 - 15%概率获得额外奖励
                if (Math.random() < 0.15) {
                    const hiddenExp = 50;
                    const hiddenGold = 30;
                    Player.gainExp(hiddenExp);
                    Player.gold += hiddenGold;
                    firstExploreReward.hiddenFind = { exp: hiddenExp, gold: hiddenGold };
                }
                // v0.13.0: 隐藏地点首次进入奖励 - 原本unlocked:false的地点
                const locData = DataManager.getLocation(locationId);
                if (locData && locData.unlocked === false) {
                    const hiddenLocExp = 100;
                    const hiddenLocGold = 80;
                    Player.gainExp(hiddenLocExp);
                    Player.gold += hiddenLocGold;
                    firstExploreReward.hiddenLocation = { exp: hiddenLocExp, gold: hiddenLocGold, name: locData.name };
                }
                // v0.9.8: 连续探索奖励
                Player.consecutiveExplores = (Player.consecutiveExplores || 0) + 1;
                const ce = Player.consecutiveExplores;
                if (ce === 3 || ce === 5 || ce === 10) {
                    const bonusMap = { 3: { exp: 50, gold: 30 }, 5: { exp: 100, gold: 50 }, 10: { exp: 200, gold: 100 } };
                    const bonus = bonusMap[ce];
                    Player.gainExp(bonus.exp);
                    Player.gold += bonus.gold;
                    firstExploreReward.consecutiveBonus = { count: ce, exp: bonus.exp, gold: bonus.gold };
                }
            } else {
                // v0.9.8: 非首次探索，重置连续探索计数
                Player.consecutiveExplores = 0;
            }

            // v0.9.1: 100%探索完成奖励
            let explorationCompleteReward = null;
            if (firstExploreReward && typeof MapSystem.getExplorationProgress === 'function') {
                const progress = MapSystem.getExplorationProgress();
                if (progress.isComplete && !Player.explorationComplete.includes('all_locations')) {
                    Player.explorationComplete.push('all_locations');
                    // v0.9.6: 增加100%探索奖励
                    const completeExp = 200;
                    const completeGold = 100;
                    Player.gainExp(completeExp);
                    Player.gold += completeGold;
                    explorationCompleteReward = { exp: completeExp, gold: completeGold };
                }
            }

            // 保存游戏
            Player.save();

            // 显示任务完成奖励
            if (completedQuests && completedQuests.length > 0) {
                completedQuests.forEach(q => {
                    if (q.rewards && q.rewards.length > 0) {
                        UI.showMessage(`🎉 ${q.message}\n${q.rewards.join('\n')}`);
                    }
                });
            }

            // 处理结果
            if (result.randomBattle) {
                this.startBattle(result.randomBattle.enemy);
                return;
            }

            if (result.travelEvent) {
                this.showEvent(result.travelEvent);
                return;
            }

            // v0.19.0: 玩家影响力 - 地圣泉机缘竞争（首次进入时触发）
            if (locationId === 'earth_spring' && firstExploreReward && !Player.changedStoryNodes.includes('earth_spring_opportunity')) {
                const tangYueState = NPCStateSystem.getNPCState('tang_yue');
                const tangYueTrust = tangYueState ? tangYueState.trust : 0;
                const playerLevel = Player.level;
                if (tangYueTrust >= 30 && playerLevel >= 5) {
                    this.triggerEarthSpringInfluence();
                    return;
                }
            }

            UI.renderMapScreen();
            
            // 检查强制昏睡
            let travelMsg = `来到了 ${result.location.name}`;
            if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
                travelMsg = `😴 你熬夜赶路，不知不觉昏睡了过去...\n\n（第二天醒来，体力只恢复了50%）\n\n` + travelMsg;
            }
            // v0.9.0: 首次探索奖励显示
            if (firstExploreReward) {
                travelMsg += `\n\n🗺️ 首次探索！\n经验 +${firstExploreReward.exp}\n金币 +${firstExploreReward.gold}`;
                // v0.9.6: 隐藏发现奖励显示
                if (firstExploreReward.hiddenFind) {
                    travelMsg += `\n\n✨ 意外发现！\n你在探索中发现了隐藏的宝物！\n经验 +${firstExploreReward.hiddenFind.exp}\n金币 +${firstExploreReward.hiddenFind.gold}`;
                }
                // v0.9.8: 连续探索奖励显示
                if (firstExploreReward.consecutiveBonus) {
                    travelMsg += `\n\n🔥 连续探索${firstExploreReward.consecutiveBonus.count}个新地点！\n探索达人奖励！\n经验 +${firstExploreReward.consecutiveBonus.exp}\n金币 +${firstExploreReward.consecutiveBonus.gold}`;
                }
                // v0.13.0: 隐藏地点首次进入奖励显示
                if (firstExploreReward.hiddenLocation) {
                    travelMsg += `\n\n🏞️ 发现隐藏地点：${firstExploreReward.hiddenLocation.name}！\n你发现了一个隐秘的地点！\n经验 +${firstExploreReward.hiddenLocation.exp}\n金币 +${firstExploreReward.hiddenLocation.gold}`;
                }
            }
            // v0.9.1: 100%探索完成奖励显示
            if (explorationCompleteReward) {
                travelMsg += `\n\n🏆 探索完成！\n你已探索所有已解锁地点！\n经验 +${explorationCompleteReward.exp}\n金币 +${explorationCompleteReward.gold}`;
            }
            UI.showMessage(travelMsg);
        } catch (e) {
            console.error('移动出错:', e);
            UI.showMessage('移动失败：' + e.message);
        }
    }


// 导出模块集合
export const GameTravel = {
    travelTo
};

export default GameTravel;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameTravel = GameTravel;
}