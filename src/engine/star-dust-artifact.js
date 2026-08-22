/**
 * 星尘魔器系统
 * 星尘魔器是修炼滋养类器皿，可以缩短冥修疲劳期，增加每天的冥修时间
 */

export const StarDustArtifactSystem = {
  // 获取星尘魔器数据
  getArtifact(artifactId) {
    return DataStarDustArtifacts[artifactId];
  },

  // 获取某元素的所有星尘魔器
  getElementArtifacts(element) {
    const artifacts = [];
    for (const id in DataStarDustArtifacts) {
      const artifact = DataStarDustArtifacts[id];
      if (artifact.element === element || artifact.element === "all") {
        artifacts.push(artifact);
      }
    }
    return artifacts;
  },

  // 获取所有星尘魔器
  getAllArtifacts() {
    const artifacts = [];
    for (const id in DataStarDustArtifacts) {
      artifacts.push(DataStarDustArtifacts[id]);
    }
    return artifacts;
  },

  // 获取品质配置
  getGradeConfig(grade) {
    return StarDustGrades[grade];
  },

  // 获取品质名称
  getGradeName(grade) {
    const config = StarDustGrades[grade];
    return config ? config.name : grade;
  },

  // 获取品质颜色
  getGradeColor(grade) {
    const config = StarDustGrades[grade];
    return config ? config.color : "#666666";
  },

  // 获取星尘魔器的修炼效果
  getCultivateEffect(artifactData) {
    if (!artifactData) {
      return {
        timeBonus: 0,
        expBonus: 0
      };
    }

    const artifact = this.getArtifact(artifactData.id);
    if (!artifact) {
      return {
        timeBonus: 0,
        expBonus: 0
      };
    }

    // 成长型星尘魔器，根据等级计算效果
    if (artifact.grade === "growth" && artifactData.level) {
      const level = artifactData.level || 1;
      const baseTimeBonus = artifact.effect.cultivateTimeBonus;
      const baseExpBonus = artifact.effect.expBonus;
      
      // 每级提升10%效果
      const levelMultiplier = 1 + (level - 1) * 0.1;
      
      return {
        timeBonus: baseTimeBonus * levelMultiplier,
        expBonus: baseExpBonus * levelMultiplier
      };
    }

    return {
      timeBonus: artifact.effect.cultivateTimeBonus || 0,
      expBonus: artifact.effect.expBonus || 0
    };
  },

  // 获取玩家某元素的星尘魔器效果
  getPlayerElementArtifactEffect(playerArtifacts, element) {
    let totalEffect = {
      timeBonus: 0,
      expBonus: 0
    };

    if (!playerArtifacts) {
      return totalEffect;
    }

    // 检查该元素是否有星尘魔器
    if (playerArtifacts[element]) {
      const effect = this.getCultivateEffect(playerArtifacts[element]);
      totalEffect.timeBonus += effect.timeBonus;
      totalEffect.expBonus += effect.expBonus;
    }

    // 检查是否有全元素的星尘魔器（成长型）
    if (playerArtifacts.all) {
      const effect = this.getCultivateEffect(playerArtifacts.all);
      totalEffect.timeBonus += effect.timeBonus;
      totalEffect.expBonus += effect.expBonus;
    }

    return totalEffect;
  },

  // 获取玩家所有星尘魔器的总效果（取最高值）
  getPlayerTotalArtifactEffect(playerArtifacts) {
    let maxEffect = {
      timeBonus: 0,
      expBonus: 0
    };

    if (!playerArtifacts) {
      return maxEffect;
    }

    // 遍历所有星尘魔器，取最高效果
    for (const element in playerArtifacts) {
      const effect = this.getCultivateEffect(playerArtifacts[element]);
      if (effect.timeBonus > maxEffect.timeBonus) {
        maxEffect.timeBonus = effect.timeBonus;
      }
      if (effect.expBonus > maxEffect.expBonus) {
        maxEffect.expBonus = effect.expBonus;
      }
    }

    return maxEffect;
  },

  // 吸收星尘魔器（成长型）
  absorbArtifact(playerArtifacts, targetArtifactId, absorbArtifactId) {
    const targetArtifact = playerArtifacts[targetArtifactId];
    if (!targetArtifact) {
      return {
        success: false,
        message: "没有找到目标星尘魔器"
      };
    }

    const artifact = this.getArtifact(targetArtifact.id);
    if (!artifact || !artifact.effect.canAbsorb) {
      return {
        success: false,
        message: "该星尘魔器不能吸收其他魔器"
      };
    }

    const absorbArtifact = this.getArtifact(absorbArtifactId);
    if (!absorbArtifact) {
      return {
        success: false,
        message: "没有找到要吸收的星尘魔器"
      };
    }

    // 计算吸收后的经验值或等级
    const currentLevel = targetArtifact.level || 1;
    const currentExp = targetArtifact.exp || 0;
    
    // 根据被吸收魔器的品质增加经验
    const gradeExp = {
      basic: 100,
      spirit: 500
    };
    
    const gainExp = gradeExp[absorbArtifact.grade] || 50;
    const newExp = currentExp + gainExp;
    
    // 计算升级
    let newLevel = currentLevel;
    let remainingExp = newExp;
    
    while (remainingExp >= this.getExpToNextLevel(newLevel) && newLevel < (artifact.maxLevel || 10)) {
      remainingExp -= this.getExpToNextLevel(newLevel);
      newLevel++;
    }

    // 更新目标魔器
    playerArtifacts[targetArtifactId] = {
      ...targetArtifact,
      level: newLevel,
      exp: remainingExp
    };

    return {
      success: true,
      message: `吸收成功！获得 ${gainExp} 经验`,
      levelUp: newLevel > currentLevel,
      newLevel: newLevel
    };
  },

  // 用精魄升级星尘魔器（成长型）
  absorbSoulEssence(playerArtifacts, targetElement, soulEssenceId, count = 1) {
    const targetArtifact = playerArtifacts[targetElement];
    if (!targetArtifact) {
      return {
        success: false,
        message: "没有找到目标星尘魔器"
      };
    }

    const artifact = this.getArtifact(targetArtifact.id);
    if (!artifact || artifact.grade !== "growth") {
      return {
        success: false,
        message: "该星尘魔器不是成长型，无法用精魄升级"
      };
    }

    // 精魄经验值配置
    const soulEssenceExp = {
      servant_soul_essence: 50,
      warrior_soul_essence: 300,
      commander_soul_essence: 1500
    };

    const expPerEssence = soulEssenceExp[soulEssenceId];
    if (!expPerEssence) {
      return {
        success: false,
        message: "无效的精魄类型"
      };
    }

    const currentLevel = targetArtifact.level || 1;
    const currentExp = targetArtifact.exp || 0;
    const maxLevel = artifact.maxLevel || 10;

    if (currentLevel >= maxLevel) {
      return {
        success: false,
        message: "星尘魔器已满级"
      };
    }

    const gainExp = expPerEssence * count;
    const newExp = currentExp + gainExp;

    // 计算升级
    let newLevel = currentLevel;
    let remainingExp = newExp;

    while (remainingExp >= this.getExpToNextLevel(newLevel) && newLevel < maxLevel) {
      remainingExp -= this.getExpToNextLevel(newLevel);
      newLevel++;
    }

    // 更新目标魔器
    playerArtifacts[targetElement] = {
      ...targetArtifact,
      level: newLevel,
      exp: remainingExp
    };

    return {
      success: true,
      message: `吸收 ${count} 个精魄，获得 ${gainExp} 经验`,
      levelUp: newLevel > currentLevel,
      newLevel: newLevel,
      gainExp: gainExp
    };
  },

  // ========== v1.8.2: 星尘魔器分配系统 ==========

  /**
   * 分配星尘魔器给玩家（学校/家族分配的临时使用权）
   * @param {Object} player - 玩家对象
   * @param {string} artifactId - 魔器ID
   * @param {number} days - 使用天数
   * @param {string} source - 来源（school/mu_family）
   * @returns {Object} 分配结果
   */
  assignArtifact(player, artifactId, days, source = "school") {
    const artifact = this.getArtifact(artifactId);
    if (!artifact) {
      return { success: false, message: "星尘魔器不存在" };
    }

    const currentDay = player.day || 1;
    const grade = artifact.grade || "normal";

    player.starDustAssignment = {
      artifactId: artifactId,
      grade: grade,
      daysRemaining: days,
      totalDays: days,
      source: source,
      assignedDay: currentDay,
      expireDay: currentDay + days
    };

    return {
      success: true,
      message: `获得${grade === "exquisite" ? "精品" : "普通"}级星尘魔器使用权：${days}天`,
      artifact: artifact,
      days: days,
      source: source
    };
  },

  /**
   * 每日更新星尘魔器使用期限
   * @param {Object} player - 玩家对象
   * @returns {Object} 结果
   */
  dailyUpdate(player) {
    if (!player.starDustAssignment) {
      return { expired: false, expiringSoon: false };
    }

    const assignment = player.starDustAssignment;
    assignment.daysRemaining = Math.max(0, assignment.daysRemaining - 1);

    const expired = assignment.daysRemaining <= 0;
    const expiringSoon = assignment.daysRemaining <= 3 && assignment.daysRemaining > 0;

    if (expired) {
      const artifactName = this.getArtifact(assignment.artifactId)?.name || "星尘魔器";
      player.starDustAssignment = null;
      return {
        expired: true,
        expiringSoon: false,
        message: `你的${artifactName}使用权已到期，修炼加成已失效`
      };
    }

    return {
      expired: false,
      expiringSoon: expiringSoon,
      daysRemaining: assignment.daysRemaining,
      message: expiringSoon ? `星尘魔器剩余${assignment.daysRemaining}天，即将到期` : null
    };
  },

  /**
   * 检查玩家是否持有有效的星尘魔器
   * @param {Object} player - 玩家对象
   * @returns {boolean}
   */
  hasActiveArtifact(player) {
    return player.starDustAssignment && player.starDustAssignment.daysRemaining > 0;
  },

  /**
   * 获取当前生效的星尘魔器修炼加成
   * @param {Object} player - 玩家对象
   * @returns {Object} 加成 { expBonus, fatigueBonus }
   */
  getActiveBonus(player) {
    if (!this.hasActiveArtifact(player)) {
      return { expBonus: 0, fatigueBonus: 0 };
    }

    const grade = player.starDustAssignment.grade;
    if (grade === "exquisite") {
      return { expBonus: 0.20, fatigueBonus: 0.25 };
    }
    return { expBonus: 0.10, fatigueBonus: 0.15 };
  },

  /**
   * 根据年度考核评级分配星尘魔器
   * @param {Object} player - 玩家对象
   * @param {string} rank - 评级 S/A/B/C/D
   * @param {Object} modifiers - 修正 { penalty: bool, bonus: bool, muFamily: bool }
   * @returns {Object} 分配结果
   */
  assignByRank(player, rank, modifiers = {}) {
    const rankConfig = {
      S: { days: 30, grade: "exquisite" },
      A: { days: 20, grade: "exquisite" },
      B: { days: 10, grade: "normal" },
      C: { days: 5, grade: "normal" },
      D: { days: 0, grade: null }
    };

    const config = rankConfig[rank] || rankConfig.D;
    if (config.days === 0) {
      return { success: false, message: "考核成绩未达到星尘魔器分配资格" };
    }

    let days = config.days;
    const grade = config.grade;

    // 违纪惩罚：时长减半
    if (modifiers.penalty) {
      days = Math.floor(days / 2);
    }

    // 揭发暗石奖励：+5天
    if (modifiers.bonus) {
      days += 5;
    }

    // 确定魔器ID（玩家主修元素）
    const mainElement = player.elements && player.elements.length > 0 ? player.elements[0] : "fire";
    const artifactId = `${mainElement}_star_dust`;

    // 验证魔器是否存在
    if (!this.getArtifact(artifactId)) {
      // 回退到通用型
      const allArtifacts = this.getElementArtifacts("all");
      if (allArtifacts.length > 0) {
        return this.assignArtifact(player, allArtifacts[0].id, days, "school");
      }
      return { success: false, message: "未找到合适的星尘魔器" };
    }

    const result = this.assignArtifact(player, artifactId, days, "school");

    // 穆氏家族额外分配
    if (modifiers.muFamily) {
      const muArtifactId = `${mainElement}_star_dust`;
      // 穆氏家族魔器品质更高，但这里简化处理，只增加天数
      result.muFamilyBonus = "穆氏家族星尘魔器已激活，修炼效果额外+10%";
    }

    return result;
  },

  // 获取升级所需经验
  getExpToNextLevel(level) {
    // 升级所需经验：100 * 1.5^(level-1)
    return Math.floor(100 * Math.pow(1.5, level - 1));
  },

  // 获取星尘魔器描述
  getArtifactDescription(artifactId, level = 1) {
    const artifact = this.getArtifact(artifactId);
    if (!artifact) {
      return "";
    }

    let description = artifact.description + "\n\n";
    description += `品质：${this.getGradeName(artifact.grade)}\n`;
    
    if (artifact.element !== "all") {
      description += `适用：${artifact.element}系\n`;
    } else {
      description += `适用：全元素\n`;
    }
    
    description += `\n效果：\n`;
    description += `- 修炼时间 +${Math.round(artifact.effect.cultivateTimeBonus * 100)}%\n`;
    description += `- 修炼经验 +${Math.round(artifact.effect.expBonus * 100)}%\n`;

    if (artifact.grade === "growth") {
      description += `\n当前等级：Lv.${level}\n`;
      description += `成长型：可通过吸收其他星尘魔器升级\n`;
    }

    return description;
  }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.StarDustArtifactSystem = StarDustArtifactSystem;
