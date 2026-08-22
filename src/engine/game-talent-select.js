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
            const rarityName = rarityConfig.name || '普通';
            
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
            
            // v3.1.0: 检查是否有Lv5分支选择
            const hasBranchChoice = talent.evolutions && talent.evolutions.some(e => e.level === 5 && e.branchChoices);
            
            // v3.1.0: 获取Lv1基础效果
            const lv1Effect = talent.evolutions && talent.evolutions[0] ? talent.evolutions[0].description : '';
            
            // v3.1.0: 获取终极阶段名称（如果有）
            const ultimateStage = talent.evolutions ? talent.evolutions.find(e => e.stage === '终极') : null;
            const ultimateName = ultimateStage ? ultimateStage.name : (talent.type === 'innate' ? '天生强化' : '');

            // 构建进化路线预览（v3.1.0优化：显示更多有用信息）
            let evolutionPreview = '';
            if (talent.evolutions && talent.evolutions.length > 0) {
                const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };
                evolutionPreview = '<div style="margin-top:8px;font-size:11px;color:#888;border-top:1px solid #333;padding-top:6px;">';
                
                // 显示Lv1基础效果（具体数值）
                if (lv1Effect) {
                    evolutionPreview += `<div style="color:#aaa;margin-bottom:4px;"><span style="color:#88ccff;">Lv1效果：</span>${lv1Effect}</div>`;
                }
                
                // 显示是否有分支选择
                if (hasBranchChoice) {
                    evolutionPreview += `<div style="color:#ffaa44;margin-bottom:4px;">✦ Lv5有进化抉择（多分支选择）</div>`;
                } else if (talent.type !== 'innate') {
                    evolutionPreview += `<div style="color:#666;margin-bottom:4px;">✧ Lv5无分支，线性成长</div>`;
                }
                
                // 显示终极阶段
                if (ultimateName) {
                    evolutionPreview += `<div style="color:#ff66ff;margin-bottom:4px;">★ 终极：${ultimateName}</div>`;
                }
                
                // 先天型特殊说明
                if (talent.type === 'innate') {
                    evolutionPreview += `<div style="color:#fbbf24;margin-bottom:2px;">⚡ 先天型：开局即高等级，升级收益减半</div>`;
                }
                
                evolutionPreview += '</div>';
            }

            return `
                <div onclick="Game.confirmTalent('${element}', '${talentId}')" style="
                    padding: 12px;
                    background: ${typeColor}15;
                    border: 2px solid ${typeColor};
                    border-radius: 10px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    transition: all 0.3s;
                " onmouseover="this.style.background='${typeColor}30'; this.style.transform='scale(1.01)'" onmouseout="this.style.background='${typeColor}15'; this.style.transform='scale(1)'">
                    <div style="font-size: 16px; font-weight: bold; color: ${typeColor}; margin-bottom: 4px;">
                        ${talent.name}
                        <span style="font-size: 10px; color: ${typeColor}; background: ${typeColor}22; padding: 2px 5px; border-radius: 3px; margin-left: 6px;">${typeName}</span>
                        ${mechanismName ? `<span style="font-size: 10px; color: ${mechanismColor}; background: ${mechanismColor}22; padding: 2px 5px; border-radius: 3px; margin-left: 4px;">${mechanismName}</span>` : ''}
                        ${hasActiveSkill ? '<span style="font-size: 10px; color: #ff9933; background: #ff993322; padding: 2px 5px; border-radius: 3px; margin-left: 4px;">主动技能</span>' : '<span style="font-size: 10px; color: #888; background: #88822; padding: 2px 5px; border-radius: 3px; margin-left: 4px;">纯被动</span>'}
                    </div>
                    <div style="font-size: 12px; color: #bbb; margin-bottom: 4px;">${talent.description}</div>
                    ${evolutionPreview}
                </div>
            `;
        }).join('');

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98); border: 2px solid ${elementColor};
            border-radius: 15px; padding: 20px 25px; min-width: 450px; max-width: 600px;
            max-height: 85vh; overflow-y: auto;
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