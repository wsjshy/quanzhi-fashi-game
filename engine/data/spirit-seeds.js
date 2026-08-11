/**
 * 灵种数据
 * 天地孕育的特殊元素种子，炼化后可大幅提升对应系魔法威力
 * 品质：凡种 < 灵种 < 魂种 < 天种
 */

const DataSpiritSeeds = {
  // ========== 火系 ==========
  fire_basic: {
    id: 'fire_basic',
    name: '凡火种',
    element: 'fire',
    grade: 'mortal', // 凡种
    rarity: 'common',
    description: '最普通的火系元素种子，略有提升火系魔法威力。',
    effects: {
      damageBonus: 0.1, // 10%伤害加成
    },
    price: 50000,
  },
  fire_spirit: {
    id: 'fire_spirit',
    name: '炎灵种',
    element: 'fire',
    grade: 'spirit', // 灵种
    rarity: 'rare',
    description: '火系灵种，蕴含浓郁的火元素之力，可大幅提升火系魔法威力。',
    effects: {
      damageBonus: 0.5, // 50%伤害加成
      burnChance: 0.2, // 20%概率造成灼烧
    },
    price: 2000000,
  },
  fire_soul: {
    id: 'fire_soul',
    name: '焚魂种',
    element: 'fire',
    grade: 'soul', // 魂种
    rarity: 'epic',
    description: '火系魂种，蕴含焚天灭地之力，火系魔法威力倍增。',
    effects: {
      damageBonus: 1.0, // 100%伤害加成
      burnChance: 0.4, // 40%概率造成灼烧
      burnDamage: 0.1, // 灼烧伤害10%
    },
    price: 10000000,
  },

  // ========== 冰系 ==========
  ice_basic: {
    id: 'ice_basic',
    name: '凡冰种',
    element: 'ice',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的冰系元素种子，略有提升冰系魔法威力。',
    effects: {
      damageBonus: 0.1,
    },
    price: 50000,
  },
  ice_spirit: {
    id: 'ice_spirit',
    name: '霜灵种',
    element: 'ice',
    grade: 'spirit',
    rarity: 'rare',
    description: '冰系灵种，蕴含极寒之力，可大幅提升冰系魔法威力。',
    effects: {
      damageBonus: 0.5,
      slowChance: 0.3, // 30%概率减速
    },
    price: 2000000,
  },
  ice_glass: {
    id: 'ice_glass',
    name: '琉璃冰种',
    element: 'ice',
    grade: 'spirit',
    rarity: 'epic',
    description: '冰系灵种中的极品，琉璃般通透，威力比普通灵种更强。穆宁雪天生拥有。',
    effects: {
      damageBonus: 0.8, // 80%伤害加成
      slowChance: 0.5, // 50%概率减速
      freezeChance: 0.1, // 10%概率冻结
    },
    price: 5000000,
  },

  // ========== 雷系 ==========
  thunder_basic: {
    id: 'thunder_basic',
    name: '凡雷种',
    element: 'thunder',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的雷系元素种子，略有提升雷系魔法威力。',
    effects: {
      damageBonus: 0.1,
    },
    price: 80000, // 雷系更贵
  },
  thunder_spirit: {
    id: 'thunder_spirit',
    name: '雷灵种',
    element: 'thunder',
    grade: 'spirit',
    rarity: 'rare',
    description: '雷系灵种，蕴含狂暴的雷霆之力，可大幅提升雷系魔法威力。',
    effects: {
      damageBonus: 0.5,
      stunChance: 0.15, // 15%概率麻痹
    },
    price: 3000000, // 雷系灵种更贵
  },
  thunder_soul: {
    id: 'thunder_soul',
    name: '灭魂雷',
    element: 'thunder',
    grade: 'soul',
    rarity: 'legendary',
    description: '雷系魂种，蕴含毁灭一切的雷霆之力，雷系魔法威力倍增。',
    effects: {
      damageBonus: 1.2, // 120%伤害加成
      stunChance: 0.3, // 30%概率麻痹
      chainChance: 0.2, // 20%概率连锁
    },
    price: 20000000,
  },

  // ========== 土系 ==========
  earth_basic: {
    id: 'earth_basic',
    name: '凡土种',
    element: 'earth',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的土系元素种子，略有提升土系魔法威力。',
    effects: {
      damageBonus: 0.1,
      defenseBonus: 0.05, // 5%防御加成
    },
    price: 40000,
  },
  earth_spirit: {
    id: 'earth_spirit',
    name: '岩灵种',
    element: 'earth',
    grade: 'spirit',
    rarity: 'rare',
    description: '土系灵种，蕴含厚重的大地之力，可大幅提升土系魔法威力和防御。',
    effects: {
      damageBonus: 0.5,
      defenseBonus: 0.15, // 15%防御加成
    },
    price: 1800000,
  },

  // ========== 风系 ==========
  wind_basic: {
    id: 'wind_basic',
    name: '凡风种',
    element: 'wind',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的风系元素种子，略有提升风系魔法威力。',
    effects: {
      damageBonus: 0.1,
      speedBonus: 0.03, // 3%速度加成
    },
    price: 45000,
  },
  wind_spirit: {
    id: 'wind_spirit',
    name: '风灵种',
    element: 'wind',
    grade: 'spirit',
    rarity: 'rare',
    description: '风系灵种，蕴含轻盈的风元素之力，可大幅提升风系魔法威力和速度。',
    effects: {
      damageBonus: 0.5,
      speedBonus: 0.1, // 10%速度加成
    },
    price: 1800000,
  },

  // ========== 水系 ==========
  water_basic: {
    id: 'water_basic',
    name: '凡水种',
    element: 'water',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的水系元素种子，略有提升水系魔法威力。',
    effects: {
      damageBonus: 0.1,
      healBonus: 0.05, // 5%治疗加成
    },
    price: 40000,
  },
  water_spirit: {
    id: 'water_spirit',
    name: '水灵种',
    element: 'water',
    grade: 'spirit',
    rarity: 'rare',
    description: '水系灵种，蕴含纯净的水元素之力，可大幅提升水系魔法威力和治疗效果。',
    effects: {
      damageBonus: 0.5,
      healBonus: 0.2, // 20%治疗加成
    },
    price: 1800000,
  },

  // ========== 光系 ==========
  light_basic: {
    id: 'light_basic',
    name: '凡光种',
    element: 'light',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的光系元素种子，略有提升光系魔法威力。',
    effects: {
      damageBonus: 0.1,
      holyBonus: 0.05, // 5%神圣伤害加成
    },
    price: 60000,
  },
  light_spirit: {
    id: 'light_spirit',
    name: '圣光种',
    element: 'light',
    grade: 'spirit',
    rarity: 'rare',
    description: '光系灵种，蕴含神圣的光明之力，可大幅提升光系魔法威力。',
    effects: {
      damageBonus: 0.5,
      holyBonus: 0.2, // 20%神圣伤害加成
      purifyChance: 0.2, // 20%概率净化
    },
    price: 2200000,
  },

  // ========== 暗影系 ==========
  dark_basic: {
    id: 'dark_basic',
    name: '凡暗种',
    element: 'dark',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的暗影系元素种子，略有提升暗影系魔法威力。',
    effects: {
      damageBonus: 0.1,
      shadowBonus: 0.05, // 5%暗影伤害加成
    },
    price: 55000,
  },
  dark_spirit: {
    id: 'dark_spirit',
    name: '暗灵种',
    element: 'dark',
    grade: 'spirit',
    rarity: 'rare',
    description: '暗影系灵种，蕴含深邃的暗影之力，可大幅提升暗影系魔法威力。',
    effects: {
      damageBonus: 0.5,
      shadowBonus: 0.2, // 20%暗影伤害加成
      curseChance: 0.2, // 20%概率诅咒
    },
    price: 2100000,
  },

  // ========== 治愈系 ==========
  heal_basic: {
    id: 'heal_basic',
    name: '凡生种',
    element: 'heal',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的治愈系元素种子，略有提升治愈效果。',
    effects: {
      healBonus: 0.1, // 10%治疗加成
    },
    price: 60000,
  },
  heal_spirit: {
    id: 'heal_spirit',
    name: '生命灵种',
    element: 'heal',
    grade: 'spirit',
    rarity: 'rare',
    description: '治愈系灵种，蕴含浓郁的生命之力，可大幅提升治愈效果。',
    effects: {
      healBonus: 0.5, // 50%治疗加成
      regenBonus: 0.1, // 10%生命回复加成
    },
    price: 2500000,
  },

  // ========== 召唤系 ==========
  summon_basic: {
    id: 'summon_basic',
    name: '凡召种',
    element: 'summon',
    grade: 'mortal',
    rarity: 'common',
    description: '最普通的召唤系元素种子，略有提升召唤兽能力。',
    effects: {
      summonBonus: 0.1, // 10%召唤兽加成
    },
    price: 70000,
  },
  summon_spirit: {
    id: 'summon_spirit',
    name: '契约灵种',
    element: 'summon',
    grade: 'spirit',
    rarity: 'rare',
    description: '召唤系灵种，蕴含灵魂契约之力，可大幅提升召唤兽能力。',
    effects: {
      summonBonus: 0.5, // 50%召唤兽加成
      summonCount: 1, // 额外召唤数量
    },
    price: 2800000,
  },
};

// 灵种品质配置
const SPIRIT_SEED_GRADES = {
  mortal: { name: '凡种', color: '#999999', multiplier: 1 },
  spirit: { name: '灵种', color: '#44aaff', multiplier: 2 },
  soul: { name: '魂种', color: '#aa44ff', multiplier: 4 },
  heaven: { name: '天种', color: '#ffaa00', multiplier: 8 },
};
