/**
 * 战斗事件总线（Battle Event Bus）
 * 
 * 核心思想：
 * 1. 战斗中的各种事件都通过事件总线发布
 * 2. 各个系统（天赋、成就、灵魂、任务等）通过订阅事件来响应
 * 3. 系统间解耦，不直接调用
 * 
 * 标准事件类型：
 * - battleStart: 战斗开始
 * - battleEnd: 战斗结束
 * - turnStart: 回合开始
 * - turnEnd: 回合结束
 * - playerAttack: 玩家攻击
 * - enemyAttack: 敌人攻击
 * - hit: 命中
 * - crit: 暴击
 * - miss: 闪避
 * - damage: 受到伤害
 * - heal: 治疗
 * - skillCast: 技能释放
 * - skillChannel: 技能引导
 * - interrupt: 打断
 * - statusApplied: 状态施加
 * - statusRemoved: 状态移除
 * - defend: 防御
 * - flee: 逃跑
 * - summon: 召唤
 * - playerDeath: 玩家死亡
 * - enemyDeath: 敌人死亡
 * - levelUp: 升级
 * - achievement: 成就
 */

export const BattleEventBus = {
    // 事件订阅者
    subscribers: {},
    
    // 一次性事件订阅者
    onceSubscribers: {},
    
    /**
     * 订阅事件
     * @param {string} eventType - 事件类型
     * @param {Function} handler - 处理函数
     */
    on(eventType, handler) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push(handler);
    },
    
    /**
     * 订阅一次性事件（触发后自动取消）
     * @param {string} eventType - 事件类型
     * @param {Function} handler - 处理函数
     */
    once(eventType, handler) {
        if (!this.onceSubscribers[eventType]) {
            this.onceSubscribers[eventType] = [];
        }
        this.onceSubscribers[eventType].push(handler);
    },
    
    /**
     * 取消订阅
     * @param {string} eventType - 事件类型
     * @param {Function} handler - 处理函数
     */
    off(eventType, handler) {
        if (!this.subscribers[eventType]) return;
        this.subscribers[eventType] = this.subscribers[eventType].filter(h => h !== handler);
    },
    
    /**
     * 发布事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    emit(eventType, data) {
        // 普通订阅者
        if (this.subscribers[eventType]) {
            for (const handler of this.subscribers[eventType]) {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`[BattleEventBus] 事件处理出错: ${eventType}`, e);
                }
            }
        }
        
        // 一次性订阅者
        if (this.onceSubscribers[eventType]) {
            const handlers = [...this.onceSubscribers[eventType]];
            this.onceSubscribers[eventType] = [];
            for (const handler of handlers) {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`[BattleEventBus] 一次性事件处理出错: ${eventType}`, e);
                }
            }
        }
        
        // 调试日志
        if (typeof DebugSystem !== 'undefined' && DebugSystem.debugMode) {
            console.log(`[BattleEvent] ${eventType}`, data);
        }
    },
    
    /**
     * 清除所有订阅者
     */
    clear() {
        this.subscribers = {};
        this.onceSubscribers = {};
    },
    
    /**
     * 获取某个事件的订阅者数量
     * @param {string} eventType - 事件类型
     * @returns {number} 订阅者数量
     */
    getSubscriberCount(eventType) {
        const normal = this.subscribers[eventType]?.length || 0;
        const once = this.onceSubscribers[eventType]?.length || 0;
        return normal + once;
    }
};

// ==================== 事件类型常量 ====================
// 方便使用，避免拼写错误

export const BattleEvents = {
    // 战斗生命周期
    BATTLE_START: 'battleStart',
    BATTLE_END: 'battleEnd',
    TURN_START: 'turnStart',
    TURN_END: 'turnEnd',
    
    // 攻击相关
    PLAYER_ATTACK: 'playerAttack',
    ENEMY_ATTACK: 'enemyAttack',
    HIT: 'hit',
    CRIT: 'crit',
    MISS: 'miss',
    DAMAGE: 'damage',
    
    // 技能相关
    SKILL_CAST: 'skillCast',
    SKILL_CHANNEL: 'skillChannel',
    SKILL_COMPLETE: 'skillComplete',
    INTERRUPT: 'interrupt',
    
    // 状态相关
    STATUS_APPLIED: 'statusApplied',
    STATUS_REMOVED: 'statusRemoved',
    
    // 其他行动
    DEFEND: 'defend',
    HEAL: 'heal',
    FLEE: 'flee',
    SUMMON: 'summon',
    
    // 死亡
    PLAYER_DEATH: 'playerDeath',
    ENEMY_DEATH: 'enemyDeath',
    
    // 成长
    EXP_GAIN: 'expGain',
    LEVEL_UP: 'levelUp',
    
    // 成就
    ACHIEVEMENT: 'achievement',
    
    // 掉落
    DROP_ITEM: 'dropItem',
    DROP_SOUL: 'dropSoul'
};

console.log('[BattleEventBus] 战斗事件总线已加载');

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.BattleEventBus = BattleEventBus;
if (typeof window !== 'undefined') window.BattleEvents = BattleEvents;
