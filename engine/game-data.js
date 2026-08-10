/**
 * 游戏数据 - v0.2 MVP
 * 所有数据内嵌，无需服务器即可运行
 */

const GameData = {

    // ========== 技能库 ==========
    skills: {
        // 基础技能
        basic_attack: {
            id: 'basic_attack',
            name: '普通攻击',
            description: '基础的物理攻击',
            element: 'neutral',
            type: 'damage',
            mpCost: 0,
            baseDamage: 0,
            damageMultiplier: 1.0,
            hitRate: 0.95,
            critRate: 0.05,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶'
        },

        // 火系
        fire_bolt: {
            id: 'fire_bolt',
            name: '火滋·灼烧',
            description: '初阶火系魔法，发射一枚火球，有几率造成灼烧',
            element: 'fire',
            type: 'damage',
            mpCost: 8,
            baseDamage: 15,
            damageMultiplier: 1.2,
            hitRate: 0.9,
            critRate: 0.08,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '灼烧',
                    type: 'burn',
                    dotDamage: 5,
                    duration: 3,
                    chance: 0.4
                }
            ]
        },
        fire_rain: {
            id: 'fire_rain',
            name: '火滋·焚天',
            description: '初阶火系二级魔法，召唤火雨，伤害更高',
            element: 'fire',
            type: 'damage',
            mpCost: 15,
            baseDamage: 30,
            damageMultiplier: 1.3,
            hitRate: 0.85,
            critRate: 0.1,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '灼烧',
                    type: 'burn',
                    dotDamage: 8,
                    duration: 3,
                    chance: 0.6
                }
            ]
        },

        // 冰系
        ice_spike: {
            id: 'ice_spike',
            name: '冰蔓·冻结',
            description: '初阶冰系魔法，发射冰刺，有几率减速敌人',
            element: 'ice',
            type: 'damage',
            mpCost: 8,
            baseDamage: 12,
            damageMultiplier: 1.1,
            hitRate: 0.92,
            critRate: 0.05,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '减速',
                    type: 'slow',
                    duration: 2,
                    chance: 0.5,
                    statModifiers: { speed: -3 }
                }
            ]
        },
        ice_shield: {
            id: 'ice_shield',
            name: '冰蔓·冰铠',
            description: '初阶冰系防御魔法，用冰甲保护自己，提升防御',
            element: 'ice',
            type: 'buff',
            mpCost: 10,
            hitRate: 1.0,
            critRate: 0,
            targetType: 'self',
            cooldown: 3,
            tier: '初阶',
            statusEffects: [
                {
                    name: '冰甲',
                    type: 'defense_up',
                    duration: 3,
                    chance: 1.0,
                    statModifiers: { defense: 8 }
                }
            ]
        },

        // 雷系
        thunder_bolt: {
            id: 'thunder_bolt',
            name: '雷印·蟒痕',
            description: '初阶雷系魔法，释放雷电，高暴击，有几率麻痹',
            element: 'thunder',
            type: 'damage',
            mpCost: 10,
            baseDamage: 18,
            damageMultiplier: 1.15,
            hitRate: 0.88,
            critRate: 0.15,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '麻痹',
                    type: 'paralyze',
                    duration: 1,
                    chance: 0.25
                }
            ]
        },
        thunder_chain: {
            id: 'thunder_chain',
            name: '雷印·千钧',
            description: '初阶雷系二级魔法，连锁雷电，伤害更高',
            element: 'thunder',
            type: 'damage',
            mpCost: 18,
            baseDamage: 35,
            damageMultiplier: 1.2,
            hitRate: 0.85,
            critRate: 0.2,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '麻痹',
                    type: 'paralyze',
                    duration: 2,
                    chance: 0.35
                }
            ]
        },

        // 土系
        earth_shield: {
            id: 'earth_shield',
            name: '土系·岩盾',
            description: '初阶土系防御魔法，召唤岩石护盾，大幅提升防御',
            element: 'earth',
            type: 'buff',
            mpCost: 8,
            hitRate: 1.0,
            critRate: 0,
            targetType: 'self',
            cooldown: 2,
            tier: '初阶',
            statusEffects: [
                {
                    name: '岩盾',
                    type: 'defense_up',
                    duration: 3,
                    chance: 1.0,
                    statModifiers: { defense: 12 }
                }
            ]
        },
        earth_spike: {
            id: 'earth_spike',
            name: '土系·地刺',
            description: '初阶土系攻击魔法，从地下升起尖刺',
            element: 'earth',
            type: 'damage',
            mpCost: 9,
            baseDamage: 14,
            damageMultiplier: 1.1,
            hitRate: 0.9,
            critRate: 0.05,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶'
        },

        // 风系
        wind_blade: {
            id: 'wind_blade',
            name: '风轨·疾行',
            description: '初阶风系魔法，发射风刃，高命中',
            element: 'wind',
            type: 'damage',
            mpCost: 7,
            baseDamage: 10,
            damageMultiplier: 1.05,
            hitRate: 0.98,
            critRate: 0.08,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶'
        },
        wind_speed: {
            id: 'wind_speed',
            name: '风轨·飘影',
            description: '初阶风系辅助魔法，提升自身速度',
            element: 'wind',
            type: 'buff',
            mpCost: 8,
            hitRate: 1.0,
            critRate: 0,
            targetType: 'self',
            cooldown: 3,
            tier: '初阶',
            statusEffects: [
                {
                    name: '风之加速',
                    type: 'speed_up',
                    duration: 3,
                    chance: 1.0,
                    statModifiers: { speed: 8 }
                }
            ]
        },

        // 水系
        water_heal: {
            id: 'water_heal',
            name: '水系·治愈',
            description: '初阶水系魔法，恢复生命值',
            element: 'water',
            type: 'heal',
            mpCost: 10,
            baseHeal: 30,
            healMultiplier: 1.0,
            hitRate: 1.0,
            critRate: 0,
            targetType: 'self',
            cooldown: 0,
            tier: '初阶'
        },
        water_chain: {
            id: 'water_chain',
            name: '水系·水锁',
            description: '初阶水系控制魔法，用水链束缚敌人',
            element: 'water',
            type: 'damage',
            mpCost: 8,
            baseDamage: 8,
            damageMultiplier: 1.0,
            hitRate: 0.85,
            critRate: 0.03,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '束缚',
                    type: 'slow',
                    duration: 2,
                    chance: 0.6,
                    statModifiers: { speed: -5 }
                }
            ]
        },

        // 光系
        light_ray: {
            id: 'light_ray',
            name: '光系·圣光',
            description: '初阶光系魔法，释放圣光，对暗影系有额外伤害',
            element: 'light',
            type: 'damage',
            mpCost: 9,
            baseDamage: 14,
            damageMultiplier: 1.1,
            hitRate: 0.95,
            critRate: 0.08,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶'
        },

        // 暗影系
        dark_bolt: {
            id: 'dark_bolt',
            name: '暗影·腐蚀',
            description: '初阶暗影系魔法，暗影弹，有腐蚀效果',
            element: 'dark',
            type: 'damage',
            mpCost: 9,
            baseDamage: 16,
            damageMultiplier: 1.1,
            hitRate: 0.88,
            critRate: 0.1,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '腐蚀',
                    type: 'poison',
                    dotDamage: 6,
                    duration: 3,
                    chance: 0.5
                }
            ]
        },

        // 光系3级
        light_shield: {
            id: 'light_shield',
            name: '光系·圣盾',
            description: '初阶光系防御魔法，用圣光凝聚护盾，提升防御并恢复少量生命',
            element: 'light',
            type: 'buff',
            mpCost: 12,
            hitRate: 1.0,
            critRate: 0,
            targetType: 'self',
            cooldown: 3,
            tier: '初阶',
            statusEffects: [
                {
                    name: '圣盾',
                    type: 'defense_up',
                    duration: 3,
                    chance: 1.0,
                    statModifiers: { defense: 10 }
                }
            ]
        },

        // 暗影系3级
        dark_cloak: {
            id: 'dark_cloak',
            name: '暗影·潜行',
            description: '初阶暗影系辅助魔法，用暗影包裹自身，提升闪避和暴击',
            element: 'dark',
            type: 'buff',
            mpCost: 10,
            hitRate: 1.0,
            critRate: 0,
            targetType: 'self',
            cooldown: 3,
            tier: '初阶',
            statusEffects: [
                {
                    name: '暗影潜行',
                    type: 'crit_up',
                    duration: 3,
                    chance: 1.0,
                    statModifiers: { critRate: 0.15 }
                }
            ]
        },

        // ===== 5级技能（初阶二级魔法）=====

        fire_burst: {
            id: 'fire_burst',
            name: '火滋·爆裂',
            description: '初阶火系三级魔法，火球爆炸造成大范围伤害，高灼烧概率',
            element: 'fire',
            type: 'damage',
            mpCost: 22,
            baseDamage: 45,
            damageMultiplier: 1.4,
            hitRate: 0.85,
            critRate: 0.12,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '灼烧',
                    type: 'burn',
                    dotDamage: 10,
                    duration: 4,
                    chance: 0.7
                }
            ]
        },

        ice_storm: {
            id: 'ice_storm',
            name: '冰蔓·冰封',
            description: '初阶冰系三级魔法，召唤冰风暴，高伤害并有几率冻结',
            element: 'ice',
            type: 'damage',
            mpCost: 20,
            baseDamage: 38,
            damageMultiplier: 1.3,
            hitRate: 0.88,
            critRate: 0.08,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '冻结',
                    type: 'paralyze',
                    duration: 1,
                    chance: 0.4
                }
            ]
        },

        thunder_strike: {
            id: 'thunder_strike',
            name: '雷印·怒击',
            description: '初阶雷系三级魔法，强力雷击，极高暴击率',
            element: 'thunder',
            type: 'damage',
            mpCost: 25,
            baseDamage: 50,
            damageMultiplier: 1.35,
            hitRate: 0.85,
            critRate: 0.25,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '麻痹',
                    type: 'paralyze',
                    duration: 2,
                    chance: 0.4
                }
            ]
        },

        earth_quake: {
            id: 'earth_quake',
            name: '土系·震裂',
            description: '初阶土系三级魔法，引发地震，造成伤害并降低敌人速度',
            element: 'earth',
            type: 'damage',
            mpCost: 18,
            baseDamage: 35,
            damageMultiplier: 1.25,
            hitRate: 0.9,
            critRate: 0.06,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '震荡',
                    type: 'slow',
                    duration: 2,
                    chance: 0.5,
                    statModifiers: { speed: -4 }
                }
            ]
        },

        wind_tornado: {
            id: 'wind_tornado',
            name: '风轨·龙卷',
            description: '初阶风系三级魔法，召唤龙卷风，高命中多段伤害',
            element: 'wind',
            type: 'damage',
            mpCost: 20,
            baseDamage: 40,
            damageMultiplier: 1.25,
            hitRate: 0.95,
            critRate: 0.1,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶'
        },

        water_wave: {
            id: 'water_wave',
            name: '水系·巨浪',
            description: '初阶水系三级魔法，巨浪冲击造成伤害并恢复自身生命',
            element: 'water',
            type: 'damage',
            mpCost: 18,
            baseDamage: 30,
            damageMultiplier: 1.2,
            hitRate: 0.9,
            critRate: 0.05,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '水之祝福',
                    type: 'regen',
                    dotDamage: -15,
                    duration: 3,
                    chance: 1.0
                }
            ]
        },

        light_judgment: {
            id: 'light_judgment',
            name: '光系·裁决',
            description: '初阶光系三级魔法，圣光裁决，对暗影和妖魔系有巨额伤害',
            element: 'light',
            type: 'damage',
            mpCost: 22,
            baseDamage: 42,
            damageMultiplier: 1.35,
            hitRate: 0.92,
            critRate: 0.1,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶'
        },

        dark_curse: {
            id: 'dark_curse',
            name: '暗影·诅咒',
            description: '初阶暗影系三级魔法，暗影诅咒，持续削弱敌人',
            element: 'dark',
            type: 'damage',
            mpCost: 20,
            baseDamage: 35,
            damageMultiplier: 1.2,
            hitRate: 0.88,
            critRate: 0.12,
            targetType: 'enemy',
            cooldown: 0,
            tier: '初阶',
            statusEffects: [
                {
                    name: '诅咒',
                    type: 'poison',
                    dotDamage: 12,
                    duration: 4,
                    chance: 0.8
                },
                {
                    name: '虚弱',
                    type: 'attack_down',
                    duration: 3,
                    chance: 0.6,
                    statModifiers: { attack: -5 }
                }
            ]
        }
    },

    // ========== NPC 角色 ==========
    characters: {
        mo_fan: {
            id: 'mo_fan',
            name: '莫凡',
            title: '天生双系',
            description: '从另一个世界穿越而来的少年，拥有天生双系的天赋。雷系与火系兼修，性格桀骜不驯。',
            elements: ['thunder', 'fire'],
            level: 3,
            maxHp: 150,
            maxMp: 80,
            attack: 18,
            defense: 6,
            speed: 14,
            skills: ['basic_attack', 'thunder_bolt', 'fire_bolt'],
            spriteColor: '#6633cc',
            image: 'assets/images/characters/mo_fan.jpg',
            location: 'tianlan_school',
            // 可用时间：白天在学校，晚上要修炼或回家
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '嘿，新来的？我叫莫凡，有什么事吗？'
                },
                {
                    trigger: 'after_quest_1',
                    text: '不错嘛，居然能完成那个任务，有点实力！'
                }
            ],
            givesQuests: ['quest_hunt_demon', 'quest_hunt_shadow', 'quest_hunt_stone'],
            
            // 性格设定
            personality: {
                brave: 0.9,
                kind: 0.6,
                honest: 0.5,
                impulsive: 0.85,
                loyal: 0.95,
                arrogant: 0.4,
                greedy: 0.2,
                curious: 0.7
            },
            
            // 礼物偏好
            giftPreferences: {
                loved: ['demon_core', 'magic_stone', 'super_mana_potion'],  // 喜欢：修炼资源
                liked: ['health_potion', 'mana_potion', 'magic_herb'],       // 一般喜欢
                disliked: [],                                                  // 不喜欢
                baseOpinionGain: 5,                                            // 基础好感度增加
                lovedMultiplier: 3,                                            // 喜欢的物品倍率
                likedMultiplier: 1.5,                                          // 一般喜欢倍率
                dislikedMultiplier: 0.5,                                       // 不喜欢倍率
                dailyGiftLimit: 3                                              // 每天送礼次数上限
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: true,      // 莫凡可以和玩家发展恋爱关系？（设定上可以，但需要满足特殊条件）
                canBeMentor: true,     // 莫凡可以当玩家的导师（教雷系/火系技巧）
                canBeRival: true       // 莫凡可以成为玩家的竞争对手
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                mu_ningxue: {
                    opinion: -10,    // 初始关系不太好，有点不对付
                    trust: 0,
                    type: 'complicated',
                    label: '青梅竹马'  // 表面不对付，实际有复杂的关系
                },
                tang_yue: {
                    opinion: 30,     // 对老师有好感
                    trust: 40,
                    type: 'mentor',
                    label: '实习老师'
                },
                wang_laoban: {
                    opinion: 10,
                    trust: 5,
                    type: 'acquaintance',
                    label: '小卖部老板'
                },
                zhang_xiaohou: {
                    opinion: 90,
                    trust: 95,
                    type: 'best_friend',
                    label: '死党'
                },
                zhao_manyan: {
                    opinion: 65,
                    trust: 55,
                    type: 'friend',
                    label: '好兄弟'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'mo_fan',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '嘿，新来的？有什么事吗？',
                            '怎么，找我有事？',
                            '...嗯？'
                        ],
                        mood: 'casual',
                        choices: [
                            {
                                id: 'ask_about_school',
                                text: '问问学校的情况',
                                condition: {
                                    notNpcFlags: ['asked_about_school']
                                },
                                effects: {
                                    opinion: +2,
                                    npcFlags: { asked_about_school: true }
                                },
                                nextNode: 'about_school'
                            },
                            {
                                id: 'ask_about_training',
                                text: '请教修炼技巧',
                                condition: {
                                    minOpinion: 10
                                },
                                effects: {
                                    opinion: +3,
                                    exp: 10
                                },
                                nextNode: 'training_tips'
                            },
                            {
                                id: 'challenge',
                                text: '要不要切磋一下？',
                                condition: {
                                    minOpinion: 30,
                                    minLevel: 3
                                },
                                effects: {
                                    opinion: +5
                                },
                                nextNode: 'challenge_response',
                                action: 'start_battle',
                                actionData: { enemyId: 'mo_fan_spar' }
                            },
                            {
                                id: 'hunt_quest',
                                text: '听说你有猎魔任务？',
                                condition: {
                                    minOpinion: 20,
                                    notFlags: ['quest_hunt_demon_accepted']
                                },
                                effects: {
                                    opinion: +2,
                                    startQuest: 'quest_hunt_demon',
                                    flags: { quest_hunt_demon_accepted: true }
                                },
                                nextNode: 'hunt_quest_dialogue'
                            },
                            {
                                id: 'chat',
                                text: '随便聊聊',
                                condition: {
                                    minOpinion: 15
                                },
                                effects: {
                                    opinion: +1
                                },
                                nextNode: 'casual_chat'
                            },
                            {
                                id: 'training_insights',
                                text: '聊聊修炼心得',
                                condition: {
                                    minOpinion: 40
                                },
                                effects: {
                                    familiarity: +2
                                },
                                nextNode: 'training_insights'
                            },
                            {
                                id: 'about_mu_ningxue_truth',
                                text: '聊聊穆宁雪的事',
                                condition: {
                                    minOpinion: 50,
                                    npcFlags: ['knows_mu_ningxue']
                                },
                                effects: {
                                    familiarity: +3
                                },
                                nextNode: 'about_mu_ningxue_truth'
                            },
                            {
                                id: 'become_brothers',
                                text: '（感觉关系不错了，要不要结拜？）',
                                condition: {
                                    minOpinion: 80,
                                    notNpcFlags: ['become_brothers']
                                },
                                effects: {},
                                nextNode: 'become_brothers'
                            },
                            {
                                id: 'leave',
                                text: '没什么事，先走了',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    about_school: {
                        id: 'about_school',
                        texts: [
                            '天澜魔法高中嘛，就那样。老师教的都是基础，真正的本事还得自己练。',
                            '学校里最厉害的是穆宁雪，冰系天才，不过性格冷得像冰一样。',
                            '想变强的话，光靠上课可不够，得多去实战。'
                        ],
                        mood: 'casual',
                        choices: [
                            {
                                id: 'ask_mu_ningxue',
                                text: '穆宁雪是谁？',
                                condition: {
                                    notNpcFlags: ['knows_mu_ningxue']
                                },
                                effects: {
                                    opinion: -1,
                                    npcFlags: { knows_mu_ningxue: true },
                                    giveInfo: 'mu_ningxue_intro'
                                },
                                nextNode: 'about_mu_ningxue'
                            },
                            {
                                id: 'ask_teachers',
                                text: '老师们怎么样？',
                                effects: {
                                    opinion: +1
                                },
                                nextNode: 'about_teachers'
                            },
                            {
                                id: 'back',
                                text: '原来是这样',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    about_mu_ningxue: {
                        id: 'about_mu_ningxue',
                        texts: [
                            '穆宁雪啊，穆家的大小姐，冰系天赋极高，年纪轻轻就已经是中阶法师了。',
                            '...哼，反正就是个厉害的家伙，你自己去见识下就知道了。',
                            '别问我她的事，我跟她不熟。'
                        ],
                        mood: 'annoyed',
                        choices: [
                            {
                                id: 'back',
                                text: '好吧...',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    about_teachers: {
                        id: 'about_teachers',
                        texts: [
                            '唐月老师人不错，温柔又有耐心，火系魔法也很强。',
                            '其他老师嘛，就那样吧，教的都是基础。',
                            '想真的变强，还是得靠自己修炼和实战。'
                        ],
                        mood: 'casual',
                        choices: [
                            {
                                id: 'back',
                                text: '明白了',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    training_tips: {
                        id: 'training_tips',
                        texts: [
                            '修炼啊...我觉得最重要的是实战，光练不打没用。',
                            '别害怕受伤，每次受伤都是进步的机会。',
                            '还有，星子的引导很重要，要多练，形成肌肉记忆。'
                        ],
                        mood: 'serious',
                        choices: [
                            {
                                id: 'thank',
                                text: '多谢指教！',
                                effects: {
                                    opinion: +2
                                },
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    challenge_response: {
                        id: 'challenge_response',
                        texts: [
                            '哦？想跟我打？有意思，来吧！',
                            '好啊，让我看看你有多少本事！',
                            '行，点到为止啊。'
                        ],
                        mood: 'excited',
                        choices: [
                            {
                                id: 'fight',
                                text: '开始吧！',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    hunt_quest_dialogue: {
                        id: 'hunt_quest_dialogue',
                        texts: [
                            '雪峰山最近有只幽狼兽在作乱，伤了好几个猎人。',
                            '我本来想去解决它的，不过...算了，你要是有兴趣，就去试试吧。',
                            '小心点，那家伙速度很快，别大意了。'
                        ],
                        mood: 'serious',
                        choices: [
                            {
                                id: 'accept',
                                text: '好，我去看看！',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '最近修炼怎么样？有没有遇到什么瓶颈？',
                            '说起来，最近雪峰山好像不太平，你去的时候小心点。',
                            '...没什么，就是觉得最近有点太安静了，有点不对劲。'
                        ],
                        mood: 'casual',
                        choices: [
                            {
                                id: 'ask_demon',
                                text: '哪里不对劲？',
                                condition: {
                                    minOpinion: 30,
                                    minDay: 25
                                },
                                effects: {
                                    opinion: +2,
                                    giveInfo: 'demon_intel_1'
                                },
                                nextNode: 'demon_rumor'
                            },
                            {
                                id: 'back',
                                text: '是这样啊',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    demon_rumor: {
                        id: 'demon_rumor',
                        texts: [
                            '我也说不清楚...就是感觉最近山里的妖魔有点太活跃了。',
                            '以前幽狼兽一般不会靠近山脚，最近已经有好几起袭击事件了。',
                            '希望是我想多了吧...总之你自己小心点。'
                        ],
                        mood: 'worried',
                        choices: [
                            {
                                id: 'back',
                                text: '好，我会注意的',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    // 修炼心得（好感 40+）
                    training_insights: {
                        id: 'training_insights',
                        texts: [
                            '修炼这东西，说白了就是熟能生巧。星子引导得多了，自然就快了。',
                            '我跟你说个诀窍，修炼的时候别光想着快，要感受每一颗星子的流动。',
                            '真正的瓶颈从来都不是魔法，而是你的精神力。精神力够强，什么系都能玩得转。'
                        ],
                        mood: 'serious',
                        effects: {
                            exp: 20,
                            opinion: +2
                        },
                        choices: [
                            {
                                id: 'ask_more',
                                text: '还有吗？再说说',
                                condition: {
                                    minOpinion: 60
                                },
                                effects: {
                                    exp: 30,
                                    opinion: +1
                                },
                                nextNode: 'deep_training'
                            },
                            {
                                id: 'back',
                                text: '受教了',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    // 深度修炼指导（好感 60+）
                    deep_training: {
                        id: 'deep_training',
                        texts: [
                            '...好吧，看你这么有诚意，我就告诉你一个秘密。',
                            '其实...我修炼的速度比别人快，是有原因的。',
                            '算了，现在说这些还太早。等你什么时候到了中阶，我再跟你细说。'
                        ],
                        mood: 'mysterious',
                        effects: {
                            npcFlags: { hinted_about_double_element: true }
                        },
                        choices: [
                            {
                                id: 'back',
                                text: '...好吧',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    // 聊穆宁雪的真心话（好感 50+）
                    about_mu_ningxue_truth: {
                        id: 'about_mu_ningxue_truth',
                        texts: [
                            '穆宁雪啊...其实她也没那么冷，只是不擅长表达而已。',
                            '我跟她...从小就认识了。那时候她还不是什么冰系天才，就是个普通的小丫头。',
                            '算了，说这些干嘛。她的事，你自己去了解吧。'
                        ],
                        mood: 'nostalgic',
                        effects: {
                            opinion: +3,
                            giveInfo: 'mu_ningxue_past'
                        },
                        choices: [
                            {
                                id: 'ask_more',
                                text: '你们小时候发生过什么？',
                                condition: {
                                    minOpinion: 70
                                },
                                effects: {
                                    opinion: -2
                                },
                                nextNode: 'mu_ningxue_childhood'
                            },
                            {
                                id: 'back',
                                text: '原来如此',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    // 穆宁雪的童年（好感 70+，问了会减好感）
                    mu_ningxue_childhood: {
                        id: 'mu_ningxue_childhood',
                        texts: [
                            '...你问这个干嘛？',
                            '都是过去的事了，没什么好说的。',
                            '总之，别在她面前提那些事。记住了。'
                        ],
                        mood: 'annoyed',
                        choices: [
                            {
                                id: 'back',
                                text: '抱歉，我不该问的',
                                effects: {
                                    opinion: +1
                                },
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    // 结拜兄弟（好感 80+）
                    become_brothers: {
                        id: 'become_brothers',
                        texts: [
                            '哈哈，你这家伙，还挺对我胃口的！',
                            '怎么样，要不要跟我结拜兄弟？以后有我莫凡一口饭吃，就有你一口！',
                            '当然，修炼上的事，我也不会藏私的。'
                        ],
                        mood: 'excited',
                        choices: [
                            {
                                id: 'accept',
                                text: '好！以后我们就是兄弟了！',
                                condition: {
                                    notNpcFlags: ['become_brothers']
                                },
                                effects: {
                                    opinion: +10,
                                    trust: +15,
                                    npcFlags: { become_brothers: true },
                                    giveItem: 'basic_staff'
                                },
                                nextNode: 'brothers_accepted'
                            },
                            {
                                id: 'decline',
                                text: '这...太突然了',
                                effects: {
                                    opinion: -2
                                },
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    // 结拜成功
                    brothers_accepted: {
                        id: 'brothers_accepted',
                        texts: [
                            '好兄弟！',
                            '这根法杖我留着也没用，给你了！',
                            '以后有事尽管找我，谁敢欺负你，我帮你揍他！'
                        ],
                        mood: 'happy',
                        choices: [
                            {
                                id: 'back',
                                text: '谢谢兄弟！',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    }
                }
            }
        },

        mo_jiaxing: {
            id: 'mo_jiaxing',
            name: '莫家兴',
            title: '莫凡的父亲',
            description: '莫凡的父亲，脸色蜡黄的中年男子，原本给穆家老爷开车，后来调到后勤做采购。憨厚老实，为了儿子可以低声下气求人，把房子都卖了供莫凡上魔法高中。',
            elements: [],
            level: 0,
            maxHp: 60,
            maxMp: 0,
            attack: 3,
            defense: 2,
            speed: 5,
            skills: ['basic_attack'],
            spriteColor: '#ccaa77',
            location: 'mo_fan_home',
            availableTimes: ['morning', 'afternoon', 'evening', 'night'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '你是莫凡的同学吧？快进来坐，家里简陋，别嫌弃。'
                },
                {
                    trigger: 'after_quest_1',
                    text: '莫凡这孩子，从小就不服输，你多帮帮他。'
                }
            ],
            givesQuests: [],
            
            personality: {
                brave: 0.4,
                kind: 0.9,
                honest: 0.85,
                impulsive: 0.1,
                loyal: 0.9,
                arrogant: 0.05,
                greedy: 0.1,
                curious: 0.3
            },
            
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: false,
                canBeRival: false
            },
            
            relationships: {
                mo_fan: {
                    opinion: 100,
                    trust: 100,
                    type: 'father_son',
                    label: '父子'
                },
                mu_he: {
                    opinion: -20,
                    trust: 0,
                    type: 'employer_employee',
                    label: '穆家管家'
                }
            },

            giftPreferences: {
                loved: ['health_potion', 'super_health_potion'],
                liked: ['food', 'magic_herb'],
                disliked: [],
                baseOpinionGain: 8,
                lovedMultiplier: 2,
                likedMultiplier: 1.5,
                dislikedMultiplier: 0.5,
                dailyGiftLimit: 5
            }
        },

        mu_bai: {
            id: 'mu_bai',
            name: '穆白',
            title: '穆家旁系子弟',
            description: '穆氏世家旁系子弟，高一8班1号学生。发型身高长相都堪称男神，表面谦逊有礼，内心却极其高傲阴暗，是个典型的绿茶男。寒冰系天赋出众，觉醒时冻结了觉醒石。看不起莫凡，认为他只是杂役的儿子。',
            elements: ['ice'],
            level: 3,
            maxHp: 90,
            maxMp: 70,
            attack: 14,
            defense: 8,
            speed: 10,
            skills: ['basic_attack', 'ice_spike', 'ice_shield'],
            spriteColor: '#aaddff',
            location: 'tianlan_school',
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '（脸上带着谦逊的微笑）你好，我是穆白。有什么事吗？'
                },
                {
                    trigger: 'low_opinion',
                    text: '（眼神中闪过一丝不屑）哦，是你啊。有事？'
                }
            ],
            givesQuests: [],
            
            personality: {
                brave: 0.5,
                kind: 0.2,
                honest: 0.15,
                impulsive: 0.2,
                loyal: 0.3,
                arrogant: 0.9,
                greedy: 0.6,
                curious: 0.4
            },
            
            relationshipCap: {
                maxOpinion: 60,
                maxTrust: 40,
                canRomance: false,
                canBeMentor: false,
                canBeRival: true
            },
            
            relationships: {
                mo_fan: {
                    opinion: -40,
                    trust: -20,
                    type: 'rival',
                    label: '竞争对手'
                },
                zhao_kunsan: {
                    opinion: 30,
                    trust: 20,
                    type: 'follower',
                    label: '跟班'
                },
                mu_ningxue: {
                    opinion: 60,
                    trust: 10,
                    type: 'crush',
                    label: '仰慕'
                }
            },

            giftPreferences: {
                loved: ['ice_crystal', 'magic_stone'],
                liked: ['super_mana_potion', 'equipment'],
                disliked: ['common_item', 'food'],
                baseOpinionGain: 3,
                lovedMultiplier: 2.5,
                likedMultiplier: 1.5,
                dislikedMultiplier: 0.3,
                dailyGiftLimit: 2
            }
        },

        zhao_kunsan: {
            id: 'zhao_kunsan',
            name: '赵坤三',
            title: '穆白的跟班',
            description: '满脸麻子的少年，穆白的忠实跟班，高一8班学生。风系法师，性格狗腿，爱仗势欺人，经常替穆白出面挑衅莫凡。',
            elements: ['wind'],
            level: 2,
            maxHp: 70,
            maxMp: 45,
            attack: 9,
            defense: 4,
            speed: 14,
            skills: ['basic_attack', 'wind_blade'],
            spriteColor: '#bbffbb',
            location: 'tianlan_school',
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '（上下打量你）你谁啊？有事找穆白哥先跟我说。'
                },
                {
                    trigger: 'low_opinion',
                    text: '哼，就你也配跟穆白哥说话？'
                }
            ],
            givesQuests: [],
            
            personality: {
                brave: 0.3,
                kind: 0.2,
                honest: 0.3,
                impulsive: 0.7,
                loyal: 0.6,
                arrogant: 0.5,
                greedy: 0.5,
                curious: 0.4
            },
            
            relationshipCap: {
                maxOpinion: 50,
                maxTrust: 30,
                canRomance: false,
                canBeMentor: false,
                canBeRival: true
            },
            
            relationships: {
                mu_bai: {
                    opinion: 80,
                    trust: 60,
                    type: 'follower',
                    label: '老大'
                },
                mo_fan: {
                    opinion: -30,
                    trust: -10,
                    type: 'hostile',
                    label: '欺负对象'
                }
            }
        },

        zhang_xiaohou: {
            id: 'zhang_xiaohou',
            name: '张小侯',
            title: '莫凡的死党',
            description: '跟泥猴子一样的少年，莫凡的邻居和发小，高一8班学生。风系法师，速度很快。性格活泼热心，消息灵通，极其崇拜莫凡，叫他"莫凡哥"，关键时刻很护短。',
            elements: ['wind'],
            level: 2,
            maxHp: 80,
            maxMp: 50,
            attack: 10,
            defense: 4,
            speed: 16,
            skills: ['basic_attack', 'wind_blade'],
            spriteColor: '#99ff99',
            location: 'tianlan_school',
            // 可用时间：学生，白天在学校
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '嘿！我叫张小侯，是莫凡哥的死党！有什么事尽管找我！'
                },
                {
                    trigger: 'after_quest_1',
                    text: '莫凡哥就是厉害，我就知道他一定能行！'
                }
            ],
            givesQuests: [],
            
            // 性格设定
            personality: {
                brave: 0.4,
                kind: 0.85,
                honest: 0.9,
                impulsive: 0.4,
                loyal: 0.95,
                arrogant: 0.1,
                greedy: 0.3,
                curious: 0.7
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: false,
                canBeRival: false
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                mo_fan: {
                    opinion: 90,
                    trust: 95,
                    type: 'best_friend',
                    label: '死党'
                },
                tang_yue: {
                    opinion: 40,
                    trust: 50,
                    type: 'acquaintance',
                    label: '实习老师'
                },
                mu_ningxue: {
                    opinion: 10,
                    trust: 0,
                    type: 'acquaintance',
                    label: '同学'
                },
                zhao_manyan: {
                    opinion: 55,
                    trust: 45,
                    type: 'friend',
                    label: '朋友'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'zhang_xiaohou',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '你好啊！我叫张小侯，是莫凡的好朋友。',
                            '嘿，又见面了！找我有什么事吗？',
                            '今天天气不错啊，你修炼得怎么样了？'
                        ],
                        choices: [
                            { text: '莫凡最近怎么样？', next: 'about_mo_fan' },
                            { text: '修炼上有什么心得吗？', next: 'training_tips' },
                            { text: '学校最近有什么新鲜事吗？', next: 'school_news' },
                            { text: '随便聊聊', next: 'casual_chat' },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    about_mo_fan: {
                        id: 'about_mo_fan',
                        texts: [
                            '莫凡啊，他可厉害了！虽然平时看起来吊儿郎当的，但关键时刻特别靠谱。',
                            '我跟莫凡是从小一起长大的，他这个人啊，就是嘴硬心软。',
                            '莫凡最近好像在偷偷修炼什么，神神秘秘的...'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '他实力很强吗？', next: 'mo_fan_power' },
                            { text: '你们是怎么认识的？', next: 'mo_fan_history' },
                            { text: '我知道了', next: 'default' }
                        ]
                    },
                    
                    mo_fan_power: {
                        id: 'mo_fan_power',
                        texts: [
                            '那当然！莫凡可是我们班最强的之一，雷系魔法用得特别溜。',
                            '虽然他才刚觉醒没多久，但进步速度快得吓人！',
                            '我跟你说，莫凡这家伙绝对不简单，以后肯定是个大人物！'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3
                        },
                        choices: [
                            { text: '这么厉害？', next: 'default' }
                        ]
                    },
                    
                    mo_fan_history: {
                        id: 'mo_fan_history',
                        texts: [
                            '我们从小就是邻居，一起长大的。小时候他经常保护我，虽然他自己也总闯祸。',
                            '说起来，莫凡以前好像不是这样的... 好像从某个时候开始，他就变得特别不一样了。',
                            '不过不管怎么样，他永远是我最好的兄弟！'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '真是令人羡慕的友谊', next: 'default' }
                        ]
                    },
                    
                    training_tips: {
                        id: 'training_tips',
                        texts: [
                            '修炼心得吗？我也不太懂啦... 我就是觉得风系魔法特别适合我，跑得快！',
                            '其实我觉得修炼最重要的是坚持，每天都练一点，慢慢就会变强的。',
                            '要不你去问莫凡吧，他比我厉害多了，肯定能给你更好的建议。'
                        ],
                        effects: {
                            exp: 10,
                            familiarity: 2
                        },
                        choices: [
                            { text: '谢谢你的建议', next: 'default' }
                        ]
                    },
                    
                    school_news: {
                        id: 'school_news',
                        texts: [
                            '学校最近啊... 好像没什么特别的事。哦对了，听说过几天有个小测验！',
                            '我听说穆宁雪最近又突破了，不愧是冰系天才，真厉害。',
                            '对了，最近山里好像不太太平，你去雪峰山的时候要小心啊！'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '山里不太平？什么意思？', next: 'mountain_news', conditions: { minDay: 10 } },
                            { text: '穆宁雪是谁？', next: 'about_mu_ningxue' },
                            { text: '知道了，谢谢提醒', next: 'default' }
                        ]
                    },
                    
                    mountain_news: {
                        id: 'mountain_news',
                        texts: [
                            '我也是听别人说的，好像最近山里的妖魔变多了，好多猎人都不敢去了。',
                            '具体我也不太清楚，你可以去问问王老板，他消息灵通得很。',
                            '总之你小心点，别往山里跑太深了，安全第一啊！'
                        ],
                        effects: {
                            giveInfo: 'demon_rumor_1',
                            familiarity: 3
                        },
                        choices: [
                            { text: '谢谢你告诉我', next: 'default' }
                        ]
                    },
                    
                    about_mu_ningxue: {
                        id: 'about_mu_ningxue',
                        texts: [
                            '穆宁雪你都不知道？她可是我们学校的风云人物啊！穆氏家族的千金，冰系天才。',
                            '长得又漂亮，实力又强，好多男生都暗恋她呢。不过她性格太高冷了，一般人都接近不了。',
                            '说起来，莫凡好像跟她有点不对付，两个人一见面就吵架。'
                        ],
                        effects: {
                            giveInfo: 'mu_ningxue_intro',
                            familiarity: 2
                        },
                        choices: [
                            { text: '原来如此', next: 'default' }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '随便聊啊... 那我跟你说，最近我发现了一个特别适合修炼的地方！',
                            '你知道吗，我小时候特别胆小，经常被人欺负，都是莫凡帮我出头。',
                            '其实我特别羡慕莫凡，他那么勇敢，那么厉害... 而我就只会跑。',
                            '不过没关系！跑得快也是一种优势嘛，打不过就跑，这是我的人生信条！'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '跑得快也很厉害啊', next: 'encourage' },
                            { text: '哈哈，你真有趣', next: 'default' }
                        ]
                    },
                    
                    encourage: {
                        id: 'encourage',
                        texts: [
                            '真的吗？你真的觉得跑得快也很厉害？',
                            '谢谢你这么说... 我有时候会觉得自己很没用，但听你这么说，我好像有点信心了。',
                            '好！我也要继续努力，争取以后能帮上莫凡的忙！'
                        ],
                        effects: {
                            opinion: 5,
                            trust: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '加油，我相信你', next: 'default' }
                        ]
                    }
                }
            }
        },

        zhao_manyan: {
            id: 'zhao_manyan',
            name: '赵满延',
            title: '光系富二代',
            description: '赵氏家族的少爷，光系法师，家境富裕，性格开朗，有点小贪财，但很讲义气。',
            elements: ['light'],
            level: 3,
            maxHp: 120,
            maxMp: 70,
            attack: 12,
            defense: 10,
            speed: 10,
            skills: ['basic_attack', 'light_ray'],
            spriteColor: '#ffff99',
            location: 'tianlan_school',
            // 可用时间：富二代，白天在学校，傍晚可能出去玩
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '嘿，兄弟！我叫赵满延，有什么事尽管找我！'
                }
            ],
            givesQuests: [],
            
            // 性格设定
            personality: {
                brave: 0.5,
                kind: 0.7,
                honest: 0.6,
                impulsive: 0.4,
                loyal: 0.85,
                arrogant: 0.5,
                greedy: 0.7,
                curious: 0.8
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: false,
                canBeRival: true
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                mo_fan: {
                    opinion: 60,
                    trust: 50,
                    type: 'friend',
                    label: '好兄弟'
                },
                zhang_xiaohou: {
                    opinion: 50,
                    trust: 40,
                    type: 'friend',
                    label: '朋友'
                },
                mu_ningxue: {
                    opinion: 20,
                    trust: 10,
                    type: 'acquaintance',
                    label: '同学'
                },
                tang_yue: {
                    opinion: 30,
                    trust: 25,
                    type: 'acquaintance',
                    label: '实习老师'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'zhao_manyan',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '嘿，兄弟！我叫赵满延，有什么事尽管找我！',
                            '又见面了！最近怎么样？',
                            '哟，是你啊！要不要一起去喝一杯？我请客！'
                        ],
                        choices: [
                            { text: '莫凡最近怎么样？', next: 'about_mo_fan' },
                            { text: '你家里很有钱吧？', next: 'about_family' },
                            { text: '修炼上有什么心得吗？', next: 'training_tips' },
                            { text: '学校最近有什么新鲜事吗？', next: 'school_news' },
                            { text: '随便聊聊', next: 'casual_chat' },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    about_mo_fan: {
                        id: 'about_mo_fan',
                        texts: [
                            '莫凡啊，那小子可厉害了！虽然平时看起来吊儿郎当的，但真要打起架来，那叫一个猛！',
                            '我跟莫凡那是过命的交情，这小子虽然穷了点，但人特别仗义。',
                            '说起来，莫凡最近好像在偷偷修炼什么，神神秘秘的... 不过我相信他肯定有自己的道理。'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '他实力很强吗？', next: 'mo_fan_power' },
                            { text: '你们是怎么认识的？', next: 'mo_fan_history' },
                            { text: '我知道了', next: 'default' }
                        ]
                    },
                    
                    mo_fan_power: {
                        id: 'mo_fan_power',
                        texts: [
                            '那还用说！莫凡可是我们班最强的几个之一，雷系魔法用得那叫一个溜！',
                            '虽然他才刚觉醒没多久，但进步速度快得吓人，我都怀疑他是不是开了挂。',
                            '不过说实话，莫凡这家伙藏得挺深的，我总觉得他还有很多秘密。'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3
                        },
                        choices: [
                            { text: '这么厉害？', next: 'default' }
                        ]
                    },
                    
                    mo_fan_history: {
                        id: 'mo_fan_history',
                        texts: [
                            '我们是在学校认识的，一开始我还挺看不起他的，毕竟他就是个穷小子。',
                            '但是后来发生了一些事，我发现莫凡这个人特别仗义，为了朋友可以两肋插刀。',
                            '从那以后，我们就成了好兄弟！虽然他经常蹭我吃喝，但我不在乎，兄弟嘛！'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '真是令人羡慕的友谊', next: 'default' }
                        ]
                    },
                    
                    about_family: {
                        id: 'about_family',
                        texts: [
                            '哈哈，你也听说了？我们赵家确实有点小钱，不过也就一般般啦。',
                            '我爸是做魔法器材生意的，家里条件确实还不错，所以我从小就没缺过钱花。',
                            '不过钱不是万能的，真正的朋友才是最宝贵的财富！'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '真羡慕你', next: 'default' },
                            { text: '那你能不能借我点钱？', next: 'borrow_money' }
                        ]
                    },
                    
                    borrow_money: {
                        id: 'borrow_money',
                        texts: [
                            '借钱？这个嘛... 不是我不借，只是我最近手头也有点紧...',
                            '哈哈，开个玩笑！要多少？尽管说，兄弟之间谈钱伤感情！',
                            '不过话说回来，你可别乱花啊，钱要花在刀刃上！'
                        ],
                        effects: {
                            gold: 50,
                            opinion: -2,
                            familiarity: 3
                        },
                        choices: [
                            { text: '谢谢！我会还的', next: 'default' }
                        ]
                    },
                    
                    training_tips: {
                        id: 'training_tips',
                        texts: [
                            '修炼心得吗？我觉得吧，修炼这种事，最重要的是天赋，其次就是资源。',
                            '像我这样，家里有钱，想买什么魔法器材就买什么，修炼速度自然就快了。',
                            '不过你也别灰心，勤能补拙嘛！实在不行，我可以借你点钱买器材！'
                        ],
                        effects: {
                            exp: 10,
                            familiarity: 2
                        },
                        choices: [
                            { text: '谢谢你的建议', next: 'default' }
                        ]
                    },
                    
                    school_news: {
                        id: 'school_news',
                        texts: [
                            '学校最近啊... 听说过几天有个小测验，你准备得怎么样了？',
                            '我听说穆宁雪最近又突破了，不愧是冰系天才，真厉害。',
                            '对了，最近山里好像不太太平，你去雪峰山的时候要小心啊！',
                            '还有还有，我听说学校里要来一个新的实习老师，据说是个大美女！'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '山里不太平？什么意思？', next: 'mountain_news', conditions: { minDay: 10 } },
                            { text: '穆宁雪是谁？', next: 'about_mu_ningxue' },
                            { text: '知道了，谢谢提醒', next: 'default' }
                        ]
                    },
                    
                    mountain_news: {
                        id: 'mountain_news',
                        texts: [
                            '我也是听别人说的，好像最近山里的妖魔变多了，好多猎人都不敢去了。',
                            '具体我也不太清楚，你可以去问问王老板，他消息灵通得很。',
                            '总之你小心点，别往山里跑太深了，安全第一啊！'
                        ],
                        effects: {
                            giveInfo: 'demon_rumor_1',
                            familiarity: 3
                        },
                        choices: [
                            { text: '谢谢你告诉我', next: 'default' }
                        ]
                    },
                    
                    about_mu_ningxue: {
                        id: 'about_mu_ningxue',
                        texts: [
                            '穆宁雪你都不知道？她可是我们学校的风云人物啊！穆氏家族的千金，冰系天才。',
                            '长得又漂亮，实力又强，好多男生都暗恋她呢。不过她性格太高冷了，一般人都接近不了。',
                            '说起来，莫凡好像跟她有点不对付，两个人一见面就吵架。'
                        ],
                        effects: {
                            giveInfo: 'mu_ningxue_intro',
                            familiarity: 2
                        },
                        choices: [
                            { text: '原来如此', next: 'default' }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '随便聊啊... 那我跟你说，最近我发现了一家特别好吃的餐厅！',
                            '你知道吗，我小时候的梦想是成为最厉害的光系法师，然后赚很多很多钱！',
                            '其实我有时候会觉得，有钱也挺无聊的，身边的人都是冲着我的钱来的。',
                            '不过没关系，认识了莫凡还有你这样的朋友，我觉得钱什么的都不重要了！'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '能认识你我也很高兴', next: 'become_friends' },
                            { text: '哈哈，你真有趣', next: 'default' }
                        ]
                    },
                    
                    become_friends: {
                        id: 'become_friends',
                        texts: [
                            '真的吗？你真的这么想？',
                            '太好了！从今天起，你就是我赵满延的好兄弟了！',
                            '以后有什么事尽管找我，只要我能帮上忙的，绝对不含糊！',
                            '走，我请你喝酒去！不醉不归！'
                        ],
                        effects: {
                            opinion: 10,
                            trust: 5,
                            familiarity: 10,
                            gold: 100
                        },
                        choices: [
                            { text: '好，不醉不归！', next: 'default' }
                        ]
                    }
                }
            }
        },

        mu_ningxue: {
            id: 'mu_ningxue',
            name: '穆宁雪',
            title: '冰系天才',
            description: '穆氏家族的千金，冰系天赋极高，性格高冷，是学校里的风云人物。',
            elements: ['ice'],
            level: 4,
            maxHp: 130,
            maxMp: 100,
            attack: 15,
            defense: 8,
            speed: 12,
            skills: ['basic_attack', 'ice_spike', 'ice_shield'],
            spriteColor: '#66ccff',
            image: 'assets/images/characters/mu_ningxue.jpg',
            location: 'tianlan_school',
            // 可用时间：穆家千金，白天在学校，傍晚就回家了
            availableTimes: ['morning', 'afternoon'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '...有什么事吗？'
                }
            ],
            givesQuests: [],
            
            // 性格设定
            personality: {
                brave: 0.7,
                kind: 0.4,
                honest: 0.7,
                impulsive: 0.2,
                loyal: 0.6,
                arrogant: 0.8,
                greedy: 0.3,
                curious: 0.4
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: true,      // 穆宁雪可以和玩家发展恋爱关系（难度极高）
                canBeMentor: true,     // 穆宁雪可以当玩家的导师（教冰系技巧）
                canBeRival: true       // 穆宁雪可以成为玩家的竞争对手
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                mo_fan: {
                    opinion: -15,    // 初始关系不太好，对莫凡有点复杂的感觉
                    trust: 0,
                    type: 'complicated',
                    label: '青梅竹马'
                },
                tang_yue: {
                    opinion: 20,
                    trust: 25,
                    type: 'acquaintance',
                    label: '实习老师'
                },
                wang_laoban: {
                    opinion: 0,
                    trust: 0,
                    type: 'neutral',
                    label: '陌生人'
                },
                zhang_xiaohou: {
                    opinion: 5,
                    trust: 0,
                    type: 'acquaintance',
                    label: '同学'
                },
                zhao_manyan: {
                    opinion: 15,
                    trust: 5,
                    type: 'acquaintance',
                    label: '同学'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'mu_ningxue',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '...有什么事吗？',
                            '...',
                            '说。'
                        ],
                        mood: 'cold',
                        choices: [
                            {
                                id: 'introduce',
                                text: '你好，我是新来的',
                                condition: {
                                    notNpcFlags: ['introduced']
                                },
                                effects: {
                                    opinion: +1,
                                    npcFlags: { introduced: true }
                                },
                                nextNode: 'intro_response'
                            },
                            {
                                id: 'ask_about_ice',
                                text: '请教冰系魔法',
                                condition: {
                                    minOpinion: 10,
                                    minLevel: 2
                                },
                                effects: {
                                    opinion: +2,
                                    exp: 15
                                },
                                nextNode: 'ice_tips'
                            },
                            {
                                id: 'challenge',
                                text: '想和你切磋一下',
                                condition: {
                                    minOpinion: 40,
                                    minLevel: 5
                                },
                                effects: {
                                    opinion: +3,
                                    respect: +5
                                },
                                nextNode: 'challenge_response',
                                action: 'start_battle',
                                actionData: { enemyId: 'mu_ningxue_spar' }
                            },
                            {
                                id: 'leave',
                                text: '打扰了，告辞',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    intro_response: {
                        id: 'intro_response',
                        texts: [
                            '...穆宁雪。',
                            '嗯，我知道了。',
                            '...还有事吗？'
                        ],
                        mood: 'cold',
                        choices: [
                            {
                                id: 'back',
                                text: '没了...',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    ice_tips: {
                        id: 'ice_tips',
                        texts: [
                            '冰系...最重要的是控制。',
                            '不要只想着攻击，冰的本质是束缚和防御。',
                            '星子要稳，心要静。'
                        ],
                        mood: 'neutral',
                        choices: [
                            {
                                id: 'thank',
                                text: '多谢指点',
                                effects: {
                                    opinion: +1
                                },
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    challenge_response: {
                        id: 'challenge_response',
                        texts: [
                            '...你确定？',
                            '好，我不会手下留情。',
                            '...来吧。'
                        ],
                        mood: 'serious',
                        choices: [
                            {
                                id: 'fight',
                                text: '请多指教！',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    }
                }
            }
        },

        tang_yue: {
            id: 'tang_yue',
            name: '唐月',
            title: '实习老师',
            description: '学校的实习老师，温柔美丽，火系法师，对学生很照顾。',
            elements: ['fire'],
            level: 5,
            maxHp: 180,
            maxMp: 120,
            attack: 22,
            defense: 10,
            speed: 13,
            skills: ['basic_attack', 'fire_bolt', 'fire_rain'],
            spriteColor: '#ff6633',
            image: 'assets/images/characters/tang_yue.jpg',
            location: 'tianlan_school',
            // 可用时间：白天在学校，晚上可能有其他事
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '同学你好，有什么问题可以问我哦。'
                },
                {
                    trigger: 'quest_giver',
                    text: '正好，我这里有个任务，你愿意帮忙吗？'
                }
            ],
            givesQuests: ['quest_intro', 'quest_collect_herbs', 'quest_hunt_wolf_pack', 'quest_collect_more_herbs', 'quest_explore_mountain'],
            
            // 性格设定
            personality: {
                brave: 0.6,
                kind: 0.9,
                honest: 0.8,
                impulsive: 0.3,
                loyal: 0.7,
                arrogant: 0.2,
                greedy: 0.2,
                curious: 0.6
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: true,
                canBeRival: false
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                mo_fan: {
                    opinion: 30,
                    trust: 40,
                    type: 'mentor',
                    label: '实习老师'
                },
                mu_ningxue: {
                    opinion: 20,
                    trust: 25,
                    type: 'acquaintance',
                    label: '学生'
                },
                zhang_xiaohou: {
                    opinion: 35,
                    trust: 40,
                    type: 'acquaintance',
                    label: '学生'
                },
                zhao_manyan: {
                    opinion: 25,
                    trust: 20,
                    type: 'acquaintance',
                    label: '学生'
                },
                wang_laoban: {
                    opinion: 15,
                    trust: 10,
                    type: 'acquaintance',
                    label: '小卖部老板'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'tang_yue',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '同学你好，有什么问题可以问我哦。',
                            '怎么了？遇到什么困难了吗？',
                            '修炼上有什么不懂的，随时可以问我。'
                        ],
                        mood: 'gentle',
                        choices: [
                            {
                                id: 'quest_1',
                                text: '唐老师，我是新来的',
                                condition: {
                                    notFlags: ['quest_intro_accepted']
                                },
                                effects: {
                                    opinion: +2,
                                    startQuest: 'quest_intro',
                                    flags: { quest_intro_accepted: true }
                                },
                                nextNode: 'quest_intro_dialogue'
                            },
                            {
                                id: 'quest_2',
                                text: '听说您需要草药？',
                                condition: {
                                    completedQuest: 'quest_intro',
                                    notFlags: ['quest_collect_herbs_accepted']
                                },
                                effects: {
                                    opinion: +2,
                                    startQuest: 'quest_collect_herbs',
                                    flags: { quest_collect_herbs_accepted: true }
                                },
                                nextNode: 'quest_herbs_dialogue'
                            },
                            {
                                id: 'ask_training',
                                text: '请教修炼问题',
                                condition: {
                                    minOpinion: 5
                                },
                                effects: {
                                    opinion: +2,
                                    exp: 15
                                },
                                nextNode: 'training_advice'
                            },
                            {
                                id: 'ask_school',
                                text: '问问学校的情况',
                                condition: {
                                    notNpcFlags: ['asked_about_school']
                                },
                                effects: {
                                    opinion: +1,
                                    npcFlags: { asked_about_school: true }
                                },
                                nextNode: 'school_info'
                            },
                            {
                                id: 'ask_demon',
                                text: '最近妖魔是不是变多了？',
                                condition: {
                                    minOpinion: 25,
                                    minDay: 20
                                },
                                effects: {
                                    opinion: +1,
                                    giveInfo: 'demon_intel_2'
                                },
                                nextNode: 'demon_warning'
                            },
                            {
                                id: 'leave',
                                text: '谢谢老师，我先走了',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    quest_intro_dialogue: {
                        id: 'quest_intro_dialogue',
                        texts: [
                            '你好呀，新来的同学。欢迎来到天澜魔法高中！',
                            '作为第一次修炼，先去修炼场感受一下魔法的力量吧。',
                            '有什么不懂的随时来问我哦。'
                        ],
                        mood: 'gentle',
                        choices: [
                            {
                                id: 'accept',
                                text: '好的，谢谢老师！',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    quest_herbs_dialogue: {
                        id: 'quest_herbs_dialogue',
                        texts: [
                            '嗯，我确实需要一些魔法草药做研究。',
                            '雪峰山上有很多，不过你要小心，山上有妖魔出没。',
                            '采集5株就够了，注意安全哦。'
                        ],
                        mood: 'gentle',
                        choices: [
                            {
                                id: 'accept',
                                text: '好的，我会小心的！',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    training_advice: {
                        id: 'training_advice',
                        texts: [
                            '修炼魔法啊，最重要的是打好基础。',
                            '不要急于求成，星子的引导要稳，一步一步来。',
                            '还有，要注意劳逸结合，别太累着自己了。'
                        ],
                        mood: 'gentle',
                        choices: [
                            {
                                id: 'thank',
                                text: '谢谢老师！',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    school_info: {
                        id: 'school_info',
                        texts: [
                            '我们天澜魔法高中是博城最好的公立高中哦。',
                            '学校里有很多优秀的老师和学生，大家都很努力。',
                            '希望你在这里能学有所成！'
                        ],
                        mood: 'gentle',
                        choices: [
                            {
                                id: 'back',
                                text: '明白了',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    demon_warning: {
                        id: 'demon_warning',
                        texts: [
                            '...你也察觉到了吗？',
                            '最近雪峰山的妖魔确实有点异常活跃，学校已经在调查了。',
                            '你最近去山里一定要小心，别往深处走，知道吗？',
                            '...总觉得有什么不好的事要发生...希望是我想多了。'
                        ],
                        mood: 'worried',
                        choices: [
                            {
                                id: 'back',
                                text: '好的，我会注意的',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    }
                }
            }
        },

        shop_keeper: {
            id: 'shop_keeper',
            name: '王老板',
            title: '小卖部老板',
            description: '学校小卖部的老板，什么都卖，价格公道。',
            elements: [],
            level: 1,
            maxHp: 50,
            maxMp: 10,
            attack: 2,
            defense: 2,
            speed: 3,
            skills: ['basic_attack'],
            spriteColor: '#cc9966',
            location: 'tianlan_school',
            // 可用时间：小卖部白天开门，晚上关门
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '欢迎光临！要点什么？'
                }
            ],
            givesQuests: [],
            shopId: 'school_shop',
            
            // 性格设定
            personality: {
                brave: 0.4,
                kind: 0.6,
                honest: 0.7,
                impulsive: 0.3,
                loyal: 0.5,
                arrogant: 0.3,
                greedy: 0.6,
                curious: 0.5
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'shop_keeper',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '欢迎光临！要点什么？',
                            '嘿，又来啦？今天想买点啥？',
                            '小店东西齐全，价格公道，随便看看！'
                        ],
                        mood: 'friendly',
                        choices: [
                            {
                                id: 'shop',
                                text: '看看有什么卖的',
                                effects: {},
                                nextNode: null,
                                action: 'open_shop',
                                actionData: { shopId: 'school_shop' }
                            },
                            {
                                id: 'chat',
                                text: '随便聊聊',
                                condition: {
                                    minOpinion: 10
                                },
                                effects: {
                                    opinion: +1
                                },
                                nextNode: 'casual_chat'
                            },
                            {
                                id: 'ask_news',
                                text: '最近有什么消息吗？',
                                condition: {
                                    minOpinion: 20
                                },
                                effects: {
                                    opinion: +1
                                },
                                nextNode: 'news'
                            },
                            {
                                id: 'leave',
                                text: '下次再来',
                                effects: {},
                                nextNode: null
                            }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '你说现在的学生啊，修炼都太拼命了，药水卖得特别好。',
                            '我这小店开了十几年了，什么人没见过。',
                            '小伙子，我看你骨骼清奇，将来必成大器！'
                        ],
                        mood: 'chatty',
                        choices: [
                            {
                                id: 'back',
                                text: '哈哈，老板说笑了',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    news: {
                        id: 'news',
                        texts: [
                            '消息啊...最近雪峰山那边好像不太平，你去的时候小心点。',
                            '听说城里来了几个陌生的法师，不知道是干什么的。',
                            '还有啊，最近药草涨价了，你要是需要就早点买，过几天可能更贵。'
                        ],
                        mood: 'whisper',
                        choices: [
                            {
                                id: 'ask_demon',
                                text: '雪峰山怎么了？',
                                condition: {
                                    minOpinion: 20,
                                    minDay: 10
                                },
                                effects: {
                                    opinion: +1,
                                    giveInfo: 'demon_rumor_1'
                                },
                                nextNode: 'demon_news_1'
                            },
                            {
                                id: 'ask_price',
                                text: '药草为什么涨价？',
                                condition: {
                                    minOpinion: 25,
                                    minDay: 15
                                },
                                effects: {
                                    opinion: +1,
                                    giveInfo: 'demon_rumor_2'
                                },
                                nextNode: 'price_news'
                            },
                            {
                                id: 'ask_more',
                                text: '还有别的消息吗？',
                                condition: {
                                    minOpinion: 35,
                                    minDay: 20
                                },
                                effects: {
                                    opinion: +1,
                                    giveInfo: 'demon_rumor_3'
                                },
                                nextNode: 'more_news'
                            },
                            {
                                id: 'back',
                                text: '这样啊...',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    demon_news_1: {
                        id: 'demon_news_1',
                        texts: [
                            '具体我也不清楚，就是最近去山里打猎的，好几个都受伤回来了。',
                            '说妖魔比以前多了，而且更凶了。',
                            '我劝你啊，最近别往山里跑太深，太危险了。'
                        ],
                        mood: 'worried',
                        choices: [
                            {
                                id: 'back',
                                text: '好，我知道了',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    price_news: {
                        id: 'price_news',
                        texts: [
                            '还能为啥，进山采药的人少了呗。',
                            '以前一天能采十几株，现在去的人少了，货就少了。',
                            '听说好几个采药的都遇到妖魔了，吓得没人敢去了。'
                        ],
                        mood: 'sigh',
                        choices: [
                            {
                                id: 'back',
                                text: '原来如此',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    },
                    
                    more_news: {
                        id: 'more_news',
                        texts: [
                            '别的啊...我跟你说，你可别往外传。',
                            '酒馆里的猎魔任务最近多了一倍，赏金也涨了不少。',
                            '我看啊，这事儿可能没那么简单，你自己多注意点。'
                        ],
                        mood: 'mysterious',
                        choices: [
                            {
                                id: 'back',
                                text: '谢谢老板提醒',
                                effects: {},
                                nextNode: 'default'
                            }
                        ]
                    }
                }
            }
        },

        hunter_li: {
            id: 'hunter_li',
            name: '老李',
            title: '资深猎人',
            description: '猎魔者公会的资深猎人，经验丰富，见过各种妖魔。性格豪爽，喜欢喝酒。',
            elements: ['wind'],
            level: 6,
            maxHp: 200,
            maxMp: 80,
            attack: 25,
            defense: 12,
            speed: 18,
            skills: ['basic_attack', 'wind_blade', 'wind_speed'],
            spriteColor: '#99ff99',
            location: 'city_street',
            // 可用时间：白天在公会，晚上可能出任务或喝酒
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '嘿，小伙子！来喝一杯？我请客！'
                }
            ],
            givesQuests: ['quest_hunt_wolf_pack'],
            
            // 性格设定
            personality: {
                brave: 0.9,
                kind: 0.6,
                honest: 0.8,
                impulsive: 0.6,
                loyal: 0.85,
                arrogant: 0.3,
                greedy: 0.4,
                curious: 0.5
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: true,
                canBeRival: false
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                mo_fan: {
                    opinion: 20,
                    trust: 15,
                    type: 'acquaintance',
                    label: '认识'
                },
                tang_yue: {
                    opinion: 40,
                    trust: 35,
                    type: 'friend',
                    label: '老朋友'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'hunter_li',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '嘿，小伙子！来喝一杯？我请客！',
                            '又见面了！最近猎魔收获怎么样？',
                            '哟，是你啊！来来来，坐下来喝两杯！'
                        ],
                        choices: [
                            { text: '请教一下猎魔的技巧', next: 'hunting_tips' },
                            { text: '最近山里情况怎么样？', next: 'mountain_situation' },
                            { text: '有什么猎魔任务吗？', next: 'hunt_quest' },
                            { text: '随便聊聊', next: 'casual_chat' },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    hunting_tips: {
                        id: 'hunting_tips',
                        texts: [
                            '猎魔的技巧？这个嘛，说简单也简单，说难也难。',
                            '最重要的一点，就是要了解你的对手。每种妖魔都有自己的弱点，找到弱点，一击致命。',
                            '还有啊，千万别逞强。打不过就跑，留得青山在，不怕没柴烧。',
                            '想当年，我年轻的时候，也像你一样天不怕地不怕，结果差点把命丢了。'
                        ],
                        effects: {
                            exp: 20,
                            familiarity: 3
                        },
                        choices: [
                            { text: '谢谢您的指点', next: 'default' }
                        ]
                    },
                    
                    mountain_situation: {
                        id: 'mountain_situation',
                        texts: [
                            '山里的情况啊... 不太妙。最近妖魔活动越来越频繁了，而且种类也越来越多。',
                            '以前山里主要就是些幽狼兽、暗影怪之类的，现在连石怪、雷兽都出现了。',
                            '我干猎魔这行几十年了，从来没见过这种情况。我总觉得，有什么大事要发生...',
                            '小伙子，你去山里的时候千万小心，别往深处走。'
                        ],
                        effects: {
                            giveInfo: 'demon_intel_1',
                            familiarity: 5
                        },
                        choices: [
                            { text: '这么严重？', next: 'mountain_warning' },
                            { text: '知道了，谢谢提醒', next: 'default' }
                        ]
                    },
                    
                    mountain_warning: {
                        id: 'mountain_warning',
                        texts: [
                            '可不是嘛！最近公会里的猎魔任务多了一倍，赏金也涨了不少。',
                            '而且啊，我听说有几个资深猎人进山之后，就再也没出来过...',
                            '具体情况我也不太清楚，公会那边封锁了消息。但我觉得，事情肯定不简单。',
                            '总之你小心点，千万别大意。'
                        ],
                        effects: {
                            giveInfo: 'demon_warning_1',
                            opinion: 3,
                            trust: 5
                        },
                        choices: [
                            { text: '我会小心的', next: 'default' }
                        ]
                    },
                    
                    hunt_quest: {
                        id: 'hunt_quest',
                        texts: [
                            '猎魔任务？有啊！最近狼群闹得厉害，公会悬赏猎杀幽狼兽。',
                            '怎么样，要不要试试？虽然有点危险，但赏金不少。',
                            '你要是感兴趣的话，我可以帮你接这个任务。'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '好，我接了', next: 'accept_quest', conditions: { notFlags: ['quest_hunt_wolf_pack_accepted'] } },
                            { text: '我再考虑考虑', next: 'default' }
                        ]
                    },
                    
                    accept_quest: {
                        id: 'accept_quest',
                        texts: [
                            '好样的！有胆量！',
                            '这个任务是猎杀 3 只幽狼兽，完成之后回来找我领赏。',
                            '记住，安全第一，实在不行就撤，别硬撑。'
                        ],
                        effects: {
                            startQuest: 'quest_hunt_wolf_pack',
                            flags: { quest_hunt_wolf_pack_accepted: true },
                            opinion: 5,
                            trust: 3
                        },
                        choices: [
                            { text: '明白了，我这就去', next: 'default' }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '随便聊啊... 那我跟你说说我年轻时候的事吧。',
                            '想当年，我可是猎魔者公会里的一把好手，什么妖魔没见过？',
                            '有一次，我遇到了一只将级的妖魔，那家伙，厉害得很！我跟它大战了三天三夜，最后终于把它杀了。',
                            '哈哈，当然了，我也受了不轻的伤，在床上躺了半个月。',
                            '不过啊，那才叫猎魔！现在的年轻人，太娇气了，一点苦都吃不了。'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '您真厉害', next: 'default' },
                            { text: '真的假的？', next: 'doubt_story' }
                        ]
                    },
                    
                    doubt_story: {
                        id: 'doubt_story',
                        texts: [
                            '怎么？你不信？',
                            '哈哈，我就知道你不信。没关系，等你以后经历得多了，就知道我说的都是真的。',
                            '不过话说回来，确实有点夸张了，将级妖魔哪是那么容易杀的，我那时候也是九死一生。',
                            '总之啊，猎魔这行，永远不要小看你的对手。'
                        ],
                        effects: {
                            opinion: 5,
                            trust: 5,
                            familiarity: 5
                        },
                        choices: [
                            { text: '受教了', next: 'default' }
                        ]
                    }
                }
            }
        },

        book_shop_owner: {
            id: 'book_shop_owner',
            name: '陈老板',
            title: '书店老板',
            description: '博城书店的老板，知识渊博，知道很多秘闻和传说。性格温和，喜欢看书。',
            elements: ['water'],
            level: 5,
            maxHp: 100,
            maxMp: 120,
            attack: 8,
            defense: 8,
            speed: 8,
            skills: ['basic_attack', 'water_heal'],
            spriteColor: '#66aaff',
            location: 'city_street',
            // 可用时间：书店白天开门，晚上关门
            availableTimes: ['morning', 'afternoon', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '欢迎光临！请问有什么可以帮您的？'
                }
            ],
            givesQuests: [],
            
            // 性格设定
            personality: {
                brave: 0.4,
                kind: 0.8,
                honest: 0.9,
                impulsive: 0.2,
                loyal: 0.7,
                arrogant: 0.2,
                greedy: 0.5,
                curious: 0.9
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: true,
                canBeRival: false
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                tang_yue: {
                    opinion: 30,
                    trust: 25,
                    type: 'acquaintance',
                    label: '常客'
                },
                wang_laoban: {
                    opinion: 20,
                    trust: 15,
                    type: 'acquaintance',
                    label: '同行'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'book_shop_owner',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '欢迎光临！请问有什么可以帮您的？',
                            '又见面了！今天想看点什么书？',
                            '哟，是你啊！来来来，我最近进了一批新书，要不要看看？'
                        ],
                        choices: [
                            { text: '有什么魔法书籍推荐吗？', next: 'book_recommend' },
                            { text: '听说您知道很多秘闻？', next: 'secret_knowledge' },
                            { text: '最近有什么新鲜事吗？', next: 'latest_news' },
                            { text: '随便聊聊', next: 'casual_chat' },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    book_recommend: {
                        id: 'book_recommend',
                        texts: [
                            '魔法书籍啊... 那可就多了。',
                            '如果你是初学者的话，我推荐《魔法基础理论》，这本书讲得很详细。',
                            '要是你想了解元素魔法的话，《元素魔法入门》也不错。',
                            '当然了，我这里还有很多珍稀的魔法书籍，不过价格嘛... 就有点贵了。'
                        ],
                        effects: {
                            exp: 15,
                            familiarity: 2
                        },
                        choices: [
                            { text: '谢谢您的推荐', next: 'default' }
                        ]
                    },
                    
                    secret_knowledge: {
                        id: 'secret_knowledge',
                        texts: [
                            '秘闻？哈哈，我确实知道一些。',
                            '毕竟开了这么多年书店，来来往往的人多了，听到的事情自然也就多了。',
                            '不过啊，有些事情，知道得太多可不是什么好事。',
                            '你真想知道？那我就跟你说几个吧，不过你可别往外传。'
                        ],
                        effects: {
                            familiarity: 3
                        },
                        choices: [
                            { text: '关于妖魔的秘闻', next: 'demon_secrets', conditions: { minDay: 15 } },
                            { text: '关于穆氏家族的秘闻', next: 'mu_family_secrets' },
                            { text: '算了，我还是不知道为好', next: 'default' }
                        ]
                    },
                    
                    demon_secrets: {
                        id: 'demon_secrets',
                        texts: [
                            '妖魔的秘闻啊... 这个可就有点吓人了。',
                            '我听说啊，妖魔其实是有组织的，它们也有自己的社会结构。',
                            '而且，妖魔的等级划分比我们想象的要复杂得多。奴仆级之上是将级，将级之上还有统领级、君主级...',
                            '最可怕的是，据说还有帝王级的妖魔，那可是能毁灭一座城市的存在！',
                            '当然了，这些都只是传说，真假就不知道了。'
                        ],
                        effects: {
                            giveInfo: 'demon_intel_2',
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '真是太可怕了', next: 'default' }
                        ]
                    },
                    
                    mu_family_secrets: {
                        id: 'mu_family_secrets',
                        texts: [
                            '穆氏家族的秘闻啊... 这个可就有点敏感了。',
                            '穆家可是博城的一大家族，势力大得很。',
                            '我听说啊，穆家的冰系魔法是祖传的，而且还有一件祖传的冰系魂种，厉害得很。',
                            '还有啊，穆家的大小姐穆宁雪，据说天生就有冰系天赋，是百年难遇的天才。',
                            '不过啊，我还听说，穆宁雪小时候好像发生过什么事，从那以后性格就变得特别冷了...',
                            '具体是什么事，我就不知道了。'
                        ],
                        effects: {
                            giveInfo: 'mu_ningxue_past',
                            familiarity: 5
                        },
                        choices: [
                            { text: '原来如此', next: 'default' }
                        ]
                    },
                    
                    latest_news: {
                        id: 'latest_news',
                        texts: [
                            '新鲜事啊... 让我想想。',
                            '最近啊，山里好像不太太平，好多猎人都不敢进山了。',
                            '还有啊，猎魔者公会最近发布了好多新任务，赏金也比以前高了不少。',
                            '我总觉得，这事儿有点不对劲... 好像有什么大事要发生。',
                            '你自己多注意点吧。'
                        ],
                        effects: {
                            giveInfo: 'demon_rumor_3',
                            familiarity: 2
                        },
                        choices: [
                            { text: '谢谢提醒', next: 'default' }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '随便聊啊... 那我跟你说说我年轻时候的事吧。',
                            '想当年，我也是个魔法学徒，梦想着成为一名伟大的法师。',
                            '可惜啊，我天赋一般，修炼了几十年，也没什么长进。',
                            '后来啊，我就开了这家书店，虽然不能成为伟大的法师，但能每天和书打交道，我也挺满足的。',
                            '小伙子，你天赋不错，一定要好好修炼，别像我一样，到老了一事无成。'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5,
                            exp: 10
                        },
                        choices: [
                            { text: '您太谦虚了', next: 'default' },
                            { text: '我会努力的', next: 'encourage' }
                        ]
                    },
                    
                    encourage: {
                        id: 'encourage',
                        texts: [
                            '好！有志气！',
                            '我果然没看错你，你将来一定能成大器！',
                            '这样吧，我送你一本书，希望对你有帮助。',
                            '记住，知识就是力量，多读书总是没错的。'
                        ],
                        effects: {
                            opinion: 5,
                            trust: 5,
                            familiarity: 10,
                            exp: 30
                        },
                        choices: [
                            { text: '谢谢您！', next: 'default' }
                        ]
                    }
                }
            }
        },

        magic_association_chairman: {
            id: 'magic_association_chairman',
            name: '周会长',
            title: '魔法协会会长',
            description: '博城魔法协会的会长，实力强大，德高望重。性格严肃，做事公正。',
            elements: ['fire', 'earth'],
            level: 10,
            maxHp: 500,
            maxMp: 300,
            attack: 50,
            defense: 30,
            speed: 15,
            skills: ['basic_attack', 'fire_bolt', 'fire_rain', 'earth_shield', 'earth_spike'],
            spriteColor: '#ff9933',
            location: 'city_street',
            dialogue: [
                {
                    trigger: 'default',
                    text: '年轻人，有什么事吗？'
                }
            ],
            givesQuests: [],
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 5,
                hint: '需要等级 5 才能见到会长'
            },
            
            // 性格设定
            personality: {
                brave: 0.9,
                kind: 0.7,
                honest: 0.95,
                impulsive: 0.2,
                loyal: 0.9,
                arrogant: 0.3,
                greedy: 0.1,
                curious: 0.6
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: true,
                canBeRival: false
            },
            
            // 与其他 NPC 的初始关系
            relationships: {
                tang_yue: {
                    opinion: 50,
                    trust: 60,
                    type: 'friend',
                    label: '后辈'
                },
                mu_ningxue: {
                    opinion: 40,
                    trust: 35,
                    type: 'acquaintance',
                    label: '穆家千金'
                }
            },
            
            // 对话树
            dialogueTree: {
                npcId: 'magic_association_chairman',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '年轻人，有什么事吗？',
                            '又见面了。最近修炼得怎么样？',
                            '是你啊。有什么事就直说吧。'
                        ],
                        choices: [
                            { text: '请教一下魔法修炼的问题', next: 'magic_advice' },
                            { text: '最近城里有什么大事吗？', next: 'city_news' },
                            { text: '我想加入魔法协会', next: 'join_association' },
                            { text: '随便聊聊', next: 'casual_chat' },
                            { text: '打扰了，再见', next: null, action: 'close' }
                        ]
                    },
                    
                    magic_advice: {
                        id: 'magic_advice',
                        texts: [
                            '魔法修炼啊... 这个话题可就大了。',
                            '魔法修炼，最重要的是基础。基础打牢了，后面才能走得更远。',
                            '很多年轻人急于求成，一味追求强大的魔法，却忽略了基础的重要性。',
                            '记住，魔法的本质是对元素的理解和掌控。你对元素理解得越深，魔法的威力就越大。',
                            '还有啊，修炼要循序渐进，不能操之过急。不然很容易走火入魔。'
                        ],
                        effects: {
                            exp: 30,
                            familiarity: 3
                        },
                        choices: [
                            { text: '受教了', next: 'default' }
                        ]
                    },
                    
                    city_news: {
                        id: 'city_news',
                        texts: [
                            '城里的大事啊... 最近确实不太太平。',
                            '山里的妖魔活动越来越频繁了，猎魔任务也多了不少。',
                            '而且啊，我总觉得这次的妖魔异动有点不对劲，不像是普通的妖魔骚乱。',
                            '具体是什么情况，我也不太清楚。不过你放心，魔法协会已经在调查了。',
                            '你自己多注意点，没事别往山里跑。'
                        ],
                        effects: {
                            giveInfo: 'demon_intel_2',
                            familiarity: 5
                        },
                        choices: [
                            { text: '这么严重？', next: 'city_warning' },
                            { text: '知道了，谢谢会长提醒', next: 'default' }
                        ]
                    },
                    
                    city_warning: {
                        id: 'city_warning',
                        texts: [
                            '嗯，情况确实不太乐观。',
                            '我已经向上面汇报了，相信很快就会有结果。',
                            '不过啊，有些事情，可能比我们想象的要复杂得多。',
                            '你还年轻，有些事情，知道得太多反而不好。',
                            '总之，你好好修炼，提升自己的实力，这才是最重要的。'
                        ],
                        effects: {
                            giveInfo: 'demon_warning_1',
                            opinion: 3,
                            trust: 5
                        },
                        choices: [
                            { text: '我明白了', next: 'default' }
                        ]
                    },
                    
                    join_association: {
                        id: 'join_association',
                        texts: [
                            '想加入魔法协会？有志气！',
                            '不过啊，魔法协会可不是那么好进的。想要加入，必须通过我们的考核。',
                            '考核的内容嘛，主要是看你的魔法实力和潜力。',
                            '以你现在的实力，还差了一点。不过没关系，年轻人嘛，还有很大的进步空间。',
                            '等你实力够了，再来找我吧。我相信你一定可以的！'
                        ],
                        effects: {
                            opinion: 5,
                            familiarity: 3
                        },
                        choices: [
                            { text: '我会努力的', next: 'default' }
                        ]
                    },
                    
                    casual_chat: {
                        id: 'casual_chat',
                        texts: [
                            '随便聊啊... 那我跟你说说我年轻时候的事吧。',
                            '想当年，我也像你一样，是个意气风发的年轻人，梦想着成为最强大的法师。',
                            '我从一个小地方出来，一路打拼，吃了不少苦，也走了不少弯路。',
                            '不过啊，我从来没有放弃过。凭着一股不服输的劲头，我终于走到了今天这个位置。',
                            '年轻人，记住一句话：只要你肯努力，就没有什么是不可能的。'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5,
                            exp: 20
                        },
                        choices: [
                            { text: '您真厉害', next: 'default' },
                            { text: '我一定会努力的', next: 'encourage' }
                        ]
                    },
                    
                    encourage: {
                        id: 'encourage',
                        texts: [
                            '好！有你这句话，我就放心了。',
                            '我果然没看错你，你将来一定能成大器！',
                            '这样吧，我送你一件小礼物，希望对你有帮助。',
                            '记住，魔法的道路是没有尽头的，永远不要停下前进的脚步。'
                        ],
                        effects: {
                            opinion: 10,
                            trust: 10,
                            familiarity: 15,
                            gold: 200,
                            reputation: { magic_association: 10 }
                        },
                        choices: [
                            { text: '谢谢会长！', next: 'default' }
                        ]
                    }
                }
            }
        },

        mysterious_mage: {
            id: 'mysterious_mage',
            name: '神秘人',
            title: '流浪法师',
            description: '一个神秘的流浪法师，不知道从哪里来，也不知道要到哪里去。似乎知道很多秘密。',
            elements: ['dark'],
            level: 8,
            maxHp: 300,
            maxMp: 200,
            attack: 35,
            defense: 15,
            speed: 20,
            skills: ['basic_attack', 'dark_bolt'],
            spriteColor: '#993399',
            location: 'city_street',
            // 可用时间：只有晚上才出现，神秘人嘛
            availableTimes: ['night', 'evening'],
            dialogue: [
                {
                    trigger: 'default',
                    text: '...你能看到我？'
                }
            ],
            givesQuests: [],
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 3,
                hint: '需要等级 3 才能引起他的注意'
            },
            
            // 性格设定
            personality: {
                brave: 0.8,
                kind: 0.5,
                honest: 0.4,
                impulsive: 0.3,
                loyal: 0.6,
                arrogant: 0.7,
                greedy: 0.3,
                curious: 0.9
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: true,
                canBeRival: true
            },
            
            // 与其他 NPC 的初始关系
            relationships: {},
            
            // 对话树
            dialogueTree: {
                npcId: 'mysterious_mage',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '...你能看到我？',
                            '又见面了。你很有趣。',
                            '是你啊... 怎么，又想知道些什么？'
                        ],
                        choices: [
                            { text: '你是谁？', next: 'who_are_you' },
                            { text: '你知道些什么秘密？', next: 'what_secrets' },
                            { text: '能教我魔法吗？', next: 'teach_magic' },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    who_are_you: {
                        id: 'who_are_you',
                        texts: [
                            '我是谁？... 我也不知道。',
                            '我只是一个流浪的法师，到处走走，看看。',
                            '这个世界很大，有很多你不知道的事情。',
                            '你想知道更多吗？那就好好修炼吧。等你足够强大了，自然会知道的。'
                        ],
                        effects: {
                            familiarity: 5
                        },
                        choices: [
                            { text: '你真神秘', next: 'default' }
                        ]
                    },
                    
                    what_secrets: {
                        id: 'what_secrets',
                        texts: [
                            '秘密？... 这个世界上的秘密可多了去了。',
                            '比如... 你知道黑教廷吗？',
                            '黑教廷，是一个邪恶的组织，他们一直在暗中策划着什么。',
                            '而且啊，我听说，黑教廷已经渗透到博城了...',
                            '当然，这些都只是传闻，真假就不知道了。'
                        ],
                        effects: {
                            giveInfo: 'black_church_rumor',
                            familiarity: 10
                        },
                        choices: [
                            { text: '黑教廷？那是什么？', next: 'about_black_church' },
                            { text: '太可怕了', next: 'default' }
                        ]
                    },
                    
                    about_black_church: {
                        id: 'about_black_church',
                        texts: [
                            '黑教廷啊... 那是一个非常古老的组织。',
                            '他们信奉黑暗，追求力量，为了达到目的不择手段。',
                            '黑教廷的成员遍布各地，隐藏得很深，你永远不知道你身边的人是不是黑教廷的人。',
                            '而且啊，黑教廷还有很多可怕的禁术，想想都让人不寒而栗。',
                            '总之啊，你自己小心点，别惹上他们。'
                        ],
                        effects: {
                            giveInfo: 'black_church_intel',
                            opinion: 5,
                            trust: 5
                        },
                        choices: [
                            { text: '我会小心的', next: 'default' }
                        ]
                    },
                    
                    teach_magic: {
                        id: 'teach_magic',
                        texts: [
                            '教你魔法？... 你确定？',
                            '我会的魔法，可不是什么正经的魔法。',
                            '暗影系的魔法，威力强大，但也很危险。一不小心，就会被黑暗吞噬。',
                            '不过啊，如果你真的想学的话... 我倒是可以教你一点。',
                            '怎么样，要不要试试？'
                        ],
                        effects: {
                            familiarity: 5
                        },
                        choices: [
                            { text: '好，我想学！', next: 'learn_dark_magic' },
                            { text: '算了，太危险了', next: 'default' }
                        ]
                    },
                    
                    learn_dark_magic: {
                        id: 'learn_dark_magic',
                        texts: [
                            '好！有胆量！我果然没看错你。',
                            '暗影系魔法的精髓，在于隐藏和偷袭。',
                            '记住，暗影系的魔法，正面硬刚是不行的，要学会利用阴影，出其不意。',
                            '来，我教你一个简单的暗影系魔法——暗影腐蚀。',
                            '这个魔法可以在敌人身上留下腐蚀效果，持续造成伤害。',
                            '怎么样，学会了吗？'
                        ],
                        effects: {
                            opinion: 10,
                            trust: 10,
                            familiarity: 15,
                            exp: 50
                        },
                        choices: [
                            { text: '学会了！谢谢您！', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 萧院长 - 天澜魔法高中院长
        xiao_principal: {
            id: 'xiao_principal',
            name: '萧院长',
            title: '天澜魔法高中院长',
            description: '天澜魔法高中的院长，一位德高望重的老法师，火系修为深厚，培养了无数优秀的法师。',
            elements: ['fire', 'wind'],
            level: 15,
            maxHp: 800,
            maxMp: 500,
            attack: 80,
            defense: 50,
            speed: 25,
            skills: ['basic_attack', 'fire_bolt', 'fire_rain', 'wind_blade', 'wind_speed'],
            spriteColor: '#ff6633',
            location: 'tianlan_school',
            dialogue: [
                {
                    trigger: 'default',
                    text: '年轻人，有什么事吗？'
                }
            ],
            givesQuests: [],
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 7,
                hint: '需要等级 7 才能见到院长'
            },
            
            // 性格设定
            personality: {
                brave: 0.9,
                kind: 0.85,
                honest: 0.95,
                impulsive: 0.1,
                loyal: 0.9,
                arrogant: 0.2,
                greedy: 0.1,
                curious: 0.6
            },
            
            // 关系上限
            relationshipCap: {
                maxOpinion: 100,
                maxTrust: 100,
                canRomance: false,
                canBeMentor: true,
                canBeRival: false
            },
            
            // 初始关系
            initialRelationships: {
                tang_yue: { opinion: 70, trust: 75, type: 'friend', label: '后辈' },
                mo_fan: { opinion: 40, trust: 30, type: 'acquaintance', label: '学生' },
                mu_ningxue: { opinion: 60, trust: 55, type: 'acquaintance', label: '天才学生' },
                magic_association_chairman: { opinion: 65, trust: 60, type: 'friend', label: '老朋友' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '哦？是你啊，最近修炼得怎么样？',
                            '年轻人，有什么事吗？',
                            '好好修炼，不要辜负了你的天赋。'
                        ],
                        mood: 'kind',
                        choices: [
                            { text: '请教一下修炼的问题', next: 'training_advice' },
                            { text: '学校最近有什么事吗？', next: 'school_news' },
                            { text: '我想申请特殊资源', next: 'special_resources' },
                            { text: '听说山里不太平', next: 'demon_warning' },
                            { text: '打扰了，再见', next: null, action: 'close' }
                        ]
                    },
                    
                    training_advice: {
                        id: 'training_advice',
                        texts: [
                            '修炼一途，贵在坚持。',
                            '魔法的本质，是对元素的理解和掌控。',
                            '不要只追求力量的强大，更要注重心性的修炼。',
                            '记住，真正强大的法师，不仅要有强大的魔法，更要有坚定的意志。'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 5,
                            exp: 30
                        },
                        choices: [
                            { text: '谢谢院长指点！', next: 'default' }
                        ]
                    },
                    
                    school_news: {
                        id: 'school_news',
                        texts: [
                            '学校最近一切都好，学生们都很努力。',
                            '不过啊，最近雪峰山那边有点不太平，你们要小心点。',
                            '期末考核快到了，你们要好好准备。',
                            '对了，今年的新生里，有几个好苗子啊...'
                        ],
                        effects: {
                            familiarity: 3,
                            giveInfo: 'school_info_3'
                        },
                        choices: [
                            { text: '雪峰山怎么了？', next: 'demon_warning' },
                            { text: '期末考核是什么样的？', next: 'final_exam' },
                            { text: '我知道了', next: 'default' }
                        ]
                    },
                    
                    final_exam: {
                        id: 'final_exam',
                        texts: [
                            '期末考核啊，那可是对你们这一学期学习成果的检验。',
                            '考核分为理论和实战两部分，都很重要。',
                            '只要你平时认真修炼，通过考核应该不成问题。',
                            '当然，如果你表现优异的话，还会有额外的奖励哦。'
                        ],
                        effects: {
                            familiarity: 3
                        },
                        choices: [
                            { text: '我会努力的！', next: 'default' }
                        ]
                    },
                    
                    special_resources: {
                        id: 'special_resources',
                        texts: [
                            '特殊资源？... 你想要什么？',
                            '学校的资源都是有限的，要留给真正有天赋的学生。',
                            '当然，如果你能证明自己的实力，我也可以考虑给你一些特殊的资源。',
                            '怎么样，想试试吗？'
                        ],
                        effects: {
                            familiarity: 5
                        },
                        choices: [
                            { text: '我想试试！', next: 'special_test' },
                            { text: '算了，我再想想', next: 'default' }
                        ]
                    },
                    
                    special_test: {
                        id: 'special_test',
                        texts: [
                            '好！有志向！',
                            '这样吧，如果你能在期末考核中取得前三名的成绩，我就给你一份特殊的奖励。',
                            '怎么样，有信心吗？',
                            '记住，机会是留给有准备的人的。'
                        ],
                        effects: {
                            opinion: 5,
                            trust: 5,
                            npcFlags: { special_test_accepted: true }
                        },
                        choices: [
                            { text: '我有信心！', next: 'default' }
                        ]
                    },
                    
                    demon_warning: {
                        id: 'demon_warning',
                        texts: [
                            '雪峰山的事... 你也听说了？',
                            '确实，最近山里的妖魔有点异常，活动越来越频繁了。',
                            '不过你放心，学校已经加强了防护，应该不会有什么大问题。',
                            '但是啊，你自己也要小心，没事别往山里跑。',
                            '记住，安全第一，知道吗？'
                        ],
                        effects: {
                            opinion: 3,
                            giveInfo: 'demon_warning_1'
                        },
                        condition: {
                            minDay: 25
                        },
                        choices: [
                            { text: '我知道了，谢谢院长提醒', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 薛木生（班主任）
        xue_musheng: {
            id: 'xue_musheng',
            name: '薛木生',
            title: '天澜魔法高中班主任',
            description: '莫凡所在班级的班主任，火系法师，教学严格但关心学生。',
            elements: ['fire'],
            level: 8,
            maxHp: 300,
            maxMp: 150,
            attack: 30,
            defense: 15,
            speed: 12,
            skills: ['basic_attack', 'fire_bolt'],
            spriteColor: '#ff6633',
            isNPC: true,
            location: 'school',
            
            // 性格
            personality: {
                brave: 0.7,
                kind: 0.6,
                honest: 0.9,
                impulsive: 0.3,
                loyal: 0.8,
                arrogant: 0.2,
                greedy: 0.1,
                curious: 0.5
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: false,
                canBeMentor: true,
                canBeRival: false
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 1
            },
            
            // 初始关系
            initialRelationships: {
                mo_fan: { opinion: 30, trust: 40, type: 'acquaintance', label: '学生' },
                zhang_xiaohou: { opinion: 35, trust: 45, type: 'acquaintance', label: '学生' },
                zhao_manyan: { opinion: 25, trust: 30, type: 'acquaintance', label: '学生' },
                mu_ningxue: { opinion: 60, trust: 55, type: 'acquaintance', label: '天才学生' },
                tang_yue: { opinion: 50, trust: 55, type: 'friend', label: '同事' },
                xiao_principal: { opinion: 70, trust: 75, type: 'mentor', label: '校长' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '是你啊，最近学习怎么样？',
                            '有什么事吗？',
                            '要好好修炼，不要偷懒。'
                        ],
                        mood: 'serious',
                        choices: [
                            { text: '请教一下学习的问题', next: 'study_advice' },
                            { text: '班里最近有什么事吗？', next: 'class_news' },
                            { text: '关于考核的事...', next: 'exam_info' },
                            { text: '听说山里不太平', next: 'demon_warning' },
                            { text: '打扰了，老师再见', next: null, action: 'close' }
                        ]
                    },
                    
                    study_advice: {
                        id: 'study_advice',
                        texts: [
                            '学习魔法，基础最重要。',
                            '不要好高骛远，先把基础打牢。',
                            '理论和实践同样重要，既要上课认真听，也要多去实战。',
                            '记住，魔法的本质是对元素的理解，理解得越深，魔法就越强。'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3,
                            exp: 20
                        },
                        choices: [
                            { text: '谢谢老师指点！', next: 'default' }
                        ]
                    },
                    
                    class_news: {
                        id: 'class_news',
                        texts: [
                            '班里啊... 最近大家都挺努力的。',
                            '穆宁雪还是那么优秀，冰系魔法用得越来越好了。',
                            '莫凡那小子，虽然平时吊儿郎当的，但进步挺快的。',
                            '赵满延家里有钱，装备不错，就是修炼不够刻苦。',
                            '张小侯那孩子，虽然天赋一般，但特别努力，我很看好他。'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 2
                        },
                        choices: [
                            { text: '原来是这样', next: 'default' }
                        ]
                    },
                    
                    exam_info: {
                        id: 'exam_info',
                        texts: [
                            '考核的事啊... 你想知道什么？',
                            '入学考核主要考基础魔法的运用，只要你认真修炼了，应该没问题。',
                            '期中考核会难一些，不仅考理论，还要考实战。',
                            '期末考核是最重要的，直接关系到你能不能顺利升级。',
                            '好好准备吧，不要临时抱佛脚。'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 2
                        },
                        choices: [
                            { text: '我会好好准备的', next: 'default' }
                        ]
                    },
                    
                    demon_warning: {
                        id: 'demon_warning',
                        texts: [
                            '雪峰山的事... 你也听说了？',
                            '确实，最近山里有点不太平，妖魔活动比平时频繁了。',
                            '学校已经发了通知，禁止学生私自进山。',
                            '你也给我注意点，没事别往山里跑，知道吗？',
                            '安全第一，修炼可以慢慢来，命只有一条。'
                        ],
                        effects: {
                            opinion: 2,
                            giveInfo: 'demon_warning_1'
                        },
                        condition: {
                            minDay: 20
                        },
                        choices: [
                            { text: '我知道了，谢谢老师提醒', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 周敏（同学，火系）
        zhou_min: {
            id: 'zhou_min',
            name: '周敏',
            title: '天澜魔法高中学生',
            description: '莫凡的同班同学，火系法师，性格活泼开朗，成绩不错。',
            elements: ['fire'],
            level: 2,
            maxHp: 80,
            maxMp: 60,
            attack: 12,
            defense: 5,
            speed: 11,
            skills: ['basic_attack', 'fire_bolt'],
            spriteColor: '#ff5522',
            isNPC: true,
            location: 'school',
            
            // 性格
            personality: {
                brave: 0.6,
                kind: 0.8,
                honest: 0.7,
                impulsive: 0.5,
                loyal: 0.7,
                arrogant: 0.3,
                greedy: 0.2,
                curious: 0.8
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: true,
                canBeMentor: false,
                canBeRival: false
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 1
            },
            
            // 初始关系
            initialRelationships: {
                mo_fan: { opinion: 15, trust: 10, type: 'acquaintance', label: '同学' },
                zhang_xiaohou: { opinion: 20, trust: 15, type: 'acquaintance', label: '同学' },
                zhao_manyan: { opinion: 25, trust: 20, type: 'acquaintance', label: '同学' },
                mu_ningxue: { opinion: 10, trust: 5, type: 'acquaintance', label: '同学' },
                tang_yue: { opinion: 30, trust: 35, type: 'acquaintance', label: '老师' },
                xue_musheng: { opinion: 40, trust: 45, type: 'acquaintance', label: '班主任' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '嗨！你好啊，我叫周敏！',
                            '又见面啦！今天修炼得怎么样？',
                            '你也是来上课的吗？'
                        ],
                        mood: 'friendly',
                        choices: [
                            { text: '你好，我是新来的', next: 'intro' },
                            { text: '修炼上有什么心得吗？', next: 'training_tips' },
                            { text: '班里最近有什么新鲜事吗？', next: 'class_news' },
                            { text: '一起去修炼吗？', next: 'train_together', condition: { minOpinion: 25 } },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    intro: {
                        id: 'intro',
                        texts: [
                            '新来的？欢迎欢迎！我是周敏，火系的。',
                            '有什么不懂的可以问我哦，我虽然不是最厉害的，但知道的还挺多的！',
                            '对了，你是什么系的呀？'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '谢谢你的欢迎', next: 'default' }
                        ]
                    },
                    
                    training_tips: {
                        id: 'training_tips',
                        texts: [
                            '修炼心得吗？我觉得火系魔法最重要的是控制！',
                            '火的力量很强，但如果控制不好，很容易伤到自己或者别人。',
                            '我每天都会花时间练习控制力，虽然有点枯燥，但真的很有用！',
                            '你也可以试试，从控制小火苗开始，慢慢就能控制更大的火焰了。'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3,
                            exp: 10
                        },
                        choices: [
                            { text: '有道理，我也试试', next: 'default' }
                        ]
                    },
                    
                    class_news: {
                        id: 'class_news',
                        texts: [
                            '新鲜事吗？让我想想...',
                            '对了！穆宁雪最近又突破了，冰系魔法越来越厉害了，真羡慕！',
                            '还有啊，莫凡那家伙，看起来吊儿郎当的，没想到进步还挺快的。',
                            '赵满延又在炫耀他的新装备了，真是的，有钱了不起啊...',
                            '张小侯最近特别努力，每天都修炼到很晚，我都有点佩服他了。'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 2
                        },
                        choices: [
                            { text: '原来是这样', next: 'default' }
                        ]
                    },
                    
                    train_together: {
                        id: 'train_together',
                        texts: [
                            '一起修炼？好啊好啊！',
                            '两个人一起修炼更有动力，还能互相切磋！',
                            '走吧，我们去修炼室！'
                        ],
                        effects: {
                            opinion: 5,
                            familiarity: 8,
                            exp: 25
                        },
                        choices: [
                            { text: '好，走吧！', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 许昭霆（同学，雷系）
        xu_zhaoting: {
            id: 'xu_zhaoting',
            name: '许昭霆',
            title: '天澜魔法高中学生',
            description: '莫凡的同班同学，雷系法师，天赋不错，性格有点骄傲，但人不坏。',
            elements: ['thunder'],
            level: 3,
            maxHp: 90,
            maxMp: 70,
            attack: 14,
            defense: 6,
            speed: 12,
            skills: ['basic_attack', 'thunder_bolt'],
            spriteColor: '#9966ff',
            isNPC: true,
            location: 'school',
            
            // 性格
            personality: {
                brave: 0.7,
                kind: 0.5,
                honest: 0.6,
                impulsive: 0.6,
                loyal: 0.6,
                arrogant: 0.7,
                greedy: 0.3,
                curious: 0.6
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: false,
                canBeMentor: false,
                canBeRival: true
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 1
            },
            
            // 初始关系
            initialRelationships: {
                mo_fan: { opinion: -10, trust: 0, type: 'cold', label: '竞争对手' },
                zhang_xiaohou: { opinion: 5, trust: 0, type: 'acquaintance', label: '同学' },
                zhao_manyan: { opinion: 15, trust: 10, type: 'acquaintance', label: '同学' },
                mu_ningxue: { opinion: 20, trust: 10, type: 'acquaintance', label: '同学' },
                zhou_min: { opinion: 10, trust: 5, type: 'acquaintance', label: '同学' },
                tang_yue: { opinion: 25, trust: 30, type: 'acquaintance', label: '老师' },
                xue_musheng: { opinion: 35, trust: 40, type: 'acquaintance', label: '班主任' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '嗯？你找我有事？',
                            '怎么，想请教我雷系魔法？',
                            '有话快说，我还要修炼呢。'
                        ],
                        mood: 'arrogant',
                        choices: [
                            { text: '你好，我是新来的', next: 'intro' },
                            { text: '雷系魔法很厉害啊', next: 'thunder_praise' },
                            { text: '要不要切磋一下？', next: 'challenge', condition: { minOpinion: 10, minLevel: 3 } },
                            { text: '班里最近怎么样？', next: 'class_news' },
                            { text: '打扰了，再见', next: null, action: 'close' }
                        ]
                    },
                    
                    intro: {
                        id: 'intro',
                        texts: [
                            '新来的？我叫许昭霆，雷系的。',
                            '雷系可是很强的元素，能选到雷系是你的运气。',
                            '不过，光有天赋可不够，还得努力修炼才行。',
                            '好好努力吧，别给雷系丢脸。'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 3
                        },
                        choices: [
                            { text: '我会努力的', next: 'default' }
                        ]
                    },
                    
                    thunder_praise: {
                        id: 'thunder_praise',
                        texts: [
                            '那当然！雷系可是所有元素中攻击力最强的！',
                            '雷电的速度快，威力大，防不胜防！',
                            '我跟你说，只要雷系魔法用得好，同阶几乎无敌！',
                            '当然，像我这么有天赋的雷系法师，就更厉害了，哈哈！'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 2
                        },
                        choices: [
                            { text: '确实很厉害', next: 'default' }
                        ]
                    },
                    
                    challenge: {
                        id: 'challenge',
                        texts: [
                            '切磋？你确定？',
                            '哼，既然你想试试，那我就陪你玩玩！',
                            '不过你可别输得太惨啊，哈哈！'
                        ],
                        effects: {
                            opinion: 5
                        },
                        action: 'start_battle',
                        actionData: { enemyId: 'xu_zhaoting_spar' },
                        choices: [
                            { text: '来吧！', next: 'default' }
                        ]
                    },
                    
                    class_news: {
                        id: 'class_news',
                        texts: [
                            '班里啊... 就那样呗。',
                            '穆宁雪还是那么强，冰系魔法用得真好，不过我雷系也不差！',
                            '莫凡那家伙，不知道走了什么狗屎运，进步还挺快的。',
                            '赵满延就是个富二代，除了装备好，没什么了不起的。',
                            '周敏那丫头，挺努力的，就是天赋差了点。'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 2
                        },
                        choices: [
                            { text: '原来是这样', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 何雨（同学，水系）
        he_yu: {
            id: 'he_yu',
            name: '何雨',
            title: '天澜魔法高中学生',
            description: '莫凡的同班同学，水系法师，性格温柔善良，乐于助人，治疗魔法很有天赋。',
            elements: ['water'],
            level: 2,
            maxHp: 70,
            maxMp: 80,
            attack: 8,
            defense: 6,
            speed: 9,
            skills: ['basic_attack', 'water_heal'],
            spriteColor: '#3399ff',
            isNPC: true,
            location: 'school',
            
            // 性格
            personality: {
                brave: 0.4,
                kind: 0.95,
                honest: 0.85,
                impulsive: 0.2,
                loyal: 0.8,
                arrogant: 0.1,
                greedy: 0.1,
                curious: 0.6
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: true,
                canBeMentor: false,
                canBeRival: false
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 1
            },
            
            // 初始关系
            initialRelationships: {
                mo_fan: { opinion: 10, trust: 10, type: 'acquaintance', label: '同学' },
                zhang_xiaohou: { opinion: 15, trust: 15, type: 'acquaintance', label: '同学' },
                zhao_manyan: { opinion: 20, trust: 15, type: 'acquaintance', label: '同学' },
                mu_ningxue: { opinion: 15, trust: 10, type: 'acquaintance', label: '同学' },
                zhou_min: { opinion: 30, trust: 35, type: 'friend', label: '好朋友' },
                xu_zhaoting: { opinion: 5, trust: 0, type: 'acquaintance', label: '同学' },
                tang_yue: { opinion: 35, trust: 40, type: 'acquaintance', label: '老师' },
                xue_musheng: { opinion: 45, trust: 50, type: 'acquaintance', label: '班主任' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '你好呀，有什么事吗？',
                            '又见面了，今天过得怎么样？',
                            '...嗯？找我有事吗？'
                        ],
                        mood: 'gentle',
                        choices: [
                            { text: '你好，我是新来的', next: 'intro' },
                            { text: '水系魔法怎么修炼？', next: 'water_tips' },
                            { text: '你会治疗魔法吗？', next: 'heal_magic' },
                            { text: '班里最近怎么样？', next: 'class_news' },
                            { text: '能帮我治疗一下吗？', next: 'heal_player', condition: { minOpinion: 20 } },
                            { text: '再见', next: null, action: 'close' }
                        ]
                    },
                    
                    intro: {
                        id: 'intro',
                        texts: [
                            '新来的？欢迎你！我叫何雨，水系的。',
                            '有什么不懂的可以问我哦，我会尽力帮你的！',
                            '对了，你是什么系的呀？'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '谢谢你，你人真好', next: 'default' }
                        ]
                    },
                    
                    water_tips: {
                        id: 'water_tips',
                        texts: [
                            '水系魔法吗？我觉得最重要的是感受水的流动。',
                            '水是很温柔的，但也很有力量，要学会和它沟通。',
                            '我每天都会冥想，感受周围的水元素，虽然进步慢，但很扎实。',
                            '水系虽然攻击力不强，但辅助和治疗都很厉害哦！'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3,
                            exp: 10
                        },
                        choices: [
                            { text: '原来如此，我明白了', next: 'default' }
                        ]
                    },
                    
                    heal_magic: {
                        id: 'heal_magic',
                        texts: [
                            '治疗魔法吗？我会一点点...',
                            '水系魔法天生就适合治疗，只要把水元素引导到伤口处，就能加速恢复。',
                            '不过我现在还不太熟练，只能治疗一些小伤。',
                            '我会继续努力的，希望以后能成为一名优秀的治疗师！'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3
                        },
                        choices: [
                            { text: '你一定可以的', next: 'default' }
                        ]
                    },
                    
                    class_news: {
                        id: 'class_news',
                        texts: [
                            '班里吗... 大家都挺好的。',
                            '周敏最近修炼很努力，我们经常一起去图书馆。',
                            '许昭霆还是那么骄傲，不过他人其实不坏。',
                            '穆宁雪虽然看起来冷冷的，但我觉得她人挺好的。',
                            '莫凡... 我有点看不透他，感觉他藏着很多秘密。'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 2
                        },
                        choices: [
                            { text: '原来是这样', next: 'default' }
                        ]
                    },
                    
                    heal_player: {
                        id: 'heal_player',
                        texts: [
                            '你受伤了？让我看看...',
                            '别担心，我帮你治疗一下。',
                            '水系治愈术！',
                            '好了，感觉怎么样？应该好多了吧？',
                            '以后要小心一点哦，受伤了就来找我。'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5,
                            hp: 50
                        },
                        choices: [
                            { text: '谢谢你，何雨！', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 穆卓云（穆家家主）
        mu_zhuoyun: {
            id: 'mu_zhuoyun',
            name: '穆卓云',
            title: '穆氏家族家主',
            description: '博城穆氏家族的家主，冰系高阶法师，实力强大，性格威严。',
            elements: ['ice'],
            level: 15,
            maxHp: 800,
            maxMp: 400,
            attack: 60,
            defense: 40,
            speed: 18,
            skills: ['basic_attack', 'ice_spike', 'ice_shield'],
            spriteColor: '#88ccff',
            isNPC: true,
            location: 'mu_manor',
            
            // 性格
            personality: {
                brave: 0.8,
                kind: 0.3,
                honest: 0.6,
                impulsive: 0.2,
                loyal: 0.7,
                arrogant: 0.9,
                greedy: 0.5,
                curious: 0.3
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: false,
                canBeMentor: true,
                canBeRival: true
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 5,
                minReputation: { mu_family: 10 }
            },
            
            // 初始关系
            initialRelationships: {
                mu_ningxue: { opinion: 50, trust: 40, type: 'acquaintance', label: '侄女' },
                mu_he: { opinion: 60, trust: 65, type: 'friend', label: '弟弟' },
                xiao_principal: { opinion: 40, trust: 35, type: 'acquaintance', label: '校长' },
                magic_association_chairman: { opinion: 45, trust: 40, type: 'acquaintance', label: '会长' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '嗯？你是谁？找我有什么事？',
                            '年轻人，有话直说。',
                            '穆家不是什么人都能随便进的。'
                        ],
                        mood: 'arrogant',
                        choices: [
                            { text: '晚辈冒昧打扰了', next: 'polite_greeting', condition: { minOpinion: 0 } },
                            { text: '我想了解一下穆氏家族', next: 'about_mu_family', condition: { minOpinion: 10 } },
                            { text: '关于穆宁雪...', next: 'about_mu_ningxue', condition: { minOpinion: 20 } },
                            { text: '听说最近山里不太平', next: 'demon_warning', condition: { minDay: 30, minOpinion: 15 } },
                            { text: '打扰了，告辞', next: null, action: 'close' }
                        ]
                    },
                    
                    polite_greeting: {
                        id: 'polite_greeting',
                        texts: [
                            '哦？还算懂礼貌。',
                            '你是天澜魔法高中的学生吧？叫什么名字？',
                            '嗯，年轻人，好好修炼，不要浪费了你的天赋。'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 3
                        },
                        choices: [
                            { text: '多谢家主指点', next: 'default' }
                        ]
                    },
                    
                    about_mu_family: {
                        id: 'about_mu_family',
                        texts: [
                            '穆氏家族？哼，我们穆家可是博城的老牌家族，传承了几百年。',
                            '我们穆家以冰系魔法闻名，祖上出过好几位高阶法师。',
                            '在博城，穆家说一不二，知道吗？',
                            '不过... 最近家族里也有些不太平啊...'
                        ],
                        effects: {
                            opinion: 1,
                            familiarity: 5,
                            giveInfo: 'mu_family_intro'
                        },
                        choices: [
                            { text: '穆家真厉害', next: 'default' },
                            { text: '什么不太平？', next: 'mu_family_trouble', condition: { minOpinion: 30 } }
                        ]
                    },
                    
                    mu_family_trouble: {
                        id: 'mu_family_trouble',
                        texts: [
                            '哼，还不是那些旁支的事...',
                            '家族大了，什么人都有，总有些不安分的。',
                            '不过你放心，有我在，穆家乱不了。',
                            '年轻人，这些事不是你该操心的，好好修炼去吧。'
                        ],
                        effects: {
                            opinion: -1,
                            familiarity: 3
                        },
                        choices: [
                            { text: '是，晚辈明白', next: 'default' }
                        ]
                    },
                    
                    about_mu_ningxue: {
                        id: 'about_mu_ningxue',
                        texts: [
                            '宁雪？她是我大哥的女儿，天赋很好，是我们穆家这一代最出色的孩子。',
                            '冰系天赋极佳，小小年纪就已经初阶圆满了，将来必成大器。',
                            '就是性格太冷了点，像她母亲...',
                            '你问这个干什么？难道你对宁雪... 哼，劝你死了这条心，宁雪不是你能配得上的。'
                        ],
                        effects: {
                            opinion: -3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '晚辈不敢，只是好奇', next: 'default' }
                        ]
                    },
                    
                    demon_warning: {
                        id: 'demon_warning',
                        texts: [
                            '山里的事？哼，我早就知道了。',
                            '那些妖魔最近确实有点异常，活动越来越频繁了。',
                            '不过我们穆家有护族大阵，那些妖魔还不敢来招惹我们。',
                            '倒是你们这些年轻人，给我老实点，别往山里乱跑，知道吗？',
                            '真要是出了什么事，穆家可顾不上你们这些外人。'
                        ],
                        effects: {
                            opinion: 2,
                            giveInfo: 'demon_warning_1'
                        },
                        condition: {
                            minDay: 30
                        },
                        choices: [
                            { text: '多谢家主提醒', next: 'default' }
                        ]
                    }
                }
            }
        },
        
        // 穆贺（黑教廷卧底）
        mu_he: {
            id: 'mu_he',
            name: '穆贺',
            title: '穆家执事',
            description: '穆卓云的弟弟，穆家的执事，表面上温文尔雅，实际上是黑教廷的卧底。',
            elements: ['dark', 'ice'],
            level: 12,
            maxHp: 600,
            maxMp: 350,
            attack: 45,
            defense: 25,
            speed: 16,
            skills: ['basic_attack', 'dark_bolt', 'ice_spike', 'ice_shield'],
            spriteColor: '#444466',
            isNPC: true,
            location: 'mu_manor',
            
            // 性格（表面）
            personality: {
                brave: 0.6,
                kind: 0.4,
                honest: 0.2,
                impulsive: 0.3,
                loyal: 0.3,
                arrogant: 0.5,
                greedy: 0.7,
                curious: 0.6
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: false,
                canBeMentor: false,
                canBeRival: true
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 4,
                minReputation: { mu_family: 5 }
            },
            
            // 初始关系
            initialRelationships: {
                mu_zhuoyun: { opinion: 60, trust: 65, type: 'friend', label: '哥哥' },
                mu_ningxue: { opinion: 30, trust: 20, type: 'acquaintance', label: '侄女' },
                black_church_blue_deacon: { opinion: 80, trust: 85, type: 'friend', label: '同谋' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '哦？你是来找谁的？',
                            '年轻人，有什么事吗？',
                            '我是穆家的执事穆贺，有什么可以帮你的？'
                        ],
                        mood: 'polite',
                        choices: [
                            { text: '穆执事您好', next: 'polite_greeting', condition: { minOpinion: 0 } },
                            { text: '我想了解一下穆家', next: 'about_mu_family', condition: { minOpinion: 10 } },
                            { text: '听说最近山里不太平', next: 'about_demons', condition: { minDay: 25, minOpinion: 15 } },
                            { text: '（试探）关于黑教廷...', next: 'about_black_church', condition: { minDay: 35, minOpinion: 25, hasInfo: 'black_church_intel' } },
                            { text: '打扰了，告辞', next: null, action: 'close' }
                        ]
                    },
                    
                    polite_greeting: {
                        id: 'polite_greeting',
                        texts: [
                            '嗯，还算懂礼貌。你是天澜魔法高中的学生吧？',
                            '年轻人，好好修炼，将来会有出息的。',
                            '穆家欢迎有天赋的年轻人。'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 2
                        },
                        choices: [
                            { text: '多谢穆执事夸奖', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_mu_family: {
                        id: 'about_mu_family',
                        texts: [
                            '穆家是博城的老牌家族，传承了几百年，以冰系魔法闻名。',
                            '穆家在博城势力很大，不是什么人都能随便进来的。',
                            '你问这些做什么？难道想加入穆家？'
                        ],
                        effects: {
                            familiarity: 3
                        },
                        choices: [
                            { text: '只是好奇问问', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_demons: {
                        id: 'about_demons',
                        texts: [
                            '山里的事...我也听说了一些。确实不太太平啊。',
                            '这种事情，自然有猎魔者公会和魔法协会去管，我们这些人就别操心了。',
                            '年轻人，管好自己就行了，别管那么多闲事。'
                        ],
                        effects: {
                            opinion: -1
                        },
                        choices: [
                            { text: '穆执事说得是', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_black_church: {
                        id: 'about_black_church',
                        texts: [
                            '黑教廷？那是什么东西？我没听说过。',
                            '年轻人，不要听信那些谣言，什么黑教廷，都是骗人的。',
                            '...你怎么知道这些的？你调查过我？'
                        ],
                        effects: {
                            opinion: -5,
                            giveInfo: 'black_church_intel'
                        },
                        choices: [
                            { text: '我只是随便问问', next: 'default', action: 'back' },
                            { text: '穆执事，你是不是知道些什么？', next: 'suspicious', condition: { minOpinion: -10 } }
                        ]
                    },
                    
                    suspicious: {
                        id: 'suspicious',
                        texts: [
                            '哼，年轻人，有些事情，知道太多对你没好处。',
                            '我劝你，最好把今天的话都忘掉，就当什么都没发生过。',
                            '...不然的话，后果自负。'
                        ],
                        effects: {
                            opinion: -10,
                            giveInfo: 'black_church_clue'
                        },
                        choices: [
                            { text: '（赶紧离开）', next: null, action: 'close' },
                            { text: '你果然是黑教廷的人！', next: 'reveal', condition: { minLevel: 8, hasInfo: 'black_church_intel' } }
                        ]
                    },
                    
                    reveal: {
                        id: 'reveal',
                        texts: [
                            '...既然你都知道了，那我就不装了。',
                            '没错，我就是黑教廷的人。可惜啊，你知道得太晚了。',
                            '博城的灾难，很快就要开始了...而你，什么也阻止不了。'
                        ],
                        effects: {
                            opinion: -30,
                            giveInfo: 'black_church_intel',
                            setFlag: 'mu_he_revealed'
                        },
                        choices: [
                            { text: '我要阻止你们！', next: 'fight', condition: { minLevel: 10 } },
                            { text: '（先撤退，从长计议）', next: null, action: 'close' }
                        ]
                    },
                    
                    fight: {
                        id: 'fight',
                        texts: [
                            '阻止我们？就凭你？',
                            '哼，不知天高地厚的小子，让我来教训教训你！',
                            '记住，下辈子别这么多管闲事！'
                        ],
                        action: 'battle',
                        battleEnemy: 'black_church_blue_deacon',
                        choices: []
                    }
                }
            }
        },
        
        // 猎魔者公会接待员
        hunter_receptionist: {
            id: 'hunter_receptionist',
            name: '小雨',
            title: '猎魔者公会接待员',
            description: '猎魔者公会的接待员，负责登记任务和管理会员。性格温柔，做事认真。',
            elements: ['water'],
            level: 5,
            maxHp: 100,
            maxMp: 100,
            attack: 8,
            defense: 8,
            speed: 10,
            skills: ['basic_attack', 'water_heal'],
            spriteColor: '#88ddff',
            isNPC: true,
            location: 'city_street',
            
            // 性格
            personality: {
                brave: 0.5,
                kind: 0.9,
                honest: 0.9,
                impulsive: 0.2,
                loyal: 0.8,
                arrogant: 0.1,
                greedy: 0.2,
                curious: 0.7
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: true,
                canBeMentor: false,
                canBeRival: false
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 2
            },
            
            // 初始关系
            initialRelationships: {
                hunter_li: { opinion: 60, trust: 50, type: 'friend', label: '前辈' },
                magic_association_chairman: { opinion: 40, trust: 35, type: 'acquaintance', label: '会长' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '你好，欢迎来到猎魔者公会！',
                            '请问有什么可以帮你的吗？',
                            '是来接任务的，还是来买东西的？'
                        ],
                        mood: 'friendly',
                        choices: [
                            { text: '我想看看公会商店', next: 'shop', condition: { minReputation: { hunter_guild: 0 } } },
                            { text: '有什么任务可以接吗？', next: 'quests', condition: { minLevel: 3 } },
                            { text: '请问猎魔者公会是什么？', next: 'about_guild', condition: { minOpinion: 0 } },
                            { text: '你叫什么名字？', next: 'intro', condition: { minOpinion: 10 } },
                            { text: '打扰了，再见', next: null, action: 'close' }
                        ]
                    },
                    
                    shop: {
                        id: 'shop',
                        texts: [
                            '好的，公会商店在这里，请随便看！',
                            '我们这里有很多猎魔专用的装备和药水哦。',
                            '会员还可以享受折扣呢！'
                        ],
                        action: 'shop',
                        shopId: 'hunter_shop',
                        choices: [
                            { text: '谢谢', next: 'default', action: 'back' }
                        ]
                    },
                    
                    quests: {
                        id: 'quests',
                        texts: [
                            '最近的任务有很多哦，你想接哪一类的？',
                            '猎魔任务的奖励都很丰厚，不过也很危险。',
                            '一定要小心安全哦！'
                        ],
                        effects: {
                            opinion: 2,
                            familiarity: 2
                        },
                        choices: [
                            { text: '我去找老李问问', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_guild: {
                        id: 'about_guild',
                        texts: [
                            '猎魔者公会是专门负责猎魔任务的组织哦。',
                            '我们接受各种猎魔委托，从清除低级妖魔到调查异常事件都有。',
                            '加入公会的话，接任务可以获得更多奖励，还能享受商店折扣呢！'
                        ],
                        effects: {
                            familiarity: 3
                        },
                        choices: [
                            { text: '原来如此', next: 'default', action: 'back' }
                        ]
                    },
                    
                    intro: {
                        id: 'intro',
                        texts: [
                            '我叫小雨，是公会的接待员。',
                            '我在这里工作已经两年了，每天都能见到各种各样的猎人。',
                            '你呢？你叫什么名字？是新来的猎人吗？'
                        ],
                        effects: {
                            opinion: 3,
                            familiarity: 5
                        },
                        choices: [
                            { text: '我叫...（自我介绍）', next: 'chat', condition: { minOpinion: 20 } },
                            { text: '我只是个普通学生', next: 'default', action: 'back' }
                        ]
                    },
                    
                    chat: {
                        id: 'chat',
                        texts: [
                            '很高兴认识你！',
                            '以后常来公会玩哦，我给你打折！',
                            '有什么不懂的都可以问我。'
                        ],
                        effects: {
                            opinion: 5,
                            familiarity: 5
                        },
                        choices: [
                            { text: '好的，谢谢', next: 'default', action: 'back' }
                        ]
                    }
                }
            }
        },
        
        // 穆家管家
        mu_butler: {
            id: 'mu_butler',
            name: '福伯',
            title: '穆家管家',
            description: '穆家的老管家，在穆家工作了几十年，忠心耿耿，做事一丝不苟。',
            elements: ['ice'],
            level: 10,
            maxHp: 300,
            maxMp: 200,
            attack: 25,
            defense: 20,
            speed: 10,
            skills: ['basic_attack', 'ice_spike', 'ice_shield'],
            spriteColor: '#aaddff',
            isNPC: true,
            location: 'mu_manor',
            
            // 性格
            personality: {
                brave: 0.6,
                kind: 0.7,
                honest: 0.95,
                impulsive: 0.1,
                loyal: 0.95,
                arrogant: 0.3,
                greedy: 0.1,
                curious: 0.4
            },
            
            // 关系上限
            relationshipCaps: {
                canRomance: false,
                canBeMentor: false,
                canBeRival: false
            },
            
            // 对话条件
            dialogueRequirements: {
                minLevel: 4,
                minReputation: { mu_family: 5 }
            },
            
            // 初始关系
            initialRelationships: {
                mu_zhuoyun: { opinion: 90, trust: 95, type: 'best_friend', label: '家主' },
                mu_he: { opinion: 60, trust: 50, type: 'friend', label: '二老爷' },
                mu_ningxue: { opinion: 80, trust: 75, type: 'close_friend', label: '大小姐' }
            },
            
            // 对话树
            dialogueTree: {
                startNode: 'default',
                nodes: {
                    default: {
                        id: 'default',
                        texts: [
                            '这位客人，请问有什么事吗？',
                            '我是穆家的管家福伯，有什么可以帮您的？',
                            '穆家欢迎有身份的客人。'
                        ],
                        mood: 'polite',
                        choices: [
                            { text: '我想看看穆家的宝库', next: 'shop', condition: { minReputation: { mu_family: 10 } } },
                            { text: '请问穆家主在吗？', next: 'about_master', condition: { minOpinion: 10 } },
                            { text: '关于穆宁雪小姐...', next: 'about_ningxue', condition: { minOpinion: 20 } },
                            { text: '听说最近山里不太平', next: 'about_demons', condition: { minDay: 30, minOpinion: 15 } },
                            { text: '打扰了，告辞', next: null, action: 'close' }
                        ]
                    },
                    
                    shop: {
                        id: 'shop',
                        texts: [
                            '好的，客人请随我来。',
                            '穆家宝库收藏了不少好东西，客人请慢慢看。',
                            '这些都是穆家多年的珍藏，品质有保证。'
                        ],
                        action: 'shop',
                        shopId: 'mu_family_shop',
                        choices: [
                            { text: '多谢', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_master: {
                        id: 'about_master',
                        texts: [
                            '家主大人平时很忙，一般不见外客。',
                            '如果您有什么事，可以先跟我说，我会转达给家主。',
                            '家主大人是穆家的顶梁柱，很了不起的。'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '明白了', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_ningxue: {
                        id: 'about_ningxue',
                        texts: [
                            '宁雪小姐是穆家的天才，从小就很厉害。',
                            '小姐性格比较冷淡，但人其实很好的。',
                            '...您问这个做什么？'
                        ],
                        effects: {
                            opinion: -1,
                            familiarity: 3
                        },
                        choices: [
                            { text: '只是好奇问问', next: 'default', action: 'back' }
                        ]
                    },
                    
                    about_demons: {
                        id: 'about_demons',
                        texts: [
                            '山里的事...我也听说了一些。',
                            '穆家已经加强了防备，应该不会有问题的。',
                            '客人也请多注意安全。'
                        ],
                        effects: {
                            familiarity: 2
                        },
                        choices: [
                            { text: '多谢关心', next: 'default', action: 'back' }
                        ]
                    }
                }
            }
        }
    },

    // ========== 地点 ==========
    locations: {
        tianlan_school: {
            id: 'tianlan_school',
            name: '天澜魔法高中',
            description: '博城最好的公立魔法高中，培养了无数优秀的法师。',
            backgroundColor: '#2a3a5a',
            unlocked: true,
            // 课程表（0=周日, 1=周一, ..., 6=周六）
            classSchedule: {
                // 上午课程（8:00-12:00）
                morning: {
                    1: { subject: 'magic_theory', name: '魔法理论', teacher: 'xue_musheng', exp: 25, mpCost: 5 },
                    2: { subject: 'star_path', name: '星轨课', teacher: 'tang_yue', exp: 30, mpCost: 10 },
                    3: { subject: 'demonology', name: '妖魔课', teacher: 'wei_suo', exp: 20, mpCost: 0 },
                    4: { subject: 'magic_theory', name: '魔法理论', teacher: 'xue_musheng', exp: 25, mpCost: 5 },
                    5: { subject: 'star_path', name: '星轨课', teacher: 'tang_yue', exp: 30, mpCost: 10 },
                    6: null, // 周六上午自习
                    0: null  // 周日休息
                },
                // 下午课程（14:00-18:00）
                afternoon: {
                    1: { subject: 'practice', name: '实践课', teacher: 'tang_yue', exp: 40, hpCost: 10, mpCost: 15, injuryChance: 0.2 },
                    2: { subject: 'magic_equipment', name: '魔器课', teacher: 'lao_li', exp: 20, mpCost: 0 },
                    3: { subject: 'materials', name: '材料课', teacher: 'lao_li', exp: 20, mpCost: 0 },
                    4: { subject: 'practice', name: '实践课', teacher: 'tang_yue', exp: 40, hpCost: 10, mpCost: 15, injuryChance: 0.2 },
                    5: { subject: 'demonology', name: '妖魔课', teacher: 'wei_suo', exp: 20, mpCost: 0 },
                    6: null, // 周六下午自由
                    0: null  // 周日自由
                }
            },
            actions: [
                {
                    id: 'study',
                    name: '上课学习',
                    description: '参加当前时段的课程，获得经验和知识',
                    icon: '📚',
                    timeCost: 4,
                    staminaCost: 20,
                    effects: {
                        exp: 25,
                        mp: -5
                    },
                    eventChance: 0.3,
                    events: ['event_breakthrough', 'event_classmate_chat', 'event_mo_fan_scolded', 'event_zhao_manyan_showoff', 'event_mu_ningxue_gossip', 'event_zhang_xiaohou_find', 'event_zhou_min_question', 'event_xu_zhaoting_showoff'],
                    // 标记为课程行动，会根据课程表动态调整
                    isClassAction: true
                },
                {
                    id: 'train',
                    name: '修炼魔法',
                    description: '实战修炼魔法（2小时），获得经验，有概率突破或失败受伤',
                    icon: '✨',
                    timeCost: 2,
                    staminaCost: 25,
                    effects: {
                        exp: 25,
                        hp: -5,
                        mp: -15
                    },
                    eventChance: 0.2,
                    events: ['event_breakthrough', 'event_training_fail']
                },
                {
                    id: 'meditate',
                    name: '冥修',
                    description: '静心冥修（2小时），恢复MP，小概率突破',
                    icon: '🧘',
                    timeCost: 2,
                    staminaCost: 10,
                    effects: {
                        exp: 10,
                        mp: 30
                    },
                    eventChance: 0.15,
                    events: ['event_breakthrough']
                },
                {
                    id: 'rest',
                    name: '休息',
                    description: '在宿舍休息一会儿（1小时），恢复 HP、MP 和部分体力',
                    icon: '😴',
                    timeCost: 1,
                    staminaCost: 0,
                    effects: {
                        hp: 20,
                        mp: 15,
                        stamina: 20
                    }
                },
                {
                    id: 'sleep',
                    name: '睡觉',
                    description: '好好睡一觉（到第二天早上），恢复体力，22点前睡觉效果最好',
                    icon: '🌙',
                    timeCost: 8,
                    staminaCost: 0,
                    effects: {
                        hp: 50,
                        mp: 50,
                        stamina: 100
                    }
                },
                {
                    id: 'library',
                    name: '图书馆',
                    description: '去图书馆看书（2小时），学习魔法知识，有概率领悟新技能或获得情报',
                    icon: '📖',
                    timeCost: 2,
                    staminaCost: 10,
                    effects: {
                        exp: 15,
                        mp: -5
                    },
                    eventChance: 0.4,
                    events: ['event_library_learn', 'event_library_skill', 'event_library_info', 'event_library_meet']
                },
                {
                    id: 'shop',
                    name: '小卖部',
                    description: '学校的小卖部，购买药水和基础物品',
                    icon: '🛒',
                    timeCost: 1,
                    staminaCost: 5,
                    shopId: 'school_shop'
                },
                {
                    id: 'talk',
                    name: '找人聊天',
                    description: '和学校里的 NPC 对话，可能接任务或获得信息',
                    icon: '💬',
                    timeCost: 1,
                    staminaCost: 5,
                    npcs: ['mo_fan', 'zhang_xiaohou', 'zhao_manyan', 'mu_ningxue', 'tang_yue', 'xiao_principal', 'xue_musheng', 'zhou_min', 'xu_zhaoting', 'he_yu']
                }
            ],
            connectedLocations: ['city_street'],
            enemies: [],
            enemyRate: 0
        },

        city_street: {
            id: 'city_street',
            name: '博城市街',
            description: '博城的主要街道，人来人往，有各种商店。',
            backgroundColor: '#3a2a4a',
            unlocked: true,
            actions: [
                {
                    id: 'explore',
                    name: '逛街',
                    description: '在街上闲逛，有概率捡到钱、遇到神秘商人或商店打折',
                    icon: '🚶',
                    timeCost: 2,
                    staminaCost: 15,
                    effects: {
                        exp: 5
                    },
                    eventChance: 0.3,
                    events: ['event_find_money', 'event_meet_stranger', 'event_shop_discount', 'event_street_performer', 'event_pickpocket', 'event_drunk_hunter']
                },
                {
                    id: 'shop',
                    name: '魔法商店',
                    description: '专业魔法商店，购买装备、药水和材料',
                    icon: '🏪',
                    timeCost: 1,
                    staminaCost: 10,
                    shopId: 'magic_shop'
                },
                {
                    id: 'tavern',
                    name: '酒馆',
                    description: '猎者聚集的酒馆，有概率接到猎魔任务或发生冲突',
                    icon: '🍺',
                    timeCost: 1,
                    staminaCost: 15,
                    eventChance: 0.4,
                    events: ['event_tavern_quest', 'event_drunk_fight']
                },
                {
                    id: 'talk',
                    name: '找人聊天',
                    description: '和街上的 NPC 对话，可能接任务或获得信息',
                    icon: '💬',
                    timeCost: 1,
                    staminaCost: 10,
                    npcs: ['hunter_li', 'book_shop_owner', 'magic_association_chairman', 'mysterious_mage', 'hunter_receptionist']
                }
            ],
            connectedLocations: ['tianlan_school', 'xuefeng_mountain'],
            enemies: [],
            enemyRate: 0
        },

        xuefeng_mountain: {
            id: 'xuefeng_mountain',
            name: '雪峰山',
            description: '博城郊外的山脉，有妖魔出没，是猎者们常去的地方。',
            backgroundColor: '#1a3a4a',
            unlocked: true,
            actions: [
                {
                    id: 'explore',
                    name: '探索',
                    description: '在山中探索，中等概率遇敌，可能发现草药、宝箱或中陷阱',
                    icon: '🔍',
                    timeCost: 3,
                    staminaCost: 25,
                    effects: {
                        exp: 10,
                        hp: -5,
                        mp: -10
                    },
                    eventChance: 0.3,
                    events: ['event_find_herb', 'event_find_treasure', 'event_trap', 'event_find_demon_tracks', 'event_find_demon_clue', 'event_meet_hunter', 'event_beautiful_view', 'event_rain']
                },
                {
                    id: 'hunt',
                    name: '猎魔',
                    description: '主动寻找妖魔战斗，高概率遇敌，战斗胜利获得经验和金币',
                    icon: '⚔️',
                    timeCost: 4,
                    staminaCost: 40,
                    effects: {
                        hp: -15,
                        mp: -20
                    }
                },
                {
                    id: 'gather',
                    name: '采集草药',
                    description: '采集魔法草药，低概率遇敌，主要获得草药材料',
                    icon: '🌿',
                    timeCost: 2,
                    staminaCost: 20,
                    eventChance: 0.4,
                    events: ['event_find_herb', 'event_find_herb', 'event_find_rare_herb']
                }
            ],
            connectedLocations: ['city_street'],
            enemies: ['demon_wolf', 'shadow_creature', 'rock_monster', 'wind_bird', 'water_spider', 'fire_rat', 'gold_ant', 'light_moth', 'thunder_beast', 'ice_toad', 'shadow_snake'],
            enemyRate: 0.4
        },
        
        // 雪峰山深处 - 高级区域
        xuefeng_deep: {
            id: 'xuefeng_deep',
            name: '雪峰山深处',
            description: '雪峰山的深处，妖魔横行，危险重重，但也蕴藏着珍贵的资源。',
            backgroundColor: '#0a1a2a',
            unlocked: false,
            unlockCondition: {
                minLevel: 5,
                hint: '需要等级 5 才能进入'
            },
            actions: [
                {
                    id: 'deep_explore',
                    name: '深入探索',
                    description: '在深山探索，高概率遇强敌，可能发现稀有宝物或珍贵草药',
                    icon: '🏔️',
                    timeCost: 4,
                    staminaCost: 35,
                    effects: {
                        exp: 20,
                        hp: -15,
                        mp: -15
                    },
                    eventChance: 0.4,
                    events: ['event_find_rare_herb', 'event_find_treasure', 'event_trap', 'event_find_demon_clue']
                },
                {
                    id: 'deep_hunt',
                    name: '深度猎魔',
                    description: '在深山猎杀强大的妖魔，极高概率遇敌，战斗胜利获得丰厚奖励',
                    icon: '⚔️',
                    timeCost: 5,
                    staminaCost: 50,
                    effects: {
                        hp: -25,
                        mp: -30
                    }
                },
                {
                    id: 'rare_gather',
                    name: '采集珍稀草药',
                    description: '在深山采集珍稀草药，中等概率遇敌，主要获得稀有材料',
                    icon: '🌿',
                    timeCost: 3,
                    staminaCost: 30,
                    eventChance: 0.5,
                    events: ['event_find_rare_herb', 'event_find_rare_herb', 'event_find_herb']
                }
            ],
            connectedLocations: ['xuefeng_mountain'],
            enemies: ['thunder_beast', 'ice_toad', 'shadow_snake', 'demon_wolf', 'rock_monster', 'giant_eye_rat', 'bone_spike_zheng'],
            enemyRate: 0.6,
            enemyLevelBonus: 2,
            dropRateBonus: 1.5,
            expBonus: 1.5,
            // 战将级妖魔出现概率（需要等级够高才会遇到）
            warriorDemonChance: 0.2,
            warriorDemonMinLevel: 6
        },
        
        // 莫凡家
        mo_fan_house: {
            id: 'mo_fan_house',
            name: '莫凡家',
            description: '围绕半城山而建的住宅区最角落，矮矮一小栋，一层半高，外漆斑驳露出红砖，周围堆着杂物。街坊邻居都是三层半的装修新房，这里显得格外寒酸老旧。但家徒四壁的屋子里，却有着最温暖的亲情。',
            backgroundColor: '#3a2a1a',
            unlocked: false,
            unlockCondition: {
                minOpinion: { npcId: 'mo_fan', value: 20 },
                hint: '需要和莫凡关系不错才能去他家'
            },
            actions: [
                {
                    id: 'visit_mo_fan',
                    name: '找莫凡聊天',
                    description: '去莫凡家找他聊天，可能会听到一些秘密',
                    icon: '🏠',
                    timeCost: 2,
                    staminaCost: 10,
                    effects: {
                        npcOpinion: { npcId: 'mo_fan', value: 3 }
                    },
                    eventChance: 0.3,
                    events: ['event_mo_fan_secret']
                },
                {
                    id: 'visit_mo_jiaxing',
                    name: '和莫叔叔聊聊',
                    description: '和莫凡的父亲莫家兴聊天，他是个憨厚的中年人',
                    icon: '👨',
                    timeCost: 1,
                    staminaCost: 5,
                    effects: {
                        npcOpinion: { npcId: 'mo_jiaxing', value: 5 }
                    }
                },
                {
                    id: 'rest_at_mo_fan',
                    name: '在莫凡家休息',
                    description: '在莫凡家休息一下，恢复体力和精神',
                    icon: '😴',
                    timeCost: 3,
                    staminaCost: -40,
                    effects: {
                        hp: 30,
                        mp: 20
                    }
                }
            ],
            connectedLocations: ['tianlan_school', 'bo_city', 'mu_manor'],
            npcs: ['mo_fan', 'mo_jiaxing', 'zhang_xiaohou'],
            npcRate: 0.6
        },
        
        // 穆家庄园
        mu_manor: {
            id: 'mu_manor',
            name: '穆家庄园',
            description: '博城穆氏家族的庄园，富丽堂皇，气势恢宏。',
            backgroundColor: '#2a2a4a',
            unlocked: false,
            unlockCondition: {
                minLevel: 3,
                hint: '需要等级 3 才能进入穆家庄园'
            },
            actions: [
                {
                    id: 'visit_manor',
                    name: '参观庄园',
                    description: '参观穆家庄园，感受一下大家族的气派',
                    icon: '🏛️',
                    timeCost: 2,
                    staminaCost: 10,
                    effects: {
                        exp: 5
                    },
                    eventChance: 0.2,
                    events: ['event_mu_family_news']
                },
                {
                    id: 'find_mu_ningxue',
                    name: '找穆宁雪',
                    description: '去穆家庄园找穆宁雪，可能会遇到她',
                    icon: '❄️',
                    timeCost: 2,
                    staminaCost: 10,
                    condition: {
                        minOpinion: { npcId: 'mu_ningxue', value: 15 }
                    },
                    effects: {
                        npcOpinion: { npcId: 'mu_ningxue', value: 2 }
                    }
                }
            ],
            connectedLocations: ['bo_city'],
            npcs: ['mu_ningxue', 'mu_zhuoyun', 'mu_he', 'mu_butler'],
            npcRate: 0.3
        },
        
        // 博城北门
        bo_north_gate: {
            id: 'bo_north_gate',
            name: '博城北门',
            description: '博城的北城门，通往外面的世界。城门守卫森严，平时有士兵把守。',
            backgroundColor: '#3a4a3a',
            unlocked: false,
            unlockCondition: {
                minLevel: 5,
                hint: '需要等级 5 才能去北门'
            },
            actions: [
                {
                    id: 'watch_gate',
                    name: '查看城门',
                    description: '看看城门的情况，了解一下外面的消息',
                    icon: '🏯',
                    timeCost: 1,
                    staminaCost: 5,
                    effects: {
                        exp: 3
                    },
                    eventChance: 0.3,
                    events: ['event_gate_news', 'event_guard_chat']
                },
                {
                    id: 'patrol',
                    name: '帮忙巡逻',
                    description: '帮守卫巡逻，获得一些报酬和声望',
                    icon: '🛡️',
                    timeCost: 3,
                    staminaCost: 25,
                    condition: {
                        minLevel: 6
                    },
                    effects: {
                        exp: 20,
                        gold: 30
                    },
                    eventChance: 0.2,
                    events: ['event_patrol_find', 'event_patrol_attack']
                }
            ],
            connectedLocations: ['city_street', 'xuefeng_mountain'],
            npcs: [],
            npcRate: 0.1,
            enemies: ['demon_wolf', 'shadow_creature'],
            enemyRate: 0.05
        }
    },

    // ========== 道具物品 ==========
    items: {
        // 消耗品
        health_potion: {
            id: 'health_potion',
            name: '治愈药水',
            description: '恢复 50 点生命值',
            type: 'consumable',
            icon: '🧪',
            price: 30,
            stackable: true,
            maxStack: 99,
            usableInBattle: true,
            usableOutOfBattle: true,
            effects: {
                hp: 50
            }
        },
        mana_potion: {
            id: 'mana_potion',
            name: '魔法药水',
            description: '恢复 30 点魔法值',
            type: 'consumable',
            icon: '💧',
            price: 40,
            stackable: true,
            maxStack: 99,
            usableInBattle: true,
            usableOutOfBattle: true,
            effects: {
                mp: 30
            }
        },
        super_health_potion: {
            id: 'super_health_potion',
            name: '高级治愈药水',
            description: '恢复 150 点生命值',
            type: 'consumable',
            icon: '🧴',
            price: 100,
            stackable: true,
            maxStack: 99,
            usableInBattle: true,
            usableOutOfBattle: true,
            effects: {
                hp: 150
            }
        },
        magic_stone: {
            id: 'magic_stone',
            name: '魔石',
            description: '蕴含魔法能量的石头，可以卖钱',
            type: 'material',
            icon: '💎',
            price: 20,
            stackable: true,
            maxStack: 99,
            usableInBattle: false,
            usableOutOfBattle: false
        },
        demon_core: {
            id: 'demon_core',
            name: '妖魔精核',
            description: '从妖魔体内取出的精核，很有价值',
            type: 'material',
            icon: '🔮',
            price: 50,
            stackable: true,
            maxStack: 99,
            usableInBattle: false,
            usableOutOfBattle: false
        },
        wolf_fang: {
            id: 'wolf_fang',
            name: '魔狼獠牙',
            description: '从独眼魔狼身上取下的獠牙，锋利坚硬，可用于锻造装备或炼药',
            type: 'material',
            icon: '🦷',
            price: 30,
            stackable: true,
            maxStack: 99,
            usableInBattle: false,
            usableOutOfBattle: false
        },
        magic_herb: {
            id: 'magic_herb',
            name: '魔法草药',
            description: '具有魔法能量的草药',
            type: 'material',
            icon: '🌿',
            price: 15,
            stackable: true,
            maxStack: 99,
            usableInBattle: false,
            usableOutOfBattle: false
        },

        // 装备 - 武器
        basic_staff: {
            id: 'basic_staff',
            name: '基础法杖',
            description: '最基础的法杖，稍微提升魔法伤害',
            type: 'weapon',
            icon: '🪄',
            price: 100,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'weapon',
            equipStats: {
                attack: 5,
                critRate: 0.02
            },
            requiredLevel: 1,
            rarity: '普通'
        },
        flame_staff: {
            id: 'flame_staff',
            name: '烈焰法杖',
            description: '蕴含火焰之力的法杖',
            type: 'weapon',
            icon: '🔥',
            price: 300,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'weapon',
            equipStats: {
                attack: 12,
                critRate: 0.05
            },
            elementBonus: 'fire',
            requiredLevel: 3,
            rarity: '优秀'
        },

        // 装备 - 防具
        basic_robe: {
            id: 'basic_robe',
            name: '魔法长袍',
            description: '基础的魔法长袍，提供一些防护',
            type: 'armor',
            icon: '👘',
            price: 80,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'armor',
            equipStats: {
                defense: 5,
                maxHp: 20
            },
            requiredLevel: 1,
            rarity: '普通'
        },
        leather_armor: {
            id: 'leather_armor',
            name: '皮甲',
            description: '轻便的皮甲，提升防御和速度',
            type: 'armor',
            icon: '🦺',
            price: 200,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'armor',
            equipStats: {
                defense: 10,
                maxHp: 30,
                speed: 3
            },
            requiredLevel: 2,
            rarity: '优秀'
        },

        // 装备 - 饰品
        magic_ring: {
            id: 'magic_ring',
            name: '魔力戒指',
            description: '提升魔法上限的戒指',
            type: 'accessory',
            icon: '💍',
            price: 150,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'accessory',
            equipStats: {
                maxMp: 30,
                spirit: 2
            },
            requiredLevel: 1,
            rarity: '普通'
        },
        speed_boots: {
            id: 'speed_boots',
            name: '疾风靴',
            description: '提升移动速度的靴子',
            type: 'accessory',
            icon: '👢',
            price: 250,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'accessory',
            equipStats: {
                speed: 8,
                hitRate: 0.03
            },
            requiredLevel: 2,
            rarity: '优秀'
        },
        
        // 高级魔力药水
        super_mana_potion: {
            id: 'super_mana_potion',
            name: '高级魔力药水',
            description: '恢复大量MP的高级药水',
            type: 'consumable',
            icon: '💙',
            price: 100,
            stackable: true,
            usableInBattle: true,
            usableOutOfBattle: true,
            effects: {
                mp: 80
            },
            rarity: '稀有'
        },

        // 体力恢复药水
        stamina_potion: {
            id: 'stamina_potion',
            name: '体力药水',
            description: '恢复 40 点体力，适合长时间探索',
            type: 'consumable',
            icon: '⚡',
            price: 35,
            stackable: true,
            maxStack: 99,
            usableInBattle: false,
            usableOutOfBattle: true,
            effects: {
                stamina: 40
            }
        },

        // 全恢复药水
        full_potion: {
            id: 'full_potion',
            name: '万能药水',
            description: '完全恢复HP和MP，珍贵的高级药水',
            type: 'consumable',
            icon: '✨',
            price: 200,
            stackable: true,
            maxStack: 99,
            usableInBattle: true,
            usableOutOfBattle: true,
            effects: {
                hp: 9999,
                mp: 9999
            }
        },
        
        // 猎魔匕首
        hunter_knife: {
            id: 'hunter_knife',
            name: '猎魔匕首',
            description: '猎魔者专用的匕首，对妖魔有额外伤害',
            type: 'weapon',
            icon: '🗡️',
            price: 180,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'weapon',
            equipStats: {
                attack: 12,
                speed: 3,
                critRate: 0.05
            },
            requiredLevel: 3,
            rarity: '优秀'
        },
        
        // 冰系法杖
        ice_staff: {
            id: 'ice_staff',
            name: '寒冰法杖',
            description: '蕴含冰系魔力的法杖，冰系法师的最爱',
            type: 'weapon',
            icon: '❄️',
            price: 500,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'weapon',
            equipStats: {
                attack: 25,
                mp: 30,
                critRate: 0.05
            },
            requiredLevel: 6,
            rarity: '稀有'
        },
        
        // 冰系护甲
        ice_armor: {
            id: 'ice_armor',
            name: '冰蚕护甲',
            description: '用冰蚕丝织成的护甲，轻盈且坚固',
            type: 'armor',
            icon: '🧥',
            price: 600,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'armor',
            equipStats: {
                defense: 20,
                hp: 50,
                mp: 20
            },
            requiredLevel: 6,
            rarity: '稀有'
        },
        
        // 穆家戒指
        mu_family_ring: {
            id: 'mu_family_ring',
            name: '穆家传家戒指',
            description: '穆氏家族的传家戒指，蕴含着强大的冰系魔力',
            type: 'accessory',
            icon: '💍',
            price: 800,
            stackable: false,
            usableInBattle: false,
            usableOutOfBattle: true,
            equipSlot: 'accessory',
            equipStats: {
                attack: 10,
                defense: 8,
                hp: 30,
                mp: 50,
                critRate: 0.05
            },
            requiredLevel: 8,
            rarity: '史诗'
        }
    },

    // ========== 任务 ==========
    quests: {
        quest_intro: {
            id: 'quest_intro',
            name: '初识魔法',
            description: '唐月老师让你去修炼场熟悉一下魔法的使用。',
            giver: 'tang_yue',
            type: 'story',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'tianlan_school',
                    count: 1,
                    description: '在学校修炼一次'
                }
            ],
            rewards: {
                exp: 50,
                gold: 30,
                items: [
                    { itemId: 'health_potion', count: 3 }
                ]
            },
            prerequisites: [],
            nextQuest: 'quest_collect_herbs',
            isMainQuest: true,
            dialogueStart: '你好，新来的同学。作为第一次修炼，先去修炼场感受一下魔法吧。',
            dialogueInProgress: '怎么样，感受到魔法的力量了吗？',
            dialogueComplete: '很好，看来你很有天赋呢！'
        },

        quest_collect_herbs: {
            id: 'quest_collect_herbs',
            name: '采集草药',
            description: '唐月老师需要一些魔法草药，去雪峰山采集5株回来。',
            giver: 'tang_yue',
            type: 'collect',
            objectives: [
                {
                    type: 'collect',
                    itemId: 'magic_herb',
                    count: 5,
                    description: '采集 5 株魔法草药'
                }
            ],
            rewards: {
                exp: 100,
                gold: 80,
                items: [
                    { itemId: 'mana_potion', count: 3 }
                ],
                unlocks: []
            },
            prerequisites: ['quest_intro'],
            nextQuest: 'quest_hunt_demon',
            isMainQuest: true,
            dialogueStart: '我需要一些魔法草药做研究，你能帮我去雪峰山采集一些吗？',
            dialogueInProgress: '草药采得怎么样了？小心山上的妖魔哦。',
            dialogueComplete: '太谢谢你了！这些草药正好够用。'
        },

        quest_hunt_demon: {
            id: 'quest_hunt_demon',
            name: '猎杀妖魔',
            description: '莫凡说雪峰山有一只幽狼兽在作乱，去把它解决掉！',
            giver: 'mo_fan',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'demon_wolf',
                    count: 1,
                    description: '击败 1 只幽狼兽'
                }
            ],
            rewards: {
                exp: 200,
                gold: 150,
                items: [
                    { itemId: 'basic_staff', count: 1 }
                ]
            },
            prerequisites: ['quest_collect_herbs'],
            nextQuest: null,
            isMainQuest: true,
            dialogueStart: '嘿，雪峰山最近有只幽狼兽很嚣张，敢不敢去把它干掉？',
            dialogueInProgress: '怎么样，那只幽狼兽解决了吗？小心点，那家伙可不弱。',
            dialogueComplete: '可以啊你！居然真的干掉了幽狼兽，有点本事！'
        },

        // 支线任务：猎杀狼群
        quest_hunt_wolf_pack: {
            id: 'quest_hunt_wolf_pack',
            name: '猎杀狼群',
            description: '学校附近出现了一群幽狼兽，威胁到了学生的安全。去雪峰山击败 3 只幽狼兽。',
            giver: 'tang_yue',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'demon_wolf',
                    count: 3,
                    description: '击败 3 只幽狼兽'
                }
            ],
            rewards: {
                exp: 300,
                gold: 200,
                items: [
                    { itemId: 'health_potion', count: 5 },
                    { itemId: 'mana_potion', count: 3 }
                ],
                reputation: {
                    tianlan_school: 10
                }
            },
            prerequisites: ['quest_hunt_demon'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '最近雪峰山的幽狼兽越来越多了，已经威胁到学校的安全了。你能帮忙清理一下吗？',
            dialogueInProgress: '狼群清理得怎么样了？一定要注意安全。',
            dialogueComplete: '太感谢你了！学校的安全有保障了。你在学校的声望也提高了。'
        },

        // 支线任务：更多草药
        quest_collect_more_herbs: {
            id: 'quest_collect_more_herbs',
            name: '更多草药',
            description: '唐月老师需要更多的魔法草药做实验。去雪峰山采集 10 株回来。',
            giver: 'tang_yue',
            type: 'collect',
            objectives: [
                {
                    type: 'collect',
                    itemId: 'magic_herb',
                    count: 10,
                    description: '采集 10 株魔法草药'
                }
            ],
            rewards: {
                exp: 250,
                gold: 150,
                items: [
                    { itemId: 'super_health_potion', count: 2 }
                ],
                reputation: {
                    tianlan_school: 5
                }
            },
            prerequisites: ['quest_collect_herbs'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '我的实验还需要更多的魔法草药，你能再帮我采集一些吗？',
            dialogueInProgress: '草药采得怎么样了？慢慢来，不用着急。',
            dialogueComplete: '太好了，这些草药足够我做实验了。谢谢你的帮助！'
        },

        // 支线任务：暗影威胁
        quest_hunt_shadow: {
            id: 'quest_hunt_shadow',
            name: '暗影威胁',
            description: '猎魔者公会发布了任务，雪峰山的暗影怪越来越多了。去击败 2 只暗影怪。',
            giver: 'mo_fan',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'shadow_creature',
                    count: 2,
                    description: '击败 2 只暗影怪'
                }
            ],
            rewards: {
                exp: 280,
                gold: 180,
                items: [
                    { itemId: 'demon_core', count: 3 }
                ],
                reputation: {
                    hunter_guild: 15
                }
            },
            prerequisites: ['quest_hunt_demon'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '听说猎魔者公会最近在悬赏暗影怪，那东西很狡猾，你敢去试试吗？',
            dialogueInProgress: '暗影怪解决了吗？那家伙藏在阴影里，很难对付。',
            dialogueComplete: '厉害啊！暗影怪都被你干掉了，猎魔者公会那边应该会给你记一功。'
        },

        // 支线任务：石怪威胁
        quest_hunt_stone: {
            id: 'quest_hunt_stone',
            name: '石怪威胁',
            description: '雪峰山的石怪越来越多了，挡住了采药人的路。去击败 2 只石怪。',
            giver: 'mo_fan',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'stone_monster',
                    count: 2,
                    description: '击败 2 只石怪'
                }
            ],
            rewards: {
                exp: 350,
                gold: 220,
                items: [
                    { itemId: 'magic_stone', count: 3 }
                ],
                reputation: {
                    hunter_guild: 10
                }
            },
            prerequisites: ['quest_hunt_shadow'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '雪峰山的石怪最近很嚣张，很多采药人都不敢上山了。你能去清理一下吗？',
            dialogueInProgress: '石怪清理得怎么样了？那家伙皮糙肉厚，很难对付。',
            dialogueComplete: '可以啊！石怪都被你干掉了，采药人们又能上山了。猎魔者公会的声望又涨了！'
        },

        // 支线任务：探索雪峰山
        quest_explore_mountain: {
            id: 'quest_explore_mountain',
            name: '探索雪峰山',
            description: '学校需要了解雪峰山的最新情况，去雪峰山探索一下。',
            giver: 'tang_yue',
            type: 'explore',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'snow_peak_mountain',
                    count: 1,
                    description: '到达雪峰山'
                }
            ],
            rewards: {
                exp: 150,
                gold: 80,
                items: [
                    { itemId: 'health_potion', count: 3 }
                ],
                reputation: {
                    tianlan_school: 5
                }
            },
            prerequisites: ['quest_intro'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '学校想了解一下雪峰山的情况，你能去探索一下吗？注意安全。',
            dialogueInProgress: '雪峰山探索得怎么样了？有没有发现什么异常？',
            dialogueComplete: '辛苦了！你带回来的信息很有价值。学校会记住你的贡献的。'
        },

        // 支线任务：雷兽的威胁
        quest_hunt_thunder: {
            id: 'quest_hunt_thunder',
            name: '雷兽的威胁',
            description: '雪峰山出现了雷兽，威力强大，很多猎人都吃亏了。去击败 2 只雷兽。',
            giver: 'hunter_li',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'thunder_beast',
                    count: 2,
                    description: '击败 2 只雷兽'
                }
            ],
            rewards: {
                exp: 400,
                gold: 300,
                items: [
                    { itemId: 'demon_core', count: 5 },
                    { itemId: 'super_health_potion', count: 3 }
                ],
                reputation: {
                    hunter_guild: 20
                }
            },
            prerequisites: ['quest_hunt_stone'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '最近山里出现了雷兽，那家伙厉害得很，好几个猎人都受伤了。你敢去试试吗？',
            dialogueInProgress: '雷兽解决了吗？那家伙的雷电魔法很厉害，小心被麻痹了。',
            dialogueComplete: '厉害啊！雷兽都被你干掉了，你在猎魔者公会的声望可是大涨啊！'
        },

        // 支线任务：书店的请求
        quest_book_shop_request: {
            id: 'quest_book_shop_request',
            name: '书店的请求',
            description: '陈老板需要一些妖魔精核来做研究，去雪峰山收集 5 颗妖魔精核。',
            giver: 'book_shop_owner',
            type: 'collect',
            objectives: [
                {
                    type: 'collect',
                    itemId: 'demon_core',
                    count: 5,
                    description: '收集 5 颗妖魔精核'
                }
            ],
            rewards: {
                exp: 300,
                gold: 250,
                items: [
                    { itemId: 'mana_potion', count: 5 },
                    { itemId: 'super_health_potion', count: 2 }
                ],
                reputation: {
                    tianlan_school: 5
                }
            },
            prerequisites: ['quest_collect_herbs'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '我最近在研究妖魔的生态，需要一些妖魔精核做实验。你能帮我收集一些吗？',
            dialogueInProgress: '妖魔精核收集得怎么样了？慢慢来，不用着急。',
            dialogueComplete: '太好了！这些妖魔精核正好够用。谢谢你的帮助！'
        },

        // 支线任务：魔法协会的委托
        quest_magic_association_request: {
            id: 'quest_magic_association_request',
            name: '魔法协会的委托',
            description: '魔法协会需要调查雪峰山的妖魔异动，去击败 5 只不同种类的妖魔。',
            giver: 'magic_association_chairman',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'demon_wolf',
                    count: 1,
                    description: '击败 1 只幽狼兽'
                },
                {
                    type: 'kill',
                    enemyId: 'shadow_creature',
                    count: 1,
                    description: '击败 1 只暗影怪'
                },
                {
                    type: 'kill',
                    enemyId: 'stone_monster',
                    count: 1,
                    description: '击败 1 只石怪'
                },
                {
                    type: 'kill',
                    enemyId: 'thunder_beast',
                    count: 1,
                    description: '击败 1 只雷兽'
                },
                {
                    type: 'kill',
                    enemyId: 'wind_bird',
                    count: 1,
                    description: '击败 1 只风翼鸟'
                }
            ],
            rewards: {
                exp: 600,
                gold: 500,
                items: [
                    { itemId: 'super_health_potion', count: 5 },
                    { itemId: 'mana_potion', count: 5 },
                    { itemId: 'magic_stone', count: 10 }
                ],
                reputation: {
                    magic_association: 20
                }
            },
            prerequisites: ['quest_hunt_thunder'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '魔法协会需要调查雪峰山的妖魔异动，你能帮我们收集一些样本吗？',
            dialogueInProgress: '调查得怎么样了？一定要注意安全，这次的任务可不简单。',
            dialogueComplete: '做得好！你带回来的信息很有价值。魔法协会会记住你的贡献的。'
        },

        // 支线任务：神秘人的考验
        quest_mysterious_test: {
            id: 'quest_mysterious_test',
            name: '神秘人的考验',
            description: '那个神秘的流浪法师说要考验一下你的实力，去雪峰山击败 3 只暗影怪。',
            giver: 'mysterious_mage',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'shadow_creature',
                    count: 3,
                    description: '击败 3 只暗影怪'
                }
            ],
            rewards: {
                exp: 350,
                gold: 100,
                items: [
                    { itemId: 'demon_core', count: 5 }
                ],
                reputation: {}
            },
            prerequisites: ['quest_hunt_shadow'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '...想知道更多秘密？先证明一下你的实力吧。去击败 3 只暗影怪。',
            dialogueInProgress: '...怎么样，暗影怪解决了吗？',
            dialogueComplete: '...不错，有点意思。我可以告诉你更多了。'
        },

        // 支线任务：赵满延的请求
        quest_zhao_manyan_request: {
            id: 'quest_zhao_manyan_request',
            name: '赵满延的请求',
            description: '赵满延说他丢了一件重要的东西，可能在雪峰山，帮他找回来。',
            giver: 'zhao_manyan',
            type: 'explore',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'snow_peak_mountain',
                    count: 3,
                    description: '在雪峰山探索 3 次'
                }
            ],
            rewards: {
                exp: 200,
                gold: 300,
                items: [
                    { itemId: 'health_potion', count: 5 },
                    { itemId: 'mana_potion', count: 5 }
                ],
                reputation: {}
            },
            prerequisites: ['quest_intro'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '兄弟，帮我个忙呗！我上次去雪峰山玩的时候丢了一件重要的东西，你能帮我找回来吗？',
            dialogueInProgress: '找到了吗？那东西对我很重要的！',
            dialogueComplete: '太好了！终于找到了！兄弟你太够意思了！走，我请你喝酒！'
        },

        // 支线任务：张小侯的委托
        quest_zhang_xiaohou_favor: {
            id: 'quest_zhang_xiaohou_favor',
            name: '张小侯的委托',
            description: '张小侯说他有件事想请你帮忙，去和他聊聊吧。',
            giver: 'zhang_xiaohou',
            type: 'favor',
            objectives: [
                {
                    type: 'talk',
                    npcId: 'zhang_xiaohou',
                    count: 1,
                    description: '和张小侯对话'
                },
                {
                    type: 'collect',
                    itemId: 'magic_herb',
                    count: 3,
                    description: '帮张小侯采集 3 株魔法草药'
                }
            ],
            rewards: {
                exp: 150,
                gold: 50,
                items: [
                    { itemId: 'health_potion', count: 3 }
                ],
                reputation: {
                    tianlan_school: 5
                }
            },
            prerequisites: ['quest_intro'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '那个... 你能帮我个忙吗？我想采点草药给我奶奶，但是我不敢一个人去山里...',
            dialogueInProgress: '草药采得怎么样了？谢谢你啊，你真是个好人！',
            dialogueComplete: '太谢谢你了！你真是我最好的朋友！以后有什么事尽管找我！'
        },

        // 支线任务：书店的秘密
        quest_book_shop_secret: {
            id: 'quest_book_shop_secret',
            name: '书店的秘密',
            description: '陈老板说他知道一些关于穆氏家族的秘密，帮他收集 5 颗妖魔精核，他就告诉你。',
            giver: 'book_shop_owner',
            type: 'collect',
            objectives: [
                {
                    type: 'collect',
                    itemId: 'demon_core',
                    count: 5,
                    description: '收集 5 颗妖魔精核'
                }
            ],
            rewards: {
                exp: 300,
                gold: 200,
                items: [
                    { itemId: 'super_health_potion', count: 3 }
                ],
                reputation: {}
            },
            prerequisites: ['quest_collect_herbs'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '呵呵，年轻人，想知道一些穆氏家族的秘密吗？帮我收集 5 颗妖魔精核，我就告诉你一些有趣的事。',
            dialogueInProgress: '妖魔精核收集得怎么样了？这可是很稀有的材料哦。',
            dialogueComplete: '不错不错！既然你这么有诚意，那我就告诉你一个秘密... 穆宁雪那丫头，她的身世可不简单啊...'
        },

        // 支线任务：猎魔者公会的试炼
        quest_hunter_guild_trial: {
            id: 'quest_hunter_guild_trial',
            name: '猎魔者公会的试炼',
            description: '老李说如果你能证明自己的实力，就推荐你加入猎魔者公会。去雪峰山击败 5 只不同的妖魔。',
            giver: 'hunter_li',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'demon_wolf',
                    count: 1,
                    description: '击败 1 只幽狼兽'
                },
                {
                    type: 'kill',
                    enemyId: 'shadow_creature',
                    count: 1,
                    description: '击败 1 只暗影怪'
                },
                {
                    type: 'kill',
                    enemyId: 'stone_monster',
                    count: 1,
                    description: '击败 1 只石怪'
                },
                {
                    type: 'kill',
                    enemyId: 'thunder_beast',
                    count: 1,
                    description: '击败 1 只雷兽'
                },
                {
                    type: 'kill',
                    enemyId: 'ice_toad',
                    count: 1,
                    description: '击败 1 只冰蟾'
                }
            ],
            rewards: {
                exp: 800,
                gold: 600,
                items: [
                    { itemId: 'super_health_potion', count: 5 },
                    { itemId: 'mana_potion', count: 5 },
                    { itemId: 'demon_core', count: 10 }
                ],
                reputation: {
                    hunter_guild: 25
                }
            },
            prerequisites: ['quest_hunt_thunder'],
            nextQuest: null,
            isMainQuest: false,
            dialogueStart: '小子，想加入猎魔者公会吗？那就证明你的实力！去雪峰山击败 5 种不同的妖魔，我就推荐你入会。',
            dialogueInProgress: '怎么样，猎魔的感觉如何？记住，猎魔不是儿戏，一定要小心谨慎。',
            dialogueComplete: '好小子！果然有两下子！从今天起，你就是猎魔者公会的一员了！'
        },
        
        // 猎魔者公会日常任务：清剿狼群
        quest_hunter_daily_wolf: {
            id: 'quest_hunter_daily_wolf',
            name: '日常任务：清剿狼群',
            description: '猎魔者公会的日常任务，清剿雪峰山附近的幽狼兽。',
            giver: 'hunter_receptionist',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'demon_wolf',
                    count: 3,
                    description: '击败 3 只幽狼兽'
                }
            ],
            rewards: {
                exp: 150,
                gold: 100,
                items: [
                    { itemId: 'health_potion', count: 2 }
                ],
                reputation: {
                    hunter_guild: 5
                }
            },
            prerequisites: ['quest_hunter_guild_trial'],
            nextQuest: null,
            isMainQuest: false,
            repeatable: true,
            dialogueStart: '这是今天的日常任务，去雪峰山清剿几只幽狼兽吧。',
            dialogueInProgress: '加油哦，注意安全！',
            dialogueComplete: '做得不错！这是你的奖励。'
        },
        
        // 猎魔者公会任务：精英狩猎
        quest_hunter_elite: {
            id: 'quest_hunter_elite',
            name: '精英任务：战将级妖魔',
            description: '雪峰山深处出现了战将级妖魔，公会需要高手去处理。',
            giver: 'hunter_receptionist',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'giant_eye_rat',
                    count: 1,
                    description: '击败 1 只巨眼猩鼠'
                }
            ],
            rewards: {
                exp: 500,
                gold: 300,
                items: [
                    { itemId: 'super_health_potion', count: 3 },
                    { itemId: 'demon_core', count: 5 }
                ],
                reputation: {
                    hunter_guild: 15
                }
            },
            prerequisites: ['quest_hunter_guild_trial'],
            nextQuest: null,
            isMainQuest: false,
            requiredLevel: 6,
            dialogueStart: '雪峰山深处出现了战将级妖魔，你敢去挑战吗？',
            dialogueInProgress: '战将级妖魔很危险，一定要小心！',
            dialogueComplete: '太厉害了！你居然能击败战将级妖魔！'
        },
        
        // 穆家任务：穆家的考验
        quest_mu_family_test: {
            id: 'quest_mu_family_test',
            name: '穆家的考验',
            description: '穆家想测试你的实力，如果你能通过考验，就能获得穆家的认可。',
            giver: 'mu_butler',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'ice_toad',
                    count: 3,
                    description: '击败 3 只冰蟾'
                }
            ],
            rewards: {
                exp: 300,
                gold: 200,
                items: [
                    { itemId: 'mana_potion', count: 3 }
                ],
                reputation: {
                    mu_family: 10
                }
            },
            prerequisites: [],
            nextQuest: 'quest_mu_family_elite',
            isMainQuest: false,
            requiredLevel: 5,
            dialogueStart: '穆家想邀请你参加一个小考验，通过的话就能获得穆家的认可。你愿意试试吗？',
            dialogueInProgress: '怎么样，考验还顺利吗？穆家从不亏待有实力的人。',
            dialogueComplete: '不错不错！你通过了考验。从今天起，你就是穆家的朋友了。'
        },
        
        // 穆家任务：穆家的委托
        quest_mu_family_elite: {
            id: 'quest_mu_family_elite',
            name: '穆家的委托',
            description: '穆家有一个重要的委托，需要高手去雪峰山深处处理一个麻烦的妖魔。',
            giver: 'mu_butler',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'bone_spike_zheng',
                    count: 1,
                    description: '击败 1 只骨刺狰'
                }
            ],
            rewards: {
                exp: 600,
                gold: 500,
                items: [
                    { itemId: 'ice_staff', count: 1 },
                    { itemId: 'super_health_potion', count: 5 }
                ],
                reputation: {
                    mu_family: 20
                }
            },
            prerequisites: ['quest_mu_family_test'],
            nextQuest: null,
            isMainQuest: false,
            requiredLevel: 8,
            dialogueStart: '穆家有一个重要委托，雪峰山深处出现了一只骨刺狰，很是麻烦。你能帮忙处理一下吗？',
            dialogueInProgress: '骨刺狰防御力极高，一定要小心！',
            dialogueComplete: '了不起！居然能击败骨刺狰！穆家欠你一个人情。'
        },
        
        // 魔法协会任务：协会的试炼
        quest_magic_association_trial: {
            id: 'quest_magic_association_trial',
            name: '魔法协会的试炼',
            description: '魔法协会的试炼，通过的话可以成为协会的外围成员。',
            giver: 'magic_association_chairman',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'thunder_beast',
                    count: 2,
                    description: '击败 2 只雷兽'
                },
                {
                    type: 'kill',
                    enemyId: 'stone_monster',
                    count: 2,
                    description: '击败 2 只石怪'
                }
            ],
            rewards: {
                exp: 400,
                gold: 300,
                items: [
                    { itemId: 'magic_ring', count: 1 }
                ],
                reputation: {
                    magic_association: 15
                }
            },
            prerequisites: [],
            nextQuest: 'quest_magic_association_elite',
            isMainQuest: false,
            requiredLevel: 6,
            dialogueStart: '年轻人，想加入魔法协会吗？先通过我的试炼吧。',
            dialogueInProgress: '试炼进行得如何？魔法协会只认可有实力的人。',
            dialogueComplete: '不错！你通过了试炼。从今天起，你就是魔法协会的外围成员了。'
        },
        
        // 魔法协会任务：协会的委托
        quest_magic_association_elite: {
            id: 'quest_magic_association_elite',
            name: '魔法协会的委托',
            description: '魔法协会有一个紧急委托，需要调查雪峰山的妖魔异动原因。',
            giver: 'magic_association_chairman',
            type: 'investigate',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'xuefeng_mountain_deep',
                    count: 3,
                    description: '深入雪峰山 3 次，调查妖魔异动'
                }
            ],
            rewards: {
                exp: 500,
                gold: 400,
                items: [
                    { itemId: 'super_mana_potion', count: 3 },
                    { itemId: 'demon_core', count: 5 }
                ],
                reputation: {
                    magic_association: 20,
                    hunter_guild: 10
                }
            },
            prerequisites: ['quest_magic_association_trial'],
            nextQuest: null,
            isMainQuest: false,
            requiredLevel: 8,
            dialogueStart: '最近雪峰山的妖魔异动很不正常，协会需要有人去深入调查一下。你愿意帮忙吗？',
            dialogueInProgress: '调查得怎么样了？一定要注意安全，事情可能不简单。',
            dialogueComplete: '辛苦了！这些情报很重要。魔法协会会记住你的贡献。'
        },
        
        // 主线任务：调查可疑人物
        quest_investigate_suspicious: {
            id: 'quest_investigate_suspicious',
            name: '调查可疑人物',
            description: '唐月老师说最近雪峰山附近出现了一些可疑人物，让你去调查一下。',
            giver: 'tang_yue',
            type: 'investigate',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'xuefeng_mountain',
                    count: 5,
                    description: '在雪峰山探索 5 次，寻找可疑人物的踪迹'
                }
            ],
            rewards: {
                exp: 300,
                gold: 150,
                items: [
                    { itemId: 'health_potion', count: 3 },
                    { itemId: 'mana_potion', count: 3 }
                ],
                reputation: {
                    tianlan_school: 10
                }
            },
            prerequisites: ['quest_collect_more_herbs'],
            nextQuest: 'quest_black_church_clues',
            isMainQuest: true,
            dialogueStart: '最近我收到一些报告，说雪峰山附近出现了一些穿着黑色长袍的可疑人物。你能帮我去调查一下吗？一定要小心。',
            dialogueInProgress: '调查得怎么样了？有没有发现什么可疑的情况？记住，安全第一。',
            dialogueComplete: '谢谢你的调查！这些信息很重要。我感觉事情可能比我们想象的更严重...'
        },
        
        // 主线任务：黑教廷的线索
        quest_black_church_clues: {
            id: 'quest_black_church_clues',
            name: '黑教廷的线索',
            description: '唐月老师怀疑那些可疑人物和黑教廷有关，让你收集更多相关的情报。',
            giver: 'tang_yue',
            type: 'investigate',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'black_church_acolyte',
                    count: 3,
                    description: '击败 3 名黑教廷教徒'
                }
            ],
            rewards: {
                exp: 500,
                gold: 250,
                items: [
                    { itemId: 'super_health_potion', count: 2 },
                    { itemId: 'mana_potion', count: 3 },
                    { itemId: 'demon_core', count: 3 }
                ],
                reputation: {
                    tianlan_school: 15,
                    magic_association: 10
                }
            },
            prerequisites: ['quest_investigate_suspicious'],
            nextQuest: 'quest_stop_ritual',
            isMainQuest: true,
            dialogueStart: '你的调查证实了我的猜测...那些人很可能是黑教廷的成员。黑教廷是一个非常危险的邪恶组织，你要小心。能帮我收集更多证据吗？',
            dialogueInProgress: '黑教廷的人很危险，你确定要和他们作对吗？记住，如果遇到危险，一定要先保证自己的安全。',
            dialogueComplete: '你做得很好！这些证据足以证明黑教廷确实在博城活动。我会向魔法协会报告这件事的。'
        },
        
        // 主线任务：阻止仪式
        quest_stop_ritual: {
            id: 'quest_stop_ritual',
            name: '阻止黑教廷仪式',
            description: '据情报显示，黑教廷正在雪峰山深处进行一个危险的仪式，必须阻止他们！',
            giver: 'tang_yue',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'black_church_deacon',
                    count: 1,
                    description: '击败黑教廷执事，阻止仪式'
                }
            ],
            rewards: {
                exp: 1000,
                gold: 500,
                items: [
                    { itemId: 'super_health_potion', count: 5 },
                    { itemId: 'mana_potion', count: 5 },
                    { itemId: 'demon_core', count: 10 },
                    { itemId: 'flame_staff', count: 1 }
                ],
                reputation: {
                    tianlan_school: 25,
                    magic_association: 20,
                    hunter_guild: 15
                }
            },
            prerequisites: ['quest_black_church_clues'],
            nextQuest: null,
            isMainQuest: true,
            dialogueStart: '不好了！根据最新的情报，黑教廷正在雪峰山深处进行一个召唤仪式！如果让他们成功，后果不堪设想！你能去阻止他们吗？一定要小心，那里会有黑教廷的执事级成员把守。',
            dialogueInProgress: '仪式还在进行吗？时间不多了，一定要尽快阻止他们！',
            dialogueComplete: '太好了！你成功阻止了他们！你救了很多人！不过...我担心这只是开始，黑教廷可能还有更大的阴谋...'
        },

        // 支线任务：图书馆义工
        quest_library_volunteer: {
            id: 'quest_library_volunteer',
            name: '图书馆义工',
            description: '图书馆管理员需要人帮忙整理书籍，作为回报会教你一些魔法知识。',
            giver: 'book_shop_owner',
            type: 'side',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'tianlan_school',
                    count: 3,
                    description: '在天澜魔法高中活动 3 次'
                }
            ],
            rewards: {
                exp: 150,
                gold: 50,
                items: [
                    { itemId: 'mana_potion', count: 2 }
                ],
                reputation: {
                    tianlan_school: 5
                }
            },
            prerequisites: ['quest_intro'],
            nextQuest: null,
            isMainQuest: false,
            autoStart: false,
            dialogueStart: '同学，能帮我整理一下书籍吗？作为回报，我可以让你免费看一些珍贵的魔法书籍。',
            dialogueInProgress: '整理得怎么样了？慢慢来，不着急。',
            dialogueComplete: '谢谢你的帮助！这些魔法知识送给你，希望对你有帮助。'
        },

        // 支线任务：收集魔石
        quest_collect_magic_stones: {
            id: 'quest_collect_magic_stones',
            name: '收集魔石',
            description: '魔法协会的研究员需要一些魔石来做研究，他们愿意高价收购。',
            giver: 'magic_association_chairman',
            type: 'collect',
            objectives: [
                {
                    type: 'collect',
                    itemId: 'magic_stone',
                    count: 5,
                    description: '收集 5 块魔石'
                }
            ],
            rewards: {
                exp: 200,
                gold: 150,
                items: [
                    { itemId: 'health_potion', count: 3 }
                ],
                reputation: {
                    magic_association: 10
                }
            },
            prerequisites: ['quest_intro'],
            nextQuest: null,
            isMainQuest: false,
            autoStart: false,
            dialogueStart: '你好，我是魔法协会的研究员。我正在做一项研究，需要一些魔石。你能帮我收集一些吗？',
            dialogueInProgress: '魔石收集得怎么样了？雪峰山的妖魔身上经常会有魔石。',
            dialogueComplete: '太好了！这些魔石正是我需要的！这是你的报酬，以后有需要可以再来找我。'
        },

        // 支线任务：猎魔新手
        quest_hunter_novice: {
            id: 'quest_hunter_novice',
            name: '猎魔新手',
            description: '猎魔者公会的前辈想考验一下你的实力，让你去猎杀几只低级妖魔。',
            giver: 'hunter_li',
            type: 'hunt',
            objectives: [
                {
                    type: 'kill',
                    enemyId: 'shadow_creature',
                    count: 3,
                    description: '击败 3 只暗影怪'
                }
            ],
            rewards: {
                exp: 250,
                gold: 120,
                items: [
                    { itemId: 'stamina_potion', count: 2 },
                    { itemId: 'hunter_knife', count: 1 }
                ],
                reputation: {
                    hunter_guild: 15
                }
            },
            prerequisites: ['quest_hunt_demon'],
            nextQuest: null,
            isMainQuest: false,
            autoStart: false,
            dialogueStart: '听说你已经猎杀过幽狼兽了？不错嘛。要不要接受猎魔者公会的正式考验？去击败几只暗影怪，证明你的实力。',
            dialogueInProgress: '暗影怪擅长偷袭，要小心它们的暗影魔法。',
            dialogueComplete: '干得漂亮！你已经具备了成为猎魔者的潜质。这把猎魔匕首送给你，以后可以来公会接更多任务。'
        },

        // 支线任务：装备准备
        quest_equipment_prep: {
            id: 'quest_equipment_prep',
            name: '装备准备',
            description: '唐月老师建议你去商店买一套基础装备，为后续的冒险做准备。',
            giver: 'tang_yue',
            type: 'side',
            objectives: [
                {
                    type: 'reach',
                    locationId: 'city_street',
                    count: 1,
                    description: '去博城市街的商店购买装备'
                }
            ],
            rewards: {
                exp: 100,
                gold: 80,
                items: [
                    { itemId: 'health_potion', count: 2 }
                ]
            },
            prerequisites: ['quest_intro'],
            nextQuest: null,
            isMainQuest: false,
            autoStart: false,
            dialogueStart: '冒险的时候装备很重要。我建议你去市里的魔法商店买一把法杖和一件法袍，这样能大大提升你的战斗力。',
            dialogueInProgress: '买到合适的装备了吗？如果钱不够，可以先做些任务攒钱。',
            dialogueComplete: '不错，有了这些装备，你的安全更有保障了。记住，装备只是辅助，自身的修炼才是根本。'
        }
    },

    // ========== 随机事件 ==========
    events: {
        // 修炼事件
        event_breakthrough: {
            id: 'event_breakthrough',
            name: '修炼突破',
            description: '修炼时忽然有所领悟',
            trigger: 'training',
            chance: 0.3,
            conditions: [
                { type: 'level', value: 1, operator: '>=' }
            ],
            once: false,
            choices: [
                {
                    text: '仔细感悟',
                    effects: {
                        exp: 50,
                        mp: -20
                    },
                    resultText: '你仔细感悟魔法的真谛，获得了大量经验！'
                },
                {
                    text: '先休息一下',
                    effects: {
                        hp: 20,
                        mp: 10
                    },
                    resultText: '你决定休息一下，恢复了一些体力。'
                }
            ]
        },

        event_training_fail: {
            id: 'event_training_fail',
            name: '修炼失败',
            description: '修炼时魔法失控了',
            trigger: 'training',
            chance: 0.2,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '强行稳住',
                    effects: {
                        hp: -20,
                        exp: 10
                    },
                    resultText: '你强行稳住了魔法，受了点伤，但也有所收获。'
                },
                {
                    text: '立刻停止',
                    effects: {
                        mp: -15
                    },
                    resultText: '你立刻停止了修炼，避免了受伤。'
                }
            ]
        },

        event_classmate_chat: {
            id: 'event_classmate_chat',
            name: '同学搭话',
            description: '旁边的同学主动和你聊天',
            trigger: 'training',
            chance: 0.2,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '愉快地交谈',
                    effects: {
                        exp: 5,
                        mp: 5
                    },
                    resultText: '你们聊得很开心，交流了一些修炼心得。'
                },
                {
                    text: '专心学习',
                    effects: {
                        exp: 10
                    },
                    resultText: '你婉拒了对方，继续专心学习。'
                }
            ]
        },

        // 学校事件：看到莫凡被批评
        event_mo_fan_scolded: {
            id: 'event_mo_fan_scolded',
            name: '莫凡被批评',
            description: '你看到薛老师正在批评莫凡',
            trigger: 'training',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '上去帮忙说话',
                    effects: {
                        exp: 8,
                        hp: -5
                    },
                    resultText: '你上去帮莫凡说了几句话，薛老师连你一起批评了一顿，不过莫凡感激地看了你一眼。（获得少量经验）'
                },
                {
                    text: '在旁边看热闹',
                    effects: {
                        exp: 5
                    },
                    resultText: '你在旁边看热闹，学到了一些不要做的事情。（获得少量经验）'
                },
                {
                    text: '假装没看见',
                    effects: {},
                    resultText: '你假装没看见，悄悄走开了。'
                }
            ]
        },

        // 学校事件：赵满延炫耀
        event_zhao_manyan_showoff: {
            id: 'event_zhao_manyan_showoff',
            name: '赵满延炫耀',
            description: '赵满延又在炫耀他的新装备',
            trigger: 'training',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '羡慕地看着',
                    effects: {
                        exp: 5,
                        mp: 5
                    },
                    resultText: '你羡慕地看着赵满延的新装备，他很开心，和你聊了几句修炼心得。（获得少量经验和MP）'
                },
                {
                    text: '不屑一顾',
                    effects: {
                        exp: 3
                    },
                    resultText: '你表现得不屑一顾，专心自己修炼。（获得少量经验）'
                },
                {
                    text: '问问价格',
                    effects: {
                        gold: -10
                    },
                    resultText: '你问了问价格，果然是你买不起的东西... 赵满延还非要请你喝饮料，你花了10金币意思一下。'
                }
            ]
        },

        // 学校事件：听到同学议论穆宁雪
        event_mu_ningxue_gossip: {
            id: 'event_mu_ningxue_gossip',
            name: '议论穆宁雪',
            description: '你听到几个同学在议论穆宁雪',
            trigger: 'training',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '凑过去听',
                    effects: {
                        exp: 3
                    },
                    resultText: '你凑过去听了听，都是些八卦传闻。好像被穆宁雪看到了，她冷冷地看了你一眼...'
                },
                {
                    text: '走开不听',
                    effects: {
                        exp: 5
                    },
                    resultText: '你觉得背后议论人不好，就走开专心学习了。（获得少量经验）'
                },
                {
                    text: '加入讨论',
                    effects: {
                        exp: 2,
                        hp: -10
                    },
                    resultText: '你加入了讨论，聊得很开心。不过你总觉得背后有点冷... 好像被冰系魔法瞄了一眼。（HP减少）'
                }
            ]
        },

        // 学校事件：张小侯找你
        event_zhang_xiaohou_find: {
            id: 'event_zhang_xiaohou_find',
            name: '张小侯找你',
            description: '张小侯兴冲冲地跑来找你',
            trigger: 'training',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '和他一起玩',
                    effects: {
                        exp: 3,
                        stamina: 5
                    },
                    resultText: '你和张小侯聊了一会儿，他给你讲了很多有趣的事情，心情变好了。（恢复少量体力）'
                },
                {
                    text: '婉拒，继续学习',
                    effects: {
                        exp: 8
                    },
                    resultText: '你婉拒了张小侯，继续专心学习。张小侯有点失望，但也理解。（获得经验）'
                }
            ]
        },

        // 学校事件：周敏问问题
        event_zhou_min_question: {
            id: 'event_zhou_min_question',
            name: '周敏问问题',
            description: '周敏过来问你一个修炼上的问题',
            trigger: 'training',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '认真解答',
                    effects: {
                        exp: 10,
                        mp: -5
                    },
                    resultText: '你认真地给周敏讲解了问题，在讲解的过程中你自己也有了新的理解。（获得经验）'
                },
                {
                    text: '说你也不会',
                    effects: {
                        exp: 2
                    },
                    resultText: '你说你也不太懂，周敏有点失望地走开了。'
                }
            ]
        },

        // 学校事件：许昭霆炫耀
        event_xu_zhaoting_showoff: {
            id: 'event_xu_zhaoting_showoff',
            name: '许昭霆炫耀',
            description: '许昭霆又在炫耀他的雷系魔法',
            trigger: 'training',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '夸他厉害',
                    effects: {
                        exp: 3
                    },
                    resultText: '你夸了许昭霆几句，他更得意了，给你演示了几个小技巧。（获得少量经验）'
                },
                {
                    text: '不以为然',
                    effects: {
                        exp: 5
                    },
                    resultText: '你表现得不以为然，许昭霆有些不服气，非要和你比试一下。你勉强应付了过去，也学到了点东西。（获得经验）'
                }
            ]
        },

        // 街市事件
        event_find_money: {
            id: 'event_find_money',
            name: '捡到钱',
            description: '你在地上捡到了一个钱包',
            trigger: 'exploring',
            chance: 0.15,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '据为己有',
                    effects: {
                        gold: 50
                    },
                    resultText: '你环顾四周，把钱装进了自己的口袋。（获得 50 金币）'
                },
                {
                    text: '交给警察',
                    effects: {
                        exp: 20
                    },
                    resultText: '你把钱包交给了警察，做了件好事。（获得 20 经验）'
                }
            ]
        },

        event_meet_stranger: {
            id: 'event_meet_stranger',
            name: '神秘商人',
            description: '一个神秘的商人向你兜售物品',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '买！100金币一个神秘盒子',
                    effects: {
                        gold: -100,
                        addItem: { itemId: 'super_health_potion', count: 2 }
                    },
                    resultText: '你打开盒子，里面是两瓶高级治愈药水！'
                },
                {
                    text: '不买，骗子',
                    effects: {},
                    resultText: '你觉得这是个骗子，转身离开了。'
                }
            ]
        },

        event_shop_discount: {
            id: 'event_shop_discount',
            name: '商店打折',
            description: '今天商店打折！',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '太好了，去买买买',
                    effects: {
                        gold: 20
                    },
                    resultText: '你发现商店真的在打折，还送了优惠券！（获得 20 金币）'
                }
            ]
        },

        // 街市事件：街头卖艺
        event_street_performer: {
            id: 'event_street_performer',
            name: '街头卖艺',
            description: '你看到一个法师在街头表演魔法',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '停下来观看',
                    effects: {
                        exp: 10,
                        gold: -5
                    },
                    resultText: '你停下来看了一会儿表演，学到了一些小技巧，还打赏了5金币。（获得经验，消耗5金币）'
                },
                {
                    text: '匆匆走过',
                    effects: {},
                    resultText: '你匆匆走过，没有停下脚步。'
                }
            ]
        },

        // 街市事件：遇到小偷
        event_pickpocket: {
            id: 'event_pickpocket',
            name: '遇到小偷',
            description: '你感觉有人在摸你的口袋！',
            trigger: 'exploring',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '立刻抓住他',
                    effects: {
                        hp: -10,
                        exp: 15
                    },
                    resultText: '你立刻抓住了小偷，和他扭打了几下，小偷跑掉了，但你保住了钱包。（HP减少，获得经验）'
                },
                {
                    text: '赶紧捂住口袋',
                    effects: {
                        gold: -10
                    },
                    resultText: '你赶紧捂住口袋，但还是被偷走了10金币。（损失10金币）'
                }
            ]
        },

        // 街市事件：喝醉的猎人
        event_drunk_hunter: {
            id: 'event_drunk_hunter',
            name: '喝醉的猎人',
            description: '一个喝醉的猎人在酒馆门口吹牛',
            trigger: 'exploring',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '听他讲故事',
                    effects: {
                        exp: 8,
                        stamina: -5
                    },
                    resultText: '你听猎人讲了很多猎魔的故事，虽然大部分是吹的，但也学到了一些东西。（获得经验，消耗体力）'
                },
                {
                    text: '请他喝一杯',
                    effects: {
                        gold: -20,
                        exp: 15
                    },
                    resultText: '你请猎人喝了一杯，他很高兴，给你讲了很多真正的猎魔技巧。（获得经验，消耗20金币）'
                },
                {
                    text: '走开',
                    effects: {},
                    resultText: '你觉得他在吹牛，就走开了。'
                }
            ]
        },

        // 雪峰山事件
        event_find_herb: {
            id: 'event_find_herb',
            name: '发现草药',
            description: '你发现了一些魔法草药',
            trigger: 'exploring',
            chance: 0.4,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '采集起来',
                    effects: {
                        addItem: { itemId: 'magic_herb', count: 2 }
                    },
                    resultText: '你采集了 2 株魔法草药。'
                }
            ]
        },

        event_find_rare_herb: {
            id: 'event_find_rare_herb',
            name: '稀有草药',
            description: '你发现了一株稀有的草药！',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '小心采集',
                    effects: {
                        addItem: { itemId: 'magic_herb', count: 5 },
                        exp: 30
                    },
                    resultText: '你小心翼翼地采集了这株稀有草药，还学到了不少知识。'
                }
            ]
        },

        event_find_treasure: {
            id: 'event_find_treasure',
            name: '发现宝箱',
            description: '你发现了一个破旧的宝箱',
            trigger: 'exploring',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '打开看看',
                    effects: {
                        gold: 80,
                        addItem: { itemId: 'health_potion', count: 2 }
                    },
                    resultText: '宝箱里有 80 金币和 2 瓶治愈药水！'
                },
                {
                    text: '小心有陷阱',
                    effects: {},
                    resultText: '你谨慎地离开了，什么都没发生。'
                }
            ]
        },

        event_trap: {
            id: 'event_trap',
            name: '陷阱',
            description: '你不小心踩到了陷阱！',
            trigger: 'exploring',
            chance: 0.15,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '强行挣脱',
                    effects: {
                        hp: -30
                    },
                    resultText: '你强行挣脱了陷阱，但受了不少伤。（-30 HP）'
                }
            ]
        },

        // 雪峰山事件：遇到猎魔者
        event_meet_hunter: {
            id: 'event_meet_hunter',
            name: '遇到猎魔者',
            description: '你遇到了一个正在休息的猎魔者',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '上去打招呼',
                    effects: {
                        exp: 15,
                        stamina: 10
                    },
                    resultText: '你上去和猎魔者打了个招呼，他给你分享了一些猎魔经验，还分给你一些食物。（获得经验，恢复体力）'
                },
                {
                    text: '悄悄走开',
                    effects: {},
                    resultText: '你不想打扰对方，悄悄走开了。'
                }
            ]
        },

        // 雪峰山事件：美丽的风景
        event_beautiful_view: {
            id: 'event_beautiful_view',
            name: '美丽的风景',
            description: '你发现了一处美丽的风景',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '停下来欣赏',
                    effects: {
                        stamina: 20,
                        mp: 10
                    },
                    resultText: '你停下来欣赏美丽的风景，心情变好了，精神也恢复了。（恢复体力和MP）'
                },
                {
                    text: '继续前进',
                    effects: {
                        exp: 5
                    },
                    resultText: '你看了一眼就继续前进了，不能因为风景耽误修炼。（获得少量经验）'
                }
            ]
        },

        // 雪峰山事件：突然下雨
        event_rain: {
            id: 'event_rain',
            name: '突然下雨',
            description: '天突然下起了大雨！',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '找地方躲雨',
                    effects: {
                        stamina: -10
                    },
                    resultText: '你找了个地方躲雨，等了好久雨才停。（消耗体力）'
                },
                {
                    text: '冒雨前进',
                    effects: {
                        hp: -15,
                        exp: 10
                    },
                    resultText: '你冒雨继续前进，虽然淋成了落汤鸡，但也锻炼了意志。（HP减少，获得经验）'
                }
            ]
        },

        // 图书馆事件：学到新知识
        event_library_learn: {
            id: 'event_library_learn',
            name: '学到新知识',
            description: '你在图书馆学到了很多新知识',
            trigger: 'exploring',
            chance: 0.3,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '继续深入学习',
                    effects: {
                        exp: 30,
                        mp: -15
                    },
                    resultText: '你继续深入学习，收获颇丰！（获得大量经验）'
                },
                {
                    text: '休息一下',
                    effects: {
                        exp: 15,
                        stamina: 10
                    },
                    resultText: '你休息了一下，整理学到的知识。（获得经验，恢复体力）'
                }
            ]
        },

        // 图书馆事件：领悟新技能
        event_library_skill: {
            id: 'event_library_skill',
            name: '领悟技能',
            description: '你在看书时忽然领悟了一个新技能！',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '仔细研究',
                    effects: {
                        exp: 20,
                        addItem: { itemId: 'magic_herb', count: 1 }
                    },
                    resultText: '你仔细研究了这个技能，虽然还没完全学会，但收获了不少。（获得经验和1株魔法草药）'
                }
            ]
        },

        // 图书馆事件：获得情报
        event_library_info: {
            id: 'event_library_info',
            name: '发现秘闻',
            description: '你在一本旧书里发现了一些有趣的秘闻',
            trigger: 'exploring',
            chance: 0.15,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '认真阅读',
                    effects: {
                        exp: 25
                    },
                    resultText: '你认真阅读了这些秘闻，学到了很多东西。（获得经验）'
                },
                {
                    text: '记下来以后再看',
                    effects: {
                        exp: 10
                    },
                    resultText: '你把这些内容记了下来，以后慢慢研究。（获得少量经验）'
                }
            ]
        },

        // 图书馆事件：遇到同学
        event_library_meet: {
            id: 'event_library_meet',
            name: '遇到同学',
            description: '你在图书馆遇到了也来看书的同学',
            trigger: 'exploring',
            chance: 0.2,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '一起学习',
                    effects: {
                        exp: 20,
                        stamina: -5
                    },
                    resultText: '你和同学一起学习，互相交流了心得。（获得经验）'
                },
                {
                    text: '打个招呼就继续看自己的',
                    effects: {
                        exp: 10
                    },
                    resultText: '你打了个招呼就继续看自己的书了。（获得少量经验）'
                }
            ]
        },

        // 发现妖魔足迹
        event_find_demon_tracks: {
            id: 'event_find_demon_tracks',
            name: '发现妖魔足迹',
            description: '你在地上发现了一些奇怪的足迹',
            trigger: 'exploring',
            chance: 0.2,
            conditions: [
                { type: 'day', value: 10, operator: '>=' }
            ],
            once: false,
            choices: [
                {
                    text: '仔细观察',
                    effects: {
                        giveInfo: 'demon_clue_2'
                    },
                    resultText: '你仔细观察了这些足迹，发现妖魔的数量比以前多了很多，而且种类也更丰富了。这很不正常...（获得线索：妖魔足迹变多）'
                },
                {
                    text: '没什么大不了的',
                    effects: {},
                    resultText: '你觉得这没什么大不了的，继续前进。'
                }
            ]
        },

        // 发现受伤的猎人
        event_find_demon_clue: {
            id: 'event_find_demon_clue',
            name: '发现受伤的猎人',
            description: '你发现了一个受伤的猎人倒在地上',
            trigger: 'exploring',
            chance: 0.1,
            conditions: [
                { type: 'day', value: 15, operator: '>=' }
            ],
            once: false,
            choices: [
                {
                    text: '上前救助',
                    effects: {
                        hp: -10,
                        giveInfo: 'demon_clue_1'
                    },
                    resultText: '你上前救助了受伤的猎人。他告诉你，他在山脚附近遇到了幽狼兽，那东西以前不会离人类聚居地这么近。（获得线索：幽狼兽下山了）'
                },
                {
                    text: '绕开继续走',
                    effects: {},
                    resultText: '你选择绕开，继续前进。'
                }
            ]
        },
        
        // 莫凡家的秘密
        event_mo_fan_secret: {
            id: 'event_mo_fan_secret',
            name: '莫凡的秘密',
            description: '你在莫凡家偶然发现了一些有趣的事',
            trigger: 'visit',
            chance: 0.3,
            once: false,
            choices: [
                {
                    text: '假装没看见',
                    effects: {
                        npcOpinion: { npcId: 'mo_fan', value: 2 }
                    },
                    resultText: '你假装没看见，莫凡感激地看了你一眼。有些事情，还是不要戳破的好。'
                },
                {
                    text: '好奇地问问',
                    effects: {
                        npcOpinion: { npcId: 'mo_fan', value: -2 },
                        familiarity: 5
                    },
                    resultText: '你好奇地问了一下，莫凡支支吾吾地糊弄过去了。虽然他没说什么，但你感觉他藏着很多秘密。'
                }
            ]
        },
        
        // 穆氏家族的消息
        event_mu_family_news: {
            id: 'event_mu_family_news',
            name: '穆氏家族的消息',
            description: '你在穆家庄园听到了一些消息',
            trigger: 'visit',
            chance: 0.2,
            once: false,
            choices: [
                {
                    text: '仔细听听',
                    effects: {
                        giveInfo: 'mu_family_intro'
                    },
                    resultText: '你仔细听了听下人们的议论，了解到了一些关于穆氏家族的事情。穆家是博城的大家族，势力很大...（获得情报：穆氏家族介绍）'
                },
                {
                    text: '不感兴趣',
                    effects: {},
                    resultText: '你对这些家族事务不感兴趣，继续参观庄园。'
                }
            ]
        },
        
        // 遇到黑教廷教徒
        event_black_church_encounter: {
            id: 'event_black_church_encounter',
            name: '可疑的黑衣人',
            description: '你在山里遇到了几个穿着黑色长袍的可疑人物',
            trigger: 'exploring',
            chance: 0.15,
            conditions: [
                { type: 'minDay', value: 20 },
                { type: 'minLevel', value: 3 }
            ],
            once: false,
            choices: [
                {
                    text: '悄悄绕开',
                    effects: {
                        giveInfo: 'black_church_clue'
                    },
                    resultText: '你小心翼翼地绕开了他们。虽然没看清他们在做什么，但你感觉这些人很危险...（获得线索：可疑的黑衣人）'
                },
                {
                    text: '上前质问',
                    effects: {
                        startBattle: 'black_church_acolyte'
                    },
                    resultText: '你上前质问他们是谁。那些人转过头来，眼睛里闪烁着诡异的光芒...'
                }
            ]
        },
        
        // 发现黑教廷仪式
        event_black_church_ritual: {
            id: 'event_black_church_ritual',
            name: '神秘的仪式',
            description: '你发现了一个神秘的仪式现场',
            trigger: 'exploring',
            chance: 0.08,
            conditions: [
                { type: 'minDay', value: 30 },
                { type: 'minLevel', value: 5 }
            ],
            once: true,
            choices: [
                {
                    text: '偷偷观察',
                    effects: {
                        giveInfo: 'black_church_intel',
                        exp: 50
                    },
                    resultText: '你躲在暗处偷偷观察。那些黑衣人似乎在进行某种召唤仪式，嘴里念着诡异的咒语...你悄悄离开了，这个发现太重要了！（获得情报：黑教廷的阴谋，50经验）'
                },
                {
                    text: '冲出去阻止',
                    effects: {
                        startBattle: 'black_church_deacon',
                        giveInfo: 'black_church_intel'
                    },
                    resultText: '你勇敢地冲出去阻止他们！仪式被打断了，为首的黑衣人愤怒地向你攻来...'
                },
                {
                    text: '赶紧离开',
                    effects: {},
                    resultText: '你感觉这里太危险了，赶紧离开了现场。有些事情，还是不要掺和的好...'
                }
            ]
        },
        
        // 隐藏事件：神秘的宝箱
        event_mysterious_chest: {
            id: 'event_mysterious_chest',
            name: '神秘的宝箱',
            description: '你在一个隐蔽的角落发现了一个古老的宝箱',
            trigger: 'exploring',
            chance: 0.05,
            conditions: [
                { type: 'minLevel', value: 3 }
            ],
            once: true,
            choices: [
                {
                    text: '打开看看',
                    effects: {
                        gold: 200,
                        exp: 100,
                        giveItem: { itemId: 'demon_core', count: 5 }
                    },
                    resultText: '你小心翼翼地打开了宝箱。里面有一些金币、几颗妖魔精核，还有一本破旧的笔记。看来这是某个前辈法师留下的东西！（获得 200 金币，100 经验，5 颗妖魔精核）'
                },
                {
                    text: '可能有陷阱，别动',
                    effects: {},
                    resultText: '你觉得宝箱可能有陷阱，决定不动它。有时候，谨慎才是明智的选择。'
                }
            ]
        },
        
        // 隐藏事件：古老的石碑
        event_ancient_stele: {
            id: 'event_ancient_stele',
            name: '古老的石碑',
            description: '你发现了一块刻满神秘符文的古老石碑',
            trigger: 'exploring',
            chance: 0.03,
            conditions: [
                { type: 'minLevel', value: 5 }
            ],
            once: true,
            choices: [
                {
                    text: '仔细研究符文',
                    effects: {
                        exp: 150,
                        spirit: 2
                    },
                    resultText: '你仔细研究石碑上的符文，虽然大部分都看不懂，但你隐约感觉到了一些魔法的奥秘。你的精神力似乎提升了！（获得 150 经验，精神力 +2）'
                },
                {
                    text: '看不懂，走吧',
                    effects: {},
                    resultText: '这些符文太复杂了，你完全看不懂。也许以后有机会再来研究吧。'
                }
            ]
        },
        
        // 彩蛋：迷路的小猫
        event_lost_cat: {
            id: 'event_lost_cat',
            name: '迷路的小猫',
            description: '你遇到了一只迷路的小黑猫',
            trigger: 'exploring',
            chance: 0.08,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '喂它点吃的',
                    effects: {
                        gold: -10,
                        exp: 20
                    },
                    resultText: '你拿出一些食物喂小猫。它吃得很开心，吃完后蹭了蹭你的腿，然后跑走了。也许它会给你带来好运吧...（花费 10 金币，获得 20 经验）'
                },
                {
                    text: '摸摸它',
                    effects: {
                        exp: 10
                    },
                    resultText: '你蹲下来摸了摸小猫。它似乎很享受，发出了呼噜呼噜的声音。心情变好了呢！（获得 10 经验）'
                },
                {
                    text: '不理它',
                    effects: {},
                    resultText: '你没有理会小猫，继续前进。'
                }
            ]
        },
        
        // 彩蛋：神秘的流浪商人
        event_mysterious_merchant: {
            id: 'event_mysterious_merchant',
            name: '神秘的流浪商人',
            description: '你遇到了一个神秘的流浪商人，他卖的东西很特别',
            trigger: 'exploring',
            chance: 0.05,
            conditions: [
                { type: 'minLevel', value: 4 },
                { type: 'minGold', value: 100 }
            ],
            once: false,
            choices: [
                {
                    text: '买一瓶神秘药水（100金币）',
                    effects: {
                        gold: -100,
                        giveItem: { itemId: 'super_health_potion', count: 2 }
                    },
                    resultText: '你花100金币买了一瓶神秘药水。商人神神秘秘地说这是好东西... 嗯，好像就是高级药水？（获得 2 瓶高级药水）'
                },
                {
                    text: '买一块魔法石（200金币）',
                    effects: {
                        gold: -200,
                        giveItem: { itemId: 'magic_stone', count: 10 }
                    },
                    resultText: '你花200金币买了一块魔法石。商人说这是从很远的地方带来的... 看起来确实不错！（获得 10 块魔法石）'
                },
                {
                    text: '太贵了，不买',
                    effects: {},
                    resultText: '你觉得价格太贵了，决定不买。商人耸耸肩，消失在了迷雾中...'
                }
            ]
        },
        
        // 北门事件：城门消息
        event_gate_news: {
            id: 'event_gate_news',
            name: '城门消息',
            description: '你在城门听到了一些消息',
            trigger: 'exploring',
            chance: 0.5,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '仔细听听',
                    effects: {
                        giveInfo: 'demon_rumor_1'
                    },
                    resultText: '你听到守卫们在议论，说最近山里不太太平，有猎人看到了很多妖魔...（获得情报：山里最近不太平）'
                },
                {
                    text: '没兴趣，走开',
                    effects: {},
                    resultText: '你对这些消息没什么兴趣，走开了。'
                }
            ]
        },
        
        // 北门事件：守卫聊天
        event_guard_chat: {
            id: 'event_guard_chat',
            name: '守卫聊天',
            description: '守卫们正在聊天',
            trigger: 'exploring',
            chance: 0.4,
            conditions: [
                { type: 'minLevel', value: 4 }
            ],
            once: false,
            choices: [
                {
                    text: '上去搭话',
                    effects: {
                        exp: 10,
                        giveInfo: 'demon_rumor_2'
                    },
                    resultText: '你上去和守卫们搭话。他们告诉你最近药草涨价了，因为受伤的猎人越来越多...（获得 10 经验，获得情报：药草涨价）'
                },
                {
                    text: '远远看着',
                    effects: {},
                    resultText: '你远远地看着守卫们聊天，没有上前打扰。'
                }
            ]
        },
        
        // 北门事件：巡逻发现
        event_patrol_find: {
            id: 'event_patrol_find',
            name: '巡逻发现',
            description: '你在巡逻时发现了一些东西',
            trigger: 'exploring',
            chance: 0.3,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '捡起来看看',
                    effects: {
                        gold: 20,
                        giveItem: { itemId: 'health_potion', count: 1 }
                    },
                    resultText: '你在路边捡到了一个小袋子，里面有 20 金币和一瓶药水！（获得 20 金币，获得治愈药水 x1）'
                },
                {
                    text: '不捡，继续巡逻',
                    effects: {
                        exp: 5
                    },
                    resultText: '你没有捡，继续认真巡逻。守卫们对你的态度更好了。（获得 5 经验）'
                }
            ]
        },
        
        // 北门事件：巡逻遇袭
        event_patrol_attack: {
            id: 'event_patrol_attack',
            name: '巡逻遇袭',
            description: '你在巡逻时遇到了妖魔',
            trigger: 'exploring',
            chance: 0.2,
            conditions: [
                { type: 'minLevel', value: 5 }
            ],
            once: false,
            choices: [
                {
                    text: '迎战！',
                    effects: {
                        startBattle: 'demon_wolf'
                    },
                    resultText: '一只幽狼兽从草丛里扑了出来！你拔出武器，准备战斗！'
                },
                {
                    text: '快跑！',
                    effects: {
                        hp: -20,
                        stamina: -10
                    },
                    resultText: '你转身就跑，虽然被妖魔抓伤了，但好歹逃掉了。（损失 20 HP，损失 10 体力）'
                }
            ]
        },

        // 酒馆事件
        event_tavern_quest: {
            id: 'event_tavern_quest',
            name: '酒馆任务',
            description: '酒馆里有人在悬赏任务',
            trigger: 'exploring',
            chance: 0.3,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '接下任务',
                    effects: {
                        gold: 30,
                        exp: 20
                    },
                    resultText: '你接下了一个简单的任务，轻松完成了！（获得 30 金币，20 经验）'
                },
                {
                    text: '不感兴趣',
                    effects: {},
                    resultText: '你觉得任务太简单了，没兴趣。'
                }
            ]
        },

        event_drunk_fight: {
            id: 'event_drunk_fight',
            name: '醉汉挑事',
            description: '一个醉汉来找你麻烦',
            trigger: 'exploring',
            chance: 0.2,
            conditions: [],
            once: false,
            choices: [
                {
                    text: '教训他一顿',
                    effects: {
                        hp: -10,
                        gold: 20,
                        exp: 15
                    },
                    resultText: '你几下就把醉汉打倒了，还从他身上搜到了 20 金币。'
                },
                {
                    text: '躲开他',
                    effects: {},
                    resultText: '你不想惹麻烦，躲开了醉汉。'
                }
            ]
        }
    },

    // ========== 商店 ==========
    shops: {
        school_shop: {
            id: 'school_shop',
            name: '学校小卖部',
            factionId: 'tianlan_school',
            items: [
                { itemId: 'health_potion', price: 30, stock: -1 },
                { itemId: 'mana_potion', price: 40, stock: -1 },
                { itemId: 'stamina_potion', price: 35, stock: -1 },
                { itemId: 'magic_herb', price: 20, stock: 20 },
                { itemId: 'basic_staff', price: 120, stock: 5 },
                { itemId: 'basic_robe', price: 100, stock: 5 },
                { itemId: 'magic_ring', price: 180, stock: 3 }
            ]
        },

        magic_shop: {
            id: 'magic_shop',
            name: '魔法商店',
            factionId: 'magic_association',
            items: [
                { itemId: 'health_potion', price: 28, stock: -1 },
                { itemId: 'mana_potion', price: 38, stock: -1 },
                { itemId: 'stamina_potion', price: 32, stock: -1 },
                { itemId: 'super_health_potion', price: 100, stock: 10 },
                { itemId: 'super_mana_potion', price: 110, stock: 10 },
                { itemId: 'full_potion', price: 200, stock: 3 },
                { itemId: 'basic_staff', price: 110, stock: 10 },
                { itemId: 'flame_staff', price: 320, stock: 3 },
                { itemId: 'basic_robe', price: 90, stock: 10 },
                { itemId: 'leather_armor', price: 220, stock: 5 },
                { itemId: 'magic_ring', price: 160, stock: 5 },
                { itemId: 'speed_boots', price: 280, stock: 3 },
                { itemId: 'magic_stone', price: 25, stock: -1 },
                { itemId: 'demon_core', price: 60, stock: -1 }
            ]
        },
        
        hunter_shop: {
            id: 'hunter_shop',
            name: '猎魔者公会商店',
            factionId: 'hunter_guild',
            description: '猎魔者公会的专属商店，只有会员才能享受折扣',
            items: [
                { itemId: 'health_potion', price: 25, stock: -1 },
                { itemId: 'mana_potion', price: 35, stock: -1 },
                { itemId: 'super_health_potion', price: 90, stock: 15 },
                { itemId: 'super_mana_potion', price: 120, stock: 10 },
                { itemId: 'leather_armor', price: 200, stock: 8 },
                { itemId: 'speed_boots', price: 250, stock: 5 },
                { itemId: 'hunter_knife', price: 180, stock: 5 },
                { itemId: 'magic_stone', price: 22, stock: -1 },
                { itemId: 'demon_core', price: 55, stock: -1 }
            ]
        },
        
        mu_family_shop: {
            id: 'mu_family_shop',
            name: '穆家宝库',
            factionId: 'mu_family',
            description: '穆氏家族的宝库，只有获得穆家信任的人才能进入',
            items: [
                { itemId: 'super_health_potion', price: 80, stock: 20 },
                { itemId: 'super_mana_potion', price: 100, stock: 15 },
                { itemId: 'ice_staff', price: 500, stock: 2 },
                { itemId: 'ice_armor', price: 600, stock: 2 },
                { itemId: 'mu_family_ring', price: 800, stock: 1 },
                { itemId: 'magic_stone', price: 20, stock: -1 },
                { itemId: 'demon_core', price: 50, stock: -1 }
            ]
        }
    },

    // ========== 敌人/妖魔 ==========
    enemies: {
        one_eye_wolf: {
            id: 'one_eye_wolf',
            name: '独眼魔狼',
            title: '奴仆级妖魔',
            description: '栖息在离人类城市最近荒野区域的妖魔，只有一只眼睛，非常凶残。普通人无法对付，唯有魔法师才能与之战斗。',
            elements: ['dark'],
            level: 4,
            maxHp: 150,
            maxMp: 40,
            attack: 18,
            defense: 6,
            speed: 15,
            skills: ['basic_attack', 'dark_bolt'],
            spriteColor: '#553322',
            isEnemy: true,
            expReward: 100,
            goldReward: 50,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.8,
                    min: 1,
                    max: 2
                },
                {
                    itemId: 'wolf_fang',
                    chance: 0.6,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.4,
                    min: 1,
                    max: 1
                }
            ],
            locations: ['xuefeng_mountain', 'bo_city_outskirts']
        },

        demon_wolf: {
            id: 'demon_wolf',
            name: '幽狼兽',
            title: '奴仆级妖魔',
            description: '生活在雪峰山的低级妖魔，群居，速度很快。',
            elements: ['dark'],
            level: 3,
            maxHp: 120,
            maxMp: 30,
            attack: 15,
            defense: 5,
            speed: 14,
            skills: ['basic_attack', 'dark_bolt'],
            spriteColor: '#663399',
            isEnemy: true,
            expReward: 80,
            goldReward: 40,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.7,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.5,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_mountain']
        },

        shadow_creature: {
            id: 'shadow_creature',
            name: '暗影怪',
            title: '奴仆级妖魔',
            description: '隐藏在阴影中的妖魔，擅长偷袭。',
            elements: ['dark'],
            level: 2,
            maxHp: 80,
            maxMp: 40,
            attack: 12,
            defense: 3,
            speed: 16,
            skills: ['basic_attack', 'dark_bolt'],
            spriteColor: '#442266',
            isEnemy: true,
            expReward: 50,
            goldReward: 25,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.5,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.4,
                    min: 1,
                    max: 1
                }
            ],
            locations: ['xuefeng_mountain']
        },

        rock_monster: {
            id: 'rock_monster',
            name: '石怪',
            title: '奴仆级妖魔',
            description: '由岩石构成的妖魔，防御很高，但速度慢。',
            elements: ['earth'],
            level: 4,
            maxHp: 200,
            maxMp: 20,
            attack: 18,
            defense: 15,
            speed: 6,
            skills: ['basic_attack', 'earth_spike'],
            spriteColor: '#996633',
            isEnemy: true,
            expReward: 100,
            goldReward: 50,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.8,
                    min: 1,
                    max: 2
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.6,
                    min: 1,
                    max: 3
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 风系妖魔
        wind_bird: {
            id: 'wind_bird',
            name: '风翼鸟',
            title: '奴仆级妖魔',
            description: '体型巨大的鸟类妖魔，速度极快，擅长风系魔法。',
            elements: ['wind'],
            level: 2,
            maxHp: 70,
            maxMp: 50,
            attack: 10,
            defense: 3,
            speed: 18,
            skills: ['basic_attack', 'wind_blade'],
            spriteColor: '#88ccaa',
            isEnemy: true,
            expReward: 45,
            goldReward: 20,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.4,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.3,
                    min: 1,
                    max: 1
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 水系妖魔
        water_spider: {
            id: 'water_spider',
            name: '水蛛',
            title: '奴仆级妖魔',
            description: '生活在水边的蜘蛛形妖魔，能吐出水丝束缚敌人。',
            elements: ['water'],
            level: 3,
            maxHp: 90,
            maxMp: 60,
            attack: 12,
            defense: 5,
            speed: 10,
            skills: ['basic_attack', 'water_chain'],
            spriteColor: '#6699cc',
            isEnemy: true,
            expReward: 60,
            goldReward: 30,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.5,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.4,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 火系妖魔
        fire_rat: {
            id: 'fire_rat',
            name: '火鼠',
            title: '奴仆级妖魔',
            description: '体型如狗的鼠类妖魔，浑身燃烧着火焰，性格暴躁。',
            elements: ['fire'],
            level: 3,
            maxHp: 85,
            maxMp: 50,
            attack: 16,
            defense: 4,
            speed: 13,
            skills: ['basic_attack', 'fire_bolt'],
            spriteColor: '#ff6633',
            isEnemy: true,
            expReward: 65,
            goldReward: 35,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.6,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.4,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 土系妖魔（低等级，和石怪区分）
        gold_ant: {
            id: 'gold_ant',
            name: '金甲蚁',
            title: '奴仆级妖魔',
            description: '外壳如黄金般坚硬的蚁类妖魔，群居，数量多。',
            elements: ['earth'],
            level: 2,
            maxHp: 100,
            maxMp: 20,
            attack: 8,
            defense: 10,
            speed: 7,
            skills: ['basic_attack', 'earth_spike'],
            spriteColor: '#ccaa33',
            isEnemy: true,
            expReward: 40,
            goldReward: 25,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.3,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.5,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 光系妖魔
        light_moth: {
            id: 'light_moth',
            name: '光蛾',
            title: '奴仆级妖魔',
            description: '散发着耀眼光芒的飞蛾状妖魔，翅膀上的鳞粉有麻痹效果。',
            elements: ['light'],
            level: 2,
            maxHp: 60,
            maxMp: 70,
            attack: 9,
            defense: 2,
            speed: 15,
            skills: ['basic_attack', 'light_ray'],
            spriteColor: '#ffff99',
            isEnemy: true,
            expReward: 45,
            goldReward: 30,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.4,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.5,
                    min: 1,
                    max: 1
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 雷系妖魔
        thunder_beast: {
            id: 'thunder_beast',
            name: '雷兽',
            title: '奴仆级妖魔',
            description: '形似豹子的妖魔，浑身缠绕着雷电，攻击力极强。',
            elements: ['thunder'],
            level: 4,
            maxHp: 110,
            maxMp: 60,
            attack: 20,
            defense: 6,
            speed: 15,
            skills: ['basic_attack', 'thunder_bolt'],
            spriteColor: '#9966ff',
            isEnemy: true,
            expReward: 90,
            goldReward: 50,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.7,
                    min: 1,
                    max: 2
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.5,
                    min: 1,
                    max: 3
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 冰系妖魔
        ice_toad: {
            id: 'ice_toad',
            name: '冰蟾',
            title: '奴仆级妖魔',
            description: '生活在雪山深处的蟾蜍状妖魔，皮肤冰冷，能喷射寒冰。',
            elements: ['ice'],
            level: 3,
            maxHp: 110,
            maxMp: 50,
            attack: 11,
            defense: 8,
            speed: 7,
            skills: ['basic_attack', 'ice_spike'],
            spriteColor: '#99ddff',
            isEnemy: true,
            expReward: 55,
            goldReward: 30,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.5,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.4,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_mountain']
        },

        // 暗影蛇（暗影系，和幽狼兽、暗影怪区分）
        shadow_snake: {
            id: 'shadow_snake',
            name: '影蛇',
            title: '奴仆级妖魔',
            description: '隐藏在阴影中的蛇形妖魔，擅长偷袭，毒性很强。',
            elements: ['dark'],
            level: 3,
            maxHp: 75,
            maxMp: 45,
            attack: 14,
            defense: 4,
            speed: 16,
            skills: ['basic_attack', 'dark_bolt'],
            spriteColor: '#553377',
            isEnemy: true,
            expReward: 60,
            goldReward: 35,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.5,
                    min: 1,
                    max: 1
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.4,
                    min: 1,
                    max: 1
                }
            ],
            locations: ['xuefeng_mountain']
        },
        
        // 巨眼猩鼠（战将级妖魔）
        giant_eye_rat: {
            id: 'giant_eye_rat',
            name: '巨眼猩鼠',
            title: '战将级妖魔',
            description: '体型巨大的鼠类妖魔，拥有极强的夜视能力和感知力，速度极快，是非常危险的战将级妖魔。',
            elements: ['wind'],
            level: 7,
            maxHp: 400,
            maxMp: 100,
            attack: 35,
            defense: 15,
            speed: 22,
            skills: ['basic_attack', 'wind_blade', 'wind_speed'],
            spriteColor: '#aa6633',
            isEnemy: true,
            demonTier: 'warrior', // 战将级
            expReward: 300,
            goldReward: 150,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 1.0,
                    min: 2,
                    max: 4
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.8,
                    min: 2,
                    max: 5
                },
                {
                    itemId: 'super_health_potion',
                    chance: 0.3,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_deep']
        },
        
        // 骨刺狰（战将级妖魔）
        bone_spike_zheng: {
            id: 'bone_spike_zheng',
            name: '骨刺狰',
            title: '战将级妖魔',
            description: '浑身长满骨刺的狰类妖魔，防御极高，攻击力也很强，是雪峰山深处的可怕存在。',
            elements: ['earth'],
            level: 8,
            maxHp: 600,
            maxMp: 80,
            attack: 40,
            defense: 25,
            speed: 12,
            skills: ['basic_attack', 'earth_spike', 'earth_shield'],
            spriteColor: '#888888',
            isEnemy: true,
            demonTier: 'warrior', // 战将级
            expReward: 400,
            goldReward: 200,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 1.0,
                    min: 3,
                    max: 5
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.9,
                    min: 3,
                    max: 6
                },
                {
                    itemId: 'mana_potion',
                    chance: 0.4,
                    min: 1,
                    max: 3
                }
            ],
            locations: ['xuefeng_deep']
        },
        
        // ========== 人类敌人 ==========
        
        // 黑教廷低阶成员
        black_church_acolyte: {
            id: 'black_church_acolyte',
            name: '黑教廷教徒',
            title: '黑教廷低阶成员',
            description: '黑教廷的底层成员，穿着黑色长袍，实力一般，但行踪诡秘。',
            elements: ['dark'],
            level: 4,
            maxHp: 120,
            maxMp: 60,
            attack: 14,
            defense: 6,
            speed: 12,
            skills: ['basic_attack', 'dark_bolt'],
            spriteColor: '#330033',
            isEnemy: true,
            enemyType: 'human',
            faction: 'black_church',
            expReward: 80,
            goldReward: 50,
            dropItems: [
                {
                    itemId: 'magic_stone',
                    chance: 0.5,
                    min: 1,
                    max: 3
                },
                {
                    itemId: 'health_potion',
                    chance: 0.3,
                    min: 1,
                    max: 2
                }
            ],
            locations: ['xuefeng_mountain', 'xuefeng_deep']
        },
        
        // 黑教廷中阶成员
        black_church_deacon: {
            id: 'black_church_deacon',
            name: '黑教廷执事',
            title: '黑教廷中阶成员',
            description: '黑教廷的执事级成员，实力较强，精通暗影魔法，非常危险。',
            elements: ['dark', 'fire'],
            level: 7,
            maxHp: 250,
            maxMp: 150,
            attack: 28,
            defense: 12,
            speed: 16,
            skills: ['basic_attack', 'dark_bolt', 'fire_bolt'],
            spriteColor: '#440044',
            isEnemy: true,
            enemyType: 'human',
            faction: 'black_church',
            expReward: 200,
            goldReward: 150,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 0.3,
                    min: 1,
                    max: 2
                },
                {
                    itemId: 'magic_stone',
                    chance: 0.8,
                    min: 2,
                    max: 5
                },
                {
                    itemId: 'super_health_potion',
                    chance: 0.2,
                    min: 1,
                    max: 1
                }
            ],
            locations: ['xuefeng_deep']
        },
        
        // 黑教廷蓝衣执事（BOSS级）
        black_church_blue_deacon: {
            id: 'black_church_blue_deacon',
            name: '蓝衣执事',
            title: '黑教廷蓝衣执事',
            description: '黑教廷的蓝衣执事，实力强大，是博城灾难的幕后黑手之一。',
            elements: ['dark', 'ice'],
            level: 10,
            maxHp: 500,
            maxMp: 300,
            attack: 45,
            defense: 20,
            speed: 18,
            skills: ['basic_attack', 'dark_bolt', 'ice_spike', 'ice_shield'],
            spriteColor: '#000066',
            isEnemy: true,
            enemyType: 'human',
            faction: 'black_church',
            isBoss: true,
            expReward: 500,
            goldReward: 500,
            dropItems: [
                {
                    itemId: 'demon_core',
                    chance: 1.0,
                    min: 3,
                    max: 5
                },
                {
                    itemId: 'magic_stone',
                    chance: 1.0,
                    min: 5,
                    max: 10
                },
                {
                    itemId: 'super_health_potion',
                    chance: 0.8,
                    min: 2,
                    max: 3
                },
                {
                    itemId: 'mana_potion',
                    chance: 0.8,
                    min: 2,
                    max: 3
                }
            ],
            locations: [] // BOSS不随机出现，通过剧情触发
        }
    },

    // ========== 定时大事件 ==========
    scheduledEvents: [
        {
            id: 'event_entrance_exam',
            day: 7,
            name: '入学考核',
            description: '天澜魔法高中的入学考核，检验新生的魔法水平。',
            type: 'exam',
            conditions: {
                minLevel: 3
            },
            successRewards: {
                exp: 200,
                gold: 100,
                items: [{ itemId: 'basic_staff', count: 1 }]
            },
            failPenalty: {
                exp: -50,
                gold: -30
            },
            successText: '你顺利通过了入学考核！老师们对你的表现很满意。',
            failText: '你没能通过入学考核，需要更加努力修炼了。'
        },
        {
            id: 'event_midterm_exam',
            day: 15,
            name: '期中测试',
            description: '学期中的魔法测试，检验半学期的学习成果。',
            type: 'exam',
            conditions: {
                minLevel: 5
            },
            successRewards: {
                exp: 500,
                gold: 200,
                items: [{ itemId: 'flame_staff', count: 1 }]
            },
            failPenalty: {
                exp: -100,
                gold: -50
            },
            successText: '你在期中测试中取得了优异的成绩！获得了学校的奖励。',
            failText: '期中测试成绩不理想，你需要加倍努力了。'
        },
        {
            id: 'event_final_exam',
            day: 30,
            name: '期末考核',
            description: '学期末的最终考核，决定你能否升入更高年级。',
            type: 'exam',
            conditions: {
                minLevel: 8
            },
            successRewards: {
                exp: 1000,
                gold: 500,
                items: [
                    { itemId: 'super_health_potion', count: 5 },
                    { itemId: 'leather_armor', count: 1 }
                ]
            },
            failPenalty: {
                exp: -200,
                gold: -100
            },
            successText: '恭喜！你以优异的成绩通过了期末考核，成功升入高年级！',
            failText: '很遗憾，你没能通过期末考核，需要留级重修。'
        },
        {
            id: 'event_demon_warning',
            day: 45,
            name: '妖魔异动',
            description: '最近雪峰山的妖魔活动异常频繁，似乎有大事要发生...',
            type: 'story',
            conditions: {},
            successRewards: {
                exp: 100
            },
            failPenalty: {},
            successText: '你察觉到了异常，开始为即将到来的危机做准备。',
            failText: ''
        }
    ],

    // ========== 事件链 ==========
    eventChains: {
        // 妖魔异动事件链（博城灾难前奏）
        demon_unrest: {
            id: 'demon_unrest',
            name: '妖魔异动',
            description: '雪峰山的妖魔活动异常频繁，似乎有大事要发生...',
            type: 'main_story',
            startDay: 10,
            stages: {
                start: {
                    id: 'start',
                    name: '传闻阶段',
                    description: '零星的传闻开始在城市里流传',
                    triggerDay: 10,
                    onEnter: {
                        giveInfo: ['demon_rumor_1'],
                        message: '你听到了一些关于山里不太平的传闻...'
                    }
                },
                stage_clue: {
                    id: 'stage_clue',
                    name: '线索阶段',
                    description: '越来越多的线索表明事情不简单',
                    triggerDay: 20,
                    conditions: {
                        minInfoCount: 2
                    },
                    onEnter: {
                        giveInfo: ['demon_clue_1', 'demon_clue_2'],
                        message: '你收集到了足够的线索，意识到事情比想象的更严重...'
                    }
                },
                stage_intel: {
                    id: 'stage_intel',
                    name: '情报阶段',
                    description: '可靠来源的情报证实了危险',
                    triggerDay: 30,
                    conditions: {
                        minInfoCount: 5
                    },
                    onEnter: {
                        giveInfo: ['demon_intel_1', 'demon_intel_2'],
                        message: '你从多个渠道获得了可靠的情报，妖魔异动是真实的！'
                    }
                },
                stage_warning: {
                    id: 'stage_warning',
                    name: '预警阶段',
                    description: '官方发出了正式预警',
                    triggerDay: 40,
                    conditions: {},
                    onEnter: {
                        giveInfo: ['demon_warning_1'],
                        message: '学校贴出了正式的安全通知，警告学生不要深入山区。'
                    }
                },
                stage_outbreak: {
                    id: 'stage_outbreak',
                    name: '爆发阶段',
                    description: '灾难爆发了',
                    triggerDay: 50,
                    conditions: {},
                    onEnter: {
                        giveInfo: ['demon_warning_1'],
                        message: '大量妖魔从雪峰山涌出，博城陷入危机！警报声响彻整个城市...'
                    }
                },
                stage_chaos: {
                    id: 'stage_chaos',
                    name: '混乱阶段',
                    description: '城市陷入混乱',
                    triggerDay: 51,
                    conditions: {},
                    onEnter: {
                        message: '博城彻底陷入混乱，到处都是妖魔的嘶吼声和人们的尖叫声...'
                    }
                },
                stage_escape: {
                    id: 'stage_escape',
                    name: '逃亡阶段',
                    description: '开始逃亡',
                    triggerDay: 52,
                    conditions: {},
                    onEnter: {
                        message: '你随着人群开始逃亡，目的地是博城北门的安全区...'
                    }
                }
            },
            endings: {
                hero: {
                    id: 'hero',
                    name: '英雄结局',
                    description: '你在灾难中英勇战斗，保护了很多人，成为了博城的英雄',
                    conditions: {
                        minLevel: 12,
                        minInfoCount: 10,
                        hasItems: ['super_health_potion', 'mana_potion', 'demon_core'],
                        minReputation: { hunter_guild: 10 }
                    },
                    rewards: {
                        exp: 1000,
                        gold: 500,
                        reputation: {
                            tianlan_school: 30,
                            hunter_guild: 25,
                            magic_association: 20
                        },
                        items: [{ itemId: 'flame_staff', count: 1 }]
                    }
                },
                prepared: {
                    id: 'prepared',
                    name: '充分准备',
                    description: '你提前做好了充分准备，在灾难中保护了很多人',
                    conditions: {
                        minLevel: 10,
                        minInfoCount: 8,
                        hasItems: ['super_health_potion', 'mana_potion']
                    },
                    rewards: {
                        exp: 500,
                        gold: 300,
                        reputation: {
                            tianlan_school: 20,
                            hunter_guild: 15
                        }
                    }
                },
                survivor: {
                    id: 'survivor',
                    name: '幸存者',
                    description: '你成功从灾难中幸存下来，虽然受了点伤，但还活着',
                    conditions: {
                        minLevel: 8,
                        minInfoCount: 5
                    },
                    rewards: {
                        exp: 200,
                        gold: 100,
                        reputation: {
                            tianlan_school: 10
                        }
                    },
                    penalties: {
                        hp: -30
                    }
                },
                normal: {
                    id: 'normal',
                    name: '一般准备',
                    description: '你有所准备，但还不够充分',
                    conditions: {
                        minLevel: 7,
                        minInfoCount: 3
                    },
                    rewards: {
                        exp: 100,
                        gold: 50
                    },
                    penalties: {
                        hp: -50
                    }
                },
                unprepared: {
                    id: 'unprepared',
                    name: '艰难求生',
                    description: '你对即将到来的灾难毫无准备，在灾难中艰难求生',
                    conditions: {},
                    penalties: {
                        exp: -200,
                        hp: -80,
                        gold: -50
                    }
                },
                
                // 穆家庇护结局
                mu_family_shelter: {
                    id: 'mu_family_shelter',
                    name: '穆家庇护',
                    description: '你获得了穆家的信任，在灾难中得到了穆家的庇护',
                    conditions: {
                        minLevel: 8,
                        minReputation: { mu_family: 30 }
                    },
                    rewards: {
                        exp: 300,
                        gold: 200,
                        reputation: {
                            mu_family: 20
                        },
                        items: [{ itemId: 'ice_staff', count: 1 }]
                    }
                },
                
                // 魔法协会英雄结局
                magic_association_hero: {
                    id: 'magic_association_hero',
                    name: '魔法协会英雄',
                    description: '你在灾难中协助魔法协会，成为了协会认可的英雄',
                    conditions: {
                        minLevel: 11,
                        minInfoCount: 9,
                        minReputation: { magic_association: 20 }
                    },
                    rewards: {
                        exp: 800,
                        gold: 400,
                        reputation: {
                            magic_association: 30,
                            tianlan_school: 20
                        },
                        items: [{ itemId: 'magic_ring', count: 1 }]
                    }
                },
                
                // 黑教廷隐藏结局
                black_church_ally: {
                    id: 'black_church_ally',
                    name: '黑教廷盟友',
                    description: '你选择了与黑教廷合作，走上了一条不同的道路...',
                    conditions: {
                        minLevel: 9,
                        minReputation: { black_church: 20 },
                        hasFlag: 'mu_he_revealed'
                    },
                    rewards: {
                        exp: 600,
                        gold: 800,
                        reputation: {
                            black_church: 30
                        },
                        items: [{ itemId: 'dark_bolt', count: 1 }]
                    },
                    hidden: true
                }
            }
        }
    },
    
    // ========== 信息数据库 ==========
    infoDatabase: {
        // 分类：rumor（传闻）、clue（线索）、intel（情报）、warning（预警）
        categories: {
            rumor: { name: '传闻', color: '#aaaaaa', icon: '💬' },
            clue: { name: '线索', color: '#88ccff', icon: '🔍' },
            intel: { name: '情报', color: '#ffcc66', icon: '📋' },
            warning: { name: '预警', color: '#ff6666', icon: '⚠️' }
        },
        
        // 所有信息的详细内容
        infos: {
            // ========== 妖魔异动相关 ==========
            'demon_rumor_1': {
                id: 'demon_rumor_1',
                title: '山里最近不太平',
                content: '听说最近雪峰山那边不太太平，有猎人说看到了平时少见的妖魔。',
                category: 'rumor',
                source: '街谈巷议',
                credibility: 0.3,
                relatedEvent: 'event_demon_warning',
                unlockDay: 10
            },
            'demon_rumor_2': {
                id: 'demon_rumor_2',
                title: '药草涨价了',
                content: '最近治愈药水和药草的价格涨了不少，据说是因为进山采药的人变少了。',
                category: 'rumor',
                source: '小卖部老板',
                credibility: 0.5,
                relatedEvent: 'event_demon_warning',
                unlockDay: 15
            },
            'demon_rumor_3': {
                id: 'demon_rumor_3',
                title: '猎魔任务变多了',
                content: '酒馆里的猎魔任务最近多了不少，而且赏金也比以前高了。',
                category: 'rumor',
                source: '酒馆传闻',
                credibility: 0.4,
                relatedEvent: 'event_demon_warning',
                unlockDay: 20
            },
            
            'demon_clue_1': {
                id: 'demon_clue_1',
                title: '幽狼兽下山了',
                content: '有猎人在山脚附近发现了幽狼兽的足迹，这东西以前不会离人类聚居地这么近。',
                category: 'clue',
                source: '资深猎人',
                credibility: 0.6,
                relatedEvent: 'event_demon_warning',
                unlockDay: 20
            },
            'demon_clue_2': {
                id: 'demon_clue_2',
                title: '妖魔足迹变多',
                content: '你在雪峰山探索时发现，妖魔的足迹比以前多了很多，而且种类也更丰富了。',
                category: 'clue',
                source: '亲身发现',
                credibility: 0.8,
                relatedEvent: 'event_demon_warning',
                unlockDay: 15
            },
            
            'demon_intel_1': {
                id: 'demon_intel_1',
                title: '莫凡的担忧',
                content: '莫凡说他感觉最近山里的妖魔有点太活跃了，以前幽狼兽一般不会靠近山脚。',
                category: 'intel',
                source: '莫凡',
                credibility: 0.7,
                relatedEvent: 'event_demon_warning',
                unlockDay: 25
            },
            'demon_intel_2': {
                id: 'demon_intel_2',
                title: '唐月老师的提醒',
                content: '唐月老师提醒最近尽量不要往山里跑太深，说学校收到了一些关于妖魔异动的报告。',
                category: 'intel',
                source: '唐月老师',
                credibility: 0.9,
                relatedEvent: 'event_demon_warning',
                unlockDay: 30
            },
            
            'demon_warning_1': {
                id: 'demon_warning_1',
                title: '学校安全通知',
                content: '学校贴出了安全通知，要求学生近期不要擅自前往雪峰山深处，注意安全。',
                category: 'warning',
                source: '学校公告',
                credibility: 1.0,
                relatedEvent: 'event_demon_warning',
                unlockDay: 35
            },
            
            // ========== NPC 相关信息 ==========
            'mu_ningxue_intro': {
                id: 'mu_ningxue_intro',
                title: '穆宁雪是谁',
                content: '穆氏家族的千金，冰系天赋极高，是天澜魔法高中的风云人物，性格高冷。',
                category: 'intel',
                source: '莫凡',
                credibility: 0.9,
                relatedEvent: null,
                unlockDay: 1
            },
            'mu_ningxue_past': {
                id: 'mu_ningxue_past',
                title: '莫凡和穆宁雪的过去',
                content: '莫凡和穆宁雪从小就认识，似乎有一些不为人知的往事。莫凡提到她时表情很复杂。',
                category: 'clue',
                source: '莫凡',
                credibility: 0.6,
                relatedEvent: null,
                unlockDay: 1
            },
            
            // ========== 学校相关信息 ==========
            'school_info_1': {
                id: 'school_info_1',
                title: '入学考核',
                content: '入学考核在第 7 天举行，需要达到 3 级才能通过。通过后会有奖励。',
                category: 'intel',
                source: '唐月老师',
                credibility: 1.0,
                relatedEvent: 'event_entrance_exam',
                unlockDay: 1
            },
            'school_info_2': {
                id: 'school_info_2',
                title: '期中测试',
                content: '期中测试在第 15 天举行，需要达到 5 级才能通过。奖励比入学考核更丰厚。',
                category: 'intel',
                source: '学校公告',
                credibility: 1.0,
                relatedEvent: 'event_midterm_exam',
                unlockDay: 8
            },
            'school_info_3': {
                id: 'school_info_3',
                title: '期末考核',
                content: '期末考核在第 30 天举行，需要达到 8 级才能通过。奖励非常丰厚。',
                category: 'intel',
                source: '学校公告',
                credibility: 1.0,
                relatedEvent: 'event_final_exam',
                unlockDay: 20
            },
            
            // ========== 黑教廷相关信息 ==========
            'black_church_rumor': {
                id: 'black_church_rumor',
                title: '黑教廷的传说',
                content: '据说有一个叫黑教廷的神秘组织，信奉黑暗，追求力量，专门做一些见不得光的事情。',
                category: 'rumor',
                source: '街头传闻',
                credibility: 0.2,
                relatedEvent: null,
                unlockDay: 1
            },
            'black_church_intel': {
                id: 'black_church_intel',
                title: '黑教廷的真相',
                content: '黑教廷是一个真实存在的邪恶组织，他们遍布各地，隐藏得很深。他们一直在暗中策划着什么阴谋。',
                category: 'intel',
                source: '神秘人',
                credibility: 0.8,
                relatedEvent: null,
                unlockDay: 20
            },
            'black_church_clue': {
                id: 'black_church_clue',
                title: '博城有黑教廷的人？',
                content: '有传言说，黑教廷的人已经渗透到博城了，就隐藏在我们身边。不知道是真是假。',
                category: 'clue',
                source: '神秘人',
                credibility: 0.5,
                relatedEvent: null,
                unlockDay: 30
            },
            'black_church_hierarchy': {
                id: 'black_church_hierarchy',
                title: '黑教廷的等级',
                content: '据说黑教廷有严格的等级制度，从低到高分为：教徒、执事、蓝衣执事、灰衣执事、黑衣执事... 每一级都有强大的实力。',
                category: 'intel',
                source: '古老的书籍',
                credibility: 0.7,
                relatedEvent: null,
                unlockDay: 25
            },
            'black_church_blue_deacon': {
                id: 'black_church_blue_deacon',
                title: '蓝衣执事',
                content: '蓝衣执事是黑教廷的中高层，每一个都有中阶以上的实力。他们通常负责具体的行动计划，非常危险。',
                category: 'intel',
                source: '魔法协会档案',
                credibility: 0.85,
                relatedEvent: null,
                unlockDay: 35
            },
            'black_church_ritual': {
                id: 'black_church_ritual',
                title: '黑教廷的召唤仪式',
                content: '黑教廷似乎在进行某种召唤仪式，他们想从另一个世界召唤强大的妖魔。如果让他们成功，后果不堪设想...',
                category: 'warning',
                source: '截获的情报',
                credibility: 0.9,
                relatedEvent: 'demon_unrest',
                unlockDay: 40
            },
            'mu_he_secret': {
                id: 'mu_he_secret',
                title: '穆贺的秘密',
                content: '穆家的执事穆贺，似乎不像表面看起来那么简单。有人说，他和黑教廷有着千丝万缕的联系... 这会是真的吗？',
                category: 'clue',
                source: '匿名举报',
                credibility: 0.6,
                relatedEvent: null,
                unlockDay: 35
            },
            'black_church_plan': {
                id: 'black_church_plan',
                title: '黑教廷的阴谋',
                content: '黑教廷在博城的目的是什么？他们为什么要召唤妖魔？有人说，他们想利用博城灾难来达到某种不可告人的目的...',
                category: 'warning',
                source: '推测',
                credibility: 0.75,
                relatedEvent: 'demon_unrest',
                unlockDay: 45
            },
            
            // ========== 穆氏家族相关信息 ==========
            'mu_family_intro': {
                id: 'mu_family_intro',
                title: '穆氏家族',
                content: '穆氏家族是博城的一大家族，势力很大，以冰系魔法闻名。家族中出过很多厉害的法师。',
                category: 'intel',
                source: '陈老板',
                credibility: 0.9,
                relatedEvent: null,
                unlockDay: 1
            },
            'mu_family_secret': {
                id: 'mu_family_secret',
                title: '穆家的祖传魂种',
                content: '据说穆家有一件祖传的冰系魂种，威力强大，是穆家的镇族之宝。',
                category: 'clue',
                source: '陈老板',
                credibility: 0.6,
                relatedEvent: null,
                unlockDay: 10
            },
            
            // ========== 猎魔者公会相关信息 ==========
            'hunter_guild_intro': {
                id: 'hunter_guild_intro',
                title: '猎魔者公会',
                content: '猎魔者公会是一个专门接猎魔任务的组织，会员都是经验丰富的猎人。完成任务可以获得赏金。',
                category: 'intel',
                source: '老李',
                credibility: 0.9,
                relatedEvent: null,
                unlockDay: 5
            },
            'hunter_guild_rumor': {
                id: 'hunter_guild_rumor',
                title: '猎人失踪了',
                content: '最近有好几个资深猎人进山之后就再也没出来过，公会那边封锁了消息，不知道发生了什么事。',
                category: 'rumor',
                source: '酒馆传闻',
                credibility: 0.4,
                relatedEvent: 'event_demon_warning',
                unlockDay: 25
            },
            
            // ========== 魔法协会相关信息 ==========
            'magic_association_intro': {
                id: 'magic_association_intro',
                title: '魔法协会',
                content: '魔法协会是管理法师的官方组织，负责考核、登记、发布任务等。加入魔法协会有很多福利。',
                category: 'intel',
                source: '周会长',
                credibility: 1.0,
                relatedEvent: null,
                unlockDay: 10
            },
            'magic_association_warning': {
                id: 'magic_association_warning',
                title: '魔法协会的警告',
                content: '魔法协会已经注意到了最近的妖魔异动，正在调查中。情况可能比我们想象的要严重。',
                category: 'warning',
                source: '周会长',
                credibility: 0.95,
                relatedEvent: 'event_demon_warning',
                unlockDay: 35
            },
            
            // ========== 更多 NPC 相关信息 ==========
            'mo_fan_intro': {
                id: 'mo_fan_intro',
                title: '莫凡是谁',
                content: '莫凡，天生双系（雷+火），虽然出身平凡，但实力进步神速，是学校里的一匹黑马。',
                category: 'intel',
                source: '张小侯',
                credibility: 0.9,
                relatedEvent: null,
                unlockDay: 1
            },
            'mo_fan_secret': {
                id: 'mo_fan_secret',
                title: '莫凡的秘密',
                content: '莫凡好像藏着很多秘密，他的实力进步速度快得不正常，没人知道他是怎么做到的。',
                category: 'clue',
                source: '赵满延',
                credibility: 0.7,
                relatedEvent: null,
                unlockDay: 10
            },
            'tang_yue_intro': {
                id: 'tang_yue_intro',
                title: '唐月老师是谁',
                content: '唐月，学校的实习老师，火系法师，温柔美丽，对学生很照顾。据说她的背景不简单。',
                category: 'intel',
                source: '学校传闻',
                credibility: 0.8,
                relatedEvent: null,
                unlockDay: 1
            },
            'zhao_manyan_intro': {
                id: 'zhao_manyan_intro',
                title: '赵满延是谁',
                content: '赵满延，赵氏家族的少爷，光系法师，家境富裕，性格开朗，有点小贪财，但很讲义气。',
                category: 'intel',
                source: '学校传闻',
                credibility: 0.85,
                relatedEvent: null,
                unlockDay: 5
            },
            'zhang_xiaohou_intro': {
                id: 'zhang_xiaohou_intro',
                title: '张小侯是谁',
                content: '张小侯，莫凡的死党，风系法师，性格胆小但非常忠诚，莫凡说什么他都信。',
                category: 'intel',
                source: '学校传闻',
                credibility: 0.9,
                relatedEvent: null,
                unlockDay: 3
            },
            
            // ========== 黑教廷相关信息 ==========
            'black_church_rumor': {
                id: 'black_church_rumor',
                title: '黑教廷的传闻',
                content: '据说有一个叫黑教廷的神秘组织，专门做一些邪恶的事情。不过没人知道他们是不是真的存在。',
                category: 'rumor',
                source: '街头传闻',
                credibility: 0.2,
                relatedEvent: null,
                unlockDay: 15
            },
            'black_church_clue': {
                id: 'black_church_clue',
                title: '可疑的黑衣人',
                content: '有人在雪峰山附近看到了一些穿着黑色长袍的可疑人物，他们好像在进行什么仪式。',
                category: 'clue',
                source: '神秘人',
                credibility: 0.5,
                relatedEvent: 'event_demon_warning',
                unlockDay: 25
            },
            'black_church_intel': {
                id: 'black_church_intel',
                title: '黑教廷的阴谋',
                content: '黑教廷似乎在策划什么阴谋，他们可能和最近的妖魔异动有关。有人说他们在召唤什么东西...',
                category: 'intel',
                source: '神秘人',
                credibility: 0.6,
                relatedEvent: 'event_demon_warning',
                unlockDay: 35
            },
            
            // ========== 穆氏家族相关信息 ==========
            'mu_family_intro': {
                id: 'mu_family_intro',
                title: '穆氏家族',
                content: '穆氏家族是博城的老牌家族，以冰系魔法闻名，传承了几百年，在博城势力很大。',
                category: 'intel',
                source: '穆家庄园',
                credibility: 0.9,
                relatedEvent: null,
                unlockDay: 10
            },
            'mu_family_secret': {
                id: 'mu_family_secret',
                title: '穆家的秘密',
                content: '据说穆家内部有些矛盾，旁支和主家之间关系不太好。还有人说穆家藏着什么秘密...',
                category: 'clue',
                source: '书店老板',
                credibility: 0.5,
                relatedEvent: null,
                unlockDay: 20
            },
            'mu_ningxue_past': {
                id: 'mu_ningxue_past',
                title: '穆宁雪的过去',
                content: '穆宁雪小时候好像发生过什么事，从那以后她的性格就变得很冷。具体是什么事，没人知道...',
                category: 'clue',
                source: '书店老板',
                credibility: 0.4,
                relatedEvent: null,
                unlockDay: 15
            }
        }
    },

    // ========== 势力 ==========
    factions: {
        tianlan_school: {
            id: 'tianlan_school',
            name: '天澜魔法高中',
            description: '博城最好的公立魔法高中，培养了无数优秀的法师。',
            color: '#66aaff',
            icon: '🏫',
            reputationEffects: {
                friendly: { shopDiscount: 0.95 },
                respected: { shopDiscount: 0.9 },
                worship: { shopDiscount: 0.8 }
            }
        },

        mu_family: {
            id: 'mu_family',
            name: '穆氏家族',
            description: '博城的名门望族，势力庞大，掌握着大量的资源。',
            color: '#aaccff',
            icon: '🏛️',
            reputationEffects: {
                friendly: { shopDiscount: 0.95 },
                respected: { shopDiscount: 0.85 },
                worship: { shopDiscount: 0.75 }
            }
        },

        hunter_guild: {
            id: 'hunter_guild',
            name: '猎魔者公会',
            description: '专门接取猎魔任务的组织，成员都是经验丰富的法师。',
            color: '#ffaa66',
            icon: '⚔️',
            reputationEffects: {
                friendly: { questRewardBonus: 1.1 },
                respected: { questRewardBonus: 1.2 },
                worship: { questRewardBonus: 1.3 }
            }
        },

        magic_association: {
            id: 'magic_association',
            name: '魔法协会',
            description: '官方的魔法管理机构，负责法师注册、考核和纠纷调解。',
            color: '#ffdd66',
            icon: '🏛️',
            reputationEffects: {
                friendly: { examBonus: 1.05 },
                respected: { examBonus: 1.1 },
                worship: { examBonus: 1.15 }
            }
        },

        black_church: {
            id: 'black_church',
            name: '黑教廷',
            description: '神秘的邪恶组织，行事诡秘，为世人所不容。',
            color: '#663366',
            icon: '☠️',
            reputationEffects: {
                friendly: { illegalAccess: true },
                respected: { illegalAccess: true, forbiddenSpells: true },
                worship: { illegalAccess: true, forbiddenSpells: true, black_market: true }
            }
        }
    }
};
