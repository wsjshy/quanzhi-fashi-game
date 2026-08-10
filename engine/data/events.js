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
    description: "今天商店打折！",
    trigger: "exploring",
    chance: 0.1,
    conditions: [],
    once: false,
    choices: [
      {
        text: "太好了，去买买买",
        effects: {
          gold: 20
        },
        resultText: "你发现商店真的在打折，还送了优惠券！（获得 20 金币）"
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
  }
};
