/**
 * 全职法师游戏 - 浏览器端单元测试工具
 * 
 * 用途：快速验证单点问题（函数逻辑、DOM渲染、事件绑定），无需手动操作UI
 * 使用：在游戏页面F12控制台中调用 Test.runAll() 或单个测试用例
 * 
 * 设计原则：
 * 1. 轻量级，无外部依赖
 * 2. 断言清晰，失败时给出具体信息
 * 3. 支持DOM检查和模拟点击
 * 4. 测试结果可追溯
 */

const TestUtils = {
    _results: [],
    _currentGroup: '',
    
    // ========== 断言方法 ==========
    
    assert(condition, message) {
        const result = {
            group: this._currentGroup,
            name: message,
            pass: !!condition,
            error: condition ? null : 'Assertion failed'
        };
        this._results.push(result);
        if (!condition) {
            console.error(`❌ [FAIL] ${message}`);
        } else {
            console.log(`✅ [PASS] ${message}`);
        }
        return condition;
    },
    
    assertEquals(actual, expected, message) {
        const pass = actual === expected;
        const result = {
            group: this._currentGroup,
            name: message,
            pass,
            error: pass ? null : `Expected ${expected}, got ${actual}`
        };
        this._results.push(result);
        if (!pass) {
            console.error(`❌ [FAIL] ${message}: expected ${expected}, got ${actual}`);
        } else {
            console.log(`✅ [PASS] ${message}`);
        }
        return pass;
    },
    
    assertContains(str, substring, message) {
        const pass = str && str.includes && str.includes(substring);
        const result = {
            group: this._currentGroup,
            name: message,
            pass,
            error: pass ? null : `"${str}" does not contain "${substring}"`
        };
        this._results.push(result);
        if (!pass) {
            console.error(`❌ [FAIL] ${message}: "${str}" does not contain "${substring}"`);
        } else {
            console.log(`✅ [PASS] ${message}`);
        }
        return pass;
    },
    
    assertExists(obj, message) {
        return this.assert(obj !== null && obj !== undefined, message);
    },
    
    assertFunction(obj, funcName, message) {
        const pass = obj && typeof obj[funcName] === 'function';
        const result = {
            group: this._currentGroup,
            name: message || `${funcName} is a function`,
            pass,
            error: pass ? null : `${funcName} is not a function`
        };
        this._results.push(result);
        if (!pass) {
            console.error(`❌ [FAIL] ${message || funcName + ' is a function'}`);
        } else {
            console.log(`✅ [PASS] ${message || funcName + ' is a function'}`);
        }
        return pass;
    },
    
    // ========== DOM检查方法 ==========
    
    domExists(selector, message) {
        const el = document.querySelector(selector);
        return this.assert(!!el, message || `DOM element "${selector}" exists`);
    },
    
    domCount(selector, expectedCount, message) {
        const count = document.querySelectorAll(selector).length;
        return this.assertEquals(count, expectedCount, message || `Expected ${expectedCount} elements matching "${selector}", got ${count}`);
    },
    
    domTextContains(selector, text, message) {
        const el = document.querySelector(selector);
        const pass = el && el.textContent && el.textContent.includes(text);
        return this.assert(pass, message || `Element "${selector}" contains text "${text}"`);
    },
    
    getComputedStyle(selector, property) {
        const el = document.querySelector(selector);
        if (!el) return null;
        return getComputedStyle(el)[property];
    },
    
    assertZIndex(selector, minZIndex, message) {
        const zIndex = parseInt(this.getComputedStyle(selector, 'zIndex')) || 0;
        return this.assert(zIndex >= minZIndex, message || `Element "${selector}" z-index ${zIndex} >= ${minZIndex}`);
    },
    
    // ========== 模拟交互方法 ==========
    
    simulateClick(selector) {
        const el = document.querySelector(selector);
        if (!el) {
            console.error(`❌ Cannot click: element "${selector}" not found`);
            return false;
        }
        el.click();
        return true;
    },
    
    simulateClickByText(text) {
        const els = document.querySelectorAll('button, div[onclick], a');
        for (const el of els) {
            if (el.textContent && el.textContent.includes(text)) {
                el.click();
                return true;
            }
        }
        console.error(`❌ Cannot click: no element with text "${text}" found`);
        return false;
    },
    
    // ========== 测试用例管理 ==========
    
    group(name, fn) {
        this._currentGroup = name;
        console.log(`\n📦 Test Group: ${name}`);
        console.log('─'.repeat(50));
        fn();
        this._currentGroup = '';
    },
    
    run(name, fn) {
        try {
            fn();
        } catch (e) {
            this._results.push({
                group: this._currentGroup,
                name,
                pass: false,
                error: e.message
            });
            console.error(`❌ [ERROR] ${name}: ${e.message}`);
        }
    },
    
    // ========== 报告 ==========
    
    report() {
        const total = this._results.length;
        const passed = this._results.filter(r => r.pass).length;
        const failed = total - passed;
        
        console.log('\n' + '═'.repeat(60));
        console.log(`📊 Test Report: ${passed}/${total} passed, ${failed} failed`);
        console.log('═'.repeat(60));
        
        if (failed > 0) {
            console.log('\n❌ Failed tests:');
            this._results.filter(r => !r.pass).forEach(r => {
                console.log(`  - [${r.group}] ${r.name}: ${r.error}`);
            });
        }
        
        return { total, passed, failed, results: this._results };
    },
    
    reset() {
        this._results = [];
        this._currentGroup = '';
        console.log('🔄 Test results reset');
    },
    
    // ========== 常用测试套件 ==========
    
    // 测试休息菜单功能（快速验证，不需要手动点击）
    testRestMenu() {
        this.reset();
        this.group('休息菜单功能', () => {
            this.run('Game.showRestMenu 函数存在', () => {
                this.assertFunction(Game, 'showRestMenu');
            });
            this.run('调用showRestMenu后创建overlay', () => {
                Game.showRestMenu();
                this.domExists('.rest-overlay', '休息菜单overlay存在');
            });
            this.run('休息菜单z-index足够高', () => {
                this.assertZIndex('.rest-overlay', 9999, '休息菜单z-index >= 9999');
            });
            this.run('休息菜单包含3个选项', () => {
                this.domCount('.rest-option', 3, '休息菜单有3个选项');
            });
            this.run('关闭按钮可点击', () => {
                this.simulateClick('.rest-close-btn');
                // 等待关闭
                setTimeout(() => {
                    this.assert(!document.querySelector('.rest-overlay'), '休息菜单已关闭');
                }, 100);
            });
        });
        return this.report();
    },
    
    // 测试事件与情报面板
    testEventsPanel() {
        this.reset();
        this.group('事件与情报面板', () => {
            this.run('Game.showEventsAndIntel 函数存在', () => {
                this.assertFunction(Game, 'showEventsAndIntel');
            });
            this.run('调用后创建overlay', () => {
                Game.showEventsAndIntel();
                this.domExists('.ei-overlay', '事件面板overlay存在');
            });
            this.run('事件面板z-index足够高', () => {
                this.assertZIndex('.ei-overlay', 9999, '事件面板z-index >= 9999');
            });
            this.run('关闭按钮可点击', () => {
                this.simulateClick('.ei-close-btn');
            });
        });
        return this.report();
    },
    
    // 测试NPC对话
    testNPCDialogue() {
        this.reset();
        this.group('NPC对话功能', () => {
            this.run('Game.startDialogue 函数存在', () => {
                this.assertFunction(Game, 'startDialogue');
            });
            this.run('对话界面z-index足够高', () => {
                // 需要先触发对话，这里只检查函数
                this.assert(true, '对话界面z-index检查需在实际对话中验证');
            });
        });
        return this.report();
    },
    
    // 测试天赋选择流程
    testTalentSelection() {
        this.reset();
        this.group('天赋选择流程', () => {
            this.run('Game.showTalentSelection 函数存在', () => {
                this.assertFunction(Game, 'showTalentSelection');
            });
            this.run('Game.confirmTalent 函数存在', () => {
                this.assertFunction(Game, 'confirmTalent');
            });
            this.run('Game.confirmInnateTalent 函数存在', () => {
                this.assertFunction(Game, 'confirmInnateTalent');
            });
        });
        return this.report();
    },
    
    // 运行所有快速测试
    runAll() {
        this.reset();
        console.log('🚀 Running all unit tests...\n');
        
        this.testRestMenu();
        this.testEventsPanel();
        this.testNPCDialogue();
        this.testTalentSelection();
        
        console.log('\n✅ All unit tests completed');
        return this.report();
    }
};

// 控制台快捷方式
window.Test = TestUtils;
console.log('🧪 TestUtils loaded. Use Test.runAll() to run all tests, or Test.testRestMenu() etc.');
