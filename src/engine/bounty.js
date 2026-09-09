/**
 * v3.12.0: 猎魔悬赏系统核心逻辑
 * 悬赏接取、进度追踪、完成判定、奖励发放
 */

import { generateBounties, getBountyTemplate } from '../data/bounties.js';

export const BountySystem = {
    // 当前可用悬赏（每天刷新）
    availableBounties: [],
    // 已接取的悬赏 [{bountyId, progress, status, acceptDay}]
    activeBounties: [],
    // 上次刷新日期
    lastRefreshDay: 0,
    // 最大同时接取数
    MAX_ACTIVE_BOUNTIES: 3,

    /**
     * 初始化/刷新悬赏列表
     */
    refreshBounties() {
        if (Player.day !== this.lastRefreshDay) {
            this.availableBounties = generateBounties(Player.level);
            this.lastRefreshDay = Player.day;

            // 清理过期悬赏（超过3天未完成）
            this.activeBounties = this.activeBounties.filter(b => {
                return Player.day - b.acceptDay <= 3;
            });
        }
    },

    /**
     * 获取可用悬赏列表
     */
    getAvailableBounties() {
        this.refreshBounties();
        return this.availableBounties;
    },

    /**
     * 获取已接取悬赏列表
     */
    getActiveBounties() {
        this.refreshBounties();
        return this.activeBounties;
    },

    /**
     * 接取悬赏
     */
    acceptBounty(bountyId) {
        this.refreshBounties();

        // 检查是否已接取
        if (this.activeBounties.find(b => b.bountyId === bountyId)) {
            return { success: false, message: '已接取该悬赏' };
        }

        // 检查接取数量上限
        if (this.activeBounties.length >= this.MAX_ACTIVE_BOUNTIES) {
            return { success: false, message: `最多同时接取${this.MAX_ACTIVE_BOUNTIES}个悬赏` };
        }

        // 检查悬赏是否在可用列表中
        const template = getBountyTemplate(bountyId);
        if (!template) {
            return { success: false, message: '悬赏不存在' };
        }

        // 从可用列表移除
        this.availableBounties = this.availableBounties.filter(b => b.id !== bountyId);

        // 添加到已接取列表
        this.activeBounties.push({
            bountyId: bountyId,
            progress: 0,
            status: 'in_progress', // in_progress / can_claim / completed
            acceptDay: Player.day
        });

        return {
            success: true,
            message: `已接取悬赏：${template.name}`,
            bounty: template
        };
    },

    /**
     * 更新击杀进度（战斗结束时调用）
     */
    updateKillProgress(enemyId) {
        let updated = false;

        for (const bounty of this.activeBounties) {
            if (bounty.status !== 'in_progress') continue;

            const template = getBountyTemplate(bounty.bountyId);
            if (!template) continue;

            if (template.targetEnemy === enemyId) {
                bounty.progress++;
                updated = true;

                // 检查是否完成
                if (bounty.progress >= template.targetCount) {
                    bounty.status = 'can_claim';
                    UI.showMessage(`📜 悬赏完成：${template.name}！返回猎者联盟领取奖励`);
                }
            }
        }

        return updated;
    },

    /**
     * 领取悬赏奖励
     */
    claimReward(bountyId) {
        const bounty = this.activeBounties.find(b => b.bountyId === bountyId);
        if (!bounty) {
            return { success: false, message: '悬赏不存在' };
        }

        if (bounty.status !== 'can_claim') {
            return { success: false, message: '悬赏尚未完成' };
        }

        const template = getBountyTemplate(bountyId);
        if (!template) {
            return { success: false, message: '悬赏模板不存在' };
        }

        // 发放奖励
        Player.gold += template.reward.gold;
        Player.gainExp(template.reward.exp);

        // 声望
        if (template.reward.reputation) {
            Player.reputation = Player.reputation || {};
            Player.reputation.hunter_guild = (Player.reputation.hunter_guild || 0) + template.reward.reputation;
        }

        // 物品奖励
        const itemRewards = [];
        if (template.reward.items) {
            for (const item of template.reward.items) {
                Inventory.addItem(item.itemId, item.count);
                const itemData = Inventory.getItem(item.itemId);
                itemRewards.push(`${itemData?.name || item.itemId} x${item.count}`);
            }
        }

        // 标记为已完成并移除
        bounty.status = 'completed';
        this.activeBounties = this.activeBounties.filter(b => b.bountyId !== bountyId);

        return {
            success: true,
            message: `领取奖励：${template.name}`,
            gold: template.reward.gold,
            exp: template.reward.exp,
            reputation: template.reward.reputation,
            items: itemRewards,
            bountyName: template.name
        };
    },

    /**
     * 获取悬赏详情（含进度）
     */
    getBountyDetail(bountyId) {
        const template = getBountyTemplate(bountyId);
        if (!template) return null;

        const active = this.activeBounties.find(b => b.bountyId === bountyId);

        return {
            ...template,
            progress: active?.progress || 0,
            status: active?.status || 'available',
            isActive: !!active
        };
    },

    /**
     * 获取已接取悬赏数量
     */
    getActiveCount() {
        this.refreshBounties();
        return this.activeBounties.length;
    },

    /**
     * 检查是否有可领取的悬赏
     */
    hasClaimableBounty() {
        return this.activeBounties.some(b => b.status === 'can_claim');
    },

    /**
     * 获取存档数据
     */
    getSaveData() {
        return {
            availableBounties: this.availableBounties.map(b => b.id),
            activeBounties: this.activeBounties,
            lastRefreshDay: this.lastRefreshDay
        };
    },

    /**
     * 加载存档数据
     */
    loadSaveData(data) {
        if (!data) return;

        if (data.availableBounties) {
            this.availableBounties = data.availableBounties
                .map(id => getBountyTemplate(id))
                .filter(b => b !== undefined);
        }
        if (data.activeBounties) {
            this.activeBounties = data.activeBounties;
        }
        if (data.lastRefreshDay) {
            this.lastRefreshDay = data.lastRefreshDay;
        }
    }
};

// 向后兼容
if (typeof window !== 'undefined') window.BountySystem = BountySystem;
