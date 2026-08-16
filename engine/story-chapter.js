/**
 * 故事章节系统
 * 管理章节进度、任务链、解锁内容、章节奖励
 * 数据驱动，后续拆小说只需在chapters.js中添加数据
 */

const StoryChapterSystem = {
    // 当前章节ID
    currentChapterId: null,
    // 已完成章节
    completedChapters: [],
    // 已解锁系统（用于教学提示）
    unlockedSystems: [],
    // 章节开始时的回调
    onChapterStart: null,
    // 章节完成时的回调
    onChapterComplete: null,

    /**
     * 初始化（从存档恢复）
     */
    init() {
        if (Player.chapterState) {
            this.currentChapterId = Player.chapterState.currentChapterId || null;
            this.completedChapters = Player.chapterState.completedChapters || [];
            this.unlockedSystems = Player.chapterState.unlockedSystems || [];
        }

        // 如果没有当前章节，开始第一章
        if (!this.currentChapterId) {
            this.startFirstChapter();
        }
    },

    /**
     * 保存状态
     */
    saveState() {
        Player.chapterState = {
            currentChapterId: this.currentChapterId,
            completedChapters: this.completedChapters,
            unlockedSystems: this.unlockedSystems
        };
    },

    /**
     * 获取所有章节数据
     */
    getAllChapters() {
        return DataChapters || {};
    },

    /**
     * 获取章节数据
     */
    getChapter(chapterId) {
        return (DataChapters || {})[chapterId] || null;
    },

    /**
     * 获取当前章节
     */
    getCurrentChapter() {
        return this.getChapter(this.currentChapterId);
    },

    /**
     * 开始第一章
     */
    startFirstChapter() {
        const chapters = this.getAllChapters();
        // 找到第一章（gameStart: true）
        for (const id in chapters) {
            if (chapters[id].startConditions && chapters[id].startConditions.gameStart) {
                this.startChapter(id);
                return;
            }
        }
        // 如果没有标记gameStart的，用第一个
        const firstId = Object.keys(chapters)[0];
        if (firstId) this.startChapter(firstId);
    },

    /**
     * 开始章节
     */
    startChapter(chapterId) {
        const chapter = this.getChapter(chapterId);
        if (!chapter) {
            console.error(`[章节] 章节不存在: ${chapterId}`);
            return false;
        }

        // 检查是否已完成
        if (this.completedChapters.includes(chapterId)) {
            console.warn(`[章节] 章节已完成: ${chapterId}`);
            return false;
        }

        this.currentChapterId = chapterId;

        // 解锁地点
        if (chapter.unlocks && chapter.unlocks.locations) {
            for (const locId of chapter.unlocks.locations) {
                if (!Player.unlockedLocations.includes(locId)) {
                    Player.unlockedLocations.push(locId);
                }
            }
        }

        // 解锁系统（教学提示）
        if (chapter.unlocks && chapter.unlocks.systems) {
            for (const sysId of chapter.unlocks.systems) {
                if (!this.unlockedSystems.includes(sysId)) {
                    this.unlockedSystems.push(sysId);
                    // 教学提示由UI处理
                }
            }
        }

        // v0.92.19: 不自动接取主线任务，改为提示玩家主动接取（增加自由度，避免节奏过快）
        if (chapter.mainQuestChain && chapter.mainQuestChain.length > 0) {
            for (const questId of chapter.mainQuestChain) {
                if (!Player.hasQuest(questId) && !Player.isQuestComplete(questId)) {
                    // 不自动接取，只在UI中提示
                    if (typeof UI !== 'undefined' && UI.showMessage) {
                        const questData = (typeof GameData !== 'undefined' && GameData.quests) ? GameData.quests[questId] : null;
                        const questName = questData ? questData.name : questId;
                        UI.showMessage(`【新章节】${chapter.name}\n\n新主线任务「${questName}」已解锁！点击底部「菜单」→「任务」查看并接取任务。`);
                    }
                    break; // 一次只提示第一个
                }
            }
        }

        this.saveState();

        // 触发章节开始回调
        if (this.onChapterStart) {
            this.onChapterStart(chapter);
        }

        console.log(`[章节] 开始: ${chapter.name}`);
        return true;
    },

    /**
     * 检查当前章节是否完成
     */
    checkCompletion() {
        const chapter = this.getCurrentChapter();
        if (!chapter) return false;

        if (!chapter.completeConditions) return false;

        const cond = chapter.completeConditions;
        let completed = true;

        // 检查任务完成
        if (cond.allQuestsCompleted) {
            for (const questId of cond.allQuestsCompleted) {
                if (!Player.isQuestComplete(questId)) {
                    completed = false;
                    break;
                }
            }
        }

        // 检查标记
        if (completed && cond.requiredFlags) {
            for (const flag of cond.requiredFlags) {
                if (!Player.flags[flag]) {
                    completed = false;
                    break;
                }
            }
        }

        // 检查等级
        if (completed && cond.minLevel) {
            if (Player.getPlayerLevel() < cond.minLevel) {
                completed = false;
            }
        }

        // 检查支线任务完成数
        if (completed && cond.minSideQuests) {
            const sideQuests = chapter.sideQuests || [];
            let completedSide = 0;
            for (const qid of sideQuests) {
                if (Player.isQuestComplete(qid)) completedSide++;
            }
            if (completedSide < cond.minSideQuests) {
                completed = false;
            }
        }

        if (completed) {
            this.completeCurrentChapter();
        }

        return completed;
    },

    /**
     * 完成当前章节
     */
    completeCurrentChapter() {
        const chapter = this.getCurrentChapter();
        if (!chapter) return;

        // 标记完成
        if (!this.completedChapters.includes(chapter.id)) {
            this.completedChapters.push(chapter.id);
        }

        // 发放章节奖励
        if (chapter.rewards) {
            this.applyRewards(chapter.rewards);
        }

        // 标记所有主线任务完成（如果还没标记的话）
        if (chapter.mainQuestChain) {
            for (const questId of chapter.mainQuestChain) {
                if (!Player.isQuestComplete(questId) && Player.hasQuest(questId)) {
                    // 任务可能已经完成但没标记，强制完成
                    Player.completeQuest(questId);
                }
            }
        }

        this.saveState();

        // 触发章节完成回调
        if (this.onChapterComplete) {
            this.onChapterComplete(chapter);
        }

        console.log(`[章节] 完成: ${chapter.name}`);

        // 延迟开始下一章
        if (chapter.nextChapter) {
            setTimeout(() => {
                this.startChapter(chapter.nextChapter);
            }, 500);
        }
    },

    /**
     * 应用章节奖励
     */
    applyRewards(rewards) {
        if (rewards.exp) {
            Player.gainExp(rewards.exp);
        }
        if (rewards.gold) {
            Player.gainGold(rewards.gold);
        }
        if (rewards.items) {
            for (const item of rewards.items) {
                Inventory.addItem(item.itemId, item.count || 1);
            }
        }
        if (rewards.reputation) {
            for (const [faction, value] of Object.entries(rewards.reputation)) {
                WorldState.changeReputation(faction, value);
            }
        }
    },

    /**
     * 获取当前章节主线任务进度
     */
    getMainQuestProgress() {
        const chapter = this.getCurrentChapter();
        if (!chapter || !chapter.mainQuestChain) return null;

        const quests = chapter.mainQuestChain.map(qid => {
            const quest = DataManager.getQuest(qid);
            const isComplete = Player.isQuestComplete(qid);
            const isActive = Player.hasQuest(qid);
            return {
                id: qid,
                name: quest ? quest.name : qid,
                description: quest ? quest.description : '',
                isComplete,
                isActive,
                isLocked: !isComplete && !isActive
            };
        });

        return quests;
    },

    /**
     * 获取章节进度百分比（0-100）
     */
    getProgressPercent() {
        const chapter = this.getCurrentChapter();
        if (!chapter) return 0;

        const total = this.completedChapters.length + 1;
        const allChapters = Object.keys(this.getAllChapters()).length;
        if (allChapters === 0) return 0;

        // 基于已完成章节数
        let percent = (this.completedChapters.length / allChapters) * 100;

        // 加上当前章节内任务进度
        const progress = this.getMainQuestProgress();
        if (progress && progress.length > 0) {
            const completedInChapter = progress.filter(q => q.isComplete).length;
            percent += (completedInChapter / progress.length) * (100 / allChapters);
        }

        return Math.min(100, Math.round(percent));
    },

    /**
     * 获取新解锁的系统（用于教学提示）
     */
    getNewlyUnlockedSystems() {
        return this.unlockedSystems.filter(sysId => {
            return !Player.flags['system_tutorial_' + sysId];
        });
    },

    /**
     * 标记系统教学已完成
     */
    markSystemTutorialDone(sysId) {
        Player.flags['system_tutorial_' + sysId] = true;
        this.saveState();
    },

    /**
     * 获取当前卷信息
     */
    getCurrentVolume() {
        const chapter = this.getCurrentChapter();
        if (!chapter) return null;
        return chapter.volume || null;
    },

    /**
     * 获取所有卷列表
     */
    getAllVolumes() {
        const volumes = {};
        const chapters = this.getAllChapters();
        for (const id in chapters) {
            const ch = chapters[id];
            const vol = ch.volume || 'unknown';
            if (!volumes[vol]) {
                volumes[vol] = {
                    id: vol,
                    name: ch.volumeName || vol,
                    chapters: []
                };
            }
            volumes[vol].chapters.push({
                id: ch.id,
                name: ch.name,
                completed: this.completedChapters.includes(ch.id),
                current: ch.id === this.currentChapterId
            });
        }
        return volumes;
    },

    /**
     * 检查是否可以开始某章节（用于调试/跳转）
     */
    canStartChapter(chapterId) {
        const chapter = this.getChapter(chapterId);
        if (!chapter) return false;
        if (this.completedChapters.includes(chapterId)) return false;

        const cond = chapter.startConditions;
        if (!cond) return true;
        if (cond.gameStart) return true;

        if (cond.previousChapterCompleted) {
            if (!this.completedChapters.includes(cond.previousChapterCompleted)) return false;
        }
        if (cond.requiredQuests) {
            for (const qid of cond.requiredQuests) {
                if (!Player.isQuestComplete(qid)) return false;
            }
        }
        if (cond.minLevel) {
            if (Player.getPlayerLevel() < cond.minLevel) return false;
        }

        return true;
    },

    /**
     * 定期检查（每次任务完成/升级/场景切换时调用）
     */
    update() {
        // 检查当前章节是否完成
        this.checkCompletion();

        // 检查是否有新的主线任务需要接取
        const chapter = this.getCurrentChapter();
        if (chapter && chapter.mainQuestChain) {
            for (const questId of chapter.mainQuestChain) {
                if (Player.isQuestComplete(questId)) continue;
                if (Player.hasQuest(questId)) break; // 已经有进行中的主线
                // 检查前置任务
                const quest = DataManager.getQuest(questId);
                if (quest && quest.prerequisites) {
                    const prereqsMet = quest.prerequisites.every(pid => Player.isQuestComplete(pid));
                    if (prereqsMet) {
                        Player.acceptQuest(questId);
                        break;
                    }
                } else {
                    Player.acceptQuest(questId);
                    break;
                }
            }
        }
    }
};
