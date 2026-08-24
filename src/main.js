/**
 * 全职法师 - 魔法觉醒
 * 模块化入口文件
 * 
 * 按依赖顺序import所有模块，每个模块会自动挂载到window保持向后兼容。
 */

// ========== 数据层（无依赖） ==========
import './data/skills.js';
import './data/characters.js';
import './data/maps.js';
import './data/locations.js';
import './data/items.js';
import './data/quests.js';
import './data/events.js';
import './data/shops.js';
import './data/enemies.js';
import './data/demon-traits.js';
import './data/world.js';
import './data/big-events.js';
import './data/chapters.js';
import './data/talents.js';
import './data/innate-talents.js';
import './data/spirit-seeds.js';
import './data/achievements.js';
import './data/star-dust-artifacts.js';
import './data/summon-beasts.js';
import './data/clues.js';
import { GameData } from './data/index.js';

// ========== 引擎层（按依赖顺序） ==========
import './engine/data.js';           // DataManager（依赖GameData）
import './engine/skill.js';          // SkillSystem
import './engine/skill-level.js';    // SkillLevelSystem
import './engine/realm.js';          // RealmSystem
import './engine/inventory.js';      // Inventory
import './engine/talent.js';         // TalentSystem
import './engine/talent-combat.js';  // TalentCombatSystem
import './engine/innate-talent.js';  // InnateTalentSystem
import './engine/spirit-seed.js';    // SpiritSeedSystem
import './engine/star-dust-artifact.js'; // StarDustArtifactSystem
import './engine/soul-system.js';    // SoulSystem
import './engine/player.js';         // Player（依赖很多系统）
import './engine/game-state.js';     // GameState（集中式状态管理，依赖Player）
import './engine/time.js';           // TimeSystem
import './engine/quest.js';          // QuestSystem
import './engine/investigation.js';  // InvestigationSystem
import './engine/daily.js';          // DailySystem
import './engine/event.js';          // EventSystem
import './engine/big-event.js';      // BigEventSystem
import './engine/story-chapter.js';  // StoryChapterSystem
import './engine/shop.js';           // ShopSystem
import './engine/map.js';            // MapSystem
import './engine/battle-ai.js';      // BattleAI
import './engine/battle-effect.js';  // EffectRegistry
import './engine/battle-event.js';   // BattleEventBus, BattleEvents
import './engine/battle-animation.js'; // BattleAnimation（v3.3.0战斗动画系统）
import './engine/battle.js';         // BattleSystem（核心战斗）
import './engine/achievement-handler.js'; // AchievementHandler
import './engine/world-state.js';    // WorldState
import './engine/npc-state.js';      // NPCStateSystem
import './engine/npc-growth.js';     // NPCGrowthService
import './engine/dialogue-tree.js';  // DialogueTree
import './engine/encounter.js';      // EncounterSystem
import './engine/ui-assets.js';      // UIAssets（美术资源管理，v3.3.0）
import './engine/ui.js';             // UI（渲染层，依赖所有系统）
import './engine/game.js';           // Game（主控制器，最后加载）
import './engine/debug.js';          // DebugPanel（开发工具）

// ========== 启动游戏 ==========
console.log('📦 模块化加载完成，启动游戏...');

function startGame() {
    // 移除加载屏
    const loading = document.getElementById('loading-screen');
    if (loading) loading.remove();
    
    // 注册子系统序列化回调到GameState（必须在存档加载前）
    if (typeof GameState !== 'undefined') {
        if (typeof Inventory !== 'undefined') {
            GameState.registerSubsystem('inventory',
                () => Inventory.getSaveData(),
                (data) => Inventory.loadSaveData(data)
            );
        }
        if (typeof WorldState !== 'undefined') {
            GameState.registerSubsystem('worldState',
                () => WorldState.getSaveData(),
                (data) => WorldState.loadSaveData(data)
            );
        }
        if (typeof NPCStateSystem !== 'undefined') {
            GameState.registerSubsystem('npcStates',
                () => NPCStateSystem.getSaveData(),
                (data) => NPCStateSystem.loadSaveData(data)
            );
        }
    }
    
    // 初始化UI（必须在Game.init之前，因为Game.init会调用UI渲染）
    if (typeof UI !== 'undefined' && UI.init) {
        UI.init();
    }
    
    if (typeof Game !== 'undefined' && Game.init) {
        Game.init();
    } else {
        console.error('Game对象未找到');
    }
}

// 等待DOM就绪
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}
