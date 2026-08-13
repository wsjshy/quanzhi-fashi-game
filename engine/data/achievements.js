/**
 * 成就数据
 * 玩家在游戏中可以解锁的各种成就
 */

const DataAchievements = {
  // ========== 战斗类成就 ==========
  first_blood: {
    id: 'first_blood',
    name: '初战告捷',
    description: '击杀第一只妖魔',
    category: 'battle',
    rarity: 'common',
    icon: '⚔️',
    reward: { gold: 100 },
    condition: { type: 'kill_count', value: 1 }
  },
  
  slayer_10: {
    id: 'slayer_10',
    name: '妖魔猎人',
    description: '累计击杀10只妖魔',
    category: 'battle',
    rarity: 'common',
    icon: '🗡️',
    reward: { gold: 500 },
    condition: { type: 'kill_count', value: 10 }
  },
  
  slayer_100: {
    id: 'slayer_100',
    name: '屠戮者',
    description: '累计击杀100只妖魔',
    category: 'battle',
    rarity: 'rare',
    icon: '💀',
    reward: { gold: 2000 },
    condition: { type: 'kill_count', value: 100 }
  },
  
  slayer_1000: {
    id: 'slayer_1000',
    name: '灭世魔王',
    description: '累计击杀1000只妖魔',
    category: 'battle',
    rarity: 'legendary',
    icon: '👹',
    reward: { gold: 20000 },
    condition: { type: 'kill_count', value: 1000 }
  },
  
  elite_killer: {
    id: 'elite_killer',
    name: '精英杀手',
    description: '击杀第一只战将级妖魔',
    category: 'battle',
    rarity: 'rare',
    icon: '⭐',
    reward: { gold: 1000 },
    condition: { type: 'kill_elite', value: 1 }
  },
  
  boss_killer: {
    id: 'boss_killer',
    name: '屠龙勇士',
    description: '击杀第一只统领级妖魔',
    category: 'battle',
    rarity: 'epic',
    icon: '🐉',
    reward: { gold: 5000 },
    condition: { type: 'kill_boss', value: 1 }
  },
  
  win_streak_5: {
    id: 'win_streak_5',
    name: '连胜达人',
    description: '连续战斗胜利5次',
    category: 'battle',
    rarity: 'common',
    icon: '🔥',
    reward: { gold: 300 },
    condition: { type: 'win_streak', value: 5 }
  },
  
  no_damage: {
    id: 'no_damage',
    name: '毫发无伤',
    description: '在一场战斗中不受到任何伤害',
    category: 'battle',
    rarity: 'rare',
    icon: '🛡️',
    reward: { gold: 800 },
    condition: { type: 'no_damage_battle', value: 1 }
  },

  // ========== 成长类成就 ==========
  level_5: {
    id: 'level_5',
    name: '初露锋芒',
    description: '达到5级',
    category: 'growth',
    rarity: 'common',
    icon: '📈',
    reward: { gold: 200 },
    condition: { type: 'level', value: 5 }
  },
  
  level_10: {
    id: 'level_10',
    name: '小有所成',
    description: '达到10级',
    category: 'growth',
    rarity: 'rare',
    icon: '🌟',
    reward: { gold: 1000 },
    condition: { type: 'level', value: 10 }
  },
  
  level_20: {
    id: 'level_20',
    name: '中流砥柱',
    description: '达到20级',
    category: 'growth',
    rarity: 'epic',
    icon: '💫',
    reward: { gold: 5000 },
    condition: { type: 'level', value: 20 }
  },

  level_30: {
    id: 'level_30',
    name: '高阶法师',
    description: '达到30级，突破高阶',
    category: 'growth',
    rarity: 'epic',
    icon: '🔥',
    reward: { gold: 10000 },
    condition: { type: 'level', value: 30 }
  },

  level_50: {
    id: 'level_50',
    name: '星河强者',
    description: '达到50级',
    category: 'growth',
    rarity: 'legendary',
    icon: '⭐',
    reward: { gold: 30000 },
    condition: { type: 'level', value: 50 }
  },
  
  awaken_2: {
    id: 'awaken_2',
    name: '双系法师',
    description: '觉醒第二个元素系',
    category: 'growth',
    rarity: 'rare',
    icon: '✨',
    reward: { gold: 1000 },
    condition: { type: 'awaken_count', value: 2 }
  },
  
  awaken_4: {
    id: 'awaken_4',
    name: '四系全才',
    description: '觉醒四个元素系',
    category: 'growth',
    rarity: 'epic',
    icon: '🌈',
    reward: { gold: 5000 },
    condition: { type: 'awaken_count', value: 4 }
  },
  
  awaken_all: {
    id: 'awaken_all',
    name: '全系法师',
    description: '觉醒所有元素系',
    category: 'growth',
    rarity: 'legendary',
    icon: '👑',
    reward: { gold: 50000 },
    condition: { type: 'awaken_count', value: 10 }
  },
  
  realm_middle: {
    id: 'realm_middle',
    name: '中阶法师',
    description: '突破到中阶境界',
    category: 'growth',
    rarity: 'rare',
    icon: '🔮',
    reward: { gold: 2000 },
    condition: { type: 'realm', value: 'middle' }
  },
  
  realm_high: {
    id: 'realm_high',
    name: '高阶法师',
    description: '突破到高阶境界',
    category: 'growth',
    rarity: 'epic',
    icon: '💎',
    reward: { gold: 10000 },
    condition: { type: 'realm', value: 'high' }
  },
  
  realm_super: {
    id: 'realm_super',
    name: '超阶法师',
    description: '突破到超阶境界',
    category: 'growth',
    rarity: 'legendary',
    icon: '🏆',
    reward: { gold: 50000 },
    condition: { type: 'realm', value: 'super' }
  },

  // ========== 收集类成就 ==========
  first_spirit_seed: {
    id: 'first_spirit_seed',
    name: '灵种初体验',
    description: '炼化第一个灵种',
    category: 'collection',
    rarity: 'common',
    icon: '🌱',
    reward: { gold: 500 },
    condition: { type: 'spirit_seed_count', value: 1 }
  },
  
  rare_spirit_seed: {
    id: 'rare_spirit_seed',
    name: '稀有灵种',
    description: '获得一个稀有灵种',
    category: 'collection',
    rarity: 'rare',
    icon: '🌸',
    reward: { gold: 2000 },
    condition: { type: 'rare_spirit_seed', value: 1 }
  },
  
  soul_seed: {
    id: 'soul_seed',
    name: '魂种拥有者',
    description: '炼化第一个魂种',
    category: 'collection',
    rarity: 'epic',
    icon: '🔱',
    reward: { gold: 10000 },
    condition: { type: 'soul_seed_count', value: 1 }
  },
  
  all_element_seeds: {
    id: 'all_element_seeds',
    name: '灵种收藏家',
    description: '集齐所有系的灵种',
    category: 'collection',
    rarity: 'legendary',
    icon: '🏅',
    reward: { gold: 30000 },
    condition: { type: 'all_element_seeds', value: 10 }
  },
  
  first_artifact: {
    id: 'first_artifact',
    name: '魔具初体验',
    description: '获得第一件魔具',
    category: 'collection',
    rarity: 'common',
    icon: '⚔️',
    reward: { gold: 300 },
    condition: { type: 'artifact_count', value: 1 }
  },
  
  full_equipment: {
    id: 'full_equipment',
    name: '全身武装',
    description: '装备栏全部装满',
    category: 'collection',
    rarity: 'rare',
    icon: '🛡️',
    reward: { gold: 1500 },
    condition: { type: 'full_equipment', value: 3 }
  },
  
  bestiary_10: {
    id: 'bestiary_10',
    name: '妖魔图鉴学徒',
    description: '图鉴收录10种妖魔',
    category: 'collection',
    rarity: 'common',
    icon: '📖',
    reward: { gold: 300 },
    condition: { type: 'bestiary_count', value: 10 }
  },
  
  bestiary_50: {
    id: 'bestiary_50',
    name: '妖魔图鉴大师',
    description: '图鉴收录50种妖魔',
    category: 'collection',
    rarity: 'epic',
    icon: '📚',
    reward: { gold: 5000 },
    condition: { type: 'bestiary_count', value: 50 }
  },

  // ========== 社交类成就 ==========
  first_friend: {
    id: 'first_friend',
    name: '初交朋友',
    description: '与一个NPC达到友好关系',
    category: 'social',
    rarity: 'common',
    icon: '👋',
    reward: { gold: 200 },
    condition: { type: 'npc_friendly', value: 1 }
  },
  
  best_friend: {
    id: 'best_friend',
    name: '莫逆之交',
    description: '与一个NPC达到挚友关系',
    category: 'social',
    rarity: 'rare',
    icon: '🤝',
    reward: { gold: 1000 },
    condition: { type: 'npc_best_friend', value: 1 }
  },
  
  popular: {
    id: 'popular',
    name: '社交达人',
    description: '与10个NPC达到友好关系',
    category: 'social',
    rarity: 'epic',
    icon: '🌟',
    reward: { gold: 3000 },
    condition: { type: 'npc_friendly', value: 10 }
  },
  
  faction_respected: {
    id: 'faction_respected',
    name: '受人尊敬',
    description: '在一个势力达到尊敬声望',
    category: 'social',
    rarity: 'rare',
    icon: '🎖️',
    reward: { gold: 1500 },
    condition: { type: 'faction_respected', value: 1 }
  },
  
  faction_worshipped: {
    id: 'faction_worshipped',
    name: '万人敬仰',
    description: '在一个势力达到崇拜声望',
    category: 'social',
    rarity: 'epic',
    icon: '🙇',
    reward: { gold: 5000 },
    condition: { type: 'faction_worshipped', value: 1 }
  },

  // ========== 探索类成就 ==========
  first_location: {
    id: 'first_location',
    name: '初入江湖',
    description: '解锁第一个新地点',
    category: 'exploration',
    rarity: 'common',
    icon: '🗺️',
    reward: { gold: 100 },
    condition: { type: 'location_count', value: 2 }
  },
  
  explorer: {
    id: 'explorer',
    name: '探险家',
    description: '解锁10个地点',
    category: 'exploration',
    rarity: 'rare',
    icon: '🧭',
    reward: { gold: 1000 },
    condition: { type: 'location_count', value: 10 }
  },
  
  first_quest: {
    id: 'first_quest',
    name: '任务初体验',
    description: '完成第一个任务',
    category: 'exploration',
    rarity: 'common',
    icon: '📜',
    reward: { gold: 100 },
    condition: { type: 'quest_count', value: 1 }
  },
  
  quest_master: {
    id: 'quest_master',
    name: '任务大师',
    description: '完成50个任务',
    category: 'exploration',
    rarity: 'epic',
    icon: '📋',
    reward: { gold: 5000 },
    condition: { type: 'quest_count', value: 50 }
  },

  // ========== 财富类成就 ==========
  rich_1000: {
    id: 'rich_1000',
    name: '小有积蓄',
    description: '拥有1000金币',
    category: 'wealth',
    rarity: 'common',
    icon: '💰',
    reward: { gold: 0 },
    condition: { type: 'gold', value: 1000 }
  },
  
  rich_10000: {
    id: 'rich_10000',
    name: '小富翁',
    description: '拥有10000金币',
    category: 'wealth',
    rarity: 'rare',
    icon: '💎',
    reward: { gold: 0 },
    condition: { type: 'gold', value: 10000 }
  },
  
  rich_100000: {
    id: 'rich_100000',
    name: '大富翁',
    description: '拥有100000金币',
    category: 'wealth',
    rarity: 'epic',
    icon: '👑',
    reward: { gold: 0 },
    condition: { type: 'gold', value: 100000 }
  },
  
  rich_million: {
    id: 'rich_million',
    name: '百万富翁',
    description: '拥有1000000金币',
    category: 'wealth',
    rarity: 'legendary',
    icon: '🏆',
    reward: { gold: 0 },
    condition: { type: 'gold', value: 1000000 }
  },

  // ========== 特殊/隐藏成就 ==========
  lucky_dog: {
    id: 'lucky_dog',
    name: '幸运儿',
    description: '连续暴击3次',
    category: 'special',
    rarity: 'rare',
    icon: '🍀',
    reward: { gold: 666 },
    condition: { type: 'crit_streak', value: 3 },
    isHidden: true
  },
  
  phoenix: {
    id: 'phoenix',
    name: '浴火重生',
    description: '在濒死状态下赢得战斗',
    category: 'special',
    rarity: 'epic',
    icon: '🔥',
    reward: { gold: 2000 },
    condition: { type: 'near_death_win', value: 1 },
    isHidden: true
  },
  
  pacifist: {
    id: 'pacifist',
    name: '和平主义者',
    description: '达到5级但没有击杀过任何妖魔',
    category: 'special',
    rarity: 'rare',
    icon: '☮️',
    reward: { gold: 1000 },
    condition: { type: 'pacifist', value: 1 },
    isHidden: true
  },
  
  speedrunner: {
    id: 'speedrunner',
    name: '速通达人',
    description: '游戏内7天内达到中阶',
    category: 'special',
    rarity: 'epic',
    icon: '⚡',
    reward: { gold: 5000 },
    condition: { type: 'speedrun_middle', value: 7 },
    isHidden: true
  },
};

// 成就分类
const ACHIEVEMENT_CATEGORIES = {
  battle: { name: '战斗', icon: '⚔️' },
  growth: { name: '成长', icon: '📈' },
  collection: { name: '收集', icon: '🎁' },
  social: { name: '社交', icon: '👥' },
  exploration: { name: '探索', icon: '🗺️' },
  wealth: { name: '财富', icon: '💰' },
  special: { name: '特殊', icon: '✨' },
};

// 成就稀有度配置
const ACHIEVEMENT_RARITIES = {
  common: { name: '普通', color: '#999999', points: 10 },
  rare: { name: '稀有', color: '#66ccff', points: 30 },
  epic: { name: '史诗', color: '#cc66ff', points: 100 },
  legendary: { name: '传说', color: '#ffcc00', points: 300 },
};
