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
        nextPhase: "phase_5_discovery",
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
        nextPhase: "phase_5_discovery",
        effects: {
          hp: -30,
          flags: {
            "rescued_by_teacher": true
          }
        }
      },

      // 第五阶段C：发现黑教廷踪迹
      {
        id: "phase_5_discovery",
        name: "黑暗中的身影",
        description: "战斗间隙，你注意到一个灰衣人影在混乱中向学校后山方向移动。那人的动作不像是在逃跑，更像是在……执行什么任务。\n\n你认出了那个背影——是宇昂。他不是应该在前线战斗吗？为什么往后山去？\n\n你想起了之前听到的关于黑教廷的传闻……",
        type: "choice",
        choices: [
          {
            text: "追上去看看",
            nextPhase: "phase_5_chase_yuang",
            conditions: { minLevel: 7 },
            effects: { flags: { "chased_yu_ang": true } }
          },
          {
            text: "先告诉斩空教官",
            nextPhase: "phase_5_report_zhankong",
            effects: { flags: { "reported_yu_ang": true } }
          },
          {
            text: "现在战斗更重要，先不管",
            nextPhase: "phase_6_final",
            effects: {}
          }
        ]
      },

      // 追击宇昂
      {
        id: "phase_5_chase_yuang",
        name: "追击",
        description: "你悄悄跟了上去。\n\n在后山的一片树林中，你看到宇昂正站在一个奇怪的阵法前——那阵法散发着不祥的黑光，中央是一个倒十字的标记。\n\n黑教廷！\n\n宇昂察觉到了你，转过头来，脸上不再是平时那个天才少年的表情，而是一种阴冷的笑意。\n\n\"看到了不该看的东西呢……可惜，你今晚就要死在这里了。\"",
        type: "battle",
        enemyId: "yu_ang_black_church",
        winPhase: "phase_5_yuang_defeated",
        losePhase: "phase_5_yuang_lost"
      },

      // 击败宇昂
      {
        id: "phase_5_yuang_defeated",
        name: "真相",
        description: "你击败了宇昂！他倒在地上，身上的灰衣裂开，露出了里面黑色的教袍——倒十字的标记在月光下格外刺眼。\n\n\"你……你以为赢了吗？\"宇昂咳出鲜血，\"黑教廷的计划……才刚刚开始……博城……只是个开始……\"\n\n他的身体开始化作黑色的雾气消散，只留下一枚黑色的徽章。\n\n斩空教官带人赶到时，只看到了那枚徽章和被破坏的阵法。\n\n\"做得好。\"斩空的表情前所未有的凝重，\"这件事……不要告诉任何人。\"",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          exp: 300,
          gold: 200,
          flags: {
            "defeated_yu_ang": true,
            "yu_ang_black_church_confirmed": true
          },
          giveInfo: "yu_ang_black_church_confirmed",
          items: [{ itemId: "black_church_badge", count: 1 }]
        }
      },

      // 追击失败
      {
        id: "phase_5_yuang_lost",
        name: "逃脱",
        description: "宇昂的实力远超你的想象——他用的根本不是普通的冰系魔法！黑色的寒气中夹杂着某种诡异的力量。\n\n你被击退，撞在树上。宇昂没有追来，只是冷冷地看了你一眼。\n\n\"记住今晚，你什么都没看到。\"\n\n等你挣扎着爬起来时，他已经消失了。那个阵法也被销毁，仿佛什么都没发生过。\n\n但你知道，那不是幻觉。宇昂……和黑教廷有关。",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          hp: -40,
          flags: {
            "witnessed_yu_ang_ritual": true
          },
          giveInfo: "yu_ang_dark_power_witnessed"
        }
      },

      // 报告斩空
      {
        id: "phase_5_report_zhankong",
        name: "报告斩空",
        description: "你找到了正在指挥战斗的斩空教官，把看到的告诉了他。\n\n斩空的表情瞬间变了。\n\n\"宇昂？后山？\"他沉吟片刻，\"我知道了。你做得对，这件事交给我。\"他叫了两个亲信法师，\"你们两个，跟我去后山。其他人继续战斗！\"\n\n他看了你一眼，\"你留在这里，不要跟来。这不是你现在能应付的。\"\n\n那天晚上，斩空回来时什么都没说，但你注意到他军装上多了一道被黑色冰霜灼烧的痕迹。",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          exp: 100,
          reputation: { "military": 15 },
          flags: {
            "reported_yu_ang_to_zhankong": true
          },
          giveInfo: "yu_ang_zhankong_knew"
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
            { itemId: "flame_staff", count: 1 }
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
