/**
 * L2.6 双天赋装备系统测试
 *
 * 覆盖：主修系/副修系设置、效果比例、跨系组合检测
 *
 * 运行：node tests/run.js
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { TestResult } from '../utils.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadPlayerSystem() {
    const playerCode = fs.readFileSync(path.join(__dirname, '..', '..', 'engine', 'player.js'), 'utf-8');
    const code = playerCode.replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');

    const sandbox = {
        console: { log: () => {}, warn: () => {}, error: () => {} },
        Math: Math,
        Date: Date,
        SkillSystem: {
            getSkill: (id) => ({ id, name: id, element: 'fire', tier: '初阶' }),
            getSkillsByElement: () => [],
            getElementColor: () => '#ff6644',
            getElementName: (e) => e
        },
        TalentSystem: {
            getTalent: (id) => ({ id, name: id, rarity: 'common', maxLevel: 10, effects: { damageBonus: 0.1 } }),
            getTalentEffects: () => ({ damageBonus: 0.1 }),
            getRarityConfig: () => ({ color: '#888' }),
            getCurrentStage: () => null,
            getNextStage: () => null,
            getExpToNextLevel: () => 100,
            initTalentForElement: (elem) => ({ talentId: elem + '_talent', level: 1, exp: 0 }),
            addTalentExp: () => ({ leveledUp: false, newLevel: 1, newExp: 0 })
        },
        InnateTalentSystem: { getTalentDisplay: () => null },
        Inventory: { getAllItems: () => [], getItem: () => null },
        DataItems: {},
        DataSkills: {},
        DataTalents: {},
        DataInnateTalents: {},
        WorldState: {},
        DataAchievements: {},
        localStorage: { getItem: () => null, setItem: () => {} }
    };

    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox;
}

function assertEq(result, actual, expected, msg) {
    if (actual === expected) {
        result.pass(msg);
    } else {
        result.fail(`${msg}: 期望${expected}, 实际${actual}`);
    }
}

function assertTrue(result, condition, msg) {
    if (condition) {
        result.pass(msg);
    } else {
        result.fail(`${msg}: 条件不成立`);
    }
}

function runTests() {
    const result = new TestResult('L2.6 双天赋装备系统测试');
    let sandbox;
    try {
        sandbox = loadPlayerSystem();
    } catch (e) {
        result.fail('加载Player系统失败: ' + e.message);
        return result;
    }
    const Player = sandbox.Player;

    // 初始化玩家
    Player.elements = ['fire', 'wind', 'ice'];
    Player.talents = {
        fire: { talentId: 'fire_talent', level: 5, exp: 0 },
        wind: { talentId: 'wind_talent', level: 3, exp: 0 },
        ice: { talentId: 'ice_talent', level: 1, exp: 0 }
    };
    Player.primaryElement = null;
    Player.secondaryElement = null;

    console.log('\n1️⃣  主修系/副修系设置');
    console.log('────────────────────────────────────────');

    // 1. 设置主修系
    const s1 = Player.setPrimaryElement('fire');
    assertTrue(result, s1 === true, '设置主修系应返回true');
    assertEq(result, Player.primaryElement, 'fire', '主修系应为fire');

    // 2. 设置副修系
    const s2 = Player.setSecondaryElement('wind');
    assertTrue(result, s2 === true, '设置副修系应返回true');
    assertEq(result, Player.secondaryElement, 'wind', '副修系应为wind');

    // 3. 副修系不能与主修系相同
    const s3 = Player.setSecondaryElement('fire');
    assertTrue(result, s3 === false, '设置相同系别为副修应返回false');

    // 4. 设置主修系时如果与副修系相同，清空副修系
    Player.setPrimaryElement('wind');
    assertEq(result, Player.secondaryElement, null, '副修系应被清空');
    // 恢复
    Player.setPrimaryElement('fire');
    Player.setSecondaryElement('wind');

    console.log('\n2️⃣  跨系组合检测');
    console.log('────────────────────────────────────────');

    // 5. 火+风跨系组合
    const combo1 = Player.getCrossElementCombo();
    assertTrue(result, combo1 !== null, '火+风应检测到跨系组合');
    assertEq(result, combo1.name, '火焰风暴', '组合名称应为火焰风暴');

    // 6. 火+冰组合
    Player.setSecondaryElement('ice');
    const combo2 = Player.getCrossElementCombo();
    assertTrue(result, combo2 !== null, '火+冰应有组合');
    assertEq(result, combo2.name, '融化', '组合名称应为融化');

    // 7. 只有主修系时无组合
    Player.setSecondaryElement(null);
    const combo3 = Player.getCrossElementCombo();
    assertTrue(result, combo3 === null, '只有主修系时应无组合');

    console.log('\n3️⃣  效果比例验证');
    console.log('────────────────────────────────────────');

    // 8. 主修系效果100%
    Player.primaryElement = 'fire';
    Player.secondaryElement = null;
    const effects1 = Player.getAllTalentEffects();
    assertTrue(result, effects1.damageBonus >= 0.09, '主修系效果应接近0.1');

    // 9. 三系效果叠加（主修100%+副修70%+其他50%）
    Player.primaryElement = 'fire';
    Player.secondaryElement = 'wind';
    const effects2 = Player.getAllTalentEffects();
    // 0.1*1.0 + 0.1*0.7 + 0.1*0.5 = 0.22
    assertTrue(result, effects2.damageBonus > 0.2, '三系效果叠加应大于0.2');

    console.log('\n4️⃣  边界情况');
    console.log('────────────────────────────────────────');

    // 10. 未觉醒的系不能设为主修
    const s4 = Player.setPrimaryElement('thunder');
    assertTrue(result, s4 === false, '未觉醒的系不能设为主修');

    return result.report();
}

export { runTests };
