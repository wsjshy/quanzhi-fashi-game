/**
 * 事件数据
 * 从 game-data.js 拆分而来
 */

const DataEvents = {
  event_breakthrough: {
    id: "event_breakthrough",
    name: "修炼突破",
    description: "修炼时忽然有所领悟",
    trigger: "training",
    chance: 0.3,
    conditions: [
      {
        type: "level",
        value: 1,
        operator: ">="
      }
    ],
    once: false,
    choices: [
      {
        text: "仔细感悟",
        effects: {
          exp: 50,
          mp: -20
        },
        resultText: "你仔细感悟魔法的真谛，获得了大量经验！"
      },
      {
        text: "先休息一下",
        effects: {
          hp: 20,
          mp: 10
        },
        resultText: "你决定休息一下，恢复了一些体力。"
      }
    ]
  },
  event_tower_insight: {
    id: "event_tower_insight",
    name: "三步塔顿悟",
    description: "三步塔中星子环绕，你忽然感受到了魔法的真谛！",
    trigger: "training",
    chance: 0.15,
    conditions: [
      {
        type: "level",
        value: 5,
        operator: ">="
      }
    ],
    once: false,
    choices: [
      {
        text: "深入感悟",
        effects: {
          exp: 100,
          mp: -30,
          hp: -10
        },
        resultText: "你沉浸在星子的海洋中，对魔法的理解更深了！获得大量经验！"
      },
      {
        text: "稳住心神",
        effects: {
          exp: 40,
          mp: 20
        },
        resultText: "你稳住心神，安全地吸收了这股感悟。"
      }
    ]
  },
  event_training_fail: {
    id: "event_training_fail",
    name: "修炼失败",
    description: "修炼时魔法失控了",
    trigger: "training",
    chance: 0.2,
    conditions: [],
    once: false,
    choices: [
      {
        text: "强行稳住",
        effects: {
          hp: -20,
          exp: 10
        },
        resultText: "你强行稳住了魔法，受了点伤，但也有所收获。"
      },
      {
        text: "立刻停止",
        effects: {
          mp: -15
        },
        resultText: "你立刻停止了修炼，避免了受伤。"
      }
    ]
  },
  event_classmate_chat: {
    id: "event_classmate_chat",
    name: "同学搭话",
    description: "旁边的同学主动和你聊天",
    trigger: "training",
    chance: 0.2,
    conditions: [],
    once: false,
    choices: [
      {
        text: "愉快地交谈",
        effects: {
          exp: 5,
          mp: 5
        },
        resultText: "你们聊得很开心，交流了一些修炼心得。"
      },
      {
        text: "专心学习",
        effects: {
          exp: 10
        },
        resultText: "你婉拒了对方，继续专心学习。"
      }
    ]
  },
  event_mo_fan_scolded: {
    id: "event_mo_fan_scolded",
    name: "莫凡被批评",
    description: "你看到薛老师正在批评莫凡",
    trigger: "training",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "上去帮忙说话",
        effects: {
          exp: 8,
          hp: -5
        },
        resultText: "你上去帮莫凡说了几句话，薛老师连你一起批评了一顿，不过莫凡感激地看了你一眼。（获得少量经验）"
      },
      {
        text: "在旁边看热闹",
        effects: {
          exp: 5
        },
        resultText: "你在旁边看热闹，学到了一些不要做的事情。（获得少量经验）"
      },
      {
        text: "假装没看见",
        effects: {},
        resultText: "你假装没看见，悄悄走开了。"
      }
    ]
  },
  event_zhao_manyan_showoff: {
    id: "event_zhao_manyan_showoff",
    name: "赵满延炫耀",
    description: "赵满延又在炫耀他的新装备",
    trigger: "training",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "羡慕地看着",
        effects: {
          exp: 5,
          mp: 5
        },
        resultText: "你羡慕地看着赵满延的新装备，他很开心，和你聊了几句修炼心得。（获得少量经验和MP）"
      },
      {
        text: "不屑一顾",
        effects: {
          exp: 3
        },
        resultText: "你表现得不屑一顾，专心自己修炼。（获得少量经验）"
      },
      {
        text: "问问价格",
        effects: {
          gold: -10
        },
        resultText: "你问了问价格，果然是你买不起的东西... 赵满延还非要请你喝饮料，你花了10金币意思一下。"
      }
    ]
  },
  event_mu_ningxue_gossip: {
    id: "event_mu_ningxue_gossip",
    name: "议论穆宁雪",
    description: "你听到几个同学在议论穆宁雪",
    trigger: "training",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "凑过去听",
        effects: {
          exp: 3
        },
        resultText: "你凑过去听了听，都是些八卦传闻。好像被穆宁雪看到了，她冷冷地看了你一眼..."
      },
      {
        text: "走开不听",
        effects: {
          exp: 5
        },
        resultText: "你觉得背后议论人不好，就走开专心学习了。（获得少量经验）"
      },
      {
        text: "加入讨论",
        effects: {
          exp: 2,
          hp: -10
        },
        resultText: "你加入了讨论，聊得很开心。不过你总觉得背后有点冷... 好像被冰系魔法瞄了一眼。（HP减少）"
      }
    ]
  },
  event_zhang_xiaohou_find: {
    id: "event_zhang_xiaohou_find",
    name: "张小侯找你",
    description: "张小侯兴冲冲地跑来找你",
    trigger: "training",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "和他一起玩",
        effects: {
          exp: 3,
          stamina: 5
        },
        resultText: "你和张小侯聊了一会儿，他给你讲了很多有趣的事情，心情变好了。（恢复少量体力）"
      },
      {
        text: "婉拒，继续学习",
        effects: {
          exp: 8
        },
        resultText: "你婉拒了张小侯，继续专心学习。张小侯有点失望，但也理解。（获得经验）"
      }
    ]
  },
  event_zhou_min_question: {
    id: "event_zhou_min_question",
    name: "周敏问问题",
    description: "周敏过来问你一个修炼上的问题",
    trigger: "training",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "认真解答",
        effects: {
          exp: 10,
          mp: -5
        },
        resultText: "你认真地给周敏讲解了问题，在讲解的过程中你自己也有了新的理解。（获得经验）"
      },
      {
        text: "说你也不会",
        effects: {
          exp: 2
        },
        resultText: "你说你也不太懂，周敏有点失望地走开了。"
      }
    ]
  },
  event_xu_zhaoting_showoff: {
    id: "event_xu_zhaoting_showoff",
    name: "许昭霆炫耀",
    description: "许昭霆又在炫耀他的雷系魔法",
    trigger: "training",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "夸他厉害",
        effects: {
          exp: 3
        },
        resultText: "你夸了许昭霆几句，他更得意了，给你演示了几个小技巧。（获得少量经验）"
      },
      {
        text: "不以为然",
        effects: {
          exp: 5
        },
        resultText: "你表现得不以为然，许昭霆有些不服气，非要和你比试一下。你勉强应付了过去，也学到了点东西。（获得经验）"
      }
    ]
  },
  event_find_money: {
    id: "event_find_money",
    name: "捡到钱",
    description: "你在地上捡到了一个钱包",
    trigger: "exploring",
    chance: 0.15,
    conditions: [],
    once: false,
    choices: [
      {
        text: "据为己有",
        effects: {
          gold: 50
        },
        resultText: "你环顾四周，把钱装进了自己的口袋。（获得 50 金币）"
      },
      {
        text: "交给警察",
        effects: {
          exp: 20
        },
        resultText: "你把钱包交给了警察，做了件好事。（获得 20 经验）"
      }
    ]
  },
  event_meet_stranger: {
    id: "event_meet_stranger",
    name: "神秘商人",
    description: "一个神秘的商人向你兜售物品",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "买！100金币一个神秘盒子",
        effects: {
          gold: -100,
          addItem: {
            itemId: "super_health_potion",
            count: 2
          }
        },
        resultText: "你打开盒子，里面是两瓶高级治愈药水！"
      },
      {
        text: "不买，骗子",
        effects: {},
        resultText: "你觉得这是个骗子，转身离开了。"
      }
    ]
  },
  event_shop_discount: {
    id: "event_shop_discount",
    name: "商店打折",
    description: "你发现今天魔法商店在搞促销活动，所有商品8折优惠，仅限今天！",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "太好了，去买买买",
        effects: {
          shopDiscount: {
            discount: 0.8,
            durationDays: 1
          }
        },
        resultText: "你记下了这个好消息，今天去商店买东西都能打8折！"
      },
      {
        text: "没什么需要的，算了",
        effects: {},
        resultText: "你觉得暂时不需要买东西，就没有放在心上。"
      }
    ]
  },
  event_street_performer: {
    id: "event_street_performer",
    name: "街头卖艺",
    description: "你看到一个法师在街头表演魔法",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "停下来观看",
        effects: {
          exp: 10,
          gold: -5
        },
        resultText: "你停下来看了一会儿表演，学到了一些小技巧，还打赏了5金币。（获得经验，消耗5金币）"
      },
      {
        text: "匆匆走过",
        effects: {},
        resultText: "你匆匆走过，没有停下脚步。"
      }
    ]
  },
  event_pickpocket: {
    id: "event_pickpocket",
    name: "遇到小偷",
    description: "你感觉有人在摸你的口袋！",
    trigger: "exploring",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "立刻抓住他",
        effects: {
          hp: -10,
          exp: 15
        },
        resultText: "你立刻抓住了小偷，和他扭打了几下，小偷跑掉了，但你保住了钱包。（HP减少，获得经验）"
      },
      {
        text: "赶紧捂住口袋",
        effects: {
          gold: -10
        },
        resultText: "你赶紧捂住口袋，但还是被偷走了10金币。（损失10金币）"
      }
    ]
  },
  event_drunk_hunter: {
    id: "event_drunk_hunter",
    name: "喝醉的猎人",
    description: "一个喝醉的猎人在酒馆门口吹牛",
    trigger: "exploring",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "听他讲故事",
        effects: {
          exp: 8,
          stamina: -5
        },
        resultText: "你听猎人讲了很多猎魔的故事，虽然大部分是吹的，但也学到了一些东西。（获得经验，消耗体力）"
      },
      {
        text: "请他喝一杯",
        effects: {
          gold: -20,
          exp: 15
        },
        resultText: "你请猎人喝了一杯，他很高兴，给你讲了很多真正的猎魔技巧。（获得经验，消耗20金币）"
      },
      {
        text: "走开",
        effects: {},
        resultText: "你觉得他在吹牛，就走开了。"
      }
    ]
  },
  event_find_herb: {
    id: "event_find_herb",
    name: "发现草药",
    description: "你发现了一些魔法草药",
    trigger: "exploring",
    chance: 0.4,
    conditions: [],
    once: false,
    choices: [
      {
        text: "采集起来",
        effects: {
          addItem: {
            itemId: "magic_herb",
            count: 2
          }
        },
        resultText: "你采集了 2 株魔法草药。"
      }
    ]
  },
  event_find_rare_herb: {
    id: "event_find_rare_herb",
    name: "稀有草药",
    description: "你发现了一株稀有的草药！",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "小心采集",
        effects: {
          addItem: {
            itemId: "magic_herb",
            count: 5
          },
          exp: 30
        },
        resultText: "你小心翼翼地采集了这株稀有草药，还学到了不少知识。"
      }
    ]
  },
  event_find_treasure: {
    id: "event_find_treasure",
    name: "发现宝箱",
    description: "你发现了一个破旧的宝箱",
    trigger: "exploring",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "打开看看",
        effects: {
          gold: 80,
          addItem: {
            itemId: "health_potion",
            count: 2
          }
        },
        resultText: "宝箱里有 80 金币和 2 瓶治愈药水！"
      },
      {
        text: "小心有陷阱",
        effects: {},
        resultText: "你谨慎地离开了，什么都没发生。"
      }
    ]
  },
  event_trap: {
    id: "event_trap",
    name: "陷阱",
    description: "你不小心踩到了陷阱！",
    trigger: "exploring",
    chance: 0.15,
    conditions: [],
    once: false,
    choices: [
      {
        text: "强行挣脱",
        effects: {
          hp: -30
        },
        resultText: "你强行挣脱了陷阱，但受了不少伤。（-30 HP）"
      }
    ]
  },
  event_meet_hunter: {
    id: "event_meet_hunter",
    name: "遇到猎魔者",
    description: "你遇到了一个正在休息的猎魔者",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "上去打招呼",
        effects: {
          exp: 15,
          stamina: 10
        },
        resultText: "你上去和猎魔者打了个招呼，他给你分享了一些猎魔经验，还分给你一些食物。（获得经验，恢复体力）"
      },
      {
        text: "悄悄走开",
        effects: {},
        resultText: "你不想打扰对方，悄悄走开了。"
      }
    ]
  },
  event_beautiful_view: {
    id: "event_beautiful_view",
    name: "美丽的风景",
    description: "你发现了一处美丽的风景",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "停下来欣赏",
        effects: {
          stamina: 20,
          mp: 10
        },
        resultText: "你停下来欣赏美丽的风景，心情变好了，精神也恢复了。（恢复体力和MP）"
      },
      {
        text: "继续前进",
        effects: {
          exp: 5
        },
        resultText: "你看了一眼就继续前进了，不能因为风景耽误修炼。（获得少量经验）"
      }
    ]
  },
  event_rain: {
    id: "event_rain",
    name: "突然下雨",
    description: "天突然下起了大雨！",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "找地方躲雨",
        effects: {
          stamina: -10
        },
        resultText: "你找了个地方躲雨，等了好久雨才停。（消耗体力）"
      },
      {
        text: "冒雨前进",
        effects: {
          hp: -15,
          exp: 10
        },
        resultText: "你冒雨继续前进，虽然淋成了落汤鸡，但也锻炼了意志。（HP减少，获得经验）"
      }
    ]
  },
  event_library_learn: {
    id: "event_library_learn",
    name: "学到新知识",
    description: "你在图书馆学到了很多新知识",
    trigger: "exploring",
    chance: 0.3,
    conditions: [],
    once: false,
    choices: [
      {
        text: "继续深入学习",
        effects: {
          exp: 30,
          mp: -15
        },
        resultText: "你继续深入学习，收获颇丰！（获得大量经验）"
      },
      {
        text: "休息一下",
        effects: {
          exp: 15,
          stamina: 10
        },
        resultText: "你休息了一下，整理学到的知识。（获得经验，恢复体力）"
      }
    ]
  },
  event_library_skill: {
    id: "event_library_skill",
    name: "领悟技能",
    description: "你在看书时忽然领悟了一个新技能！",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "仔细研究",
        effects: {
          exp: 20,
          addItem: {
            itemId: "magic_herb",
            count: 1
          }
        },
        resultText: "你仔细研究了这个技能，虽然还没完全学会，但收获了不少。（获得经验和1株魔法草药）"
      }
    ]
  },
  event_library_info: {
    id: "event_library_info",
    name: "发现秘闻",
    description: "你在一本旧书里发现了一些有趣的秘闻",
    trigger: "exploring",
    chance: 0.15,
    conditions: [],
    once: false,
    choices: [
      {
        text: "认真阅读",
        effects: {
          exp: 25
        },
        resultText: "你认真阅读了这些秘闻，学到了很多东西。（获得经验）"
      },
      {
        text: "记下来以后再看",
        effects: {
          exp: 10
        },
        resultText: "你把这些内容记了下来，以后慢慢研究。（获得少量经验）"
      }
    ]
  },
  event_library_meet: {
    id: "event_library_meet",
    name: "遇到同学",
    description: "你在图书馆遇到了也来看书的同学",
    trigger: "exploring",
    chance: 0.2,
    conditions: [],
    once: false,
    choices: [
      {
        text: "一起学习",
        effects: {
          exp: 20,
          stamina: -5
        },
        resultText: "你和同学一起学习，互相交流了心得。（获得经验）"
      },
      {
        text: "打个招呼就继续看自己的",
        effects: {
          exp: 10
        },
        resultText: "你打了个招呼就继续看自己的书了。（获得少量经验）"
      }
    ]
  },
  event_find_demon_tracks: {
    id: "event_find_demon_tracks",
    name: "发现妖魔足迹",
    description: "你在地上发现了一些奇怪的足迹",
    trigger: "exploring",
    chance: 0.2,
    conditions: [
      {
        type: "day",
        value: 10,
        operator: ">="
      }
    ],
    once: false,
    choices: [
      {
        text: "仔细观察",
        effects: {
          giveInfo: "demon_clue_2"
        },
        resultText: "你仔细观察了这些足迹，发现妖魔的数量比以前多了很多，而且种类也更丰富了。这很不正常...（获得线索：妖魔足迹变多）"
      },
      {
        text: "没什么大不了的",
        effects: {},
        resultText: "你觉得这没什么大不了的，继续前进。"
      }
    ]
  },
  event_find_demon_clue: {
    id: "event_find_demon_clue",
    name: "发现受伤的猎人",
    description: "你发现了一个受伤的猎人倒在地上",
    trigger: "exploring",
    chance: 0.1,
    conditions: [
      {
        type: "day",
        value: 15,
        operator: ">="
      }
    ],
    once: false,
    choices: [
      {
        text: "上前救助",
        effects: {
          hp: -10,
          giveInfo: "demon_clue_1"
        },
        resultText: "你上前救助了受伤的猎人。他告诉你，他在山脚附近遇到了幽狼兽，那东西以前不会离人类聚居地这么近。（获得线索：幽狼兽下山了）"
      },
      {
        text: "绕开继续走",
        effects: {},
        resultText: "你选择绕开，继续前进。"
      }
    ]
  },
  event_mo_fan_secret: {
    id: "event_mo_fan_secret",
    name: "莫凡的秘密",
    description: "你在莫凡家偶然发现了一些有趣的事",
    trigger: "visit",
    chance: 0.3,
    once: false,
    choices: [
      {
        text: "假装没看见",
        effects: {
          npcOpinion: {
            npcId: "mo_fan",
            value: 2
          }
        },
        resultText: "你假装没看见，莫凡感激地看了你一眼。有些事情，还是不要戳破的好。"
      },
      {
        text: "好奇地问问",
        effects: {
          npcOpinion: {
            npcId: "mo_fan",
            value: -2
          },
          familiarity: 5
        },
        resultText: "你好奇地问了一下，莫凡支支吾吾地糊弄过去了。虽然他没说什么，但你感觉他藏着很多秘密。"
      }
    ]
  },
  event_mu_family_news: {
    id: "event_mu_family_news",
    name: "穆氏家族的消息",
    description: "你在穆家庄园听到了一些消息",
    trigger: "visit",
    chance: 0.2,
    once: false,
    choices: [
      {
        text: "仔细听听",
        effects: {
          giveInfo: "mu_family_intro"
        },
        resultText: "你仔细听了听下人们的议论，了解到了一些关于穆氏家族的事情。穆家是博城的大家族，势力很大...（获得情报：穆氏家族介绍）"
      },
      {
        text: "不感兴趣",
        effects: {},
        resultText: "你对这些家族事务不感兴趣，继续参观庄园。"
      }
    ]
  },
  event_black_church_encounter: {
    id: "event_black_church_encounter",
    name: "可疑的黑衣人",
    description: "你在山里遇到了几个穿着黑色长袍的可疑人物",
    trigger: "exploring",
    chance: 0.15,
    conditions: [
      {
        type: "minDay",
        value: 20
      },
      {
        type: "minLevel",
        value: 3
      }
    ],
    once: false,
    choices: [
      {
        text: "悄悄绕开",
        effects: {
          giveInfo: "black_church_clue"
        },
        resultText: "你小心翼翼地绕开了他们。虽然没看清他们在做什么，但你感觉这些人很危险...（获得线索：可疑的黑衣人）"
      },
      {
        text: "上前质问",
        effects: {
          startBattle: "black_church_acolyte"
        },
        resultText: "你上前质问他们是谁。那些人转过头来，眼睛里闪烁着诡异的光芒..."
      }
    ]
  },
  event_black_church_ritual: {
    id: "event_black_church_ritual",
    name: "神秘的仪式",
    description: "你发现了一个神秘的仪式现场",
    trigger: "exploring",
    chance: 0.08,
    conditions: [
      {
        type: "minDay",
        value: 30
      },
      {
        type: "minLevel",
        value: 5
      }
    ],
    once: true,
    choices: [
      {
        text: "偷偷观察",
        effects: {
          giveInfo: "black_church_intel",
          exp: 50
        },
        resultText: "你躲在暗处偷偷观察。那些黑衣人似乎在进行某种召唤仪式，嘴里念着诡异的咒语...你悄悄离开了，这个发现太重要了！（获得情报：黑教廷的阴谋，50经验）"
      },
      {
        text: "冲出去阻止",
        effects: {
          startBattle: "black_church_deacon",
          giveInfo: "black_church_intel"
        },
        resultText: "你勇敢地冲出去阻止他们！仪式被打断了，为首的黑衣人愤怒地向你攻来..."
      },
      {
        text: "赶紧离开",
        effects: {},
        resultText: "你感觉这里太危险了，赶紧离开了现场。有些事情，还是不要掺和的好..."
      }
    ]
  },
  event_mysterious_chest: {
    id: "event_mysterious_chest",
    name: "神秘的宝箱",
    description: "你在一个隐蔽的角落发现了一个古老的宝箱",
    trigger: "exploring",
    chance: 0.05,
    conditions: [
      {
        type: "minLevel",
        value: 3
      }
    ],
    once: true,
    choices: [
      {
        text: "打开看看",
        effects: {
          gold: 200,
          exp: 100,
          giveItem: {
            itemId: "demon_core",
            count: 5
          }
        },
        resultText: "你小心翼翼地打开了宝箱。里面有一些金币、几颗妖魔精核，还有一本破旧的笔记。看来这是某个前辈法师留下的东西！（获得 200 金币，100 经验，5 颗妖魔精核）"
      },
      {
        text: "可能有陷阱，别动",
        effects: {},
        resultText: "你觉得宝箱可能有陷阱，决定不动它。有时候，谨慎才是明智的选择。"
      }
    ]
  },
  event_ancient_stele: {
    id: "event_ancient_stele",
    name: "古老的石碑",
    description: "你发现了一块刻满神秘符文的古老石碑",
    trigger: "exploring",
    chance: 0.03,
    conditions: [
      {
        type: "minLevel",
        value: 5
      }
    ],
    once: true,
    choices: [
      {
        text: "仔细研究符文",
        effects: {
          exp: 150,
          spirit: 2
        },
        resultText: "你仔细研究石碑上的符文，虽然大部分都看不懂，但你隐约感觉到了一些魔法的奥秘。你的精神力似乎提升了！（获得 150 经验，精神力 +2）"
      },
      {
        text: "看不懂，走吧",
        effects: {},
        resultText: "这些符文太复杂了，你完全看不懂。也许以后有机会再来研究吧。"
      }
    ]
  },
  event_lost_cat: {
    id: "event_lost_cat",
    name: "迷路的小猫",
    description: "你遇到了一只迷路的小黑猫",
    trigger: "exploring",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "喂它点吃的",
        effects: {
          gold: -10,
          exp: 20
        },
        resultText: "你拿出一些食物喂小猫。它吃得很开心，吃完后蹭了蹭你的腿，然后跑走了。也许它会给你带来好运吧...（花费 10 金币，获得 20 经验）"
      },
      {
        text: "摸摸它",
        effects: {
          exp: 10
        },
        resultText: "你蹲下来摸了摸小猫。它似乎很享受，发出了呼噜呼噜的声音。心情变好了呢！（获得 10 经验）"
      },
      {
        text: "不理它",
        effects: {},
        resultText: "你没有理会小猫，继续前进。"
      }
    ]
  },
  event_mysterious_merchant: {
    id: "event_mysterious_merchant",
    name: "神秘的流浪商人",
    description: "你遇到了一个神秘的流浪商人，他卖的东西很特别",
    trigger: "exploring",
    chance: 0.05,
    conditions: [
      {
        type: "minLevel",
        value: 4
      },
      {
        type: "minGold",
        value: 100
      }
    ],
    once: false,
    choices: [
      {
        text: "买一瓶神秘药水（100金币）",
        effects: {
          gold: -100,
          giveItem: {
            itemId: "super_health_potion",
            count: 2
          }
        },
        resultText: "你花100金币买了一瓶神秘药水。商人神神秘秘地说这是好东西... 嗯，好像就是高级药水？（获得 2 瓶高级药水）"
      },
      {
        text: "买一块魔法石（200金币）",
        effects: {
          gold: -200,
          giveItem: {
            itemId: "magic_stone",
            count: 10
          }
        },
        resultText: "你花200金币买了一块魔法石。商人说这是从很远的地方带来的... 看起来确实不错！（获得 10 块魔法石）"
      },
      {
        text: "太贵了，不买",
        effects: {},
        resultText: "你觉得价格太贵了，决定不买。商人耸耸肩，消失在了迷雾中..."
      }
    ]
  },
  event_gate_news: {
    id: "event_gate_news",
    name: "城门消息",
    description: "你在城门听到了一些消息",
    trigger: "exploring",
    chance: 0.5,
    conditions: [],
    once: false,
    choices: [
      {
        text: "仔细听听",
        effects: {
          giveInfo: "demon_rumor_1"
        },
        resultText: "你听到守卫们在议论，说最近山里不太太平，有猎人看到了很多妖魔...（获得情报：山里最近不太平）"
      },
      {
        text: "没兴趣，走开",
        effects: {},
        resultText: "你对这些消息没什么兴趣，走开了。"
      }
    ]
  },
  event_guard_chat: {
    id: "event_guard_chat",
    name: "守卫聊天",
    description: "守卫们正在聊天",
    trigger: "exploring",
    chance: 0.4,
    conditions: [
      {
        type: "minLevel",
        value: 4
      }
    ],
    once: false,
    choices: [
      {
        text: "上去搭话",
        effects: {
          exp: 10,
          giveInfo: "demon_rumor_2"
        },
        resultText: "你上去和守卫们搭话。他们告诉你最近药草涨价了，因为受伤的猎人越来越多...（获得 10 经验，获得情报：药草涨价）"
      },
      {
        text: "远远看着",
        effects: {},
        resultText: "你远远地看着守卫们聊天，没有上前打扰。"
      }
    ]
  },
  event_patrol_find: {
    id: "event_patrol_find",
    name: "巡逻发现",
    description: "你在巡逻时发现了一些东西",
    trigger: "exploring",
    chance: 0.3,
    conditions: [],
    once: false,
    choices: [
      {
        text: "捡起来看看",
        effects: {
          gold: 20,
          giveItem: {
            itemId: "health_potion",
            count: 1
          }
        },
        resultText: "你在路边捡到了一个小袋子，里面有 20 金币和一瓶药水！（获得 20 金币，获得治愈药水 x1）"
      },
      {
        text: "不捡，继续巡逻",
        effects: {
          exp: 5
        },
        resultText: "你没有捡，继续认真巡逻。守卫们对你的态度更好了。（获得 5 经验）"
      }
    ]
  },
  event_patrol_attack: {
    id: "event_patrol_attack",
    name: "巡逻遇袭",
    description: "你在巡逻时遇到了妖魔",
    trigger: "exploring",
    chance: 0.2,
    conditions: [
      {
        type: "minLevel",
        value: 5
      }
    ],
    once: false,
    choices: [
      {
        text: "迎战！",
        effects: {
          startBattle: "demon_wolf"
        },
        resultText: "一只幽狼兽从草丛里扑了出来！你拔出武器，准备战斗！"
      },
      {
        text: "快跑！",
        effects: {
          hp: -20,
          stamina: -10
        },
        resultText: "你转身就跑，虽然被妖魔抓伤了，但好歹逃掉了。（损失 20 HP，损失 10 体力）"
      }
    ]
  },
  event_tavern_quest: {
    id: "event_tavern_quest",
    name: "酒馆任务",
    description: "酒馆里有人在悬赏任务",
    trigger: "exploring",
    chance: 0.3,
    conditions: [],
    once: false,
    choices: [
      {
        text: "接下任务",
        effects: {
          gold: 30,
          exp: 20
        },
        resultText: "你接下了一个简单的任务，轻松完成了！（获得 30 金币，20 经验）"
      },
      {
        text: "不感兴趣",
        effects: {},
        resultText: "你觉得任务太简单了，没兴趣。"
      }
    ]
  },
  event_drunk_fight: {
    id: "event_drunk_fight",
    name: "醉汉挑事",
    description: "一个醉汉来找你麻烦",
    trigger: "exploring",
    chance: 0.2,
    conditions: [],
    once: false,
    choices: [
      {
        text: "教训他一顿",
        effects: {
          hp: -10,
          gold: 20,
          exp: 15
        },
        resultText: "你几下就把醉汉打倒了，还从他身上搜到了 20 金币。"
      },
      {
        text: "躲开他",
        effects: {},
        resultText: "你不想惹麻烦，躲开了醉汉。"
      }
    ]
  },
  event_merchant_encounter: {
    id: "event_merchant_encounter",
    name: "遇到商贩",
    description: "驿站主道上，一个光头小贩向你招手",
    trigger: "exploring",
    chance: 0.3,
    conditions: [],
    once: false,
    choices: [
      {
        text: "过去看看",
        effects: {
          gold: -10,
          exp: 5
        },
        resultText: "你走过去，二秃子向你推销履魔具和魔石。你花了10金币买了点小东西，也了解了不少魔具知识。"
      },
      {
        text: "摆摆手走开",
        effects: {},
        resultText: "你对小贩的商品不感兴趣，走开了。"
      }
    ]
  },
  event_hunter_advice: {
    id: "event_hunter_advice",
    name: "猎者的建议",
    description: "一位老猎者主动和你聊起野外生存的经验",
    trigger: "exploring",
    chance: 0.25,
    conditions: [],
    once: false,
    choices: [
      {
        text: "认真聆听",
        effects: {
          exp: 20,
          maxHp: 5
        },
        resultText: "老猎者分享了很多野外生存的经验：遇到打不过的妖魔就跑，跟紧队伍，不要单独行动。你受益匪浅，最大生命值永久+5。"
      },
      {
        text: "礼貌告别",
        effects: {
          exp: 5
        },
        resultText: "你感谢了猎者的好意，告别离开。"
      }
    ]
  },
  event_hunter_story: {
    id: "event_hunter_story",
    name: "猎者的故事",
    description: "驿站里，几个猎者在喝酒聊天，讲着猎杀妖魔的故事",
    trigger: "exploring",
    chance: 0.2,
    conditions: [],
    once: false,
    choices: [
      {
        text: "坐下听听",
        effects: {
          exp: 15,
          stamina: -10
        },
        resultText: "你坐下来听猎者们讲故事。他们讲了很多妖魔的习性和弱点，还有斩空总教官的传奇事迹。你对妖魔有了更深的了解。"
      },
      {
        text: "继续探索",
        effects: {},
        resultText: "你不想浪费时间，继续探索驿站。"
      }
    ]
  },
  event_herb_discovery: {
    id: "event_herb_discovery",
    name: "发现草药",
    description: "在百草谷中发现了珍贵的魔法草药",
    trigger: "exploring",
    chance: 0.3,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: false,
    choices: [
      {
        text: "小心采集",
        effects: {
          addItem: { itemId: "magic_herb", count: 2 },
          exp: 10
        },
        resultText: "你小心翼翼地采集了2株魔法草药，品质上乘。"
      },
      {
        text: "深入寻找更多",
        effects: {
          stamina: -10,
          addItem: { itemId: "magic_herb", count: 3 },
          exp: 15
        },
        resultText: "你深入谷中，又找到了3株草药，但消耗了不少体力。"
      }
    ]
  },
  event_demon_vine_encounter: {
    id: "event_demon_vine_encounter",
    name: "妖藤袭击",
    description: "地面突然伸出藤蔓，向你袭来！",
    trigger: "exploring",
    chance: 0.25,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: false,
    choices: [
      {
        text: "用火系魔法焚烧",
        effects: {
          mp: -15,
          exp: 30,
          addItem: { itemId: "vine_fiber", count: 2 }
        },
        resultText: "你释放火系魔法，妖藤遇火即燃，很快化为灰烬。你获得了2份藤蔓纤维。"
      },
      {
        text: "拔刀斩断",
        effects: {
          stamina: -15,
          hp: -10,
          exp: 20,
          addItem: { itemId: "vine_fiber", count: 1 }
        },
        resultText: "你用武器斩断藤蔓，但被荆棘划伤，损失了一些HP。获得1份藤蔓纤维。"
      },
      {
        text: "快速逃离",
        effects: {
          stamina: -20
        },
        resultText: "你迅速逃离了妖藤的攻击范围，虽然没受伤但消耗了大量体力。"
      }
    ]
  },
  event_wolf_beast_battle: {
    id: "event_wolf_beast_battle",
    name: "幽狼兽出现",
    description: "一只绿色汗毛的幽狼兽挡住了去路，它是白阳老师的召唤兽！",
    trigger: "exploring",
    chance: 0.2,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: false,
    choices: [
      {
        text: "正面迎战",
        effects: {
          triggerBattle: "demon_wolf",
          exp: 50
        },
        resultText: "你决定正面迎战幽狼兽！进入战斗！"
      },
      {
        text: "用环境智取",
        effects: {
          intelligence: 10,
          exp: 40,
          stamina: -10
        },
        resultText: "你观察周围环境，利用地形与幽狼兽周旋，虽然没有正面战斗，但学到了很多实战经验。"
      },
      {
        text: "撤退报告老师",
        effects: {
          stamina: -15
        },
        resultText: "你选择撤退，去找白阳老师报告情况。安全第一。"
      }
    ]
  },
  event_stalactite_tactics: {
    id: "event_stalactite_tactics",
    name: "钟乳石智商碾压",
    description: "洞穴中，幽狼兽发狂追来。你看到头顶的钟乳石，心生一计！",
    trigger: "exploring",
    chance: 0.15,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: true,
    choices: [
      {
        text: "攻击钟乳石砸向幽狼兽",
        effects: {
          mp: -20,
          exp: 100,
          intelligence: 20,
          addItem: { itemId: "wolf_fang", count: 2 }
        },
        resultText: "你精准地攻击钟乳石的支撑点，巨大的钟乳石砸向幽狼兽，将其重创！这就是智商碾压！获得2颗狼牙。"
      },
      {
        text: "引幽狼兽撞向石壁",
        effects: {
          stamina: -20,
          exp: 80,
          intelligence: 15
        },
        resultText: "你引诱发狂的幽狼兽撞向坚硬的石壁，它被撞得头晕目眩。你趁机逃脱。"
      }
    ]
  },
  event_river_cross_success: {
    id: "event_river_cross_success",
    name: "成功跨越河谷",
    description: "你成功跨越了10米宽的河谷悬崖！",
    trigger: "exploring",
    chance: 0.5,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: false,
    choices: [
      {
        text: "继续前进",
        effects: {
          exp: 30,
          stamina: -10
        },
        resultText: "你成功跨越河谷，对岸的风景更加壮丽。继续探索吧！"
      }
    ]
  },
  event_river_cross_fail: {
    id: "event_river_cross_fail",
    name: "跨越失败",
    description: "你尝试跨越河谷，但差了一点，掉了下去！",
    trigger: "exploring",
    chance: 0.5,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: false,
    choices: [
      {
        text: "爬回岸边",
        effects: {
          hp: -20,
          stamina: -25
        },
        resultText: "你掉进了河谷，虽然抓住了藤蔓爬了上来，但受了不少伤。下次还是找风系法师帮忙吧。"
      }
    ]
  },
  event_valley_view: {
    id: "event_valley_view",
    name: "百草谷风光",
    description: "站在高处俯瞰百草谷，掌状湖泊尽收眼底，美不胜收。",
    trigger: "exploring",
    chance: 0.15,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: true,
    choices: [
      {
        text: "欣赏风景",
        effects: {
          stamina: 10,
          exp: 5
        },
        resultText: "你被眼前的美景震撼，心情愉悦，体力恢复了一些。魔法世界的自然风光真是令人陶醉。"
      }
    ]
  },
  event_cave_explore: {
    id: "event_cave_explore",
    name: "洞穴探索",
    description: "你进入了独眼魔狼的旧巢穴，洞穴内有钟乳石和泉池，似乎藏着什么。",
    trigger: "exploring",
    chance: 0.3,
    conditions: [{ type: "location", value: "baicao_valley" }],
    once: false,
    choices: [
      {
        text: "搜索泉池附近",
        effects: {
          addItem: { itemId: "magic_stone", count: 1 },
          exp: 15,
          stamina: -10
        },
        resultText: "你在泉池边发现了一颗魔法石，似乎是之前的猎者遗失的。"
      },
      {
        text: "深入洞穴",
        effects: {
          stamina: -15,
          exp: 20
        },
        resultText: "你深入洞穴，发现了一些妖魔活动的痕迹，看来这里并不安全。"
      }
    ]
  },
  event_mingwen_explore: {
    id: "event_mingwen_explore",
    name: "空旷校园",
    description: "暑假的铭文女子中学空无一人，只有几只流浪猫在花圃中探头探脑。",
    trigger: "exploring",
    chance: 1.0,
    conditions: { location: "mingwen_girls_school" },
    choices: [
      {
        text: "在校园中散步",
        effects: { stamina: -5, exp: 10 },
        resultText: "你在空旷的校园中散步，感受着宁静的氛围，偶尔能听到远处传来的奇怪声响。"
      },
      {
        text: "查看公告栏",
        effects: { exp: 15, intelligence: 5 },
        resultText: "公告栏上贴着失踪女生的寻人启事，已经有些发黄了。看来这件事已经发生一段时间了。"
      }
    ]
  },
  event_mingwen_clue: {
    id: "event_mingwen_clue",
    name: "奇怪的气味",
    description: "你嗅到了一股食物发馊的奇怪味道，似乎是从食堂方向飘来的。",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "mingwen_girls_school" },
    choices: [
      {
        text: "循着气味调查",
        effects: { stamina: -10, exp: 20, setFlag: "mingwen_clue_found" },
        resultText: "你循着气味来到食堂附近，味道越来越浓。你确定食堂里一定藏着什么东西。"
      },
      {
        text: "暂时离开",
        effects: { stamina: -5 },
        resultText: "你决定暂时离开，等准备充分了再来调查。"
      }
    ]
  },
  event_cafeteria_investigate: {
    id: "event_cafeteria_investigate",
    name: "食堂调查",
    description: "你进入了铭文女子中学的食堂，里面黑漆漆的，只有远处的灯光照亮了些许位置。整齐的餐桌餐椅冷冷清清地摆在那里。",
    trigger: "exploring",
    chance: 1.0,
    conditions: { location: "mingwen_girls_school", action: "investigate_cafeteria" },
    choices: [
      {
        text: "蹲在角落观察",
        effects: { stamina: -10, exp: 15 },
        resultText: "你蹲在一个角落，静静观察。突然，不知从什么地方发出了一阵响声，一个铁勺随着桌椅的晃动抖动起来。"
      },
      {
        text: "直接去后厨",
        effects: { stamina: -15, exp: 25, hp: -20 },
        resultText: "你直接走向后厨，一股腐臭气味扑面而来。突然，一道腥红光线射来，你勉强躲开，但还是被擦伤了。"
      }
    ]
  },
  event_giant_eye_rat_encounter: {
    id: "event_giant_eye_rat_encounter",
    name: "巨眼猩鼠！",
    description: "一只脖子粗得跟一人抱树的怪物从后厨冲了出来！它的脑袋上只有一个篮球大的眼睛和一张塞满发馊食物的大嘴！那只眼睛正在凝聚腥红色的能量！",
    trigger: "exploring",
    chance: 0.4,
    conditions: { location: "mingwen_girls_school", action: "investigate_cafeteria" },
    choices: [
      {
        text: "正面迎战！",
        effects: { hp: -30, exp: 50, stamina: -20, setFlag: "giant_rat_encountered" },
        resultText: "你与巨眼猩鼠展开激战！腥红光束擦过你的肩膀，火辣辣地疼。经过一番苦战，你终于击退了它，但它逃进了地下通道。你获得了宝贵的战斗经验。"
      },
      {
        text: "快速撤退",
        effects: { stamina: -20, hp: -10 },
        resultText: "你转身就跑，腥红光束擦着你的肩膀飞过，火辣辣地疼。你成功逃出了食堂，但巨眼猩鼠还潜伏在那里。"
      }
    ]
  },
  event_library_study: {
    id: "event_library_study",
    name: "图书馆自习",
    description: "铭文女子中学的图书馆安静而宽敞，书架上摆满了各种魔法书籍。",
    trigger: "exploring",
    chance: 1.0,
    conditions: { location: "mingwen_girls_school", action: "visit_library" },
    choices: [
      {
        text: "阅读魔法理论",
        effects: { exp: 25, mp: 15, intelligence: 5 },
        resultText: "你阅读了一本魔法理论书籍，对魔法的本质有了更深的理解。"
      },
      {
        text: "查阅妖魔图鉴",
        effects: { exp: 20, intelligence: 10, setFlag: "demon_encyclopedia_read" },
        resultText: "你查阅了妖魔图鉴，了解了更多关于城市妖魔的知识，包括巨眼猩鼠的习性。"
      }
    ]
  },
  event_hunter_recruit: {
    id: "event_hunter_recruit",
    name: "城市猎妖队招新",
    description: "猎者联盟大厅里，城市猎妖队正在招募新队员。队长徐大荒正在面试应聘者，看到你后眼睛一亮。",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "city_street", action: "hunter_alliance" },
    choices: [
      {
        text: "上前报名",
        effects: { exp: 20, setFlag: "city_hunter_recruit" },
        resultText: "你走上前报名。徐大荒队长看了看你：'你是雷系法师？太好了，直接录取！欢迎加入城市猎妖队！'"
      },
      {
        text: "先看看再说",
        effects: { exp: 5 },
        resultText: "你决定先看看情况。大厅里人来人往，各种悬赏信息在大屏幕上滚动。"
      }
    ]
  },
  event_hunter_bounty: {
    id: "event_hunter_bounty",
    name: "悬赏任务",
    description: "猎者联盟大厅的大屏幕上公布着各种悬赏任务，从奴仆级到战将级都有。",
    trigger: "exploring",
    chance: 0.4,
    conditions: { location: "city_street", action: "hunter_alliance" },
    choices: [
      {
        text: "查看奴仆级悬赏",
        effects: { exp: 10, gold: 0 },
        resultText: "奴仆级悬赏大多是猎杀独眼魔狼、巨眼猩鼠等常见妖魔，报酬在1-5万金币之间。"
      },
      {
        text: "查看战将级悬赏",
        effects: { exp: 15 },
        resultText: "战将级悬赏报酬丰厚，但危险极高。以你现在的实力，还不是对手。"
      }
    ]
  },
  event_old_district_explore: {
    id: "event_old_district_explore",
    name: "废墟探索",
    description: "老榕树街区一片废墟，烂尾楼和半拆房屋遍布，灰尘弥漫。你小心翼翼地在废墟中探索。",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "old_banyan_district" },
    choices: [
      {
        text: "仔细搜索地面",
        effects: { exp: 15, stamina: -5 },
        resultText: "你在地面发现了一些奇怪的痕迹，像是某种大型生物的脚印，但被灰尘覆盖看不太清。"
      },
      {
        text: "检查烂尾楼入口",
        effects: { exp: 10 },
        resultText: "烂尾楼里堆满了水泥袋和废弃工具，里面黑漆漆的，似乎有什么东西在里面。"
      },
      {
        text: "寻找居民询问",
        effects: { exp: 5, reputation_city: 5 },
        resultText: "几个老人说最近夜里确实有震动，还有流浪汉失踪了，但没人敢深入调查。"
      }
    ]
  },
  event_find_demon_footprint: {
    id: "event_find_demon_footprint",
    name: "发现足迹",
    description: "你在一片较为干净的地面上发现了一个巨大的脚印，形状像狼，但比普通狼大得多。",
    trigger: "exploring",
    chance: 0.4,
    conditions: { location: "old_banyan_district" },
    choices: [
      {
        text: "测量脚印大小",
        effects: { exp: 20, intelligence: 5 },
        resultText: "这个脚印比普通狼大两号，而且只有一只眼睛的妖魔...是独眼魔狼！而且体型异常大，可能是进阶期！"
      },
      {
        text: "追踪足迹方向",
        effects: { exp: 15, stamina: -10 },
        resultText: "足迹延伸向那座最大的烂尾楼，看来妖魔就藏身在那里。你需要做好战斗准备。"
      }
    ]
  },
  event_demon_powder_reveal: {
    id: "event_demon_powder_reveal",
    name: "寻妖粉显现",
    description: "你将寻妖粉撒向空中，晶莹的粉末缓缓飘落。突然，粉末在十米外的地面上粘附成形，组成了一个巨大的脚印轮廓！",
    trigger: "exploring",
    chance: 0.8,
    conditions: { location: "old_banyan_district", action: "use_demon_powder" },
    choices: [
      {
        text: "走近查看脚印",
        effects: { exp: 25, intelligence: 10 },
        resultText: "寻妖粉不会骗人，这里十天内确实有妖魔活动。这个脚印形状...是独眼魔狼！而且体型比普通的大很多。"
      },
      {
        text: "继续撒粉追踪",
        effects: { exp: 20, stamina: -5 },
        resultText: "更多的粉末显现出足迹的走向，一直延伸到那座烂尾商场楼里。妖魔肯定就藏在里面！"
      }
    ]
  },
  event_construction_investigate: {
    id: "event_construction_investigate",
    name: "深入烂尾楼",
    description: "你走进烂尾楼，里面堆满了水泥袋和废弃材料，光线昏暗。突然，你听到深处传来咀嚼的声音...",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "old_banyan_district", action: "investigate_construction" },
    choices: [
      {
        text: "悄悄靠近查看",
        effects: { exp: 30, hp: -20 },
        resultText: "你透过砖墙看到了惊悚的一幕：一只独眼巨狼正在咀嚼，旁边还有断掉的人类手臂！它在吃人！你被发现了，赶紧跑！"
      },
      {
        text: "立刻撤退通知猎妖队",
        effects: { exp: 15, reputation_city_hunters: 10 },
        resultText: "你明智地选择撤退，赶紧联系城市猎妖队。这种进阶期妖魔不是你一个人能对付的。"
      }
    ]
  },
  event_one_eye_wolf_ambush: {
    id: "event_one_eye_wolf_ambush",
    name: "魔狼伏击",
    description: "突然，一道黑影从废墟中窜出！一只体型庞大的独眼魔狼挡住了你的去路，它的独眼中闪烁着凶残的光芒！",
    trigger: "exploring",
    chance: 0.4,
    conditions: { location: "old_banyan_district" },
    choices: [
      {
        text: "迎战！",
        effects: { exp: 50, hp: -30 },
        resultText: "你与独眼魔狼展开激战！它的力量和速度都远超普通妖魔，经过一番苦战你勉强击退了它。这只妖魔不简单，需要猎妖队支援！"
      },
      {
        text: "撤退求援",
        effects: { exp: 10, stamina: -15 },
        resultText: "你明智地选择撤退，这只独眼魔狼太强了，而且似乎在进阶。赶紧通知猎妖队和魔法协会！"
      }
    ]
  },
  event_evacuate_residents: {
    id: "event_evacuate_residents",
    name: "疏散居民",
    description: "你挨家挨户通知老街区的居民撤离，告诉他们这里有妖魔出没。",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "old_banyan_district", action: "evacuate_residents" },
    choices: [
      {
        text: "耐心劝说老人",
        effects: { exp: 20, reputation_city: 15, stamina: -10 },
        resultText: "几位老人起初不愿意离开，但在你的坚持下终于同意撤离。你救了他们的命！"
      },
      {
        text: "快速通知后离开",
        effects: { exp: 10, reputation_city: 5 },
        resultText: "你快速通知了能找到的居民，有些人将信将疑，但至少大部分人开始撤离了。"
      }
    ]
  },
  event_soul_collection: {
    id: "event_soul_collection",
    name: "魂魄收集",
    description: "战斗结束后，你靠近妖魔的尸体。你的小泥鳅坠（或其他收集器皿）开始发出光芒，一缕魂魄从尸体中飘出...",
    trigger: "battle_victory",
    chance: 0.3,
    conditions: { enemy: "one_eye_wolf_advanced" },
    choices: [
      {
        text: "收集魂魄",
        effects: { addItem: "soul_fragment", exp: 30 },
        resultText: "你成功收集到了妖魔的残魄！这种魂魄对修炼和制作魔器很有价值。"
      },
      {
        text: "不收集，离开",
        effects: { exp: 5 },
        resultText: "你没有收集魂魄的器皿，只能遗憾地离开。"
      }
    ]
  },
  event_duel_practice: {
    id: "event_duel_practice",
    name: "决斗场切磋",
    description: "你在穆氏庄园的决斗场与其他魔法师切磋，提升实战经验。",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "mu_manor", action: "duel_arena" },
    choices: [
      {
        text: "与世家弟子切磋",
        effects: { exp: 30, hp: -20, reputation_mu_family: 5 },
        resultText: "你与一位世家弟子切磋，虽然受了些伤，但学到了不少实战技巧。对方对你的实力也有些惊讶。"
      },
      {
        text: "观察其他人战斗",
        effects: { exp: 15, intelligence: 5 },
        resultText: "你在一旁观察其他魔法师的战斗，学到了一些新的技巧和思路。"
      }
    ]
  },
  event_duel_yu_ang: {
    id: "event_duel_yu_ang",
    name: "挑战宇昂",
    description: "你在决斗场遇到了宇昂，他轻蔑地看着你，似乎不屑与你交手。",
    trigger: "exploring",
    chance: 0.3,
    conditions: { location: "mu_manor", action: "duel_arena" },
    choices: [
      {
        text: "发起挑战",
        effects: { exp: 50, hp: -40, reputation_mu_family: -10 },
        resultText: "你向宇昂发起挑战。他的冰系魔法很强，还有地波履魔具可以闪避。你勉强支撑了几个回合，但最终还是败下阵来。不过你的表现让他有些意外。"
      },
      {
        text: "观察他的战斗方式",
        effects: { exp: 20, intelligence: 10 },
        resultText: "你在一旁仔细观察宇昂的战斗方式，他的冰蔓·覆盖威力惊人，范围极大。你记下了他的战斗节奏，为将来的决斗做准备。"
      }
    ]
  },
  event_mu_banquet: {
    id: "event_mu_banquet",
    name: "穆氏宴会",
    description: "穆氏家族的宴会上，宾客云集，博城各界有头有脸的人物都来了。",
    trigger: "exploring",
    chance: 0.5,
    conditions: { location: "mu_manor", action: "attend_banquet" },
    choices: [
      {
        text: "品尝美食",
        effects: { stamina: 20, happiness: 10 },
        resultText: "穆氏的宴会美食丰盛，你大快朵颐，体力恢复了不少。"
      },
      {
        text: "听宾客议论",
        effects: { exp: 10, intelligence: 5 },
        resultText: "你听到宾客们议论纷纷，大多在说宇昂的天才和莫凡的不自量力。还有人提到地圣泉和博城势力之争。"
      }
    ]
  },
  event_meet_important_people: {
    id: "event_meet_important_people",
    name: "结识大人物",
    description: "宴会上你遇到了几位博城的重要人物。",
    trigger: "exploring",
    chance: 0.4,
    conditions: { location: "mu_manor", action: "attend_banquet" },
    choices: [
      {
        text: "与朱校长交谈",
        effects: { reputation_tianlan_school: 15, exp: 15 },
        resultText: "朱校长勉励了你几句，让你好好表现，不管输赢，学校都是你坚强的后盾。"
      },
      {
        text: "与斩空总教官交谈",
        effects: { reputation_military: 10, exp: 20 },
        resultText: "斩空拍着你的肩膀说，好小子，有骨气！输了也没关系，大不了到我部队来，我罩着你！"
      },
      {
        text: "与杨作河法师交谈",
        effects: { reputation_magic_association: 10, exp: 15 },
        resultText: "杨作河法师对你的雷系天赋很欣赏，说以后有机会可以到魔法协会坐坐。"
      }
    ]
  },
  event_earth_spring_cultivation: {
    id: "event_earth_spring_cultivation",
    name: "地圣泉修炼",
    description: "你进入了博城地圣泉，一股温暖而强大的能量包裹着你，星尘在快速滋养成长。",
    trigger: "exploring",
    chance: 0.8,
    conditions: { location: "mu_manor", action: "earth_spring" },
    choices: [
      {
        text: "全力冥修",
        effects: { exp: 100, mp: 50, stamina: -30 },
        resultText: "你在地圣泉中全力冥修，星尘以惊人的速度增长着，星子也变得更加明亮。这种修炼速度简直是坐火箭！"
      },
      {
        text: "感悟星子",
        effects: { exp: 60, intelligence: 10, stamina: -15 },
        resultText: "你感悟着星子的变化，对地圣泉的能量有了更深的理解。你的魔法控制力提升了。"
      }
    ]
  },
  event_natural_double_element: {
    id: "event_natural_double_element",
    name: "天生双系",
    description: "你在修炼中突然发现，自己的精神世界中竟然有两团星尘！一团是你觉醒的元素，另一团...竟然也是元素星尘！你是传说中的天生双系！",
    trigger: "level_up",
    chance: 0.05,
    conditions: { level: 3 },
    choices: [
      {
        text: "这是真的吗？",
        effects: { awakenElement: "random", exp: 50 },
        resultText: "你仔细感知，确实是两团星尘！天生双系，这是万里挑一的天赋！你又觉醒了一个新的元素系！"
      },
      {
        text: "先保密，低调发育",
        effects: { awakenElement: "random", exp: 80, intelligence: 5 },
        resultText: "你决定先不告诉任何人，低调发育。多一个系就多一张底牌，关键时刻可以一鸣惊人！"
      }
    ]
  },
  event_factions_compete: {
    id: "event_factions_compete",
    name: "众势力争抢",
    description: "你展现出惊人的天赋后，博城各大势力纷纷向你抛出橄榄枝。军部、魔法协会、猎者联盟...都想拉拢你。",
    trigger: "exploring",
    chance: 0.1,
    conditions: { level: 5 },
    choices: [
      {
        text: "军部开出的条件最好",
        effects: { reputation_military: 20, reputation_magic_association: -5, gold: 200 },
        resultText: "你表示对军部更感兴趣。斩空总教官非常高兴，当场给了你一笔军饷作为见面礼。"
      },
      {
        text: "魔法协会资源更多",
        effects: { reputation_magic_association: 20, reputation_military: -5, gold: 150 },
        resultText: "你选择了魔法协会。杨作河法师很高兴，给了你一些魔法材料。"
      },
      {
        text: "暂时不加入任何势力",
        effects: { reputation_tianlan_school: 10, exp: 30 },
        resultText: "你决定先专注学业，不急于加入任何势力。朱校长对你的稳重很欣赏。"
      }
    ]
  },
  event_blue_alert: {
    id: "event_blue_alert",
    name: "蓝色警戒",
    description: "你在雪峰山驿站时，突然看到远处升起两道光耀。这是军部的警戒信号——蓝色警戒！北面有异常情况。",
    trigger: "exploring",
    chance: 0.15,
    conditions: { location: "xuefeng_station" },
    choices: [
      {
        text: "去问问怎么回事",
        effects: { exp: 20, intelligence: 5 },
        resultText: "你向守卫询问，得知北面发现了异常的橙色雾气和妖魔活动迹象。万断风军长已经拉响了蓝色警戒。"
      },
      {
        text: "赶紧离开这里",
        effects: { stamina: -10 },
        resultText: "你感觉情况不对，赶紧离开了驿站。安全第一，还是不要冒险的好。"
      }
    ]
  },
  event_strange_rain: {
    id: "event_strange_rain",
    name: "奇怪的雨",
    description: "天空突然下起了大雨，但这雨的颜色很奇怪，呈现出一种浑浊的橙黄色。老猎人们说，他们从来没见过这样的雨。",
    trigger: "exploring",
    chance: 0.1,
    conditions: { location: "xuefeng_mountain" },
    choices: [
      {
        text: "躲雨，观察情况",
        effects: { exp: 15, intelligence: 3 },
        resultText: "你找了个地方躲雨，仔细观察这奇怪的雨。雨水落在地上，似乎让周围的植物都变得有些异常..."
      },
      {
        text: "冒雨继续探索",
        effects: { hp: -15, exp: 25 },
        resultText: "你冒雨继续探索，虽然淋了雨受了点寒，但发现了一些平时看不到的异常现象。"
      }
    ]
  },
  event_earth_spring_anomaly: {
    id: "event_earth_spring_anomaly",
    name: "地圣泉异常",
    description: "你在地圣泉修炼时，林雨欣副卫长匆匆走来，神色凝重。她告诉你，她在地下通道发现了一些与地圣泉非常相似的水，但似乎被污染了。",
    trigger: "exploring",
    chance: 0.3,
    conditions: { location: "earth_spring" },
    choices: [
      {
        text: "详细询问情况",
        effects: { intelligence: 8, reputation_magic_association: 5 },
        resultText: "林雨欣告诉你，那些污水会让生物变得疯狂，失去理智。她怀疑一年前她妹妹的失踪和这有关。"
      },
      {
        text: "表示愿意帮忙调查",
        effects: { opinion_lin_yuxin: 10, exp: 30 },
        resultText: "你表示愿意帮忙调查。林雨欣有些意外，但还是感谢了你的好意。她说如果有线索会通知你。"
      }
    ]
  },
  event_blood_alert: {
    id: "event_blood_alert",
    name: "血色警戒！",
    description: "突然，全城的警报声响起，凄厉而刺耳。天空中出现了诡异的橙色雨雾，远处传来阵阵妖魔的咆哮声。血色警戒——博城历史上最恐怖的灾难降临了！",
    trigger: "exploring",
    chance: 0.05,
    conditions: { level: 5 },
    choices: [
      {
        text: "赶紧往安全区跑！",
        effects: { stamina: -30, hp: -20 },
        resultText: "你拼命往安全区方向跑，路上看到了无数逃难的人群。妖魔的咆哮声越来越近，你必须加快速度！"
      },
      {
        text: "找地方躲起来",
        effects: { stamina: -10, exp: 10 },
        resultText: "你找了个隐蔽的地方躲了起来。透过缝隙，你看到成群的妖魔在街上肆虐，心中充满了恐惧和无力感。"
      }
    ]
  },
  event_demon_attack_school: {
    id: "event_demon_attack_school",
    name: "学校遇袭",
    description: "你正在天澜魔法高中，突然后山传来阵阵嘶吼。一群独眼魔狼冲了进来，学校陷入了混乱！",
    trigger: "exploring",
    chance: 0.1,
    conditions: { location: "tianlan_school", flag: "blood_alert_started" },
    choices: [
      {
        text: "加入战斗，保护同学",
        effects: { hp: -30, exp: 100, reputation_tianlan_school: 20 },
        resultText: "你勇敢地加入了战斗，和老师同学们一起抵御妖魔。虽然受了伤，但你保护了很多同学，赢得了大家的尊敬！"
      },
      {
        text: "跟着大部队撤离",
        effects: { stamina: -20, exp: 30 },
        resultText: "你跟着大部队一起撤离，一路上看到了很多可怕的景象。虽然安全了，但心里充满了对死者的惋惜。"
      }
    ]
  },
  event_earth_spring_attack: {
    id: "event_earth_spring_attack",
    name: "地圣泉被袭",
    description: "你在地圣泉修炼时，突然地厅传来剧烈的震动和惨叫声。一只浑身血纹的巨型魔鼠冲了进来，守卫们几乎全灭！",
    trigger: "exploring",
    chance: 0.2,
    conditions: { location: "earth_spring" },
    choices: [
      {
        text: "跟着林雨欣从密道逃",
        effects: { stamina: -25, hp: -15, exp: 80 },
        resultText: "林雨欣副卫长果断地打开了密道，带着你逃离了地圣泉。她把地圣泉交给了你保管，希望你能安全带走。"
      },
      {
        text: "留下来帮忙战斗",
        effects: { hp: -60, exp: 200, reputation_magic_association: 15 },
        resultText: "你留下来和守卫们一起战斗，但血纹巨魔鼠太强了！你受了重伤，幸好林雨欣及时把你拉进了密道。"
      }
    ]
  },
  event_vanguard_team: {
    id: "event_vanguard_team",
    name: "先锋小队",
    description: "学校决定撤离到安全结界区，需要一支先锋小队探路。薛木生老师希望你能加入，你是学生中战斗力最强的之一。",
    trigger: "exploring",
    chance: 0.15,
    conditions: { location: "tianlan_school", flag: "blood_alert_started" },
    choices: [
      {
        text: "加入先锋小队",
        effects: { exp: 150, reputation_tianlan_school: 30, stamina: -20 },
        resultText: "你加入了先锋小队，负责探路和清除沿途的妖魔。这是一条危险的道路，但你知道这是拯救大家的唯一办法。"
      },
      {
        text: "还是跟着大部队安全",
        effects: { exp: 50, stamina: -10 },
        resultText: "你选择跟着大部队一起走。虽然人多更安全，但目标也更大，更容易吸引妖魔群..."
      }
    ]
  },
  event_encounter_commander_demon: {
    id: "event_encounter_commander_demon",
    name: "遭遇战将级妖魔",
    description: "你正在撤离途中，突然感受到一股令人窒息的压迫感。一只体型巨大的三眼魔狼从楼房后面走了出来，它的高度甚至超过了三层楼！",
    trigger: "exploring",
    chance: 0.08,
    conditions: { level: 6, flag: "blood_alert_started" },
    choices: [
      {
        text: "屏住呼吸，躲起来",
        effects: { stamina: -15, exp: 50 },
        resultText: "你赶紧躲到墙角，屏住呼吸。战将级妖魔的感知力很强，幸好一股垃圾的臭味掩盖了你的气味。它慢慢走远了..."
      },
      {
        text: "绕路赶紧跑",
        effects: { stamina: -30, hp: -10, exp: 80 },
        resultText: "你小心翼翼地绕路逃跑，心脏狂跳不止。战将级妖魔的实力远超你的想象，这就是真正的灾难吗？"
      }
    ]
  },
  event_black_church: {
    id: "event_black_church",
    name: "黑教廷的阴谋",
    description: "你从林雨欣那里得知，这场灾难不是偶然，是黑教廷策划的！他们用暴躁之泉激怒了魔狼种群，让它们疯狂进攻博城。",
    trigger: "exploring",
    chance: 0.1,
    conditions: { flag: "earth_spring_escaped" },
    choices: [
      {
        text: "黑教廷？他们为什么要这么做？",
        effects: { intelligence: 10, exp: 50 },
        resultText: "林雨欣告诉你，黑教廷是一个邪恶的组织，他们崇拜黑暗，想要摧毁人类文明。这场灾难只是他们计划的一部分..."
      },
      {
        text: "我一定要阻止他们",
        effects: { exp: 80, willpower: 5 },
        resultText: "你握紧了拳头，心中燃起了怒火。虽然你现在还很弱，但你发誓，一定要变得更强，阻止黑教廷的阴谋！"
      }
    ]
  },
  event_wandering_merchant: {
    id: "event_wandering_merchant",
    name: "游商",
    description: "你在街上遇到了一个背着大包的游商，他神秘兮兮地向你招手。",
    trigger: "exploring",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "看看他卖什么（花50金买神秘药水）",
        effects: { gold: -50, items: { super_health_potion: 1 } },
        resultText: "你花50金买了一瓶泛着红光的药水，游商笑着消失在人群中。你仔细一看，竟然是一瓶超级生命药水！"
      },
      {
        text: "买一个神秘盒子（花30金）",
        effects: { gold: -30, items: { health_potion: 2 } },
        resultText: "你打开盒子，里面是两瓶生命药水。虽然不是什么宝贝，但也算物有所值。"
      },
      {
        text: "不感兴趣，离开",
        effects: {},
        resultText: "你摆摆手走开了，游商在身后喊着'下次再来啊！'"
      }
    ]
  },
  event_lost_child: {
    id: "event_lost_child",
    name: "迷路的孩子",
    description: "一个小孩在街角哭泣，说找不到妈妈了。",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: true,
    choices: [
      {
        text: "帮他找妈妈",
        effects: { exp: 30, reputation: { tianlan_school: 5 } },
        resultText: "你带着小孩四处打听，终于在市场找到了焦急的母亲。她感激涕零，连连向你道谢。周围的人也向你投来赞许的目光。"
      },
      {
        text: "给他一些钱让他自己找",
        effects: { gold: -10, exp: 10 },
        resultText: "你给了小孩10个铜币，告诉他去找卫兵。小孩擦干眼泪跑开了，希望他能找到家人。"
      },
      {
        text: "假装没看见",
        effects: { reputation: { tianlan_school: -3 } },
        resultText: "你绕过小孩走了过去，但心里总觉得不太舒服..."
      }
    ]
  },
  event_magic_insight: {
    id: "event_magic_insight",
    name: "魔法顿悟",
    description: "你在冥想时突然对魔法有了更深的理解。",
    trigger: "training",
    chance: 0.05,
    conditions: [{ type: "level", value: 3, operator: ">=" }],
    once: false,
    choices: [
      {
        text: "深入感悟（消耗20MP）",
        effects: { mp: -20, exp: 80 },
        resultText: "你沉浸在魔法的感悟中，对星子的连接有了新的认识，获得了大量经验！"
      },
      {
        text: "记录下来",
        effects: { exp: 30 },
        resultText: "你把感悟记在笔记本上，虽然没有完全领悟，但也有所收获。"
      }
    ]
  },
  event_street_duel: {
    id: "event_street_duel",
    name: "街头切磋",
    description: "一个同校的学生拦住你，想和你切磋一下魔法。",
    trigger: "exploring",
    chance: 0.06,
    conditions: [{ type: "level", value: 2, operator: ">=" }],
    once: false,
    choices: [
      {
        text: "接受切磋（进入战斗）",
        effects: { startBattle: "student_rival" },
        resultText: ""
      },
      {
        text: "婉拒",
        effects: {},
        resultText: "你以修炼为由婉拒了，对方有些失望但也没有勉强。"
      }
    ]
  },
  event_hidden_herb: {
    id: "event_hidden_herb",
    name: "隐秘药草",
    description: "你在山壁的缝隙中发现了一株少见的药草。",
    trigger: "exploring",
    chance: 0.12,
    conditions: [],
    once: false,
    choices: [
      {
        text: "小心采摘",
        effects: { items: { magic_herb: 2 }, exp: 15 },
        resultText: "你小心翼翼地采下了药草，这在魔法商店能卖个好价钱。"
      },
      {
        text: "继续探索",
        effects: { exp: 10 },
        resultText: "你记下了位置，继续深入探索。"
      }
    ]
  },
  event_merchant_caravan: {
    id: "event_merchant_caravan",
    name: "商队路过",
    description: "一支从其他城市来的商队路过，他们有一些稀有物品出售。",
    trigger: "exploring",
    chance: 0.08,
    conditions: [],
    once: false,
    choices: [
      {
        text: "购买魔法水晶（80金）",
        effects: { gold: -80, items: { magic_crystal: 1 } },
        resultText: "你花80金币买下了一颗魔法水晶，这东西在修炼时能派上大用场。",
        condition: { type: "gold", value: 80, operator: ">=" }
      },
      {
        text: "购买超级血瓶（50金）",
        effects: { gold: -50, items: { super_health_potion: 1 } },
        resultText: "你花50金币买了一瓶超级血瓶，关键时刻能救命。",
        condition: { type: "gold", value: 50, operator: ">=" }
      },
      {
        text: "只是聊聊",
        effects: { exp: 10 },
        resultText: "你和商队的人聊了聊外面的世界，开阔了眼界。"
      }
    ]
  },
  event_starlight_blessing: {
    id: "event_starlight_blessing",
    name: "星光祝福",
    description: "夜晚修炼时，你感觉星空中的星子似乎在回应你的召唤，魔法能量异常活跃。",
    trigger: "training",
    chance: 0.08,
    conditions: [{ type: "time", value: "night", operator: "==" }],
    once: false,
    choices: [
      {
        text: "趁此机会全力修炼",
        effects: { exp: 80, mp: -30 },
        resultText: "你借助星光之力全力修炼，星子连接速度大幅提升，获得了大量经验！"
      },
      {
        text: "静心感悟",
        effects: { exp: 40, mp: 20 },
        resultText: "你静下心来感受星子的律动，魔法修为稳步提升。"
      }
    ]
  },
  event_demon_trap: {
    id: "event_demon_trap",
    name: "妖魔陷阱",
    description: "你发现地上有一些奇怪的痕迹，似乎是妖魔留下的...",
    trigger: "exploring",
    chance: 0.1,
    conditions: [{ type: "level", value: 3, operator: ">=" }],
    once: false,
    choices: [
      {
        text: "追踪痕迹",
        effects: { battle: "demon_wolf" },
        resultText: "你沿着痕迹追踪，果然发现了一只妖魔！"
      },
      {
        text: "绕道而行",
        effects: { exp: 5 },
        resultText: "你谨慎地选择绕道，避免了不必要的战斗。"
      }
    ]
  },
  event_old_mage_advice: {
    id: "event_old_mage_advice",
    name: "老法师指点",
    description: "一位路过的老法师注意到了你的修炼方式，停下来给你一些指点。",
    trigger: "training",
    chance: 0.06,
    conditions: [],
    once: false,
    choices: [
      {
        text: "虚心请教",
        effects: { exp: 60, items: { star_map_scroll: 1 } },
        resultText: "老法师给你讲解了星图的奥秘，还送了你一张星图卷轴。你的魔法理解更上一层楼！"
      },
      {
        text: "礼貌道谢",
        effects: { exp: 25 },
        resultText: "你礼貌地向老法师道谢，他的几句话让你茅塞顿开。"
      }
    ]
  },
  event_tang_yue_roof: {
    id: "event_tang_yue_roof",
    name: "天台上的身影",
    description: "你在学校天台附近散步时，看到一个熟悉的身影……",
    trigger: "exploring",
    chance: 0.08,
    conditions: [
      { type: "location", value: "tianlan_school", operator: "==" },
      { type: "day", value: 15, operator: ">=" },
      { type: "flag", value: "saw_tang_yue_roof", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "悄悄靠近看看",
        effects: { setFlag: "saw_tang_yue_roof" },
        resultText: "你悄悄靠近，看到唐月老师站在天台边缘，手里拿着一枚传讯石在低声说话。她的表情前所未有的严肃，和平时温柔的样子判若两人。\n\n'……我知道了。继续监视，不要打草惊蛇。'\n\n她似乎察觉到了什么，突然回头。你赶紧躲到墙后，心跳加速。\n\n（你获得了一条信息碎片：唐月似乎在调查什么……）"
      },
      {
        text: "装作没看到离开",
        effects: {},
        resultText: "你觉得不该打扰老师的私事，默默离开了。"
      }
    ]
  },
  event_demon_migration: {
    id: "event_demon_migration",
    name: "异常迁徙",
    description: "你注意到雪峰山的妖魔行为有些反常……",
    trigger: "exploring",
    chance: 0.12,
    conditions: [
      { type: "location", value: "xuefeng_mountain", operator: "==" },
      { type: "day", value: 20, operator: ">=" },
      { type: "flag", value: "witnessed_demon_migration", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "仔细观察",
        effects: { setFlag: "witnessed_demon_migration", giveInfo: "demon_migration_anomaly" },
        resultText: "你躲在岩石后观察，发现成群的妖魔正从深山方向往外逃窜。它们不是在觅食，而是在……逃跑？\n\n更奇怪的是，这些妖魔身上似乎有黑色的纹路在蠕动，像是被什么东西感染了。\n\n一只独眼魔狼跑过你藏身的岩石旁，它的眼睛是血红色的，完全没有寻常妖魔的凶性——只有恐惧。\n\n（你获得了信息碎片：妖魔在逃离什么东西……）"
      },
      {
        text: "赶紧离开",
        effects: {},
        resultText: "你感到一阵不安，决定立刻离开这个地方。"
      }
    ]
  },
  event_ancient_cave: {
    id: "event_ancient_cave",
    name: "隐秘山洞",
    description: "你在雪峰山的岩壁上发现了一个被藤蔓遮掩的洞口……",
    trigger: "exploring",
    chance: 0.05,
    conditions: [
      { type: "location", value: "xuefeng_mountain", operator: "==" },
      { type: "level", value: 4, operator: ">=" },
      { type: "flag", value: "found_ancient_cave", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "进去探索",
        effects: { setFlag: "found_ancient_cave", giveInfo: "ancient_cave_runes", exp: 80 },
        resultText: "你小心翼翼地钻进山洞。洞内出乎意料地干燥，墙壁上刻满了古老的符文，在火把的映照下泛着微弱的蓝光。\n\n这些符文……你在课本上见过类似的，那是至少数百年前的魔法文明遗迹！\n\n在洞穴最深处，你发现了一枚散发着寒气的晶石碎片。当你触碰它时，脑海中闪过一个画面——一座巨大的地下宫殿，以及……一个被锁链缠绕的古老存在。\n\n画面转瞬即逝，晶石碎片化作粉末消散。你带着满腹疑惑离开了山洞。\n\n（获得经验80，信息碎片：雪峰山下似乎有什么古老的东西……）"
      },
      {
        text: "太危险了，不进",
        effects: {},
        resultText: "你看了看黑漆漆的洞口，决定不冒这个险。"
      }
    ]
  },
  event_wounded_demon: {
    id: "event_wounded_demon",
    name: "受伤的妖魔",
    description: "你发现了一只受伤的小妖魔，它看起来毫无威胁……",
    trigger: "exploring",
    chance: 0.08,
    conditions: [
      { type: "location", value: "xuefeng_mountain", operator: "==" },
      { type: "flag", value: "spared_wounded_demon", operator: "!=" },
      { type: "flag", value: "killed_wounded_demon", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "放它一条生路",
        effects: { setFlag: "spared_wounded_demon", exp: 30 },
        resultText: "你看着这只受伤的小妖魔，它发出呜咽声，不像是凶恶的怪物，倒像是一只受伤的小狗。\n\n你收起武器，退开一步。它看了你一眼，一瘸一拐地逃进了树林。\n\n（你放过了这只妖魔。也许以后还会再见……）"
      },
      {
        text: "杀了它，以防万一",
        effects: { setFlag: "killed_wounded_demon", exp: 20, gold: 15 },
        resultText: "你举起法杖，一道魔法击中了它。小妖魔倒在地上，抽搐了几下便不动了。\n\n从它身上你找到了一枚劣质的魔核，能卖几个钱。\n\n（你选择了斩草除根。）"
      },
      {
        text: "用治愈魔法帮它",
        effects: { setFlag: "helped_wounded_demon", mp: -15, exp: 50 },
        resultText: "你犹豫了一下，还是用治愈魔法为它处理了伤口。光芒闪过，它的伤口以肉眼可见的速度愈合。\n\n它抬头看了你一眼，那双眼睛里竟然流露出……感激？\n\n它叼起一块发光的石头放在你脚边，然后跑进了树林深处。\n\n（获得了一块神秘的石头，消耗15MP。这只妖魔似乎记住了你。）"
      }
    ]
  },
  event_mu_he_stranger: {
    id: "event_mu_he_stranger",
    name: "校董的密会",
    description: "你在学校走廊的拐角处看到了不该看到的一幕……",
    trigger: "exploring",
    chance: 0.06,
    conditions: [
      { type: "location", value: "tianlan_school", operator: "==" },
      { type: "day", value: 30, operator: ">=" },
      { type: "flag", value: "saw_mu_he_stranger", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "躲起来偷听",
        effects: { setFlag: "saw_mu_he_stranger", giveInfo: "mu_he_gray_clothes_meeting" },
        resultText: "你躲在柱子后面，看到穆贺校董正和一个穿灰衣的人低声交谈。那人的脸藏在兜帽里，看不清面容。\n\n'……结界的节点已经摸清了。'穆贺的声音压得很低。\n\n'主教大人说了，时候到了自然会通知你。'灰衣人的声音沙哑难听。\n\n'我知道了。但那个斩空……他不太好对付。'\n\n'放心，会有人处理他的。'\n\n他们察觉到了什么，突然分开。你赶紧溜走，心跳如鼓。\n\n（你获得了重要信息：穆贺和可疑人物有勾结，他们在计划什么……）"
      },
      {
        text: "假装没看到",
        effects: {},
        resultText: "你觉得不该偷听别人的私事，转身离开了。"
      }
    ]
  },
  event_eve_of_disaster: {
    id: "event_eve_of_disaster",
    name: "不安的夜晚",
    description: "今夜的博城异常安静，安静得让人不安……",
    trigger: "exploring",
    chance: 0.3,
    conditions: [
      { type: "day", value: 42, operator: ">=" },
      { type: "day", value: 45, operator: "<" },
      { type: "flag", value: "eve_of_disaster_witnessed", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "仔细观察周围",
        effects: { setFlag: "eve_of_disaster_witnessed", giveInfo: "calm_before_storm" },
        resultText: "你站在街头，发现今夜的博城异常诡异。\n\n天空是暗红色的，没有星星。连虫鸣都消失了，仿佛整个城市都在屏住呼吸。\n\n街角的狗在狂吠，却不敢往前走一步。几只老鼠从下水道里跑出来，疯狂地向城外逃窜。\n\n远处雪峰山的方向，有黑色的雾气在升腾。\n\n你的心跳加速，一种不祥的预感笼罩着你。\n\n（有什么大事要发生了……）"
      },
      {
        text: "回家睡觉",
        effects: {},
        resultText: "你摇摇头，觉得自己想多了，回家休息了。"
      }
    ]
  },
  event_after_disaster_survivor: {
    id: "event_after_disaster_survivor",
    name: "废墟中的呼救",
    description: "博城灾难后，你在废墟中听到了微弱的呼救声……",
    trigger: "exploring",
    chance: 0.25,
    conditions: [
      { type: "flag", value: "bocheng_disaster_happened", operator: "==" },
      { type: "flag", value: "rescued_survivor", operator: "!=" },
      { type: "flag", value: "ignored_survivor", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "立刻去救人",
        effects: { setFlag: "rescued_survivor", exp: 100, reputation: { city: 15 } },
        resultText: "你循着声音跑过去，在倒塌的房屋下发现了一个被困的小女孩。你用魔法移开碎石，将她救了出来。\n\n'谢谢……谢谢你……'她哭着说。\n\n你把她送到了临时救助站。医生说如果再晚一会儿，她可能就撑不住了。\n\n（你救了一条生命，获得100经验和城市声望。）"
      },
      {
        text: "我自己都难保，走吧",
        effects: { setFlag: "ignored_survivor" },
        resultText: "你犹豫了一下，但看着周围还在燃烧的废墟和远处妖魔的嚎叫，你选择了自保。\n\n你转身离开，呼救声渐渐微弱，最终消失了。\n\n（你选择了活下去。但那个声音，也许会留在你心里很久。）"
      }
    ]
  },
  event_black_church_mark: {
    id: "event_black_church_mark",
    name: "黑色印记",
    description: "灾难后的废墟中，你发现了一个奇怪的符号……",
    trigger: "exploring",
    chance: 0.15,
    conditions: [
      { type: "flag", value: "bocheng_disaster_happened", operator: "==" },
      { type: "flag", value: "found_black_church_mark", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "仔细查看",
        effects: { setFlag: "found_black_church_mark", giveInfo: "black_church_symbol" },
        resultText: "在一面断墙上，你发现了一个用黑色颜料画的符号——一只扭曲的眼睛，瞳孔是倒十字。\n\n符号周围的墙壁被灼烧过，散发着恶臭。你注意到符号下方还有一行小字，但已经模糊不清。\n\n你想起唐月老师曾提过的一个名字……黑教廷。\n\n这不是普通的妖魔袭击。这是一场有预谋的入侵。\n\n（你获得了重要信息：黑教廷的印记。）"
      },
      {
        text: "没什么特别的",
        effects: {},
        resultText: "你看了一眼那个奇怪的涂鸦，没在意，继续前行。"
      }
    ]
  },
  event_earth_spring_depths: {
    id: "event_earth_spring_depths",
    name: "泉底低语",
    description: "在地圣泉冥想时，你听到了来自深处的声音……",
    trigger: "exploring",
    chance: 0.1,
    conditions: [
      { type: "location", value: "earth_spring", operator: "==" },
      { type: "level", value: 8, operator: ">=" },
      { type: "flag", value: "heard_spring_whisper", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "凝神细听",
        effects: { setFlag: "heard_spring_whisper", giveInfo: "ancient_presence_below", mp: -30 },
        resultText: "你闭上眼睛，将精神力延伸到泉水深处。灵泉的水流声渐渐远去，取而代之的是……心跳声。\n\n不是你的心跳。是来自地下极深处的、缓慢而沉重的心跳。\n\n咚……咚……\n\n伴随着心跳，一个古老而威严的声音在你脑海中响起，不是用语言，而是直接灌入你的意识：\n\n'……谁……扰我长眠……'\n\n你猛地睁开眼，浑身冷汗。灵泉依旧平静地流淌，仿佛什么都没发生。\n\n但你知道，地圣泉下面，沉睡着什么东西。\n\n（消耗30MP，获得信息碎片：泉底的古老存在。）"
      },
      {
        text: "太过诡异，停止冥想",
        effects: {},
        resultText: "你感到一阵莫名的恐惧，立刻停止了冥想，离开了泉边。"
      }
    ]
  },
  event_farewell_bocheng: {
    id: "event_farewell_bocheng",
    name: "告别博城",
    description: "你即将离开博城前往明珠学府，最后看一眼这座城市……",
    trigger: "exploring",
    chance: 0.5,
    conditions: [
      { type: "quest", value: "quest_journey_to_mingzhu", operator: "==" },
      { type: "flag", value: "bade_farewell_bocheng", operator: "!=" }
    ],
    once: true,
    choices: [
      {
        text: "去学校告别",
        effects: { setFlag: "bade_farewell_bocheng", exp: 50 },
        resultText: "你来到天澜高中。学校正在重建，唐月老师在临时教室里整理资料。\n\n'要走了吗？'她微笑着，但眼底有一丝不舍。'去吧，明珠学府是更大的舞台。'\n\n张小侯拍着你的肩膀：'到了明珠别忘了我们！等我毕业了也去考！'\n\n你环顾熟悉的校园，深吸一口气，转身离开。\n\n博城，这座承载了你法师之路起点的城市，你会回来的。"
      },
      {
        text: "直接出发",
        effects: { setFlag: "left_without_farewell" },
        resultText: "你选择不告而别。背着行囊，你最后看了一眼博城的方向，踏上了前往上海的列车。\n\n也许有些遗憾，但前方有更广阔的世界在等你。"
      }
    ]
  },

  // ========== 中阶突破·第二系觉醒 ==========
  event_second_awakening: {
    id: "event_second_awakening",
    name: "中阶突破·第二系觉醒",
    description: "你的精神力达到了中阶门槛，感知到了第二个元素系的召唤",
    trigger: "training",
    chance: 0.8,
    conditions: [
      { type: "level", value: 10, operator: ">=" },
      { type: "elementCount", value: 1, operator: "==" }
    ],
    once: true,
    text: "修炼中，你忽然感到精神世界一阵剧烈的震荡！\n\n原本稳固的星子之海开始翻涌，一股全新的力量从灵魂深处苏醒——你的精神力已经突破了初阶的界限，达到了中阶法师的门槛！\n\n在中阶，法师可以觉醒第二个元素系。这是每个法师修行路上的重要里程碑。\n\n你静下心来，感知着在精神世界中若隐若现的各系星尘……",
    choices: [
      {
        text: "前往魔法协会进行第二系觉醒",
        effects: {
          setFlag: "second_awakening_ready",
          exp: 200
        },
        resultText: "你睁开眼，感受着体内涌动的全新力量。是时候去魔法协会，正式觉醒你的第二个元素系了！\n\n💡 提示：在角色面板点击「觉醒新系」按钮，选择你的第二系。"
      }
    ]
  },

  // ========== 第二系觉醒后的感悟 ==========
  event_second_element_insight: {
    id: "event_second_element_insight",
    name: "新系感悟",
    description: "觉醒第二系后对魔法的新理解",
    trigger: "training",
    chance: 0.5,
    conditions: [
      { type: "level", value: 10, operator: ">=" },
      { type: "elementCount", value: 2, operator: ">=" },
      { type: "flag", value: "second_awakening_ready", operator: "==" }
    ],
    once: true,
    text: "修炼中，你尝试同时调动两个系的星子。\n\n初阶时你只能感知一系的星尘，但现在，两系的星子在精神世界中交相辉映。它们各自运转，却又隐隐有一种奇妙的共鸣。\n\n唐月老师曾说过，双系法师的优势在于变化——敌人永远猜不到你的第二张底牌。\n\n你想起了莫凡……那个据说觉醒了雷火双系的天才。他现在，又走到了哪一步？",
    choices: [
      {
        text: "继续修炼",
        effects: { exp: 100 },
        resultText: "你对双系的运用有了更深的理解。"
      }
    ]
  },

  // ========== 灵种发现 ==========
  event_spirit_seed_discovery: {
    id: "event_spirit_seed_discovery",
    name: "灵种共鸣",
    description: "在修炼中感知到了灵种的气息",
    trigger: "training",
    chance: 0.08,
    conditions: [
      { type: "level", value: 5, operator: ">=" }
    ],
    once: false,
    text: "修炼中，你忽然感到精神世界一阵悸动——远处的某个方向，有一股纯净的元素力量在召唤你。\n\n那是……灵种？\n\n你听说过，天地间自然孕育的元素种子，蕴含着强大的力量。法师如果能找到并炼化灵种，魔法威力会大幅提升。\n\n但灵种通常诞生在元素浓郁之地，而且……往往有强大的妖魔守护。",
    choices: [
      {
        text: "循感应而去",
        effects: {
          hp: -20,
          items: [{ itemId: "fire_spirit_seed", count: 1 }]
        },
        resultText: "你循着感应来到雪峰山深处，在一处熔岩裂隙中找到了一颗散发着灼热气息的红色晶石——灵种！\n\n守护灵种的是一只中级火系妖魔，你经过一番苦战才将它击退，带着灵种返回。\n\n💡 获得了灵种！在背包中使用可以炼化，大幅提升魔法威力。"
      },
      {
        text: "实力不够，先记下位置",
        effects: {
          exp: 30,
          setFlag: "spirit_seed_location_known"
        },
        resultText: "你记下了灵种的大致方位。等实力更强时再来寻找吧。灵种……不会轻易消失。"
      }
    ]
  },

  // ========== 明珠篇事件 ==========

  // 唐月揭露审判会身份
  event_tang_yue_reveal: {
    id: "event_tang_yue_reveal",
    name: "唐月的身份",
    description: "唐月揭露自己是审判会成员",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "level", value: 10, operator: ">=" },
      { type: "flag", value: "bocheng_disaster_happened", operator: "==" },
      { type: "flag", value: "tang_yue_identity_revealed", operator: "!=" }
    ],
    once: true,
    text: "你在西博安置区收到唐月老师的传讯。\n\n\"来杭州戏水镇一趟。我有些事要告诉你。\"\n\n你赶到戏水镇，发现这里到处龟裂，水源干涸。唐月在\"有间客栈\"等你，她的气质和以前不同了——不再是那个温柔的实习老师，而是一个带着凌厉气息的执法者。\n\n\"我是审判会的人，\"她平静地说，\"在博城那几年，我是卧底，调查黑教廷。\"\n\n她告诉你博城灾难的真相——黑教廷策划了十年，撒朗亲自出手。而戏水镇的水源干涸，是因为有火系灵种自然形成，引来多方势力争夺。\n\n\"帮我这次，我帮你觉醒暗影系。\"",
    choices: [
      {
        text: "我答应你",
        effects: {
          setFlag: "tang_yue_identity_revealed",
          giveInfo: "tang_yue_judgment_member",
          exp: 200
        },
        resultText: "唐月微微点头：\"跟我来。记住，从现在起，你看到的一切都不能外传。\""
      }
    ]
  },

  // 灵种争夺·玫炎
  event_spirit_seed_meiyan: {
    id: "event_spirit_seed_meiyan",
    name: "玫炎灵种",
    description: "戏水镇灵种争夺事件",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "tang_yue_identity_revealed", operator: "==" },
      { type: "flag", value: "meiyan_obtained", operator: "!=" }
    ],
    once: true,
    text: "溪水源头，两拨人正在激战——猎法师队伍和东方世家的人为了灵种大打出手。\n\n唐月用遁影带你隐藏在暗处观察。战斗结束后，一个额头上有烙铁烙印的男人出现了——朝赫，审判会通缉的死刑犯，咒法系法师。\n\n他用邪蛛之阱控制了所有人，潜入水库底部取出灵种。那是一枚遍体嫣红的火焰灵种——玫炎，地火中最纯净的存在。\n\n唐月出手了！巨影钉钉住朝赫的影子，但朝赫拼死反抗。激战中，唐月向你使了个眼色。\n\n你暗中引导雷系星图——霹雳·轰顶！\n\n雷系中阶最暴力的魔法，一道晴天霹雳贯穿朝赫。他甚至没来得及惨叫，就被雷电解体。\n\n\"去炼化玫炎，\"唐月喘息着说，\"它是你的了。\"",
    choices: [
      {
        text: "炼化玫炎",
        effects: {
          setFlag: "meiyan_obtained",
          giveInfo: "meiyan_spirit_seed",
          items: [{ itemId: "fire_spirit_seed", count: 1 }],
          exp: 500
        },
        resultText: "你触碰玫炎，那枚嫣红色的火焰灵种像有生命般跳动了一下，随即融入你的身体。\n\n你的火系魔法从此将带有玫炎的力量——温度更高，灼烧更强。"
      }
    ]
  },

  // 暗影系觉醒
  event_shadow_awakening: {
    id: "event_shadow_awakening",
    name: "暗影觉醒",
    description: "唐月帮你觉醒暗影系",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "meiyan_obtained", operator: "==" },
      { type: "flag", value: "shadow_awakened", operator: "!=" }
    ],
    once: true,
    text: "朝赫死后，唐月履行了承诺。\n\n\"暗影系觉醒和普通觉醒不同，需要在阴影中进行。\"\n\n她带你来到一处幽暗的山洞，用暗影系魔法构建了一个纯粹的阴影空间。\n\n\"放松心神，让阴影接纳你。\"\n\n你闭上眼睛，感觉自己沉入了无尽的黑暗。不是恐惧，而是一种……归属。阴影像流水般包裹住你，星尘中第七颗星子之外，又多了一颗暗色的星子。\n\n你睁开眼，发现自己的影子在微微蠕动。\n\n\"遁影——暗影系初阶技能，可以让你在影子间快速移动。好好练，这是保命的本事。\"",
    choices: [
      {
        text: "感受暗影之力",
        effects: {
          setFlag: "shadow_awakened",
          giveInfo: "shadow_element_awakened",
          exp: 300
        },
        resultText: "你尝试融入影子，身体瞬间变得半透明，在阴影中滑行数米。\n\n暗影系——你的第三个系。从此你拥有了火、雷、暗影三系力量。"
      }
    ]
  },

  // 新生斗兽大赛
  event_tournament: {
    id: "event_tournament",
    name: "斗兽大赛",
    description: "明珠学府新生斗兽大赛",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "level", value: 12, operator: ">=" },
      { type: "flag", value: "shadow_awakened", operator: "==" },
      { type: "flag", value: "mingzhu_tournament_done", operator: "!=" }
    ],
    once: true,
    text: "明珠学府新生斗兽大赛开始了。\n\n召唤系七人站在斗兽场中央，面对数百名挑战者。你召唤出幽狼兽，它在你身边低吼。\n\n挑战者一波波涌来。白铠战蛰、岩魔士、食骨妖……其他召唤系学生纷纷败下阵来，只有你和幽狼兽还站着。\n\n白藏锋出场了——白家子弟，光系中阶，话多得让人烦躁。他单人挑战，一副胜券在握的样子。\n\n你冷笑一声，暗中引导雷系星图。\n\n\"就你是中阶？\"\n\n霹雳！一道紫色闪电从天而降，白藏锋脸色大变，顾翰老师紧急出手才救下他。\n\n全场寂静。\n\n许昭霆在观众席上瞪大了眼睛——他认出了你。",
    choices: [
      {
        text: "继续战斗",
        effects: {
          setFlag: "mingzhu_tournament_done",
          giveInfo: "mingzhu_tournament_result",
          exp: 800,
          gold: 2000000,
          reputation: { mingzhu_school: 30 }
        },
        resultText: "斗兽大赛结束，你以一人一兽斩落150名挑战者，震惊整个明珠学府。\n\n萧院长亲自奖励你：200万奖金、一件中阶魔具、三步塔修炼机会。\n\n💰 获得2,000,000金币！"
      }
    ]
  },

  // 加入青天猎所
  event_qingtian_hunter: {
    id: "event_qingtian_hunter",
    name: "青天猎所",
    description: "加入青天猎所",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "mingzhu_tournament_done", operator: "==" },
      { type: "flag", value: "joined_qingtian", operator: "!=" }
    ],
    once: true,
    text: "你决定做猎法师——实战锻炼，还能赚钱。\n\n猎者联盟大厦里，你的猎人等级不够接高级任务。女助理建议你加入私人猎所。\n\n你找到了青天猎所。一个看起来普通的老头坐在椅子上喝茶，旁边一个十二三岁的女孩在看资料，头也不抬。\n\n\"新人？\"老头眯着眼看你，\"灵灵说你实力不错。\"\n\n那女孩终于抬起头，一双大眼睛上下打量你：\"雷火双系，还有暗影系波动……你身上有妖魔的气息。有意思。\"\n\n包老头笑了：\"欢迎加入青天猎所。灵灵负责情报，你负责执行。别死了。\"",
    choices: [
      {
        text: "请多关照",
        effects: {
          setFlag: "joined_qingtian",
          giveInfo: "qingtian_hunter_office",
          exp: 200
        },
        resultText: "你正式加入青天猎所。灵灵推过来一份资料：\"第一个任务，追踪一只蜕皮女妖。别搞砸了。\""
      }
    ]
  },

  // 寄生妖魔事件
  event_parasite_demon: {
    id: "event_parasite_demon",
    name: "寄生妖魔",
    description: "学校寄生妖魔事件",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "joined_qingtian", operator: "==" },
      { type: "flag", value: "parasite_demon_defeated", operator: "!=" }
    ],
    once: true,
    text: "灵灵紧急联系你：学校里出现了寄生妖魔！\n\n被寄生的人白天正常，夜晚蜕皮变妖。追踪器显示红点在学校各处扩散，体育馆有数千人——如果妖母完成血祭，她可能突破到统领级！\n\n你独自赶往体育馆。雷印·怒击配合玫炎·火滋·爆裂，青黄女妖在你面前纷纷倒下。\n\n三楼升降台，你找到了妖母——战将级鳞皮妖母。一场恶战，你用火滋·焚骨持续灼烧，遁影周旋，最终将她击杀。\n\n赵满延在楼下挡住了小妖。\"妖母的功劳归我，\"他喘着气说，\"我给你弄灵级雷种——千钧。\"",
    choices: [
      {
        text: "成交",
        effects: {
          setFlag: "parasite_demon_defeated",
          giveInfo: "parasite_demon_incident",
          exp: 1000,
          items: [{ itemId: "thunder_spirit_seed", count: 1 }]
        },
        resultText: "你用妖母精魄换来了灵级雷种·千钧——天山雷峰采集的稀有灵种，释放雷系魔法时产生空间震荡。\n\n⚡ 获得灵级雷种·千钧！"
      }
    ]
  },

  // 三步塔修炼
  event_three_step_tower: {
    id: "event_three_step_tower",
    name: "三步塔",
    description: "三步塔修炼",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "parasite_demon_defeated", operator: "==" },
      { type: "flag", value: "three_step_tower_done", operator: "!=" }
    ],
    once: true,
    text: "包老头告诉你：黑教廷高层已经注意到你了。宇昂——那个博城的旧敌——已经成为黑教廷教士，正在找你。\n\n你决定进入三步塔修炼。\n\n三步塔是空间魔法建筑，\"一步千丈，两步万里，三步无疆\"。塔内元素浓度是外界的数十倍，但越往上精神重力越大。\n\n你进入第一层，浓郁的元素能量涌入身体。火、雷、暗影三系星尘同时运转，修炼速度比平时快了数倍。\n\n在三步塔中，你感受到了突破的契机——暗影系星云开始形成，巨影钉的星图在精神世界中逐渐清晰。",
    choices: [
      {
        text: "全力修炼",
        effects: {
          setFlag: "three_step_tower_done",
          giveInfo: "three_step_tower_secret",
          exp: 2000
        },
        resultText: "三步塔修炼结束，你三系齐头并进，暗影系突破中阶！\n\n🌑 学会巨影钉！"
      }
    ]
  },

  // 许昭霆之死
  event_xu_zhaoting_death: {
    id: "event_xu_zhaoting_death",
    name: "许昭霆之死",
    description: "许昭霆被黑教廷变成诅咒畜妖",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "three_step_tower_done", operator: "==" },
      { type: "flag", value: "xu_zhaoting_died", operator: "!=" }
    ],
    once: true,
    text: "主校区考核开始了。\n\n消息传来——许昭霆跟踪灰衣人时被抓了。\n\n你赶到废弃工厂，看到了令人愤怒的一幕：许昭霆被宇昂用咒法变成了诅咒畜妖——黑畜妖的强化版，保留着部分意识。他的身体被怪物化，但眼神中还有人性。\n\n张璐璐也在。许昭霆被灵魂锁链控制，一爪贯穿了她。\n\n\"莫凡……\"许昭霆的声音从怪物喉咙中挤出，\"杀了我……灵魂锁链……帕特农都解不开……\"\n\n他从腹中掏出一块皮革塞给你：\"神侍者的名字……替我……报仇……\"\n\n唐月确认无法解救。许昭霆求你结束他的痛苦。\n\n你用玫炎——玫瑰色的火焰——火化了许昭霆和张璐璐。\n\n火焰中，你立誓：黑教廷，我会让你们血债血偿。",
    choices: [
      {
        text: "你的仇，我来报",
        effects: {
          setFlag: "xu_zhaoting_died",
          giveInfo: "black_church_soul_chain",
          exp: 500
        },
        resultText: "你将皮革交给灵灵分析。许昭霆用命换来的情报，不能白费。\n\n从今天起，你不再被动防守——你要主动出击。"
      }
    ]
  },

  // 宇昂最终对决
  event_yu_ang_final: {
    id: "event_yu_ang_final",
    name: "宇昂终局",
    description: "与宇昂的最终对决",
    trigger: "location",
    chance: 1.0,
    conditions: [
      { type: "flag", value: "xu_zhaoting_died", operator: "==" },
      { type: "flag", value: "yu_ang_defeated_final", operator: "!=" }
    ],
    once: true,
    text: "大混战中，你用地圣泉做诱饵引蛇出洞。\n\n近千名学生在驯兽铁笼周围混战，而你在人群中寻找黑教廷的内奸。\n\n宇昂出现了——半张面具下是扭曲的面容，他身后跟着灰衣人和黑畜妖。\n\n\"你以为一个许昭霆就能动摇我？\"他冷笑。\n\n你不再废话，全力展开魔法攻势。\n\n宇昂的黑教廷法术在你的猛攻下土崩瓦解。他倒在地上，面具碎裂。\n\n\"博城……只是开始……\"他咳出黑血，\"撒朗大人……会为我报仇……\"\n\n他化作黑雾消散——这一次，你确认他真的死了。",
    choices: [
      {
        text: "结束了",
        effects: {
          setFlag: "yu_ang_defeated_final",
          giveInfo: "yu_ang_final_death",
          exp: 3000,
          gold: 5000000,
          reputation: { mingzhu_school: 50, hunter_guild: 50 }
        },
        resultText: "宇昂死了。博城的仇，许昭霆的仇，终于报了一部分。\n\n但你知道这不是结束。撒朗还在，神侍者还在，黑教廷还在。\n\n你的魔法之路，才刚刚开始。\n\n💰 获得5,000,000金币！\n⭐ 明珠篇·主线完成！"
      }
    ]
  },

  // ========== v0.25.0 随机探索事件 ==========
  event_stranger_help: {
    id: "event_stranger_help",
    name: "路人求助",
    description: "你在路上遇到一个神色慌张的路人，他似乎需要帮助。",
    trigger: "explore",
    chance: 0.3,
    once: false,
    choices: [
      {
        text: "上前询问",
        effects: { exp: 30, gold: 20 },
        resultText: "你上前询问，原来他迷路了。你帮他指了路，他感激地给了你一些金币。\n\n经验+30，金币+20"
      },
      {
        text: "假装没看见",
        effects: {},
        resultText: "你选择了无视，继续走自己的路。"
      }
    ]
  },

  event_magic_anomaly: {
    id: "event_magic_anomaly",
    name: "魔法波动",
    description: "你感受到附近有异常的魔法波动，似乎有什么东西在涌动。",
    trigger: "explore",
    chance: 0.25,
    once: false,
    choices: [
      {
        text: "调查波动来源",
        effects: { exp: 50, mp: -15 },
        resultText: "你循着波动找到了一处微弱的灵脉节点，吸收了一些魔法能量。\n\n经验+50，MP-15"
      },
      {
        text: "远离这里",
        effects: {},
        resultText: "你觉得不对劲，选择了远离。安全第一。"
      }
    ]
  },

  event_lost_item: {
    id: "event_lost_item",
    name: "遗失物品",
    description: "你在路边发现了一个看起来被遗失的小袋子。",
    trigger: "explore",
    chance: 0.2,
    once: false,
    choices: [
      {
        text: "打开看看",
        effects: { gold: 50 },
        resultText: "袋子里有一些金币，看来是某个粗心的人掉的。\n\n金币+50"
      },
      {
        text: "交给附近的人",
        effects: { exp: 20 },
        resultText: "你把袋子交给了附近的商铺老板，他称赞你是个诚实的人。\n\n经验+20"
      }
    ]
  },

  event_fellow_mage: {
    id: "event_fellow_mage",
    name: "同修交流",
    description: "你遇到一个同样在修炼的法师，他似乎愿意和你交流心得。",
    trigger: "explore",
    chance: 0.2,
    once: false,
    choices: [
      {
        text: "交流修炼心得",
        effects: { exp: 40 },
        resultText: "你们交流了各自的修炼方法，你从中获得了一些启发。\n\n经验+40"
      },
      {
        text: "礼貌拒绝",
        effects: {},
        resultText: "你礼貌地拒绝了，继续自己的修炼。"
      }
    ]
  },

  event_small_trouble: {
    id: "event_small_trouble",
    name: "小麻烦",
    description: "几个地痞流氓拦住了你的去路，看起来想找事。",
    trigger: "explore",
    chance: 0.15,
    once: false,
    choices: [
      {
        text: "用魔法吓退他们",
        effects: { exp: 25, mp: -10 },
        resultText: "你释放了一个小小的魔法，他们吓得落荒而逃。\n\n经验+25，MP-10"
      },
      {
        text: "绕路走",
        effects: {},
        resultText: "你不想惹麻烦，绕路离开了。"
      }
    ]
  },

  // ========== v0.33.0 更多探索随机事件 ==========

  event_wandering_merchant: {
    id: "event_wandering_merchant",
    name: "流浪商人",
    description: "一个背着大包裹的流浪商人向你招手，他的货物看起来很有趣。",
    trigger: "explore",
    chance: 0.15,
    once: false,
    choices: [
      {
        text: "看看他的货物",
        effects: { gold: -30, exp: 15 },
        resultText: "你花30金币买了一瓶据说能提升修炼效率的药水。虽然不知道真假，但商人的故事让你长了见识。\n\n金币-30，经验+15"
      },
      {
        text: "婉拒离开",
        effects: {},
        resultText: "你礼貌地拒绝了，继续自己的路。"
      }
    ]
  },

  event_injured_demon: {
    id: "event_injured_demon",
    name: "受伤的妖魔",
    description: "你发现一只受伤的低级妖魔倒在路边，它似乎还活着。",
    trigger: "explore",
    chance: 0.12,
    once: false,
    choices: [
      {
        text: "了结它",
        effects: { exp: 60, hp: -10 },
        resultText: "你果断出手解决了这只妖魔，避免它日后伤害他人。战斗中受了点小伤。\n\n经验+60，HP-10"
      },
      {
        text: "报告猎法师公会",
        effects: { exp: 20, gold: 30 },
        resultText: "你没有贸然出手，而是报告了附近的猎法师公会。他们感谢你提供的信息。\n\n经验+20，金币+30"
      }
    ]
  },

  event_ancient_ruins: {
    id: "event_ancient_ruins",
    name: "古老遗迹",
    description: "你在偏僻处发现了一处被藤蔓覆盖的古老遗迹入口，里面似乎有什么东西。",
    trigger: "explore",
    chance: 0.08,
    once: false,
    choices: [
      {
        text: "进去探索",
        effects: { exp: 80, gold: 100, mp: -20 },
        resultText: "遗迹里布满了魔法陷阱，但你小心翼翼地通过了。在最深处你找到了一些古代金币和一块刻满符文的石板。\n\n经验+80，金币+100，MP-20"
      },
      {
        text: "记住位置，以后再来",
        effects: { exp: 10 },
        resultText: "你觉得准备不足，决定记住位置以后再来。这份谨慎也是一种成长。\n\n经验+10"
      }
    ]
  },

  event_student_help: {
    id: "event_student_help",
    name: "学弟求助",
    description: "一个低年级的学生拦住了你，他似乎在修炼上遇到了瓶颈。",
    trigger: "explore",
    chance: 0.15,
    once: false,
    choices: [
      {
        text: "耐心指导他",
        effects: { exp: 35, gold: 0 },
        resultText: "你花了一些时间指导他，看着他恍然大悟的表情，你自己也对修炼有了新的理解。教学相长。\n\n经验+35"
      },
      {
        text: "让他去找老师",
        effects: {},
        resultText: "你建议他去找专业的老师指导，这确实是更负责任的做法。"
      }
    ]
  },

  event_lucky_find: {
    id: "event_lucky_find",
    name: "天降奇遇",
    description: "你走着走着，突然被什么东西绊了一下。低头一看，是一个闪闪发光的小盒子。",
    trigger: "explore",
    chance: 0.06,
    once: false,
    choices: [
      {
        text: "打开盒子",
        effects: { gold: 200, exp: 30 },
        resultText: "盒子里装着一枚古代金币和一张写着修炼口诀的羊皮纸。今天运气真好！\n\n金币+200，经验+30"
      }
    ]
  },

  event_magic_storm: {
    id: "event_magic_storm",
    name: "魔法风暴",
    description: "天空突然暗了下来，一场小型魔法风暴正在形成，空气中充满了狂暴的元素能量。",
    trigger: "explore",
    chance: 0.1,
    once: false,
    choices: [
      {
        text: "在风暴中修炼",
        effects: { exp: 70, hp: -15, mp: -20 },
        resultText: "你决定利用风暴中的狂暴能量修炼。虽然过程很痛苦，但你的元素亲和力有了明显提升。\n\n经验+70，HP-15，MP-20"
      },
      {
        text: "找地方躲避",
        effects: { exp: 5 },
        resultText: "你找到一个安全的地方躲避风暴。等待中你观察了风暴的形成，也算有所收获。\n\n经验+5"
      }
    ]
  },

  event_hidden_cave: {
    id: "event_hidden_cave",
    name: "隐秘洞穴",
    description: "你注意到山崖上有一个被灌木遮挡的洞穴，里面隐约传来水滴声。",
    trigger: "explore",
    chance: 0.1,
    once: false,
    choices: [
      {
        text: "进入洞穴",
        effects: { exp: 50, gold: 60 },
        resultText: "洞穴里有一个地下暗河，河边生长着几株珍贵的灵药。你采集了一些，还在洞壁上发现了前人留下的修炼笔记。\n\n经验+50，金币+60"
      },
      {
        text: "在洞口看看就好",
        effects: { exp: 10 },
        resultText: "你在洞口观察了一会儿，没有贸然进入。安全第一。\n\n经验+10"
      }
    ]
  },

  event_hunter_request: {
    id: "event_hunter_request",
    name: "猎人的请求",
    description: "一个受伤的猎法师拦住了你，他需要有人帮忙把一份重要的情报送到公会。",
    trigger: "explore",
    chance: 0.1,
    once: false,
    choices: [
      {
        text: "答应帮忙",
        effects: { exp: 45, gold: 80 },
        resultText: "你接过情报，快速赶到了猎法师公会。公会的人对你的及时帮助表示感谢，给了你一笔酬金。\n\n经验+45，金币+80"
      },
      {
        text: "抱歉，我还有事",
        effects: {},
        resultText: "你婉拒了他的请求，继续自己的行程。"
      }
    ]
  },

  event_old_bookstall: {
    id: "event_old_bookstall",
    name: "旧书摊",
    description: "路边有一个旧书摊，摊主是个戴着眼镜的老者，他的书看起来都有些年头了。",
    trigger: "explore",
    chance: 0.12,
    once: false,
    choices: [
      {
        text: "翻翻旧书",
        effects: { gold: -20, exp: 40 },
        resultText: "你花20金币买了一本破旧的魔法理论书。虽然书页泛黄，但里面的内容让你受益匪浅。\n\n金币-20，经验+40"
      },
      {
        text: "和老者聊天",
        effects: { exp: 20 },
        resultText: "老者给你讲了很多博城的历史和魔法界的趣闻，让你大开眼界。\n\n经验+20"
      }
    ]
  },

  event_street_performance: {
    id: "event_street_performance",
    name: "街头表演",
    description: "一群年轻的法师在街头表演魔法杂技，周围围了不少观众。",
    trigger: "explore",
    chance: 0.13,
    once: false,
    choices: [
      {
        text: "驻足观看",
        effects: { exp: 15, gold: -5 },
        resultText: "你看了一场精彩的表演，他们对魔法的精细控制让你有所启发。你打赏了5金币。\n\n经验+15，金币-5"
      },
      {
        text: "加入表演",
        effects: { exp: 30, gold: 15 },
        resultText: "你一时兴起加入了表演，你的魔法赢得了观众的喝彩。表演结束后分到了一些打赏。\n\n经验+30，金币+15"
      }
    ]
  },

  // ========== v0.34.0 NPC偶遇互动事件 ==========

  npc_int_mofan_train: {
    id: "npc_int_mofan_train",
    name: "莫凡的邀请",
    description: "莫凡看到你在修炼，主动过来打招呼。\"嘿，一起练练？互相指点一下？\"",
    npcId: "mo_fan",
    activities: ["修炼", "冥修"],
    minRelationship: 10,
    choices: [
      {
        text: "接受切磋",
        effects: { exp: 50, npcOpinion: { mo_fan: 3 } },
        resultText: "你们切磋了一番，莫凡的战斗直觉很敏锐，但你的基础更扎实。互相都有所收获。\n\n经验+50，莫凡好感+3"
      },
      {
        text: "婉拒，继续自己修炼",
        effects: { exp: 10 },
        resultText: "你婉拒了莫凡的邀请，继续专注于自己的修炼。莫凡耸了耸肩，也回去修炼了。\n\n经验+10"
      }
    ]
  },

  npc_int_mofan_chat: {
    id: "npc_int_mofan_chat",
    name: "莫凡的烦恼",
    description: "莫凡看起来有些心事，他注意到你后，犹豫了一下还是走了过来。",
    npcId: "mo_fan",
    minRelationship: 30,
    choices: [
      {
        text: "主动询问",
        effects: { exp: 20, npcOpinion: { mo_fan: 5 } },
        resultText: "莫凡和你聊了聊他的心事，虽然都是些学生的烦恼，但说出来后他心情好多了。\"谢了，兄弟。\"\n\n经验+20，莫凡好感+5"
      },
      {
        text: "假装没注意到",
        effects: {},
        resultText: "你选择不打扰他，莫凡也没有主动开口，两人各自做自己的事。"
      }
    ]
  },

  npc_int_ningxue_advice: {
    id: "npc_int_ningxue_advice",
    name: "穆宁雪的指点",
    description: "穆宁雪在一旁修炼时注意到了你的动作，她走过来，难得地开口了。\"你的冰系……姿势不对。\"",
    npcId: "mu_ningxue",
    activities: ["修炼", "冥修"],
    minRelationship: 15,
    choices: [
      {
        text: "虚心请教",
        effects: { exp: 60, npcOpinion: { mu_ningxue: 4 } },
        resultText: "穆宁雪简洁地指出了你动作中的问题，虽然话不多，但每一句都切中要害。你的冰系控制有了明显提升。\n\n经验+60，穆宁雪好感+4"
      },
      {
        text: "谢谢，我自己再试试",
        effects: { exp: 15 },
        resultText: "你礼貌地感谢了她，但决定自己摸索。穆宁雪点了点头，没有多说什么。\n\n经验+15"
      }
    ]
  },

  npc_int_ningxue_silence: {
    id: "npc_int_ningxue_silence",
    name: "安静的共处",
    description: "穆宁雪就在不远处，你们都没有说话。空气中有一种奇妙的宁静。",
    npcId: "mu_ningxue",
    minRelationship: 25,
    choices: [
      {
        text: "安静地待着",
        effects: { exp: 25, npcOpinion: { mu_ningxue: 3 } },
        resultText: "你们就这样安静地各自待着，谁也没有说话。但你感觉和她的距离似乎近了一些。\n\n经验+25，穆宁雪好感+3"
      },
      {
        text: "找个借口离开",
        effects: {},
        resultText: "你觉得气氛有些尴尬，找了个借口离开了。"
      }
    ]
  },

  npc_int_tangyue_teach: {
    id: "npc_int_tangyue_teach",
    name: "唐月的小课堂",
    description: "唐月看到你在修炼，笑着走过来。\"正好，我刚想到一个修炼的小技巧，要不要听听？\"",
    npcId: "tang_yue",
    activities: ["修炼", "备课", "批改"],
    minRelationship: 10,
    choices: [
      {
        text: "认真听讲",
        effects: { exp: 70, npcOpinion: { tang_yue: 3 } },
        resultText: "唐月耐心地给你讲解了修炼技巧，还亲自示范了一遍。她的教学水平确实一流。\n\n经验+70，唐月好感+3"
      },
      {
        text: "老师您忙，我自己练",
        effects: { exp: 15 },
        resultText: "你不想耽误唐月的时间，婉拒了她。唐月笑了笑，\"有问题随时来找我。\"\n\n经验+15"
      }
    ]
  },

  npc_int_tangyue_care: {
    id: "npc_int_tangyue_care",
    name: "唐月的关心",
    description: "唐月注意到你最近修炼很刻苦，她走过来，语气中带着关切。\"别太拼了，身体要紧。\"",
    npcId: "tang_yue",
    minRelationship: 35,
    choices: [
      {
        text: "谢谢老师关心",
        effects: { exp: 20, hp: 20, npcOpinion: { tang_yue: 4 } },
        resultText: "唐月给了你一瓶恢复药剂，\"好好休息，明天继续。\"她的关心让你感到温暖。\n\n经验+20，HP+20，唐月好感+4"
      },
      {
        text: "我没事的，老师",
        effects: { exp: 10 },
        resultText: "你表示自己没问题，唐月无奈地笑了笑，\"你们这些年轻人啊……\"\n\n经验+10"
      }
    ]
  },

  npc_int_xiaohou_adventure: {
    id: "npc_int_xiaohou_adventure",
    name: "张小侯的冒险提议",
    description: "张小侯看到你，兴奋地跑过来。\"兄弟！我发现了一个好玩的地方，要不要一起去探险？\"",
    npcId: "zhang_xiaohou",
    minRelationship: 15,
    choices: [
      {
        text: "好啊，走！",
        effects: { exp: 45, gold: 30, npcOpinion: { zhang_xiaohou: 5 } },
        resultText: "你们一起去了张小侯发现的地方，虽然只是一个小山洞，但里面有一些前人留下的金币。最重要的是，你们玩得很开心。\n\n经验+45，金币+30，张小侯好感+5"
      },
      {
        text: "下次吧，我今天想修炼",
        effects: { exp: 10, npcOpinion: { zhang_xiaohou: -1 } },
        resultText: "张小侯有些失望，但还是理解了你。\"好吧，那下次一定啊！\"\n\n经验+10，张小侯好感-1"
      }
    ]
  },

  npc_int_xiaohou_food: {
    id: "npc_int_xiaohou_food",
    name: "张小侯的零食",
    description: "张小侯偷偷塞给你一包零食。\"这是我攒了好久的，分你一半！\"",
    npcId: "zhang_xiaohou",
    minRelationship: 30,
    choices: [
      {
        text: "谢谢兄弟！",
        effects: { exp: 15, stamina: 20, npcOpinion: { zhang_xiaohou: 3 } },
        resultText: "你们一边吃零食一边聊天，张小侯讲了好多学校里的趣事，让你笑个不停。\n\n经验+15，体力+20，张小侯好感+3"
      },
      {
        text: "你自己留着吧",
        effects: { npcOpinion: { zhang_xiaohou: -2 } },
        resultText: "你婉拒了张小侯的好意，他有些失落。\"好吧……那我自己吃了。\"\n\n张小侯好感-2"
      }
    ]
  }
};
