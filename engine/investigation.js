/**
 * 阴谋调查系统
 * v1.8.1
 * 管理博城灾难前的线索收集和调查进度
 */

const InvestigationSystem = {

  // 线索类型配置
  CLUE_TYPES: {
    demon: { name: '妖魔异常', icon: '👹', color: '#ff6666' },
    black_church: { name: '黑教廷踪迹', icon: '⚫', color: '#9966ff' },
    yu_ang: { name: '宇昂疑点', icon: '❄️', color: '#66ccff' },
    earth_spring: { name: '地圣泉秘密', icon: '💧', color: '#66ffcc' }
  },

  // 调查等级配置
  INVESTIGATION_LEVELS: [
    { min: 0, max: 25, name: '一无所知', desc: '你对即将到来的危机毫无察觉。' },
    { min: 26, max: 50, name: '略有察觉', desc: '你感觉到了一些不对劲，但还不清楚具体是什么。' },
    { min: 51, max: 75, name: '深入调查', desc: '你已经掌握了不少线索，能够预判一些事情。' },
    { min: 76, max: 100, name: '接近真相', desc: '你几乎已经看穿了黑教廷的阴谋，可以采取行动了。' }
  ],

  /**
   * 初始化玩家调查数据
   */
  initPlayerData(player) {
    if (!player.investigation) {
      player.investigation = {
        demon: 0,
        black_church: 0,
        yu_ang: 0,
        earth_spring: 0,
        discoveredClues: [],
        yuAngSuspicion: 0
      };
    }
    return player.investigation;
  },

  /**
   * 获取调查数据
   */
  getData(player) {
    return this.initPlayerData(player);
  },

  /**
   * 发现线索
   * @param {Object} player - 玩家对象
   * @param {string} clueId - 线索ID
   * @returns {Object} 结果
   */
  discoverClue(player, clueId) {
    const data = this.getData(player);
    const clue = DataClues ? DataClues[clueId] : null;

    if (!clue) {
      return { success: false, message: '线索不存在' };
    }

    // 检查是否已经发现
    if (data.discoveredClues.includes(clueId)) {
      return { success: false, message: '已经发现过这个线索', alreadyKnown: true };
    }

    // 添加到已发现列表
    data.discoveredClues.push(clueId);

    // 增加对应类型进度
    const type = clue.type;
    const oldProgress = data[type] || 0;
    data[type] = Math.min(100, oldProgress + (clue.progress || 10));

    // 宇昂疑点特殊处理
    if (type === 'yu_ang') {
      data.yuAngSuspicion = (data.yuAngSuspicion || 0) + 1;
      // v1.8.1: 收集3条宇昂疑点触发身份发现线
      if (data.yuAngSuspicion >= 3 && !player.flags['yu_ang_suspicion_triggered']) {
        player.flags['yu_ang_suspicion_triggered'] = true;
        result.yuAngSuspicionTriggered = true;
      }
    }

    // 检查是否解锁地圣泉是目标的线索
    if (clueId !== 'clue_spring_target' && this.shouldUnlockSpringTarget(data)) {
      if (!data.discoveredClues.includes('clue_spring_target')) {
        data.discoveredClues.push('clue_spring_target');
        data.earth_spring = Math.min(100, data.earth_spring + 20);
      }
    }

    const level = this.getInvestigationLevel(player);

    return {
      success: true,
      message: `发现新线索：${clue.name}`,
      clue: clue,
      type: type,
      progressGain: clue.progress || 10,
      newProgress: data[type],
      level: level,
      levelUp: level.min > oldProgress // 简化判断
    };
  },

  /**
   * 检查是否应该解锁"地圣泉是目标"线索
   */
  shouldUnlockSpringTarget(data) {
    const total = (data.demon || 0) + (data.black_church || 0) + (data.earth_spring || 0);
    return total >= 60;
  },

  /**
   * 获取总调查进度（平均值）
   */
  getTotalProgress(player) {
    const data = this.getData(player);
    const total = (data.demon || 0) + (data.black_church || 0) + (data.yu_ang || 0) + (data.earth_spring || 0);
    return Math.round(total / 4);
  },

  /**
   * 获取调查等级
   */
  getInvestigationLevel(player) {
    const total = this.getTotalProgress(player);
    for (const level of this.INVESTIGATION_LEVELS) {
      if (total >= level.min && total <= level.max) {
        return level;
      }
    }
    return this.INVESTIGATION_LEVELS[this.INVESTIGATION_LEVELS.length - 1];
  },

  /**
   * 获取某类型进度
   */
  getTypeProgress(player, type) {
    const data = this.getData(player);
    return data[type] || 0;
  },

  /**
   * 获取已发现的线索列表
   */
  getDiscoveredClues(player) {
    const data = this.getData(player);
    const clues = [];
    for (const clueId of data.discoveredClues) {
      const clue = DataClues ? DataClues[clueId] : null;
      if (clue) clues.push(clue);
    }
    return clues;
  },

  /**
   * 检查是否满足调查等级要求
   * @param {number} minLevel - 最小总进度
   */
  meetsRequirement(player, minLevel) {
    return this.getTotalProgress(player) >= minLevel;
  },

  /**
   * 宇昂疑点是否达到触发阈值
   */
  hasYuAngSuspicion(player) {
    const data = this.getData(player);
    return (data.yuAngSuspicion || 0) >= 3;
  },

  /**
   * 从线索池中随机获取一个未发现的线索
   * @param {string} type - 线索类型，null表示任意类型
   */
  getRandomClue(player, type = null) {
    const data = this.getData(player);
    const available = [];

    if (DataClues) {
      for (const clueId in DataClues) {
        const clue = DataClues[clueId];
        if (data.discoveredClues.includes(clueId)) continue;
        if (type && clue.type !== type) continue;
        available.push(clue);
      }
    }

    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  },

  /**
   * 尝试从线索池中发现线索（概率触发）
   * @param {number} chance - 概率 0-1
   * @param {string} type - 线索类型
   * @returns {Object|null} 发现的线索或null
   */
  tryDiscoverClue(player, chance, type = null) {
    if (Math.random() > chance) return null;
    const clue = this.getRandomClue(player, type);
    if (!clue) return null;
    return this.discoverClue(player, clue.id);
  },

  /**
   * 获取调查进度的文本描述
   */
  getProgressText(player) {
    const data = this.getData(player);
    const level = this.getInvestigationLevel(player);
    const total = this.getTotalProgress(player);

    let text = `【阴谋调查】${level.name} (${total}%)\n`;
    for (const type in this.CLUE_TYPES) {
      const config = this.CLUE_TYPES[type];
      const progress = data[type] || 0;
      text += `${config.icon} ${config.name}: ${progress}%\n`;
    }
    return text.trim();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = InvestigationSystem;
}
