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
     * v0.86.4: 根据玩家已觉醒元素，随机学习一个未学的技能
     * @param {Object} options - { tier: '初阶'|'中阶', elements: ['fire','ice'] 可选，默认用玩家已觉醒的 }
     * @returns {Object|null} 学习到的技能信息，null表示没有可学技能
     */
    learnRandomSkillForPlayer(options = {}) {
        // 各系可学习技能池（初阶2级及以上）
        const skillPool = {
            fire: ['fire_rain', 'fire_burst', 'fire_burn_bone', 'fire_soul'],
            ice: ['ice_shield', 'ice_storm', 'ice_frost'],
            thunder: ['thunder_chain', 'thunder_strike', 'thunder_drive'],
            earth: ['earth_spike', 'earth_quake', 'earth_shift', 'earth_mud'],
            wind: ['wind_speed', 'wind_tornado', 'wind_barrier'],
            water: ['water_chain', 'water_wave', 'water_moist', 'water_shield'],
            light: ['light_blind', 'light_purify', 'light_shield', 'light_judgment', 'light_blessing'],
            dark: ['dark_cloak', 'dark_curse', 'dark_weakness'],
            plant: ['plant_thorn', 'plant_forest'],
            heal: ['heal_holy', 'heal_cleanse', 'heal_revive'],
            summon: ['summon_strengthen', 'summon_rage', 'summon_return']
        };

        const elements = options.elements || (Player.elements || []);
        const availableSkills = [];

        for (const elem of elements) {
            if (skillPool[elem]) {
                for (const skillId of skillPool[elem]) {
                    if (!Player.skills.includes(skillId)) {
                        const skill = SkillSystem.getSkill(skillId);
                        if (skill) {
                            availableSkills.push({ id: skillId, name: skill.name, element: elem });
                        }
                    }
                }
            }
        }

        if (availableSkills.length === 0) {
            return null;
        }

        const learned = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        Player.learnSkill(learned.id);
        return learned;
    },

    /**
     * 触发随机事件
     * @param {string} trigger - 触发类型
     * @param {number} chance - 基础概率（0-1）
     */
    triggerRandomEvent(trigger, chance = 0.1) {
        // v0.42.1修复：概率门控 - chance参数之前被忽略，导致几乎100%触发事件
        if (Math.random() > chance) return null;

        // 获取所有该触发类型的事件
        const events = DataManager.getEventsByTrigger(trigger);
        if (!events || events.length === 0) return null;

        // v0.92.0: 获取当前地点，用于地点过滤
        const currentLoc = typeof MapSystem !== 'undefined' ? MapSystem.getCurrentLocation() : null;
        const currentLocId = currentLoc?.id || '';
        const currentLocName = currentLoc?.name || '';
        const isSchool = currentLocId === 'tianlan_school' || currentLocName.includes('学校') || currentLocName.includes('高中');
        const isStreet = currentLocId === 'city_street' || currentLocName.includes('街') || currentLocName.includes('市');
        const isMountain = currentLocId === 'xuefeng_mountain' || currentLocId === 'xuefeng_deep' || currentLocName.includes('山') || currentLocName.includes('谷');

        // 过滤掉已触发的一次性事件
        const availableEvents = events.filter(e => {
            if (e.once && this._triggeredEvents.includes(e.id)) return false;
            
            // v0.92.0: 地点过滤 - 如果事件指定了地点，只能在对应地点触发
            if (e.locations && e.locations.length > 0) {
                if (!e.locations.includes(currentLocId)) return false;
            }
            
            // v0.92.0: 地点类型过滤 - school/street/mountain/general
            // 如果事件没有locationType，根据名称和描述自动分类
            let locType = e.locationType;
            if (!locType) {
                const text = (e.name || '') + (e.description || '');
                if (/同学|老师|修炼|唐月|穆宁雪|张小侯|赵满延|许昭霆|穆白|周敏|知识|技能|突破|顿悟|失败|搭话|批评|炫耀|议论|找你|问问题/.test(text)) {
                    locType = 'school';
                } else if (/钱|商人|商店|小偷|猎人|卖艺|喝醉|酒馆|打折|街头/.test(text)) {
                    locType = 'street';
                } else if (/草药|宝箱|陷阱|风景|妖魔|猎魔|稀有|深山/.test(text)) {
                    locType = 'mountain';
                } else {
                    locType = 'general';
                }
            }
            if (locType === 'school' && !isSchool) return false;
            if (locType === 'street' && !isStreet) return false;
            if (locType === 'mountain' && !isMountain) return false;
            
            // v0.92.0: 默认条件 - 没有conditions的事件根据trigger类型添加默认等级要求
            if (!e.conditions || e.conditions.length === 0) {
                const defaultMinLevel = {
                    'explore': 2, 'exploring': 2, 'travel': 3, 'training': 2,
                    'battle_victory': 3, 'level_up': 1, 'location': 1
                }[trigger] || 2;
                if ((Player.level || 1) < defaultMinLevel) return false;
            } else {
                if (!this.checkConditions(e.conditions)) return false;
            }
            
            return true;
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
            case 'elementCount': return Player.elements.length;
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

        // v0.56.0: 师徒互动计数与等级提升
        const mentorEvents = ['tang_yue_mentor_training', 'tang_yue_mentor_care', 'tang_yue_trial'];
        if (mentorEvents.includes(eventId) && Player.mentor) {
            Player.mentor.interactions = (Player.mentor.interactions || 0) + 1;
            // 检查等级提升
            const opinion = NPCStateSystem.getNPCState('tang_yue')?.opinion || 0;
            if (Player.mentor.level === 1 && Player.mentor.interactions >= 5 && opinion >= 70) {
                Player.mentor.level = 2;
                result.mentorLevelUp = 2;
            } else if (Player.mentor.level === 2 && Player.mentor.interactions >= 10 && opinion >= 90 && Player.level >= 15) {
                Player.mentor.level = 3;
                result.mentorLevelUp = 3;
            }
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

        // v0.99.0: 体力系统已移除，体力效果转为HP/MP效果
        if (effects.stamina) {
            if (effects.stamina > 0) {
                // 恢复体力 → 恢复HP+MP（好事）
                const hpRestore = Math.floor(effects.stamina * 0.5);
                const mpRestore = Math.floor(effects.stamina * 0.5);
                Player.hp = Math.min(Player.maxHp, Player.hp + hpRestore);
                Player.mp = Math.min(Player.maxMp, Player.mp + mpRestore);
                result.hp = hpRestore;
                result.mp = mpRestore;
            } else {
                // 消耗体力 → 消耗少量HP（疲惫体现为轻伤）
                const hpLoss = Math.floor(-effects.stamina * 0.3);
                Player.hp = Math.max(1, Player.hp - hpLoss);
                result.hp = -hpLoss;
            }
            // result.stamina = effects.stamina; // 移除体力结果
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

        // v0.86.4: 动态学习随机技能（根据已觉醒元素）
        if (effects.learnRandomSkill) {
            const learned = this.learnRandomSkillForPlayer(effects.learnRandomSkill);
            if (learned) {
                result.learnedSkill = learned;
            }
        }

        if (effects.awakenElement) {
            Player.awakenElement(effects.awakenElement);
            result.awakenElement = effects.awakenElement;
        }

        if (effects.setFlag) {
            const flags = Array.isArray(effects.setFlag) ? effects.setFlag : [effects.setFlag];
            for (const flag of flags) {
                Player.setFlag(flag);
            }
            result.setFlag = effects.setFlag;
            // v0.56.0: 拜师时初始化师徒关系
            if (flags.includes('tang_yue_mentor')) {
                Player.mentor = { npcId: 'tang_yue', level: 1, interactions: 0 };
            }
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

        // v0.34.0: NPC好感度变化
        if (effects.npcOpinion) {
            result.npcOpinion = {};
            for (const [npcId, value] of Object.entries(effects.npcOpinion)) {
                if (typeof NPCStateSystem !== 'undefined') {
                    NPCStateSystem.changeOpinion(npcId, value);
                    result.npcOpinion[npcId] = value;
                }
            }
        }

        return result;
    }
};
