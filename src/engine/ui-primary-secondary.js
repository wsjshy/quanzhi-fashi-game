/**
 * UI系统 - 主副系选择模块
 * 
 * 从ui.js拆分出的独立主副系选择模块
 * 包含：显示主副系选择界面（showPrimarySecondarySelection）
 */

export function showPrimarySecondarySelection(elements, callback, isFirstTime = false) {
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
    }


// 导出模块集合
export const UIPrimarySecondary = {
    showPrimarySecondarySelection
};

export default UIPrimarySecondary;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIPrimarySecondary = UIPrimarySecondary;
}