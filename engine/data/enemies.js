/**
 * 敌人/妖魔数据
 * 从 game-data.js 拆分而来
 */

const DataEnemies = {
  one_eye_wolf: {
    id: "one_eye_wolf",
    name: "独眼魔狼",
    title: "奴仆级妖魔",
    description: "栖息在离人类城市最近荒野区域的妖魔，只有一只眼睛，非常凶残。普通人无法对付，唯有魔法师才能与之战斗。",
    elements: [
      "dark"
    ],
    level: 4,
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
    spriteColor: "#553322",
    isEnemy: true,
    expReward: 100,
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
    title: "奴仆级召唤兽",
    description: "召唤系法师白阳的召唤兽，绿色汗毛锯齿獠牙，比普通独眼魔狼更强。受强刺激会发狂，眼睛变红，战斗力大幅提升。",
    elements: [
      "dark"
    ],
    level: 5,
    maxHp: 200,
    maxMp: 50,
    attack: 22,
    defense: 8,
    speed: 18,
    skills: [
      "basic_attack",
      "dark_bolt",
      "wild_charge",
      "battle_howl"
    ],
    spriteColor: "#4a7c3f",
    isEnemy: true,
    isSummon: true,
    canEnrage: true,
    aiType: "aggressive",
    expReward: 150,
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
    ]
  },
  demon_wolf_pack: {
    id: "demon_wolf_pack",
    name: "魔狼群",
    title: "奴仆级妖魔群",
    description: "博城灾难中涌入城市的魔狼群，由数只独眼魔狼组成，凶残无比。它们在黑教廷的引导下对博城发动了突袭。",
    elements: ["dark"],
    level: 5,
    maxHp: 350,
    maxMp: 80,
    attack: 20,
    defense: 8,
    speed: 16,
    skills: ["basic_attack", "dark_bolt", "wolf_howl", "wolf_pack_attack"],
    spriteColor: "#3a2a1a",
    isEnemy: true,
    isElite: true,
    aiType: "aggressive",
    expReward: 250,
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
    level: 2,
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
    spriteColor: "#442266",
    isEnemy: true,
    expReward: 50,
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
    level: 4,
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
      "earth_shield"
    ],
    aiType: "defensive",
    enemyType: "demon",
    spriteColor: "#996633",
    isEnemy: true,
    expReward: 100,
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
    level: 2,
    maxHp: 70,
    maxMp: 50,
    attack: 10,
    defense: 3,
    speed: 18,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_step",
      "wind_barrier",
      "speed_burst"
    ],
    aiType: "kiter",
    spriteColor: "#88ccaa",
    isEnemy: true,
    expReward: 45,
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
    level: 3,
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
    spriteColor: "#6699cc",
    isEnemy: true,
    expReward: 60,
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
    level: 3,
    maxHp: 100,
    maxMp: 50,
    attack: 18,
    defense: 5,
    speed: 13,
    skills: [
      "basic_attack",
      "fire_bolt",
      "fire_burst",
      "flame_cloak",
      "flame_shield"
    ],
    spriteColor: "#ff6633",
    isEnemy: true,
    aiType: "burst",
    expReward: 65,
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
    level: 2,
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
    spriteColor: "#ccaa33",
    isEnemy: true,
    aiType: "defensive",
    expReward: 40,
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
    level: 2,
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
    spriteColor: "#ffff99",
    isEnemy: true,
    aiType: "kiter",
    expReward: 45,
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
    level: 4,
    maxHp: 130,
    maxMp: 60,
    attack: 24,
    defense: 7,
    speed: 15,
    skills: [
      "basic_attack",
      "thunder_bolt",
      "thunder_charge",
      "lightning_fur",
      "thunder_strike"
    ],
    aiType: "burst",
    spriteColor: "#9966ff",
    isEnemy: true,
    expReward: 90,
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
    level: 3,
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
    spriteColor: "#99ddff",
    isEnemy: true,
    aiType: "controller",
    expReward: 55,
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
    level: 3,
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
    spriteColor: "#553377",
    isEnemy: true,
    aiType: "kiter",
    expReward: 60,
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
    description: "体型巨大的鼠类妖魔，拥有极强的夜视能力和感知力，速度极快，是非常危险的战将级妖魔。",
    elements: [
      "wind"
    ],
    level: 7,
    maxHp: 450,
    maxMp: 0,
    attack: 38,
    defense: 18,
    speed: 22,
    skills: [
      "basic_attack",
      "claw_slash",
      "wind_slash",
      "wild_charge",
      "blood_bite"
    ],
    aiType: "kiter",
    enemyType: "demon",
    spriteColor: "#aa6633",
    isEnemy: true,
    demonTier: "warrior",
    expReward: 300,
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
    level: 8,
    maxHp: 750,
    maxMp: 80,
    attack: 48,
    defense: 30,
    speed: 12,
    skills: [
      "basic_attack",
      "earth_spike",
      "earth_shield",
      "war_stomp",
      "demon_regeneration",
      "thorn_armor",
      "triple_slash"
    ],
    spriteColor: "#888888",
    isEnemy: true,
    demonTier: "warrior",
    aiType: "defensive",
    expReward: 400,
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
    level: 4,
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
    expReward: 80,
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
    level: 7,
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
    expReward: 200,
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
    level: 10,
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
    expReward: 500,
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
    level: 5,
    maxHp: 180,
    maxMp: 80,
    attack: 16,
    defense: 8,
    speed: 10,
    skills: ["basic_attack", "water_chain", "evil_eye_gaze", "poison_cloud", "mind_confuse"],
    spriteColor: "#556b2f",
    isEnemy: true,
    aiType: "controller",
    expReward: 150,
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
    level: 4,
    maxHp: 100,
    maxMp: 30,
    attack: 14,
    defense: 4,
    speed: 22,
    skills: ["basic_attack", "wind_blade", "wind_speed", "speed_burst"],
    spriteColor: "#8fbc8f",
    isEnemy: true,
    aiType: "kiter",
    expReward: 120,
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
    level: 3,
    maxHp: 150,
    maxMp: 40,
    attack: 12,
    defense: 10,
    speed: 6,
    skills: ["basic_attack", "vine_bind", "thorn_shot"],
    spriteColor: "#228b22",
    isEnemy: true,
    aiType: "controller",
    isPlant: true,
    fireWeakness: 1.8,
    thunderResistance: 0.5,
    expReward: 100,
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
    level: 4,
    elements: ["dark"],
    maxHp: 120,
    attack: 18,
    defense: 8,
    speed: 14,
    skills: ["basic_attack", "crimson_beam", "shadow_assault"],
    aiType: "kiter",
    specialAbility: "腥红光束：远程穿透攻击，无视部分防御",
    spriteColor: "#8b4513",
    isEnemy: true,
    canBurrow: true,
    ignoreDefense: 0.3,
    expReward: 80,
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
    level: 10,
    maxHp: 400,
    maxMp: 80,
    attack: 35,
    defense: 18,
    speed: 22,
    skills: ["basic_attack", "wolf_bite", "berserk_charge", "spine_sweep", "wolf_breath", "demon_rage"],
    aiType: "tactical",
    specialAbility: "冲撞：高速撞击造成大量伤害；进阶中：身体持续变强，雷系可抑制进阶",
    spriteColor: "#4a0000",
    isEnemy: true,
    isElite: true,
    canEnrage: true,
    thunderWeakness: 2.0,
    fireResistance: 0.5,
    expReward: 300,
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
    level: 8,
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
    expReward: 500,
    goldReward: 300,
    dropItems: [
      { itemId: "ice_crystal", chance: 0.5, min: 1, max: 1 },
      { itemId: "magic_crystal", chance: 0.3, min: 1, max: 1 },
      { itemId: "super_mana_potion", chance: 0.4, min: 1, max: 2 }
    ],
    locations: ["mu_manor"]
  },
  blood_rune_giant_rat: {
    id: "blood_rune_giant_rat",
    name: "血纹巨魔鼠",
    description: "战将级妖魔，体型堪比小卡车，浑身遍布狰狞的血纹。受到暴躁之泉的影响，变得异常狂暴和凶残。地圣泉守卫几乎被它全灭。",
    type: "demon",
    rank: "战将级",
    element: "neutral",
    maxHp: 600,
    maxMp: 100,
    attack: 50,
    defense: 25,
    speed: 30,
    skills: ["basic_attack", "rat_bite", "blood_rage", "blood_bite"],
    aiType: "aggressive",
    specialAbility: "血纹狂暴：HP低于50%时攻击+50%，速度+30%",
    spriteColor: "#cc3333",
    isEnemy: true,
    isBoss: true,
    rageBelowHp: 0.5,
    rageAttackBonus: 0.5,
    rageSpeedBonus: 0.3,
    expReward: 800,
    goldReward: 500,
    dropItems: [
      { itemId: "demon_core", chance: 0.4, min: 1, max: 1 },
      { itemId: "blood_rune", chance: 0.3, min: 1, max: 1 },
      { itemId: "super_health_potion", chance: 0.5, min: 1, max: 2 }
    ],
    locations: ["earth_spring"]
  },
  three_eye_demon_wolf: {
    id: "three_eye_demon_wolf",
    name: "三眼魔狼（骨刺狰狼）",
    description: "战将级妖魔，魔狼种群的统领级之下的高级战将。三只眼睛拥有270度视角，浑身骨刺如钢铁般坚硬。率领数百只独眼魔狼进攻博城的先锋将领。",
    type: "demon",
    rank: "战将级",
    element: "neutral",
    maxHp: 800,
    maxMp: 150,
    attack: 60,
    defense: 35,
    speed: 28,
    skills: ["basic_attack", "wolf_bite", "bone_spike", "bone_throw", "wolf_howl", "third_eye_sight", "iron_body", "berserk_charge"],
    aiType: "tactical",
    specialAbility: "骨刺射击：远程攻击；狼嚎召唤：召唤2只独眼魔狼助战",
    spriteColor: "#884422",
    isEnemy: true,
    isBoss: true,
    summonSkill: "wolf_howl",
    summonEnemy: "one_eye_wolf",
    summonCount: 2,
    expReward: 1200,
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
    level: 3,
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
    expReward: 60,
    goldReward: 20,
    dropItems: [],
    locations: ["tianlan_school", "city_street"]
  },

  // ========== 博城灾难新增妖魔 ==========
  blood_pattern_rat: {
    id: "blood_pattern_rat",
    name: "血纹巨魔鼠",
    title: "战将级妖魔",
    description: "体型巨大的鼠类妖魔，身上布满血色纹路，拥有极强的再生能力和瘟疫之力。地圣泉奇袭的元凶之一。",
    elements: ["dark", "earth"],
    level: 9,
    maxHp: 700,
    maxMp: 120,
    attack: 45,
    defense: 20,
    speed: 25,
    skills: ["basic_attack", "rat_bite", "blood_rage", "blood_bite"],
    aiType: "aggressive",
    spriteColor: "#882222",
    isEnemy: true,
    demonTier: "warrior",
    isBoss: false,
    expReward: 500,
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
    level: 6,
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
    expReward: 200,
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
    level: 15,
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
    expReward: 5000,
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
    level: 3,
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
    expReward: 80,
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
    level: 5,
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
    expReward: 200,
    goldReward: 150,
    dropItems: [
      { itemId: "magic_stone", chance: 0.8, min: 2, max: 4 },
      { itemId: "mana_potion", chance: 0.5, min: 1, max: 2 },
      { itemId: "ice_crystal", chance: 0.2, min: 1, max: 1 }
    ]
  },
  
  zhao_kunsan_duel: {
    id: "zhao_kunsan_duel",
    name: "赵坤三",
    title: "土系初阶法师",
    description: "土系法师，性格憨厚，防御很强，是穆白的跟班。",
    elements: ["earth"],
    level: 4,
    maxHp: 180,
    maxMp: 80,
    attack: 12,
    defense: 15,
    speed: 8,
    spirit: 10,
    skills: [
      "basic_attack",
      "earth_spike",
      "earth_shield"
    ],
    aiType: "defensive",
    enemyType: "mage",
    spriteColor: "#cc9966",
    isEnemy: true,
    isMage: true,
    expReward: 150,
    goldReward: 100,
    dropItems: [
      { itemId: "magic_stone", chance: 0.7, min: 2, max: 3 },
      { itemId: "health_potion", chance: 0.5, min: 1, max: 2 }
    ]
  },
  
  black_church_mage: {
    id: "black_church_mage",
    name: "黑教廷执事",
    title: "暗影系法师",
    description: "黑教廷的执事，暗影系法师，擅长诅咒和暗杀，非常危险。",
    elements: ["dark"],
    level: 7,
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
    expReward: 400,
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
    level: 3,
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
    spriteColor: "#8B4513",
    isEnemy: true,
    expReward: 80,
    goldReward: 50,
    dropItems: [
      { itemId: "demon_core", chance: 0.6, min: 1, max: 1 },
      { itemId: "worm_shell", chance: 0.4, min: 1, max: 1 },
      { itemId: "magic_stone", chance: 0.2, min: 1, max: 1 }
    ],
    locations: ["bo_city_outskirts", "underground_caves"]
  },

  blood_pattern_rat: {
    id: "blood_pattern_rat",
    name: "血纹巨魔鼠",
    title: "奴仆级精英妖魔",
    description: "巨眼猩鼠的变异体，身上布满血色纹路，进入狂暴状态后攻击力惊人，但会持续失血。",
    elements: ["dark"],
    level: 6,
    maxHp: 280,
    maxMp: 0,
    attack: 30,
    defense: 10,
    speed: 20,
    skills: [
      "basic_attack",
      "gnaw_bite",
      "blood_frenzy",
      "charge_attack"
    ],
    aiType: "aggressive",
    enemyType: "demon",
    spriteColor: "#8B0000",
    isEnemy: true,
    expReward: 200,
    goldReward: 120,
    dropItems: [
      { itemId: "demon_core", chance: 0.9, min: 1, max: 3 },
      { itemId: "rat_fang", chance: 0.7, min: 1, max: 2 },
      { itemId: "blood_crystal", chance: 0.3, min: 1, max: 1 },
      { itemId: "magic_stone", chance: 0.5, min: 1, max: 2 }
    ],
    locations: ["xuefeng_mountain", "bo_city_outskirts"]
  },

  winged_wolf: {
    id: "winged_wolf",
    name: "翼苍狼",
    title: "战将级妖魔",
    description: "长有翅膀的苍狼，风系妖魔，能在空中高速飞行并发射风刃，俯冲突袭威力巨大。",
    elements: ["wind"],
    level: 9,
    maxHp: 450,
    maxMp: 80,
    attack: 38,
    defense: 14,
    speed: 28,
    spirit: 15,
    skills: [
      "basic_attack",
      "wind_blade_barrage",
      "aerial_dive",
      "feather_dance",
      "claw_slash"
    ],
    aiType: "kiter",
    enemyType: "demon",
    spriteColor: "#4682B4",
    isEnemy: true,
    isFlying: true,
    expReward: 500,
    goldReward: 300,
    dropItems: [
      { itemId: "demon_core", chance: 1.0, min: 2, max: 4 },
      { itemId: "wolf_fang", chance: 0.8, min: 2, max: 3 },
      { itemId: "wind_crystal", chance: 0.5, min: 1, max: 2 },
      { itemId: "wing_feather", chance: 0.4, min: 1, max: 2 },
      { itemId: "magic_stone", chance: 0.6, min: 2, max: 3 }
    ],
    locations: ["xuefeng_mountain", "sky_plateau"]
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
    level: 4,
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
    expReward: 80,
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
    level: 5,
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
    expReward: 120,
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
    level: 6,
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
    spriteColor: "#8b4513",
    isEnemy: true,
    expReward: 150,
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
    level: 7,
    maxHp: 200,
    maxMp: 80,
    attack: 25,
    defense: 8,
    speed: 32,
    spirit: 15,
    skills: [
      "basic_attack",
      "thunder_bolt",
      "thunder_strike",
      "thunder_dive",
      "speed_burst"
    ],
    aiType: "kiter",
    enemyType: "demon",
    spriteColor: "#4169e1",
    isEnemy: true,
    isFlying: true,
    expReward: 180,
    goldReward: 100,
    dropItems: [
      { itemId: "demon_core", chance: 0.9, min: 1, max: 2 },
      { itemId: "thunder_feather", chance: 0.5, min: 1, max: 2 },
      { itemId: "wind_crystal", chance: 0.3, min: 1, max: 1 }
    ],
    locations: ["thunder_mountain", "sky_plateau"]
  }
};
