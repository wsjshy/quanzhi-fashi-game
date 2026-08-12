/**
 * 战斗系统
 * 贴近原著设计：星子引导、元素克制、精神力、打断机制
 */

const BattleSystem = {
    // 战斗状态
    active: false,
    player: null,
    enemy: null,
    turn: 0,
    log: [],
    isPlayerTurn: true,
    
    // 引导中的魔法
    playerCasting: null,      // {skillId, progress, totalTime}
    enemyCasting: null,
    
    // 战斗结果
    result: null,  // 'win' | 'lose' | 'flee'
    
    // 战斗统计
    stats: {
        totalDamageDealt: 0,      // 造成的总伤害
        totalDamageTaken: 0,      // 受到的总伤害
        totalHealingDone: 0,      // 造成的总治疗
        skillsUsed: 0,            // 使用的技能数
        itemsUsed: 0,             // 使用的道具数
        critCount: 0,             // 暴击次数
        missCount: 0,             // 未命中次数
        interruptCount: 0,        // 打断次数
        maxHpPercent: 1.0,        // 最低血量百分比
        turnCount: 0              // 回合数
    },
    
    // 战斗评价
    rating: null,  // S/A/B/C/D
    
    // 战斗速度（1x, 2x, 4x）
    speed: 1,
    
    // 速度档位
    speedLevels: [1, 2, 4],
    currentSpeedIndex: 0,
    
    // 元素克制关系（小说设定）
    // 火克冰、冰克风、风克土、土克雷、雷克水、水克火
    // 光暗互克
    ELEMENT_COUNTER: {
        fire: 'ice',      // 火克冰
        ice: 'wind',      // 冰克风
        wind: 'earth',    // 风克土
        earth: 'thunder', // 土克雷
        thunder: 'water', // 雷克水
        water: 'fire',    // 水克火
        light: 'dark',    // 光克暗
        dark: 'light'     // 暗克光
    },
    
    // 元素中文名
    ELEMENT_NAMES: {
        fire: '火系',
        ice: '冰系',
        wind: '风系',
        earth: '土系',
        thunder: '雷系',
        water: '水系',
        light: '光系',
        dark: '暗影系'
    },
    
    /**
     * 切换战斗速度
     */
    toggleSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speedLevels.length;
        this.speed = this.speedLevels[this.currentSpeedIndex];
        this.addLog(`战斗速度切换为 ${this.speed}x`, 'system');
        if (typeof UI !== 'undefined' && UI.updateBattleScreen) {
            UI.updateBattleScreen();
        }
    },
    
    /**
     * 显示战斗帮助
     */
    showHelp() {
        const helpHtml = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            " onclick="if(event.target === this) BattleSystem.closeHelp()">
                <div style="
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 2px solid #4a4a8a;
                    border-radius: 16px;
                    padding: 24px;
                    overflow-y: auto;
                    color: #fff;
                ">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #ffd700; margin: 0; font-size: 24px;">⚔️ 战斗帮助</h2>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">📋 基本规则</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li>回合制战斗，速度高的先行动</li>
                            <li>HP降为0则战斗失败</li>
                            <li>使用魔法需要消耗MP</li>
                            <li>高阶魔法需要引导多回合</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">🎮 行动选项</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li><b style="color: #ffaa66;">普通攻击</b>：无消耗，基础物理伤害</li>
                            <li><b style="color: #66aaff;">释放魔法</b>：消耗MP，伤害/治疗/buff/debuff</li>
                            <li><b style="color: #66ff66;">防御</b>：防御力翻倍，受到伤害减半</li>
                            <li><b style="color: #ffcc66;">使用道具</b>：消耗道具，恢复/解除状态/增益</li>
                            <li><b style="color: #ff6666;">逃跑</b>：有概率逃离战斗</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">⚡ 元素克制</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">克制关系：造成150%伤害，被克制只造成70%伤害</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <span style="padding: 4px 8px; background: #ff664422; border-radius: 4px;">🔥火 → ❄️冰</span>
                                <span style="padding: 4px 8px; background: #66aaff22; border-radius: 4px;">❄️冰 → 💨风</span>
                                <span style="padding: 4px 8px; background: #88ffcc22; border-radius: 4px;">💨风 → 🪨土</span>
                                <span style="padding: 4px 8px; background: #aa884422; border-radius: 4px;">🪨土 → ⚡雷</span>
                                <span style="padding: 4px 8px; background: #ffdd4422; border-radius: 4px;">⚡雷 → 💧水</span>
                                <span style="padding: 4px 8px; background: #66bbff22; border-radius: 4px;">💧水 → 🔥火</span>
                                <span style="padding: 4px 8px; background: #ffffcc22; border-radius: 4px;">✨光 ↔ 🌑暗</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">💡 战斗技巧</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li>利用元素克制可以大幅提高伤害</li>
                            <li>防御可以在危险时减少伤害</li>
                            <li>打断敌人引导可以避免高额伤害</li>
                            <li>妖魔有独特的种族天赋，注意观察</li>
                            <li>右上角可以调整战斗速度</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="BattleSystem.closeHelp()" style="
                            padding: 10px 30px;
                            background: linear-gradient(135deg, #4444aa, #6666cc);
                            border: 2px solid #8888ee;
                            border-radius: 8px;
                            color: #fff;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                        ">
                            我知道了
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const helpDiv = document.createElement('div');
        helpDiv.id = 'battle-help-overlay';
        helpDiv.innerHTML = helpHtml;
        document.body.appendChild(helpDiv);
    },
    
    /**
     * 关闭战斗帮助
     */
    closeHelp() {
        const helpDiv = document.getElementById('battle-help-overlay');
        if (helpDiv) {
            helpDiv.remove();
        }
    },
    
    /**
     * 获取延迟时间（根据速度调整）
     */
    getDelay(baseDelay) {
        return Math.floor(baseDelay / this.speed);
    },
    
    /**
     * 显示浮动伤害数字
     */
    showDamageNumber(target, amount, type = 'normal') {
        if (typeof UI === 'undefined' || !UI.showDamageNumber) return;
        
        const isPlayer = target === 'player';
        UI.showDamageNumber(amount, type, isPlayer);
    },

    /**
     * 开始战斗
     */
    startBattle(enemyData) {
        this.active = true;
        this.turn = 1;
        this.log = [];
        this.result = null;
        this.playerCasting = null;
        this.enemyCasting = null;
        this.isPlayerTurn = true;
        this.summon = null;  // 召唤兽状态
        this.tookDamage = false;  // 战斗中是否受到伤害（用于毫发无伤成就）
        this.consecutiveCrits = 0;  // 连续暴击次数（用于幸运儿成就）
        this.rating = null;  // 战斗评价
        
        // 发布战斗开始事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.BATTLE_START, {
                enemy: enemyData,
                turn: this.turn
            });
        }
        
        // 重置战斗统计
        this.stats = {
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            totalHealingDone: 0,
            skillsUsed: 0,
            itemsUsed: 0,
            critCount: 0,
            missCount: 0,
            interruptCount: 0,
            maxHpPercent: 1.0,
            turnCount: 0
        };
        
        // 记录最后战斗日期（用于和平主义者成就）
        if (typeof Player !== 'undefined') {
            Player.lastBattleDay = Player.day;
        }

        // 复制敌人数据，避免修改原数据
        this.enemy = JSON.parse(JSON.stringify(enemyData));
        this.enemy.hp = this.enemy.maxHp;
        this.enemy.mp = this.enemy.maxMp || 50;
        this.enemy.buffs = [];
        this.enemy.statusEffects = [];
        this.enemy.isDefending = false;
        
        // 初始化精神力
        if (!this.enemy.spirit) {
            const level = this.enemy.level || 1;
            // 基础精神力：等级 * 3 + 10
            let baseSpirit = level * 3 + 10;
            // 魔法师类型精神力更高
            if (this.enemy.enemyType === 'mage' || this.enemy.isHuman) {
                baseSpirit = Math.floor(baseSpirit * 1.5);
            }
            // 战将级以上精神力更高
            if (this.enemy.demonTier === 'warrior' || this.enemy.rank === '战将级') {
                baseSpirit = Math.floor(baseSpirit * 1.3);
            }
            if (this.enemy.demonTier === 'commander' || this.enemy.rank === '统领级') {
                baseSpirit = Math.floor(baseSpirit * 1.5);
            }
            this.enemy.spirit = baseSpirit;
        }
        
        // 初始化妖魔天赋
        this.enemy.traits = [];
        this.enemy.traitBonuses = null;
        this.enemy.firstAttackDone = false; // 首次攻击标记
        if (this.enemy.enemyType === 'demon' && typeof DemonTraits !== 'undefined') {
            const traits = DemonTraits.getTraits(this.enemy.id);
            if (traits && traits.length > 0) {
                this.enemy.traits = traits;
                this.enemy.traitBonuses = DemonTraits.calculatePassiveBonuses(traits);
                
                // 应用天赋加成到属性
                const bonuses = this.enemy.traitBonuses;
                if (bonuses.attackBonus) this.enemy.attack = Math.floor(this.enemy.attack * (1 + bonuses.attackBonus));
                if (bonuses.defenseBonus) this.enemy.defense = Math.floor(this.enemy.defense * (1 + bonuses.defenseBonus));
                if (bonuses.speedBonus) this.enemy.speed = Math.floor(this.enemy.speed * (1 + bonuses.speedBonus));
                if (bonuses.hpBonus) {
                    this.enemy.maxHp = Math.floor(this.enemy.maxHp * (1 + bonuses.hpBonus));
                    this.enemy.hp = this.enemy.maxHp;
                }
                
                this.addLog(`${this.enemy.name} 的种族天赋：${traits.map(t => t.name).join('、')}`, 'system');
            }
        }

        // 玩家战斗状态
        this.player = {
            name: Player.name,
            level: Player.level,
            maxHp: Player.getTotalStats().maxHp,
            hp: Player.hp,
            maxMp: Player.getTotalStats().maxMp,
            mp: Player.mp,
            attack: Player.getTotalStats().attack,
            defense: Player.getTotalStats().defense,
            speed: Player.getTotalStats().speed,
            spirit: Player.spirit,
            critRate: Player.getTotalStats().critRate,
            hitRate: Player.getTotalStats().hitRate,
            elements: Player.elements,
            skills: Player.skills,
            buffs: [],
            statusEffects: [],
            isDefending: false
        };

        this.addLog(`遭遇了 ${this.enemy.name}！`, 'system');
        
        // 先手判定：速度高的先行动
        if (this.enemy.speed > this.player.speed) {
            this.isPlayerTurn = false;
            this.addLog(`${this.enemy.name} 速度更快，抢先出手！`, 'system');
            // 延迟执行敌人回合
            setTimeout(() => this.enemyTurn(), this.getDelay(1000));
        } else {
            this.addLog('你的速度更快，可以先行动。', 'system');
        }
        
        // 新手引导：第一次战斗自动显示帮助
        const tutorialDone = localStorage.getItem('quanzhi_fashi_battle_tutorial_done');
        if (!tutorialDone && this.isPlayerTurn) {
            // 延迟一会儿显示，让玩家先看到战斗界面
            setTimeout(() => {
                this.showHelp();
                localStorage.setItem('quanzhi_fashi_battle_tutorial_done', '1');
            }, 500);
        }

        return {
            player: this.player,
            enemy: this.enemy,
            isPlayerTurn: this.isPlayerTurn
        };
    },

    /**
     * 玩家行动：普通攻击
     */
    playerAttack() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = false;

        // 计算伤害（含攻击者状态修正）
        const attackerMods = this.getStatusModifiers(this.player);
        const damage = this.calculateDamage(
            this.player.attack + attackerMods.attackMod,
            this.enemy.defense * (this.enemy.isDefending ? 2 : 1), // 防御时防御翻倍
            1.0,
            this.player.critRate,
            this.player.hitRate,
            'physical',
            null,
            this.enemy,
            this.player
        );
        
        // 防御减伤
        if (this.enemy.isDefending) {
            damage.amount = Math.floor(damage.amount * 0.5);
        }

        // 应用伤害
        this.applyDamage(this.enemy, damage);
        
        // 连续暴击记录（用于幸运儿成就）
        if (damage.isCrit) {
            this.consecutiveCrits++;
            if (this.consecutiveCrits >= 3 && typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                if (!WorldState.hasAchievement('lucky_dog')) {
                    const achData = DataAchievements['lucky_dog'];
                    if (achData) {
                        WorldState.unlockAchievement('lucky_dog', achData);
                    }
                }
            }
        } else {
            this.consecutiveCrits = 0;
        }
        
        this.addLog(`你发动了普通攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, damage.isCrit ? 'crit' : 'damage');
        
        // 显示浮动伤害数字
        if (!damage.isMiss) {
            const dmgType = damage.isCrit ? 'crit' : 'normal';
            this.showDamageNumber('enemy', damage.amount, dmgType);
        }

        // 检查是否打断敌人引导（精神力对抗）
        if (this.enemyCasting && !damage.isMiss) {
            // 基础打断概率20%，精神力差每1点增减0.5%，最低10%，最高60%
            const playerSpirit = this.player.spirit || 30;
            const enemySpirit = this.enemy.spirit || 20;
            let interruptChance = 0.2 + (playerSpirit - enemySpirit) * 0.005;
            interruptChance = Math.max(0.1, Math.min(0.6, interruptChance));
            
            if (Math.random() < interruptChance) {
                this.addLog(`打断了 ${this.enemy.name} 的魔法引导！`, 'system');
                this.enemyCasting = null;
                
                // 发布打断事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.INTERRUPT, {
                        attacker: 'player',
                        target: 'enemy',
                        skill: this.enemyCasting?.skill
                    });
                }
            }
        }
        
        // 发布玩家攻击事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.PLAYER_ATTACK, {
                damage: damage.amount,
                isCrit: damage.isCrit,
                isMiss: damage.isMiss,
                damageType: 'physical'
            });
            
            // 发布更细粒度的事件
            if (damage.isMiss) {
                BattleEventBus.emit(BattleEvents.MISS, {
                    attacker: 'player',
                    target: 'enemy',
                    damageType: 'physical'
                });
            } else {
                BattleEventBus.emit(BattleEvents.HIT, {
                    attacker: 'player',
                    target: 'enemy',
                    damage: damage.amount,
                    isCrit: damage.isCrit,
                    damageType: 'physical'
                });
                
                if (damage.isCrit) {
                    BattleEventBus.emit(BattleEvents.CRIT, {
                        attacker: 'player',
                        target: 'enemy',
                        damage: damage.amount,
                        damageType: 'physical'
                    });
                }
                
                BattleEventBus.emit(BattleEvents.DAMAGE, {
                    target: 'enemy',
                    attacker: 'player',
                    damage: damage.amount,
                    isCrit: damage.isCrit,
                    damageType: 'physical'
                });
            }
        }

        this.endPlayerTurn();
        return damage;
    },

    /**
     * 玩家行动：释放魔法
     */
    playerCastSkill(skillId) {
        if (!this.active || !this.isPlayerTurn) return null;

        const skill = SkillSystem.getSkill(skillId);
        if (!skill) return null;

        // 检查MP
        if (this.player.mp < skill.mpCost) {
            this.addLog('魔法值不足！', 'system');
            return null;
        }

        // 检查是否需要召唤兽
        if (skill.requiresSummon && !this.summon) {
            this.addLog('当前没有召唤兽，无法使用此技能！', 'system');
            return null;
        }

        this.player.isDefending = false;

        // 计算引导时间（精神力越高越快，精神力100时引导时间减半）
        const baseCastTime = this.getCastTime(skill.tier);
        const spirit = this.player.spirit || 30;
        const castTime = Math.max(1, Math.floor(baseCastTime * (100 - spirit * 0.5) / 100));

        // 如果引导时间为0（瞬发），直接释放
        if (castTime <= 1 || skill.type === 'buff' || skill.targetType === 'self') {
            return this.castSkillImmediate(skill, 'player');
        }

        // 开始引导
        this.playerCasting = {
            skillId: skillId,
            skill: skill,
            progress: 1,
            totalTime: castTime
        };

        this.player.mp -= skill.mpCost;
        this.addLog(`你开始引导 ${skill.name}...（${castTime} 回合后释放）`, 'magic');
        
        // 发布技能引导事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.SKILL_CHANNEL, {
                caster: 'player',
                skill: skill,
                totalTime: castTime
            });
        }

        this.endPlayerTurn();
        return { casting: true, castTime: castTime };
    },

    /**
     * 瞬发技能（直接生效）
     */
    castSkillImmediate(skill, caster, skipTurnEnd = false) {
        const isPlayer = caster === 'player';
        const casterData = isPlayer ? this.player : this.enemy;
        const targetData = isPlayer ? this.enemy : this.player;

        // 消耗MP
        casterData.mp -= skill.mpCost;
        
        // 发布技能释放事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.SKILL_CAST, {
                skill: skill,
                caster: caster,
                isPlayer: isPlayer,
                casterData: casterData
            });
        }

        if (skill.type === 'damage') {
            // 伤害技能（含攻击者状态修正）
            const casterMods = this.getStatusModifiers(casterData);
            const effectiveAttack = casterData.attack + casterMods.attackMod;
            const baseDamage = skill.baseDamage + effectiveAttack * (skill.damageMultiplier || 1.0);
            
            // 精神力加成
            const spirit = casterData.spirit || 10;
            const spiritBonus = 1 + spirit * 0.005;
            
            // 元素克制
            const elementBonus = this.getElementBonus(skill.element, targetData.elements?.[0] || 'neutral');
            
            // 天赋加成（仅玩家）
            let talentBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
                const talentEffects = Player.getElementTalentEffects(skill.element);
                if (talentEffects.damageBonus) {
                    talentBonus = 1 + talentEffects.damageBonus;
                }
            }

            // 灵种加成（仅玩家）
            let seedBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && typeof SpiritSeedSystem !== 'undefined') {
                const seedEffects = Player.getElementSpiritSeedEffects(skill.element);
                if (seedEffects.damageBonus) {
                    seedBonus = 1 + seedEffects.damageBonus;
                }
            }

            // 技能等级加成（仅玩家）
            let skillLevelBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && typeof SkillLevelSystem !== 'undefined') {
                skillLevelBonus = Player.getSkillDamageBonus(skill.id);
            }

            const damage = this.calculateDamage(
                baseDamage * spiritBonus * elementBonus * talentBonus * seedBonus * skillLevelBonus,
                targetData.defense,
                1.0,
                casterData.critRate || 0.05,
                skill.hitRate || 0.9,
                skill.element,
                targetData.elements?.[0] || 'neutral',
                targetData,
                casterData
            );

            this.applyDamage(targetData, damage);
            
            // 连续暴击记录（仅玩家，用于幸运儿成就）
            if (isPlayer && typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                if (damage.isCrit) {
                    this.consecutiveCrits++;
                    if (this.consecutiveCrits >= 3 && !WorldState.hasAchievement('lucky_dog')) {
                        const achData = DataAchievements['lucky_dog'];
                        if (achData) {
                            WorldState.unlockAchievement('lucky_dog', achData);
                        }
                    }
                } else {
                    this.consecutiveCrits = 0;
                }
            }
            
            const casterName = isPlayer ? '你' : this.enemy.name;
            
            // 元素克制效果显示
            let elementEffectText = '';
            if (damage.elementEffect === 'super') {
                elementEffectText = '（效果拔群！）';
            } else if (damage.elementEffect === 'weak') {
                elementEffectText = '（效果不佳...）';
            } else if (damage.elementEffect === 'resist') {
                elementEffectText = '（被抵抗了）';
            }
            
            this.addLog(`${casterName} 释放了 ${skill.name}，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}${elementEffectText}`, 
                damage.isCrit ? 'crit' : 'magic');
            
            // 显示浮动伤害数字
            if (!damage.isMiss) {
                let dmgType = 'magic';
                if (damage.isCrit) dmgType = 'crit';
                else if (damage.elementEffect === 'super') dmgType = 'counter';
                else if (damage.elementEffect === 'weak') dmgType = 'weakness';
                
                const target = isPlayer ? 'enemy' : 'player';
                this.showDamageNumber(target, damage.amount, dmgType);
            }
            
            // 发布命中/暴击/闪避/伤害事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                const attacker = isPlayer ? 'player' : 'enemy';
                const target = isPlayer ? 'enemy' : 'player';
                
                if (damage.isMiss) {
                    BattleEventBus.emit(BattleEvents.MISS, {
                        attacker: attacker,
                        target: target,
                        damageType: 'magic',
                        element: skill.element,
                        skill: skill
                    });
                } else {
                    BattleEventBus.emit(BattleEvents.HIT, {
                        attacker: attacker,
                        target: target,
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'magic',
                        element: skill.element,
                        skill: skill,
                        elementEffect: damage.elementEffect
                    });
                    
                    if (damage.isCrit) {
                        BattleEventBus.emit(BattleEvents.CRIT, {
                            attacker: attacker,
                            target: target,
                            damage: damage.amount,
                            damageType: 'magic',
                            element: skill.element,
                            skill: skill
                        });
                    }
                    
                    BattleEventBus.emit(BattleEvents.DAMAGE, {
                        target: target,
                        attacker: attacker,
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'magic',
                        element: skill.element,
                        skill: skill
                    });
                }
            }

            // 状态效果
            if (skill.statusEffects && !damage.isMiss) {
                this.applyStatusEffects(targetData, skill.statusEffects, isPlayer);
            }
            
            // 灵种特殊效果（仅玩家）
            if (isPlayer && typeof Player !== 'undefined' && typeof SpiritSeedSystem !== 'undefined' && !damage.isMiss) {
                this.applySpiritSeedEffects(targetData, skill.element);
            }

        } else if (skill.type === 'heal') {
            // 治疗技能
            const healAmount = Math.floor(skill.baseHeal * (1 + casterData.spirit * 0.01));
            // 治疗目标：self类型治疗自己，否则治疗targetData
            const healTarget = (skill.targetType === 'self') ? casterData : targetData;
            healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + healAmount);

            // 治疗技能的附加状态效果（如净化、复苏）
            if (skill.statusEffects) {
                this.applyStatusEffects(healTarget, skill.statusEffects, !isPlayer);
            }

            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = skill.targetType === 'self' ? casterName : (isPlayer ? this.enemy.name : '你');
            this.addLog(`${casterName} 使用 ${skill.name}，${targetName} 恢复了 ${healAmount} 点生命`, 'heal');
            
            // 发布治疗事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.HEAL, {
                    amount: healAmount,
                    skill: skill,
                    caster: caster,
                    isPlayer: isPlayer,
                    targetIsSelf: skill.targetType === 'self'
                });
            }

        } else if (skill.type === 'buff') {
            // 增益技能
            if (skill.statusEffects) {
                if (skill.element === 'summon' && isPlayer && this.summon) {
                    // 召唤系增益应用到召唤兽
                    this.applyStatusEffects(this.summon, skill.statusEffects, !isPlayer);
                    this.addLog(`${this.summon.icon} ${this.summon.name} 受到了 ${skill.name} 的效果！`, 'buff');
                } else {
                    this.applyStatusEffects(casterData, skill.statusEffects, !isPlayer);
                }
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            if (skill.element !== 'summon') {
                this.addLog(`${casterName} 使用了 ${skill.name}`, 'buff');
            }

        } else if (skill.type === 'debuff') {
            // 减益技能（对敌人施加负面状态）
            if (skill.statusEffects) {
                this.applyStatusEffects(targetData, skill.statusEffects, isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = isPlayer ? this.enemy.name : '你';
            this.addLog(`${casterName} 对 ${targetName} 释放了 ${skill.name}`, 'debuff');

        } else if (skill.type === 'summon') {
            // 召唤技能
            if (isPlayer && skill.summonData) {
                if (this.summon) {
                    this.addLog(`已有召唤兽 ${this.summon.name}，先收回再召唤！`, 'system');
                    casterData.mp += skill.mpCost; // 退还MP
                    return { success: false };
                }
                this.summon = {
                    ...skill.summonData,
                    hp: skill.summonData.maxHp,
                    remainingDuration: skill.summonData.duration,
                    buffs: [],
                    statusEffects: []
                };
                this.addLog(`你召唤了 ${skill.summonData.icon} ${skill.summonData.name}！（持续${skill.summonData.duration}回合）`, 'magic');
                
                // 发布召唤事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.SUMMON, {
                        caster: 'player',
                        summon: this.summon,
                        skill: skill
                    });
                }
            }

        } else if (skill.type === 'special') {
            // 特殊技能（如召唤回收）
            if (isPlayer && skill.id === 'summon_return') {
                if (this.summon) {
                    const mpRecover = Math.floor(this.summon.hp * 0.5);
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRecover);
                    this.addLog(`你收回了 ${this.summon.name}，恢复了 ${mpRecover} 点魔法值`, 'magic');
                    this.summon = null;
                } else {
                    this.addLog('当前没有召唤兽！', 'system');
                    return { success: false };
                }
            }
        }

        // 天赋经验：玩家释放技能增加对应系天赋经验
        if (isPlayer && typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
            const talentExp = 3; // 每次释放技能获得3点天赋经验
            const talentResult = Player.addElementTalentExp(skill.element, talentExp);
            if (talentResult.leveledUp) {
                this.addLog(`🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！`, 'buff');
            }
        }

        // 技能经验：玩家释放技能增加技能经验
        if (isPlayer && typeof Player !== 'undefined' && typeof SkillLevelSystem !== 'undefined') {
            const skillExp = 5; // 每次释放技能获得5点技能经验
            const skillResult = Player.addSkillExp(skill.id, skillExp);
            if (skillResult.leveledUp) {
                this.addLog(`✨ 技能「${skillResult.skillName}」升级到 Lv.${skillResult.newLevel}！`, 'buff');
            }
        }

        if (!skipTurnEnd) {
            if (isPlayer) {
                this.endPlayerTurn();
            } else {
                this.endEnemyTurn();
            }
        }

        return { success: true };
    },

    /**
     * 玩家行动：防御
     */
    playerDefend() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = true;
        
        // 防御恢复少量MP
        const mpRecover = Math.floor(this.player.maxMp * 0.05);
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRecover);

        this.addLog(`你采取防御姿态，减少受到的伤害，并恢复了 ${mpRecover} 点魔法值`, 'system');
        
        // 发布防御事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.DEFEND, {
                caster: 'player',
                mpRecover: mpRecover
            });
        }

        this.endPlayerTurn();
        return { defend: true, mpRecover: mpRecover };
    },

    /**
     * 玩家行动：使用道具
     */
    playerUseItem(itemId) {
        if (!this.active || !this.isPlayerTurn) return null;

        const item = Inventory.getItem(itemId);
        if (!item) {
            this.addLog('物品不存在', 'system');
            return null;
        }

        const result = Inventory.useItem(itemId, true);
        if (!result.success) {
            this.addLog(result.message, 'system');
            return null;
        }

        // 同步玩家状态
        this.player.hp = Player.hp;
        this.player.mp = Player.mp;

        this.addLog(`你使用了 ${item.name}`, 'system');

        // 处理物品的状态效果
        if (item.statusEffects && item.statusEffects.length > 0) {
            if (item.effects && item.effects.damage) {
                // 伤害类道具：状态效果施加给敌人
                this.applyStatusEffects(this.enemy, item.statusEffects, false);
            } else {
                // 增益类道具：状态效果施加给玩家
                this.applyStatusEffects(this.player, item.statusEffects, true);
            }
        }

        // 处理伤害类道具（对敌人造成伤害）
        if (item.effects && item.effects.damage) {
            const dmg = this.calculateDamage(
                item.effects.damage,
                this.enemy.defense,
                1.0,
                0,
                1.0,
                item.element || 'neutral',
                this.enemy.elements?.[0] || 'neutral',
                this.enemy,
                this.player
            );
            this.applyDamage(this.enemy, dmg);
        }

        // 处理净化类道具
        if (item.effects && item.effects.cleanse) {
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze'];
            this.player.statusEffects = this.player.statusEffects.filter(e => !debuffTypes.includes(e.type));
            this.addLog('净化了所有负面状态！', 'buff');
        }

        this.endPlayerTurn();
        return result;
    },

    /**
     * 玩家行动：逃跑
     */
    playerFlee() {
        if (!this.active || !this.isPlayerTurn) return null;

        // 逃跑成功率：取决于双方速度差
        const speedDiff = this.player.speed - this.enemy.speed;
        const fleeChance = Math.min(0.9, Math.max(0.1, 0.5 + speedDiff * 0.02));
        const success = Math.random() < fleeChance;

        if (success) {
            this.addLog('你成功逃跑了！', 'system');
            this.result = 'flee';
            this.active = false;
        } else {
            this.addLog('逃跑失败！', 'system');
            this.endPlayerTurn();
        }
        
        // 发布逃跑事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.FLEE, {
                success: success,
                fleeChance: fleeChance,
                speedDiff: speedDiff
            });
        }
        
        return { success: success };
    },

    /**
     * 结束玩家回合
     */
    endPlayerTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) return;

        this.isPlayerTurn = false;
        this.enemy.isDefending = false; // 重置敌人防御状态
        
        // 处理玩家引导中的魔法
        if (this.playerCasting) {
            this.playerCasting.progress++;
            if (this.playerCasting.progress >= this.playerCasting.totalTime) {
                // 引导完成，释放魔法
                const skill = this.playerCasting.skill;
                this.playerCasting = null;
                this.addLog(`${skill.name} 引导完成！`, 'magic');
                
                // 发布技能完成事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.SKILL_COMPLETE, {
                        caster: 'player',
                        skill: skill
                    });
                }
                
                this.castSkillImmediate(skill, 'player', true);
                // 引导完成后继续执行后续逻辑（召唤兽攻击、敌人回合）
            }
        }

        // 召唤兽自动攻击
        if (this.summon && this.summon.hp > 0) {
            this.summonAttack();
            // 召唤兽攻击后检查战斗是否结束
            if (this.checkBattleEnd()) return;
        }

        // 敌人回合
        setTimeout(() => this.enemyTurn(), this.getDelay(800));
    },

    /**
     * 召唤兽攻击
     */
    summonAttack() {
        if (!this.summon || !this.enemy || this.enemy.hp <= 0) return;

        const summon = this.summon;
        
        // 计算召唤兽属性加成（强化/狂暴状态）
        let attackMultiplier = 1;
        let defenseMultiplier = 1;
        let speedMultiplier = 1;
        
        if (summon.statusEffects) {
            summon.statusEffects.forEach(effect => {
                if (effect.type === 'summon_buff') {
                    attackMultiplier += effect.attackBonus || 0;
                    defenseMultiplier += effect.defenseBonus || 0;
                } else if (effect.type === 'summon_rage') {
                    attackMultiplier += effect.attackBonus || 0;
                    speedMultiplier += effect.speedBonus || 0;
                    defenseMultiplier -= effect.defenseMalus || 0;
                }
            });
        }

        const effectiveAttack = Math.floor(summon.attack * attackMultiplier);
        const baseDamage = effectiveAttack;
        
        const damage = this.calculateDamage(
            baseDamage,
            this.enemy.defense,
            1.0,
            0.05,
            0.9,
            'neutral',
            this.enemy.elements?.[0] || 'neutral',
            this.enemy,
            summon
        );

        this.applyDamage(this.enemy, damage);
        this.addLog(`${summon.icon} ${summon.name} 发动攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 'magic');
    },

    /**
     * 敌人回合
     */
    enemyTurn() {
        if (!this.active || this.result) return;

        // 检查眩晕/冻结状态，跳过回合
        if (this.isStunned(this.enemy)) {
            const stunEffect = this.enemy.statusEffects.find(e => e.type === 'stun' || e.type === 'frozen');
            this.addLog(`${this.enemy.name} 被${stunEffect.name}，无法行动！`, 'system');
            this.endEnemyTurn();
            return;
        }

        // 处理敌人引导中的魔法
        if (this.enemyCasting) {
            this.enemyCasting.progress++;
            if (this.enemyCasting.progress >= this.enemyCasting.totalTime) {
                const skill = this.enemyCasting.skill;
                this.enemyCasting = null;
                this.addLog(`${this.enemy.name} 的 ${skill.name} 引导完成！`, 'magic');
                
                // 发布技能完成事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit(BattleEvents.SKILL_COMPLETE, {
                        caster: 'enemy',
                        skill: skill,
                        enemy: this.enemy
                    });
                }
                
                this.castSkillImmediate(skill, 'enemy', true);
                // 引导完成后继续执行后续逻辑
                this.endEnemyTurn();
                return;
            }
        }

        // 敌人AI选择行动
        const action = this.enemyAI();

        if (action.type === 'attack') {
            // 普通攻击
            // 计算伤害（含攻击者状态修正）
            const enemyMods = this.getStatusModifiers(this.enemy);
            
            // 天赋：首次攻击必定暴击
            let critRate = 0.05;
            let firstStrikeBonus = 0;
            if (!this.enemy.firstAttackDone && this.enemy.traits) {
                const firstStrikeTrait = this.enemy.traits.find(t => t.type === 'first_strike');
                if (firstStrikeTrait) {
                    critRate = 1.0; // 必定暴击
                    if (firstStrikeTrait.effects && firstStrikeTrait.effects.firstDamageBonus) {
                        firstStrikeBonus = firstStrikeTrait.effects.firstDamageBonus;
                    }
                    this.addLog(`${this.enemy.name} 发动暗影突袭！`, 'crit');
                }
            }
            
            const damage = this.calculateDamage(
                this.enemy.attack + enemyMods.attackMod,
                this.player.defense * (this.player.isDefending ? 2 : 1), // 防御时防御翻倍
                1.0 + firstStrikeBonus,
                critRate,
                0.9,
                'physical',
                null,
                this.player,
                this.enemy
            );
            
            // 标记首次攻击已完成
            if (!this.enemy.firstAttackDone) {
                this.enemy.firstAttackDone = true;
            }

            // 防御减伤
            if (this.player.isDefending) {
                damage.amount = Math.floor(damage.amount * 0.5);
            }

            this.applyDamage(this.player, damage);
            
            // 天赋：攻击命中效果（流血等）
            if (!damage.isMiss && damage.amount > 0) {
                this.processTraitsOnHit(this.enemy, this.player, damage.amount, false);
            }

            this.addLog(`${this.enemy.name} 发动攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 
                damage.isCrit ? 'crit' : 'damage');
            
            // 显示浮动伤害数字
            if (!damage.isMiss) {
                const dmgType = damage.isCrit ? 'crit' : 'normal';
                this.showDamageNumber('player', damage.amount, dmgType);
            }

            // 检查是否打断玩家引导（精神力对抗）
            if (this.playerCasting && !damage.isMiss) {
                // 基础打断概率20%，精神力差每1点增减0.5%，最低10%，最高60%
                const enemySpirit = this.enemy.spirit || 20;
                const playerSpirit = this.player.spirit || 30;
                let interruptChance = 0.2 + (enemySpirit - playerSpirit) * 0.005;
                interruptChance = Math.max(0.1, Math.min(0.6, interruptChance));
                
                if (Math.random() < interruptChance) {
                    this.addLog(`你的魔法引导被打断了！`, 'system');
                    this.playerCasting = null;
                    
                    // 发布打断事件
                    if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                        BattleEventBus.emit(BattleEvents.INTERRUPT, {
                            attacker: 'enemy',
                            target: 'player',
                            skill: this.playerCasting?.skill
                        });
                    }
                }
            }
            
            // 发布敌人攻击事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.ENEMY_ATTACK, {
                    damage: damage.amount,
                    isCrit: damage.isCrit,
                    isMiss: damage.isMiss,
                    damageType: 'physical',
                    enemy: this.enemy
                });
                
                // 发布更细粒度的事件
                if (damage.isMiss) {
                    BattleEventBus.emit(BattleEvents.MISS, {
                        attacker: 'enemy',
                        target: 'player',
                        damageType: 'physical',
                        enemy: this.enemy
                    });
                } else {
                    BattleEventBus.emit(BattleEvents.HIT, {
                        attacker: 'enemy',
                        target: 'player',
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'physical',
                        enemy: this.enemy
                    });
                    
                    if (damage.isCrit) {
                        BattleEventBus.emit(BattleEvents.CRIT, {
                            attacker: 'enemy',
                            target: 'player',
                            damage: damage.amount,
                            damageType: 'physical',
                            enemy: this.enemy
                        });
                    }
                    
                    BattleEventBus.emit(BattleEvents.DAMAGE, {
                        target: 'player',
                        attacker: 'enemy',
                        damage: damage.amount,
                        isCrit: damage.isCrit,
                        damageType: 'physical',
                        enemy: this.enemy
                    });
                }
            }

        } else if (action.type === 'skill') {
            // 使用技能
            const skill = SkillSystem.getSkill(action.skillId);
            if (skill && this.enemy.mp >= skill.mpCost) {
                // 计算引导时间（精神力越高越快）
                const baseCastTime = this.getCastTime(skill.tier);
                const spirit = this.enemy.spirit || 20;
                const castTime = Math.max(1, Math.floor(baseCastTime * (100 - spirit * 0.5) / 100));

                if (castTime <= 1 || skill.type === 'buff' || skill.targetType === 'self') {
                    // 瞬发
                    this.castSkillImmediate(skill, 'enemy');
                    return;
                } else {
                    // 开始引导
                    this.enemyCasting = {
                        skillId: action.skillId,
                        skill: skill,
                        progress: 1,
                        totalTime: castTime
                    };
                    this.enemy.mp -= skill.mpCost;
                    this.addLog(`${this.enemy.name} 开始引导 ${skill.name}...`, 'magic');
                    
                    // 发布技能引导事件
                    if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                        BattleEventBus.emit(BattleEvents.SKILL_CHANNEL, {
                            caster: 'enemy',
                            skill: skill,
                            totalTime: castTime,
                            enemy: this.enemy
                        });
                    }
                }
            }
        } else if (action.type === 'defend') {
            // 防御
            this.enemy.isDefending = true;
            this.addLog(`${this.enemy.name} 进入防御姿态，防御力提升！`, 'system');
            
            // 发布防御事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.DEFEND, {
                    caster: 'enemy',
                    enemy: this.enemy
                });
            }
        }

        this.endEnemyTurn();
    },

    /**
     * 敌人AI（多样化系统）
     * 支持6种AI类型：aggressive（激进）、defensive（保守）、controller（控制）、burst（爆发）、kiter（游击）、tactical（战术）
     */
    /**
     * 敌人AI - 使用Utility AI（效用系统）
     * 给每个可能的行动打分，选择分数最高的执行
     */
    enemyAI() {
        const aiType = this.enemy.aiType || 'aggressive';
        
        // 使用新的Utility AI系统
        if (typeof BattleAI !== 'undefined') {
            try {
                // 准备自身状态
                const selfState = {
                    hp: this.enemy.hp,
                    maxHp: this.enemy.maxHp,
                    mp: this.enemy.mp || 0,
                    maxMp: this.enemy.maxMp || 50,
                    attack: this.enemy.attack,
                    defense: this.enemy.defense,
                    speed: this.enemy.speed,
                    skills: this.enemy.skills || [],
                    buffs: this.enemy.buffs || [],
                    statusEffects: this.enemy.statusEffects || [],
                    skillCooldowns: this.enemy.skillCooldowns || {},
                    elements: this.enemy.elements || []
                };
                
                // 准备对手状态
                const opponentState = {
                    hp: this.player.hp,
                    maxHp: this.player.maxHp,
                    mp: this.player.mp || 0,
                    maxMp: this.player.maxMp || 50,
                    attack: this.player.attack,
                    defense: this.player.defense,
                    speed: this.player.speed,
                    buffs: this.player.buffs || [],
                    statusEffects: this.player.statusEffects || [],
                    elements: this.player.elements || [],
                    isCasting: !!this.playerCasting, // 对手是否在引导魔法
                    castingSkill: this.playerCasting?.skill
                };
                
                // 获取AI决策
                const decision = BattleAI.getDecision(selfState, opponentState, aiType);
                
                // 转换为战斗系统的行动格式
                if (decision.action === 'attack') {
                    return { type: 'attack' };
                } else if (decision.action === 'defend') {
                    return { type: 'defend' };
                } else if (decision.action === 'skill' && decision.skillId) {
                    return { type: 'skill', skillId: decision.skillId };
                }
                
            } catch (e) {
                console.error('[Battle] Utility AI出错，使用备用AI:', e);
            }
        }
        
        // 备用：使用原来的简单AI
        switch (aiType) {
            case 'defensive':
                return this.enemyAIDefensive();
            case 'controller':
                return this.enemyAIController();
            case 'burst':
                return this.enemyAIBurst();
            case 'kiter':
                return this.enemyAIKiter();
            case 'tactical':
                return this.enemyAITactical();
            case 'aggressive':
            default:
                return this.enemyAIAggressive();
        }
    },
    
    /**
     * 激进型AI：全力输出，不顾防御
     */
    enemyAIAggressive() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        
        // 优先用最高伤害技能
        if (availableSkills.length > 0) {
            // 找伤害最高的技能
            let bestSkill = null;
            let bestDamage = 0;
            for (const skillId of availableSkills) {
                const skill = SkillSystem.getSkill(skillId);
                if (skill && skill.type === 'damage') {
                    const dmg = skill.baseDamage || 0;
                    if (dmg > bestDamage) {
                        bestDamage = dmg;
                        bestSkill = skillId;
                    }
                }
            }
            
            // 70%概率用最强技能，30%普攻
            if (bestSkill && Math.random() < 0.7) {
                return { type: 'skill', skillId: bestSkill };
            }
        }
        
        return { type: 'attack' };
    },
    
    /**
     * 保守型AI：懂得自我保护
     */
    enemyAIDefensive() {
        const hpPercent = this.enemy.hp / this.enemy.maxHp;
        const availableSkills = this.getAvailableSkills(this.enemy);
        
        // 血量低于30%，优先防御或治疗
        if (hpPercent < 0.3) {
            // 找治疗技能
            const healSkill = availableSkills.find(id => {
                const skill = SkillSystem.getSkill(id);
                return skill && skill.type === 'heal';
            });
            
            if (healSkill && Math.random() < 0.7) {
                return { type: 'skill', skillId: healSkill };
            }
            
            // 没有治疗技能就防御
            if (Math.random() < 0.6) {
                return { type: 'defend' };
            }
        }
        
        // 血量30%-70%，攻防交替
        if (hpPercent < 0.7) {
            if (Math.random() < 0.3) {
                return { type: 'defend' };
            }
        }
        
        // 正常攻击
        if (availableSkills.length > 0 && Math.random() < 0.5) {
            const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            return { type: 'skill', skillId: skillId };
        }
        
        return { type: 'attack' };
    },
    
    /**
     * 控制型AI：优先控制，再输出
     */
    enemyAIController() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        const playerHasDebuff = this.player.statusEffects && this.player.statusEffects.length > 0;
        
        // 玩家没有debuff，优先放控制技能
        if (!playerHasDebuff) {
            // 找debuff技能
            const debuffSkill = availableSkills.find(id => {
                const skill = SkillSystem.getSkill(id);
                return skill && (skill.type === 'debuff' || skill.effectType === 'debuff');
            });
            
            if (debuffSkill && Math.random() < 0.8) {
                return { type: 'skill', skillId: debuffSkill };
            }
        }
        
        // 玩家已经被控，全力输出
        if (playerHasDebuff && availableSkills.length > 0 && Math.random() < 0.6) {
            // 找伤害最高的技能
            let bestSkill = null;
            let bestDamage = 0;
            for (const skillId of availableSkills) {
                const skill = SkillSystem.getSkill(skillId);
                if (skill && skill.type === 'damage') {
                    const dmg = skill.baseDamage || 0;
                    if (dmg > bestDamage) {
                        bestDamage = dmg;
                        bestSkill = skillId;
                    }
                }
            }
            
            if (bestSkill) {
                return { type: 'skill', skillId: bestSkill };
            }
        }
        
        // 补控制或正常输出
        if (availableSkills.length > 0 && Math.random() < 0.4) {
            const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            return { type: 'skill', skillId: skillId };
        }
        
        return { type: 'attack' };
    },
    
    /**
     * 爆发型AI：攒MP一波爆发
     */
    enemyAIBurst() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        const mpPercent = this.enemy.mp / (this.enemy.maxMp || 50);
        
        // 初始化爆发状态
        if (!this.enemy.burstPhase) {
            this.enemy.burstPhase = 'charging'; // charging（蓄力） / bursting（爆发） / recovering（恢复）
            this.enemy.burstTurns = 0;
        }
        
        this.enemy.burstTurns++;
        
        // 蓄力阶段：攒MP
        if (this.enemy.burstPhase === 'charging') {
            // MP够了，进入爆发阶段
            if (mpPercent >= 0.8) {
                this.enemy.burstPhase = 'bursting';
                this.enemy.burstTurns = 0;
                this.addLog(`${this.enemy.name} 开始爆发！`, 'system');
            } else {
                // 蓄力期：普攻/小技能
                if (availableSkills.length > 0 && Math.random() < 0.3) {
                    // 找消耗MP最少的技能
                    let cheapestSkill = null;
                    let cheapestCost = 999;
                    for (const skillId of availableSkills) {
                        const skill = SkillSystem.getSkill(skillId);
                        if (skill && skill.mpCost < cheapestCost) {
                            cheapestCost = skill.mpCost;
                            cheapestSkill = skillId;
                        }
                    }
                    if (cheapestSkill && cheapestCost <= 10) {
                        return { type: 'skill', skillId: cheapestSkill };
                    }
                }
                return { type: 'attack' };
            }
        }
        
        // 爆发阶段：全力输出
        if (this.enemy.burstPhase === 'bursting') {
            // 爆发持续3回合
            if (this.enemy.burstTurns >= 3 || mpPercent < 0.2) {
                this.enemy.burstPhase = 'recovering';
                this.enemy.burstTurns = 0;
                this.addLog(`${this.enemy.name} 进入虚弱期！`, 'system');
            } else {
                // 爆发期：优先用最强技能
                if (availableSkills.length > 0) {
                    let bestSkill = null;
                    let bestDamage = 0;
                    for (const skillId of availableSkills) {
                        const skill = SkillSystem.getSkill(skillId);
                        if (skill && skill.type === 'damage') {
                            const dmg = skill.baseDamage || 0;
                            if (dmg > bestDamage) {
                                bestDamage = dmg;
                                bestSkill = skillId;
                            }
                        }
                    }
                    if (bestSkill) {
                        return { type: 'skill', skillId: bestSkill };
                    }
                }
                return { type: 'attack' };
            }
        }
        
        // 恢复阶段：防御为主
        if (this.enemy.burstPhase === 'recovering') {
            if (this.enemy.burstTurns >= 3) {
                this.enemy.burstPhase = 'charging';
                this.enemy.burstTurns = 0;
            }
            
            // 恢复期：防御为主
            if (Math.random() < 0.5) {
                return { type: 'defend' };
            }
            
            if (availableSkills.length > 0 && Math.random() < 0.3) {
                const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                return { type: 'skill', skillId: skillId };
            }
            
            return { type: 'attack' };
        }
        
        return { type: 'attack' };
    },
    
    /**
     * 游击型AI：打一下跑一下
     */
    enemyAIKiter() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        
        // 初始化游击状态
        if (this.enemy.kiterState === undefined) {
            this.enemy.kiterState = 'attack'; // attack / evade
        }
        
        // 切换状态
        if (this.enemy.kiterState === 'attack') {
            this.enemy.kiterState = 'evade';
            
            // 攻击回合：放技能
            if (availableSkills.length > 0 && Math.random() < 0.7) {
                const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                return { type: 'skill', skillId: skillId };
            }
            return { type: 'attack' };
        } else {
            this.enemy.kiterState = 'attack';
            
            // 闪避回合：防御
            return { type: 'defend' };
        }
    },
    
    /**
     * 战术型AI：会根据玩家状态调整策略（最智能）
     */
    enemyAITactical() {
        const availableSkills = this.getAvailableSkills(this.enemy);
        const playerHpPercent = this.player.hp / this.player.maxHp;
        const playerMpPercent = this.player.mp / this.player.maxMp;
        const enemyHpPercent = this.enemy.hp / this.enemy.maxHp;
        
        // 1. 玩家在引导大招，优先打断
        if (this.playerCasting) {
            // 普攻打断
            if (Math.random() < 0.8) {
                return { type: 'attack' };
            }
        }
        
        // 2. 自己血量很低，防御/治疗
        if (enemyHpPercent < 0.25) {
            const healSkill = availableSkills.find(id => {
                const skill = SkillSystem.getSkill(id);
                return skill && skill.type === 'heal';
            });
            
            if (healSkill && Math.random() < 0.8) {
                return { type: 'skill', skillId: healSkill };
            }
            
            if (Math.random() < 0.5) {
                return { type: 'defend' };
            }
        }
        
        // 3. 玩家血量很低，猛攻
        if (playerHpPercent < 0.3) {
            if (availableSkills.length > 0) {
                let bestSkill = null;
                let bestDamage = 0;
                for (const skillId of availableSkills) {
                    const skill = SkillSystem.getSkill(skillId);
                    if (skill && skill.type === 'damage') {
                        const dmg = skill.baseDamage || 0;
                        if (dmg > bestDamage) {
                            bestDamage = dmg;
                            bestSkill = skillId;
                        }
                    }
                }
                if (bestSkill) {
                    return { type: 'skill', skillId: bestSkill };
                }
            }
            return { type: 'attack' };
        }
        
        // 4. 玩家MP很少，消耗战
        if (playerMpPercent < 0.2) {
            // 玩家没MP了，用小技能消耗
            if (availableSkills.length > 0 && Math.random() < 0.5) {
                const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                return { type: 'skill', skillId: skillId };
            }
            return { type: 'attack' };
        }
        
        // 5. 正常情况：有策略的攻击
        // 利用元素克制
        const playerElement = this.player.elements?.[0] || 'neutral';
        const counterSkill = availableSkills.find(id => {
            const skill = SkillSystem.getSkill(id);
            if (!skill || !skill.element) return false;
            return this.ELEMENT_COUNTER[skill.element] === playerElement;
        });
        
        if (counterSkill && Math.random() < 0.6) {
            return { type: 'skill', skillId: counterSkill };
        }
        
        // 正常输出
        if (availableSkills.length > 0 && Math.random() < 0.5) {
            const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            return { type: 'skill', skillId: skillId };
        }
        
        return { type: 'attack' };
    },
    
    /**
     * 获取可用技能列表
     */
    getAvailableSkills(entity) {
        return (entity.skills || ['basic_attack'])
            .filter(id => {
                const skill = SkillSystem.getSkill(id);
                return skill && entity.mp >= skill.mpCost;
            });
    },

    /**
     * 结束敌人回合
     */
    endEnemyTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) return;

        // 处理状态效果（每回合结束）
        this.tickStatusEffects(this.player, true);
        this.tickStatusEffects(this.enemy, false);
        
        // 天赋：回合结束效果
        this.processTraitsOnTurnEnd(this.enemy, false);
        this.processTraitsOnTurnEnd(this.player, true);

        // 处理召唤兽持续时间和状态
        if (this.summon) {
            this.summon.remainingDuration--;
            if (this.summon.statusEffects) {
                this.summon.statusEffects = this.summon.statusEffects.filter(effect => {
                    effect.duration--;
                    return effect.duration > 0;
                });
            }
            if (this.summon.remainingDuration <= 0 || this.summon.hp <= 0) {
                this.addLog(`${this.summon.icon} ${this.summon.name} 消失了`, 'system');
                this.summon = null;
            }
        }

        // 检查战斗是否结束（DOT可能致死）
        if (this.checkBattleEnd()) return;

        this.turn++;
        this.player.isDefending = false;

        // 玩家被眩晕/冻结，自动跳过回合
        if (this.isStunned(this.player)) {
            const stunEffect = this.player.statusEffects.find(e => e.type === 'stun' || e.type === 'frozen');
            this.addLog(`你被${stunEffect.name}，无法行动！`, 'system');
            this.isPlayerTurn = false;
            // 先更新UI，显示玩家被眩晕的状态
            if (typeof UI !== 'undefined') {
                UI.updateBattleScreen();
            }
            setTimeout(() => {
                this.enemyTurn();
            }, this.getDelay(1000));
            return;
        }
        
        this.isPlayerTurn = true;
        
        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }
    },

    /**
     * 计算伤害
     */
    calculateDamage(attack, defense, multiplier, critRate, hitRate, element, targetElement, target, attacker) {
        const result = {
            amount: 0,
            isCrit: false,
            isMiss: false,
            element: element,
            elementEffect: null  // 'super' | 'weak' | 'normal'
        };

        // 命中判定（考虑目标闪避修正）
        let evasion = 0;
        if (target) {
            const mods = this.getStatusModifiers(target);
            evasion = mods.evasionMod;
            
            // 天赋：闪避加成
            if (target.traitBonuses && target.traitBonuses.dodgeBonus) {
                evasion += target.traitBonuses.dodgeBonus;
            }
        }
        if (Math.random() > (hitRate - evasion)) {
            result.isMiss = true;
            return result;
        }

        // 基础伤害
        let damage = Math.max(1, (attack - defense * 0.5) * multiplier);

        // 元素克制计算
        if (element && targetElement) {
            const counterResult = this.checkElementCounter(element, targetElement);
            result.elementEffect = counterResult.effect;
            
            if (counterResult.effect === 'super') {
                damage *= 1.5; // 克制：伤害+50%
            } else if (counterResult.effect === 'weak') {
                damage *= 0.7; // 被克制：伤害-30%
            } else if (counterResult.effect === 'resist') {
                damage *= 0.8; // 同系抗性：伤害-20%
            }
        }
        
        // 天赋：攻击者的元素伤害加成
        if (element && attacker && attacker.traits) {
            for (const trait of attacker.traits) {
                if (trait.type === 'passive' && trait.effects) {
                    const bonusKey = element + 'DamageBonus';
                    if (trait.effects[bonusKey]) {
                        damage *= (1 + trait.effects[bonusKey]);
                    }
                }
            }
        }
        
        // 天赋：目标的元素伤害减免（抗性）
        if (element && target && target.traits) {
            for (const trait of target.traits) {
                if (trait.type === 'passive' && trait.effects) {
                    const reductionKey = element + 'DamageReduction';
                    if (trait.effects[reductionKey]) {
                        damage *= (1 - trait.effects[reductionKey]);
                    }
                }
            }
        }
        
        // 天赋：目标的元素弱点伤害
        if (element && target && target.traits) {
            for (const trait of target.traits) {
                if (trait.type === 'weakness' && trait.effects) {
                    const weaknessKey = element + 'DamageBonus';
                    if (trait.effects[weaknessKey]) {
                        damage *= (1 + trait.effects[weaknessKey]);
                    }
                }
            }
        }

        // 元素特性伤害加成（基于目标状态）
        if (target) {
            const mods = this.getStatusModifiers(target);
            if (element === 'fire') damage *= mods.fireDamageMod;
            if (element === 'thunder') damage *= mods.thunderDamageMod;
            if (element === 'ice') damage *= mods.iceDamageMod;
        }
        
        // 天赋：伤害减免
        if (target && target.traitBonuses) {
            // 物理伤害减免
            if (!element && target.traitBonuses.physicalDamageReduction) {
                damage *= (1 - target.traitBonuses.physicalDamageReduction);
            }
            // 魔法伤害减免
            if (element && target.traitBonuses.magicDamageReduction) {
                damage *= (1 - target.traitBonuses.magicDamageReduction);
            }
        }

        // 随机浮动 ±15%
        damage *= 0.85 + Math.random() * 0.3;

        // 暴击判定
        if (Math.random() < critRate) {
            result.isCrit = true;
            damage *= 1.5 + Math.random() * 0.5; // 1.5-2.0倍暴击
        }

        result.amount = Math.floor(damage);
        return result;
    },
    
    /**
     * 检查元素克制关系
     * @param {string} attackElement - 攻击元素
     * @param {string} defendElement - 防御元素
     * @returns {Object} {effect: 'super'|'weak'|'resist'|'normal', message: ''}
     */
    checkElementCounter(attackElement, defendElement) {
        if (!attackElement || !defendElement) {
            return { effect: 'normal', message: '' };
        }
        
        // 同系抗性
        if (attackElement === defendElement) {
            return { 
                effect: 'resist', 
                message: `${this.ELEMENT_NAMES[attackElement] || attackElement}抗性` 
            };
        }
        
        // 攻击方克制防御方
        if (this.ELEMENT_COUNTER[attackElement] === defendElement) {
            return { 
                effect: 'super', 
                message: `${this.ELEMENT_NAMES[attackElement] || attackElement}克制${this.ELEMENT_NAMES[defendElement] || defendElement}！` 
            };
        }
        
        // 防御方克制攻击方
        if (this.ELEMENT_COUNTER[defendElement] === attackElement) {
            return { 
                effect: 'weak', 
                message: `${this.ELEMENT_NAMES[defendElement] || defendElement}克制${this.ELEMENT_NAMES[attackElement] || attackElement}...` 
            };
        }
        
        return { effect: 'normal', message: '' };
    },

    /**
     * 应用伤害
     */
    applyDamage(target, damage) {
        let amount = damage.amount;
        
        // 护盾吸收
        const shield = target.statusEffects.find(e => e.type === 'shield');
        if (shield && shield.value > 0) {
            const absorbed = Math.min(shield.value, amount);
            shield.value -= absorbed;
            amount -= absorbed;
            if (absorbed > 0) {
                const targetName = target === this.player ? '你' : this.enemy.name;
                this.addLog(`${targetName} 的护盾吸收了 ${absorbed} 点伤害`, 'buff');
            }
            if (shield.value <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'shield');
            }
        }

        target.hp = Math.max(0, target.hp - amount);
        
        // 更新战斗统计
        if (target === this.enemy) {
            // 对敌人造成伤害
            this.stats.totalDamageDealt += amount;
            if (damage.isCrit) this.stats.critCount++;
            if (damage.isMiss) this.stats.missCount++;
        } else if (target === this.player) {
            // 玩家受到伤害
            this.stats.totalDamageTaken += amount;
            
            // 更新最低血量百分比
            const hpPercent = target.hp / target.maxHp;
            if (hpPercent < this.stats.maxHpPercent) {
                this.stats.maxHpPercent = hpPercent;
            }
        }
        
        // 同步到玩家数据
        if (target === this.player) {
            Player.hp = this.player.hp;
            
            // 记录受到伤害（用于毫发无伤成就）
            if (amount > 0) {
                this.tookDamage = true;
            }
        }
    },
    
    /**
     * 处理回合结束时的天赋效果
     */
    processTraitsOnTurnEnd(unit, isPlayer) {
        if (!unit.traits || unit.traits.length === 0) return;
        
        const unitName = isPlayer ? '你' : unit.name;
        
        for (const trait of unit.traits) {
            // 回合结束恢复HP
            if (trait.type === 'on_turn_end' && trait.effects && trait.effects.hpRegenPercent) {
                const regenAmount = Math.floor(unit.maxHp * trait.effects.hpRegenPercent);
                if (regenAmount > 0 && unit.hp < unit.maxHp) {
                    unit.hp = Math.min(unit.maxHp, unit.hp + regenAmount);
                    this.addLog(`${unitName} 的【${trait.name}】生效，恢复了 ${regenAmount} 点生命`, 'heal');
                }
            }
        }
    },
    
    /**
     * 处理受到攻击时的天赋效果
     */
    processTraitsOnHitTaken(target, damage, isPlayer) {
        if (!target.traits || target.traits.length === 0) return damage;
        
        let finalDamage = damage;
        const targetName = isPlayer ? '你' : target.name;
        
        for (const trait of target.traits) {
            // 伤害反弹
            if (trait.type === 'on_hit_taken' && trait.effects && trait.effects.damageReflect) {
                const reflectDamage = Math.floor(damage * trait.effects.damageReflect);
                if (reflectDamage > 0) {
                    // 反弹伤害给攻击者（这里简化处理，只记录日志）
                    this.addLog(`${targetName} 的【${trait.name}】反弹了 ${reflectDamage} 点伤害`, 'damage');
                }
            }
        }
        
        return finalDamage;
    },
    
    /**
     * 处理攻击命中时的天赋效果
     */
    processTraitsOnHit(attacker, target, damage, isPlayer) {
        if (!attacker.traits || attacker.traits.length === 0) return;
        
        const attackerName = isPlayer ? '你' : attacker.name;
        
        for (const trait of attacker.traits) {
            // 攻击造成流血
            if (trait.type === 'on_hit' && trait.effects && trait.effects.bleedChance) {
                if (Math.random() < trait.effects.bleedChance) {
                    // 添加流血效果
                    const bleedEffect = {
                        type: 'bleed',
                        name: '流血',
                        duration: trait.effects.bleedDuration || 3,
                        dotDamage: trait.effects.bleedDamage || 5,
                        stacks: 1,
                        icon: '🩸'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(bleedEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了流血效果！`, 'debuff');
                }
            }
            
            // 攻击造成中毒
            if (trait.type === 'on_hit' && trait.effects && trait.effects.poisonChance) {
                if (Math.random() < trait.effects.poisonChance) {
                    // 添加中毒效果
                    const poisonEffect = {
                        type: 'poison',
                        name: '中毒',
                        duration: trait.effects.poisonDuration || 3,
                        dotDamage: trait.effects.poisonDamage || 5,
                        stacks: 1,
                        icon: '☠️'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(poisonEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了中毒效果！`, 'debuff');
                }
            }
            
            // 攻击造成减速
            if (trait.type === 'on_hit' && trait.effects && trait.effects.slowChance) {
                if (Math.random() < trait.effects.slowChance) {
                    // 添加减速效果
                    const slowEffect = {
                        type: 'slow',
                        name: '减速',
                        duration: trait.effects.slowDuration || 2,
                        speedMod: -(trait.effects.slowAmount || 0.2),
                        stacks: 1,
                        icon: '🐌'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(slowEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了减速效果！`, 'debuff');
                }
            }
            
            // 攻击造成冰冻
            if (trait.type === 'on_hit' && trait.effects && trait.effects.freezeChance) {
                if (Math.random() < trait.effects.freezeChance) {
                    // 添加冰冻效果
                    const freezeEffect = {
                        type: 'frozen',
                        name: '冰冻',
                        duration: trait.effects.freezeDuration || 1,
                        stacks: 1,
                        icon: '🧊'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(freezeEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了冰冻效果！`, 'debuff');
                }
            }
            
            // 攻击造成眩晕
            if (trait.type === 'on_hit' && trait.effects && trait.effects.stunChance) {
                if (Math.random() < trait.effects.stunChance) {
                    // 添加眩晕效果
                    const stunEffect = {
                        type: 'stun',
                        name: '眩晕',
                        duration: trait.effects.stunDuration || 1,
                        stacks: 1,
                        icon: '💫'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(stunEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了眩晕效果！`, 'debuff');
                }
            }
            
            // 攻击造成致盲
            if (trait.type === 'on_hit' && trait.effects && trait.effects.blindChance) {
                if (Math.random() < trait.effects.blindChance) {
                    // 添加致盲效果
                    const blindEffect = {
                        type: 'blind',
                        name: '致盲',
                        duration: trait.effects.blindDuration || 1,
                        hitMod: -0.3,
                        stacks: 1,
                        icon: '👁️‍🗨️'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(blindEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了致盲效果！`, 'debuff');
                }
            }
            
            // 攻击造成束缚
            if (trait.type === 'on_hit' && trait.effects && trait.effects.bindChance) {
                if (Math.random() < trait.effects.bindChance) {
                    // 添加束缚效果
                    const bindEffect = {
                        type: 'bind',
                        name: '束缚',
                        duration: trait.effects.bindDuration || 2,
                        stacks: 1,
                        icon: '🔗'
                    };
                    
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects.push(bindEffect);
                    
                    this.addLog(`${attackerName} 的【${trait.name}】造成了束缚效果！`, 'debuff');
                }
            }
        }
    },
    
    /**
     * 计算动态攻击加成（血量越低攻击越高之类的）
     */
    getDynamicAttackBonus(unit, baseAttack) {
        if (!unit.traits || unit.traits.length === 0) return baseAttack;
        
        let finalAttack = baseAttack;
        
        for (const trait of unit.traits) {
            // 血怒：血量越低，攻击越高
            if (trait.type === 'passive_scaling' && trait.effects && trait.effects.attackPerHpLost) {
                const hpLostPercent = 1 - (unit.hp / unit.maxHp);
                const attackBonus = hpLostPercent * trait.effects.attackPerHpLost * 100;
                finalAttack *= (1 + attackBonus);
            }
        }
        
        return Math.floor(finalAttack);
    },
    
    /**
     * 检查是否有控制免疫
     */
    hasControlImmunity(unit) {
        if (!unit.traits || unit.traits.length === 0) return false;
        
        for (const trait of unit.traits) {
            if (trait.effects && trait.effects.controlImmune) {
                return true;
            }
        }
        
        return false;
    },

    /**
     * 获取引导时间
     */
    getCastTime(tier) {
        const castTimes = {
            '初阶': 2,
            '中阶': 3,
            '高阶': 4,
            '超阶': 5
        };
        return castTimes[tier] || 2;
    },

    /**
     * 元素克制加成
     */
    getElementBonus(attackElement, defenseElement) {
        // 使用统一的元素克制系统
        const result = this.checkElementCounter(attackElement, defenseElement);
        if (result.effect === 'super') return 1.5;
        if (result.effect === 'weak') return 0.7;
        if (result.effect === 'resist') return 0.8;
        return 1.0;
    },

    /**
     * 应用状态效果
     */
    /**
     * 施加状态效果
     * 支持层数叠加(stacks)、数值累积(value)、特殊类型
     */
    applyStatusEffects(target, effects, isPlayerTarget) {
        const targetName = isPlayerTarget ? '你' : this.enemy.name;

        effects.forEach(effect => {
            // 净化效果：清除所有负面状态
            if (effect.type === 'cleanse') {
                if (Math.random() < (effect.chance || 1.0)) {
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness'];
                    const removedEffects = target.statusEffects.filter(e => debuffTypes.includes(e.type));
                    target.statusEffects = target.statusEffects.filter(e => !debuffTypes.includes(e.type));
                    const removed = removedEffects.length;
                    if (removed > 0) {
                        this.addLog(`${targetName} 的圣光净化了 ${removed} 个负面状态！`, 'buff');
                        
                        // 发布状态移除事件
                        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                            removedEffects.forEach(removedEffect => {
                                BattleEventBus.emit(BattleEvents.STATUS_REMOVED, {
                                    target: isPlayerTarget ? 'player' : 'enemy',
                                    effect: removedEffect,
                                    reason: 'cleanse'
                                });
                            });
                        }
                    } else {
                        this.addLog(`${targetName} 被圣光笼罩，没有负面状态需要净化`, 'system');
                    }
                }
                return;
            }

            // 计算命中概率（控制类状态受精神力抵抗）
            let hitChance = effect.chance || 1.0;
            const controlTypes = ['stun', 'frozen', 'freeze', 'paralyze', 'bind', 'blind', 'slow'];
            if (controlTypes.includes(effect.type)) {
                const spirit = target.spirit || 30;
                const resist = spirit * 0.003; // 每点精神力抵抗0.3%
                hitChance = Math.max(0.5, hitChance - resist); // 最低50%命中
            }
            
            if (Math.random() < hitChance) {
                const existing = target.statusEffects.find(e => e.type === effect.type);
                
                if (existing) {
                    // 层数叠加型（燃烧、诅咒等）
                    if (effect.stacks || existing.stacks) {
                        const maxStacks = effect.maxStacks || existing.maxStacks || 3;
                        existing.stacks = Math.min(maxStacks, (existing.stacks || 1) + (effect.stacks || 1));
                        existing.duration = Math.max(existing.duration, effect.duration);
                        this.addLog(`${targetName} 的 ${effect.name} 叠加到 ${existing.stacks} 层！`, 'debuff');
                    }
                    // 数值累积型（冻结值、护盾值等）
                    else if (effect.value !== undefined || existing.value !== undefined) {
                        existing.value = (existing.value || 0) + (effect.value || 0);
                        existing.duration = Math.max(existing.duration, effect.duration);
                        // 冻结值达到阈值则冻结
                        if (effect.type === 'freeze' && existing.value >= 100) {
                            existing.type = 'frozen';
                            existing.name = '冻结';
                            existing.duration = 1;
                            existing.value = 0;
                            this.addLog(`${targetName} 被冻结了！`, 'debuff');
                        }
                    }
                    // 普通刷新持续时间
                    else {
                        existing.duration = Math.max(existing.duration, effect.duration);
                        this.addLog(`${targetName} 的 ${effect.name} 持续时间刷新了`, 'system');
                    }
                } else {
                    // 新效果
                    const newEffect = { ...effect };
                    if (effect.stacks && !newEffect.stacks) newEffect.stacks = 1;
                    target.statusEffects.push(newEffect);
                    
                    // 特殊效果提示
                    if (effect.type === 'stun' || effect.type === 'frozen') {
                        this.addLog(`${targetName} 被${effect.name}了！`, 'debuff');
                    } else if (effect.type === 'shield') {
                        this.addLog(`${targetName} 获得了 ${effect.value} 点护盾！`, 'buff');
                    } else if (effect.type === 'wet') {
                        this.addLog(`${targetName} 被水浸湿了`, 'debuff');
                    } else if (effect.type === 'evasion_up') {
                        this.addLog(`${targetName} 闪避率提升！`, 'buff');
                    } else {
                        this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
                    }
                    
                    // 发布状态施加事件
                    if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                        BattleEventBus.emit(BattleEvents.STATUS_APPLIED, {
                            target: isPlayerTarget ? 'player' : 'enemy',
                            effect: newEffect,
                            isDebuff: !['shield', 'evasion_up', 'attack_up', 'defense_up', 'speed_up', 'crit_up', 'regen', 'cleanse'].includes(effect.type)
                        });
                    }
                }

                // 元素组合反应检查
                this.checkElementReactions(target, effect, isPlayerTarget);
            }
        });
    },

    /**
     * 应用灵种特殊效果
     * 根据玩家炼化的灵种，额外施加状态效果
     */
    applySpiritSeedEffects(target, element) {
        try {
            if (typeof Player === 'undefined' || typeof SpiritSeedSystem === 'undefined') return;
            
            const seedEffects = Player.getElementSpiritSeedEffects(element);
            if (!seedEffects) return;
            
            const targetName = this.isPlayerTurn ? this.enemy.name : '你';
            const extraEffects = [];
            
            // 火系灵种：额外灼烧
            if (element === 'fire' && seedEffects.burnChance) {
                if (Math.random() < seedEffects.burnChance) {
                    extraEffects.push({
                        name: '灵种灼烧',
                        type: 'burn',
                        element: 'fire',
                        dotDamage: Math.floor(8 * (1 + (seedEffects.burnDamage || 0))),
                        duration: 3,
                        chance: 1,
                        stacks: 1,
                        maxStacks: 5
                    });
                }
            }
            
            // 冰系灵种：额外减速
            if (element === 'ice' && seedEffects.slowChance) {
                if (Math.random() < seedEffects.slowChance) {
                    extraEffects.push({
                        name: '灵种冰封',
                        type: 'slow',
                        element: 'ice',
                        duration: 3,
                        chance: 1,
                        statModifiers: { speed: -15 }
                    });
                }
            }
            
            // 雷系灵种：额外麻痹
            if (element === 'thunder' && seedEffects.stunChance) {
                if (Math.random() < seedEffects.stunChance) {
                    extraEffects.push({
                        name: '灵种雷击',
                        type: 'stun',
                        element: 'thunder',
                        duration: 1,
                        chance: 1
                    });
                }
            }
            
            // 暗影系灵种：额外诅咒
            if (element === 'dark' && seedEffects.curseChance) {
                if (Math.random() < seedEffects.curseChance) {
                    extraEffects.push({
                        name: '灵种诅咒',
                        type: 'attack_down',
                        element: 'dark',
                        duration: 3,
                        chance: 1,
                        statModifiers: { attack: -15 }
                    });
                }
            }
            
            // 土系灵种：防御加成（被动属性，不在战斗中临时施加）
            if (element === 'earth' && seedEffects.defenseBonus) {
                // 土系灵种的防御加成在属性计算中生效
            }
            
            // 风系灵种：加速（自身增益）
            if (element === 'wind' && seedEffects.speedBonus) {
                // 风系灵种主要是伤害加成，速度加成在属性里
            }
            
            // 水系灵种：回复（自身增益）
            if (element === 'water' && seedEffects.regenBonus) {
                // 水系灵种的回复效果在治疗技能里体现
            }
            
            // 光系灵种：净化（自身增益）
            if (element === 'light' && seedEffects.purifyChance) {
                if (Math.random() < seedEffects.purifyChance) {
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness'];
                    const beforeCount = Player.statusEffects ? Player.statusEffects.length : 0;
                    if (Player.statusEffects) {
                        Player.statusEffects = Player.statusEffects.filter(e => !debuffTypes.includes(e.type));
                    }
                    const removed = beforeCount - (Player.statusEffects ? Player.statusEffects.length : 0);
                    if (removed > 0) {
                        this.addLog(`✨ 灵种圣光净化了 ${removed} 个负面状态！`, 'buff');
                    }
                }
            }
            
            // 施加额外效果
            if (extraEffects.length > 0) {
                this.applyStatusEffects(target, extraEffects, !this.isPlayerTurn);
                this.addLog(`✨ 灵种效果触发！`, 'buff');
            }
            
        } catch (e) {
            console.warn('[Battle] 灵种效果应用失败:', e);
        }
    },

    /**
     * 元素组合反应检查
     * 两种元素状态相遇时产生特殊效果
     */
    checkElementReactions(target, newEffect, isPlayerTarget) {
        const targetName = isPlayerTarget ? '你' : this.enemy.name;
        const effects = target.statusEffects;

        // 雷 + 湿润 = 感电
        if (newEffect.type === 'paralysis' || newEffect.element === 'thunder') {
            const wet = effects.find(e => e.type === 'wet');
            if (wet) {
                wet.type = 'electrified';
                wet.name = '感电';
                wet.dotDamage = (wet.dotDamage || 0) + 15;
                wet.duration = Math.max(wet.duration, 2);
                this.addLog(`⚡ 感电反应！${targetName} 全身通电，持续受到伤害！`, 'magic');
            }
        }

        // 火 + 冻结 = 融化
        if ((newEffect.type === 'burn' || newEffect.element === 'fire') && newEffect.type !== 'freeze') {
            const frozen = effects.find(e => e.type === 'frozen');
            if (frozen) {
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'frozen');
                this.addLog(`🔥 融化反应！冻结被解除，火系伤害提升！`, 'magic');
                // 标记本回合火系伤害加成
                target._meltBonus = 1.5;
            }
        }

        // 火 + 湿润 = 蒸汽（命中率降低）
        if ((newEffect.type === 'burn' || newEffect.element === 'fire') && newEffect.type !== 'wet') {
            const wet = effects.find(e => e.type === 'wet');
            if (wet && wet.type === 'wet') {
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'wet');
                const steam = { type: 'steam', name: '蒸汽', duration: 2, hitRateMod: -0.3 };
                target.statusEffects.push(steam);
                this.addLog(`💨 蒸汽反应！${targetName} 被蒸汽笼罩，命中率降低！`, 'magic');
            }
        }

        // 土 + 湿润 = 泥泞（速度降低）
        if (newEffect.element === 'earth' || newEffect.type === 'mud') {
            const wet = effects.find(e => e.type === 'wet');
            if (wet) {
                wet.type = 'mud';
                wet.name = '泥泞';
                wet.speedMod = -0.5;
                wet.duration = Math.max(wet.duration, 2);
                this.addLog(`🪨 泥泞反应！${targetName} 陷入泥泞，速度大减！`, 'magic');
            }
        }
    },

    /**
     * 状态效果每回合结算
     */
    /**
     * 状态效果每回合结算
     * 支持层数DOT、眩晕跳过、护盾保留等
     */
    tickStatusEffects(target, isPlayer) {
        const targetName = isPlayer ? '你' : this.enemy.name;
        const removedEffects = [];

        target.statusEffects = target.statusEffects.filter(effect => {
            // 护盾不随时间消失（被打掉才消失）
            if (effect.type === 'shield') {
                if ((effect.value || 0) <= 0) {
                    removedEffects.push({ effect, reason: 'broken' });
                    return false;
                }
                return true;
            }

            effect.duration--;

            // DOT伤害（按层数计算）
            if (effect.dotDamage) {
                const stacks = effect.stacks || 1;
                const damage = { amount: Math.floor(effect.dotDamage * stacks), isCrit: false, isMiss: false };
                this.applyDamage(target, damage);
                this.addLog(`${targetName} 受到 ${effect.name} 伤害 ${damage.amount} 点（${stacks}层）`, 'damage');
            }

            // REG恢复（每回合恢复HP）
            if (effect.regen) {
                const healAmount = Math.floor(effect.regen);
                target.hp = Math.min(target.maxHp, target.hp + healAmount);
                this.addLog(`${targetName} 受到 ${effect.name} 恢复 ${healAmount} 点生命`, 'heal');
            }

            // 效果结束
            if (effect.duration <= 0) {
                if (effect.type !== 'shield') {
                    this.addLog(`${targetName} 的 ${effect.name} 效果消失了`, 'system');
                }
                removedEffects.push({ effect, reason: 'expired' });
                return false;
            }
            return true;
        });

        // 发布状态移除事件
        if (removedEffects.length > 0 && typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            removedEffects.forEach(item => {
                BattleEventBus.emit(BattleEvents.STATUS_REMOVED, {
                    target: isPlayer ? 'player' : 'enemy',
                    effect: item.effect,
                    reason: item.reason
                });
            });
        }

        // 清除融化加成标记
        if (target._meltBonus) delete target._meltBonus;
    },

    /**
     * 检查目标是否被眩晕/冻结，应跳过回合
     */
    isStunned(target) {
        return target.statusEffects.some(e => e.type === 'stun' || e.type === 'frozen');
    },

    /**
     * 获取目标的状态效果修正值
     */
    getStatusModifiers(target) {
        const mods = {
            attackMod: 0,
            defenseMod: 0,
            speedMod: 0,
            hitRateMod: 0,
            evasionMod: 0,
            fireDamageMod: 1,
            thunderDamageMod: 1,
            iceDamageMod: 1
        };

        target.statusEffects.forEach(effect => {
            if (effect.statModifiers) {
                const stacks = effect.stacks || 1;
                mods.attackMod += (effect.statModifiers.attack || 0) * stacks;
                mods.defenseMod += (effect.statModifiers.defense || 0) * stacks;
                mods.speedMod += (effect.statModifiers.speed || 0) * stacks;
            }
            if (effect.speedMod) mods.speedMod += effect.speedMod;
            if (effect.hitRateMod) mods.hitRateMod += effect.hitRateMod;
            if (effect.evasionMod) mods.evasionMod += effect.evasionMod;
            // 湿润状态受雷系伤害×2
            if (effect.type === 'wet' || effect.type === 'electrified') {
                mods.thunderDamageMod *= 2;
            }
            // 冻结状态受火系伤害×2
            if (effect.type === 'frozen') {
                mods.fireDamageMod *= 2;
            }
        });

        // 融化加成
        if (target._meltBonus) {
            mods.fireDamageMod *= target._meltBonus;
        }

        return mods;
    },

    /**
     * 检查战斗是否结束
     */
    checkBattleEnd() {
        if (this.player.hp <= 0) {
            this.result = 'lose';
            this.active = false;
            this.addLog('你被击败了...', 'system');
            
            // 重置连胜
            if (typeof Player !== 'undefined') {
                Player.winStreak = 0;
            }
            
            // 发布玩家死亡事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.PLAYER_DEATH, {
                    enemy: this.enemy,
                    turn: this.turn
                });
            }
            
            return true;
        }

        if (this.enemy.hp <= 0) {
            this.result = 'win';
            this.active = false;
            this.addLog(`击败了 ${this.enemy.name}！`, 'system');
            
            // 增加连胜
            if (typeof Player !== 'undefined') {
                Player.winStreak = (Player.winStreak || 0) + 1;
            }
            
            // 计算战斗评价
            this.calculateBattleRating();
            
            // 显示评价
            if (this.rating) {
                this.addLog(`战斗评价：${this.rating.name}（${this.rating.score}分）`, 'system');
            }
            
            // 计算奖励
            this.calculateRewards();
            
            // 成就检查
            if (typeof WorldState !== 'undefined' && typeof DataAchievements !== 'undefined') {
                this.checkBattleAchievements();
            }
            
            // 发布敌人死亡事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                BattleEventBus.emit(BattleEvents.ENEMY_DEATH, {
                    enemy: this.enemy,
                    turn: this.turn,
                    rating: this.rating,
                    stats: this.stats
                });
            }
            
            return true;
        }

        return false;
    },
    
    /**
     * 计算战斗评价
     * S/A/B/C/D 五级评价
     */
    calculateBattleRating() {
        let score = 100; // 基础分100
        
        // 1. 回合数评分（越少越好）
        // 基准：5回合为标准，每少1回合+5分，每多1回合-3分
        const turnBonus = (5 - this.turn) * 5;
        score += turnBonus;
        
        // 2. 剩余血量评分（越多越好）
        // 剩余血量百分比 × 20
        const hpPercent = this.player.hp / this.player.maxHp;
        const hpBonus = hpPercent * 20;
        score += hpBonus;
        
        // 3. 使用道具扣分（用得越少越好）
        score -= this.stats.itemsUsed * 10;
        
        // 4. 暴击率加分
        if (this.stats.skillsUsed > 0) {
            const critRate = this.stats.critCount / this.stats.skillsUsed;
            score += critRate * 10;
        }
        
        // 5. 打断次数加分
        score += this.stats.interruptCount * 5;
        
        // 6. 毫发无伤加分
        if (!this.tookDamage) {
            score += 20;
        }
        
        // 7. 难度修正 - 敌人越强，基础分越高
        const enemyLevel = this.enemy.level || 1;
        const playerLevel = this.player.level || 1;
        const levelDiff = enemyLevel - playerLevel;
        score += levelDiff * 3; // 越级挑战加分
        
        // 确定评价等级
        let rating = 'D';
        let ratingName = 'D级·艰难';
        let ratingColor = '#999999';
        
        if (score >= 120) {
            rating = 'S';
            ratingName = 'S级·完美';
            ratingColor = '#ffcc00';
        } else if (score >= 100) {
            rating = 'A';
            ratingName = 'A级·优秀';
            ratingColor = '#ff6600';
        } else if (score >= 80) {
            rating = 'B';
            ratingName = 'B级·良好';
            ratingColor = '#66cc66';
        } else if (score >= 60) {
            rating = 'C';
            ratingName = 'C级·普通';
            ratingColor = '#6699cc';
        }
        
        this.rating = {
            score: Math.floor(score),
            level: rating,
            name: ratingName,
            color: ratingColor,
            details: {
                turnBonus: Math.floor(turnBonus),
                hpBonus: Math.floor(hpBonus),
                itemPenalty: -this.stats.itemsUsed * 10,
                critBonus: Math.floor((this.stats.skillsUsed > 0 ? (this.stats.critCount / this.stats.skillsUsed) * 10 : 0)),
                interruptBonus: this.stats.interruptCount * 5,
                noDamageBonus: this.tookDamage ? 0 : 20,
                levelBonus: levelDiff * 3
            }
        };
        
        return this.rating;
    },

    /**
     * 计算战斗奖励
     */
    calculateRewards() {
        const rewards = {
            exp: 0,
            gold: 0,
            items: [],
            levelUps: []
        };

        // 基础经验和金币
        rewards.exp = this.enemy.expReward || 0;
        rewards.gold = this.enemy.goldReward || 0;
        
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

        // 应用奖励
        const expResult = Player.gainExp(rewards.exp);
        Player.gainGold(rewards.gold);
        rewards.levelUps = expResult.levelUps;
        rewards.newSkills = expResult.newSkills;

        // 天赋经验：击杀敌人增加主系天赋经验
        if (typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined' && Player.elements && Player.elements.length > 0) {
            const mainElement = Player.elements[0];
            const enemyLevel = this.enemy.level || 1;
            const talentExp = Math.floor(5 + enemyLevel * 2); // 基础5点 + 等级×2
            const talentResult = Player.addElementTalentExp(mainElement, talentExp);
            if (talentResult.leveledUp) {
                this.addLog(`🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！`, 'buff');
            }
        }

        // 更新任务进度
        const completedQuests = QuestSystem.updateProgress('kill', this.enemy.id, 1);

        this.addLog(`获得 ${rewards.exp} 经验，${rewards.gold} 金币${rewards.goldCrit ? ' 💰金币暴击！' : ''}`, 'system');
        if (rewards.items.length > 0) {
            rewards.items.forEach(item => {
                this.addLog(`获得 ${item.name} x${item.count}`, 'system');
            });
        }
        if (expResult.levelUps.length > 0) {
            this.addLog(`🎉 升级了！当前等级 ${Player.level}，获得3点属性点`, 'system');
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
    },

    /**
     * 添加战斗日志
     */
    addLog(text, type = 'normal') {
        this.log.push({ text, type, turn: this.turn });
        // 只保留最近50条
        if (this.log.length > 50) {
            this.log.shift();
        }
    },

    /**
     * 获取战斗状态
     */
    getState() {
        return {
            active: this.active,
            turn: this.turn,
            player: this.player,
            enemy: this.enemy,
            isPlayerTurn: this.isPlayerTurn,
            playerCasting: this.playerCasting,
            enemyCasting: this.enemyCasting,
            summon: this.summon,
            result: this.result,
            rewards: this.rewards || null,
            log: this.log.slice(-10), // 最近10条
            speed: this.speed // 战斗速度
        };
    },

    /**
     * 结束战斗，清理状态
     */
    endBattle() {
        this.active = false;
        this.playerCasting = null;
        this.enemyCasting = null;
        
        // 同步玩家状态
        Player.hp = this.player.hp;
        Player.mp = this.player.mp;
        
        // 发布战斗结束事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.BATTLE_END, {
                result: this.result,
                enemy: this.enemy,
                stats: this.stats,
                rating: this.rating,
                turn: this.turn
            });
        }
    },

    /**
     * 检查战斗相关成就
     */
    checkBattleAchievements() {
        try {
            if (typeof WorldState === 'undefined' || typeof DataAchievements === 'undefined') return;
            
            // 获取总击杀数
            const bestiaryStats = Player.getBestiaryStats();
            const totalKills = bestiaryStats.totalKills || 0;
            
            // 击杀数量成就
            const killAchievements = [
                { id: 'first_blood', value: 1 },
                { id: 'slayer_10', value: 10 },
                { id: 'slayer_100', value: 100 },
                { id: 'slayer_1000', value: 1000 },
            ];
            
            killAchievements.forEach(ach => {
                if (totalKills >= ach.value && !WorldState.hasAchievement(ach.id)) {
                    const achData = DataAchievements[ach.id];
                    if (achData) {
                        WorldState.unlockAchievement(ach.id, achData);
                    }
                }
            });
            
            // 精英怪击杀成就
            if (this.enemy.isElite || this.enemy.tier === 'warrior') {
                if (!WorldState.hasAchievement('elite_killer')) {
                    const achData = DataAchievements['elite_killer'];
                    if (achData) {
                        WorldState.unlockAchievement('elite_killer', achData);
                    }
                }
            }
            
            // BOSS击杀成就（统领级）
            if (this.enemy.tier === 'commander' || this.enemy.isBoss) {
                if (!WorldState.hasAchievement('boss_killer')) {
                    const achData = DataAchievements['boss_killer'];
                    if (achData) {
                        WorldState.unlockAchievement('boss_killer', achData);
                    }
                }
            }
            
            // 连胜成就
            const winStreak = Player.winStreak || 0;
            if (winStreak >= 5 && !WorldState.hasAchievement('win_streak_5')) {
                const achData = DataAchievements['win_streak_5'];
                if (achData) {
                    WorldState.unlockAchievement('win_streak_5', achData);
                }
            }
            
            // 毫发无伤成就（战斗中未受到伤害）
            if (!this.tookDamage && !WorldState.hasAchievement('flawless_victory')) {
                const achData = DataAchievements['flawless_victory'];
                if (achData) {
                    WorldState.unlockAchievement('flawless_victory', achData);
                }
            }
            
            // 浴火重生成就（生命值低于10%时获胜）
            const hpPercent = this.player.hp / this.player.maxHp;
            if (hpPercent <= 0.1 && !WorldState.hasAchievement('near_death_win')) {
                const achData = DataAchievements['near_death_win'];
                if (achData) {
                    WorldState.unlockAchievement('near_death_win', achData);
                }
            }
            
        } catch (e) {
            console.warn('[Battle] 成就检查失败:', e);
        }
    },
};
