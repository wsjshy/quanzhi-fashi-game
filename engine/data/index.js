/**
 * 游戏数据入口
 * 合并所有数据模块为 GameData 对象
 * 
 * 注意：本文件由 tools/split-game-data.js 自动生成
 * 修改数据请修改 engine/data/ 下对应的模块文件
 */

const GameData = {
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
};
