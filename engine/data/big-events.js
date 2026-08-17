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
      
      // 第六阶段：结局（v1.3.1: 选择+等级双条件判定，让玩家决策有意义）
      {
        id: "phase_6_final",
        name: "黎明",
        description: "经过一夜的激战，黎明终于到来。妖魔们撤退了，博城守住了！\n\n虽然城市遭受了很大的损失，但在所有人的努力下，大部分人都活了下来。\n\n你站在废墟中，望着初升的太阳，心中充满了复杂的感情。这是你第一次经历真正的战争，也是你成长的开始。",
        type: "auto",
        autoCheck: {
          conditions: [
            // 优先级1：击败宇昂 + Lv6+ → 真相追寻者
            { flags: { defeated_yu_ang: true }, minLevel: 6, nextPhase: "ending_truth_seeker" },
            // 优先级2：报告斩空 + Lv6+ → 军方盟友
            { flags: { reported_yu_ang_to_zhankong: true }, minLevel: 6, nextPhase: "ending_military_ally" },
            // 优先级3：Lv8+ → 博城英雄（等级碾压）
            { minLevel: 8, nextPhase: "ending_hero" },
            // 优先级4：Lv6+ → 幸存者
            { minLevel: 6, nextPhase: "ending_survivor" },
            // 默认：艰难求生
            { minLevel: 1, nextPhase: "ending_survived" }
          ]
        }
      }
    ],
    
    endings: {
      // v1.3.1新增：真相追寻者（击败宇昂，发现黑教廷真相）
      truth_seeker: {
        id: "truth_seeker",
        name: "真相追寻者",
        description: "你在博城灾难中追击宇昂，击败了他并发现了黑教廷的秘密。斩空教官叮嘱你不要告诉任何人，但你知道，这只是开始。\n\n黑教廷的徽章在你手中微微发烫，仿佛在预示着未来的风暴。",
        effects: {
          exp: 400,
          gold: 300,
          reputation: {
            "military": 30,
            "school": 20
          },
          flags: {
            "black_church_aware": true,
            "has_black_church_badge": true
          },
          items: [
            { itemId: "black_church_badge", count: 1 }
          ]
        }
      },
      // v1.3.1新增：军方盟友（报告斩空，获得军方信任）
      military_ally: {
        id: "military_ally",
        name: "军方盟友",
        description: "你及时向斩空教官报告了宇昂的异常，虽然没有亲手揭开真相，但你的警觉让军方避免了更大的损失。\n\n斩空教官拍了拍你的肩膀：\"小子，不错。以后有什么事，可以来找我。\"",
        effects: {
          exp: 350,
          gold: 250,
          reputation: {
            "military": 60,
            "school": 15
          },
          flags: {
            "military_ally": true
          },
          items: [
            { itemId: "zhankong_recommendation", count: 1 }
          ]
        }
      },
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
  },

  // 雪峰山历练 - 博城篇中期高潮
  big_event_xuefeng_training: {
    id: "big_event_xuefeng_training",
    name: "雪峰山历练",
    description: "天澜魔法高中一年一度的野外历练，尖子生们将在雪峰山面对真正的妖魔...",
    type: "training",
    autoTrigger: false, // 需要手动触发（通过任务/事件入口）
    conditions: {
      minLevel: 3,
      requiredQuests: []
    },
    phases: [
      // 第一阶段：集结与分组
      {
        id: "phase_1_gather",
        name: "集结出发",
        description: "清晨，天澜魔法高中的操场上聚集了100名尖子生。教官罗云波和潘丽君正在讲解历练规则。\n\n\"这次历练，你们将分成5组，每组20人，没有老师带队！\"罗云波教官的声音洪亮，\"目的地是雪峰山百草谷，任务是采集指定的草药。但要记住，那里是真正的野外，有妖魔出没！\"\n\n同学们议论纷纷，有人兴奋，有人害怕。你需要选择加入哪个小组。",
        type: "choice",
        choices: [
          {
            text: "加入莫凡那组（有莫凡、张小侯、周敏）",
            nextPhase: "phase_2_cliff",
            effects: {
              flags: { "training_group": "mofan" },
              reputation: { "school": 5 }
            }
          },
          {
            text: "加入穆白那组（有穆白、赵坤三）",
            nextPhase: "phase_2_cliff",
            effects: {
              flags: { "training_group": "mubai" },
              reputation: { "mu_family": 5 }
            }
          },
          {
            text: "随机分配（听天由命）",
            nextPhase: "phase_2_cliff",
            effects: {
              flags: { "training_group": "random" }
            }
          }
        ]
      },

      // 第二阶段：河谷悬崖
      {
        id: "phase_2_cliff",
        name: "河谷悬崖",
        description: "经过半天的跋涉，你们来到了百草谷的入口——一道10米宽的悬崖。\n\n\"风系的同学，跳过去拉绳索！\"组长喊道。\n\n张小侯挺身而出：\"我来！\"他施展风轨·疾行，轻盈地跃过悬崖，固定好绳索。\n\n现在轮到你了。",
        type: "choice",
        choices: [
          {
            text: "（风系）使用风轨·疾行跳过去",
            nextPhase: "phase_3_vines",
            conditions: { element: "wind" },
            effects: {
              exp: 30,
              flags: { "training_cliff": "wind_jump" },
              reputation: { "school": 10 }
            }
          },
          {
            text: "帮助拉绳索，保护胆小的同学",
            nextPhase: "phase_3_vines",
            effects: {
              exp: 20,
              flags: { "training_cliff": "help" },
              reputation: { "kind": 10 }
            }
          },
          {
            text: "直接顺着绳索爬过去",
            nextPhase: "phase_3_vines",
            effects: {
              exp: 10,
              flags: { "training_cliff": "climb" }
            }
          }
        ]
      },

      // 第三阶段：妖藤狭道
      {
        id: "phase_3_vines",
        name: "妖藤狭道",
        description: "越过悬崖后，你们进入了一条狭道——两侧布满了会动的妖藤！\n\n\"小心！妖藤会攻击人，火系魔法对它特别有效！\"有经验的同学喊道。\n\n妖藤挥舞着带倒刺的藤蔓，向你们袭来。",
        type: "battle",
        enemyId: "demon_vine",
        battleOptions: {
          fearLevel: 1,
          canFlee: true
        },
        winPhase: "phase_4_wolf",
        losePhase: "phase_4_wolf_injured"
      },

      // 第四阶段：幽狼兽遭遇（高潮）
      {
        id: "phase_4_wolf",
        name: "幽狼兽！",
        description: "穿过妖藤狭道，你们来到了独眼魔狼的巢穴附近。\n\n突然，一声狼嚎响彻山谷！一只比独眼魔狼大得多的幽狼兽从巢穴中冲出，双目泛着诡异的绿光。\n\n\"是幽狼兽！战将级妖魔！\"有人惊恐地喊道。\n\n学生们溃不成军，四散奔逃。穆白咬着牙，第一个释放了冰蔓·冻迟——虽然效果甚微，但他的勇气令人敬佩。\n\n莫凡拉住你：\"别慌！跟我来，我们把它引到洞窟里去！\"",
        type: "choice",
        choices: [
          {
            text: "跟莫凡一起，把幽狼兽引入洞窟",
            nextPhase: "phase_5_cave",
            effects: {
              flags: { "training_wolf": "follow_mofan" },
              reputation: { "brave": 15 }
            }
          },
          {
            text: "留下来帮助受伤的同学撤退",
            nextPhase: "phase_5_retreat",
            effects: {
              exp: 50,
              flags: { "training_wolf": "help_retreat" },
              reputation: { "kind": 20, "brave": 10 }
            }
          },
          {
            text: "自己先逃跑保命",
            nextPhase: "phase_5_flee",
            effects: {
              flags: { "training_wolf": "flee" },
              reputation: { "coward": 10 }
            }
          }
        ]
      },

      // 第四阶段B：战斗中受伤
      {
        id: "phase_4_wolf_injured",
        name: "受伤撤退",
        description: "在与妖藤的战斗中你受了伤，但还是坚持跟上了队伍。\n\n就在你们休整时，幽狼兽出现了！你因为受伤，只能跟着大家一起撤退。",
        type: "narrative",
        nextPhase: "phase_5_retreat",
        effects: {
          hp: -30,
          flags: { "training_wolf": "injured" }
        }
      },

      // 第五阶段A：洞窟BOSS战（环境互动）
      {
        id: "phase_5_cave",
        name: "洞窟决战",
        description: "你跟着莫凡把幽狼兽引入了洞窟深处。这里布满了巨大的钟乳石。\n\n\"看到那些钟乳石了吗？\"莫凡眼中闪过一丝精光，\"用火系魔法烧断它们，让石头砸下来！\"\n\n这是一场智慧与勇气的较量。",
        type: "battle",
        enemyId: "demon_wolf_advanced",
        battleOptions: {
          fearLevel: 2,
          canFlee: false,
          environment: "cave" // 洞窟环境，支持环境互动
        },
        winPhase: "phase_6_victory",
        losePhase: "phase_6_rescued"
      },

      // 第五阶段B：帮助撤退
      {
        id: "phase_5_retreat",
        name: "掩护撤退",
        description: "你选择留下来帮助受伤的同学撤退。幽狼兽在后面追杀，你用自己的魔法掩护大家。\n\n就在幽狼兽要扑向一个摔倒的同学时，一道风之翼从天而降——是斩空教官！\n\n\"你们做得很好。\"斩空的声音沉稳有力，\"剩下的交给我。\"",
        type: "narrative",
        nextPhase: "phase_6_end",
        effects: {
          exp: 80,
          gold: 50,
          reputation: { "kind": 15, "military": 10 },
          flags: { "training_result": "rescuer" }
        }
      },

      // 第五阶段C：逃跑
      {
        id: "phase_5_flee",
        name: "独自逃跑",
        description: "你选择了自己先逃跑。虽然保住了性命，但看着同学们在后面苦战，你心中有些不是滋味。\n\n后来你听说，莫凡用智慧击杀了幽狼兽，而斩空教官及时赶到救了其他人。",
        type: "narrative",
        nextPhase: "phase_6_end",
        effects: {
          exp: 20,
          flags: { "training_result": "fled" }
        }
      },

      // 第六阶段A：胜利结算
      {
        id: "phase_6_victory",
        name: "历练结束·英雄",
        description: "在莫凡的配合下，你们利用洞窟中的钟乳石成功击杀了幽狼兽！\n\n斩空教官随后赶到，看到幽狼兽的尸体，眼中闪过一丝惊讶：\"你们两个小子，不简单啊。\"\n\n这次历练，你获得了S级评价！",
        type: "narrative",
        nextPhase: "phase_6_end",
        effects: {
          exp: 200,
          gold: 200,
          reputation: { "brave": 30, "school": 20, "military": 15 },
          flags: { "training_result": "hero", "training_rating": "S" },
          items: [{ itemId: "warrior_soul_essence", count: 1 }]
        }
      },

      // 第六阶段B：被救
      {
        id: "phase_6_rescued",
        name: "历练结束·被救",
        description: "在洞窟中你体力不支倒下了。就在幽狼兽要扑向你时，斩空教官及时赶到，一击击退了幽狼兽。\n\n\"没事吧？\"斩空扶起你，\"已经很勇敢了。\"\n\n这次历练，你获得了B级评价。",
        type: "narrative",
        nextPhase: "phase_6_end",
        effects: {
          exp: 100,
          gold: 80,
          reputation: { "brave": 10 },
          flags: { "training_result": "rescued", "training_rating": "B" }
        }
      },

      // 第六阶段：结束
      {
        id: "phase_6_end",
        name: "历练结束",
        description: "雪峰山历练结束了。你们带着收获和回忆回到了学校。\n\n这次经历让每个人都成长了不少。莫凡因为击杀幽狼兽名声大噪，穆白也展现了勇气。而你，也有了属于自己的历练故事。",
        type: "auto",
        effects: {
          flags: { "xuefeng_training_completed": true }
        }
      }
    ],

    // 历练评分（根据flag计算）
    ratings: {
      S: {
        condition: "training_result === 'hero'",
        name: "S级·英雄",
        description: "击杀幽狼兽，拯救全队",
        rewards: { exp: 200, gold: 200, reputation: { brave: 30 } }
      },
      A: {
        condition: "training_result === 'rescuer'",
        name: "A级·救援者",
        description: "掩护同学撤退，表现英勇",
        rewards: { exp: 120, gold: 100, reputation: { kind: 20 } }
      },
      B: {
        condition: "training_result === 'rescued'",
        name: "B级·幸存者",
        description: "坚持战斗，被教官救下",
        rewards: { exp: 80, gold: 60 }
      },
      C: {
        condition: "training_result === 'fled'",
        name: "C级·逃生者",
        description: "选择逃跑，保住性命",
        rewards: { exp: 30, gold: 20 }
      }
    }
  },

  // 年度考核 - 博城篇中期重要事件
  big_event_annual_exam: {
    id: "big_event_annual_exam",
    name: "年度考核",
    description: "天澜魔法高中一年一度的修为考核，决定分班和资源分配...",
    type: "exam",
    autoTrigger: false,
    conditions: {
      minLevel: 2
    },
    phases: [
      // 第一阶段：考核前准备
      {
        id: "phase_1_prepare",
        name: "考核前夕",
        description: "年度考核当天，操场上聚集了全校新生。薛木生老师正在讲解考核规则。\n\n\"第一项是星感石测试，每人三次机会取最好成绩。第二项是魔法释放考核，星感石B级以上的同学可以参加。\"\n\n穆宁雪的到来引起了全校轰动，她是博城第一天才，也是穆氏家族的骄傲。\n\n你可以选择如何度过考核前的这段时间。",
        type: "choice",
        choices: [
          {
            text: "认真准备，调整心境",
            nextPhase: "phase_2_stone_test",
            effects: {
              composure: 10,
              flags: { "exam_prepare": "serious" }
            }
          },
          {
            text: "和莫凡聊天",
            nextPhase: "phase_2_stone_test",
            effects: {
              npcRelation: { "mo_fan": 5 },
              flags: { "exam_prepare": "chat_mofan" }
            }
          },
          {
            text: "和穆白聊天",
            nextPhase: "phase_2_stone_test",
            effects: {
              npcRelation: { "mu_bai": 5 },
              flags: { "exam_prepare": "chat_mubai" }
            }
          },
          {
            text: "暗中观察考场",
            nextPhase: "phase_2_stone_test",
            effects: {
              flags: { "exam_prepare": "observe", "exam_found_clue": true }
            }
          }
        ]
      },

      // 第二阶段：星感石测试
      {
        id: "phase_2_stone_test",
        name: "星感石测试",
        description: "轮到你进行星感石测试了。你将手放在星感石上，集中精神进入冥修状态...\n\n星感石开始发出光芒，考官们在记录你的成绩。",
        type: "auto",
        nextPhase: "phase_2_result",
        effects: {
          flags: { "exam_stone_test_done": true }
        }
      },

      // 第二阶段B：测试结果（根据玩家等级和心境计算）
      {
        id: "phase_2_result",
        name: "测试结果",
        description: "你的星感石测试成绩出来了！\n\n（系统将根据你的等级、精神力和心境计算评分）",
        type: "choice",
        choices: [
          {
            text: "查看成绩，继续释放考核",
            nextPhase: "phase_3_release",
            effects: {}
          },
          {
            text: "（如果发现暗石）质疑星感石有问题",
            nextPhase: "phase_2_investigate",
            conditions: { flag: "exam_found_clue" },
            effects: {
              npcRelation: { "tang_yue": 5, "mu_bai": -10 },
              reputation: { "justice": 10 },
              flags: { "exam_exposed": true }
            }
          }
        ]
      },

      // 第二阶段C：暗石调查
      {
        id: "phase_2_investigate",
        name: "暗石事件",
        description: "你指出星感石可能被动了手脚。唐月老师走过来，感应了一下，脸色微变。\n\n\"确实有问题。\"唐月的声音不大，但很坚定。\n\n校长要求检查，果然在星感石底部发现了一块暗石——它会吸收星感石的能量，让测试者的成绩偏低。\n\n穆贺脸色难看，但把事情推给了设备故障。你获得了重考的机会。",
        type: "narrative",
        nextPhase: "phase_3_release",
        effects: {
          exp: 30,
          reputation: { "justice": 10 },
          flags: { "exam_dark_stone_found": true, "exam_retake": true }
        }
      },

      // 第三阶段：魔法释放考核
      {
        id: "phase_3_release",
        name: "魔法释放考核",
        description: "接下来是魔法释放考核。你需要在考官面前完整释放你的初阶魔法。\n\n许昭霆的雷印获得了S级评价，威力惊人。穆白的冰蔓是B级，稳定而成熟。周敏的火滋也是B级。\n\n轮到你了。",
        type: "battle",
        enemyId: "training_dummy",
        battleOptions: {
          canFlee: false,
          canUseItems: false,
          winHpPercent: 0,
          isFriendly: true
        },
        winPhase: "phase_4_result",
        losePhase: "phase_4_result"
      },

      // 第四阶段：成绩公布
      {
        id: "phase_4_result",
        name: "成绩公布",
        description: "考核结束，成绩公布了！\n\n（综合评分 = 星感石60% + 释放考核40%，根据你的表现计算）\n\n薛木生老师看着成绩单，脸上露出了笑容。",
        type: "choice",
        choices: [
          {
            text: "查看我的评级和奖励",
            nextPhase: "phase_5_recruit",
            effects: {}
          }
        ]
      },

      // 第五阶段：穆卓云招揽（S/A级触发）
      {
        id: "phase_5_recruit",
        name: "穆卓云的招揽",
        description: "考核结束后，穆卓云亲自找到你。\n\n\"你的天赋不错。\"穆卓云的语气高傲，但带着一丝欣赏，\"加入穆氏，我可以给你星尘魔器、高级导师、最好的修炼资源。\"\n\n这是一个改变命运的机会，但也意味着你将成为穆氏的人。",
        type: "choice",
        choices: [
          {
            text: "接受招揽，加入穆氏",
            nextPhase: "phase_6_end",
            effects: {
              gold: 500,
              reputation: { "mu_family": 20, "grassroots": -10 },
              npcRelation: { "mo_fan": -10 },
              flags: { "exam_result": "join_mu" }
            }
          },
          {
            text: "婉拒，保持独立",
            nextPhase: "phase_6_end",
            effects: {
              gold: 100,
              reputation: { "grassroots": 10 },
              npcRelation: { "mo_fan": 5 },
              flags: { "exam_result": "refuse_polite" }
            }
          },
          {
            text: "怒斥拒绝，不接受施舍",
            nextPhase: "phase_5_duel",
            effects: {
              reputation: { "mu_family": -20, "grassroots": 15, "brave": 15 },
              npcRelation: { "mo_fan": 15, "mu_bai": -15 },
              flags: { "exam_result": "refuse_angry" }
            }
          }
        ]
      },

      // 第五阶段B：决斗约定
      {
        id: "phase_5_duel",
        name: "决斗约定",
        description: "穆卓云大怒：\"好，好一个不知天高地厚的小子！\"\n\n他转向身后的宇昂：\"宇昂，18岁成年礼时，你和他决斗，让他知道什么叫差距。\"\n\n宇昂冷冷地看着你：\"我会手下留情的。\"\n\n你接受了这个挑战。",
        type: "narrative",
        nextPhase: "phase_6_end",
        effects: {
          exp: 50,
          reputation: { "brave": 10 },
          flags: { "duel_promise": true, "exam_result": "duel" }
        }
      },

      // 第六阶段：结束
      {
        id: "phase_6_end",
        name: "考核结束",
        description: "年度考核结束了。你的表现引起了不少人的关注，未来的路还很长...\n\n（根据你的评级，你获得了相应的奖励和分班结果）",
        type: "auto",
        effects: {
          flags: { "annual_exam_completed": true }
        }
      }
    ]
  },

  // 地圣泉决斗 - 博城篇中期高潮
  big_event_earth_spring_duel: {
    id: "big_event_earth_spring_duel",
    name: "地圣泉决斗",
    description: "毕业前夕，莫凡与宇昂的魔法决斗，胜者获得地圣泉一周修炼资格，博城五大势力齐聚观战...",
    type: "duel",
    autoTrigger: false,
    conditions: {
      minLevel: 5,
      requiredFlags: ["annual_exam_completed"]
    },
    phases: [
      // 第一阶段：决斗前夕
      {
        id: "phase_1_prelude",
        name: "决斗前夕",
        description: "毕业前夕，穆氏庄园的魔法决斗场。\n\n博城五大势力齐聚——天澜魔法高中朱校长、猎者联盟邓凯大长老、魔法协会杨作河、军方斩空教官、穆氏家主穆卓云。\n\n决斗的彩头是博城地圣泉的一周修炼资格——这是博城最珍贵的修炼资源，一年只开启一次，足以让初阶法师冲击中阶。\n\n莫凡将代表学校挑战穆氏的宇昂。宇昂是穆卓云的养子，穆氏有名的修炼疯子，据说已经掌握了3级冰蔓·覆盖。\n\n你站在观众席上，周围是熟悉的同学和老师。这场决斗，你选择如何自处？",
        type: "choice",
        choices: [
          {
            text: "支持莫凡，为他加油",
            nextPhase: "phase_2_duel",
            effects: {
              npcRelation: { "mo_fan": 10 },
              reputation: { "grassroots": 10 },
              flags: { "duel_side": "mofan" }
            }
          },
          {
            text: "看好宇昂，穆氏实力更强",
            nextPhase: "phase_2_duel",
            effects: {
              npcRelation: { "mu_bai": 5 },
              reputation: { "mu_family": 10 },
              flags: { "duel_side": "yuang" }
            }
          },
          {
            text: "中立观战，专注学习高手对决",
            nextPhase: "phase_2_duel",
            effects: {
              composure: 10,
              exp: 20,
              flags: { "duel_side": "neutral" }
            }
          },
          {
            text: "（年度考核优异）我也要争取地圣泉资格！",
            nextPhase: "phase_1_player_duel",
            conditions: { flag: "duel_promise" },
            effects: {
              reputation: { "brave": 15 },
              flags: { "duel_side": "player" }
            }
          }
        ]
      },

      // 第一阶段B：玩家挑战宇昂
      {
        id: "phase_1_player_duel",
        name: "你的挑战",
        description: "你站了出来：\"我也要争取地圣泉资格！\"\n\n全场哗然。穆卓云皱眉：\"你是？\"\n\n\"天澜魔法高中学生，年度考核优异，我有资格挑战。\"\n\n斩空教官饶有兴致地看着你：\"哦？有点意思。\"\n\n邓凯大长老作为公证人：\"既然有资格，那就按规矩来。你先和宇昂决斗，胜者再与莫凡对决。\"\n\n穆卓云冷笑：\"好，宇昂，让他知道天高地厚。\"",
        type: "battle",
        enemyId: "yu_ang_duel",
        battleOptions: {
          mode: "duel",
          canFlee: false,
          canUseItems: true,
          fearLevel: 1
        },
        winPhase: "phase_2_player_win",
        losePhase: "phase_2_player_lose"
      },

      // 玩家胜利
      {
        id: "phase_2_player_win",
        name: "一鸣惊人",
        description: "你击败了宇昂！全场震惊。\n\n斩空教官大笑：\"好小子！有点本事！\"\n\n穆卓云脸色铁青。朱校长眼中闪过一丝赞许。\n\n邓凯宣布：\"胜者获得地圣泉一周修炼资格！\"\n\n莫凡走过来拍了拍你的肩膀：\"行啊你，藏得挺深。地圣泉归你了，我萧院长说会给我安排其他资源。\"\n\n（萧院长看中你的魄力，同时为莫凡安排了三步塔提前开放和特殊指导，莫凡走替代成长路线，实力不会掉线）",
        type: "narrative",
        nextPhase: "phase_3_end",
        effects: {
          exp: 200,
          gold: 300,
          reputation: { "grassroots": 30, "brave": 20, "mu_family": -20 },
          npcRelation: { "mo_fan": 15, "mu_bai": -10, "xiao_yuanzhang": 10 },
          flags: { "earth_spring_qualification": true, "duel_result": "player_win", "mofan_alternative_growth": true },
          items: [{ itemId: "stardust_device_mortal", count: 1 }]
        }
      },

      // 玩家失败
      {
        id: "phase_2_player_lose",
        name: "虽败犹荣",
        description: "你输给了宇昂。他的3级冰蔓·覆盖确实强大，还有地波履魔具的辅助。\n\n但你虽败犹荣，能站在这个决斗场上本身就是一种认可。\n\n唐月老师安慰你：\"已经很厉害了，宇昂毕竟是穆氏精心培养的。\"\n\n接下来，莫凡将继续挑战宇昂。",
        type: "narrative",
        nextPhase: "phase_2_duel",
        effects: {
          exp: 80,
          reputation: { "brave": 10 },
          npcRelation: { "tang_yue": 5 },
          flags: { "duel_result": "player_lose" }
        }
      },

      // 第二阶段：莫凡vs宇昂决斗
      {
        id: "phase_2_duel",
        name: "魔法决斗",
        description: "决斗开始！\n\n宇昂率先释放冰蔓·冻结，寒气弥漫整个决斗场。莫凡不慌不忙，将火滋·灼烧释放在自己脚下，用火焰粉碎冰蔓的冻结效果——1级火滋破了2级冰蔓！\n\n宇昂脸色一变，启动地波履魔具，身形如游鱼般躲避莫凡的攻击。\n\n突然，宇昂双手高举，寒气暴涨：\"冰蔓·覆盖！\"\n\n3级冰蔓！全场震惊——这是中阶法师才能掌握的技能！寒冰如潮水般蔓延，火焰都被熄灭，莫凡无论躲到哪里都会在几秒内被冻成冰雕。\n\n就在所有人以为莫凡输了的时候，他周身雷光闪烁——雷印！破冰！\n\n随后，莫凡双手凝聚出比之前强大数倍的火焰——3级火滋！\n\n更令人震惊的是，他左手雷光，右手火焰——天生双系！\n\n全场哗然。今夜，再没有人比莫凡更加耀眼。\n\n莫凡赢了！地圣泉资格归他。",
        type: "choice",
        choices: [
          {
            text: "为莫凡欢呼！草根也能逆袭！",
            nextPhase: "phase_3_end",
            conditions: { flag: "duel_side", value: "mofan" },
            effects: {
              npcRelation: { "mo_fan": 10 },
              reputation: { "grassroots": 10 }
            }
          },
          {
            text: "为宇昂惋惜，穆氏虽败犹荣",
            nextPhase: "phase_3_end",
            conditions: { flag: "duel_side", value: "yuang" },
            effects: {
              npcRelation: { "mu_bai": 5 },
              reputation: { "mu_family": 5 }
            }
          },
          {
            text: "若有所思，总结高手对决的经验",
            nextPhase: "phase_3_end",
            effects: {
              composure: 10,
              exp: 30
            }
          }
        ]
      },

      // 第三阶段：结束
      {
        id: "phase_3_end",
        name: "决斗结束",
        description: "地圣泉决斗结束了。\n\n这场决斗让所有人看到了世家与草根的差距，也看到了努力可以弥补天赋的不足。莫凡的天生双系震惊全场，宇昂的实力也得到了认可。\n\n（你的选择影响了和各方的关系，后续剧情会根据你的立场展开）",
        type: "auto",
        effects: {
          flags: { "earth_spring_duel_completed": true }
        }
      }
    ]
  }
};
