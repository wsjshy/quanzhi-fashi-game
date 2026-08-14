/**
 * 天赋数据
 * 各系天生天赋、灵种、魂种等
 */

const DataTalents = {
  // ========== 火系天赋 ==========
  fire_talent_basic: {
    id: "fire_talent_basic",
    name: "烈焰之魂",
    element: "fire",
    rarity: "common",
    type: "growth",
    description: "基础的火系天赋，提升火系技能伤害。",
    effects: {
      damageBonus: 0.10  // 火系伤害+10%
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }  // 每级额外+1%
  },
  
  fire_talent_burn: {
    id: "fire_talent_burn",
    name: "燃烧之心",
    element: "fire",
    rarity: "uncommon",
    type: "growth",
    description: "火系技能有概率点燃目标，造成持续伤害。",
    effects: {
      damageBonus: 0.15,
      burnChance: 0.15,  // 15%概率点燃
      burnDamage: 0.05   // 每回合5%伤害
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  fire_talent_crit: {
    id: "fire_talent_crit",
    name: "爆炎",
    element: "fire",
    rarity: "rare",
    type: "growth",
    description: "火系技能暴击率和暴击伤害大幅提升。",
    effects: {
      critRate: 0.08,    // 暴击率+8%
      critDamage: 0.30   // 暴击伤害+30%
    }, maxLevel: 10, levelBonus: { critRate: 0.008 }
  },
  
  fire_talent_explosion: {
    id: "fire_talent_explosion",
    name: "焚天",
    element: "fire",
    rarity: "epic",
    type: "growth",
    description: "火系暴击时产生爆炸，对周围目标造成范围伤害。",
    effects: {
      damageBonus: 0.25,
      explosionChance: 0.20,
      explosionRadius: 1
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  fire_talent_legendary: {
    id: "fire_talent_legendary",
    name: "天生火魂",
    element: "fire",
    rarity: "legendary",
    description: "传说级天赋，天生与火元素高度亲和。火系伤害大幅提升，所有攻击附带燃烧，MP消耗降低。",
    effects: {
      damageBonus: 0.40,
      burnChance: 1.0,   // 必定点燃
      burnDamage: 0.08,
      mpCostReduction: 0.20
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 冰系天赋 ==========
  ice_talent_basic: {
    id: "ice_talent_basic",
    name: "寒冰之躯",
    element: "ice",
    rarity: "common",
    type: "growth",
    description: "基础的冰系天赋，提升冰系技能伤害。",
    effects: {
      damageBonus: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  ice_talent_freeze: {
    id: "ice_talent_freeze",
    name: "霜冻之心",
    element: "ice",
    rarity: "uncommon",
    type: "growth",
    description: "冰系技能有概率冻结目标一回合。",
    effects: {
      damageBonus: 0.15,
      freezeChance: 0.15
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  ice_talent_slow: {
    id: "ice_talent_slow",
    name: "冰封",
    element: "ice",
    rarity: "rare",
    type: "growth",
    description: "冰系减速效果大幅增强，冻结概率提升。",
    effects: {
      slowBonus: 0.50,
      freezeChance: 0.10
    }, maxLevel: 10, levelBonus: { slowBonus: 0.05 }
  },
  
  ice_talent_absolute: {
    id: "ice_talent_absolute",
    name: "绝对零度",
    element: "ice",
    rarity: "epic",
    type: "growth",
    description: "冰系伤害大幅提升，冻结目标受到的伤害增加。",
    effects: {
      damageBonus: 0.25,
      freezeDamageBonus: 0.20
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  ice_talent_legendary: {
    id: "ice_talent_legendary",
    name: "天生冰魂",
    element: "ice",
    rarity: "legendary",
    description: "传说级天赋，天生与冰元素高度亲和。冰系伤害大幅提升，所有攻击附带减速，防御提升。",
    effects: {
      damageBonus: 0.40,
      slowChance: 1.0,
      defenseBonus: 0.20
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 雷系天赋 ==========
  thunder_talent_basic: {
    id: "thunder_talent_basic",
    name: "雷电之体",
    element: "thunder",
    rarity: "common",
    type: "growth",
    description: "基础的雷系天赋，提升雷系技能伤害。",
    effects: {
      damageBonus: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  thunder_talent_paralyze: {
    id: "thunder_talent_paralyze",
    name: "蓄电之心",
    element: "thunder",
    rarity: "uncommon",
    type: "growth",
    description: "雷系技能有概率麻痹目标一回合。",
    effects: {
      damageBonus: 0.15,
      paralyzeChance: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  thunder_talent_chain: {
    id: "thunder_talent_chain",
    name: "连锁闪电",
    element: "thunder",
    rarity: "rare",
    type: "growth",
    description: "雷系技能有概率弹射到额外目标。",
    effects: {
      chainChance: 0.30,
      chainTargets: 1,
      chainDamageRatio: 0.60
    }, maxLevel: 10, levelBonus: { chainChance: 0.03 }
  },
  
  thunder_talent_sky: {
    id: "thunder_talent_sky",
    name: "天雷",
    element: "thunder",
    rarity: "epic",
    type: "growth",
    description: "雷系伤害大幅提升，暴击率和麻痹概率增加。",
    effects: {
      damageBonus: 0.25,
      critRate: 0.10,
      paralyzeChance: 0.15
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  thunder_talent_legendary: {
    id: "thunder_talent_legendary",
    name: "天生雷魂",
    element: "thunder",
    rarity: "legendary",
    description: "传说级天赋，天生与雷元素高度亲和。雷系伤害大幅提升，攻击必定麻痹，施法速度提升。",
    effects: {
      damageBonus: 0.40,
      paralyzeChance: 1.0,
      castSpeedBonus: 0.30
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 土系天赋 ==========
  earth_talent_basic: {
    id: "earth_talent_basic",
    name: "岩石之躯",
    element: "earth",
    rarity: "common",
    type: "growth",
    description: "基础的土系天赋，提升土系技能伤害和防御。",
    effects: {
      damageBonus: 0.10,
      defenseBonus: 0.05
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  earth_talent_heart: {
    id: "earth_talent_heart",
    name: "大地之心",
    element: "earth",
    rarity: "uncommon",
    type: "growth",
    description: "土系伤害和防御提升。",
    effects: {
      damageBonus: 0.15,
      defenseBonus: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  earth_talent_shield: {
    id: "earth_talent_shield",
    name: "岩盾",
    element: "earth",
    rarity: "rare",
    type: "growth",
    description: "受到伤害时有概率获得护盾。",
    effects: {
      shieldChance: 0.20,
      shieldRatio: 0.15
    }, maxLevel: 10, levelBonus: { shieldChance: 0.02 }
  },
  
  earth_talent_quake: {
    id: "earth_talent_quake",
    name: "山崩",
    element: "earth",
    rarity: "epic",
    type: "growth",
    description: "土系伤害大幅提升，有概率眩晕目标。",
    effects: {
      damageBonus: 0.25,
      stunChance: 0.15
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  earth_talent_legendary: {
    id: "earth_talent_legendary",
    name: "天生土魂",
    element: "earth",
    rarity: "legendary",
    description: "传说级天赋，天生与土元素高度亲和。土系伤害大幅提升，防御和HP上限大幅增加。",
    effects: {
      damageBonus: 0.40,
      defenseBonus: 0.30,
      hpBonus: 0.20
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 风系天赋 ==========
  wind_talent_basic: {
    id: "wind_talent_basic",
    name: "疾风之体",
    element: "wind",
    rarity: "common",
    type: "growth",
    description: "基础的风系天赋，提升风系技能伤害和速度。",
    effects: {
      damageBonus: 0.10,
      speedBonus: 0.05
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  wind_talent_heart: {
    id: "wind_talent_heart",
    name: "风灵之心",
    element: "wind",
    rarity: "uncommon",
    type: "growth",
    description: "风系伤害和速度提升。",
    effects: {
      damageBonus: 0.15,
      speedBonus: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  wind_talent_double: {
    id: "wind_talent_double",
    name: "连击",
    element: "wind",
    rarity: "rare",
    type: "growth",
    description: "风系技能有概率攻击两次。",
    effects: {
      doubleStrikeChance: 0.25,
      secondHitRatio: 0.70
    }, maxLevel: 10, levelBonus: { doubleStrikeChance: 0.025 }
  },
  
  wind_talent_storm: {
    id: "wind_talent_storm",
    name: "风暴",
    element: "wind",
    rarity: "epic",
    type: "growth",
    description: "风系伤害大幅提升，闪避率增加。",
    effects: {
      damageBonus: 0.25,
      dodgeBonus: 0.15
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  wind_talent_legendary: {
    id: "wind_talent_legendary",
    name: "天生风魂",
    element: "wind",
    rarity: "legendary",
    description: "传说级天赋，天生与风元素高度亲和。风系伤害大幅提升，速度和闪避率大幅增加。",
    effects: {
      damageBonus: 0.40,
      speedBonus: 0.25,
      dodgeBonus: 0.20
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 水系天赋 ==========
  water_talent_basic: {
    id: "water_talent_basic",
    name: "流水之躯",
    element: "water",
    rarity: "common",
    type: "growth",
    description: "基础的水系天赋，提升水系技能伤害，每回合恢复少量HP。",
    effects: {
      damageBonus: 0.10,
      hpRegen: 0.02
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  water_talent_heal: {
    id: "water_talent_heal",
    name: "治愈之心",
    element: "water",
    rarity: "uncommon",
    type: "growth",
    description: "水系和治疗技能效果提升。",
    effects: {
      damageBonus: 0.15,
      healBonus: 0.20
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  water_talent_moist: {
    id: "water_talent_moist",
    name: "滋润",
    element: "water",
    rarity: "rare",
    type: "growth",
    description: "水系技能附带持续回复效果。",
    effects: {
      regenChance: 0.50,
      regenAmount: 0.05
    }, maxLevel: 10, levelBonus: { regenChance: 0.05 }
  },
  
  water_talent_tide: {
    id: "water_talent_tide",
    name: "潮汐",
    element: "water",
    rarity: "epic",
    type: "growth",
    description: "水系伤害大幅提升，治疗暴击率增加。",
    effects: {
      damageBonus: 0.25,
      healCritRate: 0.15
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  water_talent_legendary: {
    id: "water_talent_legendary",
    name: "天生水魂",
    element: "water",
    rarity: "legendary",
    description: "传说级天赋，天生与水元素高度亲和。水系伤害大幅提升，治疗效果大幅增加，每回合恢复HP。",
    effects: {
      damageBonus: 0.40,
      healBonus: 0.50,
      hpRegen: 0.10
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 光系天赋 ==========
  light_talent_basic: {
    id: "light_talent_basic",
    name: "光明之体",
    element: "light",
    rarity: "common",
    type: "growth",
    description: "基础的光系天赋，提升光系技能伤害。",
    effects: {
      damageBonus: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  light_talent_holy: {
    id: "light_talent_holy",
    name: "圣光之心",
    element: "light",
    rarity: "uncommon",
    type: "growth",
    description: "光系伤害提升，对暗影系伤害额外增加。",
    effects: {
      damageBonus: 0.15,
      darkDamageBonus: 0.20
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  light_talent_purify: {
    id: "light_talent_purify",
    name: "净化",
    element: "light",
    rarity: "rare",
    type: "growth",
    description: "光系技能有概率净化目标负面状态。",
    effects: {
      purifyChance: 0.30
    }, maxLevel: 10, levelBonus: { purifyChance: 0.03 }
  },
  
  light_talent_divine: {
    id: "light_talent_divine",
    name: "神圣",
    element: "light",
    rarity: "epic",
    type: "growth",
    description: "光系伤害大幅提升，暴击时产生圣光护盾。",
    effects: {
      damageBonus: 0.25,
      shieldOnCrit: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  light_talent_legendary: {
    id: "light_talent_legendary",
    name: "天生光魂",
    element: "light",
    rarity: "legendary",
    description: "传说级天赋，天生与光元素高度亲和。光系伤害大幅提升，免疫所有负面状态。",
    effects: {
      damageBonus: 0.40,
      debuffImmunity: true
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 暗影系天赋 ==========
  dark_talent_basic: {
    id: "dark_talent_basic",
    name: "暗影之躯",
    element: "dark",
    rarity: "common",
    type: "growth",
    description: "基础的暗影系天赋，提升暗影系技能伤害。",
    effects: {
      damageBonus: 0.10
    }, maxLevel: 10, levelBonus: { damageBonus: 0.01 }
  },
  
  dark_talent_heart: {
    id: "dark_talent_heart",
    name: "黑暗之心",
    element: "dark",
    rarity: "uncommon",
    type: "growth",
    description: "暗影系伤害提升，对光系伤害额外增加。",
    effects: {
      damageBonus: 0.15,
      lightDamageBonus: 0.20
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  dark_talent_stealth: {
    id: "dark_talent_stealth",
    name: "潜行",
    element: "dark",
    rarity: "rare",
    type: "growth",
    description: "暗影系技能有概率不被闪避。",
    effects: {
      ignoreDodgeChance: 0.30
    }, maxLevel: 10, levelBonus: { ignoreDodgeChance: 0.03 }
  },
  
  dark_talent_curse: {
    id: "dark_talent_curse",
    name: "诅咒",
    element: "dark",
    rarity: "epic",
    type: "growth",
    description: "暗影系伤害大幅提升，附带持续伤害诅咒。",
    effects: {
      damageBonus: 0.25,
      curseChance: 0.40,
      curseDamage: 0.08
    }, maxLevel: 10, levelBonus: { damageBonus: 0.02 }
  },
  
  dark_talent_legendary: {
    id: "dark_talent_legendary",
    name: "天生暗魂",
    element: "dark",
    rarity: "legendary",
    description: "传说级天赋，天生与暗影元素高度亲和。暗影系伤害大幅提升，攻击必定暴击，隐身时伤害翻倍。",
    effects: {
      damageBonus: 0.40,
      guaranteedCrit: true,
      stealthDamageBonus: 1.0
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 治愈系天赋 ==========
  heal_talent_basic: {
    id: "heal_talent_basic",
    name: "慈悲之心",
    element: "heal",
    rarity: "common",
    type: "growth",
    description: "基础的治愈系天赋，提升治疗效果。",
    effects: {
      healBonus: 0.15
    }, maxLevel: 10, levelBonus: { damageBonus: 0.015 }
  },
  
  heal_talent_blessing: {
    id: "heal_talent_blessing",
    name: "生命祝福",
    element: "heal",
    rarity: "uncommon",
    type: "growth",
    description: "治疗效果提升，最大HP增加。",
    effects: {
      healBonus: 0.25,
      hpBonus: 0.10
    }, maxLevel: 10, levelBonus: { healBonus: 0.02 }
  },
  
  heal_talent_purify: {
    id: "heal_talent_purify",
    name: "圣光治愈",
    element: "heal",
    rarity: "rare",
    type: "growth",
    description: "治疗时有概率净化负面状态。",
    effects: {
      purifyOnHealChance: 0.30
    }, maxLevel: 10, levelBonus: { purifyOnHealChance: 0.03 }
  },
  
  heal_talent_spring: {
    id: "heal_talent_spring",
    name: "生命之泉",
    element: "heal",
    rarity: "epic",
    type: "growth",
    description: "治疗效果大幅提升，每回合自动恢复HP。",
    effects: {
      healBonus: 0.40,
      hpRegen: 0.05
    }, maxLevel: 10, levelBonus: { healBonus: 0.03 }
  },
  
  heal_talent_legendary: {
    id: "heal_talent_legendary",
    name: "天生治愈",
    element: "heal",
    rarity: "legendary",
    description: "传说级天赋，天生掌握生命法则。治疗效果大幅提升，可使用复活技能，冷却减少。",
    effects: {
      healBonus: 0.60,
      reviveUnlocked: true,
      cooldownReduction: 0.50
    },
    type: "innate",
    maxLevel: 1
  },

  // ========== 召唤系天赋 ==========
  summon_talent_basic: {
    id: "summon_talent_basic",
    name: "契约之心",
    element: "summon",
    rarity: "common",
    type: "growth",
    description: "基础的召唤系天赋，提升召唤兽伤害。",
    effects: {
      summonDamageBonus: 0.10
    }, maxLevel: 10, levelBonus: { healBonus: 0.01 }
  },
  
  summon_talent_link: {
    id: "summon_talent_link",
    name: "灵魂链接",
    element: "summon",
    rarity: "uncommon",
    type: "growth",
    description: "召唤兽伤害提升，召唤兽继承部分属性。",
    effects: {
      summonDamageBonus: 0.20,
      inheritStats: 0.30
    }, maxLevel: 10, levelBonus: { summonDamageBonus: 0.02 }
  },
  
  summon_talent_double: {
    id: "summon_talent_double",
    name: "双重召唤",
    element: "summon",
    rarity: "rare",
    type: "growth",
    description: "有概率同时召唤两只召唤兽。",
    effects: {
      doubleSummonChance: 0.25
    }, maxLevel: 10, levelBonus: { doubleSummonChance: 0.025 }
  },
  
  summon_talent_king: {
    id: "summon_talent_king",
    name: "兽王",
    element: "summon",
    rarity: "epic",
    type: "growth",
    description: "召唤兽伤害大幅提升，召唤兽等级+2。",
    effects: {
      summonDamageBonus: 0.40,
      summonLevelBonus: 2
    }, maxLevel: 10, levelBonus: { summonDamageBonus: 0.03 }
  },
  
  summon_talent_legendary: {
    id: "summon_talent_legendary",
    name: "天生召唤",
    element: "summon",
    rarity: "legendary",
    description: "传说级天赋，天生拥有召唤契约。召唤兽伤害大幅提升，可同时召唤三只，召唤兽自带天赋。",
    effects: {
      summonDamageBonus: 0.60,
      maxSummons: 3,
      summonHasTalent: true
    },
    type: "innate",
    maxLevel: 1
  }
};

// 稀有度配置
const TALENT_RARITY_CONFIG = {
  common: {
    name: "普通",
    color: "#ffffff",
    weight: 60  // 权重，概率越高越容易出
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
