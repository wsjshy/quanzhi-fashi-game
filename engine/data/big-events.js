/**
 * 大事件数据
 * 支持多阶段、分支选择、多个结局
 */

const DataBigEvents = {
  // 博城灾难 - 第一个大事件
  big_event_bocheng_disaster: {
    id: "big_event_bocheng_disaster",
    name: "博城灾难",
    description: "博城遭遇大规模妖魔袭击，全城陷入危机...",
    type: "disaster",
    startDay: 45, // 第45天触发（10月15日左右）
    autoTrigger: true,
    conditions: {
      minLevel: 5,
      requiredQuests: ["quest_collect_herbs"]
    },
    phases: [
      // 第一阶段：预警
      {
        id: "phase_1_warning",
        name: "妖魔异动",
        description: "最近几天，雪峰山的妖魔活动异常频繁，甚至有低级妖魔出现在博城边缘。军方已经加强了巡逻，但空气中弥漫着一股不安的气息...\n\n唐月老师找到你，神色凝重地说：\"情况不太对劲，雪峰山的妖魔像是在被什么东西驱赶，都往博城方向来了。你要小心一点。\"",
        type: "choice",
        choices: [
          {
            text: "我去调查一下情况",
            nextPhase: "phase_2_investigate",
            conditions: {
              minLevel: 6
            },
            effects: {
              reputation: {
                "military": 5
              }
            }
          },
          {
            text: "我去告诉其他老师",
            nextPhase: "phase_2_report",
            effects: {
              reputation: {
                "school": 10
              }
            }
          },
          {
            text: "我还是抓紧修炼吧",
            nextPhase: "phase_2_train",
            effects: {}
          }
        ]
      },
      
      // 第二阶段A：调查
      {
        id: "phase_2_investigate",
        name: "深入调查",
        description: "你来到雪峰山脚下，发现情况比想象中更严重。大量妖魔正在向博城方向移动，其中甚至有几只中级妖魔。\n\n就在你准备回去报信时，一只幽狼兽发现了你！",
        type: "battle",
        enemyId: "demon_wolf",
        winPhase: "phase_3_early_warning",
        losePhase: "phase_3_injured"
      },
      
      // 第二阶段B：报告
      {
        id: "phase_2_report",
        name: "紧急报告",
        description: "你把情况告诉了其他老师，学校立刻召开了紧急会议。老师们都很重视，决定加强学校的防御，并向军方报告。\n\n唐月老师表扬了你：\"做得好，及时的情报可能会挽救很多人的生命。\"",
        type: "narrative",
        nextPhase: "phase_3_school_prepare",
        effects: {
          exp: 50,
          reputation: {
            "school": 20
          }
        }
      },
      
      // 第二阶段C：修炼
      {
        id: "phase_2_train",
        name: "抓紧修炼",
        description: "你决定不管这些，抓紧时间修炼。毕竟，实力才是最重要的。\n\n但你心里隐隐有些不安，总觉得要出什么大事。",
        type: "narrative",
        nextPhase: "phase_3_sudden_attack",
        effects: {
          exp: 30
        }
      },
      
      // 第三阶段A：提前预警
      {
        id: "phase_3_early_warning",
        name: "提前预警",
        description: "你击败了幽狼兽，立刻赶回博城报告。军方和学校都高度重视，提前开始了疏散和防御准备。\n\n因为你的预警，很多人提前转移到了安全区域。",
        type: "narrative",
        nextPhase: "phase_4_battle_begin",
        effects: {
          exp: 100,
          gold: 100,
          reputation: {
            "military": 20,
            "school": 10
          },
          flags: {
            "early_warning": true
          }
        }
      },
      
      // 第三阶段B：受伤
      {
        id: "phase_3_injured",
        name: "受伤撤退",
        description: "你不是幽狼兽的对手，受了重伤，勉强逃了回来。\n\n虽然你受了伤，但你带回来的情报非常重要，军方立刻开始了准备。",
        type: "narrative",
        nextPhase: "phase_4_battle_begin",
        effects: {
          hp: -50,
          exp: 50,
          reputation: {
            "military": 10
          },
          flags: {
            "early_warning": true,
            "injured": true
          }
        }
      },
      
      // 第三阶段C：学校准备
      {
        id: "phase_3_school_prepare",
        name: "学校准备",
        description: "学校开始组织学生进行防御训练，同时准备了应急物资。\n\n你也参加了训练，学到了一些实战技巧。",
        type: "narrative",
        nextPhase: "phase_4_battle_begin",
        effects: {
          exp: 80,
          flags: {
            "school_prepare": true
          }
        }
      },
      
      // 第三阶段D：突然袭击
      {
        id: "phase_3_sudden_attack",
        name: "突然袭击",
        description: "三天后的夜里，博城突然遭到了大规模妖魔袭击！\n\n警报声划破夜空，无数妖魔从四面八方涌入城市。因为没有提前准备，一片混乱。",
        type: "narrative",
        nextPhase: "phase_4_battle_begin",
        effects: {
          flags: {
            "sudden_attack": true
          }
        }
      },
      
      // 第四阶段：战斗开始
      {
        id: "phase_4_battle_begin",
        name: "博城保卫战",
        description: "博城保卫战开始了！军方、法师协会和学校的法师们联合起来，抵抗妖魔的进攻。\n\n你也加入了战斗，尽自己的一份力量。",
        type: "battle",
        enemyId: "demon_wolf_pack",
        winPhase: "phase_5_second_wave",
        losePhase: "phase_5_rescued"
      },
      
      // 第五阶段：第二波
      {
        id: "phase_5_second_wave",
        name: "第二波攻势",
        description: "你击退了第一波妖魔，但很快，更强的第二波攻势来了。这次，甚至有高级妖魔出现！\n\n就在你感到绝望时，一道强大的魔法光芒从天而降——是城市的高阶法师们出手了！",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          exp: 150
        }
      },
      
      // 第五阶段B：被救
      {
        id: "phase_5_rescued",
        name: "被救",
        description: "你体力不支，倒在了战场上。就在一只妖魔要扑向你时，一道魔法光束击中了它。\n\n是唐月老师！她及时赶到，救了你一命。\"坚持住，孩子，我们一定会赢的！\"",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          hp: -30,
          flags: {
            "rescued_by_teacher": true
          }
        }
      },
      
      // 第六阶段：结局
      {
        id: "phase_6_final",
        name: "黎明",
        description: "经过一夜的激战，黎明终于到来。妖魔们撤退了，博城守住了！\n\n虽然城市遭受了很大的损失，但在所有人的努力下，大部分人都活了下来。\n\n你站在废墟中，望着初升的太阳，心中充满了复杂的感情。这是你第一次经历真正的战争，也是你成长的开始。",
        type: "auto",
        autoCheck: {
          attribute: "level",
          thresholds: [
            { value: 8, nextPhase: "ending_hero" },
            { value: 6, nextPhase: "ending_survivor" },
            { value: 1, nextPhase: "ending_survived" }
          ]
        }
      }
    ],
    
    endings: {
      hero: {
        id: "hero",
        name: "博城英雄",
        description: "你在博城灾难中表现英勇，拯救了许多人的生命，成为了博城的英雄。",
        effects: {
          exp: 500,
          gold: 500,
          reputation: {
            "military": 50,
            "school": 50,
            "city": 100
          },
          items: [
            { itemId: "fire_staff", count: 1 }
          ]
        }
      },
      survivor: {
        id: "survivor",
        name: "幸存者",
        description: "你在灾难中活了下来，虽然没有立下大功，但也尽了自己的一份力。",
        effects: {
          exp: 300,
          gold: 200,
          reputation: {
            "military": 20,
            "school": 20
          }
        }
      },
      survived: {
        id: "survived",
        name: "艰难求生",
        description: "你艰难地在灾难中活了下来，这次经历让你明白了实力的重要性。",
        effects: {
          exp: 150,
          gold: 50
        }
      }
    }
  }
};
