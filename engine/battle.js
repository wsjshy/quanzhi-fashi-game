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
        const strongAgainst = {
            fire: 'ice',      // 火克冰
            ice: 'wind',      // 冰克风
            wind: 'earth',    // 风克土
            earth: 'thunder', // 土克雷
            thunder: 'water', // 雷克水
            water: 'fire',    // 水克火
            light: 'dark',    // 光克暗
            dark: 'light'     // 暗克光
        };
        return strongAgainst[attackElement] === defendElement;
    },
    
    /**
     * 元素被克判断 - 攻击方是否被防守方克制
     */
    isElementWeak(attackElement, defendElement) {
        const weakAgainst = {
            fire: 'water',
            ice: 'fire',
            wind: 'ice',
            earth: 'wind',
            thunder: 'earth',
            water: 'thunder',
            light: 'dark',
            dark: 'light'
        };
        return weakAgainst[attackElement] === defendElement;
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
                hpBonus = 0.15;  // HP+15%
                atkBonus = 0.1;  // 攻击+10%
                defBonus = 0.05; // 防御+5%
            } else if (tier === 'warrior' || tier === '战将级') {
                hpBonus = 0.3;   // HP+30%
                atkBonus = 0.2;  // 攻击+20%
                defBonus = 0.1;  // 防御+10%
            } else if (tier === 'commander' || tier === '统领级') {
                hpBonus = 0.8;   // HP+80%
                atkBonus = 0.4;  // 攻击+40%
                defBonus = 0.3;  // 防御+30%
            } else if (tier === 'monarch' || tier === '君主级') {
                hpBonus = 1.5;   // HP+150%
                atkBonus = 0.8;  // 攻击+80%
                defBonus = 0.6;  // 防御+60%
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
            this.enemy.attack = Math.floor(this.enemy.attack * 1.1);  // 攻击力+10%
            this.enemy.maxHp = Math.floor(this.enemy.maxHp * 1.15);   // HP+15%
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
            isDefending: false,
            talentEffects: (typeof Player !== 'undefined' && Player.getAllTalentEffects) ? Player.getAllTalentEffects() : {},
            // 第五批效果：战斗状态计数器
            chargeStack: 0,       // 雷系蓄电层数
            chargeMax: 5,         // 最大蓄电层数
            comboCount: 0,        // 连斩计数（本回合连击数）
            tideStack: 0,         // 潮汐层数
            stealthActive: false, // 是否处于隐身状态
            reviveUsed: false     // 本局是否已用过复活
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

        // v0.9.1: 应用疲劳减益（低体力战斗后受伤，休息后清除）
        if (typeof Player !== 'undefined' && Player.fatigueLevel > 0) {
            if (Player.fatigueLevel >= 2) {
                // 重伤：攻击-30%，防御-15%
                this.player.attack = Math.floor(this.player.attack * 0.7);
                this.player.defense = Math.floor(this.player.defense * 0.85);
                this.addLog('⚠️ 你受了重伤，攻击力-30%，防御力-15%！', 'debuff');
            } else {
                // 疲劳：攻击-15%
                this.player.attack = Math.floor(this.player.attack * 0.85);
                this.addLog('⚠️ 你感到疲惫，攻击力-15%！', 'debuff');
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

        // 获取玩家天赋
        const playerTalent = this.player.talents ? this.player.talents.find(t => t.id === talentId) : null;
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

    /**
     * 玩家行动：普通攻击
     */
    playerAttack() {
        if (!this.active || !this.isPlayerTurn) return null;

        this.player.isDefending = false;

        // 首攻加成：20%概率先手，伤害+50%
        let firstStrikeBonus = 0;
        if (this.player.talentEffects && this.player.talentEffects.firstStrikeChance && !this._playerHasAttacked) {
            if (Math.random() < this.player.talentEffects.firstStrikeChance) {
                firstStrikeBonus = this.player.talentEffects.firstStrikeDamage || 0.5;
                this._playerHasAttacked = true;
                this.addLog(`⚡ 先手攻击！伤害+${Math.floor(firstStrikeBonus * 100)}%！`, 'buff');
            }
        }

        // v2.2.0: 火系强化流 - 消耗燃点强化普攻
        let fireEnhanceBonus = 0;
        let fireEnhanceCrit = false;
        const te = this.player.talentEffects || {};
        if (te.fireEnhanceAttack && typeof TalentCombatSystem !== 'undefined') {
            const cost = te.fireEnhanceCost || 3;
            if (TalentCombatSystem.getEnergy('fire') >= cost) {
                TalentCombatSystem.consumeEnergy('fire', cost);
                fireEnhanceBonus = te.fireEnhanceBonus || 0.80;
                fireEnhanceCrit = te.fireEnhanceCrit || false;
                this.addLog(`🔥 燃点强化！普攻伤害+${Math.floor(fireEnhanceBonus * 100)}%${fireEnhanceCrit ? '，必定暴击' : ''}！`, 'buff');
            }
        }

        // 计算伤害（含攻击者状态修正）
        const attackerMods = this.getStatusModifiers(this.player);
        // v0.8.27: 召唤兽在场时玩家伤害加成
        let summonMasterDmgBonus = 0;
        if (this.summon && this.player.talentEffects?.summonMasterDamageBonus) {
            summonMasterDmgBonus = this.player.talentEffects.summonMasterDamageBonus;
        }
        // v0.8.27: 对有debuff敌人增伤（debuffedDamageBonus，光系）
        let debuffedBonus = 0;
        if (this.player.talentEffects?.debuffedDamageBonus) {
            const enemyDebuffs = this.enemy.statusEffects.filter(e =>
                ['burn','freeze','frozen','stun','slow','poison','curse','paralyze','weakness','bleed','bind','blind','fear','shock','attack_down','defense_down'].includes(e.type)
            );
            if (enemyDebuffs.length > 0) {
                debuffedBonus = this.player.talentEffects.debuffedDamageBonus;
            }
        }
        // v0.9.7: 体力不再影响战斗伤害，staminaEff.battleDamage始终为1.0
        const staminaEff = (typeof Player !== 'undefined' && Player.getStaminaEfficiency) 
            ? Player.getStaminaEfficiency() 
            : { battleDamage: 1.0 };

        const damage = this.calculateDamage(
            this.player.attack * (1 + firstStrikeBonus + summonMasterDmgBonus + debuffedBonus + fireEnhanceBonus) * staminaEff.battleDamage + attackerMods.attackMod,
            this.enemy.defense * (this.enemy.isDefending ? 2 : 1), // 防御时防御翻倍
            1.0,
            fireEnhanceCrit ? 1.0 : this.player.critRate,
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
        this.applyDamage(this.enemy, damage, this.player);

        // v2.2.0: 风系疾风状态 - 闪避后触发连击
        if (!damage.isMiss && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.hasWindStreak()) {
            TalentCombatSystem.consumeWindStreak();
            const comboDmg = this.calculateDamage(
                this.player.attack * 0.8,
                this.enemy.defense * (this.enemy.isDefending ? 2 : 1),
                1.0,
                this.player.critRate,
                this.player.hitRate,
                'wind',
                null,
                this.enemy,
                this.player
            );
            this.applyDamage(this.enemy, comboDmg, this.player);
            this.addLog(`💨 疾风连击！再造成 ${comboDmg.amount} 点伤害！`, 'element');
            if (!comboDmg.isMiss) this.showDamageNumber('enemy', comboDmg.amount, 'magic');
        }

        // 天赋异常状态触发（普攻命中时）
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            // 燃烧
            if (te.burnChance && Math.random() < te.burnChance) {
                const burnDmg = te.burnDamage || 0.05;
                // v1.5.1: 燃烧持续时间加成（熔岩流）
                const burnDuration = 3 + (te.burnDuration || 0);
                this.applyStatusEffects(this.enemy, [{
                    type: 'burn', name: '燃烧', damage: burnDmg, duration: burnDuration,
                    unpurgeable: te.burnUnpurgeable || false,
                    defenseDown: te.burnDefenseDown || 0
                }], true);
                this.addLog(`🔥 ${this.enemy.name} 被点燃了！`, 'element');
            }
            // 冰冻
            if (te.freezeChance && Math.random() < te.freezeChance) {
                this.applyStatusEffects(this.enemy, [{
                    type: 'freeze', name: '冰冻', duration: te.freezeDuration || 1,
                    unpurgeable: te.freezeUnpurgeable || false,
                    defenseDown: te.freezeDefenseDown || 0,
                    hpDrain: te.frozenHpDrain || 0,
                    spread: te.freezeSpread || false
                }], true);
                this.addLog(`❄️ ${this.enemy.name} 被冻结了！`, 'element');
            }
            // 麻痹
            if (te.paralyzeChance && Math.random() < te.paralyzeChance) {
                this.applyStatusEffects(this.enemy, [{
                    type: 'paralyze', name: '麻痹', duration: te.paralyzeDuration || 1
                }], true);
                this.addLog(`⚡ ${this.enemy.name} 被麻痹了！`, 'element');
            }
            // 感电时额外麻痹（shockParalyzeChance）
            if (te.shockParalyzeChance) {
                const hasShock = this.enemy.statusEffects.some(e => e.type === 'shock' || e.type === 'electrified');
                if (hasShock && Math.random() < te.shockParalyzeChance) {
                    const alreadyParalyzed = this.enemy.statusEffects.some(e => e.type === 'paralyze');
                    if (!alreadyParalyzed) {
                        this.applyStatusEffects(this.enemy, [{
                            type: 'paralyze', name: '麻痹', duration: te.paralyzeDuration || 1
                        }], true);
                        this.addLog(`⚡ 感电传导！${this.enemy.name} 被麻痹了！`, 'element');
                    }
                }
            }
            // v1.5.4: 湿润层数机制（wetChance/wetStacks/wetStackMax）
            if (te.wetChance && Math.random() < te.wetChance) {
                const existingWet = this.enemy.statusEffects.find(e => e.type === 'wet');
                const maxStacks = te.wetStackMax || 3;
                const addStacks = te.wetStacks || 1;
                if (existingWet) {
                    existingWet.stacks = Math.min((existingWet.stacks || 1) + addStacks, maxStacks);
                    existingWet.duration = Math.max(existingWet.duration, 2);
                    this.addLog(`💧 湿润叠加 ${existingWet.stacks}/${maxStacks}！`, 'element');
                    // 满层湿润回血（wetHealOnMax）
                    if (existingWet.stacks >= maxStacks && te.wetHealOnMax) {
                        const healAmount = Math.floor(this.player.maxHp * te.wetHealOnMax);
                        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                        this.addLog(`💧 湿润满层！恢复 ${healAmount} 点生命！`, 'heal');
                    }
                    // 满层湿润束缚（wetBindOnMax）
                    if (existingWet.stacks >= maxStacks && te.wetBindOnMax) {
                        if (!this.enemy.statusEffects.some(e => e.type === 'bind')) {
                            this.addStatusEffect(this.enemy, {
                                type: 'bind', name: '水之束缚', duration: te.bindDuration || 1,
                                defenseDown: te.bindDefenseDown || 0,
                                unpurgeable: te.bindUnpurgeable || false,
                                hpDrain: te.bindHpDrain || 0
                            });
                            this.addLog(`💧 湿润满层！${this.enemy.name} 被水之束缚！`, 'element');
                        }
                    }
                } else {
                    this.addStatusEffect(this.enemy, {
                        type: 'wet', name: '湿润', duration: 3, stacks: addStacks,
                        waterDamageBonus: te.wetDamageBonus || 0.1
                    });
                    this.addLog(`💧 ${this.enemy.name} 被湿润了（${addStacks}层）！`, 'element');
                }
            }
            // v1.5.5: 风刃层数机制（windBladeStack）- 风系攻击叠加风刃
            if (te.windBladeStack && damage.element === 'wind') {
                const maxBlades = te.windBladeMax || 3;
                if (!this.player._windBladeStacks) this.player._windBladeStacks = 0;
                this.player._windBladeStacks = Math.min(this.player._windBladeStacks + 1, maxBlades);
                const bladeDmg = Math.floor(this.player.attack * (te.windBladeDamage || 0.05));
                this.addLog(`🌪️ 风刃叠加 ${this.player._windBladeStacks}/${maxBlades}（每刃${bladeDmg}伤害）`, 'element');
                // 满层风刃乱舞（windBladeDanceOnMax）
                if (this.player._windBladeStacks >= maxBlades && te.windBladeDanceOnMax) {
                    const danceCount = te.windBladeDanceCount || 3;
                    const danceDamage = te.windBladeDanceDamage || 0.4;
                    for (let i = 0; i < danceCount; i++) {
                        if (this.enemy.hp <= 0) break;
                        const dmg = Math.floor(this.player.attack * danceDamage);
                        this.applyDamage(this.enemy, { amount: dmg, element: 'wind', isCrit: false, isMiss: false }, this.player);
                    }
                    this.addLog(`🌪️ 风刃乱舞！${danceCount}道风刃攻击！`, 'element');
                    this.player._windBladeStacks = 0;
                }
            }
            // v1.5.5: 暗影层数机制（shadowStack）- 暗系攻击叠加暗影
            if (te.shadowStack && damage.element === 'dark') {
                const maxShadow = te.shadowMax || 3;
                if (!this.player._shadowStacks) this.player._shadowStacks = 0;
                this.player._shadowStacks = Math.min(this.player._shadowStacks + 1, maxShadow);
                const lifesteal = te.shadowLifesteal || 0.05;
                const healAmount = Math.floor(damage.amount * lifesteal);
                if (healAmount > 0) {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🌑 暗影叠加 ${this.player._shadowStacks}/${maxShadow}（吸血${healAmount}）`, 'element');
                } else {
                    this.addLog(`🌑 暗影叠加 ${this.player._shadowStacks}/${maxShadow}`, 'element');
                }
                // 满层暗影吸血爆发（shadowDrainOnMax）
                if (this.player._shadowStacks >= maxShadow && te.shadowDrainOnMax) {
                    const drainHeal = Math.floor(this.enemy.maxHp * (te.drainLifesteal || 0.3));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + drainHeal);
                    this.addLog(`🌑 暗影吞噬！吸取 ${drainHeal} 点生命！`, 'heal');
                    this.player._shadowStacks = 0;
                }
                // 满层暗影潜行（shadowStealthOnMax）
                if (this.player._shadowStacks >= maxShadow && te.shadowStealthOnMax) {
                    if (!this.player.statusEffects.some(e => e.type === 'stealth')) {
                        this.addStatusEffect(this.player, {
                            type: 'stealth', name: '暗影潜行',
                            duration: te.stealthDuration || 1,
                            firstHitBonus: te.stealthFirstHitBonus || 1.0,
                            firstHitCrit: te.stealthFirstHitCrit || false
                        });
                        this.addLog(`🌑 暗影潜行！进入隐身状态！`, 'buff');
                    }
                    this.player._shadowStacks = 0;
                }
            }
            // v1.5.6: 毒素层数机制（poisonStack）- 植物系攻击叠加毒素
            if (te.poisonStack && damage.element === 'plant') {
                const maxPoison = te.poisonMax || 3;
                const existingPoison = this.enemy.statusEffects.find(e => e.type === 'poison');
                if (existingPoison) {
                    existingPoison.stacks = Math.min((existingPoison.stacks || 1) + 1, maxPoison);
                    existingPoison.duration = Math.max(existingPoison.duration, 3);
                    this.addLog(`☠️ 毒素叠加 ${existingPoison.stacks}/${maxPoison}！`, 'element');
                    // 满层毒爆（poisonBurstOnMax）
                    if (existingPoison.stacks >= maxPoison && te.poisonBurstOnMax) {
                        const burstDmg = Math.floor(this.enemy.maxHp * (te.poisonBurstDamage || 0.2));
                        this.applyDamage(this.enemy, { amount: burstDmg, element: 'plant', isCrit: false, isMiss: false, trueDamage: te.poisonBurstTrue || false }, this.player);
                        this.addLog(`☠️ 毒爆！造成 ${burstDmg} 点伤害！`, 'element');
                        // 毒爆刷新（poisonBurstRefresh）
                        if (!te.poisonBurstRefresh) {
                            existingPoison.stacks = 0;
                        }
                    }
                    // 满层束缚（poisonBindOnMax）
                    if (existingPoison.stacks >= maxPoison && te.poisonBindOnMax) {
                        if (!this.enemy.statusEffects.some(e => e.type === 'bind')) {
                            this.addStatusEffect(this.enemy, {
                                type: 'bind', name: '藤蔓束缚', duration: te.bindDuration || 2,
                                defenseDown: te.bindDefenseDown || 0.3,
                                unpurgeable: te.bindUnpurgeable || false,
                                hpDrain: te.bindHpDrain || 0
                            });
                            this.addLog(`☠️ 毒素满层！${this.enemy.name} 被藤蔓束缚！`, 'element');
                        }
                    }
                } else {
                    this.addStatusEffect(this.enemy, {
                        type: 'poison', name: '中毒', duration: 3, stacks: 1,
                        damage: te.poisonDamage || 0.05,
                        unpurgeable: te.poisonUnpurgeable || false
                    });
                    this.addLog(`☠️ ${this.enemy.name} 中毒了！`, 'element');
                }
            }
            // 眩晕
            if (te.stunChance && Math.random() < te.stunChance) {
                this.applyStatusEffects(this.enemy, [{
                    type: 'stun', name: '眩晕', duration: 1
                }], true);
                this.addLog(`💫 ${this.enemy.name} 被眩晕了！`, 'element');
                // 延长眩晕（stunExtendChance）
                if (te.stunExtendChance && Math.random() < te.stunExtendChance) {
                    const stun = this.enemy.statusEffects.find(e => e.type === 'stun');
                    if (stun) {
                        stun.duration += 1;
                        this.addLog(`💫 眩晕延长！`, 'element');
                    }
                }
            }
            // 减速
            if (te.slowChance && Math.random() < te.slowChance) {
                // 冰霜叠加：检查是否已有减速状态
                const existingSlow = this.enemy.statusEffects.find(e => e.type === 'slow' || e.type === 'frost');
                if (te.frostStackMax && existingSlow) {
                    // 叠加层数
                    existingSlow.stacks = (existingSlow.stacks || 1) + 1;
                    // v1.5.4: 使用frostSlowPerStack替代硬编码
                    const slowPerStack = te.frostSlowPerStack || 0.15;
                    existingSlow.speedMod = -(slowPerStack * existingSlow.stacks);
                    existingSlow.duration = 2;
                    this.addLog(`❄️ 冰霜叠加 ${existingSlow.stacks}/${te.frostStackMax}！`, 'element');
                    // 满层冻结（frostFreezeOnMax）
                    if (existingSlow.stacks >= te.frostStackMax && te.frostFreezeOnMax) {
                        this.addStatusEffect(this.enemy, {
                            type: 'freeze', name: '冰霜冻结', duration: te.freezeDuration || 1
                        });
                        this.addLog(`❄️ 冰霜满层！${this.enemy.name} 被冻结！`, 'element');
                        // v2.3.0: 冰+雷组合 - 超导：冻结时电荷+3
                        if (te.thunderEnergyGain && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
                            TalentCombatSystem.addEnergy('thunder', 3, te.thunderEnergyMax || 6);
                            this.addLog(`⚡ 超导！冻结触发电荷+3！`, 'element');
                        }
                        // 移除减速状态
                        this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e !== existingSlow);
                    }
                } else {
                    // v1.5.4: slowBonus减速效果加成
                    const baseSlow = 0.3 * (1 + (te.slowBonus || 0));
                    this.applyStatusEffects(this.enemy, [{
                        type: te.frostStackMax ? 'frost' : 'slow', name: te.frostStackMax ? '冰霜' : '减速',
                        speedMod: -baseSlow, duration: 2, stacks: 1,
                        unpurgeable: te.slowUnpurgeable || false
                    }], true);
                    this.addLog(`🐌 ${this.enemy.name} 被减速了！`, 'element');
                }
            }
            // v1.5.4: 破冰伤害（frostShatter）- 冰系攻击命中冻结目标时造成额外伤害
            if (te.frostShatter) {
                const isFrozen = this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
                if (isFrozen && damage.element === 'ice') {
                    let shatterDmg = Math.floor(this.player.attack * (te.shatterDamage || 0.8));
                    const shatterCrit = te.shatterCrit ? true : false;
                    if (shatterCrit) shatterDmg = Math.floor(shatterDmg * 1.5);
                    // shatterPierceShield：破冰无视护盾
                    const pierceShield = te.shatterPierceShield || false;
                    this.applyDamage(this.enemy, { amount: shatterDmg, element: 'ice', isCrit: shatterCrit, isMiss: false, pierceShield: pierceShield }, this.player);
                    this.addLog(`💥 破冰！造成 ${shatterDmg} 点额外伤害！${shatterCrit ? ' 暴击！' : ''}`, 'element');
                    this.showDamageNumber('enemy', shatterDmg, shatterCrit ? 'crit' : 'normal');
                    // 解除冻结
                    this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                    // shatterNextCrit：破冰后下次冰系技能必定暴击
                    if (te.shatterNextCrit) {
                        this.player.buffs.push({ type: 'next_crit_guaranteed', name: '破冰之势', duration: 2 });
                    }
                }
            }
            // 时间冻结：概率时停
            if (te.timeStopChance && Math.random() < te.timeStopChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'stun', name: '时间冻结', duration: te.timeStopDuration || 1
                });
                this.addLog(`⏱️ 时间冻结！${this.enemy.name} 停止行动！`, 'element');
            }
            // 恐惧：概率让敌人无法行动
            if (te.fearChance && Math.random() < te.fearChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'fear', name: '恐惧', duration: 1
                });
                this.addLog(`😱 ${this.enemy.name} 陷入恐惧！`, 'element');
            }
            // 致盲：概率降低敌人命中
            if (te.blindChance && Math.random() < te.blindChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'blind', name: '致盲', hitMod: -0.5, duration: te.blindDuration || 2
                });
                this.addLog(`👁️ ${this.enemy.name} 被致盲！`, 'element');
            }
            // 暗影标记：受到暗系伤害增加
            if (te.darkMark && Math.random() < (te.darkMarkChance || 0.3)) {
                this.addStatusEffect(this.enemy, {
                    type: 'darkMark', name: '暗影标记', duration: te.darkMarkDuration || 3,
                    darkDamageBonus: te.darkMarkDamage || 0.5
                });
                this.addLog(`🌑 ${this.enemy.name} 被暗影标记！`, 'element');
            }
            // 诅咒：降低攻防
            if (te.curseChance && Math.random() < te.curseChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'curse', name: '诅咒', duration: te.curseDuration || 3,
                    atkMod: -(te.curseAtkDown || 0.15), defMod: -(te.curseDefDown || 0.15),
                    critDown: te.curseCritDown || 0, dodgeDown: te.curseDodgeDown || 0,
                    unpurgeable: te.curseUnpurgeable || false
                });
                this.addLog(`💀 ${this.enemy.name} 被诅咒！`, 'element');
            }
        }

        // 天赋：雷系蓄电 - 每次攻击命中叠加蓄电层数
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.chargeMax && te.chargeMax > 0) {
                this.player.chargeStack = Math.min(te.chargeMax, this.player.chargeStack + 1);
                const perStack = te.chargePerStack || 0.1;
                const bonusParalyze = this.player.chargeStack * perStack;
                // 满层时额外效果
                if (this.player.chargeStack >= te.chargeMax) {
                    this.addLog(`⚡ 蓄电已满！暴击率和暴击伤害大幅提升！`, 'buff');
                } else {
                    this.addLog(`⚡ 蓄电 ${this.player.chargeStack}/${te.chargeMax}（麻痹+${Math.floor(bonusParalyze*100)}%）`, 'element');
                }
                // 蓄电层数增加麻痹概率（在麻痹判定时已经过了，这里给感电效果）
                // 感电状态：雷伤+30%（shockDebuff为true时，30%基础概率+蓄电加成）
                if (te.shockDebuff) {
                    const shockBaseChance = 0.3;
                    if (Math.random() < shockBaseChance + bonusParalyze) {
                        this.addStatusEffect(this.enemy, {
                            type: 'shock', name: '感电', duration: te.shockDuration || 3,
                            thunderDamageBonus: te.shockThunderBonus || 0.3
                        });
                        this.addLog(`⚡ ${this.enemy.name} 进入感电状态，受到雷伤增加！`, 'element');
                    }
                }
                // v1.5.4: 感电层数机制（shockChance/shockStacks/shockStackMax）
                if (te.shockChance && Math.random() < te.shockChance) {
                    const existingShock = this.enemy.statusEffects.find(e => e.type === 'shock' || e.type === 'electrified');
                    const maxStacks = te.shockStackMax || 3;
                    const addStacks = te.shockStacks || 1;
                    if (existingShock) {
                        existingShock.stacks = Math.min((existingShock.stacks || 1) + addStacks, maxStacks);
                        existingShock.duration = Math.max(existingShock.duration, 2);
                        // v1.5.4: 感电伤害加成（shockDamageBonus）
                        if (te.shockDamageBonus) {
                            existingShock.thunderDamageBonus = (existingShock.thunderDamageBonus || 0) + te.shockDamageBonus;
                        }
                        this.addLog(`⚡ 感电叠加 ${existingShock.stacks}/${maxStacks}！`, 'element');
                        // 满层麻痹（shockParalyzeOnMax）
                        if (existingShock.stacks >= maxStacks && te.shockParalyzeOnMax) {
                            if (!this.enemy.statusEffects.some(e => e.type === 'paralyze')) {
                                this.addStatusEffect(this.enemy, { type: 'paralyze', name: '感电麻痹', duration: te.paralyzeDuration || 2 });
                                this.addLog(`⚡ 感电满层！${this.enemy.name} 被麻痹！`, 'element');
                            }
                        }
                    } else {
                        this.addStatusEffect(this.enemy, {
                            type: 'shock', name: '感电', duration: 3, stacks: addStacks,
                            thunderDamageBonus: te.shockThunderBonus || te.shockDamageBonus || 0.1
                        });
                        this.addLog(`⚡ ${this.enemy.name} 进入感电状态（${addStacks}层）！`, 'element');
                    }
                }
            }
        }

        // 天赋吸血：普攻造成伤害回复HP
        let totalAttackDamage = damage.amount;
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.lifesteal && te.lifesteal > 0) {
                const healAmount = Math.floor(damage.amount * te.lifesteal);
                if (healAmount > 0 && this.player.hp < this.player.maxHp) {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🩸 吸血恢复 ${healAmount} 点生命！`, 'heal');
                }
            }
        }

        // 天赋连击：概率追加攻击
        if (!damage.isMiss && damage.amount > 0 && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.comboChance && te.comboChance > 0 && Math.random() < te.comboChance) {
                const comboDmgMult = te.comboDamageMult || 0.5;
                const comboDamage = this.calculateDamage(
                    this.player.attack * comboDmgMult,
                    this.enemy.defense,
                    1.0, 0, this.player.hitRate,
                    'physical', null, this.enemy, this.player
                );
                if (!comboDamage.isMiss) {
                    this.applyDamage(this.enemy, comboDamage, this.player);
                    totalAttackDamage += comboDamage.amount;
                    this.addLog(`⚡ 连击！追加 ${comboDamage.amount} 点伤害！`, 'counter');
                    this.showDamageNumber('enemy', comboDamage.amount, 'normal');
                }
            }
            // 天赋：风刃追加 - 概率追加多道风刃
            if (te.windBladeChance && te.windBladeChance > 0 && Math.random() < te.windBladeChance) {
                const bladeCount = te.windBladeCount || 3;
                const bladeDmgMult = te.windBladeDamage || 0.3;
                let totalBladeDmg = 0;
                for (let i = 0; i < bladeCount; i++) {
                    const bladeDmg = this.calculateDamage(
                        this.player.attack * bladeDmgMult,
                        this.enemy.defense,
                        1.0, 0.1, this.player.hitRate,
                        'wind', null, this.enemy, this.player
                    );
                    if (!bladeDmg.isMiss) {
                        this.applyDamage(this.enemy, bladeDmg, this.player);
                        totalBladeDmg += bladeDmg.amount;
                    }
                }
                if (totalBladeDmg > 0) {
                    this.addLog(`🌪️ 风刃乱舞！${bladeCount}道风刃造成 ${totalBladeDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', totalBladeDmg, 'normal');
                }
            }

            // 天赋：二连斩（风系连袭Lv3）
            if (te.doubleStrikeChance && Math.random() < te.doubleStrikeChance) {
                let ratio = te.secondHitRatio || 0.85;
                // 连击伤害加成（comboDamage）
                if (te.comboDamage) ratio += te.comboDamage;
                // 连段伤害递增（comboDamageIncrease：第二段+X）
                if (te.comboDamageIncrease) ratio += te.comboDamageIncrease;
                const secondDmg = this.calculateDamage(
                    this.player.attack * ratio,
                    this.enemy.defense,
                    1.0, 0.1, this.player.hitRate,
                    'wind', null, this.enemy, this.player
                );
                if (!secondDmg.isMiss) {
                    this.applyDamage(this.enemy, secondDmg, this.player);
                    totalAttackDamage += secondDmg.amount;
                    this.addLog(`⚔️ 二连斩！追加 ${secondDmg.amount} 点伤害！`, 'counter');
                    this.showDamageNumber('enemy', secondDmg.amount, 'normal');

                    // 三连斩（在二连斩触发后判定）
                    if (te.tripleStrikeChance && Math.random() < te.tripleStrikeChance) {
                        let thirdRatio = te.thirdHitRatio || 0.6;
                        if (te.comboDamage) thirdRatio += te.comboDamage;
                        // 连段伤害递增（comboDamageIncrease：第三段再+X，共+2X）
                        if (te.comboDamageIncrease) thirdRatio += te.comboDamageIncrease * 2;
                        const thirdDmg = this.calculateDamage(
                            this.player.attack * thirdRatio,
                            this.enemy.defense,
                            1.0, 0.15, this.player.hitRate,
                            'wind', null, this.enemy, this.player
                        );
                        if (!thirdDmg.isMiss) {
                            this.applyDamage(this.enemy, thirdDmg, this.player);
                            totalAttackDamage += thirdDmg.amount;
                            this.addLog(`⚔️⚔️ 三连斩！再追加 ${thirdDmg.amount} 点伤害！`, 'counter');
                            this.showDamageNumber('enemy', thirdDmg.amount, 'normal');
                        }
                    }
                }
            }

            // 天赋：风魔 - 每次命中叠加攻速和暴击（本回合内有效，回合结束重置）
            if (te.attackSpeedStack) {
                this.player.comboCount = Math.min((this.player.comboCount || 0) + 1, te.attackSpeedMax || 6);
                if (this.player.comboCount >= (te.attackSpeedMax || 6)) {
                    this.addLog(`🌪️ 风魔满层！下次攻击暴击和速度达到巅峰！`, 'buff');
                }
            }
            // 天赋：飓风（hurricaneChance）：30%卷起敌人1回合，受伤+20%
            if (te.hurricaneChance && Math.random() < te.hurricaneChance) {
                this.addStatusEffect(this.enemy, {
                    type: 'stun', name: '飓风卷起', duration: te.hurricaneDuration || 1,
                    damageTaken: te.hurricaneVulnerable || 0.2
                });
                this.addLog(`🌪️ 飓风！${this.enemy.name} 被卷起！`, 'element');
            }
            // 天赋：滋润（regenChance）：50%概率获得5回合5%HP回复
            if (te.regenChance && Math.random() < te.regenChance) {
                const existingRegen = this.player.statusEffects.find(e => e.type === 'regen');
                if (existingRegen) {
                    existingRegen.duration = te.regenDuration || 5;
                } else {
                    this.addStatusEffect(this.player, {
                        type: 'regen', name: '滋润', duration: te.regenDuration || 5,
                        regenAmount: te.regenAmount || 0.05
                    });
                }
                this.addLog(`💧 滋润！5回合内每回合恢复HP！`, 'heal');
            }
        }
        
        // 普通攻击恢复少量MP（2%最大MP）
        if (this.player.maxMp > 0) {
            const mpGain = Math.floor(this.player.maxMp * 0.02);
            if (mpGain > 0 && this.player.mp < this.player.maxMp) {
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpGain);
            }
        }
        
        // 元素反应：处理状态变化
        if (damage.elementReaction && !damage.isMiss && this.enemy.statusEffects) {
            // 碎冰消耗冻结状态
            if (damage.elementReaction === 'shatter') {
                this.enemy.statusEffects = this.enemy.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                this.addLog(`❄️ 碎冰反应！冻结被打破，造成额外伤害！`, 'magic');
            }
        }
        
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
            // 天赋：雷鸣 - 暴击时概率麻痹敌人（有CD）
            if (this.player.talentEffects && this.player.talentEffects.thunderRoar) {
                if (!this._thunderRoarCd || this._thunderRoarCd <= 0) {
                    if (Math.random() < this.player.talentEffects.thunderRoar) {
                        this.addStatusEffect(this.enemy, {
                            type: 'paralyze', name: '雷鸣麻痹', duration: this.player.talentEffects.thunderRoarParalyze || 1
                        });
                        this.addLog(`⚡ 雷鸣！${this.enemy.name} 被麻痹！`, 'element');
                        this._thunderRoarCd = this.player.talentEffects.thunderRoarCooldown || 3;
                    }
                }
            }
            // 天赋：暴击必麻痹（天雷Lv7雷霆之怒）
            if (this.player.talentEffects && this.player.talentEffects.critParalyze) {
                this.addStatusEffect(this.enemy, {
                    type: 'paralyze', name: '雷霆麻痹', duration: 1
                });
                this.addLog(`⚡ 雷霆之怒！暴击必定麻痹！`, 'element');
            }
            // 天赋：天雷引 - 攻击时30%概率随机落雷
            if (this.player.talentEffects && this.player.talentEffects.skyThunderChance && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.skyThunderChance) {
                    const thunderDmg = Math.floor(this.player.attack * (this.player.talentEffects.skyThunderDamage || 0.8));
                    this.applyDamage(this.enemy, { amount: thunderDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`⚡ 天雷引！一道雷电劈下，造成 ${thunderDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', thunderDmg, 'normal');
                }
            }
            // 天赋：暴击击退（critKnockback：暴击时概率眩晕敌人）
            if (this.player.talentEffects && this.player.talentEffects.critKnockback && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.critKnockback) {
                    const alreadyStunned = this.enemy.statusEffects.some(e => e.type === 'stun');
                    if (!alreadyStunned) {
                        this.addStatusEffect(this.enemy, { type: 'stun', name: '击退', duration: 1 });
                        this.addLog(`💥 暴击击退！${this.enemy.name} 被震退！`, 'element');
                    }
                }
            }
            // 天赋：攻击爆炸（explosionChance：攻击时概率爆炸造成额外伤害）
            if (this.player.talentEffects && this.player.talentEffects.explosionChance && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.explosionChance) {
                    const explDmg = Math.floor(damage.amount * (this.player.talentEffects.explosionDamage || 0.5));
                    this.applyDamage(this.enemy, { amount: explDmg, element: 'fire', isCrit: this.player.talentEffects.explosionCritGuaranteed, isMiss: false }, this.player);
                    this.addLog(`💥 爆炸！额外造成 ${explDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', explDmg, 'magic');
                    // 连锁爆炸（chainExplosionChance：爆炸后概率触发二次爆炸）
                    if (this.player.talentEffects.chainExplosionChance) {
                        if (Math.random() < this.player.talentEffects.chainExplosionChance) {
                            const chainExplDmg = Math.floor(explDmg * (this.player.talentEffects.chainExplosionDamage || 0.5));
                            this.applyDamage(this.enemy, { amount: chainExplDmg, element: 'fire', isCrit: false, isMiss: false }, this.player);
                            this.addLog(`💥 连锁爆炸！再造成 ${chainExplDmg} 点伤害！`, 'element');
                            this.showDamageNumber('enemy', chainExplDmg, 'magic');
                        }
                    }
                }
            }
            // 天赋：闪电连锁（chainChance：攻击时概率连锁额外雷电伤害）
            if (this.player.talentEffects && this.player.talentEffects.chainChance && !damage.isMiss) {
                if (Math.random() < this.player.talentEffects.chainChance) {
                    const chainCount = this.player.talentEffects.chainTargets || 1;
                    const chainRatio = this.player.talentEffects.chainDamageRatio || 0.5;
                    let chainDmg = Math.floor(damage.amount * chainRatio);
                    for (let i = 0; i < chainCount; i++) {
                        // 连锁伤害递减（除非chainNoDecay）
                        if (!this.player.talentEffects.chainNoDecay && i > 0) {
                            chainDmg = Math.floor(chainDmg * 0.7);
                        }
                        this.applyDamage(this.enemy, { amount: chainDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                        this.addLog(`⚡ 连锁闪电！造成 ${chainDmg} 点伤害！`, 'element');
                        this.showDamageNumber('enemy', chainDmg, 'magic');
                    }
                }
            }
            // 天赋：暴击得护盾
            if (this.player.talentEffects && this.player.talentEffects.shieldOnCrit) {
                const shieldAmount = Math.floor(this.player.maxHp * this.player.talentEffects.shieldOnCrit);
                const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                if (existingShield) {
                    existingShield.value = Math.max(existingShield.value, shieldAmount);
                } else {
                    this.addStatusEffect(this.player, {
                        type: 'shield', name: '圣光护盾', value: shieldAmount, duration: 3
                    });
                }
                this.addLog(`🛡️ 暴击获得 ${shieldAmount} 点护盾！`, 'buff');
            }
        } else {
            this.consecutiveCrits = 0;
        }
        
        this.addLog(`你发动了普通攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, damage.isCrit ? 'crit' : 'damage');
        
        // 玩家攻击冲刺动画
        if (typeof UI !== 'undefined' && UI.playAttackAnimation) UI.playAttackAnimation(true);
        
        // 显示浮动伤害数字
        if (!damage.isMiss) {
            const dmgType = damage.isCrit ? 'crit' : 'normal';
            this.showDamageNumber('enemy', damage.amount, dmgType);
            // 敌人受击动画
            setTimeout(() => {
                if (typeof UI !== 'undefined' && UI.playHitAnimation) UI.playHitAnimation(false, damage.isCrit);
            }, 150);
        } else {
            // 未命中/闪避飘字
            this.showDamageNumber('enemy', 0, 'dodge');
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
        this.player.mp -= channelMpCost;
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
        // 消耗MP（天赋可减少消耗）
        let actualMpCost = skill.mpCost;
        if (isPlayer && this.player.mpCostReduction) {
            actualMpCost = Math.max(0, Math.floor(skill.mpCost * (1 - this.player.mpCostReduction)));
        }
        // 连段MP减少（comboMpReduction：连击时第二段及以后MP消耗降低）
        if (isPlayer && this.player.talentEffects && this.player.talentEffects.comboMpReduction) {
            const comboReduction = this.player.talentEffects.comboMpReduction;
            if ((this.player.comboCount || 0) > 0) {
                actualMpCost = Math.max(0, Math.floor(actualMpCost * (1 - comboReduction)));
            }
        }
        casterData.mp -= actualMpCost;

        // v0.86.0: 元素能量系统
        let elementBurst = false;  // 是否触发元素爆发
        if (isPlayer && skill.type === 'damage') {
            const tier = skill.tier || '初阶';
            const isBasic = tier === '初阶';
            
            if (this.elementEnergy >= this.elementEnergyMax) {
                // 能量满时，下一个伤害技能触发爆发
                elementBurst = true;
                this.elementEnergy = 0;
                // 返还一半MP消耗
                casterData.mp += Math.floor(actualMpCost / 2);
                this.addLog(`⚡ 元素爆发！${skill.name} 伤害+50%、MP消耗减半、必定暴击！`, 'crit');
            } else if (isBasic) {
                // 初阶伤害技能积累1点能量
                this.elementEnergy = Math.min(this.elementEnergyMax, this.elementEnergy + 1);
                if (this.elementEnergy === this.elementEnergyMax) {
                    this.addLog(`✨ 元素能量已满！下一个伤害技能将触发爆发！`, 'element');
                }
            }
        }

        // 记录玩家使用过的元素系（用于经验分配）
        if (isPlayer && skill.element && skill.element !== 'neutral') {
            this.usedElements.add(skill.element);
        }

        // v2.2.0: 天赋资源积累（根据技能元素）
        if (isPlayer && typeof TalentCombatSystem !== 'undefined' && skill.type === 'damage') {
            const element = skill.element;
            const te = this.player.talentEffects || {};
            if (element === 'fire') {
                const gain = te.fireEnergyGain || 1;
                const max = te.fireEnergyMax || 10;
                const reachedMax = TalentCombatSystem.addEnergy('fire', gain, max);
                // v2.2.0: 燃点满层自动爆炸
                if (reachedMax && te.fireExplodeOnMax) {
                    // v2.3.0: 火+风组合 - 疾风状态下爆炸伤害+50%
                    let windBonus = 1;
                    if (te.windStreakOnDodge && TalentCombatSystem.hasWindStreak()) {
                        windBonus = 1.5;
                        this.addLog(`🔥💨 火焰风暴！疾风强化爆炸！`, 'crit');
                    }
                    const explodeDmg = Math.floor(this.player.attack * (te.fireExplodeDamage || 0.80) * (te.fireExplodeBonus || 1) * windBonus);
                    this.addLog(`🔥 燃点已满！触发烈焰爆炸！`, 'crit');
                    this.applyDamage(this.enemy, { amount: explodeDmg, element: 'fire', isCrit: te.fireExplodeCrit || false, isMiss: false }, this.player);
                    // 爆炸后保留部分燃点（分支效果）
                    const keep = te.fireExplodeKeep || 0;
                    TalentCombatSystem.state.fireEnergy = keep;
                }
                // v2.4.0: 火+土组合 - 熔岩：火系攻击附加灼烧
                if (te.earthEnergyGain && !this.enemy.statusEffects.some(e => e.type === 'burn')) {
                    this.applyStatusEffects(this.enemy, [{
                        type: 'burn', name: '灼烧', duration: 3,
                        damagePerTurn: Math.floor(this.player.attack * 0.1)
                    }], true);
                    this.addLog(`🔥🪨 熔岩！目标被灼烧！`, 'element');
                }
            } else if (element === 'thunder') {
                const gain = 2;
                const max = 6;
                const reachedMax = TalentCombatSystem.addEnergy('thunder', gain, max);
                // v2.2.0: 电荷满层触发连锁闪电
                if (reachedMax) {
                    const chainCount = te.thunderChainTargets || 2;
                    const chainRatio = te.thunderChainRatio || 0.6;
                    let chainDmg = Math.floor(this.player.attack * chainRatio);
                    this.addLog(`⚡ 电荷已满！触发连锁闪电！`, 'crit');
                    for (let i = 0; i < chainCount; i++) {
                        if (i > 0) chainDmg = Math.floor(chainDmg * 0.7);
                        this.applyDamage(this.enemy, { amount: chainDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                        this.addLog(`⚡ 连锁闪电第${i+1}段！造成 ${chainDmg} 点伤害！`, 'element');
                    }
                    TalentCombatSystem.resetEnergy('thunder');
                }
            } else if (element === 'dark') {
                // v2.2.0: 暗系诅咒叠加
                if (!this.enemy.curseStacks) this.enemy.curseStacks = 0;
                this.enemy.curseStacks = Math.min(te.curseMax || 5, this.enemy.curseStacks + 1);
                this.addLog(`🌑 诅咒叠加 ${this.enemy.curseStacks}/${te.curseMax || 5}层！`, 'element');
                // 满层引爆
                if (this.enemy.curseStacks >= (te.curseMax || 5)) {
                    const curseDmg = Math.floor(this.player.attack * 0.5 * this.enemy.curseStacks);
                    this.addLog(`🌑 诅咒满层！引爆造成 ${curseDmg} 点伤害！`, 'crit');
                    this.applyDamage(this.enemy, { amount: curseDmg, element: 'dark', isCrit: false, isMiss: false, trueDamage: true }, this.player);
                    this.enemy.curseStacks = 0;
                }
            } else if (element === 'water') {
                // v2.4.0: 植物+水组合 - 滋养：水系技能使植物生长+2层
                if (te.plantGrowth && this.player.elements && this.player.elements.includes('plant')) {
                    if (!this.player.plantGrowthStacks) this.player.plantGrowthStacks = 0;
                    this.player.plantGrowthStacks = Math.min(te.plantGrowthMax || 8, this.player.plantGrowthStacks + 2);
                    this.addLog(`🌿💧 滋养！水系技能使植物生长+2（${this.player.plantGrowthStacks}/${te.plantGrowthMax || 8}）`, 'element');
                }
            }
            // 其他系的资源积累在各自的天赋效果中处理
        }
        
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

            // 基础伤害计算：支持power（攻击力倍率）和baseDamage+damageMultiplier两种方式
            let baseDamage;
            if (skill.power) {
                // power方式：基础伤害 = 攻击力 × power倍率
                baseDamage = effectiveAttack * skill.power;
            } else {
                // baseDamage方式：基础伤害 = 固定值 + 攻击力 × 倍率
                baseDamage = (skill.baseDamage || 0) + effectiveAttack * (skill.damageMultiplier || 1.0);
            }
            
            // 精神力加成
            const spirit = casterData.spirit || 10;
            const spiritBonus = 1 + spirit * 0.005;
            
            // 元素克制
            const elementBonus = this.getElementBonus(skill.element, targetData.elements?.[0] || 'neutral');
            
            // 天赋加成（仅玩家）
            let talentBonus = 1.0;
            let talentSkillLevelBonus = 0;
            if (isPlayer && typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
                const talentEffects = Player.getElementTalentEffects(skill.element);
                if (talentEffects.damageBonus) {
                    talentBonus = 1 + talentEffects.damageBonus;
                }
                // 天赋技能等级加成（如烈焰领主：技能等级+1，伤害+15%）
                if (talentEffects.skillLevelBonus) {
                    talentSkillLevelBonus = talentEffects.skillLevelBonus * 0.15;
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

            // 各系等级加成（仅玩家）：魔法威力 = 基础 × (1 + 该系等级×0.05)
            let elementLevelBonus = 1.0;
            if (isPlayer && skill.element && typeof Player !== 'undefined') {
                const elLevel = Player.getElementLevel(skill.element);
                if (elLevel > 0) {
                    elementLevelBonus = 1 + elLevel * 0.05;
                }
            }

            // v0.8.27: 召唤兽在场时玩家技能伤害加成
            let summonMasterSkillBonus = 1.0;
            if (isPlayer && this.summon && this.player.talentEffects?.summonMasterDamageBonus) {
                summonMasterSkillBonus = 1 + this.player.talentEffects.summonMasterDamageBonus;
            }
            // v0.8.27: 对有debuff敌人增伤
            let debuffedSkillBonus = 1.0;
            if (isPlayer && this.player.talentEffects?.debuffedDamageBonus) {
                const hasDebuff = targetData.statusEffects.some(e =>
                    ['burn','freeze','frozen','stun','slow','poison','curse','paralyze','weakness','bleed','bind','blind','fear','shock','attack_down','defense_down'].includes(e.type)
                );
                if (hasDebuff) debuffedSkillBonus = 1 + this.player.talentEffects.debuffedDamageBonus;
            }

            // v0.9.7: 体力不再影响技能伤害，staminaSkillBonus始终为1.0
            let staminaSkillBonus = 1.0;
            if (isPlayer && typeof Player !== 'undefined' && Player.getStaminaEfficiency) {
                staminaSkillBonus = Player.getStaminaEfficiency().battleDamage;
            }

            // 技能特殊属性：必中、额外暴击率
            let skillCritRate = casterData.critRate || 0.05;
            let skillHitRate = skill.hitRate || 0.9;
            if (skill.guaranteedHit) {
                skillHitRate = 1.0;
            }
            if (skill.critBonus) {
                skillCritRate += skill.critBonus;
            }
            // v0.86.0: 元素爆发必暴击
            if (elementBurst) {
                skillCritRate = 1.0;
            }

            // 多段攻击支持
            const hitCount = skill.hitCount || 1;
            let totalDamage = 0;
            let totalCritCount = 0;
            let totalMissCount = 0;
            let lastDamage = null;

            // 无视防御支持
            let effectiveDefense = targetData.defense;
            if (skill.ignoreDefense) {
                effectiveDefense = Math.floor(targetData.defense * (1 - skill.ignoreDefense));
            }

            for (let hit = 0; hit < hitCount; hit++) {
                const damage = this.calculateDamage(
                    baseDamage * spiritBonus * elementBonus * talentBonus * seedBonus * skillLevelBonus * elementLevelBonus * (1 + talentSkillLevelBonus) * summonMasterSkillBonus * debuffedSkillBonus * staminaSkillBonus * (elementBurst ? 1.5 : 1.0),
                    effectiveDefense,
                    1.0,
                    skillCritRate,
                    skillHitRate,
                    skill.element,
                    targetData.elements?.[0] || 'neutral',
                    targetData,
                    casterData
                );

                if (!damage.isMiss) {
                    this.applyDamage(targetData, damage, casterData);
                    totalDamage += damage.amount;
                    if (damage.isCrit) totalCritCount++;
                } else {
                    totalMissCount++;
                }
                lastDamage = damage;
            }

            // 使用第一段伤害的结果用于后续显示（但总伤害是累加的）
            const damage = lastDamage;
            damage.amount = totalDamage;
            damage.isCrit = totalCritCount > 0;
            damage.hitCount = hitCount;
            damage.critCount = totalCritCount;
            damage.missCount = totalMissCount;

            // 技能吸血效果（基于总伤害）
            if (skill.lifesteal && skill.lifesteal > 0 && totalDamage > 0) {
                let healAmount = Math.floor(totalDamage * skill.lifesteal);
                const healMultiplier = this.getHealingMultiplier(casterData);
                healAmount = Math.floor(healAmount * healMultiplier);
                if (healAmount > 0 && casterData.hp < casterData.maxHp) {
                    casterData.hp = Math.min(casterData.maxHp, casterData.hp + healAmount);
                    const casterName = isPlayer ? '你' : this.enemy.name;
                    this.addLog(`${casterName} 吸取了 ${healAmount} 点生命！`, 'heal');
                }
            }

            // 天赋吸血：技能也能触发
            if (isPlayer && totalDamage > 0 && this.player.talentEffects && this.player.talentEffects.lifesteal) {
                const lsRate = this.player.talentEffects.lifesteal;
                if (lsRate > 0 && (!skill.lifesteal || skill.lifesteal < lsRate)) {
                    let healAmount = Math.floor(totalDamage * lsRate);
                    const healMultiplier = this.getHealingMultiplier(casterData);
                    healAmount = Math.floor(healAmount * healMultiplier);
                    if (healAmount > 0 && casterData.hp < casterData.maxHp) {
                        casterData.hp = Math.min(casterData.maxHp, casterData.hp + healAmount);
                        this.addLog(`🩸 吸血恢复 ${healAmount} 点生命！`, 'heal');
                    }
                }
            }

            // 自身负面效果（如狂暴冲锋后防御降低）
            if (skill.selfStatusEffects && totalMissCount < hitCount) {
                this.applyStatusEffects(casterData, skill.selfStatusEffects, isPlayer);
            }

            // 火地面（fireGround）：火系技能命中后概率留下燃烧地面
            if (isPlayer && skill.element === 'fire' && totalDamage > 0 && this.player.talentEffects && this.player.talentEffects.fireGround) {
                const te = this.player.talentEffects;
                const groundChance = te.fireGround === true ? 1.0 : te.fireGround;
                if (Math.random() < groundChance) {
                    const groundDmg = Math.floor(this.player.magicPower * (te.fireGroundDamage || 0.10));
                    this.addStatusEffect(this.enemy, {
                        type: 'burn', name: '火地面', element: 'fire',
                        duration: te.fireGroundDuration || 3,
                        dotDamage: groundDmg,
                        chance: 1.0
                    });
                    this.addLog(`🔥 地面燃起火焰！持续灼烧 ${this.enemy.name}！`, 'element');
                }
            }
            // 火雨（fireRain）：每隔数回合天降火雨
            if (isPlayer && skill.element === 'fire' && this.player.talentEffects && this.player.talentEffects.fireRain) {
                const te = this.player.talentEffects;
                this._fireRainTimer = (this._fireRainTimer || 0) + 1;
                if (this._fireRainTimer >= (te.fireRainInterval || 2)) {
                    this._fireRainTimer = 0;
                    const rainDmg = Math.floor(this.player.magicPower * (te.fireRainDamage || 0.2));
                    this.applyDamage(this.enemy, { amount: rainDmg, element: 'fire', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🔥 火雨天降！对 ${this.enemy.name} 造成 ${rainDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', rainDmg, 'magic');
                }
            }
            
            // 陨石（meteor）：土系技能召唤陨石，延迟数回合后落下
            if (isPlayer && skill.element === 'earth' && this.player.talentEffects && this.player.talentEffects.meteor) {
                const te = this.player.talentEffects;
                this._meteorCountdown = te.meteorInterval || 4;
                this._meteorDamage = te.meteorDamage || 1.2;
                this._meteorStunChance = te.meteorStunChance || 0.5;
                this.addLog(`🪨 陨石正在凝聚，${this._meteorCountdown}回合后落下！`, 'element');
            }

            // 龙卷风（tornado）：风系技能命中后概率召唤龙卷风
            if (isPlayer && skill.element === 'wind' && totalDamage > 0 && this.player.talentEffects && this.player.talentEffects.tornadoChance) {
                const te = this.player.talentEffects;
                if (Math.random() < te.tornadoChance) {
                    const tornadoDmg = Math.floor(this.player.magicPower * (te.tornadoDamage || 0.4));
                    this.applyDamage(this.enemy, { amount: tornadoDmg, element: 'wind', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🌪️ 龙卷风席卷！对 ${this.enemy.name} 造成 ${tornadoDmg} 点风系伤害！`, 'element');
                    this.showDamageNumber('enemy', tornadoDmg, 'magic');
                    // 击退效果：降低敌人攻击力
                    if (te.tornadoKnockback) {
                        this.addStatusEffect(this.enemy, {
                            type: 'attack_down', name: '击退',
                            duration: 2, value: 0.15,
                            icon: '🌪️', desc: '被龙卷风击退，攻击力降低'
                        }, 0, false);
                        this.addLog(`💨 ${this.enemy.name} 被龙卷风击退，攻击力降低！`, 'debuff');
                    }
                }
            }

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
            const targetName = isPlayer ? this.enemy.name : '你';
            
            // 元素克制效果显示
            let elementEffectText = '';
            if (damage.elementEffect === 'super') {
                elementEffectText = '（效果拔群！）';
            } else if (damage.elementEffect === 'weak') {
                elementEffectText = '（效果不佳...）';
            } else if (damage.elementEffect === 'resist') {
                elementEffectText = '（被抵抗了）';
            }
            
            // 元素反应文本
            let reactionText = '';
            if (damage.elementReaction) {
                const reactionNames = {
                    vaporize: '蒸发',
                    melt: '融化',
                    overload: '超载',
                    electro: '感电',
                    superconduct: '超导',
                    freeze: '冻结反应',
                    swirl_fire: '扩散火',
                    swirl_water: '扩散水',
                    swirl_thunder: '扩散雷',
                    swirl_ice: '扩散冰',
                    mud: '泥浆',
                    crystallize: '结晶',
                    shatter: '碎冰'
                };
                reactionText = `（${reactionNames[damage.elementReaction]}！）`;
            }
            
            // 多段攻击日志
            let hitText = '';
            if (damage.hitCount && damage.hitCount > 1) {
                const hits = damage.hitCount - damage.missCount;
                hitText = `（${hits}连击`;
                if (damage.critCount > 0) hitText += `，${damage.critCount}次暴击`;
                if (damage.missCount > 0) hitText += `，${damage.missCount}次未命中`;
                hitText += '）';
            }

            this.addLog(`${casterName} 释放了 ${skill.name}，造成 ${damage.amount} 点伤害${damage.isCrit && (!damage.hitCount || damage.hitCount === 1) ? '（暴击！）' : ''}${damage.isMiss && (!damage.hitCount || damage.hitCount === 1) ? '（未命中！）' : ''}${hitText}${elementEffectText}${reactionText}`,
                damage.isCrit ? 'crit' : 'magic');
            
            // 显示浮动伤害数字（至少命中一段才显示）
            if (totalMissCount < hitCount) {
                let dmgType = 'magic';
                if (damage.isCrit) dmgType = 'crit';
                else if (damage.elementEffect === 'super') dmgType = 'counter';
                else if (damage.elementEffect === 'weak') dmgType = 'weakness';

                const target = isPlayer ? 'enemy' : 'player';
                this.showDamageNumber(target, damage.amount, dmgType);
                
                // 施法者攻击动画
                if (typeof UI !== 'undefined' && UI.playAttackAnimation) UI.playAttackAnimation(isPlayer);
                // 目标受击动画
                setTimeout(() => {
                    if (typeof UI !== 'undefined' && UI.playHitAnimation) UI.playHitAnimation(!isPlayer, damage.isCrit);
                }, 200);
            } else if (hitCount > 0 && totalMissCount >= hitCount) {
                // 全部未命中，显示闪避
                const target = isPlayer ? 'enemy' : 'player';
                this.showDamageNumber(target, 0, 'dodge');
            }
            
            // 元素反应：处理状态变化（至少命中一段才触发）
            if (damage.elementReaction && totalMissCount < hitCount && targetData.statusEffects) {
                // 蒸发/感电/冻结都会消耗水状态
                if (damage.elementReaction === 'vaporize' || 
                    damage.elementReaction === 'electro' || 
                    damage.elementReaction === 'freeze') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'wet');
                }
                // 融化/超导消耗冰状态
                if (damage.elementReaction === 'melt' || damage.elementReaction === 'superconduct') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                }
                // 超载消耗雷状态
                if (damage.elementReaction === 'overload') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'electrified' && e.type !== 'paralyze');
                }
                // 感电附加麻痹
                if (damage.elementReaction === 'electro') {
                    const paralyzeEffect = { type: 'paralyze', name: '麻痹', duration: 1, skipTurn: true };
                    targetData.statusEffects.push(paralyzeEffect);
                    this.addLog(`${targetName} 陷入了麻痹状态！`, 'debuff');
                }
                // 冻结反应附加冻结
                if (damage.elementReaction === 'freeze') {
                    const freezeEffect = { type: 'frozen', name: '冻结', duration: 1, skipTurn: true };
                    targetData.statusEffects.push(freezeEffect);
                    this.addLog(`${targetName} 被冻结了！`, 'debuff');
                }
                // 超导降低防御
                if (damage.elementReaction === 'superconduct') {
                    const defDownEffect = { type: 'defense_down', name: '防御降低', duration: 3, defenseMod: -0.2 };
                    targetData.statusEffects.push(defDownEffect);
                    this.addLog(`${targetName} 防御降低了！`, 'debuff');
                }
                // 泥浆减速
                if (damage.elementReaction === 'mud') {
                    const mudEffect = { type: 'slow', name: '泥浆', duration: 2, speedMod: -0.3 };
                    targetData.statusEffects.push(mudEffect);
                    this.addLog(`${targetName} 陷入泥浆，速度降低！`, 'debuff');
                }
                // 结晶产生护盾
                if (damage.elementReaction === 'crystallize') {
                    const shieldAmount = Math.floor(casterData.attack * 0.3);
                    const shieldEffect = { type: 'shield', name: '结晶护盾', value: shieldAmount, duration: 3 };
                    targetData.statusEffects.push(shieldEffect);
                    this.addLog(`${targetName} 获得了 ${shieldAmount} 点结晶护盾！`, 'buff');
                }
                // 碎冰消耗冻结状态
                if (damage.elementReaction === 'shatter') {
                    targetData.statusEffects = targetData.statusEffects.filter(e => e.type !== 'freeze' && e.type !== 'frozen');
                    this.addLog(`❄️ 碎冰反应！冻结被打破，造成额外伤害！`, 'magic');
                }
            }
            
            // 发布命中/暴击/闪避/伤害事件
            if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                const attacker = isPlayer ? 'player' : 'enemy';
                const target = isPlayer ? 'enemy' : 'player';

                const allMiss = totalMissCount >= hitCount;
                if (allMiss) {
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

            // 状态效果（至少命中一段才应用）
            if (skill.statusEffects && totalMissCount < hitCount) {
                this.applyStatusEffects(targetData, skill.statusEffects, !isPlayer);
            }
            
            // 灵种特殊效果（仅玩家，至少命中一段才触发）
            if (isPlayer && typeof Player !== 'undefined' && typeof SpiritSeedSystem !== 'undefined' && totalMissCount < hitCount) {
                this.applySpiritSeedEffects(targetData, skill.element);
            }

        } else if (skill.type === 'heal') {
            // 治疗技能
            let healAmount;
            if (skill.healPercent) {
                // 按百分比恢复
                healAmount = Math.floor(casterData.maxHp * skill.healPercent);
            } else {
                // 固定数值恢复
                healAmount = Math.floor(skill.baseHeal * (1 + casterData.spirit * 0.01));
            }
            // 治疗目标：self类型治疗自己，否则治疗targetData
            const healTarget = (skill.targetType === 'self') ? casterData : targetData;
            // 应用治疗降低效果（如坏血）
            const healMultiplier = this.getHealingMultiplier(healTarget);
            let actualHeal = Math.floor(healAmount * healMultiplier);
            // 天赋治疗加成
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healBonus) {
                actualHeal = Math.floor(actualHeal * (1 + this.player.talentEffects.healBonus));
            }
            // 潮汐涨潮治疗加成
            if (isPlayer && this.player.tideHealBonus) {
                actualHeal = Math.floor(actualHeal * (1 + this.player.tideHealBonus));
            }
            // 治疗额外HP（healExtraHp）：额外治疗5%最大HP
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healExtraHp && healTarget === this.player) {
                actualHeal += Math.floor(this.player.maxHp * this.player.talentEffects.healExtraHp);
            }
            // 天赋治疗暴击
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healCritRate) {
                if (Math.random() < this.player.talentEffects.healCritRate) {
                    const critMult = this.player.talentEffects.healCritDouble ? 2 : 1.5;
                    actualHeal = Math.floor(actualHeal * critMult);
                    this.addLog(`💚 治疗暴击！`, 'heal');
                }
            }
            healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + actualHeal);

            // v1.5.6: 祝福层数机制（blessingStack）- 治疗时叠加祝福
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.blessingStack && healTarget === this.player) {
                const te = this.player.talentEffects;
                const maxBlessing = te.blessingMax || 3;
                if (!this.player._blessingStacks) this.player._blessingStacks = 0;
                this.player._blessingStacks = Math.min(this.player._blessingStacks + 1, maxBlessing);
                const healBonus = te.blessingHealBonus || 0.05;
                this.addLog(`✨ 祝福叠加 ${this.player._blessingStacks}/${maxBlessing}（治疗+${Math.floor(healBonus*100)}%）`, 'heal');
                // 满层生命绽放（blessingBloomOnMax）
                if (this.player._blessingStacks >= maxBlessing && te.blessingBloomOnMax) {
                    const bloomHeal = Math.floor(this.player.maxHp * (te.bloomHeal || 0.3));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + bloomHeal);
                    this.addLog(`✨ 生命绽放！恢复 ${bloomHeal} 点生命！`, 'heal');
                    // 绽放净化（bloomPurify）
                    if (te.bloomPurify) {
                        const beforeCount = this.player.statusEffects.length;
                        this.player.statusEffects = this.player.statusEffects.filter(e => !['burn','poison','bleed','slow','curse','wet','shock'].includes(e.type));
                        const removed = beforeCount - this.player.statusEffects.length;
                        if (removed > 0) this.addLog(`✨ 绽放净化！清除 ${removed} 个负面状态！`, 'heal');
                    }
                    this.player._blessingStacks = 0;
                }
                // 满层圣恩（blessingGraceOnMax）
                if (this.player._blessingStacks >= maxBlessing && te.blessingGraceOnMax) {
                    const graceDuration = te.graceDuration || 3;
                    this.addStatusEffect(this.player, {
                        type: 'grace', name: '圣恩', duration: graceDuration,
                        attackBonus: te.graceAtkBonus || 0.2,
                        defenseBonus: te.graceDefBonus || 0.2,
                        speedBonus: te.graceSpeedBonus || 0.1
                    });
                    this.addLog(`✨ 圣恩降临！全属性提升 ${graceDuration} 回合！`, 'buff');
                    this.player._blessingStacks = 0;
                }
            }

            // 天赋：治疗转护盾（healShield：治疗量20%转为护盾）
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healShield && healTarget === this.player) {
                const shieldRatio = this.player.talentEffects.healShield;
                const shieldDuration = this.player.talentEffects.healShieldDuration || 2;
                const shieldAmount = Math.floor(actualHeal * shieldRatio);
                if (shieldAmount > 0) {
                    const existingShield = healTarget.statusEffects.find(e => e.type === 'shield');
                    if (existingShield) {
                        existingShield.value += shieldAmount;
                    } else {
                        this.addStatusEffect(healTarget, { type: 'shield', name: '治疗护盾', value: shieldAmount, duration: shieldDuration });
                    }
                    this.addLog(`💚 治疗转化为 ${shieldAmount} 点护盾！`, 'heal');
                }
            }
            // 天赋：生命之种（lifeSeed）：治疗时种下种子，延迟后爆发治疗
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.lifeSeed && healTarget === this.player) {
                const delay = this.player.talentEffects.lifeSeedDelay || 3;
                const healRatio = this.player.talentEffects.lifeSeedHeal || 0.15;
                healTarget._lifeSeedDelay = delay;
                healTarget._lifeSeedHeal = Math.floor(healTarget.maxHp * healRatio);
                this.addLog(`🌱 生命之种下！${delay}回合后爆发治疗！`, 'heal');
            }
            // 天赋：治疗时净化（purifyOnHealChance）
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.purifyOnHealChance && healTarget === this.player) {
                const cleansable = healTarget.statusEffects.filter(e =>
                    ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear'].includes(e.type) && !e.unpurgeable
                );
                if (cleansable.length > 0 && Math.random() < this.player.talentEffects.purifyOnHealChance) {
                    healTarget.statusEffects = healTarget.statusEffects.filter(e => !cleansable.includes(e));
                    this.addLog(`✨ 治疗净化了 ${cleansable.length} 个负面状态！`, 'heal');
                }
            }
            // 群体治疗（aoeHeal）：无队友时治疗召唤兽+恢复MP
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.aoeHeal) {
                const aoeRatio = this.player.talentEffects.aoeHealRatio || 0.5;
                const aoeHealAmount = Math.floor(actualHeal * aoeRatio);
                // 治疗召唤兽
                if (this.summon && this.summon.hp > 0 && this.summon.hp < this.summon.maxHp) {
                    const summonHeal = Math.min(aoeHealAmount, this.summon.maxHp - this.summon.hp);
                    this.summon.hp += summonHeal;
                    this.addLog(`💚 ${this.summon.name} 也受到了 ${summonHeal} 点治疗！`, 'heal');
                }
                // 恢复MP
                const mpRecover = Math.floor(this.player.maxMp * aoeRatio * 0.5);
                if (mpRecover > 0 && this.player.mp < this.player.maxMp) {
                    const actualMp = Math.min(mpRecover, this.player.maxMp - this.player.mp);
                    this.player.mp += actualMp;
                    this.addLog(`💙 群体治疗恢复了 ${actualMp} 点MP！`, 'heal');
                }
                // 全体净化（purifyAll）
                if (this.player.talentEffects.purifyAll) {
                    const cleansable = this.player.statusEffects.filter(e =>
                        ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear', 'weakness'].includes(e.type) && !e.unpurgeable
                    );
                    if (cleansable.length > 0) {
                        this.player.statusEffects = this.player.statusEffects.filter(e => !cleansable.includes(e));
                        this.addLog(`✨ 全体净化！清除了 ${cleansable.length} 个负面状态！`, 'heal');
                    }
                }
            }
            // 天赋：全净化（purifyAll）：治疗时净化所有负面
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.purifyAll && healTarget === this.player) {
                const cleansable = healTarget.statusEffects.filter(e =>
                    ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear'].includes(e.type) && !e.unpurgeable
                );
                if (cleansable.length > 0) {
                    healTarget.statusEffects = healTarget.statusEffects.filter(e => !cleansable.includes(e));
                    this.addLog(`✨ 圣光净化！清除所有 ${cleansable.length} 个负面状态！`, 'heal');
                    // 净化回血（purifyHeal）：每个被净化的状态回血
                    if (this.player.talentEffects.purifyHeal) {
                        const healPer = this.player.talentEffects.purifyHeal;
                        const totalHeal = Math.floor(this.player.maxHp * healPer * cleansable.length);
                        healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + totalHeal);
                        this.addLog(`✨ 净化恢复 ${totalHeal} 点生命！`, 'heal');
                    }
                    // 净化攻击提升（purifyAtkDown → 净化后自身攻击提升）
                    if (this.player.talentEffects.purifyAtkBuff) {
                        this.addStatusEffect(this.player, {
                            type: 'attack_up', name: '净化之力', duration: 2,
                            atkMod: this.player.talentEffects.purifyAtkBuff
                        });
                    }
                }
            }
            // 天赋：祝福（blessAtkBonus/blessDefBonus）：治疗时获得攻防加成
            if (isPlayer && this.player.talentEffects && healTarget === this.player) {
                if (this.player.talentEffects.blessAtkBonus) {
                    this.addStatusEffect(this.player, {
                        type: 'attack_up', name: '祝福攻击', duration: this.player.talentEffects.blessDuration || 2,
                        atkMod: this.player.talentEffects.blessAtkBonus
                    });
                }
                if (this.player.talentEffects.blessDefBonus) {
                    this.addStatusEffect(this.player, {
                        type: 'defense_up', name: '祝福防御', duration: this.player.talentEffects.blessDuration || 2,
                        defMod: this.player.talentEffects.blessDefBonus
                    });
                }
            }

            // 天赋：治疗时回MP
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healMpRestore && healTarget === this.player) {
                const mpRestore = Math.floor(this.player.maxMp * this.player.talentEffects.healMpRestore);
                if (mpRestore > 0 && this.player.mp < this.player.maxMp) {
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRestore);
                    this.addLog(`💙 治疗恢复 ${mpRestore} 点MP！`, 'heal');
                }
            }
            // 天赋：治疗转伤害（healToDamage）：治疗量10%对敌人造成伤害
            if (isPlayer && this.player.talentEffects && this.player.talentEffects.healToDamage && healTarget === this.player) {
                const dmg = Math.floor(actualHeal * this.player.talentEffects.healToDamage);
                if (dmg > 0 && this.enemy.hp > 0) {
                    this.applyDamage(this.enemy, { amount: dmg, element: 'light', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`✨ 圣光惩戒！对 ${this.enemy.name} 造成 ${dmg} 点伤害！`, 'element');
                }
            }

            // 治疗技能的附加状态效果（如净化、复苏）
            if (skill.statusEffects) {
                const isHealTargetPlayer = healTarget === this.player;
                this.applyStatusEffects(healTarget, skill.statusEffects, isHealTargetPlayer);
            }

            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = skill.targetType === 'self' ? casterName : (isPlayer ? this.enemy.name : '你');
            if (healMultiplier < 1) {
                this.addLog(`${casterName} 使用 ${skill.name}，${targetName} 恢复了 ${actualHeal} 点生命（治疗效果降低${Math.round((1-healMultiplier)*100)}%）`, 'heal');
            } else {
                this.addLog(`${casterName} 使用 ${skill.name}，${targetName} 恢复了 ${actualHeal} 点生命`, 'heal');
            }
            
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
                // 处理护盾值：基于最大HP百分比计算
                if (skill.shieldValue) {
                    skill.statusEffects.forEach(effect => {
                        if (effect.type === 'shield') {
                            effect.value = Math.floor(casterData.maxHp * skill.shieldValue);
                        }
                    });
                }
                if (skill.element === 'summon' && isPlayer && this.summon) {
                    // 召唤系增益应用到召唤兽
                    this.applyStatusEffects(this.summon, skill.statusEffects, !isPlayer);
                    this.addLog(`${this.summon.icon} ${this.summon.name} 受到了 ${skill.name} 的效果！`, 'buff');
                } else {
                    this.applyStatusEffects(casterData, skill.statusEffects, isPlayer);
                }
            }
            // 自身buff同时对敌人施加debuff（如妖魔领域）
            if (skill.selfBuff && skill.targetType === 'enemy') {
                this.applyStatusEffects(casterData, skill.selfBuff, isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            if (skill.element !== 'summon') {
                this.addLog(`${casterName} 使用了 ${skill.name}`, 'buff');
            }

        } else if (skill.type === 'debuff') {
            // 减益技能（对敌人施加负面状态）
            if (skill.statusEffects) {
                this.applyStatusEffects(targetData, skill.statusEffects, !isPlayer);
            }
            // 同时给自己加buff（如妖魔领域）
            if (skill.selfBuff) {
                this.applyStatusEffects(casterData, skill.selfBuff, isPlayer);
            }
            const casterName = isPlayer ? '你' : this.enemy.name;
            const targetName = isPlayer ? this.enemy.name : '你';
            this.addLog(`${casterName} 对 ${targetName} 释放了 ${skill.name}`, 'debuff');

        } else if (skill.type === 'summon') {
            // 召唤技能
            if (isPlayer && skill.id === 'summon_beast') {
                if (this.summon) {
                    this.addLog(`已有召唤兽 ${this.summon.name}，先收回再召唤！`, 'system');
                    casterData.mp += skill.mpCost; // 退还MP
                    return { success: false };
                }
                // 首次召唤：随机契约一只召唤兽
                if (!Player.summonData) {
                    const beastData = typeof getRandomStarterBeast === 'function' ? getRandomStarterBeast() : DataSummonBeasts.shadow_wolf;
                    const result = Player.contractSummonBeast(beastData);
                    if (result.success) {
                        this.addLog(result.message, 'evolution');
                    }
                }
                // 获取当前形态数据（考虑进化）
                const sd = Player.summonData;
                const currentData = typeof getBeastCurrentData === 'function' ? getBeastCurrentData(sd) : null;
                const baseStats = currentData ? currentData.effectiveStats : {
                    maxHp: sd.baseMaxHp, attack: sd.baseAttack, defense: sd.baseDefense, speed: sd.baseSpeed
                };
                // 等级和忠诚加成
                const levelBonus = 1 + (sd.level - 1) * 0.15;
                const loyaltyBonus = 1 + (sd.loyalty - 50) / 200;
                let summonMaxHp = Math.floor(baseStats.maxHp * levelBonus * loyaltyBonus);
                let summonAtk = Math.floor(baseStats.attack * levelBonus * loyaltyBonus);
                let summonDef = Math.floor(baseStats.defense * levelBonus * loyaltyBonus);
                let summonSpd = Math.floor(baseStats.speed * levelBonus * loyaltyBonus);
                let duration = 5;

                // v0.8.27: 召唤系天赋加成
                const te = this.player.talentEffects;
                if (te) {
                    // 召唤兽等级加成
                    if (te.summonLevelBonus) {
                        const bonusLevelMult = 1 + te.summonLevelBonus * 0.15;
                        summonAtk = Math.floor(summonAtk * bonusLevelMult);
                        summonDef = Math.floor(summonDef * bonusLevelMult);
                        summonMaxHp = Math.floor(summonMaxHp * bonusLevelMult);
                        summonSpd = Math.floor(summonSpd * bonusLevelMult);
                    }
                    // 全属性加成
                    if (te.summonAllStats) {
                        summonAtk = Math.floor(summonAtk * (1 + te.summonAllStats));
                        summonDef = Math.floor(summonDef * (1 + te.summonAllStats));
                        summonMaxHp = Math.floor(summonMaxHp * (1 + te.summonAllStats));
                        summonSpd = Math.floor(summonSpd * (1 + te.summonAllStats));
                    }
                    // HP加成
                    if (te.summonHpBonus) {
                        summonMaxHp = Math.floor(summonMaxHp * (1 + te.summonHpBonus));
                    }
                    // 伤害加成（直接加在攻击上）
                    if (te.summonDamageBonus) {
                        summonAtk = Math.floor(summonAtk * (1 + te.summonDamageBonus));
                    }
                    // 继承玩属性
                    if (te.inheritStats) {
                        summonAtk += Math.floor(this.player.attack * te.inheritStats);
                        summonDef += Math.floor(this.player.defense * te.inheritStats);
                    }
                    // 继承玩家HP
                    if (te.summonInheritHp) {
                        summonMaxHp += Math.floor(this.player.maxHp * te.summonInheritHp);
                    }
                    // 持续时间加成
                    if (te.summonDurationBonus) {
                        duration += te.summonDurationBonus;
                    }
                }

                this.summon = {
                    id: sd.id,
                    baseId: sd.baseId || sd.id,
                    name: sd.name,
                    icon: sd.icon,
                    evolutionStage: sd.evolutionStage || 0,
                    level: sd.level + (te?.summonLevelBonus || 0),
                    loyalty: sd.loyalty,
                    maxHp: summonMaxHp,
                    hp: summonMaxHp,
                    attack: summonAtk,
                    defense: summonDef,
                    speed: summonSpd,
                    remainingDuration: duration,
                    buffs: [],
                    statusEffects: [],
                    expGained: 0,
                    critRate: te?.summonCritRate || 0.05,
                    critDamage: 1.5 + (te?.summonCritDamage || 0)
                };
                this.addLog(`你召唤了 ${sd.icon} ${sd.name}（Lv.${sd.level}，忠诚${sd.loyalty}）！（持续${duration}回合）`, 'magic');
                
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
                if (talentResult.evolutions && talentResult.evolutions.length > 0) {
                    for (const evo of talentResult.evolutions) {
                        this.addLog(`✨ 进化！【${evo.stage}】${evo.name}：${evo.description}`, 'evolution');
                    }
                }
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

        // v0.86.0: 设置技能冷却
        if (isPlayer && skill.type !== 'buff') {
            let cooldown = skill.cooldown || 0;
            // 根据等级自动设置冷却（如果技能数据中没有指定）
            if (cooldown === 0) {
                const tier = skill.tier || '初阶';
                if (tier === '中阶') cooldown = 1;
                else if (tier === '高阶') cooldown = 2;
                else if (tier === '超阶') cooldown = 3;
            }
            if (cooldown > 0) {
                this.skillCooldowns[skill.id] = cooldown;
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
                    
                    this.castSkillImmediate(skill, 'player', true);
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
    summonAttack() {
        if (!this.summon || !this.enemy || this.enemy.hp <= 0) return;

        const summon = this.summon;

        // 计算召唤兽属性加成（强化/狂暴状态）
        let attackMultiplier = 1;
        let defenseMultiplier = 1;
        let evasionBonus = 0;
        let hpRegen = 0;

        if (summon.statusEffects) {
            summon.statusEffects.forEach(effect => {
                if (effect.type === 'summon_buff') {
                    attackMultiplier += effect.attackBonus || 0;
                    defenseMultiplier += effect.defenseBonus || 0;
                    evasionBonus += effect.evasionBonus || 0;
                    hpRegen += effect.hpRegen || 0;
                } else if (effect.type === 'summon_rage') {
                    attackMultiplier += effect.attackBonus || 0;
                    defenseMultiplier -= effect.defenseMalus || 0;
                }
            });
        }

        // 每回合HP回复
        if (hpRegen > 0) {
            const regen = Math.floor(summon.maxHp * hpRegen);
            summon.hp = Math.min(summon.maxHp, summon.hp + regen);
            this.addLog(`${summon.icon} ${summon.name} 恢复了 ${regen} 点生命！`, 'heal');
        }

        // 获取召唤兽技能列表（支持进化后形态）
        let availableSkills;
        if (typeof getBeastCurrentData === 'function') {
            const currentData = getBeastCurrentData(summon);
            availableSkills = currentData ? currentData.skills : null;
        }
        if (!availableSkills) {
            const beastData = DataSummonBeasts[summon.id];
            availableSkills = beastData ? beastData.skills : [
                { id: 'bite', name: '攻击', minLevel: 1, damageMult: 1.0, critBonus: 0 }
            ];
        }
        const summonLevel = summon.level || 1;

        // 筛选可用技能
        const usable = availableSkills.filter(s => summonLevel >= s.minLevel);

        // 随机选择技能（35%概率用特殊技能）
        let chosenSkill = usable[0];
        if (usable.length > 1 && Math.random() < 0.35) {
            const specialSkills = usable.filter(s => s.id !== usable[0].id);
            chosenSkill = specialSkills[Math.floor(Math.random() * specialSkills.length)];
        }

        // 处理增益技能
        if (chosenSkill.type === 'buff') {
            summon.statusEffects = summon.statusEffects || [];
            const buffEffect = {
                name: chosenSkill.name,
                type: 'summon_buff',
                duration: chosenSkill.duration || 2,
                attackBonus: chosenSkill.attackBuff || 0,
                defenseBonus: chosenSkill.defenseBuff || 0,
                evasionBonus: chosenSkill.evasionBonus || 0,
                hpRegen: chosenSkill.hpRegen || 0
            };
            summon.statusEffects.push(buffEffect);
            const buffs = [];
            if (chosenSkill.attackBuff) buffs.push(`攻击+${Math.floor(chosenSkill.attackBuff * 100)}%`);
            if (chosenSkill.defenseBuff) buffs.push(`防御+${Math.floor(chosenSkill.defenseBuff * 100)}%`);
            if (chosenSkill.evasionBonus) buffs.push(`闪避+${Math.floor(chosenSkill.evasionBonus * 100)}%`);
            if (chosenSkill.hpRegen) buffs.push(`每回合回${Math.floor(chosenSkill.hpRegen * 100)}%HP`);
            this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，${buffs.join('，')}！`, 'buff');
            return;
        }

        // 处理减益技能（对敌人施加debuff）
        if (chosenSkill.type === 'debuff') {
            if (chosenSkill.stunChance && Math.random() < chosenSkill.stunChance) {
                this.addStatusEffect(this.enemy, {
                    name: chosenSkill.name + '眩晕',
                    type: 'stun',
                    duration: chosenSkill.stunDuration || 1,
                    chance: 1.0
                });
                this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，${this.enemy.name}被眩晕了！`, 'debuff');
            } else if (chosenSkill.enemyAttackDown) {
                this.addStatusEffect(this.enemy, {
                    name: chosenSkill.name + '减攻',
                    type: 'attack_down',
                    duration: chosenSkill.duration || 2,
                    chance: 1.0,
                    statModifiers: { attack: -Math.floor(chosenSkill.enemyAttackDown * 100) }
                });
                this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，${this.enemy.name}攻击力降低！`, 'debuff');
            } else {
                this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，但效果不明显...`, 'system');
            }
            // 减益技能也造成少量伤害
            const effectiveAttack = Math.floor(summon.attack * attackMultiplier * 0.5);
            const damage = this.calculateDamage(effectiveAttack, this.enemy.defense, 1.0, 0, 0.9,
                'neutral', this.enemy.elements?.[0] || 'neutral', this.enemy, summon);
            this.applyDamage(this.enemy, damage, summon);
            return;
        }

        // 攻击技能
        if (chosenSkill.hpCost) {
            const hpCost = Math.floor(summon.maxHp * chosenSkill.hpCost);
            summon.hp = Math.max(1, summon.hp - hpCost);
            this.addLog(`${summon.icon} ${summon.name} 使用「${chosenSkill.name}」，消耗${hpCost}点生命！`, 'system');
        }

        const effectiveAttack = Math.floor(summon.attack * attackMultiplier * (chosenSkill.damageMult || 1.0));
        // v0.8.27: 召唤兽暴击率/暴击伤害（来自天赋）
        let critChance = summon.critRate || 0.05;
        let critMult = summon.critDamage || 1.5;
        critChance += (chosenSkill.critBonus || 0);

        // v0.8.27: 召唤兽狂暴（低HP增伤）
        let enrageMult = 1;
        if (this.player.talentEffects?.summonEnrage && summon.hp / summon.maxHp < 0.3) {
            enrageMult = 1 + this.player.talentEffects.summonEnrage;
            this.addLog(`🔥 ${summon.name} 陷入狂暴！伤害+${Math.floor(this.player.talentEffects.summonEnrage * 100)}%！`, 'buff');
        }

        const finalAttack = Math.floor(effectiveAttack * enrageMult);
        const damage = this.calculateDamage(
            finalAttack,
            Math.floor(this.enemy.defense * defenseMultiplier),
            1.0,
            critChance,
            0.9,
            'neutral',
            this.enemy.elements?.[0] || 'neutral',
            this.enemy,
            summon
        );
        // 应用暴击伤害倍率
        if (damage.isCrit) {
            damage.amount = Math.floor(damage.amount * critMult / 1.5);
        }

        this.applyDamage(this.enemy, damage, summon);
        const skillPrefix = chosenSkill.id !== usable[0].id ? `使用「${chosenSkill.name}」，` : '';
        this.addLog(`${summon.icon} ${summon.name} ${skillPrefix}造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 'magic');

        // v0.8.27: 召唤兽冲锋（对全体造成伤害）
        if (this.player.talentEffects?.summonChargeChance && Math.random() < this.player.talentEffects.summonChargeChance) {
            const chargeDmg = Math.floor(summon.attack * (this.player.talentEffects.summonChargeDamage || 1.5));
            this.applyDamage(this.enemy, { amount: chargeDmg, element: 'neutral', isMiss: false, isCrit: false }, summon);
            this.addLog(`💨 ${summon.name} 发动冲锋！追加 ${chargeDmg} 点伤害！`, 'special');
        }

        // v1.5.6: 契约层数机制（contractStack）- 召唤兽攻击时叠加契约
        if (this.player.talentEffects && this.player.talentEffects.contractStack) {
            const te = this.player.talentEffects;
            const maxContract = te.contractMax || 3;
            if (!this.player._contractStacks) this.player._contractStacks = 0;
            this.player._contractStacks = Math.min(this.player._contractStacks + 1, maxContract);
            const dmgBonus = te.contractDamageBonus || 0.05;
            this.addLog(`📜 契约叠加 ${this.player._contractStacks}/${maxContract}（召唤兽伤害+${Math.floor(dmgBonus*100)}%）`, 'buff');
            // v2.3.0: 召唤+治愈组合 - 契约治愈：契约积累时全队回血
            if (te.healAura && this.player.hp < this.player.maxHp) {
                const contractHeal = Math.floor(this.player.maxHp * 0.03);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + contractHeal);
                this.addLog(`💚 契约治愈！恢复 ${contractHeal} 点生命！`, 'heal');
            }
            // 满层兽潮（contractBeastTideOnMax）
            if (this.player._contractStacks >= maxContract && te.contractBeastTideOnMax) {
                const tideCount = te.beastTideCount || 2;
                const tideDamage = te.beastTideDamage || 0.6;
                for (let i = 0; i < tideCount; i++) {
                    if (this.enemy.hp <= 0) break;
                    const tideDmg = Math.floor(summon.attack * tideDamage);
                    this.applyDamage(this.enemy, { amount: tideDmg, element: 'neutral', isMiss: false, isCrit: (i === tideCount - 1 && te.beastTideFinalCrit) || false }, summon);
                }
                this.addLog(`🐾 兽潮爆发！${tideCount}次连击攻击！`, 'special');
                this.player._contractStacks = 0;
            }
            // 满层守护（contractGuardOnMax）
            if (this.player._contractStacks >= maxContract && te.contractGuardOnMax) {
                const guardDuration = te.guardDuration || 2;
                this.addStatusEffect(this.player, {
                    type: 'summon_guard', name: '契约守护',
                    duration: guardDuration,
                    damageAbsorb: te.guardDamageAbsorb || 0.5,
                    taunt: te.guardTaunt || false,
                    invincible: te.guardInvincible || false
                });
                this.addLog(`🛡️ 契约守护！召唤兽为你抵挡伤害！`, 'buff');
                this.player._contractStacks = 0;
            }
        }

        // 附加效果：中毒
        if (chosenSkill.poisonChance && Math.random() < chosenSkill.poisonChance) {
            this.addStatusEffect(this.enemy, {
                name: '中毒',
                type: 'poison',
                duration: chosenSkill.poisonDuration || 3,
                chance: 1.0,
                damagePerTurn: chosenSkill.poisonDamage || 5
            });
            this.addLog(`${this.enemy.name} 中毒了！每回合受到${chosenSkill.poisonDamage || 5}点伤害`, 'debuff');
        }

        // 附加效果：束缚
        if (chosenSkill.bindChance && Math.random() < chosenSkill.bindChance) {
            this.addStatusEffect(this.enemy, {
                name: '束缚',
                type: 'bind',
                duration: chosenSkill.bindDuration || 1,
                chance: 1.0,
                skipTurn: true
            });
            this.addLog(`${this.enemy.name} 被束缚了！`, 'debuff');
        }

        // 附加效果：眩晕
        if (chosenSkill.aoeStunChance && Math.random() < chosenSkill.aoeStunChance) {
            this.addStatusEffect(this.enemy, {
                name: '眩晕',
                type: 'stun',
                duration: 1,
                chance: 1.0
            });
            this.addLog(`${this.enemy.name} 被眩晕了！`, 'debuff');
        }

        // 连击效果
        if (chosenSkill.doubleHitChance && Math.random() < chosenSkill.doubleHitChance) {
            this.addLog(`${summon.icon} ${summon.name} 发动连击！`, 'magic');
            const secondDamage = this.calculateDamage(
                Math.floor(effectiveAttack * 0.7),
                this.enemy.defense,
                1.0, critChance, 0.9,
                'neutral', this.enemy.elements?.[0] || 'neutral', this.enemy, summon
            );
            this.applyDamage(this.enemy, secondDamage, summon);
            this.addLog(`${summon.icon} ${summon.name} 追加造成 ${secondDamage.amount} 点伤害${secondDamage.isCrit ? '（暴击！）' : ''}`, 'magic');
        }
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
        const names = {
            fire: '火系', ice: '冰系', thunder: '雷系', earth: '土系',
            wind: '风系', water: '水系', light: '光系', dark: '暗影系',
            heal: '治愈系', plant: '植物系', summon: '召唤系'
        };
        return names[element] || element;
    },

    enemyTurn() {
        try {
        if (!this.active || this.result) return;

        // v1.8.0: NPC队友行动（在敌人回合前）
        if (this.allies && this.allies.length > 0) {
            this.allyTurn();
            return; // allyTurn结束后会调用enemyTurn
        }

        // 检查眩晕/冻结/麻痹状态，跳过回合
        if (this.isStunned(this.enemy)) {
            const stunEffect = this.enemy.statusEffects.find(e => 
                e.type === 'stun' || e.type === 'frozen' || e.type === 'paralyze' || e.skipTurn === true
            );
            const effectName = stunEffect ? stunEffect.name : '控制';
            this.addLog(`${this.enemy.name} 被${effectName}，无法行动！`, 'system');
            this.endEnemyTurn();
            return;
        }

        // v0.70.0: 精英妖魔回合开始处理
        if (this.enemy.isElite && this.enemy.eliteMechanics) {
            this.enemy.eliteState.turnCount++;
            const em = this.enemy.eliteMechanics;
            const turn = this.enemy.eliteState.turnCount;

            // 再生（伪怖魔）
            if (em.regen_percent && this.enemy.hp > 0 && this.enemy.hp < this.enemy.maxHp) {
                const regenAmount = Math.floor(this.enemy.maxHp * em.regen_percent);
                this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + regenAmount);
                this.addLog(`🌱 ${this.enemy.name}恢复了${regenAmount}点生命！`, 'heal');
            }

            // 蛊惑（蛊惑魔蛛）：每3回合40%概率
            if (em.bewitch_chance && em.bewitch_interval && turn % em.bewitch_interval === 0) {
                if (Math.random() < em.bewitch_chance) {
                    const playerSpirit = this.player.spirit || 30;
                    const resistChance = Math.min(0.5, playerSpirit * 0.01);
                    if (Math.random() > resistChance) {
                        this.addStatusEffect(this.player, {
                            type: 'confusion',
                            name: '混乱',
                            duration: 1,
                            description: '被蛊惑，技能可能打错目标'
                        });
                        this.addLog(`🕷️ ${this.enemy.name}释放蛊惑！你陷入混乱状态！`, 'debuff');
                    } else {
                        this.addLog(`🧠 你的精神力抵抗了蛊惑！`, 'buff');
                    }
                }
            }

            // 植物墙（伪怖魔）：每回合30%概率封锁道具
            if (em.plant_wall_chance && Math.random() < em.plant_wall_chance) {
                this.addStatusEffect(this.player, {
                    type: 'item_lock',
                    name: '植物封锁',
                    duration: 1,
                    description: '被植物墙封锁，无法使用道具'
                });
                this.addLog(`🌿 ${this.enemy.name}生成植物墙！你无法使用道具！`, 'debuff');
            }

            // 投石（禁月石魔）：每3回合
            if (em.rock_throw_interval && turn % em.rock_throw_interval === 0) {
                const rockDmg = Math.floor(this.enemy.attack * 0.8);
                this.player.hp = Math.max(0, this.player.hp - rockDmg);
                this.addLog(`🪨 ${this.enemy.name}投掷巨石！造成${rockDmg}点伤害！`, 'damage');
                this.showDamageNumber('player', rockDmg, 'normal');
                this.addStatusEffect(this.player, {
                    type: 'hit_reduction',
                    name: '目眩',
                    duration: 2,
                    description: '命中率降低20%'
                });
                this.addLog(`💫 你被巨石砸得目眩，命中率降低！`, 'debuff');
            }

            // 燃烧地面（赤凌妖）：每2回合
            if (em.burning_ground_interval && turn % em.burning_ground_interval === 0) {
                this.addStatusEffect(this.player, {
                    type: 'burning_ground',
                    name: '燃烧地面',
                    duration: em.burning_ground_duration || 3,
                    description: '地面燃烧，每回合受到火系伤害',
                    damagePerTurn: Math.floor(this.enemy.attack * 0.3)
                });
                this.addLog(`🔥 ${this.enemy.name}释放烈焰，地面开始燃烧！`, 'element');
            }

            // 狂暴（诅咒畜妖）：HP<30%时攻击+30%
            if (em.berserk_hp_threshold && this.enemy.hp / this.enemy.maxHp < em.berserk_hp_threshold) {
                if (!this.enemy.eliteState.berserkActivated) {
                    this.enemy.eliteState.berserkActivated = true;
                    this.enemy.attack = Math.floor(this.enemy.attack * (1 + (em.berserk_attack_bonus || 0.3)));
                    this.addLog(`💢 ${this.enemy.name}进入狂暴状态！攻击力大幅提升！`, 'warning');
                }
            }
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

        // 狩猎战模式：妖魔血量低时会尝试逃跑
        if (this.battleOptions.mode === 'hunt' && this.enemy.hp / this.enemy.maxHp < 0.3) {
            // 基础逃跑概率30%，速度差每多1点+2%成功率
            const speedDiff = this.enemy.speed - this.player.speed;
            let fleeChance = Math.min(0.8, Math.max(0.1, 0.3 + speedDiff * 0.02));
            
            // 被减速/控制时逃跑成功率降低
            const enemyHasSlow = this.enemy.statusEffects?.some(e => 
                e.type === 'slow' || e.type === 'bind' || e.type === 'stun' || e.type === 'frozen' || e.type === 'paralyze'
            );
            if (enemyHasSlow) {
                fleeChance *= 0.4;  // 被控制时逃跑成功率大幅降低
            }
            
            if (Math.random() < fleeChance) {
                this.addLog(`${this.enemy.name} 见势不妙，转身逃跑了！`, 'system');
                this.result = 'flee';
                this.active = false;
                // 妖魔逃跑，玩家只能得到部分奖励
                this.huntFled = true;
                this.endBattle();
                return;
            } else {
                this.addLog(`${this.enemy.name} 试图逃跑，但被你拦住了！`, 'system');
                // 逃跑失败后，妖魔会更狂暴（攻击+15%）
                if (!this.huntFailed) {
                    this.huntFailed = true;
                    this.enemy.attack = Math.floor(this.enemy.attack * 1.15);
                    this.addLog(`${this.enemy.name} 逃跑失败，变得更加狂暴了！`, 'crit');
                }
            }
        }

        // 敌人AI选择行动
        const action = this.enemyAI();
        
        // 保护：如果AI返回无效行动，默认普通攻击
        if (!action || !action.type) {
            console.warn('[Battle] 敌人AI返回无效行动，使用默认普通攻击');
            this.addLog(`${this.enemy.name} 发动攻击！`, 'attack');
            this.applyDamage(this.player, this.calculateDamage(
                this.enemy.attack,
                this.player.defense * (this.player.isDefending ? 2 : 1),
                1.0,
                0.05,
                0.9,
                'physical',
                null,
                this.player,
                this.enemy
            ), this.enemy);
            this.endEnemyTurn();
            return;
        }

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
                this.player.defense * (this.player.isDefending ? 2 : 1) * (this.summon && this.player.talentEffects?.summonMasterDefBonus ? (1 + this.player.talentEffects.summonMasterDefBonus) : 1),
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

            this.applyDamage(this.player, damage, this.enemy);

            // v2.2.0: 土系天赋 - 受击积累岩力
            if (!damage.isMiss && typeof TalentCombatSystem !== 'undefined' && this.player.talentEffects) {
                const te = this.player.talentEffects;
                if (te.earthEnergyGain) {
                    const reachedMax = TalentCombatSystem.addEnergy('earth', te.earthEnergyGain, te.earthEnergyMax || 10);
                    if (reachedMax && te.earthCounterOnMax) {
                        // 岩力满层触发反击
                        this.addLog(`🪨 岩力已满！触发岩刺反击！`, 'buff');
                        TalentCombatSystem.resetEnergy('earth');
                    }
                    // v2.3.0: 土+暗组合 - 岩刺诅咒：受击时给敌人上诅咒
                    if (te.curseMax) {
                        if (!this.enemy.curseStacks) this.enemy.curseStacks = 0;
                        this.enemy.curseStacks = Math.min(te.curseMax, this.enemy.curseStacks + 1);
                        this.addLog(`🌑 岩刺诅咒！敌人诅咒+1（${this.enemy.curseStacks}/${te.curseMax}）`, 'element');
                    }
                }
            }

            // 天赋：闪避后效果
            if (damage.isMiss && this.player.talentEffects) {
                const te = this.player.talentEffects;
                // v2.2.0: 风系天赋 - 闪避触发疾风状态
                if (te.windStreakOnDodge && typeof TalentCombatSystem !== 'undefined') {
                    TalentCombatSystem.triggerWindStreak(te.windStreakTurns || 1);
                    this.addLog(`💨 疾风！下次攻击连击2次！`, 'buff');
                    // v2.3.0: 火+风组合 - 火焰风暴：闪避后燃点+3
                    if (te.fireEnergyGain && TalentCombatSystem.state) {
                        TalentCombatSystem.addEnergy('fire', 3, te.fireEnergyMax || 10);
                        this.addLog(`🔥 火焰风暴！闪避触发燃点+3！`, 'element');
                    }
                }
                if (te.dodgeCritBuff) {
                    this.player._dodgeCritBuff = te.dodgeCritBuff;
                    this.addLog(`🌪️ 风遁！下次攻击暴击伤害提升！`, 'buff');
                }
                if (te.dodgeCritDamage) {
                    this.player._dodgeCritDamage = te.dodgeCritDamage;
                }
                // 闪避后下次必暴（dodgeNextHitBonus）
                if (te.dodgeNextHitBonus) {
                    this.player._dodgeNextCrit = true;
                    this.addLog(`🌪️ 看破！下次攻击必定暴击！`, 'buff');
                }
                if (te.dodgeHeal) {
                    const healAmount = Math.floor(this.player.maxHp * te.dodgeHeal);
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    this.addLog(`🌪️ 风遁回春！恢复 ${healAmount} 点生命！`, 'heal');
                }
                if (te.dodgeMpRestore) {
                    const mpAmount = Math.floor(this.player.maxHp * te.dodgeMpRestore);
                    this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpAmount);
                    this.addLog(`🌪️ 风遁回蓝！恢复 ${mpAmount} 点MP！`, 'heal');
                }
                // v1.5.5: 闪避反击（dodgeCounter）- 闪避成功后反击
                if (te.dodgeCounter) {
                    const counterDmg = Math.floor(this.player.attack * (te.dodgeCounterDamage || 0.8));
                    const isCrit = te.dodgeCounterCrit ? true : false;
                    this.applyDamage(this.enemy, { amount: counterDmg, element: 'wind', isCrit: isCrit, isMiss: false }, this.player);
                    this.addLog(`🌪️ 闪避反击！造成 ${counterDmg} 点风伤${isCrit ? '（暴击！）' : ''}！`, 'counter');
                    this.showDamageNumber('enemy', counterDmg, isCrit ? 'crit' : 'normal');
                }
            }
            
            // 天赋：攻击命中效果（流血等）
            if (!damage.isMiss && damage.amount > 0) {
                this.processTraitsOnHit(this.enemy, this.player, damage.amount, false);
            }
            // 天赋：低HP时冻结攻击者（lowHpFreezeChance）
            if (!damage.isMiss && this.player.talentEffects && this.player.talentEffects.lowHpFreezeChance) {
                const hpRatio = this.player.hp / this.player.maxHp;
                if (hpRatio < 0.3 && Math.random() < this.player.talentEffects.lowHpFreezeChance) {
                    const alreadyFrozen = this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
                    if (!alreadyFrozen) {
                        this.addStatusEffect(this.enemy, {
                            type: 'freeze', name: '寒冰反制', duration: 1
                        });
                        this.addLog(`❄️ 寒冰反制！${this.enemy.name} 被冰冻了！`, 'element');
                    }
                }
            }

            this.addLog(`${this.enemy.name} 发动攻击，造成 ${damage.amount} 点伤害${damage.isCrit ? '（暴击！）' : ''}${damage.isMiss ? '（未命中！）' : ''}`, 
                damage.isCrit ? 'crit' : 'damage');
            
            // 敌人攻击冲刺动画
            if (typeof UI !== 'undefined' && UI.playAttackAnimation) UI.playAttackAnimation(false);
            
            // 显示浮动伤害数字
            if (!damage.isMiss) {
                const dmgType = damage.isCrit ? 'crit' : 'normal';
                this.showDamageNumber('player', damage.amount, dmgType);
                // 玩家受击动画
                setTimeout(() => {
                    if (typeof UI !== 'undefined' && UI.playHitAnimation) UI.playHitAnimation(true, damage.isCrit);
                }, 150);
            } else {
                // 玩家闪避飘字
                this.showDamageNumber('player', 0, 'dodge');
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
        } catch (e) {
            console.error('[Battle] enemyTurn出错:', e);
            this.addLog(`${this.enemy.name}行动出错: ${e.message}，跳过回合`, 'system');
            // 确保回合能结束
            this.endEnemyTurn();
        }
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

    /**
     * 结束敌人回合
     */
    endEnemyTurn() {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) {
            this._onBattleEndDuringTurn();
            return;
        }

        // 处理状态效果（每回合结束）
        this.tickStatusEffects(this.player, true);
        this.tickStatusEffects(this.enemy, false);

        // 陨石倒计时（每回合-1，到0时落下）
        if (this._meteorCountdown > 0) {
            this._meteorCountdown--;
            if (this._meteorCountdown <= 0) {
                const meteorDmg = Math.floor(this.player.magicPower * (this._meteorDamage || 1.2));
                this.applyDamage(this.enemy, { amount: meteorDmg, element: 'earth', isCrit: false, isMiss: false }, this.player);
                this.addLog(`☄️ 陨石坠落！对 ${this.enemy.name} 造成 ${meteorDmg} 点土系伤害！`, 'element');
                this.showDamageNumber('enemy', meteorDmg, 'crit');
                // 概率眩晕
                if (Math.random() < (this._meteorStunChance || 0.5)) {
                    this.addStatusEffect(this.enemy, {
                        type: 'stun', name: '陨石冲击', duration: 1,
                        icon: '☄️', desc: '被陨石冲击眩晕'
                    }, 0, false);
                    this.addLog(`💫 ${this.enemy.name} 被陨石冲击眩晕！`, 'debuff');
                }
                this._meteorCountdown = 0;
            } else {
                this.addLog(`🪨 陨石还有 ${this._meteorCountdown} 回合落下...`, 'element');
            }
        }

        // MP自然恢复（每回合5%）
        if (this.player.maxMp > 0) {
            const mpRegen = Math.floor(this.player.maxMp * 0.05);
            if (mpRegen > 0 && this.player.mp < this.player.maxMp) {
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen);
            }
        }
        if (this.enemy.maxMp > 0) {
            const mpRegen = Math.floor(this.enemy.maxMp * 0.05);
            if (mpRegen > 0 && this.enemy.mp < this.enemy.maxMp) {
                this.enemy.mp = Math.min(this.enemy.maxMp, this.enemy.mp + mpRegen);
            }
        }
        
        // 天赋：回合结束效果
        this.processTraitsOnTurnEnd(this.enemy, false);
        this.processTraitsOnTurnEnd(this.player, true);

        // v1.6.0: 恐惧消退（每回合恐惧等级-1，成功行动后额外消退）
        const fearEffect = this.player.statusEffects.find(e => e.type === 'fear');
        if (fearEffect) {
            fearEffect.level = Math.max(0, (fearEffect.level || 1) - 1);
            if (fearEffect.level <= 0) {
                this.player.statusEffects = this.player.statusEffects.filter(e => e.type !== 'fear');
                this.addLog(`😤 恐惧消退，你恢复了冷静！`, 'buff');
            } else {
                this.addLog(`😰 恐惧程度：${fearEffect.level}级`, 'debuff');
            }
        }

        // 处理召唤兽持续时间和状态
        if (this.summon) {
            // v0.8.27: 共享回复（sharedHpRegen）：双方每回合回复HP
            if (this.player.talentEffects?.sharedHpRegen) {
                const regenPct = this.player.talentEffects.sharedHpRegen;
                const playerRegen = Math.floor(this.player.maxHp * regenPct);
                const summonRegen = Math.floor(this.summon.maxHp * regenPct);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + playerRegen);
                this.summon.hp = Math.min(this.summon.maxHp, this.summon.hp + summonRegen);
                this.addLog(`🔗 灵魂链接：双方各回复 ${playerRegen} HP！`, 'heal');
            }
            this.summon.remainingDuration--;
            if (this.summon.statusEffects) {
                this.summon.statusEffects = this.summon.statusEffects.filter(effect => {
                    effect.duration--;
                    return effect.duration > 0;
                });
            }
            if (this.summon.remainingDuration <= 0 || this.summon.hp <= 0) {
                // v0.8.27: 召唤兽死亡爆发/治疗
                if (this.summon.hp <= 0) {
                    this.triggerSummonDeath();
                }
                this.addLog(`${this.summon.icon} ${this.summon.name} 消失了`, 'system');
                this.summon = null;
            }
        }

        // 检查战斗是否结束（DOT可能致死）
        if (this.checkBattleEnd()) {
            this._onBattleEndDuringTurn();
            return;
        }

        this.turn++;
        this.player.isDefending = false;

        // 每回合自动回复HP/MP（基于等级和精神力）
        if (this.player.hp > 0) {
            const playerLevel = Player.level || 1;
            const playerSpirit = Player.spirit || 10;
            // HP回复：每回合回复等级*0.5 + 最大HP的0.3%（战斗中回复有限，主要靠技能/药品）
            const hpRegen = Math.max(1, Math.floor(playerLevel * 0.5 + this.player.maxHp * 0.003));
            // MP回复：每回合回复等级*0.5 + 精神力*0.1 + 最大MP的0.5%（普攻也能回MP）
            const mpRegen = Math.max(1, Math.floor(playerLevel * 0.5 + playerSpirit * 0.1 + this.player.maxMp * 0.005));

            // 天赋加成：hpRegen/mpRegen
            let talentHpBonus = 0, talentMpBonus = 0;
            if (typeof Player !== 'undefined' && typeof TalentSystem !== 'undefined') {
                const allTalentEffects = Player.getAllTalentEffects ? Player.getAllTalentEffects() : {};
                if (allTalentEffects.hpRegen) talentHpBonus = allTalentEffects.hpRegen;
                if (allTalentEffects.mpRegen) talentMpBonus = allTalentEffects.mpRegen;
            }

            const finalHpRegen = Math.floor(hpRegen * (1 + talentHpBonus));
            const finalMpRegen = Math.floor(mpRegen * (1 + talentMpBonus));

            if (finalHpRegen > 0 && this.player.hp < this.player.maxHp) {
                const oldHp = this.player.hp;
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + finalHpRegen);
                if (this.player.hp > oldHp) {
                    this.addLog(`恢复了 ${this.player.hp - oldHp} 点HP`, 'heal');
                }
            }
            if (finalMpRegen > 0 && this.player.mp < this.player.maxMp) {
                const oldMp = this.player.mp;
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + finalMpRegen);
                if (this.player.mp > oldMp) {
                    this.addLog(`恢复了 ${this.player.mp - oldMp} 点MP`, 'heal');
                }
            }
        }

        // 天赋光环效果：每回合开始时对敌人造成伤害（火焰光环等）
        if (this.player.talentEffects && this.enemy.hp > 0) {
            const te = this.player.talentEffects;
            // 火焰光环：每回合对敌人造成最大HP百分比伤害
            if (te.fireAura && te.fireAura > 0) {
                const auraDmg = Math.floor(this.enemy.maxHp * te.fireAura);
                if (auraDmg > 0) {
                    this.applyDamage(this.enemy, { amount: auraDmg, element: 'fire', isMiss: false, isCrit: false }, this.player);
                    this.addLog(`🔥 火焰光环灼烧 ${this.enemy.name}，造成 ${auraDmg} 点伤害！`, 'element');
                    this.showDamageNumber('enemy', auraDmg, 'normal');
                }
            }
            // 冰霜光环：每回合减速敌人
            if (te.frostAura && te.frostAura > 0 && this.enemy.speed > 1) {
                const slowAmount = Math.floor(this.enemy.speed * te.frostAura);
                if (slowAmount > 0) {
                    this.enemy.speed = Math.max(1, this.enemy.speed - slowAmount);
                    this.addLog(`❄️ 冰霜光环减速 ${this.enemy.name}！`, 'element');
                }
            }
            // 治疗光环：每回合治疗
            if (te.healAura && te.healAura > 0 && this.player.hp < this.player.maxHp) {
                const auraHeal = Math.floor(this.player.maxHp * te.healAura);
                if (auraHeal > 0) {
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + auraHeal);
                    this.addLog(`✨ 治疗光环恢复 ${auraHeal} 点生命！`, 'heal');
                }
            }

            // v2.2.0: 植物系生长 - 每回合自动生长
            if (te.plantGrowth && this.player.elements && this.player.elements.includes('plant')) {
                if (!this.player.plantGrowthStacks) this.player.plantGrowthStacks = 0;
                this.player.plantGrowthStacks = Math.min(te.plantGrowthMax || 8, this.player.plantGrowthStacks + (te.plantGrowthPerTurn || 2));
                this.addLog(`🌿 植物生长 ${this.player.plantGrowthStacks}/${te.plantGrowthMax || 8}层！植物系技能伤害+${this.player.plantGrowthStacks * 5}%`, 'element');
            }
            // 雷鸣CD减少
            if (this._thunderRoarCd > 0) this._thunderRoarCd--;

            // 大地祝福：每回合HP回复（hpRegen）
            if (te.hpRegen) {
                const regen = Math.floor(this.player.maxHp * te.hpRegen);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + regen);
                this.addLog(`💚 大地祝福恢复 ${regen} 点HP！`, 'heal');
                this.showDamageNumber('player', regen, 'heal');
            }
            // MP回复（mpRegen）：每回合回3%MP
            if (te.mpRegen) {
                const mpRegen = Math.floor(this.player.maxMp * te.mpRegen);
                this.player.mp = Math.min(this.player.maxMp, this.player.mp + mpRegen);
            }
            // CD减少（cooldownReduction）：每回合额外减少技能CD
            if (te.cooldownReduction && this.player.skillCooldowns) {
                for (const sid in this.player.skillCooldowns) {
                    if (this.player.skillCooldowns[sid] > 0) {
                        this.player.skillCooldowns[sid] = Math.max(0, this.player.skillCooldowns[sid] - 1);
                    }
                }
            }
            // 大地祝福：防御叠加（defenseStack/defenseStackMax）
            if (te.defenseStack) {
                if (!this.player._defenseStacks) this.player._defenseStacks = 0;
                this.player._defenseStacks = Math.min(te.defenseStackMax / te.defenseStack, this.player._defenseStacks + 1);
                const defBonus = this.player._defenseStacks * te.defenseStack;
                this.player._defenseStackBonus = defBonus;
                if (this.player._defenseStacks >= te.defenseStackMax / te.defenseStack) {
                    this.addLog(`🪨 大地祝福叠满！防御+${Math.floor(defBonus*100)}%！`, 'buff');
                }
            }
            // 护盾回复（shieldRegen）
            if (te.shieldRegen) {
                const shield = this.player.statusEffects.find(e => e.type === 'shield');
                if (shield) {
                    const regen = Math.floor(this.player.maxHp * te.shieldRegen);
                    shield.value = Math.min(Math.floor(this.player.maxHp * 0.5), shield.value + regen);
                }
            }
            // 地震（earthquakeChance）：30%概率对敌人造成伤害+减速
            if (te.earthquakeChance && Math.random() < te.earthquakeChance) {
                const eqDmg = Math.floor(this.player.attack * (te.earthquakeDamage || 0.2));
                this.applyDamage(this.enemy, { amount: eqDmg, element: 'earth', isCrit: false, isMiss: false }, this.player);
                this.addLog(`🌍 地震！对 ${this.enemy.name} 造成 ${eqDmg} 点土系伤害！`, 'element');
                if (te.earthquakeSlow) {
                    this.addStatusEffect(this.enemy, { type: 'slow', name: '地震减速', duration: 2, speedMod: -te.earthquakeSlow });
                }
            }
            // 海啸（tsunamiChance）：30%概率60%攻击水伤+攻击-20%
            if (te.tsunamiChance && Math.random() < te.tsunamiChance) {
                const tsDmg = Math.floor(this.player.attack * (te.tsunamiDamage || 0.6));
                this.applyDamage(this.enemy, { amount: tsDmg, element: 'water', isCrit: false, isMiss: false }, this.player);
                this.addLog(`🌊 海啸！对 ${this.enemy.name} 造成 ${tsDmg} 点水系伤害！`, 'element');
                if (te.tsunamiAtkDown) {
                    this.addStatusEffect(this.enemy, { type: 'attack_down', name: '海啸削弱', duration: 2, atkMod: -te.tsunamiAtkDown });
                }
            }
            // 滋润持续回复（regen状态）
            const regen = this.player.statusEffects.find(e => e.type === 'regen');
            if (regen) {
                const regenAmount = Math.floor(this.player.maxHp * (regen.regenAmount || 0.05));
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + regenAmount);
                this.addLog(`💧 滋润恢复 ${regenAmount} 点HP！`, 'heal');
                this.showDamageNumber('player', regenAmount, 'heal');
            }
            // 自动治疗（autoHeal）：HP低于50%时自动治疗
            if (te.autoHeal && this.player.hp / this.player.maxHp < 0.5) {
                const healAmount = Math.floor(this.player.maxHp * te.autoHeal);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                this.addLog(`💚 自动治疗！恢复 ${healAmount} 点HP！`, 'heal');
                this.showDamageNumber('player', healAmount, 'heal');
            }

            // 潮汐涨潮：每回合伤害和治疗递增（tideDamageStack/tideDamageMax/tideHealStack/tideHealMax）
            if (te.tideDamageStack) {
                const maxStacks = Math.floor((te.tideDamageMax || 0.3) / te.tideDamageStack);
                this.player.tideStack = Math.min(maxStacks, (this.player.tideStack || 0) + 1);
                const dmgBonus = Math.min(te.tideDamageMax || 0.3, this.player.tideStack * te.tideDamageStack);
                const healBonus = Math.min(te.tideHealMax || 0.18, this.player.tideStack * (te.tideHealStack || 0.03));
                this.player.tideDamageBonus = dmgBonus;
                this.player.tideHealBonus = healBonus;
                if (this.player.tideStack >= maxStacks) {
                    this.addLog(`🌊 潮汐满潮！伤害+${Math.floor(dmgBonus*100)}%，治疗+${Math.floor(healBonus*100)}%！`, 'buff');
                    // 潮汐护盾（tideShield）：满潮时获得护盾
                    if (te.tideShield) {
                        const shieldAmount = Math.floor(this.player.maxHp * te.tideShield);
                        const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                        if (existingShield) {
                            existingShield.value = Math.max(existingShield.value, shieldAmount);
                        } else {
                            this.addStatusEffect(this.player, { type: 'shield', name: '潮汐护盾', value: shieldAmount, duration: te.tideShieldDuration || 3 });
                        }
                        this.addLog(`🌊 潮汐护盾！获得 ${shieldAmount} 点护盾！`, 'defense');
                    }
                    // 潮汐净化（tideCleansing）：满潮时净化1个负面
                    if (te.tideCleansing) {
                        const cleansable = this.player.statusEffects.filter(e =>
                            ['burn', 'freeze', 'paralyze', 'stun', 'slow', 'poison', 'bleed', 'curse', 'blind', 'fear'].includes(e.type) && !e.unpurgeable
                        );
                        if (cleansable.length > 0) {
                            this.player.statusEffects = this.player.statusEffects.filter(e => e !== cleansable[0]);
                            this.addLog(`🌊 潮汐净化了 ${cleansable[0].name}！`, 'buff');
                        }
                    }
                }
            }
            // 紧急回复：低HP时自动回血（支持emergencyCooldown多次触发）
            if (te.emergencyHeal) {
                const threshold = te.emergencyThreshold || 0.2;
                const cooldown = te.emergencyCooldown || 0;
                const canTrigger = cooldown > 0
                    ? (!this.player._emergencyCd || this.player._emergencyCd <= 0)
                    : !this.player._emergencyUsed;
                if (canTrigger && this.player.hp / this.player.maxHp < threshold) {
                    const healAmount = Math.floor(this.player.maxHp * (te.emergencyHealAmount || 0.3));
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                    if (cooldown > 0) {
                        this.player._emergencyCd = cooldown;
                    } else {
                        this.player._emergencyUsed = true;
                    }
                    this.addLog(`💖 紧急回复！恢复 ${healAmount} 点生命！`, 'heal');
                }
                // CD倒计时
                if (this.player._emergencyCd > 0) this.player._emergencyCd--;
            }
            // 低HP回血加成
            if (te.lowHpRegen && this.player.hp / this.player.maxHp < 0.3) {
                const lowHeal = Math.floor(this.player.maxHp * te.lowHpRegen);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + lowHeal);
            }
            // 致命护盾（lethalShield）：低HP时自动获得护盾
            if (te.lethalShield && !this.player._lethalShieldUsed && this.player.hp / this.player.maxHp < (te.lethalShieldThreshold || 0.25)) {
                const shieldAmount = Math.floor(this.player.maxHp * (te.lethalShieldAmount || 0.2));
                const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                if (existingShield) {
                    existingShield.value = Math.max(existingShield.value, shieldAmount);
                } else {
                    this.addStatusEffect(this.player, { type: 'shield', name: '致命护盾', value: shieldAmount, duration: 3 });
                }
                this.player._lethalShieldUsed = true;
                this.addLog(`🛡️ 致命护盾！获得 ${shieldAmount} 点护盾！`, 'defense');
            }
            // 冰霜新星：每隔N回合造成冰伤+减速
            if (te.frostNova && this.enemy.hp > 0) {
                this._frostNovaTimer = (this._frostNovaTimer || 0) + 1;
                const interval = te.frostNovaInterval || 3;
                if (this._frostNovaTimer >= interval) {
                    this._frostNovaTimer = 0;
                    const novaDmg = Math.floor(this.player.attack * (te.frostNovaDamage || 0.3));
                    this.applyDamage(this.enemy, { amount: novaDmg, element: 'ice', isMiss: false, isCrit: false }, this.player);
                    this.addStatusEffect(this.enemy, { type: 'slow', name: '冰霜新星', duration: 2, speedMod: te.frostNovaSlow || 0.3 });
                    this.addLog(`❄️ 冰霜新星！造成 ${novaDmg} 点冰伤并减速！`, 'element');
                    this.showDamageNumber('enemy', novaDmg, 'normal');
                }
            }
            // v1.5.4: 自动冻结（autoFreezeChance）- 每回合开始有概率冻结敌人
            if (te.autoFreezeChance && this.enemy.hp > 0 && !this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen')) {
                if (Math.random() < te.autoFreezeChance) {
                    this.addStatusEffect(this.enemy, { type: 'freeze', name: '寒冰禁锢', duration: te.freezeDuration || 1 });
                    this.addLog(`❄️ 寒冰禁锢！${this.enemy.name} 被自动冻结！`, 'element');
                }
            }
            // v1.5.4: 低血量冻结（lowHpFreezeChance）- 敌人HP低于30%时概率冻结
            if (te.lowHpFreezeChance && this.enemy.hp > 0 && this.enemy.hp / this.enemy.maxHp < 0.3) {
                if (!this.enemy.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen') && Math.random() < te.lowHpFreezeChance) {
                    this.addStatusEffect(this.enemy, { type: 'freeze', name: '永冻', duration: 2 });
                    this.addLog(`❄️ 永冻！${this.enemy.name} 血量过低被冻结！`, 'element');
                }
            }
        }

        // 光环/回合开始伤害可能击杀敌人
        if (this.checkBattleEnd()) {
            this._onBattleEndDuringTurn();
            return;
        }

        // 玩家被眩晕/冻结/麻痹，自动跳过回合
        if (this.isStunned(this.player)) {
            const stunEffect = this.player.statusEffects.find(e => 
                e.type === 'stun' || e.type === 'frozen' || e.type === 'paralyze' || e.skipTurn === true
            );
            const effectName = stunEffect ? stunEffect.name : '控制';
            this.addLog(`你被${effectName}，无法行动！`, 'system');
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
        this.isProcessingAction = false; // 重置行动锁，允许下一次行动

        // v2.2.0: 天赋战斗状态回合更新（形态切换、冷却减少等）
        if (typeof TalentCombatSystem !== 'undefined') {
            TalentCombatSystem.onTurnStart();
        }

        // 更新UI
        if (typeof UI !== 'undefined') {
            UI.updateBattleScreen();
        }
        
        // 自动战斗
        if (this.autoBattle && this.player.hp > 0) {
            setTimeout(() => this.autoPlayerTurn(), this.getDelay(600));
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
        
        // 应用攻击者的增益效果
        if (attacker) {
            const attackerMods = this.getStatusModifiers(attacker);
            hitRate += attackerMods.hitRateMod;
            critRate += attackerMods.critRateMod;
        }

        // v2.2.0: 水系潮汐形态 - 涨潮输出+30%，退潮输出-20%
        if (element === 'water' && attacker === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
            const waterForm = TalentCombatSystem.getWaterForm();
            if (waterForm === 'tide') {
                attack = Math.floor(attack * 1.30);
            } else if (waterForm === 'ebb') {
                attack = Math.floor(attack * 0.80);
            }
        }

        // v2.2.0: 光系形态 - 圣光形态输出+20%，圣盾形态输出-10%
        if (element === 'light' && attacker === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
            const lightForm = TalentCombatSystem.getLightForm();
            if (lightForm === 'holy') {
                attack = Math.floor(attack * 1.20);
                // v2.3.0: 水+光组合 - 形态协同：涨潮时光系额外+10%
                if (TalentCombatSystem.getWaterForm() === 'tide' && this.player.talentEffects?.waterFormAuto) {
                    attack = Math.floor(attack * 1.10);
                }
            } else if (lightForm === 'shield') {
                attack = Math.floor(attack * 0.90);
            }
        }

        // v2.2.0: 植物系生长 - 每层+5%伤害
        if (element === 'plant' && attacker === this.player && this.player.plantGrowthStacks) {
            attack = Math.floor(attack * (1 + this.player.plantGrowthStacks * 0.05));
        }

        // v2.4.0: 火+冰组合 - 融化：火系对冻结目标伤害+50%
        if (element === 'fire' && attacker === this.player && target && target.statusEffects) {
            const isFrozen = target.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            const hasIceTalent = this.player.talentEffects && (this.player.talentEffects.frostStackMax || this.player.talentEffects.freezeChance);
            if (isFrozen && hasIceTalent) {
                attack = Math.floor(attack * 1.50);
            }
        }

        // v2.4.0: 雷+水组合 - 感电：雷系对潮湿目标伤害+30%
        if (element === 'thunder' && attacker === this.player && target && target.statusEffects) {
            const isWet = target.statusEffects.some(e => e.type === 'wet' || e.type === 'soaked' || e.type === 'water');
            const hasWaterTalent = this.player.talentEffects && this.player.talentEffects.waterFormAuto;
            if (isWet && hasWaterTalent) {
                attack = Math.floor(attack * 1.30);
            }
        }

        // v2.4.0: 冰+风组合 - 暴风雪：疾风状态下冰系伤害+30%
        if (element === 'ice' && attacker === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
            if (TalentCombatSystem.hasWindStreak() && this.player.talentEffects?.windStreakOnDodge) {
                attack = Math.floor(attack * 1.30);
            }
        }

        // 命中判定（考虑目标闪避修正）
        let evasion = 0;
        if (target) {
            const mods = this.getStatusModifiers(target);
            evasion = mods.evasionMod;

            // 麻痹状态不可闪避（paralyzeNoDodge）
            const isParalyzed = target.statusEffects && target.statusEffects.some(e => e.type === 'paralyze');
            if (isParalyzed && attacker && attacker.talentEffects && attacker.talentEffects.paralyzeNoDodge) {
                evasion = 0;
            }
            // 无视闪避（ignoreDodgeChance）
            if (attacker && attacker.talentEffects && attacker.talentEffects.ignoreDodgeChance) {
                if (Math.random() < attacker.talentEffects.ignoreDodgeChance) evasion = 0;
            }
            // 低HP闪避加成（lowHpDodgeBonus）
            if (target === this.player && target.talentEffects && target.talentEffects.lowHpDodgeBonus) {
                if (target.hp / target.maxHp < 0.3) evasion += target.talentEffects.lowHpDodgeBonus;
            }
            // 免疫致盲（blindImmunity）：致盲状态不影响命中
            if (attacker === this.player && attacker.talentEffects && attacker.talentEffects.blindImmunity) {
                // 清除致盲的命中惩罚
                if (attackerMods && attackerMods.hitMod) attackerMods.hitMod = 0;
            }

            // 下次必定闪避
            if (mods.nextDodgeGuaranteed) {
                result.isMiss = true;
                // 消耗掉必定闪避效果
                if (target.buffs) {
                    target.buffs = target.buffs.filter(b => b.type !== 'next_dodge_guaranteed');
                }
                return result;
            }
            
            // 天赋：闪避加成
            if (target.traitBonuses && target.traitBonuses.dodgeBonus) {
                evasion += target.traitBonuses.dodgeBonus;
            }
            // 玩家天赋闪避
            if (target === this.player && target.dodgeBonus) {
                evasion += target.dodgeBonus;
            }
        }
        if (Math.random() > (hitRate - evasion)) {
            result.isMiss = true;
            return result;
        }

        // 应用目标的防御修饰符（如恐惧尖叫降低防御、buff提升防御等）
        if (target) {
            const targetMods = this.getStatusModifiers(target);
            defense = Math.max(0, defense + targetMods.defenseMod);
            // 大地祝福防御叠加
            if (target._defenseStackBonus) defense *= (1 + target._defenseStackBonus);
            // v2.2.0: 光系圣盾形态 - 防御+30%
            if (target === this.player && typeof TalentCombatSystem !== 'undefined' && TalentCombatSystem.state) {
                if (TalentCombatSystem.getLightForm() === 'shield') {
                    defense *= 1.30;
                }
            }
            // 护盾时防御加成（shieldDefenseBonus）
            if (target === this.player && target.talentEffects && target.talentEffects.shieldDefenseBonus) {
                const hasShield = target.statusEffects.some(e => e.type === 'shield');
                if (hasShield) defense *= (1 + target.talentEffects.shieldDefenseBonus);
            }
        }

        // 基础伤害（防御系数0.5，让防御有意义但不导致完全免伤）
        let damage = Math.max(1, (attack - defense * 0.5) * multiplier);

        // 天赋：元素穿透 - 忽略部分防御
        if (attacker && attacker.talentEffects) {
            const te = attacker.talentEffects;
            let pen = 0;
            if (element) {
                const penKey = element + 'Penetration';
                if (te[penKey]) pen = te[penKey];
            }
            if (te.elementPenetration) pen = Math.max(pen, te.elementPenetration);
            if (pen > 0) {
                const ignoredDef = defense * pen;
                damage += ignoredDef * 0.5;
            }
        }

        // 天赋：低HP伤害加成（炎怒/暗之力）
        if (attacker && attacker.talentEffects) {
            const te = attacker.talentEffects;
            const enrage = te.enrageDamage || te.lowHpDamageBonus;
            if (enrage) {
                const threshold = te.enrageThreshold || 0.3;
                const hpPercent = attacker.hp / attacker.maxHp;
                if (hpPercent < threshold) {
                    damage *= (1 + enrage);
                }
            }
            // 低HP伤害递增（lowHpDamageScaling：HP越低伤害越高，每损失1%HP+X%伤害）
            if (te.lowHpDamageScaling) {
                const hpPercent = attacker.hp / attacker.maxHp;
                const missing = 1 - hpPercent;
                damage *= (1 + missing * te.lowHpDamageScaling);
            }
            // 对有debuff的敌人伤害提升（debuffedDamageBonus）
            if (te.debuffedDamageBonus && target && target.statusEffects) {
                const hasDebuff = target.statusEffects.some(e =>
                    ['burn', 'freeze', 'frozen', 'stun', 'paralyze', 'slow', 'curse', 'poison', 'bleed', 'blind', 'fear', 'shock', 'electrified', 'wet', 'mud'].includes(e.type)
                );
                if (hasDebuff) damage *= (1 + te.debuffedDamageBonus);
            }
            // 潮汐涨潮伤害加成
            if (attacker.tideDamageBonus) {
                damage *= (1 + attacker.tideDamageBonus);
            }
            // 对眩晕/冻结目标增伤
            if (te.stunnedDamageBonus && target && target.statusEffects) {
                const isStunned = target.statusEffects.some(e => e.type === 'stun' || e.type === 'freeze');
                if (isStunned) {
                    damage *= (1 + te.stunnedDamageBonus);
                }
            }
            // 防御转伤害（土系大地之怒）
            if (te.defenseToDamage && target === this.enemy) {
                const bonusDmg = this.player.defense * te.defenseToDamage;
                damage += bonusDmg;
            }
            // 光系审判：对暗系敌人概率造成真实伤害
            if (te.judgmentChance && target && target.element === 'dark') {
                if (Math.random() < te.judgmentChance) {
                    const trueDmg = Math.floor(target.maxHp * (te.judgmentTrueDamage || 0.15));
                    damage += trueDmg;
                    this.addLog(`✨ 圣光审判！对暗系造成 ${trueDmg} 点真实伤害！`, 'element');
                }
            }
        }

        // 天赋：暴击伤害加成
        if (attacker && attacker.talentEffects && attacker.talentEffects.critDamageBonus) {
            // 在暴击判定后使用
        }

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

        // 光系对暗系伤害加成（darkDamageBonus）
        if (attacker && attacker.talentEffects && attacker.talentEffects.darkDamageBonus) {
            const targetIsDark = targetElement === 'dark' || (target.element === 'dark');
            if (targetIsDark) damage *= (1 + attacker.talentEffects.darkDamageBonus);
        }
        // 圣光审判（judgmentChance）：30%对暗系造成15%最大HP真实伤害
        if (attacker && attacker.talentEffects && attacker.talentEffects.judgmentChance && target === this.enemy) {
            const targetIsDark = targetElement === 'dark' || target.element === 'dark';
            if (targetIsDark && Math.random() < attacker.talentEffects.judgmentChance) {
                const trueDmg = Math.floor(target.maxHp * (attacker.talentEffects.judgmentDamage || 0.15));
                damage += trueDmg;
                this.addLog(`✨ 圣光审判！额外造成 ${trueDmg} 点真实伤害！`, 'crit');
            }
        }
        
        // 妖魔特定元素弱点/抗性（如妖藤怕火抗雷）
        if (target && element) {
            const weaknessKey = element + 'Weakness';
            const resistanceKey = element + 'Resistance';
            if (target[weaknessKey]) {
                damage *= target[weaknessKey];
                result.elementEffect = 'super';
            }
            if (target[resistanceKey]) {
                damage *= target[resistanceKey];
                result.elementEffect = 'weak';
            }
        }
        
        // 元素反应计算（基于目标状态）
        if (element && target && target.statusEffects) {
            const hasWet = target.statusEffects.some(e => e.type === 'wet');
            const hasFreeze = target.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            const hasBurn = target.statusEffects.some(e => e.type === 'burn');
            const hasElectro = target.statusEffects.some(e => e.type === 'electrified' || e.type === 'paralyze');
            const hasShock = target.statusEffects.find(e => e.type === 'shock');

            // 感电状态：雷伤+30%（或天赋指定值）
            if (element === 'thunder' && hasShock) {
                damage *= (1 + (hasShock.thunderDamageBonus || 0.3));
            }

            // v1.5.4: 湿润状态：水系伤害加成（wetDamageBonus）
            if (element === 'water' && hasWet) {
                const wetEffect = target.statusEffects.find(e => e.type === 'wet');
                const wetBonus = wetEffect ? (wetEffect.waterDamageBonus || 0.1) : 0.1;
                damage *= (1 + wetBonus);
            }

            // v1.5.5: 光系对debuff目标伤害加成（debuffedDamageBonus）
            if (element === 'light' && attacker && attacker.talentEffects && attacker.talentEffects.debuffedDamageBonus) {
                const hasDebuff = target.statusEffects.some(e => ['burn', 'frozen', 'paralyze', 'stun', 'slow', 'poison', 'curse', 'wet', 'shock', 'bind', 'bleed'].includes(e.type));
                if (hasDebuff) {
                    damage *= (1 + attacker.talentEffects.debuffedDamageBonus);
                }
            }

            // 麻痹伤害加成（paralyzeDamage：麻痹时受伤+8%）
            if (attacker && attacker.talentEffects && attacker.talentEffects.paralyzeDamage) {
                const isParalyzed = target.statusEffects.some(e => e.type === 'paralyze');
                if (isParalyzed) damage *= (1 + attacker.talentEffects.paralyzeDamage);
            }
            // v1.5.4: 麻痹目标伤害加成（paralyzeDamageBonus）- 攻击麻痹目标时伤害提升
            if (attacker && attacker.talentEffects && attacker.talentEffects.paralyzeDamageBonus) {
                const isParalyzed = target.statusEffects.some(e => e.type === 'paralyze');
                if (isParalyzed) damage *= (1 + attacker.talentEffects.paralyzeDamageBonus);
            }
            // 飓风卷起受伤加成
            const hurricane = target.statusEffects.find(e => e.type === 'stun' && e.damageTaken);
            if (hurricane) damage *= (1 + hurricane.damageTaken);
            
            // 火 + 水 = 蒸发
            if (element === 'fire' && hasWet) {
                damage *= 1.3;
                result.elementReaction = 'vaporize';
            }
            // 火 + 冰 = 融化（原著设定：冻结中受火系伤害×2）
            else if (element === 'fire' && hasFreeze) {
                damage *= 2.0;
                result.elementReaction = 'melt';
            }
            // 火 + 雷 = 超载
            else if (element === 'fire' && hasElectro) {
                damage *= 1.25;
                result.elementReaction = 'overload';
            }
            // 火 + 风 = 扩散火
            else if (element === 'fire' && target.statusEffects.some(e => e.type === 'wind')) {
                damage *= 1.15;
                result.elementReaction = 'swirl_fire';
            }
            // 雷 + 水 = 感电
            else if (element === 'thunder' && hasWet) {
                damage *= 1.2;
                result.elementReaction = 'electro';
            }
            // 雷 + 冰 = 超导
            else if (element === 'thunder' && hasFreeze) {
                damage *= 1.15;
                result.elementReaction = 'superconduct';
            }
            // 冰 + 水 = 冻结
            else if (element === 'ice' && hasWet) {
                damage *= 1.2;
                result.elementReaction = 'freeze';
            }
            // 土 + 水 = 泥浆
            else if (element === 'earth' && hasWet) {
                damage *= 1.1;
                result.elementReaction = 'mud';
            }
            // 土 + 火/冰/雷 = 结晶（产生护盾）
            else if (element === 'earth' && (hasBurn || hasFreeze || hasElectro)) {
                damage *= 1.1;
                result.elementReaction = 'crystallize';
            }
            // 风 + 水 = 扩散水
            else if (element === 'wind' && hasWet) {
                damage *= 1.15;
                result.elementReaction = 'swirl_water';
            }
            // 风 + 雷 = 扩散雷
            else if (element === 'wind' && hasElectro) {
                damage *= 1.15;
                result.elementReaction = 'swirl_thunder';
            }
            // 风 + 冰 = 扩散冰
            else if (element === 'wind' && hasFreeze) {
                damage *= 1.15;
                result.elementReaction = 'swirl_ice';
            }
            // 物理 + 冰 = 碎冰（破冰伤害）
            else if (element === 'physical' && hasFreeze) {
                damage *= 1.3;
                result.elementReaction = 'shatter';
            }

            // 燃烧状态：所有伤害+30%（火焰让敌人更脆弱）
            if (hasBurn) {
                damage *= 1.3;
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
            if (element === 'dark') damage *= (mods.darkDamageMod || 1);
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

        // v0.38.0: 玩家受伤减免
        if (target === this.player) {
            // 新手保护：玩家Lv≤5时，受到的伤害-20%
            if (typeof Player !== 'undefined' && Player.level <= 5) {
                damage *= 0.8;
            }
            // 残局减伤：敌人HP<30%时，敌人伤害-15%（接近胜利时不那么惩罚）
            if (attacker === this.enemy && this.enemy.hp / this.enemy.maxHp < 0.3) {
                damage *= 0.85;
            }
        }

        // 天赋：对冻结目标必暴击+增伤
        let frozenCritGuaranteed = false;
        if (attacker && attacker.talentEffects && target && target.statusEffects) {
            const isFrozen = target.statusEffects.some(e => e.type === 'freeze' || e.type === 'frozen');
            if (isFrozen) {
                if (attacker.talentEffects.frozenCritGuaranteed) frozenCritGuaranteed = true;
                if (attacker.talentEffects.frozenIceDamageBonus && (element === 'ice' || !element)) {
                    damage *= (1 + attacker.talentEffects.frozenIceDamageBonus);
                }
                if (attacker.talentEffects.frozenDamageTaken) {
                    damage *= (1 + attacker.talentEffects.frozenDamageTaken);
                }
            }
        }

        // 天赋：雷系蓄电满层暴击加成
        let chargeCritBonus = 0;
        let chargeCritDamageBonus = 0;
        if (attacker && attacker.chargeStack && attacker.talentEffects && attacker.talentEffects.chargeMax) {
            if (attacker.chargeStack >= attacker.talentEffects.chargeMax) {
                chargeCritBonus = attacker.talentEffects.fullChargeCrit === true ? 0.3 : (attacker.talentEffects.fullChargeCrit || 0.3);
                chargeCritDamageBonus = attacker.talentEffects.fullChargeDamage === true ? 1.0 : (attacker.talentEffects.fullChargeDamage || 0.5);
            }
        }

        // 天赋：风魔连击临时暴击加成
        let windDemonCritBonus = 0;
        if (attacker && attacker.comboCount && attacker.talentEffects && attacker.talentEffects.attackSpeedStack) {
            windDemonCritBonus = attacker.comboCount * (attacker.talentEffects.hitCritStack || 0.03);
        }

        // 麻痹状态：暴击率+20%（敌人麻痹时动作迟缓，更容易被击中要害）
        if (target && target.statusEffects && target.statusEffects.some(e => e.type === 'paralyze' || e.type === 'electrified')) {
            critRate += 0.2;
        }

        // 暴击判定
        const targetHasCritImmunity = target && target.talentEffects && target.talentEffects.critImmunity;
        const attackerGuaranteedCrit = attacker && attacker.talentEffects && attacker.talentEffects.guaranteedCrit;
        // 闪避后下次必暴
        const dodgeNextCrit = attacker && attacker._dodgeNextCrit;
        // 潜行暴击加成
        let stealthCritBonus = 0;
        if (attacker === this.player && attacker.stealthActive && attacker.talentEffects && attacker.talentEffects.stealthCritBonus) {
            stealthCritBonus = attacker.talentEffects.stealthCritBonus;
        }
        if (!targetHasCritImmunity && (attackerGuaranteedCrit || dodgeNextCrit || frozenCritGuaranteed || Math.random() < critRate + chargeCritBonus + windDemonCritBonus + stealthCritBonus)) {
            result.isCrit = true;
            // 消耗必暴标记
            if (dodgeNextCrit) attacker._dodgeNextCrit = false;
            let critMult = 1.5 + Math.random() * 0.5; // 1.5-2.0倍暴击
            // 天赋：暴击伤害加成
            if (attacker && attacker.talentEffects) {
                const cd = attacker.talentEffects.critDamageBonus || attacker.talentEffects.critDamage;
                if (cd) critMult += cd;
                // 蓄电满层暴伤加成
                if (chargeCritDamageBonus) critMult += chargeCritDamageBonus;
                // 暴击穿防：暴击时忽略部分防御
                if (attacker.talentEffects.critArmorPenetration) {
                    const pen = attacker.talentEffects.critArmorPenetration;
                    damage += defense * pen * 0.5;
                }
                // 风遁：闪避后暴击伤害加成
                if (attacker._dodgeCritBuff) {
                    critMult += attacker._dodgeCritBuff;
                    attacker._dodgeCritBuff = null;
                }
                if (attacker._dodgeCritDamage) {
                    critMult += attacker._dodgeCritDamage;
                    attacker._dodgeCritDamage = null;
                }
            }
            damage *= critMult;
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
    applyDamage(target, damage, attacker) {
        let amount = damage.amount;
        const te = this.player.talentEffects;

        // v1.5.1: 真实伤害快速通道 - 跳过所有减伤，直接扣血（燃烧真实伤害等）
        if (damage.trueDamage) {
            target.hp = Math.max(0, target.hp - amount);
            if (amount > 0) {
                this.showDamageNumber(target === this.player ? 'player' : 'enemy', amount, damage.isCrit ? 'crit' : 'normal');
            }
            return;
        }

        // 玩家天赋伤害减免
        if (target === this.player && target.damageReduction) {
            amount = Math.floor(amount * (1 - target.damageReduction));
        }
        // 滋润减伤（regenDamageReduction）
        if (target === this.player && target.talentEffects && target.talentEffects.regenDamageReduction) {
            const hasRegen = target.statusEffects.some(e => e.type === 'regen');
            if (hasRegen) {
                amount = Math.floor(amount * (1 - target.talentEffects.regenDamageReduction));
            }
        }
        // v0.70.0: 精英妖魔减伤和弱点处理
        if (target === this.enemy && target.isElite && target.eliteMechanics) {
            const em = target.eliteMechanics;
            // 物理减伤（三眼魔狼钢铁身躯）
            if (em.physical_reduction && (!damage.element || damage.element === 'physical')) {
                amount = Math.floor(amount * (1 - em.physical_reduction));
            }
            // 石肤减伤（禁月石魔）
            if (em.stone_skin_reduction) {
                amount = Math.floor(amount * (1 - em.stone_skin_reduction));
            }
            // 第一次伤害减伤（蛊惑魔蛛甲壳）
            if (em.shell_reduction_first && !target.eliteState.firstHitTaken) {
                amount = Math.floor(amount * (1 - em.shell_reduction_first));
                target.eliteState.firstHitTaken = true;
                this.addLog(`🛡️ ${target.name}的甲壳抵挡了部分伤害！`, 'system');
            }
            // 弱点伤害加成
            if (target.weakness && damage.element && target.weakness.includes(damage.element)) {
                const weaknessMult = em.fire_weakness_multiplier || em.light_weakness_multiplier || em.ice_weakness_multiplier || em.earth_weakness_multiplier || em.thunder_weakness_multiplier || em.water_weakness_multiplier || 1.5;
                amount = Math.floor(amount * weaknessMult);
                this.addLog(`💥 弱点命中！${damage.element}系造成额外伤害！`, 'element');
            }
            // 烈焰护体反弹（赤凌妖）
            if (em.flame_aura_reflect && attacker === this.player && amount > 0) {
                const reflectDmg = Math.floor(amount * em.flame_aura_reflect);
                if (reflectDmg > 0) {
                    this.player.hp = Math.max(0, this.player.hp - reflectDmg);
                    this.addLog(`🔥 ${target.name}的烈焰护体反弹了${reflectDmg}点伤害！`, 'element');
                    this.showDamageNumber('player', reflectDmg, 'normal');
                }
            }
        }

        // v0.8.27: 伤害共享（damageShare）：玩家受伤害时部分转移给召唤兽
        if (target === this.player && target.talentEffects && target.talentEffects.damageShare && this.summon && this.summon.hp > 0) {
            const te = target.talentEffects;
            const shareRatio = te.damageShare;
            const transferDmg = Math.floor(amount * shareRatio);
            if (transferDmg > 0) {
                amount -= transferDmg;
                this.summon.hp = Math.max(0, this.summon.hp - transferDmg);
                this.addLog(`🔗 灵魂链接：${this.summon.name} 分担了 ${transferDmg} 点伤害！`, 'buff');
                if (this.summon.hp <= 0) {
                    this.triggerSummonDeath();
                }
            }
        }

        // 玩家灵种元素抗性（小说第134章：灵火改变体质，对火焰有抗性）
        if (target === this.player && damage.element && typeof Player !== 'undefined') {
            const resistanceKey = damage.element + 'Resistance';
            const immunityKey = damage.element + 'Immunity';
            // 灵种抗性
            const seedEffects = Player.getElementSpiritSeedEffects(damage.element);
            if (seedEffects && seedEffects[resistanceKey]) {
                const resist = seedEffects[resistanceKey];
                const originalAmount = amount;
                amount = Math.floor(amount * (1 - resist));
                if (amount < originalAmount) {
                    this.addLog(`🔥 灵种体质减免了 ${originalAmount - amount} 点伤害！`, 'buff');
                }
            }
            // 天赋元素抗性
            if (this.player.talentEffects && this.player.talentEffects[resistanceKey]) {
                const resist = this.player.talentEffects[resistanceKey];
                const originalAmount = amount;
                amount = Math.floor(amount * (1 - resist));
                if (amount < originalAmount) {
                    this.addLog(`✨ 天赋抗性减免了 ${originalAmount - amount} 点伤害！`, 'buff');
                }
            }
            // 天赋元素免疫
            if (this.player.talentEffects && this.player.talentEffects[immunityKey]) {
                amount = 0;
                this.addLog(`✨ 元素免疫！伤害无效！`, 'buff');
            }
            // 冰吸收：冰伤回血
            if (damage.element === 'ice' && this.player.talentEffects && this.player.talentEffects.iceAbsorb) {
                const absorb = this.player.talentEffects.iceAbsorb;
                const healAmount = Math.floor(amount * absorb);
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
                this.addLog(`❄️ 冰吸收！恢复 ${healAmount} 点生命！`, 'heal');
            }
        }
        
        // 雷穿水盾：雷系技能可穿透水系护盾（小说第133章）
        const isThunder = damage.element === 'thunder';
        
        // 护盾存在时防御加成（shieldDefenseBonus）
        const hasShield = target.statusEffects.some(e => e.type === 'shield' && e.value > 0);
        if (hasShield && target === this.player && te?.shieldDefenseBonus) {
            amount = Math.floor(amount * (1 - te.shieldDefenseBonus));
        }

        // 护盾吸收
        const shield = target.statusEffects.find(e => e.type === 'shield');
        // v1.5.4: pierceShield无视护盾（破冰等）
        if (shield && shield.value > 0 && !damage.pierceShield) {
            // 检查是否是水盾
            const isWaterShield = shield.name && (shield.name.includes('水') || shield.name.includes('water'));
            
            if (isThunder && isWaterShield) {
                // 雷穿水盾：忽略水盾
                const targetName = target === this.player ? '你' : this.enemy.name;
                this.addLog(`⚡ 雷系技能穿透了 ${targetName} 的水盾！`, 'element');
                // 直接破掉水盾
                target.statusEffects = target.statusEffects.filter(e => e.type !== 'shield');
            } else {
                const absorbed = Math.min(shield.value, amount);
                shield.value -= absorbed;
                amount -= absorbed;
                if (absorbed > 0) {
                    const targetName = target === this.player ? '你' : this.enemy.name;
                    this.addLog(`${targetName} 的护盾吸收了 ${absorbed} 点伤害`, 'buff');
                    // 护盾反射（shieldReflect）
                    if (target === this.player && te.shieldReflect && attacker && attacker.hp > 0) {
                        const reflectDmg = Math.floor(absorbed * te.shieldReflect);
                        attacker.hp = Math.max(0, attacker.hp - reflectDmg);
                        this.addLog(`🔮 护盾反射 ${reflectDmg} 点伤害！`, 'counter');
                    }
                }
                if (shield.value <= 0) {
                    target.statusEffects = target.statusEffects.filter(e => e.type !== 'shield');
                    // 护盾破碎反伤（shieldBreakDamage）
                    if (target === this.player && te.shieldBreakDamage && attacker && attacker.hp > 0) {
                        const breakDmg = Math.floor(this.player.maxHp * te.shieldBreakDamage * 0.1);
                        attacker.hp = Math.max(0, attacker.hp - breakDmg);
                        this.addLog(`💥 护盾破碎！反弹 ${breakDmg} 点伤害！`, 'counter');
                    }
                }
            }
        }

        // 无敌状态（圣盾）：不受伤害
        if (target.statusEffects.some(e => e.type === 'invulnerable')) {
            amount = 0;
            const targetName = target === this.player ? '你' : this.enemy.name;
            this.addLog(`✨ ${targetName} 在圣盾庇护下，伤害无效！`, 'defense');
        }

        target.hp = Math.max(0, target.hp - amount);

        // 天赋：雷系斩杀 - 敌人HP低于阈值时概率直接击杀
        if (target === this.enemy && target.hp > 0 && attacker === this.player && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.thunderExecute) {
                const threshold = te.executeThreshold || 0.2;
                const chance = te.executeChance || 0.2;
                if (target.hp / target.maxHp < threshold && Math.random() < chance) {
                    target.hp = 0;
                    this.addLog(`⚡ 雷劫！${this.enemy.name} 被天雷斩杀！`, 'crit');
                    this.showDamageNumber('enemy', 999, 'crit');
                }
            }
        }

        // 天赋免死：HP归零时保留HP（神圣庇护/大地守护/暗影化身）
        if (target.hp <= 0 && target === this.player && target.talentEffects) {
            const te = target.talentEffects;
            if ((te.divineProtection || te.autoRevive) && !target._deathSaveUsed) {
                target._deathSaveUsed = true;
                const saveHp = Math.floor(target.maxHp * (te.autoReviveHp || 0.3));
                target.hp = saveHp;
                this.addLog(`💫 免死！恢复 ${saveHp} 点生命！`, 'heal');
                target.statusEffects = target.statusEffects.filter(e =>
                    e.type === 'shield' || e.type === 'attack_up' || e.type === 'defense_up'
                );
            }
            // 复活之光/生命源泉：更强力的复活，恢复更多HP，净化负面
            if (te.revive && !target.reviveUsed) {
                target.reviveUsed = true;
                const reviveHp = Math.floor(target.maxHp * (te.reviveHp || 0.3));
                target.hp = reviveHp;
                // 净化所有负面状态
                target.statusEffects = target.statusEffects.filter(e =>
                    ['shield', 'attack_up', 'defense_up', 'speed_up', 'regen'].includes(e.type)
                );
                this.addLog(`✨ 复活之光！恢复 ${reviveHp} 点生命，净化所有负面状态！`, 'heal');
                // 神圣庇护（protectionDuration）：复活后短暂无敌
                if (te.protectionDuration) {
                    this.addStatusEffect(target, {
                        type: 'invulnerable', name: '神圣庇护', duration: te.protectionDuration
                    });
                    this.addLog(`✨ 神圣庇护！${te.protectionDuration}回合内不受伤害！`, 'buff');
                }
            }
        }

        // 冰甲反伤：近战攻击有几率冰冻攻击者
        if (amount > 0 && attacker) {
            const iceArmor = target.statusEffects?.find(e => e.type === 'ice_thorns');
            if (iceArmor && Math.random() < 0.3) {
                const freezeEffect = { name: '冰冻', type: 'freeze', duration: 1, chance: 1 };
                this.applyStatusEffects(attacker, [freezeEffect], target === this.enemy);
                const attackerName = attacker === this.player ? '你' : this.enemy.name;
                this.addLog(`❄️ ${attackerName} 被冰甲冻住了！`, 'debuff');
            }
        }

        // 天赋反伤：受到攻击时反弹伤害（烈焰护体/岩刺等）
        if (amount > 0 && attacker && target === this.player && this.player.talentEffects) {
            const te = this.player.talentEffects;
            if (te.damageReflect && te.damageReflect > 0) {
                const reflectDmg = Math.floor(amount * te.damageReflect);
                if (reflectDmg > 0) {
                    attacker.hp = Math.max(0, attacker.hp - reflectDmg);
                    this.addLog(`🔥 烈焰护体反弹 ${reflectDmg} 点伤害！`, 'counter');
                }
            }
            if (te.rockSpikes && te.rockSpikes > 0 && !damage.element) {
                const thornDmg = Math.floor(this.player.defense * (te.rockSpikesDamage || te.rockSpikes));
                if (thornDmg > 0) {
                    attacker.hp = Math.max(0, attacker.hp - thornDmg);
                    this.addLog(`🪨 岩刺反弹 ${thornDmg} 点伤害！`, 'counter');
                }
            }
            // 雷反：被攻击时概率反击雷伤
            if (te.thunderCounter && Math.random() < te.thunderCounter) {
                const counterDmg = Math.floor(this.player.attack * (te.thunderCounterDamage || 0.5));
                if (counterDmg > 0) {
                    this.applyDamage(attacker, { amount: counterDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`⚡ 雷反！对 ${attacker.name || '敌人'} 造成 ${counterDmg} 点雷伤！`, 'counter');
                    // 雷反概率麻痹
                    if (te.paralyzeChance || te.chargeStack) {
                        const paraChance = te.paralyzeChance || 0.1 + (this.player.chargeStack || 0) * 0.1;
                        if (Math.random() < paraChance) {
                            this.addStatusEffect(attacker, { type: 'paralyze', name: '麻痹', duration: 1 });
                            this.addLog(`⚡ ${attacker.name || '敌人'} 被麻痹了！`, 'element');
                        }
                    }
                }
            }
            // 坚岩：概率大幅减伤
            if (te.hardRockChance && !target._hardRockUsed) {
                if (Math.random() < te.hardRockChance) {
                    const reduction = te.hardRockReduction || 0.5;
                    const reduced = Math.floor(amount * reduction);
                    target.hp += reduced;
                    amount -= reduced;
                    target._hardRockUsed = true;
                    this.addLog(`🪨 坚岩发动！伤害减少${Math.round(reduction*100)}%！`, 'defense');
                }
            }
            // 水之盾（waterGuardChance）：20%概率减伤30%
            if (te.waterGuardChance && Math.random() < te.waterGuardChance) {
                const reduction = te.waterGuardReduction || 0.3;
                const reduced = Math.floor(amount * reduction);
                target.hp += reduced;
                amount -= reduced;
                this.addLog(`💧 水之盾！伤害减少${Math.round(reduction*100)}%！`, 'defense');
            }
            // 常驻减伤（damageReduction）
            if (te.damageReduction) {
                const reduced = Math.floor(amount * te.damageReduction);
                target.hp += reduced;
                amount -= reduced;
            }
            // 岩盾：受击时概率获得护盾
            if (te.shieldChance && amount > 0 && Math.random() < te.shieldChance) {
                const shieldRatio = te.shieldRatio || 0.15;
                const shieldAmount = Math.floor(target.maxHp * shieldRatio);
                const existingShield = target.statusEffects.find(e => e.type === 'shield');
                if (existingShield) {
                    existingShield.value = Math.max(existingShield.value, shieldAmount);
                } else {
                    this.addStatusEffect(target, { type: 'shield', name: '岩盾', value: shieldAmount, duration: 3 });
                }
                this.addLog(`🪨 岩盾发动！获得 ${shieldAmount} 点护盾！`, 'defense');
            }
            // 圣盾（holyShield）：受到致命伤害时保留1HP并获得短暂无敌
            if (te.holyShield && amount >= target.hp && target.hp > 0 && !target._holyShieldUsed) {
                target._holyShieldUsed = true;
                target.hp = 1;
                amount = 0;
                const holyDuration = te.holyShieldDuration || 1;
                this.addStatusEffect(target, { type: 'invulnerable', name: '圣盾', duration: holyDuration });
                this.addLog(`✨ 圣盾降临！免疫伤害！`, 'defense');
            }
            // 自动潜行（autoStealthChance）：受击后概率重新潜行
            if (te.autoStealthChance && amount > 0 && Math.random() < te.autoStealthChance) {
                this.addStatusEffect(target, { type: 'stealth', name: '潜行', duration: 2 });
                target.stealthActive = true;
                this.addLog(`🌑 你重新潜入暗影！`, 'buff');
            }
        }

        // Boss战模式：阶段转换检查
        if (this.battleOptions.mode === 'boss' && target === this.enemy && !this.bossPhase2) {
            const hpPercent = target.hp / target.maxHp;
            if (hpPercent <= 0.5 && amount > 0) {
                // 进入第二阶段：狂暴
                this.bossPhase2 = true;
                this.addLog(`⚠️ ${this.enemy.name} 进入狂暴状态！攻击力大幅提升！`, 'crit');
                
                // 阶段转换：清除所有debuff
                this.enemy.statusEffects = this.enemy.statusEffects.filter(e => 
                    e.type === 'shield' || e.type === 'attack_up' || e.type === 'defense_up' || e.type === 'speed_up'
                );
                this.addLog(`${this.enemy.name} 驱散了身上的所有负面效果！`, 'buff');
                
                // 阶段转换：恢复10%HP
                const phaseHeal = Math.floor(this.enemy.maxHp * 0.1);
                this.enemy.hp = Math.min(this.enemy.maxHp, this.enemy.hp + phaseHeal);
                this.addLog(`${this.enemy.name} 恢复了 ${phaseHeal} 点生命值！`, 'heal');
                
                // 狂暴加成：攻击+30%，速度+20%，防御-10%
                this.enemy.attack = Math.floor(this.enemy.attack * 1.3);
                this.enemy.speed = Math.floor(this.enemy.speed * 1.2);
                this.enemy.defense = Math.floor(this.enemy.defense * 0.9);
                
                // 狂暴阶段新增技能（如果是妖魔）
                if (this.enemy.enemyType === 'demon' || this.enemy.demonTier) {
                    if (!this.enemy.skills.includes('berserk_mode')) {
                        this.enemy.skills.push('berserk_mode');
                    }
                    if (!this.enemy.skills.includes('demon_rage') && this.enemy.demonTier === 'commander') {
                        this.enemy.skills.push('demon_rage');
                    }
                }
                
                // 发布阶段转换事件
                if (typeof BattleEventBus !== 'undefined' && typeof BattleEvents !== 'undefined') {
                    BattleEventBus.emit('bossPhaseChange', {
                        phase: 2,
                        enemy: this.enemy
                    });
                }
            }
        }
        
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
        
        // 处理攻击命中后的效果（吸血、灼烧等）
        if (attacker && amount > 0 && !damage.isMiss) {
            const attackerMods = this.getStatusModifiers(attacker);
            const attackerName = attacker === this.player ? '你' : this.enemy.name;
            const targetName = target === this.player ? '你' : this.enemy.name;
            
            // 吸血效果
            if (attackerMods.lifesteal > 0) {
                let healAmount = Math.floor(amount * attackerMods.lifesteal);
                // 应用治疗降低效果
                const healMultiplier = this.getHealingMultiplier(attacker);
                healAmount = Math.floor(healAmount * healMultiplier);
                if (healAmount > 0 && attacker.hp < attacker.maxHp) {
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
                    this.addLog(`${attackerName} 吸取了 ${healAmount} 点生命！`, 'heal');
                }
            }
            
            // 攻击灼烧几率
            if (attackerMods.burnChanceOnAttack > 0 && Math.random() < attackerMods.burnChanceOnAttack) {
                const burnDamage = attackerMods.burnDamagePerTurn || 10;
                const burnEffect = {
                    type: 'burn',
                    name: '灼烧',
                    duration: 3,
                    damagePerTurn: burnDamage
                };
                target.statusEffects.push(burnEffect);
                this.addLog(`${targetName} 被灼烧了！`, 'debuff');
            }
        }
        
        // 处理受到攻击后的效果（反伤、冻结等）
        if (attacker && amount > 0 && !damage.isMiss) {
            const targetMods = this.getStatusModifiers(target);
            const attackerName = attacker === this.player ? '你' : this.enemy.name;
            const targetName = target === this.player ? '你' : this.enemy.name;
            
            // 伤害反弹
            if (targetMods.damageReflect > 0) {
                const reflectAmount = Math.floor(amount * targetMods.damageReflect);
                if (reflectAmount > 0) {
                    attacker.hp = Math.max(0, attacker.hp - reflectAmount);
                    this.addLog(`${attackerName} 受到了 ${reflectAmount} 点反伤！`, 'damage');
                }
            }
            
            // 受击冻结几率
            if (targetMods.freezeChanceOnHit > 0 && Math.random() < targetMods.freezeChanceOnHit) {
                const freezeDuration = targetMods.freezeDuration || 1;
                const freezeEffect = {
                    type: 'frozen',
                    name: '冻结',
                    duration: freezeDuration
                };
                attacker.statusEffects.push(freezeEffect);
                this.addLog(`${attackerName} 被冻结了！`, 'debuff');
            }
            // v1.5.4: 雷殛护体反击（thunderCounter）- 受击时概率反击雷伤
            if (target === this.player && this.player.talentEffects && this.player.talentEffects.thunderCounter) {
                if (Math.random() < this.player.talentEffects.thunderCounter) {
                    const counterDmg = Math.floor(this.player.attack * (this.player.talentEffects.thunderCounterDamage || 0.5));
                    this.applyDamage(attacker, { amount: counterDmg, element: 'thunder', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`⚡ 雷殛护体！反击造成 ${counterDmg} 点雷伤！`, 'counter');
                    this.showDamageNumber('enemy', counterDmg, 'normal');
                }
            }
            // v1.5.5: 岩甲层数机制（rockArmorStack）- 受击时叠加岩甲
            if (target === this.player && this.player.talentEffects && this.player.talentEffects.rockArmorStack && amount > 0) {
                const te = this.player.talentEffects;
                const maxArmor = te.rockArmorMax || 3;
                if (!this.player._rockArmorStacks) this.player._rockArmorStacks = 0;
                this.player._rockArmorStacks = Math.min(this.player._rockArmorStacks + 1, maxArmor);
                const defBonus = te.rockArmorDefense || 0.03;
                const reduction = te.rockArmorReduction || 0.03;
                this.addLog(`🪨 岩甲叠加 ${this.player._rockArmorStacks}/${maxArmor}（防御+${Math.floor(defBonus*100)}%，减伤+${Math.floor(reduction*100)}%）`, 'buff');
                // 满层岩甲护盾（rockArmorShieldOnMax）
                if (this.player._rockArmorStacks >= maxArmor && te.rockArmorShieldOnMax) {
                    const shieldAmount = Math.floor(this.player.maxHp * te.rockArmorShieldOnMax);
                    const existingShield = this.player.statusEffects.find(e => e.type === 'shield');
                    if (existingShield) {
                        existingShield.value = Math.max(existingShield.value, shieldAmount);
                    } else {
                        this.addStatusEffect(this.player, { type: 'shield', name: '岩甲护盾', value: shieldAmount, duration: 3 });
                    }
                    this.addLog(`🪨 岩甲满层！获得 ${shieldAmount} 点护盾！`, 'defense');
                }
                // 满层岩甲反击（rockArmorCounterOnMax）
                if (this.player._rockArmorStacks >= maxArmor && te.rockArmorCounterOnMax) {
                    const counterDmg = Math.floor(this.player.defense * (te.counterDamage || 0.8));
                    this.applyDamage(attacker, { amount: counterDmg, element: 'earth', isCrit: false, isMiss: false }, this.player);
                    this.addLog(`🪨 岩甲反击！造成 ${counterDmg} 点土伤！`, 'counter');
                    this.showDamageNumber('enemy', counterDmg, 'normal');
                    // 反击眩晕（counterStunChance）
                    if (te.counterStunChance && Math.random() < te.counterStunChance) {
                        this.addStatusEffect(attacker, { type: 'stun', name: '岩击眩晕', duration: 1 });
                        this.addLog(`🪨 岩击眩晕！${attacker === this.player ? '你' : this.enemy.name} 被眩晕！`, 'debuff');
                    }
                    // 反击不消耗岩甲（counterNoConsume）
                    if (!te.counterNoConsume) {
                        this.player._rockArmorStacks = 0;
                    }
                }
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
        
        // 同步攻击者的HP到玩家数据
        if (attacker === this.player) {
            Player.hp = this.player.hp;
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
