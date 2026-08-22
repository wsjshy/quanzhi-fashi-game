/**
 * L3 成长流程测试
 * 
 * 轻量状态机测试，不依赖jsdom
 * 覆盖：经验值计算、升级阈值、属性成长
 * 
 * 运行：node tests/progression.js
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { TestResult } from '../utils.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadPlayerSystem() {
    const playerCode = fs.readFileSync(path.join(__dirname, '..', '..', 'engine', 'player.js'), 'utf-8');
    // 替换const为var
    const code = playerCode.replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');
    
    const sandbox = {
        console: console,
        Math: Math,
        Date: Date,
        // 模拟依赖的全局对象
        SkillSystem: {
            getSkill: (id) => ({ id, name: id, element: 'fire', tier: '初阶' }),
            getSkillsByElement: () => []
        },
        TalentSystem: {
            getTalent: () => null,
            getInnateTalent: () => null
        },
        Inventory: {
            getAllItems: () => [],
            getItem: () => null
        },
        DataItems: {},
        DataSkills: {},
        DataTalents: {},
        DataInnateTalents: {},
        DataAchievements: {},
        UI: { showMessage: () => {}, update: () => {} },
        Game: { save: () => {} },
        AchievementSystem: { unlock: () => {} },
        DailySystem: { trackActivity: () => {} },
    };
    
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox;
}

function runProgressionTests() {
    console.log('\n📈 L3 成长流程测试');
    console.log('─'.repeat(60));
    
    const result = new TestResult();
    const sandbox = loadPlayerSystem();
    
    if (!sandbox.Player) {
        result.fail('无法加载Player系统');
        return result.report();
    }
    
    const Player = sandbox.Player;
    
    // ===== 1. 经验值阈值测试 =====
    console.log('\n1️⃣  经验值阈值计算');
    console.log('─'.repeat(40));
    
    if (typeof Player._calcExpToNext === 'function') {
        // Lv1需要80经验
        const lv1Exp = Player._calcExpToNext(1);
        if (lv1Exp === 80) {
            result.pass(`Lv1升级阈值: ${lv1Exp}（应为80）`);
        } else {
            result.fail(`Lv1升级阈值应该=80，实际=${lv1Exp}`);
        }
        
        // Lv10应该在初阶区间（80~596）
        const lv10Exp = Player._calcExpToNext(10);
        if (lv1Exp < lv10Exp && lv10Exp <= 596) {
            result.pass(`Lv10升级阈值: ${lv10Exp}（初阶区间80~596）`);
        } else {
            result.fail(`Lv10升级阈值应该在80~596之间，实际=${lv10Exp}`);
        }
        
        // Lv11应该进入中阶区间（500起）
        const lv11Exp = Player._calcExpToNext(11);
        if (lv11Exp === 500) {
            result.pass(`Lv11升级阈值: ${lv11Exp}（中阶起点500）`);
        } else {
            result.fail(`Lv11升级阈值应该=500，实际=${lv11Exp}`);
        }
        
        // 经验值应该随等级递增
        const lv5Exp = Player._calcExpToNext(5);
        const lv6Exp = Player._calcExpToNext(6);
        if (lv6Exp > lv5Exp) {
            result.pass(`经验值递增: Lv5=${lv5Exp} < Lv6=${lv6Exp}`);
        } else {
            result.fail(`经验值应该递增: Lv5=${lv5Exp}, Lv6=${lv6Exp}`);
        }
    } else {
        result.fail('_calcExpToNext函数不存在');
    }
    
    // ===== 2. 玩家初始化测试 =====
    console.log('\n2️⃣  玩家初始化');
    console.log('─'.repeat(40));
    
    if (typeof Player.init === 'function') {
        try {
            Player.init('测试玩家', 'fire');
            if (Player.level === 1) {
                result.pass(`初始化等级: ${Player.level}`);
            } else {
                result.fail(`初始化等级应该=1，实际=${Player.level}`);
            }
            if (Player.exp === 0) {
                result.pass(`初始化经验: ${Player.exp}`);
            } else {
                result.fail(`初始化经验应该=0，实际=${Player.exp}`);
            }
            if (Player.expToNext === 80) {
                result.pass(`初始化升级阈值: ${Player.expToNext}`);
            } else {
                result.fail(`初始化升级阈值应该=80，实际=${Player.expToNext}`);
            }
        } catch (e) {
            result.fail(`玩家初始化出错: ${e.message}`);
        }
    } else {
        result.fail('Player.init函数不存在');
    }
    
    // ===== 3. 获得经验测试 =====
    console.log('\n3️⃣  获得经验与升级');
    console.log('─'.repeat(40));
    
    if (typeof Player.gainExp === 'function') {
        try {
            // 重新初始化
            Player.init('测试玩家', 'fire');
            const initialLevel = Player.level;
            
            // 获得不足以升级的经验
            Player.gainExp(50, ['fire']);
            if (Player.exp === 50 && Player.level === initialLevel) {
                result.pass(`获得50经验: exp=${Player.exp}, level=${Player.level}（未升级）`);
            } else {
                result.fail(`获得50经验应该exp=50且不升级，实际exp=${Player.exp}, level=${Player.level}`);
            }
            
            // 获得足够经验升级
            const beforeLevel = Player.level;
            Player.gainExp(30, ['fire']); // 50+30=80，刚好升级
            if (Player.level > beforeLevel) {
                result.pass(`获得30经验后升级: level ${beforeLevel}→${Player.level}`);
            } else {
                result.fail(`获得80经验应该升级，实际level=${Player.level}`);
            }
            
            // 升级后经验应该重置或结转
            if (Player.expToNext > 80) {
                result.pass(`升级后阈值提升: ${Player.expToNext} (>80)`);
            } else {
                result.fail(`升级后阈值应该>80，实际=${Player.expToNext}`);
            }
        } catch (e) {
            result.fail(`获得经验出错: ${e.message}`);
        }
    } else {
        result.fail('Player.gainExp函数不存在');
    }
    
    // ===== 4. 属性成长测试 =====
    console.log('\n4️⃣  属性成长验证');
    console.log('─'.repeat(40));
    
    if (typeof Player.init === 'function' && typeof Player.gainExp === 'function') {
        try {
            Player.init('测试玩家', 'fire');
            const hpBefore = Player.maxHp;
            const mpBefore = Player.maxMp;
            const atkBefore = Player.attack;
            
            // 连续升级到Lv5
            for (let i = 0; i < 10; i++) {
                Player.gainExp(1000, ['fire']);
            }
            
            if (Player.level >= 5) {
                result.pass(`连续升级: Lv1→Lv${Player.level}`);
            } else {
                result.fail(`连续获得10000经验应该至少到Lv5，实际=${Player.level}`);
            }
            
            if (Player.maxHp > hpBefore) {
                result.pass(`HP成长: ${hpBefore}→${Player.maxHp}`);
            } else {
                result.fail(`升级后HP应该增长: ${hpBefore}→${Player.maxHp}`);
            }
            
            if (Player.attack > atkBefore) {
                result.pass(`攻击成长: ${atkBefore}→${Player.attack}`);
            } else {
                result.fail(`升级后攻击应该增长: ${atkBefore}→${Player.attack}`);
            }
        } catch (e) {
            result.fail(`属性成长测试出错: ${e.message}`);
        }
    } else {
        result.warn('属性成长测试需要init和gainExp函数');
    }
    
    return result.report();
}

export { runProgressionTests };
