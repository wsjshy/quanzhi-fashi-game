/**
 * UI 渲染系统
 * 负责所有界面的渲染和更新
 */

import { renderTitleScreen as renderTitleScreenImpl, createParticles as createParticlesImpl } from './ui-title.js';
import { renderHelpScreen as renderHelpScreenImpl } from './ui-help.js';
import { renderBestiary as renderBestiaryImpl } from './ui-bestiary.js';

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

    /**
     * v2.8.2: 天赋详细介绍弹窗
     * 点击系别天赋卡片时显示，包含详细效果、进化路线、特殊术语解释
     * @param {string} elem - 元素系别
     */
    showTalentDetail(elem) {
        const talentData = Player.talents[elem];
        if (!talentData || typeof TalentSystem === 'undefined') return;
        const talent = TalentSystem.getTalent(talentData.talentId);
        if (!talent) return;

        const rarityConfig = TalentSystem.getRarityConfig(talent.rarity);
        const maxLevel = talent.maxLevel || 10;
        const expToNext = TalentSystem.getExpToNextLevel(talentData.level);
        const expPercent = talentData.level >= maxLevel ? 100 : (talentData.exp / expToNext * 100);
        const effects = TalentSystem.getTalentEffects(talentData.talentId, talentData.level);
        const currentStage = TalentSystem.getCurrentStage(talentData.talentId, talentData.level);
        const nextStage = TalentSystem.getNextStage(talentData.talentId, talentData.level);
        const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };

        // 机制类型
        const mechanismLabels = {
            resource: { name: '资源型', icon: '⚡', color: '#ffaa44', desc: '通过战斗积累专属资源，消耗资源释放强力技能或触发特殊效果' },
            state: { name: '状态型', icon: '❄️', color: '#66ccff', desc: '通过施加状态效果（灼烧/冰冻/麻痹等）控制敌人或造成持续伤害' },
            form: { name: '形态型', icon: '🔄', color: '#aa66ff', desc: '在不同形态间切换，每种形态有独特的技能和效果' },
            trigger: { name: '触发型', icon: '💥', color: '#ff6666', desc: '满足特定条件时自动触发强力效果（连击/暴击/反击等）' },
            passive: { name: '光环型', icon: '✨', color: '#66ff88', desc: '持续提供被动增益，无需主动操作' }
        };
        const mech = talent.mechanism ? mechanismLabels[talent.mechanism] : null;

        // 特殊术语解释（根据系别和机制类型）
        const termExplanations = {
            fire: {
                '燃点': '火系专属资源，通过使用火系技能积累。燃点满时可释放「爆裂」技能，造成高额范围伤害并附加灼烧。',
                '灼烧': '持续伤害效果，每回合造成基于攻击力的百分比伤害，可叠加层数。',
                '爆裂': '消耗满燃点释放的强力技能，造成150%攻击力的范围伤害。'
            },
            ice: {
                '冻结': '控制效果，使目标无法行动1-2回合，对已减速目标概率提升。',
                '减速': '降低目标速度，影响行动顺序和闪避率。',
                '冰盾': '吸收伤害的护盾，冰系技能可生成或强化冰盾。'
            },
            thunder: {
                '电荷': '雷系专属资源，通过雷系技能积累。电荷满时可释放「连锁闪电」，在多个敌人间跳跃造成伤害。',
                '麻痹': '控制效果，使目标有概率无法行动，并降低其命中率。',
                '感电': '使目标受到的雷系伤害提升，可与水系的「湿润」触发感电反应。'
            },
            water: {
                '潮汐形态': '水系专属形态，每2回合自动切换。涨潮形态：治疗效果+50%；退潮形态：伤害+30%。',
                '湿润': '使目标受到的雷系伤害提升50%，与雷系触发「感电」反应。',
                '治愈之泉': '消耗MP的持续治疗技能，每回合恢复一定HP。'
            },
            wind: {
                '疾风连击': '风系触发型效果，连续使用风系技能可叠加连击层数，每层提升伤害和速度，最高5层。',
                '闪避': '完全躲避攻击的概率，风系天赋大幅提升闪避率。',
                '风刃': '风系基础攻击技能，有概率触发连击。'
            },
            earth: {
                '岩力': '土系专属资源，通过受到攻击或使用土系技能积累。岩力满时可释放「地震」，造成高额伤害并眩晕。',
                '护盾': '吸收伤害的保护层，土系技能可生成各种护盾。',
                '眩晕': '控制效果，使目标无法行动1回合。'
            },
            light: {
                '圣光/圣盾形态': '光系专属形态，可手动切换。圣光形态：伤害+30%，攻击附带净化；圣盾形态：防御+40%，受击时反弹伤害。战术切换，攻防转换。',
                '圣光层数': '光系核心机制。攻击时附加1层圣光，最多3层，每层使光系伤害+5%。圣光满3层时触发特殊效果（根据分支不同：净化流自动净化自身debuff并恢复HP；审判流造成目标最大HP百分比的真实伤害）。',
                '净化': '移除目标身上的负面状态效果。光系技能可净化敌方增益或友方减益。',
                '圣光裁决': '光系强力技能，对暗影系敌人造成额外伤害。审判流天赋满层圣光时触发。'
            },
            dark: {
                '暗影潜行': '暗系触发型效果，进入战斗后自动潜行，首次攻击暴击率+100%，攻击后显形。潜行状态下敌人命中率降低。',
                '暗影层数': '暗系核心机制。攻击时附加1层暗影，最多3层，每层使暗系伤害+5%。暗影满3层时触发特殊效果（根据分支不同：吸取流恢复HP并吸取敌方攻击力；潜行者刷新潜行并获得必暴击）。',
                '诅咒': '持续削弱效果，降低目标攻击力或防御力，可叠加层数。诅咒满层时触发诅咒爆发，造成额外伤害。',
                '吸血': '造成伤害时恢复一定比例的HP，暗系天赋可提升吸血比例。'
            },
            heal: {
                '治愈之力': '治愈系专属资源，通过治疗技能积累。治愈之力满时可释放「生命绽放」，全队大幅恢复HP并解除负面状态。',
                '祝福层数': '治愈系核心机制。治疗时附加1层祝福，最多3层，每层使治疗效果+10%。祝福满3层时触发特殊效果（根据分支不同：绽放流全队恢复HP并净化；恩典流全队获得攻击/防御增益）。',
                '复苏': '复活已倒下的队友，恢复一定比例HP。高阶治愈魔法可在战斗中自动复活。',
                '净化': '移除目标身上的负面状态效果。治愈系技能可净化友方减益。'
            },
            plant: {
                '中毒层数': '植物系核心机制。攻击时附加1层中毒，最多5层，每层每回合造成基于攻击力的百分比伤害。中毒满层时触发毒爆，造成高额范围伤害。',
                '荆棘': '反伤效果，受到攻击时对攻击者造成一定比例伤害。植物系天赋可提升反伤比例。',
                '束缚': '控制效果，使目标无法行动，持续2回合。束缚状态下目标受到植物系伤害提升。'
            },
            summon: {
                '召唤兽': '召唤系核心机制，可召唤各种召唤兽协同作战，召唤兽有独立的HP和技能。',
                '契约': '与召唤兽建立契约，契约等级影响召唤兽的属性和技能。',
                '协同攻击': '召唤兽与主人同时攻击，造成额外伤害。'
            }
        };

        // v2.8.3 术语解释：根据天赋实际涉及的效果字段动态显示，而非显示该系所有术语
        // 术语与效果关键词的映射关系
        const termKeywordMap = {
          // 火系
          '燃点': ['fireEnergy', 'fireExplode', 'fireEnhance', 'fireAura', 'fireGround', 'fireRain'],
          '灼烧': ['burnChance', 'burnDamage', 'burnSpread', 'burnStack', 'burnCrit', 'burnExplode', 'burnDefense', 'burnTrue'],
          '爆裂': ['fireExplode', 'burnCritExplode', 'explosionChance', 'explosionDamage', 'explosionCrit'],
          // 冰系
          '冻结': ['freezeChance', 'freezeDuration', 'freezeSpread', 'frozen', 'fieldFreeze'],
          '减速': ['slowChance', 'slowBonus', 'frostSlow', 'earthquakeSlow', 'hurricaneVulnerable'],
          '冰盾': ['iceShield', 'frostNova', 'crystalShield', 'shieldRatio'],
          // 雷系
          '电荷': ['chargeMax', 'chargeStack', 'chargePerStack', 'fullCharge'],
          '麻痹': ['paralyzeChance', 'paralyzeDuration', 'paralyzeDamage', 'shockParalyze', 'chainParalyze'],
          '感电': ['shockStack', 'shockDamage', 'shockSpread', 'shockThunder', 'wetDamage'],
          // 水系
          '潮汐形态': ['tide', 'autoTide', 'tideHeal', 'tideDamage', 'tideShield', 'tideCleanse', 'tideInterval'],
          '湿润': ['wetChance', 'wetStack', 'wetSpread', 'wetHeal', 'wetBind'],
          '治愈之泉': ['aoeHeal', 'healAura', 'regenAmount', 'regenChance', 'autoHeal'],
          // 风系
          '疾风连击': ['comboChance', 'comboDamage', 'comboSpeed', 'comboMp', 'windBlade', 'windBladeDance'],
          '闪避': ['dodgeBonus', 'dodgeCounter', 'dodgeCrit', 'dodgeHeal', 'dodgeMp', 'lastStandDodge'],
          '风刃': ['windBlade', 'windBladeCount', 'windBladeDamage', 'windBladeSpeed', 'windBladeMax'],
          // 土系
          '岩力': ['rockArmor', 'earthquake', 'hardRock', 'defenseStack', 'defenseToDamage'],
          '护盾': ['shieldChance', 'shieldRatio', 'shieldReflect', 'shieldRegen', 'permanentShield', 'guardDamage'],
          '眩晕': ['stunChance', 'stunExtend', 'earthquakeSlow', 'counterStun', 'judgmentStun', 'meteorStun'],
          // 光系
          '圣光/圣盾形态': ['holyStack', 'holyMax', 'holyShield', 'holyJudgment', 'holyPurify', 'holyDamage'],
          '净化': ['purifyChance', 'purifyAll', 'purifyHeal', 'purifyTeam', 'autoPurify', 'bloomPurify'],
          '圣光裁决': ['holyJudgment', 'judgmentDamage', 'judgmentTrue', 'judgmentDark', 'judgmentNext'],
          // 暗系
          '暗影潜行': ['stealth', 'autoStealth', 'reStealth', 'shadowForm', 'shadowStealth', 'stealthFirst'],
          '暗影层数': ['shadowStack', 'shadowMax', 'shadowDrain', 'shadowLifeDrain', 'shadowLifesteal', 'shadowAttackDown', 'shadowDefenseDown'],
          '诅咒': ['curseChance', 'curseDuration', 'curseDamage', 'curseAtk', 'curseDef', 'curseSpread', 'curseEnd'],
          '吸血': ['shadowLifesteal', 'shadowLifeDrain', 'drainLifesteal', 'curseKillHeal', 'killHeal'],
          // 治愈系
          '治愈之力': ['blessingStack', 'blessingMax', 'blessingHeal', 'blessingDefense', 'blessingBloom', 'blessingGrace'],
          '复苏': ['revive', 'autoRevive', 'bloomRevive', 'reviveCount', 'reviveHp', 'lifeSeed'],
          '净化': ['purifyChance', 'purifyAll', 'bloomPurify', 'autoPurify', 'purifyHeal'],
          // 植物系
          '荆棘': ['thornArmor', 'shieldReflect', 'counterDamage', 'dodgeCounter'],
          '束缚': ['bindDuration', 'bindEndStun', 'bindExplosion', 'bindHpDrain', 'bindWater', 'poisonBind', 'wetBind'],
          '中毒': ['poisonStack', 'poisonMax', 'poisonDamage', 'poisonSpread', 'poisonEscalation', 'poisonExecute', 'poisonBurst'],
          // 召唤系
          '召唤兽': ['summonDamage', 'summonHp', 'summonDuration', 'summonCrit', 'summonLevel', 'summonDeath', 'summonEnrage', 'maxSummons', 'openingSummon'],
          '契约': ['contract', 'summonMaster', 'contractCrit', 'contractDamage', 'contractSpeed', 'contractStack', 'contractMax'],
          '协同攻击': ['comboChance', 'summonCharge', 'doubleSummon', 'extraSummon', 'beastTide', 'chainSummon']
        };

        // 获取当前天赋的所有效果字段
        const talentEffectKeys = new Set();
        if (effects) Object.keys(effects).forEach(k => talentEffectKeys.add(k));
        // 也检查进化路线中的效果
        if (talent.evolutions) {
          talent.evolutions.forEach(evo => {
            if (evo.effects) Object.keys(evo.effects).forEach(k => talentEffectKeys.add(k));
          });
        }

        // 根据效果字段判断涉及哪些术语
        const relevantTerms = [];
        const elemTerms = termExplanations[elem] || {};
        Object.entries(elemTerms).forEach(([term, desc]) => {
          const keywords = termKeywordMap[term] || [];
          const isRelevant = keywords.some(kw => 
            [...talentEffectKeys].some(effectKey => effectKey.toLowerCase().includes(kw.toLowerCase()))
          );
          if (isRelevant) relevantTerms.push({term, desc});
        });

        // 如果没有匹配到任何术语，显示该系最核心的1-2个术语（避免完全空白）
        if (relevantTerms.length === 0) {
          const coreTerms = Object.entries(elemTerms).slice(0, 2);
          coreTerms.forEach(([term, desc]) => relevantTerms.push({term, desc}));
        }

        const termsHtml = relevantTerms.map(({term, desc}) => `
            <div style="margin-bottom:8px;padding:8px 10px;background:rgba(255,215,0,0.05);border-left:3px solid #ffd700;border-radius:0 6px 6px 0;">
                <span style="color:#ffd700;font-size:12px;font-weight:bold;">📖 ${term}</span>
                <div style="color:#bbb;font-size:11px;margin-top:3px;line-height:1.5;">${desc}</div>
            </div>
        `).join('');

        // 效果列表 - v2.8.3 扩充中文名称，覆盖各系常见效果
        const effectNames = {
          // 通用基础
          damageBonus:'伤害加成', healBonus:'治疗加成', defenseBonus:'防御加成', speedBonus:'速度加成',
          hpBonus:'生命加成', critRate:'暴击率', critDamage:'暴击伤害', mpCostReduction:'耗蓝减少',
          dodgeBonus:'闪避率', hpRegen:'HP回复', mpRegen:'MP回复', maxHpBonus:'最大生命加成',
          damageReduction:'伤害减免', cooldownReduction:'冷却缩减', skillLevelBonus:'技能等级加成',
          // 火系
          burnChance:'灼烧概率', burnDamage:'灼烧伤害', burnSpread:'灼烧扩散', burnCrit:'灼烧暴击',
          burnExplode:'灼烧爆炸', burnStackMax:'灼烧最大层数', fireExplodeDamage:'爆裂伤害',
          fireExplodeBonus:'爆裂加成', fireEnergyGain:'燃点获取', fireEnergyMax:'燃点上限',
          fireAura:'火焰光环', fireGround:'火焰领域', fireRain:'火焰之雨',
          // 冰系
          freezeChance:'冰冻概率', freezeDuration:'冰冻时长', freezeSpread:'冰冻扩散',
          frostStacks:'寒霜层数', frostStackMax:'寒霜最大层数', frostSlowPerStack:'每层减速',
          frostNova:'冰霜新星', frostShatter:'冰霜碎裂', iceShield:'冰盾',
          // 雷系
          paralyzeChance:'麻痹概率', paralyzeDuration:'麻痹时长', paralyzeDamage:'麻痹伤害',
          chainLightning:'连锁闪电', chainTargets:'连锁目标数', chainDamage:'连锁伤害',
          chainFalloff:'连锁衰减', shockStacks:'感电层数', shockStackMax:'感电最大层数',
          skyThunder:'天雷', thunderCounter:'雷系反击', thunderExecute:'雷系处决',
          // 水系
          tide:'潮汐形态', tideHeal:'潮汐治疗', tideDamage:'潮汐伤害', tideShield:'潮汐护盾',
          wetChance:'湿润概率', wetStacks:'湿润层数', wetStackMax:'湿润最大层数',
          healCritRate:'治疗暴击率', healCritDouble:'治疗暴击双倍', aoeHeal:'群体治疗',
          aoeHealRatio:'群疗比例', purifyChance:'净化概率', autoHeal:'自动治疗',
          // 风系
          comboChance:'连击概率', comboDamageIncrease:'连击伤害提升', comboSpeedBuff:'连击速度加成',
          comboMpReduction:'连击耗蓝减少', windBladeCount:'风刃数量', windBladeDamage:'风刃伤害',
          windBladeSpeed:'风刃速度', windBladeMax:'风刃上限', windBladeStack:'风刃层数',
          windBladeDance:'风刃舞', dodgeCounter:'闪避反击', dodgeCritDamage:'闪避暴击伤害',
          // 土系
          earthquakeChance:'地震概率', earthquakeDamage:'地震伤害', earthquakeSlow:'地震减速',
          rockArmorStack:'岩甲层数', rockArmorMax:'岩甲上限', rockArmorDefense:'岩甲防御',
          rockArmorReduction:'岩甲减伤', shieldChance:'护盾概率', shieldRatio:'护盾比例',
          shieldReflect:'护盾反伤', shieldRegen:'护盾回复', hardRockChance:'磐石概率',
          hardRockReduction:'磐石减伤',
          // 光系
          holyStack:'圣光层数', holyMax:'圣光上限', holyShield:'圣光护盾',
          holyJudgmentOnMax:'满层圣光裁决', holyPurifyOnMax:'满层圣光净化',
          holyDamageBonus:'神圣伤害加成', holyDarkResist:'暗影抗性', divineProtection:'神圣守护',
          purifyAll:'全体净化', purifyHeal:'净化治疗', purifyTeamHeal:'团队净化治疗',
          graceAtkBonus:'恩典攻击加成', graceDefBonus:'恩典防御加成', graceCritBonus:'恩典暴击加成',
          graceSpeedBonus:'恩典速度加成', graceDuration:'恩典持续', graceLastStand:'恩典背水一战',
          // 暗系
          curseChance:'诅咒概率', curseDuration:'诅咒时长', curseDamage:'诅咒伤害',
          curseAtkDown:'诅咒降攻', curseDefDown:'诅咒降防', curseSpreadChance:'诅咒扩散概率',
          shadowStack:'暗影层数', shadowMax:'暗影上限', shadowForm:'暗影形态',
          shadowFormDuration:'暗影形态时长', shadowFormHeal:'暗影形态治疗',
          shadowLifesteal:'暗影吸血', shadowLifeDrain:'暗影吸取生命',
          stealthDuration:'潜行时长', stealthCritBonus:'潜行暴击加成', stealthDamageBonus:'潜行伤害加成',
          stealthFirstHitBonus:'潜行首击加成', stealthFirstHitCrit:'潜行首击暴击',
          reStealthChance:'再次潜行概率', reStealthCrit:'再次潜行暴击',
          // 治愈系
          blessingStack:'祝福层数', blessingMax:'祝福上限', blessingHealBonus:'祝福治疗加成',
          blessingDefenseBonus:'祝福防御加成', blessingBloomOnMax:'满层生命绽放',
          blessingGraceOnMax:'满层恩典降临', bloomHeal:'绽放治疗', bloomPurify:'绽放净化',
          bloomRevive:'绽放复活', bloomShield:'绽放护盾', bloomCooldown:'绽放冷却',
          autoRevive:'自动复活', autoReviveHp:'复活血量', reviveCount:'复活次数',
          emergencyHeal:'紧急治疗', emergencyThreshold:'紧急阈值',
          // 植物系
          poisonStack:'中毒层数', poisonMax:'中毒上限', poisonDamage:'中毒伤害',
          poisonDamageBonus:'中毒伤害加成', poisonDurationBonus:'中毒时长加成',
          poisonSpreadChance:'中毒扩散概率', poisonEscalation:'毒性升级', poisonExecute:'毒性处决',
          thornArmor:'荆棘护甲', bindDuration:'束缚时长', bindDurationBonus:'束缚时长加成',
          bindEndStun:'束缚结束眩晕', bindExplosion:'束缚爆炸', bindHpDrain:'束缚吸血',
          plantControlHitRate:'植物控制命中', plantDamageBonus:'植物伤害加成',
          // 召唤系
          summonDamageBonus:'召唤兽伤害加成', summonHpBonus:'召唤兽生命加成',
          summonDurationBonus:'召唤兽时长加成', summonLevelBonus:'召唤兽等级加成',
          summonCritRate:'召唤兽暴击率', summonCritDamage:'召唤兽暴击伤害',
          doubleSummonChance:'双重召唤概率', extraSummonChance:'额外召唤概率',
          extraSummonDuration:'额外召唤时长', maxSummons:'最大召唤数',
          summonDeathBurst:'召唤兽死亡爆裂', summonDeathHeal:'召唤兽死亡治疗',
          summonMasterDamageBonus:'主人伤害加成', summonMasterDefBonus:'主人防御加成',
          summonEnrage:'召唤兽狂暴', summonChargeChance:'召唤冲锋概率',
          summonChargeDamage:'召唤冲锋伤害', summonChargeKnockback:'召唤冲锋击退',
          contractCritBonus:'契约暴击加成', contractDamageBonus:'契约伤害加成',
          contractSpeedBonus:'契约速度加成', contractStack:'契约层数', contractMax:'契约上限',
          openingSummon:'开场召唤', summonHasTalent:'召唤兽天赋',
          // 状态效果通用
          stunChance:'眩晕概率', stunExtendChance:'眩晕延长概率', stunnedDamageBonus:'眩晕伤害加成',
          slowChance:'减速概率', slowBonus:'减速加成', slowUnpurgeable:'减速不可净化',
          blindChance:'致盲概率', blindDuration:'致盲时长', debuffImmunity:'免疫减益',
          critImmunity:'免疫暴击', executeChance:'处决概率', executeThreshold:'处决阈值',
          firstStrikeChance:'先攻概率', firstStrikeDamage:'先攻伤害',
          counterDamage:'反击伤害', counterHeal:'反击治疗', counterStunChance:'反击眩晕概率',
          ignoreDodgeChance:'必中概率', critArmorPenetration:'暴击破甲',
          defenseToDamage:'防御转伤害', defenseStack:'防御层数', defenseStackMax:'防御上限',
          attackSpeedStack:'攻速层数', attackSpeedMax:'攻速上限', hitCritStack:'命中暴击层数', hitCritMax:'命中暴击上限',
          // 光系
          darkDamageBonus:'暗影伤害加成', holyStack:'攻击附加圣光', holyMax:'圣光上限',
          holyDamageBonus:'圣光伤害加成', holyDarkResist:'暗影抗性', lightShield:'圣光护盾',
          holyPurifyOnMax:'满层圣光净化', holyJudgmentOnMax:'满层圣光审判',
          purifyHeal:'净化治疗', purifyDamage:'净化伤害', purifyTeamHeal:'团队净化治疗',
          autoPurifyChance:'自动净化概率', judgmentDamage:'审判伤害',
          judgmentTrueDamage:'审判真实伤害', judgmentDarkDouble:'审判暗影双倍',
          judgmentStunChance:'审判眩晕概率', judgmentDarkCrit:'审判暗影暴击',
          judgmentNextCrit:'审判后必暴击', judgmentNextDamage:'审判后伤害加成',
          lightPenetration:'光系穿透', debuffImmunity:'免疫减益',
          shieldOnCrit:'暴击获得护盾', shieldDebuffImmune:'护盾期免疫减益',
          debuffedDamageBonus:'对减益目标伤害', angelInterval:'天使降临间隔',
          angelDamage:'天使伤害', angelHeal:'天使治疗', critArmorPenetration:'暴击破甲',
          // 通用特殊
          skillLevelBonus:'技能等级+', aoePurify:'范围净化', purifyCount:'净化数量',
          purifyDebuff:'净化减益', purifyAtkDown:'净化降攻', purifyDefDown:'净化降防',
          teamAtkBonus:'团队攻击加成', teamDefBonus:'团队防御加成',
          teamDefenseBonus:'团队防御加成', teamDodgeBonus:'团队闪避加成',
          teamHpRegen:'团队HP回复', teamSpeedBonus:'团队速度加成',
          teamDarkBonus:'团队暗影加成', permanentShield:'永久护盾',
          shieldRatio:'护盾比例', shieldReflect:'护盾反伤', shieldRegen:'护盾回复',
          shieldRefreshOnLethal:'致命伤刷新护盾', shieldBreakDamage:'破盾伤害',
          shieldChance:'护盾概率', shieldDefenseBonus:'护盾防御加成',
          divineProtection:'神圣守护', graceAllStats:'恩典全属性',
          graceAtkBonus:'恩典攻击', graceDefBonus:'恩典防御', graceCritBonus:'恩典暴击',
          graceSpeedBonus:'恩典速度', graceDuration:'恩典持续', graceHitGuaranteed:'恩典必中',
          graceLastStand:'恩典背水一战', graceLifesteal:'恩典吸血',
          holyShield:'圣光护盾', holyShieldDuration:'圣光护盾持续', holyShieldTarget:'圣光护盾目标',
          holyStacks:'圣光层数', lightDamageBonus:'光系伤害加成',
          lightImmunity:'光系免疫', holyMax:'圣光上限',
          // 暗系
          shadowAttackDown:'暗影降攻', shadowDefenseDown:'暗影降防',
          shadowDrainOnMax:'满层暗影吸取', shadowForm:'暗影形态',
          shadowFormDuration:'暗影形态持续', shadowFormHeal:'暗影形态治疗',
          shadowFormOnLethal:'致命伤变暗影', shadowLifeDrain:'暗影吸取生命',
          shadowLifesteal:'暗影吸血', shadowMax:'暗影上限', shadowStack:'暗影层数',
          shadowStealthOnMax:'满层暗影潜行', stealthAllHitBonus:'潜行全命中',
          stealthAllHitCrit:'潜行全命中暴击', stealthCritBonus:'潜行暴击',
          stealthDamageBonus:'潜行伤害', stealthDuration:'潜行持续',
          stealthEndDodge:'潜行结束闪避', stealthFirstHitBonus:'潜行首击加成',
          stealthFirstHitCrit:'潜行首击暴击', stealthRefreshOnKill:'击杀刷新潜行',
          reStealthChance:'再次潜行概率', reStealthCrit:'再次潜行暴击',
          reStealthDuration:'再次潜行持续', autoStealthChance:'自动潜行概率',
          curseAtkDown:'诅咒降攻', curseChance:'诅咒概率', curseCritDamageTaken:'诅咒暴击易伤',
          curseCritDown:'诅咒降暴击', curseDamage:'诅咒伤害', curseDefDown:'诅咒降防',
          curseDodgeDown:'诅咒降闪避', curseDuration:'诅咒持续', curseEndDamage:'诅咒结束伤害',
          curseKillHeal:'诅咒击杀治疗', curseSpreadChance:'诅咒扩散概率',
          curseUnpurgeable:'诅咒不可净化', markNoStealth:'标记不可潜行',
          darkMark:'暗影标记', darkMarkDamage:'暗影标记伤害', darkMarkDuration:'暗影标记持续',
          darkPenetration:'暗影穿透', darkImmunity:'暗影免疫',
          // 召唤系
          summonChargeChance:'召唤冲锋概率', summonChargeDamage:'召唤冲锋伤害',
          summonChargeKnockback:'召唤冲锋击退', summonCritDamage:'召唤兽暴伤',
          summonCritRate:'召唤兽暴击率', summonDeathBurst:'召唤兽死亡爆裂',
          summonDeathHeal:'召唤兽死亡治疗', summonDebuffImmunity:'召唤兽免疫减益',
          summonDurationBonus:'召唤兽时长加成', summonEnrage:'召唤兽狂暴',
          summonHasTalent:'召唤兽拥有天赋', summonHpBonus:'召唤兽生命加成',
          summonLevelBonus:'召唤兽等级加成', summonMasterDamageBonus:'主人伤害加成',
          summonMasterDefBonus:'主人防御加成', maxSummons:'最大召唤数',
          openingSummon:'开场召唤', contractCritBonus:'契约暴击',
          contractDamageBonus:'契约伤害', contractGuardOnMax:'满层契约守护',
          contractMax:'契约上限', contractSpeedBonus:'契约速度', contractStack:'契约层数',
          contractBeastTideOnMax:'满层契约兽潮', beastTideCount:'兽潮数量',
          beastTideDamage:'兽潮伤害', beastTideFinalCrit:'兽潮终击暴击',
          beastTideNoConsume:'兽潮无消耗', extraSummonChance:'额外召唤概率',
          extraSummonDuration:'额外召唤时长', doubleSummonChance:'双重召唤概率',
          inheritStats:'继承属性', summonDamageBonus:'召唤兽伤害加成',
          // 植物系
          plantControlHitRate:'植物控制命中', plantDamageBonus:'植物伤害加成',
          poisonBindOnMax:'满层中毒束缚', poisonBurstDamage:'毒爆伤害',
          poisonBurstOnMax:'满层毒爆', poisonBurstRefresh:'毒爆刷新',
          poisonBurstTrue:'毒爆真实伤害', poisonDamage:'中毒伤害',
          poisonDamageBonus:'中毒伤害加成', poisonDefenseDown:'中毒降防',
          poisonDefenseReduction:'中毒减防', poisonDurationBonus:'中毒时长加成',
          poisonEscalation:'毒性升级', poisonEscalationMax:'毒性升级上限',
          poisonExecute:'毒性处决', poisonExecuteThreshold:'毒性处决阈值',
          poisonMax:'中毒上限', poisonSpeedDown:'中毒降速', poisonSpreadChance:'中毒扩散概率',
          poisonStack:'中毒层数', poisonUnpurgeable:'中毒不可净化',
          thornArmor:'荆棘护甲', bindAttackDown:'束缚降攻', bindDefenseDown:'束缚降防',
          bindDuration:'束缚持续', bindDurationBonus:'束缚时长加成', bindEndStun:'束缚结束眩晕',
          bindExplosion:'束缚爆炸', bindHpDrain:'束缚吸血', bindUnpurgeable:'束缚不可净化',
          bindWaterDamageBonus:'束缚水伤加成', wetBindOnMax:'满层湿润束缚',
          // 治愈系
          blessingBloomOnMax:'满层生命绽放', blessingDefenseBonus:'祝福防御',
          blessingGraceOnMax:'满层恩典降临', blessingHealBonus:'祝福治疗',
          blessingMax:'祝福上限', blessingStack:'祝福层数',
          bloomCooldown:'绽放冷却', bloomHeal:'绽放治疗', bloomPurify:'绽放净化',
          bloomRevive:'绽放复活', bloomShield:'绽放护盾',
          autoRevive:'自动复活', autoReviveHp:'复活血量', reviveCount:'复活次数',
          emergencyCooldown:'紧急治疗冷却', emergencyHeal:'紧急治疗',
          emergencyHealAmount:'紧急治疗量', emergencyThreshold:'紧急阈值',
          lifeSeed:'生命种子', lifeSeedDelay:'生命种子延迟', lifeSeedHeal:'生命种子治疗',
          allHealingBonus:'全治疗加成', aoeHealRatio:'群疗比例',
          healCritDouble:'治疗暴击双倍', healCritRate:'治疗暴击率',
          healExtraHp:'治疗额外HP', healImmunity:'免疫治疗', healMpRestore:'治疗回蓝',
          healPurifyChance:'治疗净化概率', healShield:'治疗护盾',
          healShieldDuration:'治疗护盾持续', purifyAll:'全体净化',
          purifyAtkDown:'净化降攻', purifyChance:'净化概率', purifyCount:'净化数量',
          purifyDamage:'净化伤害', purifyDebuff:'净化减益', purifyDefDown:'净化降防',
          purifyHeal:'净化治疗', purifyHealBonus:'净化治疗加成',
          purifyOnHealChance:'治疗时净化概率', purifyTeamHeal:'团队净化治疗',
          revive:'复活', reviveBuff:'复活buff', reviveHp:'复活血量',
          reviveUnlocked:'复活解锁', autoHeal:'自动治疗', autoHealTarget:'自动治疗目标',
          autoPurify:'自动净化', autoPurifyChance:'自动净化概率',
          // 状态效果通用
          stunChance:'眩晕概率', stunExtendChance:'眩晕延长概率',
          stunnedDamageBonus:'眩晕伤害加成', slowChance:'减速概率',
          slowBonus:'减速加成', slowUnpurgeable:'减速不可净化',
          blindChance:'致盲概率', blindDuration:'致盲持续',
          executeChance:'处决概率', executeThreshold:'处决阈值',
          firstStrikeChance:'先攻概率', firstStrikeDamage:'先攻伤害',
          counterDamage:'反击伤害', counterHeal:'反击治疗',
          counterNoConsume:'反击无消耗', counterStunChance:'反击眩晕概率',
          ignoreDodgeChance:'必中概率', defenseToDamage:'防御转伤害',
          defenseStack:'防御层数', defenseStackMax:'防御上限',
          attackSpeedStack:'攻速层数', attackSpeedMax:'攻速上限',
          hitCritStack:'命中暴击层数', hitCritMax:'命中暴击上限',
          lowHpDamageBonus:'低血伤害加成', lowHpDamageScaling:'低血伤害缩放',
          lowHpDodgeBonus:'低血闪避加成', lowHpFreezeChance:'低血冰冻概率',
          lowHpRegenDouble:'低血回复双倍', lastStandDodge:'背水一战闪避',
          lastStandHeal:'背水一战治疗', lethalShield:'致命护盾',
          enrageDamage:'狂暴伤害', enrageThreshold:'狂暴阈值',
          intimidateAtkDown:'威吓降攻', intimidateDefDown:'威吓降防',
          intimidateDuration:'威吓持续', kingIntimidate:'王者威吓',
          packBonus:'群居加成', kingIntimidate:'王者威压',
          // 火系补充
          fireAura:'火焰光环', fireEnergyGain:'燃点获取', fireEnergyMax:'燃点上限',
          fireEnhanceAOE:'火强化范围', fireEnhanceAttack:'火强化攻击',
          fireEnhanceBonus:'火强化加成', fireEnhanceCombo:'火强化连击',
          fireEnhanceCost:'火强化消耗', fireEnhanceCrit:'火强化暴击',
          fireEnhanceResetOnKill:'击杀重置火强化', fireExplodeBonus:'爆裂加成',
          fireExplodeCrit:'爆裂暴击', fireExplodeDamage:'爆裂伤害',
          fireExplodeKeep:'爆裂保留', fireExplodeNoCooldown:'爆裂无冷却',
          fireExplodeOnMax:'满燃点爆裂', fireGround:'火焰领域',
          fireGroundDamage:'火焰领域伤害', fireGroundDuration:'火焰领域持续',
          fireImmunity:'火系免疫', fireRain:'火焰之雨', fireRainDamage:'火雨伤害',
          fireRainDuration:'火雨持续', fireResistance:'火系抗性',
          burnChance:'灼烧概率', burnCrit:'灼烧暴击', burnCritExplode:'灼烧暴击爆炸',
          burnDamage:'灼烧伤害', burnDamageBonus:'灼烧伤害加成',
          burnDefenseDown:'灼烧降防', burnExplode:'灼烧爆炸', burnSpread:'灼烧扩散',
          burnStackMax:'灼烧上限', burnTrueDamage:'灼烧真实伤害',
          burnUnpurgeable:'灼烧不可净化', explosionChance:'爆炸概率',
          explosionCritGuaranteed:'爆炸必暴击', explosionDamage:'爆炸伤害',
          explosionRangeBonus:'爆炸范围加成',
          // 冰系补充
          freezeChance:'冰冻概率', freezeDefenseDown:'冰冻降防',
          freezeDuration:'冰冻持续', freezeSpread:'冰冻扩散',
          freezeUnpurgeable:'冰冻不可净化', frostChance:'寒霜概率',
          frostExplosion:'寒霜爆炸', frostExplosionRange:'寒霜爆炸范围',
          frostFreezeOnMax:'满层寒霜冰冻', frostNova:'冰霜新星',
          frostNovaDamage:'冰霜新星伤害', frostNovaInterval:'冰霜新星间隔',
          frostNovaSlow:'冰霜新星减速', frostShatter:'冰霜碎裂',
          frostSlowPerStack:'每层寒霜减速', frostStackMax:'寒霜上限',
          frostStacks:'寒霜层数', frozenCritGuaranteed:'冰冻必暴击',
          frozenDamageTaken:'冰冻易伤', frozenHpDrain:'冰冻吸血',
          frozenIceDamageBonus:'冰冻冰伤加成', fieldFreezeDuration:'领域冰冻持续',
          fieldIceResDown:'领域降冰抗', iceImmunity:'冰系免疫',
          icePenetration:'冰系穿透', iceRangeBonus:'冰系范围加成',
          iceShield:'冰盾', crystalShield:'水晶护盾',
          // 雷系补充
          paralyzeChain:'麻痹连锁', paralyzeChance:'麻痹概率',
          paralyzeDamage:'麻痹伤害', paralyzeDamageBonus:'麻痹伤害加成',
          paralyzeDuration:'麻痹持续', paralyzeExplode:'麻痹爆炸',
          paralyzeHpDrain:'麻痹吸血', paralyzeNoDodge:'麻痹不可闪避',
          chainChance:'连锁概率', chainDamage:'连锁伤害',
          chainDamageRatio:'连锁伤害比例', chainExplosionChance:'连锁爆炸概率',
          chainExplosionDamage:'连锁爆炸伤害', chainFalloff:'连锁衰减',
          chainLightning:'连锁闪电', chainNoDecay:'连锁无衰减',
          chainParalyzeChance:'连锁麻痹概率', chainSummonChance:'连锁召唤概率',
          chainTargets:'连锁目标数', chargeMax:'充能上限',
          chargePerStack:'每层充能', chargeStack:'充能层数',
          fullChargeCrit:'满充能暴击', fullChargeDamage:'满充能伤害',
          openingThunder:'开场雷击', openingThunderDamage:'开场雷击伤害',
          shockChance:'感电概率', shockDamageBonus:'感电伤害加成',
          shockDebuff:'感电减益', shockDuration:'感电持续',
          shockParalyzeChance:'感电麻痹概率', shockParalyzeOnMax:'满层感电麻痹',
          shockSpread:'感电扩散', shockStackMax:'感电上限', shockStacks:'感电层数',
          shockThunderBonus:'感电雷伤加成', skyThunderChance:'天雷概率',
          skyThunderDamage:'天雷伤害', thunderCounter:'雷系反击',
          thunderCounterDamage:'雷系反击伤害', thunderExecute:'雷系处决',
          thunderImmunity:'雷系免疫', thunderPenetration:'雷系穿透',
          stormPunishChance:'风暴惩罚概率', stormPunishDamage:'风暴惩罚伤害',
          stormPunishStun:'风暴惩罚眩晕',
          // 水系补充
          tide:'潮汐形态', tideCleanse:'潮汐净化', tideDamageMax:'潮汐伤害上限',
          tideDamageStack:'潮汐伤害层数', tideHeal:'潮汐治疗',
          tideHealMax:'潮汐治疗上限', tideHealStack:'潮汐治疗层数',
          tideInterval:'潮汐间隔', tideShield:'潮汐护盾', tideShieldDuration:'潮汐护盾持续',
          autoTide:'自动潮汐', wetChance:'湿润概率', wetDamageBonus:'湿润伤害加成',
          wetHealOnMax:'满层湿润治疗', wetSpread:'湿润扩散', wetStackMax:'湿润上限',
          wetStacks:'湿润层数', waterGuardChance:'水盾概率',
          waterGuardReduction:'水盾减伤', waterImmunity:'水系免疫',
          waterPenetration:'水系穿透', tsunamiAtkDown:'海啸降攻',
          tsunamiChance:'海啸概率', tsunamiDamage:'海啸伤害',
          // 风系补充
          comboChance:'连击概率', comboDamageIncrease:'连击伤害提升',
          comboMpReduction:'连击耗蓝减少', comboSpeedBuff:'连击速度加成',
          windBladeChance:'风刃概率', windBladeCount:'风刃数量',
          windBladeDamage:'风刃伤害', windBladeDanceCount:'风刃舞数量',
          windBladeDanceDamage:'风刃舞伤害', windBladeDanceOnMax:'满层风刃舞',
          windBladeDodge:'风刃闪避', windBladeMax:'风刃上限',
          windBladeSlowChance:'风刃减速概率', windBladeSpeed:'风刃速度',
          windBladeStack:'风刃层数', windDotBonus:'风系持续伤害加成',
          windImmunity:'风系免疫', windPenetration:'风系穿透',
          dodgeCounter:'闪避反击', dodgeCounterCrit:'闪避反击暴击',
          dodgeCounterDamage:'闪避反击伤害', dodgeCritBuff:'闪避暴击buff',
          dodgeCritDamage:'闪避暴击伤害', dodgeHeal:'闪避治疗',
          dodgeMpRestore:'闪避回蓝', dodgeNextHitBonus:'下次闪避加成',
          doubleStrikeChance:'双击概率', secondHitRatio:'第二击比例',
          thirdHitRatio:'第三击比例', tripleStrikeChance:'三击概率',
          hurricaneChance:'飓风概率', hurricaneDuration:'飓风持续',
          hurricaneVulnerable:'飓风易伤', tornadoChance:'龙卷风概率',
          tornadoDamage:'龙卷风伤害', tornadoKnockback:'龙卷风击退',
          // 土系补充
          earthquakeChance:'地震概率', earthquakeDamage:'地震伤害',
          earthquakeSlow:'地震减速', rockArmorCounterOnMax:'满层岩甲反击',
          rockArmorDefense:'岩甲防御', rockArmorMax:'岩甲上限',
          rockArmorReduction:'岩甲减伤', rockArmorShieldOnMax:'满层岩甲护盾',
          rockArmorStack:'岩甲层数', hardRockChance:'磐石概率',
          hardRockReduction:'磐石减伤', earthImmunity:'土系免疫',
          earthPenetration:'土系穿透', earthRangeBonus:'土系范围加成',
          meteor:'陨石', meteorDamage:'陨石伤害', meteorInterval:'陨石间隔',
          meteorStunChance:'陨石眩晕概率', stomp:'践踏',
          // 通用
          maxHpBonus:'最大生命加成', hpRegen:'HP回复', mpRegen:'MP回复',
          regenAmount:'回复量', regenChance:'回复概率', regenDamageReduction:'回复减伤',
          regenDefenseBonus:'回复防御加成', regenDuration:'回复持续',
          regenMp:'回复MP', regenUnpurgeable:'回复不可净化',
          sharedHpRegen:'共享HP回复', damageReduction:'伤害减免',
          damageShare:'伤害分担', cooldownReduction:'冷却缩减',
          mpCostReduction:'耗蓝减少', killCooldownReduce:'击杀减冷却',
          killHeal:'击杀治疗', drainHealReduction:'吸取治疗减少',
          drainLifesteal:'吸取吸血', enemyHitDown:'敌人命中降低',
          enemySpeedDown:'敌人速度降低', emergencyThreshold:'紧急阈值',
          timeStopChance:'时停概率', timeStopDuration:'时停持续',
          guaranteedCrit:'必暴击', critImmunity:'免疫暴击',
          critKnockback:'暴击击退', critParalyze:'暴击麻痹',
          // 妖魔特性
          summonWolves:'召唤狼群', flySwitch:'飞行切换',
          burrow:'掘地', boneSpike:'骨刺齐射', aoeWind:'风刃风暴',
          multiStrike:'多重打击', sandBreath:'沙息', charge:'冲锋',
          screech:'尖啸', gaze:'凝视', fireBurst:'火焰爆发',
          dodgeNext:'下次闪避', thornShot:'荆棘射击', mutation:'变异',
          acidSpray:'酸液喷射', boneSlash:'骨刃斩击', curse:'诅咒',
          shadowFireball:'暗影火球', darkIceSpike:'暗冰刺',
          shadowCurse:'暗影诅咒', shadowLurk:'暗影潜伏',
          bite:'撕咬', doubleStrike:'双击', smash:'重击', phaseStrike:'相位打击'
        };
        // v2.8.4: 效果渲染 - 区分布尔值/整数/小数百分比，避免true显示100%、3显示300%
        const effectsHtml = Object.entries(effects).map(([k, v]) => {
            const name = effectNames[k] || k;
            // 布尔值：显示已激活
            if (v === true) {
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">✓ ${name}</span>`;
            }
            // 布尔值false：不显示
            if (v === false) return '';
            // 整数且大于1：显示实际数字（如层数、上限）
            if (typeof v === 'number' && Number.isInteger(v) && v > 1) {
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">${name}: ${v}</span>`;
            }
            // 小数：显示百分比
            if (typeof v === 'number' && v > 0 && v < 1) {
                const pct = (v * 100).toFixed(0);
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">${name} +${pct}%</span>`;
            }
            // 其他数字：显示实际值
            if (typeof v === 'number' && v !== 0) {
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">${name}: ${v}</span>`;
            }
            return '';
        }).filter(s => s).join('');

        // 进化路线 - v2.8.4: 处理branchEffects分支效果，避免7级10级显示undefined
        let evolutionHtml = '';
        if (talent.evolutions && talent.evolutions.length > 0) {
            const playerBranch = talentData.branch || null;
            evolutionHtml = talent.evolutions.map((evo, idx) => {
                const sc = stageColors[evo.stage] || '#aaa';
                const isCurrent = currentStage && currentStage.name === evo.name;
                const isLocked = evo.level > talentData.level;
                // v2.8.4: 处理branchEffects分支效果
                let evoName = evo.name;
                let evoDesc = evo.description;
                if (evo.branchEffects && !evo.name) {
                    if (playerBranch && evo.branchEffects[playerBranch]) {
                        evoName = evo.branchEffects[playerBranch].name;
                        evoDesc = evo.branchEffects[playerBranch].description;
                    } else {
                        evoName = '分支选择后解锁';
                        evoDesc = playerBranch ? '当前分支无此阶段效果' : '请先在Lv5进化阶段选择分支方向';
                    }
                }
                return `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;opacity:${isLocked?'0.5':'1'};">
                        <span style="width:24px;height:24px;border-radius:50%;background:${isCurrent?sc:'#333'};border:2px solid ${sc};display:flex;align-items:center;justify-content:center;font-size:10px;color:${isCurrent?'#000':sc};font-weight:bold;">${evo.level}</span>
                        <div style="flex:1;">
                            <span style="color:${sc};font-size:12px;font-weight:bold;">【${evo.stage}】${evoName}</span>
                            ${isCurrent ? '<span style="color:#ffd700;font-size:10px;margin-left:6px;">← 当前</span>' : ''}
                            ${evo.branchChoices ? '<span style="color:#ffaa44;font-size:10px;margin-left:6px;">[分支选择]</span>' : ''}
                            ${playerBranch && evo.branchEffects ? `<span style="color:#88ccff;font-size:10px;margin-left:6px;">[${playerBranch}分支]</span>` : ''}
                            <div style="color:#888;font-size:10px;margin-top:2px;">${evoDesc || ''}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.elements.gameContainer.innerHTML += `
            <div id="talent-detail-overlay" style="
                position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(0,0,0,0.88);
                display:flex;flex-direction:column;justify-content:center;align-items:center;
                padding:20px;z-index:10000;overflow-y:auto;
            ">
                <div style="max-width:560px;width:100%;background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid ${rarityConfig.color};border-radius:16px;padding:25px;max-height:90vh;overflow-y:auto;">
                    <!-- 标题栏 -->
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px;">
                        <div>
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                                <span style="font-size:24px;">${SkillSystem.getElementColor(elem) ? '' : '✨'}</span>
                                <span style="color:${SkillSystem.getElementColor(elem)};font-size:18px;font-weight:bold;">${SkillSystem.getElementName(elem)}</span>
                                <span style="color:${rarityConfig.color};font-size:16px;font-weight:bold;">${talent.name}</span>
                                ${mech ? `<span style="font-size:10px;color:${mech.color};background:${mech.color}22;padding:2px 8px;border-radius:10px;">${mech.icon}${mech.name}</span>` : ''}
                            </div>
                            <div style="color:#888;font-size:12px;">${talent.description || ''}</div>
                        </div>
                        <button onclick="document.getElementById('talent-detail-overlay').remove();" style="background:#333;color:#fff;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;" onmouseover="this.style.background='#555'" onmouseout="this.style.background='#333'">×</button>
                    </div>

                    <!-- 等级和经验 -->
                    <div style="background:#0a0a1a;border-radius:8px;padding:12px;margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="color:${rarityConfig.color};font-size:14px;font-weight:bold;">Lv.${talentData.level}${talentData.level >= maxLevel ? ' (满级)' : ''}</span>
                            <span style="color:#888;font-size:11px;">${talentData.level >= maxLevel ? '已满级' : `${talentData.exp}/${expToNext} 经验`}</span>
                        </div>
                        <div style="height:6px;background:#222;border-radius:3px;overflow:hidden;">
                            <div style="height:100%;width:${expPercent}%;background:linear-gradient(90deg,${rarityConfig.color},${rarityConfig.color}88);border-radius:3px;transition:width 0.3s;"></div>
                        </div>
                    </div>

                    <!-- 当前效果 -->
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📊 当前效果</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">
                            ${effectsHtml || '<span style="color:#666;font-size:11px;">暂无效果</span>'}
                        </div>
                    </div>

                    <!-- 机制说明 -->
                    ${mech ? `
                    <div style="margin-bottom:15px;padding:10px 12px;background:${mech.color}11;border:1px solid ${mech.color}44;border-radius:8px;">
                        <div style="color:${mech.color};font-size:12px;font-weight:bold;margin-bottom:4px;">${mech.icon} ${mech.name}机制</div>
                        <div style="color:#bbb;font-size:11px;line-height:1.5;">${mech.desc}</div>
                    </div>
                    ` : ''}

                    <!-- 进化路线 -->
                    ${evolutionHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">🌱 进化路线</div>
                        <div style="background:#0a0a1a;border-radius:8px;padding:12px;">
                            ${evolutionHtml}
                        </div>
                    </div>
                    ` : ''}

                    <!-- 特殊术语解释 -->
                    ${termsHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📖 术语解释</div>
                        ${termsHtml}
                    </div>
                    ` : ''}

                    <!-- 关闭按钮 -->
                    <div style="text-align:center;margin-top:20px;">
                        <button onclick="document.getElementById('talent-detail-overlay').remove();" style="padding:10px 30px;background:linear-gradient(135deg,${rarityConfig.color},${rarityConfig.color}88);color:#000;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
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
    
    renderMapScreen() {
        // v0.9.4: 检查是否有待显示的每日总结
        if (Player._pendingDailySummary) {
            const stats = Player._pendingDailySummary;
            Player._pendingDailySummary = null;
            // 延迟显示，避免和其他弹窗冲突
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
        // v0.81.6: 响应式布局检测（宽度<900px或竖屏方向视为手机竖版）
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
                
                <!-- 顶部状态栏（精简版：只保留核心信息） -->
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
                        <!-- HP可视化进度条 -->
                        <div style="display: flex; align-items: center; gap: 5px;" title="HP: ${Player.hp}/${Player.maxHp}">
                            <span style="font-size: 14px;">❤️</span>
                            <div style="width: 80px; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; border: 1px solid rgba(255,100,100,0.3);">
                                <div style="height: 100%; width: ${(Player.hp / Player.maxHp * 100).toFixed(0)}%; background: ${Player.hp / Player.maxHp > 0.5 ? 'linear-gradient(90deg, #ff4444, #ff6666)' : Player.hp / Player.maxHp > 0.25 ? 'linear-gradient(90deg, #ff8800, #ffaa44)' : 'linear-gradient(90deg, #ff0000, #ff2222); animation: pulse 1s infinite;'}; transition: width 0.3s;"></div>
                            </div>
                            <span style="color: #ff8888; font-size: 12px; min-width: 50px;">${Player.hp}/${Player.maxHp}</span>
                        </div>
                        <!-- MP可视化进度条 -->
                        <div style="display: flex; align-items: center; gap: 5px;" title="MP: ${Player.mp}/${Player.maxMp}">
                            <span style="font-size: 14px;">💧</span>
                            <div style="width: 80px; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; border: 1px solid rgba(100,150,255,0.3);">
                                <div style="height: 100%; width: ${(Player.mp / Player.maxMp * 100).toFixed(0)}%; background: ${Player.mp / Player.maxMp > 0.3 ? 'linear-gradient(90deg, #4466ff, #6688ff)' : 'linear-gradient(90deg, #ff8800, #ffaa44)'}; transition: width 0.3s;"></div>
                            </div>
                            <span style="color: #88aaff; font-size: 12px; min-width: 50px;">${Player.mp}/${Player.maxMp}</span>
                        </div>
                        <span style="color: #888; font-size: 11px; opacity: 0.6;" title="全职法师网页游戏 当前版本">v3.0.0</span>
                        <!-- v2.8.4: 每日行动收益率提示，修炼/学习/猎魔有每日效率递减，探索完全自由不限制 -->
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
                
                <!-- 任务追踪面板（可展开） -->
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
                        <!-- v0.80.0: 地点信息卡（整合妖魔信息） -->
                        ${(() => {
                            const enemies = (typeof MapSystem.getLocationEnemies === 'function') ? MapSystem.getLocationEnemies(location?.id) : [];
                            const npcCount = (location?.npcs || []).length;
                            // 功能标签映射
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
                            // 安全度判断
                            let safetyLevel = '安全', safetyColor = '#66ff66';
                            if (enemies.length > 0) {
                                const maxLevel = Math.max(...enemies.map(e => e.level || 1));
                                if (maxLevel >= Player.level + 5) { safetyLevel = '极危险'; safetyColor = '#ff4444'; }
                                else if (maxLevel >= Player.level) { safetyLevel = '危险'; safetyColor = '#ff8844'; }
                                else { safetyLevel = '有妖魔'; safetyColor = '#ffcc44'; }
                            }
                            // 妖魔图标（最多6个）
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
                        <!-- v0.9.4: 体力低/疲劳建议休息提示 -->
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
                                // v0.80.0: 行动按类型分组
                                const actions = location?.actions || [];
                                // 行动类型判断
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
                                // v0.82.1: 已合并到休息面板的行动，不在行动列表中重复显示
                                const skipActions = ['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full', 'rest_at_mo_fan'];
                                // v0.81.0: 单个行动按钮渲染（紧凑卡片，描述放tooltip）
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
                                    // 按类型配色
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
                                    // tooltip内容
                                    let tooltipText = actionDesc;
                                    // v0.99.0: 体力系统已移除，删除体力消耗显示
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
                                // 按类型分组（过滤已合并到休息面板的行动）
                                const groups = { cultivation: [], explore: [], social: [], rest: [], special: [] };
                                actions.filter(a => !skipActions.includes(a.id)).forEach(a => { groups[getActionType(a)].push(a); });
                                // 渲染分组（v0.81.0: 2列网格）
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
                                    // v0.24.0: 隐藏修炼地点按钮
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

                        <!-- 休息（原地休息/充分休息） -->
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

                        <!-- v0.9.2: 一键恢复（自动使用药品） -->
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

                        <!-- 事件与情报（合并事件追踪和情报） -->
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
                    
                    <!-- 右侧：角色状态面板（竖版隐藏，靠底部导航） -->
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
                            <!-- 角色头部 -->
                            <div style="text-align:center; margin-bottom:15px; padding-bottom:12px; border-bottom:1px solid rgba(100,100,150,0.3);">
                                <div style="font-size:22px; font-weight:bold; color:#ffd700; margin-bottom:4px;">🧙 ${typeof RealmSystem !== 'undefined' ? RealmSystem.getRealm(Player.realm || 'initial').name : '初阶'}魔法师</div>
                                <div style="font-size:13px; color:#aabbdd;">等级 ${Player.level} · ${Player.elements.length}系法师</div>
                                ${(() => {
                                    // v2.9.0: 施法掌控信息
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
                            
                            <!-- 经验条 -->
                            <div style="margin-bottom:14px;">
                                <div style="display:flex; justify-content:space-between; font-size:11px; color:#8899bb; margin-bottom:3px;">
                                    <span>经验</span><span>${Player.exp}/${Player.expToNext}</span>
                                </div>
                                <div style="height:6px; background:#222244; border-radius:3px; overflow:hidden;">
                                    <div style="height:100%; width:${expPct}%; background:linear-gradient(90deg,#ffd700,#ffee88); transition:width 0.3s;"></div>
                                </div>
                            </div>
                            
                            <!-- 状态条 -->
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
                                <!-- v0.99.4: 高效期统一1次 -->
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
                            
                            <!-- 属性数值 -->
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:16px; padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(80,80,120,0.3);">
                                <div style="font-size:12px; color:#ccc;"><span style="color:#ff9966;">⚔️</span> 攻击 <b style="color:#fff; float:right;">${s.attack}</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#6699ff;">🛡️</span> 防御 <b style="color:#fff; float:right;">${s.defense}</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#aaffaa;">💨</span> 速度 <b style="color:#fff; float:right;">${s.speed}</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#ffff66;">🎯</span> 命中 <b style="color:#fff; float:right;">${s.hitRate}%</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#ff66ff;">💥</span> 暴击 <b style="color:#fff; float:right;">${s.critRate}%</b></div>
                                <div style="font-size:12px; color:#ccc;"><span style="color:#66ffff;">🔮</span> 魔攻 <b style="color:#fff; float:right;">${s.magicAttack || s.attack}</b></div>
                            </div>
                            
                            <!-- 已装备 -->
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
                            
                            <!-- 已觉醒元素 -->
                            <div style="margin-bottom:16px;">
                                <div style="font-size:12px; color:#8899bb; margin-bottom:8px; font-weight:bold;">✨ 已觉醒元素</div>
                                <div style="display:flex; flex-wrap:wrap; gap:6px;">
                                    ${Player.elements.map(elem => `<span style="padding:3px 10px; background:${SkillSystem.getElementColor(elem)}22; border:1px solid ${SkillSystem.getElementColor(elem)}; border-radius:10px; font-size:11px; color:${SkillSystem.getElementColor(elem)};">${SkillSystem.getElementName(elem)}</span>`).join('')}
                                </div>
                            </div>
                            
                            <!-- 快捷操作 -->
                            <div style="display:flex; gap:8px; padding-top:12px; border-top:1px solid rgba(100,100,150,0.3);">
                                <button onclick="Game.showRestMenu()" style="flex:1; padding:10px; background:linear-gradient(135deg,rgba(40,80,40,0.9),rgba(60,100,60,0.9)); border:1px solid #66aa66; border-radius:8px; color:#d0ffd0; cursor:pointer; font-size:12px; font-weight:bold;">😴 休息</button>
                                <button onclick="Game.saveGame()" style="flex:1; padding:10px; background:linear-gradient(135deg,rgba(80,80,40,0.9),rgba(100,100,60,0.9)); border:1px solid #aaaa66; border-radius:8px; color:#ffffd0; cursor:pointer; font-size:12px; font-weight:bold;">💾 保存</button>
                            </div>
                            `;
                        })()}
                    </div>
                </div>
                
                <!-- v0.81.1: 底部导航栏（fixed固定，大按钮，手机safe-area适配） -->
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
                // 检查并通知新事件
                EncounterSystem.checkAndNotifyEvents();
            }
        }, 200);
        
        // 回到地图界面，触发消息队列处理
        setTimeout(() => {
            if (!this._isMessageShowing && this._messageQueue.length > 0) {
                this._processNextMessage();
            }
        }, 100);
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

    // ========== 战斗界面 ==========
    // v0.79.0: 可视化地图界面
    renderMapView() {
        const currentLoc = MapSystem.getCurrentLocation();
        const allLocations = (typeof DataLocations !== 'undefined') ? DataLocations : {};
        // v0.79.1: 只显示当前大地图（博城）的地点，三步塔等后续地图地点不显示
        const currentMap = (typeof DataMaps !== 'undefined' && DataMaps.bo_city) ? DataMaps.bo_city : null;
        const mapLocationIds = currentMap ? currentMap.allLocations : Object.keys(allLocations);

        // 生成地点节点
        const locationNodes = [];
        const connectionLines = [];

        for (const locId of mapLocationIds) {
            const loc = allLocations[locId];
            if (!loc || !loc.mapX || !loc.mapY) continue;

            const isCurrent = currentLoc && currentLoc.id === locId;
            const unlocked = Player.unlockedLocations.includes(locId);
            const isConnected = currentLoc && currentLoc.connectedLocations && currentLoc.connectedLocations.includes(locId);

            // 生成连线（当前地点到连通地点）
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

            // v0.81.0: 功能标签映射
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
                <!-- 顶部栏 -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; background: rgba(0,0,0,0.6); border-bottom: 2px solid #444477; z-index: 10;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div onclick="Game.closeMap()" style="padding: 8px 16px; background: #333355; border: 1px solid #555577; border-radius: 8px; color: #ccccff; cursor: pointer; font-size: 14px;">← 返回</div>
                        <h2 style="color: #66aaff; font-size: 22px; margin: 0;">🗺️ 博城地图</h2>
                    </div>
                    <div style="color: #aaa; font-size: 13px;">
                        📍 当前位置：<span style="color: #66ff88;">${currentLoc ? currentLoc.name : '未知'}</span>
                    </div>
                </div>

                <!-- 地图区域 -->
                <div style="flex: 1; position: relative; overflow: hidden;">
                    <!-- 地图背景装饰 -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background:
                        radial-gradient(circle at 20% 30%, rgba(60, 80, 100, 0.3) 0%, transparent 40%),
                        radial-gradient(circle at 80% 70%, rgba(80, 60, 100, 0.3) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, rgba(40, 50, 80, 0.2) 0%, transparent 60%);
                    "></div>

                    <!-- 网格线 -->
                    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; z-index: 0;">
                        <defs>
                            <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#4466aa" stroke-width="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)"/>
                    </svg>

                    <!-- 连线 SVG -->
                    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
                        ${connectionLines.map(line => {
                            const x1 = line.from.x + '%';
                            const y1 = line.from.y + '%';
                            const x2 = line.to.x + '%';
                            const y2 = line.to.y + '%';
                            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${line.unlocked ? '#6688cc' : '#444'}" stroke-width="2" stroke-dasharray="${line.unlocked ? 'none' : '5,5'}" opacity="0.6"/>`;
                        }).join('')}
                    </svg>

                    <!-- 地点节点 -->
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

                        // v0.81.0: tooltip内容
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
                                <!-- v0.81.0: 悬停tooltip -->
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

                <!-- 底部图例 -->
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
    },

    renderBattleScreen() {
        const state = BattleSystem.getState();
        const isPortrait = UI.isPortrait();
        const skillCols = isPortrait ? 3 : 5;
        const spriteW = isPortrait ? 70 : 100;
        const spriteH = isPortrait ? 100 : 140;
        // v2.9.6.3: 战斗背景动态切换 - 根据妖魔元素选择对应系别背景
        const elemBgMap = {
            fire: 'assets/images/effects/fire_magic.jpg',
            thunder: 'assets/images/effects/thunder_magic.jpg',
            ice: 'assets/images/effects/ice_magic.jpg',
            dark: 'assets/images/effects/dark_magic.jpg',
            earth: 'assets/images/effects/earth_magic.jpg',
            wind: 'assets/images/effects/wind_magic.jpg',
            water: 'assets/images/effects/ice_magic.jpg',
            light: 'assets/images/effects/thunder_magic.jpg',
            plant: 'assets/images/effects/dark_magic.jpg',
            heal: 'assets/images/effects/wind_magic.jpg',
            summon: 'assets/images/effects/earth_magic.jpg'
        };
        const enemyElem = state.enemy?.elements?.[0] || 'dark';
        const battleBg = elemBgMap[enemyElem] || 'assets/images/effects/fire_magic.jpg';
        // v1.2.2: 技能展开时横版面板高度增加，避免滚动
        const skillsExpanded = !!this._expandedBattleElement;
        const panelH = isPortrait ? 'auto' : (skillsExpanded ? '300px' : '220px');
        const logW = isPortrait ? 'calc(100% - 20px)' : '340px';
        const logMaxH = isPortrait ? '90px' : '280px';
        const logPos = isPortrait ? 'position:relative; top:auto; left:auto; margin:5px 10px; flex-shrink:0; height:90px;' : 'position: absolute; top: 20px; left: 20px;';
        const playerPos = isPortrait ? 'position:relative; bottom:auto; left:auto; margin:5px auto; order:2;' : 'position: absolute; bottom: 60px; left: 15%;';
        const enemyPos = isPortrait ? 'position:relative; top:auto; right:auto; margin:5px auto; order:1;' : '';
        const arenaFlex = isPortrait ? 'display:flex; flex-direction:column; justify-content:flex-start; padding-top:5px; gap:10px;' : '';
        const sideBtnsPos = isPortrait ? 'position:relative; top:auto; right:auto; display:flex; gap:8px; justify-content:center; margin:0 auto 5px;' : 'position: absolute; right: 20px;';
        
        this.elements.gameContainer.innerHTML = `
            <div id="battle-screen" style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(to bottom, #1a1a3a, #2a2a5a); position: relative;">
                
                <!-- 战斗背景层（预留接口：后续根据地点/妖魔类型动态替换背景图） -->
                <div id="battle-bg-layer" style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('${battleBg}') center/cover;
                    opacity: 0.35;
                    filter: blur(2px) saturate(1.1);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                <!-- 战斗特效层（预留接口：技能特效、受击特效等在此层播放） -->
                <div id="battle-effect-layer" style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: 5;
                    pointer-events: none;
                "></div>
                
                <!-- 战斗场地 -->
                <div style="flex: 1; position: relative; overflow: ${isPortrait ? 'auto' : 'hidden'}; z-index: 2; ${arenaFlex}">
                    <!-- 战斗场地渐变遮罩：增强氛围，底部加深突出角色（仅覆盖战斗场地，不影响技能面板） -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: linear-gradient(180deg, rgba(10,10,30,0.2) 0%, rgba(20,20,50,0.3) 50%, rgba(10,10,30,0.6) 100%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    
                    <!-- v1.8.1: 队友状态条（组队战斗时显示） -->
                    ${state.allies && state.allies.length > 0 ? `
                    <div style="position: absolute; top: 10px; right: 20px; z-index: 10; display: flex; flex-direction: column; gap: 6px; max-width: 200px;">
                        ${state.allies.map(ally => `
                            <div style="background: rgba(0,0,0,0.7); border: 1px solid ${ally.hp > 0 ? '#4488ff' : '#666'}; border-radius: 8px; padding: 6px 10px; font-size: 12px; opacity: ${ally.hp > 0 ? 1 : 0.5};">
                                <div style="color: #fff; font-weight: bold; margin-bottom: 3px;">${ally.name || '队友'}</div>
                                <div style="display: flex; justify-content: space-between; font-size: 10px; color: #ff6666; margin-bottom: 2px;">
                                    <span>HP</span><span>${ally.hp || 0}/${ally.maxHp || 100}</span>
                                </div>
                                <div style="height: 5px; background: #333; border-radius: 3px; overflow: hidden;">
                                    <div style="height: 100%; width: ${Math.max(0, ((ally.hp || 0) / (ally.maxHp || 100) * 100)).toFixed(1)}%; background: linear-gradient(90deg, #44ff44, #66ff66); transition: width 0.3s;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <!-- 战斗日志（竖版隐藏，用按钮弹出） -->
                    <div id="battle-log" style="
                        ${logPos}
                        width: ${logW};
                        max-height: ${logMaxH};
                        overflow-y: auto;
                        background: rgba(0, 0, 0, 0.7);
                        border: 1px solid #555;
                        border-radius: 10px;
                        padding: 12px;
                        font-size: 13px;
                        line-height: 1.7;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                        ${isPortrait ? 'display:none;' : ''}
                    ">
                        <div style="color: #ffd700; font-weight: bold; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #444; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                            <span>📜 战斗日志</span>
                            <span style="font-size: 12px; color: #aaa;">第 ${state.turn || 1} 回合</span>
                        </div>
                        ${state.log.map(log => {
                            const logIcons = { damage: '⚔️', magic: '✨', heal: '💚', crit: '💥', system: '📢', buff: '⬆️', debuff: '⬇️', counter: '🔥', weakness: '❄️', flee: '🏃', item: '🎒', defend: '🛡️', interrupt: '⚡', summon: '🐺', soul: '💎', evolution: '🔮' };
                            const icon = logIcons[log.type] || '';
                            return `<p style="margin-bottom: 5px; color: ${this.getLogColor(log.type)}; padding: 2px 4px; border-radius: 3px;">${icon ? icon + ' ' : ''}${log.text}</p>`;
                        }).join('')}
                    </div>
                    
                    <!-- 玩家 -->
                    <div style="
                        ${playerPos}
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        order: 2;
                    ">
                        <div style="
                            width: ${spriteW}px;
                            height: ${spriteH}px;
                            background: radial-gradient(ellipse at 50% 30%, #8888ff 0%, #5555bb 40%, #333388 100%);
                            border-radius: 50px 50px 10px 10px;
                            margin-bottom: 10px;
                            box-shadow: 0 0 40px rgba(100, 100, 255, 0.5), inset 0 0 20px rgba(150, 150, 255, 0.3);
                            transition: all 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: ${isPortrait ? 42 : 56}px;
                            animation: float 3s ease-in-out infinite;
                        " id="player-sprite" class="battle-sprite">🧙</div>
                        <div style="font-size: 18px; font-weight: bold; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                            ${state.player.name}
                            <span style="font-size: 14px; color: #66ccff;">Lv.${state.player.level}</span>
                            ${state.player.realm ? `<span style="font-size: 11px; color: ${
                                state.player.realm === 'super' ? '#ff66ff' :
                                state.player.realm === 'high' ? '#ff9966' :
                                state.player.realm === 'middle' ? '#66ccff' : '#99cc99'
                            };">${
                                state.player.realm === 'initial' ? '初阶' :
                                state.player.realm === 'middle' ? '中阶' :
                                state.player.realm === 'high' ? '高阶' :
                                state.player.realm === 'super' ? '超阶' : state.player.realm
                            }</span>` : ''}
                        </div>
                        ${state.player.elements && state.player.elements.length > 0 ? `
                            <div style="margin-top: 4px; display: flex; gap: 4px; justify-content: center;">
                                ${state.player.elements.map(elem => {
                                    const elemIcons = { fire: '🔥', ice: '❄️', thunder: '⚡', earth: '🪨', wind: '🌪️', water: '💧', light: '✨', dark: '🌑', heal: '💚', summon: '🐺', neutral: '⚔️' };
                                    const elemNames = { fire: '火', ice: '冰', thunder: '雷', earth: '土', wind: '风', water: '水', light: '光', dark: '暗', heal: '治愈', summon: '召唤', neutral: '无' };
                                    const elemColors = { fire: '#ff6644', ice: '#66aaff', thunder: '#ffdd44', earth: '#aa8844', wind: '#88ffcc', water: '#66bbff', light: '#ffffcc', dark: '#aa66ff', heal: '#66ffaa', summon: '#cc9966', neutral: '#999' };
                                    return `<span style="font-size: 11px; padding: 1px 5px; background: ${elemColors[elem] || '#666'}33; border: 1px solid ${elemColors[elem] || '#666'}; border-radius: 3px; color: ${elemColors[elem] || '#fff'};">${elemIcons[elem] || ''}${elemNames[elem] || elem}</span>`;
                                }).join('')}
                            </div>
                        ` : ''}
                        <div style="margin-top: 8px; width: 120px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #ff6666; margin-bottom: 2px;">
                                <span>HP</span><span>${state.player.hp}/${state.player.maxHp} (${Math.floor(state.player.hp / state.player.maxHp * 100)}%)</span>
                            </div>
                            <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.player.hp / state.player.maxHp * 100).toFixed(1)}%; background: ${
                                    state.player.hp / state.player.maxHp > 0.5 ? 'linear-gradient(90deg, #44ff44, #66ff66)' :
                                    state.player.hp / state.player.maxHp > 0.25 ? 'linear-gradient(90deg, #ffaa00, #ffcc44)' :
                                    'linear-gradient(90deg, #ff2222, #ff4444)'
                                }; transition: width 0.5s;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6666ff; margin: 4px 0 2px;">
                                <span>MP</span><span>${state.player.mp}/${state.player.maxMp}</span>
                            </div>
                            <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.player.mp / state.player.maxMp * 100).toFixed(1)}%; background: ${
                                    state.player.mp / state.player.maxMp > 0.3 ? 'linear-gradient(90deg, #4444ff, #6666ff)' :
                                    state.player.mp / state.player.maxMp > 0.1 ? 'linear-gradient(90deg, #ffaa00, #ffcc44)' :
                                    'linear-gradient(90deg, #ff2222, #ff4444)'
                                }; transition: width 0.5s;"></div>
                            </div>
                            ${BattleSystem.elementEnergy > 0 ? `
                            <div style="margin-top: 4px;">
                                <div style="display: flex; justify-content: space-between; font-size: 10px; color: ${BattleSystem.elementEnergy >= BattleSystem.elementEnergyMax ? '#ffdd44' : '#aa88ff'}; margin-bottom: 2px;">
                                    <span>⚡ 元素能量</span><span>${BattleSystem.elementEnergy}/${BattleSystem.elementEnergyMax}</span>
                                </div>
                                <div style="height: 5px; background: #333; border-radius: 3px; overflow: hidden;">
                                    <div style="height: 100%; width: ${(BattleSystem.elementEnergy / BattleSystem.elementEnergyMax * 100).toFixed(0)}%; background: ${BattleSystem.elementEnergy >= BattleSystem.elementEnergyMax ? 'linear-gradient(90deg, #ffdd44, #ffee88); box-shadow: 0 0 8px #ffdd44;' : 'linear-gradient(90deg, #8844ff, #aa66ff)'}; transition: width 0.3s;"></div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- 玩家状态效果 -->
                        ${state.player.statusEffects && state.player.statusEffects.length > 0 ? `
                            <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; max-width: 140px;">
                                ${state.player.statusEffects.map(effect => {
                                    const icons = { burn: '🔥', freeze: '❄️', frozen: '❄️', stun: '⚡', wet: '💧', shield: '🛡️', curse: '💀', slow: '🐌', defense_up: '🛡️', speed_up: '💨', evasion_up: '💨', dodge_up: '💨', attack_up: '⚔️', attack_down: '📉', defense_down: '🛡️⬇️', accuracy_down: '🎯', regen: '💚', electrified: '⚡', mud: '🟤', steam: '💨', poison: '☠️', bind: '🔗', silence: '🔇', fear: '😱', bleed: '🩸' };
                                    const colors = { burn: '#ff6644', freeze: '#66aaff', frozen: '#66ddff', stun: '#ffdd44', wet: '#66bbff', shield: '#44ddcc', curse: '#aa66ff', slow: '#999', defense_up: '#66ff66', speed_up: '#88ff88', evasion_up: '#88ffaa', dodge_up: '#88ffcc', attack_up: '#ff8844', attack_down: '#aaaaaa', defense_down: '#ff8888', accuracy_down: '#ffcc44', regen: '#66ffaa', electrified: '#ffff44', mud: '#aa8844', steam: '#ccc', poison: '#88ff44', bind: '#aa88ff', silence: '#8888ff', fear: '#ff4488', bleed: '#ff4444' };
                                    const descriptions = { burn: '每回合受到火焰伤害', freeze: '冰冻，无法行动', frozen: '冰冻，无法行动', stun: '眩晕，无法行动', wet: '湿润，雷系伤害增加', shield: '护盾，吸收伤害', curse: '诅咒，全属性降低', slow: '减速，速度降低', defense_up: '防御提升', speed_up: '速度提升', evasion_up: '闪避提升', dodge_up: '闪避提升', attack_up: '攻击提升', attack_down: '攻击降低', defense_down: '防御降低', accuracy_down: '命中降低', regen: '每回合恢复HP', electrified: '麻痹，有概率无法行动', mud: '泥沼，速度降低', steam: '雾气，闪避提升', poison: '中毒，每回合受到伤害', bind: '束缚，无法行动', silence: '沉默，无法使用魔法', fear: '恐惧，攻击降低', bleed: '流血，每回合受到伤害' };
                                    const icon = icons[effect.type] || '✨';
                                    const color = colors[effect.type] || '#fff';
                                    const desc = descriptions[effect.type] || '';
                                    const stacks = effect.stacks ? `×${effect.stacks}` : '';
                                    const value = effect.shieldAmount ? ` ${effect.shieldAmount}` : (effect.value ? ` ${effect.value}` : '');
                                    const duration = effect.type === 'shield' ? '' : (effect.duration ? ` (${effect.duration}回合)` : '');
                                    return `<span style="font-size: 11px; padding: 2px 5px; background: rgba(0,0,0,0.5); border: 1px solid ${color}; border-radius: 4px; color: ${color};" title="${effect.name}${effect.type === 'shield' ? ' (' + effect.shieldAmount + '护盾)' : duration}${desc ? '\\n' + desc : ''}">${icon}${stacks}${value}</span>`;
                                }).join('')}
                            </div>
                        ` : ''}
                        
                        ${state.playerCasting ? `
                            <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255, 200, 0, 0.3); border: 1px solid #ffcc00; border-radius: 5px; font-size: 12px; color: #ffcc00;">
                                引导中: ${state.playerCasting.skill.name} (${state.playerCasting.progress}/${state.playerCasting.totalTime})
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- 召唤兽 -->
                    ${state.summon ? `
                    <div style="
                        position: absolute;
                        bottom: 60px;
                        left: 30%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <div style="
                            width: 70px;
                            height: 90px;
                            background: linear-gradient(180deg, #665544, #443322);
                            border-radius: 35px 35px 8px 8px;
                            margin-bottom: 8px;
                            box-shadow: 0 0 20px rgba(255, 153, 102, 0.4);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 36px;
                        ">${state.summon.icon || '🐺'}</div>
                        <div style="font-size: 14px; font-weight: bold; color: #ffcc99; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                            ${state.summon.name}
                        </div>
                        <div style="font-size: 11px; color: #ffaa66; margin-bottom: 4px;">剩余 ${state.summon.remainingDuration} 回合</div>
                        <div style="width: 90px;">
                            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #ff6666; margin-bottom: 2px;">
                                <span>HP</span><span>${state.summon.hp}/${state.summon.maxHp}</span>
                            </div>
                            <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.summon.hp / state.summon.maxHp * 100).toFixed(1)}%; background: linear-gradient(90deg, #ff8844, #ffaa66); transition: width 0.5s;"></div>
                            </div>
                        </div>
                        ${state.summon.statusEffects && state.summon.statusEffects.length > 0 ? `
                            <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; max-width: 100px;">
                                ${state.summon.statusEffects.map(effect => {
                                    const icons = { summon_buff: '💪', summon_rage: '😡' };
                                    const colors = { summon_buff: '#66ff66', summon_rage: '#ff4444' };
                                    const icon = icons[effect.type] || '✨';
                                    const color = colors[effect.type] || '#fff';
                                    return `<span style="font-size: 10px; padding: 1px 4px; background: rgba(0,0,0,0.5); border: 1px solid ${color}; border-radius: 3px; color: ${color};" title="${effect.name}">${icon}</span>`;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- 敌人 -->
                    <div style="
                        ${isPortrait ? 'position:relative; bottom:auto; right:auto; margin:10px auto; order:1;' : 'position: absolute; bottom: 60px; right: 15%;'}
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <div style="
                            width: ${isPortrait ? 80 : 110}px;
                            height: ${isPortrait ? 110 : 150}px;
                            background: radial-gradient(ellipse at 50% 30%, ${state.enemy.spriteColor || '#663399'} 0%, ${state.enemy.spriteColor || '#442266'}aa 50%, ${state.enemy.spriteColor || '#221133'} 100%);
                            border-radius: 55px 55px 10px 10px;
                            margin-bottom: 10px;
                            box-shadow: 0 0 40px ${state.enemy.spriteColor || '#663399'}80, inset 0 0 20px ${state.enemy.spriteColor || '#663399'}40;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: ${isPortrait ? 42 : 56}px;
                            animation: float 3s ease-in-out infinite;
                            animation-delay: 0.5s;
                        " id="enemy-sprite" class="battle-sprite">${state.enemy.icon || '👹'}</div>
                        <div style="font-size: 18px; font-weight: bold; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); cursor:pointer;" onclick="UI.showEnemyDetail('${state.enemy.id || ''}')" title="点击查看敌人详情">
                            ${state.enemy.name}
                            <span style="font-size: 14px; color: #ffcc66;">Lv.${state.enemy.level}</span>
                            ${state.enemy.isElite ? '<span style="color: #ff6600;"> ⭐精英</span>' : ''}
                            ${(state.enemy.isMage || state.enemy.enemyType === 'mage') ? '<span style="color: #66ccff; font-size:12px;" title="魔法师敌人，施法可被控制技能打断"> 🔮法师</span>' : ''}
                            <span style="font-size:14px;opacity:0.7;margin-left:4px;">ℹ️</span>
                        </div>
                        ${state.enemy.title ? `<div style="font-size: 12px; color: #ff9966; margin-bottom: 8px;">${state.enemy.title}</div>` : ''}
                        <!-- v2.9.0: 敌方施法状态显示（仅魔法师敌人） -->
                        ${state.enemyCasting ? `
                            <div style="margin-bottom: 8px; padding: 6px 12px; background: linear-gradient(90deg, rgba(255,100,100,0.3), rgba(255,200,100,0.3)); border: 1px solid #ff6644; border-radius: 12px; animation: pulse 1.5s infinite;">
                                <span style="color: #ff8866; font-size: 12px; font-weight: bold;">⚡ 正在引导：${state.enemyCasting.skill?.name || '魔法'}</span>
                                <span style="color: #ffcc66; font-size: 11px; margin-left: 6px;">(${state.enemyCasting.progress || 1}/${state.enemyCasting.totalTime || 1}回合)</span>
                                <div style="color: #aaa; font-size: 10px; margin-top: 2px;">用控制技能可打断！</div>
                            </div>
                        ` : ''}
                        <!-- 敌人元素系 -->
                        ${state.enemy.elements && state.enemy.elements.length > 0 ? `
                            <div style="margin-bottom: 8px; display: flex; gap: 4px; justify-content: center;">
                                ${state.enemy.elements.map(elem => {
                                    const elemNames = { fire: '火', ice: '冰', thunder: '雷', earth: '土', wind: '风', water: '水', light: '光', dark: '暗', heal: '治愈', summon: '召唤', neutral: '无' };
                                    const elemColors = { fire: '#ff6644', ice: '#66aaff', thunder: '#ffdd44', earth: '#aa8844', wind: '#88ffcc', water: '#66bbff', light: '#ffffcc', dark: '#aa66ff', heal: '#66ffaa', summon: '#ff9966', neutral: '#999' };
                                    const name = elemNames[elem] || elem;
                                    const color = elemColors[elem] || '#fff';
                                    return `<span style="font-size: 11px; padding: 2px 8px; background: ${color}22; border: 1px solid ${color}; border-radius: 10px; color: ${color};">${name}系</span>`;
                                }).join('')}
                            </div>
                            <!-- v0.11.0: 元素克制提示 -->
                            <div style="margin-bottom: 8px; display: flex; flex-direction: column; gap: 3px; align-items: center;">
                                ${(() => {
                                    const elemNames = { fire: '火', ice: '冰', thunder: '雷', earth: '土', wind: '风', water: '水', light: '光', dark: '暗' };
                                    const elemColors = { fire: '#ff6644', ice: '#66aaff', thunder: '#ffdd44', earth: '#aa8844', wind: '#88ffcc', water: '#66bbff', light: '#ffffcc', dark: '#aa66ff' };
                                    // 克制关系：key克制value
                                    const counterMap = { fire: 'ice', ice: 'wind', wind: 'earth', earth: 'thunder', thunder: 'water', water: 'fire' };
                                    // 计算被克制的元素（weakTo）和克制的元素（strongAgainst）
                                    const weakTo = [];
                                    const strongAgainst = [];
                                    state.enemy.elements.forEach(elem => {
                                        // 找到克制当前元素的元素
                                        Object.entries(counterMap).forEach(([attacker, defender]) => {
                                            if (defender === elem) weakTo.push(attacker);
                                        });
                                        // 当前元素克制的元素
                                        if (counterMap[elem]) strongAgainst.push(counterMap[elem]);
                                        // 光暗互相克制
                                        if (elem === 'light') { weakTo.push('dark'); strongAgainst.push('dark'); }
                                        if (elem === 'dark') { weakTo.push('light'); strongAgainst.push('light'); }
                                    });
                                    const uniqueWeak = [...new Set(weakTo)];
                                    const uniqueStrong = [...new Set(strongAgainst)];
                                    let html = '';
                                    if (uniqueWeak.length > 0) {
                                        html += `<div style="font-size: 10px; color: #66ff66;">被克制: ${uniqueWeak.map(e => `<span style="color: ${elemColors[e]};">${elemNames[e]}</span>`).join('/')} (150%伤害)</div>`;
                                    }
                                    if (uniqueStrong.length > 0) {
                                        html += `<div style="font-size: 10px; color: #ff8866;">克制: ${uniqueStrong.map(e => `<span style="color: ${elemColors[e]};">${elemNames[e]}</span>`).join('/')} (70%伤害)</div>`;
                                    }
                                    return html;
                                })()}
                            </div>
                        ` : ''}
                        <!-- 敌人种族天赋 -->
                        ${state.enemy.traits && state.enemy.traits.length > 0 ? `
                            <div style="margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; max-width: 150px;">
                                ${state.enemy.traits.map(trait => {
                                    return `<span style="font-size: 10px; padding: 2px 6px; background: rgba(255, 200, 100, 0.15); border: 1px solid #ffcc66; border-radius: 4px; color: #ffcc66; cursor: help;" title="${trait.description}">${trait.name}</span>`;
                                }).join('')}
                            </div>
                        ` : ''}
                        <div style="width: 130px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #ff6666; margin-bottom: 2px;">
                                <span>HP</span><span>${state.enemy.hp}/${state.enemy.maxHp} (${Math.floor(state.enemy.hp / state.enemy.maxHp * 100)}%)</span>
                            </div>
                            <div style="height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.enemy.hp / state.enemy.maxHp * 100).toFixed(1)}%; background: ${
                                    state.enemy.hp / state.enemy.maxHp > 0.5 ? 'linear-gradient(90deg, #44ff44, #66ff66)' :
                                    state.enemy.hp / state.enemy.maxHp > 0.25 ? 'linear-gradient(90deg, #ffaa00, #ffcc44)' :
                                    'linear-gradient(90deg, #ff2222, #ff4444)'
                                }; transition: width 0.5s;"></div>
                            </div>
                            ${state.enemy.mp && state.enemy.maxMp ? `
                            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6666ff; margin: 4px 0 2px;">
                                <span>MP</span><span>${state.enemy.mp}/${state.enemy.maxMp}</span>
                            </div>
                            <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.enemy.mp / state.enemy.maxMp * 100).toFixed(1)}%; background: ${
                                    state.enemy.mp / state.enemy.maxMp > 0.3 ? 'linear-gradient(90deg, #4444ff, #6666ff)' :
                                    state.enemy.mp / state.enemy.maxMp > 0.1 ? 'linear-gradient(90deg, #ffaa00, #ffcc44)' :
                                    'linear-gradient(90deg, #ff2222, #ff4444)'
                                }; transition: width 0.5s;"></div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- 敌人状态效果 -->
                        ${state.enemy.statusEffects && state.enemy.statusEffects.length > 0 ? `
                            <div style="margin-top: 6px; display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; max-width: 150px;">
                                ${state.enemy.statusEffects.map(effect => {
                                    const icons = { burn: '🔥', freeze: '❄️', frozen: '❄️', stun: '⚡', wet: '💧', shield: '🛡️', curse: '💀', slow: '🐌', defense_up: '🛡️', speed_up: '💨', evasion_up: '💨', dodge_up: '💨', attack_up: '⚔️', attack_down: '📉', defense_down: '🛡️⬇️', accuracy_down: '🎯', regen: '💚', electrified: '⚡', mud: '🟤', steam: '💨', poison: '☠️', bind: '🔗', silence: '🔇', fear: '😱', bleed: '🩸' };
                                    const colors = { burn: '#ff6644', freeze: '#66aaff', frozen: '#66ddff', stun: '#ffdd44', wet: '#66bbff', shield: '#44ddcc', curse: '#aa66ff', slow: '#999', defense_up: '#66ff66', speed_up: '#88ff88', evasion_up: '#88ffaa', dodge_up: '#88ffcc', attack_up: '#ff8844', attack_down: '#aaaaaa', defense_down: '#ff8888', accuracy_down: '#ffcc44', regen: '#66ffaa', electrified: '#ffff44', mud: '#aa8844', steam: '#ccc', poison: '#88ff44', bind: '#aa88ff', silence: '#8888ff', fear: '#ff4488', bleed: '#ff4444' };
                                    const descriptions = { burn: '每回合受到火焰伤害', freeze: '冰冻，无法行动', frozen: '冰冻，无法行动', stun: '眩晕，无法行动', wet: '湿润，雷系伤害增加', shield: '护盾，吸收伤害', curse: '诅咒，全属性降低', slow: '减速，速度降低', defense_up: '防御提升', speed_up: '速度提升', evasion_up: '闪避提升', dodge_up: '闪避提升', attack_up: '攻击提升', attack_down: '攻击降低', defense_down: '防御降低', accuracy_down: '命中降低', regen: '每回合恢复HP', electrified: '麻痹，有概率无法行动', mud: '泥沼，速度降低', steam: '雾气，闪避提升', poison: '中毒，每回合受到伤害', bind: '束缚，无法行动', silence: '沉默，无法使用魔法', fear: '恐惧，攻击降低', bleed: '流血，每回合受到伤害' };
                                    const icon = icons[effect.type] || '✨';
                                    const color = colors[effect.type] || '#fff';
                                    const desc = descriptions[effect.type] || '';
                                    const stacks = effect.stacks ? `×${effect.stacks}` : '';
                                    const value = effect.shieldAmount ? ` ${effect.shieldAmount}` : (effect.value ? ` ${effect.value}` : '');
                                    const duration = effect.type === 'shield' ? '' : (effect.duration ? ` (${effect.duration}回合)` : '');
                                    return `<span style="font-size: 11px; padding: 2px 5px; background: rgba(0,0,0,0.5); border: 1px solid ${color}; border-radius: 4px; color: ${color};" title="${effect.name}${effect.type === 'shield' ? ' (' + effect.shieldAmount + '护盾)' : duration}${desc ? '\\n' + desc : ''}">${icon}${stacks}${value}</span>`;
                                }).join('')}
                            </div>
                        ` : ''}
                        
                        ${state.enemyCasting ? `
                            <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255, 100, 100, 0.3); border: 1px solid #ff6666; border-radius: 5px; font-size: 12px; color: #ff6666;">
                                引导中: ${state.enemyCasting.skill.name} (${state.enemyCasting.progress}/${state.enemyCasting.totalTime})
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- 回合指示 -->
                    <div style="
                        ${isPortrait ? 'position:relative; top:auto; right:auto; display:flex; justify-content:space-between; align-items:center; margin:5px 10px; order:0;' : 'position: absolute; top: 20px; right: 20px;'}
                        padding: 10px 20px;
                        background: rgba(0, 0, 0, 0.6);
                        border-radius: 8px;
                        font-size: 16px;
                        color: ${state.isPlayerTurn ? '#66ff66' : '#ff6666'};
                        ${isPortrait ? '' : 'text-align: right;'}
                    ">
                        <div>
                        ${state.battleOptions && state.battleOptions.mode !== 'normal' ? `<div style="font-size: 12px; color: #ffcc66; margin-bottom: 4px;">${
                            state.battleOptions.mode === 'duel' ? '⚔️ 决斗模式' :
                            state.battleOptions.mode === 'gauntlet' ? '🔄 车轮战' :
                            state.battleOptions.mode === 'hunt' ? '🏹 狩猎战' :
                            state.battleOptions.mode === 'boss' ? '👑 Boss战' :
                            state.battleOptions.mode
                        }</div>` : ''}
                        <div>第 ${state.turn} 回合 - ${state.isPlayerTurn ? '你的回合' : '敌人回合'}</div>
                        </div>
                        ${isPortrait ? `
                        <div style="display:flex; gap:6px;">
                            <button onclick="BattleSystem.toggleSpeed()" style="padding:4px 8px; background:linear-gradient(135deg,#333366,#444488); border:1px solid #6666aa; border-radius:6px; color:#aaccff; font-size:11px; cursor:pointer;">⏩${state.speed || 1}x</button>
                            <button onclick="BattleSystem.toggleAutoBattle()" style="padding:4px 8px; background:${state.autoBattle ? 'linear-gradient(135deg,#663333,#aa4444)' : 'linear-gradient(135deg,#666633,#888844)'}; border:1px solid ${state.autoBattle ? '#ff6666' : '#aaaa66'}; border-radius:6px; color:${state.autoBattle ? '#ffaaaa' : '#ddddaa'}; font-size:11px; cursor:pointer;">🤖自动</button>
                            <button onclick="BattleSystem.showHelp()" style="padding:4px 8px; background:linear-gradient(135deg,#336633,#448844); border:1px solid #66aa66; border-radius:6px; color:#aaffaa; font-size:11px; cursor:pointer;">❓</button>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- 右侧控制按钮组（横版显示，竖版已整合到回合指示） -->
                    <div style="${isPortrait ? 'display:none;' : 'position:absolute; top:0; right:0;'}">
                    <!-- 战斗速度按钮 -->
                    <button onclick="BattleSystem.toggleSpeed()" style="
                        ${isPortrait ? 'padding:6px 12px; font-size:12px;' : 'position:relative; margin-top:70px; margin-right:20px;'}
                        padding: ${isPortrait ? '6px 12px' : '8px 16px'};
                        background: linear-gradient(135deg, #333366, #444488);
                        border: 2px solid #6666aa;
                        border-radius: 8px;
                        color: #aaccff;
                        cursor: pointer;
                        font-size: ${isPortrait ? '12px' : '14px'};
                        font-weight: bold;
                        z-index: 10;
                        display:block;
                    " onmouseover="this.style.boxShadow='0 0 10px rgba(100, 150, 255, 0.5)'" onmouseout="this.style.boxShadow='none'">
                        ⏩ ${state.speed || 1}x
                    </button>
                    
                    <!-- 自动战斗按钮 -->
                    <button onclick="BattleSystem.toggleAutoBattle()" style="
                        ${isPortrait ? 'padding:6px 12px; font-size:12px;' : 'position:relative; margin-top:10px; margin-right:20px;'}
                        padding: ${isPortrait ? '6px 12px' : '8px 16px'};
                        background: ${state.autoBattle ? 'linear-gradient(135deg, #663333, #aa4444)' : 'linear-gradient(135deg, #666633, #888844)'};
                        border: 2px solid ${state.autoBattle ? '#ff6666' : '#aaaa66'};
                        border-radius: 8px;
                        color: ${state.autoBattle ? '#ffaaaa' : '#ddddaa'};
                        cursor: pointer;
                        font-size: ${isPortrait ? '12px' : '14px'};
                        font-weight: bold;
                        z-index: 10;
                        display:block;
                    " onmouseover="this.style.boxShadow='0 0 10px rgba(200, 200, 100, 0.5)'" onmouseout="this.style.boxShadow='none'">
                        ${state.autoBattle ? '🤖 自动中' : '🤖 自动'}
                    </button>
                    
                    <!-- 战斗帮助按钮 -->
                    <button onclick="BattleSystem.showHelp()" style="
                        ${isPortrait ? 'padding:6px 12px; font-size:12px;' : 'position:relative; margin-top:10px; margin-right:20px;'}
                        padding: ${isPortrait ? '6px 12px' : '8px 16px'};
                        background: linear-gradient(135deg, #336633, #448844);
                        border: 2px solid #66aa66;
                        border-radius: 8px;
                        color: #aaffaa;
                        cursor: pointer;
                        font-size: ${isPortrait ? '12px' : '14px'};
                        font-weight: bold;
                        z-index: 10;
                        display:block;
                    " onmouseover="this.style.boxShadow='0 0 10px rgba(100, 255, 150, 0.5)'" onmouseout="this.style.boxShadow='none'">
                        ❓ 帮助
                    </button>
                    </div>
                </div>
                
                <!-- 竖版浮动日志按钮 -->
                ${isPortrait ? `
                <button onclick="UI.showBattleLogModal()" style="
                    position: absolute;
                    top: 50px;
                    right: 10px;
                    padding: 8px 14px;
                    background: linear-gradient(135deg, #554400, #776600);
                    border: 2px solid #ccaa00;
                    border-radius: 20px;
                    color: #ffee88;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 20;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
                ">📜 日志</button>
                ` : ''}
                
                <!-- 技能/操作面板 -->
                <div style="
                    height: ${panelH};
                    background: linear-gradient(to top, rgba(10, 10, 30, 0.98), rgba(20, 20, 50, 0.9));
                    border-top: 3px solid #4a4a8a;
                    padding: 15px 25px;
                    ${isPortrait ? 'padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px));' : ''}
                ">
                    <!-- 基础行动（统一技能框样式） -->
                    <div style="display: grid; grid-template-columns: repeat(${skillCols}, 1fr); gap: 12px; margin-bottom: 15px;">
                        <button onclick="Game.battleAttack()" ${!state.isPlayerTurn ? 'disabled' : ''}
                            title="普通攻击：造成物理伤害"
                            style="padding:14px 10px; background:linear-gradient(135deg,#55333322,#77444444); border:2px solid #aa6666; border-radius:10px; color:#ffcccc; cursor:${state.isPlayerTurn?'pointer':'not-allowed'}; text-align:center; opacity:${state.isPlayerTurn?1:0.4}; transition:all 0.2s;"
                            ${state.isPlayerTurn?'onmouseover="this.style.boxShadow=\'0 0 12px #aa666680\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                            <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">⚔️ 普通攻击</div>
                            <div style="font-size:12px; color:#aaccff;">MP: 0</div>
                        </button>
                        <button onclick="Game.battleRecover()" ${!state.isPlayerTurn ? 'disabled' : ''}
                            title="集中精神恢复20点MP（低于魔法药水的30点）"
                            style="padding:14px 10px; background:linear-gradient(135deg,#33446622,#44557744); border:2px solid #6688bb; border-radius:10px; color:#cce0ff; cursor:${state.isPlayerTurn?'pointer':'not-allowed'}; text-align:center; opacity:${state.isPlayerTurn?1:0.4}; transition:all 0.2s;"
                            ${state.isPlayerTurn?'onmouseover="this.style.boxShadow=\'0 0 12px #6688bb80\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                            <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">🧘 恢复</div>
                            <div style="font-size:12px; color:#66ff99;">+20 MP</div>
                        </button>
                        <button onclick="Game.battleFlee()" ${!state.isPlayerTurn || !state.options?.canFlee ? 'disabled' : ''}
                            title="尝试逃离战斗"
                            style="padding:14px 10px; background:linear-gradient(135deg,#55553322,#66664444); border:2px solid #999966; border-radius:10px; color:#ffffcc; cursor:${state.isPlayerTurn&&state.options?.canFlee?'pointer':'not-allowed'}; text-align:center; opacity:${state.isPlayerTurn&&state.options?.canFlee?1:0.4}; transition:all 0.2s;"
                            ${state.isPlayerTurn&&state.options?.canFlee?'onmouseover="this.style.boxShadow=\'0 0 12px #99996680\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                            <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">🏃 逃跑</div>
                            <div style="font-size:12px; color:#aaa;">脱离战斗</div>
                        </button>
                        <button onclick="Game.battleShowItems()" ${!state.isPlayerTurn || !state.options?.canUseItems ? 'disabled' : ''}
                            title="使用道具"
                            style="padding:14px 10px; background:linear-gradient(135deg,#33554422,#44665544); border:2px solid #559977; border-radius:10px; color:#ccffdd; cursor:${state.isPlayerTurn&&state.options?.canUseItems?'pointer':'not-allowed'}; text-align:center; opacity:${state.isPlayerTurn&&state.options?.canUseItems?1:0.4}; transition:all 0.2s;"
                            ${state.isPlayerTurn&&state.options?.canUseItems?'onmouseover="this.style.boxShadow=\'0 0 12px #55997780\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                            <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">🎒 道具</div>
                            <div style="font-size:12px; color:#aaa;">使用物品</div>
                        </button>
                        ${(BattleSystem.lastSkillId && SkillSystem.getSkill(BattleSystem.lastSkillId)) ? (() => {
                            const lastSkill = SkillSystem.getSkill(BattleSystem.lastSkillId);
                            const canRepeat = state.isPlayerTurn && Player.mp >= lastSkill.mpCost;
                            return `<button onclick="Game.battleRepeatSkill()" ${!canRepeat ? 'disabled' : ''}
                                title="重复上次技能：${lastSkill.name}（消耗${lastSkill.mpCost}MP）"
                                style="padding:14px 10px; background:linear-gradient(135deg,#33555522,#44666644); border:2px solid #559999; border-radius:10px; color:#ccffee; cursor:${canRepeat?'pointer':'not-allowed'}; text-align:center; opacity:${canRepeat?1:0.4}; transition:all 0.2s;"
                                ${canRepeat?'onmouseover="this.style.boxShadow=\'0 0 12px #55999980\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                                <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">🔄 ${lastSkill.name}</div>
                                <div style="font-size:12px; color:${Player.mp>=lastSkill.mpCost?'#aaccff':'#ff6666'};">MP: ${lastSkill.mpCost}</div>
                            </button>`;
                        })() : ''}
                    </div>
                    
                    ${this._expandedBattleElement ? (() => {
                        // v0.94.0: 展开状态 - 显示该系技能列表（内联展开式）
                        const element = this._expandedBattleElement;
                        const info = this.getElementInfo(element);
                        const skills = (state.player.skills || []).filter(skillId => {
                            if (skillId === 'basic_attack') return false;
                            const skill = SkillSystem.getSkill(skillId);
                            return skill && skill.element === element;
                        });
                        const tierOrder = { '初阶': 1, '中阶': 2, '高阶': 3, '超阶': 4 };
                        skills.sort((a, b) => {
                            const sa = SkillSystem.getSkill(a);
                            const sb = SkillSystem.getSkill(b);
                            return (tierOrder[sa.tier] || 9) - (tierOrder[sb.tier] || 9);
                        });
                        return `
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <button onclick="UI.closeBattleElementSkills()" style="background:#333; border:1px solid #666; color:#ccc; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:14px;">← 返回</button>
                                <span style="color:${info.color}; font-size:18px; font-weight:bold;">${info.icon} ${info.name}魔法</span>
                                <span style="width:60px;"></span>
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(${isPortrait ? 1 : 2}, 1fr); gap:8px;">
                                ${skills.map(skillId => {
                                    const skill = SkillSystem.getSkill(skillId);
                                    const canUse = state.isPlayerTurn && state.player.mp >= skill.mpCost;
                                    const cooldown = (BattleSystem.skillCooldowns && BattleSystem.skillCooldowns[skillId]) || 0;
                                    const isCd = cooldown > 0;
                                    // v2.9.0: 计算实际打断概率（考虑境界减免）
                                    let actualInterrupt = null;
                                    let interruptTitle = '';
                                    if (skill.interruptChance && skill.tier) {
                                        const playerLevel = state.player.level || 1;
                                        const playerTier = playerLevel >= 56 ? '超阶' : playerLevel >= 31 ? '高阶' : playerLevel >= 11 ? '中阶' : '初阶';
                                        const reductionMap = {
                                            "初阶": { "初阶": 0, "中阶": null, "高阶": null },
                                            "中阶": { "初阶": 0.15, "中阶": 0, "高阶": null },
                                            "高阶": { "初阶": 0.30, "中阶": 0.15, "高阶": 0 },
                                            "超阶": { "初阶": 0.45, "中阶": 0.30, "高阶": 0.15 }
                                        };
                                        const reduction = reductionMap[playerTier]?.[skill.tier];
                                        if (reduction !== null && reduction !== undefined) {
                                            actualInterrupt = Math.max(0, skill.interruptChance - reduction);
                                            interruptTitle = `基础打断${(skill.interruptChance*100).toFixed(0)}%，境界减免${(reduction*100).toFixed(0)}%，实际打断${(actualInterrupt*100).toFixed(0)}%`;
                                        }
                                    }
                                    const interruptColor = actualInterrupt !== null ? (actualInterrupt >= 0.4 ? '#ff4444' : actualInterrupt >= 0.2 ? '#ffaa44' : '#88ff88') : '';
                                    return `
                                        <div style="position:relative;">
                                            <button onclick="Game.battleUseSkillAndClose('${skillId}')" ${(!canUse || isCd) ? 'disabled' : ''}
                                                title="${skill.description}${interruptTitle ? ' | ' + interruptTitle : ''}"
                                                style="
                                                    padding:10px;
                                                    background:linear-gradient(135deg, ${info.color}22, ${info.color}44);
                                                    border:2px solid ${info.color};
                                                    border-radius:10px;
                                                    color:#fff;
                                                    cursor:${(canUse && !isCd) ? 'pointer' : 'not-allowed'};
                                                    text-align:left;
                                                    opacity:${(canUse && !isCd) ? 1 : 0.4};
                                                    transition:all 0.2s;
                                                    width:100%;
                                                ">
                                                <div style="font-size:14px; font-weight:bold; margin-bottom:3px; padding-right:20px;">${info.icon} ${skill.name}</div>
                                                <div style="font-size:11px; color:#ccc; margin-bottom:3px;">${skill.description.substring(0, 25)}${skill.description.length > 25 ? '...' : ''}</div>
                                                <div style="font-size:11px; display:flex; justify-content:space-between; align-items:center;">
                                                    <span style="color:${state.player.mp >= skill.mpCost ? '#aaccff' : '#ff6666'};">MP: ${skill.mpCost}</span>
                                                    <span style="color:#ffcc66;">${skill.tier || ''}</span>
                                                    ${actualInterrupt !== null ? `<span style="color:${interruptColor};font-size:10px;" title="${interruptTitle}">打断${(actualInterrupt*100).toFixed(0)}%</span>` : ''}
                                                    ${isCd ? `<span style="color:#ff8866;">CD:${cooldown}</span>` : ''}
                                                </div>
                                            </button>
                                            <span onclick="event.stopPropagation();UI.showSkillDetail('${skillId}')" 
                                                style="position:absolute;top:6px;right:8px;cursor:pointer;color:${info.color};font-size:14px;opacity:0.7;transition:opacity 0.2s;"
                                                onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"
                                                title="查看技能详情">ℹ️</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `;
                    })() : `
                    <div style="color: #ffd700; font-size: 18px; margin-bottom: 10px; font-weight: bold;">✨ 魔法技能（选择系别）</div>
                    <div style="display: grid; grid-template-columns: repeat(${isPortrait ? 3 : 5}, 1fr); gap: 8px;">
                        ${(() => {
                            // 按元素分组
                            const elementGroups = {};
                            (state.player.skills || []).forEach(skillId => {
                                if (skillId === 'basic_attack') return;
                                const skill = SkillSystem.getSkill(skillId);
                                if (!skill) return;
                                if (!elementGroups[skill.element]) elementGroups[skill.element] = [];
                                elementGroups[skill.element].push(skillId);
                            });
                            return Object.keys(elementGroups).map(element => {
                                const info = this.getElementInfo(element);
                                const skills = elementGroups[element];
                                const hasUsable = skills.some(id => {
                                    const s = SkillSystem.getSkill(id);
                                    return state.player.mp >= s.mpCost;
                                });
                                return `
                                    <button onclick="UI.toggleBattleElement('${element}')"
                                        class="${this._expandedBattleElement === element ? 'battle-element-active' : ''}"
                                        title="${info.name}：${info.desc}（${skills.length}个技能）"
                                        style="
                                            padding: 10px 6px;
                                            background: linear-gradient(135deg, ${info.color}22, ${info.color}44);
                                            border: 2px solid ${info.color};
                                            border-radius: 10px;
                                            color: #fff;
                                            cursor: pointer;
                                            text-align: center;
                                            transition: all 0.2s;
                                        "
                                        onmouseover="this.style.boxShadow='0 0 12px ${info.color}80'; this.style.transform='scale(1.05)';"
                                        onmouseout="this.style.boxShadow='none'; this.style.transform='scale(1)';">
                                        <div style="font-size:20px; margin-bottom:2px;">${info.icon}</div>
                                        <div style="font-size:12px; font-weight:bold; color:${info.color};">${info.name}</div>
                                        <div style="font-size:10px; color:#aaa; margin-top:2px;">${skills.length}技能</div>
                                        <div style="font-size:9px; color:${hasUsable ? '#88ff88' : '#ff8888'}; margin-top:2px;">${hasUsable ? '可释放' : 'MP不足'}</div>
                                    </button>
                                `;
                            }).join('');
                        })()}
                    </div>
                    `}
                    
                    ${state.magicTools && state.magicTools.available && state.magicTools.available.length > 0 ? `
                        <div style="color: #ff8844; font-size: 18px; margin-bottom: 10px; margin-top: 15px; font-weight: bold;">🔮 魔具技能</div>
                        <div style="display: grid; grid-template-columns: repeat(${Math.min(state.magicTools.available.length, 4)}, 1fr); gap: 10px;">
                            ${state.magicTools.available.map(skill => {
                                const cooldown = state.magicTools.cooldowns[skill.id] || 0;
                                const canUse = state.isPlayerTurn && cooldown === 0;
                                return `
                                    <button onclick="Game.battleUseMagicTool('${skill.id}')" ${!canUse ? 'disabled' : ''}
                                            title="${skill.description}"
                                            style="
                                        padding: 12px;
                                        background: linear-gradient(135deg, #443322, #665544);
                                        border: 2px solid #aa8866;
                                        border-radius: 8px;
                                        color: #ffddaa;
                                        cursor: ${canUse ? 'pointer' : 'not-allowed'};
                                        text-align: center;
                                        opacity: ${canUse ? 1 : 0.4};
                                        transition: all 0.2s;
                                    " ${canUse ? 'onmouseover="this.style.boxShadow=\'0 0 15px #aa886680\'" onmouseout="this.style.boxShadow=\'none\'"' : ''}>
                                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${skill.icon} ${skill.name.split('·')[1] || skill.name}</div>
                                        <div style="font-size: 12px; color: #ccaa88;">${cooldown > 0 ? '冷却: ' + cooldown + '回合' : '可使用'}</div>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}

                    ${(() => {
                        // v2.2.0: 天赋资源显示和主动技能
                        // v2.4.0: 修复talents是对象格式，转为数组
                        const playerTalents = state.player.talents ? Object.values(state.player.talents) : [];
                        const activeTalents = playerTalents.filter(t => {
                            const td = typeof DataTalents !== 'undefined' ? DataTalents[t.talentId] : null;
                            return td && td.mechanism;
                        });
                        if (activeTalents.length === 0) return '';

                        let html = '<div style="color: #ffaa44; font-size: 18px; margin-bottom: 10px; margin-top: 15px; font-weight: bold;">✨ 天赋能力</div>';

                        // 天赋资源条
                        if (typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
                            const ts = TalentCombatSystem.getStateForUI();
                            const resourceLabels = {
                                fire: { name: '燃点', icon: '🔥', color: '#ff6644', max: 10 },
                                thunder: { name: '电荷', icon: '⚡', color: '#ffee44', max: 6 },
                                earth: { name: '岩力', icon: '🪨', color: '#bb8844', max: 10 },
                                summon: { name: '契约', icon: '🐺', color: '#ffaa66', max: 5 }
                            };
                            for (const [key, label] of Object.entries(resourceLabels)) {
                                if (ts.resources[key] > 0 || activeTalents.some(t => DataTalents[t.talentId]?.resourceType === key)) {
                                    const val = ts.resources[key];
                                    const max = label.max;
                                    const pct = Math.min(100, (val / max) * 100);
                                    html += `
                                        <div style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                                            <span style="font-size: 16px; width: 24px;">${label.icon}</span>
                                            <span style="color: ${label.color}; font-size: 12px; width: 40px;">${label.name}</span>
                                            <div style="flex: 1; height: 12px; background: #222; border-radius: 6px; overflow: hidden; border: 1px solid ${label.color}44;">
                                                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, ${label.color}88, ${label.color}); transition: width 0.3s;"></div>
                                            </div>
                                            <span style="color: #fff; font-size: 11px; width: 35px; text-align: right;">${val}/${max}</span>
                                        </div>
                                    `;
                                }
                            }
                            // 形态显示
                            if (ts.forms.water === 'tide' || ts.forms.water === 'ebb') {
                                const isTide = ts.forms.water === 'tide';
                                html += `<div style="margin-bottom: 6px; color: #4488ff; font-size: 12px;">💧 潮汐形态：${isTide ? '涨潮（输出+30%）' : '退潮（治疗+30%）'}</div>`;
                            }
                            if (ts.forms.light === 'holy' || ts.forms.light === 'shield') {
                                const isHoly = ts.forms.light === 'holy';
                                html += `<div style="margin-bottom: 6px; color: #ffffaa; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                                    <span>✨ 光系形态：${isHoly ? '圣光（输出+20%）' : '圣盾（防御+30%）'}</span>
                                    <button onclick="Battle.toggleLightForm()" style="padding: 2px 6px; background: #ffffaa33; border: 1px solid #ffffaa; border-radius: 3px; color: #ffffaa; font-size: 10px; cursor: pointer;">切换</button>
                                </div>`;
                            }
                            // 触发状态显示
                            if (ts.triggers.windStreak) {
                                html += `<div style="margin-bottom: 6px; color: #88ffaa; font-size: 12px;">💨 疾风状态（下次攻击连击，剩余${ts.triggers.windStreakTurns}回合）</div>`;
                            }
                        }

                        // 天赋主动技能按钮（v2.4.0: 只显示主修系的主动技能）
                        const activeSkillTalents = activeTalents.filter(t => {
                            const td = DataTalents[t.talentId];
                            // 只显示主修系的主动技能
                            const isPrimary = state.player.primaryElement && td.element === state.player.primaryElement;
                            return td.activeSkill && t.level >= 5 && isPrimary;
                        });
                        if (activeSkillTalents.length > 0) {
                            html += '<div style="display: grid; grid-template-columns: repeat(' + Math.min(activeSkillTalents.length, 3) + ', 1fr); gap: 8px; margin-top: 8px;">';
                            activeSkillTalents.forEach(t => {
                                const td = DataTalents[t.talentId];
                                const sk = td.activeSkill;
                                const cd = typeof TalentCombatSystem !== 'undefined' ? TalentCombatSystem.getSkillCooldown(sk.id) : 0;
                                const canUse = state.isPlayerTurn && cd === 0;
                                const elemInfo = UI.getElementInfo(td.element);
                                html += `
                                    <button onclick="Game.battleUseTalentSkill('${t.talentId}')" ${!canUse ? 'disabled' : ''}
                                            title="${sk.description}"
                                            style="
                                        padding: 10px 8px;
                                        background: linear-gradient(135deg, ${elemInfo.color}22, ${elemInfo.color}44);
                                        border: 2px solid ${elemInfo.color};
                                        border-radius: 8px;
                                        color: #fff;
                                        cursor: ${canUse ? 'pointer' : 'not-allowed'};
                                        text-align: center;
                                        opacity: ${canUse ? 1 : 0.4};
                                        transition: all 0.2s;
                                    " ${canUse ? 'onmouseover="this.style.boxShadow=\'0 0 12px ' + elemInfo.color + '80\'" onmouseout="this.style.boxShadow=\'none\'"' : ''}>
                                        <div style="font-size: 13px; font-weight: bold; margin-bottom: 3px;">${elemInfo.icon} ${sk.name}</div>
                                        <div style="font-size: 10px; color: #ccc;">${cd > 0 ? '冷却: ' + cd + '回合' : (sk.cost ? '消耗' + sk.cost + '资源' : '可使用')}</div>
                                    </button>
                                `;
                            });
                            html += '</div>';
                        }

                        return html;
                    })()}
                </div>
            </div>
        `;
        
        // 战斗日志自动滚动到底部
        setTimeout(() => {
            const log = document.getElementById('battle-log');
            if (log) {
                log.scrollTop = log.scrollHeight;
            }
        }, 10);
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

    // 更新战斗界面
    updateBattleScreen() {
        // 只有在战斗中才更新战斗界面
        if (!BattleSystem || !BattleSystem.active) return;
        
        // 简单起见，重新渲染整个战斗界面
        const delay = BattleSystem.getDelay ? BattleSystem.getDelay(500) : 500;
        setTimeout(() => {
            this.renderBattleScreen();
        }, delay);
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

    // ========== 成就面板 ==========
    /**
     * 显示成就面板
     */
    showAchievementPanel() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999;
        `;

        const panel = document.createElement('div');
        panel.className = 'mobile-popup';
        panel.style.cssText = `
            background: linear-gradient(135deg, #1a1a3a, #2a2a5a);
            border: 2px solid #6666aa; border-radius: 15px;
            padding: 25px; max-width: 600px; width: 90%;
            max-height: 80vh; overflow-y: auto;
            box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
        `;

        // 获取成就数据
        const achievements = typeof DataAchievements !== 'undefined' ? DataAchievements : {};
        const unlockedAchievements = typeof WorldState !== 'undefined' ? WorldState.achievements : [];
        const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

        // 按分类分组
        const categories = {};
        for (const id in achievements) {
            const ach = achievements[id];
            if (!categories[ach.category]) {
                categories[ach.category] = [];
            }
            categories[ach.category].push(ach);
        }

        // 统计
        const totalCount = Object.keys(achievements).length;
        const unlockedCount = unlockedAchievements.length;
        const totalPoints = unlockedAchievements.reduce((sum, a) => {
            const rarity = ACHIEVEMENT_RARITIES?.[a.rarity] || { points: 0 };
            return sum + (rarity.points || 0);
        }, 0);

        let categoriesHtml = '';
        const categoryConfig = ACHIEVEMENT_CATEGORIES || {};

        for (const catId in categories) {
            const cat = categoryConfig[catId] || { name: catId, icon: '📁' };
            const catAchievements = categories[catId];
            
            let achievementsHtml = '';
            catAchievements.forEach(ach => {
                const isUnlocked = unlockedIds.has(ach.id);
                const rarity = ACHIEVEMENT_RARITIES?.[ach.rarity] || { name: '普通', color: '#999' };
                
                // 隐藏成就：未解锁时不显示详情
                if (ach.isHidden && !isUnlocked) {
                    achievementsHtml += `
                        <div style="
                            padding: 10px 12px; margin-bottom: 6px;
                            background: rgba(30, 30, 60, 0.5);
                            border: 1px solid #444; border-radius: 8px;
                            opacity: 0.5;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 20px;">❓</span>
                                <div style="flex: 1;">
                                    <div style="color: #888; font-weight: bold; font-size: 13px;">???</div>
                                    <div style="color: #666; font-size: 11px; margin-top: 2px;">隐藏成就</div>
                                </div>
                            </div>
                        </div>
                    `;
                    return;
                }

                achievementsHtml += `
                    <div style="
                        padding: 10px 12px; margin-bottom: 6px;
                        background: ${isUnlocked ? 'linear-gradient(135deg, #2a2a5a, #3a3a7a)' : 'rgba(30, 30, 60, 0.5)'};
                        border: 2px solid ${isUnlocked ? rarity.color : '#444'}; border-radius: 8px;
                        opacity: ${isUnlocked ? 1 : 0.6};
                        transition: all 0.2s;
                    " onmouseover="this.style.transform='translateX(3px)'" onmouseout="this.style.transform='translateX(0)'">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">${ach.icon || '🏆'}</span>
                            <div style="flex: 1;">
                                <div style="color: ${isUnlocked ? '#fff' : '#888'}; font-weight: bold; font-size: 14px;">
                                    ${ach.name}
                                    <span style="color: ${rarity.color}; font-size: 11px; margin-left: 8px;">${rarity.name}</span>
                                </div>
                                <div style="color: #aaa; font-size: 12px; margin-top: 2px;">${ach.description}</div>
                            </div>
                            <div style="text-align: right;">
                                ${isUnlocked ? 
                                    `<div style="color: #ffd700; font-size: 12px;">✓ 已解锁</div>` : 
                                    `<div style="color: #666; font-size: 12px;">未解锁</div>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            });

            categoriesHtml += `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #ffd700; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        ${cat.icon} ${cat.name}
                        <span style="color: #888; font-size: 12px; font-weight: normal;">
                            (${catAchievements.filter(a => unlockedIds.has(a.id)).length}/${catAchievements.length})
                        </span>
                    </h3>
                    ${achievementsHtml}
                </div>
            `;
        }

        panel.innerHTML = `
            <h2 style="color: #ffd700; font-size: 24px; margin-bottom: 5px; text-align: center;">🏆 成就</h2>
            <div style="text-align: center; color: #aaa; font-size: 13px; margin-bottom: 20px;">
                已解锁 <span style="color: #ffd700; font-weight: bold;">${unlockedCount}</span> / ${totalCount} 个成就
                <span style="margin: 0 10px;">|</span>
                成就点数 <span style="color: #ffd700; font-weight: bold;">${totalPoints}</span>
            </div>
            ${categoriesHtml}
            <div onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 10px; padding: 12px; text-align: center;
                background: linear-gradient(135deg, #553333, #774444);
                border: 2px solid #885555; border-radius: 8px;
                color: #ffcccc; cursor: pointer; font-size: 15px;
            ">关闭</div>
        `;

        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);
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
    renderEventScreen(event) {
        try {
            console.log('[UI] 渲染事件界面:', event.id, event.name);
            
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
                        opacity: 0.1;
                        filter: blur(3px);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    
                    <div style="
                        max-width: 600px;
                        background: rgba(20, 20, 50, 0.95);
                        border: 2px solid #6666aa;
                        border-radius: 15px;
                        padding: 40px;
                        box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
                        position: relative;
                        z-index: 1;
                    ">
                        <h2 style="color: #ffd700; font-size: 28px; margin-bottom: 20px; text-align: center;">
                            ✨ ${event.name}
                        </h2>
                        
                        <p style="color: #d0d0f0; font-size: 17px; line-height: 1.8; margin-bottom: 30px; text-align: center;">
                            ${event.description}
                        </p>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${event.choices.map((choice, index) => `
                                <div onclick="Game.selectEventChoice(${index})" style="
                                    padding: 15px 25px;
                                    background: linear-gradient(135deg, #2a2a5a, #3a3a7a);
                                    border: 2px solid #555599;
                                    border-radius: 10px;
                                    color: #e0e0ff;
                                    cursor: pointer;
                                    font-size: 16px;
                                    text-align: left;
                                    transition: all 0.3s;
                                " onmouseover="this.style.borderColor='#7777bb'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#555599'; this.style.transform='translateX(0)'">
                                    ▶ ${choice.text}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            console.log('[UI] 事件界面渲染完成');
        } catch (e) {
            console.error('[UI] 渲染事件界面出错:', e);
            console.error('[UI] 错误堆栈:', e.stack);
            this.elements.gameContainer.innerHTML = `
                <div style="padding: 40px; color: #ff6666;">
                    <h2>事件渲染出错</h2>
                    <p>${e.message}</p>
                    <button onclick="Game.closeEvent()" style="margin-top: 20px; padding: 10px 20px;">返回</button>
                </div>
            `;
        }
    },

    // 渲染大事件结局界面
    renderBigEventEnding(event, ending) {
        try {
            console.log('[UI] 渲染大事件结局:', ending.name);
            
            // 计算奖励文本
            let rewardText = '';
            if (ending.effects) {
                if (ending.effects.exp) rewardText += `获得 ${ending.effects.exp} 经验\n`;
                if (ending.effects.gold) rewardText += `获得 ${ending.effects.gold} 金币\n`;
                if (ending.effects.items && ending.effects.items.length > 0) {
                    rewardText += '获得物品：\n';
                    ending.effects.items.forEach(item => {
                        const itemData = DataManager.getItem(item.itemId);
                        rewardText += `  ${itemData?.name || item.itemId} ×${item.count || 1}\n`;
                    });
                }
                if (ending.effects.reputation) {
                    rewardText += '声望变化：\n';
                    for (const [faction, value] of Object.entries(ending.effects.reputation)) {
                        const factionData = DataManager.getFaction(faction);
                        const factionName = factionData?.name || faction;
                        rewardText += `  ${factionName} ${value > 0 ? '+' : ''}${value}\n`;
                    }
                }
            }
            
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
                    <!-- 背景特效 -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
                        z-index: 0;
                        pointer-events: none;
                    "></div>
                    
                    <div style="
                        background: rgba(20, 20, 50, 0.95);
                        border: 3px solid #ffd700;
                        border-radius: 20px;
                        padding: 40px;
                        max-width: 600px;
                        width: 90%;
                        max-height: 80vh;
                        overflow-y: auto;
                        z-index: 10;
                        box-shadow: 0 0 80px rgba(255, 215, 0, 0.3);
                        text-align: center;
                    ">
                        <div style="font-size: 60px; margin-bottom: 20px;">🏆</div>
                        
                        <h2 style="
                            color: #ffd700;
                            font-size: 28px;
                            margin-bottom: 10px;
                            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                        ">${event.name}</h2>
                        
                        <h3 style="
                            color: #ffcc66;
                            font-size: 20px;
                            margin-bottom: 25px;
                        ">结局：${ending.name}</h3>
                        
                        <div style="
                            color: #ddd;
                            font-size: 15px;
                            line-height: 1.8;
                            margin-bottom: 25px;
                            text-align: left;
                            white-space: pre-wrap;
                        ">${ending.description}</div>
                        
                        ${rewardText ? `
                            <div style="
                                background: rgba(0, 0, 0, 0.3);
                                border: 1px solid #6666aa;
                                border-radius: 10px;
                                padding: 15px;
                                margin-bottom: 25px;
                                text-align: left;
                            ">
                                <div style="color: #ffd700; font-size: 14px; margin-bottom: 10px; font-weight: bold;">🎁 获得奖励</div>
                                <div style="color: #aaffaa; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${rewardText}</div>
                            </div>
                        ` : ''}
                        
                        <div onclick="Game.closeBigEventEnding()" style="
                            padding: 15px 40px;
                            background: linear-gradient(135deg, #6666aa, #8888cc);
                            border: 2px solid #9999dd;
                            border-radius: 10px;
                            color: #fff;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                            display: inline-block;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='linear-gradient(135deg, #7777bb, #9999dd)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='linear-gradient(135deg, #6666aa, #8888cc)'; this.style.transform='scale(1)'">
                            继续游戏
                        </div>
                    </div>
                </div>
            `;
            
        } catch (e) {
            console.error('[UI] 渲染大事件结局失败:', e);
        }
    },

    // 渲染大事件剧情阶段界面
    // v1.0.1: 添加autoMode参数，auto阶段不显示继续按钮
    renderBigEventNarrativePhase(phase, hasNextPhase, autoMode = false) {
        try {
            console.log('[UI] 渲染大事件剧情阶段:', phase.name);
            
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
                    
                    <div style="
                        background: rgba(20, 20, 50, 0.9);
                        border: 2px solid #6666aa;
                        border-radius: 15px;
                        padding: 30px;
                        max-width: 600px;
                        width: 90%;
                        max-height: 80vh;
                        overflow-y: auto;
                        z-index: 10;
                        box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
                    ">
                        <h2 style="
                            color: #ffd700;
                            font-size: 24px;
                            margin-bottom: 20px;
                            text-align: center;
                            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                        ">📖 ${phase.name}</h2>
                        
                        <div style="
                            color: #ddd;
                            font-size: 15px;
                            line-height: 1.8;
                            margin-bottom: 25px;
                            white-space: pre-wrap;
                        ">${phase.description}</div>
                        
                        <div style="text-align: center;">
                            ${autoMode ? `
                                <div style="color: #ffd700; font-size: 16px; animation: pulse 1.5s infinite;">✨ 命运正在揭晓...</div>
                            ` : `
                                <div onclick="BigEventSystem.advanceToNextPhase()" style="
                                    padding: 12px 40px;
                                    background: linear-gradient(135deg, #6666aa, #8888cc);
                                    border: 2px solid #9999dd;
                                    border-radius: 10px;
                                    color: #fff;
                                    cursor: pointer;
                                    font-size: 16px;
                                    font-weight: bold;
                                    display: inline-block;
                                    transition: all 0.3s;
                                " onmouseover="this.style.background='linear-gradient(135deg, #7777bb, #9999dd)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='linear-gradient(135deg, #6666aa, #8888cc)'; this.style.transform='scale(1)'">
                                    ${hasNextPhase ? '继续 →' : '结束'}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (e) {
            console.error('[UI] 渲染大事件剧情阶段失败:', e);
        }
    },

    // 渲染大事件选择阶段界面
    renderBigEventChoicePhase(phase, choices) {
        try {
            console.log('[UI] 渲染大事件选择阶段:', phase.name);
            
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
                    
                    <div style="
                        background: rgba(20, 20, 50, 0.9);
                        border: 2px solid #6666aa;
                        border-radius: 15px;
                        padding: 30px;
                        max-width: 600px;
                        width: 90%;
                        max-height: 80vh;
                        overflow-y: auto;
                        z-index: 10;
                        box-shadow: 0 0 50px rgba(100, 100, 255, 0.3);
                    ">
                        <h2 style="
                            color: #ffd700;
                            font-size: 24px;
                            margin-bottom: 20px;
                            text-align: center;
                            text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                        ">⚔️ ${phase.name}</h2>
                        
                        <div style="
                            color: #ddd;
                            font-size: 15px;
                            line-height: 1.8;
                            margin-bottom: 25px;
                            white-space: pre-wrap;
                        ">${phase.description}</div>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${choices.map((choice, index) => `
                                <div onclick="BigEventSystem.selectChoice(${index})" style="
                                    padding: 15px 20px;
                                    background: linear-gradient(135deg, #2a2a5a, #3a3a7a);
                                    border: 2px solid #555599;
                                    border-radius: 10px;
                                    color: #fff;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                    font-size: 15px;
                                    line-height: 1.5;
                                " onmouseover="this.style.borderColor='#7777bb'; this.style.background='linear-gradient(135deg, #3a3a7a, #4a4a9a)'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#555599'; this.style.background='linear-gradient(135deg, #2a2a5a, #3a3a7a)'; this.style.transform='translateX(0)'">
                                    <span style="color: #ffd700; margin-right: 8px;">▶</span>
                                    ${choice.text}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
        } catch (e) {
            console.error('[UI] 渲染大事件选择阶段失败:', e);
        }
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

    // ========== 商店界面 ==========
    renderShopScreen() {
        const shop = ShopSystem.currentShop;
        const items = ShopSystem.getShopItems();
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #2a2a3a, #3a3a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/backgrounds/bo_city_view.jpg') center/cover;
                    opacity: 0.08;
                    filter: blur(2px);
                    z-index: -1;
                    pointer-events: none;
                "></div>
                
                <!-- 顶部 -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #665544;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">🏪 ${shop?.name || '商店'}
                        ${ShopSystem.getDiscount() < 1.0 ? `<span style="font-size: 14px; color: #88ff88; margin-left: 10px;">（${WorldState.getReputationLevel(shop.factionId).name} ${Math.round(ShopSystem.getDiscount() * 100)}折）</span>` : ''}
                    </h2>
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <span style="color: #ffd700; font-size: 18px;">💰 ${Player.gold} 金币</span>
                        <div onclick="Game.closeShop()" style="
                            padding: 10px 20px;
                            background: #553333;
                            border: 1px solid #775555;
                            border-radius: 8px;
                            color: #ffcccc;
                            cursor: pointer;
                            font-size: 15px;
                            display: inline-block;
                        ">离开商店</div>
                    </div>
                </div>
                
                <!-- 商品列表 -->
                <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                    <h3 style="color: #ffd700; margin-bottom: 20px;">📦 商品列表</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                        ${items.map(item => {
                            const itemData = item.itemData;
                            if (!itemData) return '';
                            const ownedCount = Inventory.getTotalOwned(item.itemId);
                            return `
                                <div onclick="Game.buyItem('${item.itemId}')" style="
                                    padding: 15px;
                                    background: rgba(40, 40, 60, 0.8);
                                    border: 2px solid #555577;
                                    border-radius: 10px;
                                    cursor: ${item.canAfford ? 'pointer' : 'not-allowed'};
                                ">
                                    <div style="font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 5px;">
                                        ${itemData.icon || '📦'} ${itemData.name}
                                        <span style="float: right; font-size: 13px; color: #88ccff;">已拥有 ${ownedCount}</span>
                                    </div>
                                    <div style="font-size: 13px; color: #999; margin-bottom: 10px; min-height: 40px;">
                                        ${itemData.description}
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: #ffd700; font-size: 16px;">
                                            💰 ${item.actualPrice}
                                            ${item.hasDiscount ? `<span style="text-decoration: line-through; color: #888; font-size: 12px; margin-left: 5px;">${item.originalPrice}</span>` : ''}
                                        </span>
                                        <div onclick="${item.canAfford ? `event.stopPropagation(); Game.buyItem('${item.itemId}')` : ''}" 
                                                style="
                                            padding: 6px 15px;
                                            background: ${item.canAfford ? 'linear-gradient(135deg, #335533, #447744)' : '#444'};
                                            border: 1px solid ${item.canAfford ? '#559955' : '#555'};
                                            border-radius: 6px;
                                            color: ${item.canAfford ? '#ccffcc' : '#888'};
                                            cursor: ${item.canAfford ? 'pointer' : 'not-allowed'};
                                            font-size: 14px;
                                            display: inline-block;
                                        ">购买</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- 出售区域 -->
                    <h3 style="color: #ffd700; margin: 40px 0 20px;">💰 出售物品</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${Inventory.getAllItems().map(item => {
                            const itemData = item.data;
                            if (!itemData || itemData.type === 'quest') return '';
                            const sellPrice = Math.floor(itemData.price * 0.5);
                            return `
                                <div style="
                                    padding: 10px 15px;
                                    background: rgba(60, 50, 40, 0.8);
                                    border: 1px solid #776655;
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    gap: 10px;
                                ">
                                    <span>${itemData.icon || '📦'} ${itemData.name} x${item.count}</span>
                                    <span style="color: #ffd700;">💰 ${sellPrice}</span>
                                    <div onclick="Game.sellItem('${item.itemId}')" style="
                                        padding: 4px 10px;
                                        background: #554433;
                                        border: 1px solid #776655;
                                        border-radius: 5px;
                                        color: #ffddaa;
                                        cursor: pointer;
                                        font-size: 12px;
                                        display: inline-block;
                                    ">出售</div>
                                </div>
                            `;
                        }).join('') || '<p style="color: #888;">背包里没有可出售的物品</p>'}
                    </div>
                </div>
            </div>
        `;
    },

    updateShopScreen() {
        this.renderShopScreen();
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

    // ========== 日常系统 ==========
    renderDaily() {
        const signInData = DailySystem.getSignInData();
        const dailyQuests = DailySystem.getDailyQuests();
        const rewards = DailySystem._signInRewards;

        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a1a2e, #16213e); position: relative;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.6);
                    border-bottom: 2px solid #444477;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #66aaff; font-size: 26px;">📋 日常</h2>
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <span style="color: #aaa; font-size: 14px;">第 ${Player.day} 天</span>
                        <div onclick="Game.closeDaily()" style="
                            padding: 10px 20px;
                            background: #333355;
                            border: 1px solid #555577;
                            border-radius: 8px;
                            color: #ccccff;
                            cursor: pointer;
                            font-size: 15px;
                            display: inline-block;
                        ">关闭</div>
                    </div>
                </div>

                <div style="flex: 1; padding: 25px; overflow-y: auto; position: relative; z-index: 1;">
                    <div style="max-width: 800px; margin: 0 auto;">

                        <!-- 说明栏 -->
                        <div style="
                            background: rgba(60, 60, 100, 0.4);
                            border: 1px solid #555588;
                            border-radius: 8px;
                            padding: 12px 18px;
                            margin-bottom: 20px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        ">
                            <span style="font-size: 18px;">💡</span>
                            <span style="color: #aabbdd; font-size: 13px;">
                                日常系统基于<strong style="color: #ffcc44;">游戏内时间</strong>，每天（第N天）0点自动刷新签到和任务。当前为游戏内第 <strong style="color: #ffcc44;">${Player.day}</strong> 天。
                            </span>
                        </div>

                        <!-- 每日签到 -->
                        <div style="
                            background: rgba(40, 40, 80, 0.6);
                            border: 1px solid #555599;
                            border-radius: 12px;
                            padding: 20px;
                            margin-bottom: 25px;
                        ">
                            <h3 style="color: #ffcc44; margin: 0 0 15px 0; font-size: 20px;">
                                🎁 每日签到
                                <span style="font-size: 14px; color: #999; font-weight: normal; margin-left: 15px;">
                                    连续签到 ${signInData.consecutiveDays} 天 | 累计 ${signInData.totalSignInDays} 天
                                </span>
                            </h3>

                            <!-- 7天奖励预览 -->
                            <div style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
                                ${rewards.map((r, i) => {
                                    const dayNum = i + 1;
                                    const isToday = !signInData.hasSignedIn && (signInData.consecutiveDays % 7) === i;
                                    const isPast = signInData.hasSignedIn && (signInData.consecutiveDays % 7) === i;
                                    const bgColor = isToday ? 'rgba(255, 200, 50, 0.3)' : isPast ? 'rgba(100, 200, 100, 0.2)' : 'rgba(60, 60, 100, 0.5)';
                                    const borderColor = isToday ? '#ffcc44' : isPast ? '#66cc66' : '#555588';
                                    const itemName = r.items.length > 0 ? DataManager.getItem(r.items[0].itemId)?.name || r.items[0].itemId : '';
                                    return `
                                        <div style="
                                            flex: 1;
                                            min-width: 80px;
                                            background: ${bgColor};
                                            border: 2px solid ${borderColor};
                                            border-radius: 8px;
                                            padding: 10px;
                                            text-align: center;
                                        ">
                                            <div style="color: #aaa; font-size: 12px;">第${dayNum}天</div>
                                            <div style="font-size: 20px; margin: 5px 0;">${r.gold > 0 ? '💰' : '🎁'}</div>
                                            <div style="color: #ffcc44; font-size: 13px; font-weight: bold;">${r.gold > 0 ? r.gold + '金' : itemName}</div>
                                            ${isPast ? '<div style="color: #66cc66; font-size: 11px; margin-top: 3px;">✓</div>' : ''}
                                            ${isToday ? '<div style="color: #ffcc44; font-size: 11px; margin-top: 3px;">今天</div>' : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            ${signInData.hasSignedIn ? `
                                <div style="
                                    background: rgba(100, 150, 100, 0.2);
                                    border: 1px solid #557755;
                                    border-radius: 8px;
                                    padding: 12px;
                                    text-align: center;
                                    color: #88cc88;
                                    font-size: 15px;
                                ">✓ 今日已签到，明天再来吧！</div>
                            ` : `
                                <div onclick="Game.doSignIn()" style="
                                    background: linear-gradient(135deg, #cc8800, #ffaa00);
                                    border: none;
                                    border-radius: 8px;
                                    padding: 14px;
                                    text-align: center;
                                    color: white;
                                    font-size: 16px;
                                    font-weight: bold;
                                    cursor: pointer;
                                ">立即签到</div>
                            `}
                        </div>

                        <!-- 每日任务 -->
                        <div style="
                            background: rgba(40, 40, 80, 0.6);
                            border: 1px solid #555599;
                            border-radius: 12px;
                            padding: 20px;
                        ">
                            <h3 style="color: #66aaff; margin: 0 0 15px 0; font-size: 20px;">
                                📝 每日任务
                                <span style="font-size: 14px; color: #999; font-weight: normal; margin-left: 15px;">
                                    每天刷新3个任务
                                </span>
                            </h3>

                            ${dailyQuests.length === 0 ? `
                                <div style="color: #888; text-align: center; padding: 30px;">暂无日常任务</div>
                            ` : dailyQuests.map(quest => {
                                const progress = quest.progress || 0;
                                const target = quest.target;
                                const percent = Math.min(100, (progress / target) * 100);
                                const canClaim = quest.completed && !quest.claimed;

                                let statusHtml = '';
                                if (quest.claimed) {
                                    statusHtml = `<span style="color: #666; font-size: 13px;">已领取</span>`;
                                } else if (canClaim) {
                                    statusHtml = `<div onclick="Game.claimDailyReward('${quest.id}')" style="
                                        background: linear-gradient(135deg, #44aa44, #66cc66);
                                        border: none;
                                        border-radius: 6px;
                                        padding: 8px 16px;
                                        color: white;
                                        font-size: 13px;
                                        font-weight: bold;
                                        cursor: pointer;
                                        display: inline-block;
                                    ">领取奖励</div>`;
                                } else {
                                    statusHtml = `<span style="color: #888; font-size: 13px;">${progress}/${target}</span>`;
                                }

                                return `
                                    <div style="
                                        background: rgba(30, 30, 60, 0.8);
                                        border: 1px solid ${canClaim ? '#66aa66' : '#444466'};
                                        border-radius: 8px;
                                        padding: 15px;
                                        margin-bottom: 12px;
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <div>
                                                <span style="color: #ddd; font-size: 16px; font-weight: bold;">${quest.name}</span>
                                                <span style="color: #999; font-size: 13px; margin-left: 10px;">${quest.description}</span>
                                            </div>
                                            ${statusHtml}
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="flex: 1; height: 8px; background: #222; border-radius: 4px; overflow: hidden;">
                                                <div style="height: 100%; width: ${percent}%; background: ${quest.completed ? 'linear-gradient(90deg, #44aa44, #66cc66)' : 'linear-gradient(90deg, #4466aa, #6688cc)'}; transition: width 0.3s;"></div>
                                            </div>
                                            <span style="color: #ffcc44; font-size: 12px;">
                                                奖励: ${quest.rewards.exp ? quest.rewards.exp + '经验' : ''} ${quest.rewards.gold ? quest.rewards.gold + '金' : ''}
                                            </span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                    </div>
                </div>
            </div>
        `;
    },

    // ========== 角色属性界面 ==========
    renderCharacterScreen() {
        const stats = Player.getTotalStats();
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a2a, #2a3a3a);">
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #447766;
                ">
                    <h2 style="color: #ffd700; font-size: 26px;">👤 角色属性</h2>
                    <div onclick="Game.closeCharacterPanel()" style="
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
                
                <div style="flex: 1; padding: 40px; overflow-y: auto;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        
                        <!-- 基础信息 -->
                        <div style="
                            padding: 25px;
                            background: rgba(30, 50, 50, 0.8);
                            border: 2px solid #447766;
                            border-radius: 15px;
                            margin-bottom: 25px;
                        ">
                            <div style="font-size: 28px; font-weight: bold; color: #fff; margin-bottom: 10px;">
                                ${Player.name}
                            </div>
                            <div style="font-size: 18px; color: #66ff99; margin-bottom: 15px;">
                                等级 ${Player.level}
                                ${typeof RealmSystem !== 'undefined' ? `
                                    <span style="font-size: 14px; color: #ffd700; margin-left: 15px;">
                                        ${RealmSystem.getRealm(Player.realm || 'initial').name}魔法师
                                    </span>
                                ` : ''}
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                                ${Player.elements.map(elem => {
                                    const elLv = Player.getElementLevel(elem);
                                    const elRealm = elLv >= 56 ? '超' : elLv >= 31 ? '高' : elLv >= 11 ? '中' : '初';
                                    return `<span style="
                                        padding: 6px 15px;
                                        background: ${SkillSystem.getElementColor(elem)}22;
                                        border: 1px solid ${SkillSystem.getElementColor(elem)};
                                        border-radius: 15px;
                                        font-size: 14px;
                                        color: ${SkillSystem.getElementColor(elem)};
                                    ">${SkillSystem.getElementName(elem)} Lv.${elLv}(${elRealm})</span>`;
                                }).join('')}
                            </div>
                            ${Player.mentor ? `
                                <div style="padding: 10px 15px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; margin-bottom: 15px; display: inline-block;">
                                    <span style="color: #ffd700; font-size: 14px;">📚 导师：唐月（Lv.${Player.mentor.level || 1}）</span>
                                    <span style="color: #aaa; font-size: 12px; margin-left: 10px;">修炼经验+${10 + (Player.mentor.level - 1) * 5}%</span>
                                </div>
                            ` : ''}
                            ${(() => {
                                const tier = Player.getInfluenceTier ? Player.getInfluenceTier() : { level: 0, name: '无名小卒', color: '#999' };
                                const perks = [];
                                if (tier.level >= 1) perks.push('修炼+5%');
                                if (tier.level >= 2) perks.push('NPC指导+5%');
                                if (tier.level >= 3) perks.push('任务经验+10%');
                                if (tier.level >= 4) perks.push('全属性+5%');
                                return `
                                <div style="
                                    padding: 10px 15px;
                                    background: linear-gradient(135deg, #ffdd6622, #ffaa3322);
                                    border: 1px solid #ffcc44;
                                    border-radius: 10px;
                                    margin-bottom: 15px;
                                ">
                                    <div><span style="color: ${tier.color}; font-size: 14px; font-weight: bold;">🌟 ${tier.name}：${Player.influence || 0}</span>
                                    ${(Player.changedStoryNodes && Player.changedStoryNodes.length > 0) ? `<span style="color: #ffaa66; font-size: 12px; margin-left: 15px;">已改变剧情：${Player.changedStoryNodes.length}个节点</span>` : ''}</div>
                                    ${perks.length > 0 ? `<div style="color: #88cc88; font-size: 11px; margin-top: 4px;">已解锁：${perks.join(' · ')}</div>` : ''}
                                </div>
                            `;})()}
                            
                            <!-- v1.2.2: 属性分配区域移到顶部，确保可见 -->
                            ${Player.attributePoints > 0 ? `
                            <div style="
                                padding: 12px 15px;
                                background: rgba(80, 60, 20, 0.5);
                                border: 2px solid #aa8833;
                                border-radius: 10px;
                                margin-bottom: 15px;
                                text-align: center;
                            ">
                                <div style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">
                                    ⭐ 可分配属性点: ${Player.attributePoints}
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                    ${['vitality','spirit','attack','defense','speed'].map(attr => {
                                        const names = {vitality:'体质', spirit:'精神', attack:'攻击', defense:'防御', speed:'速度'};
                                        const icons = {vitality:'❤️', spirit:'🧠', attack:'⚔️', defense:'🛡️', speed:'👟'};
                                        return `<div onclick="Game.addAttribute('${attr}')" style="
                                            padding: 8px 4px;
                                            background: #44aa44;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            color: #fff;
                                            font-size: 13px;
                                            font-weight: bold;
                                            transition: all 0.2s;
                                        " onmouseover="this.style.background='#55cc55'" onmouseout="this.style.background='#44aa44'">
                                            ${icons[attr]} ${names[attr]}+
                                        </div>`;
                                    }).join('')}
                                </div>
                            </div>
                            ` : ''}
                            
                            <!-- 属性概览（简洁版，详细属性在下方） -->
                            <div style="
                                display: grid;
                                grid-template-columns: repeat(4, 1fr);
                                gap: 8px;
                                margin-bottom: 15px;
                                padding: 10px;
                                background: rgba(30, 50, 50, 0.5);
                                border-radius: 8px;
                            ">
                                <div style="text-align:center;"><div style="font-size:11px;color:#888;">攻击</div><div style="font-size:16px;color:#ffaaaa;font-weight:bold;">${stats.attack}</div></div>
                                <div style="text-align:center;"><div style="font-size:11px;color:#888;">防御</div><div style="font-size:16px;color:#aaccff;font-weight:bold;">${stats.defense}</div></div>
                                <div style="text-align:center;"><div style="font-size:11px;color:#888;">速度</div><div style="font-size:16px;color:#aaffaa;font-weight:bold;">${stats.speed}</div></div>
                                <div style="text-align:center;"><div style="font-size:11px;color:#888;">暴击</div><div style="font-size:16px;color:#ffcc66;font-weight:bold;">${(stats.critRate*100).toFixed(0)}%</div></div>
                            </div>
                            
                            ${typeof RealmSystem !== 'undefined' ? `
                                <div onclick="Game.showBreakthroughPanel()" style="
                                    padding: 10px 15px;
                                    background: linear-gradient(135deg, #ff660033, #ff330033);
                                    border: 2px solid #ff6600;
                                    border-radius: 10px;
                                    cursor: pointer;
                                    text-align: center;
                                    margin-bottom: 15px;
                                    transition: all 0.2s;
                                " onmouseover="this.style.background='linear-gradient(135deg, #ff660055, #ff330055)'" onmouseout="this.style.background='linear-gradient(135deg, #ff660033, #ff330033)'">
                                    <span style="color: #ff9933; font-size: 15px; font-weight: bold;">
                                        ⚡ 境界突破
                                        ${Player.canBreakthrough && Player.canBreakthrough().canBreakthrough ? ' (可突破!)' : ''}
                                    </span>
                                </div>
                            ` : ''}
                            ${Player.innateTalent && typeof InnateTalentSystem !== 'undefined' ? `
                            <div style="margin-bottom: 15px; text-align: left;">
                                <div style="color: #ff88ff; font-size: 13px; margin-bottom: 8px;">✦ 天生天赋</div>
                                ${(() => {
                                    const display = InnateTalentSystem.getTalentDisplay();
                                    if (!display) return '';
                                    return `
                                        <div style="
                                            padding: 10px 14px;
                                            background: ${display.rarityColor}15;
                                            border: 2px solid ${display.rarityColor};
                                            border-radius: 8px;
                                        ">
                                            <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                                <span style="font-size: 22px; margin-right: 8px;">${display.icon}</span>
                                                <div>
                                                    <span style="color: ${display.rarityColor}; font-weight: bold; font-size: 16px;">${display.name}</span>
                                                    <span style="color: #ffd700; font-size: 12px; margin-left: 8px;">Lv.${Player.innateTalentLevel || 1}</span>
                                                    <span style="color: ${display.rarityColor}; font-size: 11px; margin-left: 8px;">【${display.rarityName}】</span>
                                                </div>
                                            </div>
                                            <div style="color: #ccc; font-size: 12px; margin-bottom: 4px;">${display.description}</div>
                                            <div style="color: #66ff99; font-size: 12px; font-weight: bold;">${display.effectDesc}</div>
                                        </div>
                                    `;
                                })()}
                            </div>
                            ` : ''}
                            ${Player.talents && Object.keys(Player.talents).length > 0 ? `
                            <div style="margin-bottom: 15px; text-align: left;">
                                <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">🌟 系别天赋</div>
                                ${(() => {
                                    // v2.8.2: 双天赋装备系统 - 卡片式主副修显示，点击可重新选择
                                    const elemNames = { fire:'🔥 火系', ice:'❄️ 冰系', thunder:'⚡ 雷系', water:'💧 水系', wind:'🌪️ 风系', earth:'🪨 土系', light:'✨ 光系', dark:'🌑 暗系', heal:'💚 治愈系', plant:'🌿 植物系', summon:'📜 召唤系' };
                                    const elemColors = { fire:'#ff6633', ice:'#66ccff', thunder:'#ffcc00', water:'#6699ff', wind:'#99ff99', earth:'#cc9966', light:'#ffffcc', dark:'#9966ff', heal:'#66ff99', plant:'#66cc66', summon:'#cc99ff' };
                                    const combo = Player.getCrossElementCombo ? Player.getCrossElementCombo() : null;
                                    const primary = Player.primaryElement;
                                    const secondary = Player.secondaryElement;
                                    const canChange = Player.elements.length >= 2;

                                    const renderElemCard = (elem, role, color) => {
                                        if (!elem) return `<div style="flex:1;padding:12px;background:#1a1a2a;border:2px dashed #444;border-radius:10px;text-align:center;color:#555;font-size:12px;">未选择${role}</div>`;
                                        return `
                                            <div style="flex:1;padding:12px;background:${color}15;border:2px solid ${color};border-radius:10px;text-align:center;cursor:${canChange?'pointer':'default'};transition:all 0.3s;" ${canChange ? `onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 15px ${color}40';" onmouseout="this.style.transform='';this.style.boxShadow='none';"` : ''}>
                                                <div style="font-size:10px;color:${color};font-weight:bold;margin-bottom:4px;">${role === '主修' ? '⭐ 主修' : '💫 副修'}</div>
                                                <div style="font-size:15px;font-weight:bold;color:${color};">${elemNames[elem] || elem}</div>
                                                <div style="font-size:10px;color:#888;margin-top:3px;">${role === '主修' ? '100% 效果' : '70% 效果'}</div>
                                            </div>
                                        `;
                                    };

                                    return `
                                        <div onclick="${canChange ? "UI.showPrimarySecondarySelection(Player.elements.slice(-2), function(p,s){Player.setPrimaryElement(p);Player.setSecondaryElement(s);Player.save();Game.openCharacterPanel();}, false)" : ''}" style="margin-bottom: 10px; padding: 12px; background: linear-gradient(135deg,#1a1a2e,#16213e); border-radius: 10px; border: 1px solid #333;cursor:${canChange?'pointer':'default'};">
                                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                                <span style="color:#aaa;font-size:11px;">⚔️ 主副修配置</span>
                                                ${canChange ? '<span style="color:#ffd700;font-size:10px;">点击更换 ›</span>' : ''}
                                            </div>
                                            <div style="display:flex;gap:10px;">
                                                ${renderElemCard(primary, '主修', '#ffd700')}
                                                ${renderElemCard(secondary, '副修', '#88ccff')}
                                            </div>
                                            <div style="font-size:10px;color:#666;margin-top:8px;text-align:center;">主修100% | 副修70% | 其他50%</div>
                                            ${combo ? `<div style="margin-top: 8px; padding: 6px 10px; background: linear-gradient(90deg,#ffd70022,#ff88ff22); border-radius: 6px; border: 1px solid #ffd70055;text-align:center;">
                                                <span style="color: #ffd700; font-size: 11px; font-weight: bold;">✨ ${combo.name}</span>
                                                <span style="color: #ccc; font-size: 10px; margin-left: 6px;">${combo.desc}</span>
                                            </div>` : ''}
                                        </div>
                                    `;
                                })()}
                                ${Player.elements.map(elem => {
                                    const talentData = Player.talents[elem];
                                    if (!talentData || typeof TalentSystem === 'undefined') return '';
                                    const talent = TalentSystem.getTalent(talentData.talentId);
                                    if (!talent) return '';
                                    const rarityConfig = TalentSystem.getRarityConfig(talent.rarity);
                                    const maxLevel = talent.maxLevel || 10;
                                    const expToNext = TalentSystem.getExpToNextLevel(talentData.level);
                                    const expPercent = talentData.level >= maxLevel ? 100 : (talentData.exp / expToNext * 100);
                                    const effects = TalentSystem.getTalentEffects(talentData.talentId, talentData.level);
                                    const currentStage = TalentSystem.getCurrentStage(talentData.talentId, talentData.level);
                                    const nextStage = TalentSystem.getNextStage(talentData.talentId, talentData.level);
                                    const effectDesc = TalentSystem.summarizeEffects ? TalentSystem.summarizeEffects(effects) : Object.entries(effects).map(([k, v]) => {
                                        const names = {damageBonus:'伤害加成', healBonus:'治疗加成', defenseBonus:'防御加成', speedBonus:'速度加成', hpBonus:'生命加成', critRate:'暴击率', critDamage:'暴击伤害', mpCostReduction:'耗蓝减少', dodgeBonus:'闪避率', hpRegen:'HP回复', mpRegen:'MP回复', burnChance:'灼烧概率', freezeChance:'冰冻概率', paralyzeChance:'麻痹概率'};
                                        const pct = (v * 100).toFixed(0);
                                        return `${names[k]||k}+${pct}%`;
                                    }).join(', ');
                                    const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };
                                    // v2.2.0: 机制类型显示
                                    const mechanismLabels = {
                                        resource: { name: '资源型', icon: '⚡', color: '#ffaa44' },
                                        state: { name: '状态型', icon: '❄️', color: '#66ccff' },
                                        form: { name: '形态型', icon: '🔄', color: '#aa66ff' },
                                        trigger: { name: '触发型', icon: '💥', color: '#ff6666' },
                                        passive: { name: '光环型', icon: '✨', color: '#66ff88' }
                                    };
                                    const mech = talent.mechanism ? mechanismLabels[talent.mechanism] : null;
                                    let mechTag = mech ? `<span style="font-size:10px;color:${mech.color};background:${mech.color}22;padding:1px 5px;border-radius:3px;margin-left:6px;">${mech.icon}${mech.name}</span>` : '';
                                    let stageInfo = '';
                                    if (currentStage) {
                                        const sc = stageColors[currentStage.stage] || '#aaa';
                                        stageInfo += `<div style="color:${sc};font-size:11px;margin-top:2px;">【${currentStage.stage}】${currentStage.name}</div>`;
                                    }
                                    if (nextStage) {
                                        const nc = stageColors[nextStage.stage] || '#888';
                                        stageInfo += `<div style="color:${nc};font-size:10px;margin-top:1px;opacity:0.7;">→ Lv${nextStage.level}【${nextStage.stage}】${nextStage.name}</div>`;
                                    }
                                    const talentTooltip = `${talent.description || ''}\n[Lv.${talentData.level}] ${effectDesc}${currentStage ? '\n当前：【'+currentStage.stage+'】'+currentStage.name+' - '+currentStage.description : ''}${nextStage ? '\n下一进化：Lv'+nextStage.level+'【'+nextStage.stage+'】'+nextStage.name+' - '+nextStage.description : ''}`;
                                    return `
                                        <div onclick="UI.showTalentDetail('${elem}')" style="
                                            padding: 8px 12px;
                                            background: ${rarityConfig.color}11;
                                            border: 1px solid ${rarityConfig.color}55;
                                            border-radius: 8px;
                                            margin-bottom: 6px;
                                            font-size: 13px;
                                            cursor: pointer;
                                            transition: all 0.2s;
                                        " onmouseover="this.style.background='${rarityConfig.color}22';this.style.borderColor='${rarityConfig.color}';" onmouseout="this.style.background='${rarityConfig.color}11';this.style.borderColor='${rarityConfig.color}55';" title="${talentTooltip.replace(/"/g, '&quot;')}">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <span>
                                                    <span style="color: ${SkillSystem.getElementColor(elem)}; font-weight: bold;">${SkillSystem.getElementName(elem)}</span>
                                                    <span style="color: ${rarityConfig.color}; margin-left: 8px;">${talent.name}</span>
                                                    ${mechTag}
                                                </span>
                                                <span style="color: #888; font-size: 12px;">Lv.${talentData.level}${talentData.level >= maxLevel ? ' (满)' : ''}</span>
                                            </div>
                                            ${stageInfo}
                                            ${(() => {
                                                // v2.5.0: 天赋分支选择（Lv5且有branchChoices但未选择）
                                                if (talentData.level >= 5 && talent.evolutions) {
                                                    const evolveStage = talent.evolutions.find(e => e.level === 5 && e.branchChoices);
                                                    if (evolveStage && !talentData.branch) {
                                                        return `
                                                            <div style="margin-top: 6px; padding: 6px 8px; background: #ffd70022; border: 1px solid #ffd70055; border-radius: 4px;">
                                                                <div style="color: #ffd700; font-size: 11px; margin-bottom: 4px;">⚡ 可选择进化分支</div>
                                                                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                                    ${evolveStage.branchChoices.map(b => `
                                                                        <button onclick="UI.selectTalentBranch('${elem}', '${b.id}')" 
                                                                                style="flex: 1; min-width: 60px; padding: 4px 6px; background: #ffd70033; border: 1px solid #ffd700; border-radius: 3px; color: #ffd700; font-size: 11px; cursor: pointer;"
                                                                                title="${b.description}">${b.name}</button>
                                                                    `).join('')}
                                                                </div>
                                                            </div>
                                                        `;
                                                    }
                                                    // 已选择分支，显示当前分支
                                                    if (talentData.branch && evolveStage) {
                                                        const selectedBranch = evolveStage.branchChoices.find(b => b.id === talentData.branch);
                                                        if (selectedBranch) {
                                                            return `<div style="margin-top: 4px; color: #66ff99; font-size: 11px;">分支：${selectedBranch.name}</div>`;
                                                        }
                                                    }
                                                }
                                                return '';
                                            })()}
                                            ${talentData.level < maxLevel ? `
                                            <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-top: 4px;">
                                                <div style="height: 100%; width: ${expPercent.toFixed(1)}%; background: ${rarityConfig.color};"></div>
                                            </div>
                                            <div style="color: #666; font-size: 11px; text-align: right; margin-top: 2px;">${talentData.exp} / ${expToNext}</div>
                                            ` : ''}
                                            ${(talentData.level > 1 || talentData.branch) ? `
                                            <div style="margin-top: 6px; text-align: right;">
                                                <button onclick="UI.resetTalent('${elem}')" 
                                                        style="padding: 3px 8px; background: #663333; border: 1px solid #aa5555; border-radius: 3px; color: #ff9999; font-size: 10px; cursor: pointer;"
                                                        title="重置天赋：等级回到1，经验归零，分支清空">🔄 重置</button>
                                            </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ` : ''}
                            ${Player.spiritSeeds && Object.keys(Player.spiritSeeds).length > 0 ? `
                            <div style="margin-bottom: 15px; text-align: left;">
                                <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">💎 灵种</div>
                                ${Player.elements.map(elem => {
                                    const seed = Player.getElementSpiritSeed(elem);
                                    if (!seed || typeof SpiritSeedSystem === 'undefined') return '';
                                    const gradeConfig = SpiritSeedSystem.getGradeConfig(seed.grade);
                                    const isRare = seed.isRare;
                                    return `
                                        <div style="
                                            padding: 8px 12px;
                                            background: ${gradeConfig.color}11;
                                            border: ${isRare ? '2px' : '1px'} solid ${isRare ? '#ffd700' : gradeConfig.color + '55'};
                                            border-radius: 8px;
                                            margin-bottom: 6px;
                                            font-size: 13px;
                                            ${isRare ? 'box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);' : ''}
                                        ">
                                            <span style="color: ${SkillSystem.getElementColor(elem)}; font-weight: bold;">${SkillSystem.getElementName(elem)}</span>
                                            <span style="color: ${isRare ? '#ffd700' : gradeConfig.color}; margin-left: 8px;">${seed.name}</span>
                                            <span style="color: #888; font-size: 12px; margin-left: 8px;">[${gradeConfig.name}]</span>
                                            ${isRare ? '<span style="color: #ffd700; font-size: 12px; margin-left: 6px;">✨稀有</span>' : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ` : ''}
                            ${Player.starDustArtifacts && Object.keys(Player.starDustArtifacts).length > 0 ? `
                            <div style="margin-bottom: 15px; text-align: left;">
                                <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">⭐ 星尘魔器</div>
                                ${Object.keys(Player.starDustArtifacts).map(elem => {
                                    const artifactData = Player.starDustArtifacts[elem];
                                    if (!artifactData || typeof StarDustArtifactSystem === 'undefined') return '';
                                    const artifact = StarDustArtifactSystem.getArtifact(artifactData.id);
                                    if (!artifact) return '';
                                    const gradeConfig = StarDustArtifactSystem.getGradeConfig(artifact.grade);
                                    const effect = StarDustArtifactSystem.getCultivateEffect(artifactData);
                                    const elementName = artifact.element === "all" ? "全元素" : SkillSystem.getElementName(artifact.element);
                                    const elementColor = artifact.element === "all" ? "#ffcc00" : SkillSystem.getElementColor(artifact.element);
                                    return `
                                        <div style="
                                            padding: 8px 12px;
                                            background: ${gradeConfig.color}11;
                                            border: 1px solid ${gradeConfig.color}55;
                                            border-radius: 8px;
                                            margin-bottom: 6px;
                                            font-size: 13px;
                                        ">
                                            <span style="color: ${elementColor}; font-weight: bold;">${elementName}</span>
                                            <span style="color: ${gradeConfig.color}; margin-left: 8px;">${artifact.name}</span>
                                            <span style="color: #888; font-size: 12px; margin-left: 8px;">[${gradeConfig.name}]</span>
                                            ${artifact.grade === 'growth' ? `<span style="color: #ffcc00; font-size: 12px; margin-left: 8px;">Lv.${artifactData.level || 1}</span>` : ''}
                                            <div style="color: #888; font-size: 11px; margin-top: 4px;">
                                                修炼时间 +${Math.round(effect.timeBonus * 100)}% · 修炼经验 +${Math.round(effect.expBonus * 100)}%
                                            </div>
                                            ${artifact.grade === 'growth' ? `
                                            <div style="margin-top: 6px;">
                                                <div style="color: #888; font-size: 10px; margin-bottom: 2px;">
                                                    经验: ${artifactData.exp || 0} / ${StarDustArtifactSystem.getExpToNextLevel(artifactData.level || 1)}
                                                </div>
                                                <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                                                    <div style="height: 100%; width: ${Math.min(100, ((artifactData.exp || 0) / StarDustArtifactSystem.getExpToNextLevel(artifactData.level || 1)) * 100).toFixed(1)}%; background: linear-gradient(90deg, #ffcc00, #ffdd44);"></div>
                                                </div>
                                                <div onclick="Game.showArtifactUpgradePanel('${elem}')" style="
                                                    margin-top: 6px;
                                                    padding: 4px 10px;
                                                    background: linear-gradient(135deg, #cc9900, #ffcc00);
                                                    border-radius: 5px;
                                                    text-align: center;
                                                    cursor: pointer;
                                                    color: #332200;
                                                    font-size: 11px;
                                                    font-weight: bold;
                                                " onmouseover="this.style.background='linear-gradient(135deg, #ddaa00, #ffdd44)'" onmouseout="this.style.background='linear-gradient(135deg, #cc9900, #ffcc00)'">
                                                    ⬆️ 用精魄升级
                                                </div>
                                            </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ` : ''}
                            ${Player.starDustAssignment && typeof StarDustArtifactSystem !== 'undefined' ? (() => {
                                const assign = Player.starDustAssignment;
                                const artifact = StarDustArtifactSystem.getArtifact(assign.artifactId);
                                if (!artifact) return '';
                                const gradeName = assign.grade === 'exquisite' ? '精品' : '普通';
                                const gradeColor = assign.grade === 'exquisite' ? '#aa88ff' : '#88aacc';
                                const sourceName = assign.source === 'mu_family' ? '穆氏家族' : '学校分配';
                                const bonus = StarDustArtifactSystem.getActiveBonus(Player);
                                return `
                            <div style="margin-bottom: 15px; text-align: left;">
                                <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">📜 星尘魔器使用权</div>
                                <div style="
                                    padding: 8px 12px;
                                    background: ${gradeColor}11;
                                    border: 1px solid ${gradeColor}55;
                                    border-radius: 8px;
                                    font-size: 13px;
                                ">
                                    <span style="color: ${gradeColor}; font-weight: bold;">${artifact.name}</span>
                                    <span style="color: #888; font-size: 12px; margin-left: 8px;">[${gradeName}级·${sourceName}]</span>
                                    <div style="color: #ffcc44; font-size: 12px; margin-top: 4px;">
                                        ⏳ 剩余 ${assign.daysRemaining} 天 / 共 ${assign.totalDays} 天
                                    </div>
                                    <div style="color: #888; font-size: 11px; margin-top: 4px;">
                                        修炼经验 +${Math.round(bonus.expBonus * 100)}% · 疲劳恢复 +${Math.round(bonus.fatigueBonus * 100)}%
                                    </div>
                                    <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-top: 6px;">
                                        <div style="height: 100%; width: ${(assign.daysRemaining / assign.totalDays * 100).toFixed(1)}%; background: linear-gradient(90deg, ${gradeColor}, ${gradeColor}aa);"></div>
                                    </div>
                                </div>
                            </div>
                                `;
                            })() : ''}
                            ${(() => {
                                Player.migrateSummonData();
                                const beasts = Player.summonBeasts || [];
                                const maxCount = Player.getMaxSummonCount();
                                const realmNames = { initial: '初阶', primary: '初阶', middle: '中阶', high: '高阶', super: '超阶' };
                                if (beasts.length === 0) return '';
                                let html = '<div style="margin-bottom: 15px; text-align: left;">';
                                html += `<div style="color: #aa88ff; font-size: 13px; margin-bottom: 8px;">🐺 召唤兽 (${beasts.length}/${maxCount} · ${realmNames[Player.realm]})</div>`;
                                beasts.forEach((sd, idx) => {
                                    const isActive = idx === Player.activeSummonIndex;
                                    // v0.12.0: 稀有度配色（和装备一致）
                                    const rarityColors = { '普通': '#aaaaaa', '优秀': '#66ff66', '稀有': '#6699ff', '史诗': '#cc66ff', '传说': '#ffaa44' };
                                    const rarityColor = rarityColors[sd.rarity] || '#aaaaaa';
                                    // v0.12.0: 召唤兽评分计算
                                    const calcBeastScore = (beastData) => {
                                        const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(beastData) : null;
                                        const stats = currentData ? currentData.effectiveStats : {
                                            maxHp: beastData.baseMaxHp, attack: beastData.baseAttack, defense: beastData.baseDefense, speed: beastData.baseSpeed
                                        };
                                        const lb = 1 + (beastData.level - 1) * 0.15;
                                        return Math.floor((stats.maxHp || 0) * 0.1 * lb + (stats.attack || 0) * 2 * lb + (stats.defense || 0) * 1.5 * lb + (stats.speed || 0) * 2 * lb);
                                    };
                                    const beastScore = calcBeastScore(sd);
                                    const borderColor = isActive ? rarityColor : '#555';
                                    const bgColor = isActive ? `${rarityColor}22` : 'rgba(50, 50, 70, 0.2)';
                                    html += `<div style="padding: 12px 15px; background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 10px; margin-bottom: ${isActive ? '10px' : '6px'}; ${isActive ? `box-shadow: 0 0 10px ${rarityColor}44;` : ''}">`;
                                    html += `<div style="display: flex; align-items: center; margin-bottom: 8px;">`;
                                    html += `<span style="font-size: 28px; margin-right: 10px;">${sd.icon}</span>`;
                                    html += `<div style="flex: 1;">`;
                                    html += `<div style="color: ${rarityColor}; font-weight: bold; font-size: 16px;">${sd.name}${isActive ? ' <span style="color:#ffaa00;font-size:11px;">出战中</span>' : ''} <span style="font-size: 10px; color: #ffd700; background: rgba(100, 80, 20, 0.5); padding: 1px 5px; border-radius: 5px;">⭐${beastScore}</span></div>`;
                                    html += `<div style="color: #999; font-size: 12px;">Lv.${sd.level} · 忠诚 ${sd.loyalty}/100 · <span style="color: ${rarityColor};">${sd.rarity || '普通'}</span></div>`;
                                    html += `</div>`;
                                    if (!isActive) {
                                        html += `<div onclick="Game.switchSummon(${idx})" style="padding: 4px 10px; background: #554488; border-radius: 5px; cursor: pointer; color: #fff; font-size: 11px;">出战</div>`;
                                    }
                                    html += `</div>`;
                                    // v0.12.0: 未出战召唤兽也显示简要属性
                                    if (!isActive) {
                                        html += (() => {
                                            const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                            const stats = currentData ? currentData.effectiveStats : {
                                                maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
                                            };
                                            const lb = 1 + (sd.level - 1) * 0.15;
                                            return `<div style="display: flex; gap: 12px; font-size: 11px; color: #888;">
                                                <span>❤️${Math.floor(stats.maxHp * lb)}</span>
                                                <span>⚔️${Math.floor(stats.attack * lb)}</span>
                                                <span>🛡️${Math.floor(stats.defense * lb)}</span>
                                                <span>💨${Math.floor(stats.speed * lb)}</span>
                                            </div>`;
                                        })();
                                    }
                                    // 只显示当前出战召唤兽的详细信息
                                    if (isActive) {
                                        html += (() => {
                                            const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                            const beast = currentData || DataSummonBeasts[sd.id];
                                            return beast && beast.description ? `<div style="color: #888; font-size: 11px; margin-bottom: 6px; font-style: italic;">${beast.description}</div>` : '';
                                        })();
                                        html += `<div style="display: flex; gap: 15px; font-size: 12px; color: #aaa; margin-bottom: 6px;">`;
                                        html += (() => {
                                            const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                            const stats = currentData ? currentData.effectiveStats : {
                                                maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
                                            };
                                            const lb = 1 + (sd.level - 1) * 0.15;
                                            return `<span>❤️ ${Math.floor(stats.maxHp * lb)}</span>
                                                <span>⚔️ ${Math.floor(stats.attack * lb)}</span>
                                                <span>🛡️ ${Math.floor(stats.defense * lb)}</span>
                                                <span>💨 ${Math.floor(stats.speed * lb)}</span>`;
                                        })();
                                        html += `</div>`;
                                        html += sd.level < 30 ? `
                                        <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                                            <div style="height: 100%; width: ${(sd.exp / sd.expToNext * 100).toFixed(1)}%; background: linear-gradient(90deg, #aa66ff, #cc99ff);"></div>
                                        </div>
                                        <div style="color: #666; font-size: 10px; text-align: right; margin-top: 2px;">${sd.exp} / ${sd.expToNext}</div>
                                        ` : '<div style="color: #ffd700; font-size: 11px;">已满级</div>';
                                        html += `<div style="color: #888; font-size: 10px; margin-top: 6px;">`;
                                        html += (() => {
                                            const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                            const beast = currentData || DataSummonBeasts[sd.id];
                                            if (!beast) return '技能：撕咬';
                                            const allSkills = beast.skills || [];
                                            const unlocked = allSkills.filter(s => sd.level >= s.minLevel);
                                            const locked = allSkills.filter(s => sd.level < s.minLevel);
                                            let skillText = '已学：' + unlocked.map(s => s.name).join('/');
                                            if (locked.length > 0) {
                                                skillText += ' · 未学：' + locked.map(s => `${s.name}(Lv${s.minLevel})`).join('/');
                                            }
                                            return skillText;
                                        })();
                                        html += `</div>`;
                                        // 进化按钮
                                        html += (() => {
                                            const evoInfo = typeof Player.getSummonEvolutionInfo === 'function' ? Player.getSummonEvolutionInfo() : null;
                                            if (!evoInfo) return '';
                                            if (evoInfo.isMaxStage) {
                                                return '<div style="color: #ffd700; font-size: 11px; margin-top: 8px; text-align: center;">★ 已达最终形态</div>';
                                            }
                                            const next = evoInfo.nextEvolution;
                                            if (evoInfo.canEvolve) {
                                                return `<div onclick="Game.evolveSummon()" style="margin-top: 8px; padding: 8px; background: linear-gradient(135deg, #9966ff, #cc66ff); border-radius: 6px; text-align: center; cursor: pointer; color: #fff; font-weight: bold; font-size: 13px; animation: pulse 1.5s infinite;">✨ 进化为 ${next.icon} ${next.name}！</div>`;
                                            }
                                            // v0.12.0: 进化条件优化，显示进度和颜色
                                            const realmNames2 = { initial: '初阶', primary: '初阶', middle: '中阶', high: '高阶' };
                                            const realmOrder = { initial: 1, primary: 1, middle: 2, high: 3 };
                                            const levelMet = sd.level >= next.minBeastLevel;
                                            const loyaltyMet = sd.loyalty >= next.minLoyalty;
                                            const realmMet = (realmOrder[Player.realm] || 1) >= (realmOrder[next.minPlayerRealm] || 1);
                                            const levelPercent = Math.min(100, (sd.level / next.minBeastLevel) * 100);
                                            const loyaltyPercent = Math.min(100, (sd.loyalty / next.minLoyalty) * 100);
                                            return `<div style="margin-top: 8px; padding: 8px; background: rgba(150,100,200,0.1); border: 1px solid #8866aa; border-radius: 6px;">
                                                <div style="color: #cc99ff; font-size: 12px; margin-bottom: 6px; font-weight: bold;">下一形态：${next.icon} ${next.name}</div>
                                                <div style="font-size: 10px; margin-bottom: 4px;">
                                                    <span style="color: ${levelMet ? '#66ff66' : '#ff6666'};">等级: ${sd.level}/${next.minBeastLevel} ${levelMet ? '✓' : ''}</span>
                                                    <div style="height: 3px; background: #333; border-radius: 2px; margin-top: 2px; overflow: hidden;">
                                                        <div style="height: 100%; width: ${levelPercent}%; background: ${levelMet ? '#66ff66' : '#ffaa44'};"></div>
                                                    </div>
                                                </div>
                                                <div style="font-size: 10px; margin-bottom: 4px;">
                                                    <span style="color: ${loyaltyMet ? '#66ff66' : '#ff6666'};">忠诚: ${sd.loyalty}/${next.minLoyalty} ${loyaltyMet ? '✓' : ''}</span>
                                                    <div style="height: 3px; background: #333; border-radius: 2px; margin-top: 2px; overflow: hidden;">
                                                        <div style="height: 100%; width: ${loyaltyPercent}%; background: ${loyaltyMet ? '#66ff66' : '#ffaa44'};"></div>
                                                    </div>
                                                </div>
                                                <div style="font-size: 10px;">
                                                    <span style="color: ${realmMet ? '#66ff66' : '#ff6666'};">境界: ${realmNames2[Player.realm]}/${realmNames2[next.minPlayerRealm]} ${realmMet ? '✓' : ''}</span>
                                                </div>
                                            </div>`;
                                        })();
                                    }
                                    html += `</div>`;
                                });
                                // 契约新召唤兽按钮
                                if (beasts.length < maxCount) {
                                    html += `<div onclick="Game.seekNewSummon()" style="padding: 10px; background: rgba(80, 60, 120, 0.3); border: 2px dashed #8866cc; border-radius: 8px; text-align: center; cursor: pointer; color: #aa88ff; font-size: 13px;">
                                        🔮 寻找新的契约兽（${realmNames[Player.realm]}可契约${maxCount}只）
                                    </div>`;
                                }
                                html += '</div>';
                                return html;
                            })()}
                            ${Player.canAwakenNewElement() ? `
                            <div onclick="Game.showAwakenPanel()" style="
                                display: inline-block;
                                padding: 10px 20px;
                                background: linear-gradient(135deg, #ff8844, #ff4488);
                                border-radius: 10px;
                                color: #fff;
                                font-size: 16px;
                                font-weight: bold;
                                cursor: pointer;
                                margin-bottom: 15px;
                                box-shadow: 0 0 15px rgba(255, 100, 100, 0.5);
                            ">✨ 觉醒新元素系</div>
                            ` : ''}
                            <div style="color: #aaa; font-size: 14px;">
                                经验: ${Player.exp} / ${Player.expToNext}
                            </div>
                            <div style="height: 10px; background: #333; border-radius: 5px; overflow: hidden; margin-top: 5px;">
                                <div style="height: 100%; width: ${(Player.exp / Player.expToNext * 100).toFixed(1)}%; background: linear-gradient(90deg, #66ff66, #99ff99);"></div>
                            </div>
                        </div>
                        
                        <!-- 详细属性列表 -->
                        <div style="
                            padding: 25px;
                            background: rgba(30, 50, 50, 0.8);
                            border: 2px solid #447766;
                            border-radius: 15px;
                        ">
                            <h3 style="color: #ffd700; margin-bottom: 20px;">📊 详细属性</h3>
                            
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                ${this.renderAttributeRow('❤️', '生命值', Player.hp, stats.maxHp, 'vitality')}
                                ${this.renderAttributeRow('💧', '魔法值', Player.mp, stats.maxMp, 'spirit')}
                                ${this.renderAttributeRow('⚔️', '攻击力', stats.attack, null, 'attack')}
                                ${this.renderAttributeRow('🛡️', '防御力', stats.defense, null, 'defense')}
                                ${this.renderAttributeRow('👟', '速度', stats.speed, null, 'speed')}
                                ${this.renderAttributeRow('🧠', '精神力', Player.spirit, null, 'spirit')}
                                ${this.renderAttributeRow('💥', '暴击率', (stats.critRate * 100).toFixed(1) + '%', null, null)}
                                ${this.renderAttributeRow('🎯', '命中率', (stats.hitRate * 100).toFixed(1) + '%', null, null)}
                            </div>
                        </div>
                        
                        <!-- 技能列表 -->
                        <div style="
                            padding: 25px;
                            background: rgba(30, 50, 50, 0.8);
                            border: 2px solid #447766;
                            border-radius: 15px;
                            margin-top: 25px;
                        ">
                            <h3 style="color: #ffd700; margin-bottom: 20px;">✨ 已学技能</h3>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${Player.skills.map(skillId => {
                                    const skill = SkillSystem.getSkill(skillId);
                                    if (!skill) return '';
                                    
                                    // 技能等级
                                    const skillLevel = Player.getSkillLevel ? Player.getSkillLevel(skillId) : 1;
                                    const skillExp = Player.getSkillExp ? Player.getSkillExp(skillId) : 0;
                                    const expToNext = typeof SkillLevelSystem !== 'undefined' ? SkillLevelSystem.getExpToNextLevel(skillLevel) : 0;
                                    const isMaxLevel = skillLevel >= (typeof SkillLevelSystem !== 'undefined' ? SkillLevelSystem.MAX_LEVEL : 3);
                                    const expPercent = isMaxLevel ? 100 : Math.floor((skillExp / expToNext) * 100);
                                    const elementColor = SkillSystem.getElementColor(skill.element);
                                    
                                    return `
                                        <div style="
                                            padding: 12px 15px;
                                            background: ${elementColor}15;
                                            border-left: 4px solid ${elementColor};
                                            border-radius: 5px;
                                        ">
                                            <div style="font-size: 16px; color: #fff; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                                                <span>
                                                    ${skill.name}
                                                    <span style="font-size: 12px; color: ${elementColor}; margin-left: 10px;">${skill.tier} · ${SkillSystem.getElementName(skill.element)}</span>
                                                </span>
                                                <span style="font-size: 14px; color: ${elementColor}; font-weight: bold;">
                                                    Lv.${skillLevel}${isMaxLevel ? ' (满级)' : ''}
                                                </span>
                                            </div>
                                            <div style="font-size: 13px; color: #999; margin-top: 4px;">${skill.description}</div>
                                            ${!isMaxLevel && expToNext > 0 ? `
                                                <div style="margin-top: 8px;">
                                                    <div style="font-size: 11px; color: #666; margin-bottom: 3px; display: flex; justify-content: space-between;">
                                                        <span>技能经验</span>
                                                        <span>${skillExp} / ${expToNext}</span>
                                                    </div>
                                                    <div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                                                        <div style="height: 100%; width: ${expPercent}%; background: linear-gradient(90deg, ${elementColor}, ${elementColor}cc); border-radius: 3px;"></div>
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 生成技能tooltip文本
    getSkillTooltipText(skill) {
        let tip = skill.description || skill.name;
        tip += ` | MP消耗: ${skill.mpCost || 0}`;
        if (skill.power) tip += ` | 伤害倍率: ${skill.power}x攻击`;
        if (skill.baseDamage) tip += ` | 基础伤害: ${skill.baseDamage}`;
        if (skill.damageMultiplier && skill.damageMultiplier !== 1) tip += ` | 伤害系数: ${skill.damageMultiplier}`;
        if (skill.hitCount && skill.hitCount > 1) tip += ` | 攻击次数: ${skill.hitCount}`;
        if (skill.cooldown) tip += ` | 冷却: ${skill.cooldown}回合`;
        if (skill.effect) tip += ` | 效果: ${skill.effect}`;
        if (skill.chance) tip += ` (${Math.round(skill.chance * 100)}%)`;
        return tip;
    },

    // 渲染属性行
    renderAttributeRow(icon, name, value, max, attrKey) {
        const canAdd = attrKey && Player.attributePoints > 0 && ['attack', 'defense', 'speed', 'vitality', 'spirit'].includes(attrKey);
        const attrDescriptions = {
            vitality: '体质：每点+20最大HP和当前HP，提高生存能力',
            spirit: '精神力：每点+10最大MP和1精神力，提高魔法伤害和MP上限',
            attack: '攻击：每点+2攻击力，提高物理和魔法伤害',
            defense: '防御：每点+2防御力，减少受到的伤害',
            speed: '速度：每点+2速度，影响行动顺序和闪避'
        };
        const titleText = attrKey ? attrDescriptions[attrKey] : (name === '暴击率' ? '暴击率：攻击时造成双倍伤害的概率' : name === '命中率' ? '命中率：攻击命中目标的概率' : '');

        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #335555;" title="${titleText}">
                <div style="font-size: 16px; color: #ccc;">
                    ${icon} ${name}
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 18px; color: #fff; font-weight: bold;">
                        ${value}${max ? ' / ' + max : ''}
                    </span>
                    ${canAdd ? `
                        <div onclick="Game.addAttribute('${attrKey}')" style="
                            width: 30px;
                            height: 30px;
                            background: #44aa44;
                            border: none;
                            border-radius: 50%;
                            color: #fff;
                            cursor: pointer;
                            font-size: 18px;
                            font-weight: bold;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            line-height: 1;
                        ">+</div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    updateCharacterScreen() {
        // 保存滚动位置，防止属性分配后页面跳顶
        const scrollContainer = document.querySelector('.character-panel-scroll') || document.getElementById('game-container');
        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
        this.renderCharacterScreen();
        // 恢复滚动位置
        setTimeout(() => {
            const newScrollContainer = document.querySelector('.character-panel-scroll') || document.getElementById('game-container');
            if (newScrollContainer) {
                newScrollContainer.scrollTop = scrollTop;
            }
        }, 0);
    },

    // NPC 对话
    showNPCDialog(npc, message, availableQuests) {
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
            border: 2px solid #6666aa;
            border-radius: 15px;
            padding: 30px;
            min-width: 400px;
            max-width: 500px;
            z-index: 1000;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        dialog.innerHTML = `
            <div style="font-size: 22px; color: #ffd700; margin-bottom: 15px; font-weight: bold;">
                ${npc.name}
                <span style="font-size: 14px; color: #aaa; font-weight: normal;">${npc.title || ''}</span>
            </div>
            <div style="font-size: 16px; color: #e0e0ff; line-height: 1.8; margin-bottom: 25px; white-space: pre-line;">
                ${message}
            </div>
            ${availableQuests && availableQuests.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <div style="color: #88ff88; font-size: 14px; margin-bottom: 10px;">📜 可接任务：</div>
                    ${availableQuests.map(questId => {
                        const quest = QuestSystem.getQuest(questId);
                        if (!quest) return '';
                        return `
                            <div onclick="acceptQuestFromDialog('${questId}')" style="
                                display: block;
                                width: 100%;
                                padding: 10px 15px;
                                margin-bottom: 8px;
                                background: rgba(50, 80, 50, 0.5);
                                border: 1px solid #55aa55;
                                border-radius: 8px;
                                color: #aaffaa;
                                cursor: pointer;
                                text-align: left;
                                font-size: 14px;
                            ">
                                📜 ${quest.name}
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <div onclick="showGiftSelection('${npc.id}')" style="
                    padding: 8px 25px;
                    background: rgba(150, 80, 150, 0.6);
                    border: 1px solid #aa66aa;
                    border-radius: 8px;
                    color: #ddaadd;
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                ">🎁 送礼</div>
                <div onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 8px 25px;
                    background: #444477;
                    border: 1px solid #666699;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                ">关闭</div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        window.acceptQuestFromDialog = (questId) => {
            Game.acceptQuest(questId);
            dialog.remove();
        };
    },

    // 显示礼物选择界面
    showGiftSelection(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 获取背包中可送的物品（排除装备）
        const giftableItems = Player.inventory.filter(item => {
            const itemData = DataManager.getItem(item.itemId);
            return itemData && itemData.type !== 'equipment' && itemData.type !== 'key';
        });

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #aa66aa;
            border-radius: 15px;
            padding: 30px;
            min-width: 400px;
            max-width: 500px;
            max-height: 70vh;
            overflow-y: auto;
            z-index: 99999;
            box-shadow: 0 0 40px rgba(150, 80, 150, 0.3);
        `;

        const giftPrefs = npc.giftPreferences || {};
        const lovedItems = giftPrefs.loved || [];
        const likedItems = giftPrefs.liked || [];
        const dislikedItems = giftPrefs.disliked || [];

        dialog.innerHTML = `
            <div style="font-size: 20px; color: #ddaadd; margin-bottom: 15px; font-weight: bold;">
                🎁 给 ${npc.name} 送礼
            </div>
            <div style="font-size: 13px; color: #999; margin-bottom: 15px;">
                选择要送出的物品（每天最多送 ${giftPrefs.dailyGiftLimit || 3} 次）
            </div>
            ${giftableItems.length === 0 ? `
                <div style="color: #888; text-align: center; padding: 30px;">
                    背包里没有可送的物品...
                </div>
            ` : `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${giftableItems.map(item => {
                        const itemData = DataManager.getItem(item.itemId);
                        if (!itemData) return '';
                        
                        let preferenceLabel = '';
                        let preferenceColor = '#aaa';
                        if (lovedItems.includes(item.itemId)) {
                            preferenceLabel = '❤️ 喜欢';
                            preferenceColor = '#ff88aa';
                        } else if (likedItems.includes(item.itemId)) {
                            preferenceLabel = '👍 不错';
                            preferenceColor = '#88ff88';
                        } else if (dislikedItems.includes(item.itemId)) {
                            preferenceLabel = '👎 不喜欢';
                            preferenceColor = '#ff8866';
                        }
                        
                        return `
                            <div onclick="giveGiftToNPC('${npcId}', '${item.itemId}')" style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 12px 15px;
                                background: rgba(60, 40, 60, 0.6);
                                border: 1px solid #775577;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 14px;
                            " onmouseover="this.style.background='rgba(80, 50, 80, 0.8)'" onmouseout="this.style.background='rgba(60, 40, 60, 0.6)'">
                                <div>
                                    <span style="font-size: 18px;">${itemData.icon || '📦'}</span>
                                    <span style="margin-left: 8px;">${itemData.name}</span>
                                    <span style="color: #888; margin-left: 8px;">x${item.count}</span>
                                </div>
                                <div style="color: ${preferenceColor}; font-size: 12px;">
                                    ${preferenceLabel}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
            <div style="text-align: right; margin-top: 20px;">
                <div onclick="this.parentElement.parentElement.remove()" style="
                    padding: 8px 25px;
                    background: #444477;
                    border: 1px solid #666699;
                    border-radius: 8px;
                    color: #ccccff;
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                ">取消</div>
            </div>
        `;

        document.body.appendChild(dialog);

        window.giveGiftToNPC = (npcId, itemId) => {
            const result = Game.giveGift(npcId, itemId);
            if (result.success) {
                dialog.remove();
                // 关闭对话窗口
                const npcDialog = document.querySelector('[style*="z-index: 1000"]');
                if (npcDialog) npcDialog.remove();
            }
        };
    },
};

// 初始化

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.UI = UI;
