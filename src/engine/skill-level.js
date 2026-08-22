/**
 * 技能等级系统
 * 技能可以通过使用获得经验，升级后提升威力
 */

export const SkillLevelSystem = {
    // 技能等级配置
    MAX_LEVEL: 3,  // 初阶最高3级
    
    // 每级经验需求
    expToLevel: [0, 100, 300],  // 升到2级需要100经验，升到3级需要300经验
    
    // 每级伤害加成
    damageBonusPerLevel: 0.25,  // 每级+25%伤害
    
    // 每级MP消耗增加
    mpCostIncreasePerLevel: 0.1,  // 每级+10%MP消耗
    
    /**
     * 获取技能当前等级
     * @param {Object} playerSkillLevels - 玩家技能等级表
     * @param {string} skillId - 技能ID
     * @returns {number} 等级（1-3）
     */
    getSkillLevel(playerSkillLevels, skillId) {
        if (!playerSkillLevels || !playerSkillLevels[skillId]) {
            return 1;  // 默认1级
        }
        return playerSkillLevels[skillId].level || 1;
    },
    
    /**
     * 获取技能当前经验
     * @param {Object} playerSkillLevels - 玩家技能等级表
     * @param {string} skillId - 技能ID
     * @returns {number} 当前经验
     */
    getSkillExp(playerSkillLevels, skillId) {
        if (!playerSkillLevels || !playerSkillLevels[skillId]) {
            return 0;
        }
        return playerSkillLevels[skillId].exp || 0;
    },
    
    /**
     * 获取升级到下一级所需经验
     * @param {number} level - 当前等级
     * @returns {number} 所需经验（满级返回0）
     */
    getExpToNextLevel(level) {
        if (level >= this.MAX_LEVEL) {
            return 0;  // 满级
        }
        return this.expToLevel[level] || 999;
    },
    
    /**
     * 获取技能伤害加成
     * @param {number} level - 技能等级
     * @returns {number} 伤害倍率
     */
    getDamageBonus(level) {
        return 1 + (level - 1) * this.damageBonusPerLevel;
    },
    
    /**
     * 获取技能MP消耗倍率
     * @param {number} level - 技能等级
     * @returns {number} MP消耗倍率
     */
    getMpCostMultiplier(level) {
        return 1 + (level - 1) * this.mpCostIncreasePerLevel;
    },
    
    /**
     * 增加技能经验
     * @param {Object} playerSkillLevels - 玩家技能等级表
     * @param {string} skillId - 技能ID
     * @param {number} amount - 经验数量
     * @returns {Object} { leveledUp: boolean, newLevel: number }
     */
    addSkillExp(playerSkillLevels, skillId, amount) {
        // 初始化技能数据
        if (!playerSkillLevels[skillId]) {
            playerSkillLevels[skillId] = {
                level: 1,
                exp: 0
            };
        }
        
        const skillData = playerSkillLevels[skillId];
        
        // 满级了就不加了
        if (skillData.level >= this.MAX_LEVEL) {
            return { leveledUp: false, newLevel: skillData.level };
        }
        
        // 增加经验
        skillData.exp += amount;
        
        // 检查是否升级
        let leveledUp = false;
        let expNeeded = this.getExpToNextLevel(skillData.level);
        
        while (skillData.exp >= expNeeded && skillData.level < this.MAX_LEVEL) {
            skillData.exp -= expNeeded;
            skillData.level++;
            leveledUp = true;
            expNeeded = this.getExpToNextLevel(skillData.level);
        }
        
        // 满级后清空经验
        if (skillData.level >= this.MAX_LEVEL) {
            skillData.exp = 0;
        }
        
        return { leveledUp, newLevel: skillData.level };
    },
    
    /**
     * 获取技能等级名称（如"火滋·灼烧" → "火滋·爆裂"）
     * @param {Object} skill - 技能数据
     * @param {number} level - 等级
     * @returns {string} 技能名称
     */
    getSkillNameByLevel(skill, level) {
        if (!skill) return '';
        if (!skill.levelNames || level <= 1) {
            return skill.name;
        }
        return skill.levelNames[level - 1] || skill.name;
    },
    
    /**
     * 获取技能描述（根据等级）
     * @param {Object} skill - 技能数据
     * @param {number} level - 等级
     * @returns {string} 技能描述
     */
    getSkillDescriptionByLevel(skill, level) {
        if (!skill) return '';
        if (!skill.levelDescriptions || level <= 1) {
            return skill.description;
        }
        return skill.levelDescriptions[level - 1] || skill.description;
    },
    
    /**
     * 初始化玩家技能等级
     * @param {Object} player - 玩家对象
     */
    initPlayerSkillLevels(player) {
        if (!player.skillLevels) {
            player.skillLevels = {};
        }
    }
};

// 导出（用于Node.js环境测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillLevelSystem;
}

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.SkillLevelSystem = SkillLevelSystem;
