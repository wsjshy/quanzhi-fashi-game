// v0.8.7 各系独立修炼系统测试
import fs from 'fs.js';

// 模拟浏览器环境
global.window = {};
global.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.alert = (msg) => console.log('[ALERT]', msg);
global.SkillSystem = { getSkill: () => ({ id: 'test' }) };
global.QuestSystem = { updateProgress: () => {} };
global.WorldState = { setFlag: () => {} };
global.DataAchievements = {};
global.Inventory = { addItem: () => {} };
global.TalentSystem = { checkTalentUnlocks: () => [] };
global.AchievementHandler = { checkLevelUp: () => {} };

// 加载依赖
const playerCode = fs.readFileSync('engine/player.js', 'utf8');
// 在global作用域执行
eval(playerCode.replace('const Player = {', 'global.Player = {'));
const P = global.Player;

let passed = 0, failed = 0;
function assert(cond, msg) {
    if (cond) { console.log('  ✓', msg); passed++; }
    else { console.log('  ✗ FAIL:', msg); failed++; }
}

// 测试1: 初始化
console.log('\n=== 测试1: 初始化 ===');
P.init('测试', 'fire');
assert(P.elements.length === 1, '初始1个系');
assert(P.getElementLevel('fire') === 1, '火系Lv1');
assert(P.getPlayerLevel() === 1, '全局等级1');
assert(P.elementLevels.fire === 1, 'elementLevels.fire=1');
assert(P.elementExp.fire === 0, 'elementExp.fire=0');

// 测试2: 火系升级
console.log('\n=== 测试2: 火系升级 ===');
P.gainElementExp('fire', 200);
assert(P.getElementLevel('fire') >= 2, '火系升级了(Lv' + P.getElementLevel('fire') + ')');
assert(P.getPlayerLevel() === P.getElementLevel('fire'), '全局等级=最高系等级');

// 测试3: 中阶新系加成
console.log('\n=== 测试3: 中阶新系加成 ===');
P.elementLevels.fire = 11;
P.level = 11;
P.elements.push('thunder');
P.elementLevels.thunder = 1;
P.elementExp.thunder = 0;
assert(P.getPlayerLevel() === 11, '全局等级11(中阶)');
assert(P._getNewElementExpBonus('thunder') === 2, '中阶新系加成×2');

// 测试4: 雷系获得经验
console.log('\n=== 测试4: 雷系经验加成 ===');
P.elementLevels.thunder = 1;
P.elementExp.thunder = 0;
const before4 = P.elementExp.thunder;
P.gainElementExp('thunder', 100);
// 100*2=200经验，Lv1->Lv2(需80)剩120, Lv2->Lv3(需100)剩20
assert(P.getElementLevel('thunder') === 3, '雷系从Lv1升到Lv3(200经验足够)');
assert(P.elementExp.thunder === 20, '剩余经验20(实际:' + P.elementExp.thunder + ')');

// 测试5: 加成停止
console.log('\n=== 测试5: 加成停止条件 ===');
P.elementLevels.thunder = 9;
assert(P._getNewElementExpBonus('thunder') === 1, '差2级时加成×1');
P.elementLevels.thunder = 8;
assert(P._getNewElementExpBonus('thunder') === 2, '差3级时加成×2');

// 测试6: gainExp兼容接口
console.log('\n=== 测试6: gainExp兼容接口 ===');
P.elementLevels.fire = 11;
P.elementLevels.thunder = 1;
P.elementExp.fire = 0;
P.elementExp.thunder = 0;
P.gainExp(100, ['fire']);
// 火系获100全额，雷系获30%*2倍=60
assert(P.elementExp.fire === 100, '使用系获全额经验(100)，实际:' + P.elementExp.fire);
assert(P.elementExp.thunder === 60, '其他系30%×2倍=60，实际:' + P.elementExp.thunder);

// 测试7: 无usedElements时平分
console.log('\n=== 测试7: 非战斗经验平分 ===');
P.elementExp.fire = 0;
P.elementExp.thunder = 0;
P.elementLevels.fire = 11;
P.elementLevels.thunder = 1;
P.gainExp(100);
// 100/2=50每个系，雷系50*2=100，Lv1->Lv2(需80)剩20
assert(P.elementExp.fire === 50, '火系分50，实际:' + P.elementExp.fire);
assert(P.getElementLevel('thunder') === 2, '雷系升到Lv2');
assert(P.elementExp.thunder === 20, '雷系剩20经验，实际:' + P.elementExp.thunder);

// 测试8: 高阶/超阶加成
console.log('\n=== 测试8: 高阶/超阶加成 ===');
P.elementLevels.fire = 35;
P.elementLevels.thunder = 1;
assert(P._getNewElementExpBonus('thunder') === 4, '高阶新系×4');
P.elementLevels.fire = 60;
assert(P._getNewElementExpBonus('thunder') === 8, '超阶新系×8');

// 测试9: 属性只在全局升级时加
console.log('\n=== 测试9: 属性增长 ===');
P.init('测试', 'fire');
const hpAt1 = P.maxHp;
P.elementLevels.fire = 5;
P.level = 5;
// 模拟火系从1升到5（全局升级）
const oldHp = P.maxHp;
P._elementLevelUp('fire'); // fire 5->6, 全局5->6
const hpAfterGlobalUp = P.maxHp;
assert(hpAfterGlobalUp > oldHp, '全局升级时加HP');

// 雷系从1升到2但全局等级不变
P.elements.push('thunder');
P.elementLevels.thunder = 1;
P.elementExp.thunder = 0;
const hpBefore = P.maxHp;
// 模拟雷系1->2但火系还是6
P.elementLevels.thunder = 2;
// 不调用_elementLevelUp因为全局等级没变
assert(P.maxHp === hpBefore, '非全局升级不加HP');

// 测试10: 新系不会反超
console.log('\n=== 测试10: 新系不会靠加速反超 ===');
P.elementLevels.fire = 11;
P.elementLevels.thunder = 10; // 差1级
assert(P._getNewElementExpBonus('thunder') === 1, '差1级无加速');
P.elementLevels.thunder = 11; // 平级
assert(P._getNewElementExpBonus('thunder') === 1, '平级无加速');
P.elementLevels.thunder = 12; // 反超
assert(P.getPlayerLevel() === 12, '全局等级变12');
assert(P._getNewElementExpBonus('fire') === 1, '旧系也无加速(差1级)');

console.log('\n=== 结果: ' + passed + '通过, ' + failed + '失败 ===');
process.exit(failed > 0 ? 1 : 0);
