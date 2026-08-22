/**
 * UI 天赋详情弹窗模块
 * 
 * 从ui.js拆分出的独立天赋详情弹窗模块
 * 包含：天赋详情弹窗（showTalentDetail）
 */
export function showTalentDetail(elem) {
        const talentData = Player.talents[elem];
        if (!talentData || typeof TalentSystem === 'undefined') return;
        const talent = TalentSystem.getTalent(talentData.talentId);
        if (!talent) return;

        const rarityConfig = TalentSystem.getRarityConfig(talent.rarity);
        const maxLevel = talent.maxLevel || 10;
        const expToNext = TalentSystem.getExpToNextLevel(talentData.level);
        const expPercent = talentData.level >= maxLevel ? 100 : (talentData.exp / expToNext * 100);
        const effects = TalentSystem.getTalentEffects(talentData.talentId, talentData.level);
        const currentStage = TalentSystem.getCurrentStage(talentData.talentId, talentData.level);
        const nextStage = TalentSystem.getNextStage(talentData.talentId, talentData.level);
        const stageColors = { '觉醒': '#88ccff', '特性': '#44ff88', '进化': '#ffaa44', '延伸': '#cc88ff', '终极': '#ff66ff' };

        // 机制类型
        const mechanismLabels = {
            resource: { name: '资源型', icon: '⚡', color: '#ffaa44', desc: '通过战斗积累专属资源，消耗资源释放强力技能或触发特殊效果' },
            state: { name: '状态型', icon: '❄️', color: '#66ccff', desc: '通过施加状态效果（灼烧/冰冻/麻痹等）控制敌人或造成持续伤害' },
            form: { name: '形态型', icon: '🔄', color: '#aa66ff', desc: '在不同形态间切换，每种形态有独特的技能和效果' },
            trigger: { name: '触发型', icon: '💥', color: '#ff6666', desc: '满足特定条件时自动触发强力效果（连击/暴击/反击等）' },
            passive: { name: '光环型', icon: '✨', color: '#66ff88', desc: '持续提供被动增益，无需主动操作' }
        };
        const mech = talent.mechanism ? mechanismLabels[talent.mechanism] : null;

        // 特殊术语解释（根据系别和机制类型）
        const termExplanations = {
            fire: {
                '燃点': '火系专属资源，通过使用火系技能积累。燃点满时可释放「爆裂」技能，造成高额范围伤害并附加灼烧。',
                '灼烧': '持续伤害效果，每回合造成基于攻击力的百分比伤害，可叠加层数。',
                '爆裂': '消耗满燃点释放的强力技能，造成150%攻击力的范围伤害。'
            },
            ice: {
                '冻结': '控制效果，使目标无法行动1-2回合，对已减速目标概率提升。',
                '减速': '降低目标速度，影响行动顺序和闪避率。',
                '冰盾': '吸收伤害的护盾，冰系技能可生成或强化冰盾。'
            },
            thunder: {
                '电荷': '雷系专属资源，通过雷系技能积累。电荷满时可释放「连锁闪电」，在多个敌人间跳跃造成伤害。',
                '麻痹': '控制效果，使目标有概率无法行动，并降低其命中率。',
                '感电': '使目标受到的雷系伤害提升，可与水系的「湿润」触发感电反应。'
            },
            water: {
                '潮汐形态': '水系专属形态，每2回合自动切换。涨潮形态：治疗效果+50%；退潮形态：伤害+30%。',
                '湿润': '使目标受到的雷系伤害提升50%，与雷系触发「感电」反应。',
                '治愈之泉': '消耗MP的持续治疗技能，每回合恢复一定HP。'
            },
            wind: {
                '疾风连击': '风系触发型效果，连续使用风系技能可叠加连击层数，每层提升伤害和速度，最高5层。',
                '闪避': '完全躲避攻击的概率，风系天赋大幅提升闪避率。',
                '风刃': '风系基础攻击技能，有概率触发连击。'
            },
            earth: {
                '岩力': '土系专属资源，通过受到攻击或使用土系技能积累。岩力满时可释放「地震」，造成高额伤害并眩晕。',
                '护盾': '吸收伤害的保护层，土系技能可生成各种护盾。',
                '眩晕': '控制效果，使目标无法行动1回合。'
            },
            light: {
                '圣光/圣盾形态': '光系专属形态，可手动切换。圣光形态：伤害+30%，攻击附带净化；圣盾形态：防御+40%，受击时反弹伤害。战术切换，攻防转换。',
                '圣光层数': '光系核心机制。攻击时附加1层圣光，最多3层，每层使光系伤害+5%。圣光满3层时触发特殊效果（根据分支不同：净化流自动净化自身debuff并恢复HP；审判流造成目标最大HP百分比的真实伤害）。',
                '净化': '移除目标身上的负面状态效果。光系技能可净化敌方增益或友方减益。',
                '圣光裁决': '光系强力技能，对暗影系敌人造成额外伤害。审判流天赋满层圣光时触发。'
            },
            dark: {
                '暗影潜行': '暗系触发型效果，进入战斗后自动潜行，首次攻击暴击率+100%，攻击后显形。潜行状态下敌人命中率降低。',
                '暗影层数': '暗系核心机制。攻击时附加1层暗影，最多3层，每层使暗系伤害+5%。暗影满3层时触发特殊效果（根据分支不同：吸取流恢复HP并吸取敌方攻击力；潜行者刷新潜行并获得必暴击）。',
                '诅咒': '持续削弱效果，降低目标攻击力或防御力，可叠加层数。诅咒满层时触发诅咒爆发，造成额外伤害。',
                '吸血': '造成伤害时恢复一定比例的HP，暗系天赋可提升吸血比例。'
            },
            heal: {
                '治愈之力': '治愈系专属资源，通过治疗技能积累。治愈之力满时可释放「生命绽放」，全队大幅恢复HP并解除负面状态。',
                '祝福层数': '治愈系核心机制。治疗时附加1层祝福，最多3层，每层使治疗效果+10%。祝福满3层时触发特殊效果（根据分支不同：绽放流全队恢复HP并净化；恩典流全队获得攻击/防御增益）。',
                '复苏': '复活已倒下的队友，恢复一定比例HP。高阶治愈魔法可在战斗中自动复活。',
                '净化': '移除目标身上的负面状态效果。治愈系技能可净化友方减益。'
            },
            plant: {
                '中毒层数': '植物系核心机制。攻击时附加1层中毒，最多5层，每层每回合造成基于攻击力的百分比伤害。中毒满层时触发毒爆，造成高额范围伤害。',
                '荆棘': '反伤效果，受到攻击时对攻击者造成一定比例伤害。植物系天赋可提升反伤比例。',
                '束缚': '控制效果，使目标无法行动，持续2回合。束缚状态下目标受到植物系伤害提升。'
            },
            summon: {
                '召唤兽': '召唤系核心机制，可召唤各种召唤兽协同作战，召唤兽有独立的HP和技能。',
                '契约': '与召唤兽建立契约，契约等级影响召唤兽的属性和技能。',
                '协同攻击': '召唤兽与主人同时攻击，造成额外伤害。'
            }
        };

        // v2.8.3 术语解释：根据天赋实际涉及的效果字段动态显示，而非显示该系所有术语
        // 术语与效果关键词的映射关系
        const termKeywordMap = {
          // 火系
          '燃点': ['fireEnergy', 'fireExplode', 'fireEnhance', 'fireAura', 'fireGround', 'fireRain'],
          '灼烧': ['burnChance', 'burnDamage', 'burnSpread', 'burnStack', 'burnCrit', 'burnExplode', 'burnDefense', 'burnTrue'],
          '爆裂': ['fireExplode', 'burnCritExplode', 'explosionChance', 'explosionDamage', 'explosionCrit'],
          // 冰系
          '冻结': ['freezeChance', 'freezeDuration', 'freezeSpread', 'frozen', 'fieldFreeze'],
          '减速': ['slowChance', 'slowBonus', 'frostSlow', 'earthquakeSlow', 'hurricaneVulnerable'],
          '冰盾': ['iceShield', 'frostNova', 'crystalShield', 'shieldRatio'],
          // 雷系
          '电荷': ['chargeMax', 'chargeStack', 'chargePerStack', 'fullCharge'],
          '麻痹': ['paralyzeChance', 'paralyzeDuration', 'paralyzeDamage', 'shockParalyze', 'chainParalyze'],
          '感电': ['shockStack', 'shockDamage', 'shockSpread', 'shockThunder', 'wetDamage'],
          // 水系
          '潮汐形态': ['tide', 'autoTide', 'tideHeal', 'tideDamage', 'tideShield', 'tideCleanse', 'tideInterval'],
          '湿润': ['wetChance', 'wetStack', 'wetSpread', 'wetHeal', 'wetBind'],
          '治愈之泉': ['aoeHeal', 'healAura', 'regenAmount', 'regenChance', 'autoHeal'],
          // 风系
          '疾风连击': ['comboChance', 'comboDamage', 'comboSpeed', 'comboMp', 'windBlade', 'windBladeDance'],
          '闪避': ['dodgeBonus', 'dodgeCounter', 'dodgeCrit', 'dodgeHeal', 'dodgeMp', 'lastStandDodge'],
          '风刃': ['windBlade', 'windBladeCount', 'windBladeDamage', 'windBladeSpeed', 'windBladeMax'],
          // 土系
          '岩力': ['rockArmor', 'earthquake', 'hardRock', 'defenseStack', 'defenseToDamage'],
          '护盾': ['shieldChance', 'shieldRatio', 'shieldReflect', 'shieldRegen', 'permanentShield', 'guardDamage'],
          '眩晕': ['stunChance', 'stunExtend', 'earthquakeSlow', 'counterStun', 'judgmentStun', 'meteorStun'],
          // 光系
          '圣光/圣盾形态': ['holyStack', 'holyMax', 'holyShield', 'holyJudgment', 'holyPurify', 'holyDamage'],
          '净化': ['purifyChance', 'purifyAll', 'purifyHeal', 'purifyTeam', 'autoPurify', 'bloomPurify'],
          '圣光裁决': ['holyJudgment', 'judgmentDamage', 'judgmentTrue', 'judgmentDark', 'judgmentNext'],
          // 暗系
          '暗影潜行': ['stealth', 'autoStealth', 'reStealth', 'shadowForm', 'shadowStealth', 'stealthFirst'],
          '暗影层数': ['shadowStack', 'shadowMax', 'shadowDrain', 'shadowLifeDrain', 'shadowLifesteal', 'shadowAttackDown', 'shadowDefenseDown'],
          '诅咒': ['curseChance', 'curseDuration', 'curseDamage', 'curseAtk', 'curseDef', 'curseSpread', 'curseEnd'],
          '吸血': ['shadowLifesteal', 'shadowLifeDrain', 'drainLifesteal', 'curseKillHeal', 'killHeal'],
          // 治愈系
          '治愈之力': ['blessingStack', 'blessingMax', 'blessingHeal', 'blessingDefense', 'blessingBloom', 'blessingGrace'],
          '复苏': ['revive', 'autoRevive', 'bloomRevive', 'reviveCount', 'reviveHp', 'lifeSeed'],
          '净化': ['purifyChance', 'purifyAll', 'bloomPurify', 'autoPurify', 'purifyHeal'],
          // 植物系
          '荆棘': ['thornArmor', 'shieldReflect', 'counterDamage', 'dodgeCounter'],
          '束缚': ['bindDuration', 'bindEndStun', 'bindExplosion', 'bindHpDrain', 'bindWater', 'poisonBind', 'wetBind'],
          '中毒': ['poisonStack', 'poisonMax', 'poisonDamage', 'poisonSpread', 'poisonEscalation', 'poisonExecute', 'poisonBurst'],
          // 召唤系
          '召唤兽': ['summonDamage', 'summonHp', 'summonDuration', 'summonCrit', 'summonLevel', 'summonDeath', 'summonEnrage', 'maxSummons', 'openingSummon'],
          '契约': ['contract', 'summonMaster', 'contractCrit', 'contractDamage', 'contractSpeed', 'contractStack', 'contractMax'],
          '协同攻击': ['comboChance', 'summonCharge', 'doubleSummon', 'extraSummon', 'beastTide', 'chainSummon']
        };

        // 获取当前天赋的所有效果字段
        const talentEffectKeys = new Set();
        if (effects) Object.keys(effects).forEach(k => talentEffectKeys.add(k));
        // 也检查进化路线中的效果
        if (talent.evolutions) {
          talent.evolutions.forEach(evo => {
            if (evo.effects) Object.keys(evo.effects).forEach(k => talentEffectKeys.add(k));
          });
        }

        // 根据效果字段判断涉及哪些术语
        const relevantTerms = [];
        const elemTerms = termExplanations[elem] || {};
        Object.entries(elemTerms).forEach(([term, desc]) => {
          const keywords = termKeywordMap[term] || [];
          const isRelevant = keywords.some(kw => 
            [...talentEffectKeys].some(effectKey => effectKey.toLowerCase().includes(kw.toLowerCase()))
          );
          if (isRelevant) relevantTerms.push({term, desc});
        });

        // 如果没有匹配到任何术语，显示该系最核心的1-2个术语（避免完全空白）
        if (relevantTerms.length === 0) {
          const coreTerms = Object.entries(elemTerms).slice(0, 2);
          coreTerms.forEach(([term, desc]) => relevantTerms.push({term, desc}));
        }

        const termsHtml = relevantTerms.map(({term, desc}) => `
            <div style="margin-bottom:8px;padding:8px 10px;background:rgba(255,215,0,0.05);border-left:3px solid #ffd700;border-radius:0 6px 6px 0;">
                <span style="color:#ffd700;font-size:12px;font-weight:bold;">📖 ${term}</span>
                <div style="color:#bbb;font-size:11px;margin-top:3px;line-height:1.5;">${desc}</div>
            </div>
        `).join('');

        // 效果列表 - v2.8.3 扩充中文名称，覆盖各系常见效果
        const effectNames = {
          // 通用基础
          damageBonus:'伤害加成', healBonus:'治疗加成', defenseBonus:'防御加成', speedBonus:'速度加成',
          hpBonus:'生命加成', critRate:'暴击率', critDamage:'暴击伤害', mpCostReduction:'耗蓝减少',
          dodgeBonus:'闪避率', hpRegen:'HP回复', mpRegen:'MP回复', maxHpBonus:'最大生命加成',
          damageReduction:'伤害减免', cooldownReduction:'冷却缩减', skillLevelBonus:'技能等级加成',
          // 火系
          burnChance:'灼烧概率', burnDamage:'灼烧伤害', burnSpread:'灼烧扩散', burnCrit:'灼烧暴击',
          burnExplode:'灼烧爆炸', burnStackMax:'灼烧最大层数', fireExplodeDamage:'爆裂伤害',
          fireExplodeBonus:'爆裂加成', fireEnergyGain:'燃点获取', fireEnergyMax:'燃点上限',
          fireAura:'火焰光环', fireGround:'火焰领域', fireRain:'火焰之雨',
          // 冰系
          freezeChance:'冰冻概率', freezeDuration:'冰冻时长', freezeSpread:'冰冻扩散',
          frostStacks:'寒霜层数', frostStackMax:'寒霜最大层数', frostSlowPerStack:'每层减速',
          frostNova:'冰霜新星', frostShatter:'冰霜碎裂', iceShield:'冰盾',
          // 雷系
          paralyzeChance:'麻痹概率', paralyzeDuration:'麻痹时长', paralyzeDamage:'麻痹伤害',
          chainLightning:'连锁闪电', chainTargets:'连锁目标数', chainDamage:'连锁伤害',
          chainFalloff:'连锁衰减', shockStacks:'感电层数', shockStackMax:'感电最大层数',
          skyThunder:'天雷', thunderCounter:'雷系反击', thunderExecute:'雷系处决',
          // 水系
          tide:'潮汐形态', tideHeal:'潮汐治疗', tideDamage:'潮汐伤害', tideShield:'潮汐护盾',
          wetChance:'湿润概率', wetStacks:'湿润层数', wetStackMax:'湿润最大层数',
          healCritRate:'治疗暴击率', healCritDouble:'治疗暴击双倍', aoeHeal:'群体治疗',
          aoeHealRatio:'群疗比例', purifyChance:'净化概率', autoHeal:'自动治疗',
          // 风系
          comboChance:'连击概率', comboDamageIncrease:'连击伤害提升', comboSpeedBuff:'连击速度加成',
          comboMpReduction:'连击耗蓝减少', windBladeCount:'风刃数量', windBladeDamage:'风刃伤害',
          windBladeSpeed:'风刃速度', windBladeMax:'风刃上限', windBladeStack:'风刃层数',
          windBladeDance:'风刃舞', dodgeCounter:'闪避反击', dodgeCritDamage:'闪避暴击伤害',
          // 土系
          earthquakeChance:'地震概率', earthquakeDamage:'地震伤害', earthquakeSlow:'地震减速',
          rockArmorStack:'岩甲层数', rockArmorMax:'岩甲上限', rockArmorDefense:'岩甲防御',
          rockArmorReduction:'岩甲减伤', shieldChance:'护盾概率', shieldRatio:'护盾比例',
          shieldReflect:'护盾反伤', shieldRegen:'护盾回复', hardRockChance:'磐石概率',
          hardRockReduction:'磐石减伤',
          // 光系
          holyStack:'圣光层数', holyMax:'圣光上限', holyShield:'圣光护盾',
          holyJudgmentOnMax:'满层圣光裁决', holyPurifyOnMax:'满层圣光净化',
          holyDamageBonus:'神圣伤害加成', holyDarkResist:'暗影抗性', divineProtection:'神圣守护',
          purifyAll:'全体净化', purifyHeal:'净化治疗', purifyTeamHeal:'团队净化治疗',
          graceAtkBonus:'恩典攻击加成', graceDefBonus:'恩典防御加成', graceCritBonus:'恩典暴击加成',
          graceSpeedBonus:'恩典速度加成', graceDuration:'恩典持续', graceLastStand:'恩典背水一战',
          // 暗系
          curseChance:'诅咒概率', curseDuration:'诅咒时长', curseDamage:'诅咒伤害',
          curseAtkDown:'诅咒降攻', curseDefDown:'诅咒降防', curseSpreadChance:'诅咒扩散概率',
          shadowStack:'暗影层数', shadowMax:'暗影上限', shadowForm:'暗影形态',
          shadowFormDuration:'暗影形态时长', shadowFormHeal:'暗影形态治疗',
          shadowLifesteal:'暗影吸血', shadowLifeDrain:'暗影吸取生命',
          stealthDuration:'潜行时长', stealthCritBonus:'潜行暴击加成', stealthDamageBonus:'潜行伤害加成',
          stealthFirstHitBonus:'潜行首击加成', stealthFirstHitCrit:'潜行首击暴击',
          reStealthChance:'再次潜行概率', reStealthCrit:'再次潜行暴击',
          // 治愈系
          blessingStack:'祝福层数', blessingMax:'祝福上限', blessingHealBonus:'祝福治疗加成',
          blessingDefenseBonus:'祝福防御加成', blessingBloomOnMax:'满层生命绽放',
          blessingGraceOnMax:'满层恩典降临', bloomHeal:'绽放治疗', bloomPurify:'绽放净化',
          bloomRevive:'绽放复活', bloomShield:'绽放护盾', bloomCooldown:'绽放冷却',
          autoRevive:'自动复活', autoReviveHp:'复活血量', reviveCount:'复活次数',
          emergencyHeal:'紧急治疗', emergencyThreshold:'紧急阈值',
          // 植物系
          poisonStack:'中毒层数', poisonMax:'中毒上限', poisonDamage:'中毒伤害',
          poisonDamageBonus:'中毒伤害加成', poisonDurationBonus:'中毒时长加成',
          poisonSpreadChance:'中毒扩散概率', poisonEscalation:'毒性升级', poisonExecute:'毒性处决',
          thornArmor:'荆棘护甲', bindDuration:'束缚时长', bindDurationBonus:'束缚时长加成',
          bindEndStun:'束缚结束眩晕', bindExplosion:'束缚爆炸', bindHpDrain:'束缚吸血',
          plantControlHitRate:'植物控制命中', plantDamageBonus:'植物伤害加成',
          // 召唤系
          summonDamageBonus:'召唤兽伤害加成', summonHpBonus:'召唤兽生命加成',
          summonDurationBonus:'召唤兽时长加成', summonLevelBonus:'召唤兽等级加成',
          summonCritRate:'召唤兽暴击率', summonCritDamage:'召唤兽暴击伤害',
          doubleSummonChance:'双重召唤概率', extraSummonChance:'额外召唤概率',
          extraSummonDuration:'额外召唤时长', maxSummons:'最大召唤数',
          summonDeathBurst:'召唤兽死亡爆裂', summonDeathHeal:'召唤兽死亡治疗',
          summonMasterDamageBonus:'主人伤害加成', summonMasterDefBonus:'主人防御加成',
          summonEnrage:'召唤兽狂暴', summonChargeChance:'召唤冲锋概率',
          summonChargeDamage:'召唤冲锋伤害', summonChargeKnockback:'召唤冲锋击退',
          contractCritBonus:'契约暴击加成', contractDamageBonus:'契约伤害加成',
          contractSpeedBonus:'契约速度加成', contractStack:'契约层数', contractMax:'契约上限',
          openingSummon:'开场召唤', summonHasTalent:'召唤兽天赋',
          // 状态效果通用
          stunChance:'眩晕概率', stunExtendChance:'眩晕延长概率', stunnedDamageBonus:'眩晕伤害加成',
          slowChance:'减速概率', slowBonus:'减速加成', slowUnpurgeable:'减速不可净化',
          blindChance:'致盲概率', blindDuration:'致盲时长', debuffImmunity:'免疫减益',
          critImmunity:'免疫暴击', executeChance:'处决概率', executeThreshold:'处决阈值',
          firstStrikeChance:'先攻概率', firstStrikeDamage:'先攻伤害',
          counterDamage:'反击伤害', counterHeal:'反击治疗', counterStunChance:'反击眩晕概率',
          ignoreDodgeChance:'必中概率', critArmorPenetration:'暴击破甲',
          defenseToDamage:'防御转伤害', defenseStack:'防御层数', defenseStackMax:'防御上限',
          attackSpeedStack:'攻速层数', attackSpeedMax:'攻速上限', hitCritStack:'命中暴击层数', hitCritMax:'命中暴击上限',
          // 光系
          darkDamageBonus:'暗影伤害加成', holyStack:'攻击附加圣光', holyMax:'圣光上限',
          holyDamageBonus:'圣光伤害加成', holyDarkResist:'暗影抗性', lightShield:'圣光护盾',
          holyPurifyOnMax:'满层圣光净化', holyJudgmentOnMax:'满层圣光审判',
          purifyHeal:'净化治疗', purifyDamage:'净化伤害', purifyTeamHeal:'团队净化治疗',
          autoPurifyChance:'自动净化概率', judgmentDamage:'审判伤害',
          judgmentTrueDamage:'审判真实伤害', judgmentDarkDouble:'审判暗影双倍',
          judgmentStunChance:'审判眩晕概率', judgmentDarkCrit:'审判暗影暴击',
          judgmentNextCrit:'审判后必暴击', judgmentNextDamage:'审判后伤害加成',
          lightPenetration:'光系穿透', debuffImmunity:'免疫减益',
          shieldOnCrit:'暴击获得护盾', shieldDebuffImmune:'护盾期免疫减益',
          debuffedDamageBonus:'对减益目标伤害', angelInterval:'天使降临间隔',
          angelDamage:'天使伤害', angelHeal:'天使治疗', critArmorPenetration:'暴击破甲',
          // 通用特殊
          skillLevelBonus:'技能等级+', aoePurify:'范围净化', purifyCount:'净化数量',
          purifyDebuff:'净化减益', purifyAtkDown:'净化降攻', purifyDefDown:'净化降防',
          teamAtkBonus:'团队攻击加成', teamDefBonus:'团队防御加成',
          teamDefenseBonus:'团队防御加成', teamDodgeBonus:'团队闪避加成',
          teamHpRegen:'团队HP回复', teamSpeedBonus:'团队速度加成',
          teamDarkBonus:'团队暗影加成', permanentShield:'永久护盾',
          shieldRatio:'护盾比例', shieldReflect:'护盾反伤', shieldRegen:'护盾回复',
          shieldRefreshOnLethal:'致命伤刷新护盾', shieldBreakDamage:'破盾伤害',
          shieldChance:'护盾概率', shieldDefenseBonus:'护盾防御加成',
          divineProtection:'神圣守护', graceAllStats:'恩典全属性',
          graceAtkBonus:'恩典攻击', graceDefBonus:'恩典防御', graceCritBonus:'恩典暴击',
          graceSpeedBonus:'恩典速度', graceDuration:'恩典持续', graceHitGuaranteed:'恩典必中',
          graceLastStand:'恩典背水一战', graceLifesteal:'恩典吸血',
          holyShield:'圣光护盾', holyShieldDuration:'圣光护盾持续', holyShieldTarget:'圣光护盾目标',
          holyStacks:'圣光层数', lightDamageBonus:'光系伤害加成',
          lightImmunity:'光系免疫', holyMax:'圣光上限',
          // 暗系
          shadowAttackDown:'暗影降攻', shadowDefenseDown:'暗影降防',
          shadowDrainOnMax:'满层暗影吸取', shadowForm:'暗影形态',
          shadowFormDuration:'暗影形态持续', shadowFormHeal:'暗影形态治疗',
          shadowFormOnLethal:'致命伤变暗影', shadowLifeDrain:'暗影吸取生命',
          shadowLifesteal:'暗影吸血', shadowMax:'暗影上限', shadowStack:'暗影层数',
          shadowStealthOnMax:'满层暗影潜行', stealthAllHitBonus:'潜行全命中',
          stealthAllHitCrit:'潜行全命中暴击', stealthCritBonus:'潜行暴击',
          stealthDamageBonus:'潜行伤害', stealthDuration:'潜行持续',
          stealthEndDodge:'潜行结束闪避', stealthFirstHitBonus:'潜行首击加成',
          stealthFirstHitCrit:'潜行首击暴击', stealthRefreshOnKill:'击杀刷新潜行',
          reStealthChance:'再次潜行概率', reStealthCrit:'再次潜行暴击',
          reStealthDuration:'再次潜行持续', autoStealthChance:'自动潜行概率',
          curseAtkDown:'诅咒降攻', curseChance:'诅咒概率', curseCritDamageTaken:'诅咒暴击易伤',
          curseCritDown:'诅咒降暴击', curseDamage:'诅咒伤害', curseDefDown:'诅咒降防',
          curseDodgeDown:'诅咒降闪避', curseDuration:'诅咒持续', curseEndDamage:'诅咒结束伤害',
          curseKillHeal:'诅咒击杀治疗', curseSpreadChance:'诅咒扩散概率',
          curseUnpurgeable:'诅咒不可净化', markNoStealth:'标记不可潜行',
          darkMark:'暗影标记', darkMarkDamage:'暗影标记伤害', darkMarkDuration:'暗影标记持续',
          darkPenetration:'暗影穿透', darkImmunity:'暗影免疫',
          // 召唤系
          summonChargeChance:'召唤冲锋概率', summonChargeDamage:'召唤冲锋伤害',
          summonChargeKnockback:'召唤冲锋击退', summonCritDamage:'召唤兽暴伤',
          summonCritRate:'召唤兽暴击率', summonDeathBurst:'召唤兽死亡爆裂',
          summonDeathHeal:'召唤兽死亡治疗', summonDebuffImmunity:'召唤兽免疫减益',
          summonDurationBonus:'召唤兽时长加成', summonEnrage:'召唤兽狂暴',
          summonHasTalent:'召唤兽拥有天赋', summonHpBonus:'召唤兽生命加成',
          summonLevelBonus:'召唤兽等级加成', summonMasterDamageBonus:'主人伤害加成',
          summonMasterDefBonus:'主人防御加成', maxSummons:'最大召唤数',
          openingSummon:'开场召唤', contractCritBonus:'契约暴击',
          contractDamageBonus:'契约伤害', contractGuardOnMax:'满层契约守护',
          contractMax:'契约上限', contractSpeedBonus:'契约速度', contractStack:'契约层数',
          contractBeastTideOnMax:'满层契约兽潮', beastTideCount:'兽潮数量',
          beastTideDamage:'兽潮伤害', beastTideFinalCrit:'兽潮终击暴击',
          beastTideNoConsume:'兽潮无消耗', extraSummonChance:'额外召唤概率',
          extraSummonDuration:'额外召唤时长', doubleSummonChance:'双重召唤概率',
          inheritStats:'继承属性', summonDamageBonus:'召唤兽伤害加成',
          // 植物系
          plantControlHitRate:'植物控制命中', plantDamageBonus:'植物伤害加成',
          poisonBindOnMax:'满层中毒束缚', poisonBurstDamage:'毒爆伤害',
          poisonBurstOnMax:'满层毒爆', poisonBurstRefresh:'毒爆刷新',
          poisonBurstTrue:'毒爆真实伤害', poisonDamage:'中毒伤害',
          poisonDamageBonus:'中毒伤害加成', poisonDefenseDown:'中毒降防',
          poisonDefenseReduction:'中毒减防', poisonDurationBonus:'中毒时长加成',
          poisonEscalation:'毒性升级', poisonEscalationMax:'毒性升级上限',
          poisonExecute:'毒性处决', poisonExecuteThreshold:'毒性处决阈值',
          poisonMax:'中毒上限', poisonSpeedDown:'中毒降速', poisonSpreadChance:'中毒扩散概率',
          poisonStack:'中毒层数', poisonUnpurgeable:'中毒不可净化',
          thornArmor:'荆棘护甲', bindAttackDown:'束缚降攻', bindDefenseDown:'束缚降防',
          bindDuration:'束缚持续', bindDurationBonus:'束缚时长加成', bindEndStun:'束缚结束眩晕',
          bindExplosion:'束缚爆炸', bindHpDrain:'束缚吸血', bindUnpurgeable:'束缚不可净化',
          bindWaterDamageBonus:'束缚水伤加成', wetBindOnMax:'满层湿润束缚',
          // 治愈系
          blessingBloomOnMax:'满层生命绽放', blessingDefenseBonus:'祝福防御',
          blessingGraceOnMax:'满层恩典降临', blessingHealBonus:'祝福治疗',
          blessingMax:'祝福上限', blessingStack:'祝福层数',
          bloomCooldown:'绽放冷却', bloomHeal:'绽放治疗', bloomPurify:'绽放净化',
          bloomRevive:'绽放复活', bloomShield:'绽放护盾',
          autoRevive:'自动复活', autoReviveHp:'复活血量', reviveCount:'复活次数',
          emergencyCooldown:'紧急治疗冷却', emergencyHeal:'紧急治疗',
          emergencyHealAmount:'紧急治疗量', emergencyThreshold:'紧急阈值',
          lifeSeed:'生命种子', lifeSeedDelay:'生命种子延迟', lifeSeedHeal:'生命种子治疗',
          allHealingBonus:'全治疗加成', aoeHealRatio:'群疗比例',
          healCritDouble:'治疗暴击双倍', healCritRate:'治疗暴击率',
          healExtraHp:'治疗额外HP', healImmunity:'免疫治疗', healMpRestore:'治疗回蓝',
          healPurifyChance:'治疗净化概率', healShield:'治疗护盾',
          healShieldDuration:'治疗护盾持续', purifyAll:'全体净化',
          purifyAtkDown:'净化降攻', purifyChance:'净化概率', purifyCount:'净化数量',
          purifyDamage:'净化伤害', purifyDebuff:'净化减益', purifyDefDown:'净化降防',
          purifyHeal:'净化治疗', purifyHealBonus:'净化治疗加成',
          purifyOnHealChance:'治疗时净化概率', purifyTeamHeal:'团队净化治疗',
          revive:'复活', reviveBuff:'复活buff', reviveHp:'复活血量',
          reviveUnlocked:'复活解锁', autoHeal:'自动治疗', autoHealTarget:'自动治疗目标',
          autoPurify:'自动净化', autoPurifyChance:'自动净化概率',
          // 状态效果通用
          stunChance:'眩晕概率', stunExtendChance:'眩晕延长概率',
          stunnedDamageBonus:'眩晕伤害加成', slowChance:'减速概率',
          slowBonus:'减速加成', slowUnpurgeable:'减速不可净化',
          blindChance:'致盲概率', blindDuration:'致盲持续',
          executeChance:'处决概率', executeThreshold:'处决阈值',
          firstStrikeChance:'先攻概率', firstStrikeDamage:'先攻伤害',
          counterDamage:'反击伤害', counterHeal:'反击治疗',
          counterNoConsume:'反击无消耗', counterStunChance:'反击眩晕概率',
          ignoreDodgeChance:'必中概率', defenseToDamage:'防御转伤害',
          defenseStack:'防御层数', defenseStackMax:'防御上限',
          attackSpeedStack:'攻速层数', attackSpeedMax:'攻速上限',
          hitCritStack:'命中暴击层数', hitCritMax:'命中暴击上限',
          lowHpDamageBonus:'低血伤害加成', lowHpDamageScaling:'低血伤害缩放',
          lowHpDodgeBonus:'低血闪避加成', lowHpFreezeChance:'低血冰冻概率',
          lowHpRegenDouble:'低血回复双倍', lastStandDodge:'背水一战闪避',
          lastStandHeal:'背水一战治疗', lethalShield:'致命护盾',
          enrageDamage:'狂暴伤害', enrageThreshold:'狂暴阈值',
          intimidateAtkDown:'威吓降攻', intimidateDefDown:'威吓降防',
          intimidateDuration:'威吓持续', kingIntimidate:'王者威吓',
          packBonus:'群居加成', kingIntimidate:'王者威压',
          // 火系补充
          fireAura:'火焰光环', fireEnergyGain:'燃点获取', fireEnergyMax:'燃点上限',
          fireEnhanceAOE:'火强化范围', fireEnhanceAttack:'火强化攻击',
          fireEnhanceBonus:'火强化加成', fireEnhanceCombo:'火强化连击',
          fireEnhanceCost:'火强化消耗', fireEnhanceCrit:'火强化暴击',
          fireEnhanceResetOnKill:'击杀重置火强化', fireExplodeBonus:'爆裂加成',
          fireExplodeCrit:'爆裂暴击', fireExplodeDamage:'爆裂伤害',
          fireExplodeKeep:'爆裂保留', fireExplodeNoCooldown:'爆裂无冷却',
          fireExplodeOnMax:'满燃点爆裂', fireGround:'火焰领域',
          fireGroundDamage:'火焰领域伤害', fireGroundDuration:'火焰领域持续',
          fireImmunity:'火系免疫', fireRain:'火焰之雨', fireRainDamage:'火雨伤害',
          fireRainDuration:'火雨持续', fireResistance:'火系抗性',
          burnChance:'灼烧概率', burnCrit:'灼烧暴击', burnCritExplode:'灼烧暴击爆炸',
          burnDamage:'灼烧伤害', burnDamageBonus:'灼烧伤害加成',
          burnDefenseDown:'灼烧降防', burnExplode:'灼烧爆炸', burnSpread:'灼烧扩散',
          burnStackMax:'灼烧上限', burnTrueDamage:'灼烧真实伤害',
          burnUnpurgeable:'灼烧不可净化', explosionChance:'爆炸概率',
          explosionCritGuaranteed:'爆炸必暴击', explosionDamage:'爆炸伤害',
          explosionRangeBonus:'爆炸范围加成',
          // 冰系补充
          freezeChance:'冰冻概率', freezeDefenseDown:'冰冻降防',
          freezeDuration:'冰冻持续', freezeSpread:'冰冻扩散',
          freezeUnpurgeable:'冰冻不可净化', frostChance:'寒霜概率',
          frostExplosion:'寒霜爆炸', frostExplosionRange:'寒霜爆炸范围',
          frostFreezeOnMax:'满层寒霜冰冻', frostNova:'冰霜新星',
          frostNovaDamage:'冰霜新星伤害', frostNovaInterval:'冰霜新星间隔',
          frostNovaSlow:'冰霜新星减速', frostShatter:'冰霜碎裂',
          frostSlowPerStack:'每层寒霜减速', frostStackMax:'寒霜上限',
          frostStacks:'寒霜层数', frozenCritGuaranteed:'冰冻必暴击',
          frozenDamageTaken:'冰冻易伤', frozenHpDrain:'冰冻吸血',
          frozenIceDamageBonus:'冰冻冰伤加成', fieldFreezeDuration:'领域冰冻持续',
          fieldIceResDown:'领域降冰抗', iceImmunity:'冰系免疫',
          icePenetration:'冰系穿透', iceRangeBonus:'冰系范围加成',
          iceShield:'冰盾', crystalShield:'水晶护盾',
          // 雷系补充
          paralyzeChain:'麻痹连锁', paralyzeChance:'麻痹概率',
          paralyzeDamage:'麻痹伤害', paralyzeDamageBonus:'麻痹伤害加成',
          paralyzeDuration:'麻痹持续', paralyzeExplode:'麻痹爆炸',
          paralyzeHpDrain:'麻痹吸血', paralyzeNoDodge:'麻痹不可闪避',
          chainChance:'连锁概率', chainDamage:'连锁伤害',
          chainDamageRatio:'连锁伤害比例', chainExplosionChance:'连锁爆炸概率',
          chainExplosionDamage:'连锁爆炸伤害', chainFalloff:'连锁衰减',
          chainLightning:'连锁闪电', chainNoDecay:'连锁无衰减',
          chainParalyzeChance:'连锁麻痹概率', chainSummonChance:'连锁召唤概率',
          chainTargets:'连锁目标数', chargeMax:'充能上限',
          chargePerStack:'每层充能', chargeStack:'充能层数',
          fullChargeCrit:'满充能暴击', fullChargeDamage:'满充能伤害',
          openingThunder:'开场雷击', openingThunderDamage:'开场雷击伤害',
          shockChance:'感电概率', shockDamageBonus:'感电伤害加成',
          shockDebuff:'感电减益', shockDuration:'感电持续',
          shockParalyzeChance:'感电麻痹概率', shockParalyzeOnMax:'满层感电麻痹',
          shockSpread:'感电扩散', shockStackMax:'感电上限', shockStacks:'感电层数',
          shockThunderBonus:'感电雷伤加成', skyThunderChance:'天雷概率',
          skyThunderDamage:'天雷伤害', thunderCounter:'雷系反击',
          thunderCounterDamage:'雷系反击伤害', thunderExecute:'雷系处决',
          thunderImmunity:'雷系免疫', thunderPenetration:'雷系穿透',
          stormPunishChance:'风暴惩罚概率', stormPunishDamage:'风暴惩罚伤害',
          stormPunishStun:'风暴惩罚眩晕',
          // 水系补充
          tide:'潮汐形态', tideCleanse:'潮汐净化', tideDamageMax:'潮汐伤害上限',
          tideDamageStack:'潮汐伤害层数', tideHeal:'潮汐治疗',
          tideHealMax:'潮汐治疗上限', tideHealStack:'潮汐治疗层数',
          tideInterval:'潮汐间隔', tideShield:'潮汐护盾', tideShieldDuration:'潮汐护盾持续',
          autoTide:'自动潮汐', wetChance:'湿润概率', wetDamageBonus:'湿润伤害加成',
          wetHealOnMax:'满层湿润治疗', wetSpread:'湿润扩散', wetStackMax:'湿润上限',
          wetStacks:'湿润层数', waterGuardChance:'水盾概率',
          waterGuardReduction:'水盾减伤', waterImmunity:'水系免疫',
          waterPenetration:'水系穿透', tsunamiAtkDown:'海啸降攻',
          tsunamiChance:'海啸概率', tsunamiDamage:'海啸伤害',
          // 风系补充
          comboChance:'连击概率', comboDamageIncrease:'连击伤害提升',
          comboMpReduction:'连击耗蓝减少', comboSpeedBuff:'连击速度加成',
          windBladeChance:'风刃概率', windBladeCount:'风刃数量',
          windBladeDamage:'风刃伤害', windBladeDanceCount:'风刃舞数量',
          windBladeDanceDamage:'风刃舞伤害', windBladeDanceOnMax:'满层风刃舞',
          windBladeDodge:'风刃闪避', windBladeMax:'风刃上限',
          windBladeSlowChance:'风刃减速概率', windBladeSpeed:'风刃速度',
          windBladeStack:'风刃层数', windDotBonus:'风系持续伤害加成',
          windImmunity:'风系免疫', windPenetration:'风系穿透',
          dodgeCounter:'闪避反击', dodgeCounterCrit:'闪避反击暴击',
          dodgeCounterDamage:'闪避反击伤害', dodgeCritBuff:'闪避暴击buff',
          dodgeCritDamage:'闪避暴击伤害', dodgeHeal:'闪避治疗',
          dodgeMpRestore:'闪避回蓝', dodgeNextHitBonus:'下次闪避加成',
          doubleStrikeChance:'双击概率', secondHitRatio:'第二击比例',
          thirdHitRatio:'第三击比例', tripleStrikeChance:'三击概率',
          hurricaneChance:'飓风概率', hurricaneDuration:'飓风持续',
          hurricaneVulnerable:'飓风易伤', tornadoChance:'龙卷风概率',
          tornadoDamage:'龙卷风伤害', tornadoKnockback:'龙卷风击退',
          // 土系补充
          earthquakeChance:'地震概率', earthquakeDamage:'地震伤害',
          earthquakeSlow:'地震减速', rockArmorCounterOnMax:'满层岩甲反击',
          rockArmorDefense:'岩甲防御', rockArmorMax:'岩甲上限',
          rockArmorReduction:'岩甲减伤', rockArmorShieldOnMax:'满层岩甲护盾',
          rockArmorStack:'岩甲层数', hardRockChance:'磐石概率',
          hardRockReduction:'磐石减伤', earthImmunity:'土系免疫',
          earthPenetration:'土系穿透', earthRangeBonus:'土系范围加成',
          meteor:'陨石', meteorDamage:'陨石伤害', meteorInterval:'陨石间隔',
          meteorStunChance:'陨石眩晕概率', stomp:'践踏',
          // 通用
          maxHpBonus:'最大生命加成', hpRegen:'HP回复', mpRegen:'MP回复',
          regenAmount:'回复量', regenChance:'回复概率', regenDamageReduction:'回复减伤',
          regenDefenseBonus:'回复防御加成', regenDuration:'回复持续',
          regenMp:'回复MP', regenUnpurgeable:'回复不可净化',
          sharedHpRegen:'共享HP回复', damageReduction:'伤害减免',
          damageShare:'伤害分担', cooldownReduction:'冷却缩减',
          mpCostReduction:'耗蓝减少', killCooldownReduce:'击杀减冷却',
          killHeal:'击杀治疗', drainHealReduction:'吸取治疗减少',
          drainLifesteal:'吸取吸血', enemyHitDown:'敌人命中降低',
          enemySpeedDown:'敌人速度降低', emergencyThreshold:'紧急阈值',
          timeStopChance:'时停概率', timeStopDuration:'时停持续',
          guaranteedCrit:'必暴击', critImmunity:'免疫暴击',
          critKnockback:'暴击击退', critParalyze:'暴击麻痹',
          // 妖魔特性
          summonWolves:'召唤狼群', flySwitch:'飞行切换',
          burrow:'掘地', boneSpike:'骨刺齐射', aoeWind:'风刃风暴',
          multiStrike:'多重打击', sandBreath:'沙息', charge:'冲锋',
          screech:'尖啸', gaze:'凝视', fireBurst:'火焰爆发',
          dodgeNext:'下次闪避', thornShot:'荆棘射击', mutation:'变异',
          acidSpray:'酸液喷射', boneSlash:'骨刃斩击', curse:'诅咒',
          shadowFireball:'暗影火球', darkIceSpike:'暗冰刺',
          shadowCurse:'暗影诅咒', shadowLurk:'暗影潜伏',
          bite:'撕咬', doubleStrike:'双击', smash:'重击', phaseStrike:'相位打击'
        };
        // v2.8.4: 效果渲染 - 区分布尔值/整数/小数百分比，避免true显示100%、3显示300%
        const effectsHtml = Object.entries(effects).map(([k, v]) => {
            const name = effectNames[k] || k;
            // 布尔值：显示已激活
            if (v === true) {
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">✓ ${name}</span>`;
            }
            // 布尔值false：不显示
            if (v === false) return '';
            // 整数且大于1：显示实际数字（如层数、上限）
            if (typeof v === 'number' && Number.isInteger(v) && v > 1) {
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">${name}: ${v}</span>`;
            }
            // 小数：显示百分比
            if (typeof v === 'number' && v > 0 && v < 1) {
                const pct = (v * 100).toFixed(0);
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">${name} +${pct}%</span>`;
            }
            // 其他数字：显示实际值
            if (typeof v === 'number' && v !== 0) {
                return `<span style="display:inline-block;padding:3px 8px;background:#44aa4422;border:1px solid #44aa4455;border-radius:10px;font-size:11px;color:#88ff88;margin:2px;">${name}: ${v}</span>`;
            }
            return '';
        }).filter(s => s).join('');

        // 进化路线 - v2.8.4: 处理branchEffects分支效果，避免7级10级显示undefined
        let evolutionHtml = '';
        if (talent.evolutions && talent.evolutions.length > 0) {
            const playerBranch = talentData.branch || null;
            evolutionHtml = talent.evolutions.map((evo, idx) => {
                const sc = stageColors[evo.stage] || '#aaa';
                const isCurrent = currentStage && currentStage.name === evo.name;
                const isLocked = evo.level > talentData.level;
                // v2.8.4: 处理branchEffects分支效果
                let evoName = evo.name;
                let evoDesc = evo.description;
                if (evo.branchEffects && !evo.name) {
                    if (playerBranch && evo.branchEffects[playerBranch]) {
                        evoName = evo.branchEffects[playerBranch].name;
                        evoDesc = evo.branchEffects[playerBranch].description;
                    } else {
                        evoName = '分支选择后解锁';
                        evoDesc = playerBranch ? '当前分支无此阶段效果' : '请先在Lv5进化阶段选择分支方向';
                    }
                }
                return `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;opacity:${isLocked?'0.5':'1'};">
                        <span style="width:24px;height:24px;border-radius:50%;background:${isCurrent?sc:'#333'};border:2px solid ${sc};display:flex;align-items:center;justify-content:center;font-size:10px;color:${isCurrent?'#000':sc};font-weight:bold;">${evo.level}</span>
                        <div style="flex:1;">
                            <span style="color:${sc};font-size:12px;font-weight:bold;">【${evo.stage}】${evoName}</span>
                            ${isCurrent ? '<span style="color:#ffd700;font-size:10px;margin-left:6px;">← 当前</span>' : ''}
                            ${evo.branchChoices ? '<span style="color:#ffaa44;font-size:10px;margin-left:6px;">[分支选择]</span>' : ''}
                            ${playerBranch && evo.branchEffects ? `<span style="color:#88ccff;font-size:10px;margin-left:6px;">[${playerBranch}分支]</span>` : ''}
                            <div style="color:#888;font-size:10px;margin-top:2px;">${evoDesc || ''}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.elements.gameContainer.innerHTML += `
            <div id="talent-detail-overlay" style="
                position:fixed;top:0;left:0;width:100%;height:100%;
                background:rgba(0,0,0,0.88);
                display:flex;flex-direction:column;justify-content:center;align-items:center;
                padding:20px;z-index:10000;overflow-y:auto;
            ">
                <div style="max-width:560px;width:100%;background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid ${rarityConfig.color};border-radius:16px;padding:25px;max-height:90vh;overflow-y:auto;">
                    <!-- 标题栏 -->
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px;">
                        <div>
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                                <span style="font-size:24px;">${SkillSystem.getElementColor(elem) ? '' : '✨'}</span>
                                <span style="color:${SkillSystem.getElementColor(elem)};font-size:18px;font-weight:bold;">${SkillSystem.getElementName(elem)}</span>
                                <span style="color:${rarityConfig.color};font-size:16px;font-weight:bold;">${talent.name}</span>
                                ${mech ? `<span style="font-size:10px;color:${mech.color};background:${mech.color}22;padding:2px 8px;border-radius:10px;">${mech.icon}${mech.name}</span>` : ''}
                            </div>
                            <div style="color:#888;font-size:12px;">${talent.description || ''}</div>
                        </div>
                        <button onclick="document.getElementById('talent-detail-overlay').remove();" style="background:#333;color:#fff;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;" onmouseover="this.style.background='#555'" onmouseout="this.style.background='#333'">×</button>
                    </div>

                    <!-- 等级和经验 -->
                    <div style="background:#0a0a1a;border-radius:8px;padding:12px;margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="color:${rarityConfig.color};font-size:14px;font-weight:bold;">Lv.${talentData.level}${talentData.level >= maxLevel ? ' (满级)' : ''}</span>
                            <span style="color:#888;font-size:11px;">${talentData.level >= maxLevel ? '已满级' : `${talentData.exp}/${expToNext} 经验`}</span>
                        </div>
                        <div style="height:6px;background:#222;border-radius:3px;overflow:hidden;">
                            <div style="height:100%;width:${expPercent}%;background:linear-gradient(90deg,${rarityConfig.color},${rarityConfig.color}88);border-radius:3px;transition:width 0.3s;"></div>
                        </div>
                    </div>

                    <!-- 当前效果 -->
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📊 当前效果</div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">
                            ${effectsHtml || '<span style="color:#666;font-size:11px;">暂无效果</span>'}
                        </div>
                    </div>

                    <!-- 机制说明 -->
                    ${mech ? `
                    <div style="margin-bottom:15px;padding:10px 12px;background:${mech.color}11;border:1px solid ${mech.color}44;border-radius:8px;">
                        <div style="color:${mech.color};font-size:12px;font-weight:bold;margin-bottom:4px;">${mech.icon} ${mech.name}机制</div>
                        <div style="color:#bbb;font-size:11px;line-height:1.5;">${mech.desc}</div>
                    </div>
                    ` : ''}

                    <!-- 进化路线 -->
                    ${evolutionHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">🌱 进化路线</div>
                        <div style="background:#0a0a1a;border-radius:8px;padding:12px;">
                            ${evolutionHtml}
                        </div>
                    </div>
                    ` : ''}

                    <!-- 特殊术语解释 -->
                    ${termsHtml ? `
                    <div style="margin-bottom:15px;">
                        <div style="color:#aaa;font-size:12px;margin-bottom:8px;">📖 术语解释</div>
                        ${termsHtml}
                    </div>
                    ` : ''}

                    <!-- 关闭按钮 -->
                    <div style="text-align:center;margin-top:20px;">
                        <button onclick="document.getElementById('talent-detail-overlay').remove();" style="padding:10px 30px;background:linear-gradient(135deg,${rarityConfig.color},${rarityConfig.color}88);color:#000;border:none;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

// 导出模块集合
export const UITalentDetail = {
    showTalentDetail
};

export default UITalentDetail;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UITalentDetail = UITalentDetail;
}