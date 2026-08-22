/**
 * 战斗系统 - 奖励计算模块
 * 
 * 从battle.js拆分出的独立奖励计算模块
 * 包含：计算战斗奖励（calculateRewards）
 */

export function calculateRewards() {
        const rewards = {
            exp: 0,
            gold: 0,
            items: [],
            levelUps: []
        };

        // 狩猎战模式：妖魔逃跑了，只有一半奖励
        if (this.battleOptions.mode === 'hunt' && this.huntFled) {
            rewards.exp = Math.floor((this.enemy.expReward || 0) * 0.5);
            rewards.gold = Math.floor((this.enemy.goldReward || 0) * 0.5);
            rewards.huntFled = true;
            return rewards;
        }

        // 基础经验和金币
        rewards.exp = this.enemy.expReward || 0;
        rewards.gold = this.enemy.goldReward || 0;
        
        // 等级差调整：防止刷低级怪，鼓励越级挑战
        const levelDiff = this.enemy.level - Player.level;
        let expMultiplier = 1.0;
        let goldMultiplier = 1.0;
        
        if (levelDiff < -5) {
            // 低5级以上：经验只有10%
            expMultiplier = 0.1;
            goldMultiplier = 0.3;
            rewards.lowLevelPenalty = true;
        } else if (levelDiff < -3) {
            // 低3-5级：经验减半
            expMultiplier = 0.5;
            goldMultiplier = 0.6;
            rewards.lowLevelPenalty = true;
        } else if (levelDiff > 0) {
            // 越级挑战：经验加成
            if (levelDiff >= 3) {
                expMultiplier = 2.0;
                goldMultiplier = 1.5;
            } else if (levelDiff >= 2) {
                expMultiplier = 1.5;
                goldMultiplier = 1.3;
            } else {
                expMultiplier = 1.2;
                goldMultiplier = 1.1;
            }
            rewards.overlevelBonus = true;
        }
        
        rewards.exp = Math.floor(rewards.exp * expMultiplier);
        rewards.gold = Math.floor(rewards.gold * goldMultiplier);
        
        // 战斗评价加成
        if (this.rating) {
            let bonusRate = 0;
            switch (this.rating.level) {
                case 'S': bonusRate = 0.5; break;  // S级 +50%
                case 'A': bonusRate = 0.3; break;  // A级 +30%
                case 'B': bonusRate = 0.15; break; // B级 +15%
                case 'C': bonusRate = 0.05; break; // C级 +5%
                default: bonusRate = 0;
            }
            
            if (bonusRate > 0) {
                rewards.exp = Math.floor(rewards.exp * (1 + bonusRate));
                rewards.gold = Math.floor(rewards.gold * (1 + bonusRate));
                rewards.ratingBonus = bonusRate;
            }
        }

        // 随机浮动 ±20%
        rewards.exp = Math.floor(rewards.exp * (0.8 + Math.random() * 0.4));
        rewards.gold = Math.floor(rewards.gold * (0.8 + Math.random() * 0.4));

        // 金币暴击：10%概率获得2倍金币
        if (Math.random() < 0.1) {
            rewards.gold = rewards.gold * 2;
            rewards.goldCrit = true;
        }

        // 掉落物品
        if (this.enemy.dropItems) {
            this.enemy.dropItems.forEach(drop => {
                if (Math.random() < drop.chance) {
                    const count = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
                    Inventory.addItem(drop.itemId, count);
                    const item = Inventory.getItem(drop.itemId);
                    rewards.items.push({
                        itemId: drop.itemId,
                        name: item?.name || drop.itemId,
                        count: count
                    });
                }
            });
        }

        // 精英怪额外奖励
        if (this.enemy.isElite) {
            rewards.exp = Math.floor(rewards.exp * 1.5);
            rewards.gold = Math.floor(rewards.gold * 1.5);
        }

        // 残魄/精魄掉落（小泥鳅坠自动收集）
        if (typeof SoulSystem !== 'undefined' && typeof Player !== 'undefined') {
            const soulResult = SoulSystem.collectSoulOnKill(Player, this.enemy);
            if (soulResult.collected) {
                this.addLog(soulResult.message, 'buff');
            }
        }

        // 应用奖励（各系独立经验：使用过的系获全额，其他系获30%）
        const usedElementArray = Array.from(this.usedElements || []);
        // v0.99.1: 猎魔战斗奖励递减（每日次数）
        let huntEff = 1.0;
        if (this.source === 'hunt' && typeof Player.getHuntEfficiency === 'function') {
            huntEff = Player.getHuntEfficiency();
            if (huntEff < 1.0) {
                rewards.exp = Math.floor(rewards.exp * huntEff);
                rewards.gold = Math.floor(rewards.gold * huntEff);
                rewards.huntEfficiency = huntEff;
            }
        }
        const expResult = Player.gainExp(rewards.exp, usedElementArray);
        Player.gainGold(rewards.gold);
        rewards.levelUps = expResult.levelUps;
        rewards.newSkills = expResult.newSkills;

        // v0.39.0: 战斗胜利获得影响力（精英怪/强敌更多）
        if (typeof Player !== 'undefined') {
            let battleInfluence = 1;
            if (this.enemy.isElite) battleInfluence = 3;
            if (this.enemy.isBoss) battleInfluence = 5;
            // 敌人等级高于玩家时额外影响力
            if (this.enemy.level > Player.level) battleInfluence += Math.min(3, this.enemy.level - Player.level);
            Player.gainInfluence(battleInfluence, '战斗胜利');
            rewards.influence = battleInfluence;
        }

        // 天赋经验：击杀敌人增加主系天赋经验
        if (typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined' && Player.elements && Player.elements.length > 0) {
            const mainElement = Player.elements[0];
            const enemyLevel = this.enemy.level || 1;
            const talentExp = Math.floor(5 + enemyLevel * 2); // 基础5点 + 等级×2
            const talentResult = Player.addElementTalentExp(mainElement, talentExp);
            if (talentResult.leveledUp) {
                this.addLog(`🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！`, 'buff');
                if (talentResult.evolutions && talentResult.evolutions.length > 0) {
                    for (const evo of talentResult.evolutions) {
                        this.addLog(`✨ 进化！【${evo.stage}】${evo.name}：${evo.description}`, 'evolution');
                    }
                }
            }
        }

        // 召唤兽经验：如果召唤兽参与战斗，获得30%的玩家经验
        if (this.summon && Player.summonData) {
            const summonExp = Math.floor(rewards.exp * 0.3);
            if (summonExp > 0) {
                const summonLevelUp = this.gainSummonExp(summonExp);
                if (summonLevelUp) {
                    this.addLog(`🎉 ${Player.summonData.name}升级了！当前Lv.${Player.summonData.level}`, 'buff');
                }
            }
        }

        // 更新任务进度
        const completedQuests = QuestSystem.updateProgress('kill', this.enemy.id, 1);

        this.addLog(`获得 ${rewards.exp} 经验，${rewards.gold} 金币${rewards.goldCrit ? ' 💰金币暴击！' : ''}${rewards.huntEfficiency ? ` ⚠️猎魔效率${Math.floor(rewards.huntEfficiency*100)}%（今日第${Player.dailyActions?.hunt || 0}次）` : ''}`, 'system');
        if (rewards.items.length > 0) {
            rewards.items.forEach(item => {
                this.addLog(`获得 ${item.name} x${item.count}`, 'system');
            });
        }
        if (expResult.levelUps.length > 0) {
            this.addLog(`🎉 升级了！当前等级 ${Player.level}，获得属性点（可分配：${Player.attributePoints}）`, 'system');
            // 天生天赋进化提示
            if (Player._innateTalentEvolved) {
                const talentData = typeof DataInnateTalents !== 'undefined' ? DataInnateTalents[Player.innateTalent] : null;
                const talentName = talentData?.name || '天生天赋';
                this.addLog(`✨ ${talentName} 进化到 Lv.${Player.innateTalentLevel}！效果增强！`, 'system');
                Player._innateTalentEvolved = false;
            }
        }
        if (expResult.canAwaken) {
            this.addLog(`✨ 你已达到觉醒条件！可以在角色面板觉醒新的元素系`, 'system');
        }
        if (expResult.newSkills.length > 0) {
            expResult.newSkills.forEach(skillId => {
                const skill = SkillSystem.getSkill(skillId);
                if (skill) {
                    this.addLog(`✨ 学会了新技能：${skill.name}！`, 'system');
                }
            });
        }

        // 显示任务完成奖励
        if (completedQuests && completedQuests.length > 0) {
            completedQuests.forEach(q => {
                this.addLog(`🎉 ${q.message}`, 'system');
                if (q.rewards) {
                    q.rewards.forEach(r => this.addLog(r, 'system'));
                }
            });
        }

        this.rewards = rewards;
        return rewards;
    }


// 导出模块集合
export const BattleRewards = {
    calculateRewards
};

export default BattleRewards;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleRewards = BattleRewards;
}