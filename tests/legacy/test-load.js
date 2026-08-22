// 模拟浏览器环境测试脚本加载
import fs from 'fs.js';
import path from 'path.js';

const gameDir = 'C:\\Users\\22210\\Desktop\\quanzhi-fashi-game-master';

// 模拟浏览器全局对象
global.window = {};
global.document = {
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }),
    getElementById: () => null,
    querySelectorAll: () => [],
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    addEventListener: () => {}
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.console = console;

// 按index.html顺序加载脚本
const scripts = [
    'engine/data/skills.js',
    'engine/data/characters.js',
    'engine/data/locations.js',
    'engine/data/items.js',
    'engine/data/quests.js',
    'engine/data/events.js',
    'engine/data/shops.js',
    'engine/data/enemies.js',
    'engine/data/demon-traits.js',
    'engine/data/world.js',
    'engine/data/big-events.js',
    'engine/data/chapters.js',
    'engine/data/talents.js',
    'engine/data/spirit-seeds.js',
    'engine/data/achievements.js',
    'engine/data/star-dust-artifacts.js',
    'engine/data/index.js',
    'engine/data.js',
    'engine/skill.js',
    'engine/skill-level.js',
    'engine/realm.js',
    'engine/inventory.js',
    'engine/talent.js',
    'engine/spirit-seed.js',
    'engine/star-dust-artifact.js',
    'engine/soul-system.js',
    'engine/player.js',
    'engine/time.js',
    'engine/quest.js',
    'engine/daily.js',
    'engine/event.js',
    'engine/big-event.js',
    'engine/story-chapter.js',
    'engine/shop.js',
    'engine/map.js',
    'engine/battle-ai.js',
    'engine/battle-effect.js',
    'engine/battle-event.js',
    'engine/battle.js',
    'engine/achievement-handler.js',
    'engine/world-state.js',
    'engine/npc-state.js',
    'engine/npc-growth.js',
    'engine/dialogue-tree.js',
    'engine/ui.js',
    'engine/game.js',
    'engine/debug.js'
];

try {
    for (const script of scripts) {
        const filePath = path.join(gameDir, script);
        if (!fs.existsSync(filePath)) {
            console.log(`SKIP (not found): ${script}`);
            continue;
        }
        let code = fs.readFileSync(filePath, 'utf8');
        // 把const改为var（在eval作用域中）
        code = code.replace(/^const /gm, 'var ');
        try {
            eval(code);
            console.log(`OK: ${script}`);
        } catch (e) {
            console.log(`ERROR in ${script}: ${e.message}`);
            console.log(`  Stack: ${e.stack?.split('\n')[1] || ''}`);
        }
    }
    console.log('\nAll scripts loaded.');

    // 测试关键对象是否存在
    console.log('\n--- Key objects check ---');
    console.log('TalentSystem:', typeof TalentSystem !== 'undefined' ? 'exists' : 'MISSING');
    console.log('TalentSystem.getTalentChoices:', typeof TalentSystem?.getTalentChoices === 'function' ? 'OK' : 'MISSING');
    console.log('TalentSystem.selectTalent:', typeof TalentSystem?.selectTalent === 'function' ? 'OK' : 'MISSING');
    console.log('TALENT_TYPE_INNATE:', typeof TALENT_TYPE_INNATE !== 'undefined' ? TALENT_TYPE_INNATE : 'MISSING');
    console.log('TALENT_RARITY_CONFIG:', typeof TALENT_RARITY_CONFIG !== 'undefined' ? 'exists' : 'MISSING');
    console.log('DataTalents count:', typeof DataTalents !== 'undefined' ? Object.keys(DataTalents).length : 'MISSING');

    // 测试天赋选择
    if (typeof TalentSystem !== 'undefined' && typeof DataTalents !== 'undefined') {
        const choices = TalentSystem.getTalentChoices('fire');
        console.log('\nFire talent choices:', choices);
        choices.forEach(id => {
            const t = DataTalents[id];
            console.log(`  ${t.name} (${t.rarity}/${t.type}, maxLv=${t.maxLevel})`);
        });

        // 测试选择天赋
        const selected = TalentSystem.selectTalent(choices[0]);
        console.log('\nSelected talent:', selected);
        const effects = TalentSystem.getTalentEffects(choices[0], selected.level);
        console.log('Effects at level', selected.level, ':', effects);
    }

    // 测试createCharacter流程
    console.log('\n--- Game object check ---');
    console.log('Game:', typeof Game !== 'undefined' ? 'exists' : 'MISSING');
    console.log('Game.showTalentSelection:', typeof Game?.showTalentSelection === 'function' ? 'OK' : 'MISSING');
    console.log('Game.confirmTalent:', typeof Game?.confirmTalent === 'function' ? 'OK' : 'MISSING');
    console.log('Game.quickRest:', typeof Game?.quickRest === 'function' ? 'OK' : 'MISSING');
    console.log('Game.battleMeditate:', typeof Game?.battleMeditate === 'function' ? 'OK' : 'MISSING');

} catch (e) {
    console.log('FATAL:', e.message);
    console.log(e.stack);
}
