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

    // 显示消息提示
    showMessage(text) {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            cursor: pointer;
        `;

        // 创建消息框
        const msgBox = document.createElement('div');
        msgBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.95);
            border: 2px solid #6666aa;
            border-radius: 10px;
            padding: 30px 40px;
            color: #e0e0ff;
            font-size: 16px;
            line-height: 1.8;
            text-align: center;
            z-index: 1000;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 0 30px rgba(100, 100, 255, 0.3);
            white-space: pre-line;
            cursor: pointer;
        `;
        msgBox.textContent = text;

        // 点击关闭（仅点击消息框关闭，不点击遮罩层，防止误触底层按钮）
        const closeMessage = () => {
            overlay.remove();
            msgBox.remove();
        };
        msgBox.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMessage();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(msgBox);

        // 3秒后自动消失
        setTimeout(() => {
            msgBox.style.transition = 'opacity 0.5s';
            overlay.style.transition = 'opacity 0.5s';
            msgBox.style.opacity = '0';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                msgBox.remove();
            }, 500);
        }, 3000);
    },

    // ========== 标题界面 ==========
    renderTitleScreen(hasSave) {
        const container = this.elements.gameContainer;
        
        container.innerHTML = `
            <div style="
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
                "></div>
                
                <!-- 魔法粒子效果 -->
                <div id="particles" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
                
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
                ">全职法师</h1>
                
                <div style="
                    font-size: 24px;
                    color: #8888aa;
                    margin-bottom: 80px;
                    letter-spacing: 6px;
                    z-index: 10;
                ">魔法觉醒 · 开放世界</div>
                
                <div style="display: flex; flex-direction: column; gap: 15px; z-index: 10;">
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
                ">v0.3.2 · 开放世界版</div>
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
        const elements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark'];
        const elementNames = {
            fire: '🔥 火系', ice: '❄️ 冰系', thunder: '⚡ 雷系', earth: '🪨 土系',
            wind: '🌪️ 风系', water: '💧 水系', light: '✨ 光系', dark: '🌑 暗影系'
        };
        const elementColors = {
            fire: '#ff6633', ice: '#66ccff', thunder: '#ffcc00', earth: '#cc9966',
            wind: '#99ff99', water: '#6699ff', light: '#ffffcc', dark: '#9966ff'
        };

        let elementsHtml = '';
        elements.forEach(elem => {
            elementsHtml += `
                <div class="element-card" onclick="selectElement('${elem}')" 
                     id="elem-${elem}"
                     style="
                        padding: 20px;
                        background: rgba(30, 30, 60, 0.8);
                        border: 2px solid #444477;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                        font-size: 18px;
                        color: ${elementColors[elem]};
                        min-width: 100px;
                     "
                     onmouseover="this.style.borderColor='${elementColors[elem]}'; this.style.boxShadow='0 0 20px ${elementColors[elem]}40'"
                     onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='#444477'; this.style.boxShadow='none'}">
                    ${elementNames[elem]}
                </div>
            `;
        });

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
                
                <p style="color: #8888aa; margin-bottom: 40px; font-size: 16px;">觉醒你的第一个元素，开始魔法之旅</p>
                
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
                
                <p style="color: #aaa; margin-bottom: 20px;">选择觉醒元素：</p>
                
                <div style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 40px;
                ">
                    ${elementsHtml}
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

        window.confirmCreate = () => {
            if (!window.confirmEnabled || !window.selectedElement) return;
            const name = document.getElementById('char-name').value || '冒险者';
            Game.createCharacter(name, window.selectedElement);
        };
    },

    // ========== 地图/主界面 ==========
    renderMapScreen() {
        const location = MapSystem.getCurrentLocation();
        const stats = Player.getTotalStats();
        
        // 根据地点选择背景图片
        let bgImage = '';
        const locId = location?.id || '';
        if (locId === 'bo_city_street') {
            bgImage = 'assets/images/backgrounds/bo_city_view.jpg';
        }
        
        this.elements.gameContainer.innerHTML = `
            <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: ${location?.backgroundColor || '#1a1a3a'}; position: relative;">
                
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
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 25px;
                    background: rgba(0, 0, 0, 0.5);
                    border-bottom: 2px solid #444477;
                ">
                    <div style="display: flex; gap: 30px; align-items: center;">
                        <div style="color: #ffd700; font-size: 20px; font-weight: bold;">${location?.name || '未知地点'}</div>
                        <div style="color: #aaa; font-size: 14px;">${TimeSystem.getTimeDescription()} ${TimeSystem.getDayOfWeekName()}</div>
                        ${(() => {
                            const currentClass = TimeSystem.getCurrentClass(location);
                            if (currentClass) {
                                const teacher = DataManager.getCharacter(currentClass.teacher);
                                return `<div style="color: #66ccff; font-size: 13px; background: rgba(50, 80, 120, 0.5); padding: 4px 10px; border-radius: 10px;">📚 正在上：${currentClass.name}（${teacher?.name || '未知老师'}）</div>`;
                            }
                            return '';
                        })()}
                        ${TimeSystem.isNight() ? `
                            <div style="color: #ff9966; font-size: 13px; background: rgba(100, 50, 50, 0.5); padding: 4px 10px; border-radius: 10px;">
                                🌙 夜晚：敌人更强，奖励 +30%
                            </div>
                        ` : `
                            <div style="color: #66ff99; font-size: 13px; background: rgba(50, 100, 50, 0.5); padding: 4px 10px; border-radius: 10px;">
                                ☀️ 白天：安全探索时间
                            </div>
                        `}
                    </div>
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <span style="color: #ffd700;">💰 ${Player.gold}</span>
                        <span style="color: #ff6666;">❤️ ${Player.hp}/${stats.maxHp}</span>
                        <span style="color: #6666ff;">💧 ${Player.mp}/${stats.maxMp}</span>
                        <span style="color: #66ffaa;">⚡ ${Player.stamina}/${Player.maxStamina}</span>
                        <span style="color: #66ff66;">Lv.${Player.level}</span>
                    </div>
                </div>
                
                <!-- 主内容区 -->
                <div style="flex: 1; display: flex; overflow: hidden; position: relative; z-index: 1;">
                    
                    <!-- 左侧：地点行动 -->
                    <div style="flex: 2; padding: 30px; overflow-y: auto;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 22px;">📍 可执行的行动</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${(location?.actions || []).map(action => {
                                // 课程行动动态显示
                                let actionName = action.name;
                                let actionDesc = action.description;
                                if (action.isClassAction) {
                                    const currentClass = TimeSystem.getCurrentClass(location);
                                    if (currentClass) {
                                        const teacher = DataManager.getCharacter(currentClass.teacher);
                                        actionName = `上课：${currentClass.name}`;
                                        actionDesc = `${teacher?.name || '未知老师'}主讲，获得${currentClass.exp}经验${currentClass.injuryChance ? '，有受伤风险' : ''}`;
                                    } else {
                                        actionName = '自习';
                                        actionDesc = '当前没有课程，自由自习获得少量经验';
                                    }
                                }
                                return `
                                <button onclick="Game.performAction('${action.id}')" style="
                                    padding: 18px 25px;
                                    background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(60, 60, 120, 0.8));
                                    border: 2px solid #444477;
                                    border-radius: 10px;
                                    color: #e0e0ff;
                                    cursor: pointer;
                                    text-align: left;
                                    transition: all 0.3s;
                                    font-size: 16px;
                                " onmouseover="this.style.borderColor='#7777bb'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='#444477'; this.style.transform='translateX(0)'">
                                    <div style="font-size: 18px; margin-bottom: 5px;">
                                        ${action.icon || '🔹'} ${actionName}
                                        <span style="font-size: 13px; color: #888; float: right;">
                                            ⏱️ ${action.timeCost}小时 
                                            <span style="color: #66ffaa;">⚡${action.staminaCost !== undefined ? action.staminaCost : 10}</span>
                                        </span>
                                    </div>
                                    <div style="font-size: 13px; color: #999;">${actionDesc}</div>
                                </button>
                            `}).join('')}
                        </div>
                        
                        <!-- 等待时间 -->
                        <h3 style="color: #ffd700; margin: 30px 0 20px; font-size: 22px;">⏰ 时间</h3>
                        <div style="background: rgba(0, 0, 0, 0.3); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                            <div style="color: #ccc; font-size: 14px; margin-bottom: 10px;">
                                ${TimeSystem.getDetailedTimeDescription()}
                            </div>
                            <button onclick="Game.showWaitMenu()" style="
                                width: 100%;
                                padding: 12px 20px;
                                background: linear-gradient(135deg, rgba(60, 60, 100, 0.8), rgba(80, 80, 140, 0.8));
                                border: 2px solid #555588;
                                border-radius: 8px;
                                color: #e0e0ff;
                                cursor: pointer;
                                font-size: 15px;
                                transition: all 0.3s;
                            " onmouseover="this.style.borderColor='#8888bb'; this.style.background='linear-gradient(135deg, rgba(80, 80, 140, 0.8), rgba(100, 100, 180, 0.8))'" onmouseout="this.style.borderColor='#555588'; this.style.background='linear-gradient(135deg, rgba(60, 60, 100, 0.8), rgba(80, 80, 140, 0.8))'">
                                ⏰ 等待时间...
                            </button>
                        </div>
                        
                        <!-- 移动到其他地点 -->
                        ${location?.connectedLocations && location.connectedLocations.length > 0 ? `
                        <h3 style="color: #ffd700; margin: 30px 0 20px; font-size: 22px;">🚶 前往其他地点</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${location.connectedLocations.map(locId => {
                                const loc = DataManager.getLocation(locId);
                                const unlocked = Player.unlockedLocations.includes(locId);
                                return `
                                    <button onclick="Game.travelTo('${locId}')" 
                                            ${!unlocked ? 'disabled' : ''}
                                            style="
                                        padding: 15px 25px;
                                        background: ${unlocked ? 'linear-gradient(135deg, rgba(60, 40, 80, 0.8), rgba(100, 60, 140, 0.8))' : 'rgba(50, 50, 50, 0.5)'};
                                        border: 2px solid ${unlocked ? '#7755aa' : '#444'};
                                        border-radius: 10px;
                                        color: ${unlocked ? '#e0d0ff' : '#666'};
                                        cursor: ${unlocked ? 'pointer' : 'not-allowed'};
                                        text-align: left;
                                        transition: all 0.3s;
                                        font-size: 16px;
                                    " ${unlocked ? 'onmouseover="this.style.borderColor=\'#9977cc\'" onmouseout="this.style.borderColor=\'#7755aa\'"' : ''}>
                                        ${unlocked ? '🚪' : '🔒'} ${loc?.name || locId}
                                        <span style="font-size: 13px; color: #888; float: right;">旅行 2小时</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- 右侧：菜单 -->
                    <div style="width: 280px; background: rgba(0, 0, 0, 0.4); border-left: 2px solid #444477; padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 18px;">📋 菜单</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
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
                            
                            <button onclick="Game.rest()" style="
                                padding: 12px;
                                background: rgba(40, 60, 40, 0.8);
                                border: 1px solid #447744;
                                border-radius: 8px;
                                color: #d0ffd0;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
                            ">😴 休息到明天</button>
                            
                            <button onclick="Game.saveGame()" style="
                                padding: 12px;
                                background: rgba(60, 60, 40, 0.8);
                                border: 1px solid #777744;
                                border-radius: 8px;
                                color: #ffffd0;
                                cursor: pointer;
                                font-size: 15px;
                                text-align: left;
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
            </div>
        `;
    },

    // ========== 战斗界面 ==========
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
                        width: 320px;
                        max-height: 250px;
                        overflow-y: auto;
                        background: rgba(0, 0, 0, 0.6);
                        border: 1px solid #444;
                        border-radius: 8px;
                        padding: 12px;
                        font-size: 14px;
                        line-height: 1.6;
                    ">
                        ${state.log.map(log => `
                            <p style="margin-bottom: 4px; color: ${this.getLogColor(log.type)};">${log.text}</p>
                        `).join('')}
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
                        </div>
                        <div style="margin-top: 8px; width: 120px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #ff6666; margin-bottom: 2px;">
                                <span>HP</span><span>${state.player.hp}/${state.player.maxHp}</span>
                            </div>
                            <div style="height: 8px; background: #333; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.player.hp / state.player.maxHp * 100).toFixed(1)}%; background: linear-gradient(90deg, #ff4444, #ff6666); transition: width 0.5s;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6666ff; margin: 4px 0 2px;">
                                <span>MP</span><span>${state.player.mp}/${state.player.maxMp}</span>
                            </div>
                            <div style="height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.player.mp / state.player.maxMp * 100).toFixed(1)}%; background: linear-gradient(90deg, #4444ff, #6666ff); transition: width 0.5s;"></div>
                            </div>
                        </div>
                        
                        ${state.playerCasting ? `
                            <div style="margin-top: 10px; padding: 5px 10px; background: rgba(255, 200, 0, 0.3); border: 1px solid #ffcc00; border-radius: 5px; font-size: 12px; color: #ffcc00;">
                                引导中: ${state.playerCasting.skill.name} (${state.playerCasting.progress}/${state.playerCasting.totalTime})
                            </div>
                        ` : ''}
                    </div>
                    
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
                            ${state.enemy.isElite ? '<span style="color: #ff6600;"> ⭐精英</span>' : ''}
                        </div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">Lv.${state.enemy.level}</div>
                        <div style="width: 130px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #ff6666; margin-bottom: 2px;">
                                <span>HP</span><span>${state.enemy.hp}/${state.enemy.maxHp}</span>
                            </div>
                            <div style="height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
                                <div style="height: 100%; width: ${(state.enemy.hp / state.enemy.maxHp * 100).toFixed(1)}%; background: linear-gradient(90deg, #ff4444, #ff6666); transition: width 0.5s;"></div>
                            </div>
                        </div>
                        
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
                    ">
                        第 ${state.turn} 回合 - ${state.isPlayerTurn ? '你的回合' : '敌人回合'}
                    </div>
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
                        ">⚔️ 攻击</button>
                        
                        <button onclick="Game.battleDefend()" ${!state.isPlayerTurn ? 'disabled' : ''} style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #334455, #445566);
                            border: 2px solid #556677;
                            border-radius: 8px;
                            color: #cce0ff;
                            cursor: ${state.isPlayerTurn ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn ? 1 : 0.5};
                        ">🛡️ 防御</button>
                        
                        <button onclick="Game.battleFlee()" ${!state.isPlayerTurn ? 'disabled' : ''} style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #555533, #666644);
                            border: 2px solid #777755;
                            border-radius: 8px;
                            color: #ffffcc;
                            cursor: ${state.isPlayerTurn ? 'pointer' : 'not-allowed'};
                            font-size: 15px;
                            opacity: ${state.isPlayerTurn ? 1 : 0.5};
                        ">🏃 逃跑</button>
                    </div>
                    
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">✨ 技能</div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
                        ${state.player.skills.map(skillId => {
                            const skill = SkillSystem.getSkill(skillId);
                            if (!skill) return '';
                            const canUse = state.isPlayerTurn && state.player.mp >= skill.mpCost;
                            return `
                                <button onclick="Game.battleUseSkill('${skillId}')" ${!canUse ? 'disabled' : ''}
                                        title="${skill.description}"
                                        style="
                                    padding: 12px;
                                    background: linear-gradient(135deg, ${SkillSystem.getElementColor(skill.element)}22, ${SkillSystem.getElementColor(skill.element)}44);
                                    border: 2px solid ${SkillSystem.getElementColor(skill.element)};
                                    border-radius: 8px;
                                    color: #fff;
                                    cursor: ${canUse ? 'pointer' : 'not-allowed'};
                                    text-align: center;
                                    opacity: ${canUse ? 1 : 0.4};
                                    transition: all 0.2s;
                                " ${canUse ? 'onmouseover="this.style.boxShadow=\'0 0 15px ' + SkillSystem.getElementColor(skill.element) + '80\'" onmouseout="this.style.boxShadow=\'none\'"' : ''}>
                                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${skill.name}</div>
                                    <div style="font-size: 12px; color: #aaccff;">MP: ${skill.mpCost}</div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // 更新战斗界面
    updateBattleScreen() {
        // 简单起见，重新渲染整个战斗界面
        setTimeout(() => {
            this.renderBattleScreen();
        }, 500);
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
            debuff: '#cc88ff'
        };
        return colors[type] || '#ccc';
    },

    // ========== 事件界面 ==========
    renderEventScreen(event) {
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
    },

    // 渲染大事件界面
    renderScheduledEventScreen(event, success) {
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
                    rewardText += `  ${itemData?.name || item.itemId} x${item.count || 1}\n`;
                });
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
    },

    // 显示事件结果
    showEventResult(text, effects) {
        let effectText = '';
        if (effects) {
            if (effects.exp) effectText += `\n获得 ${effects.exp} 经验`;
            if (effects.gold) effectText += effects.gold > 0 ? `\n获得 ${effects.gold} 金币` : `\n失去 ${-effects.gold} 金币`;
            if (effects.hp) effectText += effects.hp > 0 ? `\n恢复 ${effects.hp} HP` : `\n失去 ${-effects.hp} HP`;
            if (effects.mp) effectText += effects.mp > 0 ? `\n恢复 ${effects.mp} MP` : `\n失去 ${-effects.mp} MP`;
            if (effects.addItem) effectText += `\n获得物品`;
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
                            return `
                                <div style="
                                    padding: 15px;
                                    background: rgba(40, 50, 60, 0.8);
                                    border: 2px solid #556677;
                                    border-radius: 10px;
                                    margin-bottom: 15px;
                                ">
                                    <div style="font-size: 13px; color: #8899aa; margin-bottom: 5px;">${slotNames[slot]}</div>
                                    ${item ? `
                                        <div style="font-size: 16px; color: #fff; margin-bottom: 5px;">
                                            ${item.icon || '🔹'} ${item.name}
                                        </div>
                                        <div style="font-size: 12px; color: #aabbcc;">
                                            ${Object.entries(item.equipStats || {}).map(([k, v]) => {
                                                const statNames = { attack: '攻击', defense: '防御', speed: '速度', maxHp: '生命', maxMp: '魔法', critRate: '暴击', hitRate: '命中' };
                                                return `${statNames[k] || k}: +${typeof v === 'number' && v < 1 ? (v * 100).toFixed(0) + '%' : v}`;
                                            }).join(' | ')}
                                        </div>
                                        <div onclick="Game.unequipItem('${slot}')" style="
                                            margin-top: 8px;
                                            padding: 5px 12px;
                                            background: #554433;
                                            border: 1px solid #776655;
                                            border-radius: 5px;
                                            color: #ffddaa;
                                            cursor: pointer;
                                            font-size: 12px;
                                            display: inline-block;
                                        ">卸下</div>
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
                                if (this.inventoryFilter === 'equipment') return itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'accessory';
                                if (this.inventoryFilter === 'material') return itemData.type === 'material';
                                if (this.inventoryFilter === 'quest') return itemData.type === 'quest';
                                return true;
                            }).map(item => {
                                const itemData = item.data;
                                if (!itemData) return '';
                                const isEquip = itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'accessory';
                                const canUse = itemData.usableOutOfBattle;
                                
                                return `
                                    <div style="
                                        padding: 12px;
                                        background: rgba(40, 50, 60, 0.8);
                                        border: 2px solid #556677;
                                        border-radius: 8px;
                                    ">
                                        <div style="font-size: 15px; font-weight: bold; color: #fff; margin-bottom: 4px;">
                                            ${itemData.icon || '📦'} ${itemData.name}
                                            <span style="float: right; color: #ffd700;">x${item.count}</span>
                                        </div>
                                        <div style="font-size: 12px; color: #999; margin-bottom: 10px; min-height: 30px;">
                                            ${itemData.description}
                                        </div>
                                        <div style="display: flex; gap: 8px;">
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
                                <li><strong>体力系统</strong>：每个行动消耗体力，体力不足无法行动</li>
                                <li><strong>休息恢复</strong>：休息可以恢复 HP、MP 和体力</li>
                                <li><strong>大事件</strong>：特定天数会触发大事件，提前准备很重要</li>
                                <li><strong>事件链</strong>：大事件有多个阶段，通过收集情报可以提前预警</li>
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
                                <li>合理分配体力，不要等到体力耗尽才休息</li>
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
                    ">关闭</button>
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
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                                ${Player.elements.map(elem => `
                                    <span style="
                                        padding: 6px 15px;
                                        background: ${SkillSystem.getElementColor(elem)}22;
                                        border: 1px solid ${SkillSystem.getElementColor(elem)};
                                        border-radius: 15px;
                                        font-size: 14px;
                                        color: ${SkillSystem.getElementColor(elem)};
                                    ">${SkillSystem.getElementName(elem)}</span>
                                `).join('')}
                            </div>
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
                                    return `
                                        <div style="
                                            padding: 12px 15px;
                                            background: ${SkillSystem.getElementColor(skill.element)}15;
                                            border-left: 4px solid ${SkillSystem.getElementColor(skill.element)};
                                            border-radius: 5px;
                                        ">
                                            <div style="font-size: 16px; color: #fff; font-weight: bold;">
                                                ${skill.name}
                                                <span style="font-size: 12px; color: ${SkillSystem.getElementColor(skill.element)}; margin-left: 10px;">${skill.tier} · ${SkillSystem.getElementName(skill.element)}</span>
                                            </div>
                                            <div style="font-size: 13px; color: #999; margin-top: 4px;">${skill.description}</div>
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

    // 渲染属性行
    renderAttributeRow(icon, name, value, max, attrKey) {
        const canAdd = attrKey && Player.attributePoints > 0 && ['attack', 'defense', 'speed', 'vitality', 'spirit'].includes(attrKey);
        
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #335555;">
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
        this.renderCharacterScreen();
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
            <div style="text-align: right;">
                <div onclick="this.parentElement.parentElement.remove()" style="
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
    }
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
