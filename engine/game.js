/**
 * 游戏主控制器
 * 管理游戏状态、界面切换、主循环
 */

const Game = {
    // 游戏状态
    state: 'title',  // title / character_create / map / battle / shop / inventory / quest / event
    
    // 当前事件
    currentEvent: null,
    currentEventChoices: null,

    // 初始化
    init() {
        // 初始化数据
        DataManager.init();
        
        // 初始化背包
        Inventory.init();
        
        // 初始化世界状态
        WorldState.init();
        
        // 初始化 NPC 状态
        NPCStateSystem.init();
        
        // 初始化对话树
        DialogueTree.init();
        
        // 检查存档
        if (Player.hasSave()) {
            // 有存档，显示继续游戏按钮
        }
        
        // 显示标题界面
        this.showTitleScreen();
    },

    // ========== 标题界面 ==========
    showTitleScreen() {
        this.state = 'title';
        UI.renderTitleScreen(Player.hasSave());
    },

    // 开始新游戏
    startNewGame() {
        // 显示角色创建界面
        this.state = 'character_create';
        UI.renderCharacterCreate();
    },

    // 继续游戏
    continueGame() {
        if (Player.load()) {
            Inventory.loadSaveData(Player.saveData?.inventory || []);
            WorldState.loadSaveData(Player.saveData?.worldState || null);
            NPCStateSystem.loadSaveData(Player.saveData?.npcStates || null);
            MapSystem.init();
            this.state = 'map';
            UI.renderMapScreen();
        }
    },

    // 创建角色
    createCharacter(name, element) {
        Player.init(name, element);
        
        // 给初始物品
        Inventory.addItem('health_potion', 5);
        Inventory.addItem('mana_potion', 3);
        
        // 初始化地图
        MapSystem.init();
        
        // 自动接取新手引导任务
        QuestSystem.acceptQuest('quest_intro');
        
        // 保存游戏
        Player.save();
        
        // 进入地图界面
        this.state = 'map';
        UI.renderMapScreen();
        
        // 显示欢迎消息和新手引导
        UI.showMessage(`欢迎来到全职法师的世界，${name}！\n你觉醒了${SkillSystem.getElementName(element)}，开始你的冒险吧！\n\n【新手引导】已自动接取任务「初识魔法」，去修炼场感受魔法的力量吧！`);
    },

    // ========== 地图界面 ==========
    showMapScreen() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // 执行地点行动
    performAction(actionId) {
        try {
        // 检查逃课惩罚（有课时不上课）
        const location = DataManager.getLocation(Player.currentLocation);
        const currentClass = TimeSystem.getCurrentClass(location);
        const action = location?.actions?.find(a => a.id === actionId);
        
        if (currentClass && action && !action.isClassAction && actionId !== 'sleep' && actionId !== 'rest') {
            // 有课但选择其他行动，逃课惩罚
            if (!Player.flags['skipped_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()]) {
                Player.flags['skipped_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()] = true;
                WorldState.changeReputation('school', -5);
                UI.showMessage(`⚠️ 你逃课了！班级声望 -5\n（当前有${currentClass.name}，老师${DataManager.getCharacter(currentClass.teacher)?.name || '未知'}）`);
            }
        }

        const result = MapSystem.performAction(actionId);
        
        if (!result.success) {
            UI.showMessage(result.message);
            return;
        }

        // 如果是上课行动，根据课程表动态调整奖励
        if (action && action.isClassAction && currentClass) {
            result.effects = result.effects || {};
            result.effects.exp = currentClass.exp || result.effects.exp;
            if (currentClass.mpCost) result.effects.mp = -currentClass.mpCost;
            if (currentClass.hpCost) result.effects.hp = -(currentClass.hpCost);
            
            // 实践课有受伤概率
            if (currentClass.injuryChance && Math.random() < currentClass.injuryChance) {
                const injury = Math.floor(Player.maxHp * 0.2);
                Player.hp = Math.max(1, Player.hp - injury);
                result.effects.hp = (result.effects.hp || 0) - injury;
                UI.showMessage(`💥 实践课上不小心受伤了，损失 ${injury} HP！`);
            }
            
            // 标记已上课
            Player.flags['attended_class_' + Player.day + '_' + TimeSystem.getCurrentPeriod()] = true;
        }

        // 更新任务进度（在当前地点执行行动，视为到达该地点）
        const completedQuests = QuestSystem.updateProgress('reach', Player.currentLocation, 1);
        
        // 保存游戏
        Player.save();
        
        // 先刷新界面，确保数据更新
        UI.renderMapScreen();
        
        // 显示任务完成奖励
        if (completedQuests && completedQuests.length > 0) {
            completedQuests.forEach(q => {
                if (q.rewards && q.rewards.length > 0) {
                    UI.showMessage(`🎉 ${q.message}\n${q.rewards.join('\n')}`);
                }
            });
        }
        
        // 显示效果消息
        let message = '';
        if (result.effects) {
            if (result.effects.exp) message += `获得 ${result.effects.exp} 经验\n`;
            if (result.effects.hp) message += result.effects.hp > 0 ? `恢复 ${result.effects.hp} HP\n` : `损失 ${-result.effects.hp} HP\n`;
            if (result.effects.mp) message += result.effects.mp > 0 ? `恢复 ${result.effects.mp} MP\n` : `损失 ${-result.effects.mp} MP\n`;
            if (result.effects.stamina) message += result.effects.stamina > 0 ? `恢复 ${result.effects.stamina} 体力\n` : `消耗 ${-result.effects.stamina} 体力\n`;
            if (result.effects.levelUps) message += `升级了！当前等级 ${Player.level}\n`;
        }
        
        if (message) {
            UI.showMessage(message.trim());
        }

        // 处理结果
        if (result.battle) {
            // 触发战斗
            this.startBattle(result.battle.enemy);
            return;
        }

        if (result.event) {
            // 触发事件
            this.showEvent(result.event);
            return;
        }

        if (result.shop) {
            // 打开商店
            this.openShop();
            return;
        }

        if (result.npcs !== undefined) {
            // 显示 NPC 列表，选择对话对象
            if (result.npcs.length === 0 && (result.unavailableNpcs || []).length === 0) {
                UI.showMessage('这里现在没有人...');
                return;
            }
            this.showNPCList(result.npcs, result.unavailableNpcs || []);
            return;
        }

        // 检查是否有大事件
        const scheduledEvent = TimeSystem.getPendingEvent();
        if (scheduledEvent) {
            TimeSystem.clearPendingEvent();
            this.showScheduledEvent(scheduledEvent);
            return;
        }
        
        // 检查地点解锁
        const newlyUnlocked = MapSystem.checkLocationUnlocks();
        if (newlyUnlocked.length > 0) {
            const names = newlyUnlocked.map(loc => loc.name).join('、');
            UI.showMessage(`🎉 解锁新地点：${names}！`);
            // 再次刷新界面
            UI.renderMapScreen();
        }
        } catch (e) {
            console.error('行动出错:', e);
            const debugDiv = document.getElementById('debug-error');
            if (debugDiv) {
                debugDiv.style.display = 'block';
                debugDiv.textContent = '行动错误: ' + e.message + '\n堆栈: ' + e.stack;
            }
            UI.showMessage('行动失败：' + e.message);
        }
    },

    // 移动到地点
    travelTo(locationId) {
        try {
            const result = MapSystem.travelTo(locationId);
            
            if (!result.success) {
                UI.showMessage(result.message);
                return;
            }

            // 更新任务进度（到达新地点）
            const completedQuests = QuestSystem.updateProgress('reach', locationId, 1);

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

            UI.renderMapScreen();
            UI.showMessage(`来到了 ${result.location.name}`);
        } catch (e) {
            console.error('移动出错:', e);
            UI.showMessage('移动失败：' + e.message);
        }
    },
    
    // 等待到指定时段
    waitUntil(targetPeriod) {
        const result = TimeSystem.waitUntil(targetPeriod);
        
        if (!result.success) {
            UI.showMessage(result.message);
            return;
        }
        
        // 保存游戏
        Player.save();
        
        // 检查是否有大事件
        const scheduledEvent = TimeSystem.getPendingEvent();
        if (scheduledEvent) {
            TimeSystem.clearPendingEvent();
            this.showScheduledEvent(scheduledEvent);
            return;
        }
        
        // 检查地点解锁
        const newlyUnlocked = MapSystem.checkLocationUnlocks();
        if (newlyUnlocked.length > 0) {
            const names = newlyUnlocked.map(loc => loc.name).join('、');
            UI.showMessage(`⏰ 等待结束...\n🎉 解锁新地点：${names}！`);
        } else {
            const periodInfo = TimeSystem.getCurrentPeriodInfo();
            UI.showMessage(`⏰ 等待结束，现在是${periodInfo.name}`);
        }
        
        // 刷新界面
        UI.renderMapScreen();
    },
    
    // 显示等待选择界面
    showWaitMenu() {
        const periods = TimeSystem.getAllPeriods();
        const currentPeriod = Player.timeOfDay;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #6666aa;
            border-radius: 15px;
            padding: 30px;
            min-width: 350px;
            z-index: 1000;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 20px; font-weight: bold;">
                ⏰ 等待时间
            </div>
            <div style="font-size: 14px; color: #aaa; margin-bottom: 20px;">
                选择要等待到的时段（消耗少量体力）
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;" id="wait-period-buttons">
                ${periods.map(period => {
                    const isCurrent = period.id === currentPeriod;
                    const icons = {
                        morning: '🌅',
                        afternoon: '☀️',
                        evening: '🌆',
                        night: '🌙'
                    };
                    const icon = icons[period.id] || '⏰';
                    const hours = this._getHoursToPeriod(period.id);
                    const staminaCost = Math.floor(hours * 0.5);
                    
                    return `
                        <button data-period="${period.id}" 
                                ${isCurrent ? 'disabled' : ''}
                                class="wait-period-btn"
                                style="
                            padding: 15px 20px;
                            background: ${isCurrent ? 'rgba(50, 50, 50, 0.5)' : 'rgba(40, 40, 80, 0.8)'};
                            border: 2px solid ${isCurrent ? '#444' : '#444477'};
                            border-radius: 10px;
                            color: ${isCurrent ? '#666' : '#e0e0ff'};
                            cursor: ${isCurrent ? 'not-allowed' : 'pointer'};
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 16px;
                            width: 100%;
                        ">
                            <div style="font-weight: bold;">
                                ${icon} ${period.name}
                                ${isCurrent ? '<span style="font-size: 12px; color: #888;">（当前）</span>' : ''}
                            </div>
                            <div style="font-size: 12px; color: #888; margin-top: 3px;">
                                消耗约 ${staminaCost} 体力
                            </div>
                        </button>
                    `;
                }).join('')}
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
                ">取消</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定按钮点击事件
        const self = this;
        const buttons = dialog.querySelectorAll('.wait-period-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const periodId = this.getAttribute('data-period');
                if (periodId && !this.disabled) {
                    dialog.remove();
                    self.waitUntil(periodId);
                }
            });
            
            // hover 效果
            if (!btn.disabled) {
                btn.addEventListener('mouseenter', function() {
                    this.style.borderColor = '#7777bb';
                    this.style.background = 'rgba(60, 60, 120, 0.8)';
                });
                btn.addEventListener('mouseleave', function() {
                    this.style.borderColor = '#444477';
                    this.style.background = 'rgba(40, 40, 80, 0.8)';
                });
            }
        });
    },
    
    // 计算到目标时段需要多少小时
    _getHoursToPeriod(targetPeriod) {
        const periods = TimeSystem.getAllPeriods();
        const currentIndex = periods.findIndex(p => p.id === Player.timeOfDay);
        const targetIndex = periods.findIndex(p => p.id === targetPeriod);
        
        if (currentIndex === -1 || targetIndex === -1) return 0;
        
        let hours;
        if (targetIndex > currentIndex) {
            hours = (targetIndex - currentIndex) * 6;
        } else {
            hours = (periods.length - currentIndex + targetIndex) * 6;
        }
        
        return hours;
    },

    // ========== 战斗界面 ==========
    startBattle(enemy) {
        this.state = 'battle';
        BattleSystem.startBattle(enemy);
        UI.renderBattleScreen();
    },

    // 玩家攻击
    battleAttack() {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerAttack();
        UI.updateBattleScreen();
        
        // 检查战斗结束
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家使用技能
    battleUseSkill(skillId) {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerCastSkill(skillId);
        UI.updateBattleScreen();
        
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家防御
    battleDefend() {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerDefend();
        UI.updateBattleScreen();
        
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家使用道具
    battleUseItem(itemId) {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.playerUseItem(itemId);
        UI.updateBattleScreen();
        
        if (!BattleSystem.active) {
            this.endBattle();
        }
    },

    // 玩家逃跑
    battleFlee() {
        if (!BattleSystem.isPlayerTurn) return;
        
        const result = BattleSystem.playerFlee();
        UI.updateBattleScreen();
        
        if (result && result.success) {
            setTimeout(() => {
                this.state = 'map';
                UI.renderMapScreen();
            }, 1000);
        }
    },

    // 结束战斗
    endBattle() {
        BattleSystem.endBattle();
        
        setTimeout(() => {
            if (BattleSystem.result === 'win') {
                // 胜利
                const rewards = BattleSystem.rewards;
                let message = '战斗胜利！\n';
                message += `获得 ${rewards.exp} 经验\n`;
                message += `获得 ${rewards.gold} 金币\n`;
                if (rewards.items.length > 0) {
                    rewards.items.forEach(item => {
                        message += `获得 ${item.name} x${item.count}\n`;
                    });
                }
                if (rewards.levelUps.length > 0) {
                    message += `升级了！当前等级 ${Player.level}\n`;
                    message += `获得 ${rewards.levelUps.length * 3} 属性点`;
                }
                
                UI.showMessage(message.trim());
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
                
            } else if (BattleSystem.result === 'lose') {
                // 失败 - 死亡惩罚
                const deathResult = MapSystem.handleDeath();
                UI.showMessage(deathResult.message);
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
            }
        }, 1500);
    },

    // ========== 事件界面 ==========
    showEvent(event) {
        this.state = 'event';
        this.currentEvent = event;
        UI.renderEventScreen(event);
    },

    // ========== 大事件界面 ==========
    showScheduledEvent(event) {
        this.state = 'scheduled_event';
        this.currentScheduledEvent = event;

        // 检查是否满足条件
        let success = true;
        if (event.conditions) {
            if (event.conditions.minLevel && Player.level < event.conditions.minLevel) {
                success = false;
            }
        }

        // 标记事件已触发
        Player.flags['event_' + event.id] = true;

        // 应用效果
        if (success) {
            if (event.successRewards) {
                if (event.successRewards.exp) {
                    Player.gainExp(event.successRewards.exp);
                }
                if (event.successRewards.gold) {
                    Player.gold += event.successRewards.gold;
                }
                if (event.successRewards.items) {
                    event.successRewards.items.forEach(item => {
                        InventorySystem.addItem(item.itemId, item.count || 1);
                    });
                }
            }
        } else {
            if (event.failPenalty) {
                if (event.failPenalty.exp) {
                    Player.exp = Math.max(0, Player.exp + event.failPenalty.exp);
                }
                if (event.failPenalty.gold) {
                    Player.gold = Math.max(0, Player.gold + event.failPenalty.gold);
                }
            }
        }

        // 显示事件界面
        UI.renderScheduledEventScreen(event, success);

        // 保存游戏
        Player.save();
    },

    // 关闭大事件界面
    closeScheduledEvent() {
        this.state = 'map';
        this.currentScheduledEvent = null;
        UI.renderMapScreen();
    },

    // 选择事件选项
    selectEventChoice(choiceIndex) {
        const event = this.currentEvent;
        if (!event) return;

        const result = EventSystem.selectChoice(event.id, choiceIndex);
        
        if (result.success) {
            // 显示结果
            UI.showEventResult(result.text, result.effects);
            
            // 保存游戏
            Player.save();
            
            // 延迟后返回地图
            setTimeout(() => {
                this.state = 'map';
                UI.renderMapScreen();
            }, 2000);
        }
    },

    // ========== 商店界面 ==========
    openShop() {
        this.state = 'shop';
        UI.renderShopScreen();
    },

    // 购买物品
    buyItem(itemId, count = 1) {
        try {
            const result = ShopSystem.buyItem(itemId, count);
            UI.showMessage(result.message);
            UI.updateShopScreen();
            Player.save();
        } catch (e) {
            console.error('购买物品出错:', e);
            UI.showMessage('购买失败：' + e.message);
        }
    },

    // 出售物品
    sellItem(itemId, count = 1) {
        const result = ShopSystem.sellItem(itemId, count);
        UI.showMessage(result.message);
        UI.updateShopScreen();
        Player.save();
    },

    // 关闭商店
    closeShop() {
        ShopSystem.closeShop();
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== NPC 对话 ==========
    showNPCList(npcs, unavailableNpcs = []) {
        // 参数校验
        if (!npcs) npcs = [];
        if (!Array.isArray(npcs)) npcs = [];
        
        // 创建 NPC 选择弹窗
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #6666aa;
            border-radius: 15px;
            padding: 30px;
            min-width: 380px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 99999;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        // 生成可用NPC的HTML
        const availableNpcsHtml = npcs.map(npc => {
            const canTalk = NPCStateSystem.canTalkTo(npc.id);
            const hint = NPCStateSystem.getDialogueRequirementHint(npc.id);
            
            if (canTalk) {
                return `
                    <div onclick="talkToNPC('${npc.id}')" style="
                        padding: 15px 20px;
                        background: rgba(40, 40, 80, 0.8);
                        border: 2px solid #444477;
                        border-radius: 10px;
                        color: #e0e0ff;
                        cursor: pointer;
                        text-align: left;
                        transition: all 0.3s;
                        font-size: 16px;
                    " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                        <div style="font-weight: bold; font-size: 17px;">${npc.name}</div>
                        <div style="font-size: 13px; color: #999; margin-top: 3px;">${npc.title || ''}</div>
                    </div>
                `;
            } else {
                return `
                    <button onclick="showCannotTalkHint('${npc.id}')" style="
                        padding: 15px 20px;
                        background: rgba(40, 40, 40, 0.6);
                        border: 2px solid #555;
                        border-radius: 10px;
                        color: #888;
                        cursor: not-allowed;
                        text-align: left;
                        font-size: 16px;
                        opacity: 0.7;
                    ">
                        <div style="font-weight: bold; font-size: 17px;">
                            🔒 ${npc.name}
                        </div>
                        <div style="font-size: 13px; color: #777; margin-top: 3px;">
                            ${npc.title || ''}
                        </div>
                        ${hint ? `
                            <div style="font-size: 12px; color: #ff9966; margin-top: 5px;">
                                ⚠️ ${hint}
                            </div>
                        ` : ''}
                    </button>
                `;
            }
        }).join('');
        
        // 生成不可用NPC的HTML（因为时间不对而不在的）
        const periodNames = {
            morning: '🌅 早上',
            afternoon: '☀️ 下午',
            evening: '🌆 傍晚',
            night: '🌙 夜晚'
        };
        
        const unavailableNpcsHtml = unavailableNpcs.map(npc => {
            const availableTimesText = npc.availableTimes 
                ? npc.availableTimes.map(t => periodNames[t] || t).join('、')
                : '未知';
            
            return `
                <div style="
                    padding: 15px 20px;
                    background: rgba(30, 30, 30, 0.5);
                    border: 1px dashed #555;
                    border-radius: 10px;
                    color: #666;
                    text-align: left;
                    font-size: 16px;
                    opacity: 0.6;
                ">
                    <div style="font-weight: bold; font-size: 17px;">
                        💤 ${npc.name}（不在）
                    </div>
                    <div style="font-size: 13px; color: #555; margin-top: 3px;">
                        ${npc.title || ''}
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 5px;">
                        🕐 出现时间：${availableTimesText}
                    </div>
                </div>
            `;
        }).join('');
        
        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 20px; font-weight: bold;">
                💬 选择对话对象
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${npcs.length > 0 ? availableNpcsHtml : `
                    <div style="color: #888; text-align: center; padding: 20px;">
                        现在这里没有人...
                    </div>
                `}
                ${unavailableNpcs.length > 0 ? `
                    <div style="font-size: 14px; color: #888; margin-top: 15px; margin-bottom: 5px; border-top: 1px solid #444; padding-top: 15px;">
                        💤 现在不在
                    </div>
                    ${unavailableNpcsHtml}
                ` : ''}
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <div onclick="this.parentElement.parentElement.remove()" style="
                    display: inline-block;
                    padding: 8px 25px;
                    background: #444477;
                    border: 1px solid #666699;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    font-size: 14px;
                ">取消</div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        window.talkToNPC = (npcId) => {
            dialog.remove();
            this.startDialogue(npcId);
        };
        
        window.showCannotTalkHint = (npcId) => {
            const npc = DataManager.getCharacter(npcId);
            const hint = NPCStateSystem.getDialogueRequirementHint(npcId);
            if (hint) {
                UI.showMessage(`${npc.name}现在还不想和你说话。\n条件：${hint}`);
            } else {
                UI.showMessage(`${npc.name}现在不想和你说话。`);
            }
        };
    },

    // 开始对话
    startDialogue(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 检查是否可以对话
        if (!NPCStateSystem.canTalkTo(npcId)) {
            UI.showMessage(`${npc.name}不想和你说话。`);
            return;
        }

        // 开始对话
        const dialogueData = DialogueTree.startDialogue(npcId);
        if (!dialogueData) {
            UI.showMessage('对话失败。');
            return;
        }

        this.state = 'dialogue';
        this._currentDialogueNPC = npcId;
        this._showDialogueScreen(npc, dialogueData);
    },

    // 显示对话界面
    _showDialogueScreen(npc, dialogueData) {
        const npcState = NPCStateSystem.getNPCState(npc.id);
        const relationLevel = NPCStateSystem.getRelationshipLevel(npc.id);
        const dialogueTone = NPCStateSystem.getDialogueTone(npc.id);

        // 创建对话界面
        const dialog = document.createElement('div');
        dialog.id = 'dialogue-screen';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            z-index: 1000;
            overflow: hidden;
        `;

        // 添加背景图片
        const bgDiv = document.createElement('div');
        bgDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('assets/images/backgrounds/bo_city_view.jpg') center/cover;
            opacity: 0.1;
            filter: blur(5px);
            z-index: 0;
        `;
        dialog.appendChild(bgDiv);

        // 计算好感度进度条百分比
        const opinionPercent = Math.max(0, Math.min(100, (npcState.opinion + 100) / 2));
        const trustPercent = Math.max(0, Math.min(100, (npcState.trust + 100) / 2));
        const familiarityPercent = Math.max(0, Math.min(100, npcState.familiarity));

        dialog.innerHTML = `
            <div style="position: relative; z-index: 1; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-end;">
            <!-- NPC 立绘区域 -->
            <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                    <div style="
                        width: 150px;
                        height: 150px;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 60px;
                        box-shadow: 0 0 50px ${npc.spriteColor || '#666666'}80;
                        overflow: hidden;
                        background: ${npc.spriteColor || '#666'};
                    ">
                        ${npc.image ? `<img src="${npc.image}" style="width: 100%; height: 100%; object-fit: cover;">` : (npc.elements?.[0] ? this._getElementEmoji(npc.elements[0]) : '👤')}
                    </div>
                    <div style="font-size: 24px; color: #fff; font-weight: bold;">${npc.name}</div>
                    <div style="font-size: 14px; color: #aaa; margin-top: 5px;">${npc.title || ''}</div>
                    <div style="font-size: 16px; color: ${relationLevel.color}; margin-top: 10px; font-weight: bold;">
                        ${relationLevel.name}
                    </div>
                    <div style="font-size: 12px; color: #888; margin-top: 3px;">
                        语气：${dialogueTone}
                    </div>
                    
                    <!-- 关系数值条 -->
                    <div style="margin-top: 15px; width: 200px; text-align: left;">
                        <!-- 好感度 -->
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 11px; color: #ff9999; margin-bottom: 3px;">
                                ❤️ 好感 ${Math.round(npcState.opinion)}
                            </div>
                            <div style="height: 4px; background: #333; border-radius: 2px;">
                                <div style="height: 100%; width: ${opinionPercent}%; background: linear-gradient(90deg, #ff6666, #ff9999); border-radius: 2px;"></div>
                            </div>
                        </div>
                        <!-- 信任度 -->
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 11px; color: #99ff99; margin-bottom: 3px;">
                                🤝 信任 ${Math.round(npcState.trust)}
                            </div>
                            <div style="height: 4px; background: #333; border-radius: 2px;">
                                <div style="height: 100%; width: ${trustPercent}%; background: linear-gradient(90deg, #66cc66, #99ff99); border-radius: 2px;"></div>
                            </div>
                        </div>
                        <!-- 熟悉度 -->
                        <div>
                            <div style="font-size: 11px; color: #9999ff; margin-bottom: 3px;">
                                👁️ 熟悉 ${Math.round(npcState.familiarity)}
                            </div>
                            <div style="height: 4px; background: #333; border-radius: 2px;">
                                <div style="height: 100%; width: ${familiarityPercent}%; background: linear-gradient(90deg, #6666cc, #9999ff); border-radius: 2px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 对话框 -->
            <div style="
                background: rgba(20, 20, 50, 0.95);
                border-top: 3px solid #6666aa;
                padding: 25px 30px;
                min-height: 200px;
            ">
                <!-- 对话文本 -->
                <div id="dialogue-text" style="
                    font-size: 17px;
                    color: #e0e0ff;
                    line-height: 1.8;
                    margin-bottom: 20px;
                    min-height: 60px;
                ">
                    ${dialogueData.text}
                </div>

                <!-- 选项列表 -->
                <div id="dialogue-choices" style="display: flex; flex-direction: column; gap: 8px;">
                    ${dialogueData.choices.map((choice, index) => `
                        <div onclick="Game.selectDialogueChoice('${choice.id}')" style="
                            padding: 12px 20px;
                            background: rgba(40, 40, 80, 0.8);
                            border: 2px solid #444477;
                            border-radius: 8px;
                            color: #e0e0ff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 15px;
                        " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                            <span style="color: #ffd700; margin-right: 10px;">${index + 1}.</span>
                            ${choice.text}
                        </div>
                    `).join('')}
                </div>
            </div>
            </div>
        `;

        document.body.appendChild(dialog);
    },

    // 选择对话选项
    selectDialogueChoice(choiceId) {
        if (!this._currentDialogueNPC) return;

        const result = DialogueTree.selectChoice(choiceId);
        
        if (result.ended) {
            // 对话结束
            this._closeDialogue();
            return;
        }

        // 更新对话内容
        const npc = DataManager.getCharacter(this._currentDialogueNPC);
        this._updateDialogueScreen(npc, result);
    },

    // 更新对话界面
    _updateDialogueScreen(npc, dialogueData) {
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');

        if (textEl) {
            textEl.style.opacity = '0';
            setTimeout(() => {
                textEl.textContent = dialogueData.text;
                textEl.style.opacity = '1';
            }, 200);
        }

        if (choicesEl) {
            choicesEl.innerHTML = dialogueData.choices.map((choice, index) => `
                <div onclick="Game.selectDialogueChoice('${choice.id}')" style="
                    padding: 12px 20px;
                    background: rgba(40, 40, 80, 0.8);
                    border: 2px solid #444477;
                    border-radius: 8px;
                    color: #e0e0ff;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.3s;
                    font-size: 15px;
                " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                    <span style="color: #ffd700; margin-right: 10px;">${index + 1}.</span>
                    ${choice.text}
                </div>
            `).join('');
        }

        // 保存游戏
        Player.save();
    },

    // 关闭对话
    _closeDialogue() {
        const dialog = document.getElementById('dialogue-screen');
        if (dialog) {
            dialog.remove();
        }
        
        this._currentDialogueNPC = null;
        this.state = 'map';
        UI.renderMapScreen();
        Player.save();
    },

    // 获取元素 emoji
    _getElementEmoji(element) {
        const emojis = {
            fire: '🔥',
            ice: '❄️',
            thunder: '⚡',
            earth: '🪨',
            wind: '💨',
            water: '💧',
            light: '✨',
            dark: '🌑'
        };
        return emojis[element] || '👤';
    },

    // 接受任务
    acceptQuest(questId) {
        const result = QuestSystem.acceptQuest(questId);
        if (result.success) {
            UI.showMessage(`接取任务：${result.quest.name}`);
            Player.save();
        } else {
            UI.showMessage(result.message);
        }
    },

    // ========== 背包界面 ==========
    openInventory() {
        this.state = 'inventory';
        UI.renderInventoryScreen();
    },

    // 使用物品
    useItem(itemId) {
        try {
            const result = Inventory.useItem(itemId, false);
            UI.showMessage(result.message);
            UI.updateInventoryScreen();
            Player.save();
        } catch (e) {
            console.error('使用物品出错:', e);
            UI.showMessage('使用失败：' + e.message);
        }
    },

    // 装备物品
    equipItem(itemId) {
        const result = Inventory.equipItem(itemId);
        UI.showMessage(result.message);
        UI.updateInventoryScreen();
        Player.save();
    },

    // 卸下装备
    unequipItem(slot) {
        const result = Inventory.unequipItem(slot);
        UI.showMessage(result.message);
        UI.updateInventoryScreen();
        Player.save();
    },

    // 关闭背包
    closeInventory() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 任务界面 ==========
    openQuestLog() {
        this.state = 'quest';
        UI.renderQuestScreen();
    },

    closeQuestLog() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 情报界面 ==========
    openIntelPanel() {
        this.state = 'intel';
        UI.renderIntelScreen();
    },

    closeIntelPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 声望界面 ==========
    openReputationPanel() {
        this.state = 'reputation';
        UI.renderReputationScreen();
    },

    closeReputationPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 帮助界面 ==========
    openHelpPanel() {
        this.state = 'help';
        UI.renderHelpScreen();
    },

    closeHelpPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 角色/属性界面 ==========
    openCharacterPanel() {
        this.state = 'character';
        UI.renderCharacterScreen();
    },

    // 分配属性点
    addAttribute(attr) {
        const result = Player.addAttribute(attr);
        if (result) {
            UI.updateCharacterScreen();
            Player.save();
        }
    },

    closeCharacterPanel() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 休息/睡觉 ==========
    rest() {
        const events = TimeSystem.restUntilMorning();
        Player.save();
        UI.renderMapScreen();
        UI.showMessage('休息了一晚，HP 和 MP 完全恢复了！');
    },

    // ========== 保存游戏 ==========
    saveGame() {
        Player.save();
        UI.showMessage('游戏已保存！');
    },

    // ========== NPC 对话 ==========
    talkToNPC(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 检查是否有可接任务
        const availableQuests = (npc.givesQuests || []).filter(q => QuestSystem.canAcceptQuest(q));
        
        let message = npc.name + '：\n';
        
        // 获取对话
        const dialogue = npc.dialogue?.[0]?.text || '...';
        message += dialogue;

        if (availableQuests.length > 0) {
            message += '\n\n【有可接任务】';
        }

        UI.showNPCDialog(npc, message, availableQuests);
    },

    // 接取任务
    acceptQuest(questId) {
        const result = QuestSystem.acceptQuest(questId);
        UI.showMessage(result.message);
        Player.save();
        UI.renderMapScreen();
    },

    // 给NPC送礼
    giveGift(npcId, itemId) {
        try {
            const npc = DataManager.getCharacter(npcId);
            if (!npc) {
                UI.showMessage('NPC不存在');
                return { success: false };
            }

            // 检查玩家是否有该物品
            const item = Player.inventory.find(i => i.itemId === itemId);
            if (!item || item.count <= 0) {
                UI.showMessage('你没有这个物品');
                return { success: false };
            }

            const itemData = DataManager.getItem(itemId);
            if (!itemData) {
                UI.showMessage('物品数据不存在');
                return { success: false };
            }

            // 获取礼物偏好
            const giftPrefs = npc.giftPreferences || {};
            const dailyLimit = giftPrefs.dailyGiftLimit || 3;
            const baseGain = giftPrefs.baseOpinionGain || 5;

            // 检查今日送礼次数（使用world-state的flags记录）
            const todayKey = `gift_${npcId}_day_${Player.day}`;
            const todayGifts = WorldStateSystem.getFlag(todayKey) || 0;
            if (todayGifts >= dailyLimit) {
                UI.showMessage(`今天已经给${npc.name}送过${dailyLimit}次礼物了，明天再来吧`);
                return { success: false };
            }

            // 计算好感度变化
            let multiplier = 1;
            let reaction = '';
            const loved = giftPrefs.loved || [];
            const liked = giftPrefs.liked || [];
            const disliked = giftPrefs.disliked || [];

            if (loved.includes(itemId)) {
                multiplier = giftPrefs.lovedMultiplier || 3;
                reaction = `${npc.name}非常喜欢这个礼物！`;
            } else if (liked.includes(itemId)) {
                multiplier = giftPrefs.likedMultiplier || 1.5;
                reaction = `${npc.name}觉得这个礼物不错。`;
            } else if (disliked.includes(itemId)) {
                multiplier = giftPrefs.dislikedMultiplier || 0.5;
                reaction = `${npc.name}不太喜欢这个礼物...`;
            } else {
                reaction = `${npc.name}收下了你的礼物。`;
            }

            const opinionGain = Math.floor(baseGain * multiplier);

            // 移除物品
            Inventory.removeItem(itemId, 1);

            // 增加好感度
            NPCStateSystem.changeOpinion(npcId, opinionGain, '送礼');

            // 记录今日送礼次数
            WorldStateSystem.setFlag(todayKey, todayGifts + 1);

            // 显示结果
            const currentOpinion = NPCStateSystem.getNPCState(npcId)?.opinion || 0;
            UI.showMessage(`${reaction}\n好感度 +${opinionGain}（当前：${currentOpinion}）`);

            Player.save();
            return { success: true, opinionGain };
        } catch (e) {
            console.error('送礼出错:', e);
            UI.showMessage('送礼失败：' + e.message);
            return { success: false };
        }
    },
};
