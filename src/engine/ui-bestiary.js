/**
 * UI 妖魔图鉴模块
 * 
 * 从ui.js拆分出的独立界面渲染模块
 * 包含：妖魔图鉴界面
 */

/**
 * 渲染妖魔图鉴界面
 * 绑定到UI对象调用：UIBestiary.renderBestiary.call(UI)
 */
export function renderBestiary() {
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
}

// 导出模块集合
export const UIBestiary = {
    renderBestiary
};

export default UIBestiary;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIBestiary = UIBestiary;
}
