# 美术资源目录

> v3.3.0 美术资源管理体系
> 当前状态：P0基础体系完成 + P1核心资源完成（11系特效图+5张场景背景+3张核心NPC头像）

## 目录结构

```
assets/images/
├── backgrounds/     # 地点背景图（1920×1080 WebP/JPG）
├── battle-bg/       # 战斗场景背景（1792×1024 JPG）
├── characters/      # NPC头像/立绘（1024×1024 JPG）
├── sprites/         # 玩家/妖魔立绘
├── effects/         # 魔法特效图（1024×1024 JPG）
├── icons/           # 技能/物品/天赋图标
└── ui/              # UI装饰元素
```

## 使用方式

**不要直接硬编码图片路径！** 统一通过 `UIAssets` 模块获取：

```javascript
UIAssets.getMagicBackground('fire', 0.3)   // 魔法特效背景（图片+渐变兜底）
UIAssets.getMagicGradient('fire')           // 魔法渐变+图片
UIAssets.getLocationBackground('xuefeng')   // 地点背景（图片+渐变兜底）
UIAssets.getNpcAvatarPlaceholder(npc)       // NPC头像占位
```

## 资源进度

| 类别 | 总数 | 已生成 | 状态 |
|------|------|--------|------|
| 魔法特效 | 11 | 11 | 全部完成（P1） |
| 战斗/场景背景 | 5 | 5 | 全部完成（P1） |
| NPC头像 | 17 | 3 | 莫凡/穆宁雪/唐月（P1核心） |
| 地点背景 | 9 | 5 | 复用战斗背景（P1） |
| 技能图标 | 30 | 0 | 待AI生成（P2） |
| 物品图标 | 50 | 0 | 待AI生成（P2） |
| 妖魔立绘 | 10 | 0 | 待AI生成（P2） |

所有缺失资源当前均通过CSS渐变+emoji占位，不影响游戏运行。
