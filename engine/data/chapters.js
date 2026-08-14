/**
 * 章节数据
 * 按小说卷→章组织，数据驱动
 * 后续拆小说只需在此添加章节数据
 */

const DataChapters = {

  // ========== 卷一：博城篇（小说1-120章）==========

  chapter_01_awakening: {
    id: "chapter_01_awakening",
    name: "第一章·觉醒",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [1, 5],
    description: "魔法高考，觉醒魔法，小泥鳅坠",

    startConditions: { gameStart: true },
    completeConditions: {
      requiredFlags: ["awakening_ceremony_done"]
    },

    mainQuestChain: ["quest_awakening_ceremony"],
    sideQuests: [],

    keyNPCs: ["tang_yue"],

    unlocks: {
      locations: ["tianlan_school"],
      systems: ["basic_combat", "cultivation", "status_panel"],
      features: ["dialogue"]
    },

    rewards: {
      exp: 50,
      gold: 50
    },

    nextChapter: "chapter_02_school_life",
    tags: ["tutorial", "awakening"]
  },

  chapter_02_school_life: {
    id: "chapter_02_school_life",
    name: "第二章·天澜魔法高中",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [6, 20],
    description: "入学修炼，唐月指导，星子连接，校园生活",

    startConditions: { previousChapterCompleted: "chapter_01_awakening" },
    completeConditions: {
      allQuestsCompleted: ["quest_intro"]
    },

    mainQuestChain: ["quest_intro"],
    sideQuests: ["quest_cafeteria_lunch", "quest_magic_theory_class"],

    keyNPCs: ["tang_yue", "zhang_xiaohou", "mu_ningxue"],

    unlocks: {
      locations: ["xiaofengshan", "school_dorm"],
      systems: ["skills", "inventory", "shop"],
      features: ["gift_giving"]
    },

    rewards: {
      exp: 100,
      gold: 100,
      items: [{ itemId: "health_potion", count: 3 }]
    },

    nextChapter: "chapter_03_xuefengshan",
    tags: ["tutorial", "school"]
  },

  chapter_03_xuefengshan: {
    id: "chapter_03_xuefengshan",
    name: "第三章·雪峰山历练",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [21, 40],
    description: "雪峰山实践，幽狼兽，第一次实战，罗宋冲突",

    startConditions: { previousChapterCompleted: "chapter_02_school_life" },
    completeConditions: {
      allQuestsCompleted: ["quest_collect_herbs", "quest_hunt_demon"]
    },

    mainQuestChain: ["quest_collect_herbs", "quest_hunt_demon"],
    sideQuests: ["quest_hunt_wolf_pack", "quest_explore_mountain", "quest_collect_more_herbs"],

    keyNPCs: ["tang_yue", "mo_fan", "luo_song"],

    unlocks: {
      locations: ["xuefeng_mountain", "xuefeng_peak"],
      systems: ["wild_battle", "loot", "hunter_guild"],
      features: ["difficulty_select"]
    },

    rewards: {
      exp: 200,
      gold: 200,
      items: [{ itemId: "mana_potion", count: 3 }]
    },

    nextChapter: "chapter_04_shadows",
    tags: ["combat", "wild"]
  },

  chapter_04_shadows: {
    id: "chapter_04_shadows",
    name: "第四章·博城暗流",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [41, 60],
    description: "黑教廷线索，穆氏家族，宇昂，朝赫，炼兽之血",

    startConditions: { previousChapterCompleted: "chapter_03_xuefengshan" },
    completeConditions: {
      allQuestsCompleted: ["quest_mu_bai_challenge", "quest_black_church_clues"]
    },

    mainQuestChain: ["quest_mu_bai_challenge", "quest_investigate_suspicious", "quest_black_church_clues"],
    sideQuests: ["quest_mu_family_test", "quest_magic_association_trial"],

    keyNPCs: ["yu_ang", "mu_ningxue", "mu_bai", "chao_he"],

    unlocks: {
      locations: ["mu_family_house", "old_district"],
      systems: ["reputation", "npc_opinion"],
      features: ["rival_system"]
    },

    rewards: {
      exp: 300,
      gold: 300,
      reputation: { tianlan_school: 10 }
    },

    nextChapter: "chapter_05_disaster",
    tags: ["investigation", "rival"]
  },

  chapter_05_disaster: {
    id: "chapter_05_disaster",
    name: "第五章·博城灾难",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [61, 85],
    description: "黑教廷发动，妖魔攻城，大逃亡，唐月受伤",

    startConditions: { previousChapterCompleted: "chapter_04_shadows" },
    completeConditions: {
      requiredFlags: ["bocheng_disaster_survived"]
    },

    mainQuestChain: ["quest_stop_ritual"],
    sideQuests: ["quest_guard_district", "quest_one_eye_wolf", "quest_old_district"],

    keyNPCs: ["tang_yue", "mo_fan", "zhang_xiaohou", "yu_ang"],

    unlocks: {
      locations: ["bocheng_ruins"],
      systems: ["big_event", "branching_choice"],
      features: ["multi_ending"]
    },

    bigEvent: "big_event_bocheng_disaster",

    rewards: {
      exp: 500,
      gold: 500,
      items: [{ itemId: "health_potion", count: 5 }],
      reputation: { tianlan_school: 30, military: 20 }
    },

    nextChapter: "chapter_06_earth_spring",
    tags: ["disaster", "boss_battle", "branching"]
  },

  chapter_06_earth_spring: {
    id: "chapter_06_earth_spring",
    name: "第六章·地圣泉",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [86, 100],
    description: "地圣泉修炼，小泥鳅进阶，灵种获得",

    startConditions: { previousChapterCompleted: "chapter_05_disaster" },
    completeConditions: {
      allQuestsCompleted: ["quest_earth_spring"],
      minLevel: 10
    },

    mainQuestChain: ["quest_earth_spring", "quest_earth_spring_investigation"],
    sideQuests: ["quest_training_camp", "quest_equipment_prep"],

    keyNPCs: ["mo_fan", "tang_yue"],

    unlocks: {
      locations: ["earth_spring_cave"],
      systems: ["spirit_seed", "soul_essence", "realm_breakthrough"],
      features: ["upgrade_pendant"]
    },

    rewards: {
      exp: 400,
      gold: 400,
      items: [{ itemId: "mana_potion", count: 5 }]
    },

    nextChapter: "chapter_07_departure",
    tags: ["power_up", "spirit_seed"]
  },

  chapter_07_departure: {
    id: "chapter_07_departure",
    name: "第七章·离开博城",
    volume: "vol1_bocheng",
    volumeName: "博城篇",
    novelChapters: [101, 120],
    description: "灾后重建，前往明珠学府，新的开始",

    startConditions: { previousChapterCompleted: "chapter_06_earth_spring" },
    completeConditions: {
      allQuestsCompleted: ["quest_second_element"],
      requiredFlags: ["arrived_mingzhu"]
    },

    mainQuestChain: ["quest_second_element", "quest_journey_to_mingzhu"],
    sideQuests: ["quest_library_volunteer", "quest_class_exam"],

    keyNPCs: ["mo_fan", "zhang_xiaohou", "tang_yue"],

    unlocks: {
      locations: ["mingzhu_qing_campus", "qingtian_hunter_office"],
      systems: ["second_element", "map_travel"],
      features: ["campus_life"]
    },

    rewards: {
      exp: 500,
      gold: 1000,
      items: [{ itemId: "health_potion", count: 5 }, { itemId: "mana_potion", count: 5 }]
    },

    nextChapter: "chapter_08_mingzhu",
    tags: ["transition", "new_beginning"]
  },

  // ========== 卷二：明珠篇（小说121-230章）==========

  chapter_08_mingzhu: {
    id: "chapter_08_mingzhu",
    name: "第八章·明珠学府",
    volume: "vol2_mingzhu",
    volumeName: "明珠篇",
    novelChapters: [121, 160],
    description: "入学，新生大赛，白藏锋，赵满延，牧奴娇",

    startConditions: { previousChapterCompleted: "chapter_07_departure" },
    completeConditions: {
      allQuestsCompleted: ["quest_school_competition"]
    },

    mainQuestChain: ["quest_school_competition"],
    sideQuests: ["quest_zhao_manyan_request", "quest_zhang_xiaohou_favor", "quest_magic_practice"],

    keyNPCs: ["bai_cangfeng", "zhao_manyan", "mu_nujiao", "ai_tutu"],

    unlocks: {
      locations: ["mingzhu_main_campus", "dormitory"],
      systems: ["duel", "npc_growth"],
      features: ["tournament"]
    },

    rewards: {
      exp: 800,
      gold: 800,
      reputation: { mingzhu_school: 20 }
    },

    nextChapter: "chapter_09_hunter",
    tags: ["tournament", "new_friends"]
  },

  chapter_09_hunter: {
    id: "chapter_09_hunter",
    name: "第九章·猎人与情报",
    volume: "vol2_mingzhu",
    volumeName: "明珠篇",
    novelChapters: [161, 200],
    description: "灵灵，猎人联盟，西明，精魄，亡魂器皿",

    startConditions: { previousChapterCompleted: "chapter_08_mingzhu" },
    completeConditions: {
      allQuestsCompleted: ["quest_hunter_guild_recruit"]
    },

    mainQuestChain: ["quest_hunter_guild_recruit", "quest_hunter_novice"],
    sideQuests: ["quest_hunter_daily_wolf", "quest_hunter_elite", "quest_city_hunter"],

    keyNPCs: ["lingling", "xi_ming", "bao_laotou"],

    unlocks: {
      locations: ["hunter_guild", "ancient_capital"],
      systems: ["soul_collection", "intel_system"],
      features: ["bounty_board"]
    },

    rewards: {
      exp: 1000,
      gold: 1000,
      reputation: { hunter_guild: 20 }
    },

    nextChapter: "chapter_10_exam",
    tags: ["hunter", "intel"]
  },

  chapter_10_exam: {
    id: "chapter_10_exam",
    name: "第十章·主校区考核",
    volume: "vol2_mingzhu",
    volumeName: "明珠篇",
    novelChapters: [201, 230],
    description: "艾图图/牧奴娇，三步塔，暗影妖兽，许昭霆之死，大混战，宇昂",

    startConditions: { previousChapterCompleted: "chapter_09_hunter" },
    completeConditions: {
      allQuestsCompleted: ["quest_yu_ang_final"]
    },

    mainQuestChain: [
      "quest_mingzhu_exam_notice",
      "quest_mingzhu_partner",
      "quest_catch_shadow_beast",
      "quest_black_church_encounter",
      "quest_xu_zhaoting_farewell",
      "quest_da_hun_zhan",
      "quest_yu_ang_final"
    ],
    sideQuests: ["quest_mingwen_investigation", "quest_hunt_giant_rat"],

    keyNPCs: ["ai_tutu", "mu_nujiao", "xu_zhaoting", "yu_ang", "lingling"],

    unlocks: {
      locations: ["mingzhu_main_campus", "three_step_tower", "iron_cage"],
      systems: ["three_step_tower", "capture", "spirit_seed_upgrade"],
      features: ["multi_stage_boss"]
    },

    rewards: {
      exp: 5000,
      gold: 5000,
      reputation: { mingzhu_school: 50, hunter_guild: 50 }
    },

    nextChapter: null, // 后续章节待小说拆解
    tags: ["exam", "revenge", "black_church", "emotional"]
  }
};
