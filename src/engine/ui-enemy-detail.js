/**
 * UI渲染 - 妖魔详情模块
 * 
 * 从ui.js拆分出的独立妖魔详情模块
 * 包含：显示妖魔详情（showEnemyDetail）
 */

export function showEnemyDetail(enemyId) {
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
    }


// 导出模块集合
export const UIEnemyDetail = {
    showEnemyDetail
};

export default UIEnemyDetail;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIEnemyDetail = UIEnemyDetail;
}