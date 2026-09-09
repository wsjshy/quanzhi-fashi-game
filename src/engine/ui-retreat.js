/**
 * v3.11.0: 闭关修炼UI
 * 闭关准备界面、闭关进行界面、闭关结算界面
 */

export const UIRetreat = {
    selectedDuration: 1,
    selectedLocation: 'school_training_room',
    retreatResult: null,

    /**
     * 渲染闭关准备界面
     */
    renderRetreatScreen() {
        const container = document.getElementById('game-container');
        if (!container) return;

        const locations = RetreatSystem.getAvailableLocations();
        const durations = [1, 3, 7, 30];

        // 计算当前选择的预计收益
        const reward = RetreatSystem.calculateRetreatReward(this.selectedDuration, this.selectedLocation);

        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: #ffd700; margin: 0;">🧘 闭关修炼</h2>
                    <div onclick="UIRetreat.closeRetreat()" style="padding: 8px 16px; background: #443333; border: 1px solid #775555; border-radius: 6px; color: #ffaaaa; cursor: pointer;">关闭</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- 左侧：选择闭关时长和地点 -->
                    <div>
                        <h3 style="color: #aabbcc; margin-bottom: 10px;">选择闭关时长</h3>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                            ${durations.map(d => {
                                const config = RetreatSystem.DURATION_CONFIG[d];
                                const selected = this.selectedDuration === d;
                                return `
                                    <div onclick="UIRetreat.selectDuration(${d})" style="
                                        padding: 12px;
                                        background: ${selected ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                                        border: 2px solid ${selected ? '#6699cc' : '#556677'};
                                        border-radius: 8px; cursor: pointer;
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="color: #fff; font-size: 15px; font-weight: bold;">${config.name}</span>
                                            <span style="font-size: 12px; color: #8899aa;">收益x${config.expMultiplier}</span>
                                        </div>
                                        <div style="font-size: 11px; color: #667788; margin-top: 4px;">
                                            走火入魔概率：${(config.backfireChance * 100).toFixed(0)}% | 特殊事件：${(config.eventChance * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <h3 style="color: #aabbcc; margin-bottom: 10px;">选择闭关地点</h3>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${locations.map(loc => {
                                const selected = this.selectedLocation === loc.id;
                                return `
                                    <div onclick="${loc.unlocked ? `UIRetreat.selectLocation('${loc.id}')` : ''}" style="
                                        padding: 12px;
                                        background: ${selected ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                                        border: 2px solid ${selected ? '#6699cc' : '#556677'};
                                        border-radius: 8px; cursor: ${loc.unlocked ? 'pointer' : 'not-allowed'};
                                        opacity: ${loc.unlocked ? 1 : 0.5};
                                    ">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="color: #fff; font-size: 14px;">${loc.name}</span>
                                            ${!loc.unlocked ? `<span style="font-size: 11px; color: #ff8888;">🔒 ${loc.lockReason || '未解锁'}</span>` : ''}
                                        </div>
                                        <div style="font-size: 11px; color: #8899aa; margin-top: 4px;">
                                            修为+${(loc.cultBonus * 100).toFixed(0)}% | 经验+${(loc.expBonus * 100).toFixed(0)}% | 走火入魔${loc.backfireReduce > 0 ? '-' : '+'}${(Math.abs(loc.backfireReduce) * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- 右侧：预计收益和开始按钮 -->
                    <div>
                        <h3 style="color: #aabbcc; margin-bottom: 10px;">预计收益</h3>
                        <div style="background: rgba(40,50,60,0.6); border: 1px solid #556677; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <div style="margin-bottom: 10px;">
                                <span style="color: #8899aa; font-size: 13px;">经验：</span>
                                <span style="color: #66ff88; font-size: 16px; font-weight: bold;">${reward.expRange}</span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span style="color: #8899aa; font-size: 13px;">修为：</span>
                                <span style="color: #66aaff; font-size: 16px; font-weight: bold;">${reward.cultRange}</span>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span style="color: #8899aa; font-size: 13px;">特殊事件概率：</span>
                                <span style="color: #ffd700; font-size: 14px;">${(reward.eventChance * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                                <span style="color: #8899aa; font-size: 13px;">走火入魔概率：</span>
                                <span style="color: #ff6666; font-size: 14px;">${(reward.backfireChance * 100).toFixed(0)}%</span>
                            </div>
                        </div>

                        <div style="background: rgba(60,50,20,0.4); border: 1px solid #776633; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                            <div style="color: #ffd700; font-size: 12px; margin-bottom: 6px;">⚠️ 闭关提示</div>
                            <div style="color: #aa9966; font-size: 11px; line-height: 1.6;">
                                • 闭关期间无法进行其他活动<br>
                                • 闭关时间越长，收益越高但风险越大<br>
                                • 可提前出关，但收益打折且无特殊事件<br>
                                • 走火入魔会损失30%收益并获得debuff
                            </div>
                        </div>

                        <div onclick="UIRetreat.startRetreat()" style="
                            padding: 15px; text-align: center;
                            background: linear-gradient(135deg, #445566, #556677);
                            border: 2px solid #778899; border-radius: 10px;
                            color: #aaccff; cursor: pointer; font-size: 16px; font-weight: bold;
                        ">
                            🧘 开始闭关
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染闭关进行界面
     */
    renderRetreatProgress() {
        const container = document.getElementById('game-container');
        if (!container) return;

        const retreat = RetreatSystem.getCurrentRetreat();
        if (!retreat) {
            this.renderRetreatScreen();
            return;
        }

        const config = RetreatSystem.DURATION_CONFIG[retreat.durationDays];
        const progress = ((config.days - retreat.daysRemaining) / config.days) * 100;

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                <h2 style="color: #ffd700; margin-bottom: 10px;">🧘 闭关修炼中</h2>
                <div style="color: #8899aa; font-size: 14px; margin-bottom: 30px;">
                    ${retreat.locationName} · ${config.name}
                </div>

                <!-- 进度条 -->
                <div style="background: rgba(40,50,60,0.8); border-radius: 10px; padding: 4px; margin-bottom: 15px;">
                    <div style="height: 20px; background: linear-gradient(90deg, #4466aa, #6688cc); border-radius: 8px; width: ${progress}%; transition: width 0.5s;"></div>
                </div>
                <div style="color: #aabbcc; font-size: 14px; margin-bottom: 30px;">
                    第 ${config.days - retreat.daysRemaining} / ${config.days} 天
                </div>

                <!-- 闭关状态 -->
                <div style="background: rgba(40,50,60,0.6); border: 1px solid #556677; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                    <div style="color: #66aaff; font-size: 18px; margin-bottom: 10px;">💫 气息运转中...</div>
                    <div style="color: #8899aa; font-size: 13px;">
                        ${retreat.events.length > 0 ? `闭关期间触发了 ${retreat.events.length} 次特殊事件` : '闭关顺利进行中'}
                    </div>
                </div>

                <!-- 事件记录 -->
                ${retreat.events.length > 0 ? `
                    <div style="text-align: left; margin-bottom: 30px;">
                        <div style="color: #aabbcc; font-size: 13px; margin-bottom: 8px;">闭关事件：</div>
                        ${retreat.events.map(e => `
                            <div style="padding: 8px 12px; background: rgba(60,50,20,0.4); border-radius: 6px; margin-bottom: 6px; font-size: 12px; color: #ffd700;">
                                ✨ ${e.name}：${e.message}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- 按钮 -->
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <div onclick="UIRetreat.advanceDay()" style="
                        padding: 12px 30px; background: linear-gradient(135deg, #446644, #558855);
                        border: 2px solid #66aa66; border-radius: 8px; color: #aaffaa;
                        cursor: pointer; font-size: 14px;
                    ">
                        ⏩ 推进1天
                    </div>
                    <div onclick="UIRetreat.exitEarly()" style="
                        padding: 12px 30px; background: #554433;
                        border: 2px solid #887755; border-radius: 8px; color: #ffccaa;
                        cursor: pointer; font-size: 14px;
                    ">
                        🚪 提前出关
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染闭关结算界面
     */
    renderRetreatResult() {
        const container = document.getElementById('game-container');
        if (!container) return;

        const result = this.retreatResult;
        if (!result) {
            this.renderRetreatScreen();
            return;
        }

        container.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                <h2 style="color: ${result.backfire ? '#ff6666' : '#ffd700'}; margin-bottom: 20px;">
                    ${result.backfire ? '😵 闭关结束（走火入魔）' : '✨ 闭关圆满结束'}
                </h2>

                <div style="background: rgba(40,50,60,0.6); border: 2px solid ${result.backfire ? '#aa4444' : '#6688aa'}; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
                    <div style="color: #8899aa; font-size: 13px; margin-bottom: 15px;">
                        ${result.locationName} · 闭关${result.days}天${result.earlyExit ? '（提前出关）' : ''}
                    </div>

                    <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
                        <div>
                            <div style="color: #8899aa; font-size: 12px;">获得经验</div>
                            <div style="color: #66ff88; font-size: 24px; font-weight: bold;">+${result.expGain}</div>
                        </div>
                        <div>
                            <div style="color: #8899aa; font-size: 12px;">获得修为</div>
                            <div style="color: #66aaff; font-size: 24px; font-weight: bold;">+${result.cultGain}</div>
                        </div>
                    </div>

                    ${result.events.length > 0 ? `
                        <div style="text-align: left; margin-bottom: 15px;">
                            <div style="color: #aabbcc; font-size: 13px; margin-bottom: 8px;">闭关事件：</div>
                            ${result.events.map(e => `
                                <div style="padding: 6px 10px; background: rgba(60,50,20,0.4); border-radius: 6px; margin-bottom: 4px; font-size: 12px; color: #ffd700;">
                                    ✨ ${e.name}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${result.buffs.length > 0 ? `
                        <div style="text-align: left; margin-bottom: 15px;">
                            <div style="color: #aabbcc; font-size: 13px; margin-bottom: 8px;">获得状态：</div>
                            ${result.buffs.map(b => `
                                <div style="padding: 6px 10px; background: rgba(40,60,80,0.4); border-radius: 6px; margin-bottom: 4px; font-size: 12px; color: #88ccff;">
                                    🌀 ${b}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${result.backfire ? `
                        <div style="padding: 10px; background: rgba(100,30,30,0.4); border: 1px solid #aa4444; border-radius: 6px; color: #ff8888; font-size: 13px;">
                            ⚠️ 走火入魔！收益损失30%，获得debuff"心魔缠身"
                        </div>
                    ` : ''}
                </div>

                <div onclick="UIRetreat.closeResult()" style="
                    padding: 12px 40px; background: linear-gradient(135deg, #446644, #558855);
                    border: 2px solid #66aa66; border-radius: 8px; color: #aaffaa;
                    cursor: pointer; font-size: 15px; display: inline-block;
                ">
                    确定
                </div>
            </div>
        `;
    },

    /**
     * 选择闭关时长
     */
    selectDuration(days) {
        this.selectedDuration = days;
        this.renderRetreatScreen();
    },

    /**
     * 选择闭关地点
     */
    selectLocation(locationId) {
        this.selectedLocation = locationId;
        this.renderRetreatScreen();
    },

    /**
     * 开始闭关
     */
    startRetreat() {
        const result = RetreatSystem.startRetreat(this.selectedDuration, this.selectedLocation);
        if (result.success) {
            this.renderRetreatProgress();
        } else {
            UI.showMessage(result.message);
        }
    },

    /**
     * 推进1天
     */
    advanceDay() {
        const result = RetreatSystem.advanceRetreatDay();
        const retreat = RetreatSystem.getCurrentRetreat();

        if (retreat.daysRemaining <= 0) {
            // 闭关结束
            this.retreatResult = RetreatSystem.endRetreat(false);
            this.renderRetreatResult();
        } else {
            this.renderRetreatProgress();
            if (result.event) {
                UI.showMessage(`✨ ${result.event.name}：${result.event.message}`);
            }
        }
    },

    /**
     * 提前出关
     */
    exitEarly() {
        this.retreatResult = RetreatSystem.exitEarly();
        this.renderRetreatResult();
    },

    /**
     * 关闭结算
     */
    closeResult() {
        this.retreatResult = null;
        Game.state = 'map';
        UI.renderMapScreen();
    },

    /**
     * 关闭闭关界面
     */
    closeRetreat() {
        Game.state = 'map';
        UI.renderMapScreen();
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.UIRetreat = UIRetreat;
