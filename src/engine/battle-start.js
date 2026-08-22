/**
 * 战斗系统 - 战斗启动模块
 * 
 * 从battle.js拆分出的独立战斗启动模块
 * 包含：开始战斗（startBattle）
 */
    startBattle(enemyData, options = {}) {
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
        this.bossPhase2 = false;  // Boss战第二阶段标记
        this.huntFled = false;  // 狩猎战妖魔逃跑标记
        this.lastSkillId = null;  // v0.15.0: 上次使用的技能ID，用于重复上次技能
        this.huntFailed = false;  // 狩猎战妖魔逃跑失败标记
        this.usedElements = new Set();  // 本场战斗使用过的元素系
        this.elementEnergy = 0;  // v0.86.0: 元素能量（初阶魔法积累，满5点后下一个中高阶魔法爆发）
        this.elementEnergyMax = 5;  // 元素能量上限
        this.playerDefendedLastTurn = false;  // v2.9.0: 玩家上回合是否防御（用于抗打断）
        this.skillCooldowns = {};  // v0.86.0: 技能冷却状态
        this.source = options.source || 'normal';  // v0.99.1: 战斗来源（normal/hunt/event/quest）
        this.allies = options.allies || [];  // v1.8.0: NPC队友列表
        // v1.8.1: 给队友设置默认战斗风格
        this.allies.forEach(a => { if (!a.style) a.style = 'balanced'; });
        this.allyCommands = {};  // v1.8.0: 队友指令（集火/防御/技能/自由）
        this.investigationBonus = options.investigationBonus || 0;  // v1.8.0: 调查加成（0-0.3）

        // v2.2.0: 初始化天赋战斗状态系统
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.init(this.player);
        }
        
        // 战斗模式选项
        this.battleOptions = {
            mode: options.mode || 'normal',  // normal / duel / gauntlet
            canUseItems: options.canUseItems !== false,  // 是否可以使用道具
            canFlee: options.canFlee !== false,  // 是否可以逃跑
            winHpPercent: options.winHpPercent || 0,  // 胜利条件：对方HP低于这个百分比就胜利（0表示打到0）
            isFriendly: options.isFriendly || false  // 是否是友好切磋（不真的杀人）
        };
        
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
        
        // 初始化魔具技能
        this.magicTools = {
            available: [],  // 可用的魔具技能列表
            cooldowns: {}  // 冷却时间
        };
        this.initMagicTools();
        
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
        
        // 玩家战斗状态（必须在使用this.player之前初始化）
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
            isDefending: false,
            talentEffects: (typeof Player !== 'undefined' && Player.getAllTalentEffects) ? Player.getAllTalentEffects() : {},
            chargeStack: 0,
            chargeMax: 5,
            comboCount: 0,
            tideStack: 0,
            stealthActive: false,
            reviveUsed: false
        };

        // 应用天赋基础属性加成
        const te = this.player.talentEffects;
        if (te) {
            if (te.critRate) this.player.critRate += te.critRate;
            if (te.dodgeBonus) this.player.dodgeBonus = te.dodgeBonus;
            if (te.speedBonus) this.player.speed = Math.floor(this.player.speed * (1 + te.speedBonus));
            if (te.defenseBonus) this.player.defense = Math.floor(this.player.defense * (1 + te.defenseBonus));
            if (te.hpBonus) {
                this.player.maxHp = Math.floor(this.player.maxHp * (1 + te.hpBonus));
                this.player.hp = Math.min(this.player.hp, this.player.maxHp);
            }
            if (te.damageReduction) this.player.damageReduction = te.damageReduction;
            if (te.mpCostReduction) this.player.mpCostReduction = te.mpCostReduction;
        }

        // 应用疲劳减益
        if (typeof Player !== 'undefined' && Player.fatigueLevel > 0) {
            if (Player.fatigueLevel >= 2) {
                this.player.attack = Math.floor(this.player.attack * 0.7);
                this.player.defense = Math.floor(this.player.defense * 0.85);
                this.addLog('⚠️ 你受了重伤，攻击力-30%，防御力-15%！', 'debuff');
            } else {
                this.player.attack = Math.floor(this.player.attack * 0.85);
                this.addLog('⚠️ 你感到疲惫，攻击力-15%！', 'debuff');
            }
        }
        
        // 妖魔体质加成：不同级别妖魔实力差距巨大
        // 奴仆级：普通初阶法师打不过，突出的才能单挑
        // 战将级：普通中阶法师打不过，优秀的才能单挑
        // 统领级：对应高阶法师
        // 君主级：对应超阶法师
        if (this.enemy.enemyType === 'demon' || this.enemy.demonTier) {
            let hpBonus = 0;
            let atkBonus = 0;
            let defBonus = 0;
            
            const tier = this.enemy.demonTier;
            if (tier === 'servant' || tier === '奴仆级') {
                hpBonus = 0.2;   // HP+20%
                atkBonus = 0.15; // 攻击+15%
                defBonus = 0.1;  // 防御+10%
            } else if (tier === 'warrior' || tier === '战将级') {
                hpBonus = 0.5;   // HP+50%
                atkBonus = 0.3;  // 攻击+30%
                defBonus = 0.2;  // 防御+20%
            } else if (tier === 'commander' || tier === '统领级') {
                hpBonus = 1.0;   // HP+100%
                atkBonus = 0.5;  // 攻击+50%
                defBonus = 0.4;  // 防御+40%
            } else if (tier === 'monarch' || tier === '君主级') {
                hpBonus = 2.0;   // HP+200%
                atkBonus = 1.0;  // 攻击+100%
                defBonus = 0.8;  // 防御+80%
            }
            
            if (hpBonus > 0) {
                this.enemy.maxHp = Math.floor(this.enemy.maxHp * (1 + hpBonus));
                this.enemy.hp = this.enemy.maxHp;
            }
            if (atkBonus > 0) {
                this.enemy.attack = Math.floor(this.enemy.attack * (1 + atkBonus));
            }
            if (defBonus > 0) {
                this.enemy.defense = Math.floor(this.enemy.defense * (1 + defBonus));
            }
            
            // 记录原始数值，方便调试
            this.enemy.baseMaxHp = this.enemy.maxHp;
            this.enemy.baseAttack = this.enemy.attack;
            this.enemy.baseDefense = this.enemy.defense;
        }

        // v1.6.0: 恐惧/勇气系统 - 面对强大妖魔时触发恐惧
        if (options.fearLevel !== undefined) {
            // 手动指定恐惧等级（历练副本等特殊场景）
            if (options.fearLevel > 0) {
                this.player.statusEffects.push({
                    type: 'fear',
                    name: '恐惧',
                    level: options.fearLevel,
                    duration: 99
                });
                this.addLog(`😰 面对${this.enemy.name}，你感到一阵恐惧！（${options.fearLevel}级）`, 'debuff');
            }
        } else if (this.enemy.demonTier === 'warrior' || this.enemy.demonTier === '战将级') {
            // 战将级妖魔自动触发2级恐惧
            const playerLevel = Player.level || 1;
            const enemyLevel = this.enemy.level || 5;
            if (playerLevel < enemyLevel + 3) {
                const fearLevel = Math.min(3, Math.max(1, enemyLevel - playerLevel));
                this.player.statusEffects.push({
                    type: 'fear',
                    name: '恐惧',
                    level: fearLevel,
                    duration: 99
                });
                this.addLog(`😰 面对战将级妖魔${this.enemy.name}，你感到恐惧！（${fearLevel}级）`, 'debuff');
            }
        } else if (this.enemy.demonTier === 'commander' || this.enemy.demonTier === '统领级') {
            // 统领级妖魔自动触发3级恐惧
            this.player.statusEffects.push({
                type: 'fear',
                name: '恐惧',
                level: 3,
                duration: 99
            });
            this.addLog(`😱 面对统领级妖魔${this.enemy.name}，你感到极度恐惧！（3级）`, 'debuff');
        }

        // v0.9.0: 普通敌人强化（补偿战后恢复80%的平衡）
        // Boss/精英/决斗/试炼不强化（这些战斗本身就有挑战性）
        const battleMode = this.battleOptions?.mode;
        const isSpecialBattle = this.enemy.isBoss || this.enemy.isElite 
            || this.enemy.tier === 'commander' || this.enemy.demonTier === 'commander'
            || battleMode === 'duel' || battleMode === 'trial' || battleMode === 'boss';
        if (!isSpecialBattle) {
            this.enemy.attack = Math.floor(this.enemy.attack * 1.05);  // 攻击力+5%（v2.8.0从10%下调，避免叠加体质加成后过强）
            this.enemy.maxHp = Math.floor(this.enemy.maxHp * 1.10);   // HP+10%（v2.8.0从15%下调）
            this.enemy.hp = this.enemy.maxHp;
        }

        // v1.9.1: 暴躁之泉提前识破 - 妖魔攻击力降低20%
        if (this.player.flags?.demon_attack_reduced && this.enemy.enemyType === 'demon') {
            this.enemy.attack = Math.floor(this.enemy.attack * 0.8);
            this.addLog('🛡️ 军方防化措施生效！妖魔攻击力降低20%', 'buff');
        }
        
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

        // v0.70.0: 初始化精英妖魔机制
        this.enemy.isElite = !!this.enemy.elite;
        this.enemy.eliteState = {
            firstHitTaken: false,
            turnCount: 0,
            lastBewitchTurn: 0,
            lastVineDragTurn: 0
        };
        if (this.enemy.isElite) {
            this.addLog(`⚠️ 遭遇精英妖魔：${this.enemy.name}！`, 'warning');
            if (this.enemy.eliteMechanics) {
                const em = this.enemy.eliteMechanics;
                if (em.physical_reduction) this.addLog(`🛡️ ${this.enemy.name}拥有钢铁身躯，物理伤害减免${Math.floor(em.physical_reduction * 100)}%`, 'system');
                if (em.evasion_bonus) this.addLog(`💨 ${this.enemy.name}闪避率+${Math.floor(em.evasion_bonus * 100)}%`, 'system');
                if (em.regen_percent) this.addLog(`🌱 ${this.enemy.name}每回合恢复${Math.floor(em.regen_percent * 100)}%生命`, 'system');
            }
            if (this.enemy.weakness && this.enemy.weakness.length > 0) {
                this.addLog(`💡 弱点：${this.enemy.weakness.join('、')}系`, 'system');
            }
        }
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

                // v2.7.0: 机制型特性初始化
                this.enemy.mechanicCooldowns = {};
                this.enemy.mechanicState = {};
                traits.forEach(t => {
                    if (t.type === 'mechanic' && t.cooldown) {
                        this.enemy.mechanicCooldowns[t.mechanic] = 0; // 0表示可用
                    }
                });

                // v2.7.0: 统领威压 - 战斗开始时降低玩家攻击
                const pressureTrait = traits.find(t => t.id === 'commander_aura');
                if (pressureTrait && pressureTrait.effects) {
                    const debuff = pressureTrait.effects.playerAttackDebuff || 0.15;
                    const duration = pressureTrait.effects.duration || 3;
                    this.player._commanderPressure = { attackDebuff: debuff, turns: duration };
                    this.addLog(`👑 ${this.enemy.name}的统领威压！你的攻击力降低${Math.floor(debuff*100)}%（${duration}回合）`, 'debuff');
                }
            }
        }

        this.addLog(`遭遇了 ${this.enemy.name}！`, 'system');
        
        // 难度提示
        const levelDiff = this.enemy.level - this.player.level;
        let difficultyText = '';
        let difficultyColor = '';
        if (levelDiff <= -5) {
            difficultyText = '【简单】敌人远弱于你';
            difficultyColor = '#44ff44';
        } else if (levelDiff <= -2) {
            difficultyText = '【较易】敌人略弱于你';
            difficultyColor = '#88ff88';
        } else if (levelDiff <= 1) {
            difficultyText = '【普通】势均力敌';
            difficultyColor = '#ffff44';
        } else if (levelDiff <= 3) {
            difficultyText = '【困难】敌人较强，小心应对';
            difficultyColor = '#ffaa44';
        } else if (levelDiff <= 5) {
            difficultyText = '【危险】敌人远强于你！';
            difficultyColor = '#ff6644';
        } else {
            difficultyText = '【致命】九死一生！';
            difficultyColor = '#ff2222';
        }
        this.addLog(difficultyText, 'system');
        
        // 先手判定：速度高的先行动
        if (this.enemy.speed > this.player.speed) {
            this.isPlayerTurn = false;
            this.addLog(`${this.enemy.name} 速度更快，抢先出手！`, 'system');
            // 延迟执行敌人回合
            setTimeout(() => this.enemyTurn(), this.getDelay(1000));
        } else {
            this.addLog('你的速度更快，可以先行动。', 'system');
        }
        
        // 新手引导：第一次战斗自动显示帮助（不管谁先手）
        const tutorialDone = localStorage.getItem('quanzhi_fashi_battle_tutorial_done');
        if (!tutorialDone) {
            // 延迟一会儿显示，让玩家先看到战斗界面
            setTimeout(() => {
                this.showHelp();
                localStorage.setItem('quanzhi_fashi_battle_tutorial_done', '1');
            }, 500);
        }

        // 绑定键盘快捷键
        this._keyHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this._keyHandler);

        // 天赋：战斗开始时效果
        if (this.player.talentEffects) {
            const te = this.player.talentEffects;
            // 冰甲/晶化盾：战斗开始获得护盾
            if (te.iceShield && te.iceShield > 0) {
                const shieldAmount = Math.floor(this.player.maxHp * te.iceShield);
                this.addStatusEffect(this.player, { type: 'shield', name: '冰甲', value: shieldAmount, duration: 99 });
                this.addLog(`❄️ 冰甲护体！获得 ${shieldAmount} 点护盾！`, 'buff');
            }
            if (te.crystalShield && te.crystalShield > 0) {
                const shieldAmount = Math.floor(this.player.maxHp * te.crystalShield);
                this.addStatusEffect(this.player, { type: 'shield', name: '晶化盾', value: shieldAmount, duration: 99 });
                this.addLog(`💎 晶化盾！获得 ${shieldAmount} 点护盾！`, 'buff');
            }
            // 暗影形态：战斗开始隐身
            if (te.shadowForm) {
                this.addStatusEffect(this.player, { type: 'stealth', name: '暗影潜行', duration: te.shadowFormDuration || 1 });
                this.player.stealthActive = true;
                this.addLog(`🌑 暗影形态！进入隐身，首次攻击伤害翻倍！`, 'buff');
            }
            // 潜行天赋（stealthOnStart）：战斗开始隐身
            if (te.stealthOnStart && !te.shadowForm) {
                this.addStatusEffect(this.player, { type: 'stealth', name: '潜行', duration: te.stealthOnStart });
                this.player.stealthActive = true;
                this.addLog(`🌑 进入潜行状态！首次攻击伤害大幅提升！`, 'buff');
            }
            // 常驻护盾（permanentShield）：不破之盾
            if (te.permanentShield) {
                const shieldAmount = Math.floor(this.player.maxHp * (te.shieldRatio || 0.15));
                this.addStatusEffect(this.player, { type: 'shield', name: '不破之盾', value: shieldAmount, duration: 999 });
                this.addLog(`🛡️ 不破之盾生效！常驻 ${shieldAmount} 点护盾！`, 'buff');
            }
            // 光之护封（lightShield）：15%HP护盾
            if (te.lightShield) {
                const shieldAmount = Math.floor(this.player.maxHp * te.lightShield);
                this.addStatusEffect(this.player, { type: 'shield', name: '光之护封', value: shieldAmount, duration: 3 });
                this.addLog(`✨ 光之护封！获得 ${shieldAmount} 点护盾！`, 'buff');
            }
            // 绝对零度领域：开场冻结
            if (te.absoluteZeroField && this.enemy.hp > 0) {
                this.addStatusEffect(this.enemy, {
                    type: 'freeze', name: '绝对零度', duration: te.fieldFreezeDuration || 1
                });
                this.addLog(`❄️ 绝对零度领域！${this.enemy.name} 被冻结！`, 'element');
                // 领域冰抗降低（fieldIceResDown）
                if (te.fieldIceResDown) {
                    this.enemy.iceResistance = (this.enemy.iceResistance || 0) - te.fieldIceResDown;
                    this.addLog(`❄️ 极寒领域！${this.enemy.name} 冰系抗性降低！`, 'debuff');
                }
            }
            // 兽王威压：降低敌人攻防
            if (te.kingIntimidate && te.kingIntimidate > 0) {
                const reduce = te.intimidateAtkDown || te.kingIntimidate;
                this.enemy.attack = Math.floor(this.enemy.attack * (1 - reduce));
                this.enemy.defense = Math.floor(this.enemy.defense * (1 - (te.intimidateDefDown || reduce)));
                this.addLog(`👑 兽王威压！${this.enemy.name} 攻防降低！`, 'buff');
            }
            // 开场雷罚
            if (te.openingThunder && this.enemy.hp > 0) {
                const thunderDmg = Math.floor(this.player.attack * (te.openingThunderDamage || 1.5));
                this.applyDamage(this.enemy, { amount: thunderDmg, element: 'thunder', isMiss: false, isCrit: false }, this.player);
                this.addLog(`⚡ 九天应元！开场雷罚造成 ${thunderDmg} 点伤害！`, 'element');
                this.showDamageNumber('enemy', thunderDmg, 'crit');
            }
            // 黑暗领域：降低敌人命中
            if (te.enemyHitDown && this.enemy.hp > 0) {
                this.addStatusEffect(this.enemy, {
                    type: 'blind', name: '黑暗领域', duration: 99, hitMod: -te.enemyHitDown
                });
                this.addLog(`🌑 黑暗领域降临！${this.enemy.name} 命中率降低！`, 'element');
            }
            // v0.8.27: 开场自动召唤（openingSummon）
            if (te.openingSummon && Player.summonData && !this.summon) {
                this.performSummonFromTalent();
            }
        }

        return {
            player: this.player,
            enemy: this.enemy,
            isPlayerTurn: this.isPlayerTurn
        };
    },

// 导出模块集合
export const BattleStart = {
    startBattle
};

export default BattleStart;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleStart = BattleStart;
}