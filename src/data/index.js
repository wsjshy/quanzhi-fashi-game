/**
 * 游戏数据入口
 * 合并所有数据模块为 GameData 对象
 */

import { DataSkills } from './skills.js';
import { DataCharacters } from './characters.js';
import { DataLocations } from './locations.js';
import { DataItems } from './items.js';
import { DataQuests } from './quests.js';
import { DataEvents } from './events.js';
import { DataShops } from './shops.js';
import { DataEnemies } from './enemies.js';
import { DataBigEvents } from './big-events.js';
import { DataWorld } from './world.js';
import { DataTalents, TALENT_RARITY_CONFIG } from './talents.js';
import { DataInnateTalents, InnateTalentRarity } from './innate-talents.js';
import { DataSpiritSeeds, SPIRIT_SEED_GRADES } from './spirit-seeds.js';
import { DataStarDustArtifacts, StarDustGrades } from './star-dust-artifacts.js';
import { DataSummonBeasts, DataSummonBeastEvolutions } from './summon-beasts.js';
import { DataAchievements, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from './achievements.js';
import { DataChapters } from './chapters.js';
import { DataClues } from './clues.js';
import { DataMaps } from './maps.js';
import { DemonTraits } from './demon-traits.js';

export const GameData = {
    skills: DataSkills,
    characters: DataCharacters,
    locations: DataLocations,
    items: DataItems,
    quests: DataQuests,
    events: DataEvents,
    shops: DataShops,
    enemies: DataEnemies,
    bigEvents: DataBigEvents,
    scheduledEvents: DataWorld.scheduledEvents,
    eventChains: DataWorld.eventChains,
    infoDatabase: DataWorld.infoDatabase,
    factions: DataWorld.factions,
    talents: DataTalents,
    innateTalents: DataInnateTalents,
    spiritSeeds: DataSpiritSeeds,
    starDustArtifacts: DataStarDustArtifacts,
    summonBeasts: DataSummonBeasts,
    achievements: DataAchievements,
    chapters: DataChapters,
    clues: DataClues,
    maps: DataMaps,
    demonTraits: DemonTraits,
};

export {
    DataSkills,
    DataCharacters,
    DataLocations,
    DataItems,
    DataQuests,
    DataEvents,
    DataShops,
    DataEnemies,
    DataBigEvents,
    DataWorld,
    DataTalents,
    DataInnateTalents,
    DataSpiritSeeds,
    DataStarDustArtifacts,
    DataSummonBeasts,
    DataAchievements,
    DataChapters,
    DataClues,
    DataMaps,
    DemonTraits,
    // 额外配置常量
    TALENT_RARITY_CONFIG,
    InnateTalentRarity,
    SPIRIT_SEED_GRADES,
    StarDustGrades,
    DataSummonBeastEvolutions,
    ACHIEVEMENT_CATEGORIES,
    ACHIEVEMENT_RARITIES,
};

// 向后兼容：所有数据变量挂载到window（引擎文件通过全局变量引用）
if (typeof window !== 'undefined') {
    window.DataSkills = DataSkills;
    window.DataCharacters = DataCharacters;
    window.DataLocations = DataLocations;
    window.DataItems = DataItems;
    window.DataQuests = DataQuests;
    window.DataEvents = DataEvents;
    window.DataShops = DataShops;
    window.DataEnemies = DataEnemies;
    window.DataBigEvents = DataBigEvents;
    window.DataWorld = DataWorld;
    window.DataTalents = DataTalents;
    window.DataInnateTalents = DataInnateTalents;
    window.DataSpiritSeeds = DataSpiritSeeds;
    window.DataStarDustArtifacts = DataStarDustArtifacts;
    window.DataSummonBeasts = DataSummonBeasts;
    window.DataAchievements = DataAchievements;
    window.DataChapters = DataChapters;
    window.DataClues = DataClues;
    window.DataMaps = DataMaps;
    window.DemonTraits = DemonTraits;
    window.GameData = GameData;
    // 额外配置常量
    window.TALENT_RARITY_CONFIG = TALENT_RARITY_CONFIG;
    window.InnateTalentRarity = InnateTalentRarity;
    window.SPIRIT_SEED_GRADES = SPIRIT_SEED_GRADES;
    window.StarDustGrades = StarDustGrades;
    window.DataSummonBeastEvolutions = DataSummonBeastEvolutions;
    window.ACHIEVEMENT_CATEGORIES = ACHIEVEMENT_CATEGORIES;
    window.ACHIEVEMENT_RARITIES = ACHIEVEMENT_RARITIES;
}

export default GameData;
