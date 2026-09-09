/**
 * v3.12.0: 悬赏板UI
 * 显示可用悬赏、已接取悬赏、进度和奖励
 */

export const UIBounty = {
    selectedBountyId: null,
    viewMode: 'available', // available / active

    /**
     * 渲染悬赏板界面
     */
    renderBountyScreen() {
        const container = document.getElementById('game-container');
        if (!container) return;

        BountySystem.refreshBounties();
        const available = BountySystem.getAvailableBounties();
        const active = BountySystem.getActiveBounties();
        const activeCount = BountySystem.getActiveCount();

        container.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: #ffd700; margin: 0;">📜 猎者联盟悬赏板</h2>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="color: #8899aa; font-size: 13px;">已接取：${activeCount}/3</span>
                        <div onclick="UIBounty.closeBounty()" style="padding: 8px 16px; background: #443333; border: 1px solid #775555; border-radius: 6px; color: #ffaaaa; cursor: pointer;">关闭</div>
                    </div>
                </div>

                <!-- 切换标签 -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <div onclick="UIBounty.switchView('available')" style="
                        padding: 8px 20px; border-radius: 6px; cursor: pointer;
                        background: ${this.viewMode === 'available' ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                        border: 2px solid ${this.viewMode === 'available' ? '#6699cc' : '#556677'};
                        color: #fff; font-size: 14px;
                    ">
                        可接悬赏 (${available.length})
                    </div>
                    <div onclick="UIBounty.switchView('active')" style="
                        padding: 8px 20px; border-radius: 6px; cursor: pointer;
                        background: ${this.viewMode === 'active' ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                        border: 2px solid ${this.viewMode === 'active' ? '#6699cc' : '#556677'};
                        color: #fff; font-size: 14px;
                    ">
                        进行中 (${active.length})
                        ${BountySystem.hasClaimableBounty() ? '<span style="color:#ff6666;"> ●</span>' : ''}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- 左侧：悬赏列表 -->
                    <div>
                        ${this.viewMode === 'available' ? this._renderAvailableList(available) : this._renderActiveList(active)}
                    </div>

                    <!-- 右侧：悬赏详情 -->
                    <div>
                        ${this._renderBountyDetail()}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染可接悬赏列表
     */
    _renderAvailableList(bounties) {
        if (bounties.length === 0) {
            return '<div style="color: #667788; text-align: center; padding: 40px;">暂无可接悬赏，明天再来看看</div>';
        }

        const levelColors = {
            servant: '#66ff66',
            warrior: '#6699ff',
            commander: '#cc66ff'
        };

        return bounties.map(b => {
            const selected = this.selectedBountyId === b.id;
            return `
                <div onclick="UIBounty.selectBounty('${b.id}')" style="
                    padding: 12px; margin-bottom: 10px;
                    background: ${selected ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                    border: 2px solid ${selected ? '#6699cc' : '#556677'};
                    border-radius: 8px; cursor: pointer;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #fff; font-size: 14px; font-weight: bold;">${b.name}</span>
                        <span style="font-size: 11px; color: ${levelColors[b.level]}; background: ${levelColors[b.level]}22; padding: 2px 8px; border-radius: 4px;">${b.levelName}</span>
                    </div>
                    <div style="font-size: 12px; color: #8899aa; margin-top: 4px;">
                        目标：${b.targetCount}只 · 奖励：${(b.reward.gold/10000).toFixed(1)}万金币
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * 渲染进行中悬赏列表
     */
    _renderActiveList(activeBounties) {
        if (activeBounties.length === 0) {
            return '<div style="color: #667788; text-align: center; padding: 40px;">暂无进行中的悬赏</div>';
        }

        return activeBounties.map(ab => {
            const template = getBountyTemplate(ab.bountyId);
            if (!template) return '';

            const selected = this.selectedBountyId === ab.bountyId;
            const progress = Math.min(ab.progress, template.targetCount);
            const progressPercent = (progress / template.targetCount) * 100;
            const canClaim = ab.status === 'can_claim';

            return `
                <div onclick="UIBounty.selectBounty('${ab.bountyId}')" style="
                    padding: 12px; margin-bottom: 10px;
                    background: ${selected ? 'rgba(100,150,200,0.3)' : 'rgba(40,50,60,0.6)'};
                    border: 2px solid ${canClaim ? '#ffd700' : (selected ? '#6699cc' : '#556677')};
                    border-radius: 8px; cursor: pointer;
                    ${canClaim ? 'box-shadow: 0 0 10px rgba(255,215,0,0.3);' : ''}
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #fff; font-size: 14px; font-weight: bold;">${template.name}</span>
                        ${canClaim ? '<span style="color:#ffd700; font-size:12px;">可领奖</span>' : ''}
                    </div>
                    <div style="margin-top: 8px;">
                        <div style="background: rgba(0,0,0,0.5); border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #4466aa, #6688cc); width: ${progressPercent}%;"></div>
                        </div>
                        <div style="font-size: 11px; color: #8899aa; margin-top: 4px;">进度：${progress}/${template.targetCount}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * 渲染悬赏详情
     */
    _renderBountyDetail() {
        if (!this.selectedBountyId) {
            return '<div style="color: #667788; text-align: center; padding: 60px;">选择一个悬赏查看详情</div>';
        }

        const detail = BountySystem.getBountyDetail(this.selectedBountyId);
        if (!detail) {
            return '<div style="color: #667788; text-align: center; padding: 60px;">悬赏不存在</div>';
        }

        const levelColors = {
            servant: '#66ff66',
            warrior: '#6699ff',
            commander: '#cc66ff'
        };

        const enemyData = typeof ENEMIES !== 'undefined' ? ENEMIES.find(e => e.id === detail.targetEnemy) : null;

        return `
            <div style="background: rgba(40,50,60,0.6); border: 1px solid #556677; border-radius: 10px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #fff; margin: 0;">${detail.name}</h3>
                    <span style="font-size: 12px; color: ${levelColors[detail.level]}; background: ${levelColors[detail.level]}22; padding: 4px 10px; border-radius: 4px;">${detail.levelName}</span>
                </div>

                <p style="color: #aabbcc; font-size: 13px; line-height: 1.6; margin-bottom: 15px;">${detail.description}</p>

                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                    <div style="color: #8899aa; font-size: 12px; margin-bottom: 8px;">任务目标</div>
                    <div style="color: #fff; font-size: 14px;">
                        击杀 ${enemyData?.name || detail.targetEnemy} x${detail.targetCount}
                    </div>
                    ${detail.isActive ? `
                        <div style="margin-top: 10px;">
                            <div style="background: rgba(0,0,0,0.5); border-radius: 4px; height: 10px; overflow: hidden;">
                                <div style="height: 100%; background: linear-gradient(90deg, #4466aa, #6688cc); width: ${(detail.progress/detail.targetCount)*100}%;"></div>
                            </div>
                            <div style="font-size: 12px; color: #8899aa; margin-top: 4px;">当前进度：${detail.progress}/${detail.targetCount}</div>
                        </div>
                    ` : ''}
                </div>

                <div style="background: rgba(60,50,20,0.4); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <div style="color: #ffd700; font-size: 12px; margin-bottom: 8px;">奖励</div>
                    <div style="color: #ffd700; font-size: 14px;">💰 ${detail.reward.gold.toLocaleString()} 金币</div>
                    <div style="color: #66ff88; font-size: 14px;">✨ ${detail.reward.exp} 经验</div>
                    <div style="color: #66aaff; font-size: 14px;">⭐ 猎者联盟声望 +${detail.reward.reputation}</div>
                    ${detail.reward.items ? detail.reward.items.map(item => {
                        const itemData = typeof ITEMS !== 'undefined' ? ITEMS.find(i => i.id === item.itemId) : null;
                        return `<div style="color: #aaddff; font-size: 13px;">📦 ${itemData?.name || item.itemId} x${item.count}</div>`;
                    }).join('') : ''}
                </div>

                ${detail.status === 'available' ? `
                    <div onclick="UIBounty.acceptBounty('${detail.id}')" style="
                        padding: 12px; text-align: center;
                        background: linear-gradient(135deg, #446644, #558855);
                        border: 2px solid #66aa66; border-radius: 8px;
                        color: #aaffaa; cursor: pointer; font-size: 15px; font-weight: bold;
                    ">
                        📜 接取悬赏
                    </div>
                ` : detail.status === 'can_claim' ? `
                    <div onclick="UIBounty.claimReward('${detail.id}')" style="
                        padding: 12px; text-align: center;
                        background: linear-gradient(135deg, #665522, #887733);
                        border: 2px solid #ffd700; border-radius: 8px;
                        color: #ffd700; cursor: pointer; font-size: 15px; font-weight: bold;
                        box-shadow: 0 0 15px rgba(255,215,0,0.3);
                    ">
                        🎁 领取奖励
                    </div>
                ` : `
                    <div style="
                        padding: 12px; text-align: center;
                        background: #333333; border: 2px solid #555555; border-radius: 8px;
                        color: #888888; font-size: 15px;
                    ">
                        进行中...（${detail.progress}/${detail.targetCount}）
                    </div>
                `}
            </div>
        `;
    },

    /**
     * 切换视图
     */
    switchView(mode) {
        this.viewMode = mode;
        this.selectedBountyId = null;
        this.renderBountyScreen();
    },

    /**
     * 选择悬赏
     */
    selectBounty(bountyId) {
        this.selectedBountyId = bountyId;
        this.renderBountyScreen();
    },

    /**
     * 接取悬赏
     */
    acceptBounty(bountyId) {
        const result = BountySystem.acceptBounty(bountyId);
        if (result.success) {
            UI.showMessage(result.message);
            this.viewMode = 'active';
            this.selectedBountyId = bountyId;
        } else {
            UI.showMessage(result.message);
        }
        this.renderBountyScreen();
    },

    /**
     * 领取奖励
     */
    claimReward(bountyId) {
        const result = BountySystem.claimReward(bountyId);
        if (result.success) {
            UI.showMessage(`🎁 ${result.message}！获得 ${result.gold}金币、${result.exp}经验`);
            this.selectedBountyId = null;
        } else {
            UI.showMessage(result.message);
        }
        this.renderBountyScreen();
    },

    /**
     * 关闭悬赏板
     */
    closeBounty() {
        Game.state = 'map';
        UI.renderMapScreen();
    }
};

// 向后兼容
if (typeof window !== 'undefined') window.UIBounty = UIBounty;
