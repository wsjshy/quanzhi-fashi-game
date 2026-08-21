# NPC成长系统设计文档

> **版本**：v2.9.3
> **最后更新**：2026-08-22
> **相关文件**：`engine/npc-growth.js`、`engine/npc-state.js`、`engine/game.js`

---

## 一、系统概述

NPC成长系统用于模拟NPC随剧情推进而产生的修为变化，包括等级提升、元素系觉醒、技能解锁、装备更新等。系统基于**剧情阶段**驱动，而非实时时间流逝，确保NPC的修为状态始终符合小说原著的时间线。

### 核心理念

1. **剧情驱动**：NPC的成长与剧情阶段绑定，而非玩家行动次数
2. **原著对齐**：每个NPC的成长事件必须基于小说原文，不凭空编造
3. **可扩展**：新增NPC只需添加growth字段，无需修改引擎代码
4. **双系统协作**：剧情成长系统（NPCGrowthService）主导，自主成长系统（NPCStateSystem）辅助

---

## 二、两套成长系统

### 2.1 剧情成长系统（NPCGrowthService）

**主导系统**，基于剧情阶段计算NPC的当前修为状态。

- **文件**：`engine/npc-growth.js`
- **触发时机**：每次获取NPC状态时，根据当前剧情阶段动态计算
- **数据来源**：NPC数据中的`growth`字段
- **优先级**：高于原始数据和自主成长系统

### 2.2 自主成长系统（NPCStateSystem）

**辅助系统**，基于玩家与NPC的互动经验积累。

- **文件**：`engine/npc-state.js`
- **触发时机**：玩家与NPC对话、送礼、完成任务等互动后
- **数据来源**：运行时积累的经验值
- **优先级**：低于剧情成长系统

### 2.3 统一获取入口

`Game.getNPCLevel(npcId)`方法统一获取NPC等级，优先级：
1. NPCGrowthService（剧情成长）
2. 原始数据（npc.level）
3. NPCStateSystem（自主成长）

```javascript
getNPCLevel(npcId) {
    // 1. 剧情成长系统
    if (typeof NPCGrowthService !== 'undefined') {
        const state = NPCGrowthService.getNpcState(npcId);
        if (state && state.level) return state.level;
    }
    // 2. 原始数据
    const npc = DataCharacters[npcId];
    if (npc && npc.level) return npc.level;
    // 3. 自主成长系统
    if (typeof NPCStateSystem !== 'undefined') {
        return NPCStateSystem.getNPCLevel(npcId) || 0;
    }
    return 0;
}
```

---

## 三、数据格式

### 3.1 growth字段结构

```javascript
growth: {
    base: {
        level: 2,              // 初始等级
        elements: ["earth"],   // 初始元素系
        skills: ["basic_attack", "earth_shift"],  // 初始技能
        title: "天澜高中学生",  // 初始称号
        growthType: "mage",    // 成长类型（见3.2）
        overrideStats: null,   // 自定义属性覆盖（可选）
        realm: "初阶"           // 初始境界（可选，自动推断）
    },
    events: [                   // 成长事件列表（可选，无events则只有base状态）
        {
            after: "bocheng_disaster",  // 触发阶段
            title: "博城灾难后",         // 事件标题
            level: 5,                    // 等级提升
            elements: ["earth", "wind"], // 新增元素系
            skills: ["wind_blade"],      // 新增技能
            equipment: [],                // 装备更新
            traits: [],                   // 特性更新
            form: null,                   // 形态变化（妖魔用）
            unlocks: []                   // 解锁内容
        }
    ]
}
```

### 3.2 成长类型（growthType）

| 类型 | 适用NPC | 属性倾向 |
|------|---------|---------|
| `mage` | 魔法师 | 魔力/精神高，物攻低 |
| `warrior` | 军法师/战士 | 物攻/速度高 |
| `support` | 辅助/治疗 | 魔力高，防御中等 |
| `balanced` | 均衡型 | 各项均衡 |
| `demon` | 妖魔 | 物攻/生命高 |
| `summon` | 召唤师 | 魔力/精神极高 |

### 3.3 境界划分

| 境界 | 等级范围 | 境界加成 |
|------|---------|---------|
| 初阶（initial） | 1-10 | 基础属性 |
| 中阶（middle） | 11-30 | 全属性+20% |
| 高阶（high） | 31-55 | 全属性+50%，技能强化 |
| 超阶（super） | 56+ | 全属性+100%，领域效果 |

---

## 四、剧情阶段

### 4.1 阶段顺序

```
_base → star_path_awaken → bocheng_disaster → mingzhu_entrance 
→ hunter_exam → main_campus_exam → world_college_tournament
```

| 阶段ID | 名称 | 说明 |
|--------|------|------|
| `_base` | 初遇时 | NPC的初始状态 |
| `star_path_awaken` | 星路觉醒 | 觉醒魔法后 |
| `bocheng_disaster` | 博城灾难 | 博城灾难后 |
| `mingzhu_entrance` | 明珠入学 | 进入明珠学府后 |
| `hunter_exam` | 猎人考试 | 猎人资格考试后 |
| `main_campus_exam` | 主校区考试 | 明珠主校区选拔后 |
| `world_college_tournament` | 世界学府大赛 | 世界学府大赛期间 |

### 4.2 当前阶段获取

`_getCurrentStoryStage()`方法从以下位置获取当前剧情阶段：
1. `player.storyStage`（玩家数据）
2. `WorldState.get('storyStage')`（世界状态）
3. `GameState.storyStage`（游戏状态）
4. 默认返回`_base`

---

## 五、核心方法

### 5.1 getNpcState(npcId, storyStage)

获取NPC在指定剧情阶段的完整状态。

**流程**：
1. 查找NPC数据
2. 如果没有growth字段，返回默认状态（基于原始数据）
3. 克隆base状态
4. 依次apply所有已达到阶段的成长事件
5. 计算属性（基于成长类型和境界）
6. 返回完整状态

### 5.2 getDuelData(npcId)

获取切磋/战斗用的数据，兼容battle.js格式。

**返回字段**：id, name, title, level, elements, skills, equipment, traits, maxHp, hp, maxMp, mp, attack, defense, speed, spirit, form, spriteColor, aiType, enemyType, isEnemy, isAlly, isCanon, growthApplied

### 5.3 getHistoricalState(npcId, stage)

获取NPC在指定历史阶段的状态，用于回顾NPC成长历程。

### 5.4 getAvailableStages(npcId)

获取NPC所有可用的剧情阶段列表，用于UI展示成长历程。

### 5.5 applyBattleEvolution(battleState, eventId)

战斗中触发进化/蜕皮（主要用于妖魔），返回更新后的战斗状态。

---

## 六、属性计算

### 6.1 基础属性公式

```javascript
maxHp = 80 + level * 8 + realmBonus.hp
maxMp = 50 + level * 5 + realmBonus.mp
attack = 8 + level * 1.5 + realmBonus.attack
defense = 8 + level * 1.2 + realmBonus.defense
speed = 6 + level * 0.8 + realmBonus.speed
spirit = 5 + level * 1.0 + realmBonus.spirit
```

### 6.2 成长类型修正

不同成长类型对基础属性有不同的修正系数：
- `mage`：mp×1.3, spirit×1.2, attack×0.8
- `warrior`：attack×1.3, speed×1.2, mp×0.8
- `support`：mp×1.2, defense×1.1, attack×0.9
- `balanced`：无修正
- `demon`：maxHp×1.5, attack×1.2, mp×0.5
- `summon`：mp×1.5, spirit×1.3, attack×0.7

### 6.3 自定义覆盖

如果`growth.base.overrideStats`不为null，则使用自定义属性覆盖计算结果。

---

## 七、修为不明确标记

对于小说中修为不明确的NPC，使用以下字段标记：

```javascript
levelDisplay: "中阶???",  // 显示文本，优先于自动计算
levelUnknown: true         // 标记修为不明确
```

**显示逻辑**：
- 如果`levelDisplay`存在，直接显示
- 否则显示`Lv.${level} ${realm}`
- 如果`levelUnknown`为true，在详情中提示"修为不明确"

---

## 八、当前覆盖情况

### 8.1 有growth字段的NPC（38个）

- 天澜高中学生：莫凡、穆白、赵坤三、张小侯、赵满延、穆宁雪、何雨、周敏、许昭霆、王三胖（10个）
- 城市猎妖队：徐大荒、郭彩棠、小可、黎文杰、肥石（5个）
- 雪峰山驿站：斩空、罗云波、潘丽君、白阳（4个）
- 地圣泉：梁斌、林雨欣（2个）
- 其他重要NPC：穆卓云、邓凯、白藏锋、杨作河、万断风、罗宋、包老头、唐月、牧奴娇、艾图图、许昭霆（幸存者）（11个）
- 妖魔：若干（6个）

### 8.2 无growth字段的NPC（13个）

主要是普通人、非战力NPC，如：
- 王老板（商店老板）
- 二秃子（驿站小贩）
- 灵灵（猎人大师，非战斗魔法师）
- 邓铠（校董，非战力）
- 其他路人NPC

---

## 九、扩展指南

### 9.1 为新NPC添加成长系统

1. 在NPC数据中添加`growth`字段
2. 设置`base`（初始状态）
3. 根据小说原文添加`events`（成长事件）
4. 确保`growthType`正确
5. 跑L1测试验证数据完整性

### 9.2 新增剧情阶段

1. 在`_storyStageOrder`数组中添加新阶段ID
2. 在`_isStageReached`方法中添加阶段判断逻辑
3. 在NPC的`growth.events`中添加对应阶段的成长事件
4. 更新本文档的阶段列表

### 9.3 新增成长类型

1. 在`_growthTemplates`中添加新类型
2. 设置属性修正系数
3. 在`_inferGrowthType`方法中添加推断逻辑
4. 更新本文档的成长类型表

---

## 十、注意事项

1. **events可选**：growth字段可以只有base没有events，此时NPC状态始终为base
2. **空值检查**：所有访问`npc.growth.events`的地方必须先检查是否存在且为数组
3. **原著对齐**：成长事件必须基于小说原文，不凭空编造等级/技能/元素系
4. **修为不明确**：小说中修为不明确的NPC使用`levelDisplay`标记，不猜测具体等级
5. **双系统协作**：剧情成长系统主导，自主成长系统辅助，不要混淆两者职责
6. **统一入口**：获取NPC等级/状态必须使用`Game.getNPCLevel()`/`NPCGrowthService.getNpcState()`，不要直接访问`npc.level`

---

## 十一、相关文档

- [数据格式规范](数据格式规范.md) - NPC数据格式详细说明
- [NPC性格与AI设计](NPC性格与AI设计.md) - NPC行为设计
- [实力体系设计文档](实力体系设计文档.md) - 境界/等级/数值公式
- [博城篇原文回归校准报告](博城篇原文回归校准报告.md) - 原著校准记录
