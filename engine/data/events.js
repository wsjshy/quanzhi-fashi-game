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
    chance: 0.15,
    conditions: [],
    once: false,
    choices: [
      {
        text: "仔细研究并尝试施展",
        effects: {
          exp: 20,
          learnRandomSkill: { tier: "初阶" },
          mp: -10
        },
        resultText: "你仔细研究书中的魔法构造，尝试施展后成功领悟了一个新技能！（经验+20，MP-10）"
      },
      {
        text: "做笔记以后再研究",
        effects: {
          exp: 10,
          addItem: {
            itemId: "magic_herb",
            count: 1
          }
        },
        resultText: "你把要点记录下来，打算以后再仔细研究。（经验+10，获得魔法草药×1）"
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
    description: "你进入了铭文女子中学的食堂。据校方说，这半年来每到深夜食堂就会出现莫名其妙的颤震——桌椅自己晃动、餐具叮当作响，就像有什么东西在地下活动。半年前有一名女生深夜留在食堂复习后失踪，校方不了了之；直到上周又有一名女生在校内失踪，学校才不得不找猎妖队介入。食堂里黑漆漆的，只有远处的应急灯照亮了些许位置，整齐的餐桌餐椅冷冷清清地摆在那里，空气中弥漫着一股若有若无的腥臭味。",
    trigger: "exploring",
    chance: 1.0,
    conditions: { location: "mingwen_girls_school", action: "investigate_cafeteria" },
    choices: [
      {
        text: "蹲在角落观察",
        effects: { stamina: -10, exp: 15, setFlag: "cafeteria_observed" },
        resultText: "你蹲在一个角落，静静观察。突然，脚下传来一阵微弱的震动——就像有什么东西在地下挖掘。紧接着，不远处的一张餐桌自己晃动起来，上面的铁勺随着桌椅的晃动叮当作响。震动持续了大约十秒后停止，你注意到后厨方向的地板有轻微的隆起痕迹。"
      },
      {
        text: "查看失踪女生留下的物品",
        effects: { stamina: -5, exp: 20, setFlag: "missing_girl_clue" },
        resultText: "你在食堂角落发现了一个被遗忘的书包，应该是上周失踪女生留下的。书包里有一本魔法理论笔记，最后一页写着：'深夜食堂又在震了，我决定今晚留下来看看是什么东西……'笔记到这里就断了，字迹潦草，似乎写得很匆忙。"
      },
      {
        text: "直接去后厨",
        effects: { stamina: -15, exp: 25, hp: -20 },
        resultText: "你直接走向后厨，一股腐臭气味扑面而来，地面上有明显的拖拽痕迹。突然，一道腥红光线从黑暗中射来，你勉强躲开，但还是被擦伤了肩膀。那道光线来自后厨深处——有什么东西潜伏在那里！"
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
        effects: { hp: -10, stamina: -10, setFlag: "giant_rat_encountered" },
        startBattle: "giant_eye_rat",
        battleOptions: { winHpPercent: 0.3, canFlee: true, source: "quest" },
        resultText: "你与巨眼猩鼠展开激战！腥红光束擦过你的肩膀，火辣辣地疼。"
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
          items: [{ itemId: "fire_basic", count: 1 }]
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
          items: [{ itemId: "fire_basic", count: 1 }],
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
          items: [{ itemId: "thunder_basic", count: 1 }]
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

  // ========== v0.46.0 新增探索事件 ==========

  event_wandering_mage: {
    id: "event_wandering_mage",
    name: "流浪法师",
    description: "你在街角遇到一个风尘仆仆的流浪法师，他看起来阅历丰富。",
    trigger: "explore",
    chance: 0.1,
    once: false,
    choices: [
      {
        text: "请教魔法心得",
        effects: { exp: 40, gold: -10 },
        resultText: "你花了10金币请他喝酒，他分享了许多实战经验。这些在课堂上学不到的知识让你受益匪浅。"
      },
      {
        text: "购买他的药水",
        effects: { gold: -30, addItem: { itemId: "health_potion", count: 2 } },
        resultText: "他卖给你两瓶品质不错的生命药水，比小卖部便宜一些。"
      },
      {
        text: "礼貌离开",
        effects: {},
        resultText: "你点了点头，继续自己的路。"
      }
    ]
  },

  event_hidden_training_room: {
    id: "event_hidden_training_room",
    name: "隐秘修炼室",
    description: "你在教学楼深处发现了一间很少有人使用的修炼室，里面的魔法浓度似乎更高。",
    trigger: "explore",
    chance: 0.08,
    once: false,
    choices: [
      {
        text: "在这里修炼",
        effects: { exp: 60, mp: -25, hp: -10 },
        resultText: "你在高浓度的魔法环境中修炼，效果远超平时。但身体也承受了更大的压力。"
      },
      {
        text: "记下位置以后再来",
        effects: { exp: 5 },
        resultText: "你记下了这个位置，打算以后状态好的时候再来。"
      }
    ]
  },

  event_street_conflict: {
    id: "event_street_conflict",
    name: "街头冲突",
    description: "前方两个法师因为小事争吵起来，眼看就要动手。周围围了不少看热闹的人。",
    trigger: "explore",
    chance: 0.1,
    once: false,
    choices: [
      {
        text: "上前劝架",
        effects: { exp: 20, hp: -15 },
        resultText: "你上前劝阻，虽然被波及受了点伤，但成功化解了冲突。周围的人对你投来赞许的目光。"
      },
      {
        text: "围观学习",
        effects: { exp: 15 },
        resultText: "你在一旁观察他们的魔法运用，学到了一些实战技巧。"
      },
      {
        text: "绕道离开",
        effects: {},
        resultText: "你不想惹麻烦，绕道离开了。"
      }
    ]
  },

  event_magic_fair: {
    id: "event_magic_fair",
    name: "魔法集市",
    description: "学校附近临时搭起了一个魔法集市，各种稀奇古怪的商品琳琅满目。",
    trigger: "explore",
    chance: 0.08,
    once: false,
    choices: [
      {
        text: "购买恢复药水（30金币）",
        effects: { gold: -30, addItem: { itemId: "health_potion", count: 1 } },
        resultText: "你以优惠价买到了一瓶品质不错的生命药水。"
      },
      {
        text: "打听情报（5金币）",
        effects: { gold: -5, exp: 20 },
        resultText: "你花了5金币从一个商人那里打听到了不少有用的情报，包括附近妖魔的动向。"
      },
      {
        text: "随便逛逛",
        effects: { exp: 5 },
        resultText: "你在集市里逛了一圈，开阔了眼界。"
      }
    ]
  },

  event_rain_encounter: {
    id: "event_rain_encounter",
    name: "雨中邂逅",
    description: "天空突然下起了大雨，你跑到附近的屋檐下避雨，发现已经有人先到了。",
    trigger: "explore",
    chance: 0.09,
    once: false,
    choices: [
      {
        text: "主动搭话",
        effects: { exp: 10 },
        resultText: "你主动和对方聊了起来，雨中的对话格外放松。你们交流了一些修炼心得，临别时对方记住了你的名字。"
      },
      {
        text: "安静等待雨停",
        effects: { hp: 10, mp: 10 },
        resultText: "你安静地等待雨停，趁机休息了一下，恢复了一些体力。"
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
  },

  // ========== v0.37.0 新NPC互动事件 ==========

  npc_int_zhaomy_showoff: {
    id: "npc_int_zhaomy_showoff",
    name: "赵满延的炫耀",
    description: "赵满延看到你，立刻凑了过来。\"嘿！看看我最新练成的光系防御魔法，厉害吧？\"",
    npcId: "zhao_manyan",
    minRelationship: 5,
    choices: [
      {
        text: "确实厉害，教教我？",
        effects: { exp: 30, npcOpinion: { zhao_manyan: 5 } },
        resultText: "赵满延得意地笑了，耐心地给你讲解了光系防御的要领。虽然他爱炫耀，但教得还真不错。\n\n经验+30，赵满延好感+5"
      },
      {
        text: "还行吧，一般般",
        effects: { npcOpinion: { zhao_manyan: -3 } },
        resultText: "赵满延的笑容僵住了。\"什么叫一般般？这可是我苦练了三天的成果！\"他气鼓鼓地走了。\n\n赵满延好感-3"
      }
    ]
  },

  npc_int_zhaomy_help: {
    id: "npc_int_zhaomy_help",
    name: "赵满延的求助",
    description: "赵满延难得地一脸愁容。\"那个……你修炼经验丰富，能不能帮我看看我这个魔法哪里出问题了？\"",
    npcId: "zhao_manyan",
    minRelationship: 25,
    choices: [
      {
        text: "当然，我来看看",
        effects: { exp: 40, npcOpinion: { zhao_manyan: 6 } },
        resultText: "你仔细观察了赵满延的施法，指出了他魔力运转中的一个小问题。赵满延恍然大悟，\"原来如此！你真厉害！\"\n\n经验+40，赵满延好感+6"
      },
      {
        text: "我也不太懂",
        effects: { exp: 5 },
        resultText: "你表示自己也不太懂光系魔法。赵满延有些失望，但还是感谢了你的好意。\n\n经验+5"
      }
    ]
  },

  npc_int_zhoumin_study: {
    id: "npc_int_zhoumin_study",
    name: "周敏的学习邀请",
    description: "周敏在图书馆看到你，犹豫了一下走过来。\"那个……你要不要一起自习？两个人一起效率更高。\"",
    npcId: "zhou_min",
    activities: ["自习", "学习", "复习"],
    minRelationship: 10,
    choices: [
      {
        text: "好啊，一起吧",
        effects: { exp: 45, npcOpinion: { zhou_min: 4 } },
        resultText: "你们一起自习了一段时间，周敏的笔记做得非常认真，你从中学到了不少。她也很开心有人陪她学习。\n\n经验+45，周敏好感+4"
      },
      {
        text: "抱歉，我还有事",
        effects: {},
        resultText: "你婉拒了周敏的邀请。她有些失落，但还是理解地点了点头。"
      }
    ]
  },

  npc_int_zhoumin_encourage: {
    id: "npc_int_zhoumin_encourage",
    name: "周敏的鼓励",
    description: "周敏注意到你最近修炼很刻苦，她走过来，认真地说：\"你很努力，我相信你一定能成为厉害的法师。\"",
    npcId: "zhou_min",
    minRelationship: 30,
    choices: [
      {
        text: "谢谢，你也一样",
        effects: { exp: 20, npcOpinion: { zhou_min: 5 } },
        resultText: "周敏的脸微微红了，\"嗯！我们一起加油！\"她的鼓励让你充满了动力。\n\n经验+20，周敏好感+5"
      },
      {
        text: "嗯，借你吉言",
        effects: { exp: 10, npcOpinion: { zhou_min: 2 } },
        resultText: "你简单地回应了一句。周敏笑了笑，回去继续学习了。\n\n经验+10，周敏好感+2"
      }
    ]
  },

  // ========== v0.40.0 许昭霆/穆白互动事件 ==========

  npc_int_xuzt_challenge: {
    id: "npc_int_xuzt_challenge",
    name: "许昭霆的挑战",
    description: "许昭霆看到你，眼中闪过一丝战意。\"听说你最近进步很快，要不要切磋一下？\"他的雷系魔法在指尖跃动。",
    npcId: "xu_zhaoting",
    minRelationship: 5,
    choices: [
      {
        text: "好，来吧！",
        effects: { exp: 50, npcOpinion: { xu_zhaoting: 5 } },
        resultText: "你们展开了一场激烈的切磋。许昭霆的雷系魔法攻势凌厉，但你也不落下风。战斗结束后，他认真地说：\"你确实很强，我认可你。\"\n\n经验+50，许昭霆好感+5"
      },
      {
        text: "今天算了吧",
        effects: { npcOpinion: { xu_zhaoting: -2 } },
        resultText: "许昭霆有些失望，\"哼，胆小鬼。\"他转身走了，雷电在他身后噼啪作响。\n\n许昭霆好感-2"
      }
    ]
  },

  npc_int_xuzt_pride: {
    id: "npc_int_xuzt_pride",
    name: "许昭霆的骄傲",
    description: "许昭霆独自修炼着，看到你经过，冷冷地说：\"别以为进步快就了不起，雷系的底蕴不是靠天赋就能弥补的。\"",
    npcId: "xu_zhaoting",
    minRelationship: 20,
    choices: [
      {
        text: "受教了",
        effects: { exp: 25, npcOpinion: { xu_zhaoting: 3 } },
        resultText: "你虚心接受了他的指点。许昭霆愣了一下，似乎没想到你会这么谦虚。\"……算你识相。\"他的语气缓和了一些。\n\n经验+25，许昭霆好感+3"
      },
      {
        text: "天赋也是实力的一部分",
        effects: { npcOpinion: { xu_zhaoting: -5 } },
        resultText: "许昭霆的脸色沉了下来，\"哼，走着瞧。\"他不再理你，继续独自修炼。\n\n许昭霆好感-5"
      }
    ]
  },

  npc_int_mubai_family: {
    id: "npc_int_mubai_family",
    name: "穆白的家族",
    description: "穆白看到你，表情复杂。\"你知道吗，穆家的人都在关注你。一个没有背景的人能走到这一步，不容易。\"",
    npcId: "mu_bai",
    minRelationship: 10,
    choices: [
      {
        text: "我只是在做自己该做的事",
        effects: { exp: 30, npcOpinion: { mu_bai: 4 } },
        resultText: "穆白若有所思地点了点头，\"不卑不亢，不错。也许你真的能走出一条不同的路。\"\n\n经验+30，穆白好感+4"
      },
      {
        text: "穆家又怎样？",
        effects: { npcOpinion: { mu_bai: -3 } },
        resultText: "穆白的表情变得冷淡，\"你会知道穆家意味着什么的。\"他转身离去。\n\n穆白好感-3"
      }
    ]
  },

  npc_int_mubai_ice: {
    id: "npc_int_mubai_ice",
    name: "穆白的冰系心得",
    description: "穆白正在修炼冰系魔法，看到你在一旁，犹豫了一下说：\"冰系的关键不在于冷，而在于控制。你想听听吗？\"",
    npcId: "mu_bai",
    minRelationship: 30,
    choices: [
      {
        text: "请赐教",
        effects: { exp: 45, npcOpinion: { mu_bai: 5 } },
        resultText: "穆白认真地讲解了冰系魔力的控制技巧，他的讲解非常专业。\"穆家的冰系传承，不是随便什么人都能听到的。\"\n\n经验+45，穆白好感+5"
      },
      {
        text: "我对冰系没兴趣",
        effects: { npcOpinion: { mu_bai: -2 } },
        resultText: "穆白收回了目光，\"随你。\"他继续自己的修炼，不再说话。\n\n穆白好感-2"
      }
    ]
  },

  // ========== v0.47.0 新增NPC互动事件 ==========

  npc_int_mofan_compete: {
    id: "npc_int_mofan_compete",
    name: "莫凡的好胜心",
    description: "莫凡修炼完走过来，拍了拍你的肩膀，\"最近进步挺快啊。怎么样，找时间比比？谁输了请吃饭。\"",
    npcId: "mo_fan",
    activities: ["修炼", "冥修"],
    minRelationship: 15,
    choices: [
      {
        text: "好啊，谁怕谁",
        effects: { exp: 35, npcOpinion: { mo_fan: 4 } },
        resultText: "莫凡咧嘴一笑，\"够爽快！就这么说定了。\"你们约定了周末在修炼场切磋。\n\n经验+35，莫凡好感+4"
      },
      {
        text: "改天吧，最近有点忙",
        effects: { exp: 10 },
        resultText: "莫凡耸了耸肩，\"行吧，随时找我。\"他摆摆手走了。\n\n经验+10"
      }
    ]
  },

  npc_int_ningxue_rooftop: {
    id: "npc_int_ningxue_rooftop",
    name: "天台的穆宁雪",
    description: "你在天台发现穆宁雪独自站在那里，风吹动她的长发。她察觉到你的到来，微微侧头，\"……这里风不错。\"",
    npcId: "mu_ningxue",
    activities: ["自习", "修炼"],
    minRelationship: 25,
    choices: [
      {
        text: "在旁边安静站着",
        effects: { exp: 20, mp: 15, npcOpinion: { mu_ningxue: 3 } },
        resultText: "你没有说话，只是在她旁边安静地站着。远处的博城尽收眼底，穆宁雪的冰系魔力在空气中微微流动，让你有所感悟。\n\n经验+20，MP+15，穆宁雪好感+3"
      },
      {
        text: "打扰了，我先走了",
        effects: {},
        resultText: "你不想打扰她的清静，转身离开了天台。"
      }
    ]
  },

  npc_int_tangyue_extra: {
    id: "npc_int_tangyue_extra",
    name: "唐月的小灶",
    description: "唐月看到你在修炼，走过来压低声音说，\"放学后留一下，老师给你补点东西。别告诉别人哦。\"",
    npcId: "tang_yue",
    activities: ["修炼", "自习"],
    minRelationship: 20,
    choices: [
      {
        text: "谢谢唐月老师",
        effects: { exp: 50, npcOpinion: { tang_yue: 4 } },
        resultText: "放学后，唐月单独给你讲解了星子排列的高级技巧。\"你的天赋不错，别浪费了。\"\n\n经验+50，唐月好感+4"
      },
      {
        text: "这样不太好吧",
        effects: { exp: 15, npcOpinion: { tang_yue: 1 } },
        resultText: "唐月笑了笑，\"有什么不好的？老师关心学生而已。\"她还是给你讲了几个要点。\n\n经验+15，唐月好感+1"
      }
    ]
  },

  npc_int_zhaomy_brag: {
    id: "npc_int_zhaomy_brag",
    name: "赵满延的牛皮",
    description: "赵满延凑过来神神秘秘地说，\"跟你说，我昨天一个人打跑了三只妖魔！怎么样，厉害吧？\"他的表情有些心虚。",
    npcId: "zhao_manyan",
    activities: ["自习", "找人聊天"],
    minRelationship: 10,
    choices: [
      {
        text: "真的假的？讲讲细节",
        effects: { exp: 15, npcOpinion: { zhao_manyan: 3 } },
        resultText: "赵满延绘声绘色地讲了起来，虽然细节漏洞百出，但你听得津津有味。讲到最后他自己都笑了，\"好吧其实只有一只，还是被我吓跑的。\"\n\n经验+15，赵满延好感+3"
      },
      {
        text: "就你？别吹了",
        effects: { npcOpinion: { zhao_manyan: -1 } },
        resultText: "赵满延脸一红，\"哼，不信算了！\"他气鼓鼓地走了。\n\n赵满延好感-1"
      }
    ]
  },

  npc_int_xuzt_acknowledge: {
    id: "npc_int_xuzt_acknowledge",
    name: "许昭霆的认可",
    description: "许昭霆拦住你的去路，双臂抱胸，\"你的实力……我承认了。雷系的奥义，你想了解多少？\"他的语气依然傲慢，但眼神中多了几分认真。",
    npcId: "xu_zhaoting",
    activities: ["修炼", "自习"],
    minRelationship: 35,
    choices: [
      {
        text: "请指教",
        effects: { exp: 55, npcOpinion: { xu_zhaoting: 5 } },
        resultText: "许昭霆难得地认真讲解了雷系魔力的压缩技巧。\"雷系的精髓在于瞬间爆发，而不是持续输出。记住了。\"\n\n经验+55，许昭霆好感+5"
      },
      {
        text: "不用了，我自己悟",
        effects: { exp: 10, npcOpinion: { xu_zhaoting: 2 } },
        resultText: "许昭霆挑了挑眉，\"……有骨气。\"他居然没有生气，反而点了点头。\n\n经验+10，许昭霆好感+2"
      }
    ]
  },

  // ========== v0.48.0 影响力事件链：唐月的栽培 ==========

  influence_tang_yue_attention: {
    id: "influence_tang_yue_attention",
    name: "唐月的关注",
    description: "课后，唐月叫住了你。她抱着教案，微微歪头，\"你最近的修炼很认真，星子排列的稳定性提升不少。老师这里有一些额外的修炼心得，你有兴趣听听吗？\"",
    npcId: "tang_yue",
    activities: ["修炼", "自习", "上课", "冥修", "备课", "批改"],
    minRelationship: 25,
    notFlag: "tang_yue_guidance",
    choices: [
      {
        text: "当然有兴趣，谢谢唐月老师",
        effects: { exp: 30, setFlag: "tang_yue_guidance", npcOpinion: { tang_yue: 5 } },
        resultText: "唐月露出欣慰的笑容，\"好，那以后修炼上有什么不懂的，随时来问老师。\"她单独给你讲解了几个星子共鸣的技巧，让你受益匪浅。\n\n经验+30，唐月好感+5，获得唐月的长期指导"
      },
      {
        text: "不用麻烦老师了，我自己摸索就行",
        effects: { npcOpinion: { tang_yue: 8 }, reputation: { school: 3 } },
        resultText: "唐月愣了一下，随即笑了，\"有独立思考的习惯是好事。不过遇到瓶颈别硬撑，老师随时在。\"她对你的自主态度很欣赏。\n\n唐月好感+8，学校声望+3"
      },
      {
        text: "唐月老师，您能把我推荐给其他老师吗？",
        effects: { exp: 15, setFlag: "tang_yue_referred", npcOpinion: { tang_yue: 2 } },
        resultText: "唐月想了想，\"你的基础确实扎实，我可以写封推荐信给萧院长，他那边有一些特殊的修炼资源。不过最终能不能拿到，还要看你自己的表现。\"\n\n经验+15，获得唐月的推荐信"
      }
    ]
  },

  influence_tang_yue_guidance_buff: {
    id: "influence_tang_yue_guidance_buff",
    name: "修炼中的指导",
    description: "你正在修炼时，唐月路过停下脚步。她看了一会儿你的星子运转，忽然开口，\"这里的星子排列可以再紧凑一些，试试把第三颗和第五颗的距离缩短半寸。\"",
    npcId: "tang_yue",
    activities: ["修炼", "冥修", "备课", "上课", "批改"],
    requireFlag: "tang_yue_guidance",
    choices: [
      {
        text: "按照老师说的调整",
        effects: { exp: 60, mp: 10 },
        resultText: "你按照唐月的指点调整了星子排列，魔力运转顿时顺畅了许多，修炼效率大幅提升！\n\n经验+60，MP+10"
      },
      {
        text: "先记下，继续按自己的方式修炼",
        effects: { exp: 25 },
        resultText: "你把唐月的建议记在心里，继续按自己的节奏修炼。虽然这次没有立刻见效，但你知道以后可以尝试。\n\n经验+25"
      }
    ]
  },

  influence_mofan_notice_guidance: {
    id: "influence_mofan_notice_guidance",
    name: "莫凡的观察",
    description: "莫凡凑过来，一脸好奇，\"哎，我最近总看到唐月老师单独跟你说话，她在给你开小灶？可以啊你！\"他的语气里没有嫉妒，更多的是好奇和佩服。",
    npcId: "mo_fan",
    activities: ["修炼", "自习", "上课", "聊天", "找人聊天"],
    requireFlag: "tang_yue_guidance",
    choices: [
      {
        text: "唐月老师只是偶尔指点一下",
        effects: { npcOpinion: { mo_fan: 3 } },
        resultText: "莫凡拍了拍你的肩膀，\"别谦虚了，唐老师的眼光可高了。好好学，以后咱们切磋切磋！\"他对你更加认可了。\n\n莫凡好感+3"
      },
      {
        text: "你也可以去找她问问，她人很好的",
        effects: { npcOpinion: { mo_fan: 5 }, reputation: { school: 2 } },
        resultText: "莫凡眼睛一亮，\"真的？那我下次也去试试！\"他兴冲冲地跑走了。你觉得自己做了件好事。\n\n莫凡好感+5，学校声望+2"
      }
    ]
  },

  influence_classmate_recognition: {
    id: "influence_classmate_recognition",
    name: "同学的认可",
    description: "赵满延凑过来，压低声音，\"听说唐月老师在单独指导你？厉害啊兄弟！以后修炼上有啥心得，也给咱分享分享？\"周围几个同学也投来关注的目光。",
    npcId: "zhao_manyan",
    activities: ["自习", "上课", "聊天", "找人聊天", "修炼"],
    requireFlag: "tang_yue_guidance",
    choices: [
      {
        text: "没问题，大家一起进步",
        effects: { reputation: { school: 5 }, npcOpinion: { zhao_manyan: 4 } },
        resultText: "赵满延大喜，\"够意思！以后你就是咱们班的修炼顾问了！\"同学们对你的印象更好了。\n\n学校声望+5，赵满延好感+4"
      },
      {
        text: "我也是刚学，还不太熟",
        effects: { reputation: { school: 2 } },
        resultText: "赵满延点点头，\"谦虚！不过我看你行的。\"他没有追问，但同学们对你的印象有所提升。\n\n学校声望+2"
      }
    ]
  },

  // ========== v0.50.0 穆宁雪事件链 ==========
  influence_mu_ningxue_encounter: {
    id: "influence_mu_ningxue_encounter",
    name: "修炼中的偶遇",
    description: "你正在专注修炼，星子运转稳定而有序。穆宁雪路过时停下脚步，静静看了一会儿。她没有说话，但清冷的眼神中多了一丝不易察觉的注意。",
    npcId: "mu_ningxue",
    activities: ["修炼", "冥修", "自习"],
    minRelationship: 15,
    minLevel: 5,
    notFlag: "mu_ningxue_noticed",
    choices: [
      {
        text: "点头致意，继续专注修炼",
        effects: { setFlag: "mu_ningxue_noticed", npcOpinion: { mu_ningxue: 5 } },
        resultText: "你微微点头，随即收回心神继续修炼。穆宁雪嘴角微动，似乎对你的专注很是认可。她没有打扰，安静地离开了。\n\n穆宁雪好感+5，获得穆宁雪的注意"
      },
      {
        text: "主动请教冰系修炼心得",
        effects: { exp: 10, npcOpinion: { mu_ningxue: 1 } },
        resultText: "你起身请教。穆宁雪顿了顿，\"冰系...在于控制。\"她只说了几个字便不再多言，但你能感觉到她并非完全拒绝。\n\n经验+10，穆宁雪好感+1"
      },
      {
        text: "不理会，继续按自己的节奏修炼",
        effects: { setFlag: "mu_ningxue_noticed", npcOpinion: { mu_ningxue: 3 }, exp: 5 },
        resultText: "你完全沉浸在修炼中，没有注意到穆宁雪的注视。她站了片刻，轻轻哼了一声便离开了。后来你才知道，她最欣赏的就是这种专注。\n\n经验+5，穆宁雪好感+3，获得穆宁雪的注意"
      }
    ]
  },

  influence_mu_ningxue_ice_advice: {
    id: "influence_mu_ningxue_ice_advice",
    name: "冰系心得",
    description: "穆宁雪走到你旁边，难得主动开口。\"你的星子排列比上次稳定了。\"她顿了顿，\"冰系的关键在于控制，不是力量。让星子按照你的意志流动，而不是强行驱动。\"",
    npcId: "mu_ningxue",
    activities: ["修炼", "自习", "冥修"],
    minRelationship: 20,
    requireFlag: "mu_ningxue_noticed",
    choices: [
      {
        text: "认真聆听，请她多讲一些细节",
        effects: { exp: 40, npcOpinion: { mu_ningxue: 3 } },
        resultText: "你聚精会神地听着，不时点头。穆宁雪讲得不多，但每一句都切中要害。你对魔法控制的理解更深了一层。\n\n经验+40，穆宁雪好感+3"
      },
      {
        text: "提出自己对星子控制的见解",
        effects: { npcOpinion: { mu_ningxue: 5 }, reputation: { school: 2 } },
        resultText: "你说出了自己的一些想法。穆宁雪微微挑眉，似乎有些意外。\"...有点道理。\"她难得给出正面评价，周围几个同学也投来惊讶的目光。\n\n穆宁雪好感+5，学校声望+2"
      },
      {
        text: "谢谢指点，我自己再琢磨琢磨",
        effects: { npcOpinion: { mu_ningxue: 2 }, exp: 15 },
        resultText: "你道谢后继续修炼。穆宁雪点点头，\"有独立思考的习惯也好。\"她转身离开，但你能感觉到她对你的印象又好了一些。\n\n经验+15，穆宁雪好感+2"
      }
    ]
  },

  influence_mu_ningxue_spar: {
    id: "influence_mu_ningxue_spar",
    name: "切磋邀请",
    description: "穆宁雪抱着手臂看着你，清冷的目光中带着一丝审视。\"你的进步速度...比我预想的快。\"她顿了顿，\"要不要切磋一下？我想看看你的实战水平到底如何。\"",
    npcId: "mu_ningxue",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 30,
    minLevel: 8,
    requireFlag: "mu_ningxue_noticed",
    notFlag: "mu_ningxue_spar_done",
    choices: [
      {
        text: "好，请穆学姐指教",
        effects: { setFlag: "mu_ningxue_spar_done", npcOpinion: { mu_ningxue: 5 }, exp: 50, reputation: { school: 3 } },
        resultText: "穆宁雪点头，\"跟我来。\"她带你到修炼场。一场切磋下来，冰系的控制力让你吃了不少苦头，但你展现出的韧性和应变让她很是认可。\"不错。\"她难得给出正面评价，\"下次再战。\"\n\n经验+50，穆宁雪好感+5，学校声望+3"
      },
      {
        text: "现在实力还不够，改天吧",
        effects: { setFlag: "mu_ningxue_spar_done", npcOpinion: { mu_ningxue: 2 } },
        resultText: "穆宁雪看了你一眼，\"有自知之明也好。不过...我等着那一天。\"她转身离开，留下一个清冷的背影。\n\n穆宁雪好感+2"
      }
    ]
  },

  influence_mu_ningxue_classmate_notice: {
    id: "influence_mu_ningxue_classmate_notice",
    name: "同学的关注",
    description: "赵满延凑过来，压低声音，\"哎，我最近看到穆宁雪跟你说话了？可以啊兄弟！她平时可不理人的，你是怎么做到的？\"周围几个同学也投来好奇的目光。",
    npcId: "zhao_manyan",
    activities: ["自习", "上课", "聊天", "找人聊天"],
    minRelationship: 25,
    requireFlag: "mu_ningxue_noticed",
    choices: [
      {
        text: "只是讨论修炼心得而已",
        effects: { reputation: { school: 3 } },
        resultText: "赵满延啧啧称奇，\"讨论修炼？穆宁雪愿意跟人讨论修炼？你面子够大的啊！\"同学们对你的印象更好了。\n\n学校声望+3"
      },
      {
        text: "她人其实没那么冷，只是不擅长表达",
        effects: { npcOpinion: { zhao_manyan: 3 }, reputation: { school: 2 } },
        resultText: "赵满延一脸惊讶，\"真的假的？我还以为她天生冰块呢...行吧，你厉害，能让冰山开口。\"他拍了拍你的肩膀。\n\n赵满延好感+3，学校声望+2"
      }
    ]
  },

  // ========== v0.50.0 张小侯事件链 ==========
  influence_zhang_xiaohou_confusion: {
    id: "influence_zhang_xiaohou_confusion",
    name: "风系困惑",
    description: "张小侯蹲在一旁，一脸苦恼地抓着头发。\"风系的星子怎么老是连不稳啊...明明已经很努力了，为什么就是不行呢...\"他看起来很沮丧。",
    npcId: "zhang_xiaohou",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 10,
    notFlag: "zhang_xiaohou_helped",
    choices: [
      {
        text: "风系讲究速度，试试缩短星子之间的间距",
        effects: { setFlag: "zhang_xiaohou_helped", npcOpinion: { zhang_xiaohou: 8 }, exp: 15 },
        resultText: "张小侯眼睛一亮，\"缩短间距？我试试！\"他按照你说的调整，果然星子连接稳定了许多。\"太厉害了！你怎么想到的？\"他对你佩服得五体投地。\n\n经验+15，张小侯好感+8，帮助了张小侯"
      },
      {
        text: "别着急，每个人的修炼节奏不同",
        effects: { setFlag: "zhang_xiaohou_helped", npcOpinion: { zhang_xiaohou: 5 } },
        resultText: "张小侯愣了一下，然后露出笑容，\"你说得对...我就是太急了。谢谢你！\"他的心情好了很多，看你的眼神也多了几分亲近。\n\n张小侯好感+5，帮助了张小侯"
      },
      {
        text: "你可以去问问老师，他们更专业",
        effects: { npcOpinion: { zhang_xiaohou: 2 } },
        resultText: "张小侯有点失落，\"也是...不过老师都很忙的。\"他挠挠头，没有再说什么。\n\n张小侯好感+2"
      }
    ]
  },

  influence_zhang_xiaohou_train_together: {
    id: "influence_zhang_xiaohou_train_together",
    name: "一起修炼",
    description: "张小侯兴冲冲地跑过来，\"嘿！上次你说的方法真有用！我星子连稳多了！\"他一脸兴奋，\"要不要一起修炼？两个人一起比一个人有意思多了！\"",
    npcId: "zhang_xiaohou",
    activities: ["修炼", "冥修"],
    minRelationship: 20,
    requireFlag: "zhang_xiaohou_helped",
    choices: [
      {
        text: "好，一起修炼，互相监督",
        effects: { exp: 35, npcOpinion: { zhang_xiaohou: 4 } },
        resultText: "你们找了个安静的角落一起修炼。张小侯虽然话多，但修炼起来很认真。有他在旁边，时间过得很快，修炼效果也不错。\n\n经验+35，张小侯好感+4"
      },
      {
        text: "今天有点事，下次吧",
        effects: { npcOpinion: { zhang_xiaohou: 1 } },
        resultText: "张小侯有点失望，\"好吧...那下次一定啊！\"他挥挥手跑开了。\n\n张小侯好感+1"
      }
    ]
  },

  influence_zhang_xiaohou_intel: {
    id: "influence_zhang_xiaohou_intel",
    name: "消息灵通",
    description: "张小侯神秘兮兮地凑过来，左右看了看才压低声音，\"我跟你说个秘密...我听说学校后面雪峰山深处有个隐秘的修炼洞，里面魔力浓度特别高！一般人我都不告诉他！\"",
    npcId: "zhang_xiaohou",
    activities: ["找人聊天", "自习", "聊天"],
    minRelationship: 25,
    requireFlag: "zhang_xiaohou_helped",
    notFlag: "knows_secret_cave",
    choices: [
      {
        text: "谢了，改天我去看看",
        effects: { setFlag: "knows_secret_cave", reputation: { school: 3 } },
        resultText: "张小侯得意地笑了，\"嘿嘿，我就知道你会感兴趣！不过那地方有点危险，你小心点。\"他对你的信任又深了一层。\n\n学校声望+3，得知隐秘修炼洞的情报"
      },
      {
        text: "真的假的，你别是道听途说吧",
        effects: { npcOpinion: { zhang_xiaohou: 2 }, setFlag: "knows_secret_cave" },
        resultText: "张小侯急了，\"真的！我亲耳听高年级学长说的！不信你去看！\"他一脸认真，不像是在骗人。\n\n张小侯好感+2，得知隐秘修炼洞的情报"
      }
    ]
  },

  influence_zhang_xiaohou_critical_moment: {
    id: "influence_zhang_xiaohou_critical_moment",
    name: "关键时刻",
    description: "你刚经历一场苦战，气息有些紊乱。张小侯不知从哪冒出来，一脸焦急，\"你没事吧！快，我这里有药水！\"他手忙脚乱地从包里掏出一瓶治愈药水递过来。",
    npcId: "zhang_xiaohou",
    activities: ["探索", "修炼", "找人聊天"],
    minRelationship: 35,
    requireFlag: "zhang_xiaohou_helped",
    choices: [
      {
        text: "谢谢，关键时刻还是你靠谱",
        effects: { addItem: { itemId: "health_potion", count: 1 }, npcOpinion: { zhang_xiaohou: 5 }, reputation: { school: 2 } },
        resultText: "张小侯挠挠头，\"嘿嘿，朋友嘛！以后有啥事尽管找我！\"他一脸真诚。你喝下药水，感觉好了很多。\n\n获得治愈药水x1，张小侯好感+5，学校声望+2"
      },
      {
        text: "不用，我还撑得住",
        effects: { npcOpinion: { zhang_xiaohou: 3 } },
        resultText: "张小侯一脸担心，\"逞强...不过你确实厉害。\"他把药水收回去，但还是在旁边陪着你，直到你恢复得差不多了才离开。\n\n张小侯好感+3"
      }
    ]
  },

  // ========== v0.51.0 赵满延事件链 ==========
  influence_zhao_manyan_defense: {
    id: "influence_zhao_manyan_defense",
    name: "光系防御的请教",
    description: "赵满延正在炫耀他的光系防御，\"看到没？光佑·圣盾！统领级攻击都能挡下！\"他得意地拍着胸脯，周围几个同学一脸羡慕。",
    npcId: "zhao_manyan",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 15,
    notFlag: "zhao_manyan_approved",
    choices: [
      {
        text: "赵兄厉害，能教教我防御心得吗？",
        effects: { setFlag: "zhao_manyan_approved", npcOpinion: { zhao_manyan: 5 }, exp: 15 },
        resultText: "赵满延大喜，\"有眼光！来来来，我跟你说，光系防御的关键在于...\"他滔滔不绝地讲了半天，虽然有些吹嘘的成分，但确实有干货。\n\n经验+15，赵满延好感+5，获得赵满延的认可"
      },
      {
        text: "光系防御确实强，但攻击方面呢？",
        effects: { setFlag: "zhao_manyan_approved", npcOpinion: { zhao_manyan: 3 } },
        resultText: "赵满延愣了一下，随即笑了，\"你还挺懂行！攻击嘛...不是我强项，但防御够强就行了呗！\"他对你的见识很是认可。\n\n赵满延好感+3，获得赵满延的认可"
      },
      {
        text: "默默观察，不说话",
        effects: { setFlag: "zhao_manyan_approved", npcOpinion: { zhao_manyan: 2 } },
        resultText: "你没有搭话，只是静静看着。赵满延注意到你的眼神，觉得你不像是在拍马屁，而是真的在观察。\"嘿，你这人有点意思。\"他主动凑了过来。\n\n赵满延好感+2，获得赵满延的认可"
      }
    ]
  },

  influence_zhao_manyan_resources: {
    id: "influence_zhao_manyan_resources",
    name: "赵氏的修炼资源",
    description: "赵满延压低声音凑过来，\"跟你说个事...我家里有些修炼用的魔石，品质不错。\"他虽然平时贪财，但对认可的朋友很大方，\"兄弟一场，分你一些？\"",
    npcId: "zhao_manyan",
    activities: ["找人聊天", "自习", "聊天"],
    minRelationship: 25,
    requireFlag: "zhao_manyan_approved",
    choices: [
      {
        text: "那就不客气了，谢了赵兄",
        effects: { addItem: { itemId: "magic_stone", count: 2 }, npcOpinion: { zhao_manyan: 3 } },
        resultText: "赵满延从包里掏出两块魔石塞给你，\"拿着拿着，别跟我客气！以后有好事也想着我就行！\"他一脸豪爽。\n\n获得魔石x2，赵满延好感+3"
      },
      {
        text: "不用，你自己留着修炼吧",
        effects: { npcOpinion: { zhao_manyan: 6 }, reputation: { school: 3 } },
        resultText: "赵满延一脸意外，随即拍了拍你的肩膀，\"够意思！行，那我就不客气了。不过以后有事尽管找我，赵氏家族的朋友，就是我赵满延的朋友！\"他对你更加看重了。\n\n赵满延好感+6，学校声望+3"
      }
    ]
  },

  influence_zhao_manyan_explore: {
    id: "influence_zhao_manyan_explore",
    name: "一起探索",
    description: "赵满延兴冲冲地跑过来，\"周末要不要一起去雪峰山探索？我听说那边有好东西！\"他拍着胸脯，\"有我光系护盾在，安全得很！就算遇到统领级妖魔也不怕！\"",
    npcId: "zhao_manyan",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 30,
    requireFlag: "zhao_manyan_approved",
    choices: [
      {
        text: "好，一起去，有赵兄在确实安心",
        effects: { exp: 40, npcOpinion: { zhao_manyan: 4 }, reputation: { school: 2 } },
        resultText: "你们一起去了雪峰山探索。赵满延的光系护盾确实靠谱，遇到危险时总能及时挡下。虽然他嘴上不停吹嘘，但实际行动很可靠。\n\n经验+40，赵满延好感+4，学校声望+2"
      },
      {
        text: "这周有点忙，下次吧",
        effects: { npcOpinion: { zhao_manyan: 1 } },
        resultText: "赵满延有点失望，\"行吧，那下次一定啊！\"他挥挥手跑开了。\n\n赵满延好感+1"
      }
    ]
  },

  influence_zhao_manyan_shield: {
    id: "influence_zhao_manyan_shield",
    name: "关键时刻的护盾",
    description: "你刚经历一场苦战，气息不稳，身上带伤。赵满延不知从哪冒出来，一道金色光盾瞬间挡在你面前，\"小心！有我在，别怕！\"他的光系防御确实名不虚传。",
    npcId: "zhao_manyan",
    activities: ["探索", "修炼", "找人聊天"],
    minRelationship: 40,
    requireFlag: "zhao_manyan_approved",
    choices: [
      {
        text: "谢了赵兄，关键时刻还是你靠谱",
        effects: { hp: 50, npcOpinion: { zhao_manyan: 5 }, reputation: { school: 3 } },
        resultText: "赵满延的光系治愈之力温暖地包裹着你，伤势迅速恢复。\"嘿嘿，那是自然！以后有事喊我，随叫随到！\"他一脸得意，但眼神中是真诚的关心。\n\nHP+50，赵满延好感+5，学校声望+3"
      },
      {
        text: "我还撑得住，不过谢了",
        effects: { npcOpinion: { zhao_manyan: 3 } },
        resultText: "赵满延收回光盾，\"行，你硬气！不过下次别逞强，受伤了不好。\"他虽然嘴上这么说，但还是在旁边陪着你，直到你状态好转。\n\n赵满延好感+3"
      }
    ]
  },

  // ========== v0.51.0 许昭霆事件链 ==========
  influence_xu_zhaoting_encounter: {
    id: "influence_xu_zhaoting_encounter",
    name: "雷系的较量",
    description: "许昭霆路过，扫了一眼你的修炼。\"八班的？\"他语气平淡，带着一丝居高临下，\"星子排列...还算稳。\"他的评价不高不低，但能让他开口，已经说明你引起了他的注意。",
    npcId: "xu_zhaoting",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 10,
    minLevel: 6,
    notFlag: "xu_zhaoting_respected",
    choices: [
      {
        text: "许学长雷系造诣深，能否指点一二？",
        effects: { setFlag: "xu_zhaoting_respected", npcOpinion: { xu_zhaoting: 2 } },
        resultText: "许昭霆哼了一声，\"算你有眼光。雷系...在于快和准。\"他难得多说了几句，虽然语气依然冷淡，但你能感觉到他并非完全拒绝。\n\n许昭霆好感+2，获得许昭霆的注意"
      },
      {
        text: "默默继续修炼，不卑不亢",
        effects: { setFlag: "xu_zhaoting_respected", npcOpinion: { xu_zhaoting: 4 }, exp: 10 },
        resultText: "你没有理会他的评价，继续专注修炼。许昭霆多看了你一眼，眼神中多了一丝意外。\"有点意思。\"他低声说了一句，便离开了。\n\n经验+10，许昭霆好感+4，获得许昭霆的注意"
      },
      {
        text: "雷系虽强，但也不是无敌",
        effects: { setFlag: "xu_zhaoting_respected", npcOpinion: { xu_zhaoting: 1 }, reputation: { school: 2 } },
        resultText: "许昭霆微微挑眉，\"口气不小。\"他的语气中没有愤怒，反而多了一丝兴趣，\"希望你有对应的实力。年度考核上，让我看看。\n\n许昭霆好感+1，学校声望+2，获得许昭霆的注意"
      }
    ]
  },

  influence_xu_zhaoting_teacher_compare: {
    id: "influence_xu_zhaoting_teacher_compare",
    name: "张老师的比较",
    description: "张建国老师在课上提到，\"最近有些同学进步很快，比如八班的那位...基础扎实，心态也好。\"他顿了顿，看向许昭霆，\"许昭霆，你也不要松懈，强中自有强中手。\"许昭霆的表情微微变化。",
    npcId: "xu_zhaoting",
    activities: ["上课", "自习", "修炼"],
    requireFlag: "xu_zhaoting_respected",
    choices: [
      {
        text: "课后向许昭霆表示只是运气好",
        effects: { npcOpinion: { xu_zhaoting: 3 } },
        resultText: "课后你找到许昭霆，表示只是运气好。他看了你一眼，\"运气也是实力的一部分。\"他的语气依然冷淡，但少了几分居高临下。\n\n许昭霆好感+3"
      },
      {
        text: "课后不主动提及，保持距离",
        effects: { npcOpinion: { xu_zhaoting: 2 } },
        resultText: "你没有主动找许昭霆。几天后你发现，他偶尔会在修炼时注意你的方向。不卑不亢的态度，反而让他更加在意。\n\n许昭霆好感+2"
      }
    ]
  },

  influence_xu_zhaoting_thunder_advice: {
    id: "influence_xu_zhaoting_thunder_advice",
    name: "雷系心得",
    description: "许昭霆难得主动开口，\"雷系星子活跃，难以控制。\"他顿了顿，看向你，\"但你的控制力...比我预想的好。这个技巧，你可以试试。\"他演示了一个雷系星子排列的技巧，动作精准而迅速。",
    npcId: "xu_zhaoting",
    activities: ["修炼", "找人聊天", "冥修"],
    minRelationship: 25,
    requireFlag: "xu_zhaoting_respected",
    choices: [
      {
        text: "认真学习，多谢许学长",
        effects: { exp: 45, npcOpinion: { xu_zhaoting: 3 } },
        resultText: "你聚精会神地学习他的技巧。雷系星子确实活跃，但按照他的方法排列后，稳定性大幅提升。许昭霆看着你的学习速度，微微点头。\n\n经验+45，许昭霆好感+3"
      },
      {
        text: "提出自己对星子控制的见解",
        effects: { npcOpinion: { xu_zhaoting: 5 }, reputation: { school: 2 } },
        resultText: "你说出了自己的一些想法。许昭霆沉默了片刻，\"...有点道理。\"他难得给出正面评价，\"你比我想的不简单。年度考核，我等着。\n\n许昭霆好感+5，学校声望+2"
      }
    ]
  },

  influence_xu_zhaoting_recognition: {
    id: "influence_xu_zhaoting_recognition",
    name: "竞争对手的认可",
    description: "许昭霆走到你面前，表情依然冷淡，但语气少了几分居高临下。\"年度考核快到了。\"他看着你，\"我不会手下留情。但...你是个值得认真对待的对手。\"这是他能给出的最高评价。",
    npcId: "xu_zhaoting",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 35,
    minLevel: 10,
    requireFlag: "xu_zhaoting_respected",
    choices: [
      {
        text: "彼此彼此，考核见真章",
        effects: { npcOpinion: { xu_zhaoting: 4 }, reputation: { school: 5 } },
        resultText: "许昭霆嘴角微动，似乎想笑但忍住了，\"好。我等着。\"他转身离开，背影挺直。周围的同学都看到了这一幕，对你的实力更加认可。\n\n许昭霆好感+4，学校声望+5"
      },
      {
        text: "许学长过奖了，我还需努力",
        effects: { npcOpinion: { xu_zhaoting: 2 } },
        resultText: "许昭霆看了你一眼，\"谦虚？不像你的风格。\"他顿了顿，\"不过...保持这种心态也好。\"他转身离开，你能感觉到他对你的认可。\n\n许昭霆好感+2"
      }
    ]
  },

  // ========== v0.52.0 穆白事件链 ==========
  influence_mu_bai_humility: {
    id: "influence_mu_bai_humility",
    name: "表面的谦逊",
    description: "穆白面带标准微笑走过来，\"你好，我是穆白。最近看你修炼很用功，有什么心得可以交流吗？\"他的语气礼貌而得体，但眼神中闪过一丝不易察觉的审视。",
    npcId: "mu_bai",
    activities: ["找人聊天", "自习", "修炼"],
    minRelationship: 10,
    minLevel: 5,
    notFlag: "mu_bai_noticed",
    choices: [
      {
        text: "客气回应，请教冰系修炼心得",
        effects: { setFlag: "mu_bai_noticed", npcOpinion: { mu_bai: 2 }, exp: 10 },
        resultText: "穆白笑容更盛了，\"冰系嘛...在于控制。\"他滔滔不绝地讲了一通，听起来很有道理，但你总觉得他在刻意展示。\n\n经验+10，穆白好感+2，引起穆白的注意"
      },
      {
        text: "简单回应，保持适当距离",
        effects: { setFlag: "mu_bai_noticed", npcOpinion: { mu_bai: 3 } },
        resultText: "你只是简单点了点头，没有多言。穆白的笑容微微一滞，似乎没想到你会这么冷淡。但他很快恢复了标准微笑，\"那...不打扰了。\"他离开时多看了你一眼。\n\n穆白好感+3，引起穆白的注意"
      },
      {
        text: "直接点破：穆学长的笑容很标准，但不太真诚",
        effects: { setFlag: "mu_bai_noticed", npcOpinion: { mu_bai: -5 }, reputation: { school: 3 } },
        resultText: "穆白的笑容僵在了脸上，片刻后才恢复，\"你...真会开玩笑。\"他的语气依然礼貌，但眼神中多了一丝阴冷。周围几个同学听到了你的话，暗暗投来佩服的目光。\n\n穆白好感-5，学校声望+3，引起穆白的注意"
      }
    ]
  },

  influence_mu_bai_spar: {
    id: "influence_mu_bai_spar",
    name: "冰系的切磋",
    description: "穆白\"恰好\"路过，\"这么巧？我正想找人切磋一下冰系技巧，要不要试试？\"他的笑容很真诚，但你能感觉到他想通过切磋证明什么。",
    npcId: "mu_bai",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 15,
    requireFlag: "mu_bai_noticed",
    choices: [
      {
        text: "好，请穆学长指教",
        effects: { npcOpinion: { mu_bai: 2 }, exp: 20 },
        resultText: "一场切磋下来，穆白的冰系控制确实精妙。他赢了之后谦虚地说\"承让了\"，但你能看到他眼中的得意。不过你也从中学到了不少。\n\n经验+20，穆白好感+2"
      },
      {
        text: "今天状态不好，下次吧",
        effects: { npcOpinion: { mu_bai: 1 } },
        resultText: "穆白笑容不变，\"没关系，随时恭候。\"他优雅地离开了。你不确定他是真的不在意，还是在心里记了一笔。\n\n穆白好感+1"
      },
      {
        text: "切磋可以，但点到为止",
        effects: { npcOpinion: { mu_bai: 3 }, reputation: { school: 2 } },
        resultText: "穆白微微挑眉，\"当然。\"切磋中他确实没有下重手，但你能感觉到他留了力。结束后他说\"你很不错\"，语气中少了几分居高临下。\n\n穆白好感+3，学校声望+2"
      }
    ]
  },

  influence_mu_bai_superiority: {
    id: "influence_mu_bai_superiority",
    name: "家族的优越感",
    description: "穆白不经意地提到，\"说起来，穆氏家族最近弄到了一批高品质魔石，修炼效果很不错。\"他看了你一眼，\"可惜家族资源有限，只能优先给嫡系子弟。\"他的语气中带着一丝不易察觉的优越感。",
    npcId: "mu_bai",
    activities: ["找人聊天", "自习", "聊天"],
    minRelationship: 20,
    requireFlag: "mu_bai_noticed",
    choices: [
      {
        text: "穆氏家族确实底蕴深厚",
        effects: { npcOpinion: { mu_bai: 2 } },
        resultText: "穆白很受用，\"那是自然。穆氏传承数百年，不是普通家族能比的。\"他的姿态更加优雅了。\n\n穆白好感+2"
      },
      {
        text: "出身不能决定一切，实力才是关键",
        effects: { npcOpinion: { mu_bai: -3 }, reputation: { school: 4 } },
        resultText: "穆白的笑容微微僵住，\"...你说得对。\"他的语气依然礼貌，但眼神冷了几分。周围几个同学听到了你的话，暗暗点头。\n\n穆白好感-3，学校声望+4"
      },
      {
        text: "沉默不语，不接话",
        effects: { npcOpinion: { mu_bai: 1 } },
        resultText: "你没有接话。穆白自讨没趣，笑了笑便转移了话题。他觉得你很识趣。\n\n穆白好感+1"
      }
    ]
  },

  influence_mu_bai_family_attention: {
    id: "influence_mu_bai_family_attention",
    name: "族亲的关注",
    description: "穆宁雪路过，看到你和穆白在一起，脚步微顿。穆白立刻换上更标准的笑容，\"宁雪堂姐，好巧。\"穆宁雪淡淡点头，目光在你身上停留了一秒，然后离开了。穆白的笑容有些微妙。",
    npcId: "mu_bai",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 25,
    requireFlag: "mu_bai_noticed",
    choices: [
      {
        text: "假装没注意到穆宁雪的反应",
        effects: { npcOpinion: { mu_bai: 1 } },
        resultText: "你没有表现出任何异样。穆白似乎有些意外，但很快恢复了正常。\n\n穆白好感+1"
      },
      {
        text: "事后找穆宁雪问问穆白的为人",
        effects: { npcOpinion: { mu_ningxue: 3, mu_bai: -2 } },
        resultText: "事后你找到穆宁雪。她沉默了片刻，\"穆白...表面功夫做得很好。你自己小心。\"她的语气平淡，但你能感觉到她的提醒是真心的。\n\n穆宁雪好感+3，穆白好感-2"
      },
      {
        text: "向穆白打听穆宁雪的事",
        effects: { npcOpinion: { mu_bai: 2, mu_ningxue: -1 } },
        resultText: "穆白眼睛一亮，\"宁雪堂姐？她是穆氏嫡系的天才，我们这些旁系子弟...\"他滔滔不绝地讲了起来，似乎觉得你和他是一类人。但不知为何，你总觉得穆宁雪对你的印象变差了一些。\n\n穆白好感+2，穆宁雪好感-1"
      }
    ]
  },

  // ========== v0.53.0 周敏事件链（次要NPC，2个事件） ==========
  influence_zhou_min_compare: {
    id: "influence_zhou_min_compare",
    name: "火系的较量",
    description: "周敏路过，看到你在修炼火系魔法，停下脚步。\"你的火系星子排列...还算稳。\"她的语气带着一丝不服输，\"要不要比比看谁的火系控制力更强？\"她的眼神中充满了好胜的光芒。",
    npcId: "zhou_min",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 10,
    minLevel: 5,
    notFlag: "zhou_min_noticed",
    choices: [
      {
        text: "好，比比看",
        effects: { setFlag: "zhou_min_noticed", npcOpinion: { zhou_min: 4 }, exp: 15 },
        resultText: "你们比试了一番火系控制力。虽然周敏的基础很扎实，但你的星子运转更加稳定。比试结束后，周敏虽然有些不服气，但还是点了点头，\"...你确实有两下子。\"\n\n经验+15，周敏好感+4，引起周敏的注意"
      },
      {
        text: "我还差得远，不敢比",
        effects: { setFlag: "zhou_min_noticed", npcOpinion: { zhou_min: 2 } },
        resultText: "周敏皱了皱眉，\"谦虚是好事，但太谦虚就是懦弱了。\"她虽然有些失望，但还是记住了你。\n\n周敏好感+2，引起周敏的注意"
      },
      {
        text: "火系不在于比，在于自己的节奏",
        effects: { setFlag: "zhou_min_noticed", npcOpinion: { zhou_min: 3 }, reputation: { school: 2 } },
        resultText: "周敏愣了一下，若有所思。\"...你说得对。\"她的语气少了几分好胜，多了几分认真，\"是我太执着于比较了。\"她看了你一眼，眼神中多了一丝认可。\n\n周敏好感+3，学校声望+2，引起周敏的注意"
      }
    ]
  },

  influence_zhou_min_recognition: {
    id: "influence_zhou_min_recognition",
    name: "强者的认可",
    description: "周敏走到你面前，表情少了几分之前的不服气，多了几分认真。\"你的进步速度...比我快。\"她顿了顿，直视着你的眼睛，\"我不会认输的，但...你确实很强。\"这是她能给出的最高评价。",    npcId: "zhou_min",
    activities: ["修炼", "找人聊天", "自习"],
    minRelationship: 20,
    minLevel: 8,
    requireFlag: "zhou_min_noticed",
    choices: [
      {
        text: "彼此彼此，一起进步",
        effects: { npcOpinion: { zhou_min: 5 }, reputation: { school: 3 } },
        resultText: "周敏嘴角微微上扬，\"好！那我就更努力了，下次一定超过你！\"她的眼中燃烧着斗志，但对你的认可溢于言表。周围的同学也看到了这一幕。\n\n周敏好感+5，学校声望+3"
      },
      {
        text: "谢谢，你也很强",
        effects: { npcOpinion: { zhou_min: 3 } },
        resultText: "周敏点点头，\"嗯。\"她没有多说，但你能感觉到她对你的态度已经完全转变了。\n\n周敏好感+3"
      }
    ]
  },

  // ========== v0.55.0 玩家专属导师线（唐月） ==========

  tang_yue_trial: {
    id: "tang_yue_trial",
    name: "唐月的考验",
    description: "修炼结束时，唐月叫住了你。她的表情比平时认真几分，你这段时间的进步，我都看在眼里。如果你愿意的话，我可以正式收你为徒。不过在此之前，我想看看你的实战能力。她的手中凝聚起淡淡的火系星子，不用怕，点到为止。",
    npcId: "tang_yue",
    activities: ["修炼", "自习", "上课", "冥修", "备课", "批改"],
    minRelationship: 50,
    minLevel: 8,
    notFlag: "tang_yue_mentor",
    weight: 50,
    choices: [
      { text: "接受考验，请老师指教", effects: { setFlag: "tang_yue_trial_accepted" }, resultText: "唐月微微点头，眼中闪过一丝赞许。很好。那就让我看看，你这些天的修炼成果吧。她的星子运转起来，一场温和的切磋就此展开。" },
      { text: "请求老师先指点一二", effects: { exp: 50, setFlag: "tang_yue_guidance_received" }, resultText: "唐月笑了笑，也好。她走到你身边，轻声讲解星子运转的诀窍。你听得入神，收获颇丰。经验+50，唐月好感+3" },
      { text: "婉拒，我还需要更多修炼", effects: { npcOpinion: { tang_yue: 5 } }, resultText: "唐月没有生气，反而温和地笑了，知道自己的不足，也是一种成长。没关系，等你准备好了，随时可以来找我。唐月好感+5" }
    ]
  },

  tang_yue_mentor_training: {
    id: "tang_yue_mentor_training",
    name: "师徒修炼",
    description: "你正在修炼时，唐月悄然出现在你身边。星子的节奏可以再稳一些。她轻声指点，作为我的学生，可不能偷懒哦。她的指导让你的修炼效率大幅提升。",
    npcId: "tang_yue",
    activities: ["修炼", "冥修"],
    requireFlag: "tang_yue_mentor",
    minRelationship: 50,
    weight: 30,
    choices: [
      { text: "认真听从指导", effects: { exp: 30, npcOpinion: { tang_yue: 2 } }, resultText: "你按照唐月的指点调整星子运转，果然顺畅了许多。修炼结束时，你感觉收获满满。经验+30，唐月好感+2" },
      { text: "提出自己的见解", effects: { exp: 20, npcOpinion: { tang_yue: 3 }, reputation: { school: 2 } }, resultText: "你说出自己对星子排列的理解，唐月眼睛一亮，这个角度很有意思。她认真思考了一会儿，你说得对，有时候确实不能拘泥于传统。经验+20，唐月好感+3，学校声望+2" }
    ]
  },

  tang_yue_mentor_care: {
    id: "tang_yue_mentor_care",
    name: "导师的关心",
    description: "你拖着疲惫的身体回到学校，唐月正好路过。她看到你苍白的脸色，眉头微皱，又修炼过度了？她从包里拿出一瓶药水递给你，身体是革命的本钱，作为我的学生，可不能把自己累垮了。",
    npcId: "tang_yue",
    activities: ["修炼", "自习", "上课", "冥修", "休息"],
    requireFlag: "tang_yue_mentor",
    minRelationship: 50,
    weight: 20,
    choices: [
      { text: "谢谢老师，我会注意的", effects: { addItem: "health_potion", npcOpinion: { tang_yue: 3 } }, resultText: "唐月点点头，知道就好。她看着你喝下药水，脸色好转后才放心离开。获得治愈药水x1，唐月好感+3" },
      { text: "老师放心，我有分寸", effects: { hp: 30, npcOpinion: { tang_yue: 2 } }, resultText: "唐月无奈地笑了笑，你们这些年轻人啊。她没有再多说，但你能感受到她的关心。恢复30HP，唐月好感+2" }
    ]
  },

  // ========== v0.56.0 导师系统深化 ==========

  tang_yue_monthly_support: {
    id: "tang_yue_monthly_support",
    name: "导师的月度支持",
    description: "月初，唐月找到你，递给你一个包裹。\"这是这个月的修炼材料，作为我的学生，可不能在资源上落后于人。\"她的语气温和但带着不容拒绝的意味。",
    npcId: "tang_yue",
    activities: ["修炼", "自习", "上课", "冥修"],
    requireFlag: "tang_yue_mentor",
    minRelationship: 50,
    weight: 40,
    choices: [
      { text: "感谢老师，我会好好利用", effects: { addItem: "health_potion", npcOpinion: { tang_yue: 2 } }, resultText: "唐月满意地点点头，\"好好修炼，别让我失望。\"你收到了治愈药水和修炼材料。唐月好感+2" },
      { text: "老师，这太贵重了", effects: { addItem: "mana_potion", npcOpinion: { tang_yue: 3 } }, resultText: "唐月笑了笑，\"跟我还客气什么？拿着吧。\"她硬是把东西塞给你。你收到了魔法药水。唐月好感+3" }
    ]
  },

  tang_yue_skill_teaching: {
    id: "tang_yue_skill_teaching",
    name: "唐月的传承",
    description: "师徒等级提升后，唐月决定传授你她的独门技巧。\"星子的排列，不只是按部就班。\"她的手中星子流转，\"真正的高手，能让星子更紧凑，释放更快。\"她开始认真教导你。",
    npcId: "tang_yue",
    activities: ["修炼", "自习", "冥修"],
    requireFlag: "tang_yue_mentor",
    minRelationship: 70,
    notFlag: "tang_yue_skill_taught",
    weight: 50,
    choices: [
      { text: "认真学习老师的技巧", effects: { setFlag: "tang_yue_skill_taught", exp: 100, npcOpinion: { tang_yue: 5 } }, resultText: "你认真学习唐月的星子紧凑排列法，火系技能释放速度提升。经验+100，唐月好感+5，获得被动：火系技能伤害+5%" },
      { text: "提出自己的理解", effects: { setFlag: "tang_yue_skill_taught", exp: 80, npcOpinion: { tang_yue: 8 }, reputation: { school: 5 } }, resultText: "你说出对星子排列的独特见解，唐月眼睛一亮，\"你...比我想象的更有天赋。\"她认真记下你的想法。经验+80，唐月好感+8，学校声望+5，获得被动：火系技能伤害+5%" }
    ]
  },

  // ========== v0.61.0 关系驱动任务系统：唐月线 ==========

  tang_yue_invitation: {
    id: "tang_yue_invitation",
    name: "唐月的邀请",
    description: "修炼结束时，唐月叫住了你。她的表情比平时温和几分，\"你这段时间的进步，我都看在眼里。放学后有空吗？我想给你一些单独指导。\"",
    npcId: "tang_yue",
    activities: [],
    minRelationship: 30,
    notFlag: "tang_yue_invitation_done",
    weight: 40,
    choices: [
      { text: "欣然接受，谢谢老师", effects: { setFlag: "tang_yue_invite_accepted", npcOpinion: { tang_yue: 5 } }, resultText: "唐月微微点头，眼中闪过一丝赞许。\"很好。放学后到办公室来找我。\"你感到很荣幸。唐月好感+5" },
      { text: "婉拒，我还有其他安排", effects: { setFlag: "tang_yue_invitation_done" }, resultText: "唐月没有生气，温和地笑了笑，\"没关系，有自己的安排是好事。等你有空了随时可以来找我。\"" },
      { text: "询问能否带朋友一起", effects: { setFlag: "tang_yue_invite_friend", npcOpinion: { tang_yue: 3 } }, resultText: "唐月想了想，\"可以啊，多个人一起讨论也不错。叫上你的朋友吧。\"唐月好感+3" }
    ]
  },

  tang_yue_practice_exam: {
    id: "tang_yue_practice_exam",
    name: "实践考核",
    description: "唐月找到你，表情认真。\"你的基础已经不错了。下周有一次魔法实践考核，我推荐你参加。这是证明自己的机会，但也有风险。\"",
    npcId: "tang_yue",
    activities: [],
    minRelationship: 50,
    requireFlag: "tang_yue_invite_accepted",
    notFlag: "tang_yue_exam_done",
    weight: 40,
    choices: [
      { text: "接受挑战，我准备好了", effects: { setFlag: "tang_yue_exam_accepted", npcOpinion: { tang_yue: 5 } }, resultText: "唐月满意地点头，\"有胆量。那就让我看看你的实力。\"唐月好感+5" },
      { text: "请求降低难度", effects: { setFlag: "tang_yue_exam_easy", npcOpinion: { tang_yue: -2 } }, resultText: "唐月皱了皱眉，\"好吧，我会安排简单一些的考核。但你要知道，实战不会给你降低难度。\"唐月好感-2" },
      { text: "请求同学协助组队", effects: { setFlag: "tang_yue_exam_team", npcOpinion: { tang_yue: 3 } }, resultText: "唐月想了想，\"团队合作也是重要的能力。可以，你找个同学一起吧。\"唐月好感+3" }
    ]
  },

  tang_yue_formal_mentor: {
    id: "tang_yue_formal_mentor",
    name: "正式拜师",
    description: "唐月看着你，眼神中带着期待。\"你已经证明了自己的实力和心性。我正式问你——愿意成为我的弟子吗？这意味着更多的责任，也意味着更多的资源。\"",
    npcId: "tang_yue",
    activities: [],
    minRelationship: 80,
    requireFlag: "tang_yue_exam_done",
    notFlag: "tang_yue_mentor",
    weight: 50,
    choices: [
      { text: "愿意拜师，请老师收下我", effects: { setFlag: "tang_yue_mentor", npcOpinion: { tang_yue: 10 } }, resultText: "唐月露出欣慰的笑容，\"好！从今天起，你就是我的正式弟子。我会倾囊相授，但你也要更加努力。\"唐月好感+10，正式拜师成功！导师修炼加成提升至15%" },
      { text: "我需要时间考虑", effects: { setFlag: "tang_yue_mentor_pending" }, resultText: "唐月点点头，\"这是重要的决定，你慢慢考虑。我等你的答复。\"" },
      { text: "婉拒，我想走自己的路", effects: { setFlag: "tang_yue_mentor_declined", npcOpinion: { tang_yue: -5 } }, resultText: "唐月有些失落，但还是尊重你的选择，\"每个人都有自己的路。祝你好运。\"唐月好感-5" }
    ]
  },

  // ========== v0.62.0 关系驱动任务系统：穆宁雪线 ==========

  mu_ningxue_invitation: {
    id: "mu_ningxue_invitation",
    name: "冰系的认可",
    description: "你修炼结束时，穆宁雪恰好路过。她看了你一眼，语气平淡：\"你的冰系...有点意思。基础不错，但星子运转太保守了。\"她顿了顿，\"放学后训练馆有空，要来切磋一下吗？\"",
    npcId: "mu_ningxue",
    activities: [],
    minRelationship: 30,
    notFlag: "mu_ningxue_invite_done",
    weight: 40,
    choices: [
      { text: "接受邀请，请多指教", effects: { setFlag: "mu_ningxue_invite_accepted", npcOpinion: { mu_ningxue: 5 } }, resultText: "穆宁雪微微点头，\"很好。放学后训练馆见。\"你感到她的认可。穆宁雪好感+5" },
      { text: "婉拒，我还需要更多修炼", effects: { setFlag: "mu_ningxue_invite_declined" }, resultText: "穆宁雪没有多说什么，点头离开了。你觉得她可能有些失望。" },
      { text: "反问她为什么帮我", effects: { setFlag: "mu_ningxue_invite_question", npcOpinion: { mu_ningxue: 3 } }, resultText: "穆宁雪愣了一下，然后说：\"没什么，只是觉得你有潜力。\"她的语气难得有了一丝温度。穆宁雪好感+3" }
    ]
  },

  mu_ningxue_family_pressure: {
    id: "mu_ningxue_family_pressure",
    name: "穆家的压力",
    description: "你在走廊遇到穆宁雪，她的表情比平时凝重。看到你，她犹豫了一下，开口道：\"穆家...最近有些事。我可能需要离开一段时间。\"她看着你，\"你觉得，一个人应该为家族牺牲自己的追求吗？\"",
    npcId: "mu_ningxue",
    activities: [],
    minRelationship: 50,
    requireFlag: "mu_ningxue_invite_done",
    notFlag: "mu_ningxue_family_done",
    weight: 40,
    choices: [
      { text: "家族责任更重要", effects: { setFlag: "mu_ningxue_family_duty", npcOpinion: { mu_ningxue: 3 } }, resultText: "穆宁雪若有所思，\"...也许你说得对。\"她的表情复杂，有释然也有无奈。穆宁雪好感+3" },
      { text: "追求自己的路更重要", effects: { setFlag: "mu_ningxue_own_path", npcOpinion: { mu_ningxue: 5 } }, resultText: "穆宁雪眼神变得坚定，\"你说得对。我的路，应该由我自己走。\"她看起来轻松了一些。穆宁雪好感+5" },
      { text: "这要看你自己想要什么", effects: { setFlag: "mu_ningxue_self_choice", npcOpinion: { mu_ningxue: 8 } }, resultText: "穆宁雪认真看了你一眼，\"...你总是能说到点子上。\"她的语气中带着感激。穆宁雪好感+8" }
    ]
  },

  mu_ningxue_ice_extreme: {
    id: "mu_ningxue_ice_extreme",
    name: "冰系的极致",
    description: "穆宁雪找到你，眼神中带着从未有过的认真。\"我想清楚了。冰系的极致，不是寒冷，是绝对的宁静。\"她看着你，\"这条路很难，我一个人走可能会迷失。你愿意...和我一起追求吗？\"",
    npcId: "mu_ningxue",
    activities: [],
    minRelationship: 80,
    requireFlag: "mu_ningxue_family_done",
    notFlag: "mu_ningxue_extreme_done",
    weight: 50,
    choices: [
      { text: "我愿意和你一起", effects: { setFlag: "mu_ningxue_ice_extreme", npcOpinion: { mu_ningxue: 10 } }, resultText: "穆宁雪露出难得的笑容，\"好。那我们一起。\"她的眼神中带着信任。穆宁雪好感+10" },
      { text: "我有自己的路，但我支持你", effects: { setFlag: "mu_ningxue_support", npcOpinion: { mu_ningxue: 5 } }, resultText: "穆宁雪点点头，\"谢谢你。每个人都有自己的路，我理解。\"她的语气真诚。穆宁雪好感+5" },
      { text: "冰系的极致可能不是你想的那样", effects: { setFlag: "mu_ningxue_doubt", npcOpinion: { mu_ningxue: -3 } }, resultText: "穆宁雪皱眉，\"你不懂。\"她转身离开，但你能感觉到她在思考你的话。穆宁雪好感-3" }
    ]
  },

  // ========== v0.63.0 NPC间关系联动：穆白×张小侯 ==========

  mu_bai_zhang_xiaohou_conflict: {
    id: "mu_bai_zhang_xiaohou_conflict",
    name: "走廊的冲突",
    description: "你在走廊看到穆白和张小侯对峙。穆白冷笑：\"乡下来的就是没规矩，训练馆的器材是你随便碰的？\"张小侯脸涨红：\"我明明排队了！是你插队！\"两人看到你，都看向你。",
    npcId: "mu_bai",
    activities: [],
    minRelationships: { mu_bai: 30, zhang_xiaohou: 30 },
    notFlag: "mx_zxh_conflict_done",
    weight: 40,
    choices: [
      { text: "帮张小侯说话", effects: { setFlag: ["mx_zxh_support_xiaohou", "mx_zxh_conflict_done"], npcOpinion: { zhang_xiaohou: 10, mu_bai: -15 } }, resultText: "你站到张小侯这边：\"我刚才看到了，是他先排队的。\"穆白脸色难看，冷哼一声离开。张小侯感激地看着你。张小侯好感+10，穆白好感-15" },
      { text: "帮穆白说话", effects: { setFlag: ["mx_zxh_support_mubai", "mx_zxh_conflict_done"], npcOpinion: { mu_bai: 10, zhang_xiaohou: -15 } }, resultText: "你对穆白说：\"穆白说得对，训练馆器材确实要按规矩来。\"穆白满意地点头，张小侯失望地看着你。穆白好感+10，张小侯好感-15" },
      { text: "中立调解", effects: { setFlag: ["mx_zxh_mediated", "mx_zxh_conflict_done"], npcOpinion: { mu_bai: 5, zhang_xiaohou: 5 } }, resultText: "你打圆场：\"都是同学，别伤了和气。器材轮流用就好了。\"两人都有些不情愿，但还是点了头。穆白好感+5，张小侯好感+5" },
      { text: "暗示穆白你能\"教训\"张小侯", effects: { setFlag: ["mx_zxh_manipulated", "mx_zxh_conflict_done"], npcOpinion: { mu_bai: 5, zhang_xiaohou: -20 } }, resultText: "你低声对穆白说：\"这种人，不用跟他客气。\"穆白看了你一眼，没说话。张小侯似乎听到了，失望地离开。穆白好感+5但信任下降，张小侯好感-20" }
    ]
  },

  mu_bai_zhang_xiaohou_cooperation: {
    id: "mu_bai_zhang_xiaohou_cooperation",
    name: "训练馆的合作",
    description: "穆白和张小侯在训练馆遇到。穆白难得没有嘲讽：\"上次的事...算了。\"张小侯挠头：\"我也有不对的地方。\"两人看向你，\"既然你在，要不一起训练？\"",
    npcId: "mu_bai",
    activities: [],
    minRelationships: { mu_bai: 50, zhang_xiaohou: 50 },
    requireFlag: "mx_zxh_mediated",
    notFlag: "mx_zxh_cooperation_done",
    weight: 40,
    choices: [
      { text: "鼓励他们一起训练", effects: { setFlag: ["mx_zxh_friends", "mx_zxh_cooperation_done"], npcOpinion: { mu_bai: 10, zhang_xiaohou: 10 } }, resultText: "你笑着说：\"一起训练吧，互相切磋进步更快。\"两人对视一眼，点了头。训练中他们配合得意外地好。穆白好感+10，张小侯好感+10，两人成为朋友！" },
      { text: "自己训练，让他们自己决定", effects: { setFlag: ["mx_zxh_neutral", "mx_zxh_cooperation_done"] }, resultText: "你说：\"你们自己决定吧，我先去训练了。\"两人有些失望，但还是各自训练。关系保持中立。" },
      { text: "故意挑起竞争", effects: { setFlag: ["mx_zxh_rivals", "mx_zxh_cooperation_done"], npcOpinion: { mu_bai: 5, zhang_xiaohou: 5 } }, resultText: "你说：\"要不比比看，谁的实力更强？\"两人眼睛一亮，竞争心被激发。穆白好感+5，张小侯好感+5，两人成为良性竞争对手！" }
    ]
  },

  // ========== v0.64.0 NPC间关系联动：唐月×穆宁雪（师生） ==========

  ty_mnx_discussion: {
    id: "ty_mnx_discussion",
    name: "师生的讨论",
    description: "你在训练馆外看到唐月和穆宁雪站在一起。唐月眉头微皱：\"你的冰系星子运转太快了，这样下去会损伤经脉。\"穆宁雪语气平静：\"老师，我知道自己在做什么。\"两人似乎有些争执。她们看到你，都停下了话头。",
    npcId: "tang_yue",
    activities: [],
    minRelationships: { tang_yue: 30, mu_ningxue: 30 },
    notFlag: "ty_mnx_discussion_done",
    weight: 40,
    choices: [
      { text: "旁听学习，不插话", effects: { setFlag: ["ty_mnx_observer", "ty_mnx_discussion_done"], npcOpinion: { tang_yue: 3, mu_ningxue: 3 } }, resultText: "你安静地站在一旁听她们讨论。唐月的讲解细致入微，穆宁雪的提问切中要害。你学到了不少。唐月好感+3，穆宁雪好感+3，经验+50" },
      { text: "认同唐月的观点", effects: { setFlag: ["ty_mnx_support_teacher", "ty_mnx_discussion_done"], npcOpinion: { tang_yue: 8, mu_ningxue: -5 } }, resultText: "你对唐月说：\"老师说得对，基础扎实才能走得更远。\"唐月赞许地点头，穆宁雪看了你一眼，没说话。唐月好感+8，穆宁雪好感-5" },
      { text: "支持穆宁雪的追求", effects: { setFlag: ["ty_mnx_support_student", "ty_mnx_discussion_done"], npcOpinion: { mu_ningxue: 8, tang_yue: -3 } }, resultText: "你对穆宁雪说：\"追求极致没有错，只是要注意方法。\"穆宁雪眼中闪过一丝认可，唐月叹了口气。穆宁雪好感+8，唐月好感-3" },
      { text: "提议一起实践验证", effects: { setFlag: ["ty_mnx_practice", "ty_mnx_discussion_done"], npcOpinion: { tang_yue: 5, mu_ningxue: 5 } }, resultText: "你说：\"不如一起实践看看，谁的方法更有效？\"两人对视一眼，都同意了。唐月好感+5，穆宁雪好感+5" }
    ]
  },

  ty_mnx_practice: {
    id: "ty_mnx_practice",
    name: "实践课的默契",
    description: "实践课上，唐月安排你和穆宁雪对练。她在一旁观察，不时点头。穆宁雪的冰系攻势凌厉，你勉强招架。唐月突然开口：\"停。你们的配合有问题——不是对抗，是互补。\"她开始指导你们如何配合。",
    npcId: "tang_yue",
    activities: [],
    minRelationships: { tang_yue: 50, mu_ningxue: 50 },
    requireFlag: "ty_mnx_practice",
    notFlag: "ty_mnx_practice_done",
    weight: 40,
    choices: [
      { text: "认真学习配合技巧", effects: { setFlag: ["ty_mnx_learned", "ty_mnx_practice_done"], npcOpinion: { tang_yue: 5, mu_ningxue: 5 } }, resultText: "你认真按照唐月的指导调整节奏，和穆宁雪的配合越来越默契。训练结束时，两人都有所收获。唐月好感+5，穆宁雪好感+5，经验+100" },
      { text: "坚持自己的战斗风格", effects: { setFlag: ["ty_mnx_independent", "ty_mnx_practice_done"], npcOpinion: { tang_yue: -3, mu_ningxue: 3 } }, resultText: "你觉得配合限制了自己的发挥，坚持按自己的方式战斗。唐月有些失望，穆宁雪却似乎欣赏你的独立。唐月好感-3，穆宁雪好感+3" },
      { text: "提议穆宁雪主导，你辅助", effects: { setFlag: ["ty_mnx_support_role", "ty_mnx_practice_done"], npcOpinion: { tang_yue: 3, mu_ningxue: 8 } }, resultText: "你主动承担辅助角色，让穆宁雪发挥冰系优势。穆宁雪难得地笑了：\"你很懂配合。\"唐月也点头认可。穆宁雪好感+8，唐月好感+3" }
    ]
  },

  // ========== v0.65.0 NPC间关系联动：赵满延×穆白（富家子弟的较量） ==========

  zmy_mb_rivalry: {
    id: "zmy_mb_rivalry",
    name: "富家子弟的较量",
    description: "你在走廊看到赵满延和穆白面对面站着。赵满延抱着胳膊：\"穆白，别以为你是穆家的就了不起，光系防御可不是吃素的。\"穆白冷笑：\"光系？也就只能躲在后面喊加油了。\"两人剑拔弩张。他们看到你，都停下了话头。",
    npcId: "zhao_manyan",
    activities: [],
    minRelationships: { zhao_manyan: 30, mu_bai: 30 },
    notFlag: "zmy_mb_rivalry_done",
    weight: 40,
    choices: [
      { text: "支持赵满延", effects: { setFlag: ["zmy_mb_support_zmy", "zmy_mb_rivalry_done"], npcOpinion: { zhao_manyan: 10, mu_bai: -10 } }, resultText: "你对赵满延说：\"光系防御在团队中可是核心，穆白你别小看人。\"赵满延得意地笑了，穆白脸色难看。赵满延好感+10，穆白好感-10" },
      { text: "支持穆白", effects: { setFlag: ["zmy_mb_support_mb", "zmy_mb_rivalry_done"], npcOpinion: { mu_bai: 10, zhao_manyan: -10 } }, resultText: "你对穆白说：\"冰系的攻击力确实强，赵满延你别光说不练。\"穆白满意地点头，赵满延撇了撇嘴。穆白好感+10，赵满延好感-10" },
      { text: "中立调解", effects: { setFlag: ["zmy_mb_mediated", "zmy_mb_rivalry_done"], npcOpinion: { zhao_manyan: 3, mu_bai: 3 } }, resultText: "你打圆场：\"都是同学，别伤了和气。光系防御和冰系攻击各有优势。\"两人都有些不情愿，但还是点了头。赵满延好感+3，穆白好感+3" },
      { text: "提议用实力说话", effects: { setFlag: ["zmy_mb_challenge", "zmy_mb_rivalry_done"], npcOpinion: { zhao_manyan: 5, mu_bai: 5 } }, resultText: "你说：\"光说没用，不如找时间比试一场？\"两人眼睛一亮，都同意了。赵满延好感+5，穆白好感+5" }
    ]
  },

  zmy_mb_match: {
    id: "zmy_mb_match",
    name: "实力的较量",
    description: "训练馆里，赵满延和穆白相对而立。赵满延展开光系护盾：\"来吧，让你看看什么叫绝对防御！\"穆白凝聚冰系星子：\"防御再厚，也挡不住冰系的穿透。\"两人看向你：\"你来当裁判？\"",
    npcId: "zhao_manyan",
    activities: [],
    minRelationships: { zhao_manyan: 50, mu_bai: 50 },
    requireFlag: "zmy_mb_challenge",
    notFlag: "zmy_mb_match_done",
    weight: 40,
    choices: [
      { text: "当公正的裁判", effects: { setFlag: ["zmy_mb_referee", "zmy_mb_match_done"], npcOpinion: { zhao_manyan: 5, mu_bai: 5 } }, resultText: "你认真观察两人的比试，公正判罚。比赛结束后，两人都对你的公正表示认可。赵满延好感+5，穆白好感+5，经验+80" },
      { text: "暗中帮赵满延加油", effects: { setFlag: ["zmy_mb_cheer_zmy", "zmy_mb_match_done"], npcOpinion: { zhao_manyan: 8, mu_bai: -5 } }, resultText: "你趁穆白不注意，悄悄给赵满延递了个鼓励的眼神。赵满延士气大振，赢了比试。穆白似乎察觉到了什么，有些不满。赵满延好感+8，穆白好感-5" },
      { text: "暗中帮穆白加油", effects: { setFlag: ["zmy_mb_cheer_mb", "zmy_mb_match_done"], npcOpinion: { mu_bai: 8, zhao_manyan: -5 } }, resultText: "你趁赵满延不注意，悄悄给穆白递了个鼓励的眼神。穆白冰系攻势更猛，赢了比试。赵满延似乎察觉到了什么，有些不满。穆白好感+8，赵满延好感-5" }
    ]
  },

  // ========== v0.66.0 博城灾难前兆：异常迹象 ==========

  bocheng_anomaly: {
    id: "bocheng_anomaly",
    name: "异常的妖魔活动",
    description: "你在学校附近探索时，发现了一些不寻常的迹象——草丛里有妖魔的爪印，空气中弥漫着淡淡的血腥味，几只低级妖魔在白天出没（通常妖魔只在夜间活动）。唐月老师似乎也注意到了什么，她的表情比平时严肃。",
    npcId: "tang_yue",
    activities: [],
    minLevel: 15,
    minRelationship: 10,
    notFlag: "bocheng_phase1_done",
    weight: 30,
    choices: [
      { text: "立刻告诉唐月老师", effects: { setFlag: ["bd_tell_tangyue", "bocheng_phase1_done"], npcOpinion: { tang_yue: 10 } }, resultText: "你找到唐月，详细描述了发现的异常。唐月的脸色变得凝重：\"你说的这些...很不对劲。我会立刻上报学校，加强巡逻。\"她拍了拍你的肩膀，\"谢谢你，你很敏锐。\"唐月好感+10，学校开始秘密调查" },
      { text: "告诉穆宁雪", effects: { setFlag: ["bd_tell_muningxue", "bocheng_phase1_done"], npcOpinion: { mu_ningxue: 8 } }, resultText: "你找到穆宁雪，告诉她你的发现。穆宁雪闭上眼睛，冰系星子微微运转：\"空气中...有空间波动的痕迹。\"她睁开眼，\"这件事不简单。我会用冰系感知继续监视。\"穆宁雪好感+8，穆宁雪开始秘密调查" },
      { text: "自己继续调查", effects: { setFlag: ["bd_investigate_alone", "bocheng_phase1_done"] }, resultText: "你决定自己深入调查。连续几天，你在学校周围仔细搜寻，发现了更多线索——地圣泉方向的能量波动异常，还有几个陌生人在学校附近出没。你获得了宝贵的情报，但也引起了某些人的注意。玩家掌握独立情报" },
      { text: "可能只是自己多想了", effects: { setFlag: ["bd_ignore", "bocheng_phase1_done"] }, resultText: "你觉得可能是自己太敏感了，毕竟博城一直很安全。你把这些异常抛在脑后，继续正常的学习生活。（但异常并没有消失...）" }
    ]
  },

  // ========== v0.67.0 博城灾难第二阶段：预警与准备 ==========

  bocheng_prep: {
    id: "bocheng_prep",
    name: "备战的气息",
    description: "学校的气氛变得有些不同。巡逻的老师多了起来，训练馆的防御法阵被重新加固。唐月找到你，表情严肃：\"你之前发现的异常...我们调查后确认，博城的地圣泉能量波动异常，可能有大事发生。学校正在秘密准备，你愿意帮忙吗？\"",
    npcId: "tang_yue",
    activities: [],
    minLevel: 16,
    requireFlag: ["bd_tell_tangyue", "bd_tell_muningxue", "bd_investigate_alone"],
    notFlag: "bocheng_phase2_done",
    weight: 30,
    choices: [
      { text: "全力协助学校准备", effects: { setFlag: ["bd_full_prep", "bocheng_phase2_done"], npcOpinion: { tang_yue: 5 } }, resultText: "你点头：\"我能做什么？\"唐月递给你一份清单：\"协助巡逻、加固防御法阵、通知同学。你的贡献学校会记住。\"唐月好感+5，学校声望+10，进入全面备战状态" },
      { text: "专注提升自己的实力", effects: { setFlag: ["bd_self_prep", "bocheng_phase2_done"] }, resultText: "你说：\"如果真有大事，我需要更强的实力。\"唐月理解地点头：\"也好，实力是根本。去修炼吧，有事我会找你。\"经验+100，玩家专注自我提升" },
      { text: "暗中调查真相", effects: { setFlag: ["bd_secret_investigate", "bocheng_phase2_done"], npcOpinion: { tang_yue: -3 } }, resultText: "你觉得学校的准备还不够，决定自己暗中调查真相。唐月有些不满：\"别乱来，这不是你一个学生能承担的。\"但你已经下定决心。唐月好感-3，玩家开始秘密调查" }
    ]
  },

  bocheng_anomaly_escalation: {
    id: "bocheng_anomaly_escalation",
    name: "异常加剧",
    description: "你在修炼时，突然感到地面微微震动。窗外，几只低级妖魔在白天乱窜，学生们惊慌失措。唐月老师匆匆跑来：\"所有人注意！妖魔活动异常，立刻回到教室！\"她看到你，\"你也看到了吧？之前那些异常...原来是真的。\"她的语气中带着一丝自责。",
    npcId: "tang_yue",
    activities: [],
    minLevel: 16,
    requireFlag: "bd_ignore",
    notFlag: "bocheng_phase2_done",
    weight: 30,
    choices: [
      { text: "主动参与疏散同学", effects: { setFlag: ["bd_evacuation", "bocheng_phase2_done"], npcOpinion: { tang_yue: 8 } }, resultText: "你立刻行动：\"大家跟我来，不要慌！\"你有序地疏散同学，唐月感激地看了你一眼。唐月好感+8，学校声望+15，玩家在危机中展现领导力" },
      { text: "去调查妖魔来源", effects: { setFlag: ["bd_investigate_source", "bocheng_phase2_done"] }, resultText: "你决定冒险去调查妖魔来源。沿着妖魔出现的方向，你发现了空间波动的痕迹——有人在故意引妖魔入城。经验+80，玩家发现关键线索" },
      { text: "先保证自己安全", effects: { setFlag: ["bd_self_safety", "bocheng_phase2_done"] }, resultText: "你选择先回到安全的地方。这不是懦弱，只是理智——你还没有准备好面对未知的危险。但你心里知道，这件事还没结束..." }
    ]
  },

  // ========== v0.68.0 博城灾难第三阶段：灾难降临 ==========

  bocheng_disaster: {
    id: "bocheng_disaster",
    name: "灾难降临",
    description: "博城的天空突然变暗。地圣泉方向爆发出强烈的能量波动，空间裂缝撕开，无数妖魔从裂缝中涌出。尖叫声、爆炸声、魔法光芒交织在一起。唐月老师冲到你面前，衣服上沾着灰尘：\"灾难来了！黑教廷引爆了地圣泉，空间裂缝正在扩大！你打算怎么做？\"",
    npcId: "tang_yue",
    activities: [],
    minLevel: 17,
    requireFlag: "bocheng_phase2_done",
    notFlag: "bocheng_phase3_done",
    weight: 40,
    choices: [
      { text: "加入前线防御", effects: { setFlag: ["bd_hero_frontline", "bocheng_phase3_done"] }, resultText: "你握紧拳头：\"我去前线！\"唐月点头：\"小心，跟紧老师的队伍。\"你冲向战场，火焰在你手中绽放。你挡住了一只进阶妖魔的攻击，为同学争取了撤退时间。声望+20，你成为前线的英雄" },
      { text: "组织同学疏散", effects: { setFlag: ["bd_hero_evacuation", "bocheng_phase3_done"], npcOpinion: { tang_yue: 10 } }, resultText: "你大喊：\"所有人跟我走，不要慌！\"你组织起混乱的同学，有序地向安全区撤退。途中你用魔法挡住了几只低级妖魔的袭击。唐月感激地看着你：\"多亏了你，很多孩子才能活下来。\"声望+15，唐月好感+10，你是疏散中的领导者" },
      { text: "寻找灾难根源", effects: { setFlag: ["bd_hero_investigate", "bocheng_phase3_done"] }, resultText: "你注意到空间裂缝的能量来源——地圣泉方向有一个黑袍人在施法。你决定绕到后方，寻找灾难的根源。你悄悄接近，发现了黑教廷的祭坛。虽然无法阻止，但你记住了关键信息。经验+200，你掌握了黑教廷的关键情报" }
    ]
  },

  // ========== v0.69.0 博城灾难后：新的开始 ==========

  bocheng_aftermath_event: {
    id: "bocheng_aftermath_event",
    name: "灾难后的黎明",
    description: "清晨的阳光照在博城的废墟上。空气中还弥漫着烟尘和魔法残留的气息。唐月老师站在临时安置点前，看到你走来，她的眼睛有些红肿，但表情坚定：\"你来了。昨晚...很多人活了下来，很多人没有。但你做了你能做的一切。\"她递给你一封信，\"这是学校的推荐信。博城已经不适合继续学习了，你应该去更广阔的地方。\"",
    npcId: "tang_yue",
    activities: [],
    minLevel: 18,
    requireFlag: "bd_disaster_complete",
    notFlag: "bocheng_aftermath_event_done",
    weight: 40,
    choices: [
      { text: "询问博城的未来", effects: { setFlag: ["bd_ask_future", "bocheng_aftermath_event_done"] }, resultText: "你问：\"博城...以后怎么办？\"唐月望向废墟：\"会重建的。博城人不会被打垮。但你还年轻，不该被困在这里。去外面看看吧，变得更强，然后回来。\"声望+5，你了解了博城的未来" },
      { text: "询问黑教廷的情况", effects: { setFlag: ["bd_ask_blackchurch", "bocheng_aftermath_event_done"], npcOpinion: { tang_yue: 5 } }, resultText: "你问：\"黑教廷...会被抓住吗？\"唐月的表情变得严肃：\"他们跑了。但圣裁院已经介入调查。你如果有什么线索...可以告诉我。\"唐月好感+5，黑教廷剧情线开启" },
      { text: "接受推荐信，准备离开", effects: { setFlag: ["bd_accept_letter", "bocheng_aftermath_event_done"] }, resultText: "你接过推荐信：\"我会的。\"唐月拍了拍你的肩膀：\"去吧。记住，魔法的意义不是力量，而是守护。\"经验+150，你准备离开博城" }
    ]
  },

  // ========== v2.9.2 博城北门新互动事件 ==========

  event_guard_warning: {
    id: "event_guard_warning",
    name: "守卫的警告",
    description: "守卫队长看到你，走过来压低声音：\"最近城外不太太平，雪峰山方向有妖魔活动的迹象。如果要出城，务必小心。\"他顿了顿，\"听说有小队在城外失联了，军方正在调查。\"",
    weight: 30,
    choices: [
      { text: "询问具体情况", effects: { exp: 5, reputation: { military: 3 } }, resultText: "守卫队长详细说明了情况：三天前，一支猎魔小队在雪峰山外围失联，搜索队只找到了破损的武器和血迹。\"不像是普通妖魔干的，\"他皱眉，\"手法很干净。\"你获得了重要情报，军方声望+3，经验+5" },
      { text: "表示会小心", effects: { exp: 2 }, resultText: "你点头表示明白：\"谢谢提醒，我会注意的。\"守卫队长拍了拍你的肩膀：\"年轻人，小心驶得万年船。\"经验+2" },
      { text: "主动请求参与搜索", effects: { exp: 10, reputation: { military: 5 }, setFlag: ["volunteer_search"] }, resultText: "你主动请求：\"队长，我也想出一份力。\"守卫队长有些意外，随即点头：\"好，有勇气。明天搜索队出发，你到北门集合。\"军方声望+5，经验+10，你获得了参与搜索的资格" }
    ]
  },

  event_distant_sight: {
    id: "event_distant_sight",
    name: "远眺所见",
    description: "你站在城墙上眺望远方。天气晴朗，视野很好。你看到远处的雪峰山轮廓清晰，山脚下似乎有什么东西在移动。仔细看去，像是一群飞鸟被什么惊起，四散飞逃。",
    weight: 25,
    choices: [
      { text: "仔细观察", effects: { exp: 3, setFlag: ["noticed_distant_anomaly"] }, resultText: "你凝神观察，发现飞鸟惊起的方向正是雪峰山外围。那里似乎有烟尘升起，但距离太远，看不清楚。你记下了这个异常情况。经验+3" },
      { text: "告诉守卫", effects: { exp: 5, reputation: { military: 2 } }, resultText: "你把看到的情况告诉了守卫。守卫皱眉望去，随即点头：\"多谢提醒，我们会加强警戒。\"军方声望+2，经验+5" },
      { text: "只是风景，不放在心上", effects: {}, resultText: "你觉得可能只是普通的野兽惊扰了飞鸟，没有太在意。毕竟博城周围有妖魔活动也是常事。" }
    ]
  },

  event_sunset_view: {
    id: "event_sunset_view",
    name: "日落美景",
    description: "夕阳西下，金色的阳光洒在城墙上，远处的雪峰山被染成一片金红。你靠在城墙上，看着这壮丽的景色，心中涌起一股平静的力量。这样的景色，值得守护。",
    weight: 20,
    condition: { timeOfDay: "evening" },
    choices: [
      { text: "静静欣赏", effects: { exp: 8, hp: 20, mp: 15 }, resultText: "你静静地看着日落，感受着阳光的温暖。心中的疲惫渐渐消散，对魔法的理解似乎也更深了一层。经验+8，HP+20，MP+15" },
      { text: "冥想修炼", effects: { exp: 15, mp: 30 }, resultText: "你借着日落的宁静，开始冥想修炼。星子在意识中缓缓流转，精神力得到了滋养。经验+15，MP+30" },
      { text: "许下心愿", effects: { exp: 5, setFlag: ["sunset_wish"] }, resultText: "你对着日落许下心愿：希望自己能变得更强，守护这座城市和身边的人。微风拂过，仿佛是对心愿的回应。经验+5" }
    ]
  },

  // ========== v2.9.2 三步塔新互动事件 ==========

  event_spirit_growth: {
    id: "event_spirit_growth",
    name: "精神力成长",
    description: "你在三步塔内冥想，感受着周围活跃的星子。渐渐地，你感觉到自己的精神力在缓缓增长，意识变得更加清晰。星子的流动似乎也变得更加顺畅了。",
    weight: 30,
    choices: [
      { text: "继续深入冥想", effects: { exp: 20, mp: 40, setFlag: ["spirit_growth_deep"] }, resultText: "你继续深入冥想，精神力得到了显著的提升。星子在你的意识中形成了一个微小的漩涡，缓缓旋转。经验+20，MP+40，精神力显著提升" },
      { text: "适可而止，结束冥想", effects: { exp: 10, mp: 20 }, resultText: "你感觉到精神力已经有所提升，适可而止地结束了冥想。贪多嚼不烂，稳步提升才是正道。经验+10，MP+20" },
      { text: "尝试引导星子", effects: { exp: 15, hp: -10, mp: 30 }, resultText: "你尝试引导周围的星子为己用，但塔内的星子太过活跃，一时难以控制。精神力有所提升，但也消耗了不少体力。经验+15，HP-10，MP+30" }
    ]
  },

  event_meditate_calm: {
    id: "event_meditate_calm",
    name: "心境澄明",
    description: "冥想中，你感到心中的杂念渐渐消散，心境变得澄明如水。在这种状态下，你对魔法的理解似乎有了新的感悟。之前困惑的问题，此刻仿佛有了答案。",
    weight: 25,
    choices: [
      { text: "抓住感悟，深入思考", effects: { exp: 25, setFlag: ["magic_insight_calm"] }, resultText: "你抓住这难得的感悟，深入思考魔法的本质。星子、精神力、魔法，三者之间的关系似乎变得更加清晰了。经验+25，获得魔法感悟" },
      { text: "保持心境，享受宁静", effects: { exp: 10, hp: 15, mp: 20 }, resultText: "你没有刻意去追求什么，只是保持着这份澄明的心境，享受着难得的宁静。身心都得到了恢复。经验+10，HP+15，MP+20" },
      { text: "将感悟记录下来", effects: { exp: 15, setFlag: ["recorded_insight"] }, resultText: "你将此刻的感悟记录下来，方便日后回味和研究。好记性不如烂笔头，这些感悟日后可能会成为突破的关键。经验+15，记录了魔法感悟" }
    ]
  },

  event_magic_understanding: {
    id: "event_magic_understanding",
    name: "魔法理解",
    description: "你观察着塔内星子的流动，渐渐地看出了一些规律。星子的流动并非杂乱无章，而是遵循着某种深奥的法则。你对魔法的理解又深了一层。",
    weight: 30,
    choices: [
      { text: "研究星子流动规律", effects: { exp: 20, setFlag: ["studied_star_flow"] }, resultText: "你仔细研究星子的流动规律，发现它们似乎与元素属性有关。不同系别的星子流动方式各不相同，但又遵循着共同的法则。经验+20，对星子流动有了更深理解" },
      { text: "尝试模拟星子流动", effects: { exp: 15, mp: -10 }, resultText: "你尝试在意识中模拟星子的流动，虽然还很粗糙，但已经能感受到其中的奥妙。这种练习有助于提升魔法掌控力。经验+15，MP-10" },
      { text: "向其他修炼者请教", effects: { exp: 10, reputation: { school: 3 } }, resultText: "你向旁边的修炼者请教星子流动的问题。对方是一位高年级的学长，耐心地解答了你的疑问。经验+10，学校声望+3" }
    ]
  },

  event_star_pattern: {
    id: "event_star_pattern",
    name: "星之轨迹",
    description: "你凝视着塔内的星子，突然发现它们在流动中形成了一个奇特的图案。这个图案似乎蕴含着某种古老的魔法阵，你从未见过这样的星之轨迹。",
    weight: 15,
    choices: [
      { text: "仔细研究这个图案", effects: { exp: 30, setFlag: ["discovered_star_pattern"] }, resultText: "你仔细研究这个奇特的星之图案，发现它似乎是一种古老的魔法阵雏形。虽然还无法完全理解，但你已经记住了它的形状。经验+30，发现了古老的星之轨迹" },
      { text: "用精神力触碰图案", effects: { exp: 25, hp: -15, mp: -20, setFlag: ["touched_star_pattern"] }, resultText: "你鼓起勇气，用精神力触碰这个星之图案。一股强大的能量涌入你的意识，你感到精神力在急速增长，但也承受了不小的压力。经验+25，HP-15，MP-20，精神力得到了质的提升" },
      { text: "只是观察，不做干预", effects: { exp: 12 }, resultText: "你选择只是观察，不做任何干预。星之图案缓缓消散，但它的形状已经深深地印在了你的脑海中。经验+12" }
    ]
  },

  // ========== v2.9.2 雪峰山新互动事件 ==========

  event_rare_demon_sighting: {
    id: "event_rare_demon_sighting",
    name: "罕见妖魔目击",
    description: "你在观察妖魔踪迹时，突然发现了一组罕见的脚印。这组脚印比普通妖魔大得多，而且形状奇特，你从未见过这样的妖魔踪迹。从脚印的深度来看，这只妖魔的体型和力量都非同寻常。",
    weight: 20,
    choices: [
      { text: "追踪这只妖魔", effects: { exp: 15, hp: -10, setFlag: ["tracking_rare_demon"] }, resultText: "你决定追踪这只罕见的妖魔。沿着脚印走了一段路后，你发现了它栖息的洞穴入口。从洞口传来的气息让你不寒而栗，这绝对不是你现在能对付的对手。你悄悄记下了位置，选择撤退。经验+15，HP-10，获得罕见妖魔的位置情报" },
      { text: "记录踪迹后离开", effects: { exp: 8, reputation: { hunter: 5 } }, resultText: "你仔细记录了这组罕见脚印的形状、大小和深度，然后选择离开。这些情报对猎魔队来说非常有价值。经验+8，猎魔者声望+5" },
      { text: "通知附近的猎魔者", effects: { exp: 10, reputation: { hunter: 8 }, setFlag: ["reported_rare_demon"] }, resultText: "你找到附近的猎魔者小队，将罕见妖魔的情报告诉了他们。队长非常重视，立即组织了侦察队伍。\"年轻人，你的情报很有价值，\"队长拍了拍你的肩膀，\"这只妖魔可能是战将级甚至更高，我们需要谨慎应对。\"经验+10，猎魔者声望+8" }
    ]
  },

  event_track_wolf_pack: {
    id: "event_track_wolf_pack",
    name: "魔狼群踪迹",
    description: "你发现了一群魔狼的踪迹。从脚印的数量来看，这是一个不小的狼群，至少有七八只魔狼。魔狼是群居妖魔，单独一只并不可怕，但成群的魔狼就连中阶法师也要忌惮三分。",
    weight: 25,
    choices: [
      { text: "跟踪狼群找到巢穴", effects: { exp: 12, hp: -8, setFlag: ["found_wolf_den"] }, resultText: "你小心翼翼地跟踪狼群，最终找到了它们的巢穴——一个隐蔽的山洞。洞口散落着白骨，空气中弥漫着血腥味。你记下了位置，然后悄悄离开。经验+12，HP-8，发现了魔狼巢穴" },
      { text: "观察狼群的活动规律", effects: { exp: 10, setFlag: ["studied_wolf_pattern"] }, resultText: "你找了个隐蔽的位置，观察狼群的活动规律。你发现它们在傍晚时分最为活跃，而且有固定的狩猎路线。这些信息对狩猎非常有帮助。经验+10，掌握了魔狼的活动规律" },
      { text: "设置陷阱伏击", effects: { exp: 15, addItem: { itemId: "wolf_pelt", count: 2 }, hp: -15 }, resultText: "你利用地形设置了一个简单的陷阱，然后引诱两只落单的魔狼进入陷阱。经过一番激战，你成功击杀了它们，获得了两张完整的狼皮。但你也受了不小的伤。经验+15，获得魔狼皮x2，HP-15" }
    ]
  },

  event_rest_interrupted: {
    id: "event_rest_interrupted",
    name: "休息被打断",
    description: "你正在山中休息，突然听到附近传来灌木丛的沙沙声。你警觉地站起来，看到一只妖魔正悄悄向你靠近。看来你的休息地点选得不够安全。",
    weight: 30,
    choices: [
      { text: "立即进入战斗", effects: { exp: 10, hp: -12 }, resultText: "你迅速做出反应，与这只偷袭的妖魔展开战斗。虽然被打了个措手不及，但你还是凭借实力击败了它。经验+10，HP-12" },
      { text: "快速撤离", effects: { hp: -5, stamina: -10 }, resultText: "你选择不与这只妖魔纠缠，快速收拾东西撤离。虽然有些狼狈，但至少避免了一场不必要的战斗。HP-5，体力-10" },
      { text: "用威慑吓退妖魔", effects: { exp: 5, mp: -10 }, resultText: "你释放出强大的魔法气息，试图吓退这只妖魔。对方感受到你的力量后，犹豫了一下，最终选择了撤退。经验+5，MP-10" }
    ]
  },

  event_peaceful_rest: {
    id: "event_peaceful_rest",
    name: "宁静的休息",
    description: "你在山中找到了一个安全的地方休息。阳光透过树叶洒下，微风轻拂，周围一片宁静。在这样的环境中休息，你感到身心都得到了很好的恢复。",
    weight: 35,
    choices: [
      { text: "好好睡一觉", effects: { hp: 40, mp: 30, exp: 3 }, resultText: "你找了个舒适的位置，好好地睡了一觉。醒来时感到精神饱满，体力和魔力都得到了充分恢复。HP+40，MP+30，经验+3" },
      { text: "边休息边冥想", effects: { hp: 20, mp: 40, exp: 8 }, resultText: "你一边休息一边冥想，感受着山中的自然气息。星子在意识中缓缓流动，精神力得到了滋养。HP+20，MP+40，经验+8" },
      { text: "欣赏山中风景", effects: { hp: 25, mp: 20, exp: 5, setFlag: ["enjoyed_mountain_view"] }, resultText: "你没有刻意休息，而是欣赏起了山中的风景。远处的山峰云雾缭绕，近处的溪流潺潺流淌，这样的景色让你心情愉悦。HP+25，MP+20，经验+5" }
    ]
  },

  event_night_sounds: {
    id: "event_night_sounds",
    name: "夜山中的声音",
    description: "夜幕降临，你在山中休息时，听到了各种奇怪的声音。远处传来妖魔的嚎叫，近处有不知名的生物在活动。夜晚的雪峰山比白天更加危险，但也隐藏着更多的秘密。",
    weight: 25,
    condition: { timeOfDay: "night" },
    choices: [
      { text: "保持警惕，继续休息", effects: { hp: 15, mp: 10, exp: 5 }, resultText: "你保持着警惕，在半梦半醒中度过了这个夜晚。虽然休息质量不高，但至少没有遇到危险。HP+15，MP+10，经验+5" },
      { text: "循声探查", effects: { exp: 12, hp: -10, setFlag: ["investigated_night_sounds"] }, resultText: "你鼓起勇气，循着奇怪的声音前去探查。走了一段路后，你发现是一只罕见的夜行妖魔在觅食。你悄悄观察了一会儿，获得了宝贵的情报，然后返回休息。经验+12，HP-10" },
      { text: "生火驱赶妖魔", effects: { hp: 20, mp: 15, exp: 3 }, resultText: "你生起一堆篝火，利用火光和热度驱赶附近的妖魔。大多数低阶妖魔都惧怕火光，你因此获得了一个相对安全的休息环境。HP+20，MP+15，经验+3" }
    ]
  },

  // ========== v2.9.2 雪峰山深处新互动事件 ==========

  event_secret_guardian: {
    id: "event_secret_guardian",
    name: "秘境守护者",
    description: "你在寻找秘境时，遇到了一只强大的妖魔。从它的气息来看，这绝对不是普通的妖魔，至少是战将级以上的存在。它似乎在守护着什么，警惕地盯着你。",
    weight: 25,
    choices: [
      { text: "尝试绕过守护者", effects: { exp: 10, stamina: -15, setFlag: ["bypassed_secret_guardian"] }, resultText: "你小心翼翼地尝试绕过这只强大的守护者。经过一番迂回，你成功避开了它的视线，但也消耗了不少体力。经验+10，体力-15" },
      { text: "主动发起攻击", effects: { exp: 25, hp: -30, mp: -25, setFlag: ["fought_secret_guardian"] }, resultText: "你决定主动出击，与这只强大的守护者展开激战。经过一番苦战，你虽然受了不轻的伤，但成功击退了它。守护者撤退时，你看到了它身后隐藏的洞穴入口。经验+25，HP-30，MP-25" },
      { text: "用食物引开守护者", effects: { exp: 8, addItem: { itemId: "magic_herb", count: -1 }, setFlag: ["distracted_secret_guardian"] }, resultText: "你拿出采集的魔法草药，扔向远处。守护者被草药的气味吸引，追了过去。你趁机前往它守护的地方。经验+8，消耗魔法草药x1" }
    ]
  },

  event_hidden_treasure: {
    id: "event_hidden_treasure",
    name: "隐藏宝藏",
    description: "你在深山的一个隐蔽洞穴中，发现了一个古老的宝箱。宝箱上布满了灰尘和蜘蛛网，看起来已经很久没有人来过了。宝箱上刻着奇怪的符文，似乎有某种封印。",
    weight: 20,
    choices: [
      { text: "强行打开宝箱", effects: { exp: 20, hp: -15, addItem: { itemId: "spirit_seed_fragment", count: 1 }, setFlag: ["opened_hidden_treasure"] }, resultText: "你用蛮力强行打开了宝箱。宝箱上的符文释放出一道冲击波，你受了一些伤，但也成功打开了宝箱。里面有一枚灵种碎片，散发着微弱的光芒。经验+20，HP-15，获得灵种碎片x1" },
      { text: "研究符文后打开", effects: { exp: 30, addItem: { itemId: "ancient_relic", count: 1 }, setFlag: ["resealed_hidden_treasure"] }, resultText: "你仔细研究宝箱上的符文，发现这是一个简单的封印。你按照符文的指引，用精神力缓缓解开了封印。宝箱轻轻打开，里面是一件古老的法器，散发着神秘的气息。经验+30，获得古老法器x1" },
      { text: "不碰宝箱，离开", effects: { exp: 5, setFlag: ["left_hidden_treasure"] }, resultText: "你觉得这个宝箱太过诡异，决定不碰它，选择离开。有时候，谨慎才是生存之道。经验+5" }
    ]
  },

  event_dead_end: {
    id: "event_dead_end",
    name: "死路",
    description: "你沿着一条看似有希望的小路前进，最终却发现这是一条死路。前方是陡峭的悬崖，根本无法通行。你浪费了不少时间和体力，却一无所获。",
    weight: 30,
    choices: [
      { text: "原路返回", effects: { stamina: -10, exp: 3 }, resultText: "你无奈地原路返回。虽然浪费了一些时间，但至少没有遇到危险。体力-10，经验+3" },
      { text: "尝试攀爬悬崖", effects: { exp: 15, hp: -25, setFlag: ["climbed_dead_end"] }, resultText: "你决定尝试攀爬这座陡峭的悬崖。经过一番艰难的攀爬，你终于到达了崖顶。虽然受了不少伤，但你发现了一条新的路径。经验+15，HP-25" },
      { text: "在附近搜索", effects: { exp: 8, addItem: { itemId: "magic_herb", count: 1 }, setFlag: ["searched_dead_end"] }, resultText: "你在死路附近仔细搜索，发现了一些生长在悬崖边的魔法草药。虽然没有找到秘境，但也不算一无所获。经验+8，获得魔法草药x1" }
    ]
  },

  event_cultivation_breakthrough: {
    id: "event_cultivation_breakthrough",
    name: "修炼突破",
    description: "你在雪峰山深处修炼时，感受到周围浓郁的灵气涌入体内。你的星子变得异常活跃，精神力在急速增长。你感觉到了突破的契机！",
    weight: 20,
    choices: [
      { text: "抓住契机突破", effects: { exp: 60, mp: -30, setFlag: ["deep_cultivation_breakthrough"] }, resultText: "你抓住这难得的突破契机，全力引导灵气冲击瓶颈。经过一番艰苦的努力，你成功突破了！星子变得更加凝练，精神力也有了质的提升。经验+60，MP-30，修炼突破！" },
      { text: "稳扎稳打，不急于突破", effects: { exp: 30, mp: -15, setFlag: ["stable_cultivation"] }, resultText: "你选择稳扎稳打，不急于突破。虽然没有立刻突破，但你的基础更加扎实了。经验+30，MP-15" },
      { text: "记录突破感悟", effects: { exp: 25, setFlag: ["recorded_breakthrough_insight"] }, resultText: "你没有强行突破，而是将此刻的感悟记录下来。这些感悟日后可能会成为突破的关键。经验+25，记录了突破感悟" }
    ]
  },

  event_cultivation_interrupted: {
    id: "event_cultivation_interrupted",
    name: "修炼被打断",
    description: "你正在深处修炼时，突然感受到一股强大的妖气正在靠近。你不得不中断修炼，准备应对即将到来的危险。",
    weight: 30,
    choices: [
      { text: "立即进入战斗", effects: { exp: 20, hp: -20, mp: -15 }, resultText: "你迅速做出反应，与来袭的妖魔展开战斗。虽然被打断了修炼，但你还是凭借实力击败了它。经验+20，HP-20，MP-15" },
      { text: "快速撤离", effects: { stamina: -15, hp: -5 }, resultText: "你选择不与这只妖魔纠缠，快速收拾东西撤离。虽然有些狼狈，但至少避免了一场不必要的战斗。体力-15，HP-5" },
      { text: "用威慑吓退妖魔", effects: { exp: 10, mp: -20 }, resultText: "你释放出强大的魔法气息，试图吓退这只妖魔。对方感受到你的力量后，犹豫了一下，最终选择了撤退。经验+10，MP-20" }
    ]
  },

  event_spirit_gain: {
    id: "event_spirit_gain",
    name: "精神力增长",
    description: "在雪峰山深处修炼时，你感受到周围的灵气在滋养你的精神力。星子在意识中缓缓旋转，每一次旋转都让你的精神力更加凝练。这种感觉非常美妙。",
    weight: 25,
    choices: [
      { text: "继续深入冥想", effects: { exp: 35, mp: 40, setFlag: ["deep_meditation_spirit"] }, resultText: "你继续深入冥想，让精神力在灵气的滋养下自由生长。不知过了多久，你从冥想中醒来，感到精神力有了显著的提升。经验+35，MP+40" },
      { text: "引导精神力淬炼星子", effects: { exp: 25, mp: 20, setFlag: ["refined_stars"] }, resultText: "你引导增长的精神力淬炼星子，让星子变得更加凝练。虽然精神力增长不多，但星子的品质提升了。经验+25，MP+20" },
      { text: "适可而止，结束修炼", effects: { exp: 15, mp: 25 }, resultText: "你感到精神力已经有所提升，适可而止地结束了修炼。贪多嚼不烂，稳步提升才是正道。经验+15，MP+25" }
    ]
  },

  event_peaceful_cultivation: {
    id: "event_peaceful_cultivation",
    name: "宁静修炼",
    description: "你在雪峰山深处找到了一个宁静的修炼之地。周围没有妖魔的打扰，只有浓郁的灵气和潺潺的溪水声。在这样的环境中修炼，真是一种享受。",
    weight: 25,
    choices: [
      { text: "全力修炼", effects: { exp: 45, mp: -20, hp: -5 }, resultText: "你在这个宁静的地方全力修炼，效率远超平时。星子在灵气的滋养下快速成长，你感到实力在稳步提升。经验+45，MP-20，HP-5" },
      { text: "边修炼边欣赏风景", effects: { exp: 25, hp: 15, mp: 20 }, resultText: "你没有全力修炼，而是边修炼边欣赏周围的风景。修炼效率虽然不高，但身心都得到了放松和恢复。经验+25，HP+15，MP+20" },
      { text: "在修炼中感悟自然", effects: { exp: 30, setFlag: ["understood_nature"] }, resultText: "你在修炼中感悟自然，感受着天地间的灵气流动。你对魔法的本质有了更深的理解，这种感悟比单纯的实力提升更加珍贵。经验+30，感悟了自然之道" }
    ]
  }
};