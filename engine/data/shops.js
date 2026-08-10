/**
 * 商店数据
 * 从 game-data.js 拆分而来
 */

const DataShops = {
  school_shop: {
    id: "school_shop",
    name: "学校小卖部",
    factionId: "tianlan_school",
    items: [
      {
        itemId: "health_potion",
        price: 30,
        stock: -1
      },
      {
        itemId: "mana_potion",
        price: 40,
        stock: -1
      },
      {
        itemId: "stamina_potion",
        price: 35,
        stock: -1
      },
      {
        itemId: "magic_herb",
        price: 20,
        stock: 20
      },
      {
        itemId: "basic_staff",
        price: 120,
        stock: 5
      },
      {
        itemId: "basic_robe",
        price: 100,
        stock: 5
      },
      {
        itemId: "magic_ring",
        price: 180,
        stock: 3
      }
    ]
  },
  magic_shop: {
    id: "magic_shop",
    name: "魔法商店",
    factionId: "magic_association",
    items: [
      {
        itemId: "health_potion",
        price: 28,
        stock: -1
      },
      {
        itemId: "mana_potion",
        price: 38,
        stock: -1
      },
      {
        itemId: "stamina_potion",
        price: 32,
        stock: -1
      },
      {
        itemId: "super_health_potion",
        price: 100,
        stock: 10
      },
      {
        itemId: "super_mana_potion",
        price: 110,
        stock: 10
      },
      {
        itemId: "full_potion",
        price: 200,
        stock: 3
      },
      {
        itemId: "basic_staff",
        price: 110,
        stock: 10
      },
      {
        itemId: "flame_staff",
        price: 320,
        stock: 3
      },
      {
        itemId: "basic_robe",
        price: 90,
        stock: 10
      },
      {
        itemId: "leather_armor",
        price: 220,
        stock: 5
      },
      {
        itemId: "magic_ring",
        price: 160,
        stock: 5
      },
      {
        itemId: "speed_boots",
        price: 280,
        stock: 3
      },
      {
        itemId: "magic_stone",
        price: 25,
        stock: -1
      },
      {
        itemId: "demon_core",
        price: 60,
        stock: -1
      }
    ]
  },
  hunter_shop: {
    id: "hunter_shop",
    name: "猎魔者公会商店",
    factionId: "hunter_guild",
    description: "猎魔者公会的专属商店，只有会员才能享受折扣",
    items: [
      {
        itemId: "health_potion",
        price: 25,
        stock: -1
      },
      {
        itemId: "mana_potion",
        price: 35,
        stock: -1
      },
      {
        itemId: "super_health_potion",
        price: 90,
        stock: 15
      },
      {
        itemId: "super_mana_potion",
        price: 120,
        stock: 10
      },
      {
        itemId: "leather_armor",
        price: 200,
        stock: 8
      },
      {
        itemId: "speed_boots",
        price: 250,
        stock: 5
      },
      {
        itemId: "hunter_knife",
        price: 180,
        stock: 5
      },
      {
        itemId: "magic_stone",
        price: 22,
        stock: -1
      },
      {
        itemId: "demon_core",
        price: 55,
        stock: -1
      }
    ]
  },
  mu_family_shop: {
    id: "mu_family_shop",
    name: "穆家宝库",
    factionId: "mu_family",
    description: "穆氏家族的宝库，只有获得穆家信任的人才能进入",
    items: [
      {
        itemId: "super_health_potion",
        price: 80,
        stock: 20
      },
      {
        itemId: "super_mana_potion",
        price: 100,
        stock: 15
      },
      {
        itemId: "ice_staff",
        price: 500,
        stock: 2
      },
      {
        itemId: "ice_armor",
        price: 600,
        stock: 2
      },
      {
        itemId: "mu_family_ring",
        price: 800,
        stock: 1
      },
      {
        itemId: "magic_stone",
        price: 20,
        stock: -1
      },
      {
        itemId: "demon_core",
        price: 50,
        stock: -1
      }
    ]
  }
};
