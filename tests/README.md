# 测试体系

无浏览器分层测试体系，0.1秒出结果。详见 [docs/测试存档体系与最小单元化测试指南.md](../docs/测试存档体系与最小单元化测试指南.md)。

## 目录结构

```
tests/
├── run.js              # 统一测试运行入口
├── utils.js            # 测试工具函数（数据加载/断言/报告）
├── save-manager.html   # 存档管理器（浏览器端工具）
├── README.md           # 本文件
├── unit/               # 单元测试（L1-L3自动化）
│   ├── data-integrity.js   # L1 数据完整性（27项）
│   ├── battle-logic.js     # L2 战斗逻辑（21项）
│   └── progression.js      # L3 成长流程（13项）
├── stress/             # 压力/平衡测试
│   ├── battle-balance.js   # 战斗数值平衡分析
│   └── battle-stress.js    # 战斗压力测试
├── legacy/             # 旧版测试脚本（v0.8.x，保留参考）
│   ├── test-gameplay.js
│   ├── test-load.js
│   ├── test-story-data.js
│   ├── test-talent-evolution.js
│   ├── test-talents.js
│   ├── test-v087.js
│   └── test_skills.js
└── saves/              # 测试存档
```

## 快速开始

```bash
# 运行所有测试（L1+L2+L3）
node tests/run.js

# 只运行L1数据完整性
node tests/run.js l1

# 只运行L2战斗逻辑
node tests/run.js l2

# 只运行L3成长流程
node tests/run.js l3
```

## 测试层级

| 层级 | 文件 | 覆盖范围 | 运行时间 |
|------|------|---------|---------|
| L1 | unit/data-integrity.js | ID唯一性、引用完整性、必填字段、数值合理性 | <0.05s |
| L2 | unit/battle-logic.js | 元素克制、伤害计算、引导时间、状态效果 | <0.05s |
| L3 | unit/progression.js | 经验值计算、升级逻辑、属性成长 | <0.05s |

## 浏览器端测试工具

- `engine/test-utils.js` - 浏览器控制台测试工具，F12中用`Test`对象
- `tests/save-manager.html` - 存档导入导出管理器

## 黑盒测试报告

所有黑盒测试报告存放在 `docs/` 目录，命名格式：`黑盒测试报告_vX.Y.Z_描述.md`
