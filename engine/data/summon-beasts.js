/**
 * 召唤兽数据
 * 不同召唤兽有不同属性倾向和专属技能
 * 贴合小说设定：初阶召唤时随机契约一种
 */

const DataSummonBeasts = {
  shadow_wolf: {
    id: 'shadow_wolf',
    name: '幽狼兽',
    icon: '🐺',
    description: '来自召唤位面的狼型妖魔，均衡型召唤兽，攻守兼备。莫凡的契约兽。',
    rarity: '普通',
    baseStats: { maxHp: 80, attack: 25, defense: 10, speed: 15 },
    skills: [
      { id: 'bite', name: '撕咬', minLevel: 1, damageMult: 1.0, critBonus: 0, desc: '普通攻击' },
      { id: 'howl', name: '狼嚎', minLevel: 3, type: 'buff', attackBuff: 0.3, defenseBuff: 0.1, duration: 2, desc: '提升攻击30%' },
      { id: 'shadow_strike', name: '暗影突袭', minLevel: 5, damageMult: 1.5, critBonus: 0.3, desc: '1.5倍伤害+30%暴击' },
      { id: 'frenzy_bite', name: '狂暴撕咬', minLevel: 8, damageMult: 2.0, hpCost: 0.1, desc: '2倍伤害，消耗10%HP' }
    ]
  },
  rock_golem: {
    id: 'rock_golem',
    name: '岩魔人',
    icon: '🗿',
    description: '由岩石构成的巨型召唤兽，坦克型，血厚防高但速度缓慢。',
    rarity: '普通',
    baseStats: { maxHp: 140, attack: 15, defense: 25, speed: 6 },
    skills: [
      { id: 'smash', name: '重击', minLevel: 1, damageMult: 1.0, critBonus: 0, desc: '普通攻击' },
      { id: 'stone_armor', name: '岩石护甲', minLevel: 3, type: 'buff', defenseBuff: 0.5, duration: 3, desc: '提升防御50%' },
      { id: 'earthquake', name: '地震', minLevel: 5, damageMult: 1.2, aoeStunChance: 0.3, desc: '1.2倍伤害+30%眩晕' },
      { id: 'taunt', name: '嘲讽', minLevel: 8, type: 'debuff', enemyAttackDown: 0.3, duration: 2, desc: '降低敌人攻击30%' }
    ]
  },
  silver_rhino: {
    id: 'silver_rhino',
    name: '银甲巨犀',
    icon: '🦏',
    description: '身披银色甲壳的巨型犀牛，重甲型召唤兽，防御极高。',
    rarity: '稀有',
    baseStats: { maxHp: 120, attack: 20, defense: 30, speed: 8 },
    skills: [
      { id: 'charge', name: '冲撞', minLevel: 1, damageMult: 1.0, critBonus: 0, desc: '普通攻击' },
      { id: 'iron_hide', name: '铁甲', minLevel: 3, type: 'buff', defenseBuff: 0.6, duration: 3, desc: '提升防御60%' },
      { id: 'horn_strike', name: '角击', minLevel: 5, damageMult: 1.8, desc: '1.8倍伤害' },
      { id: 'fortify', name: '坚守', minLevel: 8, type: 'buff', defenseBuff: 1.0, hpRegen: 0.1, duration: 2, desc: '防御+100%，每回合回10%HP' }
    ]
  },
  nether_fox: {
    id: 'nether_fox',
    name: '幽冥狐',
    icon: '🦊',
    description: '来自幽冥的狐狸型召唤兽，敏捷型，速度极快，擅长暴击。',
    rarity: '稀有',
    baseStats: { maxHp: 60, attack: 30, defense: 6, speed: 25 },
    skills: [
      { id: 'claw', name: '利爪', minLevel: 1, damageMult: 1.0, critBonus: 0.15, desc: '普通攻击，15%暴击' },
      { id: 'phantom', name: '幻影', minLevel: 3, type: 'buff', evasionBonus: 0.4, duration: 2, desc: '40%闪避率' },
      { id: 'shadow_step', name: '暗影步', minLevel: 5, damageMult: 1.3, critBonus: 0.5, doubleHitChance: 0.3, desc: '1.3倍+50%暴击，30%连击' },
      { id: 'death_blow', name: '致命一击', minLevel: 8, damageMult: 2.5, critBonus: 0.5, desc: '2.5倍伤害+50%暴击' }
    ]
  },
  four_eye_python: {
    id: 'four_eye_python',
    name: '四瞳巨蟒',
    icon: '🐍',
    description: '拥有四只眼睛的巨蟒，控制型召唤兽，擅长中毒和缠绕。',
    rarity: '稀有',
    baseStats: { maxHp: 90, attack: 22, defense: 12, speed: 12 },
    skills: [
      { id: 'fang', name: '毒牙', minLevel: 1, damageMult: 1.0, poisonChance: 0.4, poisonDamage: 5, poisonDuration: 3, desc: '40%中毒' },
      { id: 'coil', name: '缠绕', minLevel: 3, damageMult: 0.8, bindChance: 0.5, bindDuration: 1, desc: '0.8倍+50%束缚1回合' },
      { id: 'gaze', name: '四瞳凝视', minLevel: 5, type: 'debuff', stunChance: 0.4, stunDuration: 1, desc: '40%眩晕1回合' },
      { id: 'venom_spray', name: '剧毒喷射', minLevel: 8, damageMult: 1.2, poisonChance: 0.8, poisonDamage: 12, poisonDuration: 4, desc: '1.2倍+80%剧毒' }
    ]
  }
};

// 随机获取一只初阶召唤兽
function getRandomStarterBeast() {
  const ids = Object.keys(DataSummonBeasts);
  // 稀有度权重：普通60%，稀有40%
  const weights = {
    shadow_wolf: 25,
    rock_golem: 25,
    silver_rhino: 18,
    nether_fox: 18,
    four_eye_python: 14
  };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (const id of ids) {
    rand -= weights[id] || 10;
    if (rand <= 0) return DataSummonBeasts[id];
  }
  return DataSummonBeasts[ids[0]];
}
