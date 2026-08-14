/**
 * 地点数据
 * 从 game-data.js 拆分而来
 */

const DataLocations = {
  tianlan_school: {
    id: "tianlan_school",
    name: "天澜魔法高中",
    description: "博城最好的公立魔法高中，培养了无数优秀的法师。",
    backgroundColor: "#2a3a5a",
    unlocked: true,
    classSchedule: {
      morning: {
        "0": null,
        "1": {
          subject: "magic_theory",
          name: "魔法理论",
          teacher: "xue_musheng",
          exp: 25,
          mpCost: 5
        },
        "2": {
          subject: "star_path",
          name: "星轨课",
          teacher: "tang_yue",
          exp: 30,
          mpCost: 10
        },
        "3": {
          subject: "demonology",
          name: "妖魔课",
          teacher: "wei_suo",
          exp: 20,
          mpCost: 0
        },
        "4": {
          subject: "magic_theory",
          name: "魔法理论",
          teacher: "xue_musheng",
          exp: 25,
          mpCost: 5
        },
        "5": {
          subject: "star_path",
          name: "星轨课",
          teacher: "tang_yue",
          exp: 30,
          mpCost: 10
        },
        "6": null
      },
      afternoon: {
        "0": null,
        "1": {
          subject: "practice",
          name: "实践课",
          teacher: "tang_yue",
          exp: 40,
          hpCost: 10,
          mpCost: 15,
          injuryChance: 0.2
        },
        "2": {
          subject: "magic_equipment",
          name: "魔器课",
          teacher: "lao_li",
          exp: 20,
          mpCost: 0
        },
        "3": {
          subject: "materials",
          name: "材料课",
          teacher: "lao_li",
          exp: 20,
          mpCost: 0
        },
        "4": {
          subject: "practice",
          name: "实践课",
          teacher: "tang_yue",
          exp: 40,
          hpCost: 10,
          mpCost: 15,
          injuryChance: 0.2
        },
        "5": {
          subject: "demonology",
          name: "妖魔课",
          teacher: "wei_suo",
          exp: 20,
          mpCost: 0
        },
        "6": null
      }
    },
    actions: [
      {
        id: "study",
        name: "上课学习",
        description: "参加当前时段的课程，获得经验和知识",
        icon: "📚",
        timeCost: 4,
        staminaCost: 20,
        effects: {
          exp: 25,
          mp: -5
        },
        eventChance: 0.3,
        events: [
          "event_breakthrough",
          "event_classmate_chat",
          "event_mo_fan_scolded",
          "event_zhao_manyan_showoff",
          "event_mu_ningxue_gossip",
          "event_zhang_xiaohou_find",
          "event_zhou_min_question",
          "event_xu_zhaoting_showoff"
        ],
        isClassAction: true
      },
      {
        id: "train",
        name: "修炼魔法",
        description: "实战修炼魔法（2小时），获得经验，有概率突破或失败受伤",
        icon: "✨",
        timeCost: 2,
        staminaCost: 25,
        effects: {
          exp: 25,
          hp: -5,
          mp: -15
        },
        eventChance: 0.2,
        events: [
          "event_breakthrough",
          "event_training_fail"
        ]
      },
      {
        id: "meditate",
        name: "冥修",
        description: "静心冥修（2小时），恢复MP，小概率突破",
        icon: "🧘",
        timeCost: 2,
        staminaCost: 10,
        effects: {
          exp: 10,
          mp: 30
        },
        eventChance: 0.15,
        events: [
          "event_breakthrough"
        ]
      },
      {
        id: "rest",
        name: "休息",
        description: "在宿舍休息一会儿（1小时），恢复 HP、MP 和体力",
        icon: "😴",
        timeCost: 1,
        staminaCost: 0,
        effects: {
          hp: 50,
          mp: 40,
          stamina: 50
        }
      },
      {
        id: "sleep",
        name: "睡觉",
        description: "好好睡一觉（到第二天早上），恢复体力，22点前睡觉效果最好",
        icon: "🌙",
        timeCost: 8,
        staminaCost: 0,
        effects: {
          hp: 50,
          mp: 50,
          stamina: 100
        }
      },
      {
        id: "library",
        name: "图书馆",
        description: "去图书馆看书（2小时），学习魔法知识，有概率领悟新技能或获得情报",
        icon: "📖",
        timeCost: 1,
        staminaCost: 5,
        effects: {
          exp: 15,
          mp: -5
        },
        eventChance: 0.4,
        events: [
          "event_library_learn",
          "event_library_skill",
          "event_library_info",
          "event_library_meet"
        ]
      },
      {
        id: "shop",
        name: "小卖部",
        description: "学校的小卖部，购买药水和基础物品",
        icon: "🛒",
        timeCost: 0,
        staminaCost: 0,
        shopId: "school_shop"
      },
      {
        id: "talk",
        name: "找人聊天",
        description: "和学校里的 NPC 对话，可能接任务或获得信息",
        icon: "💬",
        timeCost: 0,
        staminaCost: 0,
        npcs: [
          "mo_fan",
          "zhang_xiaohou",
          "zhao_manyan",
          "mu_ningxue",
          "tang_yue",
          "xiao_principal",
          "xue_musheng",
          "zhou_min",
          "xu_zhaoting",
          "he_yu",
          "wang_sanpang"
        ]
      }
    ],
    connectedLocations: [
      "city_street",
      "three_step_tower"
    ],
    enemies: [],
    enemyRate: 0
  },
  three_step_tower: {
    id: "three_step_tower",
    name: "三步塔",
    description: "天澜魔法高中的修炼圣地。塔内星子异常活跃，修炼速度是外界的数倍。塔身三层，越往上星子越活跃，但消耗也越大。",
    backgroundColor: "#1a1a3a",
    unlocked: true,
    unlockCondition: { minLevel: 2 },
    actions: [
      {
        id: "tower_floor1",
        name: "第一层修炼",
        description: "三步塔第一层，星子活跃度是外界的2倍。安全稳定，适合日常修炼。",
        icon: "🗼",
        timeCost: 2,
        staminaCost: 20,
        effects: {
          exp: 50,
          mp: -20
        },
        eventChance: 0.15,
        events: ["event_breakthrough"]
      },
      {
        id: "tower_floor2",
        name: "第二层修炼",
        description: "三步塔第二层，星子活跃度是外界的3倍。修炼更快，但精神消耗较大。需要Lv5以上。",
        icon: "🗼🗼",
        timeCost: 2,
        staminaCost: 35,
        effects: {
          exp: 80,
          mp: -30,
          hp: -10
        },
        eventChance: 0.2,
        events: ["event_breakthrough", "event_training_fail"],
        condition: { level: 5 }
      },
      {
        id: "tower_floor3",
        name: "第三层修炼",
        description: "三步塔第三层，星子活跃度是外界的5倍！修炼极速，但有受伤风险。需要Lv8以上。",
        icon: "🗼🗼🗼",
        timeCost: 2,
        staminaCost: 50,
        effects: {
          exp: 130,
          mp: -40,
          hp: -20
        },
        eventChance: 0.3,
        events: ["event_breakthrough", "event_training_fail", "event_tower_insight"],
        condition: { level: 8 }
      }
    ],
    connectedLocations: [
      "tianlan_school"
    ],
    enemies: [],
    enemyRate: 0,
    isSafeZone: true
  },
  city_street: {
    id: "city_street",
    name: "博城市街",
    description: "博城的主要街道，人来人往，有各种商店。",
    backgroundColor: "#3a2a4a",
    unlocked: true,
    actions: [
      {
        id: "explore",
        name: "逛街",
        description: "在街上闲逛，有概率捡到钱、遇到神秘商人或商店打折",
        icon: "🚶",
        timeCost: 1,
        staminaCost: 10,
        effects: {
          exp: 5
        },
        eventChance: 0.3,
        events: [
          "event_find_money",
          "event_meet_stranger",
          "event_shop_discount",
          "event_street_performer",
          "event_pickpocket",
          "event_drunk_hunter"
        ]
      },
      {
        id: "shop",
        name: "魔法商店",
        description: "专业魔法商店，购买装备、药水和材料",
        icon: "🏪",
        timeCost: 0,
        staminaCost: 0,
        shopId: "magic_shop"
      },
      {
        id: "tavern",
        name: "酒馆",
        description: "猎者聚集的酒馆，有概率接到猎魔任务或发生冲突",
        icon: "🍺",
        timeCost: 0,
        staminaCost: 0,
        eventChance: 0.4,
        events: [
          "event_tavern_quest",
          "event_drunk_fight"
        ]
      },
      {
        id: "talk",
        name: "找人聊天",
        description: "和街上的 NPC 对话，可能接任务或获得信息",
        icon: "💬",
        timeCost: 0,
        staminaCost: 0,
        npcs: [
          "hunter_li",
          "book_shop_owner",
          "magic_association_chairman",
          "mysterious_mage",
          "hunter_receptionist",
          "xu_dahuang",
          "guo_caitang",
          "xiao_ke",
          "li_wenjie",
          "fei_shi"
        ]
      },
      {
        id: "hunter_alliance",
        name: "猎者联盟大厅",
        description: "猎者联盟大厅，接悬赏、加入猎妖队的地方。墙上的大屏幕公布着最新悬赏。",
        icon: "🏛️",
        timeCost: 0,
        staminaCost: 0,
        effects: { exp: 10 },
        eventChance: 0.3,
        events: ["event_hunter_recruit", "event_hunter_bounty"],
        npcs: ["xu_dahuang", "guo_caitang", "xiao_ke", "li_wenjie", "fei_shi"],
        npcRate: 0.6
      }
    ],
    connectedLocations: [
      "tianlan_school",
      "xuefeng_mountain",
      "mingwen_girls_school",
      "old_banyan_district"
    ],
    enemies: [],
    enemyRate: 0
  },
  xuefeng_mountain: {
    id: "xuefeng_mountain",
    name: "雪峰山",
    description: "博城郊外的山脉，有妖魔出没，是猎者们常去的地方。",
    backgroundColor: "#1a3a4a",
    unlocked: true,
    actions: [
      {
        id: "explore",
        name: "探索",
        description: "在山中探索，中等概率遇敌，可能发现草药、宝箱或中陷阱",
        icon: "🔍",
        timeCost: 3,
        staminaCost: 25,
        effects: {
          exp: 10,
          hp: -5,
          mp: -10
        },
        eventChance: 0.3,
        events: [
          "event_find_herb",
          "event_find_treasure",
          "event_trap",
          "event_find_demon_tracks",
          "event_find_demon_clue",
          "event_meet_hunter",
          "event_beautiful_view",
          "event_rain"
        ]
      },
      {
        id: "hunt",
        name: "猎魔",
        description: "主动寻找妖魔战斗，高概率遇敌，战斗胜利获得经验和金币",
        icon: "⚔️",
        timeCost: 4,
        staminaCost: 40,
        effects: {
          hp: -15,
          mp: -20
        }
      },
      {
        id: "gather",
        name: "采集草药",
        description: "采集魔法草药，低概率遇敌，主要获得草药材料",
        icon: "🌿",
        timeCost: 2,
        staminaCost: 20,
        effects: {
          addItem: {
            itemId: "magic_herb",
            count: 2
          },
          exp: 5
        },
        eventChance: 0.3,
        events: [
          "event_find_herb",
          "event_find_rare_herb"
        ]
      }
    ],
    connectedLocations: [
      "city_street",
      "xuefeng_station",
      "baicao_valley"
    ],
    enemies: [
      "shadow_rat",
      "stray_wolf",
      "mountain_ape",
      "demon_wolf",
      "shadow_creature",
      "rock_monster",
      "wind_bird",
      "water_spider",
      "fire_rat",
      "gold_ant",
      "light_moth",
      "thunder_beast",
      "ice_toad",
      "shadow_snake",
      "evil_eye_swamp_demon",
      "running_demon"
    ],
    enemyRate: 0.4
  },
  xuefeng_deep: {
    id: "xuefeng_deep",
    name: "雪峰山深处",
    description: "雪峰山的深处，妖魔横行，危险重重，但也蕴藏着珍贵的资源。",
    backgroundColor: "#0a1a2a",
    unlocked: false,
    unlockCondition: {
      minLevel: 5,
      hint: "需要等级 5 才能进入"
    },
    actions: [
      {
        id: "deep_explore",
        name: "深入探索",
        description: "在深山探索，高概率遇强敌，可能发现稀有宝物或珍贵草药",
        icon: "🏔️",
        timeCost: 4,
        staminaCost: 35,
        effects: {
          exp: 20,
          hp: -15,
          mp: -15
        },
        eventChance: 0.4,
        events: [
          "event_find_rare_herb",
          "event_find_treasure",
          "event_trap",
          "event_find_demon_clue"
        ]
      },
      {
        id: "deep_hunt",
        name: "深度猎魔",
        description: "在深山猎杀强大的妖魔，极高概率遇敌，战斗胜利获得丰厚奖励",
        icon: "⚔️",
        timeCost: 5,
        staminaCost: 50,
        effects: {
          hp: -25,
          mp: -30
        }
      },
      {
        id: "rare_gather",
        name: "采集珍稀草药",
        description: "在深山采集珍稀草药，中等概率遇敌，主要获得稀有材料",
        icon: "🌿",
        timeCost: 3,
        staminaCost: 30,
        eventChance: 0.5,
        events: [
          "event_find_rare_herb",
          "event_find_rare_herb",
          "event_find_herb"
        ]
      }
    ],
    connectedLocations: [
      "xuefeng_mountain"
    ],
    enemies: [
      "thunder_beast",
      "ice_toad",
      "shadow_snake",
      "demon_wolf",
      "rock_monster",
      "giant_eye_rat",
      "bone_spike_zheng",
      "running_demon",
      "evil_eye_swamp_demon"
    ],
    enemyRate: 0.6,
    enemyLevelBonus: 2,
    dropRateBonus: 1.5,
    expBonus: 1.5,
    warriorDemonChance: 0.2,
    warriorDemonMinLevel: 6
  },
  mo_fan_house: {
    id: "mo_fan_house",
    name: "莫凡家",
    description: "围绕半城山而建的住宅区最角落，矮矮一小栋，一层半高，外漆斑驳露出红砖，周围堆着杂物。街坊邻居都是三层半的装修新房，这里显得格外寒酸老旧。但家徒四壁的屋子里，却有着最温暖的亲情。",
    backgroundColor: "#3a2a1a",
    unlocked: false,
    unlockCondition: {
      minOpinion: {
        npcId: "mo_fan",
        value: 20
      },
      hint: "需要和莫凡关系不错才能去他家"
    },
    actions: [
      {
        id: "visit_mo_fan",
        name: "找莫凡聊天",
        description: "去莫凡家找他聊天，可能会听到一些秘密",
        icon: "🏠",
        timeCost: 0,
        staminaCost: 0,
        effects: {
          npcOpinion: {
            npcId: "mo_fan",
            value: 3
          }
        },
        eventChance: 0.3,
        events: [
          "event_mo_fan_secret"
        ]
      },
      {
        id: "visit_mo_jiaxing",
        name: "和莫叔叔聊聊",
        description: "和莫凡的父亲莫家兴聊天，他是个憨厚的中年人",
        icon: "👨",
        timeCost: 0,
        staminaCost: 0,
        effects: {
          npcOpinion: {
            npcId: "mo_jiaxing",
            value: 5
          }
        }
      },
      {
        id: "rest_at_mo_fan",
        name: "在莫凡家休息",
        description: "在莫凡家休息一下，恢复体力和精神",
        icon: "😴",
        timeCost: 3,
        staminaCost: -40,
        effects: {
          hp: 30,
          mp: 20
        }
      }
    ],
    connectedLocations: [
      "tianlan_school",
      "bo_city",
      "mu_manor"
    ],
    npcs: [
      "mo_fan",
      "mo_jiaxing",
      "zhang_xiaohou"
    ],
    npcRate: 0.6
  },
  mu_manor: {
    id: "mu_manor",
    name: "穆家庄园",
    description: "博城穆氏家族的庄园，富丽堂皇，气势恢宏。",
    backgroundColor: "#2a2a4a",
    unlocked: false,
    unlockCondition: {
      minLevel: 3,
      hint: "需要等级 3 才能进入穆家庄园"
    },
    actions: [
      {
        id: "visit_manor",
        name: "参观庄园",
        description: "参观穆家庄园，感受一下大家族的气派",
        icon: "🏛️",
        timeCost: 0,
        staminaCost: 0,
        effects: {
          exp: 5
        },
        eventChance: 0.2,
        events: [
          "event_mu_family_news"
        ]
      },
      {
        id: "find_mu_ningxue",
        name: "找穆宁雪",
        description: "去穆家庄园找穆宁雪，可能会遇到她",
        icon: "❄️",
        timeCost: 0,
        staminaCost: 0,
        condition: {
          minOpinion: {
            npcId: "mu_ningxue",
            value: 15
          }
        },
        effects: {
          npcOpinion: {
            npcId: "mu_ningxue",
            value: 2
          }
        }
      },
      {
        id: "duel_arena",
        name: "决斗场切磋",
        description: "在穆氏庄园的决斗场与其他魔法师切磋，提升实战经验",
        icon: "⚔️",
        timeCost: 2,
        staminaCost: 20,
        effects: { exp: 25 },
        eventChance: 0.6,
        events: ["event_duel_practice", "event_duel_yu_ang"]
      },
      {
        id: "attend_banquet",
        name: "参加宴会",
        description: "参加穆氏家族的宴会，结识博城各界人物",
        icon: "🍷",
        timeCost: 1,
        staminaCost: 10,
        effects: { reputation_mu_family: 5, exp: 10 },
        eventChance: 0.5,
        events: ["event_mu_banquet", "event_meet_important_people"]
      },
      {
        id: "earth_spring",
        name: "地圣泉修炼",
        description: "进入博城地圣泉修炼，修为突飞猛进",
        icon: "💧",
        timeCost: 4,
        staminaCost: 30,
        effects: { exp: 80 },
        condition: {
          hasItem: "earth_spring_pass"
        },
        eventChance: 0.8,
        events: ["event_earth_spring_cultivation"]
      }
    ],
    connectedLocations: [
      "bo_city"
    ],
    npcs: [
      "mu_ningxue",
      "mu_zhuoyun",
      "mu_he",
      "mu_butler",
      "yu_ang"
    ],
    npcRate: 0.3
  },
  bo_north_gate: {
    id: "bo_north_gate",
    name: "博城北门",
    description: "博城的北城门，通往外面的世界。城门守卫森严，平时有士兵把守。",
    backgroundColor: "#3a4a3a",
    unlocked: false,
    unlockCondition: {
      minLevel: 5,
      hint: "需要等级 5 才能去北门"
    },
    actions: [
      {
        id: "watch_gate",
        name: "查看城门",
        description: "看看城门的情况，了解一下外面的消息",
        icon: "🏯",
        timeCost: 0,
        staminaCost: 0,
        effects: {
          exp: 3
        },
        eventChance: 0.3,
        events: [
          "event_gate_news",
          "event_guard_chat"
        ]
      },
      {
        id: "patrol",
        name: "帮忙巡逻",
        description: "帮守卫巡逻，获得一些报酬和声望",
        icon: "🛡️",
        timeCost: 3,
        staminaCost: 25,
        condition: {
          minLevel: 6
        },
        effects: {
          exp: 20,
          gold: 30
        },
        eventChance: 0.2,
        events: [
          "event_patrol_find",
          "event_patrol_attack"
        ]
      }
    ],
    connectedLocations: [
      "city_street",
      "xuefeng_mountain"
    ],
    npcs: [],
    npcRate: 0.1,
    enemies: [
      "demon_wolf",
      "shadow_creature",
      "evil_eye_swamp_demon",
      "running_demon"
    ],
    enemyRate: 0.05
  },
  xuefeng_station: {
    id: "xuefeng_station",
    name: "雪峰山驿站",
    description: "猎者联盟猎者与博城物资联系的重要小寨，建在雪峰山与雷雨山屏之间的山谷中。不是简陋村庄，两边百米陡峭山崖形成天然壁障，前后两大巨石之门锁住，是卡在山谷中的堡垒小镇。守护石门由博城有名土系魔法师兼建造师张玉恒所做，中阶以下魔法无法撼动，坚固不逊钢铁。驿站是安全区域边界，驿站外妖魔可能出没，没足够能力别走出安界。",
    backgroundColor: "#2a3a2a",
    unlocked: false,
    unlockCondition: {
      minLevel: 5,
      questCompleted: "quest_hunt_demon"
    },
    actions: [
      {
        id: "explore",
        name: "探索驿站",
        description: "在驿站内探索，熟悉环境，可能遇到猎者或商贩",
        icon: "🏘️",
        timeCost: 0,
        staminaCost: 0,
        effects: {
          exp: 5
        },
        eventChance: 0.3,
        events: [
          "event_meet_hunter",
          "event_beautiful_view",
          "event_merchant_encounter"
        ]
      },
      {
        id: "shop",
        name: "逛商铺",
        description: "驿站主道有商铺小摊，卖魔法师战斗修炼用品，包括履魔具、魔石等",
        icon: "🛒",
        timeCost: 0,
        staminaCost: 0,
        effects: {},
        shopId: "station_shop"
      },
      {
        id: "talk_hunter",
        name: "与猎者交流",
        description: "与驿站的猎者交流，获取野外经验和情报",
        icon: "💬",
        timeCost: 2,
        staminaCost: 10,
        effects: {
          exp: 8
        },
        eventChance: 0.4,
        events: [
          "event_hunter_advice",
          "event_hunter_story"
        ],
        npcs: [
          "zhan_kong",
          "luo_yunbo",
          "pan_lijun",
          "er_tuzi"
        ]
      },
      {
        id: "rest",
        name: "驿站休息",
        description: "在驿站安全区域休息，恢复体力",
        icon: "😴",
        timeCost: 2,
        staminaCost: -30,
        effects: {
          hp: 20,
          mp: 20
        }
      },
      {
        id: "enter_mountain",
        name: "进入雪峰山",
        description: "离开驿站安界，进入雪峰山野外区域",
        icon: "⛰️",
        timeCost: 0,
        staminaCost: 0,
        effects: {}
      }
    ],
    connectedLocations: [
      "xuefeng_mountain",
      "city_street",
      "baicao_valley"
    ],
    npcs: [
      "zhan_kong",
      "luo_yunbo",
      "pan_lijun",
      "er_tuzi"
    ],
    npcRate: 0.5,
    enemies: [],
    enemyRate: 0,
    isSafeZone: true,
    shops: [
      "station_shop"
    ]
  },
  baicao_valley: {
    id: "baicao_valley",
    name: "百草谷",
    description: "雪峰山深处的山谷，因形似掌状的湖泊而得名，北面山口是历练最终关卡。谷中生长着大量魔法草药，也潜伏着妖藤等植物系妖魔。",
    backgroundColor: "#1a3a1a",
    unlockLevel: 3,
    unlockQuest: "quest_training_camp",
    actions: [
      {
        id: "explore",
        name: "探索百草谷",
        description: "在谷中探索，可能遇到妖魔或发现珍贵草药",
        icon: "🌿",
        timeCost: 2,
        staminaCost: 15,
        effects: {
          exp: 15
        },
        eventChance: 0.4,
        events: ["event_herb_discovery", "event_demon_vine_encounter", "event_valley_view"]
      },
      {
        id: "collect_herbs",
        name: "采集草药",
        description: "在百草谷采集魔法草药，这里草药资源丰富",
        icon: "🌱",
        timeCost: 2,
        staminaCost: 12,
        effects: {
          exp: 10
        },
        eventChance: 0.3,
        events: ["event_herb_discovery", "event_demon_vine_encounter"]
      },
      {
        id: "cross_river",
        name: "跨越河谷",
        description: "尝试跨越10米宽的河谷悬崖，需要风系魔法或绳索",
        icon: "🌊",
        timeCost: 1,
        staminaCost: 20,
        effects: {
          exp: 20
        },
        eventChance: 0.5,
        events: ["event_river_cross_success", "event_river_cross_fail"]
      },
      {
        id: "enter_cave",
        name: "进入旧巢穴",
        description: "进入独眼魔狼的旧巢穴，洞穴内有钟乳石和泉池，危险但可能有宝藏",
        icon: "🕳️",
        timeCost: 2,
        staminaCost: 15,
        effects: {
          exp: 25
        },
        eventChance: 0.6,
        events: ["event_cave_explore", "event_wolf_beast_battle", "event_stalactite_tactics"]
      },
      {
        id: "rest",
        name: "谷中休息",
        description: "在安全的湖边休息，恢复体力",
        icon: "😴",
        timeCost: 2,
        staminaCost: -25,
        effects: {
          hp: 15,
          mp: 15
        }
      },
      {
        id: "talk",
        name: "与同学交流",
        description: "与一同历练的同学交流",
        icon: "💬",
        timeCost: 0,
        staminaCost: 0,
        effects: {},
        npcs: ["bai_yang", "mu_bai", "zhou_min", "xu_zhaoting", "wang_sanpang", "zhang_xiaohou"]
      }
    ],
    connectedLocations: [
      "xuefeng_mountain",
      "xuefeng_station"
    ],
    npcs: [
      "bai_yang",
      "mu_bai",
      "zhou_min",
      "xu_zhaoting",
      "wang_sanpang",
      "zhang_xiaohou"
    ],
    npcRate: 0.4,
    enemies: [
      "demon_vine",
      "demon_wolf",
      "one_eye_wolf"
    ],
    enemyRate: 0.35,
    isSafeZone: false,
    shops: []
  },
  mingwen_girls_school: {
    id: "mingwen_girls_school",
    name: "铭文女子中学",
    description: "博城著名的贵族女子中学，校园宽敞豪华。暑假期间学生稀少，但近期发生了女生失踪事件，食堂传出奇怪的震动和腐臭气味。城市猎妖队已介入调查。",
    icon: "🏫",
    backgroundColor: "#4a3a5a",
    unlocked: false,
    unlockCondition: { level: 5, quest: "quest_city_hunter" },
    connectedLocations: ["city_street"],
    actions: [
      {
        id: "explore_campus",
        name: "探索校园",
        description: "在空旷的校园中探索，寻找线索",
        icon: "🔍",
        timeCost: 0,
        staminaCost: 0,
        effects: { exp: 15 },
        eventChance: 0.4,
        events: ["event_mingwen_explore", "event_mingwen_clue"]
      },
      {
        id: "investigate_cafeteria",
        name: "调查食堂",
        description: "深入调查传出怪声的食堂，可能遇到危险",
        icon: "🍽️",
        timeCost: 2,
        staminaCost: 15,
        effects: { exp: 25 },
        eventChance: 0.6,
        events: ["event_cafeteria_investigate", "event_giant_eye_rat_encounter"]
      },
      {
        id: "visit_library",
        name: "图书馆",
        description: "在学校图书馆阅读，提升知识",
        icon: "📚",
        timeCost: 2,
        staminaCost: 5,
        effects: { exp: 20, mp: 10 },
        eventChance: 0.2,
        events: ["event_library_study"]
      },
      {
        id: "meet_ye_xinxia",
        name: "探望叶心夏",
        description: "探望在小姑家休养的叶心夏",
        icon: "👧",
        timeCost: 0,
        staminaCost: 0,
        effects: { happiness: 10 },
        npcs: ["ye_xinxia"],
        npcRate: 0.8
      }
    ],
    npcs: ["ye_xinxia"],
    npcRate: 0.3,
    enemies: ["giant_eye_mole_rat"],
    enemyRate: 0.25,
    isSafeZone: false,
    shops: []
  },
  old_banyan_district: {
    id: "old_banyan_district",
    name: "老榕树街区",
    description: "博城老城区，因投资方资金短缺成为一片拆迁废墟，烂尾楼和半拆房屋遍布。传闻夜里有奇怪震动，流浪汉频繁失踪。",
    icon: "🏚️",
    backgroundColor: "#3a3a2a",
    connectedLocations: ["city_street"],
    unlockCondition: { level: 6, quest: "quest_old_district" },
    actions: [
      {
        id: "explore_ruins",
        name: "探索废墟",
        description: "在拆迁废墟中探索，寻找异常震动的来源",
        icon: "🔍",
        timeCost: 2,
        staminaCost: 15,
        effects: { exp: 15 },
        eventChance: 0.5,
        events: ["event_old_district_explore", "event_find_demon_footprint", "event_encounter_one_eye_wolf"]
      },
      {
        id: "use_demon_powder",
        name: "使用寻妖粉",
        description: "撒下寻妖粉，检测妖魔留下的气息足迹",
        icon: "✨",
        timeCost: 0,
        staminaCost: 0,
        effects: {},
        eventChance: 0.8,
        events: ["event_demon_powder_reveal"]
      },
      {
        id: "investigate_construction",
        name: "调查烂尾楼",
        description: "深入烂尾楼调查，妖魔很可能藏身于此",
        icon: "🏢",
        timeCost: 2,
        staminaCost: 20,
        effects: { exp: 20 },
        eventChance: 0.6,
        events: ["event_construction_investigate", "event_one_eye_wolf_ambush"]
      },
      {
        id: "evacuate_residents",
        name: "疏散居民",
        description: "通知老街区的居民和老人撤离危险区域",
        icon: "🚨",
        timeCost: 0,
        staminaCost: 0,
        effects: { reputation_city: 10, exp: 10 },
        eventChance: 0.3,
        events: ["event_evacuate_residents"]
      },
      {
        id: "meet_hunter_team",
        name: "与猎妖队汇合",
        description: "与城市猎妖队汇合，共同对付妖魔",
        icon: "⚔️",
        timeCost: 0,
        staminaCost: 0,
        effects: {},
        npcs: ["xu_dahuang", "guo_caitang", "xiao_ke", "li_wenjie", "fei_shi", "yang_zuohe"],
        npcRate: 0.7
      }
    ],
    npcs: ["xu_dahuang", "guo_caitang", "yang_zuohe", "yu_ang"],
    npcRate: 0.2,
    enemies: ["one_eye_wolf_advanced", "one_eye_wolf"],
    enemyRate: 0.3,
    isSafeZone: false,
    shops: []
  },
  earth_spring: {
    id: "earth_spring",
    name: "地圣泉",
    description: "博城最珍贵的修炼圣地，位于银贸大厦地下十五层。地圣泉是天地灵泉，修炼一小时顶外面三天，无数魔法师梦寐以求。",
    backgroundColor: "#1a3a3a",
    unlocked: false,
    unlockCondition: {
      hasItem: "earth_spring_pass",
      hint: "需要地圣泉通行证才能进入"
    },
    actions: [
      {
        id: "meditate_spring",
        name: "地圣泉冥修",
        description: "在地圣泉中央冥修，吸收天地灵气，修为突飞猛进",
        icon: "🧘",
        timeCost: 4,
        staminaCost: 20,
        effects: { exp: 150, mp: 80 },
        eventChance: 0.5,
        events: ["event_earth_spring_cultivation", "event_earth_spring_anomaly"]
      },
      {
        id: "talk_guards",
        name: "与守卫交谈",
        description: "与地圣泉的守卫们聊天，了解情况",
        icon: "💬",
        timeCost: 0,
        staminaCost: 0,
        effects: {},
        npcs: ["liang_bin", "lin_yuxin"],
        npcRate: 0.8
      },
      {
        id: "explore_underground",
        name: "探索地下通道",
        description: "探索地圣泉周围的地下通道，可能有发现",
        icon: "🔦",
        timeCost: 2,
        staminaCost: 25,
        effects: { exp: 30 },
        eventChance: 0.6,
        events: ["event_underground_explore", "event_giant_eye_rat_encounter"]
      }
    ],
    connectedLocations: [
      "bo_city"
    ],
    npcs: ["liang_bin", "lin_yuxin"],
    npcRate: 0.5,
    enemies: ["giant_eye_rat"],
    enemyRate: 0.2,
    isSafeZone: true,
    shops: []
  }
};
