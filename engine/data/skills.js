/**
 * 技能数据
 * 从 game-data.js 拆分而来
 */

const DataSkills = {
  basic_attack: {
    id: "basic_attack",
    name: "普通攻击",
    description: "基础的物理攻击",
    element: "neutral",
    type: "damage",
    mpCost: 0,
    baseDamage: 0,
    damageMultiplier: 1,
    hitRate: 0.95,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶"
  },
  fire_bolt: {
    id: "fire_bolt",
    name: "火滋·灼烧",
    description: "初阶火系魔法，发射一枚火球，造成燃烧效果（可叠加3层，层数越高持续伤害越高）",
    element: "fire",
    type: "damage",
    mpCost: 8,
    baseDamage: 15,
    damageMultiplier: 1.2,
    hitRate: 0.9,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "燃烧",
        type: "burn",
        element: "fire",
        dotDamage: 6,
        duration: 3,
        chance: 0.8,
        stacks: 1,
        maxStacks: 3
      }
    ]
  },
  fire_rain: {
    id: "fire_rain",
    name: "火滋·焚天",
    description: "初阶火系二级魔法，召唤火雨，伤害更高",
    element: "fire",
    type: "damage",
    mpCost: 15,
    baseDamage: 30,
    damageMultiplier: 1.3,
    hitRate: 0.85,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "燃烧",
        type: "burn",
        element: "fire",
        dotDamage: 6,
        duration: 3,
        chance: 0.7,
        stacks: 1,
        maxStacks: 3
      }
    ]
  },
  ice_spike: {
    id: "ice_spike",
    name: "冰蔓·冻结",
    description: "初阶冰系魔法，发射冰刺，累积冻结值。冻结值满100时敌人被冻结1回合，冻结中受火系伤害×2",
    element: "ice",
    type: "damage",
    mpCost: 8,
    baseDamage: 12,
    damageMultiplier: 1.1,
    hitRate: 0.92,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "冰冻",
        type: "freeze",
        element: "ice",
        value: 35,
        duration: 3,
        chance: 1.0
      }
    ]
  },
  ice_shield: {
    id: "ice_shield",
    name: "冰蔓·冰铠",
    description: "初阶冰系防御魔法，用冰甲保护自己，生成40点护盾并提升防御",
    element: "ice",
    type: "buff",
    mpCost: 10,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      {
        name: "冰铠护盾",
        type: "shield",
        element: "ice",
        value: 40,
        duration: 99,
        chance: 1
      },
      {
        name: "冰甲",
        type: "defense_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: 8
        }
      }
    ]
  },
  thunder_bolt: {
    id: "thunder_bolt",
    name: "雷印·蟒痕",
    description: "初阶雷系魔法，释放雷电，高暴击，有几率麻痹敌人使其跳过回合。对湿润目标伤害×2（感电）",
    element: "thunder",
    type: "damage",
    mpCost: 10,
    baseDamage: 18,
    damageMultiplier: 1.15,
    hitRate: 0.88,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "麻痹",
        type: "stun",
        element: "thunder",
        duration: 1,
        chance: 0.3
      }
    ]
  },
  thunder_chain: {
    id: "thunder_chain",
    name: "雷印·千钧",
    description: "初阶雷系二级魔法，连锁雷电，伤害更高",
    element: "thunder",
    type: "damage",
    mpCost: 18,
    baseDamage: 35,
    damageMultiplier: 1.2,
    hitRate: 0.85,
    critRate: 0.2,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "麻痹",
        type: "stun",
        element: "thunder",
        duration: 1,
        chance: 0.4
      }
    ]
  },
  earth_shield: {
    id: "earth_shield",
    name: "土系·岩盾",
    description: "初阶土系防御魔法，召唤岩石护盾，吸收50点伤害。护盾存在时防御翻倍",
    element: "earth",
    type: "buff",
    mpCost: 8,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 2,
    tier: "初阶",
    statusEffects: [
      {
        name: "岩盾",
        type: "shield",
        element: "earth",
        value: 50,
        duration: 99,
        chance: 1
      },
      {
        name: "岩盾防御",
        type: "defense_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: 10
        }
      }
    ]
  },
  earth_spike: {
    id: "earth_spike",
    name: "土系·地刺",
    description: "初阶土系攻击魔法，从地下升起尖刺",
    element: "earth",
    type: "damage",
    mpCost: 9,
    baseDamage: 14,
    damageMultiplier: 1.1,
    hitRate: 0.9,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "地刺减速",
        type: "slow",
        element: "earth",
        duration: 2,
        chance: 0.5,
        statModifiers: {
          speed: -6
        }
      }
    ]
  },
  wind_blade: {
    id: "wind_blade",
    name: "风轨·疾行",
    description: "初阶风系魔法，发射风刃，高命中",
    element: "wind",
    type: "damage",
    mpCost: 7,
    baseDamage: 10,
    damageMultiplier: 1.05,
    hitRate: 0.98,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "风刃减速",
        type: "slow",
        element: "wind",
        duration: 2,
        chance: 0.4,
        statModifiers: {
          speed: -4
        }
      }
    ]
  },
  wind_speed: {
    id: "wind_speed",
    name: "风轨·飘影",
    description: "初阶风系辅助魔法，提升自身速度和闪避率，风系法师的核心生存技能",
    element: "wind",
    type: "buff",
    mpCost: 8,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      {
        name: "风之加速",
        type: "speed_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          speed: 8
        }
      },
      {
        name: "风之闪避",
        type: "evasion_up",
        duration: 3,
        chance: 1,
        evasionMod: 0.25
      }
    ]
  },
  water_heal: {
    id: "water_heal",
    name: "水系·治愈",
    description: "初阶水系魔法，恢复生命值",
    element: "water",
    type: "heal",
    mpCost: 10,
    baseHeal: 30,
    healMultiplier: 1,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 0,
    tier: "初阶"
  },
  water_chain: {
    id: "water_chain",
    name: "水系·水锁",
    description: "初阶水系控制魔法，用水链束缚敌人并使其湿润。湿润目标受雷系伤害×2（感电）",
    element: "water",
    type: "damage",
    mpCost: 8,
    baseDamage: 8,
    damageMultiplier: 1,
    hitRate: 0.85,
    critRate: 0.03,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "湿润",
        type: "wet",
        element: "water",
        duration: 3,
        chance: 1.0
      },
      {
        name: "束缚",
        type: "slow",
        duration: 2,
        chance: 0.6,
        statModifiers: {
          speed: -5
        }
      }
    ]
  },
  light_ray: {
    id: "light_ray",
    name: "光系·圣光",
    description: "初阶光系魔法，释放圣光，对暗影系有额外伤害",
    element: "light",
    type: "damage",
    mpCost: 9,
    baseDamage: 14,
    damageMultiplier: 1.1,
    hitRate: 0.95,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "致盲",
        type: "slow",
        element: "light",
        duration: 2,
        chance: 0.3,
        hitRateMod: -0.2
      }
    ]
  },
  light_blind: {
    id: "light_blind",
    name: "光耀·失明",
    description: "光系初阶魔法，近距离爆发强光，高概率使目标失明。对视觉依赖型敌人效果显著，对虫族等视觉弱的敌人效果减半。",
    element: "light",
    type: "debuff",
    mpCost: 12,
    baseDamage: 0,
    damageMultiplier: 0,
    hitRate: 1.0,
    critRate: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      {
        name: "光耀失明",
        type: "blind",
        element: "light",
        duration: 3,
        chance: 0.85,
        hitRateMod: -0.5
      }
    ],
    isCanon: true,
    source: "第152章 谢文峰使用光耀·失明"
  },
  dark_bolt: {
    id: "dark_bolt",
    name: "暗影·腐蚀",
    description: "初阶暗影系魔法，暗影弹，施加诅咒效果（可叠加2层，每层降低攻击和防御）",
    element: "dark",
    type: "damage",
    mpCost: 9,
    baseDamage: 16,
    damageMultiplier: 1.1,
    hitRate: 0.88,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "诅咒",
        type: "curse",
        element: "dark",
        duration: 3,
        chance: 0.7,
        stacks: 1,
        maxStacks: 2,
        statModifiers: {
          attack: -5,
          defense: -5
        }
      }
    ]
  },
  light_shield: {
    id: "light_shield",
    name: "光系·圣盾",
    description: "初阶光系防御魔法，用圣光凝聚护盾，净化所有负面状态并提升防御。光系核心生存技能",
    element: "light",
    type: "buff",
    mpCost: 12,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      {
        name: "净化",
        type: "cleanse",
        element: "light",
        chance: 1.0
      },
      {
        name: "圣盾",
        type: "defense_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: 12
        }
      }
    ]
  },
  dark_cloak: {
    id: "dark_cloak",
    name: "暗影·潜行",
    description: "初阶暗影系辅助魔法，用暗影包裹自身，提升闪避和暴击",
    element: "dark",
    type: "buff",
    mpCost: 10,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      {
        name: "暗影潜行",
        type: "evasion_up",
        element: "dark",
        duration: 3,
        chance: 1,
        evasionMod: 0.3
      },
      {
        name: "暗影暴击",
        type: "speed_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          speed: 5
        }
      }
    ]
  },
  fire_burst: {
    id: "fire_burst",
    name: "火滋·爆裂",
    description: "初阶火系三级魔法，火球爆炸造成大范围伤害，高灼烧概率",
    element: "fire",
    type: "damage",
    mpCost: 22,
    baseDamage: 45,
    damageMultiplier: 1.4,
    hitRate: 0.85,
    critRate: 0.12,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "燃烧",
        type: "burn",
        element: "fire",
        dotDamage: 8,
        duration: 3,
        chance: 0.8,
        stacks: 2,
        maxStacks: 3
      }
    ]
  },
  ice_storm: {
    id: "ice_storm",
    name: "冰蔓·冰封",
    description: "初阶冰系三级魔法，召唤冰风暴，高伤害并有几率冻结",
    element: "ice",
    type: "damage",
    mpCost: 20,
    baseDamage: 38,
    damageMultiplier: 1.3,
    hitRate: 0.88,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "冰冻",
        type: "freeze",
        element: "ice",
        value: 60,
        duration: 3,
        chance: 1.0
      }
    ]
  },
  thunder_strike: {
    id: "thunder_strike",
    name: "雷印·怒击",
    description: "初阶雷系三级魔法，强力雷击，极高暴击率",
    element: "thunder",
    type: "damage",
    mpCost: 25,
    baseDamage: 50,
    damageMultiplier: 1.35,
    hitRate: 0.85,
    critRate: 0.25,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "麻痹",
        type: "stun",
        element: "thunder",
        duration: 1,
        chance: 0.5
      }
    ]
  },
  earth_quake: {
    id: "earth_quake",
    name: "土系·震裂",
    description: "初阶土系三级魔法，引发地震，造成伤害并降低敌人速度",
    element: "earth",
    type: "damage",
    mpCost: 18,
    baseDamage: 35,
    damageMultiplier: 1.25,
    hitRate: 0.9,
    critRate: 0.06,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "震荡",
        type: "slow",
        element: "earth",
        duration: 3,
        chance: 0.7,
        statModifiers: {
          speed: -8
        }
      }
    ]
  },
  wind_tornado: {
    id: "wind_tornado",
    name: "风轨·龙卷",
    description: "初阶风系三级魔法，召唤龙卷风，高命中多段伤害",
    element: "wind",
    type: "damage",
    mpCost: 20,
    baseDamage: 40,
    damageMultiplier: 1.25,
    hitRate: 0.95,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "龙卷减速",
        type: "slow",
        element: "wind",
        duration: 3,
        chance: 0.8,
        statModifiers: {
          speed: -10
        }
      }
    ]
  },

  // ===== 植物系技能 =====
  plant_vine_bind: {
    id: "plant_vine_bind",
    name: "藤变·缠绕",
    description: "植物系初阶魔法，从地面催生藤蔓束缚敌人，使其无法行动。对力量型敌人可被挣脱。",
    element: "plant",
    type: "control",
    mpCost: 10,
    baseDamage: 5,
    damageMultiplier: 0.5,
    hitRate: 0.85,
    critRate: 0,
    targetType: "enemy",
    cooldown: 2,
    tier: "初阶",
    statusEffects: [
      {
        name: "藤蔓束缚",
        type: "bind",
        element: "plant",
        duration: 2,
        chance: 0.75,
        canBeBrokenByStrength: true
      }
    ],
    isCanon: true,
    source: "第161章 庄离风使用藤变·缠绕"
  },

  plant_forest_prison: {
    id: "plant_forest_prison",
    name: "坤之森·囚牢",
    description: "植物系中阶魔法，投下种子催生大片怪树怪藤形成森林囚牢，追踪生命封锁一切位移。暗影系可借阴影穿行。",
    element: "plant",
    type: "control",
    mpCost: 30,
    baseDamage: 10,
    damageMultiplier: 0.3,
    hitRate: 0.95,
    critRate: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "中阶",
    statusEffects: [
      {
        name: "森之囚牢",
        type: "bind",
        element: "plant",
        duration: 4,
        chance: 0.9,
        blocksMovement: true,
        blocksDodge: true,
        shadowCanPass: true
      }
    ],
    isCanon: true,
    source: "第167章 牧奴娇使用坤之森·囚牢"
  },

  water_wave: {
    id: "water_wave",
    name: "水系·巨浪",
    description: "初阶水系三级魔法，巨浪冲击造成伤害并恢复自身生命",
    element: "water",
    type: "damage",
    mpCost: 18,
    baseDamage: 30,
    damageMultiplier: 1.2,
    hitRate: 0.9,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "湿润",
        type: "wet",
        element: "water",
        duration: 3,
        chance: 1.0
      }
    ]
  },
  light_judgment: {
    id: "light_judgment",
    name: "光系·裁决",
    description: "初阶光系三级魔法，圣光裁决，对暗影和妖魔系有巨额伤害",
    element: "light",
    type: "damage",
    mpCost: 22,
    baseDamage: 42,
    damageMultiplier: 1.35,
    hitRate: 0.92,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "裁决致盲",
        type: "slow",
        element: "light",
        duration: 2,
        chance: 0.5,
        hitRateMod: -0.3
      }
    ]
  },
  dark_curse: {
    id: "dark_curse",
    name: "暗影·诅咒",
    description: "初阶暗影系三级魔法，暗影诅咒，持续削弱敌人",
    element: "dark",
    type: "damage",
    mpCost: 20,
    baseDamage: 35,
    damageMultiplier: 1.2,
    hitRate: 0.88,
    critRate: 0.12,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    statusEffects: [
      {
        name: "诅咒",
        type: "curse",
        element: "dark",
        duration: 4,
        chance: 0.9,
        stacks: 2,
        maxStacks: 3,
        statModifiers: {
          attack: -6,
          defense: -6
        }
      }
    ]
  },
  fire_burn_bone: {
    id: "fire_burn_bone",
    name: "火滋·焚骨",
    description: "初阶火系二级魔法，火焰侵入敌人体内燃烧骨骼，造成高额持续伤害，可穿透皮毛防御。",
    element: "fire",
    type: "damage",
    mpCost: 18,
    baseDamage: 45,
    damageMultiplier: 1.5,
    hitRate: 0.9,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 0,
    tier: "初阶",
    ignoreDefense: 0.3,
    statusEffects: [
      {
        name: "燃烧",
        type: "burn",
        element: "fire",
        dotDamage: 8,
        duration: 3,
        chance: 0.9,
        stacks: 2,
        maxStacks: 3
      }
    ]
  },
  earth_shift: {
    id: "earth_shift",
    name: "地波·挪移",
    description: "初阶土系魔法，地面产生涟漪，使用者可短距离瞬移，躲避攻击。",
    element: "earth",
    type: "buff",
    mpCost: 15,
    targetType: "self",
    cooldown: 2,
    tier: "初阶",
    statusEffects: [
      {
        name: "挪移闪避",
        type: "evasion_up",
        element: "earth",
        duration: 2,
        chance: 1,
        evasionMod: 0.4
      },
      {
        name: "挪移加速",
        type: "speed_up",
        duration: 2,
        chance: 1,
        statModifiers: {
          speed: 10
        }
      }
    ]
  },
  wild_charge: {
    id: "wild_charge",
    name: "狂野冲撞",
    description: "幽狼兽的狂暴冲撞技能，高速冲向敌人造成重创，有几率击晕。",
    element: "neutral",
    type: "damage",
    mpCost: 10,
    baseDamage: 30,
    damageMultiplier: 1.3,
    hitRate: 0.85,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 2,
    tier: "初阶",
    statusEffects: [
      {
        name: "击晕",
        type: "stun",
        duration: 1,
        chance: 0.3
      }
    ]
  },
  vine_bind: {
    id: "vine_bind",
    name: "藤蔓缠绕",
    description: "妖藤的藤蔓捆绑技能，束缚敌人使其无法行动，持续造成伤害。",
    element: "earth",
    type: "damage",
    mpCost: 12,
    baseDamage: 15,
    damageMultiplier: 1.0,
    hitRate: 0.8,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 2,
    tier: "初阶",
    statusEffects: [
      {
        name: "缠绕",
        type: "stun",
        duration: 2,
        chance: 0.6
      }
    ]
  },
  thorn_shot: {
    id: "thorn_shot",
    name: "荆棘射击",
    description: "妖藤发射尖锐荆棘，远程攻击敌人。",
    element: "earth",
    type: "damage",
    mpCost: 8,
    baseDamage: 18,
    damageMultiplier: 1.1,
    hitRate: 0.9,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 1,
    tier: "初阶"
  },
  fire_soul: {
    id: "fire_soul",
    name: "火滋·烈阳",
    description: "点燃内心的火焰，大幅提升攻击力，持续3回合",
    element: "fire",
    type: "buff",
    mpCost: 12,
    targetType: "self",
    cooldown: 4,
    tier: "初阶",
    statusEffects: [
      { name: "烈阳", type: "attack_up", element: "fire", duration: 3, chance: 1.0, statModifiers: { attack: 20 } }
    ]
  },
  ice_frost: {
    id: "ice_frost",
    name: "冰蔓·霜寒",
    description: "释放寒气侵蚀敌人，降低其攻击力和速度，持续3回合",
    element: "ice",
    type: "debuff",
    mpCost: 10,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      { name: "霜寒", type: "attack_down", element: "ice", duration: 3, chance: 0.9, statModifiers: { attack: -12, speed: -5 } }
    ]
  },
  thunder_drive: {
    id: "thunder_drive",
    name: "雷印·励行",
    description: "雷电激发身体潜能，提升速度和命中率，持续3回合",
    element: "thunder",
    type: "buff",
    mpCost: 10,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      { name: "雷励", type: "speed_up", element: "thunder", duration: 3, chance: 1.0, statModifiers: { speed: 15 }, hitRateMod: 0.15 }
    ]
  },
  earth_mud: {
    id: "earth_mud",
    name: "土系·泥泞",
    description: "召唤泥泞困住敌人，大幅降低其速度和闪避，持续3回合",
    element: "earth",
    type: "debuff",
    mpCost: 10,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      { name: "泥泞", type: "slow", element: "earth", duration: 3, chance: 0.9, statModifiers: { speed: -15 }, evasionMod: -0.2 }
    ]
  },
  wind_barrier: {
    id: "wind_barrier",
    name: "风轨·风障",
    description: "在敌人周围制造乱流，降低其命中率，持续3回合",
    element: "wind",
    type: "debuff",
    mpCost: 8,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      { name: "风障", type: "accuracy_down", element: "wind", duration: 3, chance: 0.85, hitRateMod: -0.25 }
    ]
  },
  water_moist: {
    id: "water_moist",
    name: "水系·水润",
    description: "水元素包裹全身，提升防御并每回合恢复少量HP，持续3回合",
    element: "water",
    type: "buff",
    mpCost: 12,
    targetType: "self",
    cooldown: 4,
    tier: "初阶",
    statusEffects: [
      { name: "水润", type: "defense_up", element: "water", duration: 3, chance: 1.0, statModifiers: { defense: 15 }, regen: 8 }
    ]
  },
  light_blessing: {
    id: "light_blessing",
    name: "光系·圣光祝福",
    description: "圣光加持，同时提升攻击力和防御力，持续3回合",
    element: "light",
    type: "buff",
    mpCost: 15,
    targetType: "self",
    cooldown: 4,
    tier: "初阶",
    statusEffects: [
      { name: "圣光祝福", type: "attack_up", element: "light", duration: 3, chance: 1.0, statModifiers: { attack: 12, defense: 12 } }
    ]
  },
  dark_weakness: {
    id: "dark_weakness",
    name: "暗影·虚弱诅咒",
    description: "暗影力量侵蚀敌人，同时降低其攻击力和防御力，持续3回合",
    element: "dark",
    type: "debuff",
    mpCost: 12,
    targetType: "enemy",
    cooldown: 4,
    tier: "初阶",
    statusEffects: [
      { name: "虚弱诅咒", type: "curse", element: "dark", duration: 3, chance: 0.85, stacks: 1, maxStacks: 2, statModifiers: { attack: -10, defense: -10 } }
    ]
  },
  heal_light: {
    id: "heal_light",
    name: "治愈·微光",
    description: "温和的治愈之光，恢复30点生命值",
    element: "heal",
    type: "heal",
    mpCost: 8,
    baseHeal: 30,
    targetType: "self",
    cooldown: 0,
    tier: "初阶"
  },
  heal_holy: {
    id: "heal_holy",
    name: "治愈·圣光",
    description: "神圣的治愈之光，恢复60点生命值",
    element: "heal",
    type: "heal",
    mpCost: 15,
    baseHeal: 60,
    targetType: "self",
    cooldown: 2,
    tier: "初阶"
  },
  heal_cleanse: {
    id: "heal_cleanse",
    name: "治愈·净化",
    description: "清除所有负面状态，并恢复20点生命值",
    element: "heal",
    type: "heal",
    mpCost: 12,
    baseHeal: 20,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      { name: "净化", type: "cleanse", element: "heal", chance: 1.0 }
    ]
  },
  heal_revive: {
    id: "heal_revive",
    name: "治愈·复苏",
    description: "恢复40点生命值，并在接下来3回合每回合恢复15点",
    element: "heal",
    type: "heal",
    mpCost: 20,
    baseHeal: 40,
    targetType: "self",
    cooldown: 4,
    tier: "初阶",
    statusEffects: [
      { name: "复苏", type: "regen", element: "heal", duration: 3, chance: 1.0, regen: 15 }
    ]
  },
  summon_beast: {
    id: "summon_beast",
    name: "召唤·契约",
    description: "初阶召唤系魔法，召唤一只幽狼兽协助战斗，持续5回合。召唤兽每回合自动攻击敌人。",
    element: "summon",
    type: "summon",
    mpCost: 15,
    targetType: "self",
    cooldown: 3,
    tier: "初阶",
    summonData: {
      id: "shadow_wolf",
      name: "幽狼兽",
      maxHp: 80,
      attack: 25,
      defense: 10,
      speed: 15,
      duration: 5,
      icon: "🐺"
    }
  },
  summon_strengthen: {
    id: "summon_strengthen",
    name: "召唤·强化",
    description: "用星子之力强化召唤兽，提升其攻击和防御50%，持续3回合",
    element: "summon",
    type: "buff",
    mpCost: 10,
    targetType: "self",
    cooldown: 4,
    tier: "初阶",
    requiresSummon: true,
    statusEffects: [
      { name: "召唤强化", type: "summon_buff", duration: 3, chance: 1.0, attackBonus: 0.5, defenseBonus: 0.5 }
    ]
  },
  summon_rage: {
    id: "summon_rage",
    name: "召唤·狂暴",
    description: "刺激召唤兽进入狂暴状态，攻击翻倍，速度提升，但防御降低50%，持续2回合",
    element: "summon",
    type: "buff",
    mpCost: 12,
    targetType: "self",
    cooldown: 5,
    tier: "初阶",
    requiresSummon: true,
    statusEffects: [
      { name: "召唤狂暴", type: "summon_rage", duration: 2, chance: 1.0, attackBonus: 1.0, speedBonus: 0.5, defenseMalus: 0.5 }
    ]
  },
  summon_return: {
    id: "summon_return",
    name: "召唤·回收",
    description: "提前收回召唤兽，恢复召唤兽剩余生命值50%的MP",
    element: "summon",
    type: "special",
    mpCost: 0,
    targetType: "self",
    cooldown: 2,
    tier: "初阶",
    requiresSummon: true
  },
  thunder_whip: {
    id: "thunder_whip",
    name: "雷印·狂策",
    description: "2级雷系技能。雷电化为长鞭疯狂抽打目标，电弧持续传导造成麻痹。对力量型妖魔有特效。",
    element: "thunder",
    type: "damage",
    damage: 45,
    mpCost: 20,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶2级",
    statusEffects: [
      { name: "雷电麻痹", type: "stun", duration: 1, chance: 0.5 },
      { name: "感电", type: "electrified", duration: 3, chance: 1.0, defenseMalus: 0.2 }
    ]
  },
  ice_freeze: {
    id: "ice_freeze",
    name: "冰蔓·凝结",
    description: "2级冰系技能。飞霜凝结敌人脚下地面，蔓延至下肢冻结，大幅降低敌人移动速度。",
    element: "ice",
    type: "damage",
    damage: 25,
    mpCost: 18,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶2级",
    statusEffects: [
      { name: "冻结", type: "frozen", duration: 1, chance: 0.4, freezeValue: 35 },
      { name: "减速", type: "slow", duration: 3, chance: 1.0, speedMalus: 0.4 }
    ]
  },
  water_shield: {
    id: "water_shield",
    name: "水御·守护",
    description: "水系防御技能。数条水绸带编织成水之衣甲，吸收伤害并提升防御。",
    element: "water",
    type: "buff",
    mpCost: 15,
    targetType: "self",
    cooldown: 4,
    tier: "初阶",
    statusEffects: [
      { name: "水之守护", type: "shield", duration: 3, chance: 1.0, value: 40 },
      { name: "水之甲", type: "defense_up", duration: 3, chance: 1.0, statModifiers: { defense: 8 } }
    ]
  },
  earth_slow: {
    id: "earth_slow",
    name: "地波·迟缓",
    description: "土系控制技能。拍打地面产生地下波纹，迫使敌人向反方向挪动，降低其速度。",
    element: "earth",
    type: "debuff",
    mpCost: 12,
    targetType: "enemy",
    cooldown: 3,
    tier: "初阶",
    statusEffects: [
      { name: "地波迟缓", type: "slow", duration: 2, chance: 1.0, speedMalus: 0.5 },
      { name: "泥泞", type: "mud", duration: 2, chance: 0.6, accuracyMalus: 0.2 }
    ]
  },
  ice_cover: {
    id: "ice_cover",
    name: "冰蔓·覆盖",
    description: "3级冰系技能。狂雪降临，覆盖整个区域，将一切冻结成冰。范围极大，威力极强，是冰系初阶最强技能。",
    element: "ice",
    type: "damage",
    damage: 60,
    mpCost: 30,
    targetType: "enemy",
    cooldown: 5,
    tier: "初阶3级",
    statusEffects: [
      { name: "冰封", type: "frozen", duration: 2, chance: 0.7, freezeValue: 70 },
      { name: "极寒", type: "slow", duration: 4, chance: 1.0, speedMalus: 0.6 },
      { name: "冰伤", type: "attack_down", duration: 3, chance: 0.8, statModifiers: { attack: -8 } }
    ]
  },
  fire_burn_bone_lv3: {
    id: "fire_burn_bone_lv3",
    name: "火滋·爆裂",
    description: "3级火系技能。火焰爆裂，范围爆炸伤害，威力巨大。火滋的终极形态。",
    element: "fire",
    type: "damage",
    damage: 70,
    mpCost: 28,
    targetType: "enemy",
    cooldown: 4,
    tier: "初阶3级",
    statusEffects: [
      { name: "烈焰灼烧", type: "burn", duration: 4, chance: 1.0, stacks: 3, dotDamage: 10 },
      { name: "爆裂冲击", type: "stun", duration: 1, chance: 0.3 }
    ]
  },
  thunder_wrath: {
    id: "thunder_wrath",
    name: "雷印·怒击",
    description: "3级雷系技能。雷霆之怒，多道雷印同时轰击，威力霸道无比。雷系初阶最强技能，穿透力极强，无视大部分防御。",
    element: "thunder",
    type: "damage",
    damage: 75,
    mpCost: 32,
    targetType: "enemy",
    cooldown: 5,
    tier: "初阶3级",
    statusEffects: [
      { name: "雷霆麻痹", type: "stun", duration: 2, chance: 0.5 },
      { name: "感电", type: "electrified", duration: 3, chance: 1.0, damageBonus: 0.3 },
      { name: "雷霆穿透", type: "defense_down", duration: 3, chance: 0.7, statModifiers: { defense: -10 } }
    ]
  },

  // ========== 敌人专用技能 ==========
  wolf_howl: {
    id: "wolf_howl",
    name: "狼嚎",
    description: "魔狼发出嚎叫，提升自身攻击力，并可能召唤同伴。",
    element: "dark",
    type: "buff",
    mpCost: 15,
    targetType: "self",
    tier: "初阶",
    statusEffects: [
      { name: "嗜血", type: "attack_up", duration: 3, chance: 1.0, statModifiers: { attack: 8 } }
    ]
  },
  sky_dive: {
    id: "sky_dive",
    name: "俯冲攻击",
    description: "翼苍狼从高空俯冲而下，造成毁灭性的伤害，有几率眩晕。",
    element: "wind",
    type: "damage",
    baseDamage: 80,
    damageMultiplier: 1.8,
    mpCost: 40,
    targetType: "enemy",
    tier: "中阶",
    statusEffects: [
      { name: "眩晕", type: "stun", duration: 1, chance: 0.4 }
    ]
  },
  dark_claw: {
    id: "dark_claw",
    name: "暗爪",
    description: "进阶魔狼的利爪攻击，附带暗影能量，造成高额伤害。",
    element: "dark",
    type: "damage",
    baseDamage: 25,
    damageMultiplier: 1.2,
    mpCost: 12,
    targetType: "enemy",
    tier: "初阶",
    statusEffects: [
      { name: "撕裂", type: "bleed", duration: 3, chance: 0.5, dotDamage: 8 }
    ]
  },
  wolf_bite: {
    id: "wolf_bite",
    name: "撕咬",
    description: "三眼魔狼的强力撕咬，有概率造成眩晕。",
    element: "dark",
    type: "damage",
    baseDamage: 30,
    damageMultiplier: 1.3,
    mpCost: 15,
    targetType: "enemy",
    tier: "中阶",
    statusEffects: [
      { name: "眩晕", type: "stun", duration: 1, chance: 0.3 }
    ]
  },
  rat_bite: {
    id: "rat_bite",
    name: "巨鼠撕咬",
    description: "血纹巨魔鼠的凶猛撕咬，附带瘟疫效果。",
    element: "neutral",
    type: "damage",
    baseDamage: 35,
    damageMultiplier: 1.2,
    mpCost: 10,
    targetType: "enemy",
    tier: "中阶",
    statusEffects: [
      { name: "瘟疫", type: "poison", duration: 4, chance: 0.6, dotDamage: 10 }
    ]
  },
  blood_rage: {
    id: "blood_rage",
    name: "血纹狂暴",
    description: "血纹巨魔鼠进入狂暴状态，攻击力和速度大幅提升，但降低防御。",
    element: "neutral",
    type: "buff",
    mpCost: 20,
    targetType: "self",
    tier: "中阶",
    statusEffects: [
      { name: "狂暴", type: "rage", duration: 5, chance: 1.0, statModifiers: { attack: 25, speed: 10, defense: -8 } }
    ]
  },
  bone_spike: {
    id: "bone_spike",
    name: "骨刺射击",
    description: "骨刺狰狼射出背上的骨刺，远程攻击敌人。",
    element: "earth",
    type: "damage",
    baseDamage: 28,
    damageMultiplier: 1.1,
    mpCost: 14,
    targetType: "enemy",
    tier: "中阶",
    statusEffects: [
      { name: "穿刺", type: "defense_down", duration: 2, chance: 0.4, statModifiers: { defense: -5 } }
    ]
  },

  // ========== 中阶魔法（玩家） ==========
  fire_fist: {
    id: "fire_fist",
    name: "烈拳",
    description: "中阶火系魔法，凝聚火焰于拳上，爆发出毁灭性的一击。威力巨大，附带强烈灼烧效果。",
    element: "fire",
    type: "damage",
    mpCost: 35,
    baseDamage: 80,
    damageMultiplier: 1.8,
    hitRate: 0.85,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 0,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "烈炎灼烧",
        type: "burn",
        element: "fire",
        dotDamage: 15,
        duration: 4,
        chance: 0.9,
        stacks: 2,
        maxStacks: 5
      }
    ]
  },
  thunder_praise: {
    id: "thunder_praise",
    name: "霹雳·轰顶",
    description: "中阶雷系魔法。手指向天，紫色霹雳毫无征兆落下，简单粗暴。雷可穿水，水系防御对其无效。高几率麻痹敌人。",
    element: "thunder",
    type: "damage",
    mpCost: 40,
    baseDamage: 95,
    damageMultiplier: 1.8,
    hitRate: 0.9,
    critRate: 0.2,
    targetType: "enemy",
    cooldown: 0,
    tier: "中阶",
    realmRequired: "middle",
    // 小说第133章：雷系中阶无明显起手式，速度极快
    castSpeed: "fast",
    // 小说第133章：雷可穿水，水盾无效
    pierceWaterShield: true,
    statusEffects: [
      {
        name: "雷麻",
        type: "stun",
        element: "thunder",
        duration: 2,
        chance: 0.5
      }
    ]
  },
  ice_lock: {
    id: "ice_lock",
    name: "冰锁",
    description: "中阶冰系魔法，用冰链锁住敌人，造成伤害并大概率冻结。",
    element: "ice",
    type: "damage",
    mpCost: 32,
    baseDamage: 65,
    damageMultiplier: 1.6,
    hitRate: 0.88,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 0,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "冰封",
        type: "freeze",
        element: "ice",
        value: 70,
        duration: 4,
        chance: 0.7
      }
    ]
  },
  earth_wave: {
    id: "earth_wave",
    name: "地波",
    description: "中阶土系魔法，引发地震波，造成范围伤害并减速敌人。",
    element: "earth",
    type: "damage",
    mpCost: 30,
    baseDamage: 60,
    damageMultiplier: 1.5,
    hitRate: 0.9,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 0,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "地震减速",
        type: "slow",
        element: "earth",
        duration: 3,
        chance: 0.8,
        statModifiers: {
          speed: -10
        }
      }
    ]
  },
  wind_wing: {
    id: "wind_wing",
    name: "风之翼",
    description: "中阶风系魔法，在背后形成风之翼，大幅提升速度和闪避。",
    element: "wind",
    type: "buff",
    mpCost: 30,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 5,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "风之翼",
        type: "speed_up",
        duration: 5,
        chance: 1,
        statModifiers: {
          speed: 20
        }
      },
      {
        name: "风之闪避",
        type: "dodge_up",
        duration: 5,
        chance: 1,
        statModifiers: {
          dodge: 0.2
        }
      }
    ]
  },
  water_tide: {
    id: "water_tide",
    name: "潮汐",
    description: "中阶水系魔法，召唤潮汐冲击敌人，造成伤害并恢复自身。",
    element: "water",
    type: "damage",
    mpCost: 28,
    baseDamage: 55,
    damageMultiplier: 1.5,
    hitRate: 0.9,
    critRate: 0.08,
    targetType: "enemy",
    cooldown: 0,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "潮汐回复",
        type: "regen",
        element: "water",
        duration: 3,
        chance: 1,
        regenAmount: 15
      }
    ]
  },
  light_sanctuary: {
    id: "light_sanctuary",
    name: "圣佑",
    description: "中阶光系魔法，神圣之光护体，大幅提升防御并净化负面状态。",
    element: "light",
    type: "buff",
    mpCost: 35,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 4,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "神圣护盾",
        type: "shield",
        element: "light",
        value: 100,
        duration: 99,
        chance: 1
      },
      {
        name: "圣佑防御",
        type: "defense_up",
        duration: 5,
        chance: 1,
        statModifiers: {
          defense: 20
        }
      }
    ]
  },
  dark_spike: {
    id: "dark_spike",
    name: "暗影之刺",
    description: "中阶暗影系魔法，从暗影中凝聚尖刺，无视部分防御，高暴击。",
    element: "dark",
    type: "damage",
    mpCost: 32,
    baseDamage: 70,
    damageMultiplier: 1.6,
    hitRate: 0.85,
    critRate: 0.25,
    targetType: "enemy",
    cooldown: 0,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "暗影诅咒",
        type: "attack_down",
        duration: 3,
        chance: 0.6,
        statModifiers: {
          attack: -10
        }
      }
    ]
  },
  heal_holy_light: {
    id: "heal_holy_light",
    name: "圣光治愈",
    description: "中阶治愈系魔法，神圣之光普照，大幅恢复生命值并净化负面状态。",
    element: "heal",
    type: "heal",
    mpCost: 40,
    baseHeal: 80,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 3,
    tier: "中阶",
    realmRequired: "middle",
    statusEffects: [
      {
        name: "圣光净化",
        type: "cleanse",
        chance: 1
      }
    ]
  },
  summon_beast_empower: {
    id: "summon_beast_empower",
    name: "兽潮",
    description: "中阶召唤系魔法，召唤兽进入狂暴状态，全属性大幅提升。",
    element: "summon",
    type: "buff",
    mpCost: 35,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 5,
    tier: "中阶",
    realmRequired: "middle",
    requiresSummon: true,
    statusEffects: [
      {
        name: "兽潮狂暴",
        type: "attack_up",
        duration: 5,
        chance: 1,
        statModifiers: {
          attack: 25
        }
      },
      {
        name: "兽潮坚韧",
        type: "defense_up",
        duration: 5,
        chance: 1,
        statModifiers: {
          defense: 15
        }
      },
      {
        name: "兽潮迅捷",
        type: "speed_up",
        duration: 5,
        chance: 1,
        statModifiers: {
          speed: 10
        }
      }
    ]
  },

  // ========== 小说原著中阶技能（第131-140章） ==========

  // 第131章 唐月使用，火系中阶3级
  fire_fist_nine: {
    id: "fire_fist_nine",
    name: "烈拳·九宫",
    description: "火系中阶3级魔法。一拳轰地，九道地烈火柱同时喷发，范围百米，火浪翻腾如凶兽。小说第131章唐月使用。",
    element: "fire",
    type: "damage",
    mpCost: 50,
    baseDamage: 60,
    damageMultiplier: 2.2,
    hitRate: 0.95,
    critRate: 0.2,
    targetType: "all_enemies", // 范围攻击
    cooldown: 3,
    tier: "中阶3级",
    realmRequired: "middle",
    skillLevelRequired: 3,
    isCanon: true,
    canonSource: "第131章 暴火唐月",
    statusEffects: [
      {
        name: "九宫灼烧",
        type: "burn",
        element: "fire",
        dotDamage: 20,
        duration: 4,
        chance: 0.8,
        stacks: 2,
        maxStacks: 5
      }
    ]
  },

  // 第132章 朝赫使用，水系防御
  water_arc_shield: {
    id: "water_arc_shield",
    name: "水饶之盾",
    description: "水系中阶防御魔法。蓝色水凝聚成半弧形盾牌，可抵御中阶火系魔法，但雷系可穿透水盾。小说第132章朝赫使用。",
    element: "water",
    type: "defense",
    mpCost: 30,
    defenseValue: 80,
    hitRate: 1,
    critRate: 0,
    targetType: "self",
    cooldown: 2,
    tier: "中阶",
    realmRequired: "middle",
    isCanon: true,
    canonSource: "第132章 激战",
    // 小说第133章：雷可穿水，水盾对雷无效
    weakness: ["thunder"],
    statusEffects: [
      {
        name: "水盾守护",
        type: "shield",
        value: 80,
        duration: 3,
        chance: 1
      }
    ]
  },

  // 第132章 朝赫使用，诅咒系
  curse_spider_trap: {
    id: "curse_spider_trap",
    name: "邪蛛之阱",
    description: "诅咒系中阶魔法。黑色无形蛛丝缠绕敌人，持续吸取生命力，可束缚行动。光系和心灵系可克制。小说第132章朝赫使用。",
    element: "curse",
    type: "damage",
    mpCost: 35,
    baseDamage: 25,
    damageMultiplier: 1.2,
    hitRate: 0.85,
    critRate: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "中阶",
    realmRequired: "middle",
    isCanon: true,
    canonSource: "第132章 激战",
    // 小说：光系/心灵系克制诅咒
    counteredBy: ["light", "mind"],
    statusEffects: [
      {
        name: "蛛丝束缚",
        type: "bind",
        duration: 2,
        chance: 0.6
      },
      {
        name: "生命汲取",
        type: "drain",
        dotDamage: 12,
        healPercent: 0.5, // 吸取50%伤害为自身回复
        duration: 4,
        chance: 0.9
      }
    ]
  },

  // ========== 妖魔种族技能 ==========
  // 妖魔使用种族天赋能力，不是人类魔法
  
  // 通用妖魔技能
  claw_slash: {
    id: "claw_slash",
    name: "利爪撕咬",
    description: "妖魔用锋利的爪子撕咬敌人，造成物理伤害，有几率造成流血",
    element: "physical",
    type: "damage",
    mpCost: 0,
    baseDamage: 10,
    damageMultiplier: 1.2,
    hitRate: 0.9,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 0,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "流血",
        type: "bleed",
        dotDamage: 4,
        duration: 3,
        chance: 0.4,
        stacks: 1,
        maxStacks: 5
      }
    ]
  },
  
  demon_wild_charge: {
    id: "demon_wild_charge",
    name: "狂暴冲撞",
    description: "妖魔全力冲撞敌人，造成高额物理伤害，有几率击退敌人",
    element: "physical",
    type: "damage",
    mpCost: 0,
    baseDamage: 20,
    damageMultiplier: 1.5,
    hitRate: 0.8,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true
  },
  
  demon_sand_breath: {
    id: "demon_sand_breath",
    name: "飞沙走石",
    description: "幽狼兽吐出土属性沙石吐息，造成土系伤害并降低目标命中",
    element: "earth",
    type: "damage",
    mpCost: 8,
    baseDamage: 18,
    damageMultiplier: 1.2,
    hitRate: 0.95,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 2,
    statusEffects: [
      { type: "blind", chance: 0.4, duration: 2, power: 0.3 }
    ],
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第144章 幽狼兽使用飞沙走石吐息攻击"
  },

  demon_axe_slam: {
    id: "demon_axe_slam",
    name: "斧钺劈斩",
    description: "白铠战蛰用巨大斧钺前肢劈下，造成高额物理伤害",
    element: "physical",
    type: "damage",
    mpCost: 5,
    baseDamage: 25,
    damageMultiplier: 1.6,
    hitRate: 0.85,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第152章 白铠战蛰斧钺前肢"
  },

  demon_bone_sickle: {
    id: "demon_bone_sickle",
    name: "骨镰横扫",
    description: "白铠战蛰用后肢骨镰横扫，可攻击后方目标",
    element: "physical",
    type: "damage",
    mpCost: 4,
    baseDamage: 18,
    damageMultiplier: 1.3,
    hitRate: 0.9,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第152章 白铠战蛰后肢骨镰"
  },

  demon_rock_fist: {
    id: "demon_rock_fist",
    name: "岩石重拳",
    description: "岩魔士重拳轰击，造成高额土系伤害",
    element: "earth",
    type: "damage",
    mpCost: 6,
    baseDamage: 28,
    damageMultiplier: 1.5,
    hitRate: 0.75,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第153章 岩魔士"
  },

  demon_earth_spike: {
    id: "demon_earth_spike",
    name: "地刺",
    description: "岩魔士操控地面升起岩刺攻击敌人",
    element: "earth",
    type: "damage",
    mpCost: 8,
    baseDamage: 20,
    damageMultiplier: 1.2,
    hitRate: 0.9,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第153章 岩魔士操控土"
  },

  demon_dive_strike: {
    id: "demon_dive_strike",
    name: "俯冲猎杀",
    description: "食骨妖从高空俯冲攻击，优先攻击施法中的目标",
    element: "physical",
    type: "damage",
    mpCost: 8,
    baseDamage: 22,
    damageMultiplier: 1.4,
    hitRate: 0.95,
    critRate: 0.2,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第153章 食骨妖俯冲"
  },

  demon_wing_slash: {
    id: "demon_wing_slash",
    name: "翼刃斩",
    description: "食骨妖用肉翼边缘斩击，速度极快",
    element: "wind",
    type: "damage",
    mpCost: 5,
    baseDamage: 15,
    damageMultiplier: 1.2,
    hitRate: 0.95,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 1,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第153章 食骨妖"
  },

  demon_triple_burst: {
    id: "demon_triple_burst",
    name: "三段爆发",
    description: "进阶期幽狼兽特有能力，连续三次爆发冲刺，每次伤害递增",
    element: "physical",
    type: "damage",
    mpCost: 15,
    baseDamage: 15,
    damageMultiplier: 1.0,
    hitCount: 3,
    hitRate: 0.9,
    critRate: 0.2,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: true,
    source: "第157-158章 进阶期幽狼兽三段爆发"
  },

  fierce_roar: {
    id: "fierce_roar",
    name: "凶猛咆哮",
    description: "妖魔发出震慑人心的咆哮，降低敌人的攻击力",
    element: "physical",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "威慑",
        type: "attack_down",
        duration: 3,
        chance: 0.8,
        statModifiers: {
          attack: -15
        }
      }
    ]
  },
  
  // 暗影系妖魔技能
  shadow_assault: {
    id: "shadow_assault",
    name: "暗影突袭",
    description: "暗影系妖魔融入阴影中突然袭击，造成暗影伤害，有几率致盲",
    element: "dark",
    type: "damage",
    mpCost: 0,
    baseDamage: 15,
    damageMultiplier: 1.3,
    hitRate: 0.95,
    critRate: 0.2,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "致盲",
        type: "hit_rate_down",
        duration: 2,
        chance: 0.3,
        statModifiers: {
          hitRate: -30
        }
      }
    ]
  },
  
  // 风系妖魔技能
  wind_slash: {
    id: "wind_slash",
    name: "风刃斩击",
    description: "速度型妖魔高速移动产生的风刃，造成伤害并降低敌人速度",
    element: "wind",
    type: "damage",
    mpCost: 0,
    baseDamage: 12,
    damageMultiplier: 1.2,
    hitRate: 0.95,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 1,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "风刃减速",
        type: "speed_down",
        duration: 2,
        chance: 0.6,
        statModifiers: {
          speed: -20
        }
      }
    ]
  },
  
  // 战将级妖魔技能
  bone_spike_shot: {
    id: "bone_spike_shot",
    name: "骨刺射击",
    description: "骨刺类妖魔射出锋利的骨刺，远程物理攻击",
    element: "physical",
    type: "damage",
    mpCost: 0,
    baseDamage: 25,
    damageMultiplier: 1.3,
    hitRate: 0.85,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 1,
    tier: "战将级",
    isDemonSkill: true
  },
  
  demon_regeneration: {
    id: "demon_regeneration",
    name: "妖魔再生",
    description: "强大妖魔的再生能力，恢复一定生命值",
    element: "physical",
    type: "heal",
    mpCost: 0,
    healAmount: 30,
    targetType: "self",
    cooldown: 4,
    tier: "战将级",
    isDemonSkill: true
  },
  
  berserk_mode: {
    id: "berserk_mode",
    name: "狂暴模式",
    description: "妖魔进入狂暴状态，攻击力大幅提升，但防御力下降",
    element: "physical",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "狂暴",
        type: "attack_up",
        duration: 4,
        chance: 1,
        statModifiers: {
          attack: 30
        }
      },
      {
        name: "狂暴防御下降",
        type: "defense_down",
        duration: 4,
        chance: 1,
        statModifiers: {
          defense: -15
        }
      }
    ]
  },
  
  // 统领级妖魔技能
  demonic_aura: {
    id: "demonic_aura",
    name: "妖魔领域",
    description: "统领级以上妖魔释放的恐怖领域，压制敌人同时增强自身",
    element: "dark",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 6,
    tier: "统领级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "领域威压",
        type: "all_down",
        duration: 4,
        chance: 1,
        statModifiers: {
          attack: -10,
          defense: -10,
          speed: -10
        }
      },
      {
        name: "领域增强",
        type: "all_up",
        duration: 4,
        chance: 1,
        statModifiers: {
          attack: 15,
          defense: 15,
          speed: 10
        }
      }
    ]
  },
  
  rock_throw: {
    id: "rock_throw",
    name: "巨石投掷",
    description: "土系/岩石妖魔投掷巨大岩石，造成高额伤害并有几率眩晕",
    element: "earth",
    type: "damage",
    mpCost: 0,
    baseDamage: 25,
    damageMultiplier: 1.4,
    hitRate: 0.75,
    critRate: 0.1,
    targetType: "enemy",
    cooldown: 3,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "眩晕",
        type: "stun",
        duration: 1,
        chance: 0.3
      }
    ]
  },
  
  // ===== 战将级妖魔新技能 =====
  blood_bite: {
    id: "blood_bite",
    name: "嗜血撕咬",
    description: "妖魔疯狂撕咬敌人，造成伤害的同时吸取生命值",
    element: "physical",
    type: "damage",
    mpCost: 0,
    baseDamage: 20,
    damageMultiplier: 1.3,
    hitRate: 0.9,
    critRate: 0.15,
    targetType: "enemy",
    cooldown: 2,
    tier: "战将级",
    isDemonSkill: true,
    lifesteal: 0.3  // 30%吸血
  },
  
  war_stomp: {
    id: "war_stomp",
    name: "战争践踏",
    description: "妖魔用力践踏地面，造成范围伤害并降低敌人速度和攻击力",
    element: "physical",
    type: "damage",
    mpCost: 0,
    baseDamage: 18,
    damageMultiplier: 1.2,
    hitRate: 0.95,
    critRate: 0.05,
    targetType: "enemy",
    cooldown: 3,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "震伤减速",
        type: "speed_down",
        duration: 2,
        chance: 0.8,
        statModifiers: {
          speed: -25
        }
      },
      {
        name: "震伤无力",
        type: "attack_down",
        duration: 2,
        chance: 0.6,
        statModifiers: {
          attack: -15
        }
      }
    ]
  },
  
  // ===== 统领级妖魔新技能 =====
  fear_roar: {
    id: "fear_roar",
    name: "恐惧咆哮",
    description: "统领级妖魔发出震慑灵魂的咆哮，大幅降低敌人全属性",
    element: "physical",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "统领级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "恐惧",
        type: "attack_down",
        duration: 3,
        chance: 1,
        statModifiers: {
          attack: -25
        }
      },
      {
        name: "战栗",
        type: "defense_down",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: -20
        }
      },
      {
        name: "胆怯",
        type: "speed_down",
        duration: 3,
        chance: 1,
        statModifiers: {
          speed: -20
        }
      }
    ]
  },
  
  demon_rage: {
    id: "demon_rage",
    name: "妖魔之怒",
    description: "统领级妖魔进入狂暴状态，攻击力和速度大幅提升，但防御降低",
    element: "physical",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "统领级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "妖魔狂暴",
        type: "attack_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          attack: 40
        }
      },
      {
        name: "狂暴加速",
        type: "speed_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          speed: 30
        }
      },
      {
        name: "狂暴防御降低",
        type: "defense_down",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: -20
        }
      }
    ]
  },
  
  thorn_armor: {
    id: "thorn_armor",
    name: "荆棘护甲",
    description: "战将级妖魔体表长出尖刺，反弹受到的物理伤害",
    element: "physical",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "荆棘护甲",
        type: "damage_reflect",
        duration: 3,
        chance: 1,
        reflectPercent: 0.3
      }
    ]
  },
  
  // ========== 奴仆级妖魔特色技能 ==========
  
  wind_step: {
    id: "wind_step",
    name: "疾风步",
    description: "风系妖魔高速移动，速度和闪避大幅提升",
    element: "wind",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "疾风步",
        type: "speed_up",
        duration: 3,
        chance: 1,
        value: 0.3
      },
      {
        name: "疾风步",
        type: "evasion_up",
        duration: 3,
        chance: 1,
        value: 0.2
      }
    ]
  },
  
  demon_fire_burst: {
    id: "demon_fire_burst",
    name: "火焰爆发",
    description: "火系妖魔爆发火焰，造成大量伤害并有几率灼烧",
    element: "fire",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.5,
    statusEffects: [
      {
        name: "灼烧",
        type: "burn",
        duration: 2,
        chance: 0.4,
        damagePerTurn: 8
      }
    ]
  },
  
  thunder_charge: {
    id: "thunder_charge",
    name: "雷电充能",
    description: "雷系妖魔积蓄雷电力量，攻击力大幅提升",
    element: "thunder",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "雷电充能",
        type: "attack_up",
        duration: 3,
        chance: 1,
        value: 0.35
      }
    ]
  },
  
  frost_breath: {
    id: "frost_breath",
    name: "冰冻吐息",
    description: "冰系妖魔吐出寒气，伤害不高但有很大几率冻结目标",
    element: "ice",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.8,
    statusEffects: [
      {
        name: "冻结",
        type: "frozen",
        duration: 1,
        chance: 0.5
      }
    ]
  },
  
  poison_fang: {
    id: "poison_fang",
    name: "毒牙",
    description: "毒蛇类妖魔咬击，注入剧毒造成持续伤害",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.9,
    statusEffects: [
      {
        name: "中毒",
        type: "poison",
        duration: 3,
        chance: 0.6,
        dotDamage: 6
      }
    ]
  },
  
  web_bind: {
    id: "web_bind",
    name: "蛛网束缚",
    description: "蜘蛛类妖魔吐出蛛网，束缚目标并降低速度",
    element: "water",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.6,
    statusEffects: [
      {
        name: "减速",
        type: "slow",
        duration: 2,
        chance: 0.7,
        value: 0.3
      },
      {
        name: "束缚",
        type: "bind",
        duration: 1,
        chance: 0.3
      }
    ]
  },
  
  hard_shell: {
    id: "hard_shell",
    name: "坚硬外壳",
    description: "甲壳类妖魔收缩身体，防御力大幅提升",
    element: "earth",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "坚硬外壳",
        type: "defense_up",
        duration: 3,
        chance: 1,
        value: 0.5
      }
    ]
  },
  
  blind_dust: {
    id: "blind_dust",
    name: "致盲粉尘",
    description: "飞蛾类妖魔散播磷粉，降低目标命中率",
    element: "light",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      {
        name: "致盲",
        type: "accuracy_down",
        duration: 3,
        chance: 0.7,
        value: 0.3
      }
    ]
  },
  evil_eye_gaze: {
    id: "evil_eye_gaze",
    name: "邪眼凝视",
    description: "邪眼沼妖用邪眼凝视目标，有几率使目标眩晕",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.8,
    statusEffects: [
      { name: "眩晕", type: "stun", duration: 1, chance: 0.35 }
    ]
  },
  life_drain: {
    id: "life_drain",
    name: "生命汲取",
    description: "暗系妖魔汲取目标生命，造成伤害并回复自身HP",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.0,
    lifesteal: 0.5
  },
  curse_weakness: {
    id: "curse_weakness",
    name: "虚弱诅咒",
    description: "黑教廷法师施加诅咒，降低目标攻击力",
    element: "dark",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "虚弱", type: "attack_down", duration: 3, chance: 0.8, statModifiers: { attack: -8 } }
    ]
  },
  terror_screech: {
    id: "terror_screech",
    name: "恐惧尖叫",
    description: "妖魔发出刺耳尖叫，降低目标防御和速度",
    element: "dark",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "恐惧", type: "defense_down", duration: 2, chance: 0.7, statModifiers: { defense: -6 } },
      { name: "迟缓", type: "slow", duration: 2, chance: 0.7, speedMod: -5 }
    ]
  },
  venom_spit: {
    id: "venom_spit",
    name: "毒液喷射",
    description: "喷射毒液，造成伤害并使目标中毒减速",
    element: "water",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.7,
    statusEffects: [
      { name: "中毒", type: "poison", duration: 3, chance: 0.5, dotDamage: 5 },
      { name: "减速", type: "slow", duration: 2, chance: 0.4, value: 0.2 }
    ]
  },

  // ===== 第三批奴仆级妖魔特色技能 =====
  wolf_pack_attack: {
    id: "wolf_pack_attack",
    name: "狼群围攻",
    description: "群狼一拥而上撕咬目标，造成高额伤害并有几率撕裂伤口",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.4,
    statusEffects: [
      { name: "撕裂", type: "bleed", duration: 2, chance: 0.5, dotDamage: 4 }
    ]
  },

  shadow_dodge: {
    id: "shadow_dodge",
    name: "暗影闪避",
    description: "融入阴影中，2回合内闪避率大幅提升",
    element: "dark",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "暗影闪避", type: "dodge_up", duration: 2, chance: 1, dodgeMod: 0.4 }
    ]
  },

  stone_skin: {
    id: "stone_skin",
    name: "石肤术",
    description: "皮肤化为岩石，大幅提升防御力3回合",
    element: "earth",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "石肤", type: "defense_up", duration: 3, chance: 1, statModifiers: { defense: 12 } }
    ]
  },

  berserk_charge: {
    id: "berserk_charge",
    name: "狂暴冲锋",
    description: "疯狂冲向目标，造成高额伤害但自身防御降低2回合",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.6,
    selfStatusEffects: [
      { name: "冲锋后摇", type: "defense_down", duration: 2, chance: 1, statModifiers: { defense: -5 } }
    ]
  },

  lightning_fur: {
    id: "lightning_fur",
    name: "雷电皮毛",
    description: "毛发竖起带电，3回合内攻击力提升",
    element: "thunder",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "雷电附体", type: "attack_up", duration: 3, chance: 1, statModifiers: { attack: 6 } }
    ]
  },

  // ===== 第四批妖魔特色技能 =====
  demon_wind_barrier: {
    id: "demon_wind_barrier",
    name: "风之屏障",
    description: "在身边形成风之屏障，2回合内闪避率大幅提升",
    element: "wind",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "风之屏障", type: "dodge_up", duration: 2, chance: 1, dodgeMod: 0.5 }
    ]
  },

  flame_cloak: {
    id: "flame_cloak",
    name: "火焰披风",
    description: "全身笼罩火焰，3回合内攻击带灼烧效果",
    element: "fire",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "火焰披风", type: "attack_up", duration: 3, chance: 1, statModifiers: { attack: 4 } }
    ]
  },

  water_recovery: {
    id: "water_recovery",
    name: "水之恢复",
    description: "利用水元素恢复自身生命",
    element: "water",
    type: "heal",
    mpCost: 0,
    targetType: "self",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    healPercent: 0.25
  },

  armor_break: {
    id: "armor_break",
    name: "破甲一击",
    description: "精准打击目标护甲，造成伤害并降低其防御",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.0,
    statusEffects: [
      { name: "破甲", type: "defense_down", duration: 3, chance: 0.8, statModifiers: { defense: -8 } }
    ]
  },

  battle_howl: {
    id: "battle_howl",
    name: "战斗嚎叫",
    description: "发出战斗嚎叫，提升自身攻击力3回合",
    element: "physical",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "战斗嚎叫", type: "attack_up", duration: 3, chance: 1, statModifiers: { attack: 8 } }
    ]
  },

  // ===== 战将级妖魔新技能 =====
  terror_howl: {
    id: "terror_howl",
    name: "恐惧咆哮",
    description: "发出令人恐惧的咆哮，降低目标攻击力并使其有几率无法行动",
    element: "dark",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      { name: "恐惧", type: "attack_down", duration: 3, chance: 0.8, statModifiers: { attack: -10 } },
      { name: "恐惧", type: "stun", duration: 1, chance: 0.3 }
    ]
  },

  // ===== 第五批妖魔技能（带新机制）=====
  charge_attack: {
    id: "charge_attack",
    name: "蓄力冲撞",
    description: "蓄力一回合，下回合造成2.5倍伤害",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 2.5,
    chargeTurns: 1,
    statusEffects: [
      { name: "冲撞", type: "stun", duration: 1, chance: 0.3 }
    ]
  },

  ice_armor: {
    id: "ice_armor",
    name: "冰甲术",
    description: "凝结冰霜护甲，3回合内防御提升，近战攻击者有几率被冰冻",
    element: "ice",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "冰甲", type: "defense_up", duration: 3, chance: 1, statModifiers: { defense: 10 } },
      { name: "冰甲", type: "ice_thorns", duration: 3, chance: 1 }
    ]
  },

  demon_thunder_strike: {
    id: "demon_thunder_strike",
    name: "雷霆一击",
    description: "召唤雷电劈向目标，造成高额雷系伤害并有几率麻痹",
    element: "thunder",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.8,
    statusEffects: [
      { name: "麻痹", type: "paralyze", duration: 1, chance: 0.4 }
    ]
  },

  shadow_step_strike: {
    id: "shadow_step_strike",
    name: "暗影步",
    description: "融入阴影瞬移到目标身后攻击，必定命中且暴击率提升",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.3,
    guaranteedHit: true,
    critBonus: 0.3
  },

  poison_cloud: {
    id: "poison_cloud",
    name: "毒雾",
    description: "喷出毒雾笼罩目标，造成持续毒素伤害并降低其命中",
    element: "dark",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.5,
    statusEffects: [
      { name: "中毒", type: "poison", duration: 3, chance: 0.8, dotDamage: 6 },
      { name: "致盲", type: "accuracy_down", duration: 2, chance: 0.6 }
    ]
  },

  // 战将级技能
  dark_dragon_breath: {
    id: "dark_dragon_breath",
    name: "暗龙息",
    description: "喷出黑暗龙息，造成大量暗系伤害并降低目标全属性",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    power: 2.0,
    statusEffects: [
      { name: "虚弱", type: "curse", duration: 2, chance: 0.5 }
    ]
  },

  // ===== 第六批妖魔技能（护盾/反伤/连击）=====
  flame_shield: {
    id: "flame_shield",
    name: "火焰护盾",
    description: "凝结火焰护盾，吸收伤害并对近战攻击者造成火焰反伤",
    element: "fire",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 6,
    tier: "奴仆级",
    isDemonSkill: true,
    shieldValue: 0.15,
    shieldType: "fire",
    reflectDamage: 8,
    statusEffects: [
      { name: "火焰护盾", type: "shield", duration: 3, chance: 1 }
    ]
  },

  water_barrier: {
    id: "water_barrier",
    name: "水之屏障",
    description: "召唤水之屏障，吸收大量伤害",
    element: "water",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    shieldValue: 0.25,
    shieldType: "water",
    statusEffects: [
      { name: "水之屏障", type: "shield", duration: 3, chance: 1 }
    ]
  },

  demon_earth_shield: {
    id: "demon_earth_shield",
    name: "大地之盾",
    description: "召唤岩石护盾，吸收伤害并提升防御",
    element: "earth",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 6,
    tier: "奴仆级",
    isDemonSkill: true,
    shieldValue: 0.2,
    shieldType: "earth",
    statusEffects: [
      { name: "大地之盾", type: "shield", duration: 3, chance: 1 },
      { name: "岩石护体", type: "defense_up", duration: 3, chance: 1, statModifiers: { defense: 8 } }
    ]
  },

  double_strike: {
    id: "double_strike",
    name: "连击",
    description: "快速攻击两次，每次造成0.7倍伤害",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.7,
    hitCount: 2
  },

  triple_slash: {
    id: "triple_slash",
    name: "三连斩",
    description: "快速斩击三次，每次造成0.5倍伤害",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 0.5,
    hitCount: 3
  },

  life_steal_bite: {
    id: "life_steal_bite",
    name: "吸血撕咬",
    description: "撕咬目标造成1.2倍伤害，回复造成伤害50%的生命",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.2,
    lifesteal: 0.5
  },

  speed_burst: {
    id: "speed_burst",
    name: "极速爆发",
    description: "短时间内速度大幅提升，闪避率提高",
    element: "wind",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "极速", type: "speed_up", duration: 2, chance: 1, statModifiers: { speed: 15 } },
      { name: "极速", type: "dodge_up", duration: 2, chance: 1, statModifiers: { evasion: 0.3 } }
    ]
  },

  // 统领级技能
  demon_domain: {
    id: "demon_domain",
    name: "妖魔领域",
    description: "释放妖魔领域，降低目标全属性并提升自身攻击",
    element: "dark",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 8,
    tier: "统领级",
    isDemonSkill: true,
    statusEffects: [
      { name: "领域压制", type: "curse", duration: 3, chance: 0.8 },
      { name: "领域压制", type: "defense_down", duration: 3, chance: 0.8, statModifiers: { defense: -10 } },
      { name: "领域压制", type: "slow", duration: 3, chance: 0.8, statModifiers: { speed: -10 } }
    ],
    selfBuff: [
      { name: "领域加持", type: "attack_up", duration: 3, chance: 1, statModifiers: { attack: 10 } }
    ]
  },

  // ========== 新妖魔特色技能 ==========

  // 噬骨虫技能
  acid_spray: {
    id: "acid_spray",
    name: "酸液喷射",
    description: "喷射腐蚀性酸液，造成土系伤害并大幅降低目标防御，持续腐蚀",
    element: "earth",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.1,
    statusEffects: [
      { name: "腐蚀", type: "defense_down", duration: 3, chance: 0.9, value: -10 },
      { name: "酸蚀", type: "poison", duration: 3, chance: 0.7, dotDamage: 5 }
    ]
  },

  burrow_attack: {
    id: "burrow_attack",
    name: "掘地突袭",
    description: "钻入地下后突然从下方袭击，造成高额伤害并有几率眩晕目标",
    element: "earth",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.8,
    guaranteedHit: true,
    statusEffects: [
      { name: "眩晕", type: "stun", duration: 1, chance: 0.35 }
    ]
  },

  // 血纹巨魔鼠技能
  blood_frenzy: {
    id: "blood_frenzy",
    name: "血纹狂暴",
    description: "激活血纹力量进入狂暴状态，攻击力大幅提升，但持续损失生命值",
    element: "dark",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 6,
    tier: "奴仆级",
    isDemonSkill: true,
    statModifiers: { attack: 12, speed: 8 },
    duration: 3,
    selfStatusEffects: [
      { name: "反噬", type: "burn", duration: 3, dotDamage: 8 }
    ]
  },

  gnaw_bite: {
    id: "gnaw_bite",
    name: "撕咬啃噬",
    description: "疯狂撕咬目标，造成暗系伤害并吸取生命值",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.3,
    lifesteal: 0.3,
    statusEffects: [
      { name: "流血", type: "bleed", duration: 2, chance: 0.5, dotDamage: 4 }
    ]
  },

  // 翼苍狼技能
  wind_blade_barrage: {
    id: "wind_blade_barrage",
    name: "风刃连斩",
    description: "快速挥动翅膀发射多道风刃，连续攻击目标三次",
    element: "wind",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "战将级",
    isDemonSkill: true,
    power: 0.7,
    hitCount: 3,
    statusEffects: [
      { name: "流血", type: "bleed", duration: 2, chance: 0.4, dotDamage: 6 }
    ]
  },

  aerial_dive: {
    id: "aerial_dive",
    name: "俯冲突袭",
    description: "从高空俯冲攻击，造成巨额风系伤害并击退目标（降低速度）",
    element: "wind",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    power: 2.2,
    statusEffects: [
      { name: "迟缓", type: "slow", duration: 2, chance: 0.8, speedMod: -10 }
    ]
  },

  feather_dance: {
    id: "feather_dance",
    name: "羽盾护体",
    description: "用风元素凝聚羽毛护盾，大幅提升闪避率和防御力",
    element: "wind",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 6,
    tier: "战将级",
    isDemonSkill: true,
    statModifiers: { defense: 8, dodge: 0.3 },
    duration: 3
  },

  // ===== 第七批妖魔技能（部分非原著）=====
  bone_slash: {
    id: "bone_slash",
    name: "骨刃斩",
    description: "用骨剑挥出锋利的斩击，造成物理伤害并有几率流血",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: false,
    canonNote: "非原著技能，游戏设计（骷髅战士）",
    power: 1.3,
    statusEffects: [
      { name: "流血", type: "bleed", duration: 2, chance: 0.4, dotDamage: 5 }
    ]
  },

  demon_lightning_arrow: {
    id: "demon_lightning_arrow",
    name: "雷电箭",
    description: "召唤雷电箭矢攻击敌人，有几率麻痹",
    element: "thunder",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 2,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: false,
    canonNote: "非原著技能，游戏设计（雷兽）",
    power: 1.0,
    statusEffects: [
      { name: "麻痹", type: "paralyze", duration: 1, chance: 0.25 }
    ]
  },

  phase_strike: {
    id: "phase_strike",
    name: "虚体打击",
    description: "穿过防御直接攻击灵魂，无视50%防御",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: false,
    canonNote: "非原著技能，游戏设计（幽灵）",
    power: 1.1,
    ignoreDefense: 0.5
  },

  iron_defense: {
    id: "iron_defense",
    name: "铁甲防御",
    description: "蜷缩身体进入防御姿态，防御大幅提升但速度降低",
    element: "earth",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: false,
    canonNote: "非原著技能，游戏设计（铁甲蝎）",
    statusEffects: [
      { name: "铁甲防御", type: "defense_up", duration: 3, chance: 1, statModifiers: { defense: 15 } },
      { name: "蜷缩", type: "slow", duration: 3, chance: 1, statModifiers: { speed: -5 } }
    ]
  },

  thunder_dive: {
    id: "thunder_dive",
    name: "雷霆俯冲",
    description: "带着雷电俯冲攻击，造成大量雷系伤害",
    element: "thunder",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    isCanon: false,
    canonNote: "非原著技能，游戏设计（雷鹰）",
    power: 1.8,
    guaranteedHit: true,
    statusEffects: [
      { name: "麻痹", type: "paralyze", duration: 1, chance: 0.4 }
    ]
  },

  // ===== 小说原著技能 =====
  // 巨眼猩鼠：眼睛释放腥红暗光束
  crimson_beam: {
    id: "crimson_beam",
    name: "腥红光束",
    description: "从巨大的眼睛中释放腥红色暗光束，远程攻击目标",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    baseDamage: 25,
    guaranteedHit: true,
    statusEffects: [
      { name: "暗蚀", type: "curse", duration: 2, chance: 0.3 }
    ]
  },

  // 黑畜妖：阴影中潜行，速度极快
  shadow_lurk: {
    id: "shadow_lurk",
    name: "暗影潜行",
    description: "潜入阴影中，大幅提升闪避率，下次攻击必定暴击",
    element: "dark",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "潜行", type: "dodge_up", duration: 2, chance: 1, statModifiers: { evasion: 0.5 } },
      { name: "伏击", type: "crit_up", duration: 2, chance: 1, statModifiers: { critRate: 1.0 } }
    ]
  },

  // 黑畜妖：协同攻击
  coordinated_assault: {
    id: "coordinated_assault",
    name: "协同扑杀",
    description: "与同伴配合从两侧同时攻击，造成1.5倍伤害",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.5,
    statusEffects: [
      { name: "流血", type: "bleed", duration: 2, chance: 0.5, dotDamage: 4 }
    ]
  },

  // 翼苍狼：兽王咆哮，号令群妖
  beast_king_roar: {
    id: "beast_king_roar",
    name: "兽王咆哮",
    description: "发出震慑百兽的咆哮，降低目标攻击力并造成恐惧",
    element: "wind",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 6,
    tier: "统领级",
    isDemonSkill: true,
    statusEffects: [
      { name: "恐惧", type: "attack_down", duration: 3, chance: 0.8, statModifiers: { attack: -12 } },
      { name: "震慑", type: "stun", duration: 1, chance: 0.3 }
    ]
  },

  // 翼苍狼：坏血爪，附带坏血效果
  blood_decay_claw: {
    id: "blood_decay_claw",
    name: "坏血利爪",
    description: "附带坏血效果的利爪攻击，造成伤害并使目标持续流血，治疗效果降低",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "统领级",
    isDemonSkill: true,
    power: 1.4,
    statusEffects: [
      { name: "坏血", type: "bleed", duration: 3, chance: 0.7, dotDamage: 8 },
      { name: "坏血", type: "healing_reduction", duration: 3, chance: 0.7, value: 0.5 }
    ]
  },

  // 翼苍狼：风刃连斩（已有wind_blade_barrage），补充兽风
  beast_wind: {
    id: "beast_wind",
    name: "兽风",
    description: "喷吐血色兽风，造成风系伤害并击退目标",
    element: "wind",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "统领级",
    isDemonSkill: true,
    power: 1.2,
    statusEffects: [
      { name: "击退", type: "slow", duration: 2, chance: 0.6, statModifiers: { speed: -8 } }
    ]
  },

  // 邪眼沼妖：精神迷惑
  mind_confuse: {
    id: "mind_confuse",
    name: "邪眼迷惑",
    description: "用邪眼迷惑目标心智，使其混乱，可能攻击友方或无法行动",
    element: "dark",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 5,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "迷惑", type: "confuse", duration: 2, chance: 0.5 }
    ]
  },

  // 妖藤：缠绕束缚
  demon_vine_bind: {
    id: "demon_vine_bind",
    name: "藤蔓缠绕",
    description: "用藤蔓缠绕目标，使其无法行动并持续受到伤害",
    element: "earth",
    type: "debuff",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    statusEffects: [
      { name: "缠绕", type: "bind", duration: 2, chance: 0.6 },
      { name: "藤刺", type: "bleed", duration: 2, chance: 0.5, dotDamage: 3 }
    ]
  },

  // 进阶期独眼魔狼：棘骨横扫（骨骼生长后从背部和肩部伸出的棘骨攻击）
  spine_sweep: {
    id: "spine_sweep",
    name: "棘骨横扫",
    description: "用肩部和背部生长出的锋利棘骨横扫敌人，造成大量物理伤害",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "战将级",
    isDemonSkill: true,
    power: 1.6,
    statusEffects: [
      { name: "流血", type: "bleed", duration: 2, chance: 0.5, dotDamage: 6 }
    ]
  },

  // 进阶期独眼魔狼：魔狼吐息（小说提到独眼魔狼有吐息）
  wolf_breath: {
    id: "wolf_breath",
    name: "魔狼吐息",
    description: "喷出带有腐臭气息的黑暗吐息，造成暗系伤害",
    element: "dark",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "奴仆级",
    isDemonSkill: true,
    power: 1.0,
    statusEffects: [
      { name: "腐蚀", type: "defense_down", duration: 2, chance: 0.4, statModifiers: { defense: -5 } }
    ]
  },

  // 骨刺狰狼/三眼魔狼：骨刺投掷（小说提到会扔东西）
  bone_throw: {
    id: "bone_throw",
    name: "骨刺投掷",
    description: "拔下身上的骨刺用力投向敌人，远程物理攻击",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "战将级",
    isDemonSkill: true,
    power: 1.3
  },

  // 三眼魔狼：三眼视界（270度视角，免疫偷袭和暴击）
  third_eye_sight: {
    id: "third_eye_sight",
    name: "三眼视界",
    description: "三只眼睛拥有270度视角，能洞察敌人动向，大幅提升闪避和暴击抵抗",
    element: "neutral",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      { name: "视界", type: "dodge_up", duration: 3, chance: 1, statModifiers: { evasion: 0.3 } }
    ]
  },

  // 三眼魔狼：钢铁之躯（小说描述钢铁般结实的身躯）
  iron_body: {
    id: "iron_body",
    name: "钢铁之躯",
    description: "钢铁般结实的身躯，大幅提升防御力",
    element: "neutral",
    type: "buff",
    mpCost: 0,
    targetType: "self",
    cooldown: 5,
    tier: "战将级",
    isDemonSkill: true,
    statusEffects: [
      { name: "钢躯", type: "defense_up", duration: 3, chance: 1, statModifiers: { defense: 15 } }
    ]
  },

  // 血纹巨魔鼠：利爪撕裂（小说描述爪子锋利，轻松没入石砖）
  claw_tear: {
    id: "claw_tear",
    name: "利爪撕裂",
    description: "用锋利的爪子撕裂敌人，造成大量物理伤害并降低防御",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 3,
    tier: "战将级",
    isDemonSkill: true,
    power: 1.5,
    statusEffects: [
      { name: "撕裂", type: "defense_down", duration: 2, chance: 0.5, statModifiers: { defense: -8 } },
      { name: "流血", type: "bleed", duration: 2, chance: 0.4, dotDamage: 8 }
    ]
  },

  // 血纹巨魔鼠：高速冲撞（小说描述三四十米一眨眼就到）
  speed_charge: {
    id: "speed_charge",
    name: "高速冲撞",
    description: "以极快的速度冲撞敌人，必定命中且有几率眩晕",
    element: "physical",
    type: "damage",
    mpCost: 0,
    targetType: "enemy",
    cooldown: 4,
    tier: "战将级",
    isDemonSkill: true,
    power: 1.8,
    guaranteedHit: true,
    statusEffects: [
      { name: "眩晕", type: "stun", duration: 1, chance: 0.3 }
    ]
  }
};
