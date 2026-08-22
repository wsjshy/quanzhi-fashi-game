/**
 * UI 背包界面模块
 * 
 * 从ui.js拆分出的独立背包界面渲染模块
 * 包含：背包界面（renderInventoryScreen）
 */
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

// 导出模块集合
export const UIInventory = {
    renderInventoryScreen
};

export default UIInventory;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIInventory = UIInventory;
}