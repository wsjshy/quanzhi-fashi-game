/**
 * UI 渲染系统
 * 负责所有界面的渲染和更新
 */

const UI = {
    // DOM 元素缓存
    elements: {},
    
    // UI 状态
    inventoryFilter: 'all', // 背包物品筛选：all/consumable/equipment/material/quest

    // 初始化
    init() {
        // 缓存常用元素
        this.elements.gameContainer = document.getElementById('game-container');
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
            UI.showMessage(`【新手引导】已自动接取任务「初识魔法」，去修炼场感受魔法的力量吧！\n\n💡 提示：按 ~ 键可打开调试面板（需在URL加?debug=1）。`);
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
            UI.showMessage(`【新手引导】已自动接取任务「初识魔法」，去修炼场感受魔法的力量吧！\n\n💡 提示：按 ~ 键可打开调试面板（需在URL加?debug=1）。`);
        };
        skipBtn.onclick = skipOpening;

        const showNext = () => {
            if (idx >= storyTexts.length) {
                btn.style.display = 'inline-block';
                btn.onclick = () => {
                    overlay.remove();
                    UI.showMessage(`【新手引导】已自动接取任务「初识魔法」，去修炼场感受魔法的力量吧！\n\n💡 提示：按 ~ 键可打开调试面板（需在URL加?debug=1）。`);
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
        }
    },

    // v0.9.4: 显示每日总结
    showDailySummary(stats) {
        if (!stats) return;
        
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
            // 延迟恢复主容器点击和行动冷却
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
            }, 200);
            return;
        }
        
        if (this._messageQueue.length === 0) {
            this._isMessageShowing = false;
            // 延迟恢复主容器点击和行动冷却
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
            }, 200);
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
            
            // 延迟移除全局点击拦截器，防止弹窗关闭后的延迟点击事件
            setTimeout(() => {
                document.removeEventListener('click', clickInterceptor, true);
                document.removeEventListener('mousedown', clickInterceptor, true);
                document.removeEventListener('mouseup', clickInterceptor, true);
                // 如果全局引用还是这个拦截器，就清空
                if (ui._globalClickInterceptor === clickInterceptor) {
                    ui._globalClickInterceptor = null;
                }
            }, 500);
            
            // 设置行动冷却，防止点击穿透/延迟触发
            if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
                Game._actionCooldown = true;
                setTimeout(() => {
                    Game._actionCooldown = false;
                }, 500);
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
            
            setTimeout(() => blocker.remove(), 500);
            
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

    // ========== 标题界面 ==========
    renderTitleScreen(hasSave) {
        const container = this.elements.gameContainer;
        
        container.innerHTML = `
            <div class="mobile-title" style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: radial-gradient(ellipse at center, #1a1a4a 0%, #0a0a1a 70%);
                position: relative;
                overflow: hidden;
            ">
                <!-- 背景装饰 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.15;
                    filter: blur(3px);
                    pointer-events: none;
                "></div>
                
                <!-- 魔法粒子效果 -->
                <div id="particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
                
                <h1 style="
                    font-size: 72px;
                    background: linear-gradient(135deg, #ffd700, #ff6b35, #ffd700);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
                    margin-bottom: 20px;
                    letter-spacing: 12px;
                    font-weight: bold;
                    z-index: 10;
                    position: relative;
                ">全职法师</h1>
                
                <div style="
                    font-size: 24px;
                    color: #8888aa;
                    margin-bottom: 80px;
                    letter-spacing: 6px;
                    z-index: 10;
                    position: relative;
                ">魔法觉醒 · 开放世界</div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; z-index: 99998; position: relative;">
                    <button onclick="Game.startNewGame()" style="
                        width: 280px;
                        padding: 18px 32px;
                        font-size: 20px;
                        background: linear-gradient(135deg, #2a2a6a, #4a4aaa);
                        border: 2px solid #6666cc;
                        color: #e0e0ff;
                        cursor: pointer;
                        border-radius: 10px;
                        transition: all 0.3s;
                        letter-spacing: 4px;
                    " onmouseover="this.style.background='linear-gradient(135deg, #3a3a8a, #6a6acc)'; this.style.boxShadow='0 0 25px rgba(100, 100, 255, 0.5)'" onmouseout="this.style.background='linear-gradient(135deg, #2a2a6a, #4a4aaa)'; this.style.boxShadow='none'">
                        🎮 开始新游戏
                    </button>
                    
                    ${hasSave ? `
                    <button onclick="Game.continueGame()" style="
                        width: 280px;
                        padding: 18px 32px;
                        font-size: 20px;
                        background: linear-gradient(135deg, #2a4a2a, #4aaa4a);
                        border: 2px solid #66cc66;
                        color: #e0ffe0;
                        cursor: pointer;
                        border-radius: 10px;
                        transition: all 0.3s;
                        letter-spacing: 4px;
                    " onmouseover="this.style.background='linear-gradient(135deg, #3a6a3a, #66cc66)'; this.style.boxShadow='0 0 25px rgba(100, 255, 100, 0.5)'" onmouseout="this.style.background='linear-gradient(135deg, #2a4a2a, #4aaa4a)'; this.style.boxShadow='none'">
                        💾 继续游戏
                    </button>
                    ` : ''}
                </div>
                
                <div style="
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    font-size: 14px;
                    color: #555;
                ">v0.81.1 · 手机端修复</div>
            </div>
        `;

        // 创建粒子效果
        this.createParticles();
    },

    // 创建魔法粒子效果
    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 6 + 2;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 10 + 5;
            const delay = Math.random() * 5;
            const colors = ['#ffd700', '#ff6b35', '#66ccff', '#9966ff', '#66ff99'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: 0.6;
                box-shadow: 0 0 ${size * 2}px ${color};
                animation: float ${duration}s ease-in-out ${delay}s infinite;
            `;
            container.appendChild(particle);
        }

        // 添加动画样式
        if (!document.getElementById('particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // ========== 角色创建界面 ==========
    renderCharacterCreate() {
        const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark'];
        const elementNames = {
            fire: '🔥 火系', ice: '❄️ 冰系', thunder: '⚡ 雷系', earth: '🪨 土系',
            wind: '🌪️ 风系', water: '💧 水系', light: '✨ 光系', dark: '🌑 暗影系'
        };
        const elementColors = {
            fire: '#ff6633', ice: '#66ccff', thunder: '#ffcc00', earth: '#cc9966',
            wind: '#99ff99', water: '#6699ff', light: '#ffffcc', dark: '#9966ff'
        };
        // 元素权重：常见系概率高，稀有系概率低
        const elementWeights = {
            fire: 15, ice: 12, thunder: 10, earth: 15,
            wind: 15, water: 15, light: 8, dark: 5
        };

        // 随机选3个不重复的元素（加权随机）
        function rollThreeElements() {
            const available = [...allElements];
            const result = [];
            while (result.length < 3 && available.length > 0) {
                const totalWeight = available.reduce((sum, e) => sum + elementWeights[e], 0);
                let rand = Math.random() * totalWeight;
                for (let i = 0; i < available.length; i++) {
                    rand -= elementWeights[available[i]];
                    if (rand <= 0) {
                        result.push(available[i]);
                        available.splice(i, 1);
                        break;
                    }
                }
            }
            return result;
        }

        let candidateElements = rollThreeElements();
        let rerollCount = 0;
        const maxRerolls = 3;

        function renderElements() {
            let elementsHtml = '';
            candidateElements.forEach(elem => {
                elementsHtml += `
                    <div class="element-card" onclick="selectElement('${elem}')" 
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
                         onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='#444477'; this.style.boxShadow='none'; this.style.transform='translateY(0)'}">
                        ${elementNames[elem]}
                    </div>
                `;
            });
            // 添加重新感知按钮作为第四个卡片
            const remaining = maxRerolls - rerollCount;
            const rerollStyle = remaining <= 0 
                ? 'opacity:0.3;pointer-events:none;' 
                : '';
            elementsHtml += `
                <div class="element-card" id="reroll-btn" onclick="rerollCreateElements()"
                     style="
                        padding: 25px 20px;
                        background: rgba(80, 60, 120, 0.6);
                        border: 2px dashed #8866bb;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                        font-size: 16px;
                        color: #bb99dd;
                        min-width: 140px;
                        ${rerollStyle}
                     "
                     onmouseover="this.style.background='rgba(100,80,150,0.8)'; this.style.borderColor='#aa88dd'"
                     onmouseout="this.style.background='rgba(80,60,120,0.6)'; this.style.borderColor='#8866bb'">
                    🔄 重新感知<br><span style="font-size:12px;opacity:0.8">（剩余${remaining}次）</span>
                </div>
            `;
            return elementsHtml;
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
            ">
                <!-- 背景图片 -->
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
                
                <p style="color: #8888aa; margin-bottom: 40px; font-size: 16px;">将手放在觉醒石上，感受与你共鸣的元素...</p>
                
                <div style="margin-bottom: 30px;">
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
                
                <p style="color: #ffd700; margin-bottom: 8px; font-size: 18px;">✨ 觉醒石感知到3种元素与你共鸣：</p>
                <p style="color: #888; margin-bottom: 20px; font-size: 13px;">选择其一作为你的初始元素系</p>
                
                <div id="element-candidates" class="mobile-element-grid" style="
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    align-items: center;
                ">
                    ${renderElements()}
                </div>

                <div onclick="confirmCreate()" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: linear-gradient(135deg, #2a2a6a, #4a4aaa);
                    border: 2px solid #6666cc;
                    color: #e0e0ff;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    letter-spacing: 4px;
                    opacity: 0.5;
                    display: inline-block;
                " id="confirm-btn">
                    确认创建
                </div>
                </div>
            </div>
        `;

        // 全局函数
        window.selectedElement = null;
        window.confirmEnabled = false;
        window.selectElement = (elem) => {
            // 移除其他选中
            document.querySelectorAll('.element-card').forEach(card => {
                card.classList.remove('selected');
                card.style.borderColor = '#444477';
                card.style.boxShadow = 'none';
            });
            
            // 选中当前
            const card = document.getElementById('elem-' + elem);
            card.classList.add('selected');
            card.style.borderColor = elementColors[elem];
            card.style.boxShadow = `0 0 25px ${elementColors[elem]}60`;
            
            window.selectedElement = elem;
            window.confirmEnabled = true;
            
            // 启用确认按钮
            const btn = document.getElementById('confirm-btn');
            btn.style.opacity = '1';
        };

        // 用UI对象方法存储reroll状态
        this._createRerollCount = rerollCount;
        this._createMaxRerolls = maxRerolls;
        this._createCandidateElements = candidateElements;

        this.rerollCreateElements = () => {
            if (this._createRerollCount >= this._createMaxRerolls) return;
            this._createRerollCount++;
            this._createCandidateElements = rollThreeElements();
            window.selectedElement = null;
            window.confirmEnabled = false;
            const container = document.getElementById('element-candidates');
            if (container) {
                // 重新渲染所有元素卡片+reroll按钮
                let html = '';
                this._createCandidateElements.forEach(elem => {
                    html += `
                        <div class="element-card" onclick="selectElement('${elem}')" 
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
                             onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='#444477'; this.style.boxShadow='none'; this.style.transform='translateY(0)'}">
                            ${elementNames[elem]}
                        </div>
                    `;
                });
                const remaining = this._createMaxRerolls - this._createRerollCount;
                const rerollStyle = remaining <= 0 ? 'opacity:0.3;pointer-events:none;' : '';
                html += `
                    <div class="element-card" id="reroll-btn" onclick="rerollCreateElements()"
                         style="
                            padding: 25px 20px;
                            background: rgba(80, 60, 120, 0.6);
                            border: 2px dashed #8866bb;
                            border-radius: 12px;
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: center;
                            font-size: 16px;
                            color: #bb99dd;
                            min-width: 140px;
                            ${rerollStyle}
                         "
                         onmouseover="this.style.background='rgba(100,80,150,0.8)'; this.style.borderColor='#aa88dd'"
                         onmouseout="this.style.background='rgba(80,60,120,0.6)'; this.style.borderColor='#8866bb'">
                        🔄 重新感知<br><span style="font-size:12px;opacity:0.8">（剩余${remaining}次）</span>
                    </div>
                `;
                container.innerHTML = html;
            }
            const confirmBtn = document.getElementById('confirm-btn');
            if (confirmBtn) confirmBtn.style.opacity = '0.5';
        };

        // 全局函数供内联onclick使用
        window.rerollCreateElements = () => this.rerollCreateElements();

        window.confirmCreate = () => {
            if (!window.confirmEnabled || !window.selectedElement) return;
            const name = document.getElementById('char-name').value || '冒险者';
            Game.createCharacter(name, window.selectedElement);
        };
    },

    // ========== 地图/主界面 ==========
    /**
     * 获取当前目标提示文字（新手引导）
     */
    getCurrentGoalText() {
        const stats = Player.getTotalStats();
        
        // 1. 体力较低提示（v0.9.7: 体力不影响效率）
        if (Player.stamina < 20) {
            return '体力较低！休息可以恢复体力（体力不影响效率，体力为0时战斗后可能受伤）';
        }
        
        // 2. HP不足提示
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
        
        const location = MapSystem.getCurrentLocation();
        const stats = Player.getTotalStats();
        // v0.81.0: 响应式布局检测（竖版手机/横版电脑）
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // 根据地点选择背景图片
        let bgImage = '';
        const locId = location?.id || '';
        if (locId === 'bo_city_street') {
            bgImage = 'assets/images/backgrounds/bo_city_view.jpg';
        }
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; min-height: 100vh; display: flex; flex-direction: column; background: ${location?.backgroundColor || '#1a1a3a'}; position: relative; padding-bottom: 110px;">
                
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
                    padding: 15px 25px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #444477;
                ">
                    <div style="display: flex; gap: 30px; align-items: center;">
                        <div style="color: #ffd700; font-size: 20px; font-weight: bold;">
                            ${location?.name || '未知地点'}
                            ${(() => {
                                // v0.73.0: 显示所属大地图
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
                            ${(() => {
                                // v0.9.8: 地点探索状态标记
                                const isExplored = Player.exploredLocations?.includes(location?.id);
                                if (isExplored) {
                                    return `<span style="font-size: 12px; color: #66ff66; margin-left: 8px; background: rgba(30, 80, 30, 0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid #44aa44;">✓ 已探索</span>`;
                                } else {
                                    return `<span style="font-size: 12px; color: #ffaa44; margin-left: 8px; background: rgba(80, 50, 20, 0.5); padding: 2px 8px; border-radius: 6px; border: 1px solid #aa7744;">❓ 未探索</span>`;
                                }
                            })()}
                            ${(() => {
                                // v0.9.9: 行动探索进度
                                const skipActions = ['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full'];
                                const totalActions = (location?.actions || []).filter(a => !skipActions.includes(a.id)).length;
                                const exploredActions = Player.exploredActions?.[location?.id]?.length || 0;
                                if (totalActions > 0) {
                                    const percent = Math.floor((exploredActions / totalActions) * 100);
                                    const isComplete = exploredActions >= totalActions;
                                    const color = isComplete ? '#66ff66' : percent >= 50 ? '#ffcc44' : '#ff9944';
                                    const icon = isComplete ? '✅' : '📋';
                                    return `<span style="font-size: 12px; color: ${color}; margin-left: 8px; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 6px; border: 1px solid ${color};" title="已探索 ${exploredActions}/${totalActions} 个行动">${icon} 行动探索 ${exploredActions}/${totalActions}</span>`;
                                }
                                return '';
                            })()}
                        </div>
                        ${(() => {
                            // v0.9.1: 探索度显示
                            if (typeof MapSystem.getExplorationProgress === 'function') {
                                const progress = MapSystem.getExplorationProgress();
                                const color = progress.isComplete ? '#66ff66' : progress.percent >= 50 ? '#ffcc44' : '#ff8844';
                                const icon = progress.isComplete ? '🏆' : '🗺️';
                                return `<div style="color: ${color}; font-size: 13px; background: rgba(0,0,0,0.3); padding: 4px 12px; border-radius: 10px; border: 1px solid ${color};" title="已探索 ${progress.explored}/${progress.total} 个地点">${icon} 探索度 ${progress.percent}%</div>`;
                            }
                            return '';
                        })()}
                        ${(() => {
                            // v0.9.2: 疲劳状态显示
                            const fatigue = Player.fatigueLevel || 0;
                            if (fatigue >= 2) {
                                return `<div style="color: #ff4444; font-size: 13px; background: rgba(120, 20, 20, 0.6); padding: 4px 12px; border-radius: 10px; border: 1px solid #ff4444; animation: pulse 1s infinite;" title="重伤状态：攻击-30%，防御-15%">⚠️ 重伤</div>`;
                            } else if (fatigue === 1) {
                                return `<div style="color: #ffaa44; font-size: 13px; background: rgba(100, 60, 20, 0.5); padding: 4px 12px; border-radius: 10px; border: 1px solid #ffaa44;" title="疲劳状态：攻击-15%">😓 疲劳</div>`;
                            }
                            return '';
                        })()}
                        ${(() => {
                            const chapter = (typeof StoryChapterSystem !== 'undefined') ? StoryChapterSystem.getCurrentChapter() : null;
                            if (chapter) {
                                return `<div style="color: #cc99ff; font-size: 13px; background: rgba(80, 40, 120, 0.5); padding: 4px 12px; border-radius: 10px; border: 1px solid #9966cc;">📖 ${chapter.name}</div>`;
                            }
                            return '';
                        })()}
                        <div style="color: #aaa; font-size: 14px;">📅 ${TimeSystem.getDateString()} ${TimeSystem.getDayOfWeekName()} ${TimeSystem.getCurrentPeriodInfo().icon} ${TimeSystem.getCurrentPeriodInfo().name} ${TimeSystem.formatHour()}</div>
                        ${(() => {
                            // v0.9.5: 一键上课 - 有课时显示可点击按钮
                            const currentClass = TimeSystem.getCurrentClass(location);
                            if (currentClass) {
                                const teacher = DataManager.getCharacter(currentClass.teacher);
                                const isAtSchool = location?.id === 'tianlan_school' || location?.id === 'mingwen_girls_school';
                                if (isAtSchool) {
                                    // 在学校：点击直接上课
                                    return `<div onclick="Game.performAction('attend_class')" style="color: #66ffcc; font-size: 13px; background: rgba(30, 80, 60, 0.6); padding: 6px 14px; border-radius: 10px; border: 1px solid #44aa88; cursor: pointer; font-weight: bold;" title="点击直接上课">📚 现在有课：${currentClass.name}（点击上课）</div>`;
                                } else {
                                    // 不在学校：提示前往
                                    return `<div style="color: #ffcc66; font-size: 13px; background: rgba(80, 60, 30, 0.5); padding: 4px 10px; border-radius: 10px; border: 1px solid #aa8844;" title="前往学校上课">📚 有课：${currentClass.name}（前往天兰魔法学院）</div>`;
                                }
                            }
                            return '';
                        })()}
                        ${TimeSystem.isNight() ? `
                            <div style="color: #ff9966; font-size: 13px; background: rgba(100, 50, 50, 0.5); padding: 4px 10px; border-radius: 10px;">
                                🌙 夜晚：敌人更强，奖励 +30%
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <span style="color: #ffd700;">💰 ${Player.gold}</span>
                        <span style="color: #ff6666;">❤️ ${Player.hp}/${stats.maxHp}</span>
                        <span style="color: #6666ff;">💧 ${Player.mp}/${stats.maxMp}</span>
                        ${(() => {
                            // v0.9.0: 体力颜色提示
                            const staminaRatio = Player.stamina / (Player.maxStamina || 100);
                            let staminaColor = '#66ffaa'; // 绿色：精力充沛
                            let staminaIcon = '⚡';
                            if (staminaRatio <= 0) {
                                staminaColor = '#ff4444'; // 红色：精疲力竭
                                staminaIcon = '😫';
                            } else if (staminaRatio <= 0.3) {
                                staminaColor = '#ff8844'; // 橙色：非常疲惫
                                staminaIcon = '😓';
                            } else if (staminaRatio <= 0.6) {
                                staminaColor = '#ffcc44'; // 黄色：有些疲惫
                                staminaIcon = '😅';
                            }
                            // v0.9.7: 体力不影响效率，只在体力为0时战斗可能受伤
                            const staminaTitle = `体力：${staminaRatio > 0.6 ? '精力充沛' : staminaRatio > 0.3 ? '有些疲惫' : staminaRatio > 0 ? '非常疲惫' : '精疲力竭'}（体力不影响修炼和战斗效率，体力为0时战斗可能受伤）`;
                            return `<span style="color: ${staminaColor};" title="${staminaTitle}">${staminaIcon} ${Player.stamina}/${Player.maxStamina}</span>`;
                        })()}
                        <span style="color: #66ff66;">Lv.${Player.level}</span>
                        <!-- v0.9.5: 快速操作按钮 -->
                        ${(() => {
                            const staminaRatio = Player.stamina / (Player.maxStamina || 100);
                            const hpRatio = Player.hp / (stats.maxHp || 1);
                            const mpRatio = Player.mp / (stats.maxMp || 1);
                            const buttons = [];
                            // 体力低时显示快速休息
                            if (staminaRatio < 0.5) {
                                buttons.push(`<span onclick="Game.quickRest()" style="color: #ffaa66; font-size: 13px; background: rgba(100, 60, 20, 0.5); padding: 4px 10px; border-radius: 8px; border: 1px solid #aa7744; cursor: pointer;" title="点击原地休息">💤 休息</span>`);
                            }
                            // HP/MP低时显示一键恢复
                            if (hpRatio < 0.8 || mpRatio < 0.8) {
                                buttons.push(`<span onclick="Game.quickHeal()" style="color: #66ffaa; font-size: 13px; background: rgba(30, 80, 50, 0.5); padding: 4px 10px; border-radius: 8px; border: 1px solid #44aa77; cursor: pointer;" title="点击使用药品恢复">💊 恢复</span>`);
                            }
                            return buttons.join('');
                        })()}
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
                <div class="mobile-main-content" style="flex: 1; display: flex; position: relative; z-index: 1;">
                    
                    <!-- 左侧：地点行动 -->
                    <div class="mobile-action-panel" style="flex: ${isPortrait ? '1' : '2'}; padding: ${isPortrait ? '12px 15px' : '20px 30px'};">
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
                                // v0.81.0: 单个行动按钮渲染（紧凑卡片，描述放tooltip）
                                const renderAction = (action, type) => {
                                    let actionName = action.name;
                                    let actionDesc = action.description;
                                    let expReward = action.effects?.exp || 0;
                                    let isSkippingClass = false;
                                    let isRecommended = false;
                                    let recommendReason = '';
                                    const skipActions = ['rest', 'quick_rest', 'sleep', 'wait', 'quick_wait', 'quick_rest_full'];
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
                                    if (action.staminaCost && action.staminaCost > 0) tooltipText += ` | 体力-${action.staminaCost}`;
                                    if (expReward) tooltipText += ` | 经验+${expReward}`;
                                    if (isRecommended) tooltipText += ` | ${recommendReason}`;
                                    return `
                                    <button class="action-button" onclick="Game.performAction('${action.id}')" title="${tooltipText}" style="
                                        padding: 12px 10px;
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
                                    " onmouseover="this.style.borderColor='${isRecommended ? '#ffee88' : '#9999cc'}'; this.style.transform='scale(1.03)'" onmouseout="this.style.borderColor='${borderColor}'; this.style.transform='scale(1)'">
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-size: 18px;">${action.icon || '🔹'}</span>
                                            <span style="flex: 1; font-weight: bold; font-size: 14px; line-height: 1.3;">${actionName}</span>
                                            ${isRecommended ? '<span style="font-size: 12px;">📜</span>' : ''}
                                        </div>
                                        <div style="font-size: 11px; color: #aabbdd; margin-top: 3px; text-align: right;">
                                            ⏱️${action.timeCost}h${expReward ? ` ✨+${expReward}` : ''}
                                        </div>
                                    </button>`;
                                };
                                // 按类型分组
                                const groups = { cultivation: [], explore: [], social: [], rest: [], special: [] };
                                actions.forEach(a => { groups[getActionType(a)].push(a); });
                                // 渲染分组（v0.81.0: 2列网格）
                                return Object.keys(groups).filter(type => groups[type].length > 0).map(type => {
                                    const cfg = typeConfig[type];
                                    return `
                                        <div style="margin-top: ${type === Object.keys(groups).find(t => groups[t].length > 0) ? '0' : '10px'};">
                                            <div style="color: ${cfg.color}; font-size: 12px; font-weight: bold; margin-bottom: 5px;">${cfg.label}</div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
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

                        <!-- 原地休息（所有地点可用） -->
                        <button onclick="Game.quickRest()" style="
                            margin-top: 15px;
                            width: 100%;
                            padding: 15px 25px;
                            background: linear-gradient(135deg, rgba(40, 80, 40, 0.8), rgba(60, 120, 60, 0.8));
                            border: 2px solid ${Player.stamina < Player.maxStamina * 0.3 ? '#ff8844' : '#448844'};
                            border-radius: 10px;
                            color: #ddffdd;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 16px;
                            ${Player.stamina < Player.maxStamina * 0.3 ? 'box-shadow: 0 0 10px rgba(255, 136, 68, 0.5);' : ''}
                        " onmouseover="this.style.borderColor='${Player.stamina < Player.maxStamina * 0.3 ? '#ffaa66' : '#66bb66'}'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${Player.stamina < Player.maxStamina * 0.3 ? '#ff8844' : '#448844'}'; this.style.transform='translateX(0)'">
                            <div style="font-size: 18px; margin-bottom: 5px;">
                                💚 原地休息
                                <span style="font-size: 12px; color: #ffcc88; float: right;">消耗1小时</span>
                            </div>
                            <div style="font-size: 13px; color: #99bb99;">稍作休息，恢复30%HP、20%MP和30点体力（战斗外随时可用）</div>
                        </button>

                        <!-- v0.9.1: 快速休息（恢复全部状态） -->
                        <button onclick="Game.quickRestFull()" style="
                            margin-top: 10px;
                            width: 100%;
                            padding: 15px 25px;
                            background: linear-gradient(135deg, rgba(60, 40, 80, 0.8), rgba(100, 60, 140, 0.8));
                            border: 2px solid ${Player.stamina < Player.maxStamina * 0.3 ? '#ff8844' : '#8855aa'};
                            border-radius: 10px;
                            color: #eeddff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 16px;
                            ${Player.stamina < Player.maxStamina * 0.3 ? 'box-shadow: 0 0 10px rgba(255, 136, 68, 0.5);' : ''}
                        " onmouseover="this.style.borderColor='${Player.stamina < Player.maxStamina * 0.3 ? '#ffaa66' : '#aa77cc'}'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${Player.stamina < Player.maxStamina * 0.3 ? '#ff8844' : '#8855aa'}'; this.style.transform='translateX(0)'">
                            <div style="font-size: 18px; margin-bottom: 5px;">
                                💜 快速休息
                                <span style="font-size: 12px; color: #ffcc88; float: right;">消耗1小时</span>
                            </div>
                            <div style="font-size: 13px; color: #bb99dd;">充分休息，HP/MP/体力全部恢复到满，消除疲劳（状态全满时不消耗时间）</div>
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

                        <!-- 事件追踪 -->
                        <button onclick="EncounterSystem.showEventTracker()" style="
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
                        " onmouseover="this.style.borderColor='#ddbb55'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#aa8833'; this.style.transform='translateX(0)'">
                            <div style="font-size: 16px;">
                                📜 事件追踪
                                <span style="font-size: 12px; color: #ffaa44; float: right;" id="event-count-badge"></span>
                            </div>
                            <div style="font-size: 12px; color: #bb9966;">查看可触发的特殊事件</div>
                        </button>

                        <!-- 等待时间 -->
                        <div style="margin-top: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 12px 15px;">
                            <div style="color: #ccc; font-size: 13px; margin-bottom: 8px;">
                                ⏰ ${TimeSystem.getDetailedTimeDescription()}
                            </div>
                            <button onclick="Game.showWaitMenu()" style="
                                width: 100%;
                                padding: 10px 15px;
                                background: linear-gradient(135deg, rgba(60, 60, 100, 0.8), rgba(80, 80, 140, 0.8));
                                border: 1px solid #555588;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 14px;
                            ">等待时间...</button>
                        </div>
                    </div>
                    
                    <!-- 右侧：菜单（竖版隐藏，靠底部导航） -->
                    <div class="mobile-side-menu" style="width: 280px; background: rgba(0, 0, 0, 0.4); border-left: 2px solid #444477; padding: 20px; display: ${isPortrait ? 'none' : 'block'};">
                        <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 18px;">📋 菜单</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="color: #8899cc; font-size: 12px; padding: 0 5px; margin-bottom: -5px;">🎯 核心功能</div>

                            <button onclick="Game.openCharacterPanel()" style="
                                padding: 12px;
                                background: rgba(40, 40, 80, 0.8);
                                border: 1px solid #444477;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">👤 角色属性</button>
                            
                            <button onclick="Game.openInventory()" style="
                                padding: 12px;
                                background: rgba(40, 40, 80, 0.8);
                                border: 1px solid #444477;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">🎒 背包</button>
                            
                            <button onclick="Game.openQuestLog()" style="
                                padding: 12px;
                                background: rgba(40, 40, 80, 0.8);
                                border: 1px solid #444477;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">📜 任务</button>
                            
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #555577, transparent); margin: 8px 0;"></div>
                            <div style="color: #7788aa; font-size: 12px; padding: 0 5px;">📚 信息与收集</div>

                            <button onclick="Game.openIntelPanel()" style="
                                padding: 12px;
                                background: rgba(40, 40, 80, 0.8);
                                border: 1px solid #444477;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">🔍 情报</button>
                            
                            <button onclick="Game.openReputationPanel()" style="
                                padding: 12px;
                                background: rgba(40, 40, 80, 0.8);
                                border: 1px solid #444477;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">⭐ 声望</button>
                            
                            <button onclick="UI.showAchievementPanel()" style="
                                padding: 12px;
                                background: rgba(60, 50, 30, 0.8);
                                border: 1px solid #776644;
                                border-radius: 8px;
                                color: #fff0d0;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">🏆 成就</button>
                            
                            <button onclick="Game.openHelpPanel()" style="
                                padding: 12px;
                                background: rgba(40, 40, 80, 0.8);
                                border: 1px solid #444477;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">❓ 帮助</button>
                            
                            <button onclick="Game.openBestiary()" style="
                                padding: 12px;
                                background: rgba(60, 30, 30, 0.8);
                                border: 1px solid #774444;
                                border-radius: 8px;
                                color: #ffd0d0;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">📖 妖魔图鉴</button>
                            
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #555577, transparent); margin: 8px 0;"></div>
                            <div style="color: #7788aa; font-size: 12px; padding: 0 5px;">📅 日常活动</div>

                            <button onclick="Game.openDaily()" style="
                                padding: 12px;
                                background: rgba(30, 60, 60, 0.8);
                                border: 1px solid #447777;
                                border-radius: 8px;
                                color: #d0ffff;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">📋 日常${DailySystem.getUnclaimedCount() > 0 ? ` <span style="color: #ff6666; font-weight: bold;">(${DailySystem.getUnclaimedCount()})</span>` : ''}</button>
                            
                            <div style="height: 1px; background: linear-gradient(90deg, transparent, #557755, transparent); margin: 8px 0;"></div>
                            <div style="color: #88aa88; font-size: 12px; padding: 0 5px;">⚡ 快捷操作</div>

                            <button onclick="Game.rest()" style="
                                padding: 14px;
                                background: linear-gradient(135deg, rgba(40, 80, 40, 0.9), rgba(60, 100, 60, 0.9));
                                border: 2px solid #66aa66;
                                border-radius: 10px;
                                color: #d0ffd0;
                                cursor: pointer;
                                font-size: 15px;
                                font-weight: bold;
                                text-align: left;
                                box-shadow: 0 0 10px rgba(100, 200, 100, 0.2);
                            ">😴 休息到明天</button>
                            
                            <button onclick="Game.saveGame()" style="
                                padding: 14px;
                                background: linear-gradient(135deg, rgba(80, 80, 40, 0.9), rgba(100, 100, 60, 0.9));
                                border: 2px solid #aaaa66;
                                border-radius: 10px;
                                color: #ffffd0;
                                cursor: pointer;
                                font-size: 15px;
                                font-weight: bold;
                                text-align: left;
                                box-shadow: 0 0 10px rgba(200, 200, 100, 0.2);
                            ">💾 保存游戏</button>
                        </div>
                        
                        <!-- 经验条 -->
                        <div style="margin-top: 30px;">
                            <div style="color: #aaa; font-size: 13px; margin-bottom: 5px;">
                                经验: ${Player.exp} / ${Player.expToNext}
                            </div>
                            <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${(Player.exp / Player.expToNext * 100).toFixed(1)}%; background: linear-gradient(90deg, #66ff66, #99ff99); transition: width 0.3s;"></div>
                            </div>
                        </div>
                        
                        <!-- 元素列表 -->
                        <div style="margin-top: 20px;">
                            <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">已觉醒元素：</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${Player.elements.map(elem => `
                                    <span style="
                                        padding: 4px 10px;
                                        background: ${SkillSystem.getElementColor(elem)}22;
                                        border: 1px solid ${SkillSystem.getElementColor(elem)};
                                        border-radius: 12px;
                                        font-size: 12px;
                                        color: ${SkillSystem.getElementColor(elem)};
                                    ">${SkillSystem.getElementName(elem)}</span>
                                `).join('')}
                            </div>
                        </div>
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
                    <button onclick="Game.saveGame()" style="flex:1;padding:14px 8px;background:linear-gradient(135deg,rgba(70,70,40,0.9),rgba(100,100,60,0.9));border:2px solid #aaaa55;border-radius:12px;color:#ffffaa;cursor:pointer;font-size:18px;font-weight:bold;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all 0.2s;" onmouseover="this.style.background='linear-gradient(135deg,rgba(100,100,60,0.9),rgba(130,130,80,0.9))'" onmouseout="this.style.background='linear-gradient(135deg,rgba(70,70,40,0.9),rgba(100,100,60,0.9))'">
                        <span style="font-size:24px;">💾</span><span style="font-size:11px;">保存</span>
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
                    <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1;">
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
                        const size = node.isCurrent ? 60 : 50;
                        const bgColor = node.isCurrent ? 'rgba(100, 255, 150, 0.9)' : node.unlocked ? 'rgba(80, 100, 160, 0.9)' : 'rgba(60, 60, 60, 0.7)';
                        const borderColor = node.isCurrent ? '#66ff88' : node.unlocked ? '#8899cc' : '#555';
                        const cursor = node.unlocked && !node.isCurrent ? 'pointer' : 'default';
                        const glow = node.isCurrent ? 'box-shadow: 0 0 20px rgba(100, 255, 150, 0.6), 0 0 40px rgba(100, 255, 150, 0.3);' : '';
                        const onClick = node.unlocked && !node.isCurrent ? `onclick="Game.travelTo('${node.id}')"` : '';

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
                            <div class="map-node-wrapper" style="position: absolute; left: ${node.x}%; top: ${node.y}%; transform: translate(-50%, -50%); z-index: 2;">
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
        
        this.elements.gameContainer.innerHTML = `
            <div id="battle-screen" style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(to bottom, #1a1a3a, #2a2a5a); position: relative;">
                
                <!-- 战斗背景 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/fire_magic.jpg') center/cover;
                    opacity: 0.12;
                    filter: blur(2px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <!-- 战斗场地 -->
                <div style="flex: 1; position: relative; overflow: hidden; z-index: 1;">
                    
                    <!-- 战斗日志 -->
                    <div id="battle-log" style="
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        width: 340px;
                        max-height: 280px;
                        overflow-y: auto;
                        background: rgba(0, 0, 0, 0.7);
                        border: 1px solid #555;
                        border-radius: 10px;
                        padding: 12px;
                        font-size: 13px;
                        line-height: 1.7;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
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
                        position: absolute;
                        bottom: 60px;
                        left: 15%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <div style="
                            width: 100px;
                            height: 140px;
                            background: linear-gradient(180deg, #6666cc, #4444aa);
                            border-radius: 50px 50px 10px 10px;
                            margin-bottom: 10px;
                            box-shadow: 0 0 30px rgba(100, 100, 255, 0.4);
                            transition: all 0.3s;
                        " id="player-sprite"></div>
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
                        position: absolute;
                        bottom: 60px;
                        right: 15%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <div style="
                            width: 110px;
                            height: 150px;
                            background: linear-gradient(180deg, ${state.enemy.spriteColor || '#663399'}, ${state.enemy.spriteColor || '#442266'}dd);
                            border-radius: 55px 55px 10px 10px;
                            margin-bottom: 10px;
                            box-shadow: 0 0 30px ${state.enemy.spriteColor || '#663399'}60;
                        " id="enemy-sprite"></div>
                        <div style="font-size: 18px; font-weight: bold; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                            ${state.enemy.name}
                            <span style="font-size: 14px; color: #ffcc66;">Lv.${state.enemy.level}</span>
                            ${state.enemy.isElite ? '<span style="color: #ff6600;"> ⭐精英</span>' : ''}
                        </div>
                        ${state.enemy.title ? `<div style="font-size: 12px; color: #ff9966; margin-bottom: 8px;">${state.enemy.title}</div>` : ''}
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
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        background: rgba(0, 0, 0, 0.6);
                        border-radius: 8px;
                        font-size: 16px;
                        color: ${state.isPlayerTurn ? '#66ff66' : '#ff6666'};
                        text-align: right;
                    ">
                        ${state.battleOptions && state.battleOptions.mode !== 'normal' ? `<div style="font-size: 12px; color: #ffcc66; margin-bottom: 4px;">${
                            state.battleOptions.mode === 'duel' ? '⚔️ 决斗模式' :
                            state.battleOptions.mode === 'gauntlet' ? '🔄 车轮战' :
                            state.battleOptions.mode === 'hunt' ? '🏹 狩猎战' :
                            state.battleOptions.mode === 'boss' ? '👑 Boss战' :
                            state.battleOptions.mode
                        }</div>` : ''}
                        <div>第 ${state.turn} 回合 - ${state.isPlayerTurn ? '你的回合' : '敌人回合'}</div>
                    </div>
                    
                    <!-- 战斗速度按钮 -->
                    <button onclick="BattleSystem.toggleSpeed()" style="
                        position: absolute;
                        top: 70px;
                        right: 20px;
                        padding: 8px 16px;
                        background: linear-gradient(135deg, #333366, #444488);
                        border: 2px solid #6666aa;
                        border-radius: 8px;
                        color: #aaccff;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        z-index: 10;
                    " onmouseover="this.style.boxShadow='0 0 10px rgba(100, 150, 255, 0.5)'" onmouseout="this.style.boxShadow='none'">
                        ⏩ ${state.speed || 1}x 速度
                    </button>
                    
                    <!-- 自动战斗按钮 -->
                    <button onclick="BattleSystem.toggleAutoBattle()" style="
                        position: absolute;
                        top: 120px;
                        right: 20px;
                        padding: 8px 16px;
                        background: ${state.autoBattle ? 'linear-gradient(135deg, #663333, #aa4444)' : 'linear-gradient(135deg, #666633, #888844)'};
                        border: 2px solid ${state.autoBattle ? '#ff6666' : '#aaaa66'};
                        border-radius: 8px;
                        color: ${state.autoBattle ? '#ffaaaa' : '#ddddaa'};
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        z-index: 10;
                    " onmouseover="this.style.boxShadow='0 0 10px rgba(200, 200, 100, 0.5)'" onmouseout="this.style.boxShadow='none'">
                        ${state.autoBattle ? '🤖 自动中' : '🤖 自动'}
                    </button>
                    
                    <!-- 战斗帮助按钮 -->
                    <button onclick="BattleSystem.showHelp()" style="
                        position: absolute;
                        top: 170px;
                        right: 20px;
                        padding: 8px 16px;
                        background: linear-gradient(135deg, #336633, #448844);
                        border: 2px solid #66aa66;
                        border-radius: 8px;
                        color: #aaffaa;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        z-index: 10;
                    " onmouseover="this.style.boxShadow='0 0 10px rgba(100, 255, 150, 0.5)'" onmouseout="this.style.boxShadow='none'">
                        ❓ 帮助
                    </button>
                </div>
                
                <!-- 技能/操作面板 -->
                <div style="
                    height: 220px;
                    background: linear-gradient(to top, rgba(10, 10, 30, 0.98), rgba(20, 20, 50, 0.9));
                    border-top: 3px solid #4a4a8a;
                    padding: 15px 25px;
                ">
                    <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                        <button onclick="Game.battleAttack()" ${!state.isPlayerTurn ? 'disabled' : ''} style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #553333, #774444);
                            border: 2px solid #885555;
                            border-radius: 8px;
                            color: #ffcccc;
                            cursor: ${state.isPlayerTurn ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn ? 1 : 0.5};
                        ">👊 普攻</button>
                        
                        ${(BattleSystem.lastSkillId && SkillSystem.getSkill(BattleSystem.lastSkillId)) ? (() => {
                            const lastSkill = SkillSystem.getSkill(BattleSystem.lastSkillId);
                            const canRepeat = state.isPlayerTurn && Player.mp >= lastSkill.mpCost;
                            return `<button onclick="Game.battleRepeatSkill()" ${!canRepeat ? 'disabled' : ''}
                                title="重复上次技能：${lastSkill.name}（消耗${lastSkill.mpCost}MP）"
                                style="
                                    padding: 10px 20px;
                                    background: linear-gradient(135deg, #335555, #446666);
                                    border: 2px solid #557777;
                                    border-radius: 8px;
                                    color: #ccffee;
                                    cursor: ${canRepeat ? 'pointer' : 'not-allowed'};
                                    font-size: 15px;
                                    opacity: ${canRepeat ? 1 : 0.5};
                                ">🔄 ${lastSkill.name}(${lastSkill.mpCost})</button>`;
                        })() : ''}
                        
                        <button onclick="Game.battleDefend()" ${!state.isPlayerTurn ? 'disabled' : ''} 
                                title="防御：减少50%受到的伤害，并恢复10%最大MP"
                                style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #334455, #445566);
                            border: 2px solid #556677;
                            border-radius: 8px;
                            color: #cce0ff;
                            cursor: ${state.isPlayerTurn ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn ? 1 : 0.5};
                        ">🛡️ 防御</button>
                        
                        <button onclick="Game.battleMeditate()" ${!state.isPlayerTurn ? 'disabled' : ''} 
                                title="冥想：集中精神恢复25%最大MP和10%最大HP，本回合无法行动"
                                style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #443355, #554466);
                            border: 2px solid #665577;
                            border-radius: 8px;
                            color: #ddccff;
                            cursor: ${state.isPlayerTurn ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn ? 1 : 0.5};
                        ">🧘 冥想</button>
                        
                        <button onclick="Game.battleFlee()" ${!state.isPlayerTurn || !state.options?.canFlee ? 'disabled' : ''} style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #555533, #666644);
                            border: 2px solid #777755;
                            border-radius: 8px;
                            color: #ffffcc;
                            cursor: ${state.isPlayerTurn && state.options?.canFlee ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn && state.options?.canFlee ? 1 : 0.4};
                        ">🏃 逃跑</button>
                        
                        <button onclick="Game.battleShowItems()" ${!state.isPlayerTurn || !state.options?.canUseItems ? 'disabled' : ''} style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #335544, #446655);
                            border: 2px solid #557766;
                            border-radius: 8px;
                            color: #ccffdd;
                            cursor: ${state.isPlayerTurn && state.options?.canUseItems ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn && state.options?.canUseItems ? 1 : 0.4};
                        ">🎒 道具</button>
                    </div>
                    
                    <div style="color: #ffd700; font-size: 18px; margin-bottom: 10px; font-weight: bold;">✨ 魔法技能（点击释放）</div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                        ${state.player.skills.map(skillId => {
                            const skill = SkillSystem.getSkill(skillId);
                            if (!skill) return '';
                            const canUse = state.isPlayerTurn && state.player.mp >= skill.mpCost;
                            // v0.15.0: 技能记忆推荐 - 对当前妖魔上次使用的技能
                            const enemyId = state.enemy && state.enemy.id;
                            const isRecommended = enemyId && Player.skillMemory && Player.skillMemory[enemyId] === skillId;
                            // 检查元素克制
                            let isCounter = false;
                            let isWeak = false;
                            if (skill.element && state.enemy.elements && BattleSystem.checkElementCounter) {
                                for (const enemyElem of state.enemy.elements) {
                                    const counter = BattleSystem.checkElementCounter(skill.element, enemyElem);
                                    if (counter.effect === 'super') isCounter = true;
                                    if (counter.effect === 'weak') isWeak = true;
                                }
                            }
                            const borderColor = isRecommended ? '#ffdd44' : isCounter ? '#44ff66' : isWeak ? '#ff4466' : SkillSystem.getElementColor(skill.element);
                            return `
                                <button onclick="Game.battleUseSkill('${skillId}')" ${!canUse ? 'disabled' : ''}
                                        title="${this.getSkillTooltipText(skill)}${isCounter ? ' [元素克制！伤害+50%]' : isWeak ? ' [元素抵抗，伤害-30%]' : ''}"
                                        style="
                                    padding: 12px;
                                    background: linear-gradient(135deg, ${isCounter ? '#226633' : isWeak ? '#662233' : SkillSystem.getElementColor(skill.element)}22, ${isCounter ? '#33aa55' : isWeak ? '#aa3355' : SkillSystem.getElementColor(skill.element)}44);
                                    border: 2px solid ${borderColor};
                                    border-radius: 8px;
                                    color: #fff;
                                    cursor: ${canUse ? 'pointer' : 'not-allowed'};
                                    text-align: center;
                                    opacity: ${canUse ? 1 : 0.4};
                                    transition: all 0.2s;
                                    ${isCounter ? 'box-shadow: 0 0 12px #44ff6680; animation: pulse 1.5s infinite;' : isWeak ? 'box-shadow: 0 0 8px #ff446660;' : ''}
                                " ${canUse ? 'onmouseover="this.style.boxShadow=\'0 0 15px ' + (isCounter ? '#44ff66' : isWeak ? '#ff4466' : SkillSystem.getElementColor(skill.element)) + '80\'" onmouseout="this.style.boxShadow=\'' + (isCounter ? '0 0 12px #44ff6680' : isWeak ? '0 0 8px #ff446660' : 'none') + '\'"' : ''}>
                                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
                                        ${(() => {
                                            const elemIcons = { fire: '🔥', ice: '❄️', thunder: '⚡', earth: '🪨', wind: '🌪️', water: '💧', light: '✨', dark: '🌑', heal: '💚', summon: '🐺', neutral: '⚔️' };
                                            return elemIcons[skill.element] || '';
                                        })()}
                                        ${skill.name}
                                        ${isRecommended ? '<span style="color: #ffdd44; font-size: 10px; font-weight: bold;"> ⭐推荐</span>' : isCounter ? '<span style="color: #44ff66; font-size: 10px; font-weight: bold;"> 克制!</span>' : isWeak ? '<span style="color: #ff4466; font-size: 10px; font-weight: bold;"> 抵抗</span>' : ''}
                                        ${state.player.skillLevels && state.player.skillLevels[skillId] ? `<span style="font-size: 11px; color: #ffcc66;"> Lv.${state.player.skillLevels[skillId].level || 1}</span>` : ''}
                                    </div>
                                    <div style="font-size: 12px; color: ${state.player.mp >= skill.mpCost ? '#aaccff' : '#ff6666'};">
                                        MP: ${skill.mpCost}${state.player.mp < skill.mpCost ? ' (不足)' : ''}
                                    </div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                    
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
        
        // 创建伤害数字元素
        const damageEl = document.createElement('div');
        
        // 根据类型设置颜色
        const colors = {
            normal: '#ffffff',
            crit: '#ffff44',
            magic: '#ffcc66',
            counter: '#ff6644',
            weakness: '#ff44ff',
            heal: '#66ff66'
        };
        const color = colors[type] || colors.normal;
        
        // 根据类型设置图标/文字
        let prefix = '';
        if (type === 'crit') prefix = '💥 ';
        if (type === 'counter') prefix = '⚡ ';
        if (type === 'weakness') prefix = '✨ ';
        if (type === 'heal') prefix = '💚 ';
        
        damageEl.textContent = prefix + (type === 'heal' ? '+' : '-') + amount;
        damageEl.style.cssText = `
            position: absolute;
            ${isPlayer ? 'left: 15%;' : 'right: 15%;'}
            bottom: 200px;
            font-size: 28px;
            font-weight: bold;
            color: ${color};
            text-shadow: 0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            z-index: 100;
            animation: damageFloat 1.5s ease-out forwards;
            transform: translateX(-50%);
        `;
        
        // 添加动画样式（如果还没有的话）
        if (!document.getElementById('damage-number-style')) {
            const style = document.createElement('style');
            style.id = 'damage-number-style';
            style.textContent = `
                @keyframes damageFloat {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) translateY(0) scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: translateX(-50%) translateY(-20px) scale(1.2);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-80px) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        battleScreen.appendChild(damageEl);
        
        // 动画结束后移除
        setTimeout(() => {
            if (damageEl.parentNode) {
                damageEl.remove();
            }
        }, 1500);
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
    renderBigEventNarrativePhase(phase, hasNextPhase) {
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
                                    ${choice.conditions ? `<div style="font-size: 12px; color: #888; margin-top: 5px; margin-left: 20px;">（需要满足特定条件）</div>` : ''}
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
                                        <div onclick="${item.canAfford ? `Game.buyItem('${item.itemId}')` : ''}" 
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
                
                <div style="flex: 1; display: flex; overflow: hidden; position: relative; z-index: 1;">
                    
                    <!-- 装备栏 -->
                    <div style="width: 300px; padding: 25px; border-right: 2px solid #445566;">
                        <h3 style="color: #ffd700; margin-bottom: 20px;">⚔️ 装备</h3>
                        
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
                                                const enhancedValue = Math.floor(v * (1 + enhanceLevel * 0.1));
                                                return `${statNames[k] || k}: +${enhancedValue}${enhanceLevel > 0 ? ` <span style="color:#66ff88;">(基础${v})</span>` : ''}`;
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
                                                    const currentVal = Math.floor(v * (1 + enhanceLevel * 0.1));
                                                    const nextVal = Math.floor(v * (1 + (enhanceLevel + 1) * 0.1));
                                                    const diff = nextVal - currentVal;
                                                    return `${statNames[k] || k}+${diff}`;
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
                    <div style="flex: 1; padding: 25px; overflow-y: auto;">
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

    // ========== 帮助界面 ==========
    renderHelpScreen() {
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a3a, #2a3a4a); position: relative;">
                
                <!-- 背景图片 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/fire_magic.jpg') center/cover;
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
                    <h2 style="color: #ffd700; font-size: 26px;">❓ 游戏帮助</h2>
                    <div onclick="Game.closeHelpPanel()" style="
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
                    <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 25px;">
                        
                        <!-- 游戏简介 -->
                        <div style="
                            padding: 20px;
                            background: rgba(30, 40, 60, 0.8);
                            border: 2px solid #446677;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">🎮 游戏简介</h3>
                            <p style="color: #cccccc; line-height: 1.8; font-size: 14px;">
                                这是一个基于《全职法师》世界观的开放世界 RPG 游戏。你将扮演一名刚觉醒魔法的新生，在博城开始你的魔法之旅。
                                你可以自由探索、修炼、交友、冒险。你的选择会影响这个世界，影响你和 NPC 之间的关系，甚至改变某些人的命运。
                            </p>
                        </div>
                        
                        <!-- 基本操作 -->
                        <div style="
                            padding: 20px;
                            background: rgba(30, 40, 60, 0.8);
                            border: 2px solid #446677;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">🖱️ 基本操作</h3>
                            <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                                <li><strong>地图界面</strong>：点击行动按钮执行操作，点击地点移动</li>
                                <li><strong>战斗界面</strong>：点击技能按钮释放魔法，点击防御/道具/逃跑</li>
                                <li><strong>对话界面</strong>：点击选项进行对话选择</li>
                                <li><strong>右侧菜单</strong>：查看角色、背包、任务、情报、声望等</li>
                            </ul>
                        </div>
                        
                        <!-- 核心系统 -->
                        <div style="
                            padding: 20px;
                            background: rgba(30, 40, 60, 0.8);
                            border: 2px solid #446677;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">⚔️ 战斗系统</h3>
                            <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                                <li><strong>星子引导</strong>：魔法不是瞬发，需要引导时间，引导中可以被打断</li>
                                <li><strong>元素克制</strong>：每个元素有独特的战斗风格和克制关系</li>
                                <li><strong>状态效果</strong>：灼烧、冻结、麻痹、减速、中毒等</li>
                                <li><strong>精英怪</strong>：10%概率遇到精英怪，属性提升50%，奖励翻倍</li>
                                <li><strong>死亡惩罚</strong>：掉10%经验、掉20%金币、30%概率掉一个物品</li>
                            </ul>
                        </div>
                        
                        <div style="
                            padding: 20px;
                            background: rgba(30, 40, 60, 0.8);
                            border: 2px solid #446677;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">⏰ 时间与体力</h3>
                            <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                                <li><strong>时间系统</strong>：每个行动消耗时间，一天分为多个时段，特定时段有课程</li>
                                <li><strong>体力系统</strong>：体力是<strong>软限制</strong>，不会阻止行动！<strong>体力不影响修炼和战斗效率</strong>，体力为0时战斗后有概率受伤</li>
                                <li><strong>体力耗尽</strong>：体力为0时战斗后有概率受伤（疲劳/重伤），休息后恢复</li>
                                <li><strong>休息恢复</strong>：休息可以恢复 HP、MP 和体力，消除疲劳状态</li>
                                <li><strong>移动零消耗</strong>：地点之间旅行不消耗体力，只消耗0.5小时</li>
                                <li><strong>大事件</strong>：特定天数会触发大事件，提前准备很重要</li>
                            </ul>
                        </div>
                        
                        <div style="
                            padding: 20px;
                            background: rgba(30, 40, 60, 0.8);
                            border: 2px solid #446677;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">💬 NPC 与关系</h3>
                            <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                                <li><strong>关系系统</strong>：好感、信任、熟悉度三维关系，14个关系等级</li>
                                <li><strong>对话树</strong>：不同选择有不同结果，会影响关系</li>
                                <li><strong>NPC 分布</strong>：不同地点有不同的 NPC，去对的地方才能找到人</li>
                                <li><strong>情报收集</strong>：和 NPC 对话可以获得各种情报和线索</li>
                            </ul>
                        </div>
                        
                        <div style="
                            padding: 20px;
                            background: rgba(30, 40, 60, 0.8);
                            border: 2px solid #446677;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">⭐ 势力声望</h3>
                            <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                                <li><strong>5 大势力</strong>：天澜魔法高中、穆氏家族、猎魔者公会、魔法协会、黑教廷</li>
                                <li><strong>7 个等级</strong>：仇恨、敌对、冷淡、中立、友好、尊敬、崇拜</li>
                                <li><strong>声望效果</strong>：商店折扣、任务奖励加成、考核奖励加成等</li>
                                <li><strong>提升声望</strong>：完成势力相关的任务、帮助 NPC 等</li>
                            </ul>
                        </div>
                        
                        <!-- 小技巧 -->
                        <div style="
                            padding: 20px;
                            background: rgba(60, 50, 30, 0.8);
                            border: 2px solid #776644;
                            border-radius: 12px;
                        ">
                            <h3 style="color: #ffcc66; font-size: 20px; margin-bottom: 12px;">💡 游戏小技巧</h3>
                            <ul style="color: #ddddcc; line-height: 2; font-size: 14px; padding-left: 20px;">
                                <li>多和 NPC 聊天，可以获得情报和任务</li>
                                <li>注意收集情报，大事件来临前会有各种暗示</li>
                                <li>体力是软限制，不会阻止行动，<strong>不影响效率</strong>，体力为0战斗后可能受伤</li>
                                <li>战斗时注意元素克制，用对元素事半功倍</li>
                                <li>提升势力声望可以获得商店折扣和更多奖励</li>
                                <li>探索不同地点，会遇到不同的 NPC 和事件</li>
                                <li>游戏会自动保存，不用担心进度丢失</li>
                            </ul>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;
    },

    // ========== 妖魔图鉴 ==========
    renderBestiary() {
        const stats = Player.getBestiaryStats();
        const enemies = Object.values(DataManager.getAllEnemies());
        const elementColors = {
            fire: '#ff4444', ice: '#44aaff', thunder: '#ffff44', earth: '#aa8844',
            wind: '#88ff88', water: '#4488ff', light: '#ffffff', dark: '#aa44ff', neutral: '#888888'
        };
        const elementNames = {
            fire: '火', ice: '冰', thunder: '雷', earth: '土',
            wind: '风', water: '水', light: '光', dark: '暗', neutral: '无'
        };

        // 按等级排序
        const sortedEnemies = enemies.sort((a, b) => (a.level || 1) - (b.level || 1));

        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a1520, #2a1a25); position: relative;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    background: rgba(0, 0, 0, 0.6);
                    border-bottom: 2px solid #664444;
                    position: relative;
                    z-index: 1;
                ">
                    <h2 style="color: #ff6666; font-size: 26px;">📖 妖魔图鉴</h2>
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <span style="color: #aaa; font-size: 14px;">已发现 <strong style="color: #ffaa44;">${stats.discovered}</strong> / ${stats.totalEnemies} | 总击杀 <strong style="color: #ff6666;">${stats.totalKills}</strong></span>
                        <div onclick="Game.closeBestiary()" style="
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

                <div style="flex: 1; padding: 25px; overflow-y: auto; position: relative; z-index: 1;">
                    <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                        ${sortedEnemies.map(enemy => {
                            const record = Player.bestiary[enemy.id];
                            const discovered = !!record;
                            const elements = enemy.elements || (enemy.element ? [enemy.element] : ['neutral']);
                            const rankColors = { '奴仆级': '#88aa88', '战将级': '#44aaff', '统领级': '#ff44ff', '君主级': '#ff4444' };
                            const rank = enemy.rank || '奴仆级';
                            const rankColor = rankColors[rank] || '#888';

                            if (!discovered) {
                                return `
                                    <div style="
                                        padding: 15px;
                                        background: rgba(20, 20, 30, 0.8);
                                        border: 1px solid #333;
                                        border-radius: 10px;
                                        opacity: 0.6;
                                    ">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="font-size: 32px; filter: grayscale(1) brightness(0.3);">❓</div>
                                            <div>
                                                <div style="color: #555; font-size: 16px; font-weight: bold;">未发现</div>
                                                <div style="color: #444; font-size: 12px;">击败此妖魔后解锁</div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }

                            const drops = (enemy.dropItems || []).slice(0, 3).map(d => {
                                const item = DataManager.getItem(d.itemId);
                                return item ? item.name : d.itemId;
                            }).join('、') || '无';

                            return `
                                <div style="
                                    padding: 15px;
                                    background: rgba(40, 25, 30, 0.85);
                                    border: 1px solid #553333;
                                    border-radius: 10px;
                                    transition: transform 0.2s;
                                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <div style="font-size: 28px;">${enemy.spriteColor ? '👹' : '👾'}</div>
                                            <div>
                                                <div style="color: #ffcc88; font-size: 16px; font-weight: bold;">${enemy.name}</div>
                                                <div style="display: flex; gap: 6px; margin-top: 4px;">
                                                    ${elements.map(e => `<span style="
                                                        padding: 1px 8px;
                                                        background: ${elementColors[e] || '#888'}22;
                                                        border: 1px solid ${elementColors[e] || '#888'};
                                                        border-radius: 10px;
                                                        font-size: 11px;
                                                        color: ${elementColors[e] || '#888'};
                                                    ">${elementNames[e] || e}</span>`).join('')}
                                                </div>
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="color: ${rankColor}; font-size: 12px; font-weight: bold;">${rank}</div>
                                            <div style="color: #aaa; font-size: 12px;">Lv.${enemy.level || '?'}</div>
                                        </div>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 12px; color: #bbb; margin-bottom: 8px;">
                                        <span>❤️ HP: ${enemy.maxHp || '?'}</span>
                                        <span>⚔️ 攻击: ${enemy.attack || '?'}</span>
                                        <span>🛡️ 防御: ${enemy.defense || '?'}</span>
                                        <span>💨 速度: ${enemy.speed || '?'}</span>
                                    </div>
                                    <div style="border-top: 1px solid #443333; padding-top: 8px; display: flex; justify-content: space-between; font-size: 12px;">
                                        <span style="color: #ff8888;">击杀数: ${record.kills}</span>
                                        <span style="color: #888; font-size: 11px;">掉落: ${drops}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
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
                                        <div style="
                                            padding: 8px 12px;
                                            background: ${rarityConfig.color}11;
                                            border: 1px solid ${rarityConfig.color}55;
                                            border-radius: 8px;
                                            margin-bottom: 6px;
                                            font-size: 13px;
                                        " title="${talentTooltip.replace(/"/g, '&quot;')}">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                                <span>
                                                    <span style="color: ${SkillSystem.getElementColor(elem)}; font-weight: bold;">${SkillSystem.getElementName(elem)}</span>
                                                    <span style="color: ${rarityConfig.color}; margin-left: 8px;">${talent.name}</span>
                                                </span>
                                                <span style="color: #888; font-size: 12px;">Lv.${talentData.level}${talentData.level >= maxLevel ? ' (满)' : ''}</span>
                                            </div>
                                            ${stageInfo}
                                            ${talentData.level < maxLevel ? `
                                            <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-top: 4px;">
                                                <div style="height: 100%; width: ${expPercent.toFixed(1)}%; background: ${rarityConfig.color};"></div>
                                            </div>
                                            <div style="color: #666; font-size: 11px; text-align: right; margin-top: 2px;">${talentData.exp} / ${expToNext}</div>
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
                                            </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            ` : ''}
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
                        
                        <!-- 属性点分配 -->
                        ${Player.attributePoints > 0 ? `
                        <div style="
                            padding: 20px;
                            background: rgba(80, 60, 20, 0.5);
                            border: 2px solid #aa8833;
                            border-radius: 10px;
                            margin-bottom: 25px;
                            text-align: center;
                        ">
                            <div style="color: #ffd700; font-size: 18px; margin-bottom: 15px;">
                                ⭐ 可分配属性点: ${Player.attributePoints}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 属性列表 -->
                        <div style="
                            padding: 25px;
                            background: rgba(30, 50, 50, 0.8);
                            border: 2px solid #447766;
                            border-radius: 15px;
                        ">
                            <h3 style="color: #ffd700; margin-bottom: 20px;">📊 属性</h3>
                            
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
window.addEventListener('DOMContentLoaded', () => {
    try {
        UI.init();
        Game.init();
    } catch (e) {
        console.error('游戏初始化失败:', e);
        // 在页面上显示错误
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:20px;background:#300;color:#faa;font-family:monospace;z-index:9999;';
        errorDiv.textContent = '游戏初始化失败: ' + e.message;
        document.body.appendChild(errorDiv);
    }
});
