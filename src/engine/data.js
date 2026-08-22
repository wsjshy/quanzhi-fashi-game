/**
 * 数据管理器
 * 统一管理所有游戏数据的读取
 */

import { GameData } from '../data/index.js';

export const DataManager = {
    // 数据缓存
    _skills: {},
    _characters: {},
    _locations: {},
    _items: {},
    _quests: {},
    _events: {},
    _bigEvents: {},
    _shops: {},
    _enemies: {},
    _scheduledEvents: [],
    _factions: {},
    _eventChains: {},

    /**
     * 初始化数据
     */
    init() {
        // 从全局 GameData 加载数据
        if (typeof GameData !== 'undefined') {
            this._skills = GameData.skills || {};
            this._characters = GameData.characters || {};
            this._locations = GameData.locations || {};
            this._items = GameData.items || {};
            this._quests = GameData.quests || {};
            this._events = GameData.events || {};
            this._bigEvents = GameData.bigEvents || {};
            this._shops = GameData.shops || {};
            this._enemies = GameData.enemies || {};
            this._scheduledEvents = GameData.scheduledEvents || [];
            this._factions = GameData.factions || {};
            this._eventChains = GameData.eventChains || {};
        }
        
        console.log('数据加载完成', {
            skills: Object.keys(this._skills).length,
            characters: Object.keys(this._characters).length,
            locations: Object.keys(this._locations).length,
            items: Object.keys(this._items).length,
            quests: Object.keys(this._quests).length,
            events: Object.keys(this._events).length,
            shops: Object.keys(this._shops).length,
            enemies: Object.keys(this._enemies).length
        });
    },

    /**
     * 获取技能
     */
    getSkill(skillId) {
        return this._skills[skillId] || null;
    },

    /**
     * 获取所有技能
     */
    getAllSkills() {
        return this._skills;
    },

    /**
     * 获取角色/NPC
     */
    getCharacter(charId) {
        return this._characters[charId] || this._enemies[charId] || null;
    },

    /**
     * 获取所有NPC
     */
    getAllCharacters() {
        return this._characters;
    },

    /**
     * 获取地点
     */
    getLocation(locationId) {
        return this._locations[locationId] || null;
    },

    /**
     * 获取所有地点
     */
    getAllLocations() {
        return Object.values(this._locations);
    },

    /**
     * 获取物品
     */
    getItem(itemId) {
        return this._items[itemId] || null;
    },

    /**
     * 获取所有物品
     */
    getAllItems() {
        return this._items;
    },

    /**
     * 获取任务
     */
    getQuest(questId) {
        return this._quests[questId] || null;
    },

    /**
     * 获取所有任务
     */
    getAllQuests() {
        return this._quests;
    },

    /**
     * 获取事件
     */
    getEvent(eventId) {
        return this._events[eventId] || null;
    },

    /**
     * 按触发类型获取事件
     */
    getEventsByTrigger(trigger) {
        return Object.values(this._events).filter(e => e.trigger === trigger);
    },

    /**
     * 获取所有事件
     */
    getAllEvents() {
        return this._events;
    },
    
    /**
     * 获取大事件
     */
    getBigEvent(eventId) {
        return this._bigEvents[eventId] || null;
    },
    
    /**
     * 获取所有大事件
     */
    getAllBigEvents() {
        return this._bigEvents;
    },

    /**
     * 获取商店
     */
    getShop(shopId) {
        return this._shops[shopId] || null;
    },

    /**
     * 获取所有商店
     */
    getAllShops() {
        return this._shops;
    },

    /**
     * 获取敌人
     */
    getEnemy(enemyId) {
        return this._enemies[enemyId] || null;
    },

    /**
     * 获取所有敌人
     */
    getAllEnemies() {
        return this._enemies;
    },

    /**
     * 添加新数据（用于后续扩展）
     */
    addData(type, id, data) {
        const map = {
            skill: this._skills,
            character: this._characters,
            location: this._locations,
            item: this._items,
            quest: this._quests,
            event: this._events,
            shop: this._shops,
            enemy: this._enemies
        };
        
        if (map[type]) {
            map[type][id] = data;
            return true;
        }
        return false;
    },

    /**
     * 批量添加数据
     */
    addDataBatch(type, dataObject) {
        const map = {
            skill: this._skills,
            character: this._characters,
            location: this._locations,
            item: this._items,
            quest: this._quests,
            event: this._events,
            shop: this._shops,
            enemy: this._enemies
        };
        
        if (map[type]) {
            Object.assign(map[type], dataObject);
            return true;
        }
        return false;
    },

    /**
     * 获取定时大事件
     */
    getScheduledEvents() {
        return this._scheduledEvents;
    },

    /**
     * 获取所有势力
     */
    getFactions() {
        return this._factions;
    },

    /**
     * 获取单个势力
     */
    getFaction(factionId) {
        return this._factions[factionId] || null;
    },

    /**
     * 获取所有事件链
     */
    getEventChains() {
        return this._eventChains;
    },

    /**
     * 获取单个事件链
     */
    getEventChain(chainId) {
        return this._eventChains[chainId] || null;
    }
};

// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.DataManager = DataManager;
