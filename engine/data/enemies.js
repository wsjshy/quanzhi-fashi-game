/**
 * 敌人/妖魔数据
 * 从 game-data.js 拆分而来
 */

const DataEnemies = {
  // ===== 低级怪（Lv1-3，新手区域）=====
  stray_wolf: {
    id: "stray_wolf",
    name: "独狼兽",
    title: "奴仆级妖魔",
    description: "在雪峰山外围游荡的孤狼，实力较弱，是刚觉醒魔法师的练手对象。",
    elements: ["dark"],
    level: 2,
    maxHp: 50,
    maxMp: 0,
    attack: 10,
    defense: 3,
    speed: 12,
    skills: ["basic_attack", "claw_slash"],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#443322",
    isEnemy: true,
    expReward: 20,
    goldReward: 15,
    dropItems: [
      { itemId: "wolf_fang", chance: 0.3, min: 1, max: 1 },
      { itemId: "demon_core", chance: 0.2, min: 1, max: 1 }
    ]
  },
  shadow_rat: {
    id: "shadow_rat",
    name: "影鼠",
    title: "奴仆级妖魔",
    description: "体型如猫的黑暗鼠类，数量众多但单体不强，常成群出没。",
    elements: ["dark"],
    level: 1,
    maxHp: 35,
    maxMp: 0,
    attack: 8,
    defense: 2,
    speed: 15,
    skills: ["basic_attack"],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#333344",
    isEnemy: true,
    expReward: 12,
    goldReward: 8,
    dropItems: [
      { itemId: "rat_tail", chance: 0.4, min: 1, max: 1 }
    ]
  },
  mountain_ape: {
    id: "mountain_ape",
    name: "山猿",
    title: "奴仆级妖魔",
    description: "栖息在山林中的猿类妖魔，力气不小但动作迟缓。",
    elements: ["earth"],
    level: 3,
    maxHp: 80,
    maxMp: 0,
    attack: 14,
    defense: 5,
    speed: 8,
    skills: ["basic_attack", "fierce_roar"],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#554433",
    isEnemy: true,
    expReward: 30,
    goldReward: 20,
    dropItems: [
      { itemId: "demon_core", chance: 0.4, min: 1, max: 1 },
      { itemId: "herb", chance: 0.3, min: 1, max: 2 }
    ]
  },
  // ===== 原有怪物 =====
  one_eye_wolf: {
    id: "one_eye_wolf",
    name: "独眼魔狼",
    title: "奴仆级妖魔",
    description: "栖息在离人类城市最近荒野区域的妖魔，只有一只眼睛，非常凶残。普通人无法对付，唯有魔法师才能与之战斗。",
    elements: [
      "dark"
    ],
    level: 6,
    maxHp: 180,
    maxMp: 0,
    attack: 22,
    defense: 8,
    speed: 15,
    skills: [
      "basic_attack",
      "claw_slash",
      "shadow_assault",
      "fierce_roar",
      "berserk_charge",
      "charge_attack",
      "double_strike"
    ],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#553322",
    isEnemy: true,
    expReward: 73,
    goldReward: 60,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.8,
        min: 1,
        max: 2
      },
      {
        itemId: "wolf_fang",
        chance: 0.6,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.4,
        min: 1,
        max: 1
      }
    ],
    locations: [
      "xuefeng_mountain",
      "bo_city_outskirts"
    ]
  },
  demon_wolf: {
    id: "demon_wolf",
    name: "幽狼兽",
    title: "奴仆级妖魔/召唤兽",
    description: "魔狼亚种，绿色皮毛锯齿獠牙，比独眼魔狼更强。性情好斗，会使用土系飞沙走石吐息。受刺激会发狂，眼睛变红，战斗力大增。",
    elements: [
      "dark", "earth"
    ],
    level: 8,
    maxHp: 200,
    maxMp: 50,
    attack: 22,
    defense: 8,
    speed: 18,
    skills: [
      "basic_attack",
      "demon_sand_breath",
      "demon_wild_charge",
      "battle_howl"
    ],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#4a7c3f",
    isEnemy: true,
    isSummon: true,
    canEnrage: true,
    aiType: "aggressive",
    expReward: 114,
    goldReward: 100,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.8,
        min: 1,
        max: 2
      },
      {
        itemId: "wolf_fang",
        chance: 0.6,
        min: 1,
        max: 2
      },
      {
        itemId: "magic_stone",
        chance: 0.5,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_mountain",
      "baicao_valley"
    ],
    growth: {
      base: {
        level: 7,
        elements: ["dark", "earth"],
        skills: ["basic_attack", "demon_sand_breath", "demon_wild_charge", "battle_howl"],
        traits: [],
        form: "normal_wolf",
        title: "奴仆级幽狼兽",
        growthType: "summon",
      },
      events: [
        {
          after: "wolf_evolution_1",
          level: 22,
          form: "advanced_wolf",
          addSkills: ["demon_three_burst", "demon_rage_frenzy"],
          addTraits: ["demon_rage_frenzy"],
          title: "进阶期幽狼兽",
        }
      ]
    }
  },
  demon_wolf_pack: {
    id: "demon_wolf_pack",
    name: "魔狼群",
    title: "奴仆级妖魔群",
    description: "博城灾难中涌入城市的魔狼群，由数只独眼魔狼组成，凶残无比。它们在黑教廷的引导下对博城发动了突袭。",
    elements: ["dark"],
    level: 8,
    maxHp: 350,
    maxMp: 80,
    attack: 20,
    defense: 8,
    speed: 16,
    skills: ["basic_attack", "dark_bolt", "wolf_howl", "wolf_pack_attack"],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#3a2a1a",
    isEnemy: true,
    isElite: true,
    aiType: "aggressive",
    expReward: 114,
    goldReward: 120,
    dropItems: [
      { itemId: "demon_core", chance: 1, min: 2, max: 3 },
      { itemId: "wolf_fang", chance: 0.8, min: 1, max: 3 },
      { itemId: "health_potion", chance: 0.5, min: 1, max: 2 }
    ],
    locations: ["bo_city_outskirts"]
  },
  shadow_creature: {
    id: "shadow_creature",
    name: "暗影怪",
    title: "奴仆级妖魔",
    description: "隐藏在阴影中的妖魔，擅长偷袭。",
    elements: [
      "dark"
    ],
    level: 3,
    maxHp: 90,
    maxMp: 0,
    attack: 14,
    defense: 4,
    speed: 16,
    skills: [
      "basic_attack",
      "shadow_assault",
      "claw_slash",
      "shadow_dodge",
      "shadow_step_strike"
    ],
    aiType: "kiter",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#442266",
    isEnemy: true,
    expReward: 37,
    goldReward: 25,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.5,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.4,
        min: 1,
        max: 1
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  rock_monster: {
    id: "rock_monster",
    name: "石怪",
    title: "奴仆级妖魔",
    description: "由岩石构成的妖魔，防御很高，但速度慢。",
    elements: [
      "earth"
    ],
    level: 6,
    maxHp: 240,
    maxMp: 0,
    attack: 20,
    defense: 18,
    speed: 6,
    skills: [
      "basic_attack",
      "rock_throw",
      "demon_regeneration",
      "stone_skin",
      "demon_earth_shield"
    ],
    aiType: "defensive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#996633",
    isEnemy: true,
    expReward: 73,
    goldReward: 50,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.8,
        min: 1,
        max: 2
      },
      {
        itemId: "magic_stone",
        chance: 0.6,
        min: 1,
        max: 3
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  wind_bird: {
    id: "wind_bird",
    name: "风翼鸟",
    title: "奴仆级妖魔",
    description: "体型巨大的鸟类妖魔，速度极快，擅长风系魔法。",
    elements: [
      "wind"
    ],
    level: 3,
    maxHp: 70,
    maxMp: 50,
    attack: 10,
    defense: 3,
    speed: 18,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_step",
      "demon_wind_barrier",
      "speed_burst"
    ],
    aiType: "kiter",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#88ccaa",
    isEnemy: true,
    expReward: 37,
    goldReward: 20,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.4,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.3,
        min: 1,
        max: 1
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  water_spider: {
    id: "water_spider",
    name: "水蛛",
    title: "奴仆级妖魔",
    description: "生活在水边的蜘蛛形妖魔，能吐出水丝束缚敌人。",
    elements: [
      "water"
    ],
    level: 5,
    maxHp: 90,
    maxMp: 60,
    attack: 12,
    defense: 5,
    speed: 10,
    skills: [
      "basic_attack",
      "water_chain",
      "web_bind",
      "water_recovery",
      "water_barrier"
    ],
    aiType: "controller",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#6699cc",
    isEnemy: true,
    expReward: 58,
    goldReward: 30,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.5,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.4,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  fire_rat: {
    id: "fire_rat",
    name: "火鼠",
    title: "奴仆级妖魔",
    description: "体型如狗的鼠类妖魔，浑身燃烧着火焰，性格暴躁。",
    elements: [
      "fire"
    ],
    level: 5,
    maxHp: 100,
    maxMp: 50,
    attack: 18,
    defense: 5,
    speed: 13,
    skills: [
      "basic_attack",
      "fire_bolt",
      "demon_fire_burst",
      "flame_cloak",
      "flame_shield"
    ],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#ff6633",
    isEnemy: true,
    aiType: "burst",
    expReward: 58,
    goldReward: 35,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.6,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.4,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  gold_ant: {
    id: "gold_ant",
    name: "金甲蚁",
    title: "奴仆级妖魔",
    description: "外壳如黄金般坚硬的蚁类妖魔，群居，数量多。",
    elements: [
      "earth"
    ],
    level: 3,
    maxHp: 100,
    maxMp: 20,
    attack: 8,
    defense: 10,
    speed: 7,
    skills: [
      "basic_attack",
      "earth_spike",
      "hard_shell",
      "armor_break"
    ],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#ccaa33",
    isEnemy: true,
    aiType: "defensive",
    expReward: 37,
    goldReward: 25,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.3,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.5,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  light_moth: {
    id: "light_moth",
    name: "光蛾",
    title: "奴仆级妖魔",
    description: "散发着耀眼光芒的飞蛾状妖魔，翅膀上的鳞粉有麻痹效果。",
    elements: [
      "light"
    ],
    level: 3,
    maxHp: 60,
    maxMp: 70,
    attack: 9,
    defense: 2,
    speed: 15,
    skills: [
      "basic_attack",
      "light_ray",
      "blind_dust"
    ],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#ffff99",
    isEnemy: true,
    aiType: "kiter",
    expReward: 37,
    goldReward: 30,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.4,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.5,
        min: 1,
        max: 1
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  thunder_beast: {
    id: "thunder_beast",
    name: "雷兽",
    title: "奴仆级妖魔",
    description: "形似豹子的妖魔，浑身缠绕着雷电，攻击力极强。",
    elements: [
      "thunder"
    ],
    level: 6,
    maxHp: 130,
    maxMp: 60,
    attack: 24,
    defense: 7,
    speed: 15,
    skills: [
      "basic_attack",
      "demon_lightning_arrow",
      "thunder_charge",
      "lightning_fur",
      "demon_thunder_strike"
    ],
    aiType: "burst",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#9966ff",
    isEnemy: true,
    expReward: 73,
    goldReward: 50,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.7,
        min: 1,
        max: 2
      },
      {
        itemId: "magic_stone",
        chance: 0.5,
        min: 1,
        max: 3
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  ice_toad: {
    id: "ice_toad",
    name: "冰蟾",
    title: "奴仆级妖魔",
    description: "生活在雪山深处的蟾蜍状妖魔，皮肤冰冷，能喷射寒冰。",
    elements: [
      "ice"
    ],
    level: 5,
    maxHp: 110,
    maxMp: 50,
    attack: 11,
    defense: 8,
    speed: 7,
    skills: [
      "basic_attack",
      "ice_spike",
      "frost_breath",
      "ice_armor"
    ],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#99ddff",
    isEnemy: true,
    aiType: "controller",
    expReward: 58,
    goldReward: 30,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.5,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.4,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  shadow_snake: {
    id: "shadow_snake",
    name: "影蛇",
    title: "奴仆级妖魔",
    description: "隐藏在阴影中的蛇形妖魔，擅长偷袭，毒性很强。",
    elements: [
      "dark"
    ],
    level: 5,
    maxHp: 75,
    maxMp: 45,
    attack: 14,
    defense: 4,
    speed: 16,
    skills: [
      "basic_attack",
      "dark_bolt",
      "poison_fang",
      "shadow_dodge"
    ],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#553377",
    isEnemy: true,
    aiType: "kiter",
    expReward: 58,
    goldReward: 35,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.5,
        min: 1,
        max: 1
      },
      {
        itemId: "magic_stone",
        chance: 0.4,
        min: 1,
        max: 1
      }
    ],
    locations: [
      "xuefeng_mountain"
    ]
  },
  giant_eye_rat: {
    id: "giant_eye_rat",
    name: "巨眼猩鼠",
    title: "战将级妖魔",
    description: "长期生活在土壤里的鼠类妖魔，挖地洞的能手，脖子可以异常伸长。脑袋上唯有一个篮球大的眼睛和一张塞满发馊食物的大嘴，眼睛能释放穿透性的腥红暗光束。一般很怂，只吃人类残羹冷炙，除非饥饿到极点才会吃人，繁衍速度极快。",
    elements: [
      "wind"
    ],
    level: 10,
    maxHp: 360,
    maxMp: 0,
    attack: 32,
    defense: 16,
    speed: 22,
    skills: [
      "basic_attack",
      "claw_slash",
      "wind_slash",
      "demon_wild_charge",
      "blood_bite"
    ],
    aiType: "kiter",
    enemyType: "demon",
    spriteColor: "#aa6633",
    isEnemy: true,
    demonTier: "warrior",
    expReward: 238,
    goldReward: 150,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 1,
        min: 2,
        max: 4
      },
      {
        itemId: "magic_stone",
        chance: 0.8,
        min: 2,
        max: 5
      },
      {
        itemId: "super_health_potion",
        chance: 0.3,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_deep"
    ]
  },
  bone_spike_zheng: {
    id: "bone_spike_zheng",
    name: "骨刺狰",
    title: "战将级妖魔",
    description: "浑身长满骨刺的狰类妖魔，防御极高，攻击力也很强，是雪峰山深处的可怕存在。",
    elements: [
      "earth"
    ],
    level: 14,
    maxHp: 600,
    maxMp: 80,
    attack: 40,
    defense: 25,
    speed: 12,
    skills: [
      "basic_attack",
      "earth_spike",
      "demon_earth_shield",
      "war_stomp",
      "demon_regeneration",
      "thorn_armor",
      "triple_slash"
    ],
    spriteColor: "#888888",
    isEnemy: true,
    demonTier: "warrior",
    aiType: "defensive",
    expReward: 304,
    goldReward: 200,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 1,
        min: 3,
        max: 5
      },
      {
        itemId: "magic_stone",
        chance: 0.9,
        min: 3,
        max: 6
      },
      {
        itemId: "mana_potion",
        chance: 0.4,
        min: 1,
        max: 3
      }
    ],
    locations: [
      "xuefeng_deep"
    ]
  },
  black_church_acolyte: {
    id: "black_church_acolyte",
    name: "黑教廷教徒",
    title: "黑教廷低阶成员",
    description: "黑教廷的底层成员，穿着黑色长袍，实力一般，但行踪诡秘。",
    elements: [
      "dark"
    ],
    level: 6,
    maxHp: 140,
    maxMp: 60,
    attack: 16,
    defense: 7,
    speed: 12,
    skills: [
      "basic_attack",
      "dark_bolt",
      "curse_weakness"
    ],
    spriteColor: "#330033",
    aiType: "aggressive",
    isEnemy: true,
    enemyType: "human",
    faction: "black_church",
    expReward: 61,
    goldReward: 50,
    dropItems: [
      {
        itemId: "magic_stone",
        chance: 0.5,
        min: 1,
        max: 3
      },
      {
        itemId: "health_potion",
        chance: 0.3,
        min: 1,
        max: 2
      }
    ],
    locations: [
      "xuefeng_mountain",
      "xuefeng_deep"
    ]
  },
  black_church_deacon: {
    id: "black_church_deacon",
    name: "黑教廷执事",
    title: "黑教廷中阶成员",
    description: "黑教廷的执事级成员，实力较强，精通暗影魔法，非常危险。",
    elements: [
      "dark",
      "fire"
    ],
    level: 10,
    maxHp: 300,
    maxMp: 150,
    attack: 34,
    defense: 15,
    speed: 16,
    skills: [
      "basic_attack",
      "dark_bolt",
      "fire_bolt"
    ],
    spriteColor: "#440044",
    isEnemy: true,
    enemyType: "human",
    faction: "black_church",
    expReward: 149,
    goldReward: 150,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.3,
        min: 1,
        max: 2
      },
      {
        itemId: "magic_stone",
        chance: 0.8,
        min: 2,
        max: 5
      },
      {
        itemId: "super_health_potion",
        chance: 0.2,
        min: 1,
        max: 1
      }
    ],
    locations: [
      "xuefeng_deep"
    ]
  },
  black_church_blue_deacon: {
    id: "black_church_blue_deacon",
    name: "蓝衣执事",
    title: "黑教廷蓝衣执事",
    description: "黑教廷的蓝衣执事，实力强大，是博城灾难的幕后黑手之一。",
    elements: [
      "dark",
      "ice"
    ],
    level: 20,
    maxHp: 500,
    maxMp: 300,
    attack: 45,
    defense: 20,
    speed: 18,
    skills: [
      "basic_attack",
      "dark_bolt",
      "ice_spike",
      "ice_shield"
    ],
    spriteColor: "#000066",
    isEnemy: true,
    aiType: "tactical",
    enemyType: "human",
    faction: "black_church",
    isBoss: true,
    expReward: 439,
    goldReward: 500,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 1,
        min: 3,
        max: 5
      },
      {
        itemId: "magic_stone",
        chance: 1,
        min: 5,
        max: 10
      },
      {
        itemId: "super_health_potion",
        chance: 0.8,
        min: 2,
        max: 3
      },
      {
        itemId: "mana_potion",
        chance: 0.8,
        min: 2,
        max: 3
      }
    ],
    locations: []
  },
  evil_eye_swamp_demon: {
    id: "evil_eye_swamp_demon",
    name: "邪眼沼妖",
    title: "奴仆级妖魔",
    description: "潜伏在人类城市中的妖魔，拥有邪眼可以中邪蛊惑人心，还能释放沼毒。猎者联盟长期追踪的危险妖魔，发现后会发布浅色警戒，示意市民不要外出到深山。",
    elements: ["dark", "water"],
    level: 8,
    maxHp: 180,
    maxMp: 80,
    attack: 16,
    defense: 8,
    speed: 10,
    skills: ["basic_attack", "water_chain", "evil_eye_gaze", "poison_cloud", "mind_confuse"],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#556b2f",
    isEnemy: true,
    aiType: "controller",
    expReward: 114,
    goldReward: 100,
    dropItems: [
      { itemId: "demon_core", chance: 0.9, min: 1, max: 2 },
      { itemId: "magic_stone", chance: 0.5, min: 1, max: 2 },
      { itemId: "evil_eye", chance: 0.3, min: 1, max: 1 }
    ],
    locations: ["city_street", "bo_city_outskirts", "xuefeng_mountain"]
  },
  running_demon: {
    id: "running_demon",
    name: "奔妖",
    title: "奴仆级妖魔",
    description: "速度极快的妖魔，后肢力量惊人，是制作履魔具的上等材料。奔妖后肢皮附魔风轨法纹，配合风石提供能量，可以让穿戴者跑得比独眼魔狼还快。",
    elements: ["wind"],
    level: 6,
    maxHp: 100,
    maxMp: 30,
    attack: 14,
    defense: 4,
    speed: 22,
    skills: ["basic_attack", "wind_blade", "wind_speed", "speed_burst"],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#8fbc8f",
    isEnemy: true,
    aiType: "kiter",
    expReward: 73,
    goldReward: 70,
    dropItems: [
      { itemId: "demon_core", chance: 0.7, min: 1, max: 1 },
      { itemId: "running_demon_hide", chance: 0.6, min: 1, max: 1 },
      { itemId: "wind_stone", chance: 0.4, min: 1, max: 1 }
    ],
    locations: ["xuefeng_mountain", "xuefeng_deep", "bo_city_outskirts"]
  },
  demon_vine: {
    id: "demon_vine",
    name: "妖藤",
    title: "奴仆级植物妖魔",
    description: "生长在百草谷的植物系妖魔，藤蔓带荆棘倒刺，能捆绑敌人。怕火，对雷系有较强抗性。",
    elements: ["earth", "neutral"],
    level: 5,
    maxHp: 150,
    maxMp: 40,
    attack: 12,
    defense: 10,
    speed: 6,
    skills: ["basic_attack", "demon_vine_bind", "thorn_shot"],
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#228b22",
    isEnemy: true,
    aiType: "controller",
    isPlant: true,
    fireWeakness: 1.8,
    thunderResistance: 0.5,
    expReward: 58,
    goldReward: 50,
    dropItems: [
      { itemId: "demon_core", chance: 0.5, min: 1, max: 1 },
      { itemId: "vine_fiber", chance: 0.7, min: 1, max: 2 },
      { itemId: "magic_herb", chance: 0.4, min: 1, max: 1 }
    ],
    locations: ["baicao_valley", "xuefeng_mountain"]
  },
  giant_eye_mole_rat: {
    id: "giant_eye_mole_rat",
    name: "巨眼猩鼠",
    title: "奴仆级妖魔",
    description: "长期生活在土壤里的妖魔，挖地洞的能手，更喜欢生存在城市下水道和垃圾场。脖子可以伸长，篮球大的眼睛会释放穿透腥红暗光束。繁衍速度极快，生存能力强，一般只吃人类残羹冷炙，饥饿到一定程度才会吃人。",
    level: 6,
    elements: ["dark"],
    maxHp: 120,
    attack: 18,
    defense: 8,
    speed: 14,
    skills: ["basic_attack", "crimson_beam", "shadow_assault"],
    aiType: "kiter",
    specialAbility: "腥红光束：远程穿透攻击，无视部分防御",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#8b4513",
    isEnemy: true,
    canBurrow: true,
    ignoreDefense: 0.3,
    expReward: 73,
    goldReward: 40,
    dropItems: [
      { itemId: "demon_core", chance: 0.3, min: 1, max: 1 },
      { itemId: "magic_herb", chance: 0.3, min: 1, max: 1 },
      { itemId: "rat_claw", chance: 0.5, min: 1, max: 2 }
    ],
    locations: ["city_street", "mingwen_girls_school"]
  },
  one_eye_wolf_advanced: {
    id: "one_eye_wolf_advanced",
    name: "进阶期独眼魔狼",
    title: "战将级妖魔（进阶中）",
    description: "偷吸了博城地圣泉能量的独眼魔狼，正处在进阶期，肌肉骨骼正在蜕变，战斗力远超普通独眼魔狼。雷系魔法对其有特效。",
    elements: ["dark"],
    level: 20,
    maxHp: 400,
    maxMp: 80,
    attack: 35,
    defense: 18,
    speed: 22,
    skills: ["basic_attack", "wolf_bite", "berserk_charge", "spine_sweep", "wolf_breath", "demon_rage"],
    aiType: "tactical",
    specialAbility: "冲撞：高速撞击造成大量伤害；进阶中：身体持续变强，雷系可抑制进阶",
    enemyType: "demon",
    demonTier: "warrior",
    spriteColor: "#4a0000",
    isEnemy: true,
    isElite: true,
    canEnrage: true,
    thunderWeakness: 2.0,
    fireResistance: 0.5,
    expReward: 703,
    goldReward: 200,
    dropItems: [
      { itemId: "demon_core", chance: 0.8, min: 1, max: 2 },
      { itemId: "wolf_fang", chance: 0.6, min: 1, max: 2 },
      { itemId: "soul_fragment", chance: 0.15, min: 1, max: 1 },
      { itemId: "elite_soul", chance: 0.05, min: 1, max: 1 }
    ],
    locations: ["old_banyan_district"]
  },
  yu_ang_duel: {
    id: "yu_ang_duel",
    name: "宇昂",
    title: "穆氏养子 / 冰系天才",
    description: "穆卓云的养子，冰系天才，已掌握3级冰蔓·覆盖。身上有地波履魔具，可以快速移动。成年礼决斗的对手。",
    elements: ["ice"],
    level: 14,
    maxHp: 250,
    maxMp: 120,
    attack: 28,
    defense: 14,
    speed: 18,
    skills: ["basic_attack", "ice_spike", "ice_freeze", "ice_cover"],
    aiType: "controller",
    specialAbility: "地波履魔具：每3回合闪避一次攻击；冰蔓覆盖：3级冰系范围冻结",
    spriteColor: "#aaddff",
    isEnemy: true,
    isBoss: true,
    dodgeEvery: 3,
    expReward: 190,
    goldReward: 300,
    dropItems: [
      { itemId: "ice_crystal", chance: 0.5, min: 1, max: 1 },
      { itemId: "magic_crystal", chance: 0.3, min: 1, max: 1 },
      { itemId: "super_mana_potion", chance: 0.4, min: 1, max: 2 }
    ],
    locations: ["mu_manor"]
  },
  three_eye_demon_wolf: {
    id: "three_eye_demon_wolf",
    name: "三眼魔狼（骨刺狰狼）",
    title: "战将级妖魔",
    description: "战将级妖魔，魔狼种群的统领级之下的高级战将。三只眼睛拥有270度视角，浑身骨刺如钢铁般坚硬。率领数百只独眼魔狼进攻博城的先锋将领。",
    elements: ["dark", "earth"],
    level: 25,
    maxHp: 800,
    maxMp: 150,
    attack: 60,
    defense: 35,
    speed: 28,
    spirit: 20,
    skills: ["basic_attack", "wolf_bite", "demon_bone_spike", "bone_throw", "wolf_howl", "third_eye_sight", "iron_body", "berserk_charge"],
    aiType: "tactical",
    enemyType: "demon",
    demonTier: "warrior",
    spriteColor: "#884422",
    isEnemy: true,
    isBoss: true,
    summonSkill: "wolf_howl",
    summonEnemy: "one_eye_wolf",
    summonCount: 2,
    expReward: 1414,
    goldReward: 800,
    dropItems: [
      { itemId: "demon_core", chance: 0.6, min: 1, max: 1 },
      { itemId: "wolf_fang", chance: 0.8, min: 2, max: 4 },
      { itemId: "bone_spike", chance: 0.5, min: 1, max: 2 },
      { itemId: "elite_soul", chance: 0.1, min: 1, max: 1 }
    ],
    locations: ["xuefeng_mountain", "bo_city"]
  },
  student_rival: {
    id: "student_rival",
    name: "切磋同学",
    title: "天澜魔法高中学生",
    description: "一个和你一样刚觉醒魔法不久的学生，想和你切磋一下。",
    elements: ["fire"],
    level: 5,
    maxHp: 120,
    maxMp: 60,
    attack: 12,
    defense: 5,
    speed: 12,
    skills: ["basic_attack", "fire_bolt"],
    aiType: "aggressive",
    spriteColor: "#cc4422",
    isEnemy: true,
    isHuman: true,
    expReward: 48,
    goldReward: 20,
    dropItems: [],
    locations: ["tianlan_school", "city_street"]
  },

  // ========== 博城灾难新增妖魔 ==========
  blood_pattern_rat: {
    id: "blood_pattern_rat",
    name: "血纹巨魔鼠",
    title: "战将级妖魔",
    description: "体型巨大的鼠类妖魔，身上布满血色纹路，拥有极快的速度和锋利的爪子。地圣泉奇袭的元凶之一。",
    elements: ["dark", "earth"],
    level: 17,
    maxHp: 700,
    maxMp: 120,
    attack: 45,
    defense: 20,
    speed: 30,
    skills: ["basic_attack", "claw_tear", "speed_charge", "blood_rage", "berserk_charge"],
    aiType: "aggressive",
    spriteColor: "#882222",
    isEnemy: true,
    demonTier: "warrior",
    isBoss: false,
    expReward: 462,
    goldReward: 250,
    dropItems: [
      { itemId: "demon_core", chance: 1, min: 3, max: 5 },
      { itemId: "magic_stone", chance: 0.9, min: 2, max: 6 },
      { itemId: "super_health_potion", chance: 0.4, min: 1, max: 2 },
      { itemId: "elite_soul", chance: 0.15, min: 1, max: 1 }
    ],
    locations: ["bo_city", "earth_spring"]
  },
  black_beast: {
    id: "black_beast",
    name: "黑畜妖",
    title: "奴仆级妖魔（黑教廷）",
    description: "黑教廷的标志生物，由活人炼制而成，速度极快，爪子锋利，与主人灵魂相连。主人死亡时也会随之死亡。",
    elements: ["dark"],
    level: 9,
    maxHp: 250,
    maxMp: 60,
    attack: 30,
    defense: 10,
    speed: 30,
    skills: ["basic_attack", "dark_claw", "life_drain", "terror_screech", "life_steal_bite", "shadow_lurk", "coordinated_assault"],
    aiType: "aggressive",
    spriteColor: "#222222",
    isEnemy: true,
    demonTier: "servant",
    isBlackChurch: true,
    blindImmune: true,  // 没有眼睛，不受失明影响
    expReward: 142,
    goldReward: 80,
    dropItems: [
      { itemId: "demon_core", chance: 0.7, min: 1, max: 2 },
      { itemId: "dark_crystal", chance: 0.3, min: 1, max: 1 },
      { itemId: "black_robe_fragment", chance: 0.2, min: 1, max: 1 }
    ],
    locations: ["bo_city"]
  },
  winged_gray_wolf: {
    id: "winged_gray_wolf",
    name: "翼苍狼",
    title: "统领级妖魔",
    description: "博城灾难的元凶，统领级妖魔，背生双翼，能飞天遁地，实力远超战将级。率领无数魔狼进攻博城，造成了巨大的灾难。",
    elements: ["wind", "dark"],
    level: 34,
    maxHp: 4000,
    maxMp: 500,
    attack: 150,
    defense: 75,
    speed: 40,
    skills: ["basic_attack", "wolf_bite", "wind_blade", "dark_bolt", "wolf_howl", "sky_dive", "fear_roar", "demon_rage", "demon_domain", "beast_king_roar", "blood_decay_claw", "beast_wind"],
    aiType: "tactical",
    spriteColor: "#555555",
    isEnemy: true,
    demonTier: "commander",
    isBoss: true,
    canFly: true,
    summonSkill: "wolf_howl",
    summonEnemy: "one_eye_wolf",
    summonCount: 3,
    expReward: 6743,
    goldReward: 3000,
    dropItems: [
      { itemId: "demon_core", chance: 1, min: 10, max: 20 },
      { itemId: "magic_stone", chance: 1, min: 5, max: 10 },
      { itemId: "super_health_potion", chance: 1, min: 3, max: 5 },
      { itemId: "super_mana_potion", chance: 1, min: 3, max: 5 },
      { itemId: "elite_soul", chance: 0.5, min: 1, max: 3 },
      { itemId: "commander_soul", chance: 0.1, min: 1, max: 1 },
      { itemId: "wolf_king_fang", chance: 0.3, min: 1, max: 1 }
    ],
    locations: ["bo_city"]
  },
  
  // ==================== 魔法师类敌人 ====================
  // 使用元素魔法，和玩家模型类似
  
  mage_student: {
    id: "mage_student",
    name: "切磋同学",
    title: "初阶法师",
    description: "天澜魔法高中的学生，初阶法师，用来切磋练习。",
    elements: ["fire"],
    level: 5,
    maxHp: 100,
    maxMp: 80,
    attack: 10,
    defense: 5,
    speed: 12,
    spirit: 10,
    skills: [
      "basic_attack",
      "fire_bolt"
    ],
    aiType: "aggressive",
    enemyType: "mage",
    spriteColor: "#ff6633",
    isEnemy: true,
    isMage: true,
    expReward: 48,
    goldReward: 40,
    dropItems: [
      { itemId: "magic_stone", chance: 0.5, min: 1, max: 2 },
      { itemId: "mana_potion", chance: 0.3, min: 1, max: 1 }
    ]
  },
  
  mu_bai_duel: {
    id: "mu_bai_duel",
    name: "穆白",
    title: "冰系初阶法师",
    description: "穆氏家族的天才，冰系初阶法师，性格高傲，实力在班级中名列前茅。",
    elements: ["ice"],
    level: 8,
    maxHp: 150,
    maxMp: 120,
    attack: 15,
    defense: 8,
    speed: 14,
    spirit: 15,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_chain"
    ],
    aiType: "controller",
    enemyType: "mage",
    spriteColor: "#66ccff",
    isEnemy: true,
    isMage: true,
    isNoble: true,
    expReward: 95,
    goldReward: 150,
    dropItems: [
      { itemId: "magic_stone", chance: 0.8, min: 2, max: 4 },
      { itemId: "mana_potion", chance: 0.5, min: 1, max: 2 },
      { itemId: "ice_crystal", chance: 0.2, min: 1, max: 1 }
    ]
  },

  mu_ningxue_spar: {
    id: "mu_ningxue_spar",
    name: "穆宁雪",
    title: "冰系天才",
    description: "穆氏家族的千金，冰系天赋极高。切磋时她不会全力出手，但依然实力强劲。",
    elements: ["ice"],
    level: 6,
    maxHp: 180,
    maxMp: 150,
    attack: 18,
    defense: 10,
    speed: 14,
    spirit: 18,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_shield"
    ],
    aiType: "controller",
    enemyType: "mage",
    spriteColor: "#66ccff",
    isEnemy: true,
    isMage: true,
    isNoble: true,
    expReward: 120,
    goldReward: 100,
    dropItems: [
      { itemId: "magic_stone", chance: 0.6, min: 2, max: 3 },
      { itemId: "mana_potion", chance: 0.4, min: 1, max: 2 },
      { itemId: "ice_crystal", chance: 0.3, min: 1, max: 1 }
    ]
  },
  
  zhao_kunsan_duel: {
    id: "zhao_kunsan_duel",
    name: "赵坤三",
    title: "土系初阶法师",
    description: "土系法师，性格憨厚，防御很强，是穆白的跟班。",
    elements: ["earth"],
    level: 6,
    maxHp: 180,
    maxMp: 80,
    attack: 12,
    defense: 15,
    speed: 8,
    spirit: 10,
    skills: [
      "basic_attack",
      "earth_spike",
      "demon_earth_shield"
    ],
    aiType: "defensive",
    enemyType: "mage",
    spriteColor: "#cc9966",
    isEnemy: true,
    isMage: true,
    expReward: 61,
    goldReward: 100,
    dropItems: [
      { itemId: "magic_stone", chance: 0.7, min: 2, max: 3 },
      { itemId: "health_potion", chance: 0.5, min: 1, max: 2 }
    ]
  },

  zhang_xiaohou_duel: {
    id: "zhang_xiaohou_duel",
    name: "张小侯",
    title: "风系初阶法师",
    description: "莫凡的发小，风系法师，速度很快，性格活泼热心。切磋时很认真但不会下狠手。",
    elements: ["wind"],
    level: 5,
    maxHp: 100,
    maxMp: 70,
    attack: 11,
    defense: 5,
    speed: 18,
    spirit: 10,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_speed"
    ],
    aiType: "agile",
    enemyType: "mage",
    spriteColor: "#99ff99",
    isEnemy: true,
    isMage: true,
    expReward: 50,
    goldReward: 80,
    dropItems: [
      { itemId: "magic_stone", chance: 0.6, min: 1, max: 3 },
      { itemId: "mana_potion", chance: 0.4, min: 1, max: 1 }
    ]
  },
  
  black_church_mage: {
    id: "black_church_mage",
    name: "黑教廷执事",
    title: "暗影系法师",
    description: "黑教廷的执事，暗影系法师，擅长诅咒和暗杀，非常危险。",
    elements: ["dark"],
    level: 10,
    maxHp: 200,
    maxMp: 150,
    attack: 25,
    defense: 10,
    speed: 18,
    spirit: 20,
    skills: [
      "basic_attack",
      "dark_bolt",
      "dark_claw",
      "dark_curse"
    ],
    aiType: "controller",
    enemyType: "mage",
    spriteColor: "#330033",
    isEnemy: true,
    isMage: true,
    isBlackChurch: true,
    expReward: 149,
    goldReward: 250,
    dropItems: [
      { itemId: "demon_core", chance: 0.8, min: 2, max: 4 },
      { itemId: "dark_crystal", chance: 0.4, min: 1, max: 2 },
      { itemId: "black_robe_fragment", chance: 0.3, min: 1, max: 1 },
      { itemId: "forbidden_spell_book", chance: 0.1, min: 1, max: 1 }
    ]
  },

  // ========== 新增妖魔 ==========

  bone_eating_worm: {
    id: "bone_eating_worm",
    name: "噬骨虫",
    title: "奴仆级妖魔",
    description: "生活在地下的恶心妖魔，能喷射腐蚀酸液溶解骨骼，喜欢从地下突然袭击猎物。",
    elements: ["earth"],
    level: 5,
    maxHp: 140,
    maxMp: 0,
    attack: 18,
    defense: 12,
    speed: 8,
    skills: [
      "basic_attack",
      "acid_spray",
      "burrow_attack"
    ],
    aiType: "tactical",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#8B4513",
    isEnemy: true,
    expReward: 58,
    goldReward: 50,
    dropItems: [
      { itemId: "demon_core", chance: 0.6, min: 1, max: 1 },
      { itemId: "worm_shell", chance: 0.4, min: 1, max: 1 },
      { itemId: "magic_stone", chance: 0.2, min: 1, max: 1 }
    ],
    locations: ["bo_city_outskirts", "underground_caves"]
  },

  // ===== 新妖魔 =====
  skeleton_warrior: {
    id: "skeleton_warrior",
    name: "骷髅战士",
    title: "奴仆级亡灵",
    description: "黑教廷用亡灵魔法召唤的骷髅兵，手持骨剑，不知疼痛，防御较高。",
    isCanon: false,
    canonNote: "非原著妖魔，游戏原创",
    elements: ["dark"],
    level: 6,
    maxHp: 150,
    maxMp: 0,
    attack: 18,
    defense: 12,
    speed: 10,
    spirit: 5,
    skills: [
      "basic_attack",
      "double_strike",
      "bone_slash"
    ],
    aiType: "aggressive",
    enemyType: "undead",
    spriteColor: "#e8e8e8",
    isEnemy: true,
    expReward: 61,
    goldReward: 40,
    dropItems: [
      { itemId: "demon_core", chance: 0.7, min: 1, max: 2 },
      { itemId: "bone_fragment", chance: 0.5, min: 1, max: 2 }
    ],
    locations: ["ancient_tomb", "bo_city_outskirts"]
  },

  ghost: {
    id: "ghost",
    name: "幽灵",
    title: "奴仆级亡灵",
    description: "飘忽不定的灵体，闪避极高，能吸取生命精华。物理攻击对其效果减半。",
    isCanon: false,
    canonNote: "非原著妖魔，游戏原创",
    elements: ["dark"],
    level: 8,
    maxHp: 120,
    maxMp: 60,
    attack: 14,
    defense: 5,
    speed: 22,
    spirit: 20,
    skills: [
      "basic_attack",
      "life_drain",
      "shadow_step_strike",
      "phase_strike",
      "terror_screech"
    ],
    aiType: "kiter",
    enemyType: "undead",
    spriteColor: "#a0a0ff",
    isEnemy: true,
    isInsubstantial: true,
    expReward: 95,
    goldReward: 60,
    dropItems: [
      { itemId: "demon_core", chance: 0.8, min: 1, max: 2 },
      { itemId: "soul_fragment", chance: 0.3, min: 1, max: 1 }
    ],
    locations: ["ancient_tomb", "abandoned_church"]
  },

  iron_scorpion: {
    id: "iron_scorpion",
    name: "铁甲蝎",
    title: "奴仆级妖魔",
    description: "全身覆盖铁甲的巨蝎，防御极高，尾刺带有剧毒。",
    isCanon: false,
    canonNote: "非原著妖魔，游戏原创",
    elements: ["earth", "dark"],
    level: 9,
    maxHp: 280,
    maxMp: 30,
    attack: 22,
    defense: 20,
    speed: 8,
    spirit: 8,
    skills: [
      "basic_attack",
      "poison_fang",
      "armor_break",
      "stone_skin",
      "iron_defense"
    ],
    aiType: "defensive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#8b4513",
    isEnemy: true,
    expReward: 142,
    goldReward: 80,
    dropItems: [
      { itemId: "demon_core", chance: 0.9, min: 1, max: 2 },
      { itemId: "scorpion_tail", chance: 0.4, min: 1, max: 1 },
      { itemId: "iron_shell", chance: 0.3, min: 1, max: 1 }
    ],
    locations: ["desert_ruins", "rocky_canyon"]
  },

  thunder_hawk: {
    id: "thunder_hawk",
    name: "雷鹰",
    title: "奴仆级妖魔",
    description: "翱翔于雷云之中的猛禽，速度极快，能召唤雷电攻击。",
    isCanon: false,
    canonNote: "非原著妖魔，游戏原创",
    elements: ["thunder", "wind"],
    level: 10,
    maxHp: 200,
    maxMp: 80,
    attack: 25,
    defense: 8,
    speed: 32,
    spirit: 15,
    skills: [
      "basic_attack",
      "demon_lightning_arrow",
      "demon_thunder_strike",
      "thunder_dive",
      "speed_burst"
    ],
    aiType: "kiter",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#4169e1",
    isEnemy: true,
    isFlying: true,
    expReward: 178,
    goldReward: 100,
    dropItems: [
      { itemId: "demon_core", chance: 0.9, min: 1, max: 2 },
      { itemId: "thunder_feather", chance: 0.5, min: 1, max: 2 },
      { itemId: "wind_crystal", chance: 0.3, min: 1, max: 1 }
    ],
    locations: ["thunder_mountain", "sky_plateau"]
  },

  // ========== 小说原著人类敌人（第131-140章） ==========

  // 第131章 朝赫 - 通缉犯，火系+诅咒系中阶法师，药剂师
  chao_he: {
    id: "chao_he",
    name: "朝赫",
    title: "通缉犯·药剂师",
    description: "小说原著人物。火系和诅咒系中阶法师，同时是药剂师。狡猾阴险，拥有岩军魔铠和水饶之盾。为争夺玫炎灵种杀害多名法师，被审判会通缉。",
    elements: ["fire", "curse"],
    level: 20,
    maxHp: 650,
    maxMp: 200,
    attack: 35,
    defense: 15,
    speed: 18,
    spirit: 25,
    skills: [
      "basic_attack",
      "fire_fist",
      "curse_spider_trap",
      "water_arc_shield"
    ],
    aiType: "tactical",
    enemyType: "human", // 人类法师，不是妖魔
    spriteColor: "#8B0000",
    isEnemy: true,
    isBoss: true,
    isCanon: true,
    canonSource: "第131章 暴火唐月",
    // 朝赫有岩军魔铠（已在战斗中被唐月烧毁，这里作为初始防御加成）
    traits: ["apothecary", "cunning"],
    expReward: 439,
    goldReward: 300,
    dropItems: [
      { itemId: "demon_core", chance: 1, min: 2, max: 4 },
      { itemId: "fire_spirit_stone", chance: 0.5, min: 1, max: 2 }
    ],
    locations: ["xishui_town"],
    // 战斗对话
    battleQuotes: {
      start: "你以为能抓住我？",
      lowHp: "可恶...你这小子！",
      death: "不可能...我怎么会死在这里..."
    }
  },

  // ===== 第二卷 明珠学府篇 =====
  luo_song: {
    id: "luo_song",
    name: "罗宋",
    title: "明珠学府新生·双系中阶",
    description: "小说原著人物。富家子弟，土系+冰系双系中阶法师，性格傲慢。入学测试时与莫凡竞争，被莫凡的霹雳震慑。",
    elements: ["earth", "ice"],
    level: 14,
    maxHp: 450,
    maxMp: 180,
    attack: 28,
    defense: 18,
    speed: 16,
    spirit: 20,
    skills: [
      "basic_attack",
      "earth_shield",
      "ice_lock",
      "earth_wave"
    ],
    aiType: "defensive",
    enemyType: "human",
    spriteColor: "#8B7355",
    isEnemy: true,
    isCanon: true,
    canonSource: "第143章 入学试炼",
    expReward: 190,
    goldReward: 200,
    dropItems: [
      { itemId: "magic_stone", chance: 0.8, min: 1, max: 3 }
    ],
    locations: ["mingzhu_academy"],
    battleQuotes: {
      start: "召唤系？哼，看我怎么收拾你！",
      lowHp: "你...你到底是什么人！",
      death: "不可能...我可是双系中阶..."
    }
  },

  // ===== 明珠学府斗兽大赛召唤兽 =====
  white_armor_beetle: {
    id: "white_armor_beetle",
    name: "白铠战蛰",
    title: "奴仆级召唤兽",
    description: "海大富的召唤兽。虫族妖魔，三角头颅遍布角刺，前肢如斧钺，全身白色金属铠甲，后肢有骨镰。视觉弱但感知强，铠甲抗雷但怕火。",
    elements: ["earth"],
    level: 9,
    maxHp: 350,
    maxMp: 40,
    attack: 30,
    defense: 25,
    speed: 12,
    spirit: 8,
    skills: [
      "basic_attack",
      "demon_axe_slam",
      "demon_bone_sickle"
    ],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#E8E8E8",
    isEnemy: true,
    isSummon: true,
    isCanon: true,
    canonSource: "第149章/第152章",
    traits: ["armor_resist_thunder", "weak_vision", "weak_to_fire"],
    expReward: 142,
    goldReward: 80,
    dropItems: [
      { itemId: "demon_core", chance: 0.6, min: 1, max: 2 }
    ],
    battleQuotes: {
      start: "嗤——！！"
    }
  },

  rock_golem_summon: {
    id: "rock_golem_summon",
    name: "岩魔士",
    title: "奴仆级召唤兽",
    description: "郑冰晓的召唤兽。岩石构成的人形召唤兽，力量与防御极强，不怕火雷，能操控土石。速度极慢但一拳威力巨大。",
    elements: ["earth"],
    level: 10,
    maxHp: 400,
    maxMp: 60,
    attack: 32,
    defense: 28,
    speed: 6,
    spirit: 5,
    skills: [
      "basic_attack",
      "demon_rock_fist",
      "demon_earth_spike",
      "demon_earth_shield"
    ],
    aiType: "defensive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#8B7355",
    isEnemy: true,
    isSummon: true,
    isCanon: true,
    canonSource: "第149章/第153章",
    traits: ["fire_resist", "thunder_resist", "slow_movement"],
    expReward: 178,
    goldReward: 100,
    dropItems: [
      { itemId: "demon_core", chance: 0.7, min: 1, max: 2 }
    ]
  },

  bone_eating_demon_summon: {
    id: "bone_eating_demon_summon",
    name: "食骨妖",
    title: "奴仆级召唤兽",
    description: "王力挺的召唤兽。形如秃鹰，背生肉翼，飞行极快。狡猾敏捷，能在法师连星轨时突袭，轻易闪避初阶魔法。物理防御较弱。",
    elements: ["dark", "wind"],
    level: 10,
    maxHp: 250,
    maxMp: 80,
    attack: 28,
    defense: 8,
    speed: 30,
    spirit: 12,
    skills: [
      "basic_attack",
      "demon_dive_strike",
      "demon_wing_slash"
    ],
    aiType: "kiter",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#4A4A4A",
    isEnemy: true,
    isSummon: true,
    isCanon: true,
    canonSource: "第149章/第153章",
    traits: ["flying", "high_evasion", "fragile_body"],
    expReward: 178,
    goldReward: 90,
    dropItems: [
      { itemId: "demon_core", chance: 0.6, min: 1, max: 2 }
    ]
  },

  demon_wolf_advanced: {
    id: "demon_wolf_advanced",
    name: "进阶期幽狼兽",
    title: "奴仆级巅峰·进阶期",
    description: "莫凡的幽狼兽经历殊死战斗后进入进阶期，半只脚踏入战将级。可连续三段爆发冲刺，飞沙走石化为小型沙暴，实力远超普通奴仆级。",
    elements: ["dark", "earth", "wind"],
    level: 17,
    maxHp: 450,
    maxMp: 100,
    attack: 42,
    defense: 15,
    speed: 32,
    spirit: 18,
    skills: [
      "basic_attack",
      "demon_sand_breath",
      "demon_triple_burst",
      "demon_wild_charge",
      "battle_howl"
    ],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#2F4F4F",
    isEnemy: true,
    isSummon: true,
    isCanon: true,
    canonSource: "第156-158章 进阶期幽狼兽",
    traits: ["triple_burst", "sandstorm_breath", "advanced_stage"],
    expReward: 346,
    goldReward: 200,
    dropItems: [
      { itemId: "demon_core", chance: 0.9, min: 2, max: 4 }
    ],
    battleQuotes: {
      start: "呃呜——！！"
    }
  },

  // ===== 明珠学府重要NPC =====
  mu_nujiao: {
    id: "mu_nujiao",
    name: "牧奴娇",
    title: "明珠女神·双系中阶",
    description: "牧家大小姐，全校公认的女神。天仙之姿，嗜战如魔。风系+植物系双系中阶，能释放风盘·龙卷和坤之森·囚牢。战斗经验丰富，对中阶魔法理解极深。",
    elements: ["wind", "plant"],
    level: 20,
    maxHp: 600,
    maxMp: 200,
    attack: 35,
    defense: 20,
    speed: 28,
    spirit: 30,
    skills: [
      "wind_track_phantom",
      "wind_tornado",
      "plant_vine_bind",
      "plant_forest_prison"
    ],
    aiType: "tactical",
    enemyType: "human",
    spriteColor: "#98FB98",
    isEnemy: true,
    isCanon: true,
    canonSource: "第165-168章 斗兽大赛决战",
    traits: ["double_element_mid", "battle_experienced", "plant_master"],
    expReward: 439,
    goldReward: 300,
    dropItems: [
      { itemId: "spirit_gold_coin", chance: 0.5, min: 1, max: 2 }
    ],
    battleQuotes: {
      start: "开始吧。",
      lowHp: "你比我想象的强。",
      death: "我输了。"
    }
  },

  // ===== 蜕皮妖（变身型妖魔） =====
  molting_succubus: {
    id: "molting_succubus",
    name: "蜕皮女妖",
    title: "变身型妖魔",
    description: "伪装成人类女性的妖魔，夜晚蜕皮现出原形。满身鳞片，长舌，能在垂直墙面攀爬跳跃，喜吸年轻女性鲜血，尤其魔法师的血。狡猾，会利用同伴当垫背。",
    elements: ["dark"],
    level: 14,
    maxHp: 350,
    maxMp: 60,
    attack: 32,
    defense: 20,
    speed: 25,
    spirit: 15,
    skills: [
      "basic_attack",
      "demon_claw_strike",
      "demon_tongue_whip",
      "demon_wall_climb"
    ],
    aiType: "kiter",
    enemyType: "demon",
    demonTier: "warrior",
    spriteColor: "#4A0080",
    isEnemy: true,
    isCanon: true,
    canonSource: "第177-180章 蜕皮女妖",
    traits: ["scale_armor", "wall_climbing", "blood_sucker", "cunning"],
    expReward: 304,
    goldReward: 150,
    dropItems: [
      { itemId: "demon_core", chance: 0.8, min: 1, max: 3 }
    ],
    growth: {
      base: {
        level: 7,
        elements: ["dark"],
        skills: ["basic_attack", "life_drain", "demon_wall_climb"],
        traits: ["scale_armor", "wall_climbing", "blood_sucker", "cunning"],
        form: "human_form",
        title: "人皮伪装",
        growthType: "demon",
      },
      events: [
        {
          after: "battle_molt_1",
          level: 11,
          form: "demon_form",
          addSkills: ["demon_shadow_claw"],
          title: "蜕皮女妖",
        }
      ]
    }
  },

  molting_brute: {
    id: "molting_brute",
    name: "蜕皮男妖",
    title: "变身型妖魔",
    description: "伪装成人类男性的妖魔，蜕皮后手臂可膨胀伸长如铁球摆拳，力大无穷。鳞片防御高，雷系伤害减半。行动较迟缓但破坏力惊人。",
    elements: ["dark", "earth"],
    level: 17,
    maxHp: 500,
    maxMp: 40,
    attack: 45,
    defense: 30,
    speed: 10,
    spirit: 8,
    skills: [
      "basic_attack",
      "demon_ball_fist",
      "demon_extend_arm"
    ],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "warrior",
    spriteColor: "#5C4033",
    isEnemy: true,
    isCanon: true,
    canonSource: "第179-180章 蜕皮男妖",
    traits: ["scale_armor", "thunder_resist", "extendable_limbs", "super_strength"],
    expReward: 462,
    goldReward: 180,
    dropItems: [
      { itemId: "demon_core", chance: 0.8, min: 1, max: 3 }
    ]
  },

  // ===== 青天猎所 =====
  lingling: {
    id: "lingling",
    name: "灵灵",
    title: "猎人大师·青天猎所",
    description: "包老头的孙女，约12岁，双马尾小萝莉。猎人大师称谓，智商极高，擅长推理和情报分析。毒舌，人小鬼大，前搭档小鼎牺牲后与莫凡组队。",
    elements: ["none"],
    level: 8,
    maxHp: 100,
    maxMp: 200,
    attack: 5,
    defense: 3,
    speed: 15,
    spirit: 40,
    skills: [],
    aiType: "tactical",
    enemyType: "human",
    spriteColor: "#FFB6C1",
    expReward: 95,
    isEnemy: false,
    isAlly: true,
    isCanon: true,
    canonSource: "第174-180章 青天猎所",
    traits: ["hunter_master", "genius_intellect", "surveillance_expert"],
    battleQuotes: {
      start: "你年纪太嫩了。"
    }
  },

  // ===== 鳞皮妖（寄生型妖魔） =====
  scale_soldier: {
    id: "scale_soldier",
    name: "鳞皮妖兵",
    title: "寄生型妖魔",
    description: "青黄色鳞片覆盖的寄生妖魔，奴仆级。被寄生者夜晚蜕皮变为此形态，利爪锋利，能在墙面天花板攀爬。怕光，光系魔法对其有特效。智力低下，不知恐惧。",
    elements: ["dark"],
    level: 8,
    maxHp: 180,
    maxMp: 20,
    attack: 22,
    defense: 8,
    speed: 22,
    spirit: 5,
    skills: [
      "basic_attack",
      "demon_claw_slash",
      "demon_wall_climb"
    ],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#9ACD32",
    isEnemy: true,
    isCanon: true,
    canonSource: "第183-188章 鳞皮妖兵",
    traits: ["parasite", "wall_climbing", "light_weakness", "hive_mind"],
    expReward: 114,
    goldReward: 30,
    dropItems: [
      { itemId: "demon_core", chance: 0.3, min: 1, max: 1 }
    ]
  },

  scale_mother: {
    id: "scale_mother",
    name: "鳞皮妖母",
    title: "寄生母体",
    description: "鳞皮妖的母体，战将级以上。有智慧，控制所有妖兵。可命令妖兵集体自杀抽干被寄生者生命。藏于高处俯视全局，通过妖兵汲取养分。",
    elements: ["dark"],
    level: 25,
    maxHp: 1200,
    maxMp: 200,
    attack: 40,
    defense: 25,
    speed: 18,
    spirit: 35,
    skills: [
      "basic_attack",
      "demon_claw_slash",
      "demon_parasite_bite",
      "demon_hive_suicide",
      "demon_tongue_whip"
    ],
    aiType: "controller",
    enemyType: "demon",
    demonTier: "warrior",
    spriteColor: "#2F4F4F",
    isEnemy: true,
    isCanon: true,
    canonSource: "第189-190章 鳞皮妖母",
    traits: ["parasite_mother", "hive_mind_control", "light_weakness", "intelligent", "can_command_suicide"],
    expReward: 1414,
    goldReward: 500,
    dropItems: [
      { itemId: "demon_core", chance: 1.0, min: 2, max: 5 },
      { itemId: "spirit_gold_coin", chance: 0.5, min: 1, max: 3 }
    ]
  },

  // ===== 赵满延 =====
  zhao_manyan: {
    id: "zhao_manyan",
    name: "赵满延",
    title: "光系中阶法师",
    description: "莫凡舍友，黄头发，看似花花公子实则光系中阶法师。光佑·圣盾防御极强，光耀·净化对黑暗生物特效。团队型法师，不擅单挑。",
    elements: ["light"],
    level: 20,
    maxHp: 500,
    maxMp: 250,
    attack: 20,
    defense: 35,
    speed: 18,
    spirit: 25,
    skills: [
      "light_blessing",
      "light_sanctuary",
      "light_purify"
    ],
    aiType: "defensive",
    enemyType: "human",
    spriteColor: "#FFD700",
    expReward: 439,
    isEnemy: false,
    isAlly: true,
    isCanon: true,
    canonSource: "第187-188章 赵满延光系中阶",
    traits: ["light_mage", "defensive_support", "hidden_power"],
    battleQuotes: {
      start: "别慌，我罩着你。"
    }
  },

  // ===== 白藏锋 =====
  bai_cangfeng: {
    id: "bai_cangfeng",
    name: "白藏锋",
    title: "白家大少",
    description: "白家大少爷，中阶法师，新生大赛热门人选。性格傲慢，看不起平民出身的法师。在新生大赛上被莫凡一招霹雳秒杀。",
    elements: ["wind", "earth"],
    level: 17,
    maxHp: 450,
    maxMp: 180,
    attack: 28,
    defense: 18,
    speed: 22,
    spirit: 20,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_tornado",
      "earth_spike",
      "earth_shield"
    ],
    aiType: "aggressive",
    enemyType: "human",
    spriteColor: "#87CEEB",
    expReward: 289,
    isEnemy: true,
    isCanon: true,
    canonSource: "第200章 白藏锋登场",
    traits: ["arrogant", "dual_element", "rich_family"],
    battleQuotes: {
      start: "就凭你？也配站在我面前？",
      defeat: "不可能...我怎么会输给你这种人..."
    }
  },

  // ===== 韩洛（艾图图追求者，世家子弟）=====
  han_luo: {
    id: "han_luo",
    name: "韩洛",
    title: "世家子弟",
    description: "艾图图的追求者之一，戴眼镜的儒雅男子。表面彬彬有礼，实则心胸狭窄。与莫凡在金源公寓冲突。",
    elements: ["wind"],
    level: 10,
    maxHp: 280,
    maxMp: 120,
    attack: 20,
    defense: 12,
    speed: 18,
    spirit: 16,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_track_phantom"
    ],
    aiType: "tactical",
    enemyType: "human",
    spriteColor: "#9370DB",
    goldReward: 500,
    expReward: 180,
    isCanon: true,
    canonSource: "第205章 斗跟班！",
    traits: ["hypocrite", "rich_family"],
    battleQuotes: {
      start: "你这种人也配住在这里？",
      defeat: "等着...我不会放过你的..."
    }
  },

  // ===== 贾文清（艾图图追求者，中阶火系）=====
  jia_wenqing: {
    id: "jia_wenqing",
    name: "贾文清",
    title: "中阶火系",
    description: "艾图图的追求者之一，奶油斯文男。中阶火系法师，在青校区有一定实力，但表里不一。",
    elements: ["fire"],
    level: 12,
    maxHp: 320,
    maxMp: 150,
    attack: 25,
    defense: 10,
    speed: 16,
    spirit: 18,
    skills: [
      "basic_attack",
      "fire_bolt",
      "fire_burst"
    ],
    aiType: "aggressive",
    enemyType: "human",
    spriteColor: "#FF6347",
    goldReward: 800,
    expReward: 280,
    isCanon: true,
    canonSource: "第205章 斗跟班！",
    traits: ["arrogant", "rich_family", "mid_tier"],
    battleQuotes: {
      start: "滚出去，这里不是你该来的地方！",
      defeat: "可恶...你给我记住..."
    }
  },

  // ===== 猎王西明 =====
  xi_ming: {
    id: "xi_ming",
    name: "西明",
    title: "猎王",
    description: "猎者联盟的猎王，实力深不可测。骑乘一头青蓝色巨兽，统领猎妖队。在鳞皮妖母事件中率队支援，尊重每一个生命。",
    elements: ["wind", "water"],
    level: 55,
    maxHp: 2500,
    maxMp: 800,
    attack: 80,
    defense: 60,
    speed: 35,
    spirit: 70,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_tornado",
      "water_burst",
      "water_shield"
    ],
    aiType: "tactical",
    enemyType: "human",
    spriteColor: "#4169E1",
    expReward: 30357,
    isEnemy: false,
    isAlly: true,
    isCanon: true,
    canonSource: "第197章 猎王登场",
    traits: ["hunter_king", "beast_rider", "tactical_genius", "respects_life"],
    battleQuotes: {
      start: "她们也有活下去的权力。"
    }
  },

  // ===== 醋醋（偶像NPC，非战斗） =====
  cu_cu: {
    id: "cu_cu",
    name: "醋醋",
    title: "人气偶像",
    description: "当红人气偶像，在演唱会上被鳞皮妖母袭击。被莫凡等人救下。",
    elements: [],
    level: 0,
    maxHp: 50,
    maxMp: 0,
    attack: 2,
    defense: 1,
    speed: 8,
    spirit: 15,
    skills: ["basic_attack"],
    aiType: "defensive",
    enemyType: "civilian",
    spriteColor: "#FF69B4",
    expReward: 0,
    isEnemy: false,
    isAlly: false,
    isCanon: true,
    canonSource: "第192章 妖母伪装成技师对醋醋下手",
    traits: ["celebrity", "civilian", "damsel_in_distress"]
  },

  // ===== 暗影妖兽（主校区考核目标）=====
  shadow_beast: {
    id: "shadow_beast",
    name: "暗影妖兽",
    title: "半驯化暗影兽",
    description: "政府军驯化的暗影系妖兽，拥有暗影隐身能力，夜间几乎不可见。不主动攻击人类，但受攻击时会狂暴，危险程度仅次于妖魔。爱吃牛肉，尾毛会发荧光。",
    elements: ["shadow"],
    level: 10,
    maxHp: 350,
    maxMp: 200,
    attack: 22,
    defense: 12,
    speed: 30,
    spirit: 15,
    skills: [
      "basic_attack",
      "shadow_step",
      "shadow_claw"
    ],
    aiType: "evasive",
    enemyType: "demon",
    demonTier: "servant",
    spriteColor: "#2F2F4F",
    expReward: 150,
    goldReward: 0,
    isCanon: true,
    canonSource: "第218章 大狩猎！",
    traits: ["shadow_stealth", "nocturnal", "capture_target", "flee_when_low"],
    captureable: true,
    battleQuotes: {
      start: "*暗影中传来低沉的嘶吼*",
      defeat: "*暗影妖兽被制服了*"
    }
  },

  // ===== 宇昂（黑教廷教士版）=====
  yu_ang_black_church: {
    id: "yu_ang_black_church",
    name: "宇昂",
    title: "黑教廷教士",
    description: "穆氏养子，实为黑教廷教士。半张面具遮脸，饲养黑畜妖，心狠手辣。誓言将莫凡变成自己的奴隶。",
    elements: ["ice", "shadow"],
    level: 18,
    maxHp: 600,
    maxMp: 300,
    attack: 35,
    defense: 20,
    speed: 25,
    spirit: 30,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_freeze",
      "shadow_step",
      "shadow_claw"
    ],
    aiType: "tactical",
    enemyType: "human",
    spriteColor: "#4A0080",
    expReward: 800,
    goldReward: 2000,
    isCanon: true,
    canonSource: "第213章 三步塔",
    traits: ["black_church", "masked", "summons_demons", "nemesis"],
    battleQuotes: {
      start: "我会把你变成我的奴隶！",
      defeat: "不可能...黑教廷不会放过你的..."
    }
  },

  // v1.8.1: 弱化版宇昂（被唐月夹击，状态受损）
  yu_ang_black_church_weakened: {
    id: "yu_ang_black_church_weakened",
    name: "宇昂（负伤）",
    title: "黑教廷教士",
    description: "穆氏养子，实为黑教廷教士。被你和唐月老师前后夹击，已经负伤，状态大不如前。",
    elements: ["ice", "shadow"],
    level: 15,
    maxHp: 350,
    maxMp: 200,
    attack: 25,
    defense: 15,
    speed: 18,
    spirit: 20,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_freeze",
      "shadow_claw"
    ],
    aiType: "aggressive",
    enemyType: "human",
    spriteColor: "#4A0080",
    expReward: 600,
    goldReward: 1500,
    isCanon: false,
    canonNote: "阴谋调查系统分支敌人，唐月夹击下的弱化版宇昂",
    traits: ["black_church", "masked", "weakened"],
    battleQuotes: {
      start: "你们...居然联手！",
      defeat: "不可能...黑教廷不会放过你们的..."
    }
  },

  // ===== 黑教廷灰衣人 =====
  black_church_gray: {
    id: "black_church_gray",
    name: "灰衣教士",
    title: "黑教廷成员",
    description: "黑教廷灰衣教士，穿着灰色斗篷，与黑畜妖一同行动。擅长布置陷阱和围攻。",
    elements: ["shadow"],
    level: 12,
    maxHp: 300,
    maxMp: 150,
    attack: 25,
    defense: 15,
    speed: 20,
    spirit: 18,
    skills: [
      "basic_attack",
      "shadow_step",
      "shadow_claw"
    ],
    aiType: "aggressive",
    enemyType: "human",
    spriteColor: "#555555",
    expReward: 250,
    goldReward: 500,
    isCanon: true,
    canonSource: "第220章 误闯陷阱",
    traits: ["black_church", "ambusher", "works_with_demons"]
  },

  // ===== 傅天明（被利用的风系学长）=====
  fu_tianming: {
    id: "fu_tianming",
    name: "傅天明",
    title: "风系中阶学长",
    description: "被贾文清利用来教训莫凡的风系中阶学长，被莫凡一脚踢碎假山重伤。后被宇昂以贾文清名义操纵。",
    elements: ["wind"],
    level: 11,
    maxHp: 280,
    maxMp: 140,
    attack: 22,
    defense: 10,
    speed: 22,
    spirit: 16,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_track_phantom"
    ],
    aiType: "balanced",
    enemyType: "human",
    spriteColor: "#87CEEB",
    expReward: 200,
    goldReward: 300,
    isCanon: true,
    canonSource: "第211章 误下重手！",
    traits: ["manipulated", "mid_tier"],
    battleQuotes: {
      start: "教训一下这个不知天高地厚的小子！",
      defeat: "呃...骨头...碎了..."
    }
  },

  // ===== 诅咒畜妖（许昭霆被咒法后）=====
  cursed_demon_xu: {
    id: "cursed_demon_xu",
    name: "诅咒畜妖",
    title: "被咒法的许昭霆",
    description: "许昭霆被黑教廷咒法变成的强化黑畜妖。保留部分意识，比普通黑畜妖强大数倍，被灵魂锁链控制。脸上有未腐烂的人皮，眼中充满痛苦与怨恨。速度力量远超普通黑畜妖，黑色爪芒可远程切割。",
    elements: ["thunder", "shadow"],
    level: 15,
    maxHp: 650,
    maxMp: 200,
    attack: 38,
    defense: 18,
    speed: 35,
    spirit: 25,
    skills: [
      "basic_attack",
      "shadow_claw",
      "thunder_bolt",
      "cursed_claw_barrage"
    ],
    aiType: "berserker",
    enemyType: "cursed_human",
    spriteColor: "#1a0a2e",
    expReward: 500,
    goldReward: 0,
    isCanon: true,
    canonSource: "第225-227章 诅咒气息黑畜妖/被咒法的许昭霆",
    traits: ["cursed", "retains_consciousness", "tragic", "soul_chained", "black_church"],
    specialAbility: "痛苦之力：HP低于50%时攻击力+50%；灵魂锁链：无法自我了断",
    battleQuotes: {
      start: "*痛苦的嘶吼* 咕...咕咕...",
      defeat: "*眼中恢复一丝清明，向莫凡点头*"
    }
  },

  // ===== 沈明笑（学校风云人物）=====
  shen_mingxiao: {
    id: "shen_mingxiao",
    name: "沈明笑",
    title: "沈家子弟/学校风云人物",
    description: "明珠学校风云人物，沈家势力，哥哥沈林在猎者联盟。傲慢自大，认为明珠应由他呼风唤雨。冰系中阶，与罗宋勾结。",
    elements: ["ice"],
    level: 13,
    maxHp: 350,
    maxMp: 180,
    attack: 28,
    defense: 15,
    speed: 18,
    spirit: 20,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_lock",
      "ice_freeze"
    ],
    aiType: "balanced",
    enemyType: "human",
    spriteColor: "#88CCEE",
    expReward: 300,
    goldReward: 800,
    isCanon: true,
    canonSource: "第219/229章",
    traits: ["arrogant", "noble_family", "rival"],
    battleQuotes: {
      start: "乡野小子也配在明珠耍威风？",
      defeat: "不可能...我沈家..."
    }
  },

  // ===== 王力挺（食骨妖召唤者）=====
  wang_liting: {
    id: "wang_liting",
    name: "王力挺",
    title: "食骨妖召唤者",
    description: "召唤系中阶法师，契约食骨妖。心狠手辣，大混战中率先出手，食骨妖羽毛飞射瞬间杀十几人。有言在先：召唤兽嗜血难控，死伤自负。",
    elements: ["summon"],
    level: 14,
    maxHp: 400,
    maxMp: 200,
    attack: 25,
    defense: 18,
    speed: 16,
    spirit: 22,
    skills: [
      "basic_attack",
      "summon_bone_eating_demon",
      "feather_barrage"
    ],
    aiType: "aggressive",
    enemyType: "human",
    spriteColor: "#8B4513",
    expReward: 350,
    goldReward: 600,
    isCanon: true,
    canonSource: "第230章 大混战（上）",
    traits: ["ruthless", "summoner", "bone_eating_demon"],
    specialAbility: "食骨妖：嗜血召唤兽，羽毛飞射范围攻击，连主人都难完全控制",
    battleQuotes: {
      start: "我有言在先，死了别怪我！",
      defeat: "食骨妖...回来..."
    }
  },

  // ========== v0.70.0 精英妖魔（严格遵循原著设定）==========

  three_eye_wolf: {
    id: "three_eye_wolf",
    name: "三眼魔狼",
    title: "战将级精英·骨刺狰狼",
    description: "三只眼睛几乎拥有270度视角，钢铁般结实的身躯，锋利的棱角骨刺。中阶魔法师若没有及时防备都会被一击毙命。",
    elements: ["dark"],
    level: 12,
    maxHp: 300,
    maxMp: 0,
    attack: 35,
    defense: 15,
    speed: 18,
    skills: ["basic_attack", "bone_spike", "wolf_bite", "wolf_howl"],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "commander",
    elite: true,
    eliteMechanics: {
      view_270: true,
      bone_spike_chance: 0.3,
      bone_spike_multiplier: 1.5,
      physical_reduction: 0.2
    },
    weakness: ["fire"],
    spriteColor: "#554433",
    isEnemy: true,
    expReward: 80,
    goldReward: 60,
    dropItems: [
      { itemId: "wolf_bone_spike", chance: 0.5, min: 1, max: 2 },
      { itemId: "demon_core", chance: 0.6, min: 1, max: 1 },
      { itemId: "elite_core", chance: 0.1, min: 1, max: 1 }
    ]
  },

  // ========== 博城灾难精英妖魔（仅使用博城灾难及之前出现的妖魔）==========

  advanced_one_eye_wolf: {
    id: "advanced_one_eye_wolf",
    name: "进阶期独眼魔狼",
    title: "奴仆级巅峰精英",
    description: "独眼魔狼中的进阶期个体，力大敏捷，比普通独眼魔狼强大数倍。博城灾难中常见的精锐妖魔，单独一只就足以威胁初阶魔法师。",
    elements: ["dark"],
    level: 8,
    maxHp: 180,
    maxMp: 0,
    attack: 25,
    defense: 8,
    speed: 20,
    skills: ["basic_attack", "wolf_bite", "wolf_howl", "dark_claw"],
    aiType: "aggressive",
    enemyType: "demon",
    demonTier: "servant",
    elite: true,
    eliteMechanics: {
      physical_reduction: 0.1,
      evasion_bonus: 0.1,
      first_strike_bonus: 0.15
    },
    weakness: ["fire"],
    spriteColor: "#443322",
    isEnemy: true,
    expReward: 50,
    goldReward: 40,
    dropItems: [
      { itemId: "wolf_fang", chance: 0.5, min: 1, max: 2 },
      { itemId: "demon_core", chance: 0.4, min: 1, max: 1 },
      { itemId: "elite_core", chance: 0.05, min: 1, max: 1 }
    ]
  },

  giant_eye_rat_king: {
    id: "giant_eye_rat_king",
    name: "巨眼猩鼠王",
    title: "奴仆级巅峰精英",
    description: "巨眼猩鼠群居群落的首领，体型比普通巨眼猩鼠大一圈，腥红光束威力更强。博城灾难地下洞穴中的危险存在。",
    elements: ["dark", "poison"],
    level: 7,
    maxHp: 150,
    maxMp: 30,
    attack: 20,
    defense: 6,
    speed: 22,
    skills: ["basic_attack", "rat_bite", "dark_bolt", "shadow_spike"],
    aiType: "tactical",
    enemyType: "demon",
    demonTier: "servant",
    elite: true,
    eliteMechanics: {
      poison_chance: 0.3,
      evasion_bonus: 0.15,
      summon_minions_chance: 0.2
    },
    weakness: ["fire", "light"],
    spriteColor: "#553333",
    isEnemy: true,
    expReward: 45,
    goldReward: 35,
    dropItems: [
      { itemId: "rat_tail", chance: 0.5, min: 1, max: 2 },
      { itemId: "demon_core", chance: 0.35, min: 1, max: 1 },
      { itemId: "elite_core", chance: 0.05, min: 1, max: 1 }
    ]
  },

  training_dummy: {
    id: "training_dummy",
    name: "训练傀儡",
    title: "学校训练用",
    description: "天澜魔法高中用于新生试炼的训练傀儡，行动迟缓，攻击力低，适合新手练习。",
    elements: ["neutral"],
    level: 3,
    maxHp: 80,
    maxMp: 0,
    attack: 5,
    defense: 3,
    speed: 5,
    spirit: 1,
    skills: ["basic_attack"],
    aiType: "simple",
    enemyType: "dummy",
    weakness: [],
    spriteColor: "#888888",
    isEnemy: true,
    expReward: 20,
    goldReward: 10,
    dropItems: []
  }
};
