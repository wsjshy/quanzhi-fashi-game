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
    _showSingleMessage(text) {
        const ui = this;
        
        console.log('[消息] 显示消息:', text.substring(0, 50));
        
        // 立即开启行动冷却，防止点击穿透
        if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
            Game._actionCooldown = true;
        }
        
        // 禁用所有行动按钮，防止点击穿透
        document.body.classList.add('message-showing');
        
        // 禁用主容器点击，防止点击穿透
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.pointerEvents = 'none';
        }
        
        // 全局点击拦截：在捕获阶段阻止所有弹窗外部的点击事件，防止点击穿透
        // 重要：使用局部变量保存拦截器引用，避免多条消息时互相覆盖导致无法移除
        const clickInterceptor = (e) => {
            // 检查点击目标是否在弹窗内部
            let target = e.target;
            let inPopup = false;
            while (target) {
                if (target.classList && (target.classList.contains('mobile-popup') || target.classList.contains('mobile-popup-overlay'))) {
                    inPopup = true;
                    break;
                }
                target = target.parentElement;
            }
            // 如果不在弹窗内部，阻止事件
            if (!inPopup) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[消息] 拦截到弹窗外部点击，已阻止');
            }
        };
        this._globalClickInterceptor = clickInterceptor; // 保留全局引用用于兼容
        // v0.92.11: 先移除之前的点击拦截器，防止多个拦截器叠加
        if (this._prevClickInterceptor) {
            document.removeEventListener('click', this._prevClickInterceptor, true);
            document.removeEventListener('mousedown', this._prevClickInterceptor, true);
            document.removeEventListener('mouseup', this._prevClickInterceptor, true);
        }
        this._prevClickInterceptor = clickInterceptor;
        document.addEventListener('click', clickInterceptor, true);
        document.addEventListener('mousedown', clickInterceptor, true);
        document.addEventListener('mouseup', clickInterceptor, true);
        
        // 创建遮罩层（阻止所有点击穿透）
        const overlay = document.createElement('div');
        overlay.className = 'mobile-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999998;
            cursor: pointer;
            pointer-events: auto;
        `;

        // 创建消息框
        const msgBox = document.createElement('div');
        msgBox.className = 'mobile-popup';
        msgBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #6666aa;
            border-radius: 10px;
            padding: 30px 40px 25px;
            color: #e0e0ff;
            font-size: 16px;
            line-height: 1.8;
            text-align: center;
            z-index: 9999999;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 0 30px rgba(100, 100, 255, 0.5);
            white-space: pre-line;
            pointer-events: auto;
        `;
        
        // 消息内容
        const contentDiv = document.createElement('div');
        contentDiv.textContent = text;
        contentDiv.style.marginBottom = '20px';
        msgBox.appendChild(contentDiv);
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '确定';
        closeBtn.style.cssText = `
            padding: 10px 40px;
            background: linear-gradient(135deg, #4444aa, #6666cc);
            border: 2px solid #7777dd;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            pointer-events: auto;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'linear-gradient(135deg, #5555bb, #7777dd)';
            closeBtn.style.transform = 'scale(1.05)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'linear-gradient(135deg, #4444aa, #6666cc)';
            closeBtn.style.transform = 'scale(1)';
        };
        msgBox.appendChild(closeBtn);

        // 关闭消息函数
        let closed = false;
        const closeMessage = () => {
            if (closed) return;
            closed = true;
            
            console.log('[消息] 关闭消息');
            
            // 记录消息关闭时间，用于防止点击穿透
            ui._lastMessageCloseTime = Date.now();
            
            // 立即移除 message-showing 类，恢复界面点击
            document.body.classList.remove('message-showing');
            
            // 立即恢复主容器点击
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.pointerEvents = '';
            }
            
            // 延迟移除全局点击拦截器，防止弹窗关闭后的延迟点击事件（v0.92.16: 500ms→50ms）
            setTimeout(() => {
                document.removeEventListener('click', clickInterceptor, true);
                document.removeEventListener('mousedown', clickInterceptor, true);
                document.removeEventListener('mouseup', clickInterceptor, true);
                // 如果全局引用还是这个拦截器，就清空
                if (ui._globalClickInterceptor === clickInterceptor) {
                    ui._globalClickInterceptor = null;
                }
            }, 50);
            
            // 设置行动冷却，防止点击穿透/延迟触发（v0.92.16: 500ms→50ms）
            if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
                Game._actionCooldown = true;
                setTimeout(() => {
                    Game._actionCooldown = false;
                }, 50);
            }
            
            // 先创建阻止点击穿透的遮罩层（在最顶层）
            const blocker = document.createElement('div');
            blocker.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999999;pointer-events:auto;background:transparent;';
            // 阻止所有点击事件
            const stopEvent = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            };
            blocker.addEventListener('mousedown', stopEvent);
            blocker.addEventListener('mouseup', stopEvent);
            blocker.addEventListener('click', stopEvent);
            blocker.addEventListener('touchstart', stopEvent);
            blocker.addEventListener('touchend', stopEvent);
            document.body.appendChild(blocker);
            
            overlay.remove();
            msgBox.remove();
            
            // v1.2.0: 200ms→300ms，更彻底防止点击穿透（部分设备点击事件延迟较长）
            setTimeout(() => blocker.remove(), 300);
            
            // 处理下一条消息
            ui._processNextMessage();
        };
        
        // 点击遮罩层关闭
        overlay.addEventListener('click', (e) => {
            console.log('[消息] 点击遮罩层关闭');
            e.preventDefault();
            e.stopPropagation();
            closeMessage();
        });
        
        // 点击消息框内容也关闭（除了按钮）
        contentDiv.addEventListener('click', (e) => {
            console.log('[消息] 点击内容关闭');
            e.preventDefault();
            e.stopPropagation();
            closeMessage();
        });
        
        // 点击关闭按钮
        closeBtn.addEventListener('click', (e) => {
            console.log('[消息] 点击确定按钮关闭');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            closeMessage();
        });
        
        // 阻止消息框的点击事件冒泡到遮罩层
        msgBox.addEventListener('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(msgBox);
        
        console.log('[消息] 弹窗已添加到页面');

        // 5秒后自动消失
        setTimeout(() => {
            if (!closed) {
                console.log('[消息] 自动关闭');
                closeMessage();
            }
        }, 5000);
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
    showElementSelectionAfterTalent(talent) {
        // 博城篇11系
        const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'plant', 'summon'];
        const elementNames = {
            fire: '🔥 火系', ice: '❄️ 冰系', thunder: '⚡ 雷系', earth: '🪨 土系',
            wind: '🌪️ 风系', water: '💧 水系', light: '✨ 光系', dark: '🌑 暗影系',
            heal: '💚 治愈系', plant: '🌿 植物系', summon: '📜 召唤系'
        };
        const elementColors = {
            fire: '#ff6633', ice: '#66ccff', thunder: '#ffcc00', earth: '#cc9966',
            wind: '#99ff99', water: '#6699ff', light: '#ffffcc', dark: '#9966ff',
            heal: '#66ff99', plant: '#66cc66', summon: '#cc99ff'
        };
        const elementDescs = {
            fire: '高爆发·燃烧持续伤害',
            ice: '强控制·冻结减速',
            thunder: '高速度·麻痹连锁',
            earth: '高防御·护盾控制',
            wind: '高闪避·速度快',
            water: '治疗恢复·湿润控制',
            light: '神圣伤害·净化治疗',
            dark: '高暴击·吸血诅咒',
            heal: '强力治疗·辅助增益',
            plant: '控制束缚·持续中毒',
            summon: '召唤兽协同·以多打少'
        };
        window._elementColors = elementColors;

        const elementWeights = {
            fire: 15, ice: 12, thunder: 10, earth: 15,
            wind: 15, water: 15, light: 8, dark: 5,
            heal: 6, plant: 7, summon: 4
        };

        // 加权随机选3个
        const available = [...allElements];
        const candidateElements = [];
        while (candidateElements.length < 3 && available.length > 0) {
            const totalWeight = available.reduce((sum, e) => sum + elementWeights[e], 0);
            let rand = Math.random() * totalWeight;
            for (let i = 0; i < available.length; i++) {
                rand -= elementWeights[available[i]];
                if (rand <= 0) {
                    candidateElements.push(available[i]);
                    available.splice(i, 1);
                    break;
                }
            }
        }

        let elementsHtml = '';
        candidateElements.forEach(elem => {
            elementsHtml += `
                <div class="element-card" onclick="Game.selectElementAfterTalent('${elem}')" 
                     id="elem-${elem}"
                     style="
                        padding: 25px 20px;
                        background: rgba(30, 30, 60, 0.8);
                        border: 2px solid #444477;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                        font-size: 20px;
                        font-weight: bold;
                        color: ${elementColors[elem]};
                        min-width: 140px;
                     "
                     onmouseover="this.style.borderColor='${elementColors[elem]}'; this.style.boxShadow='0 0 20px ${elementColors[elem]}40'; this.style.transform='translateY(-3px)'"
                     onmouseout="this.style.borderColor='#444477'; this.style.boxShadow='none'; this.style.transform='translateY(0)'">
                    ${elementNames[elem]}
                    <div style="font-size:11px; color:#999; margin-top:6px; font-weight:normal; line-height:1.4;">${elementDescs[elem] || ''}</div>
                </div>
            `;
        });

        // 天赋信息展示
        let talentInfo = '';
        if (talent) {
            talentInfo = `
                <div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 12px 20px; margin-bottom: 25px; max-width: 500px; text-align: center;">
                    <div style="color: #ffd700; font-size: 16px; font-weight: bold; margin-bottom: 4px;">✨ ${talent.name}</div>
                    <div style="color: #aaa; font-size: 13px;">${talent.effectDesc || talent.description || ''}</div>
                </div>
            `;
        }

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
                <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;">
                <h2 style="font-size: 32px; color: #ffd700; margin-bottom: 10px;">选择元素系</h2>
                ${talentInfo}
                <p style="color: #8888aa; margin-bottom: 30px; font-size: 15px;">你的天赋让你与以下3种元素产生了共鸣，选择其一作为初始系别</p>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; align-items: center;">
                    ${elementsHtml}
                </div>
                <p style="color: #666; margin-top: 30px; font-size: 12px;">选择后不可更改</p>
                </div>
            </div>
        `;

        const _gc = document.getElementById('game-container');
        if (_gc) {
            _gc.style.pointerEvents = 'auto';
            _gc.style.zIndex = '9999';
        }
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
    showSkillDetail(skillId) {
        const skill = SkillSystem.getSkill(skillId);
        if (!skill) return;

        const elemInfo = this.getElementInfo(skill.element);
        const color = elemInfo.color || '#888';
        const icon = elemInfo.icon || '✨';

        // 技能类型中文
        const typeNames = {
            damage: '伤害技能', heal: '治疗技能', buff: '增益技能',
            debuff: '减益技能', summon: '召唤技能', utility: '辅助技能',
            passive: '被动技能', special: '特殊技能'
        };
        const typeName = typeNames[skill.type] || skill.type || '技能';

        // v2.9.1: 控制技能标记（可打断魔法师施法）
        const controlEffects = ['stun', 'silence', 'freeze', 'paralyze', 'bind', 'fear', 'sleep', 'confuse', 'charm'];
        const hasControlEffect = skill.statusEffects?.some(e => controlEffects.includes(e.type || e)) ||
            skill.effects?.some(e => controlEffects.includes(e.type || e)) ||
            (skill.description && /眩晕|沉默|冰冻|冻结|麻痹|束缚|恐惧|睡眠|混乱|魅惑/.test(skill.description));
        const controlTag = hasControlEffect ? '<span style="color:#66ccff;font-size:11px;margin-left:6px;" title="控制技能，可100%打断正在引导施法的魔法师敌人">🔮 控制技能（可打断施法）</span>' : '';

        // 技能效果信息
        const statsHtml = [];
        if (skill.damageMultiplier) statsHtml.push(`<span style="color:#ff8866;">伤害倍率: ${(skill.damageMultiplier*100).toFixed(0)}%</span>`);
        if (skill.baseDamage) statsHtml.push(`<span style="color:#ff8866;">基础伤害: ${skill.baseDamage}</span>`);
        if (skill.mpCost !== undefined) statsHtml.push(`<span style="color:#88aaff;">MP消耗: ${skill.mpCost}</span>`);
        if (skill.cooldown) statsHtml.push(`<span style="color:#ffcc66;">冷却: ${skill.cooldown}回合</span>`);
        if (skill.hitRate) statsHtml.push(`<span style="color:#aaffaa;">命中率: ${(skill.hitRate*100).toFixed(0)}%</span>`);
        if (skill.critRate) statsHtml.push(`<span style="color:#ff66aa;">暴击率: ${(skill.critRate*100).toFixed(0)}%</span>`);
        // v2.9.0: 打断概率和解锁等级
        if (skill.interruptChance !== undefined && skill.interruptChance > 0) {
            const interruptColor = skill.interruptChance >= 0.4 ? '#ff4444' : skill.interruptChance >= 0.2 ? '#ffaa44' : '#88ff88';
            statsHtml.push(`<span style="color:${interruptColor};">打断概率: ${(skill.interruptChance*100).toFixed(0)}%</span>`);
        }
        // v2.9.0: 施法时间（引导回合数）
        const castTimeMap = { '初阶': 2, '中阶': 3, '高阶': 4, '超阶': 5 };
        const baseCastTime = castTimeMap[skill.tier] || 2;
        if (baseCastTime > 1) {
            statsHtml.push(`<span style="color:#cc88ff;">引导时间: ${baseCastTime}回合（精神力越高越快）</span>`);
        } else {
            statsHtml.push(`<span style="color:#88ff88;">瞬发（无需引导）</span>`);
        }
        if (skill.unlockLevel) {
            const playerLv = typeof Player !== 'undefined' ? Player.getPlayerLevel() : 1;
            const locked = playerLv < skill.unlockLevel;
            statsHtml.push(`<span style="color:${locked?'#ff4444':'#88ff88'};">解锁等级: Lv.${skill.unlockLevel}${locked?' (未解锁)':''}</span>`);
        }
        if (skill.targetType) {
            const targetNames = {enemy:'敌方单体', all_enemies:'敌方全体', self:'自身', ally:'友方单体', all_allies:'友方全体'};
            statsHtml.push(`<span style="color:#aaa;">目标: ${targetNames[skill.targetType] || skill.targetType}</span>`);
        }

        // 元素反应说明
        const reactionExplanations = {
            fire: { '燃烧': '火系技能对目标附加灼烧状态，持续造成伤害，灼烧层数越高伤害越高。', '融化': '火系攻击对冰冻状态的目标造成双倍伤害，并解除冰冻。' },
            ice: { '冻结': '冰系技能有概率使目标冻结，无法行动1-2回合，对已减速目标概率提升。', '碎冰': '攻击冻结状态的目标造成额外暴击伤害。' },
            thunder: { '感电': '雷系技能使目标感电，受到的雷系伤害提升50%，与水系湿润触发连锁反应。', '麻痹': '雷系技能有概率使目标麻痹，有概率无法行动并降低命中率。' },
            water: { '湿润': '水系技能使目标湿润，受到的雷系伤害提升50%，与雷系触发感电反应。', '治疗': '水系技能可恢复HP，部分技能可净化负面状态。' },
            wind: { '连击': '风系技能可触发连击，连续攻击多次，每次伤害递减。', '闪避': '风系技能可提升闪避率，完全躲避攻击。' },
            earth: { '眩晕': '土系技能有概率使目标眩晕，无法行动1回合。', '护盾': '土系技能可生成护盾，吸收伤害。' },
            light: { '净化': '光系技能可移除负面状态，对暗影系敌人造成额外伤害。', '圣光': '光系技能附带圣光效果，持续恢复HP或提升防御。' },
            dark: { '诅咒': '暗系技能可附加诅咒，降低目标攻击力或防御力。', '吸血': '暗系技能造成伤害时恢复一定比例的HP。' },
            heal: { '治疗': '治愈系技能恢复HP，部分技能可复活队友。', '净化': '治愈系技能可移除负面状态。' },
            plant: { '中毒': '植物系技能可附加中毒，持续造成伤害，可叠加层数。', '束缚': '植物系技能可使目标束缚，无法行动。' },
            summon: { '召唤': '召唤系技能可召唤召唤兽协同作战，召唤兽有独立的HP和技能。' }
        };

        // 根据技能系别显示相关元素反应
        const elemReactions = reactionExplanations[skill.element] || {};
        const reactionsHtml = Object.entries(elemReactions).map(([name, desc]) => `
            <div style="margin-bottom:6px;padding:6px 8px;background:${color}11;border-left:2px solid ${color};border-radius:0 4px 4px 0;">
                <span style="color:${color};font-size:11px;font-weight:bold;">${name}</span>
                <div style="color:#aaa;font-size:10px;margin-top:2px;line-height:1.4;">${desc}</div>
            </div>
        `).join('');

        // 术语解释（根据技能系别和效果关键词）
        const skillTerms = {
            fire: [['灼烧', '持续伤害效果，每回合造成基于攻击力的百分比伤害，可叠加层数。'], ['燃点', '火系专属资源，通过使用火系技能积累，满时可释放强力技能。']],
            ice: [['冻结', '控制效果，使目标无法行动1-2回合，对已减速目标概率提升。'], ['减速', '降低目标速度，影响行动顺序和闪避率。']],
            thunder: [['麻痹', '控制效果，使目标有概率无法行动，并降低其命中率。'], ['感电', '使目标受到的雷系伤害提升，可与水系湿润触发反应。']],
            water: [['湿润', '使目标受到的雷系伤害提升50%，与雷系触发感电反应。'], ['潮汐', '水系专属形态，每2回合自动切换涨潮/退潮，影响治疗和伤害。']],
            wind: [['连击', '连续使用风系技能可叠加连击层数，每层提升伤害和速度。'], ['闪避', '完全躲避攻击的概率，风系天赋大幅提升闪避率。']],
            earth: [['岩力', '土系专属资源，通过受到攻击或使用土系技能积累，满时可释放地震。'], ['护盾', '吸收伤害的保护层，土系技能可生成各种护盾。']],
            light: [['净化', '移除目标身上的负面状态效果。'], ['圣光', '光系专属形态，可切换圣光/圣盾形态，影响伤害和防御。']],
            dark: [['诅咒', '持续削弱效果，降低目标攻击力或防御力。'], ['潜行', '暗系触发型效果，进入战斗后自动潜行，首次攻击暴击率大幅提升。']],
            heal: [['治愈之力', '治愈系专属资源，通过治疗技能积累，满时可释放生命绽放。'], ['复苏', '复活已倒下的队友，恢复一定比例HP。']],
            plant: [['中毒', '持续伤害效果，每回合造成伤害，可叠加层数。'], ['束缚', '控制效果，使目标无法行动，持续2回合。']],
            summon: [['召唤兽', '召唤系核心机制，可召唤各种召唤兽协同作战。'], ['契约', '与召唤兽建立契约，契约等级影响召唤兽的属性和技能。']]
        };

        const terms = skillTerms[skill.element] || [];
        const termsHtml = terms.map(([term, desc]) => `
            <div style="margin-bottom:6px;padding:6px 8px;background:rgba(255,215,0,0.05);border-left:2px solid #ffd700;border-radius:0 4px 4px 0;">
                <span style="color:#ffd700;font-size:11px;font-weight:bold;">📖 ${term}</span>
                <div style="color:#aaa;font-size:10px;margin-top:2px;line-height:1.4;">${desc}</div>
            </div>
        `).join('');

        this.elements.gameContainer.innerHTML += `
            <div id="skill-detail-overlay" style="
                position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(0,0,0,0.85);z-index:10000;
                display:flex;align-items:center;justify-content:center;
                backdrop-filter:blur(4px);
            " onclick="if(event.target===this)this.remove()">
                <div style="
                    width:90%;max-width:500px;max-height:85vh;overflow-y:auto;
                    background:linear-gradient(135deg,#1a1a2e,#16213e);
                    border:2px solid ${color};border-radius:16px;
                    padding:20px;box-shadow:0 0 40px ${color}44;
                ">
                    <!-- 标题 -->
                    <div style="text-align:center;margin-bottom:15px;">
                        <div style="font-size:22px;font-weight:bold;color:${color};margin-bottom:4px;">
                            ${icon} ${skill.name}
                        </div>
                        <div style="font-size:11px;color:#888;">
                            ${skill.tier || ''} · ${typeName} · ${elemInfo.name || skill.element}
                            ${controlTag}
                        </div>
                    </div>

                    <!-- 技能描述 -->
                    <div style="background:#0a0a1a;border-radius:8px;padding:12px;margin-bottom:15px;">
                        <div style="color:#ccc;font-size:12px;line-height:1.6;">${skill.description}</div>
                    </div>

                    <!-- 技能数值 -->
                    ${statsHtml.length > 0 ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📊 技能数值</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${statsHtml.map(s => `<span style="padding:4px 8px;background:#0a0a1a;border:1px solid #333;border-radius:6px;font-size:11px;">${s}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- 元素反应 -->
                    ${reactionsHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">⚡ 元素反应</div>
                        ${reactionsHtml}
                    </div>
                    ` : ''}

                    <!-- 术语解释 -->
                    ${termsHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📖 术语解释</div>
                        ${termsHtml}
                    </div>
                    ` : ''}

                    <!-- 关闭按钮 -->
                    <div style="text-align:center;margin-top:15px;">
                        <button onclick="document.getElementById('skill-detail-overlay').remove();" style="
                            padding:10px 30px;background:linear-gradient(135deg,${color},${color}88);
                            color:#000;border:none;border-radius:8px;font-size:14px;font-weight:bold;
                            cursor:pointer;transition:all 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ========== v2.8.3 敌人详情弹窗 ==========
    /**
     * 显示敌人详细介绍弹窗
     * @param {string} enemyId - 敌人ID
     */
    showEnemyDetail(enemyId) {
        const enemy = (typeof DataEnemies !== 'undefined' && DataEnemies[enemyId]) || 
                      (typeof Enemies !== 'undefined' && Enemies[enemyId]) || null;
        if (!enemy) return;

        // 妖魔类型颜色
        const tierColors = {
            servant: '#88cc88', warrior: '#ccaa44', commander: '#cc6644',
            monarch: '#aa44cc', boss: '#ff4444', human: '#aaaaff', dummy: '#888'
        };
        const tierNames = {
            servant: '奴仆级', warrior: '战将级', commander: '统领级',
            monarch: '君主级', boss: 'BOSS', human: '人类', dummy: '训练目标'
        };
        const tier = enemy.demonTier || enemy.enemyType || 'servant';
        const color = tierColors[tier] || '#888';
        const tierName = tierNames[tier] || tier;

        // 机制型特性 - 从DemonTraits获取
        const traitData = (typeof DemonTraits !== 'undefined' && DemonTraits[enemyId]) ? DemonTraits[enemyId] : null;
        const traits = traitData ? (traitData.traits || []) : (enemy.traits || []);
        const traitsHtml = [];
        if (traits.length > 0) {
            traits.forEach(trait => {
                const isMechanic = trait.type === 'mechanic';
                const traitColor = isMechanic ? '#ff8844' : '#88aaff';
                const traitIcon = isMechanic ? '⚙️' : '✨';
                traitsHtml.push(`
                    <div style="margin-bottom:8px;padding:8px 10px;background:${traitColor}11;border:1px solid ${traitColor}44;border-radius:8px;">
                        <div style="color:${traitColor};font-size:12px;font-weight:bold;margin-bottom:3px;">
                            ${traitIcon} ${trait.name} ${isMechanic ? '<span style="font-size:10px;color:#ff8844aa;">[机制型]</span>' : '<span style="font-size:10px;color:#88aaffaa;">[被动]</span>'}
                        </div>
                        <div style="color:#bbb;font-size:11px;line-height:1.5;">${trait.description}</div>
                        ${trait.cooldown ? `<div style="color:#ffcc66;font-size:10px;margin-top:3px;">冷却: ${trait.cooldown}回合</div>` : ''}
                    </div>
                `);
            });
        }

        // 弱点和抗性（如果有）
        const weaknesses = enemy.weaknesses || [];
        const resistances = enemy.resistances || [];
        const weakHtml = weaknesses.length > 0 ? `
            <div style="margin-bottom:8px;">
                <span style="color:#ff6666;font-size:11px;font-weight:bold;">弱点: </span>
                ${weaknesses.map(w => `<span style="color:#ff8888;font-size:11px;margin-right:6px;">${w}</span>`).join('')}
            </div>
        ` : '';
        const resistHtml = resistances.length > 0 ? `
            <div style="margin-bottom:8px;">
                <span style="color:#66aaff;font-size:11px;font-weight:bold;">抗性: </span>
                ${resistances.map(r => `<span style="color:#88aaff;font-size:11px;margin-right:6px;">${r}</span>`).join('')}
            </div>
        ` : '';

        // 掉落物品（如果有）
        const drops = enemy.drops || [];
        const dropsHtml = drops.length > 0 ? `
            <div style="margin-bottom:15px;">
                <div style="color:#aaa;font-size:12px;margin-bottom:8px;">🎁 可能掉落</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${drops.map(d => `<span style="padding:4px 8px;background:#0a0a1a;border:1px solid #44aa4444;border-radius:6px;font-size:11px;color:#88ff88;">${d.itemId || d.name || '物品'}</span>`).join('')}
                </div>
            </div>
        ` : '';

        this.elements.gameContainer.innerHTML += `
            <div id="enemy-detail-overlay" style="
                position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(0,0,0,0.85);z-index:10000;
                display:flex;align-items:center;justify-content:center;
                backdrop-filter:blur(4px);
            " onclick="if(event.target===this)this.remove()">
                <div style="
                    width:90%;max-width:500px;max-height:85vh;overflow-y:auto;
                    background:linear-gradient(135deg,#1a1a2e,#16213e);
                    border:2px solid ${color};border-radius:16px;
                    padding:20px;box-shadow:0 0 40px ${color}44;
                ">
                    <!-- 标题 -->
                    <div style="text-align:center;margin-bottom:15px;">
                        <div style="font-size:22px;font-weight:bold;color:${color};margin-bottom:4px;">
                            👹 ${enemy.name || enemyId}
                        </div>
                        <div style="font-size:11px;color:#888;">
                            Lv.${enemy.level || '?'} · ${tierName} ${enemy.isBoss ? '· BOSS' : ''}
                        </div>
                    </div>

                    <!-- 基础数值 -->
                    <div style="background:#0a0a1a;border-radius:8px;padding:12px;margin-bottom:15px;">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">
                            <div><span style="color:#888;">HP: </span><span style="color:#ff6666;">${enemy.hp || enemy.maxHp || '?'}</span></div>
                            <div><span style="color:#888;">攻击: </span><span style="color:#ff8866;">${enemy.attack || '?'}</span></div>
                            <div><span style="color:#888;">防御: </span><span style="color:#88aaff;">${enemy.defense || '?'}</span></div>
                            <div><span style="color:#888;">速度: </span><span style="color:#aaffaa;">${enemy.speed || '?'}</span></div>
                        </div>
                        ${weakHtml}
                        ${resistHtml}
                    </div>

                    <!-- 特性列表 -->
                    ${traitsHtml.length > 0 ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">⚙️ 特性与机制</div>
                        ${traitsHtml.join('')}
                    </div>
                    ` : '<div style="color:#666;font-size:11px;margin-bottom:15px;">暂无特殊特性</div>'}

                    ${dropsHtml}

                    <!-- 关闭按钮 -->
                    <div style="text-align:center;margin-top:15px;">
                        <button onclick="document.getElementById('enemy-detail-overlay').remove();" style="
                            padding:10px 30px;background:linear-gradient(135deg,${color},${color}88);
                            color:#000;border:none;border-radius:8px;font-size:14px;font-weight:bold;
                            cursor:pointer;transition:all 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
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
    showDamageNumber(amount, type, isPlayer) {
        const battleScreen = document.getElementById('battle-screen');
        if (!battleScreen) return;
        
        const isPortrait = UI.isPortrait();
        
        // 闪避/免疫特殊处理
        if (type === 'dodge' || type === 'miss') {
            const dodgeEl = document.createElement('div');
            dodgeEl.textContent = type === 'dodge' ? '闪避！' : '未命中';
            dodgeEl.style.cssText = `
                position: absolute;
                ${isPlayer ? (isPortrait ? 'left:50%;' : 'left:20%;') : (isPortrait ? 'left:50%;' : 'right:20%;')}
                ${isPortrait ? (isPlayer ? 'bottom:30%;' : 'top:24%;') : 'bottom:45%;'}
                font-size: ${isPortrait ? '20px' : '24px'};
                font-weight: bold;
                color: #aaaaaa;
                text-shadow: 0 0 8px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8);
                pointer-events: none;
                z-index: 100;
                transform: translateX(-50%);
                animation: dodgeFloat 1.2s ease-out forwards;
            `;
            if (!document.getElementById('dodge-number-style')) {
                const style = document.createElement('style');
                style.id = 'dodge-number-style';
                style.textContent = `
                    @keyframes dodgeFloat {
                        0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
                        30% { opacity: 1; transform: translateX(-50%) scale(1.1); }
                        100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            battleScreen.appendChild(dodgeEl);
            setTimeout(() => dodgeEl.remove(), 1200);
            return;
        }
        
        // 创建伤害数字元素
        const damageEl = document.createElement('div');
        
        const colors = {
            normal: '#ffffff',
            crit: '#ffdd44',
            magic: '#ffcc66',
            counter: '#ff6644',
            weakness: '#ff44ff',
            heal: '#66ff66',
            real: '#ff88ff'
        };
        const color = colors[type] || colors.normal;
        
        let prefix = '';
        if (type === 'crit') prefix = '💥';
        if (type === 'counter') prefix = '⚡';
        if (type === 'weakness') prefix = '✨';
        if (type === 'heal') prefix = '💚';
        if (type === 'real') prefix = '💎';
        
        const fontSize = type === 'crit' ? (isPortrait ? '32px' : '36px') : (isPortrait ? '22px' : '28px');
        
        damageEl.textContent = prefix + (type === 'heal' ? '+' : '-') + amount;
        damageEl.style.cssText = `
            position: absolute;
            ${isPlayer ? (isPortrait ? 'left:50%;' : 'left:20%;') : (isPortrait ? 'left:50%;' : 'right:20%;')}
            ${isPortrait ? (isPlayer ? 'bottom:28%;' : 'top:22%;') : 'bottom:45%;'}
            font-size: ${fontSize};
            font-weight: bold;
            color: ${color};
            text-shadow: 0 0 12px ${color}, 0 2px 4px rgba(0,0,0,0.9);
            pointer-events: none;
            z-index: 100;
            transform: translateX(-50%);
            animation: ${type === 'crit' ? 'critFloat' : 'damageFloat'} 1.5s ease-out forwards;
        `;
        
        if (!document.getElementById('damage-number-style')) {
            const style = document.createElement('style');
            style.id = 'damage-number-style';
            style.textContent = `
                @keyframes damageFloat {
                    0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
                    20% { opacity: 1; transform: translateX(-50%) translateY(-15px) scale(1.1); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-70px) scale(1); }
                }
                @keyframes critFloat {
                    0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.3) rotate(-10deg); }
                    15% { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1.5) rotate(5deg); }
                    30% { transform: translateX(-50%) translateY(-20px) scale(1.3) rotate(-3deg); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-80px) scale(1.1) rotate(0deg); }
                }
                @keyframes hitShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-5px); }
                    80% { transform: translateX(5px); }
                }
                @keyframes hitFlash {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(2) sepia(1) hue-rotate(-50deg) saturate(5); }
                }
                @keyframes attackLunge {
                    0% { transform: translateX(0); }
                    40% { transform: translateX(30px) scale(1.05); }
                    100% { transform: translateX(0); }
                }
                @keyframes attackLungeLeft {
                    0% { transform: translateX(0); }
                    40% { transform: translateX(-30px) scale(1.05); }
                    100% { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        battleScreen.appendChild(damageEl);
        setTimeout(() => damageEl.remove(), 1500);
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
    renderScheduledEventScreen(event, success) {
        try {
            console.log('[UI] 渲染大事件界面:', event.id, '成功:', success);
            
            const text = success ? event.successText : event.failText;
            const rewards = success ? event.successRewards : event.failPenalty;
    
            let rewardText = '';
            if (rewards) {
                if (rewards.exp) rewardText += rewards.exp > 0 ? `获得 ${rewards.exp} 经验\n` : `失去 ${-rewards.exp} 经验\n`;
                if (rewards.gold) rewardText += rewards.gold > 0 ? `获得 ${rewards.gold} 金币\n` : `失去 ${-rewards.gold} 金币\n`;
                if (rewards.items && rewards.items.length > 0) {
                    rewardText += '获得物品：\n';
                    rewards.items.forEach(item => {
                        const itemData = DataManager.getItem(item.itemId);
                        console.log('[UI] 物品数据:', item.itemId, itemData);
                        rewardText += `  ${itemData?.name || item.itemId} x${item.count || 1}\n`;
                    });
                }
            }
    
            console.log('[UI] 奖励文本:', rewardText);
            
            this.elements.gameContainer.innerHTML = `
                <div style="
                    width: 100%;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
                    padding: 40px;
                    position: relative;
                ">
                    <!-- 背景图片 -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                        opacity: 0.08;
                        filter: blur(3px);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    
                    <!-- 背景特效 -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: radial-gradient(circle at center, ${success ? 'rgba(100, 255, 100, 0.1)' : 'rgba(255, 100, 100, 0.1)'} 0%, transparent 70%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    
                    <div style="
                        max-width: 600px;
                        background: rgba(20, 20, 50, 0.95);
                        border: 2px solid ${success ? '#66cc66' : '#cc6666'};
                        border-radius: 15px;
                        padding: 40px;
                        box-shadow: 0 0 50px ${success ? 'rgba(100, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)'};
                        position: relative;
                        z-index: 1;
                    ">
                        <h2 style="color: ${success ? '#66ff66' : '#ff6666'}; font-size: 28px; margin-bottom: 10px; text-align: center;">
                            ${success ? '🎉' : '😔'} ${event.name}
                        </h2>
                        
                        <p style="color: #8888aa; font-size: 14px; margin-bottom: 20px; text-align: center;">
                            ${event.description}
                        </p>
                        
                        <p style="color: #d0d0f0; font-size: 17px; line-height: 1.8; margin-bottom: 30px; text-align: center;">
                            ${text}
                        </p>
                        
                        ${rewardText ? `
                        <div style="
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                            padding: 15px 20px;
                            margin-bottom: 30px;
                        ">
                            <pre style="color: ${success ? '#88ff88' : '#ff8888'}; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap; font-family: inherit;">${rewardText.trim()}</pre>
                        </div>
                        ` : ''}
                        
                        <div onclick="Game.closeScheduledEvent()" style="
                            width: 100%;
                            padding: 15px 25px;
                            background: linear-gradient(135deg, ${success ? '#2a5a2a' : '#5a2a2a'}, ${success ? '#4aaa4a' : '#aa4a4a'});
                            border: 2px solid ${success ? '#66cc66' : '#cc6666'};
                            border-radius: 10px;
                            color: #ffffff;
                            cursor: pointer;
                            font-size: 18px;
                            transition: all 0.3s;
                            box-sizing: border-box;
                            text-align: center;
                        " onmouseover="this.style.boxShadow='0 0 20px ${success ? 'rgba(100, 255, 100, 0.5)' : 'rgba(255, 100, 100, 0.5)'}" onmouseout="this.style.boxShadow='none'">
                            确认
                        </div>
                    </div>
                </div>
            `;
            
            console.log('[UI] 大事件界面渲染完成');
        } catch (e) {
            console.error('[UI] 渲染大事件界面出错:', e);
            console.error('[UI] 错误堆栈:', e.stack);
            this.elements.gameContainer.innerHTML = `
                <div style="padding: 40px; color: #ff6666;">
                    <h2>渲染出错</h2>
                    <p>${e.message}</p>
                    <button onclick="Game.closeScheduledEvent()" style="margin-top: 20px; padding: 10px 20px;">返回</button>
                </div>
            `;
        }
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

    // ========== 背包界面 ==========
    renderInventoryScreen() {
        const items = Inventory.getAllItems();
        const equipment = Inventory.getEquipment();
        const isMobileInv = window.innerWidth < 600;
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a3a, #2a3a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/fire_magic.jpg') center/cover;
                    opacity: 0.08;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #446677;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">🎒 背包</h2>
                    <div onclick="Game.closeInventory()" style="
                        padding: 10px 20px;
                        background: #553333;
                        border: 1px solid #775555;
                        border-radius: 8px;
                        color: #ffcccc;
                        cursor: pointer;
                        font-size: 15px;
                        display: inline-block;
                    ">关闭</div>
                </div>
                
                <div style="flex: 1; display: flex; flex-direction: ${isMobileInv ? 'column' : 'row'}; overflow: ${isMobileInv ? 'auto' : 'hidden'}; position: relative; z-index: 1;">
                    
                    <!-- 装备栏 -->
                    <div style="width: ${isMobileInv ? '100%' : '300px'}; padding: ${isMobileInv ? '15px' : '25px'}; border-right: ${isMobileInv ? 'none' : '2px solid #445566'}; border-bottom: ${isMobileInv ? '2px solid #445566' : 'none'};">
                        <h3 style="color: #ffd700; margin-bottom: 15px;">⚔️ 装备</h3>
                        
                        ${['weapon', 'armor', 'accessory'].map(slot => {
                            const slotNames = { weapon: '武器', armor: '防具', accessory: '饰品' };
                            const item = equipment[slot];
                            const enhanceLevel = Player.enhanceLevels[slot] || 0;
                            const enhanceCost = Player.getEnhanceCost(slot);
                            const enhanceRate = Math.floor(Player.getEnhanceSuccessRate(slot) * 100);
                            // v0.10.0: 稀有度颜色
                            const rarityColors = { '普通': '#aaaaaa', '优秀': '#66ff66', '稀有': '#6699ff', '史诗': '#cc66ff', '传说': '#ffaa44' };
                            const rarityColor = item ? (rarityColors[item.rarity] || '#aaaaaa') : '#556677';
                            // v0.10.0: 装备评分计算
                            const calcScore = (equip) => {
                                if (!equip?.equipStats) return 0;
                                const s = equip.equipStats;
                                return Math.floor((s.attack || 0) * 2 + (s.defense || 0) * 1.5 + (s.speed || 0) * 2 + (s.maxHp || 0) * 0.1 + (s.maxMp || 0) * 0.1 + (s.critRate || 0) * 50 + (s.hitRate || 0) * 30);
                            };
                            const itemScore = item ? calcScore(item) : 0;
                            return `
                                <div style="
                                    padding: 15px;
                                    background: rgba(40, 50, 60, 0.8);
                                    border: 2px solid ${rarityColor};
                                    border-radius: 10px;
                                    margin-bottom: 15px;
                                    ${item ? `box-shadow: 0 0 8px ${rarityColor}33;` : ''}
                                ">
                                    <div style="font-size: 13px; color: #8899aa; margin-bottom: 5px;">${slotNames[slot]} ${enhanceLevel > 0 ? `<span style="color: #ff8844;">+${enhanceLevel}</span>` : ''}</div>
                                    ${item ? `
                                        <div style="font-size: 16px; color: ${rarityColor}; margin-bottom: 5px; font-weight: bold;">
                                            ${item.icon || '🔹'} ${item.name}
                                            <span style="font-size: 11px; color: #ffd700; background: rgba(100, 80, 20, 0.5); padding: 2px 6px; border-radius: 6px; margin-left: 6px;">⭐ ${itemScore}</span>
                                            <span style="font-size: 11px; color: ${rarityColor}; margin-left: 6px;">[${item.rarity || '普通'}]</span>
                                        </div>
                                        <div style="font-size: 12px; color: #aabbcc;">
                                            ${Object.entries(item.equipStats || {}).map(([k, v]) => {
                                                const statNames = { attack: '攻击', defense: '防御', speed: '速度', maxHp: '生命', maxMp: '魔法', critRate: '暴击', hitRate: '命中' };
                                                // v1.2.1: 与player.js强化计算逻辑一致
                                                let enhancedValue;
                                                if (v < 1 && v > 0) {
                                                    enhancedValue = Math.round(v * (1 + enhanceLevel * 0.1) * 10000) / 10000;
                                                    const displayVal = (enhancedValue * 100).toFixed(1) + '%';
                                                    const baseDisplay = (v * 100).toFixed(1) + '%';
                                                    return `${statNames[k] || k}: +${displayVal}${enhanceLevel > 0 ? ` <span style="color:#66ff88;">(基础${baseDisplay})</span>` : ''}`;
                                                } else {
                                                    enhancedValue = Math.floor(v * (1 + enhanceLevel * 0.1));
                                                    if (enhanceLevel > 0 && enhancedValue <= v) enhancedValue = v + enhanceLevel;
                                                    return `${statNames[k] || k}: +${enhancedValue}${enhanceLevel > 0 ? ` <span style="color:#66ff88;">(基础${v})</span>` : ''}`;
                                                }
                                            }).join(' | ')}
                                        </div>
                                        <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                                            <div onclick="Game.unequipItem('${slot}')" style="
                                                padding: 5px 12px;
                                                background: #554433;
                                                border: 1px solid #776655;
                                                border-radius: 5px;
                                                color: #ffddaa;
                                                cursor: pointer;
                                                font-size: 12px;
                                                display: inline-block;
                                            ">卸下</div>
                                            <div onclick="Game.enhanceEquipment('${slot}')" style="
                                                padding: 5px 12px;
                                                background: ${enhanceLevel >= 10 ? '#444' : (Player.enhanceFailStreak?.[slot] >= 3 ? 'linear-gradient(135deg, #9966ff, #cc66ff)' : '#445533')};
                                                border: 1px solid ${enhanceLevel >= 10 ? '#666' : (Player.enhanceFailStreak?.[slot] >= 3 ? '#aa66ff' : '#667755')};
                                                border-radius: 5px;
                                                color: ${enhanceLevel >= 10 ? '#888' : (Player.enhanceFailStreak?.[slot] >= 3 ? '#fff' : '#ddffaa')};
                                                cursor: ${enhanceLevel >= 10 ? 'not-allowed' : 'pointer'};
                                                font-size: 12px;
                                                display: inline-block;
                                                ${Player.enhanceFailStreak?.[slot] >= 3 ? 'animation: pulse 1.5s infinite;' : ''}
                                            ">${enhanceLevel >= 10 ? '已满级' : (Player.enhanceFailStreak?.[slot] >= 3 ? `✨ 保底强化(${enhanceCost}金/100%)` : `强化(${enhanceCost}金/${enhanceRate}%)`)}</div>
                                        </div>
                                        ${enhanceLevel < 10 && Player.enhanceFailStreak?.[slot] < 3 ? (() => {
                                            // v0.74.0: 显示可用强化材料
                                            const materials = Player.getAvailableEnhanceMaterials();
                                            if (materials.length === 0) return '';
                                            return `
                                                <div style="margin-top: 8px; padding: 6px 10px; background: rgba(60, 50, 30, 0.5); border-radius: 6px; border: 1px solid #776644;">
                                                    <div style="font-size: 11px; color: #ffcc88; margin-bottom: 4px;">🧪 使用材料提高成功率：</div>
                                                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                                        ${materials.map(m => {
                                                            const finalRate = Math.min(95, enhanceRate + Math.floor(m.bonus * 100));
                                                            return `<div onclick="Game.enhanceEquipment('${slot}', '${m.id}')" style="
                                                                padding: 3px 8px;
                                                                background: #443322;
                                                                border: 1px solid #665544;
                                                                border-radius: 4px;
                                                                color: #ffddaa;
                                                                cursor: pointer;
                                                                font-size: 11px;
                                                            " title="使用${m.name}，成功率${enhanceRate}%→${finalRate}%">
                                                                ${m.icon} ${m.name} x${m.count} <span style="color:#66ff88;">+${Math.floor(m.bonus * 100)}%</span>
                                                            </div>`;
                                                        }).join('')}
                                                    </div>
                                                </div>
                                            `;
                                        })() : ''}
                                        ${enhanceLevel < 10 && Player.enhanceFailStreak?.[slot] > 0 ? `
                                            <div style="font-size: 11px; color: ${Player.enhanceFailStreak[slot] >= 3 ? '#cc66ff' : '#ff9966'}; margin-top: 6px;">
                                                🔄 已连续失败 ${Player.enhanceFailStreak[slot]} 次${Player.enhanceFailStreak[slot] >= 3 ? '，下次必定成功！' : `，再失败 ${3 - Player.enhanceFailStreak[slot]} 次触发保底`}
                                            </div>
                                        ` : ''}
                                        ${enhanceLevel > 0 ? `
                                            <div onclick="Game.showInheritPanel('${slot}')" style="
                                                margin-top: 8px;
                                                padding: 6px 12px;
                                                background: linear-gradient(135deg, #335577, #4477aa);
                                                border: 1px solid #5588bb;
                                                border-radius: 6px;
                                                color: #aaddff;
                                                cursor: pointer;
                                                font-size: 12px;
                                                text-align: center;
                                            " title="将强化等级转移到同部位新装备">
                                                🔄 强化继承（换装备不浪费）
                                            </div>
                                        ` : ''}
                                        ${enhanceLevel < 10 ? `
                                            <div style="font-size: 11px; color: #88ccaa; margin-top: 4px;">
                                                ⬆️ 强化到+${enhanceLevel + 1}后：
                                                ${Object.entries(item.equipStats || {}).map(([k, v]) => {
                                                    const statNames = { attack: '攻击', defense: '防御', speed: '速度', maxHp: '生命', maxMp: '魔法', critRate: '暴击', hitRate: '命中' };
                                                    // v1.2.1: 与player.js强化计算逻辑一致
                                                    let currentVal, nextVal;
                                                    if (v < 1 && v > 0) {
                                                        currentVal = Math.round(v * (1 + enhanceLevel * 0.1) * 10000) / 10000;
                                                        nextVal = Math.round(v * (1 + (enhanceLevel + 1) * 0.1) * 10000) / 10000;
                                                        const diff = ((nextVal - currentVal) * 100).toFixed(1) + '%';
                                                        return `${statNames[k] || k}+${diff}`;
                                                    } else {
                                                        currentVal = Math.floor(v * (1 + enhanceLevel * 0.1));
                                                        if (enhanceLevel > 0 && currentVal <= v) currentVal = v + enhanceLevel;
                                                        nextVal = Math.floor(v * (1 + (enhanceLevel + 1) * 0.1));
                                                        if (nextVal <= v) nextVal = v + (enhanceLevel + 1);
                                                        const diff = nextVal - currentVal;
                                                        return `${statNames[k] || k}+${diff}`;
                                                    }
                                                }).join('、')}
                                            </div>
                                        ` : ''}
                                    ` : `
                                        <div style="font-size: 14px; color: #667788;">空</div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- 物品栏 -->
                    <div style="flex: 1; width: ${isMobileInv ? '100%' : 'auto'}; padding: ${isMobileInv ? '15px' : '25px'}; overflow-y: auto;">
                        <h3 style="color: #ffd700; margin-bottom: 15px;">📦 物品 (${items.length} 种)</h3>
                        
                        <!-- 分类标签 -->
                        <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                            ${[
                                { key: 'all', name: '全部', icon: '📦' },
                                { key: 'consumable', name: '消耗品', icon: '🧪' },
                                { key: 'equipment', name: '装备', icon: '⚔️' },
                                { key: 'material', name: '材料', icon: '💎' },
                                { key: 'quest', name: '任务', icon: '📜' }
                            ].map(cat => {
                                const isActive = this.inventoryFilter === cat.key;
                                return `
                                    <div onclick="UI.setInventoryFilter('${cat.key}')" style="
                                        padding: 8px 16px;
                                        background: ${isActive ? 'rgba(100, 150, 200, 0.5)' : 'rgba(40, 50, 60, 0.8)'};
                                        border: 2px solid ${isActive ? '#6699cc' : '#556677'};
                                        border-radius: 8px;
                                        color: ${isActive ? '#ffffff' : '#aabbcc'};
                                        cursor: pointer;
                                        font-size: 14px;
                                        transition: all 0.2s;
                                        display: inline-block;
                                    ">${cat.icon} ${cat.name}</div>
                                `;
                            }).join('')}
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
                            ${items.filter(item => {
                                const itemData = item.data;
                                if (!itemData) return false;
                                if (this.inventoryFilter === 'all') return true;
                                if (this.inventoryFilter === 'consumable') return itemData.type === 'consumable' || itemData.usableOutOfBattle;
                                if (this.inventoryFilter === 'equipment') return itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'accessory' || itemData.type === 'equipment';
                                if (this.inventoryFilter === 'material') return itemData.type === 'material';
                                if (this.inventoryFilter === 'quest') return itemData.type === 'quest';
                                return true;
                            }).map(item => {
                                const itemData = item.data;
                                if (!itemData) return '';
                                const isEquip = itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'accessory' || itemData.type === 'equipment';
                                const canUse = itemData.usableOutOfBattle && !isEquip;
                                
                                // v0.10.0: 装备稀有度颜色和评分
                                const rarityColors = { '普通': '#aaaaaa', '优秀': '#66ff66', '稀有': '#6699ff', '史诗': '#cc66ff', '传说': '#ffaa44' };
                                const equipRarityColor = isEquip ? (rarityColors[itemData.rarity] || '#aaaaaa') : '#556677';
                                const calcEquipScore = (equip) => {
                                    if (!equip?.equipStats) return 0;
                                    const s = equip.equipStats;
                                    return Math.floor((s.attack || 0) * 2 + (s.defense || 0) * 1.5 + (s.speed || 0) * 2 + (s.maxHp || 0) * 0.1 + (s.maxMp || 0) * 0.1 + (s.critRate || 0) * 50 + (s.hitRate || 0) * 30);
                                };
                                const equipScore = isEquip ? calcEquipScore(itemData) : 0;
                                
                                // v0.10.0: 装备对比
                                let equipCompare = '';
                                if (isEquip && itemData.equipSlot) {
                                    const currentEquip = equipment[itemData.equipSlot];
                                    if (currentEquip) {
                                        const currentScore = calcEquipScore(currentEquip);
                                        const scoreDiff = equipScore - currentScore;
                                        const statNames = { attack: '攻击', defense: '防御', speed: '速度', maxHp: '生命', maxMp: '魔法', critRate: '暴击', hitRate: '命中' };
                                        const statDiffs = [];
                                        Object.keys(statNames).forEach(stat => {
                                            const newVal = itemData.equipStats?.[stat] || 0;
                                            const oldVal = currentEquip.equipStats?.[stat] || 0;
                                            const diff = newVal - oldVal;
                                            if (diff !== 0) {
                                                const displayVal = stat === 'critRate' || stat === 'hitRate' ? `${diff > 0 ? '+' : ''}${(diff * 100).toFixed(0)}%` : `${diff > 0 ? '+' : ''}${diff}`;
                                                statDiffs.push(`<span style="color: ${diff > 0 ? '#66ff66' : '#ff6666'};">${statNames[stat]} ${displayVal}</span>`);
                                            }
                                        });
                                        equipCompare = `
                                            <div style="font-size: 11px; margin-top: 6px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                                                <div style="color: ${scoreDiff >= 0 ? '#66ff66' : '#ff6666'}; margin-bottom: 3px;">评分对比: ${scoreDiff >= 0 ? '+' : ''}${scoreDiff}</div>
                                                <div>${statDiffs.join(' | ') || '属性相同'}</div>
                                            </div>
                                        `;
                                    } else {
                                        equipCompare = `<div style="font-size: 11px; color: #66ff66; margin-top: 6px;">当前槽位为空，装备后提升评分 +${equipScore}</div>`;
                                    }
                                }
                                
                                // v0.10.0: 装备属性显示
                                let equipStatsDisplay = '';
                                if (isEquip && itemData.equipStats) {
                                    const statNames = { attack: '攻击', defense: '防御', speed: '速度', maxHp: '生命', maxMp: '魔法', critRate: '暴击', hitRate: '命中' };
                                    equipStatsDisplay = `
                                        <div style="font-size: 11px; color: #88ccaa; margin-top: 4px;">
                                            ${Object.entries(itemData.equipStats).map(([k, v]) => {
                                                const displayVal = k === 'critRate' || k === 'hitRate' ? `${(v * 100).toFixed(0)}%` : `+${v}`;
                                                return `${statNames[k] || k} ${displayVal}`;
                                            }).join(' | ')}
                                        </div>
                                    `;
                                }
                                
                                return `
                                    <div style="
                                        padding: 12px;
                                        background: rgba(40, 50, 60, 0.8);
                                        border: 2px solid ${isEquip ? equipRarityColor : '#556677'};
                                        border-radius: 8px;
                                        ${isEquip ? `box-shadow: 0 0 6px ${equipRarityColor}33;` : ''}
                                    ">
                                        <div style="font-size: 15px; font-weight: bold; color: ${isEquip ? equipRarityColor : '#fff'}; margin-bottom: 4px;">
                                            ${itemData.icon || '📦'} ${itemData.name}
                                            ${isEquip ? `<span style="font-size: 10px; color: #ffd700; background: rgba(100, 80, 20, 0.5); padding: 1px 5px; border-radius: 5px; margin-left: 4px;">⭐${equipScore}</span>` : ''}
                                            <span style="float: right; color: #ffd700;">x${item.count}</span>
                                        </div>
                                        <div style="font-size: 12px; color: #999; margin-bottom: 6px; min-height: 20px;">
                                            ${itemData.description}${(itemData.dynamicLore || []).filter(d => WorldState.getFlag(d.flag)).map(d => `<span style="color: #88aacc;">${d.text}</span>`).join('')}
                                        </div>
                                        ${equipStatsDisplay}
                                        ${equipCompare}
                                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                                            ${canUse ? `
                                                <div onclick="Game.useItem('${item.itemId}')" style="
                                                    flex: 1;
                                                    padding: 5px;
                                                    background: #335544;
                                                    border: 1px solid #559977;
                                                    border-radius: 5px;
                                                    color: #aaffcc;
                                                    cursor: pointer;
                                                    font-size: 12px;
                                                    text-align: center;
                                                ">使用</div>
                                            ` : ''}
                                            ${isEquip ? `
                                                <div onclick="Game.equipItem('${item.itemId}')" style="
                                                    flex: 1;
                                                    padding: 5px;
                                                    background: #445533;
                                                    border: 1px solid #779955;
                                                    border-radius: 5px;
                                                    color: #ccffaa;
                                                    cursor: pointer;
                                                    font-size: 12px;
                                                    text-align: center;
                                                ">装备</div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('') || '<p style="color: #8899aa; grid-column: 1 / -1; text-align: center; padding: 40px;">背包空空如也</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
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
    renderQuestScreen() {
        const activeQuests = Player.activeQuests;
        const completedQuests = Player.completedQuests;
        const availableQuests = typeof QuestSystem !== 'undefined' ? QuestSystem.getAllAvailableQuests() : [];
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #2a1a3a, #3a2a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.08;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #664477;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">📜 任务日志</h2>
                    <div onclick="Game.closeQuestLog()" style="
                        padding: 10px 20px;
                        background: #553333;
                        border: 1px solid #775555;
                        border-radius: 8px;
                        color: #ffcccc;
                        cursor: pointer;
                        font-size: 15px;
                        display: inline-block;
                    ">关闭</div>
                </div>
                
                <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                    
                    <h3 style="color: #66ff66; margin-bottom: 15px;">🔵 进行中 (${activeQuests.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 40px;">
                        ${activeQuests.map(q => {
                            const quest = QuestSystem.getQuest(q.questId);
                            if (!quest) return '';
                            return `
                                <div style="
                                    padding: 20px;
                                    background: rgba(40, 30, 60, 0.8);
                                    border: 2px solid #554477;
                                    border-radius: 10px;
                                ">
                                    <div style="font-size: 20px; font-weight: bold; color: #e0d0ff; margin-bottom: 8px;">
                                        ${quest.isMainQuest ? '⭐ ' : ''}${quest.name}
                                    </div>
                                    <div style="font-size: 14px; color: #aaa; margin-bottom: 15px;">${quest.description}</div>
                                    <div style="font-size: 14px; color: #ccc; line-height: 1.8;">
                                        ${quest.objectives.map((obj, i) => {
                                            const progress = q.progress[i] || 0;
                                            const done = progress >= obj.count;
                                            return `<div>${done ? '✅' : '⬜'} ${obj.description} (${progress}/${obj.count})</div>`;
                                        }).join('')}
                                    </div>
                                    <div style="margin-top: 12px; font-size: 13px; color: #ffd700;">
                                        奖励: ${quest.rewards.exp ? quest.rewards.exp + ' 经验 ' : ''}${quest.rewards.gold ? quest.rewards.gold + ' 金币' : ''}
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p style="color: #8877aa;">暂无进行中的任务</p>'}
                    </div>
                    
                    <h3 style="color: #ffcc66; margin-bottom: 15px;">📋 可接取 (${availableQuests.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px;">
                        ${availableQuests.map(quest => {
                            return `
                                <div style="
                                    padding: 15px 20px;
                                    background: rgba(60, 45, 30, 0.7);
                                    border: 2px solid #886633;
                                    border-radius: 10px;
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                        <div style="flex: 1;">
                                            <div style="font-size: 17px; font-weight: bold; color: #ffdd99; margin-bottom: 5px;">
                                                ${quest.isMainQuest ? '⭐ ' : ''}${quest.name}
                                            </div>
                                            <div style="font-size: 13px; color: #aa9977; margin-bottom: 8px;">${quest.description || ''}</div>
                                            <div style="font-size: 12px; color: #888;">
                                                ${quest.giver ? '委托人: ' + (DataManager.getCharacter(quest.giver)?.name || quest.giver) : ''}
                                                ${quest.difficulty ? ' | 难度: ' + quest.difficulty : ''}
                                                ${quest.recommendedLevel ? ' | 推荐等级: Lv.' + quest.recommendedLevel : ''}
                                            </div>
                                            <div style="margin-top: 6px; font-size: 12px; color: #ffd700;">
                                                奖励: ${quest.rewards?.exp ? quest.rewards.exp + ' 经验 ' : ''}${quest.rewards?.gold ? quest.rewards.gold + ' 金币' : ''}
                                            </div>
                                        </div>
                                        <div onclick="Game.acceptQuest('${quest.id}')" style="
                                            padding: 8px 16px;
                                            background: linear-gradient(135deg, #665522, #887733);
                                            border: 1px solid #aa9944;
                                            border-radius: 8px;
                                            color: #ffeeaa;
                                            cursor: pointer;
                                            font-size: 13px;
                                            font-weight: bold;
                                            white-space: nowrap;
                                            margin-left: 15px;
                                        " onmouseover="this.style.background='linear-gradient(135deg, #776633, #998844)'" onmouseout="this.style.background='linear-gradient(135deg, #665522, #887733)'">
                                            接取
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p style="color: #887766;">暂无可接取的任务（完成更多任务或提升等级后解锁）</p>'}
                    </div>
                    
                    <h3 style="color: #888; margin-bottom: 15px;">✅ 已完成 (${completedQuests.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${completedQuests.map(questId => {
                            const quest = QuestSystem.getQuest(questId);
                            if (!quest) return '';
                            return `
                                <div style="
                                    padding: 12px 20px;
                                    background: rgba(40, 40, 40, 0.5);
                                    border: 1px solid #555;
                                    border-radius: 8px;
                                    color: #888;
                                ">
                                    ✅ ${quest.name}
                                </div>
                            `;
                        }).join('') || '<p style="color: #666;">还没有完成任何任务</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    // ========== 情报界面 ==========
    renderIntelScreen() {
        const knownInfo = WorldState.knownInfo || [];
        const infoDatabase = GameData.infoDatabase || { infos: {} };
        
        // 按分类整理信息
        const categories = ['warning', 'intel', 'clue', 'rumor'];
        const categoryNames = {
            warning: '⚠️ 预警',
            intel: '📋 情报',
            clue: '🔍 线索',
            rumor: '💬 传闻'
        };
        const categoryColors = {
            warning: '#ff6666',
            intel: '#ffcc66',
            clue: '#88ccff',
            rumor: '#aaaaaa'
        };
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a3a, #2a3a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.06;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #446677;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">🔍 情报收集</h2>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <span style="color: #aaa; font-size: 14px;">已收集: ${knownInfo.length} 条</span>
                        <div onclick="Game.closeIntelPanel()" style="
                            padding: 10px 20px;
                            background: #553333;
                            border: 1px solid #775555;
                            border-radius: 8px;
                            color: #ffcccc;
                            cursor: pointer;
                            font-size: 15px;
                            display: inline-block;
                        ">关闭</div>
                    </div>
                </div>
                
                <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                    
                    <!-- v1.8.1: 阴谋调查分区 -->
                    ${typeof InvestigationSystem !== 'undefined' ? (() => {
                        const invData = InvestigationSystem.getData(Player);
                        const invLevel = InvestigationSystem.getInvestigationLevel(Player);
                        const totalProgress = InvestigationSystem.getTotalProgress(Player);
                        const clueTypes = InvestigationSystem.CLUE_TYPES;
                        
                        let typeBars = '';
                        for (const type in clueTypes) {
                            const config = clueTypes[type];
                            const progress = invData[type] || 0;
                            typeBars += `
                                <div style="margin-bottom: 8px;">
                                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-bottom: 3px;">
                                        <span>${config.icon} ${config.name}</span>
                                        <span>${progress}%</span>
                                    </div>
                                    <div style="height: 5px; background: #333; border-radius: 3px; overflow: hidden;">
                                        <div style="height: 100%; width: ${progress}%; background: ${config.color}; transition: width 0.3s;"></div>
                                    </div>
                                </div>
                            `;
                        }
                        
                        const discoveredClues = InvestigationSystem.getDiscoveredClues(Player);
                        
                        return `
                            <div style="
                                background: rgba(20, 30, 50, 0.9);
                                border: 2px solid #5566aa;
                                border-radius: 12px;
                                padding: 20px;
                                margin-bottom: 30px;
                            ">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <h3 style="color: #88aaff; font-size: 18px; margin: 0;">🕵️ 阴谋调查</h3>
                                    <div style="text-align: right;">
                                        <div style="color: #ffd700; font-size: 15px; font-weight: bold;">${invLevel.name}</div>
                                        <div style="color: #888; font-size: 11px;">总进度: ${totalProgress}%</div>
                                    </div>
                                </div>
                                <div style="color: #99aabb; font-size: 12px; margin-bottom: 15px; font-style: italic;">${invLevel.desc}</div>
                                ${typeBars}
                                ${discoveredClues.length > 0 ? `
                                    <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #334466;">
                                        <div style="color: #8899bb; font-size: 12px; margin-bottom: 8px;">已发现线索 (${discoveredClues.length}):</div>
                                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                            ${discoveredClues.map(clue => `
                                                <div style="
                                                    padding: 4px 10px;
                                                    background: rgba(80, 100, 150, 0.3);
                                                    border: 1px solid #5566aa;
                                                    border-radius: 12px;
                                                    font-size: 11px;
                                                    color: #aabbdd;
                                                    cursor: help;
                                                " title="${clue.description}">
                                                    ${clue.name}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    })() : ''}
                    
                    ${categories.map(cat => {
                        const catInfos = knownInfo
                            .map(id => infoDatabase.infos[id])
                            .filter(info => info && info.category === cat)
                            .sort((a, b) => (b.credibility || 0) - (a.credibility || 0));
                        
                        if (catInfos.length === 0) return '';
                        
                        return `
                            <h3 style="color: ${categoryColors[cat]}; margin-bottom: 15px; font-size: 18px;">
                                ${categoryNames[cat]} (${catInfos.length})
                            </h3>
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;">
                                ${catInfos.map(info => `
                                    <div style="
                                        padding: 18px 20px;
                                        background: rgba(30, 40, 60, 0.8);
                                        border-left: 4px solid ${categoryColors[cat]};
                                        border-radius: 0 8px 8px 0;
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                            <div style="font-size: 17px; font-weight: bold; color: #e0e8f0;">
                                                ${info.title}
                                            </div>
                                            <div style="font-size: 12px; color: #888;">
                                                可信度: ${Math.round((info.credibility || 0) * 100)}%
                                            </div>
                                        </div>
                                        <div style="font-size: 14px; color: #bbb; line-height: 1.7; margin-bottom: 10px;">
                                            ${info.content}
                                        </div>
                                        <div style="font-size: 12px; color: #777;">
                                            来源: ${info.source || '未知'}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }).join('')}
                    
                    ${knownInfo.length === 0 ? `
                        <div style="text-align: center; padding: 80px 20px; color: #667788;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                            <div style="font-size: 18px; margin-bottom: 10px;">还没有收集到任何情报</div>
                            <div style="font-size: 14px;">和 NPC 对话、探索世界、完成任务都可能获得情报</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // ========== 声望界面 ==========
    renderReputationScreen() {
        const factions = DataManager.getFactions ? DataManager.getFactions() : {};
        const factionList = Object.values(factions);
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #2a1a3a, #3a2a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.06;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #664477;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">⭐ 势力声望</h2>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <span style="color: #aaa; font-size: 14px;">共 ${factionList.length} 个势力</span>
                        <div onclick="Game.closeReputationPanel()" style="
                            padding: 10px 20px;
                            background: #553333;
                            border: 1px solid #775555;
                            border-radius: 8px;
                            color: #ffcccc;
                            cursor: pointer;
                            font-size: 15px;
                            display: inline-block;
                        ">关闭</div>
                    </div>
                </div>
                
                <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        ${factionList.map(faction => {
                            const rep = WorldState.getReputation(faction.id);
                            const repLevel = WorldState.getReputationLevel(faction.id);
                            const percent = Math.max(0, Math.min(100, (rep + 100) / 2));
                            
                            // 获取当前等级的效果
                            const effects = faction.reputationEffects?.[repLevel.level] || {};
                            const effectTexts = [];
                            if (effects.shopDiscount) effectTexts.push(`商店 ${Math.round(effects.shopDiscount * 100)}折`);
                            if (effects.questRewardBonus) effectTexts.push(`任务奖励 +${Math.round((effects.questRewardBonus - 1) * 100)}%`);
                            if (effects.examBonus) effectTexts.push(`考核奖励 +${Math.round((effects.examBonus - 1) * 100)}%`);
                            
                            return `
                                <div style="
                                    padding: 20px;
                                    background: rgba(40, 30, 60, 0.8);
                                    border: 2px solid ${faction.color || '#666'};
                                    border-radius: 12px;
                                ">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span style="font-size: 32px;">${faction.icon || '🏛️'}</span>
                                            <div>
                                                <div style="font-size: 20px; font-weight: bold; color: #fff;">${faction.name}</div>
                                                <div style="font-size: 13px; color: #999; margin-top: 3px;">${faction.description || ''}</div>
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 18px; font-weight: bold; color: ${repLevel.color};">${repLevel.name}</div>
                                            <div style="font-size: 13px; color: #888; margin-top: 3px;">${rep >= 0 ? '+' : ''}${rep} / 100</div>
                                        </div>
                                    </div>
                                    
                                    <!-- 声望进度条 -->
                                    <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                                        <div style="height: 100%; width: ${percent}%; background: linear-gradient(90deg, ${faction.color || '#666'}, ${repLevel.color}); border-radius: 4px; transition: width 0.5s;"></div>
                                    </div>
                                    
                                    <!-- 当前等级效果 -->
                                    ${effectTexts.length > 0 ? `
                                        <div style="font-size: 13px; color: #88ff88;">
                                            当前效果：${effectTexts.join('、')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${factionList.length === 0 ? `
                        <div style="text-align: center; padding: 80px 20px; color: #776688;">
                            <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                            <div style="font-size: 18px; margin-bottom: 10px;">暂无势力数据</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
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
