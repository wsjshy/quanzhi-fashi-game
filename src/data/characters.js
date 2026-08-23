/**
 * NPC/角色数据
 * 从 game-data.js 拆分而来
 */

export const DataCharacters = {
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
    elementLevels: {
      thunder: 3,
      fire: 3
    },
    talents: [
      {
        name: "天生双系",
        type: "innate",
        element: "special",
        description: "觉醒时同时觉醒雷系与火系。天生双系极为罕见，比千分之一的雷霆系觉醒概率还小上万倍，起步就比别人高一个阶梯。"
      }
    ],
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
              id: "tease_mofan",
              text: "（嘲笑）双系天赋？听起来也没多厉害嘛",
              condition: {
                notMemoryTags: ["player_teased", "player_encouraged", "player_asked_magic"]
              },
              effects: {
                opinion: -3,
                addMemory: {
                  type: "player_attitude",
                  content: "玩家嘲笑了我的双系天赋",
                  shortDescription: "被嘲笑",
                  importance: 0.7,
                  tags: ["player_teased", "player_hostile"]
                }
              },
              nextNode: "teased_response"
            },
            {
              id: "encourage_mofan",
              text: "（鼓励）双系天赋很厉害，继续加油",
              condition: {
                notMemoryTags: ["player_teased", "player_encouraged", "player_asked_magic"]
              },
              effects: {
                opinion: 3,
                addMemory: {
                  type: "player_attitude",
                  content: "玩家鼓励了我，说双系天赋很厉害",
                  shortDescription: "被鼓励",
                  importance: 0.6,
                  tags: ["player_encouraged", "player_friendly"]
                }
              },
              nextNode: "encouraged_response"
            },
            {
              id: "ask_magic_understanding",
              text: "（请教）你对双系魔法有什么理解？",
              condition: {
                notMemoryTags: ["player_teased", "player_encouraged", "player_asked_magic"]
              },
              effects: {
                opinion: 2,
                exp: 10,
                addMemory: {
                  type: "player_attitude",
                  content: "玩家认真请教了我对双系魔法的理解",
                  shortDescription: "被请教",
                  importance: 0.6,
                  tags: ["player_asked_magic", "player_respectful"]
                }
              },
              nextNode: "magic_understanding_response"
            },
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
              id: "ask_family",
              text: "你家里人呢？",
              condition: {
                minOpinion: 25,
                notNpcFlags: ["asked_about_family"]
              },
              effects: {
                opinion: 1,
                npcFlags: { asked_about_family: true }
              },
              nextNode: "about_family"
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
              id: "ask_motivation",
              text: "你为什么这么拼命修炼？",
              condition: { minOpinion: 10, notMemoryTags: ["player_asked_motivation"] },
              effects: {
                opinion: 2,
                addMemory: { type: "conversation", content: "玩家问我为什么拼命修炼", importance: 0.5, tags: ["player_asked_motivation"] }
              },
              nextNode: "about_motivation"
            },
            {
              id: "ask_what_is_strong",
              text: "你觉得什么样的法师才算强？",
              condition: { minOpinion: 15, notMemoryTags: ["player_asked_strong"] },
              effects: {
                opinion: 3,
                addMemory: { type: "conversation", content: "玩家问我什么是强", importance: 0.5, tags: ["player_asked_strong"] }
              },
              nextNode: "about_strong"
            },
            {
              id: "share_confusion",
              text: "我最近修炼有点迷茫...",
              condition: { minOpinion: 20, notMemoryTags: ["player_shared_confusion"] },
              effects: {
                opinion: 3,
                trust: 2,
                addMemory: { type: "conversation", content: "玩家向我倾诉修炼迷茫", importance: 0.5, tags: ["player_shared_confusion"] }
              },
              nextNode: "confusion_response"
            },
            {
              id: "ask_dream",
              text: "你以后想做什么？",
              condition: { minOpinion: 30, notMemoryTags: ["player_asked_mofan_dream"] },
              effects: {
                opinion: 4,
                trust: 3,
                addMemory: { type: "conversation", content: "玩家问我以后想做什么", importance: 0.6, tags: ["player_asked_mofan_dream"] }
              },
              nextNode: "about_mofan_dream"
            },
            {
              id: "train_together",
              text: "一起去修炼吗？",
              condition: { minOpinion: 25, notNpcFlags: ["trained_together"] },
              effects: {
                opinion: 3,
                exp: 20,
                npcFlags: { trained_together: true },
                addMemory: { type: "event", content: "和玩家一起修炼过", importance: 0.4, tags: ["trained_together"] }
              },
              nextNode: "train_together_response"
            },
            {
              id: "mofan_deep_recall",
              text: "（莫凡看到你，像是看到了可以交心的兄弟...）",
              condition: { anyMemoryTags: ["player_asked_motivation", "player_asked_mofan_dream", "player_shared_confusion"], minOpinion: 30 },
              effects: {},
              nextNode: "mofan_deep_recall_node"
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
              id: "mingzhu_exam",
              text: "主校区考核的事……",
              condition: {
                minOpinion: 10,
                notFlags: ["quest_mingzhu_exam_notice_started"]
              },
              effects: {
                startQuest: "quest_mingzhu_exam_notice",
                flags: { quest_mingzhu_exam_notice_started: true }
              },
              nextNode: "mingzhu_exam_intro"
            },
            {
              id: "recall_teased",
              text: "（莫凡似乎还记着你之前嘲笑他的事...）",
              condition: {
                memoryTags: ["player_teased"]
              },
              effects: {},
              nextNode: "recall_teased_node"
            },
            {
              id: "recall_encouraged",
              text: "（莫凡看到你，露出了一个友善的笑容...）",
              condition: {
                memoryTags: ["player_encouraged"]
              },
              effects: {},
              nextNode: "recall_encouraged_node"
            },
            {
              id: "recall_asked",
              text: "（莫凡看到你，像是遇到了可以讨论魔法的同好...）",
              condition: {
                memoryTags: ["player_asked_magic"]
              },
              effects: {},
              nextNode: "recall_asked_node"
            },
            {
              id: "leave",
              text: "没什么事，先走了",
              effects: {},
              nextNode: null
            }
          ]
        },
        teased_response: {
          id: "teased_response",
          texts: [
            "莫凡眉头一挑：'呵，双系天赋没多厉害？要不你试试同时驾驭两种元素？'他的语气带着几分不爽。",
            "'你可以不相信，但别小看我。'莫凡冷冷地说，'总有一天你会知道双系意味着什么。'"
          ],
          mood: "annoyed",
          choices: [
            { id: "back", text: "（有点过分了...）", effects: { opinion: 1 }, nextNode: "default" }
          ]
        },
        encouraged_response: {
          id: "encouraged_response",
          texts: [
            "莫凡愣了一下，随即笑了：'谢了！说实话，很少有人这么说。大部分人都觉得双系是负担。'",
            "'你这家伙，挺有眼光的嘛！'莫凡拍了拍你的肩膀，'放心，我不会让你失望的。'"
          ],
          mood: "happy",
          choices: [
            { id: "back", text: "加油", effects: {}, nextNode: "default" }
          ]
        },
        magic_understanding_response: {
          id: "magic_understanding_response",
          texts: [
            "莫凡认真地想了想：'双系的关键不是同时用两种魔法，而是在合适的时机切换。雷系主攻，火系辅控，节奏很重要。'",
            "'其实我也还在摸索。'莫凡难得地谦虚，'不过你愿意问，说明你是真的在思考魔法。这个态度不错。'"
          ],
          mood: "thoughtful",
          choices: [
            { id: "back", text: "受教了", effects: { exp: 5 }, nextNode: "default" }
          ]
        },
        recall_teased_node: {
          id: "recall_teased_node",
          texts: [
            "莫凡看到你，嘴角微微下拉：'又是你啊。怎么，又来嘲笑我的双系天赋？'",
            "'别以为我忘了你说的话。'莫凡抱着胳膊，'总有一天我会让你刮目相看。'"
          ],
          mood: "annoyed",
          choices: [
            { id: "apologize", text: "（道歉）上次是我不对", effects: { opinion: 3 }, nextNode: "default" },
            { id: "back", text: "（不说话）", effects: {}, nextNode: "default" }
          ]
        },
        recall_encouraged_node: {
          id: "recall_encouraged_node",
          texts: [
            "莫凡看到你，笑了：'嘿！上次你说的话我记着呢，谢了啊。'",
            "'是你啊！'莫凡热情地打招呼，'你说双系天赋厉害，我最近修炼更有动力了！'"
          ],
          mood: "happy",
          choices: [
            { id: "chat", text: "最近修炼怎么样？", effects: { opinion: 1 }, nextNode: "default" },
            { id: "back", text: "加油", effects: {}, nextNode: "default" }
          ]
        },
        recall_asked_node: {
          id: "recall_asked_node",
          texts: [
            "莫凡看到你，眼睛一亮：'你上次问的双系魔法，我最近有了新的理解！要不要聊聊？'",
            "'是你啊，上次那个问题问得好。'莫凡认真地说，'我后来想了很久，确实有启发。'"
          ],
          mood: "thoughtful",
          choices: [
            { id: "discuss", text: "好，聊聊", effects: { opinion: 2, exp: 10 }, nextNode: "default" },
            { id: "back", text: "下次吧", effects: {}, nextNode: "default" }
          ]
        },
        about_motivation: {
          id: "about_motivation",
          texts: [
            "莫凡的表情认真了几分。",
            "为什么拼命？",
            "（他握紧了拳头。）",
            "因为我有要保护的人。",
            "（他的语气很平静，但眼神很坚定。）",
            "心夏身体不好，我得变强，才能让她过上好日子。"
          ],
          mood: "serious",
          choices: [
            { id: "respect", text: "你是个好哥哥", effects: { opinion: 4, trust: 3 }, nextNode: "motivation_respect" },
            { id: "relate", text: "我也有要保护的人", effects: { opinion: 3, trust: 2 }, nextNode: "default" },
            { id: "ask_xinxia", text: "心夏是谁？", condition: { minOpinion: 20 }, effects: { opinion: 2 }, nextNode: "about_xinxia" }
          ]
        },
        motivation_respect: {
          id: "motivation_respect",
          texts: [
            "莫凡挠了挠头，有些不好意思。",
            "嘿嘿，也没那么好啦。",
            "（他笑了笑，但眼神里的认真没有消失。）",
            "总之，变强就对了！"
          ],
          mood: "casual",
          choices: [
            { id: "back", text: "一起加油", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        about_xinxia: {
          id: "about_xinxia",
          texts: [
            "莫凡的表情柔和了下来。",
            "心夏是我妹妹。",
            "（他的声音放轻了。）",
            "她腿不好，从小就坐轮椅。但她很坚强，比我坚强多了。",
            "（他顿了顿。）",
            "她在博城的福利院，我每周都去看她。"
          ],
          mood: "gentle",
          effects: { npcFlags: { knows_xinxia: true } },
          choices: [
            { id: "kind", text: "她一定很幸福，有你这样的哥哥", effects: { opinion: 5, trust: 4 }, nextNode: "default" },
            { id: "visit", text: "有机会我也想去看看她", condition: { minOpinion: 35 }, effects: { opinion: 5, trust: 5, npcFlags: { wants_to_visit_xinxia: true } }, nextNode: "default" }
          ]
        },
        about_strong: {
          id: "about_strong",
          texts: [
            "莫凡想了想。",
            "什么是强？",
            "（他的眼神变得锐利。）",
            "不是等级高，不是技能多。",
            "是在该站出来的时候，能站出来。",
            "（他握紧拳头。）",
            "是能保护自己想保护的人，这才是真的强。"
          ],
          mood: "serious",
          choices: [
            { id: "agree", text: "我也是这么想的", effects: { opinion: 4, trust: 3 }, nextNode: "strong_agree" },
            { id: "question", text: "但有时候实力不够，站出来也没用", effects: { opinion: 1 }, nextNode: "strong_question" }
          ]
        },
        strong_agree: {
          id: "strong_agree",
          texts: [
            "莫凡拍了拍你的肩膀。",
            "好！我就知道你和我是一类人！",
            "（他笑得很爽朗。）",
            "走，一起修炼去！"
          ],
          mood: "happy",
          effects: { exp: 15 },
          choices: [
            { id: "go", text: "走！", effects: { opinion: 3 }, nextNode: "default" }
          ]
        },
        strong_question: {
          id: "strong_question",
          texts: [
            "莫凡摇了摇头。",
            "实力不够就去练啊！",
            "（他的语气很认真。）",
            "站出来可能没用，但不站出来一定没用。",
            "我莫凡，从来不会在该站出来的时候躲着。"
          ],
          mood: "determined",
          choices: [
            { id: "inspired", text: "受教了", effects: { opinion: 2, exp: 10 }, nextNode: "default" }
          ]
        },
        confusion_response: {
          id: "confusion_response",
          texts: [
            "莫凡看着你，表情有些意外。",
            "迷茫？",
            "（他挠了挠头。）",
            "说实话，我也经常迷茫。",
            "（他坐下来，语气变得认真。）",
            "但我发现，迷茫的时候就去修炼。练着练着，答案就出来了。",
            "想太多没用，动手才是真的。"
          ],
          mood: "thoughtful",
          choices: [
            { id: "thanks", text: "谢谢你，我试试", effects: { opinion: 3, trust: 2, exp: 15 }, nextNode: "default" },
            { id: "deeper", text: "你迷茫的时候都在想什么？", condition: { minOpinion: 30 }, effects: { opinion: 2, trust: 3 }, nextNode: "confusion_deeper" }
          ]
        },
        confusion_deeper: {
          id: "confusion_deeper",
          texts: [
            "莫凡沉默了一会儿。",
            "想什么？",
            "（他苦笑了一下。）",
            "想自己是不是太弱了，想能不能保护好心夏，想明天的修炼有没有用。",
            "（他抬起头，看着天空。）",
            "但想完了，还是得继续练。因为不练，就真的什么都改变不了。"
          ],
          mood: "thoughtful",
          effects: { trust: 3 },
          choices: [
            { id: "understand", text: "我懂了", effects: { opinion: 3, trust: 2 }, nextNode: "default" }
          ]
        },
        about_mofan_dream: {
          id: "about_mofan_dream",
          texts: [
            "莫凡的眼睛亮了起来。",
            "以后想做什么？",
            "（他站起来，伸了个懒腰。）",
            "我要成为世界上最强的法师！",
            "（他的语气充满自信，但不是狂妄。）",
            "然后让心夏过上最好的日子，让所有看不起我的人都刮目相看！",
            "（他看向你。）",
            "你呢？你以后想做什么？"
          ],
          mood: "determined",
          choices: [
            { id: "share_dream", text: "我也想变强，保护重要的人", effects: { opinion: 5, trust: 4 }, nextNode: "dream_share" },
            { id: "not_sure", text: "我还没想好", effects: { opinion: 2 }, nextNode: "dream_not_sure" },
            { id: "different", text: "我想走和你不一样的路", condition: { minOpinion: 40 }, effects: { opinion: 3, trust: 2 }, nextNode: "dream_different" }
          ]
        },
        dream_share: {
          id: "dream_share",
          texts: [
            "莫凡用力点了点头。",
            "好！那我们就一起变强！",
            "（他伸出拳头。）",
            "到时候，看谁先成为最强！"
          ],
          mood: "happy",
          effects: { npcFlags: { shared_dream: true }, exp: 20 },
          choices: [
            { id: "compete", text: "一言为定！", effects: { opinion: 4, trust: 3 }, nextNode: "default" }
          ]
        },
        dream_not_sure: {
          id: "dream_not_sure",
          texts: [
            "莫凡拍了拍你的肩膀。",
            "没想好也正常。",
            "（他笑了笑。）",
            "我也是走着走着才知道自己要什么的。",
            "先变强吧，变强了，选择自然就多了。"
          ],
          mood: "casual",
          choices: [
            { id: "back", text: "说得对", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        dream_different: {
          id: "dream_different",
          texts: [
            "莫凡愣了一下，然后笑了。",
            "不一样的路？",
            "（他的眼神里有欣赏。）",
            "有意思。我就喜欢有自己想法的人。",
            "（他伸出手。）",
            "不管走什么路，变强了就是好样的。"
          ],
          mood: "respectful",
          effects: { npcFlags: { respects_player_path: true } },
          choices: [
            { id: "shake", text: "（握手）", effects: { opinion: 4, trust: 4 }, nextNode: "default" }
          ]
        },
        train_together_response: {
          id: "train_together_response",
          texts: [
            "莫凡眼睛一亮。",
            "一起修炼？好啊！",
            "（他活动了一下手腕。）",
            "正好，我最近练了一招新的，给你看看！",
            "（你们一起修炼了一下午，莫凡的修炼方式很野，但效果出奇地好。）"
          ],
          mood: "happy",
          effects: { exp: 30, opinion: 3 },
          choices: [
            { id: "learned", text: "收获很大，谢了", effects: { opinion: 2, trust: 2 }, nextNode: "default" },
            { id: "again", text: "下次再一起", effects: { opinion: 3 }, nextNode: "default" }
          ]
        },
        mofan_deep_recall_node: {
          id: "mofan_deep_recall_node",
          texts: [
            "莫凡看到你，咧嘴笑了。",
            "嘿，是你啊！",
            "（他拍了拍你的肩膀，很自然的那种。）",
            "最近修炼怎么样？上次说的迷茫，好些了吗？"
          ],
          mood: "friendly",
          choices: [
            { id: "better", text: "好多了，谢谢你的建议", condition: { memoryTags: ["player_shared_confusion"] }, effects: { opinion: 3, trust: 2 }, nextNode: "default" },
            { id: "still", text: "还在找方向", condition: { memoryTags: ["player_shared_confusion"] }, effects: { opinion: 2 }, nextNode: "default" },
            { id: "training", text: "一直在修炼，没停下", effects: { opinion: 2 }, nextNode: "default" },
            { id: "greet", text: "嗯，挺好的", effects: {}, nextNode: "default" }
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
        },
        mingzhu_exam_intro: {
          id: "mingzhu_exam_intro",
          texts: [
            "主校区考核要开始了。目标是暗影妖兽，在主校区里。",
            "你知道这意味着什么吧？不只是抓妖兽——还有其他学生的竞争。送到驯兽铁笼才算完成，所以一定会有人抢。",
            "更重要的是……我怀疑黑教廷的人会混在里面。你自己小心。"
          ],
          mood: "serious",
          choices: [
            {
              id: "accept",
              text: "我知道了，考核见。",
              effects: { opinion: 3 },
              nextNode: "default"
            }
          ]
        },
        about_family: {
          id: "about_family",
          texts: [
            "我爸啊，在穆家做司机，老实人一个，为了我上学把房子都卖了。",
            "还有...我有个义妹，叫心夏。",
            "（提到心夏时，莫凡的语气难得柔和下来。）",
            "她身体不太好，从小就弱，走路都费劲。我爸收养她之后，她就一直跟着我们。",
            "我修炼变强，有一半原因也是为了她。要是我能成为厉害的法师，说不定能找到治好她的方法。"
          ],
          mood: "soft",
          effects: {
            giveInfo: "ye_xinxia_intro",
            opinion: 3
          },
          choices: [
            {
              id: "ask_more",
              text: "她是什么系的？",
              condition: { minOpinion: 35 },
              effects: {},
              nextNode: "about_xinxia_more"
            },
            {
              id: "back",
              text: "你一定能保护好她的",
              effects: { opinion: 2 },
              nextNode: "default"
            }
          ]
        },
        about_xinxia_more: {
          id: "about_xinxia_more",
          texts: [
            "她啊...觉醒的时候出了点问题，一直没能成功觉醒。",
            "（莫凡皱了皱眉。）",
            "医生说她精神力太弱，承受不了星子的连接。但我总觉得不对劲，心夏她...有时候能感觉到一些奇怪的东西。",
            "说不上来，就好像她对某些特殊的能量特别敏感。",
            "算了，说这些你也不懂。总之，我不会让任何人欺负她。"
          ],
          mood: "worried",
          effects: {
            giveInfo: "ye_xinxia_condition"
          },
          choices: [
            {
              id: "back",
              text: "希望她能好起来",
              effects: { opinion: 2 },
              nextNode: "default"
            }
          ]
        }
      }
    },
    growth: {
      growthRate: 30,
      base: {
        level: 3,
        elements: ["thunder", "fire"],
        skills: ["basic_attack"],
        equipment: [],
        traits: [],
        title: "天生双系",
        growthType: "mage",
      },
      events: [
        {
          after: "star_path_awaken",
          level: 4,
          addSkills: ["thunder_bolt", "fire_bolt"],
          title: "初阶法师·双系",
        },
        {
          after: "bocheng_disaster",
          level: 18,
          addElements: ["shadow"],
          addSkills: ["thunder_fury", "fire_fist", "shadow_step"],
          addEquipment: ["blood_beast_boots"],
          addTraits: ["fire_spirit_seed_basic"],
          title: "中阶法师·三系",
        },
        {
          after: "mingzhu_entrance",
          level: 28,
          addElements: ["summon"],
          addSkills: ["dimensional_summon", "shadow_spike"],
          addEquipment: ["sickle_bone_shield"],
          title: "中阶法师·四系",
        }
      ]
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
    talents: [
      {
        name: "寒冰系天赋出众",
        type: "innate",
        element: "ice",
        description: "觉醒时寒冰系能量极强，直接冻结了觉醒石，在同阶学生中冰系魔法威力突出。穆氏世家旁系子弟，家族资源丰富。"
      }
    ],
    maxHp: 90,
    maxMp: 70,
    attack: 14,
    defense: 8,
    speed: 10,
    skills: ["basic_attack", "ice_spike"],
    growth: {
      growthRate: 50,
      base: {
        level: 3,
        elements: ["ice"],
        skills: ["basic_attack", "ice_spike", "ice_shield"],
        title: "穆家旁系子弟",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 7,
          addSkills: ["ice_spike"],
          title: "天澜魔法高中学生",
        },
        {
          after: "xuefeng_training",
          level: 10,
          addSkills: ["ice_lock"],
          title: "天澜魔法高中学生",
        },
        {
          after: "bocheng_disaster",
          level: 14,
          addSkills: ["ice_lock"],
          title: "冰系中阶法师",
        }
      ]
    },
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
    },
    dialogueTree: {
      npcId: "mu_bai",
      nodes: {
        default: {
          id: "default",
          texts: [
            "（面带标准微笑）你好，有什么事吗？",
            "哦，是你啊。（语气平淡，听不出情绪）",
            "有话直说，我还要修炼。"
          ],
          mood: "polite",
          choices: [
            {
              id: "ask_training",
              text: "想请教冰系修炼",
              condition: { minOpinion: 10 },
              effects: { opinion: 1 },
              nextNode: "ice_advice"
            },
            {
              id: "ask_mu_family",
              text: "穆氏家族很厉害吧？",
              condition: { notNpcFlags: ["asked_about_family"] },
              effects: { opinion: 2, npcFlags: { asked_about_family: true } },
              nextNode: "about_family"
            },
            {
              id: "challenge",
              text: "切磋一下？",
              condition: { minOpinion: 20, minLevel: 3 },
              effects: { opinion: 3 },
              nextNode: "challenge_response",
              action: "start_battle",
              actionData: { enemyId: "mu_bai_spar" }
            },
            {
              id: "provoke",
              text: "你是不是看不起平民？",
              condition: { maxOpinion: 10, notNpcFlags: ["provoked_mu_bai"] },
              effects: { opinion: -10, npcFlags: { provoked_mu_bai: true } },
              nextNode: "provoked"
            },
            {
              id: "accept_challenge",
              text: "听说你向我发起了挑战？",
              condition: { minLevel: 3, notHasQuest: "quest_mu_bai_challenge" },
              effects: { opinion: 2 },
              nextNode: "default",
              action: "start_quest",
              actionData: { questId: "quest_mu_bai_challenge" }
            },
            {
              id: "about_ningxue",
              text: "你和穆宁雪很熟？",
              condition: { minOpinion: 25, notNpcFlags: ["asked_about_ningxue"] },
              effects: { opinion: -3, npcFlags: { asked_about_ningxue: true } },
              nextNode: "about_ningxue"
            },
            {
              id: "farewell_mu_bai",
              text: "我要离开博城了",
              condition: { hasFlag: "bocheng_disaster_happened", notNpcFlags: ["said_farewell"] },
              effects: { npcFlags: { said_farewell: true } },
              nextNode: "mu_bai_farewell"
            },
            {
              id: "leave",
              text: "打扰了",
              effects: {},
              nextNode: null
            }
          ]
        },
        ice_advice: {
          id: "ice_advice",
          texts: [
            "冰系？哼，你连星子都没连稳，问这些做什么。",
            "（顿了顿）……冰系的精髓在于控制。不是一味攻击，而是让敌人按照你的节奏行动。",
            "就像这样——（他指尖凝出一朵冰花，又瞬间消散）懂了吗？"
          ],
          mood: "condescending",
          effects: { exp: 15 },
          choices: [
            { id: "thanks", text: "受教了", effects: { opinion: 1 }, nextNode: "default" },
            { id: "more", text: "能再演示一下吗？", condition: { minOpinion: 30 }, effects: { exp: 20, opinion: 1 }, nextNode: "ice_demo" }
          ]
        },
        ice_demo: {
          id: "ice_demo",
          texts: [
            "（他看了你一眼，似乎有些意外你会追问。）",
            "……你倒是有点意思。看好了。",
            "（他抬手，空气中的水汽瞬间凝结成数道冰锥，又在半空划出弧线精准命中远处的树干。）",
            "冰是活的，不是死的。让它去哪里，它就去哪里。"
          ],
          mood: "focused",
          effects: { exp: 25, opinion: 3 },
          choices: [
            { id: "training", text: "能给我布置修炼任务吗？", nextNode: "default", action: "start_quest", actionData: { questId: "quest_muningxue_ice_training" } },
            { id: "back", text: "明白了，谢谢", effects: {}, nextNode: "default" }
          ]
        },
        about_family: {
          id: "about_family",
          texts: [
            "穆氏？那是自然。博城穆氏，传承数百年，出过不知多少强者。",
            "（他理了理衣领，语气中带着不加掩饰的自豪。）",
            "不像某些人，连星尘魔器是什么都不知道，就敢说自己要当法师。"
          ],
          mood: "arrogant",
          choices: [
            { id: "back", text: "……", effects: {}, nextNode: "default" },
            { id: "argue", text: "出身不代表一切", condition: { minOpinion: -50 }, effects: { opinion: -5 }, nextNode: "argue_birth" }
          ]
        },
        argue_birth: {
          id: "argue_birth",
          texts: [
            "（他冷笑一声）出身不代表一切？说得好听。",
            "你知道穆氏给我们提供了多少资源吗？星尘魔器、灵种、功法……这些是你修炼十年也得不到的。",
            "不过……（他突然收了笑）你说的也不全错。资源是一回事，能不能用好是另一回事。"
          ],
          mood: "cold",
          choices: [
            { id: "back", text: "……", effects: {}, nextNode: "default" }
          ]
        },
        challenge_response: {
          id: "challenge_response",
          texts: [
            "和你切磋？（他上下打量你一眼）……行，我也想看看平民法师有多少斤两。",
            "别说我欺负你，我让你三招。"
          ],
          mood: "confident",
          choices: [
            { id: "fight", text: "不需要你让！", effects: {}, nextNode: null }
          ]
        },
        provoked: {
          id: "provoked",
          texts: [
            "（微笑瞬间消失，眼神冷了下来。）",
            "看不起平民？我没有看不起任何人。我只是……陈述事实。",
            "这个世界本来就是弱肉强食。你若觉得被冒犯，那是你太脆弱。",
            "（他转身离开，留下一句）好自为之。"
          ],
          mood: "cold",
          choices: [
            { id: "back", text: "……", effects: {}, nextNode: null }
          ]
        },
        about_ningxue: {
          id: "about_ningxue",
          texts: [
            "（他的表情有一瞬间的不自然。）",
            "宁雪……她是穆家的骄傲。天生冰系天赋，整个博城找不出第二个。",
            "（他的语气变得柔和了些，但随即又恢复了冷淡。）",
            "你问这个做什么？别打她的主意，你不配。"
          ],
          mood: "jealous",
          choices: [
            { id: "back", text: "我只是随便问问", effects: {}, nextNode: "default" }
          ]
        },
        mu_bai_farewell: {
          id: "mu_bai_farewell",
          texts: [
            "（穆白站在学校走廊里，看到你走来，似乎已经知道你要说什么。）",
            "……要走了？明珠学府。",
            "（他沉默了一会儿，手不自觉地摸了摸口袋里的什么东西。）",
            "博城这次……穆家也损失惨重。我叔叔他……",
            "（他咬了咬牙，没有继续说下去。）",
            "算了。你去明珠也好。",
            "（他从口袋里掏出一本薄薄的册子扔给你。）",
            "这是我整理的冰系中阶星图连接笔记。反正我已经背下来了。",
            "（他别过头，语气生硬。）",
            "别误会，我不是舍不得你。只是……到了明珠，别给博城丢脸。",
            "还有……离宇昂远点。那个人，不对劲。"
          ],
          mood: "complex",
          effects: {
            giveItem: "mu_bai_ice_notes",
            exp: 80,
            opinion: 10,
            giveInfo: "yu_ang_warning_from_mu_bai"
          },
          choices: [
            { id: "thanks", text: "穆白……保重", effects: { opinion: 5 }, nextNode: "default" },
            { id: "tease", text: "你这是在关心我？", condition: { minOpinion: 30 }, effects: { opinion: -3 }, nextNode: "farewell_tease" }
          ]
        },
        farewell_tease: {
          id: "farewell_tease",
          texts: [
            "（穆白的脸瞬间涨红。）",
            "谁、谁关心你了！",
            "你爱要不要！",
            "（他转身快步离开，走了几步又停下来，头也不回地说。）",
            "……到了明珠，别死了。"
          ],
          mood: "embarrassed",
          choices: [
            { id: "back", text: "（笑着目送他离开）", effects: { opinion: 5 }, nextNode: null }
          ]
        }
      }
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
    talents: [
      {
        id: "wind_speed_advantage",
        name: "风系速度优势",
        type: "acquired",
        description: "风系法师，速度较快，擅长快速出击和躲避。",
        effects: { windSpeedBonus: 0.1 }
      }
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
    },
    growth: {
      growthRate: 75,
      base: {
        level: 2,
        elements: ["wind"],
        skills: ["basic_attack","wind_blade"],
        title: "穆白的跟班",
        growthType: "mage",
      },
      events: [
        {
          after: "bocheng_disaster",
          level: 10,
          addSkills: ["wind_speed"],
          title: "风系法师",
        }
      ],
    }
  },
  zhang_xiaohou: {
    id: "zhang_xiaohou",
    name: "张小侯",
    title: "风系学生",
    description: "跟泥猴子一样的少年，莫凡的邻居和发小，高一8班学生。风系法师，速度很快。性格活泼热心，消息灵通，极其崇拜莫凡，叫他\"莫凡哥\"，关键时刻很护短。",
    elements: [
      "wind"
    ],
    level: 2,
    talents: [
      {
        name: "风系天赋出众",
        type: "innate",
        element: "wind",
        description: "风系天赋出众，速度极快，学期末已是班级少数掌握七颗星子的人。身法灵活，擅长高速移动和突袭。"
      }
    ],
    maxHp: 80,
    maxMp: 50,
    attack: 10,
    defense: 4,
    speed: 16,
    skills: [
      "basic_attack",
      "wind_blade"
    ],
    growth: {
      growthRate: 55,
      base: {
        level: 2,
        elements: ["wind"],
        skills: ["basic_attack", "wind_blade"],
        title: "风系学生",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 6,
          addSkills: ["wind_blade"],
          title: "天澜魔法高中学生",
        },
        {
          after: "xuefeng_training",
          level: 9,
          addSkills: ["wind_track"],
          title: "天澜魔法高中学生",
        },
        {
          after: "bocheng_disaster",
          level: 13,
          addSkills: ["wind_track_phantom"],
          title: "风系中阶法师",
        }
      ]
    },
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
    
    growth: {
      base: {
        level: 2,
        elements: ["wind"],
        skills: ["basic_attack","wind_blade"],
        title: "风系学生",
        growthType: "mage",
      },
      events: [
        {
          after: "bocheng_disaster",
          level: 12,
          addElements: ["earth"],
          addSkills: ["earth_shift", "earth_shield", "wind_speed"],
          title: "风系中阶法师",
        }
      ],
    },dialogueTree: {
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
              text: "一起去历练？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_zhangxiaohou_training" },
              condition: { notHasQuest: "quest_zhangxiaohou_training" }
            },
            {
              id: "farewell_xiaohou",
              text: "小侯，我要离开博城了",
              condition: {
                hasFlag: "bocheng_disaster_happened",
                notNpcFlags: ["said_farewell"]
              },
              effects: { npcFlags: { said_farewell: true } },
              next: "xiaohou_farewell"
            },
            {
              id: "after_training_xiaohou",
              text: "雪峰山历练怎么样？",
              condition: {
                hasFlag: "xuefeng_training_completed"
              },
              next: "after_training"
            },
            {
              id: "after_disaster_xiaohou",
              text: "你还好吗？博城灾难...",
              condition: {
                hasFlag: "bocheng_disaster_happened"
              },
              next: "after_disaster"
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
          oneTime: true,
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
          oneTime: true,
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
            "学校最近发生了不少事呢，你想知道哪方面的？"
          ],
          effects: {
            familiarity: 2
          },
          choices: [
            {
              text: "听说有小测验？",
              next: "quiz_news"
            },
            {
              text: "穆宁雪最近怎么样？",
              next: "ningxue_news"
            },
            {
              text: "山里不太平是什么意思？",
              next: "mountain_news"
            },
            {
              text: "我知道了",
              next: "default"
            }
          ]
        },
        quiz_news: {
          id: "quiz_news",
          oneTime: true,
          texts: [
            "对啊，听说过几天有个小测验，考魔法理论基础。我都快愁死了，理论什么的最头疼了！",
            "你可要好好复习啊，听说考不好会被唐月老师罚站的。"
          ],
          effects: {
            familiarity: 1
          },
          choices: [
            {
              text: "好的，我会注意的",
              next: "default"
            }
          ]
        },
        ningxue_news: {
          id: "ningxue_news",
          oneTime: true,
          texts: [
            "穆宁雪啊，她最近又突破了！不愧是冰系天才，真的太厉害了。",
            "我听说她已经快要达到中阶了，我们这些普通人跟她比起来，真是差太远了...",
            "不过她那个人总是冷冰冰的，好像对谁都爱答不理的。"
          ],
          effects: {
            familiarity: 1
          },
          choices: [
            {
              text: "确实很厉害",
              next: "default"
            }
          ]
        },
        mountain_news: {
          id: "mountain_news",
          oneTime: true,
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
          oneTime: true,
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
            "说起来，我最近一直在练习风系魔法，希望能跑得更快！到时候就算打不过也能跑掉嘛。",
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
        },
        after_training: {
          id: "after_training",
          texts: [
            "雪峰山历练？太刺激了！你是没看到，那些妖魔冲出来的时候，我腿都软了！",
            "不过我没跑！真的！我虽然害怕，但我还是站在前面保护大家了。莫凡哥说我进步很大呢！",
            "说起来，洞窟里那个钟乳石砸妖魔的战术太帅了！我当时就躲在岩障后面，看着妖魔被砸得嗷嗷叫！",
            "虽然最后受了点伤，但我觉得值！经过这次历练，我感觉自己变强了，也变勇敢了！"
          ],
          mood: "excited",
          effects: {
            opinion: 5,
            trust: 3,
            familiarity: 5,
            exp: 20
          },
          choices: [
            {
              text: "你真的很勇敢",
              effects: { opinion: 3 },
              next: "default"
            },
            {
              text: "以后一起修炼",
              effects: { opinion: 2, trust: 2 },
              next: "default"
            }
          ]
        },
        after_disaster: {
          id: "after_disaster",
          texts: [
            "（张小侯沉默了一会儿，平时活泼的脸上难得露出沉重的表情。）",
            "博城灾难... 我这辈子都忘不了。那天妖魔冲进来的时候，到处都是尖叫声，我... 我吓得腿都软了。",
            "但我没有跑！我带着几个低年级的同学躲在地下室，用风系魔法帮他们转移。虽然我能做的不多，但至少我保护了一些人。",
            "（他抬起头，眼睛红红的，但语气很坚定。）",
            "很多人都不在了... 但我们这些活下来的人，要替他们好好活下去。我要变得更强，强到下次再遇到这种事，我能保护更多的人。",
            "莫凡哥也是这么说的。他说，真正的强者不是不会害怕，而是害怕的时候依然选择站出来。"
          ],
          mood: "emotional",
          effects: {
            opinion: 10,
            trust: 8,
            familiarity: 10,
            exp: 50
          },
          choices: [
            {
              text: "你已经很勇敢了",
              effects: { opinion: 5, trust: 3 },
              next: "default"
            },
            {
              text: "我们一起变强",
              effects: { opinion: 5, trust: 5 },
              next: "default"
            }
          ]
        },
        xiaohou_farewell: {
          id: "xiaohou_farewell",
          texts: [
            "（张小侯愣了一下，笑容慢慢消失。）",
            "你要走了？去明珠学府？",
            "（他低下头，踢了踢脚边的石子。）",
            "也是啊，你那么厉害，博城留不住你的。",
            "（他突然抬起头，眼眶有点红，但笑得很灿烂。）",
            "没事！到了明珠记得联系我！等我毕业了，我也考明珠去！到时候咱们再一起修炼！",
            "莫凡哥也说要去呢，你们在明珠可别把我忘了！",
            "（他拍了拍你的肩膀，力气很大。）",
            "一路顺风啊，兄弟。"
          ],
          mood: "emotional",
          effects: {
            opinion: 15,
            trust: 10,
            exp: 50
          },
          choices: [
            {
              text: "保重，小侯",
              effects: { opinion: 5 },
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
    title: "光系初阶法师",
    description: "赵氏家族的少爷，光系法师。看似花花公子，实则防御极强，有点小贪财，但非常讲义气。博城篇时为天澜魔法高中学生，初阶法师。",
    elements: [
      "light"
    ],
    level: 4,
    maxHp: 200,
    maxMp: 120,
    attack: 12,
    defense: 20,
    speed: 12,
    spirit: 15,
    skills: ["basic_attack", "light_ray", "light_blind"],
    talents: [
          {
                "name": "天生防御强化",
                "type": "innate",
                "element": "light",
                "description": "光系+水系+岩系三系防御法师，防御魔法比拥有等同灵种的法师更加牢固，天生适合防御战。"
          }
    ],
    aiType: "defensive",
    growthType: "support",
    canDuel: true,
    spriteColor: "#FFD700",
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
              text: "一起去猎魔？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_zhaomanyan_hunt" }
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
    },
    growth: {
      growthRate: 50,
      base: {
        level: 4,
        elements: ["light"],
        skills: ["basic_attack", "light_ray"],
        equipment: [],
        traits: [],
        title: "光系初阶法师",
        growthType: "support",
      },
      events: [
        {
          after: "annual_exam",
          level: 7,
          addSkills: ["light_shield"],
          title: "光系初阶巅峰",
        },
        {
          after: "xuefeng_training",
          level: 11,
          addSkills: ["light_blessing"],
          title: "光系中阶法师",
        },
        {
          after: "bocheng_disaster",
          level: 15,
          addSkills: ["light_sanctuary"],
          title: "光系中阶法师",
        },
        {
          after: "mingzhu_entrance",
          level: 18,
          addSkills: ["light_blessing", "light_sanctuary", "light_purify"],
          title: "光系中阶法师",
          unlocks: ["duel"],
        }
      ]
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
    talents: [
      {
        name: "天生冰系灵种",
        type: "innate",
        element: "ice",
        description: "觉醒时便拥有冰系灵种，天生灵种极为罕见，天赋榜排名第九。整个博城找不出第二个，冰系魔法威力远超同阶法师。"
      }
    ],
    maxHp: 130,
    maxMp: 100,
    attack: 15,
    defense: 8,
    speed: 12,
    skills: ["basic_attack", "ice_spike", "ice_frost"],
    growth: {
      growthRate: 40,
      base: {
        level: 4,
        elements: ["ice"],
        skills: ["basic_attack", "ice_spike", "ice_shield"],
        title: "冰系天才",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 7,
          addSkills: ["ice_shield"],
          title: "冰系天才·初阶巅峰",
        },
        {
          after: "xuefeng_training",
          level: 11,
          addSkills: ["ice_lock"],
          title: "冰系中阶法师",
        },
        {
          after: "bocheng_disaster",
          level: 16,
          addSkills: ["ice_lock", "ice_storm"],
          addTalents: [
            {
              name: "冰晶刹弓",
              type: "acquired",
              element: "ice",
              description: "魂级冰种凝聚而成的魔弓，彻底爆发时威力不逊色于高阶魔法。使用后会抽空全身魔能甚至生命力，是穆宁雪的终极杀招。"
            }
          ],
          title: "冰系中阶法师",
        }
      ]
    },
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
    datePreferences: {
      loved: ["tower_train", "xuefeng_hike"],
      liked: ["library", "training_ground"],
      disliked: ["city_stroll"]
    },
    socialPreferences: {
      loved: ["tower_train", "xuefeng_hike"],
      liked: ["library", "training_ground"],
      disliked: ["city_stroll"]
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
              id: "ask_family",
              text: "作为穆家的人……压力大吗？",
              condition: { minOpinion: 20, notNpcFlags: ["opened_about_family"] },
              effects: {},
              nextNode: "about_family"
            },
            {
              id: "ask_power",
              text: "你的冰系天赋是怎么做到的？",
              condition: { minOpinion: 15 },
              effects: {},
              nextNode: "about_power"
            },
            {
              id: "ask_training",
              text: "你平时都怎么修炼？",
              condition: { minOpinion: 5, notMemoryTags: ["player_asked_training"] },
              effects: {
                opinion: 1,
                addMemory: { type: "conversation", content: "玩家问我平时怎么修炼", importance: 0.3, tags: ["player_asked_training"] }
              },
              nextNode: "about_training"
            },
            {
              id: "ask_meaning",
              text: "修炼对你来说意味着什么？",
              condition: { minOpinion: 15, notMemoryTags: ["player_asked_meaning"] },
              effects: {
                opinion: 2,
                trust: 1,
                addMemory: { type: "conversation", content: "玩家问修炼对我意味着什么", importance: 0.4, tags: ["player_asked_meaning"] }
              },
              nextNode: "about_meaning"
            },
            {
              id: "share_struggle",
              text: "我最近修炼遇到瓶颈了...",
              condition: { minOpinion: 10, notMemoryTags: ["player_shared_struggle"] },
              effects: {
                opinion: 2,
                trust: 2,
                addMemory: { type: "conversation", content: "玩家向我倾诉修炼瓶颈", importance: 0.4, tags: ["player_shared_struggle"] }
              },
              nextNode: "struggle_response"
            },
            {
              id: "ask_school_life",
              text: "在天澜魔法高中的生活怎么样？",
              condition: { notMemoryTags: ["player_asked_school_life"] },
              effects: {
                opinion: 1,
                addMemory: { type: "conversation", content: "玩家问学校生活", importance: 0.2, tags: ["player_asked_school_life"] }
              },
              nextNode: "about_school_life"
            },
            {
              id: "ask_dream",
              text: "如果不考虑家族，你想做什么？",
              condition: { minOpinion: 30, notMemoryTags: ["player_asked_dream"] },
              effects: {
                opinion: 3,
                trust: 3,
                addMemory: { type: "conversation", content: "玩家问我不考虑家族想做什么", importance: 0.6, tags: ["player_asked_dream"] }
              },
              nextNode: "about_dream"
            },
            {
              id: "recall_deep",
              text: "（穆宁雪看你的眼神和其他人不一样...）",
              condition: { anyMemoryTags: ["player_asked_dream", "player_shared_struggle", "player_asked_meaning"], npcFlags: ["seen_as_person"] },
              effects: {},
              nextNode: "deep_recall"
            },
            {
              id: "ask_past",
              text: "我听说你小时候发生过什么……",
              condition: { minOpinion: 35, notNpcFlags: ["shared_past"] },
              effects: {},
              nextNode: "about_past"
            },
            {
              id: "farewell_ningxue",
              text: "我要离开博城了",
              condition: { hasFlag: "bocheng_disaster_happened", notNpcFlags: ["said_farewell"] },
              effects: { npcFlags: { said_farewell: true } },
              nextNode: "ningxue_farewell"
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
        },
        about_family: {
          id: "about_family",
          texts: [
            "（穆宁雪的眼神微微一冷。）",
            "……家族？",
            "穆家需要的是最强的冰系法师，不是一个会笑的女孩。",
            "（她顿了顿，语气平淡得像在说别人的事。）",
            "从我觉醒冰系的那天起，他们就告诉我，我是穆家百年一遇的天才。",
            "天才……就必须承受天才该承受的东西。"
          ],
          mood: "cold",
          effects: { giveInfo: "mu_ningxue_family_pressure", trust: 3 },
          choices: [
            { id: "push", text: "你不觉得累吗？", condition: { minOpinion: 30 }, effects: { trust: 5 }, nextNode: "family_pressure" },
            { id: "back", text: "……抱歉", effects: {}, nextNode: "default" }
          ]
        },
        family_pressure: {
          id: "family_pressure",
          texts: [
            "（穆宁雪沉默了很久，冰蓝色的眼眸中闪过一丝你从未见过的东西——是疲惫，还是孤独？）",
            "……累又怎样。",
            "这是我的命。",
            "（她别过头去，不再看你。）",
            "这个话题到此为止。"
          ],
          mood: "sad",
          effects: { opinion: 5, npcFlags: { opened_about_family: true } },
          choices: [
            { id: "back", text: "我明白了", effects: {}, nextNode: "default" }
          ]
        },
        about_past: {
          id: "about_past",
          texts: [
            "（穆宁雪的表情瞬间冷了下来，周围的空气似乎都降低了几度。）",
            "……你听谁说的？",
            "（她的手不自觉地攥紧了衣角。）",
            "小时候的事……我不想提。",
            "（你注意到她的眼神深处，藏着一丝不易察觉的……恐惧？）"
          ],
          mood: "cold",
          effects: { giveInfo: "mu_ningxue_past_mystery" },
          choices: [
            { id: "apologize", text: "抱歉，我不该问", effects: { opinion: 2 }, nextNode: "default" },
            { id: "press", text: "如果有什么我能帮忙的……", condition: { minOpinion: 50, minTrust: 30 }, effects: { trust: 8, opinion: 3 }, nextNode: "past_trust" }
          ]
        },
        past_trust: {
          id: "past_trust",
          texts: [
            "（穆宁雪看着你，冰蓝色的眼眸微微颤动。）",
            "……你是第一个说这种话的人。",
            "（她沉默了片刻，声音轻得几乎听不见。）",
            "那件事……和黑教廷有关。",
            "我见过他们的标记……倒十字，眼睛……",
            "（她的声音在发抖，但很快恢复了冰冷。）",
            "别说出去。"
          ],
          mood: "fear",
          effects: { giveInfo: "mu_ningxue_black_church_trauma", trust: 10, npcFlags: { shared_past: true } },
          choices: [
            { id: "promise", text: "我不会告诉任何人", effects: { trust: 10, opinion: 5 }, nextNode: "default" }
          ]
        },
        about_power: {
          id: "about_power",
          texts: [
            "（你提起她的冰系天赋，穆宁雪抬起手，一缕冰蓝色的星尘在她指尖环绕。）",
            "……天生灵体。",
            "他们是这么说的。",
            "（那缕冰星尘的颜色比普通冰系更深，带着一种近乎透明的蓝。）",
            "我能感知到冰系星子的方式……和别人不同。它们不是被我征服的，而是……主动靠近我。",
            "（她收起星尘，语气恢复平淡。）",
            "但天赋只是起点。不修炼，天才也会变成废物。"
          ],
          mood: "neutral",
          effects: { giveInfo: "mu_ningxue_innate_spirit_body", exp: 20 },
          choices: [
            { id: "amazing", text: "这太厉害了", effects: { opinion: -1 }, nextNode: "power_humble" },
            { id: "understand", text: "所以你才这么努力", condition: { minOpinion: 25 }, effects: { opinion: 5, trust: 3 }, nextNode: "power_recognize" },
            { id: "back", text: "受教了", effects: {}, nextNode: "default" }
          ]
        },
        power_humble: {
          id: "power_humble",
          texts: [
            "（穆宁雪微微皱眉。）",
            "……厉害的不是天赋，是每天三百次的星子连接。",
            "你只看到了结果。"
          ],
          mood: "cold",
          choices: [
            { id: "back", text: "……我明白了", effects: {}, nextNode: "default" }
          ]
        },
        power_recognize: {
          id: "power_recognize",
          texts: [
            "（穆宁雪看了你一眼，眼神中多了一丝……认可？）",
            "……你比那些人聪明。",
            "他们只会说'你是天才'，好像我不需要努力一样。",
            "（她顿了顿。）",
            "你也在修炼吧？冰系？"
          ],
          mood: "neutral",
          choices: [
            { id: "yes_ice", text: "是，我也是冰系", condition: { element: "ice" }, effects: { opinion: 5 }, nextNode: "fellow_ice" },
            { id: "no", text: "不是，但我敬佩你的努力", effects: { opinion: 3 }, nextNode: "default" }
          ]
        },
        fellow_ice: {
          id: "fellow_ice",
          texts: [
            "（穆宁雪的表情柔和了一瞬。）",
            "……冰系的路不好走。",
            "中阶之后，冰系的控制会变得很难。星图……比其他系更复杂。",
            "（她犹豫了一下。）",
            "如果你在连接星图时遇到问题……可以问我。"
          ],
          mood: "neutral",
          effects: { opinion: 8, trust: 5, npcFlags: { offered_help: true } },
          choices: [
            { id: "thanks", text: "谢谢，我会的", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        about_training: {
          id: "about_training",
          texts: [
            "（穆宁雪微微偏头，似乎没想到你会问这个。）",
            "……每天。",
            "清晨星子最活跃的时候修炼两个小时，下午连接星图，晚上复盘。",
            "（她顿了顿。）",
            "没有捷径。重复到星子成为本能。"
          ],
          mood: "neutral",
          choices: [
            { id: "inspired", text: "我明白了，谢谢", effects: { exp: 10 }, nextNode: "default" },
            { id: "ask_more", text: "不会觉得枯燥吗？", condition: { minOpinion: 15 }, effects: { opinion: 1 }, nextNode: "training_boring" }
          ]
        },
        training_boring: {
          id: "training_boring",
          texts: [
            "（穆宁雪看了你一眼。）",
            "……枯燥？",
            "当你能让星子按照自己的意志排列成星图的时候，就不会觉得枯燥了。",
            "（她的语气很淡，但眼神里有一种执着。）",
            "每一次连接，都是在和自己对话。"
          ],
          mood: "thoughtful",
          choices: [
            { id: "understand", text: "我懂了", effects: { opinion: 2, trust: 1 }, nextNode: "default" }
          ]
        },
        about_meaning: {
          id: "about_meaning",
          texts: [
            "（穆宁雪沉默了很久。）",
            "……意味着什么？",
            "（她低头看着自己的手，指尖有微弱的冰蓝色光芒闪烁。）",
            "一开始是家族的期望。后来……",
            "（她抬起头，冰蓝色的眼眸很平静。）",
            "是证明自己存在的方式。"
          ],
          mood: "thoughtful",
          choices: [
            { id: "relate", text: "我也在寻找这个答案", effects: { opinion: 3, trust: 2 }, nextNode: "default" },
            { id: "respect", text: "……我尊重你的选择", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        struggle_response: {
          id: "struggle_response",
          texts: [
            "（穆宁雪看着你，表情没有变化，但眼神专注了一些。）",
            "瓶颈。",
            "……每个人都会遇到。",
            "（她思考了一下。）",
            "你卡在哪里？星子连接不稳定，还是星图结构不对？",
            "（她的语气依旧冷淡，但问题很具体。）"
          ],
          mood: "neutral",
          choices: [
            { id: "star_connection", text: "星子连接总是断开", effects: { opinion: 2, exp: 20 }, nextNode: "struggle_advice" },
            { id: "star_map", text: "星图结构总是不完整", effects: { opinion: 2, exp: 20 }, nextNode: "struggle_advice" },
            { id: "thanks_listen", text: "谢谢你听我说", effects: { trust: 3 }, nextNode: "default" }
          ]
        },
        struggle_advice: {
          id: "struggle_advice",
          texts: [
            "（穆宁雪认真地想了想。）",
            "不要急。",
            "星子有自己的节奏，你越用力，它们越抗拒。",
            "（她伸出手，一缕冰蓝色的星尘在指尖缓缓旋转。）",
            "试着感受它们，而不是控制它们。",
            "……这是我能给的建议。"
          ],
          mood: "neutral",
          effects: { exp: 30, npcFlags: { gave_training_advice: true } },
          choices: [
            { id: "grateful", text: "这个建议很有帮助", effects: { opinion: 3, trust: 2 }, nextNode: "default" }
          ]
        },
        about_school_life: {
          id: "about_school_life",
          texts: [
            "（穆宁雪的表情没有变化。）",
            "……就那样。",
            "上课，修炼，回家。",
            "（她顿了顿。）",
            "学校里的人……大多只看到穆家的姓氏。"
          ],
          mood: "cold",
          choices: [
            { id: "see_you", text: "我看到的是你，不是穆家", condition: { minOpinion: 10 }, effects: { opinion: 4, trust: 2 }, nextNode: "school_life_touched" },
            { id: "neutral", text: "这样啊", effects: {}, nextNode: "default" }
          ]
        },
        school_life_touched: {
          id: "school_life_touched",
          texts: [
            "（穆宁雪微微一怔，冰蓝色的眼眸闪过一丝意外。）",
            "……",
            "（她别过头，声音很轻。）",
            "你是第一个这么说的人。"
          ],
          mood: "neutral",
          effects: { npcFlags: { seen_as_person: true } },
          choices: [
            { id: "back", text: "（安静地陪着她）", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        about_dream: {
          id: "about_dream",
          texts: [
            "（穆宁雪的表情第一次出现了明显的波动。）",
            "……不考虑家族？",
            "（她沉默了很久，久到你以为她不会回答。）",
            "我想……去看看雪峰山以外的世界。",
            "（她的声音很轻，像是在说一个不敢让人听见的秘密。）",
            "不是为了穆家，不是为了修炼。只是……想看看。"
          ],
          mood: "sad",
          effects: { trust: 5, npcFlags: { shared_dream: true } },
          choices: [
            { id: "encourage", text: "总有一天你可以的", effects: { opinion: 5, trust: 3 }, nextNode: "dream_response" },
            { id: "offer", text: "如果有机会，我带你去看", condition: { minOpinion: 40 }, effects: { opinion: 8, trust: 5 }, nextNode: "dream_offer" }
          ]
        },
        dream_response: {
          id: "dream_response",
          texts: [
            "（穆宁雪看着你，眼神复杂。）",
            "……嗯。",
            "（她轻轻点头，嘴角似乎有一丝极淡的弧度。）",
            "谢谢你。"
          ],
          mood: "neutral",
          choices: [
            { id: "back", text: "（微笑）", effects: {}, nextNode: "default" }
          ]
        },
        dream_offer: {
          id: "dream_offer",
          texts: [
            "（穆宁雪猛地看向你，冰蓝色的眼眸里有震惊，有……一丝期待？）",
            "你……",
            "（她很快恢复平静，但耳尖微微泛红。）",
            "……好。我等着。"
          ],
          mood: "neutral",
          effects: { npcFlags: { promised_travel: true } },
          choices: [
            { id: "promise", text: "一言为定", effects: { opinion: 5, trust: 5 }, nextNode: "default" }
          ]
        },
        deep_recall: {
          id: "deep_recall",
          texts: [
            "（穆宁雪看到你，冰蓝色的眼眸微微柔和了一瞬。）",
            "……是你。",
            "（她的语气依旧冷淡，但少了几分疏离。）",
            "修炼怎么样了？上次说的瓶颈，解决了吗？"
          ],
          mood: "neutral",
          choices: [
            { id: "improved", text: "好多了，谢谢你的建议", condition: { npcFlags: ["gave_training_advice"] }, effects: { opinion: 3, trust: 2 }, nextNode: "default" },
            { id: "still_struggling", text: "还在努力", condition: { npcFlags: ["gave_training_advice"] }, effects: { opinion: 1 }, nextNode: "default" },
            { id: "thinking_dream", text: "一直在想你说的话", condition: { npcFlags: ["shared_dream"] }, effects: { opinion: 4, trust: 3 }, nextNode: "default" },
            { id: "greet", text: "嗯，我挺好的", effects: {}, nextNode: "default" }
          ]
        },
        ningxue_farewell: {
          id: "ningxue_farewell",
          texts: [
            "（穆宁雪站在学校门口，冰蓝色的眼眸看着你，似乎想说什么，但最终只是点了点头。）",
            "……你要走了。",
            "（沉默。）",
            "明珠学府……是个好地方。",
            "（她从口袋里掏出一个东西递给你——是一枚冰蓝色的晶石，散发着淡淡的寒气。）",
            "这个……给你。",
            "是我在雪峰山修炼时找到的，对冰系修炼有帮助。",
            "（她别过头，耳朵微微泛红。）",
            "……别死在外面。"
          ],
          mood: "sad",
          effects: {
            giveItem: "ningxue_ice_crystal",
            exp: 100,
            opinion: 15,
            trust: 10
          },
          choices: [
            { id: "thanks", text: "穆宁雪……保重", effects: { opinion: 5 }, nextNode: "default" }
          ]
        }
      }
    }
  },
  tang_yue: {
    id: "tang_yue",
    name: "唐月",
    title: "魔法实践课老师",
    description: "天澜魔法高中的魔法实践课老师，成熟明媚，火系法师，教学风格生动。表面上是普通老师，实际身份是魔法协会审判会的审判员，在博城暗中调查黑教廷的动向。对学生很照顾，但偶尔会流露出超越普通教师的冷静和锐利。",
    elements: [
      "fire"
    ],
    level: 14,
    levelDisplay: "中阶???",
    levelUnknown: true,
    maxHp: 400,
    maxMp: 250,
    attack: 45,
    defense: 20,
    speed: 18,
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst", "fire_fist", "fire_fist_nine"],
    talents: [
          {
                "name": "暗影系亲和",
                "type": "innate",
                "element": "dark",
                "description": "审判会特工，天生拥有暗影系亲和，火系+暗影系双系法师，擅长隐匿和暗杀。"
          }
    ],
    growth: {
      base: {
        level: 14,
        elements: ["fire"],
        skills: ["basic_attack", "fire_bolt", "fire_rain"],
        title: "魔法实践课老师",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 14,
          addSkills: ["fire_burst"],
          title: "天澜魔法高中实习老师",
        },
        {
          after: "xuefeng_training",
          level: 18,
          addSkills: ["fire_fist"],
          title: "天澜魔法高中实习老师",
        },
        {
          after: "bocheng_disaster",
          level: 22,
          addSkills: ["fire_fist"],
          title: "审判会审判员",
        }
      ]
    },
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
      "quest_explore_mountain",
      "quest_journey_to_mingzhu"
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
              id: "ask_direction",
              text: "老师，您觉得我适合走什么方向？",
              condition: { minOpinion: 10, notMemoryTags: ["player_asked_direction"] },
              effects: {
                opinion: 2,
                trust: 1,
                addMemory: { type: "conversation", content: "玩家问我他适合什么方向", importance: 0.4, tags: ["player_asked_direction"] }
              },
              nextNode: "direction_advice"
            },
            {
              id: "share_weariness",
              text: "老师，修炼有时候觉得很累...",
              condition: { minOpinion: 15, notMemoryTags: ["player_shared_weariness"] },
              effects: {
                opinion: 2,
                trust: 3,
                addMemory: { type: "conversation", content: "玩家向我倾诉修炼的疲惫", importance: 0.5, tags: ["player_shared_weariness"] }
              },
              nextNode: "weariness_response"
            },
            {
              id: "ask_why_teacher",
              text: "您为什么选择当老师？",
              condition: { minOpinion: 20, notMemoryTags: ["player_asked_why_teacher"] },
              effects: {
                opinion: 3,
                trust: 2,
                addMemory: { type: "conversation", content: "玩家问我为什么当老师", importance: 0.5, tags: ["player_asked_why_teacher"] }
              },
              nextNode: "why_teacher"
            },
            {
              id: "ask_fear",
              text: "老师，您有害怕的东西吗？",
              condition: { minOpinion: 30, notMemoryTags: ["player_asked_fear"] },
              effects: {
                opinion: 3,
                trust: 4,
                addMemory: { type: "conversation", content: "玩家问我害怕什么", importance: 0.6, tags: ["player_asked_fear"] }
              },
              nextNode: "about_fear"
            },
            {
              id: "express_determination",
              text: "老师，我想变得更强，保护大家",
              condition: { minOpinion: 10, notMemoryTags: ["player_expressed_determination"] },
              effects: {
                opinion: 3,
                trust: 2,
                exp: 10,
                addMemory: { type: "conversation", content: "玩家说想变强保护大家", importance: 0.5, tags: ["player_expressed_determination"] }
              },
              nextNode: "determination_response"
            },
            {
              id: "tangyue_deep_recall",
              text: "（唐月看到你，露出了温柔的笑容...）",
              condition: { anyMemoryTags: ["player_shared_weariness", "player_asked_fear", "player_expressed_determination"], minOpinion: 25 },
              effects: {},
              nextNode: "tangyue_deep_recall_node"
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
              id: "ask_black_church",
              text: "老师，您听说过黑教廷吗？",
              condition: {
                minOpinion: 30,
                minTrust: 20,
                minDay: 15
              },
              effects: {
                opinion: 1,
                trust: 2,
                discoverClue: "clue_black_church_stranger"
              },
              nextNode: "black_church_talk"
            },
            {
              id: "share_investigation",
              text: "老师，我发现了一些可疑的事情...",
              condition: {
                minOpinion: 35,
                minTrust: 25,
                hasFlag: "investigation_started"
              },
              effects: {
                opinion: 2,
                trust: 3,
                discoverClue: "clue_black_church_communication"
              },
              nextNode: "share_findings"
            },
            {
              id: "report_yu_ang",
              text: "老师，我觉得宇昂这个人有问题...",
              condition: {
                minOpinion: 40,
                minTrust: 30,
                hasFlag: "yu_ang_suspicion_triggered",
                notNpcFlags: ["reported_yu_ang"]
              },
              effects: {
                opinion: 3,
                trust: 5,
                npcFlags: { reported_yu_ang: true },
                flags: { yu_ang_reported_to_tangyue: true }
              },
              nextNode: "yu_ang_report"
            },
            {
              id: "ask_about_you",
              text: "老师，你来学校之前是做什么的？",
              condition: {
                minOpinion: 35,
                notNpcFlags: ["asked_about_past"]
              },
              effects: {
                opinion: 1,
                npcFlags: { asked_about_past: true }
              },
              nextNode: "about_past"
            },
            {
              id: "saw_on_roof",
              text: "老师，昨晚我好像在天台看到你了……",
              condition: {
                minOpinion: 45,
                minTrust: 30,
                hasFlag: "saw_tang_yue_roof",
                notNpcFlags: ["confronted_roof"]
              },
              effects: {
                opinion: -3,
                npcFlags: { confronted_roof: true },
                giveInfo: "tang_yue_secret"
              },
              nextNode: "roof_confrontation"
            },
            {
              id: "farewell",
              text: "老师，我要离开博城了",
              condition: {
                hasFlag: "bocheng_disaster_happened",
                notNpcFlags: ["said_farewell"]
              },
              effects: {
                opinion: 5,
                npcFlags: { said_farewell: true }
              },
              nextNode: "farewell_node"
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
              id: "investigate",
              text: "老师，我可以帮忙调查吗？",
              nextNode: "default",
              action: "start_quest",
              actionData: { questId: "quest_tangyue_mountain_investigation" }
            },
            {
              id: "back",
              text: "好的，我会注意的",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        black_church_talk: {
          id: "black_church_talk",
          texts: [
            "（唐月的表情微微一变，但很快恢复了平静。）",
            "黑教廷...你怎么会问起这个？",
            "那是一个非常危险的组织，你不要去招惹他们。",
            "...如果你听到什么关于黑教廷的消息，一定要第一时间告诉我，知道吗？"
          ],
          mood: "serious",
          choices: [
            {
              id: "promise",
              text: "好的老师，我会注意的",
              effects: { opinion: 1, trust: 1 },
              nextNode: "default"
            },
            {
              id: "ask_more",
              text: "老师，您好像对黑教廷很了解？",
              condition: { minTrust: 30 },
              effects: { opinion: -1, trust: 2 },
              nextNode: "black_church_more"
            }
          ]
        },
        black_church_more: {
          id: "black_church_more",
          texts: [
            "（唐月沉默了一会儿。）",
            "...我以前在魔法协会的时候，接触过一些相关的资料。",
            "黑教廷的人非常狡猾，他们会伪装成普通人，潜伏在各个城市。",
            "博城...可能也有他们的人。你平时一定要多加小心。"
          ],
          mood: "serious",
          choices: [
            {
              id: "understand",
              text: "我明白了，谢谢老师提醒",
              effects: { opinion: 1, trust: 2, flags: { investigation_started: true } },
              nextNode: "default"
            }
          ]
        },
        share_findings: {
          id: "share_findings",
          texts: [
            "（唐月认真地看着你。）",
            "你发现了什么？慢慢说。",
            "...你说的这些，和我调查到的一些情况吻合。",
            "看来博城确实有问题。谢谢你告诉我这些，这件事我会继续追查的。",
            "你自己也要小心，不要轻易暴露你在调查这件事。"
          ],
          mood: "serious",
          choices: [
            {
              id: "offer_help",
              text: "老师，我可以帮您一起调查",
              condition: { minOpinion: 40, minTrust: 30 },
              effects: { opinion: 2, trust: 3, flags: { tang_yue_investigation_partner: true } },
              nextNode: "investigation_partner"
            },
            {
              id: "leave_it",
              text: "好的老师，那就交给您了",
              effects: { opinion: 1 },
              nextNode: "default"
            }
          ]
        },
        investigation_partner: {
          id: "investigation_partner",
          texts: [
            "（唐月露出了欣慰的笑容。）",
            "有你帮忙太好了。不过你一定要记住，安全第一。",
            "如果发现什么重要线索，随时来找我。",
            "...这场风暴，可能比我们想象的要大得多。"
          ],
          mood: "gentle",
          choices: [
            {
              id: "acknowledge",
              text: "我会小心的，老师",
              effects: { opinion: 2, trust: 2 },
              nextNode: "default"
            }
          ]
        },
        yu_ang_report: {
          id: "yu_ang_report",
          texts: [
            "（唐月的表情瞬间变得严肃。）",
            "宇昂？你具体发现了什么？",
            "...深夜外出、可疑的魔具、还有他的身世。",
            "（唐月沉默了很久。）",
            "你说的这些...和我调查到的一些情况吻合。",
            "宇昂确实有问题。但他背后的势力，比你想象的要大得多。",
            "这件事你不要再单独行动了，太危险。",
            "...谢谢你告诉我。接下来的事，交给我和审判会。"
          ],
          mood: "serious",
          choices: [
            {
              id: "want_to_help",
              text: "老师，我也想帮忙",
              condition: { minOpinion: 45, minTrust: 35 },
              effects: { opinion: 2, trust: 3, flags: { help_investigate_yu_ang: true } },
              nextNode: "yu_ang_help"
            },
            {
              id: "understand",
              text: "好的老师，我会小心的",
              effects: { opinion: 1, trust: 2 },
              nextNode: "default"
            }
          ]
        },
        yu_ang_help: {
          id: "yu_ang_help",
          texts: [
            "（唐月看着你，眼神复杂。）",
            "...你确定？这可能会有生命危险。",
            "好吧。如果你坚持的话，我需要你帮我做一件事。",
            "去穆家庄园附近，留意宇昂的行踪。如果发现他和陌生人接触，立刻告诉我。",
            "记住，只观察，不要行动。你的安全比什么都重要。"
          ],
          mood: "serious",
          choices: [
            {
              id: "agree",
              text: "我明白了，老师",
              effects: { opinion: 2, trust: 3, startQuest: "quest_investigate_yu_ang" },
              nextNode: "default"
            }
          ]
        },
        about_past: {
          id: "about_past",
          texts: [
            "我吗？我之前...在魔法协会做过一段时间的研究员。",
            "后来觉得还是想教书，就来天澜了。跟年轻人在一起，感觉自己也年轻了。",
            "（她的眼神有一瞬间的闪烁，似乎没有完全说实话。）"
          ],
          mood: "gentle",
          choices: [
            {
              id: "press",
              text: "只是研究员？",
              condition: { minTrust: 40 },
              effects: { opinion: -2 },
              nextNode: "about_past_pressed"
            },
            {
              id: "accept",
              text: "原来如此，老师真厉害",
              effects: { opinion: 2 },
              nextNode: "default"
            }
          ]
        },
        about_past_pressed: {
          id: "about_past_pressed",
          texts: [
            "...你这孩子，观察力倒是挺敏锐的。",
            "有些事情，知道太多对你没有好处。",
            "你只需要知道，我不会害你，也不会害学校里任何一个学生。",
            "等你再强一些...或许我会告诉你更多。"
          ],
          mood: "serious",
          effects: {
            npcFlags: { knows_tang_yue_has_secret: true },
            trust: 5
          },
          choices: [
            {
              id: "back",
              text: "我明白了",
              effects: {},
              nextNode: "default"
            }
          ]
        },
        roof_confrontation: {
          id: "roof_confrontation",
          texts: [
            "（唐月的表情瞬间变了，那是你从未见过的警惕。）",
            "...你看到了？",
            "听着，昨晚的事不要告诉任何人。我在天台只是...处理一些私人事务。",
            "我知道你很好奇，但有些事不知道比知道安全。相信我。"
          ],
          mood: "cold",
          effects: {
            trust: 3,
            giveInfo: "tang_yue_roof_secret"
          },
          choices: [
            {
              id: "trust",
              text: "好，我不会说的",
              effects: { trust: 5, opinion: 3 },
              nextNode: "roof_trust"
            },
            {
              id: "doubt",
              text: "你是不是在隐瞒什么？",
              effects: { opinion: -5 },
              nextNode: "roof_doubt"
            }
          ]
        },
        roof_trust: {
          id: "roof_trust",
          texts: [
            "（她看了你一会儿，表情缓和下来。）",
            "...谢谢你。你比我想象的要成熟。",
            "记住，在这个世界上，有些真相是需要实力来承载的。",
            "等你足够强了，我会告诉你一切。"
          ],
          mood: "gentle",
          choices: [
            { id: "back", text: "我会变强的", effects: {}, nextNode: "default" }
          ]
        },
        roof_doubt: {
          id: "roof_doubt",
          texts: [
            "（她叹了口气。）",
            "我没有必要向你解释什么。",
            "但你要记住，今晚的事如果传出去，不只是我，你也会有危险。",
            "就当什么都没看到，好吗？"
          ],
          mood: "tired",
          choices: [
            { id: "back", text: "...好", effects: {}, nextNode: "default" }
          ]
        },
        direction_advice: {
          id: "direction_advice",
          texts: [
            "（唐月认真地看着你。）",
            "适合走什么方向？",
            "（她思考了一下。）",
            "这要看你自己。有人追求力量，有人追求守护，有人追求真相。",
            "（她的语气很温柔。）",
            "老师能教你的是方法，但方向要你自己选。",
            "你心里最想做的是什么？"
          ],
          mood: "gentle",
          choices: [
            { id: "protect", text: "我想保护身边的人", effects: { opinion: 3, trust: 2, exp: 15 }, nextNode: "direction_protect" },
            { id: "truth", text: "我想知道这个世界的真相", effects: { opinion: 2, trust: 3 }, nextNode: "direction_truth" },
            { id: "strength", text: "我想变得更强", effects: { opinion: 2, exp: 10 }, nextNode: "direction_strength" }
          ]
        },
        direction_protect: {
          id: "direction_protect",
          texts: [
            "（唐月露出了欣慰的笑容。）",
            "保护他人……这是最温柔也最艰难的路。",
            "（她的眼神里有一丝复杂。）",
            "但你要记住，想保护别人，先要有保护自己的力量。",
            "老师相信你可以做到。"
          ],
          mood: "gentle",
          effects: { npcFlags: { knows_player_goal_protect: true } },
          choices: [
            { id: "thanks", text: "谢谢老师", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        direction_truth: {
          id: "direction_truth",
          texts: [
            "（唐月的表情微微变化。）",
            "真相……",
            "（她沉默了一会儿。）",
            "这个世界有很多你不知道的事。有些真相，知道了反而危险。",
            "（她看着你，眼神认真。）",
            "但如果你真的想知道，就变强吧。强到足以承载真相。"
          ],
          mood: "serious",
          effects: { npcFlags: { knows_player_goal_truth: true }, giveInfo: "tang_yue_hint_secret" },
          choices: [
            { id: "determined", text: "我会的", effects: { opinion: 3, trust: 3 }, nextNode: "default" }
          ]
        },
        direction_strength: {
          id: "direction_strength",
          texts: [
            "（唐月点了点头。）",
            "变强是最直接的目标。",
            "（她笑了笑。）",
            "但不要忘了，力量是为了什么而存在。",
            "等你变强了，再来告诉老师你想用力量做什么。"
          ],
          mood: "gentle",
          effects: { npcFlags: { knows_player_goal_strength: true } },
          choices: [
            { id: "promise", text: "好", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        weariness_response: {
          id: "weariness_response",
          texts: [
            "（唐月的表情变得柔和。）",
            "累了？",
            "（她轻轻叹了口气。）",
            "修炼确实很苦。每个人都会有觉得累的时候。",
            "（她看着你，眼神温柔。）",
            "但累了就休息一下，没关系的。",
            "老师有时候也会觉得累呢。",
            "（她顿了顿。）",
            "重要的不是一直不停，而是休息之后还能继续。"
          ],
          mood: "gentle",
          effects: { exp: 15, npcFlags: { comforted_player: true } },
          choices: [
            { id: "feel_better", text: "听您这么说，好多了", effects: { opinion: 4, trust: 3 }, nextNode: "default" },
            { id: "ask_teacher", text: "老师也会累吗？", condition: { minOpinion: 25 }, effects: { opinion: 2, trust: 2 }, nextNode: "teacher_weary" }
          ]
        },
        teacher_weary: {
          id: "teacher_weary",
          texts: [
            "（唐月笑了笑，但笑容里有一丝疲惫。）",
            "当然会啊。",
            "（她望向窗外。）",
            "老师也有很多事情要处理，有时候也会觉得力不从心。",
            "（她收回目光，看着你。）",
            "但看到你们这些学生在成长，就觉得一切都值得。"
          ],
          mood: "tired",
          effects: { trust: 3 },
          choices: [
            { id: "care", text: "老师也要注意休息", effects: { opinion: 5, trust: 4 }, nextNode: "default" }
          ]
        },
        why_teacher: {
          id: "why_teacher",
          texts: [
            "（唐月愣了一下，然后笑了。）",
            "为什么当老师？",
            "（她想了想。）",
            "因为……想看着年轻人成长吧。",
            "（她的眼神很温柔。）",
            "每个学生都有无限的可能。能在你们成长的路上帮一把，是很有意义的事。",
            "（她顿了顿，语气轻了一些。）",
            "而且……有些事，只有在这个位置上才能做。"
          ],
          mood: "gentle",
          choices: [
            { id: "understand", text: "您是个好老师", effects: { opinion: 4, trust: 3 }, nextNode: "default" },
            { id: "curious", text: "只有在这个位置才能做的事？", condition: { minOpinion: 35, minTrust: 25 }, effects: { opinion: 1, trust: 2 }, nextNode: "why_teacher_hint" }
          ]
        },
        why_teacher_hint: {
          id: "why_teacher_hint",
          texts: [
            "（唐月的表情微微一变。）",
            "……你很敏锐。",
            "（她沉默了一会儿。）",
            "有些事，现在还不能告诉你。",
            "（她看着你，眼神复杂。）",
            "等你足够强了，也许我会告诉你。",
            "现在，专注于修炼吧。"
          ],
          mood: "serious",
          effects: { npcFlags: { hinted_secret: true }, giveInfo: "tang_yue_secret_hint" },
          choices: [
            { id: "wait", text: "我会等那一天", effects: { opinion: 3, trust: 4 }, nextNode: "default" }
          ]
        },
        about_fear: {
          id: "about_fear",
          texts: [
            "（唐月的笑容消失了。）",
            "害怕的东西？",
            "（她沉默了很久。）",
            "……有啊。",
            "（她的声音很轻。）",
            "害怕自己保护不了重要的人。",
            "害怕有些真相揭开的时候，自己没有足够的力量去面对。",
            "（她看向你，眼神里有一丝脆弱。）",
            "每个人都有害怕的东西，老师也不例外。"
          ],
          mood: "sad",
          effects: { trust: 5, npcFlags: { shared_fear: true } },
          choices: [
            { id: "relate", text: "我也有害怕的东西", effects: { opinion: 4, trust: 4 }, nextNode: "fear_relate" },
            { id: "comfort", text: "老师已经很厉害了", effects: { opinion: 3 }, nextNode: "default" }
          ]
        },
        fear_relate: {
          id: "fear_relate",
          texts: [
            "（唐月看着你，眼神里多了一丝共鸣。）",
            "是吗……",
            "（她轻轻笑了笑。）",
            "那我们都要努力变强啊。",
            "强到不再害怕。"
          ],
          mood: "gentle",
          effects: { opinion: 3, trust: 3, exp: 20 },
          choices: [
            { id: "promise", text: "一起努力", effects: { opinion: 4, trust: 3 }, nextNode: "default" }
          ]
        },
        determination_response: {
          id: "determination_response",
          texts: [
            "（唐月的眼睛亮了一下。）",
            "保护大家？",
            "（她露出了欣慰的笑容。）",
            "有这样的想法，很好。",
            "（她的语气变得认真。）",
            "但你要知道，保护别人不是一件容易的事。",
            "需要力量，需要智慧，也需要勇气。",
            "（她拍了拍你的肩膀。）",
            "老师会帮你的。但路，要你自己走。"
          ],
          mood: "gentle",
          effects: { npcFlags: { knows_player_determination: true } },
          choices: [
            { id: "grateful", text: "谢谢老师，我不会让您失望的", effects: { opinion: 4, trust: 3, exp: 20 }, nextNode: "default" }
          ]
        },
        tangyue_deep_recall_node: {
          id: "tangyue_deep_recall_node",
          texts: [
            "（唐月看到你，露出了温柔的笑容。）",
            "是你啊。",
            "（她的语气里有一种熟悉的亲切感。）",
            "最近怎么样？修炼还顺利吗？"
          ],
          mood: "gentle",
          choices: [
            { id: "good", text: "挺好的，谢谢您之前的开导", condition: { memoryTags: ["player_shared_weariness"] }, effects: { opinion: 3, trust: 2 }, nextNode: "default" },
            { id: "training", text: "一直在努力修炼", effects: { opinion: 2 }, nextNode: "default" },
            { id: "greet", text: "嗯，挺好的", effects: {}, nextNode: "default" }
          ]
        },
        farewell_node: {
          id: "farewell_node",
          texts: [
            "（唐月愣了一下，随即露出微笑，但眼底有一丝不舍。）",
            "要去明珠学府了吗？那是个好地方，比博城大得多。",
            "你是我教过的最有天赋的学生之一。到了那里，不要懈怠。",
            "（她顿了顿，语气变得认真。）",
            "记住我跟你说过的话——有些真相需要实力来承载。到了明珠，小心行事。",
            "如果遇到解决不了的麻烦……可以联系我。",
            "（她递给你一张传讯符。）",
            "去吧，前程似锦。"
          ],
          mood: "gentle",
          effects: {
            giveItem: "tang_yue_message_talisman",
            exp: 100
          },
          choices: [
            { id: "thanks", text: "谢谢老师，我会的", effects: { opinion: 10, trust: 10 }, nextNode: "default" }
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
    
    growth: {
      base: {
        level: 6,
        elements: ["wind"],
        skills: ["basic_attack","wind_blade","wind_speed"],
        title: "资深猎人",
        growthType: "mage",
      },
    },dialogueTree: {
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
    isCombatant: false,
    combatUnknown: true,
    combatNote: "博城篇前期战力未明确展现，待剧情推进后补充",
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
    skills: ["basic_attack", "water_heal", "water_chain"],
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
    
    growth: {
      base: {
        level: 5,
        elements: ["water"],
        skills: ["basic_attack","water_heal"],
        title: "书店老板",
        growthType: "mage",
      },
    },dialogueTree: {
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
              text: "需要帮忙收集书籍吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_bookshop_knowledge" }
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
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst", "earth_shield", "earth_quake", "earth_shift"],
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
    
    growth: {
      base: {
        level: 10,
        elements: ["fire","earth"],
        skills: ["basic_attack","fire_bolt","fire_rain","earth_shield","earth_spike"],
        title: "魔法协会会长",
        growthType: "mage",
      },
    },dialogueTree: {
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
              text: "有协会考核任务吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_magicassociation_test" }
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
    isCombatant: false,
    combatUnknown: true,
    combatNote: "博城篇前期战力未明确展现，待剧情推进后补充",
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
    skills: ["basic_attack", "dark_bolt", "dark_cloak", "dark_curse"],
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
    
    growth: {
      base: {
        level: 8,
        elements: ["dark"],
        skills: ["basic_attack","dark_bolt"],
        title: "流浪法师",
        growthType: "mage",
      },
    },dialogueTree: {
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
              text: "有调查任务吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_mysterious_investigation" }
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
    description: "天澜魔法高中的院长，一位德高望重的老法师，修为深不可测，培养了无数优秀的法师。博城篇前期其实力未明确展现，故不设具体战斗数据。",
    isCombatant: false,
    combatUnknown: true,
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
              text: "唐月老师最近怎么样？",
              next: "about_tang_yue",
              condition: { minOpinion: 20 }
            },
            {
              text: "听说山里不太平",
              next: "demon_warning"
            },
            {
              text: "院长，我要离开博城了",
              next: "farewell",
              condition: { hasFlag: "bocheng_disaster_happened", notNpcFlags: ["said_farewell"] }
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
            "（萧院长打量了你几秒，目光中带着一丝赞许。）",
            "这样吧，雪峰山最近出现了一只战将级的妖魔，伤了好几个猎者。",
            "如果你能独自解决它，我就认可你的实力，给你一份特殊的奖励。",
            "怎么样，敢接下这个挑战吗？",
            "记住，不要逞强。如果觉得不行，随时可以回来。"
          ],
          effects: {
            opinion: 5,
            trust: 5
          },
          choices: [
            {
              text: "我接下了！请院长放心。",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_xiao_principal_trial" }
            },
            {
              text: "我再准备准备",
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
        },
        about_tang_yue: {
          id: "about_tang_yue",
          texts: [
            "唐月？",
            "（萧院长的表情柔和了一些。）",
            "她是个好老师，也是个好法师。对学生很用心。",
            "不过啊，她背负的东西比你们想象的多。",
            "（他顿了顿，语气变得低沉。）",
            "有些事，我不方便多说。你只要知道，她是真心为你们好的。",
            "如果她有什么需要帮忙的，你能帮就帮一把。"
          ],
          mood: "serious",
          effects: {
            trust: 5,
            giveInfo: "xiao_principal_tang_yue_secret"
          },
          choices: [
            {
              text: "我会的，谢谢院长告诉我",
              next: "default"
            }
          ]
        },
        farewell: {
          id: "farewell",
          texts: [
            "要走了？明珠学府？",
            "（萧院长沉默了一会儿，从书架上取下一本旧书递给你。）",
            "这是我年轻时的修炼笔记，或许对你有用。",
            "（他望向窗外，语气变得低沉。）",
            "博城这场灾难... 是我的失职。如果我能早一点发现异常...",
            "（他收回目光，重新看向你，眼神中带着期许。）",
            "你是个有潜力的孩子。到了明珠，好好修炼，不要辜负了自己。",
            "记住，实力越强，责任越大。不要忘了你从哪里来。"
          ],
          mood: "serious",
          effects: {
            giveItem: "xiao_principal_notes",
            exp: 200,
            trust: 10,
            npcFlags: { said_farewell: true }
          },
          choices: [
            {
              text: "院长保重，我不会忘记您的教诲",
              effects: { opinion: 10 },
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
    level: 12,
    levelDisplay: "???",
    levelUnknown: true,
    maxHp: 350,
    maxMp: 200,
    attack: 38,
    defense: 18,
    speed: 15,
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst", "fire_fist"],
    growth: {
      base: {
        level: 12,
        elements: ["fire"],
        skills: ["basic_attack", "fire_bolt"],
        title: "天澜魔法高中班主任",
        growthType: "mage",
      },
      events: [
        {
          after: "bocheng_disaster",
          level: 18,
          addSkills: ["fire_rain"],
          title: "火系中阶法师",
        }
      ]
    },
    spriteColor: "#ff6633",
    isNPC: true,
    location: "tianlan_school",
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
              text: "年度考核是怎样的？",
              next: "annual_exam_info"
            },
            {
              text: "我会好好准备的",
              next: "default"
            }
          ]
        },
        annual_exam_info: {
          id: "annual_exam_info",
          texts: [
            "年度考核啊……这是学校最重要的考核，每年一次，所有新生都要参加。",
            "考核分两项：第一项是星感石测试，每人三次机会取最好成绩，测试你对元素的感知能力。",
            "第二项是魔法释放考核，只有星感石B级以上的同学才能参加，测试你实际运用魔法的能力。",
            "年度考核的成绩直接关系到你的分班和未来的资源分配，穆宁雪去年就是年度考核第一名，直接进了尖子班。",
            "今年的年度考核快到了，你要好好准备，争取考个好成绩。",
            "对了，今年穆氏家族的穆宁雪也会来观看考核，到时候全校都会关注，你可别给我丢脸。"
          ],
          effects: {
            opinion: 2,
            familiarity: 3,
            exp: 15,
            giveInfo: "annual_exam_info_1"
          },
          choices: [
            {
              text: "星感石测试有什么技巧吗？",
              next: "star_sense_tips"
            },
            {
              text: "我会努力的，老师！",
              next: "default"
            }
          ]
        },
        star_sense_tips: {
          id: "star_sense_tips",
          texts: [
            "星感石测试的技巧？嗯……其实也没什么特别的技巧，主要是看你平时对元素的感知积累。",
            "你注意到训练场前端那块星感石了吗？它看上去有点像黑色的鹅卵石，西瓜那么大，被石墩托着。",
            "不过，有一点要注意：测试时不要紧张，放松心态，用心去感受周围的元素流动。",
            "星感石会根据你星尘光辉的强弱印射出一样的光芒，考官通过光芒亮度来评级，从F到SSS不等。",
            "一般来说，初阶法师能达到C级就不错了，B级就算优秀，A级是天才级别，S级以上就是凤毛麟角了。",
            "穆宁雪去年就是S级，全校震惊，穆氏家族直接给了她大量资源。",
            "你也别给自己太大压力，尽力就好，老师相信你。"
          ],
          effects: {
            opinion: 3,
            familiarity: 5,
            exp: 25
          },
          choices: [
            {
              text: "谢谢老师，我会尽力的！",
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
              text: "老师，我可以帮忙调查吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_tangyue_mountain_investigation" }
            },
            {
              text: "我知道了，谢谢老师提醒",
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
    talents: [
      {
        id: "water_healing_talent",
        name: "水系治疗天赋",
        type: "innate",
        description: "性格温柔善良，乐于助人，水系治疗魔法很有天赋，治疗效果提升。",
        effects: { waterHealBonus: 0.15 }
      }
    ],
    spriteColor: "#3399ff",
    isNPC: true,
    location: "tianlan_school",
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
    
    growth: {
      growthRate: 70,
      base: {
        level: 2,
        elements: ["water"],
        skills: ["basic_attack","water_heal"],
        title: "天澜魔法高中学生",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 5,
          addSkills: ["water_heal"],
          title: "天澜魔法高中学生",
        },
        {
          after: "xuefeng_training",
          level: 8,
          addSkills: ["water_wave"],
          title: "天澜魔法高中学生",
        },
        {
          after: "bocheng_disaster",
          level: 10,
          addSkills: ["water_shield"],
          title: "水系法师",
        }
      ],
    },dialogueTree: {
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
              text: "需要我帮忙采集草药吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_he_yu_healing_practice" },
              condition: { notHasQuest: "quest_he_yu_healing_practice" }
            },
            {
              text: "能帮我治疗一下吗？",
              next: "heal_player",
              condition: {
                minOpinion: 20
              }
            },
            {
              text: "有互助任务吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_heyu_mutual_help" }
            },
            {
              id: "after_training_heyu",
              text: "雪峰山历练辛苦了",
              condition: {
                hasFlag: "xuefeng_training_completed"
              },
              next: "after_training"
            },
            {
              id: "after_disaster_heyu",
              text: "你还好吗？博城灾难...",
              condition: {
                hasFlag: "bocheng_disaster_happened"
              },
              next: "after_disaster"
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
          oneTime: true,
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
          oneTime: true,
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
          oneTime: true,
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
        },
        after_training: {
          id: "after_training",
          oneTime: true,
          texts: [
            "雪峰山历练... 现在想起来还有点后怕呢。",
            "洞窟里那么黑，妖魔突然冲出来的时候，我吓得手都在抖。",
            "不过我没有哭哦！我用治疗魔法帮了好几个受伤的同学，唐月老师还夸我了呢！",
            "虽然我攻击力不强，但能保护大家，我觉得很开心。",
            "说起来，你在历练中表现得好勇敢啊，我都看到了。"
          ],
          mood: "gentle",
          effects: {
            opinion: 5,
            trust: 3,
            familiarity: 5,
            exp: 20
          },
          choices: [
            {
              text: "你也很勇敢",
              effects: { opinion: 3 },
              next: "default"
            },
            {
              text: "以后一起修炼",
              effects: { opinion: 2, trust: 2 },
              next: "default"
            }
          ]
        },
        after_disaster: {
          id: "after_disaster",
          oneTime: true,
          texts: [
            "（何雨的眼睛红红的，手上还缠着绷带，但她努力笑着。）",
            "博城灾难... 我这辈子都忘不了。那天到处都是伤员，我根本停不下来。",
            "我的魔力耗尽了好几次，但一想到还有人在等着我治疗，我就咬着牙继续。",
            "（她低下头，声音有点哽咽。）",
            "有些人... 我没能救回来。但我知道，我已经尽力了。",
            "（她抬起头，眼神很坚定。）",
            "我要变得更强，强到下次再遇到这种事，我能救更多的人。治疗师的力量，也是可以保护大家的。"
          ],
          mood: "emotional",
          effects: {
            opinion: 10,
            trust: 8,
            familiarity: 10,
            exp: 50
          },
          choices: [
            {
              text: "你已经救了很多人了",
              effects: { opinion: 5, trust: 3 },
              next: "default"
            },
            {
              text: "我们一起变强",
              effects: { opinion: 5, trust: 5 },
              next: "default"
            }
          ]
        }
      }
    }
  },
  hunter_receptionist: {
    id: "hunter_receptionist",
    name: "小雨",
    isCombatant: false,
    combatUnknown: true,
    combatNote: "博城篇前期战力未明确展现，待剧情推进后补充",
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
    skills: ["basic_attack", "water_heal", "water_chain"],
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
    
    growth: {
      base: {
        level: 5,
        elements: ["water"],
        skills: ["basic_attack","water_heal"],
        title: "猎魔者公会接待员",
        growthType: "mage",
      },
    },dialogueTree: {
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
    isCombatant: false,
    combatUnknown: true,
    combatNote: "博城篇前期战力未明确展现，待剧情推进后补充",
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
    skills: ["basic_attack", "ice_spike", "ice_frost", "ice_storm"],
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
    
    growth: {
      base: {
        level: 10,
        elements: ["ice"],
        skills: ["basic_attack","ice_spike","ice_shield"],
        title: "穆家管家",
        growthType: "mage",
      },
    },dialogueTree: {
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
      { trigger: "default", text: "你来了。今天修炼还顺利吗？" },
      { trigger: "low_stamina", text: "你看起来很累了，要好好休息呀。" }
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
          texts: ["你来了。", "今天修炼还顺利吗？要注意身体哦。"],
          choices: [
            { text: "心夏，最近有人欺负你吗？", next: "about_bullies" },
            { text: "姑姑身体还好吗？", next: "about_aunt" },
            { text: "你最近在研究什么？", next: "about_research" },
            { text: "有什么我能帮忙的吗？", next: "about_help" },
            { text: "我先走了，好好休息。", next: "default", action: "back" }
          ]
        },
        about_bullies: {
          id: "about_bullies",
          texts: ["没...没有的，你不要担心。", "你已经帮我赶走那些坏人了，他们不敢再来了。"],
          effects: { opinion: 3, trust: 5 },
          choices: [{ text: "有事一定要告诉我。", next: "default", action: "back" }]
        },
        about_aunt: {
          id: "about_aunt",
          texts: ["姑姑身体还是老样子，在医院后勤部工作。", "她总是念叨让你好好学习，成为初阶魔法师就光宗耀祖了。"],
          effects: { familiarity: 3 },
          choices: [{ text: "我会努力的。", next: "default", action: "back" }]
        },
        about_research: {
          id: "about_research",
          texts: ["我在看一些药剂学的书...", "虽然我不能修炼，但我想以自己的方式帮助大家。", "哥哥总是一个人承担太多，我想替他分担一些。"],
          effects: { opinion: 3, trust: 3 },
          choices: [{ text: "你一定可以的", next: "default", action: "back" }]
        },
        about_help: {
          id: "about_help",
          texts: ["（心夏眼睛亮了一下）真的吗？", "我...我在研究一些药剂，想帮哥哥减轻负担。", "但是我腿脚不方便，没法去野外采集草药..."],
          choices: [
            { text: "我帮你采集草药", next: "default", action: "start_quest", actionData: { questId: "quest_yexinxia_herbs" } },
            { text: "研究药剂很厉害", next: "default", action: "back" }
          ]
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
            {
              id: "ask_security",
              text: "最近学校安全吗？我听说山里不太平",
              condition: { minOpinion: 15, notNpcFlags: ["asked_security"] },
              effects: { npcFlags: { asked_security: true } },
              next: "about_security"
            },
            {
              id: "saw_stranger",
              text: "那天看到您和一个穿灰衣的人说话...",
              condition: { minOpinion: 25, hasFlag: "saw_mu_he_stranger", notNpcFlags: ["confronted_mu_he"] },
              effects: { opinion: -10, npcFlags: { confronted_mu_he: true } },
              next: "mu_he_stranger"
            },
            { text: "告辞。", next: null, action: "close" }
          ]
        },
        about_exam: {
          id: "about_exam",
          texts: ["年度考核是公正的，不合格的学生自然会被请离学校。", "学校资源有限，必须留给有天赋的学生。"],
          effects: { opinion: -2 },
          choices: [{ text: "我明白了。", next: "default" }]
        },
        about_ningxue: {
          id: "about_ningxue",
          texts: ["宁雪是我们穆氏的骄傲，博城的旗帜。", "她今天会来观看年度考核，你们好好表现。"],
          effects: { familiarity: 2 },
          choices: [{ text: "多谢告知。", next: "default" }]
        },
        about_security: {
          id: "about_security",
          texts: [
            "（他眼睛一亮，但很快恢复了常态。）",
            "安全？哼，学校的防御法阵是穆氏出资修建的，固若金汤。",
            "不过……你倒是提醒了我。最近确实有些不安分的东西在附近游荡。",
            "（他似乎在自言自语）结界的节点……嗯，我会让人检查的。"
          ],
          mood: "thoughtful",
          effects: { giveInfo: "mu_he_interest_defense", opinion: 1 },
          choices: [
            { text: "那就好", next: "default" }
          ]
        },
        mu_he_stranger: {
          id: "mu_he_stranger",
          texts: [
            "（他的表情瞬间冷了下来，但随即哈哈大笑。）",
            "灰衣人？你看错了吧。学校里人来人往的，我每天要见多少人。",
            "（他拍了拍你的肩膀，力道大得有些不自然。）",
            "年轻人，想象力丰富是好事。但有些事……不要乱说，免得惹祸上身。",
            "（他的眼神变得锐利，和平时那个市侩的校董判若两人。）"
          ],
          mood: "threatening",
          effects: { giveInfo: "mu_he_warning" },
          choices: [
            { text: "我会调查清楚的", next: "default", action: "start_quest", actionData: { questId: "quest_muhe_black_church" } },
            { text: "……我记错了", effects: { opinion: -5 }, next: "default" },
            { text: "我不会乱说的", effects: { trust: 2 }, next: "default" }
          ]
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
    talents: [
      {
        id: "fire_talent_outstanding",
        name: "火系天赋出众",
        type: "innate",
        description: "火系天赋很好的女孩，性格好强不服输，火系魔法威力提升。",
        effects: { fireDamageBonus: 0.1 }
      }
    ],
    growth: {
      events: [
        {
          after: "annual_exam",
          level: 6,
          addSkills: ["fire_burst"],
          title: "火系尖子生",
        },
        {
          after: "xuefeng_training",
          level: 8,
          addSkills: ["fire_fist"],
          title: "火系尖子生",
        },
        {
          after: "bocheng_disaster",
          level: 11,
          addSkills: ["fire_fist"],
          title: "火系中阶法师",
        }
      ]
    },
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
    
    growth: {
      growthRate: 65,
      base: {
        level: 2,
        elements: ["fire"],
        skills: ["basic_attack","fire_bolt"],
        title: "火系尖子生",
        growthType: "mage",
      },
    },dialogueTree: {
      npcId: "zhou_min",
      nodes: {
        default: {
          id: "default",
          texts: ["你就是莫凡？", "明明火系天赋很好，却那么不用功，真浪费。"],
          choices: [
            { text: "唐月老师的课讲得真好。", next: "about_tangyue" },
            { text: "年度考核你准备得怎么样？", next: "about_exam" },
            { text: "我会证明给你看的。", next: "prove" },
            {
              text: "听说东郊废弃工地有妖魔出没？",
              next: "about_city_hunt",
              condition: { minLevel: 5, notFlags: ["city_hunt_one_eye_completed"] }
            },
            {
              text: "东郊那只独眼魔狼，是你发现的？",
              next: "after_city_hunt",
              condition: { hasFlags: ["city_hunt_one_eye_completed"] }
            }
          ]
        },
        about_tangyue: {
          id: "about_tangyue",
          oneTime: true,
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
          choices: [
            { text: "不如现在就比修炼？", next: "default", action: "start_quest", actionData: { questId: "quest_zhoumin_contest" } },
            { text: "一定。", next: "default", action: "back" }
          ]
        },
        about_city_hunt: {
          id: "about_city_hunt",
          oneTime: true,
          texts: [
            "你也听说了？最近东郊那边不太太平，有好几个流浪汉失踪了。",
            "我总觉得那里有什么东西...但猎魔者公会说只是普通的人口失踪。",
            "如果你要去调查，小心点。那种地方，谁知道藏着什么。"
          ],
          effects: { opinion: 2, familiarity: 3 },
          choices: [
            { text: "我会去看看的。", next: "default", action: "back" },
            { text: "要不要一起去？", next: "city_hunt_invite" }
          ]
        },
        city_hunt_invite: {
          id: "city_hunt_invite",
          oneTime: true,
          texts: [
            "一起去？...你认真的？",
            "哼，本小姐可是火系尖子生，有我在你安全多了。",
            "不过...那种地方真的有点吓人。你确定要去？",
            "（周敏虽然嘴上强硬，但手不自觉地攥紧了衣角）"
          ],
          effects: { opinion: 3, familiarity: 5 },
          choices: [
            { text: "放心，我会保护你的。", next: "default", effects: { opinion: 5 } },
            { text: "那算了，我自己去。", next: "default", effects: { opinion: -2 } }
          ]
        },
        after_city_hunt: {
          id: "after_city_hunt",
          oneTime: true,
          texts: [
            "你...你真的去了东郊工地？",
            "独眼魔狼...那种凶残的妖魔，你一个人就解决了？",
            "（周敏看你的眼神变了，不再是之前的轻蔑，而是...惊讶和一丝佩服）",
            "看来我之前确实小看你了。对不起。"
          ],
          effects: { opinion: 10, trust: 5, familiarity: 10 },
          choices: [
            { text: "没什么，只是运气好。", next: "default", effects: { opinion: 3 } },
            { text: "现在你知道我不是废物了吧？", next: "default", effects: { opinion: 1 } },
            { text: "下次遇到这种事，记得先通知猎妖队。", next: "default", effects: { opinion: 2, trust: 3 } }
          ]
        }
      }
    }
  },
  xu_zhaoting: {
    id: "xu_zhaoting",
    name: "许昭霆",
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
    talents: [
      {
        id: "thunder_talent_outstanding",
        name: "雷系天赋出众",
        type: "innate",
        description: "雷系天赋很高，被张建国老师炫耀为得意门生，雷系魔法威力提升。",
        effects: { thunderDamageBonus: 0.1 }
      }
    ],
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
    
    growth: {
      growthRate: 55,
      base: {
        level: 2,
        elements: ["thunder"],
        skills: ["basic_attack","thunder_bolt"],
        title: "七班雷系学神",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 7,
          addSkills: ["thunder_burst"],
          title: "天澜魔法高中学生",
        },
        {
          after: "xuefeng_training",
          level: 9,
          addSkills: ["thunder_bolt"],
          title: "天澜魔法高中学生",
        },
        {
          after: "bocheng_disaster",
          level: 12,
          addElements: ["wind"],
          addSkills: ["wind_blade", "wind_track_phantom"],
          title: "博城幸存者",
          location: "mingzhu_qing_campus",
          description: "博城灾难中失去全家的幸存者，雷系+风系双系中阶法师。对黑教廷恨之入骨，性格刚烈勇敢。与张璐璐是情侣。",
        }
      ],
    },dialogueTree: {
      npcId: "xu_zhaoting",
      nodes: {
        default: {
          id: "default",
          texts: ["你是八班的？", "找我有什么事？"],
          choices: [
            { id: "ask_thunder", text: "听说你雷系很强？", nextNode: "about_thunder", condition: { notHasFlag: "bocheng_disaster_happened" } },
            { id: "duel", text: "来切磋一下？", nextNode: "default", action: "start_quest", actionData: { questId: "quest_xuzhaoting_thunder_duel" }, condition: { notHasFlag: "bocheng_disaster_happened" } },
            { id: "exam_cheer", text: "年度考核加油。", nextNode: "default", action: "back", condition: { notHasFlag: "bocheng_disaster_happened" } },
            { id: "greeting_survivor", text: "昭霆，好久不见。", nextNode: "default_survivor", condition: { hasFlag: "bocheng_disaster_happened" } },
            { id: "leave", text: "告辞。", nextNode: null }
          ]
        },
        default_survivor: {
          id: "default_survivor",
          texts: [
            "你也来明珠了？太好了，博城出来的就我们几个了。",
            "黑教廷……我绝不会放过他们。我全家都死在博城灾难里。",
            "我现在是雷风双系，虽然比不了你那个变态双系，但杀黑教廷绰绰有余。"
          ],
          mood: "determined",
          choices: [
            { id: "ask_bocheng", text: "博城那天你也在？", nextNode: "about_bocheng" },
            { id: "ask_lulu", text: "张璐璐是谁？", condition: { minOpinion: 20 }, nextNode: "about_lulu" },
            { id: "ask_black_church", text: "你在追查黑教廷？", condition: { minOpinion: 30, minTrust: 20 }, nextNode: "about_black_church" },
            { id: "train_together", text: "一起修炼？", condition: { minOpinion: 40 }, effects: { exp: 50 }, nextNode: "training_together" },
            { id: "give_gift", text: "我有东西给你", action: "open_gift" },
            { id: "leave", text: "保重", nextNode: null }
          ]
        },
        about_thunder: {
          id: "about_thunder",
          texts: ["雷系是初阶元素系之首，优势很大。", "不过修炼也很难，星子太活跃了。"],
          effects: { familiarity: 2 },
          choices: [{ id: "back", text: "受教了。", nextNode: "default", action: "back" }]
        },
        about_bocheng: {
          id: "about_bocheng",
          oneTime: true,
          texts: [
            "我怎么会忘……那天晚上，我亲眼看着我爸妈被妖魔撕碎。",
            "我拼了命才逃出来。后来才知道，那场灾难不是天灾——是黑教廷搞的鬼。",
            "他们用妖母引动了整个雪峰山的妖魔潮。博城……只是他们计划的一部分。"
          ],
          effects: { giveInfo: "bocheng_disaster_truth" },
          choices: [
            { id: "back", text: "……我会让他们付出代价", effects: { opinion: 5, trust: 5 }, nextNode: "default_survivor" }
          ]
        },
        about_lulu: {
          id: "about_lulu",
          oneTime: true,
          texts: [
            "张璐璐……我女朋友。水系的，比我小一届。",
            "她也是博城出来的，但她比我幸运——家人都还在。",
            "我答应过她，等我杀够了黑教廷的人，就好好陪她。"
          ],
          mood: "soft",
          choices: [
            { id: "back", text: "祝你们好", effects: { opinion: 3 }, nextNode: "default_survivor" }
          ]
        },
        about_black_church: {
          id: "about_black_church",
          oneTime: true,
          texts: [
            "我一直在暗中查。黑教廷在明珠有眼线，而且不止一个。",
            "我发现有个灰衣人经常在学校附近出没，像是在联络什么人。",
            "你也要小心。博城那场灾难的参与者，有些可能就混在明珠。"
          ],
          effects: { giveInfo: "black_church_in_mingzhu" },
          choices: [
            { id: "back", text: "你也是，别一个人冒险", effects: { trust: 10, opinion: 5 }, nextNode: "default_survivor" }
          ]
        },
        training_together: {
          id: "training_together",
          texts: [
            "好！雷系星图我已经摸到门道了，中阶魔法霹雳·轰顶威力确实大。",
            "不过你的雷系比我强多了……有空教教我？"
          ],
          choices: [
            { id: "back", text: "随时可以", effects: { opinion: 5 }, nextNode: "default_survivor" }
          ]
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
            { text: "需要我帮忙送物资吗？", next: "default", action: "start_quest", actionData: { questId: "quest_moqing_deliver_supplies" } },
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
            { text: "离叶心夏远点。", next: "warn" },
            { text: "再骚扰她我就不客气了", next: "default", action: "start_quest", actionData: { questId: "quest_xubing_teach_lesson" } }
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
        elements: ["ice"],
level: 18,
    levelDisplay: "???",
    levelUnknown: true,
    personality: ["威严", "势利", "爱才", "控制欲强"],
    baseStats: { hp: 800, mp: 500, attack: 120, defense: 80, speed: 60 },
    skills: ["basic_attack", "ice_spike", "ice_frost", "ice_storm", "ice_lock"],
    talents: [
          {
                "name": "冰系修为深厚",
                "type": "acquired",
                "element": "ice",
                "description": "穆氏族长，多年修炼冰系魔法，修为深厚，掌握冰系高阶魔法冰风暴。"
          }
    ],
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
    growth: {
      base: {
        level: 18,
        elements: ["ice"],
        skills: ["ice_shield","ice_storm"],
        title: "穆氏族长",
        growthType: "mage",
      },
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
            { text: "我想获得穆氏的认可", next: "default", action: "start_quest", actionData: { questId: "quest_muzhuoyun_recognition" } },
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
  zhan_kong: {
    id: "zhan_kong",
    name: "斩空",
    title: "雪峰山驿站总教官",
    description: "雪峰山驿站总教官，胡渣大叔，火系强者，驿站屠妖魔数最高的人。性格散漫又严厉，军法师出身，与妖魔厮杀后的气息让学生不敢造次。天澜高中历练的总教官，给出了'完成悬赏否则全部不合格'的不可能任务。",
    avatar: "assets/images/characters/zhan_kong.jpg",
    location: "xuefeng_station",
    element: "fire",
        elements: ["fire"],
level: 15,
    levelDisplay: "???",
    levelUnknown: true,
    personality: ["严厉", "散漫", "实战派", "护短", "毒舌"],
    baseStats: { hp: 600, mp: 350, attack: 90, defense: 60, speed: 50 },
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst", "fire_fist", "fire_fist_nine"],
    talents: [
          {
                "name": "火系军法师",
                "type": "acquired",
                "element": "fire",
                "description": "雪峰山驿站总教官，军方高层，火系魔法经过战场淬炼，威力强大，实战经验丰富。"
          }
    ],
    faction: "military",
    factionRank: "总教官",
    relationships: {
      deng_kai: { opinion: 70, trust: 65, type: "friend", label: "老友" },
      luo_yunbo: { opinion: 80, trust: 75, type: "subordinate", label: "下属" },
      pan_lijun: { opinion: 75, trust: 70, type: "subordinate", label: "下属" }
    },
    growth: {
      base: {
        level: 15,
        elements: ["fire"],
        skills: ["basic_attack","fire_bolt","fire_rain","fire_burst"],
        title: "雪峰山驿站总教官",
        growthType: "mage",
      },
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
            { text: "请教战斗经验", next: "about_battle", condition: { minOpinion: 15 } },
            { text: "教官怎么看纪律？", next: "about_discipline", condition: { minOpinion: 10 } },
            { text: "唐月老师和您很熟吗？", next: "about_tang_yue", condition: { minOpinion: 30, minTrust: 20 } },
            {
              id: "ask_anomaly",
              text: "教官，最近山里的妖魔是不是不太对劲？",
              condition: { minOpinion: 20, minTrust: 15, hasFlag: "witnessed_demon_migration" },
              effects: {},
              next: "about_anomaly"
            },
            {
              id: "farewell_zhan",
              text: "斩空教官，我要离开博城了",
              condition: { hasFlag: "bocheng_disaster_happened", notNpcFlags: ["said_farewell"] },
              effects: { npcFlags: { said_farewell: true } },
              next: "farewell_node"
            },
            // v1.3.1: 真相追寻者结局 - 黑教廷话题
            {
              id: "ask_black_church",
              text: "教官，关于那晚宇昂的事...",
              condition: { hasFlag: "black_church_aware", minOpinion: 30 },
              next: "about_black_church"
            },
            // v1.3.1: 军方盟友结局 - 军方任务入口
            {
              id: "ask_military_task",
              text: "教官，您之前说有事可以找您",
              condition: { hasFlag: "military_ally", minOpinion: 20 },
              next: "about_military_task"
            },
            { text: "告辞。", next: null, action: "close" }
          ]
        },
        about_training: {
          id: "about_training",
          texts: ["历练？哼，你们这群温室里的花朵。", "完成悬赏就全部A，完不成就全部不合格。", "别觉得我苛刻，野外的妖魔可不会跟你讲道理。"],
          effects: { familiarity: 3 },
          choices: [{ text: "我们会完成的。", next: "default" }]
        },
        about_demon: {
          id: "about_demon",
          texts: ["多少？记不清了。", "奴仆级的蝼蚁不算数，战将级的倒是有几十只。", "年轻人，想杀妖魔，先活下来再说。"],
          effects: { opinion: 2 },
          choices: [{ text: "受教了。", next: "default" }]
        },
        about_battle: {
          id: "about_battle",
          texts: [
            "（斩空看了你一眼，似乎在评估你的实力。）",
            "战斗经验？记住三点。",
            "第一，永远不要低估你的对手。妖魔比你想象的聪明。",
            "第二，学会观察。战斗前先看环境，哪里能退，哪里能藏。",
            "第三，该跑就跑。活着回来，比什么都重要。",
            "（他顿了顿，语气缓和了一些。）",
            "你们这些学生，总觉得逃跑是丢脸。在战场上，活着就是胜利。"
          ],
          mood: "serious",
          effects: { opinion: 3, exp: 20, giveInfo: "zhan_kong_battle_advice" },
          choices: [
            { text: "明白了，谢谢教官", effects: { trust: 2 }, next: "default" }
          ]
        },
        about_discipline: {
          id: "about_discipline",
          texts: [
            "纪律？",
            "（斩空冷哼一声。）",
            "纪律不是给你们这些学生听的口号。",
            "在军队里，违反纪律的人，会死。而且会连累队友一起死。",
            "我见过太多年轻人，觉得自己天赋好，就不把规矩当回事。",
            "结果呢？坟头草都三尺高了。",
            "（他的目光变得锐利。）",
            "你要记住，实力再强，没有纪律，就是个莽夫。莽夫活不长。"
          ],
          mood: "serious",
          effects: { opinion: 2, familiarity: 3 },
          choices: [
            { text: "我记住了", effects: {}, next: "default" },
            { text: "但有时候也需要变通吧？", next: "discipline_debate" }
          ]
        },
        discipline_debate: {
          id: "discipline_debate",
          texts: [
            "变通？",
            "（斩空盯着你看了几秒，忽然笑了。）",
            "有意思。你是第一个敢跟我顶嘴的学生。",
            "你说得对，战场瞬息万变，死守规矩确实不行。",
            "但——",
            "（他的表情又严肃起来。）",
            "变通的前提，是你懂规矩。不懂规矩就谈变通，那叫乱来。",
            "先把基础打牢，再想怎么变通。明白吗？"
          ],
          mood: "serious",
          effects: { opinion: 5, trust: 3 },
          choices: [
            { text: "我想证明给你看", next: "default", action: "start_quest", actionData: { questId: "quest_zhankong_discipline" } },
            { text: "明白，先守规矩再变通", effects: {}, next: "default" }
          ]
        },
        about_tang_yue: {
          id: "about_tang_yue",
          texts: [
            "（斩空的动作明显顿了一下。）",
            "唐月？",
            "（他沉默了一会儿，望向窗外。）",
            "她是个好老师。也是个……好法师。",
            "（他的语气变得低沉。）",
            "她背负的东西，比你们想象的多。",
            "别问太多。有些事，知道了反而危险。",
            "（他收回目光，恢复了平时的严厉。）",
            "你只要知道，她不会害你们。就行了。"
          ],
          mood: "serious",
          effects: { trust: 5, giveInfo: "zhan_kong_tang_yue_secret" },
          choices: [
            { text: "我不多问了", effects: {}, next: "default" }
          ]
        },
        about_anomaly: {
          id: "about_anomaly",
          texts: [
            "（斩空的动作顿了一下，抬眼看你。）",
            "……你也看到了？",
            "（他沉默了片刻，望向雪峰山深处的方向。）",
            "我在这山里待了三年，从来没见过这种事。妖魔在迁徙，不是为了觅食，是在逃。",
            "它们在逃什么……我也不知道。但我已经上报了。",
            "（他收回目光，语气变得严厉。）",
            "这件事不要对其他学生说，免得引起恐慌。你自己也小心，别往深处走。",
            "……有些东西，不是你们现在能应付的。"
          ],
          mood: "serious",
          effects: { trust: 5, giveInfo: "zhan_kong_knows_anomaly" },
          choices: [
            { id: "back", text: "我明白了", effects: {}, next: "default" }
          ]
        },
        farewell_node: {
          id: "farewell_node",
          texts: [
            "（斩空放下手中的酒壶，看了你一眼。）",
            "要走了？明珠学府？",
            "（他沉默了一会儿，从怀里摸出一个东西扔给你——是一枚军牌。）",
            "拿着。到了明珠，去猎者联盟分会出示这个，会有人帮你。",
            "（他站起身，望向远方，语气变得低沉。）",
            "小子，你比那些学生强。但明珠不比博城，那里水很深。",
            "有些人……表面上人模狗样，背地里比妖魔还脏。",
            "（他顿了顿，似乎想说什么，但最终只是挥了挥手。）",
            "去吧。别死在外面。"
          ],
          mood: "serious",
          effects: {
            giveItem: "zhan_kong_token",
            exp: 150,
            trust: 10
          },
          choices: [
            { id: "thanks", text: "斩空教官，保重", effects: { opinion: 10 }, next: "default" }
          ]
        },
        // v1.3.1: 真相追寻者结局 - 黑教廷话题
        about_black_church: {
          id: "about_black_church",
          texts: [
            "（斩空的手猛地握紧了酒壶，指节发白。）",
            "……你还记着那件事。",
            "（他沉默了很久，周围的空气仿佛都凝固了。）",
            "我知道你想问什么。但有些事，知道得越多，危险越大。",
            "（他看向你，眼神锐利如刀。）",
            "宇昂的事，军方已经在查了。黑教廷……不是你现在能碰的。",
            "但你既然发现了，我也不瞒你。那个徽章，收好。以后如果遇到穿灰衣的人，离他们远点。",
            "（他的语气缓和了一些。）",
            "你做得对。但记住，有些真相，需要等你足够强了才能去面对。"
          ],
          mood: "serious",
          effects: { trust: 10, exp: 50, giveInfo: "zhankong_black_church_warning" },
          choices: [
            { text: "我明白了，教官", effects: { opinion: 5 }, next: "default" },
            { text: "如果我以后想查呢？", next: "about_black_church_future" }
          ]
        },
        about_black_church_future: {
          id: "about_black_church_future",
          texts: [
            "（斩空盯着你看了几秒，忽然笑了。）",
            "年轻人，有冲劲是好事。但别送死。",
            "等你到了中阶，再来找我。到时候，我可能有任务给你。",
            "（他拍了拍你的肩膀。）",
            "黑教廷的事，不是一个人能解决的。你需要伙伴，需要实力，还需要……运气。"
          ],
          mood: "serious",
          effects: { trust: 5, flags: { black_church_future_task: true } },
          choices: [
            { text: "我会变强的", effects: { opinion: 5 }, next: "default" }
          ]
        },
        // v1.3.1: 军方盟友结局 - 军方任务入口
        about_military_task: {
          id: "about_military_task",
          texts: [
            "（斩空挑了挑眉。）",
            "哦？这么快就有事找我了？",
            "（他放下酒壶，认真地看着你。）",
            "博城灾难后，军方缺人。尤其是像你这样……有实战经验的学生。",
            "雪峰山驿站最近有个悬赏任务，清剿残留的妖魔。有兴趣吗？",
            "（他从怀里掏出一张通缉令。）",
            "报酬不错，还能累计军功。军功够了，以后军方的资源随你用。"
          ],
          mood: "neutral",
          effects: { trust: 5 },
          choices: [
            { text: "听起来不错，我考虑一下", effects: { opinion: 3 }, next: "default" },
            { text: "现在有具体任务吗？", next: "about_military_task_detail" }
          ]
        },
        about_military_task_detail: {
          id: "about_military_task_detail",
          texts: [
            "（斩空想了想。）",
            "暂时没有适合你的。你现在的实力，去了也是送死。",
            "（他冷哼一声。）",
            "等你到了中阶，再来找我。到时候有个大任务给你。",
            "（他拍了拍你的肩膀。）",
            "现在嘛……先把基础打牢。博城的事，只是开始。"
          ],
          mood: "serious",
          effects: { trust: 5, exp: 30, flags: { military_future_task: true } },
          choices: [
            { text: "我会努力的", effects: { opinion: 3 }, next: "default" }
          ]
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
        elements: ["earth"],
level: 9,
    personality: ["稳重", "经验丰富", "负责", "黝黑英俊"],
    baseStats: { hp: 350, mp: 200, attack: 45, defense: 40, speed: 20 },
    skills: ["basic_attack", "earth_shield", "earth_quake", "earth_shift"],
    talents: [
      {
        id: "earth_wilderness_experience",
        name: "土系野外生存经验",
        type: "acquired",
        description: "长期在雪峰山野外带领学生历练，土系魔法在野外环境中运用更加熟练。",
        effects: { earthDamageBonus: 0.1 }
      }
    ],
    faction: "hunter_alliance",
    factionRank: "小队长",
    relationships: {
      zhan_kong: { opinion: 85, trust: 80, type: "superior", label: "上司" },
      pan_lijun: { opinion: 70, trust: 65, type: "colleague", label: "同事" }
    },
    growth: {
      base: {
        level: 9,
        elements: ["earth"],
        skills: ["basic_attack","earth_shield","earth_spike"],
        title: "猎者小队队长",
        growthType: "mage",
      },
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
          choices: [
            { text: "有调查任务吗？我想帮忙", next: "default", action: "start_quest", actionData: { questId: "quest_luoyunbo_demon_investigation" } },
            { text: "多谢提醒。", next: "default", action: "back" }
          ]
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
        elements: ["wind"],
level: 8,
    personality: ["干练", "严格", "精悍", "崇拜强者"],
    baseStats: { hp: 280, mp: 180, attack: 38, defense: 25, speed: 35 },
    skills: ["basic_attack", "wind_blade", "wind_speed", "wind_tornado"],
    talents: [
      {
        id: "wind_strict_training",
        name: "风系严格训练",
        type: "acquired",
        description: "对学生要求严格，自身风系魔法训练也一丝不苟，风系攻击技能威力提升。",
        effects: { windDamageBonus: 0.1 }
      }
    ],
    faction: "hunter_alliance",
    factionRank: "副教官",
    relationships: {
      zhan_kong: { opinion: 90, trust: 80, type: "idol", label: "崇拜的总教官" },
      luo_yunbo: { opinion: 65, trust: 60, type: "colleague", label: "同事" }
    },
    growth: {
      base: {
        level: 8,
        elements: ["wind"],
        skills: ["basic_attack","wind_blade","wind_speed"],
        title: "女副教官",
        growthType: "mage",
      },
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
          choices: [
            { text: "斩空教官有训练任务给我吗？", next: "default", action: "start_quest", actionData: { questId: "quest_panlijun_military_training" } },
            { text: "确实令人敬佩。", next: "default", action: "back" }
          ]
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
    element: "earth",
        elements: ["earth"],
level: 2,
    personality: ["口无遮拦", "胆小", "爱抱怨", "体型偏胖"],
    baseStats: { hp: 80, mp: 55, attack: 8, defense: 8, speed: 6 },
    skills: ["basic_attack", "earth_shield"],
    talents: [],
    relationships: {},
    growth: {
      growthRate: 80,
      base: {
        level: 2,
        elements: ["earth"],
        skills: ["basic_attack","earth_shift"],
        title: "天澜高中学生",
        growthType: "mage",
      },
    },
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
          texts: [
            "听说历练要去雪峰山，那边有妖魔啊，怕不怕？",
            "马上就要去雪峰山历练了，我心里有点慌...",
            "你说山里的妖魔会不会很厉害啊？我可不想出事。"
          ],
          choices: [
            { text: "不怕，正好历练。", next: "brave" },
            { text: "有点担心...", next: "scared" },
            {
              text: "雪峰山历练怎么样？",
              next: "after_training",
              condition: { hasFlags: ["xuefeng_training_completed"] }
            },
            {
              text: "博城灾难那天你还好吗？",
              next: "after_disaster",
              condition: { hasFlags: ["bocheng_disaster_happened"] }
            },
            {
              text: "需要我帮忙收集魔法石吗？",
              next: "default",
              action: "start_quest",
              actionData: { questId: "quest_wang_sanpang_earth_training" },
              condition: { notHasQuest: "quest_wang_sanpang_earth_training" }
            },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        brave: {
          id: "brave",
          texts: ["厉害厉害！", "到时候跟着你混了啊！"],
          effects: { opinion: 5 },
          choices: [
            { text: "那我们一起去历练？", next: "default", action: "start_quest", actionData: { questId: "quest_wangsanpang_expedition" } },
            { text: "好说。", next: "default", action: "back" }
          ]
        },
        scared: {
          id: "scared",
          texts: ["我也怕啊...", "要不咱们跟教官说别去了？"],
          effects: { opinion: 2 },
          choices: [{ text: "还是去吧。", next: "default", action: "back" }]
        },
        after_training: {
          id: "after_training",
          oneTime: true,
          texts: [
            "雪峰山历练？别提了，差点吓死我！",
            "那洞窟里的妖魔太吓人了，要不是莫凡和你，我估计就交代在那儿了。",
            "不过...我好像也没那么没用？我用地波·挪移救了许昭霆一命！",
            "（王三胖挺起胸膛，虽然还在发抖，但眼神里多了一丝自豪）"
          ],
          effects: { opinion: 5, familiarity: 5 },
          choices: [
            { text: "你确实很勇敢。", next: "default", effects: { opinion: 5 } },
            { text: "下次别那么胆小了。", next: "default", effects: { opinion: -2 } },
            { text: "走，吃顿好的压压惊。", next: "default", effects: { opinion: 8, gold: -50 } }
          ]
        },
        after_disaster: {
          id: "after_disaster",
          oneTime: true,
          texts: [
            "博城灾难...我不想提...",
            "那天晚上太可怕了，到处都是妖魔，到处都是惨叫声...",
            "我爸妈...他们没逃出来...",
            "（王三胖的声音哽咽了，这个平时嘻嘻哈哈的胖子，此刻像个无助的孩子）",
            "但我活下来了。我得好好活着，不能让他们白死。"
          ],
          effects: { opinion: 10, trust: 10, familiarity: 10 },
          choices: [
            { text: "节哀...我会陪你一起走下去。", next: "default", effects: { opinion: 5, trust: 5 } },
            { text: "黑教廷必须付出代价。", next: "default", effects: { opinion: 3, trust: 3 } },
            { text: "好好活着，就是对他们最好的告慰。", next: "default", effects: { opinion: 8, trust: 5 } }
          ]
        }
      }
    },
    growth: {
      growthRate: 80,
      base: {
        level: 2,
        elements: ["earth"],
        skills: ["basic_attack","earth_shift"],
        title: "天澜高中学生",
        growthType: "mage",
      },
      events: [
        {
          after: "annual_exam",
          level: 4,
          addSkills: ["earth_shield"],
          title: "天澜高中学生",
        },
        {
          after: "xuefeng_training",
          level: 5,
          addSkills: ["earth_shield"],
          addTalents: [
            {
              id: "earth_displacement_talent",
              name: "土系位移天赋",
              type: "acquired",
              description: "土系位移魔法天赋，对地波·挪移等位移类魔法有天生的亲和力，施法速度和精确度提升，位移距离增加。",
              effects: { earthSpeedBonus: 0.1 }
            }
          ],
          title: "土系法师（历练后）",
        },
        {
          after: "bocheng_disaster",
          level: 10,
          addSkills: ["earth_shield"],
          title: "博城幸存者",
        }
      ]
    }
  },
  er_tuzi: {
    id: "er_tuzi",
    name: "二秃子",
    title: "驿站小贩",
    description: "雪峰山驿站的小贩，光头，在主道摆摊卖魔法师战斗修炼用品。专卖履魔具，用奔妖后肢皮制作，附魔风轨法纹，风石提供能量。",
    avatar: "",
    location: "xuefeng_station",
    element: null,
    level: 0,
    personality: ["精明", "能说会道", "生意人", "光头"],
    baseStats: { hp: 30, mp: 0, attack: 0, defense: 0, speed: 5 },
    skills: [],
    isCombatant: false,
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
          choices: [
            { text: "有装备准备的建议吗？", next: "default", action: "start_quest", actionData: { questId: "quest_ertuzi_equipment_prep" } },
            { text: "下次吧。", next: "default", action: "back" }
          ]
        }
      }
    }
  },
  bai_yang: {
    id: "bai_yang",
    name: "白阳",
    title: "召唤系法师",
    description: "天澜魔法高中的召唤系老师，幽狼兽的召唤师。在雪峰山历练中负责留守巢穴，召唤兽失控后精神受到重创。",
    avatar: "",
    location: "baicao_valley",
    element: "summon",
        elements: ["summon"],
level: 10,
    personality: ["沉稳", "专业", "责任心强", "召唤系"],
    baseStats: { hp: 200, mp: 150, attack: 25, defense: 15, speed: 12 },
    skills: ["basic_attack", "summon_beast", "summon_strengthen", "summon_rage"],
    talents: [
      {
        id: "summon_contract_mastery",
        name: "召唤系契约精通",
        type: "acquired",
        description: "专业的召唤系老师，与召唤兽之间的契约连接更加稳固，召唤兽的战斗力提升。",
        effects: { summonDamageBonus: 0.15 }
      }
    ],
    faction: "tianlan_school",
    factionRank: "teacher",
    relationships: {
      zhan_kong: { type: "colleague", opinion: 60 },
      luo_yunbo: { type: "colleague", opinion: 50 },
      pan_lijun: { type: "colleague", opinion: 50 }
    },
    growth: {
      growthRate: 65,
      base: {
        level: 10,
        elements: ["summon"],
        skills: ["basic_attack","summon_wolf_beast"],
        title: "召唤系法师",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["soul_essence", "magic_stone"],
      liked: ["mana_potion", "demon_core"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 5
    },
    dialogueTree: {
      npcId: "bai_yang",
      nodes: {
        default: {
          id: "default",
          texts: ["你好，我是白阳，召唤系老师。", "我的召唤兽幽狼兽在附近活动，小心点。", "召唤系法师与召唤兽心灵相通，它受伤我也会痛。"],
          choices: [
            { text: "召唤系是什么？", next: "about_summon" },
            { text: "幽狼兽厉害吗？", next: "about_wolf" },
            { text: "历练的事...", next: "about_training" },
            { text: "能指导我召唤系吗？", next: "default", action: "start_quest", actionData: { questId: "quest_baiyang_summon_guide" } },
            { text: "告辞。", next: "default", action: "back" }
          ]
        },
        about_summon: {
          id: "about_summon",
          texts: ["召唤系可以召唤异世界的生物为己所用。", "召唤师与召唤兽心灵感应，共享感知。", "召唤兽死亡，召唤师也会受到严重的精神创伤。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "原来如此。", next: "default", action: "back" }]
        },
        about_wolf: {
          id: "about_wolf",
          texts: ["幽狼兽是奴仆级召唤兽，绿色汗毛，锯齿獠牙。", "比普通独眼魔狼要强一些，速度很快。", "但它受强刺激会发狂，眼睛变红，战斗力翻倍。"],
          effects: { familiarity: 3 },
          choices: [{ text: "发狂了怎么办？", next: "about_rage" }]
        },
        about_rage: {
          id: "about_rage",
          texts: ["发狂的召唤兽很难控制，连我也可能被攻击。", "最好的办法是用环境限制它，或者一击重创。", "钟乳石洞穴那种地形，就很适合用智商碾压。"],
          effects: { familiarity: 5, intelligence: 10 },
          choices: [{ text: "受教了。", next: "default", action: "back" }]
        },
        about_training: {
          id: "about_training",
          texts: ["这次历练是斩空老师设计的，表面上没有老师保护。", "实际上我们都在暗中跟随，计分并随时准备救援。", "释放魔法得A，打伤召唤兽得S，加油吧。"],
          effects: { familiarity: 5 },
          choices: [{ text: "明白了。", next: "default", action: "back" }]
        }
      }
    }
  },
  xu_dahuang: {
    id: "xu_dahuang",
    name: "徐大荒",
    title: "城市猎妖队队长",
    description: "博城城市猎妖队队长，火系法师，性格豪爽霸道，作战经验丰富，身上常带着新伤（脑袋上总缠着纱布）。将火滋修炼到第三级爆裂境界，一招火滋·爆裂威力惊人。对队员要求严格，是个负责任的队长。",
    avatar: "assets/images/characters/xu_dahuang.jpg",
    location: "bo_city",
    element: "fire",
        elements: ["fire"],
level: 12,
    levelDisplay: "中阶???",
    levelUnknown: true,
    personality: ["豪爽", "严格", "负责任", "战斗经验丰富"],
    baseStats: { hp: 200, mp: 80, attack: 35, defense: 15, speed: 12 },
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst", "fire_fist"],
    talents: [
          {
                "name": "火系猎妖经验",
                "type": "acquired",
                "element": "fire",
                "description": "城市猎妖队队长，多年猎妖经验，火系魔法实战运用纯熟，擅长对付妖魔。"
          }
    ],
    faction: "city_hunters",
    factionRank: "队长",
    relationships: { mo_fan: 10, guo_caitang: 20, xiao_ke: 15, li_wenjie: 15, fei_shi: 20 },
    growth: {
      base: {
        level: 12,
        elements: ["fire"],
        skills: ["fire_bolt","fire_burst","fire_burn_bone"],
        title: "城市猎妖队队长",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["fire_crystal", "premium_ink"],
      liked: ["magic_herb", "health_potion"],
      disliked: [],
      baseOpinionGain: 2,
      lovedMultiplier: 3,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "xu_dahuang",
      nodes: {
        default: {
          id: "default",
          texts: ["梵墨，今天有什么任务？", "城市猎妖队随时待命，有妖魔就上。", "雷系法师很珍贵，你要好好发挥。"],
          choices: [
            { text: "我想加入城市猎妖队", next: "join_team" },
            { text: "有什么猎妖任务？", next: "hunt_quests", conditions: { flag: "hunter_team_member" } },
            { text: "请教战斗技巧", next: "about_combat" },
            { text: "城市猎妖队是做什么的？", next: "about_team" },
            { text: "博城最近安全吗？", next: "about_safety" },
            { text: "队长平时压力大吗？", next: "about_pressure" },
            { text: "对新手有什么建议？", next: "about_rookie" },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        hunt_quests: {
          id: "hunt_quests",
          texts: ["当前有这些猎妖任务，你看看哪个合适。", "低级任务适合新手，高级任务必须组队。", "完成任务有金币、经验和精魄奖励。"],
          choices: [
            { text: "【简单】下水道鼠患", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_sewer_rats" } },
            { text: "【简单】墓地幽灵", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_cemetery_ghost" } },
            { text: "【简单】仓库虫患", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_warehouse_bugs" } },
            { text: "【简单】铭文女子中学的妖魔", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_school_demon" } },
            { text: "【中等】集市护卫", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_market_protection" }, conditions: { flag: "quest_hunt_sewer_rats_completed" } },
            { text: "【中等】校园夜间巡逻", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_school_patrol" } },
            { text: "【中等】老街区的怪事", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_old_district" }, conditions: { flag: "quest_hunt_school_demon_completed" } },
            { text: "【困难】魔藤入侵", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_demon_vine" }, conditions: { flag: "quest_hunt_market_protection_completed" } },
            { text: "【困难】黑教廷据点", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_black_church_cell" }, conditions: { flag: "quest_hunt_old_district_completed" } },
            { text: "【困难】城市边缘的统领", next: "default", action: "start_quest", actionData: { questId: "quest_hunt_city_edge" }, conditions: { flag: "quest_hunt_old_district_completed" } },
            { text: "我再想想", next: "default", action: "back" }
          ]
        },
        join_team: {
          id: "join_team",
          texts: ["哦？你想加入猎妖队？", "这可不是闹着玩的，随时可能没命。", "不过...看你眼神挺坚定的。你是什么系的？等级多少？"],
          choices: [
            { text: "我是雷系，等级够了！", next: "join_team_lei", conditions: { element: "thunder", minLevel: 5 } },
            { text: "我等级够了，想试试", next: "join_team_check", conditions: { minLevel: 5 } },
            { text: "我再修炼修炼", next: "default", action: "back" }
          ]
        },
        join_team_lei: {
          id: "join_team_lei",
          oneTime: true,
          texts: ["雷系？好！雷系法师在猎妖队可是香饽饽。", "麻痹效果对妖魔太有用了。", "行，你就算见习成员了。先从低级任务做起，有任务我会通知你。"],
          effects: { familiarity: 10, trust: 5 },
          flags: { hunter_team_member: true, hunter_rank: "apprentice" },
          choices: [{ text: "谢谢队长！", next: "default", action: "back" }]
        },
        join_team_check: {
          id: "join_team_check",
          oneTime: true,
          texts: ["等级够了，但猎妖队要看实力。", "这样，你去和训练傀儡打一场，评级B以上就算通过。", "不过...看你挺有诚意的，先收你当见习成员，任务中再考察你。"],
          effects: { familiarity: 5 },
          flags: { hunter_team_member: true, hunter_rank: "apprentice" },
          choices: [{ text: "我会证明自己的！", next: "default", action: "back" }]
        },
        about_combat: {
          id: "about_combat",
          oneTime: true,
          texts: ["战斗不是打靶，妖魔不会站着等你。", "我的火滋练到第三级爆裂，就是为了对付灵活的妖魔。", "记住，团队配合比个人英雄主义重要。"],
          effects: { familiarity: 5, intelligence: 10 },
          choices: [{ text: "受教了", next: "default", action: "back" }]
        },
        about_team: {
          id: "about_team",
          oneTime: true,
          texts: ["城市猎妖队专门处理城市内的妖魔事件。", "我们比野外猎者安全，但责任更重。", "保护市民是我们的职责，不容有失。"],
          effects: { familiarity: 3 },
          choices: [{ text: "明白了", next: "default", action: "back" }]
        },
        about_safety: {
          id: "about_safety",
          texts: ["表面平静，暗流涌动。最近城外的妖魔活动频繁了不少。", "我们猎妖队24小时待命，就怕出大事。", "你也是法师，多留个心眼。"],
          choices: [
            { text: "会有大灾难吗？", next: "about_disaster_worry" },
            { text: "我会小心的", next: "default", action: "back" }
          ]
        },
        about_disaster_worry: {
          id: "about_disaster_worry",
          oneTime: true,
          texts: ["希望不会。但做我们这行的，不能抱侥幸心理。", "博城三面环山，一旦妖魔潮涌进来...", "不说这些不吉利的。真到那时候，我们猎妖队会顶在前面。"],
          effects: { opinion: 3, trust: 2 },
          choices: [
            { text: "我可以帮忙调查吗？", next: "default", action: "start_quest", actionData: { questId: "quest_xu_dahuang_investigation" } },
            { text: "队长真有担当", next: "default", action: "back" }
          ]
        },
        about_pressure: {
          id: "about_pressure",
          texts: ["压力？哈哈，当队长的哪能没压力。", "手下十几号人的命都在我手里，一个决策错了就是人命。", "但我不能慌，我慌了队员就更慌了。"],
          choices: [
            { text: "队长辛苦了", next: "about_pressure_response" },
            { text: "那为什么还要当队长？", next: "about_why_captain" }
          ]
        },
        about_pressure_response: {
          id: "about_pressure_response",
          oneTime: true,
          texts: ["（徐大荒拍了拍你的肩膀）小子，有你这句话就够了。", "干我们这行的，不怕死，就怕怕死。", "你好好修炼，将来也许能帮上忙。"],
          effects: { opinion: 5, trust: 3 },
          choices: [{ text: "我会努力的", next: "default", action: "back" }]
        },
        about_why_captain: {
          id: "about_why_captain",
          oneTime: true,
          texts: ["因为我能打啊！哈哈，开个玩笑。", "当年我也是个愣头青，跟着老队长出生入死。", "老队长走了，这担子总得有人挑。我不挑，谁挑？"],
          effects: { opinion: 2, trust: 2 },
          choices: [
            { text: "老队长...？", next: "about_old_captain" },
            { text: "原来如此", next: "default", action: "back" }
          ]
        },
        about_old_captain: {
          id: "about_old_captain",
          oneTime: true,
          texts: ["（徐大荒的眼神暗了一下）三年前的事了。", "一只鳞皮妖母偷袭，老队长为了掩护我们撤退...", "不说了。你只要记住，猎妖队的每个人，都是可以把后背交给对方的兄弟。"],
          effects: { opinion: 3, trust: 5 },
          choices: [{ text: "我记住了", next: "default", action: "back" }]
        },
        about_rookie: {
          id: "about_rookie",
          oneTime: true,
          texts: ["新手啊？别逞强，别落单，别小看任何一只妖魔。", "很多新手觉得自己觉醒了魔法就了不起，结果第一次出任务就吓尿了。", "妖魔不是木桩，它们会躲、会跑、会设陷阱。活着，比什么都重要。"],
          effects: { intelligence: 10 },
          choices: [{ text: "受教了", next: "default", action: "back" }]
        }
      }
    }
  },
  guo_caitang: {
    id: "guo_caitang",
    name: "郭彩棠",
    title: "城市猎妖队副队长",
    description: "博城城市猎妖队副队长，冰系法师，与穆氏家族有沾亲带故的关系。性格傲娇，难以相处，但实力不俗。被莫凡（梵墨）救过一命后态度有所转变。",
    avatar: "assets/images/characters/guo_caitang.jpg",
    location: "bo_city",
    element: "ice",
        elements: ["ice"],
level: 10,
    levelDisplay: "中阶???",
    levelUnknown: true,
    personality: ["傲娇", "高冷", "实力强", "穆氏亲戚"],
    baseStats: { hp: 160, mp: 90, attack: 28, defense: 12, speed: 11 },
    skills: ["basic_attack", "ice_spike", "ice_frost", "ice_storm"],
    talents: [
      {
        id: "ice_hunter_experience",
        name: "冰系猎妖经验",
        type: "acquired",
        description: "长期在城市猎妖队与妖魔战斗，冰系魔法运用更加熟练，对妖魔的冰系伤害提升。",
        effects: { iceDamageBonus: 0.1 }
      }
    ],
    faction: "city_hunters",
    factionRank: "副队长",
    relationships: { mo_fan: 5, xu_dahuang: 15, xiao_ke: 10, li_wenjie: 10, fei_shi: 10 },
    growth: {
      base: {
        level: 10,
        elements: ["ice"],
        skills: ["ice_spike","ice_shield","ice_storm"],
        title: "城市猎妖队副队长",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["ice_crystal", "beauty_products"],
      liked: ["magic_herb", "health_potion"],
      disliked: [],
      baseOpinionGain: 1,
      lovedMultiplier: 3,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "guo_caitang",
      nodes: {
        default: {
          id: "default",
          texts: ["哼，菜鸟雷法师。", "别以为是雷系就了不起。", "……上次谢谢你救了我。"],
          choices: [
            { text: "请教冰系技巧", next: "about_ice" },
            { text: "你和穆氏家族有关系？", next: "about_mu" },
            { text: "上次的事...不用谢", next: "about_rescue" },
            { text: "徐队长人怎么样？", next: "about_xu" },
            { text: "你为什么总是这么高冷？", next: "about_personality" },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_ice: {
          id: "about_ice",
          texts: ["冰系不仅是伤害，更是控制。", "冻结敌人，让队友有输出空间。", "菜鸟，好好学。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "明白了", next: "default", action: "back" }]
        },
        about_mu: {
          id: "about_mu",
          texts: ["……是有些亲戚关系。", "但我是我，穆氏是穆氏。", "别再问这个了。"],
          effects: { familiarity: -2 },
          choices: [{ text: "抱歉", next: "default", action: "back" }]
        },
        about_rescue: {
          id: "about_rescue",
          texts: ["（郭彩棠的脸微微红了一下，随即恢复冷淡）", "那次...是我大意了。要不是你，我可能已经...", "总之，谢了。但别以为这样我就会对你客气。"],
          effects: { opinion: 5, trust: 3 },
          choices: [
            { text: "应该的，队友嘛", next: "about_rescue_teammate" },
            { text: "那你打算怎么谢我？", next: "about_rescue_tease" }
          ]
        },
        about_rescue_teammate: {
          id: "about_rescue_teammate",
          texts: ["（郭彩棠愣了一下，眼神柔和了几分）", "队友...吗。", "哼，算你会说话。"],
          effects: { opinion: 3, trust: 2 },
          choices: [
            { text: "穆氏的事...需要我帮忙调查吗？", next: "default", action: "start_quest", actionData: { questId: "quest_guo_caitang_mu_clues" } },
            { text: "（微笑）", next: "default", action: "back" }
          ]
        },
        about_rescue_tease: {
          id: "about_rescue_tease",
          texts: ["（郭彩棠瞪了你一眼）你！", "……想得美。", "等你什么时候能独当一面了再说吧，菜鸟。"],
          effects: { opinion: -1, trust: 1 },
          choices: [{ text: "哈哈，开个玩笑", next: "default", action: "back" }]
        },
        about_xu: {
          id: "about_xu",
          texts: ["徐大荒？那个莽夫。", "打仗是一把好手，但脑子不太好使。", "不过...他是个好队长。这点我承认。"],
          effects: { familiarity: 2 },
          choices: [
            { text: "你们配合很久了？", next: "about_xu_history" },
            { text: "原来如此", next: "default", action: "back" }
          ]
        },
        about_xu_history: {
          id: "about_xu_history",
          texts: ["五年了。我刚进猎妖队的时候，他还是个队员。", "那家伙拼起命来不要命，好几次都是我给他收尾。", "后来老队长走了，他就接了班。虽然莽，但值得信任。"],
          effects: { opinion: 2, trust: 2 },
          choices: [{ text: "真是对好搭档", next: "default", action: "back" }]
        },
        about_personality: {
          id: "about_personality",
          texts: ["（郭彩棠皱了皱眉）高冷？", "我只是不喜欢废话。", "在猎妖队，话多的人死得快。"],
          choices: [
            { text: "但这样会让人觉得难以接近", next: "about_personality_open" },
            { text: "明白了，我不多问", next: "default", action: "back" }
          ]
        },
        about_personality_open: {
          id: "about_personality_open",
          texts: ["（郭彩棠沉默了一会儿）", "……接近我有什么好处？穆氏的人，都只会利用别人。", "我不想被利用，也不想利用别人。保持距离，对大家都好。"],
          effects: { opinion: 3, trust: 5 },
          choices: [{ text: "我不是穆氏的人", next: "default", action: "back" }]
        }
      }
    }
  },
  xiao_ke: {
    id: "xiao_ke",
    name: "小可",
    title: "城市猎妖队成员",
    description: "博城城市猎妖队成员，水系法师，性格温柔可爱，有两颗小虎牙。掌握水系防御技能水御·化解，是队伍中唯一的防御型法师。战斗中容易紧张，但一直在努力成长。",
    avatar: "assets/images/characters/xiao_ke.jpg",
    location: "bo_city",
    element: "water",
        elements: ["water"],
level: 8,
    personality: ["温柔", "可爱", "努力", "容易紧张"],
    baseStats: { hp: 140, mp: 100, attack: 18, defense: 18, speed: 10 },
    skills: ["basic_attack", "water_heal", "water_chain", "water_wave"],
    talents: [
      {
        id: "water_defense_mastery",
        name: "水系防御精通",
        type: "acquired",
        description: "队伍中唯一的防御型法师，长期修炼水系防御魔法，水御技能效果提升。",
        effects: { waterDefenseBonus: 0.15 }
      }
    ],
    faction: "city_hunters",
    factionRank: "队员",
    relationships: { mo_fan: 8, xu_dahuang: 10, guo_caitang: 8, li_wenjie: 8, fei_shi: 10 },
    growth: {
      base: {
        level: 8,
        elements: ["water"],
        skills: ["water_heal","water_chain","water_moist"],
        title: "城市猎妖队成员",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["candy", "cute_accessories"],
      liked: ["magic_herb", "health_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "xiao_ke",
      nodes: {
        default: {
          id: "default",
          texts: ["梵墨哥哥好！", "我的水御还不够熟练，总是紧张。", "有你在，我就安心多了。"],
          choices: [
            { text: "请教水系防御", next: "about_water" },
            { text: "别紧张，你很棒", next: "encourage" },
            { text: "为什么加入猎妖队？", next: "about_why_join" },
            { text: "战斗中紧张怎么办？", next: "about_nervous" },
            { text: "队伍里大家怎么样？", next: "about_team" },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_water: {
          id: "about_water",
          texts: ["水御·化解可以分解魔法攻击。", "但需要提前准备星轨，反应要快。", "我总是慢半拍，队长骂过我好多次。"],
          effects: { familiarity: 5, intelligence: 8 },
          choices: [
            { text: "多练习就好", next: "default", action: "back" },
            { text: "我可以陪你练习", next: "about_practice" }
          ]
        },
        encourage: {
          id: "encourage",
          texts: ["真、真的吗？", "谢谢你，梵墨哥哥！", "我会更加努力的！"],
          effects: { familiarity: 8, happiness: 10 },
          choices: [{ text: "加油", next: "default", action: "back" }]
        },
        about_why_join: {
          id: "about_why_join",
          texts: ["我...我小时候被妖魔袭击过，是猎妖队救了我。", "从那以后，我就想成为能保护别人的人。", "虽然我很弱，但我想努力变强。"],
          effects: { opinion: 5, trust: 3 },
          choices: [{ text: "你很勇敢", next: "default", action: "back" }]
        },
        about_nervous: {
          id: "about_nervous",
          texts: ["（小可低下头）每次遇到妖魔，我的手都会抖。", "队长说我不适合当猎妖师，但我不想放弃。", "彩棠姐说，紧张说明你在乎，不在乎的人才不会紧张。"],
          choices: [
            { text: "紧张是正常的", next: "about_nervous_response" },
            { text: "那为什么还要坚持？", next: "about_why_persist" }
          ]
        },
        about_nervous_response: {
          id: "about_nervous_response",
          texts: ["（小可抬起头，眼睛亮亮的）真、真的吗？", "梵墨哥哥也会紧张吗？", "那我就放心了...我以为只有我这样。"],
          effects: { opinion: 5, trust: 5, happiness: 10 },
          choices: [{ text: "当然，每个人都会紧张", next: "default", action: "back" }]
        },
        about_why_persist: {
          id: "about_why_persist",
          texts: ["因为...因为我想保护大家。", "队长、彩棠姐、肥石哥、文杰哥，他们都是我的家人。", "我不想再看到有人因为我不够强而受伤。"],
          effects: { opinion: 3, trust: 5 },
          choices: [{ text: "你一定可以的", next: "default", action: "back" }]
        },
        about_team: {
          id: "about_team",
          texts: ["队长虽然凶，但人很好。", "彩棠姐看起来高冷，其实很关心我们。", "肥石哥憨憨的，但是很可靠。文杰哥很帅！"],
          effects: { familiarity: 3 },
          choices: [{ text: "你们关系真好", next: "default", action: "back" }]
        },
        about_practice: {
          id: "about_practice",
          texts: ["（小可的脸红红的）真、真的吗？", "那...那我们什么时候练习？", "谢谢你，梵墨哥哥！你是第一个愿意陪我练习的人。"],
          effects: { opinion: 8, trust: 5, happiness: 15 },
          choices: [
            { text: "现在就开始吧", next: "default", action: "start_quest", actionData: { questId: "quest_xiao_ke_practice" } },
            { text: "改天再说", next: "default", action: "back" }
          ]
        }
      }
    }
  },
  li_wenjie: {
    id: "li_wenjie",
    name: "黎文杰",
    title: "城市猎妖队成员",
    description: "博城城市猎妖队成员，风系法师，留着飘逸长发，性格潇洒自信。掌握风轨·闪步，可以快速变换方位，是队伍中的机动输出。面对妖魔从容不迫，实力不俗。",
    avatar: "assets/images/characters/li_wenjie.jpg",
    location: "bo_city",
    element: "wind",
        elements: ["wind"],
level: 9,
    personality: ["潇洒", "自信", "飘逸", "实力强"],
    baseStats: { hp: 150, mp: 85, attack: 25, defense: 10, speed: 20 },
    skills: ["basic_attack", "wind_blade", "wind_speed", "wind_tornado"],
    talents: [
      {
        id: "wind_mobility_mastery",
        name: "风系机动精通",
        type: "acquired",
        description: "队伍中的机动输出，长期修炼风轨·闪步，风系速度技能效果提升。",
        effects: { windSpeedBonus: 0.15 }
      }
    ],
    faction: "city_hunters",
    factionRank: "队员",
    relationships: { mo_fan: 5, xu_dahuang: 10, guo_caitang: 8, xiao_ke: 8, fei_shi: 10 },
    growth: {
      base: {
        level: 9,
        elements: ["wind"],
        skills: ["wind_blade","wind_speed","wind_tornado"],
        title: "城市猎妖队成员",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["wind_crystal", "fashion_clothes"],
      liked: ["magic_herb", "health_potion"],
      disliked: [],
      baseOpinionGain: 2,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "li_wenjie",
      nodes: {
        default: {
          id: "default",
          texts: ["哟，新来的雷法师。", "风系的飘逸，你学不来。", "不过雷系的麻痹确实好用。"],
          choices: [
            { text: "请教风轨·闪步", next: "about_wind" },
            { text: "你很厉害", next: "compliment" },
            { text: "有侦察任务需要帮忙吗？", next: "default", action: "start_quest", actionData: { questId: "quest_liwenjie_scout" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_wind: {
          id: "about_wind",
          texts: ["风轨·疾行只是直线加速。", "闪步则可以快速变向，灵活性天差地别。", "这需要大量实战练习，学校里学不到。"],
          effects: { familiarity: 5, intelligence: 10 },
          choices: [{ text: "受教了", next: "default", action: "back" }]
        },
        compliment: {
          id: "compliment",
          texts: ["哈哈，那是自然。", "不过队长的火滋爆裂才是真的强。", "我们队伍每个人都有不可替代的作用。"],
          effects: { familiarity: 5 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        }
      }
    }
  },
  fei_shi: {
    id: "fei_shi",
    name: "肥石",
    title: "城市猎妖队成员",
    description: "博城城市猎妖队成员，土系法师，圆润脸庞，总是戴着蓓蕾帽，性格随和爱笑。掌握土系位移技能地波，可以快速移动位置。经验老道，是队伍中的老大哥。",
    avatar: "assets/images/characters/fei_shi.jpg",
    location: "bo_city",
    element: "earth",
        elements: ["earth"],
level: 11,
    levelDisplay: "中阶???",
    levelUnknown: true,
    personality: ["随和", "爱笑", "经验老道", "老大哥"],
    baseStats: { hp: 220, mp: 70, attack: 22, defense: 25, speed: 8 },
    skills: ["basic_attack", "earth_shield", "earth_quake", "earth_shift", "bone_spike"],
    talents: [
      {
        id: "earth_defense_mastery",
        name: "土系防御精通",
        type: "acquired",
        description: "队伍中的老大哥，经验老道，土系防御魔法运用熟练，土系防御技能效果提升。",
        effects: { earthDefenseBonus: 0.15 }
      }
    ],
    faction: "city_hunters",
    factionRank: "队员",
    relationships: { mo_fan: 10, xu_dahuang: 15, guo_caitang: 10, xiao_ke: 12, li_wenjie: 12 },
    growth: {
      base: {
        level: 11,
        elements: ["earth"],
        skills: ["earth_shield","earth_spike","earth_quake","earth_shift"],
        title: "城市猎妖队成员",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["earth_crystal", "good_food"],
      liked: ["magic_herb", "health_potion", "stamina_potion"],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2.5,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "fei_shi",
      nodes: {
        default: {
          id: "default",
          texts: ["小兄弟，来了啊。", "有啥不懂的尽管问我。", "土系的地波，赶路逃命都好用。"],
          choices: [
            { text: "请教地波技巧", next: "about_earth" },
            { text: "城市猎妖队的日常", next: "about_daily" },
            { text: "有任务需要帮忙吗？", next: "default", action: "start_quest", actionData: { questId: "quest_feishi_training" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_earth: {
          id: "about_earth",
          texts: ["地波是通过控制地表挪动来移动。", "不需要自己跑，身体自动平移。", "熟练了可以在战斗中快速调整位置。"],
          effects: { familiarity: 5, intelligence: 8 },
          choices: [{ text: "学到了", next: "default", action: "back" }]
        },
        about_daily: {
          id: "about_daily",
          texts: ["城市猎妖队平时处理城市内的妖魔事件。", "比如下水道的巨眼猩鼠，或者潜伏的其他妖魔。", "比野外安全，但也不能掉以轻心。"],
          effects: { familiarity: 3 },
          choices: [{ text: "明白了", next: "default", action: "back" }]
        }
      }
    }
  },
  yang_zuohe: {
    id: "yang_zuohe",
    name: "杨作河",
    title: "魔法协会中阶法师",
    description: "博城魔法协会的中阶水系法师，同时掌握风系，实力强大。负责博城市区的妖魔巡逻和突发事件处理，经验丰富。",
    avatar: "assets/images/characters/yang_zuohe.jpg",
    location: "city_street",
    element: "water",
        elements: ["water","wind"],
level: 18,
    elementLevels: {
      water: 18,
      wind: 15
    },
    levelDisplay: "中阶???",
    levelUnknown: true,
    personality: ["沉稳", "威严", "公正", "经验丰富"],
    baseStats: { hp: 300, mp: 200, attack: 50, defense: 30, speed: 25 },
    skills: ["basic_attack", "water_heal", "water_chain", "water_wave", "water_tide", "water_arc_shield", "wind_blade", "wind_speed", "wind_tornado", "sky_dive", "wind_wing"],
    talents: [
          {
                "name": "水风双系修为",
                "type": "acquired",
                "element": "water",
                "description": "魔法协会中阶法师，水系+风系双系，魔法控制力强，擅长组合魔法和辅助。"
          }
    ],
    faction: "magic_association",
    factionRank: "中阶法师",
    relationships: { xu_dahuang: 30, mo_fan: 20 },
    growth: {
      base: {
        level: 18,
        elements: ["water","wind"],
        skills: ["water_wave","water_chain","wind_tornado"],
        title: "魔法协会中阶法师",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["magic_crystal"],
      liked: ["magic_herb", "demon_core"],
      disliked: [],
      baseOpinionGain: 2,
      lovedMultiplier: 3,
      likedMultiplier: 2,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "yang_zuohe",
      nodes: {
        default: {
          id: "default",
          texts: ["年轻人，你的雷系天赋不错。", "老榕树街区那次，多亏了你压制住独眼魔狼。", "有什么事吗？"],
          choices: [
            { text: "请教中阶魔法", next: "about_mid_magic", action: "talk" },
            { text: "询问魔法协会", next: "about_association", action: "talk" },
            { text: "博城最近安全吗？", next: "about_safety", action: "talk" },
            { text: "城市猎妖队在做什么？", next: "about_hunters", condition: { minOpinion: 5 }, action: "talk" },
            { text: "听说有黑衣人在活动？", next: "about_black_church", condition: { hasFlag: "black_church_clue", minOpinion: 15 }, action: "talk" },
            { text: "能给我布置修炼任务吗？", next: "default", action: "start_quest", actionData: { questId: "quest_yangzuohe_mid_guidance" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_mid_magic: {
          id: "about_mid_magic",
          texts: ["中阶魔法需要星云级别的精神力。", "初阶是星尘，中阶是星云，完全不同的层次。", "暴浪·驱逐可以淹没整条街道，这就是中阶的威力。", "你还需要继续努力。"],
          effects: { familiarity: 5, intelligence: 10 },
          choices: [
            { text: "怎么才能突破到中阶？", next: "about_breakthrough" },
            { text: "受教了", next: "default", action: "back" }
          ]
        },
        about_breakthrough: {
          id: "about_breakthrough",
          texts: ["突破中阶需要星尘魔器辅助，或者地圣泉那种灵泉。", "精神力达到瓶颈后，需要外力刺激才能蜕变。", "博城每年只有少数人能突破中阶，你要做好准备。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "我会努力的", next: "default", action: "back" }]
        },
        about_association: {
          id: "about_association",
          texts: ["魔法协会负责管理城市内的魔法师和妖魔事件。", "我们和猎者联盟、城市猎妖队合作。", "如果你足够强，可以申请加入魔法协会。"],
          effects: { familiarity: 3 },
          choices: [
            { text: "加入魔法协会有什么要求？", next: "about_join_requirement" },
            { text: "明白了", next: "default", action: "back" }
          ]
        },
        about_join_requirement: {
          id: "about_join_requirement",
          oneTime: true,
          texts: ["至少中阶修为，通过协会的考核。", "还要有良好的品行和责任心。", "魔法师不是只会战斗，还要保护普通人。"],
          effects: { familiarity: 3 },
          choices: [{ text: "我记住了", next: "default", action: "back" }]
        },
        about_safety: {
          id: "about_safety",
          texts: ["博城最近不太太平。", "东郊的妖魔活动频繁，城市猎妖队已经加强巡逻了。", "你晚上尽量不要去偏僻的地方。"],
          effects: { familiarity: 3 },
          choices: [
            { text: "是什么妖魔在闹事？", next: "about_demon_activity" },
            { text: "我会小心的", next: "default", action: "back" }
          ]
        },
        about_demon_activity: {
          id: "about_demon_activity",
          oneTime: true,
          texts: ["主要是独眼魔狼和巨眼猩鼠。", "但最近发现一些异常，妖魔的行为变得很狂躁。", "像是被什么东西刺激了...我们正在调查。"],
          effects: { familiarity: 3, discoverClue: "clue_demon_mania" },
          choices: [{ text: "需要我帮忙吗？", next: "default", action: "back" }]
        },
        about_hunters: {
          id: "about_hunters",
          oneTime: true,
          texts: ["城市猎妖队由徐大荒队长带领，都是经验丰富的法师。", "他们负责处理城市内的妖魔事件，我们协会提供支援。", "最近他们在调查东郊的魔狼聚集事件。"],
          effects: { familiarity: 3 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_black_church: {
          id: "about_black_church",
          oneTime: true,
          texts: ["...你也听说了？", "博城确实有一些可疑的人在活动，穿着黑色长袍。", "协会已经在秘密调查了，但还没有确凿证据。你要小心，不要单独行动。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [{ text: "我会警惕的", next: "default", action: "back" }]
        }
      }
    }
  },
  yu_ang: {
    id: "yu_ang",
    name: "宇昂",
    title: "穆氏养子 / 冰系修炼疯子",
    description: "穆卓云的养子，冰系法师，穆氏世家有名的修炼疯子——大家一提到这个人都不由浑身发冷。一年三百六十五天几乎都在修炼，长期使用星尘魔器，已掌握冰蔓·凝结。对穆卓云唯命是从，就算让他直接杀人也不会犹豫。穆卓云安排他在成年礼上与莫凡决斗。性格阴沉冷漠，除了修炼对一切都不感兴趣。",
    avatar: "assets/images/characters/yu_ang.jpg",
    location: "mu_manor",
    element: "ice",
        elements: ["ice"],
level: 7,
    personality: ["阴沉", "冷漠", "修炼疯子", "唯命是从", "勤奋到变态"],
    baseStats: { hp: 120, mp: 80, attack: 22, defense: 12, speed: 14 },
    skills: ["basic_attack", "ice_spike", "ice_frost", "ice_storm"],
    talents: [
      {
        id: "ice_crazy_training",
        name: "冰系疯狂修炼",
        type: "acquired",
        description: "穆氏有名的修炼疯子，一年三百六十五天几乎都在修炼，冰系魔法基础极其扎实。",
        effects: { iceDamageBonus: 0.15 }
      }
    ],
    faction: "mu_family",
    factionRank: "养子",
    relationships: { mu_zhuoyun: 50, mu_he: 30, mo_fan: -30, guo_caitang: 20 },
    growth: {
      base: {
        level: 7,
        elements: ["ice"],
        skills: ["ice_spike","ice_frost","ice_shield"],
        title: "穆氏养子 / 冰系修炼疯子",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["ice_crystal"],
      liked: ["magic_crystal", "magic_herb"],
      disliked: ["fire_essence"],
      baseOpinionGain: 1,
      lovedMultiplier: 3,
      likedMultiplier: 2,
      dislikedMultiplier: 0.3,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "yu_ang",
      nodes: {
        default: {
          id: "default",
          texts: ["...你是谁？", "不要浪费我的时间，我还要修炼。", "如果你是来挑战的，等我成年礼那天吧。"],
          choices: [
            { text: "你就是宇昂？", next: "about_self" },
            { text: "成年礼决斗", next: "about_duel" },
            { text: "你怎么看莫凡？", next: "about_mofan", condition: { minOpinion: 5 } },
            { text: "能教我修炼吗？", next: "about_training", condition: { minOpinion: 10 } },
            {
              id: "ask_origin",
              text: "你是穆家亲生的吗？",
              condition: { minOpinion: 10, notNpcFlags: ["asked_origin"] },
              effects: { npcFlags: { asked_origin: true } },
              next: "about_origin"
            },
            {
              id: "ask_power",
              text: "你为什么这么执着于力量？",
              condition: { minOpinion: 20, notNpcFlags: ["asked_power"] },
              effects: { npcFlags: { asked_power: true } },
              next: "about_power"
            },
            {
              id: "after_disaster",
              text: "博城灾难时你在哪？",
              condition: { hasFlag: "bocheng_disaster_happened", notNpcFlags: ["asked_disaster"] },
              effects: { npcFlags: { asked_disaster: true } },
              next: "disaster_whereabouts"
            },
            {
              id: "ask_night_training",
              text: "听说你最近总是深夜外出修炼？",
              condition: { minOpinion: 15, notNpcFlags: ["asked_night_training"] },
              effects: { opinion: -2, npcFlags: { asked_night_training: true }, discoverClue: "clue_yuang_training" },
              next: "night_training_response"
            },
            {
              id: "ask_magic_gear",
              text: "你的地波履魔具很特别，哪来的？",
              condition: { minOpinion: 20, notNpcFlags: ["asked_magic_gear"] },
              effects: { opinion: -3, npcFlags: { asked_magic_gear: true }, discoverClue: "clue_yuang_behavior" },
              next: "magic_gear_response"
            },
            { text: "告辞", next: null, action: "close" }
          ]
        },
        about_self: {
          id: "about_self",
          texts: ["没错，我是穆卓云的养子。", "冰系，已经掌握冰蔓·凝结。", "同龄人中，没几个是我的对手——因为他们把时间浪费在玩乐上，而我在修炼。", "一天不修炼，我就浑身不舒服。"],
          effects: { familiarity: 3 },
          choices: [{ text: "难怪大家叫你修炼疯子", next: "about_crazy" }]
        },
        about_crazy: {
          id: "about_crazy",
          texts: ["疯子？哼，那是弱者对强者的嫉妒。", "穆氏家族那么多子弟，星尘魔器就那些，要轮流使用。", "但我每年能获得大半年的使用时间——因为我值得。", "父亲的命令，我绝对服从。包括...除掉某些人。"],
          effects: { familiarity: 5, trust: -2 },
          choices: [{ text: "...我先走了", next: "default", action: "close" }]
        },
        about_duel: {
          id: "about_duel",
          texts: ["父亲安排我在成年礼上和一个叫莫凡的人决斗。", "本来觉得没意思，但听说他有点实力。", "希望他别让我失望。"],
          effects: { familiarity: 5 },
          choices: [{ text: "拭目以待", next: "default" }]
        },
        about_mofan: {
          id: "about_mofan",
          texts: [
            "莫凡？",
            "（宇昂停下修炼，嘴角勾起一丝不屑的笑。）",
            "一个走了狗屎运的家伙罢了。",
            "听说他觉醒了双系？呵，双系又如何？天赋不代表实力。",
            "成年礼上，我会让他明白——世家培养的天才，和野路子出身的，差距有多大。",
            "（他的眼神变得锐利。）",
            "你和他很熟？劝你离他远点。失败者，只会拖累身边的人。"
          ],
          mood: "arrogant",
          effects: { opinion: -3, giveInfo: "yu_ang_despises_mofan" },
          choices: [
            { text: "莫凡没你想的那么弱", next: "mofan_defend" },
            { text: "也许吧", next: "default" }
          ]
        },
        mofan_defend: {
          id: "mofan_defend",
          texts: [
            "（宇昂冷冷地看了你一眼。）",
            "哦？你倒是挺维护他。",
            "那又如何？事实会证明一切。",
            "（他转身继续修炼，不再理你。）",
            "等成年礼那天，你就知道谁对谁错了。"
          ],
          mood: "cold",
          effects: { opinion: -5 },
          choices: [
            { text: "（离开）", next: "default" }
          ]
        },
        about_training: {
          id: "about_training",
          texts: [
            "教你修炼？",
            "（宇昂上下打量了你一番，露出轻蔑的表情。）",
            "就凭你？",
            "（他叹了口气，似乎在浪费时间。）",
            "算了，看你这么有诚意，我就说一句。",
            "修炼这种事，天赋决定上限，努力决定下限。",
            "像你这种天赋平平的，再努力也追不上天才。",
            "（他转身继续修炼。）",
            "不过……比不努力强。至少不会死得太快。"
          ],
          mood: "arrogant",
          effects: { opinion: -2, exp: 10, giveInfo: "yu_ang_arrogant_advice" },
          choices: [
            { text: "谢谢指教", next: "default" },
            { text: "你太傲慢了", next: "training_arrogant" }
          ]
        },
        training_arrogant: {
          id: "training_arrogant",
          texts: [
            "傲慢？",
            "（宇昂停下修炼，第一次认真看你。）",
            "有实力的人，那不叫傲慢，叫自信。",
            "等你有一天能站在我面前，再说这种话吧。",
            "（他的眼神中闪过一丝异样，但很快恢复了冷漠。）",
            "……滚吧，别打扰我修炼。"
          ],
          mood: "cold",
          effects: { opinion: 3, trust: 2 },
          choices: [
            { text: "那我就证明给你看", next: "default", action: "start_quest", actionData: { questId: "quest_yu_ang_proof" } },
            { text: "（离开）", next: "default" }
          ]
        },
        about_origin: {
          id: "about_origin",
          texts: [
            "（他的眼神冷了一瞬。）",
            "亲生？我没有父母。穆家收养了我，给了我名字和资源。",
            "在这个世界，没有力量的人连活着都是奢望。血缘算什么？",
            "（他顿了顿，语气恢复平静。）",
            "力量才是一切。"
          ],
          mood: "cold",
          effects: { giveInfo: "yu_ang_orphan", trust: 3 },
          choices: [
            { text: "……我明白了", next: "default" }
          ]
        },
        about_power: {
          id: "about_power",
          texts: [
            "（他停下修炼，第一次认真看你。）",
            "为什么？因为这个世界是弱肉强食的。",
            "你以为穆家给我资源是出于善心？不，是因为我有价值。",
            "总有一天……我会获得更强的力量。不是世家给的那种。",
            "（他似乎意识到自己说多了，冷哼一声。）",
            "你不会懂的。"
          ],
          mood: "fanatical",
          effects: { giveInfo: "yu_ang_seeks_dark_power", trust: 5, opinion: -2 },
          choices: [
            { text: "什么意思？", next: "power_hint" },
            { text: "告辞", next: "default" }
          ]
        },
        power_hint: {
          id: "power_hint",
          texts: [
            "（他看了你一眼，嘴角勾起一丝冷笑。）",
            "没什么。回去修炼吧，别在这浪费时间。",
            "（他转身继续修炼，不再理你。但你注意到他的冰系星子中，似乎夹杂着一丝不属于冰的……黑色气息。）"
          ],
          effects: { giveInfo: "yu_ang_dark_hint" },
          choices: [
            { text: "（离开）", next: "default" }
          ]
        },
        disaster_whereabouts: {
          id: "disaster_whereabouts",
          texts: [
            "（他的表情没有任何波澜，仿佛那场灾难与他无关。）",
            "灾难？我在穆家地下室修炼，结界挡住了一切。",
            "倒是你……活下来了，运气不错。",
            "（他转身离开，你注意到他的袖口下，手腕上有一个黑色的印记，一闪而逝。）"
          ],
          mood: "indifferent",
          effects: { giveInfo: "yu_ang_disaster_alibi" },
          choices: [
            { text: "（那个印记……）", next: "default" }
          ]
        },
        night_training_response: {
          id: "night_training_response",
          texts: [
            "（宇昂的眼神瞬间变得锐利。）",
            "我的修炼时间，需要向你汇报吗？",
            "……深夜安静，适合专注修炼。仅此而已。",
            "（他的语气带着一丝警惕，似乎在隐藏什么。）"
          ],
          mood: "cold",
          choices: [
            { text: "抱歉，只是好奇", next: "default" },
            { text: "深夜修炼的地点在哪？", condition: { minOpinion: 25 }, next: "night_training_location" }
          ]
        },
        night_training_location: {
          id: "night_training_location",
          texts: [
            "（宇昂沉默了一会儿。）",
            "……老城区那边，人少，适合修炼。",
            "怎么，你也想去？那里可不安全。",
            "（他的回答太快了，像是早就准备好的。）"
          ],
          mood: "cold",
          effects: { opinion: -2 },
          choices: [
            { text: "我知道了", next: "default" }
          ]
        },
        magic_gear_response: {
          id: "magic_gear_response",
          texts: [
            "（宇昂低头看了一眼脚上的魔具。）",
            "地波履？父亲给的修炼辅助工具罢了。",
            "怎么，你也想要？可惜，这不是你能拥有的东西。",
            "（他的语气带着轻蔑，但你注意到他下意识地把脚往后缩了缩。）"
          ],
          mood: "arrogant",
          choices: [
            { text: "确实很特别", next: "default" },
            { text: "这种魔具不像是学生用的", condition: { minTrust: 15 }, next: "magic_gear_press" }
          ]
        },
        magic_gear_press: {
          id: "magic_gear_press",
          texts: [
            "（宇昂的表情微微一变。）",
            "你懂什么？世家的修炼资源，不是你能想象的。",
            "……不该问的别问。",
            "（他的语气突然变得冰冷，你感觉到了一丝危险的气息。）"
          ],
          mood: "dangerous",
          effects: { opinion: -5, flags: { yu_ang_warned: true } },
          choices: [
            { text: "（退后一步）", next: "default" }
          ]
        }
      }
    }
  },
  liang_bin: {
    id: "liang_bin",
    name: "梁斌",
    title: "地圣泉守卫长 / 中阶土系法师",
    description: "地圣泉的守卫长，中阶土系法师，沉稳可靠，负责守护博城最重要的修炼圣地。进入过地圣泉修炼，实力不俗。",
    avatar: "",
    location: "earth_spring",
    element: "earth",
        elements: ["earth"],
level: 15,
    levelDisplay: "中阶???",
    levelUnknown: true,
    personality: ["沉稳", "可靠", "尽职尽责", "见多识广"],
    baseStats: { hp: 300, mp: 150, attack: 35, defense: 40, speed: 12 },
    skills: ["basic_attack", "earth_shield", "earth_quake", "earth_shift", "bone_spike", "earth_wave"],
    talents: [
          {
                "name": "土系防御修为",
                "type": "acquired",
                "element": "earth",
                "description": "地圣泉守卫长，土系魔法修为深厚，擅长防御和阵地战，守护地圣泉多年。"
          }
    ],
    relationships: {
      lin_yuxin: { type: "subordinate", opinion: 80 }
    },
    growth: {
      base: {
        level: 15,
        elements: ["earth"],
        skills: ["basic_attack","earth_shield","earth_slow"],
        title: "地圣泉守卫长 / 中阶土系法师",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["demon_core", "magic_stone"],
      liked: ["health_potion", "mana_potion"],
      disliked: [],
      baseOpinionGain: 2,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "liang_bin",
      nodes: {
        default: {
          id: "default",
          texts: ["你是来修炼的？", "地圣泉是博城最重要的地方，必须严加看守。", "进去吧，好好珍惜这七天。"],
          choices: [
            { text: "地圣泉有多神奇？", next: "about_spring", action: "talk" },
            { text: "这里安全吗？", next: "about_security", action: "talk" },
            { text: "需要我帮忙守护地圣泉吗？", next: "default", action: "start_quest", actionData: { questId: "quest_liangbin_spring_guard" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_spring: {
          id: "about_spring",
          texts: ["地圣泉是天地灵泉，修炼一小时顶外面三天。", "历史可以追溯到秦朝时期，两千多年了。", "没有地圣泉，博城顶多就是个乡镇。"],
          effects: { familiarity: 5, intelligence: 3 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_security: {
          id: "about_security",
          texts: ["放心，有我在，还有一队守卫。", "一年前有巨眼猩鼠差点挖进来，被我们赶跑了。", "最近发现一些异常的地下水，正在调查。"],
          effects: { familiarity: 3 },
          choices: [{ text: "辛苦了", next: "default", action: "back" }]
        }
      }
    }
  },
  lin_yuxin: {
    id: "lin_yuxin",
    name: "林雨欣",
    title: "地圣泉副卫长 / 水系法师",
    description: "地圣泉的副卫长，英姿飒爽的水系魔法师。妹妹一年前失踪，一直在寻找真相。敏锐细心，察觉到了地圣泉的异常。",
    avatar: "",
    location: "earth_spring",
    element: "water",
        elements: ["water"],
level: 12,
    levelDisplay: "中阶???",
    levelUnknown: true,
    personality: ["敏锐", "细心", "坚韧", "外冷内热"],
    baseStats: { hp: 220, mp: 180, attack: 28, defense: 20, speed: 22 },
    skills: ["basic_attack", "water_heal", "water_chain", "water_wave", "water_tide"],
    talents: [
      {
        id: "water_earth_spring_guardian",
        name: "水系地圣泉守护",
        type: "acquired",
        description: "长期守护地圣泉，与地圣泉的水元素产生共鸣，水系魔法在水源附近威力提升。",
        effects: { waterDamageBonus: 0.1 }
      }
    ],
    relationships: {
      liang_bin: { type: "superior", opinion: 75 }
    },
    growth: {
      base: {
        level: 12,
        elements: ["water"],
        skills: ["basic_attack","water_chain","water_shield"],
        title: "地圣泉副卫长 / 水系法师",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["magic_crystal", "star_map_scroll"],
      liked: ["mana_potion", "magic_herb"],
      disliked: [],
      baseOpinionGain: 2,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 3
    },
    dialogueTree: {
      npcId: "lin_yuxin",
      nodes: {
        default: {
          id: "default",
          texts: ["...有什么事吗？", "我在检查地圣泉的安全。", "如果是来修炼的，进去吧。"],
          choices: [
            { text: "你在调查什么？", next: "about_investigation", action: "talk" },
            { text: "听说你妹妹失踪了", next: "about_sister", action: "talk" },
            { text: "暴躁之泉的事...", next: "about_irritable_spring", condition: { hasFlag: "irritable_spring_clue" }, action: "talk" },
            { text: "地圣泉最近有异常吗？", next: "about_spring_anomaly", condition: { minOpinion: 10 }, action: "talk" },
            { text: "黑教廷和你妹妹有关？", next: "about_black_church", condition: { hasFlag: "black_church_clue", minOpinion: 20 }, action: "talk" },
            { text: "我可以帮忙调查", next: "default", action: "start_quest", actionData: { questId: "quest_linyuxin_sister_missing" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_investigation: {
          id: "about_investigation",
          texts: ["我在地下通道发现了一些奇怪的水。", "和地圣泉很像，但又不太一样...像是被污染了。", "药剂师说那水会让生物变得疯狂，我担心有问题。"],
          effects: { familiarity: 5, intelligence: 5 },
          choices: [
            { text: "这种水在哪里发现的？", next: "about_water_location" },
            { text: "需要帮忙吗？", next: "default", action: "back" }
          ]
        },
        about_water_location: {
          id: "about_water_location",
          oneTime: true,
          texts: ["在地圣泉北侧的地下通道，靠近旧排水系统。", "那里平时很少有人去，我是巡逻时发现的。", "水样已经送去化验了，但结果还没出来。"],
          effects: { familiarity: 3, discoverClue: "clue_irritable_spring_location" },
          choices: [{ text: "我去那里看看", next: "default", action: "back" }]
        },
        about_sister: {
          id: "about_sister",
          texts: ["...一年前，她失踪了。", "大家都说是巨眼猩鼠干的，但我不相信。", "没有找到尸体，她一定还在某个地方。"],
          effects: { opinion: 5, familiarity: 8 },
          choices: [
            { text: "她失踪前有什么异常吗？", next: "about_sister_clue" },
            { text: "我会帮你找的", next: "default", action: "back" }
          ]
        },
        about_sister_clue: {
          id: "about_sister_clue",
          oneTime: true,
          texts: ["她失踪前一直在调查地圣泉的异常。", "她说发现了一些不该发现的东西，有人在监视她。", "然后...她就消失了。我怀疑和那些黑衣人有关。"],
          effects: { opinion: 3, familiarity: 5, discoverClue: "clue_sister_investigation" },
          choices: [{ text: "黑衣人？", next: "about_black_church" }]
        },
        about_irritable_spring: {
          id: "about_irritable_spring",
          texts: ["你也发现了？那种暗红色的泉水...", "我化验过，里面含有一种未知的药剂成分。", "这种药剂会激化生物的野性，妖魔喝了会变得异常狂暴。"],
          effects: { familiarity: 5, intelligence: 5 },
          choices: [
            { text: "是谁炼制的这种药剂？", next: "about_potion_maker" },
            { text: "这和你妹妹有关吗？", next: "about_sister_connection" }
          ]
        },
        about_potion_maker: {
          id: "about_potion_maker",
          oneTime: true,
          texts: ["我查过，这种药剂的配方非常复杂。", "博城只有少数几个药剂师能炼制，但都没有嫌疑。", "除非...是外部势力带来的。我怀疑是黑教廷。"],
          effects: { familiarity: 3, discoverClue: "clue_black_church_potion" },
          choices: [{ text: "黑教廷...", next: "about_black_church" }]
        },
        about_sister_connection: {
          id: "about_sister_connection",
          oneTime: true,
          texts: ["我妹妹失踪前，也在调查类似的东西。", "她的笔记里提到过'狂暴药剂'和'地下交易'。", "我怀疑她就是因为发现了这个才失踪的。"],
          effects: { opinion: 5, familiarity: 5 },
          choices: [{ text: "我会帮你查清真相", next: "default", action: "back" }]
        },
        about_spring_anomaly: {
          id: "about_spring_anomaly",
          texts: ["地圣泉的水最近有些变化。", "灵气浓度下降了约5%，而且偶尔会有暗红色的杂质。", "我怀疑有人在暗中污染地圣泉，但还没有证据。"],
          effects: { familiarity: 5, intelligence: 3 },
          choices: [
            { text: "污染地圣泉有什么目的？", next: "about_pollution_purpose" },
            { text: "需要我帮忙监视吗？", next: "default", action: "back" }
          ]
        },
        about_pollution_purpose: {
          id: "about_pollution_purpose",
          oneTime: true,
          texts: ["地圣泉是博城的根基，污染它可以削弱博城的整体实力。", "如果地圣泉失效，博城的法师修炼速度会大幅下降。", "这可能是黑教廷入侵博城的前奏...我很担心。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "我会警惕的", next: "default", action: "back" }]
        },
        about_black_church: {
          id: "about_black_church",
          texts: ["黑教廷...一个邪恶的组织。", "他们在博城活动了很久，我妹妹的失踪可能和他们有关。", "如果你发现任何黑教廷的线索，请告诉我。"],
          effects: { opinion: 3, familiarity: 5 },
          choices: [{ text: "我会留意的", next: "default", action: "back" }]
        }
      }
    }
  },
  wan_duanfeng: {
    id: "wan_duanfeng",
    name: "万断风",
    title: "千人团军长 / 中阶土系法师",
    description: "博城军部千人团军长，中阶土系法师，论防守整个博城没人比他更出色。驻守雪峰山驿站北面关卡，是博城北方的屏障。",
    avatar: "",
    location: "xuefeng_station",
    element: "earth",
        elements: ["earth"],
level: 18,
    levelDisplay: "???",
    levelUnknown: true,
    personality: ["威严", "沉稳", "防守大师", "忠心耿耿"],
    baseStats: { hp: 400, mp: 200, attack: 40, defense: 55, speed: 10 },
    skills: ["basic_attack", "earth_shield", "earth_quake", "earth_shift", "bone_spike", "earth_wave"],
    talents: [
      {
        id: "earth_defense_master",
        name: "土系防守大师",
        type: "acquired",
        description: "博城军部千人团军长，论防守整个博城没人比他更出色，长期驻守北方关卡。",
        effects: { earthDefenseBonus: 0.25 }
      }
    ],
    relationships: {
      zhankong: { type: "superior", opinion: 90 }
    },
    growth: {
      base: {
        level: 18,
        elements: ["earth"],
        skills: ["basic_attack","earth_shield","earth_slow"],
        title: "千人团军长 / 中阶土系法师",
        growthType: "mage",
      },
    },
    giftPreferences: {
      loved: ["demon_core", "elite_soul"],
      liked: ["health_potion", "magic_stone"],
      disliked: [],
      baseOpinionGain: 2,
      lovedMultiplier: 2,
      likedMultiplier: 1.3,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    dialogueTree: {
      npcId: "wan_duanfeng",
      nodes: {
        default: {
          id: "default",
          texts: ["你来驿站做什么？", "北面关卡由我镇守，放心。", "最近雨下得奇怪，要小心。"],
          choices: [
            { text: "北面情况怎么样？", next: "about_north", action: "talk" },
            { text: "蓝色警戒是什么？", next: "about_alert", action: "talk" },
            { text: "雪峰山的妖魔多吗？", next: "about_demons", action: "talk" },
            { text: "斩空教官是谁？", next: "about_zhankong", condition: { minOpinion: 5 }, action: "talk" },
            { text: "土系防守魔法怎么练？", next: "about_earth_defense", condition: { element: "earth", minOpinion: 10 }, action: "talk" },
            { text: "最近有什么异常吗？", next: "about_anomaly", condition: { minOpinion: 15 }, action: "talk" },
            { text: "需要我帮忙巡逻吗？", next: "default", action: "start_quest", actionData: { questId: "quest_wanduanfeng_north_patrol" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_north: {
          id: "about_north",
          texts: ["北面是雪峰山深处，妖魔众多。", "我们守着关卡，防止妖魔南下。", "最近橙雾有点重，不太对劲。"],
          effects: { familiarity: 5, intelligence: 3 },
          choices: [
            { text: "橙雾是什么？", next: "about_orange_fog" },
            { text: "辛苦了", next: "default", action: "back" }
          ]
        },
        about_orange_fog: {
          id: "about_orange_fog",
          oneTime: true,
          texts: ["雪峰山深处偶尔会出现橙色的雾气。", "雾气里的妖魔会变得异常狂暴，连统领级都会失控。", "我们军部称之为'狂雾'，每次出现都要提高警戒。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_alert: {
          id: "about_alert",
          oneTime: true,
          texts: ["警戒分四级：蓝、黄、橙、红。", "蓝色是最低级，发现异常就拉蓝色警戒。", "黄色是妖魔群出现，橙色是大规模入侵，红色是灾难级。"],
          effects: { familiarity: 5, intelligence: 5 },
          choices: [{ text: "明白了", next: "default", action: "back" }]
        },
        about_demons: {
          id: "about_demons",
          texts: ["雪峰山的妖魔种类很多。", "奴仆级的有独眼魔狼、巨眼猩鼠，战将级的有幽狼兽、翼苍狼。", "再深处还有统领级的，不过一般不会南下。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [
            { text: "统领级的妖魔有多强？", next: "about_commander" },
            { text: "我记住了", next: "default", action: "back" }
          ]
        },
        about_commander: {
          id: "about_commander",
          oneTime: true,
          texts: ["统领级妖魔，一个就能灭一个小队。", "它们有智慧，会战术，不是靠蛮力。", "博城历史上几次大灾难，都是统领级妖魔带头的。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "真可怕", next: "default", action: "back" }]
        },
        about_zhankong: {
          id: "about_zhankong",
          oneTime: true,
          texts: ["斩空？那是我的老长官，博城军部的总教官。", "他是翼苍狼的克星，一人一剑守了雪峰山十年。", "这次历练就是他设计的，表面上没老师保护，实际上我们都在暗中跟着。"],
          effects: { familiarity: 5, intelligence: 3 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_earth_defense: {
          id: "about_earth_defense",
          texts: ["土系防守，关键在于'稳'。", "地波·挪移用来闪避，岩障·嶙石用来防御。", "记住，最好的防守不是硬抗，而是让敌人打不到你。"],
          effects: { familiarity: 5, intelligence: 10 },
          choices: [{ text: "受教了", next: "default", action: "back" }]
        },
        about_anomaly: {
          id: "about_anomaly",
          texts: ["...你也察觉到了？", "最近北面的妖魔活动异常频繁，像是被什么东西驱赶着南下。", "军部已经加强了巡逻，但我总觉得要出大事。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [
            { text: "是什么在驱赶妖魔？", next: "about_anomaly_cause" },
            { text: "我会警惕的", next: "default", action: "back" }
          ]
        },
        about_anomaly_cause: {
          id: "about_anomaly_cause",
          oneTime: true,
          texts: ["不清楚。可能是深处的统领级在移动，也可能是人为的。", "我派人去查过，但都没回来...", "这件事你知道就行，不要到处说，免得引起恐慌。"],
          effects: { familiarity: 3, trust: 5 },
          choices: [{ text: "我明白", next: "default", action: "back" }]
        }
      }
    }
  },
  zhu_principal: {
    id: "zhu_principal",
    name: "朱校长",
    title: "天澜魔法高中校长",
    description: "天澜魔法高中的大校长，在学生和家长们心中威望极高。他颇有半隐士的意味，可大事情依旧会出来主持。朱校长始终站在普通学生们这边，宁愿在世家、家族的压力下也保护普通学生，培养了很多并没有什么背景的出色魔法师。",
    elements: [
      "fire",
      "water"
    ],
    level: 20,
    levelDisplay: "???",
    levelUnknown: true,
    maxHp: 800,
    maxMp: 500,
    attack: 80,
    defense: 50,
    speed: 40,
    skills: ["basic_attack", "fire_bolt", "fire_rain", "fire_burst", "fire_fist", "fire_fist_nine", "water_heal", "water_chain", "water_wave", "water_tide", "water_arc_shield"],
    spriteColor: "#8B4513",
    location: "tianlan_school",
    availableTimes: [
      "morning",
      "afternoon"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "年轻人，修炼之路漫漫，要沉得住气。"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.8,
      kind: 0.9,
      honest: 0.85,
      impulsive: 0.2,
      loyal: 0.9,
      arrogant: 0.1,
      greedy: 0.1,
      curious: 0.6,
      wise: 0.95
    },
    giftPreferences: {
      loved: [
        "magic_herb",
        "super_mana_potion"
      ],
      liked: [
        "health_potion",
        "mana_potion",
        "demon_core"
      ],
      disliked: [],
      baseOpinionGain: 3,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    relationships: {
      deng_kai: {
        opinion: 90,
        trust: 90,
        type: "friend",
        label: "老战友"
      },
      mu_zhuoyun: {
        opinion: -30,
        trust: -20,
        type: "rival",
        label: "老对头"
      }
    },
    
    growth: {
      base: {
        level: 20,
        elements: ["fire","water"],
        skills: ["basic_attack","fire_bolt","water_shield"],
        title: "天澜魔法高中校长",
        growthType: "mage",
      },
    },dialogueTree: {
      npcId: "zhu_principal",
      nodes: {
        default: {
          id: "default",
          texts: ["年轻人，来找我有什么事吗？", "修炼要循序渐进，不可急于求成。", "学校是你们的后盾，好好努力。"],
          choices: [
            { text: "请教修炼心得", next: "about_training", action: "talk" },
            { text: "问问学校的情况", next: "about_school", action: "talk" },
            { text: "年度考核是什么？", next: "about_exam", action: "talk" },
            { text: "穆氏世家怎么样？", next: "about_mu_family", condition: { minOpinion: 10 }, action: "talk" },
            { text: "博城最近安全吗？", next: "about_safety", condition: { minOpinion: 15 }, action: "talk" },
            { text: "学校有委托任务吗？", next: "default", action: "start_quest", actionData: { questId: "quest_zhuprincipal_school_quest" } },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_training: {
          id: "about_training",
          texts: ["修炼一途，天赋重要，努力更重要。", "光靠冥修是不够的，实战才能真正提升实力。", "记住，审时度势，别做无意义的事。"],
          effects: { intelligence: 10, familiarity: 5 },
          choices: [
            { text: "怎么才能快速提升？", next: "about_fast_training" },
            { text: "受教了", next: "default", action: "back" }
          ]
        },
        about_fast_training: {
          id: "about_fast_training",
          oneTime: true,
          texts: ["快速提升？没有捷径。", "但地圣泉那种灵泉，可以让修炼速度翻倍。", "还有星尘魔器，辅助修炼效果也不错。不过这些都需要机缘。"],
          effects: { intelligence: 5, familiarity: 3 },
          choices: [{ text: "我明白了", next: "default", action: "back" }]
        },
        about_school: {
          id: "about_school",
          texts: ["天澜魔法高中是博城最好的公立学校。", "我们培养了很多优秀的魔法师，他们出身平凡，却成就非凡。", "学校会尽力为每一个学生提供公平的机会。"],
          effects: { familiarity: 5 },
          choices: [
            { text: "学校和穆氏有矛盾吗？", next: "about_school_mu_conflict" },
            { text: "明白了", next: "default", action: "back" }
          ]
        },
        about_school_mu_conflict: {
          id: "about_school_mu_conflict",
          oneTime: true,
          texts: ["穆氏世家是博城的老牌势力，资源丰富。", "他们总想控制学校，把好资源都给自家子弟。", "但我朱某人还在一天，就不会让他们乱来。普通学生的机会，一个都不能少。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [{ text: "校长真有担当", next: "default", action: "back" }]
        },
        about_exam: {
          id: "about_exam",
          texts: ["年度考核是检验学生修炼成果的重要考试。", "分为星感石测试和释放考核两部分，综合评分。", "评级高的学生，可以获得地圣泉修炼资格等奖励。"],
          effects: { familiarity: 5, intelligence: 5 },
          choices: [
            { text: "怎么才能拿高分？", next: "about_exam_tips" },
            { text: "我会好好准备的", next: "default", action: "back" }
          ]
        },
        about_exam_tips: {
          id: "about_exam_tips",
          texts: ["星感石测试看精神力和元素亲和度。", "释放考核看魔法的控制力和威力。", "平时多修炼，考试时放松心态，正常发挥就好。"],
          effects: { intelligence: 5 },
          choices: [{ text: "谢谢校长", next: "default", action: "back" }]
        },
        about_mu_family: {
          id: "about_mu_family",
          texts: ["穆氏世家...博城的土皇帝。", "他们家大业大，连市政厅都要给三分面子。", "但世家也有世家的规矩，不会太过分。你只要不主动惹事，他们也不会找你麻烦。"],
          effects: { familiarity: 3 },
          choices: [
            { text: "穆卓云是什么样的人？", next: "about_mu_zhuoyun" },
            { text: "我记住了", next: "default", action: "back" }
          ]
        },
        about_mu_zhuoyun: {
          id: "about_mu_zhuoyun",
          oneTime: true,
          texts: ["穆卓云？穆氏的家主，性格暴躁，护短得很。", "他为了自家子弟，可以不择手段。", "但他也不是完全不讲理，只要你有实力，他也会高看你一眼。"],
          effects: { familiarity: 3, intelligence: 3 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_safety: {
          id: "about_safety",
          texts: ["...你也感觉到了？", "博城最近不太太平，妖魔活动频繁，军部已经加强警戒了。", "具体情况我不能多说，但你自己要小心，晚上不要乱跑。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [
            { text: "会有大灾难吗？", next: "about_disaster" },
            { text: "我会小心的", next: "default", action: "back" }
          ]
        },
        about_disaster: {
          id: "about_disaster",
          oneTime: true,
          texts: ["希望不会。但博城三面环山，历史上多次遭遇妖魔潮。", "学校已经做好了应急预案，真到那时候，会保护学生的。", "这件事不要到处说，免得引起恐慌。"],
          effects: { familiarity: 3, trust: 5 },
          choices: [{ text: "我明白", next: "default", action: "back" }]
        }
      }
    }
  },
  deng_kai: {
    id: "deng_kai",
    name: "邓凯",
    title: "猎者联盟大长老 / 校董",
    description: "博城猎者联盟的大长老，同时也是天澜魔法高中的校董，算是所有校董之中修为最高、实力最强的人。地位超然，实力还在那位叫做杨作河的中阶魔法师之上。正义感强，在穆卓云暴怒时站出来挡在学生面前，保护没有防御能力的学生。完全站在学生这一边，很看重有潜力的年轻魔法师。",
    elements: [
      "thunder",
      "wind"
    ],
    level: 18,
    elementLevels: {
      thunder: 18,
      wind: 15
    },
    levelDisplay: "???",
    levelUnknown: true,
    maxHp: 700,
    maxMp: 450,
    attack: 90,
    defense: 40,
    speed: 60,
    skills: ["basic_attack", "thunder_bolt", "thunder_chain", "thunder_strike", "thunder_praise", "thunder_praise_yecha", "wind_blade", "wind_speed", "wind_tornado", "sky_dive", "wind_wing"],
    talents: [
      {
        name: "雷风双系修为",
        type: "acquired",
        element: "thunder",
        description: "猎者联盟大长老，雷系+风系双系中阶法师，猎妖经验丰富，擅长快速追击和范围打击。"
      }
    ],
    spriteColor: "#4169E1",
    location: "hunter_guild",
    availableTimes: [
      "morning",
      "afternoon",
      "evening"
    ],
    dialogue: [
      {
        trigger: "default",
        text: "年轻人，想加入猎者联盟吗？"
      }
    ],
    givesQuests: [],
    personality: {
      brave: 0.9,
      kind: 0.7,
      honest: 0.8,
      impulsive: 0.3,
      loyal: 0.85,
      arrogant: 0.2,
      greedy: 0.2,
      curious: 0.7,
      wise: 0.8
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
      baseOpinionGain: 3,
      lovedMultiplier: 2,
      likedMultiplier: 1.5,
      dislikedMultiplier: 0.5,
      dailyGiftLimit: 2
    },
    relationshipCap: {
      maxOpinion: 100,
      maxTrust: 100,
      canRomance: false,
      canBeMentor: true,
      canBeRival: false
    },
    relationships: {
      zhu_principal: {
        opinion: 90,
        trust: 90,
        type: "friend",
        label: "老战友"
      },
      yang_zuohe: {
        opinion: 60,
        trust: 50,
        type: "colleague",
        label: "同僚"
      },
      mu_zhuoyun: {
        opinion: 60,
        trust: 50,
        type: "acquaintance",
        label: "平辈"
      },
      tang_yue: {
        opinion: 70,
        trust: 65,
        type: "colleague",
        label: "同事"
      },
      hunter_li: {
        opinion: 80,
        trust: 75,
        type: "colleague",
        label: "下属"
      }
    },
    dialogueTree: {
      npcId: "deng_kai",
      nodes: {
        default: {
          id: "default",
          texts: ["年轻人，来找我有什么事？", "猎妖是个危险的活，你准备好了吗？", "有实力的年轻人，我们猎者联盟很欢迎。"],
          choices: [
            { text: "问问猎者联盟的情况", next: "about_guild", action: "talk" },
            { text: "请教猎妖经验", next: "about_hunting", action: "talk" },
            { text: "怎么加入猎者联盟？", next: "about_join", action: "talk" },
            { text: "雷系魔法怎么练？", next: "about_thunder", condition: { element: "thunder", minOpinion: 10 }, action: "talk" },
            { text: "您认识穆卓云族长吗？", next: "about_mu", action: "talk" },
            { text: "博城最近安全吗？", next: "about_safety", condition: { minOpinion: 15 }, action: "talk" },
            { text: "朱校长是个什么样的人？", next: "about_zhu", condition: { minOpinion: 10 }, action: "talk" },
            { text: "告辞", next: "default", action: "back" }
          ]
        },
        about_guild: {
          id: "about_guild",
          texts: ["猎者联盟是魔法师们自发组成的组织。", "我们接受各种猎妖任务，保护城市的安全。", "加入猎者联盟，不仅能获得报酬，还能提升实力。"],
          effects: { familiarity: 5 },
          choices: [
            { text: "猎者联盟和城市猎妖队有什么区别？", next: "about_guild_vs_hunters" },
            { text: "明白了", next: "default", action: "back" }
          ]
        },
        about_guild_vs_hunters: {
          id: "about_guild_vs_hunters",
          oneTime: true,
          texts: ["城市猎妖队是官方组织，负责城市内的妖魔事件。", "猎者联盟更自由，可以接野外任务，报酬也更高。", "但风险也更大，没有官方保障，全靠自己。"],
          effects: { familiarity: 3, intelligence: 5 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_hunting: {
          id: "about_hunting",
          texts: ["猎妖可不是闹着玩的，随时都可能丢性命。", "光有实力不够，还要有经验和智慧。", "记住，活着回来才是最重要的。"],
          effects: { intelligence: 8, familiarity: 5 },
          choices: [
            { text: "有什么猎妖技巧吗？", next: "about_hunting_tips" },
            { text: "受教了", next: "default", action: "back" }
          ]
        },
        about_hunting_tips: {
          id: "about_hunting_tips",
          texts: ["第一，了解你的对手，妖魔的特性比实力更重要。", "第二，善用地形，以弱胜强的关键就是环境。", "第三，打不过就跑，留得青山在不怕没柴烧。"],
          effects: { intelligence: 10, familiarity: 3 },
          choices: [{ text: "我记住了", next: "default", action: "back" }]
        },
        about_join: {
          id: "about_join",
          texts: ["想加入猎者联盟？不难。", "只要通过基础考核，就能成为见习猎者。", "考核内容很简单：单独击败一只奴仆级妖魔。怎么样，敢试试吗？"],
          effects: { familiarity: 3 },
          choices: [
            { text: "我想试试", next: "about_join_accept" },
            { text: "我再考虑考虑", next: "default", action: "back" }
          ]
        },
        about_join_accept: {
          id: "about_join_accept",
          oneTime: true,
          texts: ["好！有胆量。", "这样，你先去东郊击败一只独眼魔狼，把魔狼皮带回来给我。", "完成后，你就是猎者联盟的见习猎者了。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [{ text: "我这就去", next: "default", action: "back" }]
        },
        about_thunder: {
          id: "about_thunder",
          texts: ["雷系？好！雷系是攻击最强的元素之一。", "雷印的麻痹效果，在猎妖时非常有用。", "记住，雷系的关键是'快'和'准'，一击制敌。"],
          effects: { familiarity: 5, intelligence: 10 },
          choices: [
            { text: "雷系有什么进阶技巧？", next: "about_thunder_advanced" },
            { text: "受教了", next: "default", action: "back" }
          ]
        },
        about_thunder_advanced: {
          id: "about_thunder_advanced",
          oneTime: true,
          texts: ["雷系中阶有霹雳，范围大，威力强。", "但最厉害的是雷系的灵种，比如'夜叉'，可以召唤雷兽。", "不过灵种可遇不可求，要看机缘。"],
          effects: { intelligence: 5, familiarity: 3 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        },
        about_mu: {
          id: "about_mu",
          texts: ["卓云啊，老相识了。实力确实强，冰系高阶在博城没几个对手。", "就是脾气大了点，有时候控制不住情绪。上次在学校差点出事，还是我挡下来的。", "年轻人，在博城混，最好不要得罪穆氏世家。"],
          choices: [
            { text: "穆氏世家很厉害吗？", next: "about_mu_power" },
            { text: "多谢提醒。", next: "default", action: "back" }
          ]
        },
        about_mu_power: {
          id: "about_mu_power",
          oneTime: true,
          texts: ["穆氏是博城的老牌世家，传承了几百年。", "他们家的冰系魔法，在整个南方都有名。", "不过穆卓云虽然护短，但也不是不讲理的人。你有实力，他也会高看你一眼。"],
          effects: { familiarity: 3, intelligence: 3 },
          choices: [{ text: "我明白了", next: "default", action: "back" }]
        },
        about_safety: {
          id: "about_safety",
          texts: ["...你也察觉到了？", "博城最近不太太平，妖魔活动频繁，猎者联盟的任务量翻了一倍。", "具体原因我也不清楚，但总觉得要出大事。你自己要小心。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [
            { text: "会有大灾难吗？", next: "about_disaster" },
            { text: "我会小心的", next: "default", action: "back" }
          ]
        },
        about_disaster: {
          id: "about_disaster",
          oneTime: true,
          texts: ["希望不会。但博城三面环山，历史上多次遭遇妖魔潮。", "猎者联盟已经做好了准备，真到那时候，我们会顶在前面。", "这件事不要到处说，免得引起恐慌。"],
          effects: { familiarity: 3, trust: 5 },
          choices: [{ text: "我明白", next: "default", action: "back" }]
        },
        about_zhu: {
          id: "about_zhu",
          oneTime: true,
          texts: ["朱校长？我的老战友了。", "我们当年一起猎妖，他救过我的命，我也救过他的。", "他这个人，看似温和，实则刚硬。为了保护学生，可以和穆氏翻脸。"],
          effects: { familiarity: 5, opinion: 3 },
          choices: [{ text: "原来如此", next: "default", action: "back" }]
        }
      }
    }
  },

  // ========== 明珠学府篇新NPC ==========

  mu_nujiao: {
    id: "mu_nujiao",
    name: "牧奴娇",
    title: "明珠女神",
    description: "牧家大小姐，全校公认的女神。天仙之姿，却嗜战如魔。风系+植物系双系中阶法师，战斗经验丰富。",
    elements: ["wind", "plant"],
    level: 10,
    elementLevels: {
      wind: 10,
      plant: 8
    },
    maxHp: 600,
    maxMp: 200,
    attack: 35,
    defense: 20,
    speed: 28,
    spirit: 30,
    skills: ["basic_attack", "wind_blade", "wind_speed", "wind_tornado", "plant_vine_bind", "plant_thorn", "plant_forest"],
    aiType: "tactical",
    growthType: "mage",
    canDuel: true,
    spriteColor: "#98FB98",
    location: "mingzhu_qing_campus",
    availableTimes: ["morning", "afternoon", "evening"],
    dialogue: [
      { trigger: "default", text: "..." }
    ],
    givesQuests: [],
    personality: {
      brave: 0.85, kind: 0.5, honest: 0.7, impulsive: 0.3,
      loyal: 0.6, arrogant: 0.4, greedy: 0.1, curious: 0.6
    },
    giftPreferences: {
      loved: ["demon_core_command", "spirit_seed_plant"],
      liked: ["magic_stone", "mana_potion"],
      disliked: [],
      baseOpinionGain: 5, lovedMultiplier: 3, likedMultiplier: 1.5, dislikedMultiplier: 0.5, dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 100, maxTrust: 100, canRomance: true, canBeMentor: false, canBeRival: true
    },
    relationships: {
      mo_fan: { opinion: 25, trust: 10, type: "rival", label: "斗兽大赛对手" }
    },
    growth: {
      growthRate: 50,
      base: {
        level: 10,
        elements: ["wind", "plant"],
        skills: ["basic_attack", "wind_track_phantom", "plant_vine_bind"],
        title: "明珠女神",
        growthType: "mage",
      },
      events: [
        {
          after: "mingzhu_entrance",
          level: 18,
          addSkills: ["wind_tornado", "plant_forest_prison"],
          title: "双系中阶·明珠女神",
          unlocks: ["duel"],
        }
      ]
    },
    dialogueTree: {
      npcId: "mu_nujiao",
      nodes: {
        default: {
          id: "default",
          texts: [
            "……什么事？",
            "嗯？",
            "是你。"
          ],
          mood: "cold",
          choices: [
            { id: "chat", text: "随便聊聊", condition: { minOpinion: 10 }, nextNode: "small_talk" },
            { id: "ask_training", text: "请教修炼问题", condition: { minOpinion: 15 }, effects: { exp: 15, opinion: 2 }, nextNode: "training_advice" },
            { id: "duel", text: "切磋一下？", condition: { minOpinion: 30, minLevel: 5 }, effects: { opinion: 5 }, nextNode: "duel_response", action: "start_battle", actionData: { enemyId: "mu_nujiao" } },
            { id: "ask_plant", text: "你的植物系很厉害", condition: { minOpinion: 20 }, nextNode: "plant_magic" },
            { id: "about_battle", text: "新生大赛那场……", condition: { minOpinion: 25, npcFlags: { "battle_mu_nujiao_done": true } }, nextNode: "rematch_talk" },
            { id: "give_gift", text: "送你东西", action: "open_gift" },
            { id: "leave", text: "告辞", nextNode: null }
          ]
        },
        small_talk: {
          id: "small_talk",
          texts: [
            "我不太擅长闲聊。如果你想切磋，我可以奉陪。",
            "艾图图又拉着你说话了？她就是话多。",
            "在学校还习惯吗？明珠不像博城，这里竞争激烈得多。"
          ],
          choices: [
            { id: "back", text: "那我不打扰了", nextNode: "default" }
          ]
        },
        training_advice: {
          id: "training_advice",
          texts: [
            "修炼没有捷径，但有方法。星子的连接不是靠蛮力，是靠感知。",
            "你雷系速度很快，但控制力不足。试试在引导时放慢速度，感受每一颗星子的律动。",
            "中阶之后，星图的描画需要精神力高度集中。你的精神力……比一般初阶强得多。"
          ],
          choices: [
            { id: "thanks", text: "受教了", effects: { opinion: 3 }, nextNode: "default" }
          ]
        },
        duel_response: {
          id: "duel_response",
          texts: [
            "好。我也想看看，你到底有多少实力。",
            "希望你比白藏锋强一点。",
            "来吧，我不会手下留情。"
          ],
          choices: [
            { id: "start", text: "请", nextNode: null }
          ]
        },
        plant_magic: {
          id: "plant_magic",
          texts: [
            "植物系不只是攻击，更重要的是控制。藤条缠绕、荆棘束缚，能为队友创造机会。",
            "我见过你战斗，你太依赖雷系的爆发。真正的战斗，控制比伤害更重要。",
            "……当然，你的雷系威力确实不一般。那种紫色的雷，不是凡种吧？"
          ],
          condition: { minOpinion: 35 },
          choices: [
            { id: "reveal", text: "是灵种", condition: { minOpinion: 50 }, effects: { opinion: 5, trust: 5, giveInfo: "mu_knows_spirit_seed" }, nextNode: "spirit_seed_reveal" },
            { id: "deflect", text: "秘密", effects: { opinion: -2 }, nextNode: "secret_kept" },
            { id: "back", text: "多谢指点", nextNode: "default" }
          ]
        },
        spirit_seed_reveal: {
          id: "spirit_seed_reveal",
          texts: [
            "果然……我就觉得不对。灵级雷种，难怪白藏锋挡不住。",
            "你放心，我不会告诉别人。每个人都有自己的机缘。",
            "不过你也要小心，灵种这种东西，被人知道了会招来麻烦。"
          ],
          choices: [
            { id: "thanks", text: "谢谢", effects: { trust: 5 }, nextNode: "default" }
          ]
        },
        secret_kept: {
          id: "secret_kept",
          texts: [
            "……也罢。谁都有秘密。",
            "不想说就算了。"
          ],
          choices: [
            { id: "back", text: "告辞", nextNode: "default" }
          ]
        },
        rematch_talk: {
          id: "rematch_talk",
          texts: [
            "那场战斗……我输得心服口服。你的霹雳夜叉，我挡不住。",
            "但下次就不一定了。我也在进步。",
            "你是个值得认真对待的对手。"
          ],
          choices: [
            { id: "rematch", text: "随时奉陪", effects: { opinion: 5, trust: 3 }, nextNode: "default" }
          ]
        }
      }
    },
  },
  ai_tutu: {
    id: "ai_tutu",
    name: "艾图图",
    isCombatant: false,
    combatUnknown: true,
    combatNote: "博城篇前期战力未明确展现，待剧情推进后补充",
    title: "白兔少女",
    description: "牧奴娇的闺蜜，出身豪门。娇小活泼，性格大大咧咧，有很多追求者。与莫凡、牧奴娇合租金源公寓。",
    elements: ["light"],
    level: 5,
    maxHp: 200,
    maxMp: 150,
    attack: 12,
    defense: 8,
    speed: 15,
    spirit: 18,
    skills: ["basic_attack", "light_ray", "light_blind"],
    aiType: "support",
    growthType: "mage",
    canDuel: false,
    spriteColor: "#FFC0CB",
    location: "jinyuan_apartment",
    availableTimes: ["morning", "afternoon", "evening"],
    dialogue: [
      { trigger: "default", text: "大魔头！你又在偷懒！" },
      { trigger: "greeting_morning", text: "早啊大魔头，今天有没有什么好玩的事？" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4, kind: 0.7, honest: 0.6, impulsive: 0.8,
      loyal: 0.7, arrogant: 0.2, greedy: 0.3, curious: 0.9
    },
    giftPreferences: {
      loved: ["snack", "cute_doll"],
      liked: ["mana_potion", "magic_stone"],
      disliked: [],
      baseOpinionGain: 5, lovedMultiplier: 3, likedMultiplier: 1.5, dislikedMultiplier: 0.5, dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 100, maxTrust: 100, canRomance: true, canBeMentor: false, canBeRival: false
    },
    relationships: {
      mu_nujiao: { opinion: 90, trust: 85, type: "best_friend", label: "好闺蜜" },
      mo_fan: { opinion: 40, trust: 20, type: "roommate", label: "合租室友" }
    },
    dialogueTree: {
      npcId: "ai_tutu",
      nodes: {
        default: {
          id: "default",
          texts: [
            "大魔头！你又在偷懒！",
            "嘿，今天有没有什么好玩的事？",
            "回来啦？牧姐姐不在，你可别偷看我！"
          ],
          mood: "playful",
          choices: [
            { id: "chat_daily", text: "今天过得怎么样？", nextNode: "daily_chat" },
            { id: "ask_shield", text: "当挡箭牌的事还算数吗？", condition: { minOpinion: 10 }, nextNode: "shield_business" },
            { id: "ask_mu", text: "牧奴娇在干嘛？", condition: { minOpinion: 5 }, nextNode: "about_mu" },
            { id: "ask_cultivation", text: "你修炼得怎么样了？", condition: { minOpinion: 15 }, nextNode: "cultivation_chat" },
            { id: "tease", text: "你那些追求者又来了？", condition: { minOpinion: 25 }, effects: { opinion: -2 }, nextNode: "suitors" },
            { id: "give_gift", text: "我有东西给你", action: "open_gift" },
            { id: "leave", text: "先走了", effects: {}, nextNode: null }
          ]
        },
        daily_chat: {
          id: "daily_chat",
          texts: [
            "无聊死了！修炼修炼修炼，每天除了修炼就是修炼，那些追求者又烦得要死。",
            "今天韩洛又送花来了，被我直接扔垃圾桶了。还有那个贾文清，一副自以为是的样子。",
            "牧姐姐今天又在修炼，她真的好努力啊……我就不行，坐不住。"
          ],
          choices: [
            { id: "back", text: "回去", nextNode: "default" }
          ]
        },
        shield_business: {
          id: "shield_business",
          texts: [
            "当然算数！一次五万，概不赊账。你当我挡箭牌，我给你钱，公平交易！",
            "说好了啊，那些烦人的追求者来了你得帮我挡着。特别是韩洛和贾文清，跟苍蝇一样。"
          ],
          effects: { npcFlags: { knows_shield_deal: true } },
          choices: [
            { id: "accept", text: "成交，有钱不赚王八蛋", effects: { opinion: 5, npcFlags: { shield_deal: true } }, nextNode: "deal_accepted" },
            { id: "decline", text: "五万太少了吧", effects: { opinion: -1 }, nextNode: "haggle" },
            { id: "back", text: "算了", nextNode: "default" }
          ]
        },
        deal_accepted: {
          id: "deal_accepted",
          texts: [
            "爽快！我就喜欢你这种痛快人。大魔头，以后你就是我艾图图的御用挡箭牌了！",
            "嘻嘻，有你在那些人就不敢烦我了。说真的，你打架的样子还挺帅的……啊我什么都没说！"
          ],
          choices: [
            { id: "back", text: "回去", nextNode: "default" }
          ]
        },
        haggle: {
          id: "haggle",
          texts: [
            "喂！五万还少？你知不知道那些人有多烦！算了算了，六万，不能再多了！",
            "你个大魔头还缺钱？你不是新生大赛赢了不少吗？"
          ],
          choices: [
            { id: "accept2", text: "行，六万就六万", effects: { opinion: 3, npcFlags: { shield_deal: true } }, nextNode: "deal_accepted" },
            { id: "back", text: "再想想", nextNode: "default" }
          ]
        },
        about_mu: {
          id: "about_mu",
          texts: [
            "牧姐姐啊，她又在修炼了。她有星云魔器，修炼速度比我快好多，羡慕死了。",
            "牧姐姐其实挺在意你的，别看她表面冷冰冰的。你上次在新生大赛把白藏锋劈了，她回来念叨了好几天呢。",
            "牧姐姐就是太好强了，什么都要争第一。其实她挺累的。"
          ],
          condition: { minOpinion: 20 },
          effects: { giveInfo: "mu_nujiao_has_nebula_artifact" },
          choices: [
            { id: "more", text: "她念叨我什么？", condition: { minOpinion: 40 }, effects: { opinion: 3 }, nextNode: "mu_gossip" },
            { id: "back", text: "这样啊", nextNode: "default" }
          ]
        },
        mu_gossip: {
          id: "mu_gossip",
          texts: [
            "她说……说你战斗的时候像变了个人，跟平时那个吊儿郎当的样子完全不一样。还说你的雷系很奇怪，不像是凡种。",
            "哎呀我是不是说太多了？你可别告诉牧姐姐是我说的！她会杀了我的！"
          ],
          choices: [
            { id: "back", text: "我保密", effects: { opinion: 5, trust: 3 }, nextNode: "default" }
          ]
        },
        cultivation_chat: {
          id: "cultivation_chat",
          texts: [
            "我光系才Lv5，好慢啊……牧姐姐都中阶了，我还在初阶晃悠。",
            "光系修炼好无聊啊，就是打坐打坐打坐。我看你又是雷又是火的，多帅啊！",
            "你说我什么时候才能到中阶啊？爸说要给我买灵种，可光系灵种好贵的。"
          ],
          choices: [
            { id: "encourage", text: "慢慢来，你可以的", effects: { opinion: 3 }, nextNode: "encouraged" },
            { id: "tease2", text: "你就偷懒吧", effects: { opinion: -2 }, nextNode: "teased" },
            { id: "back", text: "加油", nextNode: "default" }
          ]
        },
        encouraged: {
          id: "encouraged",
          texts: [
            "哼，你倒是会说。不过……谢啦，大魔头也会说人话嘛。",
            "好！我决定了，明天开始认真修炼！……明天一定！"
          ],
          choices: [
            { id: "back", text: "回去", nextNode: "default" }
          ]
        },
        teased: {
          id: "teased",
          texts: [
            "喂！我哪有偷懒！我……我只是比较活泼而已！",
            "不理你了！大魔头最讨厌了！"
          ],
          choices: [
            { id: "back", text: "好好好", nextNode: "default" }
          ]
        },
        suitors: {
          id: "suitors",
          texts: [
            "别提了！韩洛那个伪君子，贾文清那个莽夫，还有些连名字都记不住的。烦都烦死了！",
            "不过说真的，有你当挡箭牌之后清净多了。他们看到你就跟见了鬼似的，哈哈哈！"
          ],
          choices: [
            { id: "back", text: "那我继续当", effects: { opinion: 2 }, nextNode: "default" }
          ]
        }
      }
    },
    isCanon: true,
    canonSource: "第204章 合租"
  },

  lingling: {
    id: "lingling",
    name: "灵灵",
    title: "猎人大师",
    description: "包老头的孙女，年仅12岁却是猎人大师。智商极高，擅长分析和情报，是莫凡猎人搭档。",
    elements: [],
    level: 1,
    maxHp: 80,
    maxMp: 100,
    attack: 5,
    defense: 3,
    speed: 12,
    spirit: 40,
    skills: ["basic_attack"],
    growthType: "support",
    canDuel: false,
    spriteColor: "#FFB6C1",
    location: "qingtian_hunter_office",
    availableTimes: ["morning", "afternoon", "evening"],
    dialogue: [
      { trigger: "default", text: "有任务找我爷爷，别烦我。" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.4, kind: 0.5, honest: 0.8, impulsive: 0.1,
      loyal: 0.7, arrogant: 0.3, greedy: 0.2, curious: 0.9
    },
    giftPreferences: {
      loved: ["rare_demon_core", "ancient_book"],
      liked: ["magic_stone", "health_potion"],
      disliked: [],
      baseOpinionGain: 5, lovedMultiplier: 3, likedMultiplier: 1.5, dislikedMultiplier: 0.5, dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 100, maxTrust: 100, canRomance: false, canBeMentor: true, canBeRival: false
    },
    relationships: {
      mo_fan: { opinion: 20, trust: 15, type: "partner", label: "猎人搭档" }
    },
    dialogueTree: {
      npcId: "lingling",
      nodes: {
        default: {
          id: "default",
          texts: [
            "有任务找我爷爷，别烦我。",
            "……又是你。有事说事。",
            "你身上有妖魔的血腥味，刚从野外回来？"
          ],
          mood: "annoyed",
          choices: [
            { id: "ask_hunt", text: "有猎魔任务吗？", condition: { minOpinion: 5 }, nextNode: "hunt_info" },
            { id: "ask_intel", text: "最近有什么妖魔情报？", condition: { minOpinion: 15 }, effects: { exp: 10 }, nextNode: "demon_intel" },
            { id: "ask_parasite", text: "寄生妖魔的事怎么样了？", condition: { minOpinion: 25, minTrust: 20 }, nextNode: "parasite_case" },
            { id: "ask_hierarchy", text: "黑教廷的等级结构？", condition: { hasFlag: "xu_zhaoting_died", minTrust: 40 }, nextNode: "black_church_hierarchy" },
            { id: "ask_xu", text: "许昭霆的事……", condition: { hasFlag: "xu_zhaoting_died", minTrust: 30 }, nextNode: "xu_zhaoting_mourn" },
            { id: "ask_age", text: "你多大了？", condition: { notNpcFlags: ["asked_age"] }, effects: { opinion: -5, npcFlags: { asked_age: true } }, nextNode: "age_talk" },
            { id: "chat", text: "随便聊聊", condition: { minOpinion: 20 }, nextNode: "casual_chat" },
            { id: "give_gift", text: "送你东西", action: "open_gift" },
            { id: "leave", text: "打扰了", nextNode: null }
          ]
        },
        hunt_info: {
          id: "hunt_info",
          texts: [
            "猎魔任务都在公告板上，自己看。不过……最近有个追踪黑教廷的任务，你感兴趣的话我可以帮你留意。",
            "你实力还行，比那些只会耍嘴皮子的猎人强。有合适的任务我会通知你。",
            "别接超出能力的任务，死了我可懒得给你收尸。"
          ],
          choices: [
            { id: "accept", text: "追踪黑教廷的任务？我接了！", nextNode: "default", action: "start_quest", actionData: { questId: "quest_lingling_black_church" } },
            { id: "thanks", text: "谢了", effects: { opinion: 2 }, nextNode: "default" }
          ]
        },
        demon_intel: {
          id: "demon_intel",
          texts: [
            "根据我收集的数据，最近主校区附近暗影系妖魔活动频繁。不只是普通妖魔——有组织的痕迹。",
            "黑教廷在明珠有眼线，你小心点。他们的目标可能是地圣泉。",
            "还有，黑畜妖不是妖魔。那是被咒法奴役的人。这个情报别外传。"
          ],
          condition: { minTrust: 20 },
          effects: { giveInfo: "black_church_in_mingzhu" },
          choices: [
            { id: "back", text: "我知道了", effects: { trust: 3 }, nextNode: "default" }
          ]
        },
        age_talk: {
          id: "age_talk",
          texts: [
            "……12。怎么，有意见？",
            "别用那种眼神看我。智商和年龄没关系，你这种肌肉脑不会懂的。",
            "下次再问这种无聊的问题，任务情报减半。"
          ],
          choices: [
            { id: "apologize", text: "抱歉，我不该问", effects: { opinion: 2 }, nextNode: "default" },
            { id: "tease", text: "12岁就当猎人大师？", effects: { opinion: -3 }, nextNode: "age_defense" }
          ]
        },
        age_defense: {
          id: "age_defense",
          texts: [
            "猎人认证看的是实绩不是年龄。我分析过的妖魔案例比你吃过的饭还多。",
            "……算了，跟你说这些干嘛。"
          ],
          choices: [
            { id: "back", text: "服了", nextNode: "default" }
          ]
        },
        casual_chat: {
          id: "casual_chat",
          texts: [
            "你知道吗，猎人联盟里大部分人都是蠢货。明明数据摆在眼前还要硬来。",
            "爷爷总说我太冷漠。但分析妖魔的时候，感情只会影响判断。",
            "……你和别的法师不太一样。你身上有妖魔的气息，但你还是人。有意思。"
          ],
          choices: [
            { id: "back", text: "你也挺有意思的", effects: { opinion: 3 }, nextNode: "default" }
          ]
        },
        parasite_case: {
          id: "parasite_case",
          texts: [
            "寄生妖魔的案子我查过资料。那东西叫鳞皮妖母，战将级，能通过寄生繁殖。",
            "被寄生的人白天正常，晚上蜕皮变妖。杀了妖母，被寄生的人就能恢复。",
            "但如果妖母完成血祭，她可能突破到统领级。到时候整个学校都危险。"
          ],
          condition: { minOpinion: 25, minTrust: 20 },
          effects: { giveInfo: "parasite_demon_incident" },
          choices: [
            { id: "back", text: "我会小心的", effects: { trust: 5 }, nextNode: "default" }
          ]
        },
        xu_zhaoting_mourn: {
          id: "xu_zhaoting_mourn",
          texts: [
            "……许昭霆的事，我知道了。",
            "他传递的情报很有价值。神侍者的名字……我会继续追查。",
            "他选择那样结束，对他来说或许是解脱。黑教廷的灵魂锁链，连帕特农都解不开。",
            "别太自责。你能做的都做了。"
          ],
          condition: { hasFlag: "xu_zhaoting_died", minTrust: 30 },
          mood: "rare_soft",
          choices: [
            { id: "back", text: "……嗯", effects: { trust: 10 }, nextNode: "default" }
          ]
        },
        black_church_hierarchy: {
          id: "black_church_hierarchy",
          texts: [
            "黑教廷的等级：最顶层是撒朗，下面是神侍者，再下面是教士，最底层是灰衣人。",
            "宇昂不过是个教士。真正危险的是神侍者——能直接接触撒朗的人。",
            "许昭霆用命换来的那块皮革上，有神侍者的名字。但信息被加密了，我需要时间破解。"
          ],
          condition: { hasFlag: "xu_zhaoting_died", minTrust: 40 },
          effects: { giveInfo: "black_church_hierarchy" },
          choices: [
            { id: "back", text: "需要什么帮助告诉我", effects: { trust: 5, opinion: 5 }, nextNode: "default" }
          ]
        }
      }
    }
  },

  luo_song: {
    id: "luo_song",
    name: "罗宋",
    title: "土冰双系中阶",
    description: "富家子弟，土系+冰系双系中阶法师。为人傲慢，与莫凡有竞争关系。",
    elements: ["earth", "ice"],
    level: 12,
    elementLevels: {
      earth: 12,
      ice: 10
    },
    maxHp: 550,
    maxMp: 180,
    attack: 28,
    defense: 30,
    speed: 15,
    spirit: 20,
    skills: ["basic_attack", "earth_shield", "earth_quake", "earth_shift", "bone_spike", "ice_spike", "ice_frost", "ice_storm", "ice_lock"],
    aiType: "aggressive",
    growthType: "mage",
    canDuel: true,
    spriteColor: "#87CEEB",
    location: "mingzhu_qing_campus",
    availableTimes: ["morning", "afternoon"],
    dialogue: [
      { trigger: "default", text: "哼，又是你。" }
    ],
    givesQuests: [],
    personality: {
      brave: 0.6, kind: 0.2, honest: 0.4, impulsive: 0.7,
      loyal: 0.3, arrogant: 0.9, greedy: 0.5, curious: 0.3
    },
    giftPreferences: {
      loved: ["rare_metal", "ice_spirit_seed"],
      liked: ["magic_stone", "mana_potion"],
      disliked: ["cheap_item"],
      baseOpinionGain: 3, lovedMultiplier: 2, likedMultiplier: 1.2, dislikedMultiplier: 0, dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 100, maxTrust: 50, canRomance: false, canBeMentor: false, canBeRival: true
    },
    relationships: {
      mo_fan: { opinion: -30, trust: 0, type: "rival", label: "竞争对手" }
    },
    growth: {
      growthRate: 50,
      base: {
        level: 12,
        elements: ["earth", "ice"],
        skills: ["basic_attack", "ice_vine", "earth_sink", "ice_lock"],
        title: "土冰双系中阶",
        growthType: "mage",
      },
      events: [
        {
          after: "mingzhu_entrance",
          level: 18,
          addSkills: ["ice_lock"],
          title: "土冰双系中阶",
          unlocks: ["duel"],
        }
      ]
    }
  },

  bai_cangfeng: {
    id: "bai_cangfeng",
    name: "白藏锋",
    title: "白家子弟",
    description: "魔都四大家族白家的子弟，光系中阶法师，光系系主任白眉的侄子。为人高傲多话，自认天才，视莫凡为眼中钉。主校区考核中被莫凡一霹雳秒杀。",
    elements: ["light"],
    level: 18,
    maxHp: 500,
    maxMp: 280,
    attack: 35,
    defense: 18,
    speed: 32,
    spirit: 28,
    skills: ["basic_attack", "light_ray", "light_blind", "light_purify", "light_sanctuary"],
    talents: [
          {
                "name": "光系天赋出众",
                "type": "innate",
                "element": "light",
                "description": "白家天才，光系天赋出众，魔法控制力极强，是年轻一代中的佼佼者。"
          }
    ],
    aiType: "aggressive",
    growthType: "mage",
    canDuel: true,
    spriteColor: "#F0F8FF",
    location: "mingzhu_main_campus",
    availableTimes: ["afternoon", "evening"],
    dialogue: [
      { trigger: "default", text: "..." }
    ],
    givesQuests: [],
    personality: {
      brave: 0.7, kind: 0.3, honest: 0.5, impulsive: 0.5,
      loyal: 0.5, arrogant: 0.8, greedy: 0.3, curious: 0.4
    },
    giftPreferences: {
      loved: ["light_spirit_seed"],
      liked: ["magic_stone", "mana_potion"],
      disliked: [],
      baseOpinionGain: 3, lovedMultiplier: 2.5, likedMultiplier: 1.3, dislikedMultiplier: 0.3, dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 100, maxTrust: 60, canRomance: false, canBeMentor: false, canBeRival: true
    },
    relationships: {
      mo_fan: { opinion: -20, trust: 0, type: "rival", label: "白家" }
    },
    
    growth: {
      base: {
        level: 18,
        elements: ["light"],
        skills: ["basic_attack","light_ray","light_blind"],
        title: "白家子弟",
        growthType: "mage",
      },
    },dialogueTree: {
      npcId: "bai_cangfeng",
      nodes: {
        default: {
          id: "default",
          texts: [
            "哼，又是你。别以为在斗兽大赛上出了点风头就了不起了。",
            "召唤系？不过是靠召唤兽的废物罢了。真正的法师靠的是自己的实力。",
            "我白家在魔都传承百年，什么天才没见过？你这种草根，不过是昙花一现。"
          ],
          mood: "arrogant",
          choices: [
            { id: "ask_family", text: "白家很厉害吗？", nextNode: "about_family" },
            { id: "ask_light", text: "光系很强吗？", condition: { minOpinion: -10 }, nextNode: "about_light" },
            { id: "challenge", text: "切磋一下？", condition: { minOpinion: -30 }, nextNode: "challenge_response" },
            { id: "threaten", text: "主校区考核小心点", condition: { minOpinion: -50, npcFlags: { threatened_by_mofan: false } }, effects: { npcFlags: { threatened_by_mofan: true }, opinion: -10 }, nextNode: "threaten_response" },
            { id: "give_gift", text: "我有东西给你", action: "open_gift" },
            { id: "leave", text: "告辞", nextNode: null }
          ]
        },
        about_family: {
          id: "about_family",
          texts: [
            "白家？你连白家都没听过？魔都四大家族白、赵、穆、东方，我白家以光系闻名。",
            "我叔叔是光系系主任白眉，中阶法师在他面前连光都放不出来。",
            "世家的底蕴不是你们这些草根能想象的。资源、魔具、功法，哪一样不是用钱堆出来的？"
          ],
          choices: [
            { id: "back", text: "原来如此", nextNode: "default" }
          ]
        },
        about_light: {
          id: "about_light",
          texts: [
            "光系？光系是所有系中最神圣的。光耀·失明可以让敌人瞬间失去战斗力，光佑·圣盾可以抵挡任何攻击。",
            "而且光系对黑暗生物有天生克制。黑教廷那些东西，最怕的就是光系法师。",
            "不过……光系修炼起来也最难。星子太活跃了，不容易控制。"
          ],
          choices: [
            { id: "back", text: "受教了", nextNode: "default" }
          ]
        },
        challenge_response: {
          id: "challenge_response",
          texts: [
            "切磋？就凭你？好，我给你这个机会。别到时候输了哭鼻子。",
            "我可是中阶光系法师，你一个召唤系的……算了，让你三招。"
          ],
          choices: [
            { id: "fight", text: "来吧！", action: "start_quest", actionData: { questId: "quest_bai_cangfeng_challenge" }, nextNode: "fight_ready" },
            { id: "back", text: "算了，改天", nextNode: "default" }
          ]
        },
        fight_ready: {
          id: "fight_ready",
          texts: [
            "任务已接取：白家的挑衅。",
            "（白藏锋冷笑一声，摆出战斗姿态。）",
            "准备好了？那就开始吧！"
          ],
          choices: [
            { id: "start", text: "开始战斗！", action: "start_battle", actionData: { enemyId: "bai_cangfeng" } },
            { id: "back", text: "我再准备一下", nextNode: "default" }
          ]
        },
        threaten_response: {
          id: "threaten_response",
          texts: [
            "你威胁我？哼，主校区考核上见真章。到时候可别求饶。",
            "白家的人，不是你能惹的。好自为之吧。"
          ],
          choices: [
            { id: "back", text: "等着瞧", nextNode: "default" }
          ]
        }
      }
    }
  },


  bao_laotou: {
    id: "bao_laotou",
    name: "包老头",
    title: "青天猎所所长",
    description: "青天猎所的创办者，灵灵的爷爷。看似普通的老头，实则深藏不露，是猎者联盟中德高望重的人物。对黑教廷有深入了解，暗中保护莫凡。",
    elements: ["shadow", "light"],
    level: 40,
    levelDisplay: "???",
    levelUnknown: true,
    maxHp: 1200,
    maxMp: 800,
    attack: 60,
    defense: 40,
    speed: 35,
    spirit: 80,
    skills: ["basic_attack", "light_ray", "light_blind", "light_purify", "light_sanctuary"],
    aiType: "defensive",
    growthType: "mage",
    canDuel: false,
    spriteColor: "#8B4513",
    location: "qingtian_hunter_office",
    availableTimes: ["morning", "afternoon"],
    dialogue: [
      { trigger: "default", text: "年轻人，想接什么任务？" }
    ],
    givesQuests: ["quest_hunter_guild_recruit"],
    personality: {
      brave: 0.8, kind: 0.7, honest: 0.6, impulsive: 0.2,
      loyal: 0.9, arrogant: 0.1, greedy: 0.1, curious: 0.5
    },
    giftPreferences: {
      loved: ["rare_demon_core", "ancient_book"],
      liked: ["tea", "magic_stone"],
      disliked: [],
      baseOpinionGain: 4, lovedMultiplier: 2, likedMultiplier: 1.2, dislikedMultiplier: 0.5, dailyGiftLimit: 1
    },
    relationshipCap: {
      maxOpinion: 100, maxTrust: 100, canRomance: false, canBeMentor: true, canBeRival: false
    },
    relationships: {
      mo_fan: { opinion: 30, trust: 20, type: "mentor", label: "猎所新人" },
      lingling: { opinion: 100, trust: 100, type: "granddaughter", label: "孙女" }
    },
    dialogueTree: {
      npcId: "bao_laotou",
      nodes: {
        default: {
          id: "default",
          texts: [
            "哦？新人？灵灵说你实力不错，就是有点莽撞。",
            "青天猎所不养闲人。想在这里待着，就得拿出真本事。",
            "黑教廷最近在明珠活动频繁……年轻人，你最好小心点。"
          ],
          mood: "wise",
          choices: [
            { id: "ask_hunter", text: "猎所都做什么任务？", nextNode: "hunter_info" },
            { id: "ask_black_church", text: "黑教廷在明珠？", condition: { minOpinion: 20, minTrust: 15 }, nextNode: "black_church_warn" },
            { id: "ask_lingling", text: "灵灵是您孙女？", condition: { minOpinion: 10 }, nextNode: "about_lingling" },
            { id: "ask_training", text: "能教我些什么吗？", condition: { minOpinion: 40, minTrust: 30 }, effects: { exp: 100 }, nextNode: "mentor_advice" },
            { id: "give_gift", text: "我带了点东西", action: "open_gift" },
            { id: "leave", text: "告辞", nextNode: null }
          ]
        },
        hunter_info: {
          id: "hunter_info",
          texts: [
            "猎所接的都是私人委托，比猎者联盟的悬赏酬金高，但也更危险。",
            "追踪妖魔、调查异常、护送要人……什么都做。前提是你活得到交任务那天。",
            "灵灵负责情报分析，你负责执行。分工明确，别拖后腿。"
          ],
          choices: [
            { id: "back", text: "明白了", nextNode: "default" }
          ]
        },
        black_church_warn: {
          id: "black_church_warn",
          texts: [
            "博城那场灾难不是偶然。黑教廷在魔都也有布局，而且渗透得比你想象的深。",
            "他们的目标可能是地圣泉——你身上带着的东西，对他们来说是大补之物。",
            "别一个人逞强。真遇到黑教廷的人，第一时间联系我或者灵灵。"
          ],
          effects: { giveInfo: "black_church_in_mingzhu" },
          choices: [
            { id: "back", text: "我会小心的", effects: { trust: 10 }, nextNode: "default" }
          ]
        },
        about_lingling: {
          id: "about_lingling",
          texts: [
            "那丫头……从小就聪明，十二岁就过了猎人大师考试。",
            "她爸妈都是猎人，在一次任务中牺牲了。我把她带大，教她分析情报。",
            "她嘴上不饶人，但心是好的。你多担待。"
          ],
          mood: "gentle",
          choices: [
            { id: "back", text: "她很厉害", effects: { opinion: 5 }, nextNode: "default" }
          ]
        },
        mentor_advice: {
          id: "mentor_advice",
          texts: [
            "你雷火双系，爆发力够了，但生存能力差。暗影系的遁影要多练，那是保命的本事。",
            "中阶法师之间的战斗，比的是谁先露出破绽。别急着放中阶魔法，先用初阶试探。",
            "记住——活着的法师才有输出。"
          ],
          choices: [
            { id: "back", text: "受教了", effects: { opinion: 5 }, nextNode: "default" }
          ]
        }
      }
    }
  }
};

export default DataCharacters;
