/**
 * UI渲染 - 技能详情模块
 * 
 * 从ui.js拆分出的独立技能详情模块
 * 包含：显示技能详情（showSkillDetail）
 */

export function showSkillDetail(skillId) {
        const skill = SkillSystem.getSkill(skillId);
        if (!skill) return;

        const elemInfo = this.getElementInfo(skill.element);
        const color = elemInfo.color || '#888';
        const icon = elemInfo.icon || '✨';

        // 技能类型中文
        const typeNames = {
            damage: '伤害技能', heal: '治疗技能', buff: '增益技能',
            debuff: '减益技能', summon: '召唤技能', utility: '辅助技能',
            passive: '被动技能', special: '特殊技能'
        };
        const typeName = typeNames[skill.type] || skill.type || '技能';

        // v2.9.1: 控制技能标记（可打断魔法师施法）
        const controlEffects = ['stun', 'silence', 'freeze', 'paralyze', 'bind', 'fear', 'sleep', 'confuse', 'charm'];
        const hasControlEffect = skill.statusEffects?.some(e => controlEffects.includes(e.type || e)) ||
            skill.effects?.some(e => controlEffects.includes(e.type || e)) ||
            (skill.description && /眩晕|沉默|冰冻|冻结|麻痹|束缚|恐惧|睡眠|混乱|魅惑/.test(skill.description));
        const controlTag = hasControlEffect ? '<span style="color:#66ccff;font-size:11px;margin-left:6px;" title="控制技能，可100%打断正在引导施法的魔法师敌人">🔮 控制技能（可打断施法）</span>' : '';

        // 技能效果信息
        const statsHtml = [];
        if (skill.damageMultiplier) statsHtml.push(`<span style="color:#ff8866;">伤害倍率: ${(skill.damageMultiplier*100).toFixed(0)}%</span>`);
        if (skill.baseDamage) statsHtml.push(`<span style="color:#ff8866;">基础伤害: ${skill.baseDamage}</span>`);
        if (skill.mpCost !== undefined) statsHtml.push(`<span style="color:#88aaff;">MP消耗: ${skill.mpCost}</span>`);
        if (skill.cooldown) statsHtml.push(`<span style="color:#ffcc66;">冷却: ${skill.cooldown}回合</span>`);
        if (skill.hitRate) statsHtml.push(`<span style="color:#aaffaa;">命中率: ${(skill.hitRate*100).toFixed(0)}%</span>`);
        if (skill.critRate) statsHtml.push(`<span style="color:#ff66aa;">暴击率: ${(skill.critRate*100).toFixed(0)}%</span>`);
        // v2.9.0: 打断概率和解锁等级
        if (skill.interruptChance !== undefined && skill.interruptChance > 0) {
            const interruptColor = skill.interruptChance >= 0.4 ? '#ff4444' : skill.interruptChance >= 0.2 ? '#ffaa44' : '#88ff88';
            statsHtml.push(`<span style="color:${interruptColor};">打断概率: ${(skill.interruptChance*100).toFixed(0)}%</span>`);
        }
        // v2.9.0: 施法时间（引导回合数）
        const castTimeMap = { '初阶': 2, '中阶': 3, '高阶': 4, '超阶': 5 };
        const baseCastTime = castTimeMap[skill.tier] || 2;
        if (baseCastTime > 1) {
            statsHtml.push(`<span style="color:#cc88ff;">引导时间: ${baseCastTime}回合（精神力越高越快）</span>`);
        } else {
            statsHtml.push(`<span style="color:#88ff88;">瞬发（无需引导）</span>`);
        }
        if (skill.unlockLevel) {
            const playerLv = typeof Player !== 'undefined' ? Player.getPlayerLevel() : 1;
            const locked = playerLv < skill.unlockLevel;
            statsHtml.push(`<span style="color:${locked?'#ff4444':'#88ff88'};">解锁等级: Lv.${skill.unlockLevel}${locked?' (未解锁)':''}</span>`);
        }
        if (skill.targetType) {
            const targetNames = {enemy:'敌方单体', all_enemies:'敌方全体', self:'自身', ally:'友方单体', all_allies:'友方全体'};
            statsHtml.push(`<span style="color:#aaa;">目标: ${targetNames[skill.targetType] || skill.targetType}</span>`);
        }

        // 元素反应说明
        const reactionExplanations = {
            fire: { '燃烧': '火系技能对目标附加灼烧状态，持续造成伤害，灼烧层数越高伤害越高。', '融化': '火系攻击对冰冻状态的目标造成双倍伤害，并解除冰冻。' },
            ice: { '冻结': '冰系技能有概率使目标冻结，无法行动1-2回合，对已减速目标概率提升。', '碎冰': '攻击冻结状态的目标造成额外暴击伤害。' },
            thunder: { '感电': '雷系技能使目标感电，受到的雷系伤害提升50%，与水系湿润触发连锁反应。', '麻痹': '雷系技能有概率使目标麻痹，有概率无法行动并降低命中率。' },
            water: { '湿润': '水系技能使目标湿润，受到的雷系伤害提升50%，与雷系触发感电反应。', '治疗': '水系技能可恢复HP，部分技能可净化负面状态。' },
            wind: { '连击': '风系技能可触发连击，连续攻击多次，每次伤害递减。', '闪避': '风系技能可提升闪避率，完全躲避攻击。' },
            earth: { '眩晕': '土系技能有概率使目标眩晕，无法行动1回合。', '护盾': '土系技能可生成护盾，吸收伤害。' },
            light: { '净化': '光系技能可移除负面状态，对暗影系敌人造成额外伤害。', '圣光': '光系技能附带圣光效果，持续恢复HP或提升防御。' },
            dark: { '诅咒': '暗系技能可附加诅咒，降低目标攻击力或防御力。', '吸血': '暗系技能造成伤害时恢复一定比例的HP。' },
            heal: { '治疗': '治愈系技能恢复HP，部分技能可复活队友。', '净化': '治愈系技能可移除负面状态。' },
            plant: { '中毒': '植物系技能可附加中毒，持续造成伤害，可叠加层数。', '束缚': '植物系技能可使目标束缚，无法行动。' },
            summon: { '召唤': '召唤系技能可召唤召唤兽协同作战，召唤兽有独立的HP和技能。' }
        };

        // 根据技能系别显示相关元素反应
        const elemReactions = reactionExplanations[skill.element] || {};
        const reactionsHtml = Object.entries(elemReactions).map(([name, desc]) => `
            <div style="margin-bottom:6px;padding:6px 8px;background:${color}11;border-left:2px solid ${color};border-radius:0 4px 4px 0;">
                <span style="color:${color};font-size:11px;font-weight:bold;">${name}</span>
                <div style="color:#aaa;font-size:10px;margin-top:2px;line-height:1.4;">${desc}</div>
            </div>
        `).join('');

        // 术语解释（根据技能系别和效果关键词）
        const skillTerms = {
            fire: [['灼烧', '持续伤害效果，每回合造成基于攻击力的百分比伤害，可叠加层数。'], ['燃点', '火系专属资源，通过使用火系技能积累，满时可释放强力技能。']],
            ice: [['冻结', '控制效果，使目标无法行动1-2回合，对已减速目标概率提升。'], ['减速', '降低目标速度，影响行动顺序和闪避率。']],
            thunder: [['麻痹', '控制效果，使目标有概率无法行动，并降低其命中率。'], ['感电', '使目标受到的雷系伤害提升，可与水系湿润触发反应。']],
            water: [['湿润', '使目标受到的雷系伤害提升50%，与雷系触发感电反应。'], ['潮汐', '水系专属形态，每2回合自动切换涨潮/退潮，影响治疗和伤害。']],
            wind: [['连击', '连续使用风系技能可叠加连击层数，每层提升伤害和速度。'], ['闪避', '完全躲避攻击的概率，风系天赋大幅提升闪避率。']],
            earth: [['岩力', '土系专属资源，通过受到攻击或使用土系技能积累，满时可释放地震。'], ['护盾', '吸收伤害的保护层，土系技能可生成各种护盾。']],
            light: [['净化', '移除目标身上的负面状态效果。'], ['圣光', '光系专属形态，可切换圣光/圣盾形态，影响伤害和防御。']],
            dark: [['诅咒', '持续削弱效果，降低目标攻击力或防御力。'], ['潜行', '暗系触发型效果，进入战斗后自动潜行，首次攻击暴击率大幅提升。']],
            heal: [['治愈之力', '治愈系专属资源，通过治疗技能积累，满时可释放生命绽放。'], ['复苏', '复活已倒下的队友，恢复一定比例HP。']],
            plant: [['中毒', '持续伤害效果，每回合造成伤害，可叠加层数。'], ['束缚', '控制效果，使目标无法行动，持续2回合。']],
            summon: [['召唤兽', '召唤系核心机制，可召唤各种召唤兽协同作战。'], ['契约', '与召唤兽建立契约，契约等级影响召唤兽的属性和技能。']]
        };

        const terms = skillTerms[skill.element] || [];
        const termsHtml = terms.map(([term, desc]) => `
            <div style="margin-bottom:6px;padding:6px 8px;background:rgba(255,215,0,0.05);border-left:2px solid #ffd700;border-radius:0 4px 4px 0;">
                <span style="color:#ffd700;font-size:11px;font-weight:bold;">📖 ${term}</span>
                <div style="color:#aaa;font-size:10px;margin-top:2px;line-height:1.4;">${desc}</div>
            </div>
        `).join('');

        this.elements.gameContainer.innerHTML += `
            <div id="skill-detail-overlay" style="
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
                            ${icon} ${skill.name}
                        </div>
                        <div style="font-size:11px;color:#888;">
                            ${skill.tier || ''} · ${typeName} · ${elemInfo.name || skill.element}
                            ${controlTag}
                        </div>
                    </div>

                    <!-- 技能描述 -->
                    <div style="background:#0a0a1a;border-radius:8px;padding:12px;margin-bottom:15px;">
                        <div style="color:#ccc;font-size:12px;line-height:1.6;">${skill.description}</div>
                    </div>

                    <!-- 技能数值 -->
                    ${statsHtml.length > 0 ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📊 技能数值</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${statsHtml.map(s => `<span style="padding:4px 8px;background:#0a0a1a;border:1px solid #333;border-radius:6px;font-size:11px;">${s}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- 元素反应 -->
                    ${reactionsHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">⚡ 元素反应</div>
                        ${reactionsHtml}
                    </div>
                    ` : ''}

                    <!-- 术语解释 -->
                    ${termsHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📖 术语解释</div>
                        ${termsHtml}
                    </div>
                    ` : ''}

                    <!-- v3.1.0: 技能进阶按钮 -->
                    ${(() => {
                        if (typeof Player === 'undefined' || typeof Player.canAdvanceSkill !== 'function') return '';
                        const check = Player.canAdvanceSkill(skillId);
                        if (!check.advancement) return '';
                        const adv = check.advancement;
                        const advSkill = DataSkills[adv.advancedSkillId];
                        const btnColor = check.canAdvance ? '#ffd700' : '#666';
                        const btnBg = check.canAdvance ? 'linear-gradient(135deg,#ffd700,#ffaa00)' : '#333';
                        return `
                            <div style="margin-bottom:15px;padding:12px;background:rgba(255,215,0,0.08);border:1px solid ${btnColor}44;border-radius:8px;">
                                <div style="color:${btnColor};font-size:13px;font-weight:bold;margin-bottom:6px;">⬆️ 可进阶：${advSkill?.name || adv.advancedSkillId}</div>
                                <div style="color:#aaa;font-size:11px;margin-bottom:8px;line-height:1.5;">${adv.description}</div>
                                <div style="color:#888;font-size:10px;margin-bottom:8px;">
                                    需求：等级${adv.requiredLevel} / ${adv.element}系${adv.requiredElementLevel}级 / 技能点${adv.requiredSkillPoints}
                                </div>
                                <button onclick="Game.advanceSkill('${skillId}')" style="
                                    width:100%;padding:8px;background:${btnBg};
                                    color:${check.canAdvance ? '#000' : '#888'};border:none;border-radius:6px;
                                    font-size:12px;font-weight:bold;cursor:${check.canAdvance ? 'pointer' : 'not-allowed'};
                                    ${check.canAdvance ? '' : 'opacity:0.6;'}
                                " ${check.canAdvance ? '' : 'disabled'}>
                                    ${check.canAdvance ? '进阶技能（消耗' + adv.requiredSkillPoints + '技能点）' : check.reason}
                                </button>
                            </div>
                        `;
                    })()}

                    <!-- 关闭按钮 -->
                    <div style="text-align:center;margin-top:15px;">
                        <button onclick="document.getElementById('skill-detail-overlay').remove();" style="
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
export const UISkillDetail = {
    showSkillDetail
};

export default UISkillDetail;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UISkillDetail = UISkillDetail;
}