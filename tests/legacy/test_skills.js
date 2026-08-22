// 测试技能系统
import fs from 'fs.js';
import path from 'path.js';

// 加载技能数据
const skillsCode = fs.readFileSync(path.join(__dirname, 'engine/data/skills.js'), 'utf8');

// 模拟SkillSystem
const SkillSystem = {
    skills: {},
    getSkill(id) {
        return this.skills[id] || null;
    },
    register(skill) {
        if (skill && skill.id) {
            this.skills[skill.id] = skill;
        }
    }
};

// 执行技能代码（提取SKILL_DATA对象）
try {
    // 提取DataSkills对象
    const match = skillsCode.match(/const\s+DataSkills\s*=\s*({[\s\S]*?});\s*\n/);
    if (match) {
        const skillDataCode = match[1];
        // 使用eval解析
        const DataSkills = eval('(' + skillDataCode + ')');
        for (const id in DataSkills) {
            SkillSystem.register(DataSkills[id]);
        }
        console.log('Total skills loaded:', Object.keys(SkillSystem.skills).length);
        
        // 测试雷系玩家技能
        const thunderSkills = ['thunder_bolt', 'thunder_drive', 'thunder_chain', 'thunder_strike'];
        console.log('\n=== 雷系玩家技能 ===');
        for (const id of thunderSkills) {
            const skill = SkillSystem.getSkill(id);
            if (skill) {
                console.log(`${id}: ${skill.name}, type=${skill.type}, mpCost=${skill.mpCost}, isDemonSkill=${skill.isDemonSkill}`);
            } else {
                console.log(`${id}: NOT FOUND!`);
            }
        }
        
        // 测试妖魔技能
        const demonSkills = ['demon_lightning_arrow', 'demon_thunder_strike', 'demon_earth_shield'];
        console.log('\n=== 妖魔技能 ===');
        for (const id of demonSkills) {
            const skill = SkillSystem.getSkill(id);
            if (skill) {
                console.log(`${id}: ${skill.name}, type=${skill.type}, isDemonSkill=${skill.isDemonSkill}`);
            } else {
                console.log(`${id}: NOT FOUND!`);
            }
        }
        
        // 测试findBestDamageSkill逻辑
        console.log('\n=== 模拟findBestDamageSkill ===');
        const playerSkills = ['thunder_bolt', 'thunder_drive', 'thunder_chain', 'thunder_strike'];
        const player = { mp: 82, attack: 20 };
        const enemy = { elements: ['dark'] };
        
        let bestSkill = null;
        let bestDamage = 0;
        
        for (const skillId of playerSkills) {
            const skill = SkillSystem.getSkill(skillId);
            if (skill && skill.type === 'damage' && !skill.isDemonSkill) {
                let baseDamage = skill.baseDamage || 0;
                if (skill.power) {
                    baseDamage = Math.max(baseDamage, player.attack * skill.power);
                }
                const damageMultiplier = skill.damageMultiplier || 1;
                let finalDamage = baseDamage * damageMultiplier;
                
                console.log(`${skill.name}: baseDamage=${baseDamage}, finalDamage=${finalDamage}, mpCost=${skill.mpCost}, mpOk=${player.mp >= skill.mpCost}`);
                
                if (finalDamage > bestDamage && player.mp >= skill.mpCost) {
                    bestDamage = finalDamage;
                    bestSkill = skill;
                }
            }
        }
        
        if (bestSkill) {
            console.log(`\nBest skill: ${bestSkill.name} (${bestDamage} damage)`);
        } else {
            console.log('\nNo damage skill found!');
        }
        
    } else {
        console.log('Could not find SKILL_DATA');
    }
} catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
}
