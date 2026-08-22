/**
 * 技能系统
 * 管理技能数据、伤害计算、效果
 */

export const SkillSystem = {
    // 技能缓存
    _skills: {},

    /**
     * 获取技能数据
     */
    getSkill(skillId) {
        if (this._skills[skillId]) {
            return this._skills[skillId];
        }
        
        const skill = DataManager.getSkill(skillId);
        if (skill) {
            this._skills[skillId] = skill;
        }
        return skill;
    },

    /**
     * 获取玩家可用的所有技能
     */
    getPlayerSkills() {
        return Player.skills.map(id => this.getSkill(id)).filter(Boolean);
    },

    /**
     * 检查技能是否可用
     */
    canUseSkill(skillId, mp) {
        const skill = this.getSkill(skillId);
        if (!skill) return false;
        return mp >= skill.mpCost;
    },

    /**
     * 获取技能描述（带数值）
     */
    getSkillDescription(skillId) {
        const skill = this.getSkill(skillId);
        if (!skill) return '';

        let desc = skill.description + '\n';
        desc += `消耗: ${skill.mpCost} MP\n`;
        desc += `阶位: ${skill.tier}\n`;

        if (skill.baseDamage) {
            desc += `基础伤害: ${skill.baseDamage}\n`;
        }
        if (skill.baseHeal) {
            desc += `基础治疗: ${skill.baseHeal}\n`;
        }
        if (skill.hitRate !== undefined) {
            desc += `命中率: ${Math.floor(skill.hitRate * 100)}%\n`;
        }
        if (skill.statusEffects && skill.statusEffects.length > 0) {
            desc += '效果: ';
            desc += skill.statusEffects.map(e => `${e.name}(${Math.floor(e.chance * 100)}%)`).join(', ');
        }

        return desc;
    },

    /**
     * 获取元素名称
     */
    getElementName(element) {
        const names = {
            fire: '火系',
            ice: '冰系',
            thunder: '雷系',
            earth: '土系',
            wind: '风系',
            water: '水系',
            light: '光系',
            dark: '暗影系',
            heal: '治愈系',
            summon: '召唤系',
            neutral: '无属性'
        };
        return names[element] || element;
    },

    /**
     * 获取元素颜色
     */
    getElementColor(element) {
        const colors = {
            fire: '#ff6633',
            ice: '#66ccff',
            thunder: '#ffcc00',
            earth: '#cc9966',
            wind: '#99ff99',
            water: '#6699ff',
            light: '#ffffcc',
            dark: '#9966ff',
            heal: '#66ffaa',
            summon: '#ff9966',
            neutral: '#999999'
        };
        return colors[element] || '#ffffff';
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.SkillSystem = SkillSystem;
