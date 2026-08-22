/**
 * UI 渲染系统
 * 负责所有界面的渲染和更新
 */

import { renderTitleScreen as renderTitleScreenImpl, createParticles as createParticlesImpl } from './ui-title.js';
import { renderHelpScreen as renderHelpScreenImpl } from './ui-help.js';
import { renderBestiary as renderBestiaryImpl } from './ui-bestiary.js';
import { renderDaily as renderDailyImpl } from './ui-daily.js';
import { showNPCDialog as showNPCDialogImpl, showGiftSelection as showGiftSelectionImpl } from './ui-dialogue.js';
import { renderEventScreen as renderEventScreenImpl, renderBigEventEnding as renderBigEventEndingImpl, renderBigEventNarrativePhase as renderBigEventNarrativePhaseImpl, renderBigEventChoicePhase as renderBigEventChoicePhaseImpl } from './ui-event.js';
import { showAchievementPanel as showAchievementPanelImpl } from './ui-achievement.js';
import { renderCharacterScreen as renderCharacterScreenImpl, getSkillTooltipText as getSkillTooltipTextImpl, renderAttributeRow as renderAttributeRowImpl, updateCharacterScreen as updateCharacterScreenImpl } from './ui-character.js';
import { renderMapScreen as renderMapScreenImpl, renderMapView as renderMapViewImpl } from './ui-map.js';
import { renderBattleScreen as renderBattleScreenImpl, updateBattleScreen as updateBattleScreenImpl } from './ui-battle.js';
import { renderShopScreen as renderShopScreenImpl, updateShopScreen as updateShopScreenImpl } from './ui-shop.js';
import { showTalentDetail as showTalentDetailImpl } from './ui-talent-detail.js';
import { renderInventoryScreen as renderInventoryScreenImpl } from './ui-inventory.js';
import { _showSingleMessage as showSingleMessageImpl } from './ui-message.js';
import { renderIntelScreen as renderIntelScreenImpl } from './ui-intel.js';
import { showSkillDetail as showSkillDetailImpl } from './ui-skill-detail.js';
import { renderQuestScreen as renderQuestScreenImpl } from './ui-quest.js';
import { showEnemyDetail as showEnemyDetailImpl } from './ui-enemy-detail.js';
import { renderScheduledEventScreen as renderScheduledEventScreenImpl } from './ui-scheduled-event.js';
import { showDamageNumber as showDamageNumberImpl } from './ui-damage-number.js';
import { showElementSelectionAfterTalent as showElementSelectionAfterTalentImpl } from './ui-element-selection.js';
import { renderReputationScreen as renderReputationScreenImpl } from './ui-reputation.js';

export const UI = {
    // DOM 元素缓存
    elements: {},
    
    // UI 状态
    inventoryFilter: 'all', // 背包物品筛选：all/consumable/equipment/material/quest
    _expandedBattleElement: null, // v0.94.0: 战斗中当前展开的元素系（内联展开式技能UI）
    
    // ===== 战斗美术资源配置（预留接口，后续填充美术资源时在此配置）=====
    // 设计原则：所有战斗视觉资源通过此配置统一管理，代码不硬编码图片路径
    // 新增资源时：在对应分类下添加 key-value，renderBattleScreen 会自动读取
    battleArt: {
        // 战斗背景图：key为地点ID或妖魔类型，value为图片路径
        // 示例：'xuefeng_mountain': 'assets/images/battle-bg/xuefeng.jpg'
        backgrounds: {},
        // 玩家立绘：key为玩家外观ID，value为图片路径
        // 示例：'default': 'assets/images/sprites/player.png'
        playerSprites: {},
        // 妖魔立绘：key为妖魔ID，value为图片路径
        // 示例：'duoyanmolang': 'assets/images/sprites/duoyanmolang.png'
        enemySprites: {},
        // 技能特效配置：key为技能ID，value为特效参数
        // 示例：'fire_burn': { type: 'particle', color: '#ff6644', duration: 500, img: 'assets/effects/fire.png' }
        skillEffects: {},
        // 通用特效
        commonEffects: {
            // hit: 'assets/effects/hit.png',
            // crit: 'assets/effects/crit.png',
        }
    },
    
    // 根据当前战斗场景获取背景图（预留方法，后续实现动态背景切换）
    getBattleBackground(enemy, location) {
        const cfg = this.battleArt.backgrounds;
        // 优先级：地点背景 > 妖魔类型背景 > 默认
        if (location && cfg[location]) return cfg[location];
        if (enemy && enemy.type && cfg[enemy.type]) return cfg[enemy.type];
        return cfg.default || '';
    },
    
    // 根据妖魔ID获取立绘（预留方法）
    getEnemySprite(enemyId) {
        return this.battleArt.enemySprites[enemyId] || '';
    },
    
    // 获取玩家立绘（预留方法）
    getPlayerSprite() {
        return this.battleArt.playerSprites.default || '';
    },
    
    // 统一竖版判断（支持?forcePortrait=1强制竖版，方便电脑端调试手机布局）
    isPortrait() {
        if (this._forcePortrait === undefined) {
            const params = new URLSearchParams(window.location.search);
            this._forcePortrait = params.get('forcePortrait') === '1';
        }
        if (this._forcePortrait) return true;
        return window.innerWidth < 768 || window.innerHeight > window.innerWidth;
    },

    // 初始化
    init() {
        // 缓存常用元素
        this.elements.gameContainer = document.getElementById('game-container');
    },

    // v0.92.8: 统一设置gameContainer.innerHTML，强制恢复pointer-events，防止消息弹窗导致点击锁定
    _setGameHTML(html) {
        this._restoreClicks();
        this.elements.gameContainer.innerHTML = html;
    },

    // v0.92.9: 恢复点击，移除全局点击拦截器
    _restoreClicks() {
        document.body.classList.remove('message-showing');
        const gc = document.getElementById('game-container');
        if (gc) gc.style.pointerEvents = '';
        // 移除所有可能的点击拦截器
        const interceptors = [this._globalClickInterceptor, this._prevClickInterceptor];
        for (const interceptor of interceptors) {
            if (interceptor) {
                document.removeEventListener('click', interceptor, true);
                document.removeEventListener('mousedown', interceptor, true);
                document.removeEventListener('mouseup', interceptor, true);
            }
        }
        this._globalClickInterceptor = null;
        this._prevClickInterceptor = null;
    },

    // 消息队列（避免多条消息重叠）
    _messageQueue: [],
    _isMessageShowing: false,
    
    // 上一次消息关闭的时间戳，用于防止点击穿透
    _lastMessageCloseTime: 0,
    
    // 检查是否可以显示消息（弹窗状态下暂停）
    _canShowMessage() {
        // 如果游戏处于事件/大事件/对话/战斗等弹窗状态，暂停显示消息
        // 注意：shop/inventory/character不阻止消息，让购买/装备反馈即时显示
        if (typeof Game !== 'undefined' && Game.state) {
            const modalStates = ['event', 'scheduled_event', 'dialogue', 'battle'];
            if (modalStates.includes(Game.state)) {
                return false;
            }
        }
        return true;
    },

    // 开场剧情
    showOpeningStory(element) {
        // debug模式下跳过开场剧情
        if (typeof window !== 'undefined' && window.location && window.location.search.includes('debug=1')) {
            UI.showMessage(`【新手引导】新任务「初识魔法」已解锁！点击底部「菜单」→「任务」查看并接取任务，去修炼场感受魔法的力量吧！\n\n💡 提示：按 ~ 键可打开调试面板（需在URL加?debug=1）。`);
            return;
        }
        const elementName = (typeof SkillSystem !== 'undefined') ? SkillSystem.getElementName(element) : element;
        const elementColor = (typeof SkillSystem !== 'undefined') ? SkillSystem.getElementColor(element) : '#888';

        const overlay = document.createElement('div');
        overlay.id = 'opening-story-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:10001;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <button id="opening-skip-btn" style="position:absolute;top:20px;right:20px;background:transparent;border:1px solid #555;color:#888;padding:6px 16px;border-radius:4px;cursor:pointer;font-size:13px;z-index:10;">跳过 →</button>
            <div style="max-width:600px;width:90%;text-align:center;padding:40px 20px;">
                <div id="opening-text" style="font-size:16px;color:#ccc;line-height:2;min-height:300px;text-align:left;"></div>
                <button id="opening-btn" style="margin-top:30px;background:transparent;border:1px solid #4a6fa5;color:#8ab4f0;padding:10px 30px;border-radius:6px;cursor:pointer;font-size:14px;display:none;">开始冒险</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const storyTexts = [
            { text: '这是一个魔法的世界。', delay: 1500 },
            { text: '在这个世界里，魔法不再是传说，而是科学、是力量、是每个人都有可能掌握的能力。', delay: 2500 },
            { text: '十七岁那年，每个人都会经历一次觉醒仪式——在觉醒石的光芒中，感知自己与哪种元素系共鸣。', delay: 2500 },
            { text: '有人觉醒了火系，有人觉醒了冰系，有人觉醒了雷系……', delay: 2000 },
            { text: '而你，觉醒了<span style="color:' + elementColor + ';font-weight:bold;">' + elementName + '</span>。', delay: 2000 },
            { text: '但魔法之路，从不是坦途。', delay: 2000 },
            { text: '在人类城市之外，是妖魔横行的荒野。在光明之下，潜伏着名为「黑教廷」的黑暗组织。', delay: 2500 },
            { text: '而你，即将踏入天澜魔法高中——一个看似平静，实则暗流涌动的地方。', delay: 2500 },
            { text: '你的故事，从博城开始。', delay: 2000 }
        ];

        const textDiv = overlay.querySelector('#opening-text');
        const btn = overlay.querySelector('#opening-btn');
        const skipBtn = overlay.querySelector('#opening-skip-btn');
        let idx = 0;
        let currentTimer = null;

        // v0.74.1: 跳过开场剧情
        const skipOpening = () => {
            if (currentTimer) clearTimeout(currentTimer);
            overlay.remove();
            UI.showMessage(`【新手引导】新任务「初识魔法」已解锁！点击底部「菜单」→「任务」查看并接取任务，去修炼场感受魔法的力量吧！\n\n💡 提示：按 ~ 键可打开调试面板（需在URL加?debug=1）。`);
        };
        skipBtn.onclick = skipOpening;

        const showNext = () => {
            if (idx >= storyTexts.length) {
                btn.style.display = 'inline-block';
                btn.onclick = () => {
                    overlay.remove();
                    UI.showMessage(`【新手引导】新任务「初识魔法」已解锁！点击底部「菜单」→「任务」查看并接取任务，去修炼场感受魔法的力量吧！\n\n💡 提示：按 ~ 键可打开调试面板（需在URL加?debug=1）。`);
                };
                return;
            }
            const s = storyTexts[idx];
            textDiv.innerHTML = s.text;
            textDiv.style.opacity = '0';
            textDiv.style.transition = 'opacity 0.8s';
            setTimeout(() => { textDiv.style.opacity = '1'; }, 50);
            idx++;
            currentTimer = setTimeout(showNext, s.delay);
        };

        currentTimer = setTimeout(showNext, 800);
    },

    // 章节完成总结弹窗
    showChapterCompleteModal(chapter) {
        const rewards = chapter.rewards || {};
        const unlocks = chapter.unlocks || {};

        let rewardText = '';
        if (rewards.exp) rewardText += `<div style="color:#88ff88;">经验 +${rewards.exp}</div>`;
        if (rewards.gold) rewardText += `<div style="color:#ffdd44;">金币 +${rewards.gold}</div>`;
        if (rewards.items) {
            rewards.items.forEach(item => {
                const itemData = (typeof DataItems !== 'undefined') ? DataItems[item.itemId] : null;
                const name = itemData ? itemData.name : item.itemId;
                rewardText += `<div style="color:#aaccff;">${name} ×${item.count}</div>`;
            });
        }

        let unlockText = '';
        // v0.46.1: 英文key映射为中文名称
        const systemNames = {
            basic_combat: '基础战斗', cultivation: '修炼系统', status_panel: '状态面板',
            npc_schedule: 'NPC日程', npc_relationship: 'NPC关系', influence: '影响力系统',
            daily_message: '日常消息', quest_system: '任务系统', shop: '商店系统'
        };
        const featureNames = {
            dialogue: '对话系统', random_event: '随机事件', battle_item: '战斗道具',
            element_counter: '元素克制', talent_system: '天赋系统'
        };
        if (unlocks.locations && unlocks.locations.length) {
            unlockText += `<div style="color:#88ccff;">新地点: ${unlocks.locations.length}个</div>`;
        }
        if (unlocks.systems && unlocks.systems.length) {
            const sysNames = unlocks.systems.map(s => systemNames[s] || s);
            unlockText += `<div style="color:#cc88ff;">新系统: ${sysNames.join('、')}</div>`;
        }
        if (unlocks.features && unlocks.features.length) {
            const featNames = unlocks.features.map(f => featureNames[f] || f);
            unlockText += `<div style="color:#ffaa88;">新功能: ${featNames.join('、')}</div>`;
        }

        let discoveredIntel = 0;
        if (typeof WorldState !== 'undefined' && WorldState.knownInfo) {
            discoveredIntel = WorldState.knownInfo.length;
        }

        const overlay = document.createElement('div');
        overlay.id = 'chapter-complete-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #4a6fa5;border-radius:16px;padding:30px;max-width:500px;width:90%;text-align:center;box-shadow:0 0 40px rgba(74,111,165,0.5);">
                <div style="font-size:14px;color:#6a8aba;letter-spacing:4px;margin-bottom:8px;">CHAPTER COMPLETE</div>
                <div style="font-size:28px;font-weight:bold;color:#e8d44d;margin-bottom:5px;text-shadow:0 0 20px rgba(232,212,77,0.5);">${chapter.name}</div>
                <div style="font-size:13px;color:#888;margin-bottom:20px;">${chapter.volumeName || ''}</div>
                <div style="font-size:14px;color:#ccc;line-height:1.6;margin-bottom:20px;padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;text-align:left;">
                    ${chapter.description || ''}
                </div>
                ${rewardText ? `<div style="margin-bottom:15px;text-align:left;"><div style="color:#aaa;font-size:12px;margin-bottom:5px;">获得奖励</div>${rewardText}</div>` : ''}
                ${unlockText ? `<div style="margin-bottom:15px;text-align:left;"><div style="color:#aaa;font-size:12px;margin-bottom:5px;">解锁内容</div>${unlockText}</div>` : ''}
                <div style="margin-bottom:20px;text-align:left;">
                    <div style="color:#aaa;font-size:12px;margin-bottom:5px;">情报收集</div>
                    <div style="color:#88ccff;">已收集信息碎片: ${discoveredIntel}条</div>
                </div>
                ${chapter.nextChapter ? `<div style="font-size:13px;color:#6a8aba;margin-bottom:20px;">下一章即将开始...</div>` : '<div style="font-size:13px;color:#6a8aba;margin-bottom:20px;">本卷完结</div>'}
                <button onclick="document.getElementById('chapter-complete-overlay').remove()" style="background:linear-gradient(135deg,#4a6fa5,#3a5a8a);color:#fff;border:none;padding:12px 40px;border-radius:8px;font-size:16px;cursor:pointer;">继续</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // 显示消息提示（带队列，同一时间只显示一条）
    showMessage(text) {
        // 加入队列
        this._messageQueue.push(text);
        // 如果当前没有显示消息且可以显示，立即处理
        if (!this._isMessageShowing && this._canShowMessage()) {
            this._processNextMessage();
        } else if (!this._isMessageShowing) {
            // 当前不能显示（如在事件/对话/战斗中），设置定时重试，确保状态恢复后消息自动显示
            this._scheduleMessageRetry();
        }
    },

    // 定时重试消息队列（避免事件/对话/战斗结束后消息堆积不显示）
    _scheduleMessageRetry() {
        if (this._messageRetryTimer) return; // 已有定时器，不重复设置
        this._messageRetryTimer = setInterval(() => {
            if (this._canShowMessage() && !this._isMessageShowing && this._messageQueue.length > 0) {
                clearInterval(this._messageRetryTimer);
                this._messageRetryTimer = null;
                this._processNextMessage();
            }
        }, 300);
        // 最多重试30秒，防止定时器泄漏
        setTimeout(() => {
            if (this._messageRetryTimer) {
                clearInterval(this._messageRetryTimer);
                this._messageRetryTimer = null;
            }
        }, 30000);
    },

    // v0.9.4: 显示每日总结
    showDailySummary(stats) {
        if (!stats) return;
        
        // v0.92.17: 强制恢复点击，防止之前的消息弹窗导致点击被拦截
        if (typeof UI !== 'undefined') {
            UI._restoreClicks();
        }
        
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
            min-width: 350px;
            max-width: 450px;
            z-index: 1000;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
        `;
        
        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 15px; font-weight: bold; text-align: center;">
                📅 第 ${stats.day} 天总结
            </div>
            <div style="font-size: 14px; color: #aaa; margin-bottom: 20px; text-align: center;">
                今天你做了这些事：
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${stats.expGained > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(60, 60, 30, 0.4); border-radius: 8px;">
                        <span style="color: #ffeeaa;">✨ 获得经验</span>
                        <span style="color: #ffd700; font-weight: bold;">+${stats.expGained}</span>
                    </div>
                ` : ''}
                ${stats.goldGained > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(60, 50, 20, 0.4); border-radius: 8px;">
                        <span style="color: #ffddaa;">💰 获得金币</span>
                        <span style="color: #ffaa44; font-weight: bold;">+${stats.goldGained}</span>
                    </div>
                ` : ''}
                ${stats.battlesWon > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(60, 20, 20, 0.4); border-radius: 8px;">
                        <span style="color: #ffaaaa;">⚔️ 战斗胜利</span>
                        <span style="color: #ff6666; font-weight: bold;">${stats.battlesWon} 场</span>
                    </div>
                ` : ''}
                ${stats.locationsExplored > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(20, 60, 40, 0.4); border-radius: 8px;">
                        <span style="color: #aaffcc;">🗺️ 探索新地点</span>
                        <span style="color: #66ff99; font-weight: bold;">${stats.locationsExplored} 个</span>
                    </div>
                ` : ''}
                ${stats.npcsTalked > 0 ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(20, 40, 60, 0.4); border-radius: 8px;">
                        <span style="color: #aaccff;">💬 结识新NPC</span>
                        <span style="color: #66aaff; font-weight: bold;">${stats.npcsTalked} 人</span>
                    </div>
                ` : ''}
                ${stats.expGained === 0 && stats.battlesWon === 0 && stats.locationsExplored === 0 && stats.npcsTalked === 0 ? `
                    <div style="text-align: center; padding: 20px; color: #888;">
                        今天比较平静，没有特别的收获。
                    </div>
                ` : ''}
            </div>
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    padding: 12px 40px;
                    background: linear-gradient(135deg, #665522, #887733);
                    border: 2px solid #ffd700;
                    border-radius: 10px;
                    color: #ffeeaa;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                " onmouseover="this.style.background='linear-gradient(135deg, #887733, #aa9944)'" onmouseout="this.style.background='linear-gradient(135deg, #665522, #887733)'">
                    开始新的一天
                </button>
            </div>
        `;
        
        document.body.appendChild(dialog);
    },

    // 处理队列中的下一条消息
    _processNextMessage() {
        const ui = this;
        
        // 检查是否可以显示
        if (!this._canShowMessage()) {
            this._isMessageShowing = false;
            // 延迟恢复主容器点击和行动冷却（v0.92.16: 200ms→50ms）
            setTimeout(() => {
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.pointerEvents = '';
                }
                if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
                    Game._actionCooldown = false;
                }
                // 恢复行动按钮点击
                document.body.classList.remove('message-showing');
            }, 50);
            // 调度重试，确保状态恢复后消息自动显示
            if (this._messageQueue.length > 0) {
                this._scheduleMessageRetry();
            }
            return;
        }
        
        if (this._messageQueue.length === 0) {
            this._isMessageShowing = false;
            // 延迟恢复主容器点击和行动冷却（v0.92.16: 200ms→50ms）
            setTimeout(() => {
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.pointerEvents = '';
                }
                if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
                    Game._actionCooldown = false;
                }
                // 恢复行动按钮点击
                document.body.classList.remove('message-showing');
            }, 50);
            return;
        }
        this._isMessageShowing = true;
        const text = this._messageQueue.shift();
        this._showSingleMessage(text);
    },

    // 显示单条消息（内部方法）
    // 显示单条消息（已拆分到ui-message.js）
    _showSingleMessage(text) {
        return showSingleMessageImpl.call(this, text);
    },

    // ========== 标题界面（已拆分到ui-title.js） ==========
    renderTitleScreen(hasSave) {
        return renderTitleScreenImpl.call(this, hasSave);
    },

    // 创建魔法粒子效果（已拆分到ui-title.js）
    createParticles() {
        return createParticlesImpl.call(this);
    },

    // ========== 角色创建界面 ==========
    renderCharacterCreate() {
        // v1.4.5: 觉醒流程重构 - 先选天生天赋，天赋决定系别
        // 角色创建界面只输入角色名，然后直接进入天生天赋选择

        // v0.92.15: 强制恢复点击
        const forceRestoreClicks = () => {
            document.body.classList.remove('message-showing');
            const gc = document.getElementById('game-container');
            if (gc) gc.style.pointerEvents = '';
            if (typeof UI !== 'undefined') {
                ['_globalClickInterceptor', '_prevClickInterceptor'].forEach(key => {
                    if (UI[key]) {
                        document.removeEventListener('click', UI[key], true);
                        document.removeEventListener('mousedown', UI[key], true);
                        document.removeEventListener('mouseup', UI[key], true);
                        UI[key] = null;
                    }
                });
            }
        };
        forceRestoreClicks();
        setTimeout(forceRestoreClicks, 100);
        setTimeout(forceRestoreClicks, 500);

        this.elements.gameContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a3a 100%);
                padding: 40px;
                position: relative;
                pointer-events: auto;
                z-index: 9999;
            ">
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.12;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;">
                <h2 style="
                    font-size: 36px;
                    color: #ffd700;
                    margin-bottom: 10px;
                    letter-spacing: 4px;
                ">创建角色</h2>
                
                <p style="color: #8888aa; margin-bottom: 40px; font-size: 16px;">觉醒仪式即将开始，先告诉我你的名字...</p>
                
                <div style="margin-bottom: 40px;">
                    <label style="color: #aaa; font-size: 16px; margin-right: 15px;">角色名：</label>
                    <input type="text" id="char-name" maxlength="10" value="冒险者"
                           style="
                               padding: 10px 15px;
                               font-size: 18px;
                               background: rgba(20, 20, 50, 0.8);
                               border: 2px solid #444477;
                               border-radius: 8px;
                               color: #fff;
                               width: 200px;
                           ">
                </div>

                <div onclick="try { Game.createCharacter(document.getElementById('char-name').value||'冒险者'); } catch(e) { alert('错误:'+e.message); }" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: linear-gradient(135deg, #2a2a6a, #4a4aaa);
                    border: 2px solid #6666cc;
                    color: #e0e0ff;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    letter-spacing: 4px;
                    display: inline-block;
                    position: relative;
                    z-index: 100;
                " id="confirm-btn">
                    开始觉醒
                </div>

                <p style="color: #666; margin-top: 30px; font-size: 13px; text-align: center; line-height: 1.8;">
                    觉醒时将先感知你的<span style="color:#ffd700;">天生天赋</span><br>
                    天赋决定你的魔法之路，稀有天赋可觉醒稀有系别
                </p>
                </div>
            </div>
        `;

        // v0.92.15: 强制设置game-container可点击
        const _gc = document.getElementById('game-container');
        if (_gc) {
            _gc.style.pointerEvents = 'auto';
            _gc.style.zIndex = '9999';
        }
    },

    // v1.4.5: 觉醒流程重构 - 天赋决定系别后的系别选择界面
    // 天赋决定系别后的系别选择界面（已拆分到ui-element-selection.js）
    showElementSelectionAfterTalent(talent) {
        return showElementSelectionAfterTalentImpl.call(this, talent);
    },

    /**
     * v2.8.2: 主副修选择弹窗（卡片式选择，非下拉）
     * 当玩家觉醒第二系时主动弹出，说明机制并让玩家选择
     * @param {Array} elements - 可选系别列表，如 ['fire', 'ice']
     * @param {Function} callback - 选择完成后的回调 (primary, secondary) => {}
     * @param {boolean} isFirstTime - 是否首次觉醒第二系（显示更详细的说明）
     */
    showPrimarySecondarySelection(elements, callback, isFirstTime = false) {
        const elemNames = { fire:'🔥 火系', ice:'❄️ 冰系', thunder:'⚡ 雷系', water:'💧 水系', wind:'🌪️ 风系', earth:'🪨 土系', light:'✨ 光系', dark:'🌑 暗系', heal:'💚 治愈系', plant:'🌿 植物系', summon:'📜 召唤系' };
        const elemColors = { fire:'#ff6633', ice:'#66ccff', thunder:'#ffcc00', water:'#6699ff', wind:'#99ff99', earth:'#cc9966', light:'#ffffcc', dark:'#9966ff', heal:'#66ff99', plant:'#66cc66', summon:'#cc99ff' };
        const elemDescs = {
            fire:'高爆发·燃烧持续伤害', ice:'强控制·冻结减速', thunder:'高速度·麻痹连锁',
            earth:'高防御·护盾控制', wind:'高闪避·速度快', water:'治疗恢复·湿润控制',
            light:'神圣伤害·净化治疗', dark:'高暴击·吸血诅咒', heal:'强力治疗·辅助增益',
            plant:'控制束缚·持续中毒', summon:'召唤兽协同·以多打少'
        };

        let selectedPrimary = elements[0] || '';
        let selectedSecondary = elements[1] || '';

        const renderCards = () => {
            return elements.map(elem => {
                const isPrimary = selectedPrimary === elem;
                const isSecondary = selectedSecondary === elem;
                const borderColor = isPrimary ? '#ffd700' : (isSecondary ? '#88ccff' : '#444477');
                const bgColor = isPrimary ? 'rgba(255,215,0,0.15)' : (isSecondary ? 'rgba(136,204,255,0.1)' : 'rgba(30,30,60,0.8)');
                const tag = isPrimary ? '<span style="background:#ffd700;color:#000;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;">主修</span>' : (isSecondary ? '<span style="background:#88ccff;color:#000;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;">副修</span>' : '');
                return `
                    <div id="ps-card-${elem}" onclick="UI._selectPrimarySecondary('${elem}')" style="
                        padding: 20px;
                        background: ${bgColor};
                        border: 3px solid ${borderColor};
                        border-radius: 14px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                        min-width: 160px;
                        flex: 1;
                    " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 25px ${elemColors[elem]}40';" onmouseout="this.style.transform='';this.style.boxShadow='none';">
                        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:10px;">
                            <span style="font-size:32px;">${elemNames[elem]?.split(' ')[0] || '✨'}</span>
                            ${tag}
                        </div>
                        <div style="font-size:18px;font-weight:bold;color:${elemColors[elem]};margin-bottom:6px;">${elemNames[elem]?.split(' ')[1] || elem}</div>
                        <div style="font-size:11px;color:#999;line-height:1.4;">${elemDescs[elem] || ''}</div>
                        <div style="margin-top:10px;font-size:11px;color:${isPrimary ? '#ffd700' : (isSecondary ? '#88ccff' : '#666')};font-weight:bold;">
                            ${isPrimary ? '100% 天赋效果' : (isSecondary ? '70% 天赋效果' : '点击设为主修')}
                        </div>
                    </div>
                `;
            }).join('');
        };

        const explanation = isFirstTime ? `
            <div style="background:linear-gradient(135deg,rgba(255,215,0,0.1),rgba(136,204,255,0.1));border:1px solid #ffd70055;border-radius:10px;padding:15px 20px;margin-bottom:20px;max-width:520px;">
                <div style="color:#ffd700;font-size:15px;font-weight:bold;margin-bottom:8px;">🎉 双系觉醒！新机制解锁</div>
                <div style="color:#ccc;font-size:12px;line-height:1.7;">
                    你已觉醒第二个元素系！现在可以选择<b style="color:#ffd700;">主修系</b>和<b style="color:#88ccff;">副修系</b>：<br>
                    • <b style="color:#ffd700;">主修系</b>：获得 <b>100%</b> 天赋效果，解锁主动技能<br>
                    • <b style="color:#88ccff;">副修系</b>：获得 <b>70%</b> 天赋效果<br>
                    • 其他系：获得 <b>50%</b> 天赋效果<br>
                    • 主修+副修可触发<b style="color:#ff88ff;">跨系组合效果</b>！<br>
                    <span style="color:#888;font-size:11px;">（后续可在角色信息中随时更改）</span>
                </div>
            </div>
        ` : '';

        this.elements.gameContainer.innerHTML += `
            <div id="ps-selection-overlay" style="
                position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(0,0,0,0.85);
                display:flex;flex-direction:column;justify-content:center;align-items:center;
                padding:40px;z-index:10000;
            ">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:28px;font-weight:bold;color:#ffd700;margin-bottom:8px;">⚔️ 主修 / 副修 选择</div>
                    <div style="color:#aaa;font-size:13px;">点击卡片选择主修系，另一系自动设为副修</div>
                </div>
                ${explanation}
                <div id="ps-cards-container" style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;max-width:600px;margin-bottom:25px;">
                    ${renderCards()}
                </div>
                <div style="display:flex;gap:15px;">
                    <button id="ps-confirm-btn" onclick="UI._confirmPrimarySecondary()" style="
                        padding:12px 40px;background:linear-gradient(135deg,#ffd700,#ffaa00);
                        color:#000;border:none;border-radius:10px;font-size:16px;font-weight:bold;
                        cursor:pointer;transition:all 0.3s;
                    " onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 0 20px #ffd70060';" onmouseout="this.style.transform='';this.style.boxShadow='none';">
                        确认选择
                    </button>
                </div>
            </div>
        `;

        // 保存状态供回调使用
        this._psState = { elements, callback, selectedPrimary, selectedSecondary };
    },

    /**
     * 内部方法：点击卡片选择主副修
     */
    _selectPrimarySecondary(elem) {
        if (!this._psState) return;
        const { elements } = this._psState;
        // 点击的设为主修，另一个设为副修
        this._psState.selectedPrimary = elem;
        this._psState.selectedSecondary = elements.find(e => e !== elem) || '';
        // 重新渲染卡片
        const container = document.getElementById('ps-cards-container');
        if (container) {
            const elemNames = { fire:'🔥 火系', ice:'❄️ 冰系', thunder:'⚡ 雷系', water:'💧 水系', wind:'🌪️ 风系', earth:'🪨 土系', light:'✨ 光系', dark:'🌑 暗系', heal:'💚 治愈系', plant:'🌿 植物系', summon:'📜 召唤系' };
            const elemColors = { fire:'#ff6633', ice:'#66ccff', thunder:'#ffcc00', water:'#6699ff', wind:'#99ff99', earth:'#cc9966', light:'#ffffcc', dark:'#9966ff', heal:'#66ff99', plant:'#66cc66', summon:'#cc99ff' };
            const elemDescs = { fire:'高爆发·燃烧持续伤害', ice:'强控制·冻结减速', thunder:'高速度·麻痹连锁', earth:'高防御·护盾控制', wind:'高闪避·速度快', water:'治疗恢复·湿润控制', light:'神圣伤害·净化治疗', dark:'高暴击·吸血诅咒', heal:'强力治疗·辅助增益', plant:'控制束缚·持续中毒', summon:'召唤兽协同·以多打少' };
            container.innerHTML = elements.map(elem => {
                const isPrimary = this._psState.selectedPrimary === elem;
                const isSecondary = this._psState.selectedSecondary === elem;
                const borderColor = isPrimary ? '#ffd700' : (isSecondary ? '#88ccff' : '#444477');
                const bgColor = isPrimary ? 'rgba(255,215,0,0.15)' : (isSecondary ? 'rgba(136,204,255,0.1)' : 'rgba(30,30,60,0.8)');
                const tag = isPrimary ? '<span style="background:#ffd700;color:#000;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;">主修</span>' : (isSecondary ? '<span style="background:#88ccff;color:#000;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:bold;">副修</span>' : '');
                return `
                    <div id="ps-card-${elem}" onclick="UI._selectPrimarySecondary('${elem}')" style="
                        padding: 20px;
                        background: ${bgColor};
                        border: 3px solid ${borderColor};
                        border-radius: 14px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                        min-width: 160px;
                        flex: 1;
                    " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 25px ${elemColors[elem]}40';" onmouseout="this.style.transform='';this.style.boxShadow='none';">
                        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:10px;">
                            <span style="font-size:32px;">${elemNames[elem]?.split(' ')[0] || '✨'}</span>
                            ${tag}
                        </div>
                        <div style="font-size:18px;font-weight:bold;color:${elemColors[elem]};margin-bottom:6px;">${elemNames[elem]?.split(' ')[1] || elem}</div>
                        <div style="font-size:11px;color:#999;line-height:1.4;">${elemDescs[elem] || ''}</div>
                        <div style="margin-top:10px;font-size:11px;color:${isPrimary ? '#ffd700' : (isSecondary ? '#88ccff' : '#666')};font-weight:bold;">
                            ${isPrimary ? '100% 天赋效果' : (isSecondary ? '70% 天赋效果' : '点击设为主修')}
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    /**
     * 内部方法：确认主副修选择
     */
    _confirmPrimarySecondary() {
        if (!this._psState) return;
        const { selectedPrimary, selectedSecondary, callback } = this._psState;
        // 清理
        document.getElementById('ps-selection-overlay')?.remove();
        this._psState = null;
        // 恢复game-container
        const _gc = document.getElementById('game-container');
        if (_gc) {
            _gc.style.pointerEvents = '';
            _gc.style.zIndex = '';
        }
        // 调用回调
        if (callback) callback(selectedPrimary, selectedSecondary);
    },

    // 天赋详情弹窗（已拆分到ui-talent-detail.js）
    showTalentDetail(elem) {
        return showTalentDetailImpl.call(this, elem);
    },

    // ========== v2.8.3 技能详情弹窗 ==========
    /**
     * 显示技能详细介绍弹窗
     * @param {string} skillId - 技能ID
     */
    // 显示技能详情（已拆分到ui-skill-detail.js）
    showSkillDetail(skillId) {
        return showSkillDetailImpl.call(this, skillId);
    },

    // ========== v2.8.3 敌人详情弹窗 ==========
    /**
     * 显示敌人详细介绍弹窗
     * @param {string} enemyId - 敌人ID
     */
    // 显示妖魔详情（已拆分到ui-enemy-detail.js）
    showEnemyDetail(enemyId) {
        return showEnemyDetailImpl.call(this, enemyId);
    },

    // ========== 地图/主界面 ==========
    /**
     * 获取当前目标提示文字（新手引导）
     */
    getCurrentGoalText() {
        const stats = Player.getTotalStats();
        
        // v0.99.0: 体力系统已移除，删除体力较低提示
        // 1. HP不足提示
        if (Player.hp < stats.maxHp * 0.3) {
            return 'HP太低了！使用治愈药水或休息恢复HP，避免战斗中死亡';
        }
        
        // 2.5 有未分配属性点提示
        if (Player.attributePoints > 0) {
            return `有 ${Player.attributePoints} 点属性点未分配！点击「角色」分配属性点提升实力`;
        }
        
        // 3. 有进行中的任务，优先显示主线任务
        const activeQuests = QuestSystem.activeQuests;
        if (activeQuests && activeQuests.length > 0) {
            // 优先找主线任务
            let mainQuest = null;
            let sideQuest = null;
            for (const aq of activeQuests) {
                const qd = QuestSystem.getQuest(aq.questId);
                if (qd && qd.isMainQuest) {
                    mainQuest = aq;
                    break;
                }
                if (!sideQuest) sideQuest = aq;
            }
            const quest = mainQuest || sideQuest || activeQuests[0];
            const questData = QuestSystem.getQuest(quest.questId);
            if (questData) {
                const firstObjective = questData.objectives[0];
                const current = quest.progress[0] || 0;
                const total = firstObjective?.count || 1;
                const done = current >= total;
                const prefix = questData.isMainQuest ? '📖 主线' : '📌 支线';
                return `${prefix}：${questData.name}（${current}/${total}）${done ? ' ✅ 可交付' : ''}`;
            }
        }
        
        // 4. 中期智能推荐（Lv.4+无任务时）
        if (Player.level >= 4) {
            const recommendation = this.getMidGameRecommendation();
            if (recommendation) {
                return recommendation;
            }
        }

        // 5. 新手阶段（1-3级）提示
        if (Player.level <= 3) {
            if (Player.currentLocation === 'tianlan_school') {
                return '新手建议：先在学校修炼提升等级，然后去雪峰山探索完成任务';
            } else {
                return '新手建议：探索周围环境，打怪升级，收集材料';
            }
        }
        
        // 6. 通用提示
        const expPercent = (Player.exp / Player.expToNext) * 100;
        if (expPercent < 30) {
            return '继续修炼或刷怪升级，解锁更多技能和内容';
        } else if (expPercent < 70) {
            return `升级进度：${Math.floor(expPercent)}%，继续加油！`;
        } else {
            return `快升级了！还差 ${Player.expToNext - Player.exp} 经验，再修炼几次吧`;
        }
    },

    /**
     * v0.49.0: 中期智能推荐
     * 基于玩家状态返回最优先的推荐行动，无推荐时返回null
     */
    getMidGameRecommendation() {
        // 1. 装备缺失推荐
        if (!Player.equipment || !Player.equipment.weapon) {
            return '💡 推荐：去小卖部购买武器（你还没有装备武器，战斗会很吃力）';
        }
        if (!Player.equipment || !Player.equipment.armor) {
            return '💡 推荐：去小卖部购买防具（没有防具时受到的伤害更高）';
        }

        // 2. 药水不足推荐
        const potionCount = Inventory.getItemCount ? Inventory.getItemCount('health_potion') : 0;
        if (potionCount < 3) {
            return `💡 推荐：购买治愈药水（当前只有${potionCount}瓶，探索和战斗需要足够的药水）`;
        }

        // 3. NPC关系空白推荐
        const hasNPCRelationship = this._hasAnyNPCRelationship(10);
        if (!hasNPCRelationship) {
            return '💡 推荐：找人聊天建立关系（与NPC建立关系可以解锁更多剧情和互动事件）';
        }

        // 4. 影响力低推荐
        if ((Player.influence || 0) < 10) {
            return '💡 推荐：完成任务或帮助NPC提升影响力（影响力达到一定程度可以改变剧情走向）';
        }

        // 5. 可突破境界推荐
        if (Player.canBreakthrough) {
            const bt = Player.canBreakthrough();
            if (bt && bt.canBreakthrough) {
                return '💡 推荐：突破境界（你已满足突破条件，突破后实力大幅提升）';
            }
        }

        // 6. 探索度低推荐
        if (Player.explorationComplete && Array.isArray(Player.explorationComplete)) {
            // 如果探索完成的地点少于2个，推荐探索
            if (Player.explorationComplete.length < 2) {
                return '💡 推荐：探索更多地点（探索可以发现新事件、物品和NPC）';
            }
        }

        return null;
    },

    /**
     * v0.49.0: 检查是否有任何NPC关系达到阈值
     */
    _hasAnyNPCRelationship(threshold) {
        if (typeof NPCStateSystem === 'undefined' || !NPCStateSystem._npcStates) return false;
        for (const [npcId, state] of Object.entries(NPCStateSystem._npcStates)) {
            if ((state.opinion || 0) >= threshold) return true;
        }
        return false;
    },
    
    /**
     * 任务追踪面板展开状态
     */
    questTrackerExpanded: false,
    
    /**
     * 切换任务追踪面板展开/收起
     */
    toggleQuestTracker() {
        this.questTrackerExpanded = !this.questTrackerExpanded;
        this.renderMapScreen();
    },
    
    // 主地图界面（已拆分到ui-map.js）
    renderMapScreen() {
        return renderMapScreenImpl.call(this);
    },

    // v0.81.3: 全功能菜单面板（手机端访问所有功能）
    showFullMenu() {
        const menuItems = [
            { icon: '👤', name: '角色属性', color: '#8899cc', action: () => Game.openCharacterPanel() },
            { icon: '🎒', name: '背包', color: '#aa8844', action: () => Game.openInventory() },
            { icon: '📜', name: '任务', color: '#8899cc', action: () => Game.openQuestLog() },
            { icon: '🔍', name: '事件情报', color: '#8899cc', action: () => Game.showEventsAndIntel() },
            { icon: '⭐', name: '声望', color: '#aa9944', action: () => Game.openReputationPanel() },
            { icon: '🏆', name: '成就', color: '#aa8844', action: () => UI.showAchievementPanel() },
            { icon: '❓', name: '帮助', color: '#8899cc', action: () => Game.openHelpPanel() },
            { icon: '📖', name: '妖魔图鉴', color: '#aa6666', action: () => Game.openBestiary() },
            { icon: '📋', name: '日常', color: '#55aa77', action: () => Game.openDaily() },
            { icon: '😴', name: '休息', color: '#66aa66', action: () => Game.showRestMenu() },
            { icon: '💾', name: '保存游戏', color: '#aaaa55', action: () => Game.saveGame() },
        ];
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);';
        overlay.innerHTML = `
            <div style="max-width:500px;width:100%;background:linear-gradient(135deg,#1a1a3a,#2a2a5a);border:2px solid #555588;border-radius:16px;padding:20px;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3 style="color:#ffd700;font-size:20px;margin:0;">📋 全部功能</h3>
                    <div onclick="this.closest('div[style*=fixed]').remove()" style="padding:6px 14px;background:#333355;border:1px solid #555577;border-radius:8px;color:#aaa;cursor:pointer;font-size:14px;">✕ 关闭</div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                    ${menuItems.map((item, idx) => `
                        <div data-idx="${idx}" class="full-menu-item" style="padding:14px 8px;background:linear-gradient(135deg,rgba(40,40,80,0.9),rgba(60,60,120,0.9));border:2px solid ${item.color};border-radius:12px;color:#e0e0ff;cursor:pointer;text-align:center;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)';this.style.borderColor='#fff'" onmouseout="this.style.transform='scale(1)';this.style.borderColor='${item.color}'">
                            <div style="font-size:28px;margin-bottom:4px;">${item.icon}</div>
                            <div style="font-size:13px;font-weight:bold;">${item.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        // 绑定点击事件
        overlay.querySelectorAll('.full-menu-item').forEach(el => {
            el.onclick = () => {
                const idx = parseInt(el.dataset.idx);
                overlay.remove();
                setTimeout(() => menuItems[idx].action(), 100);
            };
        });
        // 点击背景关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    },

    // 可视化地图界面（已拆分到ui-map.js）
    renderMapView() {
        return renderMapViewImpl.call(this);
    },

    // 战斗界面（已拆分到ui-battle.js）
    renderBattleScreen() {
        return renderBattleScreenImpl.call(this);
    },

    // 系别信息映射
    getElementInfo(element) {
        const info = {
            fire: { icon: '🔥', name: '火系', desc: '高伤害+燃烧持续伤害', color: '#ff6644' },
            ice: { icon: '❄️', name: '冰系', desc: '冻结控制+护盾防御', color: '#66ccff' },
            thunder: { icon: '⚡', name: '雷系', desc: '麻痹控制+高爆发', color: '#ffee44' },
            earth: { icon: '🪨', name: '土系', desc: '高防御+束缚控制', color: '#bb8844' },
            wind: { icon: '🌪️', name: '风系', desc: '高闪避+速度增益', color: '#88ffaa' },
            water: { icon: '💧', name: '水系', desc: '治疗+减速控制', color: '#4488ff' },
            light: { icon: '☀️', name: '光系', desc: '治疗+净化+神圣伤害', color: '#ffffaa' },
            dark: { icon: '🌙', name: '暗系', desc: '诅咒+吸血+高爆发', color: '#aa66ff' },
            plant: { icon: '🌿', name: '植物系', desc: '持续恢复+中毒', color: '#66dd66' },
            heal: { icon: '💚', name: '治愈系', desc: '治疗+恢复', color: '#66ff88' },
            summon: { icon: '🐺', name: '召唤系', desc: '召唤兽协同作战', color: '#ffaa66' },
            neutral: { icon: '⚔️', name: '无系', desc: '普通攻击', color: '#aaaaaa' }
        };
        return info[element] || { icon: '✨', name: element, desc: '', color: '#ffffff' };
    },

    // v2.5.0: 选择天赋进化分支
    selectTalentBranch(element, branchId) {
        if (!Player.talents || !Player.talents[element]) return;
        const talentData = Player.talents[element];
        const talent = typeof DataTalents !== 'undefined' ? DataTalents[talentData.talentId] : null;
        if (!talent || !talent.evolutions) return;

        const evolveStage = talent.evolutions.find(e => e.level === 5 && e.branchChoices);
        if (!evolveStage) return;

        const branch = evolveStage.branchChoices.find(b => b.id === branchId);
        if (!branch) return;

        talentData.branch = branchId;
        if (typeof Game !== 'undefined' && Game.addLog) {
            Game.addLog(`✨ ${talent.name} 选择了「${branch.name}」进化方向！`);
        }
        // 刷新角色面板
        if (typeof this.showCharacterPanel === 'function') {
            this.showCharacterPanel();
        } else if (typeof Game !== 'undefined' && Game.showCharacterPanel) {
            Game.showCharacterPanel();
        }
    },

    // v2.5.2: 重置天赋
    resetTalent(element) {
        if (!confirm(`确定要重置${SkillSystem.getElementName(element)}天赋吗？等级将回到1，经验和分支将清空。`)) return;
        if (Player.resetElementTalent) {
            Player.resetElementTalent(element);
            // 刷新角色面板
            if (typeof this.showCharacterPanel === 'function') {
                this.showCharacterPanel();
            } else if (typeof Game !== 'undefined' && Game.showCharacterPanel) {
                Game.showCharacterPanel();
            }
        }
    },

    // v0.94.0: 战斗技能内联展开 - 切换元素系展开状态
    toggleBattleElement(element) {
        if (this._expandedBattleElement === element) {
            this._expandedBattleElement = null; // 再次点击收起
        } else {
            this._expandedBattleElement = element;
        }
        this.updateBattleScreen();
    },

    // v0.94.0: 关闭战斗技能展开
    closeBattleElementSkills() {
        this._expandedBattleElement = null;
        this.updateBattleScreen();
    },

    // 弹出某系技能面板（保留兼容，内联展开时不再使用）
    showElementSkillsPanel(element) {
        const info = this.getElementInfo(element);
        const skills = (Player.skills || []).filter(skillId => {
            if (skillId === 'basic_attack') return false;
            const skill = SkillSystem.getSkill(skillId);
            return skill && skill.element === element;
        });

        if (skills.length === 0) {
            this.showMessage(`还没有学会${info.name}魔法`);
            return;
        }

        // 按等级排序：初阶→中阶→高阶
        const tierOrder = { '初阶': 1, '中阶': 2, '高阶': 3, '超阶': 4 };
        skills.sort((a, b) => {
            const sa = SkillSystem.getSkill(a);
            const sb = SkillSystem.getSkill(b);
            return (tierOrder[sa.tier] || 9) - (tierOrder[sb.tier] || 9);
        });

        const panel = document.createElement('div');
        panel.id = 'element-skills-panel';
        panel.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; align-items:center; justify-content:center;';
        panel.onclick = (e) => { if (e.target === panel) panel.remove(); };

        const skillsHtml = skills.map(skillId => {
            const skill = SkillSystem.getSkill(skillId);
            const canUse = BattleSystem.active && BattleSystem.isPlayerTurn && Player.mp >= skill.mpCost;
            const cooldown = (BattleSystem.skillCooldowns && BattleSystem.skillCooldowns[skillId]) || 0;
            const isCd = cooldown > 0;
            const borderColor = info.color;
            return `
                <button onclick="Game.battleUseSkill('${skillId}'); document.getElementById('element-skills-panel').remove();" ${(!canUse || isCd) ? 'disabled' : ''}
                    title="${skill.description}"
                    style="
                        padding: 14px;
                        background: linear-gradient(135deg, ${borderColor}22, ${borderColor}44);
                        border: 2px solid ${borderColor};
                        border-radius: 10px;
                        color: #fff;
                        cursor: ${(canUse && !isCd) ? 'pointer' : 'not-allowed'};
                        text-align: left;
                        opacity: ${(canUse && !isCd) ? 1 : 0.4};
                        transition: all 0.2s;
                        width: 100%;
                    ">
                    <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">${info.icon} ${skill.name}</div>
                    <div style="font-size:12px; color:#ccc; margin-bottom:4px;">${skill.description.substring(0, 30)}${skill.description.length > 30 ? '...' : ''}</div>
                    <div style="font-size:12px; display:flex; justify-content:space-between;">
                        <span style="color:${Player.mp >= skill.mpCost ? '#aaccff' : '#ff6666'};">MP: ${skill.mpCost}</span>
                        <span style="color:#ffcc66;">${skill.tier || ''}</span>
                        ${isCd ? `<span style="color:#ff8866;">冷却: ${cooldown}回合</span>` : ''}
                    </div>
                </button>
            `;
        }).join('');

        panel.innerHTML = `
            <div style="width:90%; max-width:500px; max-height:80%; background:linear-gradient(180deg,#1a1a3a,#2a2a5a); border:2px solid ${info.color}; border-radius:16px; display:flex; flex-direction:column; overflow:hidden;">
                <div style="padding:14px 18px; background:rgba(0,0,0,0.5); border-bottom:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:${info.color}; font-weight:bold; font-size:18px;">${info.icon} ${info.name}魔法</span>
                    <button onclick="document.getElementById('element-skills-panel').remove()" style="background:#553333; border:1px solid #885555; color:#ffaaaa; padding:6px 14px; border-radius:8px; cursor:pointer; font-size:14px;">✕ 关闭</button>
                </div>
                <div style="padding:4px 14px; background:rgba(0,0,0,0.3); font-size:12px; color:#aaa;">${info.desc}</div>
                <div style="flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px;">
                    ${skillsHtml}
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    },

    // 弹出战斗日志面板（竖版用）
    showBattleLogModal() {
        const logs = (BattleSystem && BattleSystem.log) || [];
        const modal = document.createElement('div');
        modal.id = 'battle-log-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center;';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        modal.innerHTML = `
            <div style="width:90%; max-width:500px; height:70%; background:linear-gradient(180deg,#1a1a3a,#2a2a5a); border:2px solid #5555aa; border-radius:12px; display:flex; flex-direction:column; overflow:hidden;">
                <div style="padding:12px 16px; background:rgba(0,0,0,0.5); border-bottom:1px solid #444; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#ffd700; font-weight:bold; font-size:16px;">📜 战斗日志</span>
                    <button onclick="document.getElementById('battle-log-modal').remove()" style="background:#553333; border:1px solid #885555; color:#ffaaaa; padding:4px 12px; border-radius:6px; cursor:pointer; font-size:14px;">✕ 关闭</button>
                </div>
                <div style="flex:1; overflow-y:auto; padding:12px 16px; font-size:14px; line-height:1.8;">
                    ${logs.map(log => {
                        const icons = { damage:'⚔️', magic:'✨', heal:'💚', crit:'💥', system:'📢', buff:'⬆️', debuff:'⬇️', counter:'🔥', weakness:'❄️', flee:'🏃', item:'🎒', defend:'🛡️', interrupt:'⚡', summon:'🐺', soul:'💎', evolution:'🔮' };
                        const colors = { damage:'#ffaaaa', magic:'#ffcc88', heal:'#88ff88', crit:'#ffdd44', system:'#aaaacc', buff:'#88ffaa', debuff:'#ff8888', counter:'#ff8844', weakness:'#88aaff', flee:'#dddd88', item:'#aaffdd', defend:'#aaccff', interrupt:'#ffff88', summon:'#ffcc99', soul:'#dd88ff', evolution:'#88ffff' };
                        const icon = icons[log.type] || '';
                        const color = colors[log.type] || '#ffffff';
                        return `<p style="margin-bottom:6px; color:${color};">${icon ? icon+' ' : ''}${log.text}</p>`;
                    }).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    // 更新战斗界面（已拆分到ui-battle.js）
    updateBattleScreen() {
        return updateBattleScreenImpl.call(this);
    },

    // 显示战斗道具选择
    showBattleItems() {
        const items = Inventory.getAllItems();
        const battleItems = items.filter(inv => {
            const item = Inventory.getItem(inv.itemId);
            return item && item.usableInBattle && inv.count > 0;
        });

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'battle-items-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); z-index: 99999;
            display: flex; justify-content: center; align-items: center;
            pointer-events: auto;
        `;

        // 创建道具面板
        const panel = document.createElement('div');
        panel.className = 'mobile-popup';
        panel.style.cssText = `
            background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
            border: 2px solid #6666aa; border-radius: 15px;
            padding: 25px; max-width: 500px; width: 90%;
            max-height: 70vh; overflow-y: auto;
            box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
        `;

        let itemsHtml = '';
        if (battleItems.length === 0) {
            itemsHtml = '<p style="color: #aaa; text-align: center; padding: 20px;">没有可在战斗中使用的道具</p>';
        } else {
            itemsHtml = battleItems.map(inv => {
                const item = Inventory.getItem(inv.itemId);
                return `
                    <div onclick="Game.battleUseItem('${inv.itemId}')" style="
                        padding: 12px 15px; margin-bottom: 8px;
                        background: linear-gradient(135deg, #2a2a5a, #3a3a7a);
                        border: 2px solid #555599; border-radius: 10px;
                        cursor: pointer; transition: all 0.2s;
                        display: flex; align-items: center; gap: 12px;
                    " onmouseover="this.style.borderColor='#7777bb'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#555599'; this.style.transform='translateX(0)'">
                        <span style="font-size: 24px;">${item.icon || '📦'}</span>
                        <div style="flex: 1;">
                            <div style="color: #fff; font-weight: bold; font-size: 15px;">${item.name} <span style="color: #ffd700;">×${inv.count}</span></div>
                            <div style="color: #aaa; font-size: 12px; margin-top: 2px;">${item.description}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        panel.innerHTML = `
            <h2 style="color: #ffd700; font-size: 22px; margin-bottom: 15px; text-align: center;">🎒 战斗道具</h2>
            ${itemsHtml}
            <div onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 15px; padding: 10px; text-align: center;
                background: linear-gradient(135deg, #553333, #774444);
                border: 2px solid #885555; border-radius: 8px;
                color: #ffcccc; cursor: pointer; font-size: 15px;
            ">取消</div>
        `;

        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);
    },

    // 显示成就面板（已拆分到ui-achievement.js）
    showAchievementPanel() {
        return showAchievementPanelImpl.call(this);
    },

    // 获取日志颜色
    getLogColor(type) {
        const colors = {
            damage: '#ff8888',
            magic: '#ffcc66',
            heal: '#88ff88',
            crit: '#ffff66',
            system: '#aaaacc',
            buff: '#88ccff',
            debuff: '#cc88ff',
            counter: '#ff6644',
            weakness: '#ff44ff',
            evolution: '#ff66ff'
        };
        return colors[type] || '#ccc';
    },
    
    /**
     * 显示浮动伤害数字
     */
    // 显示浮动伤害数字（已拆分到ui-damage-number.js）
    showDamageNumber(amount, type, isPlayer) {
        return showDamageNumberImpl.call(this, amount, type, isPlayer);
    },
    
    // 受击动画
    playHitAnimation(isPlayer, isCrit) {
        const spriteId = isPlayer ? 'player-sprite' : 'enemy-sprite';
        const sprite = document.getElementById(spriteId);
        if (!sprite) return;
        sprite.style.animation = 'hitShake 0.4s ease-in-out, hitFlash 0.3s ease-in-out';
        if (isCrit) {
            sprite.style.animation = 'hitShake 0.5s ease-in-out, hitFlash 0.4s ease-in-out';
        }
        setTimeout(() => { sprite.style.animation = ''; }, 500);
    },
    
    // 攻击冲刺动画
    playAttackAnimation(isPlayer) {
        const spriteId = isPlayer ? 'player-sprite' : 'enemy-sprite';
        const sprite = document.getElementById(spriteId);
        if (!sprite) return;
        const animName = isPlayer ? 'attackLunge' : 'attackLungeLeft';
        sprite.style.animation = `${animName} 0.4s ease-in-out`;
        setTimeout(() => { sprite.style.animation = ''; }, 400);
    },

    // ========== 事件界面 ==========
    // 渲染事件界面（已拆分到ui-event.js）
    renderEventScreen(event) {
        return renderEventScreenImpl.call(this, event);
    },

    // 渲染大事件结局界面（已拆分到ui-event.js）
    renderBigEventEnding(event, ending) {
        return renderBigEventEndingImpl.call(this, event, ending);
    },

    // 渲染大事件剧情阶段界面（已拆分到ui-event.js）
    renderBigEventNarrativePhase(phase, hasNextPhase, autoMode = false) {
        return renderBigEventNarrativePhaseImpl.call(this, phase, hasNextPhase, autoMode);
    },

    // 渲染大事件选择阶段界面（已拆分到ui-event.js）
    renderBigEventChoicePhase(phase, choices) {
        return renderBigEventChoicePhaseImpl.call(this, phase, choices);
    },

    // 渲染大事件界面
    // 渲染大事件界面（已拆分到ui-scheduled-event.js）
    renderScheduledEventScreen(event, success) {
        return renderScheduledEventScreenImpl.call(this, event, success);
    },

    // 显示事件结果
    showEventResult(text, effects) {
        let effectText = '';
        if (effects) {
            // v0.42.2修复：如果resultText已包含相关关键词，不重复显示
            if (effects.exp && !text.includes('经验')) effectText += `\n获得 ${effects.exp} 经验`;
            if (effects.gold && !text.includes('金币')) effectText += effects.gold > 0 ? `\n获得 ${effects.gold} 金币` : `\n失去 ${-effects.gold} 金币`;
            if (effects.hp && !text.includes('HP')) effectText += effects.hp > 0 ? `\n恢复 ${effects.hp} HP` : `\n失去 ${-effects.hp} HP`;
            if (effects.mp && !text.includes('MP')) effectText += effects.mp > 0 ? `\n恢复 ${effects.mp} MP` : `\n失去 ${-effects.mp} MP`;
            if (effects.addItem && !text.includes('获得')) effectText += `\n获得物品`;
            if (effects.items) {
                for (const [itemId, count] of Object.entries(effects.items)) {
                    const item = DataManager.getItem(itemId);
                    const itemName = item ? item.name : itemId;
                    if (!text.includes(itemName)) effectText += `\n获得 ${itemName} x${count}`;
                }
            }
            // v0.86.4: 显示学到的新技能
            if (effects.learnedSkill && effects.learnedSkill.name) {
                effectText += `\n🎉 学会新技能：${effects.learnedSkill.name}`;
            }
        }
        
        this.showMessage(text + effectText);
    },

    // ========== 商店界面（已拆分到ui-shop.js） ==========
    renderShopScreen() {
        return renderShopScreenImpl.call(this);
    },

    updateShopScreen() {
        return updateShopScreenImpl.call(this);
    },

    // ========== 背包界面（已拆分到ui-inventory.js） ==========
    renderInventoryScreen() {
        return renderInventoryScreenImpl.call(this);
    },

    updateInventoryScreen() {
        this.renderInventoryScreen();
    },

    // 显示装备强化界面（直接打开背包，强化按钮已在装备栏中）
    showEnhancePanel() {
        this.renderInventoryScreen();
    },

    // v0.77.0: 显示装备强化继承界面
    showInheritPanel(slot) {
        const currentItemId = Player.equipment[slot];
        const currentLevel = Player.enhanceLevels[slot] || 0;
        const currentItem = (typeof DataItems !== 'undefined') ? DataItems[currentItemId] : null;
        const targets = Player.getInheritTargets(slot);
        const cost = 100 + currentLevel * 20;
        const slotNames = { weapon: '武器', armor: '防具', accessory: '饰品' };

        const overlay = document.createElement('div');
        overlay.id = 'inherit-panel-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `
            <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #4a6fa5;border-radius:16px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 0 40px rgba(74,111,165,0.5);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#66aaff;font-size:22px;margin:0;">🔄 装备强化继承</h3>
                    <div onclick="document.getElementById('inherit-panel-overlay').remove()" style="padding:8px 16px;background:#553333;border:1px solid #775555;border-radius:8px;color:#ffcccc;cursor:pointer;font-size:14px;">关闭</div>
                </div>

                <div style="background:rgba(60,60,100,0.4);border:1px solid #555588;border-radius:8px;padding:15px;margin-bottom:20px;">
                    <div style="color:#aaa;font-size:13px;margin-bottom:8px;">当前装备（${slotNames[slot] || slot}）</div>
                    <div style="color:#ffd700;font-size:16px;font-weight:bold;">
                        ${currentItem ? currentItem.icon + ' ' + currentItem.name : currentItemId} <span style="color:#66ff88;">+${currentLevel}</span>
                    </div>
                    <div style="color:#88ccaa;font-size:12px;margin-top:5px;">
                        继承消耗：${cost} 金币 | 强化等级100%转移，旧装备放回背包
                    </div>
                </div>

                <div style="color:#aaa;font-size:14px;margin-bottom:12px;">选择要继承到的目标装备（同部位）：</div>

                ${targets.length === 0 ? `
                    <div style="color:#888;text-align:center;padding:30px;background:rgba(40,40,60,0.5);border-radius:8px;">
                        背包中没有同部位的其他装备<br>
                        <span style="font-size:12px;color:#666;">需要先获得同部位装备才能继承</span>
                    </div>
                ` : `
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        ${targets.map(t => {
                            const rarityColors = { common: '#888', uncommon: '#66cc66', rare: '#6688ff', epic: '#aa66ff', legendary: '#ffaa44' };
                            const color = rarityColors[t.rarity] || '#888';
                            return `
                                <div onclick="Game.inheritEnhance('${slot}', '${t.id}');document.getElementById('inherit-panel-overlay').remove();" style="
                                    padding: 15px;
                                    background: rgba(40,40,70,0.8);
                                    border: 2px solid ${color};
                                    border-radius: 10px;
                                    cursor: pointer;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    transition: all 0.2s;
                                " onmouseover="this.style.background='rgba(60,60,100,0.9)'" onmouseout="this.style.background='rgba(40,40,70,0.8)'">
                                    <div>
                                        <span style="font-size:18px;">${t.icon}</span>
                                        <span style="color:#ddd;font-size:15px;font-weight:bold;margin-left:8px;">${t.name}</span>
                                        <span style="color:${color};font-size:12px;margin-left:8px;">x${t.count}</span>
                                    </div>
                                    <div style="color:#66ff88;font-size:14px;font-weight:bold;">
                                        继承后 +${currentLevel}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}

                <div style="margin-top:20px;padding:12px;background:rgba(50,50,30,0.4);border:1px solid #776644;border-radius:8px;">
                    <div style="color:#ffcc88;font-size:12px;">
                        💡 提示：有了强化继承，前期可以放心强化过渡装备，换装备时一键转移强化等级，不再浪费资源！
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // 设置背包物品筛选
    setInventoryFilter(filter) {
        this.inventoryFilter = filter;
        this.renderInventoryScreen();
    },

    // ========== 任务界面 ==========
    // 渲染任务界面（已拆分到ui-quest.js）
    renderQuestScreen() {
        return renderQuestScreenImpl.call(this);
    },

    // ========== 情报界面 ==========
    // 渲染情报界面（已拆分到ui-intel.js）
    renderIntelScreen() {
        return renderIntelScreenImpl.call(this);
    },

    // ========== 声望界面 ==========
    // 渲染声望界面（已拆分到ui-reputation.js）
    renderReputationScreen() {
        return renderReputationScreenImpl.call(this);
    },

    // ========== 帮助界面（已拆分到ui-help.js） ==========
    renderHelpScreen() {
        return renderHelpScreenImpl.call(this);
    },

    // ========== 妖魔图鉴（已拆分到ui-bestiary.js） ==========
    renderBestiary() {
        return renderBestiaryImpl.call(this);
    },

    // ========== 日常系统（已拆分到ui-daily.js） ==========
    renderDaily() {
        return renderDailyImpl.call(this);
    },

        // ========== 角色属性界面（已拆分到ui-character.js） ==========
    renderCharacterScreen() {
        return renderCharacterScreenImpl.call(this);
    },

    // 生成技能tooltip文本（已拆分到ui-character.js）
    getSkillTooltipText(skill) {
        return getSkillTooltipTextImpl.call(this, skill);
    },

    // 渲染属性行（已拆分到ui-character.js）
    renderAttributeRow(icon, name, value, max, attrKey) {
        return renderAttributeRowImpl.call(this, icon, name, value, max, attrKey);
    },

    // 更新角色属性界面（已拆分到ui-character.js）
    updateCharacterScreen() {
        return updateCharacterScreenImpl.call(this);
    },

// NPC 对话（已拆分到ui-dialogue.js）
    showNPCDialog(npc, message, availableQuests) {
        return showNPCDialogImpl.call(this, npc, message, availableQuests);
    },

    // 显示礼物选择界面（已拆分到ui-dialogue.js）
    showGiftSelection(npcId) {
        return showGiftSelectionImpl.call(this, npcId);
    },
};

// 初始化

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.UI = UI;