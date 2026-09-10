/**
 * 先锋小队数据
 * v3.15.0 新增
 * 基于博城篇第93-96章原文
 * 学校撤离的先头部队，10人组成
 */

export const VanguardTeam = {
    id: 'vanguard_team',
    name: '先锋小队',
    description: '学校撤离的先头部队，10人组成，负责探路和先头抵抗，为大部队撤离争取时间',
    triggerEvent: 'bo_city_disaster_evacuation',
    members: [
        {
            id: 'xue_musheng',
            name: '薛木生',
            role: '领队',
            element: 'light',
            elementName: '光系',
            skill: '光耀·失明',
            description: '从过军，对人员调配和队形保持有经验，光系法师，班主任',
            personality: '冷静、果断、有经验',
            status: 'alive',
            dialogueTree: 'xue_musheng_vanguard',
            combatRole: 'support'
        },
        {
            id: 'xu_zhaoting',
            name: '许昭霆',
            role: '雷系输出',
            element: 'thunder',
            elementName: '雷系',
            skill: '雷印·狂策',
            description: '有胆识，雷系法师，年度考核表现优秀',
            personality: '勇敢、冲动、有胆识',
            status: 'alive',
            dialogueTree: 'xu_zhaoting_vanguard',
            combatRole: 'dps'
        },
        {
            id: 'zhou_min',
            name: '周敏',
            role: '火系输出',
            element: 'fire',
            elementName: '火系',
            skill: '火滋·焚骨',
            description: '有胆识，火系法师，年度考核表现优秀',
            personality: '勇敢、细心、有胆识',
            status: 'alive',
            dialogueTree: 'zhou_min_vanguard',
            combatRole: 'dps'
        },
        {
            id: 'mu_bai',
            name: '穆白',
            role: '冰系控制',
            element: 'ice',
            elementName: '冰系',
            skill: '冰蔓·覆盖',
            description: '穆氏家族，十八岁生日叔叔送的斩魔具乌冰斩，年度考核全校第一',
            personality: '高傲、冷静、有实力',
            status: 'alive',
            dialogueTree: 'mu_bai_vanguard',
            combatRole: 'control',
            specialItem: '斩魔具·乌冰斩'
        },
        {
            id: 'he_yu',
            name: '何雨',
            role: '水系防御',
            element: 'water',
            elementName: '水系',
            skill: '水御',
            description: '年度考核扮猪吃老虎A级，灾难中吓傻，最后为保护张小侯释放水御牺牲',
            personality: '低调、胆小、关键时刻勇敢',
            status: 'alive',
            dialogueTree: 'he_yu_vanguard',
            combatRole: 'support',
            deathEvent: 'he_yu_sacrifice'
        },
        {
            id: 'wang_sanpang',
            name: '王三胖',
            role: '土系防御',
            element: 'earth',
            elementName: '土系',
            skill: '地波',
            description: '许昭霆好基友，土系法师，被巨眼猩鼠咬伤肩头',
            personality: '憨厚、忠诚、有力气',
            status: 'alive',
            dialogueTree: 'wang_sanpang_vanguard',
            combatRole: 'tank',
            injuryEvent: 'wang_sanpang_injured'
        },
        {
            id: 'zhang_xiaohou',
            name: '张小侯',
            role: '风系探路',
            element: 'wind',
            elementName: '风系',
            skill: '风轨·闪步',
            description: '莫凡好兄弟，风系法师，探路，何雨牺牲后立志变强',
            personality: '活泼、忠诚、勇敢',
            status: 'alive',
            dialogueTree: 'zhang_xiaohou_vanguard',
            combatRole: 'scout'
        },
        {
            id: 'zhang_yinglu',
            name: '张英璐',
            role: '风系探路',
            element: 'wind',
            elementName: '风系',
            skill: '风轨·疾行',
            description: '风系法师，负责探路，穿越明园小区时被巨眼猩鼠偷袭咬断脖子牺牲',
            personality: '细心、谨慎、负责',
            status: 'alive',
            dialogueTree: 'zhang_yinglu_vanguard',
            combatRole: 'scout',
            deathEvent: 'zhang_yinglu_sacrifice'
        },
        {
            id: 'li_ming',
            name: '李明',
            role: '火系输出',
            element: 'fire',
            elementName: '火系',
            skill: '火滋·灼烧',
            description: '火系法师，先锋小队成员',
            personality: '普通、听话',
            status: 'alive',
            dialogueTree: null,
            combatRole: 'dps'
        },
        {
            id: 'zhao_wei',
            name: '赵伟',
            role: '土系防御',
            element: 'earth',
            elementName: '土系',
            skill: '地波·挪移',
            description: '土系法师，先锋小队成员',
            personality: '普通、听话',
            status: 'alive',
            dialogueTree: null,
            combatRole: 'tank'
        }
    ],
    // 小队状态
    teamStatus: {
        currentPhase: 'idle', // idle / exploring / battling / retreating / arrived
        morale: 100, // 士气 0-100
        casualties: 0, // 伤亡人数
        injuredCount: 0, // 受伤人数
        currentLocation: 'tianlan_school', // 当前位置
        evacuationProgress: 0 // 撤离进度 0-100
    },
    // 撤离路线
    evacuationRoute: [
        { id: 'tianlan_school', name: '天澜魔法高中', description: '撤离起点，紧急集合' },
        { id: 'mingyuan_residential', name: '明园小区', description: '高档电梯住户楼，abdc四个区，接近一公里，水池飘着保安尸体，张英璐牺牲地' },
        { id: 'meixin_viaduct', name: '美鑫高架桥', description: '从安全结界到铭文区的最大捷径，被凌乱汽车塞满，有塌方' },
        { id: 'safe_zone', name: '安全结界', description: '魔法协会和猎者联盟共同设立，有魔法师守护，大结界保护，撤离终点' }
    ],
    // 士气影响因素
    moraleEffects: {
        battleVictory: 10, // 战斗胜利+10
        battleDefeat: -15, // 战斗失败-15
        casualty: -20, // 有人牺牲-20
        injury: -5, // 有人受伤-5
        playerHelp: 15, // 玩家帮助+15
        safeArrival: 20, // 安全到达+20
        leaderInspiration: 10 // 领队鼓舞+10
    }
};
