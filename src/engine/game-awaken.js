/**
 * 游戏主流程 - 觉醒面板模块
 * 
 * 从game.js拆分出的独立觉醒面板模块
 * 包含：显示觉醒面板（showAwakenPanel）
 */

export function showAwakenPanel() {
        if (!Player.canAwakenNewElement()) {
            UI.showMessage('你还未达到觉醒条件！');
            return;
        }

        // 博城篇可觉醒的11系（火冰雷土水光暗治愈植物召唤）
        // 稀有系（心灵/祝福等）通过天赋形式觉醒，不在此列表
        const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'plant', 'summon'];
        const availableElements = allElements.filter(e => !Player.elements.includes(e));
        const currentCount = Player.elements.length;
        const requiredLevel = currentCount === 1 ? 8 : 15;
        const rankName = requiredLevel >= 15 ? '高阶' : '中阶';

        // 元素权重：常见系概率高，稀有系概率低
        const elementWeights = {
            fire: 15, ice: 12, thunder: 10, earth: 15, wind: 15, water: 15,
            light: 8, dark: 5, heal: 6, plant: 7, summon: 4
        };

        // 随机3个候选
        function rollThree() {
            const avail = [...availableElements];
            const result = [];
            while (result.length < 3 && avail.length > 0) {
                const totalW = avail.reduce((s, e) => s + (elementWeights[e] || 10), 0);
                let rand = Math.random() * totalW;
                for (let i = 0; i < avail.length; i++) {
                    rand -= (elementWeights[avail[i]] || 10);
                    if (rand <= 0) {
                        result.push(avail[i]);
                        avail.splice(i, 1);
                        break;
                    }
                }
            }
            return result;
        }

        let candidates = rollThree();
        let rerolls = 0;
        const maxRerolls = 2;

        function renderCandidates(cands) {
            const list = cands || candidates;
            return list.map(elem => {
                const color = SkillSystem.getElementColor(elem);
                const name = SkillSystem.getElementName(elem);
                const desc = Game.getElementDescription(elem);
                return `
                    <div onclick="Game.confirmAwaken('${elem}')" style="
                        padding: 20px;
                        background: ${color}15;
                        border: 2px solid ${color};
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        margin-bottom: 12px;
                        flex: 1;
                        min-width: 150px;
                    " onmouseover="this.style.background='${color}33'; this.style.transform='translateY(-3px)'" onmouseout="this.style.background='${color}15'; this.style.transform='translateY(0)'">
                        <div style="font-size: 20px; font-weight: bold; color: ${color}; margin-bottom: 8px;">
                            ${name}
                        </div>
                        <div style="color: #ccc; font-size: 13px; line-height: 1.5;">
                            ${desc}
                        </div>
                    </div>
                `;
            }).join('');
        }

        UI.elements.gameContainer.innerHTML = `
            <div style="max-width: 700px; margin: 0 auto; padding: 30px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 32px; font-weight: bold; color: #ffd700; margin-bottom: 10px;">
                        ✨ 元素觉醒
                    </div>
                    <div style="color: #aaa; font-size: 16px;">
                        你已达到${rankName}境界，觉醒石感应到新的元素共鸣
                    </div>
                    <div style="color: #888; font-size: 14px; margin-top: 8px;">
                        当前已觉醒: ${Player.elements.map(e => SkillSystem.getElementName(e)).join('、')}
                    </div>
                </div>
                <div style="text-align: center; color: #ffd700; margin-bottom: 15px; font-size: 16px;">
                    🌟 感知到3种元素与你共鸣，选择其一：
                </div>
                <div id="awaken-candidates" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px;">
                    ${renderCandidates()}
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <div onclick="Game.rerollAwaken()" id="awaken-reroll" style="
                        display: inline-block;
                        padding: 10px 25px;
                        background: rgba(100, 80, 150, 0.3);
                        border: 1px solid #8866bb;
                        border-radius: 8px;
                        color: #bb99dd;
                        cursor: pointer;
                        font-size: 14px;
                    " onmouseover="this.style.background='rgba(100,80,150,0.5)'" onmouseout="this.style.background='rgba(100,80,150,0.3)'">
                        🔄 重新感知（剩余${maxRerolls - rerolls}次）
                    </div>
                </div>
                <div onclick="Game.openCharacterPanel()" style="
                    text-align: center;
                    padding: 12px;
                    background: rgba(100, 100, 100, 0.3);
                    border-radius: 8px;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 16px;
                ">稍后再说</div>
            </div>
        `;

        // 存储到Game对象供reroll使用
        this._awakenState = { candidates, rerolls, maxRerolls, rollThree, renderCandidates, availableElements, elementWeights };
    }


// 导出模块集合
export const GameAwaken = {
    showAwakenPanel
};

export default GameAwaken;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameAwaken = GameAwaken;
}