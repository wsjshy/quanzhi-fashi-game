/**
 * 遭遇系统（Encounter System）
 * 处理随机遭遇、特殊事件触发、事件追踪
 * v0.8.28 新增
 */

export const EncounterSystem = {
    // 已通知过的事件（避免重复弹窗）
    _notifiedEvents: {},

    /**
     * 触发随机遭遇
     * 根据当前地点、等级、时间随机选择事件
     */
    triggerRandomEncounter() {
        if (typeof Player === 'undefined' || !Player.currentLocation) return;

        const location = typeof DataManager !== 'undefined' ? DataManager.getLocation(Player.currentLocation) : null;
        const locationId = Player.currentLocation;

        // 根据地点确定可能的遭遇池
        const encounterPool = this._getEncounterPool(locationId);
        if (encounterPool.length === 0) return;

        // 随机选择一个遭遇
        const encounter = encounterPool[Math.floor(Math.random() * encounterPool.length)];

        // 执行遭遇
        this._executeEncounter(encounter);
    },

    /**
     * 获取当前地点的遭遇池
     */
    _getEncounterPool(locationId) {
        const pool = [];

        // 通用遭遇（所有地点）
        pool.push(
            { type: 'exp', amount: 5 + Math.floor(Math.random() * 10), message: '你在路上捡到了一本修炼笔记，获得了一些经验！' },
            { type: 'gold', amount: 10 + Math.floor(Math.random() * 20), message: '你在路上捡到了一些金币！' },
            { type: 'hp', amount: -5, message: '你走了很远的路，感觉有些疲惫，损失了少量HP。' }
        );

        // 学校地点遭遇
        if (locationId === 'tianlan_school' || locationId === 'school_dorm') {
            pool.push(
                { type: 'exp', amount: 15, message: '你在学校遇到了一位学长，他指点了你几句，获得经验！' },
                { type: 'battle', enemyId: 'mage_student', message: '一个不服气的同学向你发起了挑战！' }
            );
        }

        // 城市街道遭遇
        if (locationId === 'city_street') {
            pool.push(
                { type: 'gold', amount: 20, message: '你帮一位老人搬东西，他给了你一些报酬。' },
                { type: 'battle', enemyId: 'thug', message: '一个小混混拦住了你，想要找麻烦！' }
            );
        }

        return pool;
    },

    /**
     * 执行遭遇
     */
    _executeEncounter(encounter) {
        if (!encounter) return;

        switch (encounter.type) {
            case 'exp':
                if (typeof Player !== 'undefined') {
                    Player.gainExp(encounter.amount, Player.elements?.[0]);
                }
                if (typeof UI !== 'undefined') {
                    UI.showMessage(`🎲 随机遭遇\n\n${encounter.message}\n获得 ${encounter.amount} 经验`);
                }
                break;
            case 'gold':
                if (typeof Player !== 'undefined') {
                    Player.gold += encounter.amount;
                }
                if (typeof UI !== 'undefined') {
                    UI.showMessage(`🎲 随机遭遇\n\n${encounter.message}\n获得 ${encounter.amount} 金币`);
                }
                break;
            case 'hp':
                // v0.99.0: 原stamina类型改为hp类型（体力系统已移除）
                if (typeof Player !== 'undefined') {
                    Player.hp = Math.max(1, Player.hp + encounter.amount);
                }
                if (typeof UI !== 'undefined') {
                    UI.showMessage(`🎲 随机遭遇\n\n${encounter.message}`);
                }
                break;
            case 'battle':
                if (typeof UI !== 'undefined') {
                    UI.showMessage(`🎲 随机遭遇\n\n${encounter.message}`);
                }
                if (typeof Game !== 'undefined' && typeof BattleSystem !== 'undefined') {
                    setTimeout(() => {
                        Game.startBattle(encounter.enemyId, { mode: 'random' });
                    }, 1000);
                }
                break;
        }
    },

    /**
     * 检查可用的特殊事件
     * 返回满足条件但未完成的事件列表
     */
    getAvailableSpecialEvents() {
        const events = [];

        // 穆白挑战：等级>=5，在学校，未完成
        if (typeof Player !== 'undefined' && Player.level >= 5 &&
            Player.currentLocation === 'tianlan_school' &&
            !Player.flags['mubai_challenge_completed']) {
            events.push({
                id: 'mubai_challenge',
                name: '穆白的挑战',
                description: '穆氏家族天才穆白向你发起了挑战，是否接受？',
                icon: '❄️',
                trigger: () => {
                    if (typeof Game !== 'undefined' && typeof DataManager !== 'undefined') {
                        const enemy = DataManager.getEnemy('mu_bai_duel');
                        if (enemy) {
                            Game.startBattle(enemy, () => {
                                if (BattleSystem.result === 'win') {
                                    Player.flags['mubai_challenge_completed'] = true;
                                    Player.gainExp(100, Player.elements ? [Player.elements[0]] : []);
                                    Player.gold += 50;
                                    WorldState.changeReputation('school', 10);
                                }
                            }, {
                                mode: 'duel',
                                canUseItems: false,
                                canFlee: false,
                                winHpPercent: 0.2,
                                isFriendly: true
                            });
                        }
                    }
                }
            });
        }

        // 新生试炼：等级>=3，未完成，且在学校
        if (typeof Player !== 'undefined' && Player.level >= 3 &&
            !Player.flags['freshman_trial_completed'] &&
            typeof MapSystem !== 'undefined' && MapSystem.getCurrentLocation()?.id === 'tianlan_school') {
            events.push({
                id: 'freshman_trial',
                name: '新生试炼',
                description: '学校组织新生试炼，击败训练傀儡即可完成。',
                icon: '🎯',
                trigger: () => {
                    if (typeof Game !== 'undefined' && typeof DataManager !== 'undefined') {
                        const enemy = DataManager.getEnemy('training_dummy');
                        if (enemy) {
                            Game.startBattle(enemy, () => {
                                if (BattleSystem.result === 'win') {
                                    Player.flags['freshman_trial_completed'] = true;
                                    Player.gainExp(50, Player.elements ? [Player.elements[0]] : []);
                                    Player.gold += 30;
                                }
                            }, {
                                mode: 'trial',
                                isFriendly: true
                            });
                        }
                    }
                }
            });
        }

        return events;
    },

    /**
     * 检查并通知新可用的特殊事件
     * 在地图渲染时调用
     */
    checkAndNotifyEvents() {
        const available = this.getAvailableSpecialEvents();
        const newEvents = available.filter(e => !this._notifiedEvents[e.id]);

        if (newEvents.length > 0 && typeof UI !== 'undefined') {
            newEvents.forEach(e => {
                this._notifiedEvents[e.id] = true;
            });
            const eventNames = newEvents.map(e => `${e.icon} ${e.name}`).join('\n');
            UI.showMessage(`📜 新事件可用！\n\n${eventNames}\n\n点击地图上的"📜 事件"按钮查看详情`);
        }
    },

    /**
     * 显示事件追踪面板
     */
    showEventTracker() {
        const available = this.getAvailableSpecialEvents();

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #ffd700;
            border-radius: 15px;
            padding: 30px;
            min-width: 400px;
            max-width: 500px;
            z-index: 1000;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
        `;

        let eventsHtml = '';
        if (available.length === 0) {
            eventsHtml = '<div style="color: #888; text-align: center; padding: 20px;">暂无可触发的特殊事件\n继续修炼提升等级吧！</div>';
        } else {
            eventsHtml = available.map((e, i) => `
                <div style="padding: 15px; margin-bottom: 10px; background: rgba(40, 40, 80, 0.6); border: 1px solid #555; border-radius: 8px;">
                    <div style="font-size: 18px; font-weight: bold; color: #ffd700; margin-bottom: 5px;">
                        ${e.icon} ${e.name}
                    </div>
                    <div style="color: #ccc; font-size: 13px; margin-bottom: 10px;">${e.description}</div>
                    <button data-event-index="${i}" class="event-trigger-btn" style="
                        padding: 8px 20px;
                        background: linear-gradient(135deg, #aa6600, #cc8800);
                        border: 1px solid #ffd700;
                        border-radius: 6px;
                        color: #fff;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">立即触发</button>
                </div>
            `).join('');
        }

        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 20px; font-weight: bold; text-align: center;">
                📜 事件追踪
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${eventsHtml}
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    padding: 8px 25px;
                    background: #444477;
                    border: 1px solid #666699;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    font-size: 14px;
                ">关闭</button>
            </div>
        `;

        document.body.appendChild(dialog);

        // 绑定触发按钮
        const self = this;
        dialog.querySelectorAll('.event-trigger-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-event-index'));
                const event = available[index];
                if (event) {
                    dialog.remove();
                    event.trigger();
                }
            });
        });
    },

    /**
     * 根据事件ID触发特殊事件
     * 供事件与情报面板调用
     */
    triggerSpecialEvent(eventId) {
        const available = this.getAvailableSpecialEvents();
        const event = available.find(e => e.id === eventId);
        if (event && typeof event.trigger === 'function') {
            event.trigger();
        }
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.EncounterSystem = EncounterSystem;
