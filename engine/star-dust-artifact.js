/**
 * 星尘魔器系统
 * 星尘魔器是修炼滋养类器皿，可以缩短冥修疲劳期，增加每天的冥修时间
 */

const StarDustArtifactSystem = {
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
