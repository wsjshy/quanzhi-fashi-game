/**
 * 残魄/精魄系统
 * 妖魔死后留下的魂魄，可以用于滋养和升级星尘魔器
 */

const SoulSystem = {
  // 魂魄类型配置
  soulTypes: {
    remnant: {
      name: "残魄",
      icon: "🔵",
      baseExp: 10,
      dropRate: 0.3, // 普通妖魔30%掉落率
      price: 100,
      itemId: "soul_fragment"
    },
    pure: {
      name: "精魄",
      icon: "💎",
      baseExp: 500,
      dropRate: 0.05, // 精英妖魔5%掉落率
      price: 5000,
      itemId: "elite_soul"
    }
  },

  // 检查玩家是否有小泥鳅坠（成长型星尘魔器）
  hasLittleLoach(player) {
    if (!player || !player.starDustArtifacts) {
      return false;
    }
    return player.starDustArtifacts.all && player.starDustArtifacts.all.id === "little_loach";
  },

  // 击杀妖魔后自动收集残魄/精魄
  collectSoulOnKill(player, enemy) {
    // 根据敌人等级和类型计算掉落
    const enemyLevel = enemy.level || 1;
    const isElite = enemy.isElite || enemy.isBoss || enemy.isAdvanced;

    // 计算掉落概率
    let dropRate = this.soulTypes.remnant.dropRate;
    let soulType = "remnant";

    if (isElite) {
      dropRate = this.soulTypes.pure.dropRate;
      soulType = "pure";
    }

    // 等级修正：等级越高，掉落率略微增加
    dropRate *= (1 + enemyLevel * 0.02);

    // 小泥鳅坠加成：掉落率+20%
    const hasLoach = this.hasLittleLoach(player);
    if (hasLoach) {
      dropRate *= 1.2;
    }

    // 随机判定是否掉落
    if (Math.random() > dropRate) {
      return {
        collected: false,
        message: ""
      };
    }

    // 掉落成功，添加到玩家背包
    const soulItemId = this.soulTypes[soulType].itemId;
    const soulName = this.soulTypes[soulType].name;
    const soulIcon = this.soulTypes[soulType].icon;

    // 添加到背包
    if (player.addItem) {
      player.addItem(soulItemId, 1);
    }

    // 有小泥鳅坠的话，自动吸收并显示提示
    let message = `获得 ${soulIcon} ${soulName} x1`;
    if (hasLoach) {
      message = `${soulIcon} 小泥鳅坠自动吸收了${soulName}！`;
    }

    return {
      collected: true,
      soulType: soulType,
      soulItemId: soulItemId,
      message: message
    };
  },

  // 用残魄/精魄升级星尘魔器
  upgradeArtifactWithSoul(player, artifactElement, soulItemId, count = 1) {
    if (!player || !player.starDustArtifacts) {
      return {
        success: false,
        message: "没有星尘魔器"
      };
    }

    const artifactData = player.starDustArtifacts[artifactElement];
    if (!artifactData) {
      return {
        success: false,
        message: "没有找到该元素的星尘魔器"
      };
    }

    const artifact = StarDustArtifactSystem.getArtifact(artifactData.id);
    if (!artifact) {
      return {
        success: false,
        message: "星尘魔器数据错误"
      };
    }

    // 检查是否是成长型
    if (artifact.grade !== "growth") {
      return {
        success: false,
        message: "只有成长型星尘魔器才能用魂魄升级"
      };
    }

    // 检查玩家是否有足够的魂魄
    const soulCount = player.getItemCount ? player.getItemCount(soulItemId) : 0;
    if (soulCount < count) {
      return {
        success: false,
        message: "魂魄数量不足"
      };
    }

    // 获取魂魄提供的经验
    const soulItem = DataItems[soulItemId];
    
    // 判断魂魄类型
    let soulExp = 10;
    if (soulItemId === this.soulTypes.remnant.itemId) {
      soulExp = this.soulTypes.remnant.baseExp;
    } else if (soulItemId === this.soulTypes.pure.itemId) {
      soulExp = this.soulTypes.pure.baseExp;
    } else if (soulItem && soulItem.soulExp) {
      soulExp = soulItem.soulExp;
    } else {
      return {
        success: false,
        message: "物品不是魂魄"
      };
    }

    const totalExp = soulExp * count;

    // 计算升级
    const currentLevel = artifactData.level || 1;
    const currentExp = artifactData.exp || 0;
    const maxLevel = artifact.maxLevel || 10;

    if (currentLevel >= maxLevel) {
      return {
        success: false,
        message: "星尘魔器已满级"
      };
    }

    let newLevel = currentLevel;
    let newExp = currentExp + totalExp;

    while (newExp >= StarDustArtifactSystem.getExpToNextLevel(newLevel) && newLevel < maxLevel) {
      newExp -= StarDustArtifactSystem.getExpToNextLevel(newLevel);
      newLevel++;
    }

    // 消耗魂魄
    if (player.removeItem) {
      player.removeItem(soulItemId, count);
    }

    // 更新星尘魔器
    player.starDustArtifacts[artifactElement] = {
      ...artifactData,
      level: newLevel,
      exp: newExp
    };

    const levelUp = newLevel > currentLevel;

    return {
      success: true,
      message: levelUp
        ? `升级成功！星尘魔器提升到 Lv.${newLevel}`
        : `吸收成功！获得 ${totalExp} 经验`,
      levelUp: levelUp,
      newLevel: newLevel,
      newExp: newExp,
      gainedExp: totalExp
    };
  },

  // 获取魂魄描述
  getSoulDescription(soulType) {
    const config = this.soulTypes[soulType];
    if (!config) {
      return "";
    }
    return `${config.icon} ${config.name}\n提供 ${config.baseExp} 点星尘魔器经验`;
  }
};
