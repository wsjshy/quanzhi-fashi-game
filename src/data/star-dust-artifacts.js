/**
 * 星尘魔器数据
 * 星尘魔器是修炼滋养类器皿，可以缩短冥修疲劳期，增加每天的冥修时间
 */

export const DataStarDustArtifacts = {
  // 凡级星尘魔器
  basic_fire: {
    id: "basic_fire",
    name: "凡级火尘魔器",
    element: "fire",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的火系星尘魔器，可以缩短火系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2, // 增加20%修炼时间
      expBonus: 0.1 // 增加10%修炼经验
    },
    price: 50000,
    rarity: "rare",
    icon: "🔴"
  },
  basic_ice: {
    id: "basic_ice",
    name: "凡级冰尘魔器",
    element: "ice",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的冰系星尘魔器，可以缩短冰系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 50000,
    rarity: "rare",
    icon: "🔵"
  },
  basic_thunder: {
    id: "basic_thunder",
    name: "凡级雷尘魔器",
    element: "thunder",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的雷系星尘魔器，可以缩短雷系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 80000,
    rarity: "rare",
    icon: "⚡"
  },
  basic_earth: {
    id: "basic_earth",
    name: "凡级土尘魔器",
    element: "earth",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的土系星尘魔器，可以缩短土系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 45000,
    rarity: "rare",
    icon: "🟤"
  },
  basic_wind: {
    id: "basic_wind",
    name: "凡级风尘魔器",
    element: "wind",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的风系星尘魔器，可以缩短风系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 48000,
    rarity: "rare",
    icon: "💨"
  },
  basic_water: {
    id: "basic_water",
    name: "凡级水尘魔器",
    element: "water",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的水系星尘魔器，可以缩短水系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 45000,
    rarity: "rare",
    icon: "💧"
  },
  basic_light: {
    id: "basic_light",
    name: "凡级光尘魔器",
    element: "light",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的光系星尘魔器，可以缩短光系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 70000,
    rarity: "rare",
    icon: "✨"
  },
  basic_dark: {
    id: "basic_dark",
    name: "凡级暗尘魔器",
    element: "dark",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的暗影系星尘魔器，可以缩短暗影系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 60000,
    rarity: "rare",
    icon: "🌑"
  },
  basic_heal: {
    id: "basic_heal",
    name: "凡级生尘魔器",
    element: "heal",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的治愈系星尘魔器，可以缩短治愈系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 75000,
    rarity: "rare",
    icon: "💚"
  },
  basic_summon: {
    id: "basic_summon",
    name: "凡级召尘魔器",
    element: "summon",
    grade: "basic",
    gradeName: "凡级",
    description: "最基础的召唤系星尘魔器，可以缩短召唤系冥修的疲劳期。",
    effect: {
      cultivateTimeBonus: 0.2,
      expBonus: 0.1
    },
    price: 85000,
    rarity: "rare",
    icon: "🐺"
  },

  // 灵级星尘魔器
  spirit_fire: {
    id: "spirit_fire",
    name: "灵级火尘魔器",
    element: "fire",
    grade: "spirit",
    gradeName: "灵级",
    description: "高品质的火系星尘魔器，效果是凡级的两倍。",
    effect: {
      cultivateTimeBonus: 0.4, // 增加40%修炼时间
      expBonus: 0.2 // 增加20%修炼经验
    },
    price: 500000,
    rarity: "epic",
    icon: "🔥"
  },
  spirit_ice: {
    id: "spirit_ice",
    name: "灵级冰尘魔器",
    element: "ice",
    grade: "spirit",
    gradeName: "灵级",
    description: "高品质的冰系星尘魔器，效果是凡级的两倍。",
    effect: {
      cultivateTimeBonus: 0.4,
      expBonus: 0.2
    },
    price: 500000,
    rarity: "epic",
    icon: "❄️"
  },
  spirit_thunder: {
    id: "spirit_thunder",
    name: "灵级雷尘魔器",
    element: "thunder",
    grade: "spirit",
    gradeName: "灵级",
    description: "高品质的雷系星尘魔器，效果是凡级的两倍。",
    effect: {
      cultivateTimeBonus: 0.4,
      expBonus: 0.2
    },
    price: 800000,
    rarity: "epic",
    icon: "⚡"
  },

  // 成长型星尘魔器（特殊）
  little_loach: {
    id: "little_loach",
    name: "小泥鳅坠",
    element: "all",
    grade: "growth",
    gradeName: "成长型",
    description: "一件神秘的成长型星尘魔器，可以吸收其他星尘魔器的能量进行自我提升。外形是一条小小的泥鳅。",
    effect: {
      cultivateTimeBonus: 0.3, // 初始30%，可成长
      expBonus: 0.15, // 初始15%，可成长
      canAbsorb: true // 可以吸收其他星尘魔器
    },
    level: 1,
    maxLevel: 10,
    price: 0, // 不可购买
    rarity: "legendary",
    icon: "🐉",
    isUnique: true, // 唯一物品
    boundToPlayer: true // 灵魂绑定
  }
};

// 品质配置
export const StarDustGrades = {
  basic: {
    name: "凡级",
    color: "#666666",
    multiplier: 1
  },
  spirit: {
    name: "灵级",
    color: "#9966ff",
    multiplier: 2
  },
  growth: {
    name: "成长型",
    color: "#ffcc00",
    multiplier: 1.5
  }
};

export default DataStarDustArtifacts;
