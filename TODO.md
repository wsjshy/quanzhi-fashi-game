# TODO - 全职法师游戏

> 当前版本：v0.8.28 | 最后更新：2026-08-14
> 状态说明：[ ]待做 [~]进行中 [x]完成

---

## P0 - 待开发

### v0.8.28 用户体验大优化（2026-08-14，基于20条用户反馈）✅ 已完成

#### 🔴 紧急Bug修复（影响游戏正常运行）

- [x] **Bug#14 时间显示"12.5:00"**：新增`TimeSystem.formatHour()`方法，整点显示X:00，半点显示X:30
- [x] **Bug#13 升级获得NaN属性点**：根因`levelUps数组 * 3 = NaN`，全部改为显示`Player.attributePoints`实际值
- [x] **Bug#16 猎者联盟大厅无代价获取经验**：删除effects.exp，改为空对象（用户要求不耗时，只删经验）
- [x] **Bug#8 原地休息UI显示"不消耗时间"**：UI改为显示"消耗1小时"
- [x] **Bug#12 图书馆时间不一致**：描述从"2小时"改为"1小时"

#### 🟡 UI体验优化（影响操作流畅度）

- [x] **Issue#3 装备已拥有显示不含穿戴中**：新增`Inventory.getTotalOwned()`统计背包+装备栏
- [x] **Issue#4 消息弹出延迟**：`_canShowMessage()`中modalStates移除shop/inventory/character
- [x] **Issue#5 属性分配后页面跳顶**：`updateCharacterScreen()`保存并恢复scrollTop
- [x] **Issue#17 点击多次不生效**：消息关闭后冷却从500/800ms缩短为200ms
- [x] **Issue#18 原地休息体力不即时刷新**：调整quickRest渲染顺序

#### 🟠 对话系统修复（影响剧情体验）

- [x] **Issue#6 张小侯"我要离开博城"提前出现**：`WorldState.checkConditions()`新增hasFlag处理；博城灾难完成时设置flag
- [x] **Issue#7 张小侯"随便聊聊"回复不匹配**：第一条文本改为与"跑得快"主题一致
- [x] **Issue#15 周会长首次对话"好久不见"**：对话树新增`_isFirstMeet`检测，首次见面过滤不适合文本
- [x] **Issue#19 对话点击后直接退出**：无next时返回default节点；新增back返回上一节点

#### 🔵 行动系统优化（影响游戏节奏）

- [x] **Issue#9 修炼魔法vs冥修**：修炼魔法改为高经验(30)高消耗，冥修改为恢复型(MP+40/HP+10)低经验(8)
- [x] **Issue#10 宿舍休息vs原地休息**：宿舍休息改名为"宿舍休息"，描述明确比原地休息效果好
- [x] **Issue#11 等待时间形式**：等待结束后15%概率触发随机事件，描述更新
- [x] **Issue#2 场景切换时间**：地图旅行显示从"2小时"改为"0.5小时"，与实际travelTime一致

#### 🟣 系统设计（中长期）

- [x] **Issue#1 天生天赋升级机制**：新增`innateTalentLevel`，每5级进化一次，数值效果按1+0.2*(level-1)缩放
- [x] **Issue#20 特殊事件触发机制**：新增`EncounterSystem`遭遇系统，事件追踪面板，穆白挑战/新生试炼入口

---

## P0 - 已完成

### v0.8.27 召唤系天赋战斗效果+剩余A类（2026-08-14）
- [x] 召唤兽属性计算加入天赋加成（等级/全属性/HP/伤害/继承/持续时间）
- [x] 召唤兽攻击加入暴击率/暴击伤害（来自天赋）
- [x] 召唤兽狂暴（HP<30%时+50%伤害）
- [x] 召唤兽冲锋（30%概率追加150%伤害）
- [x] 开场自动召唤（openingSummon）
- [x] 召唤兽在场时玩家攻防+25%（summonMasterDamageBonus/DefBonus）
- [x] 伤害共享（damageShare 50%）替代旧lifeLink
- [x] 共享回复（sharedHpRegen 每回合3%HP）
- [x] 召唤兽死亡爆发（200%攻击必暴伤害）
- [x] 召唤兽死亡治疗（玩家回50%HP）
- [x] 召唤兽在场时玩家免疫负面（summonDebuffImmunity）
- [x] 光系对debuff敌人+50%伤害（debuffedDamageBonus）
- [x] 护盾防御+30%（shieldDefenseBonus）
- [x] 护盾每回合回复（shieldRegen）
- [x] 修复applyDamage中te未定义bug（护盾反射/破碎反伤）
- [x] 65项node测试全部通过

### v0.8.26 多召唤兽契约+bug修复（2026-08-14）
- [x] 多召唤兽架构：summonBeasts[]数组+activeSummonIndex
- [x] 契约数量限制：初阶1/中阶2/高阶3/超阶4
- [x] 契约/切换/迁移方法
- [x] UI多兽显示+切换按钮+寻找新契约
- [x] Game.switchSummon()/seekNewSummon()
- [x] 修复战斗结算卡住bug（DoT/光环在敌人回合击杀）
- [x] 修复召唤兽不存档bug
- [x] 旧存档迁移兼容
- [x] debug模式跳过开场剧情
- [x] 66项node测试全部通过

### v0.8.25 7种召唤兽+进化线完善（2026-08-14）
- [x] 新增风翼鸟🐦（飞行/风系/敏捷型，SPD28最快）
- [x] 新增白铠战蛰🦂（虫型/坦克/反击+毒，参考小说第149章）
- [x] 风翼鸟进化线：风翼鸟→雷翼鹰→天鹰
- [x] 白铠战蛰进化线：白铠战蛰→赤铠战蛰→战蛰女王
- [x] 随机契约权重更新为7种召唤兽
- [x] node自动化测试+浏览器黑盒测试通过

### v0.8.24 召唤兽进化系统（2026-08-14）
- [x] 5种召唤兽各2阶进化路线
- [x] 进化条件：等级+境界+忠诚
- [x] 进化效果：属性倍率+新技能+名称/icon/描述变化
- [x] getBeastCurrentData()/canEvolve()函数
- [x] evolveSummonBeast()玩家方法
- [x] UI显示进化按钮/条件/阶段
- [x] 修复statMultiplier变量名bug、realmOrder缺initial、技能累积

### v0.8.23 多种召唤兽（2026-08-14）
- [x] 5种召唤兽数据（幽狼兽/岩魔人/银甲巨犀/幽冥狐/四瞳巨蟒）
- [x] 首次召唤随机契约
- [x] 每种召唤兽4个专属技能
- [x] 技能效果：中毒/束缚/眩晕/连击/HP回复/减攻

### v0.8.22 召唤兽培养深化（2026-08-14）
- [x] 召唤兽等级/经验/忠诚持久化
- [x] 召唤兽技能系统
- [x] 喂养系统（兽粮/魔肉/灵草）
- [x] 角色面板显示召唤兽信息

### v0.8.21 三步塔修炼（2026-08-14）
- [x] 三步塔地点（天澜魔法高中内）
- [x] 三层修炼（2/3/5倍经验）
- [x] 三步塔顿悟随机事件

### v0.8.13 自身天赋系统+体验修复（2026-08-14）
- [x] 自身天赋系统：22种天生天赋，角色创建时3选1
- [x] 传说天赋：天生双系（额外随机觉醒一系）、技能大师、施法专注
- [x] 随机觉醒按钮：觉醒面板可随机觉醒
- [x] 修复装备"使用"消失bug
- [x] 购买装备反馈优化
- [x] 原地休息消耗1小时，10%遇敌率
- [x] 自身天赋效果合并到战斗中
- [x] 角色面板显示自身天赋

### v0.8.14 A类战斗效果扩展（2026-08-14）
- [x] 感电麻痹：shockParalyzeChance（感电时额外麻痹概率）
- [x] 连段增伤：comboDamageIncrease（二连/三连伤害递增）
- [x] 闪避必暴：dodgeNextHitBonus（闪避后下次必暴）
- [x] 不可驱散：burnUnpurgeable/freezeUnpurgeable/slowUnpurgeable/curseUnpurgeable
- [x] 冻结降防：freezeDefenseDown（冻结时敌人防御降低）
- [x] 冻结掉血：frozenHpDrain（每回合损失%最大HP）
- [x] 霜爆：frostExplosion（解冻时造成%最大HP伤害）
- [x] 低HP反制：lowHpFreezeChance（低HP时冻结攻击者）
- [x] 暴击击退：critKnockback（暴击时概率眩晕敌人）
- [x] 攻击爆炸：explosionChance/explosionDamage/explosionCritGuaranteed
- [x] 低HP增伤：lowHpDamageScaling（HP越低伤害越高）
- [x] 闪电连锁：chainChance/chainTargets/chainDamageRatio/chainNoDecay
- [x] debuff增伤：debuffedDamageBonus（对有debuff敌人伤害提升）
- [x] 自动潜行：autoStealthChance（受击后概率重新潜行）
- [x] 圣盾：holyShield/holyShieldDuration（致命伤害时保留1HP+无敌）
- [x] 自动净化：autoPurify（每回合自动净化1个负面状态）
- [x] 滋润不可驱散：regenUnpurgeable
- [x] 滋润附加：regenDamageReduction/regenDefenseBonus/regenMp
- [x] 风系DOT加成：windDotBonus（风助火势，持续伤害+50%）
- [x] 黑暗领域：enemyHitDown（降低敌人命中）
- [x] 生命之种：lifeSeed/lifeSeedDelay/lifeSeedHeal（延迟爆发治疗）
- [x] 击退免疫：knockbackImmune（免疫stun）
- [x] addStatusEffect方法修复：统一状态添加入口
- [x] 麻痹不可闪避：paralyzeNoDodge（已有）
- [x] 岩盾：shieldChance/shieldRatio（已有）

### v0.8.16 第十四批A类效果（2026-08-14）
- [x] 诅咒结束伤害：curseEndDamage（诅咒结束时爆发暗伤）
- [x] 诅咒击杀回血：curseKillHeal（击杀被诅咒敌人回血）
- [x] 暗影击杀回血：shadowFormHeal（潜行击杀回血）
- [x] 低HP回复翻倍：lowHpRegenDouble（HP<30%时滋润翻倍）
- [x] 极寒领域：fieldIceResDown（绝对零度领域冰抗降低）
- [x] 净化回血：purifyHeal（每个被净化状态回血）
- [x] 净化攻击：purifyAtkBuff（净化后攻击提升）
- [x] 紧急回复CD：emergencyCooldown（支持多次触发）
- [x] 潮汐护盾：tideShield/tideShieldDuration（满潮时获得护盾）
- [x] 潮汐净化：tideCleansing（满潮时净化负面）
- [x] 致命护盾：lethalShield（低HP时自动获得护盾）

### v0.8.17 第十五批A类效果（2026-08-14）
- [x] 火地面：fireGround/fireGroundDamage/fireGroundDuration（火系技能留下燃烧地面）
- [x] 火雨：fireRain/fireRainDamage/fireRainInterval（每隔数回合天降火雨）
- [x] 诅咒传播：curseSpreadChance（诅咒结束时概率额外暗伤）
- [x] 神圣庇护：protectionDuration（复活后短暂无敌）
- [x] addStatusEffect日志修复：buff显示"获得了"而非"陷入了"
- [x] 火滋·烈阳bug验证：回合正常推进，无需修复

### v0.8.12 十批A类天赋效果（2026-08-14）
- [x] 降低战斗自动回复：HP 1%→0.3%，MP 2%→0.5%
- [x] 提高玩家初始属性：HP100→120, ATK10→15, DEF5→8
- [x] 防御系数0.3→0.5
- [x] 新增3种低级怪（影鼠Lv1/独狼兽Lv2/山猿Lv3）
- [x] 数值模拟验证：同级怪3-6回合，连续作战需管理MP/HP

### v0.8.10 天赋进化效果（2026-08-14）

### 已完成效果（4批，约90个效果键）

**第一批 - 基础战斗效果**
- [x] 基础属性：damageBonus/critRate/critDamage/dodgeBonus/speedBonus/defenseBonus/hpBonus/damageReduction/mpCostReduction
- [x] 元素穿透：firePenetration/icePenetration/thunderPenetration/earthPenetration/windPenetration
- [x] 低HP增伤：enrageDamage/lowHpDamageBonus/enrageThreshold
- [x] 技能等级加成：skillLevelBonus（每级+15%技能伤害）
- [x] 吸血：lifesteal（普攻和技能都触发）
- [x] 连击：comboChance/comboDamageMult（概率追加攻击）
- [x] 反伤：damageReflect（烈焰护体）
- [x] 岩刺：rockSpikes/rockSpikesDamage（近战基于防御反伤）
- [x] 坚岩：hardRockChance/hardRockReduction（概率减伤）
- [x] 开场护盾：iceShield（冰甲）/crystalShield（晶化盾）
- [x] 免死：divineProtection/autoRevive/autoReviveHp
- [x] 光环：fireAura（每回合%HP火伤）/frostAura（减速）/healAura（回血）
- [x] 普攻异常：burnChance/burnDamage/freezeChance/freezeDuration/paralyzeChance/paralyzeDuration/stunChance/slowChance
- [x] 暴击雷鸣：thunderRoar/thunderRoarChance（暴击概率麻痹）
- [x] 暴击得护盾：shieldOnCrit/shieldOnCritAmount
- [x] 开场效果：shadowForm（隐身）/absoluteZeroField（开场冻结）/kingIntimidate（降攻防）/openingThunder（开场雷罚）
- [x] 击杀：killHeal/killMpRestore
- [x] 回复加成：hpRegen/mpRegen

**第二批 - 进阶效果**
- [x] 风刃追加：windBladeChance/windBladeCount/windBladeDamage
- [x] 治疗增强：healBonus/healCritRate/healCritDouble
- [x] 燃烧爆炸：burnExplode/burnStackMax/burnExplodeDamage/burnSpread
- [x] 闪避后：dodgeCritBuff/dodgeHeal/dodgeMpRestore
- [x] 元素抗性/免疫：fireResistance/fireImmunity等各系
- [x] 冰吸收：iceAbsorb（冰伤回血）
- [x] 紧急回复：emergencyHeal/emergencyThreshold/emergencyHealAmount
- [x] 击杀减CD：killCooldownReduce
- [x] MP消耗减少：mpCostReduction在技能释放时实际生效

**第三批 - 控制/斩杀**
- [x] 冰霜新星：frostNova/frostNovaInterval/frostNovaDamage/frostNovaSlow
- [x] 时间冻结：timeStopChance/timeStopDuration
- [x] 恐惧：fearChance（跳过回合）
- [x] 致盲：blindChance/blindDuration（命中-50%）
- [x] 雷系斩杀：thunderExecute/executeThreshold/executeChance
- [x] 致盲hitMod在状态修正中生效
- [x] isStunned添加fear类型

**第四批 - 增伤/减益**
- [x] 暴击穿防：critArmorPenetration
- [x] 暗影标记：darkMark/darkMarkDuration/darkMarkDamage
- [x] 诅咒：curseChance/curseDuration/curseAtkDown/curseDefDown
- [x] 状态系统支持darkDamageMod/atkMod/defMod

---

### 待实现效果详细清单

#### A类：现有框架可直接实现（不需要架构改动，优先级高）

**雷系蓄电机制**
- [x] chargeStack/chargeMax/chargePerStack - 攻击叠加蓄电层数，每层+麻痹概率
- [x] fullChargeCrit/fullChargeDamage - 满层时暴击率/暴击伤害提升
- [x] paralyzeNoDodge - 麻痹时不可闪避
- [ ] paralyzeDamage/paralyzeChain - 麻痹时额外伤害/连锁
- [x] shockDebuff/shockDuration/shockThunderBonus - 感电状态，雷伤+30%
- [x] shockParalyzeChance - 感电时额外麻痹概率
- [x] skyThunderChance/skyThunderDamage - 天雷引：30%概率随机落雷
- [x] critParalyze - 暴击必麻痹
- [x] thunderCounter/thunderCounterDamage - 雷反：被攻击时20%反击
- [ ] thunderRoarCooldown/thunderRoarParalyze - 雷鸣CD和麻痹全体

**连击/多段攻击升级**
- [x] doubleStrikeChance/secondHitRatio - 二连斩（风系连袭Lv3）
- [x] tripleStrikeChance/thirdHitRatio - 三连斩（Lv5）
- [x] attackSpeedStack/attackSpeedMax - 风魔：每层速度+5%
- [x] hitCritStack/hitCritMax - 命中叠加暴击
- [x] comboDamageIncrease/comboMpReduction - 连段伤害递增/MP递减
- [x] firstStrikeChance/firstStrikeDamage - 先手攻击加成
- [x] dodgeNextHitBonus/dodgeCritDamage - 闪避后下次必暴/暴伤

**燃烧/冰霜深化**
- [x] burnDefenseDown - 燃烧时防御-15%
- [x] burnUnpurgeable - 燃烧不可驱散
- [x] frostSlow/frostStackMax/frostFreezeOnMax - 冰霜减速叠加，满层冻结
- [x] freezeDefenseDown/freezeUnpurgeable - 冻结降防/不可驱散
- [x] frozenIceDamageBonus/frozenDamageTaken - 冻结时冰伤+50%/受伤+20%
- [x] frostExplosion/frostExplosionRange - 霜爆：解冻时伤害
- [x] frozenHpDrain/freezeSpread - 冻结掉血/扩散
- [x] frozenCritGuaranteed - 对冻结目标必暴
- [x] slowBonus/slowUnpurgeable - 减速效果增强/不可驱散
- [x] lowHpFreezeChance - 低HP时冻结攻击者
- [x] fieldIceResDown - 绝对零度领域冰抗-30%

**土系防御深化**
- [x] shieldChance/shieldRatio - 岩盾概率/比例
- [ ] shieldDefenseBonus/shieldBreakDamage - 护盾时防御+30%/破碎反伤
- [ ] shieldRegen/shieldReflect - 护盾每回合回复/反射
- [x] permanentShield/critImmunity - 常驻30%HP护盾/免暴
- [x] defenseStack/defenseStackMax - 大地祝福防御叠加
- [x] knockbackImmunity - 免击退
- [x] earthquakeChance/earthquakeDamage/earthquakeSlow - 地震
- [x] defenseToDamage - 防御50%转伤害
- [x] stunExtendChance - 延长眩晕
- [ ] meteor/meteorInterval/meteorDamage/meteorStunChance - 陨石（4回合延迟）

**风系机动深化**
- [x] hurricaneChance/hurricaneDuration/hurricaneVulnerable - 飓风卷起
- [ ] tornadoChance/tornadoDamage/tornadoKnockback - 龙卷风（全体）
- [x] windDotBonus - 风系持续+50%
- [ ] enemySpeedDown/allySpeedBonus - 寒冰领域
- [ ] teamSpeedBonus/teamDodgeBonus - 团队buff（单机无队友）
- [ ] stormPunishChance/stormPunishDamage/stormPunishStun - 天罚风暴（全体）

**水系治疗深化**
- [x] waterGuardChance/waterGuardReduction - 水之盾减伤
- [x] healExtraHp - 治疗额外5%上限HP
- [x] healPurifyChance/purifyOnHealChance - 治疗时净化
- [x] autoHeal - 自动治疗
- [x] regenChance/regenAmount/regenDuration - 滋润持续回复
- [x] regenMp/regenDamageReduction/regenDefenseBonus - 滋润MP/减伤/加防
- [x] regenUnpurgeable/lowHpRegenDouble - 滋润不可驱散/低HP翻倍
- [ ] tide/tideInterval/tideHeal/tideCleanse - 潮汐（全体）
- [x] tideDamageStack/tideDamageMax/tideHealStack/tideHealMax - 涨潮叠加
- [x] tsunamiChance/tsunamiDamage/tsunamiAtkDown - 海啸
- [x] tideShield/tideShieldDuration/autoTide - 潮汐护盾/自动潮汐
- [x] healShield - 治疗转护盾
- [x] healToDamage - 治疗转伤害
- [x] healMpRestore - 治疗时回MP
- [x] emergencyCooldown - 紧急回复CD

**光系深化**
- [x] lightShield - 光之护封盾
- [x] blindImmunity - 免致盲
- [x] judgmentChance/judgmentDamage - 圣光审判
- [ ] teamAtkBonus/teamDefBonus - 团队buff（单机无队友）
- [ ] purifyChance/aoePurify/purifyCount - 净化
- [ ] purifyHeal/purifyDebuff/purifyAtkDown/purifyDefDown - 净化附带效果
- [ ] purifyTeamHeal/purifyDamage - 净化团队回血/对暗伤害
- [x] holyShield/holyShieldDuration/holyShieldTarget - 圣盾
- [x] shieldDebuffImmunity - 护盾时免负面
- [ ] debuffedDamageBonus - 对负面目标+50%
- [ ] angelInterval/angelDamage/angelHeal - 天使降临
- [x] debuffImmunity - 免疫负面
- [x] darkDamageBonus - 对暗系伤害加成

**暗系深化**
- [x] stealthOnStart - 暗影形态
- [x] lowHpDodgeBonus - 低HP闪避
- [x] shadowFormHeal - 暗影击杀回血
- [x] enemyHitDown - 黑暗领域：敌命中-15%
- [ ] teamDarkBonus - 团队暗伤（单机无队友）
- [x] ignoreDodgeChance - 无视闪避
- [x] stealthCritBonus - 潜行暴击
- [x] reStealthChance - 击杀后重新隐身
- [x] markNoStealth/autoStealthChance - 暗影标记禁隐身/自动隐身
- [x] curseEndDamage/curseSpreadChance/curseUnpurgeable - 诅咒结束伤害/传播/不可驱散
- [x] curseKillHeal - 诅咒击杀回血
- [x] guaranteedCrit - 必暴
- [x] curseCritDown/curseDodgeDown - 诅咒降暴击/闪避

**治愈系深化**
- [ ] lifeLink - 生命链接（单机无队友）
- [x] blessAtkBonus/blessDefBonus/blessDuration - 祝福之环
- [x] lifeSeed/lifeSeedDelay/lifeSeedHeal - 生命之种延迟爆发
- [x] revive/reviveHp - 复活
- [x] purifyAll - 全净化
- [x] autoPurify - 自动净化
- [x] protectionDuration - 神圣庇护
- [x] cooldownReduction - 冷却缩减
- [x] autoHeal - 自动治疗
- [x] reviveUnlocked - 解锁复活（数据层面，复活功能已实现）

**召唤系深化（需要召唤系统完善，优先级中）**
- [ ] summonDamageBonus/summonHpBonus - 召唤兽伤害/HP
- [ ] inheritStats/summonInheritHp - 继承属性
- [ ] summonLevelBonus/summonAllStats - 等级+2/全属性+15%
- [ ] beastTideChance/beastTideDamage/beastTideDuration - 兽潮
- [ ] summonCritRate/summonCritDamage - 召唤兽暴击
- [ ] damageShare/sharedHpRegen - 生命共享
- [ ] summonMasterDamageBonus/summonMasterDefBonus - 灵魂融合
- [ ] summonDeathBurst/summonDeathHeal - 灵魂爆发
- [ ] summonDebuffImmunity - 人兽合一免负面
- [ ] doubleSummonChance/packBonus/maxSummons - 双重/兽群/数量
- [ ] summonDurationBonus/extraSummonChance - 持续时间/额外召唤
- [ ] chainSummonChance/intimidateDuration - 连续召唤/威压持续
- [ ] summonChargeChance/summonChargeDamage - 兽群冲锋
- [ ] summonEnrage/openingSummon/summonHasTalent - 兽王之怒/开场野兽/自带天赋

#### B类：需要小架构改动（优先级中）

**多目标/范围效果**
- [ ] chainChance/chainTargets/chainDamageRatio/chainNoDecay - 闪电连锁跳跃
- [ ] explosionChance/explosionDamage/explosionRangeBonus - 爆炸
- [ ] chainExplosionChance/chainExplosionDamage - 连环爆炸
- [ ] explosionCritGuaranteed - 爆炸必暴
- [x] fireGround/fireGroundDuration/fireGroundDamage - 火海地面
- [x] fireRain/fireRainDuration/fireRainDamage - 火雨
- [ ] aoeHeal/aoeHealRatio - 范围治疗
- [ ] iceRangeBonus/earthRangeBonus - 范围+1

**延迟/多回合效果**
- [ ] meteor - 陨石（4回合后落下）
- [ ] fireRain - 火雨（2回合）
- [ ] angelInterval - 天使降临（4回合）
- [ ] lifeSeed - 生命之种（3回合后爆发）

**伤害转移/链接**
- [ ] lifeLink - 生命链接分担30%伤害
- [ ] damageShare - 伤害共享

#### C类：需要大架构改动（优先级低，后续版本）

- [ ] 团队buff系统（需要队友/组队架构）
- [ ] 领域系统（field系统，影响全场）
- [ ] 召唤兽AI和操控（召唤系统完善）
- [ ] 多目标战斗架构（同时打多个敌人）
- [ ] 地面效果系统（fireGround等持续地形）
- [ ] 自动复活完整流程（revive动画/状态恢复）
- [ ] 双天赋/多天赋槽

---

## P1 - 系统测试与优化（v0.8.10完成后）

- [ ] 黑盒测试：实际浏览器中验证各天赋效果
- [ ] 自动化测试：为新效果编写测试用例
- [ ] 数值平衡：检查各天赋进化路线强度
- [ ] 性能检查：大量效果叠加时的性能
- [ ] Bug修复：测试中发现的问题

---

## P0 - 天赋进化系统（v0.8.9已完成）

- [x] 5阶段进化体系：Lv1觉醒→Lv3特性→Lv5形态进化→Lv7延伸→Lv10终极
- [x] talent.js引擎重写：evolutions数组、进化检测、效果合并
- [x] talents.js数据：50个天赋全部进化路线格式
- [x] 先天型天赋1级即终极形态
- [x] 进化时战斗日志特殊提示（🔮粉紫色）
- [x] 37项自动化测试通过

---

## P0 - 游戏体验优化（v0.8.8已完成）

- [x] 时间消耗优化、原地休息、战斗平衡
- [x] 战斗自动回复、冥想系统
- [x] 天赋3选1系统、Tooltips
- [x] 12项黑盒测试通过

---

## P0 - 剧情系统（已齐平230章）

### 博城篇（1-7章）+ 明珠篇（8-10章）已完成
- 127物品 / 70信息碎片 / 114事件 / 48NPC / 260对话节点 / 59任务

### 后续方向
- [x] 随机觉醒机制（3选1元素、加权概率、重新感知）
- [ ] 神赋系统（mythic稀有度，0.3%权重）
- [x] 三步塔修炼游戏化（v0.8.21：三层渐进式修炼+顿悟事件）
- [x] 召唤兽培养深化（v0.8.22：等级/经验/忠诚/技能/喂养）
- [ ] 猎法师等级+悬赏系统
- [ ] 继续拆小说231章+

---

## P1 - 各系独立修炼（v0.8.7已完成）

- [x] 各系独立等级/经验、新系加速、技能按系解锁
- [x] 境界判定、战斗经验分配、UI显示

---

## P1 - 软系统内容

### 对话/NPC
- [ ] 唐月/灵灵/赵满延/张小侯/穆宁雪对话树
- [ ] 好感度事件系统
- [ ] 更多NPC（西明/醋醋等）

### 战斗数据
- [ ] 全妖魔2-3个技能
- [ ] 植物系克制、光系对暗克制
- [ ] 数值平衡

### 召唤兽扩展
> 方法论见AGENTS.md"召唤兽扩展方法论"。添加方式：在summon-beasts.js加数据即可，无需改代码。

**初阶召唤兽候选（已有5种，可继续添加）：**
- [ ] 风翼鸟（飞行/敏捷型，风系技能，高速+闪避）
- [ ] 铁甲蝎（坦克/毒型，高防+毒技能）
- [ ] 冰蟾（冰系控制，冰冻+减速）
- [ ] 雷兽（雷系力量型，高攻+麻痹）
- [ ] 火鼠（火系敏捷型，火焰伤害+灼烧）
- [ ] 山猿（坦克/力量型，高HP+眩晕）
- [ ] 光蛾（辅助型，治疗+buff）
- [ ] 水蛛（控制型，束缚+毒）

**中阶召唤兽候选（中阶觉醒后可契约第二只）：**
- [ ] 雷鹰（飞行/雷系，高速+雷伤）
- [ ] 白铠战蛰（进阶虫型，高防+反击）
- [ ] 岩魔士（进阶岩型，超高防+地震）
- [ ] 进阶期幽狼兽（幽狼兽进化，需进化系统）
- [ ] 骨刺狰狼（进阶狼型，高攻+流血）
- [ ] 暗影妖兽（暗系稀有，潜行+暴击）

**召唤兽系统深化：**
- [x] 召唤兽进化系统（v0.8.24：5种召唤兽各2阶进化，条件=等级+境界+忠诚）
- [ ] 中阶第二契约（Lv15后可契约第二只召唤兽）
- [ ] 召唤兽装备/魔具
- [ ] 召唤兽技能书/学习新技能
- [ ] 召唤兽心情系统（影响战斗表现）

**小说拆解时注意：**
拆解新章节时，遇到以下内容记录到此处：
- 新种类妖魔有明确生物形态和特色能力
- 其他召唤系法师的契约兽
- 召唤位面的新生物
- 召唤兽进化/新契约描写

---

## P2 - 新系统（v0.9.x）

- [ ] 拍卖系统、物品合成
- [ ] 精神力独立资源
- [ ] 元素环境/天气加成
- [ ] 双元素融合魔法
- [ ] 领域系统
- [ ] 多阶段Boss

---

## P3 - 远期（v1.0+）

- [ ] 博城篇/明珠篇完整剧情线
- [ ] 团队战斗/多对多
- [ ] 多周目/新游戏+
- [ ] UI/美术优化

---

## 下一步计划

### 立即执行：第五批效果（A类中最有"进化感"的）

1. **雷系蓄电+感电** - 雷系天赋的核心机制，攻击蓄电，满层爆发
2. **连击升级（二连/三连/风魔）** - 风系连袭天赋的进化路线
3. **冰霜减速叠加+满层冻结** - 冰系控制深化
4. **治疗护盾+生命种子+复活** - 治愈系核心机制
5. **暗影潜行+重新隐身** - 暗系潜行天赋的进化
6. **潮汐/海啸自动循环** - 水系潮汐天赋
7. **冷却缩减+自动净化** - 通用辅助效果

### 之后：黑盒测试

在浏览器中实际测试v0.8.10所有效果，记录Bug并修复。

### 然后：B类效果（需要小架构改动）

闪电连锁、范围爆炸、火雨/陨石等多回合延迟效果。
