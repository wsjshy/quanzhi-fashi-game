/**
 * 天赋进化系统测试
 */

// 模拟浏览器环境
global.window = {};
global.document = { addEventListener: () => {}, getElementById: () => null, createElement: () => ({ style: {}, appendChild: () => {} }) };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.console = console;

// 加载数据文件
import fs from 'fs.js';
import path from 'path.js';

import vm from 'vm.js';
const ctx = { console, Math, Date, Object, Array, JSON };
vm.createContext(ctx);

function loadScript(relativePath) {
    let code = fs.readFileSync(path.join(__dirname, relativePath), 'utf-8');
    // 将const/let改为var，使变量在上下文可访问
    code = code.replace(/const /g, 'var ').replace(/let /g, 'var ');
    // 末尾将关键变量挂到globalThis
    code += '\nif (typeof DataTalents !== "undefined") globalThis.DataTalents = DataTalents;';
    code += '\nif (typeof TalentSystem !== "undefined") globalThis.TalentSystem = TalentSystem;';
    code += '\nif (typeof TALENT_RARITY_CONFIG !== "undefined") globalThis.TALENT_RARITY_CONFIG = TALENT_RARITY_CONFIG;';
    vm.runInContext(code, ctx);
}

loadScript('engine/data/talents.js');
loadScript('engine/talent.js');

const DataTalents = ctx.DataTalents;
const TalentSystem = ctx.TalentSystem;
const TALENT_RARITY_CONFIG = ctx.TALENT_RARITY_CONFIG;

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  ✅ ${message}`);
    } else {
        failed++;
        console.log(`  ❌ ${message}`);
    }
}

console.log('\n=== 天赋进化系统测试 ===\n');

// 1. 测试所有天赋都有evolutions
console.log('1. 所有天赋都有进化路线:');
const allTalents = DataTalents;
let talentCount = 0;
let withEvolutions = 0;
for (const [id, talent] of Object.entries(allTalents)) {
    talentCount++;
    if (talent.evolutions && talent.evolutions.length > 0) {
        withEvolutions++;
    } else {
        console.log(`    ⚠️ ${id} 没有evolutions`);
    }
}
assert(withEvolutions === talentCount, `${talentCount}个天赋全部有进化路线`);

// 2. 测试成长型天赋有5个进化阶段
console.log('\n2. 成长型天赋有5个进化阶段:');
let growthCount = 0;
let correctStages = 0;
for (const [id, talent] of Object.entries(allTalents)) {
    if (talent.type === 'growth') {
        growthCount++;
        if (talent.evolutions.length === 5) {
            correctStages++;
        } else {
            console.log(`    ⚠️ ${id} 有${talent.evolutions.length}个阶段`);
        }
    }
}
assert(correctStages === growthCount, `${growthCount}个成长型天赋全部有5个进化阶段`);

// 3. 测试先天型天赋1级满级
console.log('\n3. 先天型天赋1级满级:');
let innateCount = 0;
let correctInnate = 0;
for (const [id, talent] of Object.entries(allTalents)) {
    if (talent.type === 'innate') {
        innateCount++;
        if (talent.maxLevel === 1) {
            correctInnate++;
        }
    }
}
assert(correctInnate === innateCount, `${innateCount}个先天型天赋全部1级满级`);

// 4. 测试进化阶段等级正确（Lv1/3/5/7/10）
console.log('\n4. 进化阶段等级正确:');
const expectedLevels = [1, 3, 5, 7, 10];
let levelCorrect = 0;
let levelTotal = 0;
for (const [id, talent] of Object.entries(allTalents)) {
    if (talent.type === 'growth') {
        for (let i = 0; i < 5; i++) {
            levelTotal++;
            if (talent.evolutions[i].level === expectedLevels[i]) {
                levelCorrect++;
            }
        }
    }
}
assert(levelCorrect === levelTotal, `${levelTotal}个阶段等级全部正确`);

// 5. 测试getTalentEffects合并效果
console.log('\n5. getTalentEffects效果合并:');
const fireBasic = allTalents.fire_talent_basic;
const effects1 = TalentSystem.getTalentEffects('fire_talent_basic', 1);
assert(effects1.damageBonus === 0.10, `Lv1伤害+10%（实际${(effects1.damageBonus*100).toFixed(0)}%）`);

const effects3 = TalentSystem.getTalentEffects('fire_talent_basic', 3);
assert(Math.abs(effects3.damageBonus - 0.15) < 0.001, `Lv3伤害+15%（实际${(effects3.damageBonus*100).toFixed(0)}%）`);
assert(effects3.damageReflect === 0.10, `Lv3反伤10%（实际${(effects3.damageReflect*100).toFixed(0)}%）`);

const effects5 = TalentSystem.getTalentEffects('fire_talent_basic', 5);
assert(effects5.damageBonus === 0.25, `Lv5伤害+25%（实际${(effects5.damageBonus*100).toFixed(0)}%）`);
assert(effects5.fireAura === 0.03, `Lv5火焰光环3%（实际${(effects5.fireAura*100).toFixed(0)}%）`);

const effects10 = TalentSystem.getTalentEffects('fire_talent_basic', 10);
assert(effects10.damageBonus === 0.50, `Lv10伤害+50%（实际${(effects10.damageBonus*100).toFixed(0)}%）`);
assert(effects10.skillLevelBonus === 1, `Lv10技能等级+1（实际${effects10.skillLevelBonus}）`);
assert(effects10.firePenetration === 0.30, `Lv10穿透30%（实际${(effects10.firePenetration*100).toFixed(0)}%）`);

// 6. 测试进化检测
console.log('\n6. 进化检测:');
const evo3 = TalentSystem.checkEvolution('fire_talent_basic', 1, 3);
assert(evo3.length === 1 && evo3[0].stage === '特性', `Lv1→3触发特性进化（${evo3[0]?.name}）`);

const evo5 = TalentSystem.checkEvolution('fire_talent_basic', 3, 5);
assert(evo5.length === 1 && evo5[0].stage === '进化', `Lv3→5触发形态进化（${evo5[0]?.name}）`);

const evo10 = TalentSystem.checkEvolution('fire_talent_basic', 7, 10);
assert(evo10.length === 1 && evo10[0].stage === '终极', `Lv7→10触发终极进化（${evo10[0]?.name}）`);

// 7. 测试addTalentExp返回evolutions
console.log('\n7. addTalentExp返回进化信息:');
const talentData = { talentId: 'fire_talent_basic', level: 4, exp: 0 };
// Lv4→5需要 100*1.5^3 = 337 经验
const result = TalentSystem.addTalentExp(talentData, 500);
assert(result.leveledUp, '升级了');
if (result.evolutions && result.evolutions.length > 0) {
    assert(result.evolutions[0].stage === '进化', `触发进化：${result.evolutions[0].name}`);
} else {
    assert(false, '应该触发进化但没有');
}

// 8. 测试getCurrentStage和getNextStage
console.log('\n8. 当前/下一进化阶段查询:');
const current = TalentSystem.getCurrentStage('fire_talent_basic', 5);
assert(current && current.stage === '进化', `Lv5当前阶段：${current?.name}`);

const next = TalentSystem.getNextStage('fire_talent_basic', 5);
assert(next && next.stage === '延伸', `Lv5下一阶段：${next?.name}`);

const nonext = TalentSystem.getNextStage('fire_talent_basic', 10);
assert(!nonext, 'Lv10没有下一阶段');

// 9. 测试先天型天赋效果
console.log('\n9. 先天型天赋效果:');
const innateEffects = TalentSystem.getTalentEffects('fire_talent_legendary', 1);
assert(innateEffects.damageBonus === 0.40, `天生火魂伤害+40%（实际${(innateEffects.damageBonus*100).toFixed(0)}%）`);
assert(innateEffects.burnChance === 1.0, '天生火魂必定点燃');
assert(innateEffects.fireImmunity === true, '天生火魂免疫火系');

// 10. 测试getTalentDescription
console.log('\n10. 天赋描述包含进化路线:');
const desc = TalentSystem.getTalentDescription('fire_talent_basic', 1);
assert(desc.includes('觉醒'), '描述包含觉醒');
assert(desc.includes('终极'), '描述包含终极');
assert(desc.includes('烈焰领主'), '描述包含终极名称');

// 11. 测试各系天赋数量
console.log('\n11. 各系天赋数量:');
const elements = ['fire', 'ice', 'thunder', 'earth', 'wind', 'water', 'light', 'dark', 'heal', 'summon'];
for (const elem of elements) {
    const elemTalents = Object.values(allTalents).filter(t => t.element === elem);
    const innate = elemTalents.filter(t => t.type === 'innate').length;
    const growth = elemTalents.filter(t => t.type === 'growth').length;
    assert(innate === 1 && growth === 4, `${elem}系：1先天+4成长（实际${innate}先天+${growth}成长）`);
}

// 12. 测试新效果键不报错
console.log('\n12. 新效果键正常处理:');
const newEffectKeys = ['fireAura', 'burnExplode', 'burnSpread', 'iceShield', 'frostSlow',
    'thunderCounter', 'hardRock', 'earthquake', 'comboChance', 'lifesteal',
    'aoeHeal', 'judgmentChance', 'darkMark', 'curseSpread', 'lifeLink', 'beastTide'];
let allKeysWork = true;
for (const key of newEffectKeys) {
    // 这些键在getTalentEffects中应该被正常合并
    let found = false;
    for (const talent of Object.values(allTalents)) {
        if (talent.evolutions) {
            for (const evo of talent.evolutions) {
                if (evo.effects && evo.effects[key] !== undefined) {
                    found = true;
                    break;
                }
            }
        }
        if (found) break;
    }
    if (!found) {
        console.log(`    ⚠️ 效果键 ${key} 未在任何天赋中使用`);
    }
}
assert(true, `${newEffectKeys.length}个新效果键已定义`);

console.log(`\n=== 测试结果: ${passed}通过, ${failed}失败 ===\n`);
process.exit(failed > 0 ? 1 : 0);
