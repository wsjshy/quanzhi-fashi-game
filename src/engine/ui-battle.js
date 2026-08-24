/**
 * UI 战斗界面模块
 * 
 * 从ui.js拆分出的独立战斗界面渲染模块
 * 包含：战斗界面渲染（renderBattleScreen）、战斗界面更新（updateBattleScreen）
 */

/**
 * 渲染战斗界面
 * 绑定到UI对象调用：UIBattle.renderBattleScreen.call(UI)
 */
export function renderBattleScreen() {
    const state = BattleSystem.getState();
    const isPortrait = UI.isPortrait();
    const skillCols = isPortrait ? 3 : 5;
    const spriteW = isPortrait ? 70 : 100;
    const spriteH = isPortrait ? 100 : 140;
    // 战斗背景动态切换 - v3.3.0：使用AI生成的11系魔法特效图
    const elemBgMap = {
        fire: 'assets/images/effects/fire_magic.jpg',
        thunder: 'assets/images/effects/thunder_magic.jpg',
        ice: 'assets/images/effects/ice_magic.jpg',
        dark: 'assets/images/effects/dark_magic.jpg',
        earth: 'assets/images/effects/earth_magic.jpg',
        wind: 'assets/images/effects/wind_magic.jpg',
        water: 'assets/images/effects/water_magic.jpg',
        light: 'assets/images/effects/light_magic.jpg',
        plant: 'assets/images/effects/wind_magic.jpg',
        heal: 'assets/images/effects/light_magic.jpg',
        summon: 'assets/images/effects/summon_magic.jpg',
        space: 'assets/images/effects/space_magic.jpg',
        chaos: 'assets/images/effects/chaos_magic.jpg'
    };
    const enemyElem = state.enemy?.elements?.[0] || 'dark';
    const battleBg = elemBgMap[enemyElem] || elemBgMap.fire;
    // 技能展开时横版面板高度增加，避免滚动
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
            
            <!-- 战斗背景层（v3.3.0：AI生成魔法特效图） -->
            <div id="battle-bg-layer" style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: url('${battleBg}') center/cover;
                opacity: 0.4;
                filter: blur(2px) saturate(1.1);
                z-index: 0;
                pointer-events: none;
            "></div>
            <!-- 战斗特效层 -->
            <div id="battle-effect-layer" style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                z-index: 5;
                pointer-events: none;
            "></div>
            
            <!-- 战斗场地 -->
            <div style="flex: 1; position: relative; overflow: ${isPortrait ? 'auto' : 'hidden'}; z-index: 2; ${arenaFlex}">
                <!-- 战斗场地渐变遮罩 -->
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: linear-gradient(180deg, rgba(10,10,30,0.2) 0%, rgba(20,20,50,0.3) 50%, rgba(10,10,30,0.6) 100%);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <!-- 队友状态条 -->
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
                
                <!-- 战斗日志 -->
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
                    <!-- 敌方施法状态显示 -->
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
                        <!-- 元素克制提示 -->
                        <div style="margin-bottom: 8px; display: flex; flex-direction: column; gap: 3px; align-items: center;">
                            ${(() => {
                                const elemNames = { fire: '火', ice: '冰', thunder: '雷', earth: '土', wind: '风', water: '水', light: '光', dark: '暗' };
                                const elemColors = { fire: '#ff6644', ice: '#66aaff', thunder: '#ffdd44', earth: '#aa8844', wind: '#88ffcc', water: '#66bbff', light: '#ffffcc', dark: '#aa66ff' };
                                const counterMap = { fire: 'ice', ice: 'wind', wind: 'earth', earth: 'thunder', thunder: 'water', water: 'fire' };
                                const weakTo = [];
                                const strongAgainst = [];
                                state.enemy.elements.forEach(elem => {
                                    Object.entries(counterMap).forEach(([attacker, defender]) => {
                                        if (defender === elem) weakTo.push(attacker);
                                    });
                                    if (counterMap[elem]) strongAgainst.push(counterMap[elem]);
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
                
                <!-- 右侧控制按钮组 -->
                <div style="${isPortrait ? 'display:none;' : 'position:absolute; top:0; right:0;'}">
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
                <!-- 基础行动 -->
                <div style="display: grid; grid-template-columns: repeat(${skillCols}, 1fr); gap: 12px; margin-bottom: 15px;">
                    <button onclick="Game.battleAttack()" ${!state.isPlayerTurn ? 'disabled' : ''}
                        title="普通攻击：造成物理伤害"
                        style="padding:14px 10px; background:linear-gradient(135deg,#55333322,#77444444); border:2px solid #aa6666; border-radius:10px; color:#ffcccc; cursor:${state.isPlayerTurn?'pointer':'not-allowed'}; text-align:center; opacity:${state.isPlayerTurn?1:0.4}; transition:all 0.2s;"
                        ${state.isPlayerTurn?'onmouseover="this.style.boxShadow=\'0 0 12px #aa666680\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                        <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">⚔️ 普通攻击</div>
                        <div style="font-size:12px; color:#aaccff;">MP: 0</div>
                    </button>
                    <button onclick="Game.battleRecover()" ${!state.isPlayerTurn ? 'disabled' : ''}
                        title="集中精神恢复20点MP"
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
                    ${state.environment === 'cave' ? (() => {
                        const canUseEnv = state.isPlayerTurn && state.environmentState && state.environmentState.stalactites > 0 && state.environmentState.stalactiteCooldown <= 0;
                        const remaining = state.environmentState ? state.environmentState.stalactites : 0;
                        const cd = state.environmentState ? state.environmentState.stalactiteCooldown : 0;
                        return `<button onclick="Game.battleUseEnvironment()" ${!canUseEnv ? 'disabled' : ''}
                            title="利用洞窟钟乳石砸落敌人（剩余${remaining}次${cd > 0 ? '，冷却' + cd + '回合' : ''}）"
                            style="padding:14px 10px; background:linear-gradient(135deg,#55443322,#66554444); border:2px solid #aa8855; border-radius:10px; color:#ffddaa; cursor:${canUseEnv?'pointer':'not-allowed'}; text-align:center; opacity:${canUseEnv?1:0.4}; transition:all 0.2s;"
                            ${canUseEnv?'onmouseover="this.style.boxShadow=\'0 0 12px #aa885580\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'"':''}>
                            <div style="font-size:15px; font-weight:bold; margin-bottom:4px;">🪨 钟乳石</div>
                            <div style="font-size:12px; color:${cd > 0 ? '#ff9966' : '#aaffaa'};">${cd > 0 ? '冷却' + cd + '回合' : '剩余' + remaining + '次'}</div>
                        </button>`;
                    })() : ''}
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
                    // 展开状态 - 显示该系技能列表（内联展开式）
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
                                // 计算实际打断概率
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
                    // 天赋资源显示和主动技能
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

                    // 天赋主动技能按钮（只显示主修系的主动技能）
                    const activeSkillTalents = activeTalents.filter(t => {
                        const td = DataTalents[t.talentId];
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
}

/**
 * 更新战斗界面
 * 绑定到UI对象调用：UIBattle.updateBattleScreen.call(UI)
 */
export function updateBattleScreen() {
    if (!BattleSystem || !BattleSystem.active) return;
    
    const delay = BattleSystem.getDelay ? BattleSystem.getDelay(500) : 500;
    setTimeout(() => {
        this.renderBattleScreen();
    }, delay);
}

// 导出模块集合
export const UIBattle = {
    renderBattleScreen,
    updateBattleScreen
};

export default UIBattle;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIBattle = UIBattle;
}
