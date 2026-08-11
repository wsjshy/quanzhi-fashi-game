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
  }
};
