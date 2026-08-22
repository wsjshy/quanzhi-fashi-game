/**
 * 成就事件处理器
 * 
 * 通过订阅战斗事件来触发成就检查，实现成就系统与战斗系统的解耦。
 * 
 * 设计思想：
 * 1. 成就系统不直接调用战斗系统的方法
 * 2. 成就系统订阅需要的战斗事件
 * 3. 事件触发时检查对应成就
 * 
 * 好处：
 * - 战斗系统不需要知道成就系统的存在
 * - 新增成就只需要订阅对应的事件
 * - 更容易测试和维护
 */

export const AchievementHandler = {
    // 是否已初始化
    initialized: false,
    
    /**
     * 初始化成就事件处理器
     * 订阅所有需要的战斗事件
     */
    init() {
        if (this.initialized) return;
        
        console.log('[AchievementHandler] 初始化成就事件处理器');
        
        // 订阅敌人死亡事件（击杀类成就）
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.on(BattleEvents.ENEMY_DEATH, (data) => {
                this.checkKillAchievements(data);
            });
            
            // 订阅战斗结束事件（战斗评价类成就）
            BattleEventBus.on(BattleEvents.BATTLE_END, (data) => {
                this.checkBattleEndAchievements(data);
            });
            
            // 订阅玩家攻击事件（暴击类成就）
            BattleEventBus.on(BattleEvents.PLAYER_ATTACK, (data) => {
                this.checkAttackAchievements(data);
            });
        }
        
        this.initialized = true;
        console.log('[AchievementHandler] 成就事件处理器初始化完成');
    },
    
    /**
     * 检查击杀类成就
     * @param {Object} data - 事件数据
     */
    checkKillAchievements(data) {
        try {
            if (typeof WorldState === 'undefined' || typeof DataAchievements === 'undefined') return;
            if (typeof Player === 'undefined') return;
            
            // 获取总击杀数
            const bestiaryStats = Player.getBestiaryStats();
            const totalKills = bestiaryStats.totalKills || 0;
            
            // 击杀数量成就
            const killAchievements = [
                { id: 'first_blood', value: 1 },
                { id: 'slayer_10', value: 10 },
                { id: 'slayer_100', value: 100 },
                { id: 'slayer_1000', value: 1000 },
            ];
            
            killAchievements.forEach(ach => {
                if (totalKills >= ach.value && !WorldState.hasAchievement(ach.id)) {
                    const achData = DataAchievements[ach.id];
                    if (achData) {
                        WorldState.unlockAchievement(ach.id, achData);
                    }
                }
            });
            
            // 精英怪击杀成就
            const enemy = data.enemy;
            if (enemy && (enemy.isElite || enemy.tier === 'warrior')) {
                if (!WorldState.hasAchievement('elite_killer')) {
                    const achData = DataAchievements['elite_killer'];
                    if (achData) {
                        WorldState.unlockAchievement('elite_killer', achData);
                    }
                }
            }
            
            // BOSS击杀成就（统领级）
            if (enemy && (enemy.tier === 'commander' || enemy.isBoss)) {
                if (!WorldState.hasAchievement('boss_killer')) {
                    const achData = DataAchievements['boss_killer'];
                    if (achData) {
                        WorldState.unlockAchievement('boss_killer', achData);
                    }
                }
            }
            
        } catch (e) {
            console.error('[AchievementHandler] 检查击杀成就出错:', e);
        }
    },
    
    /**
     * 检查战斗结束类成就
     * @param {Object} data - 事件数据
     */
    checkBattleEndAchievements(data) {
        try {
            if (typeof WorldState === 'undefined' || typeof DataAchievements === 'undefined') return;
            if (typeof Player === 'undefined') return;
            
            // 只检查胜利的战斗
            if (data.result !== 'win') return;
            
            const stats = data.stats || {};
            const rating = data.rating;
            
            // 毫发无伤成就（战斗中没受到伤害）
            if (stats.totalDamageTaken === 0) {
                if (!WorldState.hasAchievement('no_damage')) {
                    const achData = DataAchievements['no_damage'];
                    if (achData) {
                        WorldState.unlockAchievement('no_damage', achData);
                    }
                }
            }
            
            // S级评价成就
            if (rating && rating.rank === 'S') {
                if (!WorldState.hasAchievement('perfect_battle')) {
                    const achData = DataAchievements['perfect_battle'];
                    if (achData) {
                        WorldState.unlockAchievement('perfect_battle', achData);
                    }
                }
            }
            
        } catch (e) {
            console.error('[AchievementHandler] 检查战斗结束成就出错:', e);
        }
    },
    
    /**
     * 检查攻击类成就
     * @param {Object} data - 事件数据
     */
    checkAttackAchievements(data) {
        try {
            if (typeof WorldState === 'undefined' || typeof DataAchievements === 'undefined') return;
            if (typeof BattleSystem === 'undefined') return;
            
            // 连续暴击成就（幸运儿）
            if (data.isCrit) {
                BattleSystem.consecutiveCrits++;
                if (BattleSystem.consecutiveCrits >= 3) {
                    if (!WorldState.hasAchievement('lucky_dog')) {
                        const achData = DataAchievements['lucky_dog'];
                        if (achData) {
                            WorldState.unlockAchievement('lucky_dog', achData);
                        }
                    }
                }
            } else {
                BattleSystem.consecutiveCrits = 0;
            }
            
        } catch (e) {
            console.error('[AchievementHandler] 检查攻击成就出错:', e);
        }
    }
};

// 自动初始化（在页面加载完成后）
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AchievementHandler.init();
        });
    } else {
        // 页面已经加载完成，直接初始化
        setTimeout(() => {
            AchievementHandler.init();
        }, 100);
    }
}

console.log('[AchievementHandler] 成就事件处理器模块已加载');

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.AchievementHandler = AchievementHandler;
