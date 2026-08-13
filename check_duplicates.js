const fs = require('fs');
const content = fs.readFileSync('./engine/data/skills.js', 'utf8');
const lines = content.split('\n');
const keyCounts = {};
lines.forEach((line, i) => {
  // 匹配 2个空格开头，然后是单词，然后是冒号和大括号
  const match = line.match(/^  (\w+):\s*\{/);
  if (match) {
    const key = match[1];
    if (!keyCounts[key]) keyCounts[key] = [];
    keyCounts[key].push(i+1);
  }
});
const duplicates = Object.entries(keyCounts).filter(([key, lines]) => lines.length > 1);
console.log('Duplicate object keys:');
duplicates.forEach(([key, lineNums]) => {
  console.log('  ' + key + ': lines ' + lineNums.join(', '));
  // 对每个重复的键，显示其name和isDemonSkill
  lineNums.forEach(ln => {
    let name = '', isDemon = false, id = '';
    for (let j = ln-1; j < Math.min(ln+20, lines.length); j++) {
      const nameMatch = lines[j].match(/name:\s*['"]([^'"]+)['"]/);
      if (nameMatch && !name) name = nameMatch[1];
      const idMatch = lines[j].match(/id:\s*['"]([^'"]+)['"]/);
      if (idMatch && !id) id = idMatch[1];
      if (lines[j].includes('isDemonSkill: true')) isDemon = true;
    }
    console.log('    line ' + ln + ': id=' + id + ', name=' + name + (isDemon ? ' [DEMON]' : ' [PLAYER]'));
  });
});
