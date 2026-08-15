const fs = require('fs');
const code = fs.readFileSync('C:/Users/22210/Desktop/quanzhi-fashi-game-master/engine/data/locations.js', 'utf8');
const locRegex = /(\w+):\s*{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
let m;
const locs = [];
while ((m = locRegex.exec(code)) !== null) {
  const start = m.index;
  const rest = code.slice(start);
  const endMatch = rest.match(/^\s{2}\},\s*$/m);
  const block = endMatch ? rest.slice(0, endMatch.index) : rest;
  const actions = (block.match(/id:\s*"/g) || []).length - 1;
  const npcsMatch = block.match(/npcs:\s*\[([^\]]*)\]/);
  const npcs = npcsMatch ? npcsMatch[1].split(',').filter(s => s.trim()).length : 0;
  const enemiesMatch = block.match(/enemies:\s*\[([^\]]*)\]/);
  const enemies = enemiesMatch ? enemiesMatch[1].split(',').filter(s => s.trim()).length : 0;
  const desc = (block.match(/description:\s*"([^"]*)"/) || [])[1] || '';
  locs.push({id: m[2], name: m[3], actions, npcs, enemies, desc: desc.substring(0, 50)});
}
locs.forEach(l => console.log(
  l.id.padEnd(25), 
  l.name.padEnd(12), 
  ('actions:'+l.actions).padEnd(11), 
  ('npcs:'+l.npcs).padEnd(7), 
  ('enemies:'+l.enemies).padEnd(10), 
  l.desc
));
console.log('\n总计:', locs.length, '个地点');
