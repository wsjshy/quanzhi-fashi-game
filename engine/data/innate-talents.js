/**
 * 自身天赋数据（Innate Talents）
 * 角色创建时随机获得的天生天赋，维度高于系别天赋，影响全局
 * 类似莫凡的天生双系，是角色本身的特殊能力
 */
const DataInnateTalents = {
    // === 超稀有（传说级，5%概率） ===
    dual_element: {
        id: 'dual_element',
        name: '天生双系',
        rarity: 'legendary',
        weight: 1,
        icon: '⚡',
        description: '天生觉醒时就拥有两个元素系，如同莫凡一般的天才',
        effectDesc: '创建角色时额外觉醒一个随机元素系',
        effects: {
            extraElement: true
        },
        isCanon: true,
        canonNote: '莫凡的天生天赋，天生双系'
    },
    skill_master: {
        id: 'skill_master',
        name: '技能大师',
        rarity: 'legendary',
        weight: 1,
        icon: '⚔️',
        description: '对魔法技能有着天生的领悟力，所有技能等级+1',
        effectDesc: '所有技能等级+1，技能伤害+15%',
        effects: {
            skillLevelBonus: 1
        },
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    spell_focus: {
        id: 'spell_focus',
        name: '施法专注',
        rarity: 'legendary',
        weight: 1,
        icon: '🎯',
        description: '施法速度极快，总能先手攻击',
        effectDesc: '战斗中先手概率+50%，技能CD-1回合',
        effects: {
            firstStrikeBonus: 0.5,
            cooldownReduction: 1
        },
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },

    // === 稀有（史诗级，15%概率） ===
    element_affinity: {
        id: 'element_affinity',
        name: '元素亲和',
        rarity: 'epic',
        weight: 3,
        icon: '🔮',
        description: '与元素有着天然的亲和力，所有魔法伤害提升',
        effectDesc: '所有元素伤害+15%，元素抗性+10%',
        effects: {
            allElementDamage: 0.15,
            allElementResistance: 0.1
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '元素亲和', effectDesc: '所有元素伤害+15%，元素抗性+10%', effects: { allElementDamage: 0.15, allElementResistance: 0.1 } },
            { level: 7, stage: '进化', name: '元素共鸣', effectDesc: '所有元素伤害+30%，元素抗性+20%，技能10%概率不消耗MP', effects: { allElementDamage: 0.3, allElementResistance: 0.2, freeCastChance: 0.1 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    cultivation_genius: {
        id: 'cultivation_genius',
        name: '修炼天才',
        rarity: 'epic',
        weight: 3,
        icon: '📚',
        description: '修炼速度远超常人，经验获取大幅提升',
        effectDesc: '经验获取+30%，修炼速度+30%',
        effects: {
            expBonus: 0.3,
            cultivationBonus: 0.3
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '修炼天才', effectDesc: '经验获取+30%，修炼速度+30%', effects: { expBonus: 0.3, cultivationBonus: 0.3 } },
            { level: 7, stage: '进化', name: '过目不忘', effectDesc: '经验获取+50%，修炼速度+50%，修炼20%概率顿悟（双倍经验）', effects: { expBonus: 0.5, cultivationBonus: 0.5, enlightenmentChance: 0.2 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    strong_body: {
        id: 'strong_body',
        name: '强健体魄',
        rarity: 'epic',
        weight: 3,
        icon: '💪',
        description: '天生体魄强健，生命力顽强',
        effectDesc: '最大HP+30%，防御+15%，每回合回复2%HP',
        effects: {
            hpBonus: 0.3,
            defenseBonus: 0.15,
            hpRegen: 0.02
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '强健体魄', effectDesc: '最大HP+30%，防御+15%，每回合回复2%HP', effects: { hpBonus: 0.3, defenseBonus: 0.15, hpRegen: 0.02 } },
            { level: 7, stage: '进化', name: '钢筋铁骨', effectDesc: '最大HP+50%，防御+25%，每回合回复3%HP，受到致命伤害时保留1HP（每场战斗1次）', effects: { hpBonus: 0.5, defenseBonus: 0.25, hpRegen: 0.03, lastStand: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    strong_spirit: {
        id: 'strong_spirit',
        name: '精神强大',
        rarity: 'epic',
        weight: 3,
        icon: '🧠',
        description: '精神力远超常人，魔力深厚',
        effectDesc: '最大MP+30%，MP回复+50%，精神+20%',
        effects: {
            mpBonus: 0.3,
            mpRegenBonus: 0.5,
            spiritBonus: 0.2
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '精神强大', effectDesc: '最大MP+30%，MP回复+50%，精神+20%', effects: { mpBonus: 0.3, mpRegenBonus: 0.5, spiritBonus: 0.2 } },
            { level: 7, stage: '进化', name: '精神海洋', effectDesc: '最大MP+50%，MP回复+80%，精神+35%，技能10%概率不消耗MP', effects: { mpBonus: 0.5, mpRegenBonus: 0.8, spiritBonus: 0.35, freeCastChance: 0.1 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    crit_talent: {
        id: 'crit_talent',
        name: '致命一击',
        rarity: 'epic',
        weight: 3,
        icon: '💥',
        description: '攻击时总能找到敌人的弱点',
        effectDesc: '暴击率+15%，暴击伤害+30%',
        effects: {
            critRate: 0.15,
            critDamage: 0.3
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '致命一击', effectDesc: '暴击率+15%，暴击伤害+30%', effects: { critRate: 0.15, critDamage: 0.3 } },
            { level: 7, stage: '进化', name: '弱点洞悉', effectDesc: '暴击率+25%，暴击伤害+50%，暴击后下次攻击必暴击', effects: { critRate: 0.25, critDamage: 0.5, critChain: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    evasion_talent: {
        id: 'evasion_talent',
        name: '风之迅捷',
        rarity: 'epic',
        weight: 3,
        icon: '💨',
        description: '身形敏捷，能轻松躲避攻击',
        effectDesc: '闪避率+15%，速度+20%',
        effects: {
            dodgeBonus: 0.15,
            speedBonus: 0.2
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '风之迅捷', effectDesc: '闪避率+15%，速度+20%', effects: { dodgeBonus: 0.15, speedBonus: 0.2 } },
            { level: 7, stage: '进化', name: '御风而行', effectDesc: '闪避率+25%，速度+35%，闪避后反击造成50%伤害', effects: { dodgeBonus: 0.25, speedBonus: 0.35, dodgeCounter: 0.5 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    lifesteal_instinct: {
        id: 'lifesteal_instinct',
        name: '吸血本能',
        rarity: 'epic',
        weight: 3,
        icon: '🩸',
        description: '攻击时能吸取敌人的生命力',
        effectDesc: '攻击吸血15%，击杀回复10%HP',
        effects: {
            lifesteal: 0.15,
            killHeal: 0.1
        },
        type: 'early',
        evolutions: [
            { level: 1, stage: '觉醒', name: '吸血本能', effectDesc: '攻击吸血15%，击杀回复10%HP', effects: { lifesteal: 0.15, killHeal: 0.1 } },
            { level: 7, stage: '进化', name: '血之饥渴', effectDesc: '攻击吸血25%，击杀回复20%HP，HP低于50%时吸血翻倍', effects: { lifesteal: 0.25, killHeal: 0.2, lowHpLifestealDouble: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },

    // === 优秀（稀有级，30%概率） ===
    fast_caster: {
        id: 'fast_caster',
        name: '快速施法',
        rarity: 'rare',
        weight: 6,
        icon: '⚡',
        description: '施法速度比一般法师快',
        effectDesc: '先手概率+20%，技能MP消耗-15%',
        effects: {
            firstStrikeBonus: 0.2,
            mpCostReduction: 0.15
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '快速施法', effectDesc: '先手概率+20%，技能MP消耗-15%', effects: { firstStrikeBonus: 0.2, mpCostReduction: 0.15 } },
            { level: 7, stage: '进化', name: '瞬发天赋', effectDesc: '先手概率+40%，技能MP消耗-30%，每回合第一个技能引导时间-1', effects: { firstStrikeBonus: 0.4, mpCostReduction: 0.3, firstSkillFast: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    iron_will: {
        id: 'iron_will',
        name: '钢铁意志',
        rarity: 'rare',
        weight: 6,
        icon: '🛡️',
        description: '意志坚定，不易被负面状态影响',
        effectDesc: '负面状态抗性+30%，被控制时间-1回合',
        effects: {
            debuffResistance: 0.3,
            controlDurationReduction: 1
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '钢铁意志', effectDesc: '负面状态抗性+30%，被控制时间-1回合', effects: { debuffResistance: 0.3, controlDurationReduction: 1 } },
            { level: 7, stage: '进化', name: '不动明王', effectDesc: '负面状态抗性+60%，被控制时间-2回合，每3回合自动清除一个负面状态', effects: { debuffResistance: 0.6, controlDurationReduction: 2, autoCleanse: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    lucky_star: {
        id: 'lucky_star',
        name: '幸运星',
        rarity: 'rare',
        weight: 6,
        icon: '🍀',
        description: '运气特别好，总能遇到好事',
        effectDesc: '掉落率+20%，随机事件幸运+1，暴击率+5%',
        effects: {
            dropBonus: 0.2,
            luckBonus: 1,
            critRate: 0.05
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '幸运星', effectDesc: '掉落率+20%，随机事件幸运+1，暴击率+5%', effects: { dropBonus: 0.2, luckBonus: 1, critRate: 0.05 } },
            { level: 7, stage: '进化', name: '天选之人', effectDesc: '掉落率+50%，随机事件幸运+3，暴击率+12%，每次战斗有10%概率获得额外奖励', effects: { dropBonus: 0.5, luckBonus: 3, critRate: 0.12, bonusLootChance: 0.1 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    magic_resonance: {
        id: 'magic_resonance',
        name: '魔法共鸣',
        rarity: 'rare',
        weight: 6,
        icon: '✨',
        description: '与灵种有着特殊的共鸣',
        effectDesc: '灵种效果+30%，灵种吸收成功率+20%',
        effects: {
            spiritSeedBonus: 0.3,
            seedAbsorbBonus: 0.2
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '魔法共鸣', effectDesc: '灵种效果+30%，灵种吸收成功率+20%', effects: { spiritSeedBonus: 0.3, seedAbsorbBonus: 0.2 } },
            { level: 7, stage: '进化', name: '元素之语', effectDesc: '灵种效果+60%，灵种吸收成功率+40%，可同时装备2个灵种', effects: { spiritSeedBonus: 0.6, seedAbsorbBonus: 0.4, dualSeed: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    battle_instinct: {
        id: 'battle_instinct',
        name: '战斗直觉',
        rarity: 'rare',
        weight: 6,
        icon: '👁️',
        description: '在战斗中有着敏锐的直觉',
        effectDesc: '暴击率+8%，闪避率+8%，先手+10%',
        effects: {
            critRate: 0.08,
            dodgeBonus: 0.08,
            firstStrikeBonus: 0.1
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '战斗直觉', effectDesc: '暴击率+8%，闪避率+8%，先手+10%', effects: { critRate: 0.08, dodgeBonus: 0.08, firstStrikeBonus: 0.1 } },
            { level: 7, stage: '进化', name: '战斗大师', effectDesc: '暴击率+15%，闪避率+15%，先手+20%，战斗中每3回合获得一层战意（攻击+5%，最多5层）', effects: { critRate: 0.15, dodgeBonus: 0.15, firstStrikeBonus: 0.2, battleFury: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    medic_heritage: {
        id: 'medic_heritage',
        name: '治愈传承',
        rarity: 'rare',
        weight: 6,
        icon: '💚',
        description: '天生具有治愈的天赋',
        effectDesc: '治疗效果+25%，药水效果+30%',
        effects: {
            healBonus: 0.25,
            potionBonus: 0.3
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '治愈传承', effectDesc: '治疗效果+25%，药水效果+30%', effects: { healBonus: 0.25, potionBonus: 0.3 } },
            { level: 7, stage: '进化', name: '圣手仁心', effectDesc: '治疗效果+50%，药水效果+60%，治疗有20%概率暴击（双倍治疗）', effects: { healBonus: 0.5, potionBonus: 0.6, healCritChance: 0.2 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },

    // === 普通（常见级，50%概率） ===
    hp_boost: {
        id: 'hp_boost',
        name: '生命强化',
        rarity: 'common',
        weight: 10,
        icon: '❤️',
        description: '天生比常人更有活力',
        effectDesc: '最大HP+15%',
        effects: {
            hpBonus: 0.15
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '生命强化', effectDesc: '最大HP+10%', effects: { hpBonus: 0.1 } },
            { level: 4, stage: '成长', name: '生命涌现', effectDesc: '最大HP+20%，每回合回复0.5%HP', effects: { hpBonus: 0.2, hpRegen: 0.005 } },
            { level: 7, stage: '蜕变', name: '生命涌泉', effectDesc: '最大HP+35%，每回合回复1%HP', effects: { hpBonus: 0.35, hpRegen: 0.01 } },
            { level: 10, stage: '终极', name: '不灭生命', effectDesc: '最大HP+50%，每回合回复2%HP，战斗结束后恢复10%HP', effects: { hpBonus: 0.5, hpRegen: 0.02, postBattleHeal: 0.1 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    mp_boost: {
        id: 'mp_boost',
        name: '魔力强化',
        rarity: 'common',
        weight: 10,
        icon: '💙',
        description: '天生魔力比常人充沛',
        effectDesc: '最大MP+15%',
        effects: {
            mpBonus: 0.15
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '魔力强化', effectDesc: '最大MP+10%', effects: { mpBonus: 0.1 } },
            { level: 4, stage: '成长', name: '魔力涌现', effectDesc: '最大MP+20%，每回合回复0.5%MP', effects: { mpBonus: 0.2, mpRegen: 0.005 } },
            { level: 7, stage: '蜕变', name: '魔力涌泉', effectDesc: '最大MP+35%，每回合回复1%MP', effects: { mpBonus: 0.35, mpRegen: 0.01 } },
            { level: 10, stage: '终极', name: '无尽魔海', effectDesc: '最大MP+50%，每回合回复2%MP，技能5%概率不消耗MP', effects: { mpBonus: 0.5, mpRegen: 0.02, freeCastChance: 0.05 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    atk_boost: {
        id: 'atk_boost',
        name: '攻击强化',
        rarity: 'common',
        weight: 10,
        icon: '⚔️',
        description: '天生攻击力较强',
        effectDesc: '攻击力+10%',
        effects: {
            attackBonus: 0.1
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '攻击强化', effectDesc: '攻击力+10%', effects: { attackBonus: 0.1 } },
            { level: 4, stage: '成长', name: '锋芒初露', effectDesc: '攻击力+20%，暴击率+3%', effects: { attackBonus: 0.2, critRate: 0.03 } },
            { level: 7, stage: '蜕变', name: '锋芒毕露', effectDesc: '攻击力+35%，暴击率+5%', effects: { attackBonus: 0.35, critRate: 0.05 } },
            { level: 10, stage: '终极', name: '破坏之力', effectDesc: '攻击力+50%，暴击率+8%，暴击伤害+20%', effects: { attackBonus: 0.5, critRate: 0.08, critDamage: 0.2 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    def_boost: {
        id: 'def_boost',
        name: '防御强化',
        rarity: 'common',
        weight: 10,
        icon: '🛡️',
        description: '天生防御力较强',
        effectDesc: '防御力+10%',
        effects: {
            defenseBonus: 0.1
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '防御强化', effectDesc: '防御力+10%', effects: { defenseBonus: 0.1 } },
            { level: 4, stage: '成长', name: '坚甲初成', effectDesc: '防御力+20%，受到伤害5%概率减半', effects: { defenseBonus: 0.2, damageHalveChance: 0.05 } },
            { level: 7, stage: '蜕变', name: '坚如磐石', effectDesc: '防御力+35%，受到伤害10%概率减半', effects: { defenseBonus: 0.35, damageHalveChance: 0.1 } },
            { level: 10, stage: '终极', name: '不动如山', effectDesc: '防御力+50%，受到伤害15%概率减半，濒死时防御翻倍', effects: { defenseBonus: 0.5, damageHalveChance: 0.15, lowHpDefenseDouble: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    spd_boost: {
        id: 'spd_boost',
        name: '速度强化',
        rarity: 'common',
        weight: 10,
        icon: '💨',
        description: '天生速度较快',
        effectDesc: '速度+10%',
        effects: {
            speedBonus: 0.1
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '速度强化', effectDesc: '速度+10%', effects: { speedBonus: 0.1 } },
            { level: 4, stage: '成长', name: '疾风初显', effectDesc: '速度+20%，闪避率+3%', effects: { speedBonus: 0.2, dodgeBonus: 0.03 } },
            { level: 7, stage: '蜕变', name: '疾风之体', effectDesc: '速度+35%，闪避率+5%', effects: { speedBonus: 0.35, dodgeBonus: 0.05 } },
            { level: 10, stage: '终极', name: '瞬息千里', effectDesc: '速度+50%，闪避率+8%，先手概率+15%', effects: { speedBonus: 0.5, dodgeBonus: 0.08, firstStrikeBonus: 0.15 } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },
    auto_regen: {
        id: 'auto_regen',
        name: '自然恢复',
        rarity: 'common',
        weight: 10,
        icon: '💚',
        description: '身体恢复能力较强',
        effectDesc: '每回合回复1%HP和1%MP',
        effects: {
            hpRegen: 0.01,
            mpRegen: 0.01
        },
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '自然恢复', effectDesc: '每回合回复0.5%HP和0.5%MP', effects: { hpRegen: 0.005, mpRegen: 0.005 } },
            { level: 4, stage: '成长', name: '生命之息', effectDesc: '每回合回复1%HP和1%MP', effects: { hpRegen: 0.01, mpRegen: 0.01 } },
            { level: 7, stage: '蜕变', name: '生生不息', effectDesc: '每回合回复2%HP和2%MP，战斗结束后恢复10%HP', effects: { hpRegen: 0.02, mpRegen: 0.02, postBattleHeal: 0.1 } },
            { level: 10, stage: '终极', name: '大地之母', effectDesc: '每回合回复3%HP和3%MP，战斗结束后恢复20%HP，受到致命伤害时保留1HP（每场战斗1次）', effects: { hpRegen: 0.03, mpRegen: 0.03, postBattleHeal: 0.2, lastStand: true } }
        ],
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
    },

    // ===== v1.4.0: 新设计模式天赋 =====

    // 绑定系天赋：祝福系（稀有系只能通过此天赋觉醒）
    blessing_affinity: {
        id: 'blessing_affinity',
        name: '教廷祝福',
        rarity: 'legendary',
        weight: 1,
        icon: '✨',
        description: '你受到了教廷的祝福，天生与祝福之力共鸣。这是极为罕见的天赋，只有被神明选中的人才能拥有。',
        effectDesc: '第一系固定为祝福系，祝福技能效果+30%',
        type: 'early', // 早熟型：初始强，少进化
        boundElement: 'blessing', // 绑定系别，选择后第一系固定
        evolutions: [
            { level: 1, name: '教廷祝福', effectDesc: '祝福技能效果+30%', effects: { blessingBonus: 0.3 } },
            { level: 10, name: '圣者', effectDesc: '祝福技能效果+50%，全队受到治疗+20%', effects: { blessingBonus: 0.5, teamHealBonus: 0.2 } }
        ],
        isCanon: true,
        canonNote: '原著中祝福系极为稀有，教廷专属'
    },

    // 绑定系天赋：心灵系
    psychic_affinity: {
        id: 'psychic_affinity',
        name: '灵心',
        rarity: 'legendary',
        weight: 1,
        icon: '🧠',
        description: '你的精神力远超常人，天生就能感知他人的情绪和意念。心灵系是最神秘的魔法之一。',
        effectDesc: '第一系固定为心灵系，精神力+50%，控制技能命中率+20%',
        type: 'early',
        boundElement: 'psychic',
        evolutions: [
            { level: 1, name: '灵心', effectDesc: '精神力+50%，控制命中率+20%', effects: { spiritBonus: 0.5, controlHitBonus: 0.2 } },
            { level: 10, name: '读心者', effectDesc: '精神力+100%，控制命中率+40%，可感知敌人弱点', effects: { spiritBonus: 1.0, controlHitBonus: 0.4, weakPointSense: true } }
        ],
        isCanon: true,
        canonNote: '原著中心灵系稀有，精神力强者专属'
    },

    // 成长型天赋：元素亲和（弱初始，高成长）
    element_affinity_v2: {
        id: 'element_affinity_v2',
        name: '元素亲和',
        rarity: 'epic',
        weight: 3,
        icon: '🔮',
        description: '你与元素有着天然的亲和力，虽然初始效果不明显，但随着成长会越来越强。',
        effectDesc: '所有元素伤害+5%（成长型，最终+25%+穿透）',
        type: 'growth', // 成长型：弱初始，4次进化
        evolutions: [
            { level: 1, stage: '觉醒', name: '元素亲和', effectDesc: '所有元素伤害+5%', effects: { allElementDamage: 0.05 } },
            { level: 3, stage: '特性', name: '元素抗性', effectDesc: '所有元素伤害+10%，元素抗性+5%', effects: { allElementDamage: 0.10, allElementResistance: 0.05 } },
            { level: 5, stage: '进化', name: '元素共鸣', effectDesc: '所有元素伤害+15%，双系技能伤害+10%', effects: { allElementDamage: 0.15, dualElementBonus: 0.10 } },
            { level: 7, stage: '延伸', name: '元素掌控', effectDesc: '所有元素伤害+20%，元素反应伤害+30%', effects: { allElementDamage: 0.20, elementReactionBonus: 0.30 } },
            { level: 10, stage: '终极', name: '元素领主', effectDesc: '所有元素伤害+25%，无视20%元素抗性', effects: { allElementDamage: 0.25, elementPenetration: 0.20 } }
        ],
        isCanon: false,
        canonNote: '游戏性设计，大器晚成型天赋'
    },

    // 成长型天赋：修炼天才
    cultivation_genius_v2: {
        id: 'cultivation_genius_v2',
        name: '修炼天才',
        rarity: 'epic',
        weight: 3,
        icon: '📚',
        description: '你对修炼有着超乎常人的悟性，成长速度极快。',
        effectDesc: '经验获取+15%（成长型，最终+60%+必定突破）',
        type: 'growth',
        evolutions: [
            { level: 1, stage: '觉醒', name: '修炼天才', effectDesc: '经验获取+15%', effects: { expBonus: 0.15 } },
            { level: 3, stage: '特性', name: '勤学', effectDesc: '经验获取+25%，修炼速度+20%', effects: { expBonus: 0.25, cultivationBonus: 0.20 } },
            { level: 5, stage: '进化', name: '悟道', effectDesc: '经验获取+35%，突破成功率+10%', effects: { expBonus: 0.35, breakthroughBonus: 0.10 } },
            { level: 7, stage: '延伸', name: '顿悟', effectDesc: '经验获取+45%，每日修炼次数+1', effects: { expBonus: 0.45, extraTrainCount: 1 } },
            { level: 10, stage: '终极', name: '道心', effectDesc: '经验获取+60%，突破必定成功', effects: { expBonus: 0.60, breakthroughGuaranteed: true } }
        ],
        isCanon: false,
        canonNote: '游戏性设计，成长型天赋代表'
    },

    // 波动型天赋：战斗直觉
    battle_instinct_v2: {
        id: 'battle_instinct_v2',
        name: '战斗直觉',
        rarity: 'epic',
        weight: 3,
        icon: '⚔️',
        description: '你天生就是为战斗而生的，对战斗有着本能的直觉。',
        effectDesc: '暴击率+5%（波动型，中期崛起）',
        type: 'volatile', // 波动型：B初始，3次进化，S-最终
        evolutions: [
            { level: 1, stage: '觉醒', name: '战斗直觉', effectDesc: '暴击率+5%', effects: { critBonus: 0.05 } },
            { level: 3, stage: '特性', name: '致命', effectDesc: '暴击率+10%，暴击伤害+15%', effects: { critBonus: 0.10, critDamageBonus: 0.15 } },
            { level: 5, stage: '进化', name: '连击', effectDesc: '暴击率+15%，连续暴击叠加伤害（每层+5%，最多5层）', effects: { critBonus: 0.15, comboCrit: true } },
            { level: 7, stage: '延伸', name: '迅捷', effectDesc: '暴击率+20%，暴击后速度+10%（2回合）', effects: { critBonus: 0.20, critSpeedBuff: 0.10 } },
            { level: 10, stage: '终极', name: '必杀', effectDesc: '暴击率+25%，必定暴击时触发必杀（伤害x1.5）', effects: { critBonus: 0.25, deathBlow: true } }
        ],
        isCanon: false,
        canonNote: '游戏性设计，波动型天赋代表'
    }
};

// 稀有度配置
const InnateTalentRarity = {
    common: { name: '普通', color: '#aaaaaa', weight: 50 },
    rare: { name: '稀有', color: '#4488ff', weight: 30 },
    epic: { name: '史诗', color: '#aa44ff', weight: 15 },
    legendary: { name: '传说', color: '#ffaa00', weight: 5 }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataInnateTalents, InnateTalentRarity };
}
