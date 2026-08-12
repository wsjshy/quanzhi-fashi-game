/**
 * 境界突破系统
 * 初阶 → 中阶 → 高阶 → 超阶
 * 达到条件后可以突破，获得大幅属性提升和新能力
 */

const RealmSystem = {
    // 境界定义
    REALMS: {
        initial: {
            id: 'initial',
            name: '初阶',
            description: '魔法学徒，星尘级',
            level: 0,
            statBonus: {
                maxHp: 0,
                maxMp: 0,
                attack: 0,
                defense: 0,
                speed: 0,
                spirit: 0
            },
            unlocks: []
        },
        middle: {
            id: 'middle',
            name: '中阶',
            description: '正式魔法师，星云级',
            level: 1,
            statBonus: {
                maxHp: 0.3,  // +30%
                maxMp: 0.5,  // +50%
                attack: 0.2, // +20%
                defense: 0.2, // +20%
                speed: 0.1,  // +10%
                spirit: 0.3  // +30%
            },
            unlocks: [
                'middle_magic',      // 中阶魔法
                'second_awaken',     // 第二次觉醒
                'mind_sense',        // 意念感知
                'aura_detection'     // 气息感知
            ]
        },
        high: {
            id: 'high',
            name: '高阶',
            description: '高级魔法师，星河级',
            level: 2,
            statBonus: {
                maxHp: 0.6,  // +60%
                maxMp: 1.0,  // +100%
                attack: 0.5, // +50%
                defense: 0.5, // +50%
                speed: 0.3,  // +30%
                spirit: 0.6  // +60%
            },
            unlocks: [
                'high_magic',        // 高阶魔法
                'third_awaken',      // 第三次觉醒
                'flight',            // 飞行（风之翼）
                'domain'             // 领域
            ]
        },
        super: {
            id: 'super',
            name: '超阶',
            description: '超级魔法师，星海级',
            level: 3,
            statBonus: {
                maxHp: 1.0,  // +100%
                maxMp: 2.0,  // +200%
                attack: 1.0, // +100%
                defense: 1.0, // +100%
                speed: 0.5,  // +50%
                spirit: 1.0  // +100%
            },
            unlocks: [
                'super_magic',       // 超阶魔法
                'fourth_awaken',     // 第四次觉醒
                'teleportation'      // 空间传送
            ]
        }
    },

    // 突破条件
    BREAKTHROUGH_REQUIREMENTS: {
        initial_to_middle: {
            fromRealm: 'initial',
            toRealm: 'middle',
            requiredLevel: 7,
            requiredItems: [
                // { itemId: 'earth_spring', amount: 1 }  // 地圣泉
            ],
            baseSuccessRate: 0.7,  // 基础成功率70%
            description: '初阶突破到中阶，需要等级7级'
        },
        middle_to_high: {
            fromRealm: 'middle',
            toRealm: 'high',
            requiredLevel: 14,
            requiredItems: [],
            baseSuccessRate: 0.5,  // 基础成功率50%
            description: '中阶突破到高阶，需要等级14级'
        },
        high_to_super: {
            fromRealm: 'high',
            toRealm: 'super',
            requiredLevel: 25,
            requiredItems: [],
            baseSuccessRate: 0.3,  // 基础成功率30%
            description: '高阶突破到超阶，需要等级25级'
        }
    },

    /**
     * 获取当前境界数据
     * @param {string} realmId - 境界ID
     * @returns {object} 境界数据
     */
    getRealm(realmId) {
        return this.REALMS[realmId] || this.REALMS.initial;
    },

    /**
     * 获取下一个境界
     * @param {string} currentRealm - 当前境界ID
     * @returns {object|null} 下一个境界数据
     */
    getNextRealm(currentRealm) {
        const realmOrder = ['initial', 'middle', 'high', 'super'];
        const currentIndex = realmOrder.indexOf(currentRealm);
        if (currentIndex < 0 || currentIndex >= realmOrder.length - 1) {
            return null;
        }
        return this.REALMS[realmOrder[currentIndex + 1]];
    },

    /**
     * 获取突破条件
     * @param {string} currentRealm - 当前境界ID
     * @returns {object|null} 突破条件
     */
    getBreakthroughRequirements(currentRealm) {
        const key = `${currentRealm}_to_${this.getNextRealm(currentRealm)?.id}`;
        return this.BREAKTHROUGH_REQUIREMENTS[key] || null;
    },

    /**
     * 检查是否可以突破
     * @param {object} player - 玩家对象
     * @returns {object} { canBreakthrough: boolean, reason: string }
     */
    canBreakthrough(player) {
        const currentRealm = player.realm || 'initial';
        const nextRealm = this.getNextRealm(currentRealm);

        if (!nextRealm) {
            return { canBreakthrough: false, reason: '已达最高境界' };
        }

        const requirements = this.getBreakthroughRequirements(currentRealm);
        if (!requirements) {
            return { canBreakthrough: false, reason: '未知突破条件' };
        }

        // 检查等级
        if (player.level < requirements.requiredLevel) {
            return {
                canBreakthrough: false,
                reason: `等级不足，需要 ${requirements.requiredLevel} 级`
            };
        }

        // 检查道具（暂时跳过，因为还没有突破道具）
        // if (requirements.requiredItems && requirements.requiredItems.length > 0) {
        //     for (const item of requirements.requiredItems) {
        //         if (!Inventory.hasItem(item.itemId, item.amount)) {
        //             return {
        //                 canBreakthrough: false,
        //                 reason: `缺少道具：${item.itemId} x${item.amount}`
        //             };
        //         }
        //     }
        // }

        return { canBreakthrough: true, reason: '可以突破' };
    },

    /**
     * 计算突破成功率
     * @param {object} player - 玩家对象
     * @returns {number} 成功率（0-1）
     */
    calculateSuccessRate(player) {
        const currentRealm = player.realm || 'initial';
        const requirements = this.getBreakthroughRequirements(currentRealm);

        if (!requirements) return 0;

        let successRate = requirements.baseSuccessRate;

        // 天赋加成（天生天赋可以提升成功率）
        // if (player.talents && player.talents...) {
        //     successRate += 0.1;
        // }

        // 道具加成（突破丹等）
        // successRate += itemBonus;

        // 小泥鳅坠加成（成长型星尘魔器）
        if (player.starDustArtifacts && player.starDustArtifacts.all) {
            const artifactData = player.starDustArtifacts.all;
            if (artifactData.id === 'little_loach') {
                const level = artifactData.level || 1;
                const loachBonus = Math.min(0.2, level * 0.02); // 每级+2%，最高+20%
                successRate += loachBonus;
            }
        }

        // 临时道具加成（地圣泉结晶等）
        if (player.tempBreakthroughBonus) {
            successRate += player.tempBreakthroughBonus;
        }

        // 等级越高，成功率越高
        const levelBonus = Math.min(0.2, (player.level - requirements.requiredLevel) * 0.02);
        successRate += levelBonus;

        return Math.min(1, Math.max(0, successRate));
    },

    /**
     * 执行突破
     * @param {object} player - 玩家对象
     * @returns {object} { success: boolean, newRealm: string, message: string }
     */
    breakthrough(player) {
        const checkResult = this.canBreakthrough(player);
        if (!checkResult.canBreakthrough) {
            return { success: false, newRealm: player.realm, message: checkResult.reason };
        }

        const currentRealm = player.realm || 'initial';
        const nextRealm = this.getNextRealm(currentRealm);

        if (!nextRealm) {
            return { success: false, newRealm: player.realm, message: '已达最高境界' };
        }

        // 计算成功率
        const successRate = this.calculateSuccessRate(player);
        const roll = Math.random();

        if (roll < successRate) {
            // 突破成功
            player.realm = nextRealm.id;

            // 应用属性加成（这里只记录境界，实际加成在getTotalStats中计算）
            // 为了简单，我们直接增加属性
            const bonus = nextRealm.statBonus;
            const prevRealm = this.getRealm(currentRealm);
            const prevBonus = prevRealm.statBonus;

            // 计算差值
            const hpBonus = Math.floor(player.maxHp * (bonus.maxHp - prevBonus.maxHp));
            const mpBonus = Math.floor(player.maxMp * (bonus.maxMp - prevBonus.maxMp));
            const atkBonus = Math.floor(player.attack * (bonus.attack - prevBonus.attack));
            const defBonus = Math.floor(player.defense * (bonus.defense - prevBonus.defense));
            const spdBonus = Math.floor(player.speed * (bonus.speed - prevBonus.speed));
            const spiBonus = Math.floor(player.spirit * (bonus.spirit - prevBonus.spirit));

            player.maxHp += hpBonus;
            player.maxMp += mpBonus;
            player.attack += atkBonus;
            player.defense += defBonus;
            player.speed += spdBonus;
            player.spirit += spiBonus;

            // 满血满蓝
            player.hp = player.maxHp;
            player.mp = player.maxMp;

            // 清除临时突破加成
            player.tempBreakthroughBonus = 0;

            // 解锁中阶魔法
            let unlockedSkills = [];
            if (nextRealm.id === 'middle') {
                const elementToSkill = {
                    fire: 'fire_fist',
                    thunder: 'thunder_praise',
                    ice: 'ice_lock',
                    earth: 'earth_wave',
                    wind: 'wind_wing',
                    water: 'water_tide',
                    light: 'light_blessing',
                    dark: 'dark_spike',
                    heal: 'heal_holy_light',
                    summon: 'summon_beast_empower'
                };
                player.elements.forEach(elem => {
                    const skillId = elementToSkill[elem];
                    if (skillId && !player.skills.includes(skillId)) {
                        player.skills.push(skillId);
                        unlockedSkills.push(skillId);
                    }
                });
            }

            return {
                success: true,
                newRealm: nextRealm.id,
                message: `突破成功！晋升${nextRealm.name}魔法师！`,
                statGains: {
                    maxHp: hpBonus,
                    maxMp: mpBonus,
                    attack: atkBonus,
                    defense: defBonus,
                    speed: spdBonus,
                    spirit: spiBonus
                },
                unlockedSkills: unlockedSkills
            };
        } else {
            // 突破失败
            return {
                success: false,
                newRealm: currentRealm,
                message: '突破失败...需要继续积累'
            };
        }
    },

    /**
     * 检查是否解锁了某能力
     * @param {object} player - 玩家对象
     * @param {string} unlockId - 解锁ID
     * @returns {boolean} 是否解锁
     */
    hasUnlock(player, unlockId) {
        const realm = this.getRealm(player.realm || 'initial');
        return realm.unlocks.includes(unlockId);
    }
};

// 导出（用于Node.js环境测试）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealmSystem;
}
