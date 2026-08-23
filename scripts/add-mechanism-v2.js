/**
 * 批量为天赋添加mechanism字段（修正版v2）
 * 使用更精确的正则表达式匹配每个天赋块
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const talentsPath = path.join(__dirname, '..', 'src', 'data', 'talents.js');

let content = fs.readFileSync(talentsPath, 'utf8');

// 需要添加mechanism的天赋列表
const talentsToAdd = [
  // 冰系
  { id: 'ice_talent_absolute', mechanism: 'form' },
  // 雷系
  { id: 'thunder_talent_paralyze', mechanism: 'state' },
  { id: 'thunder_talent_sky', mechanism: 'resource' },
  // 土系
  { id: 'earth_talent_heart', mechanism: 'state' },
  { id: 'earth_talent_shield', mechanism: 'form' },
  { id: 'earth_talent_quake', mechanism: 'trigger' },
  // 风系
  { id: 'wind_talent_heart', mechanism: 'state' },
  { id: 'wind_talent_double', mechanism: 'trigger' },
  { id: 'wind_talent_storm', mechanism: 'resource' },
  // 水系
  { id: 'water_talent_moist', mechanism: 'state' },
  { id: 'water_talent_tide', mechanism: 'form' },
  // 光系
  { id: 'light_talent_holy', mechanism: 'state' },
  { id: 'light_talent_divine', mechanism: 'resource' },
  // 暗系
  { id: 'dark_talent_heart', mechanism: 'state' },
  { id: 'dark_talent_stealth', mechanism: 'form' },
  // 治愈系
  { id: 'heal_talent_blessing', mechanism: 'state' },
  { id: 'heal_talent_spring', mechanism: 'resource' },
];

let addedCount = 0;
let skippedCount = 0;

for (const { id, mechanism } of talentsToAdd) {
  // 精确匹配天赋块：从id开始到下一个天赋定义或文件结束
  const talentStart = content.indexOf(`id: "${id}"`);
  if (talentStart === -1) {
    console.log(`未找到天赋: ${id}`);
    continue;
  }

  // 找到天赋块的结束位置（下一个 \n  // 注释 或 \n  [a-z]_talent 或 \n};）
  const afterId = content.substring(talentStart);
  const nextComment = afterId.indexOf('\n  // ');
  const nextTalent = afterId.indexOf('\n  ');
  const endMatch = afterId.match(/\n  [a-z_]+: \{/);
  let blockEnd = afterId.length;
  if (nextComment > 0 && nextComment < blockEnd) blockEnd = nextComment;
  if (endMatch && endMatch.index > 0 && endMatch.index < blockEnd) blockEnd = endMatch.index;

  const talentBlock = afterId.substring(0, blockEnd);

  if (talentBlock.includes('mechanism:')) {
    console.log(`跳过（已有mechanism）: ${id}`);
    skippedCount++;
    continue;
  }

  // 在type字段后面添加mechanism字段
  const typeMatch = talentBlock.match(/(type: "[^"]+",)/);
  if (typeMatch) {
    const insertPos = talentStart + talentBlock.indexOf(typeMatch[1]) + typeMatch[1].length;
    content = content.substring(0, insertPos) + `\n    mechanism: "${mechanism}",` + content.substring(insertPos);
    console.log(`添加mechanism: ${id} -> ${mechanism}`);
    addedCount++;
  } else {
    // 如果没有type字段，在rarity字段后面添加
    const rarityMatch = talentBlock.match(/(rarity: "[^"]+",)/);
    if (rarityMatch) {
      const insertPos = talentStart + talentBlock.indexOf(rarityMatch[1]) + rarityMatch[1].length;
      content = content.substring(0, insertPos) + `\n    mechanism: "${mechanism}",` + content.substring(insertPos);
      console.log(`添加mechanism(无type): ${id} -> ${mechanism}`);
      addedCount++;
    } else {
      console.log(`无法添加: ${id}`);
    }
  }
}

fs.writeFileSync(talentsPath, content, 'utf8');

console.log(`\n完成！添加了 ${addedCount} 个mechanism字段，跳过了 ${skippedCount} 个已有字段的天赋。`);
