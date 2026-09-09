/**
 * v3.13.0: 年度魔法考核配置
 * 基于原著第24-29章年度考核事件
 */

// 考核策略配置
export const EXAM_STRATEGIES = {
    power: {
        id: 'power',
        name: '全力输出',
        description: '追求最大威力，控制力可能不足',
        powerWeight: 1.3,
        controlWeight: 0.8,
        stabilityWeight: 0.9,
        creativityWeight: 0.8
    },
    control: {
        id: 'control',
        name: '精细控制',
        description: '注重控制力和稳定性，威力稍弱',
        powerWeight: 0.85,
        controlWeight: 1.3,
        stabilityWeight: 1.2,
        creativityWeight: 0.9
    },
    creative: {
        id: 'creative',
        name: '创意组合',
        description: '尝试创新的魔法组合，风险高收益高',
        powerWeight: 1.0,
        controlWeight: 1.0,
        stabilityWeight: 0.7,
        creativityWeight: 1.5
    }
};

// 评分等级配置
export const EXAM_GRADES = {
    S: { minScore: 90, name: 'S级', color: '#ffd700', description: '完美释放，远超同年级水平' },
    A: { minScore: 75, name: 'A级', color: '#66ff66', description: '优秀释放，年级前列' },
    B: { minScore: 60, name: 'B级', color: '#6699ff', description: '良好释放，平均水平以上' },
    C: { minScore: 40, name: 'C级', color: '#aaaaaa', description: '及格释放，达到基本要求' },
    D: { minScore: 0, name: 'D级', color: '#ff6666', description: '不及格，需要补考' }
};

// 考核奖励配置
export const EXAM_REWARDS = {
    S: { gold: 50000, exp: 1000, reputation: 30, starDustDays: 7, specialDialogue: true },
    A: { gold: 30000, exp: 700, reputation: 20, starDustDays: 3, specialDialogue: false },
    B: { gold: 15000, exp: 400, reputation: 10, starDustDays: 0, specialDialogue: false },
    C: { gold: 5000, exp: 200, reputation: 5, starDustDays: 0, specialDialogue: false },
    D: { gold: 0, exp: 50, reputation: -5, starDustDays: 0, specialDialogue: false }
};

// 考核剧情对话
export const EXAM_DIALOGUES = {
    S: {
        tangYue: '太惊人了！你的魔法控制力和威力都远超同年级水平。这届学生中，你是第一个让我感到惊讶的。',
        muBai: '哼，不过是运气好罢了。下次我一定会超过你。',
        crowd: '哇！S级评价！已经好几年没有学生拿到S级了！'
    },
    A: {
        tangYue: '很不错的表现，你的魔法基础很扎实。继续努力，未来可期。',
        muBai: '还算有点实力，但离我还差得远。',
        crowd: 'A级评价，已经很厉害了！'
    },
    B: {
        tangYue: '中规中矩的表现，达到了年级平均水平。还有提升空间。',
        muBai: '一般般吧，这种水平在尖子班只能算垫底。',
        crowd: 'B级，还不错。'
    },
    C: {
        tangYue: '勉强及格了，但你的魔法控制力还需要加强。课后多练习。',
        muBai: '这种水平也敢来参加考核？',
        crowd: 'C级...刚好及格。'
    },
    D: {
        tangYue: '很遗憾，你没有通过考核。不要灰心，下个月还有补考机会。',
        muBai: '连考核都通不过，真是浪费时间。',
        crowd: 'D级...这也太差了吧。'
    }
};

/**
 * 根据分数获取评分等级
 */
export function getGrade(score) {
    for (const grade of ['S', 'A', 'B', 'C', 'D']) {
        if (score >= EXAM_GRADES[grade].minScore) {
            return grade;
        }
    }
    return 'D';
}

// 向后兼容
if (typeof window !== 'undefined') {
    window.EXAM_STRATEGIES = EXAM_STRATEGIES;
    window.EXAM_GRADES = EXAM_GRADES;
    window.EXAM_REWARDS = EXAM_REWARDS;
    window.EXAM_DIALOGUES = EXAM_DIALOGUES;
    window.getGrade = getGrade;
}
