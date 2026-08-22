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
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">💥 元素反应</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">特定元素与状态结合会触发强力反应：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><b style="color: #ff9944;">蒸发</b>：火 + 潮湿 → 伤害+30%</li>
                                <li><b style="color: #ffaa66;">融化</b>：火 + 冻结 → 伤害+30%</li>
                                <li><b style="color: #ffdd44;">感电</b>：雷 + 潮湿 → 伤害+20%，附加麻痹</li>
                                <li><b style="color: #88ddff;">冻结</b>：冰 + 潮湿 → 伤害+20%，附加冻结</li>
                                <li><b style="color: #aa88ff;">超导</b>：雷 + 冻结 → 降低防御</li>
                                <li><b style="color: #88cc88;">结晶</b>：土 + 元素 → 产生护盾</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">🔮 精神力与引导</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>高阶魔法需要引导多回合才能释放</li>
                                <li>精神力越高，引导速度越快</li>
                                <li>攻击有概率打断敌人引导（精神力对抗）</li>
                                <li>精神力越高，越不容易被打断</li>
                                <li>控制效果（麻痹/冻结/眩晕）受精神力抵抗</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #ff9966; margin-bottom: 8px; font-size: 16px;">⚡ 打断概率系统（v2.9.0）</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">施法速度体现在<b style="color:#ff9966;">被打断概率</b>上，不是回合引导：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><b style="color:#88ff88;">初阶魔法</b>：打断概率5-15%（几乎瞬发）</li>
                                <li><b style="color:#ffcc66;">中阶魔法</b>：打断概率20-40%</li>
                                <li><b style="color:#ff6644;">高阶魔法</b>：打断概率45-70%</li>
                                <li>被打断后魔法失败，损失50%MP</li>
                            </ul>
                            <p style="margin: 8px 0 4px 0;"><b style="color:#66ccff;">境界压制减免</b>：境界越高，对低阶魔法掌控越强：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>中阶放初阶：-15%打断概率</li>
                                <li>高阶放初阶：-30%，放中阶：-15%</li>
                                <li>超阶放初阶：-45%，放中阶：-30%，放高阶：-15%</li>
                            </ul>
                            <p style="margin: 8px 0 4px 0;"><b style="color:#66ffaa;">防御姿态抗打断</b>：上回合防御，本回合打断概率-20%</p>
                            <p style="margin: 8px 0 4px 0;"><b style="color:#ff66ff;">打断敌方施法</b>：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>仅<b style="color:#66ccff;">魔法师敌人</b>（🔮法师标记）有引导施法，妖魔不引导</li>
                                <li>普通攻击命中有概率打断（10-60%，精神力对抗）</li>
                                <li><b style="color:#66ccff;">控制技能</b>（眩晕/沉默/冰冻/麻痹/束缚等）100%打断</li>
                                <li>敌方引导时头顶显示进度，脉冲动画提示</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">👹 妖魔天赋</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">每个妖魔都有独特的种族天赋：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><b style="color: #ff8866;">高速型</b>：速度快，闪避高，先手攻击</li>
                                <li><b style="color: #8888ff;">防御型</b>：防御高，血量厚，难以击败</li>
                                <li><b style="color: #ff4444;">攻击型</b>：攻击力强，伤害高</li>
                                <li><b style="color: #aa44ff;">控制型</b>：会施加各种负面状态</li>
                                <li>注意观察敌人的特点，制定策略</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">📊 状态效果</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                                <span>🔥 灼烧：持续掉血</span>
                                <span>❄️ 冻结：无法行动</span>
                                <span>⚡ 麻痹：无法行动</span>
                                <span>🐌 减速：速度降低</span>
                                <span>💀 诅咒：攻击降低</span>
                                <span>🛡️ 护盾：吸收伤害</span>
                                <span>💚 再生：持续回血</span>
                                <span>💨 加速：速度提升</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">💡 战斗技巧</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li>利用元素克制可以大幅提高伤害</li>
                            <li>尝试触发元素反应获得额外效果</li>
                            <li>防御可以在危险时减少伤害，还能回蓝</li>
                            <li>打断敌人引导可以避免高额伤害</li>
                            <li>MP不足时用普攻或防御回蓝</li>
                            <li>妖魔有独特的种族天赋，注意观察</li>
                            <li>右上角可以调整战斗速度</li>
                            <li>战斗评价越高，奖励越丰厚</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">⌨️ 快捷键</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                                <span><b>1-9</b>：使用技能</span>
                                <span><b>空格</b>：普通攻击</span>
                                <span><b>D</b>：防御</span>
                                <span><b>F</b>：逃跑</span>
                                <span><b>A</b>：自动战斗</span>
                                <span><b>S</b>：切换速度</span>
                            </div>
                        </div>
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
    useTalentActiveSkill(talentId) {
        if (!this.active || !this.isPlayerTurn) return null;

        // 获取玩家天赋（v2.4.1: 修复talents是对象格式）
        const talentList = this.player.talents ? Object.values(this.player.talents) : [];
        const playerTalent = talentList.find(t => t.talentId === talentId);
        if (!playerTalent) {
            this.addLog('未装备该天赋', 'system');
            return null;
        }

        // 获取天赋数据
        const talentData = typeof DataTalents !== 'undefined' ? DataTalents[talentId] : null;
        if (!talentData || !talentData.activeSkill) {
            this.addLog('该天赋没有主动技能', 'system');
            return null;
        }

        // 检查等级（Lv5解锁主动技能）
        if (playerTalent.level < 5) {
            this.addLog(`天赋等级不足（需要Lv5，当前Lv${playerTalent.level}）`, 'system');
            return null;
        }

        const activeSkill = talentData.activeSkill;

        // 检查冷却
        if (typeof TalentCombatSystem !== 'undefined' && !TalentCombatSystem.canUseActiveSkill(activeSkill.id)) {
            const cd = TalentCombatSystem.getSkillCooldown(activeSkill.id);
            this.addLog(`${activeSkill.name} 还在冷却中（${cd}回合）`, 'system');
            return null;
        }

        // 检查资源消耗
        if (activeSkill.cost && typeof TalentCombatSystem !== 'undefined') {
            const resourceType = talentData.resourceType || talentData.element;
            const currentEnergy = TalentCombatSystem.getEnergy(resourceType);
            if (currentEnergy < activeSkill.cost) {
                this.addLog(`${activeSkill.name} 资源不足（需要${activeSkill.cost}，当前${currentEnergy}）`, 'system');
                return null;
            }
            // 消耗资源
            TalentCombatSystem.consumeEnergy(resourceType, activeSkill.cost);
        }

        this.player.isDefending = false;

        // 执行技能效果
        this.addLog(`你催动了天赋技能「${activeSkill.name}」！`, 'buff');

        // 伤害类主动技能
        if (activeSkill.damageMultiplier) {
            const baseDamage = Math.floor(this.player.attack * activeSkill.damageMultiplier);
            const damage = {
                amount: baseDamage,
                element: talentData.element,
                isCrit: false,
                isMiss: false
            };
            this.applyDamage(this.enemy, damage, this.player);
        }

        // 附加燃烧
        if (activeSkill.burnStacks && this.enemy.burnStacks !== undefined) {
            this.enemy.burnStacks = (this.enemy.burnStacks || 0) + activeSkill.burnStacks;
            this.addLog(`目标附加了${activeSkill.burnStacks}层燃烧！`, 'debuff');
        }

        // 附加寒霜
        if (activeSkill.frostGain && this.enemy.frostStacks !== undefined) {
            this.enemy.frostStacks = (this.enemy.frostStacks || 0) + activeSkill.frostGain;
        }

        // 麻痹效果（雷系主动技能）
        if (activeSkill.paralyzeChance && Math.random() < activeSkill.paralyzeChance) {
            const paralyzeEffect = {
                type: 'paralyze',
                name: '麻痹',
                duration: activeSkill.paralyzeDuration || 1,
                missChance: 0.5
            };
            this.applyStatusEffects(this.enemy, [paralyzeEffect], true);
            this.addLog(`目标被麻痹了！（${activeSkill.paralyzeDuration || 1}回合）`, 'debuff');
        }

        // 设置冷却
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.useActiveSkill(activeSkill.id, activeSkill.cooldown || 2);
        }

        // 消耗回合
        this.endPlayerTurn();

        return { success: true, skill: activeSkill };
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
    applyMagicToolEffect(effect, skill) {
        const value = effect.value || 0;
        const duration = effect.duration || 1;
        
        switch (effect.type) {
            case 'attack_buff': // 攻击提升
                const attackBuff = {
                    type: 'attack_up',
                    name: skill.name,
                    duration: duration,
                    attackMod: value,
                    isNextAttackOnly: effect.isNextAttackOnly || false
                };
                this.player.buffs.push(attackBuff);
                break;
                
            case 'defense_buff': // 防御提升
                const defenseBuff = {
                    type: 'defense_up',
                    name: skill.name,
                    duration: duration,
                    defenseMod: value
                };
                this.player.buffs.push(defenseBuff);
                break;
                
            case 'speed_buff': // 速度提升
                const speedBuff = {
                    type: 'speed_up',
                    name: skill.name,
                    duration: duration,
                    speedMod: value
                };
                this.player.buffs.push(speedBuff);
                break;
                
            case 'dodge_buff': // 闪避提升
                const dodgeBuff = {
                    type: 'evasion_up',
                    name: skill.name,
                    duration: duration,
                    dodgeMod: value
                };
                this.player.buffs.push(dodgeBuff);
                break;
                
            case 'shield': // 护盾
                const shieldBuff = {
                    type: 'shield',
                    name: skill.name,
                    duration: 99, // 直到被打破
                    shieldAmount: value,
                    maxShieldAmount: value
                };
                this.player.buffs.push(shieldBuff);
                break;
                
            case 'fire_resistance_buff': // 火系抗性提升
                const fireResBuff = {
                    type: 'fire_resistance_up',
                    name: skill.name,
                    duration: duration,
                    resistanceMod: value
                };
                this.player.buffs.push(fireResBuff);
                break;
                
            case 'next_dodge_guaranteed': // 下次必定闪避
                const nextDodgeBuff = {
                    type: 'next_dodge_guaranteed',
                    name: skill.name,
                    duration: duration,
                    value: value
                };
                this.player.buffs.push(nextDodgeBuff);
                break;
                
            case 'burn_chance': // 攻击有几率灼烧
                // 这个效果需要在攻击命中时触发，先加一个标记
                const burnChanceBuff = {
                    type: 'burn_chance_on_attack',
                    name: skill.name,
                    duration: duration,
                    chance: value,
                    damagePerTurn: effect.damagePerTurn || 10
                };
                this.player.buffs.push(burnChanceBuff);
                break;
                
            case 'freeze_chance_on_hit': // 受击时有几率冻结攻击者
                const freezeChanceBuff = {
                    type: 'freeze_chance_on_hit',
                    name: skill.name,
                    duration: 99, // 持续到护盾消失
                    chance: value,
                    freezeDuration: effect.duration || 1
                };
                this.player.buffs.push(freezeChanceBuff);
                break;
                
            case 'heal': // 治疗
                const healAmount = Math.floor(value);
                const oldHp = this.player.hp;
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                const actualHeal = this.player.hp - oldHp;
                this.addLog(`恢复了 ${actualHeal} 点生命值！`, 'heal');
                break;
                
            case 'mana_restore': // 恢复MP
                const manaAmount = Math.floor(value);
                const oldMp = this.player.mp;
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + manaAmount);
                const actualMana = this.player.mp - oldMp;
                this.addLog(`恢复了 ${actualMana} 点魔法值！`, 'heal');
                break;
                
            case 'cleanse': // 净化（移除负面状态）
                const removed = [];
                this.player.statusEffects = this.player.statusEffects.filter(s => {
                    const isDebuff = ['burn', 'freeze', 'frozen', 'stun', 'poison', 'slow', 'curse', 'blind', 'bind', 'paralyze', 'electrified'].includes(s.type);
                    if (isDebuff && !s.unpurgeable) {
                        removed.push(s.name || s.type);
                        return false;
                    }
                    return true;
                });
                if (removed.length > 0) {
                    this.addLog(`净化了 ${removed.length} 个负面状态！`, 'heal');
                } else {
                    this.addLog(`没有需要净化的负面状态。`, 'system');
                }
                break;
                
            case 'crit_buff': // 暴击率提升
                const critBuff = {
                    type: 'crit_up',
                    name: skill.name,
                    duration: duration,
                    critMod: value
                };
                this.player.buffs.push(critBuff);
                break;
                
            case 'hit_buff': // 命中率提升
                const hitBuff = {
                    type: 'hit_up',
                    name: skill.name,
                    duration: duration,
                    hitMod: value
                };
                this.player.buffs.push(hitBuff);
                break;
                
            case 'lifesteal': // 攻击吸血（持续效果）
                const lifestealBuff = {
                    type: 'lifesteal',
                    name: skill.name,
                    duration: duration,
                    lifestealPercent: value
                };
                this.player.buffs.push(lifestealBuff);
                break;
                
            case 'damage_reflect': // 伤害反弹（持续效果）
                const reflectBuff = {
                    type: 'damage_reflect',
                    name: skill.name,
                    duration: duration,
                    reflectPercent: value
                };
                this.player.buffs.push(reflectBuff);
                break;
                
            default:
                console.warn(`[MagicTool] 未知效果类型: ${effect.type}`);
        }
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
    applyStatusEffects(target, effects, isPlayerTarget) {
        const targetName = isPlayerTarget ? '你' : this.enemy.name;

        effects.forEach(effect => {
            // debuffImmunity：免疫负面状态
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'slow', 'poison', 'curse', 'paralyze', 'weakness', 'bleed', 'bind', 'blind', 'fear', 'shock', 'attack_down', 'defense_down'];
            if (target === this.player && target.talentEffects && target.talentEffects.debuffImmunity) {
                if (debuffTypes.includes(effect.type)) return; // 跳过负面状态
            }
            // 净化效果：清除所有负面状态
            if (effect.type === 'cleanse') {
                if (Math.random() < (effect.chance || 1.0)) {
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness', 'bleed', 'healing_reduction', 'bind', 'blind', 'confuse'];
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
            
            // 失明免疫检查（如黑畜妖没有眼睛）
            if (effect.type === 'blind' && target.blindImmune) {
                this.addLog(`${targetName} 没有眼睛，不受失明影响！`, 'system');
                return;
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
                    const buffTypes = ['shield', 'attack_up', 'defense_up', 'speed_up', 'crit_up', 'regen', 'evasion_up', 'invulnerable', 'stealth', 'charge'];
                    const isBuff = buffTypes.includes(effect.type);
                    if (effect.type === 'stun' || effect.type === 'frozen') {
                        this.addLog(`${targetName} 被${effect.name}了！`, 'debuff');
                    } else if (effect.type === 'shield') {
                        this.addLog(`${targetName} 获得了 ${effect.value} 点护盾！`, 'buff');
                    } else if (effect.type === 'wet') {
                        this.addLog(`${targetName} 被水浸湿了`, 'debuff');
                    } else if (effect.type === 'evasion_up') {
                        this.addLog(`${targetName} 闪避率提升！`, 'buff');
                    } else if (isBuff) {
                        this.addLog(`${targetName} 获得了 ${effect.name} 效果！`, 'buff');
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
     * 为目标添加状态效果（BattleSystem包装方法）
     * 处理日志、事件、unpurgeable标记、debuff免疫等
     */
    addStatusEffect(target, effect) {
        if (!target || !target.statusEffects) return false;
        const isPlayerTarget = target === this.player;
        const targetName = isPlayerTarget ? '你' : (this.enemy?.name || '目标');

        // v2.9.0: 控制技能100%打断敌方魔法师施法（仅魔法师敌人，妖魔不适用）
        const isEnemyMage = !isPlayerTarget && (this.enemy?.isMage === true || this.enemy?.enemyType === 'mage');
        const controlTypes = ['stun', 'silence', 'freeze', 'frozen', 'paralyze', 'bind', 'fear', 'sleep'];
        if (isEnemyMage && this.enemyCasting && controlTypes.includes(effect.type)) {
            const interruptedSkill = this.enemyCasting.skill?.name || '魔法';
            this.addLog(`💥 ${effect.name || effect.type}打断了 ${this.enemy.name} 的 ${interruptedSkill} 引导！敌方施法失败！`, 'interrupt-success');
            this.enemyCasting = null;
            // v2.9.1: 打断成功视觉反馈（青色闪光+震屏）
            if (typeof document !== 'undefined') {
                const flash = document.createElement('div');
                flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(100,220,255,0.4) 0%,rgba(100,200,255,0.2) 50%,transparent 70%);z-index:9998;pointer-events:none;animation:highTierFlash 0.6s ease-out forwards;';
                document.body.appendChild(flash);
                setTimeout(() => flash.remove(), 700);
                const battleScreen = document.getElementById('battle-screen') || document.querySelector('.battle-container') || document.body;
                if (battleScreen) {
                    battleScreen.classList.add('screen-shake');
                    setTimeout(() => battleScreen.classList.remove('screen-shake'), 400);
                }
            }
            // 打断次数统计
            this.interruptCount = (this.interruptCount || 0) + 1;
        }

        // debuffImmunity：玩家免疫负面状态
        const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'slow', 'poison', 'curse', 'paralyze', 'weakness', 'bleed', 'bind', 'blind', 'fear', 'shock', 'attack_down', 'defense_down'];
        if (isPlayerTarget && target.talentEffects && target.talentEffects.debuffImmunity) {
            if (debuffTypes.includes(effect.type)) return false;
        }
        // v0.8.27: 召唤兽在场时玩家免疫负面（summonDebuffImmunity）
        if (isPlayerTarget && target.talentEffects && target.talentEffects.summonDebuffImmunity && this.summon && this.summon.hp > 0) {
            if (debuffTypes.includes(effect.type)) {
                this.addLog(`🔗 人兽合一！${this.summon.name} 为你抵挡了负面状态！`, 'buff');
                return false;
            }
        }

        // knockbackImmune：玩家免疫击退/眩晕
        if (isPlayerTarget && target.talentEffects && target.talentEffects.knockbackImmune) {
            if (effect.type === 'stun') return false;
        }

        // shieldDebuffImmune：有护盾时免疫debuff
        if (isPlayerTarget && target.talentEffects && target.talentEffects.shieldDebuffImmune) {
            const hasShield = target.statusEffects.some(e => e.type === 'shield');
            if (hasShield && debuffTypes.includes(effect.type)) return false;
        }

        // 标记unpurgeable
        if (effect.unpurgeable) {
            effect._unpurgeable = true;
        }

        // 天赋：滋润不可驱散（regenUnpurgeable）
        if (isPlayerTarget && effect.type === 'regen' && target.talentEffects && target.talentEffects.regenUnpurgeable) {
            effect._unpurgeable = true;
            effect.unpurgeable = true;
        }

        // 检查是否已有同名效果
        const existing = target.statusEffects.find(e => e.type === effect.type);
        if (existing) {
            // 数值累积型（冻结值、护盾值等）
            if (effect.value !== undefined || existing.value !== undefined) {
                existing.value = (existing.value || 0) + (effect.value || 0);
                existing.duration = Math.max(existing.duration, effect.duration);
                if (effect.type === 'freeze' && existing.value >= 100) {
                    existing.type = 'frozen';
                    existing.name = '冻结';
                    existing.duration = 1;
                    existing.value = 0;
                    this.addLog(`${targetName} 被冻结了！`, 'debuff');
                }
            } else if (effect.stacks || existing.stacks) {
                const maxStacks = effect.maxStacks || existing.maxStacks || 3;
                existing.stacks = Math.min(maxStacks, (existing.stacks || 1) + (effect.stacks || 1));
                existing.duration = Math.max(existing.duration, effect.duration);
            } else {
                existing.duration = Math.max(existing.duration, effect.duration);
            }
            // 保留unpurgeable标记
            if (effect._unpurgeable) existing._unpurgeable = true;
            if (effect.unpurgeable) existing.unpurgeable = true;
            return false;
        }

        // 新效果
        const newEffect = { ...effect, remaining: effect.duration };
        if (effect.stacks && !newEffect.stacks) newEffect.stacks = 1;
        target.statusEffects.push(newEffect);

        // 日志
        if (effect.type === 'stun' || effect.type === 'frozen') {
            this.addLog(`${targetName} 被${effect.name}了！`, 'debuff');
        } else if (effect.type === 'shield') {
            this.addLog(`${targetName} 获得了 ${effect.value} 点${effect.name}！`, 'buff');
        } else if (effect.type === 'stealth') {
            this.addLog(`${targetName} 进入了${effect.name}状态！`, 'buff');
        } else if (effect.type === 'regen') {
            this.addLog(`${targetName} 获得了持续恢复效果！`, 'buff');
        } else if (effect.type === 'wet') {
            this.addLog(`${targetName} 被水浸湿了`, 'debuff');
        } else if (effect.type === 'evasion_up') {
            this.addLog(`${targetName} 闪避率提升！`, 'buff');
        } else if (effect.type === 'attack_down' || effect.type === 'defense_down') {
            this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
        } else if (effect.type === 'slow') {
            this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
        } else {
            this.addLog(`${targetName} 陷入了 ${effect.name} 状态！`, 'debuff');
        }

        // 发布事件
        if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
            BattleEventBus.emit(BattleEvents.STATUS_APPLIED, {
                target: isPlayerTarget ? 'player' : 'enemy',
                effect: newEffect,
                isDebuff: !['shield', 'evasion_up', 'attack_up', 'defense_up', 'speed_up', 'crit_up', 'regen', 'cleanse', 'stealth'].includes(effect.type)
            });
        }

        return true;
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
                    const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'wet', 'slow', 'poison', 'curse', 'electrified', 'mud', 'steam', 'paralyze', 'weakness', 'bleed', 'healing_reduction', 'bind', 'blind', 'confuse'];
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
                // v0.8.27: 护盾每回合回复（shieldRegen）
                if (isPlayer && this.player.talentEffects?.shieldRegen) {
                    const regenPct = this.player.talentEffects.shieldRegen;
                    const maxShield = effect._maxValue || effect.value;
                    const regenAmt = Math.floor(this.player.maxHp * regenPct);
                    effect.value = Math.min(maxShield, effect.value + regenAmt);
                }
                return true;
            }

            effect.duration--;

            // DOT伤害（按层数计算），支持dotDamage和damagePerTurn两种字段名
            const dotDamage = effect.dotDamage || effect.damagePerTurn;
            if (dotDamage) {
                const stacks = effect.stacks || 1;
                let dotAmount = Math.floor(dotDamage * stacks);
                // 风系DOT加成（windDotBonus）：风助火势，持续伤害+50%
                if (!isPlayer && this.player.talentEffects && this.player.talentEffects.windDotBonus) {
                    dotAmount = Math.floor(dotAmount * (1 + this.player.talentEffects.windDotBonus));
                }
                // v1.5.1: 火系分支效果 - 燃烧伤害加成
                let burnIsCrit = false;
                if (!isPlayer && this.player.talentEffects && effect.type === 'burn') {
                    const te = this.player.talentEffects;
                    if (te.burnDamageBonus) {
                        dotAmount = Math.floor(dotAmount * (1 + te.burnDamageBonus));
                    }
                    // 燃烧可暴击
                    if (te.burnCrit && Math.random() < (this.player.critRate || 0.05)) {
                        dotAmount = Math.floor(dotAmount * 1.5);
                        burnIsCrit = true;
                    }
                }
                const burnTrueDamage = !isPlayer && this.player.talentEffects?.burnTrueDamage && effect.type === 'burn';
                const damage = { amount: dotAmount, isCrit: burnIsCrit, isMiss: false, element: effect.type === 'burn' ? 'fire' : null, trueDamage: burnTrueDamage };
                this.applyDamage(target, damage, null);
                this.addLog(`${targetName} 受到 ${effect.name} 伤害 ${damage.amount} 点（${stacks}层）${burnIsCrit ? ' 暴击！' : ''}`, 'damage');

                // 天赋：燃烧爆炸 - 燃烧层数满时爆炸
                if (effect.type === 'burn' && !isPlayer && this.player.talentEffects) {
                    const te = this.player.talentEffects;
                    const maxStacks = te.burnStackMax || 3;
                    if (te.burnExplode && stacks >= maxStacks) {
                        // v1.5.1: 爆炸伤害加成 + 必定暴击
                        let explodeDmg = Math.floor(this.enemy.maxHp * (te.burnExplodeDamage || 0.15));
                        if (te.explodeBonus) explodeDmg = Math.floor(explodeDmg * (1 + te.explodeBonus));
                        const explodeCrit = te.explodeCrit ? true : false;
                        if (explodeCrit) explodeDmg = Math.floor(explodeDmg * 1.5);
                        this.applyDamage(this.enemy, { amount: explodeDmg, element: 'fire', isCrit: explodeCrit, isMiss: false }, this.player);
                        this.addLog(`💥 燃烧爆炸！造成 ${explodeDmg} 点伤害！${explodeCrit ? ' 暴击！' : ''}`, 'element');
                        this.showDamageNumber('enemy', explodeDmg, explodeCrit ? 'crit' : 'normal');
                        // v1.5.1: 爆炸后刷新燃烧（爆燃流）vs 重置层数（默认）
                        if (te.burnExplodeRefresh) {
                            effect.stacks = maxStacks; // 刷新到满层
                            effect.duration = Math.max(effect.duration, 3); // 刷新持续时间
                        } else {
                            effect.stacks = 1; // 重置层数
                        }
                        // 燃烧蔓延
                        if (te.burnSpread) {
                            this.addLog(`🔥 火势蔓延！`, 'element');
                        }
                    }
                    // 燃烧降防：燃烧时敌人防御降低
                    if (te.burnDefenseDown && !effect._defDownApplied) {
                        effect._defDownApplied = true;
                        this.enemy.defense = Math.floor(this.enemy.defense * (1 - te.burnDefenseDown));
                        this.addLog(`🔥 燃烧削弱！${this.enemy.name} 防御降低！`, 'debuff');
                    }
                }
            }
            // 冻结掉血（frozenHpDrain：每回合损失%最大HP）
            if ((effect.type === 'freeze' || effect.type === 'frozen') && effect.hpDrain) {
                const drainDmg = Math.floor(target.maxHp * effect.hpDrain);
                this.applyDamage(target, { amount: drainDmg, isCrit: false, isMiss: false, element: 'ice' }, null);
                this.addLog(`❄️ ${targetName} 被冻伤，损失 ${drainDmg} 点生命！`, 'damage');
            }
            // v1.5.4: 麻痹掉血（paralyzeHpDrain：麻痹目标每回合损失%最大HP）
            if (effect.type === 'paralyze' && !isPlayer && this.player.talentEffects && this.player.talentEffects.paralyzeHpDrain) {
                const drainDmg = Math.floor(target.maxHp * this.player.talentEffects.paralyzeHpDrain);
                this.applyDamage(target, { amount: drainDmg, isCrit: false, isMiss: false, element: 'thunder' }, null);
                this.addLog(`⚡ ${targetName} 被麻痹电击，损失 ${drainDmg} 点生命！`, 'damage');
            }

            // REG恢复（每回合恢复HP）
            if (effect.regen) {
                let healAmount = Math.floor(effect.regen);
                // 低HP时回复翻倍（lowHpRegenDouble）
                if (isPlayer && this.player.talentEffects && this.player.talentEffects.lowHpRegenDouble) {
                    if (target.hp / target.maxHp < 0.3) {
                        healAmount *= 2;
                    }
                }
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(target);
                healAmount = Math.floor(healAmount * healMultiplier);
                if (healAmount > 0) {
                    target.hp = Math.min(target.maxHp, target.hp + healAmount);
                    this.addLog(`${targetName} 受到 ${effect.name} 恢复 ${healAmount} 点生命`, 'heal');
                }
            }

            // 效果结束
            if (effect.duration <= 0) {
                // 霜爆（frostExplosion）：解冻时造成伤害
                if ((effect.type === 'freeze' || effect.type === 'frozen') && !isPlayer && this.player.talentEffects && this.player.talentEffects.frostExplosion) {
                    const explodeDmg = Math.floor(this.enemy.maxHp * this.player.talentEffects.frostExplosion);
                    this.applyDamage(this.enemy, { amount: explodeDmg, isCrit: false, isMiss: false, element: 'ice' }, this.player);
                    this.addLog(`❄️ 霜爆！${this.enemy.name} 解冻时受到 ${explodeDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', explodeDmg, 'magic');
                }
                // 诅咒结束伤害（curseEndDamage）
                if (effect.type === 'curse' && !isPlayer && this.player.talentEffects && this.player.talentEffects.curseEndDamage) {
                    const curseDmg = Math.floor(this.enemy.maxHp * this.player.talentEffects.curseEndDamage);
                    this.applyDamage(this.enemy, { amount: curseDmg, element: 'dark', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🌑 诅咒爆发！${this.enemy.name} 受到 ${curseDmg} 点暗伤！`, 'element');
                    this.showDamageNumber('enemy', curseDmg, 'magic');
                    // 诅咒传播（curseSpreadChance）：单机简化为额外暗伤
                    const te = this.player.talentEffects;
                    if (te.curseSpreadChance && Math.random() < te.curseSpreadChance) {
                        const spreadDmg = Math.floor(curseDmg * 0.5);
                        this.applyDamage(this.enemy, { amount: spreadDmg, element: 'dark', isCrit: false, isMiss: false }, this.player);
                        this.addLog(`🌑 诅咒蔓延！额外造成 ${spreadDmg} 点暗伤！`, 'element');
                    }
                }
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

        // 自动净化（autoPurify）：每回合自动净化1个负面状态
        if (isPlayer && this.player.talentEffects && this.player.talentEffects.autoPurify) {
            const debuffTypes = ['burn', 'freeze', 'frozen', 'stun', 'slow', 'poison', 'curse', 'paralyze', 'weakness', 'bleed', 'bind', 'blind', 'fear', 'shock', 'attack_down', 'defense_down'];
            const purgeable = target.statusEffects.filter(e => debuffTypes.includes(e.type) && !e._unpurgeable && !e.unpurgeable);
            if (purgeable.length > 0) {
                const toRemove = purgeable[0];
                target.statusEffects = target.statusEffects.filter(e => e !== toRemove);
                this.addLog(`✨ 自动净化！清除了 ${toRemove.name}！`, 'buff');
            }
        }

        // 生命之种（lifeSeed）：延迟治疗，3回合后爆发
        if (isPlayer && target._lifeSeedDelay > 0) {
            target._lifeSeedDelay--;
            if (target._lifeSeedDelay <= 0) {
                const healAmount = target._lifeSeedHeal || Math.floor(target.maxHp * 0.2);
                target.hp = Math.min(target.maxHp, target.hp + healAmount);
                this.addLog(`🌱 生命之种绽放！恢复 ${healAmount} 点生命！`, 'heal');
                delete target._lifeSeedDelay;
                delete target._lifeSeedHeal;
            }
        }

        // 滋润附加效果（regenDamageReduction/regenDefenseBonus/regenMp）
        if (isPlayer && this.player.talentEffects) {
            const te = this.player.talentEffects;
            const hasRegen = target.statusEffects.some(e => e.type === 'regen');
            if (hasRegen) {
                if (te.regenMp) {
                    target.mp = Math.min(target.maxMp, target.mp + te.regenMp);
                }
            }
        }
        
        // 处理增益效果（buffs）的持续时间
        if (target.buffs && target.buffs.length > 0) {
            target.buffs = target.buffs.filter(buff => {
                // 护盾类型的buff不随时间消失（被打掉才消失）
                if (buff.type === 'shield') {
                    if ((buff.shieldAmount || 0) <= 0) {
                        return false;
                    }
                    return true;
                }
                
                // 减少持续时间
                if (buff.duration !== undefined && buff.duration !== null) {
                    buff.duration--;
                    if (buff.duration <= 0) {
                        return false;
                    }
                }
                
                return true;
            });
        }
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
    getStatusModifiers(target) {
        const mods = {
            attackMod: 0,
            defenseMod: 0,
            speedMod: 0,
            hitRateMod: 0,
            evasionMod: 0,
            critRateMod: 0,
            fireDamageMod: 1,
            thunderDamageMod: 1,
            iceDamageMod: 1,
            darkDamageMod: 1,
            fireResistanceMod: 0,
            lifesteal: 0,
            damageReflect: 0,
            nextDodgeGuaranteed: false,
            burnChanceOnAttack: 0,
            burnDamagePerTurn: 0,
            freezeChanceOnHit: 0,
            freezeDuration: 0
        };

        // 处理状态效果
        target.statusEffects.forEach(effect => {
            if (effect.statModifiers) {
                const stacks = effect.stacks || 1;
                mods.attackMod += (effect.statModifiers.attack || 0) * stacks;
                mods.defenseMod += (effect.statModifiers.defense || 0) * stacks;
                mods.speedMod += (effect.statModifiers.speed || 0) * stacks;
            }
            if (effect.speedMod) mods.speedMod += effect.speedMod;
            if (effect.hitRateMod) mods.hitRateMod += effect.hitRateMod;
            if (effect.hitMod) mods.hitRateMod += effect.hitMod;
            if (effect.evasionMod) mods.evasionMod += effect.evasionMod;
            // 诅咒：降低攻防
            if (effect.type === 'curse') {
                if (effect.atkMod) mods.attackMod = (mods.attackMod || 0) + effect.atkMod;
                if (effect.defMod) mods.defenseMod = (mods.defenseMod || 0) + effect.defMod;
                if (effect.critDown) mods.critRateMod = (mods.critRateMod || 0) - effect.critDown;
                if (effect.dodgeDown) mods.evasionMod = (mods.evasionMod || 0) - effect.dodgeDown;
            }
            // 暗影标记：暗系伤害增加
            if (effect.type === 'darkMark' && effect.darkDamageBonus) {
                mods.darkDamageMod = (mods.darkDamageMod || 1) + effect.darkDamageBonus;
            }
            // 湿润状态受雷系伤害×2
            if (effect.type === 'wet' || effect.type === 'electrified') {
                mods.thunderDamageMod *= 2;
            }
            // 冻结状态受火系伤害×2
            if (effect.type === 'frozen') {
                mods.fireDamageMod *= 2;
                // 冻结降防（freezeDefenseDown）
                if (effect.defenseDown) {
                    mods.defenseMod -= effect.defenseDown;
                }
            }
            // 冰冻状态降防（freezeDefenseDown）
            if (effect.type === 'freeze' && effect.defenseDown) {
                mods.defenseMod -= effect.defenseDown;
            }
            // 伤害反弹
            if (effect.type === 'damage_reflect' && effect.reflectPercent) {
                mods.damageReflect += effect.reflectPercent;
            }
            // 致盲/命中降低
            if (effect.type === 'accuracy_down' && effect.value) {
                mods.hitRateMod -= effect.value;
            }
            // 中毒持续伤害（在回合结束处理，这里只标记）
            if (effect.type === 'poison' && effect.damage) {
                // 中毒伤害在turnEnd中处理
            }
            // v1.6.0: 恐惧状态（fear）- 面对强大妖魔时的心理压力
            if (effect.type === 'fear') {
                const fearLevel = effect.level || 1;
                mods.attackMod -= fearLevel * 5; // 每级恐惧-5攻击
                mods.hitRateMod -= fearLevel * 0.05; // 每级恐惧-5%命中
                mods.critRateMod -= fearLevel * 0.03; // 每级恐惧-3%暴击
            }
        });

        // 滋润附加效果（regenDamageReduction/regenDefenseBonus）：有regen状态时减伤/加防
        if (target === this.player && target.talentEffects) {
            const te = target.talentEffects;
            const hasRegen = target.statusEffects.some(e => e.type === 'regen');
            if (hasRegen) {
                if (te.regenDamageReduction) {
                    mods._regenDamageReduction = te.regenDamageReduction;
                }
                if (te.regenDefenseBonus) {
                    mods.defenseMod += te.regenDefenseBonus;
                }
            }
        }
        
        // 处理增益效果（buffs）
        if (target.buffs && target.buffs.length > 0) {
            target.buffs.forEach(buff => {
                switch (buff.type) {
                    case 'attack_up':
                        mods.attackMod += buff.attackMod || 0;
                        break;
                    case 'defense_up':
                        mods.defenseMod += buff.defenseMod || 0;
                        break;
                    case 'speed_up':
                        mods.speedMod += buff.speedMod || 0;
                        break;
                    case 'evasion_up':
                        mods.evasionMod += buff.dodgeMod || 0;
                        break;
                    case 'crit_up':
                        mods.critRateMod += buff.critMod || 0;
                        break;
                    case 'hit_up':
                        mods.hitRateMod += buff.hitMod || 0;
                        break;
                    case 'fire_resistance_up':
                        mods.fireResistanceMod += buff.resistanceMod || 0;
                        break;
                    case 'lifesteal':
                        mods.lifesteal += buff.lifestealPercent || 0;
                        break;
                    case 'damage_reflect':
                        mods.damageReflect += buff.reflectPercent || 0;
                        break;
                    case 'next_dodge_guaranteed':
                        mods.nextDodgeGuaranteed = true;
                        break;
                    case 'burn_chance_on_attack':
                        mods.burnChanceOnAttack += buff.chance || 0;
                        mods.burnDamagePerTurn = buff.damagePerTurn || 10;
                        break;
                    case 'freeze_chance_on_hit':
                        mods.freezeChanceOnHit += buff.chance || 0;
                        mods.freezeDuration = buff.freezeDuration || 1;
                        break;
                }
            });
        }

        // 融化加成
        if (target._meltBonus) {
            mods.fireDamageMod *= target._meltBonus;
        }

        return mods;
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
    checkBattleEnd() {
        if (this.player.hp <= 0 || (this.battleOptions.winHpPercent > 0 && this.player.hp <= this.player.maxHp * this.battleOptions.winHpPercent)) {
            this.result = 'lose';
            this.active = false;
            
            if (this.battleOptions.isFriendly) {
                this.addLog('你认输了...', 'system');
            } else {
                this.addLog('你被击败了...', 'system');
            }
            
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

        if (this.enemy.hp <= 0 || (this.battleOptions.winHpPercent > 0 && this.enemy.hp <= this.enemy.maxHp * this.battleOptions.winHpPercent)) {
            this.result = 'win';
            this.active = false;

            // 天赋击杀效果：击杀回血/回MP
            if (this.player.talentEffects) {
                const te = this.player.talentEffects;
                if (te.killHeal && te.killHeal > 0) {
                    const healAmount = Math.floor(this.player.maxHp * te.killHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`💀 击杀回春！恢复 ${healAmount} 点生命！`, 'heal');
                }
                if (te.killMpRestore && te.killMpRestore > 0) {
                    const mpAmount = Math.floor(this.player.maxMp * te.killMpRestore);
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpAmount);
                    this.addLog(`💀 击杀回蓝！恢复 ${mpAmount} 点MP！`, 'heal');
                }
                // 击杀减技能CD
                if (te.killCooldownReduce && this.player.skillCooldowns) {
                    const reduce = te.killCooldownReduce;
                    for (const sid in this.player.skillCooldowns) {
                        this.player.skillCooldowns[sid] = Math.max(0, this.player.skillCooldowns[sid] - reduce);
                    }
                    this.addLog(`💀 击杀减少技能冷却 ${reduce} 回合！`, 'buff');
                }
                // 击杀后重新隐身（reStealthChance）
                if (te.reStealthChance && Math.random() < te.reStealthChance) {
                    const existingStealth = this.player.statusEffects.find(e => e.type === 'stealth');
                    if (!existingStealth) {
                        this.addStatusEffect(this.player, { type: 'stealth', name: '暗影潜行', duration: 99 });
                        this.player.stealthActive = true;
                        this.addLog(`🌑 影杀！重新进入潜行状态！`, 'buff');
                    }
                }
                // 诅咒击杀回血（curseKillHeal）：击杀被诅咒的敌人额外回血
                if (te.curseKillHeal) {
                    const wasCursed = this.enemy.statusEffects.some(e => e.type === 'curse');
                    if (wasCursed) {
                        const healAmount = Math.floor(this.player.maxHp * te.curseKillHeal);
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                        this.addLog(`🌑 诅咒汲取！恢复 ${healAmount} 点生命！`, 'heal');
                    }
                }
                // 暗影击杀回血（shadowFormHeal）：潜行状态下击杀回血
                if (te.shadowFormHeal && this.player.stealthActive) {
                    const healAmount = Math.floor(this.player.maxHp * te.shadowFormHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🌑 暗影汲取！恢复 ${healAmount} 点生命！`, 'heal');
                }
            }
            
            if (this.battleOptions.isFriendly) {
                this.addLog(`${this.enemy.name} 认输了！你赢得了决斗！`, 'system');
            } else {
                this.addLog(`击败了 ${this.enemy.name}！`, 'system');
            }
            
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