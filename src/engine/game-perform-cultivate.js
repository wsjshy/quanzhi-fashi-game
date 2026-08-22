/**
 * 游戏主流程 - 修炼执行模块
 * 
 * 从game.js拆分出的独立修炼执行模块
 * 包含：执行修炼（performCultivate）
 */

export function performCultivate(actionId, hours, bonus) {
        try {
            // 关闭弹窗
            const dialogs = document.querySelectorAll('div[style*="z-index: 99999"]');
            dialogs.forEach(d => {
                if (d.querySelector('h3')?.textContent?.includes('修炼') || d.querySelector('h3')?.textContent?.includes('冥修')) {
                    d.remove();
                }
            });
            
            const location = DataManager.getLocation(Player.currentLocation);
            const action = location?.actions?.find(a => a.id === actionId);
            if (!action) {
                console.warn('[修炼] 行动不存在:', actionId);
                return;
            }
            
            const baseTime = action.timeCost || 2;
            const multiplier = hours / baseTime;
            
            // 计算实际效果：按时间倍数 × 收益加成
            // v0.99.0: 用每日行动次数效率替代体力效率
            const dailyEff = Player.getCultivateEfficiency ? Player.getCultivateEfficiency() : 1.0;
            // v0.24.0: 修炼buff（心境通明等）
            const buffExpBonus = Player.cultivationBuff?.expBonus || 0;
            const result = {
                success: true,
                timeCost: hours,
                effects: {
                    exp: Math.floor((action.effects?.exp || 0) * multiplier * bonus * dailyEff * (1 + buffExpBonus)),
                    hp: Math.floor((action.effects?.hp || 0) * multiplier),
                    mp: Math.floor((action.effects?.mp || 0) * multiplier)
                    // v0.99.0: 移除体力消耗（体力系统已废弃）
                },
                message: `${action.name} ${hours}小时完成`,
                dailyEfficiency: dailyEff  // v0.99.0: 记录效率用于UI提示
            };
            
            // 星尘魔器效果：增加修炼经验
            if (typeof StarDustArtifactSystem !== 'undefined') {
                const starDustEffect = Player.getTotalStarDustEffect();
                if (starDustEffect.expBonus > 0) {
                    const bonusExp = Math.floor(result.effects.exp * starDustEffect.expBonus);
                    result.effects.exp += bonusExp;
                    result.starDustBonus = bonusExp;
                }

                // v1.8.2: 学校/家族分配的星尘魔器临时使用权加成
                if (StarDustArtifactSystem.hasActiveArtifact(Player)) {
                    const activeBonus = StarDustArtifactSystem.getActiveBonus(Player);
                    if (activeBonus.expBonus > 0) {
                        const assignBonusExp = Math.floor(result.effects.exp * activeBonus.expBonus);
                        result.effects.exp += assignBonusExp;
                        result.assignedStarDustBonus = assignBonusExp;
                    }
                }
            }

            // v0.19.0: 地圣泉内泉效果 - 修炼经验×3（玩家争夺到的机缘）
            if (Player.currentLocation === 'earth_spring' && Player.flags?.earth_spring_inner) {
                const innerBonus = result.effects.exp * 2; // 额外2倍，总共3倍
                result.effects.exp += innerBonus;
                result.innerSpringBonus = innerBonus;
            }

            // v0.41.0: 影响力修炼加成 - 声望越高，修炼时越容易进入状态
            if (Player.getInfluenceTier) {
                const infTier = Player.getInfluenceTier();
                const infBonusRate = [0, 0.05, 0.10, 0.15, 0.20][infTier.level] || 0;
                if (infBonusRate > 0) {
                    const infBonus = Math.floor(result.effects.exp * infBonusRate);
                    result.effects.exp += infBonus;
                    result.influenceBonus = infBonus;
                }
            }

            // v0.56.0: 导师修炼加成 - 拜师后稳定经验加成
            if (Player.flags?.tang_yue_mentor) {
                const mentorLevel = Player.mentor?.level || 1;
                const mentorBonusRate = 0.10 + (mentorLevel - 1) * 0.05;
                const mentorBonus = Math.floor(result.effects.exp * mentorBonusRate);
                if (mentorBonus > 0) {
                    result.effects.exp += mentorBonus;
                    result.mentorBonus = mentorBonus;
                }
            }

            // 触发事件的概率：时间越长概率越高，但不是线性增长
            const eventChance = action.eventChance || 0;
            if (eventChance > 0 && Math.random() < eventChance * Math.sqrt(multiplier)) {
                const eventId = action.events[Math.floor(Math.random() * action.events.length)];
                result.event = eventId;
            }

            // v0.32.0: 修炼品质系统 - 每次修炼有随机品质波动
            const qualityRoll = Math.random();
            let quality = { name: '普通', multiplier: 1.0, message: '', hpLoss: 0 };
            if (qualityRoll < 0.05) {
                quality = { name: '走火入魔', multiplier: 0.5, message: '⚠️ 走火入魔！魔力反噬，修炼效率大减，但你的抗性有所提升。', hpLoss: 15 };
                Player.fireResistance = (Player.fireResistance || 0) + 0.01; // 永久微量抗性提升
            } else if (qualityRoll < 0.15) {
                quality = { name: '状态不佳', multiplier: 0.75, message: '😓 状态不佳，精神难以集中。', hpLoss: 5 };
            } else if (qualityRoll < 0.65) {
                quality = { name: '普通', multiplier: 1.0, message: '', hpLoss: 0 };
            } else if (qualityRoll < 0.90) {
                quality = { name: '状态良好', multiplier: 1.25, message: '😊 状态良好，修炼得心应手。', hpLoss: 0 };
            } else {
                quality = { name: '极佳', multiplier: 1.6, message: '🌟 修炼状态极佳！灵感如泉涌！', hpLoss: 0 };
            }
            result.quality = quality;
            result.effects.exp = Math.floor(result.effects.exp * quality.multiplier);
            if (quality.hpLoss > 0) {
                result.effects.hp = (result.effects.hp || 0) - quality.hpLoss;
            }

            // v0.32.0: 修炼时NPC指导 - 如果有NPC在同地修炼，有概率获得指导
            result.npcGuidance = null;
            if (typeof NPCStateSystem !== 'undefined' && this._npcSchedules) {
                const timeOfDay = Player.time || 'morning';
                for (const [npcId, schedule] of Object.entries(this._npcSchedules)) {
                    const timeSlot = schedule[timeOfDay];
                    if (!timeSlot) continue;
                    if (Player.currentLocation !== timeSlot.location) continue;
                    if (!timeSlot.activity.includes('修炼') && !timeSlot.activity.includes('备课')) continue;
                    // v0.41.0: 影响力提升NPC指导概率（小有名气+5%，声名远扬+10%，传奇法师+15%）
                    let guidanceChance = 0.35;
                    if (Player.getInfluenceTier) {
                        const infTier = Player.getInfluenceTier();
                        guidanceChance += [0, 0, 0.05, 0.10, 0.15][infTier.level] || 0;
                    }
                    if (Math.random() < guidanceChance) {
                        const npcData = DataManager.getCharacter(npcId);
                        const guidanceExp = Math.floor(result.effects.exp * 0.2);
                        result.npcGuidance = { npcId, name: npcData?.name || npcId, exp: guidanceExp };
                        result.effects.exp += guidanceExp;
                        // 增加好感度
                        NPCStateSystem.changeOpinion(npcId, 2);
                        break;
                    }
                }
            }

            // v0.24.0: 修炼顿悟系统（玩家专属机缘）
            result.insight = this._checkCultivationInsight(action, hours, multiplier);
            if (result.insight) {
                result.effects.exp += result.insight.bonusExp;
                if (result.insight.skillPoint) {
                    Player.skillPoints = (Player.skillPoints || 0) + result.insight.skillPoint;
                }
                if (result.insight.buff) {
                    Player.cultivationBuff = result.insight.buff;
                }
            }
            
            // 应用效果
            if (result.effects.exp) Player.gainExp(result.effects.exp);
            if (result.effects.hp) Player.hp = Math.max(1, Math.min(Player.maxHp, Player.hp + result.effects.hp));
            if (result.effects.mp) Player.mp = Math.max(0, Math.min(Player.maxMp, Player.mp + result.effects.mp));
            // v0.99.0: 移除体力恢复（体力系统已废弃）
            // if (result.effects.stamina) Player.stamina = ...

            // v0.25.0: 修炼计数和任务进度
            Player._totalCultivateCount = (Player._totalCultivateCount || 0) + 1;
            // v0.99.0: 记录每日修炼次数（用于效率递减）
            if (typeof Player.recordAction === 'function') {
                Player.recordAction('cultivate');
            }
            if (typeof QuestSystem !== 'undefined') {
                QuestSystem.updateProgress('cultivate', null, 1);
            }
            
            // 时间流逝
            const timeResult = TimeSystem.advanceTime(result.timeCost);
            result.timeEvents = timeResult.events;

            // v0.24.0: 修炼buff持续时间递减
            if (Player.cultivationBuff) {
                Player.cultivationBuff.duration--;
                if (Player.cultivationBuff.duration <= 0) {
                    message += `  ${Player.cultivationBuff.name} 效果结束\n`;
                    delete Player.cultivationBuff;
                }
            }
            
            // 检查强制昏睡
            let message = result.message + '\n';
            // v0.32.0: 修炼品质
            if (result.quality && result.quality.message) {
                message += result.quality.message + '\n';
            }
            // v0.32.0: NPC指导
            if (result.npcGuidance) {
                message += `💡 ${result.npcGuidance.name}路过，指点了你几句。经验 +${result.npcGuidance.exp}，好感+2\n`;
            }
            if (result.effects.exp) message += `经验 +${result.effects.exp}\n`;
            if (result.starDustBonus) message += `  ✨ 星尘魔器加成 +${result.starDustBonus}\n`;
            if (result.influenceBonus) message += `  🌟 影响力加成 +${result.influenceBonus}\n`;
            if (result.mentorBonus) message += `  📚 导师指导 +${result.mentorBonus}\n`;
            if (Player.cultivationBuff) message += `  🧘 ${Player.cultivationBuff.name} 加成 +${Math.round(Player.cultivationBuff.expBonus * 100)}%\n`;
            if (result.insight) message += `${result.insight.message}\n`;
            if (result.effects.mp > 0) message += `MP +${result.effects.mp}\n`;
            if (result.effects.mp < 0) message += `MP ${result.effects.mp}\n`;
            if (result.effects.hp < 0) message += `HP ${result.effects.hp}\n`;
            
            // 检查升级
            if (Player.exp >= Player.expToNext) {
                const levelResult = Player.checkLevelUp();
                if (levelResult.levelUps.length > 0) {
                    message += `🎉 升级了！当前等级 ${Player.level}\n`;
                    message += `获得属性点（当前可分配：${Player.attributePoints} 点）\n`;
                    // 天生天赋进化提示
                    if (Player._innateTalentEvolved) {
                        const talentData = typeof DataInnateTalents !== 'undefined' ? DataInnateTalents[Player.innateTalent] : null;
                        const talentName = talentData?.name || '天生天赋';
                        message += `✨ ${talentName} 进化到 Lv.${Player.innateTalentLevel}！效果增强！\n`;
                        Player._innateTalentEvolved = false;
                    }
                }
            }

            // 天赋经验：修炼增加主系天赋经验
            if (Player.elements && Player.elements.length > 0 && typeof TalentSystem !== 'undefined') {
                const mainElement = Player.elements[0];
                const talentExp = Math.floor(5 * multiplier * bonus); // 每小时5点基础天赋经验
                const talentResult = Player.addElementTalentExp(mainElement, talentExp);
                if (talentResult.leveledUp) {
                    message += `🌟 天赋「${talentResult.talentName}」升级到 Lv.${talentResult.newLevel}！\n`;
                }
            }
            
            // 检查强制昏睡
            if (result.timeEvents && result.timeEvents.some(e => e.type === 'force_sleep')) {
                message = `😴 你熬夜修炼，不知不觉昏睡了过去...\n\n（第二天早上醒来，感觉没睡好，体力只恢复了50%）\n\n` + message;
            }

            // v0.24.0: NPC自主日程——修炼时也可能遇到NPC
            const cultivateNPCEncounter = this._checkNPCEncounter();
            let cultivateInteractionEvent = null;
            if (cultivateNPCEncounter) {
                message += cultivateNPCEncounter.message;
                if (cultivateNPCEncounter.interactionEvent) {
                    cultivateInteractionEvent = cultivateNPCEncounter.interactionEvent;
                }
            }

            // v0.25.0: 修炼时检查任务触发
            if (typeof QuestSystem !== 'undefined') {
                const triggeredQuests = QuestSystem.checkQuestTriggers();
                for (const q of triggeredQuests) {
                    message += `\n\n📜 新任务：${q.name}\n${q.description}`;
                }
            }

            UI.showMessage(message.trim());

            // v0.64.0: 修炼时触发NPC互动事件（关系驱动任务/NPC联动）
            if (cultivateInteractionEvent) {
                this.showEvent(cultivateInteractionEvent.id);
                return;
            }
            
            // 刷新界面
            UI.renderMapScreen();
            
            // 检查地点解锁
            const newlyUnlocked = MapSystem.checkLocationUnlocks();
            if (newlyUnlocked.length > 0) {
                const names = newlyUnlocked.map(loc => loc.name).join('、');
                setTimeout(() => UI.showMessage(`🎉 解锁新地点：${names}！`), 500);
            }
            
            // 日常追踪：修炼
            DailySystem.trackActivity('cultivate', 1);
            
            // 保存游戏
            Player.save();
            
            // v1.5.0: 检测是否有天赋分支需要选择
            setTimeout(() => {
                if (typeof Game !== 'undefined') Game.checkPendingBranchChoices();
            }, 800);
        } catch (e) {
            console.error('[修炼] 出错:', e);
            UI.showMessage('修炼出错：' + e.message);
        }
    }


// 导出模块集合
export const GamePerformCultivate = {
    performCultivate
};

export default GamePerformCultivate;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.GamePerformCultivate = GamePerformCultivate;
}