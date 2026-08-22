/**
 * 批量为天赋添加mechanism字段
 * 根据天赋名称和描述判断机制类型
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const talentsPath = path.join(__dirname, '..', 'src', 'data', 'talents.js');

let content = fs.readFileSync(talentsPath, 'utf8');

// 机制类型映射：根据天赋ID前缀和名称判断机制类型
const mechanismMap = {
  // 火系
  fire_talent_burn: 'state',      // 燃烧之心 - 状态叠加
  fire_talent_crit: 'trigger',     // 爆炎 - 条件触发
  fire_talent_explosion: 'resource', // 焚天 - 资源积累
  fire_talent_legendary: 'passive', // 天生火魂 - 纯被动

  // 冰系
  ice_talent_freeze: 'state',      // 冰封之心 - 状态叠加
  ice_talent_slow: 'trigger',      // 冰霜 - 条件触发
  ice_talent_shield: 'form',       // 冰盾 - 形态切换
  ice_talent_legendary: 'passive', // 天生冰魂 - 纯被动

  // 雷系
  thunder_talent_chain: 'resource', // 连锁闪电 - 资源积累
  thunder_talent_stun: 'trigger',   // 雷击 - 条件触发
  thunder_talent_speed: 'state',    // 雷速 - 状态叠加
  thunder_talent_legendary: 'passive', // 天生雷魂 - 纯被动

  // 水系
  water_talent_heal: 'state',       // 治愈之水 - 状态叠加
  water_talent_shield: 'form',      // 水盾 - 形态切换
  water_talent_control: 'trigger',   // 水流控制 - 条件触发
  water_talent_legendary: 'passive', // 天生水魂 - 纯被动

  // 风系
  wind_talent_speed: 'state',       // 疾风 - 状态叠加
  wind_talent_dodge: 'trigger',     // 风之闪避 - 条件触发
  wind_talent_aoe: 'resource',      // 风暴 - 资源积累
  wind_talent_legendary: 'passive', // 天生风魂 - 纯被动

  // 土系
  earth_talent_defense: 'state',    // 岩石护甲 - 状态叠加
  earth_talent_counter: 'trigger',  // 反击 - 条件触发
  earth_talent_wall: 'form',        // 土墙 - 形态切换
  earth_talent_legendary: 'passive', // 天生土魂 - 纯被动

  // 光系
  light_talent_heal: 'state',       // 圣光治愈 - 状态叠加
  light_talent_buff: 'trigger',     // 祝福 - 条件触发
  light_talent_purify: 'resource',  // 净化 - 资源积累
  light_talent_legendary: 'passive', // 天生光魂 - 纯被动

  // 暗系
  dark_talent_drain: 'state',       // 吸血 - 状态叠加
  dark_talent_curse: 'trigger',     // 诅咒 - 条件触发
  dark_talent_summon: 'summon',     // 暗影召唤 - 召唤协同
  dark_talent_legendary: 'passive', // 天生暗魂 - 纯被动

  // 治愈系
  heal_talent_regen: 'state',       // 生命祝福 - 状态叠加
  heal_talent_purify: 'trigger',    // 净化 - 条件触发
  heal_talent_shield: 'form',       // 护盾 - 形态切换
  heal_talent_legendary: 'passive', // 天生圣体 - 纯被动

  // 植物系
  plant_talent_poison: 'state',     // 剧毒精通 - 状态叠加
  plant_talent_summon: 'summon',    // 共生 - 召唤协同
  plant_talent_field: 'resource',    // 森林领主 - 资源积累
  plant_talent_legendary: 'passive', // 世界树之种 - 纯被动
};

let addedCount = 0;
let skippedCount = 0;

for (const [talentId, mechanism] of Object.entries(mechanismMap)) {
  // 检查是否已经有mechanism字段
  const talentPattern = new RegExp(`id: "${talentId}"[\\s\\S]*?rarity: "([^"]+)"[\\s\\S]*?type: "([^"]+)"`, '');
  const match = content.match(talentPattern);

  if (!match) {
    console.log(`未找到天赋: ${talentId}`);
    continue;
  }

  // 检查是否已经有mechanism字段
  const talentBlockPattern = new RegExp(`id: "${talentId}"[\\s\\S]*?(?=\\n  // |\\n  [a-z]_talent|\\n};)`, '');
  const talentBlockMatch = content.match(talentBlockPattern);

  if (talentBlockMatch && talentBlockMatch[0].includes('mechanism:')) {
    console.log(`跳过（已有mechanism）: ${talentId}`);
    skippedCount++;
    continue;
  }

  // 在type字段后面添加mechanism字段
  const typePattern = new RegExp(`(id: "${talentId}"[\\s\\S]*?type: "[^"]+",)`);
  content = content.replace(typePattern, `$1\n    mechanism: "${mechanism}",`);
  console.log(`添加mechanism: ${talentId} -> ${mechanism}`);
  addedCount++;
}

fs.writeFileSync(talentsPath, content, 'utf8');

console.log(`\n完成！添加了 ${addedCount} 个mechanism字段，跳过了 ${skippedCount} 个已有字段的天赋。`);
