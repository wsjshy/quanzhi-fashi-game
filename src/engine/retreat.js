/**
 * v3.11.0: 闭关修炼系统
 * 长周期修炼行为，高风险高回报，可能触发顿悟/走火入魔等特殊事件
 */

export const RetreatSystem = {
    // 闭关时长配置
    DURATION_CONFIG: {
        1: { days: 1, name: '1天', expMultiplier: 2, cultMultiplier: 2, eventChance: 0.05, backfireChance: 0.02 },
        3: { days: 3, name: '3天', expMultiplier: 3, cultMultiplier: 3, eventChance: 0.10, backfireChance: 0.05 },
        7: { days: 7, name: '7天', expMultiplier: 5, cultMultiplier: 5, eventChance: 0.15, backfireChance: 0.08 },
        30: { days: 30, name: '30天', expMultiplier: 10, cultMultiplier: 10, eventChance: 0.25, backfireChance: 0.15 }
    },

    // 闭关地点加成
    LOCATION_BONUS: {
        school_training_room: { name: '学校修炼室', cultBonus: 0.10, expBonus: 0.10, backfireReduce: 0.02 },
        home: { name: '家里', cultBonus: 0.05, expBonus: 0.05, backfireReduce: 0.01 },
        hunter_alliance: { name: '猎者联盟静修室', cultBonus: 0.20, expBonus: 0.15, backfireReduce: 0.03 },
        spirit_ground: { name: '灵地', cultBonus: 0.50, expBonus: 0.30, backfireReduce: -0.05 }
    },

    // 当前闭关状态
    currentRetreat: null,

    /**
     * 计算闭关预计收益
     */
    calculateRetreatReward(durationDays, locationId) {
        const config = this.DURATION_CONFIG[durationDays];
        if (!config) return null;

        const location = this.LOCATION_BONUS[locationId] || this.LOCATION_BONUS.home;

        // 基础每小时修炼收益（估算）
        const baseExpPerHour = 10 + Player.level * 2;
        const baseCultPerHour = 5 + Player.level;

        // 总小时数
        const totalHours = config.days * 24;

        // 计算收益
        let expGain = Math.floor(baseExpPerHour * totalHours * config.expMultiplier * (1 + location.expBonus));
        let cultGain = Math.floor(baseCultPerHour * totalHours * config.cultMultiplier * (1 + location.cultBonus));

        // 走火入魔概率
        const backfireChance = Math.max(0, config.backfireChance - location.backfireReduce);

        return {
            expGain: expGain,
            cultGain: cultGain,
            expRange: `${Math.floor(expGain * 0.8)} ~ ${Math.floor(expGain * 1.2)}`,
            cultRange: `${Math.floor(cultGain * 0.8)} ~ ${Math.floor(cultGain * 1.2)}`,
            eventChance: config.eventChance,
            backfireChance: backfireChance,
            locationBonus: location
        };
    },

    /**
     * 开始闭关
     */
    startRetreat(durationDays, locationId) {
        const config = this.DURATION_CONFIG[durationDays];
        if (!config) return { success: false, message: '无效的闭关时长' };

        const location = this.LOCATION_BONUS[locationId] || this.LOCATION_BONUS.home;

        this.currentRetreat = {
            durationDays: durationDays,
            daysRemaining: config.days,
            locationId: locationId,
            locationName: location.name,
            startTime: Player.day,
            events: []
        };

        return {
            success: true,
            message: `开始在${location.name}闭关${config.name}`,
            retreat: this.currentRetreat
        };
    },

    /**
     * 推进闭关（每次调用推进1天）
     */
    advanceRetreatDay() {
        if (!this.currentRetreat) return { success: false, message: '没有进行中的闭关' };

        this.currentRetreat.daysRemaining--;

        // 每天有小概率触发事件
        const config = this.DURATION_CONFIG[this.currentRetreat.durationDays];
        const dailyEventChance = config.eventChance / config.days;

        if (Math.random() < dailyEventChance) {
            const event = this._triggerRandomEvent();
            this.currentRetreat.events.push(event);
            return { dayAdvanced: true, event: event, retreat: this.currentRetreat };
        }

        return { dayAdvanced: true, event: null, retreat: this.currentRetreat };
    },

    /**
     * 触发随机事件
     */
    _triggerRandomEvent() {
        const rand = Math.random();

        if (rand < 0.40) {
            // 顿悟
            return {
                type: 'insight',
                name: '顿悟',
                message: '闭关期间灵光一闪，对魔法的理解更深了一层！',
                expBonus: 0.50,
                cultBonus: 0.50,
                buff: { name: '心境通明', type: 'cultivation', value: 0.30, duration: 3 }
            };
        } else if (rand < 0.70) {
            // 灵感涌现
            return {
                type: 'inspiration',
                name: '灵感涌现',
                message: '闭关时灵感迸发，对某系魔法有了新的感悟！',
                expBonus: 0.20,
                cultBonus: 0.10,
                skillBonus: true
            };
        } else if (rand < 0.95) {
            // 平静修炼
            return {
                type: 'peaceful',
                name: '心流状态',
                message: '闭关中心无旁骛，进入了高效修炼状态。',
                expBonus: 0.10,
                cultBonus: 0.10
            };
        } else {
            // 突破契机（稀有）
            return {
                type: 'breakthrough',
                name: '突破契机',
                message: '闭关期间水到渠成，感觉到了突破的契机！',
                expBonus: 1.00,
                cultBonus: 0.50,
                breakthrough: true
            };
        }
    },

    /**
     * 检查是否走火入魔
     */
    checkBackfire() {
        if (!this.currentRetreat) return false;

        const config = this.DURATION_CONFIG[this.currentRetreat.durationDays];
        const location = this.LOCATION_BONUS[this.currentRetreat.locationId] || this.LOCATION_BONUS.home;
        const backfireChance = Math.max(0, config.backfireChance - location.backfireReduce);

        return Math.random() < backfireChance;
    },

    /**
     * 结束闭关并结算
     */
    endRetreat(earlyExit = false) {
        if (!this.currentRetreat) return { success: false, message: '没有进行中的闭关' };

        const retreat = this.currentRetreat;
        const config = this.DURATION_CONFIG[retreat.durationDays];
        const location = this.LOCATION_BONUS[retreat.locationId] || this.LOCATION_BONUS.home;

        // 实际闭关天数
        const actualDays = config.days - retreat.daysRemaining;
        const dayRatio = earlyExit ? (actualDays / config.days) * 0.7 : 1; // 提前出关收益打折

        // 基础收益
        const baseExpPerHour = 10 + Player.level * 2;
        const baseCultPerHour = 5 + Player.level;
        const totalHours = actualDays * 24;

        let expGain = Math.floor(baseExpPerHour * totalHours * config.expMultiplier * (1 + location.expBonus) * dayRatio);
        let cultGain = Math.floor(baseCultPerHour * totalHours * config.cultMultiplier * (1 + location.cultBonus) * dayRatio);

        // 应用事件加成
        let eventExpBonus = 0;
        let eventCultBonus = 0;
        const triggeredEvents = [];

        for (const event of retreat.events) {
            eventExpBonus += event.expBonus || 0;
            eventCultBonus += event.cultBonus || 0;
            triggeredEvents.push(event);
        }

        expGain = Math.floor(expGain * (1 + eventExpBonus));
        cultGain = Math.floor(cultGain * (1 + eventCultBonus));

        // 检查走火入魔（提前出关不会走火入魔）
        let backfire = false;
        if (!earlyExit) {
            backfire = this.checkBackfire();
            if (backfire) {
                expGain = Math.floor(expGain * 0.7);
                cultGain = Math.floor(cultGain * 0.7);
            }
        }

        // 应用收益
        Player.gainExp(expGain);
        Player.cultivation = (Player.cultivation || 0) + cultGain;

        // 应用事件buff
        const buffsApplied = [];
        for (const event of retreat.events) {
            if (event.buff) {
                Player.cultivationBuff = {
                    name: event.buff.name,
                    expBonus: event.buff.value,
                    duration: event.buff.duration,
                    startDay: Player.day
                };
                buffsApplied.push(event.buff.name);
            }
        }

        // 走火入魔debuff
        if (backfire) {
            Player.cultivationBuff = {
                name: '心魔缠身',
                expBonus: -0.20,
                duration: 2,
                startDay: Player.day
            };
            buffsApplied.push('心魔缠身');
        }

        // 推进游戏时间
        Player.day += actualDays;

        const result = {
            success: true,
            days: actualDays,
            totalDays: config.days,
            earlyExit: earlyExit,
            expGain: expGain,
            cultGain: cultGain,
            backfire: backfire,
            events: triggeredEvents,
            buffs: buffsApplied,
            leveledUp: Player.level,
            locationName: location.name
        };

        this.currentRetreat = null;
        return result;
    },

    /**
     * 提前出关
     */
    exitEarly() {
        return this.endRetreat(true);
    },

    /**
     * 获取当前闭关状态
     */
    getCurrentRetreat() {
        return this.currentRetreat;
    },

    /**
     * 获取可用闭关地点
     */
    getAvailableLocations() {
        const locations = [];
        // 学校修炼室（默认解锁）
        locations.push({ id: 'school_training_room', ...this.LOCATION_BONUS.school_training_room, unlocked: true });
        // 家里（默认解锁）
        locations.push({ id: 'home', ...this.LOCATION_BONUS.home, unlocked: true });
        // 猎者联盟（需要加入猎者联盟）
        locations.push({ id: 'hunter_alliance', ...this.LOCATION_BONUS.hunter_alliance, unlocked: Player.hunterLicense || false });
        // 灵地（需要特定条件，暂未解锁）
        locations.push({ id: 'spirit_ground', ...this.LOCATION_BONUS.spirit_ground, unlocked: false, lockReason: '需要发现灵地' });

        return locations;
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.RetreatSystem = RetreatSystem;
