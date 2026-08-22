/**
 * UI 商店界面模块
 * 
 * 从ui.js拆分出的独立商店界面渲染模块
 * 包含：商店界面（renderShopScreen）、商店界面更新（updateShopScreen）
 */

/**
 * 渲染商店界面
 * 绑定到UI对象调用：UIShop.renderShopScreen.call(UI)
 */
export function renderShopScreen() {
    const shop = ShopSystem.currentShop;
    const items = ShopSystem.getShopItems();
    
    this.elements.gameContainer.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #2a2a3a, #3a3a4a); position: relative;">
            
            <!-- 背景图片 -->
            <div style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: url('assets/images/backgrounds/bo_city_view.jpg') center/cover;
                opacity: 0.08;
                filter: blur(2px);
                z-index: -1;
                pointer-events: none;
            "></div>
            
            <!-- 顶部 -->
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                background: rgba(0, 0, 0, 0.5);
                border-bottom: 2px solid #665544;
                position: relative;
                z-index: 1;
            ">
                <h2 style="color: #ffd700; font-size: 26px;">🏪 ${shop?.name || '商店'}
                    ${ShopSystem.getDiscount() < 1.0 ? `<span style="font-size: 14px; color: #88ff88; margin-left: 10px;">（${WorldState.getReputationLevel(shop.factionId).name} ${Math.round(ShopSystem.getDiscount() * 100)}折）</span>` : ''}
                </h2>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <span style="color: #ffd700; font-size: 18px;">💰 ${Player.gold} 金币</span>
                    <div onclick="Game.closeShop()" style="
                        padding: 10px 20px;
                        background: #553333;
                        border: 1px solid #775555;
                        border-radius: 8px;
                        color: #ffcccc;
                        cursor: pointer;
                        font-size: 15px;
                        display: inline-block;
                    ">离开商店</div>
                </div>
            </div>
            
            <!-- 商品列表 -->
            <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                <h3 style="color: #ffd700; margin-bottom: 20px;">📦 商品列表</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                    ${items.map(item => {
                        const itemData = item.itemData;
                        if (!itemData) return '';
                        const ownedCount = Inventory.getTotalOwned(item.itemId);
                        return `
                            <div onclick="Game.buyItem('${item.itemId}')" style="
                                padding: 15px;
                                background: rgba(40, 40, 60, 0.8);
                                border: 2px solid #555577;
                                border-radius: 10px;
                                cursor: ${item.canAfford ? 'pointer' : 'not-allowed'};
                            ">
                                <div style="font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 5px;">
                                    ${itemData.icon || '📦'} ${itemData.name}
                                    <span style="float: right; font-size: 13px; color: #88ccff;">已拥有 ${ownedCount}</span>
                                </div>
                                <div style="font-size: 13px; color: #999; margin-bottom: 10px; min-height: 40px;">
                                    ${itemData.description}
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd700; font-size: 16px;">
                                        💰 ${item.actualPrice}
                                        ${item.hasDiscount ? `<span style="text-decoration: line-through; color: #888; font-size: 12px; margin-left: 5px;">${item.originalPrice}</span>` : ''}
                                    </span>
                                    <div onclick="${item.canAfford ? `event.stopPropagation(); Game.buyItem('${item.itemId}')` : ''}" 
                                            style="
                                                padding: 6px 15px;
                                                background: ${item.canAfford ? 'linear-gradient(135deg, #335533, #447744)' : '#444'};
                                                border: 1px solid ${item.canAfford ? '#559955' : '#555'};
                                                border-radius: 6px;
                                                color: ${item.canAfford ? '#ccffcc' : '#888'};
                                                cursor: ${item.canAfford ? 'pointer' : 'not-allowed'};
                                                font-size: 14px;
                                                display: inline-block;
                                            ">购买</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- 出售区域 -->
                <h3 style="color: #ffd700; margin: 40px 0 20px;">💰 出售物品</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${Inventory.getAllItems().map(item => {
                        const itemData = item.data;
                        if (!itemData || itemData.type === 'quest') return '';
                        const sellPrice = Math.floor(itemData.price * 0.5);
                        return `
                            <div style="
                                padding: 10px 15px;
                                background: rgba(60, 50, 40, 0.8);
                                border: 1px solid #776655;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <span>${itemData.icon || '📦'} ${itemData.name} x${item.count}</span>
                                <span style="color: #ffd700;">💰 ${sellPrice}</span>
                                <div onclick="Game.sellItem('${item.itemId}')" style="
                                    padding: 4px 10px;
                                    background: #554433;
                                    border: 1px solid #776655;
                                    border-radius: 5px;
                                    color: #ffddaa;
                                    cursor: pointer;
                                    font-size: 12px;
                                    display: inline-block;
                                ">出售</div>
                            </div>
                        `;
                    }).join('') || '<p style="color: #888;">背包里没有可出售的物品</p>'}
                </div>
            </div>
        </div>
    `;
}

/**
 * 更新商店界面
 * 绑定到UI对象调用：UIShop.updateShopScreen.call(UI)
 */
export function updateShopScreen() {
    this.renderShopScreen();
}

// 导出模块集合
export const UIShop = {
    renderShopScreen,
    updateShopScreen
};

export default UIShop;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIShop = UIShop;
}
