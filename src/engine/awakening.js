/**
 * 觉醒系统引擎
 * v3.15.0 觉醒系统重构
 * 核心功能：概率计算/觉醒执行/重新觉醒/接受觉醒
 */

import { DataAwakening } from '../data/awakening.js';

export const AwakeningSystem = {
  // 计算最终觉醒概率
  calculateProbabilities(player) {
    const probs = { ...DataAwakening.baseProbabilities };

    // 应用概率提升条件
    for (const [element, boosts] of Object.entries(DataAwakening.probabilityBoosts)) {
      for (const boost of boosts) {
        if (this.checkCondition(boost.condition, player)) {
          probs[element] += boost.boost;
        }
      }
    }

    return probs;
  },

  // 检查条件
  checkCondition(condition, player) {
    if (!condition) return false;

    // 解析条件格式："type:value"
    const [type, value] = condition.split(':');

    switch (type) {
      case 'questComplete':
        return player.completedQuests?.includes(value) ||
               player.flags?.[`quest_${value}_completed`];
      case 'hasItem':
        return player.inventory?.some(item => item.id === value || item.itemId === value);
      case 'event':
        return player.activeEvents?.includes(value) ||
               player.flags?.[value];
      case 'npcOpinion':
        // 格式：npcId>=50
        const [npcId, opStr] = value.split('>=');
        const opinion = player.npcRelations?.[npcId]?.opinion ||
                        player.relationships?.[npcId]?.opinion || 0;
        return opinion >= parseInt(opStr);
      default:
        return false;
    }
  },

  // 获取已满足的条件列表（用于UI显示）
  getSatisfiedBoosts(player, element) {
    const boosts = DataAwakening.probabilityBoosts[element] || [];
    return boosts.filter(boost => this.checkCondition(boost.condition, player));
  },

  // 执行觉醒
  performAwakening(player) {
    const probs = this.calculateProbabilities(player);
    const total = Object.values(probs).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    for (const [element, prob] of Object.entries(probs)) {
      random -= prob;
      if (random <= 0) {
        return element;
      }
    }

    return 'fire'; // 默认
  },

  // 重新觉醒
  reAwaken(player) {
    const config = DataAwakening.reAwakening;

    // 初始化觉醒状态（如果还没有）
    if (!player.awakening) {
      player.awakening = {
        awakened: false,
        element: null,
        reAwakeningTimes: 0,
        awakeningHistory: []
      };
    }

    // 检查次数限制
    if (player.awakening.reAwakeningTimes >= config.maxTimes) {
      return {
        success: false,
        message: `最多只能重新觉醒${config.maxTimes}次，你必须接受当前的系别`
      };
    }

    // 检查精神力
    const mentalPower = player.mentalPower || player.spirit || 100;
    if (mentalPower < config.mentalCost) {
      return {
        success: false,
        message: `精神力不足，需要${config.mentalCost}点，当前${mentalPower}点`
      };
    }

    // 消耗精神力
    if (player.mentalPower !== undefined) {
      player.mentalPower -= config.mentalCost;
    } else if (player.spirit !== undefined) {
      player.spirit -= config.mentalCost;
    }

    // 增加重新觉醒次数
    player.awakening.reAwakeningTimes++;

    // 执行新的觉醒
    const newElement = this.performAwakening(player);
    player.awakening.element = newElement;
    player.awakening.awakeningHistory.push(newElement);

    return {
      success: true,
      element: newElement,
      elementInfo: DataAwakening.elements[newElement],
      remainingTimes: config.maxTimes - player.awakening.reAwakeningTimes
    };
  },

  // 接受觉醒
  acceptAwakening(player, element) {
    // 初始化觉醒状态
    if (!player.awakening) {
      player.awakening = {
        awakened: false,
        element: null,
        reAwakeningTimes: 0,
        awakeningHistory: []
      };
    }

    player.awakening.awakened = true;
    player.awakening.element = element;

    // 设置玩家元素
    if (!player.elements) {
      player.elements = [];
    }
    if (!player.elements.includes(element)) {
      player.elements.push(element);
    }
    player.element = element;

    // 初始化该系基础技能（如果有技能系统）
    // 具体技能初始化由技能系统处理

    return {
      success: true,
      element: element,
      elementInfo: DataAwakening.elements[element]
    };
  },

  // 获取NPC反应
  getNpcReactions(element) {
    const reactions = DataAwakening.npcReactions[element] ||
                      DataAwakening.npcReactions.default;
    return reactions;
  },

  // 获取系别信息
  getElementInfo(element) {
    return DataAwakening.elements[element];
  },

  // 获取重新觉醒配置
  getReAwakeningConfig() {
    return DataAwakening.reAwakening;
  },

  // 获取设定调整记录
  getCanonAdjustments() {
    return DataAwakening.canonAdjustments;
  },

  // 重置觉醒状态（用于测试）
  resetAwakening(player) {
    player.awakening = {
      awakened: false,
      element: null,
      reAwakeningTimes: 0,
      awakeningHistory: []
    };
  }
};
