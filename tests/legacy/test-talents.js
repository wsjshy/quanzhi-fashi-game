import fs from 'fs.js';
let content = fs.readFileSync('engine/data/talents.js', 'utf8');
content = content.replace(/^const /gm, 'var ');
eval(content);
console.log('Total talents:', Object.keys(DataTalents).length);
const types = {};
Object.values(DataTalents).forEach(t => types[t.type] = (types[t.type]||0)+1);
console.log('Types:', types);
const legendaries = Object.values(DataTalents).filter(t => t.rarity==='legendary');
console.log('Legendaries:', legendaries.map(t => t.name+'('+t.type+',maxLv='+t.maxLevel+')'));
// 检查growth天赋是否都有levelBonus对象
const growths = Object.values(DataTalents).filter(t => t.type==='growth');
const badGrowth = growths.filter(t => typeof t.levelBonus !== 'object');
console.log('Growth talents without object levelBonus:', badGrowth.map(t=>t.id));
