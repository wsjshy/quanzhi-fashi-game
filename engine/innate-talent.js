/**
 * 自身天赋系统（Innate Talent System）
 * 管理角色创建时随机获得的天生天赋
 */
const InnateTalentSystem = {
    _talents: null,
    _player: null,

    init() {
        this._talents = DataInnateTalents;
        this._player = Player;
    },

    /**
     * 随机roll一个自身天赋
     * @param {number} count - 需要roll出的天赋数量（默认3选1）
     * @returns {Array} 天赋ID数组
     */
    rollTalents(count = 3) {
        const allTalents = Object.values(this._talents);
        const rolled = [];
        const usedIds = new Set();

        for (let i = 0; i < count; i++) {
            // 按权重随机选择
            let totalWeight = 0;
            for (const t of allTalents) {
                if (!usedIds.has(t.id)) {
                    totalWeight += t.weight;
                }
            }
            let rand = Math.random() * totalWeight;
            let selected = null;
            for (const t of allTalents) {
                if (usedIds.has(t.id)) continue;
                rand -= t.weight;
                if (rand <= 0) {
                    selected = t;
                    break;
                }
            }
            if (selected) {
                rolled.push(selected.id);
                usedIds.add(selected.id);
            }
        }
        return rolled;
    },

    /**
     * 获取天赋数据
     */
    getTalent(id) {
        return this._talents[id] || null;
    },

    /**
     * 获取所有自身天赋
     */
    getAllTalents() {
        return Object.values(this._talents);
    },

    /**
     * 设置玩家的自身天赋
     */
    setInnateTalent(talentId) {
        const talent = this._talents[talentId];
        if (!talent) return false;

        this._player.innateTalent = talentId;

        // 应用天赋效果
        this.applyTalentEffects(talent);
        return true;
    },

    /**
     * 应用天赋效果到玩家
     */
    applyTalentEffects(talent) {
        if (!talent.effects) return;
        const e = talent.effects;

        // 初始化innateEffects
        if (!this._player.innateEffects) {
            this._player.innateEffects = {};
        }

        // extraElement：额外觉醒一个随机系
        if (e.extraElement) {
            const allElements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark'];
            const available = allElements.filter(el => !this._player.elements.includes(el));
            if (available.length > 0) {
                const extraElement = available[Math.floor(Math.random() * available.length)];
                this._player.elements.push(extraElement);
                this._player.innateEffects.extraElement = extraElement;
            }
        }

        // 属性百分比加成
        if (e.hpBonus) {
            this._player.maxHp = Math.floor(this._player.maxHp * (1 + e.hpBonus));
            this._player.hp = this._player.maxHp;
            this._player.innateEffects.hpBonus = e.hpBonus;
        }
        if (e.mpBonus) {
            this._player.maxMp = Math.floor(this._player.maxMp * (1 + e.mpBonus));
            this._player.mp = this._player.maxMp;
            this._player.innateEffects.mpBonus = e.mpBonus;
        }
        if (e.atkBonus) {
            this._player.atk = Math.floor(this._player.atk * (1 + e.atkBonus));
            this._player.innateEffects.atkBonus = e.atkBonus;
        }
        if (e.defBonus) {
            this._player.def = Math.floor(this._player.def * (1 + e.defBonus));
            this._player.innateEffects.defBonus = e.defBonus;
        }
        if (e.speedBonus) {
            this._player.spd = Math.floor(this._player.spd * (1 + e.speedBonus));
            this._player.innateEffects.speedBonus = e.speedBonus;
        }
        if (e.spiritBonus) {
            this._player.spr = Math.floor(this._player.spr * (1 + e.spiritBonus));
            this._player.innateEffects.spiritBonus = e.spiritBonus;
        }

        // 战斗效果（存入innateEffects，战斗时读取）
        const battleEffects = [
            'skillLevelBonus', 'firstStrikeBonus', 'cooldownReduction',
            'allElementDamage', 'allElementResistance', 'expBonus',
            'cultivationBonus', 'hpRegen', 'mpRegen',
            'mpRegenBonus', 'critRate', 'critDamage', 'dodgeBonus',
            'lifesteal', 'killHeal', 'mpCostReduction', 'debuffResistance',
            'controlDurationReduction', 'dropBonus', 'luckBonus',
            'spiritSeedBonus', 'seedAbsorbBonus', 'healBonus', 'potionBonus'
        ];
        for (const key of battleEffects) {
            if (e[key] !== undefined) {
                this._player.innateEffects[key] = e[key];
            }
        }
    },

    /**
     * 获取自身天赋效果（合并到战斗效果中）
     */
    getInnateEffects() {
        return this._player.innateEffects || {};
    },

    /**
     * 获取稀有度配置
     */
    getRarityConfig(rarity) {
        return InnateTalentRarity[rarity] || InnateTalentRarity.common;
    },

    /**
     * 获取自身天赋显示信息
     */
    getTalentDisplay() {
        if (!this._player.innateTalent) return null;
        const talent = this._talents[this._player.innateTalent];
        if (!talent) return null;
        const rarity = this.getRarityConfig(talent.rarity);
        return {
            ...talent,
            rarityName: rarity.name,
            rarityColor: rarity.color
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InnateTalentSystem;
}
