/**
 * 先锋小队系统
 * v3.15.0 新增
 * 管理先锋小队状态、成员行为、士气、伤亡
 */

import { VanguardTeam } from '../data/vanguard-team.js';

export const VanguardTeamSystem = {
    // 小队数据（运行时）
    team: null,
    // 是否激活
    isActive: false,

    /**
     * 初始化先锋小队
     */
    init() {
        // 深拷贝数据
        this.team = JSON.parse(JSON.stringify(VanguardTeam));
        this.isActive = false;
    },

    /**
     * 激活先锋小队（学校撤离开始时调用）
     */
    activate() {
        if (!this.team) {
            this.init();
        }
        this.isActive = true;
        this.team.teamStatus.currentPhase = 'exploring';
        console.log('[VanguardTeam] 先锋小队激活，开始探路');
    },

    /**
     * 停用先锋小队（撤离完成后调用）
     */
    deactivate() {
        this.isActive = false;
        if (this.team) {
            this.team.teamStatus.currentPhase = 'arrived';
        }
        console.log('[VanguardTeam] 先锋小队停用，撤离完成');
    },

    /**
     * 获取小队状态
     */
    getTeamStatus() {
        if (!this.team) return null;
        return this.team.teamStatus;
    },

    /**
     * 获取成员列表
     */
    getMembers() {
        if (!this.team) return [];
        return this.team.members;
    },

    /**
     * 获取存活成员
     */
    getAliveMembers() {
        return this.getMembers().filter(m => m.status === 'alive');
    },

    /**
     * 获取受伤成员
     */
    getInjuredMembers() {
        return this.getMembers().filter(m => m.status === 'injured');
    },

    /**
     * 获取牺牲成员
     */
    getDeadMembers() {
        return this.getMembers().filter(m => m.status === 'dead');
    },

    /**
     * 获取成员
     * @param {string} memberId - 成员ID
     */
    getMember(memberId) {
        return this.getMembers().find(m => m.id === memberId);
    },

    /**
     * 设置成员状态
     * @param {string} memberId - 成员ID
     * @param {string} status - 状态 (alive/injured/dead)
     * @param {string} reason - 原因
     */
    setMemberStatus(memberId, status, reason = '') {
        const member = this.getMember(memberId);
        if (!member) {
            console.warn(`[VanguardTeam] 未知成员: ${memberId}`);
            return false;
        }

        const oldStatus = member.status;
        member.status = status;

        // 更新统计
        this.updateStats();

        // 士气影响
        if (status === 'dead' && oldStatus !== 'dead') {
            this.changeMorale(this.team.moraleEffects.casualty, `${member.name}牺牲`);
        } else if (status === 'injured' && oldStatus === 'alive') {
            this.changeMorale(this.team.moraleEffects.injury, `${member.name}受伤`);
        }

        console.log(`[VanguardTeam] ${member.name} 状态变化: ${oldStatus} -> ${status} (${reason})`);
        return true;
    },

    /**
     * 成员牺牲
     * @param {string} memberId - 成员ID
     * @param {string} reason - 牺牲原因
     */
    killMember(memberId, reason = '') {
        return this.setMemberStatus(memberId, 'dead', reason);
    },

    /**
     * 成员受伤
     * @param {string} memberId - 成员ID
     * @param {string} reason - 受伤原因
     */
    injureMember(memberId, reason = '') {
        return this.setMemberStatus(memberId, 'injured', reason);
    },

    /**
     * 成员治愈
     * @param {string} memberId - 成员ID
     */
    healMember(memberId) {
        return this.setMemberStatus(memberId, 'alive', '被治愈');
    },

    /**
     * 更新统计数据
     */
    updateStats() {
        if (!this.team) return;
        const members = this.team.members;
        this.team.teamStatus.casualties = members.filter(m => m.status === 'dead').length;
        this.team.teamStatus.injuredCount = members.filter(m => m.status === 'injured').length;
    },

    /**
     * 获取士气
     */
    getMorale() {
        if (!this.team) return 100;
        return this.team.teamStatus.morale;
    },

    /**
     * 改变士气
     * @param {number} amount - 变化量（正/负）
     * @param {string} reason - 原因
     */
    changeMorale(amount, reason = '') {
        if (!this.team) return;
        const oldMorale = this.team.teamStatus.morale;
        this.team.teamStatus.morale = Math.max(0, Math.min(100, oldMorale + amount));
        console.log(`[VanguardTeam] 士气变化: ${oldMorale} -> ${this.team.teamStatus.morale} (${reason}, ${amount > 0 ? '+' : ''}${amount})`);
    },

    /**
     * 设置当前阶段
     * @param {string} phase - 阶段 (idle/exploring/battling/retreating/arrived)
     */
    setPhase(phase) {
        if (!this.team) return;
        this.team.teamStatus.currentPhase = phase;
        console.log(`[VanguardTeam] 阶段变化: ${phase}`);
    },

    /**
     * 设置当前位置
     * @param {string} locationId - 地点ID
     */
    setCurrentLocation(locationId) {
        if (!this.team) return;
        this.team.teamStatus.currentLocation = locationId;

        // 更新撤离进度
        const route = this.team.evacuationRoute;
        const index = route.findIndex(r => r.id === locationId);
        if (index >= 0) {
            this.team.teamStatus.evacuationProgress = Math.round((index / (route.length - 1)) * 100);
        }
    },

    /**
     * 获取撤离进度
     */
    getEvacuationProgress() {
        if (!this.team) return 0;
        return this.team.teamStatus.evacuationProgress;
    },

    /**
     * 获取撤离路线
     */
    getEvacuationRoute() {
        if (!this.team) return [];
        return this.team.evacuationRoute;
    },

    /**
     * 玩家帮助先锋小队
     * @param {string} helpType - 帮助类型 (combat/heal/explore)
     */
    playerHelp(helpType) {
        this.changeMorale(this.team.moraleEffects.playerHelp, `玩家帮助(${helpType})`);
    },

    /**
     * 领队鼓舞
     */
    leaderInspiration() {
        this.changeMorale(this.team.teamStatus.moraleEffects ? this.team.moraleEffects.leaderInspiration : 10, '领队鼓舞');
    },

    /**
     * 战斗胜利
     */
    battleVictory() {
        this.changeMorale(this.team.moraleEffects.battleVictory, '战斗胜利');
    },

    /**
     * 战斗失败
     */
    battleDefeat() {
        this.changeMorale(this.team.moraleEffects.battleDefeat, '战斗失败');
    },

    /**
     * 安全到达
     */
    safeArrival() {
        this.changeMorale(this.team.moraleEffects.safeArrival, '安全到达');
        this.setPhase('arrived');
    },

    /**
     * 检查小队是否全灭
     */
    isWipedOut() {
        return this.getAliveMembers().length === 0;
    },

    /**
     * 检查小队是否可以继续
     */
    canContinue() {
        if (this.isWipedOut()) return false;
        if (this.getMorale() <= 0) return false;
        return true;
    },

    /**
     * 获取小队战斗力评估
     */
    getCombatPower() {
        const alive = this.getAliveMembers();
        const morale = this.getMorale();
        // 基础战斗力 = 存活人数 * 10 * 士气系数
        return Math.round(alive.length * 10 * (morale / 100));
    },

    /**
     * 序列化为存档数据
     */
    serialize() {
        if (!this.team) return null;
        return {
            isActive: this.isActive,
            team: this.team
        };
    },

    /**
     * 从存档数据反序列化
     */
    deserialize(data) {
        if (!data) return;
        this.isActive = data.isActive || false;
        this.team = data.team || null;
    },

    /**
     * 重置先锋小队
     */
    reset() {
        this.init();
    }
};
