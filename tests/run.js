/**
 * 全职法师游戏 - 统一测试运行器
 * 
 * 运行所有无浏览器测试（L1-L3）
 * 
 * 用法：
 *   node tests/run.js          # 运行所有测试
 *   node tests/run.js l1       # 只运行L1数据完整性测试
 *   node tests/run.js l2       # 只运行L2函数逻辑测试
 *   node tests/run.js l3       # 只运行L3 UI渲染测试
 */

const { runDataIntegrityTests } = require('./unit/data-integrity');
const { runBattleLogicTests } = require('./unit/battle-logic');
const { runProgressionTests } = require('./unit/progression');

const TESTS = {
    l1: {
        name: 'L1 数据完整性测试',
        run: runDataIntegrityTests,
        description: '零依赖，检查ID唯一性、引用完整性、必填字段、数值合理性'
    },
    l2: {
        name: 'L2 战斗逻辑单元测试',
        run: runBattleLogicTests,
        description: '纯函数测试，元素克制、伤害计算、引导时间、状态效果'
    },
    l3: {
        name: 'L3 成长流程测试',
        run: runProgressionTests,
        description: '轻量状态机测试，经验值计算、升级逻辑、属性成长'
    }
};

function main() {
    const args = process.argv.slice(2);
    const filter = args[0] ? args[0].toLowerCase() : null;
    
    console.log('\n🧪 全职法师游戏 - 无浏览器测试体系');
    console.log('═'.repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    const startTime = Date.now();
    
    for (const [key, test] of Object.entries(TESTS)) {
        if (filter && filter !== key && filter !== 'all') continue;
        
        console.log(`\n📋 ${test.name}`);
        console.log(`   ${test.description}`);
        
        try {
            const report = test.run();
            totalPassed += report.passed;
            totalFailed += report.failed;
            totalWarnings += report.warnings;
        } catch (e) {
            console.error(`\n❌ ${test.name} 执行出错: ${e.message}`);
            console.error(e.stack);
            totalFailed++;
        }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '═'.repeat(60));
    console.log(`🏁 总计: ${totalPassed}通过, ${totalFailed}失败, ${totalWarnings}警告 (${elapsed}s)`);
    console.log('═'.repeat(60));
    
    process.exit(totalFailed > 0 ? 1 : 0);
}

main();
