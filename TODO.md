# TODO - 全职法师游戏

> 当前版本：v0.8.11 | 最后更新：2026-08-14
> 状态说明：[ ]待做 [~]进行中 [x]完成

---

## P0 - 已完成

### v0.8.11 战斗数值平衡（2026-08-14）
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
- [ ] chargeStack/chargeMax/chargePerStack - 攻击叠加蓄电层数，每层+麻痹概率
- [ ] fullChargeCrit/fullChargeDamage - 满层时暴击率/暴击伤害提升
- [ ] paralyzeNoDodge - 麻痹时不可闪避
- [ ] paralyzeDamage/paralyzeChain - 麻痹时额外伤害/连锁
- [ ] shockDebuff/shockDuration/shockThunderBonus - 感电状态，雷伤+30%
- [ ] shockParalyzeChance - 感电时额外麻痹概率
- [ ] skyThunderChance/skyThunderDamage - 天雷引：30%概率随机落雷
- [ ] critParalyze - 暴击必麻痹
- [ ] thunderCounter/thunderCounterDamage - 雷反：被攻击时20%反击
- [ ] thunderRoarCooldown/thunderRoarParalyze - 雷鸣CD和麻痹全体

**连击/多段攻击升级**
- [ ] doubleStrikeChance/secondHitRatio - 二连斩（风系连袭Lv3）
- [ ] tripleStrikeChance/thirdHitRatio - 三连斩（Lv5）
- [ ] attackSpeedStack/attackSpeedMax - 风魔：每层速度+5%
- [ ] hitCritStack/hitCritMax - 命中叠加暴击
- [ ] comboDamageIncrease/comboMpReduction - 连段伤害递增/MP递减
- [ ] firstStrikeChance/firstStrikeDamage - 先手攻击加成
- [ ] dodgeNextHitBonus/dodgeCritDamage - 闪避后下次必暴/暴伤

**燃烧/冰霜深化**
- [ ] burnDefenseDown - 燃烧时防御-15%
- [ ] burnUnpurgeable - 燃烧不可驱散
- [ ] frostSlow/frostStackMax/frostFreezeOnMax - 冰霜减速叠加，满层冻结
- [ ] freezeDefenseDown/freezeUnpurgeable - 冻结降防/不可驱散
- [ ] frozenIceDamageBonus/frozenDamageTaken - 冻结时冰伤+50%/受伤+20%
- [ ] frostExplosion/frostExplosionRange - 霜爆：解冻时范围伤害
- [ ] frozenHpDrain/freezeSpread - 冻结掉血/扩散
- [ ] frozenCritGuaranteed - 对冻结目标必暴
- [ ] slowBonus/slowUnpurgeable - 减速效果增强/不可驱散
- [ ] lowHpFreezeChance - 低HP时30%冻结攻击者
- [ ] fieldIceResDown - 绝对零度领域冰抗-30%

**土系防御深化**
- [ ] shieldChance/shieldRatio - 岩盾概率/比例
- [ ] shieldDefenseBonus/shieldBreakDamage - 护盾时防御+30%/破碎反伤
- [ ] shieldRegen/shieldReflect - 护盾每回合回复/反射
- [ ] permanentShield/critImmunity - 常驻30%HP护盾/免暴
- [ ] defenseStack/defenseStackMax - 大地祝福防御叠加
- [ ] knockbackImmunity - 免击退
- [ ] earthquakeChance/earthquakeDamage/earthquakeSlow - 地震
- [ ] defenseToDamage - 防御50%转伤害
- [ ] stunnedDamageBonus/stunExtendChance - 对眩晕目标+50%/延长眩晕
- [ ] meteor/meteorInterval/meteorDamage/meteorStunChance - 陨石（4回合延迟）

**风系机动深化**
- [ ] hurricaneChance/hurricaneDuration/hurricaneVulnerable - 飓风卷起
- [ ] tornadoChance/tornadoDamage/tornadoKnockback - 龙卷风
- [ ] windDotBonus - 风系持续+50%
- [ ] enemySpeedDown/allySpeedBonus - 寒冰领域：敌速-15%我速+10%
- [ ] teamSpeedBonus/teamDodgeBonus - 风暴领域团队buff
- [ ] stormPunishChance/stormPunishDamage/stormPunishStun - 天罚风暴

**水系治疗深化**
- [ ] waterGuardChance/waterGuardReduction - 水之盾减伤
- [ ] healExtraHp - 治疗额外5%上限HP
- [ ] healPurifyChance/purifyOnHealChance - 治疗时净化
- [ ] autoHeal/autoHealTarget - 自动治疗最低HP友方
- [ ] regenChance/regenAmount/regenDuration/regenMp - 滋润持续回复
- [ ] regenDamageReduction/regenDefenseBonus - 滋润时减伤/加防
- [ ] regenUnpurgeable/lowHpRegenDouble - 滋润不可驱散/低HP翻倍
- [ ] tide/tideInterval/tideHeal/tideCleanse - 潮汐：3回合全体治疗+解控
- [ ] tideDamageStack/tideDamageMax/tideHealStack/tideHealMax - 涨潮叠加
- [ ] tsunamiChance/tsunamiDamage/tsunamiAtkDown - 海啸
- [ ] tideShield/tideShieldDuration/autoTide - 潮汐护盾/自动潮汐
- [ ] healShield/healShieldDuration - 治疗量30%转护盾
- [ ] healToDamage - 治疗10%转伤害
- [ ] healMpRestore - 治疗时回MP
- [ ] emergencyCooldown - 紧急回复CD

**光系深化**
- [ ] lightShield - 光之护封盾
- [ ] blindImmunity - 免致盲
- [ ] judgmentChance/judgmentDamage/judgmentTrueDamage - 圣光审判
- [ ] teamAtkBonus/teamDefBonus - 圣光加持团队buff
- [ ] purifyChance/aoePurify/purifyCount - 净化
- [ ] purifyHeal/purifyDebuff/purifyAtkDown/purifyDefDown - 净化附带效果
- [ ] purifyTeamHeal/purifyDamage - 净化团队回血/对敌伤害
- [ ] holyShield/holyShieldDuration/holyShieldTarget - 圣盾
- [ ] shieldDebuffImmunity - 护盾时免负面
- [ ] debuffedDamageBonus - 对负面目标+50%
- [ ] angelInterval/angelDamage/angelHeal - 天使降临
- [ ] debuffImmunity - 免疫负面
- [ ] lightDamageBonus/darkDamageBonus - 对暗/对光伤害加成

**暗系深化**
- [ ] stealthOnStart/stealthFirstHitBonus - 暗影形态（已部分实现）
- [ ] lowHpDodgeBonus/lowHpDamageScaling - 低HP闪避/伤害递增
- [ ] shadowFormHeal - 暗影击杀回血
- [ ] enemyHitDown - 黑暗领域：敌命中-15%
- [ ] teamDarkBonus - 黑暗领域团队暗伤+20%
- [ ] ignoreDodgeChance - 潜行攻击无视闪避
- [ ] stealthDamageBonus/stealthCritBonus - 潜行伤害/暴击
- [ ] reStealthChance/reStealthDuration/reStealthCrit - 影杀重新隐身
- [ ] markNoStealth/autoStealthChance - 暗影标记禁隐身/自动隐身
- [ ] curseEndDamage/curseSpreadChance/curseUnpurgeable - 诅咒结束伤害/传播/不可驱散
- [ ] curseKillHeal/guaranteedCrit - 诅咒击杀回血/必暴
- [ ] curseCritDown/curseDodgeDown/curseCritDamageTaken - 诅咒降暴击/闪避/受暴伤

**治愈系深化**
- [ ] lifeLink/lifeLinkDuration/lifeLinkTransfer/linkDamageReduction - 生命链接分担伤害
- [ ] blessAtkBonus/blessDefBonus/blessDuration - 祝福之环
- [ ] lifeSeed/lifeSeedDelay/lifeSeedHeal - 生命之种延迟爆发
- [ ] revive/reviveHp/reviveCount/reviveBuff - 复活
- [ ] purifyAll/autoPurify - 全净化/自动净化
- [ ] protectionDuration - 神圣庇护持续
- [ ] teamHpRegen/cooldownReduction - 团队回血/冷却缩减
- [ ] reviveUnlocked - 解锁复活

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
- [ ] fireGround/fireGroundDuration/fireGroundDamage - 火海地面
- [ ] fireRain/fireRainDuration/fireRainDamage - 火雨
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
- [ ] 随机觉醒机制（3选1元素、引导石、概率表）
- [ ] 神赋系统（mythic稀有度，0.3%权重）
- [ ] 三步塔修炼游戏化
- [ ] 召唤兽培养深化
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
