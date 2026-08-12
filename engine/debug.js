/**
 * Debug模式 - 调试工具
 * 用于开发和测试时快速调节数值、生成物品、传送等
 * 
 * 开启方式：
 * 1. URL参数：?debug=1
 * 2. 快捷键：按 ~ 键（波浪号）切换
 * 3. 控制台：DebugPanel.toggle()
 */

const DebugPanel = {
    isOpen: false,
    isEnabled: false,
    
    // 初始化
    init() {
        // 检查URL参数
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === '1') {
            this.isEnabled = true;
        }
        
        // 检查localStorage
        if (localStorage.getItem('debug_mode') === '1') {
            this.isEnabled = true;
        }
        
        if (this.isEnabled) {
            this.createPanel();
            this.bindShortcuts();
            console.log('%c🔧 Debug模式已开启', 'color: #00ff00; font-weight: bold; font-size: 14px;');
        }
    },
    
    // 绑定快捷键
    bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ~ 键切换面板
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                this.toggle();
            }
            
            // F5 刷新时保持debug模式
            if (e.key === 'F5') {
                localStorage.setItem('debug_mode', '1');
            }
        });
    },
    
    // 创建面板
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.innerHTML = `
            <style>
                #debug-panel {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 320px;
                    height: 100vh;
                    background: rgba(10, 10, 30, 0.95);
                    border-left: 2px solid #6666aa;
                    z-index: 9999999;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    font-family: "Microsoft YaHei", sans-serif;
                    font-size: 13px;
                    color: #ccc;
                }
                #debug-panel.open {
                    transform: translateX(0);
                }
                #debug-panel .debug-header {
                    padding: 10px 15px;
                    background: linear-gradient(135deg, #333366, #444488);
                    color: #fff;
                    font-weight: bold;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: move;
                }
                #debug-panel .debug-toggle {
                    position: fixed;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    background: #444488;
                    color: #fff;
                    padding: 10px 5px;
                    border-radius: 5px 0 0 5px;
                    cursor: pointer;
                    z-index: 9999998;
                    writing-mode: vertical-rl;
                    font-size: 12px;
                }
                #debug-panel .debug-tabs {
                    display: flex;
                    background: #1a1a2e;
                    border-bottom: 1px solid #333;
                    overflow-x: auto;
                }
                #debug-panel .debug-tab {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    white-space: nowrap;
                    font-size: 12px;
                }
                #debug-panel .debug-tab:hover {
                    background: #2a2a4e;
                }
                #debug-panel .debug-tab.active {
                    border-bottom-color: #6666ff;
                    color: #fff;
                }
                #debug-panel .debug-content {
                    height: calc(100vh - 90px);
                    overflow-y: auto;
                    padding: 10px;
                }
                #debug-panel .debug-section {
                    margin-bottom: 15px;
                }
                #debug-panel .debug-section-title {
                    font-weight: bold;
                    color: #8888ff;
                    margin-bottom: 8px;
                    padding-bottom: 4px;
                    border-bottom: 1px solid #333;
                }
                #debug-panel .debug-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 6px;
                    gap: 8px;
                }
                #debug-panel .debug-label {
                    flex: 1;
                    font-size: 12px;
                }
                #debug-panel .debug-input {
                    width: 60px;
                    background: #222;
                    border: 1px solid #444;
                    color: #fff;
                    padding: 3px 5px;
                    border-radius: 3px;
                    font-size: 12px;
                    text-align: center;
                }
                #debug-panel .debug-btn {
                    background: #4444aa;
                    color: #fff;
                    border: none;
                    padding: 4px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                }
                #debug-panel .debug-btn:hover {
                    background: #5555cc;
                }
                #debug-panel .debug-btn-small {
                    padding: 2px 6px;
                    font-size: 11px;
                }
                #debug-panel .debug-btn-green {
                    background: #228844;
                }
                #debug-panel .debug-btn-green:hover {
                    background: #33aa55;
                }
                #debug-panel .debug-btn-red {
                    background: #aa4444;
                }
                #debug-panel .debug-btn-red:hover {
                    background: #cc5555;
                }
                #debug-panel .debug-btn-yellow {
                    background: #aa8844;
                }
                #debug-panel .debug-btn-yellow:hover {
                    background: #ccaa55;
                }
                #debug-panel .debug-select {
                    background: #222;
                    border: 1px solid #444;
                    color: #fff;
                    padding: 3px 5px;
                    border-radius: 3px;
                    font-size: 12px;
                    flex: 1;
                }
                #debug-panel .debug-log {
                    background: #111;
                    border: 1px solid #333;
                    padding: 8px;
                    border-radius: 3px;
                    font-family: monospace;
                    font-size: 11px;
                    max-height: 150px;
                    overflow-y: auto;
                }
                #debug-panel .debug-log-item {
                    margin-bottom: 3px;
                    color: #888;
                }
                #debug-panel .debug-log-item.success {
                    color: #44ff44;
                }
                #debug-panel .debug-log-item.error {
                    color: #ff4444;
                }
                #debug-panel .debug-log-item.info {
                    color: #44aaff;
                }
                #debug-panel .debug-divider {
                    height: 1px;
                    background: #333;
                    margin: 10px 0;
                }
                #debug-panel .preset-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                }
            </style>
            
            <div class="debug-toggle" onclick="DebugPanel.toggle()">🔧 调试</div>
            
            <div class="debug-header">
                <span>🔧 调试工具</span>
                <span style="cursor: pointer;" onclick="DebugPanel.toggle()">✕</span>
            </div>
            
            <div class="debug-tabs">
                <div class="debug-tab active" data-tab="player" onclick="DebugPanel.switchTab('player')">玩家</div>
                <div class="debug-tab" data-tab="items" onclick="DebugPanel.switchTab('items')">物品</div>
                <div class="debug-tab" data-tab="teleport" onclick="DebugPanel.switchTab('teleport')">传送</div>
                <div class="debug-tab" data-tab="time" onclick="DebugPanel.switchTab('time')">时间</div>
                <div class="debug-tab" data-tab="battle" onclick="DebugPanel.switchTab('battle')">战斗</div>
                <div class="debug-tab" data-tab="save" onclick="DebugPanel.switchTab('save')">存档</div>
                <div class="debug-tab" data-tab="other" onclick="DebugPanel.switchTab('other')">其他</div>
            </div>
            
            <div class="debug-content">
                <!-- 玩家标签页 -->
                <div id="debug-tab-player" class="debug-tab-content">
                    <div class="debug-section">
                        <div class="debug-section-title">基础属性</div>
                        <div class="debug-row">
                            <span class="debug-label">等级</span>
                            <input type="number" class="debug-input" id="debug-level" value="1">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setLevel()">设置</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">经验</span>
                            <input type="number" class="debug-input" id="debug-exp" value="0">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setExp()">设置</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">金币</span>
                            <input type="number" class="debug-input" id="debug-gold" value="0">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setGold()">设置</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">+1000金币</span>
                            <button class="debug-btn debug-btn-green debug-btn-small" onclick="DebugPanel.addGold(1000)">+1000</button>
                            <button class="debug-btn debug-btn-green debug-btn-small" onclick="DebugPanel.addGold(10000)">+1万</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">生命值/魔法值</div>
                        <div class="debug-row">
                            <span class="debug-label">当前HP</span>
                            <input type="number" class="debug-input" id="debug-hp" value="100">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setHp()">设置</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">当前MP</span>
                            <input type="number" class="debug-input" id="debug-mp" value="50">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setMp()">设置</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">体力</span>
                            <input type="number" class="debug-input" id="debug-stamina" value="100">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setStamina()">设置</button>
                        </div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-green" style="flex: 1;" onclick="DebugPanel.fullRestore()">满血满蓝满体力</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">天赋系统</div>
                        <div class="debug-row">
                            <span class="debug-label">元素系</span>
                            <select class="debug-select" id="debug-talent-element">
                                <option value="fire">火系</option>
                                <option value="ice">冰系</option>
                                <option value="thunder">雷系</option>
                                <option value="earth">土系</option>
                                <option value="wind">风系</option>
                                <option value="water">水系</option>
                                <option value="light">光系</option>
                                <option value="dark">暗影</option>
                                <option value="heal">治愈</option>
                                <option value="summon">召唤</option>
                            </select>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">天赋等级</span>
                            <input type="number" class="debug-input" id="debug-talent-level" value="1" min="1" max="10">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.setTalentLevel()">设置</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">天赋经验</span>
                            <input type="number" class="debug-input" id="debug-talent-exp" value="0">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addTalentExp()">增加</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">觉醒新系</div>
                        <div class="preset-grid">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('fire')">觉醒火系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('ice')">觉醒冰系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('thunder')">觉醒雷系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('earth')">觉醒土系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('wind')">觉醒风系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('water')">觉醒水系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('light')">觉醒光系</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('dark')">觉醒暗影</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('heal')">觉醒治愈</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.awakenElement('summon')">觉醒召唤</button>
                        </div>
                    </div>
                </div>
                
                <!-- 物品标签页 -->
                <div id="debug-tab-items" class="debug-tab-content" style="display: none;">
                    <div class="debug-section">
                        <div class="debug-section-title">快速添加</div>
                        <div class="preset-grid">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('health_potion', 10)">小血瓶x10</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('mana_potion', 10)">小蓝瓶x10</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('super_health_potion', 5)">超级血瓶x5</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('super_mana_potion', 5)">超级蓝瓶x5</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('demon_core', 20)">妖魔内核x20</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('magic_stone', 20)">魔法石x20</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('magic_crystal', 10)">魔法水晶x10</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('stamina_potion', 10)">体力药水x10</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">灵种（凡种）</div>
                        <div class="preset-grid">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('fire_basic', 1)">凡火种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('ice_basic', 1)">凡冰种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('thunder_basic', 1)">凡雷种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('earth_basic', 1)">凡土种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('wind_basic', 1)">凡风种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('water_basic', 1)">凡水种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('light_basic', 1)">凡光种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('dark_basic', 1)">凡暗种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('heal_basic', 1)">凡愈种</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('summon_basic', 1)">凡召种</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">星尘魔器（凡级）</div>
                        <div class="preset-grid">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_fire', 1)">火尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_ice', 1)">冰尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_thunder', 1)">雷尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_earth', 1)">土尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_wind', 1)">风尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_water', 1)">水尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_light', 1)">光尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_dark', 1)">暗尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_heal', 1)">愈尘魔器</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addItem('star_dust_basic_summon', 1)">召尘魔器</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">成长型星尘魔器</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-yellow" style="flex: 1;" onclick="DebugPanel.addItem('little_loach_pendant', 1)">🐟 小泥鳅坠（传说）</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">自定义添加</div>
                        <div class="debug-row">
                            <span class="debug-label">物品ID</span>
                            <input type="text" class="debug-input" id="debug-item-id" style="width: 120px;" placeholder="item_id">
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">数量</span>
                            <input type="number" class="debug-input" id="debug-item-count" value="1" min="1">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.addCustomItem()">添加</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">清空背包</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-red" style="flex: 1;" onclick="DebugPanel.clearInventory()">⚠️ 清空所有物品</button>
                        </div>
                    </div>
                </div>
                
                <!-- 传送标签页 -->
                <div id="debug-tab-teleport" class="debug-tab-content" style="display: none;">
                    <div class="debug-section">
                        <div class="debug-section-title">快速传送</div>
                        <div id="debug-teleport-list">
                            <!-- 动态生成 -->
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">解锁所有地点</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-green" style="flex: 1;" onclick="DebugPanel.unlockAllLocations()">解锁全部地点</button>
                        </div>
                    </div>
                </div>
                
                <!-- 时间标签页 -->
                <div id="debug-tab-time" class="debug-tab-content" style="display: none;">
                    <div class="debug-section">
                        <div class="debug-section-title">时间跳转</div>
                        <div class="debug-row">
                            <span class="debug-label">跳过</span>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.skipTime(1, 'hour')">1小时</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.skipTime(1, 'day')">1天</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.skipTime(7, 'day')">7天</button>
                        </div>
                        <div class="debug-row">
                            <span class="debug-label">自定义天数</span>
                            <input type="number" class="debug-input" id="debug-skip-days" value="1" min="1">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.skipCustomDays()">跳过</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">当前时间</div>
                        <div id="debug-current-time" style="font-size: 12px; color: #aaa;">
                            <!-- 动态显示 -->
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">体力恢复</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-green" style="flex: 1;" onclick="DebugPanel.restoreStamina()">恢复满体力</button>
                        </div>
                    </div>
                </div>
                
                <!-- 战斗标签页 -->
                <div id="debug-tab-battle" class="debug-tab-content" style="display: none;">
                    <div class="debug-section">
                        <div class="debug-section-title">快速战斗</div>
                        <div class="debug-row">
                            <span class="debug-label">敌人</span>
                            <select class="debug-select" id="debug-battle-enemy">
                                <option value="demon_wolf">幽狼兽 (Lv.5)</option>
                                <option value="one_eye_wolf">独眼魔狼 (Lv.4)</option>
                                <option value="student_rival">切磋同学 (Lv.3)</option>
                                <option value="giant_eye_rat">巨眼猩鼠 (Lv.2)</option>
                                <option value="three_eye_demon_wolf">三眼魔狼 (Lv.6)</option>
                                <option value="blood_rune_giant_rat">血纹巨鼠 (Lv.3)</option>
                            </select>
                        </div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-red" style="flex: 1;" onclick="DebugPanel.startBattle()">⚔️ 开始战斗</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">战斗调试</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.killEnemy()">秒杀敌人</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.winBattle()">直接胜利</button>
                        </div>
                    </div>
                </div>
                
                <!-- 存档标签页 -->
                <div id="debug-tab-save" class="debug-tab-content" style="display: none;">
                    <div class="debug-section">
                        <div class="debug-section-title">预设存档</div>
                        <div class="preset-grid">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.loadPresetSave('newbie')">新手Lv.1</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.loadPresetSave('early')">初期Lv.3</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.loadPresetSave('mid')">中期Lv.5</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.loadPresetSave('battle')">战斗测试</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.loadPresetSave('economy')">经济测试</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.loadPresetSave('max')">满配Lv.10</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">存档管理</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-green" style="flex: 1;" onclick="DebugPanel.exportSave()">📤 导出存档</button>
                        </div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-yellow" style="flex: 1;" onclick="DebugPanel.importSave()">📥 导入存档</button>
                        </div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-red" style="flex: 1;" onclick="DebugPanel.resetGame()">⚠️ 重置游戏</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">快速生成存档</div>
                        <div class="debug-row">
                            <span class="debug-label">目标等级</span>
                            <input type="number" class="debug-input" id="debug-gen-level" value="5" min="1" max="10">
                        </div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-green" style="flex: 1;" onclick="DebugPanel.generateSave()">🎯 生成指定等级存档</button>
                        </div>
                    </div>
                </div>
                
                <!-- 其他标签页 -->
                <div id="debug-tab-other" class="debug-tab-content" style="display: none;">
                    <div class="debug-section">
                        <div class="debug-section-title">刷新UI</div>
                        <div class="debug-row">
                            <button class="debug-btn" style="flex: 1;" onclick="DebugPanel.refreshUI()">🔄 刷新所有UI</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">事件触发</div>
                        <div class="debug-row">
                            <span class="debug-label">事件ID</span>
                            <input type="text" class="debug-input" id="debug-event-id" style="width: 120px;" placeholder="event_id">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.triggerEvent()">触发</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">日常系统</div>
                        <div class="debug-row">
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.resetDaily()">重置每日</button>
                            <button class="debug-btn debug-btn-small" onclick="DebugPanel.completeAllDaily()">全完成</button>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">调试日志</div>
                        <div class="debug-log" id="debug-log">
                            <div class="debug-log-item info">Debug面板已就绪</div>
                        </div>
                    </div>
                    
                    <div class="debug-section">
                        <div class="debug-section-title">关于</div>
                        <div style="font-size: 11px; color: #888;">
                            全职法师 Debug模式<br>
                            按 ~ 键切换面板<br>
                            URL加 ?debug=1 开启
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // 初始化传送列表
        this.initTeleportList();
        
        // 更新时间显示
        this.updateTimeDisplay();
        setInterval(() => this.updateTimeDisplay(), 1000);
    },
    
    // 切换面板
    toggle() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            this.isOpen = !this.isOpen;
            panel.classList.toggle('open', this.isOpen);
            
            if (this.isOpen) {
                this.refreshValues();
            }
        }
    },
    
    // 切换标签页
    switchTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 更新内容显示
        document.querySelectorAll('.debug-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById('debug-tab-' + tabName).style.display = 'block';
    },
    
    // 刷新数值显示
    refreshValues() {
        if (typeof Player === 'undefined') return;
        
        document.getElementById('debug-level').value = Player.level || 1;
        document.getElementById('debug-exp').value = Player.exp || 0;
        document.getElementById('debug-gold').value = Player.gold || 0;
        document.getElementById('debug-hp').value = Player.hp || 100;
        document.getElementById('debug-mp').value = Player.mp || 50;
        document.getElementById('debug-stamina').value = Player.stamina || 100;
    },
    
    // 日志输出
    log(message, type = 'info') {
        const logDiv = document.getElementById('debug-log');
        if (!logDiv) return;
        
        const item = document.createElement('div');
        item.className = 'debug-log-item ' + type;
        item.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logDiv.appendChild(item);
        logDiv.scrollTop = logDiv.scrollHeight;
        
        console.log('[Debug]', message);
    },
    
    // ========== 玩家相关功能 ==========
    
    setLevel() {
        const level = parseInt(document.getElementById('debug-level').value);
        if (level < 1) level = 1;
        
        Player.level = level;
        Player.expToNextLevel = Player.getExpToNextLevel(level);
        
        // 更新属性
        Player.updateStats();
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        
        UI.refreshPlayerPanel();
        this.log(`等级设置为 ${level}`, 'success');
    },
    
    setExp() {
        const exp = parseInt(document.getElementById('debug-exp').value);
        Player.exp = exp;
        
        UI.refreshPlayerPanel();
        this.log(`经验设置为 ${exp}`, 'success');
    },
    
    setGold() {
        const gold = parseInt(document.getElementById('debug-gold').value);
        Player.gold = Math.max(0, gold);
        
        UI.refreshPlayerPanel();
        this.log(`金币设置为 ${gold}`, 'success');
    },
    
    addGold(amount) {
        Player.gold += amount;
        
        UI.refreshPlayerPanel();
        this.log(`增加 ${amount} 金币`, 'success');
    },
    
    setHp() {
        const hp = parseInt(document.getElementById('debug-hp').value);
        Player.hp = Math.max(0, Math.min(hp, Player.maxHp));
        
        UI.refreshPlayerPanel();
        this.log(`HP设置为 ${Player.hp}`, 'success');
    },
    
    setMp() {
        const mp = parseInt(document.getElementById('debug-mp').value);
        Player.mp = Math.max(0, Math.min(mp, Player.maxMp));
        
        UI.refreshPlayerPanel();
        this.log(`MP设置为 ${Player.mp}`, 'success');
    },
    
    setStamina() {
        const stamina = parseInt(document.getElementById('debug-stamina').value);
        Player.stamina = Math.max(0, Math.min(stamina, Player.maxStamina));
        
        UI.refreshPlayerPanel();
        this.log(`体力设置为 ${Player.stamina}`, 'success');
    },
    
    fullRestore() {
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        Player.stamina = Player.maxStamina;
        
        UI.refreshPlayerPanel();
        this.log('满血满蓝满体力', 'success');
    },
    
    setTalentLevel() {
        if (typeof TalentSystem === 'undefined') {
            this.log('天赋系统未加载', 'error');
            return;
        }
        
        const element = document.getElementById('debug-talent-element').value;
        const level = parseInt(document.getElementById('debug-talent-level').value);
        
        if (!Player.talents) {
            Player.talents = {};
        }
        
        if (!Player.talents[element]) {
            // 初始化天赋
            const talent = TalentSystem.getRandomTalent(element);
            Player.talents[element] = {
                talentId: talent.id,
                level: level,
                exp: 0
            };
        } else {
            Player.talents[element].level = level;
            Player.talents[element].exp = 0;
        }
        
        UI.refreshPlayerPanel();
        this.log(`${element} 天赋等级设置为 ${level}`, 'success');
    },
    
    addTalentExp() {
        const element = document.getElementById('debug-talent-element').value;
        const exp = parseInt(document.getElementById('debug-talent-exp').value);
        
        if (Player.addElementTalentExp) {
            Player.addElementTalentExp(element, exp);
        }
        
        UI.refreshPlayerPanel();
        this.log(`增加 ${element} 天赋经验 ${exp}`, 'success');
    },
    
    awakenElement(element) {
        if (Player.awakenElement) {
            const result = Player.awakenElement(element);
            if (result.success) {
                UI.refreshPlayerPanel();
                this.log(`觉醒了 ${element} 系`, 'success');
            } else {
                this.log(result.message, 'error');
            }
        } else {
            this.log('觉醒功能不可用', 'error');
        }
    },
    
    // ========== 物品相关功能 ==========
    
    addItem(itemId, count = 1) {
        if (typeof Inventory === 'undefined') {
            this.log('背包系统未加载', 'error');
            return;
        }
        
        Inventory.addItem(itemId, count);
        this.log(`添加物品: ${itemId} x${count}`, 'success');
        
        if (UI.refreshInventoryPanel) {
            UI.refreshInventoryPanel();
        }
    },
    
    addCustomItem() {
        const itemId = document.getElementById('debug-item-id').value;
        const count = parseInt(document.getElementById('debug-item-count').value);
        
        if (!itemId) {
            this.log('请输入物品ID', 'error');
            return;
        }
        
        this.addItem(itemId, count);
    },
    
    clearInventory() {
        if (!confirm('确定要清空所有物品吗？')) return;
        
        if (typeof Inventory !== 'undefined' && Inventory.data && Inventory.data.items) {
            Inventory.data.items = {};
            UI.refreshInventoryPanel();
            this.log('背包已清空', 'success');
        }
    },
    
    // ========== 传送相关功能 ==========
    
    initTeleportList() {
        if (typeof DataManager === 'undefined' || !DataManager.locations) return;
        
        const listDiv = document.getElementById('debug-teleport-list');
        if (!listDiv) return;
        
        let html = '';
        for (const id in DataManager.locations) {
            const loc = DataManager.locations[id];
            html += `<div class="debug-row">
                <span class="debug-label">${loc.name}</span>
                <button class="debug-btn debug-btn-small" onclick="DebugPanel.teleport('${id}')">传送</button>
            </div>`;
        }
        
        listDiv.innerHTML = html;
    },
    
    teleport(locationId) {
        if (typeof Game !== 'undefined' && Game.goToLocation) {
            Game.goToLocation(locationId);
            this.log(`传送到: ${locationId}`, 'success');
        } else if (typeof MapSystem !== 'undefined' && MapSystem.moveTo) {
            MapSystem.moveTo(locationId);
            this.log(`传送到: ${locationId}`, 'success');
        } else {
            this.log('传送功能不可用', 'error');
        }
    },
    
    unlockAllLocations() {
        if (typeof Player !== 'undefined' && Player.data) {
            if (!Player.unlockedLocations) {
                Player.unlockedLocations = [];
            }
            
            if (typeof DataManager !== 'undefined' && DataManager.locations) {
                for (const id in DataManager.locations) {
                    if (!Player.unlockedLocations.includes(id)) {
                        Player.unlockedLocations.push(id);
                    }
                }
            }
            
            this.log('已解锁所有地点', 'success');
            
            if (UI.refreshLocationPanel) {
                UI.refreshLocationPanel();
            }
        }
    },
    
    // ========== 时间相关功能 ==========
    
    skipTime(amount, unit) {
        if (typeof TimeSystem === 'undefined') {
            this.log('时间系统未加载', 'error');
            return;
        }
        
        if (unit === 'hour') {
            TimeSystem.advanceTime(amount);
        } else if (unit === 'day') {
            TimeSystem.advanceTime(amount * 24);
        }
        
        UI.refreshPlayerPanel();
        this.log(`跳过 ${amount} ${unit === 'hour' ? '小时' : '天'}`, 'success');
    },
    
    skipCustomDays() {
        const days = parseInt(document.getElementById('debug-skip-days').value);
        this.skipTime(days, 'day');
    },
    
    updateTimeDisplay() {
        const timeDiv = document.getElementById('debug-current-time');
        if (!timeDiv) return;
        
        if (typeof TimeSystem !== 'undefined' && TimeSystem.data) {
            timeDiv.innerHTML = `
                第 ${TimeSystem.data.day} 天<br>
                ${TimeSystem.data.hour}:00 (${TimeSystem.getTimePeriodName()})<br>
                体力: ${Player?.data?.stamina || 0}/${Player?.data?.maxStamina || 100}
            `;
        }
    },
    
    restoreStamina() {
        if (typeof Player !== 'undefined' && Player.data) {
            Player.stamina = Player.maxStamina;
            UI.refreshPlayerPanel();
            this.log('体力已恢复满', 'success');
        }
    },
    
    // ========== 战斗相关功能 ==========
    
    startBattle() {
        const enemyId = document.getElementById('debug-battle-enemy').value;
        
        if (typeof BattleSystem !== 'undefined' && BattleSystem.startBattle) {
            BattleSystem.startBattle(enemyId);
            this.log(`开始战斗: ${enemyId}`, 'success');
        } else {
            this.log('战斗系统未加载', 'error');
        }
    },
    
    killEnemy() {
        if (typeof BattleSystem !== 'undefined' && BattleSystem.enemy) {
            BattleSystem.enemy.hp = 0;
            BattleSystem.checkBattleEnd();
            this.log('秒杀敌人', 'success');
        } else {
            this.log('当前不在战斗中', 'error');
        }
    },
    
    winBattle() {
        if (typeof BattleSystem !== 'undefined' && BattleSystem.endBattle) {
            BattleSystem.endBattle('win');
            this.log('直接胜利', 'success');
        } else {
            this.log('战斗系统未加载', 'error');
        }
    },
    
    // ========== 存档相关功能 ==========
    
    loadPresetSave(type) {
        this.log(`加载预设存档: ${type}`, 'info');
        // TODO: 实现预设存档生成
        this.generateSaveByType(type);
    },
    
    generateSaveByType(type) {
        // 简单实现：根据类型生成对应等级的存档
        let level = 1;
        let gold = 100;
        
        switch(type) {
            case 'newbie':
                level = 1;
                gold = 50;
                break;
            case 'early':
                level = 3;
                gold = 500;
                break;
            case 'mid':
                level = 5;
                gold = 2000;
                break;
            case 'battle':
                level = 5;
                gold = 1000;
                break;
            case 'economy':
                level = 4;
                gold = 50000;
                break;
            case 'max':
                level = 10;
                gold = 100000;
                break;
        }
        
        // 设置等级和金币
        Player.level = level;
        Player.gold = gold;
        Player.updateStats();
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        Player.stamina = Player.maxStamina;
        
        UI.refreshPlayerPanel();
        this.log(`已生成 ${type} 存档 (Lv.${level}, ${gold}金币)`, 'success');
    },
    
    generateSave() {
        const level = parseInt(document.getElementById('debug-gen-level').value);
        this.generateSaveByType('custom');
        
        Player.level = level;
        Player.gold = level * 1000;
        Player.updateStats();
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        Player.stamina = Player.maxStamina;
        
        UI.refreshPlayerPanel();
        this.log(`已生成 Lv.${level} 存档`, 'success');
    },
    
    exportSave() {
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
            
            this.log('存档已导出', 'success');
        } else {
            this.log('没有找到存档', 'error');
        }
    },
    
    importSave() {
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
                    }
                    
                    this.log('存档已导入', 'success');
                } catch (err) {
                    this.log('导入失败: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },
    
    resetGame() {
        if (!confirm('确定要重置游戏吗？所有进度将丢失！')) return;
        
        localStorage.removeItem('quanzhi_fashi_save');
        location.reload();
    },
    
    // ========== 其他功能 ==========
    
    refreshUI() {
        if (typeof UI !== 'undefined') {
            UI.refreshAll();
            this.log('UI已刷新', 'success');
        }
    },
    
    triggerEvent() {
        const eventId = document.getElementById('debug-event-id').value;
        if (!eventId) {
            this.log('请输入事件ID', 'error');
            return;
        }
        
        if (typeof EventSystem !== 'undefined' && EventSystem.triggerEvent) {
            EventSystem.triggerEvent(eventId);
            this.log(`触发事件: ${eventId}`, 'success');
        } else {
            this.log('事件系统未加载', 'error');
        }
    },
    
    resetDaily() {
        if (typeof DailySystem !== 'undefined' && DailySystem.resetDaily) {
            DailySystem.resetDaily();
            this.log('每日已重置', 'success');
        } else {
            this.log('日常系统未加载', 'error');
        }
    },
    
    completeAllDaily() {
        this.log('完成所有每日任务', 'info');
        // TODO: 实现
    },
    
    // 开启debug模式
    enable() {
        localStorage.setItem('debug_mode', '1');
        location.reload();
    },
    
    // 关闭debug模式
    disable() {
        localStorage.removeItem('debug_mode');
        location.reload();
    }
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DebugPanel.init();
    });
} else {
    DebugPanel.init();
}
