/**
 * v3.13.0: 年度魔法考核系统核心逻辑
 * 基于原著第24-29章年度考核事件
 */

import { EXAM_STRATEGIES, EXAM_GRADES, EXAM_REWARDS, EXAM_DIALOGUES, getGrade } from '../data/annual-exam.js';

export const AnnualExamSystem = {
    // 考核状态
    currentExam: null,

    /**
     * 开始考核
     */
    startExam(strategyId, elementId) {
        const strategy = EXAM_STRATEGIES[strategyId];
        if (!strategy) {
            return { success: false, message: '无效的考核策略' };
        }

        this.currentExam = {
            strategy: strategyId,
            element: elementId,
            currentRound: 0,
            totalRounds: 3,
            scores: [],
            totalScore: 0,
            grade: null,
            completed: false
        };

        return {
            success: true,
            message: '年度考核开始！',
            exam: this.currentExam
        };
    },

    /**
     * 执行一次魔法释放
     */
    performCast() {
        if (!this.currentExam || this.currentExam.completed) {
            return { success: false, message: '没有进行中的考核' };
        }

        const exam = this.currentExam;
        const strategy = EXAM_STRATEGIES[exam.strategy];

        // 计算各维度得分
        const powerScore = this._calculatePowerScore(strategy);
        const controlScore = this._calculateControlScore(strategy);
        const stabilityScore = this._calculateStabilityScore(strategy);
        const creativityScore = this._calculateCreativityScore(strategy);

        // 加权总分
        let roundScore = Math.round(
            powerScore * 0.40 +
            controlScore * 0.30 +
            stabilityScore * 0.20 +
            creativityScore * 0.10
        );

        // 检查超常发挥或失误
        let specialEvent = null;
        const rand = Math.random();
        if (rand < 0.08) {
            // 超常发挥
            const bonus = Math.floor(roundScore * 0.2);
            roundScore = Math.min(100, roundScore + bonus);
            specialEvent = { type: 'critical', name: '超常发挥', bonus: bonus };
        } else if (rand > 0.95) {
            // 失误
            const penalty = Math.floor(roundScore * 0.25);
            roundScore = Math.max(0, roundScore - penalty);
            specialEvent = { type: 'miss', name: '发挥失误', penalty: penalty };
        }

        exam.scores.push({
            round: exam.currentRound + 1,
            power: powerScore,
            control: controlScore,
            stability: stabilityScore,
            creativity: creativityScore,
            total: roundScore,
            specialEvent: specialEvent
        });

        exam.currentRound++;
        exam.totalScore = Math.round(
            exam.scores.reduce((sum, s) => sum + s.total, 0) / exam.scores.length
        );

        // 检查是否完成
        if (exam.currentRound >= exam.totalRounds) {
            exam.completed = true;
            exam.grade = getGrade(exam.totalScore);
        }

        return {
            success: true,
            round: exam.currentRound,
            score: roundScore,
            details: exam.scores[exam.scores.length - 1],
            specialEvent: specialEvent,
            totalScore: exam.totalScore,
            completed: exam.completed,
            grade: exam.grade
        };
    },

    /**
     * 计算威力得分
     */
    _calculatePowerScore(strategy) {
        // 基于玩家等级和攻击力
        const basePower = 30 + Player.level * 3;
        const attackBonus = (Player.attack || 0) * 0.5;
        let score = basePower + attackBonus;

        // 策略加成
        score *= strategy.powerWeight;

        // 随机波动
        score *= 0.85 + Math.random() * 0.3;

        return Math.min(100, Math.max(0, Math.round(score)));
    },

    /**
     * 计算控制力得分
     */
    _calculateControlScore(strategy) {
        // 基于精神力和等级
        const baseControl = 35 + Player.level * 2;
        const spiritBonus = (Player.spirit || Player.level) * 0.3;
        let score = baseControl + spiritBonus;

        // 策略加成
        score *= strategy.controlWeight;

        // 随机波动
        score *= 0.85 + Math.random() * 0.3;

        return Math.min(100, Math.max(0, Math.round(score)));
    },

    /**
     * 计算稳定性得分
     */
    _calculateStabilityScore(strategy) {
        // 基于技能熟练度和等级
        const baseStability = 40 + Player.level * 2;
        let score = baseStability;

        // 策略加成
        score *= strategy.stabilityWeight;

        // 随机波动
        score *= 0.85 + Math.random() * 0.3;

        return Math.min(100, Math.max(0, Math.round(score)));
    },

    /**
     * 计算创意得分
     */
    _calculateCreativityScore(strategy) {
        // 创意策略得分更高
        let score = 50;

        // 策略加成
        score *= strategy.creativityWeight;

        // 双系玩家创意加分
        if (Player.secondaryElement) {
            score += 10;
        }

        // 随机波动
        score *= 0.8 + Math.random() * 0.4;

        return Math.min(100, Math.max(0, Math.round(score)));
    },

    /**
     * 获取考核结果和奖励
     */
    getExamResult() {
        if (!this.currentExam || !this.currentExam.completed) {
            return null;
        }

        const exam = this.currentExam;
        const grade = exam.grade;
        const reward = EXAM_REWARDS[grade];
        const dialogues = EXAM_DIALOGUES[grade];

        return {
            grade: grade,
            gradeInfo: EXAM_GRADES[grade],
            totalScore: exam.totalScore,
            scores: exam.scores,
            reward: reward,
            dialogues: dialogues
        };
    },

    /**
     * 领取考核奖励
     */
    claimReward() {
        const result = this.getExamResult();
        if (!result) {
            return { success: false, message: '考核未完成' };
        }

        const reward = result.reward;

        // 发放奖励
        Player.gold += reward.gold;
        Player.gainExp(reward.exp);

        // 声望
        if (reward.reputation !== 0) {
            Player.reputation = Player.reputation || {};
            Player.reputation.school = (Player.reputation.school || 0) + reward.reputation;
        }

        // 星尘魔器
        if (reward.starDustDays > 0) {
            Player.starDustAssignment = {
                artifactId: 'basic_star_dust',
                grade: 'normal',
                daysRemaining: reward.starDustDays,
                totalDays: reward.starDustDays,
                source: 'annual_exam',
                assignedDay: Player.day,
                expireDay: Player.day + reward.starDustDays
            };
        }

        // 标记考核已完成
        Player.annualExamCompleted = true;
        Player.annualExamGrade = result.grade;
        Player.annualExamDay = Player.day;

        this.currentExam = null;

        return {
            success: true,
            message: `考核结束！获得${result.gradeInfo.name}评价`,
            grade: result.grade,
            gold: reward.gold,
            exp: reward.exp,
            reputation: reward.reputation,
            starDustDays: reward.starDustDays
        };
    },

    /**
     * 检查考核是否可用
     */
    isExamAvailable() {
        // 第7天后可用，且未完成过
        return Player.day >= 7 && !Player.annualExamCompleted;
    },

    /**
     * 获取当前考核状态
     */
    getCurrentExam() {
        return this.currentExam;
    }
};

// 向后兼容
if (typeof window !== 'undefined') window.AnnualExamSystem = AnnualExamSystem;
