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
    maxHp: 150,
    maxMp: 40,
    attack: 18,
    defense: 6,
    speed: 15,
    skills: [
      "basic_attack",
      "dark_bolt"
    ],
    spriteColor: "#553322",
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
      "wild_charge"
    ],
    spriteColor: "#4a7c3f",
    isEnemy: true,
    isSummon: true,
    canEnrage: true,
    expReward: 150,
    goldReward: 80,
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
  shadow_creature: {
    id: "shadow_creature",
    name: "暗影怪",
    title: "奴仆级妖魔",
    description: "隐藏在阴影中的妖魔，擅长偷袭。",
    elements: [
      "dark"
    ],
    level: 2,
    maxHp: 80,
    maxMp: 40,
    attack: 12,
    defense: 3,
    speed: 16,
    skills: [
      "basic_attack",
      "dark_bolt"
    ],
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
    maxHp: 200,
    maxMp: 20,
    attack: 18,
    defense: 15,
    speed: 6,
    skills: [
      "basic_attack",
      "earth_spike"
    ],
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
      "wind_blade"
    ],
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
      "water_chain"
    ],
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
    maxHp: 85,
    maxMp: 50,
    attack: 16,
    defense: 4,
    speed: 13,
    skills: [
      "basic_attack",
      "fire_bolt"
    ],
    spriteColor: "#ff6633",
    isEnemy: true,
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
      "earth_spike"
    ],
    spriteColor: "#ccaa33",
    isEnemy: true,
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
      "light_ray"
    ],
    spriteColor: "#ffff99",
    isEnemy: true,
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
    maxHp: 110,
    maxMp: 60,
    attack: 20,
    defense: 6,
    speed: 15,
    skills: [
      "basic_attack",
      "thunder_bolt"
    ],
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
      "ice_spike"
    ],
    spriteColor: "#99ddff",
    isEnemy: true,
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
      "dark_bolt"
    ],
    spriteColor: "#553377",
    isEnemy: true,
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
    maxHp: 400,
    maxMp: 100,
    attack: 35,
    defense: 15,
    speed: 22,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_speed"
    ],
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
    maxHp: 600,
    maxMp: 80,
    attack: 40,
    defense: 25,
    speed: 12,
    skills: [
      "basic_attack",
      "earth_spike",
      "earth_shield"
    ],
    spriteColor: "#888888",
    isEnemy: true,
    demonTier: "warrior",
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
    maxHp: 120,
    maxMp: 60,
    attack: 14,
    defense: 6,
    speed: 12,
    skills: [
      "basic_attack",
      "dark_bolt"
    ],
    spriteColor: "#330033",
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
    maxHp: 250,
    maxMp: 150,
    attack: 28,
    defense: 12,
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
    description: "潜伏在人类城市附近的妖魔，拥有邪眼可以蛊惑人心，使人神情呆滞。其沼毒与普通水毒不同，需要治疗系法师才能分辨。猎者联盟经常追踪此类妖魔。",
    elements: ["dark", "water"],
    level: 5,
    maxHp: 180,
    maxMp: 80,
    attack: 14,
    defense: 8,
    speed: 10,
    skills: ["basic_attack", "dark_bolt", "water_heal"],
    spriteColor: "#4a7c59",
    isEnemy: true,
    expReward: 150,
    goldReward: 80,
    dropItems: [
      {
        itemId: "demon_core",
        chance: 0.9,
        min: 1,
        max: 2
      },
      {
        itemId: "magic_stone",
        chance: 0.5,
        min: 1,
        max: 2
      },
      {
        itemId: "mana_potion",
        chance: 0.3,
        min: 1,
        max: 1
      }
    ],
    locations: ["city_street", "bo_city_outskirts"]
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
    skills: ["basic_attack", "dark_bolt", "water_chain"],
    spriteColor: "#556b2f",
    isEnemy: true,
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
    skills: ["basic_attack", "wind_blade", "wind_speed"],
    spriteColor: "#8fbc8f",
    isEnemy: true,
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
    skills: ["basic_attack", "dark_bolt"],
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
    skills: ["basic_attack", "dark_bolt", "dark_claw"],
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
  }
};
