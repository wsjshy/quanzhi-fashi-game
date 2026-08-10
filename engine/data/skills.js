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
    description: "初阶火系魔法，发射一枚火球，有几率造成灼烧",
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
        name: "灼烧",
        type: "burn",
        dotDamage: 5,
        duration: 3,
        chance: 0.4
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
        name: "灼烧",
        type: "burn",
        dotDamage: 8,
        duration: 3,
        chance: 0.6
      }
    ]
  },
  ice_spike: {
    id: "ice_spike",
    name: "冰蔓·冻结",
    description: "初阶冰系魔法，发射冰刺，有几率减速敌人",
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
        name: "减速",
        type: "slow",
        duration: 2,
        chance: 0.5,
        statModifiers: {
          speed: -3
        }
      }
    ]
  },
  ice_shield: {
    id: "ice_shield",
    name: "冰蔓·冰铠",
    description: "初阶冰系防御魔法，用冰甲保护自己，提升防御",
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
    description: "初阶雷系魔法，释放雷电，高暴击，有几率麻痹",
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
        type: "paralyze",
        duration: 1,
        chance: 0.25
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
        type: "paralyze",
        duration: 2,
        chance: 0.35
      }
    ]
  },
  earth_shield: {
    id: "earth_shield",
    name: "土系·岩盾",
    description: "初阶土系防御魔法，召唤岩石护盾，大幅提升防御",
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
        type: "defense_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: 12
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
    tier: "初阶"
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
    tier: "初阶"
  },
  wind_speed: {
    id: "wind_speed",
    name: "风轨·飘影",
    description: "初阶风系辅助魔法，提升自身速度",
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
    description: "初阶水系控制魔法，用水链束缚敌人",
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
    tier: "初阶"
  },
  dark_bolt: {
    id: "dark_bolt",
    name: "暗影·腐蚀",
    description: "初阶暗影系魔法，暗影弹，有腐蚀效果",
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
        name: "腐蚀",
        type: "poison",
        dotDamage: 6,
        duration: 3,
        chance: 0.5
      }
    ]
  },
  light_shield: {
    id: "light_shield",
    name: "光系·圣盾",
    description: "初阶光系防御魔法，用圣光凝聚护盾，提升防御并恢复少量生命",
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
        name: "圣盾",
        type: "defense_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          defense: 10
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
        type: "crit_up",
        duration: 3,
        chance: 1,
        statModifiers: {
          critRate: 0.15
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
        name: "灼烧",
        type: "burn",
        dotDamage: 10,
        duration: 4,
        chance: 0.7
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
        name: "冻结",
        type: "paralyze",
        duration: 1,
        chance: 0.4
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
        type: "paralyze",
        duration: 2,
        chance: 0.4
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
        duration: 2,
        chance: 0.5,
        statModifiers: {
          speed: -4
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
    tier: "初阶"
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
        name: "水之祝福",
        type: "regen",
        dotDamage: -15,
        duration: 3,
        chance: 1
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
    tier: "初阶"
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
        type: "poison",
        dotDamage: 12,
        duration: 4,
        chance: 0.8
      },
      {
        name: "虚弱",
        type: "attack_down",
        duration: 3,
        chance: 0.6,
        statModifiers: {
          attack: -5
        }
      }
    ]
  }
};
