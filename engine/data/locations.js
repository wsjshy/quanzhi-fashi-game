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
        description: "在宿舍休息一会儿（1小时），恢复 HP、MP 和部分体力",
        icon: "😴",
        timeCost: 1,
        staminaCost: 0,
        effects: {
          hp: 20,
          mp: 15,
          stamina: 20
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
        timeCost: 2,
        staminaCost: 10,
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
        timeCost: 1,
        staminaCost: 5,
        shopId: "school_shop"
      },
      {
        id: "talk",
        name: "找人聊天",
        description: "和学校里的 NPC 对话，可能接任务或获得信息",
        icon: "💬",
        timeCost: 1,
        staminaCost: 5,
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
          "he_yu"
        ]
      }
    ],
    connectedLocations: [
      "city_street"
    ],
    enemies: [],
    enemyRate: 0
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
        timeCost: 2,
        staminaCost: 15,
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
        timeCost: 1,
        staminaCost: 10,
        shopId: "magic_shop"
      },
      {
        id: "tavern",
        name: "酒馆",
        description: "猎者聚集的酒馆，有概率接到猎魔任务或发生冲突",
        icon: "🍺",
        timeCost: 1,
        staminaCost: 15,
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
        timeCost: 1,
        staminaCost: 10,
        npcs: [
          "hunter_li",
          "book_shop_owner",
          "magic_association_chairman",
          "mysterious_mage",
          "hunter_receptionist"
        ]
      }
    ],
    connectedLocations: [
      "tianlan_school",
      "xuefeng_mountain"
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
        eventChance: 0.4,
        events: [
          "event_find_herb",
          "event_find_herb",
          "event_find_rare_herb"
        ]
      }
    ],
    connectedLocations: [
      "city_street"
    ],
    enemies: [
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
      "shadow_snake"
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
      "bone_spike_zheng"
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
        timeCost: 2,
        staminaCost: 10,
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
        timeCost: 1,
        staminaCost: 5,
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
        timeCost: 2,
        staminaCost: 10,
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
        timeCost: 2,
        staminaCost: 10,
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
      }
    ],
    connectedLocations: [
      "bo_city"
    ],
    npcs: [
      "mu_ningxue",
      "mu_zhuoyun",
      "mu_he",
      "mu_butler"
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
        timeCost: 1,
        staminaCost: 5,
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
      "shadow_creature"
    ],
    enemyRate: 0.05
  }
};
