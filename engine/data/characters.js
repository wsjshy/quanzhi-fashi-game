/**
 * NPC/角色数据
 * 从 game-data.js 拆分而来
 */

const DataCharacters = {
  mo_fan: {
    id: "mo_fan",
    name: "莫凡",
    title: "天生双系",
    description: "从另一个世界穿越而来的少年，拥有天生双系的天赋。雷系与火系兼修，性格桀骜不驯。",
    elements: [
      "thunder",
      "fire"
    ],
    level: 3,
    maxHp: 150,
    maxMp: 80,
    attack: 18,
    defense: 6,
    speed: 14,
    skills: [
      "basic_attack",
      "thunder_bolt",
      "fire_bolt"
    ],
    spriteColor: "#6633cc",
    image: "assets/images/characters/mo_fan.jpg",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "嘿，新来的？我叫莫凡，有什么事吗？"
      },
      {
        trigger: "after_quest_1",
        text: "不错嘛，居然能完成那个任务，有点实力！"
      }
    ],
    givesQuests: [
      "quest_hunt_demon",
      "quest_hunt_shadow",
      "quest_hunt_stone"
    ],
    personality: {
      brave: 0.9,
      kind: 0.6,
      honest: 0.5,
      impulsive: 0.85,
      loyal: 0.95,
      arrogant: 0.4,
      greedy: 0.2,
      curious: 0.7
    },
    giftPreferences: {
      loved: [
        "demon_core",
        "magic_stone",
        "super_mana_potion"
      ],
      liked: [
        "health_potion",
        "mana_potion",
        "magic_herb"
      ],
      disliked: [],
      baseOpinionGain: 5,
      lovedMultiplier: 3,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: true,
      canBeMentor: true,
      canBeRival: true
    },
    relationships: {
      mu_ningxue: {
        opinion: -10,
        trust: 0,
        type: "complicated",
        label: "青梅竹马"
      },
      tang_yue: {
        opinion: 30,
        trust: 40,
        type: "mentor",
        label: "实习老师"
      },
      wang_laoban: {
        opinion: 10,
        trust: 5,
        type: "acquaintance",
        label: "小卖部老板"
      },
      zhang_xiaohou: {
        opinion: 90,
        trust: 95,
        type: "best_friend",
        label: "死党"
      },
      zhao_manyan: {
        opinion: 65,
        trust: 55,
        type: "friend",
        label: "好兄弟"
      }
    },
    dialogueTree: {
      npcId: "mo_fan",
      nodes: {
        default: {
          id: "default",
          texts: [
            "嘿，新来的？有什么事吗？",
            "怎么，找我有事？",
            "...嗯？"
          ],
          mood: "casual",
          choices: [
            {
              id: "ask_about_school",
              text: "问问学校的情况",
              condition: {
                notNpcFlags: [
                  "asked_about_school"
                ]
              },
              effects: {
                opinion: 2,
                npcFlags: {
                  asked_about_school: true
                }
              },
              nextNode: "about_school"
            },
            {
              id: "ask_about_training",
              text: "请教修炼技巧",
              condition: {
                minOpinion: 10
              },
              effects: {
                opinion: 3,
                exp: 10
              },
              nextNode: "training_tips"
            },
            {
              id: "challenge",
              text: "要不要切磋一下？",
              condition: {
                minOpinion: 30,
                minLevel: 3
              },
              effects: {
                opinion: 5
              },
              nextNode: "challenge_response",
              action: "start_battle",
              actionData: {
                enemyId: "mo_fan_spar"
              }
            },
            {
              id: "hunt_quest",
              text: "听说你有猎魔任务？",
              condition: {
                minOpinion: 20,
                notFlags: [
                  "quest_hunt_demon_accepted"
                ]
              },
              effects: {
                opinion: 2,
                startQuest: "quest_hunt_demon",
                flags: {
                  quest_hunt_demon_accepted: true
                }
              },
              nextNode: "hunt_quest_dialogue"
            },
            {
              id: "chat",
              text: "随便聊聊",
              condition: {
                minOpinion: 15
              },
              effects: {
                opinion: 1
              },
              nextNode: "casual_chat"
            },
            {
              id: "training_insights",
              text: "聊聊修炼心得",
              condition: {
                minOpinion: 40
              },
              effects: {
                familiarity: 2
              },
              nextNode: "training_insights"
            },
            {
              id: "about_mu_ningxue_truth",
              text: "聊聊穆宁雪的事",
              condition: {
                minOpinion: 50,
                npcFlags: [
                  "knows_mu_ningxue"
                ]
              },
              effects: {
                familiarity: 3
              },
              nextNode: "about_mu_ningxue_truth"
            },
            {
              id: "become_brothers",
              text: "（感觉关系不错了，要不要结拜？）",
              condition: {
                minOpinion: 80,
                notNpcFlags: [
                  "become_brothers"
                ]
              },
              effects: {},
              nextNode: "become_brothers"
            },
            {
              id: "leave",
              text: "没什么事，先走了",
              effects: {},
              nextNode: null
            }
          ]
        },
        about_school: {
          id: "about_school",
          texts: [
            "天澜魔法高中嘛，就那样。老师教的都是基础，真正的本事还得自己练。",
            "学校里最厉害的是穆宁雪，冰系天才，不过性格冷得像冰一样。",
            "想变强的话，光靠上课可不够，得多去实战。"
          ],
          mood: "casual",
          choices: [
            {
              id: "ask_mu_ningxue",
              text: "穆宁雪是谁？",
              condition: {
                notNpcFlags: [
                  "knows_mu_ningxue"
                ]
              },
              effects: {
                opinion: -1,
                npcFlags: {
                  knows_mu_ningxue: true
                },
                giveInfo: "mu_ningxue_intro"
              },
              nextNode: "about_mu_ningxue"
            },
            {
              id: "ask_teachers",
              text: "老师们怎么样？",
              effects: {
                opinion: 1
              },
              nextNode: "about_teachers"
            },
            {
              id: "back",
              text: "原来是这样",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        about_mu_ningxue: {
          id: "about_mu_ningxue",
          texts: [
            "穆宁雪啊，穆家的大小姐，冰系天赋极高，年纪轻轻就已经是中阶法师了。",
            "...哼，反正就是个厉害的家伙，你自己去见识下就知道了。",
            "别问我她的事，我跟她不熟。"
          ],
          mood: "annoyed",
          choices: [
            {
              id: "back",
              text: "好吧...",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        about_teachers: {
          id: "about_teachers",
          texts: [
            "唐月老师人不错，温柔又有耐心，火系魔法也很强。",
            "其他老师嘛，就那样吧，教的都是基础。",
            "想真的变强，还是得靠自己修炼和实战。"
          ],
          mood: "casual",
          choices: [
            {
              id: "back",
              text: "明白了",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        training_tips: {
          id: "training_tips",
          texts: [
            "修炼啊...我觉得最重要的是实战，光练不打没用。",
            "别害怕受伤，每次受伤都是进步的机会。",
            "还有，星子的引导很重要，要多练，形成肌肉记忆。"
          ],
          mood: "serious",
          choices: [
            {
              id: "thank",
              text: "多谢指教！",
              effects: {
                opinion: 2
              },
              nextNode: "default"
            }
          ]
        },
        challenge_response: {
          id: "challenge_response",
          texts: [
            "哦？想跟我打？有意思，来吧！",
            "好啊，让我看看你有多少本事！",
            "行，点到为止啊。"
          ],
          mood: "excited",
          choices: [
            {
              id: "fight",
              text: "开始吧！",
              effects: {},
              nextNode: null
            }
          ]
        },
        hunt_quest_dialogue: {
          id: "hunt_quest_dialogue",
          texts: [
            "雪峰山最近有只幽狼兽在作乱，伤了好几个猎人。",
            "我本来想去解决它的，不过...算了，你要是有兴趣，就去试试吧。",
            "小心点，那家伙速度很快，别大意了。"
          ],
          mood: "serious",
          choices: [
            {
              id: "accept",
              text: "好，我去看看！",
              effects: {},
              nextNode: null
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "最近修炼怎么样？有没有遇到什么瓶颈？",
            "说起来，最近雪峰山好像不太平，你去的时候小心点。",
            "...没什么，就是觉得最近有点太安静了，有点不对劲。"
          ],
          mood: "casual",
          choices: [
            {
              id: "ask_demon",
              text: "哪里不对劲？",
              condition: {
                minOpinion: 30,
                minDay: 25
              },
              effects: {
                opinion: 2,
                giveInfo: "demon_intel_1"
              },
              nextNode: "demon_rumor"
            },
            {
              id: "back",
              text: "是这样啊",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        demon_rumor: {
          id: "demon_rumor",
          texts: [
            "我也说不清楚...就是感觉最近山里的妖魔有点太活跃了。",
            "以前幽狼兽一般不会靠近山脚，最近已经有好几起袭击事件了。",
            "希望是我想多了吧...总之你自己小心点。"
          ],
          mood: "worried",
          choices: [
            {
              id: "back",
              text: "好，我会注意的",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        training_insights: {
          id: "training_insights",
          texts: [
            "修炼这东西，说白了就是熟能生巧。星子引导得多了，自然就快了。",
            "我跟你说个诀窍，修炼的时候别光想着快，要感受每一颗星子的流动。",
            "真正的瓶颈从来都不是魔法，而是你的精神力。精神力够强，什么系都能玩得转。"
          ],
          mood: "serious",
          effects: {
            exp: 20,
            opinion: 2
          },
          choices: [
            {
              id: "ask_more",
              text: "还有吗？再说说",
              condition: {
                minOpinion: 60
              },
              effects: {
                exp: 30,
                opinion: 1
              },
              nextNode: "deep_training"
            },
            {
              id: "back",
              text: "受教了",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        deep_training: {
          id: "deep_training",
          texts: [
            "...好吧，看你这么有诚意，我就告诉你一个秘密。",
            "其实...我修炼的速度比别人快，是有原因的。",
            "算了，现在说这些还太早。等你什么时候到了中阶，我再跟你细说。"
          ],
          mood: "mysterious",
          effects: {
            npcFlags: {
              hinted_about_double_element: true
            }
          },
          choices: [
            {
              id: "back",
              text: "...好吧",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        about_mu_ningxue_truth: {
          id: "about_mu_ningxue_truth",
          texts: [
            "穆宁雪啊...其实她也没那么冷，只是不擅长表达而已。",
            "我跟她...从小就认识了。那时候她还不是什么冰系天才，就是个普通的小丫头。",
            "算了，说这些干嘛。她的事，你自己去了解吧。"
          ],
          mood: "nostalgic",
          effects: {
            opinion: 3,
            giveInfo: "mu_ningxue_past"
          },
          choices: [
            {
              id: "ask_more",
              text: "你们小时候发生过什么？",
              condition: {
                minOpinion: 70
              },
              effects: {
                opinion: -2
              },
              nextNode: "mu_ningxue_childhood"
            },
            {
              id: "back",
              text: "原来如此",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        mu_ningxue_childhood: {
          id: "mu_ningxue_childhood",
          texts: [
            "...你问这个干嘛？",
            "都是过去的事了，没什么好说的。",
            "总之，别在她面前提那些事。记住了。"
          ],
          mood: "annoyed",
          choices: [
            {
              id: "back",
              text: "抱歉，我不该问的",
              effects: {
                opinion: 1
              },
              nextNode: "default"
            }
          ]
        },
        become_brothers: {
          id: "become_brothers",
          texts: [
            "哈哈，你这家伙，还挺对我胃口的！",
            "怎么样，要不要跟我结拜兄弟？以后有我莫凡一口饭吃，就有你一口！",
            "当然，修炼上的事，我也不会藏私的。"
          ],
          mood: "excited",
          choices: [
            {
              id: "accept",
              text: "好！以后我们就是兄弟了！",
              condition: {
                notNpcFlags: [
                  "become_brothers"
                ]
              },
              effects: {
                opinion: 10,
                trust: 15,
                npcFlags: {
                  become_brothers: true
                },
                giveItem: "basic_staff"
              },
              nextNode: "brothers_accepted"
            },
            {
              id: "decline",
              text: "这...太突然了",
              effects: {
                opinion: -2
              },
              nextNode: "default"
            }
          ]
        },
        brothers_accepted: {
          id: "brothers_accepted",
          texts: [
            "好兄弟！",
            "这根法杖我留着也没用，给你了！",
            "以后有事尽管找我，谁敢欺负你，我帮你揍他！"
          ],
          mood: "happy",
          choices: [
            {
              id: "back",
              text: "谢谢兄弟！",
              effects: {},
              nextNode: "default"
            }
          ]
        }
      }
    }
  },
  mo_jiaxing: {
    id: "mo_jiaxing",
    name: "莫家兴",
    title: "莫凡的父亲",
    description: "莫凡的父亲，脸色蜡黄的中年男子，原本给穆家老爷开车，后来调到后勤做采购。憨厚老实，为了儿子可以低声下气求人，把房子都卖了供莫凡上魔法高中。",
    elements: [],
    level: 0,
    maxHp: 60,
    maxMp: 0,
    attack: 3,
    defense: 2,
    speed: 5,
    skills: [
      "basic_attack"
    ],
    spriteColor: "#ccaa77",
    location: "mo_fan_home",
    availableTimes: [
      "morning",
      "afternoon",
      "evening",
      "night"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "你是莫凡的同学吧？快进来坐，家里简陋，别嫌弃。"
      },
      {
        trigger: "after_quest_1",
        text: "莫凡这孩子，从小就不服输，你多帮帮他。"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4,
      kind: 0.9,
      honest: 0.85,
      impulsive: 0.1,
      loyal: 0.9,
      arrogant: 0.05,
      greedy: 0.1,
      curious: 0.3
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: false,
      canBeRival: false
    },
    relationships: {
      mo_fan: {
        opinion: 100,
        trust: 100,
        type: "father_son",
        label: "父子"
      },
      mu_he: {
        opinion: -20,
        trust: 0,
        type: "employer_employee",
        label: "穆家管家"
      }
    },
    giftPreferences: {
      loved: [
        "health_potion",
        "super_health_potion"
      ],
      liked: [
        "food",
        "magic_herb"
      ],
      disliked: [],
      baseOpinionGain: 8,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 5
    }
  },
  mu_bai: {
    id: "mu_bai",
    name: "穆白",
    title: "穆家旁系子弟",
    description: "穆氏世家旁系子弟，高一8班1号学生。发型身高长相都堪称男神，表面谦逊有礼，内心却极其高傲阴暗，是个典型的绿茶男。寒冰系天赋出众，觉醒时冻结了觉醒石。看不起莫凡，认为他只是杂役的儿子。",
    elements: [
      "ice"
    ],
    level: 3,
    maxHp: 90,
    maxMp: 70,
    attack: 14,
    defense: 8,
    speed: 10,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_shield"
    ],
    spriteColor: "#aaddff",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "（脸上带着谦逊的微笑）你好，我是穆白。有什么事吗？"
      },
      {
        trigger: "low_opinion",
        text: "（眼神中闪过一丝不屑）哦，是你啊。有事？"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.5,
      kind: 0.2,
      honest: 0.15,
      impulsive: 0.2,
      loyal: 0.3,
      arrogant: 0.9,
      greedy: 0.6,
      curious: 0.4
    },
    relationshipCap: {
      maxOpinion: 60,
      maxTrust: 40,
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      mo_fan: {
        opinion: -40,
        trust: -20,
        type: "rival",
        label: "竞争对手"
      },
      zhao_kunsan: {
        opinion: 30,
        trust: 20,
        type: "follower",
        label: "跟班"
      },
      mu_ningxue: {
        opinion: 60,
        trust: 10,
        type: "crush",
        label: "仰慕"
      }
    },
    giftPreferences: {
      loved: [
        "ice_crystal",
        "magic_stone"
      ],
      liked: [
        "super_mana_potion",
        "equipment"
      ],
      disliked: [
        "common_item",
        "food"
      ],
      baseOpinionGain: 3,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.3,
      dailyGiftLimit: 2
    }
  },
  zhao_kunsan: {
    id: "zhao_kunsan",
    name: "赵坤三",
    title: "穆白的跟班",
    description: "满脸麻子的少年，穆白的忠实跟班，高一8班学生。风系法师，性格狗腿，爱仗势欺人，经常替穆白出面挑衅莫凡。",
    elements: [
      "wind"
    ],
    level: 2,
    maxHp: 70,
    maxMp: 45,
    attack: 9,
    defense: 4,
    speed: 14,
    skills: [
      "basic_attack",
      "wind_blade"
    ],
    spriteColor: "#bbffbb",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "（上下打量你）你谁啊？有事找穆白哥先跟我说。"
      },
      {
        trigger: "low_opinion",
        text: "哼，就你也配跟穆白哥说话？"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.3,
      kind: 0.2,
      honest: 0.3,
      impulsive: 0.7,
      loyal: 0.6,
      arrogant: 0.5,
      greedy: 0.5,
      curious: 0.4
    },
    relationshipCap: {
      maxOpinion: 50,
      maxTrust: 30,
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      mu_bai: {
        opinion: 80,
        trust: 60,
        type: "follower",
        label: "老大"
      },
      mo_fan: {
        opinion: -30,
        trust: -10,
        type: "hostile",
        label: "欺负对象"
      }
    }
  },
  zhang_xiaohou: {
    id: "zhang_xiaohou",
    name: "张小侯",
    title: "莫凡的死党",
    description: "跟泥猴子一样的少年，莫凡的邻居和发小，高一8班学生。风系法师，速度很快。性格活泼热心，消息灵通，极其崇拜莫凡，叫他\"莫凡哥\"，关键时刻很护短。",
    elements: [
      "wind"
    ],
    level: 2,
    maxHp: 80,
    maxMp: 50,
    attack: 10,
    defense: 4,
    speed: 16,
    skills: [
      "basic_attack",
      "wind_blade"
    ],
    spriteColor: "#99ff99",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "嘿！我叫张小侯，是莫凡哥的死党！有什么事尽管找我！"
      },
      {
        trigger: "after_quest_1",
        text: "莫凡哥就是厉害，我就知道他一定能行！"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4,
      kind: 0.85,
      honest: 0.9,
      impulsive: 0.4,
      loyal: 0.95,
      arrogant: 0.1,
      greedy: 0.3,
      curious: 0.7
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: false,
      canBeRival: false
    },
    relationships: {
      mo_fan: {
        opinion: 90,
        trust: 95,
        type: "best_friend",
        label: "死党"
      },
      tang_yue: {
        opinion: 40,
        trust: 50,
        type: "acquaintance",
        label: "实习老师"
      },
      mu_ningxue: {
        opinion: 10,
        trust: 0,
        type: "acquaintance",
        label: "同学"
      },
      zhao_manyan: {
        opinion: 55,
        trust: 45,
        type: "friend",
        label: "朋友"
      }
    },
    dialogueTree: {
      npcId: "zhang_xiaohou",
      nodes: {
        default: {
          id: "default",
          texts: [
            "你好啊！我叫张小侯，是莫凡的好朋友。",
            "嘿，又见面了！找我有什么事吗？",
            "今天天气不错啊，你修炼得怎么样了？"
          ],
          choices: [
            {
              text: "莫凡最近怎么样？",
              next: "about_mo_fan"
            },
            {
              text: "修炼上有什么心得吗？",
              next: "training_tips"
            },
            {
              text: "学校最近有什么新鲜事吗？",
              next: "school_news"
            },
            {
              text: "随便聊聊",
              next: "casual_chat"
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        about_mo_fan: {
          id: "about_mo_fan",
          texts: [
            "莫凡啊，他可厉害了！虽然平时看起来吊儿郎当的，但关键时刻特别靠谱。",
            "我跟莫凡是从小一起长大的，他这个人啊，就是嘴硬心软。",
            "莫凡最近好像在偷偷修炼什么，神神秘秘的..."
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "他实力很强吗？",
              next: "mo_fan_power"
            },
            {
              text: "你们是怎么认识的？",
              next: "mo_fan_history"
            },
            {
              text: "我知道了",
              next: "default"
            }
          ]
        },
        mo_fan_power: {
          id: "mo_fan_power",
          texts: [
            "那当然！莫凡可是我们班最强的之一，雷系魔法用得特别溜。",
            "虽然他才刚觉醒没多久，但进步速度快得吓人！",
            "我跟你说，莫凡这家伙绝对不简单，以后肯定是个大人物！"
          ],
          effects: {
            opinion: 2,
            familiarity: 3
          },
          choices: [
            {
              text: "这么厉害？",
              next: "default"
            }
          ]
        },
        mo_fan_history: {
          id: "mo_fan_history",
          texts: [
            "我们从小就是邻居，一起长大的。小时候他经常保护我，虽然他自己也总闯祸。",
            "说起来，莫凡以前好像不是这样的... 好像从某个时候开始，他就变得特别不一样了。",
            "不过不管怎么样，他永远是我最好的兄弟！"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "真是令人羡慕的友谊",
              next: "default"
            }
          ]
        },
        training_tips: {
          id: "training_tips",
          texts: [
            "修炼心得吗？我也不太懂啦... 我就是觉得风系魔法特别适合我，跑得快！",
            "其实我觉得修炼最重要的是坚持，每天都练一点，慢慢就会变强的。",
            "要不你去问莫凡吧，他比我厉害多了，肯定能给你更好的建议。"
          ],
          effects: {
            exp: 10,
            familiarity: 2
          },
          choices: [
            {
              text: "谢谢你的建议",
              next: "default"
            }
          ]
        },
        school_news: {
          id: "school_news",
          texts: [
            "学校最近啊... 好像没什么特别的事。哦对了，听说过几天有个小测验！",
            "我听说穆宁雪最近又突破了，不愧是冰系天才，真厉害。",
            "对了，最近山里好像不太太平，你去雪峰山的时候要小心啊！"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "山里不太平？什么意思？",
              next: "mountain_news",
              conditions: {
                minDay: 10
              }
            },
            {
              text: "穆宁雪是谁？",
              next: "about_mu_ningxue"
            },
            {
              text: "知道了，谢谢提醒",
              next: "default"
            }
          ]
        },
        mountain_news: {
          id: "mountain_news",
          texts: [
            "我也是听别人说的，好像最近山里的妖魔变多了，好多猎人都不敢去了。",
            "具体我也不太清楚，你可以去问问王老板，他消息灵通得很。",
            "总之你小心点，别往山里跑太深了，安全第一啊！"
          ],
          effects: {
            giveInfo: "demon_rumor_1",
            familiarity: 3
          },
          choices: [
            {
              text: "谢谢你告诉我",
              next: "default"
            }
          ]
        },
        about_mu_ningxue: {
          id: "about_mu_ningxue",
          texts: [
            "穆宁雪你都不知道？她可是我们学校的风云人物啊！穆氏家族的千金，冰系天才。",
            "长得又漂亮，实力又强，好多男生都暗恋她呢。不过她性格太高冷了，一般人都接近不了。",
            "说起来，莫凡好像跟她有点不对付，两个人一见面就吵架。"
          ],
          effects: {
            giveInfo: "mu_ningxue_intro",
            familiarity: 2
          },
          choices: [
            {
              text: "原来如此",
              next: "default"
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "随便聊啊... 那我跟你说，最近我发现了一个特别适合修炼的地方！",
            "你知道吗，我小时候特别胆小，经常被人欺负，都是莫凡帮我出头。",
            "其实我特别羡慕莫凡，他那么勇敢，那么厉害... 而我就只会跑。",
            "不过没关系！跑得快也是一种优势嘛，打不过就跑，这是我的人生信条！"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "跑得快也很厉害啊",
              next: "encourage"
            },
            {
              text: "哈哈，你真有趣",
              next: "default"
            }
          ]
        },
        encourage: {
          id: "encourage",
          texts: [
            "真的吗？你真的觉得跑得快也很厉害？",
            "谢谢你这么说... 我有时候会觉得自己很没用，但听你这么说，我好像有点信心了。",
            "好！我也要继续努力，争取以后能帮上莫凡的忙！"
          ],
          effects: {
            opinion: 5,
            trust: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "加油，我相信你",
              next: "default"
            }
          ]
        }
      }
    }
  },
  zhao_manyan: {
    id: "zhao_manyan",
    name: "赵满延",
    title: "光系富二代",
    description: "赵氏家族的少爷，光系法师，家境富裕，性格开朗，有点小贪财，但很讲义气。",
    elements: [
      "light"
    ],
    level: 3,
    maxHp: 120,
    maxMp: 70,
    attack: 12,
    defense: 10,
    speed: 10,
    skills: [
      "basic_attack",
      "light_ray"
    ],
    spriteColor: "#ffff99",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "嘿，兄弟！我叫赵满延，有什么事尽管找我！"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.5,
      kind: 0.7,
      honest: 0.6,
      impulsive: 0.4,
      loyal: 0.85,
      arrogant: 0.5,
      greedy: 0.7,
      curious: 0.8
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      mo_fan: {
        opinion: 60,
        trust: 50,
        type: "friend",
        label: "好兄弟"
      },
      zhang_xiaohou: {
        opinion: 50,
        trust: 40,
        type: "friend",
        label: "朋友"
      },
      mu_ningxue: {
        opinion: 20,
        trust: 10,
        type: "acquaintance",
        label: "同学"
      },
      tang_yue: {
        opinion: 30,
        trust: 25,
        type: "acquaintance",
        label: "实习老师"
      }
    },
    dialogueTree: {
      npcId: "zhao_manyan",
      nodes: {
        default: {
          id: "default",
          texts: [
            "嘿，兄弟！我叫赵满延，有什么事尽管找我！",
            "又见面了！最近怎么样？",
            "哟，是你啊！要不要一起去喝一杯？我请客！"
          ],
          choices: [
            {
              text: "莫凡最近怎么样？",
              next: "about_mo_fan"
            },
            {
              text: "你家里很有钱吧？",
              next: "about_family"
            },
            {
              text: "修炼上有什么心得吗？",
              next: "training_tips"
            },
            {
              text: "学校最近有什么新鲜事吗？",
              next: "school_news"
            },
            {
              text: "随便聊聊",
              next: "casual_chat"
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        about_mo_fan: {
          id: "about_mo_fan",
          texts: [
            "莫凡啊，那小子可厉害了！虽然平时看起来吊儿郎当的，但真要打起架来，那叫一个猛！",
            "我跟莫凡那是过命的交情，这小子虽然穷了点，但人特别仗义。",
            "说起来，莫凡最近好像在偷偷修炼什么，神神秘秘的... 不过我相信他肯定有自己的道理。"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "他实力很强吗？",
              next: "mo_fan_power"
            },
            {
              text: "你们是怎么认识的？",
              next: "mo_fan_history"
            },
            {
              text: "我知道了",
              next: "default"
            }
          ]
        },
        mo_fan_power: {
          id: "mo_fan_power",
          texts: [
            "那还用说！莫凡可是我们班最强的几个之一，雷系魔法用得那叫一个溜！",
            "虽然他才刚觉醒没多久，但进步速度快得吓人，我都怀疑他是不是开了挂。",
            "不过说实话，莫凡这家伙藏得挺深的，我总觉得他还有很多秘密。"
          ],
          effects: {
            opinion: 2,
            familiarity: 3
          },
          choices: [
            {
              text: "这么厉害？",
              next: "default"
            }
          ]
        },
        mo_fan_history: {
          id: "mo_fan_history",
          texts: [
            "我们是在学校认识的，一开始我还挺看不起他的，毕竟他就是个穷小子。",
            "但是后来发生了一些事，我发现莫凡这个人特别仗义，为了朋友可以两肋插刀。",
            "从那以后，我们就成了好兄弟！虽然他经常蹭我吃喝，但我不在乎，兄弟嘛！"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "真是令人羡慕的友谊",
              next: "default"
            }
          ]
        },
        about_family: {
          id: "about_family",
          texts: [
            "哈哈，你也听说了？我们赵家确实有点小钱，不过也就一般般啦。",
            "我爸是做魔法器材生意的，家里条件确实还不错，所以我从小就没缺过钱花。",
            "不过钱不是万能的，真正的朋友才是最宝贵的财富！"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "真羡慕你",
              next: "default"
            },
            {
              text: "那你能不能借我点钱？",
              next: "borrow_money"
            }
          ]
        },
        borrow_money: {
          id: "borrow_money",
          texts: [
            "借钱？这个嘛... 不是我不借，只是我最近手头也有点紧...",
            "哈哈，开个玩笑！要多少？尽管说，兄弟之间谈钱伤感情！",
            "不过话说回来，你可别乱花啊，钱要花在刀刃上！"
          ],
          effects: {
            gold: 50,
            opinion: -2,
            familiarity: 3
          },
          choices: [
            {
              text: "谢谢！我会还的",
              next: "default"
            }
          ]
        },
        training_tips: {
          id: "training_tips",
          texts: [
            "修炼心得吗？我觉得吧，修炼这种事，最重要的是天赋，其次就是资源。",
            "像我这样，家里有钱，想买什么魔法器材就买什么，修炼速度自然就快了。",
            "不过你也别灰心，勤能补拙嘛！实在不行，我可以借你点钱买器材！"
          ],
          effects: {
            exp: 10,
            familiarity: 2
          },
          choices: [
            {
              text: "谢谢你的建议",
              next: "default"
            }
          ]
        },
        school_news: {
          id: "school_news",
          texts: [
            "学校最近啊... 听说过几天有个小测验，你准备得怎么样了？",
            "我听说穆宁雪最近又突破了，不愧是冰系天才，真厉害。",
            "对了，最近山里好像不太太平，你去雪峰山的时候要小心啊！",
            "还有还有，我听说学校里要来一个新的实习老师，据说是个大美女！"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "山里不太平？什么意思？",
              next: "mountain_news",
              conditions: {
                minDay: 10
              }
            },
            {
              text: "穆宁雪是谁？",
              next: "about_mu_ningxue"
            },
            {
              text: "知道了，谢谢提醒",
              next: "default"
            }
          ]
        },
        mountain_news: {
          id: "mountain_news",
          texts: [
            "我也是听别人说的，好像最近山里的妖魔变多了，好多猎人都不敢去了。",
            "具体我也不太清楚，你可以去问问王老板，他消息灵通得很。",
            "总之你小心点，别往山里跑太深了，安全第一啊！"
          ],
          effects: {
            giveInfo: "demon_rumor_1",
            familiarity: 3
          },
          choices: [
            {
              text: "谢谢你告诉我",
              next: "default"
            }
          ]
        },
        about_mu_ningxue: {
          id: "about_mu_ningxue",
          texts: [
            "穆宁雪你都不知道？她可是我们学校的风云人物啊！穆氏家族的千金，冰系天才。",
            "长得又漂亮，实力又强，好多男生都暗恋她呢。不过她性格太高冷了，一般人都接近不了。",
            "说起来，莫凡好像跟她有点不对付，两个人一见面就吵架。"
          ],
          effects: {
            giveInfo: "mu_ningxue_intro",
            familiarity: 2
          },
          choices: [
            {
              text: "原来如此",
              next: "default"
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "随便聊啊... 那我跟你说，最近我发现了一家特别好吃的餐厅！",
            "你知道吗，我小时候的梦想是成为最厉害的光系法师，然后赚很多很多钱！",
            "其实我有时候会觉得，有钱也挺无聊的，身边的人都是冲着我的钱来的。",
            "不过没关系，认识了莫凡还有你这样的朋友，我觉得钱什么的都不重要了！"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "能认识你我也很高兴",
              next: "become_friends"
            },
            {
              text: "哈哈，你真有趣",
              next: "default"
            }
          ]
        },
        become_friends: {
          id: "become_friends",
          texts: [
            "真的吗？你真的这么想？",
            "太好了！从今天起，你就是我赵满延的好兄弟了！",
            "以后有什么事尽管找我，只要我能帮上忙的，绝对不含糊！",
            "走，我请你喝酒去！不醉不归！"
          ],
          effects: {
            opinion: 10,
            trust: 5,
            familiarity: 10,
            gold: 100
          },
          choices: [
            {
              text: "好，不醉不归！",
              next: "default"
            }
          ]
        }
      }
    }
  },
  mu_ningxue: {
    id: "mu_ningxue",
    name: "穆宁雪",
    title: "冰系天才",
    description: "穆氏家族的千金，冰系天赋极高，性格高冷，是学校里的风云人物。",
    elements: [
      "ice"
    ],
    level: 4,
    maxHp: 130,
    maxMp: 100,
    attack: 15,
    defense: 8,
    speed: 12,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_shield"
    ],
    spriteColor: "#66ccff",
    image: "assets/images/characters/mu_ningxue.jpg",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "...有什么事吗？"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.7,
      kind: 0.4,
      honest: 0.7,
      impulsive: 0.2,
      loyal: 0.6,
      arrogant: 0.8,
      greedy: 0.3,
      curious: 0.4
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: true,
      canBeMentor: true,
      canBeRival: true
    },
    relationships: {
      mo_fan: {
        opinion: -15,
        trust: 0,
        type: "complicated",
        label: "青梅竹马"
      },
      tang_yue: {
        opinion: 20,
        trust: 25,
        type: "acquaintance",
        label: "实习老师"
      },
      wang_laoban: {
        opinion: 0,
        trust: 0,
        type: "neutral",
        label: "陌生人"
      },
      zhang_xiaohou: {
        opinion: 5,
        trust: 0,
        type: "acquaintance",
        label: "同学"
      },
      zhao_manyan: {
        opinion: 15,
        trust: 5,
        type: "acquaintance",
        label: "同学"
      }
    },
    dialogueTree: {
      npcId: "mu_ningxue",
      nodes: {
        default: {
          id: "default",
          texts: [
            "...有什么事吗？",
            "...",
            "说。"
          ],
          mood: "cold",
          choices: [
            {
              id: "introduce",
              text: "你好，我是新来的",
              condition: {
                notNpcFlags: [
                  "introduced"
                ]
              },
              effects: {
                opinion: 1,
                npcFlags: {
                  introduced: true
                }
              },
              nextNode: "intro_response"
            },
            {
              id: "ask_about_ice",
              text: "请教冰系魔法",
              condition: {
                minOpinion: 10,
                minLevel: 2
              },
              effects: {
                opinion: 2,
                exp: 15
              },
              nextNode: "ice_tips"
            },
            {
              id: "challenge",
              text: "想和你切磋一下",
              condition: {
                minOpinion: 40,
                minLevel: 5
              },
              effects: {
                opinion: 3,
                respect: 5
              },
              nextNode: "challenge_response",
              action: "start_battle",
              actionData: {
                enemyId: "mu_ningxue_spar"
              }
            },
            {
              id: "leave",
              text: "打扰了，告辞",
              effects: {},
              nextNode: null
            }
          ]
        },
        intro_response: {
          id: "intro_response",
          texts: [
            "...穆宁雪。",
            "嗯，我知道了。",
            "...还有事吗？"
          ],
          mood: "cold",
          choices: [
            {
              id: "back",
              text: "没了...",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        ice_tips: {
          id: "ice_tips",
          texts: [
            "冰系...最重要的是控制。",
            "不要只想着攻击，冰的本质是束缚和防御。",
            "星子要稳，心要静。"
          ],
          mood: "neutral",
          choices: [
            {
              id: "thank",
              text: "多谢指点",
              effects: {
                opinion: 1
              },
              nextNode: "default"
            }
          ]
        },
        challenge_response: {
          id: "challenge_response",
          texts: [
            "...你确定？",
            "好，我不会手下留情。",
            "...来吧。"
          ],
          mood: "serious",
          choices: [
            {
              id: "fight",
              text: "请多指教！",
              effects: {},
              nextNode: null
            }
          ]
        }
      }
    }
  },
  tang_yue: {
    id: "tang_yue",
    name: "唐月",
    title: "实习老师",
    description: "学校的实习老师，温柔美丽，火系法师，对学生很照顾。",
    elements: [
      "fire"
    ],
    level: 5,
    maxHp: 180,
    maxMp: 120,
    attack: 22,
    defense: 10,
    speed: 13,
    skills: [
      "basic_attack",
      "fire_bolt",
      "fire_rain"
    ],
    spriteColor: "#ff6633",
    image: "assets/images/characters/tang_yue.jpg",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "同学你好，有什么问题可以问我哦。"
      },
      {
        trigger: "quest_giver",
        text: "正好，我这里有个任务，你愿意帮忙吗？"
      }
    ],
    givesQuests: [
      "quest_intro",
      "quest_collect_herbs",
      "quest_hunt_wolf_pack",
      "quest_collect_more_herbs",
      "quest_explore_mountain"
    ],
    personality: {
      brave: 0.6,
      kind: 0.9,
      honest: 0.8,
      impulsive: 0.3,
      loyal: 0.7,
      arrogant: 0.2,
      greedy: 0.2,
      curious: 0.6
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    relationships: {
      mo_fan: {
        opinion: 30,
        trust: 40,
        type: "mentor",
        label: "实习老师"
      },
      mu_ningxue: {
        opinion: 20,
        trust: 25,
        type: "acquaintance",
        label: "学生"
      },
      zhang_xiaohou: {
        opinion: 35,
        trust: 40,
        type: "acquaintance",
        label: "学生"
      },
      zhao_manyan: {
        opinion: 25,
        trust: 20,
        type: "acquaintance",
        label: "学生"
      },
      wang_laoban: {
        opinion: 15,
        trust: 10,
        type: "acquaintance",
        label: "小卖部老板"
      }
    },
    dialogueTree: {
      npcId: "tang_yue",
      nodes: {
        default: {
          id: "default",
          texts: [
            "同学你好，有什么问题可以问我哦。",
            "怎么了？遇到什么困难了吗？",
            "修炼上有什么不懂的，随时可以问我。"
          ],
          mood: "gentle",
          choices: [
            {
              id: "quest_1",
              text: "唐老师，我是新来的",
              condition: {
                notFlags: [
                  "quest_intro_accepted"
                ]
              },
              effects: {
                opinion: 2,
                startQuest: "quest_intro",
                flags: {
                  quest_intro_accepted: true
                }
              },
              nextNode: "quest_intro_dialogue"
            },
            {
              id: "quest_2",
              text: "听说您需要草药？",
              condition: {
                completedQuest: "quest_intro",
                notFlags: [
                  "quest_collect_herbs_accepted"
                ]
              },
              effects: {
                opinion: 2,
                startQuest: "quest_collect_herbs",
                flags: {
                  quest_collect_herbs_accepted: true
                }
              },
              nextNode: "quest_herbs_dialogue"
            },
            {
              id: "ask_training",
              text: "请教修炼问题",
              condition: {
                minOpinion: 5
              },
              effects: {
                opinion: 2,
                exp: 15
              },
              nextNode: "training_advice"
            },
            {
              id: "ask_school",
              text: "问问学校的情况",
              condition: {
                notNpcFlags: [
                  "asked_about_school"
                ]
              },
              effects: {
                opinion: 1,
                npcFlags: {
                  asked_about_school: true
                }
              },
              nextNode: "school_info"
            },
            {
              id: "ask_demon",
              text: "最近妖魔是不是变多了？",
              condition: {
                minOpinion: 25,
                minDay: 20
              },
              effects: {
                opinion: 1,
                giveInfo: "demon_intel_2"
              },
              nextNode: "demon_warning"
            },
            {
              id: "leave",
              text: "谢谢老师，我先走了",
              effects: {},
              nextNode: null
            }
          ]
        },
        quest_intro_dialogue: {
          id: "quest_intro_dialogue",
          texts: [
            "你好呀，新来的同学。欢迎来到天澜魔法高中！",
            "作为第一次修炼，先去修炼场感受一下魔法的力量吧。",
            "有什么不懂的随时来问我哦。"
          ],
          mood: "gentle",
          choices: [
            {
              id: "accept",
              text: "好的，谢谢老师！",
              effects: {},
              nextNode: null
            }
          ]
        },
        quest_herbs_dialogue: {
          id: "quest_herbs_dialogue",
          texts: [
            "嗯，我确实需要一些魔法草药做研究。",
            "雪峰山上有很多，不过你要小心，山上有妖魔出没。",
            "采集5株就够了，注意安全哦。"
          ],
          mood: "gentle",
          choices: [
            {
              id: "accept",
              text: "好的，我会小心的！",
              effects: {},
              nextNode: null
            }
          ]
        },
        training_advice: {
          id: "training_advice",
          texts: [
            "修炼魔法啊，最重要的是打好基础。",
            "不要急于求成，星子的引导要稳，一步一步来。",
            "还有，要注意劳逸结合，别太累着自己了。"
          ],
          mood: "gentle",
          choices: [
            {
              id: "thank",
              text: "谢谢老师！",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        school_info: {
          id: "school_info",
          texts: [
            "我们天澜魔法高中是博城最好的公立高中哦。",
            "学校里有很多优秀的老师和学生，大家都很努力。",
            "希望你在这里能学有所成！"
          ],
          mood: "gentle",
          choices: [
            {
              id: "back",
              text: "明白了",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        demon_warning: {
          id: "demon_warning",
          texts: [
            "...你也察觉到了吗？",
            "最近雪峰山的妖魔确实有点异常活跃，学校已经在调查了。",
            "你最近去山里一定要小心，别往深处走，知道吗？",
            "...总觉得有什么不好的事要发生...希望是我想多了。"
          ],
          mood: "worried",
          choices: [
            {
              id: "back",
              text: "好的，我会注意的",
              effects: {},
              nextNode: "default"
            }
          ]
        }
      }
    }
  },
  shop_keeper: {
    id: "shop_keeper",
    name: "王老板",
    title: "小卖部老板",
    description: "学校小卖部的老板，什么都卖，价格公道。",
    elements: [],
    level: 1,
    maxHp: 50,
    maxMp: 10,
    attack: 2,
    defense: 2,
    speed: 3,
    skills: [
      "basic_attack"
    ],
    spriteColor: "#cc9966",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "欢迎光临！要点什么？"
      }
    ],
    givesQuests: [],
    shopId: "school_shop",
    personality: {
      brave: 0.4,
      kind: 0.6,
      honest: 0.7,
      impulsive: 0.3,
      loyal: 0.5,
      arrogant: 0.3,
      greedy: 0.6,
      curious: 0.5
    },
    dialogueTree: {
      npcId: "shop_keeper",
      nodes: {
        default: {
          id: "default",
          texts: [
            "欢迎光临！要点什么？",
            "嘿，又来啦？今天想买点啥？",
            "小店东西齐全，价格公道，随便看看！"
          ],
          mood: "friendly",
          choices: [
            {
              id: "shop",
              text: "看看有什么卖的",
              effects: {},
              nextNode: null,
              action: "open_shop",
              actionData: {
                shopId: "school_shop"
              }
            },
            {
              id: "chat",
              text: "随便聊聊",
              condition: {
                minOpinion: 10
              },
              effects: {
                opinion: 1
              },
              nextNode: "casual_chat"
            },
            {
              id: "ask_news",
              text: "最近有什么消息吗？",
              condition: {
                minOpinion: 20
              },
              effects: {
                opinion: 1
              },
              nextNode: "news"
            },
            {
              id: "leave",
              text: "下次再来",
              effects: {},
              nextNode: null
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "你说现在的学生啊，修炼都太拼命了，药水卖得特别好。",
            "我这小店开了十几年了，什么人没见过。",
            "小伙子，我看你骨骼清奇，将来必成大器！"
          ],
          mood: "chatty",
          choices: [
            {
              id: "back",
              text: "哈哈，老板说笑了",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        news: {
          id: "news",
          texts: [
            "消息啊...最近雪峰山那边好像不太平，你去的时候小心点。",
            "听说城里来了几个陌生的法师，不知道是干什么的。",
            "还有啊，最近药草涨价了，你要是需要就早点买，过几天可能更贵。"
          ],
          mood: "whisper",
          choices: [
            {
              id: "ask_demon",
              text: "雪峰山怎么了？",
              condition: {
                minOpinion: 20,
                minDay: 10
              },
              effects: {
                opinion: 1,
                giveInfo: "demon_rumor_1"
              },
              nextNode: "demon_news_1"
            },
            {
              id: "ask_price",
              text: "药草为什么涨价？",
              condition: {
                minOpinion: 25,
                minDay: 15
              },
              effects: {
                opinion: 1,
                giveInfo: "demon_rumor_2"
              },
              nextNode: "price_news"
            },
            {
              id: "ask_more",
              text: "还有别的消息吗？",
              condition: {
                minOpinion: 35,
                minDay: 20
              },
              effects: {
                opinion: 1,
                giveInfo: "demon_rumor_3"
              },
              nextNode: "more_news"
            },
            {
              id: "back",
              text: "这样啊...",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        demon_news_1: {
          id: "demon_news_1",
          texts: [
            "具体我也不清楚，就是最近去山里打猎的，好几个都受伤回来了。",
            "说妖魔比以前多了，而且更凶了。",
            "我劝你啊，最近别往山里跑太深，太危险了。"
          ],
          mood: "worried",
          choices: [
            {
              id: "back",
              text: "好，我知道了",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        price_news: {
          id: "price_news",
          texts: [
            "还能为啥，进山采药的人少了呗。",
            "以前一天能采十几株，现在去的人少了，货就少了。",
            "听说好几个采药的都遇到妖魔了，吓得没人敢去了。"
          ],
          mood: "sigh",
          choices: [
            {
              id: "back",
              text: "原来如此",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        more_news: {
          id: "more_news",
          texts: [
            "别的啊...我跟你说，你可别往外传。",
            "酒馆里的猎魔任务最近多了一倍，赏金也涨了不少。",
            "我看啊，这事儿可能没那么简单，你自己多注意点。"
          ],
          mood: "mysterious",
          choices: [
            {
              id: "back",
              text: "谢谢老板提醒",
              effects: {},
              nextNode: "default"
            }
          ]
        }
      }
    }
  },
  hunter_li: {
    id: "hunter_li",
    name: "老李",
    title: "资深猎人",
    description: "猎魔者公会的资深猎人，经验丰富，见过各种妖魔。性格豪爽，喜欢喝酒。",
    elements: [
      "wind"
    ],
    level: 6,
    maxHp: 200,
    maxMp: 80,
    attack: 25,
    defense: 12,
    speed: 18,
    skills: [
      "basic_attack",
      "wind_blade",
      "wind_speed"
    ],
    spriteColor: "#99ff99",
    location: "city_street",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "嘿，小伙子！来喝一杯？我请客！"
      }
    ],
    givesQuests: [
      "quest_hunt_wolf_pack"
    ],
    personality: {
      brave: 0.9,
      kind: 0.6,
      honest: 0.8,
      impulsive: 0.6,
      loyal: 0.85,
      arrogant: 0.3,
      greedy: 0.4,
      curious: 0.5
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    relationships: {
      mo_fan: {
        opinion: 20,
        trust: 15,
        type: "acquaintance",
        label: "认识"
      },
      tang_yue: {
        opinion: 40,
        trust: 35,
        type: "friend",
        label: "老朋友"
      }
    },
    dialogueTree: {
      npcId: "hunter_li",
      nodes: {
        default: {
          id: "default",
          texts: [
            "嘿，小伙子！来喝一杯？我请客！",
            "又见面了！最近猎魔收获怎么样？",
            "哟，是你啊！来来来，坐下来喝两杯！"
          ],
          choices: [
            {
              text: "请教一下猎魔的技巧",
              next: "hunting_tips"
            },
            {
              text: "最近山里情况怎么样？",
              next: "mountain_situation"
            },
            {
              text: "有什么猎魔任务吗？",
              next: "hunt_quest"
            },
            {
              text: "随便聊聊",
              next: "casual_chat"
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        hunting_tips: {
          id: "hunting_tips",
          texts: [
            "猎魔的技巧？这个嘛，说简单也简单，说难也难。",
            "最重要的一点，就是要了解你的对手。每种妖魔都有自己的弱点，找到弱点，一击致命。",
            "还有啊，千万别逞强。打不过就跑，留得青山在，不怕没柴烧。",
            "想当年，我年轻的时候，也像你一样天不怕地不怕，结果差点把命丢了。"
          ],
          effects: {
            exp: 20,
            familiarity: 3
          },
          choices: [
            {
              text: "谢谢您的指点",
              next: "default"
            }
          ]
        },
        mountain_situation: {
          id: "mountain_situation",
          texts: [
            "山里的情况啊... 不太妙。最近妖魔活动越来越频繁了，而且种类也越来越多。",
            "以前山里主要就是些幽狼兽、暗影怪之类的，现在连石怪、雷兽都出现了。",
            "我干猎魔这行几十年了，从来没见过这种情况。我总觉得，有什么大事要发生...",
            "小伙子，你去山里的时候千万小心，别往深处走。"
          ],
          effects: {
            giveInfo: "demon_intel_1",
            familiarity: 5
          },
          choices: [
            {
              text: "这么严重？",
              next: "mountain_warning"
            },
            {
              text: "知道了，谢谢提醒",
              next: "default"
            }
          ]
        },
        mountain_warning: {
          id: "mountain_warning",
          texts: [
            "可不是嘛！最近公会里的猎魔任务多了一倍，赏金也涨了不少。",
            "而且啊，我听说有几个资深猎人进山之后，就再也没出来过...",
            "具体情况我也不太清楚，公会那边封锁了消息。但我觉得，事情肯定不简单。",
            "总之你小心点，千万别大意。"
          ],
          effects: {
            giveInfo: "demon_warning_1",
            opinion: 3,
            trust: 5
          },
          choices: [
            {
              text: "我会小心的",
              next: "default"
            }
          ]
        },
        hunt_quest: {
          id: "hunt_quest",
          texts: [
            "猎魔任务？有啊！最近狼群闹得厉害，公会悬赏猎杀幽狼兽。",
            "怎么样，要不要试试？虽然有点危险，但赏金不少。",
            "你要是感兴趣的话，我可以帮你接这个任务。"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "好，我接了",
              next: "accept_quest",
              conditions: {
                notFlags: [
                  "quest_hunt_wolf_pack_accepted"
                ]
              }
            },
            {
              text: "我再考虑考虑",
              next: "default"
            }
          ]
        },
        accept_quest: {
          id: "accept_quest",
          texts: [
            "好样的！有胆量！",
            "这个任务是猎杀 3 只幽狼兽，完成之后回来找我领赏。",
            "记住，安全第一，实在不行就撤，别硬撑。"
          ],
          effects: {
            startQuest: "quest_hunt_wolf_pack",
            flags: {
              quest_hunt_wolf_pack_accepted: true
            },
            opinion: 5,
            trust: 3
          },
          choices: [
            {
              text: "明白了，我这就去",
              next: "default"
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "随便聊啊... 那我跟你说说我年轻时候的事吧。",
            "想当年，我可是猎魔者公会里的一把好手，什么妖魔没见过？",
            "有一次，我遇到了一只将级的妖魔，那家伙，厉害得很！我跟它大战了三天三夜，最后终于把它杀了。",
            "哈哈，当然了，我也受了不轻的伤，在床上躺了半个月。",
            "不过啊，那才叫猎魔！现在的年轻人，太娇气了，一点苦都吃不了。"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "您真厉害",
              next: "default"
            },
            {
              text: "真的假的？",
              next: "doubt_story"
            }
          ]
        },
        doubt_story: {
          id: "doubt_story",
          texts: [
            "怎么？你不信？",
            "哈哈，我就知道你不信。没关系，等你以后经历得多了，就知道我说的都是真的。",
            "不过话说回来，确实有点夸张了，将级妖魔哪是那么容易杀的，我那时候也是九死一生。",
            "总之啊，猎魔这行，永远不要小看你的对手。"
          ],
          effects: {
            opinion: 5,
            trust: 5,
            familiarity: 5
          },
          choices: [
            {
              text: "受教了",
              next: "default"
            }
          ]
        }
      }
    }
  },
  book_shop_owner: {
    id: "book_shop_owner",
    name: "陈老板",
    title: "书店老板",
    description: "博城书店的老板，知识渊博，知道很多秘闻和传说。性格温和，喜欢看书。",
    elements: [
      "water"
    ],
    level: 5,
    maxHp: 100,
    maxMp: 120,
    attack: 8,
    defense: 8,
    speed: 8,
    skills: [
      "basic_attack",
      "water_heal"
    ],
    spriteColor: "#66aaff",
    location: "city_street",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "欢迎光临！请问有什么可以帮您的？"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4,
      kind: 0.8,
      honest: 0.9,
      impulsive: 0.2,
      loyal: 0.7,
      arrogant: 0.2,
      greedy: 0.5,
      curious: 0.9
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    relationships: {
      tang_yue: {
        opinion: 30,
        trust: 25,
        type: "acquaintance",
        label: "常客"
      },
      wang_laoban: {
        opinion: 20,
        trust: 15,
        type: "acquaintance",
        label: "同行"
      }
    },
    dialogueTree: {
      npcId: "book_shop_owner",
      nodes: {
        default: {
          id: "default",
          texts: [
            "欢迎光临！请问有什么可以帮您的？",
            "又见面了！今天想看点什么书？",
            "哟，是你啊！来来来，我最近进了一批新书，要不要看看？"
          ],
          choices: [
            {
              text: "有什么魔法书籍推荐吗？",
              next: "book_recommend"
            },
            {
              text: "听说您知道很多秘闻？",
              next: "secret_knowledge"
            },
            {
              text: "最近有什么新鲜事吗？",
              next: "latest_news"
            },
            {
              text: "随便聊聊",
              next: "casual_chat"
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        book_recommend: {
          id: "book_recommend",
          texts: [
            "魔法书籍啊... 那可就多了。",
            "如果你是初学者的话，我推荐《魔法基础理论》，这本书讲得很详细。",
            "要是你想了解元素魔法的话，《元素魔法入门》也不错。",
            "当然了，我这里还有很多珍稀的魔法书籍，不过价格嘛... 就有点贵了。"
          ],
          effects: {
            exp: 15,
            familiarity: 2
          },
          choices: [
            {
              text: "谢谢您的推荐",
              next: "default"
            }
          ]
        },
        secret_knowledge: {
          id: "secret_knowledge",
          texts: [
            "秘闻？哈哈，我确实知道一些。",
            "毕竟开了这么多年书店，来来往往的人多了，听到的事情自然也就多了。",
            "不过啊，有些事情，知道得太多可不是什么好事。",
            "你真想知道？那我就跟你说几个吧，不过你可别往外传。"
          ],
          effects: {
            familiarity: 3
          },
          choices: [
            {
              text: "关于妖魔的秘闻",
              next: "demon_secrets",
              conditions: {
                minDay: 15
              }
            },
            {
              text: "关于穆氏家族的秘闻",
              next: "mu_family_secrets"
            },
            {
              text: "算了，我还是不知道为好",
              next: "default"
            }
          ]
        },
        demon_secrets: {
          id: "demon_secrets",
          texts: [
            "妖魔的秘闻啊... 这个可就有点吓人了。",
            "我听说啊，妖魔其实是有组织的，它们也有自己的社会结构。",
            "而且，妖魔的等级划分比我们想象的要复杂得多。奴仆级之上是将级，将级之上还有统领级、君主级...",
            "最可怕的是，据说还有帝王级的妖魔，那可是能毁灭一座城市的存在！",
            "当然了，这些都只是传说，真假就不知道了。"
          ],
          effects: {
            giveInfo: "demon_intel_2",
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "真是太可怕了",
              next: "default"
            }
          ]
        },
        mu_family_secrets: {
          id: "mu_family_secrets",
          texts: [
            "穆氏家族的秘闻啊... 这个可就有点敏感了。",
            "穆家可是博城的一大家族，势力大得很。",
            "我听说啊，穆家的冰系魔法是祖传的，而且还有一件祖传的冰系魂种，厉害得很。",
            "还有啊，穆家的大小姐穆宁雪，据说天生就有冰系天赋，是百年难遇的天才。",
            "不过啊，我还听说，穆宁雪小时候好像发生过什么事，从那以后性格就变得特别冷了...",
            "具体是什么事，我就不知道了。"
          ],
          effects: {
            giveInfo: "mu_ningxue_past",
            familiarity: 5
          },
          choices: [
            {
              text: "原来如此",
              next: "default"
            }
          ]
        },
        latest_news: {
          id: "latest_news",
          texts: [
            "新鲜事啊... 让我想想。",
            "最近啊，山里好像不太太平，好多猎人都不敢进山了。",
            "还有啊，猎魔者公会最近发布了好多新任务，赏金也比以前高了不少。",
            "我总觉得，这事儿有点不对劲... 好像有什么大事要发生。",
            "你自己多注意点吧。"
          ],
          effects: {
            giveInfo: "demon_rumor_3",
            familiarity: 2
          },
          choices: [
            {
              text: "谢谢提醒",
              next: "default"
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "随便聊啊... 那我跟你说说我年轻时候的事吧。",
            "想当年，我也是个魔法学徒，梦想着成为一名伟大的法师。",
            "可惜啊，我天赋一般，修炼了几十年，也没什么长进。",
            "后来啊，我就开了这家书店，虽然不能成为伟大的法师，但能每天和书打交道，我也挺满足的。",
            "小伙子，你天赋不错，一定要好好修炼，别像我一样，到老了一事无成。"
          ],
          effects: {
            opinion: 3,
            familiarity: 5,
            exp: 10
          },
          choices: [
            {
              text: "您太谦虚了",
              next: "default"
            },
            {
              text: "我会努力的",
              next: "encourage"
            }
          ]
        },
        encourage: {
          id: "encourage",
          texts: [
            "好！有志气！",
            "我果然没看错你，你将来一定能成大器！",
            "这样吧，我送你一本书，希望对你有帮助。",
            "记住，知识就是力量，多读书总是没错的。"
          ],
          effects: {
            opinion: 5,
            trust: 5,
            familiarity: 10,
            exp: 30
          },
          choices: [
            {
              text: "谢谢您！",
              next: "default"
            }
          ]
        }
      }
    }
  },
  magic_association_chairman: {
    id: "magic_association_chairman",
    name: "周会长",
    title: "魔法协会会长",
    description: "博城魔法协会的会长，实力强大，德高望重。性格严肃，做事公正。",
    elements: [
      "fire",
      "earth"
    ],
    level: 10,
    maxHp: 500,
    maxMp: 300,
    attack: 50,
    defense: 30,
    speed: 15,
    skills: [
      "basic_attack",
      "fire_bolt",
      "fire_rain",
      "earth_shield",
      "earth_spike"
    ],
    spriteColor: "#ff9933",
    location: "city_street",
    dialogue: [
      {
        trigger: "default",
        text: "年轻人，有什么事吗？"
      }
    ],
    givesQuests: [],
    dialogueRequirements: {
      minLevel: 5,
      hint: "需要等级 5 才能见到会长"
    },
    personality: {
      brave: 0.9,
      kind: 0.7,
      honest: 0.95,
      impulsive: 0.2,
      loyal: 0.9,
      arrogant: 0.3,
      greedy: 0.1,
      curious: 0.6
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    relationships: {
      tang_yue: {
        opinion: 50,
        trust: 60,
        type: "friend",
        label: "后辈"
      },
      mu_ningxue: {
        opinion: 40,
        trust: 35,
        type: "acquaintance",
        label: "穆家千金"
      }
    },
    dialogueTree: {
      npcId: "magic_association_chairman",
      nodes: {
        default: {
          id: "default",
          texts: [
            "年轻人，有什么事吗？",
            "又见面了。最近修炼得怎么样？",
            "是你啊。有什么事就直说吧。"
          ],
          choices: [
            {
              text: "请教一下魔法修炼的问题",
              next: "magic_advice"
            },
            {
              text: "最近城里有什么大事吗？",
              next: "city_news"
            },
            {
              text: "我想加入魔法协会",
              next: "join_association"
            },
            {
              text: "随便聊聊",
              next: "casual_chat"
            },
            {
              text: "打扰了，再见",
              next: null,
              action: "close"
            }
          ]
        },
        magic_advice: {
          id: "magic_advice",
          texts: [
            "魔法修炼啊... 这个话题可就大了。",
            "魔法修炼，最重要的是基础。基础打牢了，后面才能走得更远。",
            "很多年轻人急于求成，一味追求强大的魔法，却忽略了基础的重要性。",
            "记住，魔法的本质是对元素的理解和掌控。你对元素理解得越深，魔法的威力就越大。",
            "还有啊，修炼要循序渐进，不能操之过急。不然很容易走火入魔。"
          ],
          effects: {
            exp: 30,
            familiarity: 3
          },
          choices: [
            {
              text: "受教了",
              next: "default"
            }
          ]
        },
        city_news: {
          id: "city_news",
          texts: [
            "城里的大事啊... 最近确实不太太平。",
            "山里的妖魔活动越来越频繁了，猎魔任务也多了不少。",
            "而且啊，我总觉得这次的妖魔异动有点不对劲，不像是普通的妖魔骚乱。",
            "具体是什么情况，我也不太清楚。不过你放心，魔法协会已经在调查了。",
            "你自己多注意点，没事别往山里跑。"
          ],
          effects: {
            giveInfo: "demon_intel_2",
            familiarity: 5
          },
          choices: [
            {
              text: "这么严重？",
              next: "city_warning"
            },
            {
              text: "知道了，谢谢会长提醒",
              next: "default"
            }
          ]
        },
        city_warning: {
          id: "city_warning",
          texts: [
            "嗯，情况确实不太乐观。",
            "我已经向上面汇报了，相信很快就会有结果。",
            "不过啊，有些事情，可能比我们想象的要复杂得多。",
            "你还年轻，有些事情，知道得太多反而不好。",
            "总之，你好好修炼，提升自己的实力，这才是最重要的。"
          ],
          effects: {
            giveInfo: "demon_warning_1",
            opinion: 3,
            trust: 5
          },
          choices: [
            {
              text: "我明白了",
              next: "default"
            }
          ]
        },
        join_association: {
          id: "join_association",
          texts: [
            "想加入魔法协会？有志气！",
            "不过啊，魔法协会可不是那么好进的。想要加入，必须通过我们的考核。",
            "考核的内容嘛，主要是看你的魔法实力和潜力。",
            "以你现在的实力，还差了一点。不过没关系，年轻人嘛，还有很大的进步空间。",
            "等你实力够了，再来找我吧。我相信你一定可以的！"
          ],
          effects: {
            opinion: 5,
            familiarity: 3
          },
          choices: [
            {
              text: "我会努力的",
              next: "default"
            }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "随便聊啊... 那我跟你说说我年轻时候的事吧。",
            "想当年，我也像你一样，是个意气风发的年轻人，梦想着成为最强大的法师。",
            "我从一个小地方出来，一路打拼，吃了不少苦，也走了不少弯路。",
            "不过啊，我从来没有放弃过。凭着一股不服输的劲头，我终于走到了今天这个位置。",
            "年轻人，记住一句话：只要你肯努力，就没有什么是不可能的。"
          ],
          effects: {
            opinion: 3,
            familiarity: 5,
            exp: 20
          },
          choices: [
            {
              text: "您真厉害",
              next: "default"
            },
            {
              text: "我一定会努力的",
              next: "encourage"
            }
          ]
        },
        encourage: {
          id: "encourage",
          texts: [
            "好！有你这句话，我就放心了。",
            "我果然没看错你，你将来一定能成大器！",
            "这样吧，我送你一件小礼物，希望对你有帮助。",
            "记住，魔法的道路是没有尽头的，永远不要停下前进的脚步。"
          ],
          effects: {
            opinion: 10,
            trust: 10,
            familiarity: 15,
            gold: 200,
            reputation: {
              magic_association: 10
            }
          },
          choices: [
            {
              text: "谢谢会长！",
              next: "default"
            }
          ]
        }
      }
    }
  },
  mysterious_mage: {
    id: "mysterious_mage",
    name: "神秘人",
    title: "流浪法师",
    description: "一个神秘的流浪法师，不知道从哪里来，也不知道要到哪里去。似乎知道很多秘密。",
    elements: [
      "dark"
    ],
    level: 8,
    maxHp: 300,
    maxMp: 200,
    attack: 35,
    defense: 15,
    speed: 20,
    skills: [
      "basic_attack",
      "dark_bolt"
    ],
    spriteColor: "#993399",
    location: "city_street",
    availableTimes: [
      "night",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "...你能看到我？"
      }
    ],
    givesQuests: [],
    dialogueRequirements: {
      minLevel: 3,
      hint: "需要等级 3 才能引起他的注意"
    },
    personality: {
      brave: 0.8,
      kind: 0.5,
      honest: 0.4,
      impulsive: 0.3,
      loyal: 0.6,
      arrogant: 0.7,
      greedy: 0.3,
      curious: 0.9
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: true
    },
    relationships: {},
    dialogueTree: {
      npcId: "mysterious_mage",
      nodes: {
        default: {
          id: "default",
          texts: [
            "...你能看到我？",
            "又见面了。你很有趣。",
            "是你啊... 怎么，又想知道些什么？"
          ],
          choices: [
            {
              text: "你是谁？",
              next: "who_are_you"
            },
            {
              text: "你知道些什么秘密？",
              next: "what_secrets"
            },
            {
              text: "能教我魔法吗？",
              next: "teach_magic"
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        who_are_you: {
          id: "who_are_you",
          texts: [
            "我是谁？... 我也不知道。",
            "我只是一个流浪的法师，到处走走，看看。",
            "这个世界很大，有很多你不知道的事情。",
            "你想知道更多吗？那就好好修炼吧。等你足够强大了，自然会知道的。"
          ],
          effects: {
            familiarity: 5
          },
          choices: [
            {
              text: "你真神秘",
              next: "default"
            }
          ]
        },
        what_secrets: {
          id: "what_secrets",
          texts: [
            "秘密？... 这个世界上的秘密可多了去了。",
            "比如... 你知道黑教廷吗？",
            "黑教廷，是一个邪恶的组织，他们一直在暗中策划着什么。",
            "而且啊，我听说，黑教廷已经渗透到博城了...",
            "当然，这些都只是传闻，真假就不知道了。"
          ],
          effects: {
            giveInfo: "black_church_rumor",
            familiarity: 10
          },
          choices: [
            {
              text: "黑教廷？那是什么？",
              next: "about_black_church"
            },
            {
              text: "太可怕了",
              next: "default"
            }
          ]
        },
        about_black_church: {
          id: "about_black_church",
          texts: [
            "黑教廷啊... 那是一个非常古老的组织。",
            "他们信奉黑暗，追求力量，为了达到目的不择手段。",
            "黑教廷的成员遍布各地，隐藏得很深，你永远不知道你身边的人是不是黑教廷的人。",
            "而且啊，黑教廷还有很多可怕的禁术，想想都让人不寒而栗。",
            "总之啊，你自己小心点，别惹上他们。"
          ],
          effects: {
            giveInfo: "black_church_intel",
            opinion: 5,
            trust: 5
          },
          choices: [
            {
              text: "我会小心的",
              next: "default"
            }
          ]
        },
        teach_magic: {
          id: "teach_magic",
          texts: [
            "教你魔法？... 你确定？",
            "我会的魔法，可不是什么正经的魔法。",
            "暗影系的魔法，威力强大，但也很危险。一不小心，就会被黑暗吞噬。",
            "不过啊，如果你真的想学的话... 我倒是可以教你一点。",
            "怎么样，要不要试试？"
          ],
          effects: {
            familiarity: 5
          },
          choices: [
            {
              text: "好，我想学！",
              next: "learn_dark_magic"
            },
            {
              text: "算了，太危险了",
              next: "default"
            }
          ]
        },
        learn_dark_magic: {
          id: "learn_dark_magic",
          texts: [
            "好！有胆量！我果然没看错你。",
            "暗影系魔法的精髓，在于隐藏和偷袭。",
            "记住，暗影系的魔法，正面硬刚是不行的，要学会利用阴影，出其不意。",
            "来，我教你一个简单的暗影系魔法——暗影腐蚀。",
            "这个魔法可以在敌人身上留下腐蚀效果，持续造成伤害。",
            "怎么样，学会了吗？"
          ],
          effects: {
            opinion: 10,
            trust: 10,
            familiarity: 15,
            exp: 50
          },
          choices: [
            {
              text: "学会了！谢谢您！",
              next: "default"
            }
          ]
        }
      }
    }
  },
  xiao_principal: {
    id: "xiao_principal",
    name: "萧院长",
    title: "天澜魔法高中院长",
    description: "天澜魔法高中的院长，一位德高望重的老法师，火系修为深厚，培养了无数优秀的法师。",
    elements: [
      "fire",
      "wind"
    ],
    level: 15,
    maxHp: 800,
    maxMp: 500,
    attack: 80,
    defense: 50,
    speed: 25,
    skills: [
      "basic_attack",
      "fire_bolt",
      "fire_rain",
      "wind_blade",
      "wind_speed"
    ],
    spriteColor: "#ff6633",
    location: "tianlan_school",
    dialogue: [
      {
        trigger: "default",
        text: "年轻人，有什么事吗？"
      }
    ],
    givesQuests: [],
    dialogueRequirements: {
      minLevel: 7,
      hint: "需要等级 7 才能见到院长"
    },
    personality: {
      brave: 0.9,
      kind: 0.85,
      honest: 0.95,
      impulsive: 0.1,
      loyal: 0.9,
      arrogant: 0.2,
      greedy: 0.1,
      curious: 0.6
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    initialRelationships: {
      tang_yue: {
        opinion: 70,
        trust: 75,
        type: "friend",
        label: "后辈"
      },
      mo_fan: {
        opinion: 40,
        trust: 30,
        type: "acquaintance",
        label: "学生"
      },
      mu_ningxue: {
        opinion: 60,
        trust: 55,
        type: "acquaintance",
        label: "天才学生"
      },
      magic_association_chairman: {
        opinion: 65,
        trust: 60,
        type: "friend",
        label: "老朋友"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "哦？是你啊，最近修炼得怎么样？",
            "年轻人，有什么事吗？",
            "好好修炼，不要辜负了你的天赋。"
          ],
          mood: "kind",
          choices: [
            {
              text: "请教一下修炼的问题",
              next: "training_advice"
            },
            {
              text: "学校最近有什么事吗？",
              next: "school_news"
            },
            {
              text: "我想申请特殊资源",
              next: "special_resources"
            },
            {
              text: "听说山里不太平",
              next: "demon_warning"
            },
            {
              text: "打扰了，再见",
              next: null,
              action: "close"
            }
          ]
        },
        training_advice: {
          id: "training_advice",
          texts: [
            "修炼一途，贵在坚持。",
            "魔法的本质，是对元素的理解和掌控。",
            "不要只追求力量的强大，更要注重心性的修炼。",
            "记住，真正强大的法师，不仅要有强大的魔法，更要有坚定的意志。"
          ],
          effects: {
            opinion: 2,
            familiarity: 5,
            exp: 30
          },
          choices: [
            {
              text: "谢谢院长指点！",
              next: "default"
            }
          ]
        },
        school_news: {
          id: "school_news",
          texts: [
            "学校最近一切都好，学生们都很努力。",
            "不过啊，最近雪峰山那边有点不太平，你们要小心点。",
            "期末考核快到了，你们要好好准备。",
            "对了，今年的新生里，有几个好苗子啊..."
          ],
          effects: {
            familiarity: 3,
            giveInfo: "school_info_3"
          },
          choices: [
            {
              text: "雪峰山怎么了？",
              next: "demon_warning"
            },
            {
              text: "期末考核是什么样的？",
              next: "final_exam"
            },
            {
              text: "我知道了",
              next: "default"
            }
          ]
        },
        final_exam: {
          id: "final_exam",
          texts: [
            "期末考核啊，那可是对你们这一学期学习成果的检验。",
            "考核分为理论和实战两部分，都很重要。",
            "只要你平时认真修炼，通过考核应该不成问题。",
            "当然，如果你表现优异的话，还会有额外的奖励哦。"
          ],
          effects: {
            familiarity: 3
          },
          choices: [
            {
              text: "我会努力的！",
              next: "default"
            }
          ]
        },
        special_resources: {
          id: "special_resources",
          texts: [
            "特殊资源？... 你想要什么？",
            "学校的资源都是有限的，要留给真正有天赋的学生。",
            "当然，如果你能证明自己的实力，我也可以考虑给你一些特殊的资源。",
            "怎么样，想试试吗？"
          ],
          effects: {
            familiarity: 5
          },
          choices: [
            {
              text: "我想试试！",
              next: "special_test"
            },
            {
              text: "算了，我再想想",
              next: "default"
            }
          ]
        },
        special_test: {
          id: "special_test",
          texts: [
            "好！有志向！",
            "这样吧，如果你能在期末考核中取得前三名的成绩，我就给你一份特殊的奖励。",
            "怎么样，有信心吗？",
            "记住，机会是留给有准备的人的。"
          ],
          effects: {
            opinion: 5,
            trust: 5,
            npcFlags: {
              special_test_accepted: true
            }
          },
          choices: [
            {
              text: "我有信心！",
              next: "default"
            }
          ]
        },
        demon_warning: {
          id: "demon_warning",
          texts: [
            "雪峰山的事... 你也听说了？",
            "确实，最近山里的妖魔有点异常，活动越来越频繁了。",
            "不过你放心，学校已经加强了防护，应该不会有什么大问题。",
            "但是啊，你自己也要小心，没事别往山里跑。",
            "记住，安全第一，知道吗？"
          ],
          effects: {
            opinion: 3,
            giveInfo: "demon_warning_1"
          },
          condition: {
            minDay: 25
          },
          choices: [
            {
              text: "我知道了，谢谢院长提醒",
              next: "default"
            }
          ]
        }
      }
    }
  },
  xue_musheng: {
    id: "xue_musheng",
    name: "薛木生",
    title: "天澜魔法高中班主任",
    description: "莫凡所在班级的班主任，火系法师，教学严格但关心学生。",
    elements: [
      "fire"
    ],
    level: 8,
    maxHp: 300,
    maxMp: 150,
    attack: 30,
    defense: 15,
    speed: 12,
    skills: [
      "basic_attack",
      "fire_bolt"
    ],
    spriteColor: "#ff6633",
    isNPC: true,
    location: "school",
    personality: {
      brave: 0.7,
      kind: 0.6,
      honest: 0.9,
      impulsive: 0.3,
      loyal: 0.8,
      arrogant: 0.2,
      greedy: 0.1,
      curious: 0.5
    },
    relationshipCaps: {
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    dialogueRequirements: {
      minLevel: 1
    },
    initialRelationships: {
      mo_fan: {
        opinion: 30,
        trust: 40,
        type: "acquaintance",
        label: "学生"
      },
      zhang_xiaohou: {
        opinion: 35,
        trust: 45,
        type: "acquaintance",
        label: "学生"
      },
      zhao_manyan: {
        opinion: 25,
        trust: 30,
        type: "acquaintance",
        label: "学生"
      },
      mu_ningxue: {
        opinion: 60,
        trust: 55,
        type: "acquaintance",
        label: "天才学生"
      },
      tang_yue: {
        opinion: 50,
        trust: 55,
        type: "friend",
        label: "同事"
      },
      xiao_principal: {
        opinion: 70,
        trust: 75,
        type: "mentor",
        label: "校长"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "是你啊，最近学习怎么样？",
            "有什么事吗？",
            "要好好修炼，不要偷懒。"
          ],
          mood: "serious",
          choices: [
            {
              text: "请教一下学习的问题",
              next: "study_advice"
            },
            {
              text: "班里最近有什么事吗？",
              next: "class_news"
            },
            {
              text: "关于考核的事...",
              next: "exam_info"
            },
            {
              text: "听说山里不太平",
              next: "demon_warning"
            },
            {
              text: "打扰了，老师再见",
              next: null,
              action: "close"
            }
          ]
        },
        study_advice: {
          id: "study_advice",
          texts: [
            "学习魔法，基础最重要。",
            "不要好高骛远，先把基础打牢。",
            "理论和实践同样重要，既要上课认真听，也要多去实战。",
            "记住，魔法的本质是对元素的理解，理解得越深，魔法就越强。"
          ],
          effects: {
            opinion: 2,
            familiarity: 3,
            exp: 20
          },
          choices: [
            {
              text: "谢谢老师指点！",
              next: "default"
            }
          ]
        },
        class_news: {
          id: "class_news",
          texts: [
            "班里啊... 最近大家都挺努力的。",
            "穆宁雪还是那么优秀，冰系魔法用得越来越好了。",
            "莫凡那小子，虽然平时吊儿郎当的，但进步挺快的。",
            "赵满延家里有钱，装备不错，就是修炼不够刻苦。",
            "张小侯那孩子，虽然天赋一般，但特别努力，我很看好他。"
          ],
          effects: {
            opinion: 1,
            familiarity: 2
          },
          choices: [
            {
              text: "原来是这样",
              next: "default"
            }
          ]
        },
        exam_info: {
          id: "exam_info",
          texts: [
            "考核的事啊... 你想知道什么？",
            "入学考核主要考基础魔法的运用，只要你认真修炼了，应该没问题。",
            "期中考核会难一些，不仅考理论，还要考实战。",
            "期末考核是最重要的，直接关系到你能不能顺利升级。",
            "好好准备吧，不要临时抱佛脚。"
          ],
          effects: {
            opinion: 1,
            familiarity: 2
          },
          choices: [
            {
              text: "我会好好准备的",
              next: "default"
            }
          ]
        },
        demon_warning: {
          id: "demon_warning",
          texts: [
            "雪峰山的事... 你也听说了？",
            "确实，最近山里有点不太平，妖魔活动比平时频繁了。",
            "学校已经发了通知，禁止学生私自进山。",
            "你也给我注意点，没事别往山里跑，知道吗？",
            "安全第一，修炼可以慢慢来，命只有一条。"
          ],
          effects: {
            opinion: 2,
            giveInfo: "demon_warning_1"
          },
          condition: {
            minDay: 20
          },
          choices: [
            {
              text: "我知道了，谢谢老师提醒",
              next: "default"
            }
          ]
        }
      }
    }
  },
  zhou_min: {
    id: "zhou_min",
    name: "周敏",
    title: "天澜魔法高中学生",
    description: "莫凡的同班同学，火系法师，性格活泼开朗，成绩不错。",
    elements: [
      "fire"
    ],
    level: 2,
    maxHp: 80,
    maxMp: 60,
    attack: 12,
    defense: 5,
    speed: 11,
    skills: [
      "basic_attack",
      "fire_bolt"
    ],
    spriteColor: "#ff5522",
    isNPC: true,
    location: "school",
    personality: {
      brave: 0.6,
      kind: 0.8,
      honest: 0.7,
      impulsive: 0.5,
      loyal: 0.7,
      arrogant: 0.3,
      greedy: 0.2,
      curious: 0.8
    },
    relationshipCaps: {
      canRomance: true,
      canBeMentor: false,
      canBeRival: false
    },
    dialogueRequirements: {
      minLevel: 1
    },
    initialRelationships: {
      mo_fan: {
        opinion: 15,
        trust: 10,
        type: "acquaintance",
        label: "同学"
      },
      zhang_xiaohou: {
        opinion: 20,
        trust: 15,
        type: "acquaintance",
        label: "同学"
      },
      zhao_manyan: {
        opinion: 25,
        trust: 20,
        type: "acquaintance",
        label: "同学"
      },
      mu_ningxue: {
        opinion: 10,
        trust: 5,
        type: "acquaintance",
        label: "同学"
      },
      tang_yue: {
        opinion: 30,
        trust: 35,
        type: "acquaintance",
        label: "老师"
      },
      xue_musheng: {
        opinion: 40,
        trust: 45,
        type: "acquaintance",
        label: "班主任"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "嗨！你好啊，我叫周敏！",
            "又见面啦！今天修炼得怎么样？",
            "你也是来上课的吗？"
          ],
          mood: "friendly",
          choices: [
            {
              text: "你好，我是新来的",
              next: "intro"
            },
            {
              text: "修炼上有什么心得吗？",
              next: "training_tips"
            },
            {
              text: "班里最近有什么新鲜事吗？",
              next: "class_news"
            },
            {
              text: "一起去修炼吗？",
              next: "train_together",
              condition: {
                minOpinion: 25
              }
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        intro: {
          id: "intro",
          texts: [
            "新来的？欢迎欢迎！我是周敏，火系的。",
            "有什么不懂的可以问我哦，我虽然不是最厉害的，但知道的还挺多的！",
            "对了，你是什么系的呀？"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "谢谢你的欢迎",
              next: "default"
            }
          ]
        },
        training_tips: {
          id: "training_tips",
          texts: [
            "修炼心得吗？我觉得火系魔法最重要的是控制！",
            "火的力量很强，但如果控制不好，很容易伤到自己或者别人。",
            "我每天都会花时间练习控制力，虽然有点枯燥，但真的很有用！",
            "你也可以试试，从控制小火苗开始，慢慢就能控制更大的火焰了。"
          ],
          effects: {
            opinion: 2,
            familiarity: 3,
            exp: 10
          },
          choices: [
            {
              text: "有道理，我也试试",
              next: "default"
            }
          ]
        },
        class_news: {
          id: "class_news",
          texts: [
            "新鲜事吗？让我想想...",
            "对了！穆宁雪最近又突破了，冰系魔法越来越厉害了，真羡慕！",
            "还有啊，莫凡那家伙，看起来吊儿郎当的，没想到进步还挺快的。",
            "赵满延又在炫耀他的新装备了，真是的，有钱了不起啊...",
            "张小侯最近特别努力，每天都修炼到很晚，我都有点佩服他了。"
          ],
          effects: {
            opinion: 1,
            familiarity: 2
          },
          choices: [
            {
              text: "原来是这样",
              next: "default"
            }
          ]
        },
        train_together: {
          id: "train_together",
          texts: [
            "一起修炼？好啊好啊！",
            "两个人一起修炼更有动力，还能互相切磋！",
            "走吧，我们去修炼室！"
          ],
          effects: {
            opinion: 5,
            familiarity: 8,
            exp: 25
          },
          choices: [
            {
              text: "好，走吧！",
              next: "default"
            }
          ]
        }
      }
    }
  },
  xu_zhaoting: {
    id: "xu_zhaoting",
    name: "许昭霆",
    title: "天澜魔法高中学生",
    description: "莫凡的同班同学，雷系法师，天赋不错，性格有点骄傲，但人不坏。",
    elements: [
      "thunder"
    ],
    level: 3,
    maxHp: 90,
    maxMp: 70,
    attack: 14,
    defense: 6,
    speed: 12,
    skills: [
      "basic_attack",
      "thunder_bolt"
    ],
    spriteColor: "#9966ff",
    isNPC: true,
    location: "school",
    personality: {
      brave: 0.7,
      kind: 0.5,
      honest: 0.6,
      impulsive: 0.6,
      loyal: 0.6,
      arrogant: 0.7,
      greedy: 0.3,
      curious: 0.6
    },
    relationshipCaps: {
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    dialogueRequirements: {
      minLevel: 1
    },
    initialRelationships: {
      mo_fan: {
        opinion: -10,
        trust: 0,
        type: "cold",
        label: "竞争对手"
      },
      zhang_xiaohou: {
        opinion: 5,
        trust: 0,
        type: "acquaintance",
        label: "同学"
      },
      zhao_manyan: {
        opinion: 15,
        trust: 10,
        type: "acquaintance",
        label: "同学"
      },
      mu_ningxue: {
        opinion: 20,
        trust: 10,
        type: "acquaintance",
        label: "同学"
      },
      zhou_min: {
        opinion: 10,
        trust: 5,
        type: "acquaintance",
        label: "同学"
      },
      tang_yue: {
        opinion: 25,
        trust: 30,
        type: "acquaintance",
        label: "老师"
      },
      xue_musheng: {
        opinion: 35,
        trust: 40,
        type: "acquaintance",
        label: "班主任"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "嗯？你找我有事？",
            "怎么，想请教我雷系魔法？",
            "有话快说，我还要修炼呢。"
          ],
          mood: "arrogant",
          choices: [
            {
              text: "你好，我是新来的",
              next: "intro"
            },
            {
              text: "雷系魔法很厉害啊",
              next: "thunder_praise"
            },
            {
              text: "要不要切磋一下？",
              next: "challenge",
              condition: {
                minOpinion: 10,
                minLevel: 3
              }
            },
            {
              text: "班里最近怎么样？",
              next: "class_news"
            },
            {
              text: "打扰了，再见",
              next: null,
              action: "close"
            }
          ]
        },
        intro: {
          id: "intro",
          texts: [
            "新来的？我叫许昭霆，雷系的。",
            "雷系可是很强的元素，能选到雷系是你的运气。",
            "不过，光有天赋可不够，还得努力修炼才行。",
            "好好努力吧，别给雷系丢脸。"
          ],
          effects: {
            opinion: 1,
            familiarity: 3
          },
          choices: [
            {
              text: "我会努力的",
              next: "default"
            }
          ]
        },
        thunder_praise: {
          id: "thunder_praise",
          texts: [
            "那当然！雷系可是所有元素中攻击力最强的！",
            "雷电的速度快，威力大，防不胜防！",
            "我跟你说，只要雷系魔法用得好，同阶几乎无敌！",
            "当然，像我这么有天赋的雷系法师，就更厉害了，哈哈！"
          ],
          effects: {
            opinion: 3,
            familiarity: 2
          },
          choices: [
            {
              text: "确实很厉害",
              next: "default"
            }
          ]
        },
        challenge: {
          id: "challenge",
          texts: [
            "切磋？你确定？",
            "哼，既然你想试试，那我就陪你玩玩！",
            "不过你可别输得太惨啊，哈哈！"
          ],
          effects: {
            opinion: 5
          },
          action: "start_battle",
          actionData: {
            enemyId: "xu_zhaoting_spar"
          },
          choices: [
            {
              text: "来吧！",
              next: "default"
            }
          ]
        },
        class_news: {
          id: "class_news",
          texts: [
            "班里啊... 就那样呗。",
            "穆宁雪还是那么强，冰系魔法用得真好，不过我雷系也不差！",
            "莫凡那家伙，不知道走了什么狗屎运，进步还挺快的。",
            "赵满延就是个富二代，除了装备好，没什么了不起的。",
            "周敏那丫头，挺努力的，就是天赋差了点。"
          ],
          effects: {
            opinion: 1,
            familiarity: 2
          },
          choices: [
            {
              text: "原来是这样",
              next: "default"
            }
          ]
        }
      }
    }
  },
  he_yu: {
    id: "he_yu",
    name: "何雨",
    title: "天澜魔法高中学生",
    description: "莫凡的同班同学，水系法师，性格温柔善良，乐于助人，治疗魔法很有天赋。",
    elements: [
      "water"
    ],
    level: 2,
    maxHp: 70,
    maxMp: 80,
    attack: 8,
    defense: 6,
    speed: 9,
    skills: [
      "basic_attack",
      "water_heal"
    ],
    spriteColor: "#3399ff",
    isNPC: true,
    location: "school",
    personality: {
      brave: 0.4,
      kind: 0.95,
      honest: 0.85,
      impulsive: 0.2,
      loyal: 0.8,
      arrogant: 0.1,
      greedy: 0.1,
      curious: 0.6
    },
    relationshipCaps: {
      canRomance: true,
      canBeMentor: false,
      canBeRival: false
    },
    dialogueRequirements: {
      minLevel: 1
    },
    initialRelationships: {
      mo_fan: {
        opinion: 10,
        trust: 10,
        type: "acquaintance",
        label: "同学"
      },
      zhang_xiaohou: {
        opinion: 15,
        trust: 15,
        type: "acquaintance",
        label: "同学"
      },
      zhao_manyan: {
        opinion: 20,
        trust: 15,
        type: "acquaintance",
        label: "同学"
      },
      mu_ningxue: {
        opinion: 15,
        trust: 10,
        type: "acquaintance",
        label: "同学"
      },
      zhou_min: {
        opinion: 30,
        trust: 35,
        type: "friend",
        label: "好朋友"
      },
      xu_zhaoting: {
        opinion: 5,
        trust: 0,
        type: "acquaintance",
        label: "同学"
      },
      tang_yue: {
        opinion: 35,
        trust: 40,
        type: "acquaintance",
        label: "老师"
      },
      xue_musheng: {
        opinion: 45,
        trust: 50,
        type: "acquaintance",
        label: "班主任"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "你好呀，有什么事吗？",
            "又见面了，今天过得怎么样？",
            "...嗯？找我有事吗？"
          ],
          mood: "gentle",
          choices: [
            {
              text: "你好，我是新来的",
              next: "intro"
            },
            {
              text: "水系魔法怎么修炼？",
              next: "water_tips"
            },
            {
              text: "你会治疗魔法吗？",
              next: "heal_magic"
            },
            {
              text: "班里最近怎么样？",
              next: "class_news"
            },
            {
              text: "能帮我治疗一下吗？",
              next: "heal_player",
              condition: {
                minOpinion: 20
              }
            },
            {
              text: "再见",
              next: null,
              action: "close"
            }
          ]
        },
        intro: {
          id: "intro",
          texts: [
            "新来的？欢迎你！我叫何雨，水系的。",
            "有什么不懂的可以问我哦，我会尽力帮你的！",
            "对了，你是什么系的呀？"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "谢谢你，你人真好",
              next: "default"
            }
          ]
        },
        water_tips: {
          id: "water_tips",
          texts: [
            "水系魔法吗？我觉得最重要的是感受水的流动。",
            "水是很温柔的，但也很有力量，要学会和它沟通。",
            "我每天都会冥想，感受周围的水元素，虽然进步慢，但很扎实。",
            "水系虽然攻击力不强，但辅助和治疗都很厉害哦！"
          ],
          effects: {
            opinion: 2,
            familiarity: 3,
            exp: 10
          },
          choices: [
            {
              text: "原来如此，我明白了",
              next: "default"
            }
          ]
        },
        heal_magic: {
          id: "heal_magic",
          texts: [
            "治疗魔法吗？我会一点点...",
            "水系魔法天生就适合治疗，只要把水元素引导到伤口处，就能加速恢复。",
            "不过我现在还不太熟练，只能治疗一些小伤。",
            "我会继续努力的，希望以后能成为一名优秀的治疗师！"
          ],
          effects: {
            opinion: 2,
            familiarity: 3
          },
          choices: [
            {
              text: "你一定可以的",
              next: "default"
            }
          ]
        },
        class_news: {
          id: "class_news",
          texts: [
            "班里吗... 大家都挺好的。",
            "周敏最近修炼很努力，我们经常一起去图书馆。",
            "许昭霆还是那么骄傲，不过他人其实不坏。",
            "穆宁雪虽然看起来冷冷的，但我觉得她人挺好的。",
            "莫凡... 我有点看不透他，感觉他藏着很多秘密。"
          ],
          effects: {
            opinion: 1,
            familiarity: 2
          },
          choices: [
            {
              text: "原来是这样",
              next: "default"
            }
          ]
        },
        heal_player: {
          id: "heal_player",
          texts: [
            "你受伤了？让我看看...",
            "别担心，我帮你治疗一下。",
            "水系治愈术！",
            "好了，感觉怎么样？应该好多了吧？",
            "以后要小心一点哦，受伤了就来找我。"
          ],
          effects: {
            opinion: 3,
            familiarity: 5,
            hp: 50
          },
          choices: [
            {
              text: "谢谢你，何雨！",
              next: "default"
            }
          ]
        }
      }
    }
  },
  mu_zhuoyun: {
    id: "mu_zhuoyun",
    name: "穆卓云",
    title: "穆氏家族家主",
    description: "博城穆氏家族的家主，冰系高阶法师，实力强大，性格威严。",
    elements: [
      "ice"
    ],
    level: 15,
    maxHp: 800,
    maxMp: 400,
    attack: 60,
    defense: 40,
    speed: 18,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_shield"
    ],
    spriteColor: "#88ccff",
    isNPC: true,
    location: "mu_manor",
    personality: {
      brave: 0.8,
      kind: 0.3,
      honest: 0.6,
      impulsive: 0.2,
      loyal: 0.7,
      arrogant: 0.9,
      greedy: 0.5,
      curious: 0.3
    },
    relationshipCaps: {
      canRomance: false,
      canBeMentor: true,
      canBeRival: true
    },
    dialogueRequirements: {
      minLevel: 5,
      minReputation: {
        mu_family: 10
      }
    },
    initialRelationships: {
      mu_ningxue: {
        opinion: 50,
        trust: 40,
        type: "acquaintance",
        label: "侄女"
      },
      mu_he: {
        opinion: 60,
        trust: 65,
        type: "friend",
        label: "弟弟"
      },
      xiao_principal: {
        opinion: 40,
        trust: 35,
        type: "acquaintance",
        label: "校长"
      },
      magic_association_chairman: {
        opinion: 45,
        trust: 40,
        type: "acquaintance",
        label: "会长"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "嗯？你是谁？找我有什么事？",
            "年轻人，有话直说。",
            "穆家不是什么人都能随便进的。"
          ],
          mood: "arrogant",
          choices: [
            {
              text: "晚辈冒昧打扰了",
              next: "polite_greeting",
              condition: {
                minOpinion: 0
              }
            },
            {
              text: "我想了解一下穆氏家族",
              next: "about_mu_family",
              condition: {
                minOpinion: 10
              }
            },
            {
              text: "关于穆宁雪...",
              next: "about_mu_ningxue",
              condition: {
                minOpinion: 20
              }
            },
            {
              text: "听说最近山里不太平",
              next: "demon_warning",
              condition: {
                minDay: 30,
                minOpinion: 15
              }
            },
            {
              text: "打扰了，告辞",
              next: null,
              action: "close"
            }
          ]
        },
        polite_greeting: {
          id: "polite_greeting",
          texts: [
            "哦？还算懂礼貌。",
            "你是天澜魔法高中的学生吧？叫什么名字？",
            "嗯，年轻人，好好修炼，不要浪费了你的天赋。"
          ],
          effects: {
            opinion: 2,
            familiarity: 3
          },
          choices: [
            {
              text: "多谢家主指点",
              next: "default"
            }
          ]
        },
        about_mu_family: {
          id: "about_mu_family",
          texts: [
            "穆氏家族？哼，我们穆家可是博城的老牌家族，传承了几百年。",
            "我们穆家以冰系魔法闻名，祖上出过好几位高阶法师。",
            "在博城，穆家说一不二，知道吗？",
            "不过... 最近家族里也有些不太平啊..."
          ],
          effects: {
            opinion: 1,
            familiarity: 5,
            giveInfo: "mu_family_intro"
          },
          choices: [
            {
              text: "穆家真厉害",
              next: "default"
            },
            {
              text: "什么不太平？",
              next: "mu_family_trouble",
              condition: {
                minOpinion: 30
              }
            }
          ]
        },
        mu_family_trouble: {
          id: "mu_family_trouble",
          texts: [
            "哼，还不是那些旁支的事...",
            "家族大了，什么人都有，总有些不安分的。",
            "不过你放心，有我在，穆家乱不了。",
            "年轻人，这些事不是你该操心的，好好修炼去吧。"
          ],
          effects: {
            opinion: -1,
            familiarity: 3
          },
          choices: [
            {
              text: "是，晚辈明白",
              next: "default"
            }
          ]
        },
        about_mu_ningxue: {
          id: "about_mu_ningxue",
          texts: [
            "宁雪？她是我大哥的女儿，天赋很好，是我们穆家这一代最出色的孩子。",
            "冰系天赋极佳，小小年纪就已经初阶圆满了，将来必成大器。",
            "就是性格太冷了点，像她母亲...",
            "你问这个干什么？难道你对宁雪... 哼，劝你死了这条心，宁雪不是你能配得上的。"
          ],
          effects: {
            opinion: -3,
            familiarity: 5
          },
          choices: [
            {
              text: "晚辈不敢，只是好奇",
              next: "default"
            }
          ]
        },
        demon_warning: {
          id: "demon_warning",
          texts: [
            "山里的事？哼，我早就知道了。",
            "那些妖魔最近确实有点异常，活动越来越频繁了。",
            "不过我们穆家有护族大阵，那些妖魔还不敢来招惹我们。",
            "倒是你们这些年轻人，给我老实点，别往山里乱跑，知道吗？",
            "真要是出了什么事，穆家可顾不上你们这些外人。"
          ],
          effects: {
            opinion: 2,
            giveInfo: "demon_warning_1"
          },
          condition: {
            minDay: 30
          },
          choices: [
            {
              text: "多谢家主提醒",
              next: "default"
            }
          ]
        }
      }
    }
  },
  mu_he: {
    id: "mu_he",
    name: "穆贺",
    title: "穆家执事",
    description: "穆卓云的弟弟，穆家的执事，表面上温文尔雅，实际上是黑教廷的卧底。",
    elements: [
      "dark",
      "ice"
    ],
    level: 12,
    maxHp: 600,
    maxMp: 350,
    attack: 45,
    defense: 25,
    speed: 16,
    skills: [
      "basic_attack",
      "dark_bolt",
      "ice_spike",
      "ice_shield"
    ],
    spriteColor: "#444466",
    isNPC: true,
    location: "mu_manor",
    personality: {
      brave: 0.6,
      kind: 0.4,
      honest: 0.2,
      impulsive: 0.3,
      loyal: 0.3,
      arrogant: 0.5,
      greedy: 0.7,
      curious: 0.6
    },
    relationshipCaps: {
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    dialogueRequirements: {
      minLevel: 4,
      minReputation: {
        mu_family: 5
      }
    },
    initialRelationships: {
      mu_zhuoyun: {
        opinion: 60,
        trust: 65,
        type: "friend",
        label: "哥哥"
      },
      mu_ningxue: {
        opinion: 30,
        trust: 20,
        type: "acquaintance",
        label: "侄女"
      },
      black_church_blue_deacon: {
        opinion: 80,
        trust: 85,
        type: "friend",
        label: "同谋"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "哦？你是来找谁的？",
            "年轻人，有什么事吗？",
            "我是穆家的执事穆贺，有什么可以帮你的？"
          ],
          mood: "polite",
          choices: [
            {
              text: "穆执事您好",
              next: "polite_greeting",
              condition: {
                minOpinion: 0
              }
            },
            {
              text: "我想了解一下穆家",
              next: "about_mu_family",
              condition: {
                minOpinion: 10
              }
            },
            {
              text: "听说最近山里不太平",
              next: "about_demons",
              condition: {
                minDay: 25,
                minOpinion: 15
              }
            },
            {
              text: "（试探）关于黑教廷...",
              next: "about_black_church",
              condition: {
                minDay: 35,
                minOpinion: 25,
                hasInfo: "black_church_intel"
              }
            },
            {
              text: "打扰了，告辞",
              next: null,
              action: "close"
            }
          ]
        },
        polite_greeting: {
          id: "polite_greeting",
          texts: [
            "嗯，还算懂礼貌。你是天澜魔法高中的学生吧？",
            "年轻人，好好修炼，将来会有出息的。",
            "穆家欢迎有天赋的年轻人。"
          ],
          effects: {
            opinion: 2,
            familiarity: 2
          },
          choices: [
            {
              text: "多谢穆执事夸奖",
              next: "default",
              action: "back"
            }
          ]
        },
        about_mu_family: {
          id: "about_mu_family",
          texts: [
            "穆家是博城的老牌家族，传承了几百年，以冰系魔法闻名。",
            "穆家在博城势力很大，不是什么人都能随便进来的。",
            "你问这些做什么？难道想加入穆家？"
          ],
          effects: {
            familiarity: 3
          },
          choices: [
            {
              text: "只是好奇问问",
              next: "default",
              action: "back"
            }
          ]
        },
        about_demons: {
          id: "about_demons",
          texts: [
            "山里的事...我也听说了一些。确实不太太平啊。",
            "这种事情，自然有猎魔者公会和魔法协会去管，我们这些人就别操心了。",
            "年轻人，管好自己就行了，别管那么多闲事。"
          ],
          effects: {
            opinion: -1
          },
          choices: [
            {
              text: "穆执事说得是",
              next: "default",
              action: "back"
            }
          ]
        },
        about_black_church: {
          id: "about_black_church",
          texts: [
            "黑教廷？那是什么东西？我没听说过。",
            "年轻人，不要听信那些谣言，什么黑教廷，都是骗人的。",
            "...你怎么知道这些的？你调查过我？"
          ],
          effects: {
            opinion: -5,
            giveInfo: "black_church_intel"
          },
          choices: [
            {
              text: "我只是随便问问",
              next: "default",
              action: "back"
            },
            {
              text: "穆执事，你是不是知道些什么？",
              next: "suspicious",
              condition: {
                minOpinion: -10
              }
            }
          ]
        },
        suspicious: {
          id: "suspicious",
          texts: [
            "哼，年轻人，有些事情，知道太多对你没好处。",
            "我劝你，最好把今天的话都忘掉，就当什么都没发生过。",
            "...不然的话，后果自负。"
          ],
          effects: {
            opinion: -10,
            giveInfo: "black_church_clue"
          },
          choices: [
            {
              text: "（赶紧离开）",
              next: null,
              action: "close"
            },
            {
              text: "你果然是黑教廷的人！",
              next: "reveal",
              condition: {
                minLevel: 8,
                hasInfo: "black_church_intel"
              }
            }
          ]
        },
        reveal: {
          id: "reveal",
          texts: [
            "...既然你都知道了，那我就不装了。",
            "没错，我就是黑教廷的人。可惜啊，你知道得太晚了。",
            "博城的灾难，很快就要开始了...而你，什么也阻止不了。"
          ],
          effects: {
            opinion: -30,
            giveInfo: "black_church_intel",
            setFlag: "mu_he_revealed"
          },
          choices: [
            {
              text: "我要阻止你们！",
              next: "fight",
              condition: {
                minLevel: 10
              }
            },
            {
              text: "（先撤退，从长计议）",
              next: null,
              action: "close"
            }
          ]
        },
        fight: {
          id: "fight",
          texts: [
            "阻止我们？就凭你？",
            "哼，不知天高地厚的小子，让我来教训教训你！",
            "记住，下辈子别这么多管闲事！"
          ],
          action: "battle",
          battleEnemy: "black_church_blue_deacon",
          choices: []
        }
      }
    }
  },
  hunter_receptionist: {
    id: "hunter_receptionist",
    name: "小雨",
    title: "猎魔者公会接待员",
    description: "猎魔者公会的接待员，负责登记任务和管理会员。性格温柔，做事认真。",
    elements: [
      "water"
    ],
    level: 5,
    maxHp: 100,
    maxMp: 100,
    attack: 8,
    defense: 8,
    speed: 10,
    skills: [
      "basic_attack",
      "water_heal"
    ],
    spriteColor: "#88ddff",
    isNPC: true,
    location: "city_street",
    personality: {
      brave: 0.5,
      kind: 0.9,
      honest: 0.9,
      impulsive: 0.2,
      loyal: 0.8,
      arrogant: 0.1,
      greedy: 0.2,
      curious: 0.7
    },
    relationshipCaps: {
      canRomance: true,
      canBeMentor: false,
      canBeRival: false
    },
    dialogueRequirements: {
      minLevel: 2
    },
    initialRelationships: {
      hunter_li: {
        opinion: 60,
        trust: 50,
        type: "friend",
        label: "前辈"
      },
      magic_association_chairman: {
        opinion: 40,
        trust: 35,
        type: "acquaintance",
        label: "会长"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "你好，欢迎来到猎魔者公会！",
            "请问有什么可以帮你的吗？",
            "是来接任务的，还是来买东西的？"
          ],
          mood: "friendly",
          choices: [
            {
              text: "我想看看公会商店",
              next: "shop",
              condition: {
                minReputation: {
                  hunter_guild: 0
                }
              }
            },
            {
              text: "有什么任务可以接吗？",
              next: "quests",
              condition: {
                minLevel: 3
              }
            },
            {
              text: "请问猎魔者公会是什么？",
              next: "about_guild",
              condition: {
                minOpinion: 0
              }
            },
            {
              text: "你叫什么名字？",
              next: "intro",
              condition: {
                minOpinion: 10
              }
            },
            {
              text: "打扰了，再见",
              next: null,
              action: "close"
            }
          ]
        },
        shop: {
          id: "shop",
          texts: [
            "好的，公会商店在这里，请随便看！",
            "我们这里有很多猎魔专用的装备和药水哦。",
            "会员还可以享受折扣呢！"
          ],
          action: "shop",
          shopId: "hunter_shop",
          choices: [
            {
              text: "谢谢",
              next: "default",
              action: "back"
            }
          ]
        },
        quests: {
          id: "quests",
          texts: [
            "最近的任务有很多哦，你想接哪一类的？",
            "猎魔任务的奖励都很丰厚，不过也很危险。",
            "一定要小心安全哦！"
          ],
          effects: {
            opinion: 2,
            familiarity: 2
          },
          choices: [
            {
              text: "我去找老李问问",
              next: "default",
              action: "back"
            }
          ]
        },
        about_guild: {
          id: "about_guild",
          texts: [
            "猎魔者公会是专门负责猎魔任务的组织哦。",
            "我们接受各种猎魔委托，从清除低级妖魔到调查异常事件都有。",
            "加入公会的话，接任务可以获得更多奖励，还能享受商店折扣呢！"
          ],
          effects: {
            familiarity: 3
          },
          choices: [
            {
              text: "原来如此",
              next: "default",
              action: "back"
            }
          ]
        },
        intro: {
          id: "intro",
          texts: [
            "我叫小雨，是公会的接待员。",
            "我在这里工作已经两年了，每天都能见到各种各样的猎人。",
            "你呢？你叫什么名字？是新来的猎人吗？"
          ],
          effects: {
            opinion: 3,
            familiarity: 5
          },
          choices: [
            {
              text: "我叫...（自我介绍）",
              next: "chat",
              condition: {
                minOpinion: 20
              }
            },
            {
              text: "我只是个普通学生",
              next: "default",
              action: "back"
            }
          ]
        },
        chat: {
          id: "chat",
          texts: [
            "很高兴认识你！",
            "以后常来公会玩哦，我给你打折！",
            "有什么不懂的都可以问我。"
          ],
          effects: {
            opinion: 5,
            familiarity: 5
          },
          choices: [
            {
              text: "好的，谢谢",
              next: "default",
              action: "back"
            }
          ]
        }
      }
    }
  },
  mu_butler: {
    id: "mu_butler",
    name: "福伯",
    title: "穆家管家",
    description: "穆家的老管家，在穆家工作了几十年，忠心耿耿，做事一丝不苟。",
    elements: [
      "ice"
    ],
    level: 10,
    maxHp: 300,
    maxMp: 200,
    attack: 25,
    defense: 20,
    speed: 10,
    skills: [
      "basic_attack",
      "ice_spike",
      "ice_shield"
    ],
    spriteColor: "#aaddff",
    isNPC: true,
    location: "mu_manor",
    personality: {
      brave: 0.6,
      kind: 0.7,
      honest: 0.95,
      impulsive: 0.1,
      loyal: 0.95,
      arrogant: 0.3,
      greedy: 0.1,
      curious: 0.4
    },
    relationshipCaps: {
      canRomance: false,
      canBeMentor: false,
      canBeRival: false
    },
    dialogueRequirements: {
      minLevel: 4,
      minReputation: {
        mu_family: 5
      }
    },
    initialRelationships: {
      mu_zhuoyun: {
        opinion: 90,
        trust: 95,
        type: "best_friend",
        label: "家主"
      },
      mu_he: {
        opinion: 60,
        trust: 50,
        type: "friend",
        label: "二老爷"
      },
      mu_ningxue: {
        opinion: 80,
        trust: 75,
        type: "close_friend",
        label: "大小姐"
      }
    },
    dialogueTree: {
      startNode: "default",
      nodes: {
        default: {
          id: "default",
          texts: [
            "这位客人，请问有什么事吗？",
            "我是穆家的管家福伯，有什么可以帮您的？",
            "穆家欢迎有身份的客人。"
          ],
          mood: "polite",
          choices: [
            {
              text: "我想看看穆家的宝库",
              next: "shop",
              condition: {
                minReputation: {
                  mu_family: 10
                }
              }
            },
            {
              text: "请问穆家主在吗？",
              next: "about_master",
              condition: {
                minOpinion: 10
              }
            },
            {
              text: "关于穆宁雪小姐...",
              next: "about_ningxue",
              condition: {
                minOpinion: 20
              }
            },
            {
              text: "听说最近山里不太平",
              next: "about_demons",
              condition: {
                minDay: 30,
                minOpinion: 15
              }
            },
            {
              text: "打扰了，告辞",
              next: null,
              action: "close"
            }
          ]
        },
        shop: {
          id: "shop",
          texts: [
            "好的，客人请随我来。",
            "穆家宝库收藏了不少好东西，客人请慢慢看。",
            "这些都是穆家多年的珍藏，品质有保证。"
          ],
          action: "shop",
          shopId: "mu_family_shop",
          choices: [
            {
              text: "多谢",
              next: "default",
              action: "back"
            }
          ]
        },
        about_master: {
          id: "about_master",
          texts: [
            "家主大人平时很忙，一般不见外客。",
            "如果您有什么事，可以先跟我说，我会转达给家主。",
            "家主大人是穆家的顶梁柱，很了不起的。"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "明白了",
              next: "default",
              action: "back"
            }
          ]
        },
        about_ningxue: {
          id: "about_ningxue",
          texts: [
            "宁雪小姐是穆家的天才，从小就很厉害。",
            "小姐性格比较冷淡，但人其实很好的。",
            "...您问这个做什么？"
          ],
          effects: {
            opinion: -1,
            familiarity: 3
          },
          choices: [
            {
              text: "只是好奇问问",
              next: "default",
              action: "back"
            }
          ]
        },
        about_demons: {
          id: "about_demons",
          texts: [
            "山里的事...我也听说了一些。",
            "穆家已经加强了防备，应该不会有问题的。",
            "客人也请多注意安全。"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "多谢关心",
              next: "default",
              action: "back"
            }
          ]
        }
      }
    }
  },
  ye_xinxia: {
    id: "ye_xinxia",
    name: "叶心夏",
    title: "温柔的邻家妹妹",
    description: "莫凡没有血缘关系的妹妹，寄养在姑姑莫青家。双腿残疾需要坐轮椅，但性格温柔乖巧、懂事体贴，是莫凡最重要的亲人。后文觉醒治愈系。",
    elements: [],
    level: 0,
    maxHp: 50,
    maxMp: 30,
    attack: 2,
    defense: 2,
    speed: 1,
    skills: ["basic_attack"],
    spriteColor: "#ffb6c1",
    image: "",
    location: "mo_fan_home",
    availableTimes: ["morning", "noon", "afternoon", "evening", "night"],
    dialogue: [
      { trigger: "default", text: "莫凡哥哥，你来了。今天修炼还顺利吗？" },
      { trigger: "low_stamina", text: "莫凡哥哥看起来很累了，要好好休息呀。" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.3,
      kind: 0.95,
      honest: 0.9,
      impulsive: 0.1,
      loyal: 0.9,
      arrogant: 0.0,
      greedy: 0.0,
      curious: 0.5
    },
    giftPreferences: {
      loved: ["magic_herb", "health_potion"],
      liked: ["mana_potion", "stamina_potion"],
      disliked: [],
      baseOpinionGain: 8,
      lovedMultiplier: 3,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 5
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: false,
      canBeRival: false
    },
    relationships: {
      mo_fan: { opinion: 95, trust: 98, type: "family", label: "哥哥" },
      mo_jiaxing: { opinion: 90, trust: 90, type: "family", label: "莫叔叔" },
      mo_qing: { opinion: 80, trust: 85, type: "family", label: "姑姑" }
    },
    dialogueTree: {
      npcId: "ye_xinxia",
      nodes: {
        default: {
          id: "default",
          texts: ["莫凡哥哥，你来了。", "今天修炼还顺利吗？要注意身体哦。"],
          choices: [
            { text: "心夏，最近有人欺负你吗？", next: "about_bullies" },
            { text: "姑姑身体还好吗？", next: "about_aunt" },
            { text: "我先走了，好好休息。", next: "default", action: "back" }
          ]
        },
        about_bullies: {
          id: "about_bullies",
          texts: ["没...没有的，莫凡哥哥不要担心。", "你已经帮我赶走那些坏人了，他们不敢再来了。"],
          effects: { opinion: 3, trust: 5 },
          choices: [{ text: "有事一定要告诉我。", next: "default", action: "back" }]
        },
        about_aunt: {
          id: "about_aunt",
          texts: ["姑姑身体还是老样子，在医院后勤部工作。", "她总是念叨让你好好学习，成为初阶魔法师就光宗耀祖了。"],
          effects: { familiarity: 3 },
          choices: [{ text: "我会努力的。", next: "default", action: "back" }]
        }
      }
    }
  },
  mu_he: {
    id: "mu_he",
    name: "穆贺",
    title: "天澜高中校董",
    description: "穆白的叔叔，天澜魔法高中校董，穆氏世家旁系成员。表面慷慨激昂，实则势利阴险，看不起平民，认为穷和无能世代相传。博城灾难的关键人物。",
    elements: [],
    level: 5,
    maxHp: 80,
    maxMp: 50,
    attack: 10,
    defense: 8,
    speed: 8,
    skills: ["basic_attack"],
    spriteColor: "#8b0000",
    image: "",
    location: "mu_family_estate",
    availableTimes: ["morning", "afternoon"],
    dialogue: [
      { trigger: "default", text: "你是哪个家族的子弟？有什么事吗？" },
      { trigger: "low_reputation", text: "平民子弟就该有平民的觉悟，不要浪费资源。" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4,
      kind: 0.1,
      honest: 0.2,
      impulsive: 0.3,
      loyal: 0.5,
      arrogant: 0.9,
      greedy: 0.7,
      curious: 0.3
    },
    giftPreferences: {
      loved: ["magic_stone", "demon_core"],
      liked: ["super_mana_potion", "full_potion"],
      disliked: ["magic_herb", "health_potion"],
      baseOpinionGain: 2,
      lovedMultiplier: 2,
      likedMultiplier: 1.2,
      dislikedMultiplier: 0.3,
      dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 60,
      maxTrust: 30,
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      mu_bai: { opinion: 80, trust: 70, type: "family", label: "侄子" },
      mu_ningxue: { opinion: 60, trust: 40, type: "family", label: "族中天才" },
      mo_jiaxing: { opinion: -20, trust: -10, type: "enemy", label: "杂役" },
      mo_fan: { opinion: -30, trust: -20, type: "enemy", label: "杂役之子" }
    },
    dialogueTree: {
      npcId: "mu_he",
      nodes: {
        default: {
          id: "default",
          texts: ["你是哪个家族的子弟？", "有事就说，我很忙。"],
          choices: [
            { text: "关于年度考核...", next: "about_exam" },
            { text: "穆宁雪学姐今天会来吗？", next: "about_ningxue" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_exam: {
          id: "about_exam",
          texts: ["年度考核是公正的，不合格的学生自然会被请离学校。", "学校资源有限，必须留给有天赋的学生。"],
          effects: { opinion: -2 },
          choices: [{ text: "我明白了。", next: "default", action: "back" }]
        },
        about_ningxue: {
          id: "about_ningxue",
          texts: ["宁雪是我们穆氏的骄傲，博城的旗帜。", "她今天会来观看年度考核，你们好好表现。"],
          effects: { familiarity: 2 },
          choices: [{ text: "多谢告知。", next: "default", action: "back" }]
        }
      }
    }
  },
  zhou_min: {
    id: "zhou_min",
    name: "周敏",
    title: "火系尖子生",
    description: "天澜高中学生，火系天赋很好的女孩，脸上带着英气。性格好强不服输，看不起不上进的人，崇拜强者。一开始看不起莫凡，后来态度可能转变。",
    elements: ["fire"],
    level: 2,
    maxHp: 70,
    maxMp: 60,
    attack: 12,
    defense: 5,
    speed: 10,
    skills: ["basic_attack", "fire_bolt"],
    spriteColor: "#ff6633",
    image: "",
    location: "tianlan_school",
    availableTimes: ["morning", "afternoon", "evening"],
    dialogue: [
      { trigger: "default", text: "你就是那个火系天赋很好却不用功的莫凡？真浪费。" },
      { trigger: "high_level", text: "没想到你居然...是我小看你了。" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.7,
      kind: 0.5,
      honest: 0.8,
      impulsive: 0.6,
      loyal: 0.7,
      arrogant: 0.5,
      greedy: 0.1,
      curious: 0.6
    },
    giftPreferences: {
      loved: ["fire_type_book", "super_mana_potion"],
      liked: ["mana_potion", "magic_stone"],
      disliked: [],
      baseOpinionGain: 4,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    relationshipCap: {
      maxOpinion: 80,
      maxTrust: 70,
      canRomance: true,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      tang_yue: { opinion: 90, trust: 85, type: "mentor", label: "崇拜的导师" },
      mo_fan: { opinion: -10, trust: 0, type: "rival", label: "看不起的同学" },
      mu_bai: { opinion: 30, trust: 20, type: "acquaintance", label: "同学" }
    },
    dialogueTree: {
      npcId: "zhou_min",
      nodes: {
        default: {
          id: "default",
          texts: ["你就是莫凡？", "明明火系天赋很好，却那么不用功，真浪费。"],
          choices: [
            { text: "唐月老师的课讲得真好。", next: "about_tangyue" },
            { text: "年度考核你准备得怎么样？", next: "about_exam" },
            { text: "我会证明给你看的。", next: "prove" }
          ]
        },
        about_tangyue: {
          id: "about_tangyue",
          texts: ["唐月老师真的很厉害，无论是气场还是准度。", "我妈妈也是导师，但根本做不到唐月老师那样。"],
          effects: { opinion: 2, familiarity: 3 },
          choices: [{ text: "确实很强。", next: "default", action: "back" }]
        },
        about_exam: {
          id: "about_exam",
          texts: ["我当然没问题，已经能释放火滋了。", "倒是你，再不努力就要被请离学校了。"],
          effects: { opinion: -1 },
          choices: [{ text: "走着瞧。", next: "default", action: "back" }]
        },
        prove: {
          id: "prove",
          texts: ["哼，光说没用。", "年度考核上见真章吧。"],
          effects: { opinion: 1 },
          choices: [{ text: "一定。", next: "default", action: "back" }]
        }
      }
    }
  },
  xu_zhaoting: {
    id: "xu_zhaoting",
    name: "许照庭",
    title: "七班雷系学神",
    description: "天澜高中七班学生，雷系天赋很高，被张建国老师炫耀为得意门生。修为与穆白齐平，是莫凡的潜在竞争对手。自信傲冷。",
    elements: ["thunder"],
    level: 2,
    maxHp: 75,
    maxMp: 55,
    attack: 14,
    defense: 5,
    speed: 11,
    skills: ["basic_attack", "thunder_bolt"],
    spriteColor: "#9933ff",
    image: "",
    location: "tianlan_school",
    availableTimes: ["morning", "afternoon"],
    dialogue: [
      { trigger: "default", text: "你是八班的？有什么事吗？" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.7,
      kind: 0.4,
      honest: 0.6,
      impulsive: 0.3,
      loyal: 0.6,
      arrogant: 0.7,
      greedy: 0.2,
      curious: 0.4
    },
    giftPreferences: {
      loved: ["thunder_type_book", "magic_stone"],
      liked: ["super_mana_potion", "mana_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    relationshipCap: {
      maxOpinion: 70,
      maxTrust: 50,
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      zhang_jianguo: { opinion: 80, trust: 70, type: "mentor", label: "班主任" },
      mu_bai: { opinion: 30, trust: 20, type: "rival", label: "竞争对手" }
    },
    dialogueTree: {
      npcId: "xu_zhaoting",
      nodes: {
        default: {
          id: "default",
          texts: ["你是八班的？", "找我有什么事？"],
          choices: [
            { text: "听说你雷系很强？", next: "about_thunder" },
            { text: "年度考核加油。", next: "default", action: "back" }
          ]
        },
        about_thunder: {
          id: "about_thunder",
          texts: ["雷系是初阶元素系之首，优势很大。", "不过修炼也很难，星子太活跃了。"],
          effects: { familiarity: 2 },
          choices: [{ text: "受教了。", next: "default", action: "back" }]
        }
      }
    }
  },
  mo_qing: {
    id: "mo_qing",
    name: "莫青",
    title: "莫凡的小姑",
    description: "莫凡的小姑，在医院后勤部工作。身瘦面黄，人很好，爱听八卦。知道很多医院里的奇闻异事，包括妖魔潜伏的消息。",
    elements: [],
    level: 0,
    maxHp: 40,
    maxMp: 20,
    attack: 2,
    defense: 2,
    speed: 3,
    skills: ["basic_attack"],
    spriteColor: "#cc9966",
    image: "",
    location: "mo_fan_home",
    availableTimes: ["evening", "night"],
    dialogue: [
      { trigger: "default", text: "莫凡来了啊，快吃饭。你爸又去山里送物资了，真让人担心。" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.3,
      kind: 0.8,
      honest: 0.7,
      impulsive: 0.2,
      loyal: 0.8,
      arrogant: 0.0,
      greedy: 0.1,
      curious: 0.9
    },
    giftPreferences: {
      loved: ["health_potion", "magic_herb"],
      liked: ["food_item"],
      disliked: [],
      baseOpinionGain: 6,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 90,
      canRomance: false,
      canBeMentor: false,
      canBeRival: false
    },
    relationships: {
      mo_fan: { opinion: 85, trust: 80, type: "family", label: "侄子" },
      mo_jiaxing: { opinion: 80, trust: 75, type: "family", label: "哥哥" },
      ye_xinxia: { opinion: 75, trust: 70, type: "family", label: "侄女" }
    },
    dialogueTree: {
      npcId: "mo_qing",
      nodes: {
        default: {
          id: "default",
          texts: ["莫凡来了啊，快吃饭。", "你爸又去山里送物资了，真让人担心。"],
          choices: [
            { text: "最近城里有什么新鲜事吗？", next: "about_gossip" },
            { text: "心夏还好吗？", next: "about_xinxia" },
            { text: "我先走了。", next: "default", action: "back" }
          ]
        },
        about_gossip: {
          id: "about_gossip",
          texts: ["你还别说，最近医院送来几个中邪的人。", "听说是邪眼沼妖干的，猎者联盟已经在查了。", "城外都发浅色警戒了，你可别乱跑。"],
          effects: { familiarity: 5 },
          choices: [{ text: "知道了，谢谢姑姑。", next: "default", action: "back" }]
        },
        about_xinxia: {
          id: "about_xinxia",
          texts: ["心夏这孩子乖巧，都快中午了也舍不得叫你起床。", "她总说要好好学习，帮家里分忧。"],
          effects: { opinion: 2 },
          choices: [{ text: "我会照顾好她的。", next: "default", action: "back" }]
        }
      }
    }
  },
  xu_bing: {
    id: "xu_bing",
    name: "徐兵",
    title: "青熊帮头目",
    description: "广池区地痞组织青熊帮的头目，脖子有青色纹身，穿短夹克。给附近富家少女做打手，看谁不顺眼就踩。曾骚扰叶心夏，被莫凡用雷印教训。",
    elements: [],
    level: 1,
    maxHp: 60,
    maxMp: 10,
    attack: 8,
    defense: 4,
    speed: 6,
    skills: ["basic_attack"],
    spriteColor: "#4a4a4a",
    image: "",
    location: "city_street",
    availableTimes: ["afternoon", "evening", "night"],
    dialogue: [
      { trigger: "default", text: "你谁啊？找我有事？" },
      { trigger: "after_defeat", text: "大...大哥，我再也不敢了，求您放过我！" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4,
      kind: 0.1,
      honest: 0.2,
      impulsive: 0.7,
      loyal: 0.3,
      arrogant: 0.6,
      greedy: 0.6,
      curious: 0.3
    },
    giftPreferences: {
      loved: [],
      liked: ["gold"],
      disliked: [],
      baseOpinionGain: 1,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.3,
      dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 40,
      maxTrust: 20,
      canRomance: false,
      canBeMentor: false,
      canBeRival: true
    },
    relationships: {
      ye_xinxia: { opinion: -10, trust: 0, type: "enemy", label: "骚扰对象" },
      mo_fan: { opinion: -50, trust: -30, type: "enemy", label: "被教训过" },
      zhao_kunsan: { opinion: 40, trust: 30, type: "acquaintance", label: "雇主" }
    },
    dialogueTree: {
      npcId: "xu_bing",
      nodes: {
        default: {
          id: "default",
          texts: ["你谁啊？", "找我有事？没事别挡道。"],
          choices: [
            { text: "听说你在这一片很罩得住？", next: "about_power" },
            { text: "离叶心夏远点。", next: "warn" }
          ]
        },
        about_power: {
          id: "about_power",
          texts: ["那是，广池区这一片谁不给我徐兵面子。", "怎么，想跟我混？"],
          effects: { opinion: 1 },
          choices: [{ text: "没兴趣。", next: "default", action: "back" }]
        },
        warn: {
          id: "warn",
          texts: ["你...你是那个魔法师？", "我知道了，我再也不敢了！"],
          effects: { opinion: -5 },
          choices: [{ text: "最好是这样。", next: "default", action: "back" }]
        }
      }
    }
  },
  mu_zhuoyun: {
    id: "mu_zhuoyun",
    name: "穆卓云",
    title: "穆氏族长",
    description: "穆氏世家族长，穆宁雪的父亲，冰系高阶魔法师。发鬓白色，中年英气十足，身材魁梧高大。跺跺脚能让整个博城震一震的人物，博城的土皇帝。势利但爱才，三年前打压过莫凡家，年度考核后想招纳莫凡被拒，暴怒时仅凭气息冻结整个操场。",
    avatar: "assets/images/characters/mu_zhuoyun.jpg",
    location: "mu_estate",
    element: "ice",
    level: 18,
    personality: ["威严", "势利", "爱才", "控制欲强"],
    baseStats: { hp: 800, mp: 500, attack: 120, defense: 80, speed: 60 },
    skills: ["ice_shield", "ice_storm"],
    faction: "mu_family",
    factionRank: "族长",
    relationships: {
      mu_ningxue: { opinion: 100, trust: 90, type: "family", label: "女儿" },
      mu_he: { opinion: 70, trust: 60, type: "family", label: "兄弟" },
      mu_bai: { opinion: 60, trust: 50, type: "family", label: "旁系侄子" },
      mu_jiangming: { opinion: 90, trust: 85, type: "family", label: "长子" },
      mo_fan: { opinion: -30, trust: -20, type: "enemy", label: "拒绝招纳" },
      deng_kai: { opinion: 60, trust: 50, type: "acquaintance", label: "平辈" }
    },
    giftPreferences: {
      loved: ["ice_crystal", "demon_core"],
      liked: ["magic_stone", "super_mana_potion"],
      disliked: ["fire_essence"],
      baseOpinionGain: 2,
      lovedMultiplier: 3,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.3,
      dailyGiftLimit: 1
    },
    dialogueTree: {
      npcId: "mu_zhuoyun",
      nodes: {
        default: {
          id: "default",
          texts: ["你是何人？找我穆氏世家有何事？", "这里是穆家庄园，不是什么人都能进来的。"],
          choices: [
            { text: "久仰穆族长大名。", next: "about_family", condition: { minOpinion: 0 } },
            { text: "我想了解穆氏世家。", next: "about_mu" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_family: {
          id: "about_family",
          texts: ["哼，算你有眼光。我穆氏世家传承百年，冰系一脉在博城无人能及。", "宁雪是我的骄傲，15岁便入了帝都苍明学府。"],
          effects: { opinion: 2 },
          choices: [{ text: "穆小姐确实是天才。", next: "default", action: "back" }]
        },
        about_mu: {
          id: "about_mu",
          texts: ["穆氏世家，贵族上百人，佣人上千，以前这整个城区都是我们穆家的。", "年轻一辈要靠家族贡献和修炼成绩获得资源，不是什么阿猫阿狗都能进核心的。"],
          choices: [{ text: "受教了。", next: "default", action: "back" }]
        }
      }
    }
  },
  deng_kai: {
    id: "deng_kai",
    name: "邓铠",
    title: "猎者联盟高层 / 校董",
    description: "猎者联盟中的高层，同时也是天澜魔法高中的校董，算是所有校董之中修为最高、实力最强的人。正义感强，在穆卓云暴怒时站出来挡在学生面前，保护没有防御能力的学生。为人稳重，说话有分量。",
    avatar: "assets/images/characters/deng_kai.jpg",
    location: "hunter_guild",
    element: "neutral",
    level: 16,
    personality: ["正义", "稳重", "有实力", "护短"],
    baseStats: { hp: 700, mp: 400, attack: 100, defense: 90, speed: 70 },
    skills: ["basic_attack"],
    faction: "hunter_alliance",
    factionRank: "高层",
    relationships: {
      mu_zhuoyun: { opinion: 60, trust: 50, type: "acquaintance", label: "平辈" },
      tang_yue: { opinion: 70, trust: 65, type: "colleague", label: "同事" },
      hunter_li: { opinion: 80, trust: 75, type: "colleague", label: "下属" }
    },
    giftPreferences: {
      loved: ["demon_core", "hunter_medal"],
      liked: ["magic_stone", "stamina_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "deng_kai",
      nodes: {
        default: {
          id: "default",
          texts: ["年轻人，找我有什么事？", "猎者联盟的事，或者学校的事，都可以说。"],
          choices: [
            { text: "我想加入猎者联盟。", next: "about_hunter" },
            { text: "您认识穆卓云族长吗？", next: "about_mu" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_hunter: {
          id: "about_hunter",
          texts: ["想加入猎者联盟？好志气！", "不过猎魔不是儿戏，城市之外的妖魔可不是学校里的实践课。", "先提升实力，多猎杀几只奴仆级妖魔，再来找我。"],
          effects: { opinion: 3, faction: { hunter_alliance: 5 } },
          choices: [{ text: "我会努力的！", next: "default", action: "back" }]
        },
        about_mu: {
          id: "about_mu",
          texts: ["卓云啊，老相识了。实力确实强，冰系高阶在博城没几个对手。", "就是脾气大了点，有时候控制不住情绪。上次在学校差点出事，还是我挡下来的。", "年轻人，在博城混，最好不要得罪穆氏世家。"],
          choices: [{ text: "多谢提醒。", next: "default", action: "back" }]
        }
      }
    }
  },
  yu_ang: {
    id: "yu_ang",
    name: "宇昂",
    title: "穆氏修炼疯子",
    description: "穆卓云的养子，对穆卓云唯命是从，让他杀人都不犹豫的修炼疯子。常年有星尘魔器温养，修为远超同龄学生。18岁时将与莫凡进行魔法决斗。",
    avatar: "assets/images/characters/yu_ang.jpg",
    location: "mu_estate",
    element: "ice",
    level: 10,
    personality: ["冷酷", "偏执", "唯命是从", "修炼狂"],
    baseStats: { hp: 400, mp: 250, attack: 60, defense: 35, speed: 25 },
    skills: ["basic_attack", "ice_spike", "ice_shield"],
    faction: "mu_family",
    factionRank: "养子",
    relationships: {
      mu_zhuoyun: { opinion: 100, trust: 100, type: "family", label: "养父" },
      mu_he: { opinion: 70, trust: 60, type: "acquaintance", label: "长辈" },
      mu_bai: { opinion: 50, trust: 40, type: "acquaintance", label: "族弟" },
      mo_fan: { opinion: -50, trust: -30, type: "rival", label: "决斗对手" }
    },
    giftPreferences: {
      loved: ["ice_crystal", "demon_core"],
      liked: ["magic_stone", "super_mana_potion"],
      disliked: [],
      baseOpinionGain: 1,
      lovedMultiplier: 2,
      likedMultiplier: 1.2,
      dislikedMultiplier: 0.3,
      dailyGiftLimit: 1
    },
    dialogueTree: {
      npcId: "yu_ang",
      nodes: {
        default: {
          id: "default",
          texts: ["……", "有事？"],
          choices: [
            { text: "你就是宇昂？", next: "about_self", condition: { minOpinion: -100 } },
            { text: "18岁的决斗，我等着。", next: "about_duel", condition: { minOpinion: -100 } },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_self: {
          id: "about_self",
          texts: ["是又如何。", "穆家收养我，给我资源，我替穆家做事。"],
          effects: { familiarity: 2 },
          choices: [{ text: "原来如此。", next: "default", action: "back" }]
        },
        about_duel: {
          id: "about_duel",
          texts: ["哼，嘴硬。", "到时候，我会让你知道，世家培养的弟子和平民的差距。"],
          effects: { opinion: -5 },
          choices: [{ text: "拭目以待。", next: "default", action: "back" }]
        }
      }
    }
  },
  zhan_kong: {
    id: "zhan_kong",
    name: "斩空",
    title: "雪峰山驿站总教官",
    description: "雪峰山驿站总教官，胡渣大叔，火系强者，驿站屠妖魔数最高的人。性格散漫又严厉，军法师出身，与妖魔厮杀后的气息让学生不敢造次。天澜高中历练的总教官，给出了'完成悬赏否则全部不合格'的不可能任务。",
    avatar: "assets/images/characters/zhan_kong.jpg",
    location: "xuefeng_station",
    element: "fire",
    level: 15,
    personality: ["严厉", "散漫", "实战派", "护短", "毒舌"],
    baseStats: { hp: 600, mp: 350, attack: 90, defense: 60, speed: 50 },
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst"],
    faction: "military",
    factionRank: "总教官",
    relationships: {
      deng_kai: { opinion: 70, trust: 65, type: "friend", label: "老友" },
      luo_yunbo: { opinion: 80, trust: 75, type: "subordinate", label: "下属" },
      pan_lijun: { opinion: 75, trust: 70, type: "subordinate", label: "下属" }
    },
    giftPreferences: {
      loved: ["demon_core", "fire_essence"],
      liked: ["magic_stone", "full_potion", "stamina_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "zhan_kong",
      nodes: {
        default: {
          id: "default",
          texts: ["哦？学生？", "有事就说，我忙着呢。"],
          choices: [
            { text: "教官，关于历练任务...", next: "about_training" },
            { text: "您杀过多少妖魔？", next: "about_demon" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_training: {
          id: "about_training",
          texts: ["历练？哼，你们这群温室里的花朵。", "完成悬赏就全部A，完不成就全部不合格。", "别觉得我苛刻，野外的妖魔可不会跟你讲道理。"],
          effects: { familiarity: 3 },
          choices: [{ text: "我们会完成的。", next: "default", action: "back" }]
        },
        about_demon: {
          id: "about_demon",
          texts: ["多少？记不清了。", "奴仆级的蝼蚁不算数，战将级的倒是有几十只。", "年轻人，想杀妖魔，先活下来再说。"],
          effects: { opinion: 2 },
          choices: [{ text: "受教了。", next: "default", action: "back" }]
        }
      }
    }
  },
  luo_yunbo: {
    id: "luo_yunbo",
    name: "罗云波",
    title: "猎者小队队长",
    description: "三组猎者小队队长，皮肤黝黑英俊，雪峰山驿站的带队教官之一。经验丰富，负责带领学生在野外历练。",
    avatar: "assets/images/characters/luo_yunbo.jpg",
    location: "xuefeng_station",
    element: "earth",
    level: 9,
    personality: ["稳重", "经验丰富", "负责", "黝黑英俊"],
    baseStats: { hp: 350, mp: 200, attack: 45, defense: 40, speed: 20 },
    skills: ["basic_attack", "earth_shield", "earth_spike"],
    faction: "hunter_alliance",
    factionRank: "小队长",
    relationships: {
      zhan_kong: { opinion: 85, trust: 80, type: "superior", label: "上司" },
      pan_lijun: { opinion: 70, trust: 65, type: "colleague", label: "同事" }
    },
    giftPreferences: {
      loved: ["earth_crystal", "demon_core"],
      liked: ["magic_stone", "health_potion"],
      disliked: [],
      baseOpinionGain: 4,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "luo_yunbo",
      nodes: {
        default: {
          id: "default",
          texts: ["你好，我是罗云波，三组猎者小队队长。", "有什么事吗？"],
          choices: [
            { text: "野外历练需要注意什么？", next: "about_field" },
            { text: "雪峰山有哪些妖魔？", next: "about_demon" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_field: {
          id: "about_field",
          texts: ["野外最重要的是冷静。", "遇到打不过的妖魔，跑！活着比什么都重要。", "跟紧队伍，不要单独行动。"],
          effects: { familiarity: 3, opinion: 2 },
          choices: [{ text: "记住了。", next: "default", action: "back" }]
        },
        about_demon: {
          id: "about_demon",
          texts: ["雪峰山一带常见的有独眼魔狼、暗影怪。", "深处还有更危险的，不要乱跑。", "驿站是安全区，出了驿站就要小心。"],
          effects: { familiarity: 2 },
          choices: [{ text: "多谢提醒。", next: "default", action: "back" }]
        }
      }
    }
  },
  pan_lijun: {
    id: "pan_lijun",
    name: "潘丽君",
    title: "女副教官",
    description: "雪峰山驿站的女副教官，皮肤黝黑精悍，性格干练。崇拜斩空总教官，对学生要求严格。",
    avatar: "assets/images/characters/pan_lijun.jpg",
    location: "xuefeng_station",
    element: "wind",
    level: 8,
    personality: ["干练", "严格", "精悍", "崇拜强者"],
    baseStats: { hp: 280, mp: 180, attack: 38, defense: 25, speed: 35 },
    skills: ["basic_attack", "wind_blade", "wind_speed"],
    faction: "hunter_alliance",
    factionRank: "副教官",
    relationships: {
      zhan_kong: { opinion: 90, trust: 80, type: "idol", label: "崇拜的总教官" },
      luo_yunbo: { opinion: 65, trust: 60, type: "colleague", label: "同事" }
    },
    giftPreferences: {
      loved: ["wind_crystal", "demon_core"],
      liked: ["magic_stone", "stamina_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "pan_lijun",
      nodes: {
        default: {
          id: "default",
          texts: ["我是潘丽君，副教官。", "历练期间，听从指挥，不要自作主张。"],
          choices: [
            { text: "教官好。", next: "about_greeting" },
            { text: "斩空教官很厉害吗？", next: "about_zhankong" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_greeting: {
          id: "about_greeting",
          texts: ["嗯。", "好好表现，历练成绩占高考20%。"],
          effects: { familiarity: 2 },
          choices: [{ text: "我会努力的。", next: "default", action: "back" }]
        },
        about_zhankong: {
          id: "about_zhankong",
          texts: ["斩空总教官当然厉害！", "驿站屠妖魔数最高，军法师出身。", "能跟着他历练是你们的运气。"],
          effects: { opinion: 3, familiarity: 2 },
          choices: [{ text: "确实令人敬佩。", next: "default", action: "back" }]
        }
      }
    }
  },
  wang_sanpang: {
    id: "wang_sanpang",
    name: "王三胖",
    title: "天澜高中学生",
    description: "天澜魔法高中尖子班学生，体型偏胖，口无遮拦，经常说一些不合时宜的话。历练时质疑教官实力，被潘丽君冷笑回应。",
    avatar: "",
    location: "tianlan_school",
    element: "water",
    level: 2,
    personality: ["口无遮拦", "胆小", "爱抱怨", "体型偏胖"],
    baseStats: { hp: 80, mp: 55, attack: 8, defense: 8, speed: 6 },
    skills: ["basic_attack", "water_heal"],
    relationships: {},
    giftPreferences: {
      loved: ["full_potion", "stamina_potion"],
      liked: ["health_potion", "mana_potion"],
      disliked: [],
      baseOpinionGain: 5,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "wang_sanpang",
      nodes: {
        default: {
          id: "default",
          texts: ["嘿，你也是尖子班的？", "听说历练要去雪峰山，那边有妖魔啊，怕不怕？"],
          choices: [
            { text: "不怕，正好历练。", next: "brave" },
            { text: "有点担心...", next: "scared" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        brave: {
          id: "brave",
          texts: ["厉害厉害！", "到时候跟着你混了啊！"],
          effects: { opinion: 5 },
          choices: [{ text: "好说。", next: "default", action: "back" }]
        },
        scared: {
          id: "scared",
          texts: ["我也怕啊...", "要不咱们跟教官说别去了？"],
          effects: { opinion: 2 },
          choices: [{ text: "还是去吧。", next: "default", action: "back" }]
        }
      }
    }
  },
  er_tuzi: {
    id: "er_tuzi",
    name: "二秃子",
    title: "驿站小贩",
    description: "雪峰山驿站的小贩，光头，在主道摆摊卖魔法师战斗修炼用品。专卖履魔具，用奔妖后肢皮制作，附魔风轨法纹，风石提供能量。",
    avatar: "",
    location: "xuefeng_station",
    element: "neutral",
    level: 3,
    personality: ["精明", "能说会道", "生意人", "光头"],
    baseStats: { hp: 60, mp: 30, attack: 5, defense: 5, speed: 8 },
    skills: ["basic_attack"],
    relationships: {},
    giftPreferences: {
      loved: ["magic_stone", "demon_core"],
      liked: ["mana_potion", "health_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 5
    },
    dialogueTree: {
      npcId: "er_tuzi",
      nodes: {
        default: {
          id: "default",
          texts: ["客官，看看我的货！", "履魔具，奔妖皮做的，穿上跑得比独眼魔狼还快！"],
          choices: [
            { text: "履魔具多少钱？", next: "about_shoes" },
            { text: "还有别的吗？", next: "about_other" },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_shoes: {
          id: "about_shoes",
          texts: ["不贵不贵，只要500金币！", "野外遇到打不过的妖魔，穿上这个就能跑。", "保命的东西，值！"],
          effects: { familiarity: 2 },
          choices: [{ text: "我考虑考虑。", next: "default", action: "back" }]
        },
        about_other: {
          id: "about_other",
          texts: ["还有魔石，各种元素的都有。", "可以镶嵌在魔器魔具上提供能量。", "要看看吗？"],
          effects: { familiarity: 2 },
          choices: [{ text: "下次吧。", next: "default", action: "back" }]
        }
      }
    }
  }
};
