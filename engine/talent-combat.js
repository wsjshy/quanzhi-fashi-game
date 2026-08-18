/**
 * 天赋战斗状态系统
 * v2.2.0: 统一管理天赋相关的战斗状态（资源/状态/形态/触发）
 *
 * 机制类型：
 * - 资源积累型：燃点(火)、电荷(雷)、契约(召唤)、岩力(土)
 * - 状态叠加型：寒意(冰)、诅咒(暗)、生长(植物)
 * - 形态切换型：潮汐(水)、圣盾(光)
 * - 条件触发型：疾风(风)
 * - 纯被动型：治愈光环
 */

const TalentCombatSystem = {
    // 战斗状态存储
    state: null,

    /**
     * 初始化战斗状态
     * @param {Object} player - 玩家数据
     */
    init(player) {
        this.state = {
            // 资源型
            fireEnergy: 0,      // 燃点
            thunderEnergy: 0,   // 电荷
            summonEnergy: 0,    // 契约
            earthEnergy: 0,     // 岩力

            // 状态型（目标身上的层数，存储在enemy上）
            // 这里存储玩家施加的状态追踪

            // 形态型
            waterForm: 'tide',      // 潮汐形态：tide涨潮/ebb退潮
            lightForm: 'holy',      // 圣盾形态：holy圣光/shield圣盾
            waterFormCounter: 0,    // 潮汐形态计数器

            // 条件触发型
            windStreak: false,      // 疾风状态（闪避后触发）
            windStreakTurns: 0,     // 疾风状态剩余回合

            // 主动技能冷却
            skillCooldowns: {},     // 天赋主动技能冷却 {skillId: remainingTurns}

            // 通用
            turnCount: 0,
        };

        // 根据玩家天赋初始化形态
        if (player.talents) {
            // 水系天赋初始为涨潮
            // 光系天赋初始为圣光形态
        }

        console.log('[TalentCombat] 战斗状态初始化完成');
    },

    /**
     * 回合开始处理（形态切换、冷却减少等）
     */
    onTurnStart() {
        if (!this.state) return;
        this.state.turnCount++;

        // 水系潮汐形态自动切换（每2回合切换）
        if (this.state.turnCount % 2 === 0) {
            this.state.waterForm = this.state.waterForm === 'tide' ? 'ebb' : 'tide';
            console.log(`[TalentCombat] 潮汐形态切换为: ${this.state.waterForm === 'tide' ? '涨潮' : '退潮'}`);
        }

        // 减少主动技能冷却
        for (const skillId in this.state.skillCooldowns) {
            if (this.state.skillCooldowns[skillId] > 0) {
                this.state.skillCooldowns[skillId]--;
            }
        }

        // 疾风状态回合减少
        if (this.state.windStreakTurns > 0) {
            this.state.windStreakTurns--;
            if (this.state.windStreakTurns === 0) {
                this.state.windStreak = false;
            }
        }
    },

    // ================================================================
    // 资源积累型
    // ================================================================

    /**
     * 增加资源
     * @param {string} type - 资源类型 fire/thunder/summon/earth
     * @param {number} amount - 数量
     * @param {number} max - 上限
     * @returns {boolean} 是否达到上限触发
     */
    addEnergy(type, amount, max) {
        if (!this.state) return false;
        const key = type + 'Energy';
        this.state[key] = Math.min(max, this.state[key] + amount);
        const reachedMax = this.state[key] >= max;
        console.log(`[TalentCombat] ${type}资源 +${amount} = ${this.state[key]}/${max}${reachedMax ? ' (满!)' : ''}`);
        return reachedMax;
    },

    /**
     * 消耗资源
     * @param {string} type - 资源类型
     * @param {number} amount - 消耗数量
     * @returns {boolean} 是否消耗成功
     */
    consumeEnergy(type, amount) {
        if (!this.state) return false;
        const key = type + 'Energy';
        if (this.state[key] < amount) return false;
        this.state[key] -= amount;
        console.log(`[TalentCombat] ${type}资源 -${amount} = ${this.state[key]}`);
        return true;
    },

    /**
     * 获取当前资源量
     */
    getEnergy(type) {
        if (!this.state) return 0;
        return this.state[type + 'Energy'] || 0;
    },

    /**
     * 重置资源
     */
    resetEnergy(type) {
        if (!this.state) return;
        this.state[type + 'Energy'] = 0;
    },

    // ================================================================
    // 形态切换型
    // ================================================================

    /**
     * 获取水系潮汐形态
     * @returns {string} tide涨潮 / ebb退潮
     */
    getWaterForm() {
        return this.state ? this.state.waterForm : 'tide';
    },

    /**
     * 切换光系形态（手动）
     * @param {string} form - holy圣光 / shield圣盾
     */
    setLightForm(form) {
        if (!this.state) return;
        if (form === 'holy' || form === 'shield') {
            this.state.lightForm = form;
            console.log(`[TalentCombat] 光系形态切换为: ${form === 'holy' ? '圣光' : '圣盾'}`);
        }
    },

    /**
     * 获取光系形态
     */
    getLightForm() {
        return this.state ? this.state.lightForm : 'holy';
    },

    // ================================================================
    // 条件触发型
    // ================================================================

    /**
     * 触发疾风状态（闪避后）
     * @param {number} turns - 持续回合
     */
    triggerWindStreak(turns = 1) {
        if (!this.state) return;
        this.state.windStreak = true;
        this.state.windStreakTurns = turns;
        console.log(`[TalentCombat] 疾风状态触发，持续${turns}回合`);
    },

    /**
     * 是否有疾风状态
     */
    hasWindStreak() {
        return this.state ? this.state.windStreak : false;
    },

    /**
     * 消耗疾风状态（使用后消失）
     */
    consumeWindStreak() {
        if (!this.state) return false;
        if (this.state.windStreak) {
            this.state.windStreak = false;
            this.state.windStreakTurns = 0;
            return true;
        }
        return false;
    },

    // ================================================================
    // 主动技能系统
    // ================================================================

    /**
     * 检查天赋主动技能是否可用
     * @param {string} skillId - 技能ID
     * @returns {boolean}
     */
    canUseActiveSkill(skillId) {
        if (!this.state) return false;
        const cd = this.state.skillCooldowns[skillId] || 0;
        return cd === 0;
    },

    /**
     * 使用天赋主动技能（设置冷却）
     * @param {string} skillId - 技能ID
     * @param {number} cooldown - 冷却回合
     */
    useActiveSkill(skillId, cooldown = 2) {
        if (!this.state) return;
        this.state.skillCooldowns[skillId] = cooldown;
        console.log(`[TalentCombat] 主动技能 ${skillId} 使用，冷却${cooldown}回合`);
    },

    /**
     * 获取技能剩余冷却
     */
    getSkillCooldown(skillId) {
        return this.state ? (this.state.skillCooldowns[skillId] || 0) : 0;
    },

    // ================================================================
    // 状态获取（用于UI显示）
    // ================================================================

    /**
     * 获取所有天赋状态（用于UI渲染）
     */
    getStateForUI() {
        if (!this.state) return {};
        return {
            resources: {
                fire: this.state.fireEnergy,
                thunder: this.state.thunderEnergy,
                summon: this.state.summonEnergy,
                earth: this.state.earthEnergy,
            },
            forms: {
                water: this.state.waterForm,
                light: this.state.lightForm,
            },
            triggers: {
                windStreak: this.state.windStreak,
                windStreakTurns: this.state.windStreakTurns,
            },
            cooldowns: { ...this.state.skillCooldowns },
        };
    },

    /**
     * 清理战斗状态
     */
    cleanup() {
        this.state = null;
        console.log('[TalentCombat] 战斗状态已清理');
    }
};

// 浏览器环境下挂载到window
if (typeof window !== 'undefined') {
    window.TalentCombatSystem = TalentCombatSystem;
}

// Node环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TalentCombatSystem;
}
