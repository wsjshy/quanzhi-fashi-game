/**
 * 妖魔种族天赋数据
 * 每个妖魔种族都有独特的天赋能力
 * 完全贴合原著设定
 */

const DemonTraits = {
    // ==================== 奴仆级妖魔天赋 ====================
    
    // 巨眼猩鼠
    giant_eye_rat: {
        traits: [
            {
                id: "high_speed",
                name: "高速移动",
                description: "速度极快，闪避率+10%",
                type: "passive",
                effects: {
                    speedBonus: 0.3,      // 速度+30%
                    dodgeBonus: 0.10      // 闪避+10%
                }
            },
            {
                id: "crimson_beam",
                name: "猩红光束",
                description: "眼睛释放穿透腥红暗光束，无视30%防御",
                type: "passive",
                effects: {
                    armorPenetration: 0.3  // 无视30%防御
                }
            },
            {
                id: "burrow_assault",
                name: "掘地突袭",
                description: "每3回合潜入地下，下回合出现时必定暴击且伤害+50%",
                type: "mechanic",
                mechanic: "burrow",
                cooldown: 3,
                effects: {
                    critGuaranteed: true,
                    damageBonus: 0.5
                }
            }
        ]
    },
    
    // 独眼魔狼
    one_eye_wolf: {
        traits: [
            {
                id: "fierce",
                name: "凶猛",
                description: "攻击力+20%",
                type: "passive",
                effects: {
                    attackBonus: 0.2
                }
            },
            {
                id: "shadow_assault_trait",
                name: "暗影突袭",
                description: "第一次攻击必定暴击，伤害+50%",
                type: "first_strike",
                effects: {
                    firstCrit: true,
                    firstDamageBonus: 0.5
                }
            },
            {
                id: "wolf_pack",
                name: "群居",
                description: "附近有同类时，全属性+10%",
                type: "conditional",
                condition: "allies_nearby",
                effects: {
                    allStatsBonus: 0.1
                }
            }
        ]
    },
    
    // 石怪
    rock_monster: {
        traits: [
            {
                id: "rock_body",
                name: "岩石身躯",
                description: "物理伤害减免40%，魔法伤害减免20%",
                type: "passive",
                effects: {
                    physicalDamageReduction: 0.4,
                    magicDamageReduction: 0.2
                }
            },
            {
                id: "heavy",
                name: "沉重",
                description: "速度-30%，但不会被击退",
                type: "passive",
                effects: {
                    speedPenalty: 0.3,
                    knockbackImmune: true
                }
            },
            {
                id: "rock_throw_trait",
                name: "投石",
                description: "可以远程投掷巨石攻击",
                type: "ability",
                skill: "rock_throw"
            }
        ]
    },
    
    // 暗影怪
    shadow_creature: {
        traits: [
            {
                id: "shadow_stealth",
                name: "暗影潜行",
                description: "在阴影中难以被命中，闪避率+30%",
                type: "passive",
                effects: {
                    dodgeBonus: 0.3
                }
            },
            {
                id: "shadow_strike",
                name: "暗影突袭",
                description: "第一次攻击必定暴击",
                type: "first_strike",
                effects: {
                    firstCrit: true
                }
            },
            {
                id: "light_weakness",
                name: "怕光",
                description: "受到光系伤害+50%",
                type: "weakness",
                effects: {
                    lightDamageBonus: 0.5
                }
            }
        ]
    },
    
    // 噬骨虫
    bone_eating_worm: {
        traits: [
            {
                id: "swarm",
                name: "虫群",
                description: "数量多，每次攻击有2次伤害判定",
                type: "passive",
                effects: {
                    multiHit: 2
                }
            },
            {
                id: "corrosion",
                name: "腐蚀",
                description: "攻击有概率降低敌人防御",
                type: "on_hit",
                effects: {
                    defenseDownChance: 0.25,
                    defenseDownAmount: 0.15,
                    defenseDownDuration: 3
                }
            }
        ]
    },
    
    // 风翼鸟
    wind_bird: {
        traits: [
            {
                id: "flight",
                name: "飞行",
                description: "可以飞行，闪避率+25%",
                type: "passive",
                effects: {
                    dodgeBonus: 0.25,
                    speedBonus: 0.2
                }
            },
            {
                id: "wind_blade_trait",
                name: "风刃",
                description: "翅膀挥出风刃，远程攻击",
                type: "ability",
                skill: "wind_slash"
            }
        ]
    },
    
    // ==================== 战将级妖魔天赋 ====================
    
    // 三眼魔狼
    three_eye_wolf: {
        traits: [
            {
                id: "wide_vision",
                name: "270度视角",
                description: "三只眼睛几乎拥有270度视角，无法被偷袭，闪避+15%",
                type: "passive",
                effects: {
                    dodgeBonus: 0.15,
                    backstabImmune: true
                }
            },
            {
                id: "steel_body",
                name: "钢铁身躯",
                description: "钢铁般结实的身躯，物理伤害减免40%，但魔法伤害+20%（弱点）",
                type: "passive",
                effects: {
                    physicalDamageReduction: 0.4,
                    magicDamageTaken: 0.2
                }
            },
            {
                id: "bone_spike_volley",
                name: "骨刺齐射",
                description: "每2回合发射骨刺，造成物理伤害+流血效果",
                type: "mechanic",
                mechanic: "bone_spike",
                cooldown: 2,
                effects: {
                    bleedChance: 0.5,
                    bleedDamage: 8,
                    bleedDuration: 3
                }
            }
        ]
    },
    
    // 骨刺狰
    bone_spike_zheng: {
        traits: [
            {
                id: "bone_regeneration",
                name: "骨刺再生",
                description: "每回合恢复5%最大HP",
                type: "on_turn_end",
                effects: {
                    hpRegenPercent: 0.05
                }
            },
            {
                id: "bone_armor",
                name: "骨刺护甲",
                description: "受到物理攻击时反弹15%伤害，魔法攻击不反弹",
                type: "on_hit_taken",
                effects: {
                    damageReflect: 0.15,
                    reflectPhysicalOnly: true
                }
            },
            {
                id: "war_stomp",
                name: "战争践踏",
                description: "每3回合践踏地面，造成120%伤害+30%概率眩晕",
                type: "mechanic",
                mechanic: "stomp",
                cooldown: 3,
                effects: {
                    damageMultiplier: 1.2,
                    stunChance: 0.3,
                    stunDuration: 1
                }
            }
        ]
    },
    
    // 血纹巨魔鼠
    blood_pattern_rat: {
        traits: [
            {
                id: "blood_rage",
                name: "血怒",
                description: "HP越低，攻击力越高，每损失10%HP攻击+5%，最多+50%",
                type: "passive_scaling",
                effects: {
                    attackPerHpLost: 0.005  // 每损失1%HP，攻击+0.5%
                }
            },
            {
                id: "tear",
                name: "撕裂",
                description: "攻击有40%概率造成撕裂，持续掉血且治疗效果-50%",
                type: "on_hit",
                effects: {
                    tearChance: 0.4,
                    tearDamage: 10,
                    tearDuration: 3,
                    healReduction: 0.5
                }
            },
            {
                id: "speed_charge",
                name: "极速冲锋",
                description: "每3回合发动冲锋，造成150%伤害+击退",
                type: "mechanic",
                mechanic: "charge",
                cooldown: 3,
                effects: {
                    damageMultiplier: 1.5,
                    knockback: true
                }
            }
        ]
    },
    
    // ==================== 统领级妖魔天赋 ====================
    
    // 翼苍狼
    winged_gray_wolf: {
        traits: [
            {
                id: "sky_dance",
                name: "翱翔天际",
                description: "飞行状态下闪避+50%但攻击-20%，每2回合切换落地（攻击+30%，闪避-10%）",
                type: "mechanic",
                mechanic: "fly_switch",
                cooldown: 2,
                effects: {
                    flyingDodge: 0.5,
                    flyingAttackPenalty: 0.2,
                    groundAttackBonus: 0.3,
                    groundDodgePenalty: 0.1
                }
            },
            {
                id: "wolf_howl_command",
                name: "狼啸号令",
                description: "每3回合咆哮召唤2只独眼魔狼助战",
                type: "mechanic",
                mechanic: "summon_wolves",
                cooldown: 3,
                summon: "one_eye_wolf",
                summonCount: 2
            },
            {
                id: "wind_blade_storm",
                name: "风刃风暴",
                description: "每4回合释放全屏风刃，造成150%攻击力风系伤害+击退",
                type: "mechanic",
                mechanic: "aoe_wind",
                cooldown: 4,
                effects: {
                    damageMultiplier: 1.5,
                    knockback: true
                }
            },
            {
                id: "commander_aura",
                name: "统领威压",
                description: "战斗开始时降低玩家攻击力15%，持续3回合",
                type: "on_battle_start",
                effects: {
                    playerAttackDebuff: 0.15,
                    duration: 3
                }
            }
        ]
    },
    
    // 普通魔狼
    demon_wolf: {
        traits: [
            {
                id: "berserk",
                name: "狂暴",
                description: "HP低于50%时进入狂暴状态，攻击+30%，速度+20%",
                type: "trigger",
                trigger: "low_hp",
                threshold: 0.5,
                effects: {
                    attackBonus: 0.3,
                    speedBonus: 0.2
                }
            },
            {
                id: "triple_charge",
                name: "三段冲刺",
                description: "每3回合连续攻击3次，每次伤害递减",
                type: "mechanic",
                mechanic: "multi_strike",
                cooldown: 3,
                effects: {
                    strikeCount: 3,
                    damageDecay: 0.7
                }
            },
            {
                id: "sand_breath",
                name: "飞沙走石",
                description: "每2回合释放土系吐息，造成伤害+致盲（命中-20%）",
                type: "mechanic",
                mechanic: "sand_breath",
                cooldown: 2,
                effects: {
                    damageMultiplier: 0.8,
                    blindChance: 0.5,
                    blindDuration: 2
                }
            }
        ]
    },
    
    // 水蜘蛛
    water_spider: {
        traits: [
            {
                id: "water_affinity",
                name: "水属性",
                description: "掌握水系力量，水伤害+25%",
                type: "passive",
                effects: {
                    waterDamageBonus: 0.25
                }
            },
            {
                id: "web_silk",
                name: "吐丝",
                description: "可以吐丝，有几率减速敌人",
                type: "on_hit",
                effects: {
                    slowChance: 0.3,
                    slowAmount: 0.2,
                    slowDuration: 2
                }
            },
            {
                id: "water_breathing",
                name: "水下呼吸",
                description: "可以在水中自由行动",
                type: "passive",
                effects: {
                    waterDamageReduction: 0.3
                }
            }
        ]
    },
    
    // 火鼠
    fire_rat: {
        traits: [
            {
                id: "fire_affinity",
                name: "火属性",
                description: "掌握火系力量，火伤害+25%",
                type: "passive",
                effects: {
                    fireDamageBonus: 0.25
                }
            },
            {
                id: "high_temperature",
                name: "耐高温",
                description: "生活在高温环境，火抗性+50%",
                type: "passive",
                effects: {
                    fireDamageReduction: 0.5
                }
            },
            {
                id: "small_fast",
                name: "小巧灵活",
                description: "体型小，速度快，闪避+10%",
                type: "passive",
                effects: {
                    speedBonus: 0.2,
                    dodgeBonus: 0.1
                }
            },
            {
                id: "fire_burst",
                name: "火焰爆裂",
                description: "每3回合释放火焰爆裂，造成130%伤害+燃烧",
                type: "mechanic",
                mechanic: "fire_burst",
                cooldown: 3,
                effects: {
                    damageMultiplier: 1.3,
                    burnChance: 0.6,
                    burnDamage: 8,
                    burnDuration: 3
                }
            }
        ]
    },
    
    // 金蚁
    gold_ant: {
        traits: [
            {
                id: "metal_affinity",
                name: "金属性",
                description: "掌握金系力量，防御+20%",
                type: "passive",
                effects: {
                    defenseBonus: 0.2
                }
            },
            {
                id: "hard_shell",
                name: "坚硬外壳",
                description: "外壳坚硬，物理伤害减免+25%",
                type: "damage_reduction",
                effects: {
                    physicalReduction: 0.25
                }
            },
            {
                id: "swarm",
                name: "蚁群",
                description: "群居生物，数量多力量大",
                type: "passive",
                effects: {
                    attackBonus: 0.1
                }
            }
        ]
    },
    
    // 冰蟾
    ice_toad: {
        traits: [
            {
                id: "ice_affinity",
                name: "冰属性",
                description: "掌握冰系力量，冰伤害+25%",
                type: "passive",
                effects: {
                    iceDamageBonus: 0.25
                }
            },
            {
                id: "cold_touch",
                name: "寒冰之触",
                description: "攻击有几率冰冻敌人",
                type: "on_hit",
                effects: {
                    freezeChance: 0.15,
                    freezeDuration: 1
                }
            },
            {
                id: "thick_skin",
                name: "厚皮",
                description: "皮肤厚实，生命值+20%",
                type: "passive",
                effects: {
                    hpBonus: 0.2
                }
            }
        ]
    },
    
    // 雷兽
    thunder_beast: {
        traits: [
            {
                id: "thunder_affinity",
                name: "雷属性",
                description: "掌握雷系力量，雷伤害+30%",
                type: "passive",
                effects: {
                    thunderDamageBonus: 0.3
                }
            },
            {
                id: "static_shock",
                name: "静电",
                description: "受到攻击时有几率麻痹敌人",
                type: "on_hit_taken",
                effects: {
                    stunChance: 0.1,
                    stunDuration: 1
                }
            },
            {
                id: "fast_movement",
                name: "迅捷",
                description: "速度极快，速度+25%",
                type: "passive",
                effects: {
                    speedBonus: 0.25
                }
            }
        ]
    },
    
    // 光蛾
    light_moth: {
        traits: [
            {
                id: "light_affinity",
                name: "光属性",
                description: "掌握光系力量，光伤害+25%",
                type: "passive",
                effects: {
                    lightDamageBonus: 0.25
                }
            },
            {
                id: "scales",
                name: "光鳞",
                description: "鳞片反光，有几率致盲敌人",
                type: "on_hit",
                effects: {
                    blindChance: 0.2,
                    blindDuration: 1
                }
            },
            {
                id: "flying",
                name: "飞行",
                description: "可以飞行，闪避+15%",
                type: "passive",
                effects: {
                    dodgeBonus: 0.15,
                    speedBonus: 0.15
                }
            }
        ]
    },
    
    // 暗影蛇
    shadow_snake: {
        traits: [
            {
                id: "shadow_affinity",
                name: "暗影属性",
                description: "掌握暗影力量，暗影伤害+30%",
                type: "passive",
                effects: {
                    shadowDamageBonus: 0.3
                }
            },
            {
                id: "venom",
                name: "剧毒",
                description: "有毒，攻击有几率造成中毒",
                type: "on_hit",
                effects: {
                    poisonChance: 0.3,
                    poisonDamage: 5,
                    poisonDuration: 3
                }
            },
            {
                id: "stealth",
                name: "潜行",
                description: "擅长潜行，首次攻击必定暴击",
                type: "first_strike",
                effects: {
                    crit: true,
                    damageBonus: 0.3
                }
            }
        ]
    },
    
    // 巨眼鼹鼠
    giant_eye_mole_rat: {
        traits: [
            {
                id: "giant_eye",
                name: "巨眼",
                description: "眼睛巨大，视力极佳，命中+10%",
                type: "passive",
                effects: {
                    hitBonus: 0.1
                }
            },
            {
                id: "digging",
                name: "掘地",
                description: "擅长挖洞，防御+15%",
                type: "passive",
                effects: {
                    defenseBonus: 0.15
                }
            },
            {
                id: "sharp_claws",
                name: "锋利爪子",
                description: "爪子锋利，攻击有几率造成流血",
                type: "on_hit",
                effects: {
                    bleedChance: 0.25,
                    bleedDamage: 4,
                    bleedDuration: 2
                }
            }
        ]
    },
    
    // 进阶独眼魔狼
    one_eye_wolf_advanced: {
        traits: [
            {
                id: "fierce",
                name: "凶猛",
                description: "生性凶猛，攻击力+25%",
                type: "passive",
                effects: {
                    attackBonus: 0.25
                }
            },
            {
                id: "shadow_assault",
                name: "暗影突袭",
                description: "擅长暗影突袭，首次攻击必定暴击，伤害+50%",
                type: "first_strike",
                effects: {
                    crit: true,
                    damageBonus: 0.5
                }
            },
            {
                id: "pack_hunter",
                name: "群居",
                description: "群居生物，同类越多越强",
                type: "passive",
                effects: {
                    attackBonus: 0.1,
                    defenseBonus: 0.1
                }
            },
            {
                id: "thick_fur",
                name: "厚皮",
                description: "皮毛厚实，物理伤害减免+15%",
                type: "damage_reduction",
                effects: {
                    physicalReduction: 0.15
                }
            }
        ]
    },
    
    // 疾行怪
    running_demon: {
        traits: [
            {
                id: "extreme_speed",
                name: "极速",
                description: "速度极快，速度+50%，闪避+20%",
                type: "passive",
                effects: {
                    speedBonus: 0.5,
                    dodgeBonus: 0.2
                }
            },
            {
                id: "hit_and_run",
                name: "打了就跑",
                description: "擅长游击，攻击后速度提升",
                type: "passive",
                effects: {
                    attackBonus: 0.1
                }
            },
            {
                id: "fragile",
                name: "脆弱",
                description: "速度快但防御低，防御-10%",
                type: "passive",
                effects: {
                    defenseBonus: -0.1
                }
            }
        ]
    },
    
    // 魔藤
    demon_vine: {
        traits: [
            {
                id: "plant_body",
                name: "植物身躯",
                description: "植物身躯，物理伤害减免+20%，但火伤害+30%",
                type: "damage_reduction",
                effects: {
                    physicalReduction: 0.2,
                    fireWeakness: 0.3
                }
            },
            {
                id: "vine_bind",
                name: "藤蔓缠绕",
                description: "藤蔓可以缠绕敌人，有几率束缚",
                type: "on_hit",
                effects: {
                    bindChance: 0.25,
                    bindDuration: 2
                }
            },
            {
                id: "regen",
                name: "再生",
                description: "生命力顽强，每回合恢复5%HP",
                type: "on_turn_end",
                effects: {
                    hpRegenPercent: 0.05
                }
            }
        ]
    },
    
    // 邪眼沼妖
    evil_eye_swamp_demon: {
        traits: [
            {
                id: "evil_eye",
                name: "邪眼",
                description: "邪眼可以释放诅咒，降低敌人属性",
                type: "passive",
                effects: {
                    attackBonus: 0.2
                }
            },
            {
                id: "swamp_body",
                name: "沼妖身躯",
                description: "沼泽生物，水属性伤害+25%，水抗性+30%",
                type: "passive",
                effects: {
                    waterDamageBonus: 0.25,
                    waterDamageReduction: 0.3
                }
            },
            {
                id: "poison_breath",
                name: "毒气",
                description: "浑身散发毒气，攻击有几率造成中毒",
                type: "on_hit",
                effects: {
                    poisonChance: 0.35,
                    poisonDamage: 6,
                    poisonDuration: 3
                }
            },
            {
                id: "tough_skin",
                name: "厚皮",
                description: "皮肤厚实，生命值+30%",
                type: "passive",
                effects: {
                    hpBonus: 0.3
                }
            },
            {
                id: "evil_gaze",
                name: "邪眼凝视",
                description: "每3回合凝视玩家，造成伤害+40%概率混乱",
                type: "mechanic",
                mechanic: "gaze",
                cooldown: 3,
                effects: {
                    damageMultiplier: 0.7,
                    confuseChance: 0.4,
                    confuseDuration: 2
                }
            }
        ]
    },
    
    // 黑畜妖
    black_beast: {
        traits: [
            {
                id: "dark_body",
                name: "暗属性身躯",
                description: "暗属性生物，暗影伤害+30%，暗影抗性+40%",
                type: "passive",
                effects: {
                    shadowDamageBonus: 0.3,
                    shadowDamageReduction: 0.4
                }
            },
            {
                id: "beast_strength",
                name: "兽力",
                description: "力量强大，攻击力+25%",
                type: "passive",
                effects: {
                    attackBonus: 0.25
                }
            },
            {
                id: "ferocious",
                name: "凶残",
                description: "生性凶残，血量越低攻击越高",
                type: "passive_scaling",
                effects: {
                    attackPerHpLost: 0.5
                }
            },
            {
                id: "thick_hide",
                name: "厚皮",
                description: "皮毛厚实，物理伤害减免+20%",
                type: "damage_reduction",
                effects: {
                    physicalReduction: 0.2
                }
            },
            {
                id: "terror_screech",
                name: "恐惧尖啸",
                description: "每3回合发出尖啸，造成伤害+恐惧（攻击-20%）",
                type: "mechanic",
                mechanic: "screech",
                cooldown: 3,
                effects: {
                    damageMultiplier: 0.6,
                    fearChance: 0.7,
                    fearDuration: 2,
                    attackDebuff: 0.2
                }
            }
        ]
    },
    
    // 血纹巨魔鼠（战将级）
    blood_rune_giant_rat: {
        traits: [
            {
                id: "blood_rage",
                name: "血怒",
                description: "血量越低，攻击力越高",
                type: "passive_scaling",
                effects: {
                    attackPerHpLost: 0.8
                }
            },
            {
                id: "giant_body",
                name: "巨型体型",
                description: "体型巨大，生命值+50%，攻击力+20%",
                type: "passive",
                effects: {
                    hpBonus: 0.5,
                    attackBonus: 0.2
                }
            },
            {
                id: "sharp_teeth",
                name: "锋利牙齿",
                description: "牙齿锋利，攻击有几率造成流血",
                type: "on_hit",
                effects: {
                    bleedChance: 0.4,
                    bleedDamage: 8,
                    bleedDuration: 3
                }
            },
            {
                id: "tough_skin",
                name: "坚韧皮肤",
                description: "皮肤坚韧，物理伤害减免+25%",
                type: "damage_reduction",
                effects: {
                    physicalReduction: 0.25
                }
            }
        ]
    },
    
    // 三眼魔狼（战将级）- 兼容ID
    three_eye_demon_wolf: {
        traits: [
            {
                id: "third_eye",
                name: "第三只眼",
                description: "第三只眼可以洞察一切，免疫控制，命中+20%",
                type: "passive",
                effects: {
                    controlImmune: true,
                    hitBonus: 0.2
                }
            },
            {
                id: "demon_wolf_body",
                name: "魔狼之躯",
                description: "魔狼的身躯，全属性+30%",
                type: "passive",
                effects: {
                    allStatsBonus: 0.3
                }
            },
            {
                id: "wolf_howl",
                name: "狼嚎",
                description: "狼嚎可以召唤狼群，提升自身攻击力",
                type: "passive",
                effects: {
                    attackBonus: 0.2
                }
            }
        ]
    },
    
    // ==================== 天赋效果工具函数 ====================
    
    /**
     * 获取妖魔的天赋列表
     */
    getTraits(demonId) {
        const demonData = this[demonId];
        if (demonData && demonData.traits) {
            return demonData.traits;
        }
        return [];
    },
    
    /**
     * 计算被动天赋加成
     */
    calculatePassiveBonuses(traits) {
        const bonuses = {
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 0,
            hpBonus: 0,
            dodgeBonus: 0,
            critBonus: 0,
            physicalDamageReduction: 0,
            magicDamageReduction: 0,
            allStatsBonus: 0,
            controlImmune: false
        };
        
        for (const trait of traits) {
            if (trait.type === 'passive' && trait.effects) {
                for (const key in trait.effects) {
                    if (bonuses.hasOwnProperty(key)) {
                        if (typeof trait.effects[key] === 'number') {
                            bonuses[key] += trait.effects[key];
                        } else {
                            bonuses[key] = trait.effects[key];
                        }
                    }
                }
            }
        }
        
        // 全属性加成
        if (bonuses.allStatsBonus > 0) {
            bonuses.attackBonus += bonuses.allStatsBonus;
            bonuses.defenseBonus += bonuses.allStatsBonus;
            bonuses.speedBonus += bonuses.allStatsBonus;
            bonuses.hpBonus += bonuses.allStatsBonus;
        }
        
        return bonuses;
    },
    
    /**
     * 检查是否有特定天赋
     */
    hasTrait(traits, traitId) {
        return traits.some(t => t.id === traitId);
    },
    
    /**
     * 获取特定类型的天赋
     */
    getTraitsByType(traits, type) {
        return traits.filter(t => t.type === type);
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemonTraits;
}
