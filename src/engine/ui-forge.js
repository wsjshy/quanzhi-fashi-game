/**
 * v3.9.0: 锻造UI
 * 用妖魔材料+金币锻造装备
 */

import { ForgeSystem } from './forge.js';

export const UIForge = {
    selectedRecipe: null,
    forgeResult: null,

    /**
     * 渲染锻造界面
     */
    renderForgeScreen() {
        const recipes = ForgeSystem.getRecipes();
        const html = this._buildForgeHTML(recipes);
        const gc = document.getElementById('game-container');
        if (gc) gc.innerHTML = html;
    },

    /**
     * 构建锻造界面HTML
     */
    _buildForgeHTML(recipes) {
        const selected = this.selectedRecipe ? recipes.find(r => r.id === this.selectedRecipe) : recipes[0];

        const qualityNames = { normal: '普通', fine: '优秀', rare: '稀有', epic: '史诗' };
        const qualityColors = { normal: '#aaaaaa', fine: '#66ff66', rare: '#6699ff', epic: '#cc66ff' };

        return `
            <div id="forge-screen" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.9); z-index: 1000;
                display: flex; flex-direction: column;
                font-family: 'Microsoft YaHei', sans-serif;
            ">
                <!-- 标题栏 -->
                <div style="
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 15px 30px; background: rgba(30, 40, 50, 0.95);
                    border-bottom: 2px solid #446677;
                ">
                    <h2 style="color: #ffd700; margin: 0; font-size: 24px;">🔨 铁匠铺 - 魔具锻造</h2>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <span style="color: #ffd700; font-size: 16px;">💰 ${Player.gold}</span>
                        <div onclick="UIForge.closeForge()" style="
                            padding: 8px 20px; background: #553333; border: 1px solid #775555;
                            border-radius: 8px; color: #ffcccc; cursor: pointer; font-size: 14px;
                        ">关闭</div>
                    </div>
                </div>

                <!-- 主内容区 -->
                <div style="flex: 1; display: flex; overflow: hidden;">
                    <!-- 左侧：配方列表 -->
                    <div style="width: 300px; border-right: 2px solid #445566; overflow-y: auto; padding: 15px;">
                        <h3 style="color: #ffd700; margin-bottom: 15px;">锻造配方</h3>
                        ${recipes.map(recipe => {
                            const isSelected = selected && selected.id === recipe.id;
                            const canForge = ForgeSystem.canForge(recipe.id).success;
                            const item = Inventory.getItem(recipe.outputItem);
                            return `
                                <div onclick="UIForge.selectRecipe('${recipe.id}')" style="
                                    padding: 12px; margin-bottom: 8px;
                                    background: ${isSelected ? 'rgba(100, 150, 200, 0.3)' : 'rgba(40, 50, 60, 0.8)'};
                                    border: 2px solid ${isSelected ? '#6699cc' : '#556677'};
                                    border-radius: 8px; cursor: pointer;
                                    ${canForge ? '' : 'opacity: 0.6;'}
                                ">
                                    <div style="font-size: 14px; color: #fff; font-weight: bold;">
                                        ${item?.icon || '🔹'} ${recipe.outputName}
                                    </div>
                                    <div style="font-size: 11px; color: #8899aa; margin-top: 4px;">
                                        ${recipe.category} | Lv.${recipe.requireLevel} | 💰${recipe.goldCost}
                                    </div>
                                    <div style="font-size: 10px; color: ${canForge ? '#66ff88' : '#ff8866'}; margin-top: 4px;">
                                        ${canForge ? '✓ 可锻造' : '✗ 材料不足'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- 右侧：配方详情 -->
                    <div style="flex: 1; padding: 25px; overflow-y: auto;">
                        ${selected ? this.renderRecipeDetail(selected) : '<p style="color: #8899aa;">请选择一个配方</p>'}
                    </div>
                </div>

                <!-- 锻造结果弹窗 -->
                ${this.forgeResult ? this.renderForgeResult() : ''}
            </div>
        `;
        return html;
    },

    /**
     * 渲染配方详情
     */
    renderRecipeDetail(recipe) {
        const item = Inventory.getItem(recipe.outputItem);
        const check = ForgeSystem.canForge(recipe.id);
        const statNames = { attack: '攻击', defense: '防御', speed: '速度', maxHp: '生命', maxMp: '魔法', critRate: '暴击', hitRate: '命中' };

        return `
            <div style="max-width: 500px;">
                <!-- 装备预览 -->
                <div style="
                    padding: 20px; background: rgba(40, 50, 60, 0.8);
                    border: 2px solid #6699cc; border-radius: 10px; margin-bottom: 20px;
                ">
                    <h3 style="color: #6699ff; margin: 0 0 10px 0;">${item?.icon || '🔹'} ${recipe.outputName}</h3>
                    <p style="color: #aabbcc; font-size: 13px; margin: 0 0 10px 0;">${item?.description || ''}</p>
                    ${item?.equipStats ? `
                        <div style="font-size: 13px; color: #88ccaa;">
                            ${Object.entries(item.equipStats).map(([k, v]) => {
                                const displayVal = k === 'critRate' || k === 'hitRate' ? `${(v * 100).toFixed(0)}%` : `+${v}`;
                                return `${statNames[k] || k} ${displayVal}`;
                            }).join(' | ')}
                        </div>
                    ` : ''}
                </div>

                <!-- 所需材料 -->
                <h4 style="color: #ffd700; margin-bottom: 10px;">所需材料</h4>
                <div style="margin-bottom: 20px;">
                    ${recipe.materials.map(mat => {
                        const matItem = Inventory.getItem(mat.itemId);
                        const current = Inventory.getItemCount(mat.itemId);
                        const enough = current >= mat.count;
                        return `
                            <div style="
                                display: flex; justify-content: space-between; align-items: center;
                                padding: 8px 12px; background: rgba(40, 50, 60, 0.6);
                                border-radius: 6px; margin-bottom: 6px;
                            ">
                                <span style="color: #fff; font-size: 13px;">${matItem?.icon || '📦'} ${matItem?.name || mat.itemId}</span>
                                <span style="color: ${enough ? '#66ff88' : '#ff6666'}; font-size: 13px;">
                                    ${current} / ${mat.count}
                                </span>
                            </div>
                        `;
                    }).join('')}
                    <div style="
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 8px 12px; background: rgba(60, 50, 20, 0.6);
                        border-radius: 6px; margin-bottom: 6px;
                    ">
                        <span style="color: #ffd700; font-size: 13px;">💰 金币</span>
                        <span style="color: ${Player.gold >= recipe.goldCost ? '#66ff88' : '#ff6666'}; font-size: 13px;">
                            ${Player.gold} / ${recipe.goldCost}
                        </span>
                    </div>
                </div>

                <!-- 精魄注入 -->
                <h4 style="color: #ffd700; margin-bottom: 10px;">精魄注入（可选，提升高品质概率）</h4>
                <div style="margin-bottom: 20px;">
                    <div onclick="UIForge.selectSoulInject(null)" style="
                        padding: 8px 12px; margin-bottom: 6px;
                        background: ${ForgeSystem.selectedSoulInject === null ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                        border: 2px solid ${ForgeSystem.selectedSoulInject === null ? '#6699cc' : '#556677'};
                        border-radius: 6px; cursor: pointer; font-size: 13px; color: #fff;
                    ">
                        不注入（基础概率）
                    </div>
                    ${Object.entries(ForgeSystem.SOUL_INJECT_CONFIG).map(([key, config]) => {
                        const count = ForgeSystem.getSoulCount(key);
                        const selected = ForgeSystem.selectedSoulInject === key;
                        return `
                            <div onclick="${count > 0 ? `UIForge.selectSoulInject('${key}')` : ''}" style="
                                padding: 8px 12px; margin-bottom: 6px;
                                background: ${selected ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                                border: 2px solid ${selected ? '#6699cc' : '#556677'};
                                border-radius: 6px; cursor: ${count > 0 ? 'pointer' : 'not-allowed'};
                                font-size: 13px; color: ${count > 0 ? '#fff' : '#666'};
                                opacity: ${count > 0 ? 1 : 0.5};
                            ">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>${config.name}</span>
                                    <span style="color: #ffd700;">x${count}</span>
                                </div>
                                <div style="font-size: 11px; color: #8899aa; margin-top: 2px;">${config.effect}</div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- 当前品质概率 -->
                ${(() => {
                    const rates = ForgeSystem.getInjectedQualityRates(ForgeSystem.selectedSoulInject);
                    const colors = { normal: '#aaaaaa', fine: '#66ff66', rare: '#6699ff', epic: '#cc66ff' };
                    const names = { normal: '普通', fine: '优秀', rare: '稀有', epic: '史诗' };
                    return `
                        <div style="display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;">
                            ${Object.entries(rates).map(([q, r]) => `
                                <div style="padding: 6px 10px; background: ${colors[q]}22; border: 1px solid ${colors[q]}; border-radius: 6px; font-size: 12px; color: ${colors[q]};">
                                    ${names[q]} ${(r * 100).toFixed(0)}%
                                </div>
                            `).join('')}
                        </div>
                    `;
                })()}

                <!-- 锻造按钮 -->
                <div onclick="${check.success ? `UIForge.doForge('${recipe.id}')` : ''}" style="
                    padding: 15px; text-align: center;
                    background: ${check.success ? 'linear-gradient(135deg, #446644, #558855)' : '#333333'};
                    border: 2px solid ${check.success ? '#66aa66' : '#555555'};
                    border-radius: 10px; color: ${check.success ? '#aaffaa' : '#666666'};
                    cursor: ${check.success ? 'pointer' : 'not-allowed'};
                    font-size: 16px; font-weight: bold;
                ">
                    ${check.success ? '🔨 开始锻造' : check.reason}
                </div>
            </div>
        `;
    },

    /**
     * 渲染锻造结果
     */
    renderForgeResult() {
        const result = this.forgeResult;
        return `
            <div style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(20, 30, 40, 0.98); border: 3px solid ${result.qualityColor};
                border-radius: 15px; padding: 30px; z-index: 1100;
                box-shadow: 0 0 30px ${result.qualityColor}66;
                min-width: 350px; text-align: center;
            ">
                <h3 style="color: ${result.qualityColor}; margin: 0 0 15px 0; font-size: 22px;">
                    ✨ 锻造成功！
                </h3>
                <div style="font-size: 20px; color: #fff; margin-bottom: 10px;">
                    ${result.itemName}
                </div>
                <div style="
                    display: inline-block; padding: 4px 12px;
                    background: ${result.qualityColor}33; border: 1px solid ${result.qualityColor};
                    border-radius: 6px; color: ${result.qualityColor};
                    font-size: 14px; margin-bottom: 15px;
                ">
                    ${result.qualityName}
                </div>
                ${result.affixes && result.affixes.length > 0 ? `
                    <div style="text-align: left; margin-bottom: 15px;">
                        <div style="color: #8899aa; font-size: 12px; margin-bottom: 8px;">词缀：</div>
                        ${result.affixes.map(a => `
                            <div style="color: #aaddff; font-size: 13px; padding: 4px 0;">
                                ${a.name}：+${a.isPercent ? (a.value * 100).toFixed(0) + '%' : a.value}
                            </div>
                        `).join('')}
                    </div>
                ` : '<div style="color: #666; font-size: 12px; margin-bottom: 15px;">无词缀</div>'}
                <div onclick="UIForge.closeResult()" style="
                    padding: 10px 30px; background: #446644; border: 1px solid #66aa66;
                    border-radius: 8px; color: #aaffaa; cursor: pointer;
                    display: inline-block; font-size: 14px;
                ">
                    放入背包
                </div>
            </div>
        `;
    },

    /**
     * 选择配方
     */
    selectRecipe(recipeId) {
        this.selectedRecipe = recipeId;
        this.renderForgeScreen();
    },

    /**
     * 执行锻造
     */
    doForge(recipeId) {
        const result = ForgeSystem.forge(recipeId);
        if (result.success) {
            this.forgeResult = result;
            this.renderForgeScreen();
        } else {
            UI.showMessage(result.message);
        }
    },

    /**
     * 关闭结果
     */
    closeResult() {
        this.forgeResult = null;
        this.renderForgeScreen();
    },

    /**
     * 关闭锻造界面
     */
    closeForge() {
        this.selectedRecipe = null;
        this.forgeResult = null;
        Game.state = 'map';
        UI.renderMapScreen();
    },

    /**
     * 显示重铸确认弹窗
     */
    showReforgeConfirm(itemIndex) {
        const item = Inventory.items[itemIndex];
        if (!item) return;

        const itemData = Inventory.getItem(item.itemId);
        const check = ForgeSystem.canReforge(itemIndex);
        const qualityNames = { normal: '普通', fine: '优秀', rare: '稀有', epic: '史诗' };
        const qualityColors = { normal: '#aaaaaa', fine: '#66ff66', rare: '#6699ff', epic: '#cc66ff' };

        const overlay = document.createElement('div');
        overlay.id = 'reforge-confirm-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';

        overlay.innerHTML = `
            <div style="max-width:400px;width:100%;background:linear-gradient(135deg,#1a1a2a,#2a2a4a);border:2px solid #555588;border-radius:16px;padding:25px;">
                <h3 style="color:#ffd700;margin:0 0 15px 0;text-align:center;">🔨 装备重铸</h3>
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:18px;color:${qualityColors[item.quality || 'normal']};margin-bottom:5px;">
                        ${itemData?.icon || '🔹'} ${itemData?.name || item.itemId}
                    </div>
                    <div style="font-size:13px;color:#8899aa;">
                        当前品质：${qualityNames[item.quality || 'normal']}
                        ${item.affixes && item.affixes.length > 0 ? '（' + item.affixes.map(a => a.name).join('、') + '）' : '（无词缀）'}
                    </div>
                </div>
                <div style="background:rgba(40,50,60,0.6);border-radius:8px;padding:12px;margin-bottom:15px;">
                    <div style="font-size:13px;color:#aabbcc;margin-bottom:8px;">重铸规则：</div>
                    <div style="font-size:12px;color:#8899aa;line-height:1.6;">
                        • 70%概率保持当前品质<br>
                        • 25%概率提升一档品质<br>
                        • 5%概率提升两档品质<br>
                        • 词缀全部重新随机
                    </div>
                </div>
                <div style="font-size:14px;color:#ffd700;text-align:center;margin-bottom:15px;">
                    消耗：💰 ${check.cost || 0} 金币
                </div>
                <div style="display:flex;gap:10px;">
                    <div onclick="document.getElementById('reforge-confirm-overlay').remove()" style="
                        flex:1;padding:10px;text-align:center;background:#443333;border:1px solid #775555;
                        border-radius:8px;color:#ffaaaa;cursor:pointer;font-size:14px;">取消</div>
                    <div onclick="${check.success ? `UIForge.doReforge(${itemIndex})` : ''}" style="
                        flex:1;padding:10px;text-align:center;
                        background:${check.success ? 'linear-gradient(135deg,#446644,#558855)' : '#333333'};
                        border:2px solid ${check.success ? '#66aa66' : '#555555'};
                        border-radius:8px;color:${check.success ? '#aaffaa' : '#666666'};
                        cursor:${check.success ? 'pointer' : 'not-allowed'};font-size:14px;">
                        ${check.success ? '确认重铸' : check.reason}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    /**
     * 执行重铸
     */
    doReforge(itemIndex) {
        const result = ForgeSystem.reforge(itemIndex);
        if (result.success) {
            // 关闭确认弹窗
            const overlay = document.getElementById('reforge-confirm-overlay');
            if (overlay) overlay.remove();

            // 显示重铸结果
            this.forgeResult = result;
            this.reforgeMode = true;

            // 创建结果弹窗
            const resultOverlay = document.createElement('div');
            resultOverlay.id = 'reforge-result-overlay';
            resultOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';

            resultOverlay.innerHTML = `
                <div style="max-width:400px;width:100%;background:linear-gradient(135deg,#1a1a2a,#2a2a4a);border:3px solid ${result.qualityColor};border-radius:16px;padding:25px;text-align:center;box-shadow:0 0 30px ${result.qualityColor}66;">
                    <h3 style="color:${result.qualityColor};margin:0 0 15px 0;">✨ 重铸成功！</h3>
                    <div style="font-size:18px;color:#fff;margin-bottom:10px;">${result.itemName}</div>
                    <div style="font-size:14px;color:#8899aa;margin-bottom:10px;">
                        ${result.oldQualityName} → <span style="color:${result.qualityColor};">${result.qualityName}</span>
                        ${result.qualityUpgraded ? ' 🎉 品质提升！' : ''}
                    </div>
                    ${result.affixes && result.affixes.length > 0 ? `
                        <div style="text-align:left;margin-bottom:15px;">
                            <div style="color:#8899aa;font-size:12px;margin-bottom:8px;">新词缀：</div>
                            ${result.affixes.map(a => `
                                <div style="color:#aaddff;font-size:13px;padding:4px 0;">
                                    ${a.name}：+${a.isPercent ? (a.value * 100).toFixed(0) + '%' : a.value}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div style="color:#666;font-size:12px;margin-bottom:15px;">无词缀</div>'}
                    <div onclick="document.getElementById('reforge-result-overlay').remove(); UI.renderInventoryScreen();" style="
                        padding:10px 30px;background:#446644;border:1px solid #66aa66;border-radius:8px;
                        color:#aaffaa;cursor:pointer;display:inline-block;font-size:14px;">确定</div>
                </div>
            `;

            document.body.appendChild(resultOverlay);
        } else {
            UI.showMessage(result.message);
        }
    }
};


// 向后兼容：挂载到window
if (typeof window !== 'undefined') window.UIForge = UIForge;
