/**
 * 警戒等级数据
 * v3.15.0 新增
 * 基于博城篇第91-93章原文
 */

export const AlertLevels = {
    normal: {
        id: 'normal',
        name: '正常',
        description: '城市正常状态，无妖魔威胁',
        signal: 0,
        color: '#4caf50',
        effects: {
            enemySpawnRate: 1.0,
            npcBehavior: 'normal',
            shopOpen: true,
            locationLock: [],
            bigEventTrigger: null
        }
    },
    orange: {
        id: 'orange',
        name: '橙色警戒',
        description: '三百只以上妖魔出没，一道光耀信号',
        signal: 1,
        color: '#ff9800',
        effects: {
            enemySpawnRate: 1.5,
            npcBehavior: 'cautious',
            shopOpen: false,
            locationLock: [],
            bigEventTrigger: null
        }
    },
    blue: {
        id: 'blue',
        name: '蓝色警戒',
        description: '妖魔流窜，两道耀光，城市部分区域受威胁',
        signal: 2,
        color: '#2196f3',
        effects: {
            enemySpawnRate: 2.0,
            npcBehavior: 'nervous',
            shopOpen: false,
            locationLock: ['xuefeng_mountain'],
            bigEventTrigger: null
        }
    },
    blood: {
        id: 'blood',
        name: '血色警戒',
        description: '上千只妖魔，城市毁灭级灾难，紧急警报',
        signal: 'emergency',
        color: '#f44336',
        effects: {
            enemySpawnRate: 5.0,
            npcBehavior: 'panic',
            shopOpen: false,
            locationLock: ['xuefeng_mountain', 'city_street'],
            bigEventTrigger: 'bo_city_disaster'
        }
    }
};

// 警戒等级变化规则
export const AlertLevelRules = {
    // 升级条件
    upgrade: {
        'normal_to_orange': { enemyCount: 300, description: '妖魔数量达到300只' },
        'orange_to_blue': { enemyCount: 500, description: '妖魔流窜到城市区域' },
        'blue_to_blood': { enemyCount: 1000, description: '妖魔数量达到1000只，城市毁灭级' }
    },
    // 降级条件
    downgrade: {
        'blood_to_blue': { enemyCount: 800, description: '妖魔数量下降到800以下' },
        'blue_to_orange': { enemyCount: 300, description: '妖魔数量下降到300以下' },
        'orange_to_normal': { enemyCount: 0, description: '妖魔清除完毕' }
    }
};

// 光耀信号
export const LightSignal = {
    description: '光法师初阶技能，类似信号弹，妖魔对光无感知，眼睛注视会灼伤，科技设备会暴露位置所以光耀是安全方式',
    levels: {
        1: { name: '一道光耀', alertLevel: 'orange', description: '橙色警戒' },
        2: { name: '两道光耀', alertLevel: 'blue', description: '蓝色警戒' },
        'emergency': { name: '紧急警报', alertLevel: 'blood', description: '血色警戒' }
    }
};
