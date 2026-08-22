/**
 * 游戏主流程 - 天赋选择模块
 * 
 * 从game.js拆分出的独立天赋选择模块
 * 包含：显示天赋选择（showTalentSelection）
 */

export function showTalentSelection(element) {
        // v0.93.0: 关闭消息弹窗、清空gameContainer、移除旧弹窗，防止层级遮挡
        if (typeof UI !== 'undefined' && UI.closeAllMessages) UI.closeAllMessages();
        document.querySelectorAll('.msg-overlay, .msg-box, #message-blocker').forEach(el => el.remove());
        document.getElementById('talent-selection-dialog')?.remove();
        document.getElementById('talent-selection-overlay')?.remove();
        UI.elements.gameContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;font-size:18px;">Loading...</div>';

        const choices = TalentSystem.getTalentChoices(element);
        if (choices.length === 0) {
            Player.save();
            UI.showMessage('觉醒成功！');
            this.openCharacterPanel();
            return;
        }

        const elementName = SkillSystem.getElementName(element);
        const elementColor = SkillSystem.getElementColor(element);

        let choicesHtml = choices.map((talentId, idx) => {
            const talent = TalentSystem.getTalent(talentId);
            if (!talent) return '';
            const rarityConfig = TalentSystem.getRarityConfig(talent.rarity);
            
            // v3.1.0: 天赋类型标签和机制标签
            const typeConfig = (typeof TALENT_TYPE_CONFIG !== 'undefined') ? TALENT_TYPE_CONFIG[talent.type] : null;
            const typeName = typeConfig ? typeConfig.name : (talent.type === 'innate' ? '先天型' : '成长型');
            const typeColor = typeConfig ? typeConfig.color : (talent.type === 'innate' ? '#fbbf24' : '#60a5fa');
            const typeDesc = typeConfig ? typeConfig.description : '';
            
            const mechanismConfig = (typeof TALENT_MECHANISM_CONFIG !== 'undefined') ? TALENT_MECHANISM_CONFIG[talent.mechanism] : null;
            const mechanismName = mechanismConfig ? mechanismConfig.name : '';
            const mechanismColor = mechanismConfig ? mechanismConfig.color : '#888';
            const mechanismDesc = mechanismConfig ? mechanismConfig.description : '';
            
            // 有无主动技能
            const hasActiveSkill = talent.activeSkill ? true : false;

            // 构建进化路线预览（模糊化：告知有进化潜力，但隐藏具体分支和高等级效果）
            let evolutionPreview = '';
            if (talent.evolutions && talent.evolutions.length > 0) {
                const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };
                evolutionPreview = '<div style="margin-top:8px;font-size:11px;color:#888;">';
                if (talent.type === 'innate') {
                    // 先天型：显示终极阶段名称，效果模糊
                    const evo = talent.evolutions[0];
                    evolutionPreview += `<div style="color:${stageColors['终极']||'#ff66ff'};margin-bottom:2px;">★ ${evo.name}：<span style="color:#999;">开局即高等级，升级收益减半</span></div>`;
                } else {
                    // 成长型：只显示Lv1基础阶段，高等级模糊化
                    evolutionPreview += '<div style="color:#666;margin-bottom:3px;">进化潜力：</div>';
                    let shownBase = false;
                    for (const evo of talent.evolutions) {
                        const color = stageColors[evo.stage] || '#aaa';
                        if (evo.level <= 3 && !shownBase) {
                            // Lv1-3基础阶段：显示名称和描述
                            evolutionPreview += `<div style="color:${color};margin-bottom:2px;">&nbsp;Lv${evo.level}【${evo.stage}】${evo.name}：<span style="color:#999;font-size:10px;">${evo.description}</span></div>`;
                            shownBase = true;
                        } else if (evo.level === 5 && evo.branchChoices) {
                            // Lv5分支选择：模糊化，不显示具体分支
                            evolutionPreview += `<div style="color:#ffaa44;margin-bottom:2px;">&nbsp;Lv5【进化抉择】<span style="color:#999;font-size:10px;">天赋将出现分化，路线需自行探索</span></div>`;
                        } else if (evo.level >= 7) {
                            // Lv7+：模糊化，只提示有高阶进化
                            evolutionPreview += `<div style="color:#cc88ff;margin-bottom:2px;">&nbsp;Lv${evo.level}+【高阶进化】<span style="color:#999;font-size:10px;">能力大幅提升，具体效果待解锁</span></div>`;
                            break; // 只显示一个高阶提示即可
                        }
                    }
                }
                evolutionPreview += '</div>';
            }

            return `
                <div onclick="Game.confirmTalent('${element}', '${talentId}')" style="
                    padding: 15px;
                    background: ${rarityConfig.color}15;
                    border: 2px solid ${rarityConfig.color};
                    border-radius: 10px;
                    cursor: pointer;
                    margin-bottom: 10px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='${rarityConfig.color}30'; this.style.transform='scale(1.02)'" onmouseout="this.style.background='${rarityConfig.color}15'; this.style.transform='scale(1)'">
                    <div style="font-size: 18px; font-weight: bold; color: ${rarityConfig.color}; margin-bottom: 5px;">
                        ${talent.name}
                        <span style="font-size: 11px; color: ${typeColor}; background: ${typeColor}22; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${typeName}</span>
                        ${mechanismName ? `<span style="font-size: 11px; color: ${mechanismColor}; background: ${mechanismColor}22; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${mechanismName}</span>` : ''}
                        ${hasActiveSkill ? '<span style="font-size: 11px; color: #ff9933; background: #ff993322; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">主动技能</span>' : '<span style="font-size: 11px; color: #888; background: #88822; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">纯被动</span>'}
                    </div>
                    <div style="font-size: 13px; color: #bbb; margin-bottom: 5px;">${talent.description}</div>
                    ${typeDesc ? `<div style="font-size: 11px; color: ${typeColor}; margin-bottom: 3px;">${typeDesc}</div>` : ''}
                    ${mechanismDesc ? `<div style="font-size: 11px; color: ${mechanismColor}; margin-bottom: 3px;">${mechanismDesc}</div>` : ''}
                    ${evolutionPreview}
                </div>
            `;
        }).join('');

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98); border: 2px solid ${elementColor};
            border-radius: 15px; padding: 30px; min-width: 450px; max-width: 600px;
            z-index: 50000; box-shadow: 0 0 30px ${elementColor}44;
        `;
        dialog.id = 'talent-selection-dialog';
        dialog.innerHTML = `
            <h2 style="color: ${elementColor}; text-align: center; margin-bottom: 10px;">✨ ${elementName}系天赋觉醒</h2>
            <p style="color: #aaa; text-align: center; margin-bottom: 20px; font-size: 14px;">选择一个天赋，它将伴随你的${elementName}系成长</p>
            ${choicesHtml}
        `;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:49999;';
        overlay.id = 'talent-selection-overlay';
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
    }


// 导出模块集合
export const GameTalentSelect = {
    showTalentSelection
};

export default GameTalentSelect;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameTalentSelect = GameTalentSelect;
}