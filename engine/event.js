/**
 * 事件系统
 * 管理随机事件、选项分支、条件触发
 */

const EventSystem = {
    // 事件数据缓存
    _eventData: {},

    // 已触发的一次性事件
    _triggeredEvents: [],

    /**
     * 获取事件数据
     */
    getEvent(eventId) {
        if (this._eventData[eventId]) {
            return this._eventData[eventId];
        }
        
        const event = DataManager.getEvent(eventId);
        if (event) {
            this._eventData[eventId] = event;
        }
        return event;
    },

    /**
     * 触发随机事件
     * @param {string} trigger - 触发类型
     * @param {number} chance - 基础概率（0-1）
     */
    triggerRandomEvent(trigger, chance = 0.1) {
        // 获取所有该触发类型的事件
        const events = DataManager.getEventsByTrigger(trigger);
        if (!events || events.length === 0) return null;

        // 过滤掉已触发的一次性事件
        const availableEvents = events.filter(e => {
            if (e.once && this._triggeredEvents.includes(e.id)) return false;
            return this.checkConditions(e.conditions);
        });

        if (availableEvents.length === 0) return null;

        // 计算总权重
        const totalChance = availableEvents.reduce((sum, e) => sum + (e.chance || 0.1), 0);
        
        // 随机选择
        const roll = Math.random() * totalChance;
        let cumulative = 0;
        
        for (const event of availableEvents) {
            cumulative += event.chance || 0.1;
            if (roll <= cumulative) {
                return this.triggerEvent(event.id);
            }
        }

        return null;
    },

    /**
     * 触发指定事件
     */
    triggerEvent(eventId) {
        const event = this.getEvent(eventId);
        if (!event) return null;

        // 检查条件
        if (!this.checkConditions(event.conditions)) {
            return null;
        }

        // 标记为已触发（如果是一次性事件）
        if (event.once) {
            this._triggeredEvents.push(eventId);
        }

        return event;
    },

    /**
     * 检查条件
     */
    checkConditions(conditions) {
        if (!conditions) return true;

        // 支持对象格式的条件（兼容旧数据）
        if (!Array.isArray(conditions)) {
            // 转换为数组格式
            const condArray = [];
            for (const key in conditions) {
                if (conditions.hasOwnProperty(key)) {
                    condArray.push({
                        type: key,
                        value: conditions[key],
                        operator: '=='
                    });
                }
            }
            conditions = condArray;
        }

        if (conditions.length === 0) return true;

        return conditions.every(cond => {
            const value = this.getConditionValue(cond.type, cond.value);
            const target = cond.value;
            const operator = cond.operator || '>=';

            switch (operator) {
                case '>': return value > target;
                case '<': return value < target;
                case '>=': return value >= target;
                case '<=': return value <= target;
                case '==': return value == target;
                case '!=': return value != target;
                default: return false;
            }
        });
    },

    /**
     * 获取条件值
     */
    getConditionValue(type, value) {
        switch (type) {
            case 'level': return Player.level;
            case 'day': return Player.day;
            case 'gold': return Player.gold;
            case 'item': return Inventory.getItemCount(value);
            case 'quest': return Player.isQuestComplete(value) ? 1 : 0;
            case 'flag': return Player.hasFlag(value) ? 1 : 0;
            case 'location': return Player.currentLocation === value ? 1 : 0;
            case 'element': return Player.elements.includes(value) ? 1 : 0;
            default: return 0;
        }
    },

    /**
     * 选择选项
     */
    selectChoice(eventId, choiceIndex) {
        const event = this.getEvent(eventId);
        if (!event || !event.choices || !event.choices[choiceIndex]) {
            return { success: false, message: '选项不存在' };
        }

        const choice = event.choices[choiceIndex];
        const result = {
            success: true,
            text: choice.resultText || '',
            effects: {}
        };

        // 应用效果
        if (choice.effects) {
            result.effects = this.applyEffects(choice.effects);
        }

        // 后续事件
        if (choice.nextEvent) {
            result.nextEvent = choice.nextEvent;
        }

        return result;
    },

    /**
     * 应用效果
     */
    applyEffects(effects) {
        const result = {};

        if (effects.hp) {
            if (effects.hp > 0) {
                Player.heal(effects.hp);
            } else {
                Player.takeDamage(-effects.hp);
            }
            result.hp = effects.hp;
        }

        if (effects.mp) {
            if (effects.mp > 0) {
                Player.restoreMp(effects.mp);
            } else {
                Player.useMp(-effects.mp);
            }
            result.mp = effects.mp;
        }

        if (effects.stamina) {
            if (effects.stamina > 0) {
                Player.restoreStamina(effects.stamina);
            } else {
                Player.useStamina(-effects.stamina);
            }
            result.stamina = effects.stamina;
        }

        if (effects.exp) {
            const expResult = Player.gainExp(effects.exp);
            result.exp = effects.exp;
            if (expResult.levelUps.length > 0) {
                result.levelUps = expResult.levelUps;
            }
            if (expResult.newSkills.length > 0) {
                result.newSkills = expResult.newSkills;
            }
        }

        if (effects.gold) {
            if (effects.gold > 0) {
                Player.gainGold(effects.gold);
            } else {
                Player.spendGold(-effects.gold);
            }
            result.gold = effects.gold;
        }

        if (effects.addItem) {
            Inventory.addItem(effects.addItem.itemId, effects.addItem.count || 1);
            result.addItem = effects.addItem;
        }

        if (effects.removeItem) {
            Inventory.removeItem(effects.removeItem.itemId, effects.removeItem.count || 1);
            result.removeItem = effects.removeItem;
        }

        if (effects.addSkill) {
            Player.learnSkill(effects.addSkill);
            result.addSkill = effects.addSkill;
        }

        if (effects.awakenElement) {
            Player.awakenElement(effects.awakenElement);
            result.awakenElement = effects.awakenElement;
        }

        if (effects.setFlag) {
            Player.setFlag(effects.setFlag);
            result.setFlag = effects.setFlag;
        }

        if (effects.unlockLocation) {
            Player.unlockLocation(effects.unlockLocation);
            result.unlockLocation = effects.unlockLocation;
        }

        if (effects.shopDiscount) {
            const discount = effects.shopDiscount.discount || 0.8;
            const durationDays = effects.shopDiscount.durationDays || 1;
            Player.tempShopDiscount = discount;
            Player.tempShopDiscountExpireDay = Player.day + durationDays - 1;
            result.shopDiscount = effects.shopDiscount;
        }

        if (effects.giveInfo) {
            WorldState.gainInfo(effects.giveInfo);
            result.giveInfo = effects.giveInfo;
        }

        // 战斗触发（由game.js处理实际战斗开始）
        if (effects.startBattle) {
            result.startBattle = effects.startBattle;
        }

        // 多个物品
        if (effects.items) {
            result.items = {};
            for (const [itemId, count] of Object.entries(effects.items)) {
                Inventory.addItem(itemId, count);
                result.items[itemId] = count;
            }
        }

        // 声望变化
        if (effects.reputation) {
            result.reputation = {};
            for (const [faction, value] of Object.entries(effects.reputation)) {
                WorldState.changeReputation(faction, value);
                result.reputation[faction] = value;
            }
        }

        return result;
    }
};
