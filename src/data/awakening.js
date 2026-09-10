/**
 * 觉醒系统数据
 * v3.15.0 觉醒系统重构
 * 核心设计：雷系稀缺但可追求，设定贴合度分级
 */

export const DataAwakening = {
  // 基础觉醒概率
  baseProbabilities: {
    fire: 0.15,
    ice: 0.15,
    earth: 0.15,
    wind: 0.15,
    water: 0.15,
    light: 0.10,
    thunder: 0.03  // 小说千分之一，调整为3%基础，保持稀缺感但可追求
  },

  // 概率提升条件
  probabilityBoosts: {
    thunder: [
      {
        id: "tang_yue_guidance",
        name: "唐月指导",
        boost: 0.05,
        condition: "questComplete:quest_thunder_guidance",
        description: "完成唐月老师的雷系感悟任务"
      },
      {
        id: "thunder_stone",
        name: "雷系觉醒石",
        boost: 0.10,
        condition: "hasItem:item_thunder_stone",
        description: "使用稀有道具雷系觉醒石"
      },
      {
        id: "thunder_storm",
        name: "雷暴夜觉醒",
        boost: 0.07,
        condition: "event:active_thunder_storm",
        description: "在雷暴夜特殊事件中觉醒"
      },
      {
        id: "mo_fan_guidance",
        name: "莫凡指导",
        boost: 0.03,
        condition: "npcOpinion:mo_fan>=50",
        description: "莫凡好感达到50，获得雷系指导"
      }
    ]
  },

  // 系别信息
  elements: {
    fire: {
      name: "火系",
      rarity: "common",
      rarityLabel: "普通",
      description: "爆发力强，攻击力高，适合正面战斗",
      color: "#ff6633"
    },
    ice: {
      name: "冰系",
      rarity: "common",
      rarityLabel: "普通",
      description: "控制能力强，可冻结敌人，适合战术战斗",
      color: "#66ccff"
    },
    earth: {
      name: "土系",
      rarity: "common",
      rarityLabel: "普通",
      description: "防御能力强，可改变地形，适合防御战斗",
      color: "#cc9966"
    },
    wind: {
      name: "风系",
      rarity: "common",
      rarityLabel: "普通",
      description: "速度快，可短距瞬移，适合灵活战斗",
      color: "#99ff99"
    },
    water: {
      name: "水系",
      rarity: "common",
      rarityLabel: "普通",
      description: "防御治疗兼备，适应性强，适合持续战斗",
      color: "#6699ff"
    },
    light: {
      name: "光系",
      rarity: "uncommon",
      rarityLabel: "较少",
      description: "辅助能力强，可致盲/信号，适合团队战斗",
      color: "#ffffcc"
    },
    thunder: {
      name: "雷系",
      rarity: "rare",
      rarityLabel: "稀有",
      description: "稀缺系别，攻击力极高，附带麻痹效果",
      color: "#ffcc00"
    }
  },

  // 重新觉醒配置
  reAwakening: {
    maxTimes: 3,
    mentalCost: 10
  },

  // NPC反应（根据系别不同）
  npcReactions: {
    thunder: {
      mu_bai: { text: "什么？雷系？！……哼，运气好而已。", mood: "shocked_then_jealous" },
      mo_fan: { text: "哇！雷系！你运气太好了！……（会心一笑）", mood: "excited_then_understanding" },
      tang_yue: { text: "雷系……千分之一的概率。看来你很有天赋，要好好珍惜。", mood: "complex_then_serious" },
      other: { text: "雷系？！今年唯一一个雷系！", mood: "surprised" }
    },
    light: {
      mu_bai: { text: "光系？少见。", mood: "surprised" },
      mo_fan: { text: "光系！辅助能力很强的！", mood: "excited" },
      tang_yue: { text: "光系稀少，要珍惜你的天赋。", mood: "serious" },
      other: { text: "光系？很少见啊。", mood: "surprised" }
    },
    default: {
      mu_bai: { text: "哼，常见系而已，没什么了不起。", mood: "arrogant" },
      mo_fan: { text: "不错嘛，这个系爆发力很强！", mood: "encouraging" },
      tang_yue: { text: "这个系很常见，但修炼好了一样很强。", mood: "guiding" },
      other: { text: "觉醒了啊，恭喜。", mood: "normal" }
    }
  },

  // 设定贴合度分级（本次调整记录）
  canonAdjustments: [
    {
      setting: "雷系觉醒概率",
      novel: "千分之一（0.1%）",
      game: "基础3%，条件提升最高28%",
      reason: "0.1%玩家完全无法体验，雷系是小说核心系别（莫凡就是雷系），玩家应该有机会体验",
      canonPreservation: "仍然稀缺（平均33次尝试），有条件提升机制，保持追求感和稀缺感"
    },
    {
      setting: "重新觉醒机制",
      novel: "小说无此设定",
      game: "最多3次，每次消耗精神力10",
      reason: "给玩家追求稀有系别的机会，增加觉醒仪式的策略性",
      canonPreservation: "有限制（3次/消耗精神力），不是无限刷，保持稀缺感"
    }
  ]
};
