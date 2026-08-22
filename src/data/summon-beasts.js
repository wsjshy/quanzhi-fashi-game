/**
 * 召唤兽数据
 * 不同召唤兽有不同属性倾向和专属技能
 * 贴合小说设定：初阶召唤时随机契约一种
 */

export const DataSummonBeasts = {
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
  },
  wind_wing_bird: {
    id: 'wind_wing_bird',
    name: '风翼鸟',
    icon: '🐦',
    description: '来自召唤位面的飞禽召唤兽，飞行型，速度极快，擅长风系攻击和闪避。',
    rarity: '普通',
    baseStats: { maxHp: 65, attack: 22, defense: 7, speed: 28 },
    skills: [
      { id: 'wind_peck', name: '风啄', minLevel: 1, damageMult: 1.0, critBonus: 0.15, desc: '风属性啄击，15%暴击' },
      { id: 'gale', name: '疾风', minLevel: 3, type: 'buff', speedBonus: 0.5, evasionBonus: 0.3, duration: 3, desc: '速度+50%，闪避+30%' },
      { id: 'wind_blade', name: '风刃', minLevel: 5, damageMult: 1.3, desc: '远程风刃，1.3倍伤害' },
      { id: 'dive_bomb', name: '俯冲', minLevel: 8, damageMult: 2.0, stunChance: 0.3, stunDuration: 1, desc: '高空俯冲，2倍伤害+30%眩晕' }
    ]
  },
  white_armor_scorpion: {
    id: 'white_armor_scorpion',
    name: '白铠战蛰',
    icon: '🦂',
    description: '来自召唤位面的虫型召唤兽，身披白色甲壳，坦克型，高防+反击+毒刺。参考小说第149章召唤系学生的契约兽。',
    rarity: '稀有',
    baseStats: { maxHp: 110, attack: 18, defense: 28, speed: 10 },
    skills: [
      { id: 'pincer_strike', name: '钳击', minLevel: 1, damageMult: 1.0, desc: '巨钳夹击' },
      { id: 'hard_shell', name: '硬壳', minLevel: 3, type: 'buff', defenseBuff: 0.6, duration: 3, desc: '防御+60%' },
      { id: 'poison_sting', name: '毒刺', minLevel: 5, damageMult: 1.2, poisonChance: 0.5, poisonDamage: 8, poisonDuration: 3, desc: '1.2倍+50%中毒' },
      { id: 'counter_stance', name: '反击姿态', minLevel: 8, type: 'buff', defenseBuff: 0.8, damageReflect: 0.5, duration: 2, desc: '防御+80%，反伤50%' }
    ]
  }
};

// 随机获取一只初阶召唤兽
function getRandomStarterBeast() {
  const ids = Object.keys(DataSummonBeasts);
  // 稀有度权重：普通60%，稀有40%
  const weights = {
    shadow_wolf: 20,
    rock_golem: 20,
    wind_wing_bird: 15,
    silver_rhino: 14,
    nether_fox: 14,
    four_eye_python: 10,
    white_armor_scorpion: 7
  };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (const id of ids) {
    rand -= weights[id] || 10;
    if (rand <= 0) return DataSummonBeasts[id];
  }
  return DataSummonBeasts[ids[0]];
}

/**
 * 召唤兽进化路线数据
 * 每个基础形态有2次进化：进阶(Lv10+中阶) → 精英(Lv20+高阶)
 */
export const DataSummonBeastEvolutions = {
  shadow_wolf: {
    base: 'shadow_wolf',
    line: [
      {
        fromId: 'shadow_wolf',
        toId: 'evil_wolf',
        name: '邪狼',
        icon: '🐺‍⬛',
        description: '幽狼兽进化后的形态，暗属性力量觉醒，速度和攻击大幅提升，眼神中透着狡黠与凶残。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'dark_claw', name: '暗爪', minLevel: 10, damageMult: 1.8, critBonus: 0.2, desc: '暗属性爪击，1.8倍伤害' },
          { id: 'shadow_pounce', name: '暗影扑击', minLevel: 13, damageMult: 1.5, doubleHitChance: 0.5, desc: '1.5倍+50%连击' }
        ]
      },
      {
        fromId: 'evil_wolf',
        toId: 'wolf_general',
        name: '狼将',
        icon: '⚔️',
        description: '邪狼进化为狼将，召唤位面狼族统领，身披暗银铠甲，气势威严，可号令狼群。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'howl_command', name: '号令之嚎', minLevel: 20, type: 'buff', attackBuff: 0.8, defenseBuff: 0.5, duration: 3, desc: '攻击+80%，防御+50%' },
          { id: 'wolf_general_strike', name: '将星斩', minLevel: 23, damageMult: 3.0, critBonus: 0.4, desc: '3倍伤害+40%暴击' }
        ]
      }
    ]
  },
  rock_golem: {
    base: 'rock_golem',
    line: [
      {
        fromId: 'rock_golem',
        toId: 'rock_warrior',
        name: '岩魔士',
        icon: '🪨',
        description: '岩魔人进化形态，岩石身躯更加坚固，体型增大，能操控大地之力。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'boulder_throw', name: '投石', minLevel: 10, damageMult: 1.6, aoeStunChance: 0.4, desc: '1.6倍+40%眩晕' },
          { id: 'stone_wall', name: '石墙', minLevel: 13, type: 'buff', defenseBuff: 1.2, duration: 3, desc: '防御+120%' }
        ]
      },
      {
        fromId: 'rock_warrior',
        toId: 'rock_general',
        name: '岩魔将',
        icon: '🏔️',
        description: '岩魔士进化为岩魔将，召唤位面岩族将军，如山岳般不可撼动。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'mountain_crush', name: '崩山击', minLevel: 20, damageMult: 2.5, aoeStunChance: 0.6, desc: '2.5倍+60%眩晕' },
          { id: 'earth_domain', name: '大地领域', minLevel: 23, type: 'buff', defenseBuff: 1.5, hpRegen: 0.15, duration: 3, desc: '防御+150%，每回合回15%HP' }
        ]
      }
    ]
  },
  silver_rhino: {
    base: 'silver_rhino',
    line: [
      {
        fromId: 'silver_rhino',
        toId: 'gold_rhino',
        name: '金甲战犀',
        icon: '🛡️',
        description: '银甲巨犀进化形态，甲壳变为金色，防御力惊人，冲锋势不可挡。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'gold_charge', name: '金甲冲锋', minLevel: 10, damageMult: 2.2, desc: '2.2倍伤害' },
          { id: 'war_cry', name: '战吼', minLevel: 13, type: 'buff', attackBuff: 0.4, defenseBuff: 0.4, duration: 3, desc: '攻击+40%，防御+40%' }
        ]
      },
      {
        fromId: 'gold_rhino',
        toId: 'mystic_rhino',
        name: '玄甲犀将',
        icon: '⚜️',
        description: '金甲战犀进化为玄甲犀将，甲壳上浮现神秘符文，传说级召唤兽。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'rune_guard', name: '符文守护', minLevel: 20, type: 'buff', defenseBuff: 2.0, hpRegen: 0.2, duration: 3, desc: '防御+200%，每回合回20%HP' },
          { id: 'mystic_horn', name: '玄角穿刺', minLevel: 23, damageMult: 3.5, desc: '3.5倍伤害，无视50%防御' }
        ]
      }
    ]
  },
  nether_fox: {
    base: 'nether_fox',
    line: [
      {
        fromId: 'nether_fox',
        toId: 'spirit_fox',
        name: '幽冥灵狐',
        icon: '✨',
        description: '幽冥狐进化形态，身形更加灵动，掌握幽冥之力，可穿梭阴影。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'spirit_dash', name: '灵闪', minLevel: 10, damageMult: 1.6, critBonus: 0.5, doubleHitChance: 0.4, desc: '1.6倍+50%暴击+40%连击' },
          { id: 'vanish', name: '虚化', minLevel: 13, type: 'buff', evasionBonus: 0.7, duration: 2, desc: '70%闪避率' }
        ]
      },
      {
        fromId: 'spirit_fox',
        toId: 'nine_tail_fox',
        name: '九尾幽冥',
        icon: '🌙',
        description: '幽冥灵狐进化为九尾幽冥，召唤位面狐族至尊，九条尾巴蕴含幽冥之力。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'nine_tail_strike', name: '九尾连击', minLevel: 20, damageMult: 1.0, critBonus: 0.3, doubleHitChance: 0.9, desc: '9连击！每击1倍+30%暴击' },
          { id: 'moon_veil', name: '月华面纱', minLevel: 23, type: 'buff', evasionBonus: 0.5, critBonus: 1.0, duration: 3, desc: '50%闪避+100%暴击' }
        ]
      }
    ]
  },
  four_eye_python: {
    base: 'four_eye_python',
    line: [
      {
        fromId: 'four_eye_python',
        toId: 'eight_eye_python',
        name: '八瞳巨蟒',
        icon: '👁️',
        description: '四瞳巨蟒进化形态，八只眼睛同时睁开可石化敌人，毒性更烈。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'petrify_gaze', name: '石化凝视', minLevel: 10, type: 'debuff', stunChance: 0.6, stunDuration: 2, desc: '60%眩晕2回合' },
          { id: 'deadly_venom', name: '致命毒液', minLevel: 13, damageMult: 1.0, poisonChance: 1.0, poisonDamage: 20, poisonDuration: 5, desc: '100%中毒，每回合20伤害' }
        ]
      },
      {
        fromId: 'eight_eye_python',
        toId: 'thousand_eye_serpent',
        name: '万瞳蛇王',
        icon: '👑',
        description: '八瞳巨蟒进化为万瞳蛇王，召唤位面蛇族帝王，万眼齐睁可震慑万物。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'thousand_eyes', name: '万瞳震慑', minLevel: 20, type: 'debuff', stunChance: 0.8, stunDuration: 2, enemyAttackDown: 0.5, duration: 3, desc: '80%眩晕2回合+攻击-50%' },
          { id: 'venom_storm', name: '毒雾风暴', minLevel: 23, damageMult: 1.5, poisonChance: 1.0, poisonDamage: 30, poisonDuration: 5, desc: '1.5倍+剧毒30/回合' }
        ]
      }
    ]
  },
  wind_wing_bird: {
    base: 'wind_wing_bird',
    line: [
      {
        fromId: 'wind_wing_bird',
        toId: 'thunder_wing_hawk',
        name: '雷翼鹰',
        icon: '⚡',
        description: '风翼鸟进化形态，羽翼上凝出雷电，速度突破音障，风雷双系攻击。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'thunder_claw', name: '雷电爪', minLevel: 10, damageMult: 1.5, shockChance: 0.4, shockDamage: 8, shockDuration: 3, desc: '1.5倍+40%感电' },
          { id: 'thunder_dive', name: '雷鸣俯冲', minLevel: 13, damageMult: 2.0, stunChance: 0.2, stunDuration: 1, shockChance: 0.5, desc: '2倍+20%眩晕+50%感电' }
        ]
      },
      {
        fromId: 'thunder_wing_hawk',
        toId: 'sky_eagle',
        name: '天鹰',
        icon: '🦅',
        description: '雷翼鹰进化为天鹰，召唤位面飞禽之王，翼展遮天，掌控风暴与雷霆。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'sky_thunder', name: '天雷', minLevel: 20, damageMult: 2.5, shockChance: 0.6, shockDamage: 15, shockDuration: 3, paralyzeChance: 0.3, paralyzeDuration: 1, desc: '2.5倍+60%感电+30%麻痹' },
          { id: 'storm_domain', name: '风暴领域', minLevel: 23, type: 'buff', speedBonus: 1.0, evasionBonus: 0.5, attackBuff: 0.5, duration: 3, desc: '速度+100%，闪避+50%，攻击+50%' }
        ]
      }
    ]
  },
  white_armor_scorpion: {
    base: 'white_armor_scorpion',
    line: [
      {
        fromId: 'white_armor_scorpion',
        toId: 'red_armor_scorpion',
        name: '赤铠战蛰',
        icon: '🔴',
        description: '白铠战蛰进化形态，甲壳变为赤红色，体内孕育火焰，钳击附带灼烧。',
        minBeastLevel: 10,
        minPlayerRealm: 'middle',
        minLoyalty: 60,
        statMultiplier: 1.5,
        rarity: '稀有',
        newSkills: [
          { id: 'flame_pincer', name: '烈焰钳', minLevel: 10, damageMult: 1.8, burnChance: 0.4, burnDamage: 8, burnDuration: 3, desc: '1.8倍+40%燃烧' },
          { id: 'swarm_call', name: '蛰群召唤', minLevel: 13, damageMult: 0.8, doubleHitChance: 0.8, desc: '召唤小蛰群连击，0.8倍×2' }
        ]
      },
      {
        fromId: 'red_armor_scorpion',
        toId: 'scorpion_queen',
        name: '战蛰女王',
        icon: '👸',
        description: '赤铠战蛰进化为战蛰女王，召唤位面虫群统治者，号令万千战蛰，剧毒无双。',
        minBeastLevel: 20,
        minPlayerRealm: 'high',
        minLoyalty: 80,
        statMultiplier: 2.0,
        rarity: '史诗',
        newSkills: [
          { id: 'queen_command', name: '女王号令', minLevel: 20, type: 'buff', attackBuff: 0.6, defenseBuff: 0.6, doubleHitChance: 0.5, duration: 3, desc: '攻击+60%，防御+60%，50%连击' },
          { id: 'poison_fog', name: '毒雾', minLevel: 23, damageMult: 1.5, poisonChance: 1.0, poisonDamage: 25, poisonDuration: 5, stunChance: 0.3, stunDuration: 1, desc: '1.5倍+剧毒25/回合+30%眩晕' }
        ]
      }
    ]
  }
};

/**
 * 获取召唤兽当前形态数据（考虑进化）
 * @param {Object} summonData - Player.summonData
 * @returns {Object} 合并了进化加成的召唤兽数据
 */
function getBeastCurrentData(summonData) {
  if (!summonData) return null;
  let base = DataSummonBeasts[summonData.id];
  if (!base) {
    // 可能是进化后的形态，从进化线中找
    for (const line of Object.values(DataSummonBeastEvolutions)) {
      const evoIndex = line.line.findIndex(e => e.toId === summonData.id);
      if (evoIndex >= 0) {
        const evo = line.line[evoIndex];
        // 累积基础技能 + 之前所有进化阶段的新技能
        let allSkills = [...DataSummonBeasts[line.base].skills];
        for (let i = 0; i <= evoIndex; i++) {
          allSkills = [...allSkills, ...(line.line[i].newSkills || [])];
        }
        base = {
          id: evo.toId,
          name: evo.name,
          icon: evo.icon,
          description: evo.description,
          rarity: evo.rarity,
          baseStats: DataSummonBeasts[line.base].baseStats,
          skills: allSkills
        };
        break;
      }
    }
  }
  if (!base) return null;

  // 计算进化倍率
  let statMult = 1;
  const evoLine = DataSummonBeastEvolutions[base.id] || Object.values(DataSummonBeastEvolutions).find(l => {
    return l.line.some(e => e.toId === summonData.id);
  });
  if (evoLine) {
    for (const evo of evoLine.line) {
      if (summonData.evolutionStage >= 1 && evo.toId === summonData.id) {
        statMult = evo.statMultiplier;
        break;
      }
    }
  }

  return {
    ...base,
    statMultiplier: statMult,
    effectiveStats: {
      maxHp: Math.floor(base.baseStats.maxHp * statMult),
      attack: Math.floor(base.baseStats.attack * statMult),
      defense: Math.floor(base.baseStats.defense * statMult),
      speed: Math.floor(base.baseStats.speed * statMult)
    }
  };
}

/**
 * 检查召唤兽是否可以进化
 */
function canEvolve(summonData, playerRealm) {
  if (!summonData) return null;
  const evoLine = DataSummonBeastEvolutions[summonData.baseId || summonData.id];
  if (!evoLine) return null;
  const currentStage = summonData.evolutionStage || 0;
  const nextEvo = evoLine.line[currentStage];
  if (!nextEvo) return null;
  if (summonData.level < nextEvo.minBeastLevel) return null;
  if (summonData.loyalty < nextEvo.minLoyalty) return null;
  // 境界检查简化：middle=中阶(8+), high=高阶(15+)
  const realmOrder = { 'initial': 1, 'primary': 1, 'middle': 2, 'high': 3 };
  if ((realmOrder[playerRealm] || 1) < (realmOrder[nextEvo.minPlayerRealm] || 1)) return null;
  return nextEvo;
}

export default DataSummonBeasts;
