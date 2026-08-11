const fs = require('fs');
const vm = require('vm');
const sandbox = { 
    console: console, 
    window: {addEventListener:()=>{}}, 
    document: {addEventListener:()=>{},getElementById:()=>null,createElement:()=>({style:{},appendChild:()=>{}}),body:{appendChild:()=>{}}}, 
    localStorage:{getItem:()=>null,setItem:()=>{}} 
};
vm.createContext(sandbox);
const files = ['engine/data/skills.js','engine/data/characters.js','engine/data/locations.js','engine/data/items.js','engine/data/quests.js','engine/data/events.js','engine/data/shops.js','engine/data/enemies.js','engine/data/world.js','engine/data/index.js'];
for (const f of files) {
    const code = fs.readFileSync(f, 'utf8');
    vm.runInContext(code, sandbox, {filename: f});
}
const checkCode = `
console.log('DataSkills类型:', typeof DataSkills);
console.log('DataSkills keys:', Object.keys(DataSkills).slice(0,5));
console.log('DataLocations类型:', typeof DataLocations);
console.log('DataLocations keys:', Object.keys(DataLocations));
console.log('GameData类型:', typeof GameData);
console.log('GameData keys:', Object.keys(GameData));
console.log('GameData.locations类型:', typeof GameData.locations);
console.log('GameData.locations keys:', Object.keys(GameData.locations || {}));
`;
vm.runInContext(checkCode, sandbox);
