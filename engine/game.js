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
    
    // 上一次战斗（用于再次挑战）
    lastBattle: null,  // { enemy, options }

    // 初始化
    init() {
        // 全局错误处理
        window.onerror = (message, source, lineno, colno, error) => {
            console.error('全局错误:', { message, source, lineno, colno, error });
            console.error('错误堆栈:', error?.stack);
            
            // 显示错误提示
            const errorBar = document.createElement('div');
            errorBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(90deg, #cc3333, #ff5555);
                color: white;
                padding: 10px 20px;
                text-align: center;
                z-index: 99999999;
                font-size: 14px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            errorBar.innerHTML = `
                ⚠️ 游戏出错：${message}（第${lineno}行）
                <button onclick="this.parentElement.style.display='none'" style="margin-left: 20px; padding: 5px 15px; background: rgba(255,255,255,0.2); border: 1px solid white; border-radius: 5px; color: white; cursor: pointer;">关闭</button>
                <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 15px; background: rgba(255,255,255,0.2); border: 1px solid white; border-radius: 5px; color: white; cursor: pointer;">刷新页面</button>
            `;
            document.body.appendChild(errorBar);
            
            return false;
        };
        
        window.onunhandledrejection = (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            console.error('错误堆栈:', event.reason?.stack);
        };

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
            MapSystem.init();
            BigEventSystem.init();
            DailySystem.checkDailyReset();
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
        
        // 初始化大事件系统
        BigEventSystem.init();
        
        // 初始化日常系统
        DailySystem.initNewGame();
        DailySystem.checkDailyReset();
        
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

    // 行动冷却：弹窗关闭后短暂禁止行动，防止点击穿透/延迟触发
    _actionCooldown: false,
    
    // 上一次行动的时间戳，用于防止快速重复触发
    _lastActionTime: 0,
    
    // 执行地点行动
    performAction(actionId) {
        try {
        // 防护0：时间间隔防护 - 两次行动间隔小于1秒则取消，防止点击穿透/延迟触发
        const now = Date.now();
        if (now - this._lastActionTime < 1000) {
            return;
        }
        this._lastActionTime = now;
        
        // 安全检查：如果检测到卡住状态（有message-showing类但没有实际弹窗），自动恢复
        if (document.body.classList.contains('message-showing')) {
            const hasPopup = document.querySelector('.mobile-popup');
            const hasOverlay = document.querySelector('.mobile-popup-overlay');
            if (!hasPopup && !hasOverlay) {
                console.log('[安全] 检测到卡住状态，自动恢复点击');
                document.body.classList.remove('message-showing');
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.pointerEvents = '';
                }
                this._actionCooldown = false;
                if (typeof UI !== 'undefined') {
                    UI._isMessageShowing = false;
                }
            }
        }
        
        // 防护0.5：消息关闭后短时间内禁止行动，防止点击穿透
        if (typeof UI !== 'undefined' && UI._lastMessageCloseTime) {
            const timeSinceMessageClose = now - UI._lastMessageCloseTime;
            if (timeSinceMessageClose < 2000) {
                return;
            }
        }
        
        // 防护1：如果有消息弹窗显示，不执行行动
        if (UI._isMessageShowing) {
            return;
        }
        
        // 防护2：如果在行动冷却期，不执行行动
        if (this._actionCooldown) {
            return;
        }
        
        // 防护3：直接检查页面上是否有消息弹窗元素，防止状态不同步
        const hasPopup = document.querySelector('.mobile-popup');
        if (hasPopup) {
            return;
        }
        
        // 防护4：检查body是否有message-showing类
        if (document.body.classList.contains('message-showing')) {
            return;
        }
        
        // DEBUG: 把调用栈显示在页面上（已注释，需要时再打开）
        // try {
        //     const err = new Error();
        //     const stack = err.stack || '';
        //     const debugDiv = document.getElementById('debug-error');
        //     if (debugDiv) {
        //         debugDiv.style.display = 'block';
        //         debugDiv.style.background = '#006600';
        //         debugDiv.textContent = `[DEBUG] 执行行动: ${actionId}\n时间: ${Player.day}天 ${Player.hour}点\n消息弹窗: ${UI._isMessageShowing}\n冷却: ${this._actionCooldown}\n间隔: ${now - this._lastActionTime}ms\n消息关闭后: ${typeof UI !== 'undefined' && UI._lastMessageCloseTime ? now - UI._lastMessageCloseTime + 'ms' : 'N/A'}\n\n调用栈:\n${stack}`;
        //     }
        // } catch (e) {
        //     console.error('DEBUG显示失败', e);
        // }
        
        // 修炼类行动：先弹时长选择菜单
        if (actionId === 'train' || actionId === 'meditate') {
            this.showCultivateMenu(actionId);
            return;
        }
        
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
        
        // 日常追踪：探索类行动
        if (actionId && actionId.includes('explore')) {
            DailySystem.trackActivity('explore', 1);
        }
        // 日常追踪：获得金币
        if (result.effects && result.effects.gold) {
            DailySystem.trackActivity('earn_gold', result.effects.gold);
        }
        
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
            if (result.effects.levelUps) {
                message += `🎉 升级了！当前等级 ${Player.level}\n`;
                message += `获得 ${result.effects.levelUps * 3} 点可分配属性点\n`;
            }
            if (result.effects.addItem) {
                const item = Inventory.getItem(result.effects.addItem.itemId);
                const itemName = item?.name || result.effects.addItem.itemId;
                message += `获得 ${itemName} ×${result.effects.addItem.count}\n`;
            }
        }
        
        // 检查强制昏睡
        if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
            message = `😴 你熬夜太晚，不知不觉昏睡了过去...\n\n（第二天早上醒来，感觉没睡好，体力只恢复了50%）\n\n` + message;
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

        if (result.npcs != null) {
            // 显示 NPC 列表，选择对话对象
            const npcs = result.npcs || [];
            const unavailableNpcs = result.unavailableNpcs || [];
            if (npcs.length === 0 && unavailableNpcs.length === 0) {
                UI.showMessage('这里现在没有人...');
                return;
            }
            this.showNPCList(npcs, unavailableNpcs);
            return;
        }

        // 检查是否有大事件
        const scheduledEvent = TimeSystem.getPendingEvent();
        if (scheduledEvent) {
            TimeSystem.clearPendingEvent();
            this.showScheduledEvent(scheduledEvent);
            return;
        }
        
        // 检查是否有新大事件系统的事件
        if (BigEventSystem.checkAndTrigger()) {
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
    
    // 显示修炼时长选择菜单
    showCultivateMenu(actionId) {
        const location = DataManager.getLocation(Player.currentLocation);
        const action = location?.actions?.find(a => a.id === actionId);
        if (!action) return;
        
        const isTrain = actionId === 'train';
        const baseTime = action.timeCost || 2;
        const baseStamina = action.staminaCost || 10;
        const baseExp = action.effects?.exp || 10;
        
        // 时长选项：1小时、4小时、8小时、闭关（按基础时长缩放）
        const options = [
            { hours: 1, bonus: 1.0, label: '1小时', desc: '快速修炼，无加成' },
            { hours: 4, bonus: 1.1, label: '4小时', desc: '半天修炼，+10%收益' },
            { hours: 8, bonus: 1.2, label: '8小时', desc: '整日修炼，+20%收益' },
            { hours: 12, bonus: 1.5, label: '闭关（12小时）', desc: '闭关修炼，+50%收益' }
        ];
        
        // 过滤掉体力不够的选项
        const availableOptions = options.filter(opt => {
            const multiplier = opt.hours / baseTime;
            const staminaCost = Math.ceil(baseStamina * multiplier * 0.5); // 时间越长单位体力消耗越少，向上取整和实际消耗一致
            return Player.stamina >= staminaCost;
        });
        
        if (availableOptions.length === 0) {
            UI.showMessage('体力不足，无法修炼！');
            return;
        }
        
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
            z-index: 99999;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        dialog.innerHTML = `
            <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 22px;">
                ${isTrain ? '✨ 修炼魔法' : '🧘 冥修'}
            </h3>
            <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">选择修炼时长：时间越长，单位收益越高</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${availableOptions.map((opt, index) => {
                    const multiplier = opt.hours / baseTime;
                    const expGain = Math.floor(baseExp * multiplier * opt.bonus);
                    const staminaCost = Math.ceil(baseStamina * multiplier * 0.5); // 向上取整，和实际消耗一致
                    const hpChange = Math.floor((action.effects?.hp || 0) * multiplier);
                    const mpChange = Math.floor((action.effects?.mp || 0) * multiplier);
                    const timeCost = opt.hours;
                    return `
                        <div onclick="Game.performCultivate('${actionId}', ${opt.hours}, ${opt.bonus})" style="
                            padding: 15px 20px;
                            background: rgba(40, 40, 80, 0.8);
                            border: 2px solid #444477;
                            border-radius: 10px;
                            color: #e0e0ff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                        " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                            <div style="font-weight: bold; font-size: 17px; margin-bottom: 5px;">
                                ${opt.label}
                                <span style="float: right; font-size: 13px; display: flex; gap: 10px;">
                                    <span style="color: #aaddff;">⏱️ ${timeCost}h</span>
                                    <span style="color: #ff9966;">⚡ -${staminaCost}</span>
                                    ${hpChange !== 0 ? `<span style="color: ${hpChange > 0 ? '#66ff66' : '#ff6666'};">❤️ ${hpChange > 0 ? '+' : ''}${hpChange}</span>` : ''}
                                    ${mpChange !== 0 ? `<span style="color: ${mpChange > 0 ? '#6666ff' : '#ff6666'};">💧 ${mpChange > 0 ? '+' : ''}${mpChange}</span>` : ''}
                                    <span style="color: #ffd700;">✨ +${expGain}</span>
                                </span>
                            </div>
                            <div style="font-size: 13px; color: #999;">${opt.desc}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 10px;
                text-align: center;
                color: #888;
                cursor: pointer;
                font-size: 14px;
            ">取消</div>
        `;
        
        document.body.appendChild(dialog);
    },
    
    // 执行修炼（指定时长）
    performCultivate(actionId, hours, bonus) {
        try {
            // 关闭弹窗
            const dialogs = document.querySelectorAll('div[style*="z-index: 99999"]');
            dialogs.forEach(d => {
                if (d.querySelector('h3')?.textContent?.includes('修炼') || d.querySelector('h3')?.textContent?.includes('冥修')) {
                    d.remove();
                }
            });
            
            const location = DataManager.getLocation(Player.currentLocation);
            const action = location?.actions?.find(a => a.id === actionId);
            if (!action) {
                console.warn('[修炼] 行动不存在:', actionId);
                return;
            }
            
            const baseTime = action.timeCost || 2;
            const multiplier = hours / baseTime;
            
            // 计算实际效果：按时间倍数 × 收益加成
            const result = {
                success: true,
                timeCost: hours,
                effects: {
                    exp: Math.floor((action.effects?.exp || 0) * multiplier * bonus),
                    hp: Math.floor((action.effects?.hp || 0) * multiplier),
                    mp: Math.floor((action.effects?.mp || 0) * multiplier),
                    stamina: Math.floor(-(action.staminaCost || 10) * multiplier * 0.5) // 时间越长单位体力消耗越少
                },
                message: `${action.name} ${hours}小时完成`
            };
            
            // 星尘魔器效果：增加修炼经验
            if (typeof StarDustArtifactSystem !== 'undefined') {
                const starDustEffect = Player.getTotalStarDustEffect();
                if (starDustEffect.expBonus > 0) {
                    const bonusExp = Math.floor(result.effects.exp * starDustEffect.expBonus);
                    result.effects.exp += bonusExp;
                    result.starDustBonus = bonusExp;
                }
            }
            
            // 触发事件的概率：时间越长概率越高，但不是线性增长
            const eventChance = action.eventChance || 0;
            if (eventChance > 0 && Math.random() < eventChance * Math.sqrt(multiplier)) {
                const eventId = action.events[Math.floor(Math.random() * action.events.length)];
                result.event = eventId;
            }
            
            // 应用效果
            if (result.effects.exp) Player.gainExp(result.effects.exp);
            if (result.effects.hp) Player.hp = Math.max(1, Math.min(Player.maxHp, Player.hp + result.effects.hp));
            if (result.effects.mp) Player.mp = Math.max(0, Math.min(Player.maxMp, Player.mp + result.effects.mp));
            if (result.effects.stamina) Player.stamina = Math.max(0, Math.min(100, Player.stamina + result.effects.stamina));
            
            // 时间流逝
            const timeResult = TimeSystem.advanceTime(result.timeCost);
            result.timeEvents = timeResult.events;
            
            // 检查强制昏睡
            let message = result.message + '\n';
            if (result.effects.exp) message += `经验 +${result.effects.exp}\n`;
            if (result.starDustBonus) message += `  ✨ 星尘魔器加成 +${result.starDustBonus}\n`;
            if (result.effects.mp > 0) message += `MP +${result.effects.mp}\n`;
            if (result.effects.mp < 0) message += `MP ${result.effects.mp}\n`;
            if (result.effects.hp < 0) message += `HP ${result.effects.hp}\n`;
            
            // 检查升级
            if (Player.exp >= Player.expToNext) {
                const levelResult = Player.checkLevelUp();
                if (levelResult.levelUps.length > 0) {
                    message += `🎉 升级了！当前等级 ${Player.level}\n`;
                    message += `获得 ${levelResult.levelUps.length * 3} 点可分配属性点\n`;
                }
            }

            // 天赋经验：修炼增加主系天赋经验
            if (Player.elements && Player.elements.length > 0 && typeof TalentSystem !== 'undefined') {
                const mainElement = Player.elements[0];
                const talentExp = Math.floor(5 * multiplier * bonus); // 每小时5点基础天赋经验
                const talentResult = Player.addElementTalentExp(mainElement, talentExp);
                if (talentResult.leveledUp) {
                    message += `🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！\n`;
                }
            }
            
            // 检查强制昏睡
            if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
                message = `😴 你熬夜修炼，不知不觉昏睡了过去...\n\n（第二天早上醒来，感觉没睡好，体力只恢复了50%）\n\n` + message;
            }
            
            UI.showMessage(message.trim());
            
            // 刷新界面
            UI.renderMapScreen();
            
            // 检查地点解锁
            const newlyUnlocked = MapSystem.checkLocationUnlocks();
            if (newlyUnlocked.length > 0) {
                const names = newlyUnlocked.map(loc => loc.name).join('、');
                setTimeout(() => UI.showMessage(`🎉 解锁新地点：${names}！`), 500);
            }
            
            // 日常追踪：修炼
            DailySystem.trackActivity('cultivate', 1);
            
            // 保存游戏
            Player.save();
        } catch (e) {
            console.error('[修炼] 出错:', e);
            UI.showMessage('修炼出错：' + e.message);
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

            // 日常追踪：访问地点
            DailySystem.trackActivity('visit', 1, locationId);

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
            
            // 检查强制昏睡
            let travelMsg = `来到了 ${result.location.name}`;
            if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
                travelMsg = `😴 你熬夜赶路，不知不觉昏睡了过去...\n\n（第二天醒来，体力只恢复了50%）\n\n` + travelMsg;
            }
            UI.showMessage(travelMsg);
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
        
        // 检查是否有新大事件系统的事件
        if (BigEventSystem.checkAndTrigger()) {
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
    startBattle(enemy, endCallback, options = {}) {
        this.state = 'battle';
        this.battleEndCallback = endCallback || null;
        // 保存上一次战斗数据（用于再次挑战）
        this.lastBattle = {
            enemy: JSON.parse(JSON.stringify(enemy)),  // 深拷贝
            options: options
        };
        BattleSystem.startBattle(enemy, options);
        UI.renderBattleScreen();
    },
    
    // 再次挑战上一次的敌人
    rematch() {
        if (!this.lastBattle) {
            UI.showMessage('没有可再次挑战的敌人');
            return;
        }
        // 恢复玩家HP/MP到战斗前状态？不，玩家应该保持当前状态
        // 重新创建敌人（深拷贝）
        const enemy = JSON.parse(JSON.stringify(this.lastBattle.enemy));
        const options = this.lastBattle.options || {};
        this.startBattle(enemy, null, options);
    },
    
    // 开始车轮战
    startGauntlet(enemyList, options = {}) {
        this.gauntletState = {
            enemies: enemyList,  // 敌人列表
            currentIndex: 0,  // 当前敌人索引
            totalWins: 0,  // 胜利次数
            totalExp: 0,  // 累计经验
            totalGold: 0,  // 累计金币
            totalItems: [],  // 累计物品
            options: options  // 其他选项
        };
        this.state = 'battle';
        this.battleEndCallback = null;
        
        // 开始第一个敌人
        const firstEnemy = enemyList[0];
        BattleSystem.startBattle(firstEnemy, {
            canUseItems: options.canUseItems !== false,
            canFlee: false  // 车轮战不能逃跑
        });
        UI.renderBattleScreen();
        
        // 显示车轮战开始消息
        BattleSystem.addLog(`⚔️ 车轮战开始！共 ${enemyList.length} 个对手`, 'system');
    },
    
    // 车轮战：下一个敌人
    nextGauntletEnemy() {
        if (!this.gauntletState) return false;
        
        this.gauntletState.currentIndex++;
        const index = this.gauntletState.currentIndex;
        const total = this.gauntletState.enemies.length;
        
        if (index >= total) {
            // 全部打完了，车轮战胜利
            return false;
        }
        
        // 继续下一个敌人
        const nextEnemy = this.gauntletState.enemies[index];
        BattleSystem.startBattle(nextEnemy, {
            canUseItems: this.gauntletState.options.canUseItems !== false,
            canFlee: false
        });
        
        // 显示下一个敌人的消息
        BattleSystem.addLog(`⚔️ 第 ${index + 1}/${total} 个对手：${nextEnemy.name}！`, 'system');
        
        return true;
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

    // 玩家使用魔具技能
    battleUseMagicTool(skillId) {
        if (!BattleSystem.isPlayerTurn) return;
        
        BattleSystem.useMagicTool(skillId);
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

    // 显示战斗道具选择
    battleShowItems() {
        if (!BattleSystem.isPlayerTurn) return;
        UI.showBattleItems();
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
            // 如果有战斗结束回调，调用回调
            if (this.battleEndCallback) {
                const callback = this.battleEndCallback;
                this.battleEndCallback = null;
                callback(BattleSystem.result, BattleSystem.rewards);
                return;
            }
            
            if (BattleSystem.result === 'win') {
                // 记录击杀到图鉴
                if (BattleSystem.enemy && BattleSystem.enemy.id) {
                    Player.recordKill(BattleSystem.enemy.id);
                }
                // 日常追踪：击杀和战斗胜利
                DailySystem.trackActivity('kill', 1);
                DailySystem.trackActivity('battle_win', 1);
                if (BattleSystem.rewards && BattleSystem.rewards.gold) {
                    DailySystem.trackActivity('earn_gold', BattleSystem.rewards.gold);
                }
                
                // 检查是不是车轮战
                if (this.gauntletState) {
                    // 累计奖励
                    const rewards = BattleSystem.rewards;
                    this.gauntletState.totalWins++;
                    this.gauntletState.totalExp += rewards.exp;
                    this.gauntletState.totalGold += rewards.gold;
                    if (rewards.items && rewards.items.length > 0) {
                        this.gauntletState.totalItems.push(...rewards.items);
                    }
                    
                    // 尝试下一个敌人
                    const hasNext = this.nextGauntletEnemy();
                    if (hasNext) {
                        // 还有下一个，继续战斗
                        UI.renderBattleScreen();
                        return;
                    } else {
                        // 全部打完了，车轮战胜利
                        const totalWins = this.gauntletState.totalWins;
                        const totalExp = this.gauntletState.totalExp;
                        const totalGold = this.gauntletState.totalGold;
                        const totalItems = this.gauntletState.totalItems;
                        
                        // 清空车轮战状态
                        this.gauntletState = null;
                        
                        // 显示车轮战胜利消息
                        let message = `🏆 车轮战胜利！\n\n`;
                        message += `连胜：${totalWins} 场\n\n`;
                        message += `🎁 累计奖励\n`;
                        message += `经验：+${totalExp}\n`;
                        message += `金币：+${totalGold}\n`;
                        if (totalItems.length > 0) {
                            totalItems.forEach(item => {
                                message += `${item.name}：x${item.count}\n`;
                            });
                        }
                        
                        UI.showMessage(message.trim());
                        this.state = 'map';
                        UI.renderMapScreen();
                        Player.save();
                        return;
                    }
                }
                
                // 普通战斗胜利
                const rewards = BattleSystem.rewards;
                const stats = BattleSystem.stats;
                const rating = BattleSystem.rating;
                let message = '⚔️ 战斗胜利！\n\n';
                
                // 战斗评价
                if (rating) {
                    const ratingColors = { S: '🌟', A: '⭐', B: '✨', C: '👍', D: '💪' };
                    message += `${ratingColors[rating.level] || ''} 评价：${rating.level}级\n`;
                    message += `得分：${rating.score}分\n`;
                    // 评分详情
                    if (rating.details) {
                        const details = [];
                        if (rating.details.turnBonus) details.push(`回合${rating.details.turnBonus > 0 ? '+' : ''}${rating.details.turnBonus}`);
                        if (rating.details.hpBonus) details.push(`血量+${rating.details.hpBonus}`);
                        if (rating.details.itemPenalty) details.push(`道具${rating.details.itemPenalty}`);
                        if (rating.details.critBonus) details.push(`暴击+${rating.details.critBonus}`);
                        if (rating.details.interruptBonus) details.push(`打断+${rating.details.interruptBonus}`);
                        if (rating.details.noDamageBonus) details.push(`无伤+${rating.details.noDamageBonus}`);
                        if (rating.details.levelBonus) details.push(`等级差${rating.details.levelBonus > 0 ? '+' : ''}${rating.details.levelBonus}`);
                        if (details.length > 0) {
                            message += `(${details.join('，')})\n`;
                        }
                    }
                    message += '\n';
                }
                
                // 战斗统计
                message += '📊 战斗统计\n';
                message += `回合数：${BattleSystem.turn}\n`;
                message += `总伤害：${stats.totalDamageDealt || 0}\n`;
                message += `受到伤害：${stats.totalDamageTaken || 0}\n`;
                if (stats.totalHealingDone > 0) {
                    message += `治疗量：${stats.totalHealingDone}\n`;
                }
                if (stats.critCount > 0) {
                    message += `暴击次数：${stats.critCount}\n`;
                }
                if (stats.interruptCount > 0) {
                    message += `打断次数：${stats.interruptCount}\n`;
                }
                if (stats.missCount > 0) {
                    message += `闪避次数：${stats.missCount}\n`;
                }
                if (stats.skillsUsed > 0) {
                    message += `使用技能：${stats.skillsUsed}次\n`;
                }
                message += `\n`;
                
                // 奖励
                message += '🎁 奖励\n';
                message += `经验：+${rewards.exp}`;
                if (rewards.ratingBonus) message += ` (评价+${Math.floor(rewards.ratingBonus * 100)}%)`;
                message += '\n';
                message += `金币：+${rewards.gold}`;
                if (rewards.goldCrit) message += ' 💰暴击！';
                if (rewards.ratingBonus) message += ` (评价+${Math.floor(rewards.ratingBonus * 100)}%)`;
                message += '\n';
                if (rewards.items.length > 0) {
                    rewards.items.forEach(item => {
                        message += `${item.name}：x${item.count}\n`;
                    });
                }
                if (rewards.levelUps.length > 0) {
                    message += `\n🎉 升级了！当前等级 ${Player.level}\n`;
                    message += `获得 ${rewards.levelUps.length * 3} 属性点`;
                }
                
                UI.showMessage(message.trim());
                this.state = 'map';
                UI.renderMapScreen();
                Player.save();
                
            } else if (BattleSystem.result === 'lose') {
                // 检查是不是车轮战
                if (this.gauntletState) {
                    const totalWins = this.gauntletState.totalWins;
                    const totalExp = this.gauntletState.totalExp;
                    const totalGold = this.gauntletState.totalGold;
                    const totalItems = this.gauntletState.totalItems;
                    
                    // 清空车轮战状态
                    this.gauntletState = null;
                    
                    // 显示车轮战失败消息
                    let message = `💀 车轮战失败！\n\n`;
                    message += `连胜：${totalWins} 场\n\n`;
                    message += `🎁 已获得奖励\n`;
                    message += `经验：+${totalExp}\n`;
                    message += `金币：+${totalGold}\n`;
                    if (totalItems.length > 0) {
                        totalItems.forEach(item => {
                            message += `${item.name}：x${item.count}\n`;
                        });
                    }
                    
                    UI.showMessage(message.trim());
                    this.state = 'map';
                    UI.renderMapScreen();
                    Player.save();
                    return;
                }
                
                // 普通战斗失败 - 死亡惩罚
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
        try {
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
                            Inventory.addItem(item.itemId, item.count || 1);
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
        } catch (e) {
            console.error('[大事件] 出错:', e);
            UI.showMessage('大事件出错：' + e.message);
        }
    },

    // 关闭大事件界面
    closeScheduledEvent() {
        this.state = 'map';
        this.currentScheduledEvent = null;
        UI.renderMapScreen();
    },
    
    // 关闭大事件结局界面
    closeBigEventEnding() {
        // 清除大事件状态
        BigEventSystem.currentEvent = null;
        BigEventSystem.currentPhase = null;
        BigEventSystem.choiceHistory = [];
        BigEventSystem.saveState();
        
        this.state = 'map';
        UI.renderMapScreen();
    },

    // 关闭事件界面
    closeEvent() {
        this.state = 'map';
        this.currentEvent = null;
        UI.renderMapScreen();
    },

    // 选择事件选项
    selectEventChoice(choiceIndex) {
        try {
            const event = this.currentEvent;
            if (!event) {
                return;
            }
    
            const result = EventSystem.selectChoice(event.id, choiceIndex);
            
            if (result.success) {
                // 如果触发战斗
                if (result.effects.startBattle) {
                    const enemy = DataManager.getEnemy(result.effects.startBattle);
                    if (enemy) {
                        this.startBattle(enemy);
                        return;
                    }
                }
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
        } catch (e) {
            console.error('[事件] 选择选项出错:', e);
            UI.showMessage('事件处理出错：' + e.message);
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
        
        // 创建 NPC 选择弹窗的遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 99998;
            cursor: pointer;
        `;
        overlay.addEventListener('click', () => {
            overlay.remove();
            dialog.remove();
        });
        
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
            const availableQuests = QuestSystem.getAvailableQuestsForNPC(npc.id);
            const hasQuest = availableQuests.length > 0;
            
            if (canTalk) {
                return `
                    <div onclick="talkToNPC('${npc.id}')" style="
                        padding: 15px 20px;
                        background: rgba(40, 40, 80, 0.8);
                        border: 2px solid ${hasQuest ? '#ffcc00' : '#444477'};
                        border-radius: 10px;
                        color: #e0e0ff;
                        cursor: pointer;
                        text-align: left;
                        transition: all 0.3s;
                        font-size: 16px;
                        position: relative;
                    " onmouseover="this.style.borderColor='${hasQuest ? '#ffdd44' : '#7777bb'}'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='${hasQuest ? '#ffcc00' : '#444477'}'; this.style.background='rgba(40, 40, 80, 0.8)'">
                        <div style="font-weight: bold; font-size: 17px;">
                            ${npc.name}
                            ${hasQuest ? '<span style="color: #ffcc00; font-size: 20px; margin-left: 8px;">❗</span>' : ''}
                        </div>
                        <div style="font-size: 13px; color: #999; margin-top: 3px;">
                            ${npc.title || ''}
                            ${hasQuest ? '<span style="color: #ffcc00; margin-left: 8px;">有任务可接</span>' : ''}
                        </div>
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
                <div onclick="closeNpcSelectDialog()" style="
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
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        const closeDialog = () => {
            overlay.remove();
            dialog.remove();
        };
        
        window.closeNpcSelectDialog = closeDialog;
        
        window.talkToNPC = (npcId) => {
            closeDialog();
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
            <!-- 退出按钮 -->
            <div style="position: absolute; top: 20px; right: 20px; z-index: 10;">
                <div onclick="Game._closeDialogue()" style="
                    padding: 8px 20px;
                    background: rgba(60, 60, 100, 0.8);
                    border: 2px solid #7777aa;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(80, 80, 130, 0.9)'" onmouseout="this.style.background='rgba(60, 60, 100, 0.8)'">
                    ✕ 告辞
                </div>
            </div>
            
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
            if (result.success) {
                DailySystem.trackActivity('use_item', 1);
            }
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

    // 显示装备强化界面
    showEnhancePanel() {
        UI.showEnhancePanel();
    },

    // 强化装备
    enhanceEquipment(slot) {
        const result = Player.enhanceEquipment(slot);
        UI.showMessage(result.message);
        UI.showEnhancePanel();
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

    // ========== 妖魔图鉴 ==========
    openBestiary() {
        this.state = 'bestiary';
        UI.renderBestiary();
    },

    closeBestiary() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    // ========== 日常系统 ==========
    openDaily() {
        this.state = 'daily';
        UI.renderDaily();
    },

    closeDaily() {
        this.state = 'map';
        UI.renderMapScreen();
    },

    doSignIn() {
        const result = DailySystem.signIn();
        UI.showMessage(result.message + (result.extraMsg || '') + '\n' + result.rewards.join('\n'));
        UI.renderDaily();
    },

    claimDailyReward(questId) {
        const result = DailySystem.claimDailyReward(questId);
        if (result.success) {
            UI.showMessage(result.message + '\n' + result.rewards.join('\n'));
        } else {
            UI.showMessage(result.message);
        }
        UI.renderDaily();
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

    // ========== 元素觉醒 ==========
    showAwakenPanel() {
        if (!Player.canAwakenNewElement()) {
            UI.showMessage('你还未达到觉醒条件！');
            return;
        }

        const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'summon'];
        const availableElements = allElements.filter(e => !Player.elements.includes(e));
        const currentCount = Player.elements.length;
        const requiredLevel = currentCount === 1 ? 8 : 15;
        const rankName = requiredLevel >= 15 ? '高阶' : '中阶';

        let elementsHtml = availableElements.map(elem => {
            const color = SkillSystem.getElementColor(elem);
            const name = SkillSystem.getElementName(elem);
            const desc = this.getElementDescription(elem);
            return `
                <div onclick="Game.awakenElement('${elem}')" style="
                    padding: 20px;
                    background: ${color}15;
                    border: 2px solid ${color};
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 12px;
                " onmouseover="this.style.background='${color}33'" onmouseout="this.style.background='${color}15'">
                    <div style="font-size: 20px; font-weight: bold; color: ${color}; margin-bottom: 8px;">
                        ${name}
                    </div>
                    <div style="color: #ccc; font-size: 14px; line-height: 1.5;">
                        ${desc}
                    </div>
                </div>
            `;
        }).join('');

        UI.elements.gameContainer.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 32px; font-weight: bold; color: #ffd700; margin-bottom: 10px;">
                        ✨ 元素觉醒
                    </div>
                    <div style="color: #aaa; font-size: 16px;">
                        你已达到${rankName}境界，可以觉醒新的元素系
                    </div>
                    <div style="color: #888; font-size: 14px; margin-top: 8px;">
                        当前已觉醒: ${Player.elements.map(e => SkillSystem.getElementName(e)).join('、')}
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    ${elementsHtml}
                </div>
                <div onclick="Game.openCharacterPanel()" style="
                    text-align: center;
                    padding: 12px;
                    background: rgba(100, 100, 100, 0.3);
                    border-radius: 8px;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 16px;
                ">返回</div>
            </div>
        `;
    },

    getElementDescription(element) {
        const descs = {
            fire: '高爆发伤害，燃烧持续伤害，克制冰/风/植物系',
            ice: '冻结控制，防御加成，克制水/风系',
            thunder: '高暴击麻痹，感电组合反应，克制水/土系',
            earth: '护盾防御，减速控制，克制雷/火系',
            wind: '高速闪避，连击输出，克制土/雷系',
            water: '治疗恢复，湿润控制，克制火/土系',
            light: '净化增益，圣光裁决，克制暗影系',
            dark: '诅咒削弱，潜行爆发，克制光系',
            heal: '强力治疗，净化复苏，生存能力极强',
            summon: '召唤召唤兽协同作战，以多打少，战术灵活'
        };
        return descs[element] || '神秘的元素力量';
    },

    awakenElement(element) {
        const result = Player.awakenElement(element);
        if (!result.success) {
            UI.showMessage(result.message);
            return;
        }

        Player.save();

        let msg = result.message;
        if (result.unlockedSkills && result.unlockedSkills.length > 0) {
            const skillNames = result.unlockedSkills.map(id => SkillSystem.getSkill(id)?.name || id).join('、');
            msg += ` 解锁技能: ${skillNames}`;
        }

        UI.showMessage(msg);
        this.openCharacterPanel();
    },

    // ========== 境界突破 ==========
    showBreakthroughPanel() {
        if (typeof RealmSystem === 'undefined') {
            UI.showMessage('境界系统未加载！');
            return;
        }

        const checkResult = Player.canBreakthrough();
        const currentRealm = RealmSystem.getRealm(Player.realm || 'initial');
        const nextRealm = RealmSystem.getNextRealm(Player.realm || 'initial');
        const successRate = RealmSystem.calculateSuccessRate(Player);

        let contentHtml = '';

        if (!nextRealm) {
            // 已达最高境界
            contentHtml = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🌟</div>
                    <div style="font-size: 24px; color: #ffd700; margin-bottom: 10px;">已达最高境界</div>
                    <div style="color: #aaa; font-size: 16px;">
                        当前境界: ${currentRealm.name}魔法师
                    </div>
                </div>
            `;
        } else if (!checkResult.canBreakthrough) {
            // 不满足突破条件
            contentHtml = `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 36px; margin-bottom: 20px;">🔒</div>
                    <div style="font-size: 20px; color: #ff6666; margin-bottom: 15px;">暂无法突破</div>
                    <div style="color: #aaa; font-size: 14px; margin-bottom: 20px;">
                        ${checkResult.reason}
                    </div>
                    <div style="background: #222; padding: 15px; border-radius: 10px; text-align: left;">
                        <div style="color: #ffd700; font-size: 14px; margin-bottom: 10px;">突破条件：</div>
                        <div style="color: #ccc; font-size: 13px; line-height: 1.8;">
                            • 等级达到 ${RealmSystem.getBreakthroughRequirements(Player.realm || 'initial')?.requiredLevel || '?'} 级<br>
                            • 当前等级: ${Player.level} 级
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 可以突破
            const requirements = RealmSystem.getBreakthroughRequirements(Player.realm || 'initial');
            contentHtml = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 32px; font-weight: bold; color: #ffd700; margin-bottom: 10px;">
                        ⚡ 境界突破
                    </div>
                    <div style="color: #aaa; font-size: 16px; margin-bottom: 20px;">
                        ${currentRealm.name} → ${nextRealm.name}
                    </div>
                </div>

                <div style="background: #222; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 15px; font-weight: bold;">
                        突破效果
                    </div>
                    <div style="color: #ccc; font-size: 14px; line-height: 2;">
                        • 生命值上限 +${Math.floor(nextRealm.statBonus.maxHp * 100)}%<br>
                        • 魔法值上限 +${Math.floor(nextRealm.statBonus.maxMp * 100)}%<br>
                        • 攻击力 +${Math.floor(nextRealm.statBonus.attack * 100)}%<br>
                        • 防御力 +${Math.floor(nextRealm.statBonus.defense * 100)}%<br>
                        • 速度 +${Math.floor(nextRealm.statBonus.speed * 100)}%<br>
                        • 精神力 +${Math.floor(nextRealm.statBonus.spirit * 100)}%<br>
                        • 解锁 ${nextRealm.name}魔法<br>
                        ${nextRealm.unlocks.includes('second_awaken') ? '• 解锁第二次觉醒<br>' : ''}
                        ${nextRealm.unlocks.includes('mind_sense') ? '• 解锁意念感知<br>' : ''}
                    </div>
                </div>

                <div style="background: #222; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 15px; font-weight: bold;">
                        突破成功率
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="flex: 1; height: 20px; background: #333; border-radius: 10px; overflow: hidden;">
                            <div style="height: 100%; width: ${Math.floor(successRate * 100)}%; background: linear-gradient(90deg, #66ff66, #ffd700); border-radius: 10px;"></div>
                        </div>
                        <span style="color: #fff; font-size: 18px; font-weight: bold;">
                            ${Math.floor(successRate * 100)}%
                        </span>
                    </div>
                </div>

                <div onclick="Game.performBreakthrough()" style="
                    padding: 18px;
                    background: linear-gradient(135deg, #ff6600, #ff3300);
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    font-size: 20px;
                    font-weight: bold;
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(255, 102, 0, 0.4);
                    transition: all 0.2s;
                " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 6px 20px rgba(255, 102, 0, 0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(255, 102, 0, 0.4)'">
                    ⚡ 开始突破
                </div>
            `;
        }

        UI.elements.gameContainer.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto; padding: 30px 20px;">
                ${contentHtml}
                <div onclick="Game.openCharacterPanel()" style="
                    margin-top: 20px;
                    padding: 12px;
                    background: #333;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    color: #aaa;
                    font-size: 14px;
                " onmouseover="this.style.background='#444'" onmouseout="this.style.background='#333'">
                    返回角色面板
                </div>
            </div>
        `;
    },

    performBreakthrough() {
        if (typeof RealmSystem === 'undefined') {
            UI.showMessage('境界系统未加载！');
            return;
        }

        const result = Player.breakthrough();

        if (result.success) {
            Player.save();
            let msg = `🎉 ${result.message}\n\n属性提升：\nHP +${result.statGains.maxHp}\nMP +${result.statGains.maxMp}\n攻击 +${result.statGains.attack}\n防御 +${result.statGains.defense}`;
            
            if (result.unlockedSkills && result.unlockedSkills.length > 0) {
                const skillNames = result.unlockedSkills.map(id => SkillSystem.getSkill(id)?.name || id).join('、');
                msg += `\n\n解锁中阶魔法: ${skillNames}`;
            }
            
            UI.showMessage(msg);
            this.openCharacterPanel();
        } else {
            UI.showMessage(`💔 ${result.message}`);
            this.showBreakthroughPanel();
        }
    },

    // ========== 休息/睡觉 ==========
    rest() {
        const events = TimeSystem.restUntilMorning();
        Player.save();
        UI.renderMapScreen();
        // 根据恢复比例显示不同消息
        const fullRestEvent = events.find(e => e.type === 'full_rest');
        const ratio = fullRestEvent ? fullRestEvent.staminaRatio : 1.0;
        if (ratio >= 1.0) {
            UI.showMessage('休息了一晚，HP、MP 和体力完全恢复了！');
        } else {
            const percent = Math.floor(ratio * 100);
            UI.showMessage(`休息了一晚，HP、MP 和体力恢复了 ${percent}%\n（熬夜睡觉恢复效果较差）`);
        }
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
