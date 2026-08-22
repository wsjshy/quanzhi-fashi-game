/**
 * 角色系统
 * 管理角色属性、状态、成长等
 */

class Character {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.title = data.title || '';
        this.description = data.description || '';
        
        // 基础属性
        this.level = data.level || 1;
        this.maxHp = data.maxHp || 100;
        this.hp = data.hp || this.maxHp;
        this.maxMp = data.maxMp || 50;
        this.mp = data.mp || this.maxMp;
        
        // 攻击防御
        this.attack = data.attack || 10;
        this.defense = data.defense || 5;
        this.speed = data.speed || 10;
        
        // 经验值
        this.exp = data.exp || 0;
        this.expToNext = data.expToNext || 100;
        
        // 魔法系
        this.elements = data.elements || []; // 已觉醒的法系
        
        // 技能列表
        this.skills = data.skills || [];
        
        // 外观
        this.spriteColor = data.spriteColor || 'bg-thunder';
        
        // 状态效果
        this.statusEffects = [];
        
        // 是否为玩家
        this.isPlayer = data.isPlayer || false;
    }

    /**
     * 受到伤害
     */
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense * 0.3);
        this.hp = Math.max(0, this.hp - actualDamage);
        return Math.round(actualDamage);
    }

    /**
     * 治疗
     */
    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHp - this.hp);
        this.hp += actualHeal;
        return Math.round(actualHeal);
    }

    /**
     * 消耗魔法
     */
    useMp(amount) {
        if (this.mp < amount) return false;
        this.mp -= amount;
        return true;
    }

    /**
     * 恢复魔法
     */
    restoreMp(amount) {
        const actualRestore = Math.min(amount, this.maxMp - this.mp);
        this.mp += actualRestore;
        return Math.round(actualRestore);
    }

    /**
     * 是否存活
     */
    isAlive() {
        return this.hp > 0;
    }

    /**
     * 获得经验
     */
    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.levelUp();
            leveledUp = true;
        }
        
        return leveledUp;
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.maxHp += 15;
        this.hp = this.maxHp;
        this.maxMp += 8;
        this.mp = this.maxMp;
        this.attack += 3;
        this.defense += 2;
        this.speed += 1;
        this.expToNext = Math.floor(this.expToNext * 1.5);
    }

    /**
     * 觉醒新法系
     */
    awakenElement(elementId) {
        if (!this.elements.includes(elementId)) {
            this.elements.push(elementId);
            return true;
        }
        return false;
    }

    /**
     * 学习技能
     */
    learnSkill(skillId) {
        if (!this.skills.includes(skillId)) {
            this.skills.push(skillId);
            return true;
        }
        return false;
    }

    /**
     * 获取等级描述
     */
    getLevelName() {
        const levelNames = [
            '初阶一级', '初阶二级', '初阶三级',
            '中阶一级', '中阶二级', '中阶三级',
            '高阶一级', '高阶二级', '高阶三级',
            '超阶一级', '超阶二级', '超阶三级',
            '禁咒'
        ];
        return levelNames[Math.min(this.level - 1, levelNames.length - 1)];
    }

    /**
     * 添加状态效果
     */
    addStatusEffect(effect) {
        // 检查是否已有同名效果
        const existing = this.statusEffects.find(e => e.type === effect.type);
        if (existing) {
            existing.duration = Math.max(existing.duration, effect.duration);
            return false;
        }
        this.statusEffects.push({ ...effect, remaining: effect.duration });
        return true;
    }

    /**
     * 回合结束时处理状态效果
     */
    tickStatusEffects() {
        const results = [];
        this.statusEffects = this.statusEffects.filter(effect => {
            effect.remaining--;
            
            // 处理每回合效果
            if (effect.dotDamage) {
                const dmg = this.takeDamage(effect.dotDamage);
                results.push({ type: 'dot', name: effect.name, damage: dmg });
            }
            if (effect.healPerTurn) {
                const heal = this.heal(effect.healPerTurn);
                results.push({ type: 'heal', name: effect.name, amount: heal });
            }
            
            return effect.remaining > 0;
        });
        return results;
    }

    /**
     * 获取属性修正（来自状态效果）
     */
    getStatModifier(stat) {
        let modifier = 0;
        this.statusEffects.forEach(effect => {
            if (effect.statModifiers && effect.statModifiers[stat]) {
                modifier += effect.statModifiers[stat];
            }
        });
        return modifier;
    }

    /**
     * 获取实际攻击力（含状态修正）
     */
    getEffectiveAttack() {
        return this.attack + this.getStatModifier('attack');
    }

    /**
     * 获取实际防御力（含状态修正）
     */
    getEffectiveDefense() {
        return this.defense + this.getStatModifier('defense');
    }

    /**
     * 获取实际速度（含状态修正）
     */
    getEffectiveSpeed() {
        return this.speed + this.getStatModifier('speed');
    }

    /**
     * 转换为存档数据
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            maxHp: this.maxHp,
            hp: this.hp,
            maxMp: this.maxMp,
            mp: this.mp,
            attack: this.attack,
            defense: this.defense,
            speed: this.speed,
            exp: this.exp,
            expToNext: this.expToNext,
            elements: [...this.elements],
            skills: [...this.skills],
            spriteColor: this.spriteColor,
            isPlayer: this.isPlayer
        };
    }

    /**
     * 从数据创建角色
     */
    static fromData(data) {
        return new Character(data);
    }
}

/**
 * 玩家角色（单例）
 */
export const Player = {
    _instance: null,

    init(data) {
        this._instance = new Character({ ...data, isPlayer: true });
        return this._instance;
    },

    get() {
        return this._instance;
    },

    reset() {
        this._instance = null;
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.Player = Player;
