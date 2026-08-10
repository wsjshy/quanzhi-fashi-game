/**
 * 势力、情报、世界观设定等
 * 从 game-data.js 拆分而来
 */

const DataWorld = {
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
        content: "入学考核在第 7 天举行，需要达到 3 级才能通过。通过后会有奖励。",
        category: "intel",
        source: "唐月老师",
        credibility: 1,
        relatedEvent: "event_entrance_exam",
        unlockDay: 1
      },
      school_info_2: {
        id: "school_info_2",
        title: "期中测试",
        content: "期中测试在第 15 天举行，需要达到 5 级才能通过。奖励比入学考核更丰厚。",
        category: "intel",
        source: "学校公告",
        credibility: 1,
        relatedEvent: "event_midterm_exam",
        unlockDay: 8
      },
      school_info_3: {
        id: "school_info_3",
        title: "期末考核",
        content: "期末考核在第 30 天举行，需要达到 8 级才能通过。奖励非常丰厚。",
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
