/**
 * 灵种系统
 * 天地孕育的特殊元素种子，炼化后可大幅提升对应系魔法威力
 * 品质：凡种 < 灵种 < 魂种 < 天种
 */

const SpiritSeedSystem = {
    /**
     * 获取灵种数据
     * @param {string} seedId - 灵种ID
     * @returns {object} 灵种数据
     */
    getSpiritSeed(seedId) {
        return DataSpiritSeeds[seedId] || null;
    },

    /**
     * 获取某元素系的所有灵种
     * @param {string} element - 元素系ID
     * @returns {Array} 灵种列表
     */
    getElementSpiritSeeds(element) {
        const result = [];
        for (const id in DataSpiritSeeds) {
            const seed = DataSpiritSeeds[id];
            if (seed.element === element) {
                result.push(seed);
            }
        }
        return result;
    },

    /**
     * 获取品质配置
     * @param {string} grade - 品质
     * @returns {object} 品质配置
     */
    getGradeConfig(grade) {
        return SPIRIT_SEED_GRADES[grade] || SPIRIT_SEED_GRADES.mortal;
    },

    /**
     * 获取品质名称
     * @param {string} grade - 品质
     * @returns {string} 品质名称
     */
    getGradeName(grade) {
        const config = this.getGradeConfig(grade);
        return config.name || '凡种';
    },

    /**
     * 获取品质颜色
     * @param {string} grade - 品质
     * @returns {string} 颜色值
     */
    getGradeColor(grade) {
        const config = this.getGradeConfig(grade);
        return config.color || '#999999';
    },

    /**
     * 炼化灵种
     * @param {string} seedId - 灵种ID
     * @returns {boolean} 是否成功
     */
    refineSpiritSeed(seedId) {
        const seed = this.getSpiritSeed(seedId);
        if (!seed) return false;

        // 检查玩家是否已有该系灵种
        const element = seed.element;
        if (Player.spiritSeeds && Player.spiritSeeds[element]) {
            // 已有灵种，需要先移除旧的，或者替换
            const oldSeed = this.getSpiritSeed(Player.spiritSeeds[element]);
            if (oldSeed && this.getGradeConfig(oldSeed.grade).multiplier >= this.getGradeConfig(seed.grade).multiplier) {
                // 旧的品质更高或相等，不能替换
                return false;
            }
        }

        // 从背包中移除灵种
        const removed = Inventory.removeItem(seedId, 1);
        if (!removed) return false;

        // 装备新灵种
        if (!Player.spiritSeeds) Player.spiritSeeds = {};
        Player.spiritSeeds[element] = seedId;

        return true;
    },

    /**
     * 获取玩家某元素系的灵种效果
     * @param {object} playerSeeds - 玩家灵种数据
     * @param {string} element - 元素系ID
     * @returns {object} 灵种效果
     */
    getPlayerElementSeedEffects(playerSeeds, element) {
        if (!playerSeeds || !playerSeeds[element]) return {};
        const seed = this.getSpiritSeed(playerSeeds[element]);
        if (!seed) return {};
        return { ...seed.effects };
    },

    /**
     * 获取玩家某元素系的灵种数据
     * @param {object} playerSeeds - 玩家灵种数据
     * @param {string} element - 元素系ID
     * @returns {object|null} 灵种数据
     */
    getPlayerElementSeed(playerSeeds, element) {
        if (!playerSeeds || !playerSeeds[element]) return null;
        return this.getSpiritSeed(playerSeeds[element]);
    },

    /**
     * 随机获取一个灵种（用于掉落）
     * @param {string} element - 元素系ID（可选）
     * @param {string} minGrade - 最低品质（可选）
     * @returns {string|null} 灵种ID
     */
    getRandomSpiritSeed(element = null, minGrade = 'mortal') {
        let seeds = [];

        if (element) {
            seeds = this.getElementSpiritSeeds(element);
        } else {
            for (const id in DataSpiritSeeds) {
                seeds.push(DataSpiritSeeds[id]);
            }
        }

        // 过滤品质
        const minMultiplier = this.getGradeConfig(minGrade).multiplier;
        seeds = seeds.filter(s => this.getGradeConfig(s.grade).multiplier >= minMultiplier);

        if (seeds.length === 0) return null;

        // 按稀有度权重随机
        let totalWeight = 0;
        seeds.forEach(seed => {
            const rarityWeight = {
                common: 60,
                rare: 25,
                epic: 10,
                legendary: 4,
                mythic: 1
            };
            totalWeight += rarityWeight[seed.rarity] || 10;
        });

        let random = Math.random() * totalWeight;
        for (const seed of seeds) {
            const rarityWeight = {
                common: 60,
                rare: 25,
                epic: 10,
                legendary: 4,
                mythic: 1
            };
            const weight = rarityWeight[seed.rarity] || 10;
            random -= weight;
            if (random <= 0) {
                return seed.id;
            }
        }

        return seeds[0].id;
    },
};
