/**
 * UI系统 - 天赋后系别选择模块
 * 
 * 从ui.js拆分出的独立天赋后系别选择模块
 * 包含：天赋决定系别后的系别选择界面（showElementSelectionAfterTalent）
 */

export function showElementSelectionAfterTalent(talent) {
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
    }


// 导出模块集合
export const UIElementSelection = {
    showElementSelectionAfterTalent
};

export default UIElementSelection;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIElementSelection = UIElementSelection;
}