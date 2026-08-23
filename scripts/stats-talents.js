/**
 * 统计天赋系统数据
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 统计系别天赋
const talentsPath = path.join(__dirname, '..', 'src', 'data', 'talents.js');
const talentsContent = fs.readFileSync(talentsPath, 'utf8');

const elements = ['fire', 'ice', 'thunder', 'water', 'wind', 'earth', 'light', 'dark', 'heal', 'summon', 'plant'];
const elementNames = {fire:'火系', ice:'冰系', thunder:'雷系', water:'水系', wind:'风系', earth:'土系', light:'光系', dark:'暗系', heal:'治愈系', summon:'召唤系', plant:'植物系'};

console.log('=== 系别天赋统计 ===\n');

let totalTalents = 0;
let totalWithMechanism = 0;

elements.forEach(elem => {
  const elemPattern = new RegExp('element: "' + elem + '"', 'g');
  const matches = talentsContent.match(elemPattern);
  const count = matches ? matches.length : 0;
  totalTalents += count;

  // 统计有mechanism字段的
  const mechPattern = new RegExp('element: "' + elem + '"[\\s\\S]*?mechanism: "([^"]+)"', 'g');
  const mechMatches = [...talentsContent.matchAll(mechPattern)];
  const mechCount = mechMatches.length;
  totalWithMechanism += mechCount;

  console.log(elementNames[elem] + ': ' + count + '个天赋，' + mechCount + '个有mechanism');
});

console.log('\n总计: ' + totalTalents + '个天赋，' + totalWithMechanism + '个有mechanism字段');

// 统计机制类型分布
const mechanismTypes = {};
const mechAllPattern = /mechanism: "([^"]+)"/g;
const allMechMatches = [...talentsContent.matchAll(mechAllPattern)];
allMechMatches.forEach(m => {
  mechanismTypes[m[1]] = (mechanismTypes[m[1]] || 0) + 1;
});

console.log('\n机制类型分布:');
const typeNames = {state:'状态叠加', trigger:'条件触发', resource:'资源积累', form:'形态切换', summon:'召唤协同', passive:'纯被动'};
Object.entries(mechanismTypes).forEach(([type, count]) => {
  console.log('  ' + type + ' (' + (typeNames[type] || type) + '): ' + count + '个');
});

// 统计天生天赋
console.log('\n\n=== 天生天赋统计 ===\n');

const innatePath = path.join(__dirname, '..', 'src', 'data', 'innate-talents.js');
const innateContent = fs.readFileSync(innatePath, 'utf8');

// 按天赋块分割
const innateBlocks = innateContent.split(/\n    [a-z_]+: \{/).slice(1);
console.log('天生天赋总数: ' + innateBlocks.length + '\n');

// 按稀有度统计
const rarityCount = {};
const typeCount = {};
const innateList = [];

innateBlocks.forEach(block => {
  const idMatch = block.match(/id: '([^']+)'/);
  const nameMatch = block.match(/name: '([^']+)'/);
  const rarityMatch = block.match(/rarity: '([^']+)'/);
  const typeMatch = block.match(/type: '([^']+)'/);
  const weightMatch = block.match(/weight: (\d+)/);

  const id = idMatch ? idMatch[1] : 'unknown';
  const name = nameMatch ? nameMatch[1] : 'unknown';
  const rarity = rarityMatch ? rarityMatch[1] : 'unknown';
  const type = typeMatch ? typeMatch[1] : 'none';
  const weight = weightMatch ? parseInt(weightMatch[1]) : 0;

  rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
  typeCount[type] = (typeCount[type] || 0) + 1;
  innateList.push({id, name, rarity, type, weight});
});

console.log('稀有度分布:');
Object.entries(rarityCount).forEach(([r, c]) => console.log('  ' + r + ': ' + c + '个'));

console.log('\n类型分布:');
Object.entries(typeCount).forEach(([t, c]) => console.log('  ' + t + ': ' + c + '个'));

console.log('\n天赋列表:');
innateList.forEach((t, i) => {
  console.log('  ' + (i+1) + '. ' + t.name + ' (' + t.id + ') - ' + t.rarity + ' - ' + t.type + ' - 权重:' + t.weight);
});
