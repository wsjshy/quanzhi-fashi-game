/**
 * 大事件数据
 * 支持多阶段、分支选择、多个结局
 */

export const DataBigEvents = {
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
            text: "我已经在调查这件事了（阴谋调查）",
            nextPhase: "phase_2_investigation_lead",
            conditions: {
              requiredFlags: ["investigation_started"]
            },
            effects: {
              reputation: {
                "military": 10,
                "school": 5
              },
              exp: 50
            }
          },
          {
            text: "可能是暴躁之泉！黑教廷在雨里动了手脚（v1.9.1）",
            nextPhase: "phase_2_violent_spring_warning",
            conditions: {
              requiredFlags: ["violent_spring_known"]
            },
            effects: {
              reputation: {
                "military": 15,
                "tang_yue_faction": 10
              },
              exp: 80,
              flags: {
                "violent_spring_exposed": true
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
      
      // 第二阶段A2：阴谋调查领先（v1.8.1）
      {
        id: "phase_2_investigation_lead",
        name: "有备无患",
        description: "唐月老师听到你说已经在调查，眼神一亮。\n\n\"你也发现了？\"她压低声音，\"看来你比我想象的更敏锐。\"\n\n你把这段时间收集到的线索告诉了唐月——妖魔异常迁徙、黑教廷踪迹、地圣泉守卫调动。唐月的表情越来越凝重。\n\n\"这些线索...都指向同一个方向。\"她深吸一口气，\"我会立刻联系审判会和军方。你提供的情报，可能会挽救很多人的生命。\"\n\n因为你的提前调查，军方和学校获得了更充分的准备时间。",
        type: "narrative",
        nextPhase: "phase_3_fully_prepared",
        effects: {
          exp: 150,
          gold: 150,
          reputation: {
            "military": 20,
            "school": 15
          },
          flags: {
            "investigation_lead": true,
            "early_warning": true,
            "fully_prepared": true
          }
        }
      },

      // v1.9.1: 第二阶段A3：暴躁之泉预警
      {
        id: "phase_2_violent_spring_warning",
        name: "暴躁之泉",
        description: "唐月老师听到你说\"暴躁之泉\"，脸色骤变。\n\n\"你怎么知道暴躁之泉？\"她的声音压得很低，\"这是审判会内部的情报...\"\n\n你把收集到的线索告诉了她——雪峰山的诡异液体痕迹、黑教廷在云层中动手脚的推断。唐月越听越凝重。\n\n\"如果真是暴躁之泉...\"她深吸一口气，\"那这场灾难会比我们想象的更严重。暴躁之泉会让妖魔失去理智，疯狂进攻。\"\n\n\"我立刻联系军方和审判会，让他们准备防化措施。你提供的情报，可能挽救了无数人的生命。\"\n\n因为你提前识破了暴躁之泉的阴谋，军方做好了针对性准备，妖魔的攻击力大幅降低。",
        type: "narrative",
        nextPhase: "phase_3_fully_prepared",
        effects: {
          exp: 100,
          gold: 100,
          reputation: {
            "military": 25,
            "tang_yue_faction": 15
          },
          flags: {
            "violent_spring_exposed": true,
            "early_warning": true,
            "fully_prepared": true,
            "demon_attack_reduced": true
          }
        }
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
      
      // 第三阶段E：充分准备（v1.8.1阴谋调查领先分支）
      {
        id: "phase_3_fully_prepared",
        name: "充分准备",
        description: "得益于你提供的详细情报，博城进入了最高戒备状态。\n\n军方在城市外围布置了防线，学校组织了紧急疏散演练，魔法协会也派出了支援法师。\n\n唐月老师找到你，递给你一瓶高级魔法药水。\"这是给你的，关键时刻能救命。\"\n\n\"还有...\"她犹豫了一下，\"如果今晚看到宇昂有异常举动，不要犹豫，立刻告诉我或斩空教官。\"\n\n你点了点头。空气中的紧张感越来越浓，但你知道，这一次博城准备好了。",
        type: "narrative",
        nextPhase: "phase_4_battle_begin",
        effects: {
          exp: 100,
          items: [{ itemId: "super_mana_potion", count: 2 }],
          flags: {
            "fully_prepared": true,
            "tang_yue_warned_yu_ang": true
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
        losePhase: "phase_5_rescued",
        effects: {
          npcSupport: {
            tang_yue: {
              highThreshold: 50,
              highEffect: { hp: 50, exp: 50, relation: 10 },
              midThreshold: 20,
              midEffect: { relation: 5 }
            },
            zhang_xiaohou: {
              highThreshold: 40,
              highEffect: { exp: 30, relation: 10 },
              midThreshold: 20,
              midEffect: { relation: 5 }
            }
          }
        }
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
            text: "我早就怀疑宇昂了（阴谋调查）",
            nextPhase: "phase_5_chase_yuang_prepared",
            conditions: {
              requiredFlags: ["yu_ang_suspicion_triggered"]
            },
            effects: {
              flags: { "chased_yu_ang": true, "yu_ang_prepared": true }
            }
          },
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
            text: "地圣泉可能有危险，我去守护（v1.9.0）",
            nextPhase: "phase_5_earth_spring_guard",
            conditions: { minLevel: 7 },
            effects: { flags: { "guarded_earth_spring": true } }
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

      // 追击宇昂（有准备，v1.8.1阴谋调查分支）
      {
        id: "phase_5_chase_yuang_prepared",
        name: "有备而来",
        description: "你早就怀疑宇昂了，所以当看到他往后山去时，你立刻跟了上去，并且提前通知了唐月老师。\n\n在后山的树林中，你看到宇昂站在一个散发着黑光的阵法前。\n\n\"果然是你。\"你握紧了法杖。\n\n宇昂转过头，脸上露出阴冷的笑容：\"哦？你居然发现了？看来我小看你了。\"\n\n\"不过没关系，今晚你一样要死在这里。\"\n\n就在这时，一道火焰从远处袭来——唐月老师赶到了！\"宇昂，你的阴谋到此为止了！\"\n\n宇昂脸色一变，但已经来不及了。你和唐月老师前后夹击，他无路可逃！",
        type: "battle",
        enemyId: "yu_ang_black_church_weakened",
        winPhase: "phase_5_yuang_defeated_prepared",
        losePhase: "phase_5_yuang_lost"
      },

      // 击败宇昂（有准备分支）
      {
        id: "phase_5_yuang_defeated_prepared",
        name: "真相大白",
        description: "在你和唐月老师的夹击下，宇昂终于倒下了。\n\n他的灰衣裂开，露出了里面黑色的教袍——倒十字的标记在月光下格外刺眼。\n\n\"你……你们以为赢了吗？\"宇昂咳出鲜血，\"黑教廷的计划……才刚刚开始……博城……只是个开始……\"\n\n他的身体开始化作黑色雾气消散。唐月老师挥手，一道火焰将剩余的黑雾焚烧殆尽。\n\n\"结束了。\"唐月老师看着你，眼神中带着欣慰，\"谢谢你。如果不是你提前调查，我们可能永远都发现不了他的真面目。\"\n\n斩空教官带人赶到时，只看到了被破坏的阵法和一枚黑色徽章。\n\n\"做得好。\"斩空的表情前所未有的凝重，\"这件事……审判会会处理。你们两个，不要对任何人提起。\"",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          exp: 400,
          gold: 300,
          reputation: {
            "military": 20,
            "school": 15
          },
          flags: {
            "defeated_yu_ang": true,
            "yu_ang_black_church_confirmed": true,
            "yu_ang_defeated_with_tangyue": true
          },
          giveInfo: "yu_ang_black_church_confirmed",
          items: [{ itemId: "black_church_badge", count: 1 }]
        }
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

      // v1.9.0: 地圣泉守护 - 前往地圣泉
      {
        id: "phase_5_earth_spring_guard",
        name: "地圣泉危机",
        description: "你想起了之前调查到的线索——黑教廷的目标不仅仅是引来妖魔，他们还想释放地圣泉的温泽，吸引更多统领级妖魔！\n\n地圣泉是博城的命脉，如果温泽被释放，百公里内的妖魔都会被吸引过来，博城将彻底沦陷。\n\n你立刻转向地圣泉方向。宇昂的事可以交给斩空教官，但地圣泉不能有失！\n\n当你赶到地圣泉时，果然看到一个黑色教袍的身影正在泉边布置阵法。",
        type: "narrative",
        nextPhase: "phase_5_earth_spring_battle",
        effects: {
          exp: 50,
          flags: { "earth_spring_guard_started": true }
        }
      },

      // v1.9.0: 地圣泉守护 - 战斗
      {
        id: "phase_5_earth_spring_battle",
        name: "守护地圣泉",
        description: "黑教廷执事察觉到你的到来，停下了手中的阵法。\n\n\"又来一个碍事的。\"他的声音冰冷，\"不过没关系，你会和这座城市一起化为灰烬。\"\n\n黑色的暗影能量在他手中凝聚，你必须阻止他完成阵法！",
        type: "battle",
        enemyId: "black_church_deacon",
        winPhase: "phase_5_earth_spring_success",
        losePhase: "phase_5_earth_spring_failed"
      },

      // v1.9.0: 地圣泉守护 - 成功
      {
        id: "phase_5_earth_spring_success",
        name: "地圣泉守护者",
        description: "你击败了黑教廷执事！他倒在地上，阵法的光芒逐渐消散。\n\n\"不可能...\"他咳出黑色的血液，\"执事大人...不会放过你的...\"\n\n他的身体化作黑雾消散，只留下一枚黑色徽章。\n\n地圣泉的温泽没有被释放，博城避免了更大的灾难。\n\n唐月老师赶到时，看到被破坏的阵法和你手中的徽章，眼神中充满了欣慰。\n\n\"你做到了。\"她的声音有些颤抖，\"如果地圣泉温泽被释放，博城就真的完了。谢谢你。\"\n\n斩空教官随后赶到，了解情况后沉默了很久。\n\n\"地圣泉一周的修炼资格，是你应得的。\"斩空的语气郑重，\"还有，这件事...不要对任何人提起。审判会会处理后续。\"",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          exp: 500,
          gold: 400,
          reputation: {
            "military": 40,
            "school": 20
          },
          flags: {
            "earth_spring_guarded": true,
            "defeated_black_church_deacon": true,
            "earth_spring_week_access": true
          },
          giveInfo: "earth_spring_guardian",
          items: [{ itemId: "black_church_badge", count: 1 }]
        }
      },

      // v1.9.0: 地圣泉守护 - 失败
      {
        id: "phase_5_earth_spring_failed",
        name: "温泽泄漏",
        description: "你不是黑教廷执事的对手，被他的暗影魔法击退。\n\n当你挣扎着爬起来时，阵法已经完成了。地圣泉的温泽开始向外扩散，一股浓郁的灵气涌向远方。\n\n\"成功了。\"执事冷笑，\"很快，更多的统领级妖魔会被吸引过来。博城...完了。\"\n\n他消失在黑暗中。你无力地倒在泉边，看着温泽继续扩散。\n\n幸运的是，唐月老师和斩空教官及时赶到，用封印魔法暂时遏制了温泽的扩散，但已经有一部分泄漏出去了。\n\n\"你尽力了。\"唐月老师扶起你，\"但接下来的战斗，会更加艰难。\"\n\n那一夜，博城遭受了更多妖魔的袭击，伤亡比预期中更大。但你知道，如果你没有去，情况会更糟。",
        type: "narrative",
        nextPhase: "phase_6_final",
        effects: {
          hp: -60,
          exp: 200,
          reputation: {
            "military": 15,
            "school": 10
          },
          flags: {
            "earth_spring_failed": true,
            "earth_spring_partial_leak": true
          },
          giveInfo: "earth_spring_partial_leak"
        }
      },
      
      // 第六阶段：结局（v1.3.1: 选择+等级双条件判定，让玩家决策有意义）
      {
        id: "phase_6_final",
        name: "黎明",
        description: "经过一夜的激战，黎明终于到来。妖魔们撤退了，博城守住了！\n\n虽然城市遭受了很大的损失，但在所有人的努力下，大部分人都活了下来。\n\n你站在废墟中，望着初升的太阳，心中充满了复杂的感情。这是你第一次经历真正的战争，也是你成长的开始。",
        type: "auto",
        effects: {
          flags: { "bo_city_disaster_completed": true }
        },
        autoCheck: {
          conditions: [
            // v1.9.0: 优先级0：地圣泉守护成功 → 地圣泉守护者
            { flags: { earth_spring_guarded: true }, minLevel: 7, nextPhase: "ending_earth_spring_guardian" },
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
      // v1.9.0新增：地圣泉守护者（守护地圣泉成功）
      earth_spring_guardian: {
        id: "earth_spring_guardian",
        name: "地圣泉守护者",
        description: "你在博城灾难中选择守护地圣泉，击败了黑教廷执事，阻止了地圣泉温泽的释放。\n\n因为你的行动，博城避免了更大的灾难，无数人因此活了下来。斩空教官授予你地圣泉一周的修炼资格，唐月老师对你刮目相看。\n\n\"你守护的不仅仅是地圣泉，\"唐月老师说，\"更是博城的未来。\"\n\n你站在地圣泉边，感受着浓郁的灵气，知道这只是你与黑教廷较量的开始。",
        effects: {
          exp: 500,
          gold: 400,
          reputation: {
            "military": 50,
            "school": 30,
            "tang_yue_faction": 20
          },
          flags: {
            "earth_spring_guardian": true,
            "earth_spring_week_access": true,
            "black_church_aware": true
          },
          items: [
            { itemId: "black_church_badge", count: 1 },
            { itemId: "earth_spring_pass", count: 1 }
          ]
        }
      },
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
        name: "召唤兽！",
        description: "穿过妖藤狭道，你们来到了独眼魔狼的旧巢穴附近。\n\n巢穴口站着一个穿着猎者联盟制服的男子——他是白阳，召唤系法师，奉命留守这里。\n\n\"同学们别怕，这巢穴里没有真正的妖魔。\"白阳说道，\"但为了让你们体验面对妖魔的感觉，我会放出我的召唤兽——幽狼兽。只要你们能在它面前释放出任何一个魔法，就能拿到A的评价。\"\n\n说完，白阳召唤出一只比独眼魔狼大得多的幽狼兽，双目泛着诡异的绿光。\n\n\"是幽狼兽！战将级！\"有人惊恐地喊道。学生们溃不成军，四散奔逃。穆白咬着牙，第一个释放了冰蔓·冻迟——虽然效果甚微，但他的勇气令人敬佩。\n\n莫凡拉住你：\"别慌！跟我来，我们把它引到洞窟里去！\"",
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

      // 第五阶段A：洞窟BOSS战（环境互动+NPC队友）
      {
        id: "phase_5_cave",
        name: "洞窟决战",
        description: "你跟着莫凡把幽狼兽引入了洞窟深处。这里布满了巨大的钟乳石。\n\n\"看到那些钟乳石了吗？\"莫凡眼中闪过一丝精光，\"用火系魔法烧断它们，让石头砸下来！\"\n\n这是一场智慧与勇气的较量。莫凡将与你并肩作战！",
        type: "battle",
        enemyId: "demon_wolf_advanced",
        battleOptions: {
          fearLevel: 2,
          canFlee: false,
          environment: "cave",
          allies: [
            {
              id: "mo_fan",
              name: "莫凡",
              element: "fire",
              hp: 250,
              maxHp: 250,
              attack: 30,
              defense: 12,
              speed: 14,
              style: "aggressive"
            }
          ]
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
        description: "年度考核当天，操场上聚集了全校新生。薛木生老师正在讲解考核规则。\n\n训练场前端的石墩上托着一块硕大的星感石——它看上去有点像黑色的鹅卵石，西瓜那么大。\"第一项是星感石测试，每人三次机会取最好成绩，将手放在星感石上，集中精神进入冥修，星感石会根据你们星尘光辉的强弱印射出光芒。第二项是魔法释放考核，星感石B级以上的同学可以参加。\"\n\n穆宁雪的到来引起了全校轰动，她是博城第一天才，也是穆氏家族的骄傲。\n\n你可以选择如何度过考核前的这段时间。",
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
        description: "轮到你进行星感石测试了。\n\n训练场前端的石墩上托着一块硕大的星感石——它看上去有点像黑色的鹅卵石，西瓜那么大，表面泛着淡淡的光泽。这是年度考核最重要的仪器。\n\n你深吸一口气，将手掌放在这硕大的星感石上，集中精神进入冥修状态。星感石会根据你星尘光辉的强弱印射出一样的光芒，考官们通过光芒亮度来判断你这一年的修炼成果。\n\n黑色的星感石之中渐渐发出了光辉...",
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

      // 第三阶段：魔法释放考核（v3.1.0改为自动评分，无需战斗）
      {
        id: "phase_3_release",
        name: "魔法释放考核",
        description: "接下来是魔法释放考核。你需要在考官面前完整释放你的初阶魔法。\n\n许昭霆的雷印获得了S级评价，威力惊人。穆白的冰蔓是B级，稳定而成熟。周敏的火滋也是B级。\n\n轮到你了。你深吸一口气，集中精神，完整释放了你的魔法...\n\n（系统根据你的等级、技能数量、心境和元素等级自动评分）",
        type: "auto",
        nextPhase: "phase_4_result",
        effects: {
          flags: { "exam_release_done": true }
        }
      },

      // 第四阶段：成绩公布
      {
        id: "phase_4_result",
        name: "成绩公布",
        description: "考核结束，成绩公布了！",
        type: "choice",
        choices: [
          {
            text: "查看我的评级和奖励",
            nextPhase: "phase_5_recruit",
            conditions: { flagAny: ["exam_rank_S", "exam_rank_A"] },
            effects: {}
          },
          {
            text: "查看我的评级和奖励",
            nextPhase: "phase_6_end",
            conditions: { flagAny: ["exam_rank_B", "exam_rank_C", "exam_rank_D"] },
            effects: {}
          }
        ]
      },

      // 第五阶段：穆氏招揽（S/A级触发）
      {
        id: "phase_5_recruit",
        name: "穆氏的招揽",
        description: "考核结束后，穆氏世家的代表找到你。\n\n\"你的天赋不错。\"对方的语气高傲，但带着一丝欣赏，\"加入穆氏，我们可以给你星尘魔器的使用资格、高级导师指导、最好的修炼资源。\"\n\n这是一个改变命运的机会，但也意味着你将和穆氏世家深度绑定。",
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
        description: "穆氏代表大怒：\"好，好一个不知天高地厚的小子！\"\n\n他转向身后的宇昂：\"宇昂，18岁成年礼时，你和他决斗，让他知道什么叫差距。\"\n\n宇昂冷冷地看着你：\"我会手下留情的。\"\n\n你接受了这个挑战。",
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
        description: "年度考核结束了。你的表现引起了不少人的关注，未来的路还很长...\n\n（根据你的评级，你获得了相应的奖励和星尘魔器使用权）",
        type: "auto",
        effects: {
          flags: { "annual_exam_completed": true },
          examRewards: true,
          starDustAssignByRank: {
            rank: "auto",
            modifiers: {}
          }
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
        description: "毕业前夕，穆氏庄园的魔法决斗场。\n\n博城五大势力齐聚——天澜魔法高中朱校长、猎者联盟邓凯大长老、魔法协会杨作河、军方斩空教官、穆氏家主穆卓云。\n\n这场决斗的起因，要追溯到年度考核之后。当时穆卓云欣赏莫凡的天赋，当众表示要将莫凡招入穆氏，甚至有意撮合他与穆宁雪。在穆卓云看来，这是给了一个司机的儿子一跃龙门的机会。\n\n然而莫凡的回答却是——\"你脑子进水了吧？\"他不仅当众拒绝，还翻出三年前穆卓云对他家庭做过的事，言辞激烈，毫不留情。\n\n穆宁雪当场站出来要为父亲出气，提出魔法决斗。穆卓云识破女儿想手下留情的意图，换成了养子宇昂——穆氏有名的修炼疯子，对穆卓云唯命是从，就算让他直接杀人也不会犹豫。\n\n决斗的彩头是博城地圣泉的一周修炼资格——这是博城最珍贵的修炼资源，一年只开启一次，足以让初阶法师冲击中阶。\n\n莫凡将代表学校挑战穆氏的宇昂。据说宇昂已经掌握了3级冰蔓·覆盖。\n\n你站在观众席上，周围是熟悉的同学和老师。这场决斗，你选择如何自处？",
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
  },

  // v3.1.0: 穆氏鸿门宴 - 招揽失败后的施压与拉拢
  big_event_mu_banquet: {
    id: "big_event_mu_banquet",
    name: "穆氏鸿门宴",
    description: "年度考核后，穆氏世家邀请你赴宴。这是一场试探，也是最后通牒...",
    type: "narrative",
    autoTrigger: false,
    conditions: {
      minLevel: 5,
      requiredFlags: ["annual_exam_completed"],
      excludeFlags: ["earth_spring_duel_completed"]
    },
    phases: [
      // 第一阶段：邀请
      {
        id: "phase_1_invitation",
        name: "穆氏请柬",
        description: "考核结束后的第三天，一个穿着穆氏制服的管家找到了你。\n\n\"我家主人穆卓云先生有请，希望你能光临今晚的宴会。\"管家的态度恭敬，但语气中带着一丝不容拒绝的意味，\"这是个好机会，很多人求都求不来。\"\n\n你接过烫金的请柬，心中明白——这不是简单的宴会。穆氏在招揽被拒后，不会轻易放弃。",
        type: "choice",
        choices: [
          {
            text: "接受邀请，独自赴宴",
            nextPhase: "phase_2_banquet",
            effects: {
              flags: { "banquet_choice": "accept_alone" }
            }
          },
          {
            text: "接受邀请，叫上莫凡一起去",
            nextPhase: "phase_2_banquet",
            conditions: { npcRelation: { mo_fan: 10 } },
            effects: {
              npcRelation: { "mo_fan": 5 },
              flags: { "banquet_choice": "accept_with_mofan" }
            }
          },
          {
            text: "婉拒邀请，称身体不适",
            nextPhase: "phase_4_refuse",
            effects: {
              reputation: { "mu_family": -5, "grassroots": 5 },
              flags: { "banquet_choice": "refuse" }
            }
          }
        ]
      },

      // 第二阶段：宴会
      {
        id: "phase_2_banquet",
        name: "穆氏庄园",
        description: "傍晚，你来到穆氏庄园。金碧辉煌的大厅里，博城有头有脸的人物几乎都到了。\n\n穆卓云亲自迎了上来：\"年轻人，你来了就好。\"他的笑容热情，但眼神锐利，\"年度考核的表现我都听说了，不错，很不错。\"\n\n宴席间，穆卓云不断展示穆氏的实力——星尘魔器库、专属修炼室、中阶法师导师团。\n\n\"加入穆氏，这些资源你都能用。\"穆卓云放下酒杯，\"之前的事，我可以当作没发生过。年轻人有脾气是好事，但也要认清现实。\"\n\n全场的目光都集中在你身上。",
        type: "choice",
        choices: [
          {
            text: "（隐忍）感谢穆家主厚爱，我会认真考虑",
            nextPhase: "phase_3_test",
            effects: {
              reputation: { "mu_family": 10 },
              flags: { "banquet_attitude": "patient" }
            }
          },
          {
            text: "（反击）穆家主的好意我心领了，但我习惯靠自己",
            nextPhase: "phase_3_test",
            effects: {
              reputation: { "mu_family": -10, "grassroots": 10, "brave": 5 },
              flags: { "banquet_attitude": "resist" }
            }
          },
          {
            text: "（离席）抱歉，我还有事，先走了",
            nextPhase: "phase_4_leave",
            effects: {
              reputation: { "mu_family": -20, "grassroots": 15, "brave": 10 },
              npcRelation: { "mo_fan": 10, "mu_bai": -10 },
              flags: { "banquet_attitude": "leave" }
            }
          }
        ]
      },

      // 第三阶段：试探
      {
        id: "phase_3_test",
        name: "刀光剑影",
        description: "你的回答让穆卓云脸色微变。\n\n这时，穆白站了起来：\"既然这位同学这么有自信，不如和我切磋一下？让大家看看，拒绝穆氏的资本是什么。\"\n\n宇昂也在一旁冷冷地看着你，手指间寒气凝聚。\n\n穆卓云没有阻止，只是端起酒杯，似笑非笑地看着你。",
        type: "choice",
        choices: [
          {
            text: "接受穆白的切磋挑战",
            nextPhase: "phase_4_duel",
            effects: {
              reputation: { "brave": 10 },
              flags: { "banquet_test": "accept_duel" }
            }
          },
          {
            text: "拒绝切磋，称今天是宴会不是比武场",
            nextPhase: "phase_4_end",
            effects: {
              composure: 5,
              reputation: { "mu_family": 5 },
              flags: { "banquet_test": "refuse_duel" }
            }
          },
          {
            text: "（如果莫凡在场）让莫凡代我应战",
            nextPhase: "phase_4_mofan_duel",
            conditions: { flag: "banquet_choice", value: "accept_with_mofan" },
            effects: {
              npcRelation: { "mo_fan": 10 },
              flags: { "banquet_test": "mofan_duel" }
            }
          }
        ]
      },

      // 第四阶段A：与穆白切磋
      {
        id: "phase_4_duel",
        name: "宴会上的切磋",
        description: "你和穆白来到庄园的训练场。围观的人越来越多。\n\n穆白释放冰系魔法，寒气逼人。你知道，这不仅仅是切磋——穆氏在试探你的底线。",
        type: "battle",
        enemyId: "mu_bai_duel",
        battleOptions: {
          mode: "duel",
          canFlee: false,
          canUseItems: false,
          fearLevel: 0
        },
        winPhase: "phase_4_duel_win",
        losePhase: "phase_4_duel_lose"
      },

      // 切磋胜利
      {
        id: "phase_4_duel_win",
        name: "技惊四座",
        description: "你击败了穆白！全场哗然。\n\n穆卓云的脸色彻底沉了下来。穆白咬着牙，眼中满是不甘。\n\n\"好，好得很。\"穆卓云冷笑，\"年轻人，你会为今天的选择后悔的。\"\n\n你知道，从今天起，穆氏将视你为眼中钉。但你也赢得了在场不少人的尊重——尤其是那些同样出身草根的法师。",
        type: "narrative",
        nextPhase: "phase_5_end",
        effects: {
          exp: 100,
          gold: 100,
          reputation: { "grassroots": 20, "brave": 15, "mu_family": -15 },
          npcRelation: { "mu_bai": -20, "mo_fan": 10 },
          flags: { "banquet_result": "defeated_mubai", "mu_family_hostile": true }
        }
      },

      // 切磋失败
      {
        id: "phase_4_duel_lose",
        name: "虽败犹荣",
        description: "你输给了穆白。他的冰系魔法确实精湛，还有穆氏资源的加持。\n\n但你虽败犹荣——能在穆氏庄园和穆白战到这个地步，已经让不少人刮目相看。\n\n穆卓云淡淡道：\"年轻人，实力不够的时候，态度最好放低一些。\"\n\n你握紧了拳头，心中暗下决心——总有一天，你会让穆氏刮目相看。",
        type: "narrative",
        nextPhase: "phase_5_end",
        effects: {
          exp: 50,
          hp: -30,
          reputation: { "brave": 5, "mu_family": -5 },
          npcRelation: { "mu_bai": -5 },
          flags: { "banquet_result": "lost_to_mubai" }
        }
      },

      // 第四阶段B：莫凡代战
      {
        id: "phase_4_mofan_duel",
        name: "莫凡出手",
        description: "莫凡站了出来：\"我来陪你玩玩。\"\n\n他的语气轻松，但眼中闪过一丝精光。穆白脸色一变——他知道莫凡的实力。\n\n果然，莫凡用雷印破冰，再用火滋灼烧，几招之内就压制了穆白。\n\n全场震惊。穆卓云的脸色难看到了极点。\n\n\"司机的儿子，也敢在穆氏庄园撒野？\"穆卓云怒道。\n\n莫凡耸耸肩：\"是你们要切磋的，怎么，输不起？\"",
        type: "narrative",
        nextPhase: "phase_5_end",
        effects: {
          exp: 80,
          reputation: { "grassroots": 15, "mu_family": -20 },
          npcRelation: { "mo_fan": 15, "mu_bai": -15 },
          flags: { "banquet_result": "mofan_won", "mu_family_hostile": true }
        }
      },

      // 第四阶段C：婉拒邀请
      {
        id: "phase_4_refuse",
        name: "不欢而散",
        description: "你婉拒了邀请。管家的脸色有些难看，但还是礼貌地离开了。\n\n后来你听说，穆卓云对你的拒绝很不满，在多个场合表示\"不识抬举\"。\n\n但你并不在意——靠自己的实力，比依附世家更踏实。",
        type: "narrative",
        nextPhase: "phase_5_end",
        effects: {
          exp: 20,
          flags: { "banquet_result": "refused_invitation" }
        }
      },

      // 第四阶段D：直接离席
      {
        id: "phase_4_leave",
        name: "拂袖而去",
        description: "你直接起身离席，全场一片寂静。\n\n穆卓云的脸色铁青：\"好，好一个有骨气的年轻人。\"\n\n你走出穆氏庄园，夜风拂面。你知道，从今天起，穆氏不会再给你好脸色看了。\n\n但你也知道，莫凡会因为你的选择而更加认可你。",
        type: "narrative",
        nextPhase: "phase_5_end",
        effects: {
          exp: 30,
          flags: { "banquet_result": "left_early", "mu_family_hostile": true }
        }
      },

      // 第四阶段E：拒绝切磋
      {
        id: "phase_4_end",
        name: "全身而退",
        description: "你拒绝了切磋，称今天是宴会不是比武场。\n\n穆卓云愣了一下，随即笑了：\"说得对，是我教子无方。小白，还不道歉？\"\n\n穆白不情不愿地道了歉。宴会在表面的和谐中结束了。\n\n你知道，穆氏不会善罢甘休，但至少今天，你没有给他们任何把柄。",
        type: "narrative",
        nextPhase: "phase_5_end",
        effects: {
          exp: 40,
          gold: 50,
          reputation: { "mu_family": 5 },
          flags: { "banquet_result": "peaceful_end" }
        }
      },

      // 第五阶段：结束
      {
        id: "phase_5_end",
        name: "宴会之后",
        description: "鸿门宴结束了。\n\n无论结果如何，你都更加清楚地认识到这个世界的规则——世家的力量根深蒂固，草根的崛起注定艰难。\n\n但你并不后悔自己的选择。地圣泉决斗即将到来，那将是你证明自己的舞台。\n\n（你的选择将影响地圣泉决斗中的立场和关系）",
        type: "auto",
        effects: {
          flags: { "mu_banquet_completed": true }
        }
      }
    ]
  },

  // v3.1.0: 城市猎妖任务——独眼魔狼
  big_event_city_hunt_one_eye_wolf: {
    id: "big_event_city_hunt_one_eye_wolf",
    name: "城市猎妖：独眼魔狼",
    description: "博城近郊废弃工地出现妖魔踪迹，城市猎妖队发布紧急任务...",
    type: "narrative",
    triggerConditions: {
      minLevel: 5,
      minDay: 10,
      flags: { not: "city_hunt_one_eye_completed" }
    },
    phases: [
      // 第一阶段：接到任务
      {
        id: "phase_1_accept",
        name: "猎妖任务",
        description: "你在猎魔者公会看到一则紧急任务：\n\n「博城东郊废弃工地附近连续有人失踪，疑似有妖魔出没。城市猎妖队人手不足，征召有能力的法师协助调查。」\n\n任务奖励：经验300、金币150、猎魔者公会声望+10\n\n你是否接下这个任务？",
        type: "choice",
        choices: [
          {
            text: "接下任务，前往调查",
            nextPhase: "phase_2_investigate",
            effects: { flags: { "city_hunt_accepted": true } }
          },
          {
            text: "暂时不接，实力还不够",
            nextPhase: "phase_decline",
            effects: {}
          }
        ]
      },
      // 拒绝
      {
        id: "phase_decline",
        name: "暂缓",
        description: "你决定先提升实力再来。\n\n（任务保留，可在猎魔者公会重新接取）",
        type: "auto",
        effects: {}
      },
      // 第二阶段：调查工地
      {
        id: "phase_2_investigate",
        name: "废弃工地",
        description: "你来到博城东郊的废弃工地。这里原本是一座在建商场，停工已有两个月，到处是水泥袋和建筑垃圾。\n\n空气中弥漫着一股淡淡的血腥味，寻妖粉显示的足迹延伸到工地深处...\n\n你小心翼翼地穿过砖墙，眼前的一幕让你瞳孔骤缩——\n\n一只半直立的巨狼正在咀嚼，它的脑袋上只有一只眼睛，在昏暗中发出幽绿的光。那是...独眼魔狼！\n\n更可怕的是，它嘴边有一截人类的手臂。它在吃人！",
        type: "choice",
        choices: [
          {
            text: "悄悄撤退，去通知城市猎妖队",
            nextPhase: "phase_3_retreat",
            effects: {}
          },
          {
            text: "拿出手机发求救短信",
            nextPhase: "phase_3_phone_alert",
            effects: {}
          },
          {
            text: "直接发起攻击！",
            nextPhase: "phase_3_direct_battle",
            effects: {}
          }
        ]
      },
      // 第三阶段A：悄悄撤退
      {
        id: "phase_3_retreat",
        name: "冷静撤退",
        description: "你屏住呼吸，缓缓后退。独眼魔狼似乎没有发现你，继续进食。\n\n你成功撤出工地，立刻赶往最近的猎妖队联络点。\n\n半小时后，城市猎妖队的三名法师赶到现场。经过一番激战，独眼魔狼被击杀，但其中一名猎妖队员受了重伤。\n\n「多亏你及时报信，不然这畜生还不知道要吃多少人。」猎妖队长拍了拍你的肩膀，「不过下次遇到这种情况，不要自己硬扛，通知专业人士才是正确选择。」",
        type: "auto",
        effects: {
          exp: 200,
          gold: 100,
          reputation: { "hunter_guild": 15, "military": 5 },
          flags: { "city_hunt_one_eye_completed": true, "city_hunt_smart": true }
        }
      },
      // 第三阶段B：手机求救被发现
      {
        id: "phase_3_phone_alert",
        name: "信号暴露",
        description: "你掏出手机，快速编辑求救短信发送给猎妖队。\n\n然而——独眼魔狼的独目猛然转向你！\n\n这个世界的妖魔拥有感知魔法科技设备信号的能力，你调静音发短信无异于给它发了一个GPS定位！\n\n「呃呜~~~~~~~~~~~！！！！」\n\n独眼魔狼发出一声咆哮，身体弓起，化为一道黑影朝你狂奔而来！",
        type: "battle",
        enemyId: "one_eye_wolf",
        battleContext: "独眼魔狼（被手机信号激怒，速度提升）",
        nextPhaseOnWin: "phase_4_win_battle",
        nextPhaseOnLose: "phase_4_lose_battle"
      },
      // 第三阶段C：直接战斗
      {
        id: "phase_3_direct_battle",
        name: "正面交锋",
        description: "你决定先发制人！星轨在指尖飞速连接，魔法能量汇聚——\n\n独眼魔狼察觉到你的攻击意图，独目中闪过凶残的光芒，它丢下食物，朝你扑来！",
        type: "battle",
        enemyId: "one_eye_wolf",
        battleContext: "独眼魔狼（正面遭遇战）",
        nextPhaseOnWin: "phase_4_win_battle",
        nextPhaseOnLose: "phase_4_lose_battle"
      },
      // 第四阶段：战斗胜利
      {
        id: "phase_4_win_battle",
        name: "击杀妖魔",
        description: "经过一番激战，独眼魔狼倒在你的脚下，独目中的光芒渐渐消散。\n\n你喘着粗气，检查了一下伤势。虽然受了些伤，但成功击杀了一只奴仆级妖魔，这在学生中已经相当了不起了。\n\n城市猎妖队随后赶到，看到地上的独眼魔狼尸体，队长惊讶地看着你：「你一个人击杀的？了不起！这畜生已经害了三条人命了。」\n\n猎妖队清理了现场，你获得了丰厚的奖励。",
        type: "auto",
        effects: {
          exp: 400,
          gold: 200,
          reputation: { "hunter_guild": 20, "grassroots": 10, "military": 10 },
          items: [{ itemId: "wolf_pelt", count: 1 }],
          flags: { "city_hunt_one_eye_completed": true, "city_hunt_brave": true }
        }
      },
      // 第四阶段：战斗失败
      {
        id: "phase_4_lose_battle",
        name: "险象环生",
        description: "独眼魔狼的力量远超你的想象，你被它的冲撞击飞，重重摔在水泥堆上，眼前一黑...\n\n就在独眼魔狼准备给你最后一击时，一道雷光从天而降，将它逼退。\n\n「小子，撑住！」\n\n是城市猎妖队！他们追踪信号赶到，及时救下了你。\n\n经过一番苦战，猎妖队击杀了独眼魔狼。你虽然受了重伤，但好歹保住了性命。\n\n「下次别这么冲动。」猎妖队长皱着眉说，「遇到奴仆级以上的妖魔，第一时间通知专业人士。」",
        type: "auto",
        effects: {
          exp: 100,
          gold: 50,
          hp: -50,
          reputation: { "hunter_guild": 5 },
          flags: { "city_hunt_one_eye_completed": true, "city_hunt_injured": true }
        }
      }
    ]
  },

  // v2.0.0: 灾后审判与去留
  big_event_post_disaster: {
    id: "big_event_post_disaster",
    name: "灾后审判",
    description: "博城灾难结束后，审判会介入调查，玩家面临去留抉择...",
    type: "narrative",
    autoTrigger: false,
    conditions: {
      requiredFlags: ["bo_city_disaster_completed"]
    },
    phases: [
      // 第一阶段：审判会到来
      {
        id: "phase_1_inquisitor",
        name: "审判会到来",
        description: "博城灾难后的第三天，天空依然阴沉。\n\n城市的废墟还在清理，空气中弥漫着焦糊和血腥的气味。就在这时，一队身穿银白长袍的法师来到了博城——审判会的调查员。\n\n为首的是一位面容严肃的中年女法师，她的徽章上刻着天平与利剑的标记。\n\n\"我是审判会调查员冷青。\"她的声音不带感情，\"我们来调查博城灾难的真相。所有经历过灾难的人都需要接受问询。\"\n\n唐月老师走到你身边，低声说：\"轮到你的时候，把你知道的都说出来。审判会是唯一能真正制裁黑教廷的组织。\"",
        type: "choice",
        choices: [
          {
            text: "我愿意配合调查",
            nextPhase: "phase_2_evidence",
            effects: {
              reputation: { "inquisition": 5 }
            }
          },
          {
            text: "我有重要证据要提供",
            nextPhase: "phase_2_evidence",
            effects: {
              reputation: { "inquisition": 10 },
              exp: 30
            }
          }
        ]
      },

      // 第二阶段：提交证据
      {
        id: "phase_2_evidence",
        name: "提交证据",
        description: "冷青调查员带你到一间临时设立的问询室。\n\n\"说说你在灾难中的经历。\"她打开记录本，\"任何细节都不要遗漏。\"\n\n你可以选择提供以下证据：",
        type: "choice",
        choices: [
          {
            text: "提交黑教廷徽章（击败宇昂/执事获得）",
            nextPhase: "phase_3_judgment",
            conditions: { hasItem: "black_church_badge" },
            effects: {
              flags: { "evidence_badge": true },
              reputation: { "inquisition": 15 }
            }
          },
          {
            text: "报告宇昂的黑教廷身份",
            nextPhase: "phase_3_judgment",
            conditions: { requiredFlags: ["yu_ang_black_church_confirmed"] },
            effects: {
              flags: { "evidence_yuang": true },
              reputation: { "inquisition": 20 }
            }
          },
          {
            text: "报告地圣泉守护经过",
            nextPhase: "phase_3_judgment",
            conditions: { requiredFlags: ["earth_spring_guarded"] },
            effects: {
              flags: { "evidence_earth_spring": true },
              reputation: { "inquisition": 20 }
            }
          },
          {
            text: "提交暴躁之泉调查线索",
            nextPhase: "phase_3_judgment",
            conditions: { requiredFlags: ["violent_spring_known"] },
            effects: {
              flags: { "evidence_violent_spring": true },
              reputation: { "inquisition": 15 }
            }
          },
          {
            text: "提交阴谋调查报告",
            nextPhase: "phase_3_judgment",
            conditions: { requiredFlags: ["investigation_started"] },
            effects: {
              flags: { "evidence_investigation": true },
              reputation: { "inquisition": 10 }
            }
          },
          {
            text: "我没有更多证据了",
            nextPhase: "phase_3_judgment",
            effects: {}
          }
        ]
      },

      // 第三阶段：审判结果
      {
        id: "phase_3_judgment",
        name: "审判结果",
        description: "冷青调查员仔细记录了你的证词，沉默了片刻。\n\n\"你的证词很有价值。\"她合上记录本，\"根据我们目前掌握的证据，审判会将对穆氏世家展开正式调查。黑教廷在博城的据点已经被端掉，但他们的网络远比我们想象的庞大。\"\n\n\"你在灾难中的表现，审判会已经记录在案。如果未来你愿意为审判会提供更多帮助，我们会非常欢迎。\"\n\n她递给你一枚银色的徽章：\"这是审判会协助者的徽章，持此徽章可以在各地审判会分部获得协助。\"",
        type: "narrative",
        nextPhase: "phase_4_farewell",
        effects: {
          exp: 100,
          gold: 200,
          reputation: { "inquisition": 20 },
          items: [{ itemId: "inquisition_badge", count: 1 }],
          flags: { "inquisition_ally": true }
        }
      },

      // 第四阶段：NPC告别
      {
        id: "phase_4_farewell",
        name: "告别",
        description: "审判结束后，你走在博城的街道上。\n\n废墟中已经有人开始清理和重建，城市正在慢慢恢复生机。一些熟悉的身影出现在你面前。\n\n唐月老师找到你：\"博城的事暂时告一段落了。你接下来有什么打算？\"\n\n\"斩空教官推荐了古都的进修名额，那里有最古老的魔法学院和陵墓遗迹。明珠学府也发来了邀请，上海的资源和眼界是博城无法比拟的。当然，你也可以选择留下来，帮助博城重建。\"\n\n\"无论你选择哪里，我都支持你的决定。\"",
        type: "choice",
        choices: [
          {
            text: "留在博城，参与重建",
            nextPhase: "phase_5_stay",
            effects: {
              reputation: { "bo_city": 30, "school": 10 },
              npcRelation: { "tang_yue": 10, "zhang_xiaohou": 10 },
              flags: { "stay_in_bo_city": true }
            }
          },
          {
            text: "去古都进修（西安）",
            nextPhase: "phase_5_ancient_capital",
            effects: {
              reputation: { "military": 15 },
              npcRelation: { "tang_yue": 5 },
              flags: { "go_to_ancient_capital": true, "ancient_capital_unlocked": true }
            }
          },
          {
            text: "去明珠学府（上海）",
            nextPhase: "phase_5_pearl",
            effects: {
              reputation: { "school": 20 },
              npcRelation: { "tang_yue": 5 },
              flags: { "go_to_pearl": true, "pearl_academy_unlocked": true }
            }
          }
        ]
      },

      // 第五阶段A：留博城
      {
        id: "phase_5_stay",
        name: "博城新生",
        description: "你决定留在博城，参与这座城市的重建。\n\n唐月老师欣慰地点头：\"博城需要像你这样的年轻人。重建的路很长，但有你们在，博城一定会恢复往日的繁荣。\"\n\n张小侯拍了拍你的肩膀：\"太好了，有你在，重建也没那么无聊了！\"\n\n你站在废墟之上，望着远方初升的太阳。博城的故事还没有结束，你的故事也才刚刚开始。\n\n（博城篇完成！你选择了留在博城，后续将解锁重建任务线）",
        type: "auto",
        effects: {
          exp: 200,
          gold: 300,
          acceptQuest: "quest_rebuild_clear_rubble",
          flags: { "bo_city_arc_completed": true, "rebuilding_arc_started": true }
        }
      },

      // 第五阶段B：去古都
      {
        id: "phase_5_ancient_capital",
        name: "西行古都",
        description: "你决定接受斩空教官的推荐，前往古都进修。\n\n唐月老师递给你一封信：\"这是我给古都审判会分部的介绍信。到了西安，有任何事都可以找他们。\"\n\n\"古都有最古老的魔法传承，也有最危险的陵墓遗迹。\"她的语气有些担忧，\"但我相信你能在那里闯出一片天地。\"\n\n你收拾好行囊，踏上了西行的道路。博城的一切渐渐远去，但那些人和事，将永远留在你心中。\n\n（博城篇完成！古都篇前置已解锁，后续将开启古都冒险）",
        type: "auto",
        effects: {
          exp: 200,
          gold: 200,
          items: [{ itemId: "tang_yue_recommendation", count: 1 }],
          flags: { "bo_city_arc_completed": true }
        }
      },

      // 第五阶段C：去明珠
      {
        id: "phase_5_pearl",
        name: "东行明珠",
        description: "你决定前往上海明珠学府进修。\n\n唐月老师微笑着说：\"明珠学府是全国最好的魔法学院之一，那里有最优秀的导师和最丰富的资源。你一定会有更大的发展。\"\n\n\"上海是个大城市，机会多，竞争也大。\"她叮嘱道，\"保持本心，不要被繁华迷失了方向。\"\n\n你登上了东去的列车，博城在视野中越来越小。新的城市，新的开始，你的魔法之路将在那里继续延伸。\n\n（博城篇完成！明珠学府前置已解锁，后续将开启明珠篇）",
        type: "auto",
        effects: {
          exp: 200,
          gold: 200,
          flags: { "bo_city_arc_completed": true }
        }
      }
    ],

    endings: {
      stay: {
        id: "stay",
        name: "博城新生",
        description: "你选择留在博城参与重建，成为这座城市新生的见证者和建设者。",
        effects: {
          reputation: { "bo_city": 50 }
        }
      },
      ancient_capital: {
        id: "ancient_capital",
        name: "西行古都",
        description: "你选择前往古都进修，开启了新的冒险篇章。",
        effects: {
          reputation: { "military": 20 }
        }
      },
      pearl: {
        id: "pearl",
        name: "东行明珠",
        description: "你选择前往明珠学府进修，在繁华都市中继续你的魔法之路。",
        effects: {
          reputation: { "school": 30 }
        }
      }
    }
  },
  big_event_bai_yang_spy: {
    id: "big_event_bai_yang_spy",
    name: "黑教廷奸细·白阳",
    description: "博城灾难中，雪峰山历练的召唤系教官白阳出现，试图从你手中骗取地圣泉。他的真实身份是黑教廷奸细！",
    type: "narrative",
    autoTrigger: false,
    conditions: {
      requiredFlags: ["bocheng_disaster_happened"],
      minLevel: 5,
    },
    phases: [
      {
        id: "encounter",
        title: "遭遇白阳",
        narrative: "暴雨中，你和同学们在撤离途中艰难前行。突然，一只幽狼兽从废墟中跃出，上面骑着的人正是雪峰山历练的召唤系教官——白阳。他摘下军帽，露出温和的笑容：'你们怎么会在这，没有第一时间撤离吗？'",
        choices: [
          {
            text: "信任白阳教官，交出地圣泉",
            nextPhase: "bad_ending",
            effects: { flags: { earth_spring_lost: true } }
          },
          {
            text: "保持警惕，询问白阳更多细节",
            nextPhase: "temptation"
          },
          {
            text: "直接质疑白阳的身份（需要雪峰山线索）",
            nextPhase: "exposed",
            conditions: { requiredFlags: ["xuefeng_spring_clue"] }
          }
        ]
      },
      {
        id: "temptation",
        title: "白阳的试探",
        narrative: "白阳上下打量着你，想知道地圣泉是否还在。'这次灾难是黑教廷做的，他们不仅引来了翼苍狼，更想要利用地圣泉将更多统领级妖魔引到这里。林雨欣副卫长应该将地圣泉交到你手上了吧？把地圣泉交给我吧，我得马上送回到斩空老大那里。'薛木生老师也劝说：'把地圣泉交给白阳教官，我们赶紧到安全结界内。'白阳激动地上前一步，几乎要从你手上抢过地圣泉。",
        choices: [
          {
            text: "交出地圣泉",
            nextPhase: "bad_ending",
            effects: { flags: { earth_spring_lost: true } }
          },
          {
            text: "拒绝交出，质疑白阳",
            nextPhase: "exposed"
          }
        ]
      },
      {
        id: "exposed",
        title: "白阳暴露",
        narrative: "你拒绝交出地圣泉。白阳愣了一下，随即狂然大笑起来：'哈哈哈哈，真是没有想到啊，我都不禁有些好奇你是怎么怀疑上我的，我可是你们的教官啊！'刚才还一脸和煦俊俏的模样，在此刻整个就是一个思想扭曲的疯子。你急忙警示同伴：'小心，这家伙的召唤兽不止一只！'",
        choices: [
          {
            text: "准备战斗",
            nextPhase: "black_beast_attack"
          }
        ]
      },
      {
        id: "black_beast_attack",
        title: "黑畜妖袭击",
        narrative: "白阳脸色一沉，瞳孔凶光一闪。霎时，桥梁侧面扶栏处两只正缓慢蠕动的黑影无比灵敏地飞窜了出来，格外狭长和锋利的前肢就像两柄镰刀分别朝着离那里最近的张小侯和何雨斩去！何雨释放水域保护张小侯，自己却被重伤。张小侯抱着何雨，何雨脸颊苍白发紫。白阳丧心病狂地说：'看来你们这些小鬼也是有一点进步的嘛...不过本教官今天又给你们上了一课，让你们明白不要轻易相信任何人。'",
        choices: [
          {
            text: "保护何雨和张小侯撤退",
            nextPhase: "battle",
            effects: { flags: { protect_he_yu: true } }
          },
          {
            text: "直接攻击白阳",
            nextPhase: "battle",
            effects: { flags: { attack_bai_yang: true } }
          }
        ]
      },
      {
        id: "battle",
        title: "激战白阳",
        narrative: "白阳召唤更多黑畜妖，战斗一触即发。薛木生老师挡在前面，张小侯扶着重伤的何雨，许昭霆和王三胖准备战斗。你必须做出选择。",
        enemyId: "bai_yang_duel",
        winPhase: "good_ending",
        losePhase: "normal_ending"
      },
      {
        id: "good_ending",
        title: "保住地圣泉",
        narrative: "经过激战，你成功击退了白阳和黑畜妖，保住了地圣泉。何雨虽然重伤但存活下来。你们成功撤退到安全结界。斩空得知白阳是奸细后相当意外：'连我们军部都一直没有察觉到白阳这位军法师的险恶用心，为何你会对他心生怀疑？'你解释了雪峰山历练时的疑点。斩空询问地圣泉下落，你说：'口渴，顺手喝了。'斩空差点脚一滑摔死。",
        effects: {
          exp: 500,
          gold: 200,
          reputation: { military: 20 },
          flags: { bai_yang_exposed: true, earth_spring_kept: true },
          items: ["earth_holy_spring"]
        }
      },
      {
        id: "normal_ending",
        title: "地圣泉被抢",
        narrative: "战斗中你被迫撤退，地圣泉被白阳抢走。何雨重伤，你们艰难撤退到安全结界。斩空得知后震怒：'地圣泉落入黑教廷手中，博城将面临更多统领级妖魔！'他下令全力追击白阳。",
        effects: {
          exp: 200,
          gold: 50,
          flags: { bai_yang_exposed: true, earth_spring_lost: true }
        }
      },
      {
        id: "bad_ending",
        title: "白阳得逞",
        narrative: "你将地圣泉交给了白阳。白阳拿到地圣泉后，笑容变得扭曲：'真是个听话的好孩子。'他召唤黑畜妖袭击你们，自己带着地圣泉消失在暴雨中。你们损失惨重，何雨重伤。斩空得知后震怒，博城将面临更大的灾难。",
        effects: {
          flags: { earth_spring_lost: true, bai_yang_escaped: true }
        }
      }
    ]
  },




  big_event_earth_spring_contest: {
    id: "big_event_earth_spring_contest",
    name: "地圣泉争夺战",
    description: "博城地圣泉每届只为一名学生开启，魔法家族、世家子弟也要进入竞争争夺。你将与穆氏养子宇昂争夺这一辈子只有一次的绝佳修炼机会！",
    type: "narrative",
    autoTrigger: false,
    conditions: {
      requiredFlags: ["annual_exam_completed"],
      minLevel: 8,
      notHasFlags: ["earth_spring_obtained", "earth_spring_lost"]
    },
    phases: [
      {
        id: "announcement",
        title: "地圣泉争夺战",
        texts: [
          "朱校长站在主席台上，神情严肃地宣布：「同学们，一年一度的地圣泉争夺战即将开始！」",
          "「地圣泉是博城的修炼圣地，相当于加强了不知多少倍的星尘魔器。每届只为一名学生开启，这是一辈子只有一次的绝佳修炼机会！」",
          "「今年的竞争者包括穆氏养子宇昂，以及通过预选赛的优秀学生。获胜者将获得在地圣泉中修炼整整一个星期的机会！」",
          "你心中一动，地圣泉的修炼机会对你来说至关重要。你决定参加这场争夺战。"
        ],
        choices: [
          {
            text: "我要参加地圣泉争夺战！",
            nextPhase: "final_duel",
            effects: { exp: 50 }
          },
          {
            text: "放弃这次机会",
            nextPhase: "give_up",
            effects: { opinion: -5 }
          }
        ]
      },
      {
        id: "final_duel",
        title: "决赛：VS宇昂",
        texts: [
          "决赛开始了！你的对手是穆氏养子宇昂，一名冰系法师，实力强劲。",
          "宇昂冷冷地看着你：「就凭你也想和我争地圣泉？穆氏的资源不是你能想象的。」",
          "你握紧拳头，这场决斗你必须赢！地圣泉的修炼机会对你来说太重要了。"
        ],
        enemyId: "yu_ang_duel",
        winPhase: "earth_spring_training",
        losePhase: "defeat"
      },
      {
        id: "earth_spring_training",
        title: "地圣泉修炼",
        texts: [
          "你击败了宇昂，获得了地圣泉的修炼机会！朱校长亲自为你开启地圣泉。",
          "进入地圣泉的那一刻，你感受到了前所未有的能量涌入体内。这里的修炼速度是外面的数十倍！",
          "七天七夜，你全神贯注地修炼，实力突飞猛进。你甚至感觉到自己可能觉醒新的元素系！",
          "修炼结束后，你走出地圣泉，感觉自己焕然一新。但你注意到，地圣泉的能量似乎引来了一些不速之客..."
        ],
        effects: {
          exp: 500,
          skillPoints: 3,
          flags: { earth_spring_obtained: true },
          items: [{ itemId: "earth_spring_pass", count: 1 }]
        },
        choices: [
          {
            text: "继续探索地圣泉周围",
            nextPhase: "black_church_ambush"
          }
        ]
      },
      {
        id: "black_church_ambush",
        title: "黑教廷觊觎",
        texts: [
          "你刚走出地圣泉，就看到几个身穿黑袍的人出现在周围。他们的眼神贪婪地盯着地圣泉。",
          "「地圣泉的能量果然名不虚传...」为首的黑袍人冷笑道，「把地圣泉交出来，我们可以饶你不死。」",
          "你认出了他们的标志——黑教廷！他们竟然觊觎地圣泉的能量！",
          "你握紧拳头，地圣泉是博城的宝贵资源，绝不能落入黑教廷手中！"
        ],
        choices: [
          {
            text: "战斗！保护地圣泉！",
            nextPhase: "fight_black_church",
            effects: { opinion: 10 }
          },
          {
            text: "撤退，保存实力",
            nextPhase: "retreat",
            effects: { flags: { earth_spring_lost: true } }
          }
        ]
      },
      {
        id: "fight_black_church",
        title: "激战黑教廷",
        texts: [
          "你冲向黑教廷成员，一场激战开始了！",
          "黑教廷成员使用暗系魔法，攻势凶猛。但你在地圣泉中修炼后实力大增，应对自如。",
          "经过一番激战，你终于击败了黑教廷成员！他们狼狈逃窜，留下了一些线索。"
        ],
        enemyId: "black_church_member",
        winPhase: "victory_ending",
        losePhase: "retreat"
      },
      {
        id: "victory_ending",
        title: "胜利结局",
        texts: [
          "你击败了黑教廷成员，保护了地圣泉！朱校长和其他老师赶到，对你赞不绝口。",
          "「你做得很好！」朱校长欣慰地说，「地圣泉是博城的宝贵资源，绝不能落入黑教廷手中。」",
          "你获得了黑教廷的线索，这将帮助你在博城灾难中更好地应对黑教廷的阴谋。",
          "地圣泉争夺战圆满结束，你获得了修炼机会，也保护了博城的宝贵资源。你的名字将被铭记在博城的历史中！"
        ],
        effects: {
          exp: 200,
          gold: 200,
          reputation: { "school": 30, "bo_city": 20 },
          flags: { black_church_clue_found: true, earth_spring_contest_completed: true }
        },
        isEnding: true
      },
      {
        id: "defeat",
        title: "失败结局",
        texts: [
          "你输给了宇昂，地圣泉的修炼机会被他获得。",
          "宇昂得意地看着你：「我说过，穆氏的资源不是你能想象的。地圣泉的修炼机会是我的了！」",
          "你心中不甘，但也无可奈何。这次失败让你明白了实力的重要性。",
          "虽然失去了地圣泉的修炼机会，但你并没有放弃。你决定更加努力地修炼，争取在未来获得更好的机会。"
        ],
        effects: {
          exp: 100,
          flags: { earth_spring_lost: true, earth_spring_contest_completed: true }
        },
        isEnding: true
      },
      {
        id: "give_up",
        title: "放弃",
        texts: [
          "你决定放弃地圣泉的修炼机会。",
          "朱校长有些失望，但也尊重你的选择。",
          "宇昂不战而胜，获得了地圣泉的修炼机会。",
          "你心中有些遗憾，但也明白有些机会不是必须争取的。你决定走自己的路。"
        ],
        effects: {
          flags: { earth_spring_lost: true, earth_spring_contest_completed: true }
        },
        isEnding: true
      },
      {
        id: "retreat",
        title: "撤退结局",
        texts: [
          "你选择撤退，保存实力。黑教廷成员抢走了地圣泉的部分能量。",
          "你心中有些不甘，但也明白现在不是硬拼的时候。你决定把这个消息告诉朱校长和其他老师。",
          "朱校长得知后非常愤怒，但也肯定了你的谨慎。地圣泉的能量被抢，将影响博城灾难中的局势。",
          "虽然地圣泉的能量被抢，但你获得了重要的情报，这将帮助你在博城灾难中更好地应对黑教廷的阴谋。"
        ],
        effects: {
          exp: 100,
          flags: { earth_spring_lost: true, earth_spring_contest_completed: true, black_church_clue_found: true }
        },
        isEnding: true
      }
    ]
  },

};
export default DataBigEvents;
