/**
 * v3.13.0: 年度魔法考核UI
 * 考核准备、进行、结果界面
 */

import { EXAM_STRATEGIES, EXAM_GRADES } from '../data/annual-exam.js';

export const UIAnnualExam = {
    selectedStrategy: 'power',
    examPhase: 'prepare', // prepare / in_progress / result

    /**
     * 渲染考核界面
     */
    renderAnnualExamScreen() {
        const container = document.getElementById('game-container');
        if (!container) return;

        if (this.examPhase === 'prepare') {
            this._renderPrepareScreen(container);
        } else if (this.examPhase === 'in_progress') {
            this._renderInProgressScreen(container);
        } else if (this.examPhase === 'result') {
            this._renderResultScreen(container);
        }
    },

    /**
     * 渲染准备界面
     */
    _renderPrepareScreen(container) {
        container.innerHTML = `
            <div style="max-width: 700px; margin: 0 auto; padding: 30px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #ffd700; margin: 0 0 10px 0;">📝 年度魔法考核</h2>
                    <p style="color: #8899aa; font-size: 14px; margin: 0;">天澜魔法高中年度魔法释放考核</p>
                </div>

                <!-- 考核规则 -->
                <div style="background: rgba(40,50,60,0.6); border: 1px solid #556677; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                    <div style="color: #aabbcc; font-size: 13px; line-height: 1.8;">
                        <div style="color: #ffd700; margin-bottom: 8px;">考核规则：</div>
                        • 释放3次魔法，综合评分<br>
                        • 评分维度：威力40%、控制力30%、稳定性20%、创意10%<br>
                        • 评分等级：S/A/B/C/D<br>
                        • 考核成绩影响奖励和学校声望
                    </div>
                </div>

                <!-- 选择策略 -->
                <h3 style="color: #aabbcc; margin-bottom: 15px;">选择考核策略</h3>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px;">
                    ${Object.values(EXAM_STRATEGIES).map(s => {
                        const selected = this.selectedStrategy === s.id;
                        return `
                            <div onclick="UIAnnualExam.selectStrategy('${s.id}')" style="
                                padding: 15px;
                                background: ${selected ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                                border: 2px solid ${selected ? '#6699cc' : '#556677'};
                                border-radius: 8px; cursor: pointer;
                            ">
                                <div style="color: #fff; font-size: 15px; font-weight: bold; margin-bottom: 4px;">${s.name}</div>
                                <div style="color: #8899aa; font-size: 12px;">${s.description}</div>
                                <div style="font-size: 11px; color: #667788; margin-top: 6px;">
                                    威力x${s.powerWeight} | 控制x${s.controlWeight} | 稳定x${s.stabilityWeight} | 创意x${s.creativityWeight}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- 开始按钮 -->
                <div onclick="UIAnnualExam.startExam()" style="
                    padding: 15px; text-align: center;
                    background: linear-gradient(135deg, #665522, #887733);
                    border: 2px solid #ffd700; border-radius: 10px;
                    color: #ffd700; cursor: pointer; font-size: 16px; font-weight: bold;
                    box-shadow: 0 0 15px rgba(255,215,0,0.2);
                ">
                    🎯 开始考核
                </div>

                <div onclick="UIAnnualExam.closeExam()" style="
                    padding: 10px; text-align: center; margin-top: 15px;
                    color: #8899aa; cursor: pointer; font-size: 13px;
                ">
                    稍后再来
                </div>
            </div>
        `;
    },

    /**
     * 渲染进行中界面
     */
    _renderInProgressScreen(container) {
        const exam = AnnualExamSystem.getCurrentExam();
        if (!exam) {
            this.examPhase = 'prepare';
            this._renderPrepareScreen(container);
            return;
        }

        const lastScore = exam.scores[exam.scores.length - 1];

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                <h2 style="color: #ffd700; margin-bottom: 20px;">年度考核进行中</h2>

                <div style="color: #aabbcc; font-size: 18px; margin-bottom: 30px;">
                    第 ${exam.currentRound + 1} / ${exam.totalRounds} 次释放
                </div>

                ${lastScore ? `
                    <div style="background: rgba(40,50,60,0.6); border: 1px solid #556677; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                        <div style="color: #8899aa; font-size: 13px; margin-bottom: 10px;">上一次释放得分</div>
                        <div style="font-size: 36px; font-weight: bold; color: ${lastScore.total >= 80 ? '#ffd700' : lastScore.total >= 60 ? '#66ff88' : '#ff8866'}; margin-bottom: 15px;">
                            ${lastScore.total}分
                        </div>
                        <div style="display: flex; justify-content: space-around; font-size: 12px; color: #8899aa;">
                            <div>威力：${lastScore.power}</div>
                            <div>控制：${lastScore.control}</div>
                            <div>稳定：${lastScore.stability}</div>
                            <div>创意：${lastScore.creativity}</div>
                        </div>
                        ${lastScore.specialEvent ? `
                            <div style="margin-top: 10px; padding: 8px; background: ${lastScore.specialEvent.type === 'critical' ? 'rgba(255,215,0,0.2)' : 'rgba(255,100,100,0.2)'}; border-radius: 6px; color: ${lastScore.specialEvent.type === 'critical' ? '#ffd700' : '#ff8888'}; font-size: 13px;">
                                ${lastScore.specialEvent.type === 'critical' ? '✨' : '⚠️'} ${lastScore.specialEvent.name}！
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div style="color: #8899aa; font-size: 14px; margin-bottom: 30px;">
                    当前平均分：<span style="color: #fff; font-size: 18px;">${exam.totalScore}</span>
                </div>

                <div onclick="UIAnnualExam.performCast()" style="
                    padding: 15px 40px; display: inline-block;
                    background: linear-gradient(135deg, #4466aa, #5588cc);
                    border: 2px solid #6699dd; border-radius: 10px;
                    color: #aaccff; cursor: pointer; font-size: 16px; font-weight: bold;
                ">
                    🔮 释放魔法
                </div>
            </div>
        `;
    },

    /**
     * 渲染结果界面
     */
    _renderResultScreen(container) {
        const result = AnnualExamSystem.getExamResult();
        if (!result) {
            this.examPhase = 'prepare';
            this._renderPrepareScreen(container);
            return;
        }

        const gradeInfo = result.gradeInfo;

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                <div style="font-size: 72px; font-weight: bold; color: ${gradeInfo.color}; margin-bottom: 10px; text-shadow: 0 0 30px ${gradeInfo.color}66;">
                    ${result.grade}
                </div>
                <div style="color: ${gradeInfo.color}; font-size: 20px; margin-bottom: 5px;">${gradeInfo.name}评价</div>
                <div style="color: #8899aa; font-size: 14px; margin-bottom: 30px;">${gradeInfo.description}</div>

                <div style="background: rgba(40,50,60,0.6); border: 1px solid #556677; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                    <div style="color: #8899aa; font-size: 13px; margin-bottom: 15px;">三次释放得分</div>
                    <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                        ${result.scores.map((s, i) => `
                            <div>
                                <div style="font-size: 11px; color: #667788;">第${i+1}次</div>
                                <div style="font-size: 20px; color: #fff; font-weight: bold;">${s.total}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="border-top: 1px solid #445566; padding-top: 15px;">
                        <div style="color: #8899aa; font-size: 13px;">平均分</div>
                        <div style="font-size: 28px; color: #ffd700; font-weight: bold;">${result.totalScore}</div>
                    </div>
                </div>

                <!-- 奖励 -->
                <div style="background: rgba(60,50,20,0.4); border: 1px solid #776633; border-radius: 10px; padding: 15px; margin-bottom: 25px;">
                    <div style="color: #ffd700; font-size: 13px; margin-bottom: 10px;">获得奖励</div>
                    <div style="color: #ffd700; font-size: 14px;">💰 ${result.reward.gold.toLocaleString()} 金币</div>
                    <div style="color: #66ff88; font-size: 14px;">✨ ${result.reward.exp} 经验</div>
                    <div style="color: #66aaff; font-size: 14px;">⭐ 学校声望 ${result.reward.reputation > 0 ? '+' : ''}${result.reward.reputation}</div>
                    ${result.reward.starDustDays > 0 ? `<div style="color: #cc99ff; font-size: 14px;">🔮 星尘魔器（${result.reward.starDustDays}天）</div>` : ''}
                </div>

                <!-- 剧情对话 -->
                <div style="text-align: left; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; margin-bottom: 25px;">
                    <div style="color: #88ccff; font-size: 13px; margin-bottom: 8px;">👩‍🏫 唐月：</div>
                    <div style="color: #aabbcc; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">"${result.dialogues.tangYue}"</div>
                    <div style="color: #ffaaaa; font-size: 13px; margin-bottom: 8px;">😤 穆白：</div>
                    <div style="color: #aabbcc; font-size: 13px; line-height: 1.6;">"${result.dialogues.muBai}"</div>
                </div>

                <div onclick="UIAnnualExam.claimReward()" style="
                    padding: 15px 40px; display: inline-block;
                    background: linear-gradient(135deg, #446644, #558855);
                    border: 2px solid #66aa66; border-radius: 10px;
                    color: #aaffaa; cursor: pointer; font-size: 16px; font-weight: bold;
                ">
                    🎁 领取奖励
                </div>
            </div>
        `;
    },

    /**
     * 选择策略
     */
    selectStrategy(strategyId) {
        this.selectedStrategy = strategyId;
        this.renderAnnualExamScreen();
    },

    /**
     * 开始考核
     */
    startExam() {
        const result = AnnualExamSystem.startExam(this.selectedStrategy, Player.primaryElement);
        if (result.success) {
            this.examPhase = 'in_progress';
            this.renderAnnualExamScreen();
        } else {
            UI.showMessage(result.message);
        }
    },

    /**
     * 执行释放
     */
    performCast() {
        const result = AnnualExamSystem.performCast();
        if (result.success) {
            if (result.completed) {
                this.examPhase = 'result';
            }
            this.renderAnnualExamScreen();

            if (result.specialEvent) {
                UI.showMessage(`${result.specialEvent.type === 'critical' ? '✨' : '⚠️'} ${result.specialEvent.name}！`);
            }
        }
    },

    /**
     * 领取奖励
     */
    claimReward() {
        const result = AnnualExamSystem.claimReward();
        if (result.success) {
            UI.showMessage(`🎓 ${result.message}！获得${result.gold}金币、${result.exp}经验`);
            this.examPhase = 'prepare';
            Game.state = 'map';
            UI.renderMapScreen();
        }
    },

    /**
     * 关闭考核界面
     */
    closeExam() {
        Game.state = 'map';
        UI.renderMapScreen();
    }
};

// 向后兼容
if (typeof window !== 'undefined') window.UIAnnualExam = UIAnnualExam;
