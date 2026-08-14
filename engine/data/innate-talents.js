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
            atkBonus: 0.1
        },
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
            defBonus: 0.1
        },
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
        isCanon: false,
        canonNote: '非原著具体角色，游戏性设计'
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
