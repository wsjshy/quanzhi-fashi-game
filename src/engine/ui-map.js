/**
 * UI 地图界面模块
 * 
 * 从ui.js拆分出的独立地图界面渲染模块
 * 包含：主地图界面（renderMapScreen）、可视化地图界面（renderMapView）
 */

/**
 * 渲染主地图界面（地点行动+角色状态+底部导航）
 * 绑定到UI对象调用：UIMap.renderMapScreen.call(UI)
 */
export function renderMapScreen() {
    // v0.9.4: 检查是否有待显示的每日总结
    if (Player._pendingDailySummary) {
        const stats = Player._pendingDailySummary;
        Player._pendingDailySummary = null;
        setTimeout(() => {
            if (typeof UI.showDailySummary === 'function') {
                UI.showDailySummary(stats);
            }
        }, 300);
    }

    // v0.42.0: 显示NPC日常消息
    if (Player._pendingNPCMessages && Player._pendingNPCMessages.length > 0) {
        const messages = Player._pendingNPCMessages;
        Player._pendingNPCMessages = null;
        setTimeout(() => {
            messages.forEach((msg, idx) => {
                setTimeout(() => {
                    if (typeof UI.showMessage === 'function') {
                        UI.showMessage(`📬 ${msg.text}`);
                    }
                }, idx * 1500);
            });
        }, 500);
    }

    // v1.8.2: 星尘魔器到期/即将到期提示
    if (Player._pendingStarDustExpire) {
        const msg = Player._pendingStarDustExpire;
        Player._pendingStarDustExpire = null;
        setTimeout(() => {
            if (typeof UI.showMessage === 'function') {
                UI.showMessage(`⏰ ${msg}`);
            }
        }, 800);
    }
    if (Player._pendingStarDustWarning) {
        const msg = Player._pendingStarDustWarning;
        Player._pendingStarDustWarning = null;
        setTimeout(() => {
            if (typeof UI.showMessage === 'function') {
                UI.showMessage(`⚠️ ${msg}`);
            }
        }, 1000);
    }
    
    const location = MapSystem.getCurrentLocation();
    const stats = Player.getTotalStats();
    const isPortrait = UI.isPortrait();
    
    // 根据地点选择背景图片
    let bgImage = '';
    const locId = location?.id || '';
    if (locId === 'bo_city_street') {
        bgImage = 'assets/images/backgrounds/bo_city_view.jpg';
    }
    
    // v0.92.9: 强制恢复点击，防止全局点击拦截器导致界面无法点击
    this._restoreClicks();

    // v0.93.0: clean up residual talent selection dialogs/overlays
    document.getElementById('talent-selection-dialog')?.remove();
    document.getElementById('talent-selection-overlay')?.remove();

    this.elements.gameContainer.innerHTML = `
        <div style="width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: ${location?.backgroundColor || '#1a1a3a'}; position: relative; padding-bottom: 110px; overflow-x: hidden; pointer-events: auto; z-index: 1;">
            
            <!-- 背景图片 -->
            ${bgImage ? `
            <div style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: url('${bgImage}') center/cover;
                opacity: 0.1;
                filter: blur(2px);
                z-index: 0;
                pointer-events: none;
            "></div>
            ` : ''}
            
            <!-- 顶部状态栏 -->
            <div class="mobile-top-bar" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.5);
                border-bottom: 2px solid #444477;
                flex-wrap: wrap;
                gap: 8px;
            ">
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <div style="color: #aaa; font-size: 14px;">📅 ${TimeSystem.getDateString()} ${TimeSystem.getDayOfWeekName()} ${TimeSystem.getCurrentPeriodInfo().icon} ${TimeSystem.formatHour()}</div>
                    ${(() => {
                        const fatigue = Player.fatigueLevel || 0;
                        if (fatigue >= 2) return `<div style="color: #ff4444; font-size: 12px; background: rgba(120,20,20,0.6); padding: 3px 10px; border-radius: 8px; border: 1px solid #ff4444;" title="重伤：攻击-30%防御-15%">⚠️ 重伤</div>`;
                        if (fatigue === 1) return `<div style="color: #ffaa44; font-size: 12px; background: rgba(100,60,20,0.5); padding: 3px 10px; border-radius: 8px; border: 1px solid #ffaa44;" title="疲劳：攻击-15%">😓 疲劳</div>`;
                        return '';
                    })()}
                    ${TimeSystem.isNight() ? `<div style="color: #ff9966; font-size: 12px; background: rgba(100,50,50,0.5); padding: 3px 10px; border-radius: 8px;">🌙 夜晚敌人更强 +30%</div>` : ''}
                </div>
                <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                    <span style="color: #ffd700; font-size: 15px; font-weight: bold;">💰 ${Player.gold}</span>
                    <div style="display: flex; align-items: center; gap: 5px;" title="HP: ${Player.hp}/${Player.maxHp}">
                        <span style="font-size: 14px;">❤️</span>
                        <div style="width: 80px; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,100,100,0.3);">
                            <div style="height: 100%; width: ${(Player.hp / Player.maxHp * 100).toFixed(0)}%; background: ${Player.hp / Player.maxHp > 0.5 ? 'linear-gradient(90deg, #ff4444, #ff6666)' : Player.hp / Player.maxHp > 0.25 ? 'linear-gradient(90deg, #ff8800, #ffaa44)' : 'linear-gradient(90deg, #ff0000, #ff2222); animation: pulse 1s infinite;'}; transition: width 0.3s;"></div>
                        </div>
                        <span style="color: #ff8888; font-size: 12px; min-width: 50px;">${Player.hp}/${Player.maxHp}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;" title="MP: ${Player.mp}/${Player.maxMp}">
                        <span style="font-size: 14px;">💧</span>
                        <div style="width: 80px; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; border: 1px solid rgba(100,150,255,0.3);">
                            <div style="height: 100%; width: ${(Player.mp / Player.maxMp * 100).toFixed(0)}%; background: ${Player.mp / Player.maxMp > 0.3 ? 'linear-gradient(90deg, #4466ff, #6688ff)' : 'linear-gradient(90deg, #ff8800, #ffaa44)'}; transition: width 0.3s;"></div>
                        </div>
                        <span style="color: #88aaff; font-size: 12px; min-width: 50px;">${Player.mp}/${Player.maxMp}</span>
                    </div>
                    <span style="color: #888; font-size: 11px; opacity: 0.6;" title="全职法师网页游戏 当前版本">v3.2.0</span>
                    ${(() => {
                        const da = Player.dailyActions || { cultivate: 0, study: 0, hunt: 0 };
                        const getEffLabel = (count) => {
                            if (count < 1) return { text: '高效', color: '#88ff88' };
                            if (count < 3) return { text: '70%', color: '#ffcc66' };
                            return { text: '50%', color: '#ff8866' };
                        };
                        const c = getEffLabel(da.cultivate);
                        const s = getEffLabel(da.study);
                        const h = getEffLabel(da.hunt);
                        const anyReduced = da.cultivate >= 1 || da.study >= 1 || da.hunt >= 1;
                        return `
                            <span style="font-size: 11px; ${anyReduced ? 'background: rgba(255,150,50,0.15); padding: 3px 8px; border-radius: 8px; border: 1px solid rgba(255,150,50,0.3);' : ''}" 
                                title="每日首次修炼/学习/猎魔100%收益，第2-3次70%，第4次后50%。探索完全自由，无次数限制。">
                                📊 
                                <span style="color:${c.color};">修${da.cultivate}(${c.text})</span>
                                <span style="color:${s.color};">学${da.study}(${s.text})</span>
                                <span style="color:${h.color};">猎${da.hunt}(${h.text})</span>
                            </span>
                        `;
                    })()}
                    <span style="color: #aaffaa; font-size: 15px; font-weight: bold;">Lv.${Player.level}</span>
                </div>
            </div>
            
            <!-- 任务追踪面板 -->
            <div class="mobile-goal-bar" onclick="UI.toggleQuestTracker()" style="
                padding: 10px 25px;
                background: linear-gradient(90deg, rgba(100, 80, 30, 0.6), rgba(80, 60, 20, 0.4));
                border-bottom: 1px solid #887744;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                z-index: 1;
                cursor: pointer;
                user-select: none;
            ">
                <span style="color: #ffd700; font-size: 16px; margin-top: 2px;">📋</span>
                <div style="flex: 1;">
                    <div style="color: #ffeeaa; font-size: 14px; line-height: 1.5;">
                        ${this.getCurrentGoalText()}
                    </div>
                    ${this.questTrackerExpanded && QuestSystem.activeQuests && QuestSystem.activeQuests.length > 0 ? `
                        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                            ${QuestSystem.activeQuests.slice(0, 5).map(activeQuest => {
                                const quest = QuestSystem.getQuest(activeQuest.questId);
                                if (!quest) return '';
                                const firstObjective = quest.objectives[0];
                                const current = activeQuest.progress[0] || 0;
                                const total = firstObjective?.count || 1;
                                const percent = Math.min(100, (current / total) * 100);
                                const done = current >= total;
                                return `
                                    <div onclick="event.stopPropagation(); Game.openQuestLog()" style="
                                        padding: 8px 12px;
                                        background: rgba(0, 0, 0, 0.3);
                                        border-radius: 6px;
                                        border: 1px solid ${done ? '#66ff66' : '#887744'};
                                        cursor: pointer;
                                    ">
                                        <div style="font-size: 13px; color: ${done ? '#66ff66' : '#ffeeaa'}; margin-bottom: 4px; font-weight: bold;">
                                            ${done ? '✅' : '📌'} ${quest.name}
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="flex: 1; height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                                                <div style="height: 100%; width: ${percent}%; background: ${done ? 'linear-gradient(90deg, #44ff44, #66ff66)' : 'linear-gradient(90deg, #ffaa44, #ffd700)'}; transition: width 0.3s;"></div>
                                            </div>
                                            <span style="font-size: 11px; color: #aaa;">${current}/${total}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                            ${QuestSystem.activeQuests.length > 5 ? `
                                <div style="font-size: 12px; color: #888; text-align: center;">还有 ${QuestSystem.activeQuests.length - 5} 个任务...</div>
                            ` : ''}
                            <div style="font-size: 12px; color: #888; text-align: center; margin-top: 4px;">点击查看全部任务 →</div>
                        </div>
                    ` : ''}
                </div>
                <span style="color: #ffd700; font-size: 12px; margin-top: 4px;">
                    ${this.questTrackerExpanded ? '▲' : '▼'}
                </span>
            </div>
            
            <!-- 主内容区 -->
            <div class="mobile-main-content" style="flex: 1; display: flex; position: relative; z-index: 1; min-width: 0; overflow-x: hidden;">
                
                <!-- 左侧：地点行动 -->
                <div class="mobile-action-panel" style="flex: ${isPortrait ? '1 !important' : '2'}; width: ${isPortrait ? '100% !important' : 'auto'}; min-width: 0; overflow: hidden; padding: ${isPortrait ? '12px 15px' : '20px 30px'};">
                    <!-- 地点信息卡 -->
                    ${(() => {
                        const enemies = (typeof MapSystem.getLocationEnemies === 'function') ? MapSystem.getLocationEnemies(location?.id) : [];
                        const npcCount = (location?.npcs || []).length;
                        const featureTags = {
                            tianlan_school: '学习中心', city_street: '商业街',
                            xuefeng_mountain: '狩猎场', xuefeng_deep: '危险狩猎区',
                            baicao_valley: '采药历练', earth_spring: '修炼圣地',
                            mu_manor: '家族领地', xuefeng_station: '猎者补给',
                            old_banyan_district: '旧城探索', mingwen_girls_school: '女校剧情',
                            mo_fan_house: '民居', bo_north_gate: '城防关口',
                            three_step_tower: '修炼塔'
                        };
                        const tag = featureTags[location?.id] || '探索区域';
                        let safetyLevel = '安全', safetyColor = '#66ff66';
                        if (enemies.length > 0) {
                            const maxLevel = Math.max(...enemies.map(e => e.level || 1));
                            if (maxLevel >= Player.level + 5) { safetyLevel = '极危险'; safetyColor = '#ff4444'; }
                            else if (maxLevel >= Player.level) { safetyLevel = '危险'; safetyColor = '#ff8844'; }
                            else { safetyLevel = '有妖魔'; safetyColor = '#ffcc44'; }
                        }
                        const enemyIcons = enemies.slice(0, 6).map(e =>
                            `<span title="${e.name} Lv.${e.level}" style="font-size: 18px;">${e.icon || '👹'}</span>`
                        ).join('');
                        return `
                            <div style="margin-bottom: 18px; padding: 16px 20px; background: linear-gradient(135deg, rgba(40, 40, 70, 0.7), rgba(60, 50, 90, 0.5)); border: 1px solid #555588; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.3);">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <span style="color: #ffd700; font-size: 20px; font-weight: bold;">${location?.mapIcon || '📍'} ${location?.name || '未知地点'}</span>
                                        ${(() => {
                                            if (typeof DataMaps !== 'undefined') {
                                                for (const mapId in DataMaps) {
                                                    const map = DataMaps[mapId];
                                                    if (map.allLocations && map.allLocations.includes(location?.id)) {
                                                        return `<span style="font-size: 12px; color: #88ccff; margin-left: 10px; background: rgba(30, 50, 80, 0.6); padding: 2px 10px; border-radius: 6px; border: 1px solid #5588aa;">${map.icon} ${map.name}</span>`;
                                                    }
                                                }
                                            }
                                            return '';
                                        })()}
                                        <span style="font-size: 12px; color: #aaccff; margin-left: 10px; background: rgba(50, 70, 100, 0.6); padding: 3px 10px; border-radius: 8px; border: 1px solid #5577aa;">${tag}</span>
                                    </div>
                                    <span style="font-size: 12px; color: ${safetyColor}; background: rgba(0,0,0,0.3); padding: 3px 10px; border-radius: 8px; border: 1px solid ${safetyColor};">${safetyLevel}</span>
                                </div>
                                <div style="color: #bbb; font-size: 13px; line-height: 1.6; margin-bottom: 10px;">${location?.description || ''}</div>
                                <div style="display: flex; gap: 20px; align-items: center; font-size: 12px; color: #999;">
                                    ${enemies.length > 0 ? `<span>⚔️ 妖魔: ${enemyIcons}${enemies.length > 6 ? ` +${enemies.length - 6}` : ''}</span>` : '<span>🛡️ 无妖魔</span>'}
                                    ${npcCount > 0 ? `<span>👥 NPC: ${npcCount}人</span>` : ''}
                                </div>
                            </div>
                        `;
                    })()}
                    <h3 style="color: #ffd700; margin-bottom: 15px; font-size: 20px;">📍 可执行的行动</h3>
                    <!-- 体力低/疲劳建议休息提示 -->
                    ${(() => {
                        const staminaRatio = Player.stamina / (Player.maxStamina || 100);
                        const fatigue = Player.fatigueLevel || 0;
                        if (fatigue >= 2) {
                            return `<div onclick="Game.quickRestFull()" style="margin-bottom: 15px; padding: 15px; background: rgba(120, 20, 20, 0.6); border: 2px solid #ff4444; border-radius: 10px; cursor: pointer; animation: pulse 1.5s infinite;" title="点击快速休息">
                                <div style="color: #ff6666; font-size: 16px; font-weight: bold;">⚠️ 重伤状态！攻击-30%，防御-15%</div>
                                <div style="color: #ffaaaa; font-size: 13px; margin-top: 5px;">建议立即休息恢复状态（点击此处快速休息）</div>
                            </div>`;
                        } else if (fatigue === 1) {
                            return `<div onclick="Game.quickRest()" style="margin-bottom: 15px; padding: 12px; background: rgba(100, 60, 20, 0.5); border: 1px solid #ffaa44; border-radius: 8px; cursor: pointer;" title="点击原地休息">
                                <div style="color: #ffcc66; font-size: 14px;">😓 疲劳状态！攻击-15%，建议休息恢复</div>
                            </div>`;
                        } else if (staminaRatio < 0.3) {
                            return `<div onclick="Game.quickRest()" style="margin-bottom: 15px; padding: 12px; background: rgba(80, 50, 20, 0.4); border: 1px solid #ff8844; border-radius: 8px; cursor: pointer;" title="点击原地休息">
                                <div style="color: #ffaa66; font-size: 14px;">⚡ 体力较低，修炼和战斗效率下降，建议休息</div>
                            </div>`;
                        }
                        return '';
                    })()}
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${(() => {
                            const actions = location?.actions || [];
                            const getActionType = (action) => {
                                const id = action.id || '';
                                if (['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full'].includes(id)) return 'rest';
                                if (action.isClassAction || id.includes('study') || id.includes('train') || id.includes('meditation') || id.includes('cultivation') || id.includes('practice') || id.includes('attend')) return 'cultivation';
                                if (id.includes('chat') || id.includes('talk') || id.includes('interact') || id.includes('visit')) return 'social';
                                if (id.includes('explore') || id.includes('hunt') || id.includes('gather') || id.includes('investigate') || id.includes('search')) return 'explore';
                                return 'special';
                            };
                            const typeConfig = {
                                cultivation: { label: '🔮 修炼', color: '#aa88ff' },
                                explore: { label: '🔍 探索', color: '#88ccff' },
                                social: { label: '💬 社交', color: '#88ffaa' },
                                rest: { label: '😴 休息', color: '#ffaa88' },
                                special: { label: '✨ 特殊', color: '#ffdd66' }
                            };
                            const skipActions = ['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full', 'rest_at_mo_fan'];
                            const renderAction = (action, type) => {
                                let actionName = action.name;
                                let actionDesc = action.description;
                                let expReward = action.effects?.exp || 0;
                                let isSkippingClass = false;
                                let isRecommended = false;
                                let recommendReason = '';
                                const isExplorableAction = !skipActions.includes(action.id);
                                const isActionExplored = isExplorableAction && Player.exploredActions?.[location?.id]?.includes(action.id);
                                if (action.isClassAction) {
                                    const currentClass = TimeSystem.getCurrentClass(location);
                                    if (currentClass) {
                                        const teacher = DataManager.getCharacter(currentClass.teacher);
                                        actionName = `上课：${currentClass.name}`;
                                        actionDesc = `${teacher?.name || '未知老师'}主讲，获得${currentClass.exp}经验${currentClass.injuryChance ? '，有受伤风险' : ''}`;
                                        expReward = currentClass.exp;
                                    } else {
                                        actionName = '自习';
                                        actionDesc = '当前没有课程，自由自习获得少量经验';
                                        expReward = action.effects?.exp || 5;
                                    }
                                } else {
                                    const currentClass = TimeSystem.getCurrentClass(location);
                                    if (currentClass && action.id !== 'sleep' && action.id !== 'rest') {
                                        isSkippingClass = true;
                                    }
                                }
                                if (action.eventChance && action.eventChance > 0) {
                                    const availableEvents = (action.events || []).filter(e => {
                                        if (typeof WorldState !== 'undefined' && WorldState.checkConditions) {
                                            return WorldState.checkConditions({eventId: e});
                                        }
                                        return true;
                                    });
                                    if (availableEvents.length > 0 && !isRecommended) {
                                        isRecommended = true;
                                        recommendReason = '有事件可触发';
                                    }
                                }
                                const typeColors = {
                                    cultivation: { bg: 'linear-gradient(135deg, rgba(60,40,100,0.85), rgba(80,50,140,0.7))', border: '#7755bb' },
                                    explore: { bg: 'linear-gradient(135deg, rgba(30,60,90,0.85), rgba(40,80,130,0.7))', border: '#4477aa' },
                                    social: { bg: 'linear-gradient(135deg, rgba(30,80,50,0.85), rgba(40,110,70,0.7))', border: '#44aa66' },
                                    rest: { bg: 'linear-gradient(135deg, rgba(90,60,30,0.85), rgba(130,80,40,0.7))', border: '#aa7744' },
                                    special: { bg: 'linear-gradient(135deg, rgba(90,80,30,0.85), rgba(130,110,40,0.7))', border: '#aa9944' }
                                };
                                const colors = typeColors[type] || typeColors.special;
                                let borderColor = isRecommended ? '#ffcc44' : colors.border;
                                let glowEffect = isRecommended ? 'box-shadow: 0 0 10px rgba(255,204,68,0.5);' : '';
                                let tooltipText = actionDesc;
                                if (expReward) tooltipText += ` | 经验+${expReward}`;
                                if (isRecommended) tooltipText += ` | ${recommendReason}`;
                                return `
                                <button class="action-button" onclick="Game.performAction('${action.id}')" title="${tooltipText}" style="
                                    padding: 12px 14px;
                                    background: ${colors.bg};
                                    border: 2px solid ${borderColor};
                                    border-radius: 12px;
                                    color: #e0e0ff;
                                    cursor: pointer;
                                    text-align: left;
                                    transition: all 0.2s;
                                    font-size: 15px;
                                    ${glowEffect}
                                    position: relative;
                                    min-width: 0;
                                    width: 100%;
                                    overflow: hidden;
                                " onmouseover="this.style.borderColor='${isRecommended ? '#ffee88' : '#9999cc'}'; this.style.transform='scale(1.02)'" onmouseout="this.style.borderColor='${borderColor}'; this.style.transform='scale(1)'">
                                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; min-width: 0;">
                                        <span style="font-size: 18px;">${action.icon || '🔹'}</span>
                                        <span style="flex: 1; font-weight: bold; font-size: 14px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${actionName}</span>
                                        ${isRecommended ? '<span style="font-size: 12px;">📜</span>' : ''}
                                        <span style="font-size: 11px; color: #aaddff; white-space: nowrap;">⏱️${action.timeCost}h</span>
                                    </div>
                                    <div style="font-size: 11px; color: #aabbdd; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                        ${actionDesc}${expReward ? ` <span style="color:#ffd700;">✨+${expReward}</span>` : ''}
                                    </div>
                                </button>`;
                            };
                            const groups = { cultivation: [], explore: [], social: [], rest: [], special: [] };
                            actions.filter(a => !skipActions.includes(a.id)).forEach(a => { groups[getActionType(a)].push(a); });
                            return Object.keys(groups).filter(type => groups[type].length > 0).map(type => {
                                const cfg = typeConfig[type];
                                return `
                                    <div style="margin-top: ${type === Object.keys(groups).find(t => groups[t].length > 0) ? '0' : '10px'};">
                                        <div style="color: ${cfg.color}; font-size: 12px; font-weight: bold; margin-bottom: 5px;">${cfg.label}</div>
                                        <div style="display: grid; grid-template-columns: ${isPortrait ? '1fr' : '1fr 1fr'}; gap: 8px; min-width: 0;">
                                            ${groups[type].map(a => renderAction(a, type)).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('');
                        })()}

                            ${(() => {
                                const spots = Player.discoveredHiddenSpots || [];
                                const availableSpots = spots.filter(s => s.usesRemaining > 0);
                                if (availableSpots.length === 0) return '';
                                return availableSpots.map(spot => `
                                    <button class="action-button" onclick="Game.cultivateAtHiddenSpot('${spot.id}')" style="
                                        padding: 18px 25px;
                                        background: linear-gradient(135deg, rgba(60, 40, 80, 0.8), rgba(80, 60, 120, 0.8));
                                        border: 2px solid #9966cc;
                                        border-radius: 10px;
                                        color: #e0d0ff;
                                        cursor: pointer;
                                        text-align: left;
                                        transition: all 0.3s;
                                        font-size: 16px;
                                        box-shadow: 0 0 8px rgba(153, 102, 204, 0.3);
                                    " onmouseover="this.style.borderColor='#bb88ee'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#9966cc'; this.style.transform='translateX(0)'">
                                        <div style="font-size: 18px; margin-bottom: 5px;">
                                            🔮 ${spot.name}
                                            <span style="font-size: 12px; color: #cc99ff; float: right;">隐秘修炼 · 剩余${spot.usesRemaining}次</span>
                                        </div>
                                        <div style="font-size: 13px; color: #aa88cc;">${spot.desc} · 经验+${Math.round(spot.expBonus * 100)}%</div>
                                    </button>
                                `).join('');
                            })()}
                        </div>
                        
                        <!-- 再次挑战 -->
                        ${Game.lastBattle ? `
                        <button onclick="Game.rematch()" style="
                            margin-top: 15px;
                            width: 100%;
                            padding: 15px 25px;
                            background: linear-gradient(135deg, rgba(120, 40, 40, 0.8), rgba(160, 60, 60, 0.8));
                            border: 2px solid #aa4444;
                            border-radius: 10px;
                            color: #ffdddd;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 16px;
                        " onmouseover="this.style.borderColor='#ff6666'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#aa4444'; this.style.transform='translateX(0)'">
                            <div style="font-size: 18px; margin-bottom: 5px;">
                                ⚔️ 再次挑战：${Game.lastBattle.enemy.name || '未知敌人'}
                            </div>
                            <div style="font-size: 13px; color: #cc9999;">重新挑战上一次的敌人</div>
                        </button>
                        ` : ''}

                        <!-- 休息 -->
                        <button onclick="Game.showRestMenu()" style="
                            margin-top: 15px;
                            width: 100%;
                            padding: 15px 25px;
                            background: linear-gradient(135deg, rgba(40, 60, 80, 0.8), rgba(60, 80, 120, 0.8));
                            border: 2px solid #5577aa;
                            border-radius: 10px;
                            color: #ccddff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 16px;
                            position: relative;
                            z-index: 2000;
                        " onmouseover="this.style.borderColor='#7799cc'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#5577aa'; this.style.transform='translateX(0)'">
                            <div style="font-size: 18px; margin-bottom: 5px;">
                                😴 休息
                                <span style="font-size: 12px; color: #aabbdd; float: right;">选择休息方式 →</span>
                            </div>
                            <div style="font-size: 13px; color: #8899bb;">原地休息 / 充分休息（自动计时）</div>
                        </button>

                        <!-- 一键恢复 -->
                        ${(() => {
                            const hpRatio = Player.hp / Player.maxHp;
                            const mpRatio = Player.mp / Player.maxMp;
                            if (hpRatio < 0.8 || mpRatio < 0.8) {
                                return `
                                <button onclick="Game.quickHeal()" style="
                                    margin-top: 10px;
                                    width: 100%;
                                    padding: 15px 25px;
                                    background: linear-gradient(135deg, rgba(80, 60, 20, 0.8), rgba(140, 100, 40, 0.8));
                                    border: 2px solid #aa8833;
                                    border-radius: 10px;
                                    color: #ffeecc;
                                    cursor: pointer;
                                    text-align: left;
                                    transition: all 0.3s;
                                    font-size: 16px;
                                    animation: pulse 2s infinite;
                                " onmouseover="this.style.borderColor='#ccaa55'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#aa8833'; this.style.transform='translateX(0)'">
                                    <div style="font-size: 18px; margin-bottom: 5px;">
                                        💊 一键恢复
                                        <span style="font-size: 12px; color: #ffaa66; float: right;">不耗时间</span>
                                    </div>
                                    <div style="font-size: 13px; color: #ddbb88;">自动使用背包中的恢复药品，优先使用小药品避免浪费</div>
                                </button>
                                `;
                            }
                            return '';
                        })()}

                        <!-- 事件与情报 -->
                        <button onclick="Game.showEventsAndIntel()" style="
                            margin-top: 10px;
                            width: 100%;
                            padding: 12px 20px;
                            background: linear-gradient(135deg, rgba(80, 60, 20, 0.8), rgba(120, 90, 30, 0.8));
                            border: 2px solid #aa8833;
                            border-radius: 8px;
                            color: #ffdd99;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 15px;
                            position: relative;
                            z-index: 2000;
                        " onmouseover="this.style.borderColor='#ddbb55'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#aa8833'; this.style.transform='translateX(0)'">
                            <div style="font-size: 16px;">
                                📜 事件与情报
                                <span style="font-size: 12px; color: #ffaa44; float: right;" id="event-count-badge"></span>
                            </div>
                            <div style="font-size: 12px; color: #bb9966;">查看可触发事件与收集的情报</div>
                        </button>
                    </div>
                    
                    <!-- 右侧：角色状态面板 -->
                    <div class="mobile-side-menu" style="width: 340px; background: linear-gradient(180deg, rgba(20,20,50,0.85), rgba(10,10,30,0.9)); border-left: 2px solid #444477; padding: 18px; display: ${isPortrait ? 'none !important' : 'block'}; overflow-y: auto; max-height: calc(100vh - 180px);">
                        ${(() => {
                            const s = stats;
                            const hpPct = Math.min(100, (Player.hp / s.maxHp * 100)).toFixed(0);
                            const mpPct = Math.min(100, (Player.mp / s.maxMp * 100)).toFixed(0);
                            const staPct = Math.min(100, (Player.stamina / s.maxStamina * 100)).toFixed(0);
                            const expPct = Math.min(100, (Player.exp / Player.expToNext * 100)).toFixed(1);
                            const equip = (typeof Inventory !== 'undefined' && Inventory.getEquipment) ? Inventory.getEquipment() : {weapon:null, armor:null, accessory:null};
                            const slotNames = {weapon:'⚔️ 武器', armor:'🛡️ 防具', accessory:'💍 饰品'};
                            const slotColors = {weapon:'#ffaa66', armor:'#66aaff', accessory:'#ff88dd'};
                            return `
                            <div style="text-align:center; margin-bottom:15px; padding-bottom:12px; border-bottom:1px solid rgba(100,100,150,0.3);">
                                <div style="font-size:22px; font-weight:bold; color:#ffd700; margin-bottom:4px;">🧙 ${typeof RealmSystem !== 'undefined' ? RealmSystem.getRealm(Player.realm || 'initial').name : '初阶'}魔法师</div>
                                <div style="font-size:13px; color:#aabbdd;">等级 ${Player.level} · ${Player.elements.length}系法师</div>
                                ${(() => {
                                    const playerLevel = Player.level || 1;
                                    const playerTier = playerLevel >= 56 ? '超阶' : playerLevel >= 31 ? '高阶' : playerLevel >= 11 ? '中阶' : '初阶';
                                    const tierColor = { '初阶': '#99cc99', '中阶': '#66ccff', '高阶': '#ff9966', '超阶': '#ff66ff' };
                                    const canCast = { '初阶': true, '中阶': playerLevel >= 11, '高阶': playerLevel >= 31, '超阶': playerLevel >= 56 };
                                    const reductionMap = {
                                        "初阶": { "初阶": 0, "中阶": null, "高阶": null, "超阶": null },
                                        "中阶": { "初阶": 0.15, "中阶": 0, "高阶": null, "超阶": null },
                                        "高阶": { "初阶": 0.30, "中阶": 0.15, "高阶": 0, "超阶": null },
                                        "超阶": { "初阶": 0.45, "中阶": 0.30, "高阶": 0.15, "超阶": 0 }
                                    };
                                    return `
                                    <div style="margin-top:10px; padding:8px; background:rgba(60,60,100,0.3); border-radius:8px; border:1px solid ${tierColor[playerTier]}44;">
                                        <div style="font-size:11px; color:${tierColor[playerTier]}; font-weight:bold; margin-bottom:5px;">🔮 施法掌控（${playerTier}）</div>
                                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px; font-size:10px;">
                                            ${['初阶','中阶','高阶','超阶'].map(tier => {
                                                const can = canCast[tier];
                                                const red = reductionMap[playerTier]?.[tier];
                                                const redStr = red === null ? '—' : red === 0 ? '0%' : `-${(red*100).toFixed(0)}%`;
                                                return `<div style="color:${can ? '#aaccff' : '#666'}; ${can ? '' : 'text-decoration:line-through;'}">${tier}${can ? '' : '(未解锁)'} <span style="color:${can ? '#88ff88' : '#666'};float:right;">${redStr}</span></div>`;
                                            }).join('')}
                                        </div>
                                        <div style="font-size:9px; color:#8899bb; margin-top:4px;">境界越高，对低阶魔法掌控越强，打断概率越低</div>
                                    </div>`;
                                })()}
                            </div>
                            
                            <div style="margin-bottom:14px;">
                                <div style="display:flex; justify-content:space-between; font-size:11px; color:#8899bb; margin-bottom:3px;">
                                    <span>经验</span><span>${Player.exp}/${Player.expToNext}</span>
                                </div>
                                <div style="height:6px; background:#222244; border-radius:3px; overflow:hidden;">
                                    <div style="height:100%; width:${expPct}%; background:linear-gradient(90deg,#ffd700,#ffee88); transition:width 0.3s;"></div>
                                </div>
                            </div>
                            
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#ff8888; margin-bottom:2px;">
                                        <span>❤️ 生命</span><span>${Player.hp}/${s.maxHp}</span>
                                    </div>
                                    <div style="height:8px; background:#331111; border-radius:4px; overflow:hidden;">
                                        <div style="height:100%; width:${hpPct}%; background:linear-gradient(90deg,#ff4444,#ff8888); transition:width 0.3s;"></div>
                                    </div>
                                </div>
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:11px; color:#88aaff; margin-bottom:2px;">
                                        <span>💧 法力</span><span>${Player.mp}/${s.maxMp}</span>
                                    </div>
                                    <div style="height:8px; background:#112244; border-radius:4px; overflow:hidden;">
                                        <div style="height:100%; width:${mpPct}%; background:linear-gradient(90deg,#4488ff,#88bbff); transition:width 0.3s;"></div>
                                    </div>
                                </div>
                                <div style="background:rgba(100,100,150,0.1); border-radius:6px; padding:8px; margin-top:4px;">
                                    <div style="font-size:11px; color:#8899bb; margin-bottom:6px;">📊 今日行动</div>
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; color:#aaccff;">
                                        <span>修炼: ${Player.dailyActions?.cultivate || 0}/1 ${(Player.dailyActions?.cultivate || 0) >= 1 ? '⚠️效率↓' : '✅高效'}</span>
                                        <span>学习: ${Player.dailyActions?.study || 0}/1 ${(Player.dailyActions?.study || 0) >= 1 ? '⚠️效率↓' : '✅高效'}</span>
                                        <span>猎魔: ${Player.dailyActions?.hunt || 0}/1 ${(Player.dailyActions?.hunt || 0) >= 1 ? '⚠️奖励↓' : '✅满奖'}</span>
                                        <span>探索: ${Player.dailyActions?.explore || 0}/1 ${(Player.dailyActions?.explore || 0) >= 1 ? '⚠️事件↓' : '✅有事件'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:16px; padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(80,80,120,0.3);">
                                <div style="font-size:12px; color:#ccc;"><span style="color:#ff9966;">⚔️</span> 攻击 <b style="color:#fff; float:right;">${s.attack}</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#6699ff;">🛡️</span> 防御 <b style="color:#fff; float:right;">${s.defense}</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#aaffaa;">💨</span> 速度 <b style="color:#fff; float:right;">${s.speed}</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#ffff66;">🎯</span> 命中 <b style="color:#fff; float:right;">${(s.hitRate*100).toFixed(0)}%</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#ff66ff;">💥</span> 暴击 <b style="color:#fff; float:right;">${(s.critRate*100).toFixed(0)}%</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#66ffff;">🔮</span> 魔攻 <b style="color:#fff; float:right;">${s.magicAttack || s.attack}</b></div>
                            </div>
                            
                            <div style="margin-bottom:16px;">
                                <div style="font-size:12px; color:#8899bb; margin-bottom:8px; font-weight:bold;">📦 已装备</div>
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    ${['weapon','armor','accessory'].map(slot => {
                                        const item = equip[slot];
                                        if (item) {
                                            return `<div style="padding:8px 10px; background:rgba(40,40,70,0.6); border:1px solid ${slotColors[slot]}55; border-radius:8px; display:flex; align-items:center; gap:8px;">
                                                <span style="font-size:16px;">${slotNames[slot].split(' ')[0]}</span>
                                                <div style="flex:1; min-width:0;">
                                                    <div style="font-size:12px; color:${slotColors[slot]}; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.name}</div>
                                                    <div style="font-size:10px; color:#888;">${item.rarity || '普通'}${item.attack ? ` · 攻+${item.attack}` : ''}${item.defense ? ` · 防+${item.defense}` : ''}</div>
                                                </div>
                                            </div>`;
                                        }
                                        return `<div style="padding:8px 10px; background:rgba(30,30,50,0.4); border:1px dashed #555; border-radius:8px; display:flex; align-items:center; gap:8px; opacity:0.5;">
                                            <span style="font-size:16px;">${slotNames[slot].split(' ')[0]}</span>
                                            <span style="font-size:12px; color:#666;">${slotNames[slot].split(' ')[1]}（未装备）</span>
                                        </div>`;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div style="margin-bottom:16px;">
                                <div style="font-size:12px; color:#8899bb; margin-bottom:8px; font-weight:bold;">✨ 已觉醒元素</div>
                                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                                    ${Player.elements.map(elem => `<span style="padding:3px 10px; background:${SkillSystem.getElementColor(elem)}22; border:1px solid ${SkillSystem.getElementColor(elem)}; border-radius:10px; font-size:11px; color:${SkillSystem.getElementColor(elem)};">${SkillSystem.getElementName(elem)}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div style="display:flex; gap:8px; padding-top:12px; border-top:1px solid rgba(100,100,150,0.3);">
                                <button onclick="Game.showRestMenu()" style="flex:1; padding:10px; background:linear-gradient(135deg,rgba(40,80,40,0.9),rgba(60,100,60,0.9)); border:1px solid #66aa66; border-radius:8px; color:#d0ffd0; cursor:pointer; font-size:12px; font-weight:bold;">😴 休息</button>
                                <button onclick="Game.saveGame()" style="flex:1; padding:10px; background:linear-gradient(135deg,rgba(80,80,40,0.9),rgba(100,100,60,0.9)); border:1px solid #aaaa66; border-radius:8px; color:#ffffd0; cursor:pointer; font-size:12px; font-weight:bold;">💾 保存</button>
                            </div>
                            `;
                        })()}
                    </div>
                </div>
                
                <!-- 底部导航栏 -->
                <div style="
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    background: rgba(10, 10, 25, 0.97);
                    border-top: 2px solid #444477;
                    padding: 10px 10px;
                    padding-bottom: calc(10px + env(safe-area-inset-bottom, 20px));
                    gap: 6px;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                ">
                    <button onclick="Game.openMap()" style="flex:1;padding:14px 8px;background:linear-gradient(135deg,rgba(40,60,90,0.9),rgba(60,80,120,0.9));border:2px solid #5577aa;border-radius:12px;color:#aaccff;cursor:pointer;font-size:18px;font-weight:bold;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.2s;" onmouseover="this.style.background='linear-gradient(135deg,rgba(60,80,120,0.9),rgba(80,100,150,0.9))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(40,60,90,0.9),rgba(60,80,120,0.9))'">
                        <span style="font-size:24px;">🗺️</span><span style="font-size:11px;">地图</span>
                    </button>
                    <button onclick="Game.openInventory()" style="flex:1;padding:14px 8px;background:linear-gradient(135deg,rgba(60,50,30,0.9),rgba(90,70,40,0.9));border:2px solid #aa8844;border-radius:12px;color:#ffddaa;cursor:pointer;font-size:18px;font-weight:bold;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.2s;" onmouseover="this.style.background='linear-gradient(135deg,rgba(90,70,40,0.9),rgba(120,90,50,0.9))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(60,50,30,0.9),rgba(90,70,40,0.9))'">
                        <span style="font-size:24px;">🎒</span><span style="font-size:11px;">背包</span>
                    </button>
                    <button onclick="Game.openCharacterPanel()" style="flex:1;padding:14px 8px;background:linear-gradient(135deg,rgba(50,40,80,0.9),rgba(80,60,120,0.9));border:2px solid #8866bb;border-radius:12px;color:#ccaaff;cursor:pointer;font-size:18px;font-weight:bold;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.2s;" onmouseover="this.style.background='linear-gradient(135deg,rgba(80,60,120,0.9),rgba(110,80,160,0.9))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(50,40,80,0.9),rgba(80,60,120,0.9))'">
                        <span style="font-size:24px;">👤</span><span style="font-size:11px;">角色</span>
                    </button>
                    <button onclick="Game.openDaily()" style="flex:1;padding:14px 8px;background:linear-gradient(135deg,rgba(30,60,50,0.9),rgba(50,90,70,0.9));border:2px solid #55aa77;border-radius:12px;color:#aaffcc;cursor:pointer;font-size:18px;font-weight:bold;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.2s;position:relative;" onmouseover="this.style.background='linear-gradient(135deg,rgba(50,90,70,0.9),rgba(70,120,90,0.9))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(30,60,50,0.9),rgba(50,90,70,0.9))'">
                        <span style="font-size:24px;">📅</span><span style="font-size:11px;">日常${DailySystem.getUnclaimedCount() > 0 ? `<span style="position:absolute;top:6px;right:10px;background:#ff4444;color:#fff;font-size:10px;padding:1px 5px;border-radius:8px;">${DailySystem.getUnclaimedCount()}</span>` : ''}</span>
                    </button>
                    <button onclick="UI.showFullMenu()" style="flex:1;padding:14px 8px;background:linear-gradient(135deg,rgba(60,40,80,0.9),rgba(90,60,120,0.9));border:2px solid #8866aa;border-radius:12px;color:#ccaaff;cursor:pointer;font-size:18px;font-weight:bold;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.2s;" onmouseover="this.style.background='linear-gradient(135deg,rgba(90,60,120,0.9),rgba(120,80,160,0.9))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(60,40,80,0.9),rgba(90,60,120,0.9))'">
                        <span style="font-size:24px;">☰</span><span style="font-size:11px;">菜单</span>
                    </button>
                </div>
            </div>
        `;
        
        // 更新事件追踪徽章
        setTimeout(() => {
            if (typeof EncounterSystem !== 'undefined') {
                const available = EncounterSystem.getAvailableSpecialEvents();
                const badge = document.getElementById('event-count-badge');
                if (badge) {
                    badge.textContent = available.length > 0 ? `(${available.length})` : '';
                }
                EncounterSystem.checkAndNotifyEvents();
            }
        }, 200);
        
        // 回到地图界面，触发消息队列处理
        setTimeout(() => {
            if (!this._isMessageShowing && this._messageQueue.length > 0) {
                this._processNextMessage();
            }
        }, 100);
}

/**
 * 渲染可视化地图界面（2D地图节点）
 * 绑定到UI对象调用：UIMap.renderMapView.call(UI)
 */
export function renderMapView() {
    const currentLoc = MapSystem.getCurrentLocation();
    const allLocations = (typeof DataLocations !== 'undefined') ? DataLocations : {};
    const currentMap = (typeof DataMaps !== 'undefined' && DataMaps.bo_city) ? DataMaps.bo_city : null;
    const mapLocationIds = currentMap ? currentMap.allLocations : Object.keys(allLocations);

    const locationNodes = [];
    const connectionLines = [];

    for (const locId of mapLocationIds) {
        const loc = allLocations[locId];
        if (!loc || !loc.mapX || !loc.mapY) continue;

        const isCurrent = currentLoc && currentLoc.id === locId;
        const unlocked = Player.unlockedLocations.includes(locId);
        const isConnected = currentLoc && currentLoc.connectedLocations && currentLoc.connectedLocations.includes(locId);

        if (isCurrent && currentLoc.connectedLocations) {
            for (const connId of currentLoc.connectedLocations) {
                const connLoc = allLocations[connId];
                if (connLoc && connLoc.mapX && connLoc.mapY) {
                    connectionLines.push({
                        from: { x: loc.mapX, y: loc.mapY },
                        to: { x: connLoc.mapX, y: connLoc.mapY },
                        unlocked: Player.unlockedLocations.includes(connId)
                    });
                }
            }
        }

        const featureTags = {
            tianlan_school: '学习中心', city_street: '商业街',
            xuefeng_mountain: '狩猎场', xuefeng_deep: '危险狩猎区',
            baicao_valley: '采药历练', earth_spring: '修炼圣地',
            mu_manor: '家族领地', xuefeng_station: '猎者补给',
            old_banyan_district: '旧城探索', mingwen_girls_school: '女校剧情',
            mo_fan_house: '民居', bo_north_gate: '城防关口',
            three_step_tower: '修炼塔'
        };
        const locEnemies = (typeof MapSystem.getLocationEnemies === 'function') ? MapSystem.getLocationEnemies(locId) : [];
        const locNpcs = (loc.npcs || []).length;
        let safety = '安全', safetyColor = '#66ff66';
        if (locEnemies.length > 0) {
            const maxLv = Math.max(...locEnemies.map(e => e.level || 1));
            if (maxLv >= Player.level + 5) { safety = '极危险'; safetyColor = '#ff4444'; }
            else if (maxLv >= Player.level) { safety = '危险'; safetyColor = '#ff8844'; }
            else { safety = '有妖魔'; safetyColor = '#ffcc44'; }
        }
        const enemyIcons = locEnemies.slice(0, 5).map(e => e.icon || '👹').join('');
        locationNodes.push({
            id: locId,
            name: loc.name,
            icon: loc.mapIcon || '📍',
            x: loc.mapX,
            y: loc.mapY,
            isCurrent: isCurrent,
            unlocked: unlocked,
            isConnected: isConnected,
            description: loc.description || '',
            tag: featureTags[locId] || '探索区域',
            enemies: locEnemies,
            enemyIcons: enemyIcons,
            enemyCount: locEnemies.length,
            npcCount: locNpcs,
            safety: safety,
            safetyColor: safetyColor,
            unlockHint: loc.unlockCondition?.hint || ''
        });
    }

    this.elements.gameContainer.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #0a0a1a, #1a1a3a); position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; background: rgba(0,0,0,0.6); border-bottom: 2px solid #444477; z-index: 10;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div onclick="Game.closeMap()" style="padding: 8px 16px; background: #333355; border: 1px solid #555577; border-radius: 8px; color: #ccccff; cursor: pointer; font-size: 14px;">← 返回</div>
                    <h2 style="color: #66aaff; font-size: 22px; margin: 0;">🗺️ 博城地图</h2>
                </div>
                <div style="color: #aaa; font-size: 13px;">
                    📍 当前位置：<span style="color: #66ff88;">${currentLoc ? currentLoc.name : '未知'}</span>
                </div>
            </div>

            <div style="flex: 1; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background:
                    radial-gradient(circle at 20% 30%, rgba(60, 80, 100, 0.3) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(80, 60, 100, 0.3) 0%, transparent 40%),
                    radial-gradient(circle at 50% 50%, rgba(40, 50, 80, 0.2) 0%, transparent 60%);
                "></div>

                <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; z-index: 0;">
                    <defs>
                        <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#4466aa" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                </svg>

                <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
                    ${connectionLines.map(line => {
                        const x1 = line.from.x + '%';
                        const y1 = line.from.y + '%';
                        const x2 = line.to.x + '%';
                        const y2 = line.to.y + '%';
                        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${line.unlocked ? '#6688cc' : '#444'}" stroke-width="2" stroke-dasharray="${line.unlocked ? 'none' : '5,5'}" opacity="0.6"/>`;
                    }).join('')}
                </svg>

                ${locationNodes.map(node => {
                    const size = node.isCurrent ? 64 : node.unlocked ? 56 : 50;
                    const bgColor = node.isCurrent ? 'rgba(100, 255, 150, 0.9)' : node.unlocked ? 'rgba(80, 100, 160, 0.9)' : 'rgba(60, 60, 60, 0.7)';
                    const borderColor = node.isCurrent ? '#66ff88' : node.unlocked ? '#8899cc' : '#555';
                    const cursor = node.isCurrent ? 'default' : 'pointer';
                    const glow = node.isCurrent ? 'box-shadow: 0 0 20px rgba(100, 255, 150, 0.6), 0 0 40px rgba(100, 255, 150, 0.3);' : node.unlocked && !node.isCurrent ? 'box-shadow: 0 0 12px rgba(100, 150, 255, 0.4);' : '';
                    const onClick = node.unlocked && !node.isCurrent 
                        ? `onclick="try { Game.travelTo('${node.id}'); } catch(e) { alert('travelTo错误: '+e.message); } this.style.transform='scale(0.9)'; setTimeout(()=>this.style.transform='scale(1)',150);"`
                        : !node.unlocked 
                            ? `onclick="UI.showMessage('🔒 ${node.name}尚未解锁：${node.unlockHint || '条件未知'}'); this.style.transform='scale(0.95)'; setTimeout(()=>this.style.transform='scale(1)',150);"`
                            : '';

                    const tooltipHtml = `
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #fff;">
                            ${node.icon} ${node.name}
                            <span style="font-size: 10px; color: #aaccff; background: rgba(50,70,100,0.6); padding: 1px 6px; border-radius: 6px; margin-left: 6px;">${node.tag}</span>
                        </div>
                        <div style="font-size: 11px; color: #bbb; line-height: 1.4; margin-bottom: 6px;">${node.description.substring(0, 60)}${node.description.length > 60 ? '...' : ''}</div>
                        <div style="font-size: 11px; display: flex; gap: 10px; align-items: center;">
                            <span style="color: ${node.safetyColor};">${node.enemyCount > 0 ? `⚔️ ${node.enemyIcons}${node.enemyCount > 5 ? '+' + (node.enemyCount - 5) : ''}` : '🛡️ 无妖魔'}</span>
                            ${node.npcCount > 0 ? `<span style="color: #88ccff;">👥 ${node.npcCount}人</span>` : ''}
                            <span style="color: ${node.safetyColor};">${node.safety}</span>
                        </div>
                        ${!node.unlocked && node.unlockHint ? `<div style="font-size: 11px; color: #ff9966; margin-top: 4px;">🔒 ${node.unlockHint}</div>` : ''}
                        ${node.unlocked && !node.isCurrent ? '<div style="font-size: 10px; color: #88ff88; margin-top: 4px; text-align: right;">点击前往 →</div>' : ''}
                    `;

                    return `
                        <div class="map-node-wrapper" style="position: absolute; left: ${node.x}%; top: ${node.y}%; transform: translate(-50%, -50%); z-index: 2; cursor: pointer;">
                            <div ${onClick} style="
                                width: ${size}px;
                                height: ${size}px;
                                background: ${bgColor};
                                border: 3px solid ${borderColor};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 24px;
                                cursor: ${cursor};
                                transition: all 0.2s;
                                ${glow}
                                ${node.isCurrent ? 'animation: mapPulse 2s infinite;' : ''}
                            " onmouseover="this.style.transform='scale(1.15)'; this.parentElement.querySelector('.map-tooltip').style.opacity='1'; this.parentElement.querySelector('.map-tooltip').style.pointerEvents='auto';" onmouseout="this.style.transform='scale(1)'; this.parentElement.querySelector('.map-tooltip').style.opacity='0'; this.parentElement.querySelector('.map-tooltip').style.pointerEvents='none';">
                                ${node.icon}
                            </div>
                            <div style="
                                position: absolute;
                                left: 50%;
                                top: calc(100% + 5px);
                                transform: translateX(-50%);
                                color: ${node.isCurrent ? '#66ff88' : node.unlocked ? '#ccddff' : '#666'};
                                font-size: 12px;
                                font-weight: ${node.isCurrent ? 'bold' : 'normal'};
                                white-space: nowrap;
                                text-shadow: 0 0 5px rgba(0,0,0,0.8);
                                pointer-events: none;
                            ">${node.name}</div>
                            <div class="map-tooltip" style="
                                position: absolute;
                                left: 50%;
                                bottom: calc(100% + 15px);
                                transform: translateX(-50%);
                                width: 220px;
                                background: rgba(15, 15, 30, 0.95);
                                border: 1px solid #5566aa;
                                border-radius: 10px;
                                padding: 10px 12px;
                                opacity: 0;
                                pointer-events: none;
                                transition: opacity 0.2s;
                                z-index: 100;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                            ">${tooltipHtml}</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="padding: 12px 25px; background: rgba(0,0,0,0.6); border-top: 2px solid #444477; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: rgba(100, 255, 150, 0.9); border: 2px solid #66ff88;"></div>
                    <span style="color: #66ff88; font-size: 12px;">当前位置</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: rgba(80, 100, 160, 0.9); border: 2px solid #8899cc;"></div>
                    <span style="color: #ccddff; font-size: 12px;">已解锁（可前往）</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 16px; height: 16px; border-radius: 50%; background: rgba(60, 60, 60, 0.7); border: 2px solid #555;"></div>
                    <span style="color: #888; font-size: 12px;">未解锁</span>
                </div>
                <div style="margin-left: auto; color: #888; font-size: 12px;">点击已解锁地点直接前往</div>
            </div>
        </div>
    `;

    // 添加脉冲动画样式
    if (!document.getElementById('map-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'map-pulse-style';
        style.textContent = `
            @keyframes mapPulse {
                0%, 100% { box-shadow: 0 0 20px rgba(100, 255, 150, 0.6), 0 0 40px rgba(100, 255, 150, 0.3); }
                50% { box-shadow: 0 0 30px rgba(100, 255, 150, 0.8), 0 0 60px rgba(100, 255, 150, 0.5); }
            }
        `;
        document.head.appendChild(style);
    }
}

// 导出模块集合
export const UIMap = {
    renderMapScreen,
    renderMapView
};

export default UIMap;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIMap = UIMap;
}
