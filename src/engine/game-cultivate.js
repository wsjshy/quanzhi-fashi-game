/**
 * 游戏主流程 - 修炼菜单模块
 * 
 * 从game.js拆分出的独立修炼菜单模块
 * 包含：显示修炼菜单（showCultivateMenu）
 */

export function showCultivateMenu(actionId) {
        const location = DataManager.getLocation(Player.currentLocation);
        const action = location?.actions?.find(a => a.id === actionId);
        if (!action) return;
        
        const isTrain = true;
        const baseTime = action.timeCost || 2;
        // v0.99.0: 体力系统已移除，删除baseStamina
        const baseExp = action.effects?.exp || 10;
        
        // 时长选项：1小时、4小时、8小时、闭关（按基础时长缩放）
        const options = [
            { hours: 1, bonus: 1.0, label: '1小时', desc: '快速修炼，无加成' },
            { hours: 4, bonus: 1.1, label: '4小时', desc: '半天修炼，+10%收益' },
            { hours: 8, bonus: 1.2, label: '8小时', desc: '整日修炼，+20%收益' },
            { hours: 12, bonus: 1.5, label: '闭关（12小时）', desc: '闭关修炼，+50%收益' }
        ];
        
        // v0.9.0: 体力不再作为硬限制，不过滤选项
        // 体力低时修炼经验会通过getStaminaEfficiency()降低
        const availableOptions = options;
        
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
            min-width: 380px;
            max-width: 500px;
            z-index: 99999;
            box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        
        dialog.innerHTML = `
            <h3 style="color: #ffd700; margin-bottom: 20px; font-size: 22px;">
                ${isTrain ? '✨ 修炼魔法' : '🧘 冥修'}
            </h3>
            <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">选择修炼时长：时间越长，单位收益越高<br><span style="color: #888; font-size: 12px;">✨ 显示的是基础经验，实际可能因修炼品质、NPC指导、顿悟等获得额外加成</span></p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${availableOptions.map((opt, index) => {
                    const multiplier = opt.hours / baseTime;
                    const expGain = Math.floor(baseExp * multiplier * opt.bonus);
                    // v0.99.0: 体力系统已移除，删除staminaCost计算
                    const hpChange = Math.floor((action.effects?.hp || 0) * multiplier);
                    const mpChange = Math.floor((action.effects?.mp || 0) * multiplier);
                    const timeCost = opt.hours;
                    return `
                        <div onclick="Game.performCultivate('${actionId}', ${opt.hours}, ${opt.bonus})" style="
                            padding: 15px 20px;
                            background: rgba(40, 40, 80, 0.8);
                            border: 2px solid #444477;
                            border-radius: 10px;
                            color: #e0e0ff;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                        " onmouseover="this.style.borderColor='#7777bb'; this.style.background='rgba(60, 60, 120, 0.8)'" onmouseout="this.style.borderColor='#444477'; this.style.background='rgba(40, 40, 80, 0.8)'">
                            <div style="font-weight: bold; font-size: 17px; margin-bottom: 5px;">
                                ${opt.label}
                                <span style="float: right; font-size: 13px; display: flex; gap: 10px;">
                                    <span style="color: #aaddff;">⏱️ ${timeCost}h</span>
                                    <!-- v0.99.0: 体力系统已移除，删除体力消耗显示 -->
                                    ${hpChange !== 0 ? `<span style="color: ${hpChange > 0 ? '#66ff66' : '#ff6666'};">❤️ ${hpChange > 0 ? '+' : ''}${hpChange}</span>` : ''}
                                    ${mpChange !== 0 ? `<span style="color: ${mpChange > 0 ? '#6666ff' : '#ff6666'};">💧 ${mpChange > 0 ? '+' : ''}${mpChange}</span>` : ''}
                                    <span style="color: #ffd700;">✨ +${expGain}</span>
                                </span>
                            </div>
                            <div style="font-size: 13px; color: #999;">${opt.desc}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 10px;
                text-align: center;
                color: #888;
                cursor: pointer;
                font-size: 14px;
            ">取消</div>
        `;
        
        document.body.appendChild(dialog);
    }


// 导出模块集合
export const GameCultivate = {
    showCultivateMenu
};

export default GameCultivate;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameCultivate = GameCultivate;
}