/**
 * 阴谋调查线索数据
 * v1.8.1 阴谋调查系统
 * 博城灾难前的黑教廷阴谋线索收集
 */

const DataClues = {

  // ========== 妖魔异常类 ==========
  clue_demon_migration: {
    id: "clue_demon_migration",
    name: "妖魔异常迁徙",
    type: "demon",
    description: "雪峰山的妖魔似乎在向博城方向移动，行为异常躁动，不像正常的领地扩张。",
    progress: 10,
    source: "探索雪峰山深处"
  },

  clue_demon_agitation: {
    id: "clue_demon_agitation",
    name: "妖魔躁动不安",
    type: "demon",
    description: "城市边缘的妖魔比平时更加凶猛，似乎受到了某种刺激，失去了理智。",
    progress: 10,
    source: "城市边缘猎妖任务"
  },

  clue_demon_gathering: {
    id: "clue_demon_gathering",
    name: "妖魔聚集迹象",
    type: "demon",
    description: "老街区附近发现多个不同种类的妖魔聚集，这种跨种族聚集非常反常。",
    progress: 15,
    source: "老街区探索"
  },

  clue_demon_night_activity: {
    id: "clue_demon_night_activity",
    name: "夜间妖魔活跃",
    type: "demon",
    description: "夜间城市周围的妖魔活动频率大幅增加，巡逻队报告了多起异常遭遇。",
    progress: 10,
    source: "夜间探索/校园巡逻任务"
  },

  clue_demon_direction: {
    id: "clue_demon_direction",
    name: "妖魔移动方向",
    type: "demon",
    description: "追踪发现，所有异常的妖魔都在向博城市中心方向移动，仿佛在被什么东西吸引。",
    progress: 15,
    source: "深入调查猎妖任务"
  },

  // ========== 黑教廷踪迹类 ==========
  clue_black_church_ritual: {
    id: "clue_black_church_ritual",
    name: "可疑仪式痕迹",
    type: "black_church",
    description: "在废弃仓库发现了奇怪的仪式痕迹，地面上有不知名的符文，空气中弥漫着诡异的气息。",
    progress: 15,
    source: "仓库探索/黑教廷据点任务"
  },

  clue_black_church_stranger: {
    id: "clue_black_church_stranger",
    name: "神秘陌生人",
    type: "black_church",
    description: "集市上有人看到身穿黑袍的陌生人在四处打探，询问关于地圣泉和城防的事情。",
    progress: 10,
    source: "集市探索/NPC对话"
  },

  clue_black_church_potion: {
    id: "clue_black_church_potion",
    name: "异常药水",
    type: "black_church",
    description: "从黑教廷成员身上搜到一瓶诡异的药水，散发着令人不安的气息，似乎能激化妖魔的野性。",
    progress: 20,
    source: "黑教廷据点任务奖励"
  },

  clue_black_church_communication: {
    id: "clue_black_church_communication",
    name: "密信往来",
    type: "black_church",
    description: "截获了一封密信，内容使用了密码，但能看出与博城有关，提到了'时机'和'泉'。",
    progress: 15,
    source: "调查任务/NPC对话"
  },

  clue_black_church_underground: {
    id: "clue_black_church_underground",
    name: "地下通道",
    type: "black_church",
    description: "在城市下水道发现了一条被人为拓宽的地下通道，通向城市内部，似乎是黑教廷的秘密路线。",
    progress: 15,
    source: "下水道探索任务"
  },

  // v1.9.1: 暴躁之泉相关线索
  clue_violent_spring_trace: {
    id: "clue_violent_spring_trace",
    name: "暴躁之泉踪迹",
    type: "black_church",
    description: "在雪峰山发现了一种诡异的液体痕迹，散发着令人不安的气息，与地圣泉的灵气相似但性质截然相反——它能激化妖魔的野性，让它们失去理智。",
    progress: 20,
    source: "雪峰山探索/追踪黑教廷踪迹任务"
  },

  clue_rain_catalyst: {
    id: "clue_rain_catalyst",
    name: "雨水催化剂",
    type: "black_church",
    description: "综合多条线索推断：黑教廷将暴躁之泉洒在博城上空的云层中，一旦下大雨，暴躁之泉会随着雨水降下，成为激化妖魔疯狂进攻的催化剂。",
    progress: 25,
    source: "收集3条黑教廷踪迹线索后自动解锁/唐月对话分享"
  },

  // ========== 宇昂疑点类 ==========
  clue_yuang_training: {
    id: "clue_yuang_training",
    name: "宇昂的异常修炼",
    type: "yu_ang",
    description: "宇昂最近总是深夜外出修炼，而且修炼的地点很偏僻，有人看到他在废弃区与陌生人接触。",
    progress: 15,
    source: "与穆氏NPC对话/观察宇昂"
  },

  clue_yuang_origin: {
    id: "clue_yuang_origin",
    name: "宇昂的身世",
    type: "yu_ang",
    description: "穆卓云的养子宇昂，来历不明，据说穆卓云是在一次外出中捡到他的，但细节从未公开。",
    progress: 10,
    source: "与穆氏NPC对话"
  },

  clue_yuang_behavior: {
    id: "clue_yuang_behavior",
    name: "宇昂的可疑行为",
    type: "yu_ang",
    description: "决斗中宇昂使用了地波履魔具，这种魔具通常用于快速移动和秘密行动，不像是学生该有的装备。",
    progress: 15,
    source: "观看/参与宇昂决斗"
  },

  // ========== 地圣泉秘密类 ==========
  clue_spring_value: {
    id: "clue_spring_value",
    name: "地圣泉的价值",
    type: "earth_spring",
    description: "地圣泉是博城的至宝，能大幅提升法师的修炼速度，据说对高阶法师也有极大益处。",
    progress: 10,
    source: "唐月对话/地圣泉相关任务"
  },

  clue_spring_guard: {
    id: "clue_spring_guard",
    name: "地圣泉守卫",
    type: "earth_spring",
    description: "地圣泉由军部副卫长林雨欣亲自保管，守卫森严，但最近守卫似乎有调动，原因不明。",
    progress: 15,
    source: "林雨欣对话/地圣泉任务"
  },

  clue_spring_target: {
    id: "clue_spring_target",
    name: "地圣泉是目标",
    type: "earth_spring",
    description: "综合所有线索，黑教廷的真正目标很可能是地圣泉，他们在策划一场大规模行动来夺取它。",
    progress: 20,
    source: "收集足够线索后自动解锁"
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataClues;
}
