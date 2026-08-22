/**
 * 黑盒测试 - 剧情数据完整性验证
 */
import fs from 'fs.js';
import path from 'path.js';

const dataDir = path.join(__dirname, 'engine', 'data');
let passed = 0, failed = 0, warnings = 0;
const errors = [];

function pass(msg) { passed++; console.log(`  ✓ ${msg}`); }
function fail(msg) { failed++; errors.push(msg); console.log(`  ✗ ${msg}`); }
function warn(msg) { warnings++; console.log(`  ⚠ ${msg}`); }

// 通过eval加载数据文件到全局
function loadGlobal(file) {
    let code = fs.readFileSync(path.join(dataDir, file), 'utf8');
    // 将const/let替换为var，使变量在全局可访问
    code = code.replace(/^const\s+/gm, 'var ').replace(/^let\s+/gm, 'var ');
    try {
        (0, eval)(code);
    } catch(e) {
        console.error(`加载 ${file} 失败:`, e.message);
    }
}

// 加载所有需要的数据文件
loadGlobal('items.js');
loadGlobal('world.js');
loadGlobal('events.js');
loadGlobal('characters.js');

// 收集ID集合
const validItemIds = new Set(Object.keys(DataItems));
const infoDb = DataWorld.infoDatabase || {};
const validInfoIds = new Set(Object.keys(infoDb.infos || infoDb));
const validEventIds = new Set(Object.keys(DataEvents));
const validNpcIds = new Set(Object.keys(DataCharacters));

console.log('=== 全职法师网页游戏 - 剧情数据黑盒测试 ===\n');
console.log(`数据统计: ${validItemIds.size} 物品, ${validInfoIds.size} 信息碎片, ${validEventIds.size} 事件, ${validNpcIds.size} NPC\n`);

const allFlags = new Set();
const allNpcFlags = new Set();

// ========== 1. 验证事件数据 ==========
console.log('【1】验证事件数据...');
for (const [evtId, evt] of Object.entries(DataEvents)) {
    if (!evtId || !evt) continue;
    const effects = evt.effects || {};

    // giveInfo
    if (effects.giveInfo) {
        const infos = Array.isArray(effects.giveInfo) ? effects.giveInfo : [effects.giveInfo];
        for (const infoId of infos) {
            if (!validInfoIds.has(infoId)) fail(`事件 ${evtId}: giveInfo "${infoId}" 不存在`);
        }
    }
    // giveItem
    if (effects.giveItem) {
        const items = Array.isArray(effects.giveItem) ? effects.giveItem : [effects.giveItem];
        for (const itemRef of items) {
            const itemId = typeof itemRef === 'string' ? itemRef : (itemRef.itemId || itemRef.id);
            if (itemId && !validItemIds.has(itemId)) fail(`事件 ${evtId}: giveItem "${itemId}" 不存在`);
        }
    }
    // flags
    if (effects.flags && typeof effects.flags === 'object') Object.keys(effects.flags).forEach(f => allFlags.add(f));
    if (effects.setFlag && typeof effects.setFlag === 'object') Object.keys(effects.setFlag).forEach(f => allFlags.add(f));
    // conditions flags
    if (evt.conditions) {
        const conds = Array.isArray(evt.conditions) ? evt.conditions : Object.entries(evt.conditions).map(([k,v]) => ({type:k, ...(typeof v==='object'?v:{value:v})}));
        for (const c of conds) { if (c.type === 'flag' && c.value) allFlags.add(c.value); }
    }
    // choices
    if (evt.choices) for (const ch of evt.choices) {
        if (ch.effects) {
            if (ch.effects.giveInfo) {
                const infos = Array.isArray(ch.effects.giveInfo) ? ch.effects.giveInfo : [ch.effects.giveInfo];
                for (const infoId of infos) if (!validInfoIds.has(infoId)) fail(`事件 ${evtId} 选项: giveInfo "${infoId}" 不存在`);
            }
            if (ch.effects.giveItem) {
                const itemId = typeof ch.effects.giveItem === 'string' ? ch.effects.giveItem : (ch.effects.giveItem.itemId || ch.effects.giveItem.id);
                if (itemId && !validItemIds.has(itemId)) fail(`事件 ${evtId} 选项: giveItem "${itemId}" 不存在`);
            }
            if (ch.effects.flags) Object.keys(ch.effects.flags).forEach(f => allFlags.add(f));
        }
    }
}
pass(`事件验证完成 (${validEventIds.size} 个事件)`);

// ========== 2. 验证NPC对话树 ==========
console.log('\n【2】验证NPC对话树...');
let totalNodes = 0, treeCount = 0;
for (const [npcId, npc] of Object.entries(DataCharacters)) {
    if (!npc || !npc.dialogueTree) continue;
    treeCount++;
    const nodes = npc.dialogueTree.nodes || {};
    const nodeIds = new Set(Object.keys(nodes));

    for (const [nid, node] of Object.entries(nodes)) {
        totalNodes++;
        if (node.effects) {
            if (node.effects.giveInfo) {
                const infos = Array.isArray(node.effects.giveInfo) ? node.effects.giveInfo : [node.effects.giveInfo];
                for (const infoId of infos) if (!validInfoIds.has(infoId)) fail(`NPC ${npcId}.${nid}: giveInfo "${infoId}" 不存在`);
            }
            if (node.effects.giveItem) {
                const itemId = typeof node.effects.giveItem === 'string' ? node.effects.giveItem : (node.effects.giveItem.itemId || node.effects.giveItem.id);
                if (itemId && !validItemIds.has(itemId)) fail(`NPC ${npcId}.${nid}: giveItem "${itemId}" 不存在`);
            }
            if (node.effects.npcFlags) Object.keys(node.effects.npcFlags).forEach(f => allNpcFlags.add(`${npcId}.${f}`));
            if (node.effects.flags) Object.keys(node.effects.flags).forEach(f => allFlags.add(f));
        }
        if (node.choices) for (const ch of node.choices) {
            const nextId = ch.nextNode || ch.next;
            if (nextId && !nodeIds.has(nextId)) fail(`NPC ${npcId}.${nid}: 指向不存在节点 "${nextId}"`);
            if (ch.effects) {
                if (ch.effects.giveInfo) {
                    const infos = Array.isArray(ch.effects.giveInfo) ? ch.effects.giveInfo : [ch.effects.giveInfo];
                    for (const infoId of infos) if (!validInfoIds.has(infoId)) fail(`NPC ${npcId}.${nid} 选项: giveInfo "${infoId}" 不存在`);
                }
                if (ch.effects.giveItem) {
                    const itemId = typeof ch.effects.giveItem === 'string' ? ch.effects.giveItem : (ch.effects.giveItem.itemId || ch.effects.giveItem.id);
                    if (itemId && !validItemIds.has(itemId)) fail(`NPC ${npcId}.${nid} 选项: giveItem "${itemId}" 不存在`);
                }
                if (ch.effects.npcFlags) Object.keys(ch.effects.npcFlags).forEach(f => allNpcFlags.add(`${npcId}.${f}`));
                if (ch.effects.flags) Object.keys(ch.effects.flags).forEach(f => allFlags.add(f));
            }
            if (ch.condition) {
                if (ch.condition.hasFlag) allFlags.add(ch.condition.hasFlag);
                if (ch.condition.notNpcFlags) ch.condition.notNpcFlags.forEach(f => allNpcFlags.add(`${npcId}.${f}`));
                if (ch.condition.npcFlags) Object.keys(ch.condition.npcFlags).forEach(f => allNpcFlags.add(`${npcId}.${f}`));
            }
        }
    }
}
pass(`对话树验证完成 (${treeCount} 个NPC, ${totalNodes} 节点)`);

// ========== 3. 信息碎片 ==========
console.log('\n【3】验证信息碎片...');
for (const [id, info] of Object.entries(DataWorld.infoDatabase || {})) {
    if (!info.title) warn(`信息 ${id}: 缺title`);
    if (!info.content) warn(`信息 ${id}: 缺content`);
}
pass(`信息碎片验证完成 (${validInfoIds.size} 条)`);

// ========== 4. dynamicLore ==========
console.log('\n【4】验证物品dynamicLore...');
let dlCount = 0;
for (const [id, item] of Object.entries(DataItems)) {
    if (item.dynamicLore) {
        dlCount++;
        for (const dl of item.dynamicLore) {
            if (!dl.flag) fail(`物品 ${id} dynamicLore: 缺flag`);
            if (!dl.text) fail(`物品 ${id} dynamicLore: 缺text`);
            if (dl.flag) allFlags.add(dl.flag);
        }
    }
}
pass(`dynamicLore验证完成 (${dlCount} 个物品)`);

// ========== 5. 博城篇关键内容 ==========
console.log('\n【5】验证博城篇关键剧情...');
const keyEvents = ['event_tang_yue_roof','event_demon_migration','event_ancient_cave','event_wounded_demon','event_mu_he_stranger','event_eve_of_disaster','event_after_disaster_survivor','event_black_church_mark','event_earth_spring_depths','event_farewell_bocheng'];
for (const eid of keyEvents) {
    if (validEventIds.has(eid)) pass(`事件: ${eid}`); else fail(`事件缺失: ${eid}`);
}
const keyNpcs = ['tang_yue','zhang_xiaohou','zhan_kong','mu_bai','yu_ang','mu_he','mo_fan'];
for (const nid of keyNpcs) {
    const npc = DataCharacters[nid];
    if (npc && npc.dialogueTree) pass(`NPC ${nid}: ${Object.keys(npc.dialogueTree.nodes||{}).length} 节点`);
    else fail(`NPC ${nid}: 缺dialogueTree`);
}
const farewells = [['tang_yue','farewell_node'],['zhang_xiaohou','xiaohou_farewell'],['zhan_kong','farewell_node']];
for (const [nid, nid2] of farewells) {
    const npc = DataCharacters[nid];
    if (npc?.dialogueTree?.nodes?.[nid2]) pass(`${nid} 告别节点: ${nid2}`);
    else fail(`${nid} 告别节点缺失: ${nid2}`);
}
const keyItems = ['tang_yue_message_talisman','zhan_kong_token','small_loach_pendant','little_loach_pendant'];
for (const iid of keyItems) {
    if (validItemIds.has(iid)) pass(`物品: ${iid}`); else fail(`物品缺失: ${iid}`);
}

// ========== 6. 重复NPC ==========
console.log('\n【6】检查重复定义...');
const ids = Object.keys(DataCharacters);
const seen = new Set();
let dupes = 0;
for (const id of ids) { if (seen.has(id)) { fail(`重复NPC: ${id}`); dupes++; } seen.add(id); }
if (dupes === 0) pass(`无重复NPC (${ids.length} 个)`);

// ========== 总结 ==========
console.log('\n' + '='.repeat(50));
console.log(`结果: ${passed} 通过, ${failed} 失败, ${warnings} 警告`);
console.log(`Flag统计: ${allFlags.size} 全局, ${allNpcFlags.size} NPC`);
if (allFlags.size > 0) console.log(`全局Flag列表: ${[...allFlags].sort().join(', ')}`);
if (failed > 0) { console.log('\n失败项:'); errors.forEach(e => console.log(`  - ${e}`)); }
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
