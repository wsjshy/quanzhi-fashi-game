/**
 * 全职法师游戏 - 测试工具函数
 * 
 * 提供数据加载、断言、报告生成等通用能力
 * 零外部依赖，纯Node.js运行
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

/**
 * 加载数据文件，返回全局变量对象
 * 数据文件格式：const DataXxx = {...}
 */
function loadDataFile(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`数据文件不存在: ${filename}`);
    }
    let code = fs.readFileSync(filePath, 'utf-8');
    // ES模块：移除import语句和export default
    code = code.replace(/^import\s+.*$/gm, '');
    code = code.replace(/^export\s+default\s+.*$/gm, '');
    // export const / const声明的变量不会成为vm context属性，替换为var
    code = code.replace(/^export\s+const\s+(\w+)\s*=/gm, 'var $1 =');
    code = code.replace(/^const\s+(\w+)\s*=/gm, 'var $1 =');
    // 移除window挂载代码
    code = code.replace(/if\s*\(typeof\s+window\s*!==\s*'undefined'\)[\s\S]*?\}/g, '');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    return sandbox;
}

/**
 * 批量加载所有数据文件
 */
function loadAllData() {
    const files = {
        skills: 'skills.js',
        enemies: 'enemies.js',
        items: 'items.js',
        characters: 'characters.js',
        quests: 'quests.js',
        events: 'events.js',
        locations: 'locations.js',
        maps: 'maps.js',
        shops: 'shops.js',
        talents: 'talents.js',
        innateTalents: 'innate-talents.js',
        achievements: 'achievements.js',
        chapters: 'chapters.js',
        bigEvents: 'big-events.js',
        spiritSeeds: 'spirit-seeds.js',
        starDustArtifacts: 'star-dust-artifacts.js',
        summonBeasts: 'summon-beasts.js',
        demonTraits: 'demon-traits.js',
        world: 'world.js',
    };
    
    const data = {};
    for (const [key, file] of Object.entries(files)) {
        try {
            const sandbox = loadDataFile(file);
            // 找到第一个以Data开头的变量
            const varName = Object.keys(sandbox).find(k => k.startsWith('Data'));
            data[key] = varName ? sandbox[varName] : sandbox;
        } catch (e) {
            console.warn(`  ⚠️  加载 ${file} 失败: ${e.message}`);
            data[key] = {};
        }
    }
    return data;
}

/**
 * 测试结果收集器
 */
class TestResult {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
        this.warnings = [];
        this.startTime = Date.now();
    }
    
    pass(msg) {
        this.passed++;
        console.log(`  ✅ ${msg}`);
    }
    
    fail(msg) {
        this.failed++;
        this.errors.push(msg);
        console.log(`  ❌ ${msg}`);
    }
    
    warn(msg) {
        this.warnings.push(msg);
        console.log(`  ⚠️  ${msg}`);
    }
    
    /**
     * 检查ID唯一性
     */
    checkUniqueIds(dataObj, dataName) {
        const ids = Object.keys(dataObj);
        const seen = new Set();
        const duplicates = [];
        for (const id of ids) {
            if (seen.has(id)) {
                duplicates.push(id);
            }
            seen.add(id);
        }
        if (duplicates.length === 0) {
            this.pass(`${dataName}: ${ids.length}个ID全部唯一`);
        } else {
            this.fail(`${dataName}: 发现重复ID: ${duplicates.join(', ')}`);
        }
        return ids;
    }
    
    /**
     * 检查引用完整性
     * @param {Array} refs - 要检查的引用列表 ['skill_id1', 'skill_id2']
     * @param {Object} targetData - 目标数据对象
     * @param {string} refName - 引用类型名称
     * @param {string} sourceName - 来源名称
     */
    checkReferences(refs, targetData, refName, sourceName) {
        const missing = [];
        for (const ref of refs) {
            if (!targetData[ref]) {
                missing.push(ref);
            }
        }
        if (missing.length === 0) {
            this.pass(`${sourceName}: ${refName}引用全部有效`);
        } else {
            this.fail(`${sourceName}: ${refName}引用缺失: ${missing.join(', ')}`);
        }
        return missing;
    }
    
    /**
     * 检查必填字段
     */
    checkRequiredFields(dataObj, dataName, requiredFields) {
        const missing = [];
        for (const [id, item] of Object.entries(dataObj)) {
            for (const field of requiredFields) {
                if (item[field] === undefined || item[field] === null || item[field] === '') {
                    missing.push(`${id}.${field}`);
                }
            }
        }
        if (missing.length === 0) {
            this.pass(`${dataName}: 必填字段全部存在`);
        } else {
            this.fail(`${dataName}: 必填字段缺失: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '...' : ''}`);
        }
        return missing;
    }
    
    report() {
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
        console.log('\n' + '═'.repeat(60));
        console.log(`📊 测试结果: ${this.passed}通过, ${this.failed}失败, ${this.warnings.length}警告 (${elapsed}s)`);
        if (this.failed > 0) {
            console.log('\n❌ 失败详情:');
            this.errors.forEach(e => console.log(`  - ${e}`));
        }
        if (this.warnings.length > 0) {
            console.log('\n⚠️  警告:');
            this.warnings.forEach(w => console.log(`  - ${w}`));
        }
        console.log('═'.repeat(60));
        return {
            passed: this.passed,
            failed: this.failed,
            warnings: this.warnings.length,
            errors: this.errors,
            elapsed
        };
    }
}

export {
    loadDataFile,
    loadAllData,
    TestResult,
    DATA_DIR
};
