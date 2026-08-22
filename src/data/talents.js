/**
 * 天赋数据 - 进化式升级
 *
 * 每个成长型天赋有5个进化阶段：
 * - Lv1  觉醒：核心能力
 * - Lv3  特性：新被动/新机制
 * - Lv5  进化：形态质变
 * - Lv7  延伸：关联新能力
 * - Lv10 终极：传说级效果
 *
 * 先天型天赋1级即满级，相当于"出生即终极形态"
 */

export const DataTalents = {

  // ================================================================
  // 火系天赋
  // ================================================================

  // v2.2.0重做：资源积累型 - 燃点系统
  fire_talent_basic: {
    id: "fire_talent_basic",
    name: "烈焰之魂",
    element: "fire",
    rarity: "common",
    type: "growth",
    mechanism: "resource",  // v2.2.0: 机制类型 resource/state/form/trigger/passive
    resourceType: "fire",   // 资源类型
    resourceMax: 10,        // 资源上限
    description: "与火元素亲和，火系攻击积累燃点，满层爆炸或主动消耗强化。Lv5解锁主动技能「烈焰冲击」，可选择爆炸流/燃尽流/强化流。",
    maxLevel: 10,
    activeSkill: {  // v2.2.0: 主动技能（Lv5解锁）
      id: "fire_active_burst",
      name: "烈焰冲击",
      description: "消耗5燃点，造成150%攻击力火焰伤害，附带3层燃烧。",
      cost: 5,
      cooldown: 2,
      damageMultiplier: 1.5,
      burnStacks: 3
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "烈焰之魂",
        description: "火系伤害+10%，火系攻击积累1燃点（上限10）。",
        effects: { damageBonus: 0.10, fireEnergyGain: 1, fireEnergyMax: 10 }
      },
      {
        level: 3, stage: "特性", name: "烈焰护体",
        description: "燃点满层时自动爆炸，对所有敌人造成80%攻击力火焰伤害，燃点清零。燃烧每层+3%伤害。",
        effects: { damageBonus: 0.05, fireExplodeOnMax: true, fireExplodeDamage: 0.80, burnDamageBonus: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的火焰之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "explosion",
            name: "爆炸流",
            description: "爆炸伤害+50%，爆炸后燃点保留3层。",
            effects: { damageBonus: 0.10, fireExplodeBonus: 0.50, fireExplodeKeep: 3 }
          },
          {
            id: "burn",
            name: "燃尽流",
            description: "燃烧伤害+100%，燃烧变为真实伤害。",
            effects: { damageBonus: 0.10, burnDamageBonus: 1.0, burnTrueDamage: true }
          },
          {
            id: "enhance",
            name: "强化流",
            description: "消耗3燃点强化下一次普攻，伤害+80%且必暴击。",
            effects: { damageBonus: 0.10, fireEnhanceAttack: true, fireEnhanceCost: 3, fireEnhanceBonus: 0.80, fireEnhanceCrit: true }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          explosion: { name: "炎怒", description: "HP低于30%时狂暴，火系伤害+50%，爆炸伤害+30%。", effects: { damageBonus: 0.10, enrageDamage: 0.50, enrageThreshold: 0.30, fireExplodeBonus: 0.30 } },
          burn: { name: "岩浆护甲", description: "每回合对所有敌人造成3%最大HP灼烧，受到伤害-15%。", effects: { damageBonus: 0.10, fireAura: 0.03, damageReduction: 0.15 } },
          enhance: { name: "连击", description: "强化普攻后获得1回合连击状态。", effects: { damageBonus: 0.10, fireEnhanceCombo: true } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          explosion: { name: "烈焰领主", description: "爆炸无冷却，燃点上限+5，爆炸必定暴击。", effects: { damageBonus: 0.15, fireExplodeNoCooldown: true, fireEnergyMax: 15, fireExplodeCrit: true } },
          burn: { name: "熔岩君主", description: "燃烧可暴击，暴击时触发爆炸，燃烧上限+5层。", effects: { damageBonus: 0.15, burnCrit: true, burnCritExplode: true, burnStackMax: 10 } },
          enhance: { name: "炎暴", description: "强化普攻变为AOE，击杀后重置冷却，燃点获取+1。", effects: { damageBonus: 0.15, fireEnhanceAOE: true, fireEnhanceResetOnKill: true, fireEnergyGain: 1 } }
        }
      }
    ]
  },

  // 优秀：燃烧之心 - 灼烧流，进化为焚天烈焰
  fire_talent_burn: {
    id: "fire_talent_burn",
    name: "燃烧之心",
    element: "fire",
    rarity: "uncommon",
    type: "growth",
    description: "掌握火焰的燃烧之力，让敌人在烈焰中痛苦消亡。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "点燃",
        description: "火系技能15%概率点燃目标，每回合造成5%攻击力的灼烧伤害，持续3回合。",
        effects: { damageBonus: 0.08, burnChance: 0.15, burnDamage: 0.05 }
      },
      {
        level: 3, stage: "特性", name: "烈焰蔓延",
        description: "灼烧效果可叠加3层，每层独立计算伤害。",
        effects: { damageBonus: 0.05, burnStackMax: 3 }
      },
      {
        level: 5, stage: "进化", name: "爆燃",
        description: "灼烧效果结束时产生爆炸，对目标及周围敌人造成剩余灼烧总伤害50%的火系伤害。",
        effects: { damageBonus: 0.08, burnExplode: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "地狱火",
        description: "灼烧伤害提升至每层8%，且灼烧中的目标防御-15%。",
        effects: { damageBonus: 0.08, burnDamage: 0.03, burnDefenseDown: 0.15 }
      },
      {
        level: 10, stage: "终极", name: "焚天烈焰",
        description: "灼烧进化为「地狱烈焰」：每层10%伤害，无法被驱散，且每秒（回合）扩散到相邻敌人。",
        effects: { damageBonus: 0.10, burnDamage: 0.02, burnSpread: true, burnUnpurgeable: true }
      }
    ]
  },

  // 稀有：爆炎 - 暴击流，进化为毁灭之焰
  fire_talent_crit: {
    id: "fire_talent_crit",
    name: "爆炎",
    element: "fire",
    rarity: "rare",
    type: "growth",
    description: "追求火焰的爆发力，每一次暴击都是毁灭。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "爆炎",
        description: "火系技能暴击率+8%，暴击伤害+30%。",
        effects: { critRate: 0.08, critDamage: 0.30 }
      },
      {
        level: 3, stage: "特性", name: "爆裂冲击",
        description: "暴击时击退目标行动条30%，有概率打断施法。",
        effects: { critRate: 0.05, critKnockback: 0.30 }
      },
      {
        level: 5, stage: "进化", name: "连环爆",
        description: "暴击后30%概率触发连环爆炸，对同一目标再次造成50%伤害。",
        effects: { critRate: 0.05, chainExplosionChance: 0.30, chainExplosionDamage: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "火焰专注",
        description: "暴击率额外+15%，火系技能MP消耗-20%。",
        effects: { critRate: 0.15, mpCostReduction: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "毁灭之焰",
        description: "暴击伤害+100%，暴击时无视目标50%防御。",
        effects: { critDamage: 1.00, critArmorPenetration: 0.50 }
      }
    ]
  },

  // 史诗：焚天 - 范围流，进化为天焰葬礼
  fire_talent_explosion: {
    id: "fire_talent_explosion",
    name: "焚天",
    element: "fire",
    rarity: "epic",
    type: "growth",
    description: "掌控火焰的范围毁灭之力，一人成军，焚尽苍穹。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "爆裂",
        description: "火系技能20%概率产生爆炸，对周围敌人造成50%伤害。",
        effects: { damageBonus: 0.15, explosionChance: 0.20, explosionDamage: 0.50 }
      },
      {
        level: 3, stage: "特性", name: "火海",
        description: "爆炸后留下燃烧地面，持续3回合，每回合对上面的敌人造成10%伤害。",
        effects: { damageBonus: 0.05, fireGround: true, fireGroundDuration: 3, fireGroundDamage: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "烈焰风暴",
        description: "爆炸范围+1，爆炸伤害+50%，且必定点燃目标。",
        effects: { damageBonus: 0.10, explosionRangeBonus: 1, explosionDamage: 0.25, burnChance: 0.30 }
      },
      {
        level: 7, stage: "延伸", name: "炎爆术",
        description: "爆炸必定暴击，且暴击伤害+50%。",
        effects: { explosionCritGuaranteed: true, critDamage: 0.50 }
      },
      {
        level: 10, stage: "终极", name: "天焰葬礼",
        description: "爆炸范围再+1，爆炸后召唤火雨持续2回合，每回合对所有敌人造成30%伤害。",
        effects: { damageBonus: 0.15, explosionRangeBonus: 1, fireRain: true, fireRainDuration: 2, fireRainDamage: 0.30 }
      }
    ]
  },

  // 传说：天生火魂 - 先天型，出生即终极
  fire_talent_legendary: {
    id: "fire_talent_legendary",
    name: "天生火魂",
    element: "fire",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的火系天生天赋，灵魂深处燃烧着不灭之火。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      burnChance: 1.0,
      burnDamage: 0.08,
      mpCostReduction: 0.20,
      fireImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "火魂·不灭",
        description: "火系伤害+40%，所有攻击必定点燃（8%/回合），火系MP消耗-20%，免疫火系伤害，火系技能等级+1。",
        effects: {
          damageBonus: 0.40, burnChance: 1.0, burnDamage: 0.08,
          mpCostReduction: 0.20, fireImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 冰系天赋
  // ================================================================

  // v2.2.0更新：状态叠加型 - 寒霜层数系统
  ice_talent_basic: {
    id: "ice_talent_basic",
    name: "寒冰之躯",
    element: "ice",
    rarity: "common",
    type: "growth",
    mechanism: "state",  // v2.2.0: 状态叠加型
    stateType: "frost",  // 状态类型 寒霜
    stateMax: 5,         // 状态上限
    description: "与冰元素亲和，冰系攻击叠加寒霜层数，满层冻结或破冰爆发。Lv5解锁主动技能「破冰一击」，可选择破冰流/冰封流/霜盾流。",
    maxLevel: 10,
    activeSkill: {  // v2.2.0: 主动技能
      id: "ice_active_shatter",
      name: "破冰一击",
      description: "对冻结目标造成200%伤害，对非冻结目标造成100%伤害并+2寒霜。",
      cooldown: 2,
      frozenDamageMultiplier: 2.0,
      normalDamageMultiplier: 1.0,
      frostGain: 2
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "寒冰之躯",
        description: "冰系技能伤害+10%，攻击附加1层寒霜（最多3层），受到火系伤害-10%。",
        effects: { damageBonus: 0.10, frostChance: 1.0, frostStacks: 1, frostStackMax: 3, fireResistance: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "冰甲",
        description: "战斗开始获得最大HP15%的冰甲护盾，寒霜每层使目标速度-8%。",
        effects: { iceShield: 0.15, frostSlowPerStack: 0.08 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的寒冰之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "shatter",
            name: "破冰",
            description: "破冰流：寒霜满3层时自动破冰，造成80%攻击力冰系伤害并暴击，破冰后刷新寒霜。",
            effects: { damageBonus: 0.10, frostShatter: true, shatterDamage: 0.80, shatterCrit: true }
          },
          {
            id: "permafrost",
            name: "永冻",
            description: "冰封流：寒霜满3层时冻结目标2回合，冻结期间目标防御-30%，受到冰系伤害+50%。",
            effects: { damageBonus: 0.10, frostFreezeOnMax: true, freezeDuration: 2, freezeDefenseDown: 0.30, frozenIceDamageBonus: 0.50 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          shatter: { name: "碎裂", description: "破冰伤害提升至120%，破冰后下一次冰系技能必定暴击。", effects: { damageBonus: 0.10, shatterDamage: 0.40, shatterNextCrit: true } },
          permafrost: { name: "冰封领域", description: "冻结解除时产生冰爆，对周围敌人造成目标最大HP15%伤害，每回合开始有20%概率冻结最低HP敌人。", effects: { damageBonus: 0.10, frostExplosion: 0.15, autoFreezeChance: 0.20 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          shatter: { name: "冰霜领主", description: "冰系技能等级+1，无视30%防御，破冰伤害提升至150%且无视护盾。", effects: { damageBonus: 0.15, skillLevelBonus: 1, icePenetration: 0.30, shatterDamage: 0.30, shatterPierceShield: true } },
          permafrost: { name: "永冻君主", description: "冻结时间+1回合（共3回合），冻结目标每回合损失8%最大HP，寒霜上限+2层。", effects: { damageBonus: 0.15, freezeDuration: 1, frozenHpDrain: 0.08, frostStackMax: 2 } }
        }
      }
    ]
  },

  ice_talent_freeze: {
    id: "ice_talent_freeze",
    name: "霜冻之心",
    element: "ice",
    rarity: "uncommon",
    type: "growth",
    description: "掌握冰冻的奥义，让敌人在永恒的冰封中安息。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "霜冻",
        description: "冰系技能15%概率冻结目标1回合，冰系伤害+8%。",
        effects: { damageBonus: 0.08, freezeChance: 0.15, freezeDuration: 1 }
      },
      {
        level: 3, stage: "特性", name: "寒冰禁锢",
        description: "冻结时间+1回合（共2回合），冻结中的目标防御-20%。",
        effects: { freezeDuration: 1, freezeDefenseDown: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "冰封",
        description: "冻结变为「冰封」：无法被驱散，且冰封期间受到的冰系伤害+50%。",
        effects: { freezeUnpurgeable: true, frozenIceDamageBonus: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "霜爆",
        description: "冰封解除时产生冰爆，对目标及周围敌人造成目标最大HP15%的冰系伤害。",
        effects: { frostExplosion: 0.15, frostExplosionRange: 1 }
      },
      {
        level: 10, stage: "终极", name: "绝对零度",
        description: "冻结概率+20%，冰封中的目标每回合损失5%最大HP，且冰封有概率扩散到相邻敌人。",
        effects: { freezeChance: 0.20, frozenHpDrain: 0.05, freezeSpread: true }
      }
    ]
  },

  ice_talent_slow: {
    id: "ice_talent_slow",
    name: "冰魂",
    element: "ice",
    rarity: "rare",
    type: "growth",
    description: "将寒冰之力融入速度操控，掌控战场节奏。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "减速",
        description: "冰系技能减速效果+50%，10%概率冻结目标。",
        effects: { slowBonus: 0.50, freezeChance: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "寒冰领域",
        description: "战斗中所有敌人速度-15%，己方速度+10%。",
        effects: { enemySpeedDown: 0.15, allySpeedBonus: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "冰封万里",
        description: "冰系技能范围+1，减速效果提升至100%（目标速度减半）。",
        effects: { iceRangeBonus: 1, slowBonus: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "时间冻结",
        description: "每回合20%概率使一个随机敌人「时停」1回合（无法行动且不受伤害）。",
        effects: { timeStopChance: 0.20, timeStopDuration: 1 }
      },
      {
        level: 10, stage: "终极", name: "永冻",
        description: "减速效果无法被驱散，HP低于50%的敌人被减速时有30%概率直接冻结。",
        effects: { slowUnpurgeable: true, lowHpFreezeChance: 0.30 }
      }
    ]
  },

  ice_talent_absolute: {
    id: "ice_talent_absolute",
    name: "绝对零度",
    element: "ice",
    rarity: "epic",
    type: "growth",
    description: "追求寒冰的极致，冻结一切，包括时间本身。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "深寒",
        description: "冰系伤害+25%，冻结目标受到的伤害+20%。",
        effects: { damageBonus: 0.25, frozenDamageTaken: 0.20 }
      },
      {
        level: 3, stage: "特性", name: "寒冰穿透",
        description: "冰系伤害无视目标20%防御。",
        effects: { icePenetration: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "冰晶爆裂",
        description: "对冻结目标的攻击必定暴击，且暴击伤害+50%。",
        effects: { frozenCritGuaranteed: true, critDamage: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "冰霜新星",
        description: "每3回合释放一次冰霜新星，对所有敌人造成30%冰系伤害并减速30%。",
        effects: { frostNova: true, frostNovaInterval: 3, frostNovaDamage: 0.30, frostNovaSlow: 0.30 }
      },
      {
        level: 10, stage: "终极", name: "绝对零度·领域",
        description: "战斗开始时释放「绝对零度领域」：所有敌人冻结1回合，冰系抗性-30%，持续整场战斗。",
        effects: { absoluteZeroField: true, fieldFreezeDuration: 1, fieldIceResDown: 0.30 }
      }
    ]
  },

  ice_talent_legendary: {
    id: "ice_talent_legendary",
    name: "天生冰魂",
    element: "ice",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的冰系天生天赋，灵魂如万年寒冰般纯净。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      slowChance: 1.0,
      defenseBonus: 0.20,
      iceImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "冰魂·永冻",
        description: "冰系伤害+40%，所有攻击附带减速，防御+20%，免疫冰系伤害，冰系技能等级+1。",
        effects: {
          damageBonus: 0.40, slowChance: 1.0, defenseBonus: 0.20,
          iceImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 雷系天赋
  // ================================================================

  // v1.4.1重做：雷电之体 - 加入Lv5分支选择（连锁流/麻痹流）
  thunder_talent_basic: {
    id: "thunder_talent_basic",
    name: "雷电之体",
    element: "thunder",
    rarity: "common",
    type: "growth",
    mechanism: "resource",
    resourceType: "thunder",
    resourceMax: 6,
    description: "与雷元素亲和，雷系攻击快速积累电荷，满层连锁闪电。Lv5解锁主动技能「雷霆一击」，可选择连锁流/麻痹流/爆发流。",
    maxLevel: 10,
    activeSkill: {
      id: "thunder_active_strike",
      name: "雷霆一击",
      description: "消耗3电荷，造成120%伤害并必定麻痹1回合。",
      cost: 3,
      cooldown: 2,
      damageMultiplier: 1.2,
      paralyzeChance: 1.0,
      paralyzeDuration: 1
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "雷电之体",
        description: "雷系技能伤害+10%，速度+5%，攻击附加1层感电（最多3层）。",
        effects: { damageBonus: 0.10, speedBonus: 0.05, shockChance: 1.0, shockStacks: 1, shockStackMax: 3 }
      },
      {
        level: 3, stage: "特性", name: "雷殛护体",
        description: "受到攻击时20%概率雷电反击，感电每层使目标受到雷系伤害+10%。",
        effects: { thunderCounter: 0.20, thunderCounterDamage: 0.50, shockDamageBonus: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的雷霆之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "chain",
            name: "连锁",
            description: "连锁流：感电满3层时触发连锁闪电，对目标及周围敌人造成60%攻击力伤害，感电可扩散。",
            effects: { damageBonus: 0.10, chainLightning: true, chainDamage: 0.60, shockSpread: true }
          },
          {
            id: "paralyze",
            name: "麻痹",
            description: "麻痹流：感电满3层时使目标麻痹2回合，麻痹期间目标受到伤害+30%且无法闪避。",
            effects: { damageBonus: 0.10, shockParalyzeOnMax: true, paralyzeDuration: 2, paralyzeDamageBonus: 0.30, paralyzeNoDodge: true }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          chain: { name: "雷暴", description: "连锁闪电伤害提升至100%，每次连锁有30%概率附加麻痹1回合。", effects: { damageBonus: 0.10, chainDamage: 0.40, chainParalyzeChance: 0.30 } },
          paralyze: { name: "蓄电", description: "每次释放雷系技能蓄1层电（最多5层），每层使下次麻痹概率+15%，麻痹时间+1回合。", effects: { damageBonus: 0.10, chargeStack: true, chargeMax: 5, chargePerStack: 0.15, paralyzeDuration: 1 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          chain: { name: "雷霆领主", description: "雷系技能等级+1，无视30%防御，连锁闪电可跳跃5个目标，每次跳跃伤害衰减20%。", effects: { damageBonus: 0.15, skillLevelBonus: 1, thunderPenetration: 0.30, chainTargets: 5, chainFalloff: 0.20 } },
          paralyze: { name: "天罚之主", description: "麻痹概率+30%，麻痹目标每回合受到感电层数x10%最大HP伤害，麻痹结束时触发雷爆。", effects: { damageBonus: 0.15, paralyzeChance: 0.30, paralyzeHpDrain: 0.10, paralyzeExplode: true } }
        }
      }
    ]
  },

  thunder_talent_paralyze: {
    id: "thunder_talent_paralyze",
    name: "蓄电之心",
    element: "thunder",
    rarity: "uncommon",
    type: "growth",
    description: "掌控雷电的麻痹之力，让敌人在雷霆面前颤抖。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "麻痹",
        description: "雷系技能10%概率麻痹目标1回合，雷系伤害+8%。",
        effects: { damageBonus: 0.08, paralyzeChance: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "蓄电",
        description: "每次释放雷系技能蓄1层电（最多5层），每层使下次麻痹概率+10%。",
        effects: { chargeStack: true, chargeMax: 5, chargePerStack: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "雷霆禁锢",
        description: "麻痹变为「禁锢」：无法行动且无法闪避，持续2回合。",
        effects: { paralyzeDuration: 1, paralyzeNoDodge: true }
      },
      {
        level: 7, stage: "延伸", name: "电弧连锁",
        description: "麻痹状态的目标每回合受到8%最大HP的雷系伤害，且电弧会跳到相邻敌人。",
        effects: { paralyzeDamage: 0.08, paralyzeChain: true }
      },
      {
        level: 10, stage: "终极", name: "万雷归宗",
        description: "麻痹概率+25%，蓄电满5层时下次雷系技能必定暴击且伤害+100%。",
        effects: { paralyzeChance: 0.25, fullChargeCrit: true, fullChargeDamage: 1.00 }
      }
    ]
  },

  thunder_talent_chain: {
    id: "thunder_talent_chain",
    name: "连锁闪电",
    element: "thunder",
    rarity: "rare",
    type: "growth",
    description: "掌控雷电的连锁之力，一道雷，万道殇。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "连锁",
        description: "雷系技能30%概率连锁到1个额外目标，造成60%伤害。",
        effects: { chainChance: 0.30, chainTargets: 1, chainDamageRatio: 0.60 }
      },
      {
        level: 3, stage: "特性", name: "电弧",
        description: "连锁目标+1（共2个），连锁伤害提升至80%。",
        effects: { chainTargets: 1, chainDamageRatio: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "雷霆万钧",
        description: "连锁变为「雷霆万钧」：最多连锁4个目标，每次连锁伤害不衰减。",
        effects: { chainTargets: 2, chainNoDecay: true }
      },
      {
        level: 7, stage: "延伸", name: "感电",
        description: "被连锁命中的目标进入「感电」状态3回合，受到雷系伤害+30%。",
        effects: { shockDebuff: true, shockDuration: 3, shockThunderBonus: 0.30 }
      },
      {
        level: 10, stage: "终极", name: "九天雷池",
        description: "连锁概率+30%，连锁目标+2（共6个），感电状态的目标有20%概率被麻痹。",
        effects: { chainChance: 0.30, chainTargets: 2, shockParalyzeChance: 0.20 }
      }
    ]
  },

  thunder_talent_sky: {
    id: "thunder_talent_sky",
    name: "天雷",
    element: "thunder",
    rarity: "epic",
    type: "growth",
    description: "引动九天雷霆，天威不可犯。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "天雷",
        description: "雷系伤害+25%，暴击率+10%，麻痹概率+15%。",
        effects: { damageBonus: 0.25, critRate: 0.10, paralyzeChance: 0.15 }
      },
      {
        level: 3, stage: "特性", name: "天雷引",
        description: "每回合30%概率召唤天雷轰击随机敌人，造成80%攻击力的雷系伤害。",
        effects: { skyThunderChance: 0.30, skyThunderDamage: 0.80 }
      },
      {
        level: 5, stage: "进化", name: "雷霆之怒",
        description: "暴击时伤害+80%，且必定麻痹目标。",
        effects: { critDamage: 0.80, critParalyze: true }
      },
      {
        level: 7, stage: "延伸", name: "雷劫",
        description: "HP低于30%的敌人受到雷系伤害时，20%概率被「雷劫」直接斩杀（BOSS除外）。",
        effects: { thunderExecute: true, executeThreshold: 0.30, executeChance: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "九天应元雷声普化",
        description: "雷系技能等级+1，战斗开始时召唤天雷轰击所有敌人（150%伤害），雷系伤害无视防御。",
        effects: { skillLevelBonus: 1, openingThunder: true, openingThunderDamage: 1.50, thunderPenetration: 1.0 }
      }
    ]
  },

  thunder_talent_legendary: {
    id: "thunder_talent_legendary",
    name: "天生雷魂",
    element: "thunder",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的雷系天生天赋，身体就是雷霆的容器。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      paralyzeChance: 1.0,
      speedBonus: 0.30,
      thunderImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "雷魂·天罚",
        description: "雷系伤害+40%，攻击必定麻痹，速度+30%，免疫雷系伤害，雷系技能等级+1。",
        effects: {
          damageBonus: 0.40, paralyzeChance: 1.0, speedBonus: 0.30,
          thunderImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 土系天赋
  // ================================================================

  // v2.2.0更新：条件触发型 - 受击反击系统
  earth_talent_basic: {
    id: "earth_talent_basic",
    name: "岩石之躯",
    element: "earth",
    rarity: "common",
    type: "growth",
    mechanism: "trigger",  // v2.2.0: 条件触发型
    triggerType: "hit",    // 触发条件：受击
    description: "与土元素亲和，受击积累岩力，满层反击眩晕。防守反击，越战越勇。Lv5可选择磐石流/地震流/不屈流。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "岩石之躯",
        description: "土系技能伤害+10%，防御+5%，攻击附加1层岩甲（最多3层，每层+3%防御）。",
        effects: { damageBonus: 0.10, defenseBonus: 0.05, rockArmorStack: true, rockArmorMax: 3, rockArmorDefense: 0.03 }
      },
      {
        level: 3, stage: "特性", name: "坚岩",
        description: "受到伤害时15%概率触发坚岩（伤害-50%），岩甲每层使受到伤害-3%。",
        effects: { hardRockChance: 0.15, hardRockReduction: 0.50, rockArmorReduction: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的大地之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "shield",
            name: "护盾",
            description: "护盾流：岩甲满3层时获得最大HP20%的岩甲护盾，护盾存在时反伤15%给攻击者。",
            effects: { damageBonus: 0.10, rockArmorShieldOnMax: 0.20, shieldReflect: 0.15 }
          },
          {
            id: "counter",
            name: "反击",
            description: "反击流：岩甲满3层时受到近战攻击触发岩刺反击（造成80%防御力土系伤害），反击有30%概率眩晕目标1回合。",
            effects: { damageBonus: 0.10, rockArmorCounterOnMax: true, counterDamage: 0.80, counterStunChance: 0.30 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          shield: { name: "大地守护", description: "岩甲护盾提升至30%最大HP，反伤提升至25%，护盾破碎时对周围敌人造成15%最大HP土系伤害。", effects: { damageBonus: 0.10, rockArmorShieldOnMax: 0.10, shieldReflect: 0.10, shieldBreakDamage: 0.15 } },
          counter: { name: "岩刺领域", description: "岩刺反击伤害提升至120%防御力，眩晕概率提升至50%，每次反击恢复5%最大HP。", effects: { damageBonus: 0.10, counterDamage: 0.40, counterStunChance: 0.20, counterHeal: 0.05 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          shield: { name: "山岳领主", description: "土系技能等级+1，防御+30%，岩甲护盾提升至40%最大HP，受到致命伤害时护盾自动刷新（每场战斗1次）。", effects: { damageBonus: 0.15, skillLevelBonus: 1, defenseBonus: 0.25, rockArmorShieldOnMax: 0.10, shieldRefreshOnLethal: true } },
          counter: { name: "地裂之主", description: "土系技能等级+1，无视20%防御，岩刺反击伤害提升至150%防御力，反击后岩甲不消耗。", effects: { damageBonus: 0.15, skillLevelBonus: 1, earthPenetration: 0.20, counterDamage: 0.30, counterNoConsume: true } }
        }
      }
    ]
  },

  earth_talent_heart: {
    id: "earth_talent_heart",
    name: "大地之心",
    element: "earth",
    rarity: "uncommon",
    type: "growth",
    description: "心与大地相连，从大地中汲取无穷力量。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "大地之心",
        description: "土系伤害+15%，防御+10%。",
        effects: { damageBonus: 0.15, defenseBonus: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "大地祝福",
        description: "每回合恢复2%最大HP，战斗中防御每回合+2%（最多+20%）。",
        effects: { hpRegen: 0.02, defenseStack: 0.02, defenseStackMax: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "大地守护",
        description: "为己方全体提供15%防御加成，受到致命伤害时1次无敌（每场战斗1次）。",
        effects: { teamDefenseBonus: 0.15, lethalShield: 1 }
      },
      {
        level: 7, stage: "延伸", name: "地震",
        description: "土系技能30%概率触发地震，对所有敌人造成20%伤害并降低速度20%。",
        effects: { earthquakeChance: 0.30, earthquakeDamage: 0.20, earthquakeSlow: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "大地之怒",
        description: "防御加成的50%转化为土系伤害加成，土系技能有概率使目标眩晕1回合。",
        effects: { defenseToDamage: 0.50, stunChance: 0.20 }
      }
    ]
  },

  earth_talent_shield: {
    id: "earth_talent_shield",
    name: "岩盾",
    element: "earth",
    rarity: "rare",
    type: "growth",
    description: "以大地为盾，坚不可摧。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "岩盾",
        description: "受到伤害时20%概率获得护盾，吸收15%最大HP的伤害。",
        effects: { shieldChance: 0.20, shieldRatio: 0.15 }
      },
      {
        level: 3, stage: "特性", name: "晶化",
        description: "护盾存在时防御+30%，护盾破碎时对攻击者造成50%防御力的伤害。",
        effects: { shieldDefenseBonus: 0.30, shieldBreakDamage: 0.50 }
      },
      {
        level: 5, stage: "进化", name: "岩晶盾",
        description: "护盾变为「岩晶盾」：吸收量+50%，且每回合恢复护盾值10%。",
        effects: { shieldRatio: 0.10, shieldRegen: 0.10, crystalShield: true }
      },
      {
        level: 7, stage: "延伸", name: "反射盾",
        description: "护盾吸收伤害时，反射30%伤害给攻击者。",
        effects: { shieldReflect: 0.30 }
      },
      {
        level: 10, stage: "终极", name: "不破之盾",
        description: "护盾常驻（战斗开始即获得），吸收量提升至30%最大HP，且免疫暴击。",
        effects: { permanentShield: true, shieldRatio: 0.15, critImmunity: true }
      }
    ]
  },

  earth_talent_quake: {
    id: "earth_talent_quake",
    name: "山崩",
    element: "earth",
    rarity: "epic",
    type: "growth",
    description: "山崩地裂，大地在我脚下颤抖。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "山崩",
        description: "土系伤害+25%，15%概率眩晕目标1回合。",
        effects: { damageBonus: 0.25, stunChance: 0.15 }
      },
      {
        level: 3, stage: "特性", name: "地裂",
        description: "土系技能对眩晕目标伤害+50%，且有30%概率延长眩晕1回合。",
        effects: { stunnedDamageBonus: 0.50, stunExtendChance: 0.30 }
      },
      {
        level: 5, stage: "进化", name: "地裂山崩",
        description: "土系范围技能范围+1，眩晕概率+15%。",
        effects: { earthRangeBonus: 1, stunChance: 0.15 }
      },
      {
        level: 7, stage: "延伸", name: "陨石",
        description: "每4回合召唤陨石砸向敌方全体，造成120%攻击力的土系伤害，50%概率眩晕。",
        effects: { meteor: true, meteorInterval: 4, meteorDamage: 1.20, meteorStunChance: 0.50 }
      },
      {
        level: 10, stage: "终极", name: "天崩地裂",
        description: "土系技能等级+1，眩晕中的目标受到的伤害+100%，土系伤害无视50%防御。",
        effects: { skillLevelBonus: 1, stunnedDamageBonus: 0.50, earthPenetration: 0.50 }
      }
    ]
  },

  earth_talent_legendary: {
    id: "earth_talent_legendary",
    name: "天生土魂",
    element: "earth",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的土系天生天赋，肉身即是大地。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      defenseBonus: 0.30,
      hpBonus: 0.20,
      earthImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "土魂·山岳",
        description: "土系伤害+40%，防御+30%，HP+20%，免疫土系伤害，土系技能等级+1。",
        effects: {
          damageBonus: 0.40, defenseBonus: 0.30, hpBonus: 0.20,
          earthImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 风系天赋
  // ================================================================

  // v1.4.2重做：疾风之体 - 加入Lv5分支选择（连击流/闪避流）
  wind_talent_basic: {
    id: "wind_talent_basic",
    name: "疾风之体",
    element: "wind",
    rarity: "common",
    type: "growth",
    mechanism: "trigger",
    triggerType: "dodge",
    description: "与风元素亲和，闪避后触发疾风状态，下次攻击连击。高风险高回报。Lv5可选择疾风流/风暴流/轻盈流。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "疾风之体",
        description: "风系技能伤害+10%，速度+5%，攻击附加1层风刃（最多3层，每层+5%伤害）。",
        effects: { damageBonus: 0.10, speedBonus: 0.05, windBladeStack: true, windBladeMax: 3, windBladeDamage: 0.05 }
      },
      {
        level: 3, stage: "特性", name: "风之翼",
        description: "闪避率+10%，先手攻击概率+20%，风刃每层使速度+3%。",
        effects: { dodgeBonus: 0.10, firstStrikeChance: 0.20, windBladeSpeed: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的疾风之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "combo",
            name: "连击",
            description: "连击流：风刃满3层时触发乱舞，追加3道风刃（每道40%伤害），连击概率+30%。",
            effects: { damageBonus: 0.10, windBladeDanceOnMax: true, windBladeDanceCount: 3, windBladeDanceDamage: 0.40, comboChance: 0.30 }
          },
          {
            id: "dodge",
            name: "闪避",
            description: "闪避流：闪避率+20%，闪避成功后反击（造成80%攻击力风系伤害），风刃每层使闪避+3%。",
            effects: { damageBonus: 0.10, dodgeBonus: 0.20, dodgeCounter: true, dodgeCounterDamage: 0.80, windBladeDodge: 0.03 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          combo: { name: "风刃乱舞", description: "乱舞风刃数量+2（共5道），连击伤害提升至60%，连击后速度+10%（2回合）。", effects: { damageBonus: 0.10, windBladeDanceCount: 2, windBladeDanceDamage: 0.20, comboSpeedBuff: 0.10 } },
          dodge: { name: "风遁", description: "闪避成功后下次攻击必定暴击且伤害+50%，受到致命伤害时必定闪避（每场战斗1次）。", effects: { damageBonus: 0.10, dodgeCritBuff: true, dodgeCritDamage: 0.50, lastStandDodge: true } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          combo: { name: "风暴领主", description: "风系技能等级+1，无视30%防御，乱舞风刃数量+3（共8道），每道风刃有20%概率附加减速。", effects: { damageBonus: 0.15, skillLevelBonus: 1, windPenetration: 0.30, windBladeDanceCount: 3, windBladeSlowChance: 0.20 } },
          dodge: { name: "风之君主", description: "风系技能等级+1，速度+30%，闪避率+35%，闪避反击伤害提升至120%且必定暴击。", effects: { damageBonus: 0.15, skillLevelBonus: 1, speedBonus: 0.30, dodgeBonus: 0.15, dodgeCounterDamage: 0.40, dodgeCounterCrit: true } }
        }
      }
    ]
  },

  wind_talent_heart: {
    id: "wind_talent_heart",
    name: "风灵之心",
    element: "wind",
    rarity: "uncommon",
    type: "growth",
    description: "心与风灵相通，如风般自由，如风般锐利。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "风灵之心",
        description: "风系伤害+15%，速度+10%。",
        effects: { damageBonus: 0.15, speedBonus: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "风之眼",
        description: "暴击率+10%，风系技能MP消耗-15%。",
        effects: { critRate: 0.10, mpCostReduction: 0.15 }
      },
      {
        level: 5, stage: "进化", name: "风刃乱舞",
        description: "风系技能命中后，20%概率追加3道风刃，每道造成30%伤害。",
        effects: { windBladeChance: 0.20, windBladeCount: 3, windBladeDamage: 0.30 }
      },
      {
        level: 7, stage: "延伸", name: "飓风",
        description: "风系技能30%概率将目标卷起1回合（无法行动，受到伤害+20%）。",
        effects: { hurricaneChance: 0.30, hurricaneDuration: 1, hurricaneVulnerable: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "天风",
        description: "速度+30%，闪避+20%，先手时伤害+50%。",
        effects: { speedBonus: 0.30, dodgeBonus: 0.20, firstStrikeDamage: 0.50 }
      }
    ]
  },

  wind_talent_double: {
    id: "wind_talent_double",
    name: "连袭",
    element: "wind",
    rarity: "rare",
    type: "growth",
    description: "如风般迅捷，一击不中，再击必中。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "连袭",
        description: "风系技能25%概率攻击两次，第二次造成70%伤害。",
        effects: { doubleStrikeChance: 0.25, secondHitRatio: 0.70 }
      },
      {
        level: 3, stage: "特性", name: "疾风连斩",
        description: "连击概率+15%，第二次伤害提升至85%。",
        effects: { doubleStrikeChance: 0.15, secondHitRatio: 0.15 }
      },
      {
        level: 5, stage: "进化", name: "三连斩",
        description: "连击后30%概率追加第三次攻击，造成60%伤害。",
        effects: { tripleStrikeChance: 0.30, thirdHitRatio: 0.60 }
      },
      {
        level: 7, stage: "延伸", name: "风魔",
        description: "每次攻击速度+5%（最多+30%），每次命中暴击率+3%（最多+18%）。",
        effects: { attackSpeedStack: 0.05, attackSpeedMax: 0.30, hitCritStack: 0.03, hitCritMax: 0.18 }
      },
      {
        level: 10, stage: "终极", name: "无限连斩",
        description: "连击概率+20%，每次连击伤害递增20%，连击时MP消耗-50%。",
        effects: { doubleStrikeChance: 0.20, comboDamageIncrease: 0.20, comboMpReduction: 0.50 }
      }
    ]
  },

  wind_talent_storm: {
    id: "wind_talent_storm",
    name: "风暴",
    element: "wind",
    rarity: "epic",
    type: "growth",
    description: "掌控风暴之力，所过之处，寸草不生。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "风暴",
        description: "风系伤害+25%，闪避率+15%。",
        effects: { damageBonus: 0.25, dodgeBonus: 0.15 }
      },
      {
        level: 3, stage: "特性", name: "风暴之眼",
        description: "闪避率+10%，闪避后恢复5%最大HP和5%MP。",
        effects: { dodgeBonus: 0.10, dodgeHeal: 0.05, dodgeMpRestore: 0.05 }
      },
      {
        level: 5, stage: "进化", name: "龙卷",
        description: "风系技能30%概率召唤龙卷风，对全体敌人造成40%伤害并击退行动条。",
        effects: { tornadoChance: 0.30, tornadoDamage: 0.40, tornadoKnockback: true }
      },
      {
        level: 7, stage: "延伸", name: "风暴领域",
        description: "战斗中风系持续伤害+50%，己方全体速度+15%，闪避+10%。",
        effects: { windDotBonus: 0.50, teamSpeedBonus: 0.15, teamDodgeBonus: 0.10 }
      },
      {
        level: 10, stage: "终极", name: "天罚风暴",
        description: "风系技能等级+1，风系伤害+30%，攻击时有20%概率发动「天罚风暴」（敌方全体100%伤害+眩晕）。",
        effects: { skillLevelBonus: 1, damageBonus: 0.30, stormPunishChance: 0.20, stormPunishDamage: 1.00, stormPunishStun: true }
      }
    ]
  },

  wind_talent_legendary: {
    id: "wind_talent_legendary",
    name: "天生风魂",
    element: "wind",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的风系天生天赋，身即是风。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      speedBonus: 0.25,
      dodgeBonus: 0.20,
      windImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "风魂·无相",
        description: "风系伤害+40%，速度+25%，闪避+20%，免疫风系伤害，风系技能等级+1。",
        effects: {
          damageBonus: 0.40, speedBonus: 0.25, dodgeBonus: 0.20,
          windImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 水系天赋
  // ================================================================

  // v2.2.0更新：形态切换型 - 潮汐自动切换
  water_talent_basic: {
    id: "water_talent_basic",
    name: "流水之躯",
    element: "water",
    rarity: "common",
    type: "growth",
    mechanism: "form",
    formType: "tide",
    description: "与水元素亲和，潮汐形态自动切换（每2回合）：涨潮输出+30%，退潮治疗+30%。节奏把控，攻防兼备。Lv5可选择潮汐掌控/潮涌/深海。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "流水之躯",
        description: "水系技能伤害+10%，攻击附加1层湿润（最多3层），每回合恢复2%HP。",
        effects: { damageBonus: 0.10, wetChance: 1.0, wetStacks: 1, wetStackMax: 3, hpRegen: 0.02 }
      },
      {
        level: 3, stage: "特性", name: "水之盾",
        description: "受到伤害时20%概率水流化解（伤害-30%），湿润每层使目标受到水系伤害+8%。",
        effects: { waterGuardChance: 0.20, waterGuardReduction: 0.30, wetDamageBonus: 0.08 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的流水之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "heal",
            name: "治愈",
            description: "治愈流：湿润满3层时治疗自身15%最大HP，治疗效果+30%，每回合恢复5%HP。",
            effects: { damageBonus: 0.10, wetHealOnMax: 0.15, healBonus: 0.30, hpRegen: 0.03 }
          },
          {
            id: "bind",
            name: "束缚",
            description: "束缚流：湿润满3层时束缚目标1回合（无法行动），束缚期间目标防御-25%且受到水系伤害+50%。",
            effects: { damageBonus: 0.10, wetBindOnMax: true, bindDuration: 1, bindDefenseDown: 0.25, bindWaterDamageBonus: 0.50 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          heal: { name: "生命之泉", description: "治疗暴击率+25%，治疗时额外恢复目标5%最大HP，受到致命伤害时恢复30%HP（每场战斗1次）。", effects: { damageBonus: 0.10, healCritRate: 0.25, healExtraHp: 0.05, lastStandHeal: 0.30 } },
          bind: { name: "潮汐", description: "束缚时间+1回合，束缚结束时触发水爆（对周围敌人造成目标最大HP12%伤害），湿润上限+2层。", effects: { damageBonus: 0.10, bindDuration: 1, bindExplosion: 0.12, wetStackMax: 2 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          heal: { name: "深海领主", description: "水系技能等级+1，每回合恢复8%HP和5%MP，治疗效果+60%，受到伤害-15%。", effects: { damageBonus: 0.15, skillLevelBonus: 1, hpRegen: 0.03, mpRegen: 0.02, healBonus: 0.30, damageReduction: 0.05 } },
          bind: { name: "潮汐之主", description: "水系技能等级+1，无视20%防御，束缚变为「深海禁锢」（无法驱散，每回合损失6%最大HP），湿润可扩散到相邻敌人。", effects: { damageBonus: 0.15, skillLevelBonus: 1, waterPenetration: 0.20, bindUnpurgeable: true, bindHpDrain: 0.06, wetSpread: true } }
        }
      }
    ]
  },

  water_talent_heal: {
    id: "water_talent_heal",
    name: "治愈之心",
    element: "water",
    rarity: "uncommon",
    type: "growth",
    description: "心有甘泉，治愈万物。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "治愈之心",
        description: "水系伤害+8%，治疗效果+20%。",
        effects: { damageBonus: 0.08, healBonus: 0.20 }
      },
      {
        level: 3, stage: "特性", name: "生命之水",
        description: "治疗时额外恢复目标5%最大HP，治疗暴击率+15%。",
        effects: { healExtraHp: 0.05, healCritRate: 0.15 }
      },
      {
        level: 5, stage: "进化", name: "治愈之雨",
        description: "水系治疗技能变为范围治疗，同时治疗己方全体（50%效果）。",
        effects: { aoeHeal: true, aoeHealRatio: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "净化之水",
        description: "治疗时50%概率净化目标身上的一个负面状态。",
        effects: { healPurifyChance: 0.50 }
      },
      {
        level: 10, stage: "终极", name: "生命之泉",
        description: "治疗效果+40%，每回合自动为HP最低的友方恢复10%最大HP。",
        effects: { healBonus: 0.40, autoHeal: 0.10, autoHealTarget: "lowestHp" }
      }
    ]
  },

  water_talent_moist: {
    id: "water_talent_moist",
    name: "滋润",
    element: "water",
    rarity: "rare",
    type: "growth",
    description: "润物细无声，在持续中积累胜势。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "滋润",
        description: "水系技能50%概率附带持续恢复，5回合每回合恢复5%HP。",
        effects: { regenChance: 0.50, regenAmount: 0.05, regenDuration: 5 }
      },
      {
        level: 3, stage: "特性", name: "水润",
        description: "持续恢复同时恢复MP（每回合3%最大MP），且受到伤害-10%。",
        effects: { regenMp: 0.03, regenDamageReduction: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "水之祝福",
        description: "持续恢复变为「水之祝福」：恢复量翻倍，且增加目标10%防御。",
        effects: { regenAmount: 0.05, regenDefenseBonus: 0.10 }
      },
      {
        level: 7, stage: "延伸", name: "潮汐",
        description: "每3回合释放一次潮汐，为己方全体恢复15%HP并解除控制。",
        effects: { tide: true, tideInterval: 3, tideHeal: 0.15, tideCleanse: true }
      },
      {
        level: 10, stage: "终极", name: "生生不息",
        description: "持续恢复无法被驱散，HP低于30%时恢复量翻倍，战斗中每回合恢复2%最大MP。",
        effects: { regenUnpurgeable: true, lowHpRegenDouble: true, mpRegen: 0.02 }
      }
    ]
  },

  water_talent_tide: {
    id: "water_talent_tide",
    name: "潮汐",
    element: "water",
    rarity: "epic",
    type: "growth",
    description: "掌控潮汐之力，潮起潮落，皆在我心。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "潮汐",
        description: "水系伤害+25%，治疗暴击率+15%。",
        effects: { damageBonus: 0.25, healCritRate: 0.15 }
      },
      {
        level: 3, stage: "特性", name: "涨潮",
        description: "每回合水系伤害+5%（最多+30%），治疗效果+3%（最多+18%）。",
        effects: { tideDamageStack: 0.05, tideDamageMax: 0.30, tideHealStack: 0.03, tideHealMax: 0.18 }
      },
      {
        level: 5, stage: "进化", name: "海啸",
        description: "水系技能30%概率引发海啸，对全体敌人造成60%伤害并降低攻击20%。",
        effects: { tsunamiChance: 0.30, tsunamiDamage: 0.60, tsunamiAtkDown: 0.20 }
      },
      {
        level: 7, stage: "延伸", name: "潮汐护盾",
        description: "治疗时为目标附加潮汐护盾（治疗量的30%），持续2回合。",
        effects: { tideShield: 0.30, tideShieldDuration: 2 }
      },
      {
        level: 10, stage: "终极", name: "深渊之主",
        description: "水系技能等级+1，水系伤害+30%，治疗效果+30%，每回合自动释放一次小潮汐。",
        effects: { skillLevelBonus: 1, damageBonus: 0.30, healBonus: 0.30, autoTide: true }
      }
    ]
  },

  water_talent_legendary: {
    id: "water_talent_legendary",
    name: "天生水魂",
    element: "water",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的水系天生天赋，上善若水，水利万物。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      healBonus: 0.50,
      hpRegen: 0.10,
      waterImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "水魂·沧海",
        description: "水系伤害+40%，治疗+50%，每回合恢复10%HP，免疫水系伤害，水系技能等级+1。",
        effects: {
          damageBonus: 0.40, healBonus: 0.50, hpRegen: 0.10,
          waterImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 光系天赋
  // ================================================================

  // v2.2.0更新：形态切换型 - 圣盾手动切换
  light_talent_basic: {
    id: "light_talent_basic",
    name: "光明之体",
    element: "light",
    rarity: "common",
    type: "growth",
    mechanism: "form",
    formType: "holyShield",
    description: "与光元素亲和，可手动切换圣光形态（输出+30%，攻击附带净化）/圣盾形态（防御+40%，受击反弹伤害）。战术切换，攻防转换。Lv5解锁主动技能「圣光爆发」。",
    maxLevel: 10,
    activeSkill: {
      id: "light_active_nova",
      name: "圣光爆发",
      description: "仅圣光形态可用，造成150%光系伤害并净化目标1个增益。",
      cooldown: 3,
      damageMultiplier: 1.5,
      purgeBuff: 1
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "光明之体",
        description: "光系技能伤害+10%，攻击附加1层圣光（最多3层，每层+5%光系伤害），对暗影系伤害+20%。",
        effects: { damageBonus: 0.10, holyStack: true, holyMax: 3, holyDamageBonus: 0.05, darkDamageBonus: 0.20 }
      },
      {
        level: 3, stage: "特性", name: "光之护封",
        description: "战斗开始获得15%最大HP圣光护盾，圣光每层使受到的暗影伤害-5%。",
        effects: { lightShield: 0.15, holyDarkResist: 0.05 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的光明之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "purify",
            name: "净化",
            description: "净化流：圣光满3层时自动净化自身所有debuff并恢复15%最大HP，净化后对周围敌人造成圣光伤害。",
            effects: { damageBonus: 0.10, holyPurifyOnMax: true, purifyHeal: 0.15, purifyDamage: 0.50 }
          },
          {
            id: "judgment",
            name: "审判",
            description: "审判流：圣光满3层时触发「审判」，造成目标最大HP20%的真实伤害（对暗影系翻倍），审判后刷新圣光。",
            effects: { damageBonus: 0.10, holyJudgmentOnMax: true, judgmentDamage: 0.20, judgmentTrueDamage: true, judgmentDarkDouble: true }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          purify: { name: "圣光普照", description: "净化恢复提升至25%最大HP，净化后为己方全体恢复10%HP，每回合开始有30%概率净化1个debuff。", effects: { damageBonus: 0.10, purifyHeal: 0.10, purifyTeamHeal: 0.10, autoPurifyChance: 0.30 } },
          judgment: { name: "天罚", description: "审判伤害提升至30%最大HP，审判有50%概率眩晕目标1回合，对暗影系审判必定暴击。", effects: { damageBonus: 0.10, judgmentDamage: 0.10, judgmentStunChance: 0.50, judgmentDarkCrit: true } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          purify: { name: "圣光领主", description: "光系技能等级+1，圣光上限+2层，净化变为「神圣净化」（恢复40%HP+全体净化+护盾），免疫所有debuff。", effects: { damageBonus: 0.15, skillLevelBonus: 1, holyMax: 2, purifyHeal: 0.15, debuffImmunity: true } },
          judgment: { name: "裁决之主", description: "光系技能等级+1，无视25%防御，审判伤害提升至40%最大HP，审判后下一次光系技能必定暴击且伤害+50%。", effects: { damageBonus: 0.15, skillLevelBonus: 1, lightPenetration: 0.25, judgmentDamage: 0.10, judgmentNextCrit: true, judgmentNextDamage: 0.50 } }
        }
      }
    ]
  },

  light_talent_holy: {
    id: "light_talent_holy",
    name: "圣光之心",
    element: "light",
    rarity: "uncommon",
    type: "growth",
    description: "心怀圣光，驱散一切黑暗。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "圣光之心",
        description: "光系伤害+15%，对暗影系额外+20%。",
        effects: { damageBonus: 0.15, darkDamageBonus: 0.20 }
      },
      {
        level: 3, stage: "特性", name: "圣光加持",
        description: "己方全体攻击+10%，防御+10%。",
        effects: { teamAtkBonus: 0.10, teamDefBonus: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "神圣之光",
        description: "光系技能40%概率净化目标所有增益效果，且对暗影系目标伤害+50%。",
        effects: { purifyChance: 0.40, darkDamageBonus: 0.30 }
      },
      {
        level: 7, stage: "延伸", name: "圣盾",
        description: "为HP最低的友方附加圣盾，吸收20%最大HP伤害，持续3回合。",
        effects: { holyShield: 0.20, holyShieldDuration: 3, holyShieldTarget: "lowestHp" }
      },
      {
        level: 10, stage: "终极", name: "大天使之怒",
        description: "光系伤害+30%，对暗影系伤害再+50%，光系技能20%概率使目标眩晕1回合。",
        effects: { damageBonus: 0.30, darkDamageBonus: 0.50, stunChance: 0.20 }
      }
    ]
  },

  light_talent_purify: {
    id: "light_talent_purify",
    name: "净化",
    element: "light",
    rarity: "rare",
    type: "growth",
    description: "以圣光净化一切污秽与邪恶。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "净化",
        description: "光系技能30%概率净化目标一个负面状态（对敌方）或增益效果（对己方）。",
        effects: { purifyChance: 0.30 }
      },
      {
        level: 3, stage: "特性", name: "净化之光",
        description: "净化概率+20%，净化成功时恢复目标10%HP。",
        effects: { purifyChance: 0.20, purifyHeal: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "圣光净化",
        description: "净化变为范围效果，影响目标周围所有单位，且净化数量+1。",
        effects: { aoePurify: true, purifyCount: 2 }
      },
      {
        level: 7, stage: "延伸", name: "驱散",
        description: "对敌方净化时，同时降低其20%攻击和防御，持续2回合。",
        effects: { purifyDebuff: true, purifyAtkDown: 0.20, purifyDefDown: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "神圣净化",
        description: "净化概率+30%，净化成功时为己方全体恢复15%HP，对敌方造成15%最大HP伤害。",
        effects: { purifyChance: 0.30, purifyTeamHeal: 0.15, purifyDamage: 0.15 }
      }
    ]
  },

  light_talent_divine: {
    id: "light_talent_divine",
    name: "神圣",
    element: "light",
    rarity: "epic",
    type: "growth",
    description: "神圣不可侵犯，天威之下，万物俯首。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "神圣",
        description: "光系伤害+25%，暴击时获得圣光护盾（10%最大HP）。",
        effects: { damageBonus: 0.25, shieldOnCrit: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "神圣护盾",
        description: "护盾存在时免疫所有负面状态，暴击率+15%。",
        effects: { shieldDebuffImmune: true, critRate: 0.15 }
      },
      {
        level: 5, stage: "进化", name: "圣光审判",
        description: "光系技能对有负面状态的目标伤害+50%，暴击伤害+50%。",
        effects: { debuffedDamageBonus: 0.50, critDamage: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "天使降临",
        description: "每4回合召唤天使降临，对敌方全体造成80%光系伤害，为己方全体恢复20%HP。",
        effects: { angelInterval: 4, angelDamage: 0.80, angelHeal: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "神之裁决",
        description: "光系技能等级+1，光系伤害+30%，暴击率+20%，暴击时无视防御。",
        effects: { skillLevelBonus: 1, damageBonus: 0.30, critRate: 0.20, critArmorPenetration: 1.0 }
      }
    ]
  },

  light_talent_legendary: {
    id: "light_talent_legendary",
    name: "天生光魂",
    element: "light",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的光系天生天赋，灵魂即是光明。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      debuffImmunity: true,
      lightImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "光魂·圣裁",
        description: "光系伤害+40%，免疫所有负面状态，免疫光系伤害，光系技能等级+1。",
        effects: {
          damageBonus: 0.40, debuffImmunity: true,
          lightImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 暗影系天赋
  // ================================================================

  // v2.2.0更新：状态叠加型 - 诅咒层数
  dark_talent_basic: {
    id: "dark_talent_basic",
    name: "暗影之躯",
    element: "dark",
    rarity: "common",
    type: "growth",
    mechanism: "state",
    stateType: "curse",
    stateMax: 5,
    description: "与暗影元素亲和，暗系攻击叠加诅咒层数，满层引爆。DoT为主，诅咒蔓延。Lv5解锁主动技能「诅咒引爆」，可选择蔓延流/加深流/吸取流。",
    maxLevel: 10,
    activeSkill: {
      id: "dark_active_detonate",
      name: "诅咒引爆",
      description: "立即结算目标所有诅咒伤害，每层诅咒额外造成20%伤害。",
      cooldown: 2,
      curseDetonate: true,
      curseBonusPerStack: 0.20
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "暗影之躯",
        description: "暗影系技能伤害+10%，攻击附加1层暗影（最多3层，每层+5%吸血），对光系伤害+20%。",
        effects: { damageBonus: 0.10, shadowStack: true, shadowMax: 3, shadowLifesteal: 0.05, lightDamageBonus: 0.20 }
      },
      {
        level: 3, stage: "特性", name: "暗影步",
        description: "闪避率+10%，闪避后下次攻击伤害+30%，暗影每层使目标攻击-3%。",
        effects: { dodgeBonus: 0.10, dodgeNextHitBonus: 0.30, shadowAttackDown: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的暗影之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "drain",
            name: "吸血",
            description: "吸血流：暗影满3层时攻击附带30%吸血，且使目标受到治疗效果-50%（3回合）。",
            effects: { damageBonus: 0.10, shadowDrainOnMax: true, drainLifesteal: 0.30, drainHealReduction: 0.50 }
          },
          {
            id: "stealth",
            name: "潜行",
            description: "潜行流：暗影满3层时进入隐身1回合（无法被锁定），隐身中首次攻击伤害+100%且必定暴击。",
            effects: { damageBonus: 0.10, shadowStealthOnMax: true, stealthDuration: 1, stealthFirstHitBonus: 1.00, stealthFirstHitCrit: true }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          drain: { name: "暗影吞噬", description: "吸血提升至45%，击杀目标时恢复30%HP和MP，暗影满层时目标防御-20%。", effects: { damageBonus: 0.10, drainLifesteal: 0.15, killHeal: 0.30, shadowDefenseDown: 0.20 } },
          stealth: { name: "背刺", description: "隐身首次攻击伤害提升至150%，背刺有60%概率眩晕目标1回合，隐身结束后闪避+20%（2回合）。", effects: { damageBonus: 0.10, stealthFirstHitBonus: 0.50, backstabStunChance: 0.60, stealthEndDodge: 0.20 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          drain: { name: "暗影领主", description: "暗影系技能等级+1，吸血提升至60%，暗影满层时触发「生命汲取」（吸取目标20%最大HP），受到致命伤害时化为暗影无敌1回合（每场1次）。", effects: { damageBonus: 0.15, skillLevelBonus: 1, drainLifesteal: 0.15, shadowLifeDrain: 0.20, shadowFormOnLethal: true } },
          stealth: { name: "夜魇之主", description: "暗影系技能等级+1，无视25%防御，隐身持续2回合，隐身中所有攻击必定暴击且伤害+80%，击杀后自动刷新隐身。", effects: { damageBonus: 0.15, skillLevelBonus: 1, darkPenetration: 0.25, stealthDuration: 1, stealthAllHitCrit: true, stealthAllHitBonus: 0.80, stealthRefreshOnKill: true } }
        }
      }
    ]
  },

  dark_talent_heart: {
    id: "dark_talent_heart",
    name: "黑暗之心",
    element: "dark",
    rarity: "uncommon",
    type: "growth",
    description: "心向黑暗，在阴影中汲取力量。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "黑暗之心",
        description: "暗影伤害+15%，对光系额外+20%。",
        effects: { damageBonus: 0.15, lightDamageBonus: 0.20 }
      },
      {
        level: 3, stage: "特性", name: "暗之力",
        description: "HP低于50%时伤害+25%，闪避+15%。",
        effects: { lowHpDamageBonus: 0.25, lowHpDodgeBonus: 0.15 }
      },
      {
        level: 5, stage: "进化", name: "暗影化身",
        description: "受到致命伤害时1次化为暗影无敌2秒（1回合），并恢复30%HP（每场1次）。",
        effects: { shadowForm: 1, shadowFormDuration: 1, shadowFormHeal: 0.30 }
      },
      {
        level: 7, stage: "延伸", name: "黑暗领域",
        description: "战斗中敌方全体命中-15%，己方暗影系伤害+20%。",
        effects: { enemyHitDown: 0.15, teamDarkBonus: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "深渊之心",
        description: "暗影伤害+30%，HP越低伤害越高（最多+80%），击杀目标后所有技能冷却-1回合。",
        effects: { damageBonus: 0.30, lowHpDamageScaling: 0.80, killCooldownReduce: 1 }
      }
    ]
  },

  dark_talent_stealth: {
    id: "dark_talent_stealth",
    name: "潜行",
    element: "dark",
    rarity: "rare",
    type: "growth",
    description: "藏于暗影，一击必杀。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "潜行",
        description: "30%概率无视闪避，攻击有10%概率使目标致盲2回合。",
        effects: { ignoreDodgeChance: 0.30, blindChance: 0.10, blindDuration: 2 }
      },
      {
        level: 3, stage: "特性", name: "暗影突袭",
        description: "从隐身/潜行状态攻击时伤害+50%，暴击率+20%。",
        effects: { stealthDamageBonus: 0.50, stealthCritBonus: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "影杀",
        description: "攻击后30%概率重新进入潜行状态1回合，且下次攻击必定暴击。",
        effects: { reStealthChance: 0.30, reStealthDuration: 1, reStealthCrit: true }
      },
      {
        level: 7, stage: "延伸", name: "暗影标记",
        description: "攻击时标记目标3回合，标记期间受到的暗影伤害+50%，且无法隐身。",
        effects: { darkMark: true, darkMarkDuration: 3, darkMarkDamage: 0.50, markNoStealth: true }
      },
      {
        level: 10, stage: "终极", name: "虚空行者",
        description: "无视闪避概率+40%，每回合30%概率隐身，隐身时伤害+100%。",
        effects: { ignoreDodgeChance: 0.40, autoStealthChance: 0.30, stealthDamageBonus: 0.50 }
      }
    ]
  },

  dark_talent_curse: {
    id: "dark_talent_curse",
    name: "诅咒",
    element: "dark",
    rarity: "epic",
    type: "growth",
    description: "以暗影为媒，降下无尽诅咒。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "诅咒",
        description: "暗影伤害+25%，40%概率施加诅咒，每回合8%最大HP伤害，持续3回合。",
        effects: { damageBonus: 0.25, curseChance: 0.40, curseDamage: 0.08, curseDuration: 3 }
      },
      {
        level: 3, stage: "特性", name: "痛苦诅咒",
        description: "诅咒同时降低目标15%攻击和防御，诅咒伤害+4%。",
        effects: { curseAtkDown: 0.15, curseDefDown: 0.15, curseDamage: 0.04 }
      },
      {
        level: 5, stage: "进化", name: "厄运",
        description: "诅咒中的目标暴击率-30%，闪避-30%，且受到的暴击伤害+50%。",
        effects: { curseCritDown: 0.30, curseDodgeDown: 0.30, curseCritDamageTaken: 0.50 }
      },
      {
        level: 7, stage: "延伸", name: "死亡之触",
        description: "诅咒结束时，目标损失当前HP的20%，且有20%概率传播到相邻敌人。",
        effects: { curseEndDamage: 0.20, curseSpreadChance: 0.20 }
      },
      {
        level: 10, stage: "终极", name: "永恒诅咒",
        description: "暗影系技能等级+1，诅咒无法被驱散，诅咒中的目标死亡时为你恢复30%HP。",
        effects: { skillLevelBonus: 1, curseUnpurgeable: true, curseKillHeal: 0.30 }
      }
    ]
  },

  dark_talent_legendary: {
    id: "dark_talent_legendary",
    name: "天生暗魂",
    element: "dark",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的暗影系天生天赋，与黑暗共生。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.40,
      guaranteedCrit: true,
      stealthDamageBonus: 1.0,
      darkImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "暗魂·虚无",
        description: "暗影伤害+40%，攻击必定暴击，隐身时伤害翻倍，免疫暗影伤害，暗影技能等级+1。",
        effects: {
          damageBonus: 0.40, guaranteedCrit: true, stealthDamageBonus: 1.0,
          darkImmunity: true, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 治愈系天赋
  // ================================================================

  // v2.2.0更新：纯被动光环型
  heal_talent_basic: {
    id: "heal_talent_basic",
    name: "慈悲之心",
    element: "heal",
    rarity: "common",
    type: "growth",
    mechanism: "passive",
    description: "心怀慈悲，常驻生命光环，每回合回复全队HP。纯辅助，团队增益。Lv5可选择生命流/净化流/庇护流。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "慈悲之心",
        description: "治疗效果+15%，治疗时附加1层祝福（最多3层，每层+5%治疗效果）。",
        effects: { healBonus: 0.15, blessingStack: true, blessingMax: 3, blessingHealBonus: 0.05 }
      },
      {
        level: 3, stage: "特性", name: "治愈之光",
        description: "治疗时为目标附加护盾（治疗量的20%），祝福每层使目标防御+3%。",
        effects: { healShield: 0.20, healShieldDuration: 2, blessingDefenseBonus: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的慈悲之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "restore",
            name: "治疗",
            description: "治疗流：祝福满3层时触发「生命绽放」，恢复目标30%最大HP并净化所有debuff，冷却3回合。",
            effects: { healBonus: 0.10, blessingBloomOnMax: true, bloomHeal: 0.30, bloomPurify: true, bloomCooldown: 3 }
          },
          {
            id: "buff",
            name: "增益",
            description: "增益流：祝福满3层时触发「圣恩」，目标攻击+20%、防御+20%、速度+10%，持续3回合。",
            effects: { healBonus: 0.10, blessingGraceOnMax: true, graceAtkBonus: 0.20, graceDefBonus: 0.20, graceSpeedBonus: 0.10, graceDuration: 3 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          restore: { name: "治愈光环", description: "每回合为己方全体恢复5%最大HP，生命绽放恢复提升至45%，绽放后为目标附加20%最大HP护盾。", effects: { healBonus: 0.10, healAura: 0.05, bloomHeal: 0.15, bloomShield: 0.20 } },
          buff: { name: "祝福之环", description: "圣恩效果提升至攻击+30%、防御+30%，圣恩期间目标造成伤害的10%转化为治疗，祝福上限+2层。", effects: { healBonus: 0.10, graceAtkBonus: 0.10, graceDefBonus: 0.10, graceLifesteal: 0.10, blessingMax: 2 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          restore: { name: "大慈悲者", description: "治愈系技能等级+1，治疗效果+50%，生命绽放变为「重生」（恢复60%HP+复活阵亡单位，每场战斗1次），免疫所有debuff。", effects: { skillLevelBonus: 1, healBonus: 0.40, bloomHeal: 0.15, bloomRevive: true, debuffImmunity: true } },
          buff: { name: "圣恩之主", description: "治愈系技能等级+1，圣恩变为「神圣祝福」（全属性+40%+暴击+20%+必中），圣恩持续期间目标受到致命伤害时保留1HP（每场1次）。", effects: { skillLevelBonus: 1, graceAllStats: 0.40, graceCritBonus: 0.20, graceHitGuaranteed: true, graceLastStand: true } }
        }
      }
    ]
  },

  heal_talent_blessing: {
    id: "heal_talent_blessing",
    name: "生命祝福",
    element: "heal",
    rarity: "uncommon",
    type: "growth",
    description: "以生命之力祝福同伴。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "生命祝福",
        description: "治疗效果+25%，最大HP+10%。",
        effects: { healBonus: 0.25, hpBonus: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "祝福之环",
        description: "治疗技能同时为目标增加10%攻击和防御，持续2回合。",
        effects: { blessAtkBonus: 0.10, blessDefBonus: 0.10, blessDuration: 2 }
      },
      {
        level: 5, stage: "进化", name: "生命之种",
        description: "治疗时在目标身上种下生命之种，3回合后爆发恢复30%最大HP。",
        effects: { lifeSeed: true, lifeSeedDelay: 3, lifeSeedHeal: 0.30 }
      },
      {
        level: 7, stage: "延伸", name: "复活之光",
        description: "战斗中可复活1名阵亡队友（30%HP），每场战斗1次。",
        effects: { revive: true, reviveHp: 0.30, reviveCount: 1 }
      },
      {
        level: 10, stage: "终极", name: "生命女神的祝福",
        description: "治疗效果+40%，最大HP+20%，复活后目标HP恢复至60%且免疫负面2回合。",
        effects: { healBonus: 0.40, hpBonus: 0.20, reviveHp: 0.30, reviveBuff: true }
      }
    ]
  },

  heal_talent_purify: {
    id: "heal_talent_purify",
    name: "圣光治愈",
    element: "heal",
    rarity: "rare",
    type: "growth",
    description: "以圣光治愈，同时净化邪恶。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "圣光治愈",
        description: "治疗时30%概率净化目标一个负面状态。",
        effects: { purifyOnHealChance: 0.30 }
      },
      {
        level: 3, stage: "特性", name: "净化之光",
        description: "净化概率+20%，净化成功时治疗效果+50%。",
        effects: { purifyOnHealChance: 0.20, purifyHealBonus: 0.50 }
      },
      {
        level: 5, stage: "进化", name: "圣光沐浴",
        description: "治疗变为范围效果，影响目标周围所有友方，且净化所有负面状态。",
        effects: { aoeHeal: true, aoeHealRatio: 0.60, purifyAll: true }
      },
      {
        level: 7, stage: "延伸", name: "神圣庇护",
        description: "治疗后为目标附加庇护：2回合内免疫下一个负面状态。",
        effects: { divineProtection: true, protectionDuration: 2 }
      },
      {
        level: 10, stage: "终极", name: "圣光普照",
        description: "治疗效果+30%，每回合自动为己方全体净化1个负面状态并恢复5%HP。",
        effects: { healBonus: 0.30, autoPurify: true, autoHeal: 0.05 }
      }
    ]
  },

  heal_talent_spring: {
    id: "heal_talent_spring",
    name: "生命之泉",
    element: "heal",
    rarity: "epic",
    type: "growth",
    description: "生命之泉永不干涸，治愈之力源源不断。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "生命之泉",
        description: "治疗效果+40%，每回合恢复5%HP。",
        effects: { healBonus: 0.40, hpRegen: 0.05 }
      },
      {
        level: 3, stage: "特性", name: "泉涌",
        description: "治疗暴击时治疗量翻倍，且为目标恢复20%MP。",
        effects: { healCritDouble: true, healMpRestore: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "生命之树",
        description: "每回合为己方全体恢复8%HP，且所有治疗效果+20%。",
        effects: { teamHpRegen: 0.08, healBonus: 0.20 }
      },
      {
        level: 7, stage: "延伸", name: "不死之泉",
        description: "友方HP低于20%时，立即为其恢复30%HP（冷却3回合）。",
        effects: { emergencyHeal: true, emergencyThreshold: 0.20, emergencyHealAmount: 0.30, emergencyCooldown: 3 }
      },
      {
        level: 10, stage: "终极", name: "生命源泉",
        description: "治疗效果+50%，每回合恢复10%HP，战斗中首次阵亡自动复活（50%HP，每场1次）。",
        effects: { healBonus: 0.50, hpRegen: 0.05, autoRevive: true, autoReviveHp: 0.50 }
      }
    ]
  },

  heal_talent_legendary: {
    id: "heal_talent_legendary",
    name: "天生治愈",
    element: "heal",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的治愈系天生天赋，生而知之，掌握生命法则。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      healBonus: 0.60,
      reviveUnlocked: true,
      cooldownReduction: 0.50,
      healImmunity: true,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "治愈·生命法则",
        description: "治疗+60%，可使用复活，技能冷却-50%，治愈系技能等级+1。",
        effects: {
          healBonus: 0.60, reviveUnlocked: true, cooldownReduction: 0.50, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 召唤系天赋
  // ================================================================

  // v2.2.0更新：资源积累型 - 契约
  summon_talent_basic: {
    id: "summon_talent_basic",
    name: "契约之心",
    element: "summon",
    rarity: "common",
    type: "growth",
    mechanism: "resource",
    resourceType: "summon",
    resourceMax: 5,
    description: "与召唤兽建立契约，召唤兽攻击积累契约层，满层触发兽潮。与召唤兽协同作战。Lv5解锁主动技能「召唤号令」，可选择强攻流/防御流。",
    maxLevel: 10,
    activeSkill: {
      id: "summon_active_command",
      name: "召唤号令",
      description: "消耗3契约，召唤兽立即进行3次额外攻击。",
      cost: 3,
      cooldown: 3,
      summonExtraAttacks: 3
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "契约之心",
        description: "召唤兽伤害+10%，召唤兽HP+10%，每次召唤兽攻击积累1层契约（最多3层，每层+5%召唤兽伤害）。",
        effects: { summonDamageBonus: 0.10, summonHpBonus: 0.10, contractStack: true, contractMax: 3, contractDamageBonus: 0.05 }
      },
      {
        level: 3, stage: "特性", name: "灵魂共鸣",
        description: "召唤兽继承你10%的攻击和防御，契约每层使你速度+3%。",
        effects: { inheritStats: 0.10, contractSpeedBonus: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的契约之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "assault",
            name: "强攻",
            description: "强攻流：契约满3层时触发「兽潮」，召唤兽额外攻击2次（每次60%伤害），触发后契约不消耗。",
            effects: { summonDamageBonus: 0.10, contractBeastTideOnMax: true, beastTideCount: 2, beastTideDamage: 0.60, beastTideNoConsume: true }
          },
          {
            id: "guard",
            name: "防御",
            description: "防御流：契约满3层时召唤兽获得「守护」状态（吸收你受到的50%伤害，持续2回合），守护期间召唤兽嘲讽所有敌人。",
            effects: { summonDamageBonus: 0.10, contractGuardOnMax: true, guardDamageAbsorb: 0.50, guardDuration: 2, guardTaunt: true }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          assault: { name: "狂暴契约", description: "兽潮额外攻击+1次（共3次），兽潮伤害提升至80%，契约满层时召唤兽暴击率+30%。", effects: { summonDamageBonus: 0.10, beastTideCount: 1, beastTideDamage: 0.20, contractCritBonus: 0.30 } },
          guard: { name: "灵魂链接", description: "守护状态伤害吸收提升至70%，守护期间召唤兽受到伤害-30%，守护结束时恢复你20%最大HP。", effects: { summonDamageBonus: 0.10, guardDamageAbsorb: 0.20, guardDamageReduction: 0.30, guardEndHeal: 0.20 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          assault: { name: "万兽之王", description: "召唤系技能等级+1，可同时召唤2只召唤兽，兽潮变为「万兽奔腾」（5次攻击，每次100%伤害，最后一击必定暴击），契约上限+2层。", effects: { skillLevelBonus: 1, maxSummons: 2, beastTideCount: 2, beastTideDamage: 0.20, beastTideFinalCrit: true, contractMax: 2 } },
          guard: { name: "契约之主", description: "召唤系技能等级+1，召唤兽HP+50%，守护变为「不朽契约」（伤害吸收100%+召唤兽无敌+你受到致命伤害时召唤兽牺牲替死，每场1次），契约上限+2层。", effects: { skillLevelBonus: 1, summonHpBonus: 0.40, guardDamageAbsorb: 0.30, guardInvincible: true, guardSacrifice: true, contractMax: 2 } }
        }
      }
    ]
  },

  summon_talent_link: {
    id: "summon_talent_link",
    name: "灵魂链接",
    element: "summon",
    rarity: "uncommon",
    type: "growth",
    description: "与召唤兽灵魂相连，共享力量，共享生命。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "灵魂链接",
        description: "召唤兽伤害+20%，继承30%属性。",
        effects: { summonDamageBonus: 0.20, inheritStats: 0.30 }
      },
      {
        level: 3, stage: "特性", name: "生命共享",
        description: "你和召唤兽互相分担伤害（各承受50%），且双方每回合恢复3%HP。",
        effects: { damageShare: 0.50, sharedHpRegen: 0.03 }
      },
      {
        level: 5, stage: "进化", name: "灵魂融合",
        description: "召唤兽在场时，你的伤害+25%，你的防御+25%。",
        effects: { summonMasterDamageBonus: 0.25, summonMasterDefBonus: 0.25 }
      },
      {
        level: 7, stage: "延伸", name: "灵魂爆发",
        description: "召唤兽死亡时爆发灵魂能量，对所有敌人造成召唤兽攻击力200%的伤害，并为你恢复50%HP。",
        effects: { summonDeathBurst: 2.00, summonDeathHeal: 0.50 }
      },
      {
        level: 10, stage: "终极", name: "人兽合一",
        description: "召唤兽属性继承提升至60%，召唤兽在场时你免疫所有负面状态。",
        effects: { inheritStats: 0.30, summonDebuffImmunity: true }
      }
    ]
  },

  summon_talent_double: {
    id: "summon_talent_double",
    name: "双重召唤",
    element: "summon",
    rarity: "rare",
    type: "growth",
    description: "天赋异禀，可同时召唤多只召唤兽。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "双重召唤",
        description: "25%概率同时召唤2只召唤兽。",
        effects: { doubleSummonChance: 0.25 }
      },
      {
        level: 3, stage: "特性", name: "兽群领袖",
        description: "双重召唤概率+15%，每多一只召唤兽，所有召唤兽伤害+10%。",
        effects: { doubleSummonChance: 0.15, packBonus: 0.10 }
      },
      {
        level: 5, stage: "进化", name: "三重召唤",
        description: "可同时召唤3只召唤兽，且召唤兽持续时间+2回合。",
        effects: { maxSummons: 3, summonDurationBonus: 2 }
      },
      {
        level: 7, stage: "延伸", name: "召唤潮",
        description: "召唤时有20%概率额外召唤一只随机野兽（不占用召唤位，持续3回合）。",
        effects: { extraSummonChance: 0.20, extraSummonDuration: 3 }
      },
      {
        level: 10, stage: "终极", name: "千军万马",
        description: "双重召唤概率+30%，所有召唤兽伤害+30%，召唤兽攻击时有10%概率再次召唤。",
        effects: { doubleSummonChance: 0.30, summonDamageBonus: 0.30, chainSummonChance: 0.10 }
      }
    ]
  },

  summon_talent_king: {
    id: "summon_talent_king",
    name: "兽王",
    element: "summon",
    rarity: "epic",
    type: "growth",
    description: "天生的兽王，万兽臣服。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "兽王",
        description: "召唤兽伤害+40%，召唤兽等级+2。",
        effects: { summonDamageBonus: 0.40, summonLevelBonus: 2 }
      },
      {
        level: 3, stage: "特性", name: "兽王威压",
        description: "战斗开始时降低敌方全体20%攻击和防御（威压效果），持续3回合。",
        effects: { kingIntimidate: true, intimidateAtkDown: 0.20, intimidateDefDown: 0.20, intimidateDuration: 3 }
      },
      {
        level: 5, stage: "进化", name: "兽群冲锋",
        description: "召唤兽攻击时30%概率发动冲锋，对所有敌人造成150%伤害并击退行动条。",
        effects: { summonChargeChance: 0.30, summonChargeDamage: 1.50, summonChargeKnockback: true }
      },
      {
        level: 7, stage: "延伸", name: "兽王之怒",
        description: "召唤兽暴击率+25%，暴击伤害+50%，召唤兽HP低于30%时伤害+50%。",
        effects: { summonCritRate: 0.25, summonCritDamage: 0.50, summonEnrage: 0.50 }
      },
      {
        level: 10, stage: "终极", name: "万兽之王·领域",
        description: "召唤兽等级+3，伤害+50%，战斗开始立即召唤一只精英野兽助战。",
        effects: { summonLevelBonus: 1, summonDamageBonus: 0.50, openingSummon: true }
      }
    ]
  },

  summon_talent_legendary: {
    id: "summon_talent_legendary",
    name: "天生召唤",
    element: "summon",
    rarity: "legendary",
    type: "innate",
    description: "万中无一的召唤系天生天赋，天生拥有契约之力，可与强大生灵建立契约。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      summonDamageBonus: 0.60,
      maxSummons: 3,
      summonHasTalent: true,
      summonLevelBonus: 3,
      skillLevelBonus: 1
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "召唤·契约之主",
        description: "召唤兽伤害+60%，可同时召唤3只，召唤兽自带天赋，召唤兽等级+3，召唤系技能等级+1。",
        effects: {
          summonDamageBonus: 0.60, maxSummons: 3, summonHasTalent: true,
          summonLevelBonus: 3, skillLevelBonus: 1
        }
      }
    ]
  },

  // ================================================================
  // 植物系天赋
  // ================================================================

  // v2.2.0更新：状态叠加型 - 生长层数
  plant_talent_basic: {
    id: "plant_talent_basic",
    name: "草木亲和",
    element: "plant",
    rarity: "common",
    type: "growth",
    mechanism: "state",
    stateType: "growth",
    stateMax: 8,
    description: "与自然草木亲和，每回合自动生长，层数越高植物系技能越强。后期发力，越战越强。Lv5解锁主动技能「绽放」，可选择绽放流/缠绕流/共生流。",
    maxLevel: 10,
    activeSkill: {
      id: "plant_active_bloom",
      name: "绽放",
      description: "消耗所有生长层数，每层造成30%攻击力AOE伤害。",
      cooldown: 3,
      growthConsumeAll: true,
      damagePerStack: 0.30,
      aoe: true
    },
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "草木亲和",
        description: "植物系技能伤害+15%，攻击附加1层中毒（最多3层，每层5%攻击力伤害/回合），控制命中率+10%。",
        effects: { damageBonus: 0.15, poisonStack: true, poisonMax: 3, poisonDamage: 0.05, plantControlHitRate: 0.10 }
      },
      {
        level: 3, stage: "特性", name: "藤蔓缠绕",
        description: "束缚类技能持续+1回合，中毒每层使目标速度-5%。",
        effects: { bindDurationBonus: 1, poisonSpeedDown: 0.05 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的自然之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "poison",
            name: "毒伤",
            description: "毒伤流：中毒满3层时触发「毒爆」，造成目标已损失HP20%的植物系伤害，毒爆后刷新中毒。",
            effects: { damageBonus: 0.10, poisonBurstOnMax: true, poisonBurstDamage: 0.20, poisonBurstRefresh: true }
          },
          {
            id: "control",
            name: "控制",
            description: "控制流：中毒满3层时触发「藤蔓束缚」，束缚目标2回合（无法行动），束缚期间目标防御-30%。",
            effects: { damageBonus: 0.10, poisonBindOnMax: true, bindDuration: 2, bindDefenseDown: 0.30 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          poison: { name: "致命毒素", description: "中毒伤害每回合递增15%（最多+75%），毒爆伤害提升至已损失HP35%，中毒目标防御-20%。", effects: { damageBonus: 0.10, poisonEscalation: 0.15, poisonEscalationMax: 0.75, poisonBurstDamage: 0.15, poisonDefenseDown: 0.20 } },
          control: { name: "荆棘领域", description: "束缚时间+1回合，束缚结束时触发荆棘爆发（对周围敌人造成20%最大HP伤害），每回合开始有25%概率束缚最低HP敌人。", effects: { damageBonus: 0.10, bindDuration: 1, bindExplosion: 0.20, autoBindChance: 0.25 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          poison: { name: "自然之怒", description: "植物系技能等级+1，中毒上限+2层，毒爆变为「万毒归宗」（已损失HP50%伤害+真实伤害+中毒不驱散），中毒目标HP低于30%时伤害翻倍。", effects: { skillLevelBonus: 1, poisonMax: 2, poisonBurstDamage: 0.15, poisonBurstTrue: true, poisonUnpurgeable: true, poisonExecute: true } },
          control: { name: "森罗之主", description: "植物系技能等级+1，束缚变为「森罗万象」（无法驱散+每回合10%最大HP伤害+攻击-40%），束缚结束后目标眩晕1回合。", effects: { skillLevelBonus: 1, bindUnpurgeable: true, bindHpDrain: 0.10, bindAttackDown: 0.40, bindEndStun: 1 } }
        }
      }
    ]
  },

  plant_talent_poison: {
    id: "plant_talent_poison",
    name: "剧毒精通",
    element: "plant",
    rarity: "uncommon",
    type: "growth",
    description: "精通植物毒素，让敌人在痛苦中慢慢死去。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "剧毒精通",
        description: "中毒效果伤害+25%，持续时间+1回合。",
        effects: { poisonDamageBonus: 0.25, poisonDurationBonus: 1 }
      },
      {
        level: 3, stage: "特性", name: "腐蚀",
        description: "中毒目标防御-15%。",
        effects: { poisonDefenseReduction: 0.15 }
      },
      {
        level: 5, stage: "进化", name: "剧毒蔓延",
        description: "中毒目标行动时，20%概率将中毒传染给相邻敌人（PVE中为另一个敌人）。",
        effects: { poisonSpreadChance: 0.20 }
      },
      {
        level: 7, stage: "延伸", name: "致命毒素",
        description: "中毒效果每回合伤害递增10%（最多递增50%）。",
        effects: { poisonEscalation: 0.10, poisonEscalationMax: 0.50 }
      },
      {
        level: 10, stage: "终极", name: "万毒归宗",
        description: "中毒效果伤害+50%，目标HP低于30%时，中毒伤害翻倍。",
        effects: { poisonDamageBonus: 0.50, poisonExecuteThreshold: 0.30 }
      }
    ]
  },

  plant_talent_legendary: {
    id: "plant_talent_legendary",
    name: "世界树之种",
    element: "plant",
    rarity: "legendary",
    type: "innate",
    description: "体内蕴含世界树的种子，与自然万物相连。出生即达他人修炼一生的境界。",
    maxLevel: 1,
    effects: {
      damageBonus: 0.50,
      allHealingBonus: 0.20,
      maxHpBonus: 0.20,
      thornArmor: 0.20
    },
    evolutions: [
      {
        level: 1, stage: "终极", name: "世界树·生机",
        description: "植物系技能伤害+50%，所有治疗效果+20%，最大HP+20%，受到近战攻击反弹20%伤害。",
        effects: {
          damageBonus: 0.50, allHealingBonus: 0.20,
          maxHpBonus: 0.20, thornArmor: 0.20
        }
      }
    ]
  },

  // v2.9.5: 植物系rare天赋 - 共生（续航型）
  plant_talent_symbiosis: {
    id: "plant_talent_symbiosis",
    name: "共生",
    element: "plant",
    rarity: "rare",
    type: "growth",
    description: "与植物建立共生关系，从自然中汲取生命力。越战越勇，生生不息。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "共生",
        description: "植物系技能命中时恢复5%最大HP，HP低于50%时植物系伤害+15%。",
        effects: { plantLifesteal: 0.05, plantLowHpBonus: 0.15, plantLowHpThreshold: 0.50 }
      },
      {
        level: 3, stage: "特性", name: "生命汲取",
        description: "植物系技能命中恢复提升至8%，击杀敌人时恢复20%最大HP。",
        effects: { plantLifesteal: 0.08, plantKillHeal: 0.20 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "你的共生之力开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "nourish",
            name: "滋养",
            description: "滋养流：每回合开始恢复5%最大HP，所有治疗效果+30%。",
            effects: { plantHpRegen: 0.05, allHealingBonus: 0.30 }
          },
          {
            id: "thorn",
            name: "荆棘共生",
            description: "反伤流：受到攻击时反弹15%植物系伤害，反弹伤害时恢复2%最大HP。",
            effects: { plantThornReflect: 0.15, plantThornHeal: 0.02 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          nourish: { name: "生命之泉", description: "每回合恢复8%最大HP，治疗效果+50%，HP低于30%时恢复翻倍。", effects: { plantHpRegen: 0.08, allHealingBonus: 0.50, plantLowHpRegenDouble: true, plantLowHpThreshold: 0.30 } },
          thorn: { name: "荆棘之噬", description: "反弹25%植物系伤害，反弹恢复4%HP，反弹有20%概率附加1层中毒。", effects: { plantThornReflect: 0.25, plantThornHeal: 0.04, plantThornPoisonChance: 0.20 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          nourish: { name: "万物复苏", description: "每回合恢复12%最大HP，治疗效果+80%，HP低于30%时植物系伤害+50%。", effects: { plantHpRegen: 0.12, allHealingBonus: 0.80, plantLowHpBonus: 0.50, plantLowHpThreshold: 0.30 } },
          thorn: { name: "共生之刺", description: "反弹40%植物系伤害，反弹恢复6%HP，反弹必定附加1层中毒，受到致命伤害时保留1HP（每场战斗1次）。", effects: { plantThornReflect: 0.40, plantThornHeal: 0.06, plantThornPoisonChance: 1.0, plantSurviveLethal: true } }
        }
      }
    ]
  },

  // v2.9.5: 植物系epic天赋 - 森林领主（场控型）
  plant_talent_forest_lord: {
    id: "plant_talent_forest_lord",
    name: "森林领主",
    element: "plant",
    rarity: "epic",
    type: "growth",
    description: "被森林认可的领主，战斗时召唤森林领域，万物生长，敌人在自然之怒下颤抖。",
    maxLevel: 10,
    evolutions: [
      {
        level: 1, stage: "觉醒", name: "森林领域",
        description: "战斗开始展开森林领域，敌人每回合受到10%攻击力植物系伤害+速度-10%，玩家植物系伤害+15%。",
        effects: { forestField: true, forestFieldDamage: 0.10, forestFieldSlow: 0.10, damageBonus: 0.15 }
      },
      {
        level: 3, stage: "特性", name: "领域加深",
        description: "领域伤害提升至15%，减速-15%，每回合附加1层中毒，玩家植物系伤害+25%。",
        effects: { forestFieldDamage: 0.15, forestFieldSlow: 0.15, forestFieldPoison: 1, damageBonus: 0.25 }
      },
      {
        level: 5, stage: "进化", name: "分支选择",
        description: "森林领域的力量开始蜕变，选择进化方向：",
        branchChoices: [
          {
            id: "erosion",
            name: "侵蚀领域",
            description: "侵蚀流：领域内敌人防御-25%，受到所有伤害+15%。",
            effects: { forestFieldDefenseDown: 0.25, forestFieldDamageTaken: 0.15 }
          },
          {
            id: "life",
            name: "生命领域",
            description: "生命流：领域内玩家每回合恢复8%最大HP，植物系技能伤害+20%。",
            effects: { forestFieldHpRegen: 0.08, damageBonus: 0.20 }
          }
        ]
      },
      {
        level: 7, stage: "延伸",
        branchEffects: {
          erosion: { name: "腐朽之地", description: "领域内敌人防御-40%，受到所有伤害+25%，领域伤害提升至20%。", effects: { forestFieldDefenseDown: 0.40, forestFieldDamageTaken: 0.25, forestFieldDamage: 0.20 } },
          life: { name: "生命之森", description: "领域内玩家每回合恢复12%最大HP，植物系技能伤害+35%，领域伤害提升至20%。", effects: { forestFieldHpRegen: 0.12, damageBonus: 0.35, forestFieldDamage: 0.20 } }
        }
      },
      {
        level: 10, stage: "终极",
        branchEffects: {
          erosion: { name: "万木枯荣", description: "领域内敌人防御-50%，受到所有伤害+35%，领域伤害30%，敌人进入领域时被束缚1回合（无法行动）。", effects: { forestFieldDefenseDown: 0.50, forestFieldDamageTaken: 0.35, forestFieldDamage: 0.30, forestFieldBindOnEnter: 1 } },
          life: { name: "世界树领域", description: "领域内玩家每回合恢复15%最大HP，植物系技能伤害+50%，领域伤害30%，玩家在领域内受到伤害-20%。", effects: { forestFieldHpRegen: 0.15, damageBonus: 0.50, forestFieldDamage: 0.30, forestFieldDamageReduction: 0.20 } }
        }
      }
    ]
  }
};

// 稀有度配置
export const TALENT_RARITY_CONFIG = {
  common: {
    name: "普通",
    color: "#ffffff",
    weight: 60
  },
  uncommon: {
    name: "优秀",
    color: "#4ade80",
    weight: 25
  },
  rare: {
    name: "稀有",
    color: "#60a5fa",
    weight: 10
  },
  epic: {
    name: "史诗",
    color: "#c084fc",
    weight: 4
  },
  legendary: {
    name: "传说",
    color: "#fbbf24",
    weight: 1
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataTalents, TALENT_RARITY_CONFIG };
}

export default DataTalents;
