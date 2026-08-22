/**
 * L2.5 天赋战斗状态系统单元测试
 *
 * 测试：资源积累/消耗、形态切换、触发状态、主动技能冷却
 *
 * 运行：node tests/unit/talent-combat.js
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { TestResult } from '../utils.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTalentCombatSystem() {
    let code = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'engine', 'talent-combat.js'), 'utf-8');
    // 处理ES Modules语法
    code = code.replace(/^import\s+.*$/gm, '');
    code = code.replace(/^export\s+default\s+.*$/gm, '');
    code = code.replace(/^export\s+const\s+(\w+)\s*=/gm, 'var $1 =');
    code = code.replace(/^export\s+function\s+(\w+)/gm, 'function $1');
    code = code.replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');
    code = code.replace(/if\s*\(typeof\s+window\s*!==\s*'undefined'\)[\s\S]*?\}/g, '');
    const sandbox = {
        console: console,
        Math: Math,
        module: { exports: {} }
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox.module.exports || sandbox.TalentCombatSystem;
}

function assertEq(result, actual, expected, msg) {
    if (actual === expected) {
        result.pass(msg);
    } else {
        result.fail(`${msg}: 期望${expected}, 实际${actual}`);
    }
}

function runTests() {
    const result = new TestResult('天赋战斗状态系统');
    const TCS = loadTalentCombatSystem();

    if (!TCS) {
        result.fail('加载天赋战斗状态系统失败');
        return result;
    }

    console.log('\n1️⃣  初始化测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.init({ talents: [] });
        assertEq(result, TCS.state !== null, true, '初始化后state不为null');
        assertEq(result, TCS.state.fireEnergy, 0, '初始化燃点为0');
        assertEq(result, TCS.state.thunderEnergy, 0, '初始化电荷为0');
        assertEq(result, TCS.state.earthEnergy, 0, '初始化岩力为0');
        assertEq(result, TCS.state.waterForm, 'tide', '初始化水系为涨潮形态');
        assertEq(result, TCS.state.lightForm, 'holy', '初始化光系为圣光形态');
    } catch (e) {
        result.fail('初始化测试异常: ' + e.message);
    }

    console.log('\n2️⃣  资源积累测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.state.fireEnergy = 0;
        const reachedMax = TCS.addEnergy('fire', 5, 10);
        assertEq(result, TCS.state.fireEnergy, 5, '燃点+5后为5');
        assertEq(result, reachedMax, false, '未达到上限时返回false');

        const reachedMax2 = TCS.addEnergy('fire', 6, 10);
        assertEq(result, TCS.state.fireEnergy, 10, '燃点+6后为10（上限截断）');
        assertEq(result, reachedMax2, true, '达到上限时返回true');
    } catch (e) {
        result.fail('资源积累测试异常: ' + e.message);
    }

    console.log('\n3️⃣  资源消耗测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.state.fireEnergy = 8;
        const success = TCS.consumeEnergy('fire', 5);
        assertEq(result, success, true, '消耗5燃点成功');
        assertEq(result, TCS.state.fireEnergy, 3, '消耗后燃点为3');

        const fail = TCS.consumeEnergy('fire', 10);
        assertEq(result, fail, false, '资源不足时消耗失败');
        assertEq(result, TCS.state.fireEnergy, 3, '消耗失败后燃点不变');
    } catch (e) {
        result.fail('资源消耗测试异常: ' + e.message);
    }

    console.log('\n4️⃣  形态切换测试（潮汐自动切换）');
    console.log('────────────────────────────────────────');
    try {
        TCS.state.turnCount = 0;
        TCS.state.waterForm = 'tide';
        TCS.onTurnStart(); // turnCount=1，不切换
        assertEq(result, TCS.state.waterForm, 'tide', '第1回合不切换形态');

        TCS.onTurnStart(); // turnCount=2，切换
        assertEq(result, TCS.state.waterForm, 'ebb', '第2回合切换为退潮');

        TCS.onTurnStart(); // turnCount=3，不切换
        assertEq(result, TCS.state.waterForm, 'ebb', '第3回合不切换形态');

        TCS.onTurnStart(); // turnCount=4，切换
        assertEq(result, TCS.state.waterForm, 'tide', '第4回合切换为涨潮');
    } catch (e) {
        result.fail('形态切换测试异常: ' + e.message);
    }

    console.log('\n5️⃣  光系形态手动切换测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.setLightForm('shield');
        assertEq(result, TCS.state.lightForm, 'shield', '切换为圣盾形态');
        assertEq(result, TCS.getLightForm(), 'shield', 'getLightForm返回shield');

        TCS.setLightForm('holy');
        assertEq(result, TCS.state.lightForm, 'holy', '切换为圣光形态');
    } catch (e) {
        result.fail('光系形态切换测试异常: ' + e.message);
    }

    console.log('\n6️⃣  疾风触发状态测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.state.windStreak = false;
        TCS.state.windStreakTurns = 0;
        TCS.triggerWindStreak(2);
        assertEq(result, TCS.state.windStreak, true, '触发疾风状态');
        assertEq(result, TCS.state.windStreakTurns, 2, '疾风持续2回合');
        assertEq(result, TCS.hasWindStreak(), true, 'hasWindStreak返回true');

        TCS.onTurnStart(); // 剩余1回合
        assertEq(result, TCS.state.windStreakTurns, 1, '1回合后剩余1回合');

        TCS.onTurnStart(); // 剩余0回合，状态消失
        assertEq(result, TCS.state.windStreak, false, '2回合后疾风状态消失');
    } catch (e) {
        result.fail('疾风触发状态测试异常: ' + e.message);
    }

    console.log('\n7️⃣  主动技能冷却测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.state.skillCooldowns = {};
        assertEq(result, TCS.canUseActiveSkill('test_skill'), true, '无冷却时可使用');

        TCS.useActiveSkill('test_skill', 3);
        assertEq(result, TCS.canUseActiveSkill('test_skill'), false, '使用后不可用');
        assertEq(result, TCS.getSkillCooldown('test_skill'), 3, '冷却为3回合');

        TCS.onTurnStart(); // 冷却2
        TCS.onTurnStart(); // 冷却1
        assertEq(result, TCS.canUseActiveSkill('test_skill'), false, '冷却1回合时仍不可用');

        TCS.onTurnStart(); // 冷却0
        assertEq(result, TCS.canUseActiveSkill('test_skill'), true, '冷却结束后可用');
    } catch (e) {
        result.fail('主动技能冷却测试异常: ' + e.message);
    }

    console.log('\n8️⃣  UI状态获取测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.state.fireEnergy = 7;
        TCS.state.waterForm = 'ebb';
        TCS.state.windStreak = true;
        const uiState = TCS.getStateForUI();
        assertEq(result, uiState.resources.fire, 7, 'UI状态燃点为7');
        assertEq(result, uiState.forms.water, 'ebb', 'UI状态水系为退潮');
        assertEq(result, uiState.triggers.windStreak, true, 'UI状态疾风为true');
    } catch (e) {
        result.fail('UI状态获取测试异常: ' + e.message);
    }

    console.log('\n9️⃣  清理测试');
    console.log('────────────────────────────────────────');
    try {
        TCS.cleanup();
        assertEq(result, TCS.state, null, '清理后state为null');
    } catch (e) {
        result.fail('清理测试异常: ' + e.message);
    }

    return result.report();
}

export { runTests };
