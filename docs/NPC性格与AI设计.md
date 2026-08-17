# NPC 性格与 AI 设计

## 一、设计理念

NPC 不是任务发布机器，而是有自己的性格、目标、情感和生活的"人"。他们会根据自己的性格做出决定，会因为玩家的行为改变态度，会有自己的喜怒哀乐，甚至会自己做事情。

**核心原则**：
- 每个 NPC 都是独特的，有自己的性格和行为模式
- NPC 有自己的目标和动机，不是围着玩家转
- 玩家可以影响 NPC，但不能完全控制
- NPC 有记忆，会记住玩家做过的事

---

## 二、性格系统 (PersonalitySystem)

### 2.1 五因素性格模型

基于心理学的大五人格模型，简化为游戏可用的版本。

```
性格特质（每个都是 0-1 的数值，0.5 是中性）
├── 开放性 (openness)       好奇、创新 ←→ 保守、传统
├── 尽责性 (conscientiousness)  有条理、可靠 ←→ 随意、不可靠
├── 外向性 (extraversion)    外向、活跃 ←→ 内向、安静
├── 宜人性 (agreeableness)   友善、合作 ←→ 敌对、自私
└── 神经质 (neuroticism)     敏感、焦虑 ←→ 稳定、冷静
```

### 2.2 游戏化的性格特质

为了游戏性，我们调整为更直观的 8 个特质：

| 特质 | 英文 | 0 端 | 1 端 | 影响 |
|------|------|------|------|------|
| 勇敢 | brave | 懦弱 | 勇敢 | 遇到危险的反应、战斗风格 |
| 善良 | kind | 残忍 | 善良 | 对弱者的态度、道德选择 |
| 诚实 | honest | 狡猾 | 诚实 | 是否说谎、是否守诺 |
| 冲动 | impulsive | 谨慎 | 冲动 | 做决定的速度、冒险倾向 |
| 忠诚 | loyal | 背叛 | 忠诚 | 对朋友/势力的忠诚度 |
| 傲慢 | arrogant | 谦虚 | 傲慢 | 对弱者的态度、自我评价 |
| 贪婪 | greedy | 慷慨 | 贪婪 | 对金钱/物品的态度 |
| 好奇 | curious | 保守 | 好奇 | 对新事物的态度、探索欲 |

### 2.3 性格数据格式

```javascript
{
  // 基础性格
  personality: {
    brave: 0.8,        // 很勇敢
    kind: 0.6,         // 比较善良
    honest: 0.5,       // 一般，看情况
    impulsive: 0.9,    // 非常冲动
    loyal: 0.95,       // 极其忠诚
    arrogant: 0.3,     // 不算傲慢
    greedy: 0.2,       // 不怎么贪财
    curious: 0.7       // 比较好奇
  },

  // 价值观（什么最重要）
  values: [
    { type: "power", importance: 0.8 },      // 力量
    { type: "friendship", importance: 0.9 }, // 友情
    { type: "freedom", importance: 0.7 },    // 自由
    { type: "justice", importance: 0.6 },    // 正义
    { type: "wealth", importance: 0.3 }      // 财富
  ],

  // 恐惧/弱点
  fears: [
    { type: "betrayal", intensity: 0.9 },    // 害怕背叛
    { type: "failure", intensity: 0.6 },     // 害怕失败
    { type: "death", intensity: 0.5 }        // 害怕死亡
  ],

  // 目标
  goals: {
    shortTerm: "become_stronger",     // 短期目标
    longTerm: "protect_friends",      // 长期目标
    current: "study_for_exam"         // 当前目标
  }
}
```

### 2.4 性格的影响

性格会影响 NPC 的各个方面：

#### 对话选择
- 高 `brave`：遇到危险会说"怕什么，上！"
- 低 `brave`：遇到危险会说"太危险了，还是算了吧"
- 高 `kind`：会主动关心别人
- 低 `kind`：只关心自己

#### 战斗行为
- 高 `brave`：主动进攻，喜欢用高伤害技能
- 低 `brave`：保持距离，多用防御技能
- 高 `impulsive`：容易冲动，会追击残血敌人
- 低 `impulsive`：稳重，会评估局势

#### 对玩家行为的评价
- 高 `loyal`：非常看重承诺，你失信会大幅降低好感
- 低 `loyal`：无所谓，你背叛他也不会太生气
- 高 `kind`：你做善事会提升好感，做恶事会降低
- 低 `kind`：你做什么他都不太在乎

#### 事件反应
- 高 `curious`：遇到奇怪的事会主动去调查
- 低 `curious`：多一事不如少一事
- 高 `greedy`：看到财宝会眼睛发亮
- 低 `greedy`：对钱财不感兴趣

---

## 三、AI 行为系统 (BehaviorSystem)

### 3.1 日常作息 (DailyRoutine)

每个 NPC 都有自己的日常作息，在不同时间出现在不同地方，做不同的事。

```javascript
{
  dailyRoutine: {
    // 星期一到星期五
    weekday: {
      morning: {
        location: "tianlan_school_classroom",
        activity: "having_class",
        availableForDialogue: true,
        dialogueMood: "focused"
      },
      afternoon: {
        location: "tianlan_school_training_ground",
        activity: "training",
        availableForDialogue: true,
        dialogueMood: "tired"
      },
      evening: {
        location: "student_dorm",
        activity: "resting",
        availableForDialogue: false,
        dialogueMood: "relaxed"
      },
      night: {
        location: "student_dorm",
        activity: "sleeping",
        availableForDialogue: false,
        dialogueMood: "sleepy"
      }
    },
    // 周末
    weekend: {
      morning: {
        location: "xuefeng_mountain",
        activity: "hunting",
        availableForDialogue: true,
        dialogueMood: "energetic"
      },
      // ...
    }
  }
}
```

### 3.2 行为状态机 (BehaviorFSM)

NPC 的行为由状态机控制，根据情况切换状态。

```
状态列表：
├── idle            // 闲逛，什么都不做
├── routine         // 执行日常作息
├── talking         // 和玩家对话
├── training        // 修炼
├── hunting         // 猎魔
├── sleeping        // 睡觉
├── eating          // 吃饭
├── talking_to_npc  // 和其他 NPC 聊天
├── fleeing         // 逃跑
├── fighting        // 战斗
├── injured         // 受伤
└── special         // 特殊事件状态
```

**状态切换条件**（例子）：
- 看到敌人 + 勇敢度高 → 进入 fighting 状态
- 看到敌人 + 勇敢度低 → 进入 fleeing 状态
- 血量低 + 谨慎 → 进入 fleeing 状态
- 血量低 + 冲动 → 继续 fighting

### 3.3 决策系统 (DecisionSystem)

NPC 做决定时，会综合考虑多个因素：

**决策公式**（简化版）：
```
选项得分 = 性格匹配度 × 性格权重 
         + 利益评估 × 利益权重 
         + 风险评估 × 风险权重
         + 情感因素 × 情感权重
         + 关系因素 × 关系权重

选择得分最高的选项
```

**例子：遇到妖魔时的决策**

| 选项 | 勇敢匹配 | 利益评估 | 风险评估 | 总分 |
|------|---------|---------|---------|------|
| 冲上去打 | 0.8 × 0.9 = 0.72 | 0.5 × 0.3 = 0.15 | -0.7 × 0.4 = -0.28 | 0.59 |
| 谨慎观察 | 0.3 × 0.9 = 0.27 | 0.3 × 0.3 = 0.09 | -0.2 × 0.4 = -0.08 | 0.28 |
| 转身逃跑 | 0.1 × 0.9 = 0.09 | 0.1 × 0.3 = 0.03 | -0.0 × 0.4 = 0 | 0.12 |

→ 勇敢的 NPC 会选择冲上去打

---

## 四、情感系统 (EmotionSystem)

### 4.1 基础情绪

NPC 有基础的情绪状态，会影响他们的行为和对话。

| 情绪 | 英文 | 触发条件 | 影响 |
|------|------|---------|------|
| 开心 | happy | 好事发生、玩家帮忙 | 对话更友好，更容易答应请求 |
| 生气 | angry | 被冒犯、遇到敌人 | 对话带刺，更容易发生冲突 |
| 悲伤 | sad | 坏事发生、失去重要的人 | 对话低沉，不想说话 |
| 害怕 | scared | 遇到危险、强大的敌人 | 对话颤抖，更容易逃跑 |
| 惊讶 | surprised | 意外的事发生 | 对话停顿，反应变慢 |
| 疑惑 | confused | 不明白发生了什么 | 会问问题，寻求解释 |
| 兴奋 | excited | 期待的事即将发生 | 话变多，更主动 |
| 平静 | calm | 正常状态 | 正常对话 |

### 4.2 情绪的变化

情绪会随着时间逐渐平复，也会因为事件而变化。

**情绪衰减**：
```
情绪强度 = 初始强度 × (1 - 0.1 × 小时数)
```

**情绪叠加**：
- 同一类情绪会叠加
- 相反的情绪会抵消
- 强烈的情绪会覆盖弱的情绪

### 4.3 情绪对对话的影响

同一个 NPC，不同情绪下说的话不一样：

**例子：莫凡**

- **开心**："嘿，今天天气不错啊！找我有事？"
- **生气**："...什么事？快说。"
- **悲伤**："...嗯？有事吗？"（声音很低）
- **兴奋**："嘿！我跟你说，我昨天修炼有突破了！"

---

## 五、关系系统 (RelationshipSystem)

### 5.1 关系的维度

玩家与 NPC 的关系是多维度的，不只是好感度。

| 维度 | 说明 | 范围 |
|------|------|------|
| 好感度 (opinion) | 整体喜恶程度 | -100 到 100 |
| 信任度 (trust) | 信任程度 | -100 到 100 |
| 敬重度 (respect) | 尊重/敬佩程度 | -100 到 100 |
| 畏惧度 (fear) | 害怕程度 | 0 到 100 |
| 熟悉度 (familiarity) | 了解程度 | 0 到 100 |
| 亲密值 (intimacy) | 亲密程度 | 0 到 100 |

### 5.2 关系等级

根据好感度和其他维度，关系分为几个等级：

| 等级 | 名称 | 好感度 | 说明 |
|------|------|--------|------|
| -5 | 死敌 | -80 以下 | 恨不得杀了你 |
| -4 | 仇敌 | -60 到 -80 | 见到就打 |
| -3 | 敌对 | -40 到 -60 | 态度恶劣，会找麻烦 |
| -2 | 厌恶 | -20 到 -40 | 不想理你 |
| -1 | 冷淡 | -10 到 -20 | 态度冷淡 |
| 0 | 陌生人 | -10 到 10 | 刚认识 |
| 1 | 熟人 | 10 到 30 | 认识，正常交流 |
| 2 | 朋友 | 30 到 50 | 愿意帮忙 |
| 3 | 好友 | 50 到 70 | 会分享秘密，冒险帮忙 |
| 4 | 挚友 | 70 到 90 | 生死之交 |
| 5 | 至亲 | 90 以上 | 可以托付一切 |

### 5.3 关系的变化

关系变化受多种因素影响：

1. **性格匹配**：性格相似的人更容易成为朋友
2. **共同经历**：一起经历的事越多，关系越深
3. **价值观一致**：价值观相近的人关系更好
4. **利益相关**：有共同利益的人关系更好
5. **承诺与背叛**：承诺会增加信任，背叛会大幅降低

**关系变化公式**（简化版）：
```
关系变化 = 事件基础影响 
         × 性格匹配系数 
         × 价值观匹配系数
         × 当前关系系数
```

---

## 六、记忆系统 (MemorySystem)

### 6.1 记忆的类型

NPC 会记住玩家做过的事，这些记忆会影响他们对玩家的态度。

| 类型 | 说明 | 持续时间 |
|------|------|---------|
| 短期记忆 | 最近发生的小事 | 几天 |
| 长期记忆 | 重要的事 | 几个月甚至永久 |
| 核心记忆 | 改变关系的关键事件 | 永久 |

### 6.2 记忆数据格式

```javascript
{
  memories: [
    {
      id: "mem_001",
      type: "favor",           // 记忆类型
      content: "玩家帮我捡了书",
      shortDescription: "帮过我一个小忙",
      
      // 对关系的影响
      effect: {
        opinion: +5,
        trust: +2
      },
      
      // 重要程度 (0-1)，影响遗忘速度
      importance: 0.3,
      
      // 时间戳
      timestamp: {
        day: 3,
        period: "afternoon"
      },
      
      // 当前强度（会随时间衰减）
      intensity: 1.0,
      
      // 是否是核心记忆（不会遗忘）
      isCore: false,
      
      // 相关标签，用于触发
      tags: ["help", "small_favor"]
    },
    {
      id: "mem_002",
      type: "betrayal",
      content: "玩家在背后说我坏话",
      shortDescription: "背叛过我",
      effect: {
        opinion: -20,
        trust: -30
      },
      importance: 0.8,
      timestamp: { day: 10, period: "morning" },
      intensity: 1.0,
      isCore: true,
      tags: ["betrayal", "trust_issue"]
    }
  ]
}
```

### 6.3 记忆的遗忘

记忆会随着时间逐渐淡化：

```
强度衰减 = 0.01 × 天数 × (1 - 重要程度)
当前强度 = max(0, 初始强度 - 强度衰减)
```

当强度低于 0.1 时，NPC 就"忘记"了这件事。

**核心记忆不会遗忘**，但强度也会衰减到一定程度后稳定。

### 6.4 记忆的触发

某些情况下，记忆会被"触发"，暂时增强：

- 玩家提到相关的事
- 遇到类似的场景
- 看到相关的物品
- 其他 NPC 提到

触发后，记忆的强度会暂时提升，影响 NPC 当前的态度。

---

## 七、NPC 间互动系统 (NPCInteraction)

### 7.1 设计理念

NPC 之间也会互动，不只是和玩家互动。他们会自己聊天、一起做事、发生矛盾、建立关系。世界是自己在运行的，玩家只是其中的一份子。

### 7.2 NPC 间关系

NPC 之间有自己的关系网，和玩家无关：

```javascript
{
  "mo_fan-mu_ningxue": {
    relationship: "rivals",
    opinionAtoB: -30,
    opinionBtoA: -20,
    history: [
      { event: "childhood_acquaintance", effect: 0 },
      { event: "school_competition", effect: -15 }
    ]
  },
  "mo_fan-tang_yue": {
    relationship: "teacher_student",
    opinionAtoB: 60,
    opinionBtoA: 50,
    history: []
  }
}
```

### 7.3 NPC 间事件

NPC 之间会自己发生事件，玩家可能会遇到，也可能完全不知道。

**例子**：
- 莫凡和穆宁雪在修炼场吵架
- 唐月老师找莫凡谈话
- 两个 NPC 成为朋友
- 两个 NPC 闹翻了

**玩家的影响**：
- 玩家可以介入，改变事件走向
- 玩家可以选择帮谁
- 玩家的行为会影响 NPC 之间的关系

---

## 八、数据存储格式规范

### 8.1 文件结构

```
content/
└── npcs/
    ├── _templates/
    │   └── personality-templates.json  // 性格模板
    ├── mo-fan/
    │   ├── base.json                   // 基础数据
    │   ├── personality.json            // 性格数据
    │   ├── dialogue.json               // 对话树
    │   ├── routine.json                // 日常作息
    │   └── relationships.json          // 与其他 NPC 的关系
    ├── mu-ningxue/
    │   └── ...
    └── ...
```

### 8.2 性格模板

为了方便创建 NPC，可以用性格模板：

```javascript
{
  templates: {
    "hot_blooded_hero": {
      brave: 0.9,
      kind: 0.7,
      honest: 0.6,
      impulsive: 0.8,
      loyal: 0.9,
      arrogant: 0.4,
      greedy: 0.2,
      curious: 0.7
    },
    "cold_genius": {
      brave: 0.7,
      kind: 0.4,
      honest: 0.6,
      impulsive: 0.2,
      loyal: 0.5,
      arrogant: 0.8,
      greedy: 0.3,
      curious: 0.5
    },
    "gentle_teacher": {
      brave: 0.6,
      kind: 0.9,
      honest: 0.8,
      impulsive: 0.3,
      loyal: 0.7,
      arrogant: 0.2,
      greedy: 0.2,
      curious: 0.6
    }
  }
}
```

---

## 九、扩展原则

1. **循序渐进**：先实现基础性格和对话，再加复杂的 AI
2. **重点突出**：重要 NPC 做深，次要 NPC 做简
3. **可观测性**：玩家能感受到 NPC 的性格和变化
4. **一致性**：NPC 的行为要符合性格，不能前后矛盾
5. **可预测性**：玩家了解 NPC 性格后，能大概预测他的反应

---

## 十、后续扩展方向

1. **NPC 自主成长** - NPC 会自己升级、学习新技能
2. **NPC 间剧情** - NPC 之间有自己的剧情线，和玩家无关
3. **动态关系** - NPC 之间的关系会动态变化
4. **群体行为** - NPC 会形成群体，有群体行为
5. **情感深度** - 更复杂的情感系统，比如爱情、亲情
6. **道德系统** - NPC 有自己的道德观，会评判玩家的行为

---

## 十一、有意义对话设计标准（v0.98.0新增）

### 11.1 什么是"有意义对话"

对话不能只是"聊天+刷好感度"。每次对话都应该对玩家的游戏体验产生实际影响。

**无意义对话**：玩家选了选项，NPC说了一段话，好感度+1，然后什么都没发生。
**有意义对话**：玩家选了选项，触发了任务/揭示了伏笔/影响了NPC关系/解锁了新内容。

### 11.2 对话的4层意义（按优先级）

| 层级 | 类型 | 说明 | 实现方式 |
|------|------|------|---------|
| L1 | 触发任务/事件 | 对话后接取新任务或触发随机事件 | `action: "start_quest"` + `actionData: {questId}` |
| L2 | 揭示伏笔/信息差 | NPC透露关键信息，影响玩家决策 | 对话文本中包含设定信息，配合`setFlag` |
| L3 | 影响NPC关系网 | 对话影响其他NPC的关系，形成联动 | `effects`中修改其他NPC好感度 |
| L4 | 解锁新内容 | 好感/信任达标后解锁商店/技能/身份 | 条件判断+`action: "open_shop"`等 |

**最低标准**：每个NPC至少有1个对话选项达到L1或L2，不能全是L3纯数值变化。

### 11.3 存量问题统计（v0.98.15后）

47个有对话树的NPC中：
- **有真正剧情触发（L1）**：42个（v0.98.0-15改造37个添加start_quest + 原有5个start_battle/open_shop）
- **只有数值变化（L3）**：4个（猎者联盟接待员/穆管家有shop，算L1；剩余主要是有close/back但无任务触发的NPC）
- **完全无影响**：1个（白藏风6节点，明珠校区NPC，博城篇后）

**改造成果**：v0.98.0-15共16个版本，改造37个NPC，新增37个对话触发任务。博城篇所有有对话树的NPC（除白藏风-明珠校区）均达到L1有意义对话标准。L1自动化测试覆盖所有对话任务ID引用完整性。

**形成4条有剧情深度的任务线**：
- 黑教廷线：穆贺（线索）+灵灵（追踪）+林雨欣（妹妹失踪关联）
- 雪峰山线：唐月/萧院长/薛木生（异动调查）+罗云波（异常调查）+万断峰（巡逻）
- 穆氏线：穆卓云（认可）+宇昂（实力证明）+郭彩棠（暗流）
- 心夏线：叶心夏（采药）+莫青（送物资）+徐兵（教训地痞）

### 11.4 设计检查清单

每个NPC对话设计完成后，必须通过：
- [ ] 至少1个选项能触发任务/事件（L1）或揭示关键伏笔（L2）
- [ ] 对话内容与NPC身份/阵营/剧情阶段相关
- [ ] 选择反馈符合人设（傲慢的人不会因为你拍马屁就加好感）
- [ ] 任务/事件有实际奖励和后续影响
- [ ] 不围绕莫凡，玩家有自己的人生

### 11.5 已实现的对话action类型

| action | 说明 | actionData |
|--------|------|-----------|
| `start_quest` | 接取任务 | `{questId: "xxx"}` |
| `start_battle` | 开始战斗 | `{enemyId: "xxx"}` |
| `open_shop` | 打开商店 | `{shopId: "xxx"}` |
| `close` / `back` | 关闭/返回对话 | 无 |

### 11.6 改造优先级

1. **博城篇关键NPC**（徐大荒/郭彩棠/小可/斩空/宇昂）- 已有对话深度，添加任务触发
2. **高节点数NPC**（唐月50节点/穆宁雪42节点/莫凡86节点）- 节点多但意义不足，补充剧情触发
3. **完全无影响NPC**（白藏风等）- 最低优先级，至少添加effects

