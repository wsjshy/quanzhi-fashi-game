/**
 * 游戏主流程 - NPC详情模块
 * 
 * 从game.js拆分出的独立NPC详情模块
 * 包含：显示NPC详情（showNPCDetail）
 */

export function showNPCDetail(npcId) {
        const npc = DataManager.getCharacter(npcId);
        if (!npc) return;

        // 获取NPC当前战斗数据（含成长）
        let duelData = null;
        if (typeof NPCGrowthService !== 'undefined') {
            duelData = NPCGrowthService.getDuelData(npcId);
        }
        // 没有成长服务时用原始数据
        if (!duelData) {
            duelData = {
                level: npc.level || 0,
                elements: npc.elements || [],
                skills: npc.skills || [],
                maxHp: npc.maxHp || 0,
                maxMp: npc.maxMp || 0,
                attack: npc.attack || 0,
                defense: npc.defense || 0,
                speed: npc.speed || 0,
                spirit: npc.spirit || 0,
            };
        }

        const hasCombat = duelData.level > 0 && (duelData.skills?.length > 0 || duelData.elements?.length > 0);
        const level = duelData.level || npc.level || 0;
        const realm = this._getRealmName(level);
        // v2.9.3: 等级不明确时显示???
        const levelDisplay = npc.levelDisplay || `Lv.${level}`;
        const realmDisplay = npc.levelUnknown ? '境界不明' : realm;

        // 元素系显示（含每系等级/境界，与玩家elementLevels机制对齐）
        const npcElementLevels = this.getNPCElementLevels(npcId);
        const elementsHtml = (duelData.elements || []).map((el, index) => {
            const info = this._getElementInfo(el);
            const elLevel = npcElementLevels[el] || 0;
            const elRealm = elLevel > 0 ? this._getRealmName(elLevel) : '';
            const isMain = index === 0; // 第一个系别为主系
            const levelDisplay = elLevel > 0 ? ` Lv.${elLevel}${elRealm ? ' ' + elRealm : ''}` : '';
            const mainBadge = isMain ? '<span style="font-size:10px;background:#ffd700;color:#333;padding:1px 5px;border-radius:6px;margin-left:4px;">主系</span>' : '';
            return `<span style="display: inline-block; padding: 4px 12px; background: ${info.color}33; border: 1px solid ${info.color}; border-radius: 12px; color: ${info.color}; font-size: 13px; margin-right: 6px; margin-bottom: 4px;">${info.icon} ${info.name}${levelDisplay}${mainBadge}</span>`;
        }).join('');

        // 技能列表
        const skillsHtml = (duelData.skills || []).map(skillId => {
            const skill = typeof DataManager !== 'undefined' ? DataManager.getSkill(skillId) : null;
            const name = skill?.name || skillId;
            const desc = skill?.description || '';
            const element = skill?.element ? this._getElementInfo(skill.element) : null;
            return `
                <div style="padding: 8px 12px; background: rgba(40, 40, 80, 0.5); border-radius: 8px; margin-bottom: 6px;">
                    <div style="font-weight: bold; color: #e0e0ff; font-size: 14px;">
                        ${element ? `<span style="color: ${element.color};">${element.icon}</span> ` : ''}${name}
                        ${skill?.level ? `<span style="color: #ffcc00; font-size: 12px; margin-left: 8px;">Lv.${skill.level}</span>` : ''}
                    </div>
                    ${desc ? `<div style="color: #999; font-size: 12px; margin-top: 3px;">${desc}</div>` : ''}
                </div>
            `;
        }).join('') || '<div style="color: #666; font-size: 13px;">暂无技能数据</div>';

        // 关系信息
        const npcState = typeof NPCStateSystem !== 'undefined' ? NPCStateSystem.getNPCState(npcId) : null;
        const rel = npcState ? {
            opinion: npcState.opinion || 0,
            trust: npcState.trust || 0,
            familiarity: npcState.familiarity || 0,
        } : { opinion: 0, trust: 0, familiarity: 0 };
        const relState = typeof NPCStateSystem !== 'undefined' ? NPCStateSystem.getRelationshipState('player', npcId) : { label: '陌生人' };

        // 关系条
        const relBar = (label, value, color) => `
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #aaa; margin-bottom: 3px;">
                    <span>${label}</span><span>${value > 0 ? '+' : ''}${value}</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(100, Math.abs(value))}%; background: ${color};"></div>
                </div>
            </div>
        `;

        // v2.9.3: 天赋列表（从NPC原始数据或成长数据中获取）
        let npcTalents = npc.talents || [];
        if (typeof NPCGrowthService !== 'undefined') {
            const growthState = NPCGrowthService.getNpcState(npcId);
            if (growthState && growthState.talents && growthState.talents.length > 0) {
                npcTalents = growthState.talents;
            }
        }
        const talentsHtml = npcTalents.length > 0 ? npcTalents.map(talent => {
            const isInnate = talent.type === 'innate';
            const typeLabel = isInnate ? '天生' : '后天';
            const typeColor = isInnate ? '#ffd700' : '#88ccff';
            const elementInfo = talent.element ? this._getElementInfo(talent.element) : null;
            return `
                <div style="padding: 10px 12px; background: rgba(80, 60, 30, 0.4); border: 1px solid ${typeColor}44; border-radius: 8px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-weight: bold; color: #ffe0aa; font-size: 14px;">
                            ${elementInfo ? `<span style="color: ${elementInfo.color};">${elementInfo.icon}</span> ` : ''}${talent.name}
                        </span>
                        <span style="font-size: 11px; color: ${typeColor}; background: ${typeColor}22; padding: 2px 8px; border-radius: 8px;">${typeLabel}</span>
                    </div>
                    <div style="color: #bbb; font-size: 12px; line-height: 1.5;">${talent.description || ''}</div>
                </div>
            `;
        }).join('') : '';

        // 创建遮罩
        const overlay = document.createElement('div');
        overlay.id = 'npc-detail-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 100000; cursor: pointer;';
        const closeDetail = () => { overlay.remove(); dialog.remove(); };
        overlay.addEventListener('click', closeDetail);

        // 创建详情面板
        const dialog = document.createElement('div');
        dialog.id = 'npc-detail-dialog';
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98); border: 2px solid #6666aa; border-radius: 15px;
            padding: 25px; min-width: 420px; max-width: 560px; max-height: 85vh; overflow-y: auto;
            z-index: 100001; box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
        `;
        dialog.addEventListener('click', e => e.stopPropagation());

        dialog.innerHTML = `
            <!-- 头部：名字、称号、关闭按钮 -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <div style="font-size: 22px; font-weight: bold; color: #ffd700;">${npc.name}</div>
                    ${npc.title ? `<div style="font-size: 13px; color: #999; margin-top: 3px;">${npc.title}</div>` : ''}
                </div>
                <div id="npc-detail-close-btn" style="cursor: pointer; color: #888; font-size: 20px; padding: 0 8px;">✕</div>
            </div>

            ${(npc.description || (duelData && duelData.description)) ? `
                <div style="font-size: 13px; color: #aaa; line-height: 1.6; margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    ${duelData && duelData.description ? duelData.description : npc.description}
                </div>
            ` : ''}

            ${hasCombat ? `
                <!-- 战斗信息 -->
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 15px; font-weight: bold; color: #88aaff; margin-bottom: 10px; border-bottom: 1px solid #444466; padding-bottom: 5px;">⚔️ 战斗信息</div>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #ffd700;">${levelDisplay}</div>
                            <div style="font-size: 12px; color: #888;">${realmDisplay}</div>
                        </div>
                        <div style="flex: 1;">
                            <div style="margin-bottom: 5px;">${elementsHtml || '<span style="color: #666; font-size: 13px;">未知系别</span>'}</div>
                        </div>
                    </div>

                    <!-- 属性 -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <div style="padding: 6px 10px; background: rgba(200,50,50,0.15); border-radius: 6px;">
                            <span style="color: #ff8888; font-size: 12px;">❤️ 生命</span>
                            <span style="color: #fff; font-size: 14px; font-weight: bold; float: right;">${duelData.maxHp}</span>
                        </div>
                        <div style="padding: 6px 10px; background: rgba(50,100,200,0.15); border-radius: 6px;">
                            <span style="color: #88aaff; font-size: 12px;">💧 法力</span>
                            <span style="color: #fff; font-size: 14px; font-weight: bold; float: right;">${duelData.maxMp}</span>
                        </div>
                        <div style="padding: 6px 10px; background: rgba(200,100,50,0.15); border-radius: 6px;">
                            <span style="color: #ffaa66; font-size: 12px;">⚔️ 攻击</span>
                            <span style="color: #fff; font-size: 14px; font-weight: bold; float: right;">${duelData.attack}</span>
                        </div>
                        <div style="padding: 6px 10px; background: rgba(100,150,100,0.15); border-radius: 6px;">
                            <span style="color: #88cc88; font-size: 12px;">🛡️ 防御</span>
                            <span style="color: #fff; font-size: 14px; font-weight: bold; float: right;">${duelData.defense}</span>
                        </div>
                        <div style="padding: 6px 10px; background: rgba(100,200,200,0.15); border-radius: 6px;">
                            <span style="color: #88dddd; font-size: 12px;">💨 速度</span>
                            <span style="color: #fff; font-size: 14px; font-weight: bold; float: right;">${duelData.speed}</span>
                        </div>
                        <div style="padding: 6px 10px; background: rgba(150,100,200,0.15); border-radius: 6px;">
                            <span style="color: #bb99ee; font-size: 12px;">🧠 精神</span>
                            <span style="color: #fff; font-size: 14px; font-weight: bold; float: right;">${duelData.spirit}</span>
                        </div>
                    </div>

                    ${talentsHtml ? `
                    <!-- 天赋列表 -->
                    <div style="font-size: 13px; color: #ffcc66; margin-bottom: 5px; margin-top: 10px;">🌟 天赋</div>
                    ${talentsHtml}
                    ` : ''}

                    <!-- 技能列表 -->
                    <div style="font-size: 13px; color: #aaa; margin-bottom: 5px;">📜 技能列表</div>
                    ${skillsHtml}
                </div>
            ` : ''}

            <!-- 关系信息 -->
            <div style="margin-bottom: 10px;">
                <div style="font-size: 15px; font-weight: bold; color: #ff99aa; margin-bottom: 10px; border-bottom: 1px solid #444466; padding-bottom: 5px;">
                    💗 关系状态：<span style="color: #ffcc88;">${relState.label}</span>
                </div>
                ${relBar('好感度', rel.opinion, '#ff88aa')}
                ${relBar('信任度', rel.trust, '#88aaff')}
                ${relBar('熟悉度', rel.familiarity, '#88ddaa')}
            </div>

            <div style="text-align: center; margin-top: 15px;">
                <div id="npc-detail-close-btn2" style="display: inline-block; padding: 8px 30px; background: rgba(100,100,150,0.5); border: 1px solid #666699; border-radius: 8px; color: #ccc; cursor: pointer; font-size: 14px;">关闭</div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        // 绑定关闭按钮事件
        const closeBtn = document.getElementById('npc-detail-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeDetail);
        const closeBtn2 = document.getElementById('npc-detail-close-btn2');
        if (closeBtn2) closeBtn2.addEventListener('click', closeDetail);
    }


// 导出模块集合
export const GameNPCDetail = {
    showNPCDetail
};

export default GameNPCDetail;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GameNPCDetail = GameNPCDetail;
}