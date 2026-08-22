/**
 * 任务数据
 * 从 game-data.js 拆分而来
 */

export const DataQuests = {
  // ========== 第一章·觉醒 ==========
  quest_awakening_ceremony: {
    id: "quest_awakening_ceremony",
    name: "觉醒仪式",
    description: "魔法高考，在天澜魔法高中的觉醒石上觉醒你的天赋。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月老师对话" }
    ],
    rewards: {
      exp: 50,
      gold: 50
    },
    prerequisites: [],
    nextQuest: "quest_intro",
    isMainQuest: true,
    dialogueStart: "今天是魔法高考的日子。将手放在觉醒石上，感受星子的存在……你觉醒了！",
    dialogueInProgress: "觉醒只是第一步，接下来要学会引导星子。",
    dialogueComplete: "恭喜你正式成为魔法学徒！"
  },

  // ========== 第二章·学校生活 ==========
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
    description: "唐月老师说雪峰山有一只幽狼兽在作乱，去把它解决掉！",
    giver: "tang_yue",
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
        type: "kill",
        enemyId: "mu_bai_duel",
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
    giver: "hunter_receptionist",
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
    giver: "hunter_receptionist",
    type: "hunt",
    objectives: [
      {
        type: "kill",
        enemyId: "rock_monster",
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
        enemyId: "rock_monster",
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
        enemyId: "rock_monster",
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
        enemyId: "rock_monster",
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
        { itemId: "health_potion", count: 3 },
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
        { itemId: "health_potion", count: 5 }
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
        { itemId: "health_potion", count: 5 }
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
        { itemId: "health_potion", count: 3 }
      ],
      reputation: { city_hunters: 10 }
    },
    prerequisites: ["quest_hunt_giant_rat"],
    nextQuest: "quest_one_eye_wolf",
    isMainQuest: false,
    autoStart: false,
    dialogueStart: "我奶奶家在老榕树街区，最近夜里总有奇怪的震动，可是工地早就停工了。我有点担心，你能陪我去看看吗？",
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
        { itemId: "health_potion", count: 5 },
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
        { itemId: "health_potion", count: 3 },
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
    dialogueStart: "宇昂的成年礼决斗就要开始了。穆卓云这是想拿你当垫脚石，给宇昂立威。胜者将获得地圣泉修炼机会，这对你来说也是个机遇。尽力就好，输了也没人会怪你。",
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
    giver: "xu_dahuang",
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
  },

  quest_magic_theory_class: {
    id: "quest_magic_theory_class",
    name: "魔法理论课",
    description: "薛木生老师的魔法理论课开始了。去上课，学习魔法基础知识，提升你的理论水平。",
    giver: "xue_musheng",
    type: "story",
    objectives: [
      {
        type: "explore",
        count: 3,
        description: "参加 3 次魔法理论课"
      }
    ],
    rewards: {
      exp: 150,
      gold: 50,
      items: [
        {
          itemId: "magic_book",
          count: 1
        }
      ],
      reputation: {
        tianlan_school: 10
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "同学们，今天我们来讲魔法的基本原理。魔法的本质是星子的共鸣...",
    dialogueInProgress: "理论知识是魔法的基础，一定要认真学习。",
    dialogueComplete: "很好，你对魔法理论的掌握很不错！继续努力。"
  },

  quest_class_exam: {
    id: "quest_class_exam",
    name: "班级考核",
    description: "学期中的班级考核开始了。和同班同学切磋一下，看看你的实力在班级里排第几。",
    giver: "xue_musheng",
    type: "story",
    objectives: [
      {
        type: "kill",
        enemyId: "zhao_kunsan_duel",
        count: 1,
        description: "击败赵坤三"
      },
      {
        type: "kill",
        enemyId: "zhang_xiaohou_duel",
        count: 1,
        description: "击败张小侯"
      }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        {
          itemId: "magic_crystal",
          count: 2
        }
      ],
      reputation: {
        tianlan_school: 15
      }
    },
    prerequisites: [
      "quest_magic_theory_class"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "今天是班级考核日，大家轮流上台切磋，点到为止。",
    dialogueInProgress: "不错不错，继续加油！还有几位同学等着你挑战呢。",
    dialogueComplete: "太棒了！你在班级考核中表现优异，排名很靠前！继续努力，期末考核争取拿第一！"
  },

  quest_library_research: {
    id: "quest_library_research",
    name: "图书馆研究",
    description: "薛木生老师布置了一个研究作业，需要去图书馆查阅资料。去图书馆看5次书，完成研究作业。",
    giver: "xue_musheng",
    type: "story",
    objectives: [
      {
        type: "explore",
        count: 5,
        description: "去图书馆看书 5 次"
      }
    ],
    rewards: {
      exp: 200,
      gold: 100,
      items: [
        {
          itemId: "magic_book",
          count: 1
        }
      ],
      reputation: {
        tianlan_school: 10
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "这学期的研究作业是关于魔法史的，去图书馆多看看书，对你会有帮助的。",
    dialogueInProgress: "图书馆是知识的宝库，要好好利用。",
    dialogueComplete: "很好！你的研究作业完成得很不错，看得出来你很用心。"
  },

  quest_cafeteria_lunch: {
    id: "quest_cafeteria_lunch",
    name: "食堂午餐",
    description: "学习了一上午，肚子饿了吧？去食堂吃个午饭，补充一下体力。",
    giver: "zhang_xiaohou",
    type: "story",
    objectives: [
      {
        type: "explore",
        count: 1,
        description: "去食堂吃一顿饭"
      }
    ],
    rewards: {
      exp: 50,
      gold: 0,
      items: [],
      reputation: {
        tianlan_school: 5
      }
    },
    prerequisites: [
      "quest_intro"
    ],
    nextQuest: null,
    isMainQuest: false,
    dialogueStart: "嘿，快到饭点了，一起去食堂吃饭吧？我听说今天有红烧肉！",
    dialogueInProgress: "快点快点，去晚了就没好吃的了！",
    dialogueComplete: "呼，吃得好饱啊！下午的课才有精神嘛。"
  },

  // ========== 明珠学府·主校区考核任务链（第201-230章）==========

  quest_mingzhu_exam_notice: {
    id: "quest_mingzhu_exam_notice",
    name: "主校区考核",
    description: "导师通知：主校区考核即将开始，目标是在主校区捕获一只暗影妖兽。通过者可入主校区。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月讨论考核" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    nextQuest: "quest_mingzhu_partner",
    isMainQuest: true,
    dialogueStart: "主校区考核要开始了。目标是暗影妖兽，在主校区里。你知道这意味着什么吗——不只是抓妖兽，还有其他学生的竞争。",
    dialogueInProgress: "想好了吗？这次考核不简单。",
    dialogueComplete: "好，准备一下，考核见。"
  },

  quest_mingzhu_partner: {
    id: "quest_mingzhu_partner",
    name: "选择搭档",
    description: "考核前可以和同学交流。去和艾图图、牧奴娇聊聊，了解她们的想法。",
    giver: "ai_tutu",
    type: "story",
    objectives: [
      { type: "talk", npcId: "ai_tutu", count: 1, description: "和艾图图聊聊" },
      { type: "talk", npcId: "mu_nujiao", count: 1, description: "和牧奴娇聊聊" }
    ],
    rewards: { exp: 150, gold: 50 },
    prerequisites: ["quest_mingzhu_exam_notice"],
    nextQuest: "quest_catch_shadow_beast",
    isMainQuest: true,
    dialogueStart: "大魔头！你也要参加考核吗？牧姐姐说她要去，我也想去看看！",
    dialogueInProgress: "考核要小心哦，听说主校区很危险的。",
    dialogueComplete: "好，考核加油！"
  },

  quest_catch_shadow_beast: {
    id: "quest_catch_shadow_beast",
    name: "捕获暗影妖兽",
    description: "进入主校区，找到并击败暗影妖兽。注意：其他学生也在争夺。",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      { type: "kill", enemyId: "shadow_beast", count: 1, description: "击败暗影妖兽" }
    ],
    rewards: {
      exp: 500,
      gold: 300,
      reputation: { mingzhu_school: 10 }
    },
    prerequisites: ["quest_mingzhu_partner"],
    nextQuest: "quest_black_church_encounter",
    isMainQuest: true,
    dialogueStart: "暗影妖兽在主校区出没。找到它，击败它。但小心——不只是妖兽在暗处。",
    dialogueInProgress: "找到暗影妖兽了吗？",
    dialogueComplete: "干得好。但事情没那么简单……"
  },

  quest_black_church_encounter: {
    id: "quest_black_church_encounter",
    name: "黑教廷现身",
    description: "考核中出现了黑教廷的灰衣人！击败他们，保护同学。",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      { type: "kill", enemyId: "black_church_gray", count: 3, description: "击败3名黑教廷灰衣人" }
    ],
    rewards: {
      exp: 800,
      gold: 500,
      reputation: { hunter_guild: 15, mingzhu_school: 10 }
    },
    prerequisites: ["quest_catch_shadow_beast"],
    nextQuest: "quest_xu_zhaoting_farewell",
    isMainQuest: true,
    dialogueStart: "是黑教廷！他们怎么会在这里？！小心，这些人不是普通学生！",
    dialogueInProgress: "灰衣人不止一个，小心！",
    dialogueComplete: "解决了……但还有更糟的事。"
  },

  quest_xu_zhaoting_farewell: {
    id: "quest_xu_zhaoting_farewell",
    name: "最后的告别",
    description: "许昭霆被黑教廷变成了诅咒畜妖。在他残存的意识消失前，完成他最后的心愿。",
    giver: "zhang_xiaohou",
    type: "story",
    objectives: [
      { type: "talk", npcId: "zhang_xiaohou", count: 1, description: "听张小侯讲述经过" }
    ],
    rewards: {
      exp: 1000,
      items: [{ itemId: "shen_shizhe_name_list", count: 1 }],
      reputation: { hunter_guild: 20 }
    },
    prerequisites: ["quest_black_church_encounter"],
    nextQuest: "quest_da_hun_zhan",
    isMainQuest: true,
    dialogueStart: "许昭霆……他用最后的意识把神侍者的名字交给了我。他求我结束他的痛苦。帕特农救不了他。我……用玫炎送了他和张璐璐最后一程。",
    dialogueInProgress: "……",
    dialogueComplete: "他的仇，我来报。神侍者的名字，我会追查到底。"
  },

  quest_da_hun_zhan: {
    id: "quest_da_hun_zhan",
    name: "大混战",
    description: "你用暗影妖兽引蛇出洞，近千学生在驯兽铁笼前混战。在混乱中击败黑教廷的党羽。",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      { type: "kill", enemyId: "shen_mingxiao", count: 1, description: "击败沈明笑" },
      { type: "kill", enemyId: "wang_liting", count: 1, description: "击败王力挺" }
    ],
    rewards: {
      exp: 1500,
      gold: 1000,
      reputation: { mingzhu_school: 20, hunter_guild: 10 }
    },
    prerequisites: ["quest_xu_zhaoting_farewell"],
    nextQuest: "quest_yu_ang_final",
    isMainQuest: true,
    dialogueStart: "我把暗影妖兽带到驯兽铁笼，宣布地圣泉在它肚子里。所有学生都疯了——黑教廷的人也一定会出手。在混乱中，找到他们。",
    dialogueInProgress: "混战中注意辨别目标！",
    dialogueComplete: "杂鱼清完了。宇昂——该你了。"
  },

  quest_yu_ang_final: {
    id: "quest_yu_ang_final",
    name: "对决宇昂",
    description: "宇昂伪装在学生中，最终现身。与他决一死战，为许昭霆报仇！",
    giver: "tang_yue",
    type: "hunt",
    objectives: [
      { type: "kill", enemyId: "yu_ang_black_church", count: 1, description: "击败宇昂（黑教廷教士）" }
    ],
    rewards: {
      exp: 3000,
      gold: 5000,
      items: [{ itemId: "dark_church_badge", count: 1 }],
      reputation: { mingzhu_school: 50, hunter_guild: 50, tianlan_school: 30 }
    },
    prerequisites: ["quest_da_hun_zhan"],
    nextQuest: null,
    isMainQuest: true,
    dialogueStart: "宇昂！博城的账，许昭霆的命，今天一起算！",
    dialogueInProgress: "宇昂很强，小心！",
    dialogueComplete: "结束了……许昭霆，你看到了吗。"
  },

  // ========== 第七章·离开博城 ==========
  quest_journey_to_mingzhu: {
    id: "quest_journey_to_mingzhu",
    name: "前往明珠",
    description: "博城灾后重建已毕，是时候前往明珠学府了。那里有更广阔的天地。",
    giver: "tang_yue",
    type: "story",
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师告别" }
    ],
    rewards: {
      exp: 500,
      gold: 1000,
      items: [
        { itemId: "health_potion", count: 5 },
        { itemId: "mana_potion", count: 5 }
      ]
    },
    prerequisites: ["quest_second_element"],
    nextQuest: "quest_school_competition",
    isMainQuest: true,
    dialogueStart: "博城的事告一段落了。以你的天赋，不该困在这里。去明珠吧，那里有最好的资源。",
    dialogueInProgress: "去了明珠要更加努力，别给天澜丢脸。",
    dialogueComplete: "一路顺风。明珠……会是你新的开始。"
  },

  // ========== v0.25.0 玩家个人任务线 ==========
  // 这些任务基于玩家的选择/系别/关系/行为自动触发，不是莫凡的剧情

  personal_fire_training: {
    id: "personal_fire_training",
    name: "火焰的掌控",
    description: "你觉醒了火系魔法。唐月老师注意到你的天赋，建议你进行专门的火焰控制训练。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "fire", minLevel: 2 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次火系魔法" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你的火系天赋不错。但力量需要控制，去修炼场练习如何精准引导火焰吧。",
    dialogueInProgress: "继续练习，控制比力量更重要。",
    dialogueComplete: "很好，你已经能初步控制火焰了。这只是开始。"
  },

  personal_ice_training: {
    id: "personal_ice_training",
    name: "寒冰的领悟",
    description: "你觉醒了冰系魔法。穆宁雪似乎注意到了同为冰系的你，她的修炼方式值得参考。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { element: "ice", minLevel: 2 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次冰系魔法" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "……冰系。不要学我，找到你自己的方式。",
    dialogueInProgress: "冰系的关键是冷静。",
    dialogueComplete: "你有自己的节奏。不错。"
  },

  personal_cultivation_dedication: {
    id: "personal_cultivation_dedication",
    name: "修炼的执着",
    description: "你在修炼上投入了大量时间。萧院长注意到了你的勤奋，决定给你一些指导。",
    giver: "xiao_yuanzhang",
    type: "personal",
    trigger: { minCultivateCount: 10 },
    objectives: [
      { type: "cultivate", count: 10, description: "再修炼10次" }
    ],
    rewards: { exp: 300, gold: 150 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "年轻人，我注意到你很勤奋。修炼一途，贵在坚持。让我指点你一二。",
    dialogueInProgress: "继续保持，不要懈怠。",
    dialogueComplete: "你的努力我看在眼里。继续加油。"
  },

  personal_tangyue_guidance: {
    id: "personal_tangyue_guidance",
    name: "唐月的关注",
    description: "你和唐月老师的关系越来越好。她似乎愿意给你一些私下的指导。",
    giver: "tang_yue",
    type: "personal",
    trigger: { minRelationship: { tang_yue: 30 } },
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 3, description: "与唐月老师对话3次" }
    ],
    rewards: { exp: 250, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你最近的表现不错。有空的话，可以来找我聊聊。",
    dialogueInProgress: "有什么不懂的，随时问我。",
    dialogueComplete: "你是个有天赋的学生。我很期待你的成长。"
  },

  personal_explorer: {
    id: "personal_explorer",
    name: "探索者的脚步",
    description: "你喜欢四处探索。猎法师公会的人注意到了你的活跃度，可能有适合你的委托。",
    giver: "hunter_receptionist",
    type: "personal",
    trigger: { minExploreCount: 5 },
    objectives: [
      { type: "explore", count: 5, description: "探索5个不同地点" }
    ],
    rewards: { exp: 200, gold: 200 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "听说你经常四处跑？我们这里有个小委托，有没有兴趣？",
    dialogueInProgress: "继续探索，博城周边还有很多未知。",
    dialogueComplete: "干得不错。以后有更高级的委托，我会优先考虑你。"
  },

  // v0.25.0 Phase2: 更多元素系别任务
  personal_thunder_training: {
    id: "personal_thunder_training",
    name: "雷电的速度",
    description: "你觉醒了雷系魔法。雷系以速度和爆发力著称，需要精准的时机把握。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "thunder", minLevel: 2 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次雷系魔法" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "雷系……很稀有的天赋。记住，雷系的关键是快和准，去修炼场体会吧。",
    dialogueInProgress: "速度还不够，继续练习。",
    dialogueComplete: "你的雷系已经初具威力了。"
  },

  personal_earth_training: {
    id: "personal_earth_training",
    name: "大地的坚韧",
    description: "你觉醒了土系魔法。土系以防御和稳重著称，是团队中可靠的后盾。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "earth", minLevel: 2 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次土系魔法" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "土系是最踏实的系别。打好基础，你的防御会让所有人安心。",
    dialogueInProgress: "稳扎稳打，不要急。",
    dialogueComplete: "你的土系防御已经很扎实了。"
  },

  personal_wind_training: {
    id: "personal_wind_training",
    name: "风的自由",
    description: "你觉醒了风系魔法。风系以灵活和机动性著称，张小侯也是风系，可以交流。",
    giver: "zhang_xiaohou",
    type: "personal",
    trigger: { element: "wind", minLevel: 2 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次风系魔法" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你也是风系？太好了！风系最讲究灵活，我们一起练习吧！",
    dialogueInProgress: "风系要的是随心所欲，不要被束缚。",
    dialogueComplete: "你的风系越来越熟练了，以后我们可以一起修炼！"
  },

  personal_water_training: {
    id: "personal_water_training",
    name: "水的柔韧",
    description: "你觉醒了水系魔法。水系以柔韧和适应性著称，攻守兼备。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "water", minLevel: 2 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次水系魔法" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "水系是最灵活的系别。像水一样，能适应任何环境。",
    dialogueInProgress: "保持柔韧，不要硬碰硬。",
    dialogueComplete: "你已经体会到水的柔韧了。"
  },

  // v0.25.0 Phase3: 更多关系驱动任务
  personal_muningxue_recognition: {
    id: "personal_muningxue_recognition",
    name: "穆宁雪的认可",
    description: "你和穆宁雪的关系逐渐拉近。她虽然高冷，但似乎开始认可你了。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { minRelationship: { mu_ningxue: 40 } },
    objectives: [
      { type: "talk", npcId: "mu_ningxue", count: 5, description: "与穆宁雪对话5次" }
    ],
    rewards: { exp: 300, gold: 150 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "……你和别人不一样。至少，不讨厌。",
    dialogueInProgress: "有事？……没事也可以来。",
    dialogueComplete: "你算是……朋友了。"
  },

  personal_xiaohou_friendship: {
    id: "personal_xiaohou_friendship",
    name: "张小侯的友谊",
    description: "你和张小侯成了好朋友。他热情开朗，总是愿意和你一起冒险。",
    giver: "zhang_xiaohou",
    type: "personal",
    trigger: { minRelationship: { zhang_xiaohou: 30 } },
    objectives: [
      { type: "talk", npcId: "zhang_xiaohou", count: 3, description: "与张小侯对话3次" }
    ],
    rewards: { exp: 200, gold: 100 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "兄弟！我就觉得你人不错！以后我们一起修炼一起冒险吧！",
    dialogueInProgress: "走，一起去修炼场！",
    dialogueComplete: "我们是永远的好兄弟！"
  },

  personal_mofan_rivalry: {
    id: "personal_mofan_rivalry",
    name: "莫凡的竞争",
    description: "你和莫凡都是有天赋的学生。你们之间有一种良性的竞争关系，互相促进。",
    giver: "mo_fan",
    type: "personal",
    trigger: { minRelationship: { mo_fan: 20 }, minLevel: 3 },
    objectives: [
      { type: "cultivate", count: 8, description: "修炼8次" },
      { type: "talk", npcId: "mo_fan", count: 3, description: "与莫凡对话3次" }
    ],
    rewards: { exp: 350, gold: 200 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "嘿，你也挺努力的嘛。不过我不会输给你的！",
    dialogueInProgress: "一起加油吧，别被我甩开太远！",
    dialogueComplete: "不错嘛，你确实有两下子。我们继续竞争！"
  },

  personal_battle_seasoned: {
    id: "personal_battle_seasoned",
    name: "身经百战",
    description: "你经历了不少战斗。猎法师公会注意到了你的实战经验，有更危险的委托给你。",
    giver: "hunter_receptionist",
    type: "personal",
    trigger: { minLevel: 5, chance: 0.3 },
    objectives: [
      { type: "kill", enemyId: "any", count: 10, description: "击败10个妖魔" }
    ],
    rewards: { exp: 400, gold: 300 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你已经有不少实战经验了。这里有个高级点的委托，敢接吗？",
    dialogueInProgress: "小心点，这些妖魔不好对付。",
    dialogueComplete: "干得漂亮！你已经是个合格的猎法师了。"
  },

  // ========== v0.31.0 更多个人任务（新目标类型） ==========

  personal_social_butterfly: {
    id: "personal_social_butterfly",
    name: "社交达人",
    description: "你热衷于与各种人交流。学校里的人都开始认识你了。",
    giver: "system",
    type: "personal",
    trigger: { minLevel: 2, chance: 0.5 },
    objectives: [
      { type: "talk_any", count: 10, description: "与任意NPC对话10次" }
    ],
    rewards: { exp: 250, gold: 150 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "多和人交流总是好的，信息就是力量。",
    dialogueInProgress: "继续和大家聊聊吧。",
    dialogueComplete: "你现在在学校里也算是个名人了！"
  },

  personal_tang_yue_mentorship: {
    id: "personal_tang_yue_mentorship",
    name: "唐月的赏识",
    description: "唐月老师对你越来越欣赏。她似乎愿意给你更多的指导。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "fire", minLevel: 3 },
    objectives: [
      { type: "relationship", npcId: "tang_yue", count: 50, description: "与唐月的好感度达到50" }
    ],
    rewards: { exp: 400, gold: 200 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你是个有天赋的学生。我愿意多指导你一些。",
    dialogueInProgress: "继续努力，我看好你。",
    dialogueComplete: "你已经出师了。以后有什么问题随时来找我。"
  },

  personal_mu_ningxue_respect: {
    id: "personal_mu_ningxue_respect",
    name: "穆宁雪的认可",
    description: "穆宁雪是冰系天才，能得到她的认可是一种荣誉。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { element: "ice", minLevel: 3 },
    objectives: [
      { type: "relationship", npcId: "mu_ningxue", count: 40, description: "与穆宁雪的好感度达到40" },
      { type: "talk", npcId: "mu_ningxue", count: 5, description: "与穆宁雪对话5次" }
    ],
    rewards: { exp: 450, gold: 250 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "……你和别人不一样。",
    dialogueInProgress: "有事？……没事也可以来。",
    dialogueComplete: "你算是……得到我的认可了。"
  },

  personal_explorer_master: {
    id: "personal_explorer_master",
    name: "探索大师",
    description: "你对未知充满好奇，足迹遍布博城各地。",
    giver: "system",
    type: "personal",
    trigger: { minExploreCount: 15 },
    objectives: [
      { type: "explore", count: 20, description: "进行20次探索行动" }
    ],
    rewards: { exp: 350, gold: 200 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "世界很大，多去看看吧。",
    dialogueInProgress: "还有很多地方等着你去发现。",
    dialogueComplete: "你已经是个真正的探索者了！"
  },

  personal_cultivation_mania: {
    id: "personal_cultivation_mania",
    name: "修炼狂人",
    description: "你在修炼上投入了远超常人的时间。你的努力不会白费。",
    giver: "xiao_yuanzhang",
    type: "personal",
    trigger: { minCultivateCount: 20 },
    objectives: [
      { type: "cultivate", count: 20, description: "再修炼20次" }
    ],
    rewards: { exp: 500, gold: 300 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "勤奋是最可贵的品质。继续吧。",
    dialogueInProgress: "你的努力大家都看在眼里。",
    dialogueComplete: "你的实力已经有了质的飞跃！"
  },

  personal_school_legend: {
    id: "personal_school_legend",
    name: "校园传奇",
    description: "你在天澜魔法高中的名声越来越大，成为了校园里的传奇人物。",
    giver: "system",
    type: "personal",
    trigger: { minLevel: 8 },
    objectives: [
      { type: "level", count: 10, description: "达到Lv.10" },
      { type: "talk_any", count: 15, description: "与任意NPC对话15次" }
    ],
    rewards: { exp: 600, gold: 400 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你的名字开始在学校里流传。",
    dialogueInProgress: "继续保持，你会成为传奇的。",
    dialogueComplete: "你已经是天澜魔法高中的传奇了！"
  },

  personal_zhang_xiaohou_brother: {
    id: "personal_zhang_xiaohou_brother",
    name: "张小侯的兄弟",
    description: "你和张小侯的关系已经超越了普通朋友，成为了真正的兄弟。",
    giver: "zhang_xiaohou",
    type: "personal",
    trigger: { minRelationship: { zhang_xiaohou: 50 } },
    objectives: [
      { type: "relationship", npcId: "zhang_xiaohou", count: 70, description: "与张小侯的好感度达到70" },
      { type: "talk", npcId: "zhang_xiaohou", count: 8, description: "与张小侯对话8次" }
    ],
    rewards: { exp: 350, gold: 200 },
    prerequisites: ["personal_xiaohou_friendship"],
    isMainQuest: false,
    dialogueStart: "兄弟！我们的关系越来越铁了！",
    dialogueInProgress: "走，一起去冒险！",
    dialogueComplete: "我们是一辈子的好兄弟！"
  },

  personal_all_rounder: {
    id: "personal_all_rounder",
    name: "全能法师",
    description: "你不仅修炼刻苦，还乐于探索和交流。全面发展才是真正的强者。",
    giver: "xiao_yuanzhang",
    type: "personal",
    trigger: { minLevel: 5, chance: 0.4 },
    objectives: [
      { type: "cultivate", count: 10, description: "修炼10次" },
      { type: "explore", count: 10, description: "探索10次" },
      { type: "talk_any", count: 8, description: "与任意NPC对话8次" }
    ],
    rewards: { exp: 500, gold: 350 },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "真正的强者不仅要实力强，还要见识广、朋友多。",
    dialogueInProgress: "全面发展，不要偏科。",
    dialogueComplete: "你已经是一个真正的全能法师了！"
  },

  // ========== v0.57.0 玩家个人任务线：火系初阶 ==========

  quest_fire_control: {
    id: "quest_fire_control",
    name: "火焰的控制",
    description: "唐月注意到你在修炼火系时控制力不足，建议你多加练习。火焰的力量很强，但如果控制不好，会伤到身边的人。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "fire", minLevel: 5 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次" }
    ],
    rewards: { exp: 100, gold: 50 },
    prerequisites: [],
    nextQuest: "quest_fire_duel",
    isMainQuest: false,
    dialogueStart: "你好，新来的同学。我注意到你觉醒了火系。火焰的力量很强，但控制不当会伤到别人。先去修炼场多练习几次吧。",
    dialogueInProgress: "怎么样，感受到火焰在你指尖流转了吗？控制星子的节奏很重要。",
    dialogueComplete: "很好，你的控制力提升了不少。继续努力！"
  },

  quest_fire_duel: {
    id: "quest_fire_duel",
    name: "火系的较量",
    description: "周敏注意到你的火系进步，主动找你切磋。听说你火系练得不错，要不要比比看？",
    giver: "zhou_min",
    type: "personal",
    trigger: { element: "fire", minLevel: 8 },
    objectives: [
      { type: "talk", npcId: "zhou_min", count: 1, description: "与周敏对话" }
    ],
    rewards: { exp: 150, gold: 100 },
    prerequisites: ["quest_fire_control"],
    nextQuest: "quest_fire_insight",
    isMainQuest: false,
    dialogueStart: "喂，你就是那个火系进步很快的新生？我是周敏，火系尖子生。要不要切磋一下，看看谁的火系更强？",
    dialogueInProgress: "怎么，不敢吗？还是说你还没准备好？",
    dialogueComplete: "哼，算你有点本事。不过我不会认输的，下次一定超过你！"
  },

  quest_fire_insight: {
    id: "quest_fire_insight",
    name: "火焰的感悟",
    description: "唐月建议你在图书馆查阅火系典籍，结合修炼感悟火焰的真谛。真正的火系法师，不只是力量强大，更要理解火焰的本质。",
    giver: "tang_yue",
    type: "personal",
    trigger: { element: "fire", minLevel: 12 },
    objectives: [
      { type: "explore", count: 3, description: "在图书馆学习3次" },
      { type: "cultivate", count: 10, description: "修炼10次" }
    ],
    rewards: { exp: 300, gold: 200, skillPoints: 1 },
    prerequisites: ["quest_fire_duel"],
    isMainQuest: false,
    dialogueStart: "你的火系已经有了一定基础。但真正的火系法师，需要理解火焰的本质。去图书馆查查典籍，再结合修炼感悟吧。",
    dialogueInProgress: "典籍中的知识需要结合实践才能真正理解。继续修炼，感受火焰的律动。",
    dialogueComplete: "你做到了！你对火焰的理解已经超越了初阶水平。这是给你的奖励——一个技能点，好好利用。"
  },

  // ========== v0.58.0 玩家个人任务线：冰系初阶 ==========

  quest_ice_control: {
    id: "quest_ice_control",
    name: "寒冰的掌控",
    description: "穆宁雪注意到你在修炼冰系时心绪浮躁，建议你多冥修静心。冰系的力量来自冷静，心不静，冰不纯。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { element: "ice", minLevel: 5 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次" }
    ],
    rewards: { exp: 100, gold: 50 },
    prerequisites: [],
    nextQuest: "quest_ice_duel",
    isMainQuest: false,
    dialogueStart: "你好。我注意到你觉醒了冰系。冰系的力量来自冷静，心不静，冰不纯。先去冥修，让自己的心沉静下来。",
    dialogueInProgress: "怎么样，感受到寒冰在你体内流转了吗？控制呼吸，让星子缓慢运转。",
    dialogueComplete: "很好，你的心性沉稳了不少。冰系的掌控力提升了。继续努力。"
  },

  quest_ice_duel: {
    id: "quest_ice_duel",
    name: "冰系的切磋",
    description: "穆宁雪注意到你的冰系进步，主动找你切磋。你的冰系...有点意思。要不要比比看，谁的冰更纯？",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { element: "ice", minLevel: 8 },
    objectives: [
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "与穆宁雪对话" }
    ],
    rewards: { exp: 150, gold: 100 },
    prerequisites: ["quest_ice_control"],
    nextQuest: "quest_ice_insight",
    isMainQuest: false,
    dialogueStart: "你的冰系...有点意思。要不要切磋一下，看看谁的冰更纯？",
    dialogueInProgress: "怎么，不敢吗？还是说你还没准备好？",
    dialogueComplete: "哼，你的冰确实有几分纯度。不过跟我比，还差得远。下次我不会手下留情。"
  },

  quest_ice_insight: {
    id: "quest_ice_insight",
    name: "寒冰的感悟",
    description: "穆宁雪建议你在图书馆查阅冰系典籍，结合冥修感悟寒冰的真谛。冰的极致不是寒冷，是绝对的宁静。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { element: "ice", minLevel: 12 },
    objectives: [
      { type: "explore", count: 3, description: "在图书馆学习3次" },
      { type: "cultivate", count: 10, description: "修炼10次" }
    ],
    rewards: { exp: 300, gold: 200, skillPoints: 1 },
    prerequisites: ["quest_ice_duel"],
    isMainQuest: false,
    dialogueStart: "你的冰系已经有了一定基础。但冰的极致不是寒冷，是绝对的宁静。去图书馆查查典籍，再结合冥修感悟吧。",
    dialogueInProgress: "典籍中的知识需要结合实践才能真正理解。继续冥修，感受寒冰的律动。",
    dialogueComplete: "你做到了！你对寒冰的理解已经超越了初阶水平。这是给你的奖励——一个技能点，好好利用。"
  },

  // ========== v0.59.0 玩家个人任务线：风系初阶 ==========

  quest_wind_speed: {
    id: "quest_wind_speed",
    name: "风的速度",
    description: "张小侯注意到你在修炼风系时节奏太慢，建议你多加练习。风系的核心是速度，星子运转要快，快到别人跟不上。",
    giver: "zhang_xiaohou",
    type: "personal",
    trigger: { element: "wind", minLevel: 5 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次" }
    ],
    rewards: { exp: 100, gold: 50 },
    prerequisites: [],
    nextQuest: "quest_wind_race",
    isMainQuest: false,
    dialogueStart: "嘿，你也是风系的？我注意到你修炼时节奏太慢了。风系的核心是速度，星子运转要快，快到别人跟不上。先去修炼场多练几次吧。",
    dialogueInProgress: "怎么样，感受到风在你指尖流转了吗？控制星子的节奏，越快越好。",
    dialogueComplete: "不错，你的速度提升了不少。风系就是要快，继续努力！"
  },

  quest_wind_race: {
    id: "quest_wind_race",
    name: "风系的竞速",
    description: "张小侯注意到你的风系进步，主动找你竞速。你的风系...有点意思。要不要比比看，谁的风更快？",
    giver: "zhang_xiaohou",
    type: "personal",
    trigger: { element: "wind", minLevel: 8 },
    objectives: [
      { type: "talk", npcId: "zhang_xiaohou", count: 1, description: "与张小侯对话" }
    ],
    rewards: { exp: 150, gold: 100 },
    prerequisites: ["quest_wind_speed"],
    nextQuest: "quest_wind_insight",
    isMainQuest: false,
    dialogueStart: "你的风系...有点意思。要不要竞速一下，看看谁的风更快？",
    dialogueInProgress: "怎么，不敢吗？还是说你还没准备好？",
    dialogueComplete: "哈哈，你的风确实挺快的！不过跟我比，还差一点。下次我不会让着你。"
  },

  quest_wind_insight: {
    id: "quest_wind_insight",
    name: "风的感悟",
    description: "张小侯建议你在图书馆查阅风系典籍，结合修炼感悟风的真谛。风的极致不是快，是无处不在的感知。",
    giver: "zhang_xiaohou",
    type: "personal",
    trigger: { element: "wind", minLevel: 12 },
    objectives: [
      { type: "explore", count: 3, description: "在图书馆学习3次" },
      { type: "cultivate", count: 10, description: "修炼10次" }
    ],
    rewards: { exp: 300, gold: 200, skillPoints: 1 },
    prerequisites: ["quest_wind_race"],
    isMainQuest: false,
    dialogueStart: "你的风系已经有了一定基础。但风的极致不是快，是无处不在的感知。去图书馆查查典籍，再结合修炼感悟吧。",
    dialogueInProgress: "典籍中的知识需要结合实践才能真正理解。继续修炼，感受风的律动。",
    dialogueComplete: "你做到了！你对风的理解已经超越了初阶水平。这是给你的奖励——一个技能点，好好利用。"
  },

  // ========== v0.60.0 玩家个人任务线：光系初阶 ==========

  quest_light_purify: {
    id: "quest_light_purify",
    name: "光明的净化",
    description: "白阳注意到你在修炼光系时心有杂念，建议你多加练习。光系的力量来自纯净，心不净，光不纯。",
    giver: "bai_yang",
    type: "personal",
    trigger: { element: "light", minLevel: 5 },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次" }
    ],
    rewards: { exp: 100, gold: 50 },
    prerequisites: [],
    nextQuest: "quest_light_duel",
    isMainQuest: false,
    dialogueStart: "你好。我注意到你觉醒了光系。光系的力量来自纯净，心不净，光不纯。先去修炼场，净化你的心灵。",
    dialogueInProgress: "怎么样，感受到光明在你体内流转了吗？排除杂念，让星子纯净运转。",
    dialogueComplete: "很好，你的心性纯净了不少。光系的掌控力提升了。继续努力。"
  },

  quest_light_duel: {
    id: "quest_light_duel",
    name: "光系的较量",
    description: "白阳注意到你的光系进步，主动找你切磋。你的光系...有点意思。要不要比比看，谁的光更纯？",
    giver: "bai_yang",
    type: "personal",
    trigger: { element: "light", minLevel: 8 },
    objectives: [
      { type: "talk", npcId: "bai_yang", count: 1, description: "与白阳对话" }
    ],
    rewards: { exp: 150, gold: 100 },
    prerequisites: ["quest_light_purify"],
    nextQuest: "quest_light_insight",
    isMainQuest: false,
    dialogueStart: "你的光系...有点意思。要不要切磋一下，看看谁的光更纯？",
    dialogueInProgress: "怎么，不敢吗？还是说你还没准备好？",
    dialogueComplete: "哼，你的光确实有几分纯度。不过跟我比，还差得远。下次我不会手下留情。"
  },

  quest_light_insight: {
    id: "quest_light_insight",
    name: "光明的感悟",
    description: "白阳建议你在图书馆查阅光系典籍，结合修炼感悟光明的真谛。光的极致不是明亮，是驱散黑暗的勇气。",
    giver: "bai_yang",
    type: "personal",
    trigger: { element: "light", minLevel: 12 },
    objectives: [
      { type: "explore", count: 3, description: "在图书馆学习3次" },
      { type: "cultivate", count: 10, description: "修炼10次" }
    ],
    rewards: { exp: 300, gold: 200, skillPoints: 1 },
    prerequisites: ["quest_light_duel"],
    isMainQuest: false,
    dialogueStart: "你的光系已经有了一定基础。但光的极致不是明亮，是驱散黑暗的勇气。去图书馆查查典籍，再结合修炼感悟吧。",
    dialogueInProgress: "典籍中的知识需要结合实践才能真正理解。继续修炼，感受光明的律动。",
    dialogueComplete: "你做到了！你对光明的理解已经超越了初阶水平。这是给你的奖励——一个技能点，好好利用。"
  },

  // ========== v0.61.0 关系驱动任务系统：唐月线 ==========

  quest_tang_yue_tutoring: {
    id: "quest_tang_yue_tutoring",
    name: "课后辅导",
    description: "唐月邀请你参加课后辅导。放学后到办公室找她，她会给你单独指导。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "tang_yue_invite_accepted" },
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 3, description: "与唐月老师对话3次" }
    ],
    rewards: { exp: 200, gold: 100, skillPoints: 1, setFlag: "tang_yue_invitation_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你来了。坐吧，今天我们从星子运转的基础开始。",
    dialogueInProgress: "上次讲的内容理解了吗？有什么不懂的尽管问。",
    dialogueComplete: "很好，你学得很快。这是给你的奖励——一个技能点，好好利用。"
  },

  quest_tang_yue_group_tutoring: {
    id: "quest_tang_yue_group_tutoring",
    name: "集体辅导",
    description: "唐月同意你带朋友一起参加辅导。叫上你的同学，一起学习吧。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "tang_yue_invite_friend" },
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月老师对话" },
      { type: "talk_any", count: 2, description: "与任意同学对话2次" }
    ],
    rewards: { exp: 150, gold: 80, setFlag: "tang_yue_invitation_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你和朋友都来了？很好，人多讨论也更热烈。",
    dialogueInProgress: "大家有什么问题都可以提出来，一起讨论。",
    dialogueComplete: "今天的辅导就到这里。你们都很有潜力，继续努力。"
  },

  quest_tang_yue_exam: {
    id: "quest_tang_yue_exam",
    name: "实践考核",
    description: "唐月推荐你参加魔法实践考核。你需要在实战中证明自己的实力。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "tang_yue_exam_accepted" },
    objectives: [
      { type: "kill", enemyId: "any", count: 3, description: "在实战中击败3个妖魔" }
    ],
    rewards: { exp: 500, gold: 300, skillPoints: 1, setFlag: "tang_yue_exam_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "考核开始了。去实战中证明你的实力吧。",
    dialogueInProgress: "已经击败几个了？继续保持状态。",
    dialogueComplete: "出色！你通过了实践考核。唐月对你的表现很满意。获得技能点1。"
  },

  quest_tang_yue_exam_easy: {
    id: "quest_tang_yue_exam_easy",
    name: "简化考核",
    description: "唐月为你安排了简化版的实践考核。虽然难度降低，但也要认真对待。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "tang_yue_exam_easy" },
    objectives: [
      { type: "kill", enemyId: "any", count: 1, description: "在实战中击败1个妖魔" }
    ],
    rewards: { exp: 200, gold: 100, setFlag: "tang_yue_exam_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "这是简化版的考核。去试试吧。",
    dialogueInProgress: "感觉怎么样？难度还合适吗？",
    dialogueComplete: "通过了。虽然是简化版，但也是你的实力证明。"
  },

  quest_tang_yue_exam_team: {
    id: "quest_tang_yue_exam_team",
    name: "组队考核",
    description: "唐月同意你组队参加考核。找个同学一起，团队合作也是重要的能力。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "tang_yue_exam_team" },
    objectives: [
      { type: "kill", enemyId: "any", count: 2, description: "组队击败2个妖魔" },
      { type: "talk_any", count: 1, description: "与队友讨论战术" }
    ],
    rewards: { exp: 350, gold: 200, setFlag: "tang_yue_exam_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "组队考核开始。和你的队友好好配合。",
    dialogueInProgress: "团队合作得怎么样？有问题及时沟通。",
    dialogueComplete: "不错！你们的配合很默契。团队合作也是重要的能力。"
  },

  // ========== v0.62.0 关系驱动任务系统：穆宁雪线 ==========

  quest_mu_ningxue_duel: {
    id: "quest_mu_ningxue_duel",
    name: "冰系切磋",
    description: "穆宁雪邀请你切磋冰系。放学后到训练馆，证明你的实力。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: ["mu_ningxue_invite_accepted", "mu_ningxue_invite_question"] },
    objectives: [
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "与穆宁雪对话" },
      { type: "kill", enemyId: "any", count: 1, description: "击败1个妖魔证明实力" }
    ],
    rewards: { exp: 200, gold: 100, skillPoints: 1, setFlag: "mu_ningxue_invite_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你来了。先热身，然后我们切磋一下。",
    dialogueInProgress: "你的冰系确实有潜力。继续保持。",
    dialogueComplete: "不错。你的实力得到了我的认可。这是给你的奖励——技能点1。"
  },

  quest_mu_ningxue_family: {
    id: "quest_mu_ningxue_family",
    name: "家族的召唤",
    description: "穆宁雪决定承担家族责任。帮她了解穆家的情况，做好离开的准备。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: "mu_ningxue_family_duty" },
    objectives: [
      { type: "talk", npcId: "mu_bai", count: 1, description: "与穆白对话了解穆家情况" },
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "与穆宁雪对话" }
    ],
    rewards: { exp: 300, gold: 150, setFlag: "mu_ningxue_family_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "穆家的事...你帮我问问穆白吧，他知道得更多。",
    dialogueInProgress: "穆白怎么说？家族的情况比我想的复杂吗？",
    dialogueComplete: "谢谢你。我会承担起我的责任。"
  },

  quest_mu_ningxue_path: {
    id: "quest_mu_ningxue_path",
    name: "冰系的执着",
    description: "穆宁雪决定追求自己的冰系之路。陪她一起修炼，见证她的成长。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: "mu_ningxue_own_path" },
    objectives: [
      { type: "cultivate", count: 5, description: "修炼5次" },
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "与穆宁雪对话" }
    ],
    rewards: { exp: 300, gold: 100, skillPoints: 1, setFlag: "mu_ningxue_family_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "我的路，我自己走。陪我一起修炼吧。",
    dialogueInProgress: "你的冥修很认真。冰系需要这种专注。",
    dialogueComplete: "很好。我们都在进步。技能点1，给你。"
  },

  quest_mu_ningxue_choice: {
    id: "quest_mu_ningxue_choice",
    name: "内心的抉择",
    description: "穆宁雪需要时间思考自己真正想要什么。帮她查阅资料，理清思路。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: "mu_ningxue_self_choice" },
    objectives: [
      { type: "explore", count: 3, description: "在图书馆学习3次" },
      { type: "talk", npcId: "mu_ningxue", count: 2, description: "与穆宁雪对话2次" }
    ],
    rewards: { exp: 400, gold: 200, setFlag: "mu_ningxue_family_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你说得对，我需要想清楚自己想要什么。帮我查查资料吧。",
    dialogueInProgress: "这些资料...让我对冰系有了新的理解。",
    dialogueComplete: "我想清楚了。谢谢你，帮我找到了方向。学校声望+10。"
  },

  quest_mu_ningxue_extreme: {
    id: "quest_mu_ningxue_extreme",
    name: "冰极之路",
    description: "你和穆宁雪一起追求冰系的极致。这是一条艰难的路，但你们同行。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: "mu_ningxue_ice_extreme" },
    objectives: [
      { type: "cultivate", count: 10, description: "修炼10次" },
      { type: "explore", count: 5, description: "在图书馆学习5次" },
      { type: "talk", npcId: "mu_ningxue", count: 3, description: "与穆宁雪对话3次" }
    ],
    rewards: { exp: 800, gold: 300, skillPoints: 2, setFlag: "mu_ningxue_extreme_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "冰极之路，我们一起走。先从冥修开始。",
    dialogueInProgress: "你感受到了吗？寒冰的律动...越来越纯净了。",
    dialogueComplete: "我们做到了！冰系的极致...我们触碰到了。获得称号：冰极同行者。技能点2。"
  },

  quest_mu_ningxue_separate: {
    id: "quest_mu_ningxue_separate",
    name: "各自的道路",
    description: "你和穆宁雪各自追求自己的道路，但彼此支持。偶尔交流，共同进步。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: "mu_ningxue_support" },
    objectives: [
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "与穆宁雪对话" },
      { type: "cultivate", count: 5, description: "修炼5次" }
    ],
    rewards: { exp: 400, gold: 150, setFlag: "mu_ningxue_extreme_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "各自的路，但我们可以互相支持。",
    dialogueInProgress: "你的修炼很有成效。继续保持。",
    dialogueComplete: "虽然道路不同，但我们都在进步。谢谢你的支持。"
  },

  quest_mu_ningxue_debate: {
    id: "quest_mu_ningxue_debate",
    name: "理念的碰撞",
    description: "你和穆宁雪对冰系的理解不同。通过辩论和学习，你们都有所收获。",
    giver: "mu_ningxue",
    type: "personal",
    trigger: { requireFlag: "mu_ningxue_doubt" },
    objectives: [
      { type: "talk", npcId: "mu_ningxue", count: 3, description: "与穆宁雪辩论3次" },
      { type: "explore", count: 3, description: "在图书馆学习3次" }
    ],
    rewards: { exp: 500, gold: 200, setFlag: "mu_ningxue_extreme_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "你说冰系的极致不是宁静？那你说说看，是什么？",
    dialogueInProgress: "你的观点...虽然我不认同，但确实让我思考了很多。",
    dialogueComplete: "不打不相识。你的理念虽然和我不同，但也有道理。学校声望+15。"
  },

  // ========== v0.63.0 NPC间关系联动：穆白×张小侯 ==========

  quest_mx_zxh_team: {
    id: "quest_mx_zxh_team",
    name: "团队训练",
    description: "穆白和张小侯决定一起训练。作为调解者，你参与他们的团队训练，见证两人从矛盾到合作。",
    giver: "mu_bai",
    type: "personal",
    trigger: { requireFlag: "mx_zxh_friends" },
    objectives: [
      { type: "talk", npcId: "mu_bai", count: 1, description: "与穆白对话" },
      { type: "talk", npcId: "zhang_xiaohou", count: 1, description: "与张小侯对话" },
      { type: "cultivate", count: 3, description: "一起修炼3次" }
    ],
    rewards: { exp: 300, gold: 150, setFlag: "mx_zxh_team_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "既然要一起训练，那就制定个计划吧。",
    dialogueInProgress: "你们的配合越来越默契了。",
    dialogueComplete: "团队训练圆满结束！穆白和张小侯成为了真正的朋友。学校声望+10。"
  },

  quest_mx_zxh_rivalry: {
    id: "quest_mx_zxh_rivalry",
    name: "良性竞争",
    description: "穆白和张小侯决定通过竞争互相促进。作为见证者，你参与他们的较量，两人在竞争中共同进步。",
    giver: "mu_bai",
    type: "personal",
    trigger: { requireFlag: "mx_zxh_rivals" },
    objectives: [
      { type: "kill", enemyId: "any", count: 2, description: "击败2个妖魔证明实力" },
      { type: "talk", npcId: "mu_bai", count: 1, description: "与穆白对话" },
      { type: "talk", npcId: "zhang_xiaohou", count: 1, description: "与张小侯对话" }
    ],
    rewards: { exp: 400, gold: 200, skillPoints: 1, setFlag: "mx_zxh_rivalry_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "竞争开始！谁先击败妖魔谁赢。",
    dialogueInProgress: "两人势均力敌，竞争激烈。",
    dialogueComplete: "良性竞争结束！两人都有所收获。技能点1。"
  },

  // ========== v0.64.0 NPC间关系联动：唐月×穆宁雪（师生） ==========

  quest_ty_mnx_practice: {
    id: "quest_ty_mnx_practice",
    name: "师生的实践课",
    description: "唐月安排你和穆宁雪一起上实践课，学习配合技巧。这是一次难得的学习机会。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "ty_mnx_practice" },
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月对话" },
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "与穆宁雪对话" },
      { type: "cultivate", count: 2, description: "一起修炼2次" }
    ],
    rewards: { exp: 200, gold: 100, setFlag: "ty_mnx_quest_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "既然要一起实践，那就先了解彼此的战斗风格。",
    dialogueInProgress: "你们的配合越来越默契了。",
    dialogueComplete: "实践课圆满结束！你和穆宁雪的配合有了明显进步。"
  },

  quest_ty_mnx_team: {
    id: "quest_ty_mnx_team",
    name: "冰与火的配合",
    description: "你和穆宁雪配合击败妖魔，证明了配合的价值。唐月对你们的表现很满意。",
    giver: "tang_yue",
    type: "personal",
    trigger: { requireFlag: "ty_mnx_learned" },
    objectives: [
      { type: "kill", enemyId: "any", count: 2, description: "配合击败2个妖魔" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月汇报" }
    ],
    rewards: { exp: 300, skillPoints: 1, setFlag: "ty_mnx_team_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "去实战中验证你们的配合吧。",
    dialogueInProgress: "冰与火的配合，效果出乎意料地好。",
    dialogueComplete: "配合击败妖魔！唐月赞许地点头。技能点1。"
  },

  // ========== v0.65.0 NPC间关系联动：赵满延×穆白（富家子弟的较量） ==========

  quest_zmy_mb_challenge: {
    id: "quest_zmy_mb_challenge",
    name: "富家子弟的较量",
    description: "赵满延和穆白约定比试，你需要帮他们准备。这是一场富家子弟之间的实力较量。",
    giver: "zhao_manyan",
    type: "personal",
    trigger: { requireFlag: "zmy_mb_challenge" },
    objectives: [
      { type: "talk", npcId: "zhao_manyan", count: 1, description: "与赵满延对话" },
      { type: "talk", npcId: "mu_bai", count: 1, description: "与穆白对话" },
      { type: "cultivate", count: 2, description: "修炼2次准备" }
    ],
    rewards: { exp: 200, gold: 100, setFlag: "zmy_mb_quest_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "既然要比试，那就先各自准备吧。",
    dialogueInProgress: "两人都在摩拳擦掌，准备充分。",
    dialogueComplete: "准备完成！比试即将开始。"
  },

  quest_zmy_mb_witness: {
    id: "quest_zmy_mb_witness",
    name: "实力的见证",
    description: "比试结束后，两人决定联手实战，你作为见证者参与。光系防御和冰系攻击的配合，效果如何？",
    giver: "zhao_manyan",
    type: "personal",
    trigger: { requireFlag: "zmy_mb_referee" },
    objectives: [
      { type: "kill", enemyId: "any", count: 1, description: "联手击败1个妖魔" },
      { type: "talk", npcId: "zhao_manyan", count: 1, description: "与赵满延对话" },
      { type: "talk", npcId: "mu_bai", count: 1, description: "与穆白对话" }
    ],
    rewards: { exp: 300, skillPoints: 1, setFlag: "zmy_mb_witness_done" },
    prerequisites: [],
    isMainQuest: false,
    dialogueStart: "去实战中验证我们的配合吧。",
    dialogueInProgress: "光系防御加冰系攻击，配合默契。",
    dialogueComplete: "联手击败妖魔！两人都对你的公正表示感谢。技能点1。"
  },

  // ========== v0.98.0 对话触发任务：徐大荒委托 ==========

  quest_xu_dahuang_investigation: {
    id: "quest_xu_dahuang_investigation",
    name: "城外异动调查",
    description: "徐大荒队长注意到城外妖魔活动异常，委托你去雪峰山一带调查情况。",
    giver: "xu_dahuang",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山调查" },
      { type: "kill", count: 2, description: "击败2只妖魔了解情况" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "investigated_outside" }
  },

  quest_guo_caitang_mu_clues: {
    id: "quest_guo_caitang_mu_clues",
    name: "穆氏暗流",
    description: "郭彩棠透露穆氏在博城有秘密布局，委托你留意相关线索。",
    giver: "guo_caitang",
    type: "investigation",
    objectives: [
      { type: "talk", npcId: "mu_bai", count: 1, description: "与穆白对话了解情况" },
      { type: "talk", npcId: "yu_ang", count: 1, description: "与宇昂对话打探消息" },
      { type: "reach", locationId: "bo_city_street", count: 1, description: "在博城市街观察" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "mu_clues_found" }
  },

  quest_xiao_ke_practice: {
    id: "quest_xiao_ke_practice",
    name: "防御练习",
    description: "小可希望你陪她练习实战，提升水系防御的应变能力。",
    giver: "xiao_ke",
    type: "practice",
    objectives: [
      { type: "kill", count: 3, description: "陪小可击败3只妖魔练习" },
      { type: "talk", npcId: "xiao_ke", count: 1, description: "练习后与小可交流心得" }
    ],
    rewards: { exp: 180, gold: 120, setFlag: "practiced_defense" }
  },

  quest_zhankong_discipline: {
    id: "quest_zhankong_discipline",
    name: "军纪考验",
    description: "斩空认为你需要证明自己的纪律性，委托你完成一次巡逻任务。",
    giver: "zhan_kong",
    type: "mission",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山巡逻" },
      { type: "kill", count: 2, description: "清除巡逻区域的2只妖魔" },
      { type: "talk", npcId: "zhan_kong", count: 1, description: "巡逻结束向斩空汇报" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "discipline_proven" }
  },

  quest_yu_ang_proof: {
    id: "quest_yu_ang_proof",
    name: "实力证明",
    description: "宇昂看不起你，认为你需要证明自己的实力。用行动让他闭嘴。",
    giver: "yu_ang",
    type: "challenge",
    objectives: [
      { type: "kill", count: 3, description: "独立击败3只妖魔" },
      { type: "cultivate", count: 2, description: "修炼2次提升实力" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "proven_to_yu_ang" }
  },

  quest_tangyue_mountain_investigation: {
    id: "quest_tangyue_mountain_investigation",
    name: "雪峰山异动调查",
    description: "唐月老师注意到雪峰山妖魔异常活跃，学校正在调查。你主动提出帮忙。",
    giver: "tang_yue",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山调查" },
      { type: "kill", count: 3, description: "击败3只妖魔了解异常原因" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师汇报调查结果" }
    ],
    rewards: { exp: 250, gold: 200, setFlag: "tangyue_investigation_done" }
  },

  // v1.8.1: 阴谋调查系统任务
  quest_investigate_city_anomaly: {
    id: "quest_investigate_city_anomaly",
    name: "城市异常调查",
    description: "唐月老师提到城市边缘的妖魔行为异常，委托你去调查具体情况。",
    giver: "tang_yue",
    type: "investigation",
    prerequisites: ["quest_tangyue_mountain_investigation"],
    objectives: [
      { type: "explore", count: 3, description: "探索城市边缘3次寻找异常迹象" },
      { type: "kill", count: 5, description: "击败5只妖魔了解它们的异常状态" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师汇报调查结果" }
    ],
    rewards: { exp: 300, gold: 250, discoverClue: ["clue_demon_agitation", "clue_demon_gathering"], setFlag: "city_anomaly_investigated" }
  },

  quest_trace_black_church: {
    id: "quest_trace_black_church",
    name: "追踪黑教廷踪迹",
    description: "根据唐月老师提供的线索，去追查黑教廷在博城的秘密据点。",
    giver: "tang_yue",
    type: "investigation",
    prerequisites: [{ flag: "investigation_started" }],
    objectives: [
      { type: "explore", count: 2, description: "在老街区探索寻找黑教廷踪迹" },
      { type: "investigate", locationId: "old_town", count: 1, description: "调查老街区的可疑仪式痕迹" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师汇报发现" }
    ],
    rewards: { exp: 350, gold: 300, discoverClue: ["clue_black_church_ritual", "clue_black_church_underground"], setFlag: "black_church_traced" }
  },

  quest_earth_spring_guard: {
    id: "quest_earth_spring_guard",
    name: "地圣泉守卫异动",
    description: "你注意到地圣泉的守卫似乎有调动，决定去调查背后的原因。",
    giver: "tang_yue",
    type: "investigation",
    prerequisites: [{ flag: "investigation_started" }],
    objectives: [
      { type: "reach", locationId: "earth_spring", count: 1, description: "前往地圣泉附近观察" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师询问守卫调动的事" },
      { type: "explore", count: 2, description: "在地圣泉周围探索寻找线索" }
    ],
    rewards: { exp: 280, gold: 200, discoverClue: ["clue_spring_value", "clue_spring_target"], setFlag: "earth_spring_guard_investigated" }
  },

  quest_investigate_yu_ang: {
    id: "quest_investigate_yu_ang",
    name: "暗中调查宇昂",
    description: "唐月委托你暗中观察宇昂的行踪，确认他是否与黑教廷有关联。注意安全，只观察不行动。",
    giver: "tang_yue",
    type: "investigation",
    prerequisites: [{ flag: "help_investigate_yu_ang" }],
    objectives: [
      { type: "reach", locationId: "mu_manor", count: 1, description: "前往穆家庄园附近观察" },
      { type: "explore", count: 3, description: "在穆家庄园附近探索3次寻找线索" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师汇报观察结果" }
    ],
    rewards: { exp: 400, gold: 350, discoverClue: ["clue_yuang_origin", "clue_black_church_potion"], setFlag: "yu_ang_investigated" }
  },

  quest_muningxue_ice_training: {
    id: "quest_muningxue_ice_training",
    name: "冰系特训",
    description: "穆宁雪罕见地同意指点你的修炼，给你布置了特训任务。",
    giver: "mu_ningxue",
    type: "training",
    objectives: [
      { type: "cultivate", count: 3, description: "修炼3次体会冰系精髓" },
      { type: "kill", count: 2, description: "击败2只妖魔实战验证" },
      { type: "talk", npcId: "mu_ningxue", count: 1, description: "向穆宁雪汇报修炼成果" }
    ],
    rewards: { exp: 250, gold: 200, setFlag: "ningxue_training_done" }
  },

  quest_yexinxia_herbs: {
    id: "quest_yexinxia_herbs",
    name: "心夏的请求",
    description: "叶心夏希望研究药剂帮哥哥减轻负担，委托你帮忙采集一些草药材料。",
    giver: "ye_xinxia",
    type: "collection",
    objectives: [
      { type: "explore", count: 1, description: "去野外采集草药" },
      { type: "kill", count: 1, description: "击败1只妖魔获取材料" },
      { type: "talk", npcId: "ye_xinxia", count: 1, description: "把材料交给心夏" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "helped_xinxia" }
  },

  quest_feishi_training: {
    id: "quest_feishi_training",
    name: "力量训练",
    description: "肥石觉得你需要增强体魄，邀请你一起进行实战训练。",
    giver: "fei_shi",
    type: "training",
    objectives: [
      { type: "kill", count: 2, description: "击败2只妖魔训练体魄" },
      { type: "cultivate", count: 1, description: "修炼1次巩固成果" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "trained_with_feishi" }
  },

  quest_liwenjie_scout: {
    id: "quest_liwenjie_scout",
    name: "侦察任务",
    description: "黎文杰负责猎妖队侦察，邀请你协助调查城外的妖魔动向。",
    giver: "li_wenjie",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山侦察" },
      { type: "kill", count: 1, description: "击败1只妖魔获取情报" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "scouted_with_wenjie" }
  },

  quest_muhe_black_church: {
    id: "quest_muhe_black_church",
    name: "黑教廷线索",
    description: "你怀疑穆贺与黑教廷有勾结，决定暗中调查真相。",
    giver: "mu_he",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "bo_city_street", count: 1, description: "在博城市街暗中调查" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月老师汇报可疑线索" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "investigated_black_church" }
  },

  quest_zhoumin_contest: {
    id: "quest_zhoumin_contest",
    name: "火系修炼比拼",
    description: "周敏看不起你的修炼态度，你决定用实际行动证明自己。",
    giver: "zhou_min",
    type: "challenge",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次提升火系" },
      { type: "kill", count: 1, description: "击败1只妖魔证明实力" },
      { type: "talk", npcId: "zhou_min", count: 1, description: "向周敏展示成果" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "proved_to_zhoumin" }
  },

  quest_wangsanpang_expedition: {
    id: "quest_wangsanpang_expedition",
    name: "雪峰山历练",
    description: "王三胖胆小但想跟着你一起去雪峰山历练，互相照应。",
    giver: "wang_sanpang",
    type: "exploration",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山" },
      { type: "kill", count: 1, description: "击败1只妖魔完成历练" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "expedition_with_sanpang" }
  },

  quest_lingling_black_church: {
    id: "quest_lingling_black_church",
    name: "黑教廷追踪",
    description: "灵灵有一个追踪黑教廷的任务，邀请你参与调查。",
    giver: "lingling",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "bo_city_street", count: 1, description: "在博城市街调查黑教廷踪迹" },
      { type: "kill", count: 2, description: "击败2只可疑妖魔获取线索" },
      { type: "talk", npcId: "lingling", count: 1, description: "向灵灵汇报调查结果" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "tracked_black_church" }
  },

  quest_muzhuoyun_recognition: {
    id: "quest_muzhuoyun_recognition",
    name: "穆氏的认可",
    description: "穆卓云看不起平民出身的你，你决定用实力获得穆氏的认可。",
    giver: "mu_zhuoyun",
    type: "challenge",
    objectives: [
      { type: "cultivate", count: 3, description: "修炼3次提升实力" },
      { type: "kill", count: 2, description: "击败2只妖魔证明能力" },
      { type: "talk", npcId: "mu_zhuoyun", count: 1, description: "向穆卓云展示成果" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "mu_family_recognized" }
  },

  quest_dengkai_hunter_test: {
    id: "quest_dengkai_hunter_test",
    name: "猎者联盟考核",
    description: "邓凯建议你通过猎魔考核证明实力，加入猎者联盟。",
    giver: "deng_kai",
    type: "challenge",
    objectives: [
      { type: "kill", count: 3, description: "击败3只妖魔完成考核" },
      { type: "talk", npcId: "deng_kai", count: 1, description: "向邓凯汇报考核结果" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "hunter_alliance_member" }
  },

  quest_luoyunbo_demon_investigation: {
    id: "quest_luoyunbo_demon_investigation",
    name: "雪峰山异常调查",
    description: "罗云波注意到雪峰山妖魔活动异常，委托你调查。",
    giver: "luo_yunbo",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山调查" },
      { type: "kill", count: 1, description: "击败1只妖魔获取线索" },
      { type: "talk", npcId: "luo_yunbo", count: 1, description: "向罗云波汇报调查结果" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "investigated_snow_peak" }
  },

  quest_panlijun_military_training: {
    id: "quest_panlijun_military_training",
    name: "军方训练委托",
    description: "潘丽君代表斩空教官给你布置训练任务。",
    giver: "pan_lijun",
    type: "challenge",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次提升实力" },
      { type: "kill", count: 1, description: "击败1只妖魔实战检验" },
      { type: "talk", npcId: "pan_lijun", count: 1, description: "向潘丽君汇报训练成果" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "military_training_done" }
  },

  quest_ertuzi_equipment_prep: {
    id: "quest_ertuzi_equipment_prep",
    name: "猎魔装备准备",
    description: "二秃子建议你准备好装备再进山猎魔。",
    giver: "er_tuzi",
    type: "preparation",
    objectives: [
      { type: "collect", itemId: "basic_staff", count: 1, description: "购买1件基础装备" },
      { type: "kill", count: 1, description: "用新装备击败1只妖魔" },
      { type: "talk", npcId: "er_tuzi", count: 1, description: "向二秃子展示装备效果" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "equipment_prepared" }
  },

  quest_baiyang_summon_guide: {
    id: "quest_baiyang_summon_guide",
    name: "召唤系指导",
    description: "白杨老师愿意指导你了解召唤系的奥秘。",
    giver: "bai_yang",
    type: "guidance",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次感悟元素" },
      { type: "talk", npcId: "bai_yang", count: 1, description: "向白杨老师请教召唤系" }
    ],
    rewards: { exp: 150, gold: 80, setFlag: "summon_guided" }
  },

  quest_linyuxin_sister_missing: {
    id: "quest_linyuxin_sister_missing",
    name: "妹妹失踪调查",
    description: "林雨欣的妹妹失踪了，她怀疑与地圣泉附近的异常有关。",
    giver: "lin_yuxin",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "earth_holy_spring", count: 1, description: "在地圣泉附近调查" },
      { type: "kill", count: 2, description: "击败2只可疑妖魔寻找线索" },
      { type: "talk", npcId: "lin_yuxin", count: 1, description: "向林雨欣汇报调查结果" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "sister_case_investigated" }
  },

  quest_wanduanfeng_north_patrol: {
    id: "quest_wanduanfeng_north_patrol",
    name: "北面关卡巡逻",
    description: "万断峰镇守北面关卡，最近雨下得奇怪，需要人帮忙巡逻。",
    giver: "wan_duanfeng",
    type: "patrol",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往北面关卡巡逻" },
      { type: "kill", count: 2, description: "击败2只妖魔确保关卡安全" },
      { type: "talk", npcId: "wan_duanfeng", count: 1, description: "向万断峰汇报巡逻结果" }
    ],
    rewards: { exp: 180, gold: 120, setFlag: "north_patrol_done" }
  },

  quest_xuzhaoting_thunder_duel: {
    id: "quest_xuzhaoting_thunder_duel",
    name: "雷系切磋",
    description: "许昭霆是八班雷系尖子生，愿意和你切磋交流。",
    giver: "xu_zhaoting",
    type: "challenge",
    objectives: [
      { type: "kill", count: 1, description: "击败1只妖魔展示雷系实力" },
      { type: "talk", npcId: "xu_zhaoting", count: 1, description: "与许昭霆交流雷系心得" }
    ],
    rewards: { exp: 150, gold: 80, setFlag: "thunder_duel_done" }
  },

  quest_xubing_teach_lesson: {
    id: "quest_xubing_teach_lesson",
    name: "教训地痞",
    description: "徐兵一直在骚扰叶心夏，你决定给他一个教训。",
    giver: "xu_bing",
    type: "conflict",
    objectives: [
      { type: "kill", count: 1, description: "击败1只妖魔证明实力" },
      { type: "talk", npcId: "xu_bing", count: 1, description: "警告徐兵离叶心夏远点" }
    ],
    rewards: { exp: 150, gold: 50, setFlag: "xubing_warned" }
  },

  quest_moqing_deliver_supplies: {
    id: "quest_moqing_deliver_supplies",
    name: "帮忙送物资",
    description: "莫青担心去山里送物资的丈夫，希望你帮忙确认安全。",
    giver: "mo_qing",
    type: "errand",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "前往雪峰山确认物资送达" },
      { type: "talk", npcId: "mo_qing", count: 1, description: "向莫青汇报安全情况" }
    ],
    rewards: { exp: 120, gold: 80, setFlag: "supplies_delivered" }
  },

  quest_liangbin_spring_guard: {
    id: "quest_liangbin_spring_guard",
    name: "地圣泉守护",
    description: "梁斌负责看守地圣泉，希望你帮忙加强安全。",
    giver: "liang_bin",
    type: "guard",
    objectives: [
      { type: "reach", locationId: "earth_holy_spring", count: 1, description: "在地圣泉巡逻" },
      { type: "kill", count: 1, description: "击败1只靠近地圣泉的妖魔" },
      { type: "talk", npcId: "liang_bin", count: 1, description: "向梁斌汇报安全情况" }
    ],
    rewards: { exp: 150, gold: 100, setFlag: "spring_guarded" }
  },

  quest_yangzuohe_mid_guidance: {
    id: "quest_yangzuohe_mid_guidance",
    name: "中阶魔法指导",
    description: "杨作河认可你的雷系天赋，愿意指导你中阶魔法。",
    giver: "yang_zuohe",
    type: "guidance",
    objectives: [
      { type: "cultivate", count: 3, description: "修炼3次提升雷系" },
      { type: "talk", npcId: "yang_zuohe", count: 1, description: "向杨作河请教中阶魔法" }
    ],
    rewards: { exp: 180, gold: 100, setFlag: "mid_magic_guided" }
  },

  quest_zhuprincipal_school_quest: {
    id: "quest_zhuprincipal_school_quest",
    name: "学校委托",
    description: "朱校长给你布置了一个学校委托任务。",
    giver: "zhu_principal",
    type: "school",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次完成学校要求" },
      { type: "kill", count: 1, description: "击败1只妖魔完成实践课" },
      { type: "talk", npcId: "zhu_principal", count: 1, description: "向朱校长汇报任务完成" }
    ],
    rewards: { exp: 180, gold: 120, setFlag: "school_quest_done" }
  },

  quest_zhangxiaohou_training: {
    id: "quest_zhangxiaohou_training",
    name: "和小侯一起历练",
    description: "张小侯想和你一起去历练，互相照应。",
    giver: "zhang_xiaohou",
    type: "companion",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "和小侯一起前往雪峰山" },
      { type: "kill", count: 2, description: "击败2只妖魔完成历练" },
      { type: "talk", npcId: "zhang_xiaohou", count: 1, description: "和小侯分享历练心得" }
    ],
    rewards: { exp: 180, gold: 100, setFlag: "trained_with_xiaohou" }
  },

  quest_zhaomanyan_hunt: {
    id: "quest_zhaomanyan_hunt",
    name: "和满延一起猎魔",
    description: "赵满延邀请你一起去猎魔，他请客装备。",
    giver: "zhao_manyan",
    type: "companion",
    objectives: [
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "和满延一起前往雪峰山" },
      { type: "kill", count: 3, description: "击败3只妖魔完成猎魔" },
      { type: "talk", npcId: "zhao_manyan", count: 1, description: "和满延分享猎魔收获" }
    ],
    rewards: { exp: 200, gold: 150, setFlag: "hunted_with_manyan" }
  },

  quest_bookshop_knowledge: {
    id: "quest_bookshop_knowledge",
    name: "魔法书籍收集",
    description: "书店老板希望你帮忙收集各地的魔法书籍知识。",
    giver: "book_shop_owner",
    type: "collection",
    objectives: [
      { type: "cultivate", count: 3, description: "修炼3次感悟魔法知识" },
      { type: "talk", npcId: "book_shop_owner", count: 1, description: "向书店老板分享修炼心得" }
    ],
    rewards: { exp: 150, gold: 80, setFlag: "knowledge_collected" }
  },

  quest_magicassociation_test: {
    id: "quest_magicassociation_test",
    name: "魔法协会考核",
    description: "魔法协会会长建议你参加协会的基础考核。",
    giver: "magic_association_chairman",
    type: "challenge",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次准备考核" },
      { type: "kill", count: 2, description: "击败2只妖魔展示实力" },
      { type: "talk", npcId: "magic_association_chairman", count: 1, description: "向会长汇报考核结果" }
    ],
    rewards: { exp: 200, gold: 120, setFlag: "magic_assoc_tested" }
  },

  quest_mysterious_investigation: {
    id: "quest_mysterious_investigation",
    name: "神秘事件调查",
    description: "神秘法师暗示博城有不寻常的事，委托你调查。",
    giver: "mysterious_mage",
    type: "investigation",
    objectives: [
      { type: "reach", locationId: "bo_city_street", count: 1, description: "在博城市街调查异常" },
      { type: "reach", locationId: "snow_peak_mountain", count: 1, description: "在雪峰山调查异常" },
      { type: "talk", npcId: "mysterious_mage", count: 1, description: "向神秘法师汇报发现" }
    ],
    rewards: { exp: 200, gold: 100, setFlag: "mystery_investigated" }
  },

  quest_heyu_mutual_help: {
    id: "quest_heyu_mutual_help",
    name: "同学互助",
    description: "何雨希望和你互相帮助，共同进步。",
    giver: "he_yu",
    type: "companion",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次提升实力" },
      { type: "talk", npcId: "he_yu", count: 1, description: "和何雨交流修炼心得" }
    ],
    rewards: { exp: 120, gold: 60, setFlag: "helped_he_yu" }
  },

  // ========== v0.67.0 博城灾难第二阶段任务 ==========

  bocheng_prep_quest: {
    id: "bocheng_prep_quest",
    name: "备战准备",
    description: "协助学校备战，巡逻、加固防御、提升实力。唐月老师交给你的任务。",
    requireFlag: "bd_full_prep",
    notFlag: "bd_prep_complete",
    objectives: [
      { type: "cultivate", count: 2, description: "修炼2次" },
      { type: "explore", count: 1, description: "探索1次" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月对话1次" }
    ],
    rewards: { exp: 300, gold: 200, skillPoints: 1, setFlag: "bd_prep_complete" }
  },

  bocheng_crisis_quest: {
    id: "bocheng_crisis_quest",
    name: "危机应对",
    description: "应对突发的妖魔异常，保护同学或调查真相。",
    requireFlag: ["bd_evacuation", "bd_investigate_source"],
    notFlag: "bd_crisis_handled",
    objectives: [
      { type: "cultivate", count: 1, description: "修炼1次" },
      { type: "explore", count: 1, description: "探索1次" },
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月对话1次" }
    ],
    rewards: { exp: 250, gold: 150, setFlag: "bd_crisis_handled" }
  },

  // ========== v0.68.0 博城灾难第三阶段任务 ==========

  bocheng_aftermath: {
    id: "bocheng_aftermath",
    name: "灾难后的黎明",
    description: "灾难过后，博城满目疮痍。你需要平复心情，继续前行。唐月老师有话对你说。",
    requireFlag: "bocheng_phase3_done",
    notFlag: "bd_disaster_complete",
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月对话1次" },
      { type: "cultivate", count: 1, description: "修炼1次" },
      { type: "explore", count: 1, description: "探索1次" }
    ],
    rewards: { exp: 500, gold: 300, skillPoints: 2, setFlag: "bd_disaster_complete" }
  },

  // ========== v0.69.0 博城灾难后任务 ==========

  bocheng_journey: {
    id: "bocheng_journey",
    name: "新的旅程",
    description: "准备离开博城，开始新的旅程。整理行装，提升实力，与师友告别。",
    requireFlag: "bocheng_aftermath_event_done",
    notFlag: "bd_journey_started",
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "与唐月对话1次" },
      { type: "cultivate", count: 1, description: "修炼1次" },
      { type: "explore", count: 1, description: "探索1次" }
    ],
    rewards: { exp: 300, gold: 200, skillPoints: 1, setFlag: "bd_journey_started" }
  },

  // ========== v1.1.0 萧院长试炼 ==========
  quest_xiao_principal_trial: {
    id: "quest_xiao_principal_trial",
    name: "院长的试炼",
    description: "萧院长给你的考验。雪峰山最近出现了一只战将级巨眼猩鼠，伤了好几个猎者。如果你能独自解决它，院长就认可你的实力。",
    giver: "xiao_principal",
    type: "side",
    objectives: [
      { type: "hunt", enemyId: "giant_eye_rat", count: 1, description: "击败雪峰山的巨眼猩鼠（战将级）" }
    ],
    rewards: {
      exp: 300,
      gold: 200,
      items: [
        { itemId: "xiao_principal_notes", count: 1 }
      ]
    },
    prerequisites: [],
    dialogueStart: "好！有志向！雪峰山最近出现了一只战将级的巨眼猩鼠，伤了好几个猎者。如果你能独自解决它，我就认可你的实力。",
    dialogueInProgress: "巨眼猩鼠速度极快，小心它的突袭。不要逞强，觉得不行就回来。",
    dialogueComplete: "做得好！你果然没有让我失望。这本修炼笔记送给你，希望对你有帮助。"
  },

  // ========== v1.1.5 白藏风挑战 ==========
  quest_bai_cangfeng_challenge: {
    id: "quest_bai_cangfeng_challenge",
    name: "白家的挑衅",
    description: "明珠学府的白家子弟白藏锋看不起你，约定在切磋中一决高下。击败他，让他知道草根也能逆袭。",
    giver: "bai_cangfeng",
    type: "side",
    objectives: [
      { type: "kill", enemyId: "bai_cangfeng", count: 1, description: "与白藏锋切磋并击败他" }
    ],
    rewards: {
      exp: 200,
      gold: 150,
      reputation: { mingzhu_school: 10 }
    },
    prerequisites: [],
    dialogueStart: "哼，又是你。别以为出了点风头就了不起了。白家的底蕴不是你能想象的。敢不敢和我切磋一下？",
    dialogueInProgress: "怎么，怕了？我可是中阶光系法师，你一个草根……算了，让你三招。",
    dialogueComplete: "……你确实有点实力。不过别得意，主校区考核上见真章！"
  },

  // ========== 城市猎妖任务 ==========
  quest_hunt_school_demon: {
    id: "quest_hunt_school_demon",
    name: "铭文女子中学的妖魔",
    description: "铭文女子中学出现妖魔潜伏，城市猎妖队发布讨伐任务。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "mingzhu_school", count: 1, description: "调查铭文女子中学" },
      { type: "kill", enemyId: "one_eye_wolf", count: 1, description: "清除潜伏的妖魔" }
    ],
    rewards: {
      exp: 80,
      gold: 120,
      reputation: { hunter_alliance: 10 },
      items: [{ itemId: "servant_soul_essence", count: 1 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }],
    isRepeatable: true,
    difficulty: "easy",
    recommendedLevel: 5,
    maxTeamSize: 2,
    dialogueStart: "铭文女子中学有妖魔潜伏，你去调查一下。注意安全，新手别逞强。",
    dialogueInProgress: "找到妖魔了吗？小心，学校里可能有学生。",
    dialogueComplete: "干得不错。这是你的报酬，以后有任务再叫你。"
  },

  quest_hunt_old_district: {
    id: "quest_hunt_old_district",
    name: "老街区的怪事",
    description: "老街区频繁出现异常事件，疑似有战将级妖魔活动。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "old_district", count: 3, description: "调查3个线索点" },
      { type: "kill", enemyId: "demon_wolf_advanced", count: 1, description: "讨伐战将级妖魔" }
    ],
    rewards: {
      exp: 200,
      gold: 350,
      reputation: { hunter_alliance: 25 },
      items: [{ itemId: "warrior_soul_essence", count: 1 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }, { flag: "quest_hunt_school_demon_completed" }],
    isRepeatable: true,
    difficulty: "medium",
    recommendedLevel: 8,
    maxTeamSize: 2,
    hasBlackChurchClue: true,
    dialogueStart: "老街区最近不太平，你去查查。如果发现黑教廷的痕迹，立刻报告。",
    dialogueInProgress: "线索收集得怎么样了？战将级妖魔不好对付，建议带队友。",
    dialogueComplete: "很好。你发现的黑教廷线索很重要，我会上报给猎者联盟。"
  },

  quest_hunt_city_edge: {
    id: "quest_hunt_city_edge",
    name: "城市边缘的统领",
    description: "城市边缘发现统领级妖魔踪迹，必须在它进入城市前消灭。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "city_edge", count: 2, description: "追踪妖魔踪迹" },
      { type: "kill", enemyId: "winged_gray_wolf", count: 1, description: "讨伐统领级妖魔" }
    ],
    rewards: {
      exp: 500,
      gold: 800,
      reputation: { hunter_alliance: 50, brave: 20 },
      items: [{ itemId: "commander_soul_essence", count: 1 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }, { flag: "quest_hunt_old_district_completed" }],
    isRepeatable: false,
    difficulty: "hard",
    recommendedLevel: 12,
    maxTeamSize: 2,
    requireTeam: true,
    dialogueStart: "城市边缘有统领级妖魔，这是硬骨头。必须组队前往， solo就是送死。",
    dialogueInProgress: "统领级妖魔不是闹着玩的，利用环境，集中火力。",
    dialogueComplete: "你居然赢了统领级妖魔！了不起，猎妖队有你是福气。"
  },

  // ========== v1.8.1 新增城市猎妖任务（7个） ==========
  quest_hunt_sewer_rats: {
    id: "quest_hunt_sewer_rats",
    name: "下水道鼠患",
    description: "博城下水道暗影鼠泛滥，已经咬伤了几个维修工人。城市猎妖队发布清剿任务。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "bo_city", count: 1, description: "前往下水道入口调查" },
      { type: "kill", enemyId: "shadow_rat", count: 5, description: "清剿5只暗影鼠" }
    ],
    rewards: {
      exp: 60,
      gold: 80,
      reputation: { hunter_alliance: 5, city_street: 5 },
      items: [{ itemId: "servant_soul_essence", count: 1 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }],
    isRepeatable: true,
    difficulty: "easy",
    recommendedLevel: 4,
    maxTeamSize: 2,
    dialogueStart: "下水道的暗影鼠又闹起来了，咬了好几个工人。这种低级任务正好给你练手，去清剿5只。",
    dialogueInProgress: "暗影鼠喜欢阴暗角落，注意脚下，别被偷袭了。",
    dialogueComplete: "干得干净利落。下水道暂时安全了，这是你的报酬。"
  },

  quest_hunt_cemetery_ghost: {
    id: "quest_hunt_cemetery_ghost",
    name: "墓地幽灵",
    description: "博城公墓夜间出现幽灵作祟，附近居民不敢靠近。前往调查并驱除。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "bo_city", count: 2, description: "在公墓调查2个线索点" },
      { type: "kill", enemyId: "ghost", count: 3, description: "驱除3只幽灵" }
    ],
    rewards: {
      exp: 70,
      gold: 100,
      reputation: { hunter_alliance: 8 },
      items: [{ itemId: "servant_soul_essence", count: 1 }, { itemId: "mana_potion", count: 2 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }],
    isRepeatable: true,
    difficulty: "easy",
    recommendedLevel: 5,
    maxTeamSize: 2,
    dialogueStart: "公墓那边闹鬼，居民都不敢去扫墓了。幽灵怕光系和火系，你要是这两系就好办。",
    dialogueInProgress: "幽灵会穿墙，别让它绕到你背后。集中精神，感知它的位置。",
    dialogueComplete: "幽灵驱除了，公墓恢复了平静。附近居民会感谢你的。"
  },

  quest_hunt_warehouse_bugs: {
    id: "quest_hunt_warehouse_bugs",
    name: "仓库虫患",
    description: "城东仓库被食骨虫入侵，大量物资被啃食。需要紧急清剿。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "bo_city", count: 1, description: "检查仓库受损情况" },
      { type: "kill", enemyId: "bone_eating_worm", count: 4, description: "消灭4只食骨虫" }
    ],
    rewards: {
      exp: 75,
      gold: 90,
      reputation: { hunter_alliance: 6, city_street: 5 },
      items: [{ itemId: "servant_soul_essence", count: 1 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }],
    isRepeatable: true,
    difficulty: "easy",
    recommendedLevel: 5,
    maxTeamSize: 2,
    dialogueStart: "城东仓库闹虫灾，食骨虫把粮食都啃了。火系和雷系对虫类效果好，你去处理一下。",
    dialogueInProgress: "食骨虫会钻地，注意地面震动。它们的牙齿很锋利，别被近身。",
    dialogueComplete: "虫患清除了，仓库保住了。商会那边会给猎妖队送锦旗的。"
  },

  quest_hunt_market_protection: {
    id: "quest_hunt_market_protection",
    name: "集市护卫",
    description: "博城最大的集市出现血纹鼠群，威胁到大量市民安全。需要在人群疏散前控制局面。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "bo_city", count: 2, description: "疏散集市人群并调查鼠群来源" },
      { type: "kill", enemyId: "blood_pattern_rat", count: 6, description: "消灭6只血纹鼠" }
    ],
    rewards: {
      exp: 120,
      gold: 180,
      reputation: { hunter_alliance: 15, city_street: 15, brave: 5 },
      items: [{ itemId: "servant_soul_essence", count: 2 }, { itemId: "health_potion", count: 3 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }, { flag: "quest_hunt_sewer_rats_completed" }],
    isRepeatable: true,
    difficulty: "medium",
    recommendedLevel: 7,
    maxTeamSize: 2,
    dialogueStart: "集市出事了！血纹鼠群冲进人群，已经有人受伤。你赶紧去支援，先疏散人群再清剿鼠群。",
    dialogueInProgress: "血纹鼠比暗影鼠大得多，攻击性更强。注意保护平民，别让鼠群冲散人群。",
    dialogueComplete: "集市保住了！你反应很快，伤亡控制在最低。徐大荒对你的表现很满意。"
  },

  quest_hunt_school_patrol: {
    id: "quest_hunt_school_patrol",
    name: "校园夜间巡逻",
    description: "天澜魔法高中夜间发现黑兽踪迹，学校担心学生安全。委托猎妖队夜间巡逻排查。",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "tianlan_school", count: 3, description: "夜间巡逻校园3个区域" },
      { type: "kill", enemyId: "black_beast", count: 2, description: "驱除2只黑兽" }
    ],
    rewards: {
      exp: 130,
      gold: 160,
      reputation: { hunter_alliance: 12, tianlan_school: 15 },
      items: [{ itemId: "servant_soul_essence", count: 2 }, { itemId: "mana_potion", count: 3 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }],
    isRepeatable: true,
    difficulty: "medium",
    recommendedLevel: 7,
    maxTeamSize: 2,
    dialogueStart: "天澜魔法高中晚上有黑兽出没，萧院长亲自找我们帮忙。你去巡逻一下，把黑兽找出来。",
    dialogueInProgress: "黑兽擅长隐藏在阴影里，夜间视力好。用照明魔法或者感知类技能找它们。",
    dialogueComplete: "校园安全了。萧院长特意让我谢谢你，说天澜的学生有你这样的校友是福气。"
  },

  quest_hunt_black_church_cell: {
    id: "quest_hunt_black_church_cell",
    name: "黑教廷据点",
    description: "根据线报，博城郊区有一个黑教廷的秘密据点，正在进行邪恶仪式。必须立即捣毁！",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "bo_city", count: 3, description: "追踪线索找到黑教廷据点" },
      { type: "kill", enemyId: "black_church_acolyte", count: 4, description: "击败4名黑教廷侍僧" }
    ],
    rewards: {
      exp: 250,
      gold: 400,
      reputation: { hunter_alliance: 30, magic_association: 20, brave: 15 },
      items: [{ itemId: "warrior_soul_essence", count: 1 }, { itemId: "demon_core", count: 1 }, { itemId: "super_health_potion", count: 3 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }, { flag: "quest_hunt_old_district_completed" }],
    isRepeatable: false,
    difficulty: "hard",
    recommendedLevel: 10,
    maxTeamSize: 2,
    requireTeam: true,
    hasBlackChurchClue: true,
    dialogueStart: "重大情报！我们找到了黑教廷在博城的一个据点，他们在进行什么邪恶仪式。必须立刻捣毁！这个任务危险，建议组队。",
    dialogueInProgress: "黑教廷的人都是亡命之徒，下手狠辣。注意他们的配合，别被围殴了。找到仪式现场就打断它！",
    dialogueComplete: "据点捣毁了！你缴获的情报很有价值，黑教廷在博城的布局比我们想象的更深。这件事我会上报审判会。"
  },

  quest_hunt_demon_vine: {
    id: "quest_hunt_demon_vine",
    name: "魔藤入侵",
    description: "博城公园被变异魔藤侵占，植物系妖魔疯狂生长，已经困住了数名游客。紧急救援！",
    giver: "xu_dahuang",
    type: "hunt",
    objectives: [
      { type: "investigate", location: "bo_city", count: 2, description: "调查魔藤来源并救援被困游客" },
      { type: "kill", enemyId: "demon_vine", count: 3, description: "清除3株魔藤" }
    ],
    rewards: {
      exp: 220,
      gold: 350,
      reputation: { hunter_alliance: 25, city_street: 20, brave: 10 },
      items: [{ itemId: "warrior_soul_essence", count: 1 }, { itemId: "super_mana_potion", count: 3 }]
    },
    prerequisites: [{ flag: "hunter_team_member" }, { flag: "quest_hunt_market_protection_completed" }],
    isRepeatable: true,
    difficulty: "hard",
    recommendedLevel: 9,
    maxTeamSize: 2,
    dialogueStart: "公园的魔藤疯了！变异植物系妖魔把整个公园都占了，还有游客被困。火克木，你要是火系就占大便宜。",
    dialogueInProgress: "魔藤会从地下突袭，注意地面裂缝。先救被困的人，再集中火力烧魔藤的根！",
    dialogueComplete: "魔藤清除了，游客都救出来了。公园管理处给猎妖队送了感谢信，你这次立大功了。"
  },

  // ========== v2.1.0: 博城重建任务线 ==========
  quest_rebuild_clear_rubble: {
    id: "quest_rebuild_clear_rubble",
    name: "清理主街道废墟",
    description: "博城灾难后，主街道被废墟堵塞。协助工程队清理主街道的废墟，恢复交通。",
    giver: "xue_musheng",
    type: "explore",
    objectives: [
      { type: "explore", locationId: "bo_city_street", count: 3, description: "在博城市街探索3次，协助清理废墟" }
    ],
    rewards: { exp: 100, gold: 150, reputation: { "bo_city": 10 } },
    prerequisites: [{ flag: "stay_in_bo_city" }],
    nextQuest: "quest_rebuild_rescue_survivors",
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 8,
    dialogueStart: "博城的主街道还被废墟堵着，工程队缺人手。你能去帮帮忙吗？",
    dialogueInProgress: "清理工作进展如何？注意安全，废墟里可能还有残留的妖魔。",
    dialogueComplete: "辛苦了！主街道终于通了，市民们都很感激你。"
  },
  quest_rebuild_rescue_survivors: {
    id: "quest_rebuild_rescue_survivors",
    name: "搜救被困幸存者",
    description: "灾难后还有一些幸存者被困在废墟中。跟随救援队搜索老街区，救出被困的市民。",
    giver: "tang_yue",
    type: "explore",
    objectives: [
      { type: "explore", locationId: "old_district", count: 3, description: "在老街区搜索3次，搜救幸存者" }
    ],
    rewards: { exp: 120, gold: 100, reputation: { "bo_city": 15 }, npcRelation: { "tang_yue": 5 } },
    prerequisites: ["quest_rebuild_clear_rubble"],
    nextQuest: "quest_rebuild_medical_aid",
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 8,
    dialogueStart: "老街区还有一些幸存者被困，救援队正在搜索。你要一起去吗？",
    dialogueInProgress: "找到幸存者了吗？他们可能很虚弱，注意安抚情绪。",
    dialogueComplete: "你救出来的那家人一直在感谢你。做得好，孩子。"
  },
  quest_rebuild_medical_aid: {
    id: "quest_rebuild_medical_aid",
    name: "协助医疗队",
    description: "临时医疗点缺少魔法草药和绷带。收集5株魔法草药和3卷绷带，送到医疗点。",
    giver: "tang_yue",
    type: "collect",
    objectives: [
      { type: "collect", itemId: "magic_herb", count: 5, description: "收集 5 株魔法草药" },
      { type: "collect", itemId: "bandage", count: 3, description: "收集 3 卷绷带" }
    ],
    rewards: { exp: 100, gold: 120, reputation: { "bo_city": 10 }, items: [{ itemId: "health_potion", count: 2 }] },
    prerequisites: ["quest_rebuild_rescue_survivors"],
    nextQuest: "quest_rebuild_patrol",
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 8,
    dialogueStart: "医疗点的物资快用完了，你能帮忙收集一些草药和绷带吗？",
    dialogueInProgress: "物资收集得怎么样了？伤员们都等着用呢。",
    dialogueComplete: "太好了！这些物资正好够用。医疗队让我代他们谢谢你。"
  },
  quest_rebuild_patrol: {
    id: "quest_rebuild_patrol",
    name: "夜间巡逻",
    description: "灾难后夜间还有残留妖魔出没。跟随猎妖队在博城边缘巡逻，清除3只残留妖魔。",
    giver: "hunter_leader",
    type: "kill",
    objectives: [
      { type: "kill", enemyId: "demon_wolf", count: 3, description: "击杀 3 只残留妖魔" }
    ],
    rewards: { exp: 150, gold: 200, reputation: { "bo_city": 15, "hunter": 10 } },
    prerequisites: ["quest_rebuild_medical_aid"],
    nextQuest: "quest_rebuild_school",
    isMainQuest: false,
    difficulty: "normal",
    recommendedLevel: 9,
    dialogueStart: "夜间还有残留妖魔在城市边缘游荡，市民们不敢出门。你能参加巡逻队吗？",
    dialogueInProgress: "巡逻情况如何？注意安全，妖魔可能成群出现。",
    dialogueComplete: "昨晚的巡逻很成功，市民们终于能睡个安稳觉了。"
  },
  quest_rebuild_school: {
    id: "quest_rebuild_school",
    name: "重建天澜魔法高中",
    description: "天澜魔法高中在灾难中受损严重。协助收集建筑材料，帮助学校重建。",
    giver: "xue_musheng",
    type: "collect",
    objectives: [
      { type: "collect", itemId: "magic_stone", count: 5, description: "收集 5 块魔法石材" },
      { type: "collect", itemId: "reinforced_wood", count: 10, description: "收集 10 根强化木材" }
    ],
    rewards: { exp: 200, gold: 250, reputation: { "bo_city": 20, "school": 15 }, npcRelation: { "xue_musheng": 10 } },
    prerequisites: ["quest_rebuild_patrol"],
    nextQuest: "quest_rebuild_market",
    isMainQuest: false,
    difficulty: "normal",
    recommendedLevel: 9,
    dialogueStart: "学校的教学楼受损严重，我们需要建筑材料来重建。你能帮忙收集吗？",
    dialogueInProgress: "材料收集得怎么样了？学生们都盼着能早日复课。",
    dialogueComplete: "太好了！有了这些材料，学校很快就能重建完成。你是天澜的骄傲。"
  },
  quest_rebuild_market: {
    id: "quest_rebuild_market",
    name: "恢复集市运营",
    description: "博城集市在灾难后停业。帮助商人们重新开张，恢复城市的经济活力。",
    giver: "merchant_leader",
    type: "talk",
    objectives: [
      { type: "talk", npcId: "merchant_zhang", count: 1, description: "与张商人交谈" },
      { type: "talk", npcId: "merchant_li", count: 1, description: "与李商人交谈" }
    ],
    rewards: { exp: 150, gold: 300, reputation: { "bo_city": 15 } },
    prerequisites: ["quest_rebuild_school"],
    nextQuest: "quest_rebuild_defense",
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 9,
    dialogueStart: "集市的商人们都不敢回来做生意。你能帮忙说服他们重新开张吗？",
    dialogueInProgress: "商人们怎么说？他们有什么顾虑？",
    dialogueComplete: "集市又热闹起来了！这都要感谢你。"
  },
  quest_rebuild_defense: {
    id: "quest_rebuild_defense",
    name: "修复城市防御法阵",
    description: "博城的外围防御法阵在灾难中被破坏。协助魔法协会修复防御法阵。",
    giver: "magic_association",
    type: "collect",
    objectives: [
      { type: "collect", itemId: "magic_crystal", count: 3, description: "收集 3 颗魔法水晶" }
    ],
    rewards: { exp: 250, gold: 200, reputation: { "bo_city": 20, "magic_association": 10 } },
    prerequisites: ["quest_rebuild_market"],
    nextQuest: "quest_rebuild_memorial",
    isMainQuest: false,
    difficulty: "normal",
    recommendedLevel: 10,
    dialogueStart: "城市的防御法阵需要修复，但魔法水晶不够用。你能帮忙寻找吗？",
    dialogueInProgress: "魔法水晶找到了吗？法阵的修复全靠它了。",
    dialogueComplete: "防御法阵修复完成！博城的安全又多了一层保障。"
  },
  quest_rebuild_memorial: {
    id: "quest_rebuild_memorial",
    name: "灾难纪念碑落成",
    description: "博城灾难纪念碑落成，参加落成仪式，缅怀遇难者。",
    giver: "xue_musheng",
    type: "talk",
    objectives: [
      { type: "talk", npcId: "xue_musheng", count: 1, description: "参加纪念碑落成仪式" }
    ],
    rewards: { exp: 100, gold: 0, reputation: { "bo_city": 10 }, npcRelation: { "tang_yue": 5, "zhang_xiaohou": 5 } },
    prerequisites: ["quest_rebuild_defense"],
    nextQuest: "quest_rebuild_hunt_guard",
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 10,
    dialogueStart: "灾难纪念碑明天就要落成了，你愿意来参加仪式吗？",
    dialogueInProgress: "仪式准备得怎么样了？这对博城人民很重要。",
    dialogueComplete: "愿逝者安息，生者坚强。博城会重新站起来的。"
  },
  quest_rebuild_hunt_guard: {
    id: "quest_rebuild_hunt_guard",
    name: "守护重建区域",
    description: "重建区域经常受到妖魔骚扰。连续守护重建区域，确保工程顺利进行。",
    giver: "hunter_leader",
    type: "kill",
    objectives: [
      { type: "kill", enemyId: "one_eye_wolf", count: 5, description: "击杀 5 只骚扰重建的妖魔" }
    ],
    rewards: { exp: 300, gold: 350, reputation: { "bo_city": 25, "hunter": 15 } },
    prerequisites: ["quest_rebuild_memorial"],
    nextQuest: "quest_rebuild_train_students",
    isMainQuest: false,
    difficulty: "hard",
    recommendedLevel: 10,
    dialogueStart: "重建区域老是被妖魔骚扰，工程进度受影响。你能负责守护吗？",
    dialogueInProgress: "守护情况如何？妖魔还来骚扰吗？",
    dialogueComplete: "有你在，重建工作顺利多了。猎妖队都佩服你的实力。"
  },
  quest_rebuild_train_students: {
    id: "quest_rebuild_train_students",
    name: "指导新生修炼",
    description: "灾后很多新生失去了导师。协助指导新生修炼，帮助他们打好基础。",
    giver: "tang_yue",
    type: "cultivate",
    objectives: [
      { type: "cultivate", count: 3, description: "修炼3次，指导新生" }
    ],
    rewards: { exp: 200, gold: 150, reputation: { "school": 20 }, npcRelation: { "tang_yue": 10 } },
    prerequisites: ["quest_rebuild_hunt_guard"],
    nextQuest: "quest_rebuild_investigation",
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 10,
    dialogueStart: "灾后很多新生没人指导，你能帮忙带带他们吗？",
    dialogueInProgress: "新生们学得怎么样？要有耐心。",
    dialogueComplete: "新生们都说你教得好！天澜有你这样的学长，是他们的幸运。"
  },
  quest_rebuild_investigation: {
    id: "quest_rebuild_investigation",
    name: "调查残留黑教廷踪迹",
    description: "有报告称博城附近还有黑教廷残党活动。调查并清除他们。",
    giver: "tang_yue",
    type: "explore",
    objectives: [
      { type: "explore", locationId: "xuefeng_mountain", count: 2, description: "在雪峰山搜索2次" },
      { type: "kill", enemyId: "black_church_gray", count: 2, description: "击败 2 名黑教廷灰衣教士" }
    ],
    rewards: { exp: 350, gold: 300, reputation: { "inquisition": 20, "bo_city": 15 }, npcRelation: { "tang_yue": 10 } },
    prerequisites: ["quest_rebuild_train_students"],
    nextQuest: "quest_rebuild_final_report",
    isMainQuest: false,
    difficulty: "hard",
    recommendedLevel: 11,
    dialogueStart: "有情报显示黑教廷残党还在博城附近活动。你能去调查一下吗？",
    dialogueInProgress: "调查进展如何？注意安全，黑教廷很危险。",
    dialogueComplete: "做得好！黑教廷的残党被清除了。审判会会记住你的贡献。"
  },
  quest_rebuild_final_report: {
    id: "quest_rebuild_final_report",
    name: "重建成果汇报",
    description: "向唐月老师汇报重建期间的成果，听取她对你未来发展的建议。",
    giver: "tang_yue",
    type: "talk",
    objectives: [
      { type: "talk", npcId: "tang_yue", count: 1, description: "向唐月汇报重建成果" }
    ],
    rewards: { exp: 300, gold: 200, reputation: { "bo_city": 20 }, npcRelation: { "tang_yue": 15 }, items: [{ itemId: "tang_yue_recommendation", count: 1 }] },
    prerequisites: ["quest_rebuild_investigation"],
    isMainQuest: false,
    difficulty: "easy",
    recommendedLevel: 11,
    dialogueStart: "重建工作告一段落了，来我办公室一趟，我们聊聊你的未来。",
    dialogueInProgress: "你来了？坐吧，我有些话想跟你说。",
    dialogueComplete: "博城的重建有你一份功劳。但你的路还很长，是时候去更广阔的世界了。"
  }
};

export default DataQuests;
