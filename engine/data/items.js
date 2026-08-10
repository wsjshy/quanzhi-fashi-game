/**
 * 物品+装备数据
 * 从 game-data.js 拆分而来
 */

const DataItems = {
  health_potion: {
    id: "health_potion",
    name: "治愈药水",
    description: "恢复 50 点生命值",
    type: "consumable",
    icon: "🧪",
    price: 30,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: true,
    effects: {
      hp: 50
    }
  },
  mana_potion: {
    id: "mana_potion",
    name: "魔法药水",
    description: "恢复 30 点魔法值",
    type: "consumable",
    icon: "💧",
    price: 40,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: true,
    effects: {
      mp: 30
    }
  },
  super_health_potion: {
    id: "super_health_potion",
    name: "高级治愈药水",
    description: "恢复 150 点生命值",
    type: "consumable",
    icon: "🧴",
    price: 100,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: true,
    effects: {
      hp: 150
    }
  },
  magic_stone: {
    id: "magic_stone",
    name: "魔石",
    description: "蕴含魔法能量的石头，可以卖钱",
    type: "material",
    icon: "💎",
    price: 20,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false
  },
  demon_core: {
    id: "demon_core",
    name: "妖魔精核",
    description: "从妖魔体内取出的精核，很有价值",
    type: "material",
    icon: "🔮",
    price: 50,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false
  },
  wolf_fang: {
    id: "wolf_fang",
    name: "魔狼獠牙",
    description: "从独眼魔狼身上取下的獠牙，锋利坚硬，可用于锻造装备或炼药",
    type: "material",
    icon: "🦷",
    price: 30,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false
  },
  magic_herb: {
    id: "magic_herb",
    name: "魔法草药",
    description: "具有魔法能量的草药",
    type: "material",
    icon: "🌿",
    price: 15,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false
  },
  basic_staff: {
    id: "basic_staff",
    name: "基础法杖",
    description: "最基础的法杖，稍微提升魔法伤害",
    type: "weapon",
    icon: "🪄",
    price: 100,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "weapon",
    equipStats: {
      attack: 5,
      critRate: 0.02
    },
    requiredLevel: 1,
    rarity: "普通"
  },
  flame_staff: {
    id: "flame_staff",
    name: "烈焰法杖",
    description: "蕴含火焰之力的法杖",
    type: "weapon",
    icon: "🔥",
    price: 300,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "weapon",
    equipStats: {
      attack: 12,
      critRate: 0.05
    },
    elementBonus: "fire",
    requiredLevel: 3,
    rarity: "优秀"
  },
  basic_robe: {
    id: "basic_robe",
    name: "魔法长袍",
    description: "基础的魔法长袍，提供一些防护",
    type: "armor",
    icon: "👘",
    price: 80,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "armor",
    equipStats: {
      defense: 5,
      maxHp: 20
    },
    requiredLevel: 1,
    rarity: "普通"
  },
  leather_armor: {
    id: "leather_armor",
    name: "皮甲",
    description: "轻便的皮甲，提升防御和速度",
    type: "armor",
    icon: "🦺",
    price: 200,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "armor",
    equipStats: {
      defense: 10,
      maxHp: 30,
      speed: 3
    },
    requiredLevel: 2,
    rarity: "优秀"
  },
  magic_ring: {
    id: "magic_ring",
    name: "魔力戒指",
    description: "提升魔法上限的戒指",
    type: "accessory",
    icon: "💍",
    price: 150,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "accessory",
    equipStats: {
      maxMp: 30,
      spirit: 2
    },
    requiredLevel: 1,
    rarity: "普通"
  },
  speed_boots: {
    id: "speed_boots",
    name: "疾风靴",
    description: "提升移动速度的靴子",
    type: "accessory",
    icon: "👢",
    price: 250,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "accessory",
    equipStats: {
      speed: 8,
      hitRate: 0.03
    },
    requiredLevel: 2,
    rarity: "优秀"
  },
  super_mana_potion: {
    id: "super_mana_potion",
    name: "高级魔力药水",
    description: "恢复大量MP的高级药水",
    type: "consumable",
    icon: "💙",
    price: 100,
    stackable: true,
    usableInBattle: true,
    usableOutOfBattle: true,
    effects: {
      mp: 80
    },
    rarity: "稀有"
  },
  stamina_potion: {
    id: "stamina_potion",
    name: "体力药水",
    description: "恢复 40 点体力，适合长时间探索",
    type: "consumable",
    icon: "⚡",
    price: 35,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: true,
    effects: {
      stamina: 40
    }
  },
  full_potion: {
    id: "full_potion",
    name: "万能药水",
    description: "完全恢复HP和MP，珍贵的高级药水",
    type: "consumable",
    icon: "✨",
    price: 200,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: true,
    effects: {
      hp: 9999,
      mp: 9999
    }
  },
  hunter_knife: {
    id: "hunter_knife",
    name: "猎魔匕首",
    description: "猎魔者专用的匕首，对妖魔有额外伤害",
    type: "weapon",
    icon: "🗡️",
    price: 180,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "weapon",
    equipStats: {
      attack: 12,
      speed: 3,
      critRate: 0.05
    },
    requiredLevel: 3,
    rarity: "优秀"
  },
  ice_staff: {
    id: "ice_staff",
    name: "寒冰法杖",
    description: "蕴含冰系魔力的法杖，冰系法师的最爱",
    type: "weapon",
    icon: "❄️",
    price: 500,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "weapon",
    equipStats: {
      attack: 25,
      mp: 30,
      critRate: 0.05
    },
    requiredLevel: 6,
    rarity: "稀有"
  },
  ice_armor: {
    id: "ice_armor",
    name: "冰蚕护甲",
    description: "用冰蚕丝织成的护甲，轻盈且坚固",
    type: "armor",
    icon: "🧥",
    price: 600,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "armor",
    equipStats: {
      defense: 20,
      hp: 50,
      mp: 20
    },
    requiredLevel: 6,
    rarity: "稀有"
  },
  mu_family_ring: {
    id: "mu_family_ring",
    name: "穆家传家戒指",
    description: "穆氏家族的传家戒指，蕴含着强大的冰系魔力",
    type: "accessory",
    icon: "💍",
    price: 800,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "accessory",
    equipStats: {
      attack: 10,
      defense: 8,
      hp: 30,
      mp: 50,
      critRate: 0.05
    },
    requiredLevel: 8,
    rarity: "史诗"
  }
};
