/**
 * 大地图数据
 * v0.73.0: 地图分层系统 - 大地图包含多个小场景
 * 核心设计原则：一个大地图 = 一个完整剧情周期
 * 基于小说《全职法师》剧情设定
 */

const DataMaps = {
  bo_city: {
    id: "bo_city",
    name: "博城",
    storyArc: "博城篇",
    description: "南方的魔法城市，主角学习和生活的地方。博城历史悠久，魔法氛围浓厚，是博城篇剧情的主要舞台。",
    icon: "🏙️",
    connectedTo: ["xuefeng_mountain"],
    unlocked: true,
    // 剧情阶段：每个阶段有不同的大本营、解锁地点、禁用行动
    phases: {
      pre_disaster: {
        name: "灾难前",
        baseCamp: "tianlan_school",
        unlockedLocations: [
          "tianlan_school", "city_street", "three_step_tower",
          "mu_manor", "mo_fan_house", "earth_spring",
          "hunter_alliance", "tavern", "mingwen_girls_school",
          "xuefeng_mountain", "xuefeng_deep", "xuefeng_station", "baicao_valley"
        ],
        disabledActions: []
      },
      during_disaster: {
        name: "灾难中",
        baseCamp: "tianlan_school",
        unlockedLocations: [
          "tianlan_school", "city_street", "bo_north_gate",
          "old_banyan_district", "xuefeng_mountain"
        ],
        disabledActions: ["study"] // 灾难中停课
      },
      post_disaster: {
        name: "灾后",
        baseCamp: "temporary_shelter", // 待实现
        unlockedLocations: [
          "tianlan_school", "city_street", "bo_north_gate",
          "old_banyan_district"
        ],
        disabledActions: ["study", "train"] // 灾后学校功能变化
      }
    },
    // 所有可能的小场景（含各阶段）
    allLocations: [
      "tianlan_school", "city_street", "three_step_tower",
      "mu_manor", "mo_fan_house", "earth_spring",
      "hunter_alliance", "tavern", "mingwen_girls_school",
      "old_banyan_district", "bo_north_gate", "duel_arena",
      "xuefeng_mountain", "xuefeng_deep", "xuefeng_station", "baicao_valley"
    ]
  }
};

// 如果是模块环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataMaps;
}
