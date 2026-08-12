/**
 * 任务数据
 * 从 game-data.js 拆分而来
 */

const DataQuests = {
  quest_intro: {
    id: "quest_intro",
    name: "初识魔法",
    description: "唐月老师让你去修炼场熟悉一下魔法的使用。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      {
        type: "reach",
        locationId: "tianlan_school",
        count: 1,
        description: "在学校修炼一次"
      }
    ],
    rewards: {
      exp: 80,
      gold: 50,
      items: [
        {
          itemId: "health_potion",
          count: 3
        }
      ]
    },
    prerequisites: [],
    nextQuest: "quest_collect_herbs",
    isMainQuest: true,
    dialogueStart: "你好，新来的同学。作为第一次修炼，先去修炼场感受一下魔法吧。",
    dialogueInProgress: "怎么样，感受到魔法的力量了吗？",
    dialogueComplete: "很好，看来你很有天赋呢！"
  },
  quest_collect_herbs: {
    id: "quest_collect_herbs",
    name: "采集草药",
    description: "唐月老师需要一些魔法草药，去雪峰山采集5株回来。",
    giver: "tang_yue",
    type: "collect",
    objectives: [
      {
        type: "collect",
        itemId: "magic_herb",
        count: 5,
        description: "采集 5 株魔法草药"
      }
    ],
    rewards: {
      exp: 150,
      gold: 120,
      items: [
        {
          itemId: "mana_potion",
          count: 3
        }
      ],
      unlocks: []
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: "quest_hunt_demon",
    isMainQuest: true,
    dialogueStart: "我需要一些魔法草药做研究，你能帮我去雪峰山采集一些吗？",
    dialogueInProgress: "草药采得怎么样了？小心山上的妖魔哦。",
    dialogueComplete: "太谢谢你了！这些草药正好够用。"
  },
  quest_hunt_demon: {
    id: "quest_hunt_demon",
    name: "猎杀妖魔",
    description: "莫凡说雪峰山有一只幽狼兽在作乱，去把它解决掉！",
    giver: "mo_fan",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 1,
        description: "击败 1 只幽狼兽"
      }
    ],
    rewards: {
      exp: 200,
      gold: 150,
      items: [
        {
          itemId: "basic_staff",
          count: 1
        }
      ]
    },
    prerequisites: [
      "quest_collect_herbs"
    ],
    nextQuest: "quest_magic_practice",
    isMainQuest: true,
    dialogueStart: "嘿，雪峰山最近有只幽狼兽很嚣张，敢不敢去把它干掉？",
    dialogueInProgress: "怎么样，那只幽狼兽解决了吗？小心点，那家伙可不弱。",
    dialogueComplete: "可以啊你！居然真的干掉了幽狼兽，有点本事！"
  },
  quest_hunt_wolf_pack: {
    id: "quest_hunt_wolf_pack",
    name: "猎杀狼群",
    description: "学校附近出现了一群幽狼兽，威胁到了学生的安全。去雪峰山击败 3 只幽狼兽。",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 3,
        description: "击败 3 只幽狼兽"
      }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        {
          itemId: "health_potion",
          count: 5
        },
        {
          itemId: "mana_potion",
          count: 3
        }
      ],
      reputation: {
        tianlan_school: 10
      }
    },
    prerequisites: [
      "quest_hunt_demon"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "最近雪峰山的幽狼兽越来越多了，已经威胁到学校的安全了。你能帮忙清理一下吗？",
    dialogueInProgress: "狼群清理得怎么样了？一定要注意安全。",
    dialogueComplete: "太感谢你了！学校的安全有保障了。你在学校的声望也提高了。"
  },
  quest_mu_bai_challenge: {
    id: "quest_mu_bai_challenge",
    name: "穆白的挑战",
    description: "穆氏世家的穆白看不起平民出身的法师，他向你发起了挑战。接受他的挑战，证明自己的实力！",
    giver: "mu_bai",
    type: "duel",
    objectives: [
      {
        type: "duel",
        npcId: "mu_bai",
        count: 1,
        description: "在决斗中击败穆白"
      }
    ],
    rewards: {
      exp: 250,
      gold: 200,
      items: [
        {
          itemId: "basic_staff",
          count: 1
        }
      ],
      reputation: {
        tianlan_school: 15,
        mu_family: -10
      }
    },
    prerequisites: [
      "quest_hunt_demon"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "哼，平民就是平民，也配和我在一个学校？敢不敢和我决斗？让我教教你什么是真正的魔法！",
    dialogueInProgress: "怎么，不敢了？我就知道平民都是胆小鬼。",
    dialogueComplete: "不可能！我居然输给了一个平民？！你等着，这还没完！"
  },
  quest_collect_more_herbs: {
    id: "quest_collect_more_herbs",
    name: "更多草药",
    description: "唐月老师需要更多的魔法草药做实验。去雪峰山采集 10 株回来。",
    giver: "tang_yue",
    type: "collect",
    objectives: [
      {
        type: "collect",
        itemId: "magic_herb",
        count: 10,
        description: "采集 10 株魔法草药"
      }
    ],
    rewards: {
      exp: 250,
      gold: 150,
      items: [
        {
          itemId: "super_health_potion",
          count: 2
        }
      ],
      reputation: {
        tianlan_school: 5
      }
    },
    prerequisites: [
      "quest_collect_herbs"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "我的实验还需要更多的魔法草药，你能再帮我采集一些吗？",
    dialogueInProgress: "草药采得怎么样了？慢慢来，不用着急。",
    dialogueComplete: "太好了，这些草药足够我做实验了。谢谢你的帮助！"
  },
  quest_hunt_shadow: {
    id: "quest_hunt_shadow",
    name: "暗影威胁",
    description: "猎魔者公会发布了任务，雪峰山的暗影怪越来越多了。去击败 2 只暗影怪。",
    giver: "mo_fan",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "shadow_creature",
        count: 2,
        description: "击败 2 只暗影怪"
      }
    ],
    rewards: {
      exp: 280,
      gold: 180,
      items: [
        {
          itemId: "demon_core",
          count: 3
        }
      ],
      reputation: {
        hunter_guild: 15
      }
    },
    prerequisites: [
      "quest_hunt_demon"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "听说猎魔者公会最近在悬赏暗影怪，那东西很狡猾，你敢去试试吗？",
    dialogueInProgress: "暗影怪解决了吗？那家伙藏在阴影里，很难对付。",
    dialogueComplete: "厉害啊！暗影怪都被你干掉了，猎魔者公会那边应该会给你记一功。"
  },
  quest_hunt_stone: {
    id: "quest_hunt_stone",
    name: "石怪威胁",
    description: "雪峰山的石怪越来越多了，挡住了采药人的路。去击败 2 只石怪。",
    giver: "mo_fan",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "stone_monster",
        count: 2,
        description: "击败 2 只石怪"
      }
    ],
    rewards: {
      exp: 350,
      gold: 220,
      items: [
        {
          itemId: "magic_stone",
          count: 3
        }
      ],
      reputation: {
        hunter_guild: 10
      }
    },
    prerequisites: [
      "quest_hunt_shadow"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "雪峰山的石怪最近很嚣张，很多采药人都不敢上山了。你能去清理一下吗？",
    dialogueInProgress: "石怪清理得怎么样了？那家伙皮糙肉厚，很难对付。",
    dialogueComplete: "可以啊！石怪都被你干掉了，采药人们又能上山了。猎魔者公会的声望又涨了！"
  },
  quest_explore_mountain: {
    id: "quest_explore_mountain",
    name: "探索雪峰山",
    description: "学校需要了解雪峰山的最新情况，去雪峰山探索一下。",
    giver: "tang_yue",
    type: "explore",
    objectives: [
      {
        type: "reach",
        locationId: "snow_peak_mountain",
        count: 1,
        description: "到达雪峰山"
      }
    ],
    rewards: {
      exp: 150,
      gold: 80,
      items: [
        {
          itemId: "health_potion",
          count: 3
        }
      ],
      reputation: {
        tianlan_school: 5
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "学校想了解一下雪峰山的情况，你能去探索一下吗？注意安全。",
    dialogueInProgress: "雪峰山探索得怎么样了？有没有发现什么异常？",
    dialogueComplete: "辛苦了！你带回来的信息很有价值。学校会记住你的贡献的。"
  },
  quest_hunt_thunder: {
    id: "quest_hunt_thunder",
    name: "雷兽的威胁",
    description: "雪峰山出现了雷兽，威力强大，很多猎人都吃亏了。去击败 2 只雷兽。",
    giver: "hunter_li",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "thunder_beast",
        count: 2,
        description: "击败 2 只雷兽"
      }
    ],
    rewards: {
      exp: 400,
      gold: 300,
      items: [
        {
          itemId: "demon_core",
          count: 5
        },
        {
          itemId: "super_health_potion",
          count: 3
        }
      ],
      reputation: {
        hunter_guild: 20
      }
    },
    prerequisites: [
      "quest_hunt_stone"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "最近山里出现了雷兽，那家伙厉害得很，好几个猎人都受伤了。你敢去试试吗？",
    dialogueInProgress: "雷兽解决了吗？那家伙的雷电魔法很厉害，小心被麻痹了。",
    dialogueComplete: "厉害啊！雷兽都被你干掉了，你在猎魔者公会的声望可是大涨啊！"
  },
  quest_book_shop_request: {
    id: "quest_book_shop_request",
    name: "书店的请求",
    description: "陈老板需要一些妖魔精核来做研究，去雪峰山收集 5 颗妖魔精核。",
    giver: "book_shop_owner",
    type: "collect",
    objectives: [
      {
        type: "collect",
        itemId: "demon_core",
        count: 5,
        description: "收集 5 颗妖魔精核"
      }
    ],
    rewards: {
      exp: 300,
      gold: 250,
      items: [
        {
          itemId: "mana_potion",
          count: 5
        },
        {
          itemId: "super_health_potion",
          count: 2
        }
      ],
      reputation: {
        tianlan_school: 5
      }
    },
    prerequisites: [
      "quest_collect_herbs"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "我最近在研究妖魔的生态，需要一些妖魔精核做实验。你能帮我收集一些吗？",
    dialogueInProgress: "妖魔精核收集得怎么样了？慢慢来，不用着急。",
    dialogueComplete: "太好了！这些妖魔精核正好够用。谢谢你的帮助！"
  },
  quest_magic_association_request: {
    id: "quest_magic_association_request",
    name: "魔法协会的委托",
    description: "魔法协会需要调查雪峰山的妖魔异动，去击败 5 只不同种类的妖魔。",
    giver: "magic_association_chairman",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 1,
        description: "击败 1 只幽狼兽"
      },
      {
        type: "kill",
        enemyId: "shadow_creature",
        count: 1,
        description: "击败 1 只暗影怪"
      },
      {
        type: "kill",
        enemyId: "stone_monster",
        count: 1,
        description: "击败 1 只石怪"
      },
      {
        type: "kill",
        enemyId: "thunder_beast",
        count: 1,
        description: "击败 1 只雷兽"
      },
      {
        type: "kill",
        enemyId: "wind_bird",
        count: 1,
        description: "击败 1 只风翼鸟"
      }
    ],
    rewards: {
      exp: 600,
      gold: 500,
      items: [
        {
          itemId: "super_health_potion",
          count: 5
        },
        {
          itemId: "mana_potion",
          count: 5
        },
        {
          itemId: "magic_stone",
          count: 10
        }
      ],
      reputation: {
        magic_association: 20
      }
    },
    prerequisites: [
      "quest_hunt_thunder"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "魔法协会需要调查雪峰山的妖魔异动，你能帮我们收集一些样本吗？",
    dialogueInProgress: "调查得怎么样了？一定要注意安全，这次的任务可不简单。",
    dialogueComplete: "做得好！你带回来的信息很有价值。魔法协会会记住你的贡献的。"
  },
  quest_mysterious_test: {
    id: "quest_mysterious_test",
    name: "神秘人的考验",
    description: "那个神秘的流浪法师说要考验一下你的实力，去雪峰山击败 3 只暗影怪。",
    giver: "mysterious_mage",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "shadow_creature",
        count: 3,
        description: "击败 3 只暗影怪"
      }
    ],
    rewards: {
      exp: 350,
      gold: 100,
      items: [
        {
          itemId: "demon_core",
          count: 5
        }
      ],
      reputation: {}
    },
    prerequisites: [
      "quest_hunt_shadow"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "...想知道更多秘密？先证明一下你的实力吧。去击败 3 只暗影怪。",
    dialogueInProgress: "...怎么样，暗影怪解决了吗？",
    dialogueComplete: "...不错，有点意思。我可以告诉你更多了。"
  },
  quest_zhao_manyan_request: {
    id: "quest_zhao_manyan_request",
    name: "赵满延的请求",
    description: "赵满延说他丢了一件重要的东西，可能在雪峰山，帮他找回来。",
    giver: "zhao_manyan",
    type: "explore",
    objectives: [
      {
        type: "reach",
        locationId: "snow_peak_mountain",
        count: 3,
        description: "在雪峰山探索 3 次"
      }
    ],
    rewards: {
      exp: 200,
      gold: 300,
      items: [
        {
          itemId: "health_potion",
          count: 5
        },
        {
          itemId: "mana_potion",
          count: 5
        }
      ],
      reputation: {}
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "兄弟，帮我个忙呗！我上次去雪峰山玩的时候丢了一件重要的东西，你能帮我找回来吗？",
    dialogueInProgress: "找到了吗？那东西对我很重要的！",
    dialogueComplete: "太好了！终于找到了！兄弟你太够意思了！走，我请你喝酒！"
  },
  quest_zhang_xiaohou_favor: {
    id: "quest_zhang_xiaohou_favor",
    name: "张小侯的委托",
    description: "张小侯说他有件事想请你帮忙，去和他聊聊吧。",
    giver: "zhang_xiaohou",
    type: "favor",
    objectives: [
      {
        type: "talk",
        npcId: "zhang_xiaohou",
        count: 1,
        description: "和张小侯对话"
      },
      {
        type: "collect",
        itemId: "magic_herb",
        count: 3,
        description: "帮张小侯采集 3 株魔法草药"
      }
    ],
    rewards: {
      exp: 150,
      gold: 50,
      items: [
        {
          itemId: "health_potion",
          count: 3
        }
      ],
      reputation: {
        tianlan_school: 5
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "那个... 你能帮我个忙吗？我想采点草药给我奶奶，但是我不敢一个人去山里...",
    dialogueInProgress: "草药采得怎么样了？谢谢你啊，你真是个好人！",
    dialogueComplete: "太谢谢你了！你真是我最好的朋友！以后有什么事尽管找我！"
  },
  quest_book_shop_secret: {
    id: "quest_book_shop_secret",
    name: "书店的秘密",
    description: "陈老板说他知道一些关于穆氏家族的秘密，帮他收集 5 颗妖魔精核，他就告诉你。",
    giver: "book_shop_owner",
    type: "collect",
    objectives: [
      {
        type: "collect",
        itemId: "demon_core",
        count: 5,
        description: "收集 5 颗妖魔精核"
      }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        {
          itemId: "super_health_potion",
          count: 3
        }
      ],
      reputation: {}
    },
    prerequisites: [
      "quest_collect_herbs"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "呵呵，年轻人，想知道一些穆氏家族的秘密吗？帮我收集 5 颗妖魔精核，我就告诉你一些有趣的事。",
    dialogueInProgress: "妖魔精核收集得怎么样了？这可是很稀有的材料哦。",
    dialogueComplete: "不错不错！既然你这么有诚意，那我就告诉你一个秘密... 穆宁雪那丫头，她的身世可不简单啊..."
  },
  quest_hunter_guild_trial: {
    id: "quest_hunter_guild_trial",
    name: "猎魔者公会的试炼",
    description: "老李说如果你能证明自己的实力，就推荐你加入猎魔者公会。去雪峰山击败 5 只不同的妖魔。",
    giver: "hunter_li",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 1,
        description: "击败 1 只幽狼兽"
      },
      {
        type: "kill",
        enemyId: "shadow_creature",
        count: 1,
        description: "击败 1 只暗影怪"
      },
      {
        type: "kill",
        enemyId: "stone_monster",
        count: 1,
        description: "击败 1 只石怪"
      },
      {
        type: "kill",
        enemyId: "thunder_beast",
        count: 1,
        description: "击败 1 只雷兽"
      },
      {
        type: "kill",
        enemyId: "ice_toad",
        count: 1,
        description: "击败 1 只冰蟾"
      }
    ],
    rewards: {
      exp: 800,
      gold: 600,
      items: [
        {
          itemId: "super_health_potion",
          count: 5
        },
        {
          itemId: "mana_potion",
          count: 5
        },
        {
          itemId: "demon_core",
          count: 10
        }
      ],
      reputation: {
        hunter_guild: 25
      }
    },
    prerequisites: [
      "quest_hunt_thunder"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "小子，想加入猎魔者公会吗？那就证明你的实力！去雪峰山击败 5 种不同的妖魔，我就推荐你入会。",
    dialogueInProgress: "怎么样，猎魔的感觉如何？记住，猎魔不是儿戏，一定要小心谨慎。",
    dialogueComplete: "好小子！果然有两下子！从今天起，你就是猎魔者公会的一员了！"
  },
  quest_hunter_daily_wolf: {
    id: "quest_hunter_daily_wolf",
    name: "日常任务：清剿狼群",
    description: "猎魔者公会的日常任务，清剿雪峰山附近的幽狼兽。",
    giver: "hunter_receptionist",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 3,
        description: "击败 3 只幽狼兽"
      }
    ],
    rewards: {
      exp: 150,
      gold: 100,
      items: [
        {
          itemId: "health_potion",
          count: 2
        }
      ],
      reputation: {
        hunter_guild: 5
      }
    },
    prerequisites: [
      "quest_hunter_guild_trial"
    ],
    nextQuest: null,
    isMainQuest: false,
    repeatable: true,
    dialogueStart: "这是今天的日常任务，去雪峰山清剿几只幽狼兽吧。",
    dialogueInProgress: "加油哦，注意安全！",
    dialogueComplete: "做得不错！这是你的奖励。"
  },
  quest_hunter_elite: {
    id: "quest_hunter_elite",
    name: "精英任务：战将级妖魔",
    description: "雪峰山深处出现了战将级妖魔，公会需要高手去处理。",
    giver: "hunter_receptionist",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "giant_eye_rat",
        count: 1,
        description: "击败 1 只巨眼猩鼠"
      }
    ],
    rewards: {
      exp: 500,
      gold: 300,
      items: [
        {
          itemId: "super_health_potion",
          count: 3
        },
        {
          itemId: "demon_core",
          count: 5
        }
      ],
      reputation: {
        hunter_guild: 15
      }
    },
    prerequisites: [
      "quest_hunter_guild_trial"
    ],
    nextQuest: null,
    isMainQuest: false,
    requiredLevel: 6,
    dialogueStart: "雪峰山深处出现了战将级妖魔，你敢去挑战吗？",
    dialogueInProgress: "战将级妖魔很危险，一定要小心！",
    dialogueComplete: "太厉害了！你居然能击败战将级妖魔！"
  },
  quest_mu_family_test: {
    id: "quest_mu_family_test",
    name: "穆家的考验",
    description: "穆家想测试你的实力，如果你能通过考验，就能获得穆家的认可。",
    giver: "mu_butler",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "ice_toad",
        count: 3,
        description: "击败 3 只冰蟾"
      }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        {
          itemId: "mana_potion",
          count: 3
        }
      ],
      reputation: {
        mu_family: 10
      }
    },
    prerequisites: [],
    nextQuest: "quest_mu_family_elite",
    isMainQuest: false,
    requiredLevel: 5,
    dialogueStart: "穆家想邀请你参加一个小考验，通过的话就能获得穆家的认可。你愿意试试吗？",
    dialogueInProgress: "怎么样，考验还顺利吗？穆家从不亏待有实力的人。",
    dialogueComplete: "不错不错！你通过了考验。从今天起，你就是穆家的朋友了。"
  },
  quest_mu_family_elite: {
    id: "quest_mu_family_elite",
    name: "穆家的委托",
    description: "穆家有一个重要的委托，需要高手去雪峰山深处处理一个麻烦的妖魔。",
    giver: "mu_butler",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "bone_spike_zheng",
        count: 1,
        description: "击败 1 只骨刺狰"
      }
    ],
    rewards: {
      exp: 600,
      gold: 500,
      items: [
        {
          itemId: "ice_staff",
          count: 1
        },
        {
          itemId: "super_health_potion",
          count: 5
        }
      ],
      reputation: {
        mu_family: 20
      }
    },
    prerequisites: [
      "quest_mu_family_test"
    ],
    nextQuest: null,
    isMainQuest: false,
    requiredLevel: 8,
    dialogueStart: "穆家有一个重要委托，雪峰山深处出现了一只骨刺狰，很是麻烦。你能帮忙处理一下吗？",
    dialogueInProgress: "骨刺狰防御力极高，一定要小心！",
    dialogueComplete: "了不起！居然能击败骨刺狰！穆家欠你一个人情。"
  },
  quest_magic_association_trial: {
    id: "quest_magic_association_trial",
    name: "魔法协会的试炼",
    description: "魔法协会的试炼，通过的话可以成为协会的外围成员。",
    giver: "magic_association_chairman",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "thunder_beast",
        count: 2,
        description: "击败 2 只雷兽"
      },
      {
        type: "kill",
        enemyId: "stone_monster",
        count: 2,
        description: "击败 2 只石怪"
      }
    ],
    rewards: {
      exp: 400,
      gold: 300,
      items: [
        {
          itemId: "magic_ring",
          count: 1
        }
      ],
      reputation: {
        magic_association: 15
      }
    },
    prerequisites: [],
    nextQuest: "quest_magic_association_elite",
    isMainQuest: false,
    requiredLevel: 6,
    dialogueStart: "年轻人，想加入魔法协会吗？先通过我的试炼吧。",
    dialogueInProgress: "试炼进行得如何？魔法协会只认可有实力的人。",
    dialogueComplete: "不错！你通过了试炼。从今天起，你就是魔法协会的外围成员了。"
  },
  quest_magic_association_elite: {
    id: "quest_magic_association_elite",
    name: "魔法协会的委托",
    description: "魔法协会有一个紧急委托，需要调查雪峰山的妖魔异动原因。",
    giver: "magic_association_chairman",
    type: "investigate",
    objectives: [
      {
        type: "reach",
        locationId: "xuefeng_mountain_deep",
        count: 3,
        description: "深入雪峰山 3 次，调查妖魔异动"
      }
    ],
    rewards: {
      exp: 500,
      gold: 400,
      items: [
        {
          itemId: "super_mana_potion",
          count: 3
        },
        {
          itemId: "demon_core",
          count: 5
        }
      ],
      reputation: {
        magic_association: 20,
        hunter_guild: 10
      }
    },
    prerequisites: [
      "quest_magic_association_trial"
    ],
    nextQuest: null,
    isMainQuest: false,
    requiredLevel: 8,
    dialogueStart: "最近雪峰山的妖魔异动很不正常，协会需要有人去深入调查一下。你愿意帮忙吗？",
    dialogueInProgress: "调查得怎么样了？一定要注意安全，事情可能不简单。",
    dialogueComplete: "辛苦了！这些情报很重要。魔法协会会记住你的贡献。"
  },
  quest_investigate_suspicious: {
    id: "quest_investigate_suspicious",
    name: "调查可疑人物",
    description: "唐月老师说最近雪峰山附近出现了一些可疑人物，让你去调查一下。",
    giver: "tang_yue",
    type: "investigate",
    objectives: [
      {
        type: "reach",
        locationId: "xuefeng_mountain",
        count: 5,
        description: "在雪峰山探索 5 次，寻找可疑人物的踪迹"
      }
    ],
    rewards: {
      exp: 300,
      gold: 150,
      items: [
        {
          itemId: "health_potion",
          count: 3
        },
        {
          itemId: "mana_potion",
          count: 3
        }
      ],
      reputation: {
        tianlan_school: 10
      }
    },
    prerequisites: [
      "quest_collect_more_herbs"
    ],
    nextQuest: "quest_black_church_clues",
    isMainQuest: true,
    dialogueStart: "最近我收到一些报告，说雪峰山附近出现了一些穿着黑色长袍的可疑人物。你能帮我去调查一下吗？一定要小心。",
    dialogueInProgress: "调查得怎么样了？有没有发现什么可疑的情况？记住，安全第一。",
    dialogueComplete: "谢谢你的调查！这些信息很重要。我感觉事情可能比我们想象的更严重..."
  },
  quest_black_church_clues: {
    id: "quest_black_church_clues",
    name: "黑教廷的线索",
    description: "唐月老师怀疑那些可疑人物和黑教廷有关，让你收集更多相关的情报。",
    giver: "tang_yue",
    type: "investigate",
    objectives: [
      {
        type: "kill",
        enemyId: "black_church_acolyte",
        count: 3,
        description: "击败 3 名黑教廷教徒"
      }
    ],
    rewards: {
      exp: 500,
      gold: 250,
      items: [
        {
          itemId: "super_health_potion",
          count: 2
        },
        {
          itemId: "mana_potion",
          count: 3
        },
        {
          itemId: "demon_core",
          count: 3
        }
      ],
      reputation: {
        tianlan_school: 15,
        magic_association: 10
      }
    },
    prerequisites: [
      "quest_investigate_suspicious"
    ],
    nextQuest: "quest_stop_ritual",
    isMainQuest: true,
    dialogueStart: "你的调查证实了我的猜测...那些人很可能是黑教廷的成员。黑教廷是一个非常危险的邪恶组织，你要小心。能帮我收集更多证据吗？",
    dialogueInProgress: "黑教廷的人很危险，你确定要和他们作对吗？记住，如果遇到危险，一定要先保证自己的安全。",
    dialogueComplete: "你做得很好！这些证据足以证明黑教廷确实在博城活动。我会向魔法协会报告这件事的。"
  },
  quest_stop_ritual: {
    id: "quest_stop_ritual",
    name: "阻止黑教廷仪式",
    description: "据情报显示，黑教廷正在雪峰山深处进行一个危险的仪式，必须阻止他们！",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "black_church_deacon",
        count: 1,
        description: "击败黑教廷执事，阻止仪式"
      }
    ],
    rewards: {
      exp: 1000,
      gold: 500,
      items: [
        {
          itemId: "super_health_potion",
          count: 5
        },
        {
          itemId: "mana_potion",
          count: 5
        },
        {
          itemId: "demon_core",
          count: 10
        },
        {
          itemId: "flame_staff",
          count: 1
        }
      ],
      reputation: {
        tianlan_school: 25,
        magic_association: 20,
        hunter_guild: 15
      }
    },
    prerequisites: [
      "quest_black_church_clues"
    ],
    nextQuest: null,
    isMainQuest: true,
    dialogueStart: "不好了！根据最新的情报，黑教廷正在雪峰山深处进行一个召唤仪式！如果让他们成功，后果不堪设想！你能去阻止他们吗？一定要小心，那里会有黑教廷的执事级成员把守。",
    dialogueInProgress: "仪式还在进行吗？时间不多了，一定要尽快阻止他们！",
    dialogueComplete: "太好了！你成功阻止了他们！你救了很多人！不过...我担心这只是开始，黑教廷可能还有更大的阴谋..."
  },
  quest_library_volunteer: {
    id: "quest_library_volunteer",
    name: "图书馆义工",
    description: "图书馆管理员需要人帮忙整理书籍，作为回报会教你一些魔法知识。",
    giver: "book_shop_owner",
    type: "side",
    objectives: [
      {
        type: "reach",
        locationId: "tianlan_school",
        count: 3,
        description: "在天澜魔法高中活动 3 次"
      }
    ],
    rewards: {
      exp: 150,
      gold: 50,
      items: [
        {
          itemId: "mana_potion",
          count: 2
        }
      ],
      reputation: {
        tianlan_school: 5
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "同学，能帮我整理一下书籍吗？作为回报，我可以让你免费看一些珍贵的魔法书籍。",
    dialogueInProgress: "整理得怎么样了？慢慢来，不着急。",
    dialogueComplete: "谢谢你的帮助！这些魔法知识送给你，希望对你有帮助。"
  },
  quest_collect_magic_stones: {
    id: "quest_collect_magic_stones",
    name: "收集魔石",
    description: "魔法协会的研究员需要一些魔石来做研究，他们愿意高价收购。",
    giver: "magic_association_chairman",
    type: "collect",
    objectives: [
      {
        type: "collect",
        itemId: "magic_stone",
        count: 5,
        description: "收集 5 块魔石"
      }
    ],
    rewards: {
      exp: 200,
      gold: 150,
      items: [
        {
          itemId: "health_potion",
          count: 3
        }
      ],
      reputation: {
        magic_association: 10
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "你好，我是魔法协会的研究员。我正在做一项研究，需要一些魔石。你能帮我收集一些吗？",
    dialogueInProgress: "魔石收集得怎么样了？雪峰山的妖魔身上经常会有魔石。",
    dialogueComplete: "太好了！这些魔石正是我需要的！这是你的报酬，以后有需要可以再来找我。"
  },
  quest_hunter_novice: {
    id: "quest_hunter_novice",
    name: "猎魔新手",
    description: "猎魔者公会的前辈想考验一下你的实力，让你去猎杀几只低级妖魔。",
    giver: "hunter_li",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "shadow_creature",
        count: 3,
        description: "击败 3 只暗影怪"
      }
    ],
    rewards: {
      exp: 250,
      gold: 120,
      items: [
        {
          itemId: "stamina_potion",
          count: 2
        },
        {
          itemId: "hunter_knife",
          count: 1
        }
      ],
      reputation: {
        hunter_guild: 15
      }
    },
    prerequisites: [
      "quest_hunt_demon"
    ],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "听说你已经猎杀过幽狼兽了？不错嘛。要不要接受猎魔者公会的正式考验？去击败几只暗影怪，证明你的实力。",
    dialogueInProgress: "暗影怪擅长偷袭，要小心它们的暗影魔法。",
    dialogueComplete: "干得漂亮！你已经具备了成为猎魔者的潜质。这把猎魔匕首送给你，以后可以来公会接更多任务。"
  },
  quest_equipment_prep: {
    id: "quest_equipment_prep",
    name: "装备准备",
    description: "唐月老师建议你去商店买一套基础装备，为后续的冒险做准备。",
    giver: "tang_yue",
    type: "side",
    objectives: [
      {
        type: "reach",
        locationId: "city_street",
        count: 1,
        description: "去博城市街的商店购买装备"
      }
    ],
    rewards: {
      exp: 100,
      gold: 80,
      items: [
        {
          itemId: "health_potion",
          count: 2
        }
      ]
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "冒险的时候装备很重要。我建议你去市里的魔法商店买一把法杖和一件法袍，这样能大大提升你的战斗力。",
    dialogueInProgress: "买到合适的装备了吗？如果钱不够，可以先做些任务攒钱。",
    dialogueComplete: "不错，有了这些装备，你的安全更有保障了。记住，装备只是辅助，自身的修炼才是根本。"
  },
  quest_training_camp: {
    id: "quest_training_camp",
    name: "雪峰山历练",
    description: "斩空总教官组织的雪峰山野外历练，表面上没有老师保护，实际上老师们都在暗中跟随计分。完成悬赏任务可得A评分，打伤召唤兽可得S评分。",
    giver: "zhan_kong",
    type: "story",
    objectives: [
      {
        type: "reach",
        locationId: "xuefeng_station",
        count: 1,
        description: "前往雪峰山驿站集合"
      },
      {
        type: "reach",
        locationId: "baicao_valley",
        count: 1,
        description: "进入百草谷历练区域"
      },
      {
        type: "collect",
        itemId: "magic_herb",
        count: 3,
        description: "在百草谷采集3株魔法草药"
      },
      {
        type: "kill",
        enemyId: "demon_vine",
        count: 1,
        description: "击败1只妖藤"
      }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        {
          itemId: "health_potion",
          count: 3
        },
        {
          itemId: "mana_potion",
          count: 3
        }
      ],
      reputation: {
        tianlan_school: 20
      }
    },
    prerequisites: [
      "quest_hunt_demon"
    ],
    nextQuest: "quest_wolf_beast_challenge",
    isMainQuest: true,
    autoStart: false,
    dialogueStart: "小子，准备好参加雪峰山历练了吗？这次历练表面上没有老师保护，但我们都在暗中跟着。记住，实战和理论完全不同，面对真妖魔别吓傻了。",
    dialogueInProgress: "历练进行得怎么样？百草谷的草药资源很丰富，但也要小心妖藤和幽狼兽。记住，用脑子战斗，而不是只靠蛮力。",
    dialogueComplete: "不错，你完成了历练的基本目标。能在实战中释放魔法，已经能得A了。如果你能打伤幽狼兽，那就是S评分！"
  },
  quest_wolf_beast_challenge: {
    id: "quest_wolf_beast_challenge",
    name: "挑战幽狼兽",
    description: "白阳老师的召唤兽幽狼兽在百草谷活动，如果你能打伤它，就能获得S级历练评分。但要小心，幽狼兽发狂后非常危险！",
    giver: "bai_yang",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 1,
        description: "击败幽狼兽（或用智慧重创它）"
      }
    ],
    rewards: {
      exp: 500,
      gold: 300,
      items: [
        {
          itemId: "wolf_fang",
          count: 2
        },
        {
          itemId: "stardust_device_mortal",
          count: 1
        }
      ],
      reputation: {
        tianlan_school: 30
      }
    },
    prerequisites: [
      "quest_training_camp"
    ],
    nextQuest: null,
    isMainQuest: true,
    autoStart: false,
    dialogueStart: "你想挑战我的幽狼兽？有勇气！不过我提醒你，它比普通妖魔强得多，受刺激还会发狂。你可以正面战斗，也可以用环境智取。",
    dialogueInProgress: "幽狼兽的弱点是眼睛和腹部，发狂时会失去理智，这时候可以利用地形。钟乳石洞穴那种地方，就很适合用智商碾压。",
    dialogueComplete: "竟然真的做到了！不管是正面击败还是用智慧重创，都很了不起。S评分给你！这颗星尘魔器是斩空总教官让我给你的奖励。"
  },
  quest_city_hunter: {
    id: "quest_city_hunter",
    name: "加入城市猎妖队",
    description: "博城城市猎妖队正在招募新队员，雷系法师特别受欢迎。去猎者联盟大厅看看吧。",
    giver: "xu_dahuang",
    type: "story",
    objectives: [
      { type: "reach", locationId: "bo_city", count: 1, description: "前往博城市街" },
      { type: "talk", npcId: "xu_dahuang", count: 1, description: "与徐大荒队长对话" }
    ],
    rewards: {
      exp: 150,
      gold: 100,
      items: [
        { itemId: "healing_potion", count: 3 },
        { itemId: "mana_potion", count: 2 }
      ],
      reputation: {
        city_hunters: 20
      }
    },
    prerequisites: ["quest_hunt_demon"],
    nextQuest: "quest_mingwen_investigation",
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "城市猎妖队正在招新，雷系法师优先！你是雷系？太好了，直接录取！我是队长徐大荒，欢迎加入。",
    dialogueInProgress: "城市猎妖队专门处理城市内的妖魔事件，比野外安全但责任更重。我们队里有冰系副队长彩棠、水系小可、风系黎文杰、土系肥石，加上你这个雷系，阵容齐了。",
    dialogueComplete: "欢迎加入城市猎妖队！这是你的证件，现在你相当于博城的执法人员了。正好有个任务，铭文女子中学有女生失踪，我们需要去调查。"
  },
  quest_mingwen_investigation: {
    id: "quest_mingwen_investigation",
    name: "铭文女子中学失踪事件",
    description: "铭文女子中学有女生失踪，食堂传出奇怪的震动和腐臭气味。前往调查真相。",
    giver: "xu_dahuang",
    type: "story",
    objectives: [
      { type: "reach", locationId: "mingwen_girls_school", count: 1, description: "前往铭文女子中学" },
      { type: "reach", locationId: "mingwen_girls_school", count: 3, description: "探索校园寻找线索（前往3次）" },
      { type: "talk", npcId: "ye_xinxia", count: 1, description: "向叶心夏了解情况" }
    ],
    rewards: {
      exp: 200,
      gold: 150,
      items: [
        { itemId: "healing_potion", count: 5 }
      ],
      reputation: {
        city_hunters: 15
      }
    },
    prerequisites: ["quest_city_hunter"],
    nextQuest: "quest_hunt_giant_rat",
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "铭文女子中学有女生失踪，校方一开始压着不报，现在第二个女生失踪了才找我们。食堂有奇怪震动，你去调查一下。",
    dialogueInProgress: "叶心夏说她嗅到了食堂飘来的腐臭气味，还感觉有东西在盯着她。看来食堂里一定藏着什么妖魔。",
    dialogueComplete: "线索都指向食堂！看来是有妖魔潜伏在学校里。准备好战斗，我们去清理它！"
  },
  quest_hunt_giant_rat: {
    id: "quest_hunt_giant_rat",
    name: "猎杀巨眼猩鼠",
    description: "铭文女子中学食堂里潜伏着一只巨眼猩鼠，它就是女生失踪的元凶。消灭它，保护学校安全。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "kill", enemyId: "giant_eye_mole_rat", count: 1, description: "击败巨眼猩鼠" }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        { itemId: "rat_claw", count: 2 },
        { itemId: "demon_core", count: 1 },
        { itemId: "healing_potion", count: 5 }
      ],
      reputation: {
        city_hunters: 30,
        mingwen_school: 20
      }
    },
    prerequisites: ["quest_mingwen_investigation"],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "巨眼猩鼠是奴仆级妖魔，生活在地下，眼睛能释放腥红穿透光束。它饥饿时会吃人，这只已经吃了两个女生，必须消灭！",
    dialogueInProgress: "巨眼猩鼠速度很快，攻击频率高。注意躲避它的腥红光束，找机会反击。雷系的麻痹效果对它很有效。",
    dialogueComplete: "干得漂亮！巨眼猩鼠被消灭了，铭文女子中学恢复了安全。校方非常感谢我们，给了丰厚的报酬。你这个雷法师，果然没招错！"
  },
  quest_old_district: {
    id: "quest_old_district",
    name: "老街区怪事",
    description: "周敏说她奶奶住的老榕树街区最近夜里总有奇怪震动，工地明明已经停工了。陪她去调查一下。",
    type: "story",
    giver: "zhou_min",
    objectives: [
      { type: "reach", locationId: "old_banyan_district", count: 1, description: "前往老榕树街区调查" },
      { type: "reach", locationId: "old_banyan_district", count: 3, description: "在老榕树街区探索3次" }
    ],
    rewards: {
      exp: 150,
      gold: 100,
      items: [
        { itemId: "demon_detection_powder", count: 3 },
        { itemId: "healing_potion", count: 3 }
      ],
      reputation: { city_hunters: 10 }
    },
    prerequisites: ["quest_hunt_giant_rat"],
    nextQuest: "quest_one_eye_wolf",
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "莫凡，我奶奶家在老榕树街区，最近夜里总有奇怪的震动，可是工地早就停工了。我有点担心，你能陪我去看看吗？",
    dialogueInProgress: "寻妖粉显示这里确实有妖魔活动的痕迹，脚印很大，不像是巨眼猩鼠。继续深入调查，小心点。",
    dialogueComplete: "果然有妖魔！是一只独眼魔狼，而且好像在进阶，非常危险。赶紧通知猎妖队！"
  },
  quest_one_eye_wolf: {
    id: "quest_one_eye_wolf",
    name: "猎杀进阶魔狼",
    description: "老榕树街区出现了一只偷吸地圣泉的进阶期独眼魔狼，战斗力极强。配合猎妖队和魔法协会消灭它！",
    type: "hunt",
    giver: "xu_dahuang",
    objectives: [
      { type: "kill", enemyId: "one_eye_wolf_advanced", count: 1, description: "击败进阶期独眼魔狼" }
    ],
    rewards: {
      exp: 400,
      gold: 300,
      items: [
        { itemId: "wolf_fang", count: 2 },
        { itemId: "demon_core", count: 2 },
        { itemId: "soul_fragment", count: 1 },
        { itemId: "healing_potion", count: 5 },
        { itemId: "mana_potion", count: 5 }
      ],
      reputation: {
        city_hunters: 40,
        magic_association: 30,
        city_street: 20
      }
    },
    prerequisites: ["quest_old_district"],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "这只独眼魔狼偷吸了地圣泉，正在进阶期，战斗力远超普通妖魔。我们猎妖队会配合你，雷系对它有特效，关键时刻靠你了！",
    dialogueInProgress: "它的肌肉骨骼在蜕变，越来越强！用雷系麻痹它，抑制它的进阶！坚持住，杨作河法师马上就到！",
    dialogueComplete: "干得好！进阶期独眼魔狼被消灭了，老榕树街区恢复了安全。魔法协会会给你嘉奖的。对了，那妖魔的魂魄...你收集到了吗？"
  },
  quest_guard_district: {
    id: "quest_guard_district",
    name: "守护街区",
    description: "进阶期独眼魔狼随时可能挣脱控制冲入繁华商业区。疏散居民，坚守阵地，等待中阶法师支援！",
    type: "story",
    giver: "xu_dahuang",
    objectives: [
      { type: "reach", locationId: "old_banyan_district", count: 1, description: "前往老榕树街区支援" },
      { type: "talk", npcId: "xu_dahuang", count: 1, description: "与徐大荒对话" }
    ],
    rewards: {
      exp: 200,
      gold: 150,
      items: [
        { itemId: "healing_potion", count: 3 },
        { itemId: "mana_potion", count: 3 }
      ],
      reputation: {
        city_hunters: 20,
        city_street: 30
      }
    },
    prerequisites: ["quest_old_district"],
    nextQuest: "quest_one_eye_wolf",
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "独眼魔狼在强行进阶，我们不能退！后面就是繁华商业区，无数无辜民众在那里。坚守阵地，等待杨作河法师支援！",
    dialogueInProgress: "它要挣脱了！雷系！快用雷系抑制它！",
    dialogueComplete: "坚持住了！杨作河法师赶到了，我们一起消灭这只妖魔！"
  }
  ,
  quest_magic_duel: {
    id: "quest_magic_duel",
    name: "魔法决斗",
    description: "穆卓云安排你在宇昂的成年礼上与他进行魔法决斗。胜者将获得博城地圣泉的修炼机会。这不仅是个人恩怨，更是学校与世家的较量！",
    type: "story",
    giver: "zhu_principal",
    objectives: [
      { type: "reach", locationId: "mu_manor", count: 1, description: "前往穆氏庄园参加决斗" },
      { type: "kill", enemyId: "yu_ang_duel", count: 1, description: "在决斗中击败宇昂" }
    ],
    rewards: {
      exp: 500,
      gold: 500,
      items: [
        { itemId: "earth_spring_pass", count: 1 },
        { itemId: "magic_crystal", count: 3 },
        { itemId: "super_health_potion", count: 5 },
        { itemId: "super_mana_potion", count: 5 }
      ],
      reputation: {
        tianlan_school: 50,
        city_street: 30,
        hunter_alliance: 20
      }
    },
    prerequisites: ["quest_one_eye_wolf"],
    nextQuest: "quest_earth_spring",
    isMainQuest: true,
    autoStart: false,
    dialogueStart: "莫凡，宇昂的成年礼决斗就要开始了。穆卓云这是想拿你当垫脚石，给宇昂立威。胜者将获得地圣泉修炼机会，这对你来说也是个机遇。尽力就好，输了也没人会怪你。",
    dialogueInProgress: "宇昂的冰系很强，还有地波履魔具。小心他的冰蔓·覆盖，那是3级冰系技能，范围极大！",
    dialogueComplete: "赢了！你竟然赢了宇昂！整个博城都会记住今天的！地圣泉的修炼机会是你的了，好好把握，争取冲击中阶！"
  },
  quest_earth_spring: {
    id: "quest_earth_spring",
    name: "地圣泉修炼",
    description: "你获得了博城地圣泉的修炼资格！在地圣泉中修炼一周，修为将突飞猛进，甚至有机会冲击中阶法师！",
    type: "story",
    giver: "zhu_principal",
    objectives: [
      { type: "reach", locationId: "mu_manor", count: 1, description: "前往穆氏庄园进入地圣泉" },
      { type: "reach", locationId: "mu_manor", count: 3, description: "在地圣泉中修炼3次" }
    ],
    rewards: {
      exp: 800,
      gold: 0,
      items: [
        { itemId: "magic_crystal", count: 5 }
      ],
      reputation: {
        tianlan_school: 30
      }
    },
    prerequisites: ["quest_magic_duel"],
    nextQuest: null,
    isMainQuest: true,
    autoStart: false,
    dialogueStart: "地圣泉是博城最珍贵的修炼圣地，相当于加强版的星尘魔器。在里面修炼一周，抵得上外面半年。这是你冲击中阶的最好机会！",
    dialogueInProgress: "地圣泉的能量正在滋养你的星尘，感觉星子变得更加明亮了。继续修炼！",
    dialogueComplete: "地圣泉修炼结束！你的星尘得到了极大的滋养，距离中阶更近了一步！"
  },
  quest_earth_spring_investigation: {
    id: "quest_earth_spring_investigation",
    name: "地圣泉异常调查",
    description: "林雨欣副卫长发现地下通道中有一些与地圣泉相似的污水，但似乎被污染了。她怀疑这与一年前她妹妹的失踪有关，希望你能帮忙调查。",
    type: "story",
    giver: "lin_yuxin",
    objectives: [
      { type: "reach", locationId: "earth_spring", count: 1, description: "进入地圣泉" },
      { type: "reach", locationId: "earth_spring", count: 3, description: "探索地下通道3次" },
      { type: "kill", enemyId: "giant_eye_rat", count: 3, description: "击败3只巨眼猩鼠" }
    ],
    rewards: {
      exp: 400,
      gold: 300,
      items: [
        { itemId: "star_map_scroll", count: 1 },
        { itemId: "super_health_potion", count: 3 },
        { itemId: "super_mana_potion", count: 3 }
      ],
      reputation: {
        magic_association: 20
      }
    },
    prerequisites: ["quest_earth_spring"],
    nextQuest: null,
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "我在地下通道发现了一些奇怪的水，和地圣泉很像，但又不太一样。药剂师说那水会让生物变得疯狂...我怀疑我妹妹的失踪和这有关。你能帮我调查吗？",
    dialogueInProgress: "地下通道很危险，小心那些巨眼猩鼠。如果你发现任何线索，一定要告诉我。",
    dialogueComplete: "谢谢你的帮助！这些线索很重要...我会继续调查的。如果你以后发现更多信息，随时来找我。"
  },

  // ========== 第一卷主线：第10-20章 ==========
  quest_magic_practice: {
    id: "quest_magic_practice",
    name: "勤学苦练",
    description: "唐月老师说你的魔法基础还不扎实，需要多加练习。去修炼场修炼3次，同时在实战中积累经验。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "reach", locationId: "tianlan_school", count: 3, description: "在学校修炼3次" },
      { type: "kill", enemyId: "demon_wolf", count: 2, description: "击败2只幽狼兽" }
    ],
    rewards: {
      exp: 250,
      gold: 150,
      items: [
        { itemId: "mana_potion", count: 3 }
      ]
    },
    prerequisites: ["quest_hunt_demon"],
    nextQuest: "quest_school_competition",
    isMainQuest: true,
    dialogueStart: "你的魔法天赋不错，但基础还不够扎实。魔法的道路没有捷径，只有不断修炼才能变强。去修炼场多练习练习，同时也别忘记实战经验的积累。",
    dialogueInProgress: "修炼得怎么样了？记住，星子的连接需要专注和耐心，急不得。",
    dialogueComplete: "很好，看来你确实下了功夫。过几天就是学校的学期实战考核了，好好准备吧。"
  },

  quest_school_competition: {
    id: "quest_school_competition",
    name: "学期实战考核",
    description: "天澜魔法高中的学期实战考核到了！你需要在考核中证明自己的实力，赢得3场战斗。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "kill", enemyId: "student_rival", count: 3, description: "在考核中赢得3场战斗" }
    ],
    rewards: {
      exp: 350,
      gold: 200,
      items: [
        { itemId: "basic_staff", count: 1 },
        { itemId: "super_health_potion", count: 2 }
      ],
      reputation: {
        school: 15
      }
    },
    prerequisites: ["quest_magic_practice"],
    nextQuest: "quest_xuefeng_expedition",
    isMainQuest: true,
    dialogueStart: "学期实战考核即将开始！这次考核是模拟战斗，对手是其他同学。别小看他们，有些人的实力可不弱。拿出你的真本事来！",
    dialogueInProgress: "考核还在进行中，继续加油！连胜3场就能获得优秀评价。",
    dialogueComplete: "精彩！你的表现超出了我的预期。以你的实力，接下来的雪峰山历练应该能应付了。"
  },

  quest_xuefeng_expedition: {
    id: "quest_xuefeng_expedition",
    name: "雪峰山历练",
    description: "学校组织雪峰山历练活动，这是检验学生实战能力的重要课程。在雪峰山探索5次，击败 encountered 的妖魔。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "reach", locationId: "xuefeng_mountain", count: 5, description: "在雪峰山探索5次" },
      { type: "kill", enemyId: "demon_wolf", count: 3, description: "击败3只妖魔" }
    ],
    rewards: {
      exp: 400,
      gold: 250,
      items: [
        { itemId: "magic_crystal", count: 1 },
        { itemId: "super_mana_potion", count: 2 }
      ]
    },
    prerequisites: ["quest_school_competition"],
    nextQuest: "quest_one_eye_wolf",
    isMainQuest: true,
    dialogueStart: "接下来是雪峰山历练。记住，这不是游戏，山上的妖魔是真的会伤人的。结伴而行，不要深入太危险的区域。遇到独眼魔狼那种级别的妖魔，立刻撤退！",
    dialogueInProgress: "历练进行得如何？注意安全，不要逞强。",
    dialogueComplete: "你平安回来了就好。听说有人在雪峰山深处看到了独眼魔狼的踪迹...那可是战将级的妖魔，幸好你没遇到。"
  },

  quest_one_eye_wolf: {
    id: "quest_one_eye_wolf",
    name: "独眼魔狼",
    description: "雪峰山出现了一只独眼魔狼，已经伤了几个历练的学生。作为学校里实力较强的学生，你被请求协助解决这个威胁。",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      { type: "kill", enemyId: "one_eye_wolf", count: 1, description: "击败独眼魔狼" }
    ],
    rewards: {
      exp: 600,
      gold: 400,
      items: [
        { itemId: "magic_crystal", count: 2 },
        { itemId: "super_health_potion", count: 3 },
        { itemId: "super_mana_potion", count: 3 }
      ],
      reputation: {
        school: 30,
        magic_association: 10
      }
    },
    prerequisites: ["quest_xuefeng_expedition"],
    nextQuest: "quest_second_element",
    isMainQuest: true,
    dialogueStart: "情况不妙...那只独眼魔狼比预想的更加强大，已经有老师受伤了。以你现在的实力，或许能帮上忙。但你要知道，这战将级的妖魔和之前遇到的完全不是一个级别，你确定要去吗？",
    dialogueInProgress: "一定要小心！独眼魔狼速度极快，不要被它近身。",
    dialogueComplete: "难以置信...你居然击败了独眼魔狼！这可是战将级的妖魔啊！你的名字很快就会在博城传开了。"
  },

  quest_second_element: {
    id: "quest_second_element",
    name: "第二系觉醒",
    description: "学期末，学校将为达到中阶魔法师水平的学生举行第二系觉醒仪式。你需要将等级提升到8级，然后参加觉醒仪式。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "level", count: 8, description: "等级达到 8 级" },
      { type: "reach", locationId: "tianlan_school", count: 1, description: "参加第二系觉醒仪式" }
    ],
    rewards: {
      exp: 500,
      gold: 300,
      items: [
        { itemId: "magic_crystal", count: 3 }
      ],
      unlocks: ["magic_association"]
    },
    prerequisites: ["quest_one_eye_wolf"],
    nextQuest: null,
    isMainQuest: true,
    dialogueStart: "恭喜你！你的实力已经达到了中阶魔法师的水平。学校将为你举行第二系觉醒仪式，这是每个魔法师成长路上的重要里程碑。准备好了吗？",
    dialogueInProgress: "觉醒仪式即将开始，保持专注，感受星子的召唤...",
    dialogueComplete: "太棒了！你成功觉醒了第二系！双系魔法师在整个博城都是凤毛麟角的存在。你的魔法之路，才刚刚开始..."
  },

  quest_hunter_guild_recruit: {
    id: "quest_hunter_guild_recruit",
    name: "猎妖队招募",
    description: "博城猎魔者公会正在招募新的猎妖师。去猎魔者公会了解一下，加入猎妖队，成为一名真正的猎妖师！",
    giver: "mo_fan",
    type: "story",
    objectives: [
      {
        type: "reach",
        locationId: "hunter_guild",
        count: 1,
        description: "前往猎魔者公会"
      },
      {
        type: "kill",
        enemyId: "demon_wolf",
        count: 5,
        description: "击败 5 只妖魔证明实力"
      }
    ],
    rewards: {
      exp: 400,
      gold: 300,
      items: [
        {
          itemId: "hunter_badge",
          count: 1
        }
      ],
      reputation: {
        hunter_guild: 20
      },
      unlocks: ["hunter_quests"]
    },
    prerequisites: [
      "quest_hunt_wolf_pack"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "嘿，你最近表现不错啊！有没有兴趣加入猎妖队？猎魔者公会正在招人，以你的实力肯定没问题。",
    dialogueInProgress: "怎么样，去猎魔者公会报到了吗？记得先完成考核任务哦。",
    dialogueComplete: "恭喜你正式成为猎妖师！以后我们就是战友了，一起猎杀妖魔，保护博城！"
  }
};
