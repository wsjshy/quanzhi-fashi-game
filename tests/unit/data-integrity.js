/**
 * L1 数据完整性测试
 * 
 * 零依赖，纯Node.js运行
 * 检查：ID唯一性、引用完整性、必填字段
 * 
 * 运行：node tests/data-integrity.js
 */

const { loadAllData, TestResult } = require('../utils');

function runDataIntegrityTests() {
    console.log('\n📦 L1 数据完整性测试');
    console.log('─'.repeat(60));
    
    const result = new TestResult();
    const data = loadAllData();
    
    // ===== 1. ID唯一性检查 =====
    console.log('\n1️⃣  ID唯一性检查');
    console.log('─'.repeat(40));
    
    const idSets = {};
    for (const [key, dataObj] of Object.entries(data)) {
        if (typeof dataObj === 'object' && Object.keys(dataObj).length > 0) {
            idSets[key] = result.checkUniqueIds(dataObj, key);
        }
    }
    
    // ===== 2. 引用完整性检查 =====
    console.log('\n2️⃣  引用完整性检查');
    console.log('─'.repeat(40));
    
    // 2.1 妖魔引用的技能是否存在
    const enemySkillRefs = [];
    for (const [id, enemy] of Object.entries(data.enemies || {})) {
        if (enemy.skills && Array.isArray(enemy.skills)) {
            for (const skillId of enemy.skills) {
                enemySkillRefs.push(skillId);
            }
        }
    }
    result.checkReferences([...new Set(enemySkillRefs)], data.skills || {}, '技能', '妖魔');
    
    // 2.2 妖魔引用的元素是否有效
    const validElements = ['fire', 'water', 'wind', 'earth', 'lightning', 'thunder', 'light', 'dark', 'ice', 'shadow', 'nature', 'poison', 'sound', 'space', 'time', 'spirit', 'chaos', 'neutral', 'plant', 'heal', 'summon', 'curse', 'none', 'physical'];
    const invalidEnemyElements = [];
    for (const [id, enemy] of Object.entries(data.enemies || {})) {
        if (enemy.elements && Array.isArray(enemy.elements)) {
            for (const elem of enemy.elements) {
                if (!validElements.includes(elem)) {
                    invalidEnemyElements.push(`${id}:${elem}`);
                }
            }
        }
    }
    if (invalidEnemyElements.length === 0) {
        result.pass('妖魔: 元素类型全部有效');
    } else {
        result.fail(`妖魔: 无效元素类型: ${invalidEnemyElements.join(', ')}`);
    }
    
    // 2.3 技能引用的元素是否有效
    const invalidSkillElements = [];
    for (const [id, skill] of Object.entries(data.skills || {})) {
        if (skill.element && !validElements.includes(skill.element) && skill.element !== 'physical') {
            invalidSkillElements.push(`${id}:${skill.element}`);
        }
    }
    if (invalidSkillElements.length === 0) {
        result.pass('技能: 元素类型全部有效');
    } else {
        result.fail(`技能: 无效元素类型: ${invalidSkillElements.join(', ')}`);
    }
    
    // 2.4 商店引用的物品是否存在
    const shopItemRefs = [];
    for (const [id, shop] of Object.entries(data.shops || {})) {
        if (shop.items && Array.isArray(shop.items)) {
            for (const item of shop.items) {
                if (item.itemId) shopItemRefs.push(item.itemId);
            }
        }
    }
    result.checkReferences([...new Set(shopItemRefs)], data.items || {}, '物品', '商店');
    
    // 2.5 任务引用的物品/技能/妖魔是否存在
    const questItemRefs = [];
    const questEnemyRefs = [];
    const questSkillRefs = [];
    for (const [id, quest] of Object.entries(data.quests || {})) {
        // 奖励物品
        if (quest.rewards && quest.rewards.items) {
            for (const item of quest.rewards.items) {
                if (item.itemId) questItemRefs.push(item.itemId);
            }
        }
        // 目标妖魔
        if (quest.objectives && Array.isArray(quest.objectives)) {
            for (const obj of quest.objectives) {
                if (obj.enemyId && obj.enemyId !== 'any') questEnemyRefs.push(obj.enemyId);
                if (obj.skillId) questSkillRefs.push(obj.skillId);
            }
        }
    }
    result.checkReferences([...new Set(questItemRefs)], data.items || {}, '物品', '任务奖励');
    result.checkReferences([...new Set(questEnemyRefs)], data.enemies || {}, '妖魔', '任务目标');
    
    // 2.6 掉落物品引用
    const dropItemRefs = [];
    for (const [id, enemy] of Object.entries(data.enemies || {})) {
        if (enemy.dropItems && Array.isArray(enemy.dropItems)) {
            for (const drop of enemy.dropItems) {
                if (drop.itemId) dropItemRefs.push(drop.itemId);
            }
        }
    }
    result.checkReferences([...new Set(dropItemRefs)], data.items || {}, '物品', '妖魔掉落');
    
    // ===== 3. 必填字段检查 =====
    console.log('\n3️⃣  必填字段检查');
    console.log('─'.repeat(40));
    
    result.checkRequiredFields(data.skills || {}, '技能', ['id', 'name', 'type', 'mpCost']);
    result.checkRequiredFields(data.enemies || {}, '妖魔', ['id', 'name', 'maxHp', 'attack', 'defense']);
    result.checkRequiredFields(data.items || {}, '物品', ['id', 'name', 'type']);
    
    // ===== 4. 数值合理性检查 =====
    console.log('\n4️⃣  数值合理性检查');
    console.log('─'.repeat(40));
    
    // 妖魔HP/攻击/防御不能为0或负数
    const invalidEnemyStats = [];
    for (const [id, enemy] of Object.entries(data.enemies || {})) {
        if (enemy.maxHp <= 0) invalidEnemyStats.push(`${id}.maxHp=${enemy.maxHp}`);
        if (enemy.attack < 0) invalidEnemyStats.push(`${id}.attack=${enemy.attack}`);
        if (enemy.defense < 0) invalidEnemyStats.push(`${id}.defense=${enemy.defense}`);
    }
    if (invalidEnemyStats.length === 0) {
        result.pass('妖魔: 数值全部合理');
    } else {
        result.fail(`妖魔: 数值异常: ${invalidEnemyStats.slice(0, 10).join(', ')}`);
    }
    
    // 技能MP消耗不能为负数
    const invalidSkillMp = [];
    for (const [id, skill] of Object.entries(data.skills || {})) {
        if (skill.mpCost < 0) invalidSkillMp.push(`${id}.mpCost=${skill.mpCost}`);
    }
    if (invalidSkillMp.length === 0) {
        result.pass('技能: MP消耗全部合理');
    } else {
        result.fail(`技能: MP消耗异常: ${invalidSkillMp.join(', ')}`);
    }
    
    // ===== 5. 跨文件ID冲突检查 =====
    console.log('\n5️⃣  跨文件ID冲突检查');
    console.log('─'.repeat(40));
    
    // 技能ID和物品ID不应该冲突
    const skillIds = new Set(Object.keys(data.skills || {}));
    const itemIds = new Set(Object.keys(data.items || {}));
    const conflicts = [...skillIds].filter(id => itemIds.has(id));
    if (conflicts.length === 0) {
        result.pass('技能与物品: 无ID冲突');
    } else {
        result.warn(`技能与物品: ID冲突: ${conflicts.join(', ')}（可能是故意的，如同名物品）`);
    }
    
    return result.report();
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    const report = runDataIntegrityTests();
    process.exit(report.failed > 0 ? 1 : 0);
}

module.exports = { runDataIntegrityTests };
