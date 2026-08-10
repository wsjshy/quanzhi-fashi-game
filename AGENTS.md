# 全职法师网页游戏 - 开发主入口（AGENTS.md）

> **本文档是所有开发工作的起点。** 任何agent接手本项目时，必须先阅读本文档，了解项目结构、文档体系、开发规范和沉淀经验。

---

## 一、快速开始（新agent必读）

### 1.1 项目基本信息
- **项目名称**：全职法师网页游戏（基于小说《全职法师》开发）
- **当前版本**：v0.4.0
- **分支**：master，直接在master开发
- **项目根目录**：`C:\Users\22210\Desktop\quanzhi-fashi-game-master\`
- **小说文件**：`C:\Users\22210\Desktop\全职法师.txt`（3370章，23MB）
- **Git路径**：`D:\Git\bin\git.exe`
- **架构**：纯HTML5，数据驱动模块化架构，玩家自创角色（不扮演莫凡，莫凡是NPC）
- **入口**：`index.html`，双击即玩，无需HTTP服务器
- **操作系统**：Windows，命令行使用PowerShell语法

### 1.2 第一步该做什么
1. **打开游戏玩一遍**：双击 `index.html`，了解当前游戏状态
2. **阅读本文档**：了解文档体系和开发规范
3. **查看TODO.md**：了解待办事项和优先级
4. **查看 engine/data/ 下的数据模块**：了解数据结构（所有内容数据已拆分为多个模块文件）
5. **开始开发**

---

## 二、文档体系（按用途分类）

### 2.1 入门与概览类
| 文档 | 用途 | 何时阅读 |
|------|------|---------|
| **AGENTS.md**（本文档） | 开发主入口，文档索引，开发规范，沉淀经验 | **每次开发前必读** |
| `README.md` | 项目说明，游戏介绍，面向玩家和开发者 | 首次接触项目时 |
| `项目交接说明.md` | 项目交接用的完整说明，包含历史信息 | 需要了解项目历史时 |
| `CHANGELOG.md` | 版本更新日志 | 需要了解最近改动时 |
| `TODO.md` | 开发计划和待办列表 | **每次开发前必看**，了解优先级 |

### 2.2 架构与规范类
| 文档 | 用途 | 何时阅读 |
|------|------|---------|
| `docs/架构说明.md` | 整体架构设计，模块划分，数据流 | 需要了解系统架构时 |
| `docs/数据格式规范.md` | 详细的数据格式定义（NPC/地点/任务/事件/物品/敌人） | **添加新内容前必读** |
| `docs/内容扩展指南.md` | 如何添加各类内容的步骤指南 | 添加新NPC/地点/任务时 |

### 2.3 系统设计类
| 文档 | 用途 | 何时阅读 |
|------|------|---------|
| `docs/时间系统重设计方案.md` | v0.4.0时间系统设计（8时段制、熬夜惩罚、课程表） | 修改时间系统或课程表时 |
| `docs/世界状态与关系网系统设计.md` | 世界状态、NPC关系、势力声望设计 | 修改关系/声望系统时 |
| `docs/对话树与剧情连锁系统设计.md` | 对话树、剧情连锁、事件链设计 | 添加对话/剧情时 |
| `docs/NPC性格与AI设计.md` | NPC性格特质、AI行为设计 | 添加NPC或修改性格时 |

### 2.4 内容开发类
| 文档 | 用途 | 何时阅读 |
|------|------|---------|
| `docs/小说内容转化指南.md` | 如何把小说内容转化为游戏数据 | 从小说提取内容时 |
| `docs/小说内容梳理与游戏开发指南.md` | 完整的小说梳理方法论和开发指导 | 系统性填充小说内容时 |
| `docs/第一卷开发计划.md` | 第一卷（博城篇）的详细开发计划 | 开发第一卷内容时 |
| `docs/游戏开发路线图.md` | 整体开发路线图，四阶段规划 | 需要了解长期规划时 |

### 2.5 测试与调试类
| 文档 | 用途 | 何时阅读 |
|------|------|---------|
| `docs/UI元素坐标参考.md` | 各界面按钮坐标，用于自动化测试 | **测试UI点击时必读** |

### 2.6 文档阅读优先级
- **P0（必读）**：AGENTS.md → TODO.md → 数据格式规范.md
- **P1（常用）**：内容扩展指南.md → 架构说明.md → UI元素坐标参考.md
- **P2（按需）**：各系统设计文档 → 内容开发文档
- **P3（参考）**：README.md → 项目交接说明.md → CHANGELOG.md

---

## 三、开发规范

### 3.1 基本规范
1. **直接在master分支开发**，不创建feature分支
2. **每次完成一个功能就git commit**，commit message要清晰描述改动
3. **新增内容加到 engine/data/ 下对应的数据模块文件**，数据驱动，尽量不改代码（NPC→characters.js，敌人→enemies.js，任务→quests.js，物品→items.js，地点→locations.js，事件→events.js）
4. **重要设计要写文档到docs/**，保持文档与代码同步
5. **测试直接打开index.html**，不需要HTTP服务器
6. **更新代码时同步更新相关文档**，保持一致性

### 3.2 Git提交规范
```bash
# 进入项目目录
cd C:\Users\22210\Desktop\quanzhi-fashi-game-master

# 添加修改的文件
& "D:\Git\bin\git.exe" add engine/xxx.js docs/xxx.md

# 提交
& "D:\Git\bin\git.exe" commit -m "v0.4.0 描述：具体改动内容"
```

**Commit message格式**：`版本号 类型：具体描述`
- 示例：`v0.4.0 Bug修复：无限递归栈溢出、体力NaN`
- 示例：`v0.4.0 新功能：升级自动解锁技能系统`
- 示例：`v0.4.0 文档：新增UI元素坐标参考`

### 3.3 PowerShell注意事项
- **不支持&&语法**，多命令用分号`;`分隔
- 切换目录用 `Set-Location` 或 `cd`
- 调用exe用 `& "路径"` 格式
- 示例：`cd "目录"; & "D:\Git\bin\git.exe" status`

### 3.4 代码规范
- 所有弹窗交互元素优先使用`div+onclick`，而非`button`（避免点击问题）
- z-index层级：弹窗99999，遮罩999，消息弹窗防穿透9999999
- 所有z-index:0的元素添加`pointer-events:none`
- 关键方法添加try-catch错误处理
- 全局错误捕获div已在index.html中保留（默认隐藏）

---

## 四、核心代码索引

### 4.1 引擎文件（engine/）
| 文件 | 用途 | 关键方法/位置 |
|------|------|-------------|
| `game.js` | 主控制器 | performAction(97行), travelTo(215行), showNPCList(655行) |
| `data/` | **游戏内容数据（已拆分）** | 见下方4.2数据模块索引 |
| `player.js` | 玩家系统 | SKILL_UNLOCK_TABLE(10行), init(106行), gainExp(197行), levelUp(220行), checkSkillUnlocks(245行) |
| `battle.js` | 战斗系统 | 掉落逻辑(688行), 胜利奖励(710行) |
| `quest.js` | 任务系统 | updateProgress(74行), completeQuest(132行) |
| `event.js` | 事件系统 | applyEffects(150行) |
| `time.js` | 时间系统 | 8时段制，advanceTime, restUntilMorning, getCurrentClass |
| `inventory.js` | 背包系统 | addItem(40行), useItem(110行), equipItem(162行) |
| `ui.js` | UI渲染 | showMessage(20行), renderBattleScreen(692行), 标题界面(85行) |
| `map.js` | 地图系统 | 地点管理，NPC分布 |
| `shop.js` | 商店系统 | 买卖，声望折扣 |
| `skill.js` | 技能系统 | 技能定义，伤害计算 |
| `world-state.js` | 世界状态 | 声望，标记，事件链 |
| `npc-state.js` | NPC状态 | 好感，性格，关系 |
| `dialogue-tree.js` | 对话树 | 多层对话，条件，效果 |
| `data.js` | 数据管理器 | DataManager，加载和访问GameData |

### 4.2 数据模块索引（engine/data/）
> v0.4.0 起，原 game-data.js（9200+行）已拆分为以下模块。新增内容请修改对应模块文件，不要修改已废弃的 game-data.legacy.js。

| 文件 | 内容 | 数据量 |
|------|------|--------|
| `skills.js` | 技能数据（各系初阶/中阶技能） | 25项 |
| `characters.js` | NPC/角色数据（含对话树、性格、关系） | 24项 |
| `locations.js` | 地点数据（含行动、事件、NPC分布） | 7项 |
| `items.js` | 物品+装备数据（消耗品、材料、武器、护甲、饰品） | 22项 |
| `quests.js` | 任务数据（主线、支线、新手引导） | 29项 |
| `events.js` | 随机事件数据（修炼、探索、战斗等触发） | 42项 |
| `shops.js` | 商店数据（商品列表、声望折扣） | 4项 |
| `enemies.js` | 敌人/妖魔数据（属性、掉落、出现地点） | 17项 |
| `world.js` | 势力、情报库、预定事件、事件链 | 4大类 |
| `index.js` | 数据入口，合并所有模块为 GameData | - |

**数据拆分工具**：`tools/split-game-data.js`（重新拆分）、`tools/verify-split.js`（验证一致性）

---

## 五、沉淀经验（踩过的坑）

### 5.1 已修复的关键Bug（避免重犯）

#### Bug 1：无限递归栈溢出
- **现象**：点击任何行动按钮后报错"Maximum call stack size exceeded"
- **原因**：quest.js的completeQuest先发奖励（调用addItem），再移除任务。而addItem会调用updateProgress，发现任务还在activeQuests且已完成，再次调用completeQuest，形成无限递归
- **修复**：completeQuest开头先调用Player.completeQuest移除任务，再发奖励
- **位置**：engine/quest.js 第132行

#### Bug 2：showNPCList null.map
- **现象**：报错"Cannot read properties of null (reading 'map')"
- **原因**：showNPCList方法没有校验npcs参数，result.npcs为null时直接调用.map()
- **修复**：方法开头添加参数校验：`if (!npcs) npcs = []; if (!Array.isArray(npcs)) npcs = [];`
- **位置**：engine/game.js 第655行

#### Bug 3：体力显示NaN
- **现象**：休息到明天后，右上角体力显示"NaN/"
- **原因**：time.js的restUntilMorning调用getTotalStats()，但返回对象中没有maxStamina属性
- **修复**：player.js的getTotalStats()返回对象添加`maxStamina: this.maxStamina`
- **位置**：engine/player.js 第157行

#### Bug 4：消息弹窗点击穿透
- **现象**：点击消息弹窗关闭后，鼠标抬起时触发底层行动按钮
- **原因**：click事件在mousedown和mouseup都在同一元素时触发。mousedown在弹窗上，click关闭弹窗后，mouseup时底层按钮已暴露
- **修复**：多层防护
  1. closeMessage时创建全屏透明blocker（z-index:9999999，500ms后移除）
  2. msgBox和overlay添加mousedown事件，preventDefault+stopPropagation
  3. 显式设置pointer-events:auto
- **位置**：engine/ui.js showMessage方法

#### Bug 5：找人聊天没人时弹空窗口
- **现象**：点击"找人聊天"，弹出"选择对话对象"窗口但里面没人
- **原因**：只要result.npcs !== undefined（包括空数组）就弹窗
- **修复**：当可用NPC和不可用NPC都为空时，直接显示消息"这里现在没有人..."
- **位置**：engine/game.js 第190行

### 5.2 UI交互经验

#### 按钮点击问题
- **所有弹窗/全屏界面的button元素改为div+onclick**（标题界面和地图界面的button可保留）
- 商品卡片div添加onclick购买，体验良好
- 商店背景图片div：z-index从0改为-1，添加pointer-events:none
- 标题界面按钮容器需要position:relative，z-index才生效
- 标题界面按钮容器z-index建议设为99998

#### 浏览器点击坐标偏差
- 测试环境的自动化点击可能有坐标偏差
- 实际玩家用鼠标点击不会有此问题
- 测试时参考`docs/UI元素坐标参考.md`，对准按钮中心
- 动态按钮建议通过文字识别点击，而非固定坐标

#### 消息弹窗防穿透
- 关闭弹窗时插入全屏blocker遮罩（z-index:9999999，500ms后移除）
- mousedown时阻止默认行为
- overlay/msgBox显式pointer-events:auto
- 3秒自动消失时也创建blocker

### 5.3 时间系统经验
- **time.js有重复方法定义**，后面的定义覆盖前面的，修改时注意修改后面的版本
- 8时段制：清晨(6-8)、上午(8-12)、中午(12-14)、下午(14-18)、傍晚(18-20)、夜晚(20-24)、深夜(0-3)、睡眠(3-6)
- 可操作时间：06:00-03:00（21小时）
- 强制睡眠：03:00未睡觉则强制昏睡，第二天体力恢复50%
- 熬夜惩罚：24:00后行动体力消耗翻倍
- 课程表数据在game-data.js的tianlan_school.classSchedule

### 5.4 任务系统经验
- **任务进度自动更新**：reach类型在performAction和travelTo时更新，collect类型在addItem时更新，kill类型在战斗胜利时更新
- **任务完成自动交付**：updateProgress检测到完成后自动调用completeQuest
- **自动接取下一任务**：completeQuest中如果有nextQuest，自动接取
- **completeQuest必须先移除任务再发奖励**，否则会无限递归（见Bug 1）

### 5.5 技能系统经验
- **升级自动解锁技能**：SKILL_UNLOCK_TABLE定义在player.js顶部，按元素和等级定义
- 1级初始技能、3级二级技能、5级三级技能
- checkSkillUnlocks方法会自动学习未拥有的技能
- gainExp返回值已改为对象`{levelUps, newSkills}`，不是数组
- 所有调用gainExp的地方（battle.js、quest.js、event.js）已修改

### 5.6 存档系统经验
- 版本号在player.js顶部：GAME_VERSION和SAVE_VERSION
- 存档自动迁移系统在player.js的load方法中
- 旧存档使用4时段ID，新系统使用8时段ID，迁移时注意兼容

### 5.7 文件读取经验（避免重复踩坑）

#### Read工具offset是token偏移量，不是行号
- **坑**：误以为offset是行号，连续试3500/2500/1800等都返回空，因为文件实际只有2000-3000 token
- **正确做法**：
  1. 先用 `Get-Content "文件" | Measure-Object -Line` 确认行数
  2. 读取全文用 `offset=0` 配合 `limit`（默认4000，大文件可设更大）
  3. 读取末尾用 Bash：`Get-Content "文件" -Tail N`（N为行数）
  4. 读取特定行范围用 Bash：`Get-Content "文件" | Select-Object -Skip M -First N`
  5. 中文文件每行约10-20 token，可据此估算offset
- **经验**：不确定文件大小时，直接用offset=0读取，不要猜offset

#### Edit工具匹配失败的常见原因
- **编码问题**：Bash输出中文可能显示乱码，但文件实际是UTF-8。用Read工具读取才能看到准确文本
- **空格/缩进差异**：Edit要求old_string完全匹配，包括空格和缩进。用Read工具确认准确文本后再Edit
- **非唯一匹配**：如果old_string在文件中出现多次，会匹配失败。需要提供更多上下文使其唯一

#### 大文件处理建议
- 小说文件（23MB）不要用Read直接读全文，用Bash提取特定章节后再读
- 数据模块文件（characters.js 136KB等）可用Read读取，offset从0开始
- 读取文件末尾优先用 `Get-Content -Tail N`，比猜offset高效

---

## 六、当前开发状态（v0.4.0）

### 6.1 已完成核心系统
1. 玩家系统：觉醒、等级、属性、技能、背包、体力
2. 战斗系统：回合制、元素克制、星子引导、技能引导/瞬发、状态效果
3. 地图系统：5+地点、解锁条件、昼夜敌人差异、NPC日程
4. NPC系统：20+ NPC、六维关系、性格特质、对话树
5. 任务系统：28+任务、多目标、声望奖励、自动进度/交付
6. 事件系统：28+随机事件、事件链
7. 时间系统：8时段制、精确到小时、昼夜更替、熬夜惩罚、强制昏睡
8. 大事件系统：博城灾难事件链、8个结局
9. 势力声望：5大势力，7级声望
10. 情报系统：44+情报
11. 存档系统：版本兼容、自动迁移
12. 装备系统：武器/护甲/饰品三槽位、属性加成（10件装备）
13. 课程表系统：每周课程安排、动态奖励、逃课惩罚、实践课受伤
14. 升级自动解锁技能：1/3/5级解锁，新增10个技能
15. 战斗掉落系统：经验/金币/物品/精英加成
16. 商店系统：4个商店，扩充商品（体力药水、万能药水）

### 6.2 当前开发阶段
- **阶段一：初版可玩** ✅ 已完成
- **阶段二：小说内容填充** 🚀 当前重点（完成度约5%）
- **阶段三：深度玩法系统** ⏳ 待开始
- **阶段四：完善与优化** ⏳ 长期

### 6.3 可玩性增强已完成
- ✅ 战斗界面技能UI（动态渲染，元素颜色边框）
- ✅ 升级自动解锁技能系统（SKILL_UNLOCK_TABLE，1/3/5级）
- ✅ 战斗胜利掉落系统（已有完整实现）
- ✅ 商店商品扩充（体力药水、万能药水）
- ✅ 新增4个前期支线任务
- ✅ inventory支持stamina效果

### 6.4 待开发方向（按优先级）
**P1 - 重要可玩性**：
- NPC送礼系统
- 采集系统完善（更多材料、材料用途）
- 第二元素觉醒（达到中阶8级）

**P2 - 深度内容**：
- 天赋系统（升级获得天赋点）
- 装备强化/附魔
- 隐藏事件/秘密
- 星子引导小游戏

**P3 - 锦上添花**：
- 成就系统
- 收集系统
- 音效音乐
- 多周目系统

---

## 七、常见问题与解决方案

### Q1：点击按钮没反应怎么办？
A：可能是以下原因：
1. 坐标偏差：参考UI元素坐标参考.md，调整点击位置
2. 按钮被遮挡：检查z-index和pointer-events设置
3. JavaScript错误：查看页面顶部是否有红色错误条（全局错误捕获）
4. button元素问题：弹窗中的button改为div+onclick

### Q2：如何快速测试新功能？
A：
1. 直接修改 engine/data/ 下对应的数据模块文件添加数据
2. 刷新浏览器页面（Ctrl+R）
3. 如果需要新存档，在标题界面点"开始新游戏"
4. 用node --check检查语法：`node --check engine/data/xxx.js`

### Q3：添加新内容需要改代码吗？
A：大部分不需要。数据驱动架构，新增NPC/地点/任务/事件/物品/敌人只需在 engine/data/ 下对应模块文件中添加数据。只有新增系统功能时才需要改代码。

### Q4：如何查看当前有哪些数据？
A：直接打开 engine/data/ 下对应的模块文件：
- 技能：`engine/data/skills.js`
- NPC：`engine/data/characters.js`
- 地点：`engine/data/locations.js`
- 物品：`engine/data/items.js`
- 任务：`engine/data/quests.js`
- 事件：`engine/data/events.js`
- 商店：`engine/data/shops.js`
- 敌人：`engine/data/enemies.js`
- 势力/情报：`engine/data/world.js`

### Q5：Git提交报错怎么办？
A：
1. 确认Git路径正确：`D:\Git\bin\git.exe`
2. 确认在项目目录下：`cd C:\Users\22210\Desktop\quanzhi-fashi-game-master`
3. 查看状态：`& "D:\Git\bin\git.exe" status`
4. PowerShell中用`& "路径"`调用exe

---

## 八、文档维护规范

### 8.1 什么时候更新文档
- **新增系统功能**：在docs/下新建设计文档，或更新现有文档
- **修改数据格式**：更新`数据格式规范.md`
- **修复重要Bug**：在本文档"沉淀经验"中记录
- **新增UI界面**：更新`UI元素坐标参考.md`
- **版本发布**：更新README.md、CHANGELOG.md、本文档的版本信息

### 8.2 文档更新原则
1. **文档与代码同步**：改了代码就要更新相关文档
2. **保持简洁**：只记录对开发有帮助的信息，不写废话
3. **可追溯**：记录关键决策的原因和背景
4. **实用优先**：文档是给agent看的，要能直接指导开发

---

## 九、联系与反馈

- 项目维护者：用户
- 开发模式：有风险时询问，无沙箱，命令直接在真实系统执行
- 删除/覆盖/发布等有风险操作由系统自动弹窗确认

---

**本文档最后更新：v0.4.0**
**下次更新：版本发布或重要改动时**
