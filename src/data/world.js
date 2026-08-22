/**
 * 势力、情报、世界观设定等
 * 从 game-data.js 拆分而来
 */

export const DataWorld = {
  scheduledEvents: [
    {
      id: "event_entrance_exam",
      day: 7,
      name: "入学考核",
      description: "天澜魔法高中的入学考核，检验新生的魔法水平。",
      type: "exam",
      conditions: {
        minLevel: 3
      },
      successRewards: {
        exp: 200,
        gold: 100,
        items: [
          {
            itemId: "basic_staff",
            count: 1
          }
        ]
      },
      failPenalty: {
        exp: -50,
        gold: -30
      },
      successText: "你顺利通过了入学考核！老师们对你的表现很满意。",
      failText: "你没能通过入学考核，需要更加努力修炼了。"
    },
    {
      id: "event_midterm_exam",
      day: 15,
      name: "期中测试",
      description: "学期中的魔法测试，检验半学期的学习成果。",
      type: "exam",
      conditions: {
        minLevel: 5
      },
      successRewards: {
        exp: 500,
        gold: 200,
        items: [
          {
            itemId: "flame_staff",
            count: 1
          }
        ]
      },
      failPenalty: {
        exp: -100,
        gold: -50
      },
      successText: "你在期中测试中取得了优异的成绩！获得了学校的奖励。",
      failText: "期中测试成绩不理想，你需要加倍努力了。"
    },
    {
      id: "event_final_exam",
      day: 30,
      name: "期末考核",
      description: "学期末的最终考核，决定你能否升入更高年级。",
      type: "exam",
      conditions: {
        minLevel: 8
      },
      successRewards: {
        exp: 1000,
        gold: 500,
        items: [
          {
            itemId: "super_health_potion",
            count: 5
          },
          {
            itemId: "leather_armor",
            count: 1
          }
        ]
      },
      failPenalty: {
        exp: -200,
        gold: -100
      },
      successText: "恭喜！你以优异的成绩通过了期末考核，成功升入高年级！",
      failText: "很遗憾，你没能通过期末考核，需要留级重修。"
    },
    {
      id: "event_demon_warning",
      day: 45,
      name: "妖魔异动",
      description: "最近雪峰山的妖魔活动异常频繁，似乎有大事要发生...",
      type: "story",
      conditions: {},
      successRewards: {
        exp: 100
      },
      failPenalty: {},
      successText: "你察觉到了异常，开始为即将到来的危机做准备。",
      failText: ""
    }
  ],
  eventChains: {
    demon_unrest: {
      id: "demon_unrest",
      name: "妖魔异动",
      description: "雪峰山的妖魔活动异常频繁，似乎有大事要发生...",
      type: "main_story",
      startDay: 10,
      stages: {
        start: {
          id: "start",
          name: "传闻阶段",
          description: "零星的传闻开始在城市里流传",
          triggerDay: 10,
          onEnter: {
            giveInfo: [
              "demon_rumor_1"
            ],
            message: "你听到了一些关于山里不太平的传闻..."
          }
        },
        stage_clue: {
          id: "stage_clue",
          name: "线索阶段",
          description: "越来越多的线索表明事情不简单",
          triggerDay: 20,
          conditions: {
            minInfoCount: 2
          },
          onEnter: {
            giveInfo: [
              "demon_clue_1",
              "demon_clue_2"
            ],
            message: "你收集到了足够的线索，意识到事情比想象的更严重..."
          }
        },
        stage_intel: {
          id: "stage_intel",
          name: "情报阶段",
          description: "可靠来源的情报证实了危险",
          triggerDay: 30,
          conditions: {
            minInfoCount: 5
          },
          onEnter: {
            giveInfo: [
              "demon_intel_1",
              "demon_intel_2"
            ],
            message: "你从多个渠道获得了可靠的情报，妖魔异动是真实的！"
          }
        },
        stage_warning: {
          id: "stage_warning",
          name: "预警阶段",
          description: "官方发出了正式预警",
          triggerDay: 40,
          conditions: {},
          onEnter: {
            giveInfo: [
              "demon_warning_1"
            ],
            message: "学校贴出了正式的安全通知，警告学生不要深入山区。"
          }
        },
        stage_outbreak: {
          id: "stage_outbreak",
          name: "爆发阶段",
          description: "灾难爆发了",
          triggerDay: 50,
          conditions: {},
          onEnter: {
            giveInfo: [
              "demon_warning_1"
            ],
            message: "大量妖魔从雪峰山涌出，博城陷入危机！警报声响彻整个城市..."
          }
        },
        stage_chaos: {
          id: "stage_chaos",
          name: "混乱阶段",
          description: "城市陷入混乱",
          triggerDay: 51,
          conditions: {},
          onEnter: {
            message: "博城彻底陷入混乱，到处都是妖魔的嘶吼声和人们的尖叫声..."
          }
        },
        stage_escape: {
          id: "stage_escape",
          name: "逃亡阶段",
          description: "开始逃亡",
          triggerDay: 52,
          conditions: {},
          onEnter: {
            message: "你随着人群开始逃亡，目的地是博城北门的安全区..."
          }
        }
      },
      endings: {
        hero: {
          id: "hero",
          name: "英雄结局",
          description: "你在灾难中英勇战斗，保护了很多人，成为了博城的英雄",
          conditions: {
            minLevel: 12,
            minInfoCount: 10,
            hasItems: [
              "super_health_potion",
              "mana_potion",
              "demon_core"
            ],
            minReputation: {
              hunter_guild: 10
            }
          },
          rewards: {
            exp: 1000,
            gold: 500,
            reputation: {
              tianlan_school: 30,
              hunter_guild: 25,
              magic_association: 20
            },
            items: [
              {
                itemId: "flame_staff",
                count: 1
              }
            ]
          }
        },
        prepared: {
          id: "prepared",
          name: "充分准备",
          description: "你提前做好了充分准备，在灾难中保护了很多人",
          conditions: {
            minLevel: 10,
            minInfoCount: 8,
            hasItems: [
              "super_health_potion",
              "mana_potion"
            ]
          },
          rewards: {
            exp: 500,
            gold: 300,
            reputation: {
              tianlan_school: 20,
              hunter_guild: 15
            }
          }
        },
        survivor: {
          id: "survivor",
          name: "幸存者",
          description: "你成功从灾难中幸存下来，虽然受了点伤，但还活着",
          conditions: {
            minLevel: 8,
            minInfoCount: 5
          },
          rewards: {
            exp: 200,
            gold: 100,
            reputation: {
              tianlan_school: 10
            }
          },
          penalties: {
            hp: -30
          }
        },
        normal: {
          id: "normal",
          name: "一般准备",
          description: "你有所准备，但还不够充分",
          conditions: {
            minLevel: 7,
            minInfoCount: 3
          },
          rewards: {
            exp: 100,
            gold: 50
          },
          penalties: {
            hp: -50
          }
        },
        unprepared: {
          id: "unprepared",
          name: "艰难求生",
          description: "你对即将到来的灾难毫无准备，在灾难中艰难求生",
          conditions: {},
          penalties: {
            exp: -200,
            hp: -80,
            gold: -50
          }
        },
        mu_family_shelter: {
          id: "mu_family_shelter",
          name: "穆家庇护",
          description: "你获得了穆家的信任，在灾难中得到了穆家的庇护",
          conditions: {
            minLevel: 8,
            minReputation: {
              mu_family: 30
            }
          },
          rewards: {
            exp: 300,
            gold: 200,
            reputation: {
              mu_family: 20
            },
            items: [
              {
                itemId: "ice_staff",
                count: 1
              }
            ]
          }
        },
        magic_association_hero: {
          id: "magic_association_hero",
          name: "魔法协会英雄",
          description: "你在灾难中协助魔法协会，成为了协会认可的英雄",
          conditions: {
            minLevel: 11,
            minInfoCount: 9,
            minReputation: {
              magic_association: 20
            }
          },
          rewards: {
            exp: 800,
            gold: 400,
            reputation: {
              magic_association: 30,
              tianlan_school: 20
            },
            items: [
              {
                itemId: "magic_ring",
                count: 1
              }
            ]
          }
        },
        black_church_ally: {
          id: "black_church_ally",
          name: "黑教廷盟友",
          description: "你选择了与黑教廷合作，走上了一条不同的道路...",
          conditions: {
            minLevel: 9,
            minReputation: {
              black_church: 20
            },
            hasFlag: "mu_he_revealed"
          },
          rewards: {
            exp: 600,
            gold: 800,
            reputation: {
              black_church: 30
            },
            items: [
              {
                itemId: "dark_bolt",
                count: 1
              }
            ]
          },
          hidden: true
        }
      }
    }
  },
  infoDatabase: {
    categories: {
      rumor: {
        name: "传闻",
        color: "#aaaaaa",
        icon: "💬"
      },
      clue: {
        name: "线索",
        color: "#88ccff",
        icon: "🔍"
      },
      intel: {
        name: "情报",
        color: "#ffcc66",
        icon: "📋"
      },
      warning: {
        name: "预警",
        color: "#ff6666",
        icon: "⚠️"
      }
    },
    infos: {
      demon_rumor_1: {
        id: "demon_rumor_1",
        title: "山里最近不太平",
        content: "听说最近雪峰山那边不太太平，有猎人说看到了平时少见的妖魔。",
        category: "rumor",
        source: "街谈巷议",
        credibility: 0.3,
        relatedEvent: "event_demon_warning",
        unlockDay: 10
      },
      demon_rumor_2: {
        id: "demon_rumor_2",
        title: "药草涨价了",
        content: "最近治愈药水和药草的价格涨了不少，据说是因为进山采药的人变少了。",
        category: "rumor",
        source: "小卖部老板",
        credibility: 0.5,
        relatedEvent: "event_demon_warning",
        unlockDay: 15
      },
      demon_rumor_3: {
        id: "demon_rumor_3",
        title: "猎魔任务变多了",
        content: "酒馆里的猎魔任务最近多了不少，而且赏金也比以前高了。",
        category: "rumor",
        source: "酒馆传闻",
        credibility: 0.4,
        relatedEvent: "event_demon_warning",
        unlockDay: 20
      },
      demon_clue_1: {
        id: "demon_clue_1",
        title: "幽狼兽下山了",
        content: "有猎人在山脚附近发现了幽狼兽的足迹，这东西以前不会离人类聚居地这么近。",
        category: "clue",
        source: "资深猎人",
        credibility: 0.6,
        relatedEvent: "event_demon_warning",
        unlockDay: 20
      },
      demon_clue_2: {
        id: "demon_clue_2",
        title: "妖魔足迹变多",
        content: "你在雪峰山探索时发现，妖魔的足迹比以前多了很多，而且种类也更丰富了。",
        category: "clue",
        source: "亲身发现",
        credibility: 0.8,
        relatedEvent: "event_demon_warning",
        unlockDay: 15
      },
      demon_intel_1: {
        id: "demon_intel_1",
        title: "莫凡的担忧",
        content: "莫凡说他感觉最近山里的妖魔有点太活跃了，以前幽狼兽一般不会靠近山脚。",
        category: "intel",
        source: "莫凡",
        credibility: 0.7,
        relatedEvent: "event_demon_warning",
        unlockDay: 25
      },
      demon_intel_2: {
        id: "demon_intel_2",
        title: "唐月老师的提醒",
        content: "唐月老师提醒最近尽量不要往山里跑太深，说学校收到了一些关于妖魔异动的报告。",
        category: "intel",
        source: "唐月老师",
        credibility: 0.9,
        relatedEvent: "event_demon_warning",
        unlockDay: 30
      },
      demon_warning_1: {
        id: "demon_warning_1",
        title: "学校安全通知",
        content: "学校贴出了安全通知，要求学生近期不要擅自前往雪峰山深处，注意安全。",
        category: "warning",
        source: "学校公告",
        credibility: 1,
        relatedEvent: "event_demon_warning",
        unlockDay: 35
      },
      mu_ningxue_intro: {
        id: "mu_ningxue_intro",
        title: "穆宁雪是谁",
        content: "穆氏家族的千金，冰系天赋极高，是天澜魔法高中的风云人物，性格高冷。",
        category: "intel",
        source: "莫凡",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 1
      },
      mu_ningxue_past: {
        id: "mu_ningxue_past",
        title: "穆宁雪的过去",
        content: "穆宁雪小时候好像发生过什么事，从那以后她的性格就变得很冷。具体是什么事，没人知道...",
        category: "clue",
        source: "书店老板",
        credibility: 0.4,
        relatedEvent: null,
        unlockDay: 15
      },
      school_info_1: {
        id: "school_info_1",
        title: "入学考核",
        content: "入学考核在9月7日举行，需要达到 3 级才能通过。通过后会有奖励。",
        category: "intel",
        source: "唐月老师",
        credibility: 1,
        relatedEvent: "event_entrance_exam",
        unlockDay: 1
      },
      school_info_2: {
        id: "school_info_2",
        title: "期中测试",
        content: "期中测试在9月15日举行，需要达到 5 级才能通过。奖励比入学考核更丰厚。",
        category: "intel",
        source: "学校公告",
        credibility: 1,
        relatedEvent: "event_midterm_exam",
        unlockDay: 8
      },
      school_info_3: {
        id: "school_info_3",
        title: "期末考核",
        content: "期末考核在9月30日举行，需要达到 8 级才能通过。奖励非常丰厚。",
        category: "intel",
        source: "学校公告",
        credibility: 1,
        relatedEvent: "event_final_exam",
        unlockDay: 20
      },
      black_church_rumor: {
        id: "black_church_rumor",
        title: "黑教廷的传闻",
        content: "据说有一个叫黑教廷的神秘组织，专门做一些邪恶的事情。不过没人知道他们是不是真的存在。",
        category: "rumor",
        source: "街头传闻",
        credibility: 0.2,
        relatedEvent: null,
        unlockDay: 15
      },
      black_church_intel: {
        id: "black_church_intel",
        title: "黑教廷的阴谋",
        content: "黑教廷似乎在策划什么阴谋，他们可能和最近的妖魔异动有关。有人说他们在召唤什么东西...",
        category: "intel",
        source: "神秘人",
        credibility: 0.6,
        relatedEvent: "event_demon_warning",
        unlockDay: 35
      },
      black_church_clue: {
        id: "black_church_clue",
        title: "可疑的黑衣人",
        content: "有人在雪峰山附近看到了一些穿着黑色长袍的可疑人物，他们好像在进行什么仪式。",
        category: "clue",
        source: "神秘人",
        credibility: 0.5,
        relatedEvent: "event_demon_warning",
        unlockDay: 25
      },
      black_church_hierarchy: {
        id: "black_church_hierarchy",
        title: "黑教廷的等级",
        content: "据说黑教廷有严格的等级制度，从低到高分为：教徒、执事、蓝衣执事、灰衣执事、黑衣执事... 每一级都有强大的实力。",
        category: "intel",
        source: "古老的书籍",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 25
      },
      black_church_blue_deacon: {
        id: "black_church_blue_deacon",
        title: "蓝衣执事",
        content: "蓝衣执事是黑教廷的中高层，每一个都有中阶以上的实力。他们通常负责具体的行动计划，非常危险。",
        category: "intel",
        source: "魔法协会档案",
        credibility: 0.85,
        relatedEvent: null,
        unlockDay: 35
      },
      black_church_ritual: {
        id: "black_church_ritual",
        title: "黑教廷的召唤仪式",
        content: "黑教廷似乎在进行某种召唤仪式，他们想从另一个世界召唤强大的妖魔。如果让他们成功，后果不堪设想...",
        category: "warning",
        source: "截获的情报",
        credibility: 0.9,
        relatedEvent: "demon_unrest",
        unlockDay: 40
      },
      mu_he_secret: {
        id: "mu_he_secret",
        title: "穆贺的秘密",
        content: "穆家的执事穆贺，似乎不像表面看起来那么简单。有人说，他和黑教廷有着千丝万缕的联系... 这会是真的吗？",
        category: "clue",
        source: "匿名举报",
        credibility: 0.6,
        relatedEvent: null,
        unlockDay: 35
      },
      black_church_plan: {
        id: "black_church_plan",
        title: "黑教廷的阴谋",
        content: "黑教廷在博城的目的是什么？他们为什么要召唤妖魔？有人说，他们想利用博城灾难来达到某种不可告人的目的...",
        category: "warning",
        source: "推测",
        credibility: 0.75,
        relatedEvent: "demon_unrest",
        unlockDay: 45
      },
      mu_family_intro: {
        id: "mu_family_intro",
        title: "穆氏家族",
        content: "穆氏家族是博城的老牌家族，以冰系魔法闻名，传承了几百年，在博城势力很大。",
        category: "intel",
        source: "穆家庄园",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 10
      },
      mu_family_secret: {
        id: "mu_family_secret",
        title: "穆家的秘密",
        content: "据说穆家内部有些矛盾，旁支和主家之间关系不太好。还有人说穆家藏着什么秘密...",
        category: "clue",
        source: "书店老板",
        credibility: 0.5,
        relatedEvent: null,
        unlockDay: 20
      },
      hunter_guild_intro: {
        id: "hunter_guild_intro",
        title: "猎魔者公会",
        content: "猎魔者公会是一个专门接猎魔任务的组织，会员都是经验丰富的猎人。完成任务可以获得赏金。",
        category: "intel",
        source: "老李",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 5
      },
      hunter_guild_rumor: {
        id: "hunter_guild_rumor",
        title: "猎人失踪了",
        content: "最近有好几个资深猎人进山之后就再也没出来过，公会那边封锁了消息，不知道发生了什么事。",
        category: "rumor",
        source: "酒馆传闻",
        credibility: 0.4,
        relatedEvent: "event_demon_warning",
        unlockDay: 25
      },
      magic_association_intro: {
        id: "magic_association_intro",
        title: "魔法协会",
        content: "魔法协会是管理法师的官方组织，负责考核、登记、发布任务等。加入魔法协会有很多福利。",
        category: "intel",
        source: "周会长",
        credibility: 1,
        relatedEvent: null,
        unlockDay: 10
      },
      magic_association_warning: {
        id: "magic_association_warning",
        title: "魔法协会的警告",
        content: "魔法协会已经注意到了最近的妖魔异动，正在调查中。情况可能比我们想象的要严重。",
        category: "warning",
        source: "周会长",
        credibility: 0.95,
        relatedEvent: "event_demon_warning",
        unlockDay: 35
      },
      mo_fan_intro: {
        id: "mo_fan_intro",
        title: "莫凡是谁",
        content: "莫凡，天生双系（雷+火），虽然出身平凡，但实力进步神速，是学校里的一匹黑马。",
        category: "intel",
        source: "张小侯",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 1
      },
      mo_fan_secret: {
        id: "mo_fan_secret",
        title: "莫凡的秘密",
        content: "莫凡好像藏着很多秘密，他的实力进步速度快得不正常，没人知道他是怎么做到的。",
        category: "clue",
        source: "赵满延",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 10
      },
      tang_yue_intro: {
        id: "tang_yue_intro",
        title: "唐月老师是谁",
        content: "唐月，学校的实习老师，火系法师，温柔美丽，对学生很照顾。据说她的背景不简单。",
        category: "intel",
        source: "学校传闻",
        credibility: 0.8,
        relatedEvent: null,
        unlockDay: 1
      },
      zhao_manyan_intro: {
        id: "zhao_manyan_intro",
        title: "赵满延是谁",
        content: "赵满延，赵氏家族的少爷，光系法师，家境富裕，性格开朗，有点小贪财，但很讲义气。",
        category: "intel",
        source: "学校传闻",
        credibility: 0.85,
        relatedEvent: null,
        unlockDay: 5
      },
      zhang_xiaohou_intro: {
        id: "zhang_xiaohou_intro",
        title: "张小侯是谁",
        content: "张小侯，莫凡的死党，风系法师，性格胆小但非常忠诚，莫凡说什么他都信。",
        category: "intel",
        source: "学校传闻",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 3
      },
      tang_yue_secret: {
        id: "tang_yue_secret",
        title: "唐月的过去",
        content: "唐月老师似乎有不为人知的过去。当你问起她的来历时，她眼神闪烁，说'有些事知道太多没好处'。她似乎在博城执行什么秘密任务。",
        category: "clue",
        source: "唐月",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 5
      },
      tang_yue_roof_secret: {
        id: "tang_yue_roof_secret",
        title: "天台上的密谈",
        content: "你亲眼看到唐月老师在天台用传讯石密谈，说什么'继续监视，不要打草惊蛇'。她的表情和平时判若两人。唐月老师到底是什么人？",
        category: "clue",
        source: "亲眼目睹",
        credibility: 0.95,
        relatedEvent: "event_tang_yue_roof",
        unlockDay: 15
      },
      ye_xinxia_intro: {
        id: "ye_xinxia_intro",
        title: "叶心夏",
        content: "莫凡的义妹，坐在轮椅上，身体不好。莫凡说她'对特殊的能量很敏感'。她似乎没有成功觉醒，但莫凡说她'比我们想象的要厉害'。",
        category: "intel",
        source: "莫凡",
        credibility: 0.8,
        relatedEvent: null,
        unlockDay: 3
      },
      ye_xinxia_condition: {
        id: "ye_xinxia_condition",
        title: "心夏的异常",
        content: "叶心夏虽然坐着轮椅，但莫凡说她能感知到普通人感知不到的东西。她的腿……似乎不是普通的病。",
        category: "clue",
        source: "莫凡",
        credibility: 0.6,
        relatedEvent: null,
        unlockDay: 5
      },
      small_loach_secret: {
        id: "small_loach_secret",
        title: "小泥鳅坠的秘密",
        content: "你脖子上的小泥鳅坠似乎不普通。它在某些时候会微微发热，甚至在你冥想时加速星子的连接。这东西到底是什么？",
        category: "clue",
        source: "亲身感受",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 1
      },
      demon_migration_anomaly: {
        id: "demon_migration_anomaly",
        title: "妖魔异常迁徙",
        content: "你亲眼看到成群的妖魔从深山方向往外逃窜，不是在觅食，而是在逃跑。它们身上有黑色纹路，眼睛血红，充满恐惧。有什么东西在驱赶它们……",
        category: "warning",
        source: "亲眼目睹",
        credibility: 0.95,
        relatedEvent: "event_demon_migration",
        unlockDay: 20
      },
      ancient_cave_runes: {
        id: "ancient_cave_runes",
        title: "雪峰山古代符文",
        content: "你在雪峰山一个隐秘山洞中发现了数百年前的魔法符文。触碰晶石时，你看到了一座地下宫殿和一个被锁链束缚的古老存在。雪峰山下，沉睡着什么？",
        category: "clue",
        source: "亲身探索",
        credibility: 0.9,
        relatedEvent: "event_ancient_cave",
        unlockDay: 20
      },
      mu_he_interest_defense: {
        id: "mu_he_interest_defense",
        title: "穆贺的异常关心",
        content: "穆贺校董对学校的防御阵法表现出异常的兴趣，特别询问了结界节点的位置。他说'会让人检查'，但他的关心似乎过于……刻意了。",
        category: "clue",
        source: "穆贺",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 25
      },
      mu_he_warning: {
        id: "mu_he_warning",
        title: "穆贺的威胁",
        content: "当你提起看到他和灰衣人在一起时，穆贺瞬间变了脸，警告你'不要乱说话，免得惹祸上身'。那一刻的他，和平时那个市侩校董判若两人。",
        category: "warning",
        source: "穆贺",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 30
      },
      mu_he_gray_clothes_meeting: {
        id: "mu_he_gray_clothes_meeting",
        title: "穆贺与灰衣人",
        content: "你偷听到穆贺和一个灰衣人的对话：'结界节点已经摸清了'、'主教大人说了'、'斩空不好对付'。穆贺是叛徒？灰衣人是谁？'主教大人'又是谁？",
        category: "warning",
        source: "偷听",
        credibility: 0.95,
        relatedEvent: "event_mu_he_stranger",
        unlockDay: 30
      },
      zhan_kong_knows_anomaly: {
        id: "zhan_kong_knows_anomaly",
        title: "斩空的沉默",
        content: "斩空承认他也注意到了妖魔的异常，已经上报，但不知道原因。他警告你不要声张，说'有些东西不是你们能应付的'。这个男人，似乎知道得比他说的多。",
        category: "intel",
        source: "斩空",
        credibility: 0.85,
        relatedEvent: null,
        unlockDay: 25
      },
      calm_before_storm: {
        id: "calm_before_storm",
        title: "不安的夜晚",
        content: "灾难前夜，博城异常安静——天空暗红，虫鸣消失，老鼠疯狂逃窜，雪峰山升起黑雾。所有动物都在逃避，但没有人知道即将发生什么。",
        category: "warning",
        source: "亲身感受",
        credibility: 1.0,
        relatedEvent: "event_eve_of_disaster",
        unlockDay: 42
      },
      black_church_symbol: {
        id: "black_church_symbol",
        title: "黑教廷印记",
        content: "灾难后的废墟中，你发现了一个黑色符号——扭曲的眼睛，瞳孔是倒十字。这是黑教廷的标记。这场灾难不是偶然，是黑教廷策划的。",
        category: "warning",
        source: "亲眼发现",
        credibility: 1.0,
        relatedEvent: "event_black_church_mark",
        unlockDay: 45
      },
      ancient_presence_below: {
        id: "ancient_presence_below",
        title: "泉底的古老存在",
        content: "在地圣泉冥想时，你听到了地下极深处的心跳声。一个古老威严的声音直接灌入你的意识：'谁……扰我长眠……'。地圣泉下面，沉睡着一个古老的存在。",
        category: "clue",
        source: "亲身经历",
        credibility: 0.95,
        relatedEvent: "event_earth_spring_depths",
        unlockDay: 40
      },
      yu_ang_orphan: {
        id: "yu_ang_orphan",
        title: "宇昂的出身",
        content: "宇昂是穆卓云的养子，没有亲生父母。他认为'力量才是一切'，血缘毫无意义。他对力量的执着，似乎不仅仅是为了报答穆家。",
        category: "intel",
        source: "宇昂",
        credibility: 0.8,
        relatedEvent: null,
        unlockDay: 10
      },
      yu_ang_seeks_dark_power: {
        id: "yu_ang_seeks_dark_power",
        title: "宇昂的黑暗追求",
        content: "宇昂说他'会获得更强的力量，不是世家给的那种'。他说这话时眼中闪烁着狂热。他似乎在追求某种……不属于正统法师的力量。",
        category: "clue",
        source: "宇昂",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 20
      },
      yu_ang_dark_hint: {
        id: "yu_ang_dark_hint",
        title: "宇昂的黑色气息",
        content: "你注意到宇昂的冰系星子中，似乎夹杂着一丝不属于冰的黑色气息。那是什么？黑教廷的黑暗力量？",
        category: "warning",
        source: "亲眼观察",
        credibility: 0.6,
        relatedEvent: null,
        unlockDay: 25
      },
      yu_ang_disaster_alibi: {
        id: "yu_ang_disaster_alibi",
        title: "宇昂的不在场证明",
        content: "博城灾难时，宇昂说自己在穆家地下室修炼。但你注意到他袖口下的手腕上有一个黑色印记，一闪而逝。那个印记……和废墟上的黑教廷符号很像。",
        category: "warning",
        source: "宇昂",
        credibility: 0.8,
        relatedEvent: null,
        unlockDay: 45
      },
      mu_nujiao_has_nebula_artifact: {
        id: "mu_nujiao_has_nebula_artifact",
        title: "穆奴教与星云魔器",
        content: "穆家似乎拥有一件星云魔器级别的宝物，这在世家之中也是极为罕见的。穆奴教对此事守口如瓶，但隐约透露出这件魔器与穆宁雪有关。",
        category: "intel",
        source: "穆家内部",
        credibility: 0.6,
        relatedEvent: null,
        unlockDay: 10
      },
      black_church_in_mingzhu: {
        id: "black_church_in_mingzhu",
        title: "黑教廷在明珠",
        content: "黑教廷的势力不仅仅在博城。根据线索，他们的触角已经延伸到了明珠学府——那个全国最高魔法学府之中，可能潜伏着黑教廷的人。",
        category: "warning",
        source: "玲玲",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 50
      },
      mu_ningxue_family_pressure: {
        id: "mu_ningxue_family_pressure",
        title: "穆宁雪的家族压力",
        content: "穆宁雪说，从她觉醒冰系的那天起，穆家就告诉她是百年一遇的天才。'天才就必须承受天才该承受的东西。'她的语气平淡得像在说别人的事，但那份沉重是真实的。",
        category: "intel",
        source: "穆宁雪",
        credibility: 0.9,
        relatedEvent: null,
        unlockDay: 10
      },
      mu_ningxue_past_mystery: {
        id: "mu_ningxue_past_mystery",
        title: "穆宁雪的过去",
        content: "穆宁雪对小时候的事讳莫如深。提到时她周身的空气都变冷了，手不自觉地攥紧衣角。她的眼神深处藏着恐惧——那不是普通的恐惧。",
        category: "clue",
        source: "穆宁雪",
        credibility: 0.8,
        relatedEvent: null,
        unlockDay: 15
      },
      mu_ningxue_black_church_trauma: {
        id: "mu_ningxue_black_church_trauma",
        title: "穆宁雪与黑教廷",
        content: "穆宁雪小时候见过黑教廷的标记——倒十字和眼睛。那件事给她留下了深刻的创伤。她只说了'和黑教廷有关'，便不愿再提。黑教廷的魔爪竟然伸向过穆家？",
        category: "warning",
        source: "穆宁雪",
        credibility: 0.95,
        relatedEvent: null,
        unlockDay: 20
      },
      mu_ningxue_innate_spirit_body: {
        id: "mu_ningxue_innate_spirit_body",
        title: "天生灵体",
        content: "穆宁雪拥有'天生灵体'——冰系星子不是被她征服的，而是主动靠近她。她的冰系星尘颜色比普通冰系更深，带着近乎透明的蓝。但她说'天赋只是起点，不修炼天才也会变废物'。",
        category: "intel",
        source: "穆宁雪",
        credibility: 0.95,
        relatedEvent: null,
        unlockDay: 10
      },
      yu_ang_warning_from_mu_bai: {
        id: "yu_ang_warning_from_mu_bai",
        title: "穆白的警告",
        content: "穆白临别时警告你：'离宇昂远点，那个人，不对劲。'作为穆家旁系，穆白似乎知道一些关于宇昂的内情，但他没有多说。宇昂……那个孤儿出身的冰系天才，到底有什么秘密？",
        category: "warning",
        source: "穆白",
        credibility: 0.7,
        relatedEvent: null,
        unlockDay: 50
      },
      yu_ang_black_church_confirmed: {
        id: "yu_ang_black_church_confirmed",
        title: "宇昂的真面目",
        content: "博城灾难之夜，你亲眼目睹宇昂在后山布置黑教廷阵法，并击败了他。他身穿黑色教袍，使用的不是普通冰系魔法，而是夹杂着黑暗力量的黑色冰霜。他临死前说：'黑教廷的计划……才刚刚开始……博城……只是个开始……'宇昂是黑教廷成员，这已经是确凿的事实。",
        category: "warning",
        source: "亲眼目睹",
        credibility: 1.0,
        relatedEvent: "big_event_bocheng_disaster",
        unlockDay: 45
      },
      yu_ang_dark_power_witnessed: {
        id: "yu_ang_dark_power_witnessed",
        title: "宇昂的黑暗力量",
        content: "你试图追击宇昂，但他的力量远超你的想象——那不是普通的冰系魔法，黑色的冰霜中夹杂着某种诡异的黑暗力量。他警告你'今晚什么都没看到'后消失。虽然没有证据，但你确信宇昂和黑教廷有关。",
        category: "warning",
        source: "亲身经历",
        credibility: 0.9,
        relatedEvent: "big_event_bocheng_disaster",
        unlockDay: 45
      },
      yu_ang_zhankong_knew: {
        id: "yu_ang_zhankong_knew",
        title: "斩空的反应",
        content: "你把宇昂的可疑行为报告给了斩空，他的反应耐人寻味——不是惊讶，而是'我知道了'的凝重。他带人去了后山，回来时军装上多了一道被黑色冰霜灼烧的痕迹。斩空似乎早就知道什么，或者说，他一直在等这个证据。",
        category: "clue",
        source: "斩空",
        credibility: 0.85,
        relatedEvent: "big_event_bocheng_disaster",
        unlockDay: 45
      },

      // ========== 明珠篇信息碎片 ==========

      tang_yue_judgment_member: {
        id: "tang_yue_judgment_member",
        title: "唐月的真实身份",
        content: "唐月不是普通的实习老师——她是魔法协会审判会的成员。在博城那几年她是卧底，负责调查黑教廷。她主修火系，次修暗影系，实力远超中阶法师。审判会是魔法协会的最高执法机构，专门缉拿触犯公约的法师。",
        category: "intel",
        source: "唐月",
        credibility: 1.0,
        relatedEvent: "event_tang_yue_reveal",
        unlockDay: 60
      },

      meiyan_spirit_seed: {
        id: "meiyan_spirit_seed",
        title: "玫炎灵种",
        content: "玫炎是地火中相当纯净的火系灵种，遍体嫣红，温度远比普通灵种高，简单粗暴。它在戏水镇水库底部自然形成，导致周围水源干涸。灵种'炎'级比凡种'火'级威力大数倍，炼化后改变法师体质——皮肤有光泽、血液改造、骨骼如铁。",
        category: "intel",
        source: "唐月/亲身经历",
        credibility: 1.0,
        relatedEvent: "event_spirit_seed_meiyan",
        unlockDay: 65
      },

      shadow_element_awakened: {
        id: "shadow_element_awakened",
        title: "暗影系觉醒",
        content: "暗影系是稀有系，觉醒方式与普通系不同——需要在纯粹的阴影环境中进行。暗影系初阶技能'遁影'可以在影子间快速移动，中阶技能'巨影钉'攻击影子本身，无法用魔具防御，是最强的控制技能之一。暗影系法师擅长暗杀和潜入。",
        category: "intel",
        source: "唐月",
        credibility: 1.0,
        relatedEvent: "event_shadow_awakening",
        unlockDay: 70
      },

      mingzhu_tournament_result: {
        id: "mingzhu_tournament_result",
        title: "斗兽大赛",
        content: "明珠学府新生斗兽大赛中，一名召唤系新生以一人一兽斩落150名挑战者，其中包括白家白藏锋。那名新生召唤幽狼兽，更在战斗中暴露了中阶雷系法师的实力——霹雳·轰顶一击震全场。许昭霆认出他是博城出来的莫凡。",
        category: "rumor",
        source: "校园传闻",
        credibility: 0.9,
        relatedEvent: "event_tournament",
        unlockDay: 80
      },

      qingtian_hunter_office: {
        id: "qingtian_hunter_office",
        title: "青天猎所",
        content: "青天猎所是包老头创办的私人猎所，位于魔都。包老头看似普通老头，实则在猎者联盟德高望重。他孙女灵灵年仅12岁却是猎人大师，智商极高，擅长情报分析。猎所接私人委托，酬金比猎者联盟高但更危险。",
        category: "intel",
        source: "包老头",
        credibility: 1.0,
        relatedEvent: "event_qingtian_hunter",
        unlockDay: 90
      },

      parasite_demon_incident: {
        id: "parasite_demon_incident",
        title: "寄生妖魔事件",
        content: "明珠学府发生寄生妖魔事件。鳞皮妖母通过寄生繁殖，被寄生者白天正常夜晚变妖。妖母在体育馆试图血祭数千人突破统领级，被一名中阶法师阻止。赵满延光系在楼下挡住小妖，那名法师独自击杀妖母。事件后学校封锁消息。",
        category: "clue",
        source: "灵灵/亲身经历",
        credibility: 0.95,
        relatedEvent: "event_parasite_demon",
        unlockDay: 100
      },

      three_step_tower_secret: {
        id: "three_step_tower_secret",
        title: "三步塔",
        content: "三步塔是明珠主校区的修炼圣地，由土系和空间系大贤者建造。'一步千丈，两步万里，三步无疆'，塔内元素浓度是外界数十倍，但越往上精神重力越大。中阶法师最多上1-2层，3层可能爆体。三步塔类似地圣泉，是天材地宝级别的修炼资源。",
        category: "intel",
        source: "萧院长",
        credibility: 1.0,
        relatedEvent: "event_three_step_tower",
        unlockDay: 110
      },

      black_church_soul_chain: {
        id: "black_church_soul_chain",
        title: "灵魂锁链",
        content: "黑教廷用'灵魂锁链'控制黑畜妖——那不是妖魔，而是被咒法奴役的活人！诅咒畜妖是强化版，需要强大体魄和充满怨恨的灵魂，保留部分意识。灵魂锁链连帕特农神庙都无法解除。被控制者求死不能，唯一解脱是死亡。",
        category: "warning",
        source: "唐月/许昭霆",
        credibility: 1.0,
        relatedEvent: "event_xu_zhaoting_death",
        unlockDay: 120
      },

      black_church_hierarchy: {
        id: "black_church_hierarchy",
        title: "黑教廷等级",
        content: "黑教廷等级森严：最顶层是撒朗（神听者），下面是神侍者（能直接接触撒朗的高层），再下面是教士（如宇昂），最底层是灰衣人。帕特农神庙12位选女姬被弑，神女缺位，导致灵魂锁链无法解除。许昭霆用命换来的皮革上有神侍者的名字。",
        category: "intel",
        source: "灵灵/许昭霆遗物",
        credibility: 0.95,
        relatedEvent: "event_xu_zhaoting_death",
        unlockDay: 125
      },

      yu_ang_final_death: {
        id: "yu_ang_final_death",
        title: "宇昂之死",
        content: "宇昂——博城灾难的黑教廷教士，在主校区考核大混战中被击杀。他半张脸被烧毁，饲养黑畜妖，用灵魂锁链控制许昭霆。击杀者用三系中阶魔法（雷火暗影）联手，霹雳·夜叉分裂五道闪电，巨影钉控制影子，玫炎·烈拳·轰天终结。宇昂临死前提到撒朗会报仇。",
        category: "intel",
        source: "亲身经历",
        credibility: 1.0,
        relatedEvent: "event_yu_ang_final",
        unlockDay: 130
      },

      bocheng_disaster_truth: {
        id: "bocheng_disaster_truth",
        title: "博城灾难真相",
        content: "博城灾难不是天灾——黑教廷用妖母引动雪峰山妖魔潮，策划了十余年。撒朗亲自出手，唐月当时负责牵制她。翼苍王只是棋子，真正的目标是地圣泉下的古老存在。博城只是黑教廷计划的第一步。",
        category: "warning",
        source: "许昭霆/唐月",
        credibility: 0.95,
        relatedEvent: "event_tang_yue_reveal",
        unlockDay: 60
      }
    }
  },
  factions: {
    tianlan_school: {
      id: "tianlan_school",
      name: "天澜魔法高中",
      description: "博城最好的公立魔法高中，培养了无数优秀的法师。",
      color: "#66aaff",
      icon: "🏫",
      reputationEffects: {
        friendly: {
          shopDiscount: 0.95
        },
        respected: {
          shopDiscount: 0.9
        },
        worship: {
          shopDiscount: 0.8
        }
      }
    },
    mu_family: {
      id: "mu_family",
      name: "穆氏家族",
      description: "博城的名门望族，势力庞大，掌握着大量的资源。",
      color: "#aaccff",
      icon: "🏛️",
      reputationEffects: {
        friendly: {
          shopDiscount: 0.95
        },
        respected: {
          shopDiscount: 0.85
        },
        worship: {
          shopDiscount: 0.75
        }
      }
    },
    hunter_guild: {
      id: "hunter_guild",
      name: "猎魔者公会",
      description: "专门接取猎魔任务的组织，成员都是经验丰富的法师。",
      color: "#ffaa66",
      icon: "⚔️",
      reputationEffects: {
        friendly: {
          questRewardBonus: 1.1
        },
        respected: {
          questRewardBonus: 1.2
        },
        worship: {
          questRewardBonus: 1.3
        }
      }
    },
    magic_association: {
      id: "magic_association",
      name: "魔法协会",
      description: "官方的魔法管理机构，负责法师注册、考核和纠纷调解。",
      color: "#ffdd66",
      icon: "🏛️",
      reputationEffects: {
        friendly: {
          examBonus: 1.05
        },
        respected: {
          examBonus: 1.1
        },
        worship: {
          examBonus: 1.15
        }
      }
    },
    black_church: {
      id: "black_church",
      name: "黑教廷",
      description: "神秘的邪恶组织，行事诡秘，为世人所不容。",
      color: "#663366",
      icon: "☠️",
      reputationEffects: {
        friendly: {
          illegalAccess: true
        },
        respected: {
          illegalAccess: true,
          forbiddenSpells: true
        },
        worship: {
          illegalAccess: true,
          forbiddenSpells: true,
          black_market: true
        }
      }
    }
  }
};

export default DataWorld;
