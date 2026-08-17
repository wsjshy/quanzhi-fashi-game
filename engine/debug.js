/**
 * Debug模式 - 调试工具
 * 用于开发和测试时快速调节数值、生成物品、传送等
 * 
 * 开启方式：
 * 1. URL参数：?debug=1
 * 2. 快捷键：按 ~ 键（波浪号）切换
 * 3. 控制台：DebugPanel.toggle()
 * 
 * 注意：本工具仅用于开发和测试，正式发布时可移除
 */

const DebugPanel = {
    isOpen: false,
    isEnabled: false,
    panel: null,
    
    // 初始化
    init() {
        try {
            // 检查URL参数
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('debug') === '1') {
                this.isEnabled = true;
            }
            
            // 检查localStorage
            try {
                if (localStorage.getItem('debug_mode') === '1') {
                    this.isEnabled = true;
                }
            } catch (e) {
                console.warn('[Debug] localStorage读取失败:', e);
            }
            
            if (this.isEnabled) {
                this.createPanel();
                this.bindShortcuts();
                console.log('%c🔧 Debug模式已开启', 'color: #00ff00; font-weight: bold; font-size: 14px;');
            }
        } catch (e) {
            console.error('[Debug] 初始化失败:', e);
        }
    },
    
    // 绑定快捷键
    bindShortcuts() {
        try {
            document.addEventListener('keydown', (e) => {
                // ~ 键切换面板
                if (e.key === '`' || e.key === '~') {
                    e.preventDefault();
                    this.toggle();
                }
                
                // F5 刷新时保持debug模式
                if (e.key === 'F5') {
                    try {
                        localStorage.setItem('debug_mode', '1');
                    } catch (e) {}
                }
            });
        } catch (e) {
            console.error('[Debug] 绑定快捷键失败:', e);
        }
    },
    
    // 创建面板
    createPanel() {
        try {
            // 创建切换按钮
            const toggleBtn = document.createElement('div');
            toggleBtn.id = 'debug-toggle-btn';
            toggleBtn.style.cssText = `
                position: fixed;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background: linear-gradient(135deg, #4444aa, #6666cc);
                color: #fff;
                padding: 15px 8px;
                border-radius: 8px 0 0 8px;
                cursor: pointer;
                z-index: 9999998;
                writing-mode: vertical-rl;
                font-size: 13px;
                font-weight: bold;
                box-shadow: -2px 0 10px rgba(0,0,0,0.5);
                user-select: none;
                font-family: "Microsoft YaHei", sans-serif;
            `;
            toggleBtn.textContent = '🔧 调试工具';
            toggleBtn.onclick = () => this.toggle();
            document.body.appendChild(toggleBtn);
            
            // 创建面板
            const panel = document.createElement('div');
            panel.id = 'debug-panel';
            panel.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                width: 340px;
                height: 100vh;
                background: rgba(15, 15, 35, 0.98);
                border-left: 2px solid #6666aa;
                z-index: 9999999;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
                font-size: 13px;
                color: #ccc;
                box-shadow: -5px 0 20px rgba(0,0,0,0.5);
                overflow: hidden;
            `;
            
            panel.innerHTML = this.getPanelHTML();
            
            document.body.appendChild(panel);
            this.panel = panel;
            
            // 绑定标签页切换
            const tabs = panel.querySelectorAll('.debug-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.dataset.tab;
                    this.switchTab(tabName);
                });
            });
            
            // 输入框获得焦点时自动全选
            const inputs = panel.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.select();
                });
                input.addEventListener('click', function() {
                    this.select();
                });
            });
            
            // 初始化传送列表（延迟一下，等数据加载完成）
            setTimeout(() => this.initTeleportList(), 1000);
            
            // 更新时间显示
            this.updateTimeDisplay();
            setInterval(() => this.updateTimeDisplay(), 1000);
            
            console.log('[Debug] 面板创建成功');
        } catch (e) {
            console.error('[Debug] 创建面板失败:', e);
        }
    },
    
    // 获取面板HTML
    getPanelHTML() {
        return `
            <div style="padding: 12px 15px; background: linear-gradient(135deg, #333366, #444488); color: #fff; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span>🔧 调试工具面板</span>
                <span style="cursor: pointer; font-size: 18px;" onclick="DebugPanel.toggle()">✕</span>
            </div>
            
            <div style="display: flex; background: #1a1a2e; border-bottom: 1px solid #333; overflow-x: auto;">
                <div class="debug-tab active" data-tab="player" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid #6666ff; white-space: nowrap; font-size: 12px; color: #fff;">玩家</div>
                <div class="debug-tab" data-tab="growth" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">成长</div>
                <div class="debug-tab" data-tab="talent" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">天赋</div>
                <div class="debug-tab" data-tab="items" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">物品</div>
                <div class="debug-tab" data-tab="battle" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">战斗</div>
                <div class="debug-tab" data-tab="teleport" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">传送</div>
                <div class="debug-tab" data-tab="time" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">时间</div>
                <div class="debug-tab" data-tab="save" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">存档</div>
                <div class="debug-tab" data-tab="story" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">剧情</div>
                <div class="debug-tab" data-tab="npc" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">NPC</div>
                <div class="debug-tab" data-tab="other" style="padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px;">其他</div>
            </div>
            
            <div style="height: calc(100vh - 85px); overflow-y: auto; padding: 12px;">
                <!-- 玩家标签页 -->
                <div id="debug-tab-player" class="debug-tab-content">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">基础属性</div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">等级</span>
                            <input type="number" id="debug-level" value="1" style="width: 70px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.setLevel()" style="background: #4444aa; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">经验</span>
                            <input type="number" id="debug-exp" value="0" style="width: 70px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.setExp()" style="background: #4444aa; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">金币</span>
                            <input type="number" id="debug-gold" value="0" style="width: 70px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.setGold()" style="background: #4444aa; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">快速加钱</span>
                            <button onclick="DebugPanel.addGold(1000)" style="background: #228844; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">+1000</button>
                            <button onclick="DebugPanel.addGold(10000)" style="background: #228844; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">+1万</button>
                            <button onclick="DebugPanel.addGold(100000)" style="background: #228844; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">+10万</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">生命值/魔法值</div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">当前HP</span>
                            <input type="number" id="debug-hp" value="100" style="width: 70px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.setHp()" style="background: #4444aa; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">当前MP</span>
                            <input type="number" id="debug-mp" value="50" style="width: 70px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.setMp()" style="background: #4444aa; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        
                        <!-- v0.99.2: 体力系统已移除，替换为每日行动次数重置 -->
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">今日修炼/猎魔/探索</span>
                            <span id="debug-daily-actions" style="font-size: 11px; color: #aaccff;">0/0/0</span>
                            <button onclick="DebugPanel.resetDailyActions()" style="background: #aa6644; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">重置</button>
                        </div>
                        
                        <button onclick="DebugPanel.fullRestore()" style="width: 100%; background: #228844; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px; margin-top: 5px;">满血满蓝</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">属性点</div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap; align-items: center;">
                            <span style="font-size: 12px; flex: 1;">未分配：<span id="debug-attr-points-display">0</span></span>
                            <button onclick="DebugPanel.refreshAttrPoints()" style="background: #666; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">刷新</button>
                        </div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap;">
                            <button onclick="DebugPanel.clearAttrPoints()" style="background: #aa4444; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">清零未分配</button>
                            <button onclick="DebugPanel.addAttributePoints(10)" style="background: #228844; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">+10点</button>
                            <button onclick="DebugPanel.addAttributePoints(50)" style="background: #228844; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">+50点</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">刷新数值</div>
                        <button onclick="DebugPanel.refreshValues()" style="width: 100%; background: #aa8844; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px;">🔄 从游戏读取当前数值</button>
                    </div>
                </div>
                
                <!-- 成长标签页 -->
                <div id="debug-tab-growth" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff88ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">元素觉醒</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">点击觉醒对应元素系</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.awakenElement('fire')" style="background: #ff4444; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🔥 火系</button>
                            <button onclick="DebugPanel.awakenElement('ice')" style="background: #44aaff; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">❄️ 冰系</button>
                            <button onclick="DebugPanel.awakenElement('thunder')" style="background: #ffcc00; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">⚡ 雷系</button>
                            <button onclick="DebugPanel.awakenElement('earth')" style="background: #aa8844; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🪨 土系</button>
                            <button onclick="DebugPanel.awakenElement('wind')" style="background: #88ddaa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">💨 风系</button>
                            <button onclick="DebugPanel.awakenElement('water')" style="background: #4488dd; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">💧 水系</button>
                            <button onclick="DebugPanel.awakenElement('light')" style="background: #ffdd44; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">✨ 光系</button>
                            <button onclick="DebugPanel.awakenElement('dark')" style="background: #6644aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🌑 暗影</button>
                            <button onclick="DebugPanel.awakenElement('heal')" style="background: #44dd88; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">💚 治愈</button>
                            <button onclick="DebugPanel.awakenElement('summon')" style="background: #dd8844; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐺 召唤</button>
                        </div>
                        <button onclick="DebugPanel.awakenAllElements()" style="width: 100%; background: #aa44aa; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 8px;">🌟 觉醒全部元素</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff88ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">境界突破</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.breakthroughTo('initial')" style="background: #666; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">初阶</button>
                            <button onclick="DebugPanel.breakthroughTo('middle')" style="background: #4488dd; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">中阶</button>
                            <button onclick="DebugPanel.breakthroughTo('high')" style="background: #aa44aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">高阶</button>
                            <button onclick="DebugPanel.breakthroughTo('super')" style="background: #ff8800; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">超阶</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff88ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">灵种获取</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">点击获取对应凡种灵种</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.addItem('fire_basic', 1)" style="background: #ff4444; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🔥 凡火种</button>
                            <button onclick="DebugPanel.addItem('ice_basic', 1)" style="background: #44aaff; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">❄️ 凡冰种</button>
                            <button onclick="DebugPanel.addItem('thunder_basic', 1)" style="background: #ffcc00; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">⚡ 凡雷种</button>
                            <button onclick="DebugPanel.addItem('earth_basic', 1)" style="background: #aa8844; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🪨 凡土种</button>
                            <button onclick="DebugPanel.addItem('wind_basic', 1)" style="background: #88ddaa; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">💨 凡风种</button>
                            <button onclick="DebugPanel.addItem('water_basic', 1)" style="background: #4488dd; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">💧 凡水种</button>
                            <button onclick="DebugPanel.addItem('light_basic', 1)" style="background: #ffdd44; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">✨ 凡光种</button>
                            <button onclick="DebugPanel.addItem('dark_basic', 1)" style="background: #6644aa; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🌑 凡暗种</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff88ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">星尘魔器</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">点击获取对应星尘魔器</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.addItem('fire_star_dust', 1)" style="background: #ff4444; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🔥 火系星尘</button>
                            <button onclick="DebugPanel.addItem('ice_star_dust', 1)" style="background: #44aaff; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">❄️ 冰系星尘</button>
                            <button onclick="DebugPanel.addItem('thunder_star_dust', 1)" style="background: #ffcc00; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">⚡ 雷系星尘</button>
                            <button onclick="DebugPanel.addItem('little_loach', 1)" style="background: #ffd700; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🐟 小泥鳅坠</button>
                        </div>
                    </div>
                </div>
                
                <!-- 天赋标签页 -->
                <div id="debug-tab-talent" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ffd700; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">天生天赋快速设置</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">点击设置对应天生天赋（立即生效）</div>
                        <div id="innate-talent-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; max-height: 200px; overflow-y: auto;"></div>
                        <button onclick="DebugPanel.refreshInnateTalentList()" style="width: 100%; background: #666; color: #fff; border: none; padding: 4px; border-radius: 3px; cursor: pointer; font-size: 11px; margin-top: 6px;">🔄 刷新列表</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #88ff88; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">系天赋快速设置</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">选择系别后点击天赋设置</div>
                        <select id="talent-element-select" style="width: 100%; padding: 4px; background: #222; color: #fff; border: 1px solid #444; border-radius: 3px; margin-bottom: 6px;" onchange="DebugPanel.refreshElementTalentList()">
                            <option value="fire">🔥 火系</option>
                            <option value="ice">❄️ 冰系</option>
                            <option value="thunder">⚡ 雷系</option>
                            <option value="earth">🪨 土系</option>
                            <option value="wind">🌪️ 风系</option>
                            <option value="water">💧 水系</option>
                            <option value="light">✨ 光系</option>
                            <option value="dark">🌑 暗系</option>
                            <option value="heal">💚 治愈系</option>
                            <option value="plant">🌿 植物系</option>
                            <option value="summon">📜 召唤系</option>
                        </select>
                        <div id="element-talent-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; max-height: 150px; overflow-y: auto;"></div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff88ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">天赋等级快速设置</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">设置当前系天赋等级（用于测试进化阶段）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 4px;">
                            <button onclick="DebugPanel.setTalentLevel(1)" style="background: #666; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 11px;">Lv1</button>
                            <button onclick="DebugPanel.setTalentLevel(3)" style="background: #4488dd; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 11px;">Lv3</button>
                            <button onclick="DebugPanel.setTalentLevel(5)" style="background: #aa44aa; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 11px;">Lv5</button>
                            <button onclick="DebugPanel.setTalentLevel(7)" style="background: #ff8800; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 11px;">Lv7</button>
                            <button onclick="DebugPanel.setTalentLevel(10)" style="background: #ffd700; color: #333; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 11px;">Lv10</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #88ccff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">天赋分支选择</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">Lv5后可选择进化分支（需先设置系天赋）</div>
                        <div id="talent-branch-list" style="display: grid; grid-template-columns: 1fr; gap: 4px;"></div>
                    </div>
                    
                    <button onclick="DebugPanel.showTalentInfo()" style="width: 100%; background: #4488aa; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">📊 查看当前天赋信息</button>
                </div>
                
                <!-- 物品标签页 -->
                <div id="debug-tab-items" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">消耗品</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.addItem('health_potion', 10)" style="background: #4444aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">小血瓶x10</button>
                            <button onclick="DebugPanel.addItem('mana_potion', 10)" style="background: #4444aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">小蓝瓶x10</button>
                            <button onclick="DebugPanel.addItem('super_health_potion', 5)" style="background: #4444aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">超级血瓶x5</button>
                            <button onclick="DebugPanel.addItem('super_mana_potion', 5)" style="background: #4444aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">超级蓝瓶x5</button>
                            <button onclick="DebugPanel.addItem('stamina_potion', 10)" style="background: #4444aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">活力药水x10</button>
                            <button onclick="DebugPanel.addItem('demon_core', 20)" style="background: #4444aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">妖魔内核x20</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">自定义添加</div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">物品ID</span>
                            <input type="text" id="debug-item-id" placeholder="item_id" style="width: 120px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                        </div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">数量</span>
                            <input type="number" id="debug-item-count" value="1" min="1" style="width: 70px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.addCustomItem()" style="background: #228844; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">添加</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">魔具装备</div>
                        <div style="font-size: 11px; color: #888; margin-bottom: 8px;">各类魔具一键获取</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.addItem('demon_slayer_blade', 1)" style="background: #cc4444; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">⚔️ 斩魔刀</button>
                            <button onclick="DebugPanel.addItem('flame_demon_slayer', 1)" style="background: #ff6644; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🔥 烈焰斩魔具</button>
                            <button onclick="DebugPanel.addItem('cloud_pattern_shield', 1)" style="background: #4488cc; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🛡️ 云纹盾</button>
                            <button onclick="DebugPanel.addItem('ice_essence_shield', 1)" style="background: #66ccff; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">❄️ 冰埃之盾</button>
                            <button onclick="DebugPanel.addItem('ice_silk_armor', 1)" style="background: #88ddff; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">🥋 冰蚕铠</button>
                            <button onclick="DebugPanel.addItem('wind_walker_boots', 1)" style="background: #88ddaa; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">👟 风履魔具</button>
                            <button onclick="DebugPanel.addItem('fire_star_atlas', 1)" style="background: #ff8844; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">📖 火系星图之书</button>
                            <button onclick="DebugPanel.addItem('thunder_star_atlas', 1)" style="background: #ffcc44; color: #fff; border: none; padding: 5px; border-radius: 3px; cursor: pointer; font-size: 10px;">📖 雷系星图之书</button>
                        </div>
                    </div>
                </div>
                
                <!-- 战斗标签页 -->
                <div id="debug-tab-battle" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">⚡ 快速战斗准备</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.battlePrep()" style="background: #22aa66; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">💪 满血满蓝</button>
                            <button onclick="DebugPanel.setLevel(5)" style="background: #4488aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">⭐ 设置等级5</button>
                            <button onclick="DebugPanel.setLevel(10)" style="background: #4488aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">⭐ 设置等级10</button>
                            <button onclick="DebugPanel.awakenAllElements()" style="background: #aa66cc; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">✨ 觉醒全部元素</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🐀 奴仆级妖魔（新手）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('giant_eye_rat')" style="background: #886644; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐀 巨眼猩鼠</button>
                            <button onclick="DebugPanel.startBattle('one_eye_wolf')" style="background: #666688; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐺 独眼魔狼</button>
                            <button onclick="DebugPanel.startBattle('demon_wolf_pack')" style="background: #554433; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐺 魔狼群</button>
                            <button onclick="DebugPanel.startBattle('shadow_creature')" style="background: #444466; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">👤 暗影怪</button>
                            <button onclick="DebugPanel.startBattle('shadow_snake')" style="background: #553377; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐍 影蛇</button>
                            <button onclick="DebugPanel.startBattle('rock_monster')" style="background: #888844; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🪨 石怪</button>
                            <button onclick="DebugPanel.startBattle('thunder_beast')" style="background: #9966ff; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">⚡ 雷兽</button>
                            <button onclick="DebugPanel.startBattle('black_beast')" style="background: #333344; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">👹 黑畜妖</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🐛 奴仆级（新增）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('bone_eating_worm')" style="background: #8B4513; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐛 噬骨虫</button>
                            <button onclick="DebugPanel.startBattle('blood_pattern_rat')" style="background: #8B0000; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐀 血纹巨魔鼠</button>
                            <button onclick="DebugPanel.startBattle('skeleton_warrior')" style="background: #e8e8e8; color: #333; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">💀 骷髅战士</button>
                            <button onclick="DebugPanel.startBattle('ghost')" style="background: #a0a0ff; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">👻 幽灵</button>
                            <button onclick="DebugPanel.startBattle('iron_scorpion')" style="background: #8b4513; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🦂 铁甲蝎</button>
                            <button onclick="DebugPanel.startBattle('thunder_hawk')" style="background: #4169e1; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🦅 雷鹰</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🦅 战将级（新增）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">👹 战将级妖魔（进阶）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('bone_spike_zheng')" style="background: #886666; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🦴 骨刺狰</button>
                            <button onclick="DebugPanel.startBattle('black_church_deacon')" style="background: #663366; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🌑 黑教廷执事</button>
                        </div>
                    </div>
                    
                    <!-- v0.70.0: 精英妖魔测试（仅博城灾难及之前） -->
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ffaa00; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">⭐ 精英妖魔（博城灾难）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('three_eye_wolf')" style="background: #aa6633; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">三眼魔狼</button>
                            <button onclick="DebugPanel.startBattle('advanced_one_eye_wolf')" style="background: #665544; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">进阶期独眼魔狼</button>
                            <button onclick="DebugPanel.startBattle('giant_eye_rat_king')" style="background: #774444; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">巨眼猩鼠王</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🐺 统领级妖魔（挑战）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('winged_gray_wolf')" style="background: #ff4400; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🦅 翼苍狼</button>
                            <button onclick="DebugPanel.startBattle('three_eye_demon_wolf')" style="background: #884422; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🐺 三眼魔狼</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">👑 君主级妖魔（Boss）</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('flame_queen')" style="background: #ff2200; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🔥 炎姬女王</button>
                            <button onclick="DebugPanel.startBattle('ice_saint')" style="background: #44aaff; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">❄️ 冰圣</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🧙 魔法师对手</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.startBattle('mage_student')" style="background: #ff6633; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🔥 切磋同学</button>
                            <button onclick="DebugPanel.startBattle('mu_bai_duel')" style="background: #66ccff; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">❄️ 穆白</button>
                            <button onclick="DebugPanel.startBattle('zhao_kunsan_duel')" style="background: #cc9966; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🪨 赵坤三</button>
                            <button onclick="DebugPanel.startBattle('black_church_mage')" style="background: #663366; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🌑 黑教廷执事</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🎭 特殊战斗</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.triggerRandomEvent()" style="background: #4488aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🎲 随机事件</button>
                            <button onclick="DebugPanel.triggerBigEvent('big_event_bocheng_disaster')" style="background: #aa4444; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">💥 博城灾难</button>
                            <button onclick="DebugPanel.triggerBigEvent('big_event_xuefeng_training')" style="background: #44aa66; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🏔️ 雪峰山历练</button>
                            <button onclick="DebugPanel.startBattle('mage_student', { mode: 'duel', canUseItems: false, canFlee: false, winHpPercent: 0.2, isFriendly: true })" style="background: #66aa44; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">⚔️ 决斗模式</button>
                            <button onclick="DebugPanel.startGauntlet()" style="background: #aa6622; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🔄 车轮战</button>
                            <button onclick="DebugPanel.startBattle('giant_eye_rat', { mode: 'hunt' })" style="background: #4488aa; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">🏹 狩猎战</button>
                            <button onclick="DebugPanel.startBattle('winged_gray_wolf', { mode: 'boss' })" style="background: #aa4488; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px;">👹 Boss战</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">🔧 自定义战斗</div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">妖魔ID</span>
                            <input type="text" id="debug-enemy-id" placeholder="enemy_id" style="width: 120px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <button onclick="DebugPanel.startCustomBattle()" style="background: #ff6644; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">战斗</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #ff6644; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">📖 战斗说明</div>
                        <div style="font-size: 11px; color: #aaa; line-height: 1.6;">
                            <div>• 回合制战斗，速度高者先行动</div>
                            <div>• 元素克制：火克冰、冰克风、风克土、土克雷、雷克水、水克火</div>
                            <div>• 高阶魔法需要引导，引导中可被打断</div>
                            <div>• 精神力越高，引导速度越快</div>
                            <div>• 合理运用技能、道具、防御取得胜利</div>
                        </div>
                    </div>
                </div>
                
                <!-- 传送标签页 -->
                <div id="debug-tab-teleport" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">快速传送</div>
                        <div id="debug-teleport-list">
                            <div style="color: #888; font-size: 12px;">加载中...</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <button onclick="DebugPanel.unlockAllLocations()" style="width: 100%; background: #228844; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px;">🔓 解锁所有地点</button>
                    </div>
                </div>
                
                <!-- 时间标签页 -->
                <div id="debug-tab-time" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">时间跳转</div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">快速跳过</span>
                            <button onclick="DebugPanel.skipTime(1, 'hour')" style="background: #4444aa; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">1小时</button>
                            <button onclick="DebugPanel.skipTime(1, 'day')" style="background: #4444aa; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">1天</button>
                            <button onclick="DebugPanel.skipTime(7, 'day')" style="background: #4444aa; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">7天</button>
                        </div>
                        
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
                            <span style="flex: 1; font-size: 12px;">自定义天数</span>
                            <input type="number" id="debug-skip-days" value="1" min="1" style="width: 60px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px; text-align: center;">
                            <button onclick="DebugPanel.skipCustomDays()" style="background: #4444aa; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">跳过</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">当前时间</div>
                        <div id="debug-current-time" style="font-size: 12px; color: #aaa; line-height: 1.8;">
                            加载中...
                        </div>
                    </div>
                    
                    <!-- v0.99.2: 体力系统已移除，删除恢复满体力按钮 -->
                </div>
                
                <!-- 存档标签页 -->
                <div id="debug-tab-save" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">预设存档</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="DebugPanel.loadPresetSave('newbie')" style="background: #4444aa; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">新手Lv.1</button>
                            <button onclick="DebugPanel.loadPresetSave('early')" style="background: #4444aa; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">初期Lv.3</button>
                            <button onclick="DebugPanel.loadPresetSave('mid')" style="background: #4444aa; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">中期Lv.5</button>
                            <button onclick="DebugPanel.loadPresetSave('max')" style="background: #aa8844; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">满配Lv.10</button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">存档管理</div>
                        <button onclick="DebugPanel.exportSave()" style="width: 100%; background: #228844; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px; margin-bottom: 8px;">📤 导出存档</button>
                        <button onclick="DebugPanel.importSave()" style="width: 100%; background: #aa8844; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px; margin-bottom: 8px;">📥 导入存档</button>
                        <button onclick="DebugPanel.resetGame()" style="width: 100%; background: #aa4444; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px;">⚠️ 重置游戏</button>
                    </div>
                </div>
                
                <!-- 剧情标签页 -->
                <div id="debug-tab-story" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">设置Flag</div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                            <input type="text" id="debug-flag-name" placeholder="flag名称" style="flex:1; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <button onclick="DebugPanel.setFlag(true)" style="background: #448844; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                            <button onclick="DebugPanel.setFlag(false)" style="background: #884444; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">清除</button>
                        </div>
                        <div style="font-size: 11px; color: #888; line-height: 1.6;">
                            常用flag：bocheng_disaster_happened, saw_tang_yue_roof, witnessed_demon_migration, found_ancient_cave, saw_mu_he_stranger, heard_spring_whisper
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">快速设置剧情阶段</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            <button onclick="DebugPanel.storyPhase('start')" style="background: #444466; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">游戏开始</button>
                            <button onclick="DebugPanel.storyPhase('school')" style="background: #444466; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">天澜高中</button>
                            <button onclick="DebugPanel.storyPhase('before_disaster')" style="background: #664444; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">灾难前夕</button>
                            <button onclick="DebugPanel.storyPhase('after_disaster')" style="background: #884422; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">博城灾难后</button>
                            <button onclick="DebugPanel.storyPhase('leave')" style="background: #446644; color: #fff; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px;">离开博城</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">触发事件</div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                            <input type="text" id="debug-event-id" placeholder="event_id" style="flex:1; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <button onclick="DebugPanel.triggerEvent()" style="background: #664488; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">触发</button>
                        </div>
                        <div style="font-size: 11px; color: #888; line-height: 1.8;">
                            博城篇事件：<br>
                            event_tang_yue_roof - 唐月天台密谈<br>
                            event_demon_migration - 妖魔异常迁徙<br>
                            event_ancient_cave - 古代山洞符文<br>
                            event_wounded_demon - 受伤的妖魔<br>
                            event_mu_he_stranger - 穆贺密会<br>
                            event_eve_of_disaster - 灾难前夕<br>
                            event_earth_spring_depths - 泉底低语<br>
                            event_farewell_bocheng - 告别博城
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">NPC好感度</div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap;">
                            <input type="text" id="debug-npc-id" placeholder="npc_id" style="width: 100px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <input type="number" id="debug-opinion" placeholder="好感" value="80" style="width: 60px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <input type="number" id="debug-trust" placeholder="信任" value="60" style="width: 60px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <button onclick="DebugPanel.setNpcRel()" style="background: #448888; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        <div style="font-size: 11px; color: #888;">tang_yue, zhang_xiaohou, zhan_kong, mu_bai, yu_ang, mu_he</div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">当前剧情状态</div>
                        <button onclick="DebugPanel.showStoryState()" style="width: 100%; background: #444466; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 12px;">查看当前Flag和信息碎片</button>
                        <div id="debug-story-state" style="margin-top: 8px; font-size: 11px; color: #aaa; max-height: 200px; overflow-y: auto; background: #1a1a2a; padding: 8px; border-radius: 4px;"></div>
                    </div>
                </div>

                <!-- NPC标签页 -->
                <div id="debug-tab-npc" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #88ff88; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">NPC关系设置</div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap; align-items: center;">
                            <select id="debug-npc-select" style="flex: 1; min-width: 120px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                                <option value="">-- 选择NPC --</option>
                                <option value="mo_fan">莫凡</option>
                                <option value="mu_ningxue">穆宁雪</option>
                                <option value="tang_yue">唐月</option>
                                <option value="zhang_xiaohou">张小侯</option>
                                <option value="zhao_manyan">赵满延</option>
                                <option value="xu_zhaoting">许昭霆</option>
                                <option value="mu_bai">穆白</option>
                                <option value="zhou_min">周敏</option>
                                <option value="xiao_chuyuan">萧院长</option>
                                <option value="xue_musheng">薛木生</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap; align-items: center;">
                            <span style="font-size: 12px; width: 40px;">好感</span>
                            <input type="number" id="debug-npc-opinion" placeholder="-100~100" value="50" style="width: 80px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <span style="font-size: 12px; width: 40px;">信任</span>
                            <input type="number" id="debug-npc-trust" placeholder="-100~100" value="50" style="width: 80px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <button onclick="DebugPanel.setNpcRelation()" style="background: #448888; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap;">
                            <button onclick="DebugPanel.quickNpcRel(0)" style="background: #666; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">陌生(0)</button>
                            <button onclick="DebugPanel.quickNpcRel(20)" style="background: #448844; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">认识(20)</button>
                            <button onclick="DebugPanel.quickNpcRel(40)" style="background: #4488aa; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">友善(40)</button>
                            <button onclick="DebugPanel.quickNpcRel(60)" style="background: #8844aa; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">亲密(60)</button>
                            <button onclick="DebugPanel.quickNpcRel(80)" style="background: #aa4488; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">挚友(80)</button>
                        </div>
                        <button onclick="DebugPanel.showAllNpcRelations()" style="width: 100%; background: #444466; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 12px;">查看当前所有NPC关系</button>
                        <div id="debug-npc-relations" style="margin-top: 8px; font-size: 11px; color: #aaa; max-height: 250px; overflow-y: auto; background: #1a1a2a; padding: 8px; border-radius: 4px;"></div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #88ff88; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">手动输入ID</div>
                        <div style="display: flex; gap: 5px; margin-bottom: 8px; flex-wrap: wrap; align-items: center;">
                            <input type="text" id="debug-npc-id-manual" placeholder="npc_id" style="width: 100px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <input type="number" id="debug-npc-opinion-manual" placeholder="好感" value="50" style="width: 60px; background: #222; border: 1px solid #444; color: #fff; padding: 4px 6px; border-radius: 3px; font-size: 12px;">
                            <button onclick="DebugPanel.setNpcRelationManual()" style="background: #448888; color: #fff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">设置</button>
                        </div>
                    </div>
                </div>

                <!-- 其他标签页 -->
                <div id="debug-tab-other" class="debug-tab-content" style="display: none;">
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">刷新UI</div>
                        <button onclick="DebugPanel.refreshUI()" style="width: 100%; background: #4444aa; color: #fff; border: none; padding: 8px; border-radius: 3px; cursor: pointer; font-size: 13px;">🔄 刷新所有UI</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #8888ff; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #333;">关于</div>
                        <div style="font-size: 11px; color: #888; line-height: 1.8;">
                            全职法师 Debug模式<br>
                            按 ~ 键切换面板<br>
                            URL加 ?debug=1 开启<br>
                            <br>
                            本工具仅用于开发和测试
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 切换面板
    toggle() {
        try {
            if (!this.panel) {
                console.warn('[Debug] 面板不存在');
                return;
            }
            
            this.isOpen = !this.isOpen;
            
            if (this.isOpen) {
                this.panel.style.transform = 'translateX(0)';
                this.refreshValues();
            } else {
                this.panel.style.transform = 'translateX(100%)';
            }
            
            console.log('[Debug] 面板', this.isOpen ? '已打开' : '已关闭');
        } catch (e) {
            console.error('[Debug] 切换面板失败:', e);
        }
    },
    
    // 切换标签页
    switchTab(tabName) {
        try {
            if (!this.panel) return;
            
            // 更新标签状态
            const tabs = this.panel.querySelectorAll('.debug-tab');
            tabs.forEach(tab => {
                if (tab.dataset.tab === tabName) {
                    tab.style.borderBottomColor = '#6666ff';
                    tab.style.color = '#fff';
                } else {
                    tab.style.borderBottomColor = 'transparent';
                    tab.style.color = '#ccc';
                }
            });
            
            // 更新内容显示
            const contents = this.panel.querySelectorAll('.debug-tab-content');
            contents.forEach(content => {
                content.style.display = 'none';
            });
            
            const targetContent = document.getElementById('debug-tab-' + tabName);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        } catch (e) {
            console.error('[Debug] 切换标签页失败:', e);
        }
    },
    
    // 刷新数值显示
    refreshValues() {
        try {
            if (typeof Player !== 'undefined') {
                const levelEl = document.getElementById('debug-level');
                const expEl = document.getElementById('debug-exp');                const goldEl = document.getElementById('debug-gold');
                const hpEl = document.getElementById('debug-hp');
                const mpEl = document.getElementById('debug-mp');
                // v0.99.2: 体力系统已移除，替换为每日行动次数显示
                const dailyEl = document.getElementById('debug-daily-actions');
                
                if (levelEl) levelEl.value = Player.level || 1;
                if (expEl) expEl.value = Player.exp || 0;
                if (goldEl) goldEl.value = Player.gold || 0;
                if (hpEl) hpEl.value = Player.hp || 100;
                if (mpEl) mpEl.value = Player.mp || 50;
                if (dailyEl) {
                    const d = Player.dailyActions || { cultivate: 0, hunt: 0, explore: 0 };
                    dailyEl.textContent = `${d.cultivate}/${d.hunt}/${d.explore}`;
                }
                
                // v1.1.7: 刷新属性点显示（之前遗漏导致不同步）
                this.refreshAttrPoints();
                
                // v1.4.6: 刷新天赋列表
                this.refreshInnateTalentList();
                this.refreshElementTalentList();
                
                console.log('[Debug] 数值已刷新');
            }
        } catch (e) {
            console.warn('[Debug] 刷新数值失败:', e);
        }
    },
    
    // v0.54.0: 刷新属性点显示
    refreshAttrPoints() {
        try {
            const el = document.getElementById('debug-attr-points-display');
            if (el && typeof Player !== 'undefined') {
                el.textContent = Player.attributePoints || 0;
            }
        } catch (e) {
            console.warn('[Debug] 刷新属性点失败:', e);
        }
    },

    // v0.54.0: 清零未分配属性点
    clearAttrPoints() {
        try {
            if (typeof Player !== 'undefined') {
                Player.attributePoints = 0;
                this.refreshAttrPoints();
                console.log('[Debug] 已清零未分配属性点');
            }
        } catch (e) {
            console.error('[Debug] 清零属性点失败:', e);
        }
    },

    // v0.54.0: 增加属性点
    addAttributePoints(amount) {
        try {
            if (typeof Player !== 'undefined') {
                Player.attributePoints = (Player.attributePoints || 0) + amount;
                this.refreshAttrPoints();
                console.log('[Debug] 增加' + amount + '属性点，当前：' + Player.attributePoints);
            }
        } catch (e) {
            console.error('[Debug] 增加属性点失败:', e);
        }
    },

    // ========== 玩家相关功能 ==========
    
    setLevel(targetLevel) {
        try {
            if (targetLevel === undefined) {
                const levelEl = document.getElementById('debug-level');
                targetLevel = parseInt(levelEl.value);
            }

            if (targetLevel < 1) targetLevel = 1;

            if (typeof Player !== 'undefined') {
                // 重置基础属性
                Player.level = 1;
                Player.maxHp = 100;
                Player.maxMp = 50;
                Player.attack = 10;
                Player.defense = 5;
                Player.speed = 10;
                Player.spirit = 10;
                Player.attributePoints = 0;

                // 把所有已觉醒系设为目标等级
                Player.elements.forEach(el => {
                    Player.elementLevels[el] = 1;
                    Player.elementExp[el] = 0;
                });

                // 模拟升级到目标等级（每次给第一个系加经验触发升级）
                const mainEl = Player.elements[0];
                if (mainEl) {
                    for (let lv = 1; lv < targetLevel; lv++) {
                        Player.elementLevels[mainEl] = lv + 1;
                        const growth = Player._getLevelGrowth(lv + 1);
                        Player.attributePoints += growth.apt;
                        Player.maxHp += growth.hp;
                        Player.maxMp += growth.mp;
                        Player.attack += growth.atk;
                        Player.defense += growth.def;
                        Player.speed += growth.spd;
                        Player.spirit += growth.spr;
                    }
                    // 其他系也设为目标等级（不重复加属性）
                    Player.elements.forEach(el => {
                        if (el !== mainEl) {
                            Player.elementLevels[el] = targetLevel;
                            Player.elementExp[el] = 0;
                        }
                    });
                }

                Player.level = targetLevel;
                Player.expToNext = Player._calcExpToNext(targetLevel);
                Player.exp = 0;
                Player.checkSkillUnlocks();

                Player.hp = Player.maxHp;
                Player.mp = Player.maxMp;
                // v0.99.2: 体力系统已移除
                // Player.stamina = Player.maxStamina;

                this.refreshUI();
                console.log(`[Debug] 各系等级设置为 ${targetLevel}`);
                alert(`各系等级已设置为 ${targetLevel}`);
            }
        } catch (e) {
            console.error('[Debug] setLevel错误:', e);
            alert('设置失败: ' + e.message);
        }
    },
    
    setExp() {
        try {
            const expEl = document.getElementById('debug-exp');
            const exp = parseInt(expEl.value);
            
            if (typeof Player !== 'undefined') {
                Player.exp = exp;
                this.refreshUI();
                console.log(`[Debug] 经验设置为 ${exp}`);
            }
        } catch (e) {
            console.error('[Debug] setExp错误:', e);
        }
    },
    
    setGold() {
        try {
            const goldEl = document.getElementById('debug-gold');
            const gold = parseInt(goldEl.value);
            
            if (typeof Player !== 'undefined') {
                Player.gold = Math.max(0, gold);
                this.refreshUI();
                console.log(`[Debug] 金币设置为 ${gold}`);
            }
        } catch (e) {
            console.error('[Debug] setGold错误:', e);
        }
    },
    
    addGold(amount) {
        try {
            if (typeof Player !== 'undefined') {
                Player.gold += amount;
                
                const goldEl = document.getElementById('debug-gold');
                if (goldEl) goldEl.value = Player.gold;
                
                this.refreshUI();
                console.log(`[Debug] 增加 ${amount} 金币`);
            }
        } catch (e) {
            console.error('[Debug] addGold错误:', e);
        }
    },
    
    setHp() {
        try {
            const hpEl = document.getElementById('debug-hp');
            const hp = parseInt(hpEl.value);
            
            if (typeof Player !== 'undefined') {
                Player.hp = Math.max(0, Math.min(hp, Player.maxHp));
                this.refreshUI();
                console.log(`[Debug] HP设置为 ${Player.hp}`);
            }
        } catch (e) {
            console.error('[Debug] setHp错误:', e);
        }
    },
    
    setMp() {
        try {
            const mpEl = document.getElementById('debug-mp');
            const mp = parseInt(mpEl.value);
            
            if (typeof Player !== 'undefined') {
                Player.mp = Math.max(0, Math.min(mp, Player.maxMp));
                this.refreshUI();
                console.log(`[Debug] MP设置为 ${Player.mp}`);
            }
        } catch (e) {
            console.error('[Debug] setMp错误:', e);
        }
    },
    
    // v0.99.2: 体力系统已移除，替换为重置每日行动次数
    resetDailyActions() {
        try {
            if (typeof Player !== 'undefined' && typeof Player.resetDailyActions === 'function') {
                Player.resetDailyActions();
                this.refreshValues();
                this.refreshUI();
                console.log('[Debug] 每日行动次数已重置');
                alert('每日行动次数已重置！');
            }
        } catch (e) {
            console.error('[Debug] resetDailyActions错误:', e);
        }
    },
    
    fullRestore() {
        try {
            if (typeof Player !== 'undefined') {
                Player.hp = Player.maxHp;
                Player.mp = Player.maxMp;
                // v0.99.2: 体力系统已移除
                // Player.stamina = Player.maxStamina;
                this.refreshValues();
                this.refreshUI();
                console.log('[Debug] 满血满蓝');
            }
        } catch (e) {
            console.error('[Debug] fullRestore错误:', e);
        }
    },
    
    // ========== 物品相关功能 ==========
    
    addItem(itemId, count = 1) {
        try {
            if (typeof Inventory !== 'undefined' && Inventory.addItem) {
                Inventory.addItem(itemId, count);
                console.log(`[Debug] 添加物品: ${itemId} x${count}`);
                alert(`已添加: ${itemId} x${count}`);
            } else {
                alert('Inventory系统未找到');
            }
        } catch (e) {
            console.error('[Debug] addItem错误:', e);
            alert('添加失败: ' + e.message);
        }
    },
    
    addCustomItem() {
        try {
            const itemIdEl = document.getElementById('debug-item-id');
            const countEl = document.getElementById('debug-item-count');
            
            const itemId = itemIdEl.value;
            const count = parseInt(countEl.value);
            
            if (!itemId) {
                alert('请输入物品ID');
                return;
            }
            
            this.addItem(itemId, count);
        } catch (e) {
            console.error('[Debug] addCustomItem错误:', e);
        }
    },
    
    // ========== 传送相关功能 ==========
    
    initTeleportList() {
        try {
            const listDiv = document.getElementById('debug-teleport-list');
            if (!listDiv) return;
            
            let locations = {};
            
            // 尝试从不同的地方获取地点数据
            if (typeof DataManager !== 'undefined' && DataManager.locations) {
                locations = DataManager.locations;
            } else if (typeof GameData !== 'undefined' && GameData.locations) {
                locations = GameData.locations;
            } else if (typeof locationsData !== 'undefined') {
                locations = locationsData;
            }
            
            if (Object.keys(locations).length === 0) {
                listDiv.innerHTML = '<div style="color: #888; font-size: 12px;">未找到地点数据</div>';
                return;
            }
            
            let html = '';
            for (const id in locations) {
                const loc = locations[id];
                const name = loc.name || id;
                html += `<div style="display: flex; align-items: center; margin-bottom: 6px; gap: 8px;">
                    <span style="flex: 1; font-size: 12px;">${name}</span>
                    <button onclick="DebugPanel.teleport('${id}')" style="background: #4444aa; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">传送</button>
                </div>`;
            }
            
            listDiv.innerHTML = html;
        } catch (e) {
            console.error('[Debug] initTeleportList错误:', e);
        }
    },
    
    teleport(locationId) {
        try {
            // 如果在战斗中，先结束战斗（避免状态残留）
            if (typeof BattleSystem !== 'undefined' && BattleSystem.active) {
                BattleSystem.endBattle();
                console.log('[Debug] 传送前结束战斗');
            }
            if (typeof Game !== 'undefined' && Game.travelTo) {
                Game.travelTo(locationId);
                console.log(`[Debug] 传送到: ${locationId}`);
            } else if (typeof MapSystem !== 'undefined' && MapSystem.travelTo) {
                MapSystem.travelTo(locationId);
                console.log(`[Debug] 传送到: ${locationId}`);
            } else {
                alert('传送功能不可用');
            }
        } catch (e) {
            console.error('[Debug] teleport错误:', e);
            alert('传送失败: ' + e.message);
        }
    },
    
    unlockAllLocations() {
        try {
            if (typeof Player !== 'undefined') {
                if (!Player.unlockedLocations) {
                    Player.unlockedLocations = [];
                }
                
                let locations = {};
                if (typeof DataManager !== 'undefined' && DataManager.locations) {
                    locations = DataManager.locations;
                } else if (typeof GameData !== 'undefined' && GameData.locations) {
                    locations = GameData.locations;
                }
                
                for (const id in locations) {
                    if (!Player.unlockedLocations.includes(id)) {
                        Player.unlockedLocations.push(id);
                    }
                }
                
                console.log('[Debug] 已解锁所有地点');
                alert('已解锁所有地点');
            }
        } catch (e) {
            console.error('[Debug] unlockAllLocations错误:', e);
        }
    },
    
    // ========== 时间相关功能 ==========
    
    skipTime(amount, unit) {
        try {
            if (typeof TimeSystem !== 'undefined' && TimeSystem.advanceTime) {
                if (unit === 'hour') {
                    TimeSystem.advanceTime(amount);
                } else if (unit === 'day') {
                    TimeSystem.advanceTime(amount * 24);
                }
                this.refreshUI();
                console.log(`[Debug] 跳过 ${amount} ${unit === 'hour' ? '小时' : '天'}`);
            } else {
                alert('时间系统未找到');
            }
        } catch (e) {
            console.error('[Debug] skipTime错误:', e);
            alert('时间跳转失败: ' + e.message);
        }
    },
    
    skipCustomDays() {
        try {
            const daysEl = document.getElementById('debug-skip-days');
            const days = parseInt(daysEl.value);
            this.skipTime(days, 'day');
        } catch (e) {
            console.error('[Debug] skipCustomDays错误:', e);
        }
    },
    
    updateTimeDisplay() {
        try {
            const timeDiv = document.getElementById('debug-current-time');
            if (!timeDiv) return;
            
            if (typeof Player !== 'undefined') {
                const day = Player.day || 1;
                const hour = Player.hour || 8;
                
                let periodName = '';
                if (typeof TimeSystem !== 'undefined' && TimeSystem.getTimePeriodName) {
                    periodName = TimeSystem.getTimePeriodName();
                }
                
                timeDiv.innerHTML = `
                    第 ${day} 天<br>
                    ${hour}:00 ${periodName ? '(' + periodName + ')' : ''}
                    <!-- v0.99.2: 体力系统已移除 -->
                `;
            }
        } catch (e) {
            // 静默失败
        }
    },
    
    // v0.99.2: restoreStamina方法已移除（体力系统废弃）
    
    // ========== 存档相关功能 ==========
    
    loadPresetSave(type) {
        try {
            let targetLevel = 1;
            let gold = 100;
            
            switch(type) {
                case 'newbie':
                    targetLevel = 1;
                    gold = 50;
                    break;
                case 'early':
                    targetLevel = 3;
                    gold = 500;
                    break;
                case 'mid':
                    targetLevel = 5;
                    gold = 2000;
                    break;
                case 'max':
                    targetLevel = 10;
                    gold = 100000;
                    break;
            }
            
            if (typeof Player !== 'undefined') {
                // 重置到1级
                Player.level = 1;
                Player.maxHp = 100;
                Player.maxMp = 50;
                Player.attack = 10;
                Player.defense = 5;
                Player.speed = 10;
                Player.spirit = 10;
                Player.attributePoints = 0;
                Player.expToNext = 80;
                Player.skills = ['basic_attack'];

                // 确保有初始元素
                if (Player.elements.length === 0) {
                    Player.elements = ['fire'];
                    Player.elementLevels = { fire: 1 };
                    Player.elementExp = { fire: 0 };
                    if (typeof SkillSystem !== 'undefined') {
                        Player.skills.push('fire_bolt');
                    }
                }

                // 用setLevel逻辑升到目标等级
                this.setLevel(targetLevel);
                Player.skills = ['basic_attack'];
                Player.checkSkillUnlocks();

                Player.gold = gold;
                Player.hp = Player.maxHp;
                Player.mp = Player.maxMp;
                // v0.99.2: 体力系统已移除
                // Player.stamina = Player.maxStamina;
                
                this.refreshValues();
                this.refreshUI();
                console.log(`[Debug] 已加载 ${type} 存档 (Lv.${targetLevel})`);
                alert(`已生成 ${type} 存档\n等级: Lv.${targetLevel}\n金币: ${gold}`);
            }
        } catch (e) {
            console.error('[Debug] loadPresetSave错误:', e);
            alert('加载失败: ' + e.message);
        }
    },
    
    exportSave() {
        try {
            if (typeof Game !== 'undefined' && Game.saveGame) {
                Game.saveGame();
            }
            
            const saveData = localStorage.getItem('quanzhi_fashi_save');
            if (saveData) {
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `save_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                console.log('[Debug] 存档已导出');
            } else {
                alert('没有找到存档');
            }
        } catch (e) {
            console.error('[Debug] exportSave错误:', e);
            alert('导出失败: ' + e.message);
        }
    },
    
    importSave() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const saveData = e.target.result;
                        localStorage.setItem('quanzhi_fashi_save', saveData);
                        
                        if (typeof Game !== 'undefined' && Game.loadGame) {
                            Game.loadGame();
                        } else {
                            location.reload();
                        }
                        
                        console.log('[Debug] 存档已导入');
                    } catch (err) {
                        alert('导入失败: ' + err.message);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        } catch (e) {
            console.error('[Debug] importSave错误:', e);
        }
    },
    
    resetGame() {
        if (!confirm('确定要重置游戏吗？所有进度将丢失！')) return;
        
        try {
            localStorage.removeItem('quanzhi_fashi_save');
            location.reload();
        } catch (e) {
            console.error('[Debug] resetGame错误:', e);
        }
    },
    
    // ========== 成长相关功能 ==========
    
    // 觉醒元素
    awakenElement(element) {
        try {
            if (typeof Player !== 'undefined' && Player.awakenElement) {
                const result = Player.awakenElement(element);
                this.refreshUI();
                if (result) {
                    console.log(`[Debug] 已觉醒 ${element} 元素`);
                    alert(`已觉醒 ${element} 元素！`);
                } else {
                    alert('觉醒失败，可能已经觉醒过了');
                }
            } else {
                alert('Player.awakenElement 方法不存在');
            }
        } catch (e) {
            console.error('[Debug] awakenElement错误:', e);
            alert('觉醒失败: ' + e.message);
        }
    },
    
    // 觉醒全部元素
    awakenAllElements() {
        try {
            const elements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'summon', 'shadow', 'plant', 'poison', 'sound'];
            let count = 0;

            if (typeof Player !== 'undefined') {
                for (const element of elements) {
                    if (!Player.elements.includes(element)) {
                        const result = Player.awakenElement(element);
                        if (result && result.success) {
                            count++;
                        } else {
                            // 强制觉醒（debug模式绕过等级限制）
                            Player.elements.push(element);
                            Player.elementLevels[element] = 1;
                            Player.elementExp[element] = 0;
                            if (typeof TalentSystem !== 'undefined' && TalentSystem.initTalentForElement) {
                                Player.talents[element] = TalentSystem.initTalentForElement(element);
                            }
                            const starterTable = typeof SKILL_UNLOCK_TABLE !== 'undefined' ? SKILL_UNLOCK_TABLE[element] : null;
                            if (starterTable && starterTable[1]) {
                                starterTable[1].forEach(skillId => {
                                    if (!Player.skills.includes(skillId)) Player.skills.push(skillId);
                                });
                            }
                            count++;
                        }
                    }
                }
                this.refreshUI();
                console.log(`[Debug] 已觉醒 ${count} 个新元素`);
                alert(`已觉醒 ${count} 个新元素！`);
            }
        } catch (e) {
            console.error('[Debug] awakenAllElements错误:', e);
            alert('觉醒失败: ' + e.message);
        }
    },
    
    // 突破到指定境界
    breakthroughTo(realm) {
        try {
            if (typeof RealmSystem !== 'undefined' && RealmSystem.breakthrough) {
                // 先确保等级足够
                const levelReq = { initial: 1, middle: 11, high: 31, super: 56 };
                if (Player.level < levelReq[realm]) {
                    Player.level = levelReq[realm];
                    if (Player.updateStats) Player.updateStats();
                }
                
                const result = RealmSystem.breakthrough(realm);
                this.refreshUI();
                
                if (result.success) {
                    console.log(`[Debug] 已突破到 ${realm} 境界`);
                    alert(`已突破到 ${realm} 境界！`);
                } else {
                    alert('突破失败: ' + (result.message || '未知原因'));
                }
            } else {
                alert('RealmSystem 不存在');
            }
        } catch (e) {
            console.error('[Debug] breakthroughTo错误:', e);
            alert('突破失败: ' + e.message);
        }
    },
    
    // ========== 天赋相关功能 ==========
    
    // 刷新天生天赋列表
    refreshInnateTalentList() {
        try {
            const container = document.getElementById('innate-talent-list');
            if (!container || typeof DataInnateTalents === 'undefined') return;
            let html = '';
            for (const id in DataInnateTalents) {
                const t = DataInnateTalents[id];
                const isActive = Player.innateTalent === id;
                const bgColor = isActive ? '#228844' : '#4444aa';
                html += `<button onclick="DebugPanel.setInnateTalent('${id}')" style="background: ${bgColor}; color: #fff; border: none; padding: 4px 6px; border-radius: 3px; cursor: pointer; font-size: 10px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.effectDesc || t.description || ''}">${t.icon || ''} ${t.name}${isActive ? ' ✓' : ''}</button>`;
            }
            container.innerHTML = html;
        } catch (e) {
            console.error('[Debug] refreshInnateTalentList错误:', e);
        }
    },
    
    // 设置天生天赋
    setInnateTalent(talentId) {
        try {
            if (typeof InnateTalentSystem !== 'undefined') {
                InnateTalentSystem.setInnateTalent(talentId);
                const talent = InnateTalentSystem.getTalent(talentId);
                // 如果是绑定系天赋，同时设置系别
                if (talent && talent.boundElement) {
                    Player.element = talent.boundElement;
                    if (!Player.elements.includes(talent.boundElement)) {
                        Player.elements.push(talent.boundElement);
                    }
                }
                this.refreshInnateTalentList();
                this.refreshUI();
                console.log(`[Debug] 已设置天生天赋: ${talent?.name || talentId}`);
                alert(`已设置天生天赋: ${talent?.name || talentId}`);
            }
        } catch (e) {
            console.error('[Debug] setInnateTalent错误:', e);
            alert('设置天赋失败: ' + e.message);
        }
    },
    
    // 刷新系天赋列表
    refreshElementTalentList() {
        try {
            const select = document.getElementById('talent-element-select');
            const container = document.getElementById('element-talent-list');
            if (!select || !container || typeof TalentSystem === 'undefined') return;
            const element = select.value;
            const talents = TalentSystem.getElementTalents(element);
            let html = '';
            talents.forEach(t => {
                const current = Player.talents?.[element];
                const isActive = current?.talentId === t.id;
                const bgColor = isActive ? '#228844' : '#4488aa';
                html += `<button onclick="DebugPanel.setElementTalent('${element}', '${t.id}')" style="background: ${bgColor}; color: #fff; border: none; padding: 4px 6px; border-radius: 3px; cursor: pointer; font-size: 10px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t.description || ''}">${t.name}${isActive ? ' ✓' : ''}</button>`;
            });
            container.innerHTML = html;
            this.refreshTalentBranchList();
        } catch (e) {
            console.error('[Debug] refreshElementTalentList错误:', e);
        }
    },
    
    // 设置系天赋
    setElementTalent(element, talentId) {
        try {
            if (!Player.talents) Player.talents = {};
            Player.talents[element] = { talentId: talentId, level: 1, exp: 0, branch: null };
            this.refreshElementTalentList();
            this.refreshUI();
            const talent = TalentSystem.getTalent(talentId);
            console.log(`[Debug] 已设置${element}系天赋: ${talent?.name || talentId}`);
            alert(`已设置${element}系天赋: ${talent?.name || talentId}`);
        } catch (e) {
            console.error('[Debug] setElementTalent错误:', e);
            alert('设置系天赋失败: ' + e.message);
        }
    },
    
    // 设置天赋等级
    setTalentLevel(level) {
        try {
            const select = document.getElementById('talent-element-select');
            if (!select) return;
            const element = select.value;
            if (Player.talents?.[element]) {
                Player.talents[element].level = level;
                this.refreshUI();
                console.log(`[Debug] ${element}系天赋等级设置为: ${level}`);
                alert(`${element}系天赋等级已设置为 Lv.${level}`);
            } else {
                alert('请先设置该系天赋');
            }
        } catch (e) {
            console.error('[Debug] setTalentLevel错误:', e);
        }
    },
    
    // 刷新天赋分支列表
    refreshTalentBranchList() {
        try {
            const select = document.getElementById('talent-element-select');
            const container = document.getElementById('talent-branch-list');
            if (!select || !container) return;
            const element = select.value;
            const talentData = Player.talents?.[element];
            if (!talentData) {
                container.innerHTML = '<div style="color:#666; font-size:11px;">请先设置系天赋</div>';
                return;
            }
            const talent = TalentSystem.getTalent(talentData.talentId);
            if (!talent?.evolutions) {
                container.innerHTML = '<div style="color:#666; font-size:11px;">该天赋无分支</div>';
                return;
            }
            const evolveStage = talent.evolutions.find(e => e.level === 5 && e.branchChoices);
            if (!evolveStage) {
                container.innerHTML = '<div style="color:#666; font-size:11px;">该天赋无分支选择（Lv5）</div>';
                return;
            }
            let html = '';
            evolveStage.branchChoices.forEach(b => {
                const isActive = talentData.branch === b.id;
                const bgColor = isActive ? '#228844' : '#aa6644';
                html += `<button onclick="DebugPanel.setTalentBranch('${b.id}')" style="background: ${bgColor}; color: #fff; border: none; padding: 6px; border-radius: 3px; cursor: pointer; font-size: 11px; text-align: left;" title="${b.description || ''}">${b.name}${isActive ? ' ✓' : ''}<br><span style="font-size:9px; opacity:0.8;">${(b.description || '').substring(0, 30)}...</span></button>`;
            });
            container.innerHTML = html;
        } catch (e) {
            console.error('[Debug] refreshTalentBranchList错误:', e);
        }
    },
    
    // 设置天赋分支
    setTalentBranch(branchId) {
        try {
            const select = document.getElementById('talent-element-select');
            if (!select) return;
            const element = select.value;
            if (Player.talents?.[element]) {
                Player.talents[element].branch = branchId;
                this.refreshTalentBranchList();
                this.refreshUI();
                console.log(`[Debug] ${element}系天赋分支设置为: ${branchId}`);
                alert(`${element}系天赋分支已设置`);
            }
        } catch (e) {
            console.error('[Debug] setTalentBranch错误:', e);
        }
    },
    
    // 显示当前天赋信息
    showTalentInfo() {
        try {
            let info = '=== 天生天赋 ===\n';
            info += `ID: ${Player.innateTalent || '无'}\n`;
            info += `等级: ${Player.innateTalentLevel || 1}\n`;
            if (typeof InnateTalentSystem !== 'undefined') {
                const t = InnateTalentSystem.getTalent(Player.innateTalent);
                if (t) info += `名称: ${t.name}\n效果: ${t.effectDesc || t.description}\n`;
            }
            info += '\n=== 系天赋 ===\n';
            if (Player.talents) {
                for (const elem in Player.talents) {
                    const td = Player.talents[elem];
                    const t = TalentSystem.getTalent(td.talentId);
                    info += `${elem}: ${t?.name || td.talentId} Lv.${td.level}${td.branch ? ` 分支:${td.branch}` : ''}\n`;
                }
            } else {
                info += '无\n';
            }
            info += '\n=== 已觉醒系别 ===\n';
            info += (Player.elements || []).join(', ');
            alert(info);
        } catch (e) {
            console.error('[Debug] showTalentInfo错误:', e);
            alert('显示天赋信息失败: ' + e.message);
        }
    },
    
    // ========== 战斗相关功能 ==========
    
    // 战斗准备：满血满蓝满体力
    battlePrep() {
        try {
            if (typeof Player !== 'undefined') {
                const stats = Player.getTotalStats ? Player.getTotalStats() : null;
                if (stats) {
                    Player.hp = stats.maxHp;
                    Player.mp = stats.maxMp;
                }
                // v0.99.2: 体力系统已移除
                // Player.stamina = 100;
                this.refreshUI();
                console.log('[Debug] 战斗准备完成：满血满蓝');
                alert('战斗准备完成！\nHP: ' + Player.hp + '\nMP: ' + Player.mp);
            }
        } catch (e) {
            console.error('[Debug] battlePrep错误:', e);
            alert('战斗准备失败: ' + e.message);
        }
    },
    
    // 开始战斗
    startBattle(enemyId, options = {}) {
        try {
            if (typeof BattleSystem !== 'undefined' && BattleSystem.startBattle) {
                // ID兼容映射（旧ID → 新ID）
                const idMap = {
                    // 旧版ID兼容
                    'shadow_demon': 'shadow_creature',
                    'bone_spike_wolf': 'bone_spike_zheng',
                    'stone_troll': 'rock_monster',
                    'black_church_mage': 'black_church_deacon',
                    'black_beast_demon': 'black_beast',
                    // 未实现的妖魔临时映射
                    'three_eye_wolf': 'one_eye_wolf',
                    'flame_queen': 'black_church_blue_deacon',
                    'ice_saint': 'mu_bai_duel'
                };
                
                // 如果有映射，用新ID
                if (idMap[enemyId]) {
                    console.log(`[Debug] 敌人ID兼容映射: ${enemyId} → ${idMap[enemyId]}`);
                    enemyId = idMap[enemyId];
                }
                
                // 获取敌人数据
                let enemyData = null;
                if (typeof DataEnemies !== 'undefined' && DataEnemies[enemyId]) {
                    enemyData = DataEnemies[enemyId];
                } else if (typeof DataCharacters !== 'undefined' && DataCharacters[enemyId]) {
                    // NPC决斗
                    const npc = DataCharacters[enemyId];
                    enemyData = {
                        id: enemyId,
                        name: npc.name || enemyId,
                        level: npc.level || 5,
                        maxHp: (npc.stats?.maxHp) || 100,
                        maxMp: (npc.stats?.maxMp) || 50,
                        attack: (npc.stats?.attack) || 10,
                        defense: (npc.stats?.defense) || 5,
                        speed: (npc.stats?.speed) || 10,
                        element: npc.element || 'fire',
                        skills: npc.skills || []
                    };
                }
                
                if (enemyData) {
                    // 切换到战斗状态
                    if (typeof Game !== 'undefined') {
                        Game.state = 'battle';
                        Game.battleEndCallback = null;
                    }
                    BattleSystem.startBattle(enemyData, options);
                    // 渲染战斗界面
                    if (typeof UI !== 'undefined' && UI.renderBattleScreen) {
                        UI.renderBattleScreen();
                    }
                    this.toggle(); // 关闭调试面板
                    console.log(`[Debug] 开始战斗: ${enemyId}`, options);
                } else {
                    alert('找不到敌人数据: ' + enemyId);
                }
            } else {
                alert('BattleSystem 不存在');
            }
        } catch (e) {
            console.error('[Debug] startBattle错误:', e);
            alert('战斗失败: ' + e.message);
        }
    },
    
    // 自定义战斗
    startCustomBattle() {
        try {
            const enemyId = document.getElementById('debug-enemy-id').value;
            if (!enemyId) {
                alert('请输入妖魔ID');
                return;
            }
            this.startBattle(enemyId);
        } catch (e) {
            console.error('[Debug] startCustomBattle错误:', e);
            alert('战斗失败: ' + e.message);
        }
    },
    
    // 开始车轮战
    startGauntlet() {
        try {
            if (typeof Game !== 'undefined' && Game.startGauntlet) {
                // 准备3个敌人：切磋同学、穆白、赵坤三
                const enemies = [
                    DataEnemies['mage_student'],
                    DataEnemies['mu_bai_duel'],
                    DataEnemies['zhao_kunsan_duel']
                ];
                Game.startGauntlet(enemies);
                this.toggle(); // 关闭调试面板
                console.log('[Debug] 开始车轮战：3个对手');
            } else {
                alert('Game.startGauntlet 不存在');
            }
        } catch (e) {
            console.error('[Debug] startGauntlet错误:', e);
            alert('车轮战失败: ' + e.message);
        }
    },
    
    // 触发随机事件
    triggerRandomEvent() {
        try {
            if (typeof EventSystem !== 'undefined' && EventSystem.triggerRandomEvent) {
                EventSystem.triggerRandomEvent();
                this.toggle(); // 关闭调试面板
                console.log('[Debug] 触发随机事件');
            } else {
                alert('EventSystem 不存在');
            }
        } catch (e) {
            console.error('[Debug] triggerRandomEvent错误:', e);
            alert('触发事件失败: ' + e.message);
        }
    },
    
    // 触发大事件
    triggerBigEvent(eventId) {
        try {
            if (typeof BigEventSystem !== 'undefined' && BigEventSystem.triggerBigEvent) {
                // v1.2.1: debug触发大事件前自动满足条件
                const event = typeof DataManager !== 'undefined' ? DataManager.getBigEvent(eventId) : null;
                if (event && event.conditions) {
                    // 自动满足等级条件
                    if (event.conditions.minLevel && Player.level < event.conditions.minLevel) {
                        Player.level = event.conditions.minLevel;
                        console.log(`[Debug] 自动设置等级为${event.conditions.minLevel}`);
                    }
                    // 自动完成前置任务
                    if (event.conditions.requiredQuests) {
                        for (const questId of event.conditions.requiredQuests) {
                            if (!Player.isQuestComplete(questId)) {
                                Player.completeQuest(questId);
                                console.log(`[Debug] 自动完成前置任务: ${questId}`);
                            }
                        }
                    }
                }
                BigEventSystem.triggerBigEvent(eventId);
                this.toggle(); // 关闭调试面板
                console.log(`[Debug] 触发大事件: ${eventId}`);
            } else {
                alert('BigEventSystem 不存在');
            }
        } catch (e) {
            console.error('[Debug] triggerBigEvent错误:', e);
            alert('触发大事件失败: ' + e.message);
        }
    },
    
    // ========== 其他功能 ==========
    
    refreshUI() {
        try {
            // 刷新主界面（根据当前状态）
            if (typeof UI !== 'undefined' && typeof Game !== 'undefined') {
                if (Game.state === 'map' && UI.renderMapScreen) {
                    UI.renderMapScreen();
                } else if (Game.state === 'character' && UI.renderCharacterScreen) {
                    UI.renderCharacterScreen();
                }
            }
            
            // 只刷新战斗界面（如果在战斗中）
            if (typeof UI !== 'undefined' && typeof BattleSystem !== 'undefined' && BattleSystem.active) {
                if (UI.updateBattleScreen) UI.updateBattleScreen();
            }
            
            // 更新调试面板中的数值显示
            this.refreshValues();
        } catch (e) {
            console.warn('[Debug] refreshUI警告:', e);
        }
    },
    
    // 开启debug模式
    enable() {
        try {
            localStorage.setItem('debug_mode', '1');
            location.reload();
        } catch (e) {
            console.error('[Debug] enable错误:', e);
        }
    },
    
    // ========== 剧情调试 ==========

    setFlag(value) {
        try {
            const name = document.getElementById('debug-flag-name').value.trim();
            if (!name) return;
            if (typeof WorldState !== 'undefined') {
                if (value) {
                    WorldState.setFlag(name, true);
                    console.log(`[Debug] Flag设置: ${name} = true`);
                } else {
                    WorldState.setFlag(name, false);
                    console.log(`[Debug] Flag清除: ${name}`);
                }
                this.showStoryState();
            }
        } catch (e) {
            console.error('[Debug] setFlag错误:', e);
        }
    },

    storyPhase(phase) {
        try {
            if (typeof WorldState === 'undefined') return;
            const flags = {
                start: [],
                school: ['quest_intro_completed'],
                before_disaster: ['quest_intro_completed', 'witnessed_demon_migration', 'saw_mu_he_stranger', 'saw_tang_yue_roof'],
                after_disaster: ['bocheng_disaster_happened', 'quest_intro_completed'],
                leave: ['bocheng_disaster_happened', 'quest_journey_to_mingzhu_active']
            };
            // 先清除所有剧情flag
            ['bocheng_disaster_happened','witnessed_demon_migration','saw_mu_he_stranger','saw_tang_yue_roof','found_ancient_cave','heard_spring_whisper','found_black_church_mark','eve_of_disaster_witnessed'].forEach(f => WorldState.setFlag(f, false));
            // 设置对应阶段flag
            (flags[phase] || []).forEach(f => WorldState.setFlag(f, true));
            // 设置对应天数和等级
            if (typeof Player !== 'undefined') {
                if (phase === 'before_disaster') Player.day = 42;
                if (phase === 'after_disaster') Player.day = 45;
                if (phase === 'leave') Player.day = 50;
                if (phase === 'before_disaster' || phase === 'after_disaster' || phase === 'leave') Player.level = 8;
            }
            this.showStoryState();
            if (typeof UI !== 'undefined' && UI.renderMapScreen) UI.renderMapScreen();
            console.log(`[Debug] 剧情阶段: ${phase}`);
        } catch (e) {
            console.error('[Debug] storyPhase错误:', e);
        }
    },

    triggerEvent() {
        try {
            const id = document.getElementById('debug-event-id').value.trim();
            if (!id) return;
            if (typeof EventSystem !== 'undefined') {
                EventSystem.triggerEvent(id);
                this.toggle();
                console.log(`[Debug] 触发事件: ${id}`);
            }
        } catch (e) {
            console.error('[Debug] triggerEvent错误:', e);
        }
    },

    setNpcRel() {
        try {
            const npcId = document.getElementById('debug-npc-id').value.trim();
            const opinion = parseInt(document.getElementById('debug-opinion').value) || 50;
            const trust = parseInt(document.getElementById('debug-trust').value) || 50;
            if (!npcId) return;
            if (typeof NPCStateSystem !== 'undefined') {
                const state = NPCStateSystem.getNPCState(npcId);
                state.opinion = opinion;
                state.trust = trust;
                console.log(`[Debug] ${npcId} 好感=${opinion} 信任=${trust}`);
                alert(`已设置 ${npcId}: 好感=${opinion} 信任=${trust}`);
            }
        } catch (e) {
            console.error('[Debug] setNpcRel错误:', e);
        }
    },

    // v0.54.0: 新NPC关系设置（下拉框方式）
    setNpcRelation() {
        try {
            const npcId = document.getElementById('debug-npc-select').value;
            const opinion = parseInt(document.getElementById('debug-npc-opinion').value) || 0;
            const trust = parseInt(document.getElementById('debug-npc-trust').value) || 0;
            if (!npcId) { alert('请选择NPC'); return; }
            if (typeof NPCStateSystem !== 'undefined') {
                const state = NPCStateSystem.getNPCState(npcId);
                state.opinion = opinion;
                state.trust = trust;
                const charData = (typeof DataManager !== 'undefined') ? DataManager.getCharacter(npcId) : null;
                const name = charData ? charData.name : npcId;
                console.log(`[Debug] ${name}(${npcId}) 好感=${opinion} 信任=${trust}`);
                alert(`已设置 ${name}: 好感=${opinion} 信任=${trust}`);
            }
        } catch (e) {
            console.error('[Debug] setNpcRelation错误:', e);
        }
    },

    // v0.54.0: 快速预设关系
    quickNpcRel(value) {
        try {
            const npcId = document.getElementById('debug-npc-select').value;
            if (!npcId) { alert('请先选择NPC'); return; }
            document.getElementById('debug-npc-opinion').value = value;
            document.getElementById('debug-npc-trust').value = Math.floor(value * 0.7);
            this.setNpcRelation();
        } catch (e) {
            console.error('[Debug] quickNpcRel错误:', e);
        }
    },

    // v0.54.0: 显示所有NPC关系
    showAllNpcRelations() {
        try {
            const el = document.getElementById('debug-npc-relations');
            if (!el) return;
            if (typeof NPCStateSystem === 'undefined') {
                el.innerHTML = 'NPCStateSystem未加载';
                return;
            }
            const states = NPCStateSystem._npcStates || {};
            const entries = Object.entries(states)
                .filter(([id, s]) => (s.opinion || 0) !== 0 || (s.trust || 0) !== 0)
                .sort((a, b) => (b[1].opinion || 0) - (a[1].opinion || 0));
            if (entries.length === 0) {
                el.innerHTML = '（暂无非零关系的NPC）';
                return;
            }
            let html = '';
            for (const [npcId, state] of entries) {
                const charData = (typeof DataManager !== 'undefined') ? DataManager.getCharacter(npcId) : null;
                const name = charData ? charData.name : npcId;
                html += `<div style="margin-bottom: 4px;"><b>${name}</b> (${npcId}): 好感=${state.opinion || 0}, 信任=${state.trust || 0}</div>`;
            }
            el.innerHTML = html;
        } catch (e) {
            console.error('[Debug] showAllNpcRelations错误:', e);
        }
    },

    // v0.54.0: 手动输入ID设置
    setNpcRelationManual() {
        try {
            const npcId = document.getElementById('debug-npc-id-manual').value.trim();
            const opinion = parseInt(document.getElementById('debug-npc-opinion-manual').value) || 0;
            if (!npcId) return;
            if (typeof NPCStateSystem !== 'undefined') {
                const state = NPCStateSystem.getNPCState(npcId);
                state.opinion = opinion;
                state.trust = Math.floor(opinion * 0.7);
                console.log(`[Debug] ${npcId} 好感=${opinion}`);
                alert(`已设置 ${npcId}: 好感=${opinion}`);
            }
        } catch (e) {
            console.error('[Debug] setNpcRelationManual错误:', e);
        }
    },

    showStoryState() {
        try {
            const el = document.getElementById('debug-story-state');
            if (!el) return;
            let html = '';
            // Flags
            if (typeof WorldState !== 'undefined') {
                const allFlags = WorldState.globalFlags || {};
                const trueFlags = Object.keys(allFlags).filter(k => allFlags[k]);
                html += '<b style="color:#88aaff;">已激活的Flag:</b><br>';
                html += trueFlags.length ? trueFlags.map(f => `✓ ${f}`).join('<br>') : '（无）';
                html += '<br><br>';
                // 信息碎片
                const known = WorldState.knownInfo || [];
                html += '<b style="color:#aaff88;">已收集的信息碎片:</b><br>';
                html += known.length ? known.map(i => `📋 ${i}`).join('<br>') : '（无）';
            }
            el.innerHTML = html;
        } catch (e) {
            console.error('[Debug] showStoryState错误:', e);
        }
    },

    // 关闭debug模式
    disable() {
        try {
            localStorage.removeItem('debug_mode');
            location.reload();
        } catch (e) {
            console.error('[Debug] disable错误:', e);
        }
    }
};

// 确保全局可访问
window.DebugPanel = DebugPanel;

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            DebugPanel.init();
        } catch (e) {
            console.error('[Debug] 初始化失败:', e);
        }
    });
} else {
    try {
        DebugPanel.init();
    } catch (e) {
        console.error('[Debug] 初始化失败:', e);
    }
}
