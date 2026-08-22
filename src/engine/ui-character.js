/**
 * UI 角色属性界面模块
 * 
 * 从ui.js拆分出的独立角色属性界面渲染模块
 * 包含：角色属性界面、技能tooltip、属性行渲染、界面更新
 */

/**
 * 渲染角色属性界面
 * 绑定到UI对象调用：UICharacter.renderCharacterScreen.call(UI)
 */
export function renderCharacterScreen() {
    const stats = Player.getTotalStats();
    
    this.elements.gameContainer.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a2a, #2a3a3a);">
            
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                background: rgba(0, 0, 0, 0.5);
                border-bottom: 2px solid #447766;
            ">
                <h2 style="color: #ffd700; font-size: 26px;">👤 角色属性</h2>
                <div onclick="Game.closeCharacterPanel()" style="
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
            
            <div style="flex: 1; padding: 40px; overflow-y: auto;">
                <div style="max-width: 600px; margin: 0 auto;">
                    
                    <!-- 基础信息 -->
                    <div style="
                        padding: 25px;
                        background: rgba(30, 50, 50, 0.8);
                        border: 2px solid #447766;
                        border-radius: 15px;
                        margin-bottom: 25px;
                    ">
                        <div style="font-size: 28px; font-weight: bold; color: #fff; margin-bottom: 10px;">
                            ${Player.name}
                        </div>
                        <div style="font-size: 18px; color: #66ff99; margin-bottom: 15px;">
                            等级 ${Player.level}
                            ${typeof RealmSystem !== 'undefined' ? `
                                <span style="font-size: 14px; color: #ffd700; margin-left: 15px;">
                                    ${RealmSystem.getRealm(Player.realm || 'initial').name}魔法师
                                </span>
                            ` : ''}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                            ${Player.elements.map(elem => {
                                const elLv = Player.getElementLevel(elem);
                                const elRealm = elLv >= 56 ? '超' : elLv >= 31 ? '高' : elLv >= 11 ? '中' : '初';
                                return `<span style="
                                    padding: 6px 15px;
                                    background: ${SkillSystem.getElementColor(elem)}22;
                                    border: 1px solid ${SkillSystem.getElementColor(elem)};
                                    border-radius: 15px;
                                    font-size: 14px;
                                    color: ${SkillSystem.getElementColor(elem)};
                                ">${SkillSystem.getElementName(elem)} Lv.${elLv}(${elRealm})</span>`;
                            }).join('')}
                        </div>
                        ${Player.mentor ? `
                            <div style="padding: 10px 15px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; margin-bottom: 15px; display: inline-block;">
                                <span style="color: #ffd700; font-size: 14px;">📚 导师：唐月（Lv.${Player.mentor.level || 1}）</span>
                                <span style="color: #aaa; font-size: 12px; margin-left: 10px;">修炼经验+${10 + (Player.mentor.level - 1) * 5}%</span>
                            </div>
                        ` : ''}
                        ${(() => {
                            const tier = Player.getInfluenceTier ? Player.getInfluenceTier() : { level: 0, name: '无名小卒', color: '#999' };
                            const perks = [];
                            if (tier.level >= 1) perks.push('修炼+5%');
                            if (tier.level >= 2) perks.push('NPC指导+5%');
                            if (tier.level >= 3) perks.push('任务经验+10%');
                            if (tier.level >= 4) perks.push('全属性+5%');
                            return `
                            <div style="
                                padding: 10px 15px;
                                background: linear-gradient(135deg, #ffdd6622, #ffaa3322);
                                border: 1px solid #ffcc44;
                                border-radius: 10px;
                                margin-bottom: 15px;
                            ">
                                <div><span style="color: ${tier.color}; font-size: 14px; font-weight: bold;">🌟 ${tier.name}：${Player.influence || 0}</span>
                                ${(Player.changedStoryNodes && Player.changedStoryNodes.length > 0) ? `<span style="color: #ffaa66; font-size: 12px; margin-left: 15px;">已改变剧情：${Player.changedStoryNodes.length}个节点</span>` : ''}</div>
                                ${perks.length > 0 ? `<div style="color: #88cc88; font-size: 11px; margin-top: 4px;">已解锁：${perks.join(' · ')}</div>` : ''}
                            </div>
                        `;})()}
                        
                        <!-- v1.2.2: 属性分配区域移到顶部，确保可见 -->
                        ${Player.attributePoints > 0 ? `
                        <div style="
                            padding: 12px 15px;
                            background: rgba(80, 60, 20, 0.5);
                            border: 2px solid #aa8833;
                            border-radius: 10px;
                            margin-bottom: 15px;
                            text-align: center;
                        ">
                            <div style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">
                                ⭐ 可分配属性点: ${Player.attributePoints}
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                ${['vitality','spirit','attack','defense','speed'].map(attr => {
                                    const names = {vitality:'体质', spirit:'精神', attack:'攻击', defense:'防御', speed:'速度'};
                                    const icons = {vitality:'❤️', spirit:'🧠', attack:'⚔️', defense:'🛡️', speed:'👟'};
                                    return `<div onclick="Game.addAttribute('${attr}')" style="
                                        padding: 8px 4px;
                                        background: #44aa44;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: bold;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='#55cc55'" onmouseout="this.style.background='#44aa44'">
                                        ${icons[attr]} ${names[attr]}+
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 属性概览（简洁版，详细属性在下方） -->
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 8px;
                            margin-bottom: 15px;
                            padding: 10px;
                            background: rgba(30, 50, 50, 0.5);
                            border-radius: 8px;
                        ">
                            <div style="text-align:center;"><div style="font-size:11px;color:#888;">攻击</div><div style="font-size:16px;color:#ffaaaa;font-weight:bold;">${stats.attack}</div></div>
                            <div style="text-align:center;"><div style="font-size:11px;color:#888;">防御</div><div style="font-size:16px;color:#aaccff;font-weight:bold;">${stats.defense}</div></div>
                            <div style="text-align:center;"><div style="font-size:11px;color:#888;">速度</div><div style="font-size:16px;color:#aaffaa;font-weight:bold;">${stats.speed}</div></div>
                            <div style="text-align:center;"><div style="font-size:11px;color:#888;">暴击</div><div style="font-size:16px;color:#ffcc66;font-weight:bold;">${(stats.critRate*100).toFixed(0)}%</div></div>
                        </div>
                        
                        ${typeof RealmSystem !== 'undefined' ? `
                            <div onclick="Game.showBreakthroughPanel()" style="
                                padding: 10px 15px;
                                background: linear-gradient(135deg, #ff660033, #ff330033);
                                border: 2px solid #ff6600;
                                border-radius: 10px;
                                cursor: pointer;
                                text-align: center;
                                margin-bottom: 15px;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='linear-gradient(135deg, #ff660055, #ff330055)'" onmouseout="this.style.background='linear-gradient(135deg, #ff660033, #ff330033)'">
                                <span style="color: #ff9933; font-size: 15px; font-weight: bold;">
                                    ⚡ 境界突破
                                    ${Player.canBreakthrough && Player.canBreakthrough().canBreakthrough ? ' (可突破!)' : ''}
                                </span>
                            </div>
                        ` : ''}
                        ${Player.innateTalent && typeof InnateTalentSystem !== 'undefined' ? `
                        <div style="margin-bottom: 15px; text-align: left;">
                            <div style="color: #ff88ff; font-size: 13px; margin-bottom: 8px;">✦ 天生天赋</div>
                            ${(() => {
                                const display = InnateTalentSystem.getTalentDisplay();
                                if (!display) return '';
                                return `
                                    <div style="
                                        padding: 10px 14px;
                                        background: ${display.rarityColor}15;
                                        border: 2px solid ${display.rarityColor};
                                        border-radius: 8px;
                                    ">
                                        <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                            <span style="font-size: 22px; margin-right: 8px;">${display.icon}</span>
                                            <div>
                                                <span style="color: ${display.rarityColor}; font-weight: bold; font-size: 16px;">${display.name}</span>
                                                <span style="color: #ffd700; font-size: 12px; margin-left: 8px;">Lv.${Player.innateTalentLevel || 1}</span>
                                                <span style="color: ${display.rarityColor}; font-size: 11px; margin-left: 8px;">【${display.rarityName}】</span>
                                            </div>
                                        </div>
                                        <div style="color: #ccc; font-size: 12px; margin-bottom: 4px;">${display.description}</div>
                                        <div style="color: #66ff99; font-size: 12px; font-weight: bold;">${display.effectDesc}</div>
                                    </div>
                                `;
                            })()}
                        </div>
                        ` : ''}
                        ${Player.talents && Object.keys(Player.talents).length > 0 ? `
                        <div style="margin-bottom: 15px; text-align: left;">
                            <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">🌟 系别天赋</div>
                            ${(() => {
                                const elemNames = { fire:'🔥 火系', ice:'❄️ 冰系', thunder:'⚡ 雷系', water:'💧 水系', wind:'🌪️ 风系', earth:'🪨 土系', light:'✨ 光系', dark:'🌑 暗系', heal:'💚 治愈系', plant:'🌿 植物系', summon:'📜 召唤系' };
                                const elemColors = { fire:'#ff6633', ice:'#66ccff', thunder:'#ffcc00', water:'#6699ff', wind:'#99ff99', earth:'#cc9966', light:'#ffffcc', dark:'#9966ff', heal:'#66ff99', plant:'#66cc66', summon:'#cc99ff' };
                                const combo = Player.getCrossElementCombo ? Player.getCrossElementCombo() : null;
                                const primary = Player.primaryElement;
                                const secondary = Player.secondaryElement;
                                const canChange = Player.elements.length >= 2;

                                const renderElemCard = (elem, role, color) => {
                                    if (!elem) return `<div style="flex:1;padding:12px;background:#1a1a2a;border:2px dashed #444;border-radius:10px;text-align:center;color:#555;font-size:12px;">未选择${role}</div>`;
                                    return `
                                        <div style="flex:1;padding:12px;background:${color}15;border:2px solid ${color};border-radius:10px;text-align:center;cursor:${canChange?'pointer':'default'};transition:all 0.3s;" ${canChange ? `onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 15px ${color}40';" onmouseout="this.style.transform='';this.style.boxShadow='none';"` : ''}>
                                            <div style="font-size:10px;color:${color};font-weight:bold;margin-bottom:4px;">${role === '主修' ? '⭐ 主修' : '💫 副修'}</div>
                                            <div style="font-size:15px;font-weight:bold;color:${color};">${elemNames[elem] || elem}</div>
                                            <div style="font-size:10px;color:#888;margin-top:3px;">${role === '主修' ? '100% 效果' : '70% 效果'}</div>
                                        </div>
                                    `;
                                };

                                return `
                                    <div onclick="${canChange ? "UI.showPrimarySecondarySelection(Player.elements.slice(-2), function(p,s){Player.setPrimaryElement(p);Player.setSecondaryElement(s);Player.save();Game.openCharacterPanel();}, false)" : ''}" style="margin-bottom: 10px; padding: 12px; background: linear-gradient(135deg,#1a1a2e,#16213e); border-radius: 10px; border: 1px solid #333;cursor:${canChange?'pointer':'default'};">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                            <span style="color:#aaa;font-size:11px;">⚔️ 主副修配置</span>
                                            ${canChange ? '<span style="color:#ffd700;font-size:10px;">点击更换 ›</span>' : ''}
                                        </div>
                                        <div style="display:flex;gap:10px;">
                                            ${renderElemCard(primary, '主修', '#ffd700')}
                                            ${renderElemCard(secondary, '副修', '#88ccff')}
                                        </div>
                                        <div style="font-size:10px;color:#666;margin-top:8px;text-align:center;">主修100% | 副修70% | 其他50%</div>
                                        ${combo ? `<div style="margin-top: 8px; padding: 6px 10px; background: linear-gradient(90deg,#ffd70022,#ff88ff22); border-radius: 6px; border: 1px solid #ffd70055;text-align:center;">
                                            <span style="color: #ffd700; font-size: 11px; font-weight: bold;">✨ ${combo.name}</span>
                                            <span style="color: #ccc; font-size: 10px; margin-left: 6px;">${combo.desc}</span>
                                        </div>` : ''}
                                    </div>
                                `;
                            })()}
                            ${Player.elements.map(elem => {
                                const talentData = Player.talents[elem];
                                if (!talentData || typeof TalentSystem === 'undefined') return '';
                                const talent = TalentSystem.getTalent(talentData.talentId);
                                if (!talent) return '';
                                const rarityConfig = TalentSystem.getRarityConfig(talent.rarity);
                                const maxLevel = talent.maxLevel || 10;
                                const expToNext = TalentSystem.getExpToNextLevel(talentData.level);
                                const expPercent = talentData.level >= maxLevel ? 100 : (talentData.exp / expToNext * 100);
                                const effects = TalentSystem.getTalentEffects(talentData.talentId, talentData.level);
                                const currentStage = TalentSystem.getCurrentStage(talentData.talentId, talentData.level);
                                const nextStage = TalentSystem.getNextStage(talentData.talentId, talentData.level);
                                const effectDesc = TalentSystem.summarizeEffects ? TalentSystem.summarizeEffects(effects) : Object.entries(effects).map(([k, v]) => {
                                    const names = {damageBonus:'伤害加成', healBonus:'治疗加成', defenseBonus:'防御加成', speedBonus:'速度加成', hpBonus:'生命加成', critRate:'暴击率', critDamage:'暴击伤害', mpCostReduction:'耗蓝减少', dodgeBonus:'闪避率', hpRegen:'HP回复', mpRegen:'MP回复', burnChance:'灼烧概率', freezeChance:'冰冻概率', paralyzeChance:'麻痹概率'};
                                    const pct = (v * 100).toFixed(0);
                                    return `${names[k]||k}+${pct}%`;
                                }).join(', ');
                                const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };
                                const mechanismLabels = {
                                    resource: { name: '资源型', icon: '⚡', color: '#ffaa44' },
                                    state: { name: '状态型', icon: '❄️', color: '#66ccff' },
                                    form: { name: '形态型', icon: '🔄', color: '#aa66ff' },
                                    trigger: { name: '触发型', icon: '💥', color: '#ff6666' },
                                    passive: { name: '光环型', icon: '✨', color: '#66ff88' }
                                };
                                const mech = talent.mechanism ? mechanismLabels[talent.mechanism] : null;
                                let mechTag = mech ? `<span style="font-size:10px;color:${mech.color};background:${mech.color}22;padding:1px 5px;border-radius:3px;margin-left:6px;">${mech.icon}${mech.name}</span>` : '';
                                let stageInfo = '';
                                if (currentStage) {
                                    const sc = stageColors[currentStage.stage] || '#aaa';
                                    stageInfo += `<div style="color:${sc};font-size:11px;margin-top:2px;">【${currentStage.stage}】${currentStage.name}</div>`;
                                }
                                if (nextStage) {
                                    const nc = stageColors[nextStage.stage] || '#888';
                                    stageInfo += `<div style="color:${nc};font-size:10px;margin-top:1px;opacity:0.7;">→ Lv${nextStage.level}【${nextStage.stage}】${nextStage.name}</div>`;
                                }
                                const talentTooltip = `${talent.description || ''}\n[Lv.${talentData.level}] ${effectDesc}${currentStage ? '\n当前：【'+currentStage.stage+'】'+currentStage.name+' - '+currentStage.description : ''}${nextStage ? '\n下一进化：Lv'+nextStage.level+'【'+nextStage.stage+'】'+nextStage.name+' - '+nextStage.description : ''}`;
                                return `
                                    <div onclick="UI.showTalentDetail('${elem}')" style="
                                        padding: 8px 12px;
                                        background: ${rarityConfig.color}11;
                                        border: 1px solid ${rarityConfig.color}55;
                                        border-radius: 8px;
                                        margin-bottom: 6px;
                                        font-size: 13px;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='${rarityConfig.color}22';this.style.borderColor='${rarityConfig.color}';" onmouseout="this.style.background='${rarityConfig.color}11';this.style.borderColor='${rarityConfig.color}55';" title="${talentTooltip.replace(/"/g, '&quot;')}">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                            <span>
                                                <span style="color: ${SkillSystem.getElementColor(elem)}; font-weight: bold;">${SkillSystem.getElementName(elem)}</span>
                                                <span style="color: ${rarityConfig.color}; margin-left: 8px;">${talent.name}</span>
                                                ${mechTag}
                                            </span>
                                            <span style="color: #888; font-size: 12px;">Lv.${talentData.level}${talentData.level >= maxLevel ? ' (满)' : ''}</span>
                                        </div>
                                        ${stageInfo}
                                        ${(() => {
                                            if (talentData.level >= 5 && talent.evolutions) {
                                                const evolveStage = talent.evolutions.find(e => e.level === 5 && e.branchChoices);
                                                if (evolveStage && !talentData.branch) {
                                                    return `
                                                        <div style="margin-top: 6px; padding: 6px 8px; background: #ffd70022; border: 1px solid #ffd70055; border-radius: 4px;">
                                                            <div style="color: #ffd700; font-size: 11px; margin-bottom: 4px;">⚡ 可选择进化分支</div>
                                                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                                                ${evolveStage.branchChoices.map(b => `
                                                                    <button onclick="UI.selectTalentBranch('${elem}', '${b.id}')" 
                                                                            style="flex: 1; min-width: 60px; padding: 4px 6px; background: #ffd70033; border: 1px solid #ffd700; border-radius: 3px; color: #ffd700; font-size: 11px; cursor: pointer;"
                                                                            title="${b.description}">${b.name}</button>
                                                                    `).join('')}
                                                                </div>
                                                        </div>
                                                    `;
                                                }
                                                if (talentData.branch && evolveStage) {
                                                    const selectedBranch = evolveStage.branchChoices.find(b => b.id === talentData.branch);
                                                    if (selectedBranch) {
                                                        return `<div style="margin-top: 4px; color: #66ff99; font-size: 11px;">分支：${selectedBranch.name}</div>`;
                                                    }
                                                }
                                            }
                                            return '';
                                        })()}
                                        ${talentData.level < maxLevel ? `
                                        <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-top: 4px;">
                                            <div style="height: 100%; width: ${expPercent.toFixed(1)}%; background: ${rarityConfig.color};"></div>
                                        </div>
                                        <div style="color: #666; font-size: 11px; text-align: right; margin-top: 2px;">${talentData.exp} / ${expToNext}</div>
                                        ` : ''}
                                        ${(talentData.level > 1 || talentData.branch) ? `
                                        <div style="margin-top: 6px; text-align: right;">
                                            <button onclick="UI.resetTalent('${elem}')" 
                                                    style="padding: 3px 8px; background: #663333; border: 1px solid #aa5555; border-radius: 3px; color: #ff9999; font-size: 10px; cursor: pointer;"
                                                    title="重置天赋：等级回到1，经验归零，分支清空">🔄 重置</button>
                                        </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ` : ''}
                        ${Player.spiritSeeds && Object.keys(Player.spiritSeeds).length > 0 ? `
                        <div style="margin-bottom: 15px; text-align: left;">
                            <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">💎 灵种</div>
                            ${Player.elements.map(elem => {
                                const seed = Player.getElementSpiritSeed(elem);
                                if (!seed || typeof SpiritSeedSystem === 'undefined') return '';
                                const gradeConfig = SpiritSeedSystem.getGradeConfig(seed.grade);
                                const isRare = seed.isRare;
                                return `
                                    <div style="
                                        padding: 8px 12px;
                                        background: ${gradeConfig.color}11;
                                        border: ${isRare ? '2px' : '1px'} solid ${isRare ? '#ffd700' : gradeConfig.color + '55'};
                                        border-radius: 8px;
                                        margin-bottom: 6px;
                                        font-size: 13px;
                                        ${isRare ? 'box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);' : ''}
                                    ">
                                        <span style="color: ${SkillSystem.getElementColor(elem)}; font-weight: bold;">${SkillSystem.getElementName(elem)}</span>
                                        <span style="color: ${isRare ? '#ffd700' : gradeConfig.color}; margin-left: 8px;">${seed.name}</span>
                                        <span style="color: #888; font-size: 12px; margin-left: 8px;">[${gradeConfig.name}]</span>
                                        ${isRare ? '<span style="color: #ffd700; font-size: 12px; margin-left: 6px;">✨稀有</span>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ` : ''}
                        ${Player.starDustArtifacts && Object.keys(Player.starDustArtifacts).length > 0 ? `
                        <div style="margin-bottom: 15px; text-align: left;">
                            <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">⭐ 星尘魔器</div>
                            ${Object.keys(Player.starDustArtifacts).map(elem => {
                                const artifactData = Player.starDustArtifacts[elem];
                                if (!artifactData || typeof StarDustArtifactSystem === 'undefined') return '';
                                const artifact = StarDustArtifactSystem.getArtifact(artifactData.id);
                                if (!artifact) return '';
                                const gradeConfig = StarDustArtifactSystem.getGradeConfig(artifact.grade);
                                const effect = StarDustArtifactSystem.getCultivateEffect(artifactData);
                                const elementName = artifact.element === "all" ? "全元素" : SkillSystem.getElementName(artifact.element);
                                const elementColor = artifact.element === "all" ? "#ffcc00" : SkillSystem.getElementColor(artifact.element);
                                return `
                                    <div style="
                                        padding: 8px 12px;
                                        background: ${gradeConfig.color}11;
                                        border: 1px solid ${gradeConfig.color}55;
                                        border-radius: 8px;
                                        margin-bottom: 6px;
                                        font-size: 13px;
                                    ">
                                        <span style="color: ${elementColor}; font-weight: bold;">${elementName}</span>
                                        <span style="color: ${gradeConfig.color}; margin-left: 8px;">${artifact.name}</span>
                                        <span style="color: #888; font-size: 12px; margin-left: 8px;">[${gradeConfig.name}]</span>
                                        ${artifact.grade === 'growth' ? `<span style="color: #ffcc00; font-size: 12px; margin-left: 8px;">Lv.${artifactData.level || 1}</span>` : ''}
                                        <div style="color: #888; font-size: 11px; margin-top: 4px;">
                                            修炼时间 +${Math.round(effect.timeBonus * 100)}% · 修炼经验 +${Math.round(effect.expBonus * 100)}%
                                        </div>
                                        ${artifact.grade === 'growth' ? `
                                        <div style="margin-top: 6px;">
                                            <div style="color: #888; font-size: 10px; margin-bottom: 2px;">
                                                经验: ${artifactData.exp || 0} / ${StarDustArtifactSystem.getExpToNextLevel(artifactData.level || 1)}
                                            </div>
                                            <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                                                <div style="height: 100%; width: ${Math.min(100, ((artifactData.exp || 0) / StarDustArtifactSystem.getExpToNextLevel(artifactData.level || 1)) * 100).toFixed(1)}%; background: linear-gradient(90deg, #ffcc00, #ffdd44);"></div>
                                            </div>
                                            <div onclick="Game.showArtifactUpgradePanel('${elem}')" style="
                                                margin-top: 6px;
                                                padding: 4px 10px;
                                                background: linear-gradient(135deg, #cc9900, #ffcc00);
                                                border-radius: 5px;
                                                text-align: center;
                                                cursor: pointer;
                                                color: #332200;
                                                font-size: 11px;
                                                font-weight: bold;
                                            " onmouseover="this.style.background='linear-gradient(135deg, #ddaa00, #ffdd44)'" onmouseout="this.style.background='linear-gradient(135deg, #cc9900, #ffcc00)'">
                                                ⬆️ 用精魄升级
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ` : ''}
                        ${Player.starDustAssignment && typeof StarDustArtifactSystem !== 'undefined' ? (() => {
                            const assign = Player.starDustAssignment;
                            const artifact = StarDustArtifactSystem.getArtifact(assign.artifactId);
                            if (!artifact) return '';
                            const gradeName = assign.grade === 'exquisite' ? '精品' : '普通';
                            const gradeColor = assign.grade === 'exquisite' ? '#aa88ff' : '#88aacc';
                            const sourceName = assign.source === 'mu_family' ? '穆氏家族' : '学校分配';
                            const bonus = StarDustArtifactSystem.getActiveBonus(Player);
                            return `
                        <div style="margin-bottom: 15px; text-align: left;">
                            <div style="color: #aaa; font-size: 13px; margin-bottom: 8px;">📜 星尘魔器使用权</div>
                            <div style="
                                padding: 8px 12px;
                                background: ${gradeColor}11;
                                border: 1px solid ${gradeColor}55;
                                border-radius: 8px;
                                font-size: 13px;
                            ">
                                <span style="color: ${gradeColor}; font-weight: bold;">${artifact.name}</span>
                                <span style="color: #888; font-size: 12px; margin-left: 8px;">[${gradeName}级·${sourceName}]</span>
                                <div style="color: #ffcc44; font-size: 12px; margin-top: 4px;">
                                    ⏳ 剩余 ${assign.daysRemaining} 天 / 共 ${assign.totalDays} 天
                                </div>
                                <div style="color: #888; font-size: 11px; margin-top: 4px;">
                                    修炼经验 +${Math.round(bonus.expBonus * 100)}% · 疲劳恢复 +${Math.round(bonus.fatigueBonus * 100)}%
                                </div>
                                <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin-top: 6px;">
                                    <div style="height: 100%; width: ${(assign.daysRemaining / assign.totalDays * 100).toFixed(1)}%; background: linear-gradient(90deg, ${gradeColor}, ${gradeColor}aa);"></div>
                                </div>
                            </div>
                        </div>
                            `;
                        })() : ''}
                        ${(() => {
                            Player.migrateSummonData();
                            const beasts = Player.summonBeasts || [];
                            const maxCount = Player.getMaxSummonCount();
                            const realmNames = { initial: '初阶', primary: '初阶', middle: '中阶', high: '高阶', super: '超阶' };
                            if (beasts.length === 0) return '';
                            let html = '<div style="margin-bottom: 15px; text-align: left;">';
                            html += `<div style="color: #aa88ff; font-size: 13px; margin-bottom: 8px;">🐺 召唤兽 (${beasts.length}/${maxCount} · ${realmNames[Player.realm]})</div>`;
                            beasts.forEach((sd, idx) => {
                                const isActive = idx === Player.activeSummonIndex;
                                const rarityColors = { '普通': '#aaaaaa', '优秀': '#66ff66', '稀有': '#6699ff', '史诗': '#cc66ff', '传说': '#ffaa44' };
                                const rarityColor = rarityColors[sd.rarity] || '#aaaaaa';
                                const calcBeastScore = (beastData) => {
                                    const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(beastData) : null;
                                    const stats = currentData ? currentData.effectiveStats : {
                                        maxHp: beastData.baseMaxHp, attack: beastData.baseAttack, defense: beastData.baseDefense, speed: beastData.baseSpeed
                                    };
                                    const lb = 1 + (beastData.level - 1) * 0.15;
                                    return Math.floor((stats.maxHp || 0) * 0.1 * lb + (stats.attack || 0) * 2 * lb + (stats.defense || 0) * 1.5 * lb + (stats.speed || 0) * 2 * lb);
                                };
                                const beastScore = calcBeastScore(sd);
                                const borderColor = isActive ? rarityColor : '#555';
                                const bgColor = isActive ? `${rarityColor}22` : 'rgba(50, 50, 70, 0.2)';
                                html += `<div style="padding: 12px 15px; background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 10px; margin-bottom: ${isActive ? '10px' : '6px'}; ${isActive ? `box-shadow: 0 0 10px ${rarityColor}44;` : ''}">`;
                                html += `<div style="display: flex; align-items: center; margin-bottom: 8px;">`;
                                html += `<span style="font-size: 28px; margin-right: 10px;">${sd.icon}</span>`;
                                html += `<div style="flex: 1;">`;
                                html += `<div style="color: ${rarityColor}; font-weight: bold; font-size: 16px;">${sd.name}${isActive ? ' <span style="color:#ffaa00;font-size:11px;">出战中</span>' : ''} <span style="font-size: 10px; color: #ffd700; background: rgba(100, 80, 20, 0.5); padding: 1px 5px; border-radius: 5px;">⭐${beastScore}</span></div>`;
                                html += `<div style="color: #999; font-size: 12px;">Lv.${sd.level} · 忠诚 ${sd.loyalty}/100 · <span style="color: ${rarityColor};">${sd.rarity || '普通'}</span></div>`;
                                html += `</div>`;
                                if (!isActive) {
                                    html += `<div onclick="Game.switchSummon(${idx})" style="padding: 4px 10px; background: #554488; border-radius: 5px; cursor: pointer; color: #fff; font-size: 11px;">出战</div>`;
                                }
                                html += `</div>`;
                                if (!isActive) {
                                    html += (() => {
                                        const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                        const stats = currentData ? currentData.effectiveStats : {
                                            maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
                                        };
                                        const lb = 1 + (sd.level - 1) * 0.15;
                                        return `<div style="display: flex; gap: 12px; font-size: 11px; color: #888;">
                                            <span>❤️${Math.floor(stats.maxHp * lb)}</span>
                                            <span>⚔️${Math.floor(stats.attack * lb)}</span>
                                            <span>🛡️${Math.floor(stats.defense * lb)}</span>
                                            <span>💨${Math.floor(stats.speed * lb)}</span>
                                        </div>`;
                                    })();
                                }
                                if (isActive) {
                                    html += (() => {
                                        const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                        const beast = currentData || DataSummonBeasts[sd.id];
                                        return beast && beast.description ? `<div style="color: #888; font-size: 11px; margin-bottom: 6px; font-style: italic;">${beast.description}</div>` : '';
                                    })();
                                    html += `<div style="display: flex; gap: 15px; font-size: 12px; color: #aaa; margin-bottom: 6px;">`;
                                    html += (() => {
                                        const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                        const stats = currentData ? currentData.effectiveStats : {
                                            maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
                                        };
                                        const lb = 1 + (sd.level - 1) * 0.15;
                                        return `<span>❤️ ${Math.floor(stats.maxHp * lb)}</span>
                                            <span>⚔️ ${Math.floor(stats.attack * lb)}</span>
                                            <span>🛡️ ${Math.floor(stats.defense * lb)}</span>
                                            <span>💨 ${Math.floor(stats.speed * lb)}</span>`;
                                    })();
                                    html += `</div>`;
                                    html += sd.level < 30 ? `
                                    <div style="height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                                        <div style="height: 100%; width: ${(sd.exp / sd.expToNext * 100).toFixed(1)}%; background: linear-gradient(90deg, #aa66ff, #cc99ff);"></div>
                                    </div>
                                    <div style="color: #666; font-size: 10px; text-align: right; margin-top: 2px;">${sd.exp} / ${sd.expToNext}</div>
                                    ` : '<div style="color: #ffd700; font-size: 11px;">已满级</div>';
                                    html += `<div style="color: #888; font-size: 10px; margin-top: 6px;">`;
                                    html += (() => {
                                        const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                                        const beast = currentData || DataSummonBeasts[sd.id];
                                        if (!beast) return '技能：撕咬';
                                        const allSkills = beast.skills || [];
                                        const unlocked = allSkills.filter(s => sd.level >= s.minLevel);
                                        const locked = allSkills.filter(s => sd.level < s.minLevel);
                                        let skillText = '已学：' + unlocked.map(s => s.name).join('/');
                                        if (locked.length > 0) {
                                            skillText += ' · 未学：' + locked.map(s => `${s.name}(Lv${s.minLevel})`).join('/');
                                        }
                                        return skillText;
                                    })();
                                    html += `</div>`;
                                    html += (() => {
                                        const evoInfo = typeof Player.getSummonEvolutionInfo === 'function' ? Player.getSummonEvolutionInfo() : null;
                                        if (!evoInfo) return '';
                                        if (evoInfo.isMaxStage) {
                                            return '<div style="color: #ffd700; font-size: 11px; margin-top: 8px; text-align: center;">★ 已达最终形态</div>';
                                        }
                                        const next = evoInfo.nextEvolution;
                                        if (evoInfo.canEvolve) {
                                            return `<div onclick="Game.evolveSummon()" style="margin-top: 8px; padding: 8px; background: linear-gradient(135deg, #9966ff, #cc66ff); border-radius: 6px; text-align: center; cursor: pointer; color: #fff; font-weight: bold; font-size: 13px; animation: pulse 1.5s infinite;">✨ 进化为 ${next.icon} ${next.name}！</div>`;
                                        }
                                        const realmNames2 = { initial: '初阶', primary: '初阶', middle: '中阶', high: '高阶' };
                                        const realmOrder = { initial: 1, primary: 1, middle: 2, high: 3 };
                                        const levelMet = sd.level >= next.minBeastLevel;
                                        const loyaltyMet = sd.loyalty >= next.minLoyalty;
                                        const realmMet = (realmOrder[Player.realm] || 1) >= (realmOrder[next.minPlayerRealm] || 1);
                                        const levelPercent = Math.min(100, (sd.level / next.minBeastLevel) * 100);
                                        const loyaltyPercent = Math.min(100, (sd.loyalty / next.minLoyalty) * 100);
                                        return `<div style="margin-top: 8px; padding: 8px; background: rgba(150,100,200,0.1); border: 1px solid #8866aa; border-radius: 6px;">
                                            <div style="color: #cc99ff; font-size: 12px; margin-bottom: 6px; font-weight: bold;">下一形态：${next.icon} ${next.name}</div>
                                            <div style="font-size: 10px; margin-bottom: 4px;">
                                                <span style="color: ${levelMet ? '#66ff66' : '#ff6666'};">等级: ${sd.level}/${next.minBeastLevel} ${levelMet ? '✓' : ''}</span>
                                                <div style="height: 3px; background: #333; border-radius: 2px; margin-top: 2px; overflow: hidden;">
                                                    <div style="height: 100%; width: ${levelPercent}%; background: ${levelMet ? '#66ff66' : '#ffaa44'};"></div>
                                                </div>
                                            </div>
                                            <div style="font-size: 10px; margin-bottom: 4px;">
                                                <span style="color: ${loyaltyMet ? '#66ff66' : '#ff6666'};">忠诚: ${sd.loyalty}/${next.minLoyalty} ${loyaltyMet ? '✓' : ''}</span>
                                                <div style="height: 3px; background: #333; border-radius: 2px; margin-top: 2px; overflow: hidden;">
                                                    <div style="height: 100%; width: ${loyaltyPercent}%; background: ${loyaltyMet ? '#66ff66' : '#ffaa44'};"></div>
                                                </div>
                                            </div>
                                            <div style="font-size: 10px;">
                                                <span style="color: ${realmMet ? '#66ff66' : '#ff6666'};">境界: ${realmNames2[Player.realm]}/${realmNames2[next.minPlayerRealm]} ${realmMet ? '✓' : ''}</span>
                                            </div>
                                        </div>`;
                                    })();
                                }
                                html += `</div>`;
                            });
                            if (beasts.length < maxCount) {
                                html += `<div onclick="Game.seekNewSummon()" style="padding: 10px; background: rgba(80, 60, 120, 0.3); border: 2px dashed #8866cc; border-radius: 8px; text-align: center; cursor: pointer; color: #aa88ff; font-size: 13px;">
                                    🔮 寻找新的契约兽（${realmNames[Player.realm]}可契约${maxCount}只）
                                </div>`;
                            }
                            html += '</div>';
                            return html;
                        })()}
                        ${Player.canAwakenNewElement() ? `
                        <div onclick="Game.showAwakenPanel()" style="
                            display: inline-block;
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #ff8844, #ff4488);
                            border-radius: 10px;
                            color: #fff;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-bottom: 15px;
                            box-shadow: 0 0 15px rgba(255, 100, 100, 0.5);
                        ">✨ 觉醒新元素系</div>
                        ` : ''}
                        <div style="color: #aaa; font-size: 14px;">
                            经验: ${Player.exp} / ${Player.expToNext}
                        </div>
                        <div style="height: 10px; background: #333; border-radius: 5px; overflow: hidden; margin-top: 5px;">
                            <div style="height: 100%; width: ${(Player.exp / Player.expToNext * 100).toFixed(1)}%; background: linear-gradient(90deg, #66ff66, #99ff99);"></div>
                        </div>
                    </div>
                    
                    <!-- 详细属性列表 -->
                    <div style="
                        padding: 25px;
                        background: rgba(30, 50, 50, 0.8);
                        border: 2px solid #447766;
                        border-radius: 15px;
                    ">
                        <h3 style="color: #ffd700; margin-bottom: 20px;">📊 详细属性</h3>
                        
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            ${this.renderAttributeRow('❤️', '生命值', Player.hp, stats.maxHp, 'vitality')}
                            ${this.renderAttributeRow('💧', '魔法值', Player.mp, stats.maxMp, 'spirit')}
                            ${this.renderAttributeRow('⚔️', '攻击力', stats.attack, null, 'attack')}
                            ${this.renderAttributeRow('🛡️', '防御力', stats.defense, null, 'defense')}
                            ${this.renderAttributeRow('👟', '速度', stats.speed, null, 'speed')}
                            ${this.renderAttributeRow('🧠', '精神力', Player.spirit, null, 'spirit')}
                            ${this.renderAttributeRow('💥', '暴击率', (stats.critRate * 100).toFixed(1) + '%', null, null)}
                            ${this.renderAttributeRow('🎯', '命中率', (stats.hitRate * 100).toFixed(1) + '%', null, null)}
                        </div>
                    </div>
                    
                    <!-- 技能列表 -->
                    <div style="
                        padding: 25px;
                        background: rgba(30, 50, 50, 0.8);
                        border: 2px solid #447766;
                        border-radius: 15px;
                        margin-top: 25px;
                    ">
                        <h3 style="color: #ffd700; margin-bottom: 20px;">✨ 已学技能</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${Player.skills.map(skillId => {
                                const skill = SkillSystem.getSkill(skillId);
                                if (!skill) return '';
                                
                                const skillLevel = Player.getSkillLevel ? Player.getSkillLevel(skillId) : 1;
                                const skillExp = Player.getSkillExp ? Player.getSkillExp(skillId) : 0;
                                const expToNext = typeof SkillLevelSystem !== 'undefined' ? SkillLevelSystem.getExpToNextLevel(skillLevel) : 0;
                                const isMaxLevel = skillLevel >= (typeof SkillLevelSystem !== 'undefined' ? SkillLevelSystem.MAX_LEVEL : 3);
                                const expPercent = isMaxLevel ? 100 : Math.floor((skillExp / expToNext) * 100);
                                const elementColor = SkillSystem.getElementColor(skill.element);
                                
                                return `
                                    <div style="
                                        padding: 12px 15px;
                                        background: ${elementColor}15;
                                        border-left: 4px solid ${elementColor};
                                        border-radius: 5px;
                                    ">
                                        <div style="font-size: 16px; color: #fff; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                                            <span>
                                                ${skill.name}
                                                <span style="font-size: 12px; color: ${elementColor}; margin-left: 10px;">${skill.tier} · ${SkillSystem.getElementName(skill.element)}</span>
                                            </span>
                                            <span style="font-size: 14px; color: ${elementColor}; font-weight: bold;">
                                                Lv.${skillLevel}${isMaxLevel ? ' (满级)' : ''}
                                            </span>
                                        </div>
                                        <div style="font-size: 13px; color: #999; margin-top: 4px;">${skill.description}</div>
                                        ${!isMaxLevel && expToNext > 0 ? `
                                            <div style="margin-top: 8px;">
                                                <div style="font-size: 11px; color: #666; margin-bottom: 3px; display: flex; justify-content: space-between;">
                                                    <span>技能经验</span>
                                                    <span>${skillExp} / ${expToNext}</span>
                                                </div>
                                                <div style="height: 6px; background: #222; border-radius: 3px; overflow: hidden;">
                                                    <div style="height: 100%; width: ${expPercent}%; background: linear-gradient(90deg, ${elementColor}, ${elementColor}cc); border-radius: 3px;"></div>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 生成技能tooltip文本
 * 绑定到UI对象调用：UICharacter.getSkillTooltipText.call(UI, skill)
 */
export function getSkillTooltipText(skill) {
    let tip = skill.description || skill.name;
    tip += ` | MP消耗: ${skill.mpCost || 0}`;
    if (skill.power) tip += ` | 伤害倍率: ${skill.power}x攻击`;
    if (skill.baseDamage) tip += ` | 基础伤害: ${skill.baseDamage}`;
    if (skill.damageMultiplier && skill.damageMultiplier !== 1) tip += ` | 伤害系数: ${skill.damageMultiplier}`;
    if (skill.hitCount && skill.hitCount > 1) tip += ` | 攻击次数: ${skill.hitCount}`;
    if (skill.cooldown) tip += ` | 冷却: ${skill.cooldown}回合`;
    if (skill.effect) tip += ` | 效果: ${skill.effect}`;
    if (skill.chance) tip += ` (${Math.round(skill.chance * 100)}%)`;
    return tip;
}

/**
 * 渲染属性行
 * 绑定到UI对象调用：UICharacter.renderAttributeRow.call(UI, icon, name, value, max, attrKey)
 */
export function renderAttributeRow(icon, name, value, max, attrKey) {
    const canAdd = attrKey && Player.attributePoints > 0 && ['attack', 'defense', 'speed', 'vitality', 'spirit'].includes(attrKey);
    const attrDescriptions = {
        vitality: '体质：每点+20最大HP和当前HP，提高生存能力',
        spirit: '精神力：每点+10最大MP和1精神力，提高魔法伤害和MP上限',
        attack: '攻击：每点+2攻击力，提高物理和魔法伤害',
        defense: '防御：每点+2防御力，减少受到的伤害',
        speed: '速度：每点+2速度，影响行动顺序和闪避'
    };
    const titleText = attrKey ? attrDescriptions[attrKey] : (name === '暴击率' ? '暴击率：攻击时造成双倍伤害的概率' : name === '命中率' ? '命中率：攻击命中目标的概率' : '');

    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #335555;" title="${titleText}">
            <div style="font-size: 16px; color: #ccc;">
                ${icon} ${name}
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 18px; color: #fff; font-weight: bold;">
                    ${value}${max ? ' / ' + max : ''}
                </span>
                ${canAdd ? `
                    <div onclick="Game.addAttribute('${attrKey}')" style="
                        width: 30px;
                        height: 30px;
                        background: #44aa44;
                        border: none;
                        border-radius: 50%;
                        color: #fff;
                        cursor: pointer;
                        font-size: 18px;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1;
                    ">+</div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * 更新角色属性界面（保留滚动位置）
 * 绑定到UI对象调用：UICharacter.updateCharacterScreen.call(UI)
 */
export function updateCharacterScreen() {
    const scrollContainer = document.querySelector('.character-panel-scroll') || document.getElementById('game-container');
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    this.renderCharacterScreen();
    setTimeout(() => {
        const newScrollContainer = document.querySelector('.character-panel-scroll') || document.getElementById('game-container');
        if (newScrollContainer) {
            newScrollContainer.scrollTop = scrollTop;
        }
    }, 0);
}

// 导出模块集合
export const UICharacter = {
    renderCharacterScreen,
    getSkillTooltipText,
    renderAttributeRow,
    updateCharacterScreen
};

export default UICharacter;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UICharacter = UICharacter;
}
