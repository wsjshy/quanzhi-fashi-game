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
  },
  stardust_relic: {
    id: "stardust_relic",
    name: "星尘魔器",
    description: "魔法师梦寐以求的修炼神器，能够缩短冥修疲劳期，加长每天的冥修时间。世家核心弟子才能分配到，平民魔法师一辈子都不可能获得。",
    type: "accessory",
    icon: "🌟",
    price: 2000,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "accessory",
    equipStats: {
      maxMp: 50,
      maxStamina: 20,
      spirit: 5
    },
    requiredLevel: 3,
    rarity: "传说"
  },
  spirit_pendant: {
    id: "spirit_pendant",
    name: "温养灵坠",
    description: "带有魔法力量的配饰，可以温养精神力，魔二代从小佩戴。效果比星尘魔器弱，但胜在可以日常佩戴。",
    type: "accessory",
    icon: "📿",
    price: 300,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    equipSlot: "accessory",
    equipStats: {
      maxMp: 20,
      spirit: 2
    },
    requiredLevel: 1,
    rarity: "优秀"
  },
  dark_stone: {
    id: "dark_stone",
    name: "暗石",
    description: "一种特殊的黑色石头，能够吸收星感石散发出的光辉能量，让星感石的光芒黯然下去。穆白和穆贺曾用它在年度考核中陷害莫凡，将C级成绩拉到D甚至更低。考试包庇陷害是大罪。",
    type: "special",
    icon: "🖤",
    price: 0,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "稀有",
    lore: "年度考核暗石陷害事件的关键道具。放在星感石下方，悄无声息地吸走光芒能量。"
  },
  star_sense_stone: {
    id: "star_sense_stone",
    name: "星感石",
    description: "年度考核最重要的仪器，看上去像黑色的鹅卵石，西瓜那么大，被石墩托起在训练场前端。学生将手掌放在上面，集中精神进入冥修，星感石会根据星尘光辉强弱印射出光芒，考官通过亮度判断修炼成果。每个学生有三次机会，取最强一次。",
    type: "special",
    icon: "🔮",
    price: 0,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "传说",
    lore: "天澜魔法高中年度考核的核心仪器。光芒外溢是S级成绩的标志，极为罕见。"
  },
  small_loach_pendant: {
    id: "small_loach_pendant",
    name: "小泥鳅坠",
    description: "黑乎乎泥鳅状的坠子，学校后山门卫老头嬴老头的遗物。莫凡戴着它在后山茅屋睡觉后世界大变。看似普通，实则是天下绝品的成长型星尘魔器，与莫凡有不可斩断的灵魂联系。可以吸纳其他星尘魔器内的魔魂之能自我提升，吸纳足够多可能成长为灵级。",
    type: "special",
    icon: "🐟",
    price: 0,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "传说",
    lore: "成长型星尘魔器，莫凡专属。全年无休使用，甩别人一条街的修炼神器。成长需要精魄和其他星尘魔器为代价。",
    isSoulBound: true,
    growthStage: "mortal",
    growthProgress: 0
  },
  stardust_device_mortal: {
    id: "stardust_device_mortal",
    name: "凡级星尘魔器",
    description: "修炼神器，小小的蔚蓝色尘石，磨制过，有白色链子可戴胸前。可以缩短冥修疲劳期，加长每天冥修时间，提升20%修炼效率。学徒每天冥修5小时是极限，星尘魔器可以缩短疲劳期，长期使用拉开差距。学校按年度考核排名分配使用时间。",
    type: "accessory",
    icon: "🔵",
    price: 5000,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    rarity: "稀有",
    equipSlot: "accessory",
    equipStats: { maxMp: 20, mpRegen: 2 },
    lore: "凡级星尘魔器，提升20%修炼时间。穆氏世家核心弟子可分配，学校尖子班也有机会有限时间使用。"
  },
  stardust_device_spirit: {
    id: "stardust_device_spirit",
    name: "灵级星尘魔器",
    description: "比凡级更高级的星尘魔器，提升40%修炼效率。整个博城没几件，穆宁雪身上有一个，是穆氏家底宝物。",
    type: "accessory",
    icon: "💠",
    price: 50000,
    stackable: false,
    usableInBattle: false,
    usableOutOfBattle: true,
    rarity: "史诗",
    equipSlot: "accessory",
    equipStats: { maxMp: 50, mpRegen: 5 },
    lore: "灵级星尘魔器，提升40%修炼时间。博城没几件，穆氏世家传家之宝。"
  },
  soul_essence: {
    id: "soul_essence",
    name: "精魄",
    description: "妖魔死亡瞬间魂魄离体，若停留在身体一阵子并散发特殊灵魂之光，比普通魂魄精炼数十倍。是炼制星尘魔器最重要的材料，也是成长型星尘魔器的养料。",
    type: "material",
    icon: "👻",
    price: 200,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "稀有",
    lore: "妖魔死亡掉落的精炼魂魄，炼制星尘魔器的核心材料。收集精魄就得杀妖魔。"
  },
  speed_boots_magic: {
    id: "speed_boots_magic",
    name: "履魔具",
    description: "用奔妖后肢皮制作，附魔风轨法纹，风石提供能量。穿上催动后速度大幅提升，遇敌不过时可逃跑。二秃子小贩专卖，价格500金币。",
    type: "accessory",
    icon: "👟",
    price: 500,
    stackable: false,
    usableInBattle: true,
    usableOutOfBattle: true,
    rarity: "稀有",
    equipSlot: "accessory",
    equipStats: { speed: 15 },
    lore: "速度型魔具，穿上跑得比独眼魔狼还快。野外保命神器。"
  },
  defense_amulet_magic: {
    id: "defense_amulet_magic",
    name: "防御魔具",
    description: "与灵魂相连，催动意念迅速幻化真实物体帮助战斗的装备。可以幻化成盾牌、铠甲，抵挡魔法和妖魔攻击。普通防御魔具价值几十万，是野外猎者的救命神器。斩空总教官曾用它作为悬赏任务的奖励。",
    type: "accessory",
    icon: "🛡️",
    price: 50000,
    stackable: false,
    usableInBattle: true,
    usableOutOfBattle: true,
    rarity: "史诗",
    equipSlot: "accessory",
    equipStats: { defense: 30, maxHp: 50 },
    lore: "防御型魔具，意念催动幻化盾牌铠甲。价值几十万，野外猎者的救命神器。"
  },
  evil_eye: {
    id: "evil_eye",
    name: "邪眼",
    description: "从邪眼沼妖身上取下的眼睛，蕴含蛊惑和沼毒的力量，可用于炼药或锻造特殊装备。",
    type: "material",
    icon: "👁️",
    price: 80,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "稀有"
  },
  running_demon_hide: {
    id: "running_demon_hide",
    name: "奔妖后肢皮",
    description: "从奔妖身上取下的后肢皮，韧性极佳，是制作履魔具的上等材料。附魔风轨法纹后配合风石提供能量。",
    type: "material",
    icon: "🟫",
    price: 60,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "普通"
  },
  wind_stone: {
    id: "wind_stone",
    name: "风石",
    description: "风元素浓郁孕育的特殊石头，蕴含类似星尘魔能的能量，不能直接给魔法师用，可镶嵌在魔器魔具上提供能量。履魔具的能量来源。",
    type: "material",
    icon: "🌀",
    price: 40,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "普通",
    element: "wind"
  },
  fire_stone: {
    id: "fire_stone",
    name: "火石",
    description: "火元素浓郁孕育的特殊石头，蕴含魔能，可镶嵌在魔器魔具上提供能量。电厂用雷系魔石发电，火系魔石驱动蒸汽机。",
    type: "material",
    icon: "🔥",
    price: 40,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "普通",
    element: "fire"
  },
  vine_fiber: {
    id: "vine_fiber",
    name: "藤蔓纤维",
    description: "从妖藤身上获取的坚韧纤维，韧性极强，是制作绳索和防具的上等材料。",
    type: "material",
    icon: "🌿",
    price: 25,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableOutOfBattle: false,
    rarity: "普通",
    element: "earth"
  },
  fire_scroll: {
    id: "fire_scroll",
    name: "火焰卷轴",
    description: "封印着火系魔法的卷轴，使用后对敌人造成40点火焰伤害，有几率燃烧",
    type: "consumable",
    icon: "📜",
    price: 80,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: false,
    rarity: "稀有",
    element: "fire",
    effects: { damage: 40 },
    statusEffects: [
      { name: "燃烧", type: "burn", element: "fire", dotDamage: 6, duration: 3, chance: 0.6, stacks: 1, maxStacks: 3 }
    ]
  },
  ice_scroll: {
    id: "ice_scroll",
    name: "冰霜卷轴",
    description: "封印着冰系魔法的卷轴，使用后对敌人造成35点冰系伤害，累积冻结值",
    type: "consumable",
    icon: "📜",
    price: 80,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: false,
    rarity: "稀有",
    element: "ice",
    effects: { damage: 35 },
    statusEffects: [
      { name: "冰冻", type: "freeze", element: "ice", value: 50, duration: 3, chance: 1.0 }
    ]
  },
  thunder_scroll: {
    id: "thunder_scroll",
    name: "雷电卷轴",
    description: "封印着雷系魔法的卷轴，使用后对敌人造成45点雷系伤害，有几率麻痹",
    type: "consumable",
    icon: "📜",
    price: 100,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: false,
    rarity: "稀有",
    element: "thunder",
    effects: { damage: 45 },
    statusEffects: [
      { name: "麻痹", type: "stun", element: "thunder", duration: 1, chance: 0.5 }
    ]
  },
  cleanse_potion: {
    id: "cleanse_potion",
    name: "净化药水",
    description: "使用后清除自身所有负面状态（燃烧/冻结/麻痹/诅咒等）",
    type: "consumable",
    icon: "✨",
    price: 60,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: true,
    rarity: "稀有",
    effects: { cleanse: true }
  },
  strength_potion: {
    id: "strength_potion",
    name: "力量药水",
    description: "使用后攻击力提升15点，持续3回合",
    type: "consumable",
    icon: "💪",
    price: 70,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: false,
    rarity: "稀有",
    statusEffects: [
      { name: "力量提升", type: "attack_up", duration: 3, chance: 1.0, statModifiers: { attack: 15 } }
    ]
  },
  iron_potion: {
    id: "iron_potion",
    name: "铁壁药水",
    description: "使用后生成30点护盾并提升防御10点，持续3回合",
    type: "consumable",
    icon: "🛡️",
    price: 70,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableOutOfBattle: false,
    rarity: "稀有",
    statusEffects: [
      { name: "铁壁护盾", type: "shield", value: 30, duration: 99, chance: 1.0 },
      { name: "铁壁防御", type: "defense_up", duration: 3, chance: 1.0, statModifiers: { defense: 10 } }
    ]
  }
};
