/**
 * 战斗系统
 * 贴近原著设计：星子引导、元素克制、精神力、打断机制
 */

import { BattleUtils } from './battle-utils.js';
import { startBattle as startBattleImpl } from './battle-start.js';
import { castSkillImmediate as castSkillImmediateImpl } from './battle-skill.js';
import { enemyTurn as enemyTurnImpl } from './battle-enemy-turn.js';
import { playerAttack as playerAttackImpl } from './battle-player-attack.js';
import { calculateDamage as calculateDamageImpl, applyDamage as applyDamageImpl } from './battle-damage.js';
import { endEnemyTurn as endEnemyTurnImpl } from './battle-end-enemy-turn.js';
import { summonAttack as summonAttackImpl } from './battle-summon.js';
import { tickStatusEffects as tickStatusEffectsImpl } from './battle-status.js';
import { calculateRewards as calculateRewardsImpl } from './battle-rewards.js';
import { showHelp as showHelpImpl } from './battle-help.js';
import { applyMagicToolEffect as applyMagicToolEffectImpl } from './battle-magic-tool.js';
import { getStatusModifiers as getStatusModifiersImpl } from './battle-status-modifiers.js';
import { processTraitsOnHit as processTraitsOnHitImpl } from './battle-traits.js';
import { addStatusEffect as addStatusEffectImpl } from './battle-add-status.js';
import { checkBattleEnd as checkBattleEndImpl } from './battle-check-end.js';
import { applyStatusEffects as applyStatusEffectsImpl } from './battle-apply-status.js';
import { applySpiritSeedEffects as applySpiritSeedEffectsImpl } from './battle-spirit-seed.js';
import { useTalentActiveSkill as useTalentActiveSkillImpl } from './battle-talent-active.js';
import { enemyAIBurst as enemyAIBurstImpl } from './battle-ai-burst.js';

export const BattleSystem = {
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
    
    // 自动战斗
    autoBattle: false,
    
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
     * 切换自动战斗
     */
    toggleAutoBattle() {
        this.autoBattle = !this.autoBattle;
        this.addLog(this.autoBattle ? '🤖 自动战斗已开启' : '🤖 自动战斗已关闭', 'system');
        if (typeof UI !== 'undefined' && UI.updateBattleScreen) {
            UI.updateBattleScreen();
        }
        // v0.47.1: 看门狗机制，确保自动战斗不卡住
        if (this.autoBattle) {
            this._startAutoBattleWatchdog();
        } else {
            this._stopAutoBattleWatchdog();
        }
    },

    /**
     * 启动自动战斗看门狗（定期检查并推进自动战斗）
     */
    _startAutoBattleWatchdog() {
        this._stopAutoBattleWatchdog();
        this._autoBattleTimer = setInterval(() => {
            if (!this.autoBattle || !this.active || this.player.hp <= 0) {
                clearInterval(this._autoBattleTimer);
                this._autoBattleTimer = null;
                return;
            }
            // 如果玩家正在引导技能且是玩家回合，自动结束回合推进引导
            if (this.playerCasting && this.isPlayerTurn) {
                this.endPlayerTurn();
                return;
            }
            if (!this.isPlayerTurn || this.playerCasting) {
                return;
            }
            this.autoPlayerTurn();
        }, 800);
    },

    /**
     * 停止自动战斗看门狗
     */
    _stopAutoBattleWatchdog() {
        if (this._autoBattleTimer) {
            clearInterval(this._autoBattleTimer);
            this._autoBattleTimer = null;
        }
    },
    
    /**
     * 自动战斗玩家AI
     */
    autoPlayerTurn() {
        if (!this.autoBattle || !this.isPlayerTurn || this.player.hp <= 0) {
            return;
        }
        
        // 如果玩家正在引导技能，不要打断
        if (this.playerCasting) {
            return;
        }
        
        try {
            const player = this.player;
            const enemy = this.enemy;
            const hpPercent = player.hp / player.maxHp;
            const mpPercent = player.mp / player.maxMp;
            
            // 1. HP低于30%，优先治疗
            if (hpPercent < 0.3) {
                // 找治疗技能
                const healSkill = this.findBestHealSkill();
                if (healSkill && player.mp >= healSkill.mpCost) {
                    const result = this.playerCastSkill(healSkill.id);
                    if (result !== null) return;
                }
                // 用治疗药水
                if (this.hasItem('health_potion')) {
                    this.playerUseItem('health_potion');
                    return;
                }
            }
            
            // 2. MP低于20%，用蓝药
            if (mpPercent < 0.2) {
                if (this.hasItem('mana_potion')) {
                    this.playerUseItem('mana_potion');
                    return;
                }
            }
            
            // 3. 使用伤害最高的可用技能（考虑元素克制）
            const damageSkill = this.findBestDamageSkill();
            if (damageSkill && player.mp >= damageSkill.mpCost) {
                const result = this.playerCastSkill(damageSkill.id);
                if (result !== null) return;
                // 如果技能释放失败（如冷却中），继续尝试下一个选项
            }
            
            // 4. 尝试使用其他可用技能（buff类等）
            const availableSkills = this.getAvailableSkills(player);
            for (const skillId of availableSkills) {
                const skill = SkillSystem.getSkill(skillId);
                if (skill && !skill.isDemonSkill && skill.type !== 'damage' && skill.type !== 'heal') {
                    if (skill.targetType === 'self' || skill.type === 'buff') {
                        const result = this.playerCastSkill(skillId);
                        if (result !== null) return;
                    }
                }
            }
            
            // 5. 普通攻击（安全回退）
            this.playerAttack();
        } catch (e) {
            console.error('[Battle] 自动战斗出错，回退到普通攻击:', e);
            this.addLog(`自动战斗出错: ${e.message}，使用普通攻击`, 'system');
            // 出错时安全回退到普通攻击
            try {
                this.playerAttack();
            } catch (e2) {
                console.error('[Battle] 普通攻击也失败了:', e2);
                this.addLog(`普通攻击也失败: ${e2.message}，跳过回合`, 'system');
                // 最后手段：直接结束玩家回合
                this.endPlayerTurn();
            }
        }
    },
    
    /**
     * 检查玩家是否有指定物品
     */
    hasItem(itemId) {
        if (typeof Player !== 'undefined' && Player.items) {
            if (Array.isArray(Player.items)) {
                const item = Player.items.find(i => i.id === itemId && i.count > 0);
                return !!item;
            } else if (typeof Player.items === 'object') {
                return Player.items[itemId] > 0;
            }
        }
        if (typeof Inventory !== 'undefined' && Inventory.hasItem) {
            return Inventory.hasItem(itemId);
        }
        return false;
    },
    
    /**
     * 找最好的治疗技能
     */
    findBestHealSkill() {
        const availableSkills = this.getAvailableSkills(this.player);
        let bestSkill = null;
        let bestHeal = 0;
        
        for (const skillId of availableSkills) {
            const skill = SkillSystem.getSkill(skillId);
            if (skill && skill.type === 'heal') {
                let healAmount = 0;
                if (skill.baseHeal) {
                    healAmount = skill.baseHeal;
                } else if (skill.healPercent) {
                    healAmount = Math.floor(this.player.maxHp * skill.healPercent);
                } else if (skill.healAmount) {
                    healAmount = skill.healAmount;
                }
                if (healAmount > bestHeal && this.player.mp >= skill.mpCost) {
                    bestHeal = healAmount;
                    bestSkill = skill;
                }
            }
        }
        return bestSkill;
    },
    
    /**
     * 找伤害最高的技能（考虑元素克制、power倍率、伤害倍率）
     */
    findBestDamageSkill() {
        const availableSkills = this.getAvailableSkills(this.player);
        let bestSkill = null;
        let bestDamage = 0;
        
        for (const skillId of availableSkills) {
            const skill = SkillSystem.getSkill(skillId);
            if (skill && skill.type === 'damage' && !skill.isDemonSkill) {
                // 计算基础伤害：支持baseDamage固定值和power基于攻击力倍率
                let baseDamage = skill.baseDamage || 0;
                if (skill.power) {
                    baseDamage = Math.max(baseDamage, this.player.attack * skill.power);
                }
                // 伤害倍率
                const damageMultiplier = skill.damageMultiplier || 1;
                let finalDamage = baseDamage * damageMultiplier;
                
                // 元素克制加分
                if (skill.element && this.enemy.elements) {
                    for (const elem of this.enemy.elements) {
                        if (this.isElementStrong(skill.element, elem)) {
                            finalDamage *= 1.5;
                        }
                        if (this.isElementWeak(skill.element, elem)) {
                            finalDamage *= 0.75;
                        }
                    }
                }

                // v1.8.0: 调查加成（调查充分的玩家伤害提升）
                if (this.investigationBonus > 0) {
                    finalDamage *= (1 + this.investigationBonus);
                }
                
                // 状态效果加分（DOT、控制等）
                if (skill.statusEffects && skill.statusEffects.length > 0) {
                    for (const effect of skill.statusEffects) {
                        if (effect.type === 'burn' || effect.type === 'poison' || effect.type === 'bleed') {
                            finalDamage += (effect.dotDamage || 3) * (effect.duration || 2);
                        }
                        if (effect.type === 'stun' || effect.type === 'freeze' || effect.type === 'paralyze') {
                            finalDamage += this.player.attack * 0.5; // 控制效果等价于多打一下
                        }
                    }
                }
                
                if (finalDamage > bestDamage && this.player.mp >= skill.mpCost) {
                    bestDamage = finalDamage;
                    bestSkill = skill;
                }
            }
        }
        return bestSkill;
    },
    
    /**
     * 元素克制判断 - 攻击方是否克制防守方
     */
    isElementStrong(attackElement, defendElement) {
        return BattleUtils.isElementStrong(attackElement, defendElement);
    },
    
    /**
     * 元素被克判断 - 攻击方是否被防守方克制
     */
    isElementWeak(attackElement, defendElement) {
        return BattleUtils.isElementWeak(attackElement, defendElement);
    },
    
    /**
     * 显示战斗帮助
     */
    // 显示战斗帮助（已拆分到battle-help.js）
    showHelp() {
        return showHelpImpl.call(this);
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
    // 开始战斗（已拆分到battle-start.js）
    startBattle(enemyData, options = {}) {
        return startBattleImpl.call(this, enemyData, options);
    },

    /**
     * 处理键盘快捷键
     */
    handleKeyPress(e) {
        if (!this.active || !this.isPlayerTurn) return;
        // 忽略输入框中的按键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toLowerCase();

        // 数字键1-9：使用对应技能
        if (key >= '1' && key <= '9') {
            const skillIndex = parseInt(key) - 1;
            if (this.player.skills && this.player.skills[skillIndex]) {
                const skillId = this.player.skills[skillIndex];
                const skill = SkillSystem.getSkill(skillId);
                if (skill && this.player.mp >= skill.mpCost) {
                    this.playerCastSkill(skillId);
                }
            }
            e.preventDefault();
        }
        // 空格键：普通攻击
        else if (key === ' ') {
            this.playerAttack();
            e.preventDefault();
        }
        // D键：防御
        else if (key === 'd') {
            this.playerDefend();
            e.preventDefault();
        }
        // F键：逃跑
        else if (key === 'f') {
            if (this.battleOptions.canFlee) {
                this.playerFlee();
            }
            e.preventDefault();
        }
        // A键：自动战斗
        else if (key === 'a') {
            this.toggleAutoBattle();
            e.preventDefault();
        }
        // S键：切换速度
        else if (key === 's') {
            this.toggleSpeed();
            e.preventDefault();
        }
    },
    
    /**
     * 初始化魔具技能
     */
    initMagicTools() {
        if (typeof Player === 'undefined' || typeof Player.equipment === 'undefined') return;
        
        const slots = ['weapon', 'armor', 'accessory'];
        slots.forEach(slot => {
            const itemId = Player.equipment[slot];
            if (!itemId) return;
            
            const item = typeof DataItems !== 'undefined' ? DataItems[itemId] : null;
            if (!item || !item.magicToolSkill) return;
            
            // 从物品数据中读取魔具技能配置
            const skillConfig = item.magicToolSkill;
            const skill = {
                id: skillConfig.id,
                name: skillConfig.name,
                icon: item.icon || '🔮',
                description: skillConfig.description,
                cooldown: skillConfig.cooldown || 3,
                effects: skillConfig.effects || [],
                itemId: itemId,
                itemName: item.name,
                magicToolType: item.magicToolType,
                magicToolGrade: item.magicToolGrade,
                element: item.element || null
            };
            
            this.magicTools.available.push(skill);
            this.magicTools.cooldowns[skill.id] = 0;
        });
    },
    
    /**
     * 使用魔具技能
     */
    useMagicTool(skillId) {
        if (!this.active || !this.isPlayerTurn) return null;
        
        const skill = this.magicTools.available.find(s => s.id === skillId);
        if (!skill) return null;
        
        // 检查冷却
        if (this.magicTools.cooldowns[skillId] > 0) {
            this.addLog(`${skill.name} 还在冷却中（${this.magicTools.cooldowns[skillId]}回合）`, 'system');
            return null;
        }
        
        this.player.isDefending = false;
        
        // 应用所有效果
        skill.effects.forEach(effect => {
            this.applyMagicToolEffect(effect, skill);
        });
        
        this.addLog(`你催动了 ${skill.name}！`, 'buff');
        
        // 设置冷却
        this.magicTools.cooldowns[skillId] = skill.cooldown;
        
        // 消耗回合
        this.endPlayerTurn();
        
        return { success: true, skill: skill };
    },

    /**
     * v2.2.0: 使用天赋主动技能
     * @param {string} talentId - 天赋ID
     */
    // 使用天赋主动技能（已拆分到battle-talent-active.js）
    useTalentActiveSkill(talentId) {
        return useTalentActiveSkillImpl.call(this, talentId);
    },

    /**
     * v2.5.4: 切换光系形态（圣光/圣盾）
     */
    toggleLightForm() {
        if (typeof TalentCombatSystem === 'undefined') return;
        const current = TalentCombatSystem.getLightForm();
        const next = current === 'holy' ? 'shield' : 'holy';
        TalentCombatSystem.setLightForm(next);
        this.addLog(`✨ 光系形态切换为${next === 'holy' ? '圣光（输出+20%）' : '圣盾（防御+30%）'}！`, 'buff');
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }
    },
    
    /**
     * 应用魔具效果
     */
    // 应用魔器效果（已拆分到battle-magic-tool.js）
    applyMagicToolEffect(effect, skill) {
        return applyMagicToolEffectImpl.call(this, effect, skill);
    },
    
    /**
     * 减少魔具冷却时间
     */
    tickMagicToolCooldowns() {
        for (const skillId in this.magicTools.cooldowns) {
            if (this.magicTools.cooldowns[skillId] > 0) {
                this.magicTools.cooldowns[skillId]--;
            }
        }
    },

    // 玩家攻击（已拆分到battle-player-attack.js）
    playerAttack() {
        return playerAttackImpl.call(this);
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

        // v0.86.0: 检查技能冷却
        if (this.skillCooldowns && this.skillCooldowns[skillId] > 0) {
            this.addLog(`${skill.name} 冷却中（还需${this.skillCooldowns[skillId]}回合）！`, 'system');
            return null;
        }

        // 检查是否需要召唤兽
        if (skill.requiresSummon && !this.summon) {
            this.addLog('当前没有召唤兽，无法使用此技能！', 'system');
            return null;
        }

        this.player.isDefending = false;

        // v0.15.0: 记录上次使用的技能（用于重复上次技能）
        this.lastSkillId = skillId;

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

        // 计算实际MP消耗（含天赋减免）
        let channelMpCost = skill.mpCost;
        if (this.player.mpCostReduction) {
            channelMpCost = Math.max(0, Math.floor(skill.mpCost * (1 - this.player.mpCostReduction)));
        }
        if (this.player.talentEffects && this.player.talentEffects.comboMpReduction && (this.player.comboCount || 0) > 0) {
            channelMpCost = Math.max(0, Math.floor(channelMpCost * (1 - this.player.talentEffects.comboMpReduction)));
        }
        // v2.9.4: 引导开始时只扣50%预付款，引导完成时扣剩余50%
        // 被打断时预付款不退还（净损失50%，与瞬发自打断统一）
        const prepayMp = Math.floor(channelMpCost * 0.5);
        this.player.mp -= prepayMp;
        this.playerCasting.prepayMp = prepayMp;
        this.playerCasting.fullMpCost = channelMpCost;
        this.addLog(`你开始引导 ${skill.name}...（${castTime} 回合后释放，已预付 ${prepayMp} MP）`, 'magic');
        
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

    // 立即释放技能（已拆分到battle-skill.js）
    castSkillImmediate(skill, caster, skipTurnEnd = false, skipInterruptCheck = false, mpCostRatio = 1.0) {
        return castSkillImmediateImpl.call(this, skill, caster, skipTurnEnd, skipInterruptCheck, mpCostRatio);
    },

    /**
     * 玩家行动：防御
     */
    playerDefend() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = true;
        this.playerDefendedLastTurn = true;  // v2.9.0: 标记上回合防御，下回合施法抗打断+20%
        
        // 防御恢复MP（10%最大MP）
        const mpRecover = Math.floor(this.player.maxMp * 0.10);
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
     * 玩家行动：冥想（集中精神回蓝回血，跳过攻击）
     */
    playerMeditate() {
        if (!this.active || !this.isPlayerTurn) return null;

        // 冥想恢复25%最大MP和10%最大HP
        const mpRecover = Math.floor(this.player.maxMp * 0.25);
        const hpRecover = Math.floor(this.player.maxHp * 0.10);

        const oldMp = this.player.mp;
        const oldHp = this.player.hp;
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRecover);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + hpRecover);

        const actualMp = this.player.mp - oldMp;
        const actualHp = this.player.hp - oldHp;

        this.addLog(`你闭目冥想，恢复了 ${actualMp} 点MP和 ${actualHp} 点HP`, 'heal');

        this.endPlayerTurn();
        return { meditate: true, mpRecover: actualMp, hpRecover: actualHp };
    },

    /**
     * 玩家行动：恢复（防御+冥想合并，只恢复MP）
     */
    playerRecover() {
        if (!this.active || !this.isPlayerTurn) return null;

        // 恢复20点MP（低于低级魔法药水的30点，体现道具价值）
        const mpRecover = 20;
        const oldMp = this.player.mp;
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRecover);
        const actualMp = this.player.mp - oldMp;

        this.addLog(`你集中精神恢复，恢复了 ${actualMp} 点MP`, 'heal');
        this.showDamageNumber('player', actualMp, 'heal');

        this.endPlayerTurn();
        return { recover: true, mpRecover: actualMp };
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

        // 直接在战斗中应用恢复效果，确保数值正确
        let healMsg = '';
        if (item.effects) {
            if (item.effects.hp) {
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(this.player);
                let rawHeal = Math.floor(item.effects.hp * healMultiplier);
                const healAmount = Math.min(rawHeal, this.player.maxHp - this.player.hp);
                this.player.hp += healAmount;
                healMsg += `恢复了 ${healAmount} 点生命${healMultiplier < 1 ? '（治疗效果降低）' : ''} `;
            }
            if (item.effects.mp) {
                const mpAmount = Math.min(item.effects.mp, this.player.maxMp - this.player.mp);
                this.player.mp += mpAmount;
                healMsg += `恢复了 ${mpAmount} 点魔法值 `;
            }
        }
        
        // 同步到Player对象
        Player.hp = this.player.hp;
        Player.mp = this.player.mp;

        this.addLog(`你使用了 ${item.name}，${healMsg || result.message}`, 'system');
        
        // 立即更新UI，让玩家看到效果
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }

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
            this.applyDamage(this.enemy, dmg, this.player);
        }

        // 处理净化类道具
        if (item.effects && item.effects.cleanse) {
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness', 'bleed', 'healing_reduction', 'bind', 'blind', 'confuse'];
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

        // v0.38.0: 逃跑成功率提升（基础60%，最低25%，最高90%）
        const speedDiff = this.player.speed - this.enemy.speed;
        const fleeChance = Math.min(0.9, Math.max(0.25, 0.6 + speedDiff * 0.02));
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
        try {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) return;

        this.isPlayerTurn = false;
        this.enemy.isDefending = false; // 重置敌人防御状态
        // 重置本回合连击计数
        this.player.comboCount = 0;
        
        // 减少魔具技能冷却时间
        this.tickMagicToolCooldowns();
        
        // v0.86.0: 减少技能冷却时间
        for (const skillId in this.skillCooldowns) {
            if (this.skillCooldowns[skillId] > 0) {
                this.skillCooldowns[skillId]--;
            }
        }
        
        // 处理玩家引导中的魔法
        if (this.playerCasting) {
            try {
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
                    
                    this.castSkillImmediate(skill, 'player', true, true, 0.5);
                    // 引导技能可能直接击杀敌人
                    if (this.checkBattleEnd()) return;
                    // 引导完成后继续执行后续逻辑（召唤兽攻击、敌人回合）
                }
            } catch (e) {
                console.error('[Battle] 引导技能处理出错:', e);
                this.addLog(`引导技能处理出错: ${e.message}`, 'system');
                this.playerCasting = null;
            }
        }

        // 召唤兽自动攻击
        if (this.summon && this.summon.hp > 0) {
            try {
                this.summonAttack();
                // 召唤兽攻击后检查战斗是否结束
                if (this.checkBattleEnd()) return;
            } catch (e) {
                console.error('[Battle] 召唤兽攻击出错:', e);
                this.addLog(`召唤兽攻击出错: ${e.message}`, 'system');
            }
        }

        // 敌人回合
        setTimeout(() => this.enemyTurn(), this.getDelay(800));
        } catch (e) {
            console.error('[Battle] endPlayerTurn出错:', e);
            this.addLog(`回合处理出错: ${e.message}，继续战斗`, 'system');
            // 确保敌人回合能执行
            setTimeout(() => this.enemyTurn(), this.getDelay(800));
        }
    },

    /**
     * 召唤兽攻击
     */
    // 召唤兽攻击（已拆分到battle-summon.js）
    summonAttack() {
        return summonAttackImpl.call(this);
    },

    /**
     * v0.8.27: 召唤兽死亡时触发效果（灵魂爆发+治疗）
     */
    triggerSummonDeath() {
        if (!this.summon) return;
        const te = this.player.talentEffects;
        if (!te) return;
        // 灵魂爆发：对敌人造成召唤兽攻击力200%伤害
        if (te.summonDeathBurst) {
            const burstDmg = Math.floor(this.summon.attack * te.summonDeathBurst);
            this.applyDamage(this.enemy, { amount: burstDmg, element: 'neutral', isMiss: false, isCrit: true }, this.player);
            this.addLog(`💥 灵魂爆发！${this.summon.name} 释放最后的力量，造成 ${burstDmg} 点伤害！`, 'special');
        }
        // 灵魂治愈：恢复玩家50%HP
        if (te.summonDeathHeal) {
            const healAmt = Math.floor(this.player.maxHp * te.summonDeathHeal);
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
            this.addLog(`💜 灵魂治愈！你恢复了 ${healAmt} 点生命！`, 'heal');
        }
    },

    /**
     * v0.8.27: 从天赋自动召唤（开场召唤）
     */
    performSummonFromTalent() {
        if (!Player.summonData) return;
        const sd = Player.summonData;
        const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
        const baseStats = currentData ? currentData.effectiveStats : {
            maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
        };
        const levelBonus = 1 + (sd.level - 1) * 0.15;
        const loyaltyBonus = 1 + (sd.loyalty - 50) / 200;
        let summonMaxHp = Math.floor(baseStats.maxHp * levelBonus * loyaltyBonus);
        let summonAtk = Math.floor(baseStats.attack * levelBonus * loyaltyBonus);
        let summonDef = Math.floor(baseStats.defense * levelBonus * loyaltyBonus);
        let summonSpd = Math.floor(baseStats.speed * levelBonus * loyaltyBonus);
        let duration = 5;
        const te = this.player.talentEffects;
        if (te) {
            if (te.summonLevelBonus) {
                const m = 1 + te.summonLevelBonus * 0.15;
                summonAtk = Math.floor(summonAtk * m); summonDef = Math.floor(summonDef * m);
                summonMaxHp = Math.floor(summonMaxHp * m); summonSpd = Math.floor(summonSpd * m);
            }
            if (te.summonAllStats) { const m = 1 + te.summonAllStats; summonAtk = Math.floor(summonAtk*m); summonDef = Math.floor(summonDef*m); summonMaxHp = Math.floor(summonMaxHp*m); summonSpd = Math.floor(summonSpd*m); }
            if (te.summonHpBonus) summonMaxHp = Math.floor(summonMaxHp * (1 + te.summonHpBonus));
            if (te.summonDamageBonus) summonAtk = Math.floor(summonAtk * (1 + te.summonDamageBonus));
            if (te.inheritStats) { summonAtk += Math.floor(this.player.attack * te.inheritStats); summonDef += Math.floor(this.player.defense * te.inheritStats); }
            if (te.summonInheritHp) summonMaxHp += Math.floor(this.player.maxHp * te.summonInheritHp);
            if (te.summonDurationBonus) duration += te.summonDurationBonus;
        }
        this.summon = {
            id: sd.id, baseId: sd.baseId || sd.id, name: sd.name, icon: sd.icon,
            evolutionStage: sd.evolutionStage || 0, level: sd.level + (te?.summonLevelBonus || 0),
            loyalty: sd.loyalty, maxHp: summonMaxHp, hp: summonMaxHp, attack: summonAtk,
            defense: summonDef, speed: summonSpd, remainingDuration: duration,
            buffs: [], statusEffects: [], expGained: 0,
            critRate: te?.summonCritRate || 0.05, critDamage: 1.5 + (te?.summonCritDamage || 0)
        };
        this.addLog(`🌟 兽王天赋！${sd.icon} ${sd.name} 自动出现助战！（持续${duration}回合）`, 'evolution');
    },

    // v1.8.0: NPC队友回合
    allyTurn() {
        try {
            if (!this.allies || this.allies.length === 0) {
                this.enemyTurn();
                return;
            }

            // 找到第一个还能行动的队友
            const ally = this.allies.find(a => a.hp > 0 && !a.acted);
            if (!ally) {
                // 所有队友都行动完了，重置标记，进入敌人回合
                this.allies.forEach(a => a.acted = false);
                this.enemyTurn();
                return;
            }

            ally.acted = true;

            // 检查队友是否被控制
            if (this.isStunned(ally)) {
                this.addLog(`${ally.name} 被控制，无法行动！`, 'system');
                setTimeout(() => this.allyTurn(), this.getDelay(800));
                return;
            }

            // v1.8.1: 战斗风格影响伤害（进攻+25%/防御-25%但有概率减伤/平衡正常）
            const style = ally.style || 'balanced';
            let damageMultiplier = 1.0;
            let styleText = '';
            if (style === 'aggressive') {
                damageMultiplier = 1.25;
                styleText = '（猛攻）';
            } else if (style === 'defensive') {
                damageMultiplier = 0.75;
                styleText = '（谨慎）';
            }

            // 简单AI：根据系别选择攻击方式
            const damage = Math.floor(ally.attack * (0.8 + Math.random() * 0.4) * damageMultiplier);
            const elementName = this.getElementName(ally.element);
            this.addLog(`${ally.name}${styleText}释放了${elementName}魔法，造成 ${damage} 点伤害！`, 'ally');
            this.enemy.hp = Math.max(0, this.enemy.hp - damage);
            this.stats.totalDamageDealt += damage;

            // 更新UI
            this.updateUI();

            // 检查敌人是否死亡
            if (this.enemy.hp <= 0) {
                this.endBattle('win');
                return;
            }

            // 下一个队友行动
            setTimeout(() => this.allyTurn(), this.getDelay(800));
        } catch (e) {
            console.error('[Battle] allyTurn错误:', e);
            this.enemyTurn();
        }
    },

    // v1.8.0: 获取元素中文名
    getElementName(element) {
        return BattleUtils.getElementName(element);
    },

    // 敌人回合（已拆分到battle-enemy-turn.js）
    enemyTurn() {
        return enemyTurnImpl.call(this);
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
                    elements: this.enemy.elements || [],
                    _battleTurn: this.turn || 1
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
                if (decision && decision.action === 'attack') {
                    return { type: 'attack' };
                } else if (decision && decision.action === 'defend') {
                    return { type: 'defend' };
                } else if (decision && decision.action === 'skill' && decision.skillId) {
                    return { type: 'skill', skillId: decision.skillId };
                }
                
                // Utility AI返回无效行动，降级到备用AI
                console.warn('[Battle] Utility AI返回无效行动，使用备用AI:', decision);
                
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
    // 敌人爆发AI（已拆分到battle-ai-burst.js）
    enemyAIBurst() {
        return enemyAIBurstImpl.call(this);
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
     * 召唤兽获得经验
     */
    gainSummonExp(amount) {
        if (!Player.summonData) return false;
        const sd = Player.summonData;
        sd.exp += amount;
        let leveledUp = false;
        while (sd.exp >= sd.expToNext && sd.level < 30) {
            sd.exp -= sd.expToNext;
            sd.level++;
            sd.expToNext = Math.floor(50 * Math.pow(1.3, sd.level - 1));
            leveledUp = true;
            this.addLog(`📈 ${sd.icon} ${sd.name} 升到了 Lv.${sd.level}！`, 'evolution');
        }
        // 检查进化（非战斗中自动进化，需要在UI中提示）
        if (leveledUp && typeof canEvolve === 'function') {
            const evo = canEvolve(sd, Player.realm);
            if (evo) {
                this.addLog(`✨ ${sd.icon} ${sd.name} 似乎可以进化了...在角色面板中查看！`, 'evolution');
            }
        }
        return leveledUp;
    },

    /**
     * 在回合处理中检测到战斗结束时的收尾处理
     * （DoT致死、玩家被敌人击杀、光环伤害致死等异步结束场景）
     */
    _onBattleEndDuringTurn() {
        // 立即更新UI显示最终状态
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }
        // 延迟触发战斗结束，让玩家看到最后一击/致死原因
        setTimeout(() => {
            if (typeof Game !== 'undefined' && Game.endBattle) {
                Game.endBattle();
            }
        }, 600);
    },

    // 结束敌人回合（已拆分到battle-end-enemy-turn.js）
    endEnemyTurn() {
        return endEnemyTurnImpl.call(this);
    },

    // 伤害计算（已拆分到battle-damage.js）
    calculateDamage(attack, defense, multiplier, critRate, hitRate, element, targetElement, target, attacker) {
        return calculateDamageImpl.call(this, attack, defense, multiplier, critRate, hitRate, element, targetElement, target, attacker);
    },

    // 伤害应用（已拆分到battle-damage.js）
    applyDamage(target, damage, attacker) {
        return applyDamageImpl.call(this, target, damage, attacker);
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
                let regenAmount = Math.floor(unit.maxHp * trait.effects.hpRegenPercent);
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(unit);
                regenAmount = Math.floor(regenAmount * healMultiplier);
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
    // 处理命中时的妖魔特性（已拆分到battle-traits.js）
    processTraitsOnHit(attacker, target, damage, isPlayer) {
        return processTraitsOnHitImpl.call(this, attacker, target, damage, isPlayer);
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
     * v2.9.4: 统一打断概率计算
     * 适用于两种场景：
     *   1. 自打断：瞬发技能（castTime<=1）释放时自动判定施法是否失败
     *   2. 被攻击打断：引导技能（castTime>1）引导期间被攻击命中时判定
     * 统一公式：基础概率(castTime) × 技能难度系数(interruptChance)
     *           + 精神力差修正(仅被攻击打断) - 境界压制减免 - 防御姿态抗打断
     * @param {number} castTime - 施法时间（回合数）
     * @param {object} skill - 技能对象（含interruptChance难度系数、tier阶级）
     * @param {object} caster - 施法者（被打断目标）
     * @param {object|null} attacker - 攻击者（自打断时为null）
     * @param {boolean} casterDefendedLastTurn - 施法者上回合是否防御
     * @returns {number} 打断概率 0-0.95
     */
    calculateInterruptChance(castTime, skill, caster, attacker = null, casterDefendedLastTurn = false) {
        // 1. 基础概率（由castTime决定）：施法越久，每回合被打断风险越高
        const baseProbabilities = { 1: 0.08, 2: 0.15, 3: 0.22, 4: 0.30, 5: 0.38 };
        let chance = baseProbabilities[castTime] || 0.08;

        // 2. 技能难度系数（interruptChance字段，默认1.0；范围约1.0-1.7）
        const coefficient = skill.interruptChance || 1.0;
        chance *= coefficient;

        // 3. 精神力差修正（仅被攻击打断时，自打断无攻击者）
        if (attacker) {
            const attackerSpirit = attacker.spirit || 20;
            const casterSpirit = caster.spirit || 20;
            let spiritMod = (attackerSpirit - casterSpirit) * 0.003;
            spiritMod = Math.max(-0.10, Math.min(0.10, spiritMod));
            chance += spiritMod;
        }

        // 4. 境界压制减免（仅玩家施法时，高境界放低阶魔法更稳定）
        if (typeof Player !== 'undefined' && caster === this.player) {
            const reduction = Player.getInterruptReduction(skill.tier);
            if (reduction !== null && reduction > 0) {
                chance -= reduction;
            }
        }

        // 5. 防御姿态抗打断（上回合防御，本回合打断概率-20%）
        if (casterDefendedLastTurn) {
            chance -= 0.20;
        }

        // 6. 限制范围 0%-95%
        return Math.max(0, Math.min(0.95, chance));
    },

    /**
     * v2.9.1: 高阶魔法释放全屏特效
     * 屏幕闪光+震屏+元素颜色渐变+魔法爆发光圈
     */
    triggerHighTierEffect(skill) {
        if (typeof document === 'undefined') return;
        const elemColors = {
            fire: { main: '#ff4400', glow: '#ff8800', name: '烈焰' },
            ice: { main: '#00aaff', glow: '#88ddff', name: '寒冰' },
            thunder: { main: '#ffdd00', glow: '#ffff88', name: '雷霆' },
            wind: { main: '#88ffcc', glow: '#aaffdd', name: '风暴' },
            earth: { main: '#aa8844', glow: '#ccaa66', name: '山岳' },
            water: { main: '#0066ff', glow: '#4488ff', name: '深海' },
            light: { main: '#ffffcc', glow: '#ffffff', name: '圣光' },
            dark: { main: '#6600cc', glow: '#9933ff', name: '暗影' },
            heal: { main: '#00ff66', glow: '#66ffaa', name: '生命' },
            plant: { main: '#22aa22', glow: '#66dd44', name: '荆棘' },
            summon: { main: '#cc9966', glow: '#ddbb88', name: '召唤' }
        };
        const color = elemColors[skill.element] || { main: '#ffffff', glow: '#cccccc', name: '魔法' };
        const isSuper = skill.tier === '超阶';
        const intensity = isSuper ? 1.5 : 1;

        // 1. 全屏闪光覆盖
        const overlay = document.createElement('div');
        overlay.className = 'high-tier-overlay';
        overlay.style.background = `radial-gradient(circle at center, ${color.glow} 0%, ${color.main} 40%, transparent 70%)`;
        overlay.style.animationDuration = `${1.2 * intensity}s`;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1500 * intensity);

        // 2. 震屏效果
        const battleScreen = document.getElementById('battle-screen') || document.querySelector('.battle-container') || document.body;
        if (battleScreen) {
            battleScreen.classList.add('screen-shake');
            setTimeout(() => battleScreen.classList.remove('screen-shake'), 600);
        }

        // 3. 魔法爆发光圈
        const burst = document.createElement('div');
        burst.className = 'magic-burst';
        burst.style.background = `radial-gradient(circle, ${color.glow} 0%, ${color.main} 50%, transparent 70%)`;
        burst.style.boxShadow = `0 0 60px ${color.main}, 0 0 120px ${color.glow}`;
        burst.style.animationDuration = `${0.8 * intensity}s`;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 1000 * intensity);

        // 4. 战斗日志提示
        this.addLog(`🌟 ${isSuper ? '超阶' : '高阶'}魔法释放！${skill.name}`, 'high-tier');
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
    // 应用状态效果（已拆分到battle-apply-status.js）
    applyStatusEffects(target, effects, isPlayerTarget) {
        return applyStatusEffectsImpl.call(this, target, effects, isPlayerTarget);
    },

    /**
     * 为目标添加状态效果（BattleSystem包装方法）
     * 处理日志、事件、unpurgeable标记、debuff免疫等
     */
    // 添加状态效果（已拆分到battle-add-status.js）
    addStatusEffect(target, effect) {
        return addStatusEffectImpl.call(this, target, effect);
    },

    /**
     * 应用灵种特殊效果
     * 根据玩家炼化的灵种，额外施加状态效果
     */
    // 应用灵种特殊效果（已拆分到battle-spirit-seed.js）
    applySpiritSeedEffects(target, element) {
        return applySpiritSeedEffectsImpl.call(this, target, element);
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
    // 状态效果更新（已拆分到battle-status.js）
    tickStatusEffects(target, isPlayer) {
        return tickStatusEffectsImpl.call(this, target, isPlayer);
    },

    /**
     * 检查目标是否被眩晕/冻结，应跳过回合
     */
    isStunned(target) {
        return target.statusEffects.some(e => 
            e.type === 'stun' || 
            e.type === 'frozen' || 
            e.type === 'paralyze' ||
            e.type === 'bind' ||
            e.type === 'fear' ||
            e.skipTurn === true
        );
    },

    /**
     * 获取目标的状态效果修正值
     */
    // 获取状态修饰符（已拆分到battle-status-modifiers.js）
    getStatusModifiers(target) {
        return getStatusModifiersImpl.call(this, target);
    },

    /**
     * 获取目标的治疗乘数（受healing_reduction等状态影响）
     */
    getHealingMultiplier(target) {
        let multiplier = 1.0;
        if (target.statusEffects) {
            target.statusEffects.forEach(effect => {
                if (effect.type === 'healing_reduction' && effect.value) {
                    multiplier *= (1 - effect.value);
                }
            });
        }
        return Math.max(0, multiplier);
    },

    /**
     * 检查战斗是否结束
     */
    // 检查战斗结束（已拆分到battle-check-end.js）
    checkBattleEnd() {
        return checkBattleEndImpl.call(this);
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
    // 计算战斗奖励（已拆分到battle-rewards.js）
    calculateRewards() {
        return calculateRewardsImpl.call(this);
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
            allies: this.allies || [], // v1.8.1: 队友列表
            isPlayerTurn: this.isPlayerTurn,
            playerCasting: this.playerCasting,
            enemyCasting: this.enemyCasting,
            summon: this.summon,
            result: this.result,
            rewards: this.rewards || null,
            log: this.log.slice(-10), // 最近10条
            speed: this.speed, // 战斗速度
            autoBattle: this.autoBattle, // 自动战斗
            options: this.battleOptions, // 战斗模式选项
            magicTools: this.magicTools // 魔具技能
        };
    },

    /**
     * 结束战斗，清理状态
     */
    endBattle() {
        this.active = false;
        this.playerCasting = null;
        this.enemyCasting = null;
        this.autoBattle = false; // 结束战斗时关闭自动战斗
        this._stopAutoBattleWatchdog(); // v0.47.1: 停止看门狗

        // v2.2.0: 清理天赋战斗状态
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.cleanup();
        }
        // v2.2.0: 重置战斗临时状态
        if (this.player) {
            this.player.plantGrowthStacks = 0;
        }
        if (this.enemy) {
            this.enemy.curseStacks = 0;
        }

        // 关闭战斗帮助界面（避免残留）
        this.closeHelp();

        // 移除键盘快捷键监听
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        
        // 同步玩家状态
        Player.hp = this.player.hp;
        Player.mp = this.player.mp;

        // v0.38.0: 战斗胜利后恢复15%HP+20%MP（降低战后资源压力）
        if (this.result === 'win') {
            let hpRestoreRate = 0.15;
            let mpRestoreRate = 0.20;
            // v0.99.1: 连续猎魔疲劳（第4次后恢复减半，模拟疲惫）
            if (this.source === 'hunt' && (Player.dailyActions?.hunt || 0) >= 4) {
                hpRestoreRate = 0.075;
                mpRestoreRate = 0.10;
                this.addLog('⚠️ 连续猎魔感到疲惫，战后恢复效果减半', 'debuff');
            }
            const hpRestore = Math.floor(Player.maxHp * hpRestoreRate);
            const mpRestore = Math.floor(Player.maxMp * mpRestoreRate);
            Player.hp = Math.min(Player.maxHp, Player.hp + hpRestore);
            Player.mp = Math.min(Player.maxMp, Player.mp + mpRestore);
            this.addLog(`💚 战斗胜利，恢复 ${hpRestore} HP、${mpRestore} MP`, 'system');

            // v2.9.1: 战斗统计信息
            const battleStats = [];
            if (this.interruptCount && this.interruptCount > 0) {
                battleStats.push(`🔮 打断施法 ${this.interruptCount} 次`);
            }
            if (this.stats?.critCount && this.stats.critCount > 0) {
                battleStats.push(`💥 暴击 ${this.stats.critCount} 次`);
            }
            if (this.stats?.totalDamage && this.stats.totalDamage > 0) {
                battleStats.push(`⚔️ 总伤害 ${this.stats.totalDamage}`);
            }
            if (this.turn && this.turn > 0) {
                battleStats.push(`⏱️ 用时 ${this.turn} 回合`);
            }
            if (battleStats.length > 0) {
                this.addLog(`📊 战斗统计：${battleStats.join('，')}`, 'system');
            }
        }

        // v0.15.0: 战斗胜利时记录技能记忆（对该妖魔最后使用的技能）
        if (this.result === 'win' && this.lastSkillId && this.enemy && this.enemy.id) {
            if (typeof Player !== 'undefined' && Player.skillMemory !== undefined) {
                Player.skillMemory[this.enemy.id] = this.lastSkillId;
            }
        }

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

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.BattleSystem = BattleSystem;